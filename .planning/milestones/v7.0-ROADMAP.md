# Roadmap: Converty

## Milestones

- ✅ **v1.0 Infrastructure Upgrade** — Phases 1–8 (shipped 2026-01-18)
- ✅ **v2.0 Network Tools & User Experience** — Phases 9–16 (shipped 2026-01-22)
- ✅ **v3.0 Calculator Expansion & Performance** — Phases 17–24 (shipped 2026-01-25)
- ✅ **v4.0 Security & Infrastructure** — Phases 25–30 (shipped 2026-01-25)
- ✅ **v5.0 Calculator Expansion** — Phases 31–36 (shipped 2026-01-29)
- ✅ **v6.0 CPU Performance & Server Refresh** — Phases 37–39 (shipped 2026-02-23)
- ✅ **v7.0 Framework Migration** — Phases 40–48 (shipped 2026-02-26)

## Phases

<details>
<summary>✅ v1.0 Infrastructure Upgrade (Phases 1–8) — SHIPPED 2026-01-18</summary>

See `.planning/milestones/v1.0-ROADMAP.md` for full details.

- [x] Phase 1: Type Safety Foundation — completed 2026-01-17
- [x] Phase 2: URL Sync Infrastructure — completed 2026-01-17
- [x] Phase 3: State Migration — completed 2026-01-17
- [x] Phase 4: Progressive Web App — completed 2026-01-18
- [x] Phase 5: Documentation — completed 2026-01-18
- [x] Phase 6: Dependency Upgrade — completed 2026-01-18
- [x] Phase 7: Code Quality Validation — completed 2026-01-18
- [x] Phase 8: Developer Experience — completed 2026-01-18

</details>

<details>
<summary>✅ v2.0 Network Tools & User Experience (Phases 9–16) — SHIPPED 2026-01-22</summary>

See `.planning/milestones/v2.0-ROADMAP.md` for full details.

- [x] Phase 9: Visual Subnet Foundation — completed 2026-01-22
- [x] Phase 10: Visual Subnet Visualization — completed 2026-01-22
- [x] Phase 11: Visual Subnet Advanced — completed 2026-01-22
- [x] Phase 12: IP/CIDR Calculators — completed 2026-01-22
- [x] Phase 13: Network Speed/Latency — completed 2026-01-22
- [x] Phase 14: Global Search — completed 2026-01-22
- [x] Phase 15: Translation Audit — completed 2026-01-22
- [x] Phase 16: Translation Implementation — completed 2026-01-22

</details>

<details>
<summary>✅ v3.0 Calculator Expansion & Performance (Phases 17–24) — SHIPPED 2026-01-25</summary>

See `.planning/milestones/v3.0-ROADMAP.md` for full details.

- [x] Phase 17: Crypto/Blockchain Foundation — completed 2026-01-25
- [x] Phase 18: Real Estate Foundation — completed 2026-01-25
- [x] Phase 19: Cooking/Nutrition Foundation — completed 2026-01-25
- [x] Phase 20: Automotive Calculators — completed 2026-01-25
- [x] Phase 21: Code Splitting & Lazy Loading — completed 2026-01-25
- [x] Phase 24: Export Functionality — completed 2026-01-25

</details>

<details>
<summary>✅ v4.0 Security & Infrastructure (Phases 25–30) — SHIPPED 2026-01-25</summary>

See `.planning/milestones/v4.0-ROADMAP.md` for full details.

- [x] Phase 25: Security Hardening — completed 2026-01-25
- [x] Phase 26: Infrastructure Category Foundation — completed 2026-01-25
- [x] Phase 27: VM Storage Calculator — completed 2026-01-25
- [x] Phase 28: K8s Capacity Calculator — completed 2026-01-25
- [x] Phase 29: VMware Server Licensing — completed 2026-01-25
- [x] Phase 30: Virtualization Cost & Export — completed 2026-01-25

</details>

<details>
<summary>✅ v5.0 Calculator Expansion (Phases 31–36) — SHIPPED 2026-01-29</summary>

See `.planning/milestones/v5.0-ROADMAP.md` for full details.

