# Architecture Decision Records

This directory contains Architecture Decision Records (ADRs) for Converty.

ADRs follow the [MADR](https://adr.github.io/madr/) format:
- **Context** — what problem we were solving
- **Decision Drivers** — what mattered
- **Considered Options** — what we evaluated
- **Decision Outcome** — what we chose and why
- **Consequences** — trade-offs accepted

## Index

| # | Title | Status | Date |
|---|-------|--------|------|
| [0001](0001-zustand-migration.md) | Use Zustand for Calculator State Management | ✅ accepted | 2026-01-17 |
| [0002](0002-pwa-service-worker.md) | Use Workbox for Service Worker (Production-Only) | ✅ accepted | 2026-01-17 |
| [0003](0003-typescript-strict.md) | Enable TypeScript Strict Mode with noExplicitAny | ✅ accepted | 2026-01-17 |
| [0004](0004-jspdf-upgrade.md) | jsPDF Version Status — Verification Not Upgrade | ⚠️ superseded | 2026-01-17 |
| [0005](0005-static-export-github-pages.md) | Deploy as Static Export to GitHub Pages | ✅ accepted | 2026-01-17 |
| [0006](0006-nextjs-app-router-i18n.md) | Use Next.js App Router with next-intl for i18n Routing | ✅ accepted | 2026-01-17 |
| [0007](0007-three-layer-architecture.md) | Three-Layer Architecture: Converter / Component / Page | ✅ accepted | 2026-01-17 |
| [0008](0008-url-state-persistence.md) | URL State Persistence for Shareable Calculator Links | ✅ accepted | 2026-01-17 |
| [0009](0009-biome-linter-formatter.md) | Use Biome as Primary Linter and Formatter | ✅ accepted | 2026-01-17 |
| [0010](0010-metric-first-swiss-context.md) | Metric-First Design with Swiss/European Context | ✅ accepted | 2026-01-17 |

## Status Legend

| Status | Meaning |
|--------|---------|
| ✅ accepted | In effect, governing the codebase |
| ⚠️ superseded | Replaced by a later ADR |
| 🔄 proposed | Under discussion, not yet in effect |
| ❌ deprecated | Was accepted, now reversed |

## How to Add an ADR

1. Copy the next sequential number (e.g., `0011`)
2. Create `{number}-short-title.md` in this directory
3. Use the MADR template (copy from an existing ADR)
4. Add a row to the index table above
5. Link related ADRs in the **Links** section

## Key Architectural Constraints (Summary)

The following constraints are in effect across all ADRs and must not be violated:

1. **Static Export Only** — No SSR, API routes, server actions, or middleware (ADR-0005)
2. **Zustand for all state** — `createCalculatorStore` factory, no raw `useState` for calculator values (ADR-0001)
3. **Three-layer architecture** — converter.ts / calculator.tsx / page.tsx separation (ADR-0007)
4. **URL state sync** — All calculator inputs persisted in URL search params (ADR-0008)
5. **Metric-first defaults** — SI units as primary, imperial as secondary (ADR-0010)
6. **TypeScript strict, zero `any`** — Enforced by Biome at error level (ADR-0003, ADR-0009)
7. **All text via i18n** — No hardcoded strings; all user-facing text in `src/messages/` (ADR-0006)
