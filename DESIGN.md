# Design Document: Environment Status Dashboard

**Version:** 1.0  
**Date:** March 10, 2026  
**Status:** Ready for Implementation

---

## Executive Summary

This document outlines the technical design for the Environment Status Dashboard, a single-page React application that provides real-time visibility into deployment status across multiple services and environments. The solution addresses the common engineering pain point of determining "what's deployed where" by providing a scannable grid view with health indicators, version information, and drift detection.

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CloudFront CDN                           │
│                  (Static Asset Delivery)                     │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                      S3 Bucket                               │
│              (Static Website Hosting)                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  index.html, bundle.js, assets/                        │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              React SPA (Client-Side Only)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   App.jsx    │→ │ StatusGrid   │→ │ ServiceRow   │      │
│  │  (Root)      │  │ (Container)  │  │ (Iterator)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                              │               │
│                                              ▼               │
│                                      ┌──────────────┐        │
│                                      │ StatusCell   │        │
│                                      │ (Presenter)  │        │
│                                      └──────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend:**
- React 18.3+ (UI framework)
- Vite 5+ (build tool and dev server)
- Tailwind CSS 3+ (styling)
- Lucide React (icons)
- date-fns (time formatting)

**Infrastructure:**
- AWS S3 (static hosting)
- AWS CloudFront (CDN)
- AWS Route53 (DNS - optional)

**Development:**
- Node.js 20+
- npm/pnpm package manager
- ESLint (code quality)
- Prettier (code formatting)

---

## Component Architecture

### Component Hierarchy

```
App
├── Header
│   ├── Title
│   ├── LastUpdated
│   └── RefreshButton
└── StatusGrid
    ├── GridHeader
    └── ServiceRow (×6)
        ├── ServiceInfo
        └── StatusCell (×3)
            ├── HealthIndicator
            ├── VersionDisplay
            ├── TimestampDisplay
            ├── DeployerDisplay
            └── DriftBadge (conditional)
```

### Component Specifications

#### 1. App Component
**File:** `src/App.jsx`

**Responsibilities:**
- Application root and state management
- Data loading and refresh logic
- Layout container

**State:**
```typescript
{
  services: ServiceData[],
  lastUpdated: Date,
  isLoading: boolean
}
```

**Key Methods:**
- `loadData()` - Loads mock data
- `refreshData()` - Triggers data reload
- `useEffect()` - Initial data load on mount

---

#### 2. Header Component
**File:** `src/components/Header.jsx`

**Props:**
```typescript
{
  lastUpdated: Date,
  onRefresh: () => void
}
```

**Renders:**
- Application title with icon
- Last updated timestamp (relative format)
- Refresh button with loading state

**Styling:**
- Sticky header (stays visible on scroll)
- Border bottom for visual separation
- Flex layout for alignment

---

#### 3. StatusGrid Component
**File:** `src/components/StatusGrid.jsx`

**Props:**
```typescript
{
  services: ServiceData[]
}
```

**Renders:**
- Column headers (Service, Development, Staging, Production)
- ServiceRow for each service
- Empty state if no services

**Layout:**
- CSS Grid with 4 columns
- Column widths: 250px (service) + 1fr (each environment)
- Sticky header row

---

#### 4. ServiceRow Component
**File:** `src/components/ServiceRow.jsx`

**Props:**
```typescript
{
  service: ServiceData
}
```

**Responsibilities:**
- Render service name and description
- Render StatusCell for each environment
- Calculate drift warnings between environments

**Drift Logic:**
```javascript
const driftWarnings = {
  staging: calculateDrift(
    service.deployments.development.version,
    service.deployments.staging.version
  ) > 2,
  production: calculateDrift(
    service.deployments.staging.version,
    service.deployments.production.version
  ) > 1
};
```

---

#### 5. StatusCell Component
**File:** `src/components/StatusCell.jsx`

**Props:**
```typescript
{
  deployment: DeploymentData,
  hasDrift: boolean
}
```

**Renders:**
- HealthIndicator (colored dot + icon)
- Version number (bold, prominent)
- Relative timestamp (muted)
- Deployer name (muted, small)
- DriftBadge (if hasDrift is true)

**Styling:**
- Padding: 16px
- Border: 1px solid based on health
- Background: subtle tint based on health
- Hover: slight elevation effect

---

#### 6. HealthIndicator Component
**File:** `src/components/HealthIndicator.jsx`

**Props:**
```typescript
{
  status: 'healthy' | 'degraded' | 'down'
}
```

