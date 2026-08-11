"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { InputField } from "@/components/converter";
import {
  calculateMegapixelAspects,
  MEGAPIXEL_PRESETS,
} from "@/lib/converters/photo/megapixel-aspects";

export function MegapixelAspectsCalculator() {
  const t = useTranslations("calculator.labels");
  const [megapixels, setMegapixels] = useState("24");

  const results = calculateMegapixelAspects(parseFloat(megapixels) || 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          id="megapixels"
          label={t("targetMegapixels")}
          value={megapixels}
          onChange={setMegapixels}
          unit="MP"
          min={0.1}
          step={0.1}
        />
        <div className="flex flex-wrap gap-2 items-end pb-2">
          {MEGAPIXEL_PRESETS.map((preset) => (
            <button
              key={preset.value}
              onClick={() => setMegapixels(preset.value.toString())}
              className="text-xs px-2 py-1 rounded border hover:bg-muted/50"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {results.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 font-medium">Aspect Ratio</th>
                <th className="text-right py-3 font-medium">Width</th>
                <th className="text-right py-3 font-medium">Height</th>
                <th className="text-right py-3 font-medium">Megapixels</th>
                <th className="text-left py-3 font-medium pl-4">Use Cases</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result) => (
                <tr key={result.name} className="border-b border-muted hover:bg-muted/50">
                  <td className="py-3">
                    <span className="font-medium">{result.name}</span>
                    <span className="text-muted-foreground ml-2">
                      ({result.ratioW}:{result.ratioH})
                    </span>
                  </td>
                  <td className="py-3 text-right font-mono">{result.width.toLocaleString()}</td>
                  <td className="py-3 text-right font-mono">{result.height.toLocaleString()}</td>
                  <td className="py-3 text-right font-mono">{result.megapixels}</td>
                  <td className="py-3 text-left text-muted-foreground pl-4">{result.useCases}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="grid gap-4 grid-cols-3 sm:grid-cols-5">
        {results.slice(0, 5).map((result) => (
          <div key={result.name} className="p-3 rounded border bg-muted/50 text-center">
            <div
              className="mx-auto mb-2 bg-primary/20 border border-primary rounded"
              style={{
                width: result.ratioW > result.ratioH ? 60 : 60 * (result.ratioW / result.ratioH),
                height: result.ratioH > result.ratioW ? 60 : 60 * (result.ratioH / result.ratioW),
              }}
            />
            <p className="text-xs font-medium">
              {result.ratioW}:{result.ratioH}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
