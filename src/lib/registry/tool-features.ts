export type FeatureColor = "blue" | "green" | "amber" | "purple" | "rose" | "cyan" | "indigo";

export interface FeatureItem {
  title: string;
  description: string;
  color: FeatureColor;
}

export interface ToolHighlights {
  title: string;
  description: string;
}

export interface ToolFeatures {
  coreFeatures: FeatureItem[];
  highlights: ToolHighlights[];
}

const highlightsEn: ToolHighlights[] = [
  { title: "Real-time calculation", description: "Results update automatically as you type" },
  { title: "Multi-platform ready", description: "Works smoothly on desktop and mobile devices" },
  { title: "History ready", description: "Reuse previous values with one click" },
];

const highlightsZh: ToolHighlights[] = [
  { title: "实时计算", description: "输入时自动更新结果" },
  { title: "多平台适配", description: "桌面端与移动端均流畅运行" },
  { title: "历史记录", description: "一键复用之前的输入值" },
];

type LocaleDict = Record<string, string>;

const TRANSLATIONS: Record<string, LocaleDict> = {
  vi: {
    "Real-time calculation": "Tính toán thời gian thực",
    "Results update automatically as you type": "Kết quả tự động cập nhật khi bạn nhập",
    "Multi-platform ready": "Sẵn sàng đa nền tảng",
    "Works smoothly on desktop and mobile devices":
      "Hoạt động mượt mà trên máy tính và thiết bị di động",
    "History ready": "Sẵn sàng lịch sử",
    "Reuse previous values with one click": "Sử dụng lại các giá trị trước đó với một nhấp chuột",
    "Quick estimation": "Ước tính nhanh chóng",
    "Get results in seconds without complex spreadsheets":
      "Nhận kết quả trong vài giây mà không cần bảng tính phức tạp",
    "Amortization view": "Chế độ khấu hao",
    "See how principal and interest change over time":
      "Xem cách nợ gốc và lãi thay đổi theo thời gian",
    "Scenario compare": "So sánh kịch bản",
    "Test different rates, terms, and down payments":
      "Thử nghiệm các mức lãi suất, kỳ hạn và khoản trả trước khác nhau",
    "Export ready": "Sẵn sàng xuất",
    "Copy or print schedules for records": "Sao chép hoặc in lịch trình để lưu hồ sơ",
    "Instant assessment": "Đánh giá tức thì",
    "Check metrics like BMI, body fat, and calories":
      "Kiểm tra các chỉ số như BMI, mỡ cơ thể và calo",
    "Multiple formulas": "Nhiều công thức",
    "Choose the calculation method that fits you": "Chọn phương pháp tính toán phù hợp với bạn",
    "Unit flexibility": "Linh hoạt đơn vị",
    "Switch between metric and imperial freely": "Chuyển đổi tự do giữa hệ mét và hệ Anh",
    "Guidance notes": "Ghi chú hướng dẫn",
    "Understand what each result means": "Hiểu ý nghĩa của mỗi kết quả",
    "Step-by-step logic": "Logic từng bước",
    "Follow how each number is derived": "Theo dõi cách mỗi số được tính ra",
    "Multiple modes": "Nhiều chế độ",
    "Handle percentage, ratio, and equation variants":
      "Xử lý các biến thể phần trăm, tỷ lệ và phương trình",
    "Precision control": "Kiểm soát độ chính xác",
    "Adjust decimal places and rounding rules":
      "Điều chỉnh số chữ số thập phân và quy tắc làm tròn",
    "Copy results": "Sao chép kết quả",
    "Grab answers for homework or reports": "Lấy câu trả lời cho bài tập hoặc báo cáo",
    "Unit conversion": "Chuyển đổi đơn vị",
    "Convert cups, grams, ounces, and more": "Chuyển đổi cốc, gam, ounce và nhiều hơn",
    "Recipe scaling": "Mở rộng công thức",
    "Resize recipes for any serving count": "Điều chỉnh công thức cho bất kỳ số lượng phần ăn nào",
    "Nutrition lookup": "Tra cứu dinh dưỡng",
    "Estimate calories and macros": "Ước tính calo và chất dinh dưỡng",
    "Cost planning": "Lập kế hoạch chi phí",
    "Calculate ingredient cost per serving": "Tính chi phí nguyên liệu cho mỗi phần ăn",
    "Formula-driven": "Theo công thức",
    "Built on standard engineering equations": "Dựa trên các phương trình kỹ thuật tiêu chuẩn",
    "Unit-aware": "Nhận thức đơn vị",
    "Handles SI and imperial units": "Xử lý đơn vị SI và imperial",
    "Parameter sweep": "Quét tham số",
    "Test values across a range": "Thử nghiệm các giá trị trong một phạm vi",
    "Reference values": "Giá trị tham khảo",
    "Compare against typical materials": "So sánh với các vật liệu điển hình",
    "Molar mass": "Khối lượng mol",
    "Calculate molecular weight from formulas": "Tính trọng lượng phân tử từ công thức",
    Concentration: "Nồng độ",
    "Work with molarity, molality, and dilution": "Làm việc với độ mol, độ molal và pha loãng",
    Stoichiometry: "Phản ứng hóa học",
    "Balance reaction quantities": "Cân bằng lượng phản ứng",
    "pH tools": "Công cụ pH",
    "Convert pH, pOH, and hydrogen ion levels": "Chuyển đổi pH, pOH và nồng độ ion hydro",
    "Color space convert": "Chuyển đổi không gian màu",
    "Switch between HEX, RGB, HSL, and CMYK": "Chuyển đổi giữa HEX, RGB, HSL và CMYK",
    "Palette preview": "Xem trước bảng màu",
    "See harmonious color combinations": "Xem các kết hợp màu hài hòa",
    "Contrast check": "Kiểm tra độ tương phản",
    "Verify accessibility contrast ratios": "Xác minh tỷ lệ tương phản truy cập",
    "Copy values": "Sao chép giá trị",
    "Copy CSS or design tokens instantly": "Sao chép CSS hoặc token thiết kế tức thì",
    "Bandwidth calc": "Tính băng thông",
    "Estimate transfer time and throughput": "Ước tính thời gian truyền và thông lượng",
    "Storage convert": "Chuyển đổi lưu trữ",
    "Convert KB, MB, GB, TB, and beyond": "Chuyển đổi KB, MB, GB, TB và nhiều hơn",
    "Network planning": "Lập kế hoạch mạng",
    "Size links for latency and capacity": "Kích thước liên kết cho độ trễ và dung lượng",
    "Download estimate": "Ước tính tải xuống",
    "Plan file downloads by connection speed": "Lập kế hoạch tải tệp theo tốc độ kết nối",
    "Date diff": "Chênh lệch ngày",
    "Find days, weeks, or months between dates": "Tìm số ngày, tuần hoặc tháng giữa các ngày",
    "Add/subtract time": "Thêm/trừ thời gian",
    "Add durations or count backwards": "Thêm thời gian hoặc đếm ngược",
    "Time zone convert": "Chuyển đổi múi giờ",
    "Compare times across regions": "So sánh thời gian giữa các khu vực",
    "Workday count": "Đếm ngày làm việc",
    "Exclude weekends and holidays": "Loại trừ cuối tuần và ngày lễ",
    Subnetting: "Chia mạng con",
    "Calculate CIDR, masks, and host ranges": "Tính CIDR, mặt nạ và phạm vi máy chủ",
    "IP analysis": "Phân tích IP",
    "Validate and classify IPv4/IPv6": "Xác minh và phân loại IPv4/IPv6",
    "Wildcard math": "Toán ký tự đại diện",
    "Compute network and broadcast addresses": "Tính địa chỉ mạng và địa chỉ phát",
    "Copy config": "Sao chép cấu hình",
    "Export ranges for firewall or router use": "Xuất phạm vi cho tường lửa hoặc bộ định tuyến",
    "Hash generation": "Tạo băm",
    "Generate SHA, MD5, and other hashes": "Tạo SHA, MD5 và các băm khác",
    "Address check": "Kiểm tra địa chỉ",
    "Validate wallet addresses by format": "Xác minh địa chỉ ví theo định dạng",
    "Mining estimate": "Ước tính khai thác",
    "Approximate reward and power costs": "Ước tính phần thưởng và chi phí điện",
    "Rate convert": "Chuyển đổi tỷ giá",
    "Convert between crypto and fiat": "Chuyển đổi giữa tiền mã hóa và tiền pháp định",
    "Fuel economy": "Tiết kiệm nhiên liệu",
    "Compare MPG, L/100km, and cost per km": "So sánh MPG, L/100km và chi phí mỗi km",
    "Loan planning": "Lập kế hoạch vay",
    "Estimate monthly auto payments": "Ước tính thanh toán ô tô hàng tháng",
    "Tire sizing": "Kích thước lốp",
    "Compare tire dimensions and speed ratings": "So sánh kích thước lốp và xếp hạng tốc độ",
    "Maintenance log": "Nhật ký bảo dưỡng",
    "Track service intervals and costs": "Theo dõi khoảng cách bảo dưỡng và chi phí",
    "DoF compute": "Tính DoF",
    "Calculate depth of field for any lens": "Tính độ sâu trường ảnh cho bất kỳ ống kính nào",
    "Exposure math": "Toán phơi sáng",
    "Balance shutter, aperture, and ISO": "Cân bằng cửa chớp, khẩu độ và ISO",
    "Print resolution": "Độ phân giải in",
    "Find DPI and print size from pixels": "Tìm DPI và kích thước in từ pixel",
    "Astro planning": "Lập kế hoạch thiên văn",
    "Plan star-trail and Milky Way shots": "Lập kế hoạch chụp ảnh sao và dải Ngân hà",
    "Unit convert": "Chuyển đổi đơn vị",
    "Convert physical units across systems": "Chuyển đổi đơn vị vật lý giữa các hệ thống",
    "Formula calc": "Tính công thức",
    "Solve common physics equations": "Giải các phương trình vật lý phổ biến",
    "Constant lookup": "Tra cứu hằng số",
    "Use built-in physical constants": "Sử dụng các hằng số vật lý tích hợp",
    "Precision output": "Đầu ra chính xác",
    "Control significant figures": "Kiểm soát chữ số có nghĩa",
    "Mortgage estimate": "Ước tính thế chấp",
    "Calculate monthly mortgage payments": "Tính thanh toán thế chấp hàng tháng",
    "ROI analysis": "Phân tích ROI",
    "Compare rental yield and cap rate": "So sánh lợi nhuận cho thuê và tỷ lệ vốn",
    Affordability: "Khả năng chi trả",
    "Check what price fits your budget": "Kiểm tra giá nào phù hợp với ngân sách của bạn",
    Amortization: "Khấu hao",
    "View yearly loan breakdown": "Xem phân tích khoản vay hàng năm",
    "BPM/tempo": "BPM/nhịp độ",
    "Calculate beats per minute": "Tính nhịp độ mỗi phút",
    "Frequency math": "Toán tần số",
    "Convert notes to hertz and cents": "Chuyển đổi nốt nhạc sang hertz và cent",
    "Interval tool": "Công cụ khoảng âm",
    "Find musical intervals and scales": "Tìm khoảng âm và thang âm",
    "Audio delay": "Độ trễ âm thanh",
    "Sync delay times to tempo": "Đồng bộ độ trễ với nhịp độ",
    "URL encode": "Mã hóa URL",
    "Encode and decode URLs safely": "Mã hóa và giải mã URL an toàn",
    "Color/token convert": "Chuyển đổi màu/token",
    "Switch between CSS color formats": "Chuyển đổi giữa các định dạng màu CSS",
    "JSON format": "Định dạng JSON",
    "Pretty-print and validate JSON": "In đẹp và xác minh JSON",
    "Regex test": "Kiểm tra regex",
    "Test regular expressions live": "Kiểm tra biểu thức chính quy trực tiếp",
    "Capacity plan": "Kế hoạch năng lực",
    "Size CPU, memory, and storage": "Kích thước CPU, bộ nhớ và lưu trữ",
    Licensing: "Cấp phép",
    "Estimate license and core counts": "Ước tính số lượng giấy phép và lõi",
    "TCO model": "Mô hình TCO",
    "Compare on-prem and cloud costs": "So sánh chi phí tại chỗ và đám mây",
    "Cluster sizing": "Kích thước cụm",
    "Plan Kubernetes node pools": "Lập kế hoạch nhóm nút Kubernetes",
    "Fast input": "Nhập nhanh",
    "Enter values and get answers immediately": "Nhập giá trị và nhận câu trả lời ngay lập tức",
    "Accurate results": "Kết quả chính xác",
    "Built with validated formulas and constants": "Dựa trên các công thức và hằng số đã xác minh",
    "Flexible units": "Đơn vị linh hoạt",
    "Switch between common units and formats": "Chuyển đổi giữa các đơn vị và định dạng phổ biến",
    "Clear output": "Đầu ra rõ ràng",
    "View results with helpful explanations": "Xem kết quả với giải thích hữu ích",
  },
  id: {
    "Real-time calculation": "Perhitungan waktu nyata",
    "Results update automatically as you type":
      "Hasil diperbarui secara otomatis saat Anda mengetik",
    "Multi-platform ready": "Siap multi-platform",
    "Works smoothly on desktop and mobile devices":
      "Bekerja lancar di perangkat desktop dan seluler",
    "History ready": "Riwayat siap",
    "Reuse previous values with one click": "Gunakan kembali nilai sebelumnya dengan satu klik",
    "Quick estimation": "Estimasi cepat",
    "Get results in seconds without complex spreadsheets":
      "Dapatkan hasil dalam hitungan detik tanpa spreadsheet kompleks",
    "Amortization view": "Tampilan amortisasi",
    "See how principal and interest change over time":
      "Lihat bagaimana pokok dan bunga berubah seiring waktu",
    "Scenario compare": "Bandingkan skenario",
    "Test different rates, terms, and down payments":
      "Uji suku bunga, jangka waktu, dan uang muka yang berbeda",
    "Export ready": "Siap ekspor",
    "Copy or print schedules for records": "Salin atau cetak jadwal untuk catatan",
    "Instant assessment": "Penilaian instan",
    "Check metrics like BMI, body fat, and calories":
      "Periksa metrik seperti BMI, lemak tubuh, dan kalori",
    "Multiple formulas": "Berbagai rumus",
    "Choose the calculation method that fits you": "Pilih metode perhitungan yang cocok untuk Anda",
    "Unit flexibility": "Fleksibilitas satuan",
    "Switch between metric and imperial freely": "Beralih antara metrik dan imperial dengan bebas",
    "Guidance notes": "Catatan panduan",
    "Understand what each result means": "Pahami apa arti setiap hasil",
    "Step-by-step logic": "Logika langkah demi langkah",
    "Follow how each number is derived": "Ikuti bagaimana setiap angka diturunkan",
    "Multiple modes": "Berbagai mode",
    "Handle percentage, ratio, and equation variants":
      "Tangani varian persentase, rasio, dan persamaan",
    "Precision control": "Kontrol presisi",
    "Adjust decimal places and rounding rules": "Sesuaikan tempat desimal dan aturan pembulatan",
    "Copy results": "Salin hasil",
    "Grab answers for homework or reports": "Ambil jawaban untuk tugas atau laporan",
    "Unit conversion": "Konversi satuan",
    "Convert cups, grams, ounces, and more": "Konversi cangkir, gram, ons, dan banyak lagi",
    "Recipe scaling": "Penskalaan resep",
    "Resize recipes for any serving count": "Ubah ukuran resep untuk jumlah porsi apa pun",
    "Nutrition lookup": "Pencarian nutrisi",
    "Estimate calories and macros": "Perkirakan kalori dan makro",
    "Cost planning": "Perencanaan biaya",
    "Calculate ingredient cost per serving": "Hitung biaya bahan per porsi",
    "Formula-driven": "Berbasis rumus",
    "Built on standard engineering equations": "Dibangun di atas persamaan teknik standar",
    "Unit-aware": "Sadar satuan",
    "Handles SI and imperial units": "Menangani satuan SI dan imperial",
    "Parameter sweep": "Penyapuan parameter",
    "Test values across a range": "Uji nilai di rentang",
    "Reference values": "Nilai referensi",
    "Compare against typical materials": "Bandingkan dengan bahan khas",
    "Molar mass": "Massa molar",
    "Calculate molecular weight from formulas": "Hitung berat molekul dari rumus",
    Concentration: "Konsentrasi",
    "Work with molarity, molality, and dilution":
      "Bekerja dengan molaritas, molalitas, dan pengenceran",
    Stoichiometry: "Stoikiometri",
    "Balance reaction quantities": "Seimbangkan kuantitas reaksi",
    "pH tools": "Alat pH",
    "Convert pH, pOH, and hydrogen ion levels": "Konversi pH, pOH, dan tingkat ion hidrogen",
    "Color space convert": "Konversi ruang warna",
    "Switch between HEX, RGB, HSL, and CMYK": "Beralih antara HEX, RGB, HSL, dan CMYK",
    "Palette preview": "Pratinjau palet",
    "See harmonious color combinations": "Lihat kombinasi warna yang harmonis",
    "Contrast check": "Pemeriksaan kontras",
    "Verify accessibility contrast ratios": "Verifikasi rasio kontras aksesibilitas",
    "Copy values": "Salin nilai",
    "Copy CSS or design tokens instantly": "Salin CSS atau token desain seketika",
    "Bandwidth calc": "Perhitungan bandwidth",
    "Estimate transfer time and throughput": "Perkirakan waktu transfer dan throughput",
    "Storage convert": "Konversi penyimpanan",
    "Convert KB, MB, GB, TB, and beyond": "Konversi KB, MB, GB, TB, dan lebih banyak lagi",
    "Network planning": "Perencanaan jaringan",
    "Size links for latency and capacity": "Tautan ukuran untuk latensi dan kapasitas",
    "Download estimate": "Perkiraan unduhan",
    "Plan file downloads by connection speed":
      "Rencanakan unduhan file berdasarkan kecepatan koneksi",
    "Date diff": "Selisih tanggal",
    "Find days, weeks, or months between dates": "Temukan hari, minggu, atau bulan antara tanggal",
    "Add/subtract time": "Tambah/kurangi waktu",
    "Add durations or count backwards": "Tambahkan durasi atau hitung mundur",
    "Time zone convert": "Konversi zona waktu",
    "Compare times across regions": "Bandingkan waktu antar wilayah",
    "Workday count": "Jumlah hari kerja",
    "Exclude weekends and holidays": "Kecualikan akhir pekan dan hari libur",
    Subnetting: "Subnetting",
    "Calculate CIDR, masks, and host ranges": "Hitung CIDR, masker, dan rentang host",
    "IP analysis": "Analisis IP",
    "Validate and classify IPv4/IPv6": "Validasi dan klasifikasikan IPv4/IPv6",
    "Wildcard math": "Matematika wildcard",
    "Compute network and broadcast addresses": "Hitung alamat jaringan dan siaran",
    "Copy config": "Salin konfigurasi",
    "Export ranges for firewall or router use":
      "Ekspor rentang untuk penggunaan firewall atau router",
    "Hash generation": "Pembuatan hash",
    "Generate SHA, MD5, and other hashes": "Buat SHA, MD5, dan hash lainnya",
    "Address check": "Pemeriksaan alamat",
    "Validate wallet addresses by format": "Validasi alamat dompet berdasarkan format",
    "Mining estimate": "Perkiraan penambangan",
    "Approximate reward and power costs": "Perkirakan hadiah dan biaya daya",
    "Rate convert": "Konversi nilai tukar",
    "Convert between crypto and fiat": "Konversi antara crypto dan fiat",
    "Fuel economy": "Ekonomi bahan bakar",
    "Compare MPG, L/100km, and cost per km": "Bandingkan MPG, L/100km, dan biaya per km",
    "Loan planning": "Perencanaan pinjaman",
    "Estimate monthly auto payments": "Perkirakan pembayaran mobil bulanan",
    "Tire sizing": "Ukuran ban",
    "Compare tire dimensions and speed ratings": "Bandingkan dimensi ban dan peringkat kecepatan",
    "Maintenance log": "Log pemeliharaan",
    "Track service intervals and costs": "Lacak interval layanan dan biaya",
    "DoF compute": "Perhitungan DoF",
    "Calculate depth of field for any lens": "Hitung kedalaman bidang untuk lensa apa pun",
    "Exposure math": "Matematika paparan",
    "Balance shutter, aperture, and ISO": "Seimbangkan rana, apertur, dan ISO",
    "Print resolution": "Resolusi cetak",
    "Find DPI and print size from pixels": "Temukan DPI dan ukuran cetak dari piksel",
    "Astro planning": "Perencanaan astro",
    "Plan star-trail and Milky Way shots": "Rencanakan foto jejak bintang dan Bima Sakti",
    "Unit convert": "Konversi satuan",
    "Convert physical units across systems": "Konversi satuan fisik antar sistem",
    "Formula calc": "Perhitungan rumus",
    "Solve common physics equations": "Selesaikan persamaan fisika umum",
    "Constant lookup": "Pencarian konstanta",
    "Use built-in physical constants": "Gunakan konstanta fisik bawaan",
    "Precision output": "Output presisi",
    "Control significant figures": "Kontrol angka penting",
    "Mortgage estimate": "Perkiraan hipotek",
    "Calculate monthly mortgage payments": "Hitung pembayaran hipotek bulanan",
    "ROI analysis": "Analisis ROI",
    "Compare rental yield and cap rate": "Bandingkan hasil sewa dan tingkat kapitalisasi",
    Affordability: "Keterjangkauan",
    "Check what price fits your budget": "Periksa harga yang sesuai dengan anggaran Anda",
    Amortization: "Amortisasi",
    "View yearly loan breakdown": "Lihat rincian pinjaman tahunan",
    "BPM/tempo": "BPM/tempo",
    "Calculate beats per minute": "Hitung ketukan per menit",
    "Frequency math": "Matematika frekuensi",
    "Convert notes to hertz and cents": "Konversi nada ke hertz dan sen",
    "Interval tool": "Alat interval",
    "Find musical intervals and scales": "Temukan interval dan skala musik",
    "Audio delay": "Penundaan audio",
    "Sync delay times to tempo": "Sinkronkan waktu tunda dengan tempo",
    "URL encode": "Enkripsi URL",
    "Encode and decode URLs safely": "Enkripsi dan dekode URL dengan aman",
    "Color/token convert": "Konversi warna/token",
    "Switch between CSS color formats": "Beralih antara format warna CSS",
    "JSON format": "Format JSON",
    "Pretty-print and validate JSON": "Cetak cantik dan validasi JSON",
    "Regex test": "Uji regex",
    "Test regular expressions live": "Uji ekspresi reguler secara langsung",
    "Capacity plan": "Rencana kapasitas",
    "Size CPU, memory, and storage": "Ukuran CPU, memori, dan penyimpanan",
    Licensing: "Perizinan",
    "Estimate license and core counts": "Perkirakan jumlah lisensi dan inti",
    "TCO model": "Model TCO",
    "Compare on-prem and cloud costs": "Bandingkan biaya lokal dan cloud",
    "Cluster sizing": "Ukuran klaster",
    "Plan Kubernetes node pools": "Rencanakan kumpulan simpul Kubernetes",
    "Fast input": "Input cepat",
    "Enter values and get answers immediately": "Masukkan nilai dan dapatkan jawaban segera",
    "Accurate results": "Hasil akurat",
    "Built with validated formulas and constants":
      "Dibangun dengan rumus dan konstanta yang telah divalidasi",
    "Flexible units": "Satuan fleksibel",
    "Switch between common units and formats": "Beralih antara satuan dan format umum",
    "Clear output": "Output jelas",
    "View results with helpful explanations": "Lihat hasil dengan penjelasan bermanfaat",
  },
};

