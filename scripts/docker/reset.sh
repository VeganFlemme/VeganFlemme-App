#!/bin/bash

# ===================================================================
# 🐳 VeganFlemme Docker - Script de Reset
# ===================================================================
# Remet à zéro complètement l'environnement Docker
# Usage: ./scripts/docker/reset.sh [--hard] [--keep-data]
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

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_step() {
    echo -e "${PURPLE}🔄 $1${NC}"
}

# Confirmation utilisateur
confirm_action() {
    local message=$1
    local default=${2:-"N"}
    
    log_warning "$message"
    
    if [ "$default" = "Y" ]; then
        read -p "Continuer? (Y/n): " -n 1 -r
        echo
        [[ $REPLY =~ ^[Nn]$ ]] && return 1
    else
        read -p "Continuer? (y/N): " -n 1 -r
        echo
        [[ ! $REPLY =~ ^[Yy]$ ]] && return 1
    fi
    
    return 0
}

# Reset léger - redémarrage propre
soft_reset() {
    log_step "Reset léger - Redémarrage des services"
    
    # Arrêter les services
    docker compose down --remove-orphans
    
    # Reconstruire et redémarrer
    docker compose build --no-cache
    docker compose up -d
    
    log_success "Reset léger terminé"
}

# Reset complet - suppression des données
hard_reset() {
    log_step "Reset complet - Suppression de toutes les données"
    
    if ! confirm_action "Cela supprimera DÉFINITIVEMENT toutes les données de la base de données!"; then
        log_info "Reset annulé"
        return
    fi
    
    # Arrêter tous les services
    docker compose down -v --remove-orphans
    
    # Supprimer les volumes
    docker volume rm veganflemme-postgres-data 2>/dev/null || true
    
    # Supprimer les images de l'application
    docker rmi veganflemme-app-frontend 2>/dev/null || true
    docker rmi veganflemme-app-backend 2>/dev/null || true
    
    # Nettoyer les images intermédiaires
    docker image prune -f
    
    # Reconstruire et redémarrer
    docker compose build --no-cache
    docker compose up -d
    
    log_success "Reset complet terminé"
}

# Reset avec conservation des données
reset_keep_data() {
    log_step "Reset avec conservation des données"
    
    # Arrêter les services (mais garder les volumes)
    docker compose down --remove-orphans
    
    # Sauvegarder les données si possible
    if docker volume inspect veganflemme-postgres-data > /dev/null 2>&1; then
        log_info "Sauvegarde des données existantes..."
        mkdir -p ./backups
        docker run --rm \
            -v veganflemme-postgres-data:/data \
            -v "$(pwd)/backups:/backup" \
            postgres:15-alpine \
            tar czf /backup/postgres-backup-$(date +%Y%m%d-%H%M%S).tar.gz -C /data .
        log_success "Données sauvegardées dans ./backups/"
    fi
    
    # Supprimer les images de l'application seulement
    docker rmi veganflemme-app-frontend 2>/dev/null || true
    docker rmi veganflemme-app-backend 2>/dev/null || true
    
    # Reconstruire et redémarrer
    docker compose build --no-cache
    docker compose up -d
    
    log_success "Reset avec conservation des données terminé"
}

