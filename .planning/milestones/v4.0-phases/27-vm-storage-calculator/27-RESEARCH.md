# Phase 27: VM Storage Calculator - Research

**Researched:** 2026-01-25
**Domain:** VMware vSphere storage capacity planning
**Confidence:** HIGH

## Summary

Research focused on VMware vSphere ESX cluster storage capacity calculation formulas, provisioning models (thick vs thin), and the established calculator patterns in the Converty codebase. The VM Storage Calculator requires understanding VMware-specific storage overhead (swap files, snapshots, ESX installation) and over-subscription strategies.

The standard approach is to implement pure calculation functions in `src/lib/converters/infrastructure/` following the established pattern: typed input/result interfaces with a pure calculation function. UI components use the `createCalculatorStore` factory for Zustand state management with automatic URL synchronization. All calculations must include step-by-step breakdowns in a `steps` array for transparency.

VMware storage calculations involve multiple overhead factors: VM swap files (equal to configured RAM minus reservation), snapshot allocation (typically 10-30% of provisioned storage), thin provisioning over-subscription (allowing 20-50% over-allocation), configuration/log files (~0.25 GB per VM), and ESX installation overhead (~8 GB per host).

**Primary recommendation:** Follow the established calculator factory pattern with pure calculation functions. Implement VMware storage formulas from official documentation, validating against the reference tool at wintelguy.com. Use GB as primary unit for infrastructure calculations per Phase 26 decisions.

## Standard Stack

The established libraries/tools for this domain:

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 15.1.5 | Framework | Static export, established in codebase v1.0 |
| React | 19.0.0 | UI library | Component-based calculator UI |
| TypeScript | 5.7.3 | Type safety | Strict typing for calculation logic |
| Zustand | 5.0.3 | State management | Lightweight state with URL sync middleware |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| next-intl | 4.0.0-beta.9 | Internationalization | All user-facing text (4 locales: en, fr, de, it) |
| Tailwind CSS | 3.4.17 | Styling | Responsive calculator UI |
| Lucide React | 0.469.0 | Icons | Calculator category icons |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Zustand | Redux Toolkit | Zustand lighter, URL sync middleware already built |
| Pure functions | Class-based | Pure functions easier to test, framework-agnostic |

**Installation:**

```bash
# No new packages needed - all dependencies exist in project
npm install  # Uses existing package.json
```

## Architecture Patterns

### Recommended Project Structure

```
src/
├── lib/
│   └── converters/
│       └── infrastructure/
│           └── vm-storage.ts        # Pure calculation logic
├── stores/
│   └── vm-storage-store.ts          # Zustand store (auto-generated pattern)
├── app/
│   └── [locale]/
│       └── infrastructure/
│           └── vm-storage-calculator/
│               ├── page.tsx                      # Next.js page wrapper
│               └── vm-storage-calculator.tsx     # React calculator component
└── messages/
    ├── en.json                      # English translations
    ├── fr.json                      # French translations
    ├── de.json                      # German translations
    └── it.json                      # Italian translations
```

### Pattern 1: Pure Calculation Function

**What:** Calculation logic separated from UI, no side effects
**When to use:** All calculator implementations (established v1.0 pattern)
**Example:**

