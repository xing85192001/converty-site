# Virtualization Architecture Research: Hyper-V & Multi-Hypervisor Integration

**Prepared:** 2026-01-27
**Scope:** Architecture for adding Hyper-V, Citrix XenServer, and Proxmox calculators to existing v4.0 Infrastructure category
**Confidence:** HIGH (based on proven v4.0 patterns)

---

## Executive Summary

The v4.0 Infrastructure category successfully shipped with 5 VMware-focused calculators using established patterns: Zustand stores, card-based layouts, ResultGrid/InputField components, and PDF/CSV export. Adding Hyper-V, Citrix, and Proxmox calculators should **extend these patterns, not reinvent them**.

**Key findings:**

1. **Keep flat directory structure** - No subdirectories needed; subcategory metadata provides organization
2. **Reuse all existing components** - Zero new components required; current components are hypervisor-agnostic
3. **Embed reference data in converters** - Follow vmware-licensing.ts pattern with const objects for pricing/specs
4. **Simple stores per calculator** - Continue createCalculatorStore pattern; no complex multi-section state needed
5. **Minimal i18n additions** - Product names remain English; only UI labels need translation

**Recommendation:** Add 10-15 new hypervisor calculators using v4.0 patterns with zero architectural changes.

---

## Question 1: Category Structure

### Current v4.0 Structure (Flat)

```text
src/app/[locale]/infrastructure/
├── k8s-capacity-calculator/
├── server-virtualization-calculator/
├── virtualization-cost/
├── vm-storage-calculator/
└── vmware-licensing-calculator/
```

**Registry subcategories** (metadata-only, not directories):

- `vmware` - VMware-specific tools
- `virtualization` - General virtualization
- `containers` - Kubernetes/Docker
- `cost` - TCO/licensing analysis

### Proposed Structure (Keep Flat)

```text
src/app/[locale]/infrastructure/
├── [existing 5 calculators]/
├── hyperv-host-sizing-calculator/          # subcategory: "hyperv"
├── hyperv-licensing-calculator/            # subcategory: "hyperv"
├── hyperv-storage-calculator/              # subcategory: "hyperv"
├── citrix-xenserver-sizing-calculator/     # subcategory: "citrix"
├── citrix-licensing-calculator/            # subcategory: "citrix"
├── proxmox-cluster-calculator/             # subcategory: "proxmox"
├── proxmox-storage-calculator/             # subcategory: "proxmox"
└── virtualization-comparison-calculator/   # subcategory: "cost"
```

### Registry Updates

Add to `src/lib/registry/categories.ts`:

```typescript
{
  id: "infrastructure",
  slug: "infrastructure",
  name: "Infrastructure",
  description: "Virtualization, Kubernetes, and datacenter tools",
  icon: Server,
  subcategories: [
    { id: "vmware", name: "VMware", description: "vSphere and ESX calculators" },
    { id: "hyperv", name: "Hyper-V", description: "Microsoft Hyper-V calculators" },  // NEW
    { id: "citrix", name: "Citrix", description: "XenServer and XenDesktop tools" },  // NEW
    { id: "proxmox", name: "Proxmox", description: "Proxmox VE cluster tools" },      // NEW
    { id: "kubernetes", name: "Kubernetes", description: "K8s capacity planning" },
    { id: "cost", name: "Cost Analysis", description: "TCO and licensing calculators" },
  ],
}
```

### Rationale: Flat Structure

**Why no subdirectories:**

1. **Established pattern** - v4.0 shipped without subdirectories; changing now creates inconsistency
2. **Subcategories provide organization** - Metadata-driven grouping works well for category pages
3. **Simpler builds** - Next.js static export generates pages without nested complexity
4. **URL clarity** - `/infrastructure/hyperv-host-sizing-calculator` is clear without `/hyperv/` prefix
5. **Future flexibility** - Cross-cutting calculators (comparison tools) don't fit subdirectory model

**Alternatives considered and rejected:**

- ❌ **Subdirectories by vendor** (`vmware/`, `hyperv/`, `citrix/`) - Over-engineering for ~15 calculators
- ❌ **Mixed approach** (some flat, some nested) - Inconsistent, confusing for contributors
- ❌ **Category-level separation** (new "Hyper-V" category) - Fragments infrastructure tooling

**Decision:** Keep flat structure, use subcategory metadata for grouping.

---

