#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
CDK_DIR="$PROJECT_ROOT/cdk"

ENV_NAME="${1:-dev}"

echo "============================================="
echo "  Environment Status Dashboard - Full Deploy"
echo "============================================="
echo "Environment: $ENV_NAME"
echo ""

# ─── Step 1: Build React Application ──────────────────────────────────────────
echo ">>> Step 1: Building React application..."
cd "$PROJECT_ROOT"

if [ ! -d "node_modules" ]; then
  echo "    Installing frontend dependencies..."
  npm install
fi

npm run build

if [ ! -d "$PROJECT_ROOT/dist" ]; then
  echo "Error: Build failed — dist/ directory not found."
  exit 1
fi

echo "    Build complete. Output in dist/"
echo ""

# ─── Step 2: Deploy CDK Stack ────────────────────────────────────────────────
echo ">>> Step 2: Deploying CDK infrastructure..."
cd "$CDK_DIR"

if [ ! -d "node_modules" ]; then
  echo "    Installing CDK dependencies..."
  npm install
fi

SITE_ASSETS_PATH="$PROJECT_ROOT/dist"

echo "    Synthesizing CloudFormation template..."
npx cdk synth -c envName="$ENV_NAME" -c siteAssetsPath="$SITE_ASSETS_PATH" --quiet

echo "    Deploying stack EnvStatusDashboard-$ENV_NAME..."
npx cdk deploy "EnvStatusDashboard-$ENV_NAME" \
  -c envName="$ENV_NAME" \
  -c siteAssetsPath="$SITE_ASSETS_PATH" \
  --require-approval never \
  --outputs-file cdk-outputs.json

# Extract and display outputs
if [ -f cdk-outputs.json ]; then
  SITE_URL=$(jq -r ".\"EnvStatusDashboard-${ENV_NAME}\".SiteUrl" cdk-outputs.json 2>/dev/null || echo "N/A")
  echo ""
  echo "============================================="
  echo "  Deployment Complete!"
  echo "============================================="
  echo "URL: $SITE_URL"
else
  echo ""
  echo "============================================="
  echo "  Deployment Complete!"
  echo "============================================="
fi
