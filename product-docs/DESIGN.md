# Design Document: Environment Status Dashboard

**Version:** 1.0
**Status:** Ready for Implementation
**Based on:** PRD v1.0, TECHNICAL_SPEC v1.0, DATA_MODEL v1.0

---

## 1. Architecture Overview

The Environment Status Dashboard is a React SPA backed by a lightweight API layer, deployed to AWS. The front-end renders a real-time grid of service deployment statuses across Dev, Staging, and Production environments. The back-end serves mock data through a REST API, structured for easy replacement with live integrations.

```
┌──────────────┐     ┌──────────────────┐     ┌─────────────────────┐
│   Browser    │────▶│  CloudFront CDN  │────▶│  S3 (React SPA)     │
└──────────────┘     └──────────────────┘     └─────────────────────┘
       │
       │ /api/*
       ▼
┌──────────────────┐     ┌─────────────────────┐
│  API Gateway     │────▶│  Lambda (Node.js)   │
│  (REST)          │     │  Mock Data API      │
└──────────────────┘     └─────────────────────┘
```

### Why This Architecture

- **S3 + CloudFront**: Zero-server hosting for the SPA, fast global delivery, cheap
- **API Gateway + Lambda**: Serverless API, no infrastructure to manage, scales to zero
- **Separation of concerns**: Front-end and back-end deploy independently

---

## 2. Front-End Design

### Technology Stack

| Technology | Purpose |
|-----------|---------|
| React 18 | UI framework |
| Vite | Build tooling (fast dev server, optimized builds) |
| Tailwind CSS | Utility-first styling |
| Lucide React | Accessible icon set |
| date-fns | Relative time formatting |

### Component Hierarchy

```
App
├── Header (title, last-updated timestamp, refresh button)
├── FilterBar (health filter dropdown, name search input) [Nice-to-have]
└── StatusGrid
    ├── GridHeader (Service | Development | Staging | Production)
    └── ServiceRow[] (one per service)
        ├── ServiceNameCell (name, description)
        └── StatusCell[] (one per environment)
            ├── HealthIndicator (colored dot + icon)
            ├── VersionBadge (version string)
            ├── TimestampLabel (relative time)
            ├── DeployerLabel (username)
            └── DriftBadge (conditional warning)
```

### Key Design Decisions

1. **Vite over CRA**: Faster builds, better DX, smaller output
2. **Tailwind CSS**: Matches tech spec requirement, no custom CSS files
3. **date-fns over moment**: Tree-shakeable, smaller bundle
4. **React.memo on StatusCell**: Prevents unnecessary re-renders per tech spec
5. **Accessible health indicators**: Color + icon + sr-only text (checkmark/warning/x)

### Color System (from Tech Spec)

| Status | Background | Border | Text |
|--------|-----------|--------|------|
| Healthy | bg-green-50 | border-green-200 | text-green-700 |
| Degraded | bg-yellow-50 | border-yellow-200 | text-yellow-700 |
| Down | bg-red-50 | border-red-200 | text-red-700 |
| Drift | bg-orange-100 | border-orange-300 | text-orange-800 |

### API Integration

The front-end fetches data from the back-end API:

```
GET /api/deployments → { services: ServiceData[], updatedAt: string }
```

On initial load and on refresh button click. No polling in v1 — manual refresh only.

---

## 3. Back-End Design

### Technology Stack

| Technology | Purpose |
|-----------|---------|
| Node.js 20 | Lambda runtime |
| AWS Lambda | Serverless compute |
| API Gateway (REST) | HTTP routing |
| AWS CDK (TypeScript) | Infrastructure as Code |

### API Specification

#### GET /api/deployments

Returns all service deployment data.

**Response (200 OK):**
```json
{
  "services": [
    {
      "id": "api-gateway",
      "name": "API Gateway",
      "description": "Main API routing and rate limiting",
      "deployments": {
        "development": {
          "version": "v2.8.0",
          "deployedAt": "2026-03-16T19:44:15.000Z",
          "deployedBy": "sarah.chen",
          "health": "healthy"
        },
        "staging": { ... },
        "production": { ... }
      }
    }
  ],
  "updatedAt": "2026-03-16T20:14:15.000Z"
}
```

**Response Headers:**
- `Content-Type: application/json`
- `Access-Control-Allow-Origin: *` (CORS for CloudFront → API Gateway)

### Lambda Implementation

Single handler function that returns the mock data from DATA_MODEL.md. The mock data generates timestamps relative to `Date.now()` so the dashboard always shows realistic "X hours ago" values.

