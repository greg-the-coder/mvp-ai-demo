# Environment Status Dashboard - CDK Infrastructure

AWS CDK infrastructure for the Environment Status Dashboard. Provisions S3 static hosting with a CloudFront HTTPS distribution, automated React build deployment, and IAM deployment roles.

## Architecture

- **S3 Bucket** — Stores static site assets with `BlockPublicAccess.BLOCK_ALL`
- **CloudFront Distribution** — HTTPS-only CDN with TLS 1.2+, HTTP/2+3, SPA error handling (403/404 → index.html)
- **Origin Access Control** — Restricts S3 access to CloudFront only
- **S3 BucketDeployment** — Automatically uploads built React assets and invalidates CloudFront cache
- **IAM Deployment Role** — Scoped permissions for CI/CD to deploy assets and invalidate cache

## Prerequisites

- Node.js 20+
- AWS CLI configured with credentials (`aws configure`)
- AWS CDK CLI (`npx cdk` or `npm install -g aws-cdk`)

## Full-Stack Deployment (Recommended)

The unified deployment script builds the React app and deploys the CDK stack in one step:

```bash
# From the project root
./scripts/deploy-full-stack.sh dev
```

This script will:
1. Install frontend dependencies (if needed)
2. Build the React application (`npm run build`)
3. Install CDK dependencies (if needed)
4. Synthesize and deploy the CloudFormation stack with built assets
5. Output the deployed site URL

## CDK-Only Deployment

If you've already built the React app, you can deploy just the CDK stack:

```bash
cd cdk/
npm install

# Deploy with site assets from the project dist/ directory
npx cdk deploy -c envName=dev -c siteAssetsPath=../dist

# Or deploy infrastructure only (no site assets)
npx cdk deploy -c envName=dev
```

## Quick Start

```bash
cd cdk/

# Install dependencies
npm install

# Bootstrap CDK (first time only, per account/region)
npx cdk bootstrap

# Synthesize the CloudFormation template
npx cdk synth -c envName=dev

# Full-stack deploy (build + deploy)
cd .. && ./scripts/deploy-full-stack.sh dev
```

## Deployment Scripts

All scripts accept an environment name as the first argument (`dev`, `staging`, `prod`).

```bash
# Full-stack: build React app + deploy CDK stack (from project root)
./scripts/deploy-full-stack.sh dev

# Synthesize only (validate template, from cdk/)
./scripts/synth.sh dev

# CDK deploy only (existing built assets, from cdk/)
./scripts/deploy.sh dev ../dist

# Tear down (from cdk/)
./scripts/destroy.sh dev
```

## SPA Routing

The CloudFront distribution is configured with custom error responses to support client-side routing:
- HTTP 403 → serves `/index.html` (200)
- HTTP 404 → serves `/index.html` (200)

This ensures that deep links and browser refreshes work correctly with React Router or similar SPA routing libraries.

## CDK Context Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `envName` | `dev` | Environment name (`dev`, `staging`, `prod`) |
| `siteAssetsPath` | _(none)_ | Path to built site assets. When provided, files are deployed to S3 with CloudFront invalidation. |

## Environments

| Environment | S3 Retention | Versioning | Cache |
|-------------|--------------|------------|-------|
| `dev`       | Destroy      | Off        | Short |
| `staging`   | Destroy      | Off        | Short |
| `prod`      | Retain       | On         | Long  |

## Stack Outputs

After deployment, the stack exports:

| Output | Description |
|--------|-------------|
| `BucketName` | S3 bucket name |
| `DistributionId` | CloudFront distribution ID |
| `DistributionDomainName` | CloudFront domain |
| `SiteUrl` | Full HTTPS URL |
| `DeploymentRoleArn` | IAM role ARN for CI/CD |

## Project Structure

```
cdk/
├── bin/
│   └── app.ts                    # CDK app entry point
├── lib/
│   └── static-hosting-stack.ts   # Main infrastructure stack
├── scripts/
│   ├── deploy.sh                 # CDK-only deployment script
│   ├── destroy.sh                # Teardown script
│   └── synth.sh                  # Synthesize-only script
├── cdk.json                      # CDK configuration
├── package.json
└── tsconfig.json

scripts/
└── deploy-full-stack.sh          # Unified build + deploy script
```