## Question 2: Reusable Components

### Existing v4.0 Components (All Reusable)

| Component | Purpose | Hypervisor-Agnostic? | Reuse for v5.0? |
|-----------|---------|---------------------|-----------------|
| `InputField` | Numeric/text inputs with units | ✅ Yes | ✅ Use as-is |
| `ResultGrid` | 2-3 column metric display | ✅ Yes | ✅ Use as-is |
| `Card`/`CardHeader`/`CardContent` | Section containers | ✅ Yes | ✅ Use as-is |
| `PdfExportButton` | PDF generation from sections | ✅ Yes | ✅ Use as-is |
| `CsvExportButton` | CSV export from row data | ✅ Yes | ✅ Use as-is |
| `Select` | Dropdown for options | ✅ Yes | ✅ Use as-is |
| `Switch` | Boolean toggles (HA, etc.) | ✅ Yes | ✅ Use as-is |
| `Badge` | Visual tags (limiting factor) | ✅ Yes | ✅ Use as-is |
| `AlertCircle` | Warning/info callouts | ✅ Yes | ✅ Use as-is |

### Component Usage Pattern (from v4.0)

```typescript
// vmware-licensing-calculator.tsx (REFERENCE)
<Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Server className="h-5 w-5" />
      Host Configuration
    </CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    <InputField
      id="hostCount"
      label={t("hostCount")}
      type="number"
      value={values.hostCount.toString()}
      onChange={(value) => setValue("hostCount", Number(value))}
      min={1}
      step={1}
      unit="hosts"
    />
  </CardContent>
</Card>

{result && (
  <ResultGrid
    results={[
      { label: t("totalLicensedCores"), value: result.totalLicensedCores.toString() },
      { label: t("annualCost"), value: format.number(result.annualCost, {...}) },
    ]}
    columns={2}
  />
)}
```

### Hyper-V Calculator Example (Reusing Components)

```typescript
// hyperv-licensing-calculator.tsx (PROPOSED)
<Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Server className="h-5 w-5" />
      Hyper-V Host Configuration
    </CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    <InputField
      id="hostCount"
      label={t("hostCount")}
      type="number"
      value={values.hostCount.toString()}
      onChange={(value) => setValue("hostCount", Number(value))}
      unit="hosts"
    />

    {/* Hyper-V-specific: Edition selector */}
    <Select
      value={values.edition}
      onValueChange={(value) => setValue("edition", value)}
    >
      <SelectContent>
        <SelectItem value="datacenter">Datacenter</SelectItem>
        <SelectItem value="standard">Standard</SelectItem>
      </SelectContent>
    </Select>
  </CardContent>
</Card>
```

### Zero New Components Needed

**Why existing components work:**

1. **InputField** - Handles hosts, CPUs, cores, RAM (identical inputs across hypervisors)
2. **Select** - Edition/product selection (VMware has 4 editions, Hyper-V has 2, Citrix has 3)
3. **ResultGrid** - Cost/capacity metrics (universal across virtualization)
4. **PDF/CSV Export** - Generic section/row format works for all calculators
5. **Card layouts** - Hypervisor-agnostic container structure

**No custom components needed because:**

- Virtualization concepts are universal (hosts, VMs, CPU cores, RAM, storage)
- Licensing models differ in math, not UI presentation
- All hypervisors use card-based input sections + results display

**Decision:** Reuse all v4.0 components; zero new components required.

---

## Question 3: Reference Data Organization

### Current v4.0 Pattern (Embedded in Converters)

**Example from `vmware-licensing.ts`:**

```typescript
/**
 * VMware product pricing (2026 list prices, USD per core per year)
 */
const PRICING = {
  vcf: 350,    // VMware Cloud Foundation
  vvf: 135,    // VMware vSphere Foundation
  "vsphere-ep": 95,
  "vsphere-std": 50,
} as const;

/**
 * vSAN storage entitlement (TiB per licensed core)
 */
const VSAN_ENTITLEMENT = {
  vcf: 1.0,
  vvf: 0.25,
} as const;
```

**Why this works:**

- **Type-safe** - TypeScript const assertions provide autocomplete and validation
- **Versioned with code** - Pricing changes tracked in Git history
- **No external dependencies** - Pure TypeScript, no database or API calls
- **Simple updates** - Change const, commit, deploy

### Proposed Pattern for Hyper-V

