# Job Tracker

Une application de suivi de candidatures d'emploi : ajouter une offre, suivre son statut (candidature envoyée, entretien RH, entretien technique, offre reçue, refus...), planifier des relances, garder un historique.

Le besoin réel est simple. L'architecture, elle, ne l'est pas — volontairement.

## Pourquoi ce projet existe

Deux raisons, assumées dès le départ :

1. **Un vrai besoin** : suivre une recherche d'emploi proprement, sans tableur qui devient vite illisible.
2. **Une vitrine technique** : ce repo sert aussi à démontrer une manière de construire du logiciel — architecture hexagonale, TDD strict, monorepo partagé entre plusieurs frameworks. C'est le genre de structure qu'on justifie sur un vrai produit à l'échelle d'une équipe, pas sur un tracker perso. Ici, c'est un choix délibéré : **over-engineered by purpose**.

Concrètement, ça veut dire : le domaine métier (`packages/core`) ne dépend d'aucun framework, et est réimplémenté **deux fois** côté UI/API — une fois en Next.js, une fois en NestJS + Angular — pour prouver que la logique métier tient vraiment à distance de l'infrastructure, plutôt que de le supposer.

## Ce que le projet démontre

- **Architecture hexagonale (ports & adapters) appliquée à la lettre** : le domaine (`packages/core`) est zéro-dépendance, testé en isolation, et consommé par deux implémentations complètement différentes sans jamais être dupliqué ni contourné.
- **TDD strict et documenté** : chaque use case, value object et transition de statut a été écrit rouge → vert → refactor, cas invalides testés avant les cas valides (voir l'historique de commits).
- **Frontière stricte entre couches** : `web-angular` ne connaît que l'API HTTP de `api-nest` — elle n'importe jamais le domaine directement, même si ça serait plus rapide à court terme.
- **Design system partagé sans coupler les frameworks** : un package `design-tokens` (couleurs OKLCH, spacing, typographie) consommé à la fois par React et Angular, parce que ce sont des données, pas du code framework-spécifique.
- **Storybook comme suite de tests, pas juste comme catalogue** : les stories des composants (atoms → molecules → organisms) embarquent des fonctions `play` exécutées comme de vrais tests Vitest — pas de suite de tests dupliquée à côté.
- **Sécurité by design dès le MVP** : validation à deux couches (value objects + DTOs), jamais de valeur brute dans une requête MongoDB, CORS explicite, pas de secrets en dur.

## Stack

| Domaine                 | Choix                                                                        |
| ----------------------- | ---------------------------------------------------------------------------- |
| Langage                 | TypeScript partout                                                           |
| Monorepo                | pnpm workspaces                                                              |
| App 1                   | Next.js (App Router) + React, Server Actions vers les use cases              |
| App 2                   | NestJS (API REST) + Angular (dernière version)                               |
| Domaine partagé         | `packages/core` — zéro dépendance framework                                  |
| Infrastructure partagée | `packages/infrastructure` — adapters MongoDB (driver natif, pas d'ODM)       |
| Design system partagé   | `packages/design-tokens`                                                     |
| Tests                   | Vitest partout, sauf NestJS (Jest, idiomatique côté Nest)                    |
| Composants              | Atomic Design + Storybook (`@storybook/addon-vitest`) sur les deux frontends |
| Persistance             | MongoDB                                                                      |

Le détail complet (règles métier, transitions de statut, ports/adapters, roadmap) est dans [`docs/job-tracker-architecture.md`](docs/job-tracker-architecture.md).

## Structure du monorepo

```
packages/
  core/               # domaine + use cases — zéro dépendance framework
  infrastructure/      # adapters MongoDB, partagés entre les deux apps
  design-tokens/       # couleurs, spacing, typographie — données pures

apps/
  web-next/            # App 1 : Next.js + React
  api-nest/             # App 2a : NestJS (API REST)
  web-angular/          # App 2b : Angular — consomme api-nest via HTTP, jamais packages/core
```

**Règle non négociable** : `web-angular` n'importe jamais `packages/core` ni `packages/infrastructure`. Seuls `api-nest` et `web-next` en ont le droit. Si cette frontière est cassée, c'est un bug d'architecture, pas un détail.

## État du projet

- ✅ Phase A (domaine, use cases, adapters) terminée en TDD.
- 🚧 Phase B en cours : Next.js (design tokens, Storybook, atomic design) démarré ; NestJS/Angular à venir.

## CI/CD

Toute contribution passe par une PR vers `main` (push direct bloqué, `ci.yml` doit être vert). Deux environnements déployés sur le home server, chacun avec sa propre base MongoDB isolée :

|          | Branche   | web-next                                   | api-nest                                  | web-angular                              |
| -------- | --------- | ------------------------------------------ | ----------------------------------------- | ---------------------------------------- |
| **Prod** | `main`    | next-job-app-tracker.romainh-craft.com     | api-job-app-tracker.romainh-craft.com     | ng-job-app-tracker.romainh-craft.com     |
| **Dev**  | `develop` | dev.next-job-app-tracker.romainh-craft.com | dev.api-job-app-tracker.romainh-craft.com | dev.ng-job-app-tracker.romainh-craft.com |

`web-angular` n'a pas encore de code applicatif — ses routes/services de déploiement existent déjà mais restent commentés jusqu'à son démarrage en Phase B. Détail complet (runner self-hosted, DNS Cloudflare, secrets par Environment) dans [`docs/job-tracker-architecture.md`](docs/job-tracker-architecture.md), section 13.

## Hors scope (MVP)

Pas d'authentification, pas de multi-utilisateur, pas de champ `userId` anticipé. Le point d'extension existe déjà via le pattern port/adapter — pas besoin de le préparer avant d'en avoir besoin.
