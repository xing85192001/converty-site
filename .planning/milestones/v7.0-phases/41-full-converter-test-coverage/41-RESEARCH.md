# Phase 41: Full Converter Test Coverage - Research

**Researched:** 2026-02-26
**Domain:** Vitest unit testing — bulk coverage expansion across 19 converter categories
**Confidence:** HIGH

---

## Summary

Phase 40 established Vitest with 66 tests across 5 priority converters at ≥75% coverage, using per-file glob thresholds in `vitest.config.ts`. Phase 41 must extend coverage to the remaining ~159 converter files across 19 categories, enforce a global 75% threshold on the entire `src/lib/converters/**` tree, and add `npm run test:run` as a CI gate in `.github/workflows/static.yml`.

The key architectural insight is that the Phase 40 approach — per-file explicit thresholds — does NOT scale to 164 files. The correct strategy for Phase 41 is a single global threshold block covering the entire `src/lib/converters/**` pattern. This runs after all tests and measures aggregate coverage, which is the right instrument for "≥75% across all converters." Individual files that are hard to reach 75% on (data-lookup-only files, thin wrappers) are acceptable as long as the aggregate meets the threshold.

The second key insight is that 19 categories vary enormously in testability: trivial math functions (area, percentage, fraction) achieve 90%+ coverage with 3-5 tests each, while complex parsers (formula-parser, stoichiometry, equation-parser), data-importing converters (cpu-comparison, server-refresh, ph-calculator), and Intl-dependent converters (time-zone) need more careful test design.

**Primary recommendation:** Replace per-file thresholds with a single global `lines: 75, functions: 75, branches: 75, statements: 75` threshold in `vitest.config.ts`, retain per-file overrides for the 5 Phase 40 files, write ~350-450 new tests across all categories, and add a single `npm run test:run` step in `static.yml` before the `Build` step.

---

## Phase Requirements

<phase_requirements>

| ID | Description | Research Support |
|----|-------------|-----------------|
| R1.6 | Unit tests for all remaining converters in `src/lib/converters/` (≥75% coverage) | Complete file inventory with complexity classification; test strategy per category; vitest.config.ts global threshold change |
| R1.7 | CI pipeline (`static.yml`) includes `npm test` gate before build step | Exact insertion point in static.yml documented; correct command is `npm run test:run` not `npm test` (interactive mode) |

</phase_requirements>

---

## Complete Converter File Inventory

### Files ALREADY TESTED (Phase 40 — skip these)

| File | Tests | Coverage |
|------|-------|----------|
| `network/bb-credit-calculator.ts` | 12 tests | 100/83/100/100 |
| `network/subnet-calculator.ts` | 14 tests | 92/75/100/92 |
| `health/bmi.ts` | 11 tests | 81/76/100/82 |
| `finance/compound-interest.ts` | 16 tests | 97/85/100/97 |
| `chemistry/molecular-weight.ts` | 13 tests | 97/87/100/97 |

### EXCLUDED files (vitest.config.ts already excludes index.ts and types.ts)

These are always excluded from coverage — do NOT write tests for them:
- All `index.ts` files (re-exports only)
- All `types.ts` files (type definitions only)

---

### Category-by-Category Inventory

