# Job Tracker — Conception architecture hexagonale (double implémentation)

## 0. Stack technique

**Deux implémentations, un seul domaine.** Le projet expose la même logique métier via deux frameworks différents — c'est la meilleure preuve concrète de ce que promet l'architecture hexagonale.

| Domaine | Choix | Raison |
|---|---|---|
| Langage | TypeScript (partout) | Cohérence sur tout le monorepo |
| Monorepo | pnpm workspaces | Permet de partager `packages/core` et `packages/infrastructure` entre les deux apps sans dupliquer de code |
| **App 1 — Framework** | Next.js (App Router) | Décidé en amont du projet |
| **App 1 — UI** | React | Décidé en amont du projet |
| **App 1 — UI ↔ use cases** | Server Actions | Plus simple pour un projet solo (cf. section 6) |
| **App 2 — Backend** | NestJS | Refresh de compétence + contraste architectural intéressant (contrôleurs REST comme adapter piloté) |
| **App 2 — Frontend** | Angular (dernière version) | Refresh de compétence demandé |
| Tests / TDD — domaine et core | Vitest | Rapide, framework-agnostic |
| Tests / TDD — Next.js | Vitest | Standard actuel de l'écosystème Next.js/Vite |
| Tests / TDD — Angular | Vitest | **Angular a changé son défaut** : depuis Angular 21 (stable en Angular 22, juin 2026), Vitest remplace Karma/Jasmine comme testeur par défaut. Bonne nouvelle : toute ta stack tourne sur le même outil de test, sauf NestJS |
| Tests / TDD — NestJS | Jest | Reste l'outil idiomatique par défaut de NestJS — pas de raison de forcer Vitest ici, ça ne touche que la glue applicative, pas le domaine partagé |
| Persistance | MongoDB | Modèle document adapté à l'agrégat `Candidature` (cf. section 5), expérience déjà solide dessus, **partagé entre les deux apps** |
| Accès MongoDB | Driver natif (`mongodb`), pas d'ODM | Reste au plus près du hexagonal pur — le mapping domaine ↔ document se fait explicitement dans l'adapter, sans magie de schéma cachée par un ODM |
| Node.js | 20 LTS minimum recommandé | Cohérent avec les exigences actuelles de Next.js/NestJS/Vitest |

**Note sur le driver MongoDB natif** : sans ODM, c'est à l'adapter (`candidature-repository.mongodb.ts`) de faire la conversion explicite entre l'entité `Candidature` du domaine et le document MongoDB stocké. Un peu plus de code à écrire au début, mais aucune fuite d'un concept d'infrastructure vers le domaine — et comme cet adapter est partagé entre Next.js et NestJS, tu ne l'écris qu'une seule fois.

## 1. Contexte métier (bounded context)

Une seule responsabilité claire : suivre des candidatures d'emploi, de la découverte d'une offre jusqu'à l'issue finale (offre reçue, refus, abandon).

Hors scope volontaire pour le MVP : gestion multi-utilisateurs, authentification, notifications automatiques. On les ajoutera une fois le cœur solide.

---

## 2. Domain layer (le cœur, zéro dépendance externe)

### Entité racine : `Candidature`

```ts
type StatutCandidature =
  | "a_contacter"
  | "offre_ouverte"
  | "candidature_envoyee"
  | "relance_envoyee"
  | "entretien_rh"
  | "entretien_technique"
  | "offre_recue"
  | "refuse"
  | "en_pause"
  | "abandonne";

type Candidature = {
  id: CandidatureId; // value object, ex: UUID
  entreprise: NomEntreprise; // value object, non vide
  poste: string;
  statut: StatutCandidature;
  dateCandidature: Date | null;
  prochaineRelance: Date | null;
  lienOffre: string | null;
  notes: string;
  historique: ChangementStatut[]; // trace des transitions
};

type ChangementStatut = {
  statutPrecedent: StatutCandidature;
  nouveauStatut: StatutCandidature;
  date: Date;
};
```

### Règles métier à encoder dans l'entité (pas dans l'UI ni la base)

