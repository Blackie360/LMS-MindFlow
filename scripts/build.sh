#!/bin/bash

# Build script for LMS-MindFlow
# This script ensures proper build process and prevents client reference manifest issues

set -e

echo "🚀 Starting build process..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf .next
rm -rf out
rm -rf dist

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Build the application
echo "🏗️ Building application..."
npm run build

# Verify build output
if [ -d ".next" ]; then
    echo "✅ Build completed successfully!"
    echo "📁 Build output directory: .next"
    
    # Check for client reference manifests
    if find .next -name "*client-reference-manifest.js" -type f | grep -q .; then
        echo "📋 Client reference manifests found:"
        find .next -name "*client-reference-manifest.js" -type f
    else
        echo "⚠️ No client reference manifests found (this might be expected)"
    fi
else
    echo "❌ Build failed - .next directory not found"
    exit 1
fi

echo "🎉 Build process completed!"