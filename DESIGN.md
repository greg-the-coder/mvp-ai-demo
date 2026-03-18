# Design Document: Environment Status Dashboard

**Version:** 1.0
**Branch:** `feature/env-status-dashboard`
**Status:** Ready for Implementation
**Based on:** PRD v1.0, TECHNICAL_SPEC v1.0, DATA_MODEL v1.0

---

## 1. System Overview

### 1.1 Purpose

Build a real-time Environment Status Dashboard that answers "what's deployed where?" for engineering teams. The system consists of:

- **Frontend:** React 18 SPA with Tailwind CSS — a grid-based dashboard displaying service deployments across Dev, Staging, and Production environments.
- **Backend:** AWS Lambda + API Gateway REST API — serves deployment status data and provides a clean integration point for future real data sources.
- **Infrastructure:** AWS CDK (TypeScript) — S3 static hosting, CloudFront CDN, Lambda, API Gateway, all defined as Infrastructure as Code.

### 1.2 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         AWS Cloud                                       │
│                                                                         │
│  ┌──────────────┐     ┌──────────────┐     ┌─────────────────────────┐ │
│  │  CloudFront   │────▶│  S3 Bucket    │     │  API Gateway (REST)     │ │
│  │  Distribution │     │  (Static SPA) │     │  /api/deployments       │ │
│  │  (HTTPS CDN)  │     │  dashboard/*  │     │  /api/deployments/{id}  │ │
│  └──────────────┘     └──────────────┘     │  /api/health             │ │
│         ▲                                    └────────────┬────────────┘ │
│         │                                                  │              │
│         │                                    ┌─────────────▼────────────┐ │
│         │                                    │  Lambda Function          │ │
│         │                                    │  (Node.js 20.x)           │ │
│         │                                    │  - GET /deployments       │ │
│         │                                    │  - GET /deployments/{id}  │ │
│         │                                    │  - GET /health            │ │
│         │                                    └──────────────────────────┘ │
│         │                                                                 │
└─────────┼─────────────────────────────────────────────────────────────────┘
          │
    ┌─────┴──────┐
    │   Browser   │
    │  React SPA  │
    └────────────┘
```

### 1.3 Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Frontend framework | React 18 + Vite | Fast dev cycle, per PRD spec |
| Styling | Tailwind CSS | Utility-first, per TECHNICAL_SPEC |
| Icons | Lucide React | Lightweight, accessible, per PRD |
| Backend runtime | Node.js 20.x Lambda | Serverless, zero ops, fast cold start |
| API layer | API Gateway REST | Managed, scalable, CORS-ready |
| IaC | AWS CDK (TypeScript) | Type-safe, composable, single-language |
| Hosting | S3 + CloudFront | Static SPA hosting best practice |
| Data | Mock data in Lambda | Structured for easy swap to DynamoDB/RDS |

---

## 2. Frontend Design

### 2.1 Component Tree

```
App
├── Header
│   ├── Title ("Environment Status Dashboard")
│   ├── LastUpdated (relative timestamp)
│   └── RefreshButton
├── FilterBar (FR-6, nice-to-have)
│   ├── SearchInput (service name filter)
│   └── HealthFilter (dropdown: All / Healthy / Degraded / Down)
└── StatusGrid
    ├── GridHeader (Service | Development | Staging | Production)
    └── ServiceRow[] (one per service)
        ├── ServiceNameCell
        └── StatusCell[] (one per environment)
            ├── HealthIndicator (colored dot + icon)
            ├── VersionLabel
            ├── TimestampLabel (relative)
            ├── DeployerLabel
            └── DriftBadge (conditional)
```

### 2.2 File Structure

```
dashboard/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── eslint.config.js
├── public/
│   └── favicon.ico
└── src/
    ├── index.jsx               # Entry point, renders <App />
    ├── index.css               # Tailwind directives
    ├── App.jsx                 # Root: data fetching, state, layout
    ├── components/
    │   ├── Header.jsx          # Title, last-updated, refresh
    │   ├── FilterBar.jsx       # Search + health filter
    │   ├── StatusGrid.jsx      # Grid layout, column headers
    │   ├── ServiceRow.jsx      # Row: name + StatusCells
    │   ├── StatusCell.jsx      # Cell: health, version, time, deployer, drift
    │   ├── HealthIndicator.jsx # Dot + accessible icon
    │   └── DriftBadge.jsx      # Warning badge
    ├── hooks/
    │   └── useDeployments.js   # Custom hook: fetch + polling
    ├── utils/
    │   ├── formatRelativeTime.js
    │   ├── calculateDrift.js
    │   └── healthStyles.js     # Status → Tailwind class mapping
    └── config.js               # API base URL, poll interval
```

### 2.3 Component Specifications

#### App.jsx
- **State:** `{ services, lastUpdated, loading, error, searchTerm, healthFilter }`
- **Behavior:**
  - On mount: calls `GET /api/deployments`
  - Auto-refreshes every 30 seconds via `useDeployments` hook
  - Filters services based on `searchTerm` and `healthFilter`
  - Passes filtered data down to `StatusGrid`

#### Header.jsx
- **Props:** `{ lastUpdated: string, onRefresh: () => void, loading: boolean }`
- **Renders:** App title, relative timestamp of last update, refresh button with loading spinner

#### FilterBar.jsx
- **Props:** `{ searchTerm, onSearchChange, healthFilter, onHealthFilterChange }`
- **Renders:** Text input for service name search, dropdown for health status filter

#### StatusGrid.jsx
- **Props:** `{ services: ServiceData[] }`
- **Renders:**
  - Sticky header row: `Service | Development | Staging | Production`
  - Maps `services` to `<ServiceRow>` components
  - Alternating row backgrounds (`even:bg-gray-50`)

#### ServiceRow.jsx
- **Props:** `{ service: ServiceData }`
- **Behavior:**
  - Computes drift warnings via `calculateDrift(dev, staging, prod)`
  - Passes `hasDrift` boolean to each `StatusCell`
- **Renders:** Service name cell + 3 `StatusCell` components

#### StatusCell.jsx (React.memo)
- **Props:** `{ deployment: DeploymentData, hasDrift: boolean }`
- **Renders:**
  - `HealthIndicator` with status
  - Version string (bold)
  - Relative timestamp via `formatRelativeTime`
  - Deployer name (muted text)
  - `DriftBadge` (conditional, when `hasDrift === true`)
- **Styling:** Subtle background tint per health status, hover state

#### HealthIndicator.jsx
- **Props:** `{ status: 'healthy' | 'degraded' | 'down' }`
- **Renders:**
  - Colored dot (green/yellow/red) using `healthStyles`
  - Accessible icon overlay: CheckCircle / AlertTriangle / XCircle from Lucide
  - `aria-label` for screen readers

#### DriftBadge.jsx
- **Props:** `{ versionsAhead: number }`
- **Renders:** Orange warning badge: `"⚠ {n} versions behind"`

### 2.4 Utility Functions

#### formatRelativeTime(isoString: string): string
Per FR-5:
- `< 1 min` → "Just now"
- `< 60 min` → "X minutes ago"
- `< 24 hours` → "X hours ago"
- `>= 24 hours` → "X days ago"

#### calculateDrift(devVersion, stagingVersion, prodVersion): DriftResult
Per FR-4:
- Parses semver strings (`v?major.minor.patch`)
- Returns `{ stagingDrift: number, prodDrift: number, stagingWarning: boolean, prodWarning: boolean }`
- `stagingWarning = true` when staging > 2 minor versions behind dev
- `prodWarning = true` when prod > 1 minor version behind staging
- Non-semver versions (SHAs, beta tags) → `null` drift (no warning)

#### healthStyles(status: HealthStatus): object
Returns Tailwind classes per TECHNICAL_SPEC color palette:
```
healthy  → { bg: 'bg-green-50',  border: 'border-green-200',  text: 'text-green-700',  dot: 'bg-green-500' }
degraded → { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', dot: 'bg-yellow-500' }
down     → { bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-700',    dot: 'bg-red-500' }
```

### 2.5 Data Fetching Strategy

```javascript
// hooks/useDeployments.js
function useDeployments(pollInterval = 30000) {
  const [state, setState] = useState({ services: [], lastUpdated: null, loading: true, error: null });

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/deployments`);
      const data = await res.json();
      setState({ services: data.services, lastUpdated: data.updatedAt, loading: false, error: null });
    } catch (err) {
      setState(prev => ({ ...prev, loading: false, error: err.message }));
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, pollInterval);
    return () => clearInterval(interval);
  }, [fetchData, pollInterval]);

  return { ...state, refresh: fetchData };
}
```

### 2.6 Responsive & Accessibility

- **Minimum width:** 1280px (no mobile layouts per NFR-3)
- **Accessibility (NFR-2):**
  - All color indicators paired with Lucide icons (CheckCircle, AlertTriangle, XCircle)
  - WCAG AA contrast ratios (4.5:1 minimum)
  - `aria-label` on health indicators
  - Keyboard-navigable interactive elements with visible focus rings
  - Semantic HTML: `<table>`, `<thead>`, `<tbody>`, `<th scope="col">`

---

## 3. Backend Design

### 3.1 API Specification

| Method | Path | Description | Response |
|--------|------|-------------|----------|
| GET | /api/deployments | All services + deployments | `DashboardData` |
| GET | /api/deployments/{serviceId} | Single service detail | `ServiceData` |
| GET | /api/health | API health check | `{ status: "ok", timestamp }` |

#### GET /api/deployments Response

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
          "deployedAt": "2026-03-18T10:30:00Z",
          "deployedBy": "sarah.chen",
          "health": "healthy"
        },
        "staging": { ... },
        "production": { ... }
      }
    }
  ],
  "updatedAt": "2026-03-18T11:00:00Z"
}
```

#### GET /api/health Response

```json
{
  "status": "ok",
  "timestamp": "2026-03-18T11:00:00Z",
  "version": "1.0.0"
}
```

### 3.2 Lambda Function Structure

```
backend/
├── package.json
├── src/
│   ├── index.mjs           # Lambda handler (entry point)
│   ├── routes/
│   │   ├── deployments.mjs # GET /api/deployments logic
│   │   └── health.mjs      # GET /api/health logic
│   └── data/
│       └── mockData.mjs    # Mock service data (from DATA_MODEL.md)
└── tests/
    └── handler.test.mjs    # Unit tests for Lambda handler
```

### 3.3 Lambda Handler Design

```javascript
// src/index.mjs
export const handler = async (event) => {
  const { httpMethod, path, pathParameters } = event;
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Route matching
  if (httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (path === '/api/health') return healthRoute(headers);
  if (path === '/api/deployments') return deploymentsRoute(headers);
  if (path.startsWith('/api/deployments/')) return deploymentByIdRoute(pathParameters?.serviceId, headers);

  return { statusCode: 404, headers, body: JSON.stringify({ error: 'Not found' }) };
};
```

### 3.4 Mock Data

Uses the exact mock data from `DATA_MODEL.md` with dynamic timestamps relative to request time. Six services:

| Service | Key Scenarios |
|---------|--------------|
| API Gateway | Healthy across all environments |
| Auth Service | Staging degraded (yellow) |
| User Service | Normal flow |
| Payment Service | Production DOWN (red), drift warning |
| Notification Service | Recent active development |
| Search Service | Beta in dev (degraded), significant prod drift |

---

## 4. Infrastructure Design (AWS CDK)

### 4.1 Stack Architecture

```
infra/
├── package.json
├── tsconfig.json
├── cdk.json
├── bin/
│   └── infra.ts             # CDK app entry point
└── lib/
    └── env-dashboard-stack.ts  # Single stack with all resources
```

### 4.2 AWS Resources

| Resource | Type | Purpose |
|----------|------|---------|
| DashboardBucket | S3 Bucket | Static SPA hosting |
| DashboardDistribution | CloudFront Distribution | CDN, HTTPS, caching |
| DashboardApi | API Gateway REST API | API endpoint |
| DeploymentsFunction | Lambda Function | Business logic |
| OriginAccessIdentity | CloudFront OAI | Secure S3 access |

### 4.3 CDK Stack Pseudo-code

```typescript
export class EnvDashboardStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    // S3 bucket for SPA (not public, accessed via CloudFront OAI)
    const bucket = new s3.Bucket(this, 'DashboardBucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // Lambda function for API
    const apiFunction = new lambda.Function(this, 'DeploymentsFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('../backend/src'),
      timeout: cdk.Duration.seconds(10),
      memorySize: 256,
    });

    // API Gateway
    const api = new apigateway.RestApi(this, 'DashboardApi', {
      restApiName: 'env-dashboard-api',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: ['GET', 'OPTIONS'],
      },
    });
    const deploymentsResource = api.root.addResource('api').addResource('deployments');
    deploymentsResource.addMethod('GET', new apigateway.LambdaIntegration(apiFunction));
    deploymentsResource.addResource('{serviceId}').addMethod('GET', new apigateway.LambdaIntegration(apiFunction));
    api.root.addResource('api').addResource('health').addMethod('GET', new apigateway.LambdaIntegration(apiFunction));

    // CloudFront distribution
    const distribution = new cloudfront.Distribution(this, 'DashboardDistribution', {
      defaultBehavior: {
        origin: new origins.S3Origin(bucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      additionalBehaviors: {
        '/api/*': {
          origin: new origins.RestApiOrigin(api),
          allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
        },
      },
      defaultRootObject: 'index.html',
      errorResponses: [{
        httpStatus: 403,
        responseHttpStatus: 200,
        responsePagePath: '/index.html', // SPA routing
      }],
    });

    // Deploy SPA to S3
    new s3deploy.BucketDeployment(this, 'DeployDashboard', {
      sources: [s3deploy.Source.asset('../dashboard/dist')],
      destinationBucket: bucket,
      distribution,
      distributionPaths: ['/*'],
    });

    // Outputs
    new cdk.CfnOutput(this, 'DashboardUrl', { value: `https://${distribution.distributionDomainName}` });
    new cdk.CfnOutput(this, 'ApiUrl', { value: api.url });
  }
}
```

### 4.4 CloudFront Routing

| Path Pattern | Origin | Cache |
|-------------|--------|-------|
| Default (`/*`) | S3 Bucket | Enabled (static assets) |
| `/api/*` | API Gateway | Disabled (dynamic) |

This allows the SPA to call `/api/deployments` on the same domain, avoiding CORS issues in production.

---

## 5. Implementation Plan

### Phase 1: Frontend Development
**Branch:** `feature/env-status-dashboard`
**Deliverables:**
- Vite + React 18 project scaffolding
- All 7 React components (Header, FilterBar, StatusGrid, ServiceRow, StatusCell, HealthIndicator, DriftBadge)
- Utility functions (formatRelativeTime, calculateDrift, healthStyles)
- Custom hook (useDeployments) with fallback to embedded mock data
- Tailwind CSS styling per TECHNICAL_SPEC color palette
- ESLint configuration
- `npm run dev` works, `npm run build` produces production bundle

**Acceptance Criteria:**
- Grid displays 6 services × 3 environments
- Health indicators show green/yellow/red with accessible icons
- Version drift badges appear on Payment Service and Search Service
- Relative timestamps update correctly
- Filter by name and health status works
- No lint errors, no console errors
- Production build succeeds

### Phase 2: Backend API
**Branch:** `feature/env-status-dashboard`
**Deliverables:**
- Lambda handler with route matching
- GET /api/deployments → returns all mock services
- GET /api/deployments/{id} → returns single service
- GET /api/health → returns health check
- CORS headers on all responses
- Unit tests

**Acceptance Criteria:**
- All three endpoints return correct JSON
- CORS headers present
- 404 for unknown routes
- Tests pass

### Phase 3: AWS Infrastructure + Deployment
**Branch:** `feature/env-status-dashboard`
**Deliverables:**
- CDK stack with S3, CloudFront, Lambda, API Gateway
- Frontend build deployed to S3
- CloudFront routes `/api/*` to API Gateway, `/*` to S3
- Stack outputs: Dashboard URL, API URL

**Acceptance Criteria:**
- `cdk deploy` succeeds
- Dashboard accessible via CloudFront HTTPS URL
- API endpoints respond correctly through CloudFront
- SPA loads and displays data from Lambda API

---

## 6. Testing Strategy

### 6.1 Frontend
- ESLint — static analysis, no errors
- `npm run build` — production build succeeds
- Manual verification — all components render, drift badges appear, filters work

### 6.2 Backend
- Unit tests — handler returns correct status codes and payloads
- Integration — API Gateway → Lambda → correct responses

### 6.3 Infrastructure
- `cdk synth` — CloudFormation template generates without errors
- `cdk deploy` — all resources created successfully
- Smoke test — HTTP GET to CloudFront URL returns dashboard

---

## 7. Security Considerations

- S3 bucket is private (no public access), served only via CloudFront OAI
- CloudFront enforces HTTPS (redirect HTTP → HTTPS)
- Lambda has minimal IAM permissions (basic execution role only)
- API Gateway has no authentication (acceptable for demo/internal tool)
- No sensitive data in mock dataset
- CORS restricted to GET/OPTIONS methods

---

## 8. Future Enhancements (Out of Scope)

Per PRD "Out of Scope for V1":
- Real API integration (replace mock data with DynamoDB)
- Historical deployment data
- Deployment triggering from dashboard
- Notification/alerting
- Multi-team views
- Dark mode
- WebSocket for real-time updates
- Authentication/authorization
