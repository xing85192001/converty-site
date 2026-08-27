import { describe, expect, it } from "vitest";
import { calculateAspectFit } from "@/lib/converters/photo/aspect-fit";

describe("calculateAspectFit", () => {
  it("returns error for zero screen width", () => {
    const result = calculateAspectFit(1920, 1080, 0, 600);
    expect(result.ok).toBe(false);
  });

  it("returns error for zero screen height", () => {
    const result = calculateAspectFit(1920, 1080, 800, 0);
    expect(result.ok).toBe(false);
  });

  it("returns error for zero image width", () => {
    const result = calculateAspectFit(0, 1080, 800, 600);
    expect(result.ok).toBe(false);
  });

  it("fits 1920x1080 into 800x600 with horizontal letterboxing", () => {
    const result = calculateAspectFit(1920, 1080, 800, 600);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.fittedWidth).toBe(800);
    expect(result.value.fittedHeight).toBe(450);
    expect(result.value.letterboxing).toBe("horizontal");
  });

  it("fits portrait 600x800 into 400x400 with vertical letterboxing", () => {
    const result = calculateAspectFit(600, 800, 400, 400);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.fittedHeight).toBe(400);
    expect(result.value.fittedWidth).toBe(300);
    expect(result.value.letterboxing).toBe("vertical");
  });

  it("returns no letterboxing for exact aspect match", () => {
    const result = calculateAspectFit(1920, 1080, 1920, 1080);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.letterboxing).toBe("none");
    expect(result.value.fillPercentage).toBe(100);
  });

  it("returns a valid scale factor", () => {
    const result = calculateAspectFit(1920, 1080, 800, 600);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.scale).toBeGreaterThan(0);
    expect(result.value.scale).toBeLessThanOrEqual(1);
  });
});
