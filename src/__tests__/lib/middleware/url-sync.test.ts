import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string";
import { describe, expect, it } from "vitest";

/**
 * Round-trip tests for lz-string URL compression (R4.6)
 *
 * These tests verify the compress→decompress cycle used by:
 * - url-sync.ts (write path): compressToEncodedURIComponent(JSON.stringify(values))
 * - calculator-store.ts (read path): decompressFromEncodedURIComponent(z) → JSON.parse
 *
 * Note: Coverage for this file is NOT counted toward the 75% converter threshold
 * (vitest.config.ts scopes coverage.include to src/lib/converters/**).
 * Tests still run and must pass on every `npm run test:run`.
 */
describe("lz-string URL compression round-trip", () => {
  it("compresses and decompresses a simple calculator state", () => {
    const values = { weight: 70, height: 175, unit: "metric" };
    const json = JSON.stringify(values);
    const compressed = compressToEncodedURIComponent(json);
    const decompressed = decompressFromEncodedURIComponent(compressed);
    expect(decompressed).toBe(json);
    expect(JSON.parse(decompressed!)).toEqual(values);
  });

  it("handles complex state with 8+ parameters (subnet-style)", () => {
    const values = {
      ipAddress: "192.168.1.0",
      cidr: 24,
      vlanId: 100,
      gateway: "192.168.1.1",
      dns1: "8.8.8.8",
      dns2: "8.8.4.4",
      description: "main subnet",
      enabled: "true",
    };
    const json = JSON.stringify(values);
    const compressed = compressToEncodedURIComponent(json);
    const decompressed = decompressFromEncodedURIComponent(compressed);
    expect(JSON.parse(decompressed!)).toEqual(values);
  });

  it("preserves number types through JSON round-trip (R4.3 type fidelity)", () => {
    const values = { count: 42, ratio: 0.5, negative: -100 };
    const json = JSON.stringify(values);
    const compressed = compressToEncodedURIComponent(json);
    const decompressed = decompressFromEncodedURIComponent(compressed);
    const parsed = JSON.parse(decompressed!);
    expect(typeof parsed.count).toBe("number");
    expect(typeof parsed.ratio).toBe("number");
    expect(typeof parsed.negative).toBe("number");
    expect(parsed.count).toBe(42);
    expect(parsed.ratio).toBe(0.5);
  });

  it("returns null for invalid compressed input (R4.3 null-safety)", () => {
    const result = decompressFromEncodedURIComponent("not-valid-lz-string!!!");
    expect(result).toBeNull();
  });

  it("produces URI-safe output characters only (R4.4 search param safety)", () => {
    const json = JSON.stringify({ weight: 70, height: 175, unit: "metric" });
    const compressed = compressToEncodedURIComponent(json);
    // Output must be embeddable in ?z=<value> without additional encoding
    // Valid chars: alphanumeric, hyphen, underscore, period, tilde, plus (URL-encoded spaces won't appear)
    // lz-string@1.5.0 uses: A-Z a-z 0-9 - _ = (base64url-like alphabet)
    expect(compressed).toMatch(/^[A-Za-z0-9\-_=]+$/);
  });

  it("handles boolean values correctly (as strings from FormValues pattern)", () => {
    const values = { enabled: true, count: 5, label: "test" };
    const json = JSON.stringify(values);
    const compressed = compressToEncodedURIComponent(json);
    const decompressed = decompressFromEncodedURIComponent(compressed);
    const parsed = JSON.parse(decompressed!);
    expect(parsed.enabled).toBe(true);
    expect(typeof parsed.enabled).toBe("boolean");
  });

  it("compresses highly repetitive data shorter than plain format (R4.1 ratio test)", () => {
    // lz-string compressToEncodedURIComponent shines on repetitive data.
    // Typical calculator URL params are short and may not compress, but the
    // base64url encoding becomes beneficial with repetitive values (e.g., repeated IPs,
    // long description strings, or data with many repeated patterns).
    const values = {
      // Highly repetitive data that demonstrates LZ compression benefit
      pattern: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      label: "main-production-datacenter-segment-main-production-datacenter",
      description: "subnet-calculator-subnet-calculator-subnet-calculator-subnet",
    };
    // Plain URL format: ?pattern=aaa...&label=...
    const plainUrl = Object.entries(values)
      .map(([k, v]) => `${k}=${v}`)
      .join("&");
    const compressed = compressToEncodedURIComponent(JSON.stringify(values));
    // Compression should be shorter for highly repetitive data
    expect(compressed.length).toBeLessThan(plainUrl.length);
  });
});
