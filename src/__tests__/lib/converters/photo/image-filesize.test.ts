import { describe, expect, it } from "vitest";
import { calculateImageFilesize } from "@/lib/converters/photo/image-filesize";

describe("calculateImageFilesize", () => {
  it("returns error for zero width", () => {
    const result = calculateImageFilesize(0, 1080, "jpeg");
    expect(result.ok).toBe(false);
  });

  it("returns error for zero height", () => {
    const result = calculateImageFilesize(1920, 0, "jpeg");
    expect(result.ok).toBe(false);
  });

  it("calculates jpeg typical size for 1920x1080", () => {
    const result = calculateImageFilesize(1920, 1080, "jpeg");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.estimatedMB).toBeGreaterThan(0);
    expect(result.value.totalPixels).toBe(2073600);
    expect(result.value.megapixels).toBeCloseTo(2.07, 1);
  });

  it("raw format has larger size than jpeg", () => {
    const jpeg = calculateImageFilesize(4000, 3000, "jpeg");
    const raw = calculateImageFilesize(4000, 3000, "raw");
    expect(jpeg.ok).toBe(true);
    expect(raw.ok).toBe(true);
    if (!jpeg.ok || !raw.ok) return;
    expect(raw.value.estimatedBytes).toBeGreaterThan(jpeg.value.estimatedBytes);
  });

  it("high quality is larger than low quality", () => {
    const low = calculateImageFilesize(4000, 3000, "jpeg", "low");
    const high = calculateImageFilesize(4000, 3000, "jpeg", "high");
    expect(low.ok).toBe(true);
    expect(high.ok).toBe(true);
    if (!low.ok || !high.ok) return;
    expect(high.value.estimatedBytes).toBeGreaterThan(low.value.estimatedBytes);
  });

  it("calculates formatted size string", () => {
    const result = calculateImageFilesize(4000, 3000, "jpeg");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.formatted).toMatch(/MB|KB|bytes/);
  });
});
