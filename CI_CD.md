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

## Authentication: AWS OIDC (Recommended)

The pipeline uses **OpenID Connect (OIDC)** to authenticate with AWS — no static credentials needed.

### Required GitHub Secret

| Secret         | Required | Description                                      |
|----------------|----------|--------------------------------------------------|
| `AWS_ROLE_ARN` | Yes      | IAM role ARN for OIDC (e.g., `arn:aws:iam::123456789012:role/GitHubActionsRole-mvp-ai-demo`) |

### How It Works

1. GitHub Actions requests an OIDC token from GitHub's identity provider
2. The token is exchanged with AWS STS for short-lived credentials
3. The IAM role's trust policy validates the token came from this repository
4. No long-lived secrets are stored in GitHub

### Setup

See [OIDC_SETUP.md](./OIDC_SETUP.md) for complete AWS OIDC setup instructions.

### IAM Role Requirements

The OIDC IAM role needs permissions for:
- **S3**: Create/manage buckets, upload objects
- **CloudFront**: Create/manage distributions
- **CloudFormation**: Create/update/delete stacks
- **IAM**: Create roles for CloudFormation (CDK bootstrap)
- **SSM**: Parameter store access (if used by CDK)
- **STS**: AssumeRole for CDK execution roles

## Setup Instructions

### 1. Bootstrap CDK (one-time)

```bash
cd infra
npx cdk bootstrap aws://ACCOUNT_ID/us-east-1
```

### 2. Configure AWS OIDC and GitHub Secret

Follow [OIDC_SETUP.md](./OIDC_SETUP.md), then:

```bash
# Set the IAM role ARN as a GitHub secret
gh secret set AWS_ROLE_ARN --body "arn:aws:iam::ACCOUNT_ID:role/GitHubActionsRole-mvp-ai-demo"
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

- Verify `AWS_ROLE_ARN` secret is set in GitHub repository settings
- Ensure the OIDC identity provider exists in AWS IAM
- Check the IAM role trust policy matches the repository name
- See [OIDC_SETUP.md](./OIDC_SETUP.md) troubleshooting section

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
# Use OIDC role or configure credentials via AWS CLI profile
export AWS_REGION="us-east-1"
npx cdk deploy --require-approval never

# 3. Verify
# Check the CloudFront URL from CDK output
```

## Caching

The pipeline caches `node_modules` via `actions/setup-node@v4`'s built-in npm cache, keyed on `package-lock.json`. This significantly reduces install times on repeated runs.

## Security Considerations

- **OIDC authentication** — No static AWS credentials stored; short-lived tokens used per run
- The deploy job uses a `production` environment for optional protection rules
- Workflow permissions include `id-token: write` (required for OIDC) and `contents: read`
- IAM trust policy scoped to `repo:greg-the-coder/mvp-ai-demo:*`
- The destroy workflow requires manual confirmation
- Follow least-privilege principle for the IAM role permissions