```typescript
// Source: Established pattern from src/lib/converters/health/bmi.ts

export interface VmStorageInput {
  vmConfigs: Array<{
    diskGb: number;
    ramGb: number;
    count: number;
  }>;
  includeSwapFiles: boolean;
  configLogGbPerVm: number;
  snapshotPercent: number;
  esxHosts: number;
  esxStorageGbPerHost: number;
  thinProvisioningPercent: number;
  growthPercent: number;
}

export interface VmStorageResult {
  totalProvisionedGb: number;
  usedDiskGb: number;
  overSubscribedGb: number;
  snapshotGb: number;
  swapGb: number;
  configLogGb: number;
  totalVmStorageGb: number;
  esxStorageGb: number;
  growthAllocationGb: number;
  totalRequiredGb: number;
  percentages: {
    usedDisk: number;
    snapshots: number;
    swap: number;
    configLog: number;
    totalVm: number;
    esx: number;
    growth: number;
  };
  steps: string[];
}

export function calculateVmStorage(input: VmStorageInput): VmStorageResult | null {
  // Validation
  if (input.vmConfigs.length === 0) return null;

  const steps: string[] = [];

  // Step 1: Calculate total provisioned disk
  const totalProvisionedGb = input.vmConfigs.reduce(
    (sum, config) => sum + config.diskGb * config.count,
    0
  );
  steps.push(`Total provisioned disk: ${totalProvisionedGb.toFixed(2)} GB`);

  // Step 2: Calculate used disk (with thin provisioning)
  const usedDiskGb = totalProvisionedGb * (1 - input.thinProvisioningPercent / 100);
  steps.push(`Used disk (${100 - input.thinProvisioningPercent}% utilization): ${usedDiskGb.toFixed(2)} GB`);

  // ... rest of calculations

  return {
    totalProvisionedGb,
    usedDiskGb,
    // ... all results
    steps,
  };
}
```

### Pattern 2: Zustand Store with URL Sync

**What:** Factory pattern for calculator state with automatic URL parameter synchronization
**When to use:** Every calculator (established v1.0 pattern)
**Example:**

```typescript
// Source: src/stores/calculator-store.ts factory

import { createCalculatorStore } from "@/stores";
import { calculateVmStorage } from "@/lib/converters/infrastructure/vm-storage";
import type { VmStorageInput, VmStorageResult } from "@/lib/converters/infrastructure/vm-storage";

export const useVmStorageStore = createCalculatorStore<VmStorageInput, VmStorageResult>({
  name: "vm-storage-calculator",
  initialValues: {
    vmConfigs: [
      { diskGb: 100, ramGb: 8, count: 10 },
      { diskGb: 200, ramGb: 16, count: 5 },
    ],
    includeSwapFiles: true,
    configLogGbPerVm: 0.25,
    snapshotPercent: 20,
    esxHosts: 3,
    esxStorageGbPerHost: 8,
    thinProvisioningPercent: 33,
    growthPercent: 30,
  },
  calculate: calculateVmStorage,
  syncUrl: true,
  debounceMs: 150,
});
```

### Pattern 3: Component Structure

**What:** Client component using store hook, translation hook, responsive layout
**When to use:** All calculator UI components
**Example:**

