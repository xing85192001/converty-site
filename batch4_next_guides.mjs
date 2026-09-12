// 第四批 A 层深度文案注入：10 个高流量工具 × 6 语言
// 仅新增 converter[id].guide 字段（metaDescription 已存在，不覆盖）
import fs from "fs";

const LANGS = ["en", "zh", "zh-TW", "de", "ja", "es"];
const FILE = (l) => `./src/messages/${l}.json`;

// 工具内容：每语言 { steps:[3], explanationTitle, formula, explanation:[2], faq:[{q,a},{q,a},{q,a}] }
const DATA = {
  "student-loan": {
    en: {
      steps: [
        "Enter your total loan balance, the fixed interest rate, and the repayment term in years.",
        "Choose a plan type if your lender offers standard, extended, or income-driven options.",
        "Read your estimated monthly payment and total interest paid over the life of the loan.",
      ],
      explanationTitle: "How student loan interest works",
      formula: "M = P * r(1+r)^n / ((1+r)^n - 1), where r = monthly rate, n = months",
      explanation: [
        "Student loans accrue interest daily on the unpaid principal using the simple daily interest method: daily interest = balance x (annual rate / 365).",
        "Paying more than the minimum or making extra payments early reduces the principal faster, which cuts total interest because interest is always calculated on the remaining balance.",
      ],
      faq: [
        { q: "Should I pay off student loans early?", a: "If the rate is high and you have no higher-interest debt, extra payments save interest. Keep an emergency fund and any employer match first." },
        { q: "What is an income-driven plan?", a: "It caps your monthly payment at a percentage of discretionary income and may forgive the balance after 20 to 25 years, though forgiven amounts can be taxable." },
        { q: "Are payments tax deductible?", a: "In some countries interest is deductible up to a limit; check your local rules, as treatment varies by jurisdiction." },
      ],
    },
    zh: {
      steps: [
        "输入贷款总余额、固定利率以及还款年限。",
        "如果放款方提供标准、延长或按收入调整等方案，选择对应类型。",
        "查看估算的每月还款额，以及贷款期限内支付的总利息。",
      ],
      explanationTitle: "学生贷款利息如何计算",
      formula: "M = P * r(1+r)^n / ((1+r)^n - 1)，其中 r 为月利率，n 为月数",
      explanation: [
        "学生贷款按未还本金以「每日单利」计息：每日利息 = 余额 ×（年利率 / 365）。",
        "提前多还或早期额外还款能更快降低本金，从而减少总利息，因为利息始终按剩余本金计算。",
      ],
      faq: [
        { q: "应该提前还清学生贷款吗？", a: "若利率较高且没有更高息债务，额外还款能省利息。但应先保留应急资金并缴满雇主配比。" },
        { q: "按收入调整方案是什么？", a: "它把月供封顶为可支配收入的一定比例，并在 20 至 25 年后可能免除剩余本金，但免除金额可能需纳税。" },
        { q: "还款可以抵税吗？", a: "部分国家对利息在一定额度内允许抵扣，具体以当地规定为准，各地处理不同。" },
      ],
    },
    zhTW: {
      steps: [
        "輸入貸款總餘額、固定利率以及還款年限。",
        "若放款方提供標準、延長或按收入調整等方案，選擇對應類型。",
        "查看估算的每月還款額，以及貸款期限內支付的總利息。",
      ],
      explanationTitle: "學生貸款利息如何計算",
      formula: "M = P * r(1+r)^n / ((1+r)^n - 1)，其中 r 為月利率，n 為月數",
      explanation: [
        "學生貸款按未還本金以「每日單利」計息：每日利息 = 餘額 ×（年利率 / 365）。",
        "提前多還或早期額外還款能更快降低本金，從而減少總利息，因為利息始終按剩餘本金計算。",
      ],
      faq: [
        { q: "應該提前還清學生貸款嗎？", a: "若利率較高且無更高息債務，額外還款能省利息。但應先保留應急資金並繳滿雇主配比。" },
        { q: "按收入調整方案是什麼？", a: "它把月供封頂為可支配收入的一定比例，並在 20 至 25 年後可能免除剩餘本金，但免除金額可能需納稅。" },
        { q: "還款可以抵稅嗎？", a: "部分國家對利息在一定額度內允許抵扣，具體以當地規定為準，各地處理不同。" },
      ],
    },
    de: {
      steps: [
        "Geben Sie den gesamten Darlehenssaldo, den festen Zinssatz und die Laufzeit in Jahren ein.",
        "Wahlen Sie eine Planeart, falls die Bank Standard-, verlangerte oder einkommensabhängige Optionen anbietet.",
        "Lesen Sie die geschatzte monatliche Rate und die gesamten Zinskosten uber die Laufzeit.",
      ],
      explanationTitle: "So funktionieren Studienkreditzinsen",
      formula: "M = P * r(1+r)^n / ((1+r)^n - 1), r = Monatszins, n = Monate",
      explanation: [
        "Studienkredite berechnen taglich Zinsen auf den offenen Saldo nach der einfachen Tageszinsmethode: Tageszins = Saldo x (Jahreszins / 365).",
        "Hohere oder fruhe Sonderzahlungen senken den Saldo schneller und damit die Gesamtzinsen, da Zinsen immer auf den Restsaldo berechnet werden.",
      ],
      faq: [
        { q: "Sollte ich den Studienkredit fruh zuruckzahlen?", a: "Bei hohem Zins und keinen teureren Schulden sparen Sonderzahlungen Zinsen. Erst Notgroschen und Arbeitgeberzuschuss sichern." },
        { q: "Was ist ein einkommensabhangiger Plan?", a: "Er deckelt die Monatsrate auf einen Prozentsatz des verfugbaren Einkommens und kann nach 20 bis 25 Jahren erlassen, wobei der Erlass steuerpflichtig sein kann." },
        { q: "Sind Zahlungen steuerlich absetzbar?", a: "In einigen Landern sind Zinsen bis zu einer Grenze absetzbar; prufen Sie die lokalen Regeln, da sie variieren." },
      ],
    },
    ja: {
      steps: [
        "ローン残高の合計、固定金利、返済年数を入力します。",
        "貸与機関が標準・延長・所得連動などのプランを提供している場合は、種類を選択します。",
        "概算の毎月の返済額と、完済までに支払う総利息を確認します。",
      ],
      explanationTitle: "奨学金ローンの利息の仕組み",
      formula: "M = P * r(1+r)^n / ((1+r)^n - 1)、r = 月利、n = 月数",
      explanation: [
        "奨学金ローンは未返済元本に対して「日単利」で毎日利息が付きます。日次利息 = 残高 ×（年率 / 365）。",
        "最低額を超える支払いや早期の繰り上げ返済は元本を早く減らすため、総利息を抑えられます。利息は常に残高に対して計算されるためです。",
      ],
      faq: [
        { q: "奨学金は早めに完済すべき？", a: "金利が高くそれより高い借金がなければ、繰り上げ返済で利息を節約できます。まずは緊急資金と雇用主のマッチングを確保してください。" },
        { q: "所得連動型プランとは？", a: "月額を可処分所得の一定割合に抑え、20〜25年後に残額を免除する場合がありますが、免除額に課税されることもあります。" },
        { q: "返済は控除対象？", a: "国によっては一定限度まで利息が控除されます。取り扱いは地域により異なるため地元の規則を確認してください。" },
      ],
    },
    es: {
      steps: [
        "Introduce el saldo total del prestamo, el tipo de interes fijo y el plazo de amortizacion en anos.",
        "Elige un tipo de plan si tu entidad ofrece opciones estandar, ampliadas o basadas en ingresos.",
        "Lee tu pago mensual estimado y el interes total pagado durante la vida del prestamo.",
      ],
      explanationTitle: "Como funcionan los intereses de los prestamos estudiantiles",
      formula: "M = P * r(1+r)^n / ((1+r)^n - 1), r = tipo mensual, n = meses",
      explanation: [
        "Los prestamos estudiantiles acumulan interes diario sobre el principal pendiente con el metodo de interes simple diario: interes diario = saldo x (tipo anual / 365).",
        "Pagar mas de la cuota minima o hacer aportes extra al principio reduce el principal mas rapido y recorta el interes total, porque siempre se calcula sobre el saldo restante.",
      ],
      faq: [
        { q: "Deberia pagar el prestamo estudiantil antes?", a: "Si el tipo es alto y no tienes deudas mas caras, los pagos extra ahorran intereses. Primero guarda un fondo de emergencia y aprovecha la aportacion de tu empleador." },
        { q: "Que es un plan basado en ingresos?", a: "Limita tu pago mensual a un porcentaje de los ingresos disponibles y puede condonar el saldo tras 20 a 25 anos, aunque la cantidad condonada puede tributar." },
        { q: "Los pagos son deducibles?", a: "En algunos paises los intereses son deducibles hasta un limite; consulta tus normas locales, ya que varia segun el pais." },
      ],
    },
  },

  "home-equity": {
    en: {
      steps: [
        "Enter your home's current market value and the total balances of any mortgages or liens.",
        "Pick the loan-to-value limit your lender allows, often 80 to 85 percent.",
        "Read the usable equity and the maximum home-equity loan or line of credit available.",
      ],
      explanationTitle: "What home equity means",
      formula: "Equity = Home value - Outstanding mortgage; Usable = Equity x LTV limit",
      explanation: [
        "Equity is the portion of the home you own outright. It grows as you repay the mortgage and as the property's market value rises.",
        "Lenders usually let you borrow only a fraction of equity to keep a safety buffer, and they require an appraisal to confirm the current value.",
      ],
      faq: [
        { q: "What is the difference between a HELOC and a home-equity loan?", a: "A HELOC is a revolving line you draw from as needed; a home-equity loan is a lump sum with fixed payments." },
        { q: "Can I lose my home?", a: "Yes. Both are secured by the property, so missed payments can lead to foreclosure. Borrow only what you can repay." },
        { q: "Is the interest tax deductible?", a: "Interest on money used for substantial home improvements may be deductible in some jurisdictions; consult a local tax professional." },
      ],
    },
    zh: {
      steps: [
        "输入房屋当前市场价值，以及所有房贷或留置权的总余额。",
        "选择放款方允许的贷款价值比上限，通常为 80% 至 85%。",
        "查看可用净值，以及可申请的房屋净值贷款或信用额度上限。",
      ],
      explanationTitle: "房屋净值是什么",
      formula: "净值 = 房屋价值 - 未还房贷；可用 = 净值 × 贷款价值比上限",
      explanation: [
        "净值是你完全拥有的那部分房产。随着房贷偿还和房产市场价值上升，净值会增长。",
        "放款方通常只让你借用净值的一部分以保留安全缓冲，并且会要求评估来确认当前价值。",
      ],
      faq: [
        { q: "房屋净值信用额度（HELOC）和房屋净值贷款有什么区别？", a: "HELOC 是可随用随取的循环额度；房屋净值贷款则是一次性发放、固定还款的款项。" },
        { q: "我会失去房子吗？", a: "会。两者都以房产作抵押，逾期还款可能导致止赎。只借还得起的部分。" },
        { q: "利息可以抵税吗？", a: "用于重大房屋装修的借款利息在部分地区可能抵扣，请咨询当地税务专业人士。" },
      ],
    },
    zhTW: {
      steps: [
        "輸入房屋目前市場價值，以及所有房貸或留置權的總餘額。",
        "選擇放款方允許的貸款價值比上限，通常為 80% 至 85%。",
        "查看可用淨值，以及可申請的房屋淨值貸款或信用額度上限。",
      ],
      explanationTitle: "房屋淨值是什麼",
      formula: "淨值 = 房屋價值 - 未還房貸；可用 = 淨值 × 貸款價值比上限",
      explanation: [
        "淨值是你完全擁有的那部分房產。隨著房貸償還和房產市場價值上升，淨值會成長。",
        "放款方通常只讓你借用淨值的一部分以保留安全緩衝，並且會要求估價來確認目前價值。",
      ],
      faq: [
        { q: "房屋淨值信用額度（HELOC）和房屋淨值貸款有什麼區別？", a: "HELOC 是可隨用隨取的循環額度；房屋淨值貸款則是一次發放、固定還款的款項。" },
        { q: "我會失去房子嗎？", a: "會。兩者都以房產作抵押，逾期還款可能導致止贖。只借還得起的部分。" },
        { q: "利息可以抵稅嗎？", a: "用於重大房屋裝修的借款利息在部分地區可能抵扣，請諮詢當地稅務專業人士。" },
      ],
    },
    de: {
      steps: [
        "Geben Sie den aktuellen Marktwert der Immobilie und die gesamten Salden aller Hypotheken oder Pfandrechte ein.",
        "Wahlen Sie die zulassige Beleihungsgrenze, oft 80 bis 85 Prozent.",
        "Lesen Sie das verfugbare Eigenkapital und den maximalen Hauskredit oder die Kreditlinie.",
      ],
      explanationTitle: "Was Wohneigentumskapital bedeutet",
      formula: "Eigenkapital = Immobilienwert - Offene Hypothek; Verfugbar = Eigenkapital x Beleihungsgrenze",
      explanation: [
        "Eigenkapital ist der Anteil, den Sie voll besitzen. Er wachst, wenn Sie die Hypothek tilgen und der Marktwert steigt.",
        "Banken lassen meist nur einen Teil beleihen, um einen Puffer zu halten, und verlangen eine Bewertung zur Bestatigung des Werts.",
      ],
      faq: [
        { q: "Was unterscheidet HELOC und Hauskredit?", a: "Ein HELOC ist eine revolvierende Linie, die Sie bei Bedarf nutzen; ein Hauskredit ist eine Summe mit festen Raten." },
        { q: "Kann ich das Haus verlieren?", a: "Ja. Beide sind durch die Immobilie besichert; ausfallende Zahlungen konnen zur Zwangsversteigerung fuhren. Leihen Sie nur, was Sie zuruckzahlen konnen." },
        { q: "Sind die Zinsen steuerlich absetzbar?", a: "Zinsen fur umfangreiche Hausverbesserungen konnen in einigen Landern absetzbar sein; fragen Sie einen lokalen Steuerberater." },
      ],
    },
    ja: {
      steps: [
        "住宅の現在の市場価値と、すべての住宅ローンや抵当権の残高合計を入力します。",
        "貸出側が認める借入価値比の上限（多くは 80〜85%）を選びます。",
        "利用可能なエクイティと、申請できる住宅エクイティローンまたは枠の上限を確認します。",
      ],
      explanationTitle: "住宅エクイティ（持分）とは",
      formula: "エクイティ = 住宅価値 - 残ローン；利用可 = エクイティ × 借入価値比上限",
      explanation: [
        "エクイティはあなたが完全に持っている部分です。ローンの返済や市場価値の上昇とともに増えます。",
        "貸出側は安全余裕を残すためエクイティの一部だけを貸すのが通例で、現在の価値を確認するため鑑定を求めます。",
      ],
      faq: [
        { q: "HELOC と住宅エクイティローンの違いは？", a: "HELOC は必要な分だけ引き出すリボルビング枠です。住宅エクイティローンは一括貸付で返済は固定です。" },
        { q: "家を失うおそれは？", a: "あります。どちらも不動産を担保にしているため、滞納で差押えになることがあります。返済できる分だけ借りてください。" },
        { q: "利息は控除対象？", a: "大規模な住宅改修に使った借入の利息は一部の国で控除対象になる場合があります。地元の税理士に相談を。" },
      ],
    },
    es: {
      steps: [
        "Introduce el valor de mercado actual de la vivienda y los saldos totales de hipotecas o gravamenes.",
        "Elige el limite de loan-to-value que permita tu entidad, normalmente 80 a 85 por ciento.",
        "Lee el capital disponible y el maximo prestamo o linea de credito hipotecario disponible.",
      ],
      explanationTitle: "Que significa el capital de la vivienda",
      formula: "Capital = Valor de la casa - Hipoteca pendiente; Disponible = Capital x limite LTV",
      explanation: [
        "El capital es la parte de la vivienda que posees por completo. Crece al amortizar la hipoteca y cuando sube el valor de mercado.",
        "Los prestamistas suelen dejarte usar solo una fraccion del capital como colchon de seguridad, y exigen una tasacion para confirmar el valor.",
      ],
      faq: [
        { q: "Cual es la diferencia entre una HELOC y un prestamo con garantia?", a: "La HELOC es una linea revolvente que usas segun necesites; el prestamo es un pago unico con cuotas fijas." },
        { q: "Puedo perder mi casa?", a: "Si. Ambos estan garantizados con el inmueble, asi que los impagos pueden llevar a un desahucio. Pide solo lo que puedas devolver." },
        { q: "Los intereses son deducibles?", a: "Los intereses de dinero usado en mejoras importantes de la casa pueden ser deducibles en algunos paises; consulta a un asesor fiscal local." },
      ],
    },
  },

  "down-payment": {
    en: {
      steps: [
        "Enter the home price you are considering and your target down-payment percentage.",
        "Add your available savings to compare against the required amount.",
        "See the dollar down payment needed and whether you meet common 20 percent thresholds that avoid mortgage insurance.",
      ],
      explanationTitle: "Why the down payment matters",
      formula: "Down payment = Home price x percentage; Loan = Home price - Down payment",
      explanation: [
        "A larger down payment lowers the loan amount, reduces monthly payments, and can remove the need for private mortgage insurance.",
        "Smaller down payments are allowed by many programs but usually cost more over time through insurance and interest on a bigger loan.",
      ],
      faq: [
        { q: "Is 20 percent always required?", a: "No. Many loans allow 3 to 5 percent down, but below 20 percent you typically pay mortgage insurance until you build enough equity." },
        { q: "Should I drain savings for a bigger down payment?", a: "Keep a reserve for closing costs and emergencies; an empty emergency fund is riskier than a slightly smaller down payment." },
        { q: "Do gifts count toward the down payment?", a: "Lenders often accept gifted funds but require a signed gift letter stating the money need not be repaid." },
      ],
    },
    zh: {
      steps: [
        "输入你考虑购买的房价，以及目标首付比例。",
        "加上你可用的储蓄，与所需金额进行对比。",
        "查看需要的首付金额，以及是否达到常见的 20% 门槛（可免房贷保险）。",
      ],
      explanationTitle: "首付为什么重要",
      formula: "首付 = 房价 × 比例；贷款 = 房价 - 首付",
      explanation: [
        "首付越高，贷款额越低，月供越少，并可能免去私人房贷保险。",
        "许多方案允许较低首付，但通常因保险和更大贷款的利息而长期成本更高。",
      ],
      faq: [
        { q: "一定要付 20% 吗？", a: "不一定。许多贷款允许 3% 至 5% 首付，但低于 20% 通常要缴房贷保险，直到积累足够净值。" },
        { q: "该掏空储蓄凑更高首付吗？", a: "应为过户费和应急保留一笔储备；应急基金归零比略低的首付风险更大。" },
        { q: "赠与款项算首付吗？", a: "放款方通常接受赠与资金，但要求签署赠与函，说明该款项无需偿还。" },
      ],
    },
    zhTW: {
      steps: [
        "輸入你考慮購買的房價，以及目標首付比例。",
        "加上你可用的儲蓄，與所需金額進行對比。",
        "查看需要的首付金額，以及是否達到常見的 20% 門檻（可免房貸保險）。",
      ],
      explanationTitle: "首付為什麼重要",
      formula: "首付 = 房價 × 比例；貸款 = 房價 - 首付",
      explanation: [
        "首付越高，貸款額越低，月供越少，並可能免去私人房貸保險。",
        "許多方案允許較低首付，但通常因保險和更大貸款的利息而長期成本更高。",
      ],
      faq: [
        { q: "一定要付 20% 嗎？", a: "不一定。許多貸款允許 3% 至 5% 首付，但低於 20% 通常要繳房貸保險，直到累積足夠淨值。" },
        { q: "該掏空儲蓄湊更高首付嗎？", a: "應為過戶費和應急保留一筆儲備；應急基金歸零比略低的首付風險更大。" },
        { q: "贈與款項算首付嗎？", a: "放款方通常接受贈與資金，但要求簽署贈與函，說明該款項無需償還。" },
      ],
    },
    de: {
      steps: [
        "Gib den erwogenen Hauspreis und deinen geplanten Anteil in Prozent ein.",
        "Fuge deine verfugbaren Ersparnisse hinzu, um sie mit dem benotigten Betrag zu vergleichen.",
        "Sieh den benotigten Betrag und ob du die ubliche 20-Prozent-Schwelle erreichst, die eine Versicherung erspart.",
      ],
      explanationTitle: "Warum die Anzahlung wichtig ist",
      formula: "Anzahlung = Hauspreis x Prozent; Darlehen = Hauspreis - Anzahlung",
      explanation: [
        "Eine hohere Anzahlung senkt den Darlehensbetrag, reduziert die Monatsrate und kann die private Hypothekenversicherung uberflussig machen.",
        "Kleinere Anzahlungen sind bei vielen Programmen erlaubt, kosten aber langfristig mehr durch Versicherung und Zinsen auf ein großeres Darlehen.",
      ],
      faq: [
        { q: "Sind immer 20 Prozent notig?", a: "Nein. Viele Darlehen erlauben 3 bis 5 Prozent, aber unter 20 Prozent zahlst du meist eine Versicherung, bis genug Eigenkapital da ist." },
        { q: "Sollte ich Ersparnisse fur eine hohere Anzahlung aufbrauchen?", a: "Behalte eine Reserve fur Nebenkosten und Notfalle; ein leerer Notgroschen ist riskanter als eine etwas kleinere Anzahlung." },
        { q: "Zahlen Schenkungen zur Anzahlung?", a: "Banken akzeptieren oft geschenktes Geld, verlangen aber ein Schenkungsschreiben, das die Ruckzahlungsfreiheit bestatigt." },
      ],
    },
    ja: {
      steps: [
        "検討中の物件価格と、目標とする頭金の割合を入力します。",
        "利用可能な貯金を加えて、必要額と比較します。",
        "必要な頭金額と、住宅ローン保険が不要になる目安の 20% に達しているかを確認します。",
      ],
      explanationTitle: "頭金が重要な理由",
      formula: "頭金 = 房价 × 割合；ローン = 房价 - 頭金",
      explanation: [
        "頭金が多いほどローン額が下がり、月々の支払いが減り、私人住宅ローン保険が不要になることもあります。",
        "多くの制度は低い頭金を認めますが、保険料と大きなローンへの利息で長期的には通常コストが高くなります。",
      ],
      faq: [
        { q: "20% は必須？", a: "いいえ。多くのローンは 3〜5% の頭金を認めますが、20% 未満では十分な持分ができるまで保険料を払うのが通例です。" },
        { q: "頭金を増やすために貯金を使い切るべき？", a: "引越し費用や急用のための予備は残してください。予備がゼロなのは、やや低い頭金よりリスクが大きいです。" },
        { q: "贈与金は頭金に算入される？", a: "貸出側は贈与資金を認めることが多いですが、返済不要である旨の贈与証明書を求めます。" },
      ],
    },
    es: {
      steps: [
        "Introduce el precio de la vivienda que consideras y el porcentaje de entrada que buscas.",
        "Anade tus ahorros disponibles para compararlos con el importe necesario.",
        "Ve el importe de la entrada necesaria y si alcanzas el umbral comun del 20 por ciento que evita el seguro hipotecario.",
      ],
      explanationTitle: "Por que importa la entrada",
      formula: "Entrada = Precio x porcentaje; Prestamo = Precio - Entrada",
      explanation: [
        "Una entrada mayor reduce el importe del prestamo, baja la cuota mensual y puede eliminar la necesidad del seguro de hipoteca privado.",
        "Las entradas mas pequenas son admitidas por muchos programas pero suelen costar mas a largo plazo por el seguro y los intereses de un prestamo mayor.",
      ],
      faq: [
        { q: "Siempre se exige el 20 por ciento?", a: "No. Muchos prestamos admiten un 3 a 5 por ciento, pero por debajo del 20 por ciento normalmente pagas seguro hasta acumular suficiente capital." },
        { q: "Debo vaciar ahorros para una entrada mayor?", a: "Conserva una reserva para gastos de cierre y emergencias; un fondo de emergencia vacio es mas arriesgado que una entrada algo menor." },
        { q: "Cuentan los regalos como entrada?", a: "Los prestamistas suelen aceptar fondos regalados pero exigen una carta de donacion que confirme que no debe devolverse." },
      ],
    },
  },

  "retirement-401k": {
    en: {
      steps: [
        "Enter your current age, planned retirement age, salary, and current 401(k) balance.",
        "Add your contribution rate and any employer match percentage.",
        "Read the projected balance at retirement and the estimated annual income it could provide.",
      ],
      explanationTitle: "How compounding builds a 401(k)",
      formula: "Future value = P(1+r)^n + C x (((1+r)^n - 1) / r)",
      explanation: [
        "A 401(k) grows tax-deferred, so returns reinvest without annual tax drag, and employer matching is effectively free money added to your balance.",
        "Starting earlier matters more than the amount: contributions in your 20s compound for decades, often outweighing larger late-career contributions.",
      ],
      faq: [
        { q: "How much should I contribute?", a: "Aim to capture the full employer match first, then raise toward 10 to 15 percent of salary as you are able." },
        { q: "What is the employer match?", a: "Many employers match a percentage of your contributions up to a limit; not contributing leaves that money on the table." },
        { q: "Can I withdraw early?", a: "Early withdrawals usually trigger taxes and a penalty; some plans allow loans or hardship exceptions with restrictions." },
      ],
    },
    zh: {
      steps: [
        "输入当前年龄、计划退休年龄、薪资，以及当前 401(k) 账户余额。",
        "加上你的缴费比例，以及雇主的任何配比百分比。",
        "查看退休时的预计余额，以及它能提供的估算年收入和。",
      ],
      explanationTitle: "复利如何壮大 401(k)",
      formula: "未来价值 = P(1+r)^n + C × (((1+r)^n - 1) / r)",
      explanation: [
        "401(k) 以税后递延方式增长，收益再投资不受每年税收拖累，而雇主配比实质是加到账户里的免费资金。",
        "尽早开始比金额大小更重要：二十多岁投入的款项会复利数十年，往往超过临近退休时更大的投入。",
      ],
      faq: [
        { q: "我应该缴多少？", a: "先确保拿满雇主配比，之后在能力范围内逐步提高到薪资的 10% 至 15%。" },
        { q: "雇主配比是什么？", a: "许多雇主会按你缴费的一定比例、在限额内配对出资；不缴费等于放弃这笔钱。" },
        { q: "可以提前取吗？", a: "提前提取通常会触发补税和罚金；部分计划允许贷款或困难例外，但限制较多。" },
      ],
    },
    zhTW: {
      steps: [
        "輸入目前年齡、計畫退休年齡、薪資，以及目前 401(k) 帳戶餘額。",
        "加上你的繳費比例，以及雇主的任何配比百分比。",
        "查看退休時的預計餘額，以及它能提供的估算年收入和。",
      ],
      explanationTitle: "複利如何壯大 401(k)",
      formula: "未來價值 = P(1+r)^n + C × (((1+r)^n - 1) / r)",
      explanation: [
        "401(k) 以稅後遞延方式成長，收益再投資不受每年稅收拖累，而雇主配比實質是加到帳戶裡的免費資金。",
        "盡早開始比金額大小更重要：二十多歲投入的款項會複利數十年，往往超過臨近退休時更大的投入。",
      ],
      faq: [
        { q: "我應該繳多少？", a: "先確保拿滿雇主配比，之後在能力範圍內逐步提高至薪資的 10% 至 15%。" },
        { q: "雇主配比是什麼？", a: "許多雇主會按你繳費的一定比例、在限額內配對出資；不繳費等於放棄這筆錢。" },
        { q: "可以提前取嗎？", a: "提前提取通常會觸發補稅和罰金；部分計畫允許貸款或困難例外，但限制較多。" },
      ],
    },
    de: {
      steps: [
        "Gib dein aktuelles Alter, das geplante Rentenalter, dein Gehalt und das aktuelle 401(k)-Guthaben ein.",
        "Fuge deinen Sparbeitrag und eine eventuelle Arbeitgeberzuwendung in Prozent hinzu.",
        "Lies den projizierten Kontostand im Ruhestand und die geschatzte jahrliche Einkommenssumme.",
      ],
      explanationTitle: "Wie Zinseszins einen 401(k) aufbaut",
      formula: "Zukunftswert = P(1+r)^n + C x (((1+r)^n - 1) / r)",
      explanation: [
        "Ein 401(k) wachst steuerdeferiert, sodass Ertrage ohne jahrliche Steuerlast reinvestiert werden, und die Arbeitgeberzuwendung ist effektiv kostenloses Geld.",
        "Fruher starten zahlt mehr als die Hohe: Beitrage mit 20 verzinsen jahrzehntelang und uberwiegen oft spatere große Einzahlungen.",
      ],
      faq: [
        { q: "Wie viel sollte ich einzahlen?", a: "Sichere zuerst die volle Arbeitgeberzuwendung, dann steigere auf 10 bis 15 Prozent des Gehalts, soweit moglich." },
        { q: "Was ist die Arbeitgeberzuwendung?", a: "Viele Arbeitgeber gleichen einen Prozentsatz deiner Beitrage bis zu einer Grenze ab; wer nicht einzahlt, lasst das Geld liegen." },
        { q: "Kann ich fruh entnehmen?", a: "Fruhe Entnahmen lost meist Steuern und eine Strafe aus; einige Plane erlauben Kredite oder Notfallausnahmen mit Auflagen." },
      ],
    },
    ja: {
      steps: [
        "現在の年齢、予定する退職年齢、給与、および現在の 401(k) 残高を入力します。",
        "自身の拠出率と、雇用主のマッチング率（あれば）を加えます。",
        "退職時の予想残高と、そこから得られる概算の年収相當額を確認します。",
      ],
      explanationTitle: "複利が 401(k) を育てる仕組み",
      formula: "将来価値 = P(1+r)^n + C × (((1+r)^n - 1) / r)",
      explanation: [
        "401(k) は税延長で運用され、利益が毎年の税金に引っ張られず再投資されます。雇用主のマッチングは実質的に口座に加わる無料の資金です。",
        "早く始めることは額より重要です。20代の拠出は数十年複利で伸び、後半の大きな拠出を上回ることが少なくありません。",
      ],
      faq: [
        { q: "いくら拠出すべき？", a: "まず雇用主のマッチング上限を満額にし、その上で可能な範囲で給与の 10〜15% へ引き上げましょう。" },
        { q: "雇用主マッチングとは？", a: "多くの雇用主が一定限度まで拠出額の一部を上乗せします。拠出しないとこの資金を放棄することになります。" },
        { q: "早期引出しは可能？", a: "早期引出しは通常税金とペナルティを誘発します。一部のプランは制限付きで借入や困窮例外を認めます。" },
      ],
    },
    es: {
      steps: [
        "Introduce tu edad actual, la edad prevista de jubilacion, el salario y el saldo actual de tu 401(k).",
        "Anade tu tasa de aportacion y cualquier equivalente del empleador en porcentaje.",
        "Lee el saldo proyectado al jubilarte y los ingresos anuales estimados que podria aportar.",
      ],
      explanationTitle: "Como el interes compuesto construye un 401(k)",
      formula: "Valor futuro = P(1+r)^n + C x (((1+r)^n - 1) / r)",
      explanation: [
        "Un 401(k) crece con impuestos diferidos, asi que los rendimientos se reinvierten sin el arrastre fiscal anual, y la aportacion del empleador es dinero gratis en tu saldo.",
        "Empezar antes importa mas que la cantidad: las aportaciones a los 20 anos acumulan decadas de interes compuesto, y suelen superar aportaciones mayores cercanas a la jubilacion.",
      ],
      faq: [
        { q: "Cuanto debo aportar?", a: "Primero asegura la aportacion completa del empleador y luego sube hacia un 10 a 15 por ciento del salario segun puedas." },
        { q: "Que es la aportacion del empleador?", a: "Muchos empleadores igualan un porcentaje de tus aportaciones hasta un limite; no aportar deja ese dinero sobre la mesa." },
        { q: "Puedo retirar antes?", a: "Las retiradas anticipadas suelen generar impuestos y una penalizacion; algunos planes permiten prestamos o excepciones por dificultad con restricciones." },
      ],
    },
  },

  "healthy-weight": {
    en: {
      steps: [
        "Enter your height, weight, age, and sex assigned at birth.",
        "Choose the formula set if multiple are offered for your region.",
        "Read your healthy weight range and where you currently fall within it.",
      ],
      explanationTitle: "Healthy weight ranges, not single numbers",
      formula: "Based on BMI 18.5 to 24.9 mapped back to weight = BMI x height^2",
      explanation: [
        "Healthy weight is shown as a range because a single number ignores body composition; muscle, bone, and frame size all shift what is right for you.",
        "The range is a screening guide, not a diagnosis. Athletes and older adults especially should also consider body fat and waist circumference.",
      ],
      faq: [
        { q: "Why a range and not one weight?", a: "People of the same height differ in muscle and bone, so a band captures normal variation better than a point." },
        { q: "Is BMI enough?", a: "It is a useful screen but misses body composition; pair it with waist measurement and fitness." },
        { q: "Does the range differ by ethnicity?", a: "Some guidelines use lower cut-offs for certain populations; check local public-health advice." },
      ],
    },
    zh: {
      steps: [
        "输入身高、体重、年龄，以及出生时指定的生理性别。",
        "如果所在地区提供多套公式，选择对应的一套。",
        "查看健康体重区间，以及你当前落在区间的哪个位置。",
      ],
      explanationTitle: "健康体重是一个区间，而非单一数字",
      formula: "基于 BMI 18.5 至 24.9 反推：体重 = BMI × 身高²",
      explanation: [
        "健康体重以区间呈现，因为单一数字忽略了身体成分；肌肉、骨骼和骨架大小都会改变适合你的数值。",
        "区间只是筛查参考，不是诊断。运动员和老年人尤其应同时考虑体脂率和腰围。",
      ],
      faq: [
        { q: "为什么是区间而不是一个体重？", a: "同身高的人肌肉和骨骼不同，区间比单点更能涵盖正常差异。" },
        { q: "只看 BMI 够吗？", a: "它是好用的筛查，但看不出身体成分；应结合腰围和体能一起判断。" },
        { q: "区间会因族群而异吗？", a: "部分指南对某些人群采用更低的分界值，请参考当地公共卫生建议。" },
      ],
    },
    zhTW: {
      steps: [
        "輸入身高、體重、年齡，以及出生時指定的生理性別。",
        "如果所在地區提供多套公式，選擇對應的一套。",
        "查看健康體重區間，以及你目前落在區間的哪個位置。",
      ],
      explanationTitle: "健康體重是一個區間，而非單一數字",
      formula: "基於 BMI 18.5 至 24.9 反推：體重 = BMI × 身高²",
      explanation: [
        "健康體重以區間呈現，因為單一數字忽略了身體成分；肌肉、骨骼和骨架大小都會改變適合你的數值。",
        "區間只是篩查參考，不是診斷。運動員和老年人尤其應同時考慮體脂率和腰圍。",
      ],
      faq: [
        { q: "為什麼是區間而不是一個體重？", a: "同身高的人肌肉和骨骼不同，區間比單點更能涵蓋正常差異。" },
        { q: "只看 BMI 夠嗎？", a: "它是好用的篩查，但看不出身體成分；應結合腰圍和體能一起判斷。" },
        { q: "區間會因族裔而異嗎？", a: "部分指南對某些人群採用更低的分界值，請參考當地公共衛生建議。" },
      ],
    },
    de: {
      steps: [
        "Gib Grose, Gewicht, Alter und das bei der Geburt zugewiesene Geschlecht ein.",
        "Wahle den Formelsatz, falls fur deine Region mehrere angeboten werden.",
        "Lies deinen gesunden Gewichtsbereich und wo du darin aktuell liegst.",
      ],
      explanationTitle: "Gesundes Gewicht ist ein Bereich, keine Zahl",
      formula: "Basiert auf BMI 18,5 bis 24,9 zuruckgerechnet: Gewicht = BMI x Grose^2",
      explanation: [
        "Gesundes Gewicht wird als Bereich gezeigt, weil eine einzelne Zahl die Korperzusammensetzung ignoriert; Muskeln, Knochen und Rahmen verschieben das Richtige fur dich.",
        "Der Bereich ist eine Screening-Hilfe, keine Diagnose. Sportler und altere Menschen sollten zusatzlich Korperfett und Taillenumfang beachten.",
      ],
      faq: [
        { q: "Warum ein Bereich und nicht ein Gewicht?", a: "Gleich große Menschen unterscheiden sich in Muskel und Knochen, daher erfasst eine Bandbreite die normale Streuung besser." },
        { q: "Reicht der BMI?", a: "Er ist ein nutzlicher Screen, aber erfasst die Korperzusammensetzung nicht; kombiniere ihn mit Taillenmass und Fitness." },
        { q: "Unterscheidet sich der Bereich nach Ethnie?", a: "Manche Richtlinien nutzen niedrigere Grenzwerte fur bestimmte Bevolkerungsgruppen; folge lokalen Gesundheitshinweisen." },
      ],
    },
    ja: {
      steps: [
        "身長、体重、年齢、および出生時に割り当てられた性を入力します。",
        "地域で複数の式が用意されている場合は、該当するものを選びます。",
        "健康体重の範囲と、現在あなたがその中のどこに位置するかを確認します。",
      ],
      explanationTitle: "健康体重は単一の数字ではなく幅",
      formula: "BMI 18.5〜24.9 を逆算：体重 = BMI × 身長²",
      explanation: [
        "健康体重は幅で示されます。単一の数字は体組成を無視するためです。筋肉・骨・骨格の大きさによって適切な値は変わります。",
        "範囲はスクリーニングの目安であり診断ではありません。運動選手や高齢者は体脂肪率や腹囲も合わせて考えるべきです。",
      ],
      faq: [
        { q: "なぜ幅なのでなく一つの体重？", a: "身長が同じ人でも筋肉や骨が異なるため、幅の方が正常なばらつきをよく表します。" },
        { q: "BMI だけで足りる？", a: "有用なスクリーニングですが体組成は分かりません。腹囲や体力と併せて判断してください。" },
        { q: "範囲は人種で違う？", a: "一部のガイドラインは特定の集団に低い境界値を使います。地元の公衆衛生の助言を参照してください。" },
      ],
    },
    es: {
      steps: [
        "Introduce tu altura, peso, edad y el sexo asignado al nacer.",
        "Elige el conjunto de formulas si tu region ofrece varios.",
        "Lee tu rango de peso saludable y en que punto estas dentro de el.",
      ],
      explanationTitle: "El peso saludable es un rango, no un numero",
      formula: "Basado en IMC 18,5 a 24,9 despejado: peso = IMC x altura^2",
      explanation: [
        "El peso saludable se muestra como un rango porque un unico numero ignora la composicion corporal; musculo, hueso y estructura cambian lo que te conviene.",
        "El rango es una guia de cribado, no un diagnostico. Los atletas y los mayores tambien deberian considerar grasa corporal y circunferencia de cintura.",
      ],
      faq: [
        { q: "Por que un rango y no un peso?", a: "Personas de la misma altura difieren en musculo y hueso, asi que una banda captura mejor la variacion normal." },
        { q: "Basta con el IMC?", a: "Es una criba util pero no ve la composicion corporal; combinalo con la medida de cintura y la forma fisica." },
        { q: "Varía el rango segun la etnia?", a: "Algunas guias usan umbrales mas bajos para ciertas poblaciones; consulta la orientacion de salud publica local." },
      ],
    },
  },

  "pregnancy-weight-gain": {
    en: {
      steps: [
        "Enter your pre-pregnancy weight and height to compute your starting BMI.",
        "Select the recommended gain range for your BMI category.",
        "Track your current gain against the suggested total for each trimester.",
      ],
      explanationTitle: "Recommended weight gain in pregnancy",
      formula: "Total by BMI: underweight 12.5 to 18 kg, normal 11.5 to 16 kg, overweight 7 to 11.5 kg, obese 5 to 9 kg",
      explanation: [
        "Weight gain supports the baby, placenta, amniotic fluid, and maternal tissue stores; the right amount depends mainly on starting BMI.",
        "Gaining too little or too much is linked to delivery and infant-health risks, so ranges are guidance, not strict rules, and your clinician individualizes them.",
      ],
      faq: [
        { q: "What if I am expecting twins?", a: "Recommended totals are higher for multiples; follow your provider's specific schedule." },
        { q: "Can I diet to lose weight while pregnant?", a: "Pregnancy is not the time for weight-loss dieting; focus on steady, adequate gain with good nutrition." },
        { q: "Why does BMI at the start matter?", a: "It sets the safest gain band because risk patterns differ by starting weight." },
      ],
    },
    zh: {
      steps: [
        "输入孕前体重和身高，计算起始 BMI。",
        "根据你的 BMI 类别，选择推荐的增重区间。",
        "将当前增重与每个孕期的建议总量进行对照。",
      ],
      explanationTitle: "孕期推荐增重",
      formula: "总量按 BMI：偏瘦 12.5–18 kg、正常 11.5–16 kg、超重 7–11.5 kg、肥胖 5–9 kg",
      explanation: [
        "增重用于支持胎儿、胎盘、羊水以及母体的组织储备；合适的量主要取决于起始 BMI。",
        "增重过少或过多都与分娩和婴儿健康风险相关，因此区间是指导而非硬性规则，医生会根据个人情况调整。",
      ],
      faq: [
        { q: "如果是双胞胎呢？", a: "多胎的推荐总量更高，请遵循医生的具体安排。" },
        { q: "孕期可以节食减肥吗？", a: "孕期不适合减重节食，应注重营养均衡、稳定合理地增重。" },
        { q: "为什么起始 BMI 很重要？", a: "它决定最安全的增重区间，因为风险模式随起始体重不同。" },
      ],
    },
    zhTW: {
      steps: [
        "輸入孕前體重和身高，計算起始 BMI。",
        "根據你的 BMI 類別，選擇推薦的增重區間。",
        "將目前增重與每個孕期的建議總量進行對照。",
      ],
      explanationTitle: "孕期推薦增重",
      formula: "總量按 BMI：偏瘦 12.5–18 kg、正常 11.5–16 kg、超重 7–11.5 kg、肥胖 5–9 kg",
      explanation: [
        "增重用於支持胎兒、胎盤、羊水以及母體的組織儲備；合適的量主要取決於起始 BMI。",
        "增重過少或過多都與分娩和嬰兒健康風險相關，因此區間是指導而非硬性規則，醫師會根據個人情況調整。",
      ],
      faq: [
        { q: "如果是雙胞胎呢？", a: "多胎的推薦總量更高，請遵循醫生的具體安排。" },
        { q: "孕期可以節食減肥嗎？", a: "孕期不適合減重節食，應注重營養均衡、穩定合理地增重。" },
        { q: "為什麼起始 BMI 很重要？", a: "它決定最安全的增重區間，因為風險模式隨起始體重不同。" },
      ],
    },
    de: {
      steps: [
        "Gib dein Gewicht vor der Schwangerschaft und deine Grose ein, um den Start-BMI zu berechnen.",
        "Wahle den empfohlenen Zunahmebereich fur deine BMI-Kategorie.",
        "Vergleiche deine aktuelle Zunahme mit der empfohlenen Gesamtmenge pro Trimenon.",
      ],
      explanationTitle: "Empfohlene Gewichtszunahme in der Schwangerschaft",
      formula: "Gesamt nach BMI: untergewichtig 12,5 bis 18 kg, normal 11,5 bis 16 kg, ubergewichtig 7 bis 11,5 kg, adipos 5 bis 9 kg",
      explanation: [
        "Die Zunahme unterstutzt Baby, Plazenta, Fruchtwasser und mutterliche Gewebespeicher; die richtige Menge hangt vor allem vom Start-BMI ab.",
        "Zu wenig oder zu viel Zunahme hangt mit Risiken fur Geburt und Kind verbunden, daher sind Bereiche Leitlinien, keine strengen Regeln, und dein Arzt passt sie an.",
      ],
      faq: [
        { q: "Was, wenn ich Zwillinge erwarte?", a: "Die empfohlenen Mengen sind bei Mehrlingen hoher; folge dem genauen Plan deines Arztes." },
        { q: "Kann ich schwanger abnehmen?", a: "Schwangerschaft ist keine Zeit zum Abnehmen; achte auf stetige, ausreichende Zunahme mit guter Ernahrung." },
        { q: "Warum zahlt der Start-BMI?", a: "Er legt die sicherste Zunahmebandbreite fest, weil Risikomuster je nach Startgewicht verschieden sind." },
      ],
    },
    ja: {
      steps: [
        "妊娠前の体重と身長を入力して、開始時の BMI を計算します。",
        "ご自身の BMI カテゴリに応じた推奨増加量の範囲を選びます。",
        "現在の増加量を、各妊娠期（トリメスター）の推奨総量と照らし合わせます。",
      ],
      explanationTitle: "妊娠中の推奨体重増加",
      formula: "総量（BMI 別）：やせ 12.5〜18 kg、普通 11.5〜16 kg、過体重 7〜11.5 kg、肥満 5〜9 kg",
      explanation: [
        "増加量は赤ちゃん、胎盤、羊水、母体の組織備蓄を支えます。適切な量は主に開始時の BMI に依存します。",
        "増えすぎも増えなさすぎも分娩や赤ちゃんの健康リスクと関連するため、範囲は目安であり厳格な規則ではなく、医師が個別に調整します。",
      ],
      faq: [
        { q: "双子の場合は？", a: "多胎では推奨総量が多くなります。医師の具体的なスケジュールに従ってください。" },
        { q: "妊娠中にダイエットで減量できる？", a: "妊娠中は減量ダイエットに適した時期ではありません。栄養を整え、安定して適切に増やすことに焦点を。" },
        { q: "なぜ開始時 BMI が重要？", a: "リスクのパターンは開始体重で異なるため、最も安全な増加幅を決めるからです。" },
      ],
    },
    es: {
      steps: [
        "Introduce tu peso antes del embarazo y tu altura para calcular tu IMC inicial.",
        "Selecciona el rango de ganancia recomendado para tu categoria de IMC.",
        "Compara tu ganancia actual con el total sugerido para cada trimestre.",
      ],
      explanationTitle: "Ganancia de peso recomendada en el embarazo",
      formula: "Total por IMC: bajo peso 12,5 a 18 kg, normal 11,5 a 16 kg, sobrepeso 7 a 11,5 kg, obeso 5 a 9 kg",
      explanation: [
        "La ganancia sostiene al bebe, la placenta, el liquido amniotico y las reservas maternas; la cantidad adecuada depende sobre todo del IMC inicial.",
        "Ganar poco o mucho se relaciona con riesgos de parto y salud del bebe, asi que los rangos son guia, no reglas estrictas, y tu medico los individualiza.",
      ],
      faq: [
        { q: "Que pasa si espero gemelos?", a: "Los totales recomendados son mayores con multiples; sigue el calendario especifico de tu proveedor." },
        { q: "Puedo hacer dieta para adelgazar en el embarazo?", a: "El embarazo no es momento para dietas de adelgazamiento; enfocate en una ganancia adecuada y estable con buena nutricion." },
        { q: "Por que importa el IMC inicial?", a: "Fija la banda de ganancia mas segura porque los patrones de riesgo difieren segun el peso inicial." },
      ],
    },
  },

  "bac-calculator": {
    en: {
      steps: [
        "Enter your sex, weight, number of standard drinks, and the hours spent drinking.",
        "Add the drink strength and duration if a detailed mode is available.",
        "Read your estimated blood alcohol concentration and the hours to sober up.",
      ],
      explanationTitle: "Estimating blood alcohol concentration",
      formula: "BAC = (A x 5.14 / W x r) - 0.015 x H  (A=oz alcohol, W=lb, r=0.73/0.66)",
      explanation: [
        "BAC estimates how much alcohol is in the bloodstream using the amount consumed, body water, and time for metabolism, which removes about 0.015 percent per hour.",
        "It is only an estimate; food, medications, sleep, and tolerance change the real effect. Never use a number to decide if you can drive.",
      ],
      faq: [
        { q: "What is a standard drink?", a: "Roughly 14 g of pure alcohol, about 350 ml beer, 150 ml wine, or 45 ml spirits, varying by strength." },
        { q: "Can I drive at 0.02 percent?", a: "Laws differ and impairment begins with the first drink; if you have consumed alcohol, the safe choice is not to drive." },
        { q: "Why does sex change the result?", a: "Average body water differs, so the same drinks produce a higher concentration for those with less water per kilogram." },
      ],
    },
    zh: {
      steps: [
        "输入性别、体重、标准饮酒份数，以及饮酒经过的小时数。",
        "如果提供详细模式，可补充酒品度数与持续时间。",
        "查看估算的血液酒精浓度，以及 sober up（代谢清醒）所需的小时数。",
      ],
      explanationTitle: "估算血液酒精浓度",
      formula: "BAC = (A × 5.14 / W × r) - 0.015 × H（A=酒精盎司，W=磅，r=0.73/0.66）",
      explanation: [
        "BAC 依据饮酒量、体内水分和代谢时间估算血液中的酒精量，代谢每小时约降低 0.015%。",
        "它只是估算；食物、药物、睡眠和耐受度都会改变真实影响。切勿用数字判断是否可开车。",
      ],
      faq: [
        { q: "什么是「一份标准饮酒」？", a: "约含 14 克纯酒精，约等于 350 毫升啤酒、150 毫升葡萄酒或 45 毫升烈酒，随度数不同而有差异。" },
        { q: "0.02% 时能开车吗？", a: "各地法律不同，而且损害从第一口酒就开始；只要喝过酒，最安全的选择是不开车。" },
        { q: "为什么性别会影响结果？", a: "平均体内水分不同，同样饮酒量对每公斤水分较少的人会产生更高浓度。" },
      ],
    },
    zhTW: {
      steps: [
        "輸入性別、體重、標準飲酒份數，以及飲酒經過的小時數。",
        "如果提供詳細模式，可補充酒品度數與持續時間。",
        "查看估算的血液酒精濃度，以及 sober up（代謝清醒）所需的小時數。",
      ],
      explanationTitle: "估算血液酒精濃度",
      formula: "BAC = (A × 5.14 / W × r) - 0.015 × H（A=酒精盎司，W=磅，r=0.73/0.66）",
      explanation: [
        "BAC 依據飲酒量、體內水分和代謝時間估算血液中的酒精量，代謝每小時約降低 0.015%。",
        "它只是估算；食物、藥物、睡眠和耐受度都會改變真實影響。切勿用數字判斷是否可開車。",
      ],
      faq: [
        { q: "什麼是「一份標準飲酒」？", a: "約含 14 克純酒精，約等於 350 毫升啤酒、150 毫升葡萄酒或 45 毫升烈酒，隨度數不同而有差異。" },
        { q: "0.02% 時能開車嗎？", a: "各地法律不同，而且損害從第一口酒就開始；只要喝過酒，最安全的選擇是不開車。" },
        { q: "為什麼性別會影響結果？", a: "平均體內水分不同，同樣飲酒量對每公斤水分較少的人會產生更高濃度。" },
      ],
    },
    de: {
      steps: [
        "Gib Geschlecht, Gewicht, Anzahl Standardgetranke und die Trinkstunden ein.",
        "Fuge Alkoholgehalt und Dauer hinzu, falls ein Detailmodus verfugbar ist.",
        "Lies die geschatze Blutalkoholkonzentration und die Stunden bis zur Nuchternheit.",
      ],
      explanationTitle: "Blutalkoholkonzentration abschatzen",
      formula: "BAC = (A x 5,14 / W x r) - 0,015 x H  (A=Unzen Alkohol, W=Pfund, r=0,73/0,66)",
      explanation: [
        "Der BAC schatzt den Alkohol im Blut aus Menge, Korperwasser und Stoffwechselzeit, der etwa 0,015 Prozent pro Stunde abbaut.",
        "Es ist nur eine Schatzung; Essen, Medikamente, Schlaf und Toleranz andern die Wirkung. Nutze die Zahl nie, um zu entscheiden, ob du fahren kannst.",
      ],
      faq: [
        { q: "Was ist ein Standardgetrank?", a: "Rund 14 g reiner Alkohol, etwa 350 ml Bier, 150 ml Wein oder 45 ml Spirituosen, je nach Starke unterschiedlich." },
        { q: "Kann ich bei 0,02 Prozent fahren?", a: "Gesetze unterscheiden sich, und die Beeintrachtigung beginnt mit dem ersten Drink; wer Alkohol konsumiert hat, fahrt am besten nicht." },
        { q: "Warum andert das Geschlecht das Ergebnis?", a: "Das durchschnittliche Korperwasser unterscheidet sich, sodass gleiche Mengen bei weniger Wasser pro kg eine hohere Konzentration ergeben." },
      ],
    },
    ja: {
      steps: [
        "性別、体重、標準的な飲酒単位数、および飲酒した経過時間（時間）を入力します。",
        "詳細モードがあれば、アルコール度数と継続時間も加えます。",
        "推定される血中アルコール濃度と、覚醒（アルコールが抜ける）までのおおよその時間を確認します。",
      ],
      explanationTitle: "血中アルコール濃度の推定",
      formula: "BAC = (A × 5.14 / W × r) - 0.015 × H（A=アルコールオンス、W=ポンド、r=0.73/0.66）",
      explanation: [
        "BAC は飲酒量、体内の水分、代謝に要する時間から血中のアルコール量を推定します。代謝では1時間あたり約 0.015% 低下します。",
        "あくまで推定値です。食事・薬・睡眠・耐性によって実際の影響は変わります。運転の可否を数値で判断してはいけません。",
      ],
      faq: [
        { q: "「1単位の標準的な飲酒」とは？", a: "純アルコール約 14 g。ビール 350 ml、ワイン 150 ml、蒸留酒 45 ml 目安で、度数で変わります。" },
        { q: "0.02% なら運転できる？", a: "法律は国ごとに異なり、影響は最初の一杯から始まります。アルコールを飲んだら運転しないのが安全です。" },
        { q: "なぜ性別で結果が変わる？", a: "平均的な体内水分が異なるため、同じ飲酒量でも体重1kgあたりの水分が少ない人ほど濃度が高くなります。" },
      ],
    },
    es: {
      steps: [
        "Introduce sexo, peso, numero de bebidas estandar y las horas transcurridas bebiendo.",
        "Anade la graduacion y la duracion si hay un modo detallado.",
        "Lee tu concentracion estimada de alcohol en sangre y las horas para estar sobrio.",
      ],
      explanationTitle: "Estimar la concentracion de alcohol en sangre",
      formula: "BAC = (A x 5,14 / W x r) - 0,015 x H  (A=oz alcohol, W=lb, r=0,73/0,66)",
      explanation: [
        "El BAC estima el alcohol en la sangre a partir de la cantidad consumida, el agua corporal y el tiempo de metabolismo, que elimina unas 0,015 por ciento por hora.",
        "Es solo una estimacion; comida, medicamentos, sueno y tolerancia cambian el efecto real. Nunca uses un numero para decidir si puedes conducir.",
      ],
      faq: [
        { q: "Que es una bebida estandar?", a: "Unas 14 g de alcohol puro, aproximadamente 350 ml de cerveza, 150 ml de vino o 45 ml de licor, segun la graduacion." },
        { q: "Puedo conducir al 0,02 por ciento?", a: "Las leyes varian y la alteracion empieza con la primera bebida; si has bebido, lo seguro es no conducir." },
        { q: "Por que el sexo cambia el resultado?", a: "El agua corporal media difiere, asi que las mismas bebidas dan mayor concentracion a quienes tienen menos agua por kilo." },
      ],
    },
  },

  "basic-calculator": {
    en: {
      steps: [
        "Type numbers using the on-screen pad or your keyboard.",
        "Use + - x / and parentheses for the order of operations.",
        "Read the result, and use clear or backspace to start a new calculation.",
      ],
      explanationTitle: "Order of operations",
      formula: "PEMDAS: Parentheses, Exponents, Multiplication/Division, Addition/Subtraction",
      explanation: [
        "The calculator follows standard precedence, so 2 + 3 x 4 equals 14, not 20; parentheses force a different grouping.",
        "It is exact for the digits shown, but very long numbers are rounded for display; use scientific mode for high precision.",
      ],
      faq: [
        { q: "Why is my answer different from expected?", a: "Check parentheses and operation order; multiplication runs before addition unless you group it." },
        { q: "Does it keep history?", a: "This simple view shows the current line; use the expression history if your version includes it." },
        { q: "Can it handle fractions?", a: "It works in decimals; convert fractions to decimals first for accurate results." },
      ],
    },
    zh: {
      steps: [
        "用屏幕键盘或直接用电脑键盘输入数字。",
        "使用 + - × ÷ 和括号来控制运算顺序。",
        "查看结果，并用清除或退格开始新的计算。",
      ],
      explanationTitle: "运算顺序",
      formula: "PEMDAS：括号、指数、乘除、加减",
      explanation: [
        "计算器遵循标准优先级，所以 2 + 3 × 4 等于 14 而非 20；括号可强制改变分组。",
        "对显示的数字它是精确的，但超长数字会为显示而四舍五入；需要高精度请用科学模式。",
      ],
      faq: [
        { q: "为什么结果和预期不一样？", a: "检查括号和运算顺序；乘法优先于加法，除非你用括号分组。" },
        { q: "会保留历史吗？", a: "这个简洁视图只显示当前行；若你的版本带表达式历史则可查看。" },
        { q: "能处理分数吗？", a: "它以小数运算；请先将分数转为小数以获得准确结果。" },
      ],
    },
    zhTW: {
      steps: [
        "用螢幕鍵盤或直接用電腦鍵盤輸入數字。",
        "使用 + - × ÷ 和括號來控制運算順序。",
        "查看結果，並用清除或退格開始新的計算。",
      ],
      explanationTitle: "運算順序",
      formula: "PEMDAS：括號、指數、乘除、加減",
      explanation: [
        "計算器遵循標準優先級，所以 2 + 3 × 4 等於 14 而非 20；括號可強制改變分組。",
        "對顯示的數字它是精確的，但超長數字會為顯示而四捨五入；需要高精度請用科學模式。",
      ],
      faq: [
        { q: "為什麼結果和預期不一樣？", a: "檢查括號和運算順序；乘法優先於加法，除非你用括號分組。" },
        { q: "會保留歷史嗎？", a: "這個簡潔視圖只顯示目前行；若你的版本帶表達式歷史則可查看。" },
        { q: "能處理分數嗎？", a: "它以小數運算；請先將分數轉為小數以獲得準確結果。" },
      ],
    },
    de: {
      steps: [
        "Tippe Zahlen uber das Bildschirmfeld oder deine Tastatur ein.",
        "Nutze + - x / und Klammern fur die Reihenfolge der Operationen.",
        "Lies das Ergebnis und nutze Clear oder Backspace fur eine neue Rechnung.",
      ],
      explanationTitle: "Reihenfolge der Operationen",
      formula: "PEMDAS: Klammern, Potenzen, Punktrechnung, Strichrechnung",
      explanation: [
        "Der Rechner folgt der ublichen Prioritat, also ist 2 + 3 x 4 gleich 14, nicht 20; Klammern erzwingen eine andere Gruppierung.",
        "Er ist exakt fur die angezeigten Ziffern, aber sehr lange Zahlen werden zur Anzeige gerundet; nutze den wissenschaftlichen Modus fur hohe Prazision.",
      ],
      faq: [
        { q: "Warum weicht mein Ergebnis ab?", a: "Prufe Klammern und Reihenfolge; Multiplikation lauft vor Addition, sofern du sie nicht gruppierst." },
        { q: "Speichert er Verlauf?", a: "Diese einfache Ansicht zeigt die aktuelle Zeile; nutze den Ausdrucksverlauf, falls deine Version ihn bietet." },
        { q: "Kann er Bruche?", a: "Er rechnet mit Dezimalzahlen; wandele Bruche zuerst in Dezimalzahlen um, um genaue Ergebnisse zu erhalten." },
      ],
    },
    ja: {
      steps: [
        "画面上のキーパッドまたはキーボードで数字を入力します。",
        "+, -, ×, ÷ と括弧を使って演算順序を指定します。",
        "結果を確認し、クリアやバックスペースで新しい計算を始めます。",
      ],
      explanationTitle: "演算の順序",
      formula: "PEMDAS：括弧、指数、乗除、加减",
      explanation: [
        "計算機は標準的な優先順位に従うため、2 + 3 × 4 は 20 ではなく 14 になります。括弧を使うとグループ化を強制できます。",
        "表示された桁については正確ですが、非常に長い数値は表示のために丸められます。高精度が必要な場合は科学計算モードを使ってください。",
      ],
      faq: [
        { q: "結果が予想と違うのはなぜ？", a: "括弧と演算順序を確認してください。括弧でくくらない限り乗算は加算より先に行われます。" },
        { q: "履歴は残る？", a: "このシンプルな表示は現在の行のみです。バージョンによっては式の履歴があります。" },
        { q: "分数は扱える？", a: "小数で計算します。正確な結果を得るには分数を先に小数に変換してください。" },
      ],
    },
    es: {
      steps: [
        "Escribe numeros con el teclado en pantalla o el de tu ordenador.",
        "Usa + - x / y parentesis para el orden de las operaciones.",
        "Lee el resultado y usa borrar o retroceso para una nueva operacion.",
      ],
      explanationTitle: "Orden de las operaciones",
      formula: "PEMDAS: Parentesis, Exponentes, Multiplicacion/Division, Suma/Resta",
      explanation: [
        "La calculadora sigue la prioridad estandar, asi que 2 + 3 x 4 es 14, no 20; los parentesis fuerzan otro agrupamiento.",
        "Es exacta para las cifras mostradas, pero las cifras muy largas se redondean para la vista; usa el modo cientifico para alta precision.",
      ],
      faq: [
        { q: "Por que mi resultado difiere?", a: "Revisa parentesis y orden; la multiplicacion va antes que la suma salvo que la agrupes." },
        { q: "Guarda historial?", a: "Esta vista simple muestra la linea actual; usa el historial de expresiones si tu version lo incluye." },
        { q: "Maneja fracciones?", a: "Trabaja en decimales; convierte primero las fracciones a decimales para resultados exactos." },
      ],
    },
  },

  "rgb": {
    en: {
      steps: [
        "Enter values from 0 to 255 for red, green, and blue.",
        "Adjust sliders to preview the resulting color live.",
        "Copy the HEX, HSL, or CSS code for use in your project.",
      ],
      explanationTitle: "How RGB builds color",
      formula: "Color = (R, G, B), each channel 0 to 255; HEX = #RRGGBB",
      explanation: [
        "RGB mixes three light channels; (0,0,0) is black, (255,255,255) is white, and equal values make greys.",
        "Screens emit light, so RGB is additive: unlike paint, adding all channels moves toward white rather than black.",
      ],
      faq: [
        { q: "What is the difference between RGB and CMYK?", a: "RGB is for screens (additive light); CMYK is for print (subtractive ink)." },
        { q: "Why 0 to 255?", a: "Each channel is 8 bits, giving 256 levels from 0 to 255, or about 16.7 million colors total." },
        { q: "How do I convert to HEX?", a: "Convert each decimal to two hex digits and join with #, for example 255,0,0 becomes #FF0000." },
      ],
    },
    zh: {
      steps: [
        "为红、绿、蓝分别输入 0 到 255 之间的值。",
        "拖动滑块即可实时预览生成的颜色。",
        "复制 HEX、HSL 或 CSS 代码，用于你的项目。",
      ],
      explanationTitle: "RGB 如何构成颜色",
      formula: "颜色 = (R, G, B)，每通道 0 至 255；HEX = #RRGGBB",
      explanation: [
        "RGB 混合三个光通道：(0,0,0) 为黑，(255,255,255) 为白，三者相等则为灰阶。",
        "屏幕主动发光，所以 RGB 是加色法：与颜料相反，叠加所有通道会趋向白色而非黑色。",
      ],
      faq: [
        { q: "RGB 和 CMYK 有什么区别？", a: "RGB 用于屏幕（加色光）；CMYK 用于印刷（减色油墨）。" },
        { q: "为什么是 0 到 255？", a: "每个通道为 8 位，提供 0 至 255 共 256 级，总计约 1670 万种颜色。" },
        { q: "怎么转成 HEX？", a: "把每个十进制数转成两位十六进制并加上 #，例如 255,0,0 变为 #FF0000。" },
      ],
    },
    zhTW: {
      steps: [
        "為紅、綠、藍分別輸入 0 到 255 之間的值。",
        "拖動滑桿即可即時預覽產生的顏色。",
        "複製 HEX、HSL 或 CSS 代碼，用於你的專案。",
      ],
      explanationTitle: "RGB 如何構成顏色",
      formula: "顏色 = (R, G, B)，每通道 0 至 255；HEX = #RRGGBB",
      explanation: [
        "RGB 混合三個光通道：(0,0,0) 為黑，(255,255,255) 為白，三者相等則為灰階。",
        "螢幕主動發光，所以 RGB 是加色法：與顏料相反，疊加所有通道會趨向白色而非黑色。",
      ],
      faq: [
        { q: "RGB 和 CMYK 有什麼區別？", a: "RGB 用於螢幕（加色光）；CMYK 用於印刷（減色油墨）。" },
        { q: "為什麼是 0 到 255？", a: "每個通道為 8 位，提供 0 至 255 共 256 級，總計約 1670 萬種顏色。" },
        { q: "怎麼轉成 HEX？", a: "把每個十進位數轉成兩位十六進位並加上 #，例如 255,0,0 變為 #FF0000。" },
      ],
    },
    de: {
      steps: [
        "Gib Werte von 0 bis 255 fur Rot, Grun und Blau ein.",
        "Verschiebe die Regler, um die Farbe live zu sehen.",
        "Kopiere den HEX-, HSL- oder CSS-Code fur dein Projekt.",
      ],
      explanationTitle: "Wie RGB Farbe erzeugt",
      formula: "Farbe = (R, G, B), jeder Kanal 0 bis 255; HEX = #RRGGBB",
      explanation: [
        "RGB mischt drei Lichtkanale; (0,0,0) ist schwarz, (255,255,255) weiss, gleiche Werte ergeben Grau.",
        "Bildschirme senden Licht aus, daher ist RGB additiv: Anders als Farbe bewegt sich das Mischen aller Kanale zu weiss statt zu schwarz.",
      ],
      faq: [
        { q: "Was unterscheidet RGB und CMYK?", a: "RGB ist fur Bildschirme (additives Licht); CMYK ist fur Druck (subtraktive Tinte)." },
        { q: "Warum 0 bis 255?", a: "Jeder Kanal hat 8 Bit, also 256 Stufen von 0 bis 255, insgesamt etwa 16,7 Millionen Farben." },
        { q: "Wie rechne ich in HEX um?", a: "Wandle jede Dezimalzahl in zwei Hex-Ziffern um und verbinde sie mit #, zum Beispiel 255,0,0 wird #FF0000." },
      ],
    },
    ja: {
      steps: [
        "赤・緑・青それぞれに 0〜255 の値を入力します。",
        "スライダーを動かすと色をその場で確認できます。",
        "プロジェクトで使う HEX・HSL・CSS コードをコピーします。",
      ],
      explanationTitle: "RGB が色を作る仕組み",
      formula: "色 = (R, G, B)、各チャンネル 0〜255；HEX = #RRGGBB",
      explanation: [
        "RGB は3つの光のチャンネルを混ぜます。(0,0,0) は黒、(255,255,255) は白、3つが等しいと灰色になります。",
        "画面は光を発するため RGB は加算的混合です。絵の具と違い、すべてのチャンネルを重ねると白に近づきます。",
      ],
      faq: [
        { q: "RGB と CMYK の違いは？", a: "RGB は画面用（加算の光）、CMYK は印刷用（減算のインク）です。" },
        { q: "なぜ 0〜255？", a: "各チャンネルは 8 ビットで 0〜255 の 256 段階、合計約 1670 万色になります。" },
        { q: "HEX にどう変換する？", a: "各10進数を2桁の16進数に直し # をつなぎます。例：255,0,0 は #FF0000 です。" },
      ],
    },
    es: {
      steps: [
        "Introduce valores del 0 al 255 para rojo, verde y azul.",
        "Ajusta los deslizadores para previsualizar el color en vivo.",
        "Copia el codigo HEX, HSL o CSS para usar en tu proyecto.",
      ],
      explanationTitle: "Como el RGB construye el color",
      formula: "Color = (R, G, B), cada canal 0 a 255; HEX = #RRGGBB",
      explanation: [
        "El RGB mezcla tres canales de luz; (0,0,0) es negro, (255,255,255) es blanco, e iguales valores dan grises.",
        "Las pantallas emiten luz, asi que el RGB es aditivo: a diferencia de la pintura, sumar todos los canales tiende a blanco en vez de negro.",
      ],
      faq: [
        { q: "Cual es la diferencia entre RGB y CMYK?", a: "RGB es para pantallas (luz aditiva); CMYK es para impresion (tinta sustractiva)." },
        { q: "Por que del 0 al 255?", a: "Cada canal son 8 bits, lo que da 256 niveles del 0 al 255, unos 16,7 millones de colores en total." },
        { q: "Como lo convierto a HEX?", a: "Convierte cada decimal en dos digitos hex y une con #, por ejemplo 255,0,0 se vuelve #FF0000." },
      ],
    },
  },

  "date": {
    en: {
      steps: [
        "Enter a start date and choose add or subtract.",
        "Specify the number of days, weeks, months, or years to shift.",
        "Read the resulting date, plus the count of days between two dates if comparing.",
      ],
      explanationTitle: "Working with calendar dates",
      formula: "Result = Start date +/- interval, with month-length and leap-year rules applied",
      explanation: [
        "Date arithmetic must handle months of different lengths and leap years, so the calculator counts actual calendar days rather than assuming 30-day months.",
        "When subtracting, you get both the target date and the exact number of days elapsed, useful for deadlines and age.",
      ],
      faq: [
        { q: "Does it count the start day?", a: "It counts whole intervals; for days between it returns the difference without double-counting endpoints." },
        { q: "How are leap years handled?", a: "Years divisible by 4 are leap, except centuries not divisible by 400." },
        { q: "Can I find a due date?", a: "Add the required number of days to the start date to get the deadline." },
      ],
    },
    zh: {
      steps: [
        "输入起始日期，并选择「加」或「减」。",
        "指定要偏移的天数、周数、月数或年数。",
        "查看计算后的日期；若做对比，还会显示两个日期之间的天数。",
      ],
      explanationTitle: "处理日历日期",
      formula: "结果 = 起始日期 ± 间隔，并应用月份天数与闰年规则",
      explanation: [
        "日期运算必须处理长短不一的月份和闰年，因此计算器按真实日历天数计算，而非假定每月 30 天。",
        "做减法时，你既能得到目标日期，也能得到经过的确切天数，便于计算截止日与年龄。",
      ],
      faq: [
        { q: "会把起始日也算进去吗？", a: "它计算完整的间隔；「相差天数」返回差值，不会重复计算起止日。" },
        { q: "闰年怎么处理？", a: "能被 4 整除的年份为闰年，但整百年必须能被 400 整除才是。" },
        { q: "能算截止日期吗？", a: "在起始日期上加上所需天数，即可得到截止日。" },
      ],
    },
    zhTW: {
      steps: [
        "輸入起始日期，並選擇「加」或「減」。",
        "指定要偏移的天數、週數、月數或年數。",
        "查看計算後的日期；若做對比，還會顯示兩個日期之間的天數。",
      ],
      explanationTitle: "處理日曆日期",
      formula: "結果 = 起始日期 ± 間隔，並應用月份天數與閏年規則",
      explanation: [
        "日期運算必須處理長短不一的月份和閏年，因此計算器按真實日曆天數計算，而非假定每月 30 天。",
        "做減法時，你既能得到目標日期，也能得到經過的確切天數，便於計算截止日與年齡。",
      ],
      faq: [
        { q: "會把起始日也算進去嗎？", a: "它計算完整的間隔；「相差天數」返回差值，不會重複計算起止日。" },
        { q: "閏年怎麼處理？", a: "能被 4 整除的年份為閏年，但整百年必須能被 400 整除才是。" },
        { q: "能算截止日期嗎？", a: "在起始日期上加上所需天數，即可得到截止日。" },
      ],
    },
    de: {
      steps: [
        "Gib ein Startdatum ein und wahle Plus oder Minus.",
        "Lege die Anzahl Tage, Wochen, Monate oder Jahre fest.",
        "Lies das Ergebnisdatum und bei Vergleichen die Tage zwischen zwei Daten.",
      ],
      explanationTitle: "Arbeiten mit Kalenderdaten",
      formula: "Ergebnis = Startdatum +/- Intervall, mit Monatslangen und Schaltjahrregeln",
      explanation: [
        "Datumsrechnung muss Monate unterschiedlicher Lange und Schaltjahre beachten, daher zahlt der Rechner echte Kalendertage statt pauschal 30-Tage-Monate.",
        "Beim Subtrahieren erhaltst du sowohl das Zieldatum als auch die genaue Zahl vergangener Tage, nutzlich fur Fristen und Alter.",
      ],
      faq: [
        { q: "Zahlt er den Starttag mit?", a: "Er zahlt ganze Intervalle; bei Tagen dazwischen gibt er die Differenz ohne Doppelzahlung der Endpunkte." },
        { q: "Wie werden Schaltjahre behandelt?", a: "Jahre durch 4 teilbar sind Schaltjahre, ausser Jahrhunderte ohne Teilbarkeit durch 400." },
        { q: "Kann ich ein Enddatum finden?", a: "Addiere die benotigten Tage zum Startdatum, um die Frist zu erhalten." },
      ],
    },
    ja: {
      steps: [
        "開始日を入力し、「加算」か「減算」を選びます。",
        "ずらす日数・週数・月数・年数を指定します。",
        "計算後の日付を確認します。比較する場合は2つの日付の間の日数も表示します。",
      ],
      explanationTitle: "暦の日付の扱い",
      formula: "結果 = 開始日 ± 間隔（月の日数とうるう年ルールを適用）",
      explanation: [
        "日付計算は長さの異なる月とうるう年を処理する必要があるため、毎月30日と仮定せず実際の暦の日数で数えます。",
        "減算すると、目標日だけでなく経過した正確な日数も得られ、締め切りや年齢の計算に便利です。",
      ],
      faq: [
        { q: "開始日もカウントされる？", a: "全体の間隔を数えます。「相差日数」は端点を重複カウントせず差を返します。" },
        { q: "うるう年はどう扱う？", a: "4で割り切れる年がうるう年ですが、世紀年は400で割り切れる場合のみです。" },
        { q: "締め切り日は求められる？", a: "開始日におよそ必要な日数を加えれば締め切りが得られます。" },
      ],
    },
    es: {
      steps: [
        "Introduce una fecha de inicio y elige sumar o restar.",
        "Indica el numero de dias, semanas, meses o anos a desplazar.",
        "Lee la fecha resultante y, al comparar, los dias entre dos fechas.",
      ],
      explanationTitle: "Trabajar con fechas del calendario",
      formula: "Resultado = Fecha inicio +/- intervalo, con reglas de dias del mes y anos bisiestos",
      explanation: [
        "La aritmetica de fechas debe manejar meses de distinta longitud y anos bisiestos, asi que la calculadora cuenta dias reales del calendario en vez de suponer meses de 30 dias.",
        "Al restar obtienes tanto la fecha objetivo como el numero exacto de dias transcurridos, util para plazos y edad.",
      ],
      faq: [
        { q: "Cuenta el dia de inicio?", a: "Cuenta intervalos completos; para dias entre devuelve la diferencia sin contar dos veces los extremos." },
        { q: "Como se tratan los anos bisiestos?", a: "Los divisibles por 4 son bisiestos, excepto los siglos no divisibles por 400." },
        { q: "Puedo hallar una fecha limite?", a: "Suma los dias necesarios a la fecha de inicio para obtener el plazo." },
      ],
    },
  },
};

// 注入
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
