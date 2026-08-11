import type { CalculationResult } from "@/types";

export interface BPMConversion {
  bpm: number;
  hz: number;
  msPerBeat: number;
  secPerBeat: number;
  beatsPerSec: number;
  barLength4_4: number; // ms for a 4/4 bar
  barLength3_4: number; // ms for a 3/4 bar
  noteValues: NoteValue[];
}

export interface NoteValue {
  nameKey: string;
  symbol: string;
  beats: number;
  durationMs: number;
}

export function calculateBPM(bpm: number): CalculationResult<BPMConversion> {
  if (bpm <= 0 || bpm > 1000) {
    return {
      ok: false,
      error: "BPM must be between 1 and 1000",
      code: "INVALID_INPUT",
    };
  }

  const msPerBeat = 60000 / bpm;
  const secPerBeat = 60 / bpm;
  const hz = bpm / 60;

  const noteValues: NoteValue[] = [
    { nameKey: "whole-note", symbol: "1", beats: 4, durationMs: msPerBeat * 4 },
    { nameKey: "half-note", symbol: "1/2", beats: 2, durationMs: msPerBeat * 2 },
    { nameKey: "quarter-note", symbol: "1/4", beats: 1, durationMs: msPerBeat },
    { nameKey: "eighth-note", symbol: "1/8", beats: 0.5, durationMs: msPerBeat / 2 },
    { nameKey: "sixteenth-note", symbol: "1/16", beats: 0.25, durationMs: msPerBeat / 4 },
    { nameKey: "thirty-second-note", symbol: "1/32", beats: 0.125, durationMs: msPerBeat / 8 },
    { nameKey: "dotted-half", symbol: "1/2.", beats: 3, durationMs: msPerBeat * 3 },
    { nameKey: "dotted-quarter", symbol: "1/4.", beats: 1.5, durationMs: msPerBeat * 1.5 },
    { nameKey: "dotted-eighth", symbol: "1/8.", beats: 0.75, durationMs: msPerBeat * 0.75 },
    { nameKey: "triplet-quarter", symbol: "1/4T", beats: 2 / 3, durationMs: (msPerBeat * 2) / 3 },
    { nameKey: "triplet-eighth", symbol: "1/8T", beats: 1 / 3, durationMs: msPerBeat / 3 },
  ];

  return {
    ok: true,
    value: {
      bpm,
      hz: Math.round(hz * 1000) / 1000,
      msPerBeat: Math.round(msPerBeat * 100) / 100,
      secPerBeat: Math.round(secPerBeat * 1000) / 1000,
      beatsPerSec: Math.round(hz * 1000) / 1000,
      barLength4_4: Math.round(msPerBeat * 4 * 100) / 100,
      barLength3_4: Math.round(msPerBeat * 3 * 100) / 100,
      noteValues: noteValues.map((n) => ({
        ...n,
        durationMs: Math.round(n.durationMs * 100) / 100,
      })),
    },
  };
}

export function msToDelay(ms: number, sampleRate: number = 44100): number {
  return Math.round((ms / 1000) * sampleRate);
}

export function bpmFromMs(msPerBeat: number): number {
  return 60000 / msPerBeat;
}

// Common tempo markings with keys for translation
export interface TempoMarking {
  key: string;
  minBpm: number;
  maxBpm: number;
}

export const TEMPO_MARKINGS: TempoMarking[] = [
  { key: "larghissimo", minBpm: 1, maxBpm: 24 },
  { key: "grave", minBpm: 25, maxBpm: 45 },
  { key: "largo", minBpm: 40, maxBpm: 60 },
  { key: "lento", minBpm: 45, maxBpm: 60 },
  { key: "larghetto", minBpm: 60, maxBpm: 66 },
  { key: "adagio", minBpm: 66, maxBpm: 76 },
  { key: "andante", minBpm: 76, maxBpm: 108 },
  { key: "moderato", minBpm: 108, maxBpm: 120 },
  { key: "allegro", minBpm: 120, maxBpm: 156 },
  { key: "vivace", minBpm: 156, maxBpm: 176 },
  { key: "presto", minBpm: 168, maxBpm: 200 },
  { key: "prestissimo", minBpm: 200, maxBpm: 1000 },
];

export function getTempoMarking(bpm: number): string {
  for (const marking of TEMPO_MARKINGS) {
    if (bpm >= marking.minBpm && bpm <= marking.maxBpm) {
      return marking.key;
    }
  }
  return "";
}
