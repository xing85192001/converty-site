"use client";

import { create } from "zustand";
import {
  calculateK8sCapacity,
  type K8sCapacityResult,
} from "@/lib/converters/infrastructure/k8s-capacity";
import { createUrlSyncMiddleware } from "@/lib/middleware/url-sync";
import { getUrlParams, parseNumberParam } from "@/lib/utils/url-params";

/**
 * K8s Capacity calculator state interface
 */
export interface K8sCapacityState {
  // Pod workload inputs
  podCpuRequest: number;
  podMemoryRequest: number;
  podReplicas: number;

  // Node specs inputs
  nodeCpuCores: number;
  nodeMemoryMb: number;

  // System overhead inputs
  systemReservedCpu: number;
  systemReservedMemory: number;
  daemonSetCpuPerNode: number;
  daemonSetMemoryPerNode: number;

  // Target utilization inputs
  targetCpuUtilization: number;
  targetMemoryUtilization: number;

  // Results
  result: K8sCapacityResult | null;
  error: string | null;

  // Actions
  setPodCpuRequest: (value: number) => void;
  setPodMemoryRequest: (value: number) => void;
  setPodReplicas: (value: number) => void;
  setNodeCpuCores: (value: number) => void;
  setNodeMemoryMb: (value: number) => void;
  setSystemReservedCpu: (value: number) => void;
  setSystemReservedMemory: (value: number) => void;
  setDaemonSetCpuPerNode: (value: number) => void;
  setDaemonSetMemoryPerNode: (value: number) => void;
  setTargetCpuUtilization: (value: number) => void;
  setTargetMemoryUtilization: (value: number) => void;
  calculate: () => void;
  reset: () => void;
}

/**
 * Initial state for K8s capacity calculator
 */
const initialState = {
  // Pod workload - example: 10 web server pods
  podCpuRequest: 500, // 500m = 0.5 CPU per pod
  podMemoryRequest: 512, // 512 MiB per pod
  podReplicas: 10, // 10 pod instances

  // Node specs - example: Standard K8s node (8 cores, 16 GB RAM)
  nodeCpuCores: 8, // 8 CPU cores
  nodeMemoryMb: 16384, // 16 GB = 16384 MB

  // System overhead - typical values from research
  systemReservedCpu: 700, // 700m for 8-core node (AKS/GKE typical)
  systemReservedMemory: 1024, // 1 GiB (1024 MiB) reserved
  daemonSetCpuPerNode: 300, // 300m for monitoring/logging agents
  daemonSetMemoryPerNode: 384, // 384 MiB for DaemonSets

  // Target utilization - industry best practices
  targetCpuUtilization: 70, // 70% CPU (HPA standard)
  targetMemoryUtilization: 80, // 80% memory (higher tolerance)

  result: null,
  error: null,
};

/**
 * Zustand store for K8s Capacity calculator with URL synchronization
 *
 * Features:
 * - URL state sync for all input fields
 * - Auto-calculation on input changes
 * - Multi-dimensional bin packing (CPU vs memory)
 */
