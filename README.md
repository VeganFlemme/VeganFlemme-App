# VeganFlemme - Le Moteur de Menus Vegan Intelligents

VeganFlemme est une web-app conçue pour simplifier radicalement la transition vers une alimentation 100% végétale. Elle génère des plans de repas personnalisés qui respectent les apports nutritionnels recommandés (RNP ANSES), tout en s'adaptant à vos goûts, votre budget et votre temps.

## ✨ Vision du Projet

-   **Menus Personnalisés :** Génération de menus sur-mesure basés sur le profil utilisateur (âge, objectifs, allergies, etc.).
-   **Qualité & Éthique :** Prise en compte du Nutri-Score, Eco-Score, et de l'origine des produits.
-   **Panier Intelligent :** Création d'une liste de courses optimisée avec des liens d'affiliation (Greenweez, etc.).

## 🚀 Structure du Monorepo

Ce projet utilise [pnpm workspaces](https://pnpm.io/workspaces) pour gérer plusieurs applications et packages au sein d'un seul dépôt.

-   `apps/` : Contient les applications principales.
    -   `engine` : Le backend Node.js (API REST avec Fastify).
    -   `frontend` : L'interface utilisateur (Web-app Next.js).
-   `packages/` : Contient le code et les configurations partagés.
    -   `eslint-config-custom` : Configuration ESLint partagée.
    -   `tsconfig-custom` : Fichiers `tsconfig.json` de base partagés.

## 📦 Installation

1.  Assurez-vous d'avoir installé [pnpm](https://pnpm.io/installation).
2.  Installez les dépendances à la racine du projet :
    ```bash
    pnpm install
    ```

## 🛠️ Commandes Utiles

-   **Lancer le développement (frontend + backend) :**
    ```bash
    pnpm dev
    ```
-   **Lancer le linting sur tout le projet :**
    ```bash
    pnpm lint
    ```
-   **Construire toutes les applications pour la production :**
    ```bash
    pnpm build
    ```

## ☁️ Stratégie de Déploiement

-   **Frontend (`apps/frontend`) :** Déploiement continu sur [Vercel](https://vercel.com/). Vercel est optimisé pour les applications Next.js et détectera automatiquement la configuration.
-   **Backend (`apps/engine`) :** Déploiement continu sur [Render](https://render.com/). Le backend sera configuré comme un "Web Service" et utilisera un fichier `render.yaml` pour l'infrastructure-as-code.