"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { InputField, OutputDisplay, ResultGrid } from "@/components/converter";
import {
  COMMON_MEGAPIXELS,
  calculateMegapixels,
  SENSOR_RESOLUTIONS,
} from "@/lib/converters/photo/megapixels";

export function MegapixelCalculator() {
  const t = useTranslations("calculator.labels");
  const tMath = useTranslations("calculator.math");
  const [width, setWidth] = useState("6000");
  const [height, setHeight] = useState("4000");

  const calcResult = calculateMegapixels(parseInt(width) || 0, parseInt(height) || 0);
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
        />
        <InputField
          id="height"
          label={tMath("height")}
          value={height}
          onChange={setHeight}
          unit="px"
          min={1}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {SENSOR_RESOLUTIONS.map((res) => (
          <button
            key={res.name}
            onClick={() => {
              setWidth(res.width.toString());
              setHeight(res.height.toString());
            }}
            className="text-xs px-2 py-1 rounded border hover:bg-muted/50"
          >
            {res.name}
          </button>
        ))}
      </div>

      {result && (
        <div className="space-y-6">
          <OutputDisplay label={t("megapixels")} value={`${result.megapixels} MP`} size="lg" />

          <ResultGrid
            results={[
              { label: "Total Pixels", value: result.totalPixels.toLocaleString() },
              { label: "Aspect Ratio", value: result.aspectRatio },
              { label: "Aspect Decimal", value: result.aspectDecimal },
              {
                label: "Orientation",
                value: result.orientation.charAt(0).toUpperCase() + result.orientation.slice(1),
              },
            ]}
            columns={2}
          />

          <div className="space-y-2">
            <h3 className="font-medium">Common Megapixel Reference</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">MP</th>
                    <th className="text-left py-2">Typical Use</th>
                    <th className="text-right py-2">Comparison</th>
                  </tr>
                </thead>
                <tbody>
                  {COMMON_MEGAPIXELS.map((mp) => (
                    <tr
                      key={mp.mp}
                      className={`border-b border-muted ${Math.abs(mp.mp - result.megapixels) < 2 ? "bg-primary/10" : ""}`}
                    >
                      <td className="py-2 font-mono">{mp.mp} MP</td>
                      <td className="py-2 text-muted-foreground">{mp.typical}</td>
                      <td className="py-2 text-right font-mono">
                        {result.megapixels >= mp.mp ? "✓" : ""}
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
