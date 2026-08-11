# Phase 28-02: K8s Capacity Calculator - UI Implementation

**Plan:** 28-02-PLAN.md
**Status:** Complete ✅
**Duration:** ~4 minutes
**Completed:** 2026-01-25

---

## Objective

Create the Zustand store with URL synchronization, Next.js page wrapper, and React calculator component for the Kubernetes Capacity Calculator.

---

## Tasks Completed

### Task 1: Create Zustand store with URL sync ✅

**File:** `src/stores/k8s-capacity-store.ts`

**Implementation:**

- Created `K8sCapacityState` interface with 11 input fields, result, error, and 13 action methods
- Configured `createUrlSyncMiddleware` with URL synchronization for all input fields
- URL sync debounce: 300ms for responsive updates without excessive history pollution
- Initial values match industry best practices from RESEARCH.md:
  - **Pod workload:** 10 replicas @ 500m CPU, 512 MiB memory (web server example)
  - **Node specs:** 8 cores, 16384 MB (standard K8s node)
  - **System overhead:** 700m CPU, 1024 MiB memory (AKS/GKE typical for 8-core node)
  - **DaemonSets:** 300m CPU, 384 MiB memory (monitoring/logging agents)
  - **Target utilization:** 70% CPU, 80% memory (HPA standard)

**Features:**

- URL parameter loading on initialization using `parseNumberParam` utility (safe parsing with fallback)
- Auto-calculation triggered after every setter update (same pattern as vm-storage-store)
- Error handling: Catches calculation errors and sets error state
- Reset function restores initial state and triggers recalculation
- All 11 input fields synced to URL for shareable calculator links

**State Management:**

```typescript
interface K8sCapacityState {
  // Pod workload inputs (3)
  podCpuRequest: number;
  podMemoryRequest: number;
  podReplicas: number;

  // Node specs inputs (2)
  nodeCpuCores: number;
  nodeMemoryMb: number;

  // System overhead inputs (4)
  systemReservedCpu: number;
  systemReservedMemory: number;
  daemonSetCpuPerNode: number;
  daemonSetMemoryPerNode: number;

  // Target utilization inputs (2)
  targetCpuUtilization: number;
  targetMemoryUtilization: number;

  // Results + Actions
  result: K8sCapacityResult | null;
  error: string | null;
  // 13 action methods (setters, calculate, reset)
}
```

**Verification:** TypeScript compiles, store imports without errors ✅

---

### Task 2: Create Next.js page wrapper ✅

**File:** `src/app/[locale]/infrastructure/k8s-capacity-calculator/page.tsx`

**Implementation:**

- Server Component with async metadata generation
- Dynamic import of calculator component with code splitting
- `generateStaticParams()` for all 4 locales (en, fr, de, it)
- `generateMetadata()` with translated title, description, and keywords
- SEO keywords: kubernetes, k8s, capacity planning, node sizing, cluster, pods, resources, cpu, memory
- `ConverterLayout` wrapper with category breadcrumb ("Infrastructure")
- `Suspense` fallback with `CalculatorSkeleton` for loading state

**Code Splitting:**

```typescript
const K8sCapacityCalculator = dynamic(
  () => import("./k8s-capacity-calculator").then((mod) => mod.K8sCapacityCalculator),
  { loading: () => <CalculatorSkeleton /> }
);
```

**Verification:** Page renders at `/en/infrastructure/k8s-capacity-calculator` ✅

---

### Task 3: Create calculator component ✅

**File:** `src/app/[locale]/infrastructure/k8s-capacity-calculator/k8s-capacity-calculator.tsx`

**Implementation:**

- Client Component (420+ lines) with full UI for K8s capacity planning
- Four distinct input sections using Card components with CardHeader titles:
  1. **Pod Workload** - CPU request (millicores), memory request (MiB), replicas
  2. **Node Specifications** - CPU cores, memory (MB)
  3. **System Overhead** - System reserved CPU/memory, DaemonSet CPU/memory
  4. **Target Utilization** - CPU % (default 70), Memory % (default 80)

**Input Components:**

- Used `InputField` component with correct props (`unit` not `suffix`, `helperText` not `helpText`)
- 11 input fields total with appropriate labels, units, and helper text
- Help text for complex concepts (system reserved, DaemonSets, target utilization)

**Results Display:**

- **Primary Metric:** Nodes Needed (large display with `OutputDisplay` component)
- **Limiting Factor Visualization:**
  - CPU constraint badge (default variant if limiting, outline if not)
  - Memory constraint badge (default variant if limiting, outline if not)
  - Icons: `Cpu` for CPU, `HardDrive` for memory
  - Clear "(limiting)" text for active constraint
- **Capacity Breakdown:** ResultGrid with allocatable resources and final utilization
- **Calculation Steps:** Card component with steps array (collapsed by default)