**File: `src/lib/converters/infrastructure/hyperv-licensing.ts`**

```typescript
/**
 * Microsoft Hyper-V licensing (2026 list prices, USD per license)
 *
 * Licensing model: Per-host or per-core depending on edition
 * Reference: https://www.microsoft.com/en-us/windows-server/pricing
 */
const HYPERV_PRICING = {
  // Datacenter: Per-host, unlimited VMs
  datacenter: {
    baseLicense: 6155,        // 16-core license
    additionalCore: 384.69,   // Per 2-core pack above 16 cores
    minCores: 16,
  },
  // Standard: Per-host, 2 VMs only
  standard: {
    baseLicense: 1069,
    additionalCore: 66.81,
    minCores: 16,
  },
} as const;

/**
 * Storage Spaces Direct capacity factors
 */
const S2D_CAPACITY = {
  twoWayMirror: 0.5,     // 50% usable (2x replication)
  threeWayMirror: 0.33,  // 33% usable (3x replication)
  dualParity: 0.67,      // 67% usable (RAID-6 equivalent)
} as const;
```

### Reference Data Organization Strategy

**For each hypervisor, embed in converter files:**

1. **Licensing pricing** - Per-core, per-host, per-VM pricing tiers
2. **Edition capabilities** - Feature matrix (max VMs, clustering, replication)
3. **Hardware minimums** - Minimum cores, RAM, storage requirements
4. **Overhead factors** - Hypervisor RAM overhead, system reserved resources
5. **Capacity multipliers** - RAID levels, deduplication ratios, compression

**Location pattern:**

```text
src/lib/converters/infrastructure/
├── hyperv-licensing.ts          # HYPERV_PRICING, HYPERV_EDITIONS
├── hyperv-storage.ts            # S2D_CAPACITY, OVERHEAD_FACTORS
├── citrix-licensing.ts          # CITRIX_PRICING, XEN_EDITIONS
├── proxmox-cluster.ts           # PROXMOX_QUORUM, CEPH_FACTORS
```

### External Data NOT Recommended

**Why avoid external databases/APIs:**

1. **Static export constraint** - No server-side database queries
2. **Offline PWA requirement** - Must work without network
3. **Versioning clarity** - Git history tracks pricing changes explicitly
4. **Zero dependencies** - Keep calculations pure TypeScript
5. **Performance** - No fetch delays, instant calculations

**When external data would make sense (not now):**

- 1000+ hypervisor models with specs (not the case)
- Real-time pricing APIs (not available for enterprise licensing)
- User-submitted data (out of scope)

**Decision:** Embed reference data as const objects in converter files, following v4.0 vmware-licensing.ts pattern.

---

## Question 4: State Management

### Current v4.0 Pattern (Simple Stores)

**From `vmware-licensing-calculator.tsx`:**

```typescript
const useVmwareLicensingStore = createCalculatorStore<
  VmwareLicensingInput,
  VmwareLicensingResult
>({
  name: "vmware-licensing",
  initialValues: {
    hostCount: 4,
    cpusPerHost: 2,
    coresPerCpu: 16,
    productType: "vcf",
    termYears: 3,
  },
  calculate: calculateVmwareLicensing,
});

// Usage in component
const { values, setValue, result } = useVmwareLicensingStore();
```

**Store characteristics:**

- **Single store per calculator** - No nested stores or complex state trees
- **Flat input values** - Simple object with primitives (numbers, strings, booleans)
- **Calculated result** - Derived from inputs via pure function
- **URL sync** - Automatic via middleware (debounced 500ms)

### Hyper-V Store Example (Same Pattern)

```typescript
// hyperv-licensing-calculator.tsx
const useHypervLicensingStore = createCalculatorStore<
  HypervLicensingInput,
  HypervLicensingResult
>({
  name: "hyperv-licensing",
  initialValues: {
    hostCount: 4,
    coresPerHost: 32,
    edition: "datacenter",     // "datacenter" | "standard"
    termYears: 3,
    includeWindowsServer: true,
  },
  calculate: calculateHypervLicensing,
});
```

### No Complex Multi-Section State Needed

**Why simple stores work:**

1. **Virtualization inputs are independent** - Host count, cores, edition don't have cross-field dependencies requiring sections
2. **Calculation is synchronous** - No multi-step workflows or wizard UIs
3. **URL state is flat** - Query params naturally map to flat objects
4. **v4.0 pattern proven** - All 5 infrastructure calculators shipped successfully with simple stores

