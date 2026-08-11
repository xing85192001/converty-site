"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { InputField, OutputDisplay, ResultGrid } from "@/components/converter";
import { COMMON_DPI, COMMON_PRINT_SIZES, calculateDPI } from "@/lib/converters/photo/dpi";

export function DPICalculator() {
  const t = useTranslations("calculator.labels");
  const [printWidth, setPrintWidth] = useState("8");
  const [printHeight, setPrintHeight] = useState("10");
  const [dpi, setDpi] = useState("300");

  const calcResult = calculateDPI(
    parseFloat(printWidth) || 0,
    parseFloat(printHeight) || 0,
    parseInt(dpi) || 0
  );
  const result = calcResult.ok ? calcResult.value : null;

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case "Excellent":
        return "text-green-600 dark:text-green-400";
      case "Good":
        return "text-blue-600 dark:text-blue-400";
      case "Acceptable":
        return "text-yellow-600 dark:text-yellow-400";
      case "Low":
        return "text-orange-600 dark:text-orange-400";
      default:
        return "text-red-600 dark:text-red-400";
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <InputField
          id="printWidth"
          label={t("printWidth")}
          value={printWidth}
          onChange={setPrintWidth}
          unit="in"
          min={0.1}
          step={0.1}
        />
        <InputField
          id="printHeight"
          label={t("printHeight")}
          value={printHeight}
          onChange={setPrintHeight}
          unit="in"
          min={0.1}
          step={0.1}
        />
        <div className="space-y-2">
          <InputField id="dpi" label={t("dpiLabel")} value={dpi} onChange={setDpi} min={1} />
          <div className="flex flex-wrap gap-1">
            {COMMON_DPI.map((d) => (
              <button
                key={d}
                onClick={() => setDpi(d.toString())}
                className="text-xs px-2 py-1 rounded border hover:bg-muted/50"
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="text-sm text-muted-foreground py-1">Common sizes:</span>
        {COMMON_PRINT_SIZES.slice(0, 6).map((size) => (
          <button
            key={size.name}
            onClick={() => {
              setPrintWidth(size.width.toString());
              setPrintHeight(size.height.toString());
            }}
            className="text-xs px-2 py-1 rounded border hover:bg-muted/50"
          >
            {size.name}
          </button>
        ))}
      </div>

      {result && (
        <div className="space-y-6">
          <OutputDisplay
            label={t("requiredResolution")}
            value={`${result.megapixels} MP`}
            size="lg"
          />

          <ResultGrid
            results={[
              { label: "Pixel Width", value: result.pixelWidth, unit: "px" },
              { label: "Pixel Height", value: result.pixelHeight, unit: "px" },
              { label: "Total Pixels", value: result.totalPixels.toLocaleString() },
              { label: "Megapixels", value: result.megapixels, unit: "MP" },
            ]}
            columns={2}
          />

          <div className="p-4 rounded-lg border bg-muted/50">
            <p className="text-sm text-muted-foreground mb-1">Print Quality</p>
            <p className={`text-xl font-semibold ${getQualityColor(result.printQuality)}`}>
              {result.printQuality}
            </p>
            <p className="text-sm text-muted-foreground mt-1">{result.qualityDescription}</p>
          </div>
        </div>
      )}
    </div>
  );
}