function getTranslated(locale: string, text: string): string {
  const dict = TRANSLATIONS[locale];
  if (dict && dict[text]) return dict[text];
  return text;
}

function translateFeatures(locale: string, features: FeatureItem[]): FeatureItem[] {
  if (locale === "en" || locale === "zh" || locale === "zh-TW") return features;
  return features.map((f) => ({
    ...f,
    title: getTranslated(locale, f.title),
    description: getTranslated(locale, f.description),
  }));
}

function translateHighlights(locale: string, highlights: ToolHighlights[]): ToolHighlights[] {
  if (locale === "en" || locale === "zh" || locale === "zh-TW") return highlights;
  return highlights.map((h) => ({
    title: getTranslated(locale, h.title),
    description: getTranslated(locale, h.description),
  }));
}

const byCategoryEn: Record<string, ToolFeatures> = {
  finance: {
    coreFeatures: [
      {
        title: "Quick estimation",
        description: "Get results in seconds without complex spreadsheets",
        color: "blue",
      },
      {
        title: "Amortization view",
        description: "See how principal and interest change over time",
        color: "green",
      },
      {
        title: "Scenario compare",
        description: "Test different rates, terms, and down payments",
        color: "amber",
      },
      {
        title: "Export ready",
        description: "Copy or print schedules for records",
        color: "purple",
      },
    ],
    highlights: highlightsEn,
  },
  health: {
    coreFeatures: [
      {
        title: "Instant assessment",
        description: "Check metrics like BMI, body fat, and calories",
        color: "blue",
      },
      {
        title: "Multiple formulas",
        description: "Choose the calculation method that fits you",
        color: "green",
      },
      {
        title: "Unit flexibility",
        description: "Switch between metric and imperial freely",
        color: "amber",
      },
      {
        title: "Guidance notes",
        description: "Understand what each result means",
        color: "purple",
      },
    ],
    highlights: highlightsEn,
  },
  math: {
    coreFeatures: [
      {
        title: "Step-by-step logic",
        description: "Follow how each number is derived",
        color: "blue",
      },
      {
        title: "Multiple modes",
        description: "Handle percentage, ratio, and equation variants",
        color: "green",
      },
      {
        title: "Precision control",
        description: "Adjust decimal places and rounding rules",
        color: "amber",
      },
      {
        title: "Copy results",
        description: "Grab answers for homework or reports",
        color: "purple",
      },
    ],
    highlights: highlightsEn,
  },
  cooking: {
    coreFeatures: [
      {
        title: "Unit conversion",
        description: "Convert cups, grams, ounces, and more",
        color: "blue",
      },
      {
        title: "Recipe scaling",
        description: "Resize recipes for any serving count",
        color: "green",
      },
      { title: "Nutrition lookup", description: "Estimate calories and macros", color: "amber" },
      {
        title: "Cost planning",
        description: "Calculate ingredient cost per serving",
        color: "purple",
      },
    ],
    highlights: highlightsEn,
  },
  engineering: {
    coreFeatures: [
      {
        title: "Formula-driven",
        description: "Built on standard engineering equations",
        color: "blue",
      },
      { title: "Unit-aware", description: "Handles SI and imperial units", color: "green" },
      { title: "Parameter sweep", description: "Test values across a range", color: "amber" },
      {
        title: "Reference values",
        description: "Compare against typical materials",
        color: "purple",
      },
    ],
    highlights: highlightsEn,
  },
  chemistry: {
    coreFeatures: [
      {
        title: "Molar mass",
        description: "Calculate molecular weight from formulas",
        color: "blue",
      },
      {
        title: "Concentration",
        description: "Work with molarity, molality, and dilution",
        color: "green",
      },
      { title: "Stoichiometry", description: "Balance reaction quantities", color: "amber" },
      {
        title: "pH tools",
        description: "Convert pH, pOH, and hydrogen ion levels",
        color: "purple",
      },
    ],
    highlights: highlightsEn,
  },
  color: {
    coreFeatures: [
      {
        title: "Color space convert",
        description: "Switch between HEX, RGB, HSL, and CMYK",
        color: "blue",
      },
      {
        title: "Palette preview",
        description: "See harmonious color combinations",
        color: "green",
      },
      {
        title: "Contrast check",
        description: "Verify accessibility contrast ratios",
        color: "amber",
      },
      { title: "Copy values", description: "Copy CSS or design tokens instantly", color: "purple" },
    ],
    highlights: highlightsEn,
  },
  data: {
    coreFeatures: [
      {
        title: "Bandwidth calc",
        description: "Estimate transfer time and throughput",
        color: "blue",
      },
      {
        title: "Storage convert",
        description: "Convert KB, MB, GB, TB, and beyond",
        color: "green",
      },
      {
        title: "Network planning",
        description: "Size links for latency and capacity",
        color: "amber",
      },
      {
        title: "Download estimate",
        description: "Plan file downloads by connection speed",
        color: "purple",
      },
    ],
    highlights: highlightsEn,
  },
  datetime: {
    coreFeatures: [
      {
        title: "Date diff",
        description: "Find days, weeks, or months between dates",
        color: "blue",
      },
      {
        title: "Add/subtract time",
        description: "Add durations or count backwards",
        color: "green",
      },
      { title: "Time zone convert", description: "Compare times across regions", color: "amber" },
      { title: "Workday count", description: "Exclude weekends and holidays", color: "purple" },
    ],
    highlights: highlightsEn,
  },
  network: {
    coreFeatures: [
      { title: "Subnetting", description: "Calculate CIDR, masks, and host ranges", color: "blue" },
      { title: "IP analysis", description: "Validate and classify IPv4/IPv6", color: "green" },
      {
        title: "Wildcard math",
        description: "Compute network and broadcast addresses",
        color: "amber",
      },
      {
        title: "Copy config",
        description: "Export ranges for firewall or router use",
        color: "purple",
      },
    ],
    highlights: highlightsEn,
  },
  crypto: {
    coreFeatures: [
      {
        title: "Hash generation",
        description: "Generate SHA, MD5, and other hashes",
        color: "blue",
      },
      {
        title: "Address check",
        description: "Validate wallet addresses by format",
        color: "green",
      },
      {
        title: "Mining estimate",
        description: "Approximate reward and power costs",
        color: "amber",
      },
      { title: "Rate convert", description: "Convert between crypto and fiat", color: "purple" },
    ],
    highlights: highlightsEn,
  },
  automotive: {
    coreFeatures: [
      {
        title: "Fuel economy",
        description: "Compare MPG, L/100km, and cost per km",
        color: "blue",
      },
      { title: "Loan planning", description: "Estimate monthly auto payments", color: "green" },
      {
        title: "Tire sizing",
        description: "Compare tire dimensions and speed ratings",
        color: "amber",
      },
      {
        title: "Maintenance log",
        description: "Track service intervals and costs",
        color: "purple",
      },
    ],
    highlights: highlightsEn,
  },
  photo: {
    coreFeatures: [
      { title: "DoF compute", description: "Calculate depth of field for any lens", color: "blue" },
      { title: "Exposure math", description: "Balance shutter, aperture, and ISO", color: "green" },
      {
        title: "Print resolution",
        description: "Find DPI and print size from pixels",
        color: "amber",
      },
      {
        title: "Astro planning",
        description: "Plan star-trail and Milky Way shots",
        color: "purple",
      },
    ],
    highlights: highlightsEn,
  },
  physics: {
    coreFeatures: [
      {
        title: "Unit convert",
        description: "Convert physical units across systems",
        color: "blue",
      },
      { title: "Formula calc", description: "Solve common physics equations", color: "green" },
      { title: "Constant lookup", description: "Use built-in physical constants", color: "amber" },
      { title: "Precision output", description: "Control significant figures", color: "purple" },
    ],
    highlights: highlightsEn,
  },
  realestate: {
    coreFeatures: [
      {
        title: "Mortgage estimate",
        description: "Calculate monthly mortgage payments",
        color: "blue",
      },
      { title: "ROI analysis", description: "Compare rental yield and cap rate", color: "green" },
      { title: "Affordability", description: "Check what price fits your budget", color: "amber" },
      { title: "Amortization", description: "View yearly loan breakdown", color: "purple" },
    ],
    highlights: highlightsEn,
  },
  music: {
    coreFeatures: [
      { title: "BPM/tempo", description: "Calculate beats per minute", color: "blue" },
      { title: "Frequency math", description: "Convert notes to hertz and cents", color: "green" },
      { title: "Interval tool", description: "Find musical intervals and scales", color: "amber" },
      { title: "Audio delay", description: "Sync delay times to tempo", color: "purple" },
    ],
    highlights: highlightsEn,
  },
  web: {
    coreFeatures: [
      { title: "URL encode", description: "Encode and decode URLs safely", color: "blue" },
      {
        title: "Color/token convert",
        description: "Switch between CSS color formats",
        color: "green",
      },
      { title: "JSON format", description: "Pretty-print and validate JSON", color: "amber" },
      { title: "Regex test", description: "Test regular expressions live", color: "purple" },
    ],
    highlights: highlightsEn,
  },
  infrastructure: {
    coreFeatures: [
      { title: "Capacity plan", description: "Size CPU, memory, and storage", color: "blue" },
      { title: "Licensing", description: "Estimate license and core counts", color: "green" },
      { title: "TCO model", description: "Compare on-prem and cloud costs", color: "amber" },
      { title: "Cluster sizing", description: "Plan Kubernetes node pools", color: "purple" },
    ],
    highlights: highlightsEn,
  },
  default: {
    coreFeatures: [
      {
        title: "Fast input",
        description: "Enter values and get answers immediately",
        color: "blue",
      },
      {
        title: "Accurate results",
        description: "Built with validated formulas and constants",
        color: "green",
      },
      {
        title: "Flexible units",
        description: "Switch between common units and formats",
        color: "amber",
      },
      {
        title: "Clear output",
        description: "View results with helpful explanations",
        color: "purple",
      },
    ],
    highlights: highlightsEn,
  },
};

