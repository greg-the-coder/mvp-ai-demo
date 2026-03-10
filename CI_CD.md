# CI/CD Pipeline Documentation

## Overview

The Environment Status Dashboard uses GitHub Actions for continuous integration and deployment. The pipeline automates testing, building, and deploying the React dashboard to AWS via CDK.

## Pipeline Architecture

```
Push to main
    │
    ▼
┌─────────┐     ┌─────────┐     ┌──────────┐
│  Test    │────▶│  Build  │────▶│  Deploy  │
│  Job     │     │  Job    │     │  Job     │
└─────────┘     └─────────┘     └──────────┘
│ Lint          │ npm build     │ Download artifacts
│ Build test    │ Upload dist/  │ Configure AWS
│ Verify        │               │ CDK deploy
│ artifacts     │               │ Output URL
```

## Workflows

### 1. Deploy (`deploy.yml`)

**Trigger:** Push to `main` branch

| Job    | Purpose                          | Timeout |
|--------|----------------------------------|---------|
| test   | Lint + build verification        | 10 min  |
| build  | Production build + artifact upload | 10 min |
| deploy | CDK deploy to AWS                | 20 min  |

### 2. PR Check (`pr-check.yml`)

**Trigger:** Pull request targeting `main`

- Runs lint and build on the dashboard
- Validates CDK template with `cdk synth`

### 3. Destroy (`destroy.yml`)

**Trigger:** Manual (workflow_dispatch)

- Requires typing "destroy" to confirm
- Tears down all AWS infrastructure via `cdk destroy`

## Required GitHub Secrets

Configure these in **Settings > Secrets and variables > Actions**:

| Secret                 | Required | Description                     |
|------------------------|----------|---------------------------------|
| `AWS_ACCESS_KEY_ID`    | Yes      | IAM access key for deployment   |
| `AWS_SECRET_ACCESS_KEY`| Yes      | IAM secret key for deployment   |
| `AWS_REGION`           | No       | AWS region (default: us-east-1) |

### IAM Policy Requirements

The deployment IAM user needs permissions for:
- **S3**: Create/manage buckets, upload objects
- **CloudFront**: Create/manage distributions
- **CloudFormation**: Create/update/delete stacks
- **IAM**: Create roles for CloudFormation (if CDK bootstrapped)
- **SSM**: Parameter store access (if used by CDK)

Recommended: Use a dedicated IAM user with only the permissions above.

## Setup Instructions

### 1. Bootstrap CDK (one-time)

```bash
cd infra
npx cdk bootstrap aws://ACCOUNT_ID/us-east-1
```

### 2. Configure GitHub Secrets

```bash
# Using GitHub CLI
gh secret set AWS_ACCESS_KEY_ID --body "AKIA..."
gh secret set AWS_SECRET_ACCESS_KEY --body "wJal..."
gh secret set AWS_REGION --body "us-east-1"
```

### 3. Create GitHub Environment

Create a `production` environment in **Settings > Environments** for deploy job protection rules (optional).

### 4. Push to main

```bash
git checkout main
git merge feature/phase-4-cicd-pipeline
git push origin main
```

The pipeline will trigger automatically.

## Troubleshooting

### Build Fails: "dist/ not found"

The dashboard build didn't produce output. Check:
- `dashboard/package.json` has a valid `build` script
- `dashboard/vite.config.ts` outputs to `dist/`

### Deploy Fails: "AWS credentials not configured"

- Verify secrets are set in GitHub repository settings
- Ensure the IAM user is active and keys are not rotated

### Deploy Fails: "CDK bootstrap required"

Run CDK bootstrap for your account/region:
```bash
npx cdk bootstrap aws://ACCOUNT_ID/REGION
```

### Deploy Fails: "Stack update in progress"

A previous deployment may still be running. Wait for it to complete or check CloudFormation console.

### CDK Synth Fails on PR

- Ensure `infra/package.json` dependencies are up to date
- Check that CDK app entry point is correct in `infra/cdk.json`

## Manual Deployment Fallback

If the pipeline is unavailable, deploy manually:

```bash
# 1. Build the dashboard
cd dashboard
npm ci
npm run build

# 2. Deploy infrastructure
cd ../infra
npm ci
export AWS_ACCESS_KEY_ID="..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_REGION="us-east-1"
npx cdk deploy --require-approval never

# 3. Verify
# Check the CloudFront URL from CDK output
```

## Caching

The pipeline caches `node_modules` via `actions/setup-node@v4`'s built-in npm cache, keyed on `package-lock.json`. This significantly reduces install times on repeated runs.

## Security Considerations

- AWS credentials are stored as GitHub encrypted secrets, never in code
- The deploy job uses a `production` environment for optional protection rules
- Workflow permissions are set to read-only (`contents: read`)
- The destroy workflow requires manual confirmation
- Follow least-privilege principle for the deployment IAM user
