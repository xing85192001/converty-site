# Converty

## What This Is

A professional calculator platform with 169 tools across 15 categories — math, finance, health, network, infrastructure, engineering, chemistry, crypto, automotive, cooking, and more. Deployed as a static PWA to GitHub Pages with full internationalization (en, fr, de, it), offline support, and shareable URLs. The infrastructure category includes specialized datacenter tools: virtualization sizing, Kubernetes capacity, hypervisor comparison, CPU performance benchmarking, and server fleet refresh planning.

**Status:** ✅ v7.0 Framework Migration shipped 2026-02-26

## Core Value

A solid, maintainable foundation with zero technical debt in state management and type safety, enabling confident future development.

## Requirements

### Validated

<!-- v1.0 Infrastructure Upgrade (shipped 2026-01-18) -->

**State Management:**

- ✓ All 200+ calculators migrated from useConverter to Zustand stores — v1.0
- ✓ useConverter hook removed entirely from codebase — v1.0
- ✓ Consolidated URL sync middleware (single implementation) — v1.0
- ✓ Per-store debounce timers (fix global timer bug) — v1.0
- ✓ Functional approach - pure functions, no shared mutable state — v1.0

**Type Safety:**

- ✓ Enable noExplicitAny in Biome configuration — v1.0
- ✓ Fix all explicit any types in useConverter hook — v1.0
- ✓ Fix all explicit any types in calculator stores — v1.0
- ✓ Fix all explicit any types in URL state parsing — v1.0
- ✓ Strict TypeScript checks passing with zero any types — v1.0
- ✓ Type-safe URL parameter parsing with validation — v1.0

**Dependencies:**

- ✓ jsPDF verified current (v4.0.0 is latest as of Jan 2025) — v1.0
- ✓ PDF export functionality verified working — v1.0
- ✓ jsPDF usage follows current API best practices — v1.0

**Progressive Web App:**

- ✓ Service worker for offline calculator functionality — v1.0
- ✓ Web manifest for install prompt — v1.0
- ✓ Mobile-optimized responsive design verified — v1.0
- ✓ Offline fallback UI when network unavailable — v1.0

**Documentation:**

- ✓ CHANGELOG.md following Keep a Changelog format — v1.0
- ✓ Backfill recent changes (linting fixes, codebase mapping) — v1.0
- ✓ CONTRIBUTING.md with development workflow — v1.0
- ✓ Development setup guide (prerequisites, commands) — v1.0
- ✓ Architecture Decision Records (ADRs) for key decisions — v1.0
- ✓ Document Zustand store pattern for future calculators — v1.0

**Code Quality:**

- ✓ Zero Biome lint errors — v1.0
- ✓ Zero ESLint errors — v1.0
- ✓ Zero format errors (Biome formatter) — v1.0
- ✓ Zero security warnings (npm audit --production) — v1.0
- ✓ All code follows KISS principle (simple, readable) — v1.0
- ✓ All code follows DRY principle (no duplication) — v1.0
- ✓ Functional programming patterns (pure functions, immutability) — v1.0

**Developer Experience:**

- ✓ Container security false positives suppressed (.trivyignore) — v1.0
- ✓ URL parameter utilities consolidated (getUrlParams extracted) — v1.0
- ✓ Pre-commit hooks (Husky v9 + lint-staged v16) — v1.0

<!-- v2.0 Network Tools & User Experience (shipped 2026-01-22) -->

**Network Calculators:**

- ✓ Visual Subnet Calculator (IPv4/IPv6) with comprehensive visualization — v2.0
- ✓ Network diagram, binary representation, breakdown table — v2.0
- ✓ CIDR notation and subnet mask input support — v2.0
- ✓ Subnetting and supernetting capabilities — v2.0
- ✓ IP Address Calculator (class detection, public/private check) — v2.0
- ✓ CIDR Range Calculator (IP range calculation, IP-in-range check) — v2.0
- ✓ Network Speed/Latency Calculator (ping time conversions, throughput) — v2.0

**Search Functionality:**

- ✓ Global search across all calculators (Cmd+K) — v2.0
- ✓ Fuzzy search with Fuse.js, real-time results — v2.0
- ✓ Pre-built search indexes per locale — v2.0

**Translation Compliance:**