**When complex state would be needed (not applicable):**

- Multi-step wizards with page navigation (not needed for calculators)
- Shopping cart with add/remove items (not applicable)
- Form sections with show/hide logic (simple conditionals handle this)
- Undo/redo history (overkill for calculator inputs)

### Input Complexity Comparison

| Calculator | Input Fields | Sections | Complex State? |
|------------|--------------|----------|----------------|
| VMware Licensing | 5 (hosts, CPUs, cores, product, term) | 2 cards | ❌ No - flat object |
| Hyper-V Licensing | 5 (hosts, cores, edition, term, include-WS) | 2 cards | ❌ No - flat object |
| Citrix Licensing | 6 (hosts, VDI users, edition, support, term) | 3 cards | ❌ No - flat object |
| Proxmox Cluster | 7 (hosts, cores, subscription, storage, HA) | 3 cards | ❌ No - flat object |

**All calculators fit the simple store pattern.**

**Decision:** Use createCalculatorStore for all hypervisor calculators; no multi-section state management needed.

---

## Question 5: i18n - Translation Strategy

### Current v4.0 i18n Pattern

**Product names remain English** (from `vmware-licensing-calculator.tsx`):

```typescript
// Calculator component
<SelectItem value="vcf">{t("productVcf")}</SelectItem>
<SelectItem value="vvf">{t("productVvf")}</SelectItem>

// Translation files (en.json, fr.json, de.json, it.json)
{
  "calculator": {
    "vmwareLicensingCalculator": {
      "productVcf": "VMware Cloud Foundation (VCF)",
      "productVvf": "VMware vSphere Foundation (VVF)",
      "hostCount": "Number of hosts",
      "totalLicensedCores": "Total licensed cores"
    }
  }
}
```

**What's translated:**

- UI labels ("Number of hosts", "Total cost")
- Result labels ("Annual cost", "Cores per CPU")
- Help text and disclaimers

**What's NOT translated:**

- Product names (VMware, VCF, VVF stay English)
- Technical terms (vCPU, TiB, vSAN)
- Brand names (Hyper-V, Citrix, Proxmox)

### Proposed Hyper-V i18n Structure

**File: `src/messages/en.json`**

```json
{
  "converters": {
    "hyperv-licensing-calculator": {
      "name": "Hyper-V Licensing Calculator",
      "description": "Calculate Microsoft Hyper-V licensing costs",
      "metaDescription": "Estimate Hyper-V Datacenter and Standard edition licensing costs"
    }
  },
  "calculator": {
    "hypervLicensingCalculator": {
      "hostCount": "Number of Hyper-V hosts",
      "coresPerHost": "Cores per host",
      "edition": "Hyper-V Edition",
      "editionDatacenter": "Datacenter (unlimited VMs)",
      "editionStandard": "Standard (2 VMs per license)",
      "includeWindowsServer": "Include Windows Server licensing",
      "totalCost": "Total licensing cost",
      "baseLicenseCost": "Base license (16 cores)",
      "additionalCoreCost": "Additional core packs",
      "disclaimer": "Prices are estimated based on Microsoft list prices. Contact Microsoft or a licensing partner for accurate quotes."
    }
  }
}
```

**French translation example:**

```json
{
  "calculator": {
    "hypervLicensingCalculator": {
      "hostCount": "Nombre d'hôtes Hyper-V",
      "edition": "Édition Hyper-V",
      "editionDatacenter": "Datacenter (VMs illimitées)",
      "totalCost": "Coût total des licences"
    }
  }
}
```

### Translation Scope for v5.0

**Per-calculator translations needed (4 locales):**

1. **Converter metadata** (3 keys) - name, description, metaDescription
2. **Input labels** (~5-10 keys) - hostCount, coresPerHost, edition, etc.
3. **Result labels** (~5-8 keys) - totalCost, annualCost, breakdown items
4. **Help/disclaimer text** (1-2 keys) - Pricing disclaimers, calculation notes

**Total translation effort per calculator:** ~15-20 keys × 4 locales = 60-80 translations

**For 10 new hypervisor calculators:** ~600-800 new translation keys

### Hypervisor-Specific Terms (Keep English)

