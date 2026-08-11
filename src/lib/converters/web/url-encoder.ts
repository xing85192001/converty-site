export interface URLEncodingResult {
  original: string;
  encoded: string;
  decoded: string;
  characterCount: number;
  byteLength: number;
}

export function encodeURL(input: string): URLEncodingResult {
  const encoded = encodeURIComponent(input);
  const byteLength = new TextEncoder().encode(input).length;

  return {
    original: input,
    encoded,
    decoded: input,
    characterCount: input.length,
    byteLength,
  };
}

export function decodeURL(input: string): URLEncodingResult {
  let decoded: string;
  try {
    decoded = decodeURIComponent(input);
  } catch {
    decoded = input; // If decoding fails, return original
  }

  const byteLength = new TextEncoder().encode(decoded).length;

  return {
    original: input,
    encoded: input,
    decoded,
    characterCount: decoded.length,
    byteLength,
  };
}

export function encodeBase64(input: string): string {
  try {
    return btoa(unescape(encodeURIComponent(input)));
  } catch {
    return "";
  }
}

export function decodeBase64(input: string): string {
  try {
    return decodeURIComponent(escape(atob(input)));
  } catch {
    return "";
  }
}

export function escapeHtml(input: string): string {
  const htmlEntities: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return input.replace(/[&<>"']/g, (char) => htmlEntities[char]);
}

export function unescapeHtml(input: string): string {
  const htmlEntities: Record<string, string> = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
    "&#x27;": "'",
    "&#x2F;": "/",
  };
  return input.replace(
    /&(?:amp|lt|gt|quot|#39|#x27|#x2F);/g,
    (entity) => htmlEntities[entity] || entity
  );
}

// Common special characters and their encoded forms
export const SPECIAL_CHARS = [
  { char: " ", encoded: "%20", name: "Space" },
  { char: "!", encoded: "%21", name: "Exclamation" },
  { char: "#", encoded: "%23", name: "Hash" },
  { char: "$", encoded: "%24", name: "Dollar" },
  { char: "%", encoded: "%25", name: "Percent" },
  { char: "&", encoded: "%26", name: "Ampersand" },
  { char: "'", encoded: "%27", name: "Apostrophe" },
  { char: "(", encoded: "%28", name: "Left Paren" },
  { char: ")", encoded: "%29", name: "Right Paren" },
  { char: "+", encoded: "%2B", name: "Plus" },
  { char: ",", encoded: "%2C", name: "Comma" },
  { char: "/", encoded: "%2F", name: "Slash" },
  { char: ":", encoded: "%3A", name: "Colon" },
  { char: ";", encoded: "%3B", name: "Semicolon" },
  { char: "=", encoded: "%3D", name: "Equals" },
  { char: "?", encoded: "%3F", name: "Question" },
  { char: "@", encoded: "%40", name: "At" },
  { char: "[", encoded: "%5B", name: "Left Bracket" },
  { char: "]", encoded: "%5D", name: "Right Bracket" },
];
