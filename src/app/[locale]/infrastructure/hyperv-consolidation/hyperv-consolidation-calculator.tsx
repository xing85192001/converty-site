"use client";

import { HardDrive, Server } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useMemo } from "react";
import { CsvExportButton, InputField, PdfExportButton, ResultGrid } from "@/components/converter";
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
  calculateHypervConsolidation,
  type HypervConsolidationInput,
  type HypervConsolidationResult,
} from "@/lib/converters/infrastructure/hyperv-consolidation";
import type { CsvRow } from "@/lib/utils/csv-export";
import type { PdfSection } from "@/lib/utils/pdf-export";
import { createCalculatorStore } from "@/stores/calculator-store";

const useHypervConsolidationStore = createCalculatorStore<
  HypervConsolidationInput,
  HypervConsolidationResult
>({
  name: "hyperv-consolidation",
  initialValues: {
    vmCount: 50,
    avgVcpusPerVm: 4,
    avgRamPerVm: 8,
    avgStoragePerVm: 100,
    coresPerCpu: 12,
    cpusPerHost: 2,
    ramPerHost: 512,
    storagePerHost: 10000,
    haMode: "n_plus_1",
    enableReplica: true,
    enableSnapshots: true,
    diskType: "dynamic",
    vcpuRatio: 4,
    ramOvercommit: 1.0,
  },
  calculate: (input) => calculateHypervConsolidation(input),
});

