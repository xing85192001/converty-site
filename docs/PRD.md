# Product Requirements Document — Converty

**Version:** 7.1
**Last Updated:** 2026-04-04
**Status:** Living document — updated at each milestone

---

## 1. Executive Summary

Converty is a free, privacy-first calculator platform delivering **190+ specialized calculators** across science, engineering, finance, health, media production, and everyday use. It runs entirely in the browser — no accounts, no servers, no tracking. Every calculation is shareable via URL.

**Target audience:** Swiss and European users, professionals (engineers, IT infrastructure teams, chemists, finance analysts), and anyone who needs reliable, metric-first calculations.

**Deployment:** Static site on GitHub Pages, installable as a Progressive Web App.

---

## 2. Problem Statement

### 2.1 The Problem

General-purpose calculators (phone, OS, spreadsheets) lack domain-specific knowledge: they don't know beam end conditions, subnet masks, IUPAC atomic weights, or VMware licensing rules. Professionals either:

- Build one-off spreadsheets (not shareable, not maintained)
- Use vendor-specific tools (require accounts, may be paywalled)
- Google each formula and compute manually (error-prone)

### 2.2 What We Solve

Converty embeds domain expertise into focused calculators. Each tool knows the formulas, the valid input ranges, the industry standards, and the units for its domain. Results are instantly shareable via URL so teams can collaborate without copy-pasting values.

### 2.3 What We Don't Solve

- Converty does **not** replace specialized professional software (CAD tools, ERP systems, scientific simulation)
- Converty does **not** provide real-time data (stock prices, live exchange rates) — data is fetched at build time
- Converty does **not** store user data — there are no accounts, history, or cloud sync

---

## 3. Users

### 3.1 Primary Personas

**IT Infrastructure Engineer**
- Needs: Subnet calculations, VM sizing, hypervisor comparison, server refresh planning
- Context: Corporate datacenter, Swiss/EU enterprise
- Pain: Most VM sizing tools are vendor-specific and require login
- Key calculators: Subnet, VM Storage, Kubernetes Capacity, Hypervisor Compare, CPU Comparison

**Structural/Mechanical Engineer**
- Needs: Beam deflection, stress-strain analysis, column buckling, pipe flow
- Context: Small engineering office, no enterprise software license
- Pain: Full FEA tools are expensive; simple beam checks don't need FEA
- Key calculators: Beam Deflection, Moment of Inertia, Column Buckling, Pipe Flow

**Chemistry / Lab Technician**
- Needs: Molarity prep, dilution, stoichiometry, molecular weight
- Context: University lab or industrial QA
- Pain: Chemical calculators exist but are fragmented across dozens of sites
- Key calculators: Molecular Weight, Molarity, Dilution, Stoichiometry, pH

**Finance Analyst**
- Needs: Mortgage, ROI, amortization, crypto conversion, compound interest
- Context: Personal finance, real estate investment
- Pain: Bank calculators don't expose formulas or allow URL sharing
- Key calculators: Mortgage, Amortization, Compound Interest, Crypto Exchange Rate

**Media Producer / Photographer**
- Needs: Focal length, depth of field, exposure, color conversion, video bitrate
- Context: Freelance or studio
- Pain: Each platform has its own tools; no single place for photo + video + color
- Key calculators: Depth of Field, Exposure Triangle, Color Temperature, Video Bitrate

**SAN / Storage Network Engineer**
- Needs: Fibre Channel BB credit calculation for ISL links, ready-to-paste CLI commands
- Context: Enterprise data center, Brocade FOS and/or Cisco MDS fabric
- Pain: BB credit formula requires cable distance + FC speed; commands differ per vendor
- Key calculators: BB Credit Calculator (Brocade FOS / Cisco MDS command generation)

**Everyday User**
- Needs: BMI, calorie intake, unit conversion, age, date difference, recipe scaling
- Context: Home, mobile
- Pain: Phone calculator is not domain-aware
- Key calculators: BMI, Calorie Deficit, Age, Date Difference, Recipe Scaler

### 3.2 Non-Users (Out of Scope)

- US-only users expecting imperial-first defaults — Converty is metric-first
- Users requiring regulatory-approved calculations — Converty is informational only

---

## 4. Product Goals

### 4.1 Business Goals

| Goal | Metric | Current |
|------|--------|---------|
| Be the go-to calculator platform for Swiss/EU professionals | Returning visitors, word-of-mouth | Baseline |
| Cover all major calculation domains with at least 1 tool | Category coverage | 15 categories, 190+ calculators |
| Zero operational cost | Monthly infrastructure spend | $0 (GitHub Pages) |
| Offline-capable PWA | Lighthouse PWA score | ✅ Installable |

