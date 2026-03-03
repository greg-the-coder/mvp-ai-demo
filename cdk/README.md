# Environment Status Dashboard - CDK Infrastructure

AWS CDK infrastructure for the Environment Status Dashboard. Provisions S3 static hosting with a CloudFront HTTPS distribution and IAM deployment roles.

## Architecture

- **S3 Bucket** — Stores static site assets with `BlockPublicAccess.BLOCK_ALL`
- **CloudFront Distribution** — HTTPS-only CDN with TLS 1.2+, HTTP/2+3, SPA error handling
- **Origin Access Identity** — Restricts S3 access to CloudFront only
- **IAM Deployment Role** — Scoped permissions for CI/CD to deploy assets and invalidate cache

## Prerequisites

- Node.js 20+
- AWS CLI configured with credentials (`aws configure`)
- AWS CDK CLI (`npx cdk` or `npm install -g aws-cdk`)

## Quick Start

```bash
cd cdk/

# Install dependencies
npm install

# Bootstrap CDK (first time only, per account/region)
npx cdk bootstrap

# Synthesize the CloudFormation template
npx cdk synth -c envName=dev

# Deploy
npx cdk deploy -c envName=dev
```

## Deployment Scripts

All scripts accept an environment name as the first argument (`dev`, `staging`, `prod`).

```bash
# Synthesize only (validate template)
./scripts/synth.sh dev

# Full deploy: CDK stack + upload site files + CloudFront invalidation
./scripts/deploy.sh dev ../dist

# Tear down
./scripts/destroy.sh dev
```

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
│   └── app.ts                # CDK app entry point
├── lib/
│   └── static-hosting-stack.ts  # Main infrastructure stack
├── scripts/
│   ├── deploy.sh             # Full deployment script
│   ├── destroy.sh            # Teardown script
│   └── synth.sh              # Synthesize-only script
├── cdk.json                  # CDK configuration
├── package.json
└── tsconfig.json
```
