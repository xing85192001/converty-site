// 第八批 A 层深度文案注入：video 8 个工具 × 6 语言
import fs from "fs";

const LANGS = ["en", "zh", "zh-TW", "de", "ja", "es"];
const FILE = (l) => `./src/messages/${l}.json`;

const DATA = {
  "video-file-size": {
    en: {
      steps: [
        "Enter the video duration, resolution, and target quality.",
        "Enter the codec and frame rate, or pick a preset.",
        "Read the estimated file size and adjust bitrate to fit your storage.",
      ],
      explanationTitle: "Estimating video file size",
      formula: "size = bitrate × duration; bitrate ≈ resolution × fps × qualityFactor",
      explanation: [
        "Video file size is driven mainly by bitrate and duration; resolution and frame rate set the bitrate needed for a given quality.",
        "Modern codecs like H.265/HEVC and AV1 compress far better than older H.264 at the same perceived quality, shrinking files significantly.",
      ],
      faq: [
        { q: "Does 4K quadruple the size of 1080p?", a: "Not exactly; 4K has 4x pixels but efficient codecs and smart bitrate caps keep the increase smaller." },
        { q: "Which codec saves the most space?", a: "AV1 and H.265 typically beat H.264 by 30–50% at equal quality." },
        { q: "Why is audio a small part of size?", a: "Audio bitrates (128–320 kbps) are tiny next to video bitrates (several Mbps)." },
      ],
    },
    zh: {
      steps: ["输入视频时长、分辨率和目标画质。", "输入编码器和帧率，或选择预设。", "读取估算文件大小，并调整码率以适配存储空间。"],
      explanationTitle: "估算视频文件大小",
      formula: "大小 = 码率 × 时长；码率 ≈ 分辨率 × 帧率 × 画质系数",
      explanation: [
        "视频文件大小主要由码率和时长决定；分辨率和帧率决定达到某画质所需的码率。",
        "H.265/HEVC、AV1 等现代编码器在相同主观画质下比老旧的 H.264 压缩率高得多，文件显著变小。",
      ],
      faq: [
        { q: "4K 文件是 1080p 的 4 倍吗？", a: "不完全；4K 像素是 4 倍，但高效编码和智能码率上限使增幅更小。" },
        { q: "哪个编码器最省空间？", a: "同画质下 AV1 和 H.265 通常比 H.264 省 30–50%。" },
        { q: "为什么音频占比很小？", a: "音频码率（128–320kbps）相比视频码率（数 Mbps）微乎其微。" },
      ],
    },
    zhTW: {
      steps: ["輸入影片時長、解析度和目標畫質。", "輸入編碼器和幀率，或選擇預設。", "讀取估算檔案大小，並調整碼率以適配儲存空間。"],
      explanationTitle: "估算影片檔案大小",
      formula: "大小 = 碼率 × 時長；碼率 ≈ 解析度 × 幀率 × 畫質係數",
      explanation: [
        "影片檔案大小主要由碼率和時長決定；解析度和幀率決定達到某畫質所需的碼率。",
        "H.265/HEVC、AV1 等現代編碼器在相同主觀畫質下比老舊的 H.264 壓縮率高得多，檔案顯著變小。",
      ],
      faq: [
        { q: "4K 檔案是 1080p 的 4 倍嗎？", a: "不完全；4K 畫素是 4 倍，但高效編碼和智能碼率上限使增幅更小。" },
        { q: "哪個編碼器最省空間？", a: "同畫質下 AV1 和 H.265 通常比 H.264 省 30–50%。" },
        { q: "為什麼音訊佔比很小？", a: "音訊碼率（128–320kbps）相比影片碼率（數 Mbps）微乎其微。" },
      ],
    },
    de: {
      steps: ["Gib Dauer, Auflösung und Qualität ein.", "Gib Codec und Bildrate ein oder wähle ein Preset.", "Lies die geschätzte Dateigröße und passe die Bitrate an."],
      explanationTitle: "Videodateigröße schätzen",
      formula: "größe = bitrate × dauer; bitrate ≈ auflösung × fps × qualitätsFaktor",
      explanation: [
        "Die Dateigröße hängt vor allem von Bitrate und Dauer ab; Auflösung und Bildrate bestimmen die nötige Bitrate.",
        "Moderne Codecs wie H.265/HEVC und AV1 komprimieren bei gleicher Qualität viel stärker als H.264.",
      ],
      faq: [
        { q: "Ist 4K viermal so groß wie 1080p?", a: "Nicht genau; effiziente Codecs und Bitrate-Caps halten den Zuwachs kleiner." },
        { q: "Welcher Codec spart am meisten?", a: "AV1 und H.265 schlagen H.264 oft um 30–50% bei gleicher Qualität." },
        { q: "Warum ist Audio klein?", a: "Audio-Bitraten (128–320 kbps) sind winzig neben Video-Mbps." },
      ],
    },
    ja: {
      steps: ["動画の長さ・解像度・目標画質を入力します。", "コーデックとフレームレートを入力、またはプリセット選択。", "推定ファイルサイズを確認し、容量に合わせてビットレート調整。"],
      explanationTitle: "動画ファイルサイズの見積もり",
      formula: "サイズ = ビットレート × 時間；ビットレート ≈ 解像度 × fps × 画質係数",
      explanation: [
        "動画サイズは主にビットレートと時間で決まり、解像度と fps が必要ビットレートを決めます。",
        "H.265/HEVC や AV1 などの新コーデックは同等画質で H.264 よりずっと高圧縮です。",
      ],
      faq: [
        { q: "4K は 1080p の 4 倍？", a: "正確には違います。効率コーデックと上限で増加は抑えられます。" },
        { q: "最も省容量のコーデックは？", a: "同等画質で AV1 と H.265 は H.264 より 30–50% 削減。" },
        { q: "なぜ音声は小さい？", a: "音声ビットレート（128–320kbps）は映像（数 Mbps）に比べ微小です。" },
      ],
    },
    es: {
      steps: ["Introduce duración, resolución y calidad.", "Introduce códec y fps, o elige un ajuste.", "Lee el tamaño estimado y ajusta el bitrate."],
      explanationTitle: "Estimar tamaño de vídeo",
      formula: "tamaño = bitrate × duración; bitrate ≈ resolución × fps × factorCalidad",
      explanation: [
        "El tamaño depende sobre todo de bitrate y duración; resolución y fps fijan el bitrate necesario.",
        "Codecs como H.265/HEVC y AV1 comprimen mucho más que H.264 a igual calidad.",
      ],
      faq: [
        { q: "¿4K es 4 veces 1080p?", a: "No exacto; codecs eficientes y límites de bitrate reducen el aumento." },
        { q: "¿Qué códec ahorra más?", a: "AV1 y H.265 suelen batir a H.264 un 30–50% a igual calidad." },
        { q: "¿Por qué el audio es pequeño?", a: "Sus bitrates (128–320 kbps) son minúsculos frente a los Mbps de vídeo." },
      ],
    },
  },
  "audio-filesize": {
    en: {
      steps: [
        "Enter the audio duration and sample rate (e.g., 44.1 kHz).",
        "Choose the bit depth or bitrate (lossless vs lossy).",
        "Read the estimated file size for your format.",
      ],
      explanationTitle: "Estimating audio file size",
      formula: "size = sampleRate × bitDepth × channels × duration (PCM); or bitrate × duration (compressed)",
      explanation: [
        "Uncompressed audio size grows with sample rate, bit depth, and channel count; stereo doubles mono.",
        "Lossy formats like MP3/AAC target a bitrate, while lossless FLAC shrinks the PCM data without throwing away information.",
      ],
      faq: [
        { q: "WAV vs FLAC size?", a: "WAV is raw PCM (largest); FLAC is lossless-compressed and typically 50–60% smaller." },
        { q: "Does higher sample rate mean better sound?", a: "Only if the source and ears can use it; 44.1/48 kHz is enough for most listeners." },
        { q: "Why is stereo twice mono?", a: "Two channels each store independent samples, doubling the data rate." },
      ],
    },
    zh: {
      steps: ["输入音频时长和采样率（如 44.1kHz）。", "选择位深或码率（无损或有损）。", "读取对应格式下的估算文件大小。"],
      explanationTitle: "估算音频文件大小",
      formula: "大小 = 采样率 × 位深 × 声道数 × 时长（PCM）；或 码率 × 时长（压缩）",
      explanation: [
        "未压缩音频的大小随采样率、位深和声道数增长；立体声是单声道的两倍。",
        "MP3/AAC 等有损格式按目标码率存储，而 FLAC 无损压缩 PCM 数据且不丢弃信息。",
      ],
      faq: [
        { q: "WAV 与 FLAC 谁大？", a: "WAV 是原始 PCM（最大）；FLAC 无损压缩通常小 50–60%。" },
        { q: "更高采样率音质更好？", a: "仅当音源和耳朵用得上；44.1/48kHz 对多数听者已足够。" },
        { q: "为什么立体声是单声道两倍？", a: "两个声道各自存储独立采样，数据率翻倍。" },
      ],
    },
    zhTW: {
      steps: ["輸入音訊時長和採樣率（如 44.1kHz）。", "選擇位深或碼率（無損或有損）。", "讀取對應格式下的估算檔案大小。"],
      explanationTitle: "估算音訊檔案大小",
      formula: "大小 = 採樣率 × 位深 × 聲道數 × 時長（PCM）；或 碼率 × 時長（壓縮）",
      explanation: [
        "未壓縮音訊的大小隨採樣率、位深和聲道數增長；立體聲是單聲道的兩倍。",
        "MP3/AAC 等有損格式按目標碼率儲存，而 FLAC 無損壓縮 PCM 資料且不丟棄資訊。",
      ],
      faq: [
        { q: "WAV 與 FLAC 誰大？", a: "WAV 是原始 PCM（最大）；FLAC 無損壓縮通常小 50–60%。" },
        { q: "更高採樣率音質更好？", a: "僅當音源和耳朵用得上；44.1/48kHz 對多數聽者已足夠。" },
        { q: "為什麼立體聲是單聲道兩倍？", a: "兩個聲道各自儲存獨立採樣，資料率翻倍。" },
      ],
    },
    de: {
      steps: ["Gib Dauer und Samplerate ein (z. B. 44,1 kHz).", "Wähle Bit-Tiefe oder Bitrate (verlustfrei/verlustbehaftet).", "Lies die geschätzte Dateigröße."],
      explanationTitle: "Audiodateigröße schätzen",
      formula: "größe = samplerate × bitTiefe × kanäle × dauer (PCM); oder bitrate × dauer",
      explanation: [
        "Unkomprimierte Audio größe wächst mit Samplerate, Bit-Tiefe und Kanälen; Stereo verdoppelt Mono.",
        "MP3/AAC zielen auf Bitrate, FLAC komprimiert PCM verlustfrei ohne Informationsverlust.",
      ],
      faq: [
        { q: "WAV vs FLAC?", a: "WAV ist Roh-PCM (größte); FLAC verlustfrei ~50–60% kleiner." },
        { q: "Höhere Samplerate = besser?", a: "Nur wenn Quelle und Ohr es nutzen; 44,1/48 kHz reichen meist." },
        { q: "Warum Stereo doppelt?", a: "Zwei Kanäle speichern eigene Samples, doppelte Datenrate." },
      ],
    },
    ja: {
      steps: ["音声の長さとサンプルレート（44.1kHz等）を入力。", "ビット深度かビットレート（无损/有损）を選択。", "形式ごとの推定ファイルサイズを確認。"],
      explanationTitle: "音声ファイルサイズの見積もり",
      formula: "サイズ = サンプルレート × ビット深度 × チャンネル数 × 時間（PCM）；または ビットレート × 時間",
      explanation: [
        "非圧縮音声はサンプルレート・ビット深度・チャンネル数で増大；ステレオはモノの2倍。",
        "MP3/AAC は目標ビットレート、FLAC は情報を捨てずに PCM を無損失圧縮します。",
      ],
      faq: [
        { q: "WAV と FLAC どちらが大？", a: "WAV は生 PCM（最大）；FLAC は無損失で通常 50–60% 小。" },
        { q: "高サンプルレート＝高音質？", a: "音源と耳が活かせる場合のみ。44.1/48kHz で十分な場合が多い。" },
        { q: "なぜステレオは2倍？", a: "2チャンネルが独立サンプルを保持し、データ率が倍になるため。" },
      ],
    },
    es: {
      steps: ["Introduce duración y frecuencia de muestreo (p. ej. 44,1 kHz).", "Elige profundidad de bits o bitrate (sin/Con pérdida).", "Lee el tamaño estimado de archivo."],
      explanationTitle: "Estimar tamaño de audio",
      formula: "tamaño = muestreo × bits × canales × duración (PCM); o bitrate × duración",
      explanation: [
        "El audio sin comprimir crece con muestreo, profundidad y canales; estéreo duplica el mono.",
        "MP3/AAC apuntan a un bitrate; FLAC comprime PCM sin pérdida de información.",
      ],
      faq: [
        { q: "¿WAV vs FLAC?", a: "WAV es PCM crudo (mayor); FLAC sin pérdida suele ser 50–60% menor." },
        { q: "¿Más muestreo = mejor sonido?", a: "Solo si la fuente y el oído lo aprovechan; 44,1/48 kHz basta a menudo." },
        { q: "¿Por qué estéreo es el doble?", a: "Dos canales guardan muestras independientes, duplicando la tasa." },
      ],
    },
  },
  "common-bitrates": {
    en: {
      steps: [
        "Pick the delivery target: streaming, broadcast, disc, or mastering.",
        "Pick the resolution and frame rate you will use.",
        "Read the typical bitrate range and choose one that balances quality and bandwidth.",
      ],
      explanationTitle: "Common video bitrates by use case",
      formula: "Reference only: 1080p ≈ 5–8 Mbps (H.264), 4K ≈ 15–25 Mbps (H.264), lower with H.265/AV1",
      explanation: [
        "Bitrate tables give starting points; the right value depends on codec, motion complexity, and acceptable artifact levels.",
        "Streaming services use adaptive bitrate ladders; disc and broadcast have stricter standards like Blu-ray or ATSC.",
      ],
      faq: [
        { q: "Why do tables vary so much?", a: "They assume different codecs and content; fast action needs more bits than static talking heads." },
        { q: "Is higher bitrate always better?", a: "Up to a point; beyond it you waste bandwidth for invisible gains." },
        { q: "What about H.265/AV1?", a: "They hit the same quality at roughly half the H.264 bitrate." },
      ],
    },
    zh: {
      steps: ["选择交付目标：流媒体、广播、光盘或母版。", "选择将用的分辨率和帧率。", "读取典型码率区间，在画质与带宽间权衡选择。"],
      explanationTitle: "按用途的常见视频码率",
      formula: "参考：1080p ≈ 5–8 Mbps（H.264），4K ≈ 15–25 Mbps（H.264），用 H.265/AV1 更低",
      explanation: [
        "码率表只是起点；正确取值取决于编码器、运动复杂度和可接受瑕疵水平。",
        "流媒体用自适应码率阶梯；光盘和广播有更严格的标准如 Blu-ray 或 ATSC。",
      ],
      faq: [
        { q: "为什么表差这么多？", a: "它们假设不同编码器和内容；快速动作比静态对话需要更多码率。" },
        { q: "码率越高越好吗？", a: "到一定上限后收益不可见却浪费带宽。" },
        { q: "H.265/AV1 呢？", a: "相同画质下约为 H.264 码率的一半。" },
      ],
    },
    zhTW: {
      steps: ["選擇交付目標：串流、廣播、光碟或母帶。", "選擇將用的解析度和幀率。", "讀取典型碼率區間，在畫質與頻寬間權衡選擇。"],
      explanationTitle: "按用途的常見影片碼率",
      formula: "參考：1080p ≈ 5–8 Mbps（H.264），4K ≈ 15–25 Mbps（H.264），用 H.265/AV1 更低",
      explanation: [
        "碼率表只是起點；正確取值取決於編碼器、運動複雜度和可接受瑕疵水平。",
        "串流用自適應碼率階梯；光碟和廣播有更嚴格的標準如 Blu-ray 或 ATSC。",
      ],
      faq: [
        { q: "為什麼表差這麼多？", a: "它們假設不同編碼器和內容；快速動作比靜態對話需要更多碼率。" },
        { q: "碼率越高越好嗎？", a: "到一定上限後收益不可見卻浪費頻寬。" },
        { q: "H.265/AV1 呢？", a: "相同畫質下約為 H.264 碼率的一半。" },
      ],
    },
    de: {
      steps: ["Wähle Ziel: Streaming, Broadcast, Disc oder Master.", "Wähle Auflösung und Bildrate.", "Lies typische Bitrate und wähle abwägend."],
      explanationTitle: "Übliche Bitraten nach Anwendung",
      formula: "Referenz: 1080p ≈ 5–8 Mbps (H.264), 4K ≈ 15–25 Mbps (H.264), mit H.265/AV1 weniger",
      explanation: [
        "Bitraten-Tabellen sind Startpunkte; der Wert hängt von Codec, Bewegung und Artefakt-Toleranz ab.",
        "Streaming nutzt adaptives Bitrate; Disc/Broadcast haben strengere Normen wie Blu-ray oder ATSC.",
      ],
      faq: [
        { q: "Warum schwanken Tabellen?", a: "Verschiedene Codecs/Inhalte; Action braucht mehr Bits als Interviews." },
        { q: "Mehr Bitrate immer besser?", a: "Bis zu einem Punkt; danach verschwendete Bandbreite." },
        { q: "H.265/AV1?", a: "Erreichen gleiche Qualität bei etwa halber H.264-Bitrate." },
      ],
    },
    ja: {
      steps: ["配信先を選ぶ：ストリーミング・放送・ディスク・マスター。", "解像度とフレームレートを選ぶ。", "典型的なビットレート帯から画質と帯域を妥協して選ぶ。"],
      explanationTitle: "用途別の一般的なビットレート",
      formula: "目安：1080p ≈ 5–8 Mbps（H.264）、4K ≈ 15–25 Mbps（H.264）、H.265/AV1 なら半分以下",
      explanation: [
        "ビットレート表は目安；適正値はコーデック・動きの複雑さ・許容ノイズで変わります。",
        "ストリーミングは適応型ラダーを使い、ディスク・放送は Blu-ray や ATSC など厳格な規格があります。",
      ],
      faq: [
        { q: "なぜ表がばらばら？", a: "想定コーデックと素材が違うため。激しい動きは静画より多くのビットを要します。" },
        { q: "高ビットレートほど良い？", a: "限度があり、それを超えると帯域の無駄で目に見えない。" },
        { q: "H.265/AV1 は？", a: "同画質で H.264 の約半分のビットレートで達成。" },
      ],
    },
    es: {
      steps: ["Elige destino: streaming, broadcast, disco o máster.", "Elige resolución y fps.", "Lee el rango típico y elige según calidad/ancho de banda."],
      explanationTitle: "Bitrates comunes por caso",
      formula: "Referencia: 1080p ≈ 5–8 Mbps (H.264), 4K ≈ 15–25 Mbps (H.264), menos con H.265/AV1",
      explanation: [
        "Las tablas son puntos de partida; el valor depende de códec, complejidad y artefactos aceptables.",
        "El streaming usa escalones adaptativos; disco y broadcast tienen normas estrictas como Blu-ray o ATSC.",
      ],
      faq: [
        { q: "¿Por qué varían las tablas?", a: "Asumen códecs/contenidos distintos; la acción rápida necesita más bits." },
        { q: "¿Más bitrate siempre mejor?", a: "Hasta cierto punto; luego pierdes ancho de banda sin ganancia visible." },
        { q: "¿H.265/AV1?", a: "Logran la misma calidad a la mitad del bitrate de H.264." },
      ],
    },
  },
  "dcp-filesize": {
    en: {
      steps: [
        "Enter the feature duration and chosen resolution (2K or 4K).",
        "Pick the frame rate (24, 25, 30, 48, or 60 fps) and JPEG 2000 bit rate.",
        "Read the total DCP package size including audio and subtitle assets.",
      ],
      explanationTitle: "Digital Cinema Package file size",
      formula: "size ≈ (videoBitrate + audioBitrate) × duration; typical 4K @ 24fps ≈ 250 Mbps",
      explanation: [
        "A DCP stores each frame as a JPEG 2000 image plus uncompressed or PCM audio, so sizes are huge compared with consumer formats.",
        "DCPs are built per-version (2D/3D, subtitle languages), and each version multiplies storage and ingest time.",
      ],
      faq: [
        { q: "Why are DCPs so large?", a: "They use near-lossless JPEG 2000 at cinema bitrates, far above streaming compression." },
        { q: "What is the 3D surcharge?", a: "3D doubles the picture data, roughly doubling the video portion of the package." },
        { q: "How long to ingest a DCP?", a: "Depends on drive speed; a 200 GB package can take 20–40 minutes to copy to a server." },
      ],
    },
    zh: {
      steps: ["输入影片时长和所选分辨率（2K 或 4K）。", "选择帧率（24/25/30/48/60fps）和 JPEG 2000 码率。", "读取含音频与字幕资源的 DCP 总大小。"],
      explanationTitle: "数字电影包（DCP）文件大小",
      formula: "大小 ≈ (视频码率 + 音频码率) × 时长；典型 4K@24fps ≈ 250 Mbps",
      explanation: [
        "DCP 把每帧存为 JPEG 2000 图像加 PCM 音频，因此体积远大于消费级格式。",
        "DCP 按版本（2D/3D、字幕语言）构建，每个版本都会倍增存储与入库时间。",
      ],
      faq: [
        { q: "DCP 为什么这么大？", a: "使用接近无损的 JPEG 2000 影院码率，远高于流媒体压缩。" },
        { q: "3D 额外多大？", a: "3D 使画面数据翻倍，包的视频部分约翻倍。" },
        { q: "DCP 入库要多久？", a: "看硬盘速度；200GB 包复制到服务器可能需 20–40 分钟。" },
      ],
    },
    zhTW: {
      steps: ["輸入影片時長和所選解析度（2K 或 4K）。", "選擇幀率（24/25/30/48/60fps）和 JPEG 2000 碼率。", "讀取含音訊與字幕資源的 DCP 總大小。"],
      explanationTitle: "數位電影包（DCP）檔案大小",
      formula: "大小 ≈ (視訊碼率 + 音訊碼率) × 時長；典型 4K@24fps ≈ 250 Mbps",
      explanation: [
        "DCP 把每幀存為 JPEG 2000 影像加 PCM 音訊，因此體積遠大於消費級格式。",
        "DCP 按版本（2D/3D、字幕語言）建構，每個版本都會倍增儲存與入庫時間。",
      ],
      faq: [
        { q: "DCP 為什麼這麼大？", a: "使用接近無損的 JPEG 2000 影院碼率，遠高於串流壓縮。" },
        { q: "3D 額外多大？", a: "3D 使畫面資料翻倍，包的視訊部分約翻倍。" },
        { q: "DCP 入庫要多久？", a: "看硬碟速度；200GB 包複製到伺服器可能需 20–40 分鐘。" },
      ],
    },
    de: {
      steps: ["Gib Dauer und Auflösung (2K/4K) ein.", "Wähle fps (24/25/30/48/60) und J2K-Bitrate.", "Lies die DCP-Größe inkl. Audio/Untertitel."],
      explanationTitle: "Größe eines Digital Cinema Package",
      formula: "größe ≈ (videoBitrate + audioBitrate) × dauer; 4K@24 ≈ 250 Mbps",
      explanation: [
        "Ein DCP speichert jeden Frame als JPEG-2000 plus PCM-Audio, daher viel größer als Consumer-Formate.",
        "DCPs werden pro Version (2D/3D, Sprachen) gebaut; jede Version multipliziert Speicher und Ingest.",
      ],
      faq: [
        { q: "Warum so groß?", a: "Nahzu verlustfreies J2K in Kino-Bitraten, weit über Streaming." },
        { q: "3D-Aufschlag?", a: "3D verdoppelt die Bilddaten, also etwa das Doppelte des Videoanteils." },
        { q: "Ingest-Dauer?", a: "Je nach Laufwerk; 200 GB können 20–40 Min dauern." },
      ],
    },
    ja: {
      steps: ["上映時間と解像度（2K/4K）を入力。", "フレームレート（24/25/30/48/60fps）と JPEG 2000 ビットレート選択。", "字幕・音声を含む DCP 総サイズを確認。"],
      explanationTitle: "デジタルシネマパッケージ（DCP）のサイズ",
      formula: "サイズ ≈ (映像ビットレート + 音声ビットレート) × 時間；4K@24fps 目安 250 Mbps",
      explanation: [
        "DCP は各フレームを JPEG 2000 画像＋PCM 音声で保存するため、消費者形式よりずっと大きい。",
        "DCP はバージョン（2D/3D、字幕言語）ごとに作られ、各版で容量と取り込み時間が増えます。",
      ],
      faq: [
        { q: "なぜこんなに大？", a: "劇場ビットレートのほぼ無損失 J2K で、ストリーミングより遥かに高圧縮率。" },
        { q: "3D の増加分？", a: "3D は画像データを倍にし、パッケージの映像部分が約2倍になります。" },
        { q: "取り込み時間は？", a: "ドライブによりますが、200GB はサーバーへ 20–40 分かかることも。" },
      ],
    },
    es: {
      steps: ["Introduce duración y resolución (2K/4K).", "Elige fps (24/25/30/48/60) y bitrate J2K.", "Lee el tamaño del DCP con audio y subtítulos."],
      explanationTitle: "Tamaño de un Digital Cinema Package",
      formula: "tamaño ≈ (videoBitrate + audioBitrate) × duración; 4K@24 ≈ 250 Mbps",
      explanation: [
        "Un DCP guarda cada fotograma como JPEG 2000 más audio PCM, por eso es enorme vs formatos consumer.",
        "Los DCP se construyen por versión (2D/3D, idiomas); cada versión multiplica almacenamiento e ingest.",
      ],
      faq: [
        { q: "¿Por qué tan grandes?", a: "J2K casi sin pérdida a bitrate de cine, muy por encima del streaming." },
        { q: "¿Recargo 3D?", a: "El 3D duplica los datos de imagen, aproximadamente el doble del vídeo." },
        { q: "¿Cuánto tarda el ingest?", a: "Según disco; 200 GB pueden tardar 20–40 min en copiarse." },
      ],
    },
  },
  "foot-lambert": {
    en: {
      steps: [
        "Enter the luminance in foot-lamberts (fL) or nits you measured.",
        "Choose the direction of conversion.",
        "Read the equivalent value in the other unit.",
      ],
      explanationTitle: "Foot-lambert and nits",
      formula: "1 fL = 3.426 nits (cd/m²); 1 nit = 0.2919 fL",
      explanation: [
        "Foot-lambert is a US customary luminance unit used in cinema and projection; nits (candela per square meter) is the SI unit.",
        "A typical dim cinema screen runs about 14–16 fL, while bright living-room TVs can exceed 500–1000 nits.",
      ],
      faq: [
        { q: "Why do cinemas use fL?", a: "It is the traditional unit for projected screen brightness in the US market." },
        { q: "How many nits is 14 fL?", a: "About 48 nits (14 × 3.426), the classic SMPTE cinema target." },
        { q: "Are HDR nits comparable to fL?", a: "Different scales; HDR peak nits measure highlight brightness, not steady screen fL." },
      ],
    },
    zh: {
      steps: ["输入测得的亮度（fL 或 nits）。", "选择转换方向。", "读取另一单位下的等效值。"],
      explanationTitle: "foot-lambert 与 nits",
      formula: "1 fL = 3.426 nits（cd/m²）；1 nit = 0.2919 fL",
      explanation: [
        "foot-lambert 是美制亮度单位，用于影院和投影；nits（坎德拉/平方米）是国际单位。",
        "典型昏暗影院屏幕约 14–16 fL，而明亮的客厅电视可超过 500–1000 nits。",
      ],
      faq: [
        { q: "影院为什么用 fL？", a: "它是美国市场投影屏幕亮度的传统单位。" },
        { q: "14 fL 是多少 nits？", a: "约 48 nits（14 × 3.426），经典 SMPTE 影院目标。" },
        { q: "HDR 的 nits 能和 fL 比吗？", a: "量纲不同；HDR 峰值 nits 测高光亮度，不是稳定屏幕 fL。" },
      ],
    },
    zhTW: {
      steps: ["輸入測得的亮度（fL 或 nits）。", "選擇轉換方向。", "讀取另一單位下的等效值。"],
      explanationTitle: "foot-lambert 與 nits",
      formula: "1 fL = 3.426 nits（cd/m²）；1 nit = 0.2919 fL",
      explanation: [
        "foot-lambert 是美制亮度單位，用於影院和投影；nits（坎德拉/平方米）是國際單位。",
        "典型昏暗影院螢幕約 14–16 fL，而明亮的客廳電視可超過 500–1000 nits。",
      ],
      faq: [
        { q: "影院為什麼用 fL？", a: "它是美國市場投影螢幕亮度的傳統單位。" },
        { q: "14 fL 是多少 nits？", a: "約 48 nits（14 × 3.426），經典 SMPTE 影院目標。" },
        { q: "HDR 的 nits 能和 fL 比嗎？", a: "量綱不同；HDR 峰值 nits 測高光亮度，不是穩定螢幕 fL。" },
      ],
    },
    de: {
      steps: ["Gib die Leuchtdichte in fL oder nits ein.", "Wähle die Richtung.", "Lies den äquivalenten Wert."],
      explanationTitle: "Foot-Lambert und Nits",
      formula: "1 fL = 3,426 nits (cd/m²); 1 nit = 0,2919 fL",
      explanation: [
        "Foot-Lambert ist eine US-Einheit für Leuchtdichte in Kino/Projektion; Nits (cd/m²) ist SI-Einheit.",
        "Ein dunkles Kino läuft etwa 14–16 fL, helle TVs übertreffen 500–1000 nits.",
      ],
      faq: [
        { q: "Warum fL im Kino?", a: "Traditionelle Einheit für projizierte Bildhelligkeit in den USA." },
        { q: "Wie viele nits sind 14 fL?", a: "Etwa 48 nits (14 × 3,426), das klassische SMPTE-Ziel." },
        { q: "Sind HDR-nits mit fL vergleichbar?", a: "Nein; HDR-Spitzen messen Highlight-Helligkeit, nicht steady fL." },
      ],
    },
    ja: {
      steps: ["測定した輝度（fL または nits）を入力。", "変換方向を選択。", "他単位の等效値を確認。"],
      explanationTitle: "foot-lambert と nits",
      formula: "1 fL = 3.426 nits（cd/m²）；1 nit = 0.2919 fL",
      explanation: [
        "foot-lambert は米国の輝度単位（映画・投影）；nits（cd/m²）は SI 単位です。",
        "暗い映画館のスクリーンは約 14–16 fL、明るいリビング TV は 500–1000 nits 超えることも。" ],
      faq: [
        { q: "映画館はなぜ fL？", a: "米国市場の投影輝度の伝統的な単位だからです。" },
        { q: "14 fL は何 nits？", a: "約 48 nits（14 × 3.426）、古典的な SMPTE 目標値。" },
        { q: "HDR の nits は fL と比べる？", a: "異なる尺度；HDR ピーク nits はハイライト輝度を測り、安定 fL ではありません。" },
      ],
    },
    es: {
      steps: ["Introduce la luminancia en fL o nits.", "Elige la dirección.", "Lee el valor equivalente."],
      explanationTitle: "Foot-lambert y nits",
      formula: "1 fL = 3,426 nits (cd/m²); 1 nit = 0,2919 fL",
      explanation: [
        "El foot-lambert es una unidad de luminancia de EE. UU. para cine; el nit (cd/m²) es SI.",
        "Una sala oscura ronda 14–16 fL, mientras TVs brillantes superan 500–1000 nits.",
      ],
      faq: [
        { q: "¿Por qué fL en cine?", a: "Unidad tradicional de brillo de pantalla proyectada en EE. UU." },
        { q: "¿Cuántos nits son 14 fL?", a: "Unos 48 nits (14 × 3,426), el objetivo SMPTE clásico." },
        { q: "¿Comparables nits HDR y fL?", a: "No; los nits pico HDR miden brillo de altas luces, no fL estable." },
      ],
    },
  },
  "screen-size": {
    en: {
      steps: [
        "Enter the diagonal screen size in inches or cm.",
        "Enter the aspect ratio (16:9, 21:9, 4:3, etc.).",
        "Read the width and height of the visible screen area.",
      ],
      explanationTitle: "Screen size from diagonal",
      formula: "width = diagonal / √(1 + (H/W)²); height = width × (H/W)",
      explanation: [
        "Screen size is quoted by diagonal, but the visible width and height depend on the aspect ratio.",
        "A 65-inch 16:9 TV is about 56.7 inches wide; the same diagonal at 21:9 is wider and shorter.",
      ],
      faq: [
        { q: "Does diagonal include the bezel?", a: "No; the diagonal is the viewable panel, though some retailers blur the line." },
        { q: "Why does 21:9 look different?", a: "Same diagonal but a wider, shorter rectangle; great for movies, less for documents." },
        { q: "How do I convert cm to inches?", a: "Divide centimeters by 2.54 to get inches." },
      ],
    },
    zh: {
      steps: ["输入屏幕对角线尺寸（英寸或厘米）。", "输入宽高比（16:9、21:9、4:3 等）。", "读取可视屏幕区域的宽和高。"],
      explanationTitle: "由对角线求屏幕尺寸",
      formula: "宽 = 对角线 / √(1 + (H/W)²)；高 = 宽 × (H/W)",
      explanation: [
        "屏幕尺寸以对角线标示，但可视宽高取决于宽高比。",
        "65 英寸 16:9 电视约宽 56.7 英寸；同对角线 21:9 则更宽更矮。",
      ],
      faq: [
        { q: "对角线含边框吗？", a: "不含；是对角线可视面板，但部分商家界线模糊。" },
        { q: "为什么 21:9 看起来不同？", a: "同对角线但更宽更矮的矩形；适合电影，不适合文档。" },
        { q: "厘米怎么转英寸？", a: "厘米除以 2.54 得到英寸。" },
      ],
    },
    zhTW: {
      steps: ["輸入螢幕對角線尺寸（英寸或公分）。", "輸入寬高比（16:9、21:9、4:3 等）。", "讀取可視螢幕區域的寬和高。"],
      explanationTitle: "由對角線求螢幕尺寸",
      formula: "寬 = 對角線 / √(1 + (H/W)²)；高 = 寬 × (H/W)",
      explanation: [
        "螢幕尺寸以對角線標示，但可視寬高取決於寬高比。",
        "65 英寸 16:9 電視約寬 56.7 英寸；同對角線 21:9 則更寬更矮。",
      ],
      faq: [
        { q: "對角線含邊框嗎？", a: "不含；是對角線可視面板，但部分商家界線模糊。" },
        { q: "為什麼 21:9 看起來不同？", a: "同對角線但更寬更矮的矩形；適合電影，不適合文件。" },
        { q: "公分怎麼轉英寸？", a: "公分除以 2.54 得到英寸。" },
      ],
    },
    de: {
      steps: ["Gib die Diagonale in Zoll oder cm ein.", "Gib das Seitenverhältnis ein.", "Lies Breite und Höhe der Fläche."],
      explanationTitle: "Bildschirmgröße aus Diagonale",
      formula: "breite = diagonale / √(1 + (H/B)²); höhe = breite × (H/B)",
      explanation: [
        "Bildschirme werden über die Diagonale angegeben; sichtbare Maße hängen vom Format ab.",
        "Ein 65-Zoll 16:9 TV ist ~56,7 Zoll breit; bei 21:9 ist er breiter und flacher.",
      ],
      faq: [
        { q: "Diagonale mit Rahmen?", a: "Nein; es ist das sichtbare Panel, manche Händler verwischen das." },
        { q: "Warum wirkt 21:9 anders?", a: "Gleiche Diagonale, aber breiter/flacher; gut für Film, weniger für Text." },
        { q: "cm in Zoll?", a: "Zentimeter durch 2,54 teilen." },
      ],
    },
    ja: {
      steps: ["画面の対角線サイズ（インチかcm）を入力。", "アスペクト比（16:9、21:9、4:3等）を入力。", "表示領域の幅と高さを確認。"],
      explanationTitle: "対角線からの画面サイズ",
      formula: "幅 = 対角線 / √(1 + (H/W)²)；高 = 幅 × (H/W)",
      explanation: [
        "画面サイズは対角線で表記されますが、表示幅高はアスペクト比に依存します。",
        "65インチ 16:9 は幅約 56.7 インチ；同じ対角線の 21:9 はより幅広く低い。" ],
      faq: [
        { q: "対角線に枠は含む？", a: "含みません。表示パネルの対角線ですが、店によって曖昧な場合も。" },
        { q: "なぜ 21:9 は違う？", a: "同じ対角線でも幅広・低い長方形。映画向き、文書には不向き。" },
        { q: "cm をインチに？", a: "センチを 2.54 で割ります。" },
      ],
    },
    es: {
      steps: ["Introduce la diagonal en pulgadas o cm.", "Introduce la proporción (16:9, 21:9, 4:3…).", "Lee el ancho y alto del área visible."],
      explanationTitle: "Tamaño de pantalla desde la diagonal",
      formula: "ancho = diagonal / √(1 + (H/W)²); alto = ancho × (H/W)",
      explanation: [
        "El tamaño se da por la diagonal, pero el ancho y alto visibles dependen de la proporción.",
        "Un TV de 65 pulgadas 16:9 mide ~56,7 pulgadas de ancho; igual diagonal en 21:9 es más ancho y bajo.",
      ],
      faq: [
        { q: "¿La diagonal incluye el marco?", a: "No; es el panel visible, aunque algunos lo difuminan." },
        { q: "¿Por qué 21:9 es distinto?", a: "Misma diagonal pero rectángulo más ancho y bajo; cine sí, documentos no." },
        { q: "¿cm a pulgadas?", a: "Centímetros dividido 2,54." },
      ],
    },
  },
  "video-bitrate": {
    en: {
      steps: [
        "Enter the target file size and the video duration.",
        "Enter the audio bitrate to subtract from the total.",
        "Read the video bitrate needed to hit your size target.",
      ],
      explanationTitle: "Video bitrate from target size",
      formula: "videoBitrate = (targetBytes × 8 / duration) − audioBitrate",
      explanation: [
        "If you must fit a video into a fixed upload or storage budget, work backward from size to bitrate.",
        "Leave headroom for container overhead and audio; the calculator subtracts audio so the video gets the remainder.",
      ],
      faq: [
        { q: "My file is bigger than target; why?", a: "Container overhead, keyframes, and audio take extra space beyond the raw video bitrate." },
        { q: "Should I lower resolution or bitrate?", a: "Lower bitrate first; dropping resolution also shrinks detail permanently." },
        { q: "What bitrate for a 1 GB hourly video?", a: "About 2.2 Mbps video if audio is ~128 kbps." },
      ],
    },
    zh: {
      steps: ["输入目标文件大小和视频时长。", "输入需扣除的音频码率。", "读取达到大小目标所需的视频码率。"],
      explanationTitle: "由目标大小反推视频码率",
      formula: "视频码率 = (目标字节 × 8 / 时长) − 音频码率",
      explanation: [
        "若必须把视频塞进固定上传或存储预算，可从大小反推码率。",
        "为封装开销和音频留出余量；计算器会先扣掉音频，视频得到剩余部分。",
      ],
      faq: [
        { q: "文件比目标大，为什么？", a: "封装开销、关键帧和音频都会占用原始视频码率之外的额外空间。" },
        { q: "该降分辨率还是降码率？", a: "先降码率；降分辨率会永久损失细节。" },
        { q: "1GB 每小时的视频用多少码率？", a: "音频约 128kbps 时，视频约 2.2 Mbps。" },
      ],
    },
    zhTW: {
      steps: ["輸入目標檔案大小和影片時長。", "輸入需扣除的音訊碼率。", "讀取達到大小目標所需的視訊碼率。"],
      explanationTitle: "由目標大小反推影片碼率",
      formula: "視訊碼率 = (目標位元組 × 8 / 時長) − 音訊碼率",
      explanation: [
        "若必須把影片塞進固定上傳或儲存預算，可從大小反推碼率。",
        "為封裝開銷和音訊留餘量；計算器會先扣掉音訊，視訊得到剩餘部分。",
      ],
      faq: [
        { q: "檔案比目標大，為什麼？", a: "封裝開銷、關鍵幀和音訊都會佔用原始視訊碼率之外的額外空間。" },
        { q: "該降解析度還是降碼率？", a: "先降碼率；降解析度會永久損失細節。" },
        { q: "1GB 每小時的影片用多少碼率？", a: "音訊約 128kbps 時，視訊約 2.2 Mbps。" },
      ],
    },
    de: {
      steps: ["Gib Zielgröße und Dauer ein.", "Gib die Audio-Bitrate ein.", "Lies die nötige Video-Bitrate."],
      explanationTitle: "Video-Bitrate aus Zielgröße",
      formula: "videoBitrate = (zielBytes × 8 / dauer) − audioBitrate",
      explanation: [
        "Muss ein Video in ein festes Upload- oder Speicherbudget passen, rechne von der Größe zurück.",
        "Lass Puffer für Container und Audio; der Rechner zieht Audio ab, Video bekommt den Rest.",
      ],
      faq: [
        { q: "Datei größer als Ziel?", a: "Container-Overhead, Keyframes und Audio brauchen zusätzlich Platz." },
        { q: "Auflösung oder Bitrate senken?", a: "Erst Bitrate; Auflösung senken verliert dauerhaft Detail." },
        { q: "Bitrate für 1 GB/Stunde?", a: "Bei ~128 kbps Audio etwa 2,2 Mbps Video." },
      ],
    },
    ja: {
      steps: ["目標サイズと動画の長さを入力。", "差し引く音声ビットレートを入力。", "目標サイズ達成に必要な映像ビットレートを確認。"],
      explanationTitle: "目標サイズから映像ビットレートを逆算",
      formula: "映像ビットレート = (目標バイト × 8 / 時間) − 音声ビットレート",
      explanation: [
        "動画を決まったアップロード・保存枠に収めるには、サイズからビットレートを逆算します。",
        "コンテナオーバーヘッドと音声の余裕を残し、計算機は音声を引いて映像に残りを割り当てます。",
      ],
      faq: [
        { q: "目標より大きいのは？", a: "コンテナオーバーヘッド・キーフレーム・音声が映像ビットレート外の余地を占います。" },
        { q: "解像度とビットレートどちら下げる？", a: "まずビットレート。解像度低下は細部を永久に失います。" },
        { q: "1GB/時のビットレートは？", a: "音声128kbpsなら映像約2.2Mbps。" },
      ],
    },
    es: {
      steps: ["Introduce tamaño objetivo y duración.", "Introduce el bitrate de audio.", "Lee el bitrate de vídeo necesario."],
      explanationTitle: "Bitrate de vídeo desde tamaño objetivo",
      formula: "videoBitrate = (bytesObj × 8 / duración) − audioBitrate",
      explanation: [
        "Si el vídeo debe caber en un presupuesto fijo, calcula el bitrate a partir del tamaño.",
        "Deja margen para contenedor y audio; la calculadora resta audio y da el resto al vídeo.",
      ],
      faq: [
        { q: "¿Archivo mayor que el objetivo?", a: "El contenedor, los keyframes y el audio ocupan espacio extra." },
        { q: "¿Bajar resolución o bitrate?", a: "Primero bitrate; bajar resolución pierde detalle para siempre." },
        { q: "¿Bitrate para 1 GB/hora?", a: "Con audio ~128 kbps, vídeo ~2,2 Mbps." },
      ],
    },
  },
  "frame-rate": {
    en: {
      steps: [
        "Enter the source frame rate you are converting from.",
        "Enter the target frame rate.",
        "Read the speed change and whether frames need to be dropped or blended.",
      ],
      explanationTitle: "Frame rate conversion",
      formula: "playbackSpeed = targetFps / sourceFps; duration_new = duration / playbackSpeed",
      explanation: [
        "Changing frame rate without adjusting speed changes how fast the video plays; 30→24 fps slows motion by 20%.",
        "Conversions like 24→60 fps need frame interpolation (e.g., motion smoothing) or duplicate frames; simple resampling can judder.",
      ],
      faq: [
        { q: "Why does 24→30 look off?", a: "Without proper pulldown or interpolation, 24 cannot divide evenly into 30, causing judder." },
        { q: "Is 60 fps always smoother?", a: "For motion yes, but purists dislike the 'soap opera' look on film content." },
        { q: "What is 3:2 pulldown?", a: "A pattern that maps 24 fps film to 60 Hz interlaced displays by alternating repeated fields." },
      ],
    },
    zh: {
      steps: ["输入源帧率。", "输入目标帧率。", "读取速度变化以及是否需要丢帧或混合帧。"],
      explanationTitle: "帧率转换",
      formula: "播放速度 = 目标fps / 源fps；新时长 = 时长 / 播放速度",
      explanation: [
        "不改速度而改帧率会改变播放快慢；30→24fps 会使动作慢 20%。",
        "24→60fps 需要帧插值（如运动平滑）或重复帧；简单重采样会卡顿。",
      ],
      faq: [
        { q: "为什么 24→30 看起来怪？", a: "无正确 pulldown 或插值时，24 无法整除 30，产生抖动。" },
        { q: "60fps 总更顺吗？", a: "运动更顺，但影迷不喜欢电影内容的“肥皂剧效应”。" },
        { q: "什么是 3:2 pulldown？", a: "交替重复场，把 24fps 电影映射到 60Hz 隔行显示的模式。" },
      ],
    },
    zhTW: {
      steps: ["輸入源幀率。", "輸入目標幀率。", "讀取速度變化以及是否需要丟幀或混合幀。"],
      explanationTitle: "幀率轉換",
      formula: "播放速度 = 目標fps / 源fps；新時長 = 時長 / 播放速度",
      explanation: [
        "不改速度而改幀率會改變播放快慢；30→24fps 會使動作慢 20%。",
        "24→60fps 需要幀插值（如運動平滑）或重複幀；簡單重採樣會卡頓。",
      ],
      faq: [
        { q: "為什麼 24→30 看起來怪？", a: "無正確 pulldown 或插值時，24 無法整除 30，產生抖動。" },
        { q: "60fps 總更順嗎？", a: "運動更順，但影迷不喜歡電影內容的「肥皂劇效應」。" },
        { q: "什麼是 3:2 pulldown？", a: "交替重複場，把 24fps 電影映射到 60Hz 隔行顯示的模式。" },
      ],
    },
    de: {
      steps: ["Gib die Quell-Bildrate ein.", "Gib die Ziel-Bildrate ein.", "Lies die Tempoproportionalität und ob Frames fallen/gemixt werden."],
      explanationTitle: "Bildraten-Umwandlung",
      formula: "tempo = zielFps / quellFps; dauerNeu = dauer / tempo",
      explanation: [
        "Bildrate ohne Tempokorrektur ändert die Geschwindigkeit; 30→24 fps verlangsamt um 20%.",
        "24→60 fps braucht Interpolation oder Doppel-Frames; einfaches Resampling ruckelt.",
      ],
      faq: [
        { q: "Warum wirkt 24→30 falsch?", a: "Ohne Pulldown/Interpolation teilt 24 nicht glatt durch 30, Judder entsteht." },
        { q: "60 fps immer flüssiger?", a: "Bei Bewegung ja, doch Filmliebhaber hassen den 'Soap-Opera'-Effekt." },
        { q: "Was ist 3:2 Pulldown?", a: "Muster, das 24 fps Film auf 60 Hz interlaced abbildet." },
      ],
    },
    ja: {
      steps: ["元のフレームレートを入力。", "目標フレームレートを入力。", "速度変化とフレームの削除・混合の要否を確認。"],
      explanationTitle: "フレームレート変換",
      formula: "再生速度 = 目標fps / 元fps；新時間 = 時間 / 再生速度",
      explanation: [
        "速度を変えずにフレームレートを変えると再生速度が変わります（30→24fps は 20% スロー）。",
        "24→60fps はフレーム補間（モーションスムージング）か重複フレームが必要；単純リサンプルはカクつきます。",
      ],
      faq: [
        { q: "なぜ 24→30 は変？", a: "正しいプルダウン/補間がないと 24 は 30 に割り切れずジャダーします。" },
        { q: "60fps はいつも滑らか？", a: "動きは滑らかですが、映画ファンは「ソープオペラ効果」を嫌います。" },
        { q: "3:2 プルダウンとは？", a: "24fps フィルムを 60Hz インターレース表示へ、フィールドを交互に重复させる手法。" },
      ],
    },
    es: {
      steps: ["Introduce la fps de origen.", "Introduce la fps destino.", "Lee el cambio de velocidad y si hay que soltar/mezclar frames."],
      explanationTitle: "Conversión de frame rate",
      formula: "velocidad = fpsDest / fpsOrig; duraciónNueva = duración / velocidad",
      explanation: [
        "Cambiar fps sin ajustar velocidad altera la reproducción; 30→24 fps ralentiza un 20%.",
        "24→60 fps necesita interpolación o frames duplicados; el resampleo simple da tirones.",
      ],
      faq: [
        { q: "¿Por qué 24→30 se ve mal?", a: "Sin pulldown/interpolación, 24 no divide 30 parejo y salta." },
        { q: "¿60 fps siempre más fluido?", a: "En movimiento sí, pero a los cinéfilos les disgusta el efecto 'telefilme'." },
        { q: "¿Qué es 3:2 pulldown?", a: "Patrón que mapea cine 24 fps a 60 Hz entrelazado repitiendo campos." },
      ],
    },
  },
};

for (const lang of LANGS) {
  const raw = fs.readFileSync(FILE(lang), "utf8");
  const j = JSON.parse(raw);
  for (const id of Object.keys(DATA)) {
    const g = DATA[id][lang] || DATA[id][lang.replace(/-/g, "")];
    if (!g) throw new Error(`Missing lang ${lang} for ${id}`);
    j.converter[id].guide = {
      steps: g.steps,
      explanationTitle: g.explanationTitle,
      formula: g.formula,
      explanation: g.explanation,
      faq: g.faq,
    };
  }
  fs.writeFileSync(FILE(lang), JSON.stringify(j, null, 2) + "\n");
}

console.log("Injected video 8 tools x 6 languages = 48 guide sets.");
