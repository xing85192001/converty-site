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
];

for (const loc of locales) {
  const filePath = path.join(messagesDir, `${loc}.json`);
  const messages = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const legal = messages.legal;
  if (!legal) {
    console.log(`[skip] ${loc}.json missing legal`);
    continue;
  }

  // Update privacy markers
  if (legal.privacy) {
    legal.privacy.cookiesGoogle =
      "To learn more about how Google uses data when you use our partners' sites and apps, visit <link1>Google's Advertising Policies</link1>. You can manage personalization at <link2>Ads Settings</link2>.";
    legal.privacy.contactBody =
      "If you have any questions about this policy, contact us at <email>85192001@qq.com</email>.";
  }

  // Update contact markers
  if (legal.contact) {
    legal.contact.emailGeneral = "General & support: <email>xingxing85192001@gmail.com</email>";
    legal.contact.emailPrivacy = "Privacy questions: <email>85192001@qq.com</email>";
  }

  fs.writeFileSync(filePath, JSON.stringify(messages, null, 2) + "\n", "utf8");
  console.log(`[patched] ${loc}.json`);
}

console.log("Legal markers patched for non-Chinese locales.");
