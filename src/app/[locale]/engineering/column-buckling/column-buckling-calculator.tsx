"use client";

import { AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import { InputField, OutputDisplay } from "@/components/converter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  type ColumnBucklingInput,
  type ColumnBucklingResult,
  calculateColumnBuckling,
  type EndCondition,
  getColumnBeamSections,
  getColumnMaterials,
} from "@/lib/converters/engineering/column-buckling";
import { createCalculatorStore } from "@/stores/calculator-store";

const useColumnBucklingStore = createCalculatorStore<ColumnBucklingInput, ColumnBucklingResult>({
  name: "column-buckling",
  initialValues: {
    materialId: "steel-a36",
    sectionId: "w12x26",
    length: 6,
    endCondition: "pinned-pinned",
    axis: "x",
    customArea: 5000,
    customMomentOfInertia: 8.5e7,
    customYoungsModulus: 200,
    customYieldStrength: 250,
  },
  calculate: (input) => calculateColumnBuckling(input),
});

export default function ColumnBucklingCalculator() {
  const t = useTranslations("calculator.engineering");
  const tSections = useTranslations("calculator.sections");

  const { values, setValue, result, calculationError } = useColumnBucklingStore();

  const materials = getColumnMaterials();
  const sections = getColumnBeamSections();

  // Group materials by category
  const groupedMaterials = materials.reduce(
    (acc, material) => {
      if (!acc[material.category]) {
        acc[material.category] = [];
      }
      acc[material.category].push(material);
      return acc;
    },
    {} as Record<string, typeof materials>
  );

  // Group sections by type
  const groupedSections = sections.reduce(
    (acc, section) => {
      if (!acc[section.type]) {
        acc[section.type] = [];
      }
      acc[section.type].push(section);
      return acc;
    },
    {} as Record<string, typeof sections>
  );

  const handleMaterialChange = (materialId: string) => {
    setValue("materialId", materialId);
    if (materialId && materialId !== "custom") {
      const material = materials.find((m) => m.id === materialId);
      if (material) {
        setValue("customYoungsModulus", material.youngsModulus);
        setValue("customYieldStrength", material.yieldStrength);
      }
    }
  };

  const handleSectionChange = (sectionId: string) => {
    setValue("sectionId", sectionId);
  };

  const isCustomMaterial = !values.materialId || values.materialId === "custom";
  const isCustomSection = !values.sectionId || values.sectionId === "custom";

  return (
    <div className="space-y-6">
      {/* Material Selection */}
      <Card>
        <CardHeader>
          <CardTitle>{t("material")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="material">{t("material")}</Label>
            <Select value={values.materialId} onValueChange={handleMaterialChange}>
              <SelectTrigger id="material">
                <SelectValue placeholder={t("customMaterial")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="custom">{t("customMaterial")}</SelectItem>
                {Object.entries(groupedMaterials).map(([category, categoryMaterials]) => (
                  <SelectGroup key={category}>
                    <SelectLabel>{t(`columnBuckling.materialCategories.${category}`)}</SelectLabel>
                    {categoryMaterials.map((material) => (
                      <SelectItem key={material.id} value={material.id}>
                        {t(`columnBuckling.materials.${material.id}`)}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isCustomMaterial && (
            <div className="grid gap-4 sm:grid-cols-2">
              <InputField
                id="customYoungsModulus"
                label={t("labels.youngsModulus")}
                value={values.customYoungsModulus.toString()}
                onChange={(v) => setValue("customYoungsModulus", parseFloat(v) || 0)}
                min={0}
                step="0.1"
                unit="GPa"
              />
              <InputField
                id="customYieldStrength"
                label={t("labels.yieldStrength")}
                value={values.customYieldStrength.toString()}
                onChange={(v) => setValue("customYieldStrength", parseFloat(v) || 0)}
                min={0}
                step="0.1"
                unit="MPa"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section Selection */}
      <Card>
        <CardHeader>
          <CardTitle>{t("columnBuckling.section")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="section">{t("columnBuckling.beamSection")}</Label>
            <Select value={values.sectionId} onValueChange={handleSectionChange}>
              <SelectTrigger id="section">
                <SelectValue placeholder={t("columnBuckling.customSection")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="custom">{t("columnBuckling.customSection")}</SelectItem>
                {Object.entries(groupedSections).map(([type, typeSections]) => (
                  <SelectGroup key={type}>
                    <SelectLabel>{type}</SelectLabel>
                    {typeSections.map((section) => (
                      <SelectItem key={section.id} value={section.id}>
                        {section.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isCustomSection && (
            <div className="grid gap-4 sm:grid-cols-2">
              <InputField
                id="customArea"
                label={t("columnBuckling.crossSectionalArea")}
                value={values.customArea.toString()}
                onChange={(v) => setValue("customArea", parseFloat(v) || 0)}
                min={0}
                step="1"
                unit="mm²"
              />
              <InputField
                id="customMomentOfInertia"
                label={t("columnBuckling.momentOfInertia")}
                value={values.customMomentOfInertia.toString()}
                onChange={(v) => setValue("customMomentOfInertia", parseFloat(v) || 0)}
                min={0}
                step="1000"
                unit="mm⁴"
              />
            </div>
          )}

          {/* Buckling axis selector */}
          {!isCustomSection && (
            <div className="space-y-2">
              <Label>{t("columnBuckling.bucklingAxis")}</Label>
              <Tabs value={values.axis} onValueChange={(v) => setValue("axis", v as "x" | "y")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="x">{t("columnBuckling.strongAxisX")}</TabsTrigger>
                  <TabsTrigger value="y">{t("columnBuckling.weakAxisY")}</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Column Parameters */}
      <Card>
        <CardHeader>
          <CardTitle>{tSections("input")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <InputField
            id="length"
            label={t("columnBuckling.columnLength")}
            value={values.length.toString()}
            onChange={(v) => setValue("length", parseFloat(v) || 0)}
            min={0}
            step="0.1"
            unit="m"
          />

          <div className="space-y-2">
            <Label>{t("columnBuckling.endCondition")}</Label>
            <Tabs
              value={values.endCondition}
              onValueChange={(v) => setValue("endCondition", v as EndCondition)}
            >
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
                <TabsTrigger value="pinned-pinned">{t("columnBuckling.pinnedPinned")}</TabsTrigger>
                <TabsTrigger value="fixed-pinned">{t("columnBuckling.fixedPinned")}</TabsTrigger>
                <TabsTrigger value="fixed-fixed">{t("columnBuckling.fixedFixed")}</TabsTrigger>
                <TabsTrigger value="fixed-free">{t("columnBuckling.fixedFree")}</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <>
          {/* Buckling mode indicator */}
          {result.bucklingMode === "elastic" && (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950 p-4">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  {t("columnBuckling.elasticBuckling")}
                </p>
              </div>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>{tSections("results")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <OutputDisplay
                  label={t("columnBuckling.eulerCriticalLoad")}
                  value={result.eulerLoad.toFixed(1)}
                  unit="kN"
                  size="lg"
                />
                <OutputDisplay
                  label={t("columnBuckling.aiscAllowableLoad")}
                  value={result.allowableLoad.toFixed(1)}
                  unit="kN"
                  size="lg"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border bg-card p-4 text-card-foreground">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {t("columnBuckling.slendernessRatio")}
                  </p>
                  <p className="text-lg font-semibold font-mono">
                    {result.slendernessRatio.toFixed(1)}
                  </p>
                </div>
                <div className="rounded-lg border bg-card p-4 text-card-foreground">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {t("columnBuckling.effectiveLength")}
                  </p>
                  <p className="text-lg font-semibold font-mono">
                    {result.effectiveLength.toFixed(2)}
                    <span className="ml-1 text-sm font-normal text-muted-foreground">m</span>
                  </p>
                </div>
                <div className="rounded-lg border bg-card p-4 text-card-foreground">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {t("columnBuckling.kFactor")}
                  </p>
                  <p className="text-lg font-semibold font-mono">{result.kFactor}</p>
                </div>
                <div className="rounded-lg border bg-card p-4 text-card-foreground">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {t("columnBuckling.bucklingMode")}
                  </p>
                  <p
                    className={`text-lg font-semibold ${
                      result.bucklingMode === "elastic"
                        ? "text-yellow-600 dark:text-yellow-400"
                        : "text-green-600 dark:text-green-400"
                    }`}
                  >
                    {result.bucklingMode === "elastic"
                      ? t("columnBuckling.elastic")
                      : t("columnBuckling.inelastic")}
                  </p>
                </div>
              </div>

              {/* Load in Multiple Units */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  {t("columnBuckling.eulerCriticalLoad")}
                </p>
                <div className="grid gap-2 sm:grid-cols-3 text-sm">
                  <div className="rounded-md border bg-muted/50 px-3 py-2">
                    <span className="font-semibold">{result.loadUnits.kN.toFixed(1)}</span>
                    <span className="text-muted-foreground ml-1">kN</span>
                  </div>
                  <div className="rounded-md border bg-muted/50 px-3 py-2">
                    <span className="font-semibold">{result.loadUnits.lbf.toFixed(0)}</span>
                    <span className="text-muted-foreground ml-1">lbf</span>
                  </div>
                  <div className="rounded-md border bg-muted/50 px-3 py-2">
                    <span className="font-semibold">{result.loadUnits.kips.toFixed(2)}</span>
                    <span className="text-muted-foreground ml-1">kips</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Calculation Steps */}
          {result.steps.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t("calculationSteps")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  {result.steps.map((step, index) => (
                    <li key={index} className="text-muted-foreground">
                      {step}
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {calculationError && <p className="mt-2 text-sm text-destructive">{calculationError}</p>}
    </div>
  );
}
