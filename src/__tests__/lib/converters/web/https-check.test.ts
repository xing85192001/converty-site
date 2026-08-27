import { describe, expect, it } from "vitest";
import {
  analyzeSecurityHeaders,
  SECURITY_HEADERS,
  TLS_VERSIONS,
} from "@/lib/converters/web/https-check";

describe("analyzeSecurityHeaders", () => {
  it("marks missing headers as missing status", () => {
    const headers = {};
    const result = analyzeSecurityHeaders(headers);
    result.forEach((h) => {
      expect(h.status).toBe("missing");
      expect(h.value).toBeNull();
    });
  });

  it("marks present header as good status", () => {
    const headers = {
      "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    };
    const result = analyzeSecurityHeaders(headers);
    const hsts = result.find((h) => h.name === "Strict-Transport-Security");
    expect(hsts).toBeDefined();
    expect(hsts!.value).toBe("max-age=31536000; includeSubDomains");
    expect(hsts!.status).toBe("good");
  });

  it("warns about short HSTS max-age", () => {
    const headers = {
      "Strict-Transport-Security": "max-age=3600",
    };
    const result = analyzeSecurityHeaders(headers);
    const hsts = result.find((h) => h.name === "Strict-Transport-Security");
    expect(hsts!.status).toBe("warning");
  });

  it("warns about HSTS without includeSubDomains", () => {
    const headers = {
      "Strict-Transport-Security": "max-age=31536000",
    };
    const result = analyzeSecurityHeaders(headers);
    const hsts = result.find((h) => h.name === "Strict-Transport-Security");
    expect(hsts!.status).toBe("warning");
  });

  it("provides recommendation for missing headers", () => {
    const headers = {};
    const result = analyzeSecurityHeaders(headers);
    result.forEach((h) => {
      expect(h.recommendation.length).toBeGreaterThan(0);
    });
  });
});

describe("SECURITY_HEADERS", () => {
  it("includes HSTS header definition", () => {
    const hsts = SECURITY_HEADERS.find((h) => h.name === "Strict-Transport-Security");
    expect(hsts).toBeDefined();
    expect(hsts!.impact.length).toBeGreaterThan(0);
  });

  it("contains at least 5 security headers", () => {
    expect(SECURITY_HEADERS.length).toBeGreaterThanOrEqual(5);
  });
});

describe("TLS_VERSIONS", () => {
  it("marks TLS 1.3 as secure", () => {
    expect(TLS_VERSIONS["TLS 1.3"].secure).toBe(true);
  });

  it("marks TLS 1.2 as secure", () => {
    expect(TLS_VERSIONS["TLS 1.2"].secure).toBe(true);
  });

  it("marks TLS 1.0 as insecure", () => {
    expect(TLS_VERSIONS["TLS 1.0"].secure).toBe(false);
  });

  it("marks SSL 3.0 as insecure", () => {
    expect(TLS_VERSIONS["SSL 3.0"].secure).toBe(false);
  });
});
