#!/bin/bash
set -euo pipefail

# Environment Status Dashboard — Deploy to AWS
# Usage: ./deploy.sh
# Prerequisites: AWS credentials configured (aws sts get-caller-identity must succeed)

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "=== Environment Status Dashboard — AWS Deployment ==="
echo ""

# 1. Verify AWS credentials
echo "[1/5] Verifying AWS credentials..."
aws sts get-caller-identity || { echo "ERROR: AWS credentials not configured. Run 'aws configure' first."; exit 1; }
echo ""

# 2. Build frontend
echo "[2/5] Building frontend..."
cd "$SCRIPT_DIR/dashboard"
npm ci --silent
npm run build
echo "   ✓ Frontend built → dashboard/dist/"
echo ""

# 3. Run backend tests
echo "[3/5] Running backend tests..."
cd "$SCRIPT_DIR/backend"
npm test
echo "   ✓ All backend tests pass"
echo ""

# 4. Install CDK dependencies
echo "[4/5] Installing infrastructure dependencies..."
cd "$SCRIPT_DIR/infra"
npm ci --silent
echo "   ✓ CDK dependencies installed"
echo ""

# 5. Deploy with CDK
echo "[5/5] Deploying to AWS (us-east-1)..."
npx cdk deploy --require-approval never --outputs-file cdk-outputs.json
echo ""

echo "=== Deployment Complete ==="
echo ""
if [ -f cdk-outputs.json ]; then
  echo "Outputs:"
  cat cdk-outputs.json
fi
echo ""
echo "Your dashboard is live! Open the DashboardUrl above in a browser."
