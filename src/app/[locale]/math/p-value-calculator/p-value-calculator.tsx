"use client";

import { useTranslations } from "next-intl";
import { InputField, OutputDisplay, ResultGrid } from "@/components/converter";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  calculatePValue,
  type PValueInput,
  type PValueResult,
} from "@/lib/converters/math/p-value";
import { PValueFormSchema } from "@/lib/schemas/math";
import { createCalculatorStore } from "@/stores/calculator-store";

type PValueMode = "fromZScore" | "fromTScore" | "fromChiSquare" | "fromFScore";

interface FormValues {
  mode: PValueMode;
  testStatistic: string;
  degreesOfFreedom: string;
  degreesOfFreedom2: string;
  twoTailed: boolean;
}

const usePValueStore = createCalculatorStore<FormValues, PValueResult | null>({
  name: "p-value-calculator",
  schema: PValueFormSchema,
  initialValues: {
    mode: "fromZScore",
    testStatistic: "1.96",
    degreesOfFreedom: "20",
    degreesOfFreedom2: "20",
    twoTailed: true,
  },
  calculate: (vals) => {
    const input: PValueInput = {
      mode: vals.mode,
      testStatistic: parseFloat(vals.testStatistic) || 0,
      degreesOfFreedom: parseInt(vals.degreesOfFreedom) || undefined,
      degreesOfFreedom2: parseInt(vals.degreesOfFreedom2) || undefined,
      twoTailed: vals.twoTailed,
    };
    return calculatePValue(input);
  },
});

export function PValueCalculator() {
  const tMath = useTranslations("calculator.math");

  const { values, setValue, result, errors, calculationError } = usePValueStore();

  const pResult = result;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>{tMath("testType")}</Label>
          <Select value={values.mode} onValueChange={(v) => setValue("mode", v as PValueMode)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fromZScore">{tMath("zTest")}</SelectItem>
              <SelectItem value="fromTScore">{tMath("tTest")}</SelectItem>
              <SelectItem value="fromChiSquare">{tMath("chiSquareTest")}</SelectItem>
              <SelectItem value="fromFScore">{tMath("fTest")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <InputField
          id="testStatistic"
          label={tMath("testStatistic")}
          value={values.testStatistic}
          onChange={(v) => setValue("testStatistic", v)}
          step="any"
          placeholder="1.96"
          error={errors.testStatistic}
        />
      </div>

      {(values.mode === "fromTScore" ||
        values.mode === "fromChiSquare" ||
        values.mode === "fromFScore") && (
        <div className="grid gap-4 sm:grid-cols-2">
          <InputField
            id="degreesOfFreedom"
            label={tMath("degreesOfFreedom")}
            value={values.degreesOfFreedom}
            onChange={(v) => setValue("degreesOfFreedom", v)}
            min={1}
            step="1"
            placeholder="20"
            error={errors.degreesOfFreedom}
          />
          {values.mode === "fromFScore" && (
            <InputField
              id="degreesOfFreedom2"
              label={tMath("degreesOfFreedom2")}
              value={values.degreesOfFreedom2}
              onChange={(v) => setValue("degreesOfFreedom2", v)}
              min={1}
              step="1"
              placeholder="20"
              error={errors.degreesOfFreedom2}
            />
          )}
        </div>
      )}

      {(values.mode === "fromZScore" || values.mode === "fromTScore") && (
        <div className="flex items-center space-x-2">
          <Switch
            id="twoTailed"
            checked={values.twoTailed}
            onCheckedChange={(v) => setValue("twoTailed", v)}
          />
          <Label htmlFor="twoTailed">{tMath("twoTailedTest")}</Label>
        </div>
      )}

      {pResult && (
        <div className="space-y-4">
          <OutputDisplay
            label={tMath("pValue")}
            value={pResult.pValue < 0.0001 ? "< 0.0001" : pResult.pValue.toFixed(6)}
            size="lg"
          />

          <div className="flex flex-wrap gap-2">
            {pResult.significantAt05 && <Badge variant="default">p &lt; 0.05</Badge>}
            {pResult.significantAt01 && <Badge variant="default">p &lt; 0.01</Badge>}
            {pResult.significantAt001 && <Badge variant="default">p &lt; 0.001</Badge>}
            {!pResult.significantAt05 && <Badge variant="outline">{tMath("notSignificant")}</Badge>}
          </div>

          <ResultGrid
            results={[
              { label: tMath("testStatistic"), value: pResult.testStatistic.toFixed(4) },
              { label: tMath("statisticType"), value: pResult.statisticType },
              {
                label: tMath("testTail"),
                value: pResult.twoTailed ? tMath("twoTailed") : tMath("oneTailed"),
              },
            ]}
          />

          <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
            <p className="text-sm font-medium">{tMath("interpretation")}:</p>
            <p className="text-sm text-muted-foreground">{pResult.interpretation}</p>
          </div>
        </div>
      )}

      {calculationError && <p className="mt-2 text-sm text-destructive">{calculationError}</p>}
    </div>
  );
}
