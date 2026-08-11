import type { CalculationResult } from "@/types";

export interface TimeZoneInput {
  dateTime: string;
  fromTimezone: string;
  toTimezone: string;
}

export interface TimeZoneResult {
  convertedDateTime: Date;
  formattedDate: string;
  formattedTime: string;
  offset: string;
  offsetMinutes: number;
}

export interface TimezoneOption {
  value: string;
  label: string;
  region: string;
}

export type TimezoneRegionKey =
  | "africa"
  | "america"
  | "antarctica"
  | "arctic"
  | "asia"
  | "atlantic"
  | "australia"
  | "europe"
  | "indian"
  | "pacific"
  | "other";

export interface TimezoneGroup {
  region: string;
  regionKey: TimezoneRegionKey;
  timezones: TimezoneOption[];
}

// Get all IANA timezones from the browser's Intl API
function getAllTimezones(): string[] {
  try {
    return Intl.supportedValuesOf("timeZone");
  } catch {
    // Fallback for older browsers that don't support supportedValuesOf
    return [
      "UTC",
      "America/New_York",
      "America/Chicago",
      "America/Denver",
      "America/Los_Angeles",
      "America/Anchorage",
      "Pacific/Honolulu",
      "Europe/London",
      "Europe/Paris",
      "Europe/Berlin",
      "Europe/Moscow",
      "Asia/Dubai",
      "Asia/Kolkata",
      "Asia/Bangkok",
      "Asia/Shanghai",
      "Asia/Tokyo",
      "Australia/Sydney",
      "Pacific/Auckland",
    ];
  }
}

// Format a timezone value into a readable label
function formatTimezoneLabel(tz: string): string {
  // Replace underscores with spaces and format nicely
  const parts = tz.split("/");
  if (parts.length === 1) {
    return tz; // UTC, etc.
  }
  // Get city name (last part) and format it
  const city = parts[parts.length - 1].replace(/_/g, " ");
  return city;
}

// Get the region from a timezone string
function getRegion(tz: string): string {
  const parts = tz.split("/");
  if (parts.length === 1) {
    return "Other"; // UTC, etc.
  }
  return parts[0];
}

// Get current offset for a timezone (DST-aware)
function getTimezoneOffset(tz: string, date: Date = new Date()): string {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      timeZoneName: "shortOffset",
    });
    const parts = formatter.formatToParts(date);
    const offsetPart = parts.find((p) => p.type === "timeZoneName");
    return offsetPart?.value ?? "";
  } catch {
    return "";
  }
}

// Generate timezone options with labels and regions
export function getTimezoneOptions(): TimezoneOption[] {
  const timezones = getAllTimezones();
  const now = new Date();

  return timezones.map((tz) => {
    const offset = getTimezoneOffset(tz, now);
    const label = `${formatTimezoneLabel(tz)} (${offset || tz})`;
    return {
      value: tz,
      label,
      region: getRegion(tz),
    };
  });
}

// Get timezones grouped by region
export function getTimezonesByRegion(): TimezoneGroup[] {
  const options = getTimezoneOptions();
  const regionMap = new Map<string, TimezoneOption[]>();

  // Define region order with keys
  const regionOrder: Array<{ name: string; key: TimezoneRegionKey }> = [
    { name: "Africa", key: "africa" },
    { name: "America", key: "america" },
    { name: "Antarctica", key: "antarctica" },
    { name: "Arctic", key: "arctic" },
    { name: "Asia", key: "asia" },
    { name: "Atlantic", key: "atlantic" },
    { name: "Australia", key: "australia" },
    { name: "Europe", key: "europe" },
    { name: "Indian", key: "indian" },
    { name: "Pacific", key: "pacific" },
    { name: "Other", key: "other" },
  ];

  // Group timezones by region
  for (const option of options) {
    const existing = regionMap.get(option.region) ?? [];
    existing.push(option);
    regionMap.set(option.region, existing);
  }

  // Sort timezones within each region by label
  for (const [region, tzList] of regionMap) {
    tzList.sort((a, b) => a.label.localeCompare(b.label));
    regionMap.set(region, tzList);
  }

  // Build ordered result
  const result: TimezoneGroup[] = [];
  for (const { name: region, key: regionKey } of regionOrder) {
    const timezones = regionMap.get(region);
    if (timezones && timezones.length > 0) {
      result.push({ region, regionKey, timezones });
    }
  }

  // Add any regions not in the predefined order
  for (const [region, timezones] of regionMap) {
    const regionKey = regionOrder.find((r) => r.name === region)?.key;
    if (!regionKey && timezones.length > 0) {
      result.push({ region, regionKey: "other", timezones });
    }
  }

  return result;
}

