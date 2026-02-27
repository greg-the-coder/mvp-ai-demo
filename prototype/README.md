# Environment Status Dashboard

A web-based dashboard that displays real-time deployment status for all services across all environments (Development, Staging, Production) in a single, scannable view.

## Architecture

- **Frontend:** React 18 + Vite + Tailwind CSS
- **Infrastructure:** AWS CDK (TypeScript) - S3 + CloudFront static hosting

## Quick Start (Local Development)

```bash
cd frontend
npm install
npm run dev
# Opens on http://localhost:3000
```

## Project Structure

```
prototype/
├── cdk/                        # AWS CDK infrastructure
│   ├── bin/cdk.ts              # CDK app entry point
│   ├── lib/dashboard-stack.ts  # S3 + CloudFront stack
│   ├── package.json
│   └── tsconfig.json
├── frontend/                   # React application
│   ├── src/
│   │   ├── App.jsx             # Root component
│   │   ├── components/
│   │   │   ├── Header.jsx          # Title + refresh + last updated
│   │   │   ├── StatusGrid.jsx      # Table grid layout
│   │   │   ├── ServiceRow.jsx      # Per-service row with drift calc
│   │   │   ├── StatusCell.jsx      # Per-environment cell
│   │   │   ├── HealthIndicator.jsx # Color dot + icon
│   │   │   └── DriftBadge.jsx      # Version drift warning
│   │   ├── data/
│   │   │   └── mockData.js         # Mock service data
│   │   └── utils/
│   │       ├── formatRelativeTime.js
│   │       ├── calculateDrift.js
│   │       └── healthColors.js
│   ├── package.json
│   └── vite.config.js
├── deploy.sh                   # Full build + CDK deploy script
└── README.md
```

## Features

- Service grid with health status indicators (Healthy/Degraded/Down)
- Color-coded health with accessible icons (WCAG AA compliant)
- Version drift detection between environments
- Relative timestamps ("2 hours ago")
- Deployer attribution
- Responsive layout (1280px+)

## AWS Deployment

### Prerequisites

- AWS CLI configured with appropriate credentials
- Node.js 18+
- AWS CDK CLI (`npm install -g aws-cdk`)

### Deploy

```bash
./deploy.sh
```

Or manually:

```bash
# Build frontend
cd frontend && npm ci && npm run build && cd ..

# Deploy infrastructure
cd cdk && npm ci && npx cdk deploy && cd ..
```

The deployment creates:
- S3 bucket with static site files
- CloudFront distribution with HTTPS
- Origin Access Identity for secure S3 access

### Destroy

```bash
cd cdk
npx cdk destroy
```
