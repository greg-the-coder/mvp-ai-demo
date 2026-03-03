#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CDK_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_ROOT="$(dirname "$CDK_DIR")"

ENV_NAME="${1:-dev}"
SITE_DIR="${2:-$PROJECT_ROOT/dist}"

echo "=== Environment Status Dashboard - Deployment ==="
echo "Environment: $ENV_NAME"
echo "Site directory: $SITE_DIR"
echo ""

# Validate site directory exists
if [ ! -d "$SITE_DIR" ]; then
  echo "Error: Site directory '$SITE_DIR' does not exist."
  echo "Build the frontend first, then re-run this script."
  exit 1
fi

cd "$CDK_DIR"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing CDK dependencies..."
  npm ci
fi

# Synthesize the CloudFormation template
echo "Synthesizing CloudFormation template..."
npx cdk synth -c envName="$ENV_NAME"

# Deploy the stack
echo ""
echo "Deploying stack EnvStatusDashboard-$ENV_NAME..."
npx cdk deploy "EnvStatusDashboard-$ENV_NAME" \
  -c envName="$ENV_NAME" \
  --require-approval never \
  --outputs-file cdk-outputs.json

# Extract outputs
BUCKET_NAME=$(jq -r ".\\"EnvStatusDashboard-${ENV_NAME}\\".BucketName" cdk-outputs.json)
DISTRIBUTION_ID=$(jq -r ".\\"EnvStatusDashboard-${ENV_NAME}\\".DistributionId" cdk-outputs.json)
SITE_URL=$(jq -r ".\\"EnvStatusDashboard-${ENV_NAME}\\".SiteUrl" cdk-outputs.json)

# Sync site files to S3
echo ""
echo "Uploading site files to S3..."
aws s3 sync "$SITE_DIR" "s3://$BUCKET_NAME" \
  --delete \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "index.html" \
  --exclude "*.json"

# Upload index.html and JSON with short cache
aws s3 cp "$SITE_DIR/index.html" "s3://$BUCKET_NAME/index.html" \
  --cache-control "public, max-age=60, s-maxage=300" \
  --content-type "text/html" 2>/dev/null || true

find "$SITE_DIR" -name "*.json" -exec sh -c '
  for f; do
    rel="${f#'"$SITE_DIR"'/}"
    aws s3 cp "$f" "s3://'"$BUCKET_NAME"'/$rel" \
      --cache-control "public, max-age=60" \
      --content-type "application/json"
  done
' sh {} +

# Invalidate CloudFront cache
echo ""
echo "Invalidating CloudFront cache..."
aws cloudfront create-invalidation \
  --distribution-id "$DISTRIBUTION_ID" \
  --paths "/*" \
  --query 'Invalidation.Id' \
  --output text

echo ""
echo "=== Deployment Complete ==="
echo "URL: $SITE_URL"
