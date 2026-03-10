# AWS OIDC Setup for GitHub Actions

This guide walks through configuring OpenID Connect (OIDC) authentication between GitHub Actions and AWS, replacing static IAM credentials with short-lived tokens.

## Why OIDC?

- **No long-lived credentials** — No `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` to manage or rotate
- **Automatic token rotation** — Each workflow run gets a fresh, short-lived token
- **Scoped access** — Trust policy restricts access to this specific repository
- **AWS best practice** — Recommended by both AWS and GitHub

## Prerequisites

- AWS account with IAM admin access
- GitHub repository: `greg-the-coder/mvp-ai-demo`

## Step 1: Create OIDC Identity Provider in AWS

### AWS Console

1. Go to **IAM > Identity providers > Add provider**
2. Select **OpenID Connect**
3. Enter:
   - **Provider URL:** `https://token.actions.githubusercontent.com`
   - **Audience:** `sts.amazonaws.com`
4. Click **Add provider**

### AWS CLI

```bash
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1
```

> **Note:** The thumbprint may change. AWS automatically validates the provider URL, so the thumbprint is primarily a formality for GitHub's OIDC provider.

## Step 2: Create IAM Role

### Trust Policy

Create a file `github-actions-trust-policy.json`:

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

> **Replace** `ACCOUNT_ID` with your 12-digit AWS account ID.

### Create the Role

```bash
aws iam create-role \
  --role-name GitHubActionsRole-mvp-ai-demo \
  --assume-role-policy-document file://github-actions-trust-policy.json \
  --description "GitHub Actions OIDC role for mvp-ai-demo deployments"
```

## Step 3: Attach Permissions Policy

The role needs permissions for CDK deployment (S3, CloudFront, CloudFormation, IAM, SSM).

### Option A: Managed Policies (Quick Start)

```bash
# For CDK deployments, these cover most use cases:
aws iam attach-role-policy \
  --role-name GitHubActionsRole-mvp-ai-demo \
  --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess

aws iam attach-role-policy \
  --role-name GitHubActionsRole-mvp-ai-demo \
  --policy-arn arn:aws:iam::aws:policy/CloudFrontFullAccess

aws iam attach-role-policy \
  --role-name GitHubActionsRole-mvp-ai-demo \
  --policy-arn arn:aws:iam::aws:policy/AWSCloudFormationFullAccess

aws iam attach-role-policy \
  --role-name GitHubActionsRole-mvp-ai-demo \
  --policy-arn arn:aws:iam::aws:policy/IAMFullAccess
```

### Option B: Custom Least-Privilege Policy (Recommended for Production)

Create `cdk-deploy-policy.json`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3Access",
      "Effect": "Allow",
      "Action": [
        "s3:CreateBucket",
        "s3:DeleteBucket",
        "s3:PutBucketPolicy",
        "s3:GetBucketPolicy",
        "s3:DeleteBucketPolicy",
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket",
        "s3:PutBucketWebsite",
        "s3:GetBucketWebsite",
        "s3:PutBucketPublicAccessBlock",
        "s3:GetBucketPublicAccessBlock",
        "s3:PutEncryptionConfiguration",
        "s3:GetEncryptionConfiguration"
      ],
      "Resource": "*"
    },
    {
      "Sid": "CloudFrontAccess",
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateDistribution",
        "cloudfront:UpdateDistribution",
        "cloudfront:DeleteDistribution",
        "cloudfront:GetDistribution",
        "cloudfront:CreateInvalidation",
        "cloudfront:CreateOriginAccessControl",
        "cloudfront:DeleteOriginAccessControl",
        "cloudfront:GetOriginAccessControl",
        "cloudfront:ListDistributions",
        "cloudfront:TagResource"
      ],
      "Resource": "*"
    },
    {
      "Sid": "CloudFormationAccess",
      "Effect": "Allow",
      "Action": [
        "cloudformation:CreateStack",
        "cloudformation:UpdateStack",
        "cloudformation:DeleteStack",
        "cloudformation:DescribeStacks",
        "cloudformation:DescribeStackEvents",
        "cloudformation:GetTemplate",
        "cloudformation:CreateChangeSet",
        "cloudformation:ExecuteChangeSet",
        "cloudformation:DeleteChangeSet",
        "cloudformation:DescribeChangeSet"
      ],
      "Resource": "*"
    },
    {
      "Sid": "IAMForCDK",
      "Effect": "Allow",
      "Action": [
        "iam:CreateRole",
        "iam:DeleteRole",
        "iam:AttachRolePolicy",
        "iam:DetachRolePolicy",
        "iam:PutRolePolicy",
        "iam:DeleteRolePolicy",
        "iam:GetRole",
        "iam:GetRolePolicy",
        "iam:PassRole",
        "iam:TagRole"
      ],
      "Resource": "arn:aws:iam::*:role/EnvStatusDashboard*"
    },
    {
      "Sid": "SSMAccess",
      "Effect": "Allow",
      "Action": [
        "ssm:GetParameter",
        "ssm:PutParameter"
      ],
      "Resource": "*"
    },
    {
      "Sid": "STSAccess",
      "Effect": "Allow",
      "Action": [
        "sts:AssumeRole"
      ],
      "Resource": "arn:aws:iam::*:role/cdk-*"
    }
  ]
}
```

```bash
aws iam put-role-policy \
  --role-name GitHubActionsRole-mvp-ai-demo \
  --policy-name CDKDeployPolicy \
  --policy-document file://cdk-deploy-policy.json
