# Phase 13: Network Speed/Latency Calculator - Research

**Researched:** 2026-01-21
**Domain:** Network Latency Unit Conversion, Throughput Calculations
**Confidence:** HIGH

## Summary

This research covers the implementation of two network performance calculators: a Ping/Latency Converter that converts between time units (s, ms, us, ns) commonly used in network latency measurements, and a Network Throughput Calculator that computes actual data transfer rates from file size and transfer time.

The existing codebase already has strong infrastructure for network calculations including TCP throughput (Mathis formula), bandwidth-delay product, and data bandwidth conversion. The new calculators complement these by providing simpler, user-friendly tools for quick latency unit conversion and basic throughput measurement.

**Primary recommendation:** Create two separate calculators following existing patterns - a simple unit converter for latency times and a throughput calculator that uses the existing BANDWIDTH_UNITS from data/bandwidth.ts for output formatting.

## Standard Stack

The established libraries/tools for this domain:

### Core

| Library    | Version    | Purpose                        | Why Standard        |
| ---------- | ---------- | ------------------------------ | ------------------- |
| TypeScript | 5.x        | Type-safe calculation logic    | Project standard    |
| Zustand    | (existing) | State management with URL sync | Established pattern |
| next-intl  | (existing) | Internationalization           | 4-locale support    |

### Supporting

| Library         | Version    | Purpose                    | When to Use                            |
| --------------- | ---------- | -------------------------- | -------------------------------------- |
| BANDWIDTH_UNITS | (existing) | Bandwidth unit definitions | Reuse from data/bandwidth.ts           |
| FILE_SIZE_UNITS | (existing) | File size unit definitions | Reuse from data/download-calculator.ts |

### Alternatives Considered

| Instead of          | Could Use                | Tradeoff                                  |
| ------------------- | ------------------------ | ----------------------------------------- |
| Custom time units   | moment.js/day.js         | Overkill for simple ns/us/ms/s conversion |
| New bandwidth units | Existing BANDWIDTH_UNITS | Already defined, consistent with codebase |

**Installation:**
No new packages required - pure TypeScript calculations using existing utilities.

## Architecture Patterns

### Recommended Project Structure

```
src/
├── lib/converters/network/
│   ├── latency-converter.ts     # NEW: Time unit conversion for latency
│   ├── throughput-calculator.ts # NEW: Calculate throughput from size/time
│   ├── tcp-throughput.ts        # EXISTING: Mathis formula calculator
│   ├── bandwidth-delay-product.ts # EXISTING: BDP calculator
│   └── types.ts                 # EXTEND: Add new result interfaces
├── stores/
│   ├── latency-converter-store.ts   # NEW: Latency converter state
│   └── throughput-calculator-store.ts # NEW: Throughput calculator state
└── app/[locale]/network/
    ├── latency-converter/           # NEW: Ping/Latency Converter page
    │   ├── page.tsx
    │   └── latency-converter.tsx
    └── throughput-calculator/       # NEW: Network Throughput Calculator page
        ├── page.tsx
        └── throughput-calculator.tsx
```

### Pattern 1: Latency Unit Conversion

**What:** Convert between time units (s, ms, us, ns) bidirectionally
**When to use:** User enters ping time in one unit, sees conversions to all units
**Example:**

```typescript
// Source: Standard SI time unit conversions
export interface LatencyUnit {
  id: string;
  name: string;
  abbreviation: string;
  nanoseconds: number; // Base unit for precision
}

export const LATENCY_UNITS: LatencyUnit[] = [
  { id: "s", name: "Seconds", abbreviation: "s", nanoseconds: 1e9 },
  { id: "ms", name: "Milliseconds", abbreviation: "ms", nanoseconds: 1e6 },
  { id: "us", name: "Microseconds", abbreviation: "μs", nanoseconds: 1e3 },
  { id: "ns", name: "Nanoseconds", abbreviation: "ns", nanoseconds: 1 },
];

export interface LatencyConversion {
  unit: LatencyUnit;
  value: number;
  formatted: string;
}

export interface LatencyResult {
  nanoseconds: number;
  conversions: LatencyConversion[];
  category: string; // "ultra-low", "low", "moderate", "high"
  typicalUseCase: string;
}

export function convertLatency(
  value: number,
  fromUnit: string
): LatencyResult | null {
  if (value <= 0) return null;

  const sourceUnit = LATENCY_UNITS.find((u) => u.id === fromUnit);
  if (!sourceUnit) return null;

  const nanoseconds = value * sourceUnit.nanoseconds;

  const conversions: LatencyConversion[] = LATENCY_UNITS.map((unit) => {
    const converted = nanoseconds / unit.nanoseconds;
    return {
      unit,
      value: converted,
      formatted: formatLatencyValue(converted),
    };
  });

  return {
    nanoseconds,
    conversions,
    category: categorizeLatency(nanoseconds),
    typicalUseCase: getTypicalUseCase(nanoseconds),
  };
}
```

