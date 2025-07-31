# 🤝 Guide Actions Humaines - VeganFlemme

> **Dernière mise à jour :** 31 juillet 2025  
> **État :** Application réorganisée et prête pour phase de monétisation  
> **Progression globale :** 85% complété

---

## ✅ RÉSOLU - Problème de Déploiement TypeScript (31 juillet 2025)

### 🎯 Problème Identifié et Corrigé
Le déploiement échouait sur Render et Vercel à cause d'erreurs TypeScript dans le package `shared` :
- **Fichier manquant** : `packages/shared/tsconfig.json` absent
- **Types incomplets** : Interfaces `Meal`, `Menu`, `UserPreferences` incomplètes  
- **Services manquants** : Dépendances de compilation non satisfaites

### 🔧 Actions Effectuées
```bash
✅ Ajout de tsconfig.json dans packages/shared/
✅ Extension des interfaces TypeScript avec propriétés manquantes
✅ Correction des erreurs de syntaxe dans les composants React
✅ Ajout des services stub manquants (nutritionAnalysis, qualityScorer, swapRecommender)
✅ Installation des dépendances manquantes (react, axios, mathjs, @types/node)
✅ Test de compilation réussi : npm run build --workspace=packages/shared
```

### 🚀 Résultat
- **Build TypeScript** : ✅ Réussi (0 erreurs)
- **Génération dist/** : ✅ Fichiers JS, .d.ts et source maps créés
- **Déploiement** : 🎯 Prêt pour Render et Vercel

---

## 🚨 URGENT - Reconfiguration Déploiements (Suite Restructuration)

### Render - Configuration Backend
```bash
# Status: Configuration mise à jour, redéploiement requis
1. Se connecter à Render Dashboard
   → URL : https://dashboard.render.com
   → Sélectionner service : veganflemme-engine
   
2. Vérifier/Mettre à jour les Build Settings
   → Build Command: cd apps/backend && npm ci --production=false && npm run build
   → Start Command: cd apps/backend && npm start
   → Root Directory: . (racine du repo)
   
3. Déclencher nouveau déploiement
   → Settings → Deploy → "Manual Deploy" from main branch
   → Vérifier logs : "Build succeeded" + API accessible
   → Test santé : https://veganflemme-engine.onrender.com/api/health
```

### Vercel - Configuration Frontend  
```bash
# Status: Root Directory à mettre à jour
1. Se connecter à Vercel Dashboard
   → URL : https://vercel.com/dashboard
   → Sélectionner projet : VeganFlemme-App
   
2. Mettre à jour Project Settings
   → Settings → General → Root Directory
   → Changer de "frontend" vers "apps/frontend"
   → Build Command: npm run build (auto-détecté)
   → Output Directory: .next (auto-détecté)
   
3. Re-déployer depuis dashboard
   → Deployments → "Redeploy" sur dernier commit
   → Vérifier build : "Deployment completed"
   → Test frontend : https://veganflemme.vercel.app
```

### Validation Post-Reconfiguration ✅
```bash
# Tests à effectuer après reconfiguration
1. Backend Render
   → GET https://veganflemme-engine.onrender.com/api/health
   → Réponse attendue : {"status": "ok", "timestamp": "..."}
   
2. Frontend Vercel  
   → Accès https://veganflemme.vercel.app
   → Page d'accueil s'affiche correctement
   → Test génération menu fonctionnel
   
3. Communication Frontend ↔ Backend
   → Depuis frontend : Test appel API génération menu
   → Vérifier dans Network tab : Appels vers render.com réussis
```

---

## 🎯 Actions Immédiates Requises

### 1. **Configuration Services d'Affiliation** 🔥 PRIORITÉ HAUTE

#### Amazon Partenaires (Revenus principaux)
```bash
# Status: Secrets GitHub configurés, candidature à valider
1. Vérifier statut candidature Amazon Partenaires
   → Se connecter à https://partenaires.amazon.fr
   → Vérifier validation du compte
   
2. Tester génération liens affiliés
   → URL : https://veganflemme-engine.onrender.com/api/affiliate/amazon/generate
   → Vérifier IDs d'affiliation dans les liens
   
3. Validation premier achat test
   → Effectuer un achat via lien généré
   → Confirmer tracking commission dans dashboard Amazon
```

#### Greenweez (Niche vegan spécialisée)  
```bash
# Status: Non configuré, contact requis
1. Contact partenariat
   → Email : partenaires@greenweez.com
   → Objet : "Partenariat VeganFlemme - Plateforme transition vegan"
   → Inclure : URL app, métriques, proposition valeur
   
2. Négociation conditions
   → Taux commission (standard 3-6%)
   → Conditions volume/exclusivité
   → Durée engagement
   
3. Configuration technique  
   → Obtenir ID partenaire
   → Ajouter GitHub Secret: GREENWEEZ_AFFILIATE_ID
   → Tester intégration API
```

### 2. **Conformité Légale RGPD** 🚨 OBLIGATOIRE

#### Documents Juridiques Requis
```bash
# Status: Non créés, consultation juridique recommandée
1. Politique de confidentialité RGPD
   → Consultation avocat spécialisé (budget : 500-1500€)
   → Ou utiliser générateur RGPD + validation juridique
   
2. Conditions générales d'utilisation
   → Responsabilités utilisateur/plateforme
   → Utilisation des données nutritionnelles
   → Liens d'affiliation et commissions
   
3. Mentions légales
   → Informations entreprise/responsable
   → Hébergement (Vercel/Render)
   → Contact DPO si applicable
```

#### Implémentation Technique
```bash
# Status: Code à développer
1. Bannière cookies conformité
   → Choix granulaires : Nécessaires/Analytics/Marketing
   → Stockage préférences localStorage
   → Documentation cookies utilisés
   
2. Gestion données utilisateur
   → Export données (format JSON)
   → Suppression compte complet
   → Audit trail des actions
```

### 3. **Monitoring Production** 📊 RECOMMANDÉ

#### Validation Déploiements
```bash
# Status: URLs opérationnelles selon logs du 31/07
1. Test santé services
   → Frontend: https://veganflemme.vercel.app
   → Backend: https://veganflemme-engine.onrender.com/api/health
   
2. Test fonctionnalités critiques
   → Génération menu: POST /api/menu/generate
   → Recherche CIQUAL: GET /api/nutrition/ciqual/search
   → Qualité scoring: POST /api/quality/analyze
   
3. Monitoring métriques
   → Google Analytics 4 (configuré)
   → Uptime monitoring (UptimeRobot recommandé)
   → Erreurs Sentry (optionnel)
```

---

## 📅 Planning Recommandé (Semaines Suivantes)

### Semaine 1 - Monétisation
- [ ] **Amazon Partenaires** : Validation candidature + test achat (2h)
- [ ] **Greenweez Contact** : Email partenariat + suivi réponse (1h)  
- [ ] **RGPD Consultation** : Contact avocat spécialisé + devis (1h)

### Semaine 2 - Conformité
- [ ] **Documents Juridiques** : Rédaction politique confidentialité (4h)
- [ ] **Bannière Cookies** : Implémentation technique (3h)
- [ ] **Tests Intégration** : Validation liens affiliés Amazon (2h)

### Semaine 3 - Optimisation
- [ ] **Monitoring** : Setup UptimeRobot + alertes (1h)
- [ ] **Analytics** : Analyse premiers utilisateurs GA4 (1h)
- [ ] **Contenu** : 1er article blog SEO (4h)

---

## ✅ Critères de Validation

### Amazon Partenaires ✅
- [ ] Candidature approuvée (email confirmation)
- [ ] Lien d'affiliation généré contient votre ID
- [ ] Premier achat test tracké dans dashboard Amazon
- [ ] Commission visible (délai 24-48h)

### RGPD Compliance ✅  
- [ ] Bannière cookies s'affiche premier visit
- [ ] Choix granulaires fonctionnels (accepter/refuser par catégorie)
- [ ] Politique confidentialité accessible depuis toutes les pages
- [ ] Export données utilisateur fonctionnel
- [ ] Suppression compte possible

### Production Monitoring ✅
- [ ] Uptime >99% sur 7 jours (UptimeRobot)
- [ ] Temps réponse API <500ms moyenne
- [ ] 0 erreur critique non résolue
- [ ] Google Analytics tracking visiteurs

---

## 🛠️ Ressources et Contacts

### Services Juridiques RGPD
- **Avocat spécialisé** : Recherche "avocat RGPD [votre ville]"
- **Générateur RGPD** : privacy-policy-generator.info + validation
- **Coût estimé** : 500-1500€ consultation complète

### Outils Monitoring  
- **UptimeRobot** : uptimerobot.com (gratuit 50 monitors)
- **Sentry** : sentry.io (erreurs applicatives)
- **Google Analytics 4** : Déjà configuré ✅

### Plateformes d'Affiliation
- **Amazon Partenaires** : partenaires.amazon.fr
- **Greenweez** : Contact partenaires@greenweez.com
- **AWIN** : awin.com (diversification future)

---

## 🎯 Métriques Succès Phase 2

### Objectifs 30 jours
- [ ] **Monétisation** : Premier euro commission Amazon
- [ ] **Légal** : RGPD compliance 100%
- [ ] **Traffic** : 100+ visiteurs uniques/semaine
- [ ] **Engagement** : 10+ menus générés/jour

### Objectifs 90 jours  
- [ ] **Revenus** : 500€+ commissions mensuelles
- [ ] **Utilisateurs** : 500+ comptes créés
- [ ] **Rétention** : 40%+ utilisateurs actifs J7
- [ ] **Contenu** : 5 articles blog référencés

---

**🌱 Application technique complète → Focus total sur adoption utilisateurs et revenus**

*Prochaine mise à jour guide : Après validation Amazon Partenaires + RGPD compliance*