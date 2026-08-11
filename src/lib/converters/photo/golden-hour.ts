/**
 * Golden Hour & Twilight Calculator
 * Reference guide for photography lighting conditions
 */

// Sun elevation angles that define different light phases
export const LIGHT_PHASES = [
  {
    name: "Night",
    sunElevation: "Below -18°",
    description: "Complete darkness, ideal for astrophotography",
    photographyTips: ["Milky Way and star photography", "Star trails", "Light painting"],
  },
  {
    name: "Astronomical Twilight",
    sunElevation: "-18° to -12°",
    description: "Sky is dark, faint stars visible",
    photographyTips: [
      "Milky Way visible",
      "Last/first light on horizon",
      "City lights with hint of blue sky",
    ],
  },
  {
    name: "Nautical Twilight",
    sunElevation: "-12° to -6°",
    description: "Horizon clearly visible, sky glows",
    photographyTips: [
      "Blue hour begins/ends",
      "Excellent for cityscapes",
      "Balanced ambient and artificial light",
    ],
  },
  {
    name: "Civil Twilight / Blue Hour",
    sunElevation: "-6° to 0°",
    description: "Bright sky, deep blue color",
    photographyTips: [
      "Rich blue sky color",
      "City lights balanced with sky",
      "No harsh shadows",
      "Soft, even lighting",
    ],
  },
  {
    name: "Golden Hour",
    sunElevation: "0° to 6°",
    description: "Warm, golden light, long shadows",
    photographyTips: [
      "Warm, flattering light for portraits",
      "Long dramatic shadows",
      "Rim lighting effects",
      "Landscapes glow with color",
    ],
  },
  {
    name: "Daytime",
    sunElevation: "Above 6°",
    description: "Full daylight, varies by sun position",
    photographyTips: [
      "Harsh shadows at midday",
      "Look for open shade",
      "Use fill flash or reflectors",
      "Best for high-contrast subjects",
    ],
  },
];

// Duration estimates (varies by latitude and season)
export interface TwilightDurations {
  latitude: number;
  season: "equinox" | "summer" | "winter";
  goldenHour: string;
  blueHour: string;
  civilTwilight: string;
  nauticalTwilight: string;
  astronomicalTwilight: string;
}

export const TWILIGHT_DURATION_EXAMPLES: TwilightDurations[] = [
  {
    latitude: 0,
    season: "equinox",
    goldenHour: "~25 minutes",
    blueHour: "~25 minutes",
    civilTwilight: "~25 minutes",
    nauticalTwilight: "~25 minutes",
    astronomicalTwilight: "~25 minutes",
  },
  {
    latitude: 30,
    season: "equinox",
    goldenHour: "~30 minutes",
    blueHour: "~30 minutes",
    civilTwilight: "~30 minutes",
    nauticalTwilight: "~30 minutes",
    astronomicalTwilight: "~30 minutes",
  },
  {
    latitude: 45,
    season: "summer",
    goldenHour: "~45-60 minutes",
    blueHour: "~35-45 minutes",
    civilTwilight: "~35-45 minutes",
    nauticalTwilight: "~40-50 minutes",
    astronomicalTwilight: "~50-70 minutes",
  },
  {
    latitude: 45,
    season: "winter",
    goldenHour: "~25-35 minutes",
    blueHour: "~25-30 minutes",
    civilTwilight: "~25-30 minutes",
    nauticalTwilight: "~30-35 minutes",
    astronomicalTwilight: "~35-45 minutes",
  },
  {
    latitude: 60,
    season: "summer",
    goldenHour: "~2-4 hours",
    blueHour: "~1-2 hours",
    civilTwilight: "~1-2 hours",
    nauticalTwilight: "May not get dark",
    astronomicalTwilight: "May not occur",
  },
];