const byCategoryZh: Record<string, ToolFeatures> = {
  finance: {
    coreFeatures: [
      { title: "快速估算", description: "无需复杂电子表格即可在数秒内得到结果", color: "blue" },
      { title: "摊销视图", description: "查看本金与利息随时间的变化", color: "green" },
      { title: "方案对比", description: "测试不同利率、期限和首付比例", color: "amber" },
      { title: "可导出", description: "复制或打印还款计划表", color: "purple" },
    ],
    highlights: highlightsZh,
  },
  health: {
    coreFeatures: [
      { title: "即时评估", description: "快速检查 BMI、体脂率与卡路里等指标", color: "blue" },
      { title: "多种公式", description: "选择最适合你的计算方法", color: "green" },
      { title: "单位灵活", description: "公制与英制单位自由切换", color: "amber" },
      { title: "解读说明", description: "了解每个结果的实际含义", color: "purple" },
    ],
    highlights: highlightsZh,
  },
  math: {
    coreFeatures: [
      { title: "逐步推导", description: "跟随每个数字的推导过程", color: "blue" },
      { title: "多种模式", description: "支持百分比、比率与方程等变体", color: "green" },
      { title: "精度控制", description: "调整小数位数与四舍五入规则", color: "amber" },
      { title: "复制结果", description: "一键获取作业或报告所需答案", color: "purple" },
    ],
    highlights: highlightsZh,
  },
  cooking: {
    coreFeatures: [
      { title: "单位换算", description: "换算杯、克、盎司等多种单位", color: "blue" },
      { title: "食谱缩放", description: "按需调整食谱份数", color: "green" },
      { title: "营养查询", description: "估算卡路里和宏量营养素", color: "amber" },
      { title: "成本规划", description: "计算每份料理的食材成本", color: "purple" },
    ],
    highlights: highlightsZh,
  },
  engineering: {
    coreFeatures: [
      { title: "公式驱动", description: "基于标准工程方程构建", color: "blue" },
      { title: "单位感知", description: "同时处理 SI 与英制单位", color: "green" },
      { title: "参数扫描", description: "在范围内批量测试数值", color: "amber" },
      { title: "参考数值", description: "与常见材料属性进行对比", color: "purple" },
    ],
    highlights: highlightsZh,
  },
  chemistry: {
    coreFeatures: [
      { title: "摩尔质量", description: "根据化学式计算分子量", color: "blue" },
      { title: "浓度计算", description: "支持摩尔浓度、质量浓度与稀释", color: "green" },
      { title: "化学计量", description: "配平反应方程与用量", color: "amber" },
      { title: "pH 工具", description: "换算 pH、pOH 与氢离子浓度", color: "purple" },
    ],
    highlights: highlightsZh,
  },
  color: {
    coreFeatures: [
      { title: "色彩空间转换", description: "在 HEX、RGB、HSL、CMYK 之间切换", color: "blue" },
      { title: "调色预览", description: "预览和谐的配色方案", color: "green" },
      { title: "对比度检查", description: "验证无障碍对比度比例", color: "amber" },
      { title: "复制数值", description: "一键复制 CSS 或设计 Token", color: "purple" },
    ],
    highlights: highlightsZh,
  },
  data: {
    coreFeatures: [
      { title: "带宽计算", description: "估算传输时间与吞吐量", color: "blue" },
      { title: "存储换算", description: "换算 KB、MB、GB、TB 等单位", color: "green" },
      { title: "网络规划", description: "根据延迟与容量规划链路", color: "amber" },
      { title: "下载估算", description: "按网速估算文件下载时间", color: "purple" },
    ],
    highlights: highlightsZh,
  },
  datetime: {
    coreFeatures: [
      { title: "日期差计算", description: "计算两日期间的天数、周数或月数", color: "blue" },
      { title: "时间加减", description: "对时间进行加法或减法运算", color: "green" },
      { title: "时区换算", description: "跨时区比较时间", color: "amber" },
      { title: "工作日计算", description: "排除周末与节假日", color: "purple" },
    ],
    highlights: highlightsZh,
  },
  network: {
    coreFeatures: [
      { title: "子网划分", description: "计算 CIDR、子网掩码与主机范围", color: "blue" },
      { title: "IP 分析", description: "验证并分类 IPv4/IPv6 地址", color: "green" },
      { title: "通配符计算", description: "计算网络地址与广播地址", color: "amber" },
      { title: "配置导出", description: "导出用于防火墙或路由器的范围", color: "purple" },
    ],
    highlights: highlightsZh,
  },
  crypto: {
    coreFeatures: [
      { title: "哈希生成", description: "生成 SHA、MD5 等多种哈希", color: "blue" },
      { title: "地址校验", description: "按格式验证钱包地址", color: "green" },
      { title: "挖矿估算", description: "估算收益与功耗成本", color: "amber" },
      { title: "汇率换算", description: "在加密货币与法币之间换算", color: "purple" },
    ],
    highlights: highlightsZh,
  },
  automotive: {
    coreFeatures: [
      { title: "燃油经济性", description: "对比 MPG、L/100km 与每公里成本", color: "blue" },
      { title: "贷款规划", description: "估算每月汽车还款金额", color: "green" },
      { title: "轮胎规格", description: "对比轮胎尺寸与速度等级", color: "amber" },
      { title: "保养记录", description: "跟踪保养周期与费用", color: "purple" },
    ],
    highlights: highlightsZh,
  },
  photo: {
    coreFeatures: [
      { title: "景深计算", description: "为任何镜头计算景深", color: "blue" },
      { title: "曝光计算", description: "平衡快门、光圈与 ISO", color: "green" },
      { title: "打印分辨率", description: "从像素计算 DPI 与打印尺寸", color: "amber" },
      { title: "星空规划", description: "规划星轨与银河拍摄", color: "purple" },
    ],
    highlights: highlightsZh,
  },
  physics: {
    coreFeatures: [
      { title: "单位换算", description: "跨体系换算物理单位", color: "blue" },
      { title: "公式计算", description: "求解常见物理方程", color: "green" },
      { title: "常量查询", description: "使用内置物理常数", color: "amber" },
      { title: "精度输出", description: "控制有效数字位数", color: "purple" },
    ],
    highlights: highlightsZh,
  },
  realestate: {
    coreFeatures: [
      { title: "房贷估算", description: "计算每月房贷还款金额", color: "blue" },
      { title: "投资回报分析", description: "对比出租收益率与资本化率", color: "green" },
      { title: "可负担性", description: "根据预算评估可承受房价", color: "amber" },
      { title: "摊销表", description: "查看年度贷款明细", color: "purple" },
    ],
    highlights: highlightsZh,
  },
  music: {
    coreFeatures: [
      { title: "BPM/节拍速度", description: "计算每分钟节拍数", color: "blue" },
      { title: "频率计算", description: "将音符换算为赫兹与音分", color: "green" },
      { title: "音程工具", description: "查找音程与音阶", color: "amber" },
      { title: "音频延迟", description: "按速度同步延迟时间", color: "purple" },
    ],
    highlights: highlightsZh,
  },
  web: {
    coreFeatures: [
      { title: "URL 编码", description: "安全编码与解码 URL", color: "blue" },
      { title: "颜色/Token 转换", description: "在 CSS 颜色格式之间切换", color: "green" },
      { title: "JSON 格式化", description: "美化与校验 JSON", color: "amber" },
      { title: "正则测试", description: "实时测试正则表达式", color: "purple" },
    ],
    highlights: highlightsZh,
  },
  infrastructure: {
    coreFeatures: [
      { title: "容量规划", description: "规划 CPU、内存与存储容量", color: "blue" },
      { title: "授权估算", description: "估算许可证与核心数量", color: "green" },
      { title: "TCO 模型", description: "对比本地与云端成本", color: "amber" },
      { title: "集群规划", description: "规划 Kubernetes 节点池", color: "purple" },
    ],
    highlights: highlightsZh,
  },
  default: {
    coreFeatures: [
      { title: "快速输入", description: "输入数值立即得到答案", color: "blue" },
      { title: "精准结果", description: "基于验证过的公式与常量构建", color: "green" },
      { title: "灵活单位", description: "在常用单位与格式之间切换", color: "amber" },
      { title: "清晰输出", description: "附带说明帮助理解结果", color: "purple" },
    ],
    highlights: highlightsZh,
  },
};

