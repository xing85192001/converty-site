// 第七批 A 层深度文案注入：11 个金融长尾 + 工程 + 物理工具 × 6 语言
import fs from "fs";

const LANGS = ["en", "zh", "zh-TW", "de", "ja", "es"];
const FILE = (l) => `./src/messages/${l}.json`;

const DATA = {
  "ira-calculator": {
    en: {
      steps: [
        "Select whether you want to compare Traditional IRA, Roth IRA, or both.",
        "Enter your current age, planned retirement age, annual contribution, and expected rate of return.",
        "Review the estimated after-tax balance and compare which account may leave you with more spendable money.",
      ],
      explanationTitle: "Traditional IRA vs Roth IRA",
      formula: "Future value = contribution × (((1 + r)^n - 1) / r) × (1 - tax_rate_or_0)",
      explanation: [
        "A Traditional IRA gives you a tax deduction today, but withdrawals in retirement are taxed as ordinary income.",
        "A Roth IRA uses after-tax dollars, so qualified withdrawals in retirement are usually tax-free.",
        "The better choice depends on whether your current tax rate is higher or lower than the rate you expect in retirement.",
      ],
      faq: [
        { q: "Can I contribute to both a Traditional and Roth IRA?", a: "Yes, but your combined annual contribution cannot exceed the IRS limit for your filing status and income." },
        { q: "Are IRA withdrawals always penalty-free after age 59½?", a: "Traditional withdrawals are taxed; Roth qualified withdrawals are tax-free. Non-qualified withdrawals may trigger taxes and penalties." },
        { q: "Does the calculator include required minimum distributions?", a: "No; it is a simplified projection. Use detailed planning software or a tax advisor for RMD and complex scenarios." },
      ],
    },
    zh: {
      steps: [
        "选择你想比较的类型：传统 IRA、Roth IRA，或两者一起比较。",
        "输入当前年龄、计划退休年龄、每年投入金额和预期年化收益率。",
        "查看估算的税后总额，并比较哪种账户可能让你在退休时拥有更多可支配资金。",
      ],
      explanationTitle: "传统 IRA 与 Roth IRA 对比",
      formula: "未来价值 = 年投入 × (((1 + r)^n - 1) / r) × (1 - 税率或 0)",
      explanation: [
        "传统 IRA 可让你现在获得税收抵扣，但退休时取出需按普通收入缴税。",
        "Roth IRA 使用税后资金，符合条件的退休取出通常免税。",
        "选择哪种更好，取决于你现在的税率与预期退休时税率的高低对比。",
      ],
      faq: [
        { q: "我可以同时向传统 IRA 和 Roth IRA 供款吗？", a: "可以，但合计年供款不能超过 IRS 针对你的申报状态和收入设定的上限。" },
        { q: "59½ 岁后取出 IRA 一定没有罚金吗？", a: "传统 IRA 取出仍需缴税；Roth IRA 符合条件时免税。非合规取出可能触发税款和罚金。" },
        { q: "计算器是否包含强制最低取款额（RMD）？", a: "不包含；这只是简化预测。涉及 RMD 或复杂情形时，应使用专业规划工具或咨询税务顾问。" },
      ],
    },
    zhTW: {
      steps: [
        "選擇你想比較的類型：傳統 IRA、Roth IRA，或兩者一起比較。",
        "輸入目前年齡、計劃退休年齡、每年投入金額和預期年化報酬率。",
        "查看估算的稅後總額，並比較哪種帳戶可能讓你在退休時擁有更多可支配資金。",
      ],
      explanationTitle: "傳統 IRA 與 Roth IRA 對比",
      formula: "未來價值 = 年投入 × (((1 + r)^n - 1) / r) × (1 - 稅率或 0)",
      explanation: [
        "傳統 IRA 可讓你現在獲得稅收抵扣，但退休時取出需按普通收入繳稅。",
        "Roth IRA 使用稅後資金，符合條件的退休取出通常免稅。",
        "選擇哪種更好，取決於你現在的稅率與預期退休時稅率的高低對比。",
      ],
      faq: [
        { q: "我可以同時向傳統 IRA 和 Roth IRA 供款嗎？", a: "可以，但合計年供款不能超過 IRS 針對你的申報狀態和收入設定的上限。" },
        { q: "59½ 歲後取出 IRA 一定沒有罰金嗎？", a: "傳統 IRA 取出仍需繳稅；Roth IRA 符合條件時免稅。非合規取出可能觸發稅款和罰金。" },
        { q: "計算器是否包含強制最低取款額（RMD）？", a: "不包含；這只是簡化預測。涉及 RMD 或複雜情形時，應使用專業規劃工具或諮詢稅務顧問。" },
      ],
    },
    de: {
      steps: [
        "Wahle, ob du Traditional IRA, Roth IRA oder beide vergleichen mochtest.",
        "Gib dein aktuelles Alter, geplantes Rentenalter, jahrliche Einzahlung und erwartete Rendite ein.",
        "Vergleiche den geschatzten steuerbereinigten Endbetrag und prufe, welches Konto mehr verfugbares Geld liefert.",
      ],
      explanationTitle: "Traditional IRA vs. Roth IRA",
      formula: "Zukunftswert = Einzahlung × (((1 + r)^n - 1) / r) × (1 - Steuersatz_oder_0)",
      explanation: [
        "Eine Traditional IRA gewahrt heute einen Steuerabzug, aber Auszahlungen im Ruhestand werden als normales Einkommen besteuert.",
        "Eine Roth IRA nutzt versteuerte Euros, daher sind qualifizierte Auszahlungen im Ruhestand in der Regel steuerfrei.",
        "Die bessere Wahl hangt davon ab, ob dein aktueller Steuersatz hoher oder niedriger als der erwartete Steuersatz im Ruhestand ist.",
      ],
      faq: [
        { q: "Kann ich gleichzeitig in Traditional und Roth IRA einzahlen?", a: "Ja, aber die Summe darf das jahrliche IRS-Limit fur deinen Status und Einkommen nicht uberschreiten." },
        { q: "Sind Auszahlungen nach 59½ immer straffrei?", a: "Traditional-Auszahlungen werden versteuert; qualifizierte Roth-Auszahlungen sind steuerfrei. Nicht qualifizierte Auszahlungen konnen Steuern und Strafen auslosen." },
        { q: "Sind Required Minimum Distributions enthalten?", a: "Nein; es ist eine vereinfachte Projektion. RMD und komplexe Szenarien gehoren in eine detaillierte Steuerplanung." },
      ],
    },
    ja: {
      steps: [
        "比較したいタイプを選択します：Traditional IRA、Roth IRA、または両方です。",
        "現在の年齢、想定退職年齢、年間拠出額、想定利回りを入力します。",
        "推定税引き後残高を確認し、どちらの口座がより多くの使える資金を残すか比較します。",
      ],
      explanationTitle: "Traditional IRA と Roth IRA の比較",
      formula: "将来価値 = 年間拠出 × (((1 + r)^n - 1) / r) × (1 - 税率または 0)",
      explanation: [
        "Traditional IRA は現在の税金控除を受けられますが、退職後の引き出しは通常の所得として課税されます。",
        "Roth IRA は税引き後の資金を使うため、条件を満たした退職後の引き出しは通常非課税です。",
        "どちらが有利かは、現在の税率と退職後の想定税率を比較して判断します。",
      ],
      faq: [
        { q: "Traditional IRA と Roth IRA の両方に拠出できますか？", a: "可能ですが、合計年間拠出額は IRS が定める申告状態・所得別の上限を超えられません。" },
        { q: "59½ 歳以降の引出しは必ずペナルティなしですか？", a: "Traditional IRA は課税対象です。Roth IRA は条件付きで非課税です。条件を満たさない引出しには税・ペナルティがかかる場合があります。" },
        { q: "必要最低限取り崩し（RMD）は含まれますか？", a: "含まれません；これは簡易シミュレーションです。RMD や複雑なケースは専門家に相談してください。" },
      ],
    },
    es: {
      steps: [
        "Selecciona si quieres comparar IRA tradicional, Roth IRA o ambas.",
        "Ingresa tu edad actual, edad de retiro planificada, contribucion anual y rendimiento esperado.",
        "Revisa el saldo estimado despues de impuestos y compara cual cuenta puede dejarte mas dinero disponible.",
      ],
      explanationTitle: "IRA tradicional vs Roth IRA",
      formula: "Valor futuro = aporte × (((1 + r)^n - 1) / r) × (1 - tasa_impuestos_o_0)",
      explanation: [
        "La IRA tradicional te da una deduccion fiscal hoy, pero los retiros en el retiro se gravan como ingreso ordinario.",
        "La Roth IRA usa dolares despues de impuestos, por lo que los retiros calificados suelen ser libres de impuestos.",
        "La mejor opcion depende de si tu tasa actual es mayor o menor que la tasa esperada en el retiro.",
      ],
      faq: [
        { q: "Puedo contribuir a una IRA tradicional y una Roth IRA?", a: "Si, pero tu aporte anual combinado no puede superar el limite del IRS segun tu estado civil e ingresos." },
        { q: "Los retiros despues de los 59½ siempre son libres de penalizacion?", a: "Los retiros tradicionales se gravan; los Roth calificados son libres de impuestos. Los retiros no calificados pueden generar impuestos y penalizaciones." },
        { q: "El calculador incluye distribuciones minimas requeridas?", a: "No; es una proyeccion simplificada. Consulta a un asesor fiscal para RMD y escenarios complejos." },
      ],
    },
  },
  "bond-calculator": {
    en: {
      steps: [
        "Enter the bond face value, coupon rate, years to maturity, and current market price.",
        "Add the payment frequency and any call or tax assumptions if applicable.",
        "Review the yield to maturity, current yield, and estimated total return.",
      ],
      explanationTitle: "How bond yields work",
      formula: "Approx YTM = (annual coupon + (face - price) / years) / ((face + price) / 2)",
      explanation: [
        "The coupon rate tells you the annual interest payment as a percentage of face value.",
        "Yield to maturity reflects the total return if you hold the bond until it matures, including price changes and reinvested coupons.",
        "When market interest rates rise, existing bond prices usually fall, and vice versa.",
      ],
      faq: [
        { q: "What is the difference between coupon and yield?", a: "Coupon is the fixed interest payment; yield is the effective return based on the price you actually paid." },
        { q: "Why does the bond price move opposite to interest rates?", a: "New bonds pay the market rate, so an older bond with a lower coupon must trade at a discount to compete." },
        { q: "Is this calculator suitable for zero-coupon bonds?", a: "It works best for coupon bonds; zero-coupon bonds need a different reinvestment assumption." },
      ],
    },
    zh: {
      steps: [
        "输入债券面值、票面利率、剩余年限和当前市场价格。",
        "如有需要，补充付息频率、赎回条款或税收假设。",
        "查看到期收益率、当前收益率和估算总回报。",
      ],
      explanationTitle: "债券收益率如何计算",
      formula: "近似到期收益率 = (年票息 + (面值 - 价格) / 年限) / ((面值 + 价格) / 2)",
      explanation: [
        "票面利率表示每年票息占面值的百分比。",
        "到期收益率反映持有到期时的总回报，包含价格变动和再投资票息的影响。",
        "当市场利率上升时，已发行债券的价格通常会下跌，反之亦然。",
      ],
      faq: [
        { q: "票息和收益率有什么区别？", a: "票息是固定的利息支付；收益率是基于你实际买入价格计算的有效回报。" },
        { q: "为什么债券价格与市场利率反向变动？", a: "新发行债券按市场利率付息，因此老债券的低票息必须通过折价交易才有竞争力。" },
        { q: "这个计算器适合零息债券吗？", a: "最适合附息债券；零息债券需要不同的再投资假设。" },
      ],
    },
    zhTW: {
      steps: [
        "輸入債券面值、票面利率、剩餘年限和目前市場價格。",
        "如有需要，補充付息頻率、贖回條款或稅收假設。",
        "查看到期收益率、目前收益率和估算總報酬。",
      ],
      explanationTitle: "債券收益率如何計算",
      formula: "近似到期收益率 = (年票息 + (面值 - 價格) / 年限) / ((面值 + 價格) / 2)",
      explanation: [
        "票面利率表示每年票息占面值的百分比。",
        "到期收益率反映持有到期時的總報酬，包含價格變動和再投資票息的影響。",
        "當市場利率上升時，已發行債券的價格通常會下跌，反之亦然。",
      ],
      faq: [
        { q: "票息和收益率有什麼區別？", a: "票息是固定的利息支付；收益率是基於你實際買入價格計算的有效報酬。" },
        { q: "為什麼債券價格與市場利率反向變動？", a: "新發行債券按市場利率付息，因此老債券的低票息必須透過折價交易才有競爭力。" },
        { q: "這個計算器適合零息債券嗎？", a: "最適合附息債券；零息債券需要不同的再投資假設。" },
      ],
    },
    de: {
      steps: [
        "Gib Nennwert, Kuponsatz, Restlaufzeit und aktuellen Marktpreis der Anleihe ein.",
        "Ergänze Zinszahlungshaufigkeit, Tilgungsannahmen und Steuerannahmen falls zutreffend.",
        "Prufe Rendite bis zur Falligkeit, aktuelle Rendite und geschatzte Gesamtrendite.",
      ],
      explanationTitle: "Wie Anleiherenditen funktionieren",
      formula: "Naherungsweise YTM = (jahrlicher Kupon + (Nennwert - Preis) / Jahre) / ((Nennwert + Preis) / 2)",
      explanation: [
        "Der Kuponsatz zeigt die jahrliche Zinszahlung als Prozentsatz des Nennwerts.",
        "Die Yield-to-Maturity spiegelt die Gesamtrendite bis zur Falligkeit wider, inklusive Kursveranderungen und wiederanlegten Kupons.",
        "Steigen Marktzinsen, sinken Kurse bestehender Anleihen, und umgekehrt.",
      ],
      faq: [
        { q: "Was ist der Unterschied zwischen Kupon und Rendite?", a: "Der Kupon ist die feste Zinszahlung; die Rendite ist die effektive Verzinsung basierend auf dem tatsachlichen Kaufpreis." },
        { q: "Warum bewegen sich Anleihekurse entgegengesetzt zu Zinsen?", a: "Neue Anleihen zahlen den Marktzins, daher muss eine altere Anleihe mit niedrigerem Kupon mit Abschlag gehandelt werden." },
        { q: "Ist der Rechner fur Nullkupon-Anleihen geeignet?", a: "Er eignet sich am besten fur Kuponanleihen; Nullkupon-Anleihen benotigen eine andere Wiederanlageannahme." },
      ],
    },
    ja: {
      steps: [
        "債券の額面、クーポン利率、残存年数、現在の市場価格を入力します。",
        "必要に応じて、利払い頻度、償還条項、税制を追加します。",
        "満期利回り、現在利回り、推定トータルリターンを確認します。",
      ],
      explanationTitle: "債券利回りの仕組み",
      formula: "近似 YTM = (年間クーポン + (額面 - 価格) / 年数) / ((額面 + 価格) / 2)",
      explanation: [
        "クーポン利率は、額面に対する年間利息支払額の割合を示します。",
        "満期利回り（YTM）は、満期保有時の総合的なリターンを価格変動と再投資を含めて反映します。",
        "市場金利が上昇すると、既存債券の価格は通常下落し、その逆も同様です。",
      ],
      faq: [
        { q: "クーポンと利回りの違いは何ですか？", a: "クーポンは固定利息です。利回りは実際の購入価格に基づく実効的なリターンです。" },
        { q: "なぜ債券価格は金利と逆方向に動くのですか？", a: "新規債券は市場金利を支払うため、低いクーポンの既存債券はディスカウントで取引される必要があります。" },
        { q: "ゼロクーポン債券にも使えますか？", a: "クーポン付き債券向けの簡易計算です。ゼロクーポン債は別の再投資仮定が必要です。" },
      ],
    },
    es: {
      steps: [
        "Ingresa el valor nominal, tasa cupon, anos al vencimiento y precio de mercado actual del bono.",
        "Agrega la frecuencia de pago y supuestos de impuestos o rescate si aplica.",
        "Revisa el rendimiento al vencimiento, rendimiento actual y retorno total estimado.",
      ],
      explanationTitle: "Como funcionan los rendimientos de bonos",
      formula: "YTM aproximada = (cupon anual + (nominal - precio) / anos) / ((nominal + precio) / 2)",
      explanation: [
        "La tasa cupon indica el pago de interes anual como porcentaje del valor nominal.",
        "El rendimiento al vencimiento refleja el retorno total si mantienes el bono hasta su vencimiento, incluyendo cambios de precio y cupones reinvertidos.",
        "Cuando las tasas de interes del mercado suben, los precios de los bonos existentes suelen caer, y viceversa.",
      ],
      faq: [
        { q: "Cual es la diferencia entre cupon y rendimiento?", a: "El cupon es el pago de interes fijo; el rendimiento es el retorno efectivo basado en el precio que realmente pagaste." },
        { q: "Por que el precio del bono se mueve en contra de las tasas de interes?", a: "Los bonos nuevos pagan la tasa de mercado, por lo que un bono viejo con cupon mas bajo debe cotizar con descuento para competir." },
        { q: "Es adecuado para bonos cupon cero?", a: "Funciona mejor para bonos con cupon; los cupon cero requieren un supuesto diferente de reinversion." },
      ],
    },
  },
  "annuity-calculator": {
    en: {
      steps: [
        "Choose the annuity type: ordinary annuity (payments at end of period) or annuity due (payments at beginning).",
        "Enter the periodic payment, annual interest rate, number of periods, and starting principal if any.",
        "Review the future value, present value, and total interest earned.",
      ],
      explanationTitle: "Ordinary annuity vs annuity due",
      formula: "FV ordinary = PMT × (((1 + r)^n - 1) / r); FV due = FV ordinary × (1 + r)",
      explanation: [
        "An ordinary annuity assumes each payment occurs at the end of a period, like a typical loan payment.",
        "An annuity due assumes payments at the start of each period, which earns one extra period of interest.",
        "The same payment stream is worth more in an annuity due because each cash flow is invested sooner.",
      ],
      faq: [
        { q: "What is a real-world example of an annuity due?", a: "Apartment rent and gym memberships are common examples because payment is due at the beginning of each month." },
        { q: "Can I use this for retirement income planning?", a: "Yes; it gives a first-order estimate for structured payouts, though real products may include fees and riders." },
        { q: "Does the calculator handle inflation?", a: "No; the rate entered is nominal. For real value, subtract expected inflation from the rate." },
      ],
    },
    zh: {
      steps: [
        "选择年金类型：普通年金（期末支付）或预付年金（期初支付）。",
        "输入每期支付金额、年利率、期数，以及若有的话期初本金。",
        "查看未来价值、现值和赚取的总利息。",
      ],
      explanationTitle: "普通年金与预付年金",
      formula: "普通年金 FV = PMT × (((1 + r)^n - 1) / r)；预付年金 FV = 普通年金 FV × (1 + r)",
      explanation: [
        "普通年金假设每期支付发生在期末，例如典型的贷款还款。",
        "预付年金假设每期支付发生在期初，因此每笔现金流多赚一期利息。",
        "同样的支付流，预付年金价值更高，因为每笔现金更早投入计息。",
      ],
      faq: [
        { q: "预付年金的现实例子是什么？", a: "房租和健身房会员费很常见，因为它们通常要求在月初开始前支付。" },
        { q: "可以用于退休收入规划吗？", a: "可以；它为结构化给付提供一阶估算，但实际产品可能包含费用和附加条款。" },
        { q: "计算器是否考虑通货膨胀？", a: "不考虑；输入的是名义利率。若要真实价值，可从利率中减去预期通胀率。" },
      ],
    },
    zhTW: {
      steps: [
        "選擇年金類型：普通年金（期末支付）或預付年金（期初支付）。",
        "輸入每期支付金額、年利率、期數，以及若有的話期初本金。",
        "查看未來價值、現值和賺取的總利息。",
      ],
      explanationTitle: "普通年金與預付年金",
      formula: "普通年金 FV = PMT × (((1 + r)^n - 1) / r)；預付年金 FV = 普通年金 FV × (1 + r)",
      explanation: [
        "普通年金假設每期支付發生在期末，例如典型的貸款還款。",
        "預付年金假設每期支付發生在期初，因此每筆現金流多賺一期利息。",
        "同樣的支付流，預付年金價值更高，因為每筆現金更早投入計息。",
      ],
      faq: [
        { q: "預付年金的現實例子是什麼？", a: "房租和健身房會員費很常見，因為它們通常要求在月初開始前支付。" },
        { q: "可以用於退休收入規劃嗎？", a: "可以；它為結構化給付提供一階估算，但實際產品可能包含費用和附加條款。" },
        { q: "計算器是否考慮通貨膨脹？", a: "不考慮；輸入的是名義利率。若要真實價值，可從利率中減去預期通膨率。" },
      ],
    },
    de: {
      steps: [
        "Wahle die Rentenart: nachschussige Rente (Zahlung am Periodenende) oder vorschussige Rente (am Periodenanfang).",
        "Gib die periodische Zahlung, den Jahreszins, die Periodenanzahl und gegebenenfalls das Startkapital ein.",
        "Prufe Endwert, Barwert und gesamte Zinsen.",
      ],
      explanationTitle: "Nachschussige vs. vorschussige Rente",
      formula: "FV nachschussig = PMT × (((1 + r)^n - 1) / r); FV vorschussig = FV nachschussig × (1 + r)",
      explanation: [
        "Eine nachschussige Rente geht davon aus, dass die Zahlung am Periodenende erfolgt, wie bei einer typischen Kreditrate.",
        "Eine vorschussige Rente setzt Zahlungen am Periodenanfang an und verdient so eine zusatzliche Periode Zinsen.",
        "Der gleiche Zahlungsstrom ist als vorschussige Rente wertvoller, weil jeder Cashflow fruher angelegt wird.",
      ],
      faq: [
        { q: "Was ist ein reales Beispiel fur eine vorschussige Rente?", a: "Miete und Fitnessstudio-Mitgliedschaften sind ublich, weil die Zahlung zu Monatsbeginn fallig ist." },
        { q: "Kann ich das fur Rentenplanung nutzen?", a: "Ja; es liefert eine erste Schatzung fur strukturierte Auszahlungen, echte Produkte konnen aber Gebuhren enthalten." },
        { q: "Berucksichtigt der Rechner Inflation?", a: "Nein; der eingegebene Zinssatz ist nominal. Fur reale Werte ziehe die erwartete Inflation ab." },
      ],
    },
    ja: {
      steps: [
        "年金の種類を選択：期末払い（普通年金）または期首払い（期首年金）。",
        "每期支払額、年利率、期数、期初元本（あれば）を入力します。",
        "将来価値、現在価値、総利息を確認します。",
      ],
      explanationTitle: "普通年金と期首年金",
      formula: "普通年金 FV = PMT × (((1 + r)^n - 1) / r)；期首年金 FV = 普通年金 FV × (1 + r)",
      explanation: [
        "普通年金は各期の期末に支払われることを前提とします。一般的なローン返済が例です。",
        "期首年金は各期の期首に支払われるため、それぞれのキャッシュフローが 1 期分多く運用されます。",
        "同じ支払額でも、期首年金の方が価値が高くなります。なぜなら現金がより早く運用されるためです。",
      ],
      faq: [
        { q: "期首年金の現実的な例は何ですか？", a: "賃貸家賃やジム会費が一般的です。なぜなら月初めに支払いが発生するためです。" },
        { q: "退職後の収入計画に使えますか？", a: "はい；構造化された給付の一次推定に使えますが、実際の商品には手数料や特約が含まれる場合があります。" },
        { q: "インフレは考慮されていますか？", a: "いいえ；入力する利率は名目利率です。実質価値が必要な場合は期待インフレ率を差し引いてください。" },
      ],
    },
    es: {
      steps: [
        "Elige el tipo de anualidad: ordinaria (pagos al final del periodo) o vencida (pagos al inicio).",
        "Ingresa el pago periodico, tasa de interes anual, numero de periodos y capital inicial si lo hay.",
        "Revisa el valor futuro, valor presente e intereses totales ganados.",
      ],
      explanationTitle: "Anualidad ordinaria vs vencida",
      formula: "VF ordinaria = PMT × (((1 + r)^n - 1) / r); VF vencida = VF ordinaria × (1 + r)",
      explanation: [
        "Una anualidad ordinaria asume que cada pago ocurre al final del periodo, como un pago de prestamo tipico.",
        "Una anualidad vencida asume pagos al inicio de cada periodo, lo que genera un periodo extra de interes.",
        "El mismo flujo de pagos vale mas en anualidad vencida porque cada efectivo se invierte antes.",
      ],
      faq: [
        { q: "Cual es un ejemplo real de anualidad vencida?", a: "El alquiler de un apartamento y las membresias de gimnasio son comunes porque se pagan al inicio de cada mes." },
        { q: "Puedo usarlo para planificar ingresos de retiro?", a: "Si; ofrece una estimacion de primer orden para pagos estructurados, aunque los productos reales pueden incluir comisiones." },
        { q: "Maneja la inflacion?", a: "No; la tasa ingresada es nominal. Para valor real, resta la inflacion esperada de la tasa." },
      ],
    },
  },
  "debt-snowball-avalanche": {
    en: {
      steps: [
        "List each debt with its current balance, minimum payment, and interest rate.",
        "Choose a strategy: snowball (pay smallest balance first) or avalanche (pay highest interest first).",
        "Enter any extra monthly amount you can add above the minimums, then review the estimated payoff date and total interest.",
      ],
      explanationTitle: "Snowball vs avalanche payoff strategy",
      formula: "Monthly surplus = extra_payment + minimums_of_paid_off_debts",
      explanation: [
        "The snowball method gives quick wins by clearing the smallest debt first, which can help maintain motivation.",
        "The avalanche method minimizes total interest by attacking the highest-rate debt first, saving money mathematically.",
        "Both methods use the same core idea: once a debt is gone, redirect its payment to the next target debt.",
      ],
      faq: [
        { q: "Which method saves more money?", a: "Avalanche usually saves more interest overall, but snowball may be easier to stick with if motivation is a challenge." },
        { q: "Should I stop saving while paying off debt?", a: "Keep a small emergency fund first; then direct extra cash toward high-interest debt before long-term investing." },
        { q: "Does this calculator include fees or penalties?", a: "No; it uses balance, rate, and payment only. Check your loan terms for prepayment penalties." },
      ],
    },
    zh: {
      steps: [
        "列出每笔债务的当前余额、最低还款额和利率。",
        "选择策略：滚雪球法（先还最小余额）或雪崩法（先还最高利率）。",
        "输入每月能额外多还的金额，查看估算还清日期和总利息。",
      ],
      explanationTitle: "滚雪球法与雪崩法对比",
      formula: "每月可调配资金 = 额外还款 + 已还清债务的最低还款额",
      explanation: [
        "滚雪球法先清偿余额最小的债务，带来快速成就感，有助于坚持还款计划。",
        "雪崩法先攻击利率最高的债务，从数学上能节省最多总利息。",
        "两种方法核心相同：一笔债务还清后，把原本用于它的还款额滚入下一个目标债务。",
      ],
      faq: [
        { q: "哪种方法能省更多钱？", a: "雪崩法通常总体利息更少；但如果你容易中途放弃，滚雪球法带来的动力可能更适合。" },
        { q: "还债期间应该停止储蓄吗？", a: "先保留小额应急基金；然后再把多余现金优先用于高息债务，最后才是长期投资。" },
        { q: "计算器是否包含手续费或提前还款罚金？", a: "不包含；它只用余额、利率和还款额计算。是否收提前还款罚金请查看贷款合同。" },
      ],
    },
    zhTW: {
      steps: [
        "列出每筆債務的當前餘額、最低還款額和利率。",
        "選擇策略：滾雪球法（先還最小餘額）或雪崩法（先還最高利率）。",
        "輸入每月能額外多還的金額，查看估算還清日期和總利息。",
      ],
      explanationTitle: "滾雪球法與雪崩法對比",
      formula: "每月可調配資金 = 額外還款 + 已還清債務的最低還款額",
      explanation: [
        "滾雪球法先清償餘額最小的債務，帶來快速成就感，有助於堅持還款計劃。",
        "雪崩法先攻擊利率最高的債務，從數學上能節省最多總利息。",
        "兩種方法核心相同：一筆債務還清後，把原本用於它的還款額滾入下一個目標債務。",
      ],
      faq: [
        { q: "哪種方法能省更多錢？", a: "雪崩法通常總體利息更少；但如果你容易中途放棄，滾雪球法帶來的動力可能更適合。" },
        { q: "還債期間應該停止儲蓄嗎？", a: "先保留小額應急基金；然後再把多餘現金優先用於高息債務，最後才是長期投資。" },
        { q: "計算器是否包含手續費或提前還款罰金？", a: "不包含；它只用餘額、利率和還款額計算。是否收提前還款罰金請查看貸款合約。" },
      ],
    },
    de: {
      steps: [
        "Liste jede Schuld mit Restbetrag, Mindestzahlung und Zinssatz auf.",
        "Wahle eine Strategie: Schneeball (kleinste Schuld zuerst) oder Lawine (hochster Zins zuerst).",
        "Gib einen monatlichen Zusatzbetrag ein und prufe das geschatzte Ablosedatum sowie die Gesamtzinsen.",
      ],
      explanationTitle: "Schneeball- vs. Lawinenstrategie",
      formula: "Monatlicher Uberschuss = Zusatzzahlung + Mindestzahlungen_abgeloster_Schulden",
      explanation: [
        "Die Schneeballmethode schafft schnelle Erfolge durch die kleinste Schuld zuerst und hilft, motiviert zu bleiben.",
        "Die Lawinenmethode minimiert die Gesamtzinsen, indem die Schulden mit dem hochsten Zins zuerst angegriffen werden.",
        "Beide Methoden basieren auf dem gleichen Prinzip: Ist eine Schuld getilgt, wird deren Rate auf die nachste Zielschuld umgeleitet.",
      ],
      faq: [
        { q: "Welche Methode spart mehr Geld?", a: "Lawine spart meist mehr Zinsen, aber Schneeball ist einfacher durchzuhalten, wenn Motivation ein Problem ist." },
        { q: "Sollte ich wahrend der Schuldenabzahlung sparen?", a: "Behalte zuerst einen kleinen Notfallfonds; dann flieBt zusatzliches Geld in Hochzins-Schulden vor langfristigen Anlagen." },
        { q: "Sind Gebuhren oder Vorfalligkeitsentschadigungen enthalten?", a: "Nein; es werden nur Saldo, Zins und Zahlung verwendet. Prufe deine Vertrage auf Vorfalligkeitskosten." },
      ],
    },
    ja: {
      steps: [
        "各債務の残高、最低返済額、金利を入力します。",
        "戦略を選択：スノーボール法（残高が最も小さいものから）またはアバランチ法（金利が最も高いものから）。",
        "最低返済額を上回る毎月の余剰金額を入力し、推定完済日と総利息を確認します。",
      ],
      explanationTitle: "スノーボール法とアバランチ法の比較",
      formula: "月次余剰資金 = 追加返済 + 完済した債務の最低返済額",
      explanation: [
        "スノーボール法は残高の小さい債務から先に返済し、達成感を得やすくモチベーション維持に役立ちます。",
        "アバランチ法は金利の高い債務から先に返済し、数学的に総利息を最小化します。",
        "どちらも同じ考え方が基本：1 つの債務がなくなると、その返済分を次の目標債務に回します。",
      ],
      faq: [
        { q: "どちらがお金を節約できますか？", a: "アバランチ法の方が総利息は通常少なくなります。ただし続けにくい場合はスノーボール法のモチベーション効果が有効です。" },
        { q: "借金返済中は貯蓄をやめるべきですか？", a: "まず小さな緊急資金を確保し、余剰資金は高利回りの借金返済に優先的に回し、その後長期投資に回します。" },
        { q: "手数料や繰上返済手数料は含まれますか？", a: "含まれません；残高、金利、返済額のみを使用します。繰上返済の有無は契約書を確認してください。" },
      ],
    },
    es: {
      steps: [
        "Lista cada deuda con su saldo actual, pago minimo y tasa de interes.",
        "Elige una estrategia: bola de nieve (pagar el saldo mas pequeno primero) o avalancha (pagar el mayor interes primero).",
        "Ingresa cualquier monto extra mensual que puedas agregar y revisa la fecha estimada de pago y el interes total.",
      ],
      explanationTitle: "Estrategia bola de nieve vs avalancha",
      formula: "Superavit mensual = pago_extra + minimos_de_deudas_pagadas",
      explanation: [
        "El metodo bola de nieve da victorias rapidas al eliminar la deuda mas pequena primero, ayudando a mantener la motivacion.",
        "El metodo avalancha minimiza los intereses totales atacando primero la deuda con mayor tasa.",
        "Ambos metodos usan la misma idea central: cuando una deuda desaparece, rediriges su pago a la siguiente deuda objetivo.",
      ],
      faq: [
        { q: "Cual metodo ahorra mas dinero?", a: "Avalancha usualmente ahorra mas interes, pero bola de nieve puede ser mas facil de mantener si la motivacion es un desafio." },
        { q: "Deberia dejar de ahorrar mientras pago deudas?", a: "Manten primero un pequeno fondo de emergencia; luego dirige el efectivo extra a deudas de alto interes antes de invertir a largo plazo." },
        { q: "Incluye comisiones o penalizaciones?", a: "No; usa solo saldo, tasa y pago. Consulta los terminos de tu prestamo por penalizaciones por pago anticipado." },
      ],
    },
  },
  "stress-strain": {
    en: {
      steps: [
        "Enter the applied force and the original cross-sectional area to compute stress.",
        "Enter the change in length and original length to compute strain.",
        "Review stress, strain, and Young's modulus if both stress and strain are provided.",
      ],
      explanationTitle: "Stress, strain, and Young's modulus",
      formula: "Stress = force / area; Strain = change_in_length / original_length; E = stress / strain",
      explanation: [
        "Stress is the internal force distributed over a cross-section, measured in pascals or psi.",
        "Strain is the deformation per unit length; it is dimensionless because it is a ratio of lengths.",
        "Young's modulus is the slope of the elastic region and describes how stiff a material is under tension or compression.",
      ],
      faq: [
        { q: "What units should I use?", a: "Use consistent units: newtons with square meters give pascals; pounds with square inches give psi." },
        { q: "Can strain be greater than 1?", a: "Yes, but most engineering materials are designed to stay well below 1 in the elastic range." },
        { q: "Is Young's modulus the same in tension and compression?", a: "For many materials it is approximately the same, but brittle materials can behave differently in compression." },
      ],
    },
    zh: {
      steps: [
        "输入施加力和原始横截面积，计算应力。",
        "输入长度变化量和原始长度，计算应变。",
        "同时提供应力和应变时，查看杨氏模量。",
      ],
      explanationTitle: "应力、应变与杨氏模量",
      formula: "应力 = 力 / 面积；应变 = 长度变化量 / 原始长度；E = 应力 / 应变",
      explanation: [
        "应力是作用在横截面上的内部力分布，常用帕斯卡或 psi 表示。",
        "应变是单位长度的变形量，是无量纲量，因为是长度比值。",
        "杨氏模量是弹性阶段应力-应变曲线的斜率，描述材料在拉伸或压缩下的刚度。",
      ],
      faq: [
        { q: "应该使用什么单位？", a: "单位要一致：牛顿配平方米得到帕斯卡；磅配平方英寸得到 psi。" },
        { q: "应变可以大于 1 吗？", a: "可以，但大多数工程材料在弹性范围内都设计为远小于 1。" },
        { q: "拉伸和压缩的杨氏模量相同吗？", a: "对许多材料近似相同，但脆性材料在压缩下可能表现不同。" },
      ],
    },
    zhTW: {
      steps: [
        "輸入施加力和原始橫截面積，計算應力。",
        "輸入長度變化量和原始長度，計算應變。",
        "同時提供應力和應變時，查看楊氏模量。",
      ],
      explanationTitle: "應力、應變與楊氏模量",
      formula: "應力 = 力 / 面積；應變 = 長度變化量 / 原始長度；E = 應力 / 應變",
      explanation: [
        "應力是作用在橫截面上的內部力分佈，常用帕斯卡或 psi 表示。",
        "應變是單位長度的變形量，是無量綱量，因為是長度比值。",
        "楊氏模量是彈性階段應力-應變曲線的斜率，描述材料在拉伸或壓縮下的剛度。",
      ],
      faq: [
        { q: "應該使用什麼單位？", a: "單位要一致：牛頓配平方公尺得到帕斯卡；磅配平方英吋得到 psi。" },
        { q: "應變可以大於 1 嗎？", a: "可以，但大多數工程材料在彈性範圍內都設計為遠小於 1。" },
        { q: "拉伸和壓縮的楊氏模量相同嗎？", a: "對許多材料近似相同，但脆性材料在壓縮下可能表現不同。" },
      ],
    },
    de: {
      steps: [
        "Gib die wirkende Kraft und die ursprungliche Querschnittsflache ein, um die Spannung zu berechnen.",
        "Gib die Langenanderung und die ursprungliche Lange ein, um die Dehnung zu berechnen.",
        "Werden Spannung und Dehnung angegeben, wird das Elastizitatsmodul angezeigt.",
      ],
      explanationTitle: "Spannung, Dehnung und Elastizitatsmodul",
      formula: "Spannung = Kraft / Flache; Dehnung = Langenanderung / Ursprungslange; E = Spannung / Dehnung",
      explanation: [
        "Spannung ist die uber den Querschnitt verteilte innere Kraft, gemessen in Pascal oder psi.",
        "Dehnung ist die Formanderung pro Langeneinheit und dimensionslos, da sie ein Langenverhaltnis ist.",
        "Das Elastizitatsmodul ist die Steigung im elastischen Bereich und beschreibt die Steifigkeit eines Materials unter Zug oder Druck.",
      ],
      faq: [
        { q: "Welche Einheiten soll ich verwenden?", a: "Nutze konsistente Einheiten: Newton mit Quadratmetern ergeben Pascal; Pfund mit Quadratzoll ergeben psi." },
        { q: "Kann Dehnung grosser als 1 sein?", a: "Ja, aber die meisten technischen Werkstoffe werden so ausgelegt, dass sie im elastischen Bereich deutlich unter 1 bleiben." },
        { q: "Ist das Elastizitatsmodul unter Zug und Druck gleich?", a: "Bei vielen Materialen naherungsweise ja, bei sproden Werkstoffen kann es unter Druck anders aussehen." },
      ],
    },
    ja: {
      steps: [
        "作用力と元の断面積を入力して応力を計算します。",
        "長さの変化量と元の長さを入力して歪みを計算します。",
        "応力と歪みの両方が入力されていれば、ヤング率も確認します。",
      ],
      explanationTitle: "応力、歪み、ヤング率",
      formula: "応力 = 力 / 面積；歪み = 長さ変化量 / 元の長さ；E = 応力 / 歪み",
      explanation: [
        "応力は断面に分布する内部力で、パスカルや psi で表されます。",
        "歪みは単位長さあたりの変形量で、長さの比率なので無次元です。",
        "ヤング率は弾性域の応力-歪みグラフの傾きであり、材料の引張・圧縮における剛性を表します。",
      ],
      faq: [
        { q: "どの単位を使えばよいですか？", a: "単位を統一してください。ニュートンと平方メートルでパスカル；ポンドと平方インチで psi になります。" },
        { q: "歪みは 1 を超えられますか？", a: "超えられますが、多くの構造材料は弾性域で 1 より十分小さくなるよう設計されます。" },
        { q: "引張と圧縮のヤング率は同じですか？", a: "多くの材料ではほぼ同じですが、脆性材料では圧縮下で異なることがあります。" },
      ],
    },
    es: {
      steps: [
        "Ingresa la fuerza aplicada y el area de seccion transversal original para calcular el esfuerzo.",
        "Ingresa el cambio en longitud y la longitud original para calcular la deformacion.",
        "Si proporcionas esfuerzo y deformacion, revisa el modulo de Young.",
      ],
      explanationTitle: "Esfuerzo, deformacion y modulo de Young",
      formula: "Esfuerzo = fuerza / area; Deformacion = cambio_longitud / longitud_original; E = esfuerzo / deformacion",
      explanation: [
        "El esfuerzo es la fuerza interna distribuida sobre una seccion, medido en pascales o psi.",
        "La deformacion es la deformacion por unidad de longitud; es adimensional porque es una razon de longitudes.",
        "El modulo de Young es la pendiente de la region elastica y describe la rigidez de un material bajo tension o compresion.",
      ],
      faq: [
        { q: "Que unidades debo usar?", a: "Usa unidades consistentes: newton con metros cuadrados dan pascales; libras con pulgadas cuadradas dan psi." },
        { q: "La deformacion puede ser mayor que 1?", a: "Si, pero la mayoria de materiales de ingenieria se disenan para mantenerse bien por debajo de 1 en el rango elastico." },
        { q: "El modulo de Young es igual en tension y compresion?", a: "Para muchos materiales es aproximadamente igual, pero los materiales fragiles pueden comportarse diferente en compresion." },
      ],
    },
  },
  "moment-of-inertia": {
    en: {
      steps: [
        "Select the cross-section shape from the list or choose custom input.",
        "Enter the required dimensions such as width, height, diameter, or radius.",
        "Review the area moment of inertia and radius of gyration for bending and deflection calculations.",
      ],
      explanationTitle: "Area moment of inertia in beams",
      formula: "Rectangle: I = b × h^3 / 12; Circle: I = π × d^4 / 64",
      explanation: [
        "The area moment of inertia measures how a cross-section resists bending; larger values mean less deflection under the same load.",
        "It depends on the shape and orientation of the cross-section, not on the material itself.",
        "The radius of gyration relates the moment of inertia to the cross-sectional area and is useful for buckling analysis.",
      ],
      faq: [
        { q: "Is this the same as mass moment of inertia?", a: "No; area moment of inertia relates to bending stiffness, while mass moment of inertia relates to rotational inertia." },
        { q: "Why does orientation matter for a rectangle?", a: "A beam laid flat has a much lower I about the bending axis than the same beam standing upright." },
        { q: "Can I use this for composite shapes?", a: "Yes, by splitting the section into simple shapes and applying the parallel axis theorem." },
      ],
    },
    zh: {
      steps: [
        "从列表中选择截面形状，或选择自定义输入。",
        "输入所需尺寸：宽度、高度、直径或半径。",
        "查看截面惯性矩和迴转半径，用于弯曲与挠度计算。",
      ],
      explanationTitle: "梁截面的惯性矩",
      formula: "矩形：I = b × h^3 / 12；圆形：I = π × d^4 / 64",
      explanation: [
        "截面惯性矩衡量截面抵抗弯曲的能力，数值越大，在相同载荷下挠度越小。",
        "它取决于截面形状和方向，与材料本身无关。",
        "迴转半径把惯性矩与截面积联系起来，常用于压杆稳定分析。",
      ],
      faq: [
        { q: "这与质量惯性矩相同吗？", a: "不同；截面惯性矩与抗弯刚度有关，质量惯性矩与转动惯量有关。" },
        { q: "为什么矩形截面的方向很重要？", a: "同样一根梁平放时，其绕弯曲轴的惯性矩远小于竖放时。" },
        { q: "可以用于组合截面吗？", a: "可以，将截面拆分为简单形状，再应用平行轴定理。" },
      ],
    },
    zhTW: {
      steps: [
        "從列表中選擇截面形狀，或選擇自訂輸入。",
        "輸入所需尺寸：寬度、高度、直徑或半徑。",
        "查看截面慣性矩和迴轉半徑，用於彎曲與撓度計算。",
      ],
      explanationTitle: "梁截面的慣性矩",
      formula: "矩形：I = b × h^3 / 12；圓形：I = π × d^4 / 64",
      explanation: [
        "截面慣性矩衡量截面抵抗彎曲的能力，數值越大，在相同載重下撓度越小。",
        "它取決於截面形狀和方向，與材料本身無關。",
        "迴轉半徑把慣性矩與截面積聯繫起來，常用於壓桿穩定分析。",
      ],
      faq: [
        { q: "這與質量慣性矩相同嗎？", a: "不同；截面慣性矩與抗彎剛度有關，質量慣性矩與轉動慣量有關。" },
        { q: "為什麼矩形截面的方向很重要？", a: "同樣一根梁平放時，其繞彎曲軸的慣性矩遠小於豎放時。" },
        { q: "可以用於組合截面嗎？", a: "可以，將截面拆分為簡單形狀，再應用平行軸定理。" },
      ],
    },
    de: {
      steps: [
        "Wahle die Querschnittsform aus der Liste oder nutze benutzerdefinierte Eingaben.",
        "Gib die benotigten Abmessungen wie Breite, Hohe, Durchmesser oder Radius ein.",
        "Prufe Flachentragheitsmoment und Tragheitsradius fur Biegungs- und Durchbiegungsberechnungen.",
      ],
      explanationTitle: "Flachentragheitsmoment bei Tragern",
      formula: "Rechteck: I = b × h^3 / 12; Kreis: I = π × d^4 / 64",
      explanation: [
        "Das Flachentragheitsmoment beschreibt den Widerstand eines Querschnitts gegen Biegung; grossere Werte bedeuten geringere Durchbiegung.",
        "Es hangt von Form und Ausrichtung des Querschnitts ab, nicht vom Material.",
        "Der Tragheitsradius verknupft das Flachentragheitsmoment mit der Querschnittsflache und ist nutzlich fur Knicknachweise.",
      ],
      faq: [
        { q: "Ist das gleich wie das Massentragheitsmoment?", a: "Nein; das Flachentragheitsmoment beschreibt die Biegesteifigkeit, das Massentragheitsmoment die Rotations-Tragheit." },
        { q: "Warum spielt die Ausrichtung bei Rechtecken eine Rolle?", a: "Ein flach liegender Trager hat ein deutlich kleineres I um die Biegeachse als derselbe Trager aufrecht." },
        { q: "Kann ich es fur zusammengesetzte Querschnitte verwenden?", a: "Ja, indem der Querschnitt in einfache Formen zerlegt und der Satz von Steiner angewendet wird." },
      ],
    },
    ja: {
      steps: [
        "リストから断面形状を選択するか、カスタム入力を選びます。",
        "幅、高さ、直径、半径など必要な寸法を入力します。",
        "断面二次モーメントと回転半径を確認し、たわみ計算に利用します。",
      ],
      explanationTitle: "梁の断面二次モーメント",
      formula: "矩形：I = b × h^3 / 12；円：I = π × d^4 / 64",
      explanation: [
        "断面二次モーメントは断面の曲げ抵抗を表し、値が大きいほど同じ荷重でたわみが小さくなります。",
        "これは材料そのものではなく、断面の形状と方向に依存します。",
        "回転半径は断面二次モーメントと断面積を関連付け、座屈解析に役立ちます。",
      ],
      faq: [
        { q: "質量慣性モーメントと同じですか？", a: "違います。断面二次モーメントは曲げ剛性、質量慣性モーメントは回転慣性に関係します。" },
        { q: "なぜ矩形の方向が重要ですか？", a: "同じ梁を横倒しにすると、曲げ軸周りの I は立てる場合より大幅に小さくなります。" },
        { q: "複合断面にも使えますか？", a: "はい。断面を単純形状に分割し、平行軸の定理を適用します。" },
      ],
    },
    es: {
      steps: [
        "Selecciona la forma de la seccion transversal de la lista o elige entrada personalizada.",
        "Ingresa las dimensiones requeridas como ancho, altura, diametro o radio.",
        "Revisa el momento de inercia del area y el radio de giro para calculos de flexion y deflexion.",
      ],
      explanationTitle: "Momento de inercia del area en vigas",
      formula: "Rectangulo: I = b × h^3 / 12; Circulo: I = π × d^4 / 64",
      explanation: [
        "El momento de inercia del area mide como una seccion resiste la flexion; valores mayores significan menos deflexion bajo la misma carga.",
        "Depende de la forma y orientacion de la seccion, no del material en si.",
        "El radio de giro relaciona el momento de inercia con el area de la seccion y es util para analisis de pandeo.",
      ],
      faq: [
        { q: "Es lo mismo que el momento de inercia de masa?", a: "No; el momento de inercia del area se relaciona con la rigidez a la flexion, mientras que el de masa se relaciona con la inercia rotacional." },
        { q: "Por que importa la orientacion de un rectangulo?", a: "Una viga colocada plana tiene un I mucho menor respecto al eje de flexion que la misma viga en posicion vertical." },
        { q: "Puedo usarlo para secciones compuestas?", a: "Si, dividiendo la seccion en formas simples y aplicando el teorema de ejes paralelos." },
      ],
    },
  },
  "beam-deflection": {
    en: {
      steps: [
        "Select the beam support condition: cantilever, simply supported, or fixed ends.",
        "Enter beam length, load magnitude, load position, and material properties like Young's modulus and moment of inertia.",
        "Review the maximum deflection, reaction forces, and bending moment diagram summary.",
      ],
      explanationTitle: "Deflection of elastic beams",
      formula: "Max deflection depends on load case; common case: δ_max = P × L^3 / (48 × E × I) for center point load",
      explanation: [
        "Beam deflection describes how much a structural member bends under applied loads without permanent deformation.",
        "The deflection depends on load type, support conditions, span length, material stiffness, and cross-section shape.",
        "Staying within allowable deflection limits prevents cracks in finishes and ensures serviceability.",
      ],
      faq: [
        { q: "What is allowable deflection?", a: "Typical limits range from L/180 to L/360 of the span, depending on the building code and use." },
        { q: "Does this calculator replace structural engineering review?", a: "No; it is an educational tool. Real designs require code checks for strength, stability, and safety factors." },
        { q: "Can I combine multiple loads?", a: "Yes by superposition: calculate deflection for each load case and add the results if the system remains elastic." },
      ],
    },
    zh: {
      steps: [
        "选择梁的支承条件：悬臂梁、简支梁或两端固定。",
        "输入梁长、载荷大小、载荷位置，以及材料参数如杨氏模量和惯性矩。",
        "查看最大挠度、支座反力和弯矩图摘要。",
      ],
      explanationTitle: "弹性梁的挠度",
      formula: "最大挠度取决于载荷形式；简支中点集中载荷常用：δ_max = P × L^3 / (48 × E × I)",
      explanation: [
        "梁挠度描述结构构件在载荷作用下的弯曲量，且不发生永久变形。",
        "挠度与载荷类型、支承条件、跨度、材料刚度和截面形状有关。",
        "控制在允许挠度范围内可避免装修开裂并保证使用性能。",
      ],
      faq: [
        { q: "什么是允许挠度？", a: "常见限值为跨度的 L/180 到 L/360，具体取决于建筑规范与用途。" },
        { q: "这个计算器能替代结构工程师审核吗？", a: "不能；它只是教育工具。真实设计还需按规范验算强度、稳定性和安全系数。" },
        { q: "可以叠加多种载荷吗？", a: "可以，只要系统保持弹性，就可分别计算各载荷下的挠度后相加。" },
      ],
    },
    zhTW: {
      steps: [
        "選擇梁的支承條件：懸臂梁、簡支梁或兩端固定。",
        "輸入梁長、載重大小、載重位置，以及材料參數如楊氏模量和慣性矩。",
        "查看最大撓度、支座反力和彎矩圖摘要。",
      ],
      explanationTitle: "彈性梁的撓度",
      formula: "最大撓度取決於載重形式；簡支中點集中載重常用：δ_max = P × L^3 / (48 × E × I)",
      explanation: [
        "梁撓度描述結構構件在載重作用下的彎曲量，且不發生永久變形。",
        "撓度與載重類型、支承條件、跨度、材料剛度和截面形狀有關。",
        "控制在允許撓度範圍內可避免裝修開裂並保證使用性能。",
      ],
      faq: [
        { q: "什麼是允許撓度？", a: "常見限值為跨度的 L/180 到 L/360，具體取決於建築規範與用途。" },
        { q: "這個計算器能替代結構工程師審核嗎？", a: "不能；它只是教育工具。真實設計還需按規範驗算強度、穩定性和安全係數。" },
        { q: "可以疊加多種載重嗎？", a: "可以，只要系統保持彈性，就可分別計算各載重下的撓度後相加。" },
      ],
    },
    de: {
      steps: [
        "Wahle die Lagerungsart des Tragers: Kragarm, einfach gelagert oder beidseitig eingespannt.",
        "Gib Tragerlange, Lastgrosse, Lastposition und Materialkennwerte wie Elastizitatsmodul und Tragheitsmoment ein.",
        "Prufe maximale Durchbiegung, Auflagerkrafte und eine Zusammenfassung des Biegemomentenverlaufs.",
      ],
      explanationTitle: "Durchbiegung elastischer Trager",
      formula: "Max. Durchbiegung hangt von der Laststellung ab; einfach gelagert mit Mittellast: δ_max = P × L^3 / (48 × E × I)",
      explanation: [
        "Die Tragerdurchbiegung beschreibt, wie stark ein Bauteil unter Last biegt, ohne bleibende Verformung.",
        "Sie hangt von Lasttyp, Lagerung, Spannweite, Materialsteifigkeit und Querschnittsform ab.",
        "Die Einhaltung zulassiger Durchbiegungswerte verhindert Risse im Ausbau und gewahrleistet Gebrauchstauglichkeit.",
      ],
      faq: [
        { q: "Was ist eine zulassige Durchbiegung?", a: "Gangige Grenzen liegen zwischen L/180 und L/360 der Spannweite, je nach Norm und Nutzung." },
        { q: "Ersetzt der Rechner eine statische Prufung?", a: "Nein; er ist ein Lernwerkzeug. Reale Konstruktionen erfordern Nachweise fur Festigkeit, Stabilitat und Sicherheit." },
        { q: "Kann ich mehrere Lasten kombinieren?", a: "Ja, durch Superposition: Durchbiegungen jeder Lastfall einzeln berechnen und im elastischen Bereich addieren." },
      ],
    },
    ja: {
      steps: [
        "梁の支持条件を選択：片持梁、両端支持、または両端固定。",
        "梁長、荷重の大きさ、荷重位置、ヤング率や断面二次モーメントなど材料物性を入力します。",
        "最大たわみ、支点反力、曲げモーメント図の概要を確認します。",
      ],
      explanationTitle: "弾性梁のたわみ",
      formula: "最大たわみは荷重状態による；中央集中荷重の両端支持梁：δ_max = P × L^3 / (48 × E × I)",
      explanation: [
        "梁のたわみは、構造部材が荷重によってどれだけ曲がるかを表し、永久変形を伴いません。",
        "たわみは荷重の種類、支持条件、スパン長、材料剛性、断面形状に依存します。",
        "許容たわみ範囲内に抑えることで、仕上げのひび割れを防ぎ、使用性を確保します。",
      ],
      faq: [
        { q: "許容たわみとは何ですか？", a: "一般的にスパンの L/180 から L/360 が建築基準や用途によって用いられます。" },
        { q: "この計算機は構造設計の審査を代替しますか？", a: "いいえ；教育用ツールです。実設計では強度、座屈、安全率などの規格照査が必要です。" },
        { q: "複数荷重を重ね合わせできますか？", a: "はい。系が弾性範囲内なら各荷重ケースのたわみを計算して加算します。" },
      ],
    },
    es: {
      steps: [
        "Selecciona la condicion de soporte de la viga: voladizo, simplemente apoyada o extremos fijos.",
        "Ingresa la longitud de la viga, magnitud de carga, posicion de la carga y propiedades del material como modulo de Young y momento de inercia.",
        "Revisa la deflexion maxima, fuerzas de reaccion y resumen del diagrama de momento flector.",
      ],
      explanationTitle: "Deflexion de vigas elasticas",
      formula: "Deflexion maxima depende del caso; carga puntual central: δ_max = P × L^3 / (48 × E × I)",
      explanation: [
        "La deflexion de vigas describe cuanto se dobla un elemento estructural bajo cargas sin deformacion permanente.",
        "La deflexion depende del tipo de carga, condiciones de soporte, longitud del claro, rigidez del material y forma de la seccion.",
        "Mantenerse dentro de los limites de deflexion permisibles evita grietas en acabados y asegura la funcionalidad.",
      ],
      faq: [
        { q: "Que es la deflexion admisible?", a: "Los limites tipicos van de L/180 a L/360 del claro, segun el codigo de construccion y el uso." },
        { q: "Este calculador reemplaza la revision de un ingeniero estructural?", a: "No; es una herramienta educativa. Los disenos reales requieren verificaciones de codigo para resistencia, estabilidad y factores de seguridad." },
        { q: "Puedo combinar multiples cargas?", a: "Si, por superposicion: calcular la deflexion para cada caso de carga y sumar los resultados si el sistema permanece elastico." },
      ],
    },
  },
  "column-buckling": {
    en: {
      steps: [
        "Enter the column length, end fixity factor, cross-sectional area, and least moment of inertia.",
        "Provide the material's modulus of elasticity and any applied axial load.",
        "Review the critical buckling load and slenderness ratio to judge stability.",
      ],
      explanationTitle: "Euler buckling of columns",
      formula: "P_cr = π^2 × E × I / (K × L)^2",
      explanation: [
        "Euler buckling occurs when a slender column under compression suddenly deflects sideways.",
        "The effective length factor K depends on how the ends are restrained; pinned ends use K=1.0, fixed ends use K=0.5.",
        "The slenderness ratio tells you whether Euler theory applies; very short columns fail by crushing rather than buckling.",
      ],
      faq: [
        { q: "What is the slenderness ratio limit for Euler buckling?", a: "Euler is generally valid when the slenderness ratio is above about 100 for steel, but codes provide specific transition limits." },
        { q: "Does material strength affect Euler buckling?", a: "Not directly; Euler critical load depends only on elastic modulus, geometry, and length. Yield strength matters for inelastic buckling." },
        { q: "Can I account for self-weight?", a: "This calculator uses an axial load you provide; add the column's self-weight to the applied load if it is significant." },
      ],
    },
    zh: {
      steps: [
        "输入柱长、端部约束系数、横截面积和最小惯性矩。",
        "提供材料的弹性模量和承受的轴向载荷。",
        "查看临界屈曲载荷和长细比，判断稳定性。",
      ],
      explanationTitle: "柱子的欧拉屈曲",
      formula: "P_cr = π^2 × E × I / (K × L)^2",
      explanation: [
        "欧拉屈曲是指细长柱在受压时突然发生侧向弯曲的现象。",
        "有效长度系数 K 取决于端部约束方式：铰接端 K=1.0，固定端 K=0.5。",
        "长细比决定欧拉理论是否适用；短柱通常因压溃而非屈曲破坏。",
      ],
      faq: [
        { q: "欧拉屈曲的长细比下限是多少？", a: "钢材通常在长细比大于 100 时适用欧拉理论，但规范会给出具体过渡限值。" },
        { q: "材料强度影响欧拉屈曲吗？", a: "不直接影响；欧拉临界载荷只取决于弹性模量、几何尺寸和长度。屈服强度影响非弹性屈曲。" },
        { q: "能否考虑自重？", a: "计算器使用你提供的轴向载荷；若自重显著，请把它加到外载荷中。" },
      ],
    },
    zhTW: {
      steps: [
        "輸入柱長、端部約束係數、橫截面積和最小慣性矩。",
        "提供材料的彈性模量和承受的軸向載重。",
        "查看臨界屈曲載重和長細比，判斷穩定性。",
      ],
      explanationTitle: "柱子的歐拉屈曲",
      formula: "P_cr = π^2 × E × I / (K × L)^2",
      explanation: [
        "歐拉屈曲是指細長柱在受壓時突然發生側向彎曲的現象。",
        "有效長度係數 K 取決於端部約束方式：鉸接端 K=1.0，固定端 K=0.5。",
        "長細比決定歐拉理論是否適用；短柱通常因壓潰而非屈曲破壞。",
      ],
      faq: [
        { q: "歐拉屈曲的長細比下限是多少？", a: "鋼材通常在長細比大於 100 時適用歐拉理論，但規範會給出具體過渡限值。" },
        { q: "材料強度影響歐拉屈曲嗎？", a: "不直接影響；歐拉臨界載重只取決於彈性模量、幾何尺寸和長度。屈服強度影響非彈性屈曲。" },
        { q: "能否考慮自重？", a: "計算器使用你提供的軸向載重；若自重顯著，請把它加到外載重中。" },
      ],
    },
    de: {
      steps: [
        "Gib die Saulenlange, den Lagerungsfaktor, die Querschnittsflache und das kleinste Tragheitsmoment ein.",
        "Gib den Elastizitatsmodul des Materials und die vorhandene axiale Last an.",
        "Prufe die kritische Knicklast und die Schlankheit, um die Stabilitat zu beurteilen.",
      ],
      explanationTitle: "Eulersches Knicken von Stutzen",
      formula: "P_cr = π^2 × E × I / (K × L)^2",
      explanation: [
        "Beim Euler-Knicken biegt sich eine schlanke Druckstutze plotzlich seitlich durch.",
        "Der Knicklängenbeiwert K hangt von der Lagerung der Enden ab; gelenkig K=1.0, eingespannt K=0.5.",
        "Die Schlankheit gibt an, ob die Euler-Theorie gilt; kurze Stutzen versagen durch Quetschung statt Knicken.",
      ],
      faq: [
        { q: "Welche Schlankheit ist fur Euler-Knicken erforderlich?", a: "Fur Stahl gilt Euler meist oberhalb Schlankheit 100, aber Normen geben genaue Ubergangsgrenzen." },
        { q: "Beeinflusst die Materialfestigkeit das Euler-Knicken?", a: "Nicht direkt; die kritische Euler-Last hangt nur vom Elastizitatsmodul, der Geometrie und der Lange ab. Streckgrenze zahlt bei inelastischem Knicken." },
        { q: "Kann ich das Eigengewicht berucksichtigen?", a: "Der Rechner nutzt die von dir angegebene Achslast; addiere das Eigengewicht, wenn es signifikant ist." },
      ],
    },
    ja: {
      steps: [
        "柱の長さ、端部係数、断面積、最小断面二次モーメントを入力します。",
        "材料の弾性係数と作用軸荷重を入力します。",
        "座屈荷重と細長比を確認し、安定性を判断します。",
      ],
      explanationTitle: "柱のオイラー座屈",
      formula: "P_cr = π^2 × E × I / (K × L)^2",
      explanation: [
        "オイラー座屈は、細長い圧縮柱が突然横方向にたわむ現象です。",
        "有効長係数 K は端部の拘束条件に依存します。ピン支持端 K=1.0、固定端 K=0.5。",
        "細長比が大きい場合にオイラー理論が適用されます。短い柱は座屈ではなく押潰破壊になります。",
      ],
      faq: [
        { q: "オイラー座屈に必要な細長比の目安は？", a: "鋼材では細長比約 100 以上が一般的ですが、規格により具体的な限界値があります。" },
        { q: "材料強度はオイラー座屈に影響しますか？", a: "直接的には影響しません。オイラー臨界荷重は弾性係数、形状寸法、長さのみに依存します。降伏強度は非弾性座屈に関係します。" },
        { q: "自重を考慮できますか？", a: "この計算機は入力された軸荷重を使用します。自重が無視できない場合は外荷重に加算してください。" },
      ],
    },
    es: {
      steps: [
        "Ingresa la longitud de la columna, factor de extremos, area de seccion y momento de inercia minimo.",
        "Proporciona el modulo de elasticidad del material y cualquier carga axial aplicada.",
        "Revisa la carga critica de pandeo y la relacion de esbeltez para juzgar la estabilidad.",
      ],
      explanationTitle: "Pandeo de Euler en columnas",
      formula: "P_cr = π^2 × E × I / (K × L)^2",
      explanation: [
        "El pandeo de Euler ocurre cuando una columna esbelta bajo compresion se deflexiona lateralmente de repente.",
        "El factor de longitud efectiva K depende de como esten restringidos los extremos; extremos articulados K=1.0, fijos K=0.5.",
        "La relacion de esbeltez indica si la teoria de Euler aplica; columnas muy cortas fallan por aplastamiento mas que por pandeo.",
      ],
      faq: [
        { q: "Cual es el limite de esbeltez para pandeo de Euler?", a: "Euler generalmente es valido cuando la esbeltez esta por encima de 100 para acero, aunque los codigos dan limites especificos." },
        { q: "La resistencia del material afecta el pandeo de Euler?", a: "No directamente; la carga critica de Euler depende solo del modulo elastico, geometria y longitud. La resistencia a la fluencia importa para pandeo inelastico." },
        { q: "Puedo incluir el peso propio?", a: "Este calculador usa la carga axial que proporcionas; agrega el peso propio de la columna si es significativo." },
      ],
    },
  },
  "pipe-flow": {
    en: {
      steps: [
        "Enter the pipe inner diameter, pipe length, and roughness for the material.",
        "Provide the fluid properties: density and dynamic viscosity, plus either flow rate or pressure drop.",
        "Review the Reynolds number, friction factor, head loss, and velocity.",
      ],
      explanationTitle: "Pressure drop in pipe flow",
      formula: "Head loss = f × (L/D) × (v^2 / (2g)); Reynolds number = ρ × v × D / μ",
      explanation: [
        "The Reynolds number tells you whether the flow is laminar, transitional, or turbulent.",
        "The Darcy friction factor depends on Reynolds number and pipe roughness; it links velocity to pressure drop.",
        "Head loss is the energy lost per unit weight of fluid due to friction along the pipe.",
      ],
      faq: [
        { q: "What is the difference between Darcy and Fanning friction factor?", a: "Darcy-Weisbach uses the Darcy friction factor, which is four times the Fanning friction factor." },
        { q: "Can I use this for gases?", a: "Yes for incompressible approximations; for long pipelines or high pressure drops, compressible flow corrections are needed." },
        { q: "Does the calculator include minor losses from fittings?", a: "No; it computes major frictional losses only. Add fitting losses separately using loss coefficients." },
      ],
    },
    zh: {
      steps: [
        "输入管道内径、管长和管材粗糙度。",
        "提供流体物性：密度、动力粘度，以及流量或压降其中一个。",
        "查看雷诺数、摩擦系数、沿程水头损失和流速。",
      ],
      explanationTitle: "管道流动的压降",
      formula: "水头损失 = f × (L/D) × (v^2 / (2g))；雷诺数 = ρ × v × D / μ",
      explanation: [
        "雷诺数用于判断流动状态是层流、过渡流还是湍流。",
        "达西摩擦系数取决于雷诺数和管壁粗糙度，用于把流速与压降关联起来。",
        "水头损失是流体沿管道因摩擦而损失的单位重量能量。",
      ],
      faq: [
        { q: "达西摩擦系数和 Fanning 摩擦系数有什么区别？", a: "达西-韦斯巴赫公式使用的是达西摩擦系数，其值为 Fanning 摩擦系数的 4 倍。" },
        { q: "可以用于气体吗？", a: "不可压缩近似下可以；长管道或压降较大时需要可压缩流动修正。" },
        { q: "计算器是否包含管件局部损失？", a: "不包含；仅计算沿程摩擦损失。管件局部损失请用局部阻力系数另行计算。" },
      ],
    },
    zhTW: {
      steps: [
        "輸入管道內徑、管長和管材粗糙度。",
        "提供流體物性：密度、動力粘度，以及流量或壓降其中一個。",
        "查看雷諾數、摩擦係數、沿程水頭損失和流速。",
      ],
      explanationTitle: "管道流動的壓降",
      formula: "水頭損失 = f × (L/D) × (v^2 / (2g))；雷諾數 = ρ × v × D / μ",
      explanation: [
        "雷諾數用於判斷流動狀態是層流、過渡流還是湍流。",
        "達西摩擦係數取決於雷諾數和管壁粗糙度，用於把流速與壓降關聯起來。",
        "水頭損失是流體沿管道因摩擦而損失的單位重量能量。",
      ],
      faq: [
        { q: "達西摩擦係數和 Fanning 摩擦係數有什麼區別？", a: "達西-韋斯巴赫公式使用的是達西摩擦係數，其值為 Fanning 摩擦係數的 4 倍。" },
        { q: "可以用於氣體嗎？", a: "不可壓縮近似下可以；長管道或壓降較大時需要可壓縮流動修正。" },
        { q: "計算器是否包含管件局部損失？", a: "不包含；僅計算沿程摩擦損失。管件局部損失請用局部阻力係數另行計算。" },
      ],
    },
    de: {
      steps: [
        "Gib den Innendurchmesser, die Rohrlange und die Rauigkeit des Materials ein.",
        "Gib die Stoffeigenschaften Dichte und dynamische Viskositat an sowie Volumenstrom oder Druckverlust.",
        "Prufe Reynolds-Zahl, Reibungsbeiwert, Druckhohenverlust und Stromungsgeschwindigkeit.",
      ],
      explanationTitle: "Druckverlust in Rohrstromungen",
      formula: "Druckhohenverlust = f × (L/D) × (v^2 / (2g)); Reynolds-Zahl = ρ × v × D / μ",
      explanation: [
        "Die Reynolds-Zahl zeigt, ob die Stromung laminar, transitional oder turbulent ist.",
        "Der Darcy-Reibungsbeiwert hangt von Reynolds-Zahl und Rohrrauigkeit ab und verknupft Geschwindigkeit mit Druckverlust.",
        "Der Druckhohenverlust ist die durch Reibung entlang des Rohrs verlorene Energie pro Gewichtseinheit des Fluids.",
      ],
      faq: [
        { q: "Was ist der Unterschied zwischen Darcy- und Fanning-Reibungsbeiwert?", a: "Darcy-Weisbach verwendet den Darcy-Beiwert, der viermal so gross wie der Fanning-Beiwert ist." },
        { q: "Kann ich es fur Gase verwenden?", a: "Bei inkompressibler Naherung ja; bei langen Rohrleitungen oder grossem Druckverlust sind kompressible Korrekturen notig." },
        { q: "Sind Einzelverluste durch Armaturen enthalten?", a: "Nein; es werden nur Reibungsverluste berechnet. Armaturenverluste musst du getrennt mit Widerstandsbeiwerten addieren." },
      ],
    },
    ja: {
      steps: [
        "配管の内径、長さ、管材の粗さを入力します。",
        "流体物性（密度、動粘性係数）と、流量または圧力損失のどちらかを入力します。",
        "レイノルズ数、摩擦係数、損失水頭、流速を確認します。",
      ],
      explanationTitle: "管路流れの圧力損失",
      formula: "損失水頭 = f × (L/D) × (v^2 / (2g))；レイノルズ数 = ρ × v × D / μ",
      explanation: [
        "レイノルズ数により流れが層流、遷移流、乱流のどれかを判別できます。",
        "ダーシー摩擦係数はレイノルズ数と管の粗さに依存し、流速と圧力損失を関連付けます。",
        "損失水頭は、配管摩擦によって流体の単位重量あたりに失われるエネルギーです。",
      ],
      faq: [
        { q: "ダーシー摩擦係数と Fanning 摩擦係数の違いは？", a: "ダーシー・ワイスバック式ではダーシー摩擦係数を使います。これは Fanning 摩擦係数の 4 倍です。" },
        { q: "気体にも使えますか？", a: "非圧縮近似では使えます。長距離配管や大きな圧力損失では可圧縮流れの補正が必要です。" },
        { q: "バルブや継手の局所損失は含まれますか？", a: "含まれません；沿程摩擦損失のみ計算します。継手損失は損失係数を使って別途加算してください。" },
      ],
    },
    es: {
      steps: [
        "Ingresa el diametro interno de la tuberia, la longitud y la rugosidad del material.",
        "Proporciona las propiedades del fluido: densidad y viscosidad dinamica, mas el caudal o la caida de presion.",
        "Revisa el numero de Reynolds, factor de friccion, perdida de carga y velocidad.",
      ],
      explanationTitle: "Caida de presion en flujo de tuberias",
      formula: "Perdida de carga = f × (L/D) × (v^2 / (2g)); Numero de Reynolds = ρ × v × D / μ",
      explanation: [
        "El numero de Reynolds indica si el flujo es laminar, transicional o turbulento.",
        "El factor de friccion de Darcy depende del numero de Reynolds y la rugosidad de la tuberia; relaciona velocidad y caida de presion.",
        "La perdida de carga es la energia perdida por unidad de peso del fluido debido a la friccion a lo largo de la tuberia.",
      ],
      faq: [
        { q: "Cual es la diferencia entre factor de friccion Darcy y Fanning?", a: "Darcy-Weisbach usa el factor de Darcy, que es cuatro veces el factor de Fanning." },
        { q: "Puedo usarlo para gases?", a: "Si para aproximaciones incompresibles; para tuberias largas o grandes caidas de presion se necesitan correcciones de flujo compresible." },
        { q: "Incluye perdidas menores por accesorios?", a: "No; solo calcula perdidas por friccion mayor. Agrega las perdidas de accesorios por separado con coeficientes de perdida." },
      ],
    },
  },
  "engineering-unit-converter": {
    en: {
      steps: [
        "Select the physical quantity you want to convert, such as force, pressure, stress, torque, density, or energy.",
        "Enter the value and choose the source unit and target unit.",
        "Review the converted value and the conversion factor used.",
      ],
      explanationTitle: "Engineering unit consistency",
      formula: "Result = input_value × (target_unit_in_base / source_unit_in_base)",
      explanation: [
        "Engineering calculations fail when units are mixed; converting everything to a consistent system avoids order-of-magnitude errors.",
        "The SI system uses newtons, pascals, and meters, while the US customary system uses pounds, psi, and inches.",
        "Some units like mass density and specific weight look similar but have different dimensions and must not be interchanged.",
      ],
      faq: [
        { q: "What is the difference between mass and force units?", a: "Mass is measured in kilograms or slugs; force is measured in newtons or pounds. On Earth, weight is a force equal to mass times gravity." },
        { q: "Can I convert between SI and US units?", a: "Yes; the calculator handles common conversions between metric and US customary engineering units." },
        { q: "Why does pressure use both Pa and N/m^2?", a: "Pascal and newton per square meter are the same unit; different names are used in different engineering fields." },
      ],
    },
    zh: {
      steps: [
        "选择要转换的物理量：力、压强、应力、扭矩、密度或能量。",
        "输入数值，选择源单位和目标单位。",
        "查看转换结果和使用的换算系数。",
      ],
      explanationTitle: "工程单位的一致性",
      formula: "结果 = 输入值 × (目标单位以基本单位表示 / 源单位以基本单位表示)",
      explanation: [
        "工程中混合使用不同单位会导致计算错误；把所有量换算到同一单位制可避免数量级错误。",
        "国际单位制使用牛顿、帕斯卡和米；美制工程单位使用磅、psi 和英寸。",
        "一些单位如质量密度和比重看似相近，但量纲不同，不能混用。",
      ],
      faq: [
        { q: "质量和力的单位有什么区别？", a: "质量单位是千克或 slug；力的单位是牛顿或磅。在地球上，重量是力，等于质量乘以重力加速度。" },
        { q: "可以在国际单位制和美制之间转换吗？", a: "可以；计算器支持常见的公制与美制工程单位之间的转换。" },
        { q: "为什么压强同时用 Pa 和 N/m^2？", a: "帕斯卡和牛顿每平方米是同一个单位，只是不同工程领域习惯用不同名称。" },
      ],
    },
    zhTW: {
      steps: [
        "選擇要轉換的物理量：力、壓強、應力、扭矩、密度或能量。",
        "輸入數值，選擇源單位和目標單位。",
        "查看轉換結果和使用的換算係數。",
      ],
      explanationTitle: "工程單位的一致性",
      formula: "結果 = 輸入值 × (目標單位以基本單位表示 / 源單位以基本單位表示)",
      explanation: [
        "工程中混合使用不同單位會導致計算錯誤；把所有量換算到同一單位制可避免數量級錯誤。",
        "國際單位制使用牛頓、帕斯卡和公尺；美制工程單位使用磅、psi 和英吋。",
        "一些單位如質量密度和比重看似相近，但量綱不同，不能混用。",
      ],
      faq: [
        { q: "質量和力的單位有什麼區別？", a: "質量單位是千克或 slug；力的單位是牛頓或磅。在地球上，重量是力，等於質量乘以重力加速度。" },
        { q: "可以在國際單位制和美制之間轉換嗎？", a: "可以；計算器支持常見的公制與美制工程單位之間的轉換。" },
        { q: "為什麼壓強同時用 Pa 和 N/m^2？", a: "帕斯卡和牛頓每平方公尺是同一個單位，只是不同工程領域習慣用不同名稱。" },
      ],
    },
    de: {
      steps: [
        "Wahle die physikalische Grosse, die du umrechnen mochtest: Kraft, Druck, Spannung, Drehmoment, Dichte oder Energie.",
        "Gib den Wert ein und wahle Ausgangs- und Zieleinheit.",
        "Prufe das umgerechnete Ergebnis und den verwendeten Umrechnungsfaktor.",
      ],
      explanationTitle: "Konsistenz technischer Einheiten",
      formula: "Ergebnis = Eingabewert × (Zieleinheit_in_Basis / Ausgangseinheit_in_Basis)",
      explanation: [
        "Ingenieurberechnungen scheitern bei gemischten Einheiten; das Umrechnen in ein konsistentes System vermeidet Grossenordnungsfehler.",
        "Das SI-System nutzt Newton, Pascal und Meter; das US-System nutzt Pfund, psi und Zoll.",
        "Einige Einheiten wie Massendichte und Wichte sehen ahnlich aus, haben aber unterschiedliche Dimensionen und durfen nicht vertauscht werden.",
      ],
      faq: [
        { q: "Was ist der Unterschied zwischen Masse- und Krafteinheiten?", a: "Masse wird in Kilogramm oder Slugs gemessen; Kraft in Newton oder Pfund. Auf der Erde ist Gewicht eine Kraft gleich Masse mal Gravitation." },
        { q: "Kann ich zwischen SI und US-Einheiten umrechnen?", a: "Ja; der Rechner unterstutzt gangige Umrechnungen zwischen metrischen und US-technischen Einheiten." },
        { q: "Warum gibt es Druck sowohl in Pa als auch in N/m^2?", a: "Pascal und Newton pro Quadratmeter sind dieselbe Einheit; verschiedene Fachgebiete nutzen unterschiedliche Namen." },
      ],
    },
    ja: {
      steps: [
        "変換したい物理量を選択：力、圧力、応力、トルク、密度、エネルギーなど。",
        "数値を入力し、変換元単位と変換先単位を選びます。",
        "変換結果と使用された換算係数を確認します。",
      ],
      explanationTitle: "工学単位の整合性",
      formula: "結果 = 入力値 × (基本単位での目標単位 / 基本単位での元単位)",
      explanation: [
        "工学計算では単位の混在が失敗の原因になります。すべてを一貫した単位系に換算することで、桁違いのミスを防げます。",
        "SI 単位系はニュートン、パスカル、メートル；米 customary はポンド、psi、インチを使います。",
        "質量密度と比重量など、似ているようで次元の異なる単位は混同しないようにしてください。",
      ],
      faq: [
        { q: "質量と力の単位の違いは何ですか？", a: "質量の単位は kg や slug；力の単位は N や pound です。地球上では重量は質量×重力加速度で表される力です。" },
        { q: "SI と US 単位の間で変換できますか？", a: "はい；一般的な metric と US customary の工学単位換算に対応しています。" },
        { q: "なぜ圧力に Pa と N/m^2 の両方があるのですか？", a: "パスカルとニュートン毎平方メートルは同じ単位で、分野によって呼び方が異なるだけです。" },
      ],
    },
    es: {
      steps: [
        "Selecciona la cantidad fisica que deseas convertir: fuerza, presion, esfuerzo, torque, densidad o energia.",
        "Ingresa el valor y elige la unidad de origen y destino.",
        "Revisa el valor convertido y el factor de conversion utilizado.",
      ],
      explanationTitle: "Consistencia de unidades de ingenieria",
      formula: "Resultado = valor_entrada × (unidad_destino_en_base / unidad_origen_en_base)",
      explanation: [
        "Los calculos de ingenieria fallan cuando se mezclan unidades; convertir todo a un sistema consistente evita errores de orden de magnitud.",
        "El sistema SI usa newtons, pascales y metros; el sistema estadounidense usa libras, psi y pulgadas.",
        "Algunas unidades como densidad de masa y peso especifico parecen similares pero tienen dimensiones diferentes y no deben intercambiarse.",
      ],
      faq: [
        { q: "Cual es la diferencia entre unidades de masa y fuerza?", a: "La masa se mide en kilogramos o slugs; la fuerza en newtons o libras. En la Tierra, el peso es una fuerza igual a masa por gravedad." },
        { q: "Puedo convertir entre SI y unidades estadounidenses?", a: "Si; el calculador maneja conversiones comunes entre unidades metricas y de ingenieria estadounidense." },
        { q: "Por que la presion usa Pa y N/m^2?", a: "Pascal y newton por metro cuadrado son la misma unidad; se usan diferentes nombres en distintos campos de ingenieria." },
      ],
    },
  },
  "speed": {
    en: {
      steps: [
        "Enter the speed value and select the current unit, such as meters per second or miles per hour.",
        "Choose the target unit for conversion.",
        "Review the converted speed and a few common reference values for context.",
      ],
      explanationTitle: "Speed, velocity, and unit conversion",
      formula: "Speed in target = speed in source × (source_unit_in_mps / target_unit_in_mps)",
      explanation: [
        "Speed is the magnitude of how fast an object moves, while velocity also includes direction.",
        "Common units differ by country and field: km/h for vehicles, m/s for physics, knots for maritime and aviation.",
        "Converting through a base unit like meters per second keeps the math simple and avoids accumulated rounding errors.",
      ],
      faq: [
        { q: "What is the difference between speed and velocity?", a: "Speed is a scalar with magnitude only; velocity is a vector that adds direction to the magnitude." },
        { q: "Why do ships and planes use knots?", a: "A knot is one nautical mile per hour; nautical miles relate directly to latitude, making navigation simpler." },
        { q: "Can I convert between pace and speed?", a: "Yes; pace is the inverse of speed expressed as time per unit distance, such as minutes per kilometer." },
      ],
    },
    zh: {
      steps: [
        "输入速度值并选择当前单位，如米每秒或英里每小时。",
        "选择要转换到的目标单位。",
        "查看转换后的速度，并参考几个常见对照值。",
      ],
      explanationTitle: "速率、速度与单位换算",
      formula: "目标速度 = 源速度 × (源单位换算成 m/s / 目标单位换算成 m/s)",
      explanation: [
        "速率是物体运动快慢的标量大小，速度则还包含方向。",
        "常用单位因国家和领域而异：汽车用 km/h，物理用 m/s，航海和航空用节（knots）。",
        "以 m/s 为基本单位进行换算，可简化计算并避免多次四舍五入带来的累积误差。",
      ],
      faq: [
        { q: "速率和速度有什么区别？", a: "速率是只有大小的标量；速度是加入方向的矢量。" },
        { q: "船舶和飞机为什么用节？", a: "一节等于一海里每小时，而海里与纬度直接相关，便于导航计算。" },
        { q: "可以在配速和速度之间转换吗？", a: "可以；配速是速度的倒数，用每单位距离所需时间表示，例如每公里几分钟。" },
      ],
    },
    zhTW: {
      steps: [
        "輸入速度值並選擇目前單位，如公尺每秒或英里每小時。",
        "選擇要轉換到的目標單位。",
        "查看轉換後的速度，並參考幾個常見對照值。",
      ],
      explanationTitle: "速率、速度與單位換算",
      formula: "目標速度 = 源速度 × (源單位換算成 m/s / 目標單位換算成 m/s)",
      explanation: [
        "速率是物體運動快慢的標量大小，速度則還包含方向。",
        "常用單位因國家和領域而異：汽車用 km/h，物理用 m/s，航海和航空用節（knots）。",
        "以 m/s 為基本單位進行換算，可簡化計算並避免多次四捨五入帶來的累積誤差。",
      ],
      faq: [
        { q: "速率和速度有什麼區別？", a: "速率是只有大小的標量；速度是加入方向的向量。" },
        { q: "船舶和飛機為什麼用節？", a: "一節等於一海里每小時，而海里與緯度直接相關，便於導航計算。" },
        { q: "可以在配速和速度之間轉換嗎？", a: "可以；配速是速度的倒數，用每單位距離所需時間表示，例如每公里幾分鐘。" },
      ],
    },
    de: {
      steps: [
        "Gib den Geschwindigkeitswert ein und wahle die aktuelle Einheit, z. B. Meter pro Sekunde oder Meilen pro Stunde.",
        "Wahle die Zieleinheit fur die Umrechnung.",
        "Prufe die umgerechnete Geschwindigkeit und einige gangige Referenzwerte.",
      ],
      explanationTitle: "Geschwindigkeit, Geschwindigkeitsvektor und Einheitenumrechnung",
      formula: "Zielgeschwindigkeit = Ausgangsgeschwindigkeit × (Ausgangseinheit_in_m/s / Zieleinheit_in_m/s)",
      explanation: [
        "Geschwindigkeit ist der skalare Betrag der Bewegung; der Geschwindigkeitsvektor enthalt zusatzlich die Richtung.",
        "Gangige Einheiten variieren nach Land und Fachgebiet: km/h fur Fahrzeuge, m/s in der Physik, Knoten in Schifffahrt und Luftfahrt.",
        "Die Umrechnung uber eine Basiseinheit wie m/s halt die Rechnung einfach und vermeidet akkumulierte Rundungsfehler.",
      ],
      faq: [
        { q: "Was ist der Unterschied zwischen Geschwindigkeit und Geschwindigkeitsvektor?", a: "Geschwindigkeit ist ein Skalar mit nur einer Grosse; der Vektor fugt eine Richtung hinzu." },
        { q: "Warum nutzen Schiffe und Flugzeuge Knoten?", a: "Ein Knoten ist eine Seemeile pro Stunde; Seemeilen hangen direkt mit der Breite zusammen, was die Navigation vereinfacht." },
        { q: "Kann ich zwischen Pace und Geschwindigkeit umrechnen?", a: "Ja; Pace ist die Umkehrung der Geschwindigkeit, ausgedruckt als Zeit pro Distanz, z. B. Minuten pro Kilometer." },
      ],
    },
    ja: {
      steps: [
        "速度値を入力し、現在の単位（例：メートル毎秒、マイル毎時）を選択します。",
        "変換先の単位を選択します。",
        "変換後の速度といくつかの参考値を確認します。",
      ],
      explanationTitle: "速率、速度と単位換算",
      formula: "目標速度 = 元の速度 × (元の単位を m/s で / 目標単位を m/s で)",
      explanation: [
        "速率は物体の動きの速さを表すスカラー量で、速度には方向も含まれます。",
        "分野や国によって単位が異なります：車両は km/h、物理学は m/s、船舶・航空はノット。",
        "m/s などの基本単位を介して換算することで、計算が単純になり、丸め誤差の蓄積を避けられます。",
      ],
      faq: [
        { q: "速率と速度の違いは何ですか？", a: "速率は大きさだけのスカラーです。速度は大きさに方向を加えたベクトルです。" },
        { q: "なぜ船舶や飛行機はノットを使うのですか？", a: "1 ノットは 1 海里毎時。海里は緯度と直接関係するため、航海計算が簡単になります。" },
        { q: "ペースと速度を相互に換算できますか？", a: "はい。ペースは速度の逆数で、距離あたりの時間（例：1 km あたり何分）で表されます。" },
      ],
    },
    es: {
      steps: [
        "Ingresa el valor de velocidad y selecciona la unidad actual, como metros por segundo o millas por hora.",
        "Elige la unidad de destino para la conversion.",
        "Revisa la velocidad convertida y algunos valores de referencia comunes.",
      ],
      explanationTitle: "Rapidez, velocidad y conversion de unidades",
      formula: "Velocidad destino = velocidad fuente × (unidad_fuente_en_m/s / unidad_destino_en_m/s)",
      explanation: [
        "La rapidez es la magnitud de cuan rapido se mueve un objeto, mientras que la velocidad tambien incluye la direccion.",
        "Las unidades comunes varian por pais y campo: km/h para vehiculos, m/s para fisica, nudos para maritimo y aviacion.",
        "Convertir a traves de una unidad base como metros por segundo simplifica la matematica y evita errores de redondeo acumulados.",
      ],
      faq: [
        { q: "Cual es la diferencia entre rapidez y velocidad?", a: "La rapidez es un escalar con solo magnitud; la velocidad es un vector que anade direccion a la magnitud." },
        { q: "Por que los barcos y aviones usan nudos?", a: "Un nudo es una milla nautica por hora; las millas nauticas se relacionan directamente con la latitud, facilitando la navegacion." },
        { q: "Puedo convertir entre ritmo y velocidad?", a: "Si; el ritmo es el inverso de la velocidad expresado como tiempo por unidad de distancia, como minutos por kilometro." },
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

console.log("Injected 11 tools x 6 languages = 66 guide sets.");