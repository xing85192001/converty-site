/**
 * Sun Position & Twilight Calculator
 * Based on NOAA Solar Calculator algorithms
 * https://gml.noaa.gov/grad/solcalc/calcdetails.html
 */

export interface SunTimes {
  sunrise: Date | null;
  sunset: Date | null;
  solarNoon: Date;
  goldenHourMorningStart: Date | null;
  goldenHourMorningEnd: Date | null;
  goldenHourEveningStart: Date | null;
  goldenHourEveningEnd: Date | null;
  blueHourMorningStart: Date | null;
  blueHourMorningEnd: Date | null;
  blueHourEveningStart: Date | null;
  blueHourEveningEnd: Date | null;
  civilTwilightStart: Date | null;
  civilTwilightEnd: Date | null;
  nauticalTwilightStart: Date | null;
  nauticalTwilightEnd: Date | null;
  astronomicalTwilightStart: Date | null;
  astronomicalTwilightEnd: Date | null;
}

export interface SunPosition {
  altitude: number; // degrees above horizon
  azimuth: number; // degrees from north
}

export interface LightPhase {
  name: string;
  description: string;
  startsAt: Date | null;
  endsAt: Date | null;
  isCurrent: boolean;
}

// Convert degrees to radians
const toRad = (deg: number): number => (deg * Math.PI) / 180;

// Convert radians to degrees
const toDeg = (rad: number): number => (rad * 180) / Math.PI;

