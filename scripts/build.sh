#!/bin/bash

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Build Next.js app
echo "Building Next.js app..."
npx next build

echo "Build completed successfully!"