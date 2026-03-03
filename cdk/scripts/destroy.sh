#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CDK_DIR="$(dirname "$SCRIPT_DIR")"

ENV_NAME="${1:-dev}"

echo "=== Environment Status Dashboard - Destroy ==="
echo "Environment: $ENV_NAME"
echo ""

if [ "$ENV_NAME" = "prod" ]; then
  echo "WARNING: You are about to destroy the PRODUCTION stack."
  read -p "Type 'destroy-prod' to confirm: " confirmation
  if [ "$confirmation" != "destroy-prod" ]; then
    echo "Aborted."
    exit 1
  fi
fi

cd "$CDK_DIR"

echo "Destroying stack EnvStatusDashboard-$ENV_NAME..."
npx cdk destroy "EnvStatusDashboard-$ENV_NAME" \
  -c envName="$ENV_NAME" \
  --force

echo ""
echo "=== Stack Destroyed ==="
