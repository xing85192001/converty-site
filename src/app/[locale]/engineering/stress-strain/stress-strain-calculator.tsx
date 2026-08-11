"use client";

import { AlertCircle } from "lucide-react";
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
  calculateStressStrain,
  getMaterials,
  type StressStrainInput,
  type StressStrainResult,
} from "@/lib/converters/engineering/stress-strain";
import { createCalculatorStore } from "@/stores/calculator-store";

const useStressStrainStore = createCalculatorStore<StressStrainInput, StressStrainResult>({
  name: "stress-strain",
  initialValues: {
    mode: "stress",
    force: 100,
    area: 500,
    originalLength: 1000,
    changeInLength: 0.5,
    materialId: "",
    customYoungsModulus: 200,
    customYieldStrength: 250,
  },
  calculate: (input) => calculateStressStrain(input),
});

export default function StressStrainCalculator() {
  const t = useTranslations("calculator.engineering");
  const tSections = useTranslations("calculator.sections");
  const tModes = useTranslations("calculator.engineering.modes");

  const { values, setValue, result, calculationError } = useStressStrainStore();

  const materials = getMaterials();

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

  const showForceArea = values.mode === "stress" || values.mode === "youngs-modulus";
  const showLengthChange = values.mode === "strain" || values.mode === "youngs-modulus";

  return (
    <div className="space-y-6">
      {/* Calculation Mode */}
      <Card>
        <CardHeader>
          <CardTitle>{t("mode")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            value={values.mode}
            onValueChange={(v) => setValue("mode", v as StressStrainInput["mode"])}
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="stress">{tModes("stress")}</TabsTrigger>
              <TabsTrigger value="strain">{tModes("strain")}</TabsTrigger>
              <TabsTrigger value="youngs-modulus">{tModes("youngsModulus")}</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

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
                    <SelectLabel>{category}</SelectLabel>
                    {categoryMaterials.map((material) => (
                      <SelectItem key={material.id} value={material.id}>
                        {material.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>

          {values.materialId && values.materialId !== "custom" && (
            <div className="grid gap-4 sm:grid-cols-2 rounded-md border bg-muted/50 p-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("labels.youngsModulus")}
                </p>
                <p className="text-lg font-semibold">{values.customYoungsModulus} GPa</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("labels.yieldStrength")}
                </p>
                <p className="text-lg font-semibold">{values.customYieldStrength} MPa</p>
              </div>
            </div>
          )}

          {(!values.materialId || values.materialId === "custom") && (
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

      {/* Inputs */}
      <Card>
        <CardHeader>
          <CardTitle>{tSections("input")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {showForceArea && (
              <>
                <InputField
                  id="force"
                  label={t("labels.force")}
                  value={values.force.toString()}
                  onChange={(v) => setValue("force", parseFloat(v) || 0)}
                  min={0}
                  step="0.1"
                  unit="kN"
                />
                <InputField
                  id="area"
                  label={t("labels.area")}
                  value={values.area.toString()}
                  onChange={(v) => setValue("area", parseFloat(v) || 0)}
                  min={0}
                  step="1"
                  unit="mm²"
                />
              </>
            )}

            {showLengthChange && (
              <>
                <InputField
                  id="originalLength"
                  label={t("labels.originalLength")}
                  value={values.originalLength.toString()}
                  onChange={(v) => setValue("originalLength", parseFloat(v) || 0)}
                  min={0}
                  step="1"
                  unit="mm"
                />
                <InputField
                  id="changeInLength"
                  label={t("labels.changeInLength")}
                  value={values.changeInLength.toString()}
                  onChange={(v) => setValue("changeInLength", parseFloat(v) || 0)}
                  step="0.01"
                  unit="mm"
                />
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <>
          {result.exceedsYield && (
            <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950 p-4">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  {t("exceedsYield")}
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
                  label={t("labels.stress")}
                  value={result.stress.toFixed(2)}
                  unit="MPa"
                  size="lg"
                />
                <OutputDisplay
                  label={t("labels.strain")}
                  value={result.strain.toExponential(4)}
                  size="lg"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border bg-card p-4 text-card-foreground">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {t("labels.youngsModulus")}
                  </p>
                  <p className="text-lg font-semibold font-mono">
                    {result.youngsModulus.toFixed(2)}
                    <span className="ml-1 text-sm font-normal text-muted-foreground">GPa</span>
                  </p>
                </div>

                {result.safetyFactor !== null && (
                  <div className="rounded-lg border bg-card p-4 text-card-foreground">
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      {t("safetyFactor")}
                    </p>
                    <p
                      className={`text-lg font-semibold font-mono ${
                        result.safetyFactor >= 2
                          ? "text-green-600 dark:text-green-400"
                          : result.safetyFactor >= 1
                            ? "text-yellow-600 dark:text-yellow-400"
                            : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {result.safetyFactor.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>

              {/* Stress in Multiple Units */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">{t("labels.stress")}</p>
                <div className="grid gap-2 sm:grid-cols-4 text-sm">
                  <div className="rounded-md border bg-muted/50 px-3 py-2">
                    <span className="font-semibold">{result.stressUnits.mpa.toFixed(2)}</span>
                    <span className="text-muted-foreground ml-1">MPa</span>
                  </div>
                  <div className="rounded-md border bg-muted/50 px-3 py-2">
                    <span className="font-semibold">{result.stressUnits.gpa.toFixed(4)}</span>
                    <span className="text-muted-foreground ml-1">GPa</span>
                  </div>
                  <div className="rounded-md border bg-muted/50 px-3 py-2">
                    <span className="font-semibold">{result.stressUnits.psi.toFixed(0)}</span>
                    <span className="text-muted-foreground ml-1">psi</span>
                  </div>
                  <div className="rounded-md border bg-muted/50 px-3 py-2">
                    <span className="font-semibold">{result.stressUnits.ksi.toFixed(2)}</span>
                    <span className="text-muted-foreground ml-1">ksi</span>
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
