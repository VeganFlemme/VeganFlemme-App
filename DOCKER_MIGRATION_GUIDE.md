# 🐳 VeganFlemme - Guide de Migration Docker

*Date de création : 30 juillet 2025*

---

## 📋 Table des Matières

1. [Introduction à la Migration Docker](#introduction)
2. [Audit et Justification](#audit-et-justification)
3. [Architecture Docker](#architecture-docker)
4. [Installation et Configuration](#installation-et-configuration)
5. [Utilisation Quotidienne](#utilisation-quotidienne)
6. [Gestion des Données](#gestion-des-données)
7. [Déploiement en Production](#déploiement-en-production)
8. [Dépannage](#dépannage)
9. [Migration depuis l'Environnement Existant](#migration)

---

## 🎯 Introduction {#introduction}

Ce guide détaille la migration complète de l'application VeganFlemme vers un environnement Docker. Cette migration apporte des avantages significatifs pour le développement, les tests et le déploiement.

### ✅ Avantages de la Migration Docker

- **🚀 Onboarding simplifié** : Setup en 2 commandes au lieu de 10+ étapes manuelles
- **🔒 Environnement cohérent** : Même version Node.js, dépendances et configuration partout
- **🧪 Tests reproductibles** : Environnement identique dev/test/prod
- **📦 Isolation des services** : Frontend, backend et base de données séparés
- **🔄 Déploiement unifié** : Même conteneur du développement à la production

---

## 🔍 Audit et Justification {#audit-et-justification}

### Architecture Existante Analysée

```
VeganFlemme-App/
├── frontend/ (Next.js 14 + TypeScript)
├── engine/ (Express + TypeScript)  
├── Déploiement: Vercel + Render.com
└── Base de données: Supabase (externe)
```

### Problèmes Identifiés

- **Complexité d'onboarding** : 15+ étapes manuelles pour un nouveau développeur
- **Versions incohérentes** : Node.js 18 requis mais non verrouillé
- **Tests difficiles** : Pas d'environnement d'intégration reproductible
- **Dépendance externe** : Supabase requis même en développement

### Solution Docker Proposée

- **Frontend** : Conteneur Next.js optimisé (mode standalone)
- **Backend** : Conteneur Express avec build multi-stage
- **Database** : PostgreSQL local pour le développement
- **Orchestration** : Docker Compose pour la coordination des services

---

## 🏗️ Architecture Docker {#architecture-docker}

### Vue d'Ensemble des Services

```yaml
🐳 VeganFlemme Docker Architecture

┌─────────────────────────────────────────────────────────┐
│                    Docker Host                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  Frontend   │  │   Backend   │  │  Database   │    │
│  │  (Next.js)  │  │  (Express)  │  │(PostgreSQL) │    │
│  │   Port      │  │   Port      │  │   Port      │    │
│  │   3000      │  │   3001      │  │   5432      │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
│         │                 │                 │          │
│  ┌─────────────────────────────────────────────────────┐ │
│  │           veganflemme-network (bridge)             │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                         │
│  📦 Volumes Persistants:                               │
│  └── postgres_data (données DB)                        │
└─────────────────────────────────────────────────────────┘
```

### Détail des Conteneurs

#### 🌐 Frontend Container
- **Base Image** : `node:18-alpine`
- **Build** : Multi-stage (deps → builder → runner)
- **Port** : 3000
- **Mode** : Next.js standalone
- **Health Check** : `http://localhost:3000`

#### ⚙️ Backend Container
- **Base Image** : `node:18-alpine`
- **Build** : Multi-stage (builder → production)
- **Port** : 3001
- **TypeScript** : Compilation optimisée
- **Health Check** : `http://localhost:3001/api/health`

#### 🗄️ Database Container
- **Image** : `postgres:15-alpine`
- **Port** : 5432
- **Volume** : Données persistantes
- **Init Scripts** : Schema automatique
- **Health Check** : `pg_isready`

---

## 🛠️ Installation et Configuration {#installation-et-configuration}

### Prérequis Système

```bash
# Vérifier Docker
docker --version  # >= 20.10.0
docker compose --version  # >= 2.0.0

# Vérifier les ressources système
# RAM: >= 4GB recommandé
# Disk: >= 10GB libre pour les images et volumes
```

### 1. Configuration de l'Environnement

```bash
# 1. Copier le fichier d'environnement
cp .env.docker.example .env

# 2. Configurer les variables selon vos besoins
nano .env
```

### 2. Variables d'Environnement Essentielles

```env
# Base de données (CHANGEZ LE MOT DE PASSE !)
POSTGRES_PASSWORD=your_secure_password_here

# Sécurité (GÉNÉREZ DES CLÉS SÉCURISÉES !)
JWT_SECRET=your_jwt_secret_min_32_characters
ENCRYPTION_KEY=your_encryption_key_min_32_characters

# Environnement
NODE_ENV=development
LOG_LEVEL=info
```

### 3. Démarrage Initial

```bash
# Démarrer tous les services
./scripts/docker/start.sh --build --detach

# Vérifier que tout fonctionne
./scripts/docker/logs.sh --test
```

---

## 🚀 Utilisation Quotidienne {#utilisation-quotidienne}

### Scripts de Gestion Rapide

```bash
# 🟢 Démarrer l'application
./scripts/docker/start.sh --detach

# 📋 Voir les logs
./scripts/docker/logs.sh --follow

# 📊 Vérifier le statut
./scripts/docker/logs.sh --status

# 🛑 Arrêter l'application
./scripts/docker/stop.sh

# 🔄 Redémarrer avec rebuild
./scripts/docker/reset.sh --soft
```

### Développement avec Hot Reload

Pour activer le hot reload en développement :

```bash
# 1. Arrêter les services
./scripts/docker/stop.sh

# 2. Modifier docker compose.yml pour les volumes
# (Voir section Configuration Avancée)

# 3. Redémarrer en mode développement
docker compose -f docker compose.yml -f docker compose.dev.yml up
```

### Accès aux Services

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Interface utilisateur React |
| **Backend API** | http://localhost:3001/api | API REST Express |
| **Health Check** | http://localhost:3001/api/health | Vérification état API |
| **Database** | localhost:5432 | PostgreSQL (user: veganflemme) |

### Commandes Docker Utiles

```bash
# Entrer dans un conteneur
docker compose exec frontend sh
docker compose exec backend sh
docker compose exec database psql -U veganflemme -d veganflemme

# Voir les logs d'un service spécifique
docker compose logs -f frontend
docker compose logs -f backend
docker compose logs -f database

# Restart un service spécifique
docker compose restart backend

# Rebuild un service spécifique
docker compose build frontend
docker compose up -d frontend
```

---

## 💾 Gestion des Données {#gestion-des-données}

### Persistance des Données

Les données PostgreSQL sont stockées dans un volume Docker persistant :

```bash
# Localisation du volume
docker volume inspect veganflemme-postgres-data

# Sauvegarde des données
docker run --rm \
  -v veganflemme-postgres-data:/data \
  -v "$(pwd)/backups:/backup" \
  postgres:15-alpine \
  tar czf /backup/postgres-backup-$(date +%Y%m%d).tar.gz -C /data .
```

### Sauvegarde et Restauration

```bash
# Créer une sauvegarde SQL
docker compose exec database pg_dump -U veganflemme veganflemme > backup.sql

# Restaurer depuis une sauvegarde
docker compose exec -T database psql -U veganflemme veganflemme < backup.sql

# Reset complet des données
./scripts/docker/reset.sh --hard
```

### Schema de Base de Données

Le schema PostgreSQL est automatiquement initialisé avec :

- **Tables principales** : users, foods, menus
- **Index optimisés** : Performance des requêtes
- **Données de test** : Aliments de base et utilisateur demo
- **Extensions** : uuid-ossp, pgcrypto

```sql
-- Accès à la base de données
docker compose exec database psql -U veganflemme -d veganflemme

-- Vérifier les tables
\dt

-- Voir les données de test
SELECT * FROM foods;
SELECT * FROM users;
```

---

## 🔧 Configuration Avancée

### Docker Compose Override pour Développement

Créer `docker compose.dev.yml` :

```yaml
version: '3.8'

services:
  frontend:
    volumes:
      - ./frontend/src:/app/src
      - ./frontend/public:/app/public
    environment:
      - WATCHPACK_POLLING=true
    command: npm run dev

  backend:
    volumes:
      - ./engine/src:/app/src
    environment:
      - NODE_ENV=development
    command: npm run dev
```

Utilisation :

```bash
docker compose -f docker compose.yml -f docker compose.dev.yml up
```

### Variables d'Environnement par Service

#### Frontend (.env)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

#### Backend (.env)
```env
DATABASE_URL=postgresql://veganflemme:password@database:5432/veganflemme
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your_jwt_secret
```

### Optimisation des Builds

```bash
# Build avec cache
docker compose build

# Build sans cache (plus lent mais propre)
docker compose build --no-cache

# Build parallèle
docker compose build --parallel

# Build d'un service spécifique
docker compose build frontend
```

---

## 🚀 Déploiement en Production {#déploiement-en-production}

### Variables d'Environnement Production

```env
# SÉCURITÉ - OBLIGATOIRE À CHANGER !
NODE_ENV=production
POSTGRES_PASSWORD=your_super_secure_production_password
JWT_SECRET=your_production_jwt_secret_min_64_chars
ENCRYPTION_KEY=your_production_encryption_key_min_64_chars

# Configuration production
LOG_LEVEL=warn
ENABLE_ANALYTICS=true

# URLs de production
FRONTEND_URL=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

### Docker Compose Production

Créer `docker compose.prod.yml` :

```yaml
version: '3.8'

services:
  frontend:
    restart: always
    environment:
      - NODE_ENV=production
    ports:
      - "80:3000"

  backend:
    restart: always
    environment:
      - NODE_ENV=production
    ports:
      - "3001:3001"

  database:
    restart: always
    volumes:
      - ./postgres-data:/var/lib/postgresql/data
    environment:
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
```

### Déploiement sur Serveur

```bash
# 1. Cloner le repository
git clone https://github.com/VeganFlemme/VeganFlemme-App.git
cd VeganFlemme-App

# 2. Configurer l'environnement
cp .env.docker.example .env
# Éditer .env avec les valeurs de production

# 3. Démarrer en production
docker compose -f docker compose.yml -f docker compose.prod.yml up -d

# 4. Vérifier le déploiement
./scripts/docker/logs.sh --test
```

### Proxy Reverse (Recommandé)

Utiliser Nginx ou Traefik comme proxy reverse :

```nginx
# /etc/nginx/sites-available/veganflemme
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 🔧 Dépannage {#dépannage}

### Problèmes Courants

#### 1. Ports déjà utilisés

```bash
# Vérifier les ports utilisés
netstat -tulpn | grep :3000
netstat -tulpn | grep :3001
netstat -tulpn | grep :5432

# Modifier les ports dans docker compose.yml si nécessaire
ports:
  - "3000:3000"  # Changer le premier port : "3002:3000"
```

#### 2. Erreur de build TypeScript

```bash
# Nettoyer le cache et rebuilder
./scripts/docker/reset.sh --soft

# Vérifier les logs de build
docker compose build frontend 2>&1 | tee build.log
```

#### 3. Base de données non accessible

```bash
# Vérifier l'état de PostgreSQL
docker compose exec database pg_isready -U veganflemme -d veganflemme

# Voir les logs de la base
docker compose logs database

# Reset de la base seulement
./scripts/docker/reset.sh --db-only
```

#### 4. API non accessible

```bash
# Vérifier l'API
curl http://localhost:3001/api/health

# Vérifier les logs backend
docker compose logs backend

# Test de connectivité réseau
docker compose exec frontend ping backend
```

### Diagnostic Système

```bash
# Vérifier l'utilisation des ressources
docker stats

# Vérifier l'espace disque
docker system df

# Nettoyer l'espace disque
docker system prune -f

# Voir tous les conteneurs
docker ps -a

# Voir tous les volumes
docker volume ls

# Voir tous les réseaux
docker network ls
```

### Logs de Debug

```bash
# Logs détaillés de tous les services
./scripts/docker/logs.sh --follow

# Logs d'un service spécifique avec plus de détail
docker compose logs -f --tail 1000 backend

# Debug mode pour un service
docker compose exec backend bash
# Puis dans le conteneur :
npm run dev
```

---

## 🔄 Migration depuis l'Environnement Existant {#migration}

### Étapes de Migration

#### 1. Sauvegarde de l'Existant

```bash
# Sauvegarder les données Supabase (si applicable)
# Exporter les variables d'environnement actuelles
cp frontend/.env frontend/.env.backup
cp engine/.env engine/.env.backup
```

#### 2. Installation Docker

```bash
# 1. Arrêter les services locaux existants
# (pm2, nodemon, etc.)

# 2. Copier la configuration Docker
cp .env.docker.example .env

# 3. Migrer les variables importantes
# Copier JWT_SECRET, API keys, etc. depuis les anciens .env
```

#### 3. Migration des Données

```bash
# Si vous avez des données Supabase à migrer :
# 1. Exporter depuis Supabase
# 2. Adapter le format PostgreSQL
# 3. Importer dans la nouvelle base

# Démarrer avec la nouvelle architecture
./scripts/docker/start.sh --build
```

#### 4. Tests de Migration

```bash
# Vérifier que tout fonctionne
./scripts/docker/logs.sh --test

# Tests manuels
curl http://localhost:3001/api/health
curl http://localhost:3000

# Tests des fonctionnalités métier
# (génération de menus, API nutrition, etc.)
```

### Comparaison Avant/Après

| Aspect | Avant Docker | Après Docker |
|--------|--------------|--------------|
| **Setup Initial** | 15+ étapes manuelles | 2 commandes |
| **Versions** | Variables selon la machine | Verrouillées dans les conteneurs |
| **Base de données** | Supabase externe requis | PostgreSQL local inclus |
| **Tests** | Difficiles à reproduire | Environnement identique |
| **Onboarding** | 2-3 heures | 10-15 minutes |
| **Déploiement** | Différent dev/prod | Identique partout |

---

## 📚 Ressources et Support

### Documentation Technique

- **Docker** : https://docs.docker.com/
- **Docker Compose** : https://docs.docker.com/compose/
- **PostgreSQL** : https://www.postgresql.org/docs/
- **Next.js** : https://nextjs.org/docs

### Scripts Utiles

```bash
# Tous les scripts sont dans scripts/docker/
./scripts/docker/start.sh --help
./scripts/docker/stop.sh --help
./scripts/docker/logs.sh --help
./scripts/docker/reset.sh --help
```

### Commandes de Maintenance

```bash
# Nettoyage hebdomadaire recommandé
docker system prune -f
docker volume prune -f
docker image prune -f

# Mise à jour des images de base
docker compose pull
./scripts/docker/reset.sh --soft
```

---

## ✅ Checklist de Migration

- [ ] Docker et Docker Compose installés
- [ ] Fichier `.env` configuré avec mots de passe sécurisés
- [ ] Services démarrés avec `./scripts/docker/start.sh`
- [ ] Tests de santé passés avec `./scripts/docker/logs.sh --test`
- [ ] Frontend accessible sur http://localhost:3000
- [ ] Backend API accessible sur http://localhost:3001/api
- [ ] Base de données accessible et initialisée
- [ ] Données de test présentes dans PostgreSQL
- [ ] Scripts de gestion testés
- [ ] Documentation équipe mise à jour

---

*Migration Docker VeganFlemme terminée avec succès ! 🌱🐳*

Pour toute question, consulter les logs avec `./scripts/docker/logs.sh` ou le guide de dépannage ci-dessus.