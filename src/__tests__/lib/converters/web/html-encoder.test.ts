import { describe, expect, it } from "vitest";
import { decodeHTML, encodeHTML, encodeHTMLAdvanced } from "@/lib/converters/web/html-encoder";

describe("encodeHTML", () => {
  it("encodes < and > characters", () => {
    const result = encodeHTML("<script>alert('xss')</script>");
    expect(result.encoded).toContain("&lt;");
    expect(result.encoded).toContain("&gt;");
    expect(result.encoded).not.toContain("<script>");
  });

  it("encodes & character", () => {
    const result = encodeHTML("bread & butter");
    expect(result.encoded).toContain("&amp;");
  });

  it("encodes quote characters", () => {
    const result = encodeHTML('say "hello"');
    expect(result.encoded).toContain("&quot;");
  });

  it("returns empty string for empty input", () => {
    const result = encodeHTML("");
    expect(result.encoded).toBe("");
    expect(result.entityCount).toBe(0);
    expect(result.charactersConverted).toBe(0);
  });

  it("tracks entityCount and charactersConverted", () => {
    const result = encodeHTML("<b>");
    expect(result.entityCount).toBe(2);
    expect(result.charactersConverted).toBe(2);
  });
});

describe("decodeHTML", () => {
  it("decodes &lt;script&gt; back to <script>", () => {
    const result = decodeHTML("&lt;script&gt;");
    expect(result.decoded).toBe("<script>");
  });

  it("decodes &amp; back to &", () => {
    const result = decodeHTML("bread &amp; butter");
    expect(result.decoded).toBe("bread & butter");
  });

  it("decodes &quot; back to double quote", () => {
    const result = decodeHTML("&quot;hello&quot;");
    expect(result.decoded).toBe('"hello"');
  });

  it("returns empty string for empty input", () => {
    const result = decodeHTML("");
    expect(result.decoded).toBe("");
  });

  it("decodes numeric entities", () => {
    const result = decodeHTML("&#65;"); // A
    expect(result.decoded).toBe("A");
  });

  it("decodes hex entities", () => {
    const result = decodeHTML("&#x41;"); // A
    expect(result.decoded).toBe("A");
  });
});

describe("encodeHTML roundtrip", () => {
  it("encode then decode recovers original", () => {
    const original = '<div class="test">Hello & World</div>';
    const encoded = encodeHTML(original);
    const decoded = decodeHTML(encoded.encoded);
    expect(decoded.decoded).toBe(original);
  });
});

describe("encodeHTMLAdvanced", () => {
  it('minimal mode encodes only <, >, &, "', () => {
    const result = encodeHTMLAdvanced('<b class="test">', "minimal");
    expect(result).toContain("&lt;");
    expect(result).toContain("&gt;");
    expect(result).toContain("&quot;");
  });

  it("numeric mode encodes non-ASCII as numeric entities", () => {
    const result = encodeHTMLAdvanced("\u00a9", "numeric"); // copyright
    expect(result).toContain("&#");
  });
});
