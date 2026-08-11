# Plan 27-01: VM Storage Calculation Engine & Registry

**Status:** ✅ Complete  
**Completed:** 2026-01-25  
**Commits:** 3 (1285cec, d0f3713, 2b87bce)

## Objectives Achieved

✅ Created VM storage calculation logic with VMware vSphere formulas  
✅ Registered calculator in infrastructure category with HardDrive icon  
✅ Added complete translations for all 4 locales (en, fr, de, it)  
✅ TypeScript compiles without errors  
✅ All must-haves verified

## Tasks Completed

### Task 1: Create VM storage calculation logic
**File:** `src/lib/converters/infrastructure/vm-storage.ts`  
**Commit:** 1285cec

- Pure calculation function with comprehensive VMware storage formulas
- Handles thick/thin provisioning, snapshots, swap, ESX overhead, growth
- Input validation (negative values, percentage ranges, ESX hosts minimum)
- Step-by-step calculation breakdown in `steps[]` array
- Exports: `VmStorageInput`, `VmStorageResult`, `calculateVmStorage`

**Formulas implemented:**
1. Total provisioned disk = sum(diskGb × count) for all VM configs
2. Used disk = provisioned × (1 - thinProvisioningPercent/100)
3. Snapshot allocation = provisioned × (snapshotPercent/100)
4. Swap allocation = sum(ramGb × count) if enabled
5. Config/log overhead = vmCount × configLogGbPerVm
6. ESX overhead = esxHosts × esxStorageGbPerHost
7. Growth allocation = (VM + ESX) × (growthPercent/100)
8. Total required = VM + ESX + growth

### Task 2: Register calculator in infrastructure category
**File:** `src/lib/registry/infrastructure-converters.ts`  
**Commit:** d0f3713

- Added `vm-storage-calculator` entry to infrastructure registry
- Used HardDrive icon from lucide-react (semantic for storage)
- Set `featured: true` (first infrastructure calculator)
- Comprehensive keywords for search: vm, vmware, vsphere, esx, capacity, provisioning, thin provisioning, datastore, swap, snapshot

### Task 3: Add translations for all 4 locales
**Files:** `src/messages/{en,fr,de,it}.json`  
**Commit:** 2b87bce

**Converter metadata translations:**
- Added `converters.vm-storage-calculator` with name, description, metaDescription
- All 4 locales (English, French, German, Italian)

**UI label translations:**
- Added `calculator.vmStorage` namespace with 27 keys
- VM profile management labels (addProfile, removeProfile, diskSize, ramSize, vmCount)
- Configuration labels (includeSwapFiles, configLogPerVm, snapshotPercent, esxHosts, esxStoragePerHost, thinProvisioningPercent, growthPercent)
- Result labels (totalProvisioned, usedDisk, overSubscribed, snapshotAllocation, swapAllocation, configLogAllocation, totalVmStorage, esxOverhead, growthAllocation, totalRequired, breakdown)
- Help text (provisioningWarning, snapshotHelp, swapHelp)

## Verification

✅ **TypeScript compilation:** No errors  
✅ **Calculation formulas:** Match VMware reference implementation (wintelguy.com)  
✅ **Input validation:** Returns null for invalid inputs  
✅ **Registry entry:** Complete metadata with id, slug, category, keywords, icon  
✅ **Translations:** All 4 locales have complete translations  
✅ **Step breakdown:** Calculation includes transparent step-by-step array

## Must-Haves Status

All must-haves from plan verified:

| Must-Have | Status | Evidence |
|-----------|--------|----------|
| VM storage formulas match VMware reference | ✅ | Formulas in src/lib/converters/infrastructure/vm-storage.ts lines 93-104 match VMware best practices |
| Handles multiple VM profiles | ✅ | `vmConfigs` array accepts multiple profiles with diskGb/ramGb/count |
| Thin provisioning calculated correctly | ✅ | `usedDiskGb = totalProvisionedGb * (1 - thinProvisioningPercent / 100)` at line 134 |
| Registered in infrastructure category | ✅ | Entry in src/lib/registry/infrastructure-converters.ts with HardDrive icon |
| All 4 locales translated | ✅ | Complete translations in en.json, fr.json, de.json, it.json |

## Files Modified

```
src/lib/converters/infrastructure/vm-storage.ts        (+232 lines)
src/lib/registry/infrastructure-converters.ts          (+24, -1 lines)
src/messages/en.json                                   (+35 lines)
src/messages/fr.json                                   (+35 lines)
src/messages/de.json                                   (+35 lines)
src/messages/it.json                                   (+35 lines)
```

## Next Steps

Wave 2 (Plan 27-02): Create Zustand store, Next.js page, and React calculator component to consume this calculation logic.
