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
  phaseLoadingEngine: {
    en: "Loading processing engine...",
    zh: "正在加载处理引擎...",
    "zh-TW": "正在載入處理引擎...",
    ar: "جارٍ تحميل محرك المعالجة...",
    cs: "Načítání procesního enginu...",
    de: "Verarbeitungs-Engine wird geladen...",
    el: "Φόρτωση μηχανής επεξεργασίας...",
    es: "Cargando el motor de procesamiento...",
    fr: "Chargement du moteur de traitement...",
    hu: "Feldolgozó motor betöltése...",
    id: "Memuat mesin pemrosesan...",
    it: "Caricamento motore di elaborazione...",
    ja: "処理エンジンを読み込み中...",
    ko: "처리 엔진 로딩 중...",
    ms: "Memuatkan enjin pemprosesan...",
    nl: "Verwerkingsengine wordt geladen...",
    pt: "Carregando o motor de processamento...",
    ru: "Загрузка движка обработки...",
    th: "กำลังโหลดเครื่องมือประมวลผล...",
    tr: "İşleme motoru yükleniyor...",
    uk: "Завантаження рушія обробки...",
    vi: "Đang tải công cụ xử lý...",
  },
  phaseRemoving: {
    en: "Removing watermark...",
    zh: "正在去除水印...",
    "zh-TW": "正在去除水印...",
    ar: "جارٍ إزالة العلامة المائية...",
    cs: "Odstraňování vodoznaku...",
    de: "Wasserzeichen wird entfernt...",
    el: "Αφαίρεση υδατογράφηματος...",
    es: "Eliminando marca de agua...",
    fr: "Suppression du filigrane...",
    hu: "Vízjel eltávolítása...",
    id: "Menghapus tanda air...",
    it: "Rimozione filigrana...",
    ja: "透かしを除去中...",
    ko: "워터마크 제거 중...",
    ms: "Menghapus tanda air...",
    nl: "Watermerk verwijderen...",
    pt: "Removendo marca d'água...",
    ru: "Удаление водяного знака...",
    th: "กำลังลบลายน้ำ...",
    tr: "Filigran kaldırılıyor...",
    uk: "Видалення водяного знака...",
    vi: "Đang xóa hình mờ...",
  },
  zoomIn: {
    en: "Zoom in",
    zh: "放大",
    "zh-TW": "放大",
    ar: "تكبير",
    cs: "Přiblížit",
    de: "Vergrößern",
    el: "Μεγέθυνση",
    es: "Acercar",
    fr: "Zoom avant",
    hu: "Nagyítás",
    id: "Perbesar",
    it: "Ingrandisci",
    ja: "拡大",
    ko: "확대",
    ms: "Zum masuk",
    nl: "Inzoomen",
    pt: "Ampliar",
    ru: "Приблизить",
    th: "ขยาย",
    tr: "Yakınlaştır",
    uk: "Збільшити",
    vi: "Phóng to",
  },
  zoomOut: {
    en: "Zoom out",
    zh: "缩小",
    "zh-TW": "縮小",
    ar: "تصغير",
    cs: "Oddálit",
    de: "Verkleinern",
    el: "Σμίκρυνση",
    es: "Alejar",
    fr: "Zoom arrière",
    hu: "Kicsinyítés",
    id: "Perkecil",
    it: "Riduci",
    ja: "縮小",
    ko: "축소",
    ms: "Zum keluar",
    nl: "Uitzoomen",
    pt: "Reduzir",
    ru: "Отдалить",
    th: "ย่อ",
    tr: "Uzaklaştır",
    uk: "Зменшити",
    vi: "Thu nhỏ",
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
