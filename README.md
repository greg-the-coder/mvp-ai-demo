# Environment Status Dashboard

[![Deploy](https://github.com/<OWNER>/<REPO>/actions/workflows/deploy.yml/badge.svg)](https://github.com/<OWNER>/<REPO>/actions/workflows/deploy.yml)
[![PR Check](https://github.com/<OWNER>/<REPO>/actions/workflows/pr-check.yml/badge.svg)](https://github.com/<OWNER>/<REPO>/actions/workflows/pr-check.yml)

> **Note:** Replace `<OWNER>/<REPO>` in the badges above with your GitHub repository path.

A React-based dashboard for monitoring environment status, deployed to AWS via CDK with automated CI/CD.

## Project Structure

```
mvp-ai-demo/
├── dashboard/          # React application (Vite + TypeScript)
├── infra/              # AWS CDK infrastructure
├── .github/workflows/  # CI/CD pipelines
│   ├── deploy.yml      # Main deploy pipeline (push to main)
│   ├── pr-check.yml    # PR validation checks
│   └── destroy.yml     # Manual infrastructure teardown
├── CI_CD.md            # Detailed pipeline documentation
└── README.md
```

## Quick Start

### Local Development

```bash
cd dashboard
npm install
npm run dev
```

### Deploy to AWS

Deployment is automated via GitHub Actions on push to `main`. See [CI/CD Documentation](CI_CD.md) for details.

## CI/CD Pipeline

The deployment pipeline runs automatically on every push to `main`:

```
Push to main → Test → Build → Deploy to AWS
```

| Stage  | What it does                              |
|--------|-------------------------------------------|
| Test   | Lints code and verifies build succeeds    |
| Build  | Creates production build, uploads artifacts |
| Deploy | Configures AWS, runs CDK deploy           |

### Setup

1. **Configure AWS OIDC Authentication** (required for deployment):

   Set up OIDC between GitHub Actions and AWS (see [OIDC_SETUP.md](OIDC_SETUP.md)), then add:

   | Secret         | Description                                  |
   |----------------|----------------------------------------------|
   | `AWS_ROLE_ARN` | IAM role ARN for OIDC-based deployment       |

2. **Bootstrap CDK** (one-time):
   ```bash
   cd infra && npx cdk bootstrap aws://ACCOUNT_ID/us-east-1
   ```

3. **Push to main** to trigger deployment.

### Manual Teardown

Use the "Destroy Infrastructure" workflow in GitHub Actions (requires typing "destroy" to confirm).

For full pipeline documentation, troubleshooting, and manual deployment steps, see [CI_CD.md](CI_CD.md).
