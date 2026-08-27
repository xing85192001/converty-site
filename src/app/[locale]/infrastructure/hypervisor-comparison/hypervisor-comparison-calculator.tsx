"use client";

import { AlertCircle, Award, TrendingUp } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useMemo } from "react";
import { CsvExportButton, InputField, PdfExportButton } from "@/components/converter";
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
  calculateHypervisorComparison,
  type HypervisorComparisonInput,
  type HypervisorComparisonResult,
} from "@/lib/converters/infrastructure";
import type { CsvRow } from "@/lib/utils/csv-export";
import type { PdfSection } from "@/lib/utils/pdf-export";
import { createCalculatorStore } from "@/stores/calculator-store";
import { FeatureMatrixTable } from "./FeatureMatrixTable";

const useHypervisorComparisonStore = createCalculatorStore<
  HypervisorComparisonInput,
  HypervisorComparisonResult
>({
  name: "hypervisor-comparison",
  initialValues: {
    vmCount: 100,
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
    vcpuRatio: 4,
    ramOvercommit: 1.0,
    powerCostPerKwh: 0.12,
    hostPowerWatts: 500,
    laborHourlyRate: 75,
    hardwareCostPerHost: 15000,
    hardwareLifespanYears: 5,
    windowsEdition: "datacenter",
  },
  calculate: (input) => calculateHypervisorComparison(input),
});

