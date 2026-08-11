# Project Milestones: Converty

## v5.0 Calculator Expansion (Shipped: 2026-01-29)

**Delivered:** 18 new/extended calculators across 3 professional domains: Engineering, Chemistry, and Multi-Platform Virtualization.

**Phases completed:** 31-36 (6 phases)

**Key accomplishments:**

- Added Engineering category with 6 calculators (beam deflection, moment of inertia, stress-strain, column buckling, pipe flow, unit converter), 31 ASTM materials database, 50 AISC beam sections, SVG visualizations
- Added Chemistry category with 6 calculators (molecular weight, molarity, dilution, stoichiometry, pH, periodic table), custom recursive descent formula parser (zero npm dependencies), IUPAC 2024 atomic weights (118 elements)
- Extended 3 existing infrastructure calculators with 4-platform support (VMware, Hyper-V, Proxmox, XCP-ng), backward compatible
- Added Hyper-V consolidation calculator with HA modes and Windows Server licensing (Datacenter vs Standard break-even at ~13 VMs/host)
- Built hypervisor comparison TCO tool with 5-year cost analysis, feature matrix, and recommendation engine
- Completed production readiness: full i18n (4 locales, 476+ keys), zero build warnings, 6 documentation files, CHANGELOG v5.0.0

**Stats:**

- 126 files created/modified
- 33,317 lines added, 19,485 lines removed
- 6 commits across 2 days
- 6 phases, 18/18 requirements satisfied (100%)

**Git range:** `feat(31)` → `chore(v5.0-production-readiness)`

**What's next:** v6.0 planning — user experience enhancements, additional domains, advanced features

---

## v4.0 Security & Infrastructure (Shipped: 2026-01-25)

**Delivered:** Enterprise-grade security hardening and 5 new infrastructure calculators for DevOps/IT professionals.

**Phases completed:** 25-30 (6 phases, 17 plans total)

**Key accomplishments:**

- Eliminated all CodeQL security vulnerabilities (3 High, 1 Warning, 12 Note) with Map-based URL parameter storage
- Added 5 infrastructure calculators: VM Storage (vSphere capacity), Kubernetes Capacity (multi-dimensional bin packing), Server Virtualization (ESX host sizing), VMware Licensing (VCF/VVF cost calculator), Virtualization Cost (TCO analysis)
- Created "Infrastructure" category with 3 subcategories (VMware, Kubernetes, Cost)
- Implemented PDF/CSV export for all infrastructure calculators with formatted currency/percentages
- Documented container security false positives with 6-month review cycle
- Removed all unused imports and enforced pre-commit hooks for code quality

**Stats:**

- 106 files created/modified
- 15,840 lines added, 224 lines removed
- 58 commits in 1 day (13 hours)
- 6 phases, 17 plans, 85+ tasks
- 11/11 requirements satisfied (100%)

**Git range:** `fix(25-01)` → `feat(28-03)`

**What's next:** v5.0 planning — enhanced user experience features (favorites, calculation history, comparison tools)

---

## v3.0 Calculator Expansion & Performance (Shipped: 2026-01-25)

**Delivered:** 16 new calculators across 4 categories, code splitting for performance, and PDF/CSV export functionality with internationalization.

**Phases completed:** 17-21, 24 (6 phases, 23 plans total)

**Key accomplishments:**

- Added 16 new calculators: Crypto/Blockchain (hash, wallet, exchange, mining), Real Estate (mortgage, valuation, rent-to-value, amortization), Cooking/Nutrition (recipe scaler, nutrition, unit converter, food cost), Automotive (fuel efficiency, tire sizing, maintenance, financing)
- Implemented category-based code splitting with dynamic imports (210 chunks, improved First Contentful Paint)
- Added PDF and CSV export functionality with zero dependencies (native Blob API)
- Established Serena/grepai direct tools as standard execution mode (3x faster than subagents, lower context burn)
- Created user-level GSD preferences system for workflow consistency
- Implemented CSV security features (injection prevention, UTF-8 BOM for Excel compatibility)

**Stats:**

- 337 files created/modified
- 79,192 lines added, 510 lines removed
- 90+ commits across 2 days
- 6 phases, 23 plans, 120+ tasks
- 24/24 requirements satisfied (100%)

**Git range:** `feat(17-01)` → `feat(24-03)`

**What's next:** v4.0 planning — user experience enhancements (favorites, calculation history), additional calculator categories

---

## v2.0 Network Tools & User Experience (Shipped: 2026-01-22)