**Renders:**
- Colored circle (8px diameter)
- Icon overlay for accessibility
  - Healthy: CheckCircle
  - Degraded: AlertTriangle
  - Down: XCircle

**Color Mapping:**
```javascript
const colors = {
  healthy: 'bg-green-500',
  degraded: 'bg-yellow-500',
  down: 'bg-red-500'
};
```

---

#### 7. DriftBadge Component
**File:** `src/components/DriftBadge.jsx`

**Props:**
```typescript
{
  versionsAhead: number
}
```

**Renders:**
- Warning icon
- Text: "X versions behind"
- Orange/amber color scheme

**Styling:**
- Small badge (text-xs)
- Rounded corners
- Padding: 4px 8px

---

## Utility Functions

### 1. formatRelativeTime
**File:** `src/utils/formatRelativeTime.js`

```javascript
export function formatRelativeTime(date) {
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}
```

### 2. calculateDrift
**File:** `src/utils/calculateDrift.js`

```javascript
export function parseVersion(versionString) {
  const match = versionString.match(/v?(\d+)\.(\d+)\.(\d+)/);
  if (!match) return null;
  
  return {
    major: parseInt(match[1]),
    minor: parseInt(match[2]),
    patch: parseInt(match[3])
  };
}

export function calculateDrift(version1, version2) {
  const v1 = parseVersion(version1);
  const v2 = parseVersion(version2);
  
  if (!v1 || !v2) return 0;
  
  // Calculate minor version difference
  return (v1.major * 100 + v1.minor) - (v2.major * 100 + v2.minor);
}
```

### 3. getHealthStyles
**File:** `src/utils/healthStyles.js`

```javascript
export function getHealthStyles(status) {
  const styles = {
    healthy: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-700',
      dot: 'bg-green-500'
    },
    degraded: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-700',
      dot: 'bg-yellow-500'
    },
    down: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-700',
      dot: 'bg-red-500'
    }
  };
  
  return styles[status] || styles.healthy;
}
```

---

## Data Flow

### Initial Load Sequence

```
1. App mounts
   ↓
2. useEffect triggers loadData()
   ↓
3. Import mockData from data/mockData.js
   ↓
4. Set state: { services, lastUpdated, isLoading: false }
   ↓
5. React re-renders with data
   ↓
6. StatusGrid receives services prop
   ↓
7. ServiceRow components render for each service
   ↓
8. StatusCell components render for each environment
```

### Refresh Flow

```
1. User clicks refresh button
   ↓
2. Header calls onRefresh()
   ↓
3. App.refreshData() sets isLoading: true
   ↓
4. Reload mockData (simulate API call)
   ↓
5. Update lastUpdated timestamp
   ↓
6. Set isLoading: false
   ↓
7. Components re-render with fresh data
```

---

## File Structure

```
mvp-ai-demo/
├── public/
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── StatusGrid.jsx
│   │   ├── ServiceRow.jsx
│   │   ├── StatusCell.jsx
│   │   ├── HealthIndicator.jsx
│   │   └── DriftBadge.jsx
│   ├── data/
│   │   └── mockData.js
│   ├── utils/
│   │   ├── formatRelativeTime.js
│   │   ├── calculateDrift.js
│   │   └── healthStyles.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── eslint.config.js
```

---

## Styling Guidelines

### Tailwind Configuration

```javascript
// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Custom colors if needed
      }
    }
  },
  plugins: []
};
```

### Design Tokens

**Spacing:**
- Cell padding: `p-4` (16px)
- Grid gap: `gap-2` (8px)
- Section margins: `my-6` (24px)

**Typography:**
- Title: `text-2xl font-bold`
- Version: `text-lg font-semibold`
- Timestamp: `text-sm text-gray-600`
- Deployer: `text-xs text-gray-500`

**Borders:**
- Cell border: `border border-gray-200`
- Health-based borders: Dynamic based on status

**Shadows:**
- Card hover: `hover:shadow-md`
- Header: `shadow-sm`

---

## AWS Deployment Architecture

### Infrastructure Components