```

## Step 4: Configure GitHub Repository Secret

Add the IAM Role ARN as a GitHub secret:

```bash
# Using GitHub CLI
gh secret set AWS_ROLE_ARN --body "arn:aws:iam::ACCOUNT_ID:role/GitHubActionsRole-mvp-ai-demo"
```

Or in the GitHub UI:
1. Go to **Settings > Secrets and variables > Actions**
2. Click **New repository secret**
3. Name: `AWS_ROLE_ARN`
4. Value: `arn:aws:iam::ACCOUNT_ID:role/GitHubActionsRole-mvp-ai-demo`

## Step 5: Verify

Push a commit to `main` and check the GitHub Actions run:

```bash
git commit --allow-empty -m "Test OIDC pipeline"
git push origin main
```

The deploy job should now authenticate via OIDC instead of static credentials.

## Troubleshooting

### "Not authorized to perform: sts:AssumeRoleWithWebIdentity"

- Verify the OIDC provider exists in IAM
- Check the trust policy `Condition` matches your repository name exactly
- Ensure `id-token: write` permission is set in the workflow

### "Audience in token does not match"

- Verify the OIDC provider audience is set to `sts.amazonaws.com`
- Check the trust policy condition for `token.actions.githubusercontent.com:aud`

### "No OpenIDConnect provider found"

- The OIDC identity provider hasn't been created in IAM
- Run Step 1 above

### "Role ARN is not valid"

- Check the `AWS_ROLE_ARN` secret value in GitHub
- Ensure the role exists and the ARN format is correct: `arn:aws:iam::ACCOUNT_ID:role/ROLE_NAME`

### Deploy works but CDK fails with permissions

- The IAM role may not have sufficient permissions
- Check CloudFormation events for specific permission errors
- Add missing permissions to the role policy

## CloudFormation Template (Optional)

For automated OIDC setup, use this CloudFormation template:

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Description: GitHub Actions OIDC Provider and Role for mvp-ai-demo

Parameters:
  GitHubOrg:
    Type: String
    Default: greg-the-coder
  GitHubRepo:
    Type: String
    Default: mvp-ai-demo

Resources:
  GitHubOIDCProvider:
    Type: AWS::IAM::OIDCProvider
    Properties:
      Url: https://token.actions.githubusercontent.com
      ClientIdList:
        - sts.amazonaws.com
      ThumbprintList:
        - 6938fd4d98bab03faadb97b34396831e3780aea1

  GitHubActionsRole:
    Type: AWS::IAM::Role
    Properties:
      RoleName: !Sub 'GitHubActionsRole-${GitHubRepo}'
      AssumeRolePolicyDocument:
        Version: '2012-10-17'
        Statement:
          - Effect: Allow
            Principal:
              Federated: !Ref GitHubOIDCProvider
            Action: sts:AssumeRoleWithWebIdentity
            Condition:
              StringEquals:
                token.actions.githubusercontent.com:aud: sts.amazonaws.com
              StringLike:
                token.actions.githubusercontent.com:sub: !Sub 'repo:${GitHubOrg}/${GitHubRepo}:*'
      ManagedPolicyArns:
        - arn:aws:iam::aws:policy/AmazonS3FullAccess
        - arn:aws:iam::aws:policy/CloudFrontFullAccess
        - arn:aws:iam::aws:policy/AWSCloudFormationFullAccess

Outputs:
  RoleArn:
    Description: IAM Role ARN for GitHub Actions
    Value: !GetAtt GitHubActionsRole.Arn
    Export:
      Name: GitHubActionsRoleArn
```

Deploy with:

```bash
aws cloudformation deploy \
  --template-file github-oidc.yaml \
  --stack-name github-oidc-mvp-ai-demo \
  --capabilities CAPABILITY_NAMED_IAM
```

## Security Notes

- The trust policy scopes access to `repo:greg-the-coder/mvp-ai-demo:*` — only this repo can assume the role
- Tokens are short-lived (typically 1 hour) and automatically expire
- No credentials are stored in GitHub secrets (only the role ARN)
- For stricter control, scope the trust policy to specific branches:
  ```json
  "token.actions.githubusercontent.com:sub": "repo:greg-the-coder/mvp-ai-demo:ref:refs/heads/main"
  ```
