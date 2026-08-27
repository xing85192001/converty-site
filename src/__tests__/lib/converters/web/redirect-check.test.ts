import { describe, expect, it } from "vitest";
import type { RedirectInfo } from "@/lib/converters/web/redirect-check";
import { analyzeRedirectChain, COMMON_STATUS_CODES } from "@/lib/converters/web/redirect-check";

describe("analyzeRedirectChain", () => {
  it("returns no issues for empty chain", () => {
    const result = analyzeRedirectChain([]);
    expect(result.issues).toHaveLength(0);
    expect(result.recommendations).toHaveLength(0);
  });

  it("detects HTTP to HTTPS upgrade", () => {
    const chain: RedirectInfo[] = [
      {
        url: "http://example.com",
        statusCode: 301,
        statusText: "Moved Permanently",
        location: "https://example.com",
        headers: {},
      },
    ];
    const result = analyzeRedirectChain(chain);
    const hasUpgradeRec = result.recommendations.some((r) => r.includes("HTTPS"));
    expect(hasUpgradeRec).toBe(true);
  });

  it("issues warning for too many redirects", () => {
    const chain: RedirectInfo[] = Array.from({ length: 5 }, (_, i) => ({
      url: `http://example.com/step${i}`,
      statusCode: 301,
      statusText: "Moved Permanently",
      location: `http://example.com/step${i + 1}`,
      headers: {},
    }));
    const result = analyzeRedirectChain(chain);
    const hasTooManyIssue = result.issues.some((i) => i.includes("Too many redirects"));
    expect(hasTooManyIssue).toBe(true);
  });

  it("flags 302 as using temporary redirect", () => {
    const chain: RedirectInfo[] = [
      {
        url: "http://example.com",
        statusCode: 302,
        statusText: "Found",
        location: "http://example.com/page",
        headers: {},
      },
    ];
    const result = analyzeRedirectChain(chain);
    const has302Issue = result.issues.some((i) => i.includes("302"));
    expect(has302Issue).toBe(true);
  });

  it("detects www to non-www change", () => {
    const chain: RedirectInfo[] = [
      {
        url: "http://www.example.com",
        statusCode: 301,
        statusText: "Moved Permanently",
        location: "http://example.com",
        headers: {},
      },
    ];
    const result = analyzeRedirectChain(chain);
    const hasCanonicalRec = result.recommendations.some((r) => r.includes("canonical"));
    expect(hasCanonicalRec).toBe(true);
  });

  it("detects potential redirect loop", () => {
    const chain: RedirectInfo[] = [
      {
        url: "http://example.com/loop",
        statusCode: 301,
        statusText: "Moved Permanently",
        location: "http://example.com/loop2",
        headers: {},
      },
      {
        url: "http://example.com/loop",
        statusCode: 301,
        statusText: "Moved Permanently",
        location: "http://example.com/loop",
        headers: {},
      },
    ];
    const result = analyzeRedirectChain(chain);
    const hasLoopIssue = result.issues.some((i) => i.includes("loop"));
    expect(hasLoopIssue).toBe(true);
  });
});

describe("COMMON_STATUS_CODES", () => {
  it("has 200 OK defined", () => {
    expect(COMMON_STATUS_CODES[200]).toBeDefined();
    expect(COMMON_STATUS_CODES[200].name).toBe("OK");
  });

  it("has 301 Moved Permanently defined", () => {
    expect(COMMON_STATUS_CODES[301]).toBeDefined();
    expect(COMMON_STATUS_CODES[301].name).toBe("Moved Permanently");
  });

  it("has 404 Not Found defined", () => {
    expect(COMMON_STATUS_CODES[404]).toBeDefined();
    expect(COMMON_STATUS_CODES[404].name).toBe("Not Found");
  });
});
