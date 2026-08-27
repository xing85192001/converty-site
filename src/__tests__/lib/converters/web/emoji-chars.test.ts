import { describe, expect, it } from "vitest";
import {
  EMOJI_DATA,
  emojiToHTMLEntity,
  getEmojiByCategory,
  getEmojiUnicode,
  searchEmoji,
} from "@/lib/converters/web/emoji-chars";

describe("EMOJI_DATA", () => {
  it("contains entries", () => {
    expect(EMOJI_DATA.length).toBeGreaterThan(0);
  });

  it("grinning emoji has expected unicode", () => {
    const grinning = EMOJI_DATA.find((e) => e.name === "grinning");
    expect(grinning).toBeDefined();
    expect(grinning!.unicode).toBe("U+1F600");
    expect(grinning!.htmlEntity).toBe("&#128512;");
  });
});

describe("getEmojiByCategory", () => {
  it("returns emojis filtered by category", () => {
    const smileys = getEmojiByCategory("smileys");
    expect(smileys.length).toBeGreaterThan(0);
    for (const e of smileys) {
      expect(e.category).toBe("smileys");
    }
  });

  it("returns animals emojis", () => {
    const animals = getEmojiByCategory("animals");
    expect(animals.length).toBeGreaterThan(0);
    const names = animals.map((e) => e.name);
    expect(names).toContain("dog");
    expect(names).toContain("cat");
  });
});

describe("searchEmoji", () => {
  it("finds emoji by name", () => {
    const results = searchEmoji("fire");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].name).toBe("fire");
  });

  it("finds emoji by keyword", () => {
    const results = searchEmoji("happy");
    expect(results.length).toBeGreaterThan(0);
  });

  it("returns empty for unknown query", () => {
    const results = searchEmoji("xyznotfound123");
    expect(results).toHaveLength(0);
  });
});

describe("getEmojiUnicode", () => {
  it("returns unicode for grinning emoji", () => {
    const unicode = getEmojiUnicode("\u{1F600}");
    expect(unicode).toBe("U+1F600");
  });

  it("handles simple ASCII character", () => {
    const unicode = getEmojiUnicode("A");
    expect(unicode).toBe("U+0041");
  });
});

describe("emojiToHTMLEntity", () => {
  it("converts grinning emoji to decimal html entity", () => {
    const entity = emojiToHTMLEntity("\u{1F600}");
    expect(entity).toBe("&#128512;");
  });
});
