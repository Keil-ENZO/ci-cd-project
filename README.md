# 📋 CI/CD Project — Formulaire d'inscription React

[![CI/CD](https://github.com/Keil-ENZO/ci-cd-project/actions/workflows/build_test_deploy_react.yml/badge.svg)](https://github.com/Keil-ENZO/ci-cd-project/actions/workflows/build_test_deploy_react.yml)
[![codecov](https://codecov.io/gh/Keil-ENZO/ci-cd-project/graph/badge.svg)](https://codecov.io/gh/Keil-ENZO/ci-cd-project)
[![npm](https://img.shields.io/npm/v/@enzoooooo/ci-cd-project)](https://www.npmjs.com/package/@enzoooooo/ci-cd-project)

Application React + TypeScript permettant à un utilisateur de s'inscrire via un formulaire, avec validation des champs, notifications toast, sauvegarde dans le localStorage et pipeline CI/CD complet.

---

## 🚀 Liens

- **Application déployée** : [https://Keil-ENZO.github.io/ci-cd-project/](https://Keil-ENZO.github.io/ci-cd-project/)
- **Documentation TypeDoc** : [https://Keil-ENZO.github.io/ci-cd-project/docs/](https://Keil-ENZO.github.io/ci-cd-project/docs/)
- **Package npm** : [@enzoooooo/ci-cd-project](https://www.npmjs.com/package/@enzoooooo/ci-cd-project)
- **Couverture Codecov** : [codecov.io/gh/Keil-ENZO/ci-cd-project](https://codecov.io/gh/Keil-ENZO/ci-cd-project)

---

## ✨ Fonctionnalités

- Formulaire d'inscription avec 6 champs : **Prénom, Nom, Email, Date de naissance, Ville, Code Postal**
- **Bouton désactivé** tant que tous les champs ne sont pas valides
- **Messages d'erreur en rouge** sous chaque champ invalide (au fur et à mesure de la saisie)
- **Toaster d'erreur** lors d'une tentative de soumission invalide (un toast par champ en erreur)
- **Toaster de succès** + **sauvegarde dans le localStorage** + **vidage des champs** après inscription réussie
- Documentation accessible depuis l'application

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

```bash
# Installer les dépendances
npm install

# Lancer en développement
npm run dev

# Lancer les tests avec couverture
npm test

# Build de production
npm run build

# Générer la documentation
npm run docs

# Déployer sur GitHub Pages
npm run deploy
```

---

## 🧪 Tests

Le projet dispose d'une couverture de tests à **100%** (hors composants UI ShadCN).

### Tests unitaires (`src/tests/unitaire/`)

| Fichier | Fonctions testées |
|---|---|
| `age.test.ts` | `checkAge` — calcul de l'âge, validation des 18 ans, dates invalides |
| `form.test.ts` | `checkName` — noms/prénoms valides/invalides, `checkCP` — codes postaux |
| `mail.test.ts` | `checkMail` — formats d'emails valides et invalides |

### Tests d'intégration (`src/tests/integration/`)

| Fichier | Scénarios testés |
|---|---|
| `app.test.tsx` | Soumission valide → localStorage + champs vidés |
| | Messages d'erreur sous les champs invalides |
| | Bouton désactivé pour un mineur |
| | Soumission d'un formulaire vide |

```bash
# Lancer les tests
npm test

# Lancer en mode watch
npm run test:watch
```

---

## 📁 Structure du projet

```
src/
├── components/
│   └── ui/              # Composants ShadCN UI (button, input, field, dialog…)
├── pages/
│   └── HomePage/
│       └── HomePage.tsx # Page principale avec le formulaire
├── utils/
│   ├── age.ts           # Validation de l'âge (checkAge)
│   ├── form.ts          # Validation nom/prénom/ville/CP (checkName, checkCP)
│   └── mail.ts          # Validation email (checkMail)
├── tests/
│   ├── unitaire/        # Tests unitaires des fonctions de validation
│   └── integration/     # Tests d'intégration du formulaire
└── lib/
    └── utils.ts         # Utilitaires (cn — class merger)
```

---

## ⚙️ Pipeline CI/CD (GitHub Actions)

Le workflow `.github/workflows/build_test_deploy_react.yml` exécute automatiquement à chaque push sur `main` :

1. **Installation** (`npm ci`)
2. **Build** (`tsc && vite build`)
3. **Tests + Couverture** (`vitest --coverage`)
4. **Upload Codecov** (rapport de couverture)
5. **Génération de la documentation** TypeDoc → `dist/docs/`
6. **Publication du package** sur npm (`@enzoooooo/ci-cd-project`)
7. **Déploiement** sur GitHub Pages

---

## 🔧 Stack technique

| Technologie | Usage |
|---|---|
| [React 19](https://react.dev/) | Framework UI |
| [TypeScript](https://www.typescriptlang.org/) | Typage statique |
| [Vite](https://vitejs.dev/) | Bundler et serveur de développement |
| [Vitest](https://vitest.dev/) | Tests unitaires et d'intégration |
| [ShadCN UI](https://ui.shadcn.com/) | Composants UI |
| [Sonner](https://sonner.emilkowal.ski/) | Notifications toast |
| [TailwindCSS](https://tailwindcss.com/) | Styling |
| [TypeDoc](https://typedoc.org/) | Génération de documentation |
| [Codecov](https://codecov.io/) | Rapport de couverture de tests |
