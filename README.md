# Environment Status Dashboard

A web-based dashboard that displays deployment status for all services across Development, Staging, and Production environments in a single, scannable view.

## Features

- **Multi-environment grid view** — see all services across Dev, Staging, and Prod at a glance
- **Health status indicators** — color-coded with accessible icons (Healthy, Degraded, Down)
- **Version drift detection** — automatic warnings when environments fall behind
- **Relative timestamps** — human-readable "2 hours ago" format
- **Last deployer attribution** — see who deployed each version

## Tech Stack

- React 18 + Vite
- Tailwind CSS (utility-first, no custom CSS)
- Lucide React (icons)

## Getting Started

```bash
npm install
npm run dev
```

The dashboard runs at [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── App.jsx                 # Root component
├── components/
│   ├── Header.jsx          # Title, last-updated, refresh button
│   ├── StatusGrid.jsx      # Grid table with column headers
│   ├── ServiceRow.jsx      # Row per service with drift calculation
│   ├── StatusCell.jsx      # Cell with health, version, timestamp, deployer
│   ├── HealthIndicator.jsx # Colored dot + accessible icon
│   └── DriftBadge.jsx      # Version drift warning badge
├── data/
│   └── mockData.js         # Mock service deployment data
└── utils/
    ├── formatRelativeTime.js  # Relative timestamp formatting
    ├── calculateDrift.js      # Version drift detection logic
    └── healthColors.js        # Health status → Tailwind class mapping
```
