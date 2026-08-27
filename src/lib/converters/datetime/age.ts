import type { CalculationResult } from "@/types";

export interface AgeInput {
  birthDate: string; // ISO date string (YYYY-MM-DD)
}

export interface AgeResult {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalWeeks: number;
  totalMonths: number;
  nextBirthday: {
    date: Date;
    daysUntil: number;
  };
  zodiacSign: string;
  chineseZodiac: string;
}

const ZODIAC_SIGNS = [
  { sign: "capricorn", start: [12, 22], end: [1, 19] },
  { sign: "aquarius", start: [1, 20], end: [2, 18] },
  { sign: "pisces", start: [2, 19], end: [3, 20] },
  { sign: "aries", start: [3, 21], end: [4, 19] },
  { sign: "taurus", start: [4, 20], end: [5, 20] },
  { sign: "gemini", start: [5, 21], end: [6, 20] },
  { sign: "cancer", start: [6, 21], end: [7, 22] },
  { sign: "leo", start: [7, 23], end: [8, 22] },
  { sign: "virgo", start: [8, 23], end: [9, 22] },
  { sign: "libra", start: [9, 23], end: [10, 22] },
  { sign: "scorpio", start: [10, 23], end: [11, 21] },
  { sign: "sagittarius", start: [11, 22], end: [12, 21] },
];

const CHINESE_ZODIAC = [
  "monkey",
  "rooster",
  "dog",
  "pig",
  "rat",
  "ox",
  "tiger",
  "rabbit",
  "dragon",
  "snake",
  "horse",
  "goat",
];

function getZodiacSign(month: number, day: number): string {
  for (const zodiac of ZODIAC_SIGNS) {
    const [startMonth, startDay] = zodiac.start;
    const [endMonth, endDay] = zodiac.end;

    if (startMonth === 12 && endMonth === 1) {
      // Special case for Capricorn (spans year boundary)
      if ((month === 12 && day >= startDay) || (month === 1 && day <= endDay)) {
        return zodiac.sign;
      }
    } else {
      if (
        (month === startMonth && day >= startDay) ||
        (month === endMonth && day <= endDay) ||
        (month > startMonth && month < endMonth)
      ) {
        return zodiac.sign;
      }
    }
  }
  return "unknown";
}

function getChineseZodiac(year: number): string {
  return CHINESE_ZODIAC[year % 12];
}

function getNextBirthday(birthDate: Date, today: Date): { date: Date; daysUntil: number } {
  const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());

  let nextBirthday: Date;
  if (thisYearBirthday > today) {
    nextBirthday = thisYearBirthday;
  } else {
    nextBirthday = new Date(today.getFullYear() + 1, birthDate.getMonth(), birthDate.getDate());
  }

  const diffTime = nextBirthday.getTime() - today.getTime();
  const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return { date: nextBirthday, daysUntil };
}

export function calculateAge(input: AgeInput): CalculationResult<AgeResult> {
  if (!input.birthDate) {
    return { ok: false, error: "Birth date is required", code: "INVALID_INPUT" };
  }

  const birthDate = new Date(input.birthDate);
  if (Number.isNaN(birthDate.getTime())) {
    return { ok: false, error: "Invalid date format", code: "INVALID_INPUT" };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if birth date is in the future
  if (birthDate > today) {
    return { ok: false, error: "Birth date cannot be in the future", code: "INVALID_INPUT" };
  }

  // Calculate years, months, days
  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  let days = today.getDate() - birthDate.getDate();

  if (days < 0) {
    months--;
    // Get days in the previous month
    const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    days += prevMonth.getDate();
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  // Calculate totals
  const diffTime = today.getTime() - birthDate.getTime();
  const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const totalWeeks = Math.floor(totalDays / 7);
  const totalMonths = years * 12 + months;

  // Get zodiac signs
  const zodiacSign = getZodiacSign(birthDate.getMonth() + 1, birthDate.getDate());
  const chineseZodiac = getChineseZodiac(birthDate.getFullYear());

  // Get next birthday
  const nextBirthday = getNextBirthday(birthDate, today);

  return {
    ok: true,
    value: {
      years,
      months,
      days,
      totalDays,
      totalWeeks,
      totalMonths,
      nextBirthday,
      zodiacSign,
      chineseZodiac,
    },
  };
}