- ✓ All 156 registered calculators fully internationalized — v2.0
- ✓ Zero hardcoded English strings in calculator components — v2.0
- ✓ 100% translation coverage across all 4 locales (en, fr, de, it) — v2.0
- ✓ All calculators verified working in all 4 locales — v2.0

<!-- Existing capabilities from the codebase -->

- ✓ 200+ calculators across 11 categories (Math, Finance, Health, Photo, Video, Web, Data, DateTime, Physics, Music, Color) — existing
  - Removed v3.0: Salary calculator (US-centric, non-metric focus) — 23 finance calculators remaining
- ✓ Next.js 16 App Router with static export to GitHub Pages — existing
- ✓ Internationalization support (4 locales: en, fr, de, it) — existing
- ✓ URL state persistence for shareable calculator links — existing
- ✓ Client-side calculations (no server dependencies) — existing
- ✓ Biome linting and ESLint configuration — existing
- ✓ Tailwind CSS with theme support (light/dark mode) — existing
- ✓ Radix UI component primitives — existing

## Current Status

**v5.0 Calculator Expansion:** ✅ SHIPPED (2026-01-29)

**Delivered:** 18 new/extended calculators across 3 professional domains.

**Total Calculators:** 190 (172 + 18 new/extended)

**Domains:**

- 6 Engineering & CAD calculators (structural, materials, hydraulics)
- 6 Chemistry & Science calculators (stoichiometry, molarity, pH, periodic table)
- 6 Hyper-V & Multi-Platform calculators (3 extended, 3 new)

**Milestone Stats:**

- 6/6 phases completed (31-36)
- 18/18 requirements satisfied (100%)
- 126 files modified
- +33,317 lines added, -19,485 lines removed

---

**v4.0 Security & Infrastructure:** ✅ SHIPPED (2026-01-25)

**Delivered:** Enterprise-grade security hardening and 5 new infrastructure calculators.

**Total Calculators:** 172 (167 + 5 new infrastructure)

**Milestone Stats:**

- 6/6 phases completed (25-30)
- 17 plans executed
- 11/11 requirements satisfied (100%)
- 58 commits, 106 files modified
- +15,840 lines added, -224 lines removed

<!-- v3.0 Calculator Expansion & Performance (shipped 2026-01-25) -->

**Calculator Expansion — Crypto/Blockchain:**

- ✓ User can calculate hash values (MD5, SHA-1, SHA-256, SHA-512) — v3.0
- ✓ User can convert between wallet formats (addresses, private keys) — v3.0
- ✓ User can calculate cryptocurrency exchange rates and conversions — v3.0
- ✓ User can calculate mining profitability and rewards — v3.0

**Calculator Expansion — Real Estate:**

- ✓ User can calculate mortgage payments (principal, interest, term) — v3.0
- ✓ User can calculate property valuation and ROI — v3.0
- ✓ User can calculate rent-to-value ratio and investment metrics — v3.0
- ✓ User can calculate loan amortization schedules — v3.0

**Calculator Expansion — Cooking/Nutrition:**

- ✓ User can scale recipes based on servings — v3.0
- ✓ User can calculate nutrition facts (calories, macros, micros) — v3.0
- ✓ User can convert between cooking units (metric-first: ml, grams, litres) — v3.0
- ✓ User can calculate food cost per serving — v3.0

**Calculator Expansion — Automotive:**

- ✓ User can calculate fuel efficiency (L/100km as primary) — v3.0
- ✓ User can calculate tire sizing (metric specifications) — v3.0
- ✓ User can calculate vehicle maintenance intervals (km-based) — v3.0
- ✓ User can calculate loan/lease payments for vehicles (CHF/EUR) — v3.0

**Performance Optimization:**

- ✓ Calculator components are code-split and lazy-loaded by category — v3.0
- ✓ Initial bundle size reduced (defer non-critical categories) — v3.0
- ✓ Search results load instantly (virtualized list for 200+ calculators) — v3.0
- ✓ First Contentful Paint (FCP) improved through lazy loading — v3.0

**User Experience — Export:**

- ✓ User can export calculation results as PDF — v3.0
- ✓ User can export calculation results as CSV — v3.0
- ✓ Exported files include calculator name, inputs, and results — v3.0
- ✓ Export is accessible from calculator results — v3.0

<!-- v4.0 Security & Infrastructure (shipped 2026-01-25) -->

