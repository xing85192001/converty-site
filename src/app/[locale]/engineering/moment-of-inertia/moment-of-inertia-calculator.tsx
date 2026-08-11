"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { InputField, OutputDisplay, ResultGrid } from "@/components/converter";
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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  calculateMomentOfInertia,
  getBeamSections,
  type MomentOfInertiaInput,
  type MomentOfInertiaResult,
} from "@/lib/converters/engineering/moment-of-inertia";
import { createCalculatorStore } from "@/stores/calculator-store";
import { CrossSectionSvg } from "./CrossSectionSvg";

const useStore = createCalculatorStore<MomentOfInertiaInput, MomentOfInertiaResult>({
  name: "moment-of-inertia",
  initialValues: {
    shape: "rectangle",
    width: 100,
    height: 200,
    diameter: 100,
    innerWidth: 60,
    innerHeight: 140,
    innerDiameter: 60,
    flangeWidth: 120,
    flangeThickness: 20,
    webThickness: 10,
    depth: 200,
    channelDepth: 200,
    channelWidth: 120,
    channelWebThickness: 10,
    channelFlangeThickness: 15,
    legWidth1: 100,
    legWidth2: 100,
    thickness: 15,
    offsetX: 0,
    offsetY: 0,
    beamSectionId: "custom",
  },
  calculate: (input) => calculateMomentOfInertia(input),
});

