// HTML Encoder/Decoder

export interface EncodingResult {
  encoded: string;
  decoded: string;
  entityCount: number;
  charactersConverted: number;
}

// Common HTML entities
export const HTML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
  " ": "&nbsp;",
  "\u00a9": "&copy;",
  "\u00ae": "&reg;",
  "\u2122": "&trade;",
  "\u20ac": "&euro;",
  "\u00a3": "&pound;",
  "\u00a5": "&yen;",
  "\u00a2": "&cent;",
  "\u00b0": "&deg;",
  "\u00b1": "&plusmn;",
  "\u00d7": "&times;",
  "\u00f7": "&divide;",
  "\u2260": "&ne;",
  "\u2264": "&le;",
  "\u2265": "&ge;",
  "\u2190": "&larr;",
  "\u2192": "&rarr;",
  "\u2191": "&uarr;",
  "\u2193": "&darr;",
};

// Reverse mapping for decoding
const ENTITY_TO_CHAR: Record<string, string> = Object.fromEntries(
  Object.entries(HTML_ENTITIES).map(([char, entity]) => [entity, char])
);

export function encodeHTML(input: string, encodeAll: boolean = false): EncodingResult {
  let encoded = "";
  let charactersConverted = 0;

  for (const char of input) {
    if (HTML_ENTITIES[char]) {
      encoded += HTML_ENTITIES[char];
      charactersConverted++;
    } else if (encodeAll && char.charCodeAt(0) > 127) {
      encoded += `&#${char.charCodeAt(0)};`;
      charactersConverted++;
    } else {
      encoded += char;
    }
  }

  const entityCount = (encoded.match(/&[a-zA-Z]+;|&#\d+;/g) || []).length;

  return {
    encoded,
    decoded: input,
    entityCount,
    charactersConverted,
  };
}

export function decodeHTML(input: string): EncodingResult {
  let decoded = input;
  let entityCount = 0;

  // Decode named entities
  Object.entries(ENTITY_TO_CHAR).forEach(([entity, char]) => {
    const regex = new RegExp(entity.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
    const matches = decoded.match(regex);
    if (matches) {
      entityCount += matches.length;
      decoded = decoded.replace(regex, char);
    }
  });

  // Decode numeric entities (decimal)
  const decimalMatches = decoded.match(/&#(\d+);/g) || [];
  entityCount += decimalMatches.length;
  decoded = decoded.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code)));

  // Decode numeric entities (hex)
  const hexMatches = decoded.match(/&#x([0-9a-fA-F]+);/g) || [];
  entityCount += hexMatches.length;
  decoded = decoded.replace(/&#x([0-9a-fA-F]+);/g, (_, code) =>
    String.fromCharCode(parseInt(code, 16))
  );

  return {
    encoded: input,
    decoded,
    entityCount,
    charactersConverted: entityCount,
  };
}

export type EncodingMode = "minimal" | "full" | "numeric";

export function encodeHTMLAdvanced(input: string, mode: EncodingMode): string {
  switch (mode) {
    case "minimal":
      // Only encode &, <, >, "
      return input
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

    case "full":
      // Encode all special characters using named entities where possible
      return encodeHTML(input, true).encoded;

    case "numeric":
      // Encode all non-ASCII as numeric entities
      return input
        .split("")
        .map((char) => {
          const code = char.charCodeAt(0);
          if (code < 32 || code > 126) {
            return `&#${code};`;
          }
          if (char === "&") return "&amp;";
          if (char === "<") return "&lt;";
          if (char === ">") return "&gt;";
          if (char === '"') return "&quot;";
          return char;
        })
        .join("");
  }
}
