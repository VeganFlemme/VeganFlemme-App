#!/bin/bash

# ===================================================================
# 🐳 VeganFlemme Docker - Quick Start Script
# ===================================================================
# Simplified start script for the reorganized structure
# Usage: ./start.sh [--build] [--detach]
# ===================================================================

set -e

# Colors for logging
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

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

# Change to root directory
cd "$(dirname "$0")"

# Parse arguments  
BUILD=false
DETACH=false

for arg in "$@"; do
    case $arg in
        --build)
            BUILD=true
            shift
            ;;
        --detach|-d)
            DETACH=true
            shift
            ;;
        *)
            ;;
    esac
done

log_info "Starting VeganFlemme application..."

# Build command
DOCKER_COMMAND="docker-compose"

if [ "$BUILD" = true ]; then
    DOCKER_COMMAND="$DOCKER_COMMAND up --build"
    log_info "Building and starting services..."
else
    DOCKER_COMMAND="$DOCKER_COMMAND up"
    log_info "Starting services..."
fi

if [ "$DETACH" = true ]; then
    DOCKER_COMMAND="$DOCKER_COMMAND -d"
    log_info "Running in detached mode..."
fi

# Execute Docker Compose
$DOCKER_COMMAND

if [ "$DETACH" = true ]; then
    log_success "Services started in background!"
    log_info "Frontend: http://localhost:3000"
    log_info "Backend API: http://localhost:3001/api"
    log_info "Database: localhost:5432"
    echo
    log_info "To view logs: docker-compose logs -f"
    log_info "To stop: docker-compose down"
else
    log_success "Services have been stopped."
fi