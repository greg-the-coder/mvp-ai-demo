# CI/CD Workflows

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| [deploy.yml](deploy.yml) | Push to `main`, manual | Build, test, deploy to AWS via CDK |
| [pr-check.yml](pr-check.yml) | Pull request to `main` | Lint, build, test, CDK synth validation |
| [destroy.yml](destroy.yml) | Manual (requires "destroy" confirmation) | Tear down AWS infrastructure |

## Prerequisites

1. **AWS OIDC** configured (run `./setup-oidc.sh` once)
2. **GitHub Secret** `AWS_ROLE_ARN` set to the OIDC role ARN from setup output
