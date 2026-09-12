// 第五批 A 层深度文案注入：15 个数学基础+日期工具 × 6 语言
import fs from "fs";

const LANGS = ["en", "zh", "zh-TW", "de", "ja", "es"];
const FILE = (l) => `./src/messages/${l}.json`;

const DATA = {
  "percent-error": {
    en: {
      steps: [
        "Enter the measured (experimental) value and the accepted (true) value.",
        "Choose whether to see the absolute error as well as the percentage.",
        "Read the percent error, which tells you how far the measurement is from the reference.",
      ],
      explanationTitle: "What percent error measures",
      formula: "Percent error = |measured - accepted| / |accepted| x 100%",
      explanation: [
        "Percent error expresses the size of a mistake relative to the true value, so a 5 percent error means the same proportion whether you measured grams or kilometres.",
        "A smaller percent error means higher accuracy. Systematic errors from a faulty instrument show up as consistently biased results.",
      ],
      faq: [
        { q: "Can percent error be negative?", a: "The formula uses absolute value, so it is reported as a positive magnitude; the sign is dropped to show size, not direction." },
        { q: "What is a good percent error?", a: "It depends on the field; school labs often target under 5 percent, while precision engineering expects far less." },
        { q: "Percent error vs percent difference?", a: "Error compares a measurement to a known true value; difference compares two measurements to each other." },
      ],
    },
    zh: {
      steps: [
        "输入测量（实验）值与公认（真实）值。",
        "选择是否同时查看绝对误差与百分比误差。",
        "查看百分比误差，它告诉你测量值偏离参考值多少。",
      ],
      explanationTitle: "百分比误差衡量什么",
      formula: "百分比误差 = |测量值 - 真值| / |真值| × 100%",
      explanation: [
        "百分比误差表示错误相对于真实值的大小，因此无论你测的是克还是公里，5% 都代表相同的比例。",
        "百分比误差越小，准确度越高。仪器故障导致的系统误差会表现为持续偏向某一侧的结果。",
      ],
      faq: [
        { q: "百分比误差可以为负吗？", a: "公式使用绝对值，因此结果以正的幅度呈现；符号被去掉以表示大小而非方向。" },
        { q: "多少百分比误差算好？", a: "取决于领域：学校实验常要求低于 5%，而精密工程要求远低于此。" },
        { q: "百分比误差和百分比差异有何不同？", a: "误差是将测量值与已知真值比较；差异是两个测量值之间的相互比较。" },
      ],
    },
    zhTW: {
      steps: [
        "輸入測量（實驗）值與公認（真實）值。",
        "選擇是否同時查看絕對誤差與百分比誤差。",
        "查看百分比誤差，它告訴你測量值偏離參考值多少。",
      ],
      explanationTitle: "百分比誤差衡量什麼",
      formula: "百分比誤差 = |測量值 - 真值| / |真值| × 100%",
      explanation: [
        "百分比誤差表示錯誤相對於真實值的大小，因此無論你測的是克還是公里，5% 都代表相同的比例。",
        "百分比誤差越小，準確度越高。儀器故障導致的系統誤差會表現為持續偏向某一側的結果。",
      ],
      faq: [
        { q: "百分比誤差可以為負嗎？", a: "公式使用絕對值，因此結果以正的幅度呈現；符號被去掉以表示大小而非方向。" },
        { q: "多少百分比誤差算好？", a: "取決於領域：學校實驗常要求低於 5%，而精密工程要求遠低於此。" },
        { q: "百分比誤差和百分比差異有何不同？", a: "誤差是將測量值與已知真值比較；差異是兩個測量值之間的相互比較。" },
      ],
    },
    de: {
      steps: [
        "Gib den gemessenen (experimentellen) und den akzeptierten (wahren) Wert ein.",
        "Wahle, ob zusatzlich der absolute Fehler angezeigt wird.",
        "Lies den Prozentfehler, der angibt, wie weit die Messung von der Referenz abweicht.",
      ],
      explanationTitle: "Was der Prozentfehler misst",
      formula: "Prozentfehler = |gemessen - akzeptiert| / |akzeptiert| x 100%",
      explanation: [
        "Der Prozentfehler drückt die Grobe eines Fehlers relativ zum wahren Wert aus; 5 Prozent bedeuten denselben Anteil, egal ob Gramm oder Kilometer gemessen wurden.",
        "Ein kleinerer Prozentfehler bedeutet hohere Genauigkeit. Systematische Fehler eines fehlerhaften Gerats zeigen sich als standig verzerrte Ergebnisse.",
      ],
      faq: [
        { q: "Kann der Prozentfehler negativ sein?", a: "Die Formel nutzt den Betrag, daher wird er als positive Grobe gemeldet; das Vorzeichen wird fur die Grobe weggelassen." },
        { q: "Was ist ein guter Prozentfehler?", a: "Das hangt vom Feld ab; Schullabore zielen oft unter 5 Prozent, Prazisionsbau deutlich weniger." },
        { q: "Prozentfehler vs. prozentuale Differenz?", a: "Der Fehler vergleicht eine Messung mit einem wahren Wert; die Differenz vergleicht zwei Messungen miteinander." },
      ],
    },
    ja: {
      steps: [
        "測定（実験）値と公認（真の）値を入力します。",
        "絶対誤差と割合の両方を表示するか選択します。",
        "百分率誤差を確認します。これは測定値が基準値からどれだけ離れているかを示します。",
      ],
      explanationTitle: "百分率誤差が測るもの",
      formula: "百分率誤差 = |測定値 - 真値| / |真値| × 100%",
      explanation: [
        "百分率誤差は真の値に対する誤りの大きさを表します。5% の誤差はグラムでもキロメートルでも同じ割合を意味します。",
        "百分率誤差が小さいほど精度が高いです。機器不良による系統誤差は一貫して偏った結果として現れます。",
      ],
      faq: [
        { q: "百分率誤差は負になりますか？", a: "式は絶対値を用いるため正の大きさとして示され、方向ではなく大きさのみを表します。" },
        { q: "どのくらいの百分率誤差が良い？", a: "分野によります。学校の実験では5%未満が目安ですが、精密工学ではさらに小さくなります。" },
        { q: "百分率誤差と百分率差異の違いは？", a: "誤差は測定値と既知の真値を比較します。差異は2つの測定値同士を比較します。" },
      ],
    },
    es: {
      steps: [
        "Introduce el valor medido (experimental) y el valor aceptado (real).",
        "Elige si quieres ver tambien el error absoluto ademas del porcentaje.",
        "Lee el error porcentual, que indica cuanto se aleja la medida de la referencia.",
      ],
      explanationTitle: "Que mide el error porcentual",
      formula: "Error porcentual = |medido - aceptado| / |aceptado| x 100%",
      explanation: [
        "El error porcentual expresa el tamano de un error relativo al valor verdadero, asi que un 5 por ciento significa la misma proporcion ya midas gramos o kilometros.",
        "Un error porcentual menor indica mayor precision. Los errores sistematicos de un instrumento defectuoso aparecen como resultados sistematicamente sesgados.",
      ],
      faq: [
        { q: "Puede ser negativo el error porcentual?", a: "La formula usa valor absoluto, asi que se reporta como magnitud positiva; se omite el signo para mostrar tamano, no direccion." },
        { q: "Que error porcentual es bueno?", a: "Depende del campo; los laboratorios escolares suelen buscar menos de 5 por ciento, la ingenieria de precision espera mucho menos." },
        { q: "Error porcentual vs diferencia porcentual?", a: "El error compara una medida con un valor verdadero conocido; la diferencia compara dos medidas entre si." },
      ],
    },
  },

  "rounding-calculator": {
    en: {
      steps: [
        "Enter the number you want to round and choose the target decimal places or significant figures.",
        "Pick a rounding rule such as round half up or round to even if offered.",
        "Read the rounded result and the digits that were kept.",
      ],
      explanationTitle: "Why rounding rules matter",
      formula: "Round to n decimals: keep n digits after the point, adjust the last kept digit by the next",
      explanation: [
        "Rounding reduces noise from measurements that are not exact, but repeated rounding can drift results, so round only at the final step.",
        "Different rules (half up versus round to even) handle the exact .5 case differently, which matters in statistics and finance.",
      ],
      faq: [
        { q: "What is round half to even?", a: "When the dropped part is exactly .5, round to the nearest even digit; this avoids bias when many .5 cases occur." },
        { q: "Should I round during each step?", a: "No. Keep full precision while calculating and round only the final answer to avoid accumulating error." },
        { q: "What are significant figures?", a: "They are the meaningful digits carried by a measurement's precision, counting from the first non-zero digit." },
      ],
    },
    zh: {
      steps: [
        "输入要四舍五入的数字，并选择目标小数位数或有效数字。",
        "若提供选项，选择舍入规则（如四舍五入或四舍六入五成双）。",
        "查看舍入后的结果，以及保留下来的数字。",
      ],
      explanationTitle: "舍入规则为何重要",
      formula: "保留 n 位小数：保留小数点后 n 位，按后一位调整最后保留位",
      explanation: [
        "舍入能减少不精确测量带来的噪声，但反复舍入会让结果漂移，因此只在最后一步舍入。",
        "不同规则（四舍五入 vs 四舍六入五成双）对正好 .5 的情形处理不同，这在统计和金融中很关键。",
      ],
      faq: [
        { q: "什么是「四舍六入五成双」？", a: "当舍去部分恰好为 .5 时，向最近的偶数位舍入，可在大量 .5 情形中避免偏差。" },
        { q: "每一步都要舍入吗？", a: "不要。计算时保留完整精度，只对最终答案舍入，以免误差累积。" },
        { q: "什么是有效数字？", a: "它们是反映测量精度的有意义数字，从第一个非零数字开始计数。" },
      ],
    },
    zhTW: {
      steps: [
        "輸入要四捨五捨入的數字，並選擇目標小數位數或有效數字。",
        "若提供選項，選擇捨入規則（如四捨五入或四捨六入五成雙）。",
        "查看捨入後的結果，以及保留下來的數字。",
      ],
      explanationTitle: "捨入規則為何重要",
      formula: "保留 n 位小數：保留小數點後 n 位，按後一位調整最後保留位",
      explanation: [
        "捨入能減少不精確測量帶來的雜訊，但反覆捨入會讓結果漂移，因此只在最後一步捨入。",
        "不同規則（四捨五入 vs 四捨六入五成雙）對正好 .5 的情形處理不同，這在統計和金融中很關鍵。",
      ],
      faq: [
        { q: "什麼是「四捨六入五成雙」？", a: "當捨去部分恰好為 .5 時，向最近的偶數位捨入，可在大量 .5 情形中避免偏差。" },
        { q: "每一步都要捨入嗎？", a: "不要。計算時保留完整精度，只對最終答案捨入，以免誤差累積。" },
        { q: "什麼是有效數字？", a: "它們是反映測量精度的有意義數字，從第一個非零數字開始計數。" },
      ],
    },
    de: {
      steps: [
        "Gib die zu rundende Zahl ein und wahle die Ziel-Dezimalstellen oder Signifikanten.",
        "Wahle eine Rundungsregel wie Aufrunden bei .5 oder Runden zur geraden Zahl, falls angeboten.",
        "Lies das gerundete Ergebnis und die behaltenen Stellen.",
      ],
      explanationTitle: "Warum Rundungsregeln wichtig sind",
      formula: "Auf n Nachkommastellen: n Stellen nach dem Punkt behalten, letzte an der Folge anpassen",
      explanation: [
        "Runden reduziert Rauschen ungenauer Messungen, aber wiederholtes Runden kann Ergebnisse verschieben; runde daher erst am Ende.",
        "Verschiedene Regeln (Aufrunden bei .5 versus zur geraden Zahl) behandeln genau den .5-Fall unterschiedlich, was in Statistik und Finanzen zahlt.",
      ],
      faq: [
        { q: "Was ist Runden zur geraden Zahl?", a: "Ist der wegfallende Teil genau .5, wird zur nachstgelegenen geraden Ziffer gerundet; das vermeidet Bias bei vielen .5-Fallen." },
        { q: "Sollte ich bei jedem Schritt runden?", a: "Nein. Behalte volle Prazision und runde erst das Endergebnis, um Fehlerzuwachs zu vermeiden." },
        { q: "Was sind signifikante Stellen?", a: "Es sind die sinnvollen Ziffern einer Messgenauigkeit, gezahlt ab der ersten von null verschiedenen Ziffer." },
      ],
    },
    ja: {
      steps: [
        "丸めたい数値を入力し、目標の小数桁数または有効数字を選びます。",
        "「四捨五入」や「偶数への丸め」など規則を選択します（ある場合）。",
        "丸め後の結果と、残された桁を確認します。",
      ],
      explanationTitle: "丸め規則が重要な理由",
      formula: "n 小数桁へ：小数点以下 n 桁を残し、次の桁で最終桁を調整",
      explanation: [
        "丸めは不正確な測定のノイズを減らしますが、繰り返すと結果がずれるため、最後のステップでのみ丸めます。",
        "「四捨五入」と「偶数への丸め」ではちょうど .5 の扱いが異なり、統計や金融で重要です。",
      ],
      faq: [
        { q: "偶数への丸めとは？", a: "切り捨て部分がちょうど .5 のとき、最も近い偶数の桁へ丸めます。多数の .5 が出る場合の偏りを防ぎます。" },
        { q: "各ステップで丸めるべき？", a: "いいえ。計算中は精度を保ち、最終回答のみを丸めて誤差の蓄積を避けてください。" },
        { q: "有効数字とは？", a: "測定の精度を表す意味のある数字で、最初の非ゼロ数字から数えます。" },
      ],
    },
    es: {
      steps: [
        "Introduce el numero que quieres redondear y elige decimales objetivo o cifras significativas.",
        "Elige una regla como redondeo medio arriba o al par si se ofrece.",
        "Lee el resultado redondeado y las cifras que se conservaron.",
      ],
      explanationTitle: "Por que importan las reglas de redondeo",
      formula: "A n decimales: conserva n cifras tras el punto y ajusta la ultima segun la siguiente",
      explanation: [
        "Redondear reduce el ruido de medidas inexactas, pero redondear repetidas veces puede desplazar resultados, asi que redondea solo al final.",
        "Distintas reglas (medio arriba vs al par) tratan el caso exacto .5 de forma distinta, lo cual importa en estadistica y finanzas.",
      ],
      faq: [
        { q: "Que es redondear al par?", a: "Cuando la parte descartada es exactamente .5, se redondea al digito par mas cercano; evita sesgo cuando hay muchos casos .5." },
        { q: "Debo redondear en cada paso?", a: "No. Manten la precision completa y redondea solo la respuesta final para evitar acumular error." },
        { q: "Que son cifras significativas?", a: "Son los digitos con sentido que lleva la precision de una medida, contando desde el primer digito no cero." },
      ],
    },
  },

  "exponent-calculator": {
    en: {
      steps: [
        "Enter the base and the exponent you want to apply.",
        "Choose whether the exponent is positive, negative, or fractional.",
        "Read the result, noting that negative exponents mean division by the base.",
      ],
      explanationTitle: "How exponents work",
      formula: "a^n = a x a x ... (n times); a^-n = 1 / a^n; a^(1/n) = n-th root",
      explanation: [
        "An exponent tells you how many times to multiply the base by itself; a negative exponent flips it to a fraction, and a fractional one is a root.",
        "Exponents turn repeated multiplication into a compact power, which is why they appear in growth, decay, and scientific notation.",
      ],
      faq: [
        { q: "What does a negative exponent mean?", a: "It means one divided by the base raised to that power, so 2^-3 equals 1/8." },
        { q: "How do I multiply powers?", a: "Keep the base and add exponents: a^m x a^n = a^(m+n)." },
        { q: "What is a fractional exponent?", a: "The denominator is the root; for example x^(1/2) is the square root of x." },
      ],
    },
    zh: {
      steps: [
        "输入底数以及要施加的指数。",
        "选择指数为正、负还是分数。",
        "查看结果，注意负指数表示除以底数。",
      ],
      explanationTitle: "指数如何运作",
      formula: "a^n = a × a × …（n 次）；a^-n = 1 / a^n；a^(1/n) = n 次方根",
      explanation: [
        "指数表示将底数自乘的次数；负指数会转化为分数，而分数指数等同于开方。",
        "指数把重复的乘法压缩成紧凑的幂，这也是它出现在增长、衰减和科学计数法中的原因。",
      ],
      faq: [
        { q: "负指数表示什么？", a: "表示 1 除以底数的该次幂，因此 2^-3 等于 1/8。" },
        { q: "幂如何相乘？", a: "保持底数不变、指数相加：a^m × a^n = a^(m+n)。" },
        { q: "分数指数是什么？", a: "分母是根的次数；例如 x^(1/2) 就是 x 的平方根。" },
      ],
    },
    zhTW: {
      steps: [
        "輸入底數以及要施加的指數。",
        "選擇指數為正、負還是分數。",
        "查看結果，注意負指數表示除以底數。",
      ],
      explanationTitle: "指數如何運作",
      formula: "a^n = a × a × …（n 次）；a^-n = 1 / a^n；a^(1/n) = n 次方根",
      explanation: [
        "指數表示將底數自乘的次數；負指數會轉化為分數，而分數指數等同於開方。",
        "指數把重複的乘法壓縮成緊湊的冪，這也是它出現在增長、衰減和科學計數法中的原因。",
      ],
      faq: [
        { q: "負指數表示什麼？", a: "表示 1 除以底數的該次冪，因此 2^-3 等於 1/8。" },
        { q: "冪如何相乘？", a: "保持底數不變、指數相加：a^m × a^n = a^(m+n)。" },
        { q: "分數指數是什麼？", a: "分母是根的次數；例如 x^(1/2) 就是 x 的平方根。" },
      ],
    },
    de: {
      steps: [
        "Gib die Basis und den anzuwendenden Exponenten ein.",
        "Wahle, ob der Exponent positiv, negativ oder gebrochen ist.",
        "Lies das Ergebnis; negative Exponenten bedeuten Division durch die Basis.",
      ],
      explanationTitle: "Wie Exponenten funktionieren",
      formula: "a^n = a x a x ... (n-mal); a^-n = 1 / a^n; a^(1/n) = n-te Wurzel",
      explanation: [
        "Ein Exponent sagt, wie oft die Basis mit sich selbst multipliziert wird; ein negativer Exponent macht daraus einen Bruch, ein gebrochener ist eine Wurzel.",
        "Exponenten wandeln wiederholte Multiplikation in eine kompakte Potenz, weshalb sie bei Wachstum, Zerfall und wissenschaftlicher Notation auftreten.",
      ],
      faq: [
        { q: "Was bedeutet ein negativer Exponent?", a: "Er meint eins geteilt durch die Basis hoch diesem Exponenten, also ist 2^-3 = 1/8." },
        { q: "Wie multipliziere ich Potenzen?", a: "Basis beibehalten und Exponenten addieren: a^m x a^n = a^(m+n)." },
        { q: "Was ist ein gebrochener Exponent?", a: "Der Nenner ist die Wurzel; x^(1/2) ist zum Beispiel die Quadratwurzel von x." },
      ],
    },
    ja: {
      steps: [
        "底（ベース）と適用する指数を入力します。",
        "指数が正・負・分数のいずれかを選びます。",
        "結果を確認します。負の指数は底で割ることを意味します。",
      ],
      explanationTitle: "指数の仕組み",
      formula: "a^n = a × a × …（n 回）；a^-n = 1 / a^n；a^(1/n) = n 乗根",
      explanation: [
        "指数は底を何回自分自身と掛けるかを示します。負の指数は分数になり、分数の指数は根号になります。",
        "指数は繰り返す掛け算をコンパクトな累乗にまとめるため、成長・減衰・科学的記数法で頻出します。",
      ],
      faq: [
        { q: "負の指数は何を意味？", a: "1 を底のその累乗で割ることを意味します。例えば 2^-3 = 1/8。" },
        { q: "累乗をどう掛ける？", a: "底をそのままにして指数を足します。a^m × a^n = a^(m+n)。" },
        { q: "分数の指数とは？", a: "分母が根の回数です。例えば x^(1/2) は x の平方根。" },
      ],
    },
    es: {
      steps: [
        "Introduce la base y el exponente que quieres aplicar.",
        "Elige si el exponente es positivo, negativo o fraccionario.",
        "Lee el resultado; los exponentes negativos significan division por la base.",
      ],
      explanationTitle: "Como funcionan los exponentes",
      formula: "a^n = a x a x ... (n veces); a^-n = 1 / a^n; a^(1/n) = raiz n-esima",
      explanation: [
        "Un exponente indica cuantas veces multiplicar la base por si misma; un exponente negativo la vuelve fraccion, y uno fraccionario es una raiz.",
        "Los exponentes condensan multiplicaciones repetidas en una potencia compacta, por eso aparecen en crecimiento, decaimiento y notacion cientifica.",
      ],
      faq: [
        { q: "Que significa un exponente negativo?", a: "Significa uno dividido por la base elevada a esa potencia, asi 2^-3 equivale a 1/8." },
        { q: "Como multiplico potencias?", a: "Conserva la base y suma exponentes: a^m x a^n = a^(m+n)." },
        { q: "Que es un exponente fraccionario?", a: "El denominador es la raiz; por ejemplo x^(1/2) es la raiz cuadrada de x." },
      ],
    },
  },

  "root-calculator": {
    en: {
      steps: [
        "Enter the radicand (the number under the root) and the index, such as 2 for square root.",
        "Choose whether to allow complex results for negative inputs if offered.",
        "Read the principal root and, for squares, the positive and negative values.",
      ],
      explanationTitle: "Understanding roots",
      formula: "n-th root of x = y where y^n = x; square root means index 2",
      explanation: [
        "A root answers the question 'which number, raised to this power, gives the radicand'; the square root is the most common case.",
        "Even roots of negative numbers are not real, so calculators either report an error or return a complex number depending on mode.",
      ],
      faq: [
        { q: "Why are there two square roots?", a: "Both a positive and a negative number square to the same value; the principal root shown is the non-negative one." },
        { q: "Can I take a root of a negative number?", a: "Odd roots (cube, etc.) of negatives are real, but even roots are not real unless complex mode is on." },
        { q: "What is the index?", a: "It is the small number that says which root; 2 is square root, 3 is cube root, and so on." },
      ],
    },
    zh: {
      steps: [
        "输入被开方数（根号下的数）以及根指数，例如平方根为 2。",
        "若提供选项，选择是否允许对负数输入返回复数结果。",
        "查看主根；对于平方根，还会给出正负两个值。",
      ],
      explanationTitle: "理解根号",
      formula: "x 的 n 次方根 = y，满足 y^n = x；平方根即指数为 2",
      explanation: [
        "根回答的是「哪个数自乘到这个次数会得到被开方数」，其中平方根最常见。",
        "负数的偶次根不是实数，因此计算器视模式不同，要么报错，要么返回复数。",
      ],
      faq: [
        { q: "为什么平方根有两个？", a: "正数和负数平方都会得到相同的值；显示的主根是其中的非负数。" },
        { q: "可以对负数开根吗？", a: "负数的奇次根（如立方根）是实数，但偶次根不是实数，除非开启复数模式。" },
        { q: "什么是根指数？", a: "它是标明取哪种根的小数字：2 为平方根，3 为立方根，依此类推。" },
      ],
    },
    zhTW: {
      steps: [
        "輸入被開方數（根號下的數）以及根指數，例如平方根為 2。",
        "若提供選項，選擇是否允許對負數輸入傳回複數結果。",
        "查看主根；對於平方根，還會給出正負兩個值。",
      ],
      explanationTitle: "理解根號",
      formula: "x 的 n 次方根 = y，滿足 y^n = x；平方根即指數為 2",
      explanation: [
        "根回答的是「哪個數自乘到這個次數會得到被開方數」，其中平方根最常見。",
        "負數的偶次根不是實數，因此計算器視模式不同，要么報錯，要么傳回複數。",
      ],
      faq: [
        { q: "為什麼平方根有兩個？", a: "正數和負數平方都會得到相同的值；顯示的主根是其中的非負數。" },
        { q: "可以對負數開根嗎？", a: "負數的奇次根（如立方根）是實數，但偶次根不是實數，除非開啟複數模式。" },
        { q: "什麼是根指數？", a: "它是標明取哪種根的小數字：2 為平方根，3 為立方根，依此類推。" },
      ],
    },
    de: {
      steps: [
        "Gib den Radikanden (Zahl unter der Wurzel) und den Index ein, zum Beispiel 2 fur die Quadratwurzel.",
        "Wahle, ob bei negativen Eingaben komplexe Ergebnisse erlaubt sind, falls angeboten.",
        "Lies die Hauptwurzel und bei Quadraten die positiven und negativen Werte.",
      ],
      explanationTitle: "Wurzeln verstehen",
      formula: "n-te Wurzel aus x = y mit y^n = x; Quadratwurzel hat Index 2",
      explanation: [
        "Eine Wurzel beantwortet 'welche Zahl, hoch diesem Exponenten, ergibt den Radikanden'; die Quadratwurzel ist der haufigste Fall.",
        "Gerade Wurzeln negativer Zahlen sind nicht reell, daher melden Rechner entweder einen Fehler oder liefern eine komplexe Zahl, je nach Modus.",
      ],
      faq: [
        { q: "Warum gibt es zwei Quadratwurzeln?", a: "Sowohl eine positive als auch eine negative Zahl quadrieren zum selben Wert; die gezeigte Hauptwurzel ist die nicht-negative." },
        { q: "Kann ich eine Wurzel aus einer negativen Zahl ziehen?", a: "Ungerade Wurzeln (Kubik etc.) Negativer sind reell, gerade Wurzeln jedoch nicht, es sei denn der Komplexmodus ist an." },
        { q: "Was ist der Index?", a: "Es ist die kleine Zahl, die angibt, welche Wurzel; 2 ist Quadratwurzel, 3 Kubikwurzel und so weiter." },
      ],
    },
    ja: {
      steps: [
        "被开方数（根号内の数）と根指数を入力します。例えば平方根は 2。",
        "負の入力に対して複素数結果を許可するか選択します（ある場合）。",
        "主根を確認します。平方根では正と負の両方の値も表示されます。",
      ],
      explanationTitle: "根（るい）の理解",
      formula: "x の n 乗根 = y（y^n = x）；平方根は指数 2",
      explanation: [
        "根は「この回数だけ自乗すると被开方数になるのはどの数か」に答えるもので、平方根が最も一般的です。",
        "負数の偶乗根は実数ではないため、計算機はモードによりエラーを出すか複素数を返します。",
      ],
      faq: [
        { q: "平方根が2つあるのはなぜ？", a: "正の数も負の数も平方すると同じ値になるためです。表示される主根は非負の方です。" },
        { q: "負数の根をとれる？", a: "負数の奇乗根（立方根など）は実数ですが、偶乗根は複素数モードでない限り実数ではありません。" },
        { q: "指数とは？", a: "どの根かを示す小さな数字です。2 は平方根、3 は立方根、以下同様。" },
      ],
    },
    es: {
      steps: [
        "Introduce el radicando (numero bajo la raiz) y el indice, como 2 para la raiz cuadrada.",
        "Elige si permitir resultados complejos para entradas negativas, si se ofrece.",
        "Lee la raiz principal y, para cuadradas, los valores positivo y negativo.",
      ],
      explanationTitle: "Entender las raices",
      formula: "raiz n-esima de x = y donde y^n = x; raiz cuadrada tiene indice 2",
      explanation: [
        "Una raiz responde 'que numero, elevado a esta potencia, da el radicando'; la raiz cuadrada es el caso mas comun.",
        "Las raices pares de numeros negativos no son reales, asi que la calculadora reporta error o devuelve un numero complejo segun el modo.",
      ],
      faq: [
        { q: "Por que hay dos raices cuadradas?", a: "Tanto un numero positivo como un negativo al cuadrado dan el mismo valor; la raiz principal mostrada es la no negativa." },
        { q: "Puedo sacar raiz de un negativo?", a: "Las raices impares (cubica, etc.) de negativos son reales, pero las pares no lo son salvo que el modo complejo este activo." },
        { q: "Que es el indice?", a: "Es el numero pequeño que indica cual raiz; 2 es cuadrada, 3 cubica, y asi sucesivamente." },
      ],
    },
  },

  "logarithm-calculator": {
    en: {
      steps: [
        "Enter the number whose logarithm you need and pick the base, such as 10, e, or 2.",
        "Choose natural log, common log, or a custom base if available.",
        "Read the result, which is the exponent that reaches your number.",
      ],
      explanationTitle: "What a logarithm is",
      formula: "log_b(x) = y means b^y = x",
      explanation: [
        "A logarithm is the inverse of exponentiation: it tells you what power the base must be raised to in order to equal the number.",
        "Logarithms compress huge ranges into manageable numbers, which is why they appear in pH, decibels, and earthquake magnitude.",
      ],
      faq: [
        { q: "What is the difference between ln and log?", a: "ln uses base e (about 2.718); log usually means base 10 in many contexts, though some fields use log for base e." },
        { q: "Can I take the log of zero or a negative?", a: "No real logarithm exists for zero or negatives; the result would require an impossible power." },
        { q: "How do I change the base?", a: "Use the change-of-base rule: log_b(x) = log_k(x) / log_k(b) for any convenient base k." },
      ],
    },
    zh: {
      steps: [
        "输入需要取对数的数字，并选择底数，如 10、e 或 2。",
        "选择自然对数、常用对数或自定义底数（若可用）。",
        "查看结果，即达到该数字所需的指数。",
      ],
      explanationTitle: "什么是对数",
      formula: "log_b(x) = y 表示 b^y = x",
      explanation: [
        "对数是乘方的逆运算：它告诉你底数要自乘到多少次幂才能等于该数字。",
        "对数能把巨大的范围压缩成易处理的数字，这也是它出现在 pH、分贝和地震震级中的原因。",
      ],
      faq: [
        { q: "ln 和 log 有什么区别？", a: "ln 使用自然底数 e（约 2.718）；log 在许多语境下指以 10 为底，但有些领域用 log 表示以 e 为底。" },
        { q: "可以对零或负数取对数吗？", a: "零或负数没有实数对数，因为那需要不可能的幂。" },
        { q: "如何换底？", a: "使用换底公式：log_b(x) = log_k(x) / log_k(b)，k 可为任意方便的底数。" },
      ],
    },
    zhTW: {
      steps: [
        "輸入需要取對數的數字，並選擇底數，如 10、e 或 2。",
        "選擇自然對數、常用對數或自訂底數（若可用）。",
        "查看結果，即達到該數字所需的指數。",
      ],
      explanationTitle: "什麼是對數",
      formula: "log_b(x) = y 表示 b^y = x",
      explanation: [
        "對數是乘方的逆運算：它告訴你底數要自乘到多少次幂才能等於該數字。",
        "對數能把巨大的範圍壓縮成易處理的數字，這也是它出現在 pH、分貝和地震震級中的原因。",
      ],
      faq: [
        { q: "ln 和 log 有什麼區別？", a: "ln 使用自然底數 e（約 2.718）；log 在許多語境下指以 10 為底，但有些領域用 log 表示以 e 為底。" },
        { q: "可以對零或負數取對數嗎？", a: "零或負數沒有實數對數，因為那需要不可能的冪。" },
        { q: "如何換底？", a: "使用換底公式：log_b(x) = log_k(x) / log_k(b)，k 可為任意方便的底數。" },
      ],
    },
    de: {
      steps: [
        "Gib die Zahl, deren Logarithmus du brauchst, und die Basis ein, wie 10, e oder 2.",
        "Wahle naturlichon Logarithmus, Zehnerlogarithmus oder eine eigene Basis, falls verfugbar.",
        "Lies das Ergebnis, also den Exponenten, der die Zahl erreicht.",
      ],
      explanationTitle: "Was ein Logarithmus ist",
      formula: "log_b(x) = y bedeutet b^y = x",
      explanation: [
        "Ein Logarithmus ist die Umkehrung der Potenz: er sagt, auf welche Potenz die Basis erhoben werden muss, um die Zahl zu ergeben.",
        "Logarithmen komprimieren riesige Bereiche in handhabbare Zahlen, weshalb sie bei pH, Dezibel und Erdbebenmagnitude auftreten.",
      ],
      faq: [
        { q: "Was unterscheidet ln und log?", a: "ln nutzt Basis e (etwa 2,718); log meint in vielen Kontexten Basis 10, manche Felder nutzen log fur Basis e." },
        { q: "Kann ich den Logarithmus von null oder Negativ nehmen?", a: "Fur null oder Negative gibt es keinen reellen Logarithmus, da er eine unmogliche Potenz erforderte." },
        { q: "Wie wechsle ich die Basis?", a: "Nutze die Basiswechselregel: log_b(x) = log_k(x) / log_k(b) fur beliebige Basis k." },
      ],
    },
    ja: {
      steps: [
        "対数をとる数と底（10、e、2 など）を入力します。",
        "自然対数、常用対数、または任意の底を選択します（可能な場合）。",
        "結果を確認します。それはその数に達するための指数です。",
      ],
      explanationTitle: "対数とは何か",
      formula: "log_b(x) = y は b^y = x を意味する",
      explanation: [
        "対数は累乗の逆関数です。底を何乗すればその数になるかを示します。",
        "対数は広大な範囲を扱いやすい数に圧縮するため、pH、デシベル、地震のマグニチュードなどに現れます。",
      ],
      faq: [
        { q: "ln と log の違いは？", a: "ln は自然底 e（約 2.718）を使います。log は多くの文脈で底 10 を意味しますが、分野によっては底 e を指すこともあります。" },
        { q: "0 や負数の対数はとれる？", a: "0 や負数には実数の対数が存在しません。不可能な累乗が必要になるためです。" },
        { q: "底をどう変える？", a: "底の変換公式を使います。log_b(x) = log_k(x) / log_k(b)。k は任意の便利な底。" },
      ],
    },
    es: {
      steps: [
        "Introduce el numero cuyo logaritmo necesitas y elige la base, como 10, e o 2.",
        "Elige logaritmo natural, comun o una base personalizada si esta disponible.",
        "Lee el resultado, que es el exponente que alcanza tu numero.",
      ],
      explanationTitle: "Que es un logaritmo",
      formula: "log_b(x) = y significa b^y = x",
      explanation: [
        "Un logaritmo es la inversa de la potenciacion: indica a que potencia debe elevarse la base para igualar el numero.",
        "Los logaritmos comprimen rangos enormes en numeros manejables, por eso aparecen en pH, decibelios y magnitud de sismos.",
      ],
      faq: [
        { q: "Cual es la diferencia entre ln y log?", a: "ln usa base e (cerca de 2,718); log suele significar base 10 en muchos contextos, aunque algunos campos usan log para base e." },
        { q: "Puedo sacar logaritmo de cero o negativo?", a: "No existe logaritmo real para cero o negativos; requeriria una potencia imposible." },
        { q: "Como cambio la base?", a: "Usa la regla de cambio de base: log_b(x) = log_k(x) / log_k(b) para cualquier base k comoda." },
      ],
    },
  },

  "quadratic-calculator": {
    en: {
      steps: [
        "Enter the coefficients a, b, and c from your quadratic equation a x^2 + b x + c = 0.",
        "Make sure a is not zero, otherwise the equation is linear, not quadratic.",
        "Read the roots, the discriminant, and whether the solutions are real or complex.",
      ],
      explanationTitle: "Solving quadratics",
      formula: "x = (-b ± √(b² - 4ac)) / (2a); discriminant D = b² - 4ac",
      explanation: [
        "The quadratic formula finds the two values of x where the parabola crosses the axis; the discriminant tells you how many real solutions exist.",
        "If the discriminant is positive there are two real roots, zero gives one repeated root, and negative gives two complex conjugate roots.",
      ],
      faq: [
        { q: "What does the discriminant tell me?", a: "Its sign reveals the nature of the roots: positive for two real, zero for one, negative for two complex." },
        { q: "Why are there two answers?", a: "A squared term generally yields two symmetric solutions; the plus and minus in the formula captures both." },
        { q: "What if a is zero?", a: "Then it is a linear equation with one solution; enter it into a linear solver instead." },
      ],
    },
    zh: {
      steps: [
        "输入二次方程 a x^2 + b x + c = 0 的系数 a、b、c。",
        "确保 a 不为零，否则方程是一元一次而非二次。",
        "查看根、判别式，以及解是实数还是复数。",
      ],
      explanationTitle: "求解二次方程",
      formula: "x = (-b ± √(b² - 4ac)) / (2a)；判别式 D = b² - 4ac",
      explanation: [
        "二次公式找出抛物线与坐标轴相交的两个 x 值；判别式则告诉你存在多少个实数解。",
        "判别式为正时有两个实根，为零时有一个重根，为负时有两个共轭复根。",
      ],
      faq: [
        { q: "判别式告诉我什么？", a: "它的符号揭示根的性质：正对应两个实根，零对应一个，负对应两个复根。" },
        { q: "为什么有两个答案？", a: "平方项通常会产生两个对称的解；公式中的正负号同时涵盖两者。" },
        { q: "如果 a 为零怎么办？", a: "那是一元一次方程，只有一个解；应改用线性方程求解器。" },
      ],
    },
    zhTW: {
      steps: [
        "輸入二次方程 a x^2 + b x + c = 0 的係數 a、b、c。",
        "確保 a 不為零，否則方程是一元一次而非二次。",
        "查看根、判別式，以及解是實數還是複數。",
      ],
      explanationTitle: "求解二次方程",
      formula: "x = (-b ± √(b² - 4ac)) / (2a)；判別式 D = b² - 4ac",
      explanation: [
        "二次公式找出拋物線與座標軸相交的兩個 x 值；判別式則告訴你存在多少個實數解。",
        "判別式為正時有兩個實根，為零時有一個重根，為負時有兩個共軛複根。",
      ],
      faq: [
        { q: "判別式告訴我什麼？", a: "它的符號揭示根的性質：正對應兩個實根，零對應一個，負對應兩個複根。" },
        { q: "為什麼有兩個答案？", a: "平方項通常會產生兩個對稱的解；公式中的正負號同時涵蓋兩者。" },
        { q: "如果 a 為零怎麼辦？", a: "那是一元一次方程式，只有一個解；應改用線性方程求解器。" },
      ],
    },
    de: {
      steps: [
        "Gib die Koeffizienten a, b und c deiner quadratischen Gleichung a x^2 + b x + c = 0 ein.",
        "Achte darauf, dass a nicht null ist, sonst ist die Gleichung linear, nicht quadratisch.",
        "Lies die Nullstellen, die Diskriminante und ob die Losungen reell oder komplex sind.",
      ],
      explanationTitle: "Quadratische Gleichungen losen",
      formula: "x = (-b ± √(b² - 4ac)) / (2a); Diskriminante D = b² - 4ac",
      explanation: [
        "Die quadratische Formel findet die beiden x-Werte, an denen die Parabel die Achse kreuzt; die Diskriminante sagt, wie viele reelle Losungen es gibt.",
        "Ist die Diskriminante positiv, gibt es zwei reelle Nullstellen, bei null eine doppelte, bei negativ zwei komplex konjugierte.",
      ],
      faq: [
        { q: "Was sagt die Diskriminante?", a: "Ihr Vorzeichen zeigt die Art der Wurzeln: positiv fur zwei reelle, null fur eine, negativ fur zwei komplexe." },
        { q: "Warum gibt es zwei Losungen?", a: "Ein quadratischer Term liefert meist zwei symmetrische Losungen; das Plus-Minus in der Formel erfasst beide." },
        { q: "Was, wenn a null ist?", a: "Dann ist es eine lineare Gleichung mit einer Losung; nutze stattdessen einen Linearsolver." },
      ],
    },
    ja: {
      steps: [
        "二次方程式 a x^2 + b x + c = 0 の係数 a、b、c を入力します。",
        "a が 0 でないことを確認してください。0 なら方程式は一次です。",
        "解と判別式、および解が実数か複素数かを確認します。",
      ],
      explanationTitle: "二次方程式を解く",
      formula: "x = (-b ± √(b² - 4ac)) / (2a)；判別式 D = b² - 4ac",
      explanation: [
        "二次方程式の公式は放物線が軸と交わる2つの x 値を見つけます。判別式は実数解がいくつあるかを示します。",
        "判別式が正なら実数解が2つ、0 なら重解が1つ、負なら複素共役な解が2つになります。",
      ],
      faq: [
        { q: "判別式は何を示す？", a: "符号が根の性質を表します。正は実数解2つ、0 は1つ、負は複素数解2つです。" },
        { q: "なぜ答えが2つある？", a: "2乗の項は一般に2つの対称な解を生みます。式の±が両方を捉えます。" },
        { q: "a が 0 なら？", a: "その場合は1次方程式で解は1つです。線形ソルバーを使ってください。" },
      ],
    },
    es: {
      steps: [
        "Introduce los coeficientes a, b y c de tu ecuacion cuadratica a x^2 + b x + c = 0.",
        "Asegurate de que a no sea cero; si lo es, la ecuacion es lineal, no cuadratica.",
        "Lee las raices, el discriminante y si las soluciones son reales o complejas.",
      ],
      explanationTitle: "Resolver cuadraticas",
      formula: "x = (-b ± √(b² - 4ac)) / (2a); discriminante D = b² - 4ac",
      explanation: [
        "La formula cuadratica encuentra los dos valores de x donde la parabola cruza el eje; el discriminante dice cuantas soluciones reales hay.",
        "Si el discriminante es positivo hay dos raices reales, cero da una repetida y negativo da dos raices complejas conjugadas.",
      ],
      faq: [
        { q: "Que me dice el discriminante?", a: "Su signo revela la naturaleza de las raices: positivo para dos reales, cero para una, negativo para dos complejas." },
        { q: "Por que hay dos respuestas?", a: "Un termino al cuadrado suele dar dos soluciones simetricas; el mas y menos de la formula captura ambas." },
        { q: "Que pasa si a es cero?", a: "Entonces es una ecuacion lineal con una solucion; usa un solver lineal en su lugar." },
      ],
    },
  },

  "triangle-calculator": {
    en: {
      steps: [
        "Enter any three known values of a triangle, such as two sides and an angle.",
        "Choose the solving method if several are possible for your inputs.",
        "Read the missing sides, angles, area, and perimeter.",
      ],
      explanationTitle: "Solving triangles",
      formula: "Law of sines: a/sin A = b/sin B; Law of cosines: c² = a² + b² - 2ab cos C",
      explanation: [
        "Given enough known parts, trigonometry finds the rest; which law to use depends on whether you know sides or angles.",
        "The sum of interior angles is always 180 degrees, a key check that your solved triangle is valid.",
      ],
      faq: [
        { q: "Which law should I use?", a: "Use the sine law when you have a side and its opposite angle; use the cosine law for two sides and the included angle." },
        { q: "Why do my angles not add to 180?", a: "Rounding can cause small drift; keep full precision while solving and round only at the end." },
        { q: "Can every set of inputs be solved?", a: "No. Some combinations, like three angles alone, leave the size undetermined." },
      ],
    },
    zh: {
      steps: [
        "输入三角形的任意三个已知值，例如两边一角。",
        "若你的输入支持多种解法，选择求解方法。",
        "查看未知的边长、角度、面积与周长。",
      ],
      explanationTitle: "解三角形",
      formula: "正弦定理：a/sin A = b/sin B；余弦定理：c² = a² + b² - 2ab cos C",
      explanation: [
        "在已知部分足够时，三角学能求出其余量；使用哪条定律取决于你已知的是边还是角。",
        "内角和为常数 180 度，这是验证解出的三角形是否有效的关键检查。",
      ],
      faq: [
        { q: "该用哪条定律？", a: "已知一边及其对角时用正弦定理；已知两边及其夹角时用余弦定理。" },
        { q: "为什么角度加起来不是 180？", a: "舍入会造成微小漂移；求解时保留完整精度，只在最后舍入。" },
        { q: "任意输入都能解吗？", a: "不是。某些组合（如仅有三个角）无法确定三角形的大小。" },
      ],
    },
    zhTW: {
      steps: [
        "輸入三角形的任意三個已知值，例如兩邊一角。",
        "若你的輸入支援多種解法，選擇求解方法。",
        "查看未知的邊長、角度、面積與周長。",
      ],
      explanationTitle: "解三角形",
      formula: "正弦定理：a/sin A = b/sin B；余弦定理：c² = a² + b² - 2ab cos C",
      explanation: [
        "在已知部分足夠時，三角學能求出其餘量；使用哪條定律取決於你已知的是邊還是角。",
        "內角和為常數 180 度，這是驗證解出的三角形是否有效的關鍵檢查。",
      ],
      faq: [
        { q: "該用哪條定律？", a: "已知一邊及其對角時用正弦定理；已知兩邊及其夾角時用餘弦定理。" },
        { q: "為什麼角度加起來不是 180？", a: "捨入會造成微小漂移；求解時保留完整精度，只在最後捨入。" },
        { q: "任意輸入都能解嗎？", a: "不是。某些組合（如僅有三個角）無法確定三角形的大小。" },
      ],
    },
    de: {
      steps: [
        "Gib drei bekannte Werte eines Dreiecks ein, etwa zwei Seiten und einen Winkel.",
        "Wahle das Losungsverfahren, falls mehrere moglich sind.",
        "Lies die fehlenden Seiten, Winkel, Flache und den Umfang.",
      ],
      explanationTitle: "Dreiecke losen",
      formula: "Sinusatz: a/sin A = b/sin B; Kosinussatz: c² = a² + b² - 2ab cos C",
      explanation: [
        "Bei genugend bekannten Teilen findet die Trigonometrie den Rest; welches Gesetz genutzt wird, hangt davon ab, ob Seiten oder Winkel bekannt sind.",
        "Die Innenwinkelsumme betragt immer 180 Grad, eine wichtige Kontrolle, ob das geloste Dreieck gultig ist.",
      ],
      faq: [
        { q: "Welches Gesetz soll ich nutzen?", a: "Nutze den Sinusatz bei einer Seite und ihrem Gegenwinkel; den Kosinussatz bei zwei Seiten und eingeschlossenem Winkel." },
        { q: "Warum ergeben meine Winkel nicht 180?", a: "Rundung kann kleine Abweichungen geben; behalte volle Prazision und runde erst am Ende." },
        { q: "Lasst sich jede Eingabe losen?", a: "Nein. Manche Kombinationen, etwa nur drei Winkel, lassen die Grobe offen." },
      ],
    },
    ja: {
      steps: [
        "三角形の既知の値を3つ入力します（例：2辺と1角）。",
        "入力に対して複数の解法が可能なら、解き方を選びます。",
        "不明な辺・角・面積・周の長さを確認します。",
      ],
      explanationTitle: "三角形を解く",
      formula: "正弦定理：a/sin A = b/sin B；余弦定理：c² = a² + b² - 2ab cos C",
      explanation: [
        "既知の部分が十分なら三角法で残りが求まります。辺と角のどちらが既知かで使う法則が変わります。",
        "内角の和は常に180度です。これは解いた三角形が正しいかの重要なチェックになります。",
      ],
      faq: [
        { q: "どの法則を使う？", a: "辺とその対角があれば正弦定理、2辺とその夹角があれば余弦定理を使います。" },
        { q: "なぜ角が180にならない？", a: "丸めでわずかにずれるためです。解く間は精度を保ち、最後に丸めてください。" },
        { q: "どんな入力でも解ける？", a: "いいえ。3つの角だけなど、大きさが決まらない組み合わせもあります。" },
      ],
    },
    es: {
      steps: [
        "Introduce tres valores conocidos de un triangulo, como dos lados y un angulo.",
        "Elige el metodo de resolucion si hay varios posibles para tus datos.",
        "Lee los lados, angulos, area y perimetro que faltan.",
      ],
      explanationTitle: "Resolver triangulos",
      formula: "Ley de senos: a/sin A = b/sin B; Ley de cosenos: c² = a² + b² - 2ab cos C",
      explanation: [
        "Con suficientes partes conocidas, la trigonometria halla el resto; que ley usar depende de si conoces lados o angulos.",
        "La suma de angulos interiores es siempre 180 grados, una comprobacion clave de que el triangulo resuelto es valido.",
      ],
      faq: [
        { q: "Cual ley debo usar?", a: "Usa la ley de senos cuando tienes un lado y su angulo opuesto; la de cosenos para dos lados y el angulo incluido." },
        { q: "Por que mis angulos no suman 180?", a: "El redondeo puede causar pequeño desvio; conserva precision completa y redondea solo al final." },
        { q: "Se puede resolver cualquier entrada?", a: "No. Algunas combinaciones, como solo tres angulos, dejan el tamano indeterminado." },
      ],
    },
  },

  "circle-calculator": {
    en: {
      steps: [
        "Enter the radius, diameter, or circumference of the circle.",
        "Let the tool derive the other measures from the one you provided.",
        "Read the diameter, area, and circumference together.",
      ],
      explanationTitle: "Circle measurements",
      formula: "C = 2πr, A = πr², d = 2r",
      explanation: [
        "A circle is fully described by its radius, so any one measure lets you compute the rest using pi.",
        "Area grows with the square of the radius, which is why doubling the radius quadruples the area.",
      ],
      faq: [
        { q: "What value of pi is used?", a: "Calculations use pi to many digits for accuracy; you only see it rounded in the display." },
        { q: "How do I get area from diameter?", a: "First halve the diameter to get the radius, then apply A = πr²." },
        { q: "Why is circumference proportional to radius?", a: "The ratio of circumference to diameter is always pi, a constant for every circle." },
      ],
    },
    zh: {
      steps: [
        "输入圆的半径、直径或周长。",
        "让工具根据你提供的一项推导出其余量。",
        "一并查看直径、面积与周长。",
      ],
      explanationTitle: "圆的度量",
      formula: "C = 2πr，A = πr²，d = 2r",
      explanation: [
        "圆完全由半径决定，因此任意一项都能借助 π 算出其余量。",
        "面积随半径的平方增长，这正是半径加倍会使面积变为四倍的原因。",
      ],
      faq: [
        { q: "用的是什么 π 值？", a: "计算使用多位数的 π 以保证精度，显示时才会四舍五入。" },
        { q: "如何由直径求面积？", a: "先将直径减半得到半径，再套用 A = πr²。" },
        { q: "为什么周长与半径成正比？", a: "周长与直径的比值恒为 π，对任意圆都是常数。" },
      ],
    },
    zhTW: {
      steps: [
        "輸入圓的半徑、直徑或周長。",
        "讓工具根據你提供的一項推導出其餘量。",
        "一併查看直徑、面積與周長。",
      ],
      explanationTitle: "圓的度量",
      formula: "C = 2πr，A = πr²，d = 2r",
      explanation: [
        "圓完全由半徑決定，因此任意一項都能借助 π 算出其餘量。",
        "面積隨半徑的平方增長，這正是半徑加倍會使面積變為四倍的原因。",
      ],
      faq: [
        { q: "用的是什麼 π 值？", a: "計算使用多位數的 π 以保證精度，顯示時才會四捨五入。" },
        { q: "如何由直徑求面積？", a: "先將直徑減半得到半徑，再套用 A = πr²。" },
        { q: "為什麼周長與半徑成正比？", a: "周長與直徑的比值恆為 π，對任意圓都是常數。" },
      ],
    },
    de: {
      steps: [
        "Gib Radius, Durchmesser oder Umfang des Kreises ein.",
        "Lass das Werkzeug die ubrigen Masse aus dem einen Wert ableiten.",
        "Lies Durchmesser, Flache und Umfang gemeinsam.",
      ],
      explanationTitle: "Kreismasse",
      formula: "C = 2πr, A = πr², d = 2r",
      explanation: [
        "Ein Kreis wird vollstandig durch seinen Radius beschrieben, daher lasst sich aus einem Mass mit pi der Rest berechnen.",
        "Die Flache wachst mit dem Quadrat des Radius, weshalb Verdoppeln des Radius die Flache vervierfacht.",
      ],
      faq: [
        { q: "Welcher Pi-Wert wird genutzt?", a: "Berechnungen nutzen pi auf viele Stellen genau; angezeigt wird nur gerundet." },
        { q: "Wie bekomme ich die Flache aus dem Durchmesser?", a: "Halbiere zuerst den Durchmesser zum Radius, dann A = πr²." },
        { q: "Warum ist der Umfang proportional zum Radius?", a: "Das Verhaltnis von Umfang zu Durchmesser ist immer pi, eine Konstante fur jeden Kreis." },
      ],
    },
    ja: {
      steps: [
        "円の半径・直径・周長のいずれかを入力します。",
        "入力した1つの値から残りの量を自動算出させます。",
        "直径・面積・周長をまとめて確認します。",
      ],
      explanationTitle: "円の測定",
      formula: "C = 2πr、A = πr²、d = 2r",
      explanation: [
        "円は半径だけで完全に決まるため、いずれか1つの量からπを使って残りが求まります。",
        "面積は半径の二乗に比例して増えるため、半径を2倍にすると面積は4倍になります。",
      ],
      faq: [
        { q: "どのπの値を使う？", a: "計算は精度のため多数桁のπを使い、表示は丸められます。" },
        { q: "直径から面積を出すには？", a: "まず直径を半分にして半径を求め、A = πr² を適用します。" },
        { q: "なぜ周長は半径に比例する？", a: "周長と直径の比は常にπで、どの円でも一定だからです。" },
      ],
    },
    es: {
      steps: [
        "Introduce el radio, diametro o circunferencia del circulo.",
        "Deja que la herramienta deduzca las demas medidas a partir de la que diste.",
        "Lee el diametro, el area y la circunferencia juntos.",
      ],
      explanationTitle: "Medidas del circulo",
      formula: "C = 2πr, A = πr², d = 2r",
      explanation: [
        "Un circulo queda descrito por su radio, asi que cualquier medida permite calcular el resto usando pi.",
        "El area crece con el cuadrado del radio, por eso duplicar el radio cuadruplica el area.",
      ],
      faq: [
        { q: "Que valor de pi se usa?", a: "Los calculos usan pi con muchos digitos para precision; solo ves el redondeo en pantalla." },
        { q: "Como obtengo el area desde el diametro?", a: "Primero divide el diametro a la mitad para el radio, luego aplica A = πr²." },
        { q: "Por que la circunferencia es proporcional al radio?", a: "La razon entre circunferencia y diametro es siempre pi, constante para todo circulo." },
      ],
    },
  },

  "distance-calculator": {
    en: {
      steps: [
        "Enter the coordinates or two place names, or pick two points on the map if available.",
        "Choose the model: straight-line (haversine) or route distance.",
        "Read the distance in your preferred units and the approximate travel time.",
      ],
      explanationTitle: "Straight-line versus travel distance",
      formula: "Haversine: d = 2R arcsin(√(sin²(Δφ/2) + cosφ₁cosφ₂ sin²(Δλ/2)))",
      explanation: [
        "The haversine formula gives the great-circle distance between two points on a sphere using their latitudes and longitudes.",
        "Real travel distance is longer because roads and paths bend; use routing for driving or walking estimates.",
      ],
      faq: [
        { q: "Why does the map distance differ from my GPS?", a: "GPS routes follow roads; the straight-line value is the shortest possible across the surface." },
        { q: "What units can I use?", a: "Kilometres, miles, or nautical miles depending on the selector." },
        { q: "Does elevation matter?", a: "Haversine ignores hills; for small areas the error is negligible but mountains add real distance." },
      ],
    },
    zh: {
      steps: [
        "输入坐标或两个地名，若可用也可在地图上选两个点。",
        "选择模型：直线距离（半正矢）或路线距离。",
        "查看你偏好的单位下的距离，以及大致行程时间。",
      ],
      explanationTitle: "直线距离与行程距离",
      formula: "半正矢：d = 2R arcsin(√(sin²(Δφ/2) + cosφ₁cosφ₂ sin²(Δλ/2)))",
      explanation: [
        "半正矢公式利用两点的纬度和经度，给出球面上两点间的大圆距离。",
        "真实行程距离更长，因为道路和路径是弯曲的；估算驾车或步行请用路线规划。",
      ],
      faq: [
        { q: "为什么地图距离和我的 GPS 不同？", a: "GPS 路线沿道路行进，而直线值是地表上可能的最短距离。" },
        { q: "可以用哪些单位？", a: "根据选择器，可用公里、英里或海里。" },
        { q: "海拔有影响吗？", a: "半正矢忽略起伏；小范围误差可忽略，但山区会增加实际路程。" },
      ],
    },
    zhTW: {
      steps: [
        "輸入座標或兩個地名，若可用也可在地圖上選兩個點。",
        "選擇模型：直線距離（半正矢）或路線距離。",
        "查看你偏好的單位下的距離，以及大致行程時間。",
      ],
      explanationTitle: "直線距離與行程距離",
      formula: "半正矢：d = 2R arcsin(√(sin²(Δφ/2) + cosφ₁cosφ₂ sin²(Δλ/2)))",
      explanation: [
        "半正矢公式利用兩點的緯度和經度，給出球面上兩點間的大圓距離。",
        "真實行程距離更長，因為道路和路徑是彎曲的；估算駕車或步行請用路線規劃。",
      ],
      faq: [
        { q: "為什麼地圖距離和我的 GPS 不同？", a: "GPS 路線沿道路行進，而直線值是地表上可能的最短距離。" },
        { q: "可以用哪些單位？", a: "根據選擇器，可用公里、英里或海里。" },
        { q: "海拔有影響嗎？", a: "半正矢忽略起伏；小範圍誤差可忽略，但山區會增加實際路程。" },
      ],
    },
    de: {
      steps: [
        "Gib die Koordinaten oder zwei Ortsnamen ein, oder wahle zwei Punkte auf der Karte, falls moglich.",
        "Wahle das Modell: Luftlinie (Haversine) oder Routenentfernung.",
        "Lies die Entfernung in deiner bevorzugten Einheit und die ungefahre Reisezeit.",
      ],
      explanationTitle: "Luftlinie versus Reiseentfernung",
      formula: "Haversine: d = 2R arcsin(√(sin²(Δφ/2) + cosφ₁cosφ₂ sin²(Δλ/2)))",
      explanation: [
        "Die Haversine-Formel liefert die Grosskreisentfernung zwischen zwei Punkten auf einer Kugel uber deren Breiten und Langen.",
        "Die reale Reiseentfernung ist langer, weil Straßen und Pfade krumm sind; fur Fahrt- oder Gehschatzungen Routing nutzen.",
      ],
      faq: [
        { q: "Warum weicht die Kartenentfernung von meinem GPS ab?", a: "GPS folgt Straßen; der Luftlinienwert ist der kürzeste mogliche uber die Oberflache." },
        { q: "Welche Einheiten kann ich nutzen?", a: "Kilometer, Meilen oder Seemeilen je nach Auswahl." },
        { q: "Spielt Hohe eine Rolle?", a: "Haversine ignoriert Hugel; bei kleinen Flachen ist der Fehler vernachlassigbar, Berge addieren echte Distanz." },
      ],
    },
    ja: {
      steps: [
        "座標または2つの地名を入力します。可能なら地図上で2点を選んでもかまいません。",
        "モデルを選びます：直線距離（ハバーサイン）または経路距離。",
        "お好みの単位での距離と、おおよその移動時間を確認します。",
      ],
      explanationTitle: "直線距離と移動距離",
      formula: "ハバーサイン：d = 2R arcsin(√(sin²(Δφ/2) + cosφ₁cosφ₂ sin²(Δλ/2)))",
      explanation: [
        "ハバーサインの式は2点の緯度・経度から、球面上の大圏距離（最短距離）を求めます。",
        "実際の移動距離は道路や経路が曲がるため長くなります。車や徒歩の見積もりには経路探索を使ってください。",
      ],
      faq: [
        { q: "なぜ地図の距離とGPSと違う？", a: "GPSは道路に沿って進むためです。直線値は地表上の最短距離です。" },
        { q: "どの単位を使える？", a: "セレクタ次第でキロメートル、マイル、海里が使えます。" },
        { q: "標高は影響する？", a: "ハバーサインは起伏を無視します。小範囲なら誤差は無視できますが、山岳部は実距離を増やします。" },
      ],
    },
    es: {
      steps: [
        "Introduce las coordenadas o dos nombres de lugares, o elige dos puntos en el mapa si esta disponible.",
        "Elige el modelo: distancia en linea recta (haversine) o distancia de ruta.",
        "Lee la distancia en tus unidades preferidas y el tiempo de viaje aproximado.",
      ],
      explanationTitle: "Distancia en linea recta versus de viaje",
      formula: "Haversine: d = 2R arcsin(√(sin²(Δφ/2) + cosφ₁cosφ₂ sin²(Δλ/2)))",
      explanation: [
        "La formula haversine da la distancia de gran circulo entre dos puntos sobre una esfera usando sus latitudes y longitudes.",
        "La distancia real de viaje es mayor porque caminos y rutas se doblan; usa enrutamiento para estimaciones en auto o a pie.",
      ],
      faq: [
        { q: "Por que la distancia del mapa difiere de mi GPS?", a: "El GPS sigue caminos; el valor en linea recta es el mas corto posible sobre la superficie." },
        { q: "Que unidades puedo usar?", a: "Kilometros, millas o millas nauticas segun el selector." },
        { q: "Importa la elevacion?", a: "Haversine ignora colinas; en areas pequeñas el error es despreciable, pero las montanas suman distancia real." },
      ],
    },
  },

  "random-number": {
    en: {
      steps: [
        "Set the minimum and maximum values for your range.",
        "Choose how many numbers to generate and whether repeats are allowed.",
        "Generate and copy the result, or re-roll for a new set.",
      ],
      explanationTitle: "How randomness is produced",
      formula: "Result drawn uniformly from [min, max] inclusive",
      explanation: [
        "Each number in the range has an equal chance; the generator seeds from the system clock so successive rolls differ.",
        "For security-sensitive uses such as passwords or lottery draws, use a cryptographically secure generator rather than a general one.",
      ],
      faq: [
        { q: "Can it repeat numbers?", a: "Toggle allow-repeats off if you need distinct values; on by default for independent draws." },
        { q: "Is it truly random?", a: "It is pseudo-random and fine for games and samples, but not for cryptography." },
        { q: "How do I pick a winner fairly?", a: "Set the range to entrant numbers and draw once; publish the method so the process is transparent." },
      ],
    },
    zh: {
      steps: [
        "设置你所需范围的最小值与最大值。",
        "选择要生成的数字个数，以及是否允许重复。",
        "生成并复制结果，或重新抽取一组新数字。",
      ],
      explanationTitle: "随机数是如何产生的",
      formula: "结果在 [min, max] 闭区间内均匀抽取",
      explanation: [
        "区间内每个数字出现的概率相等；生成器以系统时钟为种子，因此连续抽取结果不同。",
        "对于密码或抽奖等安全敏感场景，应使用密码学安全的生成器，而非通用生成器。",
      ],
      faq: [
        { q: "数字会重复吗？", a: "需要不重复的值时关闭「允许重复」；默认开启，适用于相互独立的抽取。" },
        { q: "它是真正的随机吗？", a: "它是伪随机，对游戏和抽样足够好，但不适用于加密。" },
        { q: "如何公平地抽取中奖者？", a: "把范围设为参与者编号并抽取一次；公开方法以保证过程透明。" },
      ],
    },
    zhTW: {
      steps: [
        "設定你所需範圍的最小值與最大值。",
        "選擇要產生的數字個數，以及是否允許重複。",
        "產生並複製結果，或重新抽取一組新數字。",
      ],
      explanationTitle: "隨機數是如何產生的",
      formula: "結果在 [min, max] 閉區間內均勻抽取",
      explanation: [
        "區間內每個數字出現的機率相等；產生器以系統時鐘為種子，因此連續抽取結果不同。",
        "對於密碼或抽獎等安全敏感場景，應使用密碼學安全的產生器，而非通用產生器。",
      ],
      faq: [
        { q: "數字會重複嗎？", a: "需要不重複的值時關閉「允許重複」；預設開啟，適用於相互獨立的抽取。" },
        { q: "它是真正的隨機嗎？", a: "它是偽隨機，對遊戲和抽樣足夠好，但不適用於加密。" },
        { q: "如何公平地抽取中獎者？", a: "把範圍設為參與者編號並抽取一次；公開方法以保證過程透明。" },
      ],
    },
    de: {
      steps: [
        "Lege Mindest- und Hochstwert deines Bereichs fest.",
        "Wahle, wie viele Zahlen erzeugt werden und ob Wiederholungen erlaubt sind.",
        "Erzeuge und kopiere das Ergebnis oder wurfle neu fur eine andere Menge.",
      ],
      explanationTitle: "Wie Zufall erzeugt wird",
      formula: "Ergebnis gleichverteilt aus [min, max] inklusive",
      explanation: [
        "Jede Zahl im Bereich hat die gleiche Chance; der Generator nutzt die Systemuhr als Startwert, daher unterscheiden sich aufeinanderfolgende Wurfe.",
        "Fur sicherheitskritische Zwecke wie Passworter oder Lotterien nutze einen kryptografisch sicheren Generator statt eines allgemeinen.",
      ],
      faq: [
        { q: "Kann es doppelte Zahlen geben?", a: "Schalte Wiederholungen aus, wenn du eindeutige Werte brauchst; standardmaßig fur unabhangige Ziehungen an." },
        { q: "Ist es wirklich zufallig?", a: "Es ist pseudo-zufallig und fur Spiele und Stichproben fein, aber nicht fur Kryptografie." },
        { q: "Wie ziehe ich fair einen Gewinner?", a: "Setze den Bereich auf Teilnehmernummern und ziehe einmal; veroffentliche die Methode fur Transparenz." },
      ],
    },
    ja: {
      steps: [
        "範囲の最小値と最大値を設定します。",
        "生成する数字の個数と、重複を許すか選択します。",
        "結果を生成してコピーするか、新しい組を再抽選します。",
      ],
      explanationTitle: "乱数はどう作られるか",
      formula: "結果は [min, max] 閉区間から一様に抽出",
      explanation: [
        "区間内の各数字は等しい確率です。生成器はシステム時計を種にするため、連続する抽選は異なります。",
        "パスワードや抽選などセキュリティ上重要な用途には、汎用ではなく暗号学的に安全な生成器を使ってください。",
      ],
      faq: [
        { q: "数字は重複する？", a: "重複なしの値が必要なら「重複許可」をオフに。独立した抽選では既定でオンです。" },
        { q: "本当にランダム？", a: "擬似乱数で、ゲームやサンプルには十分ですが暗号には不向きです。" },
        { q: "どうやって公平に当選者を決める？", a: "範囲を参加者番号にし、一度だけ抽選します。手順を公開して透明性を保ってください。" },
      ],
    },
    es: {
      steps: [
        "Define el valor minimo y maximo de tu rango.",
        "Elige cuantos numeros generar y si se permiten repeticiones.",
        "Genera y copia el resultado, o voltea de nuevo para un nuevo conjunto.",
      ],
      explanationTitle: "Como se produce el azar",
      formula: "Resultado extraido uniformemente de [min, max] inclusive",
      explanation: [
        "Cada numero del rango tiene la misma probabilidad; el generador usa el reloj del sistema como semilla, asi que tiradas sucesivas diferen.",
        "Para usos sensibles como contrasenas o sorteos, usa un generador criptograficamente seguro en vez de uno general.",
      ],
      faq: [
        { q: "Puede repetir numeros?", a: "Desactiva permitir repeticiones si necesitas valores distintos; activo por defecto para tiradas independientes." },
        { q: "Es realmente aleatorio?", a: "Es pseudoaleatorio y basta para juegos y muestras, pero no para criptografia." },
        { q: "Como elijo un ganador con justicia?", a: "Pon el rango en numeros de participantes y sortea una vez; publica el metodo para ser transparente." },
      ],
    },
  },

  "time-duration": {
    en: {
      steps: [
        "Enter a start time and an end time, with the date if they cross midnight.",
        "Choose the output format, such as hours and minutes or total minutes.",
        "Read the elapsed duration between the two moments.",
      ],
      explanationTitle: "Measuring elapsed time",
      formula: "Duration = End time - Start time, across day boundaries",
      explanation: [
        "Duration is the gap between two clock readings; crossing midnight simply adds a day to the end before subtracting.",
        "Working in a single unit like minutes avoids mistakes with the base-60 nature of hours and minutes.",
      ],
      faq: [
        { q: "What if the end is past midnight?", a: "Add 24 hours to the end time (or one day) before subtracting so the result stays positive." },
        { q: "Why use total minutes?", a: "Minutes are a single unit, so adding and comparing durations avoids the carry rules of hh:mm." },
        { q: "Does it handle time zones?", a: "This simple tool assumes both times are in the same zone; convert first if they differ." },
      ],
    },
    zh: {
      steps: [
        "输入开始时间和结束时间，若跨越午夜请带上日期。",
        "选择输出格式，如「小时+分钟」或「总分钟数」。",
        "查看两个时刻之间经过的时长。",
      ],
      explanationTitle: "测量经过时间",
      formula: "时长 = 结束时间 - 开始时间（跨日时进位）",
      explanation: [
        "时长是两次读表之间的间隔；跨越午夜时只需在结束时间上加一天再相减。",
        "用单一单位（如分钟）计算可避免时分 60 进制带来的进位错误。",
      ],
      faq: [
        { q: "结束时间过了午夜怎么办？", a: "相减前给结束时间加 24 小时（或一天），使结果为正。" },
        { q: "为什么用总分钟数？", a: "分钟是单一单位，相加和比较时长时不必处理 hh:mm 的进位规则。" },
        { q: "能处理时区吗？", a: "这个简易工具假定两个时间处于同一时区；若不同请先转换。" },
      ],
    },
    zhTW: {
      steps: [
        "輸入開始時間和結束時間，若跨越午夜請帶上日期。",
        "選擇輸出格式，如「小時+分鐘」或「總分鐘數」。",
        "查看兩個時刻之間經過的時長。",
      ],
      explanationTitle: "測量經過時間",
      formula: "時長 = 結束時間 - 開始時間（跨日時進位）",
      explanation: [
        "時長是兩次讀表之間的間隔；跨越午夜時只需在結束時間上加一天再相減。",
        "用單一單位（如分鐘）計算可避免時分 60 進位帶來的進位錯誤。",
      ],
      faq: [
        { q: "結束時間過了午夜怎麼辦？", a: "相减前給結束時間加 24 小時（或一天），使結果為正。" },
        { q: "為什麼用總分鐘數？", a: "分鐘是單一單位，相加和比較時長時不必處理 hh:mm 的進位規則。" },
        { q: "能處理時區嗎？", a: "這個簡易工具假定兩個時間處於同一時區；若不同請先轉換。" },
      ],
    },
    de: {
      steps: [
        "Gib Start- und Endzeit ein, mit Datum falls sie die Mitternacht uberschreiten.",
        "Wahle das Ausgabeformat, etwa Stunden und Minuten oder Gesamtminuten.",
        "Lies die verstrichene Dauer zwischen den beiden Momenten.",
      ],
      explanationTitle: "Verstrichene Zeit messen",
      formula: "Dauer = Endzeit - Startzeit, uber Tagesgrenzen hinweg",
      explanation: [
        "Dauer ist die Lucke zwischen zwei Uhrstanden; wer uber Mitternacht geht, addiert vor dem Subtrahieren einen Tag zur Endzeit.",
        "Mit einer einzelnen Einheit wie Minuten vermeidet man Fehler durch das Basis-60-Wesen von Stunden und Minuten.",
      ],
      faq: [
        { q: "Was, wenn das Ende nach Mitternacht liegt?", a: "Addiere vor dem Subtrahieren 24 Stunden (oder einen Tag) zur Endzeit, damit das Ergebnis positiv bleibt." },
        { q: "Warum Gesamtminuten nutzen?", a: "Minuten sind eine einzelne Einheit, daher umgeht man beim Addieren die Ubertragsregeln von hh:mm." },
        { q: "Behandelt es Zeitzonen?", a: "Dieses einfache Werkzeug nimmt beide Zeiten in derselben Zone an; rechne zuerst um, falls sie differieren." },
      ],
    },
    ja: {
      steps: [
        "開始時刻と終了時刻を入力します。日をまたぐ場合は日付も入力してください。",
        "出力形式を選びます（例：時間＋分、または総分数）。",
        "2つの時刻の間に経過した時間を確認します。",
      ],
      explanationTitle: "経過時間を測る",
      formula: "時間 = 終了時刻 - 開始時刻（日をまたぐ場合は繰り上げ）",
      explanation: [
        "時間とは2つの時刻計読みの間隔です。日をまたぐ場合は終了時刻に1日足してから引き算します。",
        "分など単一単位で扱うと、時分の60進法による桁上がりミスを防げます。",
      ],
      faq: [
        { q: "終了が午前0時を過ぎる場合は？", a: "引き算する前に終了時刻に24時間（1日）を足し、結果が正になるようにします。" },
        { q: "なぜ総分数を使う？", a: "分は単一単位なので、hh:mm の繰り上げ規則を気にせず加算・比較できます。" },
        { q: "タイムゾーンは扱える？", a: "この簡易ツールは両時刻が同じゾーンにあると想定します。異なる場合は先に変換してください。" },
      ],
    },
    es: {
      steps: [
        "Introduce una hora de inicio y una de fin, con la fecha si cruzan la medianoche.",
        "Elige el formato de salida, como horas y minutos o minutos totales.",
        "Lee la duracion transcurrida entre los dos momentos.",
      ],
      explanationTitle: "Medir el tiempo transcurrido",
      formula: "Duracion = Hora fin - Hora inicio, cruzando limites de dia",
      explanation: [
        "La duracion es la brecha entre dos lecturas de reloj; cruzar la medianoche simplemente suma un dia al fin antes de restar.",
        "Trabajar en una sola unidad como minutos evita errores con la naturaleza base 60 de horas y minutos.",
      ],
      faq: [
        { q: "Que si el fin es pasada la medianoche?", a: "Suma 24 horas (o un dia) a la hora fin antes de restar para que el resultado quede positivo." },
        { q: "Por que usar minutos totales?", a: "Los minutos son una sola unidad, asi sumar y comparar duraciones evita las reglas de arrastre de hh:mm." },
        { q: "Maneja zonas horarias?", a: "Esta herramienta simple asume que ambas horas estan en la misma zona; convierte primero si difieren." },
      ],
    },
  },

  "day-of-week": {
    en: {
      steps: [
        "Enter any calendar date you are curious about.",
        "Pick the calendar system if a choice is offered, usually Gregorian.",
        "Read which weekday that date falls on.",
      ],
      explanationTitle: "Finding the weekday of a date",
      formula: "Based on Zeller's congruence or a known anchor, accounting for leap years",
      explanation: [
        "Weekday calculation chains from a reference date, stepping through the known 400-year leap-year cycle of the Gregorian calendar.",
        "Because the pattern repeats every 400 years, the same date lands on the same weekday in years 400 years apart.",
      ],
      faq: [
        { q: "Does it work for any year?", a: "For the Gregorian calendar it covers modern and most historical dates back several centuries." },
        { q: "Why do leap years matter?", a: "They shift every date after February 29 by one weekday, so the rule must track them." },
        { q: "What about the Julian calendar?", a: "Older dates used the Julian system with different leap rules; pick it if your date predates the switch." },
      ],
    },
    zh: {
      steps: [
        "输入你想查询的任意日历日期。",
        "若提供选项，选择历法（通常为公历）。",
        "查看该日期是星期几。",
      ],
      explanationTitle: "求某日期是星期几",
      formula: "基于蔡勒公式或已知锚点，并考虑闰年",
      explanation: [
        "星期计算从某个参考日期链式推演，逐层经过公历已知的 400 年闰年周期。",
        "由于该模式每 400 年重复一次，相隔 400 年的同一日期会落在相同的星期。",
      ],
      faq: [
        { q: "任意年份都适用吗？", a: "对公历而言，涵盖现代以及往前数个世纪的大部分历史日期。" },
        { q: "为什么闰年重要？", a: "它们会把 2 月 29 日之后的每个日期的星期各推移一天，因此规则必须追踪闰年。" },
        { q: "儒略历怎么办？", a: "更早的日期使用闰法不同的儒略历；若日期在切换之前，请选择该历法。" },
      ],
    },
    zhTW: {
      steps: [
        "輸入你想查詢的任意日曆日期。",
        "若提供選項，選擇曆法（通常為公曆）。",
        "查看該日期是星期幾。",
      ],
      explanationTitle: "求某日期是星期幾",
      formula: "基於蔡勒公式或已知錨點，並考慮閏年",
      explanation: [
        "星期計算從某個參考日期鏈式推演，逐層經過公曆已知的 400 年閏年週期。",
        "由於該模式每 400 年重複一次，相隔 400 年的同一日期會落在相同的星期。",
      ],
      faq: [
        { q: "任意年份都適用嗎？", a: "對公曆而言，涵蓋現代以及往前數個世紀的大部分歷史日期。" },
        { q: "為什麼閏年重要？", a: "它們會把 2 月 29 日之後的每個日期的星期各推移一天，因此規則必須追蹤閏年。" },
        { q: "儒略曆怎麼辦？", a: "更早的日期使用閏法不同的儒略曆；若日期在切換之前，請選擇該曆法。" },
      ],
    },
    de: {
      steps: [
        "Gib irgendein Kalenderdatum ein, das dich interessiert.",
        "Wahle das Kalendersystem, falls angeboten, meist gregorianisch.",
        "Lies, auf welchen Wochentag das Datum fallt.",
      ],
      explanationTitle: "Den Wochentag eines Datums finden",
      formula: "Basierend auf Zellers Kongruenz oder einem Anker, mit Berucksichtigung von Schaltjahren",
      explanation: [
        "Die Wochentagsberechnung kettet von einem Referenzdatum und geht durch den bekannten 400-Jahre-Schaltzyklus des gregorianischen Kalenders.",
        "Da das Muster alle 400 Jahre wiederkehrt, fallt das gleiche Datum in 400 Jahren Abstand auf denselben Wochentag.",
      ],
      faq: [
        { q: "Funktioniert das fur jedes Jahr?", a: "Fur den gregorianischen Kalender deckt es moderne und die meisten historischen Daten mehrere Jahrhunderte zuruck ab." },
        { q: "Warum sind Schaltjahre wichtig?", a: "Sie verschieben jedes Datum nach dem 29. Februar um einen Wochentag, also muss die Regel sie erfassen." },
        { q: "Was ist mit dem julianischen Kalender?", a: "Altere Daten nutzten das julianische System mit anderen Schaltregeln; wahle es, falls dein Datum vor dem Wechsel liegt." },
      ],
    },
    ja: {
      steps: [
        "調べたいカレンダー日付を入力します。",
        "選択肢があるなら暦法を選びます（通常はグレゴリオ暦）。",
        "その日付が何曜日かを確認します。",
      ],
      explanationTitle: "ある日付の曜日を求める",
      formula: "ツェラーの公式や既知の基点を用い、閏年を考慮",
      explanation: [
        "曜日計算は参照日から連鎖的に展開し、グレゴリオ暦の知られた400年閏年周期をたどります。",
        "このパターンは400年ごとに繰り返すため、400年離れた同じ日付は同じ曜日に当たります。",
      ],
      faq: [
        { q: "どの年でも動く？", a: "グレゴリオ暦では現代から過去数世紀のほとんどの歴史的日付をカバーします。" },
        { q: "なぜ閏年が重要？", a: "2月29日以降の各日付の曜日を1つずらすため、規則は閏年を追跡する必要があります。" },
        { q: "ユリウス暦は？", a: "より古い日付は閏法の異なるユリウス暦を使います。切り替え前の日付ならそれを選んでください。" },
      ],
    },
    es: {
      steps: [
        "Introduce cualquier fecha del calendario que te interese.",
        "Elige el sistema calendario si se ofrece, usualmente gregoriano.",
        "Lee en que dia de la semana cae esa fecha.",
      ],
      explanationTitle: "Encontrar el dia de la semana de una fecha",
      formula: "Basado en la congruencia de Zeller o un ancla conocida, considerando anos bisiestos",
      explanation: [
        "El calculo del dia encadena desde una fecha referencia, recorriendo el ciclo de anos bisiestos de 400 anos del calendario gregoriano.",
        "Como el patron se repite cada 400 anos, la misma fecha cae en el mismo dia de la semana a 400 anos de distancia.",
      ],
      faq: [
        { q: "Funciona para cualquier ano?", a: "Para el calendario gregoriano cubre fechas modernas y la mayoria historicas de varios siglos atras." },
        { q: "Por que importan los anos bisiestos?", a: "Desplazan un dia de la semana a cada fecha tras el 29 de febrero, asi que la regla debe seguirlos." },
        { q: "Que hay del calendario juliano?", a: "Las fechas antiguas usaban el sistema juliano con otras reglas de bisiestos; eligelo si tu fecha es anterior al cambio." },
      ],
    },
  },

  "hours": {
    en: {
      steps: [
        "Enter a time in hours and minutes, or a decimal hours value.",
        "Choose the conversion direction, such as hours to minutes or decimal to hh:mm.",
        "Read the equivalent value in your chosen format.",
      ],
      explanationTitle: "Converting hours and minutes",
      formula: "Minutes = hours x 60; Decimal hours = hours + minutes/60",
      explanation: [
        "Time in base 60 means 1.5 hours is 1 hour 30 minutes, not 1 hour 50 minutes; conversion multiplies or divides by 60.",
        "Decimal hours are handy for payroll and billing, while hh:mm is clearer for schedules.",
      ],
      faq: [
        { q: "Is 1.5 hours equal to 1:50?", a: "No. 1.5 hours is 1 hour 30 minutes, because the 0.5 is half of 60 minutes." },
        { q: "How do I convert 90 minutes to hours?", a: "Divide by 60 to get 1.5 hours, or 1 hour 30 minutes." },
        { q: "Why use decimal hours at all?", a: "Multiplying rates by decimal hours is easier than by hh:mm, which is why timesheets use it." },
      ],
    },
    zh: {
      steps: [
        "输入「小时+分钟」形式的时间，或一个小数的小时值。",
        "选择转换方向，例如小时转分钟，或小数转 hh:mm。",
        "查看你所选格式的等效值。",
      ],
      explanationTitle: "小时与分钟的换算",
      formula: "分钟 = 小时 × 60；十进制小时 = 小时 + 分钟/60",
      explanation: [
        "60 进制下，1.5 小时是 1 小时 30 分，而非 1 小时 50 分；换算即乘或除以 60。",
        "十进制小时便于工资与计费，而 hh:mm 在排程时更直观。",
      ],
      faq: [
        { q: "1.5 小时等于 1:50 吗？", a: "不等。1.5 小时是 1 小时 30 分，因为 0.5 是 60 分钟的一半。" },
        { q: "90 分钟怎么换算成小时？", a: "除以 60 得到 1.5 小时，即 1 小时 30 分。" },
        { q: "为什么还要用十进制小时？", a: "用十进制小时乘以费率比用 hh:mm 更简单，因此工时表普遍采用。" },
      ],
    },
    zhTW: {
      steps: [
        "輸入「小時+分鐘」形式的時間，或一個小數的小時值。",
        "選擇轉換方向，例如小時轉分鐘，或小數轉 hh:mm。",
        "查看你所選格式的等效值。",
      ],
      explanationTitle: "小時與分鐘的換算",
      formula: "分鐘 = 小時 × 60；十進位小時 = 小時 + 分鐘/60",
      explanation: [
        "60 進位下，1.5 小時是 1 小時 30 分，而非 1 小時 50 分；換算即乘或除以 60。",
        "十進位小時便於工資與計費，而 hh:mm 在排程時更直觀。",
      ],
      faq: [
        { q: "1.5 小時等於 1:50 嗎？", a: "不等。1.5 小時是 1 小時 30 分，因為 0.5 是 60 分鐘的一半。" },
        { q: "90 分鐘怎麼換算成小時？", a: "除以 60 得到 1.5 小時，即 1 小時 30 分。" },
        { q: "為什麼還要用十進位小時？", a: "用十進位小時乘以費率比用 hh:mm 更簡單，因此工時表普遍採用。" },
      ],
    },
    de: {
      steps: [
        "Gib eine Zeit in Stunden und Minuten oder einen dezimalen Stundenwert ein.",
        "Wahle die Richtung, etwa Stunden zu Minuten oder Dezimal zu hh:mm.",
        "Lies den gleichwertigen Wert in deinem gewahlten Format.",
      ],
      explanationTitle: "Stunden und Minuten umrechnen",
      formula: "Minuten = Stunden x 60; Dezimalstunden = Stunden + Minuten/60",
      explanation: [
        "Zeit in Basis 60 bedeutet, dass 1,5 Stunden 1 Stunde 30 Minuten sind, nicht 1:50; die Umrechnung multipliziert oder dividiert durch 60.",
        "Dezimalstunden sind fur Lohn und Abrechnung praktisch, wahrend hh:mm bei Plänen klarer ist.",
      ],
      faq: [
        { q: "Sind 1,5 Stunden gleich 1:50?", a: "Nein. 1,5 Stunden sind 1 Stunde 30 Minuten, da 0,5 die Halfte von 60 Minuten ist." },
        { q: "Wie rechne ich 90 Minuten in Stunden?", a: "Durch 60 teilen ergibt 1,5 Stunden, also 1 Stunde 30 Minuten." },
        { q: "Warum uberhaupt Dezimalstunden?", a: "Tarife mit Dezimalstunden zu multiplizieren ist einfacher als mit hh:mm, weshalb Zeiterfassungen es nutzen." },
      ],
    },
    ja: {
      steps: [
        "「時＋分」の形式、または小数の時間値を入力します。",
        "変換方向を選びます（例：時間→分、小数→hh:mm）。",
        "選んだ形式での等価な値を確認します。",
      ],
      explanationTitle: "時間と分の換算",
      formula: "分 = 時間 × 60；十進時間 = 時間 + 分/60",
      explanation: [
        "60進法では 1.5 時間は 1 時間 30 分であり、1 時間 50 分ではありません。換算は 60 を掛けたり割ったりします。",
        "十進時間は給与や請求に便利で、hh:mm は予定表で分かりやすいです。",
      ],
      faq: [
        { q: "1.5 時間は 1:50 と同じ？", a: "違います。1.5 時間は 1 時間 30 分です。0.5 は 60 分の半分だからです。" },
        { q: "90 分を時間に換算するには？", a: "60 で割ると 1.5 時間、つまり 1 時間 30 分です。" },
        { q: "なぜ十進時間を使う？", a: "十進時間に単価を掛ける方が hh:mm より簡単なため、勤怠表で使われます。" },
      ],
    },
    es: {
      steps: [
        "Introduce una hora en horas y minutos, o un valor decimal de horas.",
        "Elige la direccion de conversion, como horas a minutos o decimal a hh:mm.",
        "Lee el valor equivalente en el formato que elegiste.",
      ],
      explanationTitle: "Convertir horas y minutos",
      formula: "Minutos = horas x 60; Horas decimales = horas + minutos/60",
      explanation: [
        "El tiempo en base 60 significa que 1,5 horas son 1 hora 30 minutos, no 1:50; la conversion multiplica o divide por 60.",
        "Las horas decimales son utiles para nomina y facturacion, mientras hh:mm es mas claro para horarios.",
      ],
      faq: [
        { q: "Son 1,5 horas igual a 1:50?", a: "No. 1,5 horas son 1 hora 30 minutos, porque el 0,5 es la mitad de 60 minutos." },
        { q: "Como convierto 90 minutos a horas?", a: "Divide por 60 para obtener 1,5 horas, o 1 hora 30 minutos." },
        { q: "Por que usar horas decimales?", a: "Multiplicar tarifas por horas decimales es mas facil que por hh:mm, por eso las hojas de tiempo lo usan." },
      ],
    },
  },

  "time": {
    en: {
      steps: [
        "Enter a time of day in hours, minutes, and seconds.",
        "Switch between 12-hour and 24-hour display if needed.",
        "Read the normalized time and any converted format.",
      ],
      explanationTitle: "Reading and converting clock time",
      formula: "24h time = (12h hour mod 12) + period offset; wraps at 24:00",
      explanation: [
        "Clock time repeats every 24 hours, so 13:00 and 1:00 pm describe the same moment in different notations.",
        "Seconds and minutes wrap at 60 and hours at 24, so carrying overflow keeps the display valid.",
      ],
      faq: [
        { q: "What is the difference between 12h and 24h?", a: "24-hour time avoids am/pm by counting 0 to 23; 12-hour time splits the day into am and pm." },
        { q: "How do I convert 2:30 pm to 24h?", a: "Add 12 to the hour for pm times after noon, giving 14:30." },
        { q: "Why does the clock wrap at 60?", a: "Minutes and seconds use base 60, an ancient Babylonian convention still used for time." },
      ],
    },
    zh: {
      steps: [
        "输入一天中的时间，含小时、分钟、秒。",
        "如需，在 12 小时制与 24 小时制之间切换显示。",
        "查看规范化后的时间以及任何转换后的格式。",
      ],
      explanationTitle: "读取与转换钟表时间",
      formula: "24 小时制 = (12 小时制小时 mod 12) + 时段偏移；24:00 归零",
      explanation: [
        "钟表时间每 24 小时循环一次，因此 13:00 与下午 1:00 是同一时刻的两种记法。",
        "秒与分在 60 进位、小时在 24 进位，进位溢出可保持显示为有效时间。",
      ],
      faq: [
        { q: "12 小时制和 24 小时制有何区别？", a: "24 小时制用 0 到 23 计数，避免使用 am/pm；12 小时制把一天分为上午和下午。" },
        { q: "下午 2:30 怎么转成 24 小时制？", a: "中午之后 pm 的时间小时加 12，得到 14:30。" },
        { q: "为什么钟表在 60 进位？", a: "分和秒采用 60 进制，这是古代巴比伦沿用到现在的时间惯例。" },
      ],
    },
    zhTW: {
      steps: [
        "輸入一天中的時間，含小時、分鐘、秒。",
        "如需，在 12 小時制與 24 小時制之間切換顯示。",
        "查看正規化後的時間以及任何轉換後的格式。",
      ],
      explanationTitle: "讀取與轉換鐘錶時間",
      formula: "24 小時制 = (12 小時制小時 mod 12) + 時段偏移；24:00 歸零",
      explanation: [
        "鐘錶時間每 24 小時循環一次，因此 13:00 與下午 1:00 是同一時刻的兩種記法。",
        "秒與分在 60 進位、小時在 24 進位，進位溢位可保持顯示為有效時間。",
      ],
      faq: [
        { q: "12 小時制和 24 小時制有何區別？", a: "24 小時制用 0 到 23 計數，避免使用 am/pm；12 小時制把一天分為上午和下午。" },
        { q: "下午 2:30 怎麼轉成 24 小時制？", a: "中午之後 pm 的時間小時加 12，得到 14:30。" },
        { q: "為什麼鐘錶在 60 進位？", a: "分和秒採用 60 進制，這是古代巴比倫沿用到現在的時間慣例。" },
      ],
    },
    de: {
      steps: [
        "Gib eine Tageszeit in Stunden, Minuten und Sekunden ein.",
        "Wechsle bei Bedarf zwischen 12- und 24-Stunden-Anzeige.",
        "Lies die normalisierte Zeit und ein beliebiges umgewandeltes Format.",
      ],
      explanationTitle: "Uhrzeit lesen und umwandeln",
      formula: "24h-Zeit = (12h-Stunde mod 12) + Tagesabschnitt; Uberlauf bei 24:00",
      explanation: [
        "Uhrzeit wiederholt sich alle 24 Stunden, also beschreiben 13:00 und 1:00 pm denselben Moment in anderer Schreibweise.",
        "Sekunden und Minuten umbrechen bei 60, Stunden bei 24, wobei Uberlauf die Anzeige gultig halt.",
      ],
      faq: [
        { q: "Was unterscheidet 12h und 24h?", a: "24-Stunden-Zeit zahlt 0 bis 23 ohne am/pm; 12-Stunden-Zeit teilt den Tag in am und pm." },
        { q: "Wie wandele ich 2:30 pm in 24h?", a: "Addiere fur pm-Zeiten nach Mittag 12 zur Stunde, also 14:30." },
        { q: "Warum bricht die Uhr bei 60?", a: "Minuten und Sekunden nutzen Basis 60, eine alte babylonische Konvention, die fur Zeit genutzt wird." },
      ],
    },
    ja: {
      steps: [
        "時・分・秒で一日の時刻を入力します。",
        "必要に応じて12時間制と24時間制を切り替えます。",
        "正規化された時刻と変換後の形式を確認します。",
      ],
      explanationTitle: "時刻を読み取り変換する",
      formula: "24時間制 = (12時間制の時 mod 12) + 時段オフセット；24:00で循環",
      explanation: [
        "時刻は24時間ごとに繰り返すため、13:00 と午後1:00 は異なる表記で同じ瞬間を表します。",
        "秒と分は60進、時は24進で桁上がりし、オーバーフローしても表示は有効です。",
      ],
      faq: [
        { q: "12時間制と24時間制の違いは？", a: "24時間制は0〜23を数え am/pm を使いません。12時間制は一日を午前と午後に分けます。" },
        { q: "午後2:30を24時間制にするには？", a: "正午以降のpm時間は時刻に12を足すので 14:30 になります。" },
        { q: "なぜ時計は60進？", a: "分と秒は60進法で、古代バビロニアの慣習が今も時間に使われています。" },
      ],
    },
    es: {
      steps: [
        "Introduce una hora del dia en horas, minutos y segundos.",
        "Cambia entre formato de 12 y 24 horas si hace falta.",
        "Lee la hora normalizada y cualquier formato convertido.",
      ],
      explanationTitle: "Leer y convertir la hora del reloj",
      formula: "Hora 24h = (hora 12h mod 12) + offset de periodo; reinicia en 24:00",
      explanation: [
        "La hora del reloj se repite cada 24 horas, asi que 13:00 y 1:00 pm describen el mismo momento en distinta notacion.",
        "Segundos y minutos reinician en 60 y horas en 24, asi que el arrastre mantiene la visualizacion valida.",
      ],
      faq: [
        { q: "Cual es la diferencia entre 12h y 24h?", a: "La hora 24h cuenta de 0 a 23 sin am/pm; la de 12h divide el dia en am y pm." },
        { q: "Como convierto 2:30 pm a 24h?", a: "Sumale 12 a la hora para pm despues del mediodia, dando 14:30." },
        { q: "Por que el reloj reinicia en 60?", a: "Minutos y segundos usan base 60, una antigua convencion babilonica aun usada para el tiempo." },
      ],
    },
  },

  "duration-converter": {
    en: {
      steps: [
        "Enter a duration in one unit, such as days, hours, or minutes.",
        "Choose the target unit you want it expressed in.",
        "Read the converted duration, which may span several units.",
      ],
      explanationTitle: "Converting between time units",
      formula: "1 day = 24 h = 1440 min = 86400 s",
      explanation: [
        "Duration conversion is a chain of fixed ratios: days to hours multiplies by 24, hours to minutes by 60, and so on.",
        "Long spans are easier to grasp in mixed units, like '3 days 4 hours', than as a single huge seconds count.",
      ],
      faq: [
        { q: "How many minutes in a day?", a: "Exactly 1440, because 24 hours times 60 minutes equals 1440." },
        { q: "Should I use weeks or fortnights?", a: "Weeks (7 days) are standard; fortnights (14 days) appear mainly in some payroll contexts." },
        { q: "Why convert at all?", a: "Different domains quote time differently; converting keeps schedules, billing, and logs consistent." },
      ],
    },
    zh: {
      steps: [
        "输入一个以某种单位表示的时长，如天、小时或分钟。",
        "选择你希望换算成的目标单位。",
        "查看换算后的时长，它可能跨多个单位。",
      ],
      explanationTitle: "时间单位之间的换算",
      formula: "1 天 = 24 小时 = 1440 分钟 = 86400 秒",
      explanation: [
        "时长换算是固定比率的连锁：天转小时乘 24，小时转分钟乘 60，依此类推。",
        "较长跨度用混合单位（如「3 天 4 小时」）比单一巨秒数更易理解。",
      ],
      faq: [
        { q: "一天有多少分钟？", a: "正好 1440 分钟，因为 24 小时 × 60 分钟 = 1440。" },
        { q: "该用周还是双周？", a: "周（7 天）是标准；双周（14 天）主要出现在部分工资场景。" },
        { q: "为什么要换算？", a: "不同领域对时间的表述不同，换算可让排程、计费与日志保持一致。" },
      ],
    },
    zhTW: {
      steps: [
        "輸入一個以某種單位表示的時長，如天、小時或分鐘。",
        "選擇你希望換算成的目標單位。",
        "查看換算後的時長，它可能跨多個單位。",
      ],
      explanationTitle: "時間單位之間的換算",
      formula: "1 天 = 24 小時 = 1440 分鐘 = 86400 秒",
      explanation: [
        "時長換算是固定比率的連鎖：天轉小時乘 24，小時轉分鐘乘 60，依此類推。",
        "較長跨度用混合單位（如「3 天 4 小時」）比單一巨秒數更易理解。",
      ],
      faq: [
        { q: "一天有多少分鐘？", a: "正好 1440 分鐘，因為 24 小時 × 60 分鐘 = 1440。" },
        { q: "該用週還是雙週？", a: "週（7 天）是標準；雙週（14 天）主要出現在部分工資場景。" },
        { q: "為什麼要換算？", a: "不同領域對時間的表達不同，換算可讓排程、計費與日誌保持一致。" },
      ],
    },
    de: {
      steps: [
        "Gib eine Dauer in einer Einheit ein, etwa Tage, Stunden oder Minuten.",
        "Wahle die Zieleinheit, in der sie ausgedruckt werden soll.",
        "Lies die umgerechnete Dauer, die mehrere Einheiten umspannen kann.",
      ],
      explanationTitle: "Einheiten der Zeit umrechnen",
      formula: "1 Tag = 24 h = 1440 min = 86400 s",
      explanation: [
        "Die Umrechnung von Dauern ist eine Kette fester Verhaltnisse: Tage zu Stunden mal 24, Stunden zu Minuten mal 60 und so weiter.",
        "Lange Spannen sind in gemischten Einheiten wie '3 Tage 4 Stunden' leichter fassbar als eine einzelne riesige Sekundenzahl.",
      ],
      faq: [
        { q: "Wie viele Minuten hat ein Tag?", a: "Genau 1440, denn 24 Stunden mal 60 Minuten ergeben 1440." },
        { q: "Sollte ich Wochen oder Fortnights nutzen?", a: "Wochen (7 Tage) sind Standard; Fortnights (14 Tage) tauchen vor allem in einigen Lohnkontexten auf." },
        { q: "Warum uberhaupt umrechnen?", a: "Verschiedene Bereiche nennen Zeit unterschiedlich; Umrechnen halt Plane, Abrechnung und Logs konsistent." },
      ],
    },
    ja: {
      steps: [
        "日・時間・分など、ある単位での期間を入力します。",
        "変換先としたい単位を選びます。",
        "変換後の期間を確認します。複数単位にまたがる場合があります。",
      ],
      explanationTitle: "時間単位間の換算",
      formula: "1 日 = 24 時間 = 1440 分 = 86400 秒",
      explanation: [
        "期間の換算は固定比率の連鎖です。日から時間は24倍、時間から分は60倍、以下同様。",
        "長い期間は「3日4時間」のような混合単位の方が、巨大な秒数1つより理解しやすいです。",
      ],
      faq: [
        { q: "1日は何分？", a: "正確に1440分です。24時間 × 60分 = 1440。" },
        { q: "週と双週のどちらを使う？", a: "週（7日）が標準です。双週（14日）は一部の給与計算に見られます。" },
        { q: "なぜ換算する？", a: "分野により時間の表し方が異なり、換算で予定・請求・ログを一致させます。" },
      ],
    },
    es: {
      steps: [
        "Introduce una duracion en una unidad, como dias, horas o minutos.",
        "Elige la unidad destino en la que quieres expresarla.",
        "Lee la duracion convertida, que puede abarcar varias unidades.",
      ],
      explanationTitle: "Convertir entre unidades de tiempo",
      formula: "1 dia = 24 h = 1440 min = 86400 s",
      explanation: [
        "La conversion de duraciones es una cadena de razones fijas: dias a horas multiplica por 24, horas a minutos por 60, y asi sucesivamente.",
        "Los periodos largos se entienden mejor en unidades mixtas, como '3 dias 4 horas', que como una sola cifra enorme de segundos.",
      ],
      faq: [
        { q: "Cuantos minutos hay en un dia?", a: "Exactamente 1440, porque 24 horas por 60 minutos igual 1440." },
        { q: "Debo usar semanas o quincenas?", a: "Las semanas (7 dias) son estandar; las quincenas (14 dias) aparecen sobre todo en algunas nomina." },
        { q: "Por que convertir?", a: "Distintos ambitos citan el tiempo de forma distinta; convertir mantiene planes, facturacion y registros coherentes." },
      ],
    },
  },
};

let total = 0;
for (const lang of LANGS) {
  const file = FILE(lang);
  const j = JSON.parse(fs.readFileSync(file, "utf8"));
  for (const id of Object.keys(DATA)) {
    const g = DATA[id][lang] || DATA[id][lang.replace(/-/g, "")];
    if (!g) {
      console.error(`Missing lang ${lang} for ${id}`);
      process.exit(1);
    }
    if (!j.converter) j.converter = {};
    if (!j.converter[id]) {
      console.error(`Tool ${id} not found in ${lang}.json`);
      process.exit(1);
    }
    j.converter[id].guide = {
      steps: g.steps,
      explanationTitle: g.explanationTitle,
      formula: g.formula,
      explanation: g.explanation,
      faq: g.faq,
    };
    total++;
  }
  fs.writeFileSync(file, JSON.stringify(j, null, 2) + "\n", "utf8");
}
console.log(`Injected ${total} guide sets across ${LANGS.length} languages for ${Object.keys(DATA).length} tools.`);