### Pattern 2: Throughput Calculation

**What:** Calculate data transfer rate from size and time
**When to use:** User measures actual transfer, wants throughput in standard units
**Example:**

```typescript
// Source: Throughput = Data Size / Time
import { BANDWIDTH_UNITS } from "@/lib/converters/data/bandwidth";
import { FILE_SIZE_UNITS } from "@/lib/converters/data/download-calculator";

export interface ThroughputInput {
  dataSize: number;
  dataSizeUnit: string; // B, KB, MB, GB, TB
  transferTime: number;
  transferTimeUnit: string; // s, ms
}

export interface ThroughputResult {
  bitsPerSecond: number;
  bytesPerSecond: number;
  conversions: Array<{
    unit: string;
    value: number;
    formatted: string;
  }>;
  steps: string[];
  comparison: string; // Compare to common speeds
}

export function calculateThroughput(
  input: ThroughputInput
): ThroughputResult | null {
  const { dataSize, dataSizeUnit, transferTime, transferTimeUnit } = input;

  if (dataSize <= 0 || transferTime <= 0) return null;

  const sizeUnit = FILE_SIZE_UNITS.find((u) => u.id === dataSizeUnit);
  const steps: string[] = [];

  // Convert to bytes
  const totalBytes = dataSize * (sizeUnit?.bytes ?? 1);
  steps.push(
    `Data size: ${dataSize} ${dataSizeUnit} = ${totalBytes.toLocaleString()} bytes`
  );

  // Convert time to seconds
  const timeInSeconds =
    transferTimeUnit === "ms" ? transferTime / 1000 : transferTime;
  steps.push(
    `Transfer time: ${transferTime} ${transferTimeUnit} = ${timeInSeconds} seconds`
  );

  // Calculate throughput
  const bytesPerSecond = totalBytes / timeInSeconds;
  const bitsPerSecond = bytesPerSecond * 8;
  steps.push(
    `Throughput: ${totalBytes} bytes / ${timeInSeconds} s = ${bytesPerSecond.toFixed(
      2
    )} B/s`
  );
  steps.push(`           = ${bitsPerSecond.toFixed(2)} bits/second`);

  // Convert to all bandwidth units
  const conversions = BANDWIDTH_UNITS.map((unit) => ({
    unit: unit.name,
    value: bitsPerSecond / unit.bitsPerSecond,
    formatted: formatBandwidthValue(bitsPerSecond / unit.bitsPerSecond),
  }));

  return {
    bitsPerSecond,
    bytesPerSecond,
    conversions,
    steps,
    comparison: getSpeedComparison(bitsPerSecond),
  };
}
```

### Pattern 3: Zustand Store with URL Sync (existing pattern)

**What:** State management with URL synchronization for shareability
**When to use:** All calculator stores
**Example:**

```typescript
// Source: Existing pattern from cidr-range-store.ts
export const useLatencyConverterStore = create<LatencyConverterState>()(
  createUrlSyncMiddleware<LatencyConverterState>({
    enabled: true,
    debounceMs: 300,
    selectState: (state) => ({
      value: state.value,
      unit: state.unit,
    }),
  })((set, get) => ({
    value: "",
    unit: "ms",
    result: null,
    error: null,

    setValue: (value: string) => {
      set({ value, error: null });
      // Auto-calculate on valid input
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue > 0) {
        setTimeout(() => get().calculate(), 0);
      }
    },

    setUnit: (unit: string) => {
      set({ unit });
      // Re-calculate if value exists
      const { value } = get();
      if (value) {
        setTimeout(() => get().calculate(), 0);
      }
    },

    calculate: () => {
      const { value, unit } = get();
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue <= 0) {
        set({ result: null, error: null });
        return;
      }
      try {
        const result = convertLatency(numValue, unit);
        set({ result, error: null });
      } catch (err) {
        set({ result: null, error: "Invalid input" });
      }
    },

    reset: () => set({ value: "", unit: "ms", result: null, error: null }),
  }))
);
```