export const useK8sCapacityStore = create<K8sCapacityState>()(
  createUrlSyncMiddleware<K8sCapacityState>({
    enabled: true,
    debounceMs: 300,
    selectState: (state) => ({
      // Sync all input fields to URL
      podCpuRequest: state.podCpuRequest,
      podMemoryRequest: state.podMemoryRequest,
      podReplicas: state.podReplicas,
      nodeCpuCores: state.nodeCpuCores,
      nodeMemoryMb: state.nodeMemoryMb,
      systemReservedCpu: state.systemReservedCpu,
      systemReservedMemory: state.systemReservedMemory,
      daemonSetCpuPerNode: state.daemonSetCpuPerNode,
      daemonSetMemoryPerNode: state.daemonSetMemoryPerNode,
      targetCpuUtilization: state.targetCpuUtilization,
      targetMemoryUtilization: state.targetMemoryUtilization,
    }),
  })((set, get) => {
    // Load initial values from URL params if present
    let loadedPodCpuRequest = initialState.podCpuRequest;
    let loadedPodMemoryRequest = initialState.podMemoryRequest;
    let loadedPodReplicas = initialState.podReplicas;
    let loadedNodeCpuCores = initialState.nodeCpuCores;
    let loadedNodeMemoryMb = initialState.nodeMemoryMb;
    let loadedSystemReservedCpu = initialState.systemReservedCpu;
    let loadedSystemReservedMemory = initialState.systemReservedMemory;
    let loadedDaemonSetCpuPerNode = initialState.daemonSetCpuPerNode;
    let loadedDaemonSetMemoryPerNode = initialState.daemonSetMemoryPerNode;
    let loadedTargetCpuUtilization = initialState.targetCpuUtilization;
    let loadedTargetMemoryUtilization = initialState.targetMemoryUtilization;

    if (typeof window !== "undefined") {
      const urlParams = getUrlParams();
      if (urlParams.size > 0) {
        loadedPodCpuRequest = parseNumberParam(
          urlParams.get("podCpuRequest") ?? null,
          initialState.podCpuRequest
        );
        loadedPodMemoryRequest = parseNumberParam(
          urlParams.get("podMemoryRequest") ?? null,
          initialState.podMemoryRequest
        );
        loadedPodReplicas = parseNumberParam(
          urlParams.get("podReplicas") ?? null,
          initialState.podReplicas
        );
        loadedNodeCpuCores = parseNumberParam(
          urlParams.get("nodeCpuCores") ?? null,
          initialState.nodeCpuCores
        );
        loadedNodeMemoryMb = parseNumberParam(
          urlParams.get("nodeMemoryMb") ?? null,
          initialState.nodeMemoryMb
        );
        loadedSystemReservedCpu = parseNumberParam(
          urlParams.get("systemReservedCpu") ?? null,
          initialState.systemReservedCpu
        );
        loadedSystemReservedMemory = parseNumberParam(
          urlParams.get("systemReservedMemory") ?? null,
          initialState.systemReservedMemory
        );
        loadedDaemonSetCpuPerNode = parseNumberParam(
          urlParams.get("daemonSetCpuPerNode") ?? null,
          initialState.daemonSetCpuPerNode
        );
        loadedDaemonSetMemoryPerNode = parseNumberParam(
          urlParams.get("daemonSetMemoryPerNode") ?? null,
          initialState.daemonSetMemoryPerNode
        );
        loadedTargetCpuUtilization = parseNumberParam(
          urlParams.get("targetCpuUtilization") ?? null,
          initialState.targetCpuUtilization
        );
        loadedTargetMemoryUtilization = parseNumberParam(
          urlParams.get("targetMemoryUtilization") ?? null,
          initialState.targetMemoryUtilization
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
      podCpuRequest: loadedPodCpuRequest,
      podMemoryRequest: loadedPodMemoryRequest,
      podReplicas: loadedPodReplicas,
      nodeCpuCores: loadedNodeCpuCores,
      nodeMemoryMb: loadedNodeMemoryMb,
      systemReservedCpu: loadedSystemReservedCpu,
      systemReservedMemory: loadedSystemReservedMemory,
      daemonSetCpuPerNode: loadedDaemonSetCpuPerNode,
      daemonSetMemoryPerNode: loadedDaemonSetMemoryPerNode,
      targetCpuUtilization: loadedTargetCpuUtilization,
      targetMemoryUtilization: loadedTargetMemoryUtilization,
      result: null,
      error: null,

      setPodCpuRequest: (value: number) => {
        set({ podCpuRequest: value, error: null });
        autoCalculate();
      },

      setPodMemoryRequest: (value: number) => {
        set({ podMemoryRequest: value, error: null });
        autoCalculate();
      },

      setPodReplicas: (value: number) => {
        set({ podReplicas: value, error: null });
        autoCalculate();
      },

      setNodeCpuCores: (value: number) => {
        set({ nodeCpuCores: value, error: null });
        autoCalculate();
      },

      setNodeMemoryMb: (value: number) => {
        set({ nodeMemoryMb: value, error: null });
        autoCalculate();
      },

      setSystemReservedCpu: (value: number) => {
        set({ systemReservedCpu: value, error: null });
        autoCalculate();
      },

      setSystemReservedMemory: (value: number) => {
        set({ systemReservedMemory: value, error: null });
        autoCalculate();
      },

      setDaemonSetCpuPerNode: (value: number) => {
        set({ daemonSetCpuPerNode: value, error: null });
        autoCalculate();
      },

      setDaemonSetMemoryPerNode: (value: number) => {
        set({ daemonSetMemoryPerNode: value, error: null });
        autoCalculate();
      },

      setTargetCpuUtilization: (value: number) => {
        set({ targetCpuUtilization: value, error: null });
        autoCalculate();
      },

      setTargetMemoryUtilization: (value: number) => {
        set({ targetMemoryUtilization: value, error: null });
        autoCalculate();
      },

      calculate: () => {
        const {
          podCpuRequest,
          podMemoryRequest,
          podReplicas,
          nodeCpuCores,
          nodeMemoryMb,
          systemReservedCpu,
          systemReservedMemory,
          daemonSetCpuPerNode,
          daemonSetMemoryPerNode,
          targetCpuUtilization,
          targetMemoryUtilization,
        } = get();

        try {
          const calcResult = calculateK8sCapacity({
            podCpuRequest,
            podMemoryRequest,
            podReplicas,
            nodeCpuCores,
            nodeMemoryMb,
            systemReservedCpu,
            systemReservedMemory,
            daemonSetCpuPerNode,
            daemonSetMemoryPerNode,
            targetCpuUtilization,
            targetMemoryUtilization,
          });

          if (calcResult.ok) {
            set({ result: calcResult.value, error: null });
          } else {
            set({ result: null, error: calcResult.error });
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