export function HypervisorComparisonCalculator() {
  const t = useTranslations("converter.hypervisor-comparison");
  const format = useFormatter();
  const { values, setValue, result, calculationError } = useHypervisorComparisonStore();

  const platformNames: Record<string, string> = {
    vmware: "VMware vSphere",
    hyperv: "Microsoft Hyper-V",
    proxmox: "Proxmox VE",
    xcpng: "XCP-ng",
  };

  // PDF export sections
  const pdfSections: PdfSection[] = useMemo(() => {
    if (!result) return [];
    return [
      {
        title: "Workload",
        items: [
          { label: t("vmCount"), value: values.vmCount, unit: "VMs" },
          { label: t("avgVcpusPerVm"), value: values.avgVcpusPerVm, unit: "vCPU" },
          { label: t("avgRamPerVm"), value: values.avgRamPerVm, unit: "GB" },
        ],
      },
      {
        title: "Best Overall",
        items: [
          {
            label: t("bestOverall"),
            value: platformNames[result.recommendation.bestOverall],
            unit: "",
          },
        ],
      },
    ];
  }, [result, values, t]);

  // CSV export data
  const csvData: CsvRow[] = useMemo(() => {
    if (!result) return [];
    const rows: CsvRow[] = [];
    result.platforms.forEach((platform) => {
      rows.push({
        Field: "Platform",
        Value: platform.platformName,
        Unit: "",
      });
      rows.push({
        Field: "Total 5-Year Cost",
        Value: platform.costs.total.fiveYear,
        Unit: "USD",
      });
      rows.push({
        Field: "Hosts Required",
        Value: platform.totalHostsRequired,
        Unit: "",
      });
    });
    return rows;
  }, [result]);

  return (
    <div className="space-y-4">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column - Inputs */}
        <div className="space-y-6">
          {/* Workload Card */}
          <Card>
            <CardHeader>
              <CardTitle>{t("workload")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InputField
                id="vmCount"
                label={t("vmCount")}
                type="number"
                value={values.vmCount.toString()}
                onChange={(value: string) => setValue("vmCount", Number(value))}
                min={1}
                step={1}
                unit="VMs"
              />
              <InputField
                id="avgVcpusPerVm"
                label={t("avgVcpusPerVm")}
                type="number"
                value={values.avgVcpusPerVm.toString()}
                onChange={(value: string) => setValue("avgVcpusPerVm", Number(value))}
                min={1}
                step={1}
                unit="vCPU"
              />
              <InputField
                id="avgRamPerVm"
                label={t("avgRamPerVm")}
                type="number"
                value={values.avgRamPerVm.toString()}
                onChange={(value: string) => setValue("avgRamPerVm", Number(value))}
                min={1}
                step={1}
                unit="GB"
              />
              <InputField
                id="avgStoragePerVm"
                label={t("avgStoragePerVm")}
                type="number"
                value={values.avgStoragePerVm.toString()}
                onChange={(value: string) => setValue("avgStoragePerVm", Number(value))}
                min={1}
                step={1}
                unit="GB"
              />
            </CardContent>
          </Card>

          {/* Host Specs Card */}
          <Card>
            <CardHeader>
              <CardTitle>{t("hostSpecs")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InputField
                id="cpusPerHost"
                label={t("cpusPerHost")}
                type="number"
                value={values.cpusPerHost.toString()}
                onChange={(value: string) => setValue("cpusPerHost", Number(value))}
                min={1}
                step={1}
                unit="CPUs"
              />
              <InputField
                id="coresPerCpu"
                label={t("coresPerCpu")}
                type="number"
                value={values.coresPerCpu.toString()}
                onChange={(value: string) => setValue("coresPerCpu", Number(value))}
                min={2}
                step={1}
                unit="cores"
              />
              <InputField
                id="ramPerHost"
                label={t("ramPerHost")}
                type="number"
                value={values.ramPerHost.toString()}
                onChange={(value: string) => setValue("ramPerHost", Number(value))}
                min={16}
                step={1}
                unit="GB"
              />
              <InputField
                id="storagePerHost"
                label={t("storagePerHost")}
                type="number"
                value={values.storagePerHost.toString()}
                onChange={(value: string) => setValue("storagePerHost", Number(value))}
                min={100}
                step={1}
                unit="GB"
              />
            </CardContent>
          </Card>

          {/* HA Options Card */}
          <Card>
            <CardHeader>
              <CardTitle>{t("haOptions")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="haMode">{t("haMode")}</Label>
                <Select
                  value={values.haMode}
                  onValueChange={(value) =>
                    setValue("haMode", value as HypervisorComparisonInput["haMode"])
                  }
                >
                  <SelectTrigger id="haMode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t("haModes.none")}</SelectItem>
                    <SelectItem value="n_plus_1">{t("haModes.n_plus_1")}</SelectItem>
                    <SelectItem value="n_plus_2">{t("haModes.n_plus_2")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="enableSnapshots">{t("enableSnapshots")}</Label>
                <Switch
                  id="enableSnapshots"
                  checked={values.enableSnapshots}
                  onCheckedChange={(checked) => setValue("enableSnapshots", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="enableReplica">{t("enableReplica")}</Label>
                <Switch
                  id="enableReplica"
                  checked={values.enableReplica}
                  onCheckedChange={(checked) => setValue("enableReplica", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Overcommit Card */}
          <Card>
            <CardHeader>
              <CardTitle>{t("overcommit")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InputField
                id="vcpuRatio"
                label={t("vcpuRatio")}
                type="number"
                value={values.vcpuRatio.toString()}
                onChange={(value: string) => setValue("vcpuRatio", Number(value))}
                min={1}
                max={16}
                step={0.5}
                unit=""
              />
              <InputField
                id="ramOvercommit"
                label={t("ramOvercommit")}
                type="number"
                value={values.ramOvercommit.toString()}
                onChange={(value: string) => setValue("ramOvercommit", Number(value))}
                min={1}
                max={2}
                step={0.1}
                unit=""
              />
            </CardContent>
          </Card>

          {/* Cost Factors Card */}
          <Card>
            <CardHeader>
              <CardTitle>{t("costFactors")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InputField
                id="powerCostPerKwh"
                label={t("powerCostPerKwh")}
                type="number"
                value={values.powerCostPerKwh.toString()}
                onChange={(value: string) => setValue("powerCostPerKwh", Number(value))}
                min={0.01}
                step={0.01}
                unit="USD"
              />
              <InputField
                id="hostPowerWatts"
                label={t("hostPowerWatts")}
                type="number"
                value={values.hostPowerWatts.toString()}
                onChange={(value: string) => setValue("hostPowerWatts", Number(value))}
                min={100}
                step={10}
                unit="W"
              />
              <InputField
                id="laborHourlyRate"
                label={t("laborHourlyRate")}
                type="number"
                value={values.laborHourlyRate.toString()}
                onChange={(value: string) => setValue("laborHourlyRate", Number(value))}
                min={10}
                step={5}
                unit="USD/hr"
              />
              <InputField
                id="hardwareCostPerHost"
                label={t("hardwareCostPerHost")}
                type="number"
                value={values.hardwareCostPerHost.toString()}
                onChange={(value: string) => setValue("hardwareCostPerHost", Number(value))}
                min={1000}
                step={1000}
                unit="USD"
              />
              <InputField
                id="hardwareLifespanYears"
                label={t("hardwareLifespanYears")}
                type="number"
                value={values.hardwareLifespanYears.toString()}
                onChange={(value: string) => setValue("hardwareLifespanYears", Number(value))}
                min={3}
                max={10}
                step={1}
                unit="years"
              />

              <div className="space-y-2">
                <Label htmlFor="windowsEdition">{t("windowsEdition")}</Label>
                <Select
                  value={values.windowsEdition}
                  onValueChange={(value) =>
                    setValue("windowsEdition", value as "standard" | "datacenter")
                  }
                >
                  <SelectTrigger id="windowsEdition">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="datacenter">{t("windowsEditions.datacenter")}</SelectItem>
                    <SelectItem value="standard">{t("windowsEditions.standard")}</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">{t("windowsEditionHint")}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Results */}
        <div className="space-y-6">
          {result && (
            <>
              {/* Warnings */}
              {result.warnings.length > 0 && (
                <Card className="border-2 border-red-500/50 bg-red-50 dark:bg-red-950/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                      <AlertCircle className="h-5 w-5" />
                      {t("warnings")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-1 text-red-700 dark:text-red-400">
                      {result.warnings.map((warning, i) => (
                        <li key={i}>{warning}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Recommendation */}
              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    {t("recommendation")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-4 bg-primary/10 rounded-lg">
                    <p className="text-2xl font-bold text-primary">
                      {platformNames[result.recommendation.bestOverall]}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">{t("bestOverall")}</p>
                  </div>
                  <ul className="space-y-2 text-sm">
                    {result.recommendation.reasoning.map((reason, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* TCO Comparison */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    {t("tcoComparison")}
                  </CardTitle>
                  <div className="flex gap-2">
                    <PdfExportButton sections={pdfSections} options={{ title: t("name") }} />
                    <CsvExportButton data={csvData} filename="hypervisor-comparison" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {result.platforms.map((platform) => {
                      const isLowest =
                        platform.platform === result.comparison.costDifference.lowest;
                      return (
                        <div
                          key={platform.platform}
                          className={`border rounded-lg p-4 ${isLowest ? "ring-2 ring-green-500" : ""}`}
                        >
                          {isLowest && (
                            <div className="text-xs font-semibold text-green-600 mb-2">
                              {t("lowestCost")}
                            </div>
                          )}
                          <h4 className="font-semibold mb-2">{platform.platformName}</h4>
                          <div className="space-y-1 text-sm">
                            <div>
                              <span className="text-muted-foreground">{t("totalFiveYear")}:</span>
                              <div className="font-bold text-lg">
                                {format.number(platform.costs.total.fiveYear, {
                                  style: "currency",
                                  currency: "USD",
                                  maximumFractionDigits: 0,
                                })}
                              </div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">{t("annual")}:</span>
                              <div className="font-medium">
                                {format.number(platform.costs.total.annual, {
                                  style: "currency",
                                  currency: "USD",
                                  maximumFractionDigits: 0,
                                })}
                              </div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">{t("perVm")}:</span>
                              <div className="font-medium">
                                {format.number(platform.costs.total.perVm, {
                                  style: "currency",
                                  currency: "USD",
                                  maximumFractionDigits: 0,
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Cost Savings */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 dark:bg-green-950 dark:border-green-800">
                    <p className="text-sm">
                      <strong>{t("savings")}:</strong> Choosing{" "}
                      {platformNames[result.comparison.costDifference.lowest]} over{" "}
                      {platformNames[result.comparison.costDifference.highest]} saves{" "}
                      <strong>
                        {format.number(result.comparison.costDifference.savingsAmount, {
                          style: "currency",
                          currency: "USD",
                          maximumFractionDigits: 0,
                        })}
                      </strong>{" "}
                      ({result.comparison.costDifference.savingsPercent.toFixed(1)}%) over 5 years
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Sizing Details */}
              <Card>
                <CardHeader>
                  <CardTitle>{t("sizingDetails")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="border p-2 text-left">{t("platform")}</th>
                          <th className="border p-2 text-left">{t("hosts")}</th>
                          <th className="border p-2 text-left">{t("cpuUtilization")}</th>
                          <th className="border p-2 text-left">{t("ramUtilization")}</th>
                          <th className="border p-2 text-left">{t("storageMultiplier")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.platforms.map((platform) => (
                          <tr key={platform.platform}>
                            <td className="border p-2 font-medium">{platform.platformName}</td>
                            <td className="border p-2">
                              {platform.totalHostsRequired} ({platform.effectiveHosts} effective)
                            </td>
                            <td className="border p-2">
                              {platform.cpuCapacity.utilizationPercent.toFixed(1)}%
                            </td>
                            <td className="border p-2">
                              {platform.ramCapacity.utilizationPercent.toFixed(1)}%
                            </td>
                            <td className="border p-2">
                              {platform.storageCapacity.storageMultiplier.toFixed(2)}×
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Cost Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>{t("costBreakdown")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="border p-2 text-left">{t("platform")}</th>
                          <th className="border p-2 text-left">{t("licensing")}</th>
                          <th className="border p-2 text-left">{t("hardware")}</th>
                          <th className="border p-2 text-left">{t("power")}</th>
                          <th className="border p-2 text-left">{t("labor")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.platforms.map((platform) => (
                          <tr key={platform.platform}>
                            <td className="border p-2 font-medium">{platform.platformName}</td>
                            <td className="border p-2">
                              {format.number(platform.costs.licensing.total, {
                                style: "currency",
                                currency: "USD",
                                maximumFractionDigits: 0,
                              })}
                            </td>
                            <td className="border p-2">
                              {format.number(platform.costs.hardware.total, {
                                style: "currency",
                                currency: "USD",
                                maximumFractionDigits: 0,
                              })}
                            </td>
                            <td className="border p-2">
                              {format.number(platform.costs.power.total, {
                                style: "currency",
                                currency: "USD",
                                maximumFractionDigits: 0,
                              })}
                            </td>
                            <td className="border p-2">
                              {format.number(platform.costs.labor.total, {
                                style: "currency",
                                currency: "USD",
                                maximumFractionDigits: 0,
                              })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Feature Matrix */}
              <Card>
                <CardHeader>
                  <CardTitle>{t("featureComparison")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <FeatureMatrixTable features={result.features} />
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
