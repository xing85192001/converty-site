/**
 * Time Lapse Calculator
 * Calculate clip length, shooting interval, photos needed, memory usage
 */

export type CalculateMode = "clip_length" | "interval" | "event_duration";

export interface TimeLapseInput {
  calculateMode: CalculateMode;
  // For calculating clip length
  eventDurationMinutes?: number;
  intervalSeconds?: number;
  // For calculating interval
  clipLengthSeconds?: number;
  // For calculating event duration
  // (uses clipLengthSeconds and intervalSeconds)
  // Common settings
  frameRate: number; // fps of output video
  imageSizeMB: number; // size of one photo in MB
}

export interface TimeLapseResult {
  eventDurationMinutes: number;
  eventDurationFormatted: string;
  intervalSeconds: number;
  clipLengthSeconds: number;
  clipLengthFormatted: string;
  totalPhotos: number;
  totalMemoryMB: number;
  totalMemoryGB: number;
  speedupFactor: number;
}

export function calculateTimeLapse(input: TimeLapseInput): TimeLapseResult {
  const { calculateMode, frameRate, imageSizeMB } = input;

  let eventDurationMinutes: number;
  let intervalSeconds: number;
  let clipLengthSeconds: number;

  switch (calculateMode) {
    case "clip_length": {
      eventDurationMinutes = input.eventDurationMinutes || 60;
      intervalSeconds = input.intervalSeconds || 5;
      // Photos = event duration / interval
      // Clip length = photos / frame rate
      const photosForClip = (eventDurationMinutes * 60) / intervalSeconds;
      clipLengthSeconds = photosForClip / frameRate;
      break;
    }

    case "interval": {
      eventDurationMinutes = input.eventDurationMinutes || 60;
      clipLengthSeconds = input.clipLengthSeconds || 30;
      // Photos needed = clip length * frame rate
      // Interval = event duration / photos
      const photosNeeded = clipLengthSeconds * frameRate;
      intervalSeconds = (eventDurationMinutes * 60) / photosNeeded;
      break;
    }

    case "event_duration": {
      clipLengthSeconds = input.clipLengthSeconds || 30;
      intervalSeconds = input.intervalSeconds || 5;
      // Photos = clip length * frame rate
      // Event duration = photos * interval
      const photosForEvent = clipLengthSeconds * frameRate;
      eventDurationMinutes = (photosForEvent * intervalSeconds) / 60;
      break;
    }

    default:
      throw new Error("Invalid calculate mode");
  }

  const totalPhotos = Math.ceil((eventDurationMinutes * 60) / intervalSeconds);
  const totalMemoryMB = totalPhotos * imageSizeMB;
  const totalMemoryGB = totalMemoryMB / 1024;
  const speedupFactor = (eventDurationMinutes * 60) / clipLengthSeconds;

  return {
    eventDurationMinutes,
    eventDurationFormatted: formatDuration(eventDurationMinutes * 60),
    intervalSeconds,
    clipLengthSeconds,
    clipLengthFormatted: formatDuration(clipLengthSeconds),
    totalPhotos,
    totalMemoryMB: Math.round(totalMemoryMB),
    totalMemoryGB: Math.round(totalMemoryGB * 100) / 100,
    speedupFactor: Math.round(speedupFactor),
  };
}

function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.round(totalSeconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}

// Common frame rates for video output
export const FRAME_RATES = [
  { name: "24 fps (Cinema)", value: 24 },
  { name: "25 fps (PAL)", value: 25 },
  { name: "30 fps (NTSC)", value: 30 },
  { name: "60 fps (Smooth)", value: 60 },
];

// Common image file sizes
export const IMAGE_SIZES = [
  { name: "JPEG High (8 MB)", value: 8 },
  { name: "JPEG Medium (4 MB)", value: 4 },
  { name: "JPEG Low (2 MB)", value: 2 },
  { name: "RAW 24MP (25 MB)", value: 25 },
  { name: "RAW 45MP (45 MB)", value: 45 },
  { name: "RAW 61MP (60 MB)", value: 60 },
];

// Recommended intervals for different subjects
export const INTERVAL_RECOMMENDATIONS = [
  { subject: "Clouds (fast moving)", interval: "1-3 seconds" },
  { subject: "Clouds (slow moving)", interval: "5-10 seconds" },
  { subject: "Sunrise/Sunset", interval: "3-5 seconds" },
  { subject: "Stars/Milky Way", interval: "20-30 seconds" },
  { subject: "Star Trails", interval: "30-60 seconds" },
  { subject: "Traffic/City", interval: "1-2 seconds" },
  { subject: "Crowds/People", interval: "1-3 seconds" },
  { subject: "Plants growing", interval: "5-15 minutes" },
  { subject: "Construction", interval: "5-30 minutes" },
  { subject: "Moon movement", interval: "5-10 seconds" },
  { subject: "Sun shadows", interval: "30-60 seconds" },
  { subject: "Weather changes", interval: "30-60 seconds" },
];

export const TIME_LAPSE_TIPS = [
  "Use manual exposure to avoid flickering",
  "Lock white balance for consistent colors",
  "Use an intervalometer or camera's built-in timer",
  "Calculate memory needs before starting",
  "Bring extra batteries for long sessions",
  "Use a sturdy tripod and weight it down",
  "Shoot in RAW for maximum editing flexibility",
  "Consider a 25% buffer for total photos needed",
];