- Une candidature ne peut pas passer directement de `a_contacter` à `offre_recue` (transitions valides à définir — cf. tableau ci-dessous)
- `dateCandidature` ne peut pas être dans le futur
- `prochaineRelance` ne peut être définie que si le statut est `candidature_envoyee` ou `relance_envoyee`
- Changer le statut doit toujours ajouter une entrée à `historique`

### Transitions de statut valides (à valider avec toi, c'est un point de règle métier)

```
a_contacter        → offre_ouverte, candidature_envoyee, abandonne
offre_ouverte       → candidature_envoyee, abandonne
candidature_envoyee → relance_envoyee, entretien_rh, refuse, en_pause, abandonne
relance_envoyee     → entretien_rh, refuse, en_pause, abandonne
entretien_rh        → entretien_technique, refuse, en_pause
entretien_technique → offre_recue, refuse, en_pause
en_pause            → (retour à n'importe quel statut précédent)
offre_recue, refuse, abandonne → statuts terminaux, aucune transition
```

C'est le genre de règle qu'il vaut mieux figer avant de coder — dis-moi si cette logique te convient ou si tu veux l'ajuster.

---

## 3. Application layer (use cases — les "ports d'entrée" / driving ports)

Chaque use case = une classe/fonction avec une seule responsabilité, qui orchestre le domaine et appelle les ports de sortie.

```ts
interface CreerCandidatureUseCase {
  executer(commande: CreerCandidatureCommande): Promise<Candidature>;
}

interface ChangerStatutUseCase {
  executer(id: CandidatureId, nouveauStatut: StatutCandidature): Promise<Candidature>;
  // doit rejeter si la transition n'est pas valide (cf. règles ci-dessus)
}

interface ListerCandidaturesUseCase {
  executer(filtre?: FiltreCandidatures): Promise<Candidature[]>;
}

interface PlanifierRelanceUseCase {
  executer(id: CandidatureId, date: Date): Promise<Candidature>;
}

interface SupprimerCandidatureUseCase {
  executer(id: CandidatureId): Promise<void>;
}
```

---

## 4. Ports de sortie (driven ports — interfaces, pas d'implémentation ici)

```ts
interface CandidatureRepository {
  sauvegarder(candidature: Candidature): Promise<void>;
  trouverParId(id: CandidatureId): Promise<Candidature | null>;
  lister(filtre?: FiltreCandidatures): Promise<Candidature[]>;
  supprimer(id: CandidatureId): Promise<void>;
}

interface HorlogeService {
  maintenant(): Date;
  // abstraction indispensable pour tester les règles de dates sans dépendre de Date.now()
}
```

---

## 5. Adapters (infrastructure — à implémenter en dernier, et PARTAGÉS entre les deux apps)

| Port | Adapter MVP | Partagé ? |
|---|---|---|
| `CandidatureRepository` | Adapter en mémoire (tests) puis MongoDB | Oui — vit dans `packages/infrastructure`, utilisé tel quel par Next.js et NestJS |
| `HorlogeService` | Implémentation simple `() => new Date()` | Oui — même raisonnement |
| UI (driving adapter) App 1 | Server Actions Next.js | Non — spécifique à l'app Next.js |
| UI (driving adapter) App 2 | Contrôleurs REST NestJS | Non — spécifique à l'app NestJS, consommés ensuite par le frontend Angular via HTTP |

**Choix MongoDB** : l'entité `Candidature` est un agrégat avec un tableau `historique` imbriqué — structure naturellement adaptée au modèle document, sans jointure nécessaire. Ce choix reste un détail d'implémentation derrière le port `CandidatureRepository` : le changer plus tard n'impacterait ni le domaine ni les use cases, dans aucune des deux apps.

L'adapter en mémoire n'est pas un détail : c'est lui qui te permet de tester tous les use cases sans base de données, en TDD, dès le premier jour — et il ne sera écrit qu'une fois pour les deux implémentations.

**Différence de nature entre les deux driving adapters** : les Server Actions Next.js appellent directement un use case en mémoire serveur (même processus). Les contrôleurs NestJS exposent les use cases via HTTP, et c'est Angular qui les consomme comme un vrai client distant. C'est un bon sujet d'article à lui seul : deux façons différentes d'exposer la même application layer.

