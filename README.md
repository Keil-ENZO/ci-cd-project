# 📋 CI/CD Project — Gestion d'inscriptions (React + Python + MySQL)

[![CI/CD](https://github.com/Keil-ENZO/ci-cd-project/actions/workflows/build_test_deploy_react.yml/badge.svg)](https://github.com/Keil-ENZO/ci-cd-project/actions/workflows/build_test_deploy_react.yml)
[![Docker](https://github.com/Keil-ENZO/ci-cd-project/actions/workflows/docker.yml/badge.svg)](https://github.com/Keil-ENZO/ci-cd-project/actions/workflows/docker.yml)
[![codecov](https://codecov.io/gh/Keil-ENZO/ci-cd-project/graph/badge.svg)](https://codecov.io/gh/Keil-ENZO/ci-cd-project)
[![npm](https://img.shields.io/npm/v/@enzoooooo/ci-cd-project)](https://www.npmjs.com/package/@enzoooooo/ci-cd-project)

Application **full-stack** : un front React + TypeScript avec un formulaire d'inscription (validation + notifications toast) qui **sauvegarde les inscrits en base de données MySQL** via une API Python (FastAPI). Un **compte administrateur** peut se connecter pour consulter les informations privées des inscrits et les supprimer. Le tout avec une **architecture Docker** et une **pipeline CI/CD complète** (tests unitaires, intégration, infrastructure, end-to-end, déploiements).

---

## 🚀 Liens

- **Front (GitHub Pages)** : [https://Keil-ENZO.github.io/ci-cd-project/](https://Keil-ENZO.github.io/ci-cd-project/)
- **Back (Vercel)** : [https://ci-cd-project-topaz.vercel.app](https://ci-cd-project-topaz.vercel.app)
- **Documentation TypeDoc** : [https://Keil-ENZO.github.io/ci-cd-project/docs/](https://Keil-ENZO.github.io/ci-cd-project/docs/)
- **Package npm** : [@enzoooooo/ci-cd-project](https://www.npmjs.com/package/@enzoooooo/ci-cd-project)
- **Couverture Codecov** : [codecov.io/gh/Keil-ENZO/ci-cd-project](https://codecov.io/gh/Keil-ENZO/ci-cd-project)

---

## ✨ Fonctionnalités

**Visiteur**
- Formulaire d'inscription à 6 champs (**Prénom, Nom, Email, Date de naissance, Ville, Code Postal**)
- Bouton désactivé tant que tous les champs ne sont pas valides
- Messages d'erreur en rouge sous chaque champ + toasts d'erreur à la soumission invalide
- À l'inscription valide : **enregistrement en base MySQL**, toast de succès, champs vidés

**Administrateur** (connexion par email / mot de passe)
- Authentification **JWT** (mot de passe haché en **bcrypt**)
- Affichage de la **liste des utilisateurs avec leurs informations privées** (email, date de naissance, code postal)
- **Suppression** d'un inscrit
- En mode admin, le formulaire d'inscription public est masqué

> L'administrateur est créé automatiquement au premier démarrage de la base, à partir de variables d'environnement (`ADMIN_EMAIL` / `ADMIN_PASSWORD`).

---

## 🏗️ Architecture

```
┌──────────────┐      ┌───────────────────┐      ┌──────────────┐
│  React (Vite)│ ───► │  FastAPI (Python)  │ ───► │    MySQL     │
│    front     │ HTTP │   API REST + JWT   │ SQL  │    base      │
└──────────────┘      └───────────────────┘      └──────────────┘
```

| Environnement | Front | Back | Base de données |
|---|---|---|---|
| **Local** | Vite (Docker) | FastAPI (Docker) | MySQL (Docker) + Adminer + Dozzle |
| **Production** | GitHub Pages | Vercel (serverless) | Aiven (MySQL managé, SSL) |

### API (FastAPI)

| Méthode | Route | Accès | Description |
|---|---|---|---|
| `GET` | `/` | public | Santé du service |
| `GET` | `/users` | public | Liste des inscrits (infos **réduites** : nom, prénom, ville) |
| `POST` | `/users` | public | Inscription |
| `POST` | `/login` | public | Connexion admin → renvoie un token JWT |
| `GET` | `/users/details` | **admin** | Liste avec infos **privées** |
| `DELETE` | `/users/{id}` | **admin** | Suppression d'un inscrit |

---

## ✅ Règles de validation

| Champ | Règle |
|---|---|
| **Prénom / Nom / Ville** | Minimum 2 caractères, lettres uniquement (accents, tréma, tiret acceptés), pas de chiffres ni caractères spéciaux |
| **Email** | Format valide : `nom@domaine.extension` |
| **Date de naissance** | L'utilisateur doit avoir **au moins 18 ans** |
| **Code postal** | Format français : exactement **5 chiffres** |

---

## 🛠️ Installation et lancement

### Avec Docker (stack complète)

```bash
# Créer le fichier .env à partir de l'exemple
cp .env.example .env

# Construire l'image MySQL de migration puis lancer toute la stack
docker build -t migration_mysql .
docker compose up -d --build
```

| Service | URL |
|---|---|
| Front React | http://localhost:3000/ci-cd-project/ |
| API FastAPI | http://localhost:8000 |
| Adminer (DB) | http://localhost:8080 |
| Dozzle (logs) | http://localhost:8081 |

### Front seul (développement)

```bash
npm install
npm run dev          # http://localhost:5173/ci-cd-project/
```

> En local, le front cible `http://localhost:8000`. En production, l'URL du backend est injectée au build via la variable `VITE_API_URL`.

---

## 🧪 Tests

Couverture **> 95 %** (statements, branches, functions, lines — hors composants UI ShadCN).

### Tests unitaires
- **Vitest** (`src/tests/unitaire/`) : `checkAge`, `checkName`, `checkCP`, `checkMail`
- **Jest** (`src/tests/unitaire/api.test.ts`) : client API axios (`countUsers`, `addUser`)

### Tests d'intégration (`src/tests/integration/`, Vitest + Testing Library)
- `app.test.tsx` — compteur, inscription, erreurs serveur, parcours admin (login → suppression → logout)
- `homePage.test.tsx` — validation des champs et soumission
- `loginForm.test.tsx` — connexion admin (succès / échec), déconnexion
- `usersList.test.tsx` — liste réduite vs privée, suppression

### Tests end-to-end (`cypress/`, Cypress)
Exécutés contre la **vraie stack Docker** : inscription réelle en base, connexion admin, affichage des infos privées, suppression. Inclut des scénarios **mode offline** (réseau coupé via `cy.intercept`) qui vérifient les messages d'erreur (chargement, inscription, connexion).

```bash
npm test           # Vitest (unitaires Vitest + intégration) + couverture
npm run test:unit  # Jest (test unitaire de l'API)
npm run cypress    # Cypress (E2E, interface) — stack Docker requise
```

---

## 📁 Structure du projet

```
.
├── server/
│   └── server.py            # API FastAPI (auth JWT, CRUD utilisateurs, seed admin)
├── migration/               # Scripts SQL (création DB + table, init Docker)
├── src/
│   ├── components/
│   │   ├── LoginForm.tsx     # Connexion administrateur
│   │   ├── UsersList.tsx     # Liste des inscrits (vue admin)
│   │   └── ui/               # Composants ShadCN UI
│   ├── pages/HomePage/       # Formulaire d'inscription
│   ├── utils/                # Validations (age, form, mail)
│   ├── lib/api.ts            # Client HTTP (axios) vers le backend
│   └── tests/                # unitaire/ + integration/
├── cypress/                  # Tests end-to-end
├── docker-compose.yml        # Stack mysql / adminer / python / react / dozzle
├── vercel.json               # Déploiement du backend Python sur Vercel
└── .github/workflows/        # Pipelines CI/CD
```

---

## ⚙️ Pipeline CI/CD (GitHub Actions)

Les **déploiements sont conditionnés à la réussite des tests** (pas de tests verts → pas de déploiement).

### `build_test_deploy_react.yml` — Front
1. Installation (`npm ci`)
2. **Tests unitaires Jest** (`npm run test:unit`)
3. **Tests unitaires + intégration Vitest** (`npm test`, avec couverture → Codecov)
4. Publication du package npm
5. Build du front (avec `VITE_API_URL`) + documentation TypeDoc
6. **Déploiement GitHub Pages** *(dépend de la réussite des tests)*

### `docker.yml` — Back & infrastructure
1. **Build & push des images Docker** (front + back)
2. **Tests d'infrastructure** : démarrage de la stack + vérification des *healthchecks*
3. **Tests end-to-end** Cypress contre la stack
4. **Déploiement du backend sur Vercel** *(dépend de la réussite des tests d'infra + E2E, uniquement sur `main`)*

---

## 🔧 Stack technique

| Technologie | Usage |
|---|---|
| [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) | Front |
| [Vite](https://vitejs.dev/) | Bundler / dev server |
| [FastAPI](https://fastapi.tiangolo.com/) (Python) | API REST |
| [MySQL](https://www.mysql.com/) | Base de données |
| [JWT (PyJWT)](https://pyjwt.readthedocs.io/) + [bcrypt](https://pypi.org/project/bcrypt/) | Authentification |
| [Docker](https://www.docker.com/) / Docker Compose | Conteneurisation |
| [Vercel](https://vercel.com/) | Hébergement du backend |
| [Aiven](https://aiven.io/) | MySQL managé (prod) |
| [Vitest](https://vitest.dev/) + [Jest](https://jestjs.io/) | Tests unitaires / intégration |
| [Cypress](https://www.cypress.io/) | Tests end-to-end |
| [ShadCN UI](https://ui.shadcn.com/) + [TailwindCSS](https://tailwindcss.com/) + [Sonner](https://sonner.emilkowal.ski/) | UI |
| [TypeDoc](https://typedoc.org/) + [Codecov](https://codecov.io/) | Documentation / couverture |
