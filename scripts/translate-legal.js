const fs = require("fs");
const path = require("path");
const https = require("https");

const root = path.resolve(__dirname, "..");
const messagesDir = path.join(root, "src", "messages");
const cacheFile = path.join(root, "scripts", "legal_translations_cache.json");

const locales = [
  "ar",
  "cs",
  "de",
  "el",
  "es",
  "fr",
  "hu",
  "id",
  "it",
  "ja",
  "ko",
  "ms",
  "nl",
  "pt",
  "ru",
  "th",
  "tr",
  "uk",
  "vi",
  "zh",
  "zh-TW",
];

function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

function fetchGoogleTranslate(text, targetLang) {
  return new Promise((resolve, reject) => {
    const tl = targetLang === "zh-TW" ? "zh-TW" : targetLang;
    const q = encodeURIComponent(text);
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${tl}&dt=t&q=${q}`;
    const req = https.get(url, { timeout: 15000 }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          if (!Array.isArray(parsed) || !parsed[0]) return reject(new Error("Unexpected response"));
          const translated = parsed[0].map((item) => item[0]).join("");
          resolve(translated);
        } catch (err) {
          reject(err);
        }
      });
    });
    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("timeout"));
    });
  });
}

async function translateWithCache(text, targetLang, cache) {
  const key = `${targetLang}::${text}`;
  if (cache[key]) return cache[key];
  const result = await fetchGoogleTranslate(text, targetLang);
  cache[key] = result;
  return result;
}

async function translateObject(obj, targetLang, cache) {
  const out = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      // Preserve interpolation placeholders like {siteName}, {email}, etc.
      const placeholders = [];
      let counter = 0;
      const safeValue = value.replace(/\{[a-zA-Z0-9_]+\}/g, (match) => {
        placeholders.push(match);
        return `__PH${counter++}__`;
      });
      const translated = await translateWithCache(safeValue, targetLang, cache);
      out[key] = translated.replace(/__PH(\d+)__/g, (_, idx) => placeholders[Number(idx)]);
    } else if (typeof value === "object" && value !== null) {
      out[key] = await translateObject(value, targetLang, cache);
    }
  }
  return out;
}

async function main() {
  const en = JSON.parse(fs.readFileSync(path.join(messagesDir, "en.json"), "utf8"));
  if (!en.legal) throw new Error("en.json missing legal namespace");

  let cache = {};
  if (fs.existsSync(cacheFile)) {
    cache = JSON.parse(fs.readFileSync(cacheFile, "utf8"));
  }

  for (const loc of locales) {
    const filePath = path.join(messagesDir, `${loc}.json`);
    const messages = JSON.parse(fs.readFileSync(filePath, "utf8"));

    // Skip if already translated and not en
    if (messages.legal) {
      console.log(`[skip] ${loc}.json already has legal namespace`);
      continue;
    }

    console.log(`[translating] ${loc}...`);
    const translated = await translateObject(en.legal, loc, cache);
    messages.legal = translated;

    // Pretty print with 2 spaces
    fs.writeFileSync(filePath, JSON.stringify(messages, null, 2) + "\n", "utf8");
    console.log(`[done] ${loc}`);

    // Save cache after each locale to avoid losing progress on rate-limit
    fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 2) + "\n", "utf8");

    // Small delay to be polite to Google
    await sleep(300);
  }

  console.log("All legal translations applied.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