// Legacy export for backward compatibility - flat list of common timezones
export const TIMEZONES = getTimezoneOptions();

// DST-aware timezone conversion using Intl.DateTimeFormat
export function calculateTimeZone(input: TimeZoneInput): CalculationResult<TimeZoneResult> {
  if (!input.dateTime || !input.fromTimezone || !input.toTimezone) {
    return { ok: false, error: "Date/time and both timezones are required", code: "INVALID_INPUT" };
  }

  // Parse the input datetime
  const inputDate = new Date(input.dateTime);
  if (Number.isNaN(inputDate.getTime())) {
    return { ok: false, error: "Invalid date/time format", code: "INVALID_INPUT" };
  }

  try {
    // Get the time in the source timezone as if the input represents that timezone
    // The input datetime-local doesn't have timezone info, so we interpret it as the source timezone
    const sourceFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: input.fromTimezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    const targetFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: input.toTimezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    // Get parts from both timezones to calculate the offset difference
    const sourceParts = sourceFormatter.formatToParts(inputDate);
    const targetParts = targetFormatter.formatToParts(inputDate);

    const getPartValue = (parts: Intl.DateTimeFormatPart[], type: string): string => {
      return parts.find((p) => p.type === type)?.value ?? "0";
    };

    // Create dates from the formatted parts
    const sourceTime = new Date(
      `${getPartValue(sourceParts, "year")}-${getPartValue(sourceParts, "month")}-${getPartValue(sourceParts, "day")}T${getPartValue(sourceParts, "hour")}:${getPartValue(sourceParts, "minute")}:${getPartValue(sourceParts, "second")}`
    );

    const targetTime = new Date(
      `${getPartValue(targetParts, "year")}-${getPartValue(targetParts, "month")}-${getPartValue(targetParts, "day")}T${getPartValue(targetParts, "hour")}:${getPartValue(targetParts, "minute")}:${getPartValue(targetParts, "second")}`
    );

    // Calculate offset difference in milliseconds
    const offsetDiffMs = targetTime.getTime() - sourceTime.getTime();

    // The converted datetime is the input time adjusted by the offset difference
    const convertedDateTime = new Date(inputDate.getTime() + offsetDiffMs);

    // Format results using target timezone
    const dateFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: input.toTimezone,
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const timeFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: input.toTimezone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

    // Get the offset string for the target timezone
    const offset = getTimezoneOffset(input.toTimezone, convertedDateTime);

    // Calculate offset in minutes
    const offsetFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: input.toTimezone,
      timeZoneName: "longOffset",
    });
    const offsetParts = offsetFormatter.formatToParts(convertedDateTime);
    const offsetStr = offsetParts.find((p) => p.type === "timeZoneName")?.value ?? "UTC";

    // Parse offset string like "GMT+05:30" or "GMT-08:00"
    let offsetMinutes = 0;
    const offsetMatch = offsetStr.match(/GMT([+-])(\d{2}):(\d{2})/);
    if (offsetMatch) {
      const sign = offsetMatch[1] === "+" ? 1 : -1;
      const hours = parseInt(offsetMatch[2], 10);
      const mins = parseInt(offsetMatch[3], 10);
      offsetMinutes = sign * (hours * 60 + mins);
    }

    return {
      ok: true,
      value: {
        convertedDateTime,
        formattedDate: dateFormatter.format(convertedDateTime),
        formattedTime: timeFormatter.format(convertedDateTime),
        offset: offset || offsetStr,
        offsetMinutes,
      },
    };
  } catch {
    return { ok: false, error: "Timezone conversion failed", code: "INVALID_INPUT" };
  }
}
