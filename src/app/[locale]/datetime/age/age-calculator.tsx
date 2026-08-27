"use client";

import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { CsvExportButton, InputField, PdfExportButton, ResultGrid } from "@/components/converter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type AgeInput, type AgeResult, calculateAge } from "@/lib/converters/datetime/age";
import { AgeFormSchema } from "@/lib/schemas/datetime";
import type { CsvRow } from "@/lib/utils/csv-export";
import { createCalculatorStore } from "@/stores/calculator-store";

const useAgeStore = createCalculatorStore<AgeInput, AgeResult>({
  name: "age-calculator",
  initialValues: { birthDate: "" },
  calculate: calculateAge,
  schema: AgeFormSchema,
});

export function AgeCalculator() {
  const t = useTranslations("calculator.labels");
  const tSections = useTranslations("calculator.sections");
  const tZodiacWestern = useTranslations("calculator.zodiac.western");
  const tZodiacChinese = useTranslations("calculator.zodiac.chinese");
  const { values, setValue, result, calculationError } = useAgeStore();

  const pdfSections = useMemo(() => {
    if (!result) return [];
    return [
      {
        title: t("age"),
        items: [
          { label: t("years"), value: result.years },
          { label: t("months"), value: result.months },
          { label: t("days"), value: result.days },
        ],
      },
      {
        title: tSections("summary"),
        items: [
          {
            label: `${t("days")} (${tSections("summary")})`,
            value: result.totalDays.toLocaleString(),
          },
          {
            label: `${t("weeks")} (${tSections("summary")})`,
            value: result.totalWeeks.toLocaleString(),
          },
          { label: `${t("months")} (${tSections("summary")})`, value: result.totalMonths },
        ],
      },
      {
        title: tSections("details"),
        items: [
          { label: t("zodiacSign"), value: tZodiacWestern(result.zodiacSign) },
          { label: t("chineseZodiac"), value: tZodiacChinese(result.chineseZodiac) },
          { label: t("daysUntilBirthday"), value: result.nextBirthday.daysUntil },
        ],
      },
    ];
  }, [result, t, tSections, tZodiacWestern, tZodiacChinese]);

  const csvData: CsvRow[] = useMemo(() => {
    if (!result) return [];
    return [
      { Field: t("birthDate"), Value: values.birthDate, Unit: "" },
      { Field: t("years"), Value: result.years, Unit: "" },
      { Field: t("months"), Value: result.months, Unit: "" },
      { Field: t("days"), Value: result.days, Unit: "" },
      { Field: `${t("days")} (${tSections("summary")})`, Value: result.totalDays, Unit: "" },
      { Field: `${t("weeks")} (${tSections("summary")})`, Value: result.totalWeeks, Unit: "" },
      { Field: `${t("months")} (${tSections("summary")})`, Value: result.totalMonths, Unit: "" },
      { Field: t("zodiacSign"), Value: tZodiacWestern(result.zodiacSign), Unit: "" },
      { Field: t("chineseZodiac"), Value: tZodiacChinese(result.chineseZodiac), Unit: "" },
      { Field: t("daysUntilBirthday"), Value: result.nextBirthday.daysUntil, Unit: "" },
    ];
  }, [result, values.birthDate, t, tSections, tZodiacWestern, tZodiacChinese]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("birthDate")}</CardTitle>
        </CardHeader>
        <CardContent>
          <InputField
            id="birthDate"
            label={t("birthDate")}
            type="date"
            value={values.birthDate}
            onChange={(value) => setValue("birthDate", value)}
          />
        </CardContent>
      </Card>

      {result && (
        <>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">{t("age")}</CardTitle>
              <div className="flex gap-2">
                <PdfExportButton
                  sections={pdfSections}
                  options={{
                    title: t("age"),
                    subtitle: `${t("birthDate")}: ${values.birthDate}`,
                  }}
                />
                <CsvExportButton data={csvData} filename="age-calculator" />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center p-4 bg-primary/10 rounded-lg">
                <p className="text-3xl font-bold text-primary">
                  {result.years} {t("years")}, {result.months} {t("months")}, {result.days}{" "}
                  {t("days")}
                </p>
              </div>

              <ResultGrid
                results={[
                  {
                    label: `${t("days")} (${tSections("summary")})`,
                    value: result.totalDays.toLocaleString(),
                  },
                  {
                    label: `${t("weeks")} (${tSections("summary")})`,
                    value: result.totalWeeks.toLocaleString(),
                  },
                  { label: `${t("months")} (${tSections("summary")})`, value: result.totalMonths },
                ]}
                columns={3}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{tSections("details")}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResultGrid
                results={[
                  { label: t("zodiacSign"), value: tZodiacWestern(result.zodiacSign) },
                  { label: t("chineseZodiac"), value: tZodiacChinese(result.chineseZodiac) },
                  {
                    label: t("nextBirthday"),
                    value: result.nextBirthday.date.toLocaleDateString(),
                  },
                  { label: t("daysUntilBirthday"), value: result.nextBirthday.daysUntil },
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
