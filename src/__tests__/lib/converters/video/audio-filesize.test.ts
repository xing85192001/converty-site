import { describe, expect, it } from "vitest";
import { calculateAudioFilesize } from "@/lib/converters/video/audio-filesize";

describe("calculateAudioFilesize", () => {
  it("returns error for zero duration", () => {
    const result = calculateAudioFilesize(0, "mp3");
    expect(result.ok).toBe(false);
  });

  it("calculates mp3 typical size for 180s", () => {
    // 256kbps typical × 180s / 8 / 1024 / 1024 ≈ 5.5MB
    const result = calculateAudioFilesize(180, "mp3");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.estimatedMB).toBeGreaterThan(0);
  });

  it("higher bitrate format gives larger file", () => {
    const mp3 = calculateAudioFilesize(180, "mp3", "typical");
    const wav = calculateAudioFilesize(180, "wav", "typical");
    expect(mp3.ok).toBe(true);
    expect(wav.ok).toBe(true);
    if (!mp3.ok || !wav.ok) return;
    expect(wav.value.estimatedBytes).toBeGreaterThan(mp3.value.estimatedBytes);
  });

  it("high quality gives larger file than low quality", () => {
    const low = calculateAudioFilesize(180, "mp3", "low");
    const high = calculateAudioFilesize(180, "mp3", "high");
    expect(low.ok).toBe(true);
    expect(high.ok).toBe(true);
    if (!low.ok || !high.ok) return;
    expect(high.value.estimatedBytes).toBeGreaterThan(low.value.estimatedBytes);
  });

  it("returns formatted string", () => {
    const result = calculateAudioFilesize(180, "mp3");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.formatted).toMatch(/MB|GB/);
  });

  it("duration field matches input", () => {
    const result = calculateAudioFilesize(180, "mp3");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.duration).toBe(180);
  });
});
