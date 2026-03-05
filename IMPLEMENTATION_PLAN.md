# Implementation Plan: Environment Status Dashboard

**Version:** 2.0
**Created:** 2026-03-04
**Updated:** 2026-03-05
**Status:** Ready for Development
**References:** [PRD](product-docs/PRD.md) | [Technical Spec](product-docs/TECHNICAL_SPEC.md) | [Data Model](product-docs/DATA_MODEL.md)

---

## Table of Contents

1. [Development Phases](#1-development-phases)
2. [File Structure](#2-file-structure)
3. [Component Implementation Order](#3-component-implementation-order)
4. [Testing Strategy](#4-testing-strategy)
5. [Integration Steps](#5-integration-steps)
6. [Acceptance Criteria](#6-acceptance-criteria)
7. [Risk Assessment & Mitigations](#7-risk-assessment--mitigations)

---

## 1. Development Phases

### Phase Overview

| Phase | Focus | Description | Depends On |
|-------|-------|-------------|------------|
| 1 | Project Setup & Data Layer | Scaffold project, install dependencies, create mock data and utility functions | None |
| 2 | Core Components | Build the foundational component tree: App, Header, StatusGrid, ServiceRow, StatusCell | Phase 1 |
| 3 | Visual Sub-components & Styling | Build HealthIndicator, DriftBadge; apply Tailwind styling, hover states, and layout polish | Phase 2 |
| 4 | Advanced Features & Accessibility | Add FilterBar (FR-6), React.memo optimizations, keyboard navigation, focus states | Phase 3 |
| 5 | Testing, Verification & Refinement | Playwright visual testing, performance checks, data scenario validation, final polish | Phase 4 |

---

### Phase 1: Project Setup & Data Layer

**Goal:** Establish the project foundation with build tooling, mock data, and all utility functions.

#### Task 1.1: Initialize Vite + React Project

- Scaffold with `npm create vite@latest . -- --template react`
- Install dependencies: `tailwindcss`, `@tailwindcss/vite`, `lucide-react`
- Configure Vite to serve on port 3000
- Configure Tailwind CSS via the Vite plugin
- **Files:** `package.json`, `vite.config.js`, `index.html`, `src/main.jsx`, `src/index.css`
- **Acceptance Criteria:**
  - `npm run dev` starts dev server on `localhost:3000`
  - Tailwind utility classes render correctly in JSX
  - Lucide React icons import and render
  - ESLint configured for code quality

#### Task 1.2: Create Mock Data Module

- Implement mock data matching the `DashboardData` interface from DATA_MODEL.md
- All timestamps must be dynamic (relative to `Date.now()`)
- Cover all 6 services: api-gateway, auth-service, user-service, payment-service, notification-service, search-service
- Cover all 3 environments: development, staging, production
- **Files:** `src/data/mockData.js`
- **Acceptance Criteria:**
  - Exports `mockData` object with `services` array and `updatedAt` field
  - Each service has `id`, `name`, `description`, and `deployments` for all 3 environments
  - Each deployment has `version`, `deployedAt`, `deployedBy`, `health`
  - Demonstrates scenarios: healthy, degraded, down, beta versions, version drift
  - Data scenarios match DATA_MODEL.md table exactly:
    - API Gateway: Healthy across all environments
    - Auth Service: Staging degraded
    - User Service: Normal, no issues
    - Payment Service: Production DOWN
    - Notification Service: Recently active development
    - Search Service: Dev has beta version, dev is degraded

#### Task 1.3: Implement `formatRelativeTime` Utility

- Convert ISO 8601 timestamps to human-readable relative time strings per FR-5
- **Files:** `src/utils/formatRelativeTime.js`
- **Acceptance Criteria:**
  - Returns "Just now" for < 1 minute
  - Returns "X minutes ago" for 1-59 minutes
  - Returns "X hours ago" for 1-23 hours
  - Returns "X days ago" for >= 24 hours
  - Handles edge cases: exact boundaries, future dates, invalid input

#### Task 1.4: Implement `calculateDrift` Utility

- Parse semantic versions and calculate minor version drift between environments
- Follows drift logic from DATA_MODEL.md: `(major * 100 + minor)` difference
- **Files:** `src/utils/calculateDrift.js`
- **Acceptance Criteria:**
  - Parses `vX.Y.Z` format correctly (strips leading "v")
  - Returns `null` for unparseable versions (beta, SHA, pre-release)
  - `shouldShowDriftWarning()` returns:
    - `stagingWarning: true` when staging > 2 minor versions behind dev (FR-4)
    - `prodWarning: true` when production > 1 minor version behind staging (FR-4)
  - Handles major version boundaries correctly

#### Task 1.5: Implement `healthColors` Utility

- Map `HealthStatus` to Tailwind CSS class sets per Technical Spec color palette
- **Files:** `src/utils/healthColors.js`
- **Acceptance Criteria:**
  - `healthy` → `bg-green-50`, `border-green-200`, `text-green-700`
  - `degraded` → `bg-yellow-50`, `border-yellow-200`, `text-yellow-700`
  - `down` → `bg-red-50`, `border-red-200`, `text-red-700`
  - Uses complete Tailwind class strings (not dynamic construction) to avoid purging issues

---

### Phase 2: Core Components

**Goal:** Build the primary component tree so data flows from App → StatusGrid → ServiceRow → StatusCell.

#### Task 2.1: Build `App` Root Component

- Application shell that loads mock data, manages state, provides data to children
- **Dependencies:** Task 1.1, 1.2
- **Files:** `src/App.jsx`
- **Acceptance Criteria:**
  - Loads `mockData` into state via `useState` on mount
  - Tracks `lastUpdated` timestamp in state
  - Passes `services` to StatusGrid and `lastUpdated` to Header
  - Refresh button handler reloads data and updates `lastUpdated`
  - Renders Header and StatusGrid in correct layout

#### Task 2.2: Build `Header` Component

- Dashboard header displaying title, last-updated time, and refresh action
- **Dependencies:** Task 1.3
- **Files:** `src/components/Header.jsx`
- **Props:** `lastUpdated: Date`, `onRefresh: Function`
- **Acceptance Criteria:**
  - Displays title: "Environment Status Dashboard" (Technical Spec says "Coder Environment Status Dashboard")
  - Shows last updated time using `formatRelativeTime()`
  - Refresh button with Lucide `RefreshCw` icon triggers `onRefresh` callback
  - Clean layout matching PRD UI/UX wireframe

#### Task 2.3: Build `StatusGrid` Component

- Grid container with column headers and service rows
- **Dependencies:** Task 2.1
- **Files:** `src/components/StatusGrid.jsx`
- **Props:** `services: ServiceData[]`
- **Acceptance Criteria:**
  - Renders column headers: "Service", "Development", "Staging", "Production" (FR-1)
  - Maps over `services` array to render one `ServiceRow` per service
  - Sticky header row for scrolling
  - Alternating row backgrounds for scannability

#### Task 2.4: Build `ServiceRow` Component

- Single row: service name + StatusCell per environment, with drift calculation
- **Dependencies:** Task 1.4, 2.3
- **Files:** `src/components/ServiceRow.jsx`
- **Props:** `service: ServiceData`
- **Acceptance Criteria:**
  - Displays service name in fixed-width left column
  - Renders a `StatusCell` for each of: development, staging, production
  - Calls `calculateDrift` with all 3 environment versions
  - Passes `hasDrift` boolean to appropriate StatusCells

#### Task 2.5: Build `StatusCell` Component

- Individual cell showing deployment info: health, version, timestamp, deployer, drift
- **Dependencies:** Task 1.3, 1.5
- **Files:** `src/components/StatusCell.jsx`
- **Props:** `deployment: DeploymentData`, `hasDrift: boolean`
- **Acceptance Criteria:**
  - Displays health indicator (colored dot) — placeholder until HealthIndicator built
  - Shows version string (e.g., "v2.4.1") (FR-2)
  - Shows relative timestamp via `formatRelativeTime()` (FR-2, FR-5)
  - Shows deployer name (FR-2)
  - Conditionally renders drift badge placeholder when `hasDrift` is true (FR-4)
  - Visual hierarchy: health > version > timestamp > deployer (PRD)
  - Wrapped with `React.memo` for performance (Technical Spec)

---

### Phase 3: Visual Sub-components & Styling

**Goal:** Add the visual detail components and polish the overall dashboard appearance.

#### Task 3.1: Build `HealthIndicator` Sub-component

- Colored dot with accessible icon overlay for colorblind support (NFR-2)
- **Dependencies:** Task 1.5, 2.5
- **Files:** `src/components/HealthIndicator.jsx`
- **Props:** `status: 'healthy' | 'degraded' | 'down'`
- **Acceptance Criteria:**
  - `healthy` → Green dot + Lucide `CheckCircle` icon
  - `degraded` → Yellow dot + Lucide `AlertTriangle` icon
  - `down` → Red dot + Lucide `XCircle` icon
  - Icons supplement color (not replace) for accessibility (NFR-2)
  - Meets WCAG AA 4.5:1 contrast ratio

#### Task 3.2: Build `DriftBadge` Sub-component

- Warning badge showing version drift count
- **Dependencies:** Task 1.4, 2.4
- **Files:** `src/components/DriftBadge.jsx`
- **Props:** `versionsAhead: number`
- **Acceptance Criteria:**
  - Displays "⚠ X versions behind" text
  - Styled with drift warning palette: `bg-orange-100`, `border-orange-300`, `text-orange-800`
  - Only rendered when drift threshold is exceeded
  - Compact, badge-style layout that fits within StatusCell

#### Task 3.3: Apply Grid Styling & Layout Polish

- Comprehensive styling pass on all grid components
- **Dependencies:** Task 3.1, 3.2
- **Files:** All component files
- **Acceptance Criteria:**
  - Minimum 1280px supported width (NFR-3)
  - StatusCell hover states for interactivity
  - Subtle background tint per health status in each cell
  - Clean typography hierarchy with consistent font sizes
  - Consistent spacing, padding, and alignment throughout
  - Professional dashboard appearance

#### Task 3.4: Header & Page Chrome Styling

- Style the header section, page background, overall container
- **Dependencies:** Task 2.2
- **Files:** `src/components/Header.jsx`, `src/App.jsx`, `src/index.css`
- **Acceptance Criteria:**
  - Clear visual separation between header and grid
  - Cohesive color scheme using Tailwind defaults
  - Page background and container max-width set appropriately

---

### Phase 4: Advanced Features & Accessibility

**Goal:** Add filtering, performance optimizations, and full accessibility support.

#### Task 4.1: Build `FilterBar` Component (FR-6)

- Search input + health status filter buttons
- **Dependencies:** Phase 3
- **Files:** `src/components/FilterBar.jsx`, `src/App.jsx` (add filter state)
- **Acceptance Criteria:**
  - Text input for service name search (case-insensitive)
  - Health status filter buttons: All, Healthy, Degraded, Down
  - Filters apply in real-time as user types or clicks
  - Filter state managed in `App` component, passed down
  - Clear/reset option to remove all filters
  - Empty state message when no services match filters
  - Uses Lucide `Search` icon in search input

#### Task 4.2: React.memo Optimizations

- Prevent unnecessary re-renders on filter or refresh operations
- **Dependencies:** Phase 3
- **Files:** `src/components/StatusCell.jsx`, `src/components/ServiceRow.jsx`
- **Acceptance Criteria:**
  - `StatusCell` wrapped with `React.memo`
  - `ServiceRow` wrapped with `React.memo`
  - No unnecessary re-renders when filters change (only affected rows re-render)
  - Props comparison works correctly with object references

#### Task 4.3: Keyboard Accessibility & Focus States

- Full keyboard navigation and screen reader support
- **Dependencies:** Phase 3
- **Files:** All component files with interactive elements
- **Acceptance Criteria:**
  - Refresh button has `focus-visible` ring styling
  - Filter inputs have clear focus indicators
  - Tab navigation flows logically through interactive elements
  - `aria-label` attributes on icon-only buttons
  - Screen reader text for health status indicators
  - All interactive elements are keyboard-reachable

---

### Phase 5: Testing, Verification & Refinement

**Goal:** Validate everything works correctly through automated and manual testing.

#### Task 5.1: Playwright Visual Verification

- Automated screenshot and DOM inspection of the rendered dashboard
- **Dependencies:** Phase 4
- **Acceptance Criteria:**
  - Dashboard renders all 6 services (6 rows visible)
  - All 3 environment columns populated (18 cells total)
  - Health indicators display correct colors (green/yellow/red)
  - Drift badges appear on Payment Service (prod drift) and any other qualifying services
  - No layout overflow or alignment issues
  - No JavaScript console errors

#### Task 5.2: Data Scenario Validation

- Verify each mock data scenario from DATA_MODEL.md renders correctly
- **Dependencies:** Task 5.1
- **Acceptance Criteria:**
  - API Gateway: Green/healthy across all 3 environments
  - Auth Service: Dev & Prod healthy (green), Staging degraded (yellow)
  - User Service: All healthy, no drift warnings
  - Payment Service: Dev & Staging healthy, Production DOWN (red), drift warning visible
  - Notification Service: Recently deployed (timestamp shows minutes ago in dev)
  - Search Service: Dev degraded (yellow) with beta version, Staging & Prod healthy

#### Task 5.3: Performance Validation

- Verify page load time and responsiveness per NFR-1
- **Dependencies:** Task 5.1
- **Acceptance Criteria:**
  - Initial page load under 2 seconds on dev server
  - No blocking UI operations during data load
  - Smooth filter interactions with no perceptible lag
  - No layout shifts during initial render

#### Task 5.4: Filter & Interaction Testing

- Verify filter functionality and interactive elements
- **Dependencies:** Task 5.1
- **Acceptance Criteria:**
  - Typing "pay" in search shows only Payment Service
  - Clicking "Down" health filter shows only Payment Service
  - Clicking "Degraded" shows Auth Service and Search Service
  - Clicking "All" resets to show all 6 services
  - Refresh button updates the "last updated" timestamp
  - Combined search + health filter works correctly

#### Task 5.5: Accessibility Audit

- Verify WCAG AA compliance and accessibility features
- **Dependencies:** Task 5.1
- **Acceptance Criteria:**
  - All color indicators accompanied by icons (NFR-2)
  - Text contrast meets 4.5:1 ratio (NFR-2)
  - Keyboard navigation through all interactive elements works
  - Screen reader can convey health status without relying on color alone

---

## 2. File Structure

```
mvp-ai-demo/
├── index.html                     # HTML entry point with root div
├── package.json                   # Dependencies and scripts
├── vite.config.js                 # Vite config: React plugin, Tailwind, port 3000
├── eslint.config.js               # ESLint configuration
├── product-docs/
│   ├── PRD.md                     # Product Requirements Document
│   ├── TECHNICAL_SPEC.md          # Technical Specification
│   ├── DATA_MODEL.md              # Data Model & Mock Data
│   └── README.md                  # Product docs overview
├── src/
│   ├── main.jsx                   # ReactDOM entry point, renders <App />
│   ├── index.css                  # Tailwind CSS import (@import "tailwindcss")
│   ├── App.jsx                    # Root component: state, data loading, layout
│   ├── components/
│   │   ├── Header.jsx             # Title, last updated, refresh button
│   │   ├── StatusGrid.jsx         # Grid container with column headers
│   │   ├── ServiceRow.jsx         # Per-service row with drift calculation
│   │   ├── StatusCell.jsx         # Individual deployment cell (memoized)
│   │   ├── HealthIndicator.jsx    # Colored dot + accessible icon
│   │   ├── DriftBadge.jsx         # Version drift warning badge
│   │   └── FilterBar.jsx          # Search input + health status filters
│   ├── data/
│   │   └── mockData.js            # Mock data for 6 services × 3 environments
│   └── utils/
│       ├── formatRelativeTime.js  # ISO timestamp → "X hours ago"
│       ├── calculateDrift.js      # Semantic version drift detection
│       └── healthColors.js        # HealthStatus → Tailwind class mapping
└── IMPLEMENTATION_PLAN.md         # This file
```

### File Responsibilities

| File | Responsibility | PRD Requirement |
|------|---------------|-----------------|
| `App.jsx` | State management, data loading, filter logic, layout shell | All FRs |
| `Header.jsx` | Title display, last-updated time, refresh action | FR-5 |
| `StatusGrid.jsx` | Grid layout, column headers, row rendering | FR-1 |
| `ServiceRow.jsx` | Per-service row, drift calculation delegation | FR-1, FR-4 |
| `StatusCell.jsx` | Cell rendering: version, health, time, deployer, drift | FR-2, FR-3, FR-5 |
| `HealthIndicator.jsx` | Color-coded health dot with accessible icon | FR-3, NFR-2 |
| `DriftBadge.jsx` | Version drift warning display | FR-4 |
| `FilterBar.jsx` | Search and health status filtering | FR-6 |
| `mockData.js` | All mock service/deployment data | Data Requirements |
| `formatRelativeTime.js` | Relative timestamp formatting | FR-5 |
| `calculateDrift.js` | Version parsing and drift threshold logic | FR-4 |
| `healthColors.js` | Health status → Tailwind class mapping | FR-3 |

---

## 3. Component Implementation Order

Build components bottom-up (utilities first, then leaf components, then containers):

```
Step 1: Utilities (no dependencies)
  ├── formatRelativeTime.js
  ├── calculateDrift.js
  └── healthColors.js

Step 2: Data Layer
  └── mockData.js (uses no utilities, but validates against data model)

Step 3: Leaf Components (depend on utilities)
  ├── HealthIndicator.jsx  (uses healthColors)
  └── DriftBadge.jsx       (standalone, receives props)

Step 4: Cell Component (depends on leaf components + utilities)
  └── StatusCell.jsx       (uses HealthIndicator, DriftBadge, formatRelativeTime)

Step 5: Row Component (depends on cell + drift utility)
  └── ServiceRow.jsx       (uses StatusCell, calculateDrift)

Step 6: Grid Component (depends on row)
  └── StatusGrid.jsx       (uses ServiceRow)

Step 7: Header Component (depends on formatRelativeTime)
  └── Header.jsx           (uses formatRelativeTime)

Step 8: Filter Component (standalone, receives callbacks)
  └── FilterBar.jsx

Step 9: Root Component (orchestrates everything)
  └── App.jsx              (uses Header, FilterBar, StatusGrid, mockData)
```

### Dependency Graph

```
App.jsx
├── Header.jsx
│   └── formatRelativeTime.js
├── FilterBar.jsx
└── StatusGrid.jsx
    └── ServiceRow.jsx
        ├── calculateDrift.js
        └── StatusCell.jsx
            ├── HealthIndicator.jsx
            │   └── healthColors.js
            ├── DriftBadge.jsx
            └── formatRelativeTime.js
```

### Build Order Rationale

1. **Utilities first** — They have zero dependencies and are required by multiple components. Building them first enables immediate unit-level verification.
2. **Mock data second** — Provides test data for all subsequent component development.
3. **Leaf components next** — HealthIndicator and DriftBadge are simple, self-contained visual elements that can be verified in isolation.
4. **StatusCell** — The most information-dense component. Building it after its sub-components are ready allows complete rendering.
5. **ServiceRow → StatusGrid** — Container components that compose what's already built.
6. **Header** — Independent of the grid; can be built in parallel with grid components.
7. **FilterBar last among components** — It's a "nice to have" (FR-6) and only modifies what data flows to StatusGrid.
8. **App.jsx last** — Orchestrator that wires everything together.

---

## 4. Testing Strategy

### Layer 1: Utility Unit Tests

Test each utility function in isolation before building components.

| Utility | Test Cases | Method |
|---------|-----------|--------|
| `formatRelativeTime` | "Just now" (30s ago), "5 minutes ago", "2 hours ago", "3 days ago", exact boundary values (59min→1hr, 23hr→1day), invalid/null input | Console verification or inline assertions |
| `calculateDrift` | Normal semver ("v2.4.1" vs "v2.2.0" = 2), major version jump ("v3.0.0" vs "v2.8.0" = 92), beta/SHA returns null, null inputs handled, drift thresholds (>2 for staging, >1 for prod) | Console verification or inline assertions |
| `healthColors` | Returns correct class objects for "healthy", "degraded", "down" | Import and log output |

### Layer 2: Component Visual Verification

Verify each component renders correctly via the dev server.

| Component | What to Verify |
|-----------|---------------|
| `HealthIndicator` | Correct color dot + correct Lucide icon per status (3 variants) |
| `DriftBadge` | Shows "⚠ X versions behind" with orange styling |
| `StatusCell` | All 4 fields render in correct hierarchy; drift badge conditional |
| `ServiceRow` | Service name + 3 StatusCells align in a row; drift passed correctly |
| `StatusGrid` | Column headers sticky; alternating row backgrounds; all 6 rows render |
| `Header` | Title text, relative timestamp, refresh button with icon |
| `FilterBar` | Search input renders, health filter buttons render, interactions work |

### Layer 3: Integration Testing (Playwright)

Automated end-to-end verification after all components are integrated.

| Test | Steps | Expected Result |
|------|-------|-----------------|
| Full Render | Load `localhost:3000`, count service rows | 6 service rows, 18 status cells |
| Health Colors | Inspect Auth Service staging cell | Yellow/degraded styling |
| Health Down | Inspect Payment Service production cell | Red/down styling with XCircle icon |
| Drift Badge | Inspect Payment Service production cell | Orange "versions behind" badge visible |
| Search Filter | Type "auth" in search | Only Auth Service row visible |
| Health Filter | Click "Down" filter | Only Payment Service row visible |
| Refresh | Click refresh button | Last updated timestamp changes |
| No Console Errors | Check browser console | Zero JavaScript errors |

### Layer 4: Non-Functional Validation

| Requirement | Test Method | Target |
|-------------|-------------|--------|
| NFR-1: Performance | Measure page load in browser DevTools | < 2 seconds |
| NFR-2: Accessibility | Verify icons accompany all color indicators; check contrast ratios | WCAG AA (4.5:1) |
| NFR-3: Responsiveness | Resize browser to 1280px width | No layout breaks |

---

## 5. Integration Steps

### Step-by-step guide for assembling the full application:

#### Integration Step 1: Utilities + Data (Phase 1 → Phase 2 bridge)

1. Verify all 3 utilities work independently with test inputs
2. Import `mockData` and run `formatRelativeTime()` on each deployment's `deployedAt` — confirm all return valid strings
3. Run `calculateDrift()` on each service's 3 environment versions — confirm drift detection matches DATA_MODEL.md expectations:
   - Payment Service should trigger prod drift warning (v3.9.1 vs v4.0.2)
4. Run `healthColors()` for each status — confirm Tailwind class strings returned

#### Integration Step 2: Cell Assembly (Phase 2 internals)

1. Build StatusCell with placeholder health dot (simple colored div)
2. Render a single StatusCell with mock deployment data — verify all 4 fields appear
3. Replace placeholder dot with HealthIndicator component — verify icon + color
4. Add DriftBadge conditional rendering — verify it shows/hides correctly
5. Test StatusCell with each health status: healthy, degraded, down

#### Integration Step 3: Row + Grid Assembly (Phase 2 → Phase 3 bridge)

1. Build ServiceRow: render service name + 3 StatusCells
2. Add drift calculation in ServiceRow: call `calculateDrift` with dev/staging/prod versions
3. Pass drift results to appropriate StatusCells
4. Build StatusGrid: render column headers + map services to ServiceRows
5. Verify the full grid renders with mock data — 6 rows × 4 columns (name + 3 environments)

#### Integration Step 4: App Shell Assembly (Phase 3)

1. Wire App.jsx: load mockData into state, render Header + StatusGrid
2. Implement refresh handler: regenerate timestamps, update `lastUpdated`
3. Verify end-to-end: App loads → data appears in grid → refresh updates timestamp
4. Apply all Phase 3 styling: hover states, spacing, background tints

#### Integration Step 5: FilterBar Integration (Phase 4)

1. Add filter state to App.jsx: `searchQuery` (string) + `healthFilter` (string)
2. Implement filter logic: filter `services` array before passing to StatusGrid
   - Search: `service.name.toLowerCase().includes(query.toLowerCase())`
   - Health: at least one deployment in the service matches the selected health status
3. Render FilterBar above StatusGrid, pass filter state + setters
4. Verify combined filtering: search "pay" + filter "Down" → Payment Service only

#### Integration Step 6: Final Assembly & Polish (Phase 4 → Phase 5)

1. Apply React.memo to StatusCell and ServiceRow
2. Add keyboard accessibility: focus rings, aria-labels, tab order
3. Run Playwright full-page verification
4. Fix any layout, data, or interaction issues found
5. Final performance check: page load < 2 seconds

---

## 6. Acceptance Criteria

### Phase 1: Project Setup & Data Layer — Definition of Done

- [ ] `npm run dev` starts Vite dev server on `localhost:3000`
- [ ] Tailwind CSS utility classes render correctly (verify with a test element)
- [ ] `mockData.js` exports data matching `DashboardData` interface with all 6 services
- [ ] `formatRelativeTime()` returns correct strings for all time ranges (just now, minutes, hours, days)
- [ ] `calculateDrift()` correctly identifies Payment Service prod drift
- [ ] `healthColors()` returns correct Tailwind classes for all 3 health statuses
- [ ] No runtime errors in browser console

### Phase 2: Core Components — Definition of Done

- [ ] App loads mock data and renders Header + StatusGrid
- [ ] Header displays title, relative last-updated time, and refresh button
- [ ] StatusGrid shows 4 column headers (Service, Development, Staging, Production)
- [ ] All 6 services render as rows with correct names
- [ ] Each StatusCell displays: version, timestamp, deployer, health indicator
- [ ] Drift calculation runs correctly in ServiceRow
- [ ] Refresh button updates the last-updated timestamp

### Phase 3: Visual Sub-components & Styling — Definition of Done

- [ ] HealthIndicator renders green dot + CheckCircle for healthy
- [ ] HealthIndicator renders yellow dot + AlertTriangle for degraded
- [ ] HealthIndicator renders red dot + XCircle for down
- [ ] DriftBadge displays "⚠ X versions behind" with orange styling
- [ ] DriftBadge appears on Payment Service production cell
- [ ] Grid has sticky column headers
- [ ] Alternating row backgrounds for scannability
- [ ] StatusCell has hover state
- [ ] Overall layout is professional and consistent at 1280px+

### Phase 4: Advanced Features & Accessibility — Definition of Done

- [ ] FilterBar renders with search input and health status buttons
- [ ] Typing a service name filters the grid in real-time
- [ ] Health status buttons filter to matching services
- [ ] "All" button resets filters
- [ ] Combined search + health filter works correctly
- [ ] Empty state shown when no services match
- [ ] React.memo prevents unnecessary StatusCell re-renders
- [ ] All interactive elements have visible focus states
- [ ] Tab navigation works through header → filter → grid
- [ ] Aria-labels on icon-only buttons (refresh, health indicators)

### Phase 5: Testing & Refinement — Definition of Done

- [ ] Playwright confirms 6 services × 3 environments = 18 cells rendered
- [ ] Playwright confirms correct health colors on Auth Service (staging=yellow) and Payment Service (prod=red)
- [ ] Playwright confirms drift badge on Payment Service production
- [ ] Search filter test passes (typing "pay" → 1 result)
- [ ] Health filter test passes (clicking "Down" → Payment Service only)
- [ ] Page load < 2 seconds (NFR-1)
- [ ] No layout breaks at 1280px width (NFR-3)
- [ ] All color indicators have accompanying icons (NFR-2)
- [ ] Zero JavaScript console errors
- [ ] All PRD functional requirements (FR-1 through FR-6) verified
- [ ] All mock data scenarios from DATA_MODEL.md visually confirmed

### Overall Project — Definition of Done

- [ ] All Phase 1-5 acceptance criteria met
- [ ] Dashboard answers "what's deployed where?" in under 5 seconds (PRD success criteria)
- [ ] Version drift between environments is immediately visible (PRD success criteria)
- [ ] Service health issues are obvious at a glance (PRD success criteria)

---

## 7. Risk Assessment & Mitigations

| # | Risk | Impact | Likelihood | Mitigation |
|---|------|--------|------------|------------|
| 1 | Tailwind class purging removes dynamic health colors | Medium | Medium | Use complete class strings in `healthColors.js` (e.g., `"bg-green-50"` not template literals). Safelist critical classes if needed. |
| 2 | Non-semver versions (beta, SHA) cause drift calculation errors | Low | High | Return `null` from `parseVersion()` for unparseable strings. Only show DriftBadge when both versions are valid semver. |
| 3 | Relative timestamps become stale on long-open pages | Low | High | Accept for V1 (mock data demo). Future: add `setInterval` to periodically recalculate timestamps. |
| 4 | Yellow/degraded health color fails WCAG AA contrast | Medium | Medium | Use `-700` text variants (e.g., `text-yellow-700` on white). Always pair with Lucide icon. Test with contrast checker. |
| 5 | Filter state causes full grid re-render on each keystroke | Low | Medium | Apply `React.memo` on StatusCell and ServiceRow. Debounce search input if needed. |

### Technology Decisions

| Decision | Chosen | Alternative | Rationale |
|----------|--------|-------------|-----------|
| UI Framework | React 18 + Vite | Next.js, plain HTML | React provides component model; Vite is lightweight. No SSR needed for this dashboard. |
| Styling | Tailwind CSS | CSS Modules, styled-components | Per Technical Spec. Utility-first approach is fast for dashboard layouts. |
| Icons | Lucide React | Heroicons, custom SVG | Tree-shakeable, consistent design, good React support. |
| Timestamps | Custom utility | date-fns, dayjs | Simple requirement doesn't justify an external dependency. |
| State Management | React useState | Context API, Redux | Single level of prop drilling. Context adds unneeded complexity at this scale. |
| Layout | CSS Grid via Tailwind | HTML `<table>` | Grid is more flexible for styling while maintaining alignment. |