- [x] Phase 31: Engineering Structural Calculators — completed 2026-01-29
- [x] Phase 32: Engineering Materials & Hydraulics — completed 2026-01-29
- [x] Phase 33: Chemistry Core Calculators — completed 2026-01-29
- [x] Phase 34: Chemistry Advanced Calculators — completed 2026-01-29
- [x] Phase 35: Hyper-V Multiplatform Calculators — completed 2026-01-29
- [x] Phase 36: Hypervisor Comparison — completed 2026-01-29

</details>

<details>
<summary>✅ v6.0 CPU Performance & Server Refresh (Phases 37–39) — SHIPPED 2026-02-23</summary>

See `.planning/milestones/v6.0-ROADMAP.md` for full details.

- [x] Phase 37: CPU Database Foundation (2/2 plans) — completed 2026-02-23
- [x] Phase 38: CPU Comparison Calculator (3/3 plans) — completed 2026-02-23
- [x] Phase 39: Server Refresh Calculator (3/3 plans) — completed 2026-02-23

</details>

---

<details>
<summary>✅ v7.0 Framework Migration (Phases 40–48) — SHIPPED 2026-02-26</summary>

See `.planning/milestones/v7.0-MILESTONE-AUDIT.md` for full details.

**Branch:** `maincd`
**Goal:** Adopt Raidy's proven building blocks — Vitest testing, Zod validation, react-error-boundary, Sonner toasts, DOMPurify, LZ-String URL compression, discriminated union result types, and i18n namespace restructure. All without replacing Next.js.

- [x] Phase 40: Vitest Foundation — **4 plans** — install Vitest, configure for Next.js, test 5 priority converters (COMPLETE)
  - [x] 40-01-PLAN.md — Install deps + vitest.config.ts + test-setup.ts + package.json scripts (Wave 1)
  - [x] 40-02-PLAN.md — Tests: BB Credit, Subnet, BMI converters (Wave 2, parallel)
  - [x] 40-03-PLAN.md — Tests: Compound Interest, Molecular Weight converters (Wave 2, parallel)
  - [x] 40-04-PLAN.md — Coverage gate: verify ≥75% on all 5 files, fix gaps, TypeScript + Biome clean (Wave 3)
- [x] Phase 41: Full Converter Test Coverage — **10 plans** — 2281 tests, 196 files, ≥75% global coverage (COMPLETE 2026-02-26)
  - [x] 41-01-PLAN.md — vitest.config.ts global threshold + cpu-types.ts exclude + static.yml CI gate (Wave 1)
  - [x] 41-02-PLAN.md — Math tests: 26 trivial/simple converters (Wave 2, parallel)
  - [x] 41-03-PLAN.md — Math tests: 13 medium/complex converters (Wave 2, parallel)
  - [x] 41-04-PLAN.md — Health tests: 27 remaining converters (Wave 2, parallel)
  - [x] 41-05-PLAN.md — Finance tests: 22 remaining converters (Wave 2, parallel)
  - [x] 41-06-PLAN.md — Photo + Video + Data + Physics + Music + Color tests (Wave 3, parallel)
  - [x] 41-07-PLAN.md — Web + Datetime + Automotive + Cooking tests (Wave 3, parallel)
  - [x] 41-08-PLAN.md — Network (remaining) + Crypto + Realestate tests (Wave 3, parallel)
  - [x] 41-09-PLAN.md — Chemistry + Engineering + Infrastructure tests (Wave 3, parallel)
  - [x] 41-10-PLAN.md — Global coverage verification + gap fixes (Wave 4)
- [x] Phase 42: Error Boundaries & Toasts — **5 plans** — react-error-boundary, Sonner, DOMPurify (R2.1–R2.6) (completed 2026-02-26)
  - [x] 42-01-PLAN.md — Install packages + mount Toaster in layout + i18n toast keys (Wave 1)
  - [x] 42-02-PLAN.md — CalculatorErrorBoundary + CalculatorErrorFallback + sanitize.ts utility (Wave 1, parallel)
  - [x] 42-03-PLAN.md — Toast feedback for all 7 clipboard copy sites (Wave 2, parallel)
  - [x] 42-04-PLAN.md — Toast feedback for CSV/PDF export + wire ErrorBoundary into ConverterLayout (Wave 2, parallel)
  - [x] 42-05-PLAN.md — Opt-in onCalculationError callback in createCalculatorStore (Wave 2, parallel)
