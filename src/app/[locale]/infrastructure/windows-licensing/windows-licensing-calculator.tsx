"use client";

import { AlertCircle, DollarSign, Server } from "lucide-react";
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
import {
  calculateWindowsLicensing,
  type WindowsLicensingInput,
  type WindowsLicensingResult,
} from "@/lib/converters/infrastructure/windows-licensing";
import type { CsvRow } from "@/lib/utils/csv-export";
import type { PdfSection } from "@/lib/utils/pdf-export";
import { createCalculatorStore } from "@/stores/calculator-store";

const useWindowsLicensingStore = createCalculatorStore<
  WindowsLicensingInput,
  WindowsLicensingResult
>({
  name: "windows-licensing",
  initialValues: {
    hostCount: 4,
    coresPerCpu: 16,
    socketsPerHost: 2,
    vmCount: 50,
    calculationMode: "compare",
  },
  calculate: (input) => calculateWindowsLicensing(input),
});

export function WindowsLicensingCalculator() {
  const t = useTranslations("calculator.windowsLicensing");
  const format = useFormatter();
  const { values, setValue, result, calculationError } = useWindowsLicensingStore();

  // PDF export sections
  const pdfSections: PdfSection[] = useMemo(() => {
    if (!result) return [];
    return [
      {
        title: "Host Configuration",
        items: [
          { label: t("hostCount"), value: values.hostCount, unit: "" },
          { label: t("socketsPerHost"), value: values.socketsPerHost, unit: "" },
          { label: t("coresPerCpu"), value: values.coresPerCpu, unit: "" },
          { label: t("vmCount"), value: values.vmCount, unit: "VMs" },
        ],
      },
      {
        title: "Results",
        items: [
          { label: t("totalPhysicalCores"), value: result.datacenter.totalCores, unit: "" },
          { label: t("totalLicensedCores"), value: result.datacenter.coresPerHost, unit: "" },
          {
            label: t("datacenterCost"),
            value: format.number(result.datacenter.totalCost, {
              style: "currency",
              currency: "USD",
              maximumFractionDigits: 0,
            }),
            unit: "",
          },
          {
            label: t("standardCost"),
            value: format.number(result.standard.totalCost, {
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
      { Field: t("hostCount"), Value: values.hostCount, Unit: "" },
      { Field: t("socketsPerHost"), Value: values.socketsPerHost, Unit: "" },
      { Field: t("coresPerCpu"), Value: values.coresPerCpu, Unit: "" },
      { Field: t("vmCount"), Value: values.vmCount, Unit: "VMs" },
      { Field: t("totalPhysicalCores"), Value: result.datacenter.totalCores, Unit: "" },
      { Field: t("totalLicensedCores"), Value: result.datacenter.coresPerHost, Unit: "" },
      { Field: t("datacenterCost"), Value: result.datacenter.totalCost, Unit: "USD" },
      { Field: t("standardCost"), Value: result.standard.totalCost, Unit: "USD" },
      { Field: t("savings"), Value: result.comparison.savings, Unit: "USD" },
    ];
  }, [result, values, t]);

  return (
    <div className="space-y-4">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column - Inputs */}
        <div className="space-y-6">
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
                id="hostCount"
                label={t("hostCount")}
                type="number"
                value={values.hostCount.toString()}
                onChange={(value) => setValue("hostCount", Number(value))}
                min={1}
                step={1}
                unit="hosts"
              />
              <InputField
                id="socketsPerHost"
                label={t("socketsPerHost")}
                type="number"
                value={values.socketsPerHost.toString()}
                onChange={(value) => setValue("socketsPerHost", Number(value))}
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
                id="vmCount"
                label={t("vmCount")}
                type="number"
                value={values.vmCount.toString()}
                onChange={(value) => setValue("vmCount", Number(value))}
                min={1}
                step={1}
                unit="VMs"
              />
            </CardContent>
          </Card>

          {/* Calculation Mode Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                {t("calculationMode")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="calculationMode">{t("mode")}</Label>
                <Select
                  value={values.calculationMode}
                  onValueChange={(value) =>
                    setValue("calculationMode", value as WindowsLicensingInput["calculationMode"])
                  }
                >
                  <SelectTrigger id="calculationMode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compare">{t("modeCompare")}</SelectItem>
                    <SelectItem value="datacenter">{t("modeDatacenter")}</SelectItem>
                    <SelectItem value="standard">{t("modeStandard")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Results */}
        <div className="space-y-6">
          {result && (
            <>
              {/* Licensing Comparison Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>{t("licensingComparison")}</CardTitle>
                  <div className="flex gap-2">
                    <PdfExportButton sections={pdfSections} options={{ title: t("title") }} />
                    <CsvExportButton data={csvData} filename="windows-licensing" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Core Summary */}
                  <ResultGrid
                    results={[
                      {
                        label: t("totalPhysicalCores"),
                        value: result.datacenter.totalCores.toString(),
                      },
                      {
                        label: t("totalLicensedCores"),
                        value: result.datacenter.coresPerHost.toString(),
                      },
                    ]}
                    columns={2}
                  />

                  {/* Datacenter Edition */}
                  <div className="p-4 border rounded-lg bg-primary/5">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{t("windowsDatacenter")}</h4>
                      {result.comparison.recommendation === "datacenter" && (
                        <span className="text-xs font-medium text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-100 px-2 py-1 rounded">
                          {t("recommended")}
                        </span>
                      )}
                    </div>
                    <p className="text-3xl font-bold text-primary">
                      {format.number(result.datacenter.totalCost, {
                        style: "currency",
                        currency: "USD",
                        maximumFractionDigits: 0,
                      })}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {values.hostCount} {t("licenses")} × {result.datacenter.corePacksPerHost}{" "}
                      {t("corePacks")} = {values.vmCount} {t("vmsUnlimited")}
                    </p>
                  </div>

                  {/* Standard Edition */}
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{t("windowsStandard")}</h4>
                      {result.comparison.recommendation === "standard" && (
                        <span className="text-xs font-medium text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-100 px-2 py-1 rounded">
                          {t("recommended")}
                        </span>
                      )}
                    </div>
                    <p className="text-3xl font-bold">
                      {format.number(result.standard.totalCost, {
                        style: "currency",
                        currency: "USD",
                        maximumFractionDigits: 0,
                      })}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {result.standard.licensesRequired} {t("licenses")} ×{" "}
                      {result.standard.corePacksPerHost} {t("corePacks")} = {values.vmCount}{" "}
                      {t("vms")} (2 {t("vmsPerLicense")})
                    </p>
                  </div>

                  {/* Savings */}
                  {result.comparison.savings > 0 && (
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-green-800 dark:text-green-200">
                          {t("savingsWithDatacenter")}
                        </p>
                        <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                          {format.number(result.comparison.savings, {
                            style: "currency",
                            currency: "USD",
                            maximumFractionDigits: 0,
                          })}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Break-even Analysis */}
                  <div className="p-4 border rounded-lg bg-muted/50">
                    <h4 className="font-medium mb-2">{t("breakEvenAnalysis")}</h4>
                    <p className="text-sm text-muted-foreground">
                      {t("breakEvenDesc", { count: result.comparison.breakEvenVms })}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* 16-core minimum warning */}
              {result.datacenter.coresPerHost >= 16 && (
                <Card className="border-amber-500/50 bg-amber-500/10">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                          {t("minCoreEnforced")}
                        </p>
                        <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                          {t("minCoreEnforcedDesc")}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

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

              {/* Pricing Disclaimer Card */}
              {result.pricingWarning && (
                <Card className="border-blue-500/50 bg-blue-500/10">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="space-y-2">
                        <p className="text-sm text-blue-900 dark:text-blue-100">
                          {t("pricingDisclaimer")}
                        </p>
                        <a
                          href={result.pricingWarning.vendorUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-700 dark:text-blue-300 underline hover:no-underline"
                        >
                          {t("checkVendorPricing")}
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>

      {calculationError && <p className="mt-2 text-sm text-destructive">{calculationError}</p>}
    </div>
  );
}