**Security & Code Quality:**

- ✓ User can use application without remote property injection vulnerabilities — v4.0 (Map-based URL storage)
- ✓ User understands why libpng Trivy alerts don't affect production — v4.0 (.trivyignore documentation)
- ✓ User sees clean codebase with zero unused code — v4.0 (Biome auto-fix, pre-commit hooks)

**Infrastructure Calculators:**

- ✓ User can calculate vSphere ESX cluster storage capacity requirements — v4.0 (VM Storage Calculator)
- ✓ User can calculate Kubernetes cluster node requirements — v4.0 (K8s Capacity Calculator, bin packing)
- ✓ User can calculate ESX host count for VM workload — v4.0 (Server Virtualization Calculator, N+1 HA)
- ✓ User can calculate VMware VCF/VVF licensing costs — v4.0 (Licensing Calculator, 16-core minimum)
- ✓ User can estimate total cost of ownership for virtualization infrastructure — v4.0 (TCO Calculator)

**User Experience:**

- ✓ User can discover infrastructure calculators in dedicated category — v4.0 (Infrastructure category, 3 subcategories)
- ✓ User experiences fast load times (infrastructure calculators lazy-loaded) — v4.0 (Phase 21 code splitting)
- ✓ User can export infrastructure calculator results as PDF/CSV — v4.0 (PDF/CSV export components)

<!-- v5.0 Calculator Expansion (shipped 2026-01-29) -->

**Engineering & CAD Calculators:**

- ✓ User can calculate beam deflection for structural analysis (simply supported, cantilever, fixed-fixed beams) — v5.0
- ✓ User can calculate moment of inertia for standard and composite sections — v5.0
- ✓ User can calculate stress, strain, and Young's modulus with material database — v5.0
- ✓ User can calculate column buckling load with code compliance (AISC) — v5.0
- ✓ User can calculate pipe flow pressure drop using Darcy-Weisbach equation — v5.0
- ✓ User can convert engineering units with NIST precision (force, pressure, length, area, inertia) — v5.0

**Chemistry & Science Calculators:**

- ✓ User can calculate molecular weight from chemical formulas (H₂O, Ca(OH)₂, Fe₂(SO₄)₃) — v5.0
- ✓ User can calculate molarity and solution preparation instructions — v5.0
- ✓ User can calculate dilution volumes using M₁V₁=M₂V₂ formula — v5.0
- ✓ User can calculate stoichiometry with limiting reactant and theoretical yield — v5.0
- ✓ User can calculate pH, pOH, and buffer solutions (Henderson-Hasselbalch) — v5.0
- ✓ User can browse interactive periodic table with IUPAC 2024 atomic weights — v5.0

**Hyper-V & Multi-Platform Virtualization:**

- ✓ User can calculate VM storage across platforms (VMware, Hyper-V, Proxmox, XCP-ng) — v5.0 (extended existing)
- ✓ User can calculate server virtualization with platform-specific overhead — v5.0 (extended existing)
- ✓ User can compare virtualization costs across multiple platforms with TCO analysis — v5.0 (extended existing)
- ✓ User can calculate Hyper-V consolidation with HA and Windows licensing — v5.0
- ✓ User can calculate Windows Server Datacenter vs Standard break-even — v5.0
- ✓ User can compare hypervisors side-by-side (sizing, features, costs, TCO) — v5.0

**Reference Data:**

- ✓ User sees IUPAC 2024 atomic weights for accurate chemistry calculations — v5.0
- ✓ User selects materials from database (ASTM steel, aluminum, wood, concrete) — v5.0
- ✓ User selects standard beam sections from AISC library — v5.0
- ✓ User sees licensing costs with date stamps and staleness warnings — v5.0

<!-- v7.0 Framework Migration (shipped 2026-02-26) -->

**Testing Infrastructure:**

- ✓ Vitest configured, 2288+ tests, 197 test files, ≥75% coverage on all converters — v7.0
- ✓ CI pipeline includes `npm run test:run` gate before build step — v7.0
- ✓ ADR-011 documenting Vitest test strategy — v7.0

**Error Handling & UX:**

- ✓ react-error-boundary wrapping calculator layout — graceful fallback replaces blank screens — v7.0
- ✓ Sonner toast notifications for copy-to-clipboard, CSV/PDF export, calculation errors — v7.0
- ✓ DOMPurify (isomorphic-dompurify) applied to all user-rendered HTML — v7.0