```typescript
// Source: Established pattern from existing calculators

"use client";

import { useTranslations } from "next-intl";
import { useVmStorageStore } from "@/stores/vm-storage-store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function VmStorageCalculator() {
  const t = useTranslations("converters.vm-storage-calculator");
  const { values, setValue, result } = useVmStorageStore();

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">{t("sections.input")}</h2>

        <div>
          <Label htmlFor="diskGb">{t("labels.diskGb")}</Label>
          <Input
            id="diskGb"
            type="number"
            value={values.vmConfigs[0].diskGb}
            onChange={(e) => {
              const newConfigs = [...values.vmConfigs];
              newConfigs[0].diskGb = parseFloat(e.target.value) || 0;
              setValue("vmConfigs", newConfigs);
            }}
          />
        </div>

        {/* More inputs */}
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">{t("sections.results")}</h2>

        {result && (
          <div className="space-y-2">
            <p>{t("results.totalRequired")}: {result.totalRequiredGb.toFixed(2)} GB</p>

            {/* Steps display */}
            <div className="mt-4">
              <h3 className="font-medium">{t("sections.steps")}</h3>
              <ol className="list-decimal list-inside space-y-1">
                {result.steps.map((step, i) => (
                  <li key={i} className="text-sm text-muted-foreground">{step}</li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

### Anti-Patterns to Avoid

- **Direct state mutation:** Always use `setValue()` or `setValues()` from store, never mutate `values` directly
- **Missing null checks:** Always check `if (result)` before rendering results
- **Hardcoded strings:** All user-facing text must use `t()` from `useTranslations()`
- **Ignored validation:** Return `null` from calculate function for invalid inputs, don't throw errors
- **Missing steps array:** Users expect to see calculation breakdown, always include `steps: string[]`

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| State management with URL sync | Custom URLSearchParams + useState | `createCalculatorStore` factory | Already handles URL sync, debouncing, SSR safety |
| Input validation | Custom validation logic | Return `null` from calculate function | Consistent error handling, simpler logic |
| Number parsing from inputs | `parseInt()` / `parseFloat()` | `parseFloat(value) \|\| 0` pattern | Handles empty strings, NaN cases |
| Translation management | String interpolation | `next-intl` with `useTranslations()` | Type-safe, locale-aware, established pattern |
| Responsive layouts | Custom media queries | Tailwind's `md:grid-cols-2` | Mobile-first, consistent with codebase |
| Unit conversion | Custom conversion functions | Established pattern in calculator logic | Reusable, tested, clear |

**Key insight:** The Converty codebase has mature patterns for calculator implementation. Don't create custom solutions for problems already solved by the `createCalculatorStore` factory, translation system, or established component patterns.

## Common Pitfalls

### Pitfall 1: Over-Provisioning Without Monitoring

**What goes wrong:** Thin provisioning allows over-subscription (allocating more storage than physically available), but if actual usage exceeds capacity, the entire storage system can halt or fail.
**Why it happens:** Users set high thin provisioning percentages without understanding actual VM disk usage patterns.
**How to avoid:**

- Default to conservative thin provisioning (20-30%, not 50%+)
- Include warning text in UI about monitoring requirements
- Show both provisioned and used capacity clearly
**Warning signs:** Total provisioned storage significantly exceeds total available storage when thin provisioning is enabled.

**Source:** [VMware NGX Storage KB - Best Practices](https://kb.ngxstorage.com/knowledge-base/vmware-vsphere-best-practices/)

### Pitfall 2: Incorrect Swap File Calculation

**What goes wrong:** Calculating swap file size incorrectly by using a fixed percentage of RAM or including it when memory reservation is set.
**Why it happens:** Misunderstanding that swap file size = configured RAM - memory reservation.
**How to avoid:**

- Formula: `swapFileSize = configuredRAM - memoryReservation`
- If no reservation: `swapFileSize = configuredRAM`
- Allow users to disable swap file allocation entirely
**Warning signs:** Swap file calculations don't account for memory reservations.

**Source:** [VMware ESXi Swap Files - ituda.com](https://ituda.com/vmware-esxi-swap-files/)

### Pitfall 3: Snapshot Storage Underestimation

**What goes wrong:** Allocating insufficient space for snapshots (e.g., 5%) when high-change-rate VMs (SQL, Exchange) can consume 20-30% or more.
**Why it happens:** Not accounting for workload characteristics and snapshot duration.
**How to avoid:**

- Default to 20-30% for general VMs
- Include help text: "Allocate 20-30% for general VMs, up to 100% for high-change-rate workloads"
- Warn that snapshots shouldn't be kept >72 hours
**Warning signs:** Snapshot percentage <10% without workload context.

**Sources:**

- [Best practices for using VMware snapshots](https://knowledge.broadcom.com/external/article/318825/best-practices-for-using-vmware-snapshot.html)
- [NAKIVO - VMware Snapshot Best Practices](https://www.nakivo.com/blog/vmware-snapshots-vsphere-how-to/)

### Pitfall 4: Missing Growth Allocation

**What goes wrong:** Calculating exact current capacity without headroom for growth, leading to capacity issues months later.
**Why it happens:** Focusing only on current workload without planning for expansion.
**How to avoid:**

- Default growth allocation to 30%
- Apply growth percentage to total before growth (not circular calculation)
- Include help text explaining this is for future expansion
**Warning signs:** Growth percentage is 0% or not included in calculation.

### Pitfall 5: RAID Overhead Confusion

**What goes wrong:** Not accounting for RAID overhead, or applying it incorrectly (e.g., reducing provisioned capacity instead of calculating required raw capacity).
**Why it happens:** RAID calculations are complex and vSAN-specific overhead differs from traditional RAID.
**How to avoid:**

- For traditional RAID, this calculator doesn't include RAID overhead (document in help text)
- For vSAN: RAID-1 = 50% usable, RAID-5 = 75% usable, RAID-6 = 67% usable
- Consider adding RAID overhead as optional advanced feature
**Warning signs:** Mixing vSAN capacity planning with traditional VMFS datastore planning.

**Source:** [Planning Capacity in vSAN](https://docs.vmware.com/en/VMware-vSphere/6.7/com.vmware.vsphere.vsan-planning.doc/GUID-581D2D5C-A88F-4318-A8B3-5A5F343F1247.html)

### Pitfall 6: Configuration File Overhead Ignored

**What goes wrong:** Not allocating space for VM configuration files, logs, and nvram, leading to small but cumulative capacity shortfalls.
**Why it happens:** These files are small (~250 MB per VM) and often overlooked.
**How to avoid:**

- Default to 0.25 GB per VM
- Include in calculation even though small
- Document that this excludes swap files
**Warning signs:** No allocation for config/log files in calculation.

## Code Examples

Verified patterns from official sources:

### VMware Storage Calculation Formulas

```typescript
// Source: https://wintelguy.com/vm-storage-calc.pl (reference implementation)
// Verified against VMware vSphere documentation

