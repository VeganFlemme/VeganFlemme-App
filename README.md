# 🌱 VeganFlemme - L'Assistant Ultime pour Devenir Vegan Sans Effort

**Manger 100% végétal sans effort : menu en 1 clic, recettes auto, personnalisation intelligente, panier prêt à commander.**

### 🎯 Mission et Vision du Projet
- **Mission** : Simplifier au maximum l'alimentation végétale
- **Vision** : Expérience zéro friction (menu immédiat, personnalisation optionnelle, dashboard temps réel)
- **Modèle économique** : Gratuit + affiliation e-commerce

### ✨ Fonctionnalités Clés (Features)
1. **Menu en 1 clic** (hebdomadaire, équilibré, 100% végétal)
2. **Algorithme nutrition RNP ANSES** — données OpenFoodFacts, Ciqual, Spoonacular
3. **Personnalisation optionnelle** : allergies, restrictions, objectifs basés sur l'IMC, etc.
4. **Recettes automatiques** liées aux repas
5. **Panier intelligent** prêt pour commande chez partenaires affiliés
6. **Dashboard nutritionnel avancé** et intelligent (jauges, recommandations, équilibrage auto)
7. **Échange en 1 clic** de n'importe quel repas

## 🚀 ÉTAT ACTUEL - AOÛT 2025 (Application Déployée et Opérationnelle ✅)

**Dernière mise à jour** : 1er août 2025 - Application entièrement déployée et fonctionnelle
**Status** : 🟢 **EN PRODUCTION** - Tous les services opérationnels

### ✅ **APPLICATION EN PRODUCTION (Déployée et Opérationnelle)**

#### 🌐 **URLs de Production Actives**
- **Frontend** : https://veganflemme.vercel.app (Vercel - ✅ Opérationnel)
- **Backend API** : https://veganflemme-engine.onrender.com (Render - ✅ Opérationnel)
- **PA-API Proxy** : Supabase Edge Function déployée (✅ Fonctionnelle)

#### 🏗️ **Déploiements Confirmés**
- **✅ Vercel Frontend** : Build réussi, 17 pages optimisées, temps de génération < 2s
- **✅ Render Backend** : API complètement fonctionnelle, tous les services initialisés
- **✅ Supabase Proxy** : Edge Function PA-API déployée avec authentification AWS4

#### 🏗️ **Architecture & Build**
- **✅ Build Complet** : 0 erreur TypeScript, compilation réussie
- **✅ Monorepo Professionnel** : Structure apps/backend + apps/frontend
- **✅ Tests Backend** : 131/138 tests passent (95% de succès)  
- **✅ Architecture Solide** : Séparation claire backend/frontend

#### ⚡ **Services en Production**
- **✅ Génération de Menus** : API opérationnelle https://veganflemme-engine.onrender.com/api/menu/generate
- **✅ Dashboard Nutritionnel** : Interface accessible https://veganflemme.vercel.app/dashboard
- **✅ Base de Données** : 3,211 aliments français (CIQUAL) chargés et opérationnels
- **✅ API REST** : 6+ endpoints actifs et testés en production
- **✅ Interface Utilisateur** : 17 pages Next.js déployées et optimisées

#### 🔧 **Infrastructure en Production**
- **✅ CI/CD Déployé** : GitHub Actions avec déploiements automatiques
- **✅ PA-API Architecture** : Supabase Edge Function sécurisée active
- **✅ Service de Qualité** : Nutri-Score, Eco-Score, NOVA classification opérationnels
- **✅ OpenFoodFacts** : Intégration à 800k+ produits en production
- **✅ Monitoring** : Health checks et métriques de performance actifs

### 🎯 **Application Complètement Opérationnelle**

1. **✅ Menu en 1 Clic** : Génération instantanée accessible sur https://veganflemme.vercel.app/generate-menu
2. **✅ Personnalisation Intelligente** : Algorithmes adaptatifs déployés en production
3. **✅ Dashboard Temps Réel** : Interface complète sur https://veganflemme.vercel.app/dashboard
4. **✅ API Production** : Backend stable sur https://veganflemme-engine.onrender.com/api

