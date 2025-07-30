#!/bin/bash

# ===================================================================
# 🐳 VeganFlemme Docker - Test de Démonstration
# ===================================================================
# Script de test simplifié pour démontrer l'environnement Docker
# Usage: ./scripts/docker/demo.sh
# ===================================================================

set -e

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Fonction d'affichage avec couleurs
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_step() {
    echo -e "${PURPLE}🔬 $1${NC}"
}

echo "🌱 VeganFlemme Docker - Démonstration Rapide"
echo "============================================="
echo ""

log_step "Test 1: Vérification des fichiers Docker"
if [ -f "docker-compose.yml" ] && [ -f "engine/Dockerfile" ] && [ -f "frontend/Dockerfile" ]; then
    log_success "Tous les fichiers Docker sont présents"
else
    echo "❌ Fichiers Docker manquants"
    exit 1
fi

log_step "Test 2: Vérification de la configuration"
if [ -f ".env" ] || [ -f ".env.docker.example" ]; then
    log_success "Configuration d'environnement disponible"
else
    echo "❌ Fichier de configuration manquant"
    exit 1
fi

log_step "Test 3: Vérification des scripts de gestion"
if [ -x "scripts/docker/start.sh" ] && [ -x "scripts/docker/stop.sh" ]; then
    log_success "Scripts de gestion Docker opérationnels"
else
    echo "❌ Scripts de gestion manquants ou non exécutables"
    exit 1
fi

log_step "Test 4: Vérification de la structure de base de données"
if [ -f "database/init/01-init-schema.sql" ]; then
    log_success "Schema PostgreSQL configuré"
else
    echo "❌ Schema de base de données manquant"
    exit 1
fi

log_step "Test 5: Validation de la configuration Docker Compose"
docker compose config > /dev/null 2>&1
if [ $? -eq 0 ]; then
    log_success "Configuration Docker Compose valide"
else
    echo "❌ Configuration Docker Compose invalide"
    exit 1
fi

echo ""
log_success "🎉 Tous les tests passent !"
echo ""
log_info "🚀 Pour démarrer l'environnement complet :"
echo "   ./scripts/docker/start.sh --build --detach"
echo ""
log_info "🌐 URLs qui seront disponibles :"
echo "   Frontend:  http://localhost:3000"
echo "   Backend:   http://localhost:3001/api"
echo "   Database:  postgresql://localhost:5432/veganflemme"
echo ""
log_info "📖 Documentation complète : DOCKER_MIGRATION_GUIDE.md"