const bySlugEn: Record<string, ToolFeatures> = {
  "percentage-calculator": {
    coreFeatures: [
      {
        title: "Basic percentage",
        description: "Calculate what X% of Y is instantly",
        color: "blue",
      },
      {
        title: "Percent change",
        description: "Find increase or decrease between values",
        color: "green",
      },
      {
        title: "Percent difference",
        description: "Compare relative difference between two numbers",
        color: "amber",
      },
      {
        title: "Reverse percentage",
        description: "Find the original value before a percentage change",
        color: "purple",
      },
    ],
    highlights: highlightsEn,
  },
  "compound-interest": {
    coreFeatures: [
      {
        title: "Future value",
        description: "See how much your investment will grow",
        color: "blue",
      },
      {
        title: "Contribution modeling",
        description: "Add monthly or yearly deposits",
        color: "green",
      },
      {
        title: "Interest breakdown",
        description: "Split principal vs. earned interest",
        color: "amber",
      },
      { title: "Yearly schedule", description: "Review growth for each period", color: "purple" },
    ],
    highlights: highlightsEn,
  },
  mortgage: {
    coreFeatures: [
      {
        title: "Monthly payment",
        description: "Estimate P&I with taxes and insurance",
        color: "blue",
      },
      {
        title: "Amortization table",
        description: "View yearly principal and interest",
        color: "green",
      },
      { title: "Total interest", description: "See lifetime interest cost", color: "amber" },
      {
        title: "Rate compare",
        description: "Compare rates and terms side by side",
        color: "purple",
      },
    ],
    highlights: highlightsEn,
  },
  "bmi-calculator": {
    coreFeatures: [
      { title: "BMI compute", description: "Calculate body mass index quickly", color: "blue" },
      { title: "Category view", description: "See underweight to obese ranges", color: "green" },
      { title: "Ideal weight", description: "Estimate a healthy weight range", color: "amber" },
      { title: "Unit toggle", description: "Switch metric and imperial units", color: "purple" },
    ],
    highlights: highlightsEn,
  },
  "calorie-calculator": {
    coreFeatures: [
      { title: "TDEE estimate", description: "Estimate daily energy expenditure", color: "blue" },
      {
        title: "Macro split",
        description: "Calculate protein, fat, and carb targets",
        color: "green",
      },
      {
        title: "Goal modes",
        description: "Plan for weight loss, maintenance, or gain",
        color: "amber",
      },
      {
        title: "Activity levels",
        description: "Factor in exercise and daily movement",
        color: "purple",
      },
    ],
    highlights: highlightsEn,
  },
  "cooking-units": {
    coreFeatures: [
      {
        title: "Volume convert",
        description: "Switch cups, tablespoons, milliliters",
        color: "blue",
      },
      { title: "Weight convert", description: "Convert grams, ounces, pounds", color: "green" },
      { title: "Ingredient-aware", description: "Convert by ingredient density", color: "amber" },
      { title: "Scale recipes", description: "Resize from one serving to many", color: "purple" },
    ],
    highlights: highlightsEn,
  },
  discount: {
    coreFeatures: [
      { title: "Sale price", description: "Calculate price after discount", color: "blue" },
      { title: "Percent off", description: "Find discount rate from prices", color: "green" },
      { title: "Stack savings", description: "Combine coupons and discounts", color: "amber" },
      { title: "Tax aware", description: "Add sales tax to final price", color: "purple" },
    ],
    highlights: highlightsEn,
  },
  currency: {
    coreFeatures: [
      { title: "Rate convert", description: "Convert amounts between currencies", color: "blue" },
      { title: "Markup estimate", description: "Add exchange margin or fee", color: "green" },
      { title: "Bid-ask spread", description: "Compare buy and sell rates", color: "amber" },
      {
        title: "Historical view",
        description: "Track how rates change over time",
        color: "purple",
      },
    ],
    highlights: highlightsEn,
  },
};