---

## 6. Structure de dossiers proposée (monorepo)

**Décision UI → use cases App 1 (Next.js) : Server Actions.** Plus simple à mettre en place pour un projet solo, pas de fichier `route.ts` nécessaire. Si un jour tu ouvres une API publique, tu ajouteras des Route Handlers à côté, sans toucher au domaine.

**Décision UI → use cases App 2 (NestJS + Angular) : contrôleurs REST.** Ici pas le choix — Angular est un client séparé, il doit forcément parler HTTP à NestJS.

Deux points de convention Next.js App Router à respecter (vérifiés sur la doc officielle, juin 2026) :
- `app/layout.tsx` est **obligatoire**, pas optionnel — c'est le layout racine, il doit contenir `<html>` et `<body>`
- Les dossiers non-routés à l'intérieur de `app/` (composants co-localisés) doivent être préfixés d'un underscore (`_components`) pour ne pas être interprétés comme des routes

```
job-tracker/
  pnpm-workspace.yaml
  package.json

  packages/
    core/                              # domaine + use cases - ZÉRO dépendance à un framework
      src/
        domain/
          candidature.ts               # entité + règles métier + transitions valides
          candidature.test.ts
          value-objects/
            candidature-id.ts
            nom-entreprise.ts
        application/
          use-cases/
            creer-candidature.ts
            creer-candidature.test.ts
            changer-statut.ts
            changer-statut.test.ts
            lister-candidatures.ts
            planifier-relance.ts
          ports/
            candidature-repository.ts
            horloge-service.ts
      package.json
      vitest.config.ts

    infrastructure/                     # adapters PARTAGÉS - dépend de core, pas des frameworks web
      src/
        repositories/
          candidature-repository.in-memory.ts
          candidature-repository.in-memory.test.ts
          candidature-repository.mongodb.ts   # plus tard
        services/
          horloge-service.impl.ts
      package.json
      vitest.config.ts

  apps/
    web-next/                           # App 1 : Next.js
      src/
        app/
          layout.tsx                    # obligatoire - layout racine
          page.tsx                      # page d'accueil
          candidatures/
            page.tsx                    # liste des candidatures
            actions.ts                  # Server Actions - appellent les use cases de packages/core
            [id]/
              page.tsx                  # détail d'une candidature
            _components/                # composants co-localisés, underscore = hors routing
              candidature-card.tsx
              statut-badge.tsx
      package.json

    api-nest/                           # App 2a : NestJS (backend)
      src/
        candidatures/
          candidatures.controller.ts    # adapter piloté - appelle les use cases de packages/core
          candidatures.controller.spec.ts
          candidatures.module.ts
        main.ts
      package.json

    web-angular/                        # App 2b : Angular (frontend, consomme api-nest)
      src/
        app/
          candidatures/
            candidatures.component.ts
            candidatures.component.spec.ts
            candidature-detail.component.ts
          services/
            candidatures-api.service.ts  # client HTTP vers api-nest, PAS d'accès direct au domaine
      package.json
```

**Point clé à ne pas rater** : `web-angular` n'importe jamais `packages/core` directement — elle ne connaît que l'API HTTP exposée par `api-nest`. C'est `api-nest` seul qui a le droit d'importer `packages/core` et `packages/infrastructure`, exactement comme `web-next`. Si Angular se met à importer le domaine directement, tu casses la frontière hexagonale et tu perds l'intérêt de la démo.

---

## 7. Stratégie TDD — ordre d'implémentation

L'ordre compte doublement ici : d'abord pour rester en contrôle, ensuite pour éviter de dupliquer du travail entre les deux apps.

**Phase A — Le cœur partagé, une seule fois (`packages/core` + `packages/infrastructure`)**

1. **Value objects du domaine** (`CandidatureId`, `NomEntreprise`) — tests unitaires purs, aucune dépendance
2. **Entité `Candidature`** — tests des règles métier (transitions valides/invalides, validation des dates) AVANT le code
3. **Ports** — juste les interfaces, pas de test
4. **Adapter en mémoire du repository** — tests d'intégration légers
5. **Use cases un par un**, chacun avec ses tests, en injectant le repository en mémoire et un `HorlogeService` factice
6. **Adapter MongoDB** — une fois que les use cases sont fiables, pour la persistance réelle

