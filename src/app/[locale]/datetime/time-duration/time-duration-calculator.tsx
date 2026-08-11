"use client";

import { useTranslations } from "next-intl";
import { InputField, ResultGrid } from "@/components/converter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  calculateTimeDuration,
  type TimeDurationInput,
  type TimeDurationResult,
} from "@/lib/converters/datetime/time-duration";
import { TimeDurationFormSchema } from "@/lib/schemas/datetime";
import { createCalculatorStore } from "@/stores/calculator-store";

const useTimeDurationStore = createCalculatorStore<TimeDurationInput, TimeDurationResult>({
  name: "time-duration-calculator",
  initialValues: {
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
  },
  calculate: calculateTimeDuration,
  schema: TimeDurationFormSchema,
});

export function TimeDurationCalculator() {
  const t = useTranslations("calculator.labels");
  const tSections = useTranslations("calculator.sections");
  const tDatetime = useTranslations("calculator.datetime");
  const { values, setValue, result, calculationError } = useTimeDurationStore();

  const formatDuration = (): string => {
    if (!result?.timeComponents || result.timeComponents.length === 0) {
      return `0 ${tDatetime("units.seconds")}`;
    }

    const parts = result.timeComponents.map((component) => {
      const unitKey = component.count === 1 ? component.unitKey : `${component.unitKey}s`;
      return `${component.count} ${tDatetime(`units.${unitKey}`)}`;
    });

    return parts.join(`, ${tDatetime("and")} `);
  };

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
              value={values.startDate}
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
              value={values.endDate}
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
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{tSections("results")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 bg-primary/10 rounded-lg">
                <p className="text-xl font-bold text-primary">{formatDuration()}</p>
              </div>
              <ResultGrid
                results={[
                  { label: t("years"), value: result.years },
                  { label: t("months"), value: result.months },
                  { label: t("days"), value: result.days },
                  { label: t("hours"), value: result.hours },
                  { label: t("minutes"), value: result.minutes },
                  { label: t("seconds"), value: result.seconds },
                ]}
                columns={3}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{tSections("summary")}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResultGrid
                results={[
                  {
                    label: `${t("days")} (${tSections("summary")})`,
                    value: result.totalDays.toLocaleString(),
                  },
                  {
                    label: `${t("hours")} (${tSections("summary")})`,
                    value: result.totalHours.toLocaleString(),
                  },
                  {
                    label: `${t("minutes")} (${tSections("summary")})`,
                    value: result.totalMinutes.toLocaleString(),
                  },
                  {
                    label: `${t("seconds")} (${tSections("summary")})`,
                    value: result.totalSeconds.toLocaleString(),
                  },
                ]}
                columns={2}
              />
            </CardContent>
          </Card>
        </>
      )}

      {calculationError && <p className="mt-2 text-sm text-destructive">{calculationError}</p>}
    </div>
  );
}
