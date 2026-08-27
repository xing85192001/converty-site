// Script to translate converter namespace for all languages
// Usage: node translate-converter.js

const fs = require('fs');
const path = require('path');

const MESSAGES_DIR = './src/messages';

// Common UI translations
const UI_DICT = {
  en: null,
  vi: {
    "Category": "Danh mục", "Value": "Giá trị", "From": "Từ", "To": "Đến", "Swap": "Hoán đổi",
    "Result": "Kết quả", "Calculate": "Tính toán", "Reset": "Đặt lại", "Input": "Đầu vào",
    "Output": "Đầu ra", "Settings": "Cài đặt", "Options": "Tùy chọn", "Save": "Lưu",
    "Cancel": "Hủy", "Delete": "Xóa", "Edit": "Chỉnh sửa", "Add": "Thêm",
    "Search": "Tìm kiếm", "Filter": "Bộ lọc", "Sort": "Sắp xếp", "Export": "Xuất",
    "Import": "Nhập", "Download": "Tải xuống", "Upload": "Tải lên", "Print": "In",
    "Copy": "Sao chép", "Paste": "Dán", "Clear": "Xóa", "Close": "Đóng",
    "Open": "Mở", "Next": "Tiếp theo", "Previous": "Trước", "Back": "Quay lại",
    "Finish": "Hoàn thành", "Start": "Bắt đầu", "Stop": "Dừng", "Continue": "Tiếp tục",
    "Loading...": "Đang tải...", "Processing...": "Đang xử lý...", "Error": "Lỗi",
    "Success": "Thành công", "Warning": "Cảnh báo", "Info": "Thông tin",
    "Yes": "Có", "No": "Không", "OK": "OK", "Cancel": "Hủy",
    "Select": "Chọn", "All": "Tất cả", "None": "Không có", "Other": "Khác",
    "Custom": "Tùy chỉnh", "Default": "Mặc định", "Advanced": "Nâng cao",
    "Basic": "Cơ bản", "Pro": "Chuyên nghiệp", "Free": "Miễn phí",
    "Premium": "Cao cấp", "Professional": "Chuyên nghiệp",
    "Description": "Mô tả", "Name": "Tên", "Title": "Tiêu đề",
    "Price": "Giá", "Cost": "Chi phí", "Fee": "Phí", "Tax": "Thuế",
    "Total": "Tổng", "Subtotal": "Tổng phụ", "Grand Total": "Tổng cộng",
    "Amount": "Số tiền", "Quantity": "Số lượng", "Unit": "Đơn vị",
    "Rate": "Tỷ lệ", "Percentage": "Phần trăm", "Ratio": "Tỷ lệ",
    "Year": "Năm", "Month": "Tháng", "Week": "Tuần", "Day": "Ngày",
    "Hour": "Giờ", "Minute": "Phút", "Second": "Giây",
    "Years": "Năm", "Months": "Tháng", "Weeks": "Tuần", "Days": "Ngày",
    "Hours": "Giờ", "Minutes": "Phút", "Seconds": "Giây",
    "Per year": "Mỗi năm", "Per month": "Mỗi tháng", "Per week": "Mỗi tuần",
    "Per day": "Mỗi ngày", "Per hour": "Mỗi giờ", "Per minute": "Mỗi phút",
  },
  id: {
    "Category": "Kategori", "Value": "Nilai", "From": "Dari", "To": "Ke", "Swap": "Tukar",
    "Result": "Hasil", "Calculate": "Hitung", "Reset": "Atur ulang", "Input": "Masukan",
    "Output": "Keluaran", "Settings": "Pengaturan", "Options": "Pilihan", "Save": "Simpan",
    "Cancel": "Batal", "Delete": "Hapus", "Edit": "Edit", "Add": "Tambah",
    "Search": "Cari", "Filter": "Saring", "Sort": "Urutkan", "Export": "Ekspor",
    "Import": "Impor", "Download": "Unduh", "Upload": "Unggah", "Print": "Cetak",
    "Copy": "Salin", "Paste": "Tempel", "Clear": "Bersihkan", "Close": "Tutup",
    "Open": "Buka", "Next": "Berikutnya", "Previous": "Sebelumnya", "Back": "Kembali",
    "Finish": "Selesai", "Start": "Mulai", "Stop": "Berhenti", "Continue": "Lanjutkan",
    "Loading...": "Memuat...", "Processing...": "Memproses...", "Error": "Kesalahan",
    "Success": "Berhasil", "Warning": "Peringatan", "Info": "Informasi",
    "Yes": "Ya", "No": "Tidak", "OK": "OK",
    "Select": "Pilih", "All": "Semua", "None": "Tidak ada", "Other": "Lainnya",
    "Custom": "Kustom", "Default": "Default", "Advanced": "Lanjutan",
    "Basic": "Dasar", "Pro": "Pro", "Free": "Gratis",
    "Premium": "Premium", "Professional": "Profesional",
    "Description": "Deskripsi", "Name": "Nama", "Title": "Judul",
    "Price": "Harga", "Cost": "Biaya", "Fee": "Biaya", "Tax": "Pajak",
    "Total": "Total", "Subtotal": "Subtotal", "Grand Total": "Total Keseluruhan",
    "Amount": "Jumlah", "Quantity": "Kuantitas", "Unit": "Satuan",
    "Rate": "Tarif", "Percentage": "Persentase", "Ratio": "Rasio",
    "Year": "Tahun", "Month": "Bulan", "Week": "Minggu", "Day": "Hari",
    "Hour": "Jam", "Minute": "Menit", "Second": "Detik",
    "Years": "Tahun", "Months": "Bulan", "Weeks": "Minggu", "Days": "Hari",
    "Hours": "Jam", "Minutes": "Menit", "Seconds": "Detik",
    "Per year": "Per tahun", "Per month": "Per bulan", "Per week": "Per minggu",
    "Per day": "Per hari", "Per hour": "Per jam", "Per minute": "Per menit",
  },
  pt: {
    "Category": "Categoria", "Value": "Valor", "From": "De", "To": "Para", "Swap": "Trocar",
    "Result": "Resultado", "Calculate": "Calcular", "Reset": "Redefinir", "Input": "Entrada",
    "Output": "Saída", "Settings": "Configurações", "Options": "Opções", "Save": "Salvar",
    "Cancel": "Cancelar", "Delete": "Excluir", "Edit": "Editar", "Add": "Adicionar",
    "Search": "Pesquisar", "Filter": "Filtrar", "Sort": "Ordenar", "Export": "Exportar",
    "Import": "Importar", "Download": "Baixar", "Upload": "Enviar", "Print": "Imprimir",
    "Copy": "Copiar", "Paste": "Colar", "Clear": "Limpar", "Close": "Fechar",
    "Open": "Abrir", "Next": "Próximo", "Previous": "Anterior", "Back": "Voltar",
    "Finish": "Concluir", "Start": "Iniciar", "Stop": "Parar", "Continue": "Continuar",
    "Loading...": "Carregando...", "Processing...": "Processando...", "Error": "Erro",
    "Success": "Sucesso", "Warning": "Aviso", "Info": "Informação",
    "Yes": "Sim", "No": "Não", "OK": "OK",
    "Select": "Selecionar", "All": "Todos", "None": "Nenhum", "Other": "Outro",
    "Custom": "Personalizado", "Default": "Padrão", "Advanced": "Avançado",
    "Basic": "Básico", "Pro": "Pro", "Free": "Grátis",
    "Premium": "Premium", "Professional": "Profissional",
    "Description": "Descrição", "Name": "Nome", "Title": "Título",
    "Price": "Preço", "Cost": "Custo", "Fee": "Taxa", "Tax": "Imposto",
    "Total": "Total", "Subtotal": "Subtotal", "Grand Total": "Total Geral",
    "Amount": "Valor", "Quantity": "Quantidade", "Unit": "Unidade",
    "Rate": "Taxa", "Percentage": "Porcentagem", "Ratio": "Proporção",
    "Year": "Ano", "Month": "Mês", "Week": "Semana", "Day": "Dia",
    "Hour": "Hora", "Minute": "Minuto", "Second": "Segundo",
    "Years": "Anos", "Months": "Meses", "Weeks": "Semanas", "Days": "Dias",
    "Hours": "Horas", "Minutes": "Minutos", "Seconds": "Segundos",
    "Per year": "Por ano", "Per month": "Por mês", "Per week": "Por semana",
    "Per day": "Por dia", "Per hour": "Por hora", "Per minute": "Por minuto",
  },
  ms: {
    "Category": "Kategori", "Value": "Nilai", "From": "Dari", "To": "Ke", "Swap": "Tukar",
    "Result": "Hasil", "Calculate": "Kira", "Reset": "Tetapkan semula", "Input": "Input",
    "Output": "Output", "Settings": "Tetapan", "Options": "Pilihan", "Save": "Simpan",
    "Cancel": "Batal", "Delete": "Padam", "Edit": "Edit", "Add": "Tambah",
    "Search": "Cari", "Filter": "Penapis", "Sort": "Susun", "Export": "Eksport",
    "Import": "Import", "Download": "Muat turun", "Upload": "Muat naik", "Print": "Cetak",
    "Copy": "Salin", "Paste": "Tampal", "Clear": "Kosongkan", "Close": "Tutup",
    "Open": "Buka", "Next": "Seterusnya", "Previous": "Sebelumnya", "Back": "Kembali",
    "Finish": "Selesai", "Start": "Mula", "Stop": "Berhenti", "Continue": "Teruskan",
    "Loading...": "Memuatkan...", "Processing...": "Memproses...", "Error": "Ralat",
    "Success": "Berjaya", "Warning": "Amaran", "Info": "Maklumat",
    "Yes": "Ya", "No": "Tidak", "OK": "OK",
    "Select": "Pilih", "All": "Semua", "None": "Tiada", "Other": "Lain-lain",
    "Custom": "Kustom", "Default": "Lalai", "Advanced": "Lanjutan",
    "Basic": "Asas", "Pro": "Pro", "Free": "Percuma",
    "Premium": "Premium", "Professional": "Profesional",
    "Description": "Penerangan", "Name": "Nama", "Title": "Tajuk",
    "Price": "Harga", "Cost": "Kos", "Fee": "Bayaran", "Tax": "Cukai",
    "Total": "Jumlah", "Subtotal": "Subtotal", "Grand Total": "Jumlah Keseluruhan",
    "Amount": "Jumlah", "Quantity": "Kuantiti", "Unit": "Unit",
    "Rate": "Kadar", "Percentage": "Peratusan", "Ratio": "Nisbah",
    "Year": "Tahun", "Month": "Bulan", "Week": "Minggu", "Day": "Hari",
    "Hour": "Jam", "Minute": "Minit", "Second": "Saat",
    "Years": "Tahun", "Months": "Bulan", "Weeks": "Minggu", "Days": "Hari",
    "Hours": "Jam", "Minutes": "Minit", "Seconds": "Saat",
    "Per year": "Setahun", "Per month": "Sebulan", "Per week": "Seminggu",
    "Per day": "Sehari", "Per hour": "Sejam", "Per minute": "Seminit",
  },
  cs: {
    "Category": "Kategorie", "Value": "Hodnota", "From": "Z", "To": "Na", "Swap": "Zaměnit",
    "Result": "Výsledek", "Calculate": "Vypočítat", "Reset": "Resetovat", "Input": "Vstup",
    "Output": "Výstup", "Settings": "Nastavení", "Options": "Možnosti", "Save": "Uložit",
    "Cancel": "Zrušit", "Delete": "Smazat", "Edit": "Upravit", "Add": "Přidat",
    "Search": "Hledat", "Filter": "Filtr", "Sort": "Řazení", "Export": "Exportovat",
    "Import": "Importovat", "Download": "Stáhnout", "Upload": "Nahrát", "Print": "Tisk",
    "Copy": "Kopírovat", "Paste": "Vložit", "Clear": "Vymazat", "Close": "Zavřít",
    "Open": "Otevřít", "Next": "Další", "Previous": "Předchozí", "Back": "Zpět",
    "Finish": "Dokončit", "Start": "Spustit", "Stop": "Zastavit", "Continue": "Pokračovat",
    "Loading...": "Načítání...", "Processing...": "Zpracovávání...", "Error": "Chyba",
    "Success": "Úspěch", "Warning": "Varování", "Info": "Informace",
    "Yes": "Ano", "No": "Ne", "OK": "OK",
    "Select": "Vybrat", "All": "Vše", "None": "Žádné", "Other": "Jiné",
    "Custom": "Vlastní", "Default": "Výchozí", "Advanced": "Pokročilé",
    "Basic": "Základní", "Pro": "Pro", "Free": "Zdarma",
    "Premium": "Prémiový", "Professional": "Profesionální",
    "Description": "Popis", "Name": "Název", "Title": "Titulek",
    "Price": "Cena", "Cost": "Náklady", "Fee": "Poplatek", "Tax": "Daň",
    "Total": "Celkem", "Subtotal": "Mezisoučet", "Grand Total": "Celkový součet",
    "Amount": "Částka", "Quantity": "Množství", "Unit": "Jednotka",
    "Rate": "Sazba", "Percentage": "Procento", "Ratio": "Poměr",
    "Year": "Rok", "Month": "Měsíc", "Week": "Týden", "Day": "Den",
    "Hour": "Hodina", "Minute": "Minuta", "Second": "Sekunda",
    "Years": "Roky", "Months": "Měsíce", "Weeks": "Týdny", "Days": "Dny",
    "Hours": "Hodiny", "Minutes": "Minuty", "Seconds": "Sekundy",
    "Per year": "Ročně", "Per month": "Měsíčně", "Per week": "Týdně",
    "Per day": "Denně", "Per hour": "Hodinově", "Per minute": "Minutově",
  },
  es: {
    "Category": "Categoría", "Value": "Valor", "From": "De", "To": "A", "Swap": "Intercambiar",
    "Result": "Resultado", "Calculate": "Calcular", "Reset": "Reiniciar", "Input": "Entrada",
    "Output": "Salida", "Settings": "Ajustes", "Options": "Opciones", "Save": "Guardar",
    "Cancel": "Cancelar", "Delete": "Eliminar", "Edit": "Editar", "Add": "Añadir",
    "Search": "Buscar", "Filter": "Filtrar", "Sort": "Ordenar", "Export": "Exportar",
    "Import": "Importar", "Download": "Descargar", "Upload": "Subir", "Print": "Imprimir",
    "Copy": "Copiar", "Paste": "Pegar", "Clear": "Limpiar", "Close": "Cerrar",
    "Open": "Abrir", "Next": "Siguiente", "Previous": "Anterior", "Back": "Volver",
    "Finish": "Terminar", "Start": "Empezar", "Stop": "Detener", "Continue": "Continuar",
    "Loading...": "Cargando...", "Processing...": "Procesando...", "Error": "Error",
    "Success": "Éxito", "Warning": "Advertencia", "Info": "Información",
    "Yes": "Sí", "No": "No", "OK": "OK",
    "Select": "Seleccionar", "All": "Todos", "None": "Ninguno", "Other": "Otro",
    "Custom": "Personalizado", "Default": "Predeterminado", "Advanced": "Avanzado",
    "Basic": "Básico", "Pro": "Pro", "Free": "Gratis",
    "Premium": "Premium", "Professional": "Profesional",
    "Description": "Descripción", "Name": "Nombre", "Title": "Título",
    "Price": "Precio", "Cost": "Costo", "Fee": "Tarifa", "Tax": "Impuesto",
    "Total": "Total", "Subtotal": "Subtotal", "Grand Total": "Total General",
    "Amount": "Monto", "Quantity": "Cantidad", "Unit": "Unidad",
    "Rate": "Tasa", "Percentage": "Porcentaje", "Ratio": "Proporción",
    "Year": "Año", "Month": "Mes", "Week": "Semana", "Day": "Día",
    "Hour": "Hora", "Minute": "Minuto", "Second": "Segundo",
    "Years": "Años", "Months": "Meses", "Weeks": "Semanas", "Days": "Días",
    "Hours": "Horas", "Minutes": "Minutos", "Seconds": "Segundos",
    "Per year": "Por año", "Per month": "Por mes", "Per week": "Por semana",
    "Per day": "Por día", "Per hour": "Por hora", "Per minute": "Por minuto",
  },
  fr: {
    "Category": "Catégorie", "Value": "Valeur", "From": "De", "To": "À", "Swap": "Échanger",
    "Result": "Résultat", "Calculate": "Calculer", "Reset": "Réinitialiser", "Input": "Entrée",
    "Output": "Sortie", "Settings": "Paramètres", "Options": "Options", "Save": "Enregistrer",
    "Cancel": "Annuler", "Delete": "Supprimer", "Edit": "Modifier", "Add": "Ajouter",
    "Search": "Rechercher", "Filter": "Filtrer", "Sort": "Trier", "Export": "Exporter",
    "Import": "Importer", "Download": "Télécharger", "Upload": "Téléverser", "Print": "Imprimer",
    "Copy": "Copier", "Paste": "Coller", "Clear": "Effacer", "Close": "Fermer",
    "Open": "Ouvrir", "Next": "Suivant", "Previous": "Précédent", "Back": "Retour",
    "Finish": "Terminer", "Start": "Commencer", "Stop": "Arrêter", "Continue": "Continuer",
    "Loading...": "Chargement...", "Processing...": "Traitement...", "Error": "Erreur",
    "Success": "Succès", "Warning": "Avertissement", "Info": "Information",
    "Yes": "Oui", "No": "Non", "OK": "OK",
    "Select": "Sélectionner", "All": "Tous", "None": "Aucun", "Other": "Autre",
    "Custom": "Personnalisé", "Default": "Par défaut", "Advanced": "Avancé",
    "Basic": "Basique", "Pro": "Pro", "Free": "Gratuit",
    "Premium": "Premium", "Professional": "Professionnel",
    "Description": "Description", "Name": "Nom", "Title": "Titre",
    "Price": "Prix", "Cost": "Coût", "Fee": "Frais", "Tax": "Impôt",
    "Total": "Total", "Subtotal": "Sous-total", "Grand Total": "Total Général",
    "Amount": "Montant", "Quantity": "Quantité", "Unit": "Unité",
    "Rate": "Taux", "Percentage": "Pourcentage", "Ratio": "Ratio",
    "Year": "Année", "Month": "Mois", "Week": "Semaine", "Day": "Jour",
    "Hour": "Heure", "Minute": "Minute", "Second": "Seconde",
    "Years": "Années", "Months": "Mois", "Weeks": "Semaines", "Days": "Jours",
    "Hours": "Heures", "Minutes": "Minutes", "Seconds": "Secondes",
    "Per year": "Par an", "Per month": "Par mois", "Per week": "Par semaine",
    "Per day": "Par jour", "Per hour": "Par heure", "Per minute": "Par minute",
  },
  de: {
    "Category": "Kategorie", "Value": "Wert", "From": "Von", "To": "Nach", "Swap": "Tauschen",
    "Result": "Ergebnis", "Calculate": "Berechnen", "Reset": "Zurücksetzen", "Input": "Eingabe",
    "Output": "Ausgabe", "Settings": "Einstellungen", "Options": "Optionen", "Save": "Speichern",
    "Cancel": "Abbrechen", "Delete": "Löschen", "Edit": "Bearbeiten", "Add": "Hinzufügen",
    "Search": "Suchen", "Filter": "Filtern", "Sort": "Sortieren", "Export": "Exportieren",
    "Import": "Importieren", "Download": "Herunterladen", "Upload": "Hochladen", "Print": "Drucken",
    "Copy": "Kopieren", "Paste": "Einfügen", "Clear": "Löschen", "Close": "Schließen",
    "Open": "Öffnen", "Next": "Weiter", "Previous": "Zurück", "Back": "Zurück",
    "Finish": "Fertig", "Start": "Starten", "Stop": "Stoppen", "Continue": "Fortsetzen",
    "Loading...": "Laden...", "Processing...": "Verarbeitung...", "Error": "Fehler",
    "Success": "Erfolg", "Warning": "Warnung", "Info": "Information",
    "Yes": "Ja", "No": "Nein", "OK": "OK",
    "Select": "Auswählen", "All": "Alle", "None": "Keine", "Other": "Sonstige",
    "Custom": "Benutzerdefiniert", "Default": "Standard", "Advanced": "Erweitert",
    "Basic": "Basic", "Pro": "Pro", "Free": "Kostenlos",
    "Premium": "Premium", "Professional": "Professionell",
    "Description": "Beschreibung", "Name": "Name", "Title": "Titel",
    "Price": "Preis", "Cost": "Kosten", "Fee": "Gebühr", "Tax": "Steuer",
    "Total": "Gesamt", "Subtotal": "Zwischensumme", "Grand Total": "Gesamtbetrag",
    "Amount": "Betrag", "Quantity": "Menge", "Unit": "Einheit",
    "Rate": "Rate", "Percentage": "Prozent", "Ratio": "Verhältnis",
    "Year": "Jahr", "Month": "Monat", "Week": "Woche", "Day": "Tag",
    "Hour": "Stunde", "Minute": "Minute", "Second": "Sekunde",
    "Years": "Jahre", "Months": "Monate", "Weeks": "Wochen", "Days": "Tage",
    "Hours": "Stunden", "Minutes": "Minuten", "Seconds": "Sekunden",
    "Per year": "Pro Jahr", "Per month": "Pro Monat", "Per week": "Pro Woche",
    "Per day": "Pro Tag", "Per hour": "Pro Stunde", "Per minute": "Pro Minute",
  },
};

