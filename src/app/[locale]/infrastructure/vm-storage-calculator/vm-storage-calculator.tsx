"use client";

import { AlertCircle, HardDrive, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import {
  CsvExportButton,
  InputField,
  OutputDisplay,
  PdfExportButton,
  ResultGrid,
} from "@/components/converter";
import { Button } from "@/components/ui/button";
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
import type { HypervisorPlatform } from "@/lib/converters/infrastructure/types";
import type { CsvRow } from "@/lib/utils/csv-export";
import type { PdfSection } from "@/lib/utils/pdf-export";
import { useVmStorageStore } from "@/stores/vm-storage-store";

export function VmStorageCalculator() {
  const t = useTranslations("calculator.vmStorage");
  const tSections = useTranslations("calculator.sections");
  const tCommon = useTranslations("common");

  const {
    platform,
    setPlatform,
    vmConfigs,
    addVmConfig,
    removeVmConfig,
    updateVmConfig,
    includeSwapFiles,
    setIncludeSwapFiles,
    configLogGbPerVm,
    setConfigLogGbPerVm,
    snapshotPercent,
    setSnapshotPercent,
    esxHosts,
    setEsxHosts,
    esxStorageGbPerHost,
    setEsxStorageGbPerHost,
    thinProvisioningPercent,
    setThinProvisioningPercent,
    growthPercent,
    setGrowthPercent,
    result,
    error,
    reset,
  } = useVmStorageStore();

  // Warning threshold for thin provisioning
  const showProvisioningWarning = thinProvisioningPercent > 50;

  // PDF export sections
  const pdfSections: PdfSection[] = useMemo(() => {
    if (!result) return [];

    const sections: PdfSection[] = [
      {
        title: t("vmProfiles"),
        items: vmConfigs.flatMap((config, index) => [
          {
            label: `${t("profile")} ${index + 1} - ${t("diskSize")}`,
            value: config.diskGb,
            unit: "GB",
          },
          {
            label: `${t("profile")} ${index + 1} - ${t("ramSize")}`,
            value: config.ramGb,
            unit: "GB",
          },
          {
            label: `${t("profile")} ${index + 1} - ${t("vmCount")}`,
            value: config.count,
            unit: "",
          },
        ]),
      },
      {
        title: t("configuration"),
        items: [
          {
            label: t("includeSwapFiles"),
            value: includeSwapFiles ? tCommon("yes") : tCommon("no"),
            unit: "",
          },
          { label: t("configLogPerVm"), value: configLogGbPerVm, unit: "GB" },
          { label: t("snapshotPercent"), value: snapshotPercent, unit: "%" },
          { label: t("esxHosts"), value: esxHosts, unit: "" },
          { label: t("esxStoragePerHost"), value: esxStorageGbPerHost, unit: "GB" },
          { label: t("thinProvisioningPercent"), value: thinProvisioningPercent, unit: "%" },
          { label: t("growthPercent"), value: growthPercent, unit: "%" },
        ],
      },
      {
        title: tSections("output"),
        items: [
          { label: t("totalRequired"), value: result.totalRequiredGb.toFixed(2), unit: "GB" },
          { label: t("totalProvisioned"), value: result.totalProvisionedGb.toFixed(2), unit: "GB" },
          { label: t("usedDisk"), value: result.usedDiskGb.toFixed(2), unit: "GB" },
          { label: t("snapshotAllocation"), value: result.snapshotGb.toFixed(2), unit: "GB" },
          { label: t("swapAllocation"), value: result.swapGb.toFixed(2), unit: "GB" },
          { label: t("configLogAllocation"), value: result.configLogGb.toFixed(2), unit: "GB" },
          { label: t("esxOverhead"), value: result.esxStorageGb.toFixed(2), unit: "GB" },
          { label: t("growthAllocation"), value: result.growthAllocationGb.toFixed(2), unit: "GB" },
        ],
      },
    ];

    return sections;
  }, [
    result,
    vmConfigs,
    includeSwapFiles,
    configLogGbPerVm,
    snapshotPercent,
    esxHosts,
    esxStorageGbPerHost,
    thinProvisioningPercent,
    growthPercent,
    t,
    tSections,
    tCommon,
  ]);

  // CSV export data
  const csvData: CsvRow[] = useMemo(() => {
    if (!result) return [];

    const rows: CsvRow[] = [];

    // VM Profiles
    vmConfigs.forEach((config, index) => {
      rows.push(
        {
          Field: `${t("profile")} ${index + 1} - ${t("diskSize")}`,
          Value: config.diskGb,
          Unit: "GB",
        },
        {
          Field: `${t("profile")} ${index + 1} - ${t("ramSize")}`,
          Value: config.ramGb,
          Unit: "GB",
        },
        { Field: `${t("profile")} ${index + 1} - ${t("vmCount")}`, Value: config.count, Unit: "" }
      );
    });

    // Configuration
    rows.push(
      {
        Field: t("includeSwapFiles"),
        Value: includeSwapFiles ? tCommon("yes") : tCommon("no"),
        Unit: "",
      },
      { Field: t("configLogPerVm"), Value: configLogGbPerVm, Unit: "GB" },
      { Field: t("snapshotPercent"), Value: snapshotPercent, Unit: "%" },
      { Field: t("esxHosts"), Value: esxHosts, Unit: "" },
      { Field: t("esxStoragePerHost"), Value: esxStorageGbPerHost, Unit: "GB" },
      { Field: t("thinProvisioningPercent"), Value: thinProvisioningPercent, Unit: "%" },
      { Field: t("growthPercent"), Value: growthPercent, Unit: "%" }
    );

    // Results
    rows.push(
      { Field: t("totalRequired"), Value: result.totalRequiredGb.toFixed(2), Unit: "GB" },
      { Field: t("totalProvisioned"), Value: result.totalProvisionedGb.toFixed(2), Unit: "GB" },
      { Field: t("usedDisk"), Value: result.usedDiskGb.toFixed(2), Unit: "GB" },
      { Field: t("snapshotAllocation"), Value: result.snapshotGb.toFixed(2), Unit: "GB" },
      { Field: t("swapAllocation"), Value: result.swapGb.toFixed(2), Unit: "GB" },
      { Field: t("configLogAllocation"), Value: result.configLogGb.toFixed(2), Unit: "GB" },
      { Field: t("esxOverhead"), Value: result.esxStorageGb.toFixed(2), Unit: "GB" },
      { Field: t("growthAllocation"), Value: result.growthAllocationGb.toFixed(2), Unit: "GB" }
    );

    return rows;
  }, [
    result,
    vmConfigs,
    includeSwapFiles,
    configLogGbPerVm,
    snapshotPercent,
    esxHosts,
    esxStorageGbPerHost,
    thinProvisioningPercent,
    growthPercent,
    t,
    tCommon,
  ]);

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            {tSections("input")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* VM Profiles */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">{t("vmProfiles")}</Label>
              <Button onClick={addVmConfig} variant="outline" size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                {t("addProfile")}
              </Button>
            </div>

            {vmConfigs.map((config, index) => (
              <Card
                key={`vm-config-${index}-${config.diskGb}-${config.count}`}
                className="border-muted"
              >
                <CardContent className="pt-6">
                  <div className="grid gap-4 md:grid-cols-4">
                    <InputField
                      id={`diskSize-${index}`}
                      label={t("diskSize")}
                      type="number"
                      value={config.diskGb}
                      onChange={(value) => updateVmConfig(index, "diskGb", Number(value))}
                      placeholder="100"
                      min={0}
                      step={10}
                    />
                    <InputField
                      id={`ramSize-${index}`}
                      label={t("ramSize")}
                      type="number"
                      value={config.ramGb}
                      onChange={(value) => updateVmConfig(index, "ramGb", Number(value))}
                      placeholder="8"
                      min={0}
                      step={1}
                    />
                    <InputField
                      id={`vmCount-${index}`}
                      label={t("vmCount")}
                      type="number"
                      value={config.count}
                      onChange={(value) => updateVmConfig(index, "count", Number(value))}
                      placeholder="10"
                      min={1}
                      step={1}
                    />
                    <div className="flex items-end">
                      <Button
                        onClick={() => removeVmConfig(index)}
                        variant="destructive"
                        size="sm"
                        className="w-full gap-2"
                        disabled={vmConfigs.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                        {t("removeProfile")}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Platform Selection */}
          <div className="space-y-2">
            <Label htmlFor="platform">{t("platform")}</Label>
            <Select
              value={platform}
              onValueChange={(value) => setPlatform(value as HypervisorPlatform)}
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

          {/* Configuration Options */}
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeSwapFiles"
                  checked={includeSwapFiles}
                  onCheckedChange={(checked) => setIncludeSwapFiles(checked === true)}
                />
                <div className="space-y-1">
                  <Label htmlFor="includeSwapFiles" className="cursor-pointer">
                    {t("includeSwapFiles")}
                  </Label>
                  <p className="text-sm text-muted-foreground">{t("swapHelp")}</p>
                </div>
              </div>

              <InputField
                id="configLogPerVm"
                label={t("configLogPerVm")}
                type="number"
                value={configLogGbPerVm}
                onChange={(value) => setConfigLogGbPerVm(Number(value))}
                min={0}
                step={0.1}
              />
            </div>

            <div className="space-y-2">
              <InputField
                id="snapshotPercent"
                label={t("snapshotPercent")}
                type="number"
                value={snapshotPercent}
                onChange={(value) => setSnapshotPercent(Number(value))}
                min={0}
                max={100}
                step={5}
              />
              <p className="text-sm text-muted-foreground">{t("snapshotHelp")}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <InputField
                id="esxHosts"
                label={t("esxHosts")}
                type="number"
                value={esxHosts}
                onChange={(value) => setEsxHosts(Number(value))}
                min={1}
                step={1}
              />
              <InputField
                id="esxStoragePerHost"
                label={t("esxStoragePerHost")}
                type="number"
                value={esxStorageGbPerHost}
                onChange={(value) => setEsxStorageGbPerHost(Number(value))}
                min={0}
                step={1}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <InputField
                id="thinProvisioningPercent"
                label={t("thinProvisioningPercent")}
                type="number"
                value={thinProvisioningPercent}
                onChange={(value) => setThinProvisioningPercent(Number(value))}
                min={0}
                max={100}
                step={5}
              />
              <InputField
                id="growthPercent"
                label={t("growthPercent")}
                type="number"
                value={growthPercent}
                onChange={(value) => setGrowthPercent(Number(value))}
                min={0}
                max={100}
                step={5}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={reset} variant="outline" className="w-full">
              {tCommon("reset")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Warning for high thin provisioning */}
      {showProvisioningWarning && (
        <Card className="border-amber-500/50 bg-amber-500/10">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <p className="text-sm text-amber-900 dark:text-amber-100">
                {t("provisioningWarning")}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Section */}
      {result && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              {tSections("output")}
            </CardTitle>
            <div className="flex gap-2">
              <PdfExportButton sections={pdfSections} options={{ title: t("title") }} />
              <CsvExportButton data={csvData} filename="vm-storage-calculator" />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Primary Metric */}
            <div className="space-y-2">
              <OutputDisplay
                label={t("totalRequired")}
                value={`${result.totalRequiredGb.toFixed(2)} GB`}
                size="lg"
              />
              <OutputDisplay
                label={t("totalProvisioned")}
                value={`${result.totalProvisionedGb.toFixed(2)} GB`}
              />
            </div>

            {/* Breakdown Grid */}
            <div>
              <h3 className="text-lg font-semibold mb-4">{t("breakdown")}</h3>
              <ResultGrid
                results={[
                  {
                    label: t("usedDisk"),
                    value: `${result.usedDiskGb.toFixed(2)} GB (${result.percentages.usedDisk.toFixed(1)}%)`,
                  },
                  {
                    label: t("overSubscribed"),
                    value: `${result.overSubscribedGb.toFixed(2)} GB (${result.percentages.overSubscribed.toFixed(1)}%)`,
                  },
                  {
                    label: t("snapshotAllocation"),
                    value: `${result.snapshotGb.toFixed(2)} GB (${result.percentages.snapshot.toFixed(1)}%)`,
                  },
                  {
                    label: t("swapAllocation"),
                    value: `${result.swapGb.toFixed(2)} GB (${result.percentages.swap.toFixed(1)}%)`,
                  },
                  {
                    label: t("configLogAllocation"),
                    value: `${result.configLogGb.toFixed(2)} GB (${result.percentages.configLog.toFixed(1)}%)`,
                  },
                  {
                    label: t("totalVmStorage"),
                    value: `${result.totalVmStorageGb.toFixed(2)} GB`,
                  },
                  {
                    label: t("esxOverhead"),
                    value: `${result.esxStorageGb.toFixed(2)} GB (${result.percentages.esxOverhead.toFixed(1)}%)`,
                  },
                  {
                    label: t("growthAllocation"),
                    value: `${result.growthAllocationGb.toFixed(2)} GB (${result.percentages.growth.toFixed(1)}%)`,
                  },
                ]}
              />
            </div>

            {/* Calculation Steps */}
            {result.steps && result.steps.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">{tCommon("calculationSteps")}</h3>
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
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
