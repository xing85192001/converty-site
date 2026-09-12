import fs from "node:fs";

// Batch 6 — Photo shooting (6) + Crypto (4). A-layer guides in 6 languages + metaDescription.
const G = {
  "depth-of-field": {
    en: {
      steps: ["Set your camera to aperture-priority or manual mode and pick an f-number.", "Enter the focal length, aperture, and focus distance into the calculator.", "Read the near and far limits plus the total in-focus zone."],
      explanationTitle: "What Is Depth of Field?",
      formula: "DoF depends on f-number, focal length, focus distance, and circle of confusion",
      explanation: ["Depth of field is the distance range in a photo that appears acceptably sharp. A wide aperture (small f-number) gives a shallow, blurred background; a narrow aperture keeps more in focus.", "Photographers use it creatively for portraits (blurred backgrounds) and landscapes (everything sharp from front to back)."],
      faq: [
        { q: "What makes background blur stronger?", a: "A wider aperture (lower f-number), a longer focal length, and a closer focus distance all increase background separation and blur." },
        { q: "Why does stopping down increase sharpness?", a: "A smaller aperture (higher f-number) widens the acceptable focus range, bringing both near and far subjects into the sharp zone." },
        { q: "What is the circle of confusion?", a: "It is the largest blur spot still perceived as a point. Smaller sensors need a tighter circle, which reduces the apparent depth of field." },
      ],
      metaDescription: "Free online depth of field calculator. Find near and far focus limits and blur for any lens and aperture fast, no signup, with clear steps.",
    },
    zh: {
      steps: ["将相机设为光圈优先或手动模式并选择光圈值 f。", "在计算器填入焦距、光圈与对焦距离。", "读取近限、远限以及整个清晰合焦范围。"],
      explanationTitle: "什么是景深？",
      formula: "景深取决于光圈、焦距、对焦距离与弥散圆",
      explanation: ["景深是一张照片中看起来清晰可辨的距离范围。大光圈（小 f 值）产生浅景深与背景虚化；小光圈则让更多内容保持清晰。", "人像摄影用它营造虚化背景，风光摄影则追求从近到远都清晰。"],
      faq: [
        { q: "怎样让背景虚化更强？", a: "更大的光圈（更小 f 值）、更长的焦距以及更近的对焦距离，都会增强背景分离与虚化。" },
        { q: "为什么收小光圈会更清晰？", a: "更小光圈（更大 f 值）拓宽了可接受的清晰范围，使近处与远处主体都进入清晰区。" },
        { q: "什么是弥散圆？", a: "它是仍被看作一个点的最大模糊斑。传感器越小，所需弥散圆越严格，景深看起来越浅。" },
      ],
      metaDescription: "免费在线景深计算器，按任意镜头与光圈快速求出近/远合焦界限与虚化，无需注册，步骤清晰。",
    },
    "zh-TW": {
      steps: ["將相機設為光圈優先或手動模式並選擇光圈值 f。", "在計算機填入焦距、光圈與對焦距離。", "讀取近限、遠限以及整個清晰合焦範圍。"],
      explanationTitle: "什麼是景深？",
      formula: "景深取決於光圈、焦距、對焦距離與彌散圓",
      explanation: ["景深是一張照片中看起來清晰可辨的距離範圍。大光圈（小 f 值）產生淺景深與背景虛化；小光圈則讓更多內容保持清晰。", "人像攝影用它營造虛化背景，風光攝影則追求從近到遠都清晰。"],
      faq: [
        { q: "怎樣讓背景虛化更強？", a: "更大的光圈（更小 f 值）、更長的焦距以及更近的對焦距離，都會增強背景分離與虛化。" },
        { q: "為什麼收小光圈會更清晰？", a: "更小光圈（更大 f 值）拓寬了可接受的清晰範圍，使近處與遠處主體都進入清晰區。" },
        { q: "什麼是彌散圓？", a: "它是仍被看作一個點的最大模糊斑。感測器越小，所需彌散圓越嚴格，景深看起來越淺。" },
      ],
      metaDescription: "免費線上景深計算機，按任意鏡頭與光圈快速求出近/遠合焦界限與虛化，無須註冊，步驟清晰。",
    },
    de: {
      steps: ["Stelle die Kamera auf Blendenautomatik oder Manuell und wähle eine Blende.", "Gib Brennweite, Blende und Fokusabstand in den Rechner ein.", "Lies die Nah- und Fern grenzen sowie die gesamte Schärfentiefe."],
      explanationTitle: "Was ist Schärfentiefe?",
      formula: "Schärfentiefe hängt von Blende, Brennweite, Fokusabstand und Zerstreuungskreis ab",
      explanation: ["Schärfentiefe ist der Abstandsbereich im Bild, der akzeptabel scharf wirkt. Eine offene Blende (kleine Blendenzahl) liefert geringe Tiefe mit unscharfem Hintergrund; eine geschlossene Blende hält mehr scharf.", "Fotografen nutzen sie kreativ für Porträts (unscharfer Hintergrund) und Landschaften (alles scharf von vorne bis hinten)."],
      faq: [
        { q: "Was verstärkt die Hintergrundunschärfe?", a: "Eine offene Blende (kleinere Blendenzahl), eine längere Brennweite und ein näherer Fokusabstand erhöhen alle die Trennung und Unschärfe." },
        { q: "Warum erhöht Abblenden die Schärfe?", a: "Eine kleinere Blende (höhere Blendenzahl) verbreitert den akzeptablen Schärfebereich, sodass nah und fern scharf wirken." },
        { q: "Was ist der Zerstreuungskreis?", a: "Er ist der größte Unschärfefleck, der noch als Punkt wahrgenommen wird. Kleinere Sensoren brauchen engere Kreise, was die Schärfentiefe reduziert." },
      ],
      metaDescription: "Kostenloser Online-Rechner für Schärfentiefe. Finde Nah- und Fern grenzen und Unschärfe für jedes Objektiv schnell, ohne Anmeldung.",
    },
    ja: {
      steps: ["カメラを絞り優先またはマニュアルにし、f 値を選びます。", "焦点距離・絞り・合焦距離を計算機に入力します。", "近くと遠くの限界と、合焦している全体範囲を確認します。"],
      explanationTitle: "被写界深度とは？",
      formula: "被写界深度は絞り・焦点距離・合焦距離・許容錯乱円に依存",
      explanation: ["被写界深度とは、写真の中で十分にシャープに見える距離の範囲です。大きな絞り（小さい f 値）は浅い深度とボケを生み、小さな絞りはより多くをシャープに保ちます。", "ポートレート（背景ボケ）や風景（手前から奥までシャープ）など、表現に使われます。"],
      faq: [
        { q: "背景のボケを強くするには？", a: "より開いた絞り（小さい f 値）、より長い焦点距離、より近い合焦距離はいずれもボケを強めます。" },
        { q: "なぜ絞りを絞るとシャープになるのですか？", a: "小さい絞り（大きい f 値）は許容シャープ範囲を広げ、近景と遠景の両方をシャープにします。" },
        { q: "許容錯乱円とは？", a: "点として見なされる最大のボケ円です。センサーが小さいほど厳しくなり、見かけの深度は浅くなります。" },
      ],
      metaDescription: "無料のオンライン被写界深度計算機。任意のレンズと絞りで近・遠の合焦限界とボケをすばやく算出。登録不要。",
    },
    es: {
      steps: ["Pon la cámara en prioridad de apertura o manual y elige un f-stop.", "Introduce la distancia focal, la apertura y la distancia de enfoque.", "Lee los límites cercano y lejano y la zona enfocada total."],
      explanationTitle: "¿Qué es la profundidad de campo?",
      formula: "La profundidad de campo depende de la apertura, la focal, el enfoque y el círculo de confusión",
      explanation: ["La profundidad de campo es el rango de distancia de la foto que aparece aceptablemente nítido. Una apertura amplia (f pequeña) da poco fondo y fondo borroso; una estrecha mantiene más en foco.", "Los fotógrafos la usan para retratos (fondo difuminado) y paisajes (todo nítido de frente a fondo)."],
      faq: [
        { q: "¿Qué aumenta el desenfoque del fondo?", a: "Una apertura más amplia (f menor), una focal más larga y un enfoque más cercano aumentan la separación y el bokeh." },
        { q: "¿Por qué cerrar apertura da más nitidez?", a: "Una apertura menor (f mayor) ensancha el rango aceptable de enfoque, metiendo cerca y lejos en la zona nítida." },
        { q: "¿Qué es el círculo de confusión?", a: "Es la mancha borrosa más grande todavía percibida como punto. Sensores pequeños exigen círculo menor, lo que reduce la profundidad." },
      ],
      metaDescription: "Calculadora de profundidad de campo gratis en línea. Halla límites cercano y lejano y bokeh para cualquier lente, sin registro.",
    },
  },

  "hyperfocal": {
    en: {
      steps: ["Enter the focal length and aperture you plan to shoot with.", "Enter the circle of confusion for your camera sensor.", "Read the hyperfocal distance and set focus there for maximum depth of field."],
      explanationTitle: "What Is the Hyperfocal Distance?",
      formula: "H = f² / (N · c) + f",
      explanation: ["The hyperfocal distance is the focus distance that keeps everything from half that distance to infinity acceptably sharp. It is the secret to maximally deep landscape focus.", "When you focus at the hyperfocal point, the far limit extends to infinity and the near limit is as close as possible."],
      faq: [
        { q: "Why focus at the hyperfocal distance?", a: "It maximizes depth of field: the background reaches infinity and the foreground stays sharp, ideal for landscapes." },
        { q: "Does a wider aperture change it a lot?", a: "Yes. A wider aperture (smaller f-number) pushes the hyperfocal distance farther away, shrinking the near sharp limit." },
        { q: "Do I need a tripod?", a: "For deep landscape focus you usually stop down to small apertures, which needs slower shutter speeds, so a tripod helps." },
      ],
      metaDescription: "Free online hyperfocal distance calculator. Get the focus point for max depth of field in landscapes fast, no signup, with formula.",
    },
    zh: {
      steps: ["输入你计划使用的焦距与光圈。", "输入相机传感器的弥散圆。", "读取超焦距，并将对焦设在该处以获得最大景深。"],
      explanationTitle: "什么是超焦距？",
      formula: "H = f² / (N · c) + f",
      explanation: ["超焦距是指把对焦设在该距离时，从二分之一处到无穷远都清晰可辨的对焦距离，是实现风光最大景深的秘诀。", "当对焦在超焦距点时，远限延伸至无穷远，而近限尽可能靠近。"],
      faq: [
        { q: "为什么要对超焦距对焦？", a: "它能最大化景深：背景到无穷远、前景也保持清晰，是风光摄影的理想选择。" },
        { q: "更大光圈会让它变化很大吗？", a: "会。更大光圈（更小 f 值）使超焦距更远，从而缩小近处清晰范围。" },
        { q: "需要三脚架吗？", a: "要获得深景深通常需收小光圈，导致快门变慢，因此三脚架很有帮助。" },
      ],
      metaDescription: "免费在线超焦距计算器，快速求出风光最大景深的对焦位置，无需注册，附公式。",
    },
    "zh-TW": {
      steps: ["輸入你計畫使用的焦距與光圈。", "輸入相機感測器的彌散圓。", "讀取超焦距，並將對焦設在該處以獲得最大景深。"],
      explanationTitle: "什麼是超焦距？",
      formula: "H = f² / (N · c) + f",
      explanation: ["超焦距是指把對焦設在該距離時，從二分之一處到無限遠都清晰可辨的對焦距離，是實現風光最大景深的秘訣。", "當對焦在超焦距點時，遠限延伸至無限遠，而近限盡可能靠近。"],
      faq: [
        { q: "為什麼要對超焦距對焦？", a: "它能最大化景深：背景到無限遠、前景也保持清晰，是風光攝影的理想選擇。" },
        { q: "更大光圈會讓它變化很大嗎？", a: "會。更大光圈（更小 f 值）使超焦距更遠，從而縮小近處清晰範圍。" },
        { q: "需要三腳架嗎？", a: "要獲得深景深通常需收小光圈，導致快門變慢，因此三腳架很有幫助。" },
      ],
      metaDescription: "免費線上超焦距計算機，快速求出風光最大景深的对焦位置，無須註冊，附公式。",
    },
    de: {
      steps: ["Gib die Brennweite und Blende ein, mit denen du fotografieren willst.", "Gib den Zerstreuungskreis deines Sensors ein.", "Lies die hyperfokale Distanz und stelle darauf für maximale Tiefe scharf."],
      explanationTitle: "Was ist die hyperfokale Distanz?",
      formula: "H = f² / (N · c) + f",
      explanation: ["Die hyperfokale Distanz ist der Fokusabstand, bei dem alles ab der Hälfte dieses Abstands bis unendlich scharf wirkt. Sie ist das Geheimnis maximaler Landschaftstiefe.", "Fokussierst du auf den Hyperfokus, reicht das ferne Ende bis unendlich und das nahe Ende ist so nah wie möglich."],
      faq: [
        { q: "Warum auf die hyperfokale Distanz fokussieren?", a: "Sie maximiert die Schärfentiefe: der Hintergrund reicht bis unendlich und der Vordergrund bleibt scharf — ideal für Landschaften." },
        { q: "Ändert eine offene Blende das stark?", a: "Ja. Eine offene Blende (kleine Blendenzahl) schiebt die hyperfokale Distanz weiter weg und verkleinert die nahe Schärfegrenze." },
        { q: "Brauche ich ein Stativ?", a: "Für tiefe Landschaftsschärfe blendest du meist ab, was lange Verschlusszeiten braucht — ein Stativ hilft." },
      ],
      metaDescription: "Kostenloser Online-Rechner für hyperfokale Distanz. Finde den Fokuspunkt für maximale Tiefe schnell, ohne Anmeldung, mit Formel.",
    },
    ja: {
      steps: ["撮影に使う焦点距離と絞りを入力します。", "カメラの許容錯乱円を入力します。", "超焦距（ハイパーフォーカル距離）を読み取り、そこに合焦して最大の深度を得ます。"],
      explanationTitle: "超焦距（ハイパーフォーカル距離）とは？",
      formula: "H = f² / (N · c) + f",
      explanation: ["超焦距とは、その距離に合焦すると半分の距離から無限遠までシャープに見える点です。風景の最大深度を引き出す鍵です。", "超焦距に合焦すると、遠景は無限遠へ、近景の限界は可能な限り手前になります。"],
      faq: [
        { q: "なぜ超焦距に合焦するのですか？", a: "深度を最大化できるからです。背景は無限遠へ、前景もシャープに保たれ、風景に最適です。" },
        { q: "絞りを開くと大きく変わりますか？", a: "はい。開いた絞り（小さい f 値）は超焦距を遠ざけ、近景のシャープ限界を狭めます。" },
        { q: "三脚は必要ですか？", a: "深い風景の深度には絞り込みが必要でシャッターが遅くなるため、三脚があると助かります。" },
      ],
      metaDescription: "無料のオンライン超焦距計算機。風景の最大深度を得る合焦距離をすばやく算出。登録不要、数式付き。",
    },
    es: {
      steps: ["Introduce la distancia focal y la apertura que vas a usar.", "Introduce el círculo de confusión de tu sensor.", "Lee la distancia hiperfocal y enfoca ahí para máxima profundidad."],
      explanationTitle: "¿Qué es la distancia hiperfocal?",
      formula: "H = f² / (N · c) + f",
      explanation: ["La distancia hiperfocal es el enfoque que mantiene nítido todo desde la mitad de esa distancia hasta el infinito. Es la clave de la máxima profundidad en paisajes.", "Al enfocar en el punto hiperfocal, el límite lejano llega al infinito y el cercano está lo más cerca posible."],
      faq: [
        { q: "¿Por qué enfocar a la hiperfocal?", a: "Maximiza la profundidad: el fondo llega al infinito y el primer plano queda nítido, ideal para paisajes." },
        { q: "¿Cambia mucho una apertura amplia?", a: "Sí. Una apertura más abierta (f menor) aleja la hiperfocal y reduce el límite cercano nítido." },
        { q: "¿Necesito trípode?", a: "Para gran profundidad sueles cerrar apertura, lo que exige exposiciones lentas, así que un trípode ayuda." },
      ],
      metaDescription: "Calculadora de distancia hiperfocal gratis en línea. Obtén el punto de enfoque para máxima profundidad, sin registro, con fórmula.",
    },
  },

  "nd-filter": {
    en: {
      steps: ["Enter the shutter speed you would use without the filter.", "Enter the filter strength in stops (e.g. ND8 = 3 stops).", "Read the new shutter speed needed with the ND filter attached."],
      explanationTitle: "What Does an ND Filter Do?",
      formula: "exposure time × 2^(stops)",
      explanation: ["A neutral density (ND) filter reduces the light entering the lens without changing colors. It lets you use slow shutter speeds in bright light for silky water or motion blur.", "Each stop of ND doubles the required exposure time, so an ND1000 lets you shoot multi-second exposures in daylight."],
      faq: [
        { q: "What does ND8, ND64, ND1000 mean?", a: "The number is the light reduction factor; the stop count is its base-2 log. ND8 = 3 stops, ND64 = 6 stops, ND1000 ≈ 10 stops." },
        { q: "Can I stack ND filters?", a: "Yes, but combined stops add up and can push exposure so long you need a remote shutter and tripod." },
        { q: "Why use ND for video?", a: "It lets you keep a cinematic aperture (shallow depth) in daylight without overexposing the frame." },
      ],
      metaDescription: "Free online ND filter calculator. Convert shutter speed for any ND stop value fast, no signup, for silky water and long exposures.",
    },
    zh: {
      steps: ["输入不加滤镜时会使用的快门速度。", "输入滤镜档位（如 ND8 = 3 档）。", "读取加装 ND 滤镜后所需的新快门速度。"],
      explanationTitle: "ND 滤镜有什么用？",
      formula: "曝光时间 × 2^(档位)",
      explanation: ["中性灰度（ND）滤镜在不改变色彩的前提下减少进入镜头的光线，让你在强光下也能用慢速快门拍出丝滑水流或运动模糊。", "每增加一档 ND，所需曝光时间翻倍，因此 ND1000 可在白天实现数秒级长曝光。"],
      faq: [
        { q: "ND8、ND64、ND1000 各代表什么？", a: "数字是减光倍数，档位是其以 2 为底的对数：ND8 = 3 档，ND64 = 6 档，ND1000 ≈ 10 档。" },
        { q: "可以叠加 ND 滤镜吗？", a: "可以，但档位会相加，可能使曝光时间过长，需要快门线与三脚架。" },
        { q: "拍视频为何要用 ND？", a: "它让你在白天也能保持电影感光圈（浅景深）而不至于画面过曝。" },
      ],
      metaDescription: "免费在线 ND 滤镜计算器，按任意 ND 档位换算快门速度，无需注册，助你拍出丝滑水流与长曝光。",
    },
    "zh-TW": {
      steps: ["輸入不加濾鏡時會使用的快門速度。", "輸入濾鏡檔位（如 ND8 = 3 檔）。", "讀取加裝 ND 濾鏡後所需的新快門速度。"],
      explanationTitle: "ND 濾鏡有什麼用？",
      formula: "曝光時間 × 2^(檔位)",
      explanation: ["中性灰度（ND）濾鏡在不改變色彩的前提下減少進入鏡頭的光線，讓你在強光下也能用慢速快門拍出絲滑水流或運動模糊。", "每增加一檔 ND，所需曝光時間翻倍，因此 ND1000 可在白天實現數秒級長曝光。"],
      faq: [
        { q: "ND8、ND64、ND1000 各代表什麼？", a: "數字是減光倍數，檔位是其以 2 為底的對數：ND8 = 3 檔，ND64 = 6 檔，ND1000 ≈ 10 檔。" },
        { q: "可以疊加 ND 濾鏡嗎？", a: "可以，但檔位會相加，可能使曝光時間過長，需要快門線與三腳架。" },
        { q: "拍影片為何要用 ND？", a: "它讓你在白天也能保持電影感光圈（淺景深）而不至於畫面過曝。" },
      ],
      metaDescription: "免費線上 ND 濾鏡計算機，按任意 ND 檔位換算快門速度，無須註冊，助你拍出絲滑水流與長曝光。",
    },
    de: {
      steps: ["Gib die Verschlusszeit ein, die du ohne Filter nutzen würdest.", "Gib die Filterstärke in Blendenstufen ein (z. B. ND8 = 3 Stufen).", "Lies die neue Verschlusszeit mit aufgesetztem ND-Filter."],
      explanationTitle: "Was macht ein ND-Filter?",
      formula: "Belichtungszeit × 2^(Stufen)",
      explanation: ["Ein Neutralgraufilter (ND) reduziert das einfallende Licht ohne Farbänderung. So kannst du bei hellem Licht lange Verschlusszeiten für seidiges Wasser oder Bewegungsunschärfe nutzen.", "Jede Stufe verdoppelt die nötige Zeit; ein ND1000 erlaubt tagsüber mehrere Sekunden Belichtung."],
      faq: [
        { q: "Was bedeuten ND8, ND64, ND1000?", a: "Die Zahl ist der Lichtreduktionsfaktor; die Stufen sind sein Logarithmus zur Basis 2. ND8 = 3, ND64 = 6, ND1000 ≈ 10 Stufen." },
        { q: "Kann ich ND-Filter stapeln?", a: "Ja, aber die Stufen addieren sich und können die Zeit so verlängern, dass Fernauslöser und Stativ nötig sind." },
        { q: "Warum ND beim Video?", a: "Er hält bei Tageslicht eine filmische Blende (geringe Tiefe) ohne Überbelichtung." },
      ],
      metaDescription: "Kostenloser Online-ND-Filter-Rechner. Wandle Verschlusszeiten für jede ND-Stufe schnell um, ohne Anmeldung, für Langzeitbelichtungen.",
    },
    ja: {
      steps: ["フィルターなしで使うシャッター速度を入力します。", "フィルターの段数を入力します（例：ND8 = 3 段）。", "ND フィルター装着時に必要な新しいシャッター速度を確認します。"],
      explanationTitle: "ND フィルターの役割",
      formula: "露光時間 × 2^(段数)",
      explanation: ["ND（中性濃度）フィルターは色を変えずにレンズへの光を減らします。明るい場所でもゆっくりしたシャッターで絹のような水や動きのぼかしが得られます。", "段数が1つ上がるごとに必要露光は倍になり、ND1000 があれば昼間でも数秒の長露光が可能です。"],
      faq: [
        { q: "ND8、ND64、ND1000 とは？", a: "数字は減光倍率、段数はその底 2 の対数です。ND8 = 3 段、ND64 = 6 段、ND1000 ≈ 10 段。" },
        { q: "ND を重ねて使えますか？", a: "はい。ただし段数は加算され、露光が長くなりすぎるのでリモートと三脚が必要になります。" },
        { q: "動画で ND を使う理由は？", a: "昼間でも映画的な絞り（浅い深度）を保ちつつ、画面を飛ばさずに済むからです。" },
      ],
      metaDescription: "無料のオンライン ND フィルター計算機。任意の段数でシャッター速度を変換し、長露光や絹のような水を実現。登録不要。",
    },
    es: {
      steps: ["Introduce la velocidad de obturación que usarías sin el filtro.", "Introduce la fuerza del filtro en pasos (p. ej. ND8 = 3 pasos).", "Lee la nueva velocidad de obturación con el ND puesto."],
      explanationTitle: "¿Qué hace un filtro ND?",
      formula: "tiempo de exposición × 2^(pasos)",
      explanation: ["Un filtro de densidad neutra (ND) reduce la luz que entra sin cambiar los colores. Permite usar obturaciones lentas con luz brillante para agua sedosa o movimiento borroso.", "Cada paso duplica el tiempo; un ND1000 permite exposiciones de varios segundos a plena luz."],
      faq: [
        { q: "¿Qué significan ND8, ND64, ND1000?", a: "El número es el factor de reducción; los pasos son su log base 2. ND8 = 3, ND64 = 6, ND1000 ≈ 10 pasos." },
        { q: "¿Puedo apilar filtros ND?", a: "Sí, pero los pasos se suman y pueden exigir obturador remoto y trípode." },
        { q: "¿Por qué usar ND en vídeo?", a: "Mantiene una apertura cinematográfica (poca profundidad) de día sin sobreexponer." },
      ],
      metaDescription: "Calculadora de filtros ND gratis en línea. Convierte la obturación para cualquier paso ND, sin registro, para agua sedosa y largas exposiciones.",
    },
  },

  "golden-hour": {
    en: {
      steps: ["Enter your location (or let the calculator use your device position).", "Pick the date you plan to shoot.", "Read the golden hour and blue hour start/end times for that day."],
      explanationTitle: "What Are Golden and Blue Hour?",
      formula: "Derived from solar elevation angle ≈ 6° (golden) and −4° to −6° (blue)",
      explanation: ["The golden hour is the period shortly after sunrise and before sunset with warm, soft, directional light that flatters subjects and landscapes.", "The blue hour follows, when the sun is just below the horizon and the sky turns deep blue — perfect for cityscapes and long exposures."],
      faq: [
        { q: "How long does golden hour last?", a: "Usually 20–60 minutes depending on latitude and season; it is longer near the equator and in winter at high latitudes." },
        { q: "What is blue hour for?", a: "Its even, cool light and lit windows make it ideal for architecture, bridges, and reflections after sunset." },
        { q: "Does it work for indoor portraits?", a: "The warm window light during golden hour is excellent for natural-looking indoor portraits near a window." },
      ],
      metaDescription: "Free online golden hour calculator. Find golden and blue hour times for your location and date fast, no signup, for better photos.",
    },
    zh: {
      steps: ["输入你的位置（或让计算器使用设备定位）。", "选择计划拍摄的日期。", "读取当天黄金时刻与蓝调时刻的起止时间。"],
      explanationTitle: "黄金时刻与蓝调时刻是什么？",
      formula: "由太阳高度角 ≈ 6°（黄金）与 −4°～−6°（蓝调）推算",
      explanation: ["黄金时刻是日出后、日落前的一段时光，光线温暖、柔和且具方向性，能很好地衬托主体与风光。", "随后是蓝调时刻，太阳刚落到地平线以下，天空呈现深蓝，非常适合城市景观与长曝光。"],
      faq: [
        { q: "黄金时刻持续多久？", a: "通常 20–60 分钟，取决于纬度与季节；赤道附近更长，高纬度冬季也较长。" },
        { q: "蓝调时刻有什么用？", a: "均匀冷调的光线加上亮起的窗光，是日落后拍摄建筑、桥梁与倒影的理想时机。" },
        { q: "室内人像也能用吗？", a: "黄金时刻温暖的窗光非常适合在窗边拍摄自然感十足的室内人像。" },
      ],
      metaDescription: "免费在线黄金时刻计算器，按位置与日期快速求出黄金与蓝调时刻，无需注册，助你拍出更好的照片。",
    },
    "zh-TW": {
      steps: ["輸入你的位置（或讓計算機使用裝置定位）。", "選擇計畫拍攝的日期。", "讀取當天黃金時刻與藍調時刻的起止時間。"],
      explanationTitle: "黃金時刻與藍調時刻是什麼？",
      formula: "由太陽高度角 ≈ 6°（黃金）與 −4°～−6°（藍調）推算",
      explanation: ["黃金時刻是日出後、日落前的一段時光，光線溫暖、柔和且具方向性，能很好地襯托主體與風光。", "隨後是藍調時刻，太陽剛落到地平線以下，天空呈現深藍，非常適合城市景觀與長曝光。"],
      faq: [
        { q: "黃金時刻持續多久？", a: "通常 20–60 分鐘，取決於緯度與季節；赤道附近更長，高緯度冬季也較長。" },
        { q: "藍調時刻有什麼用？", a: "均勻冷調的光線加上亮起的窗光，是日落後拍攝建築、橋樑與倒影的理想時機。" },
        { q: "室內人像也能用嗎？", a: "黃金時刻溫暖的窗光非常適合在窗邊拍攝自然感十足的室內人像。" },
      ],
      metaDescription: "免費線上黃金時刻計算機，按位置與日期快速求出黃金與藍調時刻，無須註冊，助你拍出更好的照片。",
    },
    de: {
      steps: ["Gib deinen Ort ein (oder erlaube die Standortermittlung).", "Wähle das geplante Aufnahmedatum.", "Lies Goldstunden- und Blaue-Stunde-Start/-Endzeiten für den Tag."],
      explanationTitle: "Was sind Goldene und Blaue Stunde?",
      formula: "Abgeleitet von Sonnenhöhe ≈ 6° (golden) und −4° bis −6° (blau)",
      explanation: ["Die goldene Stunde ist die Zeit kurz nach Sonnenaufgang und vor Sonnenuntergang mit warmem, weichem, gerichtetem Licht, das Motive und Landschaften schmeichelt.", "Die blaue Stunde folgt, wenn die Sonne knapp unter dem Horizont steht und der Himmel tiefblau wird — ideal für Stadtlandschaften und Langzeitbelichtungen."],
      faq: [
        { q: "Wie lange dauert die goldene Stunde?", a: "Meist 20–60 Minuten je nach Breitengrad und Jahreszeit; näher am Äquator und im Winter bei hohen Breiten länger." },
        { q: "Wofür ist die blaue Stunde?", a: "Ihr gleichmäßiges, kühles Licht und erleuchtete Fenster machen sie ideal für Architektur, Brücken und Spiegelungen nach Sonnenuntergang." },
        { q: "Geht das auch bei Indoor-Porträts?", a: "Das warme Fensterlicht in der goldenen Stunde eignet sich hervorragend für natürliche Indoor-Porträts am Fenster." },
      ],
      metaDescription: "Kostenloser Online-Rechner für die goldene Stunde. Finde Gold- und Blaue-Stunde für Ort und Datum schnell, ohne Anmeldung.",
    },
    ja: {
      steps: ["場所を入力します（または端末の位置情報を使用）。", "撮影予定の日付を選びます。", "その日のゴールデンアワーとブルーアワーの始終を確認します。"],
      explanationTitle: "ゴールデンアワーとブルーアワーとは？",
      formula: "太陽高度 ≈ 6°（ゴールデン）と −4°～−6°（ブルー）から算出",
      explanation: ["ゴールデンアワーは日の出後と日没前の、暖かく柔らかで方向性のある光の時間帯で、被写体や風景を美しく見せます。", "続くブルーアワーは太陽が地平線下に隠れ、空が深い青になる時間。都市景観や長露光に最適です。"],
      faq: [
        { q: "ゴールデンアワーはどのくらい続く？", a: "通常20〜60分。緯度や季節により変わり、赤道近くや高緯度の冬は長めです。" },
        { q: "ブルーアワーの使い道は？", a: "均一なクールな光と点いた窓が、日没後の建築・橋・反射撮影に最適です。" },
        { q: "室内ポートレートにも使えますか？", a: "ゴールデンアワーの暖かい窓光は、窓際の自然な室内ポートレートに最適です。" },
      ],
      metaDescription: "無料のオンラインゴールデンアワー計算機。場所と日付でゴールデン・ブルーアワーをすばやく算出。登録不要。",
    },
    es: {
      steps: ["Introduce tu ubicación (o usa la posición del dispositivo).", "Elige la fecha de la sesión.", "Lee los inicios y fines de la hora dorada y azul para ese día."],
      explanationTitle: "¿Qué son la hora dorada y la azul?",
      formula: "Derivado de elevación solar ≈ 6° (dorada) y −4° a −6° (azul)",
      explanation: ["La hora dorada es el periodo tras el amanecer y antes del atardecer con luz cálida, suave y direccional que favorece sujetos y paisajes.", "La hora azul sigue, cuando el sol está justo bajo el horizonte y el cielo se vuelve azul profundo — perfecta para ciudades y largas exposiciones."],
      faq: [
        { q: "¿Cuánto dura la hora dorada?", a: "Normalmente 20–60 minutos según latitud y estación; más larga cerca del ecuador y en invierno a altas latitudes." },
        { q: "¿Para qué sirve la hora azul?", a: "Su luz fría y uniforme y las ventanas encendidas la hacen ideal para arquitectura, puentes y reflejos tras el atardecer." },
        { q: "¿Sirve para retratos en interior?", a: "La cálida luz de ventana en la hora dorada es excelente para retratos naturales junto a una ventana." },
      ],
      metaDescription: "Calculadora de hora dorada gratis en línea. Halla horas dorada y azul por ubicación y fecha, sin registro, para mejores fotos.",
    },
  },

  "focal-equivalent": {
    en: {
      steps: ["Enter the actual focal length of your lens.", "Enter the camera sensor crop factor (e.g. 1.5 for APS-C).", "Read the full-frame equivalent focal length and its angle of view."],
      explanationTitle: "What Is a Focal Length Equivalent?",
      formula: "equivalent = focal length × crop factor",
      explanation: ["Different sensor sizes capture different fields of view for the same lens. The full-frame equivalent tells you what focal length on a full-frame camera gives the same perspective.", "This makes it easy to compare lenses across camera systems and understand how 'zoomed in' a shot will look."],
      faq: [
        { q: "Why does sensor size matter?", a: "Smaller sensors crop the image, effectively magnifying the focal length, so the same lens looks more zoomed in." },
        { q: "What is a crop factor?", a: "It is the ratio of a full-frame sensor's diagonal to your sensor's diagonal; APS-C is about 1.5, Micro Four Thirds about 2.0." },
        { q: "Does equivalent focal length change depth of field?", a: "Perspective stays the same; only the field of view is matched. Depth of field also changes with sensor size at equal framing." },
      ],
      metaDescription: "Free online focal length equivalent calculator. Convert any lens to full-frame equivalent fast, no signup, compare cameras easily.",
    },
    zh: {
      steps: ["输入镜头实际焦距。", "输入相机传感器的裁切系数（如 APS-C 为 1.5）。", "读取全画幅等效焦距及其视角。"],
      explanationTitle: "什么是等效焦距？",
      formula: "等效焦距 = 焦距 × 裁切系数",
      explanation: ["不同传感器尺寸对同一支镜头呈现的视角不同。全画幅等效焦距表示：在全画幅相机上用多少焦距能获得相同的透视效果。", "这让你可以跨相机系统比较镜头，并直观理解画面的“拉近”程度。"],
      faq: [
        { q: "为什么传感器尺寸重要？", a: "更小的传感器会裁切画面，等效放大焦距，因此同一支镜头看起来更“远”。" },
        { q: "什么是裁切系数？", a: "它是全画幅传感器对角线与你的传感器对角线之比；APS-C 约 1.5，Micro Four Thirds 约 2.0。" },
        { q: "等效焦距会改变景深吗？", a: "透视不变，只匹配视角。在相同构图下，景深也会随传感器尺寸变化。" },
      ],
      metaDescription: "免费在线等效焦距计算器，按任意镜头快速换算全画幅等效值，无需注册，方便跨相机比较。",
    },
    "zh-TW": {
      steps: ["輸入鏡頭實際焦距。", "輸入相機感測器的裁切係數（如 APS-C 為 1.5）。", "讀取全片幅等效焦距及其視角。"],
      explanationTitle: "什麼是等效焦距？",
      formula: "等效焦距 = 焦距 × 裁切係數",
      explanation: ["不同感測器尺寸對同一支鏡頭呈現的視角不同。全片幅等效焦距表示：在全片幅相機上用多少焦距能獲得相同的透視效果。", "這讓你可以跨相機系統比較鏡頭，並直觀理解畫面的「拉近」程度。"],
      faq: [
        { q: "為什麼感測器尺寸重要？", a: "更小的感測器會裁切畫面，等效放大焦距，因此同一支鏡頭看起來更「遠」。" },
        { q: "什麼是裁切係數？", a: "它是全片幅感測器對角線與你的感測器對角線之比；APS-C 約 1.5，Micro Four Thirds 約 2.0。" },
        { q: "等效焦距會改變景深嗎？", a: "透視不變，只匹配視角。在相同構圖下，景深也會隨感測器尺寸變化。" },
      ],
      metaDescription: "免費線上等效焦距計算機，按任意鏡頭快速換算全片幅等效值，無須註冊，方便跨相機比較。",
    },
    de: {
      steps: ["Gib die tatsächliche Brennweite deines Objektivs ein.", "Gib den Crop-Faktor des Sensors ein (z. B. 1,5 für APS-C).", "Lies die Kleinbild-Äquivalenzbrennweite und den Bildwinkel."],
      explanationTitle: "Was ist eine äquivalente Brennweite?",
      formula: "äquivalent = Brennweite × Crop-Faktor",
      explanation: ["Verschiedene Sensorgrößen erfassen bei gleichem Objektiv unterschiedliche Bildwinkel. Die Kleinbild-Äquivalenz sagt, welche Brennweite an Vollformat denselben Blickwinkel gibt.", "So lassen sich Objektive verschiedener Systeme vergleichen und einschätzen, wie stark herangezoomt ein Bild wirkt."],
      faq: [
        { q: "Warum ist die Sensorgröße wichtig?", a: "Kleinere Sensoren beschneiden das Bild und vergrößern die Brennweite effektiv, sodass dasselbe Objektiv weiter herangezoomt wirkt." },
        { q: "Was ist der Crop-Faktor?", a: "Er ist das Verhältnis der Vollformat-Diagonale zur Sensor-Diagonale; APS-C etwa 1,5, Micro Four Thirds etwa 2,0." },
        { q: "Ändert die Äquivalenz die Schärfentiefe?", a: "Die Perspektive bleibt gleich, nur der Bildwinkel wird angepasst. Bei gleicher Bildausschnitt ändert sich auch die Tiefe." },
      ],
      metaDescription: "Kostenloser Online-Rechner für äquivalente Brennweite. Wandle jedes Objektiv schnell auf Vollformat um, ohne Anmeldung.",
    },
    ja: {
      steps: ["レンズの実焦点距離を入力します。", "センサーのクロップ係数を入力します（APS-C は 1.5 など）。", "フルサイズ換算焦点距離と画角を確認します。"],
      explanationTitle: "換算焦点距離とは？",
      formula: "換算値 = 焦点距離 × クロップ係数",
      explanation: ["センサーサイズが違うと同じレンズでも画角が変わります。フルサイズ換算は、フルサイズで同じ画角を得る焦点距離を示します。", "これで異なるカメラ間のレンズ比較や、どれだけ望遠になるかの目安がつきます。"],
      faq: [
        { q: "なぜセンサーサイズが重要？", a: "小さいセンサーは画面を切り取るため実質的に焦点距離が長くなり、同じレンズでも寄って見えます。" },
        { q: "クロップ係数とは？", a: "フルサイズの対角線と自センサーの対角線の比です。APS-C は約1.5、マイクロフォーサーズは約2.0。" },
        { q: "換算焦点距離で被写界深度は変わる？", a: "透視は変わらず画角だけ一致します。同じ構図ではセンサーサイズによって深度も変わります。" },
      ],
      metaDescription: "無料のオンライン換算焦点距離計算機。任意のレンズをフルサイズ換算にすばやく変換。登録不要。",
    },
    es: {
      steps: ["Introduce la distancia focal real de tu objetivo.", "Introduce el factor de recorte del sensor (p. ej. 1,5 para APS-C).", "Lee la focal equivalente a full-frame y su ángulo de visión."],
      explanationTitle: "¿Qué es la focal equivalente?",
      formula: "equivalente = focal × factor de recorte",
      explanation: ["Distintos tamaños de sensor captan distinto campo con el mismo objetivo. La equivalente a full-frame dice qué focal en full-frame da la misma perspectiva.", "Así comparas objetivos entre sistemas y entiendes cuánto 'zoom' tendrá la toma."],
      faq: [
        { q: "¿Por qué importa el tamaño del sensor?", a: "Los sensores pequeños recortan la imagen y amplían la focal, así el mismo objetivo parece más cercano." },
        { q: "¿Qué es el factor de recorte?", a: "Es la razón entre la diagonal full-frame y la de tu sensor; APS-C ≈ 1,5, Micro Four Thirds ≈ 2,0." },
        { q: "¿Cambia la profundidad de campo la focal equivalente?", a: "La perspectiva no cambia, solo se iguala el campo. A igual encuadre, la profundidad también varía con el sensor." },
      ],
      metaDescription: "Calculadora de focal equivalente gratis en línea. Convierte cualquier objetivo a full-frame, sin registro, compara cámaras fácil.",
    },
  },

  "composition": {
    en: {
      steps: ["Choose a composition rule you want to apply (rule of thirds, golden ratio, etc.).", "Enter your image's width and height in pixels or mm.", "Read the key grid lines and placement points to position your subject."],
      explanationTitle: "Why Composition Rules Help",
      formula: "Rule of thirds divides the frame into a 3×3 grid",
      explanation: ["Composition guides place your subject where the eye naturally travels, creating balanced, engaging images instead of a centered, flat look.", "The rule of thirds and the golden ratio are starting points; break them intentionally once you understand why they work."],
      faq: [
        { q: "What is the rule of thirds?", a: "Imagine a 3×3 grid; place key elements on the lines or their intersections to make a photo feel balanced and dynamic." },
        { q: "Is the golden ratio better?", a: "It is a subtler spiral-based guide some find more natural; both are tools, not laws — use what serves the image." },
        { q: "Should I always follow the rules?", a: "No. Learn them, then break them with intent. Centering can be powerful for symmetry and minimalism." },
      ],
      metaDescription: "Free online composition calculator. Get rule-of-thirds and golden-ratio grid points for any frame size fast, no signup, for better photos.",
    },
    zh: {
      steps: ["选择要应用的构图法则（三分法、黄金比例等）。", "输入画面的宽与高（像素或毫米）。", "读取关键网格线与放置点，用于安排主体位置。"],
      explanationTitle: "为什么构图法则有用",
      formula: "三分法将画面分为 3×3 网格",
      explanation: ["构图辅助线把主体放在视线自然经过的位置，形成平衡而富有张力的画面，避免呆板的居中构图。", "三分法与黄金比例是起点；理解其原理后，可有意识地打破它们。"],
      faq: [
        { q: "什么是三分法？", a: "想象一个 3×3 网格，把关键元素放在线条或其交点上，使照片更平衡、更有动感。" },
        { q: "黄金比例更好吗？", a: "它基于更微妙的螺旋，有人觉得更自然；两者都是工具而非定律，服务于画面即可。" },
        { q: "一定要遵守法则吗？", a: "不必。先学会，再有意识地打破。居中对称在极简与对称题材中同样有力。" },
      ],
      metaDescription: "免费在线构图计算器，按任意画幅求出三分法与黄金比例网格点，无需注册，助你拍出更好的照片。",
    },
    "zh-TW": {
      steps: ["選擇要應用的構圖法則（三分法、黃金比例等）。", "輸入畫面的寬與高（像素或毫米）。", "讀取關鍵網格線與放置點，用於安排主體位置。"],
      explanationTitle: "為什麼構圖法則有用",
      formula: "三分法將畫面分為 3×3 網格",
      explanation: ["構圖輔助線把主體放在視線自然經過的位置，形成平衡而富有張力的畫面，避免呆板的居中構圖。", "三分法與黃金比例是起點；理解其原理後，可有意識地打破它們。"],
      faq: [
        { q: "什麼是三分法？", a: "想像一個 3×3 網格，把關鍵元素放在線條或其交點上，使照片更平衡、更有動感。" },
        { q: "黃金比例更好嗎？", a: "它基於更微妙的螺旋，有人覺得更自然；兩者都是工具而非定律，服務於畫面即可。" },
        { q: "一定要遵守法則嗎？", a: "不必。先學會，再有意识地打破。居中對稱在極簡與對稱題材中同樣有力。" },
      ],
      metaDescription: "免費線上構圖計算機，按任意畫幅求出三分法與黃金比例網格點，無須註冊，助你拍出更好的照片。",
    },
    de: {
      steps: ["Wähle eine Kompositionsregel (Drittelregel, Goldener Schnitt u. a.).", "Gib Breite und Höhe des Bildes in Pixeln oder mm ein.", "Lies die wichtigen Linien und Punkte, um dein Motiv zu platzieren."],
      explanationTitle: "Warum Kompositionsregeln helfen",
      formula: "Die Drittelregel teilt das Bild in ein 3×3-Raster",
      explanation: ["Kompositionshilfen platzieren dein Motiv dorthin, wohin das Auge natürlich wandert, und schaffen ausgewogene, spannende Bilder statt flacher Zentrierung.", "Drittelregel und Goldener Schnitt sind Startpunkte; brich sie bewusst, sobald du verstehst, warum sie wirken."],
      faq: [
        { q: "Was ist die Drittelregel?", a: "Stell dir ein 3×3-Raster vor; setze Schlüsselelemente auf Linien oder Schnittpunkte für ein ausgewogenes, dynamisches Bild." },
        { q: "Ist der Goldene Schnitt besser?", a: "Er ist eine feinere, spiralige Hilfe, die manche natürlicher finden; beide sind Werkzeuge, keine Gesetze." },
        { q: "Sollte man die Regeln immer befolgen?", a: "Nein. Lerne sie, dann brich sie mit Absicht. Zentrieren wirkt bei Symmetrie und Minimalismus stark." },
      ],
      metaDescription: "Kostenloser Online-Rechner für Bildkomposition. Hol dir Drittel- und Goldener-Schnitt-Punkte für jede Größe, ohne Anmeldung.",
    },
    ja: {
      steps: ["適用する構図のルールを選びます（三分割、黄金比など）。", "画像の幅と高さをピクセルか mm で入力します。", "主題を置くための重要なグリッド線と配置点を確認します。"],
      explanationTitle: "構図のルールが役立つ理由",
      formula: "三分割は画面を 3×3 のグリッドに分ける",
      explanation: ["構図の補助線は、主題を視線が自然に向かう位置に置き、中央寄せの平坦さを避けてバランスの取れた躍動感のある画を生みます。", "三分割や黄金比は出発点です。仕組みを理解したら、意図的に崩して構いません。"],
      faq: [
        { q: "三分割とは？", a: "3×3 のグリッドを想像し、重要な要素を線や交点に置くと、バランスよく躍動感のある写真になります。" },
        { q: "黄金比の方が良いですか？", a: "らせんに基づく繊細な指針で、自然に感じる人もいます。どちらも法則ではなく道具です。" },
        { q: "ルールは常に守るべき？", a: "いいえ。まず学び、意図を持って破ります。対称やミニマルでは中央寄せも強力です。" },
      ],
      metaDescription: "無料のオンライン構図計算機。任意のサイズで三分割・黄金比のグリッド点をすばやく取得。登録不要。",
    },
    es: {
      steps: ["Elige una regla de composición (regla de tercios, proporción áurea, etc.).", "Introduce el ancho y alto de la imagen en píxeles o mm.", "Lee las líneas y puntos clave para colocar tu sujeto."],
      explanationTitle: "Por qué ayudan las reglas de composición",
      formula: "La regla de tercios divide el encuadre en una cuadrícula 3×3",
      explanation: ["Las guías de composición colocan el sujeto donde la mirada viaja naturalmente, creando imágenes equilibradas en vez de un centro plano.", "La regla de tercios y la proporción áurea son puntos de partida; rompe las a propósito cuando entiendas por qué funcionan."],
      faq: [
        { q: "¿Qué es la regla de tercios?", a: "Imagina una cuadrícula 3×3; pon elementos clave en las líneas o intersecciones para un foto equilibrada y dinámica." },
        { q: "¿Es mejor la proporción áurea?", a: "Es una guía más sutil basada en espiral; ambas son herramientas, no leyes — usa lo que sirva a la imagen." },
        { q: "¿Debo seguir siempre las reglas?", a: "No. Aprende y luego rompe con intención. Centrar puede ser potente en simetría y minimalismo." },
      ],
      metaDescription: "Calculadora de composición gratis en línea. Obtén puntos de tercios y proporción áurea para cualquier tamaño, sin registro.",
    },
  },

  "exchange-rate": {
    en: {
      steps: ["Enter the amount you want to convert.", "Pick the source and target currencies from the lists.", "Read the converted amount using the latest available rate."],
      explanationTitle: "How Exchange Rates Work",
      formula: "amount × rate = converted amount",
      explanation: ["An exchange rate is the price of one currency in another. Rates move constantly with supply, demand, interest rates, and economic news.", "Our calculator uses a recent reference rate for quick estimates; for transactions, your bank or exchange service sets the final rate."],
      faq: [
        { q: "Are the rates live?", a: "The tool uses a recent reference rate for fast estimates. Always confirm the exact rate with your provider before a real transaction." },
        { q: "Why do I get a different rate at the bank?", a: "Banks and exchanges add a spread (margin) on top of the mid-market rate, so the rate you get is slightly worse." },
        { q: "Which currencies are supported?", a: "Major fiat pairs such as USD, EUR, GBP, JPY, CNY and CHF are supported for quick reference conversions." },
      ],
      metaDescription: "Free online exchange rate calculator. Convert currencies fast with recent rates, no signup, supports USD EUR GBP JPY CNY CHF and more.",
    },
    zh: {
      steps: ["输入要换算的金额。", "从列表中选择源货币与目标货币。", "使用最新可得汇率读取换算结果。"],
      explanationTitle: "汇率如何运作",
      formula: "金额 × 汇率 = 换算金额",
      explanation: ["汇率是一种货币兑换另一种货币的价格，会随供求、利率与经济新闻不断变化。", "本计算器采用近期参考汇率用于快速估算；实际交易以你的银行或兑换机构最终报价为准。"],
      faq: [
        { q: "汇率是实时的吗？", a: "工具使用近期参考汇率进行快速估算。实际交易前请务必向你的服务方确认精确汇率。" },
        { q: "为什么银行给的汇率不同？", a: "银行与兑换机构会在中间价之上加价差（点差），因此你拿到的汇率略差。" },
        { q: "支持哪些货币？", a: "支持 USD、EUR、GBP、JPY、CNY、CHF 等主要法币对的快速参考换算。" },
      ],
      metaDescription: "免费在线汇率计算器，使用近期汇率快速换算，无需注册，支持美元欧元英镑日元人民币瑞郎等。",
    },
    "zh-TW": {
      steps: ["輸入要換算的金額。", "從清單中選擇源貨幣與目標貨幣。", "使用最新可得匯率讀取換算結果。"],
      explanationTitle: "匯率如何運作",
      formula: "金額 × 匯率 = 換算金額",
      explanation: ["匯率是一種貨幣兌換另一種貨幣的價格，會隨供求、利率與經濟新聞不斷變化。", "本計算機採用近期參考匯率用於快速估算；實際交易以你的銀行或兌換機構最終報價為準。"],
      faq: [
        { q: "匯率是即時的嗎？", a: "工具使用近期參考匯率進行快速估算。實際交易前請務必向你的服務方確認精確匯率。" },
        { q: "為什麼銀行給的匯率不同？", a: "銀行與兌換機構會在中間價之上加價差（點差），因此你拿到的匯率略差。" },
        { q: "支援哪些貨幣？", a: "支援 USD、EUR、GBP、JPY、CNY、CHF 等主要法幣對的快速參考換算。" },
      ],
      metaDescription: "免費線上匯率計算機，使用近期匯率快速換算，無須註冊，支援美元歐元英鎊日圓人民幣瑞郎等。",
    },
    de: {
      steps: ["Gib den zu konvertierenden Betrag ein.", "Wähle Ausgangs- und Zielwährung aus den Listen.", "Lies den umgerechneten Betrag mit dem aktuell verfügbaren Kurs."],
      explanationTitle: "Wie Wechselkurse funktionieren",
      formula: "Betrag × Kurs = umgerechneter Betrag",
      explanation: ["Ein Wechselkurs ist der Preis einer Währung in einer anderen. Er ändert sich ständig mit Angebot, Nachfrage, Zinsen und Wirtschaftsnachrichten.", "Unser Rechner nutzt einen aktuellen Referenzkurs für schnelle Schätzungen; bei Transaktionen legt deine Bank den Endkurs fest."],
      faq: [
        { q: "Sind die Kurse live?", a: "Das Tool nutzt einen aktuellen Referenzkurs für schnelle Schätzungen. Bestätige den genauen Kurs bei deinem Anbieter vor der Transaktion." },
        { q: "Warum bekomme ich eine andere Rate bei der Bank?", a: "Banken und Wechselstuben schlagen eine Marge auf den Marktpreis auf, sodass dein Kurs etwas schlechter ist." },
        { q: "Welche Währungen werden unterstützt?", a: "Wichtige Paare wie USD, EUR, GBP, JPY, CNY und CHF für schnelle Referenzumrechnungen." },
      ],
      metaDescription: "Kostenloser Online-Wechselkursrechner. Rechne Währungen schnell mit aktuellen Kursen um, ohne Anmeldung, USD EUR GBP JPY CNY CHF u. a.",
    },
    ja: {
      steps: ["換算したい金額を入力します。", "リストから元の通貨と目標通貨を選びます。", "最新の為替レートで換算結果を確認します。"],
      explanationTitle: "為替レートの仕組み",
      formula: "金額 × レート = 換算金額",
      explanation: ["為替レートは通貨を別の通貨で表した価格で、供給・需要・金利・経済ニュースで絶えず変動します。", "当計算機は最近の参考レートで素早く見積もります。取引の最終レートは銀行や両替業者が決定します。"],
      faq: [
        { q: "レートはリアルタイムですか？", a: "ツールは最近の参考レートで素早く見積もります。実取引前は必ず提供元で正確なレートを確認してください。" },
        { q: "なぜ銀行のレートが違うのですか？", a: "銀行や両替所は仲値にスプレッド（幅）を上乗せするため、取得レートはやや不利になります。" },
        { q: "どの通貨に対応していますか？", a: "USD・EUR・GBP・JPY・CNY・CHF などの主要通貨ペアを参考換算できます。" },
      ],
      metaDescription: "無料のオンライン為替計算機。最近のレートで通貨をすばやく換算。登録不要、USD/EUR/GBP/JPY/CNY/CHF 対応。",
    },
    es: {
      steps: ["Introduce la cantidad a convertir.", "Elige la moneda origen y destino de las listas.", "Lee el importe convertido con el tipo disponible más reciente."],
      explanationTitle: "Cómo funcionan los tipos de cambio",
      formula: "importe × tipo = importe convertido",
      explanation: ["Un tipo de cambio es el precio de una moneda en otra. Se mueve constantemente con oferta, demanda, tipos de interés y noticias económicas.", "Nuestra calculadora usa un tipo de referencia reciente para estimaciones rápidas; en transacciones tu banco fija el tipo final."],
      faq: [
        { q: "¿Los tipos son en vivo?", a: "La herramienta usa un tipo de referencia reciente para estimaciones rápidas. Confirma el tipo exacto con tu proveedor antes de transaccionar." },
        { q: "¿Por qué el banco me da otro tipo?", a: "Bancos y casas de cambio añaden un margen sobre el precio medio, así que tu tipo es algo peor." },
        { q: "¿Qué monedas se admiten?", a: "Pares fiat principales como USD, EUR, GBP, JPY, CNY y CHF para conversiones de referencia rápidas." },
      ],
      metaDescription: "Calculadora de divisas gratis en línea. Convierte monedas rápido con tipos recientes, sin registro, USD EUR GBP JPY CNY CHF y más.",
    },
  },

  "hash-calculator": {
    en: {
      steps: ["Type or paste the text or file content you want to hash.", "Choose the algorithm (MD5, SHA-1, SHA-256, SHA-512).", "Copy the resulting digest to verify integrity or store a fingerprint."],
      explanationTitle: "What Is a Hash?",
      formula: "hash(message) → fixed-length digest",
      explanation: ["A hash function turns any input into a fixed-length string. The same input always produces the same digest, but a tiny change completely changes the output.", "Hashes verify file integrity, store passwords safely, and power blockchains and digital signatures."],
      faq: [
        { q: "Which algorithm should I use?", a: "Use SHA-256 or SHA-512 for security. MD5 and SHA-1 are fast but broken for security and only okay for checksums." },
        { q: "Can I recover the original text from a hash?", a: "No. Hashing is one-way; you cannot reverse it. That is why it is safe for storing passwords." },
        { q: "Why does changing one character change everything?", a: "Hash functions are designed to be avalanche-sensitive: a single bit change spreads to a completely different digest." },
      ],
      metaDescription: "Free online hash calculator. Generate MD5, SHA-1, SHA-256, SHA-512 digests from text or files fast, no signup, for integrity checks.",
    },
    zh: {
      steps: ["输入或粘贴要哈希的文本或文件内容。", "选择算法（MD5、SHA-1、SHA-256、SHA-512）。", "复制生成的摘要，用于校验完整性或保存指纹。"],
      explanationTitle: "什么是哈希？",
      formula: "hash(消息) → 固定长度摘要",
      explanation: ["哈希函数把任意输入转换为固定长度的字符串。相同输入始终产生相同摘要，但微小改动会让输出完全不同。", "哈希用于校验文件完整性、安全存储密码，也是区块链与数字签名的基础。"],
      faq: [
        { q: "应该用哪种算法？", a: "安全用途选 SHA-256 或 SHA-512。MD5 与 SHA-1 速度快但已不安全，仅适合校验和。" },
        { q: "能从哈希反推原文吗？", a: "不能。哈希是单向的，无法逆向还原，这正是它适合存储密码的原因。" },
        { q: "为什么改动一个字符就完全不同？", a: "哈希函数被设计为“雪崩效应”：单个比特的变化会扩散成完全不同的摘要。" },
      ],
      metaDescription: "免费在线哈希计算器，从文本或文件快速生成 MD5、SHA-1、SHA-256、SHA-512 摘要，无需注册，用于完整性校验。",
    },
    "zh-TW": {
      steps: ["輸入或貼上要雜湊的文字或檔案內容。", "選擇演算法（MD5、SHA-1、SHA-256、SHA-512）。", "複製產生的摘要，用於校驗完整性或保存指紋。"],
      explanationTitle: "什麼是雜湊（哈希）？",
      formula: "hash(訊息) → 固定長度摘要",
      explanation: ["雜湊函數把任意輸入轉換為固定長度的字串。相同輸入始終產生相同摘要，但微小改動會讓輸出完全不同。", "雜湊用於校驗檔案完整性、安全儲存密碼，也是區塊鏈與數位簽章的基礎。"],
      faq: [
        { q: "應該用哪種演算法？", a: "安全用途選 SHA-256 或 SHA-512。MD5 與 SHA-1 速度快但已不安全，僅適合校驗和。" },
        { q: "能從雜湊反推原文嗎？", a: "不能。雜湊是單向的，無法逆向還原，這正是它適合儲存密碼的原因。" },
        { q: "為什麼改動一個字元就完全不同？", a: "雜湊函數被設計為「雪崩效應」：單一比特的變化會擴散成完全不同的摘要。" },
      ],
      metaDescription: "免費線上雜湊計算機，從文字或檔案快速生成 MD5、SHA-1、SHA-256、SHA-512 摘要，無須註冊，用於完整性校驗。",
    },
    de: {
      steps: ["Tippe oder füge den Text oder Dateiinhalt ein, den du hashen willst.", "Wähle den Algorithmus (MD5, SHA-1, SHA-256, SHA-512).", "Kopiere den Digest, um Integrität zu prüfen oder einen Fingerabdruck zu speichern."],
      explanationTitle: "Was ist ein Hash?",
      formula: "hash(Nachricht) → Digest fester Länge",
      explanation: ["Eine Hash-Funktion wandelt beliebige Eingaben in eine Zeichenkette fester Länge um. Gleiche Eingabe liefert immer denselben Digest, eine kleine Änderung ändert die Ausgabe völlig.", "Hashes prüfen Dateiintegrität, speichern Passwörter sicher und bilden die Basis von Blockchains und digitalen Signaturen."],
      faq: [
        { q: "Welchen Algorithmus soll ich nutzen?", a: "Für Sicherheit SHA-256 oder SHA-512. MD5 und SHA-1 sind schnell, aber unsicher, und nur für Checksummen okay." },
        { q: "Kann man den Text aus dem Hash rekonstruieren?", a: "Nein. Hashing ist einweg; man kann es nicht umkehren. Das macht es sicher für Passwörter." },
        { q: "Warum ändert ein Zeichen alles?", a: "Hash-Funktionen sind avalanche-empfindlich: ein einziges Bit breitet sich zu einem völlig anderen Digest aus." },
      ],
      metaDescription: "Kostenloser Online-Hash-Rechner. Erzeuge MD5-, SHA-1-, SHA-256-, SHA-512-Digests aus Text oder Dateien schnell, ohne Anmeldung.",
    },
    ja: {
      steps: ["ハッシュ化したいテキストやファイル内容を入力・貼り付けします。", "アルゴリズム（MD5・SHA-1・SHA-256・SHA-512）を選びます。", "整合性確認や指紋保存用にダイジェストをコピーします。"],
      explanationTitle: "ハッシュとは？",
      formula: "hash(メッセージ) → 固定長ダイジェスト",
      explanation: ["ハッシュ関数は任意の入力を固定長の文字列に変換します。同じ入力は常に同じダイジェストになりますが、わずかな変更で出力は大きく変わります。", "ハッシュはファイルの整合性確認、パスワードの安全な保存、ブロックチェーンや電子署名の基盤となります。"],
      faq: [
        { q: "どのアルゴリズムを使うべき？", a: "セキュリティには SHA-256 か SHA-512 を。MD5 と SHA-1 は速いものの破られており、チェックサム程度にとどめてください。" },
        { q: "ハッシュから元のテキストを復元できますか？", a: "できません。ハッシュは一方向であり逆変換できないため、パスワード保存に適しています。" },
        { q: "なぜ1文字変えると全く変わるのですか？", a: "ハッシュ関数は雪崩特性を持ち、1ビットの変化が全く別のダイジェストに広がるためです。" },
      ],
      metaDescription: "無料のオンラインハッシュ計算機。テキストやファイルから MD5/SHA-1/SHA-256/SHA-512 をすばやく生成。登録不要。",
    },
    es: {
      steps: ["Escribe o pega el texto o contenido de archivo que quieres hashear.", "Elige el algoritmo (MD5, SHA-1, SHA-256, SHA-512).", "Copia el digest para verificar integridad o guardar una huella."],
      explanationTitle: "¿Qué es un hash?",
      formula: "hash(mensaje) → resumen de longitud fija",
      explanation: ["Una función hash convierte cualquier entrada en una cadena de longitud fija. La misma entrada da siempre el mismo resumen, pero un pequeño cambio altera totalmente la salida.", "Los hashes verifican integridad de archivos, guardan contraseñas con seguridad y alimentan blockchains y firmas digitales."],
      faq: [
        { q: "¿Qué algoritmo uso?", a: "Para seguridad, SHA-256 o SHA-512. MD5 y SHA-1 son rápidos pero rotos; solo valen para sumas de comprobación." },
        { q: "¿Puedo recuperar el texto original de un hash?", a: "No. El hashing es unidireccional; no se puede invertir. Por eso es seguro para contraseñas." },
        { q: "¿Por qué un carácter cambia todo?", a: "Las funciones hash son sensibles a avalancha: un bit cambia se extiende a un resumen completamente distinto." },
      ],
      metaDescription: "Calculadora de hash gratis en línea. Genera MD5, SHA-1, SHA-256, SHA-512 desde texto o archivos, sin registro, para integridad.",
    },
  },

  "wallet-validator": {
    en: {
      steps: ["Paste the crypto wallet address you want to check.", "Choose the blockchain (Bitcoin, Ethereum, etc.).", "Read whether the format and checksum are valid."],
      explanationTitle: "Why Validate a Wallet Address?",
      formula: "address → checksum + format verification",
      explanation: ["A wallet address is a public identifier for receiving funds. A single wrong character sends money to the wrong place with no recovery.", "Validation checks the address length, character set, and checksum so you catch typos before sending."],
      faq: [
        { q: "Does validation confirm the owner?", a: "No. It only confirms the address is well-formed. It cannot tell you who controls it." },
        { q: "Can a valid address be wrong?", a: "Yes — it may be valid but belong to someone else. Always confirm the full address with the recipient." },
        { q: "Which blockchains are supported?", a: "Common ones like Bitcoin (Base58Check), Ethereum (EIP-55 checksum), and similar formats are verified." },
      ],
      metaDescription: "Free online wallet address validator. Check Bitcoin, Ethereum and more addresses for valid format and checksum fast, no signup.",
    },
    zh: {
      steps: ["粘贴要检查的加密货币钱包地址。", "选择区块链（比特币、以太坊等）。", "读取格式与校验和是否有效。"],
      explanationTitle: "为什么要校验钱包地址？",
      formula: "地址 → 校验和与格式验证",
      explanation: ["钱包地址是接收资金的公开标识。哪怕错一个字符，资金也会发到无法找回的错误地址。", "校验会检查地址长度、字符集与校验和，让你在转账前发现输入错误。"],
      faq: [
        { q: "校验能确认所有者吗？", a: "不能。它只确认地址格式正确，无法告诉你由谁控制。" },
        { q: "校验通过的地址也可能错吗？", a: "可能。它格式有效但可能属于他人，请务必与接收方核对完整地址。" },
        { q: "支持哪些区块链？", a: "支持比特币（Base58Check）、以太坊（EIP-55 校验和）等常见格式。" },
      ],
      metaDescription: "免费在线钱包地址校验器，快速检查比特币、以太坊等地址的格式与校验和是否有效，无需注册。",
    },
    "zh-TW": {
      steps: ["貼上要檢查的加密貨幣錢包地址。", "選擇區塊鏈（比特幣、以太坊等）。", "讀取格式與校驗和是否有效。"],
      explanationTitle: "為什麼要校驗錢包地址？",
      formula: "地址 → 校驗和與格式驗證",
      explanation: ["錢包地址是接收資金的公開標識。哪怕錯一個字元，資金也會發到無法找回的錯誤地址。", "校驗會檢查地址長度、字元集與校驗和，讓你在轉帳前發現輸入錯誤。"],
      faq: [
        { q: "校驗能確認擁有者嗎？", a: "不能。它只確認地址格式正確，無法告訴你由誰控制。" },
        { q: "校驗通過的地址也可能錯嗎？", a: "可能。它格式有效但可能屬於他人，請務必與接收方核對完整地址。" },
        { q: "支援哪些區塊鏈？", a: "支援比特幣（Base58Check）、以太坊（EIP-55 校驗和）等常見格式。" },
      ],
      metaDescription: "免費線上錢包地址校驗器，快速檢查比特幣、以太坊等地址的格式與校驗和是否有效，無須註冊。",
    },
    de: {
      steps: ["Füge die zu prüfende Krypto-Wallet-Adresse ein.", "Wähle die Blockchain (Bitcoin, Ethereum usw.).", "Lies, ob Format und Prüfsumme gültig sind."],
      explanationTitle: "Warum eine Wallet-Adresse validieren?",
      formula: "Adresse → Prüfsummen- und Formatprüfung",
      explanation: ["Eine Wallet-Adresse ist ein öffentlicher Empfangsbezeichner. Ein falsches Zeichen schickt Geld an den falschen Ort, ohne Wiederherstellung.", "Die Validierung prüft Länge, Zeichensatz und Prüfsumme, damit Tippfehler vor dem Senden auffallen."],
      faq: [
        { q: "Bestätigt die Prüfung den Besitzer?", a: "Nein. Sie bestätigt nur, dass die Adresse wohlgeformt ist, nicht wer sie kontrolliert." },
        { q: "Kann eine gültige Adresse trotzdem falsch sein?", a: "Ja — sie kann gültig, aber von jemand anderem sein. Immer die volle Adresse mit dem Empfänger abgleichen." },
        { q: "Welche Blockchains werden unterstützt?", a: "Gängige wie Bitcoin (Base58Check), Ethereum (EIP-55-Prüfsumme) und ähnliche Formate." },
      ],
      metaDescription: "Kostenloser Online-Validator für Wallet-Adressen. Prüfe Bitcoin-, Ethereum- und weitere Adressen auf Format und Prüfsumme, ohne Anmeldung.",
    },
    ja: {
      steps: ["チェックしたい暗号資産ウォレットアドレスを貼り付けます。", "ブロックチェーン（ビットコイン、イーサリアム等）を選びます。", "形式とチェックサムが有効かを確認します。"],
      explanationTitle: "なぜウォレットアドレスを検証するのか",
      formula: "アドレス → チェックサムと形式検証",
      explanation: ["ウォレットアドレスは資金を受け取る公開識別子です。1文字間違えるだけで資金は回復不能な間違った先へ送られます。", "検証では長さ・文字セット・チェックサムを確認し、送信前に入力ミスに気づけます。"],
      faq: [
        { q: "検証で所有者がわかりますか？", a: "いいえ。アドレスが正しい形式かだけを示し、誰が管理しているかは分かりません。" },
        { q: "検証を通ったアドレスも間違っている可能性は？", a: "あります。形式は正しくても別人のものかもしれません。必ず受取人と全文を照合してください。" },
        { q: "どのブロックチェーンに対応？", a: "ビットコイン（Base58Check）、イーサリアム（EIP-55 チェックサム）など一般的な形式に対応。" },
      ],
      metaDescription: "無料のオンラインウォレットアドレス検証ツール。ビットコイン・イーサリアム等の形式とチェックサムをすばやく確認。登録不要。",
    },
    es: {
      steps: ["Pega la dirección de wallet cripto que quieres comprobar.", "Elige la blockchain (Bitcoin, Ethereum, etc.).", "Lee si el formato y la suma de verificación son válidos."],
      explanationTitle: "¿Por qué validar una dirección de wallet?",
      formula: "dirección → verificación de formato y checksum",
      explanation: ["Una dirección de wallet es un identificador público para recibir fondos. Un carácter erróneo envía el dinero al lugar equivocado sin recuperación.", "La validación comprueba longitud, juego de caracteres y checksum para detectar erratas antes de enviar."],
      faq: [
        { q: "¿La validación confirma el dueño?", a: "No. Solo confirma que la dirección tiene el formato correcto, no quién la controla." },
        { q: "¿Una dirección válida puede estar mal?", a: "Sí — puede ser válida pero de otro. Confirma siempre la dirección completa con el receptor." },
        { q: "¿Qué blockchains se admiten?", a: "Comunes como Bitcoin (Base58Check), Ethereum (checksum EIP-55) y formatos similares." },
      ],
      metaDescription: "Validador de direcciones de wallet gratis en línea. Comprueba formato y checksum de Bitcoin, Ethereum y más, sin registro.",
    },
  },

  "mining-calculator": {
    en: {
      steps: ["Enter your hardware hashrate and power consumption.", "Enter your electricity cost per kWh and the coin's network difficulty.", "Read the estimated daily, weekly, and monthly profit after power costs."],
      explanationTitle: "What Drives Mining Profit?",
      formula: "profit = (reward × price) − (power × hours × price/kWh)",
      explanation: ["Mining profit depends on your hardware's hashrate, the coin price, network difficulty, and your electricity cost. Higher difficulty means less reward per unit of work.", "Profitability changes daily with price and difficulty, so estimates are snapshots, not guarantees."],
      faq: [
        { q: "Why does profit change daily?", a: "Coin price and network difficulty move constantly, and your reward is shared among all miners on the network." },
        { q: "Is electricity the main cost?", a: "Usually yes. For many GPUs and ASICs, power cost decides whether mining is profitable at all." },
        { q: "Does the calculator include pool fees?", a: "You can add a pool fee percentage; the estimate then subtracts it from gross rewards for a realistic net figure." },
      ],
      metaDescription: "Free online crypto mining calculator. Estimate profit from hashrate, power and electricity cost fast, no signup, with daily and monthly views.",
    },
    zh: {
      steps: ["输入设备的算力与功耗。", "输入每千瓦时电费与币的网络难度。", "读取扣除电费后的日、周、月预估收益。"],
      explanationTitle: "什么决定挖矿收益？",
      formula: "收益 = (奖励 × 币价) − (功耗 × 小时 × 电价/千瓦时)",
      explanation: ["挖矿收益取决于设备算力、币价、网络难度与电费。难度越高，单位算力的奖励越少。", "收益会随价格与难度每日变化，因此估算只是某一时刻的快照，并非保证。"],
      faq: [
        { q: "为什么收益每天在变？", a: "币价与网络难度不断变化，且奖励由全网矿工共享。" },
        { q: "电费是主要成本吗？", a: "通常是。对多数 GPU 与 ASIC 而言，电费决定了挖矿是否划算。" },
        { q: "计算器包含矿池手续费吗？", a: "你可以填入矿池费率，估算会从中扣除，得到更真实的净收益。" },
      ],
      metaDescription: "免费在线挖矿收益计算器，按算力、功耗与电费快速估算收益，无需注册，提供日与月的视图。",
    },
    "zh-TW": {
      steps: ["輸入設備的算力與功耗。", "輸入每千瓦時電費與幣的網路難度。", "讀取扣除電費後的日、週、月預估收益。"],
      explanationTitle: "什麼決定挖礦收益？",
      formula: "收益 = (獎勵 × 幣價) − (功耗 × 小時 × 電價/千瓦時)",
      explanation: ["挖礦收益取決於設備算力、幣價、網路難度與電費。難度越高，單位算力的獎勵越少。", "收益會隨價格與難度每日變化，因此估算只是某一時刻的快照，並非保證。"],
      faq: [
        { q: "為什麼收益每天在變？", a: "幣價與網路難度不斷變化，且獎勵由全網礦工共享。" },
        { q: "電費是主要成本嗎？", a: "通常是。對多數 GPU 與 ASIC 而言，電費決定了挖礦是否划算。" },
        { q: "計算機包含礦池手續費嗎？", a: "你可以填入礦池費率，估算會從中扣除，得到更真實的淨收益。" },
      ],
      metaDescription: "免費線上挖礦收益計算機，按算力、功耗與電費快速估算收益，無須註冊，提供日與月的視圖。",
    },
    de: {
      steps: ["Gib die Hashrate und den Stromverbrauch deiner Hardware ein.", "Gib die Stromkosten pro kWh und die Netzwerkschwierigkeit der Coins ein.", "Lies den geschätzten täglichen, wöchentlichen und monatlichen Gewinn abzüglich Strom."],
      explanationTitle: "Was bestimmt den Mining-Gewinn?",
      formula: "Gewinn = (Belohnung × Preis) − (Leistung × Stunden × Preis/kWh)",
      explanation: ["Der Mining-Gewinn hängt von Hashrate, Coin-Preis, Netzwerkschwierigkeit und Stromkosten ab. Höhere Schwierigkeit bedeutet weniger Belohnung pro Arbeit.", "Die Rentabilität ändert sich täglich mit Preis und Schwierigkeit; Schätzungen sind Momentaufnahmen, keine Garantie."],
      faq: [
        { q: "Warum ändert sich der Gewinn täglich?", a: "Coin-Preis und Schwierigkeit bewegen sich ständig, und die Belohnung wird unter allen Minern geteilt." },
        { q: "Ist Strom die Hauptkosten?", a: "Meist ja. Bei vielen GPUs und ASICs entscheidet die Stromkosten, ob Mining überhaupt lohnt." },
        { q: "Berücksichtigt der Rechner Poolgebühren?", a: "Du kannst einen Pool-Prozentsatz eingeben; die Schätzung zieht ihn von den Brutto-Belohnungen ab." },
      ],
      metaDescription: "Kostenloser Online-Mining-Rechner. Schätze Gewinn aus Hashrate, Leistung und Stromkosten schnell, ohne Anmeldung, täglich und monatlich.",
    },
    ja: {
      steps: ["機器のハッシュレートと消費電力を入力します。", "1kWhあたりの電気代とコインのネットワーク難易度を入力します。", "電気代差し引き後の日・週・月の想定利益を確認します。"],
      explanationTitle: "マイニング利益を決めるもの",
      formula: "利益 = (報酬 × 価格) − (電力 × 時間 × 価格/kWh)",
      explanation: ["マイニングの利益はハッシュレート、コイン価格、ネットワーク難易度、電気代に依存します。難易度が高いほど単位あたりの報酬は減ります。", "利益は価格と難易度で日々変動するため、推定はある瞬間のスナップショットであり保証ではありません。"],
      faq: [
        { q: "なぜ利益は毎日変わるのですか？", a: "コイン価格と難易度は絶えず動き、報酬はネットワーク上の全マイナーで分配されるからです。" },
        { q: "電気代が主なコストですか？", a: "たいていそうです。多くのGPUやASICでは電気代がマイニングの採算を決めます。" },
        { q: "計算機はプール手数料を含みますか？", a: "プール手数料の割合を入力でき、推定から差し引いて実際に近い純利益を出します。" },
      ],
      metaDescription: "無料のオンラインマイニング計算機。ハッシュレート・消費電力・電気代から利益をすばやく推定。登録不要。",
    },
    es: {
      steps: ["Introduce la tasa de hash y el consumo de tu hardware.", "Introduce el coste de electricidad por kWh y la dificultad de la red.", "Lee el beneficio diario, semanal y mensual estimado tras restar la luz."],
      explanationTitle: "¿Qué mueve el beneficio del minado?",
      formula: "beneficio = (recompensa × precio) − (potencia × horas × precio/kWh)",
      explanation: ["El beneficio del minado depende de la tasa de hash, el precio de la moneda, la dificultad de red y tu coste eléctrico. Más dificultad significa menos recompensa por trabajo.", "La rentabilidad cambia cada día con precio y dificultad; las estimaciones son instantáneas, no garantías."],
      faq: [
        { q: "¿Por qué el beneficio cambia diario?", a: "El precio y la dificultad se mueven constantemente y tu recompensa se comparte con todos los mineros." },
        { q: "¿Es la luz el coste principal?", a: "Suele serlo. En muchas GPUs y ASIC el coste eléctrico decide si minar es rentable." },
        { q: "¿El calculador incluye comisiones de pool?", a: "Puedes añadir un porcentaje; la estimación lo resta de las recompensas brutas para un neto realista." },
      ],
      metaDescription: "Calculadora de minado cripto gratis en línea. Estima beneficio por hashrate, potencia y luz, sin registro, con vistas diaria y mensual.",
    },
  },
};

const langs = ["en", "zh", "zh-TW", "de", "ja", "es"];
const files = {
  en: "src/messages/en.json",
  zh: "src/messages/zh.json",
  "zh-TW": "src/messages/zh-TW.json",
  de: "src/messages/de.json",
  ja: "src/messages/ja.json",
  es: "src/messages/es.json",
};

let total = 0;
for (const lang of langs) {
  const f = files[lang];
  const j = JSON.parse(fs.readFileSync(f, "utf8"));
  for (const id of Object.keys(G)) {
    const g = G[id][lang];
    if (!g) { console.error(`MISSING lang ${lang} for ${id}`); process.exit(1); }
    if (!j.converter[id]) j.converter[id] = {};
    j.converter[id].guide = {
      steps: g.steps,
      explanationTitle: g.explanationTitle,
      formula: g.formula,
      explanation: g.explanation,
      faq: g.faq,
    };
    j.converter[id].metaDescription = g.metaDescription;
    total++;
  }
  fs.writeFileSync(f, JSON.stringify(j, null, 2) + "\n");
}
console.log(`Injected ${total} guide sets (photo 6 + crypto 4 = 10 tools x 6 langs).`);