const bySlugZh: Record<string, ToolFeatures> = {
  "percentage-calculator": {
    coreFeatures: [
      { title: "基础百分比", description: "即时计算 Y 的 X% 是多少", color: "blue" },
      { title: "百分比变化", description: "计算数值之间的增长或下降幅度", color: "green" },
      { title: "百分比差异", description: "对比两个数字之间的相对差异", color: "amber" },
      { title: "反向百分比", description: "在已知变化率的情况下反推原始值", color: "purple" },
    ],
    highlights: highlightsZh,
  },
  "compound-interest": {
    coreFeatures: [
      { title: "未来值", description: "查看投资的增长幅度", color: "blue" },
      { title: "投入模型", description: "添加每月或每年的投入", color: "green" },
      { title: "利息拆分", description: "区分本金与利息", color: "amber" },
      { title: "年度明细表", description: "查看每个周期的增长情况", color: "purple" },
    ],
    highlights: highlightsZh,
  },
  mortgage: {
    coreFeatures: [
      { title: "月供金额", description: "估算含税费与保险的本息月供", color: "blue" },
      { title: "摊销表", description: "查看年度本金与利息明细", color: "green" },
      { title: "总利息", description: "查看终身利息成本", color: "amber" },
      { title: "利率对比", description: "并排对比不同利率与期限", color: "purple" },
    ],
    highlights: highlightsZh,
  },
  "bmi-calculator": {
    coreFeatures: [
      { title: "BMI 计算", description: "快速计算身体质量指数", color: "blue" },
      { title: "分类视图", description: "查看从偏瘦到肥胖的区间", color: "green" },
      { title: "理想体重", description: "估算健康体重范围", color: "amber" },
      { title: "单位切换", description: "在公制与英制之间切换", color: "purple" },
    ],
    highlights: highlightsZh,
  },
  "calorie-calculator": {
    coreFeatures: [
      { title: "TDEE 估算", description: "估算每日能量消耗", color: "blue" },
      { title: "宏量分配", description: "计算蛋白质、脂肪与碳水目标", color: "green" },
      { title: "目标模式", description: "为减重、维持或增重做规划", color: "amber" },
      { title: "活动等级", description: "计入运动与日常活动量", color: "purple" },
    ],
    highlights: highlightsZh,
  },
  "cooking-units": {
    coreFeatures: [
      { title: "体积换算", description: "换算杯、汤匙、毫升等", color: "blue" },
      { title: "重量换算", description: "换算克、盎司、磅等", color: "green" },
      { title: "按食材换算", description: "按食材密度进行换算", color: "amber" },
      { title: "食谱缩放", description: "将单份食谱扩展为多份", color: "purple" },
    ],
    highlights: highlightsZh,
  },
  discount: {
    coreFeatures: [
      { title: "折后价", description: "计算折扣后的价格", color: "blue" },
      { title: "折扣率", description: "从价格反推折扣比例", color: "green" },
      { title: "叠加优惠", description: "组合优惠券与折扣", color: "amber" },
      { title: "含税计算", description: "在最终价格上加计销售税", color: "purple" },
    ],
    highlights: highlightsZh,
  },
  currency: {
    coreFeatures: [
      { title: "汇率换算", description: "在不同货币之间换算金额", color: "blue" },
      { title: "加价估算", description: "添加换汇价差或手续费", color: "green" },
      { title: "买卖价差", description: "对比买入价与卖出价", color: "amber" },
      { title: "历史视图", description: "追踪汇率随时间的变化", color: "purple" },
    ],
    highlights: highlightsZh,
  },
};

