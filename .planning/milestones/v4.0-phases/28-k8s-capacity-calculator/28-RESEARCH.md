# Phase 28: Kubernetes Capacity Calculator - Research

**Researched:** 2026-01-25
**Domain:** Kubernetes cluster capacity planning and node sizing
**Confidence:** HIGH

## Summary

Research focused on Kubernetes resource management model (requests/limits), allocatable resource calculation formulas, and capacity planning best practices from managed Kubernetes providers (GKE, EKS, AKS). The K8s Capacity Calculator requires understanding how Kubernetes reserves system resources, how pods are scheduled based on CPU and memory constraints, and industry-standard target utilization thresholds.

The standard approach is to implement pure calculation functions in `src/lib/converters/infrastructure/` following the established pattern from Phase 27 (VM Storage Calculator). The calculation determines nodes needed by computing both CPU-constrained and memory-constrained node counts, then selecting the higher value (the limiting factor). Kubernetes treats scheduling as a multi-dimensional bin-packing problem, with memory typically the predominant constraint due to its non-compressible nature (OOM kills vs CPU throttling).

Kubernetes capacity planning involves several key concepts: **Allocatable Resources** (what's actually available for pods after system reservations), **System Reserved** (OS daemons), **Kube Reserved** (Kubernetes components), **Eviction Thresholds** (prevent system OOM), and **Target Utilization** (headroom for autoscaling, typically 70% CPU / 80% memory).

**Primary recommendation:** Follow the established calculator factory pattern with pure calculation functions. Implement K8s capacity formulas based on official documentation and reference implementations. Use the allocatable resources formula from Kubernetes docs, system reserved formulas from cloud providers (AKS/GKE), and target utilization best practices (70% CPU, 80% memory). Include warnings for >80% utilization and show CPU vs memory as limiting factor.

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
│           └── k8s-capacity.ts        # Pure calculation logic
├── stores/
│   └── k8s-capacity-store.ts          # Zustand store (auto-generated pattern)
├── app/
│   └── [locale]/
│       └── infrastructure/
│           └── k8s-capacity-calculator/
│               ├── page.tsx                      # Next.js page wrapper
│               └── k8s-capacity-calculator.tsx   # React calculator component
└── messages/
    ├── en.json                      # English translations
    ├── fr.json                      # French translations
    ├── de.json                      # German translations
    └── it.json                      # Italian translations
```

### Pattern 1: Allocatable Resources Calculation

**What:** Kubernetes formula for calculating available resources after system reservations
**When to use:** Core capacity planning calculation (every K8s cluster)
**Example:**

```typescript
// Source: https://kubernetes.io/docs/tasks/administer-cluster/reserve-compute-resources/

/**
 * Core Kubernetes allocatable resources formula
 */
export function calculateAllocatable(
  nodeCapacity: number,
  systemReserved: number,
  kubeReserved: number,
  evictionThreshold: number
): number {
  return nodeCapacity - systemReserved - kubeReserved - evictionThreshold;
}

/**
 * Formula: Allocatable = Capacity - SystemReserved - KubeReserved - Eviction
 *
 * Example (16 CPU node):
 * - Capacity: 16000m (16 cores)
 * - System Reserved: 500m (OS daemons)
 * - Kube Reserved: 1000m (kubelet, container runtime)
 * - Eviction: 0m (CPU not subject to hard eviction)
 * - Allocatable: 16000 - 500 - 1000 - 0 = 14500m (14.5 CPUs)
 */
```

### Pattern 2: System Reserved Formulas by Provider

**What:** Cloud provider-specific formulas for system resource reservations
**When to use:** Accurate capacity planning for managed K8s clusters
**Example:**

```typescript
// Source: https://learn.microsoft.com/en-us/azure/aks/node-resource-reservations

/**
 * AKS CPU reservation formula (fixed tiers)
 */
export function calculateAksCpuReserved(nodeCpuCores: number): number {
  if (nodeCpuCores <= 1) return 60;
  if (nodeCpuCores <= 2) return 100;
  if (nodeCpuCores <= 4) return 140;
  if (nodeCpuCores <= 8) return 180;
  if (nodeCpuCores <= 16) return 260;
  if (nodeCpuCores <= 32) return 420;
  return 740; // 64 cores
}

/**
 * AKS Memory reservation formula (AKS 1.29+)
 * Formula: Lesser of (20 MB × maxPods + 50 MB) or (25% of total memory)
 * Plus: 100 Mi eviction threshold
 */
export function calculateAksMemoryReserved(
  nodeMemoryMb: number,
  maxPodsPerNode: number
): number {
  const kubeReserved = Math.min(
    20 * maxPodsPerNode + 50,
    nodeMemoryMb * 0.25
  );
  const evictionThreshold = 100; // MiB
  return kubeReserved + evictionThreshold;
}

// Source: https://docs.cloud.google.com/kubernetes-engine/docs/concepts/plan-node-sizes

/**
 * GKE CPU reservation formula (regressive tiers)
 */
export function calculateGkeCpuReserved(nodeCpuCores: number): number {
  let reserved = 0;

  // 6% of first core
  reserved += Math.min(nodeCpuCores, 1) * 1000 * 0.06;

  // 1% of next core (up to 2 cores)
  if (nodeCpuCores > 1) {
    reserved += Math.min(nodeCpuCores - 1, 1) * 1000 * 0.01;
  }

  // 0.5% of next 2 cores (up to 4 cores)
  if (nodeCpuCores > 2) {
    reserved += Math.min(nodeCpuCores - 2, 2) * 1000 * 0.005;
  }

  // 0.25% of cores above 4
  if (nodeCpuCores > 4) {
    reserved += (nodeCpuCores - 4) * 1000 * 0.0025;
  }

  return Math.round(reserved); // millicores
}

/**
 * GKE Memory reservation formula (regressive tiers)
 * Plus: 100 MiB eviction threshold
 */
export function calculateGkeMemoryReserved(nodeMemoryMb: number): number {
  let reserved = 0;

  // 255 MiB for machines with less than 1 GiB
  if (nodeMemoryMb < 1024) {
    return 255 + 100; // include eviction
  }

  // 25% of first 4 GiB
  reserved += Math.min(nodeMemoryMb, 4096) * 0.25;

  // 20% of next 4 GiB (up to 8 GiB)
  if (nodeMemoryMb > 4096) {
    reserved += Math.min(nodeMemoryMb - 4096, 4096) * 0.20;
  }

  // 10% of next 8 GiB (up to 16 GiB)
  if (nodeMemoryMb > 8192) {
    reserved += Math.min(nodeMemoryMb - 8192, 8192) * 0.10;
  }

  // 6% of next 112 GiB (up to 128 GiB)
  if (nodeMemoryMb > 16384) {
    reserved += Math.min(nodeMemoryMb - 16384, 114688) * 0.06;
  }

  // 2% above 128 GiB
  if (nodeMemoryMb > 131072) {
    reserved += (nodeMemoryMb - 131072) * 0.02;
  }

  const evictionThreshold = 100; // MiB
  return Math.round(reserved + evictionThreshold);
}
```

### Pattern 3: Nodes Needed Calculation

**What:** Calculate nodes needed by constraint (CPU vs memory), select limiting factor
**When to use:** Core capacity planning calculation
**Example:**

```typescript
// Source: https://wintelguy.com/kubernetes-capacity-calculator.pl
// Verified against https://learnkube.com/allocatable-resources

export interface K8sCapacityInput {
  // Pod workload
  podCpuRequest: number;      // millicores per pod
  podMemoryRequest: number;   // MiB per pod
  podReplicas: number;        // number of pod instances

  // DaemonSet overhead (per node)
  daemonSetCpuPerNode: number;    // millicores
  daemonSetMemoryPerNode: number; // MiB

  // Node specs
  nodeCpuCores: number;       // total CPU cores
  nodeMemoryMb: number;       // total memory in MB

  // System overhead (per node)
  systemReservedCpu: number;     // millicores (OS + K8s)
  systemReservedMemory: number;  // MiB (OS + K8s + eviction)

  // Target utilization
  targetCpuUtilization: number;     // 0-100 percentage
  targetMemoryUtilization: number;  // 0-100 percentage
}

export interface K8sCapacityResult {
  // Allocatable per node
  allocatableCpuPerNode: number;     // millicores
  allocatableMemoryPerNode: number;  // MiB

  // Total requirements
  totalPodCpuRequired: number;       // millicores
  totalPodMemoryRequired: number;    // MiB

  // Target allocatable (accounting for utilization)
  targetCpuPerNode: number;          // millicores
  targetMemoryPerNode: number;       // MiB

  // Nodes needed
  nodesNeededByCpu: number;          // based on CPU constraint
  nodesNeededByMemory: number;       // based on memory constraint
  nodesNeededTotal: number;          // max of CPU/memory

  // Limiting factor
  limitingFactor: "cpu" | "memory";

  // Utilization breakdown
  finalCpuUtilization: number;       // actual % after rounding nodes
  finalMemoryUtilization: number;    // actual % after rounding nodes

  // Warning flags
  overUtilized: boolean;             // >80% on either resource

  // Step-by-step calculation breakdown
  steps: string[];
}

export function calculateK8sCapacity(input: K8sCapacityInput): K8sCapacityResult | null {
  // Validation
  if (input.podReplicas < 1 || input.nodeCpuCores < 1 || input.nodeMemoryMb < 1) {
    return null;
  }

  if (
    input.targetCpuUtilization < 1 || input.targetCpuUtilization > 100 ||
    input.targetMemoryUtilization < 1 || input.targetMemoryUtilization > 100
  ) {
    return null;
  }

  const steps: string[] = [];

  // Step 1: Calculate allocatable resources per node
  const allocatableCpuPerNode =
    input.nodeCpuCores * 1000 - input.systemReservedCpu - input.daemonSetCpuPerNode;
  const allocatableMemoryPerNode =
    input.nodeMemoryMb - input.systemReservedMemory - input.daemonSetMemoryPerNode;

  steps.push(
    `Node allocatable CPU: ${input.nodeCpuCores * 1000}m - ${input.systemReservedCpu}m (system) - ${input.daemonSetCpuPerNode}m (DaemonSets) = ${allocatableCpuPerNode}m`
  );
  steps.push(
    `Node allocatable memory: ${input.nodeMemoryMb} MiB - ${input.systemReservedMemory} MiB (system) - ${input.daemonSetMemoryPerNode} MiB (DaemonSets) = ${allocatableMemoryPerNode} MiB`
  );

  // Step 2: Calculate total pod requirements
  const totalPodCpuRequired = input.podCpuRequest * input.podReplicas;
  const totalPodMemoryRequired = input.podMemoryRequest * input.podReplicas;

  steps.push(
    `Total pod CPU required: ${input.podCpuRequest}m × ${input.podReplicas} pods = ${totalPodCpuRequired}m`
  );
  steps.push(
    `Total pod memory required: ${input.podMemoryRequest} MiB × ${input.podReplicas} pods = ${totalPodMemoryRequired} MiB`
  );

  // Step 3: Calculate target allocatable (accounting for utilization)
  const targetCpuPerNode = allocatableCpuPerNode * (input.targetCpuUtilization / 100);
  const targetMemoryPerNode = allocatableMemoryPerNode * (input.targetMemoryUtilization / 100);

  steps.push(
    `Target CPU per node (${input.targetCpuUtilization}% utilization): ${allocatableCpuPerNode}m × ${input.targetCpuUtilization / 100} = ${targetCpuPerNode.toFixed(0)}m`
  );
  steps.push(
    `Target memory per node (${input.targetMemoryUtilization}% utilization): ${allocatableMemoryPerNode} MiB × ${input.targetMemoryUtilization / 100} = ${targetMemoryPerNode.toFixed(0)} MiB`
  );

  // Step 4: Calculate nodes needed by each constraint
  const nodesNeededByCpu = Math.ceil(totalPodCpuRequired / targetCpuPerNode);
  const nodesNeededByMemory = Math.ceil(totalPodMemoryRequired / targetMemoryPerNode);

  steps.push(
    `Nodes needed (CPU constraint): ceil(${totalPodCpuRequired}m / ${targetCpuPerNode.toFixed(0)}m) = ${nodesNeededByCpu}`
  );
  steps.push(
    `Nodes needed (memory constraint): ceil(${totalPodMemoryRequired} MiB / ${targetMemoryPerNode.toFixed(0)} MiB) = ${nodesNeededByMemory}`
  );

  // Step 5: Select limiting factor (max of CPU/memory)
  const nodesNeededTotal = Math.max(nodesNeededByCpu, nodesNeededByMemory);
  const limitingFactor = nodesNeededByCpu > nodesNeededByMemory ? "cpu" : "memory";

  steps.push(
    `Limiting factor: ${limitingFactor.toUpperCase()} (requires ${nodesNeededTotal} nodes)`
  );

  // Step 6: Calculate final utilization with rounded node count
  const finalCpuUtilization = (totalPodCpuRequired / (allocatableCpuPerNode * nodesNeededTotal)) * 100;
  const finalMemoryUtilization = (totalPodMemoryRequired / (allocatableMemoryPerNode * nodesNeededTotal)) * 100;

  steps.push(
    `Final CPU utilization: ${totalPodCpuRequired}m / (${allocatableCpuPerNode}m × ${nodesNeededTotal} nodes) = ${finalCpuUtilization.toFixed(1)}%`
  );
  steps.push(
    `Final memory utilization: ${totalPodMemoryRequired} MiB / (${allocatableMemoryPerNode} MiB × ${nodesNeededTotal} nodes) = ${finalMemoryUtilization.toFixed(1)}%`
  );

  // Step 7: Check for over-utilization warning
  const overUtilized = finalCpuUtilization > 80 || finalMemoryUtilization > 80;
  if (overUtilized) {
    steps.push(
      `⚠️ WARNING: Utilization exceeds 80% (CPU: ${finalCpuUtilization.toFixed(1)}%, Memory: ${finalMemoryUtilization.toFixed(1)}%)`
    );
  }

  return {
    allocatableCpuPerNode,
    allocatableMemoryPerNode,
    totalPodCpuRequired,
    totalPodMemoryRequired,
    targetCpuPerNode,
    targetMemoryPerNode,
    nodesNeededByCpu,
    nodesNeededByMemory,
    nodesNeededTotal,
    limitingFactor,
    finalCpuUtilization,
    finalMemoryUtilization,
    overUtilized,
    steps,
  };
}
```

### Anti-Patterns to Avoid

- **Ignoring DaemonSets:** DaemonSets run on every node and consume resources - must account for them in capacity planning
- **Single constraint calculation:** Always calculate both CPU and memory constraints, select the limiting factor
- **100% target utilization:** Never set target utilization to 100% - no headroom for autoscaling, traffic spikes, or pod evictions
- **Mixing units:** CPU in millicores (1000m = 1 core), memory in MiB/MB - be consistent
- **Ignoring eviction thresholds:** Eviction thresholds reserve memory to prevent system OOM, must include in system reserved
- **Fixed system reserved:** System reserved varies by node size and provider - use provider-specific formulas for accuracy

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| System reserved formulas | Fixed percentages | Provider-specific formulas (AKS/GKE) | Actual reservations vary by node size, CPU count, max pods |
| CPU vs Memory constraint | Single-dimensional calculation | Multi-dimensional bin packing (calculate both) | Memory typically limiting factor (non-compressible), but depends on workload |
| Node sizing | Manual calculation | Target utilization thresholds (70% CPU, 80% memory) | Industry best practices prevent throttling, OOM kills, provide autoscaling headroom |
| State management with URL sync | Custom URLSearchParams + useState | `createCalculatorStore` factory | Already handles URL sync, debouncing, SSR safety |
| Number parsing from inputs | `parseInt()` / `parseFloat()` | `parseFloat(value) \|\| 0` pattern | Handles empty strings, NaN cases |

**Key insight:** Kubernetes capacity planning is complex due to multi-dimensional constraints (CPU, memory), system reservations that vary by provider and node size, and the need to balance utilization (cost) with reliability (headroom). Use established formulas from official documentation and managed provider specs (AKS, GKE) rather than approximations.

## Common Pitfalls

### Pitfall 1: Assuming 100% Allocatable Capacity

**What goes wrong:** Assuming all node resources (e.g., 16 CPU cores) are available for pods, ignoring system and Kubernetes reservations.
**Why it happens:** Not understanding that kubelet, container runtime, OS services, and eviction thresholds consume significant resources (~20-30% of memory, ~5-10% of CPU).
**How to avoid:**

- Always calculate: `Allocatable = Capacity - SystemReserved - KubeReserved - Eviction`
- Use provider-specific formulas (AKS, GKE have documented reservation tiers)
- Typical reality: ~80% of node capacity is allocatable, not 100%
**Warning signs:** Calculator showing all CPU/memory available for pods without system overhead deduction.

**Sources:**

- [Kubernetes: Reserve Compute Resources](https://kubernetes.io/docs/tasks/administer-cluster/reserve-compute-resources/)
- [AKS Node Resource Reservations](https://learn.microsoft.com/en-us/azure/aks/node-resource-reservations)

### Pitfall 2: Ignoring DaemonSet Overhead

**What goes wrong:** Calculating pod capacity without accounting for DaemonSets (monitoring agents, log collectors, network plugins) that run on every node.
**Why it happens:** DaemonSets are infrastructure, not application workload, so they're easy to forget in capacity planning.
**How to avoid:**

- DaemonSets consume resources on every node (e.g., 200m CPU, 256 MiB memory per node)
- Subtract DaemonSet requirements from allocatable: `Available = Allocatable - DaemonSets`
- Common DaemonSets: node exporter, fluentd/filebeat, CNI plugins, security agents
**Warning signs:** Calculator doesn't have inputs for per-node overhead or DaemonSet resources.

**Source:** [Kubernetes Node Capacity Guide - Densify](https://www.densify.com/kubernetes-autoscaling/kubernetes-node-capacity/)

### Pitfall 3: Single Constraint Calculation (CPU or Memory Only)

**What goes wrong:** Calculating nodes needed based on CPU only, then running out of memory (or vice versa).
**Why it happens:** Not treating Kubernetes scheduling as a multi-dimensional bin-packing problem.
**How to avoid:**

- Always calculate nodes needed by BOTH CPU and memory constraints
- Select the higher node count (the limiting factor)
- Memory is typically the limiting factor (non-compressible, OOM kills)
- CPU is compressible (throttling, not termination)
**Warning signs:** Calculator shows only one constraint, no limiting factor indication.

**Sources:**

- [Kubernetes Bin Packing Strategies](https://blog.techiescamp.com/docs/kubernetes-bin-packing/)
- [Optimizing Resource Utilization - InfoQ](https://www.infoq.com/articles/kubernetes-bin-packing/)

### Pitfall 4: No Headroom for Autoscaling (100% Target Utilization)

**What goes wrong:** Setting target utilization to 100%, leaving no buffer for traffic spikes, autoscaling delays, or rolling updates.
**Why it happens:** Trying to minimize costs by maximizing node utilization.
**How to avoid:**

- Target CPU utilization: 70% (industry standard for HPA)
- Target memory utilization: 80% (higher tolerance, but OOM risk)
- Rationale: 30% CPU buffer handles spikes while new replicas spin up
- Rationale: 20% memory buffer prevents OOM kills during bursts
**Warning signs:** Target utilization set to 90-100%, no mention of autoscaling headroom.

**Sources:**

- [Kubernetes HPA Best Practices](https://www.devzero.io/blog/kubernetes-hpa)
- [Kubernetes Best Practices 2026 - Qovery](https://www.qovery.com/guide/kubernetes-best-practices)

### Pitfall 5: Ignoring Provider-Specific Reservation Formulas

**What goes wrong:** Using generic percentages (e.g., "20% system reserved") when cloud providers use tier-based formulas that vary by node size.
**Why it happens:** Simplifying calculations without consulting provider documentation.
**How to avoid:**

- AKS: Tier-based CPU (60m for 1 core, 740m for 64 cores), memory based on max pods
- GKE: Regressive percentages (6% first core, 1% next, 0.5% next 2, 0.25% above)
- Use official formulas for accuracy, generic percentages for estimates only
- Example: 8-core AKS node reserves 180m CPU (1.8%), not 20%
**Warning signs:** Using fixed percentages for all node sizes, not consulting provider docs.

**Sources:**

- [AKS Node Resource Reservations](https://learn.microsoft.com/en-us/azure/aks/node-resource-reservations)
- [GKE Node Sizing](https://docs.cloud.google.com/kubernetes-engine/docs/concepts/plan-node-sizes)

### Pitfall 6: Mixing Resource Units (CPU millicores vs cores)

**What goes wrong:** Mixing CPU units (1 core vs 1000m) or memory units (MB vs MiB vs GB) leading to calculation errors.
**Why it happens:** Kubernetes uses millicores (1000m = 1 core), but humans think in cores; memory can be MB, MiB, GB, GiB.
**How to avoid:**

- CPU: Always use millicores internally (1 core = 1000m)
- Memory: Use MiB internally (1024 MiB = 1 GiB), convert to GB for display if needed
- Kubernetes uses binary units (MiB, GiB), cloud providers sometimes use decimal (MB, GB)
- Display conversions in UI, but calculate in consistent units
**Warning signs:** Inconsistent units in calculations, off-by-1024 or off-by-1000 errors.

## Code Examples

Verified patterns from official sources:

### Input Validation Pattern

```typescript
// Source: Established pattern from src/lib/converters/infrastructure/vm-storage.ts

export function calculateK8sCapacity(input: K8sCapacityInput): K8sCapacityResult | null {
  // Validate positive counts
  if (input.podReplicas < 1 || input.nodeCpuCores < 1 || input.nodeMemoryMb < 1) {
    return null;
  }

  // Validate positive requests
  if (input.podCpuRequest <= 0 || input.podMemoryRequest <= 0) {
    return null;
  }

  // Validate percentage ranges (1-100, not 0-100 to ensure some headroom)
  if (
    input.targetCpuUtilization < 1 || input.targetCpuUtilization > 100 ||
    input.targetMemoryUtilization < 1 || input.targetMemoryUtilization > 100
  ) {
    return null;
  }

  // Validate non-negative overhead
  if (
    input.systemReservedCpu < 0 || input.systemReservedMemory < 0 ||
    input.daemonSetCpuPerNode < 0 || input.daemonSetMemoryPerNode < 0
  ) {
    return null;
  }

  // Validate sufficient allocatable resources
  const allocatableCpu = input.nodeCpuCores * 1000 - input.systemReservedCpu - input.daemonSetCpuPerNode;
  const allocatableMemory = input.nodeMemoryMb - input.systemReservedMemory - input.daemonSetMemoryPerNode;

  if (allocatableCpu <= 0 || allocatableMemory <= 0) {
    return null; // System overhead exceeds node capacity
  }

  // Proceed with calculation
  // ...
}
```

### Provider Mode Selection

```typescript
// Pattern for supporting multiple cloud providers with different reservation formulas

export type CloudProvider = "custom" | "aks" | "gke" | "eks";

export interface K8sCapacityInput {
  // ... other fields

  // Provider selection
  provider: CloudProvider;

  // Only used if provider === "custom"
  systemReservedCpu?: number;
  systemReservedMemory?: number;

  // Used for provider-specific formulas
  maxPodsPerNode?: number; // AKS memory formula
}

export function calculateSystemReserved(input: K8sCapacityInput): {
  cpu: number; // millicores
  memory: number; // MiB
} {
  if (input.provider === "custom") {
    return {
      cpu: input.systemReservedCpu || 0,
      memory: input.systemReservedMemory || 0,
    };
  }

  if (input.provider === "aks") {
    return {
      cpu: calculateAksCpuReserved(input.nodeCpuCores),
      memory: calculateAksMemoryReserved(input.nodeMemoryMb, input.maxPodsPerNode || 30),
    };
  }

  if (input.provider === "gke") {
    return {
      cpu: calculateGkeCpuReserved(input.nodeCpuCores),
      memory: calculateGkeMemoryReserved(input.nodeMemoryMb),
    };
  }

  // EKS (similar to GKE, simplified)
  return {
    cpu: calculateGkeCpuReserved(input.nodeCpuCores),
    memory: calculateGkeMemoryReserved(input.nodeMemoryMb),
  };
}
```

### Utilization Warning Component

```typescript
// Pattern for displaying warnings when utilization is high

"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface UtilizationWarningProps {
  cpuUtilization: number;
  memoryUtilization: number;
  threshold?: number; // default 80%
}

