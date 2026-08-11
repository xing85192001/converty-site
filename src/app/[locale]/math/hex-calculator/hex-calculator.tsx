"use client";

import { useTranslations } from "next-intl";
import { InputField, OutputDisplay, ResultGrid } from "@/components/converter";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { calculateHex, type HexInput, type HexResult } from "@/lib/converters/math/hex";
import { HexFormSchema } from "@/lib/schemas/math";
import { createCalculatorStore } from "@/stores/calculator-store";

interface FormValues {
  mode: "decimalToHex" | "hexToDecimal" | "hexOperation" | "hexToRgb" | "rgbToHex";
  decimal: string;
  hex: string;
  hex2: string;
  operation: "add" | "subtract" | "multiply" | "and" | "or" | "xor";
  r: string;
  g: string;
  b: string;
}

const useHexStore = createCalculatorStore<FormValues, HexResult | null>({
  name: "hex-calculator",
  schema: HexFormSchema,
  initialValues: {
    mode: "decimalToHex",
    decimal: "255",
    hex: "FF",
    hex2: "10",
    operation: "add",
    r: "255",
    g: "128",
    b: "64",
  },
  calculate: (vals) => {
    const input: HexInput = {
      mode: vals.mode,
      decimal: parseInt(vals.decimal),
      hex: vals.hex,
      hex2: vals.hex2,
      operation: vals.operation,
      rgb: { r: parseInt(vals.r), g: parseInt(vals.g), b: parseInt(vals.b) },
    };
    return calculateHex(input);
  },
});

export function HexCalculator() {
  const tMath = useTranslations("calculator.math");

  const { values, setValue, result, errors, calculationError } = useHexStore();

  const hexResult = result;

  const renderInputs = () => {
    switch (values.mode) {
      case "decimalToHex":
        return (
          <InputField
            id="decimal"
            label={tMath("decimalNumber")}
            value={values.decimal}
            onChange={(v) => setValue("decimal", v)}
            step="1"
            placeholder="255"
            error={errors.decimal}
          />
        );
      case "hexToDecimal":
        return (
          <div className="space-y-2">
            <Label htmlFor="hex">{tMath("hexadecimalNumber")}</Label>
            <Input
              id="hex"
              value={values.hex}
              onChange={(e) => setValue("hex", e.target.value.replace(/[^0-9A-Fa-f]/g, ""))}
              placeholder="FF"
              className="font-mono uppercase"
            />
          </div>
        );
      case "hexOperation":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="hex">{tMath("hexadecimalNumber")} 1</Label>
              <Input
                id="hex"
                value={values.hex}
                onChange={(e) => setValue("hex", e.target.value.replace(/[^0-9A-Fa-f]/g, ""))}
                placeholder="FF"
                className="font-mono uppercase"
              />
            </div>
            <div className="space-y-2">
              <Label>{tMath("operation")}</Label>
              <Select
                value={values.operation}
                onValueChange={(v) => setValue("operation", v as FormValues["operation"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add">{tMath("add")}</SelectItem>
                  <SelectItem value="subtract">{tMath("subtract")}</SelectItem>
                  <SelectItem value="multiply">{tMath("multiply")}</SelectItem>
                  <SelectItem value="and">AND</SelectItem>
                  <SelectItem value="or">OR</SelectItem>
                  <SelectItem value="xor">XOR</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="hex2">{tMath("hexadecimalNumber")} 2</Label>
              <Input
                id="hex2"
                value={values.hex2}
                onChange={(e) => setValue("hex2", e.target.value.replace(/[^0-9A-Fa-f]/g, ""))}
                placeholder="10"
                className="font-mono uppercase"
              />
            </div>
          </>
        );
      case "hexToRgb":
        return (
          <div className="space-y-2">
            <Label htmlFor="hex">{tMath("hexColor")}</Label>
            <Input
              id="hex"
              value={values.hex}
              onChange={(e) => setValue("hex", e.target.value.replace(/[^0-9A-Fa-f#]/g, ""))}
              placeholder="#FF8040"
              className="font-mono uppercase"
            />
          </div>
        );
      case "rgbToHex":
        return (
          <>
            <InputField
              id="r"
              label="R"
              value={values.r}
              onChange={(v) => setValue("r", v)}
              step="1"
              min={0}
              max={255}
              placeholder="255"
              error={errors.r}
            />
            <InputField
              id="g"
              label="G"
              value={values.g}
              onChange={(v) => setValue("g", v)}
              step="1"
              min={0}
              max={255}
              placeholder="128"
              error={errors.g}
            />
            <InputField
              id="b"
              label="B"
              value={values.b}
              onChange={(v) => setValue("b", v)}
              step="1"
              min={0}
              max={255}
              placeholder="64"
              error={errors.b}
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>{tMath("conversionType")}</Label>
          <Select
            value={values.mode}
            onValueChange={(v) => setValue("mode", v as FormValues["mode"])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="decimalToHex">{tMath("decimalToHex")}</SelectItem>
              <SelectItem value="hexToDecimal">{tMath("hexToDecimal")}</SelectItem>
              <SelectItem value="hexOperation">{tMath("hexOperation")}</SelectItem>
              <SelectItem value="hexToRgb">{tMath("hexToRgb")}</SelectItem>
              <SelectItem value="rgbToHex">{tMath("rgbToHex")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">{renderInputs()}</div>
      </div>

      {hexResult && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <OutputDisplay
              label={tMath("decimalNumber")}
              value={hexResult.decimal.toString()}
              size="lg"
            />
            <OutputDisplay
              label={tMath("hexadecimalNumber")}
              value={hexResult.hexadecimal}
              size="lg"
            />
          </div>

          <ResultGrid
            results={[
              { label: tMath("binaryNumber"), value: hexResult.binary },
              { label: tMath("octal"), value: hexResult.octal },
            ]}
          />

          {hexResult.rgb && (
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-lg border"
                  style={{
                    backgroundColor: `rgb(${hexResult.rgb.r}, ${hexResult.rgb.g}, ${hexResult.rgb.b})`,
                  }}
                />
                <div>
                  <p className="text-sm font-medium">
                    RGB({hexResult.rgb.r}, {hexResult.rgb.g}, {hexResult.rgb.b})
                  </p>
                  <p className="text-sm text-muted-foreground">{hexResult.hexadecimal}</p>
                </div>
              </div>
            </div>
          )}

          {hexResult.operationResult && (
            <div className="rounded-lg border border-primary bg-primary/5 p-4 space-y-2">
              <p className="text-sm font-medium">{tMath("operationResult")}:</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <OutputDisplay
                  label={tMath("hexadecimalNumber")}
                  value={hexResult.operationResult.hex}
                />
                <OutputDisplay
                  label={tMath("decimalNumber")}
                  value={hexResult.operationResult.decimal.toString()}
                />
              </div>
            </div>
          )}

          {hexResult.steps.length > 0 && (
            <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
              <p className="text-sm font-medium">{tMath("steps")}:</p>
              {hexResult.steps.map((step) => (
                <p key={step} className="text-sm text-muted-foreground font-mono">
                  {step}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {calculationError && <p className="mt-2 text-sm text-destructive">{calculationError}</p>}
    </div>
  );
}
