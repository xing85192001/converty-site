import { describe, expect, it } from "vitest";
import {
  decodeBase64,
  decodeURL,
  encodeBase64,
  encodeURL,
  escapeHtml,
  unescapeHtml,
} from "@/lib/converters/web/url-encoder";

describe("encodeURL", () => {
  it("encodes space as %20", () => {
    const result = encodeURL("hello world");
    expect(result.encoded).toBe("hello%20world");
  });

  it("encodes special chars", () => {
    const result = encodeURL("foo&bar=baz");
    expect(result.encoded).toContain("%26");
    expect(result.encoded).toContain("%3D");
  });

  it("preserves original in result", () => {
    const result = encodeURL("test");
    expect(result.original).toBe("test");
    expect(result.decoded).toBe("test");
  });

  it("counts characters correctly", () => {
    const result = encodeURL("hello");
    expect(result.characterCount).toBe(5);
  });
});

describe("decodeURL", () => {
  it("decodes %20 as space", () => {
    const result = decodeURL("hello%20world");
    expect(result.decoded).toBe("hello world");
  });

  it("decodes encoded special chars", () => {
    const result = decodeURL("foo%26bar%3Dbaz");
    expect(result.decoded).toBe("foo&bar=baz");
  });

  it("handles already-decoded input gracefully", () => {
    const result = decodeURL("hello world");
    expect(result.decoded).toBe("hello world");
  });

  it("handles malformed percent encoding by returning original", () => {
    const result = decodeURL("hello%ZZworld");
    expect(result.decoded).toBe("hello%ZZworld");
  });
});

describe("encodeURL + decodeURL roundtrip", () => {
  it("encodes then decodes to recover original", () => {
    const original = "https://example.com/path?key=value&other=test";
    const encoded = encodeURL(original);
    const decoded = decodeURL(encoded.encoded);
    expect(decoded.decoded).toBe(original);
  });
});

describe("encodeBase64 and decodeBase64", () => {
  it("encodes string to base64", () => {
    const encoded = encodeBase64("hello");
    expect(encoded.length).toBeGreaterThan(0);
    expect(encoded).toBe("aGVsbG8=");
  });

  it("decodes base64 back to original", () => {
    const decoded = decodeBase64("aGVsbG8=");
    expect(decoded).toBe("hello");
  });

  it("encodes and decodes unicode", () => {
    const original = "café";
    const encoded = encodeBase64(original);
    const decoded = decodeBase64(encoded);
    expect(decoded).toBe(original);
  });
});

describe("escapeHtml and unescapeHtml", () => {
  it("escapes < and > in HTML", () => {
    const escaped = escapeHtml("<script>");
    expect(escaped).toBe("&lt;script&gt;");
  });

  it("escapes & in HTML", () => {
    const escaped = escapeHtml("a & b");
    expect(escaped).toBe("a &amp; b");
  });

  it("unescapes &lt; and &gt; back to < and >", () => {
    const unescaped = unescapeHtml("&lt;script&gt;");
    expect(unescaped).toBe("<script>");
  });

  it("unescapes &amp; back to &", () => {
    const unescaped = unescapeHtml("a &amp; b");
    expect(unescaped).toBe("a & b");
  });
});
