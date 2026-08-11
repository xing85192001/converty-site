"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { InputField, ResultGrid } from "@/components/converter";
import {
  COMMON_ASPECT_RATIOS,
  COMMON_DIAGONALS,
  calculateScreenSize,
} from "@/lib/converters/video/screen-size";

export function ScreenSizeCalculator() {
  const t = useTranslations("calculator.labels");
  const tMath = useTranslations("calculator.math");
  const [diagonal, setDiagonal] = useState("55");
  const [aspectW, setAspectW] = useState("16");
  const [aspectH, setAspectH] = useState("9");

  const calcResult = calculateScreenSize(
    parseFloat(diagonal) || 0,
    parseInt(aspectW) || 16,
    parseInt(aspectH) || 9
  );
  const result = calcResult.ok ? calcResult.value : null;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <InputField
            id="diagonal"
            label={t("diagonal")}
            value={diagonal}
            onChange={setDiagonal}
            unit="in"
            min={1}
            step={0.1}
          />
          <div className="flex flex-wrap gap-1">
            {COMMON_DIAGONALS.slice(0, 5).map((d) => (
              <button
                key={d.size}
                onClick={() => setDiagonal(d.size.toString())}
                className="text-xs px-2 py-1 rounded border hover:bg-muted/50"
              >
                {d.size}"
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Aspect Ratio</label>
          <select
            value={`${aspectW}:${aspectH}`}
            onChange={(e) => {
              const [w, h] = e.target.value.split(":");
              setAspectW(w);
              setAspectH(h);
            }}
            className="w-full h-10 px-3 rounded-md border bg-background"
          >
            {COMMON_ASPECT_RATIOS.map((ar) => (
              <option key={ar.name} value={`${ar.w}:${ar.h}`}>
                {ar.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <InputField
            id="aspectW"
            label={tMath("width")}
            value={aspectW}
            onChange={setAspectW}
            min={1}
          />
          <InputField
            id="aspectH"
            label={tMath("height")}
            value={aspectH}
            onChange={setAspectH}
            min={1}
          />
        </div>
      </div>

      {result && (
        <div className="space-y-6">
          <ResultGrid
            results={[
              { label: "Width", value: result.width, unit: "in" },
              { label: "Height", value: result.height, unit: "in" },
              { label: "Diagonal", value: result.diagonal, unit: "in" },
              { label: "Area", value: result.area, unit: "sq in" },
            ]}
            columns={2}
          />

          <div className="flex justify-center p-4 border rounded-lg bg-muted/20">
            <div
              className="bg-primary/20 border-2 border-primary rounded flex items-center justify-center"
              style={{
                width: Math.min(300, result.width * 4),
                height: Math.min(200, result.height * 4),
              }}
            >
              <span className="text-sm font-mono">
                {result.width.toFixed(1)}" × {result.height.toFixed(1)}"
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Size</th>
                  <th className="text-right py-2">Width</th>
                  <th className="text-right py-2">Height</th>
                  <th className="text-left py-2 pl-4">Typical Use</th>
                </tr>
              </thead>
              <tbody>
                {COMMON_DIAGONALS.map((d) => {
                  const rResult = calculateScreenSize(d.size, parseInt(aspectW), parseInt(aspectH));
                  const r = rResult.ok ? rResult.value : null;
                  return (
                    <tr
                      key={d.size}
                      className={`border-b border-muted ${d.size === parseFloat(diagonal) ? "bg-primary/10" : ""}`}
                    >
                      <td className="py-2 font-mono">{d.size}"</td>
                      <td className="py-2 text-right font-mono">{r?.width.toFixed(1)}"</td>
                      <td className="py-2 text-right font-mono">{r?.height.toFixed(1)}"</td>
                      <td className="py-2 pl-4 text-muted-foreground">{d.typical}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
