"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { InputField, OutputDisplay, ResultGrid } from "@/components/converter";
import { calculateCorpulence, compareToBMI } from "@/lib/converters/health/corpulence";

export function CorpulenceCalculator() {
  const t = useTranslations("calculator.labels");
  const tResults = useTranslations("calculator.results");
  const tCorpulence = useTranslations("calculator.health.corpulence");

  const [weight, setWeight] = useState("70");
  const [height, setHeight] = useState("175");
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");

  const numWeight = parseFloat(weight) || 0;
  const numHeight = parseFloat(height) || 0;

  const corpulenceResult = calculateCorpulence(numWeight, numHeight, unit);
  const result = corpulenceResult.ok ? corpulenceResult.value : null;
  const comparisonResult = compareToBMI(numWeight, numHeight, unit);
  const comparison = comparisonResult.ok ? comparisonResult.value : null;

  const getCategoryColor = (categoryKey: string) => {
    switch (categoryKey) {
      case "underweight":
        return "text-blue-600 dark:text-blue-400";
      case "normalLower":
      case "normal":
      case "normalUpper":
        return "text-green-600 dark:text-green-400";
      case "overweight":
        return "text-yellow-600 dark:text-yellow-400";
      case "obese":
        return "text-red-600 dark:text-red-400";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Unit Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setUnit("metric")}
          className={`flex-1 py-2 px-4 rounded-lg border font-medium transition-colors ${
            unit === "metric" ? "bg-primary text-primary-foreground" : "bg-muted/50 hover:bg-muted"
          }`}
        >
          {tCorpulence("metric")}
        </button>
        <button
          onClick={() => setUnit("imperial")}
          className={`flex-1 py-2 px-4 rounded-lg border font-medium transition-colors ${
            unit === "imperial"
              ? "bg-primary text-primary-foreground"
              : "bg-muted/50 hover:bg-muted"
          }`}
        >
          {tCorpulence("imperial")}
        </button>
      </div>

      {/* Inputs */}
      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          id="weight"
          label={t("weightSimple")}
          value={weight}
          onChange={setWeight}
          unit={unit === "metric" ? "kg" : "lbs"}
          min={1}
          step={0.1}
          placeholder={t("enterWeight")}
        />
        <InputField
          id="height"
          label={t("heightSimple")}
          value={height}
          onChange={setHeight}
          unit={unit === "metric" ? "cm" : "in"}
          min={1}
          step={0.1}
          placeholder={t("enterHeight")}
        />
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <OutputDisplay
              label={t("corpulenceIndex")}
              value={`${result.corpulenceIndex} kg/m³`}
              size="lg"
            />
            <div className="p-4 rounded-lg border bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">{tResults("category")}</p>
              <p className={`text-xl font-semibold ${getCategoryColor(result.categoryKey)}`}>
                {tCorpulence(`${result.categoryKey}.category`)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {tCorpulence(`${result.categoryKey}.description`)}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-lg border bg-muted/50">
            <p className="text-sm font-medium mb-1">{tCorpulence("healthRiskAssessment")}</p>
            <p className="text-muted-foreground">
              {tCorpulence(`${result.categoryKey}.healthRisk`)}
            </p>
          </div>

          {/* BMI Comparison */}
          {comparison && (
            <div className="space-y-2">
              <h3 className="font-medium">{tCorpulence("comparisonWithBmi")}</h3>
              <ResultGrid
                results={[
                  {
                    label: tCorpulence("corpulenceIndexLabel"),
                    value: comparison.ci,
                    unit: "kg/m³",
                  },
                  { label: tCorpulence("bmiLabel"), value: comparison.bmi, unit: "kg/m²" },
                ]}
                columns={2}
              />
              <p className="text-sm text-muted-foreground p-3 rounded border bg-muted/50">
                {tCorpulence(`comparison.${comparison.comparisonKey}`)}
              </p>
            </div>
          )}

          {/* Reference Table */}
          <div className="space-y-2">
            <h3 className="font-medium">{tCorpulence("referenceTitle")}</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium">{tCorpulence("rangeColumn")}</th>
                    <th className="text-left py-2 font-medium">{tCorpulence("categoryColumn")}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-muted">
                    <td className="py-2 font-mono">{tCorpulence("reference.underweight")}</td>
                    <td className="py-2 text-blue-600 dark:text-blue-400">
                      {tCorpulence("underweight.category")}
                    </td>
                  </tr>
                  <tr className="border-b border-muted">
                    <td className="py-2 font-mono">{tCorpulence("reference.normal")}</td>
                    <td className="py-2 text-green-600 dark:text-green-400">
                      {tCorpulence("normal.category")}
                    </td>
                  </tr>
                  <tr className="border-b border-muted">
                    <td className="py-2 font-mono">{tCorpulence("reference.overweight")}</td>
                    <td className="py-2 text-yellow-600 dark:text-yellow-400">
                      {tCorpulence("overweight.category")}
                    </td>
                  </tr>
                  <tr className="border-b border-muted">
                    <td className="py-2 font-mono">{tCorpulence("reference.obese")}</td>
                    <td className="py-2 text-red-600 dark:text-red-400">
                      {tCorpulence("obese.category")}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Info */}
          <div className="p-4 rounded-lg border bg-muted/50 text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-2">{tCorpulence("aboutTitle")}</p>
            <p>{tCorpulence("aboutDescription")}</p>
          </div>
        </div>
      )}
    </div>
  );
}
