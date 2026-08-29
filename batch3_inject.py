# -*- coding: utf-8 -*-
import json, os

BASE = os.path.dirname(os.path.abspath(__file__))
LOCALES = ["zh", "zh-TW", "en", "de", "ja", "es"]

# 6 tool-guide posts, each in 6 languages.
# block types: p / h2 / callout ; text may contain [label](/path) links.
NEW = {
    "compound-interest-wealth-building": {
        "meta": {"date": "2026-08-29", "category": "finance", "readingMinutes": 5},
        "zh": {
            "title": "复利如何让财富滚雪球：早开始的力量",
            "excerpt": "复利常被称为世界第八大奇迹。理解它如何运作，并用[复利计算器](/finance/compound-interest)看到数字，是长期财富积累最关键的一步。",
            "blocks": [
                {"type": "p", "text": "复利是指收益再投资后，下一期的收益基于本金和已累积利息一起计算。时间越长，曲线越陡。"},
                {"type": "h2", "text": "为什么开始得早如此重要"},
                {"type": "p", "text": "假设你每月投入 1000 元，年化 8%。从第 25 岁开始到第 65 岁，和从第 35 岁开始，最终差距不是 10 年，而是数倍——因为前期累积的利息在后面几十年持续生息。"},
                {"type": "callout", "text": "复利的敌人是中断与费用。频繁交易、高额管理费会显著侵蚀长期回报，与其择时，不如尽早并坚持。"},
                {"type": "p", "text": "用[复利计算器](/finance/compound-interest)输入你的每月投入、年限和预期收益率，直观看到时间与复利的合力。"},
            ],
        },
        "zh-TW": {
            "title": "複利如何讓財富滾雪球：早開始的力量",
            "excerpt": "複利常被稱為世界第八大奇蹟。理解它如何運作，並用[複利計算機](/finance/compound-interest)看到數字，是長期財富累積最關鍵的一步。",
            "blocks": [
                {"type": "p", "text": "複利是指收益再投資後，下一期的收益基於本金和已累積利息一起計算。時間越長，曲線越陡。"},
                {"type": "h2", "text": "為什麼開始得早如此重要"},
                {"type": "p", "text": "假設你每月投入 1000 元，年化 8%。從第 25 歲開始到第 65 歲，和從第 35 歲開始，最終差距不是 10 年，而是數倍——因為前期累積的利息在後面幾十年持續生息。"},
                {"type": "callout", "text": "複利的敵人是中斷與費用。頻繁交易、高額管理費會顯著侵蝕長期回報，與其擇時，不如儘早並堅持。"},
                {"type": "p", "text": "用[複利計算機](/finance/compound-interest)輸入你的每月投入、年限和預期收益率，直觀看到時間與複利的合力。"},
            ],
        },
        "en": {
            "title": "How Compound Interest Makes Wealth Snowball: The Power of Starting Early",
            "excerpt": "Compound interest is often called the eighth wonder of the world. Understanding how it works—and seeing the numbers with a [compound interest calculator](/finance/compound-interest)—is the single most important step in long-term wealth building.",
            "blocks": [
                {"type": "p", "text": "Compounding means each period's earnings are reinvested, so the next period's return is calculated on both your principal and the interest already accumulated. The longer the horizon, the steeper the curve."},
                {"type": "h2", "text": "Why starting early matters so much"},
                {"type": "p", "text": "Suppose you invest 1,000 per month at 8% annually. Starting at 25 versus 35 doesn't cost you 10 years of growth—it can cost you multiples, because the interest accumulated early keeps earning for decades."},
                {"type": "callout", "text": "The enemies of compounding are interruptions and fees. Frequent trading and high management fees quietly erode long-term returns. Rather than timing the market, start early and stay consistent."},
                {"type": "p", "text": "Use the [compound interest calculator](/finance/compound-interest) to enter your monthly contribution, years, and expected return, and watch time and compounding work together."},
            ],
        },
        "de": {
            "title": "Wie Zinseszins dein Vermögen anwachsen lässt: Die Kraft eines frühen Starts",
            "excerpt": "Zinseszins wird oft als das achte Weltwunder bezeichnet. Zu verstehen, wie er funktioniert – und die Zahlen mit einem [Zinseszins-Rechner](/finance/compound-interest) zu sehen – ist der wichtigste Schritt für langfristigen Vermögensaufbau.",
            "blocks": [
                {"type": "p", "text": "Beim Zinseszins werden die Erträge wiederangelegt, sodass die Rendite der nächsten Periode auf das Kapital und die bereits angesammelten Zinsen berechnet wird. Je länger der Zeithorizont, desto steiler die Kurve."},
                {"type": "h2", "text": "Warum ein früher Start so wichtig ist"},
                {"type": "p", "text": "Angenommen, du investierst 1.000 pro Monat bei 8 % pro Jahr. Ein Start mit 25 statt mit 35 kostet dich nicht 10 Jahre Wachstum, sondern ein Vielfaches, da die früh angesammelten Zinsen jahrzehntelang weiter erwirtschaften."},
                {"type": "callout", "text": "Die Feinde des Zinseszinses sind Unterbrechungen und Gebühren. Häufiger Handel und hohe Verwaltungsgebühren erodieren die langfristige Rendite. Statt den Markt zu timen, starte früh und bleib beständig."},
                {"type": "p", "text": "Nutze den [Zinseszins-Rechner](/finance/compound-interest), um deinen monatlichen Beitrag, die Jahre und die erwartete Rendite einzugeben und Zeit und Zinseszins zusammenwirken zu sehen."},
            ],
        },
        "ja": {
            "title": "複利が資産を雪だるま式に増やす理由：早く始める力",
            "excerpt": "複利は「世界の第八不思議」と呼ばれます。その仕組みを理解し、[複利計算機](/finance/compound-interest)で数字を見ることは、長期的な資産形成で最も重要な一歩です。",
            "blocks": [
                {"type": "p", "text": "複利とは、得た利益を再投資し、次の期間のリターンが元本とこれまでに蓄積した利息の両方に対して計算される仕組みです。期間が長いほど曲線は急になります。"},
                {"type": "h2", "text": "なぜ早く始めることが重要か"},
                {"type": "p", "text": "毎月 1,000 を年利 8% で運用するとします。25 歳開始と 35 歳開始の差は 10 年分の成長どころか数倍に及びます。なぜなら早く蓄積した利息が何十年も働き続けるからです。"},
                {"type": "callout", "text": "複利の敵は中断と手数料です。頻繁な売買や高い管理費は長期リターンを静かに削ります。相場を当てるより、早く始めて継続することが大切です。"},
                {"type": "p", "text": "[複利計算機](/finance/compound-interest)に毎月の積立額・年数・想定利回りを入力し、時間と複利の相乗効果を視覚的に確認しましょう。"},
            ],
        },
        "es": {
            "title": "Cómo el interés compuesto hace crecer tu dinero: el poder de empezar pronto",
            "excerpt": "El interés compuesto se conoce como la octava maravilla del mundo. Entender cómo funciona —y ver las cifras con una [calculadora de interés compuesto](/finance/compound-interest)— es el paso más importante para construir riqueza a largo plazo.",
            "blocks": [
                {"type": "p", "text": "El interés compuesto significa que los rendimientos se reinvierten, así que el retorno del siguiente período se calcula sobre el capital y los intereses ya acumulados. Cuanto mayor es el horizonte, más empinada es la curva."},
                {"type": "h2", "text": "Por qué empezar pronto importa tanto"},
                {"type": "p", "text": "Supongamos que inviertes 1.000 al mes al 8% anual. Empezar a los 25 en lugar de a los 35 no te cuesta 10 años de crecimiento, sino múltiplos, porque los intereses acumulados al principio siguen generando durante décadas."},
                {"type": "callout", "text": "Los enemigos del interés compuesto son las interrupciones y las comisiones. Operar con frecuencia y las altas comisiones erosionan silenciosamente el rendimiento a largo plazo. Mejor que intentar predecir el mercado, empieza pronto y sé constante."},
                {"type": "p", "text": "Usa la [calculadora de interés compuesto](/finance/compound-interest) para introducir tu aportación mensual, los años y el rendimiento esperado, y observa cómo el tiempo y el interés compuesto trabajan juntos."},
            ],
        },
    },
    "currency-exchange-how-it-works": {
        "meta": {"date": "2026-08-29", "category": "finance", "readingMinutes": 4},
        "zh": {
            "title": "汇率是怎么来的：货币兑换背后的逻辑",
            "excerpt": "为什么 1 美元能换约 7 元人民币？汇率不是随便定的。用[汇率计算器](/finance/currency)算清你的实际到手金额，避免被隐藏费用吃掉。",
            "blocks": [
                {"type": "p", "text": "汇率本质上是两种货币的相对价格，由供求关系、利率差异、通胀水平和经济预期共同决定。"},
                {"type": "h2", "text": "中间价、现钞价与手续费"},
                {"type": "p", "text": "你看到的「牌价」往往不是你最终拿到的金额。银行或平台会在中间价上加点差和手续费。兑换前用[汇率计算器](/finance/currency)先算净额，再对比渠道。"},
                {"type": "callout", "text": "跨境消费时，动态货币转换（DCC）通常比本地货币结算更贵。在境外刷卡尽量选当地币种计费。"},
            ],
        },
        "zh-TW": {
            "title": "匯率是如何決定的：貨幣兌換背後的邏輯",
            "excerpt": "為什麼 1 美元能換約 7 元人民幣？匯率不是隨便定的。用[匯率計算機](/finance/currency)算清你的實際到手金額，避免被隱藏費用吃掉。",
            "blocks": [
                {"type": "p", "text": "匯率本質上是兩種貨幣的相對價格，由供求關係、利率差異、通膨水平和經濟預期共同決定。"},
                {"type": "h2", "text": "中間價、現鈔價與手續費"},
                {"type": "p", "text": "你看到的「牌價」往往不是你最終拿到的金額。銀行或平台會在中間價上加點差和手續費。兌換前用[匯率計算機](/finance/currency)先算淨額，再比較管道。"},
                {"type": "callout", "text": "跨境消費時，動態貨幣轉換（DCC）通常比本地貨幣結算更貴。在境外刷卡盡量選當地幣別計費。"},
            ],
        },
        "en": {
            "title": "How Exchange Rates Work: The Logic Behind Currency Conversion",
            "excerpt": "Why does 1 USD equal roughly 7 CNY? Exchange rates aren't set arbitrarily. Use a [currency calculator](/finance/currency) to see your actual net amount and avoid hidden fees.",
            "blocks": [
                {"type": "p", "text": "An exchange rate is essentially the relative price of two currencies, shaped by supply and demand, interest-rate gaps, inflation, and economic expectations."},
                {"type": "h2", "text": "Mid-market rate, cash rate, and fees"},
                {"type": "p", "text": "The rate you see quoted is often not what you end up with. Banks and platforms add a spread and fees on top of the mid-market rate. Use a [currency calculator](/finance/currency) to compute the net amount before comparing channels."},
                {"type": "callout", "text": "When spending abroad, dynamic currency conversion (DCC) is usually more expensive than settling in the local currency. On overseas cards, choose to be charged in the local currency."},
            ],
        },
        "de": {
            "title": "So funktionieren Wechselkurse: Die Logik hinter dem Währungstausch",
            "excerpt": "Warum entspricht 1 USD etwa 7 CNY? Wechselkurse werden nicht willkürlich festgelegt. Nutze einen [Währungsrechner](/finance/currency), um deinen tatsächlichen Nettobetrag zu sehen und versteckte Gebühren zu vermeiden.",
            "blocks": [
                {"type": "p", "text": "Ein Wechselkurs ist im Grunde der relative Preis zweier Währungen, bestimmt von Angebot und Nachfrage, Zinsunterschieden, Inflation und Wirtschaftserwartungen."},
                {"type": "h2", "text": "Referenzkurs, Bargeldkurs und Gebühren"},
                {"type": "p", "text": "Der angezeigte Kurs ist oft nicht das, was du am Ende erhältst. Banken und Plattformen schlagen auf den Referenzkurs einen Spread und Gebühren auf. Nutze einen [Währungsrechner](/finance/currency), um den Nettobetrag zu berechnen, bevor du Angebote vergleichst."},
                {"type": "callout", "text": "Im Ausland ist die dynamische Währungsumrechnung (DCC) meist teurer als die Abrechnung in Landeswährung. Wähle beim Kartenauslandseinsatz die lokale Währung."},
            ],
        },
        "ja": {
            "title": "為替レートの仕組み：通貨換算の裏側のロジック",
            "excerpt": "なぜ 1 米ドルは約 7 元なのか。為替レートは適当に決まっているわけではありません。[通貨計算機](/finance/currency)で実際の受取額を確認し、隠れた手数料を避けましょう。",
            "blocks": [
                {"type": "p", "text": "為替レートとは本質的に二つの通貨の相対価格で、需給・金利差・インフレ・経済見通しによって決まります。"},
                {"type": "h2", "text": "仲値・現金レート・手数料"},
                {"type": "p", "text": "表示される「レート」は多くの場合、最終的に受け取る額ではありません。銀行やプラットフォームは仲値にスプレッドと手数料を上乗せします。換算前に[通貨計算機](/finance/currency)で純額を計算し、渠道を比較しましょう。"},
                {"type": "callout", "text": "海外で決済する際、動的通貨変換（DCC）は現地通貨決済より高くつくことが多いです。外貨カードは現地通貨での請求を選びましょう。"},
            ],
        },
        "es": {
            "title": "Cómo funcionan los tipos de cambio: la lógica detrás de la conversión",
            "excerpt": "¿Por qué 1 USD equivale a unos 7 CNY? Los tipos de cambio no se fijan al azar. Usa una [calculadora de divisas](/finance/currency) para ver tu importe neto real y evitar comisiones ocultas.",
            "blocks": [
                {"type": "p", "text": "Un tipo de cambio es esencialmente el precio relativo de dos monedas, determinado por oferta y demanda, diferencias de tipos de interés, inflación y expectativas económicas."},
                {"type": "h2", "text": "Tipo medio, tipo de efectivo y comisiones"},
                {"type": "p", "text": "El tipo que ves cotizado rara vez es el que recibes. Bancos y plataformas añaden un margen y comisiones sobre el tipo medio. Usa una [calculadora de divisas](/finance/currency) para calcular el importe neto antes de comparar opciones."},
                {"type": "callout", "text": "En el extranjero, la conversión dinámica de moneda (DCC) suele ser más cara que pagar en moneda local. Con tarjetas en el exterior, elige que te cobren en la moneda local."},
            ],
        },
    },
    "mortgage-amortization-explained": {
        "meta": {"date": "2026-08-29", "category": "finance", "readingMinutes": 6},
        "zh": {
            "title": "按揭摊销表看懂了，你才知道利息花在哪",
            "excerpt": "每个月还款里，本金和利息各占多少？前期几乎都在还利息。用[按揭计算器](/finance/mortgage)看清你的还款结构，判断提前还款是否划算。",
            "blocks": [
                {"type": "p", "text": "摊销是指贷款在期限内逐期偿还，每期金额固定，但其中本金与利息的比例不断变化。"},
                {"type": "h2", "text": "前段还息、后段还本金"},
                {"type": "p", "text": "等额本息下，早期还款中利息占比很高，本金还得少。随着本金减少，利息才逐渐下降。用[按揭计算器](/finance/mortgage)查看每年的本金/利息拆分。"},
                {"type": "callout", "text": "低利率时提前还款的节省有限；高利率或手头有余钱时，提前还款能显著减少总利息。结合你的投资回报率权衡。"},
            ],
        },
        "zh-TW": {
            "title": "搞懂按揭攤銷表，才知道利息花在哪",
            "excerpt": "每個月還款裡，本金和利息各佔多少？前期幾乎都在還利息。用[按揭計算機](/finance/mortgage)看清你的還款結構，判斷提前還款是否划算。",
            "blocks": [
                {"type": "p", "text": "攤銷是指貸款在期限內逐期償還，每期金額固定，但其中本金與利息的比例不斷變化。"},
                {"type": "h2", "text": "前段還息、後段還本金"},
                {"type": "p", "text": "等量本息下，早期還款中利息佔比很高，本金還得少。隨著本金減少，利息才逐漸下降。用[按揭計算機](/finance/mortgage)查看每年的本金/利息拆分。"},
                {"type": "callout", "text": "低利率時提前還款的節省有限；高利率或手頭有餘錢時，提前還款能顯著減少總利息。結合你的投資報酬率權衡。"},
            ],
        },
        "en": {
            "title": "Understanding Mortgage Amortization: Where Your Interest Really Goes",
            "excerpt": "Of each monthly payment, how much is principal versus interest? Early on, you're mostly paying interest. Use a [mortgage calculator](/finance/mortgage) to see your repayment structure and judge whether early repayment pays off.",
            "blocks": [
                {"type": "p", "text": "Amortization means the loan is repaid in periodic installments of a fixed amount, but the split between principal and interest shifts every period."},
                {"type": "h2", "text": "Interest first, principal later"},
                {"type": "p", "text": "With a fixed monthly payment, early payments are mostly interest and little principal. As the balance falls, the interest portion shrinks. Use a [mortgage calculator](/finance/mortgage) to see the yearly principal/interest breakdown."},
                {"type": "callout", "text": "When rates are low, the savings from prepayment are limited; at high rates or with spare cash, prepaying can cut total interest substantially. Weigh it against your investment return."},
            ],
        },
        "de": {
            "title": "Hypotheken-Tilgung verstehen: Wo deine Zinsen wirklich hingehen",
            "excerpt": "Wie viel von deiner Monatsrate ist Tilgung und wie viel Zins? Anfangs zahlst du fast nur Zinsen. Nutze einen [Hypothekenrechner](/finance/mortgage), um deine Tilgungsstruktur zu sehen und zu beurteilen, ob Sondertilgungen sich lohnen.",
            "blocks": [
                {"type": "p", "text": "Tilgung bedeutet, dass der Kredit in gleichbleibenden Raten zurückgezahlt wird, wobei sich das Verhältnis von Tilgung und Zinsen jede Periode ändert."},
                {"type": "h2", "text": "Zuerst Zinsen, später Tilgung"},
                {"type": "p", "text": "Bei gleichbleibender Rate sind die frühen Raten vor allem Zinsen und wenig Tilgung. Mit sinkendem Saldo schrumpft der Zinsanteil. Nutze einen [Hypothekenrechner](/finance/mortgage), um die jährliche Aufteilung zu sehen."},
                {"type": "callout", "text": "Bei niedrigen Zinsen bringt Sondertilgung wenig; bei hohen Zinsen oder freiem Kapital kann sie die Gesamtzinsen stark senken. Abwägen gegen deine Anlagerendite."},
            ],
        },
        "ja": {
            "title": "住宅ローンの償却を理解する：利息が本当にどこへ行くか",
            "excerpt": "毎月の返済額のうち、元本と利息はそれぞれいくら？最初のうちはほとんど利息です。[住宅ローン計算機](/finance/mortgage)で返済構造を確認し、繰上げ返済が得かを見極めましょう。",
            "blocks": [
                {"type": "p", "text": "償却とは、ローンを一定額の分割で返済する仕組みですが、元本と利息の割合は期ごとに変化します。"},
                {"type": "h2", "text": "最初は利息、あとで元本"},
                {"type": "p", "text": "一定の月額返済では、初期は利息が多く元本が少ないです。残高が減るにつれ利息部分は縮みます。[住宅ローン計算機](/finance/mortgage)で年ごとの元本/利息の内訳を確認しましょう。"},
                {"type": "callout", "text": "低金利時は繰上げ返済の節約効果は限定的です。高金利時や余剰資金がある場合は総利息を大きく減らせます。運用利回りと比較して判断を。"},
            ],
        },
        "es": {
            "title": "Entiende la amortización de tu hipoteca: dónde van realmente tus intereses",
            "excerpt": "De cada cuota mensual, ¿cuánto es capital y cuánto interés? Al principio pagas sobre todo intereses. Usa una [calculadora de hipoteca](/finance/mortgage) para ver tu estructura de pago y saber si adelantar capital compensa.",
            "blocks": [
                {"type": "p", "text": "Amortizar significa devolver el préstamo en cuotas periódicas de importe fijo, pero la proporción entre capital e intereses cambia en cada periodo."},
                {"type": "h2", "text": "Primero intereses, después capital"},
                {"type": "p", "text": "Con cuota fija, las primeras cuotas son sobre todo intereses y poco capital. Según baja el saldo, baja la parte de intereses. Usa una [calculadora de hipoteca](/finance/mortgage) para ver el desglose anual."},
                {"type": "callout", "text": "Con tipos bajos, adelantar capital ahorra poco; con tipos altos o dinero disponible, puede reducir mucho los intereses totales. Compáralo con tu rentabilidad de inversión."},
            ],
        },
    },
    "roi-evaluating-investments": {
        "meta": {"date": "2026-08-29", "category": "finance", "readingMinutes": 5},
        "zh": {
            "title": "ROI 不是唯一指标：这样评估一笔投资",
            "excerpt": "看到「年化收益 20%」先别激动。用[投资回报率计算器](/finance/roi)算清真实回报，还要把时间、风险和机会成本一起考虑。",
            "blocks": [
                {"type": "p", "text": "ROI（投资回报率）是（收益−成本）/成本，简单直观，但忽略了资金占用的时间。"},
                {"type": "h2", "text": "时间让同样的 ROI 天差地别"},
                {"type": "p", "text": "一年赚 20% 和五年赚 20% 完全不同。评估时用[投资回报率计算器](/finance/roi)看年化口径，并对比无风险收益。"},
                {"type": "callout", "text": "高 ROI 若伴随高波动或长锁定期，未必优于稳健的较低回报。用你的风险承受力做权衡，而非只追数字。"},
            ],
        },
        "zh-TW": {
            "title": "ROI 不是唯一指標：這樣評估一筆投資",
            "excerpt": "看到「年化收益 20%」先別激動。用[投資報酬率計算機](/finance/roi)算清真實回報，還要把時間、風險和機會成本一起考慮。",
            "blocks": [
                {"type": "p", "text": "ROI（投資報酬率）是（收益−成本）/成本，簡單直觀，但忽略了資金佔用的時間。"},
                {"type": "h2", "text": "時間讓同樣的 ROI 天差地別"},
                {"type": "p", "text": "一年賺 20% 和五年賺 20% 完全不同。評估時用[投資報酬率計算機](/finance/roi)看年化口徑，並對比無風險收益。"},
                {"type": "callout", "text": "高 ROI 若伴隨高波動或長鎖定期，未必優於穩健的較低回報。用你的風險承受力做權衡，而非只追數字。"},
            ],
        },
        "en": {
            "title": "ROI Isn't the Only Metric: How to Evaluate an Investment",
            "excerpt": "Don't get excited by '20% annual return' just yet. Use an [ROI calculator](/finance/roi) to find the real return, and factor in time, risk, and opportunity cost.",
            "blocks": [
                {"type": "p", "text": "ROI (return on investment) is (gain − cost) / cost. It's simple and intuitive, but it ignores the time your money is tied up."},
                {"type": "h2", "text": "Time makes the same ROI wildly different"},
                {"type": "p", "text": "Earning 20% in one year is nothing like 20% over five years. Use an [ROI calculator](/finance/roi) to see the annualized figure and compare it with a risk-free return."},
                {"type": "callout", "text": "A high ROI with high volatility or a long lock-up may not beat a steadier, lower return. Weigh it against your risk tolerance, not just the headline number."},
            ],
        },
        "de": {
            "title": "ROI ist nicht die einzige Kennzahl: So bewertest du eine Investition",
            "excerpt": "Lass dich nicht von „20 % Rendite pro Jahr“ beeindrucken. Nutze einen [ROI-Rechner](/finance/roi), um die echte Rendite zu finden, und berücksichtige Zeit, Risiko und Opportunitätskosten.",
            "blocks": [
                {"type": "p", "text": "ROI (Return on Investment) ist (Gewinn − Kosten) / Kosten. Einfach und intuitiv, aber er ignoriert die Zeit, in der dein Geld gebunden ist."},
                {"type": "h2", "text": "Zeit macht denselben ROI völlig unterschiedlich"},
                {"type": "p", "text": "20 % in einem Jahr sind etwas ganz anderes als 20 % über fünf Jahre. Nutze einen [ROI-Rechner](/finance/roi), um die annualisierte Zahl zu sehen und mit einer risikofreien Rendite zu vergleichen."},
                {"type": "callout", "text": "Ein hoher ROI mit hoher Volatilität oder langer Bindung schlägt nicht unbedingt eine stetigere, niedrigere Rendite. Abwägen gegen deine Risikotoleranz, nicht nur die Zahl."},
            ],
        },
        "ja": {
            "title": "ROI だけが指標じゃない：投資の評価のしかた",
            "excerpt": "「年利 20%」だけで興奮しないで。[投資収益率計算機](/finance/roi)で本当のリターンを確かめ、時間・リスク・機会費用も合わせて考えましょう。",
            "blocks": [
                {"type": "p", "text": "ROI（投資収益率）は（利益−コスト）/コストです。シンプルで直感的ですが、資金が拘束される時間を無視しています。"},
                {"type": "h2", "text": "同じ ROI でも期間で雲泥の差"},
                {"type": "p", "text": "1 年で 20% と 5 年で 20% は全く別物です。[投資収益率計算機](/finance/roi)で年率換算を確認し、無リスク収益と比較しましょう。"},
                {"type": "callout", "text": "高 ROI でもボラティリティが高い、あるいは長期拘束がある場合は、安定した低めのリターンに劣ることも。数字だけでなく自分のリスク許容度で判断を。"},
            ],
        },
        "es": {
            "title": "El ROI no es la única métrica: cómo evaluar una inversión",
            "excerpt": "No te entusiasmes aún con «20% anual». Usa una [calculadora de ROI](/finance/roi) para hallar el retorno real y considera también el tiempo, el riesgo y el coste de oportunidad.",
            "blocks": [
                {"type": "p", "text": "El ROI (retorno de inversión) es (ganancia − coste) / coste. Es simple e intuitivo, pero ignora el tiempo que tu dinero está inmovilizado."},
                {"type": "h2", "text": "El tiempo hace que el mismo ROI sea muy distinto"},
                {"type": "p", "text": "Ganar 20% en un año no es lo mismo que 20% en cinco. Usa una [calculadora de ROI](/finance/roi) para ver la cifra anualizada y compárala con un retorno sin riesgo."},
                {"type": "callout", "text": "Un ROI alto con mucha volatilidad o largo bloqueo puede no superar un retorno más estable y menor. Compáralo con tu tolerancia al riesgo, no solo con la cifra."},
            ],
        },
    },
    "calorie-deficit-weight-loss": {
        "meta": {"date": "2026-08-29", "category": "health", "readingMinutes": 5},
        "zh": {
            "title": "热量缺口是减重的唯一真理：怎么算才对",
            "excerpt": "减重没有魔法，只有能量缺口。用[卡路里计算器](/health/calorie-calculator)和[基础代谢率计算器](/health/bmr-calculator)算出你的消耗，再制造合理缺口。",
            "blocks": [
                {"type": "p", "text": "当摄入长期低于消耗，身体就会动用储备，体重下降。这就是热量缺口。"},
                {"type": "h2", "text": "别把缺口设太大"},
                {"type": "p", "text": "每天缺 300–500 大卡通常可持续且不易反弹。先算[基础代谢率计算器](/health/bmr-calculator)得到静息消耗，再加活动量得出总消耗。"},
                {"type": "callout", "text": "极端节食会拉低代谢、流失肌肉。用[卡路里计算器](/health/calorie-calculator)设定温和缺口，配合蛋白质与力量训练更稳。"},
            ],
        },
        "zh-TW": {
            "title": "熱量缺口是減重的唯一真理：怎麼算才對",
            "excerpt": "減重沒有魔法，只有能量缺口。用[卡路里計算機](/health/calorie-calculator)和[基礎代謝率計算機](/health/bmr-calculator)算出你的消耗，再製造合理缺口。",
            "blocks": [
                {"type": "p", "text": "當攝取長期低於消耗，身體就會動用儲備，體重下降。這就是熱量缺口。"},
                {"type": "h2", "text": "別把缺口設太大"},
                {"type": "p", "text": "每天缺 300–500 大卡通常可持續且不易反彈。先算[基礎代謝率計算機](/health/bmr-calculator)得到靜息消耗，再加活動量得出總消耗。"},
                {"type": "callout", "text": "極端節食會拉低代謝、流失肌肉。用[卡路里計算機](/health/calorie-calculator)設定溫和缺口，配合蛋白質與力量訓練更穩。"},
            ],
        },
        "en": {
            "title": "A Calorie Deficit Is the Only Rule for Weight Loss: How to Get It Right",
            "excerpt": "There's no magic to losing weight—only an energy gap. Use a [calorie calculator](/health/calorie-calculator) and a [BMR calculator](/health/bmr-calculator) to find your expenditure, then build a sensible deficit.",
            "blocks": [
                {"type": "p", "text": "When intake stays below expenditure over time, the body taps its reserves and weight falls. That's a calorie deficit."},
                {"type": "h2", "text": "Don't make the deficit too large"},
                {"type": "p", "text": "A daily gap of 300–500 kcal is usually sustainable and less likely to rebound. First use a [BMR calculator](/health/bmr-calculator) for resting burn, then add activity for total expenditure."},
                {"type": "callout", "text": "Extreme dieting lowers metabolism and sheds muscle. Use a [calorie calculator](/health/calorie-calculator) to set a gentle deficit, paired with protein and strength training for stability."},
            ],
        },
        "de": {
            "title": "Ein Kaloriendefizit ist die einzige Regel zum Abnehmen: So machst du es richtig",
            "excerpt": "Abnehmen hat keine Magie – nur eine Energielücke. Nutze einen [Kalorienrechner](/health/calorie-calculator) und einen [BMR-Rechner](/health/bmr-calculator), um deinen Verbrauch zu finden, und baue dann ein sinnvolles Defizit auf.",
            "blocks": [
                {"type": "p", "text": "Wenn die Zufuhr über Zeit unter dem Verbrauch liegt, greift der Körper auf Reserven zurück und das Gewicht sinkt. Das ist ein Kaloriendefizit."},
                {"type": "h2", "text": "Mach das Defizit nicht zu groß"},
                {"type": "p", "text": "Eine tägliche Lücke von 300–500 kcal ist meist haltbar und weniger rückfällig. Nutze zuerst einen [BMR-Rechner](/health/bmr-calculator) für den Ruheumsatz, dann addiere Aktivität für den Gesamtverbrauch."},
                {"type": "callout", "text": "Extreme Diäten senken den Stoffwechsel und bauen Muskeln ab. Nutze einen [Kalorienrechner](/health/calorie-calculator) für ein mildes Defizit, kombiniert mit Protein und Krafttraining."},
            ],
        },
        "ja": {
            "title": "カロリー赤字こそが減量の唯一の真理：正しく計算するには",
            "excerpt": "減量に魔法はなく、あるのはエネルギーの差だけです。[カロリー計算機](/health/calorie-calculator)と[基礎代謝率計算機](/health/bmr-calculator)で消費量を出し、妥当な赤字を作りましょう。",
            "blocks": [
                {"type": "p", "text": "摂取が長期的に消費を下回ると、体は蓄えを使い始め体重は減ります。これがカロリー赤字です。"},
                {"type": "h2", "text": "赤字を大きくしすぎない"},
                {"type": "p", "text": "1 日 300–500 kcal の差が目安で、継続しやすくリバウンドも抑えられます。まず[基礎代謝率計算機](/health/bmr-calculator)で安静時消費を、次に活動分を足して総消費を出します。"},
                {"type": "callout", "text": "極端な食事制限は代謝を下げ筋肉を落とします。[カロリー計算機](/health/calorie-calculator)で穏やかな赤字を設定し、たんぱく質と筋トレを組み合わせましょう。"},
            ],
        },
        "es": {
            "title": "El déficit calórico es la única regla para perder peso: cómo hacerlo bien",
            "excerpt": "Perder peso no tiene magia, solo un hueco energético. Usa una [calculadora de calorías](/health/calorie-calculator) y una [calculadora de TMB](/health/bmr-calculator) para conocer tu gasto y crea un déficit sensato.",
            "blocks": [
                {"type": "p", "text": "Cuando la ingesta se mantiene por debajo del gasto, el cuerpo usa sus reservas y el peso baja. Eso es un déficit calórico."},
                {"type": "h2", "text": "No hagas el déficit demasiado grande"},
                {"type": "p", "text": "Un hueco diario de 300–500 kcal suele ser sostenible y menos propenso al rebote. Primero usa una [calculadora de TMB](/health/bmr-calculator) para el gasto en reposo y suma la actividad para el gasto total."},
                {"type": "callout", "text": "Las dietas extremas bajan el metabolismo y pierden músculo. Usa una [calculadora de calorías](/health/calorie-calculator) para un déficit suave, con proteína y entrenamiento de fuerza."},
            ],
        },
    },
    "heart-rate-training-zones": {
        "meta": {"date": "2026-08-29", "category": "health", "readingMinutes": 4},
        "zh": {
            "title": "心率训练区间：用对强度，练得更聪明",
            "excerpt": "同样的跑步，燃脂和心肺强化需要的强度不同。用[目标心率计算器](/health/target-heart-rate)找到你的区间，让每次训练都有目的。",
            "blocks": [
                {"type": "p", "text": "心率区间把运动强度分层，从恢复、燃脂到无氧，对应不同的能量系统和训练效果。"},
                {"type": "h2", "text": "先算你的最大心率"},
                {"type": "p", "text": "常用估算为 220−年龄，但个体差异大。用[目标心率计算器](/health/target-heart-rate)按百分比划分区间更靠谱。"},
                {"type": "callout", "text": "长期只做高强度反而恢复不足、易受伤。把低强度有氧与间歇结合，进步更稳。"},
            ],
        },
        "zh-TW": {
            "title": "心率訓練區間：用對強度，練得更聰明",
            "excerpt": "同樣的跑步，燃脂和心肺強化需要的強度不同。用[目標心率計算機](/health/target-heart-rate)找到你的區間，讓每次訓練都有目的。",
            "blocks": [
                {"type": "p", "text": "心率區間把運動強度分層，從恢復、燃脂到無氧，對應不同的能量系統和訓練效果。"},
                {"type": "h2", "text": "先算你的最大心率"},
                {"type": "p", "text": "常用估算為 220−年齡，但個體差異大。用[目標心率計算機](/health/target-heart-rate)按百分比劃分區間更靠譜。"},
                {"type": "callout", "text": "長期只做高強度反而恢復不足、易受傷。把低強度有氧與間歇結合，進步更穩。"},
            ],
        },
        "en": {
            "title": "Heart Rate Training Zones: Train Smarter by Using the Right Intensity",
            "excerpt": "The same run serves different goals—fat burn versus cardio fitness need different intensities. Use a [target heart rate calculator](/health/target-heart-rate) to find your zones and give every session a purpose.",
            "blocks": [
                {"type": "p", "text": "Heart rate zones layer training intensity, from recovery and fat burn to anaerobic, each tied to a different energy system and training effect."},
                {"type": "h2", "text": "First find your maximum heart rate"},
                {"type": "p", "text": "The common estimate is 220 − age, but individual variation is large. A [target heart rate calculator](/health/target-heart-rate) that splits zones by percentage is more reliable."},
                {"type": "callout", "text": "Training hard all the time leads to poor recovery and injury. Blend low-intensity cardio with intervals for steadier progress."},
            ],
        },
        "de": {
            "title": "Herzfrequenz-Trainingszonen: Trainiere schlauer mit der richtigen Intensität",
            "excerpt": "Derselbe Lauf erfüllt verschiedene Ziele – Fettverbrennung und Ausdauer brauchen unterschiedliche Intensitäten. Nutze einen [Ziel-Herzfrequenz-Rechner](/health/target-heart-rate), um deine Zonen zu finden und jede Einheit zielgerichtet zu machen.",
            "blocks": [
                {"type": "p", "text": "Herzfrequenzzonen staffeln die Intensität, von Regeneration und Fettverbrennung bis anaerob, jeweils gekoppelt an ein anderes Energiesystem und Trainingswirkung."},
                {"type": "h2", "text": "Bestimme zuerst deine maximale Herzfrequenz"},
                {"type": "p", "text": "Die gängige Schätzung ist 220 − Alter, aber die individuelle Abweichung ist groß. Ein [Ziel-Herzfrequenz-Rechner](/health/target-heart-rate), der Zonen nach Prozent aufteilt, ist zuverlässiger."},
                {"type": "callout", "text": "Ständig hart trainieren führt zu schlechter Regeneration und Verletzungen. Missche niedrigintensives Cardio mit Intervallen für stetigere Fortschritte."},
            ],
        },
        "ja": {
            "title": "心拍数トレーニングゾーン：正しい強度で賢く鍛える",
            "excerpt": "同じランニングでも、脂肪燃焼と心肺強化では求められる強度が違います。[目標心拍数計算機](/health/target-heart-rate)でゾーンを割り出し、毎回のトレーニングに目的を持たせましょう。",
            "blocks": [
                {"type": "p", "text": "心拍数ゾーンは運動強度を層に分け、回復・脂肪燃焼から無酸素まで、それぞれ異なるエネルギーシステムと効果に対応します。"},
                {"type": "h2", "text": "まず最大心拍数を知る"},
                {"type": "p", "text": "よく使われる推定式は 220−年齢ですが、個人差が大きいです。[目標心拍数計算機](/health/target-heart-rate)で割合ごとにゾーンを分ける方が確実です。"},
                {"type": "callout", "text": "常に高強度だけだと回復不足でケガに繋がります。低強度有酸素とインターバルを組み合わせて着実に進みましょう。"},
            ],
        },
        "es": {
            "title": "Zonas de entrenamiento por frecuencia cardíaca: entrena mejor con la intensidad adecuada",
            "excerpt": "La misma carrera sirve para distintos objetivos: quemar grasa o ganar fondo requieren intensidades diferentes. Usa una [calculadora de frecuencia cardíaca objetivo](/health/target-heart-rate) para encontrar tus zonas y darle propósito a cada sesión.",
            "blocks": [
                {"type": "p", "text": "Las zonas de frecuencia cardíaca escalonan la intensidad, desde recuperación y quema de grasa hasta anaeróbico, cada una ligada a un sistema energético distinto."},
                {"type": "h2", "text": "Primero encuentra tu frecuencia cardíaca máxima"},
                {"type": "p", "text": "La estimación común es 220 − edad, pero la variación individual es grande. Una [calculadora de frecuencia cardíaca objetivo](/health/target-heart-rate) que divide porcentajes es más fiable."},
                {"type": "callout", "text": "Entrenar duro siempre lleva a mala recuperación y lesiones. Combina cardio de baja intensidad con intervalos para progresar con estabilidad."},
            ],
        },
    },
}

for loc in LOCALES:
    path = os.path.join(BASE, "src", "messages", f"{loc}.json")
    with open(path, "r", encoding="utf-8") as f:
        d = json.load(f)
    posts = d["blog"]["posts"]
    added = 0
    for slug, data in NEW.items():
        if slug in posts:
            print(f"[skip] {loc}: {slug} already exists")
            continue
        posts[slug] = data[loc]
        added += 1
    with open(path, "w", encoding="utf-8") as f:
        json.dump(d, f, ensure_ascii=False, indent=2)
    print(f"[done] {loc}: added {added} posts (total now {len(posts)})")
print("ALL DONE")
