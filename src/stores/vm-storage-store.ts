"use client";

import { create } from "zustand";
import type { HypervisorPlatform } from "@/lib/converters/infrastructure/types";
import {
  calculateVmStorage,
  type VmConfig,
  type VmStorageResult,
} from "@/lib/converters/infrastructure/vm-storage";
import { createUrlSyncMiddleware } from "@/lib/middleware/url-sync";
import { getUrlParams, parseBooleanParam, parseNumberParam } from "@/lib/utils/url-params";

/**
 * VM Storage calculator state interface
 */
export interface VmStorageState {
  // Inputs
  platform: HypervisorPlatform;
  vmConfigs: VmConfig[];
  includeSwapFiles: boolean;
  configLogGbPerVm: number;
  snapshotPercent: number;
  esxHosts: number;
  esxStorageGbPerHost: number;
  thinProvisioningPercent: number;
  growthPercent: number;

  // Results
  result: VmStorageResult | null;
  error: string | null;

  // Actions
  setPlatform: (value: HypervisorPlatform) => void;
  setVmConfigs: (configs: VmConfig[]) => void;
  addVmConfig: () => void;
  removeVmConfig: (index: number) => void;
  updateVmConfig: (index: number, field: keyof VmConfig, value: number) => void;
  setIncludeSwapFiles: (value: boolean) => void;
  setConfigLogGbPerVm: (value: number) => void;
  setSnapshotPercent: (value: number) => void;
  setEsxHosts: (value: number) => void;
  setEsxStorageGbPerHost: (value: number) => void;
  setThinProvisioningPercent: (value: number) => void;
  setGrowthPercent: (value: number) => void;
  calculate: () => void;
  reset: () => void;
}

/**
 * Initial state for VM storage calculator
 */
const initialState = {
  platform: "vmware" as HypervisorPlatform,
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
  result: null,
  error: null,
};

/**
 * Zustand store for VM Storage calculator with URL synchronization
 *
 * Features:
 * - URL state sync for primitive fields (not vmConfigs array)
 * - Auto-calculation on input changes
 * - Dynamic VM profile management
 */
