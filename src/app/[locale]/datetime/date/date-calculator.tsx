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
import { calculateDate, type DateInput, type DateResult } from "@/lib/converters/datetime/date";
import { DateFormSchema } from "@/lib/schemas/datetime";
import { createCalculatorStore } from "@/stores/calculator-store";

const useDateStore = createCalculatorStore<DateInput, DateResult>({
  name: "date-calculator",
  initialValues: {
    startDate: "",
    operation: "add",
    years: "0",
    months: "0",
    weeks: "0",
    days: "0",
  },
  calculate: calculateDate,
  schema: DateFormSchema,
});

export function DateCalculator() {
  const t = useTranslations("calculator.labels");
  const tSections = useTranslations("calculator.sections");
  const tResults = useTranslations("calculator.results");
  const tDatetime = useTranslations("calculator.datetime");
  const { values, setValue, result, errors, calculationError } = useDateStore();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("startDate")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <InputField
            id="startDate"
            label={t("startDate")}
            type="date"
            value={values.startDate}
            onChange={(value) => setValue("startDate", value)}
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <InputField
              id="years"
              label={t("years")}
              type="number"
              value={values.years}
              onChange={(value) => setValue("years", value)}
              min={0}
              error={errors.years}
            />
            <InputField
              id="months"
              label={t("months")}
              type="number"
              value={values.months}
              onChange={(value) => setValue("months", value)}
              min={0}
              error={errors.months}
            />
            <InputField
              id="weeks"
              label={t("weeks")}
              type="number"
              value={values.weeks}
              onChange={(value) => setValue("weeks", value)}
              min={0}
              error={errors.weeks}
            />
            <InputField
              id="days"
              label={t("days")}
              type="number"
              value={values.days}
              onChange={(value) => setValue("days", value)}
              min={0}
              error={errors.days}
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
              <p className="text-2xl font-bold text-primary">{result.formattedDate}</p>
            </div>
            <ResultGrid
              results={[
                { label: tResults("dayOfWeek"), value: tDatetime(`days.${result.dayOfWeekKey}`) },
                { label: tResults("daysDifference"), value: result.daysFromStart },
                {
                  label: tResults("isoDate"),
                  value: result.resultDate.toISOString().split("T")[0],
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
