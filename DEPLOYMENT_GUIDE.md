# 🚀 Guide de Déploiement VeganFlemme

## ✅ Pré-requis Vérifiés

L'application VeganFlemme a été entièrement testée et validée le 1er août 2025 :
- ✅ Build frontend/backend sans erreur
- ✅ 157/164 tests backend passent (95%)
- ✅ API de génération de menu fonctionnelle
- ✅ Configurations de déploiement prêtes

## 🎯 Déploiement Express (30 minutes)

### Étape 1: Déploiement Backend sur Render (10 min)

#### Option A: Via Dashboard Render
1. **Connecter le repo** : https://dashboard.render.com/
2. **Nouveau service** : Web Service
3. **Configuration** :
   - Repository: `VeganFlemme/VeganFlemme-App`
   - Branch: `main`
   - Root Directory: `.` (repository root)
   - Build Command: `cd apps/backend && npm ci --production=false && npm run build`
   - Start Command: `cd apps/backend && npm start`
4. **Variables d'environnement** :
   ```
   NODE_ENV=production
   PORT=3001
   FRONTEND_URL=https://veganflemme.vercel.app
   ```
5. **Déployer** et noter l'URL (ex: `https://veganflemme-engine.onrender.com`)

#### Option B: Via render.yaml (Automatique)
Le fichier `infrastructure/render.yaml` est déjà configuré. Render détectera automatiquement la configuration.

### Étape 2: Déploiement Frontend sur Vercel (10 min)

#### Option A: Via Dashboard Vercel
1. **Importer projet** : https://vercel.com/dashboard
2. **Configuration** :
   - Repository: `VeganFlemme/VeganFlemme-App`
   - Framework: Next.js
   - Root Directory: `apps/frontend`
3. **Variables d'environnement** :
   ```
   NEXT_PUBLIC_API_URL=https://veganflemme-engine.onrender.com/api
   NEXT_PUBLIC_APP_ENV=production
   ```
4. **Déployer** et noter l'URL (ex: `https://veganflemme.vercel.app`)

#### Option B: Via CLI Vercel
```bash
cd apps/frontend
npx vercel --prod
```

### Étape 3: Configuration Supabase PA-API (10 min)

#### Si vous avez un projet Supabase :
```bash
# 1. Installer Supabase CLI
npm install -g supabase

# 2. Login
supabase login

# 3. Déployer la fonction PA-API
supabase functions deploy paapi-proxy --project-ref YOUR_PROJECT_REF

# 4. Configurer les variables d'environnement dans Supabase Dashboard :
# PAAPI_ACCESS_KEY_ID=your-amazon-access-key
# PAAPI_SECRET_ACCESS_KEY=your-amazon-secret-key  
# PAAPI_PARTNER_TAG=your-amazon-associate-tag
# FRONTEND_FUNCTION_SHARED_SECRET=your-secure-secret
```

#### Ajouter dans Vercel :
```
VEGANFLEMME_PAAPI_PROXY_URL=https://YOUR_PROJECT.supabase.co/functions/v1/paapi-proxy
VEGANFLEMME_FUNCTION_SHARED_SECRET=your-secure-secret
```

## 🧪 Validation Post-Déploiement

### Tests Backend
```bash
# Health check
curl https://your-backend-url.onrender.com/api/health

# Menu generation
curl -X POST https://your-backend-url.onrender.com/api/menu/generate \
  -H "Content-Type: application/json" \
  -d '{"people": 2, "budget": "medium", "daysCount": 3}'
```

### Tests Frontend
```bash
# Page d'accueil
curl https://your-frontend-url.vercel.app

# Interface PA-API test
curl https://your-frontend-url.vercel.app/vegan-search-test
```

## 🔧 Configuration Optionnelle

### Domaines Personnalisés
- **Frontend** : `www.veganflemme.com` → Configuration dans Vercel
- **Backend** : `api.veganflemme.com` → Configuration dans Render

### Base de Données Supabase
```sql
-- Exécuter le script dans Supabase SQL Editor
-- Fichier: supabase-schema.sql (déjà prêt)
```

### Amazon Associate Program
1. Candidater sur `affiliate-program.amazon.com`
2. Présenter l'application déployée
3. Attendre approbation (1-3 semaines)
4. Configurer les credentials dans Supabase

## 📊 Métriques de Succès

### Après Déploiement
- **Backend Health** : Status 200 + uptime
- **Frontend Load** : < 2s First Contentful Paint
- **Menu Generation** : < 2s réponse API
- **PA-API Test** : Configuration error (normal sans Amazon)

### Post-Amazon Associate
- **Product Search** : Résultats Amazon dans interface test
- **Affiliate Links** : Links avec associate tag
- **Revenue Tracking** : Commission sur achats

## 🚨 Troubleshooting

### Backend ne démarre pas
- Vérifier les logs Render
- Contrôler `NODE_ENV=production`
- Vérifier build command

### Frontend erreur API
- Vérifier `NEXT_PUBLIC_API_URL`
- Tester endpoint backend directement
- Contrôler CORS configuration

### PA-API erreurs
- Normal sans credentials Amazon
- Vérifier configuration Supabase
- Contrôler variables d'environnement

## ✅ Checklist Final

- [ ] Backend déployé et accessible
- [ ] Frontend déployé et accessible  
- [ ] Variables d'environnement configurées
- [ ] Tests post-déploiement réussis
- [ ] Monitoring configuré (optionnel)
- [ ] Domaines personnalisés (optionnel)
- [ ] Amazon Associate en cours (optionnel)

**🎉 Félicitations ! VeganFlemme est maintenant en production !**