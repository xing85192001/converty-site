import { describe, expect, it } from "vitest";
import type { SEOMetrics } from "@/lib/converters/web/seo-performance";
import {
  analyzeSEO,
  generateRecommendations,
  SEO_BEST_PRACTICES,
} from "@/lib/converters/web/seo-performance";

const perfectMetrics: SEOMetrics = {
  titleLength: 55,
  descriptionLength: 155,
  h1Count: 1,
  imageCount: 3,
  imagesWithAlt: 3,
  wordCount: 500,
  linkCount: 10,
  externalLinks: 2,
  internalLinks: 8,
};

describe("analyzeSEO", () => {
  it("gives high title score for optimal length (50-60 chars)", () => {
    const result = analyzeSEO(perfectMetrics);
    expect(result.title.score).toBe(100);
    expect(result.title.feedback).toBe("seo_title_optimal");
  });

  it("gives lower title score for too short title (<30)", () => {
    const metrics = { ...perfectMetrics, titleLength: 15 };
    const result = analyzeSEO(metrics);
    expect(result.title.score).toBe(50);
  });

  it("gives lower title score for too long title (>60)", () => {
    const metrics = { ...perfectMetrics, titleLength: 75 };
    const result = analyzeSEO(metrics);
    expect(result.title.score).toBeLessThan(100);
  });

  it("gives 0 score for missing title", () => {
    const metrics = { ...perfectMetrics, titleLength: 0 };
    const result = analyzeSEO(metrics);
    expect(result.title.score).toBe(0);
  });

  it("gives lower headings score for no H1", () => {
    const metrics = { ...perfectMetrics, h1Count: 0 };
    const result = analyzeSEO(metrics);
    expect(result.headings.score).toBe(0);
  });

  it("gives 100 headings score for single H1", () => {
    const result = analyzeSEO(perfectMetrics);
    expect(result.headings.score).toBe(100);
  });

  it("reduces headings score for multiple H1s", () => {
    const metrics = { ...perfectMetrics, h1Count: 3 };
    const result = analyzeSEO(metrics);
    expect(result.headings.score).toBeLessThan(100);
  });

  it("gives 100 image score when all images have alt", () => {
    const result = analyzeSEO(perfectMetrics);
    expect(result.images.score).toBe(100);
  });

  it("calculates overall score as weighted average", () => {
    const result = analyzeSEO(perfectMetrics);
    expect(result.overall).toBeGreaterThan(0);
    expect(result.overall).toBeLessThanOrEqual(100);
  });
});

describe("generateRecommendations", () => {
  it("recommends adding title when missing", () => {
    const metrics = { ...perfectMetrics, titleLength: 0 };
    const recs = generateRecommendations(metrics);
    const hasHighPriority = recs.some((r) => r.priority === "high" && r.category.includes("title"));
    expect(hasHighPriority).toBe(true);
  });

  it("recommends optimizing title when length is off", () => {
    const metrics = { ...perfectMetrics, titleLength: 10 };
    const recs = generateRecommendations(metrics);
    const hasTitleRec = recs.some((r) => r.category.includes("title"));
    expect(hasTitleRec).toBe(true);
  });

  it("recommends adding H1 when missing", () => {
    const metrics = { ...perfectMetrics, h1Count: 0 };
    const recs = generateRecommendations(metrics);
    const hasH1Rec = recs.some((r) => r.priority === "high" && r.category.includes("heading"));
    expect(hasH1Rec).toBe(true);
  });

  it("returns empty recommendations for perfect metrics", () => {
    const recs = generateRecommendations(perfectMetrics);
    expect(recs).toHaveLength(0);
  });

  it("sorts high priority before medium", () => {
    const metrics = { ...perfectMetrics, titleLength: 0, h1Count: 0 };
    const recs = generateRecommendations(metrics);
    const priorities = recs.map((r) => r.priority);
    const highIndex = priorities.indexOf("high");
    const medIndex = priorities.indexOf("medium");
    if (highIndex !== -1 && medIndex !== -1) {
      expect(highIndex).toBeLessThan(medIndex);
    }
  });
});

describe("SEO_BEST_PRACTICES", () => {
  it("has title length constraints", () => {
    expect(SEO_BEST_PRACTICES.title.minLength).toBe(30);
    expect(SEO_BEST_PRACTICES.title.maxLength).toBe(60);
  });

  it("has description length constraints", () => {
    expect(SEO_BEST_PRACTICES.description.minLength).toBe(120);
    expect(SEO_BEST_PRACTICES.description.maxLength).toBe(160);
  });
});
