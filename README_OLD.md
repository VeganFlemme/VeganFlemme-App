# 🌱 VeganFlemme App

> **Simplifiez votre alimentation végane**  
> Plateforme web modulaire pour génération de menus, suivi nutritionnel et outils d’optimisation.

---

## 📦 Monorepo Structure

Ce repository contient deux projets principaux :
- `frontend/` : Application Next.js (TypeScript)
- `engine/` : API Node.js/Express (TypeScript)

```
VeganFlemme-App/
├── frontend/         # App Next.js (UI utilisateur)
├── engine/           # API Express (calculs, nutrition, génération)
├── health-check.sh   # Script de vérification de santé
├── render.yaml       # Config Render.com
└── .github/          # Actions CI/CD, templates, etc.
```

---

## 🖥️ Frontend : Next.js

- **Technos** : Next.js, React, TypeScript, Tailwind CSS
- **Test** : Jest
- **Qualité** : ESLint, config TypeScript stricte
- **Dossier principal** : `frontend/src/`
- **Config déploiement** : `frontend/vercel.json`
- **Environnement** : `frontend/.env.example`

### Scripts utiles

```bash
cd frontend
npm install
npm run dev        # Lancer le serveur local
npm run lint       # Linting
npm test           # Tests unitaires Jest
```

---

## ⚙️ Engine : API Node.js

- **Framework** : Express.js (TypeScript)
- **Fonctions** : Génération de menus, calculs nutritionnels, endpoints REST
- **Test** : Jest, tests d’intégration (__tests__/)
- **Qualité** : ESLint, configs TypeScript dédiées
- **Dossiers** : 
  - `engine/src/` (code source API)
  - `engine/scripts/` (scripts outils)
- **Environnement** : `engine/.env.example`

### Scripts utiles

```bash
cd engine
npm install
npm run dev        # Démarrer l’API en dev
npm run lint       # Linting
npm test           # Exécuter les tests
```

---

## 🚦 Health Check

Un script shell (`health-check.sh`) permet de vérifier la disponibilité des différents services (API, frontend).

---

## 🚀 Déploiement

- **Frontend** : Vercel (config via `vercel.json`)
- **Backend/API** : Render.com (`render.yaml`)
- Variables d’environnement à copier depuis les fichiers `.env.example` de chaque module.
- Build/Start : classiques `npm run build` puis `npm start` pour l’API.

---

## 🧪 Tests & Qualité

- Tests unitaires et d’intégration pour les deux modules (Jest).
- Config ESLint pour TypeScript.
- Actions CI/CD dans `.github/workflows/` (voir repo pour détails).

---

## 🔍 Documentation

- **Configuration** : Voir les fichiers `.env.example` pour chaque module.
- **Architecture** : Commentée dans chaque README de module si existant.
- **API Reference** : Consulter le code source dans `engine/src/` pour les endpoints disponibles.

---

## 🤝 Contribution

1. Fork ce repo
2. Crée une branche : `git checkout -b feat/ma-feature`
3. Code, commit, push : `git commit -m "feat: ma feature"`
4. Ouvre une Pull Request sur GitHub

---

## 📄 Licence

MIT License (voir fichier LICENSE)

---

> *VeganFlemme – Plateforme modulaire et open-source pour une nutrition végane simple et personnalisée.*