**Zod Input Validation:**

- ✓ Zod v4 installed; schemas for all 169 calculator input types in `src/lib/schemas/` — v7.0
- ✓ `createCalculatorStore` accepts optional Zod schema parameter — v7.0
- ✓ Zod `.safeParse()` replaces custom `parseNumberParam` URL helpers — v7.0
- ✓ Field-level Zod error messages in 71 components — v7.0

**LZ-String URL Compression:**

- ✓ LZ-String URL compression: 60-80% reduction via `?z=` search param; backward compatible — v7.0

**Discriminated Union Result Types:**

- ✓ CalculationResult<T> type: `{ ok: true; value: T } | { ok: false; error: string; code: string }` — v7.0
- ✓ All 169 converters return CalculationResult<T>; adapter pattern in createCalculatorStore — v7.0
- ✓ 91 components display typed error messages from `result.error` — v7.0
- ✓ All tests updated to use `.ok` discriminant — v7.0

**i18n Namespace Restructure:**

- ✓ Translation files restructured to stable 4-key schema: `common`, `nav`, `converter`, `calculator` — v7.0
- ✓ ~210 source files updated to new namespace strings — v7.0
- ✓ Zero MISSING_MESSAGE warnings; `/check-i18n` audit passes — v7.0
- ✓ ADR-012 documenting i18n restructure rationale — v7.0

**ADRs & Documentation:**

- ✓ ADR-013: Error boundaries and Sonner toasts architecture — v7.0
- ✓ ADR-014: Zod validation layer architecture — v7.0
- ✓ ADR-015: LZ-String URL compression — v7.0
- ✓ CODE_STYLE.md and ENGINEERING_PATTERNS.md updated with v7.0 patterns — v7.0

<!-- v6.0 CPU Performance & Server Refresh (shipped 2026-02-23) -->

**CPU Performance:**

- ✓ System includes curated CPU database: 17 entries (Intel Xeon Scalable, AMD EPYC, ARM/Ampere — current + previous gen) with SPECint2017 scores — v6.0
- ✓ User can compare 2–4 CPUs side-by-side: SPECint2017 base/peak, perf/core, perf/watt, sizing ratio — v6.0
- ✓ User can filter CPU comparison by vendor (Intel/AMD/ARM) and generation (current/previous) — v6.0
- ✓ User can model full server fleet refresh: old fleet → new fleet with headroom buffer, chassis constraints, power budget, and delta summary — v6.0

## Current Milestone

**v8.0** — Not yet planned. Run `/gsd:new-milestone` to start.

### Active

- (No active requirements — start `/gsd:new-milestone` to define v8.0)

### Out of Scope

- Server-side rendering — static export constraint maintained
- User accounts/authentication — localStorage sufficient for v3.0
- Real-time collaboration — high complexity, deferred to v4.0+
- Analytics/telemetry — privacy-focused, deferred to v5.0+
- Native mobile apps — web app sufficient for v3.0
- Advanced PWA features beyond v2.0 — keep current implementation
- Test framework setup — important but separate milestone
- Accessibility (a11y) comprehensive audit — important but separate milestone
- Major UI/UX redesigns — existing design works well
- Multi-language calculator logic — English for calculations, UI i18n maintained

## Context

### Current State (as of v7.0 - 2026-02-26)

**Shipped v7.0 Framework Migration:**

Codebase: ~91,000+ LOC TypeScript
Tech stack: Next.js 16, React 19, TypeScript 5, Zustand 5, Biome 2.3, Fuse.js, Vitest, Zod v4, LZ-String, Sonner, react-error-boundary, isomorphic-dompurify
Deployment: GitHub Pages (static export)
Calculators: 169 registered
Tests: 2288+ passing, 197 test files, ≥75% coverage enforced in CI
Build: 852 static pages generated — zero TypeScript errors, zero MISSING_MESSAGE

**State Management:**

- All 200+ calculators use Zustand stores with `createCalculatorStore` factory
- URL sync middleware consolidated in `src/lib/middleware/url-sync.ts`
- Per-store debounce timers via closure pattern (eliminates global timer bug)
- Legacy `useConverter` and `useUrlState` hooks removed

