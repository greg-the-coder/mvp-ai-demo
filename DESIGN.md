# Design Document: Environment Status Dashboard

**Version:** 1.0
**Author:** Platform Engineering
**Status:** Ready for Implementation

---

## Table of Contents

1. [UI/UX Design Specification](#1-uiux-design-specification)
2. [Component Architecture](#2-component-architecture)
3. [Design Decisions](#3-design-decisions)

---

## 1. UI/UX Design Specification

### 1.1 Layout Overview

The dashboard uses a full-width, single-page layout optimized for information density on desktop screens (1280px+). The primary structure is a header bar followed by a grid/table view.

```
┌─────────────────────────────────────────────────────────────────────────┐
│  HEADER                                                                 │
│  ┌─────────────────────────────────────┐  ┌──────────┐ ┌─────────────┐ │
│  │ Coder Environment Status Dashboard  │  │ ● Online │ │ ↻ Refresh   │ │
│  │ Last updated: 2 minutes ago         │  └──────────┘ └─────────────┘ │
│  └─────────────────────────────────────┘                                │
├─────────────────────────────────────────────────────────────────────────┤
│  FILTER BAR (Nice-to-have)                                              │
│  ┌──────────────────┐  ┌──────────────────────────┐                     │
│  │ Filter: All ▾    │  │ 🔍 Search services...    │                     │
│  └──────────────────┘  └──────────────────────────┘                     │
├─────────────────────────────────────────────────────────────────────────┤
│  STATUS GRID                                                            │
│  ┌────────────┬──────────────┬──────────────┬──────────────┐            │
│  │ Service    │ Development  │ Staging      │ Production   │ ← sticky  │
│  ├────────────┼──────────────┼──────────────┼──────────────┤            │
│  │ API Gateway│ ┌──────────┐ │ ┌──────────┐ │ ┌──────────┐ │            │
│  │            │ │StatusCell│ │ │StatusCell│ │ │StatusCell│ │            │
│  │            │ └──────────┘ │ └──────────┘ │ └──────────┘ │            │
│  ├────────────┼──────────────┼──────────────┼──────────────┤            │
│  │ Auth Svc   │ ...          │ ...          │ ...          │            │
│  ├────────────┼──────────────┼──────────────┼──────────────┤            │
│  │ ...        │ ...          │ ...          │ ...          │            │
│  └────────────┴──────────────┴──────────────┴──────────────┘            │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Visual Design System

#### Color Palette

**Base Colors:**

| Token              | Value     | Usage                        |
|--------------------|-----------|------------------------------|
| `bg-primary`       | `#F9FAFB` | Page background (gray-50)    |
| `bg-surface`       | `#FFFFFF` | Card/cell backgrounds        |
| `border-default`   | `#E5E7EB` | Grid borders (gray-200)      |
| `text-primary`     | `#111827` | Headings, service names (gray-900) |
| `text-secondary`   | `#6B7280` | Timestamps, metadata (gray-500) |
| `text-tertiary`    | `#9CA3AF` | Deployer names (gray-400)    |

**Status Colors (with accessible pairings):**

| Status   | Background   | Border          | Text           | Dot/Icon       |
|----------|-------------|-----------------|----------------|----------------|
| Healthy  | `#F0FDF4` (green-50)  | `#BBF7D0` (green-200) | `#15803D` (green-700) | `#22C55E` (green-500) |
| Degraded | `#FEFCE8` (yellow-50) | `#FDE68A` (yellow-200)| `#A16207` (yellow-700)| `#EAB308` (yellow-500)|
| Down     | `#FEF2F2` (red-50)    | `#FECACA` (red-200)   | `#B91C1C` (red-700)   | `#EF4444` (red-500)   |

**Drift Warning:**

| Token              | Value               | Usage                  |
|--------------------|---------------------|------------------------|
| `drift-bg`         | `#FFF7ED` (orange-50)  | Badge background       |
| `drift-border`     | `#FDBA74` (orange-300) | Badge border           |
| `drift-text`       | `#9A3412` (orange-800) | Badge text             |

All color pairings exceed WCAG AA 4.5:1 contrast ratio for normal text.

#### Typography

| Element            | Font            | Size      | Weight   | Tailwind Class                  |
|--------------------|-----------------|-----------|----------|---------------------------------|
| Page title         | System sans     | 24px      | Bold     | `text-2xl font-bold`            |
| Column headers     | System sans     | 14px      | Semibold | `text-sm font-semibold uppercase tracking-wide` |
| Service name       | System sans     | 16px      | Medium   | `text-base font-medium`         |
| Service description| System sans     | 12px      | Normal   | `text-xs text-gray-500`         |
| Version number     | Mono            | 14px      | Semibold | `text-sm font-semibold font-mono` |
| Timestamp          | System sans     | 12px      | Normal   | `text-xs text-gray-500`         |
| Deployer           | System sans     | 12px      | Normal   | `text-xs text-gray-400`         |
| Drift badge        | System sans     | 11px      | Medium   | `text-[11px] font-medium`       |
| Last updated       | System sans     | 14px      | Normal   | `text-sm text-gray-500`         |

Font stack: `font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;` (Tailwind default)
Monospace: `font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;`

#### Spacing System

All spacing uses Tailwind's 4px base unit:

| Context                    | Value   | Tailwind |
|----------------------------|---------|----------|
| Page padding               | 24px    | `p-6`   |
| Grid cell padding          | 16px    | `p-4`   |
| Space between cell elements| 4px     | `space-y-1` |
| Header bottom margin       | 24px    | `mb-6`  |
| Row gap                    | 0 (border-separated) | `divide-y` |
| Column gap                 | 0 (border-separated) | `divide-x` |

#### Iconography

Using **Lucide React** for all icons:

| Icon           | Usage                        | Lucide Component     |
|----------------|------------------------------|----------------------|
| Checkmark      | Healthy status               | `CheckCircle2`       |
| Warning        | Degraded status              | `AlertTriangle`      |
| X circle       | Down status                  | `XCircle`            |
| Alert          | Drift warning                | `AlertTriangle`      |
| Refresh        | Refresh button               | `RefreshCw`          |
| Search         | Filter search input          | `Search`             |
| Clock          | Timestamp accent (optional)  | `Clock`              |

### 1.3 Component Wireframes

#### StatusCell (Detailed)

```
┌──────────────────────────────────────┐
│  ● ✓  v2.4.1                         │  ← Row 1: Health dot + icon + version
│  2 hours ago                          │  ← Row 2: Relative timestamp
│  deployed by sarah.chen               │  ← Row 3: Deployer
│  ┌────────────────────────┐           │  ← Row 4: Conditional drift badge
│  │ ⚠ 3 versions behind    │           │
│  └────────────────────────┘           │
└──────────────────────────────────────┘
```

**Healthy cell** — white background, left green border accent (4px):
```
┌──────────────────────────────────────┐
│ ▎ 🟢 ✓  v2.7.1                       │
│ ▎ 1 day ago                           │
│ ▎ deployed by mike.johnson            │
└──────────────────────────────────────┘
```

**Degraded cell** — subtle yellow-50 background, left yellow border:
```
┌──────────────────────────────────────┐
│ ▎ 🟡 ⚠  v3.2.0                       │
│ ▎ 2 days ago                          │
│ ▎ deployed by alex.kumar              │
└──────────────────────────────────────┘
```

**Down cell** — subtle red-50 background, left red border:
```
┌──────────────────────────────────────┐
│ ▎ 🔴 ✕  v3.9.1                       │
│ ▎ 10 days ago                         │
│ ▎ deployed by lisa.wong               │
└──────────────────────────────────────┘
```

#### Header

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  Coder Environment Status Dashboard         Last updated: 2 min ago │
│                                                        [ ↻ Refresh ] │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

- Title left-aligned, bold, gray-900
- Last updated + refresh button right-aligned
- Refresh button: ghost style, icon + "Refresh" label
- Subtle bottom border separator (`border-b border-gray-200`)

#### DriftBadge

```
┌─────────────────────────┐
│  ⚠ 3 versions behind    │
└─────────────────────────┘
```

- Inline-flex, rounded-full pill shape
- Orange background/border/text per the drift color tokens
- Icon (AlertTriangle) at 12px, text at 11px
- `px-2 py-0.5` padding

### 1.4 Interaction Patterns

#### Hover States

| Element        | Default State             | Hover State                          |
|----------------|---------------------------|--------------------------------------|
| StatusCell     | `bg-white`                | `bg-gray-50` with subtle shadow lift |
| Refresh button | `text-gray-500`           | `text-gray-700 bg-gray-100`         |
| Service name   | `text-gray-900`           | `text-blue-600` (link feel)          |
| DriftBadge     | Standard orange           | Slightly darker bg (`bg-orange-100`) |

#### Focus States

All interactive elements receive a visible focus ring:
- `focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`
- Tab order: Refresh button → Filter dropdown → Search input → Grid cells (row by row, left to right)

#### Transitions

- Cell hover: `transition-colors duration-150`
- Refresh spinner: `animate-spin` on the RefreshCw icon while loading
- Badge appearance: no animation (static rendering from data)

### 1.5 Accessibility

#### WCAG AA Compliance

1. **Color Independence:** Every health status uses both color AND icon:
   - Healthy: Green dot + CheckCircle2 icon
   - Degraded: Yellow dot + AlertTriangle icon
   - Down: Red dot + XCircle icon

2. **Contrast Ratios (all exceed 4.5:1):**
   - Green-700 on green-50: ~5.2:1
   - Yellow-700 on yellow-50: ~5.8:1
   - Red-700 on red-50: ~5.6:1
   - Gray-900 on white: ~17.1:1
   - Gray-500 on white: ~5.9:1

3. **Semantic HTML:**
   - Grid rendered as `<table>` with `<thead>`, `<tbody>`, `<th scope="col">`, `<th scope="row">`
   - Status cells use `role` attributes where needed
   - Health indicators include `aria-label` (e.g., `aria-label="Status: healthy"`)

4. **Screen Reader Support:**
   - Status cells include `aria-label` summarizing all info: "API Gateway, Development: version 2.8.0, healthy, deployed 30 minutes ago by sarah.chen"
   - Drift badges include descriptive text: "Warning: 3 minor versions behind"
   - Last updated time uses `<time>` element with `datetime` attribute

5. **Keyboard Navigation:**
   - Full tab navigation through interactive elements
   - Visible focus indicators on all focusable elements
   - Logical tab order (header → filters → grid rows)

6. **Reduced Motion:**
   - Respect `prefers-reduced-motion` for the refresh spinner
   - `@media (prefers-reduced-motion: reduce) { .animate-spin { animation: none; } }`

---

## 2. Component Architecture

### 2.1 Component Hierarchy

```
App
├── Header
│   ├── Title text
│   ├── LastUpdated timestamp
│   └── RefreshButton
├── FilterBar (nice-to-have)
│   ├── HealthFilter (dropdown)
│   └── SearchInput
└── StatusGrid
    ├── GridHeader (column headers)
    └── ServiceRow (×6 services)
        ├── ServiceNameCell
        │   ├── name
        │   └── description
        └── StatusCell (×3 environments)
            ├── HealthIndicator
            │   ├── colored dot
            │   └── status icon
            ├── version text
            ├── timestamp text
            ├── deployer text
            └── DriftBadge (conditional)
```

### 2.2 Props and State Management

#### State Location: App (Root)

All state lives in the root `App` component. No external state library is needed for this scope.

```javascript
// App state
{
  services: ServiceData[],     // Full service list from mock data
  lastUpdated: Date,           // When data was last loaded
  isRefreshing: boolean,       // Loading state for refresh action
  filters: {                   // Nice-to-have filter state
    healthStatus: 'all' | 'healthy' | 'degraded' | 'down',
    searchQuery: string
  }
}
```

#### Props Flow

```
App
│
├─→ Header
│     props: { lastUpdated: Date, isRefreshing: boolean, onRefresh: () => void }
│
├─→ FilterBar
│     props: { filters: FilterState, onFilterChange: (filters) => void }
│
└─→ StatusGrid
      props: { services: ServiceData[] }
      │
      └─→ ServiceRow
            props: { service: ServiceData }
            │
            ├─→ StatusCell
            │     props: { deployment: DeploymentData, hasDrift: boolean, driftCount: number | null }
            │     │
            │     ├─→ HealthIndicator
            │     │     props: { status: HealthStatus }
            │     │
            │     └─→ DriftBadge
            │           props: { versionsAhead: number }
            │
            └── (drift calculated inside ServiceRow, passed down)
```

#### Key Design Principle: Computation in ServiceRow

`ServiceRow` is responsible for computing drift between environments before passing `hasDrift` and `driftCount` props to individual `StatusCell` components. This keeps StatusCell purely presentational.

```javascript
// Inside ServiceRow
const { stagingWarning, prodWarning } = shouldShowDriftWarning(
  service.deployments.development.version,
  service.deployments.staging.version,
  service.deployments.production.version
);
```

### 2.3 Data Flow

```
mockData.js
    │
    ▼
App (useState + useEffect on mount)
    │
    ├──→ services state ──→ StatusGrid ──→ ServiceRow[] ──→ StatusCell[]
    │
    ├──→ lastUpdated ──→ Header
    │
    └──→ onRefresh callback ──→ Header (RefreshButton)
            │
            ▼
        Re-load mockData, update timestamps
```

**Data refresh flow:**
1. User clicks Refresh button in Header
2. Header calls `onRefresh()` prop
3. App sets `isRefreshing: true`, triggers mock data reload
4. After brief delay (simulating API), App updates `services` and `lastUpdated`
5. React re-renders StatusGrid → ServiceRow → StatusCell chain
6. App sets `isRefreshing: false`

### 2.4 Reusability Patterns

#### HealthIndicator — Fully Reusable

Zero dependencies on dashboard context. Takes a `status` enum and renders the appropriate dot + icon combo. Can be used anywhere health status needs display.

```jsx
<HealthIndicator status="healthy" />
<HealthIndicator status="degraded" />
<HealthIndicator status="down" />
```

#### DriftBadge — Fully Reusable

Self-contained badge component. Only renders when `versionsAhead > 0`.

```jsx
<DriftBadge versionsAhead={3} />
// Renders: ⚠ 3 versions behind
```

#### StatusCell — Dashboard-Specific

Composed of reusable sub-components but layout is specific to this dashboard's grid cell format.

#### Utility Functions — Framework-Agnostic

`formatRelativeTime`, `calculateDrift`, `getHealthColor` are pure functions with no React dependency. They can be unit tested independently and reused in any context.

### 2.5 Performance Strategy

| Technique                | Component      | Rationale                                                |
|--------------------------|----------------|----------------------------------------------------------|
| `React.memo`             | `StatusCell`   | Prevents re-render when sibling cells change             |
| `React.memo`             | `HealthIndicator` | Static output based on single prop                    |
| `React.memo`             | `DriftBadge`   | Static output based on single prop                       |
| `useMemo`                | `ServiceRow`   | Memoize drift calculations per service                   |
| `useMemo`                | `App`          | Memoize filtered services list when filters active       |
| Semantic `<table>`       | `StatusGrid`   | Browser-native table rendering is highly optimized       |

---

## 3. Design Decisions

### 3.1 Layout: Table vs. CSS Grid

**Decision:** Use semantic HTML `<table>` styled with Tailwind.

| Option     | Pros                                      | Cons                                    |
|------------|-------------------------------------------|-----------------------------------------|
| HTML Table | Semantic, accessible by default, sticky headers built-in, screen readers understand row/column relationships | Less flexible for card-style layouts    |
| CSS Grid   | More layout flexibility, easier responsive breakpoints | Requires manual ARIA roles for accessibility, more complex markup |
| Flexbox    | Simple row-based layout                   | No native column alignment, poor accessibility |

**Rationale:** The data is inherently tabular (services × environments). Semantic `<table>` gives us accessibility for free and aligns with the grid requirement in the PRD. Tailwind utility classes provide all needed visual styling without fighting table defaults.

### 3.2 Left Border Accent vs. Full Background

**Decision:** Use a 4px left border accent on StatusCells combined with a subtle background tint.

**Rationale:** A full-color background can be overwhelming when viewing 18 cells at once (6 services × 3 environments). The left border provides a strong visual signal for quick scanning while the subtle background tint provides grouping. This approach reduces visual noise while maintaining clear status communication.

### 3.3 State Management: useState vs. Context vs. External Library

**Decision:** Plain `useState` in the App root component.

**Rationale:** With only 6 services and 3 environments, the data set is small. State is only 2 levels deep (App → StatusGrid → ServiceRow). Adding Context or Redux would be over-engineering for this scope. If the app grows to support real-time WebSocket updates or user preferences, Context can be added incrementally.

### 3.4 Styling: Tailwind CSS (Utility-First)

**Decision:** Tailwind CSS utility classes exclusively, no custom CSS files.

**Rationale:** Per the technical spec requirement. Tailwind provides:
- Consistent spacing/color tokens out of the box
- No CSS file management overhead
- Easy-to-read component-level styles
- Built-in responsive utilities if needed later

### 3.5 Drift Calculation: Minor Version Comparison

**Decision:** Compare minor version numbers between adjacent environments. Ignore patch versions for drift.

**Rationale:**
- Patch versions are typically hotfixes and don't indicate deployment lag
- Minor versions represent feature releases, which are meaningful for drift
- Major version differences automatically produce large drift numbers
- Non-semver versions (SHAs, beta tags) return `null` — drift badge is simply not shown rather than showing incorrect data

### 3.6 Responsive Design Approach

**Decision:** Desktop-only, minimum 1280px width, no responsive breakpoints.

**Rationale:** Per PRD NFR-3, mobile support is not required for V1. The table layout works well at 1280px+ with the following column widths:

| Column       | Width Strategy        | Approximate Width |
|-------------|----------------------|-------------------|
| Service Name | Fixed `w-56` (224px) | ~18% of 1280px    |
| Development  | `flex-1` equal share | ~27% each         |
| Staging      | `flex-1` equal share | ~27% each         |
| Production   | `flex-1` equal share | ~27% each         |

If the viewport is narrower than 1280px, horizontal scroll is acceptable. No collapsing or stacking behavior.

### 3.7 Timestamp Format

**Decision:** Relative time only (no absolute timestamps in V1).

**Rationale:** The PRD specifies relative timestamps as the display format (FR-5). Relative time is faster to scan ("2 hours ago" vs. "2026-03-04T14:23:00Z"). The `<time>` HTML element stores the absolute ISO timestamp in its `datetime` attribute for accessibility and potential tooltip display.

### 3.8 Trade-offs Summary

| Decision                    | What We Gain                          | What We Give Up                      |
|-----------------------------|---------------------------------------|--------------------------------------|
| Semantic table              | Free accessibility, native behavior   | Card-based responsive layouts        |
| Left border accent          | Scannable status at a glance          | Bolder status emphasis               |
| No state library            | Simplicity, fast initial development  | Scalable state management            |
| Desktop-only                | Simpler CSS, faster delivery          | Mobile/tablet access                 |
| Minor-version drift only    | Meaningful drift signals              | Granular patch-level tracking        |
| Relative timestamps only    | Quick scanning                        | Precise time visibility              |

---

## Appendix A: Complete Tailwind Class Reference

### StatusCell Classes by Health Status

```
Healthy:
  container: "p-4 border-l-4 border-l-green-500 bg-green-50/50 hover:bg-green-50 transition-colors duration-150"
  version:   "text-sm font-semibold font-mono text-green-700"
  dot:       "w-2.5 h-2.5 rounded-full bg-green-500"

Degraded:
  container: "p-4 border-l-4 border-l-yellow-500 bg-yellow-50/50 hover:bg-yellow-50 transition-colors duration-150"
  version:   "text-sm font-semibold font-mono text-yellow-700"
  dot:       "w-2.5 h-2.5 rounded-full bg-yellow-500"

Down:
  container: "p-4 border-l-4 border-l-red-500 bg-red-50/50 hover:bg-red-50 transition-colors duration-150"
  version:   "text-sm font-semibold font-mono text-red-700"
  dot:       "w-2.5 h-2.5 rounded-full bg-red-500"
```

### Grid/Table Structure Classes

```
table:     "w-full border-collapse"
thead:     "bg-gray-50 sticky top-0 z-10"
th:        "px-4 py-3 text-left text-sm font-semibold uppercase tracking-wide text-gray-600"
tbody:     "divide-y divide-gray-200"
tr:        "hover:bg-gray-50/50"
td:        "px-0 py-0" (StatusCell handles its own padding)
```

## Appendix B: Component File Mapping

| Component         | File Path                        | Lines (est.) |
|-------------------|----------------------------------|--------------|
| App               | `src/App.jsx`                    | ~60          |
| Header            | `src/components/Header.jsx`      | ~30          |
| StatusGrid        | `src/components/StatusGrid.jsx`  | ~40          |
| ServiceRow        | `src/components/ServiceRow.jsx`  | ~45          |
| StatusCell        | `src/components/StatusCell.jsx`  | ~50          |
| HealthIndicator   | `src/components/HealthIndicator.jsx` | ~25      |
| DriftBadge        | `src/components/DriftBadge.jsx`  | ~20          |
| Mock Data         | `src/data/mockData.js`           | ~80          |
| formatRelativeTime| `src/utils/formatRelativeTime.js`| ~20          |
| calculateDrift    | `src/utils/calculateDrift.js`    | ~30          |
| healthColors      | `src/utils/healthColors.js`      | ~15          |
| **Total**         |                                  | **~415**     |