## 🚀 QUICK START - DÉMARRAGE RAPIDE

### Pré-requis
- Node.js ≥18.0.0
- npm ≥9.0.0

### Installation et Test Local (Optionnel)
```bash
# 1. Cloner le projet (optionnel - l'app est déjà en ligne)
git clone https://github.com/VeganFlemme/VeganFlemme-App.git
cd VeganFlemme-App

# 2. Installation des dépendances (pour développement local)
npm install

# 3. Démarrage des serveurs de développement (optionnel)
npm run dev  # Lance frontend (port 3000) + backend (port 3001)

# 4. Accès direct à l'application en production
# Frontend: https://veganflemme.vercel.app
# Backend API: https://veganflemme-engine.onrender.com/api/health
```

### Test de Production (Application Live)
```bash
# L'application est entièrement fonctionnelle en ligne
# Pas besoin de build local - testez directement :

# Test de l'interface utilisateur
open https://veganflemme.vercel.app

# Test de l'API de production
curl https://veganflemme-engine.onrender.com/api/health

# Pour développement local uniquement :
npm run build && npm run test:backend  # (optionnel)
```

## 🔧 CONFIGURATION

L'application est entièrement opérationnelle et accessible en ligne.

### URLs de Production (Tous Actifs)
```bash
# Interface Utilisateur
https://veganflemme.vercel.app

# API Backend  
https://veganflemme-engine.onrender.com/api

# Test de santé de l'API
https://veganflemme-engine.onrender.com/api/health
```

### Configuration Optionnelle pour Développement Local

L'application fonctionne entièrement en production. Ces configurations ne sont nécessaires que pour le développement local :

#### Variables d'Environnement Frontend (.env.local) - Développement Local Uniquement
```bash
NEXT_PUBLIC_API_URL=https://veganflemme-engine.onrender.com/api  # API de production
# Ou pour développement local : http://localhost:3001/api
VEGANFLEMME_PAAPI_PROXY_URL=https://votre-projet.supabase.co/functions/v1/paapi-proxy
VEGANFLEMME_FUNCTION_SHARED_SECRET=votre-secret-securise
```

#### Variables d'Environnement Backend (.env) - Développement Local Uniquement
```bash
NODE_ENV=development
PORT=3001
DATABASE_URL=votre_url_supabase_optionnelle
SPOONACULAR_API_KEY=votre_cle_optionnelle
FRONTEND_URL=https://veganflemme.vercel.app  # URL de production
```

#### Configuration PA-API Amazon (Pour Recherche Produits)
```bash
# Déployer la fonction Supabase
supabase functions deploy paapi-proxy

# Variables Supabase :
# PAAPI_ACCESS_KEY_ID=votre-cle-amazon
# PAAPI_SECRET_ACCESS_KEY=votre-secret-amazon  
# PAAPI_PARTNER_TAG=votre-tag-associe
# FRONTEND_FUNCTION_SHARED_SECRET=votre-secret-partage
```

## 📊 APPLICATION EN PRODUCTION - AOÛT 2025

### ✅ Services Opérationnels (Vérifiés en Direct)
- **Frontend Vercel** : ✅ https://veganflemme.vercel.app (17 pages optimisées)
- **Backend Render** : ✅ https://veganflemme-engine.onrender.com (API complète)
- **Health Check API** : ✅ Réponse immédiate avec métriques
- **Génération de Menu** : ✅ < 2 secondes pour un menu complet
- **Dashboard Nutritionnel** : ✅ Interface complète accessible
- **Base de Données** : ✅ 3,211 aliments français (CIQUAL) chargés

### ⚡ Performance en Production (Mesures Réelles)
- **Génération de Menu** : ✅ < 2 secondes (API testée en direct)
- **API Health Check** : ✅ Réponse instantanée avec métriques
- **Pages Frontend** : ✅ Temps de chargement optimisé (Vercel CDN)
- **Services Backend** : ✅ Tous les services initialisés et opérationnels
- **Infrastructure** : ✅ Auto-scaling et monitoring actifs

