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
  calculateVmwareLicensing,
  type VmwareLicensingInput,
  type VmwareLicensingResult,
} from "@/lib/converters/infrastructure/vmware-licensing";
import type { CsvRow } from "@/lib/utils/csv-export";
import type { PdfSection } from "@/lib/utils/pdf-export";
import { createCalculatorStore } from "@/stores/calculator-store";

const useVmwareLicensingStore = createCalculatorStore<VmwareLicensingInput, VmwareLicensingResult>({
  name: "vmware-licensing",
  initialValues: {
    hostCount: 4,
    cpusPerHost: 2,
    coresPerCpu: 16,
    productType: "vcf",
    termYears: 3,
  },
  calculate: (input) => calculateVmwareLicensing(input),
});

export function VmwareLicensingCalculator() {
  const t = useTranslations("calculator.vmwareLicensingCalculator");
  const tCommon = useTranslations("common");
  const format = useFormatter();
  const { values, setValue, result, calculationError } = useVmwareLicensingStore();

  // PDF export sections
  const pdfSections: PdfSection[] = useMemo(() => {
    if (!result) return [];
    const sections: PdfSection[] = [
      {
        title: "Host Configuration",
        items: [
          { label: t("hostCount"), value: values.hostCount, unit: "" },
          { label: t("cpusPerHost"), value: values.cpusPerHost, unit: "" },
          { label: t("coresPerCpu"), value: values.coresPerCpu, unit: "" },
        ],
      },
      {
        title: "Licensing",
        items: [
          { label: t("productType"), value: t(`products.${values.productType}`), unit: "" },
          { label: t("termYears"), value: values.termYears, unit: tCommon("years") },
        ],
      },
      {
        title: "Results",
        items: [
          { label: t("totalLicensedCores"), value: result.totalLicensedCores, unit: "" },
          {
            label: t("annualCost"),
            value: format.number(result.annualCost, {
              style: "currency",
              currency: "USD",
              maximumFractionDigits: 0,
            }),
            unit: "",
          },
          {
            label: t("totalCost"),
            value: format.number(result.totalCost, {
              style: "currency",
              currency: "USD",
              maximumFractionDigits: 0,
            }),
            unit: "",
          },
        ],
      },
    ];
    if (result.vsanEntitlementTib !== null) {
      sections[2].items.push({
        label: t("vsanEntitlement"),
        value: result.vsanEntitlementTib.toFixed(2),
        unit: "TiB",
      });
    }
    return sections;
  }, [result, values, t, tCommon, format]);

  // CSV export data
  const csvData: CsvRow[] = useMemo(() => {
    if (!result) return [];
    const rows: CsvRow[] = [
      { Field: t("hostCount"), Value: values.hostCount, Unit: "" },
      { Field: t("cpusPerHost"), Value: values.cpusPerHost, Unit: "" },
      { Field: t("coresPerCpu"), Value: values.coresPerCpu, Unit: "" },
      { Field: t("productType"), Value: t(`products.${values.productType}`), Unit: "" },
      { Field: t("termYears"), Value: values.termYears, Unit: tCommon("years") },
      { Field: t("totalLicensedCores"), Value: result.totalLicensedCores, Unit: "" },
      { Field: t("annualCost"), Value: result.annualCost, Unit: "USD" },
      { Field: t("totalCost"), Value: result.totalCost, Unit: "USD" },
    ];
    if (result.vsanEntitlementTib !== null) {
      rows.push({
        Field: t("vsanEntitlement"),
        Value: result.vsanEntitlementTib.toFixed(2),
        Unit: "TiB",
      });
    }
    return rows;
  }, [result, values, t, tCommon]);

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
                Host Configuration
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
            </CardContent>
          </Card>

          {/* Product Selection Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Product Selection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="productType">{t("productType")}</Label>
                <Select
                  value={values.productType}
                  onValueChange={(value) =>
                    setValue("productType", value as VmwareLicensingInput["productType"])
                  }
                >
                  <SelectTrigger id="productType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vcf">{t("productVcf")}</SelectItem>
                    <SelectItem value="vvf">{t("productVvf")}</SelectItem>
                    <SelectItem value="vsphere-ep">{t("productVsphereEp")}</SelectItem>
                    <SelectItem value="vsphere-std">{t("productVsphereStd")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="termYears">{t("termYears")}</Label>
                <Select
                  value={values.termYears.toString()}
                  onValueChange={(value) => setValue("termYears", Number(value) as 1 | 3 | 5)}
                >
                  <SelectTrigger id="termYears">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 year</SelectItem>
                    <SelectItem value="3">3 years</SelectItem>
                    <SelectItem value="5">5 years</SelectItem>
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
              {/* Licensing Costs Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Licensing Costs</CardTitle>
                  <div className="flex gap-2">
                    <PdfExportButton sections={pdfSections} options={{ title: t("title") }} />
                    <CsvExportButton data={csvData} filename="vmware-licensing-calculator" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Large prominent cost display */}
                  <div className="text-center p-4 bg-primary/10 rounded-lg">
                    <p className="text-5xl font-bold text-primary">
                      {format.number(result.totalCost, {
                        style: "currency",
                        currency: "USD",
                        maximumFractionDigits: 0,
                      })}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">{t("totalCost")}</p>
                  </div>

                  {/* 16-core minimum warning */}
                  {result.minCoreEnforced && (
                    <Card className="border-amber-500/50 bg-amber-500/10">
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                              {t("minCoreEnforced")}
                            </p>
                            <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                              VMware enforces a minimum of 16 cores per CPU for licensing purposes.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Metrics Grid */}
                  <ResultGrid
                    results={[
                      {
                        label: t("totalLicensedCores"),
                        value: result.totalLicensedCores.toString(),
                      },
                      {
                        label: t("coresPerCpuLicensed"),
                        value: result.coresPerCpuLicensed.toString(),
                      },
                      {
                        label: t("annualCost"),
                        value: format.number(result.annualCost, {
                          style: "currency",
                          currency: "USD",
                          maximumFractionDigits: 0,
                        }),
                      },
                      ...(result.vsanEntitlementTib !== null
                        ? [
                            {
                              label: t("vsanEntitlementTib"),
                              value: `${result.vsanEntitlementTib.toFixed(2)} TiB`,
                            },
                          ]
                        : []),
                    ]}
                    columns={2}
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

              {/* Pricing Disclaimer Card */}
              <Card className="border-blue-500/50 bg-blue-500/10">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                      {t("pricingDisclaimer")}
                    </p>
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