### 4.2 User Goals

| User Goal | How Converty Delivers |
|-----------|----------------------|
| Get the right answer quickly | Pre-filled examples, instant recalculation, validated inputs |
| Share a calculation with a colleague | URL encodes all inputs; shareable by copying browser address |
| Use on mobile without installing | Responsive design; PWA installable as home screen app |
| Use without internet | Service worker caches all calculator pages offline |
| Trust the results | Source citations (IUPAC, ASTM, AISC, NIST, Darcy-Weisbach) in UI |

### 4.3 Non-Goals

- User accounts or saved calculation history
- Real-time collaborative editing
- Native iOS/Android apps
- Server-side computation
- Analytics or telemetry

---

## 5. Feature Requirements

### 5.1 Core Platform

| ID | Requirement | Status |
|----|-------------|--------|
| CORE-01 | All calculators accessible without login | ✅ Shipped |
| CORE-02 | All calculator inputs persisted in URL (shareable links) | ✅ Shipped v1.0 |
| CORE-03 | Offline functionality via PWA service worker | ✅ Shipped v1.0 |
| CORE-04 | Installable as PWA on iOS, Android, and desktop | ✅ Shipped v1.0 |
| CORE-05 | Global search across all calculators (Cmd+K / Ctrl+K) | ✅ Shipped v2.0 |
| CORE-06 | Results exportable as PDF | ✅ Shipped v3.0 |
| CORE-07 | Results exportable as CSV | ✅ Shipped v3.0 |
| CORE-08 | 4 language support (en, fr, de, it) | ✅ Shipped v1.0 |
| CORE-09 | Dark mode support | ✅ Shipped |
| CORE-10 | Responsive layout for mobile, tablet, desktop | ✅ Shipped |

### 5.2 Calculator Categories

#### Math (38 calculators)

Percentage, fractions, ratios, statistics, algebra, geometry, trigonometry, number base conversions, prime factorization, matrix operations, calculus helpers, and more.

#### Health (28 calculators)

BMI, body fat, calorie deficit/surplus, macro calculator, TDEE, ideal weight, hydration, blood alcohol content, heart rate zones, pregnancy calculator, and more.

#### Finance (28 calculators)

Mortgage, compound interest, loan amortization, ROI, break-even, present/future value, rental yield, currency conversion, cryptocurrency exchange rates, mining profitability, and more.

#### Photo (22 calculators)

Depth of field, hyperfocal distance, exposure triangle, crop factor, focal length equivalence, print resolution, color temperature, ND filter stops, flash exposure, and more.

#### Web (10 calculators)

Color hex/RGB/HSL conversion, CSS unit converter, screen resolution, aspect ratio, pixel density, image size optimizer, web performance estimator.

#### Video (9 calculators)

Video bitrate, storage estimator, frame rate converter, render time estimator, codec comparison, streaming bandwidth.

#### DateTime (8 calculators)

Age, date difference, timezone converter, workdays counter, Unix timestamp, countdown timer, calendar week.

#### Network (6 calculators)

Subnet calculator (IPv4/IPv6), IP address analyzer, CIDR range calculator, network speed/latency, **BB Credit Calculator** (Fibre Channel ISL buffer credits with Brocade FOS and Cisco MDS CLI command generation).

#### Crypto (4 calculators)

Hash generator (MD5, SHA-1/256/512), wallet address converter, cryptocurrency exchange rate, mining profitability.

#### Cooking (4 calculators)

Recipe scaler, nutrition facts, unit converter (metric-first), food cost per serving.

#### Automotive (4 calculators)

Fuel efficiency (L/100km), tire sizing, maintenance intervals, vehicle loan/lease.

#### Data (3 calculators)

Data storage units, data transfer time, file size estimator.

#### Engineering (6 calculators) — *Added v5.0*

Beam deflection, moment of inertia, stress-strain, column buckling, pipe flow, engineering unit converter (NIST precision).

#### Chemistry (6 calculators) — *Added v5.0*

Molecular weight, molarity, dilution, stoichiometry, pH/buffer, periodic table.

#### Infrastructure / Virtualization (13 calculators) — *Added v2.0-v5.0*

VM storage, server virtualization, Kubernetes capacity, vSphere ESX sizing, VMware licensing, TCO, Hyper-V consolidation, Windows Server licensing, hypervisor comparison.

### 5.3 Shipped: v7.0 Framework & Quality Migration

