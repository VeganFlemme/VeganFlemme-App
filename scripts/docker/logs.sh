#!/bin/bash

# ===================================================================
# 🐳 VeganFlemme Docker - Script de Logs
# ===================================================================
# Affiche les logs des services VeganFlemme
# Usage: ./scripts/docker/logs.sh [service] [options]
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
    echo -e "${PURPLE}📋 $1${NC}"
}

# Vérifier que les services sont en cours d'exécution
check_services() {
    if ! docker compose ps | grep -q "Up"; then
        log_error "Aucun service VeganFlemme n'est en cours d'exécution"
        log_info "Démarrez les services avec: ./scripts/docker/start.sh"
        exit 1
    fi
}

# Afficher les logs d'un service spécifique
show_service_logs() {
    local service=$1
    local follow=${2:-false}
    local tail=${3:-100}
    
    case $service in
        frontend|front|f)
            service="frontend"
            ;;
        backend|back|api|b)
            service="backend"
            ;;
        database|db|postgres|d)
            service="database"
            ;;
        *)
            log_error "Service inconnu: $service"
            log_info "Services disponibles: frontend, backend, database"
            exit 1
            ;;
    esac
    
    log_step "Affichage des logs du service: $service"
    
    if [ "$follow" = true ]; then
        docker compose logs -f --tail="$tail" "$service"
    else
        docker compose logs --tail="$tail" "$service"
    fi
}

# Afficher les logs de tous les services
show_all_logs() {
    local follow=${1:-false}
    local tail=${2:-100}
    
    log_step "Affichage des logs de tous les services"
    
    if [ "$follow" = true ]; then
        docker compose logs -f --tail="$tail"
    else
        docker compose logs --tail="$tail"
    fi
}

# Afficher le statut des services avec métriques
show_status() {
    log_step "Statut des services VeganFlemme"
    
    echo ""
    echo "🐳 Conteneurs:"
    docker compose ps
    
    echo ""
    echo "💻 Utilisation des ressources:"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" \
        $(docker compose ps -q) 2>/dev/null || log_warning "Impossible d'afficher les statistiques"
    
    echo ""
    echo "🌐 Endpoints disponibles:"
    echo "  Frontend: http://localhost:3000"
    echo "  Backend:  http://localhost:3001/api"
    echo "  Health:   http://localhost:3001/api/health"
    echo "  Database: postgresql://localhost:5432/veganflemme"
}

# Tester les endpoints
test_endpoints() {
    log_step "Test des endpoints de l'application"
    
    echo ""
    echo "🔍 Test Backend API..."
    if curl -s -f http://localhost:3001/api/health > /dev/null; then
        log_success "Backend API: ✅ Disponible"
        echo "   Response: $(curl -s http://localhost:3001/api/health | jq -r '.message' 2>/dev/null || echo 'OK')"
    else
        log_error "Backend API: ❌ Non disponible"
    fi
    
    echo ""
    echo "🔍 Test Frontend..."
    if curl -s -f http://localhost:3000 > /dev/null; then
        log_success "Frontend: ✅ Disponible"
    else
        log_error "Frontend: ❌ Non disponible"
    fi
    
    echo ""
    echo "🔍 Test Database..."
    if docker compose exec -T database pg_isready -U veganflemme -d veganflemme > /dev/null 2>&1; then
        log_success "Database: ✅ Disponible"
    else
        log_error "Database: ❌ Non disponible"
    fi
}

# Afficher l'aide
show_help() {
    echo "🐳 Script de logs VeganFlemme Docker"
    echo ""
    echo "Usage: $0 [SERVICE] [OPTIONS]"
    echo ""
    echo "Services:"
    echo "  frontend, front, f     Logs du frontend Next.js"
    echo "  backend, back, api, b  Logs du backend Express"
    echo "  database, db, d        Logs de PostgreSQL"
    echo "  (aucun)                Logs de tous les services"
    echo ""
    echo "Options:"
    echo "  -f, --follow           Suit les logs en temps réel"
    echo "  -t, --tail NUMBER      Nombre de lignes à afficher (défaut: 100)"
    echo "  --status               Affiche le statut des services"
    echo "  --test                 Teste la disponibilité des endpoints"
    echo "  -h, --help             Affiche cette aide"
    echo ""
    echo "Exemples:"
    echo "  $0                     # Tous les logs (100 dernières lignes)"
    echo "  $0 backend -f          # Logs backend en temps réel"
    echo "  $0 frontend --tail 50  # 50 dernières lignes du frontend"
    echo "  $0 --status            # Statut et métriques"
    echo "  $0 --test              # Test des endpoints"
}

# Fonction principale
main() {
    echo "🌱 VeganFlemme Docker - Gestion des Logs"
    echo "========================================"
    echo ""
    
    local service=""
    local follow=false
    local tail=100
    local show_status_only=false
    local test_only=false
    
    # Analyser les arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            frontend|front|f|backend|back|api|b|database|db|d)
                service=$1
                shift
                ;;
            -f|--follow)
                follow=true
                shift
                ;;
            -t|--tail)
                tail=$2
                shift 2
                ;;
            --status)
                show_status_only=true
                shift
                ;;
            --test)
                test_only=true
                shift
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            *)
                log_error "Argument inconnu: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # Actions spéciales
    if [ "$show_status_only" = true ]; then
        check_services
        show_status
        exit 0
    fi
    
    if [ "$test_only" = true ]; then
        check_services
        test_endpoints
        exit 0
    fi
    
    # Vérifier que les services tournent
    check_services
    
    # Afficher les logs
    if [ -n "$service" ]; then
        show_service_logs "$service" "$follow" "$tail"
    else
        show_all_logs "$follow" "$tail"
    fi
}

# Exécuter le script principal
main "$@"