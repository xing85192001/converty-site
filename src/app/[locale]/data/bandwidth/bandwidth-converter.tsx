"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { InputField } from "@/components/converter";
import { BANDWIDTH_UNITS, convertBandwidth } from "@/lib/converters/data/bandwidth";

export function BandwidthConverter() {
  const t = useTranslations("calculator.labels");
  const tResults = useTranslations("calculator.results");
  const [value, setValue] = useState("100");
  const [unit, setUnit] = useState("mbps");

  const numValue = parseFloat(value) || 0;
  const calcResult = convertBandwidth(numValue, unit);
  const result = calcResult.ok ? calcResult.value : null;

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          id="bandwidth"
          label={t("value")}
          value={value}
          onChange={setValue}
          min={0}
          step={1}
        />
        <div className="space-y-2">
          <label className="text-sm font-medium">Unit</label>
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="w-full h-10 px-3 rounded-md border bg-background"
          >
            {BANDWIDTH_UNITS.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {result && (
        <div className="space-y-6">
          {/* Bit-based conversions */}
          <div className="space-y-2">
            <h3 className="font-medium">Bits per Second</h3>
            <div className="grid gap-2 grid-cols-2 sm:grid-cols-4">
              {result.conversions.slice(0, 4).map((conv) => (
                <div key={conv.unit} className="p-3 rounded-md border bg-muted/50">
                  <p className="text-sm text-muted-foreground">{conv.unit}</p>
                  <p className="font-mono font-medium">{conv.formatted}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Byte-based conversions */}
          <div className="space-y-2">
            <h3 className="font-medium">Bytes per Second</h3>
            <div className="grid gap-2 grid-cols-2 sm:grid-cols-4">
              {result.conversions.slice(4).map((conv) => (
                <div key={conv.unit} className="p-3 rounded-md border bg-muted/50">
                  <p className="text-sm text-muted-foreground">{conv.unit}</p>
                  <p className="font-mono font-medium">{conv.formatted}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Time-based calculations */}
          <div className="space-y-2">
            <h3 className="font-medium">Data Transfer Over Time</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium">Period</th>
                    <th className="text-right py-2 font-medium">GB</th>
                    <th className="text-right py-2 font-medium">TB</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-muted">
                    <td className="py-2">{tResults("daily")}</td>
                    <td className="py-2 text-right font-mono">{result.perDay.GB.toFixed(2)}</td>
                    <td className="py-2 text-right font-mono">{result.perDay.TB.toFixed(4)}</td>
                  </tr>
                  <tr className="border-b border-muted">
                    <td className="py-2">{tResults("weekly")}</td>
                    <td className="py-2 text-right font-mono">{result.perWeek.GB.toFixed(2)}</td>
                    <td className="py-2 text-right font-mono">{result.perWeek.TB.toFixed(3)}</td>
                  </tr>
                  <tr className="border-b border-muted">
                    <td className="py-2">{tResults("monthly")}</td>
                    <td className="py-2 text-right font-mono">{result.perMonth.GB.toFixed(2)}</td>
                    <td className="py-2 text-right font-mono">{result.perMonth.TB.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