### Anti-Patterns to Avoid

- **Floating-point precision issues:** Use appropriate rounding for display, not calculations
- **Inconsistent unit naming:** Reuse existing BANDWIDTH_UNITS for output consistency
- **Missing step-by-step output:** Include calculation steps for educational value

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem                   | Don't Build             | Use Instead                                 | Why                                      |
| ------------------------- | ----------------------- | ------------------------------------------- | ---------------------------------------- |
| Bandwidth unit conversion | Custom unit list        | BANDWIDTH_UNITS from data/bandwidth.ts      | Already defined, tested, consistent      |
| File size conversion      | Custom byte multipliers | FILE_SIZE_UNITS from download-calculator.ts | Already defined, handles binary prefixes |
| Number formatting         | Custom format logic     | Existing formatNumber patterns              | Consistent with other calculators        |
| URL state sync            | Manual URL parsing      | createUrlSyncMiddleware                     | Established middleware pattern           |

**Key insight:** The codebase already has well-tested unit definitions and formatting utilities. New calculators should compose existing functions rather than reimplementing.

## Common Pitfalls

### Pitfall 1: Floating-Point Precision in Nanoseconds

**What goes wrong:** Converting 1 second shows as 999999999.9999999 nanoseconds
**Why it happens:** JavaScript floating-point representation
**How to avoid:** Round display values appropriately; use integer nanoseconds as base unit
**Warning signs:** Results showing many decimal places or .9999 patterns

### Pitfall 2: Bits vs Bytes Confusion

**What goes wrong:** Showing 8x wrong throughput values
**Why it happens:** Forgetting to multiply/divide by 8 when converting
**How to avoid:** Always be explicit in variable names (bitsPerSecond vs bytesPerSecond)
**Warning signs:** Results that are exactly 8x off from expected

### Pitfall 3: SI vs Binary Prefixes

**What goes wrong:** Using 1000 KB = 1 MB vs 1024 KB = 1 MB inconsistently
**Why it happens:** Network uses SI (1000), storage uses binary (1024)
**How to avoid:** Use existing FILE_SIZE_UNITS (binary) and BANDWIDTH_UNITS (SI decimal)
**Warning signs:** Slight percentage differences in conversions

### Pitfall 4: Time Unit Display for Microseconds

**What goes wrong:** Using "us" instead of proper "μs" symbol
**Why it happens:** ASCII keyboard limitations
**How to avoid:** Use proper Unicode μ (U+03BC) in display, "us" for URL/input
**Warning signs:** UI showing "us" instead of "μs"

### Pitfall 5: Very Large/Small Values

**What goes wrong:** Showing "1e+12" or "0.000000001" as results
**Why it happens:** Not handling extreme value ranges
**How to avoid:** Use exponential notation for extreme values, or auto-select appropriate unit
**Warning signs:** Unreadable numbers in output

## Code Examples

Verified patterns from existing codebase and standards:

### Latency Categories and Typical Use Cases

```typescript
// Source: Network engineering best practices, data streaming references
function categorizeLatency(nanoseconds: number): string {
  const milliseconds = nanoseconds / 1e6;

  if (milliseconds < 1) return "ultra-low"; // < 1ms: same datacenter
  if (milliseconds < 20) return "low"; // 1-20ms: same region
  if (milliseconds < 100) return "moderate"; // 20-100ms: cross-region
  return "high"; // > 100ms: intercontinental
}

function getTypicalUseCase(nanoseconds: number): string {
  const milliseconds = nanoseconds / 1e6;

  if (milliseconds < 0.001) return "Same rack in datacenter";
  if (milliseconds < 0.5) return "Same datacenter, different rack";
  if (milliseconds < 5) return "Same city/region";
  if (milliseconds < 50) return "Cross-country";
  if (milliseconds < 150) return "Cross-ocean";
  return "Satellite or heavily congested network";
}
```

