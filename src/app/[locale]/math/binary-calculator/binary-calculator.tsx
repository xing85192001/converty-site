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
import { type BinaryInput, type BinaryResult, calculateBinary } from "@/lib/converters/math/binary";
import { BinaryFormSchema } from "@/lib/schemas/math";
import { createCalculatorStore } from "@/stores/calculator-store";

interface FormValues {
  mode: "decimalToBinary" | "binaryToDecimal" | "binaryOperation";
  decimal: string;
  binary: string;
  binary2: string;
  operation: "add" | "subtract" | "multiply" | "and" | "or" | "xor" | "not";
}

const useBinaryStore = createCalculatorStore<FormValues, BinaryResult | null>({
  name: "binary-calculator",
  schema: BinaryFormSchema,
  initialValues: {
    mode: "decimalToBinary",
    decimal: "42",
    binary: "101010",
    binary2: "1100",
    operation: "add",
  },
  calculate: (vals) => {
    const input: BinaryInput = {
      mode: vals.mode,
      decimal: parseInt(vals.decimal),
      binary: vals.binary,
      binary2: vals.binary2,
      operation: vals.operation,
    };
    return calculateBinary(input);
  },
});

export function BinaryCalculator() {
  const tMath = useTranslations("calculator.math");

  const { values, setValue, result, errors, calculationError } = useBinaryStore();

  const binaryResult = result;

  const renderInputs = () => {
    switch (values.mode) {
      case "decimalToBinary":
        return (
          <InputField
            id="decimal"
            label={tMath("decimalNumber")}
            value={values.decimal}
            onChange={(v) => setValue("decimal", v)}
            step="1"
            placeholder="42"
            error={errors.decimal}
          />
        );
      case "binaryToDecimal":
        return (
          <div className="space-y-2">
            <Label htmlFor="binary">{tMath("binaryNumber")}</Label>
            <Input
              id="binary"
              value={values.binary}
              onChange={(e) => setValue("binary", e.target.value.replace(/[^01]/g, ""))}
              placeholder="101010"
              className="font-mono"
            />
          </div>
        );
      case "binaryOperation":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="binary">{tMath("binaryNumber")} 1</Label>
              <Input
                id="binary"
                value={values.binary}
                onChange={(e) => setValue("binary", e.target.value.replace(/[^01]/g, ""))}
                placeholder="101010"
                className="font-mono"
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
                  <SelectItem value="not">NOT</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {values.operation !== "not" && (
              <div className="space-y-2">
                <Label htmlFor="binary2">{tMath("binaryNumber")} 2</Label>
                <Input
                  id="binary2"
                  value={values.binary2}
                  onChange={(e) => setValue("binary2", e.target.value.replace(/[^01]/g, ""))}
                  placeholder="1100"
                  className="font-mono"
                />
              </div>
            )}
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
              <SelectItem value="decimalToBinary">{tMath("decimalToBinary")}</SelectItem>
              <SelectItem value="binaryToDecimal">{tMath("binaryToDecimal")}</SelectItem>
              <SelectItem value="binaryOperation">{tMath("binaryOperation")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">{renderInputs()}</div>
      </div>

      {binaryResult && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <OutputDisplay
              label={tMath("decimalNumber")}
              value={binaryResult.decimal.toString()}
              size="lg"
            />
            <OutputDisplay label={tMath("binaryNumber")} value={binaryResult.binary} size="lg" />
          </div>

          <ResultGrid
            results={[
              { label: tMath("octal"), value: binaryResult.octal },
              { label: tMath("hexadecimal"), value: binaryResult.hexadecimal },
              { label: tMath("bitCount"), value: binaryResult.bitCount.toString() },
            ]}
          />

          {binaryResult.operationResult && (
            <div className="rounded-lg border border-primary bg-primary/5 p-4 space-y-2">
              <p className="text-sm font-medium">{tMath("operationResult")}:</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <OutputDisplay
                  label={tMath("binaryNumber")}
                  value={binaryResult.operationResult.binary}
                />
                <OutputDisplay
                  label={tMath("decimalNumber")}
                  value={binaryResult.operationResult.decimal.toString()}
                />
              </div>
            </div>
          )}

          {binaryResult.steps.length > 0 && (
            <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
              <p className="text-sm font-medium">{tMath("steps")}:</p>
              {binaryResult.steps.map((step) => (
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
