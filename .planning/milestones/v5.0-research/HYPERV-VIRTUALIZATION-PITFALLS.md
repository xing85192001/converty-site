# Hyper-V & Virtualization Platform Pitfalls

**Research Date:** 2026-01-27
**Domain:** Multi-Hypervisor Infrastructure Calculators
**Context:** Expanding from v4.0 VMware-only to Hyper-V, Proxmox, XCP-ng
**Audience:** Future implementers

## Overview

This document catalogs 20+ pitfalls discovered during research for multi-hypervisor calculator implementation. Each pitfall includes:

- **Description:** What the pitfall is
- **Impact:** User-facing consequences
- **Prevention:** How to avoid it
- **Phase:** When to address (planning/implementation/testing/post-launch)

---

## Category 1: Licensing Complexity (HIGH RISK)

### Pitfall 1: Windows Server Core Licensing Minimums

**Description:** Windows Server Datacenter/Standard has complex minimum licensing requirements:

- Minimum 16 cores per server (even if server has 8 cores)
- Minimum 8 cores per processor (2-socket server with 4 cores each = 16 core licenses)
- Licenses sold in 2-core packs
- Downgrade rights from Datacenter to Standard not intuitive

**Impact:** Calculator shows incorrect licensing costs, users under-purchase licenses, compliance violations

**Prevention:**

```typescript
// Always apply minimums
const MIN_CORES_PER_SERVER = 16;
const MIN_CORES_PER_PROCESSOR = 8;
const CORES_PER_LICENSE_PACK = 2;

const licensableCores = Math.max(
  physicalCores,
  hostCount * MIN_CORES_PER_SERVER,
  processorCount * MIN_CORES_PER_PROCESSOR
);
const coreLicenses = Math.ceil(licensableCores / CORES_PER_LICENSE_PACK);
```

**Testing:**

- Test with 8-core server (should require 16 core licenses)
- Test with 2-socket × 6-core (12 total) server (should require 16 licenses)
- Test with 2-socket × 12-core (24 total) server (should require 24 licenses, not 16)

**Phase:** Planning & Implementation

**References:**

