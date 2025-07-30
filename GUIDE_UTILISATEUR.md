# 📋 GUIDE UTILISATEUR - VeganFlemme App
*Guide pas à pas pour les tâches que seul vous pouvez faire*

---

## 🎯 OBJECTIF DE CE GUIDE

Ce guide vous accompagne étape par étape pour toutes les tâches qui nécessitent votre intervention personnelle (créations de comptes, configurations externes, contenu, etc.). 

**🤖 Ce que je gère automatiquement :** Tout le développement, les tests, les déploiements, l'implémentation des fonctionnalités

**👤 Ce que vous devez faire :** Les configurations externes, les contenus, les validations légales, les tests utilisateurs

---

## 📊 STATUT GLOBAL
*Mis à jour automatiquement à chaque session*

### Progression Générale
- ✅ **Phase 0** : Exploration et planification (TERMINÉ)
- 🔄 **Phase 1** : Configuration des services externes (EN COURS)
- ⏳ **Phase 2** : Contenus et design
- ⏳ **Phase 3** : Tests et validation
- ⏳ **Phase 4** : Déploiement production

### Tâches Critiques Bloquantes
- [ ] Configuration base de données production
- [ ] Clés API services externes
- [ ] Contenu légal RGPD

---

## 🚨 TÂCHES URGENTES À FAIRE MAINTENANT

### 1. Configuration Base de Données Production
**Pourquoi c'est urgent :** Nécessaire pour tous les tests et déploiements

