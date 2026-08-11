"use client";

import { useTranslations } from "next-intl";
import { InputField, OutputDisplay } from "@/components/converter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  calculateUnitConversion,
  getUnitCategories,
  getUnitCategoryById,
  type UnitConverterInput,
  type UnitConverterResult,
} from "@/lib/converters/engineering/unit-converter";
import { createCalculatorStore } from "@/stores/calculator-store";

const useUnitConverterStore = createCalculatorStore<UnitConverterInput, UnitConverterResult>({
  name: "engineering-unit-converter",
  initialValues: {
    categoryId: "pressure",
    fromUnit: "MPa",
    toUnit: "psi",
    value: 1,
  },
  calculate: (input) => calculateUnitConversion(input),
});

export default function UnitConverterCalculator() {
  const t = useTranslations("calculator.engineering");
  const tSections = useTranslations("calculator.sections");

  const { values, setValue, result, calculationError } = useUnitConverterStore();

  const categories = getUnitCategories();
  const currentCategory = getUnitCategoryById(values.categoryId);
  const units = currentCategory?.units ?? [];

  const handleCategoryChange = (categoryId: string) => {
    const cat = getUnitCategoryById(categoryId);
    if (cat && cat.units.length >= 2) {
      setValue("categoryId", categoryId);
      setValue("fromUnit", cat.units[0].id);
      setValue("toUnit", cat.units[1].id);
    }
  };

  const handleSwapUnits = () => {
    const from = values.fromUnit;
    const to = values.toUnit;
    setValue("fromUnit", to);
    setValue("toUnit", from);
  };

  return (
    <div className="space-y-6">
      {/* Category Selection */}
      <Card>
        <CardHeader>
          <CardTitle>{t("unitConverter.category")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 grid-cols-2 sm:grid-cols-5">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  values.categoryId === cat.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-card-foreground hover:bg-muted"
                }`}
              >
                {t(`unitConverter.categories.${cat.id}`)}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Conversion */}
      <Card>
        <CardHeader>
          <CardTitle>{tSections("input")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <InputField
            id="value"
            label={t("unitConverter.value")}
            value={values.value.toString()}
            onChange={(v) => setValue("value", parseFloat(v) || 0)}
            step="any"
          />

          <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr] items-end">
            <div className="space-y-2">
              <Label htmlFor="fromUnit">{t("unitConverter.from")}</Label>
              <Select value={values.fromUnit} onValueChange={(v) => setValue("fromUnit", v)}>
                <SelectTrigger id="fromUnit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {units.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.name} ({unit.symbol})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <button
              onClick={handleSwapUnits}
              className="rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-muted transition-colors mb-0.5"
              title={t("unitConverter.swap")}
            >
              ⇄
            </button>

            <div className="space-y-2">
              <Label htmlFor="toUnit">{t("unitConverter.to")}</Label>
              <Select value={values.toUnit} onValueChange={(v) => setValue("toUnit", v)}>
                <SelectTrigger id="toUnit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {units.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.name} ({unit.symbol})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Result */}
      {result && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>{tSections("results")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <OutputDisplay
                label={`${values.value} ${result.fromUnit.symbol} =`}
                value={result.formatted}
                unit={result.toUnit.symbol}
                size="lg"
              />

              <div className="rounded-lg border bg-card p-4 text-card-foreground">
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {t("unitConverter.conversionFactor")}
                </p>
                <p className="text-base font-mono">
                  1 {result.fromUnit.symbol} = {result.conversionFactor.toPrecision(10)}{" "}
                  {result.toUnit.symbol}
                </p>
              </div>

              {/* All conversions table */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  {t("unitConverter.allConversions")}
                </p>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {result.allConversions.map((conv) => (
                    <div
                      key={conv.symbol}
                      className={`rounded-md border px-3 py-2 text-sm ${
                        conv.symbol === result.toUnit.symbol
                          ? "border-primary bg-primary/10"
                          : "bg-muted/50"
                      }`}
                    >
                      <span className="font-semibold font-mono">
                        {Math.abs(conv.value) >= 1e10 ||
                        (Math.abs(conv.value) < 1e-6 && conv.value !== 0)
                          ? conv.value.toExponential(6)
                          : conv.value.toPrecision(8)}
                      </span>
                      <span className="text-muted-foreground ml-1">{conv.symbol}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Calculation Steps */}
          {result.steps.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t("calculationSteps")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  {result.steps.map((step, index) => (
                    <li key={index} className="text-muted-foreground">
                      {step}
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {calculationError && <p className="mt-2 text-sm text-destructive">{calculationError}</p>}
    </div>
  );
}
