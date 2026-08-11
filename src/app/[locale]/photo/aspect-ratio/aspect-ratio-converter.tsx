"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { InputField, OutputDisplay, ResultGrid } from "@/components/converter";
import { COMMON_RATIOS, calculateAspectRatio } from "@/lib/converters/photo/aspect-ratio";

export function AspectRatioConverter() {
  const t = useTranslations("calculator.labels");
  const tMath = useTranslations("calculator.math");
  const [width, setWidth] = useState("1920");
  const [height, setHeight] = useState("1080");

  const w = parseInt(width) || 0;
  const h = parseInt(height) || 0;
  const calcResult = calculateAspectRatio(w, h);
  const result = calcResult.ok ? calcResult.value : null;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          id="width"
          label={tMath("width")}
          value={width}
          onChange={setWidth}
          unit="px"
          min={1}
          step={1}
          placeholder="Enter width"
        />
        <InputField
          id="height"
          label={tMath("height")}
          value={height}
          onChange={setHeight}
          unit="px"
          min={1}
          step={1}
          placeholder="Enter height"
        />
      </div>

      {result && (
        <div className="space-y-6">
          <div className="flex items-center gap-6">
            <OutputDisplay
              label={t("aspectRatio")}
              value={result.ratio}
              size="lg"
              className="flex-1"
            />
            <OutputDisplay label={t("decimal")} value={result.decimal} className="flex-1" />
          </div>

          <ResultGrid
            results={[
              {
                label: "Orientation",
                value: result.isSquare ? "Square" : result.isLandscape ? "Landscape" : "Portrait",
              },
              { label: "GCD", value: result.gcd },
            ]}
            columns={2}
          />

          {/* Visual Preview */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Preview</p>
            <div className="flex items-center justify-center p-4 border rounded-lg bg-muted/50">
              <div
                className="bg-primary/20 border-2 border-primary rounded"
                style={{
                  width: result.isLandscape ? "200px" : `${200 * result.decimal}px`,
                  height: result.isLandscape ? `${200 / result.decimal}px` : "200px",
                  maxWidth: "100%",
                  maxHeight: "150px",
                }}
              />
            </div>
          </div>

          {/* Common Ratios Reference */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Common Aspect Ratios</p>
            <div className="grid gap-2 grid-cols-2 sm:grid-cols-4">
              {COMMON_RATIOS.map((r) => (
                <div
                  key={r.ratio}
                  className={`p-2 rounded border text-center ${
                    result.ratio === r.ratio ? "border-primary bg-primary/10" : ""
                  }`}
                >
                  <p className="font-mono text-sm">{r.ratio}</p>
                  <p className="text-xs text-muted-foreground">{r.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