// Get Julian Day from Date
function getJulianDay(date: Date): number {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day =
    date.getUTCDate() +
    date.getUTCHours() / 24 +
    date.getUTCMinutes() / 1440 +
    date.getUTCSeconds() / 86400;

  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;

  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

// Get Julian Century from Julian Day
function getJulianCentury(jd: number): number {
  return (jd - 2451545) / 36525;
}

// Calculate geometric mean longitude of the sun (degrees)
function getSunMeanLongitude(T: number): number {
  let L0 = 280.46646 + T * (36000.76983 + 0.0003032 * T);
  while (L0 > 360) L0 -= 360;
  while (L0 < 0) L0 += 360;
  return L0;
}

// Calculate geometric mean anomaly of the sun (degrees)
function getSunMeanAnomaly(T: number): number {
  return 357.52911 + T * (35999.05029 - 0.0001537 * T);
}

// Calculate eccentricity of Earth's orbit
function getEarthOrbitEccentricity(T: number): number {
  return 0.016708634 - T * (0.000042037 + 0.0000001267 * T);
}

// Calculate sun equation of center (degrees)
function getSunEquationOfCenter(T: number): number {
  const M = toRad(getSunMeanAnomaly(T));
  return (
    Math.sin(M) * (1.914602 - T * (0.004817 + 0.000014 * T)) +
    Math.sin(2 * M) * (0.019993 - 0.000101 * T) +
    Math.sin(3 * M) * 0.000289
  );
}

// Calculate sun true longitude (degrees)
function getSunTrueLongitude(T: number): number {
  return getSunMeanLongitude(T) + getSunEquationOfCenter(T);
}

// Calculate sun apparent longitude (degrees)
function getSunApparentLongitude(T: number): number {
  const O = getSunTrueLongitude(T);
  const omega = 125.04 - 1934.136 * T;
  return O - 0.00569 - 0.00478 * Math.sin(toRad(omega));
}

// Calculate mean obliquity of the ecliptic (degrees)
function getMeanObliquityOfEcliptic(T: number): number {
  const seconds = 21.448 - T * (46.815 + T * (0.00059 - T * 0.001813));
  return 23 + (26 + seconds / 60) / 60;
}

// Calculate corrected obliquity (degrees)
function getObliquityCorrection(T: number): number {
  const e0 = getMeanObliquityOfEcliptic(T);
  const omega = 125.04 - 1934.136 * T;
  return e0 + 0.00256 * Math.cos(toRad(omega));
}

// Calculate sun declination (degrees)
function getSunDeclination(T: number): number {
  const e = toRad(getObliquityCorrection(T));
  const lambda = toRad(getSunApparentLongitude(T));
  return toDeg(Math.asin(Math.sin(e) * Math.sin(lambda)));
}

// Calculate equation of time (minutes)
function getEquationOfTime(T: number): number {
  const e = getEarthOrbitEccentricity(T);
  const L0 = toRad(getSunMeanLongitude(T));
  const M = toRad(getSunMeanAnomaly(T));
  const obliq = toRad(getObliquityCorrection(T));

  let y = Math.tan(obliq / 2);
  y *= y;

  const sin2L0 = Math.sin(2 * L0);
  const sinM = Math.sin(M);
  const cos2L0 = Math.cos(2 * L0);
  const sin4L0 = Math.sin(4 * L0);
  const sin2M = Math.sin(2 * M);

  const Etime =
    y * sin2L0 -
    2 * e * sinM +
    4 * e * y * sinM * cos2L0 -
    0.5 * y * y * sin4L0 -
    1.25 * e * e * sin2M;

  return toDeg(Etime) * 4; // minutes
}

// Calculate hour angle for a given sun altitude (degrees)
function getHourAngle(lat: number, decl: number, altitude: number): number | null {
  const latRad = toRad(lat);
  const declRad = toRad(decl);
  const altRad = toRad(altitude);

  const cosHA =
    (Math.sin(altRad) - Math.sin(latRad) * Math.sin(declRad)) /
    (Math.cos(latRad) * Math.cos(declRad));

  if (cosHA < -1 || cosHA > 1) {
    return null; // Sun never reaches this altitude
  }

  return toDeg(Math.acos(cosHA));
}

// Calculate time for a given sun altitude
function getTimeForAltitude(
  date: Date,
  lat: number,
  lng: number,
  altitude: number,
  rising: boolean
): Date | null {
  const jd = getJulianDay(date);
  const T = getJulianCentury(jd);
  const decl = getSunDeclination(T);
  const eqTime = getEquationOfTime(T);

  const hourAngle = getHourAngle(lat, decl, altitude);
  if (hourAngle === null) return null;

  const noon = 720 - 4 * lng - eqTime;
  const offset = rising ? -hourAngle * 4 : hourAngle * 4;
  const timeMinutes = noon + offset;

  const result = new Date(date);
  result.setUTCHours(0, 0, 0, 0);
  result.setUTCMinutes(Math.round(timeMinutes));

  return result;
}

/**
 * Calculate sun position (altitude and azimuth) for a given date and location
 */
export function getSunPosition(date: Date, lat: number, lng: number): SunPosition {
  const jd = getJulianDay(date);
  const T = getJulianCentury(jd);
  const decl = getSunDeclination(T);
  const eqTime = getEquationOfTime(T);

  // Calculate hour angle
  const minutes = date.getUTCHours() * 60 + date.getUTCMinutes() + date.getUTCSeconds() / 60;
  const trueSolarTime = minutes + eqTime + 4 * lng;
  let hourAngle = trueSolarTime / 4 - 180;
  if (hourAngle < -180) hourAngle += 360;

  const latRad = toRad(lat);
  const declRad = toRad(decl);
  const haRad = toRad(hourAngle);

  // Calculate altitude
  const sinAlt =
    Math.sin(latRad) * Math.sin(declRad) + Math.cos(latRad) * Math.cos(declRad) * Math.cos(haRad);
  const altitude = toDeg(Math.asin(sinAlt));

  // Calculate azimuth
  const cosAz =
    (Math.sin(declRad) - Math.sin(latRad) * sinAlt) /
    (Math.cos(latRad) * Math.cos(toRad(altitude)));
  let azimuth = toDeg(Math.acos(Math.max(-1, Math.min(1, cosAz))));

  if (hourAngle > 0) {
    azimuth = 360 - azimuth;
  }

  return { altitude, azimuth };
}

/**
 * Calculate all sun times for a given date and location
 * Sun altitude angles:
 * - Sunrise/Sunset: -0.833° (accounting for refraction and sun's diameter)
 * - Civil twilight: -6°
 * - Nautical twilight: -12°
 * - Astronomical twilight: -18°
 * - Golden hour: 0° to 6°
 * - Blue hour: -6° to -4°
 */
export function getSunTimes(date: Date, lat: number, lng: number): SunTimes {
  const jd = getJulianDay(date);
  const T = getJulianCentury(jd);
  const eqTime = getEquationOfTime(T);

  // Calculate solar noon
  const noonMinutes = 720 - 4 * lng - eqTime;
  const solarNoon = new Date(date);
  solarNoon.setUTCHours(0, 0, 0, 0);
  solarNoon.setUTCMinutes(Math.round(noonMinutes));

  return {
    solarNoon,

    // Sunrise/Sunset (sun center at -0.833°)
    sunrise: getTimeForAltitude(date, lat, lng, -0.833, true),
    sunset: getTimeForAltitude(date, lat, lng, -0.833, false),

    // Golden hour (0° to 6°)
    goldenHourMorningStart: getTimeForAltitude(date, lat, lng, -0.833, true), // sunrise
    goldenHourMorningEnd: getTimeForAltitude(date, lat, lng, 6, true),
    goldenHourEveningStart: getTimeForAltitude(date, lat, lng, 6, false),
    goldenHourEveningEnd: getTimeForAltitude(date, lat, lng, -0.833, false), // sunset

    // Blue hour (-6° to -4°)
    blueHourMorningStart: getTimeForAltitude(date, lat, lng, -6, true),
    blueHourMorningEnd: getTimeForAltitude(date, lat, lng, -4, true),
    blueHourEveningStart: getTimeForAltitude(date, lat, lng, -4, false),
    blueHourEveningEnd: getTimeForAltitude(date, lat, lng, -6, false),

    // Civil twilight (-6°)
    civilTwilightStart: getTimeForAltitude(date, lat, lng, -6, true),
    civilTwilightEnd: getTimeForAltitude(date, lat, lng, -6, false),

    // Nautical twilight (-12°)
    nauticalTwilightStart: getTimeForAltitude(date, lat, lng, -12, true),
    nauticalTwilightEnd: getTimeForAltitude(date, lat, lng, -12, false),

    // Astronomical twilight (-18°)
    astronomicalTwilightStart: getTimeForAltitude(date, lat, lng, -18, true),
    astronomicalTwilightEnd: getTimeForAltitude(date, lat, lng, -18, false),
  };
}

/**
 * Get current light phase based on sun altitude
 */
export function getCurrentLightPhase(date: Date, lat: number, lng: number): LightPhase {
  const position = getSunPosition(date, lat, lng);
  const times = getSunTimes(date, lat, lng);
  const alt = position.altitude;

  if (alt >= 6) {
    return {
      name: "Daylight",
      description: "Full daylight, sun above 6°",
      startsAt: times.goldenHourMorningEnd,
      endsAt: times.goldenHourEveningStart,
      isCurrent: true,
    };
  } else if (alt >= -0.833) {
    // Check if morning or evening golden hour
    const isAfternoon = date.getTime() > times.solarNoon.getTime();
    return {
      name: "Golden Hour",
      description: "Warm, golden light ideal for photography",
      startsAt: isAfternoon ? times.goldenHourEveningStart : times.goldenHourMorningStart,
      endsAt: isAfternoon ? times.goldenHourEveningEnd : times.goldenHourMorningEnd,
      isCurrent: true,
    };
  } else if (alt >= -4) {
    const isAfternoon = date.getTime() > times.solarNoon.getTime();
    return {
      name: "Blue Hour",
      description: "Deep blue sky, excellent for cityscapes",
      startsAt: isAfternoon ? times.blueHourEveningStart : times.blueHourMorningStart,
      endsAt: isAfternoon ? times.blueHourEveningEnd : times.blueHourMorningEnd,
      isCurrent: true,
    };
  } else if (alt >= -6) {
    return {
      name: "Civil Twilight",
      description: "Sky is bright, artificial light not needed outdoors",
      startsAt: times.civilTwilightStart,
      endsAt: times.civilTwilightEnd,
      isCurrent: true,
    };
  } else if (alt >= -12) {
    return {
      name: "Nautical Twilight",
      description: "Horizon still visible, sky glowing",
      startsAt: times.nauticalTwilightStart,
      endsAt: times.nauticalTwilightEnd,
      isCurrent: true,
    };
  } else if (alt >= -18) {
    return {
      name: "Astronomical Twilight",
      description: "Sky nearly dark, faint stars visible",
      startsAt: times.astronomicalTwilightStart,
      endsAt: times.astronomicalTwilightEnd,
      isCurrent: true,
    };
  } else {
    return {
      name: "Night",
      description: "Complete darkness, ideal for astrophotography",
      startsAt: times.astronomicalTwilightEnd,
      endsAt: times.astronomicalTwilightStart,
      isCurrent: true,
    };
  }
}

/**
 * Get all light phases for a day with timing
 */
export function getLightPhasesForDay(date: Date, lat: number, lng: number): LightPhase[] {
  const times = getSunTimes(date, lat, lng);
  const now = new Date();

  const phases: LightPhase[] = [];

  // Morning phases (in chronological order)
  if (times.astronomicalTwilightStart) {
    phases.push({
      name: "Night (ends)",
      description: "Complete darkness ends",
      startsAt: null,
      endsAt: times.astronomicalTwilightStart,
      isCurrent: false,
    });
    phases.push({
      name: "Astronomical Twilight",
      description: "Sky nearly dark, faint stars visible",
      startsAt: times.astronomicalTwilightStart,
      endsAt: times.nauticalTwilightStart,
      isCurrent: false,
    });
  }

  if (times.nauticalTwilightStart) {
    phases.push({
      name: "Nautical Twilight",
      description: "Horizon visible, sky glowing",
      startsAt: times.nauticalTwilightStart,
      endsAt: times.civilTwilightStart,
      isCurrent: false,
    });
  }

  if (times.blueHourMorningStart) {
    phases.push({
      name: "Blue Hour (Morning)",
      description: "Deep blue sky, excellent for cityscapes",
      startsAt: times.blueHourMorningStart,
      endsAt: times.blueHourMorningEnd,
      isCurrent: false,
    });
  }

  if (times.sunrise) {
    phases.push({
      name: "Golden Hour (Morning)",
      description: "Warm, golden light ideal for photography",
      startsAt: times.sunrise,
      endsAt: times.goldenHourMorningEnd,
      isCurrent: false,
    });
  }

  if (times.goldenHourMorningEnd) {
    phases.push({
      name: "Daylight",
      description: "Full daylight",
      startsAt: times.goldenHourMorningEnd,
      endsAt: times.goldenHourEveningStart,
      isCurrent: false,
    });
  }

  // Evening phases
  if (times.goldenHourEveningStart) {
    phases.push({
      name: "Golden Hour (Evening)",
      description: "Warm, golden light ideal for photography",
      startsAt: times.goldenHourEveningStart,
      endsAt: times.sunset,
      isCurrent: false,
    });
  }

  if (times.blueHourEveningStart) {
    phases.push({
      name: "Blue Hour (Evening)",
      description: "Deep blue sky, excellent for cityscapes",
      startsAt: times.blueHourEveningStart,
      endsAt: times.blueHourEveningEnd,
      isCurrent: false,
    });
  }

  if (times.civilTwilightEnd) {
    phases.push({
      name: "Civil Twilight (Evening)",
      description: "Sky is bright",
      startsAt: times.civilTwilightEnd,
      endsAt: times.nauticalTwilightEnd,
      isCurrent: false,
    });
  }

  if (times.nauticalTwilightEnd) {
    phases.push({
      name: "Nautical Twilight (Evening)",
      description: "Horizon visible",
      startsAt: times.nauticalTwilightEnd,
      endsAt: times.astronomicalTwilightEnd,
      isCurrent: false,
    });
  }

  if (times.astronomicalTwilightEnd) {
    phases.push({
      name: "Astronomical Twilight (Evening)",
      description: "Sky nearly dark",
      startsAt: times.astronomicalTwilightEnd,
      endsAt: null,
      isCurrent: false,
    });
  }

  // Mark current phase
  for (const phase of phases) {
    if (phase.startsAt && phase.endsAt) {
      if (now >= phase.startsAt && now <= phase.endsAt) {
        phase.isCurrent = true;
        break;
      }
    }
  }

  return phases;
}

/**
 * Format time for display
 */
export function formatSunTime(date: Date | null, timezone?: string): string {
  if (!date) return "N/A";

  const options: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };

  if (timezone) {
    options.timeZone = timezone;
  }

  return date.toLocaleTimeString(undefined, options);
}

