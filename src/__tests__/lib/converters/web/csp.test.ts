import { describe, expect, it } from "vitest";
import { CSP_DIRECTIVES, CSP_PRESETS, generateCSP } from "@/lib/converters/web/csp";

describe("generateCSP", () => {
  it("generates CSP header from config", () => {
    const config = {
      "default-src": "'self'",
      "script-src": "'self'",
    };
    const result = generateCSP(config);
    expect(result.policy).toContain("default-src 'self'");
    expect(result.policy).toContain("script-src 'self'");
    expect(result.header).toContain("Content-Security-Policy:");
    expect(result.metaTag).toContain('<meta http-equiv="Content-Security-Policy"');
    expect(result.reportOnly).toContain("Content-Security-Policy-Report-Only:");
  });

  it("reports warning for unsafe-inline in script-src", () => {
    const config = {
      "script-src": "'self' 'unsafe-inline'",
    };
    const result = generateCSP(config);
    expect(result.issues.length).toBeGreaterThan(0);
    expect(result.issues[0]).toContain("unsafe-inline");
  });

  it("reports warning for unsafe-eval", () => {
    const config = {
      "script-src": "'self' 'unsafe-eval'",
    };
    const result = generateCSP(config);
    const hasEvalWarning = result.issues.some((i) => i.includes("unsafe-eval"));
    expect(hasEvalWarning).toBe(true);
  });

  it("reports warning for wildcard source", () => {
    const config = {
      "img-src": "*",
    };
    const result = generateCSP(config);
    const hasWildcardWarning = result.issues.some((i) => i.includes("Wildcard"));
    expect(hasWildcardWarning).toBe(true);
  });

  it("generates empty policy for empty config", () => {
    const result = generateCSP({});
    expect(result.policy).toBe("");
    expect(result.issues).toHaveLength(0);
  });

  it("skips empty directive values", () => {
    const config = {
      "default-src": "'self'",
      "script-src": "",
    };
    const result = generateCSP(config);
    expect(result.policy).not.toContain("script-src");
  });
});

describe("CSP_PRESETS", () => {
  it("has strict, moderate, and relaxed presets", () => {
    expect(CSP_PRESETS.strict).toBeDefined();
    expect(CSP_PRESETS.moderate).toBeDefined();
    expect(CSP_PRESETS.relaxed).toBeDefined();
  });

  it("strict preset uses none for default-src", () => {
    expect(CSP_PRESETS.strict["default-src"]).toBe("'none'");
  });

  it("relaxed preset has unsafe-eval in script-src", () => {
    expect(CSP_PRESETS.relaxed["script-src"]).toContain("'unsafe-eval'");
  });
});

describe("CSP_DIRECTIVES", () => {
  it("contains expected directives", () => {
    const names = CSP_DIRECTIVES.map((d) => d.name);
    expect(names).toContain("default-src");
    expect(names).toContain("script-src");
    expect(names).toContain("style-src");
  });
});
