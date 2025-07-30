# 🌱 VeganFlemme App

[![Engine CI/CD](https://github.com/VeganFlemme/VeganFlemme-App/actions/workflows/engine.yml/badge.svg)](https://github.com/VeganFlemme/VeganFlemme-App/actions/workflows/engine.yml)
[![Frontend CI/CD](https://github.com/VeganFlemme/VeganFlemme-App/actions/workflows/frontend.yml/badge.svg)](https://github.com/VeganFlemme/VeganFlemme-App/actions/workflows/frontend.yml)
[![codecov](https://codecov.io/gh/VeganFlemme/VeganFlemme-App/branch/main/graph/badge.svg)](https://codecov.io/gh/VeganFlemme/VeganFlemme-App)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Node.js Version](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)

> **Simplifiez votre alimentation végane**  
> Plateforme web modulaire pour génération de menus, suivi nutritionnel et outils d'optimisation.

---

## 📱 Interface Utilisateur

![VeganFlemme Homepage](https://github.com/user-attachments/assets/4c925449-c1c3-4f58-87f1-7dba7b55d8dc)

*Interface moderne et responsive pour la génération de menus vegan personnalisés*

---

## 🔧 GitHub Actions Workflows

Ce repository utilise les workflows GitHub Actions suivants :

- **Engine CI/CD** (`.github/workflows/engine.yml`) : 
  - ✅ Tests, linting et build du backend
  - 📊 Génération de couverture de tests
  - 🚀 Déploiement automatique sur Render.com
  
- **Frontend CI/CD** (`.github/workflows/frontend.yml`) :
  - ✅ Tests, linting et build du frontend  
  - 📊 Génération de couverture de tests
  - 🚀 Déploiement automatique sur Vercel

---

## 🌐 API Examples

### Exemple d'appel API - Génération de menu

```bash
# Générer un menu vegan personnalisé
curl -X POST https://veganflemme-engine.onrender.com/api/menu/generate \
  -H "Content-Type: application/json" \
  -d '{
    "people": 2,
    "budget": "medium", 
    "cookingTime": "medium",
    "restrictions": 1,
    "daysCount": 7,
    "userId": "demo_user"
  }'
```

### Réponse exemple (JSON)

```json
{
  "success": true,
  "menu": {
    "id": "menu_123",
    "days": [
      {
        "day": 1,
        "date": "2024-07-30",
        "meals": {
          "breakfast": {
            "id": "breakfast_1",
            "name": "Porridge d'avoine aux fruits",
            "nutrition": {
              "calories": 350,
              "protein": 12,
              "carbs": 65,
              "fat": 8
            }
          }
        }
      }
    ],
    "summary": {
      "totalCost": 25.50,
      "nutritionScore": 85,
      "carbonFootprint": 2.1
    }
  }
}
```

### Vérification de l'état de l'API

```bash
# Health check
curl https://veganflemme-engine.onrender.com/api/health

# Réponse
{
  "status": "ok",
  "message": "VeganFlemme Engine is running",
  "timestamp": "2024-07-30T10:30:53.545Z",
  "version": "1.0.0"
}
```

---

## 🐳 Docker Support

VeganFlemme supporte maintenant Docker pour un développement et déploiement simplifiés !

### Démarrage Rapide avec Docker

```bash
# 1. Configuration
cp .env.docker.example .env

# 2. Démarrage de tous les services
./scripts/docker/start.sh --build --detach

# 3. Vérification
./scripts/docker/logs.sh --test
```

### Services Docker
- **🌐 Frontend** : http://localhost:3000 (Next.js)
- **⚙️ Backend** : http://localhost:3001/api (Express)
- **🗄️ Database** : postgresql://localhost:5432/veganflemme

### Scripts Utiles
```bash
./scripts/docker/start.sh    # Démarrer les services
./scripts/docker/stop.sh     # Arrêter les services
./scripts/docker/logs.sh     # Voir les logs
./scripts/docker/reset.sh    # Reset complet
```

📖 **Documentation complète** : [Guide de Migration Docker](./DOCKER_MIGRATION_GUIDE.md)

---

## 📦 Monorepo Structure

Ce repository contient deux projets principaux :
- `frontend/` : Application Next.js (TypeScript)
- `engine/` : API Node.js/Express (TypeScript)

```
VeganFlemme-App/
├── frontend/         # App Next.js (UI utilisateur)
├── engine/           # API Express (calculs, nutrition, génération)
├── health-check.sh   # Script de vérification de santé
├── render.yaml       # Config Render.com
├── LICENSE           # License MIT
└── .github/          # Actions CI/CD, templates, etc.
```

---

## 🖥️ Frontend : Next.js

- **Technos** : Next.js, React, TypeScript, Tailwind CSS
- **Test** : Jest
- **Qualité** : ESLint, config TypeScript stricte
- **Dossier principal** : `frontend/src/`
- **Config déploiement** : `frontend/vercel.json`
- **Environnement** : `frontend/.env.example`

### Scripts utiles

```bash
cd frontend
npm install
npm run dev        # Lancer le serveur local
npm run lint       # Linting
npm test           # Tests unitaires Jest
npm run test:coverage  # Tests avec couverture
```

---

## ⚙️ Engine : API Node.js

- **Framework** : Express.js (TypeScript)
- **Fonctions** : Génération de menus, calculs nutritionnels, endpoints REST
- **Test** : Jest, tests d'intégration (__tests__/)
- **Qualité** : ESLint, configs TypeScript dédiées
- **Dossiers** : 
  - `engine/src/` (code source API)
  - `engine/scripts/` (scripts outils)
- **Environnement** : `engine/.env.example`

### Scripts utiles

```bash
cd engine
npm install
npm run dev        # Démarrer l'API en dev
npm run lint       # Linting
npm test           # Exécuter les tests
npm run test:coverage  # Tests avec couverture
```

---

## 🚦 Health Check

Un script shell (`health-check.sh`) permet de vérifier la disponibilité des différents services (API, frontend).

---

## 🚀 Déploiement

- **Frontend** : Vercel (config via `vercel.json`)
- **Backend/API** : Render.com (`render.yaml`)
- Variables d'environnement à copier depuis les fichiers `.env.example` de chaque module.
- Build/Start : classiques `npm run build` puis `npm start` pour l'API.

---

## 🧪 Tests & Qualité

- Tests unitaires et d'intégration pour les deux modules (Jest).
- Config ESLint pour TypeScript.
- Actions CI/CD dans `.github/workflows/` (voir repo pour détails).
- **Couverture de tests** : Générée automatiquement et envoyée à Codecov

### Couverture actuelle
- **Engine** : ~57% statements, ~38% branches
- **Frontend** : ~67% statements, 100% branches

---

## 📚 Documentation

### API Documentation
- **Documentation complète** : [`engine/API.md`](./engine/API.md)
- **Base URL Production** : `https://veganflemme-engine.onrender.com/api`
- **Base URL Development** : `http://localhost:3001/api`

### Modules Documentation
- **Engine README** : [`engine/README.md`](./engine/README.md)
- **Frontend README** : [`frontend/README.md`](./frontend/README.md)

### Configuration
- **Variables d'environnement** : Voir les fichiers `.env.example` pour chaque module.
- **Architecture** : Commentée dans chaque README de module.

---

## 🔒 Sécurité des Variables d'Environnement

✅ **Statut de sécurité** : Toutes les variables d'environnement ont été vérifiées

### Frontend (.env.example)
- ✅ Aucun secret hardcodé
- ✅ Variables publiques (`NEXT_PUBLIC_*`) documentées
- ✅ Clés API en commentaire uniquement

### Engine (.env.example)  
- ✅ Aucun secret hardcodé
- ✅ Toutes les clés sensibles en commentaire
- ✅ Valeurs par défaut sécurisées pour le développement

### Bonnes pratiques appliquées
- Utilisation de `.env.example` pour la documentation
- Secrets réels stockés dans les services de déploiement
- Variables sensibles commentées avec des exemples

---

## 🤝 Contribution

1. Fork ce repo
2. Crée une branche : `git checkout -b feat/ma-feature`
3. Code, commit, push : `git commit -m "feat: ma feature"`
4. Ouvre une Pull Request sur GitHub

---

## 📄 Licence

MIT License (voir fichier [LICENSE](./LICENSE))

---

> *VeganFlemme – Plateforme modulaire et open-source pour une nutrition végane simple et personnalisée.*