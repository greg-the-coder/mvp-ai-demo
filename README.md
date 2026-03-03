# Environment Status Dashboard

A real-time dashboard for monitoring service deployments across multiple environments. Built with React, TypeScript, and Tailwind CSS; deployed via AWS CDK.

## Overview

The Environment Status Dashboard provides a single-pane-of-glass view into service versions, health, and drift across development, staging, and production environments. Teams can quickly spot version drift between environments and identify degraded or down services.

### Key Features

- **Multi-environment grid** — View all services across dev, staging, and production in one table
- **Health indicators** — Color-coded status (healthy / degraded / down) per deployment
- **Drift detection** — Automatic comparison of each environment's version against production, with severity badges (minor / major / critical)
- **Relative timestamps** — Human-readable "X minutes ago" deploy times
- **Responsive layout** — Horizontal scroll with sticky service column for wide grids

## Architecture

```
src/
├── App.tsx                  # Root component
├── main.tsx                 # React entry point
├── index.css                # Global styles (Tailwind)
├── components/
│   ├── Header.tsx           # Dashboard header with last-updated time
│   ├── StatusGrid.tsx       # Environment × service table
│   ├── ServiceRow.tsx       # Single service row with drift calculation
│   ├── StatusCell.tsx       # Deployment cell (version, health, metadata)
│   ├── HealthIndicator.tsx  # Color-coded health dot + label
│   └── DriftBadge.tsx       # Version drift severity badge
├── data/
│   └── mockData.ts          # Sample dashboard data
├── types/
│   └── index.ts             # TypeScript interfaces
└── utils/
    ├── index.ts             # Utility functions
    └── index.test.ts        # Unit tests (Vitest)

tests/
└── dashboard.spec.ts        # End-to-end tests (Playwright)

cdk/                         # AWS CDK infrastructure (see cdk/README.md)
```

**Tech stack:** React 19 · TypeScript 5.9 · Tailwind CSS 4 · Vite 7 · Vitest · Playwright

## Local Development

### Prerequisites

- Node.js 20+
- npm 10+

### Setup

```bash
# Install dependencies
npm install

# Start the dev server (http://localhost:3000)
npm run dev
```

The app loads mock data by default — no backend required.

### Build for Production

```bash
npm run build      # Outputs to dist/
npm run preview    # Preview the production build locally
```

## Testing

### Unit Tests (Vitest)

Tests for utility functions (`formatRelativeTime`, `calculateDrift`, `getHealthColor`):

```bash
npm test           # Run unit tests once
npm run test:watch # Run in watch mode
```

### End-to-End Tests (Playwright)

Tests for rendered components — Header, StatusGrid, health indicators, drift badges:

```bash
# Install browser (first time)
npx playwright install chromium --with-deps

# Run e2e tests (auto-starts dev server)
npm run test:e2e
```

### Run All Tests

```bash
npm run test:all
```

## Deployment

The project includes an AWS CDK stack for static hosting on S3 + CloudFront. See [`cdk/README.md`](./cdk/README.md) for full details.

Quick deploy:

```bash
cd cdk/
npm install
npx cdk bootstrap          # First time only
./scripts/deploy.sh dev ../dist
```

Supported environments: `dev`, `staging`, `prod`.

## Future Enhancements

- **Live API integration** — Replace mock data with a real backend that aggregates deployment metadata from CI/CD pipelines (GitHub Actions, ArgoCD, etc.)
- **WebSocket updates** — Push real-time health and deployment events to the dashboard
- **Filtering and search** — Filter by service, environment, or health status
- **Deployment history** — Timeline view of past deployments per service/environment
- **Alerting** — Configurable thresholds for drift severity and health status notifications
- **Authentication** — SSO integration for team-based access control
