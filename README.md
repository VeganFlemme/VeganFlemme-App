# 🌱 VeganFlemme App

> **Votre transition vegan simplifiée** - Web-app intelligente pour une nutrition végétalienne équilibrée et sans carences

[![Frontend CI/CD](https://github.com/VeganFlemme/VeganFlemme-App/actions/workflows/frontend.yml/badge.svg)](https://github.com/VeganFlemme/VeganFlemme-App/actions/workflows/frontend.yml)
[![Engine CI/CD](https://github.com/VeganFlemme/VeganFlemme-App/actions/workflows/engine.yml/badge.svg)](https://github.com/VeganFlemme/VeganFlemme-App/actions/workflows/engine.yml)

## 🎯 Vision

VeganFlemme est une web-app progressive qui révolutionne la transition vers une alimentation végétalienne. Notre plateforme génère des **menus 100% vegan personnalisés** conformes aux **RNP ANSES**, avec suivi nutritionnel temps réel, substitutions intelligentes et création de panier affilié.

### 🌟 Proposition de Valeur

1. **Menus 100% personnalisés, sans carence**
   - Couvre l'intégralité des RNP ANSES en macro & micro-nutriments
   - Optimisation multi-objectif : budget + variété + contraintes gustatives
   - Prise en compte complète du profil utilisateur

2. **Qualité & éthique contrôlées**
   - Filtres Bio, Nutri-Score, Yuka, origine française/européenne
   - Traçabilité via Open Food Facts et base CIQUAL
   - Empreinte carbone et eau par repas

3. **Substitutions intelligentes "swap"**
   - Alternatives équivalentes nutritionnellement
   - Préservation de l'équilibre global du menu
   - Recalcul instantané des jauges

4. **Dashboard temps réel**
   - Jauges radiales % RNP avec alerting préventif
   - Graphiques d'évolution sur 7/30 jours
   - Suggestions correctives personnalisées

## 🏗️ Architecture

```
VeganFlemme-App/
├── frontend/          # Next.js 14 + React + TypeScript
├── engine/           # Node.js API + Express + TypeScript  
├── .github/workflows/ # CI/CD GitHub Actions
└── docs/             # Documentation technique
```

### Frontend (Next.js + Vercel)
- **Framework**: Next.js 14 avec App Router
- **Styling**: Tailwind CSS avec thème VeganFlemme
- **État**: React Context + hooks personnalisés
- **PWA**: Manifest + Service Worker
- **Déploiement**: Vercel avec CI/CD automatique

### Engine (Node.js + Render)
- **API**: Express.js avec architecture modulaire
- **Base de données**: PostgreSQL + Redis (cache)
- **Nutrition**: Moteur OR-Tools pour optimisation
- **Monitoring**: Winston + métriques de santé
- **Déploiement**: Render avec auto-scaling

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 18+ 
- npm ou yarn
- PostgreSQL (pour le backend complet)

### Installation

```bash
# Cloner le repository
git clone https://github.com/VeganFlemme/VeganFlemme-App.git
cd VeganFlemme-App

# Installation Frontend
cd frontend
npm install
cp .env.example .env.local
npm run dev

# Installation Engine (terminal séparé)
cd ../engine  
npm install
cp .env.example .env
npm run dev
```

### URLs de développement
- **Frontend**: http://localhost:3000
- **API Engine**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

## 🔧 Configuration

### Variables d'Environnement

#### Frontend (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

#### Engine (`.env`)
```env
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000
DATABASE_URL=postgresql://user:pass@localhost:5432/veganflemme
```

### Déploiement Production

#### Vercel (Frontend)
1. Connecter le repository à Vercel
2. Définir les variables d'environnement :
   ```
   NEXT_PUBLIC_API_URL=https://veganflemme-engine.onrender.com/api
   NEXT_PUBLIC_APP_ENV=production
   ```
3. Déploiement automatique via GitHub Actions

#### Render (Engine)
1. Créer un nouveau Web Service
2. Connecter le repository (dossier `engine/`)
3. Configurer les variables d'environnement
4. Build Command: `npm run build`
5. Start Command: `npm start`

## 🧪 Tests & Qualité

### Frontend
```bash
cd frontend
npm run test          # Tests unitaires Jest
npm run test:watch    # Mode watch
npm run test:coverage # Couverture de code
npm run lint          # ESLint
```

### Engine
```bash
cd engine
npm run test          # Tests API avec Supertest
npm run test:coverage # Couverture de code  
npm run lint          # ESLint TypeScript
```

### CI/CD
- Tests automatiques sur chaque PR
- Déploiement automatique sur `main`
- Vérification de la santé des endpoints

## 📊 API Reference

### Health Endpoints
```bash
GET /api/health           # Status de base
GET /api/health/detailed  # Informations système
```

### Menu Generation
```bash
POST /api/menu/generate           # Génération de menu
GET /api/menu/recipes/:id         # Détails d'une recette
POST /api/menu/swap-ingredient    # Substitution d'ingrédient
```

### Nutrition Tracking
```bash
GET /api/nutrition/rnp-anses            # Références ANSES
POST /api/nutrition/analyze             # Analyse nutritionnelle
GET /api/nutrition/daily-tracking/:id   # Suivi quotidien
```

### Exemples d'utilisation

#### Générer un menu
```bash
curl -X POST http://localhost:3001/api/menu/generate \
  -H "Content-Type: application/json" \
  -d '{
    "people": 2,
    "budget": "medium", 
    "cookingTime": "medium",
    "dietaryRestrictions": ["gluten"]
  }'
```

#### Vérifier la santé de l'API
```bash
curl http://localhost:3001/api/health
```

## 🛣️ Roadmap

### Phase 1 - MVP ✅
- [x] Architecture complète frontend/backend
- [x] Pages principales et navigation
- [x] API de base avec endpoints essentiels
- [x] CI/CD et déploiement automatique
- [x] Tests unitaires de base

### Phase 2 - Core Features 🚧
- [ ] Moteur de génération de menu avec OR-Tools
- [ ] Intégration base CIQUAL pour nutrition
- [ ] Système de profils utilisateur complet
- [ ] Dashboard avec jauges temps réel

### Phase 3 - Intelligence 🔮
- [ ] Algorithme de swap intelligent
- [ ] Intégration Open Food Facts
- [ ] Scoring qualité (Nutri-Score, Eco-Score)
- [ ] Recommandations personnalisées

### Phase 4 - Monétisation 💰
- [ ] Panier affilié Greenweez/Awin
- [ ] Tracking des commissions
- [ ] API partenaires marchands
- [ ] Analytics avancées

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Documentation

- [Architecture détaillée](docs/architecture.md)
- [Guide API](docs/api-guide.md) 
- [Déploiement](docs/deployment.md)
- [Contribution](CONTRIBUTING.md)

## 🎨 Design System

**Couleurs principales :**
- Vert VeganFlemme : `#20c997`
- Ivoire : `#f2f4f0`
- Gradients écologiques

**Typographie :**
- Police : Inter (system fallback)
- Responsive design mobile-first
- Composants accessibles (WCAG 2.1)

## 📄 Licence

MIT License - voir [LICENSE](LICENSE) pour plus de détails.

## 🌱 Impact

VeganFlemme s'engage pour une alimentation durable :
- **Réduction CO2** : Chaque menu calcule l'impact carbone évité
- **Transparence** : Sources nutritionnelles scientifiques (ANSES)
- **Accessibilité** : Interface inclusive et multilingue (FR/EN)

---

**✅ VeganFlemme scaffold ready**

*Développé avec 💚 pour une transition vegan réussie*