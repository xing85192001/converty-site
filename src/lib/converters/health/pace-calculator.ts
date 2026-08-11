import type { CalculationResult } from "@/types";

export interface PaceInput {
  mode: "pace" | "time" | "distance";
  distance?: number; // km
  hours?: number;
  minutes?: number;
  seconds?: number;
  paceMinutes?: number;
  paceSeconds?: number;
}

export interface PaceResult {
  pace: { minutes: number; seconds: number }; // per km
  paceMile: { minutes: number; seconds: number }; // per mile
  speed: number; // km/h
  speedMph: number; // mph
  totalTime: { hours: number; minutes: number; seconds: number };
  distance: number; // km
  distanceMiles: number;
  splits: Array<{
    km: number;
    time: string;
  }>;
}

export function calculatePace(input: PaceInput): CalculationResult<PaceResult> {
  const {
    mode,
    distance,
    hours = 0,
    minutes = 0,
    seconds = 0,
    paceMinutes = 0,
    paceSeconds = 0,
  } = input;

  let totalSeconds: number;
  let distanceKm: number;
  let paceSecondsPerKm: number;

  if (mode === "pace") {
    // Calculate pace from distance and time
    if (!distance || distance <= 0) {
      return { ok: false, error: "Distance must be positive", code: "INVALID_INPUT" };
    }
    totalSeconds = hours * 3600 + minutes * 60 + seconds;
    if (totalSeconds <= 0) {
      return { ok: false, error: "Total time must be positive", code: "INVALID_INPUT" };
    }
    distanceKm = distance;
    paceSecondsPerKm = totalSeconds / distanceKm;
  } else if (mode === "time") {
    // Calculate time from distance and pace
    if (!distance || distance <= 0) {
      return { ok: false, error: "Distance must be positive", code: "INVALID_INPUT" };
    }
    paceSecondsPerKm = paceMinutes * 60 + paceSeconds;
    if (paceSecondsPerKm <= 0) {
      return { ok: false, error: "Pace must be positive", code: "INVALID_INPUT" };
    }
    distanceKm = distance;
    totalSeconds = paceSecondsPerKm * distanceKm;
  } else {
    // Calculate distance from time and pace
    totalSeconds = hours * 3600 + minutes * 60 + seconds;
    paceSecondsPerKm = paceMinutes * 60 + paceSeconds;
    if (totalSeconds <= 0 || paceSecondsPerKm <= 0) {
      return { ok: false, error: "Total time and pace must be positive", code: "INVALID_INPUT" };
    }
    distanceKm = totalSeconds / paceSecondsPerKm;
  }

  const paceMinutesResult = Math.floor(paceSecondsPerKm / 60);
  const paceSecondsResult = Math.round(paceSecondsPerKm % 60);

  // Convert to pace per mile (1 mile = 1.60934 km)
  const paceSecondsPerMile = paceSecondsPerKm * 1.60934;
  const paceMinutesMile = Math.floor(paceSecondsPerMile / 60);
  const paceSecondsMile = Math.round(paceSecondsPerMile % 60);

  // Speed in km/h and mph
  const speedKmh = (distanceKm / totalSeconds) * 3600;
  const speedMph = speedKmh / 1.60934;

  // Total time breakdown
  const totalHours = Math.floor(totalSeconds / 3600);
  const totalMinutes = Math.floor((totalSeconds % 3600) / 60);
  const totalSecs = Math.round(totalSeconds % 60);

  // Generate splits
  const splits: Array<{ km: number; time: string }> = [];
  for (let km = 1; km <= Math.ceil(distanceKm); km++) {
    const splitSeconds = paceSecondsPerKm * km;
    const h = Math.floor(splitSeconds / 3600);
    const m = Math.floor((splitSeconds % 3600) / 60);
    const s = Math.round(splitSeconds % 60);
    const time =
      h > 0
        ? `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
        : `${m}:${s.toString().padStart(2, "0")}`;
    splits.push({ km, time });
  }

  return {
    ok: true,
    value: {
      pace: { minutes: paceMinutesResult, seconds: paceSecondsResult },
      paceMile: { minutes: paceMinutesMile, seconds: paceSecondsMile },
      speed: speedKmh,
      speedMph,
      totalTime: { hours: totalHours, minutes: totalMinutes, seconds: totalSecs },
      distance: distanceKm,
      distanceMiles: distanceKm / 1.60934,
      splits,
    },
  };
}
