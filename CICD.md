# CI/CD Pipeline & OIDC Setup

## Overview

The project uses **GitHub Actions** for CI/CD and **AWS OIDC** for secure, credential-free authentication. No static AWS access keys are stored in GitHub.

```
Push to main ─▶ Test (lint + build + test) ─▶ Deploy (OIDC auth + CDK deploy)
PR to main   ─▶ Validate (lint + build + test + cdk synth)
Manual       ─▶ Destroy (requires "destroy" confirmation)
```

---

## Workflows

| Workflow | File | Trigger | Purpose |
|----------|------|---------|---------|
| Deploy | `.github/workflows/deploy.yml` | Push to `main`, manual | Build → test → deploy to AWS |
| PR Check | `.github/workflows/pr-check.yml` | PR to `main` | Lint, build, test, CDK synth validation |
| Destroy | `.github/workflows/destroy.yml` | Manual only | Tear down `EnvDashboardStack` (requires typing "destroy") |

---

## OIDC Authentication Flow

```
GitHub Actions                     AWS
─────────────                     ───
1. Request OIDC token ──────────▶
                                   2. Validate token against
                                      IAM OIDC Identity Provider
                                   3. Check trust policy:
                                      - aud == sts.amazonaws.com
                                      - sub matches repo:greg-the-coder/mvp-ai-demo:*
                          ◀──────── 4. Issue temporary STS credentials
5. Use credentials for CDK deploy
```

### Why OIDC?
- **No static credentials** — no `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` to rotate or leak
- **Scoped trust** — role can only be assumed by this specific GitHub repo
- **Temporary credentials** — 1-hour max session, automatically expire
- **AWS + GitHub recommended** approach

---

## Initial Setup (One-Time)

### Prerequisites
1. AWS CLI configured with credentials that can create IAM resources
2. CDK bootstrapped in `us-east-1` (`npx cdk bootstrap aws://<ACCOUNT_ID>/us-east-1`)
3. Write access to the GitHub repo settings

### Step 1: Deploy the OIDC Stack

```bash
./setup-oidc.sh
```

This creates:
- IAM OIDC Identity Provider for `token.actions.githubusercontent.com`
- IAM Role `github-actions-env-dashboard` trusting this repo
- Outputs the Role ARN

### Step 2: Add GitHub Secret

1. Go to **[repo Settings → Secrets → Actions](https://github.com/greg-the-coder/mvp-ai-demo/settings/secrets/actions)**
2. Create secret:
   - **Name:** `AWS_ROLE_ARN`
   - **Value:** *(the Role ARN from setup-oidc.sh output)*

### Step 3: Push to `main`

The deploy workflow triggers automatically on push to `main`.

---

## AWS Resources Created

### By `GitHubOidcStack` (deployed via `setup-oidc.sh`):

| Resource | Purpose |
|----------|---------|
| IAM OIDC Provider | Validates GitHub Actions JWT tokens |
| IAM Role `github-actions-env-dashboard` | Assumed by GitHub Actions via OIDC |

### IAM Role Permissions (Least Privilege):

| Permission | Scope | Purpose |
|-----------|-------|---------|
| `sts:AssumeRole` | `cdk-hnb659fds-*` roles | Assume CDK bootstrap roles for deploy |
| `cloudformation:Describe*`, `GetTemplate` | `*` | CDK CLI reads stack state |
| `ssm:GetParameter` | `cdk-bootstrap/*` | CDK bootstrap version check |
| `s3:Get/Put/List` | `cdk-hnb659fds-assets-*` | Upload CDK assets |

---

## Pipeline Details

### Deploy Pipeline (`deploy.yml`)

**Jobs:**

1. **test** — runs on every push
   - Lint frontend (`eslint src/`)
   - Build frontend (`npm run build`)
   - Test backend (`npm test`)
   - Upload `dashboard/dist/` as artifact

2. **deploy** — runs after `test` passes
   - Download frontend build artifact
   - Authenticate via OIDC → `${{ secrets.AWS_ROLE_ARN }}`
   - `cdk deploy EnvDashboardStack`
   - Print dashboard URL to job summary

**Concurrency:** Only one deploy runs at a time (`cancel-in-progress: false`).

### PR Check (`pr-check.yml`)

Single **validate** job:
- Lint frontend
- Build frontend
- Test backend
- TypeScript compile check (`tsc --noEmit`)
- CDK synth validation (`cdk synth --quiet`)

No AWS credentials needed — no actual deployment.

### Destroy (`destroy.yml`)

Manual dispatch only. Requires typing "destroy" to confirm. Tears down `EnvDashboardStack` via `cdk destroy --force`.

---

## Troubleshooting

### "Error: Not authorized to perform sts:AssumeRoleWithWebIdentity"
- Verify `AWS_ROLE_ARN` secret is set correctly in GitHub
- Confirm the OIDC stack deployed successfully (`./setup-oidc.sh`)
- Check that the role trust policy matches the repo name exactly

### "No bootstrap stack found"
- Run `npx cdk bootstrap aws://<ACCOUNT_ID>/us-east-1` in the AWS account

### "CDK deploy fails with access denied"
- The OIDC role assumes CDK bootstrap roles. Ensure CDK bootstrap was run with default qualifier (`hnb659fds`)
