const fs = require("fs");
const path = require("path");

const messagesDir = path.resolve(__dirname, "..", "src", "messages");
const en = JSON.parse(fs.readFileSync(path.join(messagesDir, "en.json"), "utf8"));
if (!en.legal) throw new Error("en.json missing legal namespace");

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

const zhLegal = {
  terms: {
    description: "使用我们的免费计算器和转换器的规则。",
    intro: "使用 {siteName} 即表示您同意以下条款。这些工具免费提供给一般信息用途。",
    accuracy: "准确性",
    accuracyBody:
      "我们努力确保每个工具的准确性，但不保证结果完整、正确或适合您的具体情况。使用这些工具的风险由您自行承担。",
    advertising: "广告",
    advertisingBody:
      "本网站展示第三方广告（包括 Google AdSense）。广告商对其自身内容负责，他们对您数据的使用受其隐私政策约束。",
    changes: "变更",
    changesBody: "我们可能会不时更新这些条款。在变更后继续使用本网站，即表示您接受更新后的条款。",
  },
  privacy: {
    description: "当您使用我们的免费在线计算器时，我们如何处理信息。",
    intro:
      "本隐私政策说明您访问 {siteName} 时收集哪些信息以及如何使用这些信息。本网站是一个静态 Web 应用：无需创建账户，也无需提交个人信息即可使用任何计算器。",
    infoCollectedBody:
      "当您访问本网站时，我们的托管服务商（Vercel）以及已启用的分析和广告合作伙伴会自动接收标准技术信息，例如您的 IP 地址、浏览器类型、设备类型、语言偏好、来源页面以及访问日期和时间。这些信息仅用于运营、保护和改进网站。",
    cookiesBody:
      "我们使用 Cookie 和类似技术来记住您的偏好，并通过 Google AdSense 投放个性化广告。广告商可能会根据您在不同网站的活动使用 Cookie 建立兴趣档案。您可以通过首次访问时显示的同意横幅控制非必要 Cookie，也可以随时清除本网站存储来更改选择。",
    cookiesGoogle:
      "要了解 Google 如何在使用我们合作伙伴的网站和应用时使用数据，请访问 {googlePoliciesLink}。您可以在 {adsSettingsLink} 管理个性化设置。",
    cookiesGoogleLink: "Google 广告政策",
    cookiesAdsLink: "广告设置",
    yourRightsBody:
      "根据您所在的地区（例如欧盟 GDPR 或加利福尼亚 CCPA），您可能有权访问、更正或删除个人数据，并反对某些处理。由于本网站不在自己的服务器上存储个人数据，大多数请求涉及我们的服务提供商持有的数据，我们将根据请求协助您处理。",
    contactBody: "如果您对本政策有任何疑问，请通过 {email} 联系我们。",
  },
  contact: {
    description: "有问题、更正或合作想法？随时与我们联系。",
    intro: "我们会阅读每一条消息，并尽量在几个工作日内回复。最快的方式是通过电子邮件联系我们。",
    emailTitle: "电子邮件",
    emailGeneral: "一般与支持：{email}",
    emailPrivacy: "隐私问题：{email}",
  },
};

const zhTwLegal = {
  terms: {
    description: "使用我們的免費計算器和轉換器的規則。",
    intro: "使用 {siteName} 即表示您同意以下條款。這些工具免費提供給一般資訊用途。",
    accuracy: "準確性",
    accuracyBody:
      "我們努力確保每個工具的準確性，但不保證結果完整、正確或適合您的具體情況。使用這些工具的風險由您自行承擔。",
    advertising: "廣告",
    advertisingBody:
      "本網站展示第三方廣告（包括 Google AdSense）。廣告商對其自身內容負責，他們對您數據的使用受其隱私政策約束。",
    changes: "變更",
    changesBody: "我們可能會不時更新這些條款。在變更後繼續使用本網站，即表示您接受更新後的條款。",
  },
  privacy: {
    description: "當您使用我們的免費線上計算器時，我們如何處理資訊。",
    intro:
      "本隱私政策說明您訪問 {siteName} 時收集哪些資訊以及如何使用這些資訊。本網站是一個靜態 Web 應用：無需建立帳戶，也無需提交個人資訊即可使用任何計算器。",
    infoCollectedBody:
      "當您訪問本網站時，我們的託管服務商（Vercel）以及已啟用的分析和廣告合作夥伴會自動接收標準技術資訊，例如您的 IP 位址、瀏覽器類型、裝置類型、語言偏好、來源頁面以及訪問日期和時間。這些資訊僅用於運營、保護和改進網站。",
    cookiesBody:
      "我們使用 Cookie 和類似技術來記住您的偏好，並透過 Google AdSense 投放個人化廣告。廣告商可能會根據您在不同網站的活動使用 Cookie 建立興趣檔案。您可以透過首次訪問時顯示的同意橫幅控制非必要 Cookie，也可以隨時清除本網站儲存來更改選擇。",
    cookiesGoogle:
      "要了解 Google 如何在使用我們合作夥伴的網站和應用時使用數據，請訪問 {googlePoliciesLink}。您可以在 {adsSettingsLink} 管理個人化設定。",
    cookiesGoogleLink: "Google 廣告政策",
    cookiesAdsLink: "廣告設定",
    yourRightsBody:
      "根據您所在的地區（例如歐盟 GDPR 或加利福尼亞 CCPA），您可能有權訪問、更正或刪除個人數據，並反對某些處理。由於本網站不在自己的伺服器上儲存個人數據，大多數請求涉及我們的服務提供商持有的數據，我們將根據請求協助您處理。",
    contactBody: "如果您對本政策有任何疑問，請透過 {email} 聯繫我們。",
  },
  contact: {
    description: "有問題、更正或合作想法？隨時與我們聯繫。",
    intro: "我們會閱讀每一條訊息，並盡量在幾個工作日內回覆。最快的方式是透過電子郵件聯繫我們。",
    emailTitle: "電子郵件",
    emailGeneral: "一般與支援：{email}",
    emailPrivacy: "隱私問題：{email}",
  },
};

for (const loc of locales) {
  const filePath = path.join(messagesDir, `${loc}.json`);
  const messages = JSON.parse(fs.readFileSync(filePath, "utf8"));
  if (messages.legal) {
    console.log(`[skip] ${loc}.json already has legal namespace`);
    continue;
  }
  if (loc === "zh") {
    messages.legal = zhLegal;
  } else if (loc === "zh-TW") {
    messages.legal = zhTwLegal;
  } else {
    messages.legal = en.legal;
  }
  fs.writeFileSync(filePath, JSON.stringify(messages, null, 2) + "\n", "utf8");
  console.log(`[applied] ${loc}.json`);
}

console.log("Legal namespace applied to all locales.");
