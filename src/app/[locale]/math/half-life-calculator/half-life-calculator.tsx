"use client";

import { useTranslations } from "next-intl";
import { InputField, OutputDisplay, ResultGrid } from "@/components/converter";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  calculateHalfLife,
  type HalfLifeInput,
  type HalfLifeResult,
} from "@/lib/converters/math/half-life";
import { HalfLifeFormSchema } from "@/lib/schemas/math";
import { createCalculatorStore } from "@/stores/calculator-store";

type HalfLifeMode = "decay" | "remaining" | "findHalfLife" | "carbon14";

interface FormValues {
  mode: HalfLifeMode;
  initialAmount: string;
  remainingAmount: string;
  halfLife: string;
  time: string;
  percentRemaining: string;
}

const useHalfLifeStore = createCalculatorStore<FormValues, HalfLifeResult | null>({
  name: "half-life-calculator",
  schema: HalfLifeFormSchema,
  initialValues: {
    mode: "decay",
    initialAmount: "100",
    remainingAmount: "25",
    halfLife: "5730",
    time: "11460",
    percentRemaining: "50",
  },
  calculate: (vals) => {
    const input: HalfLifeInput = {
      mode: vals.mode,
      initialAmount: parseFloat(vals.initialAmount) || undefined,
      remainingAmount: parseFloat(vals.remainingAmount) || undefined,
      halfLife: parseFloat(vals.halfLife) || undefined,
      time: parseFloat(vals.time) || undefined,
      percentRemaining: parseFloat(vals.percentRemaining) || undefined,
    };
    return calculateHalfLife(input);
  },
});

export function HalfLifeCalculator() {
  const tMath = useTranslations("calculator.math");

  const { values, setValue, result, errors, calculationError } = useHalfLifeStore();

  const halfLifeResult = result;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>{tMath("calculationMode")}</Label>
        <Select value={values.mode} onValueChange={(v) => setValue("mode", v as HalfLifeMode)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="decay">{tMath("calculateRemaining")}</SelectItem>
            <SelectItem value="remaining">{tMath("calculateTime")}</SelectItem>
            <SelectItem value="findHalfLife">{tMath("calculateHalfLife")}</SelectItem>
            <SelectItem value="carbon14">{tMath("carbon14Dating")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {(values.mode === "decay" ||
          values.mode === "remaining" ||
          values.mode === "findHalfLife") && (
          <InputField
            id="initialAmount"
            label={tMath("initialAmount")}
            value={values.initialAmount}
            onChange={(v) => setValue("initialAmount", v)}
            step="any"
            min={0}
            placeholder="100"
            error={errors.initialAmount}
          />
        )}

        {(values.mode === "remaining" || values.mode === "findHalfLife") && (
          <InputField
            id="remainingAmount"
            label={tMath("remainingAmount")}
            value={values.remainingAmount}
            onChange={(v) => setValue("remainingAmount", v)}
            step="any"
            min={0}
            placeholder="25"
            error={errors.remainingAmount}
          />
        )}

        {(values.mode === "decay" || values.mode === "remaining") && (
          <InputField
            id="halfLife"
            label={tMath("halfLife")}
            value={values.halfLife}
            onChange={(v) => setValue("halfLife", v)}
            step="any"
            min={0}
            placeholder="5730"
            error={errors.halfLife}
          />
        )}

        {(values.mode === "decay" || values.mode === "findHalfLife") && (
          <InputField
            id="time"
            label={tMath("timeElapsed")}
            value={values.time}
            onChange={(v) => setValue("time", v)}
            step="any"
            min={0}
            placeholder="11460"
            error={errors.time}
          />
        )}

        {values.mode === "carbon14" && (
          <InputField
            id="percentRemaining"
            label={tMath("percentC14Remaining")}
            value={values.percentRemaining}
            onChange={(v) => setValue("percentRemaining", v)}
            step="any"
            min={0.1}
            max={100}
            placeholder="50"
            error={errors.percentRemaining}
          />
        )}
      </div>

      {halfLifeResult && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <OutputDisplay
              label={tMath("remainingAmount")}
              value={halfLifeResult.remainingAmount.toFixed(4)}
              size="lg"
            />
            <OutputDisplay
              label={tMath("percentRemaining")}
              value={`${halfLifeResult.percentRemaining.toFixed(2)}%`}
              size="lg"
            />
          </div>

          <ResultGrid
            results={[
              { label: tMath("halfLife"), value: halfLifeResult.halfLife.toFixed(4) },
              { label: tMath("timeElapsed"), value: halfLifeResult.time.toFixed(4) },
              { label: tMath("decayConstant"), value: halfLifeResult.decayConstant.toFixed(8) },
              {
                label: tMath("numberOfHalfLives"),
                value: halfLifeResult.numberOfHalfLives.toFixed(2),
              },
            ]}
          />

          <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
            <p className="text-sm font-medium">{tMath("formula")}:</p>
            <p className="text-sm text-muted-foreground font-mono">{halfLifeResult.formula}</p>
          </div>

          <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
            <p className="text-sm font-medium">{tMath("calculationSteps")}:</p>
            <div className="text-sm text-muted-foreground font-mono space-y-1">
              {halfLifeResult.steps.map((step) => (
                <p key={step}>{step}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      {calculationError && <p className="mt-2 text-sm text-destructive">{calculationError}</p>}
    </div>
  );
}
