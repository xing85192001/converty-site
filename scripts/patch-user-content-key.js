const fs = require("fs");
const path = require("path");

const locales = [
  "en",
  "zh",
  "zh-TW",
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
];

const values = {
  en: "User Content",
  zh: "用户内容",
  "zh-TW": "用戶內容",
  ar: "محتوى المستخدم",
  cs: "Uživatelský obsah",
  de: "Nutzerinhalte",
  el: "Περιεχόμενο χρήστη",
  es: "Contenido del usuario",
  fr: "Contenu utilisateur",
  hu: "Felhasználói tartalom",
  id: "Konten Pengguna",
  it: "Contenuto degli utenti",
  ja: "ユーザー生成コンテンツ",
  ko: "사용자 콘텐츠",
  ms: "Kandungan Pengguna",
  nl: "Gebruikersinhoud",
  pt: "Conteúdo do usuário",
  ru: "Пользовательский контент",
  th: "เนื้อหาของผู้ใช้",
  tr: "Kullanıcı İçeriği",
  uk: "Користувацький контент",
  vi: "Nội dung ngườI dùng",
};

const messagesDir = path.join(__dirname, "..", "src", "messages");

for (const locale of locales) {
  const filePath = path.join(messagesDir, `${locale}.json`);
  const content = fs.readFileSync(filePath, "utf8");

  // Insert "user-content" right before "user-content-body" in the ui namespace.
  const needle = `"user-content-body"`;
  if (content.includes(`"user-content"`)) {
    console.log(`SKIP ${locale}.json: key already exists`);
    continue;
  }

  const replacement = `"user-content": "${values[locale]}",\n    "user-content-body"`;
  const newContent = content.replace(needle, replacement);

  if (newContent === content) {
    console.error(`ERROR ${locale}.json: could not find anchor`);
    process.exit(1);
  }

  fs.writeFileSync(filePath, newContent);
  console.log(`UPDATED ${locale}.json`);
}

console.log("Done.");
