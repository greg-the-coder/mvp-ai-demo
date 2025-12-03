# Environment Status Dashboard

A real-time dashboard for visualizing deployment status across multiple services and environments.

## Purpose

This project demonstrates building a functional internal tool from a PRD using AI-assisted development. The application solves a common pain point: teams constantly asking "what version is deployed where?"

## Documentation

- [Product Requirements Document](docs/PRD.md) - Full product specification
- [Technical Specification](docs/TECHNICAL_SPEC.md) - Architecture and component design
- [Data Model](docs/DATA_MODEL.md) - Mock data structure and schema

## The Problem

Every engineering team encounters these questions daily:

- "What version is in staging?"
- "When was prod last deployed?"
- "Is the API service healthy?"
- "Why is staging 5 versions behind dev?"

Teams typically solve this with Slack bots, stale wiki pages, or just asking around. This dashboard provides a single, scannable view of the entire deployment landscape.

## Features

- Multi-environment grid view (Dev → Staging → Prod)
- Service health status with color coding
- Version drift detection and warnings
- Relative deployment timestamps
- Last deployer attribution

## Tech Stack

- React 18
- Tailwind CSS
- Recharts (for any visualizations)
- Lucide React (icons)

## Getting Started

```bash
npm install
npm run dev
```

## Demo Context

This application was built as a demonstration of AI-assisted development, going from PRD to working application using Claude within a Coder workspace.
