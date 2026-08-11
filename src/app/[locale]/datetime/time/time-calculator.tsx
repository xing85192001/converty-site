"use client";

import { useTranslations } from "next-intl";
import { InputField, ResultGrid } from "@/components/converter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { calculateTime, type TimeInput, type TimeResult } from "@/lib/converters/datetime/time";
import { TimeFormSchema } from "@/lib/schemas/datetime";
import { createCalculatorStore } from "@/stores/calculator-store";

const useTimeStore = createCalculatorStore<TimeInput, TimeResult>({
  name: "time-calculator",
  initialValues: {
    startTime: "",
    operation: "add",
    hours: "0",
    minutes: "0",
    seconds: "0",
  },
  calculate: calculateTime,
  schema: TimeFormSchema,
});

export function TimeCalculator() {
  const t = useTranslations("calculator.labels");
  const tSections = useTranslations("calculator.sections");
  const { values, setValue, result, errors, calculationError } = useTimeStore();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("time")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <InputField
            id="startTime"
            label={t("time")}
            type="time"
            value={values.startTime}
            onChange={(value) => setValue("startTime", value)}
          />

          <div className="space-y-2">
            <Label>{t("operation")}</Label>
            <Select
              value={values.operation}
              onValueChange={(value) => setValue("operation", value as "add" | "subtract")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="add">{t("add")}</SelectItem>
                <SelectItem value="subtract">{t("subtract")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {values.operation === "add" ? t("add") : t("subtract")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <InputField
              id="hours"
              label={t("hours")}
              type="number"
              value={values.hours}
              onChange={(value) => setValue("hours", value)}
              min={0}
              error={errors.hours}
            />
            <InputField
              id="minutes"
              label={t("minutes")}
              type="number"
              value={values.minutes}
              onChange={(value) => setValue("minutes", value)}
              min={0}
              error={errors.minutes}
            />
            <InputField
              id="seconds"
              label={t("seconds")}
              type="number"
              value={values.seconds}
              onChange={(value) => setValue("seconds", value)}
              min={0}
              error={errors.seconds}
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
              <p className="text-3xl font-bold text-primary">
                {result.formatted12h} {t(`time${result.period}`)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">{result.formatted24h} (24h)</p>
            </div>
            {result.crossesMidnight && (
              <div className="text-center p-2 bg-yellow-500/10 rounded-lg">
                <p className="text-sm font-medium">
                  {result.dayChange > 0
                    ? `+${result.dayChange} ${t("days")}`
                    : `${result.dayChange} ${t("days")}`}
                </p>
              </div>
            )}
            <ResultGrid
              results={[
                { label: "24h", value: result.formatted24h },
                { label: "12h", value: `${result.formatted12h} ${t(`time${result.period}`)}` },
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