// Color temperature reference
export const COLOR_TEMPERATURES = [
  { phase: "Blue Hour", kelvin: "9000-12000K", color: "Deep blue" },
  { phase: "Civil Twilight", kelvin: "7000-9000K", color: "Blue to purple" },
  { phase: "Sunrise/Sunset", kelvin: "2000-3500K", color: "Orange to red" },
  { phase: "Golden Hour", kelvin: "3500-4500K", color: "Golden yellow" },
  { phase: "Overcast", kelvin: "6000-7500K", color: "Neutral to cool" },
  { phase: "Midday Sun", kelvin: "5000-5500K", color: "Neutral white" },
  { phase: "Shade", kelvin: "7000-8000K", color: "Cool blue" },
];

// Camera settings recommendations
export const CAMERA_SETTINGS = {
  goldenHour: {
    whiteBalance: "Daylight or Shade for warmth",
    iso: "100-400",
    notes: "Light changes rapidly, check exposure frequently",
  },
  blueHour: {
    whiteBalance: "Tungsten for blue, Daylight for purple",
    iso: "400-1600",
    notes: "Tripod recommended, long exposures may be needed",
  },
  night: {
    whiteBalance: "Tungsten or manual (3200-4000K)",
    iso: "1600-6400+",
    notes: "Tripod essential, use bright lenses",
  },
};

// Planning tips
export const PLANNING_TIPS = [
  "Scout locations during daylight to plan compositions",
  "Arrive 30-45 minutes before golden hour starts",
  "Golden hour is typically more predictable than blue hour",
  "Cloud cover can enhance or diminish golden hour colors",
  "Clear skies often produce the best blue hour",
  "Mountains and buildings can block low sun",
  "Check weather and air quality for best results",
  "Use apps to predict exact sun position and timing",
];

// Seasonal considerations
export const SEASONAL_NOTES = {
  summer: {
    highLatitude: "Extended twilights, midnight sun possible above Arctic Circle",
    midLatitude: "Longer golden hours, earlier sunrise, later sunset",
    lowLatitude: "Similar to other seasons, slight variation",
  },
  winter: {
    highLatitude: "Very short daylight, extended twilights, polar night possible",
    midLatitude: "Shorter golden hours, later sunrise, earlier sunset",
    lowLatitude: "Similar to other seasons, slight variation",
  },
  equinox: {
    all: "Most consistent twilight durations, sun rises due East, sets due West",
  },
};

/**
 * Estimate approximate golden hour start/end from sunrise/sunset times
 * Note: These are rough estimates. For precise times, use location-based calculations.
 */
export function estimateGoldenHour(
  sunriseHour: number,
  sunriseMinute: number,
  sunsetHour: number,
  sunsetMinute: number
): {
  morningGoldenStart: string;
  morningGoldenEnd: string;
  eveningGoldenStart: string;
  eveningGoldenEnd: string;
  morningBlueStart: string;
  morningBlueEnd: string;
  eveningBlueStart: string;
  eveningBlueEnd: string;
} {
  const formatTime = (h: number, m: number) => {
    const hours = Math.floor(h + m / 60) % 24;
    const mins = Math.round(m % 60);
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
  };

  // Morning golden hour: sunrise to ~30 min after
  // Morning blue hour: ~30 min before sunrise to sunrise
  // Evening golden hour: ~30 min before sunset to sunset
  // Evening blue hour: sunset to ~30 min after

  return {
    morningGoldenStart: formatTime(sunriseHour, sunriseMinute),
    morningGoldenEnd: formatTime(sunriseHour, sunriseMinute + 30),
    eveningGoldenStart: formatTime(sunsetHour, sunsetMinute - 30),
    eveningGoldenEnd: formatTime(sunsetHour, sunsetMinute),
    morningBlueStart: formatTime(sunriseHour, sunriseMinute - 30),
    morningBlueEnd: formatTime(sunriseHour, sunriseMinute),
    eveningBlueStart: formatTime(sunsetHour, sunsetMinute),
    eveningBlueEnd: formatTime(sunsetHour, sunsetMinute + 30),
  };
}