**Type Safety:**

- TypeScript strict mode enabled with all strict flags
- Biome `noExplicitAny` enforced at error level
- Zero `any` types in hooks, stores, or URL parsing
- Type-safe URL parameter parsing helpers (parseNumberParam, parseStringParam, parseBooleanParam)

**Progressive Web App:**

- Service worker with Workbox caching strategies
- PWA manifest with icons for all platforms (192x192, 512x512, maskable, apple-touch-icon)
- Offline functionality verified working
- Install prompt with iOS/Android platform detection

**Documentation:**

- CHANGELOG.md following Keep a Changelog format with backfilled changes
- CONTRIBUTING.md with development setup, coding standards, and calculator pattern
- 4 ADRs documenting key decisions (Zustand migration, PWA, TypeScript strict, jsPDF)
- Setup guide tested on fresh machine

**Code Quality:**

- Zero Biome lint errors
- Zero ESLint errors
- Zero format violations
- Zero npm audit vulnerabilities (production dependencies)
- Pre-commit hooks (Husky v9 + lint-staged v16) enforce quality gates
- Container security false positives documented in .trivyignore

**Dependencies:**

- jsPDF v4.0.0 verified current (latest as of Jan 2025)
- Next.js 16.1.1 with App Router
- React 19.2.3
- Zustand 5.0.10

**v1.0 Milestone Stats:**

- 8 phases completed
- 19 plans executed
- 103 commits
- 131 files modified
- +23,496 lines added, -874 lines removed
- 2 days from start to ship (2026-01-17 → 2026-01-18)
- 32/32 requirements satisfied (100%)

**v4.0 Milestone Stats:**

- 6 phases completed (25-30)
- 17 plans executed
- 58 commits
- 106 files modified
- +15,840 lines added, -224 lines removed
- 1 day from start to ship (2026-01-25, 13 hours)
- 11/11 requirements satisfied (100%)

### Known Issues / Tech Debt

**From v6.0 completion:**

- `cpu-database.json` `dataAsOf` is 2024-12-01 (~449 days old vs 90-day staleDays threshold) — staleness banner always active; data refresh recommended in next milestone
- SUMMARY.md `requirements-completed` frontmatter field not populated in v6.0 plans — documentation-only gap, all requirements verified by VERIFICATION.md
- 9 human browser-testing items deferred (phases 38/39): staleness banner, filter reset behavior, max-4 checkbox cap, URL sync, chassis disable, power budget card, delta color semantics

**From v1.0 completion:**

- Next.js 16 removed `next lint` command (architectural change discovered)
  - Future opportunity: Consider ESLint removal, Biome-only migration
  - Current: Keep dual-linter setup for React hooks rules

**Technical Environment:**

- Next.js 16.1.1 with App Router and static export
- React 19.2.3 (cutting edge)
- TypeScript 5.9.3 with strict mode
- Zustand 5.0.10 for state management
- Biome 2.3.11 for linting/formatting
- Husky 9.1.7 for Git hooks
- lint-staged 16.2.7 for staged file checks
- Deployed to GitHub Pages (static hosting)

## Constraints

