# ===================================================================
# 🐳 VeganFlemme Frontend - Next.js Dockerfile
# ===================================================================
# Multi-stage build pour optimiser la taille et les performances
# Architecture: Next.js 14 + React 18 + TypeScript + Tailwind CSS
# Ports: 3000 (Next.js), mode standalone pour production
# ===================================================================

# ===================================================================
# 📦 STAGE 1: Dependencies Stage - Installation des dépendances
# ===================================================================
FROM node:18-alpine AS deps

# Métadonnées de l'image
LABEL maintainer="VeganFlemme Team"
LABEL version="0.1.0" 
LABEL description="VeganFlemme Frontend - React/Next.js application"

# Installer libc6-compat pour la compatibilité Alpine Linux
RUN apk add --no-cache libc6-compat

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de configuration package
COPY package*.json ./

# Installer les dépendances
RUN npm ci

# ===================================================================
# 🔨 STAGE 2: Builder Stage - Compilation de l'application
# ===================================================================
FROM node:18-alpine AS builder

WORKDIR /app

# Copier les dépendances installées
COPY --from=deps /app/node_modules ./node_modules

# Copier tous les fichiers source
COPY . .

# Variables d'environnement pour le build
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Build de l'application Next.js en mode standalone
RUN npm run build

# ===================================================================
# 🚀 STAGE 3: Production Stage - Image finale optimisée  
# ===================================================================
FROM node:18-alpine AS runner

WORKDIR /app

# Créer un utilisateur non-root pour la sécurité
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Variables d'environnement de production
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Copier les fichiers publics
COPY --from=builder /app/public ./public

# Copier l'application buildée avec les permissions correctes
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Changer vers l'utilisateur non-root
USER nextjs

# Exposer le port Next.js
EXPOSE 3000

# Variables d'environnement par défaut
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Health check pour vérifier que l'application répond
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Commande par défaut pour démarrer l'application
CMD ["node", "server.js"]