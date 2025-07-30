#!/bin/bash

# ===================================================================
# 🐳 VeganFlemme Docker - Script de Démarrage
# ===================================================================
# Démarre tous les services de l'application VeganFlemme
# Usage: ./scripts/docker/start.sh [--build] [--detach]
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
    echo -e "${PURPLE}🚀 $1${NC}"
}

# Vérifier que Docker et Docker Compose sont installés
check_dependencies() {
    log_step "Vérification des dépendances..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker n'est pas installé. Veuillez l'installer depuis https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    if ! command -v docker compose &> /dev/null; then
        log_error "Docker Compose n'est pas installé. Veuillez l'installer depuis https://docs.docker.com/compose/install/"
        exit 1
    fi
    
    log_success "Docker et Docker Compose sont installés"
}

# Vérifier que le fichier .env existe
check_env_file() {
    log_step "Vérification du fichier d'environnement..."
    
    if [ ! -f ".env" ]; then
        if [ -f ".env.docker.example" ]; then
            log_warning "Fichier .env manquant. Copie depuis .env.docker.example..."
            cp .env.docker.example .env
            log_info "Fichier .env créé. Vous pouvez le modifier selon vos besoins."
        else
            log_error "Fichier .env.docker.example manquant. Impossible de créer .env"
            exit 1
        fi
    fi
    
    log_success "Fichier d'environnement configuré"
}

# Arrêter les services existants (si ils tournent)
stop_existing_services() {
    log_step "Arrêt des services existants..."
    docker compose down --remove-orphans 2>/dev/null || true
    log_success "Services existants arrêtés"
}

# Démarrer les services
start_services() {
    local build_flag=""
    local detach_flag=""
    
    # Analyser les arguments
    for arg in "$@"; do
        case $arg in
            --build|-b)
                build_flag="--build"
                shift
                ;;
            --detach|-d)
                detach_flag="-d"
                shift
                ;;
        esac
    done
    
    log_step "Démarrage des services VeganFlemme..."
    
    if [ -n "$build_flag" ]; then
        log_info "Reconstruction des images Docker..."
        docker compose build --no-cache
    fi
    
    # Démarrer la base de données en premier
    log_info "Démarrage de la base de données PostgreSQL..."
    docker compose up $detach_flag database
    
    # Attendre que la DB soit prête
    if [ -z "$detach_flag" ]; then
        sleep 5
    else
        log_info "Attente de la disponibilité de la base de données..."
        timeout 60 bash -c 'until docker compose exec -T database pg_isready -U veganflemme -d veganflemme; do sleep 2; done'
    fi
    
    # Démarrer le backend
    log_info "Démarrage du backend API..."
    docker compose up $detach_flag backend
    
    # Attendre que l'API soit prête
    if [ -n "$detach_flag" ]; then
        log_info "Attente de la disponibilité de l'API..."
        timeout 60 bash -c 'until curl -f http://localhost:3001/api/health > /dev/null 2>&1; do sleep 2; done' || true
    fi
    
    # Démarrer le frontend
    log_info "Démarrage du frontend Next.js..."
    docker compose up $detach_flag frontend
    
    if [ -n "$detach_flag" ]; then
        log_success "Tous les services VeganFlemme ont été démarrés en arrière-plan!"
        echo ""
        log_info "🌐 Frontend: http://localhost:3000"
        log_info "🔧 Backend API: http://localhost:3001/api"
        log_info "🗄️ Database: localhost:5432"
        echo ""
        log_info "📋 Pour voir les logs: docker compose logs -f"
        log_info "🛑 Pour arrêter: docker compose down"
    else
        log_success "Services démarrés en mode interactif. Appuyez sur Ctrl+C pour arrêter."
    fi
}

# Afficher l'aide
show_help() {
    echo "🐳 Script de démarrage VeganFlemme Docker"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -b, --build    Reconstruit les images Docker avant de démarrer"
    echo "  -d, --detach   Démarre les services en arrière-plan"
    echo "  -h, --help     Affiche cette aide"
    echo ""
    echo "Exemples:"
    echo "  $0                 # Démarre les services en mode interactif"
    echo "  $0 --detach       # Démarre en arrière-plan"
    echo "  $0 --build        # Reconstruit et démarre"
    echo "  $0 -b -d          # Reconstruit et démarre en arrière-plan"
}

# Fonction principale
main() {
    echo "🌱 VeganFlemme Docker - Démarrage des Services"
    echo "============================================="
    echo ""
    
    # Vérifier les arguments d'aide
    for arg in "$@"; do
        case $arg in
            -h|--help)
                show_help
                exit 0
                ;;
        esac
    done
    
    check_dependencies
    check_env_file
    stop_existing_services
    start_services "$@"
}

# Exécuter le script principal
main "$@"