"use client";

import { useTranslations } from "next-intl";
import { InputField, OutputDisplay } from "@/components/converter";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  calculatePermutationCombination,
  type PermutationCombinationInput,
  type PermutationCombinationResult,
} from "@/lib/converters/math/permutation-combination";
import { PermutationCombinationFormSchema } from "@/lib/schemas/math";
import { createCalculatorStore } from "@/stores/calculator-store";

type PCMode = "permutation" | "combination" | "permutationRepetition" | "combinationRepetition";

interface FormValues {
  mode: PCMode;
  n: string;
  r: string;
}

const usePermutationCombinationStore = createCalculatorStore<
  FormValues,
  PermutationCombinationResult | null
>({
  name: "permutation-combination-calculator",
  schema: PermutationCombinationFormSchema,
  initialValues: {
    mode: "permutation",
    n: "10",
    r: "3",
  },
  calculate: (vals) => {
    const input: PermutationCombinationInput = {
      mode: vals.mode,
      n: parseInt(vals.n) || 0,
      r: parseInt(vals.r) || 0,
    };
    return calculatePermutationCombination(input);
  },
});

export function PermutationCombinationCalculator() {
  const tResults = useTranslations("calculator.results");
  const tMath = useTranslations("calculator.math");

  const { values, setValue, result, errors, calculationError } = usePermutationCombinationStore();

  const pcResult = result;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>{tMath("calculationType")}</Label>
        <Select value={values.mode} onValueChange={(v) => setValue("mode", v as PCMode)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="permutation">{tMath("permutationNoRepetition")}</SelectItem>
            <SelectItem value="combination">{tMath("combinationNoRepetition")}</SelectItem>
            <SelectItem value="permutationRepetition">
              {tMath("permutationWithRepetition")}
            </SelectItem>
            <SelectItem value="combinationRepetition">
              {tMath("combinationWithRepetition")}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          id="n"
          label={tMath("totalItems")}
          value={values.n}
          onChange={(v) => setValue("n", v)}
          min={0}
          step="1"
          placeholder="10"
          error={errors.n}
        />
        <InputField
          id="r"
          label={tMath("itemsToChoose")}
          value={values.r}
          onChange={(v) => setValue("r", v)}
          min={0}
          step="1"
          placeholder="3"
          error={errors.r}
        />
      </div>

      {pcResult && (
        <div className="space-y-4">
          <OutputDisplay
            label={tResults("result")}
            value={pcResult.result === Infinity ? "∞" : pcResult.result.toLocaleString()}
            size="lg"
          />

          <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
            <p className="text-sm font-medium">{tMath("notation")}:</p>
            <p className="text-sm text-muted-foreground font-mono">{pcResult.notation}</p>
          </div>

          <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
            <p className="text-sm font-medium">{tMath("formula")}:</p>
            <p className="text-sm text-muted-foreground font-mono">{pcResult.formula}</p>
          </div>

          <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
            <p className="text-sm font-medium">{tMath("calculationSteps")}:</p>
            <div className="text-sm text-muted-foreground font-mono space-y-1">
              {pcResult.steps.map((step) => (
                <p key={step}>{step}</p>
              ))}
            </div>
          </div>

          <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
            <p className="text-sm font-medium">{tMath("interpretation")}:</p>
            <p className="text-sm text-muted-foreground">{pcResult.interpretation}</p>
          </div>

          {pcResult.examples.length > 0 && (
            <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
              <p className="text-sm font-medium">{tMath("realWorldExamples")}:</p>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                {pcResult.examples.map((example) => (
                  <li key={example}>{example}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {calculationError && <p className="mt-2 text-sm text-destructive">{calculationError}</p>}
    </div>
  );
}