/**
 * Get time until next golden hour
 */
export function getTimeUntilGoldenHour(
  date: Date,
  lat: number,
  lng: number
): { phase: string; timeUntil: number; startTime: Date } | null {
  const times = getSunTimes(date, lat, lng);
  const now = date.getTime();

  // Check morning golden hour
  if (times.goldenHourMorningStart && now < times.goldenHourMorningStart.getTime()) {
    return {
      phase: "Morning Golden Hour",
      timeUntil: times.goldenHourMorningStart.getTime() - now,
      startTime: times.goldenHourMorningStart,
    };
  }

  // Check evening golden hour
  if (times.goldenHourEveningStart && now < times.goldenHourEveningStart.getTime()) {
    return {
      phase: "Evening Golden Hour",
      timeUntil: times.goldenHourEveningStart.getTime() - now,
      startTime: times.goldenHourEveningStart,
    };
  }

  // Check tomorrow's morning golden hour
  const tomorrow = new Date(date);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowTimes = getSunTimes(tomorrow, lat, lng);

  if (tomorrowTimes.goldenHourMorningStart) {
    return {
      phase: "Tomorrow's Morning Golden Hour",
      timeUntil: tomorrowTimes.goldenHourMorningStart.getTime() - now,
      startTime: tomorrowTimes.goldenHourMorningStart,
    };
  }

  return null;
}

/**
 * Format duration for display
 */
export function formatDuration(ms: number): string {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}