export function HypervConsolidationCalculator() {
  const t = useTranslations("calculator.hypervConsolidation");
  const format = useFormatter();
  const { values, setValue, result, calculationError } = useHypervConsolidationStore();

  // PDF export sections
  const pdfSections: PdfSection[] = useMemo(() => {
    if (!result) return [];
    return [
      {
        title: "VM Workload",
        items: [
          { label: t("vmCount"), value: values.vmCount, unit: "VMs" },
          { label: t("avgVcpusPerVm"), value: values.avgVcpusPerVm, unit: "vCPU" },
          { label: t("avgRamPerVm"), value: values.avgRamPerVm, unit: "GB" },
          { label: t("avgStoragePerVm"), value: values.avgStoragePerVm, unit: "GB" },
        ],
      },
      {
        title: "Host Configuration",
        items: [
          { label: t("cpusPerHost"), value: values.cpusPerHost, unit: "" },
          { label: t("coresPerCpu"), value: values.coresPerCpu, unit: "" },
          { label: t("ramPerHost"), value: values.ramPerHost, unit: "GB" },
          { label: t("storagePerHost"), value: values.storagePerHost, unit: "GB" },
        ],
      },
      {
        title: "Results",
        items: [
          { label: t("hostsRequired"), value: result.hostsRequired, unit: "" },
          {
            label: t("totalStorageRequired"),
            value: result.totalStorageRequired.toFixed(2),
            unit: "GB",
          },
          {
            label: t("datacenterCost"),
            value: format.number(result.licensing.datacenter.totalCost, {
              style: "currency",
              currency: "USD",
              maximumFractionDigits: 0,
            }),
            unit: "",
          },
        ],
      },
    ];
  }, [result, values, t, format]);

  // CSV export data
  const csvData: CsvRow[] = useMemo(() => {
    if (!result) return [];
    return [
      { Field: t("vmCount"), Value: values.vmCount, Unit: "VMs" },
      { Field: t("avgVcpusPerVm"), Value: values.avgVcpusPerVm, Unit: "vCPU" },
      { Field: t("avgRamPerVm"), Value: values.avgRamPerVm, Unit: "GB" },
      { Field: t("avgStoragePerVm"), Value: values.avgStoragePerVm, Unit: "GB" },
      { Field: t("hostsRequired"), Value: result.hostsRequired, Unit: "" },
      {
        Field: t("totalStorageRequired"),
        Value: result.totalStorageRequired.toFixed(2),
        Unit: "GB",
      },
      { Field: t("datacenterCost"), Value: result.licensing.datacenter.totalCost, Unit: "USD" },
    ];
  }, [result, values, t]);

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
                {t("vmWorkload")}
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
                unit="VMs"
              />
              <InputField
                id="avgVcpusPerVm"
                label={t("avgVcpusPerVm")}
                type="number"
                value={values.avgVcpusPerVm.toString()}
                onChange={(value) => setValue("avgVcpusPerVm", Number(value))}
                min={1}
                step={1}
                unit="vCPU"
              />
              <InputField
                id="avgRamPerVm"
                label={t("avgRamPerVm")}
                type="number"
                value={values.avgRamPerVm.toString()}
                onChange={(value) => setValue("avgRamPerVm", Number(value))}
                min={1}
                step={1}
                unit="GB"
              />
              <InputField
                id="avgStoragePerVm"
                label={t("avgStoragePerVm")}
                type="number"
                value={values.avgStoragePerVm.toString()}
                onChange={(value) => setValue("avgStoragePerVm", Number(value))}
                min={1}
                step={1}
                unit="GB"
              />
            </CardContent>
          </Card>

          {/* Host Configuration Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                {t("hostConfiguration")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InputField
                id="cpusPerHost"
                label={t("cpusPerHost")}
                type="number"
                value={values.cpusPerHost.toString()}
                onChange={(value) => setValue("cpusPerHost", Number(value))}
                min={1}
                max={4}
                step={1}
                unit="CPUs"
              />
              <InputField
                id="coresPerCpu"
                label={t("coresPerCpu")}
                type="number"
                value={values.coresPerCpu.toString()}
                onChange={(value) => setValue("coresPerCpu", Number(value))}
                min={1}
                max={64}
                step={1}
                unit="cores"
              />
              <InputField
                id="ramPerHost"
                label={t("ramPerHost")}
                type="number"
                value={values.ramPerHost.toString()}
                onChange={(value) => setValue("ramPerHost", Number(value))}
                min={1}
                step={1}
                unit="GB"
              />
              <InputField
                id="storagePerHost"
                label={t("storagePerHost")}
                type="number"
                value={values.storagePerHost.toString()}
                onChange={(value) => setValue("storagePerHost", Number(value))}
                min={1}
                step={1}
                unit="GB"
              />
            </CardContent>
          </Card>

          {/* Storage & HA Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="h-5 w-5" />
                {t("storageAndHa")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="haMode">{t("haMode")}</Label>
                <Select
                  value={values.haMode}
                  onValueChange={(value) =>
                    setValue("haMode", value as HypervConsolidationInput["haMode"])
                  }
                >
                  <SelectTrigger id="haMode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t("haModeNone")}</SelectItem>
                    <SelectItem value="n_plus_1">{t("haModeNPlus1")}</SelectItem>
                    <SelectItem value="n_plus_2">{t("haModeNPlus2")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="diskType">{t("diskType")}</Label>
                <Select
                  value={values.diskType}
                  onValueChange={(value) =>
                    setValue("diskType", value as HypervConsolidationInput["diskType"])
                  }
                >
                  <SelectTrigger id="diskType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">{t("diskTypeFixed")}</SelectItem>
                    <SelectItem value="dynamic">{t("diskTypeDynamic")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="enableReplica" className="cursor-pointer">
                  {t("enableReplica")}
                </Label>
                <Switch
                  id="enableReplica"
                  checked={values.enableReplica}
                  onCheckedChange={(checked) => setValue("enableReplica", checked)}
                />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="enableSnapshots" className="cursor-pointer">
                  {t("enableSnapshots")}
                </Label>
                <Switch
                  id="enableSnapshots"
                  checked={values.enableSnapshots}
                  onCheckedChange={(checked) => setValue("enableSnapshots", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Results */}
        <div className="space-y-6">
          {result && (
            <>
              {/* Summary Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>{t("consolidationSummary")}</CardTitle>
                  <div className="flex gap-2">
                    <PdfExportButton sections={pdfSections} options={{ title: t("title") }} />
                    <CsvExportButton data={csvData} filename="hyperv-consolidation" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Large prominent host count */}
                  <div className="text-center p-4 bg-primary/10 rounded-lg">
                    <p className="text-5xl font-bold text-primary">{result.hostsRequired}</p>
                    <p className="text-sm text-muted-foreground mt-2">{t("hostsRequired")}</p>
                  </div>

                  {/* Metrics Grid */}
                  <ResultGrid
                    results={[
                      {
                        label: t("totalStorageRequired"),
                        value: `${result.totalStorageRequired.toFixed(2)} GB`,
                      },
                      {
                        label: t("hostsRequired"),
                        value: result.hostsRequired.toString(),
                      },
                    ]}
                    columns={2}
                  />
                </CardContent>
              </Card>

              {/* Windows Licensing Card */}
              <Card>
                <CardHeader>
                  <CardTitle>{t("windowsLicensing")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    {/* Datacenter Edition */}
                    <div className="p-4 border rounded-lg bg-primary/5">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{t("windowsDatacenter")}</h4>
                        {result.licensing.recommendation === "datacenter" && (
                          <span className="text-xs font-medium text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-100 px-2 py-1 rounded">
                            {t("recommended")}
                          </span>
                        )}
                      </div>
                      <p className="text-2xl font-bold text-primary">
                        {format.number(result.licensing.datacenter.totalCost, {
                          style: "currency",
                          currency: "USD",
                          maximumFractionDigits: 0,
                        })}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {result.licensing.datacenter.licensesRequired} {t("licenses")} ×{" "}
                        {result.licensing.datacenter.corePacksRequired} {t("corePacks")}
                      </p>
                    </div>

                    {/* Standard Edition */}
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{t("windowsStandard")}</h4>
                        {result.licensing.recommendation === "standard" && (
                          <span className="text-xs font-medium text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-100 px-2 py-1 rounded">
                            {t("recommended")}
                          </span>
                        )}
                      </div>
                      <p className="text-2xl font-bold">
                        {format.number(result.licensing.standard.totalCost, {
                          style: "currency",
                          currency: "USD",
                          maximumFractionDigits: 0,
                        })}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {result.licensing.standard.licensesRequired} {t("licenses")} ×{" "}
                        {result.licensing.standard.corePacksRequired} {t("corePacks")}
                      </p>
                    </div>

                    {/* Savings */}
                    {result.licensing.standard.totalCost - result.licensing.datacenter.totalCost >
                      0 && (
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <p className="text-sm text-green-800 dark:text-green-200">
                          {t("savingsWithDatacenter")}:{" "}
                          <span className="font-bold">
                            {format.number(
                              result.licensing.standard.totalCost -
                                result.licensing.datacenter.totalCost,
                              {
                                style: "currency",
                                currency: "USD",
                                maximumFractionDigits: 0,
                              }
                            )}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Calculation Details Card */}
              <Card>
                <CardHeader>
                  <CardTitle>{t("calculationDetails")}</CardTitle>
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
