import { describe, expect, it } from "vitest";
import {
  getCharsByCategory,
  HTML_CHAR_ENTITIES,
  searchChars,
} from "@/lib/converters/web/html-chars";

describe("HTML_CHAR_ENTITIES", () => {
  it("contains amp entity", () => {
    const amp = HTML_CHAR_ENTITIES.find((e) => e.name === "amp");
    expect(amp).toBeDefined();
    expect(amp!.char).toBe("&");
    expect(amp!.entity).toBe("&amp;");
    expect(amp!.decimal).toBe(38);
  });

  it("contains lt entity", () => {
    const lt = HTML_CHAR_ENTITIES.find((e) => e.name === "lt");
    expect(lt).toBeDefined();
    expect(lt!.char).toBe("<");
    expect(lt!.entity).toBe("&lt;");
  });

  it("contains gt entity", () => {
    const gt = HTML_CHAR_ENTITIES.find((e) => e.name === "gt");
    expect(gt).toBeDefined();
    expect(gt!.char).toBe(">");
    expect(gt!.entity).toBe("&gt;");
  });

  it("contains quot entity", () => {
    const quot = HTML_CHAR_ENTITIES.find((e) => e.name === "quot");
    expect(quot).toBeDefined();
    expect(quot!.char).toBe('"');
    expect(quot!.entity).toBe("&quot;");
  });
});

describe("getCharsByCategory", () => {
  it("returns punctuation entities", () => {
    const punctuation = getCharsByCategory("punctuation");
    expect(punctuation.length).toBeGreaterThan(0);
    for (const e of punctuation) {
      expect(e.category).toBe("punctuation");
    }
  });

  it("returns currency entities", () => {
    const currency = getCharsByCategory("currency");
    expect(currency.length).toBeGreaterThan(0);
    const names = currency.map((e) => e.name);
    expect(names).toContain("euro");
    expect(names).toContain("pound");
  });

  it("returns greek entities", () => {
    const greek = getCharsByCategory("greek");
    expect(greek.length).toBeGreaterThan(0);
    const names = greek.map((e) => e.name);
    expect(names).toContain("alpha");
    expect(names).toContain("pi");
  });
});

describe("searchChars", () => {
  it("finds entity by name", () => {
    const results = searchChars("euro");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].name).toBe("euro");
  });

  it("finds entity by description", () => {
    const results = searchChars("Copyright");
    expect(results.length).toBeGreaterThan(0);
  });

  it("finds entity by entity string", () => {
    const results = searchChars("&amp;");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].name).toBe("amp");
  });

  it("returns empty for unknown query", () => {
    const results = searchChars("xyznotfound999");
    expect(results).toHaveLength(0);
  });
});
