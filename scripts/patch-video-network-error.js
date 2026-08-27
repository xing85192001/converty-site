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
  en: "Network error: failed to download the video processing core. Please check your connection and try again.",
  zh: "网络错误：下载视频处理核心失败，请检查网络后重试。",
  "zh-TW": "網路錯誤：下載影片處理核心失敗，請檢查網路後重試。",
  ar: "خطأ في الشبكة: فشل تنزيل نواة معالجة الفيديو. يرجى التحقق من الاتصال والمحاولة مرة أخرى.",
  cs: "Chyba sítě: nepodařilo se stáhnout jádro pro zpracování videa. Zkontrolujte připojení a zkuste to znovu.",
  de: "Netzwerkfehler: Der Download des Videoverarbeitungskerns ist fehlgeschlagen. Bitte überprüfen Sie Ihre Verbindung und versuchen Sie es erneut.",
  el: "Σφάλμα δικτύου: αποτυχία λήψης του πυρήνα επεξεργασίας βίντεο. Ελέγξτε τη σύνδεσή σας και δοκιμάστε ξανά.",
  es: "Error de red: no se pudo descargar el núcleo de procesamiento de video. Verifique su conexión e inténtelo de nuevo.",
  fr: "Erreur réseau : échec du téléchargement du cœur de traitement vidéo. Veuillez vérifier votre connexion et réessayer.",
  hu: "Hálózati hiba: a videófeldolgozó mag letöltése sikertelen. Ellenőrizze a kapcsolatot, és próbálja újra.",
  id: "Kesalahan jaringan: gagal mengunduh inti pemrosesan video. Periksa koneksi Anda dan coba lagi.",
  it: "Errore di rete: impossibile scaricare il core di elaborazione video. Controlla la connessione e riprova.",
  ja: "ネットワークエラー：動画処理コアのダウンロードに失敗しました。接続を確認して再試行してください。",
  ko: "네트워크 오류: 비디오 처리 코어 다운로드에 실패했습니다. 연결을 확인하고 다시 시도하세요.",
  ms: "Ralat rangkaian: gagal memuat turun teras pemprosesan video. Sila periksa sambungan anda dan cuba lagi.",
  nl: "Netwerkfout: downloaden van de videobewerkingskern mislukt. Controleer uw verbinding en probeer het opnieuw.",
  pt: "Erro de rede: falha ao baixar o núcleo de processamento de vídeo. Verifique sua conexão e tente novamente.",
  ru: "Ошибка сети: не удалось загрузить ядро обработки видео. Проверьте подключение и повторите попытку.",
  th: "ข้อผิดพลาดเครือข่าย: ไม่สามารถดาวน์โหลดคอร์ประมวลผลวิดีโอได้ โปรดตรวจสอบการเชื่อมต่อและลองอีกครั้ง",
  tr: "Ağ hatası: video işleme çekirdeği indirilemedi. Lütfen bağlantınızı kontrol edip tekrar deneyin.",
  uk: "Помилка мережі: не вдалося завантажити ядро обробки відео. Перевірте з'єднання та спробуйте ще раз.",
  vi: "Lỗi mạng: không tải được lõi xử lý video. Vui lòng kiểm tra kết nối và thử lại.",
};

const messagesDir = path.join(__dirname, "..", "src", "messages");

for (const locale of locales) {
  const filePath = path.join(messagesDir, `${locale}.json`);
  const content = fs.readFileSync(filePath, "utf8");

  const needle = `"errorFailed": `;
  if (content.includes(`"errorNetwork"`)) {
    console.log(`SKIP ${locale}.json: key already exists`);
    continue;
  }

  const replacement = `"errorNetwork": "${values[locale]}",\n      "errorFailed": `;
  const newContent = content.replace(needle, replacement);

  if (newContent === content) {
    console.error(`ERROR ${locale}.json: could not find anchor`);
    process.exit(1);
  }

  fs.writeFileSync(filePath, newContent);
  console.log(`UPDATED ${locale}.json`);
}

console.log("Done.");
