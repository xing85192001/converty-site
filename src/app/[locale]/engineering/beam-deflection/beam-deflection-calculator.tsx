"use client";

import { Check, X } from "lucide-react";
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
  type BeamDeflectionInput,
  type BeamDeflectionResult,
  calculateBeamDeflection,
} from "@/lib/converters/engineering/beam-deflection";
import { getBeamSections } from "@/lib/converters/engineering/moment-of-inertia";
import { getMaterials } from "@/lib/converters/engineering/stress-strain";
import { createCalculatorStore } from "@/stores/calculator-store";
import { BeamDiagramSvg } from "./BeamDiagramSvg";

const useBeamDeflectionStore = createCalculatorStore<BeamDeflectionInput, BeamDeflectionResult>({
  name: "beam-deflection",
  initialValues: {
    beamType: "simply-supported",
    loadType: "point-load",
    length: 10,
    momentOfInertia: 200e6, // mm⁴ (W12×26 example)
    youngsModulus: 200, // GPa (steel)
    pointLoad: 50, // kN
    distributedLoad: 10, // kN/m
    materialId: "custom",
    beamSectionId: "custom",
  },
  calculate: (input) => calculateBeamDeflection(input),
});

export default function BeamDeflectionCalculator() {
  const t = useTranslations("calculator.engineering");
  const tSections = useTranslations("calculator.sections");

  const { values, setValue, result, calculationError } = useBeamDeflectionStore();

  const materials = getMaterials();
  const beamSections = getBeamSections();

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

  // Group beam sections by type
  const groupedBeamSections = beamSections.reduce(
    (acc, section) => {
      if (!acc[section.type]) {
        acc[section.type] = [];
      }
      acc[section.type].push(section);
      return acc;
    },
    {} as Record<string, typeof beamSections>
  );

  const handleMaterialChange = (materialId: string) => {
    setValue("materialId", materialId);
    if (materialId && materialId !== "custom") {
      const material = materials.find((m) => m.id === materialId);
      if (material) {
        setValue("youngsModulus", material.youngsModulus);
      }
    }
  };

  const handleBeamSectionChange = (beamSectionId: string) => {
    setValue("beamSectionId", beamSectionId);
    if (beamSectionId && beamSectionId !== "custom") {
      const section = beamSections.find((s) => s.id === beamSectionId);
      if (section) {
        // Convert in⁴ to mm⁴ (multiply by 416231.4)
        setValue("momentOfInertia", section.momentOfInertiaX * 416231.4);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Beam Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>{t("beamConfiguration")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="beamType">{t("beamType")}</Label>
            <Select
              value={values.beamType}
              onValueChange={(v) => setValue("beamType", v as BeamDeflectionInput["beamType"])}
            >
              <SelectTrigger id="beamType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="simply-supported">{t("beamTypes.simplySupported")}</SelectItem>
                <SelectItem value="cantilever">{t("beamTypes.cantilever")}</SelectItem>
                <SelectItem value="fixed-fixed">{t("beamTypes.fixedFixed")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="loadType">{t("loadType")}</Label>
            <Select
              value={values.loadType}
              onValueChange={(v) => setValue("loadType", v as BeamDeflectionInput["loadType"])}
            >
              <SelectTrigger id="loadType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="point-load">{t("loadTypes.pointLoad")}</SelectItem>
                <SelectItem value="distributed-load">{t("loadTypes.distributedLoad")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
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

          {(!values.materialId || values.materialId === "custom") && (
            <InputField
              id="youngsModulus"
              label={t("labels.youngsModulus")}
              value={values.youngsModulus.toString()}
              onChange={(v) => setValue("youngsModulus", parseFloat(v) || 0)}
              min={0}
              step="0.1"
              unit="GPa"
            />
          )}

          {values.materialId && values.materialId !== "custom" && (
            <div className="rounded-md border bg-muted/50 p-4">
              <p className="text-sm font-medium text-muted-foreground">
                {t("labels.youngsModulus")}
              </p>
              <p className="text-lg font-semibold">{values.youngsModulus} GPa</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cross-Section */}
      <Card>
        <CardHeader>
          <CardTitle>{t("crossSection")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="beamSection">{t("beamSection")}</Label>
            <Select value={values.beamSectionId} onValueChange={handleBeamSectionChange}>
              <SelectTrigger id="beamSection">
                <SelectValue placeholder={t("selectBeamSection")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="custom">{t("customSection")}</SelectItem>
                {Object.entries(groupedBeamSections).map(([type, typeSections]) => (
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

          {(!values.beamSectionId || values.beamSectionId === "custom") && (
            <InputField
              id="momentOfInertia"
              label={t("labels.momentOfInertiaX")}
              value={values.momentOfInertia.toString()}
              onChange={(v) => setValue("momentOfInertia", parseFloat(v) || 0)}
              min={0}
              step="1000"
              unit="mm⁴"
            />
          )}

          {values.beamSectionId && values.beamSectionId !== "custom" && (
            <div className="rounded-md border bg-muted/50 p-4">
              <p className="text-sm font-medium text-muted-foreground">
                {t("labels.momentOfInertiaX")}
              </p>
              <p className="text-lg font-semibold">{values.momentOfInertia.toExponential(2)} mm⁴</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Geometry & Loading */}
      <Card>
        <CardHeader>
          <CardTitle>{tSections("input")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <InputField
              id="length"
              label={t("labels.beamLength")}
              value={values.length.toString()}
              onChange={(v) => setValue("length", parseFloat(v) || 0)}
              min={0}
              step="0.1"
              unit="m"
            />

            {values.loadType === "point-load" ? (
              <InputField
                id="pointLoad"
                label={t("labels.pointLoad")}
                value={values.pointLoad?.toString() || "0"}
                onChange={(v) => setValue("pointLoad", parseFloat(v) || 0)}
                min={0}
                step="1"
                unit="kN"
              />
            ) : (
              <InputField
                id="distributedLoad"
                label={t("labels.distributedLoad")}
                value={values.distributedLoad?.toString() || "0"}
                onChange={(v) => setValue("distributedLoad", parseFloat(v) || 0)}
                min={0}
                step="0.1"
                unit="kN/m"
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Beam Diagram */}
      {result && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>{t("beamDiagram")}</CardTitle>
            </CardHeader>
            <CardContent>
              <BeamDiagramSvg
                beamType={values.beamType}
                loadType={values.loadType}
                length={values.length}
                shearDiagram={result.shearDiagram}
                momentDiagram={result.momentDiagram}
                deflectionCurve={result.deflectionCurve}
                showDimensions={true}
                loadMagnitude={
                  values.loadType === "point-load" ? values.pointLoad : values.distributedLoad
                }
              />
            </CardContent>
          </Card>

          {/* Results */}
          <Card>
            <CardHeader>
              <CardTitle>{tSections("results")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <OutputDisplay
                  label={t("labels.maxDeflection")}
                  value={result.maxDeflection.toFixed(3)}
                  unit="mm"
                  size="lg"
                />
                <OutputDisplay
                  label={t("labels.deflectionLocation")}
                  value={result.maxDeflectionLocation.toFixed(2)}
                  unit="m"
                  size="lg"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <OutputDisplay
                  label={t("labels.maxShear")}
                  value={result.maxShear.toFixed(2)}
                  unit="kN"
                />
                <OutputDisplay
                  label={t("labels.maxMoment")}
                  value={result.maxMoment.toFixed(2)}
                  unit="kN·m"
                />
              </div>

              {/* Deflection in Multiple Units */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  {t("labels.maxDeflection")}
                </p>
                <div className="grid gap-2 sm:grid-cols-3 text-sm">
                  <div className="rounded-md border bg-muted/50 px-3 py-2">
                    <span className="font-semibold">{result.units.deflection.mm.toFixed(3)}</span>
                    <span className="text-muted-foreground ml-1">mm</span>
                  </div>
                  <div className="rounded-md border bg-muted/50 px-3 py-2">
                    <span className="font-semibold">{result.units.deflection.in.toFixed(4)}</span>
                    <span className="text-muted-foreground ml-1">in</span>
                  </div>
                  <div className="rounded-md border bg-muted/50 px-3 py-2">
                    <span className="font-semibold">{result.units.deflection.cm.toFixed(3)}</span>
                    <span className="text-muted-foreground ml-1">cm</span>
                  </div>
                </div>
              </div>

              {/* Slopes at Ends */}
              {(result.slopeAtEnds.left !== 0 || result.slopeAtEnds.right !== 0) && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border bg-card p-4 text-card-foreground">
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      {t("labels.slopeLeft")}
                    </p>
                    <p className="text-lg font-semibold font-mono">
                      {(result.slopeAtEnds.left * (180 / Math.PI)).toFixed(4)}°
                    </p>
                  </div>
                  <div className="rounded-lg border bg-card p-4 text-card-foreground">
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      {t("labels.slopeRight")}
                    </p>
                    <p className="text-lg font-semibold font-mono">
                      {(result.slopeAtEnds.right * (180 / Math.PI)).toFixed(4)}°
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Deflection Criteria */}
          <Card>
            <CardHeader>
              <CardTitle>{t("deflectionCriteria")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <p className="font-medium">L/180</p>
                    <p className="text-sm text-muted-foreground">
                      {t("criteriaDescriptions.l180")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono">
                      {result.deflectionRatios.l180.toFixed(2)} mm
                    </span>
                    {result.maxDeflection <= result.deflectionRatios.l180 ? (
                      <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <X className="h-5 w-5 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <p className="font-medium">L/240</p>
                    <p className="text-sm text-muted-foreground">
                      {t("criteriaDescriptions.l240")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono">
                      {result.deflectionRatios.l240.toFixed(2)} mm
                    </span>
                    {result.maxDeflection <= result.deflectionRatios.l240 ? (
                      <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <X className="h-5 w-5 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <p className="font-medium">L/360</p>
                    <p className="text-sm text-muted-foreground">
                      {t("criteriaDescriptions.l360")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono">
                      {result.deflectionRatios.l360.toFixed(2)} mm
                    </span>
                    {result.maxDeflection <= result.deflectionRatios.l360 ? (
                      <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <X className="h-5 w-5 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <p className="font-medium">L/600</p>
                    <p className="text-sm text-muted-foreground">
                      {t("criteriaDescriptions.l600")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono">
                      {result.deflectionRatios.l600.toFixed(2)} mm
                    </span>
                    {result.maxDeflection <= result.deflectionRatios.l600 ? (
                      <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <X className="h-5 w-5 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                </div>

                <div className="mt-4 rounded-md border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950 p-3">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    {t("actualRatio")}: L/{result.deflectionRatios.actual.toFixed(0)} ={" "}
                    {result.maxDeflection.toFixed(2)} mm
                  </p>
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
                <div className="space-y-1 text-sm font-mono whitespace-pre-wrap">
                  {result.steps.map((step, index) => (
                    <div key={index} className="text-muted-foreground">
                      {step}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {calculationError && <p className="mt-2 text-sm text-destructive">{calculationError}</p>}
    </div>
  );
}
