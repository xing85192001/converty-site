"use client";

import { useTranslations } from "next-intl";
import { InputField, ResultGrid } from "@/components/converter";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  calculatePace,
  type PaceInput,
  type PaceResult,
} from "@/lib/converters/health/pace-calculator";
import { PaceFormSchema } from "@/lib/schemas/health";
import { createCalculatorStore } from "@/stores/calculator-store";

interface FormValues {
  mode: "pace" | "time" | "distance";
  distance: string;
  hours: string;
  minutes: string;
  seconds: string;
  paceMinutes: string;
  paceSeconds: string;
}

const useStore = createCalculatorStore<FormValues, PaceResult | null>({
  name: "pace-calculator",
  initialValues: {
    mode: "pace",
    distance: "10",
    hours: "0",
    minutes: "50",
    seconds: "0",
    paceMinutes: "5",
    paceSeconds: "0",
  },
  schema: PaceFormSchema,
  calculate: (vals) => {
    const input: PaceInput = {
      mode: vals.mode,
      distance: parseFloat(vals.distance) || 0,
      hours: parseInt(vals.hours) || 0,
      minutes: parseInt(vals.minutes) || 0,
      seconds: parseInt(vals.seconds) || 0,
      paceMinutes: parseInt(vals.paceMinutes) || 0,
      paceSeconds: parseInt(vals.paceSeconds) || 0,
    };
    return calculatePace(input);
  },
});

export function PaceCalculatorComponent() {
  const t = useTranslations("calculator.labels");
  const tResults = useTranslations("calculator.results");

  const { values, setValue, result, errors, calculationError } = useStore();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>{t("calculationMode")}</Label>
        <Select
          value={values.mode}
          onValueChange={(v) => setValue("mode", v as "pace" | "time" | "distance")}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pace">{t("calculatePace")}</SelectItem>
            <SelectItem value="time">{t("calculateTime")}</SelectItem>
            <SelectItem value="distance">{t("calculateDistance")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {values.mode !== "distance" && (
          <InputField
            id="distance"
            label={t("distanceKm")}
            value={values.distance}
            onChange={(v) => setValue("distance", v)}
            error={errors.distance}
            min={0}
            step="0.1"
            placeholder="10"
          />
        )}

        {values.mode !== "pace" && (
          <div className="space-y-2">
            <Label>{t("pacePerKm")}</Label>
            <div className="flex gap-2">
              <InputField
                id="paceMinutes"
                label={t("minutes")}
                value={values.paceMinutes}
                onChange={(v) => setValue("paceMinutes", v)}
                error={errors.paceMinutes}
                min={0}
                max={59}
                step="1"
                placeholder="5"
              />
              <InputField
                id="paceSeconds"
                label={t("seconds")}
                value={values.paceSeconds}
                onChange={(v) => setValue("paceSeconds", v)}
                error={errors.paceSeconds}
                min={0}
                max={59}
                step="1"
                placeholder="0"
              />
            </div>
          </div>
        )}

        {values.mode !== "time" && (
          <div className="space-y-2">
            <Label>{t("time")}</Label>
            <div className="flex gap-2">
              <InputField
                id="hours"
                label={t("hours")}
                value={values.hours}
                onChange={(v) => setValue("hours", v)}
                error={errors.hours}
                min={0}
                step="1"
                placeholder="0"
              />
              <InputField
                id="minutes"
                label={t("minutes")}
                value={values.minutes}
                onChange={(v) => setValue("minutes", v)}
                error={errors.minutes}
                min={0}
                max={59}
                step="1"
                placeholder="50"
              />
              <InputField
                id="seconds"
                label={t("seconds")}
                value={values.seconds}
                onChange={(v) => setValue("seconds", v)}
                error={errors.seconds}
                min={0}
                max={59}
                step="1"
                placeholder="0"
              />
            </div>
          </div>
        )}
      </div>

      {result && (
        <div className="space-y-4">
          <ResultGrid
            results={[
              {
                label: tResults("pacePerKm"),
                value: `${result.pace.minutes}:${result.pace.seconds.toString().padStart(2, "0")}`,
                unit: "/km",
              },
              {
                label: tResults("pacePerMile"),
                value: `${result.paceMile.minutes}:${result.paceMile.seconds.toString().padStart(2, "0")}`,
                unit: "/mi",
              },
              {
                label: tResults("speed"),
                value: result.speed.toFixed(1),
                unit: "km/h",
              },
              {
                label: tResults("speedMph"),
                value: result.speedMph.toFixed(1),
                unit: "mph",
              },
              {
                label: tResults("totalTime"),
                value: `${result.totalTime.hours}:${result.totalTime.minutes.toString().padStart(2, "0")}:${result.totalTime.seconds.toString().padStart(2, "0")}`,
                unit: "",
              },
              {
                label: tResults("totalDistance"),
                value: result.distance.toFixed(2),
                unit: "km",
              },
            ]}
          />

          {result.splits.length > 0 && result.splits.length <= 50 && (
            <>
              <h3 className="text-lg font-semibold">{tResults("splits")}</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead>
                    <tr>
                      <th className="px-3 py-2 text-left text-sm font-semibold">Km</th>
                      <th className="px-3 py-2 text-left text-sm font-semibold">{t("time")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {result.splits.map((split) => (
                      <tr key={split.km}>
                        <td className="px-3 py-2 text-sm">{split.km}</td>
                        <td className="px-3 py-2 text-sm font-medium">{split.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {calculationError && <p className="mt-2 text-sm text-destructive">{calculationError}</p>}
    </div>
  );
}
