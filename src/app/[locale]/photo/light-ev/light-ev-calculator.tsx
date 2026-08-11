"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { OutputDisplay, ResultGrid } from "@/components/converter";
import {
  COMMON_APERTURES,
  COMMON_ISO,
  COMMON_SHUTTER_SPEEDS,
  calculateEV,
} from "@/lib/converters/photo/light-ev";

export function LightEVCalculator() {
  const t = useTranslations("calculator.labels");
  const [aperture, setAperture] = useState("5.6");
  const [shutterSpeed, setShutterSpeed] = useState((1 / 125).toString());
  const [iso, setIso] = useState("100");

  const calcResult = calculateEV(
    parseFloat(aperture) || 0,
    parseFloat(shutterSpeed) || 0,
    parseInt(iso) || 0
  );
  const result = calcResult.ok ? calcResult.value : null;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">Aperture</label>
          <select
            value={aperture}
            onChange={(e) => setAperture(e.target.value)}
            className="w-full h-10 px-3 rounded-md border bg-background"
          >
            {COMMON_APERTURES.map((a) => (
              <option key={a} value={a}>
                f/{a}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Shutter Speed</label>
          <select
            value={shutterSpeed}
            onChange={(e) => setShutterSpeed(e.target.value)}
            className="w-full h-10 px-3 rounded-md border bg-background"
          >
            {COMMON_SHUTTER_SPEEDS.map((s) => (
              <option key={s.label} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">ISO</label>
          <select
            value={iso}
            onChange={(e) => setIso(e.target.value)}
            className="w-full h-10 px-3 rounded-md border bg-background"
          >
            {COMMON_ISO.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        </div>
      </div>

      {result && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <OutputDisplay label={t("exposureValue")} value={`EV ${result.ev}`} size="lg" />
            <OutputDisplay label={t("evAtIso100")} value={`EV100 ${result.ev100}`} size="lg" />
          </div>

          <ResultGrid
            results={[
              { label: "Illuminance", value: result.lux, unit: "lux" },
              { label: "Illuminance", value: result.footCandles, unit: "fc" },
            ]}
            columns={2}
          />

          <div className="p-4 rounded-lg border bg-muted/50">
            <p className="text-sm text-muted-foreground mb-1">Light Level</p>
            <p className="text-xl font-semibold">{result.lightLevel}</p>
            <p className="text-sm text-muted-foreground mt-1">{result.description}</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">EV100</th>
                  <th className="text-left py-2">Light Condition</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { ev: "-4 to 0", desc: "Starlight, night scenes" },
                  { ev: "0 to 4", desc: "Candlelight, dim interiors" },
                  { ev: "4 to 8", desc: "Indoor lighting" },
                  { ev: "8 to 12", desc: "Overcast, shade" },
                  { ev: "12 to 14", desc: "Hazy sun, cloudy bright" },
                  { ev: "14 to 16+", desc: "Direct sunlight" },
                ].map((row) => (
                  <tr key={row.ev} className="border-b border-muted">
                    <td className="py-2 font-mono">{row.ev}</td>
                    <td className="py-2 text-muted-foreground">{row.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