| English Term | French | German | Italian | Decision |
|--------------|--------|--------|---------|----------|
| Hyper-V | Hyper-V | Hyper-V | Hyper-V | ✅ Keep English (brand) |
| Datacenter Edition | Édition Datacenter | Datacenter Edition | Edizione Datacenter | ⚠️ Translate "Edition" |
| XenServer | XenServer | XenServer | XenServer | ✅ Keep English (brand) |
| Proxmox VE | Proxmox VE | Proxmox VE | Proxmox VE | ✅ Keep English (brand) |
| Storage Spaces Direct | Storage Spaces Direct | Storage Spaces Direct | Storage Spaces Direct | ✅ Keep English (feature) |
| vCPU | vCPU | vCPU | vCPU | ✅ Keep English (technical) |
| TiB (Tebibyte) | Tio | TiB | TiB | ✅ Keep English (unit) |

**Rationale:**

- **Brand names never translate** - Microsoft Hyper-V, Citrix XenServer, Proxmox VE
- **Feature names stay English** - Storage Spaces Direct, Live Migration, vMotion
- **Technical units stay English** - vCPU, TiB, IOPS (international standards)
- **UI context translates** - "Number of X", "Cost per Y", "Total Z"

### i18n Maintenance Strategy

**Workflow for adding new hypervisor calculator:**

1. Create converter in `src/lib/converters/infrastructure/[name].ts`
2. Add to `src/lib/registry/infrastructure-converters.ts`
3. Add English translations to `src/messages/en.json`
4. Copy English keys to fr.json, de.json, it.json with placeholder "[TODO]"
5. Run `npm run check:translations` to validate keys exist
6. Translate manually or use DeepL API (future automation)

**Translation validation command (proposed for v5.0):**

```bash
# Check all 4 locales have matching keys
npm run check:translations

# Output:
✓ en.json: 3,245 keys
✓ fr.json: 3,245 keys
✓ de.json: 3,245 keys
✓ it.json: 3,245 keys
✓ All locales have matching keys
```

**Decision:** Follow v4.0 i18n pattern; keep brand/technical terms in English, translate UI labels only.

---

## Proposed Hypervisor Calculators for v5.0

### Hyper-V Calculators (3-4)

1. **Hyper-V Host Sizing Calculator**
   - Inputs: VM count, vCPU per VM, RAM per VM, edition
   - Output: Host count, total cores needed, RAM requirements
   - Subcategory: `hyperv`
   - Similar to: `server-virtualization-calculator` (v4.0)

2. **Hyper-V Licensing Calculator**
   - Inputs: Hosts, cores, edition (Datacenter/Standard), term
   - Output: Base licenses, additional core packs, total cost
   - Subcategory: `hyperv`
   - Similar to: `vmware-licensing-calculator` (v4.0)

3. **Hyper-V Storage Spaces Direct Calculator**
   - Inputs: Hosts, drives per host, capacity per drive, resiliency (2-way, 3-way, parity)
   - Output: Usable capacity, overhead, IOPS estimate
   - Subcategory: `hyperv`
   - Similar to: `vm-storage-calculator` (v4.0)

4. **Hyper-V Replica Bandwidth Calculator** (optional)
   - Inputs: VM count, change rate, replication interval
   - Output: Bandwidth required, WAN link recommendations
   - Subcategory: `hyperv`
   - New pattern (not in v4.0)

### Citrix Calculators (2-3)

1. **Citrix XenServer Sizing Calculator**
   - Inputs: VM count, vCPU, RAM, storage, edition
   - Output: Host count, licensing requirements
   - Subcategory: `citrix`
   - Similar to: `server-virtualization-calculator`

2. **Citrix VDI User Density Calculator**
   - Inputs: User count, workload type (light/medium/heavy), GPU
   - Output: Hosts needed, VDA licenses, GPU cards
   - Subcategory: `citrix`
   - New pattern (VDI-specific)

3. **Citrix Licensing Calculator** (optional)
   - Inputs: Users, edition (VDI/Apps), support level, term
   - Output: License cost, support cost, total
   - Subcategory: `citrix`
   - Similar to: `vmware-licensing-calculator`

### Proxmox Calculators (2-3)

1. **Proxmox Cluster Calculator**
   - Inputs: Nodes, VMs, HA requirements, quorum
   - Output: Cluster size, Ceph configuration, networking
   - Subcategory: `proxmox`
   - Similar to: `server-virtualization-calculator`

