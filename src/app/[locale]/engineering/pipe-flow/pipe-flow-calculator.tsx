"use client";

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
import {
  calculatePipeFlow,
  getFluids,
  getPipeMaterials,
  type PipeFlowInput,
  type PipeFlowResult,
} from "@/lib/converters/engineering/pipe-flow";
import { createCalculatorStore } from "@/stores/calculator-store";

const usePipeFlowStore = createCalculatorStore<PipeFlowInput, PipeFlowResult>({
  name: "pipe-flow",
  initialValues: {
    diameter: 100,
    length: 50,
    velocity: 2,
    pipeMaterialId: "commercial-steel",
    fluidId: "water-20c",
    customRoughness: 0.045,
    customDensity: 998.2,
    customViscosity: 0.001002,
  },
  calculate: (input) => calculatePipeFlow(input),
});

export default function PipeFlowCalculator() {
  const t = useTranslations("calculator.engineering");
  const tSections = useTranslations("calculator.sections");

  const { values, setValue, result, calculationError } = usePipeFlowStore();

  const pipeMaterials = getPipeMaterials();
  const fluids = getFluids();

  // Group pipe materials by category
  const groupedPipes = pipeMaterials.reduce(
    (acc, mat) => {
      if (!acc[mat.category]) {
        acc[mat.category] = [];
      }
      acc[mat.category].push(mat);
      return acc;
    },
    {} as Record<string, typeof pipeMaterials>
  );

  // Group fluids by category
  const groupedFluids = fluids.reduce(
    (acc, fluid) => {
      if (!acc[fluid.category]) {
        acc[fluid.category] = [];
      }
      acc[fluid.category].push(fluid);
      return acc;
    },
    {} as Record<string, typeof fluids>
  );

  const handlePipeMaterialChange = (id: string) => {
    setValue("pipeMaterialId", id);
    if (id && id !== "custom") {
      const mat = pipeMaterials.find((m) => m.id === id);
      if (mat) {
        setValue("customRoughness", mat.roughness);
      }
    }
  };

  const handleFluidChange = (id: string) => {
    setValue("fluidId", id);
    if (id && id !== "custom") {
      const fluid = fluids.find((f) => f.id === id);
      if (fluid) {
        setValue("customDensity", fluid.density);
        setValue("customViscosity", fluid.dynamicViscosity);
      }
    }
  };

  const isCustomPipe = !values.pipeMaterialId || values.pipeMaterialId === "custom";
  const isCustomFluid = !values.fluidId || values.fluidId === "custom";

  return (
    <div className="space-y-6">
      {/* Pipe Material */}
      <Card>
        <CardHeader>
          <CardTitle>{t("pipeFlow.pipeMaterial")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pipeMaterial">{t("pipeFlow.pipeMaterial")}</Label>
            <Select value={values.pipeMaterialId} onValueChange={handlePipeMaterialChange}>
              <SelectTrigger id="pipeMaterial">
                <SelectValue placeholder={t("pipeFlow.customPipe")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="custom">{t("pipeFlow.customPipe")}</SelectItem>
                {Object.entries(groupedPipes).map(([category, mats]) => (
                  <SelectGroup key={category}>
                    <SelectLabel>{t(`pipeFlow.materialCategories.${category}`)}</SelectLabel>
                    {mats.map((mat) => (
                      <SelectItem key={mat.id} value={mat.id}>
                        {t(`pipeFlow.materials.${mat.id}`)}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isCustomPipe && (
            <InputField
              id="customRoughness"
              label={t("pipeFlow.roughness")}
              value={values.customRoughness.toString()}
              onChange={(v) => setValue("customRoughness", parseFloat(v) || 0)}
              min={0}
              step="0.001"
              unit="mm"
            />
          )}
        </CardContent>
      </Card>

      {/* Fluid Selection */}
      <Card>
        <CardHeader>
          <CardTitle>{t("pipeFlow.fluid")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fluid">{t("pipeFlow.fluid")}</Label>
            <Select value={values.fluidId} onValueChange={handleFluidChange}>
              <SelectTrigger id="fluid">
                <SelectValue placeholder={t("pipeFlow.customFluid")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="custom">{t("pipeFlow.customFluid")}</SelectItem>
                {Object.entries(groupedFluids).map(([category, categoryFluids]) => (
                  <SelectGroup key={category}>
                    <SelectLabel>{t(`pipeFlow.fluidCategories.${category}`)}</SelectLabel>
                    {categoryFluids.map((fluid) => (
                      <SelectItem key={fluid.id} value={fluid.id}>
                        {t(`pipeFlow.fluids.${fluid.id}`)}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isCustomFluid && (
            <div className="grid gap-4 sm:grid-cols-2">
              <InputField
                id="customDensity"
                label={t("pipeFlow.density")}
                value={values.customDensity.toString()}
                onChange={(v) => setValue("customDensity", parseFloat(v) || 0)}
                min={0}
                step="0.1"
                unit="kg/m³"
              />
              <InputField
                id="customViscosity"
                label={t("pipeFlow.viscosity")}
                value={values.customViscosity.toString()}
                onChange={(v) => setValue("customViscosity", parseFloat(v) || 0)}
                min={0}
                step="0.0001"
                unit="Pa·s"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Flow Parameters */}
      <Card>
        <CardHeader>
          <CardTitle>{tSections("input")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <InputField
              id="diameter"
              label={t("pipeFlow.innerDiameter")}
              value={values.diameter.toString()}
              onChange={(v) => setValue("diameter", parseFloat(v) || 0)}
              min={0}
              step="1"
              unit="mm"
            />
            <InputField
              id="length"
              label={t("pipeFlow.pipeLength")}
              value={values.length.toString()}
              onChange={(v) => setValue("length", parseFloat(v) || 0)}
              min={0}
              step="1"
              unit="m"
            />
            <InputField
              id="velocity"
              label={t("pipeFlow.flowVelocity")}
              value={values.velocity.toString()}
              onChange={(v) => setValue("velocity", parseFloat(v) || 0)}
              min={0}
              step="0.1"
              unit="m/s"
            />
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>{tSections("results")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <OutputDisplay
                  label={t("pipeFlow.pressureDrop")}
                  value={
                    result.pressureDropBar >= 0.01
                      ? result.pressureDropBar.toFixed(4)
                      : result.pressureDrop.toFixed(1)
                  }
                  unit={result.pressureDropBar >= 0.01 ? "bar" : "Pa"}
                  size="lg"
                />
                <OutputDisplay
                  label={t("pipeFlow.headLoss")}
                  value={result.headLoss.toFixed(3)}
                  unit="m"
                  size="lg"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border bg-card p-4 text-card-foreground">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {t("pipeFlow.reynoldsNumber")}
                  </p>
                  <p className="text-lg font-semibold font-mono">
                    {result.reynoldsNumber.toFixed(0)}
                  </p>
                </div>
                <div className="rounded-lg border bg-card p-4 text-card-foreground">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {t("pipeFlow.flowRegime")}
                  </p>
                  <p
                    className={`text-lg font-semibold ${
                      result.flowRegime === "laminar"
                        ? "text-green-600 dark:text-green-400"
                        : result.flowRegime === "transitional"
                          ? "text-yellow-600 dark:text-yellow-400"
                          : "text-blue-600 dark:text-blue-400"
                    }`}
                  >
                    {t(`pipeFlow.${result.flowRegime}`)}
                  </p>
                </div>
                <div className="rounded-lg border bg-card p-4 text-card-foreground">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {t("pipeFlow.frictionFactor")}
                  </p>
                  <p className="text-lg font-semibold font-mono">
                    {result.frictionFactor.toFixed(6)}
                  </p>
                </div>
                <div className="rounded-lg border bg-card p-4 text-card-foreground">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {t("pipeFlow.flowRate")}
                  </p>
                  <p className="text-lg font-semibold font-mono">
                    {result.flowRateLpm.toFixed(1)}
                    <span className="ml-1 text-sm font-normal text-muted-foreground">L/min</span>
                  </p>
                </div>
              </div>

              {/* Pressure in Multiple Units */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  {t("pipeFlow.pressureDrop")}
                </p>
                <div className="grid gap-2 sm:grid-cols-5 text-sm">
                  <div className="rounded-md border bg-muted/50 px-3 py-2">
                    <span className="font-semibold">{result.pressureUnits.pa.toFixed(1)}</span>
                    <span className="text-muted-foreground ml-1">Pa</span>
                  </div>
                  <div className="rounded-md border bg-muted/50 px-3 py-2">
                    <span className="font-semibold">{result.pressureUnits.kpa.toFixed(3)}</span>
                    <span className="text-muted-foreground ml-1">kPa</span>
                  </div>
                  <div className="rounded-md border bg-muted/50 px-3 py-2">
                    <span className="font-semibold">{result.pressureUnits.bar.toFixed(4)}</span>
                    <span className="text-muted-foreground ml-1">bar</span>
                  </div>
                  <div className="rounded-md border bg-muted/50 px-3 py-2">
                    <span className="font-semibold">{result.pressureUnits.psi.toFixed(3)}</span>
                    <span className="text-muted-foreground ml-1">psi</span>
                  </div>
                  <div className="rounded-md border bg-muted/50 px-3 py-2">
                    <span className="font-semibold">{result.pressureUnits.mH2O.toFixed(3)}</span>
                    <span className="text-muted-foreground ml-1">mH₂O</span>
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
