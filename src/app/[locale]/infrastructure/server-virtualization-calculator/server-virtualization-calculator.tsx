"use client";

import { Cpu, HardDrive, Server, Settings } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { CsvExportButton, InputField, PdfExportButton, ResultGrid } from "@/components/converter";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  calculateServerVirtualization,
  type ServerVirtualizationInput,
  type ServerVirtualizationResult,
} from "@/lib/converters/infrastructure/server-virtualization";
import type { HypervisorPlatform } from "@/lib/converters/infrastructure/types";
import type { CsvRow } from "@/lib/utils/csv-export";
import type { PdfSection } from "@/lib/utils/pdf-export";
import { createCalculatorStore } from "@/stores/calculator-store";

const useServerVirtualizationStore = createCalculatorStore<
  ServerVirtualizationInput,
  ServerVirtualizationResult
>({
  name: "server-virtualization",
  initialValues: {
    platform: "vmware" as HypervisorPlatform,
    vmCount: 100,
    vCpuPerVm: 4,
    ramPerVmGb: 16,
    hostCores: 32,
    hostRamGb: 512,
    vCpuToCoreRatio: 4,
    targetCpuUtilization: 80,
    targetRamUtilization: 85,
    highAvailability: true,
  },
  calculate: (input) => calculateServerVirtualization(input),
});