// 1. Total Provisioned Disk Space
totalProvisionedGb = sum(vmDiskGb[i] * vmCount[i]) for all VM configs

// 2. Used Disk Space (with thin provisioning)
// thinProvisioningPercent represents over-subscription
usedDiskGb = totalProvisionedGb * (1 - thinProvisioningPercent / 100)
overSubscribedGb = totalProvisionedGb - usedDiskGb

// 3. Snapshot Allocation
// As percentage of total provisioned disk
snapshotGb = totalProvisionedGb * (snapshotPercent / 100)

// 4. Swap File Allocation
// If enabled: sum of all configured RAM
// (Assumes no memory reservation; would subtract reservation if known)
if (includeSwapFiles) {
  swapGb = sum(vmRamGb[i] * vmCount[i]) for all VM configs
} else {
  swapGb = 0
}

// 5. Configuration and Log Files
configLogGb = totalVmCount * configLogGbPerVm

// 6. Total VM Storage
totalVmStorageGb = usedDiskGb + snapshotGb + swapGb + configLogGb

// 7. ESX Installation Storage
esxStorageGb = esxHosts * esxStorageGbPerHost

// 8. Growth Allocation
// Applied to subtotal (before growth) to avoid circular calculation
subtotalBeforeGrowth = totalVmStorageGb + esxStorageGb
growthAllocationGb = subtotalBeforeGrowth * (growthPercent / 100)

// 9. Total Required Storage
totalRequiredGb = totalVmStorageGb + esxStorageGb + growthAllocationGb

// 10. Percentage Calculations
// All percentages relative to totalRequiredGb
percentages = {
  usedDisk: (usedDiskGb / totalRequiredGb) * 100,
  snapshots: (snapshotGb / totalRequiredGb) * 100,
  swap: (swapGb / totalRequiredGb) * 100,
  configLog: (configLogGb / totalRequiredGb) * 100,
  totalVm: (totalVmStorageGb / totalRequiredGb) * 100,
  esx: (esxStorageGb / totalRequiredGb) * 100,
  growth: (growthAllocationGb / totalRequiredGb) * 100,
}
```

### Input Validation Pattern

```typescript
// Source: Established pattern from src/lib/converters/health/bmi.ts

