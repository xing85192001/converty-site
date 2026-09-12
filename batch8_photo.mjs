// 第八批 A 层深度文案注入：photo 14 个工具 × 6 语言
import fs from "fs";

const LANGS = ["en", "zh", "zh-TW", "de", "ja", "es"];
const FILE = (l) => `./src/messages/${l}.json`;

const DATA = {
  "aspect-fit": {
    en: {
      steps: [
        "Enter the source width and height of your image or video.",
        "Enter the target frame width and height you want to fit into.",
        "Read the fitted size, the scale factor, and whether letterbox or pillarbox bars are needed.",
      ],
      explanationTitle: "What is aspect-fit scaling?",
      formula: "scale = min(targetW / srcW, targetH / srcH); fittedW = srcW × scale; fittedH = srcH × scale",
      explanation: [
        "Aspect-fit scales content so the entire source fits inside the target frame while keeping its original proportions.",
        "The leftover space becomes letterbox bars (top/bottom) or pillarbox bars (left/right). Aspect-fill does the opposite, cropping to fill.",
      ],
      faq: [
        { q: "What is the difference between fit and fill?", a: "Fit preserves the whole image with possible bars; fill covers the frame but crops overflow." },
        { q: "Why do I get black bars?", a: "Bars appear when the source and target aspect ratios differ; they keep the picture undistorted." },
        { q: "Does aspect-fit change file resolution?", a: "No; it only changes how the source maps onto the target frame, not the source pixels." },
      ],
    },
    zh: {
      steps: ["输入图片或视频的原始宽和高。", "输入你想放入的目标框宽和高。", "查看适配后的尺寸、缩放比例，以及是否需要上下或左右黑边。"],
      explanationTitle: "什么是等比适配（aspect-fit）缩放？",
      formula: "缩放比 = min(目标宽/原宽, 目标高/原高)；适配宽 = 原宽 × 缩放比；适配高 = 原高 × 缩放比",
      explanation: [
        "等比适配会在保持原始比例的前提下，把整个内容缩放到能放入目标框内的最大尺寸。",
        "多出来的空间会形成上下黑边（letterbox）或左右黑边（pillarbox）。等比填充（aspect-fill）则相反，会裁切以铺满画面。",
      ],
      faq: [
        { q: "fit 和 fill 有什么区别？", a: "fit 保证完整显示、可能留黑边；fill 铺满画面但会裁掉溢出部分。" },
        { q: "为什么会出现黑边？", a: "当源与目标宽高比不同时就会出现黑边，目的是保持画面不变形。" },
        { q: "等比适配会改变文件分辨率吗？", a: "不会，它只改变源在目标框中的映射方式，不改变源像素本身。" },
      ],
    },
    zhTW: {
      steps: ["輸入圖片或影片的原始寬和高。", "輸入你想放入的目標框寬和高。", "查看適配後的尺寸、縮放比例，以及是否需要上下或左右黑邊。"],
      explanationTitle: "什麼是等比適配（aspect-fit）縮放？",
      formula: "縮放比 = min(目標寬/原寬, 目標高/原高)；適配寬 = 原寬 × 縮放比；適配高 = 原高 × 縮放比",
      explanation: [
        "等比適配會在保持原始比例的前提下，把整個內容縮放到能放入目標框內的最大尺寸。",
        "多出來的空間會形成上下黑邊（letterbox）或左右黑邊（pillarbox）。等比填充（aspect-fill）則相反，會裁切以鋪滿畫面。",
      ],
      faq: [
        { q: "fit 和 fill 有什麼差別？", a: "fit 保證完整顯示、可能留黑邊；fill 鋪滿畫面但會裁掉溢出部分。" },
        { q: "為什麼會出現黑邊？", a: "當源與目標寬高比不同時就會出現黑邊，目的是保持畫面不變形。" },
        { q: "等比適配會改變檔案解析度嗎？", a: "不會，它只改變源在目標框中的映射方式，不改變源像素本身。" },
      ],
    },
    de: {
      steps: ["Gib Breite und Höhe deines Bildes oder Videos ein.", "Gib die Zielrahmen-Breite und -Höhe ein.", "Lies die angepasste Größe, den Skalierungsfaktor und ob Balken nötig sind."],
      explanationTitle: "Was ist Aspect-Fit-Skalierung?",
      formula: "scale = min(zielW / quW, zielH / quH); passW = quW × scale; passH = quH × scale",
      explanation: [
        "Aspect-Fit skaliert Inhalte so, dass das gesamte Original in den Zielrahmen passt, ohne das Seitenverhältnis zu ändern.",
        "Der verbleibende Raum wird zu Letterbox-Streifen (oben/unten) oder Pillarbox-Streifen (links/rechts). Aspect-Fill füllt stattdessen und schneidet überflüssiges ab.",
      ],
      faq: [
        { q: "Was ist der Unterschied zwischen Fit und Fill?", a: "Fit zeigt das ganze Bild mit möglichen Balken; Fill füllt den Rahmen, schneidet aber überstehende Teile ab." },
        { q: "Warum erscheinen schwarze Balken?", a: "Balken entstehen bei unterschiedlichen Seitenverhältnissen und halten das Bild verzerrungsfrei." },
        { q: "Ändert Aspect-Fit die Auflösung?", a: "Nein; es ändert nur die Abbildung auf den Zielrahmen, nicht die Quellpixel." },
      ],
    },
    ja: {
      steps: ["画像や動画の元の幅と高さを入力します。", "収めたいターゲット枠の幅と高さを入力します。", "収まったサイズ・倍率・黒枠（レターボックス／ピラーボックス）の有無を確認します。"],
      explanationTitle: "アスペクト比を維持する収縮（aspect-fit）とは？",
      formula: "倍率 = min(目標幅/元幅, 目標高/元高)；収納幅 = 元幅 × 倍率；収納高 = 元高 × 倍率",
      explanation: [
        "アスペクトフィットは、元の縦横比を保ったまま全体がターゲット枠に収まるよう縮小します。",
        "余った部分は上下（レターボックス）または左右（ピラーボックス）の黒枠になります。アスペクトフィルは逆にトリミングして枠を埋めます。",
      ],
      faq: [
        { q: "fit と fill の違いは？", a: "fit は全体を表示（黒枠の可能性あり）、fill は枠を埋めますがはみ出しを切り取ります。" },
        { q: "なぜ黒枠が出るの？", a: "元とターゲットの比率が違うと黒枠ができ、画像をゆがめず保つためです。" },
        { q: "aspect-fit で解像度は変わる？", a: "いいえ。ソースのマッピング方法のみ変わり、画素自体は変わりません。" },
      ],
    },
    es: {
      steps: ["Introduce el ancho y alto original de tu imagen o vídeo.", "Introduce el ancho y alto del marco de destino.", "Lee el tamaño ajustado, el factor de escala y si hacen falta barras."],
      explanationTitle: "¿Qué es el escalado aspect-fit?",
      formula: "escala = min(destW / origW, destH / origH); ajustW = origW × escala; ajustH = origH × escala",
      explanation: [
        "Aspect-fit escala el contenido para que quepa entero en el marco destino sin cambiar su proporción.",
        "El espacio sobrante forma barras letterbox (arriba/abajo) o pillarbox (izquierda/derecha). Aspect-fill hace lo contrario y recorta.",
      ],
      faq: [
        { q: "¿Diferencia entre fit y fill?", a: "Fit muestra todo con posibles barras; fill llena el marco pero recorta el desbordamiento." },
        { q: "¿Por qué salen barras negras?", a: "Aparecen cuando difieren las proporciones; mantienen la imagen sin distorsión." },
        { q: "¿Cambia aspect-fit la resolución?", a: "No; solo cambia cómo se mapea al marco, no los píxeles originales." },
      ],
    },
  },
  "megapixel-aspects": {
    en: {
      steps: [
        "Enter the total megapixels of the sensor or image.",
        "Choose the aspect ratio you want, such as 3:2, 4:3, or 16:9.",
        "Read the resulting width and height in pixels for that ratio.",
      ],
      explanationTitle: "Megapixels to pixel dimensions",
      formula: "totalPixels = MP × 1,000,000; width = √(totalPixels × (W/(W+H))); height = width × (H/W) normalized",
      explanation: [
        "A megapixel is one million pixels. The same megapixel count can map to different width and height depending on the aspect ratio.",
        "Cameras commonly use 3:2 (DSLR/mirrorless), 4:3 (micro four thirds, phones), and 16:9 (video).",
      ],
      faq: [
        { q: "Does more megapixels mean better quality?", a: "Not always; sensor size, lens, and pixel quality matter as much as the count." },
        { q: "Why do phones list 4:3 but shoot 16:9 video?", a: "Video crops the sensor to 16:9, which is why stills and video resolutions differ." },
        { q: "How do I get exact dimensions?", a: "Use the calculator: it solves width × height = total pixels under your chosen ratio." },
      ],
    },
    zh: {
      steps: ["输入传感器或图片的总百万像素（MP）。", "选择想要的宽高比，如 3:2、4:3 或 16:9。", "查看该比例下对应的宽和高（像素）。"],
      explanationTitle: "百万像素换算成像素尺寸",
      formula: "总像素 = MP × 1,000,000；宽度 = √(总像素 × (W/(W+H)))；高度按宽高比归一化",
      explanation: [
        "1 百万像素等于 100 万像素。相同的百万像素数量，因宽高比不同会有不同的宽和高。",
        "相机常用 3:2（单反/无反）、4:3（M43、手机）和 16:9（视频）。",
      ],
      faq: [
        { q: "像素越高画质越好吗？", a: "不一定，传感器尺寸、镜头和单个像素质量同样重要。" },
        { q: "手机标 4:3 却拍 16:9 视频？", a: "视频是对传感器裁切到 16:9，所以照片和视频分辨率不同。" },
        { q: "如何得到精确尺寸？", a: "用本计算器：在选定比例下求解 宽×高=总像素。" },
      ],
    },
    zhTW: {
      steps: ["輸入感測器或圖片的總百萬像素（MP）。", "選擇想要的寬高比，如 3:2、4:3 或 16:9。", "查看該比例下對應的寬和高（像素）。"],
      explanationTitle: "百萬像素換算成像素尺寸",
      formula: "總像素 = MP × 1,000,000；寬度 = √(總像素 × (W/(W+H)))；高度按寬高比歸一化",
      explanation: [
        "1 百萬像素等於 100 萬像素。相同的百萬像素數量，因寬高比不同會有不同的寬和高。",
        "相機常用 3:2（單眼/無反）、4:3（M43、手機）和 16:9（影片）。",
      ],
      faq: [
        { q: "像素越高畫質越好嗎？", a: "不一定，感測器尺寸、鏡頭和單一像素品質同樣重要。" },
        { q: "手機標 4:3 卻拍 16:9 影片？", a: "影片是對感測器裁切到 16:9，所以照片和影片解析度不同。" },
        { q: "如何得到精確尺寸？", a: "用本計算器：在選定比例下求解 寬×高=總像素。" },
      ],
    },
    de: {
      steps: ["Gib die Megapixel des Sensors oder Bildes ein.", "Wähle das Seitenverhältnis, z. B. 3:2, 4:3 oder 16:9.", "Lies Breite und Höhe in Pixeln für dieses Verhältnis."],
      explanationTitle: "Megapixel in Pixelmaße umrechnen",
      formula: "gesamtPixel = MP × 1.000.000; breite = √(gesamtPixel × (B/(B+H))); höhe normiert",
      explanation: [
        "Ein Megapixel sind eine Million Pixel. Dieselbe Zahl ergibt je nach Seitenverhältnis andere Breiten und Höhen.",
        "Kameras nutzen meist 3:2 (Spiegelreflex), 4:3 (MFT, Handys) und 16:9 (Video).",
      ],
      faq: [
        { q: "Mehr Megapixel = bessere Qualität?", a: "Nicht zwingend; Sensorgröße, Objektiv und Pixelqualität zählen ebenso." },
        { q: "Warum filmen Handys 16:9 bei 4:3 Fotos?", a: "Video beschneidet den Sensor auf 16:9, daher unterscheiden sich die Auflösungen." },
        { q: "Wie erhalte ich exakte Maße?", a: "Der Rechner löst Breite × Höhe = Gesamtpixel unter dem gewählten Verhältnis." },
      ],
    },
    ja: {
      steps: ["センサーや画像の総メガピクセル（MP）を入力します。", "3:2、4:3、16:9 などのアスペクト比を選びます。", "その比率での幅と高さ（ピクセル）を確認します。"],
      explanationTitle: "メガピクセルから画素寸法へ",
      formula: "総画素 = MP × 1,000,000；幅 = √(総画素 × (W/(W+H)))；高さは比率で正規化",
      explanation: [
        "1 メガピクセルは 100 万画素です。同じメガピクセル数でもアスペクト比で幅と高さが変わります。",
        "カメラは 3:2（一眼）、4:3（M43・スマホ）、16:9（動画）が一般的です。",
      ],
      faq: [
        { q: "画素が多いほど画質が良い？", a: "必ずしもそうではありません。センサーサイズ・レンズ・画素品質も同等に重要です。" },
        { q: "スマホは 4:3 なのに 16:9 動画？", a: "動画はセンサーを 16:9 に切り取るため、写真と動画で解像度が異なります。" },
        { q: "正確な寸法は？", a: "この計算機は 幅×高さ=総画素 を選んだ比率で解きます。" },
      ],
    },
    es: {
      steps: ["Introduce los megapíxeles del sensor o imagen.", "Elige la proporción, como 3:2, 4:3 o 16:9.", "Lee el ancho y alto en píxeles para esa proporción."],
      explanationTitle: "Megapíxeles a dimensiones en píxeles",
      formula: "pixelesTot = MP × 1.000.000; ancho = √(pixTot × (W/(W+H))); alto normalizado",
      explanation: [
        "Un megapíxel son un millón de píxeles. La misma cifra da distintos anchos y altos según la proporción.",
        "Las cámaras usan 3:2 (réflex), 4:3 (MFT, móviles) y 16:9 (vídeo).",
      ],
      faq: [
        { q: "¿Más megapíxeles = mejor calidad?", a: "No siempre; el tamaño del sensor, la óptica y la calidad de píxel también cuentan." },
        { q: "¿Por qué el móvil graba 16:9 si la foto es 4:3?", a: "El vídeo recorta el sensor a 16:9, por eso cambian las resoluciones." },
        { q: "¿Cómo obtengo medidas exactas?", a: "El calculador resuelve ancho × alto = píxeles totales bajo tu proporción." },
      ],
    },
  },
  "portrait-distance": {
    en: {
      steps: [
        "Enter the lens focal length and the camera sensor height.",
        "Enter the subject height you want to fill the frame.",
        "Read the shooting distance needed to compose the shot.",
      ],
      explanationTitle: "Portrait shooting distance",
      formula: "distance = focalLength × (subjectHeight / sensorHeight)",
      explanation: [
        "Using similar triangles, the distance scales with focal length and the ratio of subject size to sensor size.",
        "Longer lenses let you keep more distance for the same framing, which also flattens perspective for flattering portraits.",
      ],
      faq: [
        { q: "Does this include cropping?", a: "No; it assumes you fill the sensor. Cropping after capture effectively uses a longer focal length." },
        { q: "Why use 85mm for portraits?", a: "85mm gives pleasing compression and lets you stand a comfortable distance while filling the frame." },
        { q: "What about sensor crop factor?", a: "Use the effective focal length (lens × crop factor) for accurate distance." },
      ],
    },
    zh: {
      steps: ["输入镜头焦距和相机传感器高度。", "输入你想充满画面的被摄体高度。", "查看完成该构图所需的拍摄距离。"],
      explanationTitle: "人像拍摄距离",
      formula: "距离 = 焦距 × (被摄体高度 / 传感器高度)",
      explanation: [
        "利用相似三角形原理，距离随焦距以及被摄体与传感器尺寸的比值变化。",
        "更长焦距可在相同构图下保持更远机位，也会压平透视，使人像更显自然。",
      ],
      faq: [
        { q: "这包含后期裁切吗？", a: "不包含；它假设画面铺满传感器。后期裁切等效于使用了更长焦距。" },
        { q: "为什么人像常用 85mm？", a: "85mm 压缩感自然，且能在舒适距离填满画面。" },
        { q: "传感器裁切系数怎么算？", a: "用等效焦距（镜头焦距 × 裁切系数）才能得到准确距离。" },
      ],
    },
    zhTW: {
      steps: ["輸入鏡頭焦距和相機感測器高度。", "輸入你想充滿畫面的被攝體高度。", "查看完成該構圖所需的拍攝距離。"],
      explanationTitle: "人像拍攝距離",
      formula: "距離 = 焦距 × (被攝體高度 / 感測器高度)",
      explanation: [
        "利用相似三角形原理，距離隨焦距以及被攝體與感測器尺寸的比值變化。",
        "更長焦距可在相同構圖下保持更遠機位，也會壓平透視，使人像更顯自然。",
      ],
      faq: [
        { q: "這包含後期裁切嗎？", a: "不包含；它假設畫面鋪滿感測器。後期裁切等效於使用了更長焦距。" },
        { q: "為什麼人像常用 85mm？", a: "85mm 壓縮感自然，且能在舒適距離填滿畫面。" },
        { q: "感測器裁切係數怎麼算？", a: "用等效焦距（鏡頭焦距 × 裁切係數）才能得到準確距離。" },
      ],
    },
    de: {
      steps: ["Gib Brennweite und Sensormöhe ein.", "Gib die gewünschte Motivhöhe im Bild ein.", "Lies den nötigen Aufnahmeabstand."],
      explanationTitle: "Portrait-Aufnahmeabstand",
      formula: "abstand = brennweite × (motivHöhe / sensorHöhe)",
      explanation: [
        "Über ähnliche Dreiecke skaliert der Abstand mit der Brennweite und dem Verhältnis Motivgröße zu Sensorgröße.",
        "Längere Brennweiten erlauben mehr Abstand bei gleicher Bildfüllung und glätten die Perspektive für schmeichelhafte Porträts.",
      ],
      faq: [
        { q: "Berücksichtigt das Beschnitt?", a: "Nein; es geht von gefülltem Sensor aus. Beschnitt wirkt wie längere Brennweite." },
        { q: "Warum 85mm für Porträts?", a: "85mm gibt angenehme Kompression und komfortablen Abstand bei gefülltem Bild." },
        { q: "Crop-Faktor beachten?", a: "Nimm die effektive Brennweite (Objektiv × Crop) für genauen Abstand." },
      ],
    },
    ja: {
      steps: ["レンズの焦点距離とセンサー高さを入力します。", "画面を埋めたい被写体の高さを入力します。", "その構図に必要な撮影距離を確認します。"],
      explanationTitle: "ポートレート撮影距離",
      formula: "距離 = 焦点距離 × (被写体高さ / センサー高さ)",
      explanation: [
        "相似三角形により、距離は焦点距離と被写体／センサーサイズ比に比例します。",
        "長い焦点距離は同じ構図で遠くから撮れ、透視を抑えて表情を整えます。",
      ],
      faq: [
        { q: "トリミングは含む？", a: "含みません。センサーが埋まる前提です。後トリミングは長焦点と同等です。" },
        { q: "なぜ 85mm が多い？", a: "圧縮が自然で、適度な距離で画面を埋められるためです。" },
        { q: "クロップ係数は？", a: "実焦点距離（レンズ×クロップ）で正確な距離になります。" },
      ],
    },
    es: {
      steps: ["Introduce la distancia focal y la altura del sensor.", "Introduce la altura del sujeto que quieres encuadrar.", "Lee la distancia de disparo necesaria."],
      explanationTitle: "Distancia de retrato",
      formula: "distancia = focal × (alturaSujeto / alturaSensor)",
      explanation: [
        "Por triángulos semejantes, la distancia escala con la focal y la relación tamaño sujeto a tamaño sensor.",
        "Lentes más largas permiten más distancia con el mismo encuadre y aplanan la perspectiva para retratos favorecedores.",
      ],
      faq: [
        { q: "¿Incluye recorte?", a: "No; asume sensor lleno. Recortar luego equivale a focal más larga." },
        { q: "¿Por qué 85mm para retratos?", a: "Da compresión agradable y distancia cómoda llenando el encuadre." },
        { q: "¿Factor de recorte?", a: "Usa la focal efectiva (lente × recorte) para distancia exacta." },
      ],
    },
  },
  "advanced-dof": {
    en: {
      steps: [
        "Enter focal length, aperture (f-number), focus distance, and circle of confusion.",
        "Choose the camera sensor size to set a sensible CoC default.",
        "Read the near limit, far limit, and total depth of field.",
      ],
      explanationTitle: "Advanced depth of field",
      formula: "DOF = (2 · N · c · d² · (m + 1)) / (f²)  (approx), where m = magnification",
      explanation: [
        "Depth of field is the range in front of and behind the focus point that appears acceptably sharp.",
        "Smaller aperture (higher f-number), shorter focal length, and greater distance all increase depth of field. This calculator uses a more precise model than the simple hyperfocal shortcut.",
      ],
      faq: [
        { q: "Why not just use hyperfocal distance?", a: "Hyperfocal is a quick estimate for landscape; this model gives exact near/far limits at any focus distance." },
        { q: "Does sensor size matter?", a: "Yes; larger sensors need a larger CoC, which changes the DOF for the same aperture and framing." },
        { q: "Is diffraction included?", a: "No; at very small apertures diffraction can reduce sharpness even when DOF is large." },
      ],
    },
    zh: {
      steps: ["输入焦距、光圈（f 值）、对焦距离和弥散圆（CoC）。", "选择相机传感器尺寸以获得合理的 CoC 默认值。", "查看近限、远限和总景深。"],
      explanationTitle: "进阶景深计算",
      formula: "景深 = (2 · N · c · d² · (m + 1)) / (f²)（近似），m 为放大率",
      explanation: [
        "景深是指焦点前后看起来清晰可接受的范围。",
        "更小光圈（更大 f 值）、更短焦距、更远摄距都会增加景深。本计算器比简单超焦距估算更精确。",
      ],
      faq: [
        { q: "为什么不直接用超焦距？", a: "超焦距是风光摄影的快速估算；本模型可在任意对焦距离给出精确的近限/远限。" },
        { q: "传感器尺寸有影响吗？", a: "有；更大传感器需要更大的 CoC，在相同光圈和构图中会改变景深。" },
        { q: "包含衍射吗？", a: "不包含；极小光圈下衍射会降低锐度，即使景深很大。" },
      ],
    },
    zhTW: {
      steps: ["輸入焦距、光圈（f 值）、對焦距離和彌散圓（CoC）。", "選擇相機感測器尺寸以獲得合理的 CoC 預設值。", "查看近限、遠限和總景深。"],
      explanationTitle: "進階景深計算",
      formula: "景深 = (2 · N · c · d² · (m + 1)) / (f²)（近似），m 為放大率",
      explanation: [
        "景深是指焦點前後看起來清晰可接受的範圍。",
        "更小光圈（更大 f 值）、更短焦距、更遠攝距都會增加景深。本計算器比簡單超焦距估算更精確。",
      ],
      faq: [
        { q: "為什麼不直接用超焦距？", a: "超焦距是風光攝影的快速估算；本模型可在任意對焦距離給出精確的近限/遠限。" },
        { q: "感測器尺寸有影響嗎？", a: "有；更大感測器需要更大的 CoC，在相同光圈和構圖中會改變景深。" },
        { q: "包含繞射嗎？", a: "不包含；極小光圈下繞射會降低銳度，即使景深很大。" },
      ],
    },
    de: {
      steps: ["Gib Brennweite, Blende, Fokusabstand und CoC ein.", "Wähle die Sensorgröße für einen sinnvollen CoC-Standard.", "Lies Nahgrenze, Fern Grenze und Gesamt-Schärfentiefe."],
      explanationTitle: "Erweiterte Schärfentiefe",
      formula: "DoF = (2 · N · c · d² · (m + 1)) / (f²)  (ca.), m = Abbildungsmaßstab",
      explanation: [
        "Schärfentiefe ist der Bereich vor und hinter dem Fokus, der noch akzeptabel scharf wirkt.",
        "Kleinere Blende, kürzere Brennweite und größerer Abstand erhöhen die Schärfentiefe. Dieser Rechner nutzt ein genaueres Modell als der Hyperfokal-Kurzweg.",
      ],
      faq: [
        { q: "Warum nicht Hyperfokal?", a: "Hyperfokal ist eine Schätzung für Landschaft; hier gibt es exakte Nah-/Fern-Grenzen." },
        { q: "Einfluss der Sensorgröße?", a: "Ja; größere Sensoren brauchen größeren CoC, was die DoF ändert." },
        { q: "Beachtet Beugung?", a: "Nein; bei sehr kleinen Blenden sinkt die Schärfe durch Beugung." },
      ],
    },
    ja: {
      steps: ["焦点距離・F値・撮影距離・許容錯乱円（CoC）を入力します。", "センサーサイズを選び CoC の既定値を設定します。", "近限界・遠限界・合焦範囲（被写界深度）を確認します。"],
      explanationTitle: "高度な被写界深度",
      formula: "DoF = (2 · N · c · d² · (m + 1)) / (f²)（近似）、m は撮影倍率",
      explanation: [
        "被写界深度とは、ピント点の前後で許容範囲内に写る距離の幅です。",
        "絞りを絞る（F値大）、焦点距離を短く、距離を遠くすると深度は増します。本計算機は超焦距の近似より正確です。",
      ],
      faq: [
        { q: "なぜ超焦距を使わない？", a: "超焦距は風景向けの概算です。本モデルは任意距離で正確な近・遠限界を出します。" },
        { q: "センサーサイズの影響は？", a: "あります。大きいセンサーは大きい CoC を要し、同じ光圈で深度が変わります。" },
        { q: "回折は含む？", a: "含みません。極小絞りでは回折でシャープさが落ちます。" },
      ],
    },
    es: {
      steps: ["Introduce focal, apertura, distancia de enfoque y CoC.", "Elige el tamaño del sensor para un CoC por defecto razonable.", "Lee el límite cercano, lejano y la profundidad total."],
      explanationTitle: "Profundidad de campo avanzada",
      formula: "DoF = (2 · N · c · d² · (m + 1)) / (f²)  (aprox.), m = magnificación",
      explanation: [
        "La profundidad de campo es el rango delante y detrás del foco que parece nítido.",
        "Menor apertura, focal más corta y mayor distancia aumentan la DoF. Este calculador usa un modelo más preciso que el atajo hiperfocal.",
      ],
      faq: [
        { q: "¿Por qué no usar hiperfocal?", a: "Hiperfocal es estimación rápida para paisaje; aquí hay límites exactos a cualquier distancia." },
        { q: "¿Importa el tamaño del sensor?", a: "Sí; sensores grandes necesitan CoC mayor, cambiando la DoF." },
        { q: "¿Incluye difracción?", a: "No; con aperturas muy pequeñas la difracción reduce la nitidez." },
      ],
    },
  },
  "macro-dof": {
    en: {
      steps: [
        "Enter the aperture (f-number) and the magnification ratio of your macro shot.",
        "Enter the circle of confusion for your sensor.",
        "Read the very shallow depth of field typical of close-up work.",
      ],
      explanationTitle: "Macro depth of field",
      formula: "DOF ≈ (2 · N · c · (m + 1)) / m²",
      explanation: [
        "At macro magnifications, depth of field becomes extremely thin and depends strongly on magnification rather than focal length.",
        "Because effective aperture grows to N × (m + 1), stopping down helps far less than you might expect; focus stacking is often the practical solution.",
      ],
      faq: [
        { q: "Why is my macro shot always blurry?", a: "The DoF can be a fraction of a millimeter; tiny focus errors dominate. Use focus stacking." },
        { q: "Does focal length matter in macro?", a: "At a given magnification, focal length barely changes DoF; magnification is what matters." },
        { q: "How do I increase sharpness?", a: "Stack several focused frames, use a stable rig, and light the subject well." },
      ],
    },
    zh: {
      steps: ["输入光圈（f 值）和微距拍摄的放大率。", "输入传感器的弥散圆（CoC）。", "查看近摄特有的极浅景深。"],
      explanationTitle: "微距景深",
      formula: "景深 ≈ (2 · N · c · (m + 1)) / m²",
      explanation: [
        "在微距放大下，景深变得极薄，且主要由放大率而非焦距决定。",
        "由于有效光圈会增大到 N × (m + 1)，收缩光圈的效果远不如预期；焦点堆栈通常是实用解法。",
      ],
      faq: [
        { q: "为什么微距总是发虚？", a: "景深可能只有零点几毫米，极小的对焦误差主导结果，建议用焦点堆栈。" },
        { q: "微距下焦距重要吗？", a: "在给定放大率下，焦距几乎不影响景深；关键是放大率。" },
        { q: "如何提升清晰？", a: "多帧焦点堆栈、稳定支架、良好打光。" },
      ],
    },
    zhTW: {
      steps: ["輸入光圈（f 值）和微距拍攝的放大率。", "輸入感測器的彌散圓（CoC）。", "查看近攝特有的極淺景深。"],
      explanationTitle: "微距景深",
      formula: "景深 ≈ (2 · N · c · (m + 1)) / m²",
      explanation: [
        "在微距放大下，景深變得極薄，且主要由放大率而非焦距決定。",
        "由於有效光圈會增大到 N × (m + 1)，收縮光圈的效果遠不如預期；焦點堆疊通常是實用解法。",
      ],
      faq: [
        { q: "為什麼微距總是發虛？", a: "景深可能只有零點幾毫米，極小的對焦誤差主導結果，建議用焦點堆疊。" },
        { q: "微距下焦距重要嗎？", a: "在給定放大率下，焦距幾乎不影響景深；關鍵是放大率。" },
        { q: "如何提升清晰？", a: "多幀焦點堆疊、穩定支架、良好打光。" },
      ],
    },
    de: {
      steps: ["Gib Blende und Abbildungsmaßstab der Makroaufnahme ein.", "Gib den CoC deines Sensors ein.", "Lies die sehr geringe Schärfentiefe der Nahaufnahme."],
      explanationTitle: "Makro-Schärfentiefe",
      formula: "DoF ≈ (2 · N · c · (m + 1)) / m²",
      explanation: [
        "Bei Makro-Abbildung wird die Schärfentiefe extrem dünn und hängt stark vom Abbildungsmaßstab ab, nicht von der Brennweite.",
        "Da die effektive Blende auf N × (m + 1) wächst, bringt Abblenden weniger als erwartet; Fokus-Stacking ist oft die Lösung.",
      ],
      faq: [
        { q: "Warum ist Makro oft unscharf?", a: "DoF kann Bruchteile eines Millimeters sein; Fokus-Stacking hilft." },
        { q: "Brennweite wichtig im Makro?", a: "Bei gleichem Maßstab kaum; der Maßstab entscheidet." },
        { q: "Schärfe erhöhen?", a: "Mehrere Fokusebenen stapeln, stabil montieren, gut ausleuchten." },
      ],
    },
    ja: {
      steps: ["絞り（F値）とマクロ撮影の撮影倍率を入力します。", "センサーの許容錯乱円（CoC）を入力します。", "接写特有の極浅い被写界深度を確認します。"],
      explanationTitle: "マクロの被写界深度",
      formula: "DoF ≈ (2 · N · c · (m + 1)) / m²",
      explanation: [
        "マクロでは深度が極めて薄く、焦点距離よりも撮影倍率に強く依存します。",
        "有効絞りが N × (m + 1) に大きくなるため、絞り込みの効果は予想より小さく、フォーカススタックが実用的です。",
      ],
      faq: [
        { q: "なぜマクロはいつもボケる？", a: "深度は数ミリ以下になり、わずかなピンズレが決定的です。スタックを使ってください。" },
        { q: "マクロで焦距離は重要？", a: "同じ倍率なら焦距離はほぼ影響せず、倍率が重要です。" },
        { q: "シャープにするには？", a: "複数のピント層をスタック、安定架台、十分な光。" },
      ],
    },
    es: {
      steps: ["Introduce apertura y la relación de ampliación macro.", "Introduce el círculo de confusión de tu sensor.", "Lee la profundidad de campo muy reducida del primer plano."],
      explanationTitle: "Profundidad de campo macro",
      formula: "DoF ≈ (2 · N · c · (m + 1)) / m²",
      explanation: [
        "En macro la profundidad se vuelve extremadamente fina y depende de la ampliación, no de la focal.",
        "Como la apertura efectiva crece a N × (m + 1), cerrar poco ayuda; el apilado de enfoque suele ser la solución.",
      ],
      faq: [
        { q: "¿Por qué mi macro sale borroso?", a: "La DoF puede ser fracción de mm; el apilado de enfoque ayuda." },
        { q: "¿Importa la focal en macro?", a: "A igual ampliación, apenas; la ampliación es lo que cuenta." },
        { q: "¿Cómo ganar nitidez?", a: "Apila varios fotogramas enfocados, usa trípode y buena luz." },
      ],
    },
  },
  "dof-table": {
    en: {
      steps: [
        "Pick the focal length and aperture you plan to use.",
        "Pick the focus distance for your scene.",
        "Read the near limit, far limit, and total depth of field from the table.",
      ],
      explanationTitle: "Reading a depth-of-field table",
      formula: "Uses the same model as advanced DOF; values are precomputed per focal/aperture/distance cell.",
      explanation: [
        "A DOF table lists sharp-range limits so you can plan focus without a calculator in the field.",
        "Tables are sensor-size specific; use the one matching your camera, or set the circle of confusion accordingly.",
      ],
      faq: [
        { q: "Why use a table instead of the calculator?", a: "Tables are fast for common settings and great for planning before a shoot." },
        { q: "Are tables accurate?", a: "They are as accurate as the underlying model; just match the sensor size." },
        { q: "How do I read near/far limits?", a: "The near limit is the closest sharp distance; the far limit is the farthest sharp distance." },
      ],
    },
    zh: {
      steps: ["选择你计划使用的焦距和光圈。", "选择场景的对焦距离。", "从表中读取近限、远限和总景深。"],
      explanationTitle: "如何阅读景深表",
      formula: "采用与进阶景深相同的模型；按焦距/光圈/距离逐格预计算。",
      explanation: [
        "景深表列出清晰范围，便于在外拍前规划对焦而无需计算器。",
        "表格因传感器尺寸而异，请使用与相机匹配的表，或相应设置弥散圆。",
      ],
      faq: [
        { q: "为什么用表而不用计算器？", a: "表对常用设置更快，适合拍摄前规划。" },
        { q: "表准确吗？", a: "与底层模型一样准确，只要匹配传感器尺寸即可。" },
        { q: "近限/远限怎么读？", a: "近限是最清晰的近端距离，远限是最清晰的远端距离。" },
      ],
    },
    zhTW: {
      steps: ["選擇你計畫使用的焦距和光圈。", "選擇場景的對焦距離。", "從表中讀取近限、遠限和總景深。"],
      explanationTitle: "如何閱讀景深表",
      formula: "採用與進階景深相同的模型；按焦距/光圈/距離逐格預計算。",
      explanation: [
        "景深表列出清晰範圍，便於在外拍前規劃對焦而無需計算器。",
        "表格因感測器尺寸而異，請使用與相機匹配的表，或相應設定彌散圓。",
      ],
      faq: [
        { q: "為什麼用表而不用計算器？", a: "表對常用設置更快，適合拍攝前規劃。" },
        { q: "表準確嗎？", a: "與底層模型一樣準確，只要匹配感測器尺寸即可。" },
        { q: "近限/遠限怎麼讀？", a: "近限是最清晰的近端距離，遠限是最清晰的遠端距離。" },
      ],
    },
    de: {
      steps: ["Wähle Brennweite und Blende.", "Wähle den Fokusabstand deiner Szene.", "Lies Nah-, Fern-Grenze und DoF aus der Tabelle."],
      explanationTitle: "Eine Schärfentiefe-Tabelle lesen",
      formula: "Nutzt dasselbe Modell wie erweiterte DoF; Werte sind je Zelle vorberechnet.",
      explanation: [
        "Eine DoF-Tabelle listet scharfe Bereiche, damit du im Feld ohne Rechner planen kannst.",
        "Tabellen sind sensorabhängig; nimm die passende oder setze den CoC entsprechend.",
      ],
      faq: [
        { q: "Tabelle statt Rechner?", a: "Tabellen sind schnell für übliche Settings und gut zur Planung." },
        { q: "Sind Tabellen genau?", a: "So genau wie das Modell; nur Sensor anpassen." },
        { q: "Nah/Fern-Grenze lesen?", a: "Nahgrenze = nächster scharfer Abstand; Ferngrenze = fernster scharfer Abstand." },
      ],
    },
    ja: {
      steps: ["使用する焦点距離と絞りを選びます。", "シーンの撮影距離を選びます。", "表から近限界・遠限界・合焦範囲を確認します。"],
      explanationTitle: "被写界深度表の読み方",
      formula: "進階 DoF と同じモデル；焦距離/絞り/距離ごとに事前計算。",
      explanation: [
        "深度表はシャープな範囲を一覧でき、フィールドで計算機なしに計画できます。",
        "表はセンサーサイズ固有です。カメラに合う表か、CoC を合わせてください。",
      ],
      faq: [
        { q: "表より計算機？", a: "表は定番設定で早く、撮影前の計画に最適です。" },
        { q: "表は正確？", a: "モデルと同精度。センサーを合わせるだけ。" },
        { q: "近・遠限界の読み方？", a: "近限界は最も近いシャープ距離、遠限界は最も遠いシャープ距離。" },
      ],
    },
    es: {
      steps: ["Elige focal y apertura.", "Elige la distancia de enfoque de tu escena.", "Lee límite cercano, lejano y DoF en la tabla."],
      explanationTitle: "Leer una tabla de profundidad de campo",
      formula: "Usa el mismo modelo que DoF avanzada; valores precalculados por celda.",
      explanation: [
        "Una tabla de DoF lista los rangos nítidos para planear el enfoque sin calculadora.",
        "Las tablas son específicas del sensor; usa la de tu cámara o ajusta el CoC.",
      ],
      faq: [
        { q: "¿Tabla en vez de calculadora?", a: "Las tablas son rápidas para ajustes comunes y útiles al planear." },
        { q: "¿Son precisas?", a: "Tan precisas como el modelo; solo empareja el sensor." },
        { q: "¿Cómo leer límites?", a: "Cercano = distancia nítida más próxima; lejano = más lejana." },
      ],
    },
  },
  "circle-of-confusion": {
    en: {
      steps: [
        "Enter the viewing distance and the displayed image size.",
        "Enter the visual acuity (resolvable angle, often 1/1500 to 1/2000).",
        "Read the circle of confusion diameter used for depth-of-field math.",
      ],
      explanationTitle: "Circle of confusion explained",
      formula: "c = viewingDistance × tan(resolvableAngle)  (scaled to sensor)",
      explanation: [
        "The circle of confusion is the largest blurred spot that still looks like a point to the viewer.",
        "It depends on how large the image is shown and how close the viewer sits; bigger prints viewed up close need a smaller CoC.",
      ],
      faq: [
        { q: "What CoC should I use?", a: "Common defaults: 0.03 mm (full frame), 0.02 mm (APS-C), 0.015 mm (Micro 4/3)." },
        { q: "Does print size change CoC?", a: "Yes; large prints viewed closely demand a smaller CoC for the same perceived sharpness." },
        { q: "Is CoC a physical spot on the sensor?", a: "It is a derived tolerance, not a literal sensor feature; it drives the DoF formulas." },
      ],
    },
    zh: {
      steps: ["输入观看距离和显示图像尺寸。", "输入视觉 acuity（可分辨角度，通常 1/1500 ~ 1/2000）。", "读取用于景深计算的弥散圆直径。"],
      explanationTitle: "弥散圆（CoC）详解",
      formula: "c = 观看距离 × tan(可分辨角度)（折算到传感器）",
      explanation: [
        "弥散圆是观看者仍视为一个点的、最大的模糊圆斑直径。",
        "它取决于图像显示尺寸和观看距离：放大的照片凑近看需要更小的 CoC。",
      ],
      faq: [
        { q: "CoC 该取多少？", a: "常用默认：全画幅 0.03mm、APS-C 0.02mm、M4/3 0.015mm。" },
        { q: "输出尺寸会影响 CoC 吗？", a: "会；大图近距离观看需要更小的 CoC 才能保持相同清晰感。" },
        { q: "CoC 是传感器上的实体斑吗？", a: "它是推导出的容差，并非传感器实体特征，用于驱动景深公式。" },
      ],
    },
    zhTW: {
      steps: ["輸入觀看距離和顯示圖像尺寸。", "輸入視覺 acuity（可分辨角度，通常 1/1500 ~ 1/2000）。", "讀取用於景深計算的彌散圓直徑。"],
      explanationTitle: "彌散圓（CoC）詳解",
      formula: "c = 觀看距離 × tan(可分辨角度)（折算到感測器）",
      explanation: [
        "彌散圓是觀看者仍視為一個點的、最大的模糊圓斑直徑。",
        "它取決於圖像顯示尺寸和觀看距離：放大的照片湊近看需要更小的 CoC。",
      ],
      faq: [
        { q: "CoC 該取多少？", a: "常用預設：全幅 0.03mm、APS-C 0.02mm、M4/3 0.015mm。" },
        { q: "輸出尺寸會影響 CoC 嗎？", a: "會；大圖近距觀看需要更小的 CoC 才能保持相同清晰感。" },
        { q: "CoC 是感測器上的實體斑嗎？", a: "它是推導出的容差，並非感測器實體特徵，用於驅動景深公式。" },
      ],
    },
    de: {
      steps: ["Gib Betrachtungsabstand und Bildgröße ein.", "Gib die Sehschärfe (auflösbarer Winkel) ein.", "Lies den CoC-Durchmesser für die DoF-Rechnung."],
      explanationTitle: "Kreis der Verwirrung erklärt",
      formula: "c = betrachtAbstand × tan(auflösWinkel)  (auf Sensor skaliert)",
      explanation: [
        "Der CoC ist der größte Unschärfefleck, der noch wie ein Punkt wirkt.",
        "Er hängt von Bildgröße und Abstand ab; große, nah betrachtete Prints brauchen kleineren CoC.",
      ],
      faq: [
        { q: "Welchen CoC nutzen?", a: "Üblich: 0,03 mm (Vollformat), 0,02 mm (APS-C), 0,015 mm (MFT)." },
        { q: "Ändert Druckgröße den CoC?", a: "Ja; große, nah gesehene Drucke brauchen kleineren CoC." },
        { q: "Ist CoC ein physischer Fleck?", a: "Nein, eine abgeleitete Toleranz, die die DoF-Formeln speist." },
      ],
    },
    ja: {
      steps: ["鑑賞距離と表示画像サイズを入力します。", "視力（分解角、通常 1/1500〜1/2000）を入力します。", "被写界深度計算に使う許容錯乱円直径を確認します。"],
      explanationTitle: "許容錯乱円（CoC）とは",
      formula: "c = 鑑賞距離 × tan(分解角)（センサー換算）",
      explanation: [
        "許容錯乱円とは、見る人がまだ点と感じる最大のぼけ円の直径です。",
        "表示サイズと鑑賞距離に依存します。大きく近く見るプリントほど小さい CoC が必要です。",
      ],
      faq: [
        { q: "CoC はいくつ？", a: "目安：フルサイズ 0.03mm、APS-C 0.02mm、M4/3 0.015mm。" },
        { q: "プリントサイズの影響？", a: "あります。大きく近く見るほど小さい CoC が必要です。" },
        { q: "CoC はセンサーの実体？", a: "いいえ、導出された許容値で、DoF 式の材料です。" },
      ],
    },
    es: {
      steps: ["Introduce distancia de visión y tamaño de imagen.", "Introduce la agudeza visual (ángulo resoluble).", "Lee el diámetro del círculo de confusión para la DoF."],
      explanationTitle: "Círculo de confusión explicado",
      formula: "c = distVisión × tan(ánguloResoluble)  (escalado al sensor)",
      explanation: [
        "El círculo de confusión es la mancha borrosa más grande que aún parece un punto.",
        "Depende del tamaño mostrado y la distancia; impresiones grandes vistas de cerca necesitan CoC menor.",
      ],
      faq: [
        { q: "¿Qué CoC uso?", a: "Común: 0,03 mm (full frame), 0,02 mm (APS-C), 0,015 mm (M4/3)." },
        { q: "¿El tamaño de impresión cambia CoC?", a: "Sí; impresiones grandes de cerca exigen CoC menor." },
        { q: "¿Es CoC un punto físico?", a: "Es una tolerancia derivada que alimenta las fórmulas DoF." },
      ],
    },
  },
  "light-ev": {
    en: {
      steps: [
        "Enter aperture (f-number), shutter speed, and ISO.",
        "Read the resulting EV at the chosen ISO.",
        "Compare with the target EV for your lighting to pick exposure settings.",
      ],
      explanationTitle: "Exposure value (EV)",
      formula: "EV = log2(N² / t);  EV100 = EV − log2(S / 100)",
      explanation: [
        "Exposure value is a single number that combines aperture and shutter speed; each +1 EV doubles the light.",
        "EV at ISO 100 (EV100) is the standard reference used by light meters and camera apps.",
      ],
      faq: [
        { q: "What does +1 EV do?", a: "It doubles the exposure; −1 EV halves it. Cameras show this as exposure compensation." },
        { q: "Why ISO 100 reference?", a: "EV100 normalizes all readings to a common sensitivity for easy comparison." },
        { q: "Can I compute shutter from EV?", a: "Yes; for a fixed aperture and ISO, t = N² / 2^EV." },
      ],
    },
    zh: {
      steps: ["输入光圈（f 值）、快门速度和 ISO。", "读取在所选 ISO 下的 EV。", "与目标光照 EV 比较，选择曝光参数。"],
      explanationTitle: "曝光值（EV）",
      formula: "EV = log2(N² / t)；EV100 = EV − log2(S / 100)",
      explanation: [
        "曝光值用一个数字综合表示光圈与快门；EV 每增加 1 曝光量翻倍。",
        "ISO 100 下的 EV（EV100）是测光表和相机 App 使用的标准参考。",
      ],
      faq: [
        { q: "+1 EV 会怎样？", a: "曝光翻倍；−1 EV 减半。相机以曝光补偿显示。" },
        { q: "为什么以 ISO 100 为参考？", a: "EV100 把所有读数归一化到同一感光度，便于比较。" },
        { q: "能用 EV 反算快门吗？", a: "可以；固定光圈和 ISO 时，t = N² / 2^EV。" },
      ],
    },
    zhTW: {
      steps: ["輸入光圈（f 值）、快門速度和 ISO。", "讀取在所選 ISO 下的 EV。", "與目標光照 EV 比較，選擇曝光參數。"],
      explanationTitle: "曝光值（EV）",
      formula: "EV = log2(N² / t)；EV100 = EV − log2(S / 100)",
      explanation: [
        "曝光值用一個數字綜合表示光圈與快門；EV 每增加 1 曝光量翻倍。",
        "ISO 100 下的 EV（EV100）是測光表和相機 App 使用的標準參考。",
      ],
      faq: [
        { q: "+1 EV 會怎樣？", a: "曝光翻倍；−1 EV 減半。相機以曝光補償顯示。" },
        { q: "為什麼以 ISO 100 為參考？", a: "EV100 把所有讀數歸一化到同一感光度，便於比較。" },
        { q: "能用 EV 反算快門嗎？", a: "可以；固定光圈和 ISO 時，t = N² / 2^EV。" },
      ],
    },
    de: {
      steps: ["Gib Blende, Verschlusszeit und ISO ein.", "Lies den EV bei gewähltem ISO.", "Vergleiche mit Ziel-EV für dein Licht."],
      explanationTitle: "Belichtungswert (EV)",
      formula: "EV = log2(N² / t);  EV100 = EV − log2(S / 100)",
      explanation: [
        "Der Belichtungswert bündelt Blende und Zeit in einer Zahl; +1 EV verdoppelt das Licht.",
        "EV bei ISO 100 (EV100) ist der Standardbezug von Belichtungsmessern.",
      ],
      faq: [
        { q: "Was macht +1 EV?", a: "Verdoppelt die Belichtung; −1 EV halbiert sie." },
        { q: "Warum ISO 100?", a: "EV100 normiert alle Werte auf gleiche Empfindlichkeit." },
        { q: "Zeit aus EV?", a: "Ja; bei fester Blende/ISO: t = N² / 2^EV." },
      ],
    },
    ja: {
      steps: ["絞り（F値）・シャッター速度・ISO を入力します。", "選んだ ISO での EV を確認します。", "目標 EV と比較し露出を決めます。"],
      explanationTitle: "露出値（EV）",
      formula: "EV = log2(N² / t)；EV100 = EV − log2(S / 100)",
      explanation: [
        "露出値は絞りとシャッターを一つの数値にまとめ、+1 EV で光量が倍になります。",
        "ISO 100 基準の EV100 は露出計やカメラアプリの標準です。",
      ],
      faq: [
        { q: "+1 EV は？", a: "露出が倍、−1 EV は半分になります（露出補正）。" },
        { q: "なぜ ISO 100 基準？", a: "EV100 で全てを同じ感度に正規化し比較しやすくします。" },
        { q: "EV からシャッターを？", a: "はい。絞りと ISO 固定で t = N² / 2^EV。" },
      ],
    },
    es: {
      steps: ["Introduce apertura, velocidad y ISO.", "Lee el EV en el ISO elegido.", "Compara con el EV objetivo de tu luz."],
      explanationTitle: "Valor de exposición (EV)",
      formula: "EV = log2(N² / t);  EV100 = EV − log2(S / 100)",
      explanation: [
        "El valor de exposición combina apertura y tiempo en un número; +1 EV duplica la luz.",
        "El EV a ISO 100 (EV100) es la referencia estándar de los fotómetros.",
      ],
      faq: [
        { q: "¿Qué hace +1 EV?", a: "Duplica la exposición; −1 EV la reduce a la mitad." },
        { q: "¿Por qué ISO 100?", a: "EV100 normaliza todas las lecturas a igual sensibilidad." },
        { q: "¿Tiempo desde EV?", a: "Sí; con apertura e ISO fijos: t = N² / 2^EV." },
      ],
    },
  },
  "sun-position": {
    en: {
      steps: [
        "Enter your latitude, longitude, date, and local time.",
        "Read the sun's altitude and azimuth for that moment.",
        "Use the angles to plan golden hour, shadows, or solar alignment shots.",
      ],
      explanationTitle: "Sun position: altitude and azimuth",
      formula: "sin(alt) = sin(lat)·sin(dec) + cos(lat)·cos(dec)·cos(hourAngle)",
      explanation: [
        "Solar position depends on your location, the day of year (declination), and the time (hour angle).",
        "Altitude is the height above the horizon; azimuth is the compass direction the sun faces.",
      ],
      faq: [
        { q: "What is solar declination?", a: "It is the sun's latitude on the celestial sphere, varying from −23.4° to +23.4° over the year." },
        { q: "How accurate is this?", a: "Good to about a degree for planning; atmospheric refraction near horizon is not modeled." },
        { q: "Why plan with azimuth?", a: "Azimuth lets you predict where the sun will be for alignments and shadow direction." },
      ],
    },
    zh: {
      steps: ["输入纬度、经度、日期和本地时间。", "读取该时刻太阳的高度角和方位角。", "用角度规划黄金时刻、阴影或太阳对齐拍摄。"],
      explanationTitle: "太阳位置：高度角与方位角",
      formula: "sin(高度角) = sin(纬度)·sin(赤纬) + cos(纬度)·cos(赤纬)·cos(时角)",
      explanation: [
        "太阳位置取决于地点、一年中的日期（赤纬）和时间（时角）。",
        "高度角是太阳高出地平线的角度；方位角是太阳所朝的罗盘方向。",
      ],
      faq: [
        { q: "什么是太阳赤纬？", a: "它是太阳在天球上的纬度，一年内从 −23.4° 到 +23.4° 变化。" },
        { q: "精度如何？", a: "规划用约 1° 误差；地平线附近的蒙气差未建模。" },
        { q: "为什么用方位角规划？", a: "方位角可预测太阳位置，用于对齐拍摄和阴影方向。" },
      ],
    },
    zhTW: {
      steps: ["輸入緯度、經度、日期和本地時間。", "讀取該時刻太陽的高度角和方位角。", "用角度規劃黃金時刻、陰影或太陽對齊拍攝。"],
      explanationTitle: "太陽位置：高度角與方位角",
      formula: "sin(高度角) = sin(緯度)·sin(赤緯) + cos(緯度)·cos(赤緯)·cos(時角)",
      explanation: [
        "太陽位置取決於地點、一年中的日期（赤緯）和時間（時角）。",
        "高度角是太陽高出地平線的角度；方位角是太陽所朝的羅盤方向。",
      ],
      faq: [
        { q: "什麼是太陽赤緯？", a: "它是太陽在天球上的緯度，一年內從 −23.4° 到 +23.4° 變化。" },
        { q: "精度如何？", a: "規劃用約 1° 誤差；地平線附近的蒙氣差未建模。" },
        { q: "為什麼用方位角規劃？", a: "方位角可預測太陽位置，用於對齊拍攝和陰影方向。" },
      ],
    },
    de: {
      steps: ["Gib Breite, Länge, Datum und Ortszeit ein.", "Lies Höhe und Azimut der Sonne.", "Nutze die Winkel für Golden Hour, Schatten oder Ausrichtung."],
      explanationTitle: "Sonnenstand: Höhe und Azimut",
      formula: "sin(höhe) = sin(breite)·sin(dekl) + cos(breite)·cos(dekl)·cos(stundenwinkel)",
      explanation: [
        "Die Sonnenposition hängt von Ort, Jahreszeit (Deklination) und Zeit (Stundenwinkel) ab.",
        "Höhe ist der Winkel über dem Horizont; Azimut die Himmelsrichtung der Sonne.",
      ],
      faq: [
        { q: "Was ist Deklination?", a: "Die 'Breite' der Sonne am Himmel, −23,4° bis +23,4° im Jahr." },
        { q: "Wie genau?", a: "Für Planung ~1°; Refraktion am Horizont nicht modelliert." },
        { q: "Warum Azimut nutzen?", a: "Azimut sagt voraus, wo die Sonne für Ausrichtungen steht." },
      ],
    },
    ja: {
      steps: ["緯度・経度・日付・現地時刻を入力します。", "その瞬間の太陽の高度と方位を確認します。", "角度でゴールデンアワー・影・太陽アライメントを計画します。"],
      explanationTitle: "太陽位置：高度と方位",
      formula: "sin(高度) = sin(緯度)·sin(赤緯) + cos(緯度)·cos(赤緯)·cos(時角)",
      explanation: [
        "太陽位置は場所・日付（赤緯）・時刻（時角）に依存します。",
        "高度は地平線からの角度、方位は太陽の方角です。",
      ],
      faq: [
        { q: "赤緯とは？", a: "天球上の太陽の緯度で、年間 −23.4°〜+23.4° を変化します。" },
        { q: "精度は？", a: "計画用に約 1°。地平線近くの屈折は未考慮。" },
        { q: "なぜ方位で計画？", a: "方位で太陽の位置を予測し、アライメントや影の向きに使えます。" },
      ],
    },
    es: {
      steps: ["Introduce latitud, longitud, fecha y hora local.", "Lee altura y acimut del sol.", "Usa los ángulos para golden hour, sombras o alineaciones."],
      explanationTitle: "Posición solar: altura y acimut",
      formula: "sin(alt) = sin(lat)·sin(dec) + cos(lat)·cos(dec)·cos(horaAng)",
      explanation: [
        "La posición solar depende de lugar, fecha (declinación) y hora (ángulo horario).",
        "Altura es el ángulo sobre el horizonte; acimut la dirección de la brújula.",
      ],
      faq: [
        { q: "¿Qué es declinación?", a: "Es la 'latitud' del sol en el cielo, de −23,4° a +23,4° al año." },
        { q: "¿Qué precisión?", a: "Para planear ~1°; refracción cerca del horizonte no se modela." },
        { q: "¿Por qué acimut?", a: "Predice dónde estará el sol para alineaciones y sombras." },
      ],
    },
  },
  "star-trails": {
    en: {
      steps: [
        "Enter your lens focal length and the camera crop factor.",
        "Read the maximum exposure before stars smear into trails.",
        "Use a shorter exposure, or embrace trails for creative long-exposure art.",
      ],
      explanationTitle: "Star trail exposure limit",
      formula: "t_max = 500 / (focal_mm × cropFactor)  (seconds)",
      explanation: [
        "The 500-rule estimates the longest shutter time before Earth's rotation turns stars into streaks.",
        "It is a rule of thumb; sensors with more megapixels show trails sooner, so some prefer the 300-rule for large prints.",
      ],
      faq: [
        { q: "Why divide by crop factor?", a: "Crop sensors magnify the apparent motion, so the effective focal length is longer." },
        { q: "Is 500 or 300 better?", a: "300 is stricter and safer for high-res sensors and big prints." },
        { q: "Can I get round stars with long exposures?", a: "Yes, use an equatorial tracker; otherwise trails are the creative choice." },
      ],
    },
    zh: {
      steps: ["输入镜头焦距和相机裁切系数。", "读取星星拖成轨迹前的最长曝光时间。", "用更短曝光，或刻意制造轨迹做长曝创意。"],
      explanationTitle: "星轨曝光上限",
      formula: "t_max = 500 / (焦距mm × 裁切系数)（秒）",
      explanation: [
        "500 法则是估算地球自转使星星拉成条纹前最长快门时间的经验公式。",
        "它是经验值；高像素传感器会更早出现轨迹，有人对大图改用 300 法则。",
      ],
      faq: [
        { q: "为什么要除以裁切系数？", a: "截幅传感器放大了视运动，等效焦距更长。" },
        { q: "500 还是 300 好？", a: "300 更严格，对高像素和大图更安全。" },
        { q: "长曝还能拍圆点星吗？", a: "可以，用赤道仪跟踪；否则轨迹就是创意选择。" },
      ],
    },
    zhTW: {
      steps: ["輸入鏡頭焦距和相機裁切係數。", "讀取星星拖成軌跡前的最長曝光時間。", "用更短曝光，或刻意製造軌跡做長曝創意。"],
      explanationTitle: "星軌曝光上限",
      formula: "t_max = 500 / (焦距mm × 裁切係數)（秒）",
      explanation: [
        "500 法則是估算地球自轉使星星拉成條紋前最長快門時間的經驗公式。",
        "它是經驗值；高畫素感測器會更早出現軌跡，有人對大圖改用 300 法則。",
      ],
      faq: [
        { q: "為什麼要除以裁切係數？", a: "截幅感測器放大了視運動，等效焦距更長。" },
        { q: "500 還是 300 好？", a: "300 更嚴格，對高畫素和大圖更安全。" },
        { q: "長曝還能拍圓點星嗎？", a: "可以，用赤道儀跟蹤；否則軌跡就是創意選擇。" },
      ],
    },
    de: {
      steps: ["Gib Brennweite und Crop-Faktor ein.", "Lies die max. Belichtung vor Sternstreifen.", "Kürzere Zeit nutzen oder Streifen künstlerisch nutzen."],
      explanationTitle: "Grenze für Sternstreifen",
      formula: "t_max = 500 / (brennweite_mm × cropFaktor)  (s)",
      explanation: [
        "Die 500-Regel schätzt die längste Zeit, bevor Sterne durch Erdrotation streifen.",
        "Eine Faustregel; hochauflösende Sensoren zeigen Streifen früher, manche nutzen 300.",
      ],
      faq: [
        { q: "Warum durch Crop teilen?", a: "Crop-Sensoren verstärken die scheinbare Bewegung." },
        { q: "500 oder 300?", a: "300 ist strenger und sicherer für hochauflösende Sensoren." },
        { q: "Runde Sterne bei Langzeit?", a: "Ja, mit Äquatorialmontierung; sonst sind Streifen kreativ." },
      ],
    },
    ja: {
      steps: ["レンズ焦点距離とクロップ係数を入力します。", "星が流れる前の最長露光を確認します。", "短い露光にするか、意図的に軌跡を長曝アートに。"],
      explanationTitle: "星の軌跡（スタートレイル）限界",
      formula: "t_max = 500 / (焦距離mm × クロップ係数)（秒）",
      explanation: [
        "500 の法則は、地球の自転で星が流れる前の最長シャッターの目安です。",
        "経験則です。高画素センサーは早く流れるため、大プリントでは 300 の法則を好む人も。" ],
      faq: [
        { q: "なぜクロップで割る？", a: "クロップ機は見かけの動きを増幅するためです。" },
        { q: "500 か 300 か？", a: "300 の方が厳しく、高画素・大プリントに安全です。" },
        { q: "長曝で点星に？", a: "はい、赤道儀で追尾すれば可。でなければ軌跡が創意です。" },
      ],
    },
    es: {
      steps: ["Introduce focal y factor de recorte.", "Lee la exposición máxima antes de rastros.", "Usa tiempo más corto o usa rastros como arte."],
      explanationTitle: "Límite de rastros estelares",
      formula: "t_max = 500 / (focal_mm × recorte)  (s)",
      explanation: [
        "La regla 500 estima el tiempo máximo antes de que la rotación vuelva estrellas en rayas.",
        "Es una regla práctica; sensores de más MP muestran rastros antes, algunos usan 300.",
      ],
      faq: [
        { q: "¿Por qué dividir por recorte?", a: "Los sensores recortados amplifican el movimiento aparente." },
        { q: "¿500 o 300?", a: "300 es más estricto y seguro para sensores de alta resolución." },
        { q: "¿Estrellas puntuales en larga?", a: "Sí, con montura ecuatorial; si no, los rastros son creativos." },
      ],
    },
  },
  "spot-stars": {
    en: {
      steps: [
        "Enter focal length, aperture, and pixel pitch of your sensor.",
        "Read the maximum exposure for pinpoint (non-trailed) stars.",
        "Set your shutter at or below this to keep stars sharp.",
      ],
      explanationTitle: "NPF rule for pinpoint stars",
      formula: "t = (35 × aperture + 30 × pixelPitch[µm]) / focalLength[mm]  (seconds)",
      explanation: [
        "The NPF rule refines the 500-rule by accounting for aperture and sensor pixel size, not just focal length.",
        "It usually gives a shorter, safer exposure than 500-rule, especially on high-resolution cameras.",
      ],
      faq: [
        { q: "NPF vs 500-rule?", a: "NPF is more accurate because it includes aperture and pixel pitch." },
        { q: "What is pixel pitch?", a: "The physical width of one pixel on the sensor, in microns; smaller pixels demand shorter exposures." },
        { q: "Should I still use a tracker?", a: "For deep-sky, yes; NPF only avoids visible trails, it does not track the sky." },
      ],
    },
    zh: {
      steps: ["输入焦距、光圈和传感器像素间距。", "读取点状星（无拖尾）的最长曝光。", "把快门设在该值或以下以保持星点清晰。"],
      explanationTitle: "NPF 法则（点状星）",
      formula: "t = (35 × 光圈 + 30 × 像素间距[µm]) / 焦距[mm]（秒）",
      explanation: [
        "NPF 法则在 500 法则基础上加入光圈与传感器像素尺寸，比只看焦距更精确。",
        "通常比 500 法则给出更短、更安全的曝光，尤其在高像素相机上。",
      ],
      faq: [
        { q: "NPF 与 500 法则？", a: "NPF 更准确，因为它纳入了光圈和像素间距。" },
        { q: "什么是像素间距？", a: "单个像素的物理宽度（微米）；像素越小所需曝光越短。" },
        { q: "还需要跟踪吗？", a: "深空摄影仍需要；NPF 只避免可见拖尾，不跟踪天空。" },
      ],
    },
    zhTW: {
      steps: ["輸入焦距、光圈和感測器像素間距。", "讀取點狀星（無拖尾）的最長曝光。", "把快門設在該值或以下以保持星點清晰。"],
      explanationTitle: "NPF 法則（點狀星）",
      formula: "t = (35 × 光圈 + 30 × 像素間距[µm]) / 焦距[mm]（秒）",
      explanation: [
        "NPF 法則在 500 法則基礎上加入光圈與感測器像素尺寸，比只看焦距更精確。",
        "通常比 500 法則給出更短、更安全的曝光，尤其在高畫素相機上。",
      ],
      faq: [
        { q: "NPF 與 500 法則？", a: "NPF 更準確，因為它納入了光圈和像素間距。" },
        { q: "什麼是像素間距？", a: "單一像素的物理寬度（微米）；像素越小所需曝光越短。" },
        { q: "還需要跟蹤嗎？", a: "深空攝影仍需要；NPF 只避免可見拖尾，不跟蹤天空。" },
      ],
    },
    de: {
      steps: ["Gib Brennweite, Blende und Pixelabstand ein.", "Lies max. Zeit für punktförmige Sterne.", "Setze Verschluss auf oder unter diesem Wert."],
      explanationTitle: "NPF-Regel für Punktsterne",
      formula: "t = (35 × blende + 30 × pixelAbstand[µm]) / brennweite[mm]  (s)",
      explanation: [
        "Die NPF-Regel verfeinert die 500-Regel um Blende und Pixelgröße, nicht nur Brennweite.",
        "Sie liefert meist kürzere, sicherere Zeiten, besonders bei hochauflösenden Kameras.",
      ],
      faq: [
        { q: "NPF vs 500?", a: "NPF ist genauer, da Blende und Pixelabstand einfließen." },
        { q: "Was ist Pixelabstand?", a: "Physikalische Pixelbreite in µm; kleinere Pixel brauchen kürzere Zeiten." },
        { q: "Trotzdem Tracker?", a: "Für Deep-Sky ja; NPF vermeidet nur sichtbare Streifen." },
      ],
    },
    ja: {
      steps: ["焦点距離・絞り・センサーの画素ピッチを入力します。", "点状の星（流れない）の最長露光を確認します。", "シャッターをその値以下に設定し星を锐く保ちます。"],
      explanationTitle: "点星用 NPF の法則",
      formula: "t = (35 × 絞り + 30 × 画素ピッチ[µm]) / 焦点距離[mm]（秒）",
      explanation: [
        "NPF の法則は 500 の法則に絞りと画素サイズを加え、焦距離だけでなく精度を上げます。",
        "通常 500 より短く安全な露光になり、高画素機で特に有効です。",
      ],
      faq: [
        { q: "NPF と 500？", a: "NPF は絞りと画素ピッチを含むため正確です。" },
        { q: "画素ピッチとは？", a: "画素の物理幅（μm）。小さいほど短い露光が必要。" },
        { q: "追尾は必要？", a: "深宇宙は必要。NPF は流れを防ぐだけで追尾しません。" },
      ],
    },
    es: {
      steps: ["Introduce focal, apertura y paso de píxel.", "Lee el tiempo máximo para estrellas puntuales.", "Ajusta el obturador a ese valor o menos."],
      explanationTitle: "Regla NPF para estrellas nítidas",
      formula: "t = (35 × apertura + 30 × pasoPixel[µm]) / focal[mm]  (s)",
      explanation: [
        "La regla NPF refina la de 500 incluyendo apertura y tamaño de píxel, no solo focal.",
        "Suele dar tiempos más cortos y seguros, sobre todo en cámaras de alta resolución.",
      ],
      faq: [
        { q: "NPF vs 500?", a: "NPF es más precisa al incluir apertura y paso de píxel." },
        { q: "¿Qué es paso de píxel?", a: "Ancho físico de un píxel en µm; píxeles menores exigen tiempos cortos." },
        { q: "¿Aún usar tracker?", a: "Para deep-sky sí; NPF solo evita rastros visibles." },
      ],
    },
  },
  "time-lapse": {
    en: {
      steps: [
        "Enter the real-world duration you want to capture.",
        "Enter the interval between shots and the frame rate of the final clip.",
        "Read the number of frames and the resulting clip length.",
      ],
      explanationTitle: "Time-lapse frame and clip math",
      formula: "frames = duration / interval; clipSeconds = frames / fps",
      explanation: [
        "Time-lapse compresses slow change into a short video by sampling at intervals far apart.",
        "A common target is 24–30 fps for smooth playback; the interval sets how much real time each frame represents.",
      ],
      faq: [
        { q: "What interval should I use?", a: "Depends on motion; clouds may need 2–5s, stars 15–30s, plant growth minutes to hours." },
        { q: "How long is my clip?", a: "Clip seconds = total frames ÷ fps; more frames means a longer, smoother clip." },
        { q: "Does shutter speed matter?", a: "Keep shutter well below the interval (e.g., under half) to avoid gaps and flicker." },
      ],
    },
    zh: {
      steps: ["输入你想拍摄的真实世界时长。", "输入拍摄间隔和最终视频的帧率。", "读取总帧数和最终成片时长。"],
      explanationTitle: "延时摄影的帧数与成片计算",
      formula: "帧数 = 时长 / 间隔；成片秒数 = 帧数 / 帧率",
      explanation: [
        "延时摄影以较大间隔采样，把缓慢变化压缩成短视频。",
        "常见目标为 24–30 fps 平滑播放；间隔决定每帧代表多少真实时间。",
      ],
      faq: [
        { q: "间隔取多少？", a: "取决于运动：云 2–5 秒、星空 15–30 秒、植物生长可能数分钟到数小时。" },
        { q: "成片多长？", a: "成片秒数 = 总帧数 ÷ 帧率；帧越多越长越平滑。" },
        { q: "快门速度重要吗？", a: "快门应远小于间隔（如一半以内），避免空档与闪烁。" },
      ],
    },
    zhTW: {
      steps: ["輸入你想拍攝的真實世界時長。", "輸入拍攝間隔和最終影片的幀率。", "讀取總幀數和最終成片時長。"],
      explanationTitle: "延時攝影的幀數與成片計算",
      formula: "幀數 = 時長 / 間隔；成片秒數 = 幀數 / 幀率",
      explanation: [
        "延時攝影以較大間隔取樣，把緩慢變化壓縮成短影片。",
        "常見目標為 24–30 fps 平滑播放；間隔決定每幀代表多少真實時間。",
      ],
      faq: [
        { q: "間隔取多少？", a: "取決於運動：雲 2–5 秒、星空 15–30 秒、植物生長可能數分鐘到數小時。" },
        { q: "成片多長？", a: "成片秒數 = 總幀數 ÷ 幀率；幀越多越長越平滑。" },
        { q: "快門速度重要嗎？", a: "快門應遠小於間隔（如一半以內），避免空檔與閃爍。" },
      ],
    },
    de: {
      steps: ["Gib die reale Aufnahmedauer ein.", "Gib Intervall und Bildrate des Clips ein.", "Lies Anzahl Frames und Clip-Länge."],
      explanationTitle: "Time-Lapse Frame- und Clip-Rechnung",
      formula: "frames = dauer / intervall; clipSek = frames / fps",
      explanation: [
        "Time-Lapse komprimiert langsame Vorgänge durch weit auseinanderliegende Intervalle.",
        "Ziel sind oft 24–30 fps; das Intervall legt fest, wie viel Zeit pro Frame dargestellt wird.",
      ],
      faq: [
        { q: "Welches Intervall?", a: "Je nach Bewegung: Wolken 2–5s, Sterne 15–30s, Pflanzen Minuten bis Stunden." },
        { q: "Wie lang der Clip?", a: "ClipSek = Frames ÷ fps; mehr Frames = länger und flüssiger." },
        { q: "Verschlusszeit wichtig?", a: "Bleib deutlich unter dem Intervall, um Lücken und Flimmern zu vermeiden." },
      ],
    },
    ja: {
      steps: ["撮影したい実時間の長さを入力します。", "撮影間隔と完成動画のフレームレートを入力します。", "総フレーム数と動画の長さを確認します。"],
      explanationTitle: "タイムラプスのフレームと動画計算",
      formula: "フレーム数 = 時間 / 間隔；動画秒数 = フレーム数 / fps",
      explanation: [
        "タイムラプスは大きな間隔でサンプリングし、ゆっくりした変化を短い動画に圧縮します。",
        "目安は 24–30 fps の滑らか再生。間隔が各フレームの実時間を決めます。",
      ],
      faq: [
        { q: "間隔は？", a: "動きによる：雲 2–5 秒、星 15–30 秒、植物は分〜時間単位。" },
        { q: "動画の長さ？", a: "秒数 = 総フレーム ÷ fps。多いほど長く滑らか。" },
        { q: "シャッター速度は？", a: "間隔より十分短く（半分以下等）し、欠けやちらつきを防ぎます。" },
      ],
    },
    es: {
      steps: ["Introduce la duración real a capturar.", "Introduce intervalo y fps del clip.", "Lee el número de frames y la duración del clip."],
      explanationTitle: "Cálculo de frames y clip en time-lapse",
      formula: "frames = duración / intervalo; clipSeg = frames / fps",
      explanation: [
        "El time-lapse comprime cambios lentos muestreando a intervalos amplios.",
        "Se busca 24–30 fps; el intervalo define cuánto tiempo real representa cada frame.",
      ],
      faq: [
        { q: "¿Qué intervalo?", a: "Según movimiento: nubes 2–5s, estrellas 15–30s, plantas minutos u horas." },
        { q: "¿Cuánto dura el clip?", a: "ClipSeg = frames ÷ fps; más frames = más largo y fluido." },
        { q: "¿Importa la velocidad?", a: "Mantén el obturador bien por debajo del intervalo para evitar huecos y parpadeo." },
      ],
    },
  },
  "diffraction": {
    en: {
      steps: [
        "Enter the aperture (f-number) and the wavelength of light.",
        "Enter your sensor pixel pitch to see the blur in pixels.",
        "Read the Airy disk size and whether diffraction limits sharpness.",
      ],
      explanationTitle: "Diffraction limit and the Airy disk",
      formula: "airyRadius = 1.22 × λ × N; blurDiameter[pixels] = 2.44 × λ × N / pixelPitch",
      explanation: [
        "Even a perfect lens bends light into a small diffraction pattern (Airy disk) limited by aperture.",
        "Past a certain f-number, the Airy disk exceeds the pixel pitch and the image softens even though depth of field grows.",
      ],
      faq: [
        { q: "Is smaller aperture always sharper?", a: "No; beyond the diffraction limit, stopping down softens detail despite more DoF." },
        { q: "What wavelength to use?", a: "Green light ~550 nm is a good average for visible photography." },
        { q: "How do I avoid diffraction softening?", a: "Use the sharpest aperture (often f/5.6–f/8 on full frame) and avoid extremes." },
      ],
    },
    zh: {
      steps: ["输入光圈（f 值）和光波波长。", "输入传感器像素间距以查看像素级模糊。", "读取艾里斑尺寸及衍射是否限制锐度。"],
      explanationTitle: "衍射极限与艾里斑",
      formula: "艾里半径 = 1.22 × λ × N；模糊直径[像素] = 2.44 × λ × N / 像素间距",
      explanation: [
        "即使完美镜头也会把光弯曲成受光圈限制的微小衍射图样（艾里斑）。",
        "超过某个 f 值后，艾里斑大于像素间距，即使景深增大画面也会变软。",
      ],
      faq: [
        { q: "光圈越小越锐吗？", a: "否；超过衍射极限后，收缩光圈虽增景深却会让细节变软。" },
        { q: "波长取多少？", a: "绿光约 550nm 是可见光摄影的良好平均值。" },
        { q: "如何避免衍射软化？", a: "用最锐光圈（全画幅常 f/5.6–f/8），避免极端值。" },
      ],
    },
    zhTW: {
      steps: ["輸入光圈（f 值）和光波波長。", "輸入感測器像素間距以查看像素級模糊。", "讀取艾里斑尺寸及繞射是否限制銳度。"],
      explanationTitle: "繞射極限與艾里斑",
      formula: "艾里半徑 = 1.22 × λ × N；模糊直徑[像素] = 2.44 × λ × N / 像素間距",
      explanation: [
        "即使完美鏡頭也會把光彎曲成受光圈限制的微小繞射圖樣（艾里斑）。",
        "超過某個 f 值後，艾里斑大於像素間距，即使景深增大畫面也會變軟。",
      ],
      faq: [
        { q: "光圈越小越銳嗎？", a: "否；超過繞射極限後，收縮光圈雖增景深卻會讓細節變軟。" },
        { q: "波長取多少？", a: "綠光約 550nm 是可見光攝影的良好平均值。" },
        { q: "如何避免繞射軟化？", a: "用最銳光圈（全幅常 f/5.6–f/8），避免極端值。" },
      ],
    },
    de: {
      steps: ["Gib Blende und Wellenlänge ein.", "Gib Pixelabstand für Unschärfe in Pixeln ein.", "Lies Airy-Scheibe und ob Beugung begrenzt."],
      explanationTitle: "Beugungsgrenze und Airy-Scheibe",
      formula: "airyRadius = 1,22 × λ × N; unschärfePix = 2,44 × λ × N / pixelAbstand",
      explanation: [
        "Selbst ein perfektes Objektiv beugt Licht zu einem kleinen Muster (Airy-Scheibe), begrenzt durch die Blende.",
        "Über einer bestimmten Blende übersteigt die Airy-Scheibe den Pixelabstand und das Bild wirkt weicher.",
      ],
      faq: [
        { q: "Kleinere Blende immer schärfer?", a: "Nein; jenseits der Beugungsgrenze weicht es trotz mehr DoF auf." },
        { q: "Welche Wellenlänge?", a: "Grün ~550 nm ist ein guter Mittelwert." },
        { q: "Beugungsweichheit vermeiden?", a: "Schärfste Blende nutzen (oft f/5,6–f/8) und Extreme meiden." },
      ],
    },
    ja: {
      steps: ["絞り（F値）と光の波長を入力します。", "センサーの画素ピッチを入力し画素単位のぼけを見ます。", "エアリーディスクの大きさと回折限界を確認します。"],
      explanationTitle: "回折限界とエアリーディスク",
      formula: "エアリー半径 = 1.22 × λ × N；ぼけ直径[画素] = 2.44 × λ × N / 画素ピッチ",
      explanation: [
        "完璧なレンズでも光は絞りで決まる微小な回折パターン（エアリーディスク）になります。",
        "ある F 値を超えるとエアリーディスクが画素ピッチを超え、景深が増えても画質が軟らかくなります。",
      ],
      faq: [
        { q: "絞りを絞るほど锐い？", a: "いいえ。回折限界を超えると景深は増えても細部が軟らかくなります。" },
        { q: "波長は？", a: "緑〜550nm が可視光の良い平均です。" },
        { q: "回折による軟らかさを避ける？", a: "最も锐い絞り（フルサイズで f/5.6–f/8）を使い極端を避ける。" },
      ],
    },
    es: {
      steps: ["Introduce apertura y longitud de onda.", "Introduce paso de píxel para ver el desenfoque.", "Lee el disco de Airy y si la difracción limita."],
      explanationTitle: "Límite de difracción y disco de Airy",
      formula: "radioAiry = 1,22 × λ × N; desenfoquePix = 2,44 × λ × N / pasoPixel",
      explanation: [
        "Incluso un objetivo perfecto curva la luz en un patrón pequeño (disco de Airy) limitado por la apertura.",
        "Pasado un f-number, el disco supera el paso de píxel y la imagen se ablanda pese a más DoF.",
      ],
      faq: [
        { q: "¿Menor apertura siempre más nítida?", a: "No; más allá del límite, cerrar ablanda el detalle a pesar de más DoF." },
        { q: "¿Qué longitud de onda?", a: "Verde ~550 nm es un buen promedio visible." },
        { q: "¿Evitar ablandamiento?", a: "Usa la apertura más nítida (f/5,6–f/8) y evita extremos." },
      ],
    },
  },
  "macro-diffraction": {
    en: {
      steps: [
        "Enter the aperture (f-number) and your macro magnification.",
        "Enter the sensor pixel pitch.",
        "Read the effective aperture and the diffraction blur at that magnification.",
      ],
      explanationTitle: "Diffraction in macro photography",
      formula: "effectiveN = N × (1 + m); blurDiameter[pixels] = 2.44 × λ × effectiveN / pixelPitch",
      explanation: [
        "In macro, the effective aperture grows to N × (1 + m), so diffraction softens images much sooner than at normal distances.",
        "This is why macro lenses are often used near wide open and lit brightly rather than stopped down.",
      ],
      faq: [
        { q: "Why is macro so diffraction-limited?", a: "The effective aperture multiplies by (1 + magnification), rapidly increasing the Airy disk." },
        { q: "Should I stop down for DoF in macro?", a: "Only slightly; the DoF gain is tiny while diffraction loss is large. Prefer focus stacking." },
        { q: "Best practice?", a: "Use enough light to shoot near the sharpest aperture and stack focus frames." },
      ],
    },
    zh: {
      steps: ["输入光圈（f 值）和微距放大率。", "输入传感器像素间距。", "读取该放大率下的有效光圈与衍射模糊。"],
      explanationTitle: "微距摄影中的衍射",
      formula: "有效光圈 = N × (1 + m)；模糊直径[像素] = 2.44 × λ × 有效光圈 / 像素间距",
      explanation: [
        "微距下有效光圈会增大到 N × (1 + m)，因此衍射比普通距离更早让画面变软。",
        "这就是为什么微距镜头常在接近全开、强补光下使用，而非收缩光圈。",
      ],
      faq: [
        { q: "为什么微距受衍射限制这么强？", a: "有效光圈乘以 (1 + 放大率)，艾里斑迅速增大。" },
        { q: "微距该靠收光圈增景深吗？", a: "只宜略收；景深增益极小而衍射损失很大，建议焦点堆栈。" },
        { q: "最佳实践？", a: "保证足够光量在较锐光圈附近拍摄，并对焦堆栈。" },
      ],
    },
    zhTW: {
      steps: ["輸入光圈（f 值）和微距放大率。", "輸入感測器像素間距。", "讀取該放大率下的有效光圈與繞射模糊。"],
      explanationTitle: "微距攝影中的繞射",
      formula: "有效光圈 = N × (1 + m)；模糊直徑[像素] = 2.44 × λ × 有效光圈 / 像素間距",
      explanation: [
        "微距下有效光圈會增大到 N × (1 + m)，因此繞射比普通距離更早讓畫面變軟。",
        "這就是為什麼微距鏡頭常在接近全開、強補光下使用，而非收縮光圈。",
      ],
      faq: [
        { q: "為什麼微距受繞射限制這麼強？", a: "有效光圈乘以 (1 + 放大率)，艾里斑迅速增大。" },
        { q: "微距該靠收光圈增景深嗎？", a: "只宜略收；景深增益極小而繞射損失很大，建議焦點堆疊。" },
        { q: "最佳實務？", a: "保證足夠光量在較銳光圈附近拍攝，並對焦堆疊。" },
      ],
    },
    de: {
      steps: ["Gib Blende und Makro-Abbildung ein.", "Gib Pixelabstand ein.", "Lies effektive Blende und Beugungsunschärfe."],
      explanationTitle: "Beugung im Makrobereich",
      formula: "effN = N × (1 + m); unschärfePix = 2,44 × λ × effN / pixelAbstand",
      explanation: [
        "Im Makro wächst die effektive Blende auf N × (1 + m); Beugung weicht das Bild früher auf.",
        "Daher werden Makro-Objektive oft fast offen und hell beleuchtet genutzt, statt abzublenden.",
      ],
      faq: [
        { q: "Warum so beugungslimitiert?", a: "Die effektive Blende multipliziert mit (1 + m), die Airy-Scheibe wächst schnell." },
        { q: "Für DoF abblenden?", a: "Nur leicht; DoF-Gewinn gering, Beugungsverlust groß. Lieber Stacking." },
        { q: "Beste Praxis?", a: "Genug Licht für nahezu schärfste Blende, dann Fokus-Stacking." },
      ],
    },
    ja: {
      steps: ["絞り（F値）とマクロ撮影倍率を入力します。", "センサーの画素ピッチを入力します。", "その倍率での有効絞りと回折ぼけを確認します。"],
      explanationTitle: "マクロ撮影の回折",
      formula: "有効絞り = N × (1 + m)；ぼけ直径[画素] = 2.44 × λ × 有効絞り / 画素ピッチ",
      explanation: [
        "マクロでは有効絞りが N × (1 + m) に大きくなり、通常より早く回折で軟らかくなります。",
        "そのためマクロレンズは全開に近く、明るく照らして使うことが多いです。",
      ],
      faq: [
        { q: "なぜマクロは回折に強く効く？", a: "有効絞りが (1 + 倍率) 倍になり、エアリーディスクが急速に大きくなるため。" },
        { q: "マクロで絞って景深を？", a: "わずかにだけ。景深の得は小さく回折損失は大。スタック推奨。" },
        { q: "最良の実践？", a: "十分な光で最も銳い絞り近くで撮り、フォーカススタック。" },
      ],
    },
    es: {
      steps: ["Introduce apertura y ampliación macro.", "Introduce paso de píxel.", "Lee la apertura efectiva y el desenfoque por difracción."],
      explanationTitle: "Difracción en macro",
      formula: "Nef = N × (1 + m); desenfoquePix = 2,44 × λ × Nef / pasoPixel",
      explanation: [
        "En macro la apertura efectiva crece a N × (1 + m), así la difracción ablanda antes.",
        "Por eso los macro se usan casi abiertos y bien iluminados, no cerrados.",
      ],
      faq: [
        { q: "¿Por qué tan limitado por difracción?", a: "La apertura efectiva multiplica por (1 + m), creciendo el disco de Airy rápido." },
        { q: "¿Cerrar para DoF en macro?", a: "Solo un poco; la ganancia de DoF es mínima y la pérdida por difracción grande. Mejor apilar." },
        { q: "¿Mejor práctica?", a: "Luz suficiente cerca de la apertura más nítida y apilar enfoque." },
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

console.log("Injected photo 14 tools x 6 languages = 84 guide sets.");
