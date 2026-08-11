# Roadmap: Converty v6.0 — CPU Performance & Server Refresh

**Current milestone:** v6.0
**Status:** In progress
**Phases:** 37-39

## Overview

| Phase | Name | Status |
|-------|------|--------|
| 37 | 2/2 | Complete    | 2026-02-23 | 38 | 3/3 | Complete    | 2026-02-23 | 39 | Server Refresh Calculator | Not started |

---

### Phase 37: CPU Database Foundation

**Goal:** A curated, authoritative CPU data file is in place and the category/registry scaffolding is wired so both downstream calculators can be built without touching infrastructure again.
**Depends on:** v5.0 infrastructure patterns (established calculator factory, registry, i18n patterns)
**Requirements:** CPUDB-01, CPUDB-02, CPUDB-03, CPUDB-04
**Plans:** 2/2 plans complete

**Success Criteria:**
1. User visiting the infrastructure category sees CPU-related calculators listed (registry entry exists and renders)
2. The JSON data file contains at least one current Intel Xeon Scalable, one AMD EPYC Genoa/Turin, one legacy-gen CPU (Cascade Lake/Ice Lake/Milan/Rome), and one ARM/Ampere entry — each with SPECint2017 base/peak, cores, TDP, socket type, vendor, and generation fields
3. Translation keys for the CPU category scaffold exist in all 4 locales (en, fr, de, it) with no MISSING_MESSAGE errors at build time
4. The data file passes TypeScript strict type checking with a defined CpuEntry interface (no any types)

Plans:
- [ ] 37-01-PLAN.md — CPU data file + TypeScript types (CpuEntry interface, curated JSON with all 4 families)
- [ ] 37-02-PLAN.md — Registry entries + category scaffolding + i18n translations (en/fr/de/it)

---

### Phase 38: CPU Comparison Calculator

**Goal:** Users can select 2 to 4 CPUs from the curated database, see side-by-side SPECint2017 scores, performance-per-core, performance-per-watt, and the sizing ratio between any two — with the ability to filter by vendor and generation.
**Depends on:** Phase 37 (CPU data file and registry)
**Requirements:** CPUCMP-01, CPUCMP-02, CPUCMP-03, CPUCMP-04, CPUCMP-05, CPUCMP-06
**Plans:** 3/3 plans complete

**Success Criteria:**
1. User can open the CPU filter panel, select "AMD" and "Current Gen", and the CPU dropdown narrows to matching CPUs only
2. User can select 2 CPUs and immediately see both SPECint2017 base and peak scores displayed side by side
3. User can see performance-per-core (SPECint / core count) and performance-per-watt (SPECint / TDP) calculated and displayed for each selected CPU
4. User can see a sizing ratio that states "N units of CPU A are needed to match CPU B" derived from their SPECint scores
5. User can select up to 4 CPUs and all comparison columns render without layout breakage

Plans:
- [ ] 38-01-PLAN.md — Converter logic: pure functions for perf/core, perf/watt, sizing ratio, vendor/generation filtering
- [ ] 38-02-PLAN.md — CPU Comparison Calculator component + page: multi-select, filter panel, results table, URL state sync
- [ ] 38-03-PLAN.md — i18n completion (all 4 locales) + type-check + build verification

---

### Phase 39: Server Refresh Calculator

**Goal:** Users can model an entire server fleet refresh — entering their existing fleet configuration, choosing a target CPU, and immediately seeing how many new servers are needed to match performance, with headroom buffer, chassis/socket constraints, power budget analysis, and a delta summary.
**Depends on:** Phase 37 (CPU data file), Phase 38 (comparison patterns)
**Requirements:** REFRESH-01, REFRESH-02, REFRESH-03, REFRESH-04, REFRESH-05, REFRESH-06, REFRESH-07
**Plans:** 3/3 plans complete

**Success Criteria:**
1. User can enter an old fleet (CPU model, sockets per server, server count) and select a target new CPU, then see the minimum new server count needed to match or exceed the old fleet's total SPECint throughput
2. User can set a headroom buffer (e.g., 25%) and see the new server count increase to cover projected growth
3. User can apply a chassis constraint (1U single-socket, 2U dual-socket) and see the result update to reflect the socket limit per chassis
4. User can enter a watts-per-rack power budget and see how many new servers fit within that power envelope alongside how many racks are needed
5. User can see a summary table comparing old fleet vs new fleet: total servers, total cores, total TDP (watts), and the delta for each

Plans:
- [ ] 39-01-PLAN.md — Converter logic (fleet throughput, headroom, chassis constraints, power budget)
- [ ] 39-02-PLAN.md — Refresh UI component (fleet input, target selector, constraint controls, summary table)
- [ ] 39-03-PLAN.md — i18n completion + URL state sync + build verification

---

*Last updated: 2026-02-23 — Phase 39 planned (3 plans, Wave 1-2-3 sequential)*