```
lambda/
├── index.mjs          # Handler: GET /api/deployments
└── mockData.mjs       # Mock data from DATA_MODEL.md
```

---

## 4. AWS Infrastructure Design

### Resources (CDK Stack)

| Resource | Purpose | Config |
|----------|---------|--------|
| S3 Bucket | Host React SPA build output | Private, OAC access only |
| CloudFront Distribution | CDN for SPA + API routing | Default behavior → S3, `/api/*` → API GW |
| API Gateway (REST) | REST API endpoint | Single GET route |
| Lambda Function | Serve mock deployment data | Node.js 20, 128MB, 10s timeout |
| OAC | Secure S3 access from CloudFront | Origin Access Control |

### CloudFront Routing

| Path Pattern | Origin | Behavior |
|-------------|--------|----------|
| `/api/*` | API Gateway | Pass-through, CORS headers |
| `/*` (default) | S3 Bucket | SPA with index.html fallback |

This means the front-end and API share the same domain — no CORS issues in production.

### CDK Project Structure

```
infra/
├── bin/
│   └── app.ts              # CDK app entry point
├── lib/
│   └── dashboard-stack.ts  # All resources in one stack
├── cdk.json
├── package.json
└── tsconfig.json
```

### Deployment Flow

1. Build React app → `frontend/dist/`
2. CDK synth → CloudFormation template
3. CDK deploy → provisions S3, CloudFront, API GW, Lambda
4. CDK uploads `frontend/dist/` to S3 via `BucketDeployment`
5. CloudFront invalidation for immediate availability

---

## 5. Implementation Plan — Coder Task Breakdown

The work is split into three parallel-capable Coder Tasks:

### Task 1: Front-End Development (React SPA)

**Branch:** `feature/frontend-dashboard`
**Scope:**
- Scaffold Vite + React + Tailwind project in `frontend/`
- Implement all components per Component Hierarchy (Section 2)
- Wire up `GET /api/deployments` fetch with loading/error states
- Include fallback to embedded mock data if API is unreachable
- Implement drift calculation logic per DATA_MODEL.md
- Implement relative time formatting per PRD FR-5
- Ensure accessible health indicators (color + icon + text)
- Build produces static assets in `frontend/dist/`

**Validation:**
- `npm run build` succeeds with zero errors
- All 6 mock services render in the grid
- Health status colors and icons display correctly
- Drift warnings appear for Payment Service (prod behind)
- Relative timestamps render correctly
- Minimum 1280px layout works

### Task 2: Back-End API (Lambda + API Gateway)

**Branch:** `feature/backend-api`
**Scope:**
- Create Lambda handler in `lambda/` directory
- Implement `GET /api/deployments` returning mock data per DATA_MODEL.md
- Mock data generates relative timestamps using `Date.now()`
- Add CORS headers for local development
- Include basic error handling and JSON response formatting

**Validation:**
- Lambda handler returns valid JSON matching DashboardData schema
- Response includes all 6 services with 3 environments each
- CORS headers present in response
- Timestamps are relative to current time

### Task 3: AWS Infrastructure + Deployment (CDK)

**Branch:** `feature/aws-infrastructure`
**Scope:**
- Create CDK project in `infra/` directory
- Define S3 bucket, CloudFront, API Gateway, Lambda resources
- Configure CloudFront routing: `/api/*` → API GW, default → S3
- Set up BucketDeployment to upload `frontend/dist/`
- Configure OAC for secure S3 access
- Deploy to AWS and output the CloudFront URL

**Validation:**
- `cdk synth` produces valid CloudFormation
- `cdk deploy` succeeds
- CloudFront URL serves the React SPA
- `/api/deployments` returns mock data through CloudFront
- Dashboard loads and displays data end-to-end

### Task Execution Order

```
Task 1 (Frontend) ──┐
                     ├──▶ Task 3 (Infrastructure + Deploy)
Task 2 (Backend)  ──┘
```

Tasks 1 and 2 run in parallel. Task 3 depends on both completing first since it deploys the frontend build and Lambda code together.

---

## 6. Success Criteria

Per the PRD, the deployed dashboard must:

1. Show all 6 services across 3 environments in a single grid view
2. Display health status with color-coded indicators + accessible icons
3. Show version numbers, relative timestamps, and deployer names
4. Highlight version drift (Payment Service prod should show warning)
5. Load in under 2 seconds via CloudFront
6. Be accessible at a public CloudFront URL for team review
