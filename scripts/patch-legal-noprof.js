const fs = require("fs");
const path = require("path");

const messagesDir = path.resolve(__dirname, "..", "src", "messages");
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

const enValue =
  "Calculators on this site are educational and informational. They are not a substitute for professional financial, medical, legal, or engineering advice. Always verify important results independently and consult a qualified professional where it matters.";
const zhValue =
  "本网站上的计算器仅用于教育和信息目的。它们不能替代专业的财务、医疗、法律或工程建议。请务必独立验证重要结果，并在必要时咨询合格的专业人士。";
const zhTwValue =
  "本網站上的計算器僅用於教育和資訊目的。它們不能替代專業的財務、醫療、法律或工程建議。請務必獨立驗證重要結果，並在必要時諮詢合格的專業人士。";

for (const loc of locales) {
  const filePath = path.join(messagesDir, `${loc}.json`);
  const messages = JSON.parse(fs.readFileSync(filePath, "utf8"));
  if (!messages.legal || !messages.legal.terms) {
    console.log(`[skip] ${loc}.json missing legal.terms`);
    continue;
  }
  messages.legal.terms.noProfessionalAdviceBody =
    loc === "zh" ? zhValue : loc === "zh-TW" ? zhTwValue : enValue;
  fs.writeFileSync(filePath, JSON.stringify(messages, null, 2) + "\n", "utf8");
  console.log(`[patched] ${loc}.json`);
}

console.log("noProfessionalAdviceBody patched.");
