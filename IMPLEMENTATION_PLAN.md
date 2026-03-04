# Implementation Plan: Environment Status Dashboard

**Version:** 1.0
**Created:** 2026-03-04
**Status:** Ready for Development

---

## Table of Contents

1. [Project Setup](#1-project-setup)
2. [Implementation Phases](#2-implementation-phases)
3. [Detailed Task Breakdown](#3-detailed-task-breakdown)
4. [Testing Strategy](#4-testing-strategy)
5. [Risk Assessment](#5-risk-assessment)

---

## 1. Project Setup

### Technology Stack

| Technology | Purpose | Version |
|-----------|---------|---------|
| React 18 | UI framework | ^18.x |
| Vite | Build tool & dev server | ^5.x |
| Tailwind CSS | Utility-first styling | ^3.x |
| Lucide React | Icon library (accessibility) | latest |
| Recharts | Visualizations (if needed) | latest |

### Project Initialization

```bash
npm create vite@latest . -- --template react
npm install tailwindcss @tailwindcss/vite lucide-react
```

### File Structure

```
src/
├── App.jsx                    # Root component, data provider
├── main.jsx                   # Entry point
├── index.css                  # Tailwind imports
├── components/
│   ├── Header.jsx             # Dashboard header with title & refresh
│   ├── StatusGrid.jsx         # Grid container with column headers
│   ├── ServiceRow.jsx         # Row per service with drift calculation
│   ├── StatusCell.jsx         # Individual deployment cell
│   ├── HealthIndicator.jsx    # Color dot + accessible icon
│   ├── DriftBadge.jsx         # Version drift warning badge
│   └── FilterBar.jsx          # Search and health filter (FR-6)
├── data/
│   └── mockData.js            # Mock service deployment data
├── utils/
│   ├── formatRelativeTime.js  # Human-readable relative timestamps
│   ├── calculateDrift.js      # Version drift detection logic
│   └── healthColors.js        # Tailwind class mappings for health status
└── index.html
```

---

## 2. Implementation Phases

### Phase Overview

| Phase | Focus | Tasks | Dependencies |
|-------|-------|-------|-------------|
| 1 | Core Infrastructure & Data | 5 | None |
| 2 | Basic Components | 5 | Phase 1 |
| 3 | Styling & Visual Polish | 4 | Phase 2 |
| 4 | Advanced Features | 3 | Phase 3 |
| 5 | Testing & Refinement | 4 | Phase 4 |

---

## 3. Detailed Task Breakdown

### Phase 1: Core Infrastructure & Data Layer

#### Task 1.1: Initialize Vite + React Project
- **Description:** Scaffold the project with Vite React template, configure Tailwind CSS, install dependencies.
- **Complexity:** Low
- **Files:** `package.json`, `vite.config.js`, `tailwind.config.js`, `src/index.css`, `src/main.jsx`
- **Acceptance Criteria:**
  - `npm run dev` starts dev server on port 3000
  - Tailwind utility classes work in JSX
  - Lucide React icons render correctly

#### Task 1.2: Create Mock Data Module
- **Description:** Implement the mock data from DATA_MODEL.md with all 6 services across 3 environments. Timestamps should be relative to current time.
- **Complexity:** Low
- **Files:** `src/data/mockData.js`
- **Acceptance Criteria:**
  - Exports `mockData` object matching the `DashboardData` interface
  - All 6 services included: api-gateway, auth-service, user-service, payment-service, notification-service, search-service
  - Timestamps are dynamic (relative to `Date.now()`)
  - Covers all scenarios: healthy, degraded, down states

#### Task 1.3: Implement `formatRelativeTime` Utility
- **Description:** Convert ISO timestamps to human-readable relative time strings per FR-5 spec.
- **Complexity:** Low
- **Files:** `src/utils/formatRelativeTime.js`
- **Acceptance Criteria:**
  - "Just now" for < 1 minute
  - "X minutes ago" for < 60 minutes
  - "X hours ago" for < 24 hours
  - "X days ago" for >= 24 hours

#### Task 1.4: Implement `calculateDrift` Utility
- **Description:** Parse semantic versions and calculate drift between environments per FR-4 and DATA_MODEL.md drift logic.
- **Complexity:** Medium
- **Files:** `src/utils/calculateDrift.js`
- **Acceptance Criteria:**
  - Parses `vX.Y.Z` format correctly
  - Handles non-semver strings (beta, SHA) gracefully (returns null)
  - Staging drift warning when > 2 minor versions behind dev
  - Production drift warning when > 1 minor version behind staging
  - Major version differences weighted correctly (major * 100 + minor)

#### Task 1.5: Implement `healthColors` Utility
- **Description:** Map health statuses to Tailwind CSS class sets (background, border, text).
- **Complexity:** Low
- **Files:** `src/utils/healthColors.js`
- **Acceptance Criteria:**
  - Returns correct Tailwind classes for healthy (green), degraded (yellow), down (red)
  - Includes background, border, and text color classes per TECHNICAL_SPEC color palette

---

### Phase 2: Basic Component Structure

#### Task 2.1: Build `App` Root Component
- **Description:** Application shell that loads mock data, manages state, and renders Header + StatusGrid.
- **Complexity:** Low
- **Dependencies:** Task 1.1, 1.2
- **Files:** `src/App.jsx`
- **Acceptance Criteria:**
  - Loads mock data into state on mount
  - Tracks `lastUpdated` timestamp
  - Passes data to child components
  - Refresh button reloads data and updates timestamp

#### Task 2.2: Build `Header` Component
- **Description:** Dashboard header with title, last updated time, and refresh button.
- **Complexity:** Low
- **Dependencies:** Task 1.3
- **Files:** `src/components/Header.jsx`
- **Acceptance Criteria:**
  - Displays "Environment Status Dashboard" title
  - Shows last updated in relative time format
  - Refresh button triggers data reload callback
  - Uses Lucide `RefreshCw` icon

#### Task 2.3: Build `StatusGrid` Component
- **Description:** Grid/table layout with environment column headers and service rows.
- **Complexity:** Medium
- **Dependencies:** Task 2.1
- **Files:** `src/components/StatusGrid.jsx`
- **Acceptance Criteria:**
  - Column headers: Service, Development, Staging, Production
  - Maps services array to ServiceRow components
  - Sticky header row
  - Alternating row backgrounds

#### Task 2.4: Build `ServiceRow` Component
- **Description:** Single row displaying service name and a StatusCell per environment. Calculates drift.
- **Complexity:** Medium
- **Dependencies:** Task 1.4, 2.3
- **Files:** `src/components/ServiceRow.jsx`
- **Acceptance Criteria:**
  - Displays service name in fixed-width left column
  - Renders StatusCell for each environment (dev, staging, prod)
  - Passes drift calculation results to StatusCells

#### Task 2.5: Build `StatusCell` Component
- **Description:** Individual cell showing version, health, timestamp, deployer, and optional drift badge.
- **Complexity:** Medium
- **Dependencies:** Task 1.3, 1.5
- **Files:** `src/components/StatusCell.jsx`
- **Acceptance Criteria:**
  - Displays health indicator (colored dot)
  - Shows version string
  - Shows relative timestamp
  - Shows deployer name
  - Conditionally renders drift badge
  - Visual hierarchy: health > version > timestamp > deployer

---

### Phase 3: Styling & Visual Polish

#### Task 3.1: Build `HealthIndicator` Sub-component
- **Description:** Colored dot with accessible icon overlay (checkmark/warning/x) for colorblind users.
- **Complexity:** Low
- **Dependencies:** Task 1.5, 2.5
- **Files:** `src/components/HealthIndicator.jsx`
- **Acceptance Criteria:**
  - Green dot + `CheckCircle` icon for healthy
  - Yellow dot + `AlertTriangle` icon for degraded
  - Red dot + `XCircle` icon for down
  - Icons from Lucide React
  - Meets WCAG AA contrast requirements (NFR-2)

#### Task 3.2: Build `DriftBadge` Sub-component
- **Description:** Warning badge showing version drift count.
- **Complexity:** Low
- **Dependencies:** Task 1.4, 2.4
- **Files:** `src/components/DriftBadge.jsx`
- **Acceptance Criteria:**
  - Displays "⚠ X versions behind" text
  - Orange color scheme (bg-orange-100, border-orange-300, text-orange-800)
  - Only renders when drift threshold exceeded

#### Task 3.3: Apply Grid Styling & Layout
- **Description:** Polish the overall grid layout, spacing, hover states, and responsive behavior.
- **Complexity:** Medium
- **Dependencies:** Task 3.1, 3.2
- **Files:** All component files
- **Acceptance Criteria:**
  - Minimum 1280px supported width (NFR-3)
  - StatusCell hover states for interactivity
  - Subtle background tint based on health status
  - Clean typography hierarchy
  - Consistent spacing and alignment

#### Task 3.4: Header & Page Chrome Styling
- **Description:** Style the header, page background, and overall layout container.
- **Complexity:** Low
- **Dependencies:** Task 2.2
- **Files:** `src/components/Header.jsx`, `src/App.jsx`, `src/index.css`
- **Acceptance Criteria:**
  - Professional dashboard appearance
  - Clear visual separation between header and grid
  - Consistent with Tailwind design system

---

### Phase 4: Advanced Features

#### Task 4.1: Implement FilterBar Component (FR-6)
- **Description:** Add filtering by health status and text search by service name.
- **Complexity:** Medium
- **Dependencies:** Phase 3
- **Files:** `src/components/FilterBar.jsx`, `src/App.jsx`
- **Acceptance Criteria:**
  - Text input for service name search (case-insensitive)
  - Health status filter buttons (All, Healthy, Degraded, Down)
  - Filters apply in real-time
  - Filter state managed in App component
  - Clear/reset filter option

#### Task 4.2: Add `React.memo` Optimizations
- **Description:** Wrap StatusCell and other frequently re-rendered components with React.memo.
- **Complexity:** Low
- **Dependencies:** Phase 3
- **Files:** `src/components/StatusCell.jsx`, `src/components/ServiceRow.jsx`
- **Acceptance Criteria:**
  - StatusCell wrapped with React.memo
  - No unnecessary re-renders during filter operations
  - Props comparison works correctly

#### Task 4.3: Add Focus States & Keyboard Accessibility
- **Description:** Ensure interactive elements have visible focus states and keyboard navigation.
- **Complexity:** Low
- **Dependencies:** Phase 3
- **Files:** All component files
- **Acceptance Criteria:**
  - Refresh button has focus-visible ring
  - Filter inputs have focus states
  - Tab navigation works through interactive elements
  - Screen reader friendly labels

---

### Phase 5: Testing & Refinement

#### Task 5.1: Visual Review with Playwright
- **Description:** Use Playwright to screenshot and verify the rendered dashboard.
- **Complexity:** Medium
- **Dependencies:** Phase 4
- **Acceptance Criteria:**
  - Dashboard renders all 6 services
  - All 3 environments display correct data
  - Health indicators show correct colors
  - Drift badges appear for Payment Service and Search Service
  - No layout issues or visual regressions

#### Task 5.2: Cross-Browser Verification
- **Description:** Verify rendering on latest Chrome at minimum 1280px width.
- **Complexity:** Low
- **Dependencies:** Task 5.1
- **Acceptance Criteria:**
  - No layout breaks at 1280px
  - All Tailwind utilities render correctly
  - Colors and icons display properly

#### Task 5.3: Performance Check
- **Description:** Verify initial page load is under 2 seconds (NFR-1).
- **Complexity:** Low
- **Dependencies:** Task 5.1
- **Acceptance Criteria:**
  - Dev server loads page in < 2 seconds
  - No blocking UI operations
  - React DevTools shows no unnecessary re-renders

#### Task 5.4: Final Data Scenario Validation
- **Description:** Verify all mock data scenarios from DATA_MODEL.md are represented correctly.
- **Complexity:** Low
- **Dependencies:** Task 5.1
- **Acceptance Criteria:**
  - API Gateway: Healthy across all environments
  - Auth Service: Staging shows degraded (yellow)
  - Payment Service: Production shows down (red)
  - Payment Service: Drift warning visible (prod v3.9.1 vs staging v4.0.2)
  - Search Service: Development shows degraded, has beta version
  - Notification Service: Recently active (15 min ago in dev)

---

## 4. Testing Strategy

### Unit Testing (Utilities)

| Utility | Test Cases |
|---------|-----------|
| `formatRelativeTime` | Just now, minutes, hours, days, edge cases (future dates, exact boundaries) |
| `calculateDrift` | Normal semver, major version diff, beta/SHA handling, null inputs |
| `healthColors` | All 3 statuses return correct class sets |

### Component Testing (Visual)

| Component | Verification Method |
|-----------|-------------------|
| HealthIndicator | Renders correct color + icon per status |
| DriftBadge | Shows/hides based on drift threshold |
| StatusCell | Displays all 4 data fields correctly |
| StatusGrid | Renders correct number of rows and columns |
| FilterBar | Search filters services, status filter works |
| Header | Title, timestamp, refresh button functional |

### Integration Testing (Playwright)

1. **Full render test:** Load dashboard, verify all 6 services × 3 environments = 18 cells render
2. **Health status test:** Verify correct color coding for healthy/degraded/down
3. **Drift test:** Verify drift badges appear on correct services
4. **Filter test:** Type in search, verify services filter; click health filter, verify status filter
5. **Refresh test:** Click refresh, verify timestamp updates

---

## 5. Risk Assessment

### Risk 1: Tailwind CSS Class Purging
- **Risk:** Dynamically constructed Tailwind classes may be purged in production builds
- **Impact:** Medium - Health indicators could lose their color styling
- **Mitigation:** Use complete class strings in `healthColors.js` (e.g., `"bg-green-50"` not `"bg-" + color + "-50"`). Safelist critical classes in Tailwind config if needed.

### Risk 2: Version Drift Calculation Edge Cases
- **Risk:** Non-standard version strings (beta, SHA, pre-release) may cause calculation errors
- **Impact:** Low - Only affects drift display, not core functionality
- **Mitigation:** Return `null` for unparseable versions; only show drift badge when both versions are valid semver. Already handled in DATA_MODEL.md spec.

### Risk 3: Relative Timestamp Staleness
- **Risk:** Timestamps become inaccurate as the page sits open without refresh
- **Impact:** Low - Mock data demo context, not a production concern for V1
- **Mitigation:** Accept for V1. Future improvement: add `setInterval` to periodically re-render timestamps or auto-refresh data.

### Risk 4: Performance with Many Services
- **Risk:** Grid could lag with large numbers of services
- **Impact:** Low - Demo uses only 6 services
- **Mitigation:** React.memo on StatusCell (Task 4.2). Virtualized list if needed in future.

### Risk 5: Accessibility Color Contrast
- **Risk:** Status colors (especially yellow/degraded) may not meet WCAG AA 4.5:1 ratio
- **Impact:** Medium - NFR-2 compliance failure
- **Mitigation:** Use Tailwind's -700 variants for text (e.g., `text-yellow-700` on white background). Supplement all colors with Lucide icons (HealthIndicator component).

### Alternative Approaches

| Decision | Chosen | Alternative | Rationale |
|----------|--------|-------------|-----------|
| Layout | CSS Grid via Tailwind | HTML `<table>` | Grid is more flexible for styling; table is more semantic. Grid preferred for visual control. |
| State management | React useState | Context API | Only one level of prop drilling; Context adds complexity without benefit at this scale. |
| Icons | Lucide React | Heroicons / custom SVGs | Lucide has good React support, tree-shakeable, consistent style. |
| Timestamps | Custom `formatRelativeTime` | date-fns / dayjs | Avoid extra dependency for a simple utility. |

---

## Implementation Timeline

| Phase | Estimated Effort | Cumulative |
|-------|-----------------|------------|
| Phase 1: Core Infrastructure | ~30 min | 30 min |
| Phase 2: Basic Components | ~45 min | 1h 15min |
| Phase 3: Styling & Polish | ~30 min | 1h 45min |
| Phase 4: Advanced Features | ~30 min | 2h 15min |
| Phase 5: Testing & Refinement | ~15 min | 2h 30min |

---

## Validation Checklist

- [x] All PRD functional requirements (FR-1 through FR-6) have corresponding tasks
- [x] Non-functional requirements (performance, accessibility, responsiveness) are addressed
- [x] Tasks are sequenced with explicit dependencies
- [x] Testing strategy covers unit, component, and integration levels
- [x] Risk assessment identifies technical challenges with mitigations
- [x] File structure matches TECHNICAL_SPEC.md specification
- [x] Mock data covers all 6 services and demonstration scenarios
- [x] Accessibility requirements (icons, contrast, focus states) are planned