# Nettoyer les fichiers de logs
clean_logs() {
    log_step "Nettoyage des fichiers de logs"
    
    if [ -d "./logs" ]; then
        rm -rf ./logs/*
        log_success "Logs supprimés"
    else
        log_info "Aucun fichier de log à supprimer"
    fi
}

# Réinitialiser la base de données seulement
reset_database_only() {
    log_step "Reset de la base de données uniquement"
    
    if ! confirm_action "Cela supprimera toutes les données de la base de données!"; then
        log_info "Reset de la base de données annulé"
        return
    fi
    
    # Arrêter et supprimer seulement le conteneur database
    docker compose stop database
    docker compose rm -f database
    docker volume rm veganflemme-postgres-data 2>/dev/null || true
    
    # Redémarrer la database
    docker compose up -d database
    
    # Attendre qu'elle soit prête
    log_info "Attente de la disponibilité de la nouvelle base de données..."
    timeout 60 bash -c 'until docker compose exec -T database pg_isready -U veganflemme -d veganflemme; do sleep 2; done'
    
    log_success "Base de données réinitialisée"
}

# Afficher l'état du système avant reset
show_pre_reset_status() {
    log_step "État du système avant reset"
    
    echo ""
    echo "📋 Conteneurs actifs:"
    docker compose ps 2>/dev/null || log_info "Aucun conteneur actif"
    
    echo ""
    echo "💾 Volumes de données:"
    docker volume ls | grep veganflemme || log_info "Aucun volume trouvé"
    
    echo ""
    echo "🖼️ Images VeganFlemme:"
    docker images | grep -E "(veganflemme|<none>)" || log_info "Aucune image trouvée"
    
    echo ""
    echo "💽 Espace disque utilisé par Docker:"
    docker system df
}

# Vérifier l'état après reset
verify_reset() {
    log_step "Vérification du reset"
    
    sleep 10  # Attendre que les services se stabilisent
    
    echo ""
    echo "🔍 Test des services..."
    
    # Test API
    if curl -s -f http://localhost:3001/api/health > /dev/null; then
        log_success "✅ Backend API disponible"
    else
        log_warning "⚠️ Backend API non disponible"
    fi
    
    # Test Frontend
    if curl -s -f http://localhost:3000 > /dev/null; then
        log_success "✅ Frontend disponible"
    else
        log_warning "⚠️ Frontend non disponible"
    fi
    
    # Test Database
    if docker compose exec -T database pg_isready -U veganflemme -d veganflemme > /dev/null 2>&1; then
        log_success "✅ Base de données disponible"
    else
        log_warning "⚠️ Base de données non disponible"
    fi
}

# Afficher l'aide
show_help() {
    echo "🐳 Script de reset VeganFlemme Docker"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --soft           Reset léger (redémarrage + rebuild)"
    echo "  --hard           Reset complet (⚠️ SUPPRIME TOUTES LES DONNÉES)"
    echo "  --keep-data      Reset en conservant les données (avec sauvegarde)"
    echo "  --db-only        Reset de la base de données uniquement"
    echo "  --clean-logs     Nettoie les fichiers de logs"
    echo "  --status         Affiche l'état avant reset"
    echo "  -h, --help       Affiche cette aide"
    echo ""
    echo "Exemples:"
    echo "  $0 --soft       # Reset léger (défaut)"
    echo "  $0 --hard       # Reset complet avec suppression des données"
    echo "  $0 --keep-data  # Reset en gardant les données"
    echo "  $0 --db-only    # Reset seulement la base de données"
}

# Fonction principale
main() {
    echo "🌱 VeganFlemme Docker - Reset de l'Environnement"
    echo "==============================================="
    echo ""
    
    local reset_type="soft"
    local show_status_only=false
    local clean_logs_only=false
    
    # Analyser les arguments
    for arg in "$@"; do
        case $arg in
            --soft)
                reset_type="soft"
                shift
                ;;
            --hard)
                reset_type="hard"
                shift
                ;;
            --keep-data)
                reset_type="keep-data"
                shift
                ;;
            --db-only)
                reset_type="db-only"
                shift
                ;;
            --clean-logs)
                clean_logs_only=true
                shift
                ;;
            --status)
                show_status_only=true
                shift
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
        esac
    done
    
    # Actions spéciales
    if [ "$show_status_only" = true ]; then
        show_pre_reset_status
        exit 0
    fi
    
    if [ "$clean_logs_only" = true ]; then
        clean_logs
        exit 0
    fi
    
    # Afficher l'état avant reset
    show_pre_reset_status
    echo ""
    
    # Exécuter le type de reset demandé
    case $reset_type in
        soft)
            soft_reset
            ;;
        hard)
            hard_reset
            ;;
        keep-data)
            reset_keep_data
            ;;
        db-only)
            reset_database_only
            ;;
    esac
    
    # Vérifier que tout fonctionne
    verify_reset
    
    echo ""
    log_success "Reset terminé ! 🎉"
    log_info "🌐 Frontend: http://localhost:3000"
    log_info "🔧 Backend: http://localhost:3001/api"
}

# Exécuter le script principal
main "$@"