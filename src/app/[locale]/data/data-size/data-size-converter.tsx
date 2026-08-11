"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { InputField, ResultGrid } from "@/components/converter";
import { convertToAll, DATA_UNITS, type DataUnit } from "@/lib/converters/data/data-size";

const UNIT_OPTIONS = DATA_UNITS.map((u) => ({
  value: u.id,
  label: u.symbol,
}));

export function DataSizeConverter() {
  const t = useTranslations("calculator.labels");
  const _tResults = useTranslations("calculator.results");
  const [value, setValue] = useState("1");
  const [unit, setUnit] = useState<DataUnit>("gb");

  const numValue = parseFloat(value) || 0;
  const result = numValue > 0 ? convertToAll(numValue, unit) : null;

  const formatValue = (val: number): string => {
    if (val === 0) return "0";
    if (val >= 1000000) return val.toExponential(4);
    if (val >= 1) return val.toFixed(2);
    if (val >= 0.01) return val.toFixed(4);
    return val.toExponential(4);
  };

  return (
    <div className="space-y-6">
      <InputField
        id="value"
        label={t("value")}
        value={value}
        onChange={setValue}
        units={UNIT_OPTIONS}
        selectedUnit={unit}
        onUnitChange={(u) => setUnit(u as DataUnit)}
        min={0}
        step="any"
      />

      {result && (
        <div className="space-y-6">
          <div>
            <h3 className="font-medium mb-3">Decimal Units (1000-based)</h3>
            <ResultGrid
              results={[
                { label: "Bytes", value: formatValue(result.bytes), unit: "B" },
                { label: "Kilobytes", value: formatValue(result.kb), unit: "KB" },
                { label: "Megabytes", value: formatValue(result.mb), unit: "MB" },
                { label: "Gigabytes", value: formatValue(result.gb), unit: "GB" },
                { label: "Terabytes", value: formatValue(result.tb), unit: "TB" },
              ]}
              columns={3}
            />
          </div>

          <div>
            <h3 className="font-medium mb-3">Binary Units (1024-based)</h3>
            <ResultGrid
              results={[
                { label: "Kibibytes", value: formatValue(result.kib), unit: "KiB" },
                { label: "Mebibytes", value: formatValue(result.mib), unit: "MiB" },
                { label: "Gibibytes", value: formatValue(result.gib), unit: "GiB" },
                { label: "Tebibytes", value: formatValue(result.tib), unit: "TiB" },
              ]}
              columns={4}
            />
          </div>

          <div className="p-4 rounded-lg border bg-muted/50">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> Decimal units (KB, MB, GB) use base 1000, while binary units
              (KiB, MiB, GiB) use base 1024. Storage manufacturers typically use decimal units,
              while operating systems often use binary units.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