| ID | Requirement | Status |
|----|-------------|--------|
| FQ-01 | Vitest test foundation — 5 priority converters with ≥75% coverage | ✅ Shipped Phase 40 |
| FQ-02 | Full test coverage — all 19 converter categories, CI gate in static.yml | ✅ Shipped Phase 41 |
| FQ-03 | Error boundaries via react-error-boundary wrapping all 169 calculators | ✅ Shipped Phase 42 |
| FQ-04 | Sonner toast notifications for copy/export/clipboard operations | ✅ Shipped Phase 42 |
| FQ-05 | isomorphic-dompurify sanitize utility for safe HTML rendering | ✅ Shipped Phase 42 |
| FQ-06 | Zod v4 input validation — 100+ schemas across 15 category schema files | ✅ Shipped Phase 43 |
| FQ-07 | `schema?` param in `createCalculatorStore` for opt-in Zod validation | ✅ Shipped Phase 43 |
| FQ-08 | Zod URL param helpers for type-safe URL state parsing | ✅ Shipped Phase 43 |
| FQ-09 | Field-level validation errors wired into 71 store-based calculator components | ✅ Shipped Phase 43 |
| FQ-10 | LZ-String URL compression, CalculationResult<T>, i18n restructure, ADRs 011–015 | ✅ Shipped Phases 44–48 |

**Test coverage achieved (Phase 41):** 2288+ tests, 197 test files, 19 categories, ≥75% line/branch/function/statement coverage.

### 5.4 Shipped: v6.0 CPU Performance & Server Refresh

| ID | Requirement | Status |
|----|-------------|--------|
| CPUDB-01 | Intel Xeon Scalable CPUs with SPECint2017 scores | ✅ Shipped Phase 37 |
| CPUDB-02 | AMD EPYC CPUs with SPECint2017 scores | ✅ Shipped Phase 37 |
| CPUDB-03 | Previous-gen CPUs for server refresh baseline | ✅ Shipped Phase 37 |
| CPUDB-04 | ARM/Ampere CPUs with SPECint scores | ✅ Shipped Phase 37 |
| CPUCMP-01 | Side-by-side comparison of 2–4 CPUs | ✅ Shipped Phase 38 |
| CPUCMP-02 | Raw SPECint2017 base and peak scores | ✅ Shipped Phase 38 |
| CPUCMP-03 | Performance-per-core metric | ✅ Shipped Phase 38 |
| CPUCMP-04 | Performance-per-watt and absolute TDP | ✅ Shipped Phase 38 |
| CPUCMP-05 | Relative sizing ratio between any two CPUs | ✅ Shipped Phase 38 |
| CPUCMP-06 | Filter CPU list by vendor and generation | ✅ Shipped Phase 38 |
| REFRESH-01 | Specify old server fleet (CPU, sockets, count) | ✅ Shipped Phase 39 |
| REFRESH-02 | Select target new CPU | ✅ Shipped Phase 39 |
| REFRESH-03 | Calculate new server count to match performance | ✅ Shipped Phase 39 |
| REFRESH-04 | Apply headroom buffer (%) for growth | ✅ Shipped Phase 39 |
| REFRESH-05 | Socket/chassis constraints (1U/2U, single/dual socket) | ✅ Shipped Phase 39 |
| REFRESH-06 | Power budget (W/rack) constraint | ✅ Shipped Phase 39 |
| REFRESH-07 | Fleet summary: old vs new (count, cores, TDP delta) | ✅ Shipped Phase 39 |

---

## 6. Non-Functional Requirements

### 6.1 Performance

| Requirement | Target | Notes |
|-------------|--------|-------|
| First Contentful Paint | < 2s on 4G | Lazy-loaded calculator bundles |
| Calculation response time | < 100ms | All calculations synchronous client-side |
| Search results | < 50ms | Pre-built Fuse.js index per locale |
| Bundle size per calculator | < 15 KB added | Code-split by category |
| Total JS bundle (initial) | < 200 KB gzipped | Deferred loading for all calculators |

### 6.2 Accessibility

| Requirement | Target |
|-------------|--------|
| Keyboard navigation | All inputs and buttons navigable via keyboard |
| Screen reader support | Semantic HTML, ARIA labels on inputs |
| Color contrast | WCAG AA for text (4.5:1 ratio) |
| Focus indicators | Visible focus ring on all interactive elements |

### 6.3 Internationalization

| Requirement | Status |
|-------------|--------|
| 100% translation coverage across en/fr/de/it | ✅ v2.0 |
| Zero hardcoded English strings in components | ✅ v2.0 |
| Locale-prefixed URLs for SEO | ✅ v1.0 |
| Number formatting per locale | ✅ v1.0 |

### 6.4 Security