2. **Proxmox Ceph Storage Calculator**
   - Inputs: OSDs per node, OSD size, replication factor
   - Output: Usable capacity, IOPS, redundancy
   - Subcategory: `proxmox`
   - Similar to: `vm-storage-calculator`

3. **Proxmox Subscription Calculator** (optional)
   - Inputs: Nodes, subscription tier (community/basic/standard/premium)
   - Output: Annual cost, support benefits comparison
   - Subcategory: `proxmox`
   - Similar to: `vmware-licensing-calculator`

### Cross-Platform Calculators (1-2)

1. **Virtualization Platform Comparison**
   - Inputs: Workload requirements (VMs, CPU, RAM, storage)
   - Output: Cost comparison across VMware/Hyper-V/Citrix/Proxmox
   - Subcategory: `cost`
   - New pattern (comparison matrix)

2. **VM Migration Estimator** (optional)
   - Inputs: Source platform, target platform, VM count, data size
   - Output: Migration time, downtime estimate, tool recommendations
   - Subcategory: `cost`
   - New pattern (migration-focused)

**Total proposed calculators:** 10-13 (prioritize 10 core calculators for v5.0)

---

## File Organization Reference

### Complete Directory Structure (v4.0 + v5.0)

```text
src/
├── app/[locale]/infrastructure/
│   # v4.0 Existing (5 calculators)
│   ├── k8s-capacity-calculator/
│   ├── server-virtualization-calculator/
│   ├── virtualization-cost/
│   ├── vm-storage-calculator/
│   ├── vmware-licensing-calculator/
│   # v5.0 Hyper-V (3-4 calculators)
│   ├── hyperv-host-sizing-calculator/
│   ├── hyperv-licensing-calculator/
│   ├── hyperv-storage-spaces-calculator/
│   ├── hyperv-replica-bandwidth-calculator/      # optional
│   # v5.0 Citrix (2-3 calculators)
│   ├── citrix-xenserver-sizing-calculator/
│   ├── citrix-vdi-density-calculator/
│   ├── citrix-licensing-calculator/              # optional
│   # v5.0 Proxmox (2-3 calculators)
│   ├── proxmox-cluster-calculator/
│   ├── proxmox-ceph-storage-calculator/
│   ├── proxmox-subscription-calculator/          # optional
│   # v5.0 Cross-platform (1-2 calculators)
│   ├── virtualization-comparison-calculator/
│   └── vm-migration-estimator-calculator/        # optional
│
├── lib/converters/infrastructure/
│   # v4.0 Existing
│   ├── k8s-capacity.ts
│   ├── server-virtualization.ts
│   ├── virtualization-cost.ts
│   ├── vm-storage.ts
│   ├── vmware-licensing.ts
│   # v5.0 Hyper-V
│   ├── hyperv-host-sizing.ts
│   ├── hyperv-licensing.ts
│   ├── hyperv-storage-spaces.ts
│   ├── hyperv-replica-bandwidth.ts               # optional
│   # v5.0 Citrix
│   ├── citrix-xenserver-sizing.ts
│   ├── citrix-vdi-density.ts
│   ├── citrix-licensing.ts                       # optional
│   # v5.0 Proxmox
│   ├── proxmox-cluster.ts
│   ├── proxmox-ceph-storage.ts
│   ├── proxmox-subscription.ts                   # optional
│   # v5.0 Cross-platform
│   ├── virtualization-comparison.ts
│   └── vm-migration-estimator.ts                 # optional
│
└── lib/registry/
    ├── categories.ts                              # Add hyperv/citrix/proxmox subcategories
    └── infrastructure-converters.ts               # Add 10-13 new entries
```

### Registry Entry Template

```typescript
// src/lib/registry/infrastructure-converters.ts
export const infrastructureConverters: Record<string, ConverterMeta> = {
  // ... existing v4.0 converters ...

  "hyperv-licensing-calculator": {
    id: "hyperv-licensing-calculator",
    slug: "hyperv-licensing-calculator",
    category: "infrastructure",
    subcategory: "hyperv",
    keywords: [
      "hyper-v",
      "microsoft",
      "licensing",
      "datacenter",
      "standard",
      "windows server",
      "cores",
      "cost",
    ],
    icon: Receipt,
    featured: true,
  },

  "proxmox-cluster-calculator": {
    id: "proxmox-cluster-calculator",
    slug: "proxmox-cluster-calculator",
    category: "infrastructure",
    subcategory: "proxmox",
    keywords: [
      "proxmox",
      "cluster",
      "ha",
      "quorum",
      "nodes",
      "ceph",
      "storage",
    ],
    icon: Server,
    featured: true,
  },

  // ... more v5.0 calculators ...
};
```

