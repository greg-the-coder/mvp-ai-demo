# Pipeline Fixes Documentation

## Summary

All 4 GitHub Actions workflow runs for the Deploy Environment Status Dashboard failed. This document details the root causes and fixes applied.

## Investigation

### Workflow Runs Analyzed

| Run | Commit | Duration | Status |
|-----|--------|----------|--------|
| #4 | f503edf - "Add Phase 5 objectives" | 39s | Failed |
| #3 | bcec605 - "Add comprehensive project summary" | 46s | Failed |
| #2 | 9f0987e - "Add CI/CD badge to dashboard header" | 52s | Failed |
| #1 | 3b04048 - "Merge Phase 4: CI/CD pipeline" | 52s | Failed |

### Root Cause

**All runs failed at the same point:** The `Deploy to AWS` job, step "Configure AWS credentials".

**Error message:**
```
Credentials could not be loaded, please check your action inputs:
Could not load credentials from any providers
```

**Cause:** The workflow used static AWS credentials (`AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`) via GitHub secrets, but these secrets were never configured in the repository settings.

### What Worked

- **Test job:** Passed in all runs (lint, build, artifact verification)
- **Build job:** Passed in all runs (production build, artifact upload)
- **Build artifacts:** Successfully produced (67.4 KB dashboard build)

### Additional Issues

- **Node.js 20 deprecation warnings:** All actions using Node.js 20 will be forced to run with Node.js 24 by default starting June 2, 2026. Non-blocking but noted.

## Fixes Applied

### 1. Replaced Static Credentials with OIDC Authentication

**Files changed:**
- `.github/workflows/deploy.yml`
- `.github/workflows/destroy.yml`

**Before:**
```yaml
permissions:
  contents: read

- name: Configure AWS credentials
  uses: aws-actions/configure-aws-credentials@v4
  with:
    aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
    aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    aws-region: ${{ secrets.AWS_REGION || 'us-east-1' }}
```

**After:**
```yaml
permissions:
  id-token: write  # Required for OIDC
  contents: read

- name: Configure AWS credentials (OIDC)
  uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
    aws-region: us-east-1
```

**Benefits:**
- No long-lived credentials to manage or rotate
- Short-lived tokens issued per workflow run
- Scoped to specific repository via IAM trust policy
- AWS and GitHub recommended best practice

### 2. Centralized AWS Region Configuration

**Before:** Region was passed via `${{ secrets.AWS_REGION || 'us-east-1' }}` (secret + fallback)

**After:** Region defined as workflow-level environment variable:
```yaml
env:
  AWS_REGION: "us-east-1"
```

This avoids the unnecessary secret and makes the configuration explicit.

## Required Setup (AWS Side)

For the pipeline to work, the following AWS resources must be created:

1. **OIDC Identity Provider** in IAM for `token.actions.githubusercontent.com`
2. **IAM Role** (`GitHubActionsRole-mvp-ai-demo`) with:
   - Trust policy scoped to `repo:greg-the-coder/mvp-ai-demo:*`
   - Permissions for S3, CloudFront, CloudFormation, IAM, SSM
3. **GitHub Secret** `AWS_ROLE_ARN` set to the role ARN

See [OIDC_SETUP.md](./OIDC_SETUP.md) for detailed setup instructions.

## Verification

After OIDC setup is complete:

1. Push a commit to `main`
2. Check the GitHub Actions run
3. All three jobs (Test, Build, Deploy) should pass
4. CloudFront URL should appear in the deployment summary

## Emergency Fallback

If OIDC is not available and static credentials must be used temporarily:

1. Revert the credential step in `deploy.yml` to use `aws-access-key-id` and `aws-secret-access-key`
2. Set `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` as GitHub secrets
3. Remove `id-token: write` permission (or keep it, no harm)
4. Migrate to OIDC as soon as possible
