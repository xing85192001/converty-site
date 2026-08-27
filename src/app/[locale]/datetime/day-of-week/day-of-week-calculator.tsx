"use client";

import { useTranslations } from "next-intl";
import { InputField, ResultGrid } from "@/components/converter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  calculateDayOfWeek,
  type DayOfWeekInput,
  type DayOfWeekResult,
} from "@/lib/converters/datetime/day-of-week";
import { DayOfWeekFormSchema } from "@/lib/schemas/datetime";
import { createCalculatorStore } from "@/stores/calculator-store";

const useDayOfWeekStore = createCalculatorStore<DayOfWeekInput, DayOfWeekResult>({
  name: "day-of-week-calculator",
  initialValues: {
    date: "",
  },
  calculate: calculateDayOfWeek,
  schema: DayOfWeekFormSchema,
});

export function DayOfWeekCalculator() {
  const t = useTranslations("calculator.labels");
  const tSections = useTranslations("calculator.sections");
  const tResults = useTranslations("calculator.results");
  const tDatetime = useTranslations("calculator.datetime");
  const { values, setValue, result, calculationError } = useDayOfWeekStore();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("date")}</CardTitle>
        </CardHeader>
        <CardContent>
          <InputField
            id="date"
            label={t("date")}
            type="date"
            value={values.date}
            onChange={(value) => setValue("date", value)}
          />
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
                <p className="text-3xl font-bold text-primary">
                  {tDatetime(`days.${result.dayOfWeekKey}`)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {result.isWeekend ? tDatetime("weekend") : tDatetime("weekday")}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{tSections("details")}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResultGrid
                results={[
                  {
                    label: tResults("dayNumber"),
                    value: `${result.dayNumber} (0=${tDatetime("days.sunday").slice(0, 3)}, 6=${tDatetime("days.saturday").slice(0, 3)})`,
                  },
                  { label: tResults("weekNumber"), value: result.weekNumber },
                  { label: tResults("dayOfYear"), value: result.dayOfYear },
                  { label: tResults("daysLeftInYear"), value: result.daysLeftInYear },
                  { label: tResults("quarter"), value: `Q${result.quarter}` },
                  {
                    label: tResults("type"),
                    value: result.isWeekend ? tDatetime("weekend") : tDatetime("weekday"),
                  },
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