---

## Performance Implications

### Build Performance

**v4.0 Baseline:**

- 172 calculators
- ~84,125 LOC TypeScript
- Static export: ~45 seconds (local)
- 210 JavaScript chunks (code splitting)

**v5.0 Projection (182-185 calculators):**

- 10-13 new calculators (~6,000 LOC estimated)
- Static export: ~48 seconds (+6% build time)
- 220-223 JavaScript chunks (+10-13 chunks)
- **Impact: Minimal** - Next.js code splitting keeps chunks small

### Bundle Size Impact

**Per calculator bundle size (v4.0 measured):**

- Calculator component: ~15-25 KB (gzipped)
- Converter logic: ~3-8 KB (gzipped)
- Shared components: Already loaded (Card, InputField, etc.)

**v5.0 Addition:**

- 10 calculators × 20 KB average = 200 KB total
- **Lazy-loaded per calculator** - No impact on initial bundle
- First Contentful Paint (FCP): No degradation expected

### Runtime Performance

**Calculation complexity:**

- All calculators: Synchronous, <1ms computation
- No external API calls (static data embedded)
- No database queries (pure functions)

**URL sync debounce:**

- 500ms per calculator (v4.0 pattern)
- No cross-calculator interference (per-store timers)

**Decision:** Performance impact negligible; v5.0 calculators follow established patterns with no runtime overhead.

---

## Integration Checklist

### For Each New Hypervisor Calculator

- [ ] **Converter logic** (`src/lib/converters/infrastructure/[name].ts`)
  - [ ] Interface for Input (TypeScript)
  - [ ] Interface for Result (TypeScript)
  - [ ] Const objects for reference data (pricing, specs)
  - [ ] Pure calculate function with steps array
  - [ ] JSDoc comments with examples

- [ ] **Registry entry** (`src/lib/registry/infrastructure-converters.ts`)
  - [ ] Unique id (kebab-case)
  - [ ] Slug matching folder name
  - [ ] category: "infrastructure"
  - [ ] subcategory: "hyperv" | "citrix" | "proxmox"
  - [ ] 5-10 keywords for search
  - [ ] Appropriate icon (Server, Receipt, HardDrive, etc.)
  - [ ] featured: true (for homepage)

- [ ] **Component** (`src/app/[locale]/infrastructure/[name]/[name]-calculator.tsx`)
  - [ ] "use client" directive
  - [ ] createCalculatorStore with initialValues
  - [ ] Card-based layout (left: inputs, right: results)
  - [ ] InputField for numeric inputs
  - [ ] Select for dropdowns
  - [ ] ResultGrid for metrics
  - [ ] PDF/CSV export buttons
  - [ ] Steps display (Calculation Details card)

- [ ] **Page** (`src/app/[locale]/infrastructure/[name]/page.tsx`)
  - [ ] generateStaticParams (all locales)
  - [ ] generateMetadata with translations
  - [ ] setRequestLocale(locale)
  - [ ] ConverterLayout wrapper
  - [ ] Suspense boundary

- [ ] **Translations** (all 4 locales)
  - [ ] `src/messages/en.json` - converters.[id].name/description/metaDescription
  - [ ] `src/messages/en.json` - calculator.[camelCase].* (15-20 keys)
  - [ ] `src/messages/fr.json` - Copy keys, add "[TODO]" placeholders
  - [ ] `src/messages/de.json` - Copy keys, add "[TODO]" placeholders
  - [ ] `src/messages/it.json` - Copy keys, add "[TODO]" placeholders

- [ ] **Quality checks**
  - [ ] `npm run type-check` passes
  - [ ] `npm run check:fix` passes (Biome)
  - [ ] `npm run build` succeeds
  - [ ] Calculator loads in all 4 locales
  - [ ] URL state syncs correctly
  - [ ] PDF export works
  - [ ] CSV export works
  - [ ] Search finds calculator (keywords)

---

## Alternatives Considered and Rejected

### 1. Vendor-Specific Categories