// Locales to translate (skip en, zh, zh-TW)
const LOCALES = ["vi", "id", "pt", "ms", "cs", "es", "fr", "de", "el", "hu", "it", "nl", "th", "tr", "uk", "ru", "ko", "ja", "ar"];

function translateString(locale, text) {
  if (!text || typeof text !== 'string') return text;
  const dict = UI_DICT[locale];
  if (dict && dict[text]) return dict[text];
  return text;
}

function walkAndTranslate(obj, locale) {
  if (typeof obj === 'string') {
    return translateString(locale, obj);
  }
  if (typeof obj === 'object' && obj !== null) {
    const result = {};
    for (const key in obj) {
      result[key] = walkAndTranslate(obj[key], locale);
    }
    return result;
  }
  return obj;
}

function countUntranslated(converter, enConverter) {
  let untranslated = 0;
  let total = 0;
  
  function walkConv(cObj, enObj) {
    for (const key in enObj) {
      total++;
      if (typeof enObj[key] === 'string') {
        if (cObj[key] === enObj[key]) untranslated++;
      } else if (typeof enObj[key] === 'object') {
        walkConv(cObj[key] || {}, enObj[key]);
      }
    }
  }
  walkConv(converter, enConverter);
  return { untranslated, total };
}

// Process each locale
const enData = JSON.parse(fs.readFileSync(path.join(MESSAGES_DIR, 'en.json'), 'utf-8'));
const enConverter = enData.converter;

for (const locale of LOCALES) {
  const filePath = path.join(MESSAGES_DIR, `${locale}.json`);
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${locale}: file not found`);
    continue;
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  
  if (!data.converter) {
    console.log(`Skipping ${locale}: no converter namespace`);
    continue;
  }

  const before = countUntranslated(data.converter, enConverter);
  
  // Translate converter namespace
  data.converter = walkAndTranslate(data.converter, locale);
  
  const after = countUntranslated(data.converter, enConverter);
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`${locale}: ${before.untranslated}/${before.total} untranslated -> ${after.untranslated}/${after.total} untranslated`);
}

console.log('\nDone!');