À ce stade, `packages/core` et `packages/infrastructure` sont testés et fiables, et n'ont encore jamais vu Next.js, NestJS ou Angular.

**Phase B — Les deux apps, en parallèle ou l'une après l'autre**

7. **App Next.js** : Server Actions qui appellent les use cases, puis UI React par-dessus
8. **App NestJS** : contrôleurs REST qui appellent les mêmes use cases, avec leurs propres tests (Jest, cette fois)
9. **App Angular** : composants qui consomment l'API NestJS via HTTP — aucun accès direct à `packages/core`

Ne commence jamais la phase B avant que la phase A soit complète et testée. C'est le seul moyen de vraiment vérifier que le domaine est réutilisable tel quel.

À chaque étape : test rouge → code minimal pour passer au vert → refactor si besoin, avant de passer à l'étape suivante.

---

## 8. Comment piloter Claude Code avec ce document (garder le contrôle)

Suggestion de séquence de prompts, un par étape ci-dessus — ne demande jamais "fais tout le projet" d'un coup, et surtout ne demande jamais les deux apps en même temps :

1. *"Voici mon document de conception [colle la section 2]. Crée uniquement le value object CandidatureId avec son test, en TDD : écris d'abord le test, montre-le moi, puis implémente."*
2. *"Maintenant l'entité Candidature avec les règles de transition de statut de la section 2. Teste d'abord les cas invalides (transition interdite) avant les cas valides."*
3. Continue étape par étape en collant la section correspondante à chaque fois, jusqu'à la fin de la Phase A (section 7).
4. Une fois la Phase A terminée et validée : *"packages/core et packages/infrastructure sont testés et complets. Maintenant, dans une session séparée, on attaque uniquement apps/web-next."* — puis fais de même plus tard pour `api-nest` et `web-angular` dans une nouvelle session dédiée.

Utilise le **Plan Mode** de Claude Code sur les étapes 2, 5, et à chaque démarrage de nouvelle app (les moments les plus riches en décisions) pour valider son plan avant qu'il touche au code.

## 9. Suivi de performance

Deux outils, choisis pour rester proportionnés à un side project tout en produisant des résultats exploitables (y compris pour du contenu LinkedIn) :

### Lighthouse CI — performance web frontend

Mesure les Core Web Vitals (LCP, CLS, INP) automatiquement, sur `apps/web-next` **et** `apps/web-angular`. Intégré en CI (GitHub Actions), il peut faire échouer une pipeline si un budget de performance est dépassé.

```
.github/workflows/
  lighthouse-web-next.yml
  lighthouse-web-angular.yml
```

Intérêt direct : comparaison chiffrée entre un rendu Next.js (Server Components) et un rendu Angular (SSR ou client), sur la même fonctionnalité métier.

### k6 — tests de charge sur les driving adapters

Comme `packages/core` est identique entre les deux apps, un scénario k6 qui appelle "créer une candidature puis changer son statut" via Server Actions vs via l'API REST NestJS isole vraiment la performance de l'adapter, pas de la logique métier. Comparaison équitable, rare à pouvoir faire aussi proprement.

```
tests/
  performance/
    k6-scenario-candidatures.js
    README.md   # comment lancer, comment lire les résultats
```

### Hors scope MVP (à ajouter plus tard si déploiement réel)

Observabilité continue (OpenTelemetry, APM) — pertinente uniquement avec du vrai trafic en production. Pas de valeur ajoutée sur un projet vitrine sans utilisateurs, donc volontairement écartée pour l'instant.

**Où ça s'insère dans la séquence** : après la Phase B (section 7) — une fois les deux apps fonctionnelles, pas avant. Mesurer la performance d'un code qui n'existe pas encore n'a pas de sens.

---

## 10. Sécurité by design (MVP sans authentification)

Pas d'auth pour le MVP ne veut pas dire pas de sécurité. Voici ce qui s'applique dès la Phase A, sans complexité inutile.

### Validation en profondeur (defense in depth)