**Étapes détaillées :**
1. **Choix du provider** (recommandé : Supabase ou PlanetScale)
   - [ ] Créer compte sur [Supabase](https://supabase.com) OU [PlanetScale](https://planetscale.com)
   - [ ] Créer nouveau projet "VeganFlemme-Prod"
   - [ ] Noter l'URL de connexion fournie

2. **Configuration des variables**
   - [ ] Copier l'URL de connexion dans un fichier sécurisé
   - [ ] Format attendu : `postgresql://user:password@host:port/database`

3. **Me communiquer les infos**
   - [ ] Partager l'URL de base de données (je configurerai le reste)

**Temps estimé :** 15-20 minutes  
**Urgence :** 🔴 CRITIQUE

---

### 2. Configuration Google Analytics 4
**Pourquoi c'est urgent :** Tracking des utilisateurs dès le lancement

**Étapes détaillées :**
1. **Création du compte GA4**
   - [ ] Aller sur [Google Analytics](https://analytics.google.com)
   - [ ] Créer nouvelle propriété "VeganFlemme"
   - [ ] Configurer en tant qu'application web
   - [ ] Noter l'ID de mesure (format : G-XXXXXXXXXX)

2. **Configuration des événements**
   - [ ] Activer les événements améliorés
   - [ ] Configurer les objectifs de conversion :
     - Génération de menu
     - Inscription utilisateur
     - Clic affiliation

3. **Me communiquer les infos**
   - [ ] Partager l'ID de mesure GA4

**Temps estimé :** 10-15 minutes  
**Urgence :** 🟡 IMPORTANT

---

## 📅 PLANNING DÉTAILLÉ PAR PHASE

### PHASE 1 : Services Externes (CETTE SEMAINE)

#### A. Bases de données et infrastructure
- [x] Base de données production (voir section urgente)
- [ ] **Configuration Resend (emails)**
  1. Créer compte sur [Resend](https://resend.com)
  2. Vérifier votre domaine email
  3. Créer clé API
  4. Me communiquer la clé API

- [ ] **Configuration Sentry (monitoring erreurs)**
  1. Créer compte sur [Sentry](https://sentry.io)
  2. Créer projet "VeganFlemme"
  3. Noter le DSN fourni
  4. Me communiquer le DSN

#### B. Services d'affiliation
- [ ] **Amazon Partenaires**
  1. Candidater sur [Amazon Partenaires](https://partenaires.amazon.fr)
  2. Attendre validation (peut prendre 1-7 jours)
  3. Noter l'ID partenaire
  4. Configurer les liens de tracking

- [ ] **Greenweez (si possible)**
  1. Contacter le service affiliés de Greenweez
  2. Négocier les conditions
  3. Obtenir les clés API

**Délai d'approbation :** 1-2 semaines pour les affiliations

---

### PHASE 2 : Contenus et Design (SEMAINE 2-3)

#### A. Assets visuels
- [ ] **Logo final VeganFlemme**
  - Formats : SVG, PNG (différentes tailles)
  - Versions : couleur, noir/blanc, monochrome
  - **Outils suggérés :** Canva Pro, Figma, ou designer freelance

- [ ] **Icônes personnalisées**
  - Icônes métiers (nutrition, environnement, etc.)
  - Style cohérent avec le logo
  - Format SVG optimisé

#### B. Contenu SEO et communication
- [ ] **Articles de blog** (3-5 articles minimum)
  1. "Guide nutrition végane pour débutants"
  2. "Impact environnemental alimentation végétale"
  3. "Planification menus équilibrés vegan"
  4. "Économiser avec une alimentation végane"

- [ ] **FAQ complète**
  - Questions techniques sur l'app
  - Questions nutrition
  - Questions environnement/éthique

#### C. Contenu légal RGPD
- [ ] **Politique de confidentialité**
  - Utiliser un générateur RGPD professionnel
  - Adapter aux fonctionnalités de l'app
  - **Recommandation :** Consultant juridique spécialisé RGPD

- [ ] **Mentions légales**
  - Informations société/auto-entrepreneur
  - Coordonnées complètes
  - Hébergeur et conditions

- [ ] **Conditions d'utilisation**
  - Droits et devoirs des utilisateurs
  - Limitations de responsabilité
  - Politiques d'affiliation

---

### PHASE 3 : Tests et Validation (SEMAINE 4)

#### A. Tests utilisateurs
- [ ] **Recrutement beta-testeurs** (10-15 personnes)
  - Profils variés (débutants/experts vegan)
  - Mix âges et niveaux techniques
  - **Channels :** réseaux sociaux, groupes vegan, entourage

- [ ] **Protocole de test**
  1. Session d'onboarding (15 min)
  2. Génération de premiers menus (20 min)
  3. Navigation dans l'interface (15 min)
  4. Questionnaire feedback (10 min)

- [ ] **Collecte et analyse feedback**
  - Points de friction identifiés
  - Suggestions d'amélioration
  - Bugs reportés

#### B. Validation technique
- [ ] **Test sur différents devices**
  - Smartphones (iOS/Android)
  - Tablettes
  - Ordinateurs (différents navigateurs)

---

### PHASE 4 : Déploiement Production (SEMAINE 5)

#### A. Configuration domaines
- [ ] **Achat nom de domaine** 
  - veganflemme.com ou .fr
  - **Registrars recommandés :** Namecheap, Gandi

- [ ] **Configuration DNS**
  - Pointer vers Vercel (frontend)
  - Pointer vers Render (API)
  - Certificats SSL automatiques

#### B. Variables d'environnement production
- [ ] **Compiler toutes les clés**
  - Base de données
  - Google Analytics
  - Services d'email
  - Clés d'affiliation
  - Clés API externes

- [ ] **Configuration sur Vercel et Render**
  - Variables frontend sur Vercel
  - Variables backend sur Render
  - Test de déploiement

---

## 🔧 AIDE-MÉMOIRE TECHNIQUE

### Formats de clés attendus
```bash
# Base de données
DATABASE_URL="postgresql://username:password@host:port/database"

# Google Analytics
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"

# Resend (emails)
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# Sentry
SENTRY_DSN="https://xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx@sentry.io/xxxxxxx"
```

### Checklist validation avant déploiement
- [ ] Tous les services externes configurés
- [ ] Tests utilisateurs réalisés et feedback intégré
- [ ] Contenu légal validé juridiquement
- [ ] Variables d'environnement testées
- [ ] Domaine configuré et fonctionnel
- [ ] Monitoring et analytics actifs

---

## 📞 SUPPORT ET COMMUNICATION

### Comment me tenir informé
- ✅ **Terminé :** Cochez les tâches accomplies
- 🔄 **En cours :** Indiquez les tâches commencées
- ❌ **Bloqué :** Signalez les difficultés rencontrées

### Informations à me communiquer
1. **Clés API :** Format sécurisé (jamais en plain text public)
2. **Progression :** Mettez à jour les statuts dans ce guide
3. **Problèmes :** Décrivez les blocages rencontrés
4. **Délais :** Prévenez des retards de validation (ex: affiliations)

---

## 📈 MÉTRIQUES DE SUCCÈS

### Objectifs Phase 1
- [ ] Tous les services externes configurés
- [ ] Base de données production opérationnelle
- [ ] Analytics et monitoring actifs

### Objectifs Phase 2
- [ ] Assets visuels professionnels créés
- [ ] 5+ articles de blog publiés
- [ ] Contenu légal RGPD validé

### Objectifs Phase 3
- [ ] 15+ beta-testeurs recrutés
- [ ] Feedback utilisateurs collecté et analysé
- [ ] Interface optimisée selon retours

### Objectifs Phase 4
- [ ] Domaine configuré et SSL actif
- [ ] Déploiement production stable
- [ ] Toutes les intégrations fonctionnelles

---

*🤖 Ce guide est automatiquement mis à jour à chaque session pour refléter l'avancement du projet et vous guider sur les prochaines étapes prioritaires.*

---

**Dernière mise à jour :** 2025-07-30 | **Prochaine révision :** Après completion Phase 1