- **Static Export**: Must maintain `output: "export"` in Next.js config - no server-side features
- **GitHub Pages**: Deployment must remain static file hosting compatible
- **Existing Functionality**: All 200+ calculators must continue working exactly as before
- **i18n**: Must preserve internationalization across all 4 locales (en, fr, de, it)
- **URL Sharing**: Must maintain shareable calculator links with state in URL
- **Zero Downtime**: Changes deployed incrementally, no breaking changes to users
- **Functional Principles**: KISS (Keep It Simple, Stupid), DRY (Don't Repeat Yourself), functional programming
- **Metric Units**: Swiss/European context — metric-first approach (km, kg, litres, °C, EUR/CHF). Imperial conversions available where relevant but secondary.

## Key Decisions

| Decision                                                 | Rationale                                                        | Outcome                                                     |
| -------------------------------------------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------- |
| Big bang migration (all 200+ calculators at once)        | Eliminates dual patterns faster, prevents partial migration drag | ✓ Good - All calculators migrated successfully              |
| Remove useConverter entirely (no backward compatibility) | Clean break, no legacy maintenance burden, forces best practices | ✓ Good - Legacy hooks deleted, zero duplication             |
| Per-store debounce timers (not global)                   | Fixes concurrent calculator bug, proper encapsulation            | ✓ Good - Closure pattern eliminates timer conflicts         |
| Consolidated URL sync middleware                         | DRY principle, single source of truth, consistent behavior       | ✓ Good - Middleware created, zero URL sync duplication      |
| Functional programming approach                          | Pure functions, no shared mutable state, easier testing          | ✓ Good - Code review confirmed pure functions, immutability |
| Keep a Changelog format                                  | Industry standard, user-friendly, clear conventions              | ✓ Good - CHANGELOG.md created following standard            |
| PWA with service worker                                  | Offline calculator access, mobile install, better UX             | ✓ Good - PWA working with Workbox caching                   |
| Strict TypeScript (zero any types)                       | Type safety prevents runtime errors, better developer experience | ✓ Good - Strict mode enabled, zero any types                |
| Number.isNaN() instead of isNaN()                        | Avoid type coercion, strict NaN validation                       | ✓ Good - Prevents false positives from string coercion      |
| Boolean parsing limited to "true" and "1"                | Explicit over implicit, avoid ambiguity                          | ✓ Good - Clear semantics, no "yes"/"on" edge cases          |
| jsPDF verification instead of upgrade                    | Already current (v4.0.0 latest), documentation error             | ✓ Good - Corrected ADR, verified working                    |
| Container security false positive suppression            | Static site, no Docker usage, Dockerfile never executed          | ✓ Good - Documented with 6-month review cycle               |
| Pre-commit hooks with Husky v9 + lint-staged             | Automated quality gates, fast feedback                           | ✓ Good - Hook infrastructure verified, <5s target           |
| Phase numbering continues across milestones              | Clear history, no confusion with phase resets                    | ✓ Good - Next milestone starts at Phase 9                   |
| Remove salary calculator for v3.0                        | US-focused, non-metric, incompatible with Swiss/European context | ✓ Good - Removed to align with metric-first approach        |

---

| CPU data sourced from SPEC.org submissions as curated build-time JSON | Static export constraint (no live scraping), predictable build | ✓ Good — 17 entries, staleness warning pattern reused from v4.0 licensing |
| CpuGeneration union type: "current" \| "previous" only | Simplifies server refresh comparisons, avoids vendor-specific generation names | ✓ Good — clean filtering, no edge cases |
| ARM/Ampere vendor key = "arm" (not "ampere") | Keeps CpuVendor enum minimal, Ampere is ARM architecture | ✓ Good — consistent with industry grouping |
| getServerRefreshCpus() distinct from getFilteredCpus() | Avoids naming conflicts in infrastructure barrel, cleaner API | ✓ Good — no barrel export collisions |
| ServerRefreshInput uses all-string fields | Matches createCalculatorStore URL sync pattern (all inputs URL-serializable) | ✓ Good — consistent with all other calculators |
| chassisConstraint enum: none/1u-single/2u-dual | Covers all datacenter rack unit combinations; applied in pure calc, not just UI | ✓ Good — math enforced server-side (no bypass) |
| Power budget returns null pair when powerBudgetW = 0 | Prevents division-by-zero; UI guards with !== null | ✓ Good — safe fallback, consistent null pattern |

| Vitest over Jest for converter testing | Node environment (not jsdom) — ~200ms faster per file; no React layer needed for pure functions | ✓ Good — 2288 tests, 197 files, CI gate |
| Zod `z.string().refine()` over `z.coerce.number()` | Matches string-typed FormValues in URL-synced stores | ✓ Good — consistent with URL param handling |
| LZ-String `?z=` search param (not hash) | GitHub Pages compatibility; hash routing conflicts with static export | ✓ Good — backward compatible, shareable |
| CalculationResult<T> adapter pattern | Stores stay backward compatible; unwrap internally | ✓ Good — 91 components updated, zero breaking changes |
| i18n 4-key schema: common/nav/converter/calculator | Non-overlapping namespaces; stable for all current content | ✓ Good — ~210 files updated, zero MISSING_MESSAGE |
| Test coverage scope: `src/lib/converters/**` only | Excludes React layer (complex setup); pure functions fully testable in node env | ✓ Good — 75% threshold meaningful and achievable |

---

_Last updated: 2026-02-26 after v7.0 milestone shipped_