**Warning Display:**

- Over-utilization warning when `result.overUtilized === true` (>80% threshold)
- Card with amber border styling: `border-amber-500/50 bg-amber-500/10`
- `AlertTriangle` icon with warning message
- Recommends adding more nodes or reducing target utilization

**Component Features:**

- Responsive grid: 1 column mobile, 2 columns md+ (matches vm-storage pattern)
- Auto-calculation: Store handles calculation, component just displays results
- Reset button: Restores defaults and clears URL params
- No manual calculate button: Updates happen automatically on input change

**Formatting:**

- CPU: Display millicores with "m" suffix (e.g., "500m")
- Memory: Display MiB or MB with appropriate units
- Percentages: Display with 1 decimal place (e.g., "75.3%")
- Nodes: Display as integer (already rounded by calculation)

**Issue Resolution During Implementation:**

1. **Alert/Collapsible components not available** - Replaced with Card components
2. **Wrong InputField props** - Changed `suffix` to `unit`, `helpText` to `helperText`
3. **TypeScript errors** - Fixed all prop names and component imports
4. **Biome formatting** - Auto-fixed 6 files with `npm run check:fix`

**Verification:** Component renders correctly, all inputs functional ✅

---

## Verification

**Build Checks:**
- ✅ TypeScript compiles: `npm run type-check` - 0 errors
- ✅ Build succeeds: `npm run build` - 169 converters (including k8s-capacity)
- ✅ Biome linting: `npm run check:fix` - 0 errors in Phase 28 code
- ✅ Service worker generated successfully

**Functional Tests:**
- ✅ Calculator accessible at `/en/infrastructure/k8s-capacity-calculator`
- ✅ Calculator appears in infrastructure category listing
- ✅ URL state syncs correctly (change settings, reload page, settings persist)
- ✅ Results update automatically on input changes
- ✅ Limiting factor correctly shows CPU vs memory constraint with badges
- ✅ Warning appears when utilization exceeds 80%
- ✅ Responsive design verified (1 column mobile, 2 columns desktop)
- ✅ All help text displays correctly
- ✅ Reset button restores defaults

**Security:**
- ✅ URL parameter handling uses safe `parseNumberParam` utility
- ✅ No unsafe operations (no eval, dangerouslySetInnerHTML)
- ✅ All inputs validated through calculation function
- ✅ npm audit: 0 vulnerabilities

---

## Success Criteria Met

- ✅ Calculator page loads with correct metadata and layout
- ✅ All 11 input fields update calculation in real-time
- ✅ Results display nodes needed with limiting factor badge
- ✅ CPU vs memory constraints clearly distinguished visually
- ✅ Final utilization percentages displayed accurately
- ✅ Over-utilization warning displays when either resource exceeds 80%
- ✅ Calculation steps available in Card component
- ✅ URL sync works for shareable links (all input fields)
- ✅ Responsive design works on mobile (1 column) and desktop (2 columns)
- ✅ Help text provides context for system reserved, DaemonSets, and target utilization

---

## Files Modified

```
src/stores/k8s-capacity-store.ts                                              # NEW - 303 lines
src/app/[locale]/infrastructure/k8s-capacity-calculator/page.tsx              # NEW - 56 lines
src/app/[locale]/infrastructure/k8s-capacity-calculator/k8s-capacity-calculator.tsx  # NEW - 420+ lines
```

---

## Commits

All changes committed as part of Phase 28 implementation.

---

## Notes

**UI Pattern References:**

- Followed `vm-storage-calculator.tsx` for component structure
- Used established `InputField` component with correct prop names
- Card component used for input sections and results (Alert/Collapsible not available)
- Responsive grid pattern matches existing calculators

**Limiting Factor Visualization:**

- Default badge = limiting constraint (filled background)
- Outline badge = non-limiting constraint (transparent background)
- CPU icon (`Cpu`) for CPU constraint
- Memory icon (`HardDrive`) for memory constraint
- Clear text label "(limiting)" for active constraint

**Technical Implementation:**

- Store uses closure pattern for auto-calculation (same as vm-storage-store)
- URL middleware with 300ms debounce for responsive updates
- All 11 input parameters synced to URL for shareable links
- Safe number parsing with fallback to defaults
- Error handling: Calculation errors caught and displayed

**Default Values:**

Match industry best practices:
- 10 web server pods @ 500m CPU, 512 MiB memory each
- Standard 8-core, 16 GB K8s nodes
- System reserved: 700m CPU, 1024 MiB memory (AKS/GKE typical)
- DaemonSets: 300m CPU, 384 MiB memory (monitoring/logging)
- Target utilization: 70% CPU (HPA standard), 80% memory (higher tolerance)

---

**Plan 28-02 complete** - Full K8s Capacity Calculator ready for production.
