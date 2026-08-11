"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { InputField, ResultGrid } from "@/components/converter";
import { calculateFootLambert, REFERENCE_VALUES } from "@/lib/converters/video/foot-lambert";

export function FootLambertCalculator() {
  const t = useTranslations("calculator.labels");
  const tVideo = useTranslations("calculator.video");
  const [value, setValue] = useState("14");
  const [unit, setUnit] = useState<"fl" | "nits" | "lumens">("fl");
  const [screenWidth, setScreenWidth] = useState("40");
  const [screenHeight, setScreenHeight] = useState("17");

  const calcResult = calculateFootLambert(
    parseFloat(value) || 0,
    unit,
    unit === "lumens" ? parseFloat(screenWidth) : undefined,
    unit === "lumens" ? parseFloat(screenHeight) : undefined
  );
  const result = calcResult.ok ? calcResult.value : null;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <InputField
          id="value"
          label={t("value")}
          value={value}
          onChange={setValue}
          min={0.1}
          step={0.1}
        />
        <div className="space-y-2">
          <label className="text-sm font-medium">{tVideo("unit")}</label>
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value as "fl" | "nits" | "lumens")}
            className="w-full h-10 px-3 rounded-md border bg-background"
          >
            <option value="fl">{tVideo("unitFootLamberts")}</option>
            <option value="nits">{tVideo("unitNits")}</option>
            <option value="lumens">{tVideo("unitLumens")}</option>
          </select>
        </div>
        {unit === "lumens" && (
          <>
            <InputField
              id="screenWidth"
              label={t("screenWidth")}
              value={screenWidth}
              onChange={setScreenWidth}
              unit="ft"
              min={1}
            />
            <InputField
              id="screenHeight"
              label={t("screenHeight")}
              value={screenHeight}
              onChange={setScreenHeight}
              unit="ft"
              min={1}
            />
          </>
        )}
      </div>

      {result && (
        <div className="space-y-6">
          <ResultGrid
            results={[
              { label: tVideo("labelFootLamberts"), value: result.footLamberts, unit: "fL" },
              { label: tVideo("labelNits"), value: result.nits, unit: "cd/m²" },
              ...(result.lumens > 0
                ? [{ label: tVideo("labelLumens"), value: result.lumens, unit: "lm" }]
                : []),
            ]}
            columns={result.lumens > 0 ? 3 : 2}
          />

          <div className="p-4 rounded-lg border bg-muted/50">
            <p className="text-sm text-muted-foreground mb-1">{tVideo("brightnessLevel")}</p>
            <p className="text-xl font-semibold">
              {tVideo(`brightnesses.${result.descriptionKey}`)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {tVideo(`brightnesses.${result.useCaseKey}`)}
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">{tVideo("referenceValues")}</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">{tVideo("standard")}</th>
                    <th className="text-right py-2">{tVideo("labelFootLamberts")}</th>
                    <th className="text-left py-2 pl-4">{tVideo("note")}</th>
                  </tr>
                </thead>
                <tbody>
                  {REFERENCE_VALUES.map((ref) => (
                    <tr
                      key={ref.key}
                      className={`border-b border-muted ${Math.abs(ref.fl - result.footLamberts) < 2 ? "bg-primary/10" : ""}`}
                    >
                      <td className="py-2 font-medium">{tVideo(`references.${ref.key}`)}</td>
                      <td className="py-2 text-right font-mono">{ref.fl} fL</td>
                      <td className="py-2 pl-4 text-muted-foreground">
                        {tVideo(`references.${ref.noteKey}`)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
