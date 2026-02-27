#!/bin/bash
set -euo pipefail

echo "=== Environment Status Dashboard - Deploy ==="

# Build frontend
echo "Building frontend..."
cd frontend
npm ci
npm run build
cd ..

# Deploy CDK stack
echo "Deploying CDK stack..."
cd cdk
npm ci
npx cdk deploy --require-approval never
cd ..

echo "=== Deployment complete ==="
