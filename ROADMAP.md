# VeganFlemme-App — Roadmap & Spécification Fonctionnelle

Ce document centralise toutes les fonctionnalités à implémenter pour transformer VeganFlemme en une application complète, conforme à la proposition de valeur et au plan initial. Il sert de référence pour tout contributeur, agent ou développeur sur le projet.

---

## 🐳 Infrastructure & Développement

### ✅ Migration Docker (TERMINÉE)
- [x] **Architecture Docker complète** : Frontend, Backend, PostgreSQL
- [x] **Scripts de gestion** : start.sh, stop.sh, logs.sh, reset.sh
- [x] **Environnement unifié** : Dev/Test/Prod identiques
- [x] **Base de données locale** : PostgreSQL avec schema automatique
- [x] **Documentation** : Guide de migration Docker complet
- [x] **Onboarding simplifié** : Setup en 2 commandes

**Impact** : Onboarding développeurs de 3h → 15 minutes, environnement cohérent garanti.

---

## Proposition de valeur : résumé opérationnel

- Menus 100% personnalisés et sans carence (macro & micro-nutriments, optimisation multi-objectif)
- Qualité & éthique contrôlées (Bio, Nutri-Score, Yuka, Eco-Score, origine, empreinte carbone/eau)
- Substitutions intelligentes
- Dashboard temps réel (jauges, alertes, suivi)
- Recettes prêtes à l’emploi (multi-niveaux, batch cooking, substitutions, fiches)
- Liste de courses connectée (panier, API marchands, affiliation)
- UX frictionless (onboarding, auto-menu, cloud, offline)
- Engagement & rétention (newsletter, notifications, badges, partage social)
- Monétisation (affiliation, upsell, marketplace)
- Éthique & impact (open source, transparence, RGPD, dons sanctuaires)

---

## Modules à implémenter

### 1. UserProfile Service
- Création et gestion du profil utilisateur (âge, sexe, taille, poids, activité, objectifs, allergies, goûts, niveau cuisine, équipement)
- Calcul IMC & TDEE (Total Daily Energy Expenditure)
- Onboarding multi-écrans et sauvegarde cloud

### 2. NutritionEngine
- Optimisation multi-objectif des menus (RNP complets, budget, variété, contraintes gustatives)
- Intégration données CIQUAL / Open Food Facts (macro, micro, labels qualité)
- Génération automatique de menus hebdo via solveur (ex: Google OR-Tools)

### 3. QualityScorer
- Calcul Nutri-Score, Yuka, Eco-Score, Bio, score ultra-transformés pour chaque aliment/repas
- Affichage des labels qualité sur les ingrédients et menus

### 4. SwapRecommender
- Système de substitutions nutritionnelles intelligentes (ex: tofu → tempeh)
- Recalcul instantané des apports et jauges lors d’une substitution

### 5. CartBuilder
- Génération automatique de la liste de courses selon menus choisis (quantités ajustées)
- Mapping EAN ↔ marchands, stratégie fallback (Greenweez, Amazon, etc.)
- Agrégation en packs pour réduire le coût
- Génération liens affiliés dynamiques et suivi des commissions

### 6. Analytics & Insight
- Intégration GA4 (Google Analytics), suivi des événements clés (menu généré, achat, clic panier)
- Dashboard analytique (évolution poids, IMC, apports, alertes déficit)
- Badges, gamification, alertes personnalisées

### 7. ContentGenerator
- Génération de contenus SEO (articles, FAQ, guides) en MDX
- Templates pour réseaux sociaux (carrousel nutrition, batch cooking, recettes à partager)

### 8. AffiliateTracker
- Tableau de bord suivi des commissions affiliées, intégration webhooks post-back
- Statistiques revenus, MRR, reversement 1% sanctuaires animaliers

### 9. Real-Time Dashboard & UX
- Jauges radiales % RNP (macro, micro, fibres, calories), alertes, suggestions correctives
- Graphes évolution 7/30j (poids, IMC, B12…)
- Onboarding 3 étapes, auto-menu "je suis flemmard", multi-appareils, mode offline (Service Worker)
- Recettes multi-niveaux, batch cooking, timers, substitutions, couverts variables

### 10. Engagement & Rétention
- Newsletter hebdo “Menu de la semaine” (Resend)
- Notifications promo panier, badges, partage social, carrousels IG
- Upsell e-book, coaching, marketplace (cours cuisine, diététique)

### 11. Éthique & RGPD
- Open source partiel (algorithme optimisation)
- Transparence et conformité RGPD (bannière cookies, opt-in/opt-out)
- Reversement 1% commissions à des sanctuaires animaliers

---

## Priorités de développement (ordre conseillé)

1. **UserProfile Service** (base utilisateurs, onboarding, calcul TDEE/IMC)
2. **NutritionEngine** + **QualityScorer** (génération menus, calculs nutritionnels)
3. **SwapRecommender** (substitutions intelligentes)
4. **CartBuilder** (liste de courses, API marchands, affiliation)
5. **Real-Time Dashboard** (jauges, alertes, graphes)
6. **ContentGenerator** (SEO, social)
7. **AffiliateTracker** + **Analytics & Insight**
8. **Engagement/Rétention** (newsletter, notifications, gamification)
9. **Ethique & RGPD**

---

## Notes techniques

- **Stack recommandée** : Next.js (App Router) + TypeScript + Prisma/PostgreSQL + Tailwind + NextAuth + API REST/GraphQL
- **Tests** : Unitaire (Jest), e2e (Playwright/Cypress)
- **CI/CD** : Vercel, GitHub Actions
- **Ouverture/bug** : Créer une issue GitHub par bloc fonctionnel ou bug

---

## Pour contribuer

- Se référer à ce document pour toute nouvelle PR ou ajout majeur.
- Respecter la modularité (un dossier/service par module).
- Documenter chaque module dans un README dédié si besoin.
- Utiliser des issues/projets GitHub pour suivre l’état d’avancement.

---

*Ce fichier ROADMAP.md doit toujours rester à jour et servir d’unique source de vérité pour l’implémentation du projet !*