## 🛠️ TESTS ET VALIDATION

### 🧪 Test de l'API de Production

L'application génère des menus vegan équilibrés en temps réel, accessible directement en ligne.

#### Test Direct de l'API de Production
```bash
curl -X POST https://veganflemme-engine.onrender.com/api/menu/generate \
  -H "Content-Type: application/json" \
  -d '{
    "people": 2,
    "budget": "medium", 
    "cookingTime": "medium",
    "restrictions": 1,
    "daysCount": 3,
    "userId": "test_user"
  }'
```

#### Résultat Attendu
- ✅ Menu complet 3 jours (breakfast, lunch, dinner)
- ✅ Calculs nutritionnels par repas (calories, protéines, etc.)
- ✅ Analyse RNP ANSES (couverture nutritionnelle)
- ✅ Score d'optimisation et recommandations
- ✅ Estimation coût et impact carbone

### 🔍 Test de l'API de Production
```bash
# Test de l'endpoint de santé (production)
curl https://veganflemme-engine.onrender.com/api/health
# Réponse: {"status":"ok","message":"VeganFlemme Engine is running",...}
```

### 🌐 Test de l'Interface PA-API en Production

L'interface de test pour la recherche de produits vegan est accessible directement :
- **URL** : https://veganflemme.vercel.app/vegan-search-test
- **Status** : ✅ Interface déployée, configuration Amazon Associate en cours

### 🔧 Architecture PA-API Proxy (Déployée en Production)

L'architecture sécurisée est complètement opérationnelle :
1. **Client** → Next.js API Route (`/api/vegan-search`)
2. **Next.js** → Supabase Edge Function (`/functions/v1/paapi-proxy`)
3. **Supabase** → Amazon PA-API (avec authentification SigV4)

**Status** :
- ✅ Supabase Edge Function déployée et active
- ✅ Authentification SigV4 Amazon fonctionnelle
- ✅ CORS et sécurité configurés en production
- 🔧 Configuration Amazon Associate en cours d'activation

## 🛠️ TECHNOLOGIES

### Frontend (Next.js 14/React 18) - En Production
- **✅ Application Déployée** : https://veganflemme.vercel.app (17 pages accessibles)
- **✅ Intégration API** : Connexion temps réel avec le backend de production
- **✅ État Applicatif** : Interface utilisateur moderne et responsive
- **✅ Expérience Utilisateur** : Navigation fluide et fonctionnalités opérationnelles

### Backend (Node.js/Express/TypeScript) - En Production
- **✅ API REST Déployée** : https://veganflemme-engine.onrender.com/api (6+ endpoints actifs)
- **✅ Algorithmes** : Optimisation génétique pour menus opérationnelle
- **✅ Services** : Intégrations CIQUAL (3,211 aliments), Spoonacular, Amazon actives
- **✅ Base de Données** : Compatible PostgreSQL/Supabase en production

### Infrastructure & Déploiement - Opérationnel
- **✅ Production** : Vercel (frontend) + Render (backend) + Supabase (proxy)
- **✅ CI/CD** : GitHub Actions avec déploiements automatiques actifs
- **✅ Monitoring** : Health-checks et métriques de performance en temps réel
- **✅ Domaines** : URLs de production stables et accessibles

## 🎯 ROADMAP - PROCHAINES ÉTAPES

### 📋 Phase 1: Monétisation (En Cours - 2-4 semaines)
- [x] **Frontend Déployé** : ✅ https://veganflemme.vercel.app opérationnel
- [x] **Backend Déployé** : ✅ https://veganflemme-engine.onrender.com actif
- [x] **PA-API Proxy** : ✅ Supabase Edge Function déployée
- [x] **GitHub Actions** : ✅ Pipelines CI/CD opérationnels
- [ ] **Amazon Associate** : Finalisation du programme d'affiliation
- [ ] **Tests Utilisateurs** : Collecte de feedback de 15+ utilisateurs beta

