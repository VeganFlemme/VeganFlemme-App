#!/bin/bash

# ===================================================================
# 🐳 VeganFlemme Docker - Script d'Arrêt
# ===================================================================
# Arrête tous les services de l'application VeganFlemme
# Usage: ./scripts/docker/stop.sh [--remove-volumes] [--remove-images]
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
    echo -e "${PURPLE}🛑 $1${NC}"
}

# Arrêter les services
stop_services() {
    log_step "Arrêt des services VeganFlemme..."
    
    if docker compose ps | grep -q "Up"; then
        docker compose down --remove-orphans
        log_success "Services arrêtés avec succès"
    else
        log_info "Aucun service en cours d'exécution"
    fi
}

# Supprimer les volumes (données)
remove_volumes() {
    log_step "Suppression des volumes de données..."
    log_warning "Cela supprimera DÉFINITIVEMENT toutes les données de la base de données!"
    
    read -p "Êtes-vous sûr de vouloir continuer? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker compose down -v
        docker volume rm veganflemme-postgres-data 2>/dev/null || true
        log_success "Volumes supprimés"
    else
        log_info "Suppression des volumes annulée"
    fi
}

# Supprimer les images
remove_images() {
    log_step "Suppression des images Docker..."
    
    # Supprimer les images de l'application
    docker rmi veganflemme-app-frontend 2>/dev/null || true
    docker rmi veganflemme-app-backend 2>/dev/null || true
    
    # Nettoyer les images intermédiaires
    docker image prune -f
    
    log_success "Images supprimées"
}

# Nettoyage complet du système Docker
cleanup_system() {
    log_step "Nettoyage complet du système Docker..."
    log_warning "Cela supprimera tous les conteneurs, réseaux et images non utilisés!"
    
    read -p "Êtes-vous sûr de vouloir effectuer un nettoyage complet? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker system prune -af
        log_success "Nettoyage système terminé"
    else
        log_info "Nettoyage système annulé"
    fi
}

# Afficher le statut des services
show_status() {
    log_step "Statut des services VeganFlemme..."
    
    echo ""
    echo "📋 Conteneurs:"
    docker compose ps 2>/dev/null || log_info "Aucun service docker compose actif"
    
    echo ""
    echo "💾 Volumes:"
    docker volume ls | grep veganflemme || log_info "Aucun volume VeganFlemme trouvé"
    
    echo ""
    echo "🖼️ Images:"
    docker images | grep -E "(veganflemme|postgres)" || log_info "Aucune image VeganFlemme trouvée"
    
    echo ""
    echo "🌐 Réseaux:"
    docker network ls | grep veganflemme || log_info "Aucun réseau VeganFlemme trouvé"
}

# Afficher l'aide
show_help() {
    echo "🐳 Script d'arrêt VeganFlemme Docker"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --remove-volumes    Supprime aussi les volumes de données (⚠️ DESTRUCTIF)"
    echo "  --remove-images     Supprime aussi les images Docker"
    echo "  --cleanup           Nettoyage complet du système Docker (⚠️ DESTRUCTIF)"
    echo "  --status            Affiche le statut des services"
    echo "  -h, --help          Affiche cette aide"
    echo ""
    echo "Exemples:"
    echo "  $0                      # Arrête simplement les services"
    echo "  $0 --remove-volumes     # Arrête et supprime les données"
    echo "  $0 --remove-images      # Arrête et supprime les images"
    echo "  $0 --status             # Affiche le statut sans arrêter"
}

# Fonction principale
main() {
    echo "🌱 VeganFlemme Docker - Arrêt des Services"
    echo "=========================================="
    echo ""
    
    local remove_volumes=false
    local remove_images=false
    local cleanup=false
    local show_status_only=false
    
    # Analyser les arguments
    for arg in "$@"; do
        case $arg in
            --remove-volumes)
                remove_volumes=true
                shift
                ;;
            --remove-images)
                remove_images=true
                shift
                ;;
            --cleanup)
                cleanup=true
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
    
    # Si on demande juste le statut
    if [ "$show_status_only" = true ]; then
        show_status
        exit 0
    fi
    
    # Arrêter les services
    stop_services
    
    # Actions optionnelles
    if [ "$remove_volumes" = true ]; then
        remove_volumes
    fi
    
    if [ "$remove_images" = true ]; then
        remove_images
    fi
    
    if [ "$cleanup" = true ]; then
        cleanup_system
    fi
    
    # Afficher le statut final
    echo ""
    show_status
    
    echo ""
    log_success "Arrêt terminé !"
    log_info "Pour redémarrer: ./scripts/docker/start.sh"
}

# Exécuter le script principal
main "$@"