- [x] Phase 43: Zod Input Validation — **5 plans** — zod@^4 installed, schemas for all 169 calculator inputs, Zod URL parsing, field-level error display (R3.1–R3.6) (completed 2026-02-26)
  - [x] 43-01-PLAN.md — Install zod + update createCalculatorStore schema? param + Zod URL helpers (Wave 1)
  - [x] 43-02-PLAN.md — Health schemas + wire errors into 28 health components (Wave 2, parallel)
  - [x] 43-03-PLAN.md — Finance schemas + wire errors into ~24 finance components (Wave 2, parallel)
  - [x] 43-04-PLAN.md — Math schemas + wire errors into ~38 math components (Wave 2, parallel)
  - [x] 43-05-PLAN.md — Remaining 12 categories schemas + errors + barrel index (Wave 3)
- [x] Phase 44: LZ-String URL Compression — **1 plan** — lz-string installed, ?z= compressed URL write/read paths, backward compat, round-trip tests (R4.1–R4.6) (completed 2026-02-26)
  - [x] 44-01-PLAN.md — Install lz-string + update url-sync.ts write path + update calculator-store.ts read path + fix Map bug + round-trip tests (Wave 1)
- [x] Phase 45: Discriminated Union Result Types — **5 plans** — CalculationResult<T> type, store factory adapter, all 91 components updated (R5.1–R5.5) (completed 2026-02-26)
  - [x] 45-01-PLAN.md — CalculationResult<T> type definition + createCalculatorStore adapter pattern + calculationError state (Wave 1)
  - [x] 45-02-PLAN.md — Health + math converters to CalculationResult + update their tests (Wave 2, parallel)
  - [x] 45-03-PLAN.md — Finance + datetime + automotive + cooking converters (recipe-scaler/food-cost throw→ok:false) + tests (Wave 2, parallel)
  - [x] 45-04-PLAN.md — Photo + video + data + physics + music + color + realestate + crypto converters + tests (Wave 2, parallel)
  - [x] 45-05-PLAN.md — Network + chemistry + engineering + infrastructure + web + component calculationError display + final quality gate (Wave 3)
- [x] Phase 46: i18n Namespace Restructure — **3 plans** — restructure locale JSON files, update namespace strings in ~210 source files, ADR-012 (R6.1–R6.5) (completed 2026-02-26)
  - [x] 46-01-PLAN.md — Migration script + restructure all 4 locale JSON files atomically (Wave 1)
  - [x] 46-02-PLAN.md — Update all source code namespace strings (converters→converter, categories→nav) (Wave 2)
  - [x] 46-03-PLAN.md — Full verification (build, i18n audit, zero MISSING_MESSAGE) + ADR-012 (Wave 3)
- [x] Phase 47: ADRs & CI Hardening — **3 plans** — ADRs 011–015, CI gate verification, developer docs update (R7.1–R7.4) (completed 2026-02-26)
  - [x] 47-01-PLAN.md — Write ADR-013 (error boundaries/toasts), ADR-014 (Zod validation), ADR-015 (LZ-String compression) (Wave 1)
  - [x] 47-02-PLAN.md — Update CODE_STYLE.md + ENGINEERING_PATTERNS.md with v7.0 patterns; verify CI gate (Wave 1, parallel)
  - [x] 47-03-PLAN.md — Write ADR-011 (Vitest strategy), ADR-012 (i18n namespace), verify all 5 ADRs present (Wave 2)
- [x] Phase 48: Branch Integration & Release v7.0 — regression verified, tag v7.0, GitHub Release published (completed 2026-02-26)
  - [x] 48-01-PLAN.md — Final regression: build, type-check, test:run, biome (Wave 1)
  - [x] 48-02-PLAN.md — Git tag v7.0 + GitHub Release published (Wave 2)
  - [x] 48-03-PLAN.md — Milestone archive: ROADMAP.md + STATE.md + v7.0-MILESTONE-AUDIT.md (Wave 3)

See `.planning/REQUIREMENTS.md` and `.planning/milestones/v7.0-MILESTONE-AUDIT.md` for full details.

</details>

---

_Next action: `/gsd:new-milestone` — plan the v8.0 milestone_