export function UtilizationWarning({
  cpuUtilization,
  memoryUtilization,
  threshold = 80,
}: UtilizationWarningProps) {
  const overCpu = cpuUtilization > threshold;
  const overMemory = memoryUtilization > threshold;

  if (!overCpu && !overMemory) return null;

  return (
    <Alert variant="warning" className="mt-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        {overCpu && overMemory ? (
          <>
            <strong>High utilization warning:</strong> Both CPU (
            {cpuUtilization.toFixed(1)}%) and memory ({memoryUtilization.toFixed(1)}
            %) exceed {threshold}%. Consider adding more nodes or reducing target
            utilization for better reliability and autoscaling headroom.
          </>
        ) : overCpu ? (
          <>
            <strong>High CPU utilization:</strong> {cpuUtilization.toFixed(1)}%
            exceeds {threshold}%. Risk of CPU throttling and degraded performance.
          </>
        ) : (
          <>
            <strong>High memory utilization:</strong> {memoryUtilization.toFixed(1)}%
            exceeds {threshold}%. Risk of OOM kills and pod evictions.
          </>
        )}
      </AlertDescription>
    </Alert>
  );
}
```

### Limiting Factor Visualization

```typescript
// Pattern for showing which resource (CPU vs memory) is the limiting factor

import { Badge } from "@/components/ui/badge";

interface LimitingFactorBadgeProps {
  limitingFactor: "cpu" | "memory";
  nodesNeededByCpu: number;
  nodesNeededByMemory: number;
}

export function LimitingFactorBadge({
  limitingFactor,
  nodesNeededByCpu,
  nodesNeededByMemory,
}: LimitingFactorBadgeProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">CPU constraint:</span>
        <Badge variant={limitingFactor === "cpu" ? "default" : "outline"}>
          {nodesNeededByCpu} nodes
        </Badge>
        {limitingFactor === "cpu" && (
          <span className="text-xs text-muted-foreground">(limiting)</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Memory constraint:</span>
        <Badge variant={limitingFactor === "memory" ? "default" : "outline"}>
          {nodesNeededByMemory} nodes
        </Badge>
        {limitingFactor === "memory" && (
          <span className="text-xs text-muted-foreground">(limiting)</span>
        )}
      </div>
    </div>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual URL parameter handling | `createUrlSyncMiddleware` factory | v1.0 (2024) | Automatic URL sync, debouncing, SSR safety |
| Fixed system reserved % | Provider-specific formulas | K8s 1.20+ | Accurate capacity based on node size, AKS/GKE/EKS differ |
| CPU-only capacity planning | Multi-dimensional (CPU + memory) | K8s evolution | Memory often limiting factor, both must be calculated |
| 100% target utilization | 70% CPU / 80% memory targets | HPA best practices | Headroom for autoscaling, prevents throttling/OOM |
| Static node pools | Node autoscaling (GKE NAP, Karpenter) | 2020+ | Dynamic capacity, but planning still needed for limits |

**Deprecated/outdated:**

- Fixed 20% system reserved for all node sizes: Use provider-specific tier-based formulas instead
- CPU-only planning: Always calculate both CPU and memory constraints, select max
- Direct `window.location.search` manipulation: URL sync middleware handles this
- Hardcoded English text: Use translation keys from `src/messages/*.json`

## Open Questions

Things that couldn't be fully resolved:

1. **Pod Overhead (Sandbox/RuntimeClass)**
   - What we know: Kubernetes supports pod overhead for sandbox runtimes (gVisor, Kata Containers) via RuntimeClass
   - What's unclear: Should calculator include pod overhead input field, or assume default runtimes (Docker/containerd) with negligible overhead?
   - Recommendation: Start without pod overhead (assume default runtime). Include help text explaining this assumes Docker/containerd. Could add as advanced option if users request sandbox runtime support.

2. **Multiple Workload Types**
   - What we know: Real clusters have multiple workload types (web servers, databases, batch jobs) with different resource profiles
   - What's unclear: Should calculator support multiple pod profile types (like VM Storage Calculator supports multiple VM configs)?
   - Recommendation: Start with single pod profile for simplicity. Total requirements can be calculated externally and entered as aggregate. Could add multiple profiles in future enhancement.

3. **Node Anti-Affinity and Topology Constraints**
   - What we know: Production clusters often require pod anti-affinity (spread across nodes/zones for HA), increasing node requirements
   - What's unclear: Should calculator model topology constraints (e.g., "3 replicas across 3 zones minimum")?
   - Recommendation: Focus on resource-based capacity planning. Include help text mentioning anti-affinity may require additional nodes. Topology-aware planning is advanced feature for future.

4. **Burstable vs Guaranteed QoS**
   - What we know: Kubernetes QoS classes (Guaranteed, Burstable, BestEffort) affect scheduling and eviction, but capacity planning typically uses requests (not limits)
   - What's unclear: Should calculator show impact of requests vs limits, or assume requests === limits (Guaranteed QoS)?
   - Recommendation: Use requests for capacity planning (standard practice). Could add note about limits and QoS in help text. Over-commitment (requests < limits) is advanced topic.

## Sources

### Primary (HIGH confidence)

- **Kubernetes Official Documentation**
  - [Reserve Compute Resources for System Daemons](https://kubernetes.io/docs/tasks/administer-cluster/reserve-compute-resources/)
  - [Resource Management for Pods and Containers](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/)
  - [Resource Bin Packing](https://kubernetes.io/docs/concepts/scheduling-eviction/resource-bin-packing/)

- **Microsoft Azure AKS**
  - [Node Resource Reservations in AKS](https://learn.microsoft.com/en-us/azure/aks/node-resource-reservations)

- **Google Cloud GKE**
  - [About GKE Node Sizing](https://docs.cloud.google.com/kubernetes-engine/docs/concepts/plan-node-sizes)
  - [Resources Available for Workloads](https://docs.cloud.google.com/kubernetes-engine/distributed-cloud/vmware/docs/how-to/resources-available-pods)

- **Converty Codebase**
  - `src/stores/calculator-store.ts` (factory pattern)
  - `src/lib/converters/infrastructure/vm-storage.ts` (calculation pattern, established Phase 27)

- **Reference Implementations**
  - [WintelGuy Kubernetes Capacity Calculator](https://wintelguy.com/kubernetes-capacity-calculator.pl)

### Secondary (MEDIUM confidence)

- **Kubernetes Best Practices**
  - [Kubernetes Node Capacity: Step by Step Planning Guide - Densify](https://www.densify.com/kubernetes-autoscaling/kubernetes-node-capacity/)
  - [Kubernetes Capacity Planning - Sysdig](https://www.sysdig.com/blog/kubernetes-capacity-planning)
  - [Kubernetes Best Practices 2026 - Qovery](https://www.qovery.com/guide/kubernetes-best-practices)
  - [How to Right Size a Kubernetes Cluster - Akamai](https://www.linode.com/blog/kubernetes/how-to-right-size-a-kubernetes-cluster-for-efficiency/)

- **Cloud Provider Comparisons**
  - [EKS vs AKS vs GKE Comparison 2026 - Tasrie IT](https://tasrieit.com/blog/eks-vs-aks-vs-gke-comparison-2026)
  - [Kubernetes Pricing 2026: EKS vs AKS vs GKE - Sedai](https://sedai.io/blog/kubernetes-cost-eks-vs-aks-vs-gke)

- **Capacity Planning Resources**
  - [Introduction to K8s Resources, Capacity and Allocatable - Medium (HungWei Chiu)](https://hwchiu.medium.com/introduction-to-kubernetes-resources-capacity-and-allocatable-4dc1bfbd1caf)
  - [Allocatable Memory and CPU in K8s Nodes - LearnKube](https://learnkube.com/allocatable-resources)
  - [Reserved CPU and Memory in K8s Nodes - Medium (Daniele Polencic)](https://medium.com/@danielepolencic/reserved-cpu-and-memory-in-kubernetes-nodes-65aee1946afd)

- **HPA and Autoscaling**
  - [Kubernetes HPA: Scale Pods Based on Resource Usage - DevZero](https://www.devzero.io/blog/kubernetes-hpa)
  - [Kubernetes Autoscaling: CPU vs Memory - Medium (Shubham Gupta)](https://medium.com/@g22shubham/kubernetes-autoscaling-cpu-vs-memory-44c769b7d102)

- **Bin Packing and Scheduling**
  - [Kubernetes Bin Packing Strategies - Techies Camp](https://blog.techiescamp.com/docs/kubernetes-bin-packing/)
  - [Optimizing Resource Utilization: Bin Packing in K8s - InfoQ](https://www.infoq.com/articles/kubernetes-bin-packing/)
  - [Kubernetes Scheduling Strategies - CloudPilot AI](https://www.cloudpilot.ai/en/blog/k8s-scheduling-strategy/)

### Tertiary (LOW confidence)

- Community discussions on AKS max pods per node defaults (30 vs 110 vs 250)
- Blog posts comparing EKS instance types and pod limits by CNI
- General capacity planning formulas without K8s-specific verification

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH - Established in codebase since v1.0, no new dependencies needed
- Architecture: HIGH - Verified patterns from existing calculators (Phase 27 VM Storage), `createCalculatorStore` factory documented
- K8s formulas: HIGH - Verified from official Kubernetes documentation, AKS/GKE official docs, reference implementations
- Provider formulas: HIGH - AKS and GKE formulas from official Microsoft/Google documentation
- Best practices: MEDIUM - Target utilization thresholds (70% CPU, 80% memory) from HPA guides and industry practice, not official K8s spec
- Pod limits by provider: MEDIUM - Based on CNI documentation and provider blogs, varies by cluster configuration

**Research date:** 2026-01-25
**Valid until:** 2026-02-25 (30 days - K8s capacity formulas are stable, provider-specific reservations occasionally updated)

**Notes:**

- All calculations assume default pod overhead (Docker/containerd runtime), not sandbox runtimes (gVisor, Kata)
- Calculations assume allocatable resources based on requests (not limits) - standard capacity planning practice
- System reserved formulas for AKS 1.29+, GKE recent versions - older K8s versions may differ
- DaemonSet overhead is user-specified (varies by cluster monitoring/security stack)
- Reference implementation at wintelguy.com verified as authoritative source for formula validation
- CPU in millicores (1000m = 1 core), memory in MiB for internal calculations
