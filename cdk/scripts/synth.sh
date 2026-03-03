#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CDK_DIR="$(dirname "$SCRIPT_DIR")"

ENV_NAME="${1:-dev}"

cd "$CDK_DIR"

if [ ! -d "node_modules" ]; then
  echo "Installing CDK dependencies..."
  npm ci
fi

echo "Synthesizing CloudFormation template for $ENV_NAME..."
npx cdk synth -c envName="$ENV_NAME"
