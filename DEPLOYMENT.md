# Deployment Guide

## Production Environment

- **CloudFront URL:** https://d1kev1ii8chqu9.cloudfront.net
- **Deployment Date:** 2026-03-10
- **AWS Account:** 227462955655
- **Region:** us-east-1
- **Stack Name:** InfraStack

## Architecture

- **S3 Bucket:** Hosts static build artifacts (private, no public access)
- **CloudFront Distribution:** CDN with HTTPS, Origin Access Control to S3
- **SPA Routing:** 403/404 errors redirect to `/index.html` for client-side routing

## Deploying Updates

```bash
# 1. Build the React app
cd dashboard
npm run build

# 2. Deploy via CDK (uploads to S3 + invalidates CloudFront)
cd ../infra
npx cdk deploy --require-approval never
```

## Verification Steps

1. Open https://d1kev1ii8chqu9.cloudfront.net
2. Verify all 6 services display in the grid
3. Check health indicators show correct colors (green/yellow/red)
4. Confirm relative timestamps appear (e.g., "30 minutes ago")
5. Look for drift warning badges on Payment Service and Search Service
6. Click the Refresh button - data should reload
7. Open browser console - no errors should appear
8. Verify URL uses HTTPS

## Troubleshooting

| Issue | Solution |
|-------|----------|
| CloudFront returns 403 | Check S3 bucket policy allows CloudFront OAC access |
| Old content after deploy | CDK automatically invalidates cache; wait 1-2 min for propagation |
| Build fails | Run `npm install` in `dashboard/` first, ensure Node.js 20+ |
| CDK deploy fails | Run `cdk bootstrap` first; check AWS credentials are valid |
| Blank page | Check browser console; ensure `dist/` folder exists with built assets |

## Destroying the Stack

```bash
cd infra
npx cdk destroy
```

This will remove the S3 bucket (auto-deletes objects), CloudFront distribution, and all associated resources.
