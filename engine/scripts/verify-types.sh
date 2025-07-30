#!/bin/bash

# Script to verify that TypeScript type definitions are properly installed before build
# This prevents TS2688 errors on Render platform

set -e

echo "🔍 Verifying TypeScript types installation..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "❌ node_modules directory not found"
    echo "💡 Running npm install..."
    npm install
fi

# Check if @types directory exists
if [ ! -d "node_modules/@types" ]; then
    echo "❌ @types directory not found in node_modules"
    echo "💡 Reinstalling dependencies with devDependencies..."
    npm install --production=false
fi

# Verify specific type packages
REQUIRED_TYPES=("jest" "node")
MISSING_TYPES=()

for type_pkg in "${REQUIRED_TYPES[@]}"; do
    if [ ! -d "node_modules/@types/$type_pkg" ]; then
        echo "❌ Missing @types/$type_pkg"
        MISSING_TYPES+=("@types/$type_pkg")
    else
        echo "✅ Found @types/$type_pkg"
    fi
done

# If any types are missing, try to install them specifically
if [ ${#MISSING_TYPES[@]} -ne 0 ]; then
    echo "⚠️  Some type definitions are missing. Installing them explicitly..."
    npm install --save-dev "${MISSING_TYPES[@]}"
fi

# Final verification
echo "🔍 Final verification of types..."
for type_pkg in "${REQUIRED_TYPES[@]}"; do
    if [ ! -d "node_modules/@types/$type_pkg" ]; then
        echo "❌ FATAL: @types/$type_pkg is still missing after installation attempts"
        exit 1
    fi
done

# Check TypeScript configuration
if [ ! -f "tsconfig.json" ]; then
    echo "❌ FATAL: tsconfig.json not found"
    exit 1
fi

echo "✅ All TypeScript types are properly installed!"
echo "📁 Contents of node_modules/@types:"
ls -la node_modules/@types/ | grep -E "(jest|node|total)"

echo "🎯 TypeScript configuration:"
grep -A 5 -B 2 '"types"' tsconfig.json || echo "No types field found in tsconfig.json"

echo "🚀 Ready for TypeScript build!"