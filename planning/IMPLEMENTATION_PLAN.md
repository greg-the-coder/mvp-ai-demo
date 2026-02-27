# Implementation Plan: Environment Status Dashboard

**Version:** 1.0
**Created:** 2026-02-27
**Status:** Ready for Development

---

## Table of Contents

1. [Project Setup Checklist](#1-project-setup-checklist)
2. [File Structure](#2-file-structure)
3. [Development Phases](#3-development-phases)
4. [Component Implementation Order](#4-component-implementation-order)
5. [Testing Strategy](#5-testing-strategy)
6. [Timeline Estimates](#6-timeline-estimates)
7. [Risk Assessment](#7-risk-assessment)

---

## 1. Project Setup Checklist

### Toolchain & Dependencies

- [ ] Initialize project with Vite + React 18
  ```bash
  npm create vite@latest . -- --template react
  ```
- [ ] Install core dependencies
  ```bash
  npm install react@18 react-dom@18
  ```
- [ ] Install Tailwind CSS v3
  ```bash
  npm install -D tailwindcss@3 postcss autoprefixer
  npx tailwindcss init -p
  ```
- [ ] Install UI dependencies
  ```bash
  npm install lucide-react
  ```
- [ ] Install dev/test dependencies
  ```bash
  npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
  ```

### Configuration Files

- [ ] `tailwind.config.js` — Configure content paths, extend theme if needed
- [ ] `postcss.config.js` — PostCSS with Tailwind and Autoprefixer
- [ ] `vite.config.js` — Dev server on port 3000, test config
- [ ] `index.html` — Set page title to "Environment Status Dashboard"
- [ ] Add Tailwind directives to `src/index.css`:
  ```css
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
  ```

### Project Standards

- [ ] ESLint configured (comes with Vite template)
- [ ] File naming: PascalCase for components, camelCase for utilities
- [ ] JSX extension for all React component files
- [ ] No TypeScript for v1 (keep setup lightweight, types documented in DATA_MODEL.md)

---

## 2. File Structure

```
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── product-docs/
│   ├── PRD.md
│   ├── TECHNICAL_SPEC.md
│   ├── DATA_MODEL.md
│   └── README.md
├── planning/
│   └── IMPLEMENTATION_PLAN.md
├── src/
│   ├── main.jsx                    # Entry point, renders <App />
│   ├── index.css                   # Tailwind directives
│   ├── App.jsx                     # Root component, state management
│   ├── components/
│   │   ├── Header.jsx              # Title bar + last updated + refresh
│   │   ├── StatusGrid.jsx          # Grid container, column headers
│   │   ├── ServiceRow.jsx          # Row per service, drift calculation
│   │   ├── StatusCell.jsx          # Individual environment cell
│   │   ├── HealthIndicator.jsx     # Colored dot + accessible icon
│   │   └── DriftBadge.jsx          # Version drift warning badge
│   ├── data/
│   │   └── mockData.js             # Mock service deployment data
│   └── utils/
│       ├── formatRelativeTime.js   # Date → "2 hours ago"
│       ├── calculateDrift.js       # Version comparison + drift detection
│       └── healthColors.js         # Status → Tailwind class mapping
└── tests/
    ├── utils/
    │   ├── formatRelativeTime.test.js
    │   └── calculateDrift.test.js
    └── components/
        ├── HealthIndicator.test.jsx
        ├── DriftBadge.test.jsx
        └── StatusCell.test.jsx
```

---

## 3. Development Phases

### Phase 1: Project Scaffolding
**Goal:** Working dev server with Tailwind, empty shell renders

| Task | Details |
|------|---------|
| Init Vite + React | `npm create vite@latest` with React template |
| Install dependencies | Tailwind CSS, lucide-react, testing libs |
| Configure Tailwind | Content paths, base styles |
| Configure Vite | Dev server port 3000 |
| Create directory structure | `components/`, `data/`, `utils/`, `tests/` |
| Verify dev server runs | Confirm hot-reload works on localhost:3000 |

**Milestone:** Dev server running, Tailwind classes rendering correctly.

---

### Phase 2: Data Layer & Utilities
**Goal:** Mock data and all utility functions implemented and tested

| Task | Details |
|------|---------|
| Create `mockData.js` | 6 services × 3 environments, per DATA_MODEL.md |
| Implement `formatRelativeTime.js` | Handle: just now, minutes, hours, days |
| Implement `calculateDrift.js` | Parse semver, compute minor version diff, drift thresholds |
| Implement `healthColors.js` | Map health status → Tailwind bg/border/text classes |
| Write unit tests | Full coverage on formatRelativeTime and calculateDrift |

**Milestone:** All utility functions pass tests. Mock data loads without errors.

---

### Phase 3: Core Components (Bottom-Up)
**Goal:** All components built and rendering with mock data

Build order (leaf components first, then compose upward):

| Order | Component | Dependencies |
|-------|-----------|-------------|
| 3a | `HealthIndicator` | healthColors.js, lucide-react icons |
| 3b | `DriftBadge` | None (pure presentational) |
| 3c | `StatusCell` | HealthIndicator, DriftBadge, formatRelativeTime |
| 3d | `ServiceRow` | StatusCell, calculateDrift |
| 3e | `StatusGrid` | ServiceRow |
| 3f | `Header` | formatRelativeTime |
| 3g | `App` | Header, StatusGrid, mockData |

**Milestone:** Full dashboard renders with all 6 services across 3 environments.

---

### Phase 4: Styling & Polish
**Goal:** Production-quality visual design matching PRD specifications

| Task | Details |
|------|---------|
| Grid layout | Responsive table/grid, sticky header row |
| Cell styling | Background tints per health status, hover states |
| Color palette | Green/Yellow/Red per TECHNICAL_SPEC color table |
| Typography hierarchy | Version (prominent) → timestamp → deployer (subtle) |
| Alternating rows | Zebra striping for scannability |
| Drift badge styling | Orange warning badges, visually distinct |
| Accessibility pass | Icon overlays on color indicators, contrast ratios |
| Min-width enforcement | 1280px minimum, graceful at wider sizes |

**Milestone:** Dashboard visually matches PRD mockup, passes accessibility checks.

---

### Phase 5: Interactivity & Final Features
**Goal:** Interactive features, edge cases handled

| Task | Details |
|------|---------|
| Refresh button | Reload mock data, update lastUpdated timestamp |
| Filter by health status (nice-to-have) | Dropdown or toggle buttons |
| Filter by name search (nice-to-have) | Text input with debounced filtering |
| React.memo optimization | Wrap StatusCell to prevent unnecessary re-renders |
| Edge case handling | Beta versions, SHA versions in drift calc |
| Empty/loading states | Skeleton or spinner while data loads |

**Milestone:** All FR requirements met. Dashboard is interactive and performant.

---

### Phase 6: Testing & Verification
**Goal:** Comprehensive test coverage, accessibility verified

| Task | Details |
|------|---------|
| Unit tests | Utility functions fully tested |
| Component tests | HealthIndicator, DriftBadge, StatusCell |
| Integration test | Full dashboard renders correctly with mock data |
| Accessibility audit | Screen reader testing, keyboard nav, contrast |
| Cross-browser check | Chrome, Firefox (minimum) |
| Performance check | Initial load < 2 seconds |

**Milestone:** All tests passing. Dashboard meets NFR requirements.

---

## 4. Component Implementation Order

Bottom-up build approach ensures each component can be tested in isolation before composition:

```
Level 0 (Utilities - build first):
  formatRelativeTime.js → calculateDrift.js → healthColors.js

Level 1 (Leaf Components):
  HealthIndicator.jsx → DriftBadge.jsx

Level 2 (Composite Components):
  StatusCell.jsx (uses HealthIndicator + DriftBadge)

Level 3 (Row/Grid):
  ServiceRow.jsx (uses StatusCell + calculateDrift)
  StatusGrid.jsx (uses ServiceRow)

Level 4 (Page-Level):
  Header.jsx (uses formatRelativeTime)
  App.jsx (uses Header + StatusGrid + mockData)
```

### Rationale

- **Leaf-first** allows unit testing each piece before integration
- **Utilities before components** ensures data formatting is correct before rendering
- **StatusCell is the most complex leaf** — gets built after its sub-components
- **App is last** — simply wires everything together

---

## 5. Testing Strategy

### Unit Tests (Phase 2)

| Module | Test Cases |
|--------|-----------|
| `formatRelativeTime` | "Just now" (< 60s), "X minutes ago" (1-59 min), "X hours ago" (1-23 hrs), "X days ago" (1+ days), boundary values |
| `calculateDrift` | Same version (0 drift), minor version diff, major version diff, non-semver returns null, beta version handling |
| `healthColors` | Returns correct classes for healthy/degraded/down |

### Component Tests (Phase 3-4)

| Component | Test Cases |
|-----------|-----------|
| `HealthIndicator` | Renders green dot + checkmark for healthy, yellow + warning for degraded, red + X for down |
| `DriftBadge` | Renders warning text with version count, not rendered when no drift |
| `StatusCell` | Displays version, timestamp, deployer; shows drift badge when hasDrift=true; correct health styling |
| `ServiceRow` | Renders 3 StatusCells, correctly passes drift calculation results |
| `StatusGrid` | Renders all 6 service rows, has sticky header, column labels correct |

### Integration Tests (Phase 6)

| Test | Validation |
|------|-----------|
| Full render | App renders with mock data, no console errors |
| Data scenarios | Payment Service shows red/down, Auth Service shows yellow/degraded |
| Drift detection | Payment Service production shows drift warning |
| Refresh | Click refresh updates lastUpdated timestamp |

### Accessibility Tests

| Check | Standard |
|-------|----------|
| Color + icon | Every color indicator has an accompanying icon (WCAG) |
| Contrast ratio | All text meets 4.5:1 minimum (WCAG AA) |
| Focus states | All interactive elements have visible focus rings |
| Screen reader | Health status communicated via aria-labels |

### Test Tooling

- **Vitest** — Test runner (fast, Vite-native)
- **@testing-library/react** — Component rendering and queries
- **@testing-library/jest-dom** — DOM assertion matchers

---

## 6. Timeline Estimates

| Phase | Estimated Effort | Cumulative |
|-------|-----------------|------------|
| Phase 1: Project Scaffolding | ~15 minutes | 15 min |
| Phase 2: Data Layer & Utilities | ~30 minutes | 45 min |
| Phase 3: Core Components | ~45 minutes | 1.5 hrs |
| Phase 4: Styling & Polish | ~30 minutes | 2 hrs |
| Phase 5: Interactivity & Features | ~20 minutes | 2.3 hrs |
| Phase 6: Testing & Verification | ~30 minutes | ~3 hrs |

**Total estimated effort: ~3 hours**

### Dependencies Between Phases

```
Phase 1 (Scaffolding)
  └─→ Phase 2 (Data & Utils)
       └─→ Phase 3 (Components)
            └─→ Phase 4 (Styling)
                 └─→ Phase 5 (Interactivity)
                      └─→ Phase 6 (Testing)
```

Each phase is strictly sequential — later phases depend on earlier ones being complete.

---

## 7. Risk Assessment

### Risk 1: Tailwind CSS Build Issues
- **Likelihood:** Low
- **Impact:** Blocks all styling work
- **Mitigation:** Use standard Vite + Tailwind setup. Verify Tailwind renders in Phase 1 before proceeding.

### Risk 2: Version Drift Logic Edge Cases
- **Likelihood:** Medium
- **Impact:** Incorrect drift warnings displayed
- **Mitigation:** Handle non-semver gracefully (return null, skip drift). Comprehensive unit tests for edge cases: beta versions, commit SHAs, major version jumps.

### Risk 3: Accessibility Compliance Gaps
- **Likelihood:** Medium
- **Impact:** Fails NFR-2 requirements
- **Mitigation:** Build accessibility into components from the start (Phase 3), not as an afterthought. Use lucide-react icons alongside every color indicator. Test with browser accessibility tools.

### Risk 4: Performance with React Re-renders
- **Likelihood:** Low
- **Impact:** Dashboard feels sluggish
- **Mitigation:** Apply React.memo to StatusCell in Phase 5. With only 6 services × 3 environments = 18 cells, this is unlikely to be an issue.

### Risk 5: Scope Creep on "Nice to Have" Features
- **Likelihood:** Medium
- **Impact:** Delays delivery
- **Mitigation:** FR-6 (filtering) is explicitly marked "nice to have" in the PRD. Implement core grid (FR-1 through FR-5) first. Only add filtering if time permits after Phase 4.

### Risk 6: Mock Data Doesn't Demonstrate All Scenarios
- **Likelihood:** Low
- **Impact:** Demo misses key features
- **Mitigation:** Mock data is pre-designed in DATA_MODEL.md to cover: healthy, degraded, down, drift, beta versions, and recent/old deployments. Verify each scenario renders correctly.

---

## Appendix: Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | React 18 + Vite | Per tech spec. Fast dev server, lightweight |
| Styling | Tailwind CSS (utility-only) | Per tech spec. No custom CSS files |
| Language | JavaScript (JSX) | Keep v1 simple. Types documented in DATA_MODEL.md |
| Icons | lucide-react | Per README tech stack. Clean, accessible icons |
| Testing | Vitest + Testing Library | Vite-native, fast, React-idiomatic |
| State management | React useState | Simple app, no external state library needed |
| Filtering | Deferred (nice-to-have) | Focus on core grid requirements first |

---

## Appendix: Reference Documents

- **PRD:** `product-docs/PRD.md` — Full product requirements
- **Technical Spec:** `product-docs/TECHNICAL_SPEC.md` — Component architecture
- **Data Model:** `product-docs/DATA_MODEL.md` — Data types and mock data