export function calculateVmStorage(input: VmStorageInput): VmStorageResult | null {
  // Validate VM configurations
  if (input.vmConfigs.length === 0) return null;

  for (const config of input.vmConfigs) {
    if (config.diskGb < 0 || config.ramGb < 0 || config.count < 0) {
      return null;
    }
  }

  // Validate percentages (0-100)
  if (
    input.snapshotPercent < 0 || input.snapshotPercent > 100 ||
    input.thinProvisioningPercent < 0 || input.thinProvisioningPercent > 100 ||
    input.growthPercent < 0 || input.growthPercent > 100
  ) {
    return null;
  }

  // Validate counts
  if (input.esxHosts < 1) return null;
  if (input.configLogGbPerVm < 0 || input.esxStorageGbPerHost < 0) return null;

  // Proceed with calculation
  // ...
}
```

### Dynamic VM Configuration Array in UI

```typescript
// Pattern for handling dynamic array of VM configurations

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

export function VmStorageCalculator() {
  const { values, setValue } = useVmStorageStore();

  const addVmConfig = () => {
    setValue("vmConfigs", [
      ...values.vmConfigs,
      { diskGb: 100, ramGb: 8, count: 1 },
    ]);
  };

  const removeVmConfig = (index: number) => {
    if (values.vmConfigs.length > 1) {
      setValue(
        "vmConfigs",
        values.vmConfigs.filter((_, i) => i !== index)
      );
    }
  };

  const updateVmConfig = (index: number, field: keyof VmConfig, value: number) => {
    const newConfigs = [...values.vmConfigs];
    newConfigs[index] = { ...newConfigs[index], [field]: value };
    setValue("vmConfigs", newConfigs);
  };

  return (
    <div>
      {values.vmConfigs.map((config, index) => (
        <div key={index} className="flex gap-2 items-end">
          <div>
            <Label>Disk (GB)</Label>
            <Input
              type="number"
              value={config.diskGb}
              onChange={(e) => updateVmConfig(index, "diskGb", parseFloat(e.target.value) || 0)}
            />
          </div>

          <div>
            <Label>RAM (GB)</Label>
            <Input
              type="number"
              value={config.ramGb}
              onChange={(e) => updateVmConfig(index, "ramGb", parseFloat(e.target.value) || 0)}
            />
          </div>

          <div>
            <Label>VM Count</Label>
            <Input
              type="number"
              value={config.count}
              onChange={(e) => updateVmConfig(index, "count", parseInt(e.target.value) || 0)}
            />
          </div>

          {values.vmConfigs.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeVmConfig(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}

      <Button onClick={addVmConfig} variant="outline" className="mt-2">
        <Plus className="h-4 w-4 mr-2" />
        Add VM Configuration
      </Button>
    </div>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual URL parameter handling | `createUrlSyncMiddleware` factory | v1.0 (2024) | Automatic URL sync, debouncing, SSR safety |
| Separate state and translation files | `next-intl` integration | v1.0 | Type-safe translations, 4 locales |
| Class-based calculators | Pure functions + Zustand | v1.0 | Easier testing, framework-agnostic logic |
| Custom validation | Return `null` for invalid inputs | v1.0 | Consistent error handling across calculators |
| Physical servers only | Include virtual infrastructure | Phase 26 (2026) | Infrastructure category created |

**Deprecated/outdated:**

- Manual `useState` for calculator values: Use `createCalculatorStore` factory instead
- Direct `window.location.search` manipulation: URL sync middleware handles this
- Hardcoded English text: Use translation keys from `src/messages/*.json`

## Open Questions

Things that couldn't be fully resolved:

1. **RAID Overhead Integration**
   - What we know: vSAN has specific overhead (RAID-1 = 50% usable, RAID-5 = 75%), traditional RAID varies by level
   - What's unclear: Should this calculator include RAID overhead, or assume storage presented to vSphere is already post-RAID?
   - Recommendation: Start without RAID overhead (matches reference implementation at wintelguy.com). Document in help text that calculations assume presented/usable storage. Consider adding as optional advanced feature in future.

2. **Memory Reservation Handling**
   - What we know: Swap file size = configured RAM - memory reservation
   - What's unclear: Should calculator accept per-VM memory reservations, or assume no reservation (worst-case)?
   - Recommendation: Assume no reservation (worst-case scenario for capacity planning). Include help text explaining this. Could add reservation fields as advanced option.

3. **Datastore vs Raw Capacity**
   - What we know: Calculations produce required VMFS datastore capacity
   - What's unclear: Should we display both datastore capacity and estimated raw capacity (with RAID overhead)?
   - Recommendation: Display datastore capacity (primary metric). Add help text explaining this is usable VMFS capacity, not raw disk capacity. Consider adding RAID overhead calculator as separate phase.

4. **Multiple VM Configuration Profiles**
   - What we know: Reference tool supports 5 VM profiles, URL state can handle arrays
   - What's unclear: How many profiles to support? How to handle URL sync with dynamic array?
   - Recommendation: Start with 5 profiles (matches reference), allow add/remove in UI. URL sync middleware handles arrays correctly (verified in `createCalculatorStore`).

## Sources

### Primary (HIGH confidence)

- VMware vSphere Official Documentation (6.7/7.0/8.0) - [vSAN Planning](https://docs.vmware.com/en/VMware-vSphere/6.7/com.vmware.vsphere.vsan-planning.doc/GUID-581D2D5C-A88F-4318-A8B3-5A5F343F1247.html)
- VMware Knowledge Base - [Snapshot Best Practices](https://knowledge.broadcom.com/external/article/318825/best-practices-for-using-vmware-snapshot.html)
- VMware Knowledge Base - [Thick/Thin Provisioning](https://knowledge.broadcom.com/external/article/323114/changing-the-thick-or-thin-provisioning.html)
- Converty Codebase - `src/stores/calculator-store.ts` (factory pattern)
- Converty Codebase - `src/lib/converters/health/bmi.ts` (calculation pattern)
- WintelGuy VM Storage Calculator - [Reference Implementation](https://wintelguy.com/vm-storage-calc.pl)

### Secondary (MEDIUM confidence)

- NAKIVO - [VMware Snapshot Best Practices](https://www.nakivo.com/blog/vmware-snapshots-vsphere-how-to/)
- NAKIVO - [Thick vs Thin Provisioning](https://www.nakivo.com/blog/thick-and-thin-provisioning-difference/)
- Paessler Blog - [Thin vs Thick Provisioning Strategy](https://blog.paessler.com/thin-vs-thick-provisioning-making-the-right-storage-choice-for-your-it-infrastructure)
- ituda.com - [VMware ESXi Swap Files](https://ituda.com/vmware-esxi-swap-files/)
- VMinstall - [ESX Swap File Size Best Practice](https://www.vminstall.com/esx-swap-file-size-best-practice/)

### Tertiary (LOW confidence)

- Community discussions on storage capacity monitoring thresholds (20% warning, 5% critical)
- Blog posts on vSAN capacity reporting complexities
- General RAID calculator sites (not vSphere-specific)

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH - Established in codebase since v1.0, no new dependencies needed
- Architecture: HIGH - Verified patterns from existing calculators, `createCalculatorStore` factory documented
- VMware formulas: HIGH - Verified from official VMware documentation and reference implementation
- Pitfalls: MEDIUM - Based on best practice guides and knowledge base articles, not all scenarios verified
- RAID overhead: MEDIUM - vSAN-specific information verified, traditional RAID less clear in vSphere context

**Research date:** 2026-01-25
**Valid until:** 2026-02-25 (30 days - VMware storage formulas are stable, codebase patterns established)

**Notes:**

- No compression or deduplication calculations (per reference implementation)
- Calculations assume VMFS datastores, not vSAN (vSAN requires different overhead calculations)
- All calculations in GB (not GiB) per infrastructure category decision from Phase 26
- Reference implementation at wintelguy.com verified as authoritative source for formula validation