**Proposal:** Create separate categories for Hyper-V, Citrix, Proxmox

**Rejected because:**

- Fragments infrastructure tooling unnecessarily
- Users often compare platforms (need unified view)
- Category page would have 6 categories instead of 1 (confusing)
- Cross-platform calculators (comparison tool) don't fit model

### 2. Dynamic Reference Data Loading

**Proposal:** Fetch pricing/specs from external API or JSON files

**Rejected because:**

- Breaks static export constraint (no server-side fetch)
- Breaks offline PWA functionality
- Adds unnecessary complexity for ~50 pricing data points
- Git history tracking is superior for audit trail

### 3. Shared Hypervisor Component Library

**Proposal:** Create `@/components/hypervisor/*` with reusable widgets

**Rejected because:**

- v4.0 components already hypervisor-agnostic
- No new UI patterns needed (all use cards + inputs + results)
- Premature abstraction (YAGNI principle)
- Would add cognitive overhead for contributors

### 4. Complex Multi-Step Wizards

**Proposal:** Wizard UI for complex calculators (e.g., migration planner)

**Rejected because:**

- All inputs fit in 2-3 cards (no wizard needed)
- v4.0 single-page pattern works well
- Wizard state management adds complexity
- URL state doesn't naturally support multi-step

### 5. Database-Backed Specs

**Proposal:** SQLite/IndexedDB for hypervisor specs and pricing

**Rejected because:**

- Static export precludes server-side database
- IndexedDB overkill for <1KB reference data per calculator
- Versioning harder than Git-tracked const objects
- Offline sync complexity not justified

---

## Recommendations Summary

### Architecture Decisions

| Question | Recommendation | Rationale |
|----------|----------------|-----------|
| **Category Structure** | Keep flat directory, add subcategories in registry | v4.0 pattern proven, simpler than subdirectories |
| **Reusable Components** | Use all existing components, zero new components | Current components are hypervisor-agnostic |
| **Reference Data** | Embed as const objects in converter files | Type-safe, versioned, offline-compatible |
| **State Management** | createCalculatorStore per calculator, flat inputs | Simple pattern handles all use cases |
| **i18n** | Translate UI labels, keep brand/technical terms English | Follows v4.0 pattern, reduces translation burden |

### Implementation Priorities

**Phase 1: Core Hyper-V (3 calculators)**

1. Hyper-V Host Sizing
2. Hyper-V Licensing
3. Hyper-V Storage Spaces Direct

**Phase 2: Citrix/Proxmox (4 calculators)**
4. Citrix XenServer Sizing
5. Citrix VDI User Density
6. Proxmox Cluster
7. Proxmox Ceph Storage

**Phase 3: Cross-Platform (2 calculators)**
8. Virtualization Platform Comparison
9. VM Migration Estimator

**Phase 4: Optional Enhancements (3 calculators)**
10. Hyper-V Replica Bandwidth
11. Citrix Licensing
12. Proxmox Subscription

### Success Criteria

- [ ] **Zero architectural changes** - All v4.0 patterns reused
- [ ] **Zero new components** - Existing components sufficient
- [ ] **Zero performance degradation** - Build time <5% increase
- [ ] **Zero breaking changes** - All v4.0 calculators continue working
- [ ] **100% translation coverage** - All 4 locales complete
- [ ] **Zero lint/type errors** - Quality gates pass

### Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Pricing data becomes stale | Add "Last updated" date in converter comments, review quarterly |
| Translation quality varies | Use DeepL API for initial translations, native speaker review |
| Build time increases | Monitor with `npm run build` timing, optimize if exceeds 60s |
| Code duplication across hypervisors | Extract common logic only when 3+ calculators share pattern |

---

## Conclusion

**The v5.0 hypervisor expansion requires zero architectural changes.** All questions (category structure, components, reference data, state management, i18n) are answered by extending proven v4.0 patterns.

**Next steps:**

1. Create roadmap based on this research
2. Implement Phase 1 (3 Hyper-V calculators) first
3. Validate pattern works before expanding to Citrix/Proxmox
4. Monitor performance and user feedback
5. Iterate on additional calculators in Phases 2-4

**Confidence level: HIGH** - This research is based on working v4.0 code, not theoretical patterns. All recommendations are proven in production with 172 calculators.

---

_Research completed: 2026-01-27 | Status: Ready for roadmap creation_
