"use client";

import { AlertTriangle, Cpu, HardDrive, Server, Settings } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { CsvExportButton, InputField, PdfExportButton } from "@/components/converter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CsvRow } from "@/lib/utils/csv-export";
import type { PdfSection } from "@/lib/utils/pdf-export";
import { useK8sCapacityStore } from "@/stores/k8s-capacity-store";

/**
 * Safely parse a positive number, returning the previous value if input is invalid.
 * Prevents transient error states during typing (e.g., clearing field shows NaN → 0).
 */
function safeParsePositive(input: string, previousValue: number, minValue = 1): number {
  const parsed = parseFloat(input);
  if (Number.isNaN(parsed) || parsed < minValue) {
    return previousValue;
  }
  return parsed;
}

/**
 * Safely parse a non-negative number, returning the previous value if input is invalid.
 * Used for fields where 0 is valid (e.g., system reserved resources).
 */
function safeParseNonNegative(input: string, previousValue: number): number {
  const parsed = parseFloat(input);
  if (Number.isNaN(parsed) || parsed < 0) {
    return previousValue;
  }
  return parsed;
}

export function K8sCapacityCalculator() {
  const t = useTranslations("calculator.k8sCapacity");

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
    result,
    error,
    setPodCpuRequest,
    setPodMemoryRequest,
    setPodReplicas,
    setNodeCpuCores,
    setNodeMemoryMb,
    setSystemReservedCpu,
    setSystemReservedMemory,
    setDaemonSetCpuPerNode,
    setDaemonSetMemoryPerNode,
    setTargetCpuUtilization,
    setTargetMemoryUtilization,
    reset,
  } = useK8sCapacityStore();

  // PDF export sections
  const pdfSections: PdfSection[] = useMemo(() => {
    if (!result) return [];
    return [
      {
        title: t("podWorkload"),
        items: [
          { label: t("podCpuRequest"), value: podCpuRequest, unit: "millicores" },
          { label: t("podMemoryRequest"), value: podMemoryRequest, unit: "Mi" },
          { label: t("podReplicas"), value: podReplicas, unit: "" },
        ],
      },
      {
        title: t("nodeSpecs"),
        items: [
          { label: t("nodeCpuCores"), value: nodeCpuCores, unit: "cores" },
          { label: t("nodeMemoryMb"), value: nodeMemoryMb, unit: "MB" },
          { label: t("systemReservedCpu"), value: systemReservedCpu, unit: "%" },
          { label: t("systemReservedMemory"), value: systemReservedMemory, unit: "%" },
          { label: t("daemonSetCpuPerNode"), value: daemonSetCpuPerNode, unit: "millicores" },
          { label: t("daemonSetMemoryPerNode"), value: daemonSetMemoryPerNode, unit: "Mi" },
          { label: t("targetCpuUtilization"), value: targetCpuUtilization, unit: "%" },
          { label: t("targetMemoryUtilization"), value: targetMemoryUtilization, unit: "%" },
        ],
      },
      {
        title: t("results"),
        items: [
          { label: t("nodesNeeded"), value: result.nodesNeededTotal, unit: "" },
          {
            label: t("limitingFactor"),
            value: t(result.limitingFactor === "cpu" ? "cpuConstrained" : "memoryConstrained"),
            unit: "",
          },
          { label: t("cpuUtilization"), value: result.finalCpuUtilization.toFixed(1), unit: "%" },
          {
            label: t("memoryUtilization"),
            value: result.finalMemoryUtilization.toFixed(1),
            unit: "%",
          },
        ],
      },
    ];
  }, [
    result,
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
    t,
  ]);

  // CSV export data
  const csvData: CsvRow[] = useMemo(() => {
    if (!result) return [];
    return [
      { Field: t("podCpuRequest"), Value: podCpuRequest, Unit: "millicores" },
      { Field: t("podMemoryRequest"), Value: podMemoryRequest, Unit: "Mi" },
      { Field: t("podReplicas"), Value: podReplicas, Unit: "" },
      { Field: t("nodeCpuCores"), Value: nodeCpuCores, Unit: "cores" },
      { Field: t("nodeMemoryMb"), Value: nodeMemoryMb, Unit: "MB" },
      { Field: t("systemReservedCpu"), Value: systemReservedCpu, Unit: "%" },
      { Field: t("systemReservedMemory"), Value: systemReservedMemory, Unit: "%" },
      { Field: t("daemonSetCpuPerNode"), Value: daemonSetCpuPerNode, Unit: "millicores" },
      { Field: t("daemonSetMemoryPerNode"), Value: daemonSetMemoryPerNode, Unit: "Mi" },
      { Field: t("targetCpuUtilization"), Value: targetCpuUtilization, Unit: "%" },
      { Field: t("targetMemoryUtilization"), Value: targetMemoryUtilization, Unit: "%" },
      { Field: t("nodesNeeded"), Value: result.nodesNeededTotal, Unit: "" },
      {
        Field: t("limitingFactor"),
        Value: t(result.limitingFactor === "cpu" ? "cpuConstrained" : "memoryConstrained"),
        Unit: "",
      },
      { Field: t("cpuUtilization"), Value: result.finalCpuUtilization.toFixed(1), Unit: "%" },
      { Field: t("memoryUtilization"), Value: result.finalMemoryUtilization.toFixed(1), Unit: "%" },
    ];
  }, [
    result,
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
    t,
  ]);

  return (
    <div className="space-y-6">
      {/* Pod Workload Inputs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            {t("podWorkload")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <InputField
            id="podCpuRequest"
            label={t("podCpuRequest")}
            value={podCpuRequest.toString()}
            onChange={(v) => setPodCpuRequest(safeParsePositive(v, podCpuRequest, 0))}
            type="number"
            min={0}
            step={100}
            unit="m"
          />
          <InputField
            id="podMemoryRequest"
            label={t("podMemoryRequest")}
            value={podMemoryRequest.toString()}
            onChange={(v) => setPodMemoryRequest(safeParsePositive(v, podMemoryRequest, 0))}
            type="number"
            min={0}
            step={64}
            unit="MiB"
          />
          <InputField
            id="podReplicas"
            label={t("podReplicas")}
            value={podReplicas.toString()}
            onChange={(v) => setPodReplicas(safeParsePositive(v, podReplicas, 1))}
            type="number"
            min={1}
            step={1}
          />
        </CardContent>
      </Card>

      {/* Node Specifications Inputs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            {t("nodeSpecs")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <InputField
            id="nodeCpuCores"
            label={t("nodeCpuCores")}
            value={nodeCpuCores.toString()}
            onChange={(v) => setNodeCpuCores(safeParsePositive(v, nodeCpuCores, 1))}
            type="number"
            min={1}
            step={1}
            unit={t("cores")}
          />
          <InputField
            id="nodeMemoryMb"
            label={t("nodeMemoryMb")}
            value={nodeMemoryMb.toString()}
            onChange={(v) => setNodeMemoryMb(safeParsePositive(v, nodeMemoryMb, 512))}
            type="number"
            min={512}
            step={1024}
            unit="MB"
          />
        </CardContent>
      </Card>

      {/* System Overhead Inputs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {t("systemOverhead")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <InputField
            id="systemReservedCpu"
            label={t("systemReservedCpu")}
            value={systemReservedCpu.toString()}
            onChange={(v) => setSystemReservedCpu(safeParseNonNegative(v, systemReservedCpu))}
            type="number"
            min={0}
            step={100}
            unit="m"
            helperText={t("systemReservedHelp")}
          />
          <InputField
            id="systemReservedMemory"
            label={t("systemReservedMemory")}
            value={systemReservedMemory.toString()}
            onChange={(v) => setSystemReservedMemory(safeParseNonNegative(v, systemReservedMemory))}
            type="number"
            min={0}
            step={128}
            unit="MiB"
            helperText={t("systemReservedHelp")}
          />
          <InputField
            id="daemonSetCpuPerNode"
            label={t("daemonSetCpuPerNode")}
            value={daemonSetCpuPerNode.toString()}
            onChange={(v) => setDaemonSetCpuPerNode(safeParseNonNegative(v, daemonSetCpuPerNode))}
            type="number"
            min={0}
            step={50}
            unit="m"
            helperText={t("daemonSetHelp")}
          />
          <InputField
            id="daemonSetMemoryPerNode"
            label={t("daemonSetMemoryPerNode")}
            value={daemonSetMemoryPerNode.toString()}
            onChange={(v) =>
              setDaemonSetMemoryPerNode(safeParseNonNegative(v, daemonSetMemoryPerNode))
            }
            type="number"
            min={0}
            step={64}
            unit="MiB"
            helperText={t("daemonSetHelp")}
          />
        </CardContent>
      </Card>

      {/* Target Utilization Inputs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5" />
            {t("targetUtilization")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <InputField
            id="targetCpuUtilization"
            label={t("targetCpuUtilization")}
            value={targetCpuUtilization.toString()}
            onChange={(v) => setTargetCpuUtilization(safeParsePositive(v, targetCpuUtilization, 1))}
            type="number"
            min={1}
            max={100}
            step={5}
            unit="%"
            helperText={t("targetUtilizationHelp")}
          />
          <InputField
            id="targetMemoryUtilization"
            label={t("targetMemoryUtilization")}
            value={targetMemoryUtilization.toString()}
            onChange={(v) =>
              setTargetMemoryUtilization(safeParsePositive(v, targetMemoryUtilization, 1))
            }
            type="number"
            min={1}
            max={100}
            step={5}
            unit="%"
            helperText={t("targetUtilizationHelp")}
          />
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && !error && (
        <div className="space-y-6">
          {/* Primary Result */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t("nodesNeeded")}</CardTitle>
              <div className="flex gap-2">
                <PdfExportButton sections={pdfSections} options={{ title: t("title") }} />
                <CsvExportButton data={csvData} filename="k8s-capacity-calculator" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary">{result.nodesNeededTotal}</div>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{t("limitingFactor")}:</span>
                {result.limitingFactor === "cpu" ? (
                  <Badge variant="default" className="gap-1">
                    <Cpu className="h-3 w-3" />
                    {t("cpuConstrained")}
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="gap-1">
                    <HardDrive className="h-3 w-3" />
                    {t("memoryConstrained")}
                  </Badge>
                )}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{t("limitingFactorHelp")}</p>
            </CardContent>
          </Card>

          {/* Over-utilization Warning */}
          {result.overUtilized && (
            <Card className="border-amber-500/50 bg-amber-500/10">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <p className="text-sm text-amber-900 dark:text-amber-100">
                    {t("overUtilizationWarning")}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Detailed Results Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* CPU Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Cpu className="h-4 w-4" />
                  {t("cpuResults")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    {t("allocatableCpuPerNode")}
                  </span>
                  <span className="font-medium">{result.allocatableCpuPerNode.toFixed(0)}m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{t("nodesNeededByCpu")}</span>
                  <span className="font-medium">{result.nodesNeededByCpu}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{t("finalCpuUtilization")}</span>
                  <span
                    className={`font-medium ${
                      result.finalCpuUtilization > 80 ? "text-destructive" : "text-primary"
                    }`}
                  >
                    {result.finalCpuUtilization.toFixed(1)}%
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Memory Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <HardDrive className="h-4 w-4" />
                  {t("memoryResults")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    {t("allocatableMemoryPerNode")}
                  </span>
                  <span className="font-medium">
                    {result.allocatableMemoryPerNode.toFixed(0)} MiB
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{t("nodesNeededByMemory")}</span>
                  <span className="font-medium">{result.nodesNeededByMemory}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    {t("finalMemoryUtilization")}
                  </span>
                  <span
                    className={`font-medium ${
                      result.finalMemoryUtilization > 80 ? "text-destructive" : "text-primary"
                    }`}
                  >
                    {result.finalMemoryUtilization.toFixed(1)}%
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Calculation Steps */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t("calculationSteps")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="font-medium">{t("step1")}:</p>
                  <p className="text-muted-foreground">
                    CPU: {nodeCpuCores} × 1000m - {systemReservedCpu}m - {daemonSetCpuPerNode}m ={" "}
                    {result.allocatableCpuPerNode.toFixed(0)}m
                  </p>
                  <p className="text-muted-foreground">
                    Memory: {nodeMemoryMb} MiB - {systemReservedMemory} MiB -{" "}
                    {daemonSetMemoryPerNode} MiB = {result.allocatableMemoryPerNode.toFixed(0)} MiB
                  </p>
                </div>
                <div>
                  <p className="font-medium">{t("step2")}:</p>
                  <p className="text-muted-foreground">
                    CPU: {podCpuRequest}m × {podReplicas} pods ={" "}
                    {(podCpuRequest * podReplicas).toFixed(0)}m
                  </p>
                  <p className="text-muted-foreground">
                    Memory: {podMemoryRequest} MiB × {podReplicas} pods ={" "}
                    {podMemoryRequest * podReplicas} MiB
                  </p>
                </div>
                <div>
                  <p className="font-medium">{t("step3")}:</p>
                  <p className="text-muted-foreground">
                    CPU: {result.allocatableCpuPerNode.toFixed(0)}m × {targetCpuUtilization}% ={" "}
                    {(result.allocatableCpuPerNode * (targetCpuUtilization / 100)).toFixed(0)}m per
                    node
                  </p>
                  <p className="text-muted-foreground">
                    Memory: {result.allocatableMemoryPerNode.toFixed(0)} MiB ×{" "}
                    {targetMemoryUtilization}% ={" "}
                    {(result.allocatableMemoryPerNode * (targetMemoryUtilization / 100)).toFixed(0)}{" "}
                    MiB per node
                  </p>
                </div>
                <div>
                  <p className="font-medium">{t("step4")}:</p>
                  <p className="text-muted-foreground">Nodes by CPU: {result.nodesNeededByCpu}</p>
                  <p className="text-muted-foreground">
                    Nodes by Memory: {result.nodesNeededByMemory}
                  </p>
                </div>
                <div>
                  <p className="font-medium">{t("step5")}:</p>
                  <p className="text-muted-foreground">
                    Total nodes needed: {result.nodesNeededTotal} ({t("limitingFactor")}:{" "}
                    {result.limitingFactor === "cpu" ? "CPU" : "Memory"})
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reset Button */}
          <div className="flex justify-center">
            <Button onClick={reset} variant="outline" className="w-full md:w-auto">
              {t("reset")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