### Typical Latency Reference Values

```typescript
// Source: Network latency engineering guides
export const LATENCY_REFERENCES = [
  { name: "L1 cache reference", ns: 0.5 },
  { name: "L2 cache reference", ns: 7 },
  { name: "Main memory reference", ns: 100 },
  { name: "SSD read", ns: 150_000 }, // 150 μs
  { name: "LAN round trip", ns: 500_000 }, // 500 μs
  { name: "HDD seek", ns: 10_000_000 }, // 10 ms
  { name: "US coast-to-coast round trip", ns: 150_000_000 }, // 150 ms
];
```

### Speed Comparison Utility

```typescript
// Source: Common network speed references
const SPEED_REFERENCES = [
  { name: "3G Mobile", bps: 3_000_000 },
  { name: "4G LTE", bps: 25_000_000 },
  { name: "5G", bps: 100_000_000 },
  { name: "Fast Broadband", bps: 100_000_000 },
  { name: "Gigabit Fiber", bps: 1_000_000_000 },
  { name: "10 Gigabit", bps: 10_000_000_000 },
];

function getSpeedComparison(bps: number): string {
  // Find closest reference
  const sorted = SPEED_REFERENCES.sort(
    (a, b) => Math.abs(a.bps - bps) - Math.abs(b.bps - bps)
  );
  const closest = sorted[0];
  const ratio = bps / closest.bps;

  if (ratio > 0.9 && ratio < 1.1) {
    return `Approximately ${closest.name} speed`;
  } else if (ratio < 1) {
    return `About ${(ratio * 100).toFixed(0)}% of ${closest.name}`;
  } else {
    return `About ${ratio.toFixed(1)}x ${closest.name}`;
  }
}
```

### Time Units for Transfer Input

```typescript
// Time units for throughput calculator input
export const TIME_UNITS = [
  { id: "s", name: "Seconds", abbreviation: "s", seconds: 1 },
  { id: "ms", name: "Milliseconds", abbreviation: "ms", seconds: 0.001 },
  { id: "min", name: "Minutes", abbreviation: "min", seconds: 60 },
  { id: "hr", name: "Hours", abbreviation: "hr", seconds: 3600 },
];
```

## UI Component Patterns

### Latency Converter UI Structure

```typescript
// Input section
<Card>
  <InputField
    id="latencyValue"
    label={t("latencyValue")}
    value={value}
    onChange={setValue}
    type="number"
    min="0"
    step="any"
  />
  <SelectField
    id="latencyUnit"
    label={t("latencyUnit")}
    value={unit}
    onChange={setUnit}
    options={LATENCY_UNITS.map(u => ({ value: u.id, label: u.name }))}
  />
</Card>

// Results section
<Card>
  <ResultGrid results={result.conversions.map(c => ({
    label: c.unit.name,
    value: `${c.formatted} ${c.unit.abbreviation}`,
  }))} />
</Card>

// Context section (latency category)
<Card>
  <OutputDisplay label={t("category")} value={t(result.category)} />
  <OutputDisplay label={t("typicalUseCase")} value={result.typicalUseCase} />
</Card>
```

### Throughput Calculator UI Structure

```typescript
// Input section
<Card>
  <div className="grid grid-cols-2 gap-4">
    <InputField id="dataSize" label={t("dataSize")} ... />
    <SelectField id="dataSizeUnit" options={FILE_SIZE_UNITS} ... />
  </div>
  <div className="grid grid-cols-2 gap-4">
    <InputField id="transferTime" label={t("transferTime")} ... />
    <SelectField id="transferTimeUnit" options={TIME_UNITS} ... />
  </div>
</Card>

// Results section
<Card>
  <ResultGrid results={result.conversions.map(c => ({
    label: c.unit,
    value: c.formatted,
  }))} />
</Card>

// Comparison section
<Card>
  <OutputDisplay label={t("speedComparison")} value={result.comparison} />
</Card>

// Steps section (collapsible)
<Card>
  <Collapsible>
    <CollapsibleTrigger>{t("calculationSteps")}</CollapsibleTrigger>
    <CollapsibleContent>
      {result.steps.map((step, i) => <p key={i}>{step}</p>)}
    </CollapsibleContent>
  </Collapsible>
</Card>
```

