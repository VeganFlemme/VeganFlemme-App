# ===================================================================
# 🐳 VeganFlemme Engine - Backend Dockerfile  
# ===================================================================
# Multi-stage build pour optimiser la taille de l'image de production
# Architecture: Node.js 18 + Express + TypeScript
# Ports: 3001 (API), Health check: /api/health
# ===================================================================

# ===================================================================
# 📦 STAGE 1: Build Stage - Compilation TypeScript
# ===================================================================
FROM node:18-alpine AS builder

# Métadonnées de l'image
LABEL maintainer="VeganFlemme Team"
LABEL version="1.0.0"
LABEL description="VeganFlemme API Engine - Nutrition and menu generation backend"

# Définir le répertoire de travail
WORKDIR /app

# Note: Dépendances système généralement pas nécessaires pour ce projet
# Décommentez si des packages natifs sont requis :
# RUN apk add --no-cache git python3 make g++

# Copier les fichiers de configuration package
COPY package*.json ./
COPY tsconfig*.json ./

# Installer TOUTES les dépendances (dev + prod) pour le build
RUN npm ci --production=false

# Copier le code source
COPY src/ ./src/
COPY scripts/ ./scripts/

# Compiler TypeScript en utilisant le binaire local
RUN ./node_modules/.bin/tsc

# ===================================================================
# 🚀 STAGE 2: Production Stage - Image finale optimisée
# ===================================================================
FROM node:18-alpine AS production

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodeuser -u 1001

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de configuration package
COPY package*.json ./

# Installer UNIQUEMENT les dépendances de production
RUN npm ci --omit=dev && npm cache clean --force

# Copier l'application compilée depuis le stage builder
COPY --from=builder /app/dist ./dist

# Copier les scripts utilitaires
COPY --from=builder /app/scripts ./scripts

# Changer la propriété des fichiers à l'utilisateur non-root
RUN chown -R nodeuser:nodejs /app
USER nodeuser

# Exposer le port de l'API
EXPOSE 3001

# Variables d'environnement par défaut pour la production
ENV NODE_ENV=production
ENV PORT=3001
ENV LOG_LEVEL=info

# Health check pour vérifier que l'API répond
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1

# Commande par défaut pour démarrer l'application
CMD ["node", "dist/index.js"]