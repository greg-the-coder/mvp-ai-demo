# Product Requirements Document: Environment Status Dashboard

**Version:** 1.0  
**Author:** Platform Engineering  
**Status:** Ready for Development

---

## Overview

### Problem Statement

Engineering teams waste significant time answering the question "what's deployed where?" Current solutions (Slack channels, wiki pages, asking teammates) are unreliable, outdated, and interrupt deep work. Teams need a single source of truth for deployment status across all environments.

### Solution

A web-based dashboard that displays real-time deployment status for all services across all environments in a single, scannable view.

### Success Criteria

- Any team member can determine deployment status in under 5 seconds
- Version drift between environments is immediately visible
- Service health issues are obvious at a glance

---

## User Stories

### Primary User: Engineer

**As an engineer, I want to:**

1. See all services and their deployment status on one screen so I don't have to check multiple sources
2. Quickly identify which version is deployed in each environment so I can debug environment-specific issues
3. See when each deployment happened so I can correlate issues with recent changes
4. Know who deployed last so I can ask them questions if needed
5. See health status at a glance so I know if something needs attention

### Secondary User: Engineering Manager

**As an engineering manager, I want to:**

1. See version drift between environments so I can identify deployment bottlenecks
2. Get a quick health check of all systems before standups
3. Identify services that haven't been deployed recently

---

## Functional Requirements

### FR-1: Service Grid Display

The dashboard SHALL display a grid with:
- Rows: One per service
- Columns: One per environment (Dev, Staging, Production)

### FR-2: Status Cell Information

Each cell in the grid SHALL display:
- Version number (e.g., "v2.4.1" or commit SHA)
- Deployment timestamp in relative format (e.g., "2 hours ago")
- Health status indicator (Healthy, Degraded, Down)
- Deployer name or identifier

### FR-3: Health Status Visualization

Health status SHALL be color-coded:
- **Healthy (Green):** Service operating normally
- **Degraded (Yellow):** Service experiencing issues but functional
- **Down (Red):** Service unavailable or critically impaired

### FR-4: Version Drift Detection

The dashboard SHALL visually indicate when:
- Staging is more than 2 versions behind Dev
- Production is more than 1 version behind Staging

Drift warnings should be visually distinct (badge, icon, or highlight).

### FR-5: Relative Timestamps

All timestamps SHALL display in human-readable relative format:
- "Just now" (< 1 minute)
- "X minutes ago" (< 60 minutes)
- "X hours ago" (< 24 hours)
- "X days ago" (>= 24 hours)

### FR-6: Service Filtering (Nice to Have)

Users SHOULD be able to filter services by:
- Health status
- Name search

---

## Non-Functional Requirements

### NFR-1: Performance

- Initial page load under 2 seconds
- Dashboard should be responsive and not block UI

### NFR-2: Accessibility

- Color coding must be supplemented with icons or text for colorblind users
- Minimum contrast ratios must meet WCAG AA standards

### NFR-3: Responsiveness

- Dashboard must be usable on screens 1280px and wider
- Mobile support is not required for v1

---

## Data Requirements

### Services to Display

For the demo, include these mock services:

| Service Name | Description |
|-------------|-------------|
| api-gateway | Main API routing |
| auth-service | Authentication/authorization |
| user-service | User management |
| payment-service | Payment processing |
| notification-service | Email/SMS notifications |
| search-service | Search functionality |

### Environments

| Environment | Description |
|-------------|-------------|
| Development | Latest commits, may be unstable |
| Staging | Pre-production testing |
| Production | Live customer traffic |

---

## UI/UX Requirements

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  Environment Status Dashboard                    Last updated   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Service            │ Development │ Staging    │ Production    │
│  ─────────────────────────────────────────────────────────────  │
│  api-gateway        │ [cell]      │ [cell]     │ [cell]        │
│  auth-service       │ [cell]      │ [cell]     │ [cell]        │
│  user-service       │ [cell]      │ [cell]     │ [cell]        │
│  ...                │ ...         │ ...        │ ...           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Cell Design

Each cell should contain:
```
┌──────────────────────┐
│ ● v2.4.1             │  ← Health dot + version
│ 2 hours ago          │  ← Relative timestamp
│ deployed by: alice   │  ← Deployer
│ [drift warning]      │  ← Conditional badge
└──────────────────────┘
```

### Visual Hierarchy

1. Health status (most prominent - the colored indicator)
2. Version number (primary information)
3. Timestamp (secondary information)
4. Deployer (tertiary information)

---

## Out of Scope for V1

- Real API integration (mock data only)
- Historical deployment data
- Deployment triggering from dashboard
- Notification/alerting
- Multi-team views
- Dark mode

---

## Open Questions

1. Should we show commit SHA or semantic version? **Decision: Support both, display what's provided**
2. How far back should "drift" detection look? **Decision: Compare adjacent environments only**

---

## Appendix: Mockup Reference

The dashboard should feel similar to:
- Datadog service catalog
- AWS ECS service list
- Kubernetes dashboard deployment view

Prioritize information density while maintaining scannability.