**Delivered:** Comprehensive network calculator suite with global search and complete translation coverage across all 4 locales.

**Phases completed:** 9-16 (8 phases, 22 plans total)

**Key accomplishments:**

- Added 4 new network calculators with visual feedback (subnet calculator with IPv4/IPv6, IP classification, CIDR range checking, network speed/latency)
- Implemented global search (Cmd+K) across 200+ calculators with fuzzy matching and real-time results
- Achieved 100% translation coverage — all 156 registered calculators now fully internationalized for EN/FR/DE/IT
- Eliminated all hardcoded English strings from calculator components (300+ translation keys added)
- Implemented visual network diagram, binary representation, and breakdown tables for subnet calculator
- Added subnetting and supernetting capabilities with algorithm optimization

**Stats:**

- 217 files created/modified
- 29,789 lines added, 1,920 lines removed
- 55 commits across 10 days
- 8 phases, 22 plans, 100+ tasks
- 10 days from start to ship (2026-01-12 → 2026-01-22)

**Git range:** `feat(09-01)` → `feat(16-05-w5)`

**What's next:** v3.0 planning — calculator expansion, advanced UX features, performance optimization

---

## v1.0 Infrastructure Upgrade (Shipped: 2026-01-18)

**Delivered:** Solid, maintainable foundation with zero technical debt in state management and type safety.

**Phases completed:** 1-8 (8 phases, 19 plans total)

**Key accomplishments:**

- Migrated all 200+ calculators from useConverter to Zustand stores with URL sync middleware
- Enabled TypeScript strict mode with zero explicit `any` types
- Added Progressive Web App support (service worker, offline functionality, install prompt)
- Created comprehensive documentation (CHANGELOG, CONTRIBUTING, 4 ADRs)
- Implemented pre-commit hooks (Husky v9 + lint-staged v16)

**Stats:**

- 131 files created/modified
- 23,496 lines added, 874 lines removed
- 103 commits across 2 days
- 8 phases, 19 plans, 80+ tasks
- 32/32 requirements satisfied (100%)

**Git range:** `feat(01-01)` → `feat(08-02)`

---

## v6.0 CPU Performance & Server Refresh (Shipped: 2026-02-23)

**Delivered:** CPU performance benchmarking and server fleet refresh planning tools for datacenter infrastructure decisions.

**Phases completed:** 37-39 (3 phases, 9 plans total)

**Key accomplishments:**

- Curated CPU database with 17 entries: Intel Xeon Scalable, AMD EPYC, ARM/Ampere (current + previous gen) with SPECint2017 scores
- Built CPU Comparison Calculator: side-by-side 2–4 CPU comparison with perf/core, perf/watt, sizing ratio, vendor/generation filters
- Built Server Refresh Calculator: old fleet → new fleet modeling with headroom buffer, chassis constraints, power budget, and delta summary
- SPECint2017 base/peak scores as primary performance metric; staleness banner pattern for build-time reference data

**Stats:** 3 phases, 9 plans, 2 new infrastructure calculators, 169 total registered calculators

---

## v7.0 Framework Migration (Shipped: 2026-02-26)

**Delivered:** Complete framework hardening: Vitest testing (2288+ tests), Zod validation, error boundaries + toasts, LZ-String URL compression, discriminated union result types, and i18n namespace restructure.

**Phases completed:** 40-48 (9 phases, 39 plans total)

**Key accomplishments:**

- Installed Vitest with 2288+ tests across 197 test files, ≥75% coverage enforced in CI — all 169 converter pure functions now tested
- Added react-error-boundary + Sonner toasts: graceful error fallback UI replaces blank screens; copy/export/error feedback via toasts
- Integrated Zod v4: runtime schemas for all 169 calculator inputs, field-level error messages, Zod-based URL parameter parsing
- Deployed LZ-String URL compression: 60-80% URL length reduction via `?z=` search param (GitHub Pages + backward compatible)
- Adopted CalculationResult<T> discriminated union: typed error propagation across all 91 components via adapter pattern
- Restructured i18n namespace to stable 4-key schema (`common`, `nav`, `converter`, `calculator`) across ~210 source files
- Created ADRs 011-015; updated CODE_STYLE.md and ENGINEERING_PATTERNS.md with v7.0 patterns
- Zero TypeScript errors, zero MISSING_MESSAGE warnings, 852 static pages generated clean

**Stats:** 9 phases, 39 plans, 2288+ tests, 197 test files, 5 ADRs created, 8 packages added

---

_Last updated: 2026-02-26 after v7.0 milestone completion_

