# 🚀 Guide de Déploiement VeganFlemme App

Ce guide détaille la configuration complète pour déployer l'application VeganFlemme sur Vercel (frontend) et Render (backend).

## 📋 Prérequis

- Compte [Vercel](https://vercel.com) (frontend)
- Compte [Render](https://render.com) (backend)
- Repository GitHub configuré avec les workflows CI/CD
- Variables d'environnement configurées

---

## 🎨 Frontend - Déploiement Vercel

### 1. Configuration Initiale

1. **Connecter le Repository**
   - Aller sur [Vercel Dashboard](https://vercel.com/dashboard)
   - Cliquer sur "New Project"
   - Importer le repository `VeganFlemme/VeganFlemme-App`
   - Sélectionner le framework "Next.js"

2. **Configuration du Build**
   ```bash
   Framework Preset: Next.js
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

### 2. Variables d'Environnement Vercel

Dans les **Project Settings > Environment Variables**, ajouter :

#### Production
```env
NEXT_PUBLIC_API_URL=https://veganflemme-engine.onrender.com/api
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_CART_BUILDER=true
NEXT_PUBLIC_ENABLE_AFFILIATE_LINKS=true
NEXT_PUBLIC_PWA_ENABLED=true
NEXT_PUBLIC_APP_NAME=VeganFlemme
NEXT_PUBLIC_APP_SHORT_NAME=VeganFlemme
NEXT_PUBLIC_APP_DESCRIPTION=Votre transition vegan simplifiée
```

#### Preview/Development (optionnel)
```env
NEXT_PUBLIC_API_URL=https://veganflemme-engine-dev.onrender.com/api
NEXT_PUBLIC_APP_ENV=preview
NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

### 3. Configuration des Domaines

1. **Domaine principal** : `veganflemme.com` ou `veganflemme.vercel.app`
2. **Domaine de prévisualisation** : `preview-veganflemme.vercel.app`

### 4. Déploiement Automatique via GitHub Actions

Le fichier `.github/workflows/frontend.yml` gère automatiquement :
- ✅ Tests et linting sur chaque PR
- ✅ Build de validation
- ✅ Déploiement automatique sur `main`

**Secrets GitHub requis :**
```bash
VERCEL_TOKEN=<votre_token_vercel>
VERCEL_ORG_ID=<votre_org_id>
VERCEL_PROJECT_ID=<votre_project_id>
```

---

## ⚙️ Backend - Déploiement Render

### 1. Configuration Initiale

1. **Créer un Web Service**
   - Aller sur [Render Dashboard](https://dashboard.render.com)
   - Cliquer "New +" → "Web Service"
   - Connecter le repository `VeganFlemme/VeganFlemme-App`

2. **Configuration du Service**
   ```bash
   Name: veganflemme-engine
   Environment: Node
   Region: Frankfurt (EU) ou Oregon (US)
   Branch: main
   Root Directory: (laissez vide - doit pointer vers la racine du repository)
   Build Command: cd engine && npm run build:render
   Start Command: cd engine && npm start
   ```

   ⚠️ **IMPORTANT**: Le "Root Directory" doit être vide (racine du repository), pas "engine".
   Si vous mettez "engine" comme Root Directory, la commande "cd engine" échouera.

### 2. Variables d'Environnement Render

Dans **Environment Variables** :

#### Production
```env
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://veganflemme.vercel.app
LOG_LEVEL=info

# Fonctionnalités
ENABLE_MENU_GENERATION=true
ENABLE_CART_BUILDER=true
ENABLE_ANALYTICS=true

# Base de données (quand implémentée)
# DATABASE_URL=postgresql://user:pass@hostname:5432/veganflemme
# REDIS_URL=redis://hostname:6379

# APIs externes (quand implémentées)
# CIQUAL_API_KEY=your_ciqual_api_key
# OPENFOODFACTS_API_KEY=your_openfoodfacts_key

# Sécurité
# JWT_SECRET=your_jwt_secret_key_here
# ENCRYPTION_KEY=your_encryption_key_here

# Limitations
# RATE_LIMIT_WINDOW_MS=900000
# RATE_LIMIT_MAX_REQUESTS=100
```

### 3. Configuration des Ressources

```bash
Plan: Starter (gratuit) → Hobby ($7/mois) pour la production
CPU: 0.5 CPU
RAM: 512 MB
Stockage: 1 GB SSD
Auto-scaling: activé
Health checks: /api/health
```

### 4. Déploiement Automatique via GitHub Actions

Le fichier `.github/workflows/engine.yml` gère automatiquement :
- ✅ Tests et linting sur chaque PR
- ✅ Build TypeScript
- ✅ Test du endpoint health
- ✅ Déploiement automatique sur `main`

**Secrets GitHub requis :**
```bash
RENDER_API_KEY=<votre_api_key_render>
RENDER_SERVICE_ID=<votre_service_id>
```

---

## 🔄 Configuration CI/CD

### GitHub Secrets à Configurer

Dans **Repository Settings > Secrets and Variables > Actions** :

```bash
# Vercel (Frontend)
VERCEL_TOKEN=<token_from_vercel_account>
VERCEL_ORG_ID=<org_id_from_vercel>
VERCEL_PROJECT_ID=<project_id_from_vercel>

# Render (Backend)
RENDER_API_KEY=<api_key_from_render_account>
RENDER_SERVICE_ID=<service_id_from_render>
```

### Workflow de Déploiement

1. **Push sur `main`** → Tests → Build → Déploiement automatique
2. **Pull Request** → Tests et validation uniquement
3. **Rollback** → Utiliser l'interface Vercel/Render

---

## 🌐 Configuration DNS (Domaine personnalisé)

### Pour Vercel (Frontend)
1. Ajouter le domaine dans Vercel
2. Configurer les enregistrements DNS :
   ```dns
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   
   Type: CNAME  
   Name: www
   Value: cname.vercel-dns.com
   ```

### Pour Render (Backend)
1. Ajouter le domaine personnalisé dans Render
2. Configurer l'enregistrement DNS :
   ```dns
   Type: CNAME
   Name: api
   Value: veganflemme-engine.onrender.com
   ```

---

## 📊 Monitoring et Santé

### Endpoints de Monitoring

```bash
# Health check basique
GET https://veganflemme-engine.onrender.com/api/health

# Health check détaillé  
GET https://veganflemme-engine.onrender.com/api/health/detailed
```

### Métriques Surveillées

- **Response Time** : < 2s
- **Error Rate** : < 1%
- **Uptime** : > 99.5%
- **Memory Usage** : < 80%

---

## 🔧 Dépannage

### Problèmes Courants

#### Frontend (Vercel)
```bash
# Build failed
- Vérifier les variables d'environnement
- Vérifier les dépendances dans package.json
- Consulter les logs Vercel

# API calls failed
- Vérifier NEXT_PUBLIC_API_URL
- Vérifier que le backend est en ligne
```

#### Backend (Render)
```bash
# Build failed: "cd: engine: No such file or directory"
- Vérifier que Root Directory est vide (racine du repo)
- NE PAS mettre "engine" dans Root Directory
- La commande build doit être: cd engine && npm run build:render
- Vérifier que render.yaml est utilisé correctement

# Service won't start
- Vérifier PORT=3001 dans les variables
- Vérifier les logs Render
- Tester en local avec npm start

# Database connection issues
- Vérifier DATABASE_URL
- Vérifier les credentials de base
```

### Logs et Debug

```bash
# Vercel logs
npx vercel logs [deployment-url]

# Render logs  
Dashboard > Service > Logs tab

# Local testing
cd frontend && npm run dev
cd engine && npm run dev
```

---

## 🚀 Checklist de Déploiement

### Avant le Déploiement
- [ ] Tests passent en local (`npm test`)
- [ ] Build réussit en local (`npm run build`)
- [ ] Variables d'environnement configurées
- [ ] Secrets GitHub configurés

### Déploiement
- [ ] Push sur `main` effectué
- [ ] CI/CD workflows réussis
- [ ] Frontend accessible sur Vercel
- [ ] Backend accessible sur Render
- [ ] API health check répond 200

### Après le Déploiement
- [ ] Tests end-to-end effectués
- [ ] Monitoring activé
- [ ] DNS configuré (si domaine personnalisé)
- [ ] Performance vérifiée
- [ ] Backup configuré

---

## 📞 Support

En cas de problème :
1. Consulter les logs Vercel/Render
2. Vérifier les variables d'environnement
3. Tester les endpoints manuellement
4. Consulter la documentation des plateformes

**Liens utiles :**
- [Documentation Vercel](https://vercel.com/docs)
- [Documentation Render](https://render.com/docs)
- [Documentation Next.js](https://nextjs.org/docs)

---

✅ **VeganFlemme déployé et prêt à révolutionner la nutrition vegan !** 🌱