**math/** (39 files, 38 testable after excluding index.ts)

| File | Complexity | Notes |
|------|-----------|-------|
| `area.ts` | TRIVIAL | Shape area formulas, switch modes |
| `average.ts` | TRIVIAL | Mean, median, mode |
| `basic-calculator.ts` | TRIVIAL | +/-/×/÷ |
| `big-number.ts` | SIMPLE | Large integer arithmetic |
| `binary.ts` | SIMPLE | Base conversions (dec/bin/hex/oct) |
| `circle.ts` | TRIVIAL | Circumference, area from radius |
| `confidence-interval.ts` | MEDIUM | Stats formula, z-table lookup |
| `distance.ts` | TRIVIAL | Euclidean/Manhattan/Haversine |
| `exponent.ts` | TRIVIAL | Power and root operations |
| `factor.ts` | SIMPLE | Factorization |
| `fraction.ts` | MEDIUM | GCD-based simplification |
| `gcd-lcm.ts` | SIMPLE | Euclid's algorithm |
| `half-life.ts` | TRIVIAL | Exponential decay |
| `hex.ts` | SIMPLE | Hex/dec/bin conversions |
| `logarithm.ts` | TRIVIAL | log base n |
| `long-division.ts` | MEDIUM | Step-by-step long division |
| `matrix.ts` | COMPLEX | Add/subtract/multiply/transpose/det/inverse — multiple modes, recursive |
| `number-sequence.ts` | MEDIUM | Arithmetic/geometric sequences |
| `p-value.ts` | MEDIUM | Statistical p-value calculation |
| `percent-error.ts` | TRIVIAL | ((measured-actual)/actual)×100 |
| `percentage.ts` | SIMPLE | percentOf/whatPercent/percentChange/percentDifference modes |
| `permutation-combination.ts` | SIMPLE | nPr and nCr formulas |
| `prime-factorization.ts` | MEDIUM | Sieve or trial division |
| `probability.ts` | MEDIUM | Basic probability calculations |
| `pythagorean.ts` | TRIVIAL | a²+b²=c² |
| `quadratic.ts` | SIMPLE | Discriminant, real/complex roots |
| `random-number.ts` | SIMPLE | Range validation + return |
| `ratio.ts` | SIMPLE | Ratio simplification |
| `root.ts` | TRIVIAL | nth root |
| `rounding.ts` | TRIVIAL | Round/floor/ceil/truncate |
| `sample-size.ts` | MEDIUM | Statistical sample size formula |
| `scientific-notation.ts` | SIMPLE | Convert to/from scientific notation |
| `slope.ts` | SIMPLE | Slope, y-intercept, point-slope form |
| `standard-deviation.ts` | MEDIUM | Population and sample std dev |
| `statistics.ts` | MEDIUM | Full descriptive stats suite |
| `surface-area.ts` | TRIVIAL | Shape surface areas |
| `triangle.ts` | MEDIUM | Laws of sines/cosines |
| `volume.ts` | TRIVIAL | 3D shape volumes |
| `z-score.ts` | TRIVIAL | (x-μ)/σ |

**health/** (28 files, 27 testable after excluding index.ts, bmi.ts already done)

| File | Complexity | Notes |
|------|-----------|-------|
| `army-body-fat.ts` | SIMPLE | Army tape method, circumference ratios |
| `bac-calculator.ts` | SIMPLE | Widmark formula |
| `body-fat.ts` | SIMPLE | Multiple formulas (Jackson-Pollock, Navy) |
| `body-surface-area.ts` | TRIVIAL | Mosteller formula |
| `body-type-calculator.ts` | SIMPLE | WHR-based classification |
| `bmr-calculator.ts` | SIMPLE | Mifflin-St Jeor, Harris-Benedict |
| `calorie-calculator.ts` | SIMPLE | TDEE × goal modifier |
| `calories-burned.ts` | SIMPLE | MET × weight × duration |
| `carb-calculator.ts` | SIMPLE | Macro gram calc |
| `corpulence.ts` | TRIVIAL | Ponderal index |
| `fat-intake-calculator.ts` | SIMPLE | Fat grams from calories |
| `gfr-calculator.ts` | MEDIUM | CKD-EPI equation, multiple modes |
| `healthy-weight-calculator.ts` | SIMPLE | BMI range to weight range |
| `ideal-weight.ts` | SIMPLE | Devine/Robinson/Miller formulas |
| `lean-body-mass.ts` | SIMPLE | Boer formula |
| `macro-calculator.ts` | SIMPLE | Protein/carb/fat from TDEE |
| `one-rep-max.ts` | SIMPLE | Epley/Brzycki formulas |
| `ovulation-calculator.ts` | MEDIUM | Date arithmetic, fertile window |
| `pace-calculator.ts` | SIMPLE | Distance/time to pace |
| `period-calculator.ts` | MEDIUM | Date arithmetic, cycle prediction |
| `pregnancy-due-date.ts` | MEDIUM | Naegele's rule, Date arithmetic |
| `pregnancy-weight-gain.ts` | SIMPLE | BMI-based weight gain guidelines |
| `protein-calculator.ts` | SIMPLE | g/kg × weight |
| `sleep-calculator.ts` | MEDIUM | Sleep cycle timing |
| `target-heart-rate.ts` | SIMPLE | Karvonen formula |
| `tdee-calculator.ts` | SIMPLE | BMR × activity factor |
| `water-intake-calculator.ts` | SIMPLE | Weight-based water intake |

**finance/** (23 files, 22 testable, compound-interest.ts already done)

| File | Complexity | Notes |
|------|-----------|-------|
| `annuity-calculator.ts` | MEDIUM | Present/future value of annuity |
| `auto-loan.ts` | SIMPLE | Monthly payment formula |
| `bond-calculator.ts` | MEDIUM | Yield, price, duration |
| `break-even.ts` | SIMPLE | Fixed/(price-variable) |
| `credit-card.ts` | MEDIUM | Min payment, payoff time |
| `currency.ts` | SIMPLE | Rate conversion (static rates) |
| `debt-payoff.ts` | MEDIUM | Amortization schedule |
| `discount.ts` | TRIVIAL | Original × (1-rate) |
| `down-payment.ts` | TRIVIAL | Price × percentage |
| `home-equity.ts` | SIMPLE | Value - mortgage balance |
| `inflation.ts` | SIMPLE | CPI adjustment formula |
| `ira-calculator.ts` | MEDIUM | IRA growth with contributions |
| `loan.ts` | SIMPLE | Monthly payment, total interest |
| `mortgage.ts` | MEDIUM | Amortization schedule |
| `personal-loan.ts` | SIMPLE | Monthly payment, APR |
| `profit-margin.ts` | TRIVIAL | (Revenue-Cost)/Revenue |
| `retirement.ts` | MEDIUM | Compound growth with contributions |
| `retirement-401k.ts` | MEDIUM | 401k with employer match |
| `roi.ts` | TRIVIAL | (Gain-Cost)/Cost |
| `savings-goal.ts` | MEDIUM | Time to goal with interest |
| `student-loan.ts` | MEDIUM | Income-based, standard repayment |
| `tip.ts` | TRIVIAL | Bill × tip% |

**photo/** (24 files, 23 testable after excluding index.ts)

| File | Complexity | Notes |
|------|-----------|-------|
| `advanced-dof.ts` | COMPLEX | Multi-factor DOF calculation |
| `aspect-fit.ts` | SIMPLE | Scale to fit within bounds |
| `aspect-ratio.ts` | SIMPLE | GCD-based ratio reduction |
| `circle-of-confusion.ts` | MEDIUM | Sensor-size dependent CoC |
| `composition.ts` | SIMPLE | Rule of thirds grid points |
| `depth-of-field.ts` | MEDIUM | DOF near/far/total |
| `diffraction.ts` | MEDIUM | Diffraction limit calc |
| `dof-table.ts` | MEDIUM | Hyperfocal table generation |
| `dpi.ts` | SIMPLE | Pixels/inch conversions |
| `focal-equivalent.ts` | SIMPLE | Crop factor × focal length |
| `golden-hour.ts` | COMPLEX | Sun angle-based golden hour, Date objects |
| `hyperfocal.ts` | MEDIUM | Hyperfocal distance formula |
| `image-filesize.ts` | SIMPLE | Pixels × bit depth |
| `light-ev.ts` | SIMPLE | EV calculation from aperture/shutter/ISO |
| `macro-diffraction.ts` | MEDIUM | Macro lens diffraction |
| `macro-dof.ts` | MEDIUM | Macro depth of field |
| `megapixel-aspects.ts` | SIMPLE | Crop and resize from megapixels |
| `megapixels.ts` | SIMPLE | W × H / 1M |
| `nd-filter.ts` | SIMPLE | Stops → exposure time |
| `portrait-distance.ts` | MEDIUM | Working distance calc |
| `spot-stars.ts` | MEDIUM | 500/600 rule for star photography |
| `star-trails.ts` | MEDIUM | Exposure time for trail length |
| `sun-position.ts` | COMPLEX | NOAA solar algorithms, date/lat/lng → altitude/azimuth; 16KB, heavy trig |
| `time-lapse.ts` | SIMPLE | Frame count, duration, interval |

**web/** (9 testable files after excluding index.ts)

| File | Complexity | Notes |
|------|-----------|-------|
| `csp.ts` | SIMPLE | String parsing/generation, no async |
| `emoji-chars.ts` | SIMPLE | Unicode codepoint helpers |
| `html-chars.ts` | SIMPLE | HTML entity lookup |
| `html-encoder.ts` | SIMPLE | Entity encoding/decoding |
| `https-check.ts` | NETWORK | Pure URL parsing — testable; real HTTPS check is async (skip) |
| `redirect-check.ts` | SIMPLE | `analyzeRedirectChain()` is pure function — testable |
| `spf-check.ts` | MEDIUM | SPF record string parser, pure function |
| `url-encoder.ts` | SIMPLE | encodeURIComponent wrapper |

**video/** (8 testable files after excluding index.ts)

| File | Complexity | Notes |
|------|-----------|-------|
| `audio-filesize.ts` | SIMPLE | Bitrate × duration |
| `common-bitrates.ts` | SIMPLE | Lookup table |
| `dcp-filesize.ts` | SIMPLE | Digital Cinema Package size |
| `frame-rate.ts` | SIMPLE | FPS conversions |
| `screen-size.ts` | SIMPLE | Diagonal/aspect from W×H |
| `video-file-size.ts` | SIMPLE | Bitrate × duration × container overhead |

**datetime/** (9 testable files after excluding index.ts)

| File | Complexity | Notes |
|------|-----------|-------|
| `age.ts` | MEDIUM | Date diff in years/months/days |
| `date.ts` | SIMPLE | Date formatting helpers |
| `day-counter.ts` | MEDIUM | Business days, weekday counting |
| `day-of-week.ts` | SIMPLE | Zeller's formula or Date API |
| `duration-converter.ts` | SIMPLE | Hours/min/sec conversions |
| `hours.ts` | SIMPLE | Decimal hours ↔ HH:MM |
| `time.ts` | SIMPLE | Time arithmetic |
| `time-duration.ts` | SIMPLE | Duration formatting |
| `time-zone.ts` | COMPLEX | Uses `Intl.DateTimeFormat` and `Intl.supportedValuesOf` — node environment supports both; test with known UTC offsets |

**network/** (9 testable files after excluding types.ts, plus 2 already done)

| File | Complexity | Notes |
|------|-----------|-------|
| `bandwidth-delay-product.ts` | SIMPLE | BDP = bandwidth × RTT |
| `cidr-range.ts` | MEDIUM | IP range from CIDR, uses ipaddr.js (throws) |
| `ip-classifier.ts` | MEDIUM | Private/public/loopback classification |
| `ip-parser.ts` | MEDIUM | Parse IPv4/IPv6, uses ipaddr.js |
| `latency-converter.ts` | SIMPLE | ms → μs → ns conversions |
| `subnetting.ts` | MEDIUM | VLSM subnetting, uses ipaddr.js |
| `supernetting.ts` | MEDIUM | Supernet calculation |
| `tcp-throughput.ts` | SIMPLE | TCP throughput formula |
| `throughput-calculator.ts` | SIMPLE | Various throughput calculations |

**chemistry/** (7 testable files after excluding index.ts/types.ts, molecular-weight.ts already done)

| File | Complexity | Notes |
|------|-----------|-------|
| `dilution.ts` | SIMPLE | C1V1=C2V2 |
| `equation-parser.ts` | COMPLEX | Chemical equation balancing parser |
| `formula-parser.ts` | COMPLEX | Recursive descent parser for formulas |
| `molarity.ts` | SIMPLE | n/V, M=mol/L |
| `periodic-table-lookup.ts` | SIMPLE | Lookup wrapper for periodic-table.json |
| `ph-calculator.ts` | COMPLEX | 8 modes, imports acids-bases.json |
| `stoichiometry.ts` | COMPLEX | Multi-step stoichiometry, uses formula-parser |

**infrastructure/** (10 testable files after excluding index.ts/types.ts)

| File | Complexity | Notes |
|------|-----------|-------|
| `cpu-comparison.ts` | MEDIUM | Imports cpu-database.json — no mock needed (same pattern as molecular-weight) |
| `cpu-types.ts` | NOTE | This is types — excluded by vitest.config.ts |
| `hyperv-consolidation.ts` | MEDIUM | VM consolidation arithmetic |
| `hypervisor-comparison.ts` | MEDIUM | Side-by-side hypervisor metrics |
| `k8s-capacity.ts` | MEDIUM | Pod/node capacity planning |
| `server-refresh.ts` | MEDIUM | Imports cpu-database.json |
| `server-virtualization.ts` | MEDIUM | VMs per host calculation |
| `virtualization-cost.ts` | MEDIUM | Licensing + hardware cost |
| `vm-storage.ts` | MEDIUM | IOPS and capacity planning |
| `vmware-licensing.ts` | MEDIUM | vSphere licensing math |
| `windows-licensing.ts` | MEDIUM | Windows Server license calculation |

**engineering/** (6 testable files after excluding index.ts/types.ts)

| File | Complexity | Notes |
|------|-----------|-------|
| `beam-deflection.ts` | COMPLEX | Structural beam formulas |
| `column-buckling.ts` | MEDIUM | Euler's critical load |
| `moment-of-inertia.ts` | MEDIUM | Cross-section inertia formulas |
| `pipe-flow.ts` | MEDIUM | Reynolds number, Darcy-Weisbach |
| `stress-strain.ts` | MEDIUM | Hooke's law, stress/strain |
| `unit-converter.ts` | SIMPLE | Unit conversion tables |

**automotive/** (3 testable files after excluding index.ts/types.ts)

| File | Complexity | Notes |
|------|-----------|-------|
| `fuel-efficiency.ts` | SIMPLE | MPG/L per 100km conversions |
| `maintenance-intervals.ts` | SIMPLE | Mileage/time-based intervals |
| `tire-sizing.ts` | MEDIUM | Aspect ratio, diameter, circumference |
| `vehicle-financing.ts` | MEDIUM | Auto loan with depreciation |

**cooking/** (4 testable files after excluding index.ts/types.ts)

| File | Complexity | Notes |
|------|-----------|-------|
| `cooking-units.ts` | SIMPLE | Cup/tbsp/tsp conversions |
| `food-cost.ts` | SIMPLE | Ingredient cost per serving |
| `nutrition-calculator.ts` | SIMPLE | Macro totals |
| `recipe-scaler.ts` | SIMPLE | Proportional scaling |

**crypto/** (4 testable files after excluding index.ts)

| File | Complexity | Notes |
|------|-----------|-------|
| `exchange-rate.ts` | SIMPLE | Rate multiplication (static rates) |
| `hash.ts` | SIMPLE | Pure hash utilities |
| `mining-profitability.ts` | MEDIUM | Hashrate/difficulty/reward calculation |
| `wallet-validator.ts` | COMPLEX | Imports `wallet-address-validator` npm package; TEST_ADDRESSES constant exported — use it directly |

**data/** (3 testable files after excluding index.ts)

| File | Complexity | Notes |
|------|-----------|-------|
| `bandwidth.ts` | SIMPLE | Bits/bytes per second |
| `data-size.ts` | SIMPLE | KB/MB/GB/TB conversions |
| `download-calculator.ts` | SIMPLE | File size / bandwidth |

**realestate/** (3 testable files, no index.ts to exclude)

| File | Complexity | Notes |
|------|-----------|-------|
| `mortgage-swiss.ts` | MEDIUM | Swiss mortgage with amortization |
| `property-valuation.ts` | MEDIUM | Cap rate, GRM |
| `rental-yield.ts` | SIMPLE | Annual rent / property value |

**physics/** (1 testable file)

| File | Complexity | Notes |
|------|-----------|-------|
| `speed.ts` | TRIVIAL | v = d/t conversions |

**music/** (1 testable file)

| File | Complexity | Notes |
|------|-----------|-------|
| `music/index.ts` | NOTE | If index.ts IS the only file, check if it exports functions; if yes, needs inclusion in coverage config override |

**color/** (1 testable file)

| File | Complexity | Notes |
|------|-----------|-------|
| `color/index.ts` | NOTE | Same as music — check if functions exported |

---

## Standard Stack

### Core (established in Phase 40)

| Library | Version | Purpose | Source |
|---------|---------|---------|--------|
| `vitest` | already installed | Test runner | Phase 40 |
| `@vitest/coverage-v8` | already installed | V8 coverage | Phase 40 |
| `vite-tsconfig-paths` | already installed | `@/` alias resolution | Phase 40 |

**No new packages required.** Phase 41 is purely test-writing work plus config changes.

---

## Architecture Patterns

### Pattern 1: vitest.config.ts — Replace Per-File with Global Threshold

**What:** The Phase 40 config has 5 explicit per-file threshold blocks. These cannot scale to 164 files. Replace with a single global threshold.

**Critical insight (from STATE.md Phase 40-04 decision):** The reason Phase 40 used per-file thresholds was that a global threshold FAILS when only 5 of 100+ files have tests — the untested files pull aggregate coverage to near 0%. In Phase 41, ALL files will have tests, so global threshold will work correctly.

**Recommended vitest.config.ts change:**

```typescript
// Source: vitest.config.ts (current Phase 40 config, to be replaced)
thresholds: {
  // Global threshold replaces per-file blocks
  lines: 75,
  functions: 75,
  branches: 75,
  statements: 75,
  // Keep per-file overrides for Phase 40 files as documentation (optional)
  // They are superseded by global when global is present
},
```

The global threshold applies to aggregate coverage across all included files. Per-file overrides can coexist for documentation purposes but the planner should decide whether to keep or remove them.

### Pattern 2: Test File Location Convention

All tests go under `src/__tests__/lib/converters/[category]/[filename].test.ts`, mirroring the source tree:

```
src/__tests__/lib/converters/
├── math/
│   ├── percentage.test.ts
│   ├── area.test.ts
│   └── ...
├── health/
│   ├── bmr-calculator.test.ts
│   └── ...
├── finance/
│   └── ...
└── (mirror converter directory structure)
```

### Pattern 3: Standard Test File Template

From the Phase 40 tests (verified working):

```typescript
// Source: existing Phase 40 tests in src/__tests__/lib/converters/
import { describe, expect, it } from "vitest";
import { calculateSomething } from "@/lib/converters/category/filename";

describe("calculateSomething", () => {
  describe("null returns for invalid input", () => {
    it("returns null for [specific invalid case]", () => {
      expect(calculateSomething({ ... })).toBeNull();
    });
  });

  describe("[happy path group]", () => {
    it("[specific behavior]", () => {
      const result = calculateSomething({ ... });
      expect(result).not.toBeNull();
      expect(result!.field).toBeCloseTo(expected, decimals);
    });
  });

  // For multiple modes — use it.each
  it.each(["mode1", "mode2", "mode3"] as const)(
    "handles %s mode without error",
    (mode) => {
      const result = calculateSomething({ mode, ... });
      expect(result).not.toBeNull();
    }
  );
});
```

### Pattern 4: Floating-Point Assertions

```typescript
// For financial values (large numbers): 0 decimal places
expect(result!.monthlyPayment).toBeCloseTo(1234.56, 0);

// For chemistry/physics (medium precision): 2 decimal places
expect(result!.molarMass).toBeCloseTo(18.02, 2);

// For percentages and ratios: 1-2 decimal places
expect(result!.percentage).toBeCloseTo(33.33, 1);

// For exact integers: use toBe
expect(result!.steps).toHaveLength(3);
```

### Pattern 5: Data-Importing Converters

Phase 40 established that `@/data/chemistry/periodic-table.json` loads correctly without mocking via `vite-tsconfig-paths`. The same pattern applies to all data-importing converters:

- `infrastructure/cpu-comparison.ts` → imports `@/lib/data/cpu-database.json`
- `infrastructure/server-refresh.ts` → imports `@/lib/data/cpu-database.json`
- `chemistry/ph-calculator.ts` → imports `@/data/chemistry/acids-bases.json`
- `chemistry/periodic-table-lookup.ts` → imports same periodic-table.json

**Action:** No mocking needed. Use real data. Assertions reference known database entries (e.g., specific CPU IDs like `"intel-xeon-platinum-8592plus"`).

### Pattern 6: External Package Converters

`crypto/wallet-validator.ts` imports `wallet-address-validator` (npm package). The file itself exports `TEST_ADDRESSES` constant with known valid/invalid addresses. Use those directly:

```typescript
import { validateWalletAddress, TEST_ADDRESSES } from "@/lib/converters/crypto/wallet-validator";

it("validates BTC genesis block address", () => {
  const result = validateWalletAddress(TEST_ADDRESSES.BTC.valid.P2PKH, "BTC");
  expect(result.isValid).toBe(true);
});
```

### Pattern 7: ipaddr.js-Using Network Converters

From STATE.md Phase 40-02: ipaddr.js throws for invalid IPs (does not return null). Tests for `cidr-range.ts`, `ip-classifier.ts`, `ip-parser.ts`, `subnetting.ts`, `supernetting.ts` MUST use `expect(() => fn(badInput)).toThrow()` for invalid IP cases.

### Pattern 8: Intl API in Node Environment

`datetime/time-zone.ts` uses `Intl.DateTimeFormat` and `Intl.supportedValuesOf`. Node.js 20 (CI uses v20, per static.yml) has full ICU data. Tests work without polyfills. Use fixed ISO datetime strings and known UTC-offset timezones (UTC, America/New_York, Europe/Paris).

### Pattern 9: Complex Parser Converters (chemistry)

`chemistry/formula-parser.ts`, `chemistry/equation-parser.ts`, and `chemistry/stoichiometry.ts` are recursive parsers. Testing strategy:

```typescript
// formula-parser.ts: test parseChemicalFormula directly
import { parseChemicalFormula } from "@/lib/converters/chemistry/formula-parser";

it("parses H2O correctly", () => {
  const result = parseChemicalFormula("H2O");
  expect(result.success).toBe(true);
  if (result.success) {
    expect(result.composition.H).toBe(2);
    expect(result.composition.O).toBe(1);
  }
});

it("returns error for unmatched parenthesis", () => {
  const result = parseChemicalFormula("Ca(OH2");
  expect(result.success).toBe(false);
});
```

### Pattern 10: Static.yml CI Gate Insertion

Current static.yml structure (from inspection):

```yaml
steps:
  - name: Checkout
  - name: Setup Node.js
  - name: Install dependencies
  - name: Type check        # ← npm run type-check
  - name: Lint              # ← npx biome check
  - name: Build             # ← npm run build  ← INSERT BEFORE THIS
  - name: Setup Pages
  - name: Upload artifact
```

**Insert after Lint, before Build:**

```yaml
      - name: Test
        run: npm run test:run
```

Use `npm run test:run` (not `npm test`) because `npm test` launches interactive watch mode in CI, which hangs the pipeline.

### Anti-Patterns to Avoid

- **Testing `index.ts` files:** Already excluded in vitest.config.ts — don't add them.
- **Over-mocking:** Do NOT mock `@/lib/data/cpu-database.json` or `@/data/chemistry/*.json`. Real data works and gives better integration confidence.
- **`any` in tests:** Project prohibits `any`. Use `result!.field` (non-null assertion) not `(result as any).field`.
- **Strict equality on floats:** Use `toBeCloseTo` not `toBe` for floating-point math results.
- **Interactive test command in CI:** `npm test` launches watch mode. Use `npm run test:run` in CI.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| IP address validation/parsing | Custom IP parser | `ipaddr.js` (already used in converters) | Edge cases with IPv6, CIDR |
| Wallet address validation | Custom regex | `wallet-address-validator` (already used) | Checksum algorithms, address formats |
| Float comparison | `===` equality | `toBeCloseTo(val, decimals)` | IEEE 754 float imprecision |
| Per-file thresholds for 164 files | 164 threshold blocks | Single global threshold | Unmaintainable, config explosion |

---

## Common Pitfalls

### Pitfall 1: Global Threshold Failing During Incremental Test Writing
**What goes wrong:** If you run `npm run test:coverage` with global threshold BEFORE all test files are written, files with 0% coverage still count against the global aggregate.
**Why it happens:** V8 instruments all `coverage.include` files regardless of test count.
**How to avoid:** Either write all test files in one phase (plan per category), OR add the global threshold ONLY at the end of the phase after all tests are written. During development, use `npm run test:run` (no coverage check) to verify tests pass.
**Warning signs:** Coverage check fails with "X% < 75%" on functions when you haven't written tests for that category yet.

### Pitfall 2: sun-position.ts Coverage Shortfall
**What goes wrong:** `sun-position.ts` is 16KB of NOAA solar algorithms with many calculation paths. Getting 75% branch coverage is difficult without testing polar day/night edge cases.
**Why it happens:** Many conditional branches for extreme latitudes, solstices, circumpolar conditions.
**How to avoid:** Test: (a) normal mid-latitude summer day, (b) winter day, (c) equatorial location, (d) polar latitude (expect null sunrise/sunset). Focus on line/statement coverage, accept lower branch coverage.

### Pitfall 3: time-zone.ts Intl.supportedValuesOf Availability
**What goes wrong:** Older Node.js versions don't support `Intl.supportedValuesOf`. CI uses Node.js 20 which supports it, but the function has an internal fallback anyway.
**Why it happens:** Platform ICU data availability.
**How to avoid:** Test `calculateTimeZone` function directly with hardcoded valid timezones. Don't test `getTimezoneOptions()` output exhaustively — just verify it returns an array with entries.

### Pitfall 4: Phase 40 Per-File Thresholds vs New Global Threshold
**What goes wrong:** If both per-file thresholds AND a global threshold exist in vitest.config.ts, Vitest applies BOTH. A file below global threshold fails even if it meets per-file threshold.
**Why it happens:** Vitest threshold system: global applies to all, per-file overrides specific files.
**How to avoid:** When adding global threshold, REMOVE or verify all 5 per-file blocks still pass at 75% (they do — Phase 40 confirmed coverage well above 75%).

### Pitfall 5: Mining Profitability Tests Use Stale Crypto Prices
**What goes wrong:** `mining-profitability.ts` may use fetched crypto prices. If it imports build-time JSON data, test assertions on specific dollar amounts will fail as data changes.
**Why it happens:** Build scripts fetch live crypto prices into JSON files.
**How to avoid:** Test ratio invariants (e.g., "more hashrate → more profitability") rather than exact dollar values. Or check if the function accepts prices as input parameters vs. importing them.

---

## Code Examples

### Global Threshold in vitest.config.ts

```typescript
// Source: vitest.config.ts (updated for Phase 41)
// Replace the existing per-file thresholds section with:
thresholds: {
  lines: 75,
  functions: 75,
  branches: 75,
  statements: 75,
},
```

### Trivial Converter Test Pattern (math/percentage.ts)

```typescript
// Source: pattern derived from existing Phase 40 tests
import { describe, expect, it } from "vitest";
import { calculatePercentage } from "@/lib/converters/math/percentage";

describe("calculatePercentage", () => {
  it("returns null for percentOf mode when value2 is 0", () => {
    expect(calculatePercentage({ mode: "percentOf", value1: 50, value2: 0 })).toBeNull();
  });

  it("calculates 50% of 200 = 100", () => {
    const result = calculatePercentage({ mode: "percentOf", value1: 50, value2: 200 });
    expect(result!.result).toBe(100);
  });

  it.each(["percentOf", "whatPercent", "percentChange", "percentDifference"] as const)(
    "handles %s mode",
    (mode) => {
      const result = calculatePercentage({ mode, value1: 25, value2: 100 });
      expect(result).not.toBeNull();
    }
  );
});
```

### Data-Importing Converter Test (infrastructure/cpu-comparison.ts)

```typescript
// Source: pattern from Phase 40-03 molecular-weight (no mock needed)
import { describe, expect, it } from "vitest";
import { calculateCpuComparison, getFilteredCpus } from "@/lib/converters/infrastructure/cpu-comparison";

describe("calculateCpuComparison", () => {
  it("returns null for fewer than 2 CPU IDs", () => {
    expect(calculateCpuComparison({ cpuIds: "intel-xeon-platinum-8592plus", vendor: "all", generation: "all" })).toBeNull();
  });

  it("returns comparison rows for 2 valid CPU IDs", () => {
    const result = calculateCpuComparison({
      cpuIds: "intel-xeon-platinum-8592plus,amd-epyc-9654",
      vendor: "all",
      generation: "all",
    });
    expect(result).not.toBeNull();
    expect(result!.rows).toHaveLength(2);
    expect(result!.rows[0].sizingRatioVsFirst).toBe(1.0);
  });
});

describe("getFilteredCpus", () => {
  it("returns all CPUs for 'all' vendor and generation", () => {
    const cpus = getFilteredCpus("all", "all");
    expect(cpus.length).toBeGreaterThan(0);
  });

  it("filters by vendor", () => {
    const intelCpus = getFilteredCpus("intel", "all");
    expect(intelCpus.every((c) => c.vendor === "intel")).toBe(true);
  });
});
```

### ipaddr.js Throw Pattern (network converters)

```typescript
// Source: STATE.md Phase 40-02 decision
import { describe, expect, it } from "vitest";
import { calculateCidrRange } from "@/lib/converters/network/cidr-range";

describe("calculateCidrRange", () => {
  it("throws for invalid CIDR notation", () => {
    expect(() => calculateCidrRange({ cidr: "not-valid" })).toThrow();
  });

  it("calculates IPv4 /24 network", () => {
    const result = calculateCidrRange({ cidr: "192.168.1.0/24" });
    expect(result).not.toBeNull();
  });
});
```

### Static.yml Test Gate

```yaml
# Source: .github/workflows/static.yml (current file inspected)
# Insert after "Lint" step, before "Build" step:
      - name: Test
        run: npm run test:run
```

---

## Wave Ordering (Priority for Planning)

The planner should order test-writing tasks by coverage-per-effort ratio:

| Wave | Categories | Files | Complexity | Strategy |
|------|-----------|-------|-----------|----------|
| Wave 1 | math (trivial+simple subset) | ~20 | LOW | 3-5 tests each, very fast |
| Wave 2 | health, finance | ~49 | LOW-MEDIUM | 5-8 tests each |
| Wave 3 | photo (simple subset), video, data, cooking, automotive, physics | ~35 | SIMPLE | 4-6 tests each |
| Wave 4 | web, network (remaining), datetime | ~25 | SIMPLE-MEDIUM | 5-8 tests each |
| Wave 5 | chemistry (remaining), infrastructure | ~17 | MEDIUM-COMPLEX | 8-12 tests each |
| Wave 6 | math (complex: matrix, statistics), photo (complex: sun-position), crypto, realestate, engineering | ~18 | COMPLEX | 10-15 tests each |
| Final | vitest.config.ts global threshold + static.yml CI gate | 2 files | CONFIG | 0 tests |

Total estimated tests: ~450-550 new tests across ~159 converter files.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Per-file 5-entry threshold block | Global threshold block | Phase 41 | Scales to 164 files without config explosion |
| No CI gate for tests | `npm run test:run` step in static.yml | Phase 41 | Build fails if any test fails or coverage drops |

---

## Open Questions

1. **music/index.ts and color/index.ts as sole converter files**
   - What we know: Both `music/` and `color/` have only an `index.ts` file
   - What's unclear: vitest.config.ts excludes `**/index.ts` — so these two categories have ZERO testable files, meaning coverage include for them is empty
   - Recommendation: Planner should verify whether calculation functions are exported from index.ts directly; if so, add `color/index.ts` and `music/index.ts` to a coverage include override OR leave them as exempt categories

2. **mining-profitability.ts data source**
   - What we know: Build script `fetch-mining-data.ts` generates a JSON file at build time
   - What's unclear: Whether `mining-profitability.ts` imports that JSON or takes prices as function inputs
   - Recommendation: Planner should inspect the file before writing tests; if it imports build-time JSON, test with relative invariants not absolute values

3. **infrastructure/cpu-types.ts exclusion**
   - What we know: `vitest.config.ts` excludes `**/types.ts` but `cpu-types.ts` is NOT named `types.ts`
   - What's unclear: `cpu-types.ts` contains only type definitions (interfaces/unions) — no functions to test
   - Recommendation: Add `src/lib/converters/infrastructure/cpu-types.ts` to the coverage `exclude` list in vitest.config.ts since it has no testable functions

---

## Sources

### Primary (HIGH confidence)

- Direct inspection of `vitest.config.ts` — verified per-file threshold structure
- Direct inspection of `.github/workflows/static.yml` — verified step order
- Direct inspection of all 164+ converter files via Glob + selective Read
- `.planning/phases/40-vitest-foundation/40-VERIFICATION.md` — Phase 40 outcomes
- `.planning/STATE.md` — all Phase 40 decisions (ipaddr.js throws, no-mock JSON, toBeCloseTo precision)
- Existing test files in `src/__tests__/lib/converters/` — verified test patterns

### Secondary (MEDIUM confidence)

- `CLAUDE.md` categories table — count of converters per category confirmed by direct file listing
- `src/lib/converters/CLAUDE.md` — converter file pattern (Input/Result/calculate/null return)

---

## Metadata

**Confidence breakdown:**
- File inventory: HIGH — directly listed all files via Glob
- Test patterns: HIGH — Phase 40 tests are verified working, same patterns apply
- vitest.config.ts strategy: HIGH — global vs per-file threshold behavior verified against Phase 40-04 decision
- CI integration: HIGH — static.yml directly inspected
- Complexity classification: MEDIUM — based on file sizes and pattern review, some files not fully read

**Research date:** 2026-02-26
**Valid until:** 2026-03-26 (stable domain — Vitest and converter architecture unlikely to change)
