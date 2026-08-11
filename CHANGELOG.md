# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [7.2.3] - 2026-06-21

### Fixed

- **PWA home-screen launch broken on GitHub Pages**: the manifest `start_url`/`scope`/icons and the service-worker registration path still pointed at `/` instead of the `/converty` base path, so launching from the home screen opened the bare domain root (blank) and the service worker never registered (no offline caching). All now prefixed with `/converty/` to match `next.config.ts`. (#12)

## [7.2.0] - 2026-06-19

### Security

- **14 npm audit vulnerabilities resolved** (6 high, 5 moderate, 3 low) reported by Dependabot + Trivy: `next` 16.2.2→16.2.9, `next-intl` 4.9.0→4.13.0, `dompurify` 3.3.3→3.4.11, plus build-time deps (`vite`, `esbuild`, `@babel/*`, `ws`, `fast-uri`, `undici`, `js-yaml`, `brace-expansion`). `npm audit` now reports 0 vulnerabilities.

### Changed

- npm override added: `postcss` pinned to `^8.5.15` (via `$postcss`) to dedupe Next.js's nested `postcss@8.4.31`, avoiding the breaking `next 16 → 9.3.3` downgrade (ADR-016 addendum)
- Default branch renamed `maincd` → `main`; CI deploy/scan triggers, GitHub Pages environment policy, and ADR-008 updated accordingly
- Refreshed build-time generated data (crypto prices, mining data, CPU database, four-locale search indexes)

## [7.1.0] - 2026-04-04

### Added

- Favicon and logo assets for toolbox catalog branding

### Changed

- npm overrides extended: `serialize-javascript ^7.0.5` and `@rollup/plugin-terser ^1.0.0` added to resolve transitive dependency vulnerabilities without downgrading `workbox-build`

### Fixed

- **Security:** 9 npm audit vulnerabilities resolved — `brace-expansion` (moderate), `flatted` (high), `lodash` (high), `minimatch` (high), `picomatch` (high ×4), `yaml` (moderate), `serialize-javascript` (high ×2) via `npm audit fix` and targeted npm overrides
- **Health:** UTC-consistent date arithmetic in pregnancy due date converter (fixes off-by-one near DST transitions)
- Biome import ordering auto-fixed in 6 source files

## [7.0.0] - 2026-02-26

### Added

**[Phase 47] ADRs & CI Hardening (2026-02-26)**

- ADR-011: Vitest test strategy (node environment, v8 coverage, 75% global threshold)
- ADR-013: LZ-String URL compression (search params vs hash rationale)
- ADR-014: Zod validation layer architecture (string-based schemas, opt-in per store)
- ADR-015: Discriminated union result types (adapter pattern, no breaking changes)
- CI `static.yml` hardened: type-check gate added alongside existing test gate
- `npm run test:run` script documented as the CI-safe alias (non-interactive)

**[Phase 46] i18n Namespace Restructure (2026-02-26)**

- All 4 locale JSON files (en, fr, de, it) restructured from 8 inconsistent top-level keys to stable 4-key schema: `common`, `nav`, `converter`, `calculator`
- Migration script committed for audit trail
- All ~210 source files updated: `converters` → `converter`, `categories` → `nav`
- Build produces zero `MISSING_MESSAGE` warnings after migration
- ADR-012 documents the i18n namespace rationale

**[Phase 45] Discriminated Union Result Types (2026-02-26)**

- `CalculationResult<T>` type: `{ ok: true; value: T } | { ok: false; error: string; code: string }`
- Adapter pattern: `result: R | null` kept in `CalculatorState` for component backward compat; `CalculationResult<R>` unwrapped inside `setValue`/`setValues`
- `calculationError: string | undefined` added to `CalculatorState` — undefined on success, populated on `ok: false`
- All 91 store-based calculator components updated to render `calculationError` beneath inputs
- All 196 test files updated to use `.ok` discriminant assertions

**[Phase 44] LZ-String URL Compression (2026-02-26)**

- `lz-string@1.5.0` added for URL state compression
- URL sync middleware writes compressed state as `?z=` param (search params, not hash — GitHub Pages compatible)
- Backward-compatible dual-path read: `?z=` (compressed) or legacy per-key params
- Prototype pollution prevention: only keys matching `initialValues` accepted from parsed JSON
- Null-safety guard before JSON.parse on decompressed string
- Round-trip lossless compression verified (compress → decompress = original state)

**[Phase 40] Vitest Foundation (2026-02-26)**

- Vitest test framework configured (`vitest.config.ts`, node environment, v8 coverage)
- 66 tests across 5 priority converters with ≥75% per-file coverage thresholds
  - Fibre Channel BB credit calculator (physics formula + vendor CLI generation)
  - Subnet calculator (IP math with BigInt, RFC 3021 /31 edge cases)
  - BMI / BMR (health — WHO formula verification)
  - Compound interest (finance — precision over multi-year terms)
  - Molar mass / molecular weight (chemistry — recursive descent parser)
- `test`, `test:coverage`, `test:watch` npm scripts
- ADR-011 documenting the Vitest test strategy (supersedes ADR-010)

**[Phase 41] Full Converter Test Coverage (2026-02-26)**

- 2281 tests across 196 test files covering all 19 converter categories
- 86% line coverage, 91% branch coverage across `src/lib/converters/`
- Global coverage threshold (75%) enforced via `vitest.config.ts`
- CI gate added to `static.yml` — `vitest run --coverage` runs before `next build`
- Per-category coverage: math, health, finance, photo, web, video, datetime, network,
  crypto, cooking, automotive, data, physics, music, color, engineering, chemistry,
  infrastructure, and conversion utilities

**[Phase 42] Error Boundaries & Toast Notifications (2026-02-26)**

- `react-error-boundary` integrated into `ConverterLayout` — wraps all 169 calculators
  with graceful fallback UI on uncaught render errors
- Sonner toast notifications for user-facing events:
  - Copy-to-clipboard success/failure
  - PDF/CSV export completion
  - Clipboard API unavailability warnings
- `isomorphic-dompurify` sanitize utility (`src/lib/utils/sanitize.ts`) for safe HTML
  rendering in calculator description fields
- Opt-in `onCalculationError` callback in `createCalculatorStore` for structured error
  reporting from converter functions

**[Phase 43] Zod v4 Input Validation (2026-02-26)**

- Zod v4.3.6 added as a runtime dependency
- 15 category schema files in `src/lib/schemas/` with 100+ individual input schemas
  covering all calculator input types (numeric ranges, enums, URLs, units)
- `schema?` optional parameter added to `createCalculatorStore` — enables opt-in
  Zod validation without breaking existing stores
- Zod URL param helpers (`src/lib/utils/zod-url-params.ts`) for type-safe parsing of
  URL search parameters using Zod schemas
- Field-level validation errors wired into 71 store-based calculator components
  - Error messages rendered beneath affected input fields
  - Schema violations prevent calculation from running (displays inline errors)

### Changed

- ADR-010 (No Automated Test Framework) status updated: superseded by ADR-011
- `static.yml` CI workflow now includes Vitest coverage gate before build step
- `ConverterLayout` now wraps calculator content in an `ErrorBoundary`
- `createCalculatorStore` factory extended with optional `schema` and `onCalculationError`
  parameters (fully backward compatible)

## [5.0.0] - 2026-01-29

### Added

**Phase 31: Engineering Structural Calculators (2026-01-27)**

- Stress-Strain Calculator (`src/app/[locale]/engineering/stress-strain/`)
  - Calculate stress, strain, and Young's modulus with material database
  - 15 predefined materials (structural steel, aluminum, titanium, etc.)
  - Custom material input support
  - Safety factor analysis with pass/fail indicator
- Moment of Inertia Calculator (`src/app/[locale]/engineering/moment-of-inertia/`)
  - 8 cross-section shapes (rectangle, circle, I-beam, channel, angle, etc.)
  - Standard beam section database (AISC W, S, C, L shapes)
  - Parallel axis theorem support
  - SVG cross-section preview with centroid and axes
- Beam Deflection Calculator (`src/app/[locale]/engineering/beam-deflection/`)
  - Simply supported, cantilever, and fixed-fixed beam types
  - Point load and uniformly distributed load configurations
  - Deflection criteria table (L/180, L/240, L/360, L/600)
  - SVG beam diagram with load visualization
- Engineering category with structural subcategory
- NIST-precision material property database (`src/data/engineering/materials.json`)
- AISC beam section database (`src/data/engineering/beam-sections.json`)
- Translations for all 4 locales (en, fr, de, it)

**Phase 32: Engineering Materials & Hydraulics (2026-01-27)**

- Column Buckling Calculator (`src/app/[locale]/engineering/column-buckling/`)
  - Euler critical load calculation (Pcr = π²EI/(KL)²)
  - 4 end conditions: pinned-pinned, fixed-pinned, fixed-fixed, fixed-free
  - AISC elastic/inelastic transition analysis
  - Slenderness ratio evaluation with beam section database
- Pipe Flow Calculator (`src/app/[locale]/engineering/pipe-flow/`)
  - Darcy-Weisbach pressure drop calculation
  - Colebrook-White iterative friction factor solver (Swamee-Jain initial guess)
  - Reynolds number and flow regime classification (laminar/transitional/turbulent)
  - Pipe material database with roughness values
  - Fluid database with density and viscosity at reference temperatures
- Engineering Unit Converter (`src/app/[locale]/engineering/unit-converter/`)
  - 10 categories: force, pressure, length, area, moment of inertia, section modulus, mass, density, stress, torque
  - NIST-sourced 12-digit precision conversion factors
  - Bidirectional conversion with swap functionality
- Engineering hydraulics and conversion subcategories
- Pipe materials database (`src/data/engineering/pipe-materials.json`)
- Fluids database (`src/data/engineering/fluids.json`)
- Translations for all 4 locales (en, fr, de, it)

**Phase 33: Chemistry Core (2026-01-28)**

- New Chemistry category with 4 subcategories (general, solutions, reactions, reference)
- Molecular Weight Calculator (`src/app/[locale]/chemistry/molecular-weight/`)
  - Custom recursive descent formula parser (H2O, Ca(OH)2, Fe2(SO4)3, CuSO4·5H2O)
  - Element composition breakdown with mass percentages
  - Common compounds quick-select library
  - IUPAC 2024 atomic weights for all 118 elements
- Molarity Calculator (`src/app/[locale]/chemistry/molarity/`)
  - M = n/V = m/(Mw×V) with multi-unit output (M, mM, µM, nM)
  - Two input modes: mass & volume, moles & volume
  - Step-by-step calculation display
- Dilution Calculator (`src/app/[locale]/chemistry/dilution/`)
  - M₁V₁ = M₂V₂ formula with 3 solve modes (find V₁, V₂, or M₂)
  - Dilution factor calculation
  - Acid safety warnings for concentrated solutions
- Periodic table data (`src/data/chemistry/periodic-table.json`) — 118 elements, IUPAC 2024
- Common compounds data (`src/data/chemistry/common-compounds.json`)
- Chemistry converter registry (`src/lib/registry/chemistry-converters.ts`)
- Translations for all 4 locales (en, fr, de, it)

**Phase 34: Chemistry Advanced (2026-01-28)**

- Stoichiometry Calculator (`src/app/[locale]/chemistry/stoichiometry/`)
  - Balanced equation parser (supports →, ->, =, ⟶ arrow formats)
  - Limiting reactant identification
  - Theoretical yield calculation with mole ratios
  - Multi-reactant support with add/remove interface
- pH Calculator (`src/app/[locale]/chemistry/ph-calculator/`)
  - 8 calculation modes: from pH, pOH, [H⁺], [OH⁻], strong/weak acid/base, buffer
  - Henderson-Hasselbalch equation for buffer solutions
  - pH scale visualization with color gradient (0-14)
  - Solution type classification (strongly acidic → strongly basic)
- Interactive Periodic Table (`src/app/[locale]/chemistry/periodic-table/`)
  - 18-column CSS grid layout with all 118 elements
  - Search by name, symbol, or atomic number
  - Filter by category (10 types), period, and metal type
  - Element detail display with 12 properties
  - Mobile-responsive with horizontal scroll
- Acids/bases reference data (`src/data/chemistry/acids-bases.json`)
- Translations for all 4 locales (en, fr, de, it)

**Phase 35: Hyper-V & Multi-Platform Virtualization (2026-01-28)**

- Hyper-V Consolidation Calculator (`src/app/[locale]/infrastructure/hyperv-consolidation/`)
  - VM workload to host count sizing with HA (N+1/N+2)
  - Hyper-V Replica storage calculation (2× multiplier)
  - Storage stacking: thin(1.5×) × snapshot(1.15×) × replication(2×) = 3.45×
  - Windows Server core licensing with 16-core minimum enforcement
  - Datacenter vs Standard edition comparison with break-even analysis
- Windows Server Licensing Calculator (`src/app/[locale]/infrastructure/windows-licensing/`)
  - Core license calculation with all Microsoft minimums
  - 2-core pack counting
  - Datacenter (unlimited VMs) vs Standard (2 VMs/license) comparison
  - Break-even at ~13 VMs/host crossover point
- Extended existing calculators with multi-platform support (backward compatible):
  - VM Storage: platform-specific disk formats and overhead (VMware/Hyper-V/Proxmox/XCP-ng)
  - Server Virtualization: platform-specific CPU/memory overhead factors
  - Virtualization Cost: multi-platform comparison mode
- Hypervisor overhead data (`src/data/infrastructure/hypervisor-overhead.json`)
- Licensing costs data (`src/data/infrastructure/licensing-costs.json`)
- Translations for all 4 locales (en, fr, de, it)

**Phase 36: Cross-Platform Hypervisor Comparison (2026-01-28)**

- Hypervisor Comparison Calculator (`src/app/[locale]/infrastructure/hypervisor-comparison/`)
  - Side-by-side TCO analysis for VMware vSphere, Hyper-V, Proxmox VE, XCP-ng
  - 5-year cost analysis with 4 categories: licensing, hardware, power, labor
  - Platform-specific storage multipliers and overhead factors
  - Recommendation engine based on workload size and cost
  - Comprehensive feature matrix (HA, migration, storage, automation, scalability, licensing)
  - Licensing cost staleness warnings (>180 days) with vendor links
- Feature matrix data (`src/data/infrastructure/hypervisor-features.json`)
- CSV/PDF export for comparison results
- Translations for all 4 locales (en, fr, de, it)

### Security

- **FIXED:** Next.js DoS vulnerabilities (CVE in Image Optimizer, PPR memory consumption, RSC deserialization)
  - Upgraded Next.js 16.1.4 → 16.1.6 via `npm audit fix`
  - 0 vulnerabilities remaining

### Changed

- Calculator count increased to 190 total (172 + 18 new/extended)
- Engineering category expanded with 3 subcategories (structural, hydraulics, conversion)
- Infrastructure category expanded with Hyper-V and multi-platform subcategories
- Existing VMware calculators extended with multi-platform selector (default: VMware for backward compatibility)
- Translation coverage: all 4 locales (en, fr, de, it) fully synchronized at 4,072 keys each

### Fixed

- Phase 31-36: All TypeScript strict mode compliance (0 type errors)
- Phase 35: Variable shadowing in hypervisor comparison cost calculations
- Phase 36: Missing UI Alert component replaced with styled Card
- Translation completeness: resolved 476 missing key-locale combinations across FR/DE/IT
- Removed 73 orphaned translation keys from Italian locale

## [4.0.0] - 2026-01-25

### Added

**Phase 25: Security Hardening (2026-01-25)**

- Map-based URL parameter storage to prevent remote property injection
  - Refactored `getUrlParams()` to return Map<string, string> instead of Record
  - Eliminated dynamic property access from untrusted URL input
  - Updated all calculator stores to use `Map.get()` API for safe parameter retrieval
  - Added `Object.hasOwn()` checks before property assignment
- Security vulnerability documentation
  - Comprehensive `.trivyignore` with false positive explanations
  - 6-month review cycle for container security (expires 2026-07-25)
  - Static export clarification: No Docker containers in production (GitHub Pages)
  - npm audit --production verification: 0 vulnerabilities
- Code quality cleanup
  - Removed all unused imports across codebase (12 files)
  - Biome lint passes with 0 warnings
  - Pre-commit hooks enforce code quality gates

**Phase 26: Infrastructure Category Foundation (2026-01-25)**

- Infrastructure category (`src/lib/registry/categories.ts`)
  - New "Infrastructure" category with Server icon
  - 3 subcategories: VMware, Kubernetes, Cost
  - Category landing page at `/[locale]/infrastructure`
  - Search integration with infrastructure-specific keywords
- Infrastructure converter registry (`src/lib/registry/infrastructure-converters.ts`)
  - Dedicated registry module for infrastructure calculators
  - Integrated into main converters registry
  - 5 calculators organized by subcategory
- Translations for all 4 locales (en, fr, de, it)
  - Infrastructure category metadata
  - Kubernetes capacity calculator labels (51 keys)
  - Complete translation coverage for new category

**Phase 27: VM Storage Calculator (2026-01-25)**

- VM Storage Calculator for vSphere ESX clusters (`src/app/[locale]/infrastructure/vm-storage-calculator/`)
  - Multi-profile VM configuration (unlimited profiles)
  - Thin vs thick provisioning support
  - RAID overhead calculation
  - Snapshot space allocation
  - Growth capacity planning
- VM storage calculation logic (`src/lib/converters/infrastructure/vm-storage.ts`)
  - Provisioned disk space (over-subscription for thin provisioning)
  - Swap space calculation (100% of VM RAM)
  - Snapshot allocation (percentage-based)
  - ESX configuration overhead (2GB per host)
  - Growth capacity (future VM additions)
- Dynamic VM profile management
  - Add/remove profiles with validation (minimum 1 profile)
  - Independent disk size, RAM, and VM count per profile
  - Profile-level configuration controls
- Results breakdown with 8 metrics
  - Used Disk, Over-subscribed, Snapshots, Swap, Config/Log
  - Total VM Storage, ESX Overhead, Growth
  - Percentage breakdown visualization
- Thin provisioning warning (>50% over-subscription)
- Zustand store with URL synchronization (`src/stores/vm-storage-store.ts`)
- Translations for all 4 locales (en, fr, de, it)

**Phase 28: Kubernetes Capacity Calculator (2026-01-25)**

- Kubernetes Capacity Planning Calculator (`src/app/[locale]/infrastructure/k8s-capacity-calculator/`)
  - Multi-dimensional bin packing (CPU vs memory constraints)
  - Node sizing calculator for K8s clusters
  - Identifies limiting factor (CPU vs memory scheduling)
  - Industry-standard capacity planning (70% CPU / 80% memory target)
  - System overhead accounting (kubelet, container runtime, OS)
  - DaemonSet resource reservation per node
  - Over-utilization warnings (>80% threshold)
- K8s capacity calculation (`src/lib/converters/infrastructure/k8s-capacity.ts`)
  - Allocatable resource calculation (Capacity - SystemReserved - DaemonSets)
  - Target utilization adjustment (autoscaling headroom)
  - Dual constraint analysis (CPU millicores and memory MiB)
  - Input validation (11 parameters)
- Limiting factor visualization with badge UI
- Detailed capacity breakdown results with 5 calculation steps
- Zustand store with URL synchronization (`src/stores/k8s-capacity-store.ts`)
- Translations for all 4 locales (en, fr, de, it)

**Phase 29: VMware Server & Licensing Calculators (2026-01-25)**

- Server Virtualization Calculator (`src/app/[locale]/infrastructure/server-virtualization-calculator/`)
  - ESX host sizing with multi-dimensional bin packing
  - N+1 high availability support (+1 host exactly)
  - vCPU-to-core ratio configuration (default 4:1)
  - Target utilization thresholds (70% CPU, 80% RAM)
  - Limiting factor identification (CPU vs RAM constrained)
  - VM consolidation ratio display
- VMware Licensing Calculator (`src/app/[locale]/infrastructure/vmware-licensing-calculator/`)
  - Core-based licensing with 16-core minimum per CPU
  - Product types: VCF ($350/core/year), VVF ($135/core/year), vSphere EP, vSphere Standard
  - vSAN storage entitlement calculation (1.0 TiB/core VCF, 0.25 TiB/core VVF)
  - Multi-year term support (1/3/5 years)
  - 16-core minimum warning display
  - Pricing disclaimer (2026 list prices)
- Server virtualization logic (`src/lib/converters/infrastructure/server-virtualization.ts`)
- VMware licensing logic (`src/lib/converters/infrastructure/vmware-licensing.ts`)
- Zustand stores with URL synchronization
- Translations for all 4 locales (en, fr, de, it)

**Phase 30: Virtualization Cost & Export (2026-01-25)**

- Virtualization Cost Calculator (TCO analysis) (`src/app/[locale]/infrastructure/virtualization-cost-calculator/`)
  - CAPEX calculation (hardware costs: servers, storage, network)
  - OPEX calculation (power, software licensing, datacenter, labor)
  - Total Cost of Ownership (TCO) over term
  - Cost per VM metrics
  - Visual cost breakdown by category with percentages
  - 4 organized input sections (Hardware, Software, Operational, Term)
- TCO calculation logic (`src/lib/converters/infrastructure/virtualization-cost.ts`)
  - Power consumption costs (kWh × PUE × electricity rate)
  - Software licensing annual costs
  - Datacenter space costs (rack units × $/RU)
  - Labor costs (FTE count × annual salary)
  - Growth allocation for future expansion
- PDF export for all 5 infrastructure calculators
  - VM Storage, K8s Capacity, Server Virtualization, VMware Licensing, Virtualization Cost
  - PdfExportButton component integration
  - Formatted currency and percentage values
  - Multi-section document support
- CSV export for all 5 infrastructure calculators
  - CsvExportButton component integration
  - UTF-8 BOM for Excel compatibility
  - Formula injection prevention
  - Field-Value-Unit structure
- Zustand store (`src/stores/virtualization-cost-store.ts`)
- Translations for all 4 locales (en, fr, de, it)

### Security

- **FIXED:** Remote property injection vulnerability (CodeQL High severity)
  - Map-based URL parameter storage eliminates prototype pollution risk
  - Safe property access with Object.hasOwn() checks
  - All calculator stores updated to use Map API
- **DOCUMENTED:** Container security false positives
  - libpng CVE-2024-44191 does not affect production (static export, no Docker)
  - Workbox Dockerfile is dev dependency only, never executed
  - 6-month review cycle established

### Changed

- URL parameter retrieval now uses Map API instead of object property access
- All infrastructure calculators use category-based organization
- Calculator count increased to 172 total (167 + 5 new infrastructure)

### Fixed

- Phase 25: Removed all unused imports (12 files)
- Phase 26: Fixed German k8sCapacity translation namespace (36 keys → 51 keys)
- Phase 27: Added missing 'profile' translation key to all 4 locales
- Phase 28: Implemented safe parse helpers to prevent transient input validation errors
- Phase 29: Fixed translation namespace mismatches (camelCase consistency)

## [3.0.0] - 2026-01-25

### Added

**Phase 24: Export Functionality (2026-01-25)**

- PDF and CSV export for calculation results
  - Zero-dependency CSV export using native Blob API
  - jsPDF for PDF generation (v4.0.0)
  - Internationalization support across all 4 locales (en, fr, de, it)
- CsvExportButton component (`src/components/converter/csv-export-button.tsx`)
  - CSV injection prevention (escape =, +, -, @ prefixes)
  - UTF-8 BOM for Excel compatibility
  - Timestamped filenames (YYYY-MM-DD_HH-MM-SS format)
  - Download icon semantic distinction from PDF (FileText vs Download)
- PdfExportButton component (`src/components/converter/pdf-export-button.tsx`)
  - Multi-section document support
  - Configurable title and subtitle
  - ISO 8601 timestamp formatting
  - FileText icon for document semantics
- CSV export utility (`src/lib/utils/csv-export.ts`)
  - Type-safe CsvRow interface (Field, Value, Unit columns)
  - Security: Formula injection prevention
  - Excel compatibility: UTF-8 BOM support
  - RFC 4180 compliant CSV formatting
- Age Calculator export integration (reference implementation)
  - Both PDF and CSV export buttons in results section
  - Comprehensive data export (10 fields including zodiac signs)
  - Button group layout with flex gap-2 spacing
- Export translation keys across all 4 locales
  - exportPdf, exportCsv labels
  - Export success/error messages
  - Accessible button aria-labels

**Phase 21: Code Splitting & Lazy Loading (2026-01-24)**

- Dynamic imports for all 167 calculator pages
  - On-demand bundle loading reduces initial page weight
  - Calculators render on server for SEO, hydrate client-side
  - `next/dynamic` imports for category-based code splitting
  - Consistent loading UX with CalculatorSkeleton component
- CalculatorSkeleton loading component (`src/components/converter/calculator-skeleton.tsx`)
  - Configurable skeleton with inputCount and showResults props
  - Used in both dynamic loading and Suspense fallback
  - Smooth loading states during chunk fetching
- Bundle analyzer integration for performance monitoring
  - `@next/bundle-analyzer` configured via `ANALYZE=true` environment variable
  - Baseline metrics established (210 chunks, 6.4MB JS before optimization)
  - On-demand analysis prevents running in every build
- Performance improvements verified
  - Total bundle reduced by 3.1% (6.4 MB → 6.2 MB, -0.2 MB absolute)
  - First Load JS reduced by 5-7% per route
  - Homepage: 184 KB → ~170 KB (-14 KB, 7.6% reduction)
  - Category pages: 184 KB → ~170 KB (-14 KB, 7.6% reduction)
  - Individual calculators: 186 KB → ~175 KB (-11 KB, 5.9% reduction)
- Search performance verified at <100ms (20-50ms estimated render time)
  - Fuse.js client-side search with useDeferredValue optimization
  - 167 calculators well below 500 threshold requiring virtualization
  - Expected render time provides 50ms buffer below 100ms requirement
- Service worker caching for code-split chunks
  - Workbox glob pattern `**/*.js` captures all 212 JS chunks
  - 969 files precached (153.1 MB total) for offline support
  - Code-split chunks cached automatically via service worker
- Static export preserved (743 HTML files generated)
- URL state persistence working with lazy-loaded components
- All PERF-01 through PERF-04 requirements satisfied

**Phase 20: Automotive Calculators (2026-01-24)**

- Automotive calculator suite with metric-first European focus (4 calculators: fuel-efficiency, tire-sizing, maintenance-intervals, vehicle-financing)
- Fuel Efficiency Calculator (`src/app/[locale]/automotive/fuel-efficiency/`)
  - L/100km as primary metric (European standard)
  - Conversions to km/L, MPG (US/UK)
  - Trip cost calculations with CHF/EUR fuel prices
  - Annual fuel cost estimates
  - Swiss fuel price data (Benzin 95/98, Diesel) with build-time updates
  - Consumption comparison mode
- Tire Sizing Calculator (`src/app/[locale]/automotive/tire-sizing/`)
  - European metric notation (205/55R16) parsing
  - Tire dimensions calculator (sidewall, diameter, circumference)
  - ETRTO load index and speed rating lookups
  - Size comparison with diameter difference and speedometer error
  - ±3% diameter tolerance warnings
  - 100+ load indexes and speed ratings (Q to Y, 160-300 km/h)
- Maintenance Intervals Calculator (`src/app/[locale]/automotive/maintenance-intervals/`)
  - km-based service intervals (metric-first)
  - 14 service types (oil, air filter, cabin filter, brake pads, brake fluid, coolant, transmission, timing belt, spark plugs, battery, tires, suspension, MFK inspection, general inspection)
  - Swiss MFK inspection reminders (3-year first, 2-year subsequent)
  - Service schedule tracking with next due date calculation
  - Overdue service highlighting with priority levels
  - Service history tracking
- Vehicle Financing Calculator (`src/app/[locale]/automotive/vehicle-financing/`)
  - PMT formula for loan calculations
  - Money factor for lease calculations (APR / 2400)
  - CHF/EUR currency support with Swiss formatting
  - Swiss VAT (7.7%) for new vehicles
  - Buy vs lease comparison with total cost difference
  - Amortization schedule generation for loans
  - Residual value calculations for leases
- Automotive category registration in calculator registry (159→163 calculators, 13→14 categories)
- Complete i18n support for all automotive calculators (en, fr, de, it)
- URL parameter persistence for calculator state sharing across all 4 calculators
- Swiss automotive data files
  - `src/lib/data/swiss-fuel-prices.json` - Fuel prices (Benzin 95/98, Diesel) in CHF/EUR
  - `src/lib/data/tire-load-index.json` - 100+ ETRTO load index values
  - `src/lib/data/tire-speed-ratings.json` - Speed ratings Q to Y (160-300 km/h)
  - `src/lib/data/maintenance-intervals.json` - Service intervals for 14 types
  - `src/lib/data/swiss-mfk-rules.json` - Swiss vehicle inspection regulations

**Phase 19: Cooking/Nutrition Foundation (2026-01-24)**

- Cooking and nutrition calculator suite with metric-first focus (4 calculators: recipe-scaler, nutrition-calculator, cooking-units, food-cost)
- Recipe Scaler Calculator (`src/app/[locale]/cooking/recipe-scaler/`)
  - Servings multiplier with non-linear scaling rules
  - Salt scaling at 67-75% rate (taste perception doesn't scale linearly)
  - Spices and extracts at 75% rate (volatile compounds concentrate)
  - Leavening agents at 87.5% rate (chemical reaction efficiency)
  - Liquids at 70% when scaling down, normal when scaling up (evaporation rate)
  - All other ingredients scale linearly
  - Ingredient list with amounts and units
- Nutrition Calculator (`src/app/[locale]/cooking/nutrition-calculator/`)
  - Calorie calculations (protein×4, carbs×4, fat×9)
  - Macro tracking (protein, carbs, fat)
  - Micro tracking (vitamins, minerals)
  - 115-food curated database (foods-cooking.json)
  - Percentage of daily values (%DV)
  - Nutrition facts label formatting
- Cooking Units Converter (`src/app/[locale]/cooking/cooking-units/`)
  - Metric-first ordering (ml, L, grams, kg)
  - Imperial conversions available (cups, tbsp, tsp, oz, lb)
  - US standard cup (240ml) not UK cup (284ml)
  - Density-aware conversions (volume ↔ weight)
  - Ingredient density table (68 ingredients)
  - Fractional display for imperial units (1/4 cup not 0.25 cup)
- Food Cost Calculator (`src/app/[locale]/cooking/food-cost/`)
  - Cost per serving calculations
  - Multi-ingredient support with quantities
  - Unit compatibility checking (prevents mixing volume/weight)
  - CHF/EUR/USD currency support
  - Batch cooking cost analysis
  - Per-person cost breakdown
- Cooking category registration in calculator registry (163→167 calculators, 14→15 categories)
- Complete i18n support for all cooking calculators (en, fr, de, it)
- URL parameter persistence for basic calculator settings (ingredients array not synced due to complexity)
- Cooking data files
  - `src/lib/data/cooking-densities.ts` - 68 ingredient densities (flour 0.53, water 1.0, etc.)
  - `src/lib/data/foods-cooking.json` - 115-food nutrition database

**Phase 18: Real Estate Foundation (2026-01-24)**

- Real Estate Calculator Suite with Swiss market focus (3 calculators: mortgage, rental-yield, property-valuation)
- Swiss Mortgage Calculator (`src/app/[locale]/realestate/mortgage-swiss/`)
  - PMT formula for monthly payment calculation
  - Amortization schedule with yearly breakdown
  - Swiss regulatory compliance checks (20% minimum down payment, 80% max LTV)
  - Affordability stress test at 5% rate (Swiss banking standard)
  - CHF/EUR currency support with Swiss formatting
  - 3 charts: Principal vs Interest, Balance Over Time, Yearly breakdown
- Rental Yield Calculator (`src/app/[locale]/realestate/rental-yield/`)
  - Gross/Net yield calculations with market comparison
  - GRM (Gross Rent Multiplier) and capitalization rate analysis
  - Monthly/annual cash flow with optional mortgage integration
  - Investment rating system (excellent/good/fair/poor)
  - Swiss city yield comparison (8 regions from Zurich 2.45% to Lucerne 3.05%)
  - Break-even calculations and transaction cost analysis (3-6% range)
  - Negative cash flow warnings with detailed analysis
- Property Valuation Calculator (`src/app/[locale]/realestate/property-valuation/`)
  - Hedonic method for property valuation
  - 8 Swiss regions with regional pricing (CHF 8,500-12,500/m²)
  - 3 property types (apartment, house, commercial)
  - 5 condition levels (poor to excellent)
  - 11 property features with CHF bonuses (garage CHF 50k, garden CHF 40k, etc.)
  - Age-based adjustments (1.10x for new, 0.85x for 80+ years)
  - Confidence levels (low/medium/high) based on input completeness
  - ±15% value range with regional comparisons
- Real estate category registration in calculator registry (156→159 calculators, 12→13 categories)
- Swiss property market data files
  - `src/lib/data/swiss-property-prices.json` - Regional pricing by property type
  - `src/lib/data/real-estate-benchmarks.json` - Market yields, mortgage rates, regulatory requirements
- Complete i18n support for all real estate calculators (en, fr, de, it)
- URL parameter persistence for calculator state sharing across all 3 calculators
- Zustand state management with createUrlSyncMiddleware for reactive updates

**Phase 17: Crypto/Blockchain Foundation (2026-01-24)**

- Hash Calculator (`src/app/[locale]/crypto/hash/`)
  - MD5, SHA-1, SHA-256, SHA-512 hash algorithms
  - WebCrypto for SHA algorithms, crypto-js for MD5
  - Real-time calculation with copy-to-clipboard
  - MD5 security warning (destructive alert)
- Wallet Address Validator (`src/app/[locale]/crypto/wallet/`)
  - Format detection for Bitcoin (P2PKH, P2SH, P2WPKH, P2WSH, P2TR), Ethereum, Litecoin
  - Network detection (mainnet vs testnet)
  - Private key pattern detection with security warnings
  - wallet-address-validator library (~2KB)
- Cryptocurrency Exchange Rate Calculator (`src/app/[locale]/crypto/exchange/`)
  - Build-time price fetching from CoinGecko API
  - Support for 6 cryptocurrencies (BTC, ETH, LTC, XRP, DOGE, ADA)
  - Support for 3 fiat currencies (CHF, EUR, USD) with CHF/EUR as primary
  - Staleness detection for price data (24-hour threshold warning)
  - Static JSON data file for static export compatibility
- Mining Profitability Calculator (`src/app/[locale]/crypto/mining/`)
  - Real-time mining profit analysis (daily, monthly, yearly)
  - Hash rate input with multiple units (H/s, KH/s, MH/s, GH/s, TH/s, PH/s)
  - Power consumption and electricity cost calculation
  - Miner presets (Antminer S19 Pro, S19j Pro, S19 XP, Whatsminer M30S++)
  - ROI calculation and break-even date estimation
  - Swiss electricity cost default (0.27 CHF/kWh)
  - Build-time mining data fetching from Blockchain.info
- Crypto category registration in calculator registry (4 new calculators, 158 total)
- Complete i18n support for all crypto calculators (en, fr, de, it)
- Downloadable offline package (`converty-local.zip`) available from GitHub Releases
- Local server scripts for Mac/Linux (`start.sh`) and Windows (`start.bat`)
- GitHub Actions workflow to automatically create releases with downloadable package

### Changed

- Restructured documentation into focused guides in `docs/` folder
  - `docs/CALCULATOR_GUIDE.md` - Step-by-step for adding calculators
  - `docs/CODE_STYLE.md` - TypeScript, naming, linting conventions
  - `docs/I18N_GUIDE.md` - Internationalization patterns
- Slimmed down CONTRIBUTING.md (425 → 112 lines) with links to detailed guides
- Slimmed down CLAUDE.md (243 → 80 lines) with links to detailed guides

### Fixed

- Network category page 404 error - missing `src/app/[locale]/network/page.tsx` now created
- Broken documentation references in CLAUDE.md and CONTRIBUTING.md
- Outdated calculator counts and categories in README.md (60 → 156 calculators, 9 → 12 categories)

## [2.0.0] - 2026-01-22

### Added

- Network calculator suite with comprehensive visualization
  - Visual Subnet Calculator with IPv4/IPv6 support
    - Network diagram showing IP ranges and subnet structure
    - Binary representation with color-coded bits (blue=network, green=host)
    - Breakdown table (network address, broadcast, usable range, total hosts)
    - CIDR notation input (/24, /64) and subnet mask input (255.255.255.0)
    - Subnetting: divide network into smaller subnets
    - Supernetting: combine multiple networks into larger CIDR blocks
    - BigInt support for IPv6 host calculations
    - RFC 3021 compliance for /31 point-to-point subnets
  - IP Address Calculator (`src/app/[locale]/network/ip-address/`)
    - IP class detection (A, B, C, D, E)
    - Public/private IP classification
    - IP format and range validation
  - CIDR Range Calculator (`src/app/[locale]/network/cidr-range/`)
    - Calculate IP ranges from CIDR notation
    - Check if specific IP is within CIDR range
    - Visual indicators with color-coded cards
  - Network Speed/Latency Calculator
    - Latency converter with nanosecond precision
    - Throughput calculator (data size/time to bandwidth)
    - Smart value formatting based on magnitude
- Global search functionality accessible from all pages
  - Cmd+K (Mac) / Ctrl+K (Windows) keyboard shortcut
  - Fuzzy search with Fuse.js (~5KB gzipped)
  - Pre-built search indexes per locale (build-time JSON generation)
  - Real-time results with useDeferredValue
  - cmdk for Command palette UI
  - Weighted fuzzy matching (name 0.4, keywords 0.3, description 0.2, category 0.1)
  - GlobalSearch component (`src/components/search/global-search.tsx`)
- Network category in calculator registry (`src/lib/registry/network-converters.ts`)
  - Subnet/IP subcategories for organization
  - ipaddr.js dependency for IP address manipulation (55M+ weekly downloads)
- Dialog component (`src/components/ui/dialog.tsx`) using @radix-ui/react-dialog
- 300+ translation keys across all 4 locales (en, fr, de, it)
  - Photo calculator namespaces (dof, optics, nd-filter, macro, timelapse, astro)
  - Video calculator namespace
  - Network calculator namespace
  - Search UI translations

### Changed

- Simplified calculator names by removing "Calculator" suffix/prefix across all locales
  - English: Removed " Calculator" suffix (133 instances)
  - French: Removed "Calculateur de/d'/du " and "Calculatrice de " prefixes
  - German: Removed "-Rechner", "rechner", " Rechner" suffixes (112 instances)
  - Italian: Removed "Calcolatore di/Calcolatore " and "Calcolatrice di " prefixes (135 instances)
  - Improves readability and reduces visual fatigue when browsing calculator list
- Search button added to header (sm+ screens)
- Build script now includes prebuild step for search index generation

### Fixed

- All 156 registered calculators now fully internationalized
  - Zero hardcoded English strings in calculator components
  - All calculators verified working in EN, FR, DE, IT locales
  - Photo calculators: advanced-dof, dof-table, hyperfocal, circle-of-confusion, diffraction, focal-equivalent, macro-dof, macro-diffraction, nd-filter, spot-stars, star-trails, time-lapse
  - Video calculators: common-bitrates, frame-rate (fixed namespace from calculator.photo.video to calculator.video)
  - Missing translation keys in fr.json and de.json for calculator.video namespace

## [1.0.0] - 2026-01-18

### Added

- Progressive Web App support with offline capability
  - PWA manifest with icons (192x192, 512x512, maskable, apple-touch-icon)
  - Service worker with Workbox caching strategies
  - NetworkFirst strategy for HTML/documents (7-day cache fallback)
  - CacheFirst strategy for static assets
  - StaleWhileRevalidate strategy for fonts
  - Production-only service worker registration
  - Offline detection UI with banner providing real-time feedback
  - Install prompt component with iOS/Android platform detection
  - Build integration generating precache manifest (838 files)
- Zustand-based state management with URL synchronization
  - `createCalculatorStore` factory for type-safe calculator state
  - URL sync middleware with per-store debounce timers (150ms default)
  - Closure-based timer isolation preventing conflicts between calculators
  - Support for nested state selection via `selectState` option
- Type-safe URL parameter parsing helpers (`src/lib/utils/url-params.ts`)
  - `parseStringParam` with fallback support
  - `parseNumberParam` with Number.isNaN() strict validation
  - `parseBooleanParam` accepting only "true" and "1"
  - Empty string triggers fallback (same as null)
- Biome noExplicitAny enforcement at error level
- TypeScript strict mode with comprehensive flags documented inline
- Translation keys for all calculator results and labels
  - `calculator.results.result` key for 117 calculators
  - Zodiac sign translations in age calculator (all 4 locales)
  - Health calculator translations (sleep, body type, ovulation, pregnancy, period)
  - Finance calculator translations (salary, quadratic)
  - Utilities translations (time, bitrate, SEO analyzer)
- Pre-commit automation for code quality enforcement
  - Husky v9.1.7 for Git hooks management with modern API
  - lint-staged v16.2.7 for running Biome checks on staged files only
  - `.lintstagedrc.json` configuration for auto-fix on commit
  - Automatic hook setup on `npm install` via prepare script
  - Fast feedback loop (under 5 seconds for typical commits)
- Container security scan suppression for false positives
  - `.trivyignore` documenting AVD-DS-0002 and AVD-DS-0017 findings
  - Dockerfile in node_modules never executed (static site deployment)
  - 6-month review cycle with expiration dates
- Consolidated URL parameter utilities (`getUrlParams` function)
  - Extracted to `src/lib/utils/url-params.ts` shared module
  - Eliminated duplication across calculator-store.ts and url-sync.ts
  - Server-side rendering safe (returns empty object when window undefined)

### Changed

- Migrated all 117 calculators from `useConverter` hook to Zustand stores
- Replaced useState pattern with Zustand `createCalculatorStore` factory
- Enabled TypeScript strict mode across entire codebase
  - `noImplicitAny: true`
  - `strictNullChecks: true`
  - `strictFunctionTypes: true`
  - `strictBindCallApply: true`
  - `strictPropertyInitialization: true`
  - `noImplicitThis: true`
  - `alwaysStrict: true`
- URL sync now uses `replaceState` instead of `pushState` (avoids flooding browser history)
- Service worker registration moved to client component (`src/app/[locale]/sw-registration.tsx`)
- PWA manifest migrated from static `manifest.json` to Next.js App Router `manifest.ts` for type safety

### Fixed

- TypeScript strict mode violations in state management layer
  - Zero compilation errors in hooks, stores, URL parsing
  - Zero explicit `any` types in state management
- URL parameter parsing edge cases
  - Empty string handling (now triggers fallback)
  - NaN detection using strict `Number.isNaN()` instead of global `isNaN()`
  - Boolean parsing ambiguity (now requires explicit "true" or "1")
- Global debounce timer conflicts between multiple calculator instances
  - Replaced with per-store closure-based timers
  - Each store now has isolated timer preventing interference
- Missing translation keys affecting 5+ calculators
  - Age calculator zodiac signs (now properly localized in en, fr, de, it)
  - Sleep calculator sleep quality levels
  - Body type calculator categories
  - Heart rate calculator zone names and descriptions
  - BMI calculator category labels
  - Body fat calculator category labels
  - BAC calculator status and effects
  - Calories burned activity names
- Hard-coded English labels in health calculators (now fully internationalized)
- Service worker scope issues with locale routes (now uses root scope `/`)

### Removed

- Legacy `useConverter` hook (`src/hooks/use-converter.ts` - 2.3 KB)
  - Replaced by Zustand `createCalculatorStore` factory
  - Breaking change: calculators must migrate to new pattern
- Legacy `useUrlState` hook (`src/hooks/use-url-state.ts` - 1.8 KB)
  - Replaced by URL sync middleware
  - URL synchronization now automatic via middleware
- Duplicate URL sync logic across calculator stores (49 lines removed from `calculator-store.ts`)
- Explicit `any` types in state management layer
  - Replaced with proper TypeScript types or `unknown` with type guards
- Duplicate `getUrlParams` functions across calculator-store.ts and url-sync.ts
  - 12 lines of code duplication eliminated
  - Consolidated to single source of truth in url-params.ts

### Security

- Container security false positives suppressed (AVD-DS-0002, AVD-DS-0017)
  - Trivy findings for Dockerfile in @surma/rollup-plugin-off-main-thread (node_modules)
  - Documented in .trivyignore with rationale and review dates
  - No impact: Dockerfile never executed (static site, no Docker usage)
- jsPDF security verified (v4.0.0 is current as of January 2025)

### Deprecated

- None

[unreleased]: https://github.com/fjacquet/converty/compare/v7.0.0...HEAD
[7.0.0]: https://github.com/fjacquet/converty/compare/v5.0.0...v7.0.0
[5.0.0]: https://github.com/fjacquet/converty/compare/v4.0.0...v5.0.0
[4.0.0]: https://github.com/fjacquet/converty/compare/v3.0.0...v4.0.0
[3.0.0]: https://github.com/fjacquet/converty/compare/v2.0.0...v3.0.0
[2.0.0]: https://github.com/fjacquet/converty/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/fjacquet/converty/releases/tag/v1.0.0