export const useVmStorageStore = create<VmStorageState>()(
  createUrlSyncMiddleware<VmStorageState>({
    enabled: true,
    debounceMs: 300,
    selectState: (state) => ({
      // Sync only primitive fields to URL (vmConfigs array excluded)
      platform: state.platform,
      includeSwapFiles: state.includeSwapFiles,
      configLogGbPerVm: state.configLogGbPerVm,
      snapshotPercent: state.snapshotPercent,
      esxHosts: state.esxHosts,
      esxStorageGbPerHost: state.esxStorageGbPerHost,
      thinProvisioningPercent: state.thinProvisioningPercent,
      growthPercent: state.growthPercent,
    }),
  })((set, get) => {
    // Load initial values from URL params if present
    let loadedPlatform = initialState.platform;
    let loadedIncludeSwapFiles = initialState.includeSwapFiles;
    let loadedConfigLogGbPerVm = initialState.configLogGbPerVm;
    let loadedSnapshotPercent = initialState.snapshotPercent;
    let loadedEsxHosts = initialState.esxHosts;
    let loadedEsxStorageGbPerHost = initialState.esxStorageGbPerHost;
    let loadedThinProvisioningPercent = initialState.thinProvisioningPercent;
    let loadedGrowthPercent = initialState.growthPercent;

    if (typeof window !== "undefined") {
      const urlParams = getUrlParams();
      if (urlParams.size > 0) {
        const platformParam = urlParams.get("platform");
        if (platformParam && ["vmware", "hyperv", "proxmox", "xcp-ng"].includes(platformParam)) {
          loadedPlatform = platformParam as HypervisorPlatform;
        }
        loadedIncludeSwapFiles = parseBooleanParam(
          urlParams.get("includeSwapFiles") ?? null,
          initialState.includeSwapFiles
        );
        loadedConfigLogGbPerVm = parseNumberParam(
          urlParams.get("configLogGbPerVm") ?? null,
          initialState.configLogGbPerVm
        );
        loadedSnapshotPercent = parseNumberParam(
          urlParams.get("snapshotPercent") ?? null,
          initialState.snapshotPercent
        );
        loadedEsxHosts = parseNumberParam(urlParams.get("esxHosts") ?? null, initialState.esxHosts);
        loadedEsxStorageGbPerHost = parseNumberParam(
          urlParams.get("esxStorageGbPerHost") ?? null,
          initialState.esxStorageGbPerHost
        );
        loadedThinProvisioningPercent = parseNumberParam(
          urlParams.get("thinProvisioningPercent") ?? null,
          initialState.thinProvisioningPercent
        );
        loadedGrowthPercent = parseNumberParam(
          urlParams.get("growthPercent") ?? null,
          initialState.growthPercent
        );
      }
    }

    // Auto-calculate helper
    const autoCalculate = () => {
      setTimeout(() => {
        get().calculate();
      }, 0);
    };

    return {
      // Initialize with URL params if present
      platform: loadedPlatform,
      vmConfigs: initialState.vmConfigs,
      includeSwapFiles: loadedIncludeSwapFiles,
      configLogGbPerVm: loadedConfigLogGbPerVm,
      snapshotPercent: loadedSnapshotPercent,
      esxHosts: loadedEsxHosts,
      esxStorageGbPerHost: loadedEsxStorageGbPerHost,
      thinProvisioningPercent: loadedThinProvisioningPercent,
      growthPercent: loadedGrowthPercent,
      result: null,
      error: null,

      setPlatform: (value: HypervisorPlatform) => {
        set({ platform: value, error: null });
        autoCalculate();
      },

      setVmConfigs: (configs: VmConfig[]) => {
        set({ vmConfigs: configs, error: null });
        autoCalculate();
      },

      addVmConfig: () => {
        const { vmConfigs } = get();
        const newConfig: VmConfig = { diskGb: 100, ramGb: 8, count: 5 };
        set({ vmConfigs: [...vmConfigs, newConfig], error: null });
        autoCalculate();
      },

      removeVmConfig: (index: number) => {
        const { vmConfigs } = get();
        // Don't allow removing the last config
        if (vmConfigs.length <= 1) {
          set({ error: "At least one VM profile is required" });
          return;
        }
        const updated = vmConfigs.filter((_, i) => i !== index);
        set({ vmConfigs: updated, error: null });
        autoCalculate();
      },

      updateVmConfig: (index: number, field: keyof VmConfig, value: number) => {
        const { vmConfigs } = get();
        const updated = vmConfigs.map((config, i) =>
          i === index ? { ...config, [field]: value } : config
        );
        set({ vmConfigs: updated, error: null });
        autoCalculate();
      },

      setIncludeSwapFiles: (value: boolean) => {
        set({ includeSwapFiles: value, error: null });
        autoCalculate();
      },

      setConfigLogGbPerVm: (value: number) => {
        set({ configLogGbPerVm: value, error: null });
        autoCalculate();
      },

      setSnapshotPercent: (value: number) => {
        set({ snapshotPercent: value, error: null });
        autoCalculate();
      },

      setEsxHosts: (value: number) => {
        set({ esxHosts: value, error: null });
        autoCalculate();
      },

      setEsxStorageGbPerHost: (value: number) => {
        set({ esxStorageGbPerHost: value, error: null });
        autoCalculate();
      },

      setThinProvisioningPercent: (value: number) => {
        set({ thinProvisioningPercent: value, error: null });
        autoCalculate();
      },

      setGrowthPercent: (value: number) => {
        set({ growthPercent: value, error: null });
        autoCalculate();
      },

      calculate: () => {
        const {
          platform,
          vmConfigs,
          includeSwapFiles,
          configLogGbPerVm,
          snapshotPercent,
          esxHosts,
          esxStorageGbPerHost,
          thinProvisioningPercent,
          growthPercent,
        } = get();

        try {
          const result = calculateVmStorage({
            platform,
            vmConfigs,
            includeSwapFiles,
            configLogGbPerVm,
            snapshotPercent,
            hypervisorHosts: esxHosts,
            hypervisorStorageGbPerHost: esxStorageGbPerHost,
            thinProvisioningPercent,
            growthPercent,
          });

          if (result.ok) {
            set({ result: result.value, error: null });
          } else {
            set({ result: null, error: result.error });
          }
        } catch (err) {
          set({
            result: null,
            error: err instanceof Error ? err.message : "Calculation failed",
          });
        }
      },

      reset: () => {
        set({
          ...initialState,
          result: null,
          error: null,
        });
        autoCalculate();
      },
    };
  })
);