export function ServerVirtualizationCalculator() {
  const t = useTranslations("calculator.serverVirtualizationCalculator");
  const tCommon = useTranslations("common");
  const { values, setValue, result, calculationError } = useServerVirtualizationStore();

  // PDF export sections
  const pdfSections: PdfSection[] = useMemo(() => {
    if (!result) return [];
    return [
      {
        title: "VM Workload",
        items: [
          { label: t("vmCount"), value: values.vmCount, unit: "" },
          { label: t("vCpuPerVm"), value: values.vCpuPerVm, unit: "vCPU" },
          { label: t("ramPerVm"), value: values.ramPerVmGb, unit: "GB" },
        ],
      },
      {
        title: "Host Specifications",
        items: [
          { label: t("hostCores"), value: values.hostCores, unit: "cores" },
          { label: t("hostRam"), value: values.hostRamGb, unit: "GB" },
          { label: t("vCpuToCoreRatio"), value: `${values.vCpuToCoreRatio}:1`, unit: "" },
          { label: t("targetCpuUtilization"), value: values.targetCpuUtilization, unit: "%" },
          { label: t("targetRamUtilization"), value: values.targetRamUtilization, unit: "%" },
          {
            label: t("highAvailability"),
            value: values.highAvailability ? tCommon("yes") : tCommon("no"),
            unit: "",
          },
        ],
      },
      {
        title: "Results",
        items: [
          { label: t("hostsNeededTotal"), value: result.hostsNeededTotal, unit: "" },
          {
            label: t("limitingFactor"),
            value: result.limitingFactor === "cpu" ? "CPU" : "RAM",
            unit: "",
          },
          {
            label: t("consolidationRatio"),
            value: `${result.vCpuConsolidationRatio.toFixed(1)}:1`,
            unit: "",
          },
          { label: t("cpuUtilization"), value: result.finalCpuUtilization.toFixed(1), unit: "%" },
          {
            label: t("memoryUtilization"),
            value: result.finalRamUtilization.toFixed(1),
            unit: "%",
          },
        ],
      },
    ];
  }, [result, values, t, tCommon]);

  // CSV export data
  const csvData: CsvRow[] = useMemo(() => {
    if (!result) return [];
    return [
      { Field: t("vmCount"), Value: values.vmCount, Unit: "" },
      { Field: t("vCpuPerVm"), Value: values.vCpuPerVm, Unit: "vCPU" },
      { Field: t("ramPerVm"), Value: values.ramPerVmGb, Unit: "GB" },
      { Field: t("hostCores"), Value: values.hostCores, Unit: "cores" },
      { Field: t("hostRam"), Value: values.hostRamGb, Unit: "GB" },
      { Field: t("vCpuToCoreRatio"), Value: `${values.vCpuToCoreRatio}:1`, Unit: "" },
      { Field: t("targetCpuUtilization"), Value: values.targetCpuUtilization, Unit: "%" },
      { Field: t("targetRamUtilization"), Value: values.targetRamUtilization, Unit: "%" },
      {
        Field: t("highAvailability"),
        Value: values.highAvailability ? tCommon("yes") : tCommon("no"),
        Unit: "",
      },
      { Field: t("hostsNeededTotal"), Value: result.hostsNeededTotal, Unit: "" },
      {
        Field: t("limitingFactor"),
        Value: result.limitingFactor === "cpu" ? "CPU" : "RAM",
        Unit: "",
      },
      {
        Field: t("consolidationRatio"),
        Value: `${result.vCpuConsolidationRatio.toFixed(1)}:1`,
        Unit: "",
      },
      { Field: t("cpuUtilization"), Value: result.finalCpuUtilization.toFixed(1), Unit: "%" },
      { Field: t("memoryUtilization"), Value: result.finalRamUtilization.toFixed(1), Unit: "%" },
    ];
  }, [result, values, t, tCommon]);

  return (
    <div className="space-y-4">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column - Inputs */}
        <div className="space-y-6">
          {/* VM Workload Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                VM Workload
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InputField
                id="vmCount"
                label={t("vmCount")}
                type="number"
                value={values.vmCount.toString()}
                onChange={(value) => setValue("vmCount", Number(value))}
                min={1}
                step={1}
              />
              <InputField
                id="vCpuPerVm"
                label={t("vcpuPerVm")}
                type="number"
                value={values.vCpuPerVm.toString()}
                onChange={(value) => setValue("vCpuPerVm", Number(value))}
                min={1}
                step={1}
                unit="vCPU"
              />
              <InputField
                id="ramPerVmGb"
                label={t("ramPerVmGb")}
                type="number"
                value={values.ramPerVmGb.toString()}
                onChange={(value) => setValue("ramPerVmGb", Number(value))}
                min={1}
                step={1}
                unit="GB"
              />
            </CardContent>
          </Card>

          {/* ESX Host Specs Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="h-5 w-5" />
                ESX Host Specifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="platform">{t("platform")}</Label>
                <Select
                  value={values.platform}
                  onValueChange={(value) => setValue("platform", value as HypervisorPlatform)}
                >
                  <SelectTrigger id="platform">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vmware">{t("platformVmware")}</SelectItem>
                    <SelectItem value="hyperv">{t("platformHyperv")}</SelectItem>
                    <SelectItem value="proxmox">{t("platformProxmox")}</SelectItem>
                    <SelectItem value="xcp-ng">{t("platformXcpng")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <InputField
                id="hostCores"
                label={t("hostCores")}
                type="number"
                value={values.hostCores.toString()}
                onChange={(value) => setValue("hostCores", Number(value))}
                min={1}
                step={1}
                unit="cores"
              />
              <InputField
                id="hostRamGb"
                label={t("hostRamGb")}
                type="number"
                value={values.hostRamGb.toString()}
                onChange={(value) => setValue("hostRamGb", Number(value))}
                min={1}
                step={16}
                unit="GB"
              />
            </CardContent>
          </Card>

          {/* Constraints Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Constraints
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InputField
                id="vCpuToCoreRatio"
                label={t("vcpuToCoreRatio")}
                type="number"
                value={values.vCpuToCoreRatio.toString()}
                onChange={(value) => setValue("vCpuToCoreRatio", Number(value))}
                min={1}
                max={16}
                step={1}
              />
              <InputField
                id="targetCpuUtilization"
                label={t("targetCpuUtilization")}
                type="number"
                value={values.targetCpuUtilization.toString()}
                onChange={(value) => setValue("targetCpuUtilization", Number(value))}
                min={1}
                max={100}
                step={5}
                unit="%"
              />
              <InputField
                id="targetRamUtilization"
                label={t("targetRamUtilization")}
                type="number"
                value={values.targetRamUtilization.toString()}
                onChange={(value) => setValue("targetRamUtilization", Number(value))}
                min={1}
                max={100}
                step={5}
                unit="%"
              />
              <div className="flex items-center space-x-2">
                <Switch
                  id="highAvailability"
                  checked={values.highAvailability}
                  onCheckedChange={(checked) => setValue("highAvailability", checked)}
                />
                <Label htmlFor="highAvailability" className="cursor-pointer">
                  {t("highAvailability")}
                </Label>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Results */}
        <div className="space-y-6">
          {result && (
            <>
              {/* Host Requirements Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Host Requirements</CardTitle>
                  <div className="flex gap-2">
                    <PdfExportButton sections={pdfSections} options={{ title: t("title") }} />
                    <CsvExportButton data={csvData} filename="server-virtualization-calculator" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Large prominent number */}
                  <div className="text-center p-4 bg-primary/10 rounded-lg">
                    <p className="text-5xl font-bold text-primary">{result.hostsNeededTotal}</p>
                    <p className="text-sm text-muted-foreground mt-2">{t("hostsNeededTotal")}</p>
                  </div>

                  {/* Limiting factor badge */}
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-sm text-muted-foreground">{t("limitingFactor")}:</span>
                    {result.limitingFactor === "cpu" ? (
                      <Badge variant="default" className="gap-1">
                        <Cpu className="h-3 w-3" />
                        CPU
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1">
                        <HardDrive className="h-3 w-3" />
                        RAM
                      </Badge>
                    )}
                  </div>

                  {/* Metrics Grid */}
                  <ResultGrid
                    results={[
                      {
                        label: t("vcpuConsolidationRatio"),
                        value: result.vCpuConsolidationRatio.toFixed(2),
                      },
                      {
                        label: t("finalCpuUtilization"),
                        value: `${result.finalCpuUtilization.toFixed(1)}%`,
                      },
                      {
                        label: t("finalRamUtilization"),
                        value: `${result.finalRamUtilization.toFixed(1)}%`,
                      },
                    ]}
                    columns={3}
                  />
                </CardContent>
              </Card>

              {/* Calculation Details Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Calculation Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 rounded-lg bg-muted p-4">
                    {result.steps.map((step, index) => (
                      <div key={`step-${index}-${step.slice(0, 20)}`} className="flex gap-3">
                        <span className="text-sm font-medium text-muted-foreground">
                          {index + 1}.
                        </span>
                        <span className="text-sm">{step}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>

      {calculationError && <p className="mt-2 text-sm text-destructive">{calculationError}</p>}
    </div>
  );
}
