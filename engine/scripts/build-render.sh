#!/bin/bash

# Render-specific build script that ensures TypeScript types are available
# even in production environment settings

set -e

echo "🚀 Starting Render build process..."
echo "📝 Current NODE_ENV: ${NODE_ENV:-"not set"}"

# Force NODE_ENV to development temporarily for dependency installation
# This ensures devDependencies are installed even if NODE_ENV=production
export ORIGINAL_NODE_ENV="${NODE_ENV:-}"
export NODE_ENV="development"

echo "🔧 Temporarily setting NODE_ENV to development for dependency installation"

# Clean install with all dependencies
echo "📦 Installing all dependencies (including devDependencies)..."
npm ci --production=false

# Verify types are installed
echo "🔍 Verifying TypeScript types..."
./scripts/verify-types.sh

# Restore original NODE_ENV for build
if [ -n "$ORIGINAL_NODE_ENV" ]; then
    export NODE_ENV="$ORIGINAL_NODE_ENV"
    echo "🔄 Restored NODE_ENV to: $NODE_ENV"
else
    unset NODE_ENV
    echo "🔄 NODE_ENV unset (was not originally set)"
fi

# Build the application
echo "🏗️  Building TypeScript application..."
npm run build

echo "✅ Render build completed successfully!"

# Show build artifacts
echo "📁 Build artifacts:"
ls -la dist/ | head -10