- [Microsoft Licensing Q&A](https://learn.microsoft.com/en-us/answers/questions/2068031/windows-server-2022-hyper-v-licensing-costs)

---

### Pitfall 2: VMware Subscription Model Confusion

**Description:** Broadcom changed VMware licensing from perpetual to subscription (VCF/VVF) in 2024. Users accustomed to old model may misunderstand:

- VCF = $175/core/year (not one-time)
- Minimum 16 cores per host
- No more à la carte (must buy full bundle)

**Impact:** User calculates one-time cost when it's actually annual, massive budget errors

**Prevention:**

- Clearly label "Annual Subscription" vs "Perpetual License"
- Show 3-year and 5-year TCO, not just year 1
- Add warning: "VMware VCF pricing is subscription-based (annual recurring)"
- Link to official VMware pricing page with "Pricing as of [date]" disclaimer

**Testing:**

- Verify "Per Year" appears prominently in licensing output
- Check TCO calculation shows recurring costs in years 2-5
- Ensure PDF export clarifies subscription model

**Phase:** Implementation & Testing

---

### Pitfall 3: Proxmox "Free" vs "Subscription" Ambiguity

**Description:** Proxmox VE is free and open source, but optional subscriptions ($960/CPU/year) provide:

- Enterprise repository (stable updates)
- Official support
- Not required for production use

Users may be confused whether subscription is mandatory.

**Impact:** Budget confusion, misunderstanding of total cost

**Prevention:**

- Add "(Optional)" label to Proxmox subscription in TCO
- Explain: "Proxmox subscription provides enterprise repository and support but is not required"
- Show TCO with and without subscription as comparison
- Default to "No subscription" but allow user to enable

**Testing:**

- Verify "Optional" appears in licensing section
- Check TCO shows $0 licensing when subscription disabled
- Ensure export includes subscription status

**Phase:** Planning & Implementation

---

## Category 2: Overhead & Performance Assumptions (MEDIUM RISK)

### Pitfall 4: Workload-Dependent Overhead Varies Widely

**Description:** Hypervisor overhead depends on workload type:

- Windows VMs: VMware 12%, Hyper-V 8% (Hyper-V more efficient with Windows)
- Linux VMs: Proxmox/KVM 6%, VMware 10% (KVM more efficient with Linux)
- Mixed workloads: Use weighted average

Assuming constant overhead leads to undersizing or oversizing.

**Impact:** Incorrect host count calculations, performance issues or wasted hardware

**Prevention:**

- Store overhead by platform AND workload type in JSON:

  ```json
  {
    "hyper-v": { "windows": 0.08, "linux": 0.10, "mixed": 0.09 }
  }
  ```

- Ask user for workload type (Windows/Linux/Mixed)
- Default to "Mixed" (conservative middle ground)
- Document assumptions in results: "Assuming 9% overhead for mixed Windows/Linux workload"

**Testing:**

- Verify different overhead values produce different host counts
- Test edge case: 100% Windows on Hyper-V should use 8%, not 10%
- Ensure export shows workload type and overhead factor used

**Phase:** Planning & Implementation

**References:**

- [Proxmox vs Hyper-V: Overhead Debate](https://medium.com/@PlanB./proxmox-vs-hyper-v-the-great-overhead-debate-7271ebf80dac)

---

### Pitfall 5: HA Overhead Misunderstood

**Description:** N+1 HA doesn't mean "add 1 host." It means cluster must run full workload with 1 host down:

- Incorrect: 4 hosts needed → add 1 → 5 hosts
- Correct: 4 hosts × capacity must fit in 3 hosts → need 6 hosts total

**Impact:** Cluster undersized, HA failover causes oversubscription and outages

**Prevention:**

```typescript
// Correct N+1 calculation
const baseHostsNeeded = Math.ceil(totalResources / resourcesPerHost);
const haHostsNeeded = Math.ceil(totalResources / ((baseHostsNeeded + 1 - 1) * resourcesPerHost)) + 1;

// Or use admission control: total_capacity / (hosts - N_failures) ≥ workload
```

- Add explainer: "N+1 means cluster survives 1 host failure without oversubscription"
- Show calculation breakdown: "4 hosts needed for workload → 5 hosts with N+1 (80% max utilization)"

**Testing:**

- Test with known scenarios from vendor calculators
- Verify 100 VMs requiring 4 hosts → 5 hosts with N+1
- Check N+2 requires 6 hosts, not 5

**Phase:** Planning & Implementation

---

### Pitfall 6: Storage Overhead Stacking

**Description:** Multiple storage overhead factors stack multiplicatively, not additively:

- Thin provisioning over-commitment: 1.5× (50% over)
- Snapshot overhead: 1.15× (15%)
- Replication (Hyper-V Replica): 2× (duplicate)
- Total: 1.5 × 1.15 × 2 = 3.45× raw storage, not 1.5 + 0.15 + 1 = 2.65×

**Impact:** Storage significantly undersized, out-of-space errors

**Prevention:**

```typescript
let effectiveStorage = vmStorageRequirements;

if (thinProvisioning) {
  effectiveStorage *= 1.5; // Over-commitment
}

effectiveStorage *= (1 + snapshotOverhead); // e.g., 1.15

if (replicationEnabled) {
  effectiveStorage *= 2; // Duplicate at DR site
}
```

- Show storage breakdown:

  ```
  Base: 100 TB
  + Thin over-commitment (50%): 150 TB
  + Snapshot overhead (15%): 172.5 TB
  + Replication (2×): 345 TB raw capacity needed
  ```

**Testing:**

- Verify stacking formula (multiplicative, not additive)
- Test with all factors enabled vs individually
- Check export shows breakdown

**Phase:** Implementation

---

## Category 3: Platform-Specific Quirks (MEDIUM RISK)

### Pitfall 7: Hyper-V Replica Bandwidth Assumptions

**Description:** Hyper-V Replica replicates changes over network. Bandwidth requirements depend on:

- Change rate (% of VM disk that changes per interval)
- Replication frequency (5 min, 15 min, 30 min)
- Compression ratio (~50% reduction typical)

Simple "2× storage" doesn't account for network constraints.

**Impact:** Replication fails due to insufficient bandwidth, DR protection broken

**Prevention:**

- Add Hyper-V Replica Bandwidth Calculator (separate calculator)
- Formula: `Bandwidth = (VM_size × change_rate / interval) × (1 - compression)`
- Example: 500 GB VM, 10% change rate, 15-min interval, 50% compression:
  - `(500 GB × 0.10 / 15 min) × 0.5 = 1.67 GB/min = ~222 Mbps`
- Warn if bandwidth > available network capacity

**Testing:**

- Verify bandwidth calculation matches Microsoft guidelines
- Test with various change rates (1%, 10%, 50%)
- Check warning appears when bandwidth exceeds network capacity

**Phase:** Implementation (if Replica Bandwidth calculator added)

**References:**

- [Microsoft Capacity Planner for Hyper-V Replica](https://www.microsoft.com/en-us/download/details.aspx?id=39057)

---

### Pitfall 8: Proxmox Ceph Quorum Requirements

**Description:** Ceph requires odd number of nodes (3, 5, 7) for quorum. 2-node or 4-node clusters don't work:

- 2 nodes: Split-brain risk (no tiebreaker)
- 4 nodes: Only 1 node failure tolerance (need 3 for quorum)
- Optimal: 3 (start), 5 (production), 7 (large)

**Impact:** User plans 2-node or 4-node Ceph cluster, discovers it doesn't work during deployment

**Prevention:**

- Validate node count: `if (nodeCount % 2 === 0) { warn("Ceph requires odd number of nodes"); }`
- Recommend minimum 3 nodes for Ceph
- Show warning: "2-node Ceph not recommended. Consider 3 nodes or external quorum device."
- For 4-node input, suggest: "4 nodes provides same fault tolerance as 3. Consider 5 nodes for better HA."

**Testing:**

- Test 2-node input shows warning
- Test 4-node shows recommendation for 5
- Test 3, 5, 7 nodes pass validation

**Phase:** Planning & Implementation

**References:**

- [Proxmox HA Cluster Documentation](https://pve.proxmox.com/wiki/High_Availability_Cluster)

---

### Pitfall 9: XCP-ng Maximum Limits

**Description:** XCP-ng has hard limits:

- Max 16 nodes per pool
- Max 5 TB RAM per host
- Max 288 logical processors per host

Exceeding these limits causes calculator to suggest impossible configurations.

**Impact:** User gets sizing recommendation that can't be deployed

**Prevention:**

```typescript
const XCP_NG_LIMITS = {
  maxNodesPerPool: 16,
  maxRamPerHostGB: 5120, // 5 TB
  maxCpusPerHost: 288,
};

if (calculatedHosts > XCP_NG_LIMITS.maxNodesPerPool) {
  warn(`XCP-ng pools limited to 16 nodes. Consider multiple pools or different platform.`);
}

if (hostRamGB > XCP_NG_LIMITS.maxRamPerHostGB) {
  error(`Host RAM ${hostRamGB} GB exceeds XCP-ng maximum ${XCP_NG_LIMITS.maxRamPerHostGB} GB`);
}
```

**Testing:**

- Test with 20-host calculation (should warn about 16-node limit)
- Test with 6 TB RAM per host (should error)
- Verify limits match official XCP-ng documentation

**Phase:** Planning & Implementation

**References:**

- [XCP-ng Configuration Limits](https://docs.xenserver.com/en-us/citrix-hypervisor/system-requirements/configuration-limits.html)

---

## Category 4: Cost & TCO Pitfalls (HIGH RISK)

### Pitfall 10: Hidden Migration Costs

**Description:** TCO calculators often ignore migration effort when comparing platforms:

- VMware → Hyper-V: Moderate effort (VM conversion, network reconfiguration)
- VMware → Proxmox: High effort (no automated tools, manual migration)
- Cost: Consultant fees, downtime, testing, training

**Impact:** TCO shows Proxmox is 60% cheaper, but migration costs $200K (wiping out 2-year savings)

**Prevention:**

- Include migration cost field with guidance:
  - VMware → Hyper-V: $50K-$150K (tooling exists)
  - VMware → Proxmox/XCP-ng: $100K-$250K (manual effort)
  - Staying on VMware: $0
- Add slider or dropdown: "Migration effort: Low/Medium/High"
- Default to "Medium" for safety
- Show TCO with and without migration: "Break-even point: Year 3"

**Testing:**

- Verify migration cost appears in TCO breakdown
- Test break-even calculation
- Check export includes migration cost

**Phase:** Planning & Implementation

---

### Pitfall 11: Support Cost Variability

**Description:** Support costs vary by vendor and tier:

- VMware: ~20% of license cost (expensive)
- Windows Server: ~$1,500/host/year (moderate)
- Proxmox: $960/CPU/year optional (cheap but optional)
- XCP-ng: Community (free) vs Pro ($1,000/host/year)

Assuming "same support cost" across platforms misleads TCO.

**Impact:** TCO comparison inaccurate, surprise costs post-migration

**Prevention:**

- Store platform-specific support costs in JSON:

  ```json
  {
    "vmware-vcf": { "supportPercent": 0.20, "costModel": "percent-of-license" },
    "hyper-v": { "costPerHost": 1500, "costModel": "per-host" },
    "proxmox": { "costPerCpu": 960, "optional": true, "costModel": "per-cpu" }
  }
  ```

- Allow user to toggle "Include support costs" with platform-specific defaults
- Show support cost breakdown in TCO: "Support: VMware $500K/yr vs Hyper-V $75K/yr"

**Testing:**

- Verify different support models produce different TCO
- Test "optional" support toggle for Proxmox/XCP-ng
- Check export shows support cost assumptions

**Phase:** Planning & Implementation

---

### Pitfall 12: Training Cost Often Ignored

**Description:** Platform migration requires staff training:

- VMware → Hyper-V: Moderate ($20K-$50K for team training)
- VMware → Proxmox/XCP-ng: Higher ($30K-$70K due to less commercial training)
- Internal expertise: If team already knows platform, $0

Ignoring training makes open-source platforms look artificially cheap.

**Impact:** TCO underestimates total cost, project over budget

**Prevention:**

- Add training cost to TCO with reasonable defaults:
  - VMware: $50K (assume familiarity, advanced training)
  - Hyper-V: $30K (Microsoft training ecosystem)
  - Proxmox: $40K (community-driven, less structured)
  - XCP-ng: $45K (Xen knowledge less common)
- Allow user to override: "Team already trained in Hyper-V? Set training cost to $0"
- Include in year 1 CapEx (one-time)

**Testing:**

- Verify training cost appears in year 1 TCO
- Test with training cost = $0 (no impact)
- Check export shows training cost assumptions

**Phase:** Planning

---

## Category 5: Feature Comparison Accuracy (MEDIUM RISK)

### Pitfall 13: Feature Equivalence Is Not Binary

**Description:** Saying "both have live migration" oversimplifies:

- VMware vMotion: Works across vSwitches, storage types, CPUs (with EVC)
- Hyper-V Live Migration: Requires shared storage or SMB 3.0
- Proxmox: Storage migration separate from VM migration
- XCP-ng: Storage XenMotion is separate feature

Features are "Yes" but with different capabilities.

**Impact:** User expects feature parity, discovers limitations post-migration

**Prevention:**

- Add "notes" field to feature matrix:

  ```json
  {
    "live_migration": {
      "vmware": { "available": true, "notes": "vMotion across any storage with vSphere" },
      "hyper-v": { "available": true, "notes": "Requires shared storage or SMB 3.0" }
    }
  }
  ```

- Show tooltip with limitations on hover
- Add "Learn more" links to vendor documentation

**Testing:**

- Verify notes appear in feature comparison UI
- Check tooltips render correctly
- Ensure export includes feature notes

**Phase:** Implementation

---

### Pitfall 14: Version-Specific Feature Differences

**Description:** Features vary by version:

- Hyper-V 2016 vs 2019 vs 2022 vs 2025 (nested virtualization in 2016+, GPU partitioning in 2025)
- Proxmox VE 7 vs 8 (Ceph Quincy in 8)
- XCP-ng 8.2 vs 8.3 (different storage features)

Calculator showing "Hyper-V has feature X" may be wrong for older versions.

**Impact:** User deploys older version, feature not available

**Prevention:**

- Document version assumptions: "Feature matrix based on Hyper-V 2025, Proxmox VE 8.3, XCP-ng 8.3 (as of Jan 2026)"
- Add disclaimer: "Features may vary by version. Verify with vendor documentation for your specific version."
- Link to official feature matrices

**Testing:**

- Ensure version assumptions documented in UI and exports
- Check disclaimer appears prominently

**Phase:** Planning & Documentation

---

## Category 6: Data Accuracy & Maintenance (HIGH RISK)

### Pitfall 15: Pricing Data Becomes Stale

**Description:** Licensing costs change:

- Broadcom doubled VMware prices in 2023-2024
- Microsoft adjusts Windows Server pricing periodically
- Proxmox increased subscription cost over time

Hardcoded prices become inaccurate within months.

**Impact:** TCO calculations wildly incorrect, users make bad decisions

**Prevention:**

- Store pricing with date stamps:

  ```json
  {
    "vmware-vcf": { "perCoreAnnual": 175, "updated": "2026-01-27", "sourceUrl": "..." }
  }
  ```

- Display "Pricing as of [date]" prominently in results
- Add warning if pricing > 6 months old: "⚠️ Pricing data from [date]. Verify with vendor."
- Link to vendor pricing pages: "See current pricing at [vendor URL]"
- Create calendar reminder to review pricing quarterly

**Testing:**

- Verify date appears in all cost-related outputs
- Test with mock "old date" shows warning
- Check source URL links work

**Phase:** Planning & Post-Launch (ongoing maintenance)

---

### Pitfall 16: Overhead Factors Require Updates

**Description:** Hypervisor overhead changes with versions:

- VMware ESXi 7 vs 8 (different overhead)
- Hyper-V 2019 vs 2025 (improved efficiency)
- KVM kernel improvements reduce overhead over time

Static overhead factors become inaccurate.

**Impact:** Sizing recommendations slowly drift from reality

**Prevention:**

- Document overhead sources in JSON:

  ```json
  {
    "hyper-v": {
      "overhead": { "windows": 0.08 },
      "version": "2025",
      "updated": "2026-01-27",
      "source": "Microsoft TechNet article [URL]"
    }
  }
  ```

- Add disclaimer: "Overhead estimates based on [version] as of [date]. Actual overhead may vary."
- Set annual review cadence for overhead factors
- Test with real-world deployments when possible

**Testing:**

- Verify version and date appear in advanced settings/info
- Check disclaimer in documentation

**Phase:** Planning & Post-Launch

---

### Pitfall 17: Feature Matrix Incomplete or Biased

**Description:** Feature comparisons risk bias or incompleteness:

- Listing only features that favor one platform
- Ignoring limitations or "gotchas"
- Overly technical jargon alienates users

**Impact:** Users make uninformed decisions, feel misled

**Prevention:**

- Use neutral, factual language: "VMware has X, Hyper-V has Y" (not "VMware is better")
- Include both strengths and limitations:
  - VMware: "Advanced DRS, but expensive licensing"
  - Hyper-V: "Lower cost, but limited third-party tool ecosystem"
- Link to independent comparisons (not vendor marketing)
- Review feature matrix with community for bias check

**Testing:**

- Have unbiased reviewer check feature descriptions
- Test with users unfamiliar with platforms (comprehension check)

**Phase:** Planning & Review

---

## Category 7: User Input Validation (MEDIUM RISK)

### Pitfall 18: Unrealistic Input Values

**Description:** Users may enter nonsensical values:

- 10,000 vCPU per VM (typo, meant 10)
- 0 VMs (testing, but breaks calculations)
- 1 GB RAM per VM (too small for any OS)
- Negative values

**Impact:** Calculator produces garbage results, user confused

**Prevention:**

```typescript
// Add validation with reasonable bounds
const VM_VCPU_MIN = 1;
const VM_VCPU_MAX = 128; // Practical limit for most hypervisors
const VM_RAM_MIN = 2; // GB, minimum for modern OS
const VM_RAM_MAX = 24576; // 24 TB, current maximum

if (vcpuPerVm < VM_VCPU_MIN || vcpuPerVm > VM_VCPU_MAX) {
  error(`vCPU per VM must be between ${VM_VCPU_MIN} and ${VM_VCPU_MAX}`);
}
```

- Show validation errors inline (not just on submit)
- Suggest typical ranges: "Typical: 2-16 vCPU per VM"
- Allow override for edge cases with warning

**Testing:**

- Test boundary values (0, negative, extremely large)
- Verify helpful error messages
- Check calculator doesn't crash on invalid input

**Phase:** Implementation

---

### Pitfall 19: Mismatched Host Specs and Workload

**Description:** User enters host specs that can't run workload:

- Host has 48 cores, user requests 100 VMs with 4 vCPU each = 400 vCPU needed
- Calculator says "9 hosts needed" but doesn't check if 400 vCPU physically fits

Real issue: After overhead, only ~44 effective cores per host → need 10 hosts, not 9.

**Impact:** Undersized cluster, performance issues

**Prevention:**

- Validate: `effectiveHostCapacity = hostCores × (1 - overhead)`
- Check: `totalWorkload ≤ effectiveClusterCapacity`
- Warn if utilization > 80%: "Cluster at 85% capacity. Recommended <80% for burst workloads."

**Testing:**

- Test with tight host specs (should warn or error)
- Verify warning appears when utilization >80%
- Check HA scenarios (N+1 should still be <80% utilization)

**Phase:** Implementation

---

## Category 8: Export & Documentation (LOW RISK)

### Pitfall 20: PDF Export Lacks Context

**Description:** Exported PDF shows numbers without assumptions:

```
Total hosts needed: 5
Total cost: $150,000
```

User reviews PDF 3 months later, doesn't remember:

- Which platform?
- What assumptions (overhead, HA level)?
- What date (pricing may have changed)?

**Impact:** PDF is not self-documenting, requires referencing calculator UI

**Prevention:**

- Include header in PDF:

  ```
  Hyper-V Consolidation Calculator
  Platform: Microsoft Hyper-V 2025
  Generated: 2026-01-27
  Pricing as of: 2026-01-27
  ```

- Include assumptions section:

  ```
  Assumptions:
  - Workload: Mixed Windows/Linux
  - Overhead: 9%
  - HA Level: N+1
  - Licensing: Windows Server Datacenter
  ```

- Add footer: "Generated by Converty | Verify assumptions before procurement"

**Testing:**

- Review exported PDF for completeness
- Ensure all assumptions visible
- Check PDF is usable standalone (no missing context)

**Phase:** Implementation

---

### Pitfall 21: CSV Export for Comparison Not Structured

**Description:** Exporting TCO comparison as CSV for multiple platforms:

```csv
Hardware,Licensing,Support,Total
$2M,$2.5M,$500K,$5M
```

Without platform labels, CSV is useless.

**Impact:** User can't use CSV data in presentations or analysis tools

**Prevention:**

```csv
Platform,Hardware,Licensing,Support,Training,Migration,Total
VMware VCF,$2000000,$2500000,$500000,$50000,$0,$5050000
Hyper-V,$2000000,$800000,$200000,$30000,$100000,$3130000
Proxmox VE,$2000000,$50000,$150000,$20000,$150000,$2370000
```

- First column: Platform name
- Header row with clear labels
- All cost values as numbers (not formatted strings) for Excel formulas

**Testing:**

- Export CSV and open in Excel
- Verify formulas work (SUM, etc.)
- Check platform names appear correctly

**Phase:** Implementation

---

## Category 9: Mobile & Accessibility (LOW RISK)

### Pitfall 22: Complex Comparison Tables on Mobile

**Description:** Side-by-side platform comparison table with 5+ columns:

```
| Feature        | VMware | Hyper-V | Proxmox | XCP-ng |
|----------------|--------|---------|---------|--------|
| Live Migration | Yes    | Yes     | Yes     | Yes    |
| ...            | ...    | ...     | ...     | ...    |
```

Doesn't fit on mobile screen, requires horizontal scroll (poor UX).

**Impact:** Mobile users can't compare platforms effectively

**Prevention:**

- Use accordion/collapsible sections on mobile:

  ```
  [VMware] (expand)
    - Live Migration: Yes
    - HA: Yes
    - ...

  [Hyper-V] (expand)
    - Live Migration: Yes (requires shared storage)
    - HA: Yes
    - ...
  ```

- Or use tabs: "[VMware] [Hyper-V] [Proxmox] [XCP-ng]" (one visible at a time)
- Allow horizontal scroll with visual hint ("swipe for more →")

**Testing:**

- Test on iPhone SE (smallest common screen)
- Test on iPad (tablet view)
- Verify comparison usable without pinch-zoom

**Phase:** Implementation & Testing

---

## Category 10: Platform-Specific Edge Cases

### Pitfall 23: Hyper-V Standard Edition VM Limits

**Description:** Windows Server Standard edition includes only 2 VM instances per license:

- 1 server with 96 cores = 6 × 16-core license packs = $6,414
- But only 2 VMs allowed!
- For 80 VMs, need 40 Standard licenses ($256K) vs 1 Datacenter ($195K)

Calculator that always recommends Standard is wrong for >2 VMs.

**Impact:** User buys wrong license, discovers compliance issue

**Prevention:**

```typescript
const vmInstancesPerStandardLicense = 2;
const standardLicensesNeeded = Math.ceil(vmCount / vmInstancesPerStandardLicense);
const standardTotalCost = standardLicensesNeeded * STANDARD_LICENSE_COST;
const datacenterTotalCost = datacenterLicensesNeeded * DATACENTER_LICENSE_COST;

if (standardTotalCost > datacenterTotalCost) {
  recommend = 'Datacenter';
  message = `For ${vmCount} VMs, Datacenter ($${datacenterTotalCost}) is cheaper than Standard ($${standardTotalCost})`;
}
```

- Show break-even point: "Datacenter becomes cost-effective at 13+ VMs per host"
- Recommend Datacenter automatically when cost-effective

**Testing:**

- Test with 2 VMs (should recommend Standard)
- Test with 20 VMs (should recommend Datacenter)
- Verify break-even calculation at ~13 VMs

**Phase:** Planning & Implementation

---

## Summary Table

| # | Pitfall | Risk | Impact | Phase | Prevention Cost |
|---|---------|------|--------|-------|-----------------|
| 1 | Windows core licensing minimums | HIGH | HIGH | Planning/Impl | Low (add constants) |
| 2 | VMware subscription confusion | HIGH | HIGH | Impl/Test | Low (add labels) |
| 3 | Proxmox subscription ambiguity | MEDIUM | MEDIUM | Planning/Impl | Low (add optional toggle) |
| 4 | Workload-dependent overhead | MEDIUM | HIGH | Planning/Impl | Medium (JSON data + selector) |
| 5 | HA overhead misunderstood | HIGH | HIGH | Planning/Impl | Medium (correct formula + explainer) |
| 6 | Storage overhead stacking | HIGH | HIGH | Impl | Low (multiplicative formula) |
| 7 | Hyper-V Replica bandwidth | MEDIUM | MEDIUM | Impl (optional calc) | Medium (new calculator) |
| 8 | Proxmox Ceph quorum | MEDIUM | HIGH | Planning/Impl | Low (validation + warning) |
| 9 | XCP-ng limits | MEDIUM | HIGH | Planning/Impl | Low (add limits checks) |
| 10 | Hidden migration costs | HIGH | HIGH | Planning/Impl | Medium (add cost field + guidance) |
| 11 | Support cost variability | MEDIUM | MEDIUM | Planning/Impl | Medium (platform-specific costs) |
| 12 | Training cost ignored | MEDIUM | MEDIUM | Planning | Low (add training field) |
| 13 | Feature equivalence not binary | MEDIUM | MEDIUM | Impl | Medium (notes field + tooltips) |
| 14 | Version-specific features | LOW | LOW | Planning/Docs | Low (add version docs) |
| 15 | Pricing data stale | HIGH | HIGH | Post-Launch | Low (date stamps + reminders) |
| 16 | Overhead factors stale | MEDIUM | MEDIUM | Post-Launch | Low (document sources) |
| 17 | Feature matrix bias | LOW | MEDIUM | Review | Medium (neutral review) |
| 18 | Unrealistic input values | MEDIUM | LOW | Impl | Low (validation + bounds) |
| 19 | Mismatched specs/workload | MEDIUM | HIGH | Impl | Low (capacity validation) |
| 20 | PDF lacks context | LOW | LOW | Impl | Low (add header/assumptions) |
| 21 | CSV not structured | LOW | LOW | Impl | Low (add platform column) |
| 22 | Complex tables on mobile | LOW | MEDIUM | Impl/Test | Medium (responsive design) |
| 23 | Hyper-V Standard VM limits | HIGH | HIGH | Planning/Impl | Medium (break-even logic) |

**Total Pitfalls:** 23
**High Risk:** 9 (39%)
**Medium Risk:** 11 (48%)
**Low Risk:** 3 (13%)

---

## Prevention Strategy by Phase

### Planning Phase (Before Implementation)

- [ ] Pitfall 1: Windows licensing minimums (research formulas)
- [ ] Pitfall 3: Proxmox subscription model (decide on UI approach)
- [ ] Pitfall 4: Workload overhead (design JSON structure)
- [ ] Pitfall 5: HA overhead (correct formula)
- [ ] Pitfall 8: Proxmox Ceph quorum (validation rules)
- [ ] Pitfall 9: XCP-ng limits (document limits)
- [ ] Pitfall 10: Migration costs (research estimates)
- [ ] Pitfall 11: Support costs (platform-specific models)
- [ ] Pitfall 12: Training costs (gather estimates)
- [ ] Pitfall 14: Version docs (document assumptions)
- [ ] Pitfall 23: Hyper-V Standard limits (break-even logic)

### Implementation Phase

- [ ] All pitfalls with "Low" or "Medium" prevention cost
- [ ] Focus on HIGH risk pitfalls first
- [ ] Add validation and warnings
- [ ] Implement calculation safeguards

### Testing Phase

- [ ] Test all validation rules
- [ ] Verify edge cases (Pitfall 18-19)
- [ ] Mobile testing (Pitfall 22)
- [ ] Export testing (Pitfall 20-21)

### Post-Launch Phase

- [ ] Pitfall 15: Set quarterly pricing review
- [ ] Pitfall 16: Annual overhead factor review
- [ ] Pitfall 17: Community feedback on feature matrix

---

## Conclusion

**Most Critical Pitfalls (Must Address):**

1. Windows Server core licensing minimums (Pitfall 1)
2. HA overhead misunderstood (Pitfall 5)
3. Storage overhead stacking (Pitfall 6)
4. Hidden migration costs (Pitfall 10)
5. Pricing data stale (Pitfall 15)
6. Hyper-V Standard VM limits (Pitfall 23)

**Quick Wins (Low Effort, High Impact):**

- Add date stamps to pricing (Pitfall 15)
- Add validation bounds (Pitfall 18)
- Add platform labels to CSV exports (Pitfall 21)
- Document version assumptions (Pitfall 14)

**Ongoing Maintenance:**

- Quarterly pricing review
- Annual overhead factor review
- Community feedback on feature accuracy

**Estimated Total Prevention Effort:** ~20 hours (mostly planning + validation logic)

**ROI:** Prevent user errors, maintain trust, avoid liability from incorrect sizing recommendations
