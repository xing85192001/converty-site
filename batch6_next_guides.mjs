// 第六批 A 层深度文案注入：14 个健康长尾+化学工具 × 6 语言
import fs from "fs";

const LANGS = ["en", "zh", "zh-TW", "de", "ja", "es"];
const FILE = (l) => `./src/messages/${l}.json`;

const DATA = {
  "corpulence": {
    en: {
      steps: [
        "Enter your height and weight, and your age and sex if the formula requires them.",
        "Choose the index or classification system the tool uses.",
        "Read your category and how it compares to the healthy range.",
      ],
      explanationTitle: "What corpulence means",
      formula: "Often based on BMI = weight / height^2, or older corpulence index = weight / height^3",
      explanation: [
        "Corpulence is a general term for body fatness; many tools express it through BMI, which relates weight to height squared.",
        "These categories are screening aids, not diagnoses; body composition and overall health matter more than a single number. Consult a clinician for advice.",
      ],
      faq: [
        { q: "Is corpulence the same as BMI?", a: "BMI is the most common way to express corpulence today, though older indices used weight divided by height cubed." },
        { q: "Why do categories vary?", a: "Different health bodies set slightly different cut-offs, and some adjust for age or ethnicity." },
        { q: "Should I rely on this number alone?", a: "No. Pair it with waist size, body fat, and a clinician's advice for a fuller picture." },
      ],
    },
    zh: {
      steps: [
        "输入身高和体重，若公式需要，再输入年龄与性别。",
        "选择该工具使用的指数或分类体系。",
        "查看你的类别，以及它与健康区间的对比。",
      ],
      explanationTitle: "肥胖度是什么意思",
      formula: "通常基于 BMI = 体重 / 身高²，或旧式肥胖指数 = 体重 / 身高³",
      explanation: [
        "肥胖度是描述体脂多少的统称；许多工具通过 BMI（体重与身高平方之比）来表达。",
        "这些分类只是筛查参考，并非诊断；身体成分与整体健康比单一数字更重要。具体建议请咨询医生。",
      ],
      faq: [
        { q: "肥胖度和 BMI 一样吗？", a: "BMI 是当今最常用表达肥胖度的方式，不过旧式指数曾用体重除以身高立方。" },
        { q: "为什么分类会不同？", a: "不同卫生机构设定的临界值略有差异，有些还会按年龄或族群调整。" },
        { q: "可以只凭这个数字判断吗？", a: "不行。应结合腰围、体脂率以及医生意见，才能更全面地评估。" },
      ],
    },
    zhTW: {
      steps: [
        "輸入身高和體重，若公式需要，再輸入年齡與性別。",
        "選擇該工具使用的指數或分類體系。",
        "查看你的類別，以及它與健康區間的對比。",
      ],
      explanationTitle: "肥胖度是什麼意思",
      formula: "通常基於 BMI = 體重 / 身高²，或舊式肥胖指數 = 體重 / 身高³",
      explanation: [
        "肥胖度是描述體脂多少的統稱；許多工具透過 BMI（體重與身高平方之比）來表達。",
        "這些分類只是篩查參考，並非診斷；身體成分與整體健康比單一數字更重要。具體建議請諮詢醫生。",
      ],
      faq: [
        { q: "肥胖度和 BMI 一樣嗎？", a: "BMI 是當今最常用表達肥胖度的方式，不過舊式指數曾用體重除以身高立方。" },
        { q: "為什麼分類會不同？", a: "不同衛生機構設定的臨界值略有差異，有些還會按年齡或族群調整。" },
        { q: "可以只憑這個數字判斷嗎？", a: "不行。應結合腰圍、體脂率以及醫生意見，才能更全面地評估。" },
      ],
    },
    de: {
      steps: [
        "Gib Grose und Gewicht ein, sowie Alter und Geschlecht, falls die Formel sie braucht.",
        "Wahle den Index oder das Klassifikationssystem, das das Werkzeug nutzt.",
        "Lies deine Kategorie und den Vergleich zum gesunden Bereich.",
      ],
      explanationTitle: "Was Korpulenz bedeutet",
      formula: "Oft basierend auf BMI = Gewicht / Grose^2, oder altem Index = Gewicht / Grose^3",
      explanation: [
        "Korpulenz ist ein allgemeiner Begriff fur das Korperfett; viele Werkzeuge drücken es uber den BMI aus, also Gewicht geteilt durch Grose quadriert.",
        "Diese Kategorien sind Screening-Hilfen, keine Diagnosen; Korperzusammensetzung und Gesundheit zahlen mehr als eine Zahl. Fur Rat einen Arzt fragen.",
      ],
      faq: [
        { q: "Ist Korpulenz dasselbe wie BMI?", a: "Der BMI ist heute das ubliche Mass, altere Indizes nutzten Gewicht durch Grose hoch 3." },
        { q: "Warum unterscheiden sich Kategorien?", a: "Verschiedene Gesundheitsorganisationen setzen leicht andere Grenzwerte und einige justieren nach Alter oder Ethnie." },
        { q: "Sollte ich mich auf diese Zahl allein verlassen?", a: "Nein. Kombiniere sie mit Taillenmass, Korperfett und der Beratung durch einen Arzt." },
      ],
    },
    ja: {
      steps: [
        "身長と体重を入力し、式が必要なら年齢と性別も入力します。",
        "ツールが使用する指数または分類体系を選びます。",
        "ご自身の区分と、健康範囲との比較を確認します。",
      ],
      explanationTitle: "肥満度とは何か",
      formula: "多くは BMI = 体重 / 身長²、または旧式の肥満指数 = 体重 / 身長³",
      explanation: [
        "肥満度は体脂肪の多さを表す総称です。多くのツールは体重を身長の二乗で割った BMI で示します。",
        "これらの区分はスクリーニングの目安であり診断ではありません。体組成と総合的な健康が一つの数字より重要です。助言は医師に。",
      ],
      faq: [
        { q: "肥満度とBMIは同じ？", a: "BMIが当今最も一般的な表し方ですが、旧式の指数は体重を身長の3乗で割っていました。" },
        { q: "なぜ区分が異なる？", a: "保健機関により基準値が少し異なり、年齢や人種で調整するものもあります。" },
        { q: "この数字だけで判断していい？", a: "いいえ。腹囲や体脂肪率、医師の助言と合わせて全体像を見てください。" },
      ],
    },
    es: {
      steps: [
        "Introduce altura y peso, y edad y sexo si la formula los requiere.",
        "Elige el indice o sistema de clasificacion que usa la herramienta.",
        "Lee tu categoria y como se compara con el rango saludable.",
      ],
      explanationTitle: "Que significa corpulencia",
      formula: "Suele basarse en IMC = peso / altura^2, o indice antiguo = peso / altura^3",
      explanation: [
        "La corpulencia es un termino general para la grasa corporal; muchas herramientas la expresan por el IMC, que relaciona peso y altura al cuadrado.",
        "Estas categorias son ayudas de cribado, no diagnosticos; la composicion corporal y la salud global importan mas que un numero. Consulta a un medico.",
      ],
      faq: [
        { q: "Es la corpulencia lo mismo que el IMC?", a: "El IMC es hoy la forma mas comun de expresarla, aunque indices antiguos usaban peso entre altura al cubo." },
        { q: "Por que varian las categorias?", a: "Distintos organismos fijan umbrales algo distintos y algunos ajustan por edad o etnia." },
        { q: "Debo fiarlo todo a este numero?", a: "No. Suma la cintura, el porcentaje de grasa y el consejo de un medico para un cuadro completo." },
      ],
    },
  },

  "lean-body-mass": {
    en: {
      steps: [
        "Enter your weight, body fat percentage (or use a method like skinfold), and your sex.",
        "Choose the estimation equation if several are offered.",
        "Read your lean mass, the part of your body that is not fat.",
      ],
      explanationTitle: "Lean body mass explained",
      formula: "Lean mass = Total weight x (1 - body fat fraction)",
      explanation: [
        "Lean body mass includes muscle, bone, water, and organs; only the fat portion is excluded, so it is higher than just muscle mass.",
        "It is useful for setting protein targets, dosing some medications, and tracking body-composition changes over time.",
      ],
      faq: [
        { q: "How is body fat measured?", a: "Methods range from skinfold calipers and bioimpedance scales to DEXA scans, each with different accuracy." },
        { q: "Why does lean mass matter?", a: "It reflects metabolically active tissue and helps tailor nutrition and training, especially as you age." },
        { q: "Is higher lean mass always better?", a: "More is generally favorable for metabolism and strength, but context and overall health matter more than the number alone." },
      ],
    },
    zh: {
      steps: [
        "输入体重、体脂率（或用皮褶等测量法），以及性别。",
        "若提供多种估算公式，选择其中一种。",
        "查看你的瘦体重，即身体中除去脂肪的部分。",
      ],
      explanationTitle: "瘦体重详解",
      formula: "瘦体重 = 总体重 × (1 - 体脂比例)",
      explanation: [
        "瘦体重包含肌肉、骨骼、水分和内脏；只有脂肪部分被排除，因此高于单纯的肌肉量。",
        "它有助于设定蛋白质目标、部分药物的剂量计算，以及长期追踪身体成分的变化。",
      ],
      faq: [
        { q: "体脂率如何测量？", a: "方法从皮褶卡钳、生物电阻抗秤到 DEXA 扫描不等，准确度各有不同。" },
        { q: "为什么瘦体重重要？", a: "它反映代谢活跃的组织，有助于个性化营养与训练，尤其随年龄增长更关键。" },
        { q: "瘦体重越高越好吗？", a: "通常对代谢和力量更有利，但语境与整体健康比单一数字更重要。" },
      ],
    },
    zhTW: {
      steps: [
        "輸入體重、體脂率（或用皮褶等測量法），以及性別。",
        "若提供多種估算公式，選擇其中一種。",
        "查看你的瘦體重，即身體中除去脂肪的部分。",
      ],
      explanationTitle: "瘦體重詳解",
      formula: "瘦體重 = 總體重 × (1 - 體脂比例)",
      explanation: [
        "瘦體重包含肌肉、骨骼、水分和內臟；只有脂肪部分被排除，因此高於單純的肌肉量。",
        "它有助於設定蛋白質目標、部分藥物的劑量計算，以及長期追蹤身體成分的變化。",
      ],
      faq: [
        { q: "體脂率如何測量？", a: "方法從皮褶卡鉗、生物電阻抗秤到 DEXA 掃描不等，準確度各有不同。" },
        { q: "為什麼瘦體重重要？", a: "它反映代謝活躍的組織，有助於個人化營養與訓練，尤其隨年齡增長更關鍵。" },
        { q: "瘦體重越高越好嗎？", a: "通常對代謝和力量更有利，但語境與整體健康比單一數字更重要。" },
      ],
    },
    de: {
      steps: [
        "Gib Gewicht, Korperfettanteil (oder eine Methode wie Hautfalt) und Geschlecht ein.",
        "Wahle die Schatzgleichung, falls mehrere angeboten werden.",
        "Lies deine fettfreie Masse, den nicht aus Fett bestehenden Teil.",
      ],
      explanationTitle: "Fettfreie Masse erklart",
      formula: "Fettfreie Masse = Gesamtgewicht x (1 - Korperfettanteil)",
      explanation: [
        "Die fettfreie Masse umfasst Muskeln, Knochen, Wasser und Organe; nur der Fettanteil entfallt, daher ist sie hoher als nur Muskelmasse.",
        "Sie hilft bei Proteinzielen, der Dosierung mancher Medikamente und der Verlaufskontrolle der Korperzusammensetzung.",
      ],
      faq: [
        { q: "Wie misst man Korperfett?", a: "Methoden reichen von Hautfaltenkalippern und Bioimpedanzwaagen bis DEXA-Scans, jeweils mit anderer Genauigkeit." },
        { q: "Warum zahlt fettfreie Masse?", a: "Sie spiegelt stoffwechselaktives Gewebe wider und hilft bei Ernahrung und Training, besonders im Alter." },
        { q: "Ist mehr immer besser?", a: "Mehr ist meist gunstig fur Stoffwechsel und Kraft, doch Kontext und Gesundheit zahlen mehr als die Zahl." },
      ],
    },
    ja: {
      steps: [
        "体重・体脂率（または皮膚折など別の方法）・性別を入力します。",
        "複数の推算式があるならいずれかを選びます。",
        "除脂肪体重（体のうち脂肪でない部分）を確認します。",
      ],
      explanationTitle: "除脂肪体重とは",
      formula: "除脂肪体重 = 体重 × (1 - 体脂肪率)",
      explanation: [
        "除脂肪体重には筋肉・骨・水分・内臓が含まれ、脂肪部分だけが除外されるため、単なる筋肉量より大きくなります。",
        "タンパク質目標の設定、一部の薬剤用量、体組成の経時変化の追跡に役立ちます。",
      ],
      faq: [
        { q: "体脂肪率はどう測る？", a: "皮膚折キャリパス、生体電気インピーダンス秤、DEXA スキャンなど精度はそれぞれ異なります。" },
        { q: "なぜ除脂肪体重が重要？", a: "代謝の活発な組織を反映し、栄養やトレーニングの調整に役立ちます。特に年齢とともに重要です。" },
        { q: "高い方が良い？", a: "代謝や筋力には概ね有利ですが、文脈や総合健康の方が数字単体より重要です。" },
      ],
    },
    es: {
      steps: [
        "Introduce peso, porcentaje de grasa corporal (o un metodo como pliegues) y sexo.",
        "Elige la ecuacion de estimacion si se ofrecen varias.",
        "Lee tu masa magra, la parte del cuerpo que no es grasa.",
      ],
      explanationTitle: "La masa magra explicada",
      formula: "Masa magra = Peso total x (1 - fraccion de grasa)",
      explanation: [
        "La masa magra incluye musculo, hueso, agua y organos; solo se excluye la grasa, asi que es mayor que solo musculo.",
        "Sirve para fijar objetivos de proteina, dosificar algunos medicamentos y seguir cambios de composicion corporal.",
      ],
      faq: [
        { q: "Como se mide la grasa corporal?", a: "Hay desde calibres de pliegues y balanzas de bioimpedancia hasta escaneos DEXA, cada uno con distinta precision." },
        { q: "Por que importa la masa magra?", a: "Refleja tejido metabolicamente activo y ayuda a ajustar nutricion y entrenamiento, sobre todo con la edad." },
        { q: "Mas masa magra es siempre mejor?", a: "Suele favorecer metabolismo y fuerza, pero el contexto y la salud global importan mas que la cifra." },
      ],
    },
  },

  "body-surface-area": {
    en: {
      steps: [
        "Enter your height and weight.",
        "Pick a formula such as Du Bois, Mosteller, or Haycock if available.",
        "Read your BSA in square metres, used for medical dosing.",
      ],
      explanationTitle: "Why body surface area matters",
      formula: "Mosteller: BSA = sqrt( (height cm x weight kg) / 3600 )",
      explanation: [
        "BSA estimates the total skin area and is used to dose certain drugs, especially chemotherapy, because it scales better than weight alone.",
        "Different formulas give slightly different results; clinicians pick one consistently. Never adjust prescribed doses yourself.",
      ],
      faq: [
        { q: "Why use BSA instead of weight?", a: "Many physiological processes scale with surface area, so BSA gives more consistent dosing across body sizes." },
        { q: "Which formula is best?", a: "They agree closely for average adults; Mosteller is common for its simplicity, Du Bois is a long-standing standard." },
        { q: "Can I use BSA to change my medication?", a: "Never. BSA guides prescribers; do not alter prescribed doses without your clinician." },
      ],
    },
    zh: {
      steps: [
        "输入身高和体重。",
        "若可用，选择公式，如 Du Bois、Mosteller 或 Haycock。",
        "查看以平方米为单位的体表面积，它用于医疗给药。",
      ],
      explanationTitle: "体表面积为何重要",
      formula: "Mosteller：BSA = √((身高 cm × 体重 kg) / 3600)",
      explanation: [
        "体表面积估算全身皮肤面积，并用于某些药物（尤其是化疗）的剂量计算，因为它比单一体重更能合理缩放。",
        "不同公式结果略有差异；临床医生会保持一致地选用一种。切勿自行调整处方剂量。",
      ],
      faq: [
        { q: "为什么用体表面积而非体重？", a: "许多生理过程随表面积缩放，因此体表面积在不同体型间给药更一致。" },
        { q: "哪个公式最好？", a: "对普通成年人它们非常接近；Mosteller 因简单常用，Du Bois 是长期标准。" },
        { q: "可以用体表面积自行改药量吗？", a: "绝不可。体表面积是给开方医生的参考，未经医生同意不要改动处方剂量。" },
      ],
    },
    zhTW: {
      steps: [
        "輸入身高和體重。",
        "若可用，選擇公式，如 Du Bois、Mosteller 或 Haycock。",
        "查看以平方公尺為單位的體表面積，它用於醫療給藥。",
      ],
      explanationTitle: "體表面積為何重要",
      formula: "Mosteller：BSA = √((身高 cm × 體重 kg) / 3600)",
      explanation: [
        "體表面積估算全身皮膚面積，並用於某些藥物（尤其是化療）的劑量計算，因為它比單一體重更能合理縮放。",
        "不同公式結果略有差異；臨床醫生會保持一致地選用一種。切勿自行調整處方劑量。",
      ],
      faq: [
        { q: "為什麼用體表面積而非體重？", a: "許多生理過程隨表面積縮放，因此體表面積在不同體型間給藥更一致。" },
        { q: "哪個公式最好？", a: "對普通成年人它們非常接近；Mosteller 因簡單常用，Du Bois 是長期標準。" },
        { q: "可以用體表面積自行改藥量嗎？", a: "絕不可。體表面積是給開方醫生的參考，未經醫生同意不要改動處方劑量。" },
      ],
    },
    de: {
      steps: [
        "Gib Grose und Gewicht ein.",
        "Wahle eine Formel wie Du Bois, Mosteller oder Haycock, falls verfugbar.",
        "Lies deine BSA in Quadratmetern, genutzt fur Medikamentendosierung.",
      ],
      explanationTitle: "Warum Korperoberflache zahlt",
      formula: "Mosteller: BSA = sqrt( (Grose cm x Gewicht kg) / 3600 )",
      explanation: [
        "Die BSA schatzt die gesamte Hautflache und dient der Dosierung bestimmter Medikamente, vor allem Chemotherapie, da sie besser skaliert als Gewicht allein.",
        "Verschiedene Formeln liefern leicht abweichende Werte; Kliniker wahlen konsequent eine. Dosen nie selbst andern.",
      ],
      faq: [
        { q: "Warum BSA statt Gewicht?", a: "Viele physiologische Prozesse skalieren mit der Flache, daher ist die BSA uber Korpergrosen hinweg konsistenter." },
        { q: "Welche Formel ist am besten?", a: "Bei durchschnittlichen Erwachsenen stimmen sie eng uberein; Mosteller ist einfach, Du Bois ein langjahrigen Standard." },
        { q: "Kann ich BSA nutzen, um Medikamente zu andern?", a: "Niemals. BSA leitet Verschreiber; andere verschriebene Dosen nicht ohne Arzt." },
      ],
    },
    ja: {
      steps: [
        "身長と体重を入力します。",
        "可能なら Du Bois、Mosteller、Haycock などの式を選びます。",
        "平方メートル単位の体表面積（BSA）を確認します。投薬に用いられます。",
      ],
      explanationTitle: "体表面積が重要な理由",
      formula: "Mosteller：BSA = √((身長 cm × 体重 kg) / 3600)",
      explanation: [
        "体表面積は全身の皮膚面積を推定し、体重単独より適切にスケーリングできるため、一部の薬（特に化学療法）の用量に使われます。",
        "式により結果がわずかに異なります。臨床医は一貫して一方を選びます。処方量を自分で変えてはいけません。",
      ],
      faq: [
        { q: "なぜ体重ではなくBSA？", a: "多くの生理プロセスは表面積に比例するため、体型を越えて用量が一貫しやすいからです。" },
        { q: "どの式が最良？", a: "平均的な成人では近い値です。Mosteller は簡便、Du Bois は長年の標準です。" },
        { q: "BSAで自分の薬を変えていい？", a: "絶対にだめです。BSAは処方医の指針です。医師の了承なく用量を変えてはいけません。" },
      ],
    },
    es: {
      steps: [
        "Introduce altura y peso.",
        "Elige una formula como Du Bois, Mosteller o Haycock si esta disponible.",
        "Lee tu BSA en metros cuadrados, usada para dosificar medicamentos.",
      ],
      explanationTitle: "Por que importa la superficie corporal",
      formula: "Mosteller: BSA = sqrt( (altura cm x peso kg) / 3600 )",
      explanation: [
        "La BSA estima el area total de piel y se usa para dosificar ciertos farmacos, especialmente quimioterapia, porque escala mejor que el peso solo.",
        "Distintas formulas dan resultados algo distintos; los clinicos eligen una con coherencia. Nunca ajustes tu propia dosis.",
      ],
      faq: [
        { q: "Por que usar BSA en vez de peso?", a: "Muchos procesos fisiologicos escalan con la superficie, asi la BSA da dosificacion mas consistente entre tallas." },
        { q: "Cual formula es mejor?", a: "Coinciden bastante en adultos promedio; Mosteller es simple, Du Bois es estandar de larga data." },
        { q: "Puedo usar BSA para cambiar mi medicina?", a: "Nunca. La BSA guia al prescriptor; no alteres dosis recetadas sin tu medico." },
      ],
    },
  },

  "carb-calculator": {
    en: {
      steps: [
        "Enter your daily calorie target and your chosen carbohydrate percentage.",
        "Add your activity level or goal if the tool uses it to suggest calories.",
        "Read the grams of carbohydrates to aim for each day.",
      ],
      explanationTitle: "Carbohydrates in your daily intake",
      formula: "Carb grams = (Calories x carb%) / 4  (carbs = 4 kcal per gram)",
      explanation: [
        "Carbohydrates supply about 4 kilocalories per gram; setting a percentage turns your calorie goal into a gram target.",
        "The right share depends on your goal, training, and preferences; many people do well across a wide range of carb intakes.",
      ],
      faq: [
        { q: "How many carbs should I eat?", a: "It varies; a common range is 45 to 65 percent of calories, but athletes or low-carb dieters may differ." },
        { q: "Are all carbs the same?", a: "No. Whole grains, fruit, and vegetables add fibre and nutrients, while added sugars give quick energy with little else." },
        { q: "Why 4 calories per gram?", a: "That is the average energy yield of carbohydrate; protein is also 4, fat is 9 per gram." },
      ],
    },
    zh: {
      steps: [
        "输入每日热量目标以及你选定的碳水化合物占比。",
        "若工具据此建议热量，可补充活动量或目标。",
        "查看每天应摄入的碳水化合物克数。",
      ],
      explanationTitle: "每日摄入中的碳水化合物",
      formula: "碳水克数 = (热量 × 碳水%) / 4（碳水每克 4 千卡）",
      explanation: [
        "碳水化合物每克约提供 4 千卡；设定占比就能把热量目标换算成克数目标。",
        "合适比例取决于目标、训练量和偏好；许多人在很宽的碳水摄入范围内都能表现良好。",
      ],
      faq: [
        { q: "我该吃多少碳水？", a: "因人而异；常见范围为热量的 45% 至 65%，但运动员或低碳饮食者可能不同。" },
        { q: "所有碳水都一样吗？", a: "不一样。全谷物、水果和蔬菜提供纤维与营养，而添加糖只给快速能量、营养很少。" },
        { q: "为什么每克 4 千卡？", a: "这是碳水的大致能量产出；蛋白质也是 4，脂肪则为 9。" },
      ],
    },
    zhTW: {
      steps: [
        "輸入每日熱量目標以及你選定的碳水化合物佔比。",
        "若工具據此建議熱量，可補充活動量或目標。",
        "查看每天應攝取的碳水化合物克數。",
      ],
      explanationTitle: "每日攝取中的碳水化合物",
      formula: "碳水克數 = (熱量 × 碳水%) / 4（碳水每克 4 千卡）",
      explanation: [
        "碳水化合物每克約提供 4 千卡；設定佔比就能把熱量目標換算成克數目標。",
        "合適比例取決於目標、訓練量和偏好；許多人在很寬的碳水攝取範圍內都能表現良好。",
      ],
      faq: [
        { q: "我該吃多少碳水？", a: "因人而異；常見範圍為熱量的 45% 至 65%，但運動員或低碳飲食者可能不同。" },
        { q: "所有碳水都一樣嗎？", a: "不一樣。全穀物、水果和蔬菜提供纖維與營養，而添加糖只給快速能量、營養很少。" },
        { q: "為什麼每克 4 千卡？", a: "這是碳水的大致能量產出；蛋白質也是 4，脂肪則為 9。" },
      ],
    },
    de: {
      steps: [
        "Gib dein kalorienziel und den gewahlten Kohlenhydratanteil ein.",
        "Erganze Aktivitat oder Ziel, falls die Kalorien daraus abgeleitet werden.",
        "Lies die Gramm Kohlenhydrate, die du taglich anvisierst.",
      ],
      explanationTitle: "Kohlenhydrate in der taglichen Ernahrung",
      formula: "KH-Gramm = (Kalorien x KH%) / 4  (KH = 4 kcal pro Gramm)",
      explanation: [
        "Kohlenhydrate liefern etwa 4 Kilokalorien pro Gramm; eine Prozentangabe verwandelt das Kalorienziel in ein Grammziel.",
        "Der passende Anteil hangt von Ziel, Training und Praferenzen ab; viele Menschen gedeihen uber ein weites KH-Spektrum.",
      ],
      faq: [
        { q: "Wie viele KH soll ich essen?", a: "Das variiert; oft 45 bis 65 Prozent der Kalorien, doch Sportler oder Low-Carb esser weichen ab." },
        { q: "Sind alle KH gleich?", a: "Nein. Vollkorn, Obst und Gemuse liefern Faser und Nahrstoffe, Zucker nur schnelle Energie mit wenig mehr." },
        { q: "Warum 4 Kalorien pro Gramm?", a: "Das ist der mittlere Energieertrag von Kohlenhydraten; Protein hat auch 4, Fett 9 pro Gramm." },
      ],
    },
    ja: {
      steps: [
        "1日のカロリー目標と炭水化物の割合を入力します。",
        "ツールがそれでカロリーを提案するなら、活動量や目標を追加します。",
        "1日の目標炭水化物グラム数を確認します。",
      ],
      explanationTitle: "日常摂取における炭水化物",
      formula: "炭水化物 g = (カロリー × 炭水化物%) / 4（炭水化物は1g4kcal）",
      explanation: [
        "炭水化物は1gあたり約4kcalを供給します。割合を決めるとカロリー目標がグラム目標に変わります。",
        "適切な割合は目標・トレーニング・好みによります。多くの人は幅広い炭水化物摂取範囲で問題ありません。",
      ],
      faq: [
        { q: "炭水化物はどれくらい取れば？", a: "人によります。目安はカロリーの45〜65%ですが、アスリートや低糖質食では異なります。" },
        { q: "炭水化物は全部同じ？", a: "違います。全粒穀物・果物・野菜は繊維と栄養を追加し、添加糖は素早いエネルギーだけで栄養は少ないです。" },
        { q: "なぜ1g4kcal？", a: "炭水化物の平均エネルギー産出です。タンパク質も4、脂質は9です。" },
      ],
    },
    es: {
      steps: [
        "Introduce tu objetivo calórico diario y el porcentaje de carbohidratos elegido.",
        "Anade actividad o meta si la herramienta la usa para sugerir calorias.",
        "Lee los gramos de carbohidratos a buscar cada dia.",
      ],
      explanationTitle: "Carbohidratos en tu ingesta diaria",
      formula: "Gramos CH = (Calorias x %CH) / 4  (CH = 4 kcal por gramo)",
      explanation: [
        "Los carbohidratos aportan unas 4 kilocalorias por gramo; un porcentaje convierte el objetivo calórico en un objetivo en gramos.",
        "La proporcion adecuada depende de tu meta, entrenamiento y preferencias; muchas personas van bien en un amplio rango de CH.",
      ],
      faq: [
        { q: "Cuantos carbohidratos debo comer?", a: "Varía; un rango comun es 45 a 65 por ciento de las calorias, pero atletas o dietas bajas en CH difieren." },
        { q: "Son iguales todos los CH?", a: "No. Granos enteros, fruta y verdura aportan fibra y nutrientes, mientras el azucar anadido da energia rapida y poco mas." },
        { q: "Por que 4 calorias por gramo?", a: "Ese es el rendimiento medio de los carbohidratos; la proteina tambien 4, la grasa 9 por gramo." },
      ],
    },
  },

  "fat-intake": {
    en: {
      steps: [
        "Enter your daily calorie goal and a target fat percentage.",
        "Choose whether to see grams of total fat or split into saturated and unsaturated.",
        "Read the grams of fat that fit your plan.",
      ],
      explanationTitle: "Dietary fat in context",
      formula: "Fat grams = (Calories x fat%) / 9  (fat = 9 kcal per gram)",
      explanation: [
        "Fat provides about 9 kilocalories per gram, more than twice carbs or protein, so small amounts contribute a lot of energy.",
        "The type of fat matters: unsaturated fats from plants and fish are generally favorable, while excess saturated and trans fats are not.",
      ],
      faq: [
        { q: "What fat percentage is healthy?", a: "Many guidelines suggest 20 to 35 percent of calories from fat, emphasising unsaturated sources." },
        { q: "Why does fat have more calories?", a: "Its chemical structure stores more energy per gram, which is why 9 kcal per gram versus 4 for carbs and protein." },
        { q: "Should I avoid all fat?", a: "No. Fat supports hormones, nerves, and vitamin absorption; choose quality sources and watch total amounts." },
      ],
    },
    zh: {
      steps: [
        "输入每日热量目标以及目标脂肪占比。",
        "选择查看总脂肪克数，还是细分为饱和与不饱和。",
        "查看符合你计划的脂肪克数。",
      ],
      explanationTitle: "膳食脂肪的语境",
      formula: "脂肪克数 = (热量 × 脂肪%) / 9（脂肪每克 9 千卡）",
      explanation: [
        "脂肪每克约提供 9 千卡，是碳水或蛋白质的两倍多，因此少量脂肪就贡献大量能量。",
        "脂肪类型很重要：来自动物和鱼类的不饱和脂肪通常更有利，而过量的饱和与反式脂肪则不利。",
      ],
      faq: [
        { q: "多少脂肪比例算健康？", a: "许多指南建议脂肪占热量的 20% 至 35%，并强调不饱和来源。" },
        { q: "为什么脂肪热量更高？", a: "其化学结构每克储存更多能量，因此是 9 千卡而非碳水的 4 千卡。" },
        { q: "应该完全不吃脂肪吗？", a: "不应该。脂肪支持激素、神经和维生素吸收；应选优质来源并控制总量。" },
      ],
    },
    zhTW: {
      steps: [
        "輸入每日熱量目標以及目標脂肪佔比。",
        "選擇查看總脂肪克數，還是細分為飽和與不飽和。",
        "查看符合你計畫的脂肪克數。",
      ],
      explanationTitle: "膳食脂肪的語境",
      formula: "脂肪克數 = (熱量 × 脂肪%) / 9（脂肪每克 9 千卡）",
      explanation: [
        "脂肪每克約提供 9 千卡，是碳水或蛋白質的兩倍多，因此少量脂肪就貢獻大量能量。",
        "脂肪類型很重要：來自植物和魚類的不飽和脂肪通常更有利，而過量的飽和與反式脂肪則不利。",
      ],
      faq: [
        { q: "多少脂肪比例算健康？", a: "許多指南建議脂肪佔熱量的 20% 至 35%，並強調不飽和來源。" },
        { q: "為什麼脂肪熱量更高？", a: "其化學結構每克儲存更多能量，因此是 9 千卡而非碳水的 4 千卡。" },
        { q: "應該完全不吃脂肪嗎？", a: "不應該。脂肪支持激素、神經和維生素吸收；應選優質來源並控制總量。" },
      ],
    },
    de: {
      steps: [
        "Gib dein kalorienziel und einen Ziel-Fettanteil ein.",
        "Wahle, ob du Gramm Gesamtfett siehst oder eine Trennung in gesattigt und ungesattigt.",
        "Lies die Gramm Fett, die in deinen Plan passen.",
      ],
      explanationTitle: "Nahrungsfett im Kontext",
      formula: "Fettgramm = (Kalorien x Fett%) / 9  (Fett = 9 kcal pro Gramm)",
      explanation: [
        "Fett liefert etwa 9 Kilokalorien pro Gramm, mehr als doppelt so viel wie Kohlenhydrate oder Protein, daher tragen kleine Mengen viel Energie bei.",
        "Die Art zahlt: Ungesattigte Fette aus Pflanzen und Fisch sind gunstig, zu viel gesattigtes und trans Fett eher nicht.",
      ],
      faq: [
        { q: "Welcher Fettanteil ist gesund?", a: "Viele Leitlinien raten zu 20 bis 35 Prozent der Kalorien aus Fett, mit Fokus auf ungesattigte Quellen." },
        { q: "Warum hat Fett mehr Kalorien?", a: "Seine chemische Struktur speichert mehr Energie pro Gramm, daher 9 kcal statt 4 bei KH und Protein." },
        { q: "Sollte ich alles Fett meiden?", a: "Nein. Fett stutzt Hormone, Nerven und Vitaminaufnahme; wahle gute Quellen und achte auf die Menge." },
      ],
    },
    ja: {
      steps: [
        "1日のカロリー目標と脂肪の目標割合を入力します。",
        "総脂肪のグラム表示か、飽和・不飽和の内訳かを選びます。",
        "計画に合う脂肪のグラム数を確認します。",
      ],
      explanationTitle: "食事性脂肪を考える",
      formula: "脂肪 g = (カロリー × 脂肪%) / 9（脂肪は1g9kcal）",
      explanation: [
        "脂肪は1gあたり約9kcalを供給し、炭水化物やタンパク質の2倍以上です。少量でも大きなエネルギーになります。",
        "種類が重要です。植物や魚の不飽和脂肪は概ね良好で、過剰な飽和・トランス脂肪は望ましくありません。",
      ],
      faq: [
        { q: "脂肪の割合はどれくらいが健康？", a: "多くの指針は热量の20〜35%を脂肪とし、不飽和源を重視します。" },
        { q: "なぜ脂肪はカロリーが高い？", a: "化学構造が1gあたりより多くのエネルギーを蓄えるため、炭水化物の4kcalではなく9kcalです。" },
        { q: "脂肪を全部避けるべき？", a: "いいえ。脂肪はホルモン・神経・ビタミン吸収を支えます。良質な源を選び総量を守ってください。" },
      ],
    },
    es: {
      steps: [
        "Introduce tu objetivo calórico diario y un porcentaje de grasa objetivo.",
        "Elige si ves gramos de grasa total o dividido en saturada e insaturada.",
        "Lee los gramos de grasa que encajan en tu plan.",
      ],
      explanationTitle: "La grasa dietetica en contexto",
      formula: "Gramos grasa = (Calorias x %grasa) / 9  (grasa = 9 kcal por gramo)",
      explanation: [
        "La grasa aporta unas 9 kilocalorias por gramo, mas del doble que carbohidratos o proteina, asi poca cantidad suma mucha energia.",
        "El tipo importa: las grasas insaturadas de plantas y pescado son favorables, mientras el exceso de saturadas y trans no.",
      ],
      faq: [
        { q: "Que porcentaje de grasa es saludable?", a: "Muchas guias sugieren 20 a 35 por ciento de las calorias en grasa, enfatizando fuentes insaturadas." },
        { q: "Por que la grasa tiene mas calorias?", a: "Su estructura quimica almacena mas energia por gramo, de ahi 9 kcal frente a 4 de CH y proteina." },
        { q: "Debo evitar toda la grasa?", a: "No. La grasa sostiene hormonas, nervios y absorcion de vitaminas; elige fuentes buenas y vigila la cantidad." },
      ],
    },
  },

  "body-type": {
    en: {
      steps: [
        "Answer a few questions about your build, or enter simple measurements.",
        "Let the tool classify you into a somatotype or a blend.",
        "Read the description and how it may relate to training and diet.",
      ],
      explanationTitle: "Body types, or somatotypes",
      formula: "Descriptive classification, not a single formula",
      explanation: [
        "Somatotypes group builds into ectomorph (lean), mesomorph (muscular), and endomorph (rounder), though most people are a mix.",
        "The model is a rough frame for training and nutrition, not a fixed destiny; genetics, diet, and exercise shape your actual results.",
      ],
      faq: [
        { q: "Can my body type change?", a: "Yes. Training and diet shift your composition; the label is a starting point, not a life sentence." },
        { q: "Which body type is best?", a: "None is superior; each has trade-offs, and mixed types are common and completely normal." },
        { q: "Should I train only for my type?", a: "Use it as a guide, then follow evidence-based training and nutrition that fit your goals." },
      ],
    },
    zh: {
      steps: [
        "回答几个关于你体型的问题，或输入简单的测量值。",
        "让工具把你归类为某种体型，或几种的混合。",
        "查看描述，以及它可能与训练和饮食的关系。",
      ],
      explanationTitle: "体型（体质类型）",
      formula: "描述性分类，并非单一公式",
      explanation: [
        "体型学说把身材分为外胚型（偏瘦）、中胚型（肌肉型）和内胚型（偏圆润），但多数人都是混合体。",
        "该模型是训练与营养的粗略框架，而非固定宿命；基因、饮食和运动决定你的实际结果。",
      ],
      faq: [
        { q: "我的体型能改变吗？", a: "能。训练和饮食会改变你的成分；标签只是起点，不是终身定论。" },
        { q: "哪种体型最好？", a: "没有哪种更优；每种都有取舍，混合型很常见也完全正常。" },
        { q: "只该按体型训练吗？", a: "把它当参考，再遵循契合你目标、有证据支持的训练与营养方案。" },
      ],
    },
    zhTW: {
      steps: [
        "回答幾個關於你體型的問題，或輸入簡單的測量值。",
        "讓工具把你歸類為某種體型，或幾種的混合。",
        "查看描述，以及它可能與訓練和飲食的關係。",
      ],
      explanationTitle: "體型（體質類型）",
      formula: "描述性分類，並非單一公式",
      explanation: [
        "體型學說把身材分為外胚型（偏瘦）、中胚型（肌肉型）和內胚型（偏圓潤），但多數人都是混合體。",
        "該模型是訓練與營養的粗略框架，而非固定宿命；基因、飲食和運動決定你的實際結果。",
      ],
      faq: [
        { q: "我的體型能改變嗎？", a: "能。訓練和飲食會改變你的成分；標籤只是起點，不是終身定論。" },
        { q: "哪種體型最好？", a: "沒有哪種更優；每種都有取捨，混合型很常見也完全正常。" },
        { q: "只該按體型訓練嗎？", a: "把它當參考，再遵循契合你目標、有證據支持的訓練與營養方案。" },
      ],
    },
    de: {
      steps: [
        "Beantworte ein paar Fragen zu deinem Korperbau oder gib einfache Messwerte ein.",
        "Lass das Werkzeug dich als Somatotyp oder Mischung einordnen.",
        "Lies die Beschreibung und den Bezug zu Training und Ernahrung.",
      ],
      explanationTitle: "Korpertypen, oder Somatotypen",
      formula: "Beschreibende Klassifikation, keine einzelne Formel",
      explanation: [
        "Somatotypen gruppieren Korperbau in Ektomorph (schlank), Mesomorph (muskulos) und Endomorph (rundlicher), doch die meisten sind eine Mischung.",
        "Das Modell ist ein grober Rahmen fur Training und Ernahrung, kein festes Schicksal; Gene, Ernahrung und Sport formen das Ergebnis.",
      ],
      faq: [
        { q: "Kann sich mein Typ andern?", a: "Ja. Training und Ernahrung verschieben deine Zusammensetzung; das Label ist ein Startpunkt, kein Urteil." },
        { q: "Welcher Typ ist am besten?", a: "Keiner ist uberlegen; jeder hat Vor- und Nachteile, Mischtypen sind normal." },
        { q: "Sollte ich nur fur meinen Typ trainieren?", a: "Nutze es als Leitfaden, dann evidence-basiertes Training und Ernahrung wahlen, die zu deinen Zielen passen." },
      ],
    },
    ja: {
      steps: [
        "体型についていくつか質問に答えるか、簡単な測定値を入力します。",
        "ソマトタイプ（体型）またはその混合として分類させます。",
        "説明と、トレーニング・食事との関連を確認します。",
      ],
      explanationTitle: "ボディタイプ（ソマトタイプ）",
      formula: "記述的な分類であり、単一の式ではない",
      explanation: [
        "ソマトタイプは体型を外胚葉型（痩せ気味）、中胚葉型（筋肉質）、内胚葉型（丸み）に分けますが、多くの人は混合です。",
        "このモデルはトレーニングと栄養の大まかな枠組みであり運命ではありません。遺伝・食事・運動が実際の結果を決めます。",
      ],
      faq: [
        { q: "体型は変わる？", a: "はい。トレーニングと食事で体組成は変わります。ラベルは出発点であり定めではありません。" },
        { q: "どの体型が最高？", a: "優れたものはありません。それぞれトレードオフがあり、混合型は一般的で正常です。" },
        { q: "体型だけでトレーニングすべき？", a: "目安として使い、目標に合った証拠に基づくトレーニングと食事を選んでください。" },
      ],
    },
    es: {
      steps: [
        "Responde algunas preguntas sobre tu complexion o introduce medidas simples.",
        "Deja que la herramienta te clasifique en un somatotipo o una mezcla.",
        "Lee la descripcion y como puede relacionarse con entrenamiento y dieta.",
      ],
      explanationTitle: "Tipos de cuerpo, o somatotipos",
      formula: "Clasificacion descriptiva, no una formula unica",
      explanation: [
        "Los somatotipos agrupan complexiones en ectomorfo (delgado), mesomorfo (musculoso) y endomorfo (mas redondeado), aunque la mayoria son una mezcla.",
        "El modelo es un marco aproximado para entrenamiento y nutricion, no un destino fijo; genetica, dieta y ejercicio moldean tus resultados.",
      ],
      faq: [
        { q: "Puede cambiar mi tipo de cuerpo?", a: "Si. El entrenamiento y la dieta cambian tu composicion; la etiqueta es un punto de partida, no una sentencia." },
        { q: "Cual tipo es mejor?", a: "Ninguno es superior; cada uno tiene compromisos y los tipos mixtos son comunes y normales." },
        { q: "Debo entrenar solo para mi tipo?", a: "Usalo como guia, luego sigue entrenamiento y nutricion basados en evidencia que encajen con tus metas." },
      ],
    },
  },

  "army-body-fat": {
    en: {
      steps: [
        "Enter the required measurements such as height, neck, and waist (and hips for some).",
        "Choose the correct sex-specific formula.",
        "Read your estimated body fat percentage and whether it meets the standard.",
      ],
      explanationTitle: "The Army body-fat method",
      formula: "Uses circumference-based equations that differ for men and women",
      explanation: [
        "The method estimates body fat from tape measurements at the neck and waist, with hip circumference added for women, using sex-specific equations.",
        "It is a field method: quick and repeatable, but less precise than DEXA or hydrostatic weighing, so treat results as estimates.",
      ],
      faq: [
        { q: "Why measure the neck?", a: "The neck helps account for upper-body lean tissue, improving the estimate alongside waist size." },
        { q: "Is it accurate?", a: "It is good for screening and tracking, but not a laboratory measurement; small tape errors change the result." },
        { q: "Does it apply outside the military?", a: "The math works for anyone, but pass/fail standards are military-specific; consult your own guidelines." },
      ],
    },
    zh: {
      steps: [
        "输入所需测量值，如身高、颈围、腰围（部分含臀围）。",
        "选择对应性别的公式。",
        "查看估算的体脂率，以及是否达标。",
      ],
      explanationTitle: "军队体脂测量法",
      formula: "采用按性别区分的围度方程",
      explanation: [
        "该方法通过颈部与腰部的皮尺测量来估算体脂，女性另加臀围，使用按性别区分的方程。",
        "这是一种现场方法：快速且可重复，但精度不如 DEXA 或水下称重，因此结果应视为估算。",
      ],
      faq: [
        { q: "为什么要量脖子？", a: "颈部有助于计入上半身瘦组织，配合腰围可改善估算。" },
        { q: "它准确吗？", a: "适合筛查与追踪，但不是实验室测量；皮尺的微小误差就会改变结果。" },
        { q: "军人以外也能用吗？", a: "计算对任何人都适用，但合格/不合格标准是军方特定的，请参考你自己的指南。" },
      ],
    },
    zhTW: {
      steps: [
        "輸入所需測量值，如身高、頸圍、腰圍（部分含臀圍）。",
        "選擇對應性別的公式。",
        "查看估算的體脂率，以及是否達標。",
      ],
      explanationTitle: "軍隊體脂測量法",
      formula: "採用按性別區分的圍度方程",
      explanation: [
        "該方法透過頸部與腰部的皮尺測量來估算體脂，女性另加臀圍，使用按性別區分的方程。",
        "這是一種現場方法：快速且可重複，但精度不如 DEXA 或水下稱重，因此結果應視為估算。",
      ],
      faq: [
        { q: "為什麼要量脖子？", a: "頸部有助於計入上半身瘦組織，配合腰圍可改善估算。" },
        { q: "它準確嗎？", a: "適合篩查與追蹤，但不是實驗室測量；皮尺的微小誤差就會改變結果。" },
        { q: "軍人以外也能用嗎？", a: "計算對任何人都適用，但合格/不合格標準是軍方特定的，請參考你自己的指南。" },
      ],
    },
    de: {
      steps: [
        "Gib die nötigen Masse ein wie Grose, Hals und Taille (bei einigen Huften).",
        "Wahle die geschlechtsspezifische Formel.",
        "Lies deinen geschatzen Korperfettanteil und ob er den Standard erfullt.",
      ],
      explanationTitle: "Die Army-Korperfett-Methode",
      formula: "Nutzt umfangbasierte Gleichungen, die sich fur Manner und Frauen unterscheiden",
      explanation: [
        "Die Methode schatzt Korperfett aus Bandmassen an Hals und Taille, bei Frauen zusatzlich Huftumfang, mit geschlechtsspezifischen Gleichungen.",
        "Es ist ein Feldverfahren: schnell und wiederholbar, aber weniger prazise als DEXA oder Hydrostatic-Wagung; Ergebnisse als Schatzung sehen.",
      ],
      faq: [
        { q: "Warum den Hals messen?", a: "Der Hals erfasst obere lean tissue und verbessert die Schatzung zusammen mit der Taille." },
        { q: "Ist es genau?", a: "Gut fur Screening und Verlauf, aber keine Labor Messung; kleine Bandfehler andern das Ergebnis." },
        { q: "Gilt es ausserhalb des Militars?", a: "Die Rechnung passt fur alle, doch Bestehen-Grenzen sind militarisch; eigene Richtlinien beachten." },
      ],
    },
    ja: {
      steps: [
        "身長・首囲・腹囲（一部は臀囲も）などの必要測定値を入力します。",
        "性別に応じた式を選びます。",
        "推定体脂肪率と、基準を満たすかを確認します。",
      ],
      explanationTitle: "陸軍体脂肪法",
      formula: "男女で異なる周径ベースの式を使用",
      explanation: [
        "この方法は首と胴囲の巻き尺測定から体脂肪を推定し、女性はさらに臀囲を加えた性別式を用います。",
        "現場手法であり迅速で再現性がありますが、DEXA や水中称重より精度は低く、結果は推定として扱ってください。",
      ],
      faq: [
        { q: "なぜ首を測る？", a: "首は上半身の除脂肪組織を反映し、腹囲と併せて推定を改善します。" },
        { q: "正確？", a: "スクリーニングや経過観察には良いですが、実験室測定ではありません。巻き尺の小さな誤差で変わります。" },
        { q: "軍以外でも使える？", a: "計算自体は誰にでも当てはまりますが、合否基準は軍独自です。ご自身の指針を参照してください。" },
      ],
    },
    es: {
      steps: [
        "Introduce las medidas requeridas como altura, cuello y cintura (y cadera en algunos).",
        "Elige la formula correcta segun el sexo.",
        "Lee tu porcentaje estimado de grasa corporal y si cumple el estandar.",
      ],
      explanationTitle: "El metodo de grasa corporal del Ejercito",
      formula: "Usa ecuaciones por circunferencia distintas para hombres y mujeres",
      explanation: [
        "El metodo estima la grasa corporal por medidas de cinta en cuello y cintura, con cadera anadida para mujeres, usando ecuaciones por sexo.",
        "Es un metodo de campo: rapido y repetible, pero menos preciso que DEXA o pesaje hidrostico, asi que tomado como estimacion.",
      ],
      faq: [
        { q: "Por que medir el cuello?", a: "El cuello ayuda a contar tejido magro del tren superior, mejorando la estimacion junto con la cintura." },
        { q: "Es preciso?", a: "Buen para cribado y seguimiento, pero no es medida de laboratorio; pequenos errores de cinta cambian el resultado." },
        { q: "Aplica fuera del ejercito?", a: "La matematica sirve a cualquiera, pero los estandares de apto/no apto son militares; consulta tus propias guias." },
      ],
    },
  },

  "gfr-calculator": {
    en: {
      steps: [
        "Enter your serum creatinine, age, and sex (and race coefficient if the older equation uses it).",
        "Choose the equation, such as CKD-EPI or MDRD.",
        "Read your estimated GFR and the corresponding kidney stage.",
      ],
      explanationTitle: "What eGFR tells you",
      formula: "CKD-EPI and MDRD equations estimate GFR from creatinine, age, sex (and historically race)",
      explanation: [
        "eGFR estimates how well your kidneys filter waste; lower numbers mean reduced kidney function, grouped into stages 1 to 5.",
        "It is a screening estimate from a blood test, not a diagnosis; only a clinician can interpret it alongside other tests.",
      ],
      faq: [
        { q: "What is a normal eGFR?", a: "Around 90 or above is generally normal for adults, though it naturally declines a little with age." },
        { q: "Why does race appear in some formulas?", a: "Older equations included a race coefficient, but current guidelines favour race-free versions to reduce bias." },
        { q: "Should I worry about one low result?", a: "A single value can vary; your clinician looks at trends and other tests before drawing conclusions." },
      ],
    },
    zh: {
      steps: [
        "输入血清肌酐、年龄和性别（旧公式若需要，再加种族系数）。",
        "选择方程，如 CKD-EPI 或 MDRD。",
        "查看估算的 eGFR 以及对应的肾脏分期。",
      ],
      explanationTitle: "eGFR 告诉你什么",
      formula: "CKD-EPI 与 MDRD 方程根据肌酐、年龄、性别（历史上含种族）估算 GFR",
      explanation: [
        "eGFR 估算肾脏过滤废物的能力；数值越低代表肾功能越差，分为 1 至 5 期。",
        "它只是血液检查的筛查估算，并非诊断；只有医生能结合其他检查来解读。",
      ],
      faq: [
        { q: "正常 eGFR 是多少？", a: "成人一般在 90 或以上为正常，但会随年龄自然略微下降。" },
        { q: "为什么有些公式出现种族？", a: "旧方程含种族系数，但现行指南偏向无种族版本以减少偏倚。" },
        { q: "一次偏低要担心吗？", a: "单次数值会有波动；医生会看趋势和其他检查再做判断。" },
      ],
    },
    zhTW: {
      steps: [
        "輸入血清肌酐、年齡和性別（舊公式若需要，再加種族係數）。",
        "選擇方程，如 CKD-EPI 或 MDRD。",
        "查看估算的 eGFR 以及對應的腎臟分期。",
      ],
      explanationTitle: "eGFR 告訴你什麼",
      formula: "CKD-EPI 與 MDRD 方程根據肌酐、年齡、性別（歷史上含種族）估算 GFR",
      explanation: [
        "eGFR 估算腎臟過濾廢物的能力；數值越低代表腎功能越差，分為 1 至 5 期。",
        "它只是血液檢查的篩查估算，並非診斷；只有醫生能結合其他檢查來解讀。",
      ],
      faq: [
        { q: "正常 eGFR 是多少？", a: "成人一般在 90 或以上為正常，但會隨年齡自然略微下降。" },
        { q: "為什麼有些公式出現種族？", a: "舊方程含種族係數，但現行指南偏向無種族版本以減少偏倚。" },
        { q: "一次偏低要擔心嗎？", a: "單次數值會有波動；醫生會看趨勢和其他檢查再做判斷。" },
      ],
    },
    de: {
      steps: [
        "Gib Serumkreatinin, Alter und Geschlecht ein (und Rassenkoeffizient bei alter Formel).",
        "Wahle die Gleichung, wie CKD-EPI oder MDRD.",
        "Lies deine geschatze GFR und das entsprechende Nierenstadium.",
      ],
      explanationTitle: "Was eGFR dir sagt",
      formula: "CKD-EPI und MDRD schatzen GFR aus Kreatinin, Alter, Geschlecht (historisch Rasse)",
      explanation: [
        "eGFR schatzt, wie gut die Nieren Abfall filtern; niedrigere Werte bedeuten reduzierte Funktion, eingeteilt in Stadien 1 bis 5.",
        "Es ist eine Screening-Schatung aus einem Bluttest, keine Diagnose; nur ein Arzt deutet sie mit weiteren Tests.",
      ],
      faq: [
        { q: "Was ist eine normale eGFR?", a: "Bei Erwachsenen meist 90 oder mehr, sie sinkt mit dem Alter naturlich leicht." },
        { q: "Warum taucht Rasse in Formeln auf?", a: "Altere Gleichungen hatten einen Rassenkoeffizienten, doch aktuelle Leitlinien bevorzugen rassefreie Versionen." },
        { q: "Soll ich mir bei einem niedrigen Wert Sorgen machen?", a: "Ein Einzelwert schwankt; dein Arzt beachtet Trends und weitere Tests vor Schlussen." },
      ],
    },
    ja: {
      steps: [
        "血清クレアチニン・年齢・性別を入力します（旧式なら人種係数も）。",
        "CKD-EPI や MDRD などの式を選びます。",
        "推定 eGFR と対応する腎臓のステージを確認します。",
      ],
      explanationTitle: "eGFR が示すこと",
      formula: "CKD-EPI と MDRD はクレアチニン・年齢・性別（歴史的に人種）から GFR を推定",
      explanation: [
        "eGFR は腎臓が老廃物を濾過する能力を推定します。数値が低いほど機能低下で、ステージ1〜5に分類されます。",
        "血液検査からのスクリーニング推定であり診断ではありません。解釈は他の検査と合わせて医師が行います。",
      ],
      faq: [
        { q: "正常なeGFRは？", a: "成人では概ね90以上が正常ですが、加齢とともに少し低下します。" },
        { q: "なぜ人種が式に出る？", a: "旧式は人種係数を含んでいましたが、現在の指針はバイアス低減のため人種非依存版を推奨します。" },
        { q: "一度低いと心配？", a: "単値は変動します。医師は傾向と他検査を見て判断します。" },
      ],
    },
    es: {
      steps: [
        "Introduce creatinina serica, edad y sexo (y coeficiente de raza si la ecuacion antigua lo usa).",
        "Elige la ecuacion, como CKD-EPI o MDRD.",
        "Lee tu GFR estimada y el estadio renal correspondiente.",
      ],
      explanationTitle: "Que te dice la eGFR",
      formula: "CKD-EPI y MDRD estiman GFR por creatinina, edad, sexo (historica raza)",
      explanation: [
        "La eGFR estima cuanto filtran tus rinones los desechos; numeros bajos indican funcion reducida, agrupada en estadios 1 a 5.",
        "Es una estimacion de cribado de un analisis de sangre, no un diagnostico; solo un medico la interpreta con otras pruebas.",
      ],
      faq: [
        { q: "Que es una eGFR normal?", a: "En adultos suele ser 90 o mas, aunque baja un poco con la edad de forma natural." },
        { q: "Por que aparece la raza en algunas formulas?", a: "Las ecuaciones antiguas incluian un coeficiente de raza, pero las guias actuales prefieren versiones sin raza para reducir sesgo." },
        { q: "Debo preocuparme por un resultado bajo?", a: "Un valor unico varia; tu medico mira tendencias y otras pruebas antes de concluir." },
      ],
    },
  },

  "molecular-weight": {
    en: {
      steps: [
        "Enter a chemical formula such as H2O or C6H12O6.",
        "Let the tool sum the atomic masses of each element.",
        "Read the molar mass in grams per mole.",
      ],
      explanationTitle: "Counting atoms by mass",
      formula: "Molar mass = sum of (atoms of element x atomic mass)",
      explanation: [
        "Molecular weight is the sum of the atomic masses of all atoms in a formula, using standard atomic weights from the periodic table.",
        "It bridges the microscopic (atoms) and macroscopic (grams) worlds, letting you weigh out a known number of moles.",
      ],
      faq: [
        { q: "What is the difference between mass and weight here?", a: "In practice the terms are used interchangeably for this value, though strictly mass is the physical quantity." },
        { q: "Why does water equal 18?", a: "H is about 1 and O about 16, so H2O is 2x1 + 16 = 18 grams per mole." },
        { q: "Does it work for hydrates?", a: "Yes, include the water of crystallisation in the formula, for example CuSO4·5H2O." },
      ],
    },
    zh: {
      steps: [
        "输入化学式，如 H2O 或 C6H12O6。",
        "让工具对每种元素的原子质量求和。",
        "查看以克每摩尔为单位的摩尔质量。",
      ],
      explanationTitle: "按质量数原子",
      formula: "摩尔质量 = Σ(某元素原子数 × 原子质量)",
      explanation: [
        "分子量（摩尔质量）是化学式中所有原子质量之和，使用元素周期表的标准原子量。",
        "它连接微观（原子）与宏观（克）世界，让你能称出已知摩尔数的物质。",
      ],
      faq: [
        { q: "这里的「质量」与「重量」有何区别？", a: "实际中这两个词常混用，但严格来说质量是物理量。" },
        { q: "为什么水等于 18？", a: "H 约 1、O 约 16，因此 H2O = 2×1 + 16 = 18 克每摩尔。" },
        { q: "结晶水合物也能算吗？", a: "能，把结晶水写进化学式，例如 CuSO4·5H2O。" },
      ],
    },
    zhTW: {
      steps: [
        "輸入化學式，如 H2O 或 C6H12O6。",
        "讓工具對每種元素的原子質量求和。",
        "查看以克每莫耳為單位的莫耳質量。",
      ],
      explanationTitle: "按質量數原子",
      formula: "莫耳質量 = Σ(某元素原子數 × 原子質量)",
      explanation: [
        "分子量（莫耳質量）是化學式中所有原子質量之和，使用元素週期表的標準原子量。",
        "它連接微觀（原子）與巨觀（克）世界，讓你能稱出已知莫耳數的物質。",
      ],
      faq: [
        { q: "這裡的「質量」與「重量」有何區別？", a: "實際中這兩個詞常混用，但嚴格來說質量是物理量。" },
        { q: "為什麼水等於 18？", a: "H 約 1、O 約 16，因此 H2O = 2×1 + 16 = 18 克每莫耳。" },
        { q: "結晶水合物也能算嗎？", a: "能，把結晶水寫進化學式，例如 CuSO4·5H2O。" },
      ],
    },
    de: {
      steps: [
        "Gib eine chemische Formel ein wie H2O oder C6H12O6.",
        "Lass das Werkzeug die Atommassen jedes Elements aufsummieren.",
        "Lies die molare Masse in Gramm pro Mol.",
      ],
      explanationTitle: "Atome uber Masse zahlen",
      formula: "Molmasse = Summe (Atome des Elements x Atommasse)",
      explanation: [
        "Die Molekularmasse ist die Summe der Atommassen aller Atome in einer Formel, mit Standardatomgewichten aus dem Periodensystem.",
        "Sie verbindet die mikroskopische (Atome) und makroskopische (Gramm) Welt, sodass du eine bekannte Molzahl abwagen kannst.",
      ],
      faq: [
        { q: "Was ist der Unterschied zwischen Masse und Gewicht hier?", a: "In der Praxis werden die Begriffe gleichwertig genutzt, streng genommen ist Masse die physikalische Grobe." },
        { q: "Warum ist Wasser 18?", a: "H ist etwa 1 und O etwa 16, also H2O = 2x1 + 16 = 18 Gramm pro Mol." },
        { q: "Funktioniert es bei Hydraten?", a: "Ja, das Kristallwasser in die Formel einbeziehen, zum Beispiel CuSO4·5H2O." },
      ],
    },
    ja: {
      steps: [
        "H2O や C6H12O6 などの化学式を入力します。",
        "ツールに各元素の原子質量を合計させます。",
        "g/mol 単位のモル質量を確認します。",
      ],
      explanationTitle: "質量で原子を数える",
      formula: "モル質量 = Σ(元素の原子数 × 原子質量)",
      explanation: [
        "分子量（モル質量）は化学式内のすべての原子質量の和で、周期表の標準原子量を用います。",
        "これはミクロ（原子）とマクロ（グラム）の世界をつなぎ、既知のモル数を量り取れるようにします。",
      ],
      faq: [
        { q: "ここでの質量と重量の違いは？", a: "実用上は同じ意味で使われますが、厳密には質量が物理量です。" },
        { q: "なぜ水は18？", a: "Hは約1、Oは約16なので H2O = 2×1 + 16 = 18 g/mol です。" },
        { q: "水和物にも使える？", a: "はい。結晶水を式に含めます。例：CuSO4·5H2O。" },
      ],
    },
    es: {
      steps: [
        "Introduce una formula quimica como H2O o C6H12O6.",
        "Deja que la herramienta sume las masas atomicas de cada elemento.",
        "Lee la masa molar en gramos por mol.",
      ],
      explanationTitle: "Contar atomos por masa",
      formula: "Masa molar = suma de (atomos del elemento x masa atomica)",
      explanation: [
        "El peso molecular es la suma de las masas atomicas de todos los atomos de una formula, usando pesos atomicos estandar de la tabla periodica.",
        "Une los mundos microscopico (atomos) y macroscopico (gramos), permitiendote pesar un numero conocido de moles.",
      ],
      faq: [
        { q: "Cual es la diferencia entre masa y peso aqui?", a: "En la practica se usan indistintamente, aunque estrictamente la masa es la magnitud fisica." },
        { q: "Por que el agua es 18?", a: "H es cerca de 1 y O cerca de 16, asi H2O = 2x1 + 16 = 18 gramos por mol." },
        { q: "Funciona para hidratos?", a: "Si, incluye el agua de cristalizacion en la formula, por ejemplo CuSO4·5H2O." },
      ],
    },
  },

  "molarity": {
    en: {
      steps: [
        "Enter the moles of solute and the volume of solution in litres.",
        "Adjust units if the tool lets you switch between molar, millimolar, and so on.",
        "Read the concentration in moles per litre, or M.",
      ],
      explanationTitle: "Concentration as molarity",
      formula: "M = moles of solute / litres of solution",
      explanation: [
        "Molarity counts how many moles of a substance are dissolved in one litre of solution, the most common lab concentration unit.",
        "Because it is per litre of final solution (not solvent), dilution changes molarity while the amount of solute stays the same.",
      ],
      faq: [
        { q: "Moles vs molar, what is the difference?", a: "A mole is an amount of substance; molar (M) is that amount per litre of solution." },
        { q: "How do I make a solution of a target M?", a: "Dissolve the needed moles (mass divided by molar mass) and then add solvent up to the final volume." },
        { q: "Why does temperature matter?", a: "Volume changes slightly with temperature, so molarity is technically temperature dependent; molality is not." },
      ],
    },
    zh: {
      steps: [
        "输入溶质的摩尔数，以及溶液体积（升）。",
        "若工具支持，可切换摩尔、毫摩尔等单位。",
        "查看以摩尔每升（M）为单位的浓度。",
      ],
      explanationTitle: "用摩尔浓度表示浓度",
      formula: "M = 溶质摩尔数 / 溶液升数",
      explanation: [
        "摩尔浓度表示每升溶液溶解了多少摩尔物质，是实验室最常用的浓度单位。",
        "由于它按最终溶液体积（而非溶剂）计算，稀释会改变摩尔浓度，而溶质量保持不变。",
      ],
      faq: [
        { q: "摩尔与摩尔浓度有何区别？", a: "摩尔是物质的量；摩尔浓度（M）是该量除以溶液升数。" },
        { q: "如何配制目标 M 的溶液？", a: "先溶解所需摩尔数（质量除以摩尔质量），再加溶剂至最终体积。" },
        { q: "温度为什么有影响？", a: "体积随温度略有变化，因此摩尔浓度在技术上依赖温度；质量摩尔浓度则不然。" },
      ],
    },
    zhTW: {
      steps: [
        "輸入溶質的莫耳數，以及溶液體積（升）。",
        "若工具支援，可切換莫耳、毫莫耳等單位。",
        "查看以莫耳每升（M）為單位的濃度。",
      ],
      explanationTitle: "用莫耳濃度表示濃度",
      formula: "M = 溶質莫耳數 / 溶液升數",
      explanation: [
        "莫耳濃度表示每升溶液溶解了多少莫耳物質，是實驗室最常用的濃度單位。",
        "由於它按最終溶液體積（而非溶劑）計算，稀釋會改變莫耳濃度，而溶質量保持不變。",
      ],
      faq: [
        { q: "莫耳與莫耳濃度有何區別？", a: "莫耳是物質的量；莫耳濃度（M）是該量除以溶液升數。" },
        { q: "如何配製目標 M 的溶液？", a: "先溶解所需莫耳數（質量除以莫耳質量），再加溶劑至最終體積。" },
        { q: "溫度為什麼有影響？", a: "體積隨溫度略有變化，因此莫耳濃度在技術上依賴溫度；質量莫耳濃度則不然。" },
      ],
    },
    de: {
      steps: [
        "Gib die Mol des gelosten Stoffs und das Losungsvolumen in Litern ein.",
        "Passe Einheiten an, falls das Werkzeug Mol, Millimol und ahnliches umschaltet.",
        "Lies die Konzentration in Mol pro Liter, also M.",
      ],
      explanationTitle: "Konzentration als Molaritat",
      formula: "M = Mol des Gelosten / Liter Losung",
      explanation: [
        "Die Molaritat zahlt, wie viele Mol eines Stoffs in einem Liter Losung gelost sind, die haufigste Labor-Konzentrationseinheit.",
        "Da sie pro Liter Endlosung (nicht Losungsmittel) gilt, andert Verdunnung die Molaritat, wahrend die Stoffmenge gleich bleibt.",
      ],
      faq: [
        { q: "Mol vs molar, was ist der Unterschied?", a: "Ein Mol ist eine Stoffmenge; molar (M) ist diese Menge pro Liter Losung." },
        { q: "Wie mache ich eine Losung mit Ziel-M?", a: "Lose die benotigten Mol (Masse durch molare Masse) und fug dann Losungsmittel bis zum Endvolumen hinzu." },
        { q: "Warum zahlt Temperatur?", a: "Volumen andert sich leicht mit Temperatur, also ist Molaritat technisch temperaturabhangig; Molalitat nicht." },
      ],
    },
    ja: {
      steps: [
        "溶質のモル数と溶液体積（L）を入力します。",
        "ツールが許せばモル・ミリモルなど単位を切り替えます。",
        "モル毎リットル（M）単位の濃度を確認します。",
      ],
      explanationTitle: "モル濃度としての濃度",
      formula: "M = 溶質のモル数 / 溶液のリットル数",
      explanation: [
        "モル濃度は1Lの溶液に溶けている物質のモル数を示し、実験室で最も一般的な濃度単位です。",
        "最終溶液体積（溶媒ではなく）あたりなので、希釈でモル濃度は変わりますが溶質量は変わりません。",
      ],
      faq: [
        { q: "モルとモル濃度の違い？", a: "モルは物質量です。モル濃度（M）はそれを溶液のリットル数で割ったものです。" },
        { q: "目標Mの溶液の作り方？", a: "必要なモル数（質量÷モル質量）を溶かし、最終体積まで溶媒を加えます。" },
        { q: "温度はなぜ関係？", a: "体積は温度でわずかに変わるため、モル濃度は技術的に温度依存です。重モル濃度は非依存です。" },
      ],
    },
    es: {
      steps: [
        "Introduce los moles de soluto y el volumen de disolucion en litros.",
        "Ajusta unidades si la herramienta permite cambiar entre molar, milimolar, etc.",
        "Lee la concentracion en moles por litro, o M.",
      ],
      explanationTitle: "Concentracion como molaridad",
      formula: "M = moles de soluto / litros de disolucion",
      explanation: [
        "La molaridad cuenta cuantos moles de una sustancia estan disueltos en un litro de disolucion, la unidad de concentracion mas comun en lab.",
        "Como es por litro de disolucion final (no disolvente), la dilucion cambia la molaridad mientras la cantidad de soluto se mantiene.",
      ],
      faq: [
        { q: "Moles vs molar, cual es la diferencia?", a: "Un mol es una cantidad de sustancia; molar (M) es esa cantidad por litro de disolucion." },
        { q: "Como hago una disolucion de M objetivo?", a: "Disuelve los moles necesarios (masa entre masa molar) y anade disolvente hasta el volumen final." },
        { q: "Por que importa la temperatura?", a: "El volumen cambia levemente con la temperatura, asi la molaridad es tecnicamente dependiente; la molalidad no." },
      ],
    },
  },

  "dilution": {
    en: {
      steps: [
        "Enter the starting concentration and volume, and either the target concentration or target volume.",
        "Let the tool compute the missing value using the dilution relationship.",
        "Read how much solvent to add or what final volume to reach.",
      ],
      explanationTitle: "The dilution relationship",
      formula: "C1 x V1 = C2 x V2",
      explanation: [
        "Dilution keeps the amount of solute constant while adding solvent, so the product of concentration and volume stays equal before and after.",
        "It is the backbone of preparing standards and dosing liquids; always add solvent to reach the final volume, not just mix equal parts.",
      ],
      faq: [
        { q: "What does C1V1 = C2V2 mean?", a: "The moles of solute before equal the moles after; concentration drops as volume rises." },
        { q: "Do units need to match?", a: "Concentration units must match on both sides, and volume units must match; the ratio is what matters." },
        { q: "Can I dilute to any concentration?", a: "Yes mathematically, but practical limits include measurement precision and solubility." },
      ],
    },
    zh: {
      steps: [
        "输入初始浓度与体积，以及目标浓度或目标体积之一。",
        "让工具用稀释关系式算出缺失值。",
        "查看需加入多少溶剂，或应达到的最终体积。",
      ],
      explanationTitle: "稀释关系式",
      formula: "C1 × V1 = C2 × V2",
      explanation: [
        "稀释在加入溶剂的同时保持溶质量不变，因此浓度与体积的乘积在稀释前后相等。",
        "这是配制标准液和液体给药的基础；应加溶剂至最终体积，而非简单等比例混合。",
      ],
      faq: [
        { q: "C1V1 = C2V2 是什么意思？", a: "稀释前后溶质的摩尔数相等；体积增大时浓度下降。" },
        { q: "单位需要一致吗？", a: "两侧浓度单位必须一致，体积单位也必须一致；比例才是关键。" },
        { q: "可以稀释到任意浓度吗？", a: "数学上可以，但实际受测量精度与溶解度限制。" },
      ],
    },
    zhTW: {
      steps: [
        "輸入初始濃度與體積，以及目標濃度或目標體積之一。",
        "讓工具用稀釋關係式算出缺失值。",
        "查看需加入多少溶劑，或應達到的最終體積。",
      ],
      explanationTitle: "稀釋關係式",
      formula: "C1 × V1 = C2 × V2",
      explanation: [
        "稀釋在加入溶劑的同時保持溶質量不變，因此濃度與體積的乘積在稀釋前後相等。",
        "這是配製標準液和液體給藥的基礎；應加溶劑至最終體積，而非簡單等比例混合。",
      ],
      faq: [
        { q: "C1V1 = C2V2 是什麼意思？", a: "稀釋前後溶質的莫耳數相等；體積增大時濃度下降。" },
        { q: "單位需要一致嗎？", a: "兩側濃度單位必須一致，體積單位也必須一致；比例才是關鍵。" },
        { q: "可以稀釋到任意濃度嗎？", a: "數學上可以，但實際受測量精度與溶解度限制。" },
      ],
    },
    de: {
      steps: [
        "Gib Startkonzentration und Volumen ein sowie entweder Zielkonzentration oder Zielvolumen.",
        "Lass das Werkzeug den fehlenden Wert uber die Verdunnungsbeziehung berechnen.",
        "Lies, wie viel Losungsmittel zuzugeben oder welches Endvolumen zu erreichen ist.",
      ],
      explanationTitle: "Die Verdunnungsbeziehung",
      formula: "C1 x V1 = C2 x V2",
      explanation: [
        "Verdunnung halt die Stoffmenge konstant und fugt Losungsmittel hinzu, daher bleibt das Produkt aus Konzentration und Volumen vor und nachher gleich.",
        "Sie ist das Ruckgrat beim Ansetzen von Standards und Dosieren von Flussigkeiten; immer auf Endvolumen auffullen, nicht nur gleiche Teile mischen.",
      ],
      faq: [
        { q: "Was bedeutet C1V1 = C2V2?", a: "Die Mol des Soluts vorher gleichen denen nachher; Konzentration sinkt, wenn Volumen steigt." },
        { q: "Mussen Einheiten passen?", a: "Konzentrationseinheiten beidseits und Volumeneinheiten beidseits mussen passen; die Ratio zahlt." },
        { q: "Kann ich auf jede Konzentration verdunnen?", a: "Rechnerisch ja, praktisch grenzen Messgenauigkeit und Loslichkeit." },
      ],
    },
    ja: {
      steps: [
        "初期濃度と体積、および目標濃度か目標体積のいずれかを入力します。",
        "希釈の関係式で欠損値を計算させます。",
        "加えるべき溶媒量、または到達すべき最終体積を確認します。",
      ],
      explanationTitle: "希釈の関係式",
      formula: "C1 × V1 = C2 × V2",
      explanation: [
        "希釈は溶媒を加えつつ溶質量を一定に保つため、濃度と体積の積は前後で等しくなります。",
        "これは標準液や液体の用量調製の基礎です。単に同量混合するのではなく、最終体積まで溶媒を加えてください。",
      ],
      faq: [
        { q: "C1V1 = C2V2 の意味は？", a: "希釈前後の溶質のモル数が等しいこと。体積が増えると濃度は下がります。" },
        { q: "単位は一致させる必要？", a: "両辺の濃度単位、体積単位それぞれ一致させてください。比が重要です。" },
        { q: "任意の濃度に希釈できる？", a: "数学的には可能ですが、実際は測定精度と溶解度が限界です。" },
      ],
    },
    es: {
      steps: [
        "Introduce la concentracion y volumen iniciales, y una de las dos: concentracion o volumen objetivo.",
        "Deja que la herramienta calcule el valor faltante con la relacion de dilucion.",
        "Lee cuanto disolvente anadir o que volumen final alcanzar.",
      ],
      explanationTitle: "La relacion de dilucion",
      formula: "C1 x V1 = C2 x V2",
      explanation: [
        "La dilucion mantiene constante la cantidad de soluto mientras anade disolvente, asi el producto de concentracion y volumen se mantiene igual antes y despues.",
        "Es la base para preparar patrones y dosificar liquidos; siempre anade disolvente hasta el volumen final, no solo mezcles partes iguales.",
      ],
      faq: [
        { q: "Que significa C1V1 = C2V2?", a: "Los moles de soluto antes igualan los despues; la concentracion baja al subir el volumen." },
        { q: "Deben coincidir las unidades?", a: "Las unidades de concentracion a ambos lados y las de volumen a ambos lados deben coincidir; la razon es lo que cuenta." },
        { q: "Puedo diluir a cualquier concentracion?", a: "Matematicamente si, pero limites practicos incluyen precision de medida y solubilidad." },
      ],
    },
  },

  "stoichiometry": {
    en: {
      steps: [
        "Enter a balanced chemical equation and the amount of one reactant or product.",
        "Let the tool use mole ratios from the coefficients to find the others.",
        "Read the moles or mass of the substance you asked about.",
      ],
      explanationTitle: "Balancing amounts in reactions",
      formula: "Amount B = Amount A x (coefficient B / coefficient A)",
      explanation: [
        "Stoichiometry uses the coefficients of a balanced equation as mole ratios to predict how much product forms or reactant is needed.",
        "It assumes the reaction goes to completion with no side reactions, which real experiments only approximate.",
      ],
      faq: [
        { q: "Why must the equation be balanced?", a: "Conservation of mass requires equal atoms on both sides, and the coefficients give the mole ratios." },
        { q: "What is the limiting reactant?", a: "The reactant that runs out first, which caps how much product can form." },
        { q: "Does this predict actual yield?", a: "It gives the theoretical yield; real yield is lower due to losses and incomplete reaction." },
      ],
    },
    zh: {
      steps: [
        "输入配平的化学方程式，以及某反应物或生成物的量。",
        "让工具用系数给出的摩尔比求出其他物质。",
        "查看你所求物质的摩尔数或质量。",
      ],
      explanationTitle: "反应中的量的平衡",
      formula: "B 的量 = A 的量 × (B 的系数 / A 的系数)",
      explanation: [
        "化学计量学用配平方程式的系数作为摩尔比，预测生成多少产物或需要多少反应物。",
        "它假设反应完全进行、无副反应，而真实实验只是近似于此。",
      ],
      faq: [
        { q: "为什么方程必须配平？", a: "质量守恒要求两侧原子相等，而系数给出摩尔比。" },
        { q: "什么是限制反应物？", a: "最先耗尽的反应物，它决定了产物最多能生成多少。" },
        { q: "这能预测实际产率吗？", a: "它给出理论产率；实际产率因损耗与反应不完全而较低。" },
      ],
    },
    zhTW: {
      steps: [
        "輸入配平的化學方程式，以及某反應物或生成物的量。",
        "讓工具用係數給出的莫耳比求出其他物質。",
        "查看你所求物質的莫耳數或質量。",
      ],
      explanationTitle: "反應中的量的平衡",
      formula: "B 的量 = A 的量 × (B 的係數 / A 的係數)",
      explanation: [
        "化學計量學用配平方程式的係數作為莫耳比，預測生成多少產物或需要多少反應物。",
        "它假設反應完全進行、無副反應，而真實實驗只是近似於此。",
      ],
      faq: [
        { q: "為什麼方程必須配平？", a: "質量守恆要求兩側原子相等，而係數給出莫耳比。" },
        { q: "什麼是限制反應物？", a: "最先耗盡的反應物，它決定了產物最多能生成多少。" },
        { q: "這能預測實際產率嗎？", a: "它給出理論產率；實際產率因損耗與反應不完全而較低。" },
      ],
    },
    de: {
      steps: [
        "Gib eine ausgeglichene Reaktionsgleichung und die Menge eines Reaktanten oder Produkts ein.",
        "Lass das Werkzeug die Stoffmengenverhaltnisse aus den Koeffizienten nutzen.",
        "Lies die Mol oder Masse der gewunschten Substanz.",
      ],
      explanationTitle: "Mengen in Reaktionen ausgleichen",
      formula: "Menge B = Menge A x (Koeffizient B / Koeffizient A)",
      explanation: [
        "Stochiometrie nutzt die Koeffizienten einer ausgeglichenen Gleichung als Stoffmengenverhaltnisse, um Produktmengen oder Reaktantenbedarf zu prognostizieren.",
        "Sie nimmt vollstandigen Umsatz ohne Nebenreaktionen an, was reale Experimente nur naherungsweise erreichen.",
      ],
      faq: [
        { q: "Warum muss die Gleichung ausgeglichen sein?", a: "Massenerhalt braucht gleiche Atome beidseits, und die Koeffizienten liefern die Stoffmengenverhaltnisse." },
        { q: "Was ist der limitierende Reaktant?", a: "Der Reaktant, der zuerst aufgebraucht ist und damit die max. Produktmenge deckelt." },
        { q: "Sagt das die reale Ausbeute voraus?", a: "Es gibt die theoretische Ausbeute; die reale ist durch Verluste und unvollstandige Reaktion niedriger." },
      ],
    },
    ja: {
      steps: [
        "係数平衡した化学反応式と、ある反応物または生成物の量を入力します。",
        "係数からのモル比を使って他の物質を求めさせます。",
        "求めた物質のモル数または質量を確認します。",
      ],
      explanationTitle: "反応における量のつり合い",
      formula: "B の量 = A の量 × (B の係数 / A の係数)",
      explanation: [
        "化学量論は係数平衡した式の係数をモル比として使い、生成する生成物や必要な反応物を予測します。",
        "反応が完結し副反応がないことを前提としますが、実験は近似に過ぎません。",
      ],
      faq: [
        { q: "なぜ式を平衡させる必要？", a: "質量保存のため両辺の原子が等しく必要で、係数がモル比を与えます。" },
        { q: "限制反応物とは？", a: "最初に尽きる反応物で、生成できる生成物の上限を決めます。" },
        { q: "実際の収率を予測する？", a: "理論収率を与えます。実際は損失や不完全反応で低くなります。" },
      ],
    },
    es: {
      steps: [
        "Introduce una ecuacion quimica balanceada y la cantidad de un reactivo o producto.",
        "Deja que la herramienta use las razones molares de los coeficientes para hallar los demas.",
        "Lee los moles o la masa de la sustancia que pediste.",
      ],
      explanationTitle: "Equilibrar cantidades en reacciones",
      formula: "Cantidad B = Cantidad A x (coeficiente B / coeficiente A)",
      explanation: [
        "La estequiometria usa los coeficientes de una ecuacion balanceada como razones molares para predecir cuanto producto se forma o reactivo se necesita.",
        "Asume reaccion completa sin secundarias, lo que los experimentos reales solo aproximan.",
      ],
      faq: [
        { q: "Por que la ecuacion debe estar balanceada?", a: "La conservacion de masa exige atomos iguales a ambos lados, y los coeficientes dan las razones molares." },
        { q: "Que es el reactivo limitante?", a: "El reactivo que se agota primero, que capa cuanto producto puede formarse." },
        { q: "Esto predice el rendimiento real?", a: "Da el rendimiento teorico; el real es menor por perdidas y reaccion incompleta." },
      ],
    },
  },

  "ph-calculator": {
    en: {
      steps: [
        "Enter the hydrogen ion concentration, or the acid and its concentration.",
        "Choose whether to compute pH, pOH, or convert between them.",
        "Read the pH and what it implies about acidity or basicity.",
      ],
      explanationTitle: "The pH scale",
      formula: "pH = -log10[H+]; pOH = 14 - pH (at 25 C)",
      explanation: [
        "pH is the negative base-10 logarithm of hydrogen ion concentration, so each unit is a tenfold change in acidity.",
        "A pH below 7 is acidic, 7 neutral, above 7 basic; the scale is temperature dependent and the 0 to 14 range is typical for water-based solutions.",
      ],
      faq: [
        { q: "Why is pH logarithmic?", a: "Because ion concentrations span many orders of magnitude, a log scale keeps them on a handy 0 to 14 range." },
        { q: "Is 7 always neutral?", a: "Neutral is where pH equals pOH; at 25 C that is 7, but the neutral point shifts with temperature." },
        { q: "Can pH be negative?", a: "Yes, very concentrated strong acids can have pH below 0, though that is unusual in everyday contexts." },
      ],
    },
    zh: {
      steps: [
        "输入氢离子浓度，或输入酸及其浓度。",
        "选择计算 pH、pOH，还是两者互转。",
        "查看 pH 值，以及它代表的酸性或碱性含义。",
      ],
      explanationTitle: "pH 标度",
      formula: "pH = -log10[H+]；pOH = 14 - pH（25°C）",
      explanation: [
        "pH 是氢离子浓度的负常用对数，因此每差一个单位，酸度相差十倍。",
        "pH 低于 7 为酸性、7 为中性、高于 7 为碱性；该标度依赖温度，0 至 14 是水溶液的典型范围。",
      ],
      faq: [
        { q: "为什么 pH 是对数？", a: "因为离子浓度跨越多个数量级，对数标度能把它压缩到方便的 0 至 14 范围。" },
        { q: "7 总是中性吗？", a: "中性指 pH 等于 pOH；在 25°C 时为 7，但中性点会随温度偏移。" },
        { q: "pH 可以为负吗？", a: "可以，极浓的强酸 pH 可低于 0，不过日常中少见。" },
      ],
    },
    zhTW: {
      steps: [
        "輸入氫離子濃度，或輸入酸及其濃度。",
        "選擇計算 pH、pOH，還是兩者互轉。",
        "查看 pH 值，以及它代表的酸性或鹼性含義。",
      ],
      explanationTitle: "pH 標度",
      formula: "pH = -log10[H+]；pOH = 14 - pH（25°C）",
      explanation: [
        "pH 是氫離子濃度的負常用對數，因此每差一個單位，酸度相差十倍。",
        "pH 低於 7 為酸性、7 為中性、高於 7 為鹼性；該標度依賴溫度，0 至 14 是水溶液的典型範圍。",
      ],
      faq: [
        { q: "為什麼 pH 是對數？", a: "因為離子濃度跨越多個數量級，對數標度能把它壓縮到方便的 0 至 14 範圍。" },
        { q: "7 總是中性嗎？", a: "中性指 pH 等於 pOH；在 25°C 時為 7，但中性點會隨溫度偏移。" },
        { q: "pH 可以為負嗎？", a: "可以，極濃的強酸 pH 可低於 0，不過日常中少見。" },
      ],
    },
    de: {
      steps: [
        "Gib die Wasserstoffionenkonzentration ein oder die Saure und ihre Konzentration.",
        "Wahle, ob pH, pOH oder die Umrechnung berechnet wird.",
        "Lies den pH und was er uber Saure oder Base aussagt.",
      ],
      explanationTitle: "Die pH-Skala",
      formula: "pH = -log10[H+]; pOH = 14 - pH (bei 25 C)",
      explanation: [
        "pH ist der negative Zehnerlogarithmus der Wasserstoffionenkonzentration, daher ist jede Einheit eine zehnfache Anderung der Saure.",
        "pH unter 7 ist sauer, 7 neutral, uber 7 basisch; die Skala hangt von der Temperatur ab, der Bereich 0 bis 14 ist typisch fur wassrige Losungen.",
      ],
      faq: [
        { q: "Warum ist pH logarithmisch?", a: "Da Ionenkonzentrationen viele Grossenordnungen spannen, halt eine Logskala sie im handlichen Bereich 0 bis 14." },
        { q: "Ist 7 immer neutral?", a: "Neutral ist, wo pH gleich pOH ist; bei 25 C ist das 7, der Neutralpunkt verschiebt sich mit Temperatur." },
        { q: "Kann pH negativ sein?", a: "Ja, sehr konzentrierte starke Sauren konnen pH unter 0 haben, was im Alltag selten ist." },
      ],
    },
    ja: {
      steps: [
        "水素イオン濃度、または酸とその濃度を入力します。",
        "pH、pOH、あるいは両者の変換のいずれを計算するか選びます。",
        "pH と、それが示す酸性・塩基性の意味を確認します。",
      ],
      explanationTitle: "pH スケール",
      formula: "pH = -log10[H+]；pOH = 14 - pH（25°C）",
      explanation: [
        "pH は水素イオン濃度の負の常用対数です。したがって1単位の違いは酸度の10倍の変化です。",
        "pH 7未満は酸性、7は中性、7より上は塩基性です。この目盛りは温度依存で、0〜14は水性溶液の典型的範囲です。",
      ],
      faq: [
        { q: "なぜpHは対数？", a: "イオン濃度は多くの桁にわたるため、対数目盛りで0〜14の扱いやすい範囲に収まるからです。" },
        { q: "7はいつも中性？", a: "中性はpH = pOHの点です。25°Cでは7ですが、中性点は温度でずれます。" },
        { q: "pHは負になれる？", a: "はい。極めて濃い強酸はpHが0未満になり得ますが、日常ではまれです。" },
      ],
    },
    es: {
      steps: [
        "Introduce la concentracion de iones hidrogeno, o el acido y su concentracion.",
        "Elige si calculas pH, pOH o la conversion entre ambos.",
        "Lee el pH y lo que implica sobre acidez o basicidad.",
      ],
      explanationTitle: "La escala de pH",
      formula: "pH = -log10[H+]; pOH = 14 - pH (a 25 C)",
      explanation: [
        "El pH es el logaritmo en base 10 negativo de la concentracion de iones hidrogeno, asi cada unidad es un cambio de diez veces en acidez.",
        "pH bajo 7 es acido, 7 neutral, sobre 7 basico; la escala depende de la temperatura y el rango 0 a 14 es tipico en disoluciones acuosas.",
      ],
      faq: [
        { q: "Por que el pH es logaritmico?", a: "Como las concentraciones de iones abarcan muchos ordenes de magnitud, una escala log las mantiene en un maneable 0 a 14." },
        { q: "Es 7 siempre neutral?", a: "Neutral es donde pH iguala pOH; a 25 C eso es 7, pero el punto neutral se desplaza con la temperatura." },
        { q: "Puede ser negativo el pH?", a: "Si, acidos fuertes muy concentrados pueden tener pH bajo 0, aunque es raro en la vida diaria." },
      ],
    },
  },

  "periodic-table": {
    en: {
      steps: [
        "Enter an element symbol or atomic number to look it up.",
        "Browse or filter by group, period, or category if offered.",
        "Read properties such as atomic mass, group, and classification.",
      ],
      explanationTitle: "The periodic table at a glance",
      formula: "Organised by increasing atomic number and electron shells",
      explanation: [
        "The table arranges elements by atomic number; rows are periods and columns are groups with similar chemistry.",
        "Position predicts behaviour: metals, nonmetals, and noble gases cluster in regions, making trends like electronegativity easy to read.",
      ],
      faq: [
        { q: "What does the atomic number mean?", a: "It is the count of protons in the nucleus and uniquely identifies each element." },
        { q: "Why are some elements grouped?", a: "Elements in the same column share valence-electron patterns, so they react in similar ways." },
        { q: "What are the blocks?", a: "s, p, d, and f blocks reflect which subshell is being filled, linking position to electron structure." },
      ],
    },
    zh: {
      steps: [
        "输入元素符号或原子序数进行查询。",
        "若提供，可按族、周期或类别浏览或筛选。",
        "查看原子质量、族别和分类等属性。",
      ],
      explanationTitle: "一图看懂元素周期表",
      formula: "按原子序数递增与电子层排布组织",
      explanation: [
        "周期表按原子序数排列元素；横行为周期，纵列为具有相似化学性质的族。",
        "位置预示性质：金属、非金属和稀有气体各有聚集区域，使得电负性等趋势一目了然。",
      ],
      faq: [
        { q: "原子序数代表什么？", a: "它是原子核中的质子数，唯一确定每种元素。" },
        { q: "为什么有些元素被归在一起？", a: "同一列的元素共享价电子排布模式，因此反应方式相似。" },
        { q: "什么是区块？", a: "s、p、d、f 区块反映正在填充的亚层，将位置与电子结构联系起来。" },
      ],
    },
    zhTW: {
      steps: [
        "輸入元素符號或原子序數進行查詢。",
        "若提供，可按族、週期或類別瀏覽或篩選。",
        "查看原子質量、族別和分類等屬性。",
      ],
      explanationTitle: "一圖看懂元素週期表",
      formula: "按原子序數遞增與電子層排佈組織",
      explanation: [
        "週期表按原子序數排列元素；橫行為週期，縱列為具有相似化學性質的族。",
        "位置預示性質：金屬、非金屬和稀有氣體各有聚集區域，使得電負性等趨勢一目瞭然。",
      ],
      faq: [
        { q: "原子序數代表什麼？", a: "它是原子核中的質子數，唯一確定每種元素。" },
        { q: "為什麼有些元素被歸在一起？", a: "同一列的元素共享價電子排佈模式，因此反應方式相似。" },
        { q: "什麼是區塊？", a: "s、p、d、f 區塊反映正在填充的亞層，將位置與電子結構聯繫起來。" },
      ],
    },
    de: {
      steps: [
        "Gib ein ElementSymbol oder die Ordnungszahl ein, um es zu suchen.",
        "Durchsuche oder filter nach Gruppe, Periode oder Kategorie, falls angeboten.",
        "Lies Eigenschaften wie Atommasse, Gruppe und Klassifikation.",
      ],
      explanationTitle: "Das Periodensystem auf einen Blick",
      formula: "Geordnet nach steigender Ordnungszahl und Elektronenschalen",
      explanation: [
        "Die Tabelle ordnet Elemente nach Ordnungszahl; Zeilen sind Perioden, Spalten Gruppen mit ahnlicher Chemie.",
        "Die Position sagt Verhalten voraus: Metalle, Nichtmetalle und Edelgase clustern in Regionen, sodass Trends wie Elektronegativitat leicht lesbar sind.",
      ],
      faq: [
        { q: "Was bedeutet die Ordnungszahl?", a: "Sie ist die Zahl der Protonen im Kern und identifiziert jedes Element eindeutig." },
        { q: "Warum sind manche Elemente gruppiert?", a: "Elemente in derselben Spalte teilen Valenzelektronen-Muster, also reagieren sie ahnlich." },
        { q: "Was sind die Blocke?", a: "s-, p-, d- und f-Blocke spiegeln das gefullte Unterschalen-Niveau und verknupfen Position mit Elektronenstruktur." },
      ],
    },
    ja: {
      steps: [
        "元素記号または原子番号を入力して検索します。",
        "可能なら族・周期・分類で閲覧や絞り込みができます。",
        "原子質量・族・分類などの属性を確認します。",
      ],
      explanationTitle: "元素周期表をひと目で",
      formula: "原子番号の増加と電子殻配置で整理",
      explanation: [
        "周期表は元素を原子番号順に配置します。横が周期、縦が類似の化学性質を持つ族です。",
        "位置で性質が予測できます。金属・非金属・希ガスは領域ごとに集まり、電気陰性度などの傾向が読みやすくなります。",
      ],
      faq: [
        { q: "原子番号は何を意味？", a: "原子核の陽子数で、各元素を一意に識別します。" },
        { q: "なぜ元素がまとめられる？", a: "同じ縦列の元素は価電子のパターンを共有するため、似た反応をします。" },
        { q: "ブロックとは？", a: "s・p・d・f ブロックは埋まっている副殻層を示し、位置と電子構造を結びつけます。" },
      ],
    },
    es: {
      steps: [
        "Introduce un simbolo elemental o numero atomico para buscarlo.",
        "Explora o filtra por grupo, periodo o categoria si se ofrece.",
        "Lee propiedades como masa atomica, grupo y clasificacion.",
      ],
      explanationTitle: "La tabla periodica de un vistazo",
      formula: "Organizada por numero atomico creciente y capas electronicas",
      explanation: [
        "La tabla ordena los elementos por numero atomico; las filas son periodos y las columnas grupos con quimica similar.",
        "La posicion predice el comportamiento: metales, no metales y gases nobles se agrupan en regiones, haciendo tendencias como electronegatividad faciles de leer.",
      ],
      faq: [
        { q: "Que significa el numero atomico?", a: "Es el conteo de protones en el nucleo y identifica univocamente cada elemento." },
        { q: "Por que algunos elementos estan agrupados?", a: "Los elementos de la misma columna comparten patrones de electrones de valencia, asi reaccionan igual." },
        { q: "Que son los bloques?", a: "Los bloques s, p, d y f reflejan que subcapa se llena, ligando posicion y estructura electronica." },
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
