#!/bin/bash
set -euo pipefail

# Setup GitHub OIDC for CI/CD Pipeline
# Run this ONCE to create the OIDC provider and IAM role in your AWS account.
# Prerequisites: AWS credentials configured, CDK bootstrapped

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "=== GitHub OIDC Setup for CI/CD Pipeline ==="
echo ""

# Verify AWS credentials
echo "[1/3] Verifying AWS credentials..."
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "   Account: $ACCOUNT_ID"
echo "   Region:  us-east-1"
echo ""

# Install CDK dependencies
echo "[2/3] Installing infrastructure dependencies..."
cd "$SCRIPT_DIR/infra"
npm ci --silent
echo ""

# Deploy ONLY the OIDC stack
echo "[3/3] Deploying GitHub OIDC stack..."
npx cdk deploy GitHubOidcStack --require-approval never --outputs-file oidc-outputs.json
echo ""

echo "=== OIDC Setup Complete ==="
echo ""
if [ -f oidc-outputs.json ]; then
  ROLE_ARN=$(python3 -c "import json; print(json.load(open('oidc-outputs.json'))['GitHubOidcStack']['GitHubActionsRoleArn'])")
  echo "GitHub Actions Role ARN: $ROLE_ARN"
  echo ""
  echo "NEXT STEPS:"
  echo "  1. Go to: https://github.com/greg-the-coder/mvp-ai-demo/settings/secrets/actions"
  echo "  2. Create a new repository secret:"
  echo "     Name:  AWS_ROLE_ARN"
  echo "     Value: $ROLE_ARN"
  echo ""
  echo "  Once the secret is set, the GitHub Actions pipeline will authenticate via OIDC."
fi
