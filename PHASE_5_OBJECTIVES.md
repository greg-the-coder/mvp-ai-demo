# Phase 5: CI/CD Pipeline Fixes & OIDC Implementation

**Task ID:** 5bcffee2-63a3-42e8-a329-1b858585d132  
**Workspace:** phase-5-fix-cicd-c120  
**Branch:** feature/phase-5-fix-cicd-pipeline  
**Status:** In Progress  
**Created:** March 10, 2026

---

## Objectives

### 1. Investigate Pipeline Failures
- Review GitHub Actions workflow runs
- Identify failure points (test/build/deploy jobs)
- Document root causes and error messages
- Check for missing dependencies or configuration issues

### 2. Implement AWS OIDC Authentication (Security Best Practice)

**Why OIDC?**
- ✅ No long-lived credentials stored in GitHub
- ✅ Automatic token rotation
- ✅ Short-lived tokens (1 hour default)
- ✅ Better security posture
- ✅ Follows AWS and GitHub best practices
- ✅ Easier credential management

**Current Method (Static Credentials):**
```yaml
- name: Configure AWS credentials
  uses: aws-actions/configure-aws-credentials@v4
  with:
    aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
    aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    aws-region: us-east-1
```

**New Method (OIDC):**
```yaml
permissions:
  id-token: write  # Required for OIDC
  contents: read

- name: Configure AWS credentials
  uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: arn:aws:iam::ACCOUNT_ID:role/GitHubActionsRole
    aws-region: us-east-1
```

### 3. AWS OIDC Setup Steps

#### Step 1: Create OIDC Identity Provider in AWS IAM

**Console Path:** IAM → Identity providers → Add provider

- **Provider type:** OpenID Connect
- **Provider URL:** `https://token.actions.githubusercontent.com`
- **Audience:** `sts.amazonaws.com`

**CLI Command:**
```bash
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1
```

#### Step 2: Create IAM Role with Trust Policy

**Trust Policy:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:greg-the-coder/mvp-ai-demo:*"
        }
      }
    }
  ]
}
```

**Permissions Policy (Attach to Role):**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:*",
        "cloudfront:*",
        "cloudformation:*",
        "iam:PassRole",
        "iam:GetRole",
        "iam:CreateRole",
        "iam:DeleteRole",
        "iam:AttachRolePolicy",
        "iam:DetachRolePolicy",
        "ssm:GetParameter"
      ],
      "Resource": "*"
    }
  ]
}
```

**Note:** Refine permissions based on actual CDK requirements (least privilege).

#### Step 3: Update GitHub Workflow

Update `.github/workflows/deploy.yml`:

```yaml
name: Deploy Environment Status Dashboard

on:
  push:
    branches: [main]

permissions:
  id-token: write  # Required for OIDC
  contents: read

env:
  NODE_VERSION: "20"
  AWS_REGION: "us-east-1"

jobs:
  # ... test and build jobs remain the same ...

  deploy:
    name: Deploy to AWS
    needs: build
    runs-on: ubuntu-latest
    timeout-minutes: 20
    environment: production

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Download build artifacts
        uses: actions/download-artifact@v4
        with:
          name: dashboard-build
          path: dashboard/dist/

      - name: Configure AWS credentials via OIDC
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
          aws-region: ${{ env.AWS_REGION }}

      # ... rest of deploy steps ...
```

#### Step 4: Configure GitHub Secret

Add one secret in GitHub repository settings:
- `AWS_ROLE_ARN`: `arn:aws:iam::ACCOUNT_ID:role/GitHubActionsRole`

---

## Expected Deliverables

### 1. Fixed Workflows
- ✅ `.github/workflows/deploy.yml` - Updated with OIDC
- ✅ `.github/workflows/pr-check.yml` - Updated if needed
- ✅ All workflows passing successfully

### 2. Documentation
- ✅ `OIDC_SETUP.md` - Step-by-step OIDC setup guide
- ✅ Updated `CI_CD.md` - OIDC authentication section
- ✅ `PIPELINE_FIXES.md` - What was broken and how it was fixed

### 3. IAM Configuration
- ✅ IAM role ARN documented
- ✅ Required permissions documented
- ✅ CloudFormation/Terraform templates (optional)

---

## Testing Plan

1. **Syntax Validation:**
   - Validate workflow YAML syntax
   - Check for typos and formatting issues

2. **OIDC Authentication Test:**
   - Verify IAM role can be assumed
   - Check token exchange works
   - Confirm AWS credentials are available

3. **Pipeline End-to-End Test:**
   - Make a dummy commit to trigger pipeline
   - Verify test job passes
   - Verify build job passes
   - Verify deploy job passes
   - Check CloudFront deployment updates

4. **Verification:**
   - Visit CloudFront URL
   - Confirm changes are live
   - Check GitHub Actions logs for success

---

## Common Issues & Solutions

### Issue: "Error: Credentials could not be loaded"
**Cause:** OIDC provider not configured or trust policy incorrect  
**Solution:** Verify OIDC provider exists and trust policy matches repository

### Issue: "Error: User is not authorized to perform: sts:AssumeRoleWithWebIdentity"
**Cause:** Trust policy condition doesn't match  
**Solution:** Check `token.actions.githubusercontent.com:sub` condition includes correct repo

### Issue: "Error: Access Denied" during CDK deploy
**Cause:** IAM role lacks required permissions  
**Solution:** Add missing permissions to role's permissions policy

### Issue: Workflow fails with "id-token permission required"
**Cause:** Missing `id-token: write` permission  
**Solution:** Add to workflow permissions section

---

## Security Benefits of OIDC

| Aspect | Static Credentials | OIDC |
|--------|-------------------|------|
| **Credential Storage** | Stored in GitHub Secrets | No credentials stored |
| **Credential Lifetime** | Permanent until rotated | 1 hour (automatic) |
| **Rotation** | Manual | Automatic |
| **Compromise Risk** | High (if leaked) | Low (short-lived) |
| **Audit Trail** | Limited | Full CloudTrail logs |
| **Best Practice** | ❌ Not recommended | ✅ Recommended |

---

## Timeline

- **Investigation:** 30 minutes
- **OIDC Setup:** 1 hour
- **Testing:** 30 minutes
- **Documentation:** 30 minutes
- **Total:** 2-3 hours

---

## Success Criteria

- ✅ GitHub Actions workflow runs successfully end-to-end
- ✅ OIDC authentication working (no static credentials)
- ✅ All jobs (test, build, deploy) complete without errors
- ✅ CloudFront deployment updates automatically
- ✅ Documentation is clear and complete
- ✅ Security best practices followed

---

## References

- [GitHub Actions OIDC Documentation](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services)
- [AWS IAM OIDC Documentation](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_create_oidc.html)
- [aws-actions/configure-aws-credentials](https://github.com/aws-actions/configure-aws-credentials)
- [CDK Permissions Requirements](https://docs.aws.amazon.com/cdk/v2/guide/permissions.html)

---

**Status:** Task created and running  
**Monitor:** https://github.com/greg-the-coder/mvp-ai-demo/actions  
**Next:** Wait for task completion, then review and merge fixes
