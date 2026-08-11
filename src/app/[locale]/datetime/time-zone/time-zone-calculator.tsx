"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { InputField, ResultGrid } from "@/components/converter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  calculateTimeZone,
  getTimezonesByRegion,
  type TimeZoneInput,
  type TimeZoneResult,
  type TimezoneGroup,
} from "@/lib/converters/datetime/time-zone";
import { TimeZoneFormSchema } from "@/lib/schemas/datetime";
import { cn } from "@/lib/utils";
import { createCalculatorStore } from "@/stores/calculator-store";

const useTimeZoneStore = createCalculatorStore<TimeZoneInput, TimeZoneResult>({
  name: "time-zone-calculator",
  initialValues: {
    dateTime: "",
    fromTimezone: "America/New_York",
    toTimezone: "Europe/London",
  },
  calculate: calculateTimeZone,
  schema: TimeZoneFormSchema,
});

interface TimezoneComboboxProps {
  value: string;
  onValueChange: (value: string) => void;
  groups: TimezoneGroup[];
  label: string;
  placeholder?: string;
  tDatetime: (key: string) => string;
}

function TimezoneCombobox({
  value,
  onValueChange,
  groups,
  label,
  placeholder = "Search timezone...",
  tDatetime,
}: TimezoneComboboxProps) {
  const [open, setOpen] = useState(false);

  // Find the current timezone's label for display
  const currentLabel = useMemo(() => {
    for (const group of groups) {
      const found = group.timezones.find((tz) => tz.value === value);
      if (found) return found.label;
    }
    return value;
  }, [groups, value]);

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal"
          >
            <span className="truncate">{currentLabel}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command>
            <CommandInput placeholder={placeholder} />
            <CommandList>
              <CommandEmpty>No timezone found.</CommandEmpty>
              {groups.map((group) => (
                <CommandGroup key={group.region} heading={tDatetime(`regions.${group.regionKey}`)}>
                  {group.timezones.map((tz) => (
                    <CommandItem
                      key={tz.value}
                      value={`${tz.value} ${tz.label}`}
                      onSelect={() => {
                        onValueChange(tz.value);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === tz.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {tz.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function TimeZoneCalculator() {
  const t = useTranslations("calculator.labels");
  const tSections = useTranslations("calculator.sections");
  const tDatetime = useTranslations("calculator.datetime");
  const { values, setValue, result, calculationError } = useTimeZoneStore();

  // Get timezone groups (memoized since it's computed)
  const timezoneGroups = useMemo(() => getTimezonesByRegion(), []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("from")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <InputField
            id="dateTime"
            label={t("date")}
            type="datetime-local"
            value={values.dateTime}
            onChange={(value) => setValue("dateTime", value)}
          />

          <TimezoneCombobox
            value={values.fromTimezone}
            onValueChange={(value) => setValue("fromTimezone", value)}
            groups={timezoneGroups}
            label={t("timezone")}
            tDatetime={tDatetime}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("to")}</CardTitle>
        </CardHeader>
        <CardContent>
          <TimezoneCombobox
            value={values.toTimezone}
            onValueChange={(value) => setValue("toTimezone", value)}
            groups={timezoneGroups}
            label={t("timezone")}
            tDatetime={tDatetime}
          />
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{tSections("results")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-4 bg-primary/10 rounded-lg">
              <p className="text-2xl font-bold text-primary">{result.formattedTime}</p>
              <p className="text-sm text-muted-foreground mt-1">{result.formattedDate}</p>
            </div>
            <ResultGrid
              results={[
                { label: t("timezone"), value: result.offset },
                { label: t("date"), value: result.convertedDateTime.toISOString().split("T")[0] },
              ]}
              columns={2}
            />
          </CardContent>
        </Card>
      )}

      {calculationError && <p className="mt-2 text-sm text-destructive">{calculationError}</p>}
    </div>
  );
}