export function getToolFeatures(toolId: string, categoryId: string, locale?: string): ToolFeatures {
  const loc = locale ?? "en";
  const isZh = loc === "zh" || loc === "zh-TW";
  const byCategory = isZh ? byCategoryZh : byCategoryEn;
  const bySlug = isZh ? bySlugZh : bySlugEn;
  const defaultEntry = isZh ? byCategoryZh.default : byCategoryEn.default;

  const raw = bySlug[toolId] ?? byCategory[categoryId] ?? defaultEntry;

  if (loc === "en" || isZh) return raw;

  return {
    coreFeatures: translateFeatures(loc, raw.coreFeatures),
    highlights: translateHighlights(loc, raw.highlights),
  };
}

export function getFeatureColorClasses(color: FeatureColor): string {
  const map: Record<FeatureColor, string> = {
    blue: "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-900",
    green:
      "bg-green-50 text-green-700 border-green-100 dark:bg-green-950 dark:text-green-300 dark:border-green-900",
    amber:
      "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-900",
    purple:
      "bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-900",
    rose: "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-900",
    cyan: "bg-cyan-50 text-cyan-700 border-cyan-100 dark:bg-cyan-950 dark:text-cyan-300 dark:border-cyan-900",
    indigo:
      "bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-900",
  };
  return map[color];
}

export { highlightsEn as highlights, highlightsZh };