```
┌─────────────────────────────────────────────────────────────┐
│                      Route53 (Optional)                      │
│                  dashboard.example.com                       │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                   CloudFront Distribution                    │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  - HTTPS/TLS termination                               │ │
│  │  - Caching (TTL: 1 hour for assets, 5 min for HTML)   │ │
│  │  - Gzip compression                                    │ │
│  │  - Custom error pages                                  │ │
│  └────────────────────────────────────────────────────────┘ │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                      S3 Bucket                               │
│              dashboard-frontend-[env]                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  /index.html                                           │ │
│  │  /assets/                                              │ │
│  │    ├── index-[hash].js                                 │ │
│  │    ├── index-[hash].css                                │ │
│  │    └── icons/                                          │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Bucket Policy: Public read for CloudFront OAI              │
│  Versioning: Enabled                                        │
│  Encryption: AES-256                                        │
└─────────────────────────────────────────────────────────────┘
```

### Deployment Pipeline

```
┌─────────────────┐
│  Build Process  │
│  (Coder Task)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  npm run build  │
│  → dist/        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  AWS S3 Sync    │
│  aws s3 sync    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  CloudFront     │
│  Invalidation   │
└─────────────────┘
```

---

## Implementation Plan

### Phase 1: Frontend Development (Task 1)
**Duration:** 2-3 hours  
**Deliverables:**
- Complete React application
- All components implemented
- Mock data integrated
- Local development working
- Unit tests (optional)

**Acceptance Criteria:**
- Dashboard displays all 6 services
- Health indicators show correct colors
- Relative timestamps update
- Drift warnings appear correctly
- Responsive on 1280px+ screens

---

### Phase 2: AWS Infrastructure Setup (Task 2)
**Duration:** 1-2 hours  
**Deliverables:**
- S3 bucket created and configured
- CloudFront distribution set up
- Bucket policies configured
- SSL certificate (if custom domain)

**Acceptance Criteria:**
- S3 bucket accessible
- CloudFront distribution active
- HTTPS enabled
- Proper caching headers

---

### Phase 3: Build & Deploy (Task 3)
**Duration:** 1 hour  
**Deliverables:**
- Production build created
- Assets uploaded to S3
- CloudFront cache invalidated
- Deployment verified

**Acceptance Criteria:**
- Application accessible via CloudFront URL
- All assets load correctly
- No console errors
- Performance metrics acceptable (<2s load)

---

## Testing Strategy

### Manual Testing Checklist

**Visual Testing:**
- [ ] All 6 services display correctly
- [ ] Health indicators show proper colors
- [ ] Drift badges appear on correct cells
- [ ] Timestamps are human-readable
- [ ] Layout is clean and scannable

**Functional Testing:**
- [ ] Refresh button updates timestamp
- [ ] Data loads on initial mount
- [ ] No console errors
- [ ] Hover states work on cells

**Cross-Browser Testing:**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

**Performance Testing:**
- [ ] Initial load < 2 seconds
- [ ] No layout shifts
- [ ] Smooth scrolling

---

## Security Considerations

### Frontend Security
- No sensitive data in client code
- All dependencies from npm registry
- CSP headers via CloudFront
- HTTPS only

### AWS Security
- S3 bucket not publicly listable
- CloudFront OAI for S3 access
- Bucket encryption enabled
- Access logging enabled

---

## Monitoring & Observability

### Metrics to Track
- CloudFront cache hit ratio
- S3 request count
- Error rate (4xx, 5xx)
- Average load time

### Logging
- CloudFront access logs → S3
- S3 access logs → separate bucket
- Client-side error tracking (future: Sentry)

---

## Future Enhancements

### Phase 2 Features (Post-MVP)
1. **Real API Integration**
   - Backend service for deployment data
   - WebSocket for real-time updates
   - Authentication/authorization

2. **Advanced Filtering**
   - Search by service name
   - Filter by health status
   - Filter by deployer

3. **Historical Data**
   - Deployment timeline
   - Trend charts
   - Rollback tracking

4. **Notifications**
   - Slack integration
   - Email alerts for failures
   - Deployment webhooks

5. **Dark Mode**
   - Theme toggle
   - Persistent preference

---

## Appendix

### Environment Variables

```bash
# Development
VITE_API_URL=http://localhost:3000  # Future API
VITE_ENV=development

# Production
VITE_API_URL=https://api.example.com
VITE_ENV=production
```

### Build Configuration

```javascript
// vite.config.js
export default {
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom']
        }
      }
    }
  }
};
```

### AWS Resource Naming

```
S3 Bucket: dashboard-frontend-prod
CloudFront: dashboard-cf-distribution
Route53: dashboard.example.com (optional)
```

---

## References

- [PRD](./product-docs/PRD.md)
- [Technical Spec](./product-docs/TECHNICAL_SPEC.md)
- [Data Model](./product-docs/DATA_MODEL.md)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [AWS S3 Static Hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)
- [CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