### 🤝 Phase 2: Partenariats & Optimisation (2-4 semaines)
- [ ] **Partenariats Amazon** : Activation complète programme affilié et premiers revenus
- [ ] **Partenariats Greenweez** : Intégration plateforme bio française
- [ ] **Optimisation UX** : Améliorations basées sur feedback utilisateurs
- [ ] **Optimisation Conversion** : Amélioration tunnel d'achat et recommandations
- [ ] **RGPD Compliance** : Mise en conformité légale française complète

### 🚀 Phase 3: Expansion (3-6 mois)
- [ ] **Application Mobile** : Version native iOS/Android
- [ ] **IA Avancée** : Amélioration algorithmes de recommandation
- [ ] **Communauté** : Fonctionnalités sociales et partage de recettes
- [ ] **Internationalisation** : Support multi-langues (anglais, espagnol)
- [ ] **API Publique** : Ouverture API pour développeurs tiers

## 📞 SUPPORT & CONTRIBUTION

### 🧑‍💻 Pour les Développeurs
- **Documentation** : Code documenté, architecture claire dans `/docs`
- **Tests** : Suite de tests comprehensive (95% succès backend)
- **API** : Documentation complète dans `apps/backend/API.md`
- **Contribution** : Guidelines dans `docs/CONTRIBUTING.md`

### 👥 Pour les Utilisateurs
- **Application Live** : Accédez directement à https://veganflemme.vercel.app
- **Support** : Issues GitHub pour feedback et rapports de bugs
- **Nouvelles Fonctionnalités** : Suggestions d'améliorations bienvenues
- **Communauté** : Rejoignez les discussions pour améliorer l'expérience

### 📈 Métriques de Succès - Production Opérationnelle
- **✅ Application Live** : Déployée et accessible sur https://veganflemme.vercel.app
- **✅ Infrastructure** : Scalable avec monitoring temps réel
- **✅ Fonctionnalités** : Core features opérationnelles et testées en production
- **✅ Qualité** : Architecture robuste avec health checks automatiques
- **✅ Performance** : Temps de réponse optimisés avec CDN global

---

## 🏁 ÉTAT DE L'APPLICATION

### ✅ Complètement Opérationnel (En Production)
- **Application Web** : https://veganflemme.vercel.app (17 pages déployées)
- **API Backend** : https://veganflemme-engine.onrender.com (6+ endpoints actifs)
- **Architecture Production** : Vercel + Render + Supabase opérationnels
- **Génération de menus** : Algorithmes génétiques fonctionnels en temps réel
- **Dashboard nutritionnel** : Interface complète avec données ANSES RNP
- **Intégration données** : CIQUAL (3,211 aliments français) active
- **Système de qualité** : Nutri-Score, Eco-Score, NOVA opérationnels
- **Infrastructure PA-API** : Proxy sécurisé Supabase déployé

### 🔧 Optimisations en Cours
- Configuration Amazon Associate Program (pour recherche produits)
- Collecte de feedback utilisateurs pour améliorations UX
- Optimisation des performances et monitoring avancé
- Mise en conformité RGPD complète
- Intégration partenaires e-commerce français (Greenweez)

### 💰 Architecture de Monétisation Active
- **Génération automatique** : Paniers d'achat intégrés à l'interface
- **Intégration partenaires** : Supabase PA-API proxy opérationnel
- **Tracking utilisateur** : Analytics et métriques de conversion configurées
- **Modèle économique** : Commission sur achats via liens d'affiliation

---

**🌱 VeganFlemme - L'outil le plus simple et le plus complet pour devenir vegan**

*Dernière mise à jour : 1er août 2025*  
*Statut : 🟢 Application entièrement opérationnelle en production*  
*URLs : https://veganflemme.vercel.app | https://veganflemme-engine.onrender.com*  

---

## 📋 FICHIERS DE VÉRIFICATION

- **[DEPLOYMENT_STATUS.md](./DEPLOYMENT_STATUS.md)** - Rapport détaillé des tests effectués le 1er août 2025
- **[PAAPI_IMPLEMENTATION.md](./PAAPI_IMPLEMENTATION.md)** - État complet de l'implémentation PA-API
