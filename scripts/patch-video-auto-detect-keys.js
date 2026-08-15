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

const keys = {
  autoDetect: {
    en: "Auto Detect Watermark",
    zh: "自动识别水印",
    "zh-TW": "自動識別水印",
    ar: "كشف العلامة المائية تلقائيًا",
    cs: "Automaticky detekovat vodoznak",
    de: "Wasserzeichen automatisch erkennen",
    el: "Αυτόματος εντοπισμός υδατογραφήματος",
    es: "Detectar marca de agua automáticamente",
    fr: "Détection automatique du filigrane",
    hu: "Vízjel automatikus felismerése",
    id: "Deteksi Otomatis Tanda Air",
    it: "Rilevamento automatico filigrana",
    ja: "自動で透かしを検出",
    ko: "자동 워터마크 감지",
    ms: "Kesan Tanda Air Secara Automatik",
    nl: "Watermerk automatisch detecteren",
    pt: "Detectar marca d'água automaticamente",
    ru: "Автоматическое обнаружение водяного знака",
    th: "ตรวจจับลายน้ำอัตโนมัติ",
    tr: "Filigranı Otomatik Algıla",
    uk: "Автоматичне визначення водяного знака",
    vi: "Tự động nhận diện hình mờ",
  },
  autoDetecting: {
    en: "Detecting...",
    zh: "识别中...",
    "zh-TW": "識別中...",
    ar: "جارٍ الكشف...",
    cs: "Detekuji...",
    de: "Erkennung läuft...",
    el: "Εντοπισμός...",
    es: "Detectando...",
    fr: "Détection en cours...",
    hu: "Felismerés...",
    id: "Mendeteksi...",
    it: "Rilevamento in corso...",
    ja: "検出中...",
    ko: "감지 중...",
    ms: "Mengesan...",
    nl: "Bezig met detecteren...",
    pt: "Detectando...",
    ru: "Обнаружение...",
    th: "กำลังตรวจจับ...",
    tr: "Algılanıyor...",
    uk: "Визначення...",
    vi: "Đang nhận diện...",
  },
  autoDetectNone: {
    en: "No obvious watermark detected. Please draw a box over the watermark manually.",
    zh: "未识别到明显水印，请手动框选水印区域。",
    "zh-TW": "未識別到明顯水印，請手動框選水印區域。",
    ar: "لم يتم اكتشاف علامة مائية واضحة. يرجى رسم مربع حول العلامة المائية يدويًا.",
    cs: "Nebyl detekován žádný zřejmý vodoznak. Nakreslete prosím rámeček kolem vodoznaku ručně.",
    de: "Kein eindeutiges Wasserzeichen erkannt. Bitte ziehen Sie manuell einen Rahmen um das Wasserzeichen.",
    el: "Δεν εντοπίστηκε εμφανές υδατογράφημα. Σχεδιάστε χειροκίνητα ένα πλαίσιο γύρω από το υδατογράφημα.",
    es: "No se detectó una marca de agua evidente. Dibuje un cuadro sobre la marca de agua manualmente.",
    fr: "Aucun filigrane évident détecté. Veuillez dessiner manuellement une zone autour du filigrane.",
    hu: "Nem észlelhető egyértelmű vízjel. Kérjük, rajzoljon manuálisan egy négyzetet a vízjel köré.",
    id: "Tidak ada tanda air yang terdeteksi. Silakan gambar kotak di area tanda air secara manual.",
    it: "Nessun filigrana evidente rilevato. Disegna manualmente un riquadro intorno alla filigrana.",
    ja: "明確な透かしが検出されませんでした。透かし領域を手動で囲ってください。",
    ko: "뚜렷한 워터마크가 감지되지 않았습니다. 워터마크 영역을 수동으로 표시해 주세요.",
    ms: "Tiada tanda air yang jelas dikesan. Sila lukis kotak mengikut tanda air secara manual.",
    nl: "Geen duidelijk watermerk gedetecteerd. Teken handmatig een vak rond het watermerk.",
    pt: "Nenhuma marca d'água óbvia detectada. Desenhe manualmente uma caixa sobre a marca d'água.",
    ru: "Очевидный водяной знак не обнаружен. Пожалуйста, обведите область водяного знака вручную.",
    th: "ไม่พบลายน้ำที่ชัดเจน กรุณาวาดกรอบรอบลายน้ำด้วยตนเอง",
    tr: "Belirgin bir filigran algılanamadı. Lütfen filigranın etrafına manuel olarak kutu çizin.",
    uk: "Не виявлено помітного водяного знака. Будь ласка, вручну намалюйте рамку навколо водяного знака.",
    vi: "Không phát hiện hình mờ rõ ràng. Vui lòng tự vẽ khung quanh vùng hình mờ.",
  },
  candidateLabel: {
    en: "Watermark {index}",
    zh: "水印 {index}",
    "zh-TW": "水印 {index}",
    ar: "علامة مائية {index}",
    cs: "Vodoznak {index}",
    de: "Wasserzeichen {index}",
    el: "Υδατογράφημα {index}",
    es: "Marca de agua {index}",
    fr: "Filigrane {index}",
    hu: "Vízjel {index}",
    id: "Tanda air {index}",
    it: "Filigrana {index}",
    ja: "透かし {index}",
    ko: "워터마크 {index}",
    ms: "Tanda air {index}",
    nl: "Watermerk {index}",
    pt: "Marca d'água {index}",
    ru: "Водяной знак {index}",
    th: "ลายน้ำ {index}",
    tr: "Filigran {index}",
    uk: "Водяний знак {index}",
    vi: "Hình mờ {index}",
  },
};

const messagesDir = path.join(__dirname, "..", "src", "messages");

for (const locale of locales) {
  const filePath = path.join(messagesDir, `${locale}.json`);
  let content = fs.readFileSync(filePath, "utf8");

  const namespaceMatch = content.match(/"videoWatermarkRemover":\s*\{([\s\S]*?)\n\s*\},/);
  if (!namespaceMatch) {
    console.error(`ERROR ${locale}.json: namespace not found`);
    process.exit(1);
  }

  const namespaceBody = namespaceMatch[1];
  const missingLines = [];
  for (const [key, values] of Object.entries(keys)) {
    if (!namespaceBody.includes(`"${key}":`)) {
      missingLines.push(`      "${key}": "${values[locale]}",`);
    }
  }

  if (missingLines.length === 0) {
    console.log(`SKIP ${locale}.json: all keys exist in video namespace`);
    continue;
  }

  const openMarker = '"videoWatermarkRemover": {';
  content = content.replace(openMarker, `${openMarker}\n${missingLines.join("\n")}`);
  fs.writeFileSync(filePath, content);
  console.log(`UPDATED ${locale}.json (+${missingLines.length} keys)`);
}

console.log("Done.");
