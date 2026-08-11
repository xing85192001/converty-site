"use client";

import { useTranslations } from "next-intl";
import { InputField, ResultGrid } from "@/components/converter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateHours, type HoursInput, type HoursResult } from "@/lib/converters/datetime/hours";
import { HoursFormSchema } from "@/lib/schemas/datetime";
import { createCalculatorStore } from "@/stores/calculator-store";

const useHoursStore = createCalculatorStore<HoursInput, HoursResult>({
  name: "hours-calculator",
  initialValues: {
    startTime: "",
    endTime: "",
    startDate: "",
    endDate: "",
  },
  calculate: calculateHours,
  schema: HoursFormSchema,
});

export function HoursCalculator() {
  const t = useTranslations("calculator.labels");
  const tSections = useTranslations("calculator.sections");
  const { values, setValue, result, calculationError } = useHoursStore();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("from")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              id="startDate"
              label={t("startDate")}
              type="date"
              value={values.startDate ?? ""}
              onChange={(value) => setValue("startDate", value)}
            />
            <InputField
              id="startTime"
              label={t("time")}
              type="time"
              value={values.startTime}
              onChange={(value) => setValue("startTime", value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("to")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              id="endDate"
              label={t("endDate")}
              type="date"
              value={values.endDate ?? ""}
              onChange={(value) => setValue("endDate", value)}
            />
            <InputField
              id="endTime"
              label={t("time")}
              type="time"
              value={values.endTime}
              onChange={(value) => setValue("endTime", value)}
            />
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{tSections("results")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-4 bg-primary/10 rounded-lg">
              <p className="text-3xl font-bold text-primary">{result.formattedDuration}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {result.totalHours} {t("hours")}
              </p>
            </div>
            <ResultGrid
              results={[
                { label: t("hours"), value: result.hours },
                { label: t("minutes"), value: result.minutes },
                { label: t("seconds"), value: result.seconds },
                { label: `${t("hours")} (${tSections("summary")})`, value: result.totalHours },
                {
                  label: `${t("minutes")} (${tSections("summary")})`,
                  value: result.totalMinutes.toLocaleString(),
                },
                {
                  label: `${t("seconds")} (${tSections("summary")})`,
                  value: result.totalSeconds.toLocaleString(),
                },
              ]}
              columns={3}
            />
          </CardContent>
        </Card>
      )}

      {calculationError && <p className="mt-2 text-sm text-destructive">{calculationError}</p>}
    </div>
  );
}