export default function MomentOfInertiaCalculator() {
  const t = useTranslations("calculator.engineering");
  const tLabels = useTranslations("calculator.labels");
  const tSections = useTranslations("calculator.sections");
  const tShapes = useTranslations("calculator.engineering.shapes");

  const { values, setValue, result, calculationError } = useStore();
  const [inputMode, setInputMode] = useState<"custom" | "standard">("custom");
  const [showParallelAxis, setShowParallelAxis] = useState(false);
  const [showCentroid, setShowCentroid] = useState(true);
  const [showAxes, setShowAxes] = useState(true);

  const beamSections = getBeamSections();

  // Group beam sections by type
  const groupedSections = beamSections.reduce(
    (acc, section) => {
      if (!acc[section.type]) {
        acc[section.type] = [];
      }
      acc[section.type].push(section);
      return acc;
    },
    {} as Record<string, typeof beamSections>
  );

  const handleShapeChange = (shape: MomentOfInertiaInput["shape"]) => {
    setValue("shape", shape);
    setValue("beamSectionId", "custom");
    setInputMode("custom");
  };

  const handleBeamSectionChange = (sectionId: string) => {
    setValue("beamSectionId", sectionId);
  };

  const shapeOptions: Array<{ value: MomentOfInertiaInput["shape"]; label: string }> = [
    { value: "rectangle", label: tShapes("rectangle") },
    { value: "circle", label: tShapes("circle") },
    { value: "hollow-rectangle", label: tShapes("hollowRectangle") },
    { value: "hollow-circle", label: tShapes("hollowCircle") },
    { value: "triangle", label: tShapes("triangle") },
    { value: "i-beam", label: tShapes("iBeam") },
    { value: "channel", label: tShapes("channel") },
    { value: "angle", label: tShapes("angle") },
  ];

  const renderDimensionInputs = () => {
    if (inputMode === "standard") {
      return (
        <div className="space-y-2">
          <Label htmlFor="beamSection">{t("beamSection")}</Label>
          <Select value={values.beamSectionId} onValueChange={handleBeamSectionChange}>
            <SelectTrigger id="beamSection">
              <SelectValue placeholder={t("selectBeamSection")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="custom">{t("selectBeamSection")}</SelectItem>
              {Object.entries(groupedSections).map(([type, sections]) => (
                <SelectGroup key={type}>
                  <SelectLabel>{type}</SelectLabel>
                  {sections.map((section) => (
                    <SelectItem key={section.id} value={section.id}>
                      {section.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    switch (values.shape) {
      case "rectangle":
        return (
          <>
            <InputField
              id="width"
              label={tLabels("width")}
              value={values.width?.toString() || ""}
              onChange={(v) => setValue("width", parseFloat(v) || 0)}
              min={0}
              step="1"
              unit="mm"
            />
            <InputField
              id="height"
              label={tLabels("height")}
              value={values.height?.toString() || ""}
              onChange={(v) => setValue("height", parseFloat(v) || 0)}
              min={0}
              step="1"
              unit="mm"
            />
          </>
        );

      case "circle":
        return (
          <InputField
            id="diameter"
            label={tLabels("diameter")}
            value={values.diameter?.toString() || ""}
            onChange={(v) => setValue("diameter", parseFloat(v) || 0)}
            min={0}
            step="1"
            unit="mm"
          />
        );

      case "hollow-rectangle":
        return (
          <>
            <InputField
              id="width"
              label={`${tLabels("outer")} ${tLabels("width")}`}
              value={values.width?.toString() || ""}
              onChange={(v) => setValue("width", parseFloat(v) || 0)}
              min={0}
              step="1"
              unit="mm"
            />
            <InputField
              id="height"
              label={`${tLabels("outer")} ${tLabels("height")}`}
              value={values.height?.toString() || ""}
              onChange={(v) => setValue("height", parseFloat(v) || 0)}
              min={0}
              step="1"
              unit="mm"
            />
            <InputField
              id="innerWidth"
              label={`${tLabels("inner")} ${tLabels("width")}`}
              value={values.innerWidth?.toString() || ""}
              onChange={(v) => setValue("innerWidth", parseFloat(v) || 0)}
              min={0}
              step="1"
              unit="mm"
            />
            <InputField
              id="innerHeight"
              label={`${tLabels("inner")} ${tLabels("height")}`}
              value={values.innerHeight?.toString() || ""}
              onChange={(v) => setValue("innerHeight", parseFloat(v) || 0)}
              min={0}
              step="1"
              unit="mm"
            />
          </>
        );

      case "hollow-circle":
        return (
          <>
            <InputField
              id="diameter"
              label={`${tLabels("outer")} ${tLabels("diameter")}`}
              value={values.diameter?.toString() || ""}
              onChange={(v) => setValue("diameter", parseFloat(v) || 0)}
              min={0}
              step="1"
              unit="mm"
            />
            <InputField
              id="innerDiameter"
              label={`${tLabels("inner")} ${tLabels("diameter")}`}
              value={values.innerDiameter?.toString() || ""}
              onChange={(v) => setValue("innerDiameter", parseFloat(v) || 0)}
              min={0}
              step="1"
              unit="mm"
            />
          </>
        );

      case "triangle":
        return (
          <>
            <InputField
              id="width"
              label={tLabels("base")}
              value={values.width?.toString() || ""}
              onChange={(v) => setValue("width", parseFloat(v) || 0)}
              min={0}
              step="1"
              unit="mm"
            />
            <InputField
              id="height"
              label={tLabels("height")}
              value={values.height?.toString() || ""}
              onChange={(v) => setValue("height", parseFloat(v) || 0)}
              min={0}
              step="1"
              unit="mm"
            />
          </>
        );

      case "i-beam":
        return (
          <>
            <InputField
              id="depth"
              label={t("labels.depth")}
              value={values.depth?.toString() || ""}
              onChange={(v) => setValue("depth", parseFloat(v) || 0)}
              min={0}
              step="1"
              unit="mm"
            />
            <InputField
              id="flangeWidth"
              label={t("labels.flangeWidth")}
              value={values.flangeWidth?.toString() || ""}
              onChange={(v) => setValue("flangeWidth", parseFloat(v) || 0)}
              min={0}
              step="1"
              unit="mm"
            />
            <InputField
              id="flangeThickness"
              label={t("labels.flangeThickness")}
              value={values.flangeThickness?.toString() || ""}
              onChange={(v) => setValue("flangeThickness", parseFloat(v) || 0)}
              min={0}
              step="1"
              unit="mm"
            />
            <InputField
              id="webThickness"
              label={t("labels.webThickness")}
              value={values.webThickness?.toString() || ""}
              onChange={(v) => setValue("webThickness", parseFloat(v) || 0)}
              min={0}
              step="1"
              unit="mm"
            />
          </>
        );

      case "channel":
        return (
          <>
            <InputField
              id="channelDepth"
              label={t("labels.depth")}
              value={values.channelDepth?.toString() || ""}
              onChange={(v) => setValue("channelDepth", parseFloat(v) || 0)}
              min={0}
              step="1"
              unit="mm"
            />
            <InputField
              id="channelWidth"
              label={tLabels("width")}
              value={values.channelWidth?.toString() || ""}
              onChange={(v) => setValue("channelWidth", parseFloat(v) || 0)}
              min={0}
              step="1"
              unit="mm"
            />
            <InputField
              id="channelWebThickness"
              label={t("labels.webThickness")}
              value={values.channelWebThickness?.toString() || ""}
              onChange={(v) => setValue("channelWebThickness", parseFloat(v) || 0)}
              min={0}
              step="1"
              unit="mm"
            />
            <InputField
              id="channelFlangeThickness"
              label={t("labels.flangeThickness")}
              value={values.channelFlangeThickness?.toString() || ""}
              onChange={(v) => setValue("channelFlangeThickness", parseFloat(v) || 0)}
              min={0}
              step="1"
              unit="mm"
            />
          </>
        );

      case "angle":
        return (
          <>
            <InputField
              id="legWidth1"
              label={t("labels.leg1Width")}
              value={values.legWidth1?.toString() || ""}
              onChange={(v) => setValue("legWidth1", parseFloat(v) || 0)}
              min={0}
              step="1"
              unit="mm"
            />
            <InputField
              id="legWidth2"
              label={t("labels.leg2Width")}
              value={values.legWidth2?.toString() || ""}
              onChange={(v) => setValue("legWidth2", parseFloat(v) || 0)}
              min={0}
              step="1"
              unit="mm"
            />
            <InputField
              id="thickness"
              label={tLabels("thickness")}
              value={values.thickness?.toString() || ""}
              onChange={(v) => setValue("thickness", parseFloat(v) || 0)}
              min={0}
              step="1"
              unit="mm"
            />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Shape Selection */}
      <Card>
        <CardHeader>
          <CardTitle>{t("shape")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="shape">{t("shape")}</Label>
            <Select value={values.shape} onValueChange={handleShapeChange}>
              <SelectTrigger id="shape">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {shapeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Input Mode */}
      <Card>
        <CardHeader>
          <CardTitle>{t("inputMode")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as typeof inputMode)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="custom">{t("customDimensions")}</TabsTrigger>
              <TabsTrigger value="standard">{t("standardSection")}</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Dimensions */}
      <Card>
        <CardHeader>
          <CardTitle>{tLabels("dimensions")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">{renderDimensionInputs()}</div>
        </CardContent>
      </Card>

      {/* Parallel Axis Theorem */}
      {inputMode === "custom" && (
        <Card>
          <CardHeader
            className="cursor-pointer"
            onClick={() => setShowParallelAxis(!showParallelAxis)}
          >
            <CardTitle className="flex items-center gap-2">
              {showParallelAxis ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              {t("parallelAxisTheorem")}
            </CardTitle>
          </CardHeader>
          {showParallelAxis && (
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <InputField
                  id="offsetX"
                  label={t("labels.offsetX")}
                  value={values.offsetX?.toString() || "0"}
                  onChange={(v) => setValue("offsetX", parseFloat(v) || 0)}
                  step="1"
                  unit="mm"
                />
                <InputField
                  id="offsetY"
                  label={t("labels.offsetY")}
                  value={values.offsetY?.toString() || "0"}
                  onChange={(v) => setValue("offsetY", parseFloat(v) || 0)}
                  step="1"
                  unit="mm"
                />
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Cross-Section Preview */}
      <Card>
        <CardHeader>
          <CardTitle>{t("crossSectionPreview")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4 aspect-square max-w-md mx-auto">
              <CrossSectionSvg
                shape={values.shape}
                dimensions={{
                  width: values.width || 0,
                  height: values.height || 0,
                  diameter: values.diameter || 0,
                  innerWidth: values.innerWidth || 0,
                  innerHeight: values.innerHeight || 0,
                  innerDiameter: values.innerDiameter || 0,
                  flangeWidth: values.flangeWidth || 0,
                  flangeThickness: values.flangeThickness || 0,
                  webThickness: values.webThickness || 0,
                  depth: values.depth || 0,
                  channelDepth: values.channelDepth || 0,
                  channelWidth: values.channelWidth || 0,
                  channelWebThickness: values.channelWebThickness || 0,
                  channelFlangeThickness: values.channelFlangeThickness || 0,
                  legWidth1: values.legWidth1 || 0,
                  legWidth2: values.legWidth2 || 0,
                  thickness: values.thickness || 0,
                }}
                showCentroid={showCentroid}
                showAxes={showAxes}
              />
            </div>
            <div className="flex gap-4 justify-center">
              <div className="flex items-center gap-2">
                <Switch id="centroid" checked={showCentroid} onCheckedChange={setShowCentroid} />
                <Label htmlFor="centroid">{t("showCentroid")}</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="axes" checked={showAxes} onCheckedChange={setShowAxes} />
                <Label htmlFor="axes">{t("showAxes")}</Label>
              </div>
            </div>
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
                  label={t("labels.momentOfInertiaX")}
                  value={result.Ix.toExponential(2)}
                  unit="mm⁴"
                  size="lg"
                />
                <OutputDisplay
                  label={t("labels.momentOfInertiaY")}
                  value={result.Iy.toExponential(2)}
                  unit="mm⁴"
                  size="lg"
                />
              </div>

              <ResultGrid
                results={[
                  {
                    label: t("labels.area"),
                    value: result.area.toFixed(2),
                    unit: "mm²",
                  },
                  {
                    label: t("labels.radiusOfGyrationX"),
                    value: result.radiusOfGyrationX.toFixed(2),
                    unit: "mm",
                  },
                  {
                    label: t("labels.radiusOfGyrationY"),
                    value: result.radiusOfGyrationY.toFixed(2),
                    unit: "mm",
                  },
                ]}
              />

              {/* Units Conversion */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">{t("momentInUnits")}</p>
                <div className="grid gap-2 sm:grid-cols-3 text-sm">
                  <div className="rounded-md border bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground mb-1">mm⁴</p>
                    <p className="font-mono text-sm">
                      Ix: {result.units.mm4.Ix.toExponential(2)}
                      <br />
                      Iy: {result.units.mm4.Iy.toExponential(2)}
                    </p>
                  </div>
                  <div className="rounded-md border bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground mb-1">in⁴</p>
                    <p className="font-mono text-sm">
                      Ix: {result.units.in4.Ix.toFixed(2)}
                      <br />
                      Iy: {result.units.in4.Iy.toFixed(2)}
                    </p>
                  </div>
                  <div className="rounded-md border bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground mb-1">cm⁴</p>
                    <p className="font-mono text-sm">
                      Ix: {result.units.cm4.Ix.toExponential(2)}
                      <br />
                      Iy: {result.units.cm4.Iy.toExponential(2)}
                    </p>
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
