# Job Tracker — règles essentielles

Conception complète : `docs/job-tracker-architecture.md`. Ce fichier ne résume que ce qui doit être respecté à chaque session.

## Frontière hexagonale — la règle qui ne doit jamais être cassée

- **`web-angular` n'importe JAMAIS `packages/core` (ni `packages/infrastructure`) directement.** Elle ne connaît que l'API HTTP exposée par `api-nest`, via `services/candidatures-api.service.ts`.
- Seuls `api-nest` et `web-next` ont le droit d'importer `packages/core` et `packages/infrastructure`.
- `packages/core` (domaine + use cases) a **zéro dépendance** à un framework (pas de Next.js, NestJS ou Angular dedans).
- Si une tâche impliquerait qu'Angular importe le domaine directement : s'arrêter et le signaler, ne pas contourner la règle même "temporairement".

## TDD strict — non négociable

- Toujours test rouge → code minimal pour passer au vert → refactor. Jamais de code de production écrit avant son test.
- Cas invalides/interdits testés **avant** les cas valides (ex. transitions de statut invalides avant les valides).
- Ne jamais écrire un test après le code pour "confirmer" — le test doit précéder et échouer d'abord.

## Ordre d'implémentation (Phase A avant Phase B)

- **Phase A** (une seule fois, dans `packages/core` + `packages/infrastructure`) : value objects → entité `Candidature` (règles + transitions) → ports (interfaces seules, pas de test) → adapter en mémoire → use cases un par un → adapter MongoDB.
- **Ne jamais commencer la Phase B** (apps Next.js / NestJS / Angular) avant que la Phase A soit complète et testée.
- Ne jamais travailler sur les deux apps en même temps dans la même session — une app à la fois, en session dédiée.
- Utiliser le **Plan Mode** avant de toucher au code à chaque démarrage de nouvelle app ou sur une étape à forte décision métier (ex. règles de transition de statut).

## Stack — points à ne pas confondre

- Tests : Vitest partout (`packages/core`, `packages/infrastructure`, `web-next`, `web-angular`) **sauf** `api-nest` qui reste en Jest.
- Pas d'ODM MongoDB — driver natif `mongodb`. Le mapping domaine ↔ document est explicite dans l'adapter, jamais de magie de schéma.
- `app/layout.tsx` est obligatoire dans Next.js App Router ; dossiers co-localisés non-routés préfixés `_` (ex. `_components`).

## Sécurité — rappels systématiques

- Validation en deux couches : value objects du domaine (dernière ligne de défense) + DTOs/Server Actions en entrée. Le domaine ne fait jamais confiance à ce qui vient de l'extérieur.
- Jamais de valeur utilisateur brute dans un objet de requête MongoDB (pas de `collection.find(req.body)`).
- CORS NestJS : origine explicite de `web-angular`, jamais de wildcard `*`.
- Ne jamais logger le contenu du champ `notes` ni une chaîne de connexion MongoDB complète.
- `.env` jamais committé ; secrets jamais en dur, y compris dans `packages/infrastructure`.

## Hors scope MVP (ne pas anticiper)

- Pas d'authentification, pas de rôles, pas de champ `userId` "au cas où". Le point d'extension existe déjà via le pattern port/adapter — pas besoin de préparer quoi que ce soit maintenant.
