import fs from "node:fs";

// Batch 6 — Math tools (8). A-layer guides in 6 languages + improved metaDescription.
// Each language object: { steps:[3], explanationTitle, formula?, explanation:[2-3], faq:[3], metaDescription }
const G = {
  "standard-deviation": {
    en: {
      steps: [
        "Enter your data set as a list of numbers separated by commas.",
        "Choose whether it is a population or a sample.",
        "Read the result: the calculator shows the standard deviation and the variance.",
      ],
      explanationTitle: "What Is Standard Deviation?",
      formula: "σ = √( Σ(xᵢ − μ)² / N )   (population)",
      explanation: [
        "Standard deviation measures how spread out the values in a data set are around the mean. A small value means the numbers are clustered closely together, while a large value means they vary widely.",
        "Use it to compare consistency between groups, assess risk in finance, or understand variation in test scores and scientific measurements.",
      ],
      faq: [
        { q: "Population or sample — which should I pick?", a: "Use population when you have every member of the group (e.g. all students in a class). Use sample when your data is only a subset and you want to estimate the whole population." },
        { q: "Why is the sample standard deviation larger?", a: "The sample formula divides by n−1 instead of n, which corrects the bias from estimating the mean from the same data, giving a slightly larger, more honest spread." },
        { q: "What unit is the result in?", a: "The standard deviation always uses the same unit as your original data, which makes it easy to interpret alongside the mean." },
      ],
      metaDescription: "Free online standard deviation calculator. Find population or sample SD and variance fast, no signup, with clear formula and examples.",
    },
    zh: {
      steps: ["输入您的数据集，多个数字用逗号分隔。", "选择是总体（population）还是样本（sample）。", "查看结果：计算器显示标准差与方差。"],
      explanationTitle: "什么是标准差？",
      formula: "σ = √( Σ(xᵢ − μ)² / N )   （总体）",
      explanation: ["标准差衡量一组数据相对于平均值的离散程度。数值越小，说明数据越集中；数值越大，说明波动越大。", "它可用于比较不同组的一致性、评估金融风险，或理解考试成绩与科学测量中的变异程度。"],
      faq: [
        { q: "总体还是样本，应该选哪个？", a: "当您拥有该组的全部成员（例如一个班级的所有学生）时选总体；当数据只是子集、想估计整体时使用样本。" },
        { q: "为什么样本标准差更大？", a: "样本公式除以 n−1 而非 n，这修正了用同一组数据估计均值带来的偏差，得到的离散度更公正、略大。" },
        { q: "结果的单位是什么？", a: "标准差始终与原始数据单位一致，因此可方便地与平均值一起解读。" },
      ],
      metaDescription: "免费在线标准差计算器，快速求总体或样本标准差与方差，无需注册，附清晰公式与示例。",
    },
    "zh-TW": {
      steps: ["輸入您的資料集，多個數字用逗號分隔。", "選擇是母體（population）還是樣本（sample）。", "檢視結果：計算機顯示標準差與變異數。"],
      explanationTitle: "什麼是標準差？",
      formula: "σ = √( Σ(xᵢ − μ)² / N )   （母體）",
      explanation: ["標準差衡量一組資料相對於平均值的離散程度。數值越小，說明資料越集中；數值越大，說明波動越大。", "它可用於比較不同組的一致性、評估金融風險，或理解考試成績與科學測量中的變異程度。"],
      faq: [
        { q: "母體還是樣本，應該選哪個？", a: "當您擁有該組的全部成員（例如一個班級的所有學生）時選母體；當資料只是子集、想估計整體時使用樣本。" },
        { q: "為什麼樣本標準差更大？", a: "樣本公式除以 n−1 而非 n，這修正了用同一組資料估計均值帶來的偏差，得到的離散度更公正、略大。" },
        { q: "結果的單位是什麼？", a: "標準差始終與原始資料單位一致，因此可方便地與平均值一起解讀。" },
      ],
      metaDescription: "免費線上標準差計算機，快速求母體或樣本標準差與變異數，無須註冊，附清晰公式與範例。",
    },
    de: {
      steps: ["Geben Sie Ihren Datensatz als durch Kommas getrennte Zahlenliste ein.", "Wählen Sie, ob es sich um eine Grundgesamtheit oder eine Stichprobe handelt.", "Lesen Sie das Ergebnis: Der Rechner zeigt Standardabweichung und Varianz."],
      explanationTitle: "Was ist die Standardabweichung?",
      formula: "σ = √( Σ(xᵢ − μ)² / N )   (Grundgesamtheit)",
      explanation: ["Die Standardabweichung misst, wie stark sich die Werte eines Datensatzes um den Mittelwert streuen. Ein kleiner Wert bedeutet, dass die Zahlen eng beieinanderliegen, ein großer Wert deutet auf starke Schwankungen hin.", "Sie wird genutzt, um Konsistenz zwischen Gruppen zu vergleichen, Finanzrisiken einzuschätzen oder Variationen bei Testergebnissen und Messungen zu verstehen."],
      faq: [
        { q: "Grundgesamtheit oder Stichprobe — was wähle ich?", a: "Wählen Sie Grundgesamtheit, wenn Sie alle Mitglieder der Gruppe haben (z. B. alle Schüler einer Klasse). Wählen Sie Stichprobe, wenn Ihre Daten nur eine Teilmenge sind und Sie die Gesamtheit schätzen möchten." },
        { q: "Warum ist die Stichproben-Standardabweichung größer?", a: "Die Stichprobenformel teilt durch n−1 statt n, was den Bias korrigiert, der durch die Schätzung des Mittelwerts aus denselben Daten entsteht, und liefert eine leicht größere, ehrlichere Streuung." },
        { q: "In welcher Einheit ist das Ergebnis?", a: "Die Standardabweichung hat immer dieselbe Einheit wie Ihre Originaldaten, was die Interpretation zusammen mit dem Mittelwert erleichtert." },
      ],
      metaDescription: "Kostenloser Online-Standardabweichungsrechner. Ermitteln Sie schnell die Standardabweichung und Varianz von Population oder Stichprobe, ohne Anmeldung.",
    },
    ja: {
      steps: ["データセットをカンマ区切りの数値リストで入力します。", "全体（population）か標本（sample）かを選択します。", "結果を確認します。計算機は標準偏差と分散を表示します。"],
      explanationTitle: "標準偏差とは？",
      formula: "σ = √( Σ(xᵢ − μ)² / N )   （全体）",
      explanation: ["標準偏差は、データの値が平均からどの程度ばらついているかを表します。値が小さいほどデータはまとまっており、大きいほど変動が激しいことを意味します。", "これを使ってグループ間の一貫性を比較したり、金融リスクを評価したり、試験結果や測定のばらつきを理解したりできます。"],
      faq: [
        { q: "全体と標本、どちらを選べばいいですか？", a: "クラス全員などグループの全員分のデータがある場合は全体を、データが一部であり全体を推定したい場合は標本を選びます。" },
        { q: "なぜ標本の標準偏差は大きくなるのですか？", a: "標本の式では n ではなく n−1 で割るため、同じデータから平均を推定することで生じるバイアスが補正され、やや大きくて誠実なばらつきが得られます。" },
        { q: "結果の単位は何ですか？", a: "標準偏差は常に元のデータと同じ単位になるため、平均と一緒に直感的に読み取れます。" },
      ],
      metaDescription: "無料のオンライン標準偏差計算機。全体・標本の標準偏差と分散をすばやく求めます。登録不要、わかりやすい数式付き。",
    },
    es: {
      steps: ["Introduce tu conjunto de datos como una lista de números separados por comas.", "Elige si se trata de una población o de una muestra.", "Lee el resultado: la calculadora muestra la desviación típica y la varianza."],
      explanationTitle: "¿Qué es la desviación típica?",
      formula: "σ = √( Σ(xᵢ − μ)² / N )   (población)",
      explanation: ["La desviación típica mide cuánto se dispersan los valores de un conjunto de datos alrededor de la media. Un valor pequeño indica que los números están muy juntos; uno grande, que varían mucho.", "Se usa para comparar la consistencia entre grupos, evaluar el riesgo financiero o entender la variación en notas de exámenes y mediciones científicas."],
      faq: [
        { q: "Población o muestra, ¿cuál elijo?", a: "Usa población cuando tienes todos los miembros del grupo (por ejemplo, todos los alumnos de una clase). Usa muestra cuando tus datos son solo una parte y quieres estimar el total." },
        { q: "¿Por qué la desviación de la muestra es mayor?", a: "La fórmula de la muestra divide entre n−1 en lugar de n, lo que corrige el sesgo de estimar la media con los mismos datos y da una dispersión algo mayor y más honesta." },
        { q: "¿En qué unidad está el resultado?", a: "La desviación típica siempre usa la misma unidad que tus datos originales, lo que facilita interpretarla junto con la media." },
      ],
      metaDescription: "Calculadora de desviación típica gratis en línea. Obtén rápido la desviación y varianza de población o muestra, sin registro, con fórmula y ejemplos.",
    },
  },

  "scientific-notation": {
    en: {
      steps: ["Type the number you want to convert into the input field.", "Choose convert to scientific notation, or from scientific notation to decimal.", "Copy the formatted result with its exponent and mantissa."],
      explanationTitle: "What Is Scientific Notation?",
      formula: "a × 10ⁿ  where 1 ≤ |a| < 10",
      explanation: ["Scientific notation writes numbers as a coefficient between 1 and 10 multiplied by a power of ten. It makes very large or very small values compact and easy to read.", "It is widely used in science, engineering, and computing to handle values like the speed of light or atomic scales without long strings of zeros."],
      faq: [
        { q: "What is the mantissa and the exponent?", a: "The mantissa is the coefficient (the number between 1 and 10) and the exponent is the power of ten that scales it up or down." },
        { q: "How do I convert a decimal to scientific notation?", a: "Move the decimal point so there is one non-zero digit to its left; the number of places moved is the exponent (positive for large numbers, negative for small)." },
        { q: "Does the calculator handle negative numbers?", a: "Yes. The sign stays with the mantissa, and only the magnitude is normalized into the 1–10 range." },
      ],
      metaDescription: "Free online scientific notation calculator. Convert any number to or from scientific notation fast, no signup, with mantissa, exponent and examples.",
    },
    zh: {
      steps: ["在输入框中输入要转换的数字。", "选择转换为科学计数法，或从科学计数法转换为小数。", "复制带指数与尾数的格式化结果。"],
      explanationTitle: "什么是科学计数法？",
      formula: "a × 10ⁿ ，其中 1 ≤ |a| < 10",
      explanation: ["科学计数法把数字写成一个介于 1 到 10 之间的系数乘以 10 的整数次幂，使极大或极小的数值更紧凑、易读。", "它广泛用于科学、工程与计算机领域，用来处理光速或原子尺度这类数值，而不必写出一长串零。"],
      faq: [
        { q: "什么是尾数和指数？", a: "尾数是系数（1 到 10 之间的数），指数是将其放大或缩小的 10 的幂次。" },
        { q: "如何把小数转换为科学计数法？", a: "移动小数点，使左侧只保留一个非零数字；移动的位数即为指数（大数取正，小数取负）。" },
        { q: "计算器支持负数吗？", a: "支持。符号保留在尾数上，仅对绝对值归一化到 1–10 区间。" },
      ],
      metaDescription: "免费在线科学计数法计算器，快速在科学计数法与小数间转换，无需注册，含尾数、指数与示例。",
    },
    "zh-TW": {
      steps: ["在輸入框中輸入要轉換的數字。", "選擇轉換為科學記數法，或從科學記數法轉換為小數。", "複製帶指數與尾數的格式化結果。"],
      explanationTitle: "什麼是科學記數法？",
      formula: "a × 10ⁿ ，其中 1 ≤ |a| < 10",
      explanation: ["科學記數法把數字寫成一個介於 1 到 10 之間的係數乘以 10 的整數次冪，使極大或極小的數值更緊湊、易讀。", "它廣泛用於科學、工程與電腦領域，用來處理光速或原子尺度這類數值，而不必寫出一長串零。"],
      faq: [
        { q: "什麼是尾數和指數？", a: "尾數是係數（1 到 10 之間的數），指數是將其放大或縮小的 10 的冪次。" },
        { q: "如何把小數轉換為科學記數法？", a: "移動小數點，使左側只保留一個非零數字；移動的位數即為指數（大數取正，小數取負）。" },
        { q: "計算機支援負數嗎？", a: "支援。符號保留在尾數上，僅對絕對值歸一化到 1–10 區間。" },
      ],
      metaDescription: "免費線上科學記數法計算機，快速在科學記數法與小數間轉換，無須註冊，含尾數、指數與範例。",
    },
    de: {
      steps: ["Gib die Zahl, die du umwandeln möchtest, in das Eingabefeld ein.", "Wähle die Umwandlung in wissenschaftliche Notation oder zurück in Dezimaldarstellung.", "Kopiere das formatierte Ergebnis mit Mantisse und Exponent."],
      explanationTitle: "Was ist die wissenschaftliche Notation?",
      formula: "a × 10ⁿ  mit 1 ≤ |a| < 10",
      explanation: ["Die wissenschaftliche Notation schreibt Zahlen als Koeffizient zwischen 1 und 10, multipliziert mit einer Potenz von 10. So werden sehr große oder sehr kleine Werte kompakt und lesbar.", "Sie wird in Wissenschaft, Technik und Informatik genutzt, um Werte wie die Lichtgeschwindigkeit oder atomare Skalen ohne lange Nullenketten darzustellen."],
      faq: [
        { q: "Was sind Mantisse und Exponent?", a: "Die Mantisse ist der Koeffizient (die Zahl zwischen 1 und 10) und der Exponent ist die Zehnerpotenz, die ihn skaliert." },
        { q: "Wie wandele ich eine Dezimalzahl in wissenschaftliche Notation um?", a: "Verschiebe das Komma, sodass links eine einzige von null verschiedene Ziffer steht; die Anzahl der Schritte ist der Exponent (positiv für große, negativ für kleine Zahlen)." },
        { q: "Kann der Rechner negative Zahlen?", a: "Ja. Das Vorzeichen bleibt an der Mantisse, nur der Betrag wird auf den Bereich 1–10 normiert." },
      ],
      metaDescription: "Kostenloser Online-Rechner für wissenschaftliche Notation. Wandeln Sie Zahlen schnell um, ohne Anmeldung, mit Mantisse, Exponent und Beispielen.",
    },
    ja: {
      steps: ["変換したい数値を入力欄に入力します。", "科学記数法への変換、または科学記数法から小数への変換を選びます。", "指数と仮数を含む整形済み結果をコピーします。"],
      explanationTitle: "科学記数法とは？",
      formula: "a × 10ⁿ  （1 ≤ |a| < 10）",
      explanation: ["科学記数法は、1 以上 10 未満の係数に 10 の冪を掛けた形で数を表します。これにより極端に大きい・小さい値をコンパクトに読みやすくします。", "光の速さや原子スケールのような値を、長いゼロの列を書かずに扱うため、科学・工学・計算機で広く使われます。"],
      faq: [
        { q: "仮数と指数とは？", a: "仮数は係数（1 以上 10 未満の数）、指数はそれを拡大・縮小する 10 の冪です。" },
        { q: "小数を科学記数法に変換するには？", a: "小数点を動かし、左に非零の数字が 1 つだけになるようにします。動かした桁数が指数です（大きい数は正、小さい数は負）。" },
        { q: "負の数にも対応していますか？", a: "はい。符号は仮数に残り、絶対値だけを 1–10 の範囲に正規化します。" },
      ],
      metaDescription: "無料のオンライン科学記数法計算機。数値を科学記数法へ、または小数へすばやく変換。登録不要、仮数・指数付き。",
    },
    es: {
      steps: ["Escribe el número que quieres convertir en el campo de entrada.", "Elige convertir a notación científica, o de notación científica a decimal.", "Copia el resultado formateado con su exponente y mantisa."],
      explanationTitle: "¿Qué es la notación científica?",
      formula: "a × 10ⁿ  donde 1 ≤ |a| < 10",
      explanation: ["La notación científica escribe los números como un coeficiente entre 1 y 10 multiplicado por una potencia de diez. Hace que los valores muy grandes o muy pequeños sean compactos y fáciles de leer.", "Se usa mucho en ciencia, ingeniería e informática para manejar valores como la velocidad de la luz o escalas atómicas sin largas cadenas de ceros."],
      faq: [
        { q: "¿Qué son la mantisa y el exponente?", a: "La mantisa es el coeficiente (el número entre 1 y 10) y el exponente es la potencia de diez que lo escala." },
        { q: "¿Cómo convierto un decimal a notación científica?", a: "Mueve la coma decimal para que quede un solo dígito distinto de cero a su izquierda; el número de posiciones movidas es el exponente (positivo para números grandes, negativo para pequeños)." },
        { q: "¿La calculadora acepta números negativos?", a: "Sí. El signo se queda en la mantisa y solo se normaliza el valor absoluto al rango 1–10." },
      ],
      metaDescription: "Calculadora de notación científica gratis en línea. Convierte cualquier número a o desde notación científica, sin registro, con mantisa y exponente.",
    },
  },

  "percentage-calculator": {
    en: {
      steps: ["Pick the percentage operation you need (X% of Y, X is what % of Y, or increase/decrease).", "Enter the numbers into the input fields.", "Read the result instantly below the inputs."],
      explanationTitle: "How Percentage Calculations Work",
      formula: "Part = (Percentage / 100) × Whole",
      explanation: ["A percentage is simply a fraction of 100. Calculating 'X% of Y' means multiplying Y by X divided by 100.", "Percentages are used daily for discounts, tax, tips, interest rates, and comparing changes between two values."],
      faq: [
        { q: "How do I find what percent one number is of another?", a: "Divide the part by the whole and multiply by 100. For example, 25 of 200 is (25 / 200) × 100 = 12.5%." },
        { q: "How do I calculate a percentage increase?", a: "Subtract the original from the new value, divide by the original, then multiply by 100." },
        { q: "Can I use it for discounts?", a: "Yes. To find a sale price after a discount, calculate the percent of the original price and subtract it." },
      ],
      metaDescription: "Free online percentage calculator. Find X% of Y, what percent one number is of another, and increases or discounts fast, no signup.",
    },
    zh: {
      steps: ["选择需要的百分比运算（X 的 Y%、X 是 Y 的百分之几、或增减）。", "在输入框中填入数字。", "在输入框下方即时查看结果。"],
      explanationTitle: "百分比如何计算",
      formula: "部分 = (百分比 / 100) × 整体",
      explanation: ["百分比本质上是“每 100 中的多少”。计算“Y 的 X%”就是把 Y 乘以 X 再除以 100。", "折扣、税费、小费、利率以及两个数值变化的比较，日常生活中都离不开百分比。"],
      faq: [
        { q: "如何求一个数是另一个数的百分之几？", a: "用部分除以整体再乘以 100。例如 25 占 200 即 (25 / 200) × 100 = 12.5%。" },
        { q: "如何计算百分比增长？", a: "用新值减去原值，除以原值，再乘以 100。" },
        { q: "能用于折扣计算吗？", a: "可以。先算出原价的对应百分比，再从原价中扣减即可得到折后价。" },
      ],
      metaDescription: "免费在线百分比计算器，快速求 X 的 Y%、一个数占另一个数的百分比，以及增减与折扣，无需注册。",
    },
    "zh-TW": {
      steps: ["選擇需要的百分比運算（X 的 Y%、X 是 Y 的幾分之幾、或增減）。", "在輸入框中填入數字。", "在輸入框下方即時查看結果。"],
      explanationTitle: "百分比如何計算",
      formula: "部分 = (百分比 / 100) × 整體",
      explanation: ["百分比本質上是「每 100 中的多少」。計算「Y 的 X%」就是把 Y 乘以 X 再除以 100。", "折扣、稅費、小費、利率以及兩個數值變化的比較，日常生活中都離不開百分比。"],
      faq: [
        { q: "如何求一個數是另一個數的百分之幾？", a: "用部分除以整體再乘以 100。例如 25 佔 200 即 (25 / 200) × 100 = 12.5%。" },
        { q: "如何計算百分比成長？", a: "用新值減去原值，除以原值，再乘以 100。" },
        { q: "能用於折扣計算嗎？", a: "可以。先算出原價的對應百分比，再從原價中扣減即可得到折後價。" },
      ],
      metaDescription: "免費線上百分比計算機，快速求 X 的 Y%、一個數佔另一個數的百分比，以及增減與折扣，無須註冊。",
    },
    de: {
      steps: ["Wähle die gewünschte Prozentrechnung (X% von Y, X ist wie viel % von Y oder Zu-/Abnahme).", "Gib die Zahlen in die Eingabefelder ein.", "Lies das Ergebnis sofort unter den Eingaben ab."],
      explanationTitle: "So funktioniert die Prozentrechnung",
      formula: "Anteil = (Prozent / 100) × Ganzes",
      explanation: ["Eine Prozentzahl ist einfach ein Hundertstel. 'X% von Y' bedeutet, Y mit X geteilt durch 100 zu multiplizieren.", "Prozente brauchen wir täglich für Rabatte, Steuern, Trinkgeld, Zinsen und den Vergleich von Veränderungen zwischen zwei Werten."],
      faq: [
        { q: "Wie finde ich heraus, wie viel Prozent eine Zahl von einer anderen ist?", a: "Teile den Teil durch das Ganze und multipliziere mit 100. Beispiel: 25 von 200 ist (25 / 200) × 100 = 12,5 %." },
        { q: "Wie berechne ich eine prozentuale Zunahme?", a: "Subtrahiere den Ursprungswert vom neuen Wert, teile durch den Ursprungswert und multipliziere mit 100." },
        { q: "Kann ich es für Rabatte nutzen?", a: "Ja. Um einen Sale-Preis nach Rabatt zu finden, berechne den Prozentwert vom Originalpreis und ziehe ihn ab." },
      ],
      metaDescription: "Kostenloser Online-Prozentrechner. Ermittle X% von Y, wie viel % eine Zahl von einer anderen ist, sowie Zuwächse oder Rabatte, ohne Anmeldung.",
    },
    ja: {
      steps: ["必要なパーセント計算を選びます（Y の X%、X は Y の何%、増減）。", "数値を入力欄に入力します。", "入力欄の下に結果が即座に表示されます。"],
      explanationTitle: "パーセント計算のしくみ",
      formula: "部分 = (パーセント / 100) × 全体",
      explanation: ["パーセントは「100 分のいくつ」を表すだけです。「Y の X%」は Y に X を掛けて 100 で割ることです。", "割引や税、チップ、金利、2 つの値の変化の比較など、日常で頻繁に使われます。"],
      faq: [
        { q: "ある数が別の数の何パーセントかを求めるには？", a: "部分を全体で割り、100 を掛けます。例：200 のうち 25 は (25 / 200) × 100 = 12.5%。" },
        { q: "パーセント増加を計算するには？", a: "新しい値から元の値を引き、元の値で割り、100 を掛けます。" },
        { q: "割引の計算に使えますか？", a: "はい。元の価格のパーセントを求めて差し引けば、割引後の価格が得られます。" },
      ],
      metaDescription: "無料のオンライン割合計算機。Y の X%、ある数が別の数の何％か、増減や割引をすばやく計算。登録不要。",
    },
    es: {
      steps: ["Elige la operación que necesitas (X% de Y, qué porcentaje es X de Y, o aumento/descenso).", "Introduce los números en los campos.", "Lee el resultado al instante bajo las entradas."],
      explanationTitle: "Cómo funcionan los porcentajes",
      formula: "Parte = (Porcentaje / 100) × Total",
      explanation: ["Un porcentaje es simplemente una fracción de 100. Calcular 'X% de Y' significa multiplicar Y por X dividido entre 100.", "Los porcentajes se usan a diario para descuentos, impuestos, propinas, intereses y comparar cambios entre dos valores."],
      faq: [
        { q: "¿Cómo sé qué porcentaje es un número de otro?", a: "Divide la parte por el total y multiplica por 100. Por ejemplo, 25 de 200 es (25 / 200) × 100 = 12,5 %." },
        { q: "¿Cómo calculo un aumento porcentual?", a: "Resta el valor original del nuevo, divide entre el original y multiplica por 100." },
        { q: "¿Puedo usarlo para descuentos?", a: "Sí. Para el precio con descuento, calcula el porcentaje del precio original y réstalo." },
      ],
      metaDescription: "Calculadora de porcentajes gratis en línea. Obtén X% de Y, qué porcentaje es un número de otro, y aumentos o descuentos, sin registro.",
    },
  },

  "ratio-calculator": {
    en: {
      steps: ["Enter the values of your ratio, such as A : B.", "Add a known value for the missing side if you want to scale it.", "Read the simplified ratio and any scaled equivalent instantly."],
      explanationTitle: "What Is a Ratio?",
      formula: "A : B  →  divide both by gcd(A, B) to simplify",
      explanation: ["A ratio compares two quantities and shows their relative size. Simplifying a ratio keeps the same relationship with the smallest whole numbers.", "Ratios appear in recipes, maps, finance, and mixing — anywhere you need to keep one quantity proportional to another."],
      faq: [
        { q: "How do I simplify a ratio?", a: "Divide both sides by their greatest common divisor so the numbers share no common factor other than 1." },
        { q: "Can I scale a ratio to a known total?", a: "Yes. If you know one part, the calculator finds the matching other part that preserves the same proportion." },
        { q: "What is a 1:1 ratio?", a: "It means the two quantities are equal in size; scaling one scales the other by the same amount." },
      ],
      metaDescription: "Free online ratio calculator. Simplify A:B ratios, find missing values, and scale proportions fast, no signup, with clear steps.",
    },
    zh: {
      steps: ["输入比例的值，例如 A : B。", "若需缩放，可填入已知一侧的数值。", "即时查看化简后的比例及等比对应值。"],
      explanationTitle: "什么是比例？",
      formula: "A : B → 两边同除以最大公约数化简",
      explanation: ["比例用来比较两个量并显示它们的相对大小。化简比例可以在保持关系不变的前提下，用最小的整数表示。", "比例常见于食谱、地图、金融以及调配混合——只要需要让一个量正比于另一个量，就会用到它。"],
      faq: [
        { q: "如何化简比例？", a: "将两边同除以它们的最大公约数，使两数除 1 外没有其他公因数。" },
        { q: "能把比例缩放到已知总数吗？", a: "可以。若已知其中一侧，计算器会求出保持相同比例的另一侧对应值。" },
        { q: "1:1 比例是什么意思？", a: "表示两个量大小相等；其中一个量缩放多少，另一个也按相同比例缩放。" },
      ],
      metaDescription: "免费在线比例计算器，化简 A:B 比例、求缺失值并缩放比例，无需注册，步骤清晰。",
    },
    "zh-TW": {
      steps: ["輸入比例的值，例如 A : B。", "若需縮放，可填入已知一側的數值。", "即時查看化簡後的比例及等比對應值。"],
      explanationTitle: "什麼是比例？",
      formula: "A : B → 兩邊同除以最大公約數化簡",
      explanation: ["比例用來比較兩個量並顯示它們的相對大小。化簡比例可以在保持關係不變的前提下，用最小的整數表示。", "比例常見於食譜、地圖、金融以及調配混合——只要需要讓一個量正比於另一個量，就會用到它。"],
      faq: [
        { q: "如何化簡比例？", a: "將兩邊同除以它們的最大公約數，使兩數除 1 外沒有其他公因數。" },
        { q: "能把比例縮放到已知總數嗎？", a: "可以。若已知其中一側，計算機會求出保持相同比例的另一側對應值。" },
        { q: "1:1 比例是什麼意思？", a: "表示兩個量大小相等；其中一個量縮放多少，另一個也按相同比例縮放。" },
      ],
      metaDescription: "免費線上比例計算機，化簡 A:B 比例、求缺失值並縮放比例，無須註冊，步驟清晰。",
    },
    de: {
      steps: ["Gib die Werte deines Verhältnisses ein, zum Beispiel A : B.", "Füge für die fehlende Seite einen bekannten Wert hinzu, falls du skalieren willst.", "Lies das gekürzte Verhältnis und etwaige Skalierungen sofort ab."],
      explanationTitle: "Was ist ein Verhältnis?",
      formula: "A : B  →  beide durch ggT(A, B) kürzen",
      explanation: ["Ein Verhältnis vergleicht zwei Größen und zeigt ihre relative Größe. Das Kürzen hält die Beziehung mit den kleinsten ganzen Zahlen.", "Verhältnisse kommen in Rezepten, Karten, Finanzen und Mischungen vor — überall dort, wo eine Größe proportional zu einer anderen bleiben soll."],
      faq: [
        { q: "Wie kürze ich ein Verhältnis?", a: "Teile beide Seiten durch ihren größten gemeinsamen Teiler, sodass außer 1 kein gemeinsamer Faktor bleibt." },
        { q: "Kann ich ein Verhältnis auf eine bekannte Summe skalieren?", a: "Ja. Wenn du eine Seite kennst, findet der Rechner die passende andere Seite, die das gleiche Verhältnis bewahrt." },
        { q: "Was bedeutet ein Verhältnis 1:1?", a: "Es bedeutet, dass beide Größen gleich groß sind; skaliert man eine, skaliert die andere im gleichen Maß." },
      ],
      metaDescription: "Kostenloser Online-Verhältnisrechner. Kürze A:B-Verhältnisse, finde fehlende Werte und skaliere Proportionen, ohne Anmeldung.",
    },
    ja: {
      steps: ["比率の値を入力します（例：A : B）。", "倍率を変えたい場合は、既知の片側の値を入力します。", "約分後の比率と等比対応値が即座に表示されます。"],
      explanationTitle: "比率とは？",
      formula: "A : B → 両辺を最大公約数で割って約分",
      explanation: ["比率は2つの量を比較し、その相対的な大きさを示します。比率を約分すると、関係を保ったまま最小の整数で表せます。", "レシピ、地図、金融、配合など、ある量を別の量に比例させたい場面で使われます。"],
      faq: [
        { q: "比率をどう約分しますか？", a: "両辺を最大公約数で割り、1 以外の公約数がなくなるまで行います。" },
        { q: "既知の合計に合わせて比率を拡縮できますか？", a: "はい。片側がわかっていれば、同じ比率を保つもう片側の値を求めます。" },
        { q: "1:1 の比率とは？", a: "2つの量が等しいことを意味します。一方を何倍かにすると、もう一方も同じ倍率で変化します。" },
      ],
      metaDescription: "無料のオンライン比率計算機。A:B を約分し、不足値を見つけ、比例を拡縮。登録不要、手順付き。",
    },
    es: {
      steps: ["Introduce los valores de tu razón, por ejemplo A : B.", "Añade un valor conocido del lado que falta si quieres escalarla.", "Lee la razón simplificada y cualquier equivalente al instante."],
      explanationTitle: "¿Qué es una razón?",
      formula: "A : B  →  divide ambos por mcd(A, B) para simplificar",
      explanation: ["Una razón compara dos cantidades y muestra su tamaño relativo. Simplificarla conserva la misma relación con los números enteros más pequeños.", "Las razones aparecen en recetas, mapas, finanzas y mezclas: dondequiera que una cantidad deba ser proporcional a otra."],
      faq: [
        { q: "¿Cómo simplifico una razón?", a: "Divide ambos lados por su máximo común divisor para que no compartan factor salvo el 1." },
        { q: "¿Puedo escalar una razón a un total conocido?", a: "Sí. Si conoces una parte, la calculadora halla la otra que preserva la misma proporción." },
        { q: "¿Qué es una razón 1:1?", a: "Significa que las dos cantidades son iguales; escalar una escala la otra en la misma proporción." },
      ],
      metaDescription: "Calculadora de razones gratis en línea. Simplifica razones A:B, encuentra valores faltantes y escala proporciones, sin registro.",
    },
  },

  "statistics-calculator": {
    en: {
      steps: ["Enter your numbers as a comma-separated list.", "The calculator computes mean, median, mode, range, and standard deviation.", "Use the summary to understand the shape and spread of your data."],
      explanationTitle: "Key Statistical Measures",
      formula: "Mean = Σx / n",
      explanation: ["Descriptive statistics summarize a data set with a few meaningful numbers. The mean shows the center, while the range and standard deviation show the spread.", "These measures help you compare groups, spot outliers, and communicate findings clearly without plotting every point."],
      faq: [
        { q: "What is the difference between mean and median?", a: "The mean is the average of all values; the median is the middle value when sorted. The median is less affected by extreme outliers." },
        { q: "When should I use the mode?", a: "Use the mode when you want the most frequently occurring value, common in categories and discrete counts." },
        { q: "Why does spread matter?", a: "Two data sets can share the same mean but behave very differently; spread measures reveal that difference." },
      ],
      metaDescription: "Free online statistics calculator. Get mean, median, mode, range and standard deviation from a list fast, no signup, with clear explanation.",
    },
    zh: {
      steps: ["以逗号分隔的列表输入数字。", "计算器会计算均值、中位数、众数、极差与标准差。", "借助汇总结果理解数据的分布形态与离散程度。"],
      explanationTitle: "关键统计量",
      formula: "均值 = Σx / n",
      explanation: ["描述性统计用几个有意义的数字概括数据集。均值反映中心位置，极差与标准差反映离散程度。", "这些指标可帮助你比较不同组、发现离群值，并在不逐一绘图的情况下清晰传达结论。"],
      faq: [
        { q: "均值与中位数有何区别？", a: "均值是所有值的平均；中位数是排序后的中间值。中位数受极端离群值的影响更小。" },
        { q: "什么时候用众数？", a: "当你想找出现次数最多的数值时使用，常见于类别与离散计数。" },
        { q: "为什么离散程度很重要？", a: "两组数据可能均值相同但表现迥异，离散指标能揭示这种差异。" },
      ],
      metaDescription: "免费在线统计计算器，由列表快速得到均值、中位数、众数、极差与标准差，无需注册，附清晰说明。",
    },
    "zh-TW": {
      steps: ["以逗號分隔的列表輸入數字。", "計算機會計算均值、中位數、眾數、全距與標準差。", "借助彙整結果理解資料的分布型態與離散程度。"],
      explanationTitle: "關鍵統計量",
      formula: "均值 = Σx / n",
      explanation: ["描述性統計用幾個有意義的數字概括資料集。均值反映中心位置，全距與標準差反映離散程度。", "這些指標可幫助你比較不同組、發現離群值，並在不逐一繪圖的情況下清晰傳達結論。"],
      faq: [
        { q: "均值與中位數有何區別？", a: "均值是所有值的平均；中位數是排序後的中間值。中位數受極端離群值的影響更小。" },
        { q: "什麼時候用眾數？", a: "當你想找出現次數最多的數值時使用，常見於類別與離散計數。" },
        { q: "為什麼離散程度很重要？", a: "兩組資料可能均值相同但表現迥異，離散指標能揭示這種差異。" },
      ],
      metaDescription: "免費線上統計計算機，由列表快速得到均值、中位數、眾數、全距與標準差，無須註冊，附清晰說明。",
    },
    de: {
      steps: ["Gib deine Zahlen als kommagetrennte Liste ein.", "Der Rechner ermittelt Mittelwert, Median, Modus, Spannweite und Standardabweichung.", "Nutze die Zusammenfassung, um Form und Streuung deiner Daten zu verstehen."],
      explanationTitle: "Wichtige statistische Kennzahlen",
      formula: "Mittelwert = Σx / n",
      explanation: ["Beschreibende Statistik fasst einen Datensatz in wenigen aussagekräftigen Zahlen zusammen. Der Mittelwert zeigt das Zentrum, Spannweite und Standardabweichung die Streuung.", "Diese Maße helfen, Gruppen zu vergleichen, Ausreißer zu erkennen und Ergebnisse klar zu kommunizieren, ohne jeden Punkt zu plotten."],
      faq: [
        { q: "Was ist der Unterschied zwischen Mittelwert und Median?", a: "Der Mittelwert ist der Durchschnitt aller Werte; der Median ist der mittlere Wert der sortierten Liste. Der Median wird weniger von extremen Ausreißern beeinflusst." },
        { q: "Wann verwende ich den Modus?", a: "Den Modus brauchst du, wenn du den häufigsten Wert willst, typisch bei Kategorien und diskreten Zählungen." },
        { q: "Warum ist die Streuung wichtig?", a: "Zwei Datensätze können denselben Mittelwert haben, sich aber sehr unterschiedlich verhalten; Streuungsmaße zeigen das." },
      ],
      metaDescription: "Kostenloser Online-Statistikrechner. Erhalte Mittelwert, Median, Modus, Spannweite und Standardabweichung schnell, ohne Anmeldung.",
    },
    ja: {
      steps: ["数値をカンマ区切りのリストで入力します。", "計算機が平均・中央値・最頻値・範囲・標準偏差を計算します。", "要約結果からデータの形とばらつきを理解できます。"],
      explanationTitle: "主要な統計指標",
      formula: "平均 = Σx / n",
      explanation: ["記述統計は、データセットを少数の意味のある数値でまとめます。平均は中心を示し、範囲と標準偏差はばらつきを示します。", "これらの指標があれば、グループの比較、外れ値の発見、点を全部プロットせずとも結論を伝えることができます。"],
      faq: [
        { q: "平均と中央値の違いは？", a: "平均は全値の平均、中央値は並べたときの真ん中の値です。中央値は極端な外れ値の影響を受けにくいです。" },
        { q: "最頻値はいつ使いますか？", a: "最も頻度の高い値が知りたいときに使います。カテゴリや離散的な計数でよく登場します。" },
        { q: "なぜばらつきが重要ですか？", a: "2つのデータセットは平均が同じでも挙動が大きく異なることがあり、ばらつきの指標がその差を明らかにします。" },
      ],
      metaDescription: "無料のオンライン統計計算機。リストから平均・中央値・最頻値・範囲・標準偏差をすばやく算出。登録不要。",
    },
    es: {
      steps: ["Introduce tus números como una lista separada por comas.", "La calculadora obtiene media, mediana, moda, rango y desviación típica.", "Usa el resumen para entender la forma y la dispersión de tus datos."],
      explanationTitle: "Medidas estadísticas clave",
      formula: "Media = Σx / n",
      explanation: ["La estadística descriptiva resume un conjunto de datos en pocos números significativos. La media muestra el centro, mientras el rango y la desviación muestran la dispersión.", "Estas medidas ayudan a comparar grupos, detectar valores atípicos y comunicar resultados sin plotear cada punto."],
      faq: [
        { q: "¿Cuál es la diferencia entre media y mediana?", a: "La media es el promedio de todos los valores; la mediana es el valor central al ordenar. La mediana se ve menos afectada por valores extremos." },
        { q: "¿Cuándo uso la moda?", a: "Úsala cuando quieras el valor más frecuente, común en categorías y conteos discretos." },
        { q: "¿Por qué importa la dispersión?", a: "Dos conjuntos pueden tener la misma media pero comportarse muy distinto; las medidas de dispersión lo revelan." },
      ],
      metaDescription: "Calculadora de estadística gratis en línea. Obtén media, mediana, moda, rango y desviación de una lista, sin registro, con explicación.",
    },
  },

  "probability-calculator": {
    en: {
      steps: ["Choose the probability scenario (single event, two events, or combinations).", "Enter the numbers of favorable and total outcomes.", "Read the probability as a fraction, decimal, and percentage."],
      explanationTitle: "Understanding Probability",
      formula: "P = Favorable outcomes / Total outcomes",
      explanation: ["Probability quantifies how likely an event is, from 0 (impossible) to 1 (certain). It is the ratio of favorable outcomes to all possible outcomes.", "It underpins games of chance, risk assessment, quality control, and any decision made under uncertainty."],
      faq: [
        { q: "What does a probability of 0.5 mean?", a: "It means the event is as likely to happen as not — a 50% chance, like a fair coin landing heads." },
        { q: "How is probability written?", a: "As a fraction, a decimal between 0 and 1, or a percentage between 0% and 100%." },
        { q: "Can probabilities be added?", a: "Only for mutually exclusive events. Otherwise you must account for overlap to avoid double-counting." },
      ],
      metaDescription: "Free online probability calculator. Find the chance of single or combined events fast, no signup, shown as fraction, decimal and percent.",
    },
    zh: {
      steps: ["选择概率场景（单一事件、两个事件或组合）。", "输入有利结果数与总结果数。", "以分数、小数与百分比三种形式读取概率。"],
      explanationTitle: "理解概率",
      formula: "P = 有利结果数 / 总结果数",
      explanation: ["概率量化某事件发生的可信度，范围从 0（不可能）到 1（必然），等于有利结果数与所有可能结果数之比。", "它是博弈、风险评估、质量管控以及任何在不确定性下做决策的基础。"],
      faq: [
        { q: "概率为 0.5 意味着什么？", a: "表示事件发生与不发生的机会相等——50% 的概率，如同公平硬币正面朝上。" },
        { q: "概率如何表示？", a: "可表示为分数、0 到 1 之间的小数，或 0% 到 100% 之间的百分比。" },
        { q: "概率可以直接相加吗？", a: "仅当事件互斥时才可以。否则必须考虑重叠部分，避免重复计数。" },
      ],
      metaDescription: "免费在线概率计算器，快速求单一或组合事件的概率，无需注册，以分数、小数与百分比显示。",
    },
    "zh-TW": {
      steps: ["選擇機率場景（單一事件、兩個事件或組合）。", "輸入有利結果數與總結果數。", "以分數、小數與百分比三種形式讀取機率。"],
      explanationTitle: "理解機率",
      formula: "P = 有利結果數 / 總結果數",
      explanation: ["機率量化某事件發生的可信度，範圍從 0（不可能）到 1（必然），等於有利結果數與所有可能結果數之比。", "它是博弈、風險評估、品質管控以及任何在不确定性下做決策的基礎。"],
      faq: [
        { q: "機率為 0.5 意味著什麼？", a: "表示事件發生與不發生的機會相等——50% 的機率，如同公平硬幣正面朝上。" },
        { q: "機率如何表示？", a: "可表示為分數、0 到 1 之間的小數，或 0% 到 100% 之間的百分比。" },
        { q: "機率可以直接相加嗎？", a: "僅當事件互斥時才可以。否則必須考慮重疊部分，避免重複計數。" },
      ],
      metaDescription: "免費線上機率計算機，快速求單一或組合事件的機率，無須註冊，以分數、小數與百分比顯示。",
    },
    de: {
      steps: ["Wähle das Szenario (einzelnes Ereignis, zwei Ereignisse oder Kombinationen).", "Gib die Anzahl der günstigen und der möglichen Ergebnisse ein.", "Lies die Wahrscheinlichkeit als Bruch, Dezimalzahl und Prozent."],
      explanationTitle: "Wahrscheinlichkeit verstehen",
      formula: "P = Günstige Ergebnisse / Alle Ergebnisse",
      explanation: ["Die Wahrscheinlichkeit quantifiziert, wie wahrscheinlich ein Ereignis ist, von 0 (unmöglich) bis 1 (sicher). Sie ist das Verhältnis günstiger zu allen möglichen Ergebnissen.", "Sie ist die Grundlage für Glücksspiele, Risikobewertung, Qualitätskontrolle und jede Entscheidung unter Unsicherheit."],
      faq: [
        { q: "Was bedeutet eine Wahrscheinlichkeit von 0,5?", a: "Das Ereignis ist ebenso wahrscheinlich wie nicht — eine 50%-Chance, wie Kopf bei einer fairen Münze." },
        { q: "Wie wird Wahrscheinlichkeit geschrieben?", a: "Als Bruch, als Dezimalzahl zwischen 0 und 1 oder als Prozent zwischen 0 % und 100 %." },
        { q: "Können Wahrscheinlichkeiten addiert werden?", a: "Nur bei sich ausschließenden Ereignissen. Sonst muss die Überschneidung beachtet werden, um Doppelzählung zu vermeiden." },
      ],
      metaDescription: "Kostenloser Online-Wahrscheinlichkeitsrechner. Ermittle die Chance einzelner oder kombinierter Ereignisse schnell, ohne Anmeldung.",
    },
    ja: {
      steps: ["確率のシナリオを選びます（単一イベント、2イベント、組合せ）。", "有利な結果の数と全体の結果の数を入力します。", "分数・小数・パーセントの3形式で確率を確認します。"],
      explanationTitle: "確率とは",
      formula: "P = 有利な結果の数 / 全体の結果の数",
      explanation: ["確率は事象の起こる度合いを 0（起こらない）から 1（必ず起こる）で表し、有利な結果の数と全結果の数の比です。", "ギャンブル、リスク評価、品質管理、不確実な状況での意思決定の基礎となります。"],
      faq: [
        { q: "確率 0.5 はどういう意味？", a: "事象が起こるのと起こらないのが同じくらいの確率、つまり50%のチャンスです（公平なコインの表など）。" },
        { q: "確率はどう表しますか？", a: "分数、0〜1の小数、または0%〜100%のパーセントで表します。" },
        { q: "確率は足し算できますか？", a: "互いに排反な事象の場合のみです。それ以外は重複を考慮しないと二重カウントになります。" },
      ],
      metaDescription: "無料のオンライン確率計算機。単一・組合せイベントの起こる確率を分数・小数・パーセントで迅速に算出。登録不要。",
    },
    es: {
      steps: ["Elige el escenario (un evento, dos eventos o combinaciones).", "Introduce el número de casos favorables y totales.", "Lee la probabilidad como fracción, decimal y porcentaje."],
      explanationTitle: "Entender la probabilidad",
      formula: "P = Casos favorables / Casos totales",
      explanation: ["La probabilidad cuantifica cuán probable es un evento, de 0 (imposible) a 1 (seguro). Es la proporción de casos favorables entre todos los posibles.", "Sostiene juegos de azar, evaluación de riesgos, control de calidad y cualquier decisión bajo incertidumbre."],
      faq: [
        { q: "¿Qué significa una probabilidad de 0,5?", a: "Significa que el evento es tan probable como no: un 50% de chance, como cara en una moneda justa." },
        { q: "¿Cómo se escribe la probabilidad?", a: "Como fracción, como decimal entre 0 y 1, o como porcentaje entre 0 % y 100 %." },
        { q: "¿Se pueden sumar probabilidades?", a: "Solo para eventos mutuamente excluyentes. Si no, debes considerar el solapamiento para no contar dos veces." },
      ],
      metaDescription: "Calculadora de probabilidad gratis en línea. Halla la chance de eventos simples o combinados, sin registro, en fracción, decimal y porcentaje.",
    },
  },

  "z-score-calculator": {
    en: {
      steps: ["Enter the raw score you want to standardize.", "Enter the mean and the standard deviation of the data set.", "Read the z-score and what it tells you about the value's position."],
      explanationTitle: "What Is a Z-Score?",
      formula: "z = (x − μ) / σ",
      explanation: ["A z-score tells you how many standard deviations a value sits above or below the mean. A positive score is above average; a negative one is below.", "Z-scores let you compare values from different distributions on a common scale and identify outliers."],
      faq: [
        { q: "What does a z-score of 0 mean?", a: "It means the value is exactly equal to the mean of the data set." },
        { q: "Is a higher z-score always better?", a: "Not necessarily. It only shows distance from the mean; whether that is good depends on the context." },
        { q: "How do I use z-scores to find percentiles?", a: "Look the z-score up in a standard normal table, or use it with the cumulative distribution to get the percentile." },
      ],
      metaDescription: "Free online z-score calculator. Standardize any raw score with mean and SD fast, no signup, and see how far it sits from the average.",
    },
    zh: {
      steps: ["输入要标准化的原始分数。", "输入数据集的均值与标准差。", "读取 z 分数及其反映的数值位置。"],
      explanationTitle: "什么是 Z 分数？",
      formula: "z = (x − μ) / σ",
      explanation: ["Z 分数表示某个数值高于或低于均值多少个标准差。正值表示高于平均，负值表示低于平均。", "Z 分数能让你在不同分布的数值之间用统一尺度进行比较，并识别离群值。"],
      faq: [
        { q: "z 分数为 0 意味着什么？", a: "表示数值恰好等于数据集的均值。" },
        { q: "z 分数越高一定越好吗？", a: "未必。它只表示离均值的距离，是否“好”取决于具体情境。" },
        { q: "如何用 z 分数求百分位数？", a: "可在标准正态分布表中查该 z 分数，或结合累积分布求得对应的百分位。" },
      ],
      metaDescription: "免费在线 Z 分数计算器，用均值与标准差快速标准化任意原始分数，无需注册，直观显示偏离平均的程度。",
    },
    "zh-TW": {
      steps: ["輸入要標準化的原始分數。", "輸入資料集的均值與標準差。", "讀取 z 分數及其反映的數值位置。"],
      explanationTitle: "什麼是 Z 分數？",
      formula: "z = (x − μ) / σ",
      explanation: ["Z 分數表示某個數值高於或低於均值多少個標準差。正值表示高於平均，負值表示低於平均。", "Z 分數能讓你在不同分布的數值之間用統一尺度進行比較，並識別離群值。"],
      faq: [
        { q: "z 分數為 0 意味著什麼？", a: "表示數值恰好等於資料集的均值。" },
        { q: "z 分數越高一定越好嗎？", a: "未必。它只表示離均值的距離，是否「好」取決於具體情境。" },
        { q: "如何用 z 分數求百分位數？", a: "可在標準常態分配表中查該 z 分數，或結合累積分配求得對應的百分位。" },
      ],
      metaDescription: "免費線上 Z 分數計算機，用均值與標準差快速標準化任意原始分數，無須註冊，直觀顯示偏離平均的程度。",
    },
    de: {
      steps: ["Gib den rohen Wert ein, den du standardisieren willst.", "Gib den Mittelwert und die Standardabweichung des Datensatzes ein.", "Lies den z-Wert und was er über die Position des Werts aussagt."],
      explanationTitle: "Was ist ein z-Wert?",
      formula: "z = (x − μ) / σ",
      explanation: ["Ein z-Wert gibt an, wie viele Standardabweichungen ein Wert über oder unter dem Mittelwert liegt. Positiv bedeutet über, negativ unter dem Durchschnitt.", "z-Werte erlauben den Vergleich von Werten aus verschiedenen Verteilungen auf einer gemeinsamen Skala und das Erkennen von Ausreißern."],
      faq: [
        { q: "Was bedeutet ein z-Wert von 0?", a: "Er bedeutet, dass der Wert genau dem Mittelwert des Datensatzes entspricht." },
        { q: "Ist ein höherer z-Wert immer besser?", a: "Nicht unbedingt. Er zeigt nur den Abstand zum Mittelwert; ob das gut ist, hängt vom Kontext ab." },
        { q: "Wie finde ich mit z-Werten Perzentile?", a: "Schlage den z-Wert in einer Standardnormaltabelle nach oder nutze die kumulative Verteilung." },
      ],
      metaDescription: "Kostenloser Online-z-Wert-Rechner. Standardisiere jeden Rohwert mit Mittelwert und SD schnell, ohne Anmeldung, und sieh die Entfernung zum Durchschnitt.",
    },
    ja: {
      steps: ["標準化したい生の得点を入力します。", "データセットの平均と標準偏差を入力します。", "z スコアと、その値の位置関係を確認します。"],
      explanationTitle: "z スコアとは？",
      formula: "z = (x − μ) / σ",
      explanation: ["z スコアは、ある値が平均からどれだけ（標準偏差何個分）離れているかを示します。正なら平均より上、負なら下です。", "z スコアを使えば異なる分布の値を共通の尺度で比較でき、外れ値も見つかります。"],
      faq: [
        { q: "z スコアが 0 とは？", a: "その値がデータセットの平均ちょうどであることを意味します。" },
        { q: "z スコアが高いほど良いですか？", a: "必ずしもそうではありません。平均からの距離を示すだけで、良し悪しは文脈次第です。" },
        { q: "z スコアで百分位数を求めるには？", a: "標準正規分布表でその z スコアを引くか、累積分布を使って百分位数を得ます。" },
      ],
      metaDescription: "無料のオンライン z スコア計算機。平均と標準偏差で任意の生得点を標準化し、平均からの距離をすばやく表示。登録不要。",
    },
    es: {
      steps: ["Introduce la puntuación bruta que quieres estandarizar.", "Introduce la media y la desviación típica del conjunto.", "Lee el z-score y lo que indica sobre la posición del valor."],
      explanationTitle: "¿Qué es un z-score?",
      formula: "z = (x − μ) / σ",
      explanation: ["Un z-score indica cuántas desviaciones típicas está un valor por encima o por debajo de la media. Positivo está por encima; negativo, por debajo.", "Los z-scores permiten comparar valores de distintas distribuciones en una escala común e identificar valores atípicos."],
      faq: [
        { q: "¿Qué significa un z-score de 0?", a: "Significa que el valor es exactamente igual a la media del conjunto de datos." },
        { q: "¿Un z-score más alto siempre es mejor?", a: "No necesariamente. Solo muestra la distancia a la media; si es bueno depende del contexto." },
        { q: "¿Cómo uso z-scores para percentiles?", a: "Búscalo en una tabla normal estándar o úsalo con la distribución acumulada para obtener el percentil." },
      ],
      metaDescription: "Calculadora de z-score gratis en línea. Estandariza cualquier puntuación con media y DT, sin registro, y ve cuánto se aleja de la media.",
    },
  },

  "sample-size": {
    en: {
      steps: ["Enter your confidence level, margin of error, and an estimate of the population proportion.", "Add the population size if it is small and known.", "Read the required sample size to reach a reliable conclusion."],
      explanationTitle: "Why Sample Size Matters",
      formula: "n = z² · p(1−p) / e²   (with finite-population correction)",
      explanation: ["Sample size is how many observations you need to estimate a population value within a given margin of error at a chosen confidence level.", "Too small a sample gives unreliable results; too large wastes effort. The calculator balances precision against cost."],
      faq: [
        { q: "What confidence level should I use?", a: "95% is the most common default in research; 99% gives more certainty but requires a larger sample." },
        { q: "What if I don't know the population proportion?", a: "Use 0.5 (50%), which gives the most conservative, largest required sample size." },
        { q: "Does a bigger population always need a bigger sample?", a: "No. Beyond a certain size, the required sample barely changes; only small populations need the finite correction." },
      ],
      metaDescription: "Free online sample size calculator. Find how many responses you need for a given confidence and margin of error, no signup, with steps.",
    },
    zh: {
      steps: ["输入置信水平、误差幅度以及总体比例的估计值。", "若总体较小且已知，可填入总体规模。", "读取为得到可靠结论所需的最小样本量。"],
      explanationTitle: "样本量为什么重要",
      formula: "n = z² · p(1−p) / e²   （含有限总体校正）",
      explanation: ["样本量是指，在给定置信水平下，要把总体参数的估计误差控制在某个范围内，所需观测的数量。", "样本过小结论不可靠；样本过大则浪费成本。计算器在精度与成本之间取得平衡。"],
      faq: [
        { q: "应该用哪个置信水平？", a: "研究中默认多用 95%；99% 更稳妥但需要更大样本。" },
        { q: "不知道总体比例怎么办？", a: "用 0.5（50%），这会得到最保守、也即最大的所需样本量。" },
        { q: "总体越大样本就一定越大吗？", a: "不一定。超过一定规模后所需样本几乎不再变化，只有小总体才需要有限总体校正。" },
      ],
      metaDescription: "免费在线样本量计算器，按指定置信水平与误差幅度求出所需样本量，无需注册，附计算步骤。",
    },
    "zh-TW": {
      steps: ["輸入置信水準、誤差幅度以及總體比例的估計值。", "若總體較小且已知，可填入總體規模。", "讀取為得到可靠結論所需的最小樣本量。"],
      explanationTitle: "樣本量為什麼重要",
      formula: "n = z² · p(1−p) / e²   （含有限總體校正）",
      explanation: ["樣本量是指，在給定置信水準下，要把總體參數的估計誤差控制在某個範圍內，所需觀測的數量。", "樣本過小結論不可靠；樣本過大則浪費成本。計算機在精度與成本之間取得平衡。"],
      faq: [
        { q: "應該用哪個置信水準？", a: "研究中預設多用 95%；99% 更穩妥但需要更大樣本。" },
        { q: "不知道總體比例怎麼辦？", a: "用 0.5（50%），這會得到最保守、也即最大的所需樣本量。" },
        { q: "總體越大樣本就一定越大嗎？", a: "不一定。超過一定規模後所需樣本幾乎不再變化，只有小總體才需要有限總體校正。" },
      ],
      metaDescription: "免費線上樣本量計算機，按指定置信水準與誤差幅度求出所需樣本量，無須註冊，附計算步驟。",
    },
    de: {
      steps: ["Gib das Konfidenzniveau, den Fehlerbereich und eine Schätzung des Anteils ein.", "Füge die Grundgesamtheit hinzu, wenn sie klein und bekannt ist.", "Lies die nötige Stichprobengröße für ein verlässliches Ergebnis."],
      explanationTitle: "Warum die Stichprobengröße wichtig ist",
      formula: "n = z² · p(1−p) / e²   (mit Korrektur für endliche Grundgesamtheit)",
      explanation: ["Die Stichprobengröße ist die Zahl der Beobachtungen, die nötig sind, um einen Populationswert innerhalb eines Fehlerbereichs bei gewähltem Konfidenzniveau zu schätzen.", "Eine zu kleine Stichprobe liefert unzuverlässige Ergebnisse; eine zu große verschwendet Aufwand. Der Rechner balanciert Präzision und Kosten."],
      faq: [
        { q: "Welches Konfidenzniveau soll ich wählen?", a: "95 % ist der üblichste Standard in der Forschung; 99 % ist sicherer, braucht aber eine größere Stichprobe." },
        { q: "Was, wenn ich den Anteil nicht kenne?", a: "Nimm 0,5 (50 %), was die konservativste, also größte nötige Stichprobe liefert." },
        { q: "Braucht eine größere Grundgesamtheit immer eine größere Stichprobe?", a: "Nein. Ab einer gewissen Größe ändert sich die nötige Stichprobe kaum; nur kleine Populationen brauchen die Korrektur." },
      ],
      metaDescription: "Kostenloser Online-Stichprobenrechner. Finde die nötige Teilnehmerzahl für ein Konfidenzniveau und einen Fehlerbereich, ohne Anmeldung.",
    },
    ja: {
      steps: ["信頼水準・誤差の幅・全体の比率の推定値を入力します。", "全体が小さく既知の場合は全体数を入力します。", "信頼できる結論を得るために必要な標本サイズを確認します。"],
      explanationTitle: "標本サイズが重要な理由",
      formula: "n = z² · p(1−p) / e²   （有限母集団補正付き）",
      explanation: ["標本サイズとは、一定の信頼水準のもとで全体の値をある誤差幅内に収めるために必要な観測数です。", "標本が小さすぎると結論が不確かになり、大きすぎると手間が無駄になります。計算機は精度とコストのバランスをとります。"],
      faq: [
        { q: "どの信頼水準を使えばいいですか？", a: "研究では95%が最も一般的です。99%はより確実ですが標本が大きくなります。" },
        { q: "全体の比率がわからない場合は？", a: "0.5（50%）を使うと、最も保守的＝最大の必要標本サイズが得られます。" },
        { q: "母集団が大きいほど標本も大きくなりますか？", a: "いいえ。一定規模を超えると必要標本はほぼ変わらず、小さな母集団のみ補正が必要です。" },
      ],
      metaDescription: "無料のオンライン標本サイズ計算機。指定の信頼水準と誤差の幅に必要な回答数をすばやく算出。登録不要。",
    },
    es: {
      steps: ["Introduce el nivel de confianza, el margen de error y una estimación de la proporción.", "Añade el tamaño de la población si es pequeña y conocida.", "Lee el tamaño de muestra necesario para una conclusión fiable."],
      explanationTitle: "Por qué importa el tamaño de muestra",
      formula: "n = z² · p(1−p) / e²   (con corrección para población finita)",
      explanation: ["El tamaño de muestra es cuántas observaciones necesitas para estimar un valor poblacional dentro de un margen de error y un nivel de confianza dados.", "Una muestra muy pequeña da resultados poco fiables; una muy grande desperdicia esfuerzo. La calculadora equilibra precisión y coste."],
      faq: [
        { q: "¿Qué nivel de confianza uso?", a: "El 95 % es el más común en investigación; el 99 % da más certeza pero exige muestra mayor." },
        { q: "Si no sé la proporción poblacional, ¿qué hago?", a: "Usa 0,5 (50 %), que da el tamaño necesario más conservador y mayor." },
        { q: "¿Una población mayor siempre exige muestra mayor?", a: "No. Pasado cierto tamaño, la muestra barely cambia; solo las poblaciones pequeñas necesitan la corrección." },
      ],
      metaDescription: "Calculadora de tamaño de muestra gratis en línea. Halla cuántas respuestas necesitas para una confianza y margen dados, sin registro.",
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
    if (!g) {
      console.error(`MISSING lang ${lang} for ${id}`);
      process.exit(1);
    }
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
console.log(`Injected ${total} guide sets (math, 8 tools x 6 langs).`);
