"use client";

import { AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type CpuComparisonInput,
  type CpuComparisonResult,
  calculateCpuComparison,
  getFilteredCpus,
} from "@/lib/converters/infrastructure";
import { createCalculatorStore } from "@/stores/calculator-store";

const useCpuComparisonStore = createCalculatorStore<CpuComparisonInput, CpuComparisonResult>({
  name: "cpu-comparison-calculator",
  initialValues: {
    cpuIds: "",
    vendor: "all",
    generation: "all",
  },
  calculate: (input) => calculateCpuComparison(input),
});

export function CpuComparisonCalculator() {
  const t = useTranslations("converter.cpu-comparison-calculator");
  const { values, setValue, result, calculationError } = useCpuComparisonStore();

  const filteredCpus = useMemo(
    () => getFilteredCpus(values.vendor, values.generation),
    [values.vendor, values.generation]
  );

  const selectedIds = useMemo(
    () => (values.cpuIds ? values.cpuIds.split(",").filter(Boolean) : []),
    [values.cpuIds]
  );

  function handleVendorChange(value: string) {
    setValue("vendor", value);
    setValue("cpuIds", "");
  }

  function handleGenerationChange(value: string) {
    setValue("generation", value);
    setValue("cpuIds", "");
  }

  function handleCheckboxChange(id: string, checked: boolean) {
    let newIds: string[];
    if (checked) {
      newIds = [...selectedIds, id].slice(0, 4);
    } else {
      newIds = selectedIds.filter((existingId) => existingId !== id);
    }
    setValue("cpuIds", newIds.join(","));
  }

  function capitalize(str: string): string {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  return (
    <div className="space-y-6">
      {/* Filter Panel */}
      <Card>
        <CardHeader>
          <CardTitle>{t("filterPanel")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="vendor-filter">{t("vendorFilter")}</Label>
            <Select value={values.vendor} onValueChange={handleVendorChange}>
              <SelectTrigger id="vendor-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("vendors.all")}</SelectItem>
                <SelectItem value="intel">{t("vendors.intel")}</SelectItem>
                <SelectItem value="amd">{t("vendors.amd")}</SelectItem>
                <SelectItem value="arm">{t("vendors.arm")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="generation-filter">{t("generationFilter")}</Label>
            <Select value={values.generation} onValueChange={handleGenerationChange}>
              <SelectTrigger id="generation-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("generations.all")}</SelectItem>
                <SelectItem value="current">{t("generations.current")}</SelectItem>
                <SelectItem value="previous">{t("generations.previous")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* CPU Selection Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{t("selectCpus")}</span>
            <span className="text-sm font-normal text-muted-foreground">
              {t("selectedCount", { count: selectedIds.length })}
            </span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">{t("selectCpusHint")}</p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2">
            {filteredCpus.map((cpu) => {
              const isChecked = selectedIds.includes(cpu.id);
              const isDisabled = !isChecked && selectedIds.length >= 4;
              return (
                <div key={cpu.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`cpu-${cpu.id}`}
                    checked={isChecked}
                    disabled={isDisabled}
                    onCheckedChange={(checked) => handleCheckboxChange(cpu.id, checked === true)}
                  />
                  <Label
                    htmlFor={`cpu-${cpu.id}`}
                    className={`cursor-pointer text-sm ${isDisabled ? "text-muted-foreground" : ""}`}
                  >
                    {cpu.name}
                  </Label>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      {result === null && selectedIds.length < 2 && (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center text-muted-foreground">
            {t("emptyState")}
          </CardContent>
        </Card>
      )}

      {/* Results Table */}
      {result !== null && (
        <div className="space-y-4">
          {/* Staleness Warning */}
          {result.isStale && (
            <Card className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                      {t("staleDataWarning")}
                    </p>
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                      {result.staleWarning}
                    </p>
                    <a
                      href="https://www.spec.org/cpu2017/results/cint2017.html"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-amber-700 underline dark:text-amber-400"
                    >
                      {t("specOrgLink")}
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Comparison Table */}
          <Card>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr>
                      <th className="border p-2 text-left bg-muted/50 min-w-[140px]" />
                      {result.rows.map((row, idx) => (
                        <th
                          key={row.id}
                          className={`border p-2 text-left min-w-[160px] ${idx === 0 ? "bg-muted/40" : "bg-muted/20"}`}
                        >
                          {row.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2 font-medium bg-muted/10">{t("vendor")}</td>
                      {result.rows.map((row) => (
                        <td key={row.id} className="border p-2">
                          {capitalize(row.vendor)}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="border p-2 font-medium bg-muted/10">{t("family")}</td>
                      {result.rows.map((row) => (
                        <td key={row.id} className="border p-2">
                          {row.family === "Unknown" ? "—" : row.family}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="border p-2 font-medium bg-muted/10">{t("generation")}</td>
                      {result.rows.map((row) => (
                        <td key={row.id} className="border p-2">
                          {t(`generations.${row.generation}`)}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="border p-2 font-medium bg-muted/10">{t("cores")}</td>
                      {result.rows.map((row) => (
                        <td key={row.id} className="border p-2">
                          {row.cores}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="border p-2 font-medium bg-muted/10">{t("tdpW")}</td>
                      {result.rows.map((row) => (
                        <td key={row.id} className="border p-2">
                          {row.tdpW > 0 ? `${row.tdpW} W` : "N/A"}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="border p-2 font-medium bg-muted/10">{t("socketType")}</td>
                      {result.rows.map((row) => (
                        <td key={row.id} className="border p-2">
                          {row.socketType === "Unknown" ? "—" : row.socketType}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="border p-2 font-medium bg-muted/10">{t("specint2017Base")}</td>
                      {result.rows.map((row) => (
                        <td key={row.id} className="border p-2">
                          {row.specint2017Base}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="border p-2 font-medium bg-muted/10">{t("specint2017Peak")}</td>
                      {result.rows.map((row) => (
                        <td key={row.id} className="border p-2">
                          {row.specint2017Peak}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="border p-2 font-medium bg-muted/10">{t("perfPerCore")}</td>
                      {result.rows.map((row) => (
                        <td key={row.id} className="border p-2">
                          {row.perfPerCore}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="border p-2 font-medium bg-muted/10">{t("perfPerWatt")}</td>
                      {result.rows.map((row) => (
                        <td key={row.id} className="border p-2">
                          {row.perfPerWatt > 0 ? row.perfPerWatt : "N/A"}
                        </td>
                      ))}
                    </tr>
                    <tr className="bg-primary/5">
                      <td className="border p-2 font-semibold bg-muted/10">{t("sizingRatio")}</td>
                      {result.rows.map((row) => (
                        <td key={row.id} className="border p-2 font-semibold">
                          {row.sizingRatioVsFirst === 1.0
                            ? t("baseline")
                            : `${row.sizingRatioVsFirst}x`}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {calculationError && <p className="mt-2 text-sm text-destructive">{calculationError}</p>}
    </div>
  );
}