## State of the Art

| Old Approach                | Current Approach          | When Changed    | Impact                               |
| --------------------------- | ------------------------- | --------------- | ------------------------------------ |
| Separate ping/latency tools | Integrated unit converter | Common practice | Single tool handles all time units   |
| Manual speed calculation    | Automated throughput calc | Always          | Users get instant results            |
| Single output format        | Multiple unit outputs     | Modern practice | Users see all relevant units at once |

**Related existing calculators:**

- `tcp-throughput.ts` - For theoretical TCP throughput with loss rate
- `bandwidth-delay-product.ts` - For BDP and window sizing
- `download-calculator.ts` - For estimating download time from speed

## Translation Keys Required

### Calculator-specific labels (calculator.network namespace)

```json
{
  "latencyValue": "Latency Value",
  "latencyUnit": "Unit",
  "ultraLow": "Ultra-low latency (<1ms)",
  "low": "Low latency (1-20ms)",
  "moderate": "Moderate latency (20-100ms)",
  "high": "High latency (>100ms)",
  "typicalUseCase": "Typical Use Case",
  "category": "Latency Category",
  "dataSize": "Data Transferred",
  "transferTime": "Transfer Time",
  "speedComparison": "Speed Comparison",
  "seconds": "Seconds",
  "milliseconds": "Milliseconds",
  "microseconds": "Microseconds",
  "nanoseconds": "Nanoseconds"
}
```

### Converter metadata (converters namespace)

```json
{
  "latency-converter": {
    "name": "Latency Converter",
    "description": "Convert between ping time units (seconds, milliseconds, microseconds, nanoseconds)",
    "metaDescription": "Convert network latency and ping times between seconds, milliseconds, microseconds, and nanoseconds"
  },
  "throughput-calculator": {
    "name": "Throughput Calculator",
    "description": "Calculate network throughput from data transferred and time",
    "metaDescription": "Calculate actual network throughput and data transfer speed from file size and transfer time"
  }
}
```

## Open Questions

Things that couldn't be fully resolved:

1. **Include picoseconds for latency?**

   - What we know: Some ultra-high-frequency applications use ps
   - What's unclear: Is this useful for typical users?
   - Recommendation: Start with ns as smallest unit, can add ps later if requested

2. **Include historical data transfer comparison?**

   - What we know: Users might want to compare "this would take X on dial-up"
   - What's unclear: Is this educational or just clutter?
   - Recommendation: Include speed comparison to common technologies, not historical

3. **Bidirectional throughput calculator?**
   - What we know: User has throughput, wants to know transfer time
   - What's unclear: Should this be same calculator or separate?
   - Recommendation: Keep calculators focused - download-calculator.ts already does time-from-speed

## Sources

### Primary (HIGH confidence)

- Existing codebase: `/src/lib/converters/data/bandwidth.ts` - BANDWIDTH_UNITS definitions
- Existing codebase: `/src/lib/converters/data/download-calculator.ts` - FILE_SIZE_UNITS
- Existing codebase: `/src/lib/converters/network/tcp-throughput.ts` - throughput patterns
- Existing codebase: `/src/stores/cidr-range-store.ts` - Zustand store pattern

### Secondary (MEDIUM confidence)

- [Wikipedia: Measuring network throughput](https://en.wikipedia.org/wiki/Measuring_network_throughput) - Throughput formulas
- [Wikipedia: Microsecond](https://en.wikipedia.org/wiki/Microsecond) - Time unit conversions
- [The Old New Thing: On using milliseconds as a measure of network latency](https://devblogs.microsoft.com/oldnewthing/20240206-00/?p=109365) - Latency precision considerations
- [StreamNative: Latency Numbers Every Data Streaming Engineer Should Know](https://streamnative.io/blog/latency-numbers-every-data-streaming-engineer-should-know) - Latency reference values

### Tertiary (LOW confidence)

- WebSearch results for network throughput calculation patterns

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH - using existing codebase patterns and utilities
- Architecture: HIGH - follows established network calculator patterns exactly
- Pitfalls: HIGH - based on JavaScript numeric precision and unit conversion standards
- Time unit conversions: HIGH - SI standard unit conversions

**Research date:** 2026-01-21
**Valid until:** 90+ days (stable domain, standard unit conversions)