| Requirement | Status |
|-------------|--------|
| Zero CodeQL vulnerabilities | ✅ v4.0 |
| URL parameter injection prevention (Map-based parsing) | ✅ v4.0 |
| No `eval()` or dynamic code execution | ✅ Enforced by Biome |
| Zero npm audit vulnerabilities (all deps) | ✅ v7.1 — 9 CVEs patched via `npm audit fix` + npm overrides |
| npm override strategy for transitive dep CVEs | ✅ v7.1 — `serialize-javascript`, `@rollup/plugin-terser`, `minimatch`, `rollup@2` pinned |
| CSP headers | Handled by GitHub Pages |

### 6.5 Quality

| Requirement | Target |
|-------------|--------|
| TypeScript strict mode, zero `any` | ✅ Enforced |
| Zero Biome lint errors | ✅ CI enforced |
| Pre-commit hook runs in < 5s | ✅ Biome Rust speed |
| All reference data sourced from standards | ✅ IUPAC, ASTM, AISC, NIST |
| Vitest test suite — ≥75% line coverage | ✅ Shipped v7.0 (86% achieved) |
| CI gate prevents test regressions | ✅ Shipped v7.0 (static.yml) |
| Runtime input validation via Zod v4 | ✅ Shipped v7.0 (100+ schemas) |
| Error boundaries on all calculators | ✅ Shipped v7.0 (react-error-boundary) |

---

## 7. Architecture Constraints

These constraints are permanent and derive from the GitHub Pages deployment model:

1. **Static export only** — No SSR, API routes, server actions, or middleware
2. **Client-side calculations** — All math runs in the browser
3. **Build-time data** — External data (crypto prices, CPU benchmarks) fetched during build
4. **No user accounts** — No authentication, no server-side sessions
5. **URL state** — All sharable state must live in URL search parameters

See `docs/adr/` for the full ADR rationale behind each constraint.

---

## 8. Out of Scope (Permanent)

| Feature | Reason |
|---------|--------|
| User authentication / accounts | Requires server; static export constraint |
| Saved calculation history | Requires server or account; localStorage not shareable |
| Real-time collaborative editing | Requires WebSocket server |
| Native iOS/Android apps | Web app sufficient for target use cases |
| Server-side rendering | GitHub Pages static-only |
| Real-time market data | Build-time data sufficient for calculator purposes |
| US salary calculator | US-centric, incompatible with Swiss/EU metric-first policy |
| Regulatory-approved outputs | Informational tool only, not a certified engineering instrument |

---

## 9. Milestone History

| Version | Shipped | Highlights |
|---------|---------|-----------|
| v1.0 | 2026-01-18 | Zustand migration (200+ calculators), PWA, TypeScript strict, ADRs |
| v2.0 | 2026-01-22 | Network calculators, global search (Cmd+K), 100% i18n |
| v3.0 | 2026-01-23 | Crypto, real estate, cooking, automotive, PDF/CSV export, performance |
| v4.0 | 2026-01-25 | Infrastructure calculators (VM, K8s, TCO), security hardening |
| v5.0 | 2026-01-29 | Engineering (6), Chemistry (6), Hyper-V/multi-platform (6) |
| v6.0 | 2026-01-28 | CPU benchmark comparison (SPECint2017), server refresh sizing (Phases 37–39) |
| v7.0 | 2026-02-26 | Vitest 2288 tests (197 files), error boundaries, Sonner toasts, Zod v4 validation, LZ-String URL compression, discriminated unions, i18n restructure, ADRs 011–015 (Phases 40–48) |
| v7.1 | In progress | Security hardening — 9 npm vulnerabilities patched, npm override strategy for transitive deps |

---

## 10. Glossary

| Term | Definition |
|------|-----------|
| Calculator | A domain-specific tool with inputs, calculation logic, and displayed results |
| Converter | The pure TypeScript function implementing a calculator's math (no React) |
| Store | A Zustand state container created by `createCalculatorStore()` |
| ADR | Architecture Decision Record — documents why a technical decision was made |
| Locale | One of four supported languages: `en`, `fr`, `de`, `it` |
| Static export | Next.js `output: "export"` mode generating plain HTML/CSS/JS files |
| SPECint2017 | Industry-standard CPU integer performance benchmark |
| IUPAC | International Union of Pure and Applied Chemistry — source for atomic weights |
| AISC | American Institute of Steel Construction — source for beam sections |
| NIST | National Institute of Standards and Technology — source for unit conversion precision |

---

*This document is maintained in the repository at `docs/PRD.md`.
For implementation details see `docs/CALCULATOR_GUIDE.md`.
For architectural decision rationale see `docs/adr/`.*
