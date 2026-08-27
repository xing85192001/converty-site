"use client";

import { useTranslations } from "next-intl";
import { InputField, ResultGrid } from "@/components/converter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  calculateDayCounter,
  type DayCounterInput,
  type DayCounterResult,
} from "@/lib/converters/datetime/day-counter";
import { DayCounterFormSchema } from "@/lib/schemas/datetime";
import { createCalculatorStore } from "@/stores/calculator-store";

const useDayCounterStore = createCalculatorStore<DayCounterInput, DayCounterResult>({
  name: "day-counter-calculator",
  initialValues: {
    startDate: "",
    endDate: "",
    includeEndDate: true,
  },
  calculate: calculateDayCounter,
  schema: DayCounterFormSchema,
});

export function DayCounterCalculator() {
  const t = useTranslations("calculator.labels");
  const tSections = useTranslations("calculator.sections");
  const tResults = useTranslations("calculator.results");
  const tDatetime = useTranslations("calculator.datetime");
  const { values, setValue, result, calculationError } = useDayCounterStore();

  // Format duration using translations with plural support
  const formatDuration = (weeks: number, days: number) => {
    const parts: string[] = [];
    if (weeks > 0) {
      parts.push(`${weeks} ${weeks === 1 ? tDatetime("units.week") : tDatetime("units.weeks")}`);
    }
    if (days > 0) {
      parts.push(`${days} ${days === 1 ? tDatetime("units.day") : tDatetime("units.days")}`);
    }
    if (parts.length === 0) {
      return `0 ${tDatetime("units.days")}`;
    }
    return parts.join(` ${tDatetime("and")} `);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{tSections("input")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              id="startDate"
              label={t("startDate")}
              type="date"
              value={values.startDate}
              onChange={(value) => setValue("startDate", value)}
            />
            <InputField
              id="endDate"
              label={t("endDate")}
              type="date"
              value={values.endDate}
              onChange={(value) => setValue("endDate", value)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="includeEndDate"
              checked={values.includeEndDate}
              onCheckedChange={(checked) => setValue("includeEndDate", checked)}
            />
            <Label htmlFor="includeEndDate">{t("endDate")}</Label>
          </div>
        </CardContent>
      </Card>

      {result && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{tSections("results")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 bg-primary/10 rounded-lg">
                <p className="text-4xl font-bold text-primary">{result.totalDays}</p>
                <p className="text-sm text-muted-foreground mt-1">{t("days")}</p>
              </div>
              <div className="text-center p-2 bg-muted rounded-lg">
                <p className="text-lg font-medium">
                  {formatDuration(result.weeks, result.remainingDays)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{tSections("breakdown")}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResultGrid
                results={[
                  { label: tResults("totalDays"), value: result.totalDays },
                  { label: tResults("businessDays"), value: result.businessDays },
                  { label: tResults("weekendDays"), value: result.weekendDays },
                  { label: t("weeks"), value: result.weeks },
                  { label: tResults("remainingDays"), value: result.remainingDays },
                  { label: t("months"), value: result.months },
                ]}
                columns={3}
              />
            </CardContent>
          </Card>
        </>
      )}

      {calculationError && <p className="mt-2 text-sm text-destructive">{calculationError}</p>}
    </div>
  );
}