Deux couches, pas une seule :
1. **Domaine** — les value objects (`NomEntreprise`, etc.) rejettent déjà les valeurs invalides à la construction. À étendre avec des limites de longueur et un refus des caractères de contrôle, pas seulement "non vide"
2. **Adapters d'entrée** — les Server Actions (Next.js) et les DTOs NestJS (avec `class-validator`) valident la forme des données **avant** qu'elles atteignent le domaine. Le domaine ne doit jamais faire confiance à ce qui vient de l'extérieur, même si l'adapter a déjà validé — la validation domaine reste la dernière ligne de défense.

Ces deux couches se testent en TDD comme le reste : cas invalides d'abord (chaîne vide, trop longue, caractères suspects), cas valides ensuite.

### Prévention des injections NoSQL

Le driver MongoDB natif (décision de la section 0) aide déjà, à condition de respecter une règle stricte : **jamais de valeur utilisateur non typée directement dans un objet de requête**. Concrètement :
- Ne jamais faire `collection.find(req.body)` ou équivalent — construire les filtres explicitement, champ par champ, avec des types connus
- Aucune valeur ne doit pouvoir devenir un opérateur MongoDB (`$where`, `$ne`, etc.) — ce risque existe si un objet JSON brut venant du client est utilisé tel quel comme filtre de requête
- Les DTOs NestJS et les Server Actions Next.js, en validant la *forme* des données (string attendu, pas objet), bloquent déjà une bonne partie de cette classe d'attaque

### Secrets et configuration

- `.env` jamais committé (`.gitignore` dès le premier commit du monorepo), un `.env.example` documenté à la place
- URL de connexion MongoDB, jamais en dur dans le code, y compris dans `packages/infrastructure`
- Valider les variables d'environnement au démarrage de chaque app (échec rapide et explicite si une variable requise manque, plutôt qu'un plantage silencieux plus tard)

### En-têtes de sécurité HTTP

- **NestJS** : middleware `helmet` — quelques lignes, protège contre plusieurs classes d'attaques par défaut (X-Frame-Options, X-Content-Type-Options, etc.)
- **Next.js** : en-têtes de sécurité configurables dans `next.config.ts` (CSP, HSTS) — Next.js expose une API dédiée pour ça

### CORS strict entre Angular et NestJS

Le frontend Angular consomme l'API NestJS via HTTP (décision de la section 6) — la configuration CORS de NestJS doit lister explicitement l'origine autorisée (l'URL de `web-angular`), jamais un wildcard `*`, même en développement si évitable.

### Limitation de débit (rate limiting)

Même sans authentification, une API ouverte sans limite est un vecteur d'abus (spam de création de candidatures, déni de service basique). NestJS propose un module de throttling prêt à l'emploi (`@nestjs/throttler`) — quelques lignes suffisent pour un MVP.

### Dépendances

- Lockfile (`pnpm-lock.yaml`) toujours committé — reproductibilité et surface d'attaque connue
- `pnpm audit` de temps en temps, ou Dependabot/Renovate activé sur le repo si tu le mets sur GitHub

### Logging prudent

Ne jamais logger le contenu brut du champ `notes` d'une candidature (il peut contenir des informations personnelles sur ta recherche) ni la chaîne de connexion MongoDB complète. Logger les identifiants (`CandidatureId`) et les événements, pas le contenu métier sensible.

### Ce qu'on ne fait volontairement pas maintenant

Pas d'authentification, pas de gestion de rôles — hors scope MVP (décidé en section 1). Le point d'extension existe déjà naturellement : le jour où l'auth arrive, elle s'ajoute comme un nouveau port/adapter (ex. un `AuthGuard` NestJS, un middleware Next.js), sans toucher au domaine. Pas besoin de préparer un champ `userId` dès maintenant "au cas où" — ce serait de la spéculation, pas du secure by design.

---

**Conseil supplémentaire pour ce monorepo** : garde un `CLAUDE.md` à la racine qui rappelle la règle du point clé de la section 6 (Angular n'importe jamais `packages/core` directement) — c'est le genre de règle qu'il vaut mieux répéter explicitement à chaque session plutôt que d'espérer que Claude Code la déduise seul.

