# Technical Specification: Environment Status Dashboard

**Version:** 1.0  
**Status:** Ready for Implementation

---

## Architecture Overview

This is a single-page React application with no backend requirements. All data is mocked for demonstration purposes but structured to easily swap in real API calls.

```
┌─────────────────────────────────────────────┐
│                   App                        │
│  ┌────────────────────────────────────────┐ │
│  │              Header                     │ │
│  │   - Title                              │ │
│  │   - Last updated timestamp             │ │
│  └────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────┐ │
│  │           StatusGrid                   │ │
│  │  ┌──────────────────────────────────┐  │ │
│  │  │         ServiceRow               │  │ │
│  │  │  ┌─────────┐ ┌─────────┐ ┌────┐  │  │ │
│  │  │  │StatusCell│StatusCell│... │  │  │ │
│  │  │  └─────────┘ └─────────┘ └────┘  │  │ │
│  │  └──────────────────────────────────┘  │ │
│  │  ... (repeats per service)             │ │
│  └────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

---

## Component Specification

### App (Root Component)

**Responsibility:** Application shell, data provider, layout container

**State:**
- `services`: Array of service deployment data
- `lastUpdated`: Timestamp of last data refresh

**Behavior:**
- Loads mock data on mount
- Provides data context to child components

---

### Header

**Props:**
- `lastUpdated`: Date object

**Renders:**
- Application title: "Environment Status Dashboard"
- Last updated timestamp in relative format
- Optional: Refresh button (triggers data reload)

---

### StatusGrid

**Props:**
- `services`: Array of ServiceData objects

**Renders:**
- Column headers (Service, Development, Staging, Production)
- Maps over services to render ServiceRow components

**Styling:**
- Responsive grid or table layout
- Sticky header row
- Alternating row backgrounds for scannability

---

### ServiceRow

**Props:**
- `service`: ServiceData object

**Renders:**
- Service name cell (fixed width, left-aligned)
- StatusCell for each environment

**Behavior:**
- Passes environment-specific deployment data to each StatusCell
- Calculates drift status between environments

---

### StatusCell

**Props:**
- `deployment`: DeploymentData object
- `hasDrift`: boolean (indicates version drift warning)

**Renders:**
- Health indicator (colored dot + icon for accessibility)
- Version string
- Relative timestamp
- Deployer name
- Drift warning badge (conditional)

**Styling:**
- Background tint based on health status (subtle)
- Hover state for interactivity feel

---

### HealthIndicator (Sub-component)

**Props:**
- `status`: 'healthy' | 'degraded' | 'down'

**Renders:**
- Colored dot (green/yellow/red)
- Icon overlay for accessibility (checkmark/warning/x)

---

### DriftBadge (Sub-component)

**Props:**
- `versionsAhead`: number

**Renders:**
- Warning badge with version count
- Example: "⚠ 3 versions behind"

---

## Utility Functions

### formatRelativeTime(date: Date): string

Converts a Date object to human-readable relative time.

```typescript
formatRelativeTime(new Date(Date.now() - 3600000)) // "1 hour ago"
formatRelativeTime(new Date(Date.now() - 60000))   // "1 minute ago"
formatRelativeTime(new Date(Date.now() - 86400000)) // "1 day ago"
```

### calculateDrift(devVersion, stagingVersion, prodVersion): DriftInfo

Parses semantic versions and determines if drift thresholds are exceeded.

```typescript
calculateDrift("2.4.0", "2.2.0", "2.1.0")
// Returns: { stagingDrift: 2, prodDrift: 1, hasWarning: true }
```

### getHealthColor(status: HealthStatus): string

Returns Tailwind color class based on health status.

---

## File Structure

```
src/
├── App.jsx                 # Root component
├── components/
│   ├── Header.jsx
│   ├── StatusGrid.jsx
│   ├── ServiceRow.jsx
│   ├── StatusCell.jsx
│   ├── HealthIndicator.jsx
│   └── DriftBadge.jsx
├── data/
│   └── mockData.js         # Mock service data
├── utils/
│   ├── formatRelativeTime.js
│   ├── calculateDrift.js
│   └── healthColors.js
└── index.jsx               # Entry point
```

---

## Styling Approach

Use Tailwind CSS utility classes exclusively. No custom CSS files.

### Color Palette

| Status | Background | Border | Text |
|--------|-----------|--------|------|
| Healthy | bg-green-50 | border-green-200 | text-green-700 |
| Degraded | bg-yellow-50 | border-yellow-200 | text-yellow-700 |
| Down | bg-red-50 | border-red-200 | text-red-700 |
| Drift Warning | bg-orange-100 | border-orange-300 | text-orange-800 |

### Responsive Breakpoints

- Minimum supported width: 1280px
- No mobile-specific layouts required

---

## Implementation Notes

### Version Parsing

Accept both semantic versions (v2.4.1) and short commit SHAs (a3f2c1b). For drift calculation with SHAs, treat each unique SHA as one version apart.

### Performance Considerations

- Use React.memo on StatusCell to prevent unnecessary re-renders
- Keep mock data updates batched

### Accessibility Requirements

- All color indicators must have accompanying icons
- Minimum 4.5:1 contrast ratio for text
- Interactive elements must have focus states

---

## Future API Integration Points

When ready to connect to real data, replace mock data with:

```typescript
// Example API shape
GET /api/deployments

Response:
{
  services: ServiceData[],
  updatedAt: ISO8601 string
}
```

The component structure is designed to make this swap trivial.
