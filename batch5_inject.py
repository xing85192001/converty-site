# -*- coding: utf-8 -*-
"""Batch 5: 为 18 个高流量工具写入 6 语言 A 层深度文案 (converter.<id>.guide)。"""
import json, os

BASE = "src/messages"
LOCALES = ["zh", "zh-TW", "en", "de", "ja", "es"]

# 每个工具的 guide 内容：按语言组织
TOOLS = {
  # ---------------- finance ----------------
  "tip": {
    "zh": {
      "steps": [
        "选择账单币种与所在地区的常见小费比例（如餐厅 10%–15%、外卖 0%–10%）。",
        "输入账单金额，或输入人数让工具按人均分摊后再计算小费。",
        "查看应付小费、含小费总额，以及按人数拆分后每人应付金额。"
      ],
      "explanationTitle": "小费怎么算？原理与常见比例",
      "formula": "小费 = 账单金额 × 小费比例；总额 = 账单金额 + 小费",
      "explanation": [
        "小费是对服务人员的额外酬谢，金额通常按账单的一定百分比计算。不同国家、不同场景的比例差异很大：北美餐厅普遍 15%–20%，而日本、韩国等地则不流行给小费。",
        "合理的做法是先确定当地习惯比例，再乘以税前或税后账单金额。多人聚餐时，可先按人均分摊账单，再各自计算各自的小费，避免扯平后多付。",
        "本工具同时给出「按总额」与「按人数拆分」两种结果，适合旅行、团建、聚餐等多种场景，几分钟就能算清谁该付多少。"
      ],
      "faq": [
        {"q": "小费应该按税前还是税后算？", "a": "多数地区按税后金额计算更为常见，但也有按税前计算的情况。若不确定，建议以账单显示的小计（subtotal）为基数，并在付款前与服务方确认。"},
        {"q": "多人聚餐怎么平分小费最公平？", "a": "最公平的方式是各自按自己的消费金额乘比例，再补上共同消费的部分；若图省事，也可直接把总小费除以人数，但消费高的人会吃亏。"},
        {"q": "哪些地方其实不需要给小费？", "a": "日本、韩国、新西兰、澳大利亚等服务费常已含在账单中，额外给小费并不普遍；欧洲部分国家则直接收取服务费（service charge），也无需另付。"}
      ]
    },
    "zh-TW": {
      "steps": [
        "選擇帳單幣別與當地常見的小費比例（如餐廳 10%–15%、外送 0%–10%）。",
        "輸入帳單金額，或輸入人數讓工具先按人頭分攤再計算小費。",
        "查看應付小費、含小費總額，以及按人數拆分後每人應付金額。"
      ],
      "explanationTitle": "小費怎麼算？原理與常見比例",
      "formula": "小費 = 帳單金額 × 小費比例；總額 = 帳單金額 + 小費",
      "explanation": [
        "小費是對服務人員的額外酬謝，金額通常按帳單的一定百分比計算。不同國家、不同場景的比例差異很大：北美餐廳普遍 15%–20%，而日本、韓國等地則不流行給小費。",
        "合理的做法是先確定當地習慣比例，再乘以稅前或稅後帳單金額。多人聚餐時，可先按人頭分攤帳單，再各自計算各自的小費，避免攤平後多付。",
        "本工具同時給出「按總額」與「按人數拆分」兩種結果，適合旅行、團建、聚餐等多種場景，幾分鐘就能算清誰該付多少。"
      ],
      "faq": [
        {"q": "小費應該按稅前還是稅後算？", "a": "多數地區按稅後金額計算更為常見，但也有按稅前計算的情況。若不確定，建議以帳單顯示的小計（subtotal）為基數，並在付款前與服務方確認。"},
        {"q": "多人聚餐怎麼平分小費最公平？", "a": "最公平的方式是各自按自己的消費金額乘比例，再補上共同消費的部分；若圖省事，也可直接把總小費除以人數，但消費高的人會吃虧。"},
        {"q": "哪些地方其實不需要給小費？", "a": "日本、韓國、紐西蘭、澳大利亞等服務費常已含在帳單中，額外給小費並不普遍；歐洲部分國家則直接收取服務費（service charge），也無需另付。"}
      ]
    },
    "en": {
      "steps": [
        "Pick the bill currency and the common local tip rate (e.g. restaurant 10%–15%, delivery 0%–10%).",
        "Enter the bill amount, or enter the number of people so the tool splits the bill before tipping.",
        "See the tip due, the total with tip, and each person's share when split by headcount."
      ],
      "explanationTitle": "How to calculate a tip? Logic and common rates",
      "formula": "tip = bill × tip rate; total = bill + tip",
      "explanation": [
        "A tip is an extra gratuity for service staff, usually a percentage of the bill. Rates vary widely by country and setting: North American restaurants commonly use 15%–20%, while Japan and South Korea generally don't expect tips.",
        "The sensible approach is to fix the local custom rate first, then multiply by the pre- or post-tax amount. For group dining, split the bill per person first, then tip each share, so nobody overpays by averaging.",
        "This tool shows both the total-based and per-person results, handy for travel, team events, and dinners—you can settle who owes what in minutes."
      ],
      "faq": [
        {"q": "Should I tip on pre-tax or post-tax?", "a": "Post-tax is more common in most regions, but some use the pre-tax subtotal. When unsure, base it on the subtotal shown and confirm with the establishment before paying."},
        {"q": "How do I split a tip fairly among a group?", "a": "Fairest is each person tips on their own spend plus a share of shared items; simply dividing the total tip by headcount is easier but makes big spenders subsidize the rest."},
        {"q": "Where is tipping actually not expected?", "a": "Japan, South Korea, New Zealand and Australia often include service in the bill, so extra tipping is uncommon; some European countries add a service charge, removing the need to tip separately."}
      ]
    },
    "de": {
      "steps": [
        "Wähle die Währung und den üblichen Trinkgeld-Satz (z. B. Restaurant 10–15 %, Lieferung 0–10 %).",
        "Gib den Rechnungsbetrag ein oder die Personenzahl, damit der Betrag zuerst geteilt wird.",
        "Sieh Trinkgeld, Gesamtbetrag inkl. Trinkgeld und den Anteil pro Person."
      ],
      "explanationTitle": "Wie berechnet man Trinkgeld? Logik und übliche Sätze",
      "formula": "Trinkgeld = Rechnung × Satz; Gesamt = Rechnung + Trinkgeld",
      "explanation": [
        "Trinkgeld ist eine zusätzliche Gratifikation für Servicepersonal, meist ein Prozentsatz der Rechnung. Die Sätze unterscheiden sich stark: In Nordamerika sind 15–20 % üblich, in Japan oder Südkorea gibt man kaum Trinkgeld.",
        "Am besten zuerst den lokalen Satz festlegen und dann mit dem Betrag vor oder nach Steuer multiplizieren. Bei Gruppen zuerst pro Person teilen, dann jeweils das Trinkgeld berechnen, damit niemand überzahlt.",
        "Dieses Werkzeug zeigt sowohl das Gesamt- als auch das pro-Kopf-Ergebnis – praktisch für Reisen, Teamevents und Essen gehen."
      ],
      "faq": [
        {"q": "Auf Basis von Netto oder Brutto trinken?", "a": "In den meisten Regionen wird auf Brutto gezählt, manche nehmen die Netto-Zwischensumme. Bei Unsicherheit am ausgewiesenen Zwischenbetrag orientieren und vor der Zahlung klären."},
        {"q": "Wie teilt man Trinkgeld fair in einer Gruppe?", "a": "Am fairesten trinkt jede Person auf eigenen Verbrauch plus Anteil an Gemeinsamem; einfach durch die Köpfe zu teilen ist einfacher, lässt aber Großverbraucher zahlen."},
        {"q": "Wo ist Trinkgeld nicht üblich?", "a": "Japan, Südkorea, Neuseeland und Australien haben Service oft in der Rechnung enthalten; einige europäische Länder erheben eine Servicegebühr, sodass kein extra Trinkgeld nötig ist."}
      ]
    },
    "ja": {
      "steps": [
        "通貨と現地の一般的なチップ率を選びます（例：飲食店 10–15%、配達 0–10%）。",
        "請求額を入力するか、人数を入力して先に割り勘にします。",
        "チップ額、チップ込みの合計、および人数で割った 1 人あたりの負担を確認します。"
      ],
      "explanationTitle": "チップの計算方法と目安",
      "formula": "チップ = 請求額 × チップ率；合計 = 請求額 + チップ",
      "explanation": [
        "チップは接客への謝礼で、請求額の一定割合が一般的です。国や場面で大きく異なり、北米の飲食店は 15–20 % が標準な一方、日本や韓国ではほとんど習慣がありません。",
        "まず現地の目安率を決め、税込・税抜のいずれかを掛けます。多人数の食事では先に人数で割り、それぞれの負担にチップを乗せると、割り勘で多く払うのを防げます。",
        "本ツールは合計ベースと人数分割の両方を表示し、旅行や会食ですぐに「誰がいくら」を決められます。"
      ],
      "faq": [
        {"q": "税込と税抜、どちらで計算する？", "a": "多くの地域では税込が一般的ですが、税抜の小計を基準にする場合もあります。不確かなら表示の小計を基準にし、支払い前に確認しましょう。"},
        {"q": "多人數でチップを公平に分けるには？", "a": "最も公平なのは各自の利用額に率を掛け、共同分を按分することです。単純に人数で割ると利用の多い人が多く払うことになります。"},
        {"q": "チップが不要な場所は？", "a": "日本・韓国・ニュージーランド・オーストラリアなどはサービス料が込みのことが多く、別途渡す習慣は薄いです。欧州の一部はサービス料を加算します。"}
      ]
    },
    "es": {
      "steps": [
        "Elige la moneda y la propina habitual del lugar (p. ej. restaurante 10–15 %, reparto 0–10 %).",
        "Introduce el importe de la cuenta o el número de personas para dividir antes de calcular la propina.",
        "Consulta la propina, el total con propina y lo que paga cada uno al dividir por headcount."
      ],
      "explanationTitle": "Cómo calcular la propina: lógica y porcentajes habituales",
      "formula": "propina = cuenta × porcentaje; total = cuenta + propina",
      "explanation": [
        "La propina es una gratificación extra para el servicio, normalmente un porcentaje de la cuenta. Varía mucho: en restaurantes de Norteamérica se usan 15–20 %, mientras que en Japón o Corea del Sur barely se da propina.",
        "Lo sensato es fijar primero el porcentaje local y multiplicarlo por el importe antes o después de impuestos. En grupos, reparte la cuenta por persona y luego aplica la propina a cada parte para que nadie pague de más.",
        "Esta herramienta muestra el resultado total y por persona, útil para viajes, eventos y cenas: en minutos sabes quién debe cuánto."
      ],
      "faq": [
        {"q": "¿Con el importe antes o después de impuestos?", "a": "En la mayoría de regiones se usa el importe con impuestos, aunque algunos usan el subtotal sin ellos. Si dudas, basa el cálculo en el subtotal y confírmalo antes de pagar."},
        {"q": "¿Cómo dividir la propina en un grupo?", "a": "Lo más justo es que cada uno propine sobre su consumo más su parte de lo común; dividir el total por cabeza es más fácil pero hace que los que consumen más paguen menos."},
        {"q": "¿Dónde no se espera propina?", "a": "Japón, Corea del Sur, Nueva Zelanda y Australia suelen incluir el servicio en la cuenta; algunos países europeos añaden un cargo por servicio, así que no hace falta propina aparte."}
      ]
    }
  },
  "discount": {
    "zh": {
      "steps": [
        "输入原价与折扣比例（如 20%），或分别输入折后价反向推算折扣。",
        "工具即时算出优惠金额、折后实付价与相当于几折。",
        "如需叠加满减或百分比，可连续计算两步优惠后的最终价。"
      ],
      "explanationTitle": "折扣怎么算？原理与公式",
      "formula": "折后价 = 原价 × (1 − 折扣%)；优惠额 = 原价 − 折后价",
      "explanation": [
        "折扣的本质是按比例的减法：打 8 折等于原价乘以 0.8，打 20% off 等于原价乘以 0.8。看清「打折」与「减百分比」是同一含义，避免被话术误导。",
        "叠加优惠时要区分「先打折再满减」与「先满减再打折」，顺序不同结果不同。一般先打折后满减对消费者更划算，但平台规则各异。",
        "把折扣换算成「几折」更直观：优惠 20% 即 8 折，优惠 35% 约 6.5 折。本工具直接给出实付价与折扣力度，方便比价。"
      ],
      "faq": [
        {"q": "打 8 折和减 20% 一样吗？", "a": "金额上完全一样，都是原价乘 0.8。区别只在说法：『打几折』用乘法，『减百分之几』也是乘法，最终结果一致。"},
        {"q": "满减和打折叠加先算哪个？", "a": "顺序会影响结果。多数电商先打折再判断满减门槛；若门槛是按原价，则先满减再打折更省。看清活动规则最稳妥。"},
        {"q": "怎么快速判断折扣力度？", "a": "用优惠百分比换算：减 30% ≈ 7 折，减 50% = 5 折。折后价越低力度越大，配合是否含税、是否限品类综合判断。"}
      ]
    },
    "zh-TW": {
      "steps": [
        "輸入原價與折扣比例（如 20%），或分別輸入折後價反向推算折扣。",
        "工具即時算出優惠金額、折後實付價與相當於幾折。",
        "如需疊加滿減或百分比，可連續計算兩步優惠後的最終價。"
      ],
      "explanationTitle": "折扣怎麼算？原理與公式",
      "formula": "折後價 = 原價 × (1 − 折扣%)；優惠額 = 原價 − 折後價",
      "explanation": [
        "折扣的本質是按比例的減法：打 8 折等於原價乘以 0.8，打 20% off 等於原價乘以 0.8。看清「打折」與「減百分比」是同一含義，避免被話術誤導。",
        "疊加優惠時要區分「先打折再滿減」與「先滿減再打折」，順序不同結果不同。一般先打折後滿減對消費者更划算，但平台規則各異。",
        "把折扣換算成「幾折」更直觀：優惠 20% 即 8 折，優惠 35% 約 6.5 折。本工具直接給出實付價與折扣力度，方便比價。"
      ],
      "faq": [
        {"q": "打 8 折和減 20% 一樣嗎？", "a": "金額上完全一樣，都是原價乘 0.8。區別只在說法：『打幾折』用乘法，『減百分之幾』也是乘法，最終結果一致。"},
        {"q": "滿減和打折疊加先算哪個？", "a": "順序會影響結果。多數電商先打折再判斷滿減門檻；若門檻是按原價，則先滿減再打折更省。看清活動規則最穩妥。"},
        {"q": "怎麼快速判斷折扣力度？", "a": "用優惠百分比換算：減 30% ≈ 7 折，減 50% = 5 折。折後價越低力度越大，配合是否含稅、是否限品類綜合判斷。"}
      ]
    },
    "en": {
      "steps": [
        "Enter the original price and discount percent (e.g. 20%), or enter the sale price to back-calculate the discount.",
        "The tool instantly shows the saving, the final price, and the equivalent 'fold' discount.",
        "For stacked coupons or thresholds, chain two steps to get the final price."
      ],
      "explanationTitle": "How discounts work: logic and formula",
      "formula": "final = original × (1 − discount%); saving = original − final",
      "explanation": [
        "A discount is proportional subtraction: 20% off means multiplying by 0.8, same as 'pay 80%'. Don't be misled by wording—'X% off' and 'pay (100−X)%' are identical in amount.",
        "When stacking, 'discount then threshold' differs from 'threshold then discount'. Usually discounting first then checking a spend threshold favors the buyer, but platform rules vary.",
        "Converting to 'fold' is intuitive: 20% off ≈ 0.8× (8 折), 35% off ≈ 0.65×. This tool shows the net price and discount strength for easy price comparison."
      ],
      "faq": [
        {"q": "Is 20% off the same as paying 80%?", "a": "Yes, exactly—both multiply the price by 0.8. The wording differs but the final amount is identical."},
        {"q": "Which comes first when stacking coupons and thresholds?", "a": "Order changes the result. Most stores discount first then test the threshold; if the threshold is on the original price, threshold-first is cheaper. Read the rules."},
        {"q": "How do I gauge discount strength quickly?", "a": "Map percent off to fold: 30% off ≈ 0.7× (7 折), 50% off = 0.5×. Lower net price means stronger discount, but also check tax and category limits."}
      ]
    },
    "de": {
      "steps": [
        "Gib den Originalpreis und den Rabatt (z. B. 20 %) ein, oder den reduzierten Preis zur Rückberechnung.",
        "Das Werkzeug zeigt sofort Ersparnis, Finalpreis und das Äquivalent in 'fach'.",
        "Bei gestapelten Gutscheinen oder Schwellen zwei Schritte hintereinander rechnen."
      ],
      "explanationTitle": "So funktionieren Rabatte: Logik und Formel",
      "formula": "Final = Original × (1 − Rabatt%); Ersparnis = Original − Final",
      "explanation": [
        "Ein Rabatt ist proportionale Subtraktion: 20 % Rabatt bedeuten Multiplikation mit 0.8, also '80 % zahlen'. 'X % ab' und '(100−X) % zahlen' sind betraglich identisch.",
        "Beim Stapeln unterscheidet sich 'Rabatt dann Schwelle' von 'Schwelle dann Rabatt'. Meist ist zuerst Rabatt günstiger, doch Plattformregeln variieren.",
        "In 'fach' umrechnen ist intuitiv: 20 % Rabatt ≈ 0.8×, 35 % ≈ 0.65×. Das Werkzeug zeigt Nettopreis und Stärke zur Preisvergleich."
      ],
      "faq": [
        {"q": "Ist 20 % Rabatt dasselbe wie 80 % zahlen?", "a": "Ja, beides multipliziert mit 0.8. Nur die Wortwahl differiert, der Betrag ist gleich."},
        {"q": "Was zuerst bei gestapelten Gutscheinen?", "a": "Die Reihenfolge ändert das Ergebnis. Meist wird zuerst rabattiert, dann die Schwelle geprüft; ist die Schwelle auf Originalpreis, ist Schwelle-zuerst günstiger."},
        {"q": "Wie bewerte ich die Rabattstärke schnell?", "a": "Prozent zu fach: 30 % ≈ 0.7×, 50 % = 0.5×. Niedrigerer Nettopreis = stärker, aber Steuer und Kategoriegrenzen beachten."}
      ]
    },
    "ja": {
      "steps": [
        "定価と割引率（例：20%）を入力するか、割引後価格から逆算します。",
        "割引額、実際の支払額、何割引きかを即座に表示します。",
        "クーポンや条件付き値引きの重ね掛けは 2 段階で最終価格を算出できます。"
      ],
      "explanationTitle": "割引のしくみと計算式",
      "formula": "割引後 = 定価 × (1 − 割引%); 割引額 = 定価 − 割引後",
      "explanation": [
        "割引は比例的な引き算です。20% off は 0.8 を掛けることと同じで、「8 割引き（2 割引き）」と同義です。言い回しにだまされないよう注意しましょう。",
        "重ね掛けでは「先割引→条件」と「先条件→割引」で結果が変わります。多くの店は先割引ですが、条件が定価基準なら先条件の方が安いことも。",
        "『何割引き』に換算すると直感しやすいです。本ツールは実払額と割引の強さを表示し、比価に役立ちます。"
      ],
      "faq": [
        {"q": "2 割引きと 20% off は同じ？", "a": "金額は全く同じで、どちらも 0.8 を掛けます。言い方だけの違いです。"},
        {"q": "クーポンと条件付き値引き、どちらを先に？", "a": "順序で結果が変わります。多くは先割引ですが、条件が定価基準なら先条件の方が安い場合があります。規約を確認してください。"},
        {"q": "割引の強さを素早く見るには？", "a": "割合を割に換算します。30% off ≈ 7 割引き、50% off = 5 割引き。実払額が低いほど強いですが、税や対象品目も合わせて判断を。"}
      ]
    },
    "es": {
      "steps": [
        "Introduce el precio original y el descuento (p. ej. 20 %) o el precio rebajado para calcularlo a la inversa.",
        "La herramienta muestra al instante el ahorro, el precio final y el equivalente en 'pliegues'.",
        "Para cupones o umbrales acumulados, encadena dos pasos hasta el precio final."
      ],
      "explanationTitle": "Cómo funcionan los descuentos: lógica y fórmula",
      "formula": "final = original × (1 − descuento%); ahorro = original − final",
      "explanation": [
        "Un descuento es resta proporcional: 20 % menos equivale a multiplicar por 0.8, lo mismo que 'pagar el 80 %'. 'X % menos' y 'pagar (100−X) %' son iguales en importe.",
        "Al acumular, 'descuento y luego umbral' difiere de 'umbral y luego descuento'. Normalmente el descuento primero favorece al comprador, pero las reglas varían.",
        "Convertir a 'pliegues' ayuda: 20 % menos ≈ 0.8×, 35 % ≈ 0.65×. La herramienta muestra el precio neto y la fuerza del descuento para comparar."
      ],
      "faq": [
        {"q": "¿Es lo mismo 20 % menos que pagar 80 %?", "a": "Sí, exacto: ambos multiplican por 0.8. Cambia solo la frase, el importe es idéntico."},
        {"q": "¿Qué va primero al acumular cupones y umbrales?", "a": "El orden cambia el resultado. Muchas tiendas descuentan primero y luego comprueban el umbral; si el umbral es sobre el original, umbral primero sale más barato."},
        {"q": "¿Cómo evalúo rápido la fuerza del descuento?", "a": "Mapea porcentaje a pliegue: 30 % ≈ 0.7×, 50 % = 0.5×. Precio neto menor = descuento mayor, pero fíjate en impuestos y límites de categoría."}
      ]
    }
  },
  "profit-margin": {
    "zh": {
      "steps": [
        "选择按『成本加成』还是『售价倒推』模式。",
        "输入成本与期望利润率（或输入售价反求成本/利润）。",
        "查看利润额、毛利率、以及达到目标利润所需的最低售价。"
      ],
      "explanationTitle": "利润率怎么算？成本与售价的关系",
      "formula": "毛利率 = (售价 − 成本) ÷ 售价；售价 = 成本 ÷ (1 − 毛利率)",
      "explanation": [
        "毛利率以售价为基数，成本率以成本为基数，两者容易混淆。同样 50% 的『成本加成』并不等于 50% 的『毛利率』——前者是成本的一半作为利润，后者是售价的一半是利润。",
        "定价时常用『成本 ÷ (1 − 目标毛利率)』反推售价。例如成本 80 元、目标毛利率 40%，则售价 = 80 ÷ 0.6 ≈ 133 元。",
        "本工具适合电商、餐饮、自由职业报价，帮助你既覆盖成本又锁定合理利润，避免『卖了却没赚』。"
      ],
      "faq": [
        {"q": "毛利率和成本加成率一样吗？", "a": "不一样。毛利率 = 利润÷售价，成本加成率 = 利润÷成本。同样数字下，成本加成率对应的毛利率更低。"},
        {"q": "我想赚 40% 该定多少价？", "a": "用 售价 = 成本 ÷ (1 − 40%)。成本 100 元时售价约 167 元，其中利润约 67 元，毛利率正是 40%。"},
        {"q": "为什么实际到手利润比算的低？", "a": "往往漏算了平台佣金、运费、退款、税费。把这些当作『隐性成本』并入成本后再倒推售价，利润才稳。"}
      ]
    },
    "zh-TW": {
      "steps": [
        "選擇按『成本加成』還是『售價倒推』模式。",
        "輸入成本與期望利潤率（或輸入售價反求成本/利潤）。",
        "查看利潤額、毛利率、以及達成目標利潤所需的最低售價。"
      ],
      "explanationTitle": "利潤率怎麼算？成本與售價的關係",
      "formula": "毛利率 = (售價 − 成本) ÷ 售價；售價 = 成本 ÷ (1 − 毛利率)",
      "explanation": [
        "毛利率以售價為基數，成本率以成本為基數，兩者容易混淆。同樣 50% 的『成本加成』並不等於 50% 的『毛利率』——前者是成本的一半作為利潤，後者是售價的一半是利潤。",
        "定價時常用『成本 ÷ (1 − 目標毛利率)』反推售價。例如成本 80 元、目標毛利率 40%，則售價 = 80 ÷ 0.6 ≈ 133 元。",
        "本工具適合電商、餐飲、自由職業報價，幫助你既覆蓋成本又鎖定合理利潤，避免『賣了卻沒賺』。"
      ],
      "faq": [
        {"q": "毛利率和成本加成率一樣嗎？", "a": "不一樣。毛利率 = 利潤÷售價，成本加成率 = 利潤÷成本。同樣數字下，成本加成率對應的毛利率更低。"},
        {"q": "我想賺 40% 該定多少價？", "a": "用 售價 = 成本 ÷ (1 − 40%)。成本 100 元時售價約 167 元，其中利潤約 67 元，毛利率正是 40%。"},
        {"q": "為什麼實際到手利潤比算的低？", "a": "往往漏算了平台佣金、運費、退款、稅費。把這些當作『隱性成本』併入成本後再倒推售價，利潤才穩。"}
      ]
    },
    "en": {
      "steps": [
        "Choose 'cost-plus' or 'price-backward' mode.",
        "Enter cost and target margin (or enter price to solve for cost/profit).",
        "See profit, gross margin, and the minimum price to hit your target."
      ],
      "explanationTitle": "How margin works: cost vs price",
      "formula": "margin = (price − cost) ÷ price; price = cost ÷ (1 − margin)",
      "explanation": [
        "Margin is based on price, markup on cost—easy to confuse. A 50% 'markup' is NOT a 50% 'margin': markup puts half the cost as profit, while margin puts half the price as profit.",
        "To price, use 'cost ÷ (1 − target margin)'. E.g. cost 80, target margin 40% → price = 80 ÷ 0.6 ≈ 133.",
        "Useful for e-commerce, restaurants, and freelancers to cover costs and lock in real profit instead of 'selling but not earning'."
      ],
      "faq": [
        {"q": "Is margin the same as markup?", "a": "No. Margin = profit÷price, markup = profit÷cost. At the same number, markup implies a lower margin."},
        {"q": "What price for 40% profit?", "a": "price = cost ÷ (1 − 40%). At cost 100, price ≈ 167, profit ≈ 67, margin exactly 40%."},
        {"q": "Why is real profit lower than calculated?", "a": "Hidden costs like platform fees, shipping, refunds, and taxes are often missed. Fold them into cost before pricing back."}
      ]
    },
    "de": {
      "steps": [
        "Wähle 'Aufschlag' oder 'Preis rückwärts'.",
        "Gib Kosten und Zielmarge ein (oder Preis, um Kosten/Gewinn zu lösen).",
        "Sieh Gewinn, Bruttomarge und den Mindestpreis fürs Ziel."
      ],
      "explanationTitle": "So funktioniert Marge: Kosten vs. Preis",
      "formula": "Marge = (Preis − Kosten) ÷ Preis; Preis = Kosten ÷ (1 − Marge)",
      "explanation": [
        "Marge basiert auf Preis, Aufschlag auf Kosten—leicht zu verwechseln. 50 % Aufschlag sind NICHT 50 % Marge: Aufschlag macht halbe Kosten zum Gewinn, Marge halben Preis.",
        "Zur Preisfindung: Kosten ÷ (1 − Zielmarge). Kosten 80, Ziel 40 % → Preis = 80 ÷ 0.6 ≈ 133.",
        "Nützlich für E-Commerce, Gastronomie und Freelancer, um Kosten zu decken und echten Gewinn zu sichern."
      ],
      "faq": [
        {"q": "Marge gleich Aufschlag?", "a": "Nein. Marge = Gewinn÷Preis, Aufschlag = Gewinn÷Kosten. Gleiche Zahl → Aufschlag bedeutet niedrigere Marge."},
        {"q": "Welcher Preis für 40 % Gewinn?", "a": "Preis = Kosten ÷ (1 − 40 %). Bei Kosten 100 → ≈ 167, Gewinn ≈ 67, Marge genau 40 %."},
        {"q": "Warum ist der reale Gewinn niedriger?", "a": "Plattformgebühren, Versand, Retouren, Steuern fehlen oft. Diese als versteckte Kosten einrechnen, dann Preis rückwärts."}
      ]
    },
    "ja": {
      "steps": [
        "『原価加算』か『価格逆算』モードを選びます。",
        "原価と目標利益率を入力するか、価格から原価・利益を求めます。",
        "利益額、粗利率、目標達成に必要な最低価格を確認します。"
      ],
      "explanationTitle": "利益率のしくみ：原価と価格",
      "formula": "粗利率 = (価格 − 原価) ÷ 価格；価格 = 原価 ÷ (1 − 粗利率)",
      "explanation": [
        "粗利率は価格基準、値入率は原価基準で混同しやすいです。『原価の 50% 上乗せ』は『価格の 50% が利益』と同じではありません。",
        "価格決めは『原価 ÷ (1 − 目標粗利率)』。原価 80、目標 40% なら 80 ÷ 0.6 ≈ 133。",
        "EC・飲食・フリーランスの見積もりに便利で、原価をカバーしつつ適正利益を確保できます。"
      ],
      "faq": [
        {"q": "粗利率と値入率は同じ？", "a": "違います。粗利率 = 利益÷価格、値入率 = 利益÷原価。同じ数字でも値入率の方が粗利率より高くなります。"},
        {"q": "40% 稼ぐにはいくらにする？", "a": "価格 = 原価 ÷ (1 − 40%)。原価 100 なら約 167、利益約 67、粗利率はちょうど 40%。"},
        {"q": "なぜ実際の利益が計算より低い？", "a": "手数料・送料・返品・税などの『隠れた原価』を見落としがちです。これらを原価に含めてから逆算しましょう。"}
      ]
    },
    "es": {
      "steps": [
        "Elig modo 'sobre costo' o 'precio inverso'.",
        "Introduce coste y margen objetivo (o precio para resolver coste/beneficio).",
        "Consulta beneficio, margen bruto y el precio mínimo para tu objetivo."
      ],
      "explanationTitle": "Cómo funciona el margen: coste vs precio",
      "formula": "margen = (precio − coste) ÷ precio; precio = coste ÷ (1 − margen)",
      "explanation": [
        "El margen se basa en el precio, el recargo en el coste: fácil de confundir. Un recargo del 50 % NO es margen del 50 %: el recargo pone la mitad del coste como beneficio.",
        "Para fijar precio: coste ÷ (1 − margen objetivo). Coste 80, margen 40 % → precio = 80 ÷ 0.6 ≈ 133.",
        "Útil para e-commerce, restauración y autónomos para cubrir costes y asegurar beneficio real."
      ],
      "faq": [
        {"q": "¿Margen es lo mismo que recargo?", "a": "No. Margen = beneficio÷precio, recargo = beneficio÷coste. Al mismo número, el recargo implica margen menor."},
        {"q": "¿Qué precio para 40 % de beneficio?", "a": "precio = coste ÷ (1 − 40 %). Coste 100 → ≈ 167, beneficio ≈ 67, margen exacto 40 %."},
        {"q": "¿Por qué el beneficio real es menor?", "a": "Suelen faltar comisiones, envío, devoluciones e impuestos. Inclúyelos en el coste antes de calcular a la inversa."}
      ]
    }
  },
  "break-even": {
    "zh": {
      "steps": [
        "输入固定成本（房租、工资等不随销量变的支出）。",
        "输入单位变动成本与单位售价，或单件利润。",
        "查看盈亏平衡点销量、对应金额，以及安全边际示意。"
      ],
      "explanationTitle": "盈亏平衡怎么算？固定与变动成本",
      "formula": "平衡点销量 = 固定成本 ÷ (单价 − 单位变动成本)",
      "explanation": [
        "盈亏平衡点（Break-even）是『不赚不赔』的销量：总固定成本被单件贡献毛利（售价−变动成本）逐步覆盖的那个点。",
        "固定成本越高，或单件利润越低，平衡点越高，经营风险越大。降价促销虽能冲量，但会抬高平衡点，需要更大销量才能回本。",
        "本工具帮你回答『卖多少才不亏』，适合开店、上线新品、接项目前的可行性判断。"
      ],
      "faq": [
        {"q": "固定成本和变动成本怎么区分？", "a": "固定成本不随产量变（房租、月薪、软件订阅）；变动成本随销量走（原料、包装、按单运费）。区分清楚才能算准贡献毛利。"},
        {"q": "降价会让平衡点变高还是变低？", "a": "通常变高。单价下降→单件利润下降→需要卖更多件才能覆盖固定成本，回本更难。"},
        {"q": "安全边际是什么？", "a": "实际销量超过平衡点的部分。安全边际越大，越能承受销量下滑而不亏损。"}
      ]
    },
    "zh-TW": {
      "steps": [
        "輸入固定成本（房租、薪資等不隨銷量變的支出）。",
        "輸入單位變動成本與單位售價，或單件利潤。",
        "查看損益平衡點銷量、對應金額，以及安全邊際示意。"
      ],
      "explanationTitle": "損益平衡怎麼算？固定與變動成本",
      "formula": "平衡點銷量 = 固定成本 ÷ (單價 − 單位變動成本)",
      "explanation": [
        "損益平衡點（Break-even）是『不賺不賠』的銷量：總固定成本被單件貢獻毛利（售價−變動成本）逐步覆蓋的那個點。",
        "固定成本越高，或單件利潤越低，平衡點越高，經營風險越大。降價促銷雖能衝量，但會抬高平衡點，需要更大銷量才能回本。",
        "本工具幫你回答『賣多少才不虧』，適合開店、上線新品、接專案前的可行性判斷。"
      ],
      "faq": [
        {"q": "固定成本和變動成本怎麼區分？", "a": "固定成本不隨產量變（房租、月薪、軟體訂閱）；變動成本隨銷量走（原料、包裝、按單運費）。區分清楚才能算準貢獻毛利。"},
        {"q": "降價會讓平衡點變高還是變低？", "a": "通常變高。單價下降→單件利潤下降→需要賣更多件才能覆蓋固定成本，回本更難。"},
        {"q": "安全邊際是什麼？", "a": "實際銷量超過平衡點的部分。安全邊際越大，越能承受銷量下滑而不虧損。"}
      ]
    },
    "en": {
      "steps": [
        "Enter fixed costs (rent, salaries—costs that don't vary with volume).",
        "Enter unit variable cost and unit price, or per-unit profit.",
        "See the break-even quantity, the matching revenue, and a safety-margin hint."
      ],
      "explanationTitle": "Break-even: fixed vs variable costs",
      "formula": "break-even qty = fixed cost ÷ (price − unit variable cost)",
      "explanation": [
        "The break-even point is the 'no profit, no loss' volume where total fixed costs are covered by per-unit contribution margin (price − variable cost).",
        "Higher fixed costs or lower per-unit profit raise the break-even point and the risk. Discounting boosts volume but raises the point, needing more sales to recover.",
        "This tool answers 'how many must I sell to not lose money'—useful before opening a shop, launching a product, or taking a project."
      ],
      "faq": [
        {"q": "Fixed vs variable cost?", "a": "Fixed stays flat with output (rent, salary, subscriptions); variable moves with volume (materials, packaging, per-order shipping). Clear split gives accurate margin."},
        {"q": "Does discounting raise or lower break-even?", "a": "Usually raises it. Lower price → lower per-unit profit → more units needed to cover fixed costs."},
        {"q": "What is safety margin?", "a": "The amount actual sales exceed break-even. Bigger margin means more cushion against falling sales without loss."}
      ]
    },
    "de": {
      "steps": [
        "Fixkosten eingeben (Miete, Gehälter – volumenunabhängig).",
        "Stückvariable Kosten und Preis bzw. Stückgewinn eingeben.",
        "Menge, Umsatz und Sicherheitsmarge beim Break-even sehen."
      ],
      "explanationTitle": "Break-even: Fix vs. variabel",
      "formula": "BE-Menge = Fixkosten ÷ (Preis − variabele Stückkosten)",
      "explanation": [
        "Der Break-even-Punkt ist die 'ohne Verlust'-Menge, bei der Fixkosten durch die Stückdeckungsbeitrag (Preis − variable Kosten) gedeckt sind.",
        "Höhere Fixkosten oder niedrigerer Stückgewinn erhöhen den Punkt und das Risiko. Rabatte steigern Volumen, heben aber den Punkt.",
        "Die Herramienta beantwortet 'wie viele verkaufen, um nicht zu verlieren'—nützlich vor Shop-Start, Produktlaunch oder Projekt."
      ],
      "faq": [
        {"q": "Fix vs. variabel?", "a": "Fix bleibt gleich (Miete, Gehalt, Abos); variabel folgt dem Volumen (Material, Versand). Saubere Trennung gibt genaue Marge."},
        {"q": "Rabatt erhöht oder senkt Break-even?", "a": "Meist erhöht. Niedrigerer Preis → weniger Stückgewinn → mehr Einheiten nötig."},
        {"q": "Was ist Sicherheitsmarge?", "a": "Wie weit Ist-Menge über Break-even liegt. Größer = mehr Puffer gegen Nachfrageschwankung."}
      ]
    },
    "ja": {
      "steps": [
        "固定費（家賃・給与など量に依存しない支出）を入力します。",
        "単位変動費と単価、または単体利益を入力します。",
        "損益分岐点の販売数・金額・安全余裕度の目安を確認します。"
      ],
      "explanationTitle": "損益分岐点：固定費と変動費",
      "formula": "分岐点販売数 = 固定費 ÷ (単価 − 単位変動費)",
      "explanation": [
        "損益分岐点（Break-even）は『利益も損失もない』販売数で、固定費が単体粗利（単価−変動費）で埋められる点です。",
        "固定費が高い、または単体利益が低いほど分岐点は高く、リスクも大きくなります。値下げは量を伸ばしますが分岐点を押し上げ、回収に更多くの台数が要ります。",
        "『いくつ売れば損しないか』に答えるツールで、出店・新商品・受託前の判断に役立ちます。"
      ],
      "faq": [
        {"q": "固定費と変動費の違いは？", "a": "固定費は量に関係なく一定（家賃・月給・サブスク）；変動費は販売に連動（材料・梱包・送料）。明確な区分で粗利が正確に。"},
        {"q": "値下げで分岐点は上がる？", "a": "通常上がります。単価低下→単体利益低下→固定費を埋めるため更多くの台数が必要に。"},
        {"q": "安全余裕度とは？", "a": "実販売数が分岐点を超える分です。大きいほど販売減に強く、赤字になりにくいです。"}
      ]
    },
    "es": {
      "steps": [
        "Introduce costes fijos (alquiler, salarios—no varían con el volumen).",
        "Introduce coste variable unitario y precio, o beneficio por unidad.",
        "Ve cantidad de equilibrio, ingreso equivalente y una pista de margen de seguridad."
      ],
      "explanationTitle": "Punto de equilibrio: fijos vs variables",
      "formula": "q. equilibrio = coste fijo ÷ (precio − coste variable unit.)",
      "explanation": [
        "El punto de equilibrio es el volumen 'sin pérdida' donde los fijos se cubren con el margen unitario (precio − variable).",
        "Más fijos o menor margen suben el punto y el riesgo. Los descuentos suben volumen pero elevan el punto, exigiendo más ventas.",
        "Responde 'cuánto vender para no perder'—útil antes de abrir, lanzar o aceptar un proyecto."
      ],
      "faq": [
        {"q": "¿Fijo vs variable?", "a": "Fijo es plano (alquiler, sueldo, suscripciones); variable sigue el volumen (material, envío). La separación da margen exacto."},
        {"q": "¿El descuento sube o baja el equilibrio?", "a": "Suele subirlo. Menor precio → menor margen → más unidades para cubrir fijos."},
        {"q": "¿Qué es margen de seguridad?", "a": "Cuánto superan las ventas reales el equilibrio. Mayor margen = más colchón ante caídas."}
      ]
    }
  },
  "auto-loan": {
    "zh": {
      "steps": [
        "输入车辆总价、首付比例或金额、贷款年限与年利率。",
        "选择等额本息（每月相同）或等额本金（前期多后期少）。",
        "查看月供、总利息、总还款额，以及提前还款的节省示意。"
      ],
      "explanationTitle": "车贷月供怎么算？等额本息与等额本金",
      "formula": "月供 ≈ 本金×月利率×(1+月利率)^期数 ÷ ((1+月利率)^期数 − 1)",
      "explanation": [
        "车贷多采用等额本息：每月还款额固定，前期利息占比高、本金占比低，后期反过来。等额本金则每月本金固定，月供递减。",
        "利率和期限对总利息影响极大。同样 20 万贷款，年利率从 4% 升到 8%，总利息可能翻倍；缩短 1 年期限也能省下可观利息。",
        "本工具帮你横向比较不同首付、期限、利率组合，挑出月供压力和总利息都更优的方案。"
      ],
      "faq": [
        {"q": "等额本息和等额本金哪个划算？", "a": "总利息上等额本金更少，但前期月供更高。若现金流紧张选等额本息；若想省利息且前期还得起，选等额本金。"},
        {"q": "零利率车贷真的免息吗？", "a": "往往通过提高车价或手续费变相收息，且免息常限短期限。用本工具对比『免息车价』与『普通贷款车价』才知真实成本。"},
        {"q": "提前还款能省多少？", "a": "提前还的是本金，后续利息不再产生。节省额取决于剩余本金与剩余期限，越早还节省越多（注意是否有违约金）。"}
      ]
    },
    "zh-TW": {
      "steps": [
        "輸入車輛總價、自備款比例或金額、貸款年限與年利率。",
        "選擇本息平均（每月相同）或本金平均（前期多後期少）。",
        "查看月付、總利息、總還款額，以及提前還款的省息示意。"
      ],
      "explanationTitle": "車貸月付怎麼算？本息平均與本金平均",
      "formula": "月付 ≈ 本金×月利率×(1+月利率)^期數 ÷ ((1+月利率)^期數 − 1)",
      "explanation": [
        "車貸多採本息平均：每月還款額固定，前期利息佔比高、本金佔比低，後期反過來。本金平均則每月本金固定，月付遞減。",
        "利率和期限對總利息影響極大。同樣 20 萬貸款，年利率從 4% 升到 8%，總利息可能翻倍；縮短 1 年期限也能省下可觀利息。",
        "本工具幫你橫向比較不同自備款、期限、利率組合，挑出月付壓力和總利息都更優的方案。"
      ],
      "faq": [
        {"q": "本息平均和本金平均哪個划算？", "a": "總利息上本金平均更少，但前期月付更高。若現金流緊張選本息平均；若想省利息且前期還得起，選本金平均。"},
        {"q": "零利率車貸真的免息嗎？", "a": "往往透過提高車價或手續費變相收息，且免息常限短期限。用本工具對比『免息車價』與『普通貸款車價』才知真實成本。"},
        {"q": "提前還款能省多少？", "a": "提前還的是本金，後續利息不再產生。节省額取決於剩餘本金與剩餘期限，越早還节省越多（注意是否有違約金）。"}
      ]
    },
    "en": {
      "steps": [
        "Enter car price, down payment (percent or amount), term, and annual rate.",
        "Pick equal-installment (flat monthly) or equal-principal (higher early, lower later).",
        "See monthly payment, total interest, total repaid, and early-payoff savings."
      ],
      "explanationTitle": "Auto loan payment: equal installment vs equal principal",
      "formula": "payment ≈ P×r×(1+r)^n ÷ ((1+r)^n − 1)",
      "explanation": [
        "Auto loans usually use equal installment: fixed monthly payment, with interest dominating early and principal later. Equal principal keeps principal flat and payments decline.",
        "Rate and term hugely affect total interest. On a 200k loan, 4%→8% can double the interest; shortening by a year also saves a lot.",
        "Compare down-payment, term, and rate combos to pick the plan with both manageable payment and lower total interest."
      ],
      "faq": [
        {"q": "Which is better, equal installment or principal?", "a": "Equal principal pays less total interest but higher early payments. Choose installment if cash-flow tight; principal if you can afford early and want savings."},
        {"q": "Is 0% financing really free?", "a": "Often the rate is baked into a higher car price or fees, and 0% is short-term. Compare '0% price' vs 'normal loan price' for true cost."},
        {"q": "How much does early payoff save?", "a": "You pay principal early, so later interest stops. Savings depend on remaining principal and term—earlier pays off more (watch prepayment penalties)."}
      ]
    },
    "de": {
      "steps": [
        "Auto-Preis, Anzahlung (Prozent oder Betrag), Laufzeit und Zins eingeben.",
        "Rate (gleich) oder Tilgung (anfangs hoch, später niedrig) wählen.",
        "Monatsrate, Zinsen gesamt, Gesamtrückzahlung und Vorabtilgung sehen."
      ],
      "explanationTitle": "Autokredit: gleichmäßige Rate vs. Tilgung",
      "formula": "Rate ≈ P×r×(1+r)^n ÷ ((1+r)^n − 1)",
      "explanation": [
        "Autokredite nutzen meist gleiche Rate: fester Monatsbetrag, Zins zuerst hoch, Tilgung später. Bei Tilgung bleibt die Tilgung gleich, die Rate sinkt.",
        "Zins und Laufzeit beeinflussen die Gesamtzinsen stark. Bei 200k Kredit verdoppelt 4%→8% die Zinsen; ein Jahr kürzer spart viel.",
        "Vergleiche Anzahlung, Laufzeit und Zins, um Plan mit tragbarer Rate und niedrigen Zinsen zu wählen."
      ],
      "faq": [
        {"q": "Was ist besser, Rate oder Tilgung?", "a": "Tilgung spart Zinsen, aber hohe Anfangsraten. Rate bei knapper Liquidität; Tilgung wenn früh tragbar und sparend."},
        {"q": "Ist 0 % Finanzierung wirklich gratis?", "a": "Oft im höheren Preis oder Gebühren versteckt und kurzfristig. '0%-Preis' vs 'Normalpreis' vergleichen."},
        {"q": "Wie viel spart Vorabtilgung?", "a": "Man zahlt früh Tilgung, später Zinsen entfallen. Ersparnis hängt von Resttilgung und Laufzeit ab—je früher, desto mehr (Strafe beachten)."}
      ]
    },
    "ja": {
      "steps": [
        "車両価格、頭金（比率か金額）、期間、年率を入力します。",
        "元利均等方式（毎月同じ）か本金均等方式（前期多め）を選びます。",
        "月額、総利息、総返済額、繰上返済の節約目安を確認します。"
      ],
      "explanationTitle": "車のローン返済：元利均等と本金均等",
      "formula": "月額 ≈ 元本×月利×(1+月利)^回数 ÷ ((1+月利)^回数 − 1)",
      "explanation": [
        "車ローンは元利均等が一般的で、毎月の返済額は一定、前期は利息比率が高く後期は元本比率が高くなります。本金均等は元本が一定で月額は逓減します。",
        "金利と期間は総利息に大きく響きます。200万の借入で年率 4%→8% は利息が倍増し、1年短縮でもかなり節約できます。",
        "頭金・期間・金利の組み合わせを比較し、月額負担と総利息のバランスを選べます。"
      ],
      "faq": [
        {"q": "元利均等と本金均等どちらが得？", "a": "総利息は本金均等の方が少ないが、前期の月額が高いです。資金繰りが厳しければ元利均等、利息を省きたく前期が払えれば本金均等。"},
        {"q": "ゼロ金利は本当に無料？", "a": "車両価格の上乗せや手数料に上乗せされていることが多く、短期限定です。『ゼロ金利価格』と『通常ローン価格』を比べて真のコストを。"},
        {"q": "繰上返済でいくら省く？", "a": "早期に元本を返すので以降の利息が止まります。節約額は残元本と残期間次第で、早いほど多い（違約金に注意）。"}
      ]
    },
    "es": {
      "steps": [
        "Introduce precio, enganche (porcentaje o monto), plazo y tasa anual.",
        "Elig cuota fija o capital fijo (alta al inicio, baja después).",
        "Ver cuota, interés total, total pagado y ahorro por prepago."
      ],
      "explanationTitle": "Pago de auto: cuota fija vs capital fijo",
      "formula": "cuota ≈ P×r×(1+r)^n ÷ ((1+r)^n − 1)",
      "explanation": [
        "Los préstamos de auto usan cuota fija: pago mensual constante, con interés alto al inicio y capital al final. Capital fijo mantiene el capital y baja la cuota.",
        "Tasa y plazo afectan mucho el interés total. En 200k, 4%→8% puede duplicar el interés; un año menos ahorra bastante.",
        "Compara enganche, plazo y tasa para elegir plan con cuota manejable y menos interés."
      ],
      "faq": [
        {"q": "¿Cuota fija o capital fijo, cuál conviene?", "a": "Capital fijo paga menos interés pero cuotas iniciales altas. Cuota fija si la liquidez aprieta; capital fijo si puedes y quieres ahorrar."},
        {"q": "¿El 0 % es realmente gratis?", "a": "A menudo está en el precio más alto o comisiones, y es corto. Compara 'precio 0 %' vs 'precio con préstamo'."},
        {"q": "¿Cuánto ahorra el prepago?", "a": "Pagas capital pronto, el interés posterior se detiene. Depende del capital restante y plazo—antes ahorra más (ojo con penalización)."}
      ]
    }
  },
  "personal-loan": {
    "zh": {
      "steps": [
        "输入借款金额、年化利率（APR）与期限（月或年）。",
        "选择还款方式：等额本息最常见。",
        "查看月供、总利息、总还款，并对比不同期限的负担。"
      ],
      "explanationTitle": "个人贷款月供怎么算？APR 与期限",
      "formula": "月供 ≈ 本金×月利率×(1+月利率)^期数 ÷ ((1+月利率)^期数 − 1)",
      "explanation": [
        "个人信用贷多为等额本息，每月还款固定。关键变量是 APR（年化利率）和期限：APR 决定资金成本，期限决定月供压力。",
        "同样 10 万元，APR 从 6% 到 18%，总利息可相差数倍。期限拉得越长月供越低，但总利息越高——别只看月供轻松就选长期。",
        "本工具帮你把『月供舒适度』和『总利息成本』放在一起对比，避免被低月供误导而多付利息。"
      ],
      "faq": [
        {"q": "APR 和月利率怎么换算？", "a": "月利率 = APR ÷ 12。例如年化 12% 对应月利率 1%。注意有些宣传用『月费率』而非真实 APR，换算后成本更高。"},
        {"q": "期限越长越划算吗？", "a": "月供更低但不划算——总利息更高。仅当你更需要降低月供压力时才选长期，否则优先短期限省息。"},
        {"q": "为什么实际到手比借的少？", "a": "可能含一次性手续费、担保费或砍头息（先扣利息）。看 APR 和总还款额，而非只看月供。"}
      ]
    },
    "zh-TW": {
      "steps": [
        "輸入借款金額、年化利率（APR）與期限（月或年）。",
        "選擇還款方式：本息平均最常見。",
        "查看月付、總利息、總還款，並對比不同期限的負擔。"
      ],
      "explanationTitle": "個人貸款月付怎麼算？APR 與期限",
      "formula": "月付 ≈ 本金×月利率×(1+月利率)^期數 ÷ ((1+月利率)^期數 − 1)",
      "explanation": [
        "個人信用貸款多為本息平均，每月還款固定。關鍵變數是 APR（年化利率）和期限：APR 決定資金成本，期限決定月付壓力。",
        "同樣 10 萬元，APR 從 6% 到 18%，總利息可相差數倍。期限拉得越長月付越低，但總利息越高——別只看月付輕鬆就選長期。",
        "本工具幫你把『月付舒适度』和『總利息成本』放在一起對比，避免被低月付誤導而多付利息。"
      ],
      "faq": [
        {"q": "APR 和月利率怎麼換算？", "a": "月利率 = APR ÷ 12。例如年化 12% 對應月利率 1%。注意有些宣傳用『月費率』而非真實 APR，換算後成本更高。"},
        {"q": "期限越長越划算嗎？", "a": "月付更低但不划算——總利息更高。僅當你更需要降低月付壓力時才選長期，否則優先短期限省息。"},
        {"q": "為什麼實際到手比借的少？", "a": "可能含一次性手續費、擔保費或砍頭息（先扣利息）。看 APR 和總還款額，而非只看月付。"}
      ]
    },
    "en": {
      "steps": [
        "Enter loan amount, APR, and term (months or years).",
        "Pick repayment: equal installment is most common.",
        "See monthly payment, total interest, total repaid, and compare terms."
      ],
      "explanationTitle": "Personal loan payment: APR and term",
      "formula": "payment ≈ P×r×(1+r)^n ÷ ((1+r)^n − 1)",
      "explanation": [
        "Personal loans usually use equal installment with a fixed monthly payment. The key variables are APR (cost of money) and term (monthly pressure).",
        "On 100k, APR 6%→18% can multiply total interest several times. Longer term lowers the monthly but raises total interest—don't pick long just because it's easy.",
        "This tool puts 'payment comfort' and 'total cost' side by side so low monthly payments don't hide extra interest."
      ],
      "faq": [
        {"q": "APR to monthly rate?", "a": "monthly = APR ÷ 12. 12% APR → 1% monthly. Some ads use 'monthly fee rate' not real APR, which is costlier after conversion."},
        {"q": "Is a longer term better?", "a": "Lower payment but worse—more total interest. Choose long only if you need lower payments; otherwise prefer short to save."},
        {"q": "Why is the payout less than I borrowed?", "a": "Upfront fees, guarantee fees, or pre-deducted interest. Look at APR and total repaid, not just the monthly."}
      ]
    },
    "de": {
      "steps": [
        "Kreditbetrag, APR und Laufzeit (Monate/Jahre) eingeben.",
        "Rückzahlung wählen: gleiche Rate am üblichsten.",
        "Monatsrate, Zinsen, Gesamt und Terminvergleich sehen."
      ],
      "explanationTitle": "Privatkredit: APR und Laufzeit",
      "formula": "Rate ≈ P×r×(1+r)^n ÷ ((1+r)^n − 1)",
      "explanation": [
        "Privatkredite nutzen meist gleiche Rate. Entscheidend sind APR (Geldkosten) und Laufzeit (Monatsdruck).",
        "Bei 100k vervielfacht 6%→18% APR die Zinsen. Längere Laufzeit senkt die Rate, erhöht aber die Zinsen—nicht wegen Bequemlichkeit lang wählen.",
        "Die Herramienta stellt 'Rate' und 'Gesamtkosten' nebeneinander, damit niedrige Rate nicht extra Zinsen verbirgt."
      ],
      "faq": [
        {"q": "APR in Monatszins?", "a": "monatlich = APR ÷ 12. 12 % APR → 1 % monatlich. Manche Werbung nutzt 'Monatsgebühr' statt echter APR, nach Rechnung teurer."},
        {"q": "Längere Laufzeit besser?", "a": "Niedrigere Rate, aber schlechter—mehr Zinsen. Nur bei Bedarf an niedriger Rate; sonst kurz spart."},
        {"q": "Warum Auszahlung geringer als Kredit?", "a": "Gebühren oder vorab abgezogene Zinsen. Auf APR und Gesamtrückzahlung achten, nicht nur Rate."}
      ]
    },
    "ja": {
      "steps": [
        "借入額、年率（APR）、期間（月または年）を入力します。",
        "返済方式は元利均等が一般的です。",
        "月額、総利息、総返済額を確認し、期間を比較します。"
      ],
      "explanationTitle": "個人ローンの返済：APR と期間",
      "formula": "月額 ≈ 元本×月利×(1+月利)^回数 ÷ ((1+月利)^回数 − 1)",
      "explanation": [
        "個人ローンは元利均等（毎月一定）が一般的です。鍵は APR（資金コスト）と期間（月額の圧）です。",
        "100万の借入で APR 6%→18% は総利息が数倍に。期間を長くすると月額は下がりますが総利息は増えます——楽だからといって長期を選ばないよう。",
        "本ツールは『月額の楽さ』と『総コスト』を並べ、低月額に騙されて余計な利息を払うのを防ぎます。"
      ],
      "faq": [
        {"q": "APR と月利の換算は？", "a": "月利 = APR ÷ 12。年 12% なら月 1%。『月手数料率』を本物の APR でなく使う広告もあり、換算すると高くなります。"},
        {"q": "期間が長い方が得？", "a": "月額は下がりますが得ではなく、総利息が増えます。月額を下げたい場合のみ長期を選び、そうでなければ短期で省きましょう。"},
        {"q": "なぜ手元が借入より少ない？", "a": "手数料や前払い利息（砍頭息）が引かれるためです。月額ではなく APR と総返済額を見てください。"}
      ]
    },
    "es": {
      "steps": [
        "Introduce monto, TAE y plazo (meses o años).",
        "Elig repago: cuota fija es lo común.",
        "Ver cuota, interés total, total pagado y comparar plazos."
      ],
      "explanationTitle": "Préstamo personal: TAE y plazo",
      "formula": "cuota ≈ P×r×(1+r)^n ÷ ((1+r)^n − 1)",
      "explanation": [
        "Los préstamos personales usan cuota fija. Las claves son TAE (coste) y plazo (presión mensual).",
        "En 100k, TAE 6%→18% multiplica el interés. Plazo largo baja la cuota pero sube el interés—no elijas largo por comodidad.",
        "La herramienta pone 'cuota' y 'coste total' juntos para que la cuota baja no oculte interés extra."
      ],
      "faq": [
        {"q": "¿TAE a mensual?", "a": "mensual = TAE ÷ 12. 12 % TAE → 1 % mensual. Algunos anuncios usan 'tasa mensual' no TAE real, más cara al convertir."},
        {"q": "¿Plazo largo es mejor?", "a": "Cuota menor pero peor—más interés. Elige largo solo si necesitas cuota baja; si no, corto ahorra."},
        {"q": "¿Por qué recibo menos de lo que pedí?", "a": "Comisiones o intereses anticipados. Mira TAE y total pagado, no solo la cuota."}
      ]
    }
  },
  "income-tax": {
    "zh": {
      "steps": [
        "选择所在地区（如中国大陆、美国联邦等）的税率表或简化档位。",
        "输入税前收入与各项可扣除项（社保、专项附加等）。",
        "查看应纳税额、有效税率与税后到手金额。"
      ],
      "explanationTitle": "所得税怎么算？累进税率与扣除",
      "formula": "税额 = Σ(各档应纳税所得额 × 该档税率) − 速算扣除数",
      "explanation": [
        "多数国家采用超额累进税率：收入被分成若干档，低档部分低税率、高档部分高税率，而非全部收入按最高档计税。",
        "税前到手的差额来自三块：社保/健保等强制扣除、免税额/标准扣除、以及累进税本身。合理用足专项扣除能合法降低税基。",
        "本工具用简化档位快速估算，适合做年度规划与『加薪后实际多拿多少』的直观判断；精确申报请以当地税法为准。"
      ],
      "faq": [
        {"q": "为什么不是全部收入按最高税率？", "a": "累进税制只对『超过上一档门槛的部分』按高税率，前面部分仍按低税率，所以有效税率低于最高档税率。"},
        {"q": "专项附加扣除有什么用？", "a": "它直接减少应纳税所得额，从而降低税额。子女教育、房贷利息、赡养老人等常见项目，用足能合法节税。"},
        {"q": "这个估算准吗？", "a": "工具用简化档位，适合快速规划。实际还涉及免税额、抵免、资本利得等特殊规则，正式申报请参照当地税务机关。"}
      ]
    },
    "zh-TW": {
      "steps": [
        "選擇所在地區（如台灣、美國聯邦等）的稅率表或簡化檔次。",
        "輸入税前收入與各項可扣除額（健保、免稅額等）。",
        "查看應納稅額、有效稅率與稅後到手金額。"
      ],
      "explanationTitle": "所得稅怎麼算？累進稅率與扣除",
      "formula": "稅額 = Σ(各檔應納稅所得 × 該檔稅率) − 速算扣除數",
      "explanation": [
        "多數國家採超額累進稅率：收入分成若干檔，低檔低稅率、高檔高稅率，而非全部收入按最高檔計稅。",
        "税前到手的差額來自三塊：健保/社保等強制扣除、免稅額/標準扣除、以及累進稅本身。合理用足扣除可合法降低稅基。",
        "本工具用簡化檔次快速估算，適合年度規劃與『加薪後實際多拿多少』的直觀判斷；精確申報請以當地稅法為準。"
      ],
      "faq": [
        {"q": "為什麼不是全部收入按最高稅率？", "a": "累進稅制只對『超過上一檔門檻的部分』按高稅率，前面部分仍按低稅率，所以有效稅率低於最高檔稅率。"},
        {"q": "列舉扣除有什麼用？", "a": "它直接減少應納稅所得，從而降低稅額。房貸利息、捐贈、保險等常見項目，用足能合法節稅。"},
        {"q": "這個估算準嗎？", "a": "工具用簡化檔次，適合快速規劃。實際還涉及免稅額、抵免、資本利得等特殊規則，正式申報請參照當地稅務機關。"}
      ]
    },
    "en": {
      "steps": [
        "Pick the region's tax brackets or a simplified schedule (e.g. US federal, etc.).",
        "Enter gross income and deductible items (social insurance, itemized, etc.).",
        "See tax due, effective rate, and take-home pay."
      ],
      "explanationTitle": "How income tax works: progressive brackets",
      "formula": "tax = Σ(bracket income × bracket rate) − quick deduction",
      "explanation": [
        "Most countries use progressive rates: income is split into brackets, lower parts taxed low and higher parts higher—not all at the top rate.",
        "The gap between gross and net comes from three sources: mandatory insurance, allowances/standard deduction, and the progressive tax itself. Using deductions fully lowers the base legally.",
        "This tool uses simplified brackets for quick planning—great for yearly estimates and 'how much more I keep after a raise'. For filing, follow local tax law."
      ],
      "faq": [
        {"q": "Why isn't all income taxed at the top rate?", "a": "Progressive tax only applies the higher rate to the portion above each threshold; lower portions stay low, so effective rate is below the top."},
        {"q": "What do itemized deductions do?", "a": "They directly reduce taxable income, lowering tax. Mortgage interest, donations, insurance—using them fully saves legally."},
        {"q": "Is this estimate accurate?", "a": "It uses simplified brackets for speed. Real filing involves credits, capital gains, and special rules—consult local tax authority."}
      ]
    },
    "de": {
      "steps": [
        "Steuerklasse der Region wählen (z. B. deutsche Stufen, US federal).",
        "Bruttoeinkommen und Abzüge (Sozialversicherung, etc.) eingeben.",
        "Steuer, effektiven Satz und Netto sehen."
      ],
      "explanationTitle": "Einkommensteuer: progressive Stufen",
      "formula": "Steuer = Σ(Stufen-Einkommen × Stufensatz) − Tarifabweichung",
      "explanation": [
        "Die meisten Länder nutzen progressive Sätze: Einkommen in Stufen, unten niedrig, oben hoch—nicht alles zum Spitzensteuersatz.",
        "Die Lücke zwischen Brutto und Netto kommt aus Pflichtversicherung, Freibeträgen und der Progressivität. Abzüge senken die Bemessungsgrundlage legal.",
        "Die Herramienta nutzt vereinfachte Stufen für Planung—für die Steuererklärung gilt lokales Recht."
      ],
      "faq": [
        {"q": "Warum nicht alles zum Spitzensteuersatz?", "a": "Nur der Teil über jeder Schwelle wird höher besteuert; unten bleibt niedrig, daher liegt der effektive Satz darunter."},
        {"q": "Was bringen Abzüge?", "a": "Sie senken das zu versteuernde Einkommen direkt. Wer sie voll nutzt, spart legal."},
        {"q": "Ist die Schätzung genau?", "a": "Vereinfachte Stufen zur Planung. Erklärung hat Gutschriften und Sonderregeln—Finanzamt konsultieren."}
      ]
    },
    "ja": {
      "steps": [
        "地域の税率表か簡易区分（米国連邦など）を選びます。",
        "税前収入と控除額（社保・医療など）を入力します。",
        "税額、実効税率、手取を確認します。"
      ],
      "explanationTitle": "所得税のしくみ：累進課税",
      "formula": "税額 = Σ(各区分の課税所得 × その税率) − 概算控除",
      "explanation": [
        "多くの国は超過累進税率を採用し、所得を区分して低い部分は低率、高い部分は高率にします（全部が最高率ではありません）。",
        "税前と手取の差は、社保・医療などの強制控除、基礎控除、そして累進税そのものの 3 つから来ます。控除を十分使うと税基を合法的に下げられます。",
        "本ツールは簡易区分で早見えし、年間計画や『昇給で実際いくら増えるか』に便利です。確定申告は現地の税法に従ってください。"
      ],
      "faq": [
        {"q": "なぜ全部が最高税率ではないの？", "a": "累進制は『各境界を超えた部分』だけ高率になり、下の部分は低率のままなので実効税率は最高率より低いです。"},
        {"q": "控除の効果は？", "a": "課税所得を直接減らし税額を下げます。医療費や寄付などを十分使うと合法的に節税できます。"},
        {"q": "この概算は正確？", "a": "簡易区分による早見え用です。本申告は控除やキャピタルゲイン等の特例があるので現地の税務署に従ってください。"}
      ]
    },
    "es": {
      "steps": [
        "Elig la tabla de la región (p. ej. federal de EE. UU.).",
        "Introduce ingreso bruto y deducciones (seguridad social, etc.).",
        "Ver impuesto, tasa efectiva y sueldo neto."
      ],
      "explanationTitle": "Impuesto a la renta: tramos progresivos",
      "formula": "impuesto = Σ(tramo × tasa) − deducción rápida",
      "explanation": [
        "La mayoría usa tasas progresivas: el ingreso se divide en tramos, bajos a tasa baja y altos a alta—no todo a la tasa máxima.",
        "La brecha bruto-neto viene de seguros obligatorios, exenciones y la progresividad. Usar deducciones baja la base legalmente.",
        "La herramienta usa tramos simplificados para planificar; para declarar, sigue la ley local."
      ],
      "faq": [
        {"q": "¿Por qué no todo al tipo máximo?", "a": "Solo la parte sobre cada umbral va a tasa mayor; abajo queda baja, así la tasa efectiva es menor."},
        {"q": "¿Para qué sirven las deducciones?", "a": "Reducen directamente el ingreso gravable y el impuesto. Usarlas bien ahorra legalmente."},
        {"q": "¿Es precisa la estimación?", "a": "Tramos simplificados para rapidez. La declaración real tiene créditos y reglas especiales—consulta la autoridad local."}
      ]
    }
  },
  "debt-payoff": {
    "zh": {
      "steps": [
        "列出所有债务：余额、利率、最低还款额。",
        "选择策略：雪崩法（先还高利率）或滚雪球法（先还小额）。",
        "查看还清总时间、总利息，以及提前多还的加速效果。"
      ],
      "explanationTitle": "债务怎么还清最快？雪崩与雪球",
      "formula": "每笔月供 = 余额×月利率×(1+月利率)^n ÷ ((1+月利率)^n − 1)（最低还款）",
      "explanation": [
        "两种方法的核心都是『集中额外资金优先处理一笔』：雪崩法按利率从高到低，总利息最少；滚雪球法按余额从小到大，心理成就感更强、更容易坚持。",
        "利率差异越大，雪崩法省得越多；若多笔利率接近，两者结果相近，选你更可能坚持的那个。",
        "本工具模拟两种策略的还清时间与利息，帮你选既省钱又能坚持的方案，避免最低还款『利滚利』越拖越多。"
      ],
      "faq": [
        {"q": "雪崩法和滚雪球法哪个好？", "a": "数学上雪崩法（高利率优先）总利息最少；滚雪球法（小额优先）靠早期『还清一笔』的正反馈更容易坚持。选你做得下去的。"},
        {"q": "只还最低还款有什么风险？", "a": "最低还款几乎都在还利息，本金下降极慢，信用卡类复利下会『利滚利』，几年都还不完且总利息惊人。"},
        {"q": "提前多还会有用吗？", "a": "非常有用。任何额外还款都直接打本金，后续利息减少，能明显缩短周期、省下利息（注意是否允许提前还）。"}
      ]
    },
    "zh-TW": {
      "steps": [
        "列出所有債務：餘額、利率、最低還款額。",
        "選擇策略：雪崩法（先還高利率）或滾雪球法（先還小額）。",
        "查看還清總時間、總利息，以及提前多還的加速效果。"
      ],
      "explanationTitle": "債務怎麼還清最快？雪崩與雪球",
      "formula": "每筆月付 = 餘額×月利率×(1+月利率)^n ÷ ((1+月利率)^n − 1)（最低還款）",
      "explanation": [
        "兩種方法的核心都是『集中額外資金優先處理一筆』：雪崩法按利率從高到低，總利息最少；滾雪球法按餘額從小到大，心理成就感更強、更容易堅持。",
        "利率差異越大，雪崩法省得越多；若多筆利率接近，兩者結果相近，選你更可能堅持的那個。",
        "本工具模擬兩種策略的還清時間與利息，幫你選既省錢又能堅持的方案，避免最低還款『利滾利』越拖越多。"
      ],
      "faq": [
        {"q": "雪崩法和滾雪球法哪個好？", "a": "數學上雪崩法（高利率優先）總利息最少；滾雪球法（小額優先）靠早期『還清一筆』的正回饋更容易堅持。選你做得下去的。"},
        {"q": "只還最低還款有什麼風險？", "a": "最低還款幾乎都在還利息，本金下降極慢，信用卡類複利下會『利滾利』，幾年都還不完且總利息驚人。"},
        {"q": "提前多還有用嗎？", "a": "非常有用。任何額外還款都直接打本金，後續利息減少，能明顯縮短週期、省下利息（注意是否允許提前還）。"}
      ]
    },
    "en": {
      "steps": [
        "List all debts: balance, rate, minimum payment.",
        "Pick a strategy: avalanche (highest rate first) or snowball (smallest balance first).",
        "See total payoff time, total interest, and the boost from paying extra."
      ],
      "explanationTitle": "Pay off debt fastest: avalanche vs snowball",
      "formula": "each min payment = balance×r×(1+r)^n ÷ ((1+r)^n − 1)",
      "explanation": [
        "Both methods concentrate extra cash on one debt: avalanche goes high-rate first (least total interest); snowball goes small-balance first (more motivation, easier to stick).",
        "The wider the rate gap, the more avalanche saves; if rates are close, results are similar—pick the one you'll keep doing.",
        "This tool simulates both strategies' time and interest so you choose a plan that saves money and is sustainable, avoiding minimum-payment compound trap."
      ],
      "faq": [
        {"q": "Avalanche or snowball?", "a": "Math favors avalanche (high rate first) for least interest; snowball (small first) uses early 'one paid off' wins to keep going. Pick what you'll finish."},
        {"q": "Risk of minimum-only payments?", "a": "Minimums mostly cover interest, principal drops slowly, and credit-card compounding balloons balance for years with huge total interest."},
        {"q": "Does paying extra help?", "a": "A lot. Any extra hits principal, later interest stops, shortening the cycle and saving interest (check prepayment allowance)."}
      ]
    },
    "de": {
      "steps": [
        "Alle Schulden auflisten: Saldo, Zins, Mindestrate.",
        "Strategie wählen: Lawine (höchster Zins zuerst) oder Schneeball (kleinster Saldo).",
        "Gesamtzeit, Zinsen und Extra-Effekt sehen."
      ],
      "explanationTitle": "Schulden am schnellsten tilgen: Lawine vs Schneeball",
      "formula": "Mindestrate = Saldo×r×(1+r)^n ÷ ((1+r)^n − 1)",
      "explanation": [
        "Beide konzentrieren Extrageld auf eine Schuld: Lawine zuerst hoher Zins (wenigste Zinsen); Schneeball zuerst kleiner Saldo (mehr Motivtion).",
        "Je größer die Zinslücke, desto mehr spart Lawine; bei ähnlichen Zinsen egal—nimm die, die du durchhältst.",
        "Die Herramienta simuliert beide Strategien, damit du sparst und dranbleibst, statt im Mindestraten-Zins-Trap."
      ],
      "faq": [
        {"q": "Lawine oder Schneeball?", "a": "Rechnerisch spart Lawine (hoher Zins zuerst) am meisten; Schneeball nutzt frühe Erfolge. Nimm die, die du beendest."},
        {"q": "Risiko nur Mindestrate?", "a": "Deckt meist nur Zinsen, Saldo sinkt langsam, Kreditkarten-Zinsen lassen den Saldo Jahre wachsen."},
        {"q": "Hilft Extra-Tilgung?", "a": "Sehr. Trifft Saldo, später keine Zinsen, kürzt Laufzeit und spart (Vorabtilgung prüfen)."}
      ]
    },
    "ja": {
      "steps": [
        "全債務をリスト化：残高・金利・最低支払い。",
        "戦略を選びます：雪崩法（高金利優先）か雪球法（少額優先）。",
        "完済までの期間・総利息・繰上返済の効果を確認します。"
      ],
      "explanationTitle": "借金を最速で返す：雪崩法と雪球法",
      "formula": "最低支払い = 残高×月利×(1+月利)^回数 ÷ ((1+月利)^回数 − 1)",
      "explanation": [
        "両法とも『余力を1つに集中』します。雪崩法は金利順（総利息最小）、雪球法は残高順（早期に『1件完済』の達成感で継続しやすい）。",
        "金利差が大きいほど雪崩法の節約が多く、金利が近いなら結果は近いので続けられる方を選びます。",
        "本ツールは両戦略の期間と利息をシミュレートし、最低支払いの複利地獄を避ける助けになります。"
      ],
      "faq": [
        {"q": "雪崩法と雪球法どちらがいい？", "a": "数学的には雪崩法（高金利優先）が総利息最小。雪球法は早期の達成感で継続しやすい。完遂できる方を。"},
        {"q": "最低支払いのみのリスクは？", "a": "ほぼ利息に消え、元本が減らず、カードの複利で残高が膨らみ何年も払い続けることに。"},
        {"q": "繰上返済は意味ある？", "a": "非常に。元本に直接充てられ以降の利息が止まるので期間短縮と節約に直結（繰上の可否を確認）。"}
      ]
    },
    "es": {
      "steps": [
        "Lista todas las deudas: saldo, tasa, pago mínimo.",
        "Elig estrategia: avalancha (mayor tasa primero) o bola de nieve (saldo menor).",
        "Ve tiempo total, interés total y el efecto de pagar extra."
      ],
      "explanationTitle": "Pagar deuda más rápido: avalancha vs bola de nieve",
      "formula": "pago mínimo = saldo×r×(1+r)^n ÷ ((1+r)^n − 1)",
      "explanation": [
        "Ambos concentran el extra en una deuda: avalancha va a mayor tasa (menos interés); bola de nieve a menor saldo (más motivación).",
        "Cuanto mayor la brecha de tasas, más ahorra avalancha; si son similares, elige la que sostengas.",
        "La herramienta simula ambas para que ahorres y perdures, evitando la trampa de interés compuesto del mínimo."
      ],
      "faq": [
        {"q": "¿Avalancha o bola de nieve?", "a": "Matemáticamente avalancha (mayor tasa) ahorra más; bola de nieve usa logros tempranos. Elige la que termines."},
        {"q": "¿Riesgo de solo el mínimo?", "a": "Cubre casi solo intereses, el saldo baja lento y el compuesto de tarjeta infla el saldo años con interés enorme."},
        {"q": "¿Ayuda pagar extra?", "a": "Mucho. Todo extra va a capital, el interés posterior se detiene, acorta y ahorra (revisa prepago)."}
      ]
    }
  },
  # ---------------- health ----------------
  "pace-calculator": {
    "zh": {
      "steps": [
        "选择目标：由距离+时间算配速，或由配速+距离算完赛时间。",
        "输入距离（米/公里/英里）与用时，或输入目标配速。",
        "查看配速（分:秒/公里）、完赛时间、以及分段节奏建议。"
      ],
      "explanationTitle": "跑步配速怎么算？配速与时间换算",
      "formula": "配速 = 总时间 ÷ 距离；时间 = 配速 × 距离",
      "explanation": [
        "配速（pace）是每单位距离所需时间，跑步圈常用『分:秒/公里』。它是训练强度的标尺：同样心率下，配速越慢强度越低。",
        "由『距离+时间』反推配速，能判断一场跑是否达标；由『配速+距离』预演完赛时间，便于制定比赛或训练节奏。",
        "本工具支持公制/英制切换，帮你把『我想 5 公里跑进 30 分』这样的目标，转成日常可执行的配速区间。"
      ],
      "faq": [
        {"q": "配速和速度有什么区别？", "a": "速度看单位时间走多远（如 12 km/h），配速看单位距离花多久（如 5:00/公里）。跑步更习惯用配速，因为它直接对应『每公里累不累』。"},
        {"q": "怎么用配速安排训练？", "a": "用『轻松跑/节奏跑/间歇』不同配速区间。本工具算出目标配速后，再按心率或体感微调即可。"},
        {"q": "配速算出来的时间和实际差很多？", "a": "地形、风阻、疲劳都会让实际变慢。配速是『理想平地』参考，上坡或逆风要预留余量。"}
      ]
    },
    "zh-TW": {
      "steps": [
        "選擇目標：由距離+時間算配速，或由配速+距離算完賽時間。",
        "輸入距離（公尺/公里/英里）與用時，或輸入目標配速。",
        "查看配速（分:秒/公里）、完賽時間、以及分段節奏建議。"
      ],
      "explanationTitle": "跑步配速怎麼算？配速與時間換算",
      "formula": "配速 = 總時間 ÷ 距離；時間 = 配速 × 距離",
      "explanation": [
        "配速（pace）是每單位距離所需時間，跑步圈常用『分:秒/公里』。它是訓練強度的標尺：同樣心率下，配速越慢強度越低。",
        "由『距離+時間』反推配速，能判斷一場跑是否達標；由『配速+距離』預演完賽時間，便於制定比賽或訓練節奏。",
        "本工具支援公制/英制切換，幫你把『我想 5 公里跑進 30 分』這樣的目標，轉成日常可執行的配速區間。"
      ],
      "faq": [
        {"q": "配速和速度有什麼區別？", "a": "速度看單位時間走多遠（如 12 km/h），配速看單位距離花多久（如 5:00/公里）。跑步更習慣用配速，因為它直接對應『每公里累不累』。"},
        {"q": "怎麼用配速安排訓練？", "a": "用『輕鬆跑/節奏跑/間歇』不同配速區間。本工具算出目標配速後，再按心率或體感微調即可。"},
        {"q": "配速算出來的時間和實際差很多？", "a": "地形、風阻、疲勞都會讓實際變慢。配速是『理想平地』參考，上坡或逆風要預留餘量。"}
      ]
    },
    "en": {
      "steps": [
        "Choose: distance+time → pace, or pace+distance → finish time.",
        "Enter distance (m/km/mi) and time, or your target pace.",
        "See pace (min:sec per km), finish time, and split suggestions."
      ],
      "explanationTitle": "Running pace: pace vs time",
      "formula": "pace = time ÷ distance; time = pace × distance",
      "explanation": [
        "Pace is time per unit distance, shown as 'min:sec per km'. It's the yardstick of training intensity: at the same heart rate, slower pace means lower intensity.",
        "Deriving pace from distance+time tells if a run met its goal; pace+distance previews finish time for race or training planning.",
        "Switch metric/imperial to turn a goal like 'sub-30 5K' into a daily executable pace range."
      ],
      "faq": [
        {"q": "Pace vs speed?", "a": "Speed is distance per time (12 km/h); pace is time per distance (5:00/km). Runners use pace because it maps to 'how hard each km feels'."},
        {"q": "How to plan training with pace?", "a": "Use easy/tempo/interval pace zones. After this tool gives target pace, fine-tune by heart rate or feel."},
        {"q": "Calculated time far from actual?", "a": "Terrain, wind, fatigue slow you. Pace is the ideal-flat reference; add margin for hills or headwind."}
      ]
    },
    "de": {
      "steps": [
        "Wähle: Distanz+Zeit → Tempo, oder Tempo+Distanz → Endzeit.",
        "Distanz (m/km/mi) und Zeit oder Zieltempo eingeben.",
        "Tempo (min:sek pro km), Endzeit und Split-Vorschlag sehen."
      ],
      "explanationTitle": "Lauftempo: Tempo vs Zeit",
      "formula": "Tempo = Zeit ÷ Distanz; Zeit = Tempo × Distanz",
      "explanation": [
        "Tempo ist Zeit pro Distanz, als 'min:sek pro km'. Es misst Intensität: bei gleichem Puls ist langsameres Tempo weniger intensiv.",
        "Aus Distanz+Zeit das Tempo ableiten zeigt, ob ein Lauf zieltraf; Tempo+Distanz previewt die Endzeit.",
        "Metrisch/imperial umschalten, um 'Sub-30 5K' in ein alltagstaugliches Tempoband zu wandeln."
      ],
      "faq": [
        {"q": "Tempo vs Speed?", "a": "Speed ist Distanz pro Zeit (12 km/h); Tempo ist Zeit pro Distanz (5:00/km). Läufer nutzen Tempo, da es 'Anstrengung pro km' zeigt."},
        {"q": "Training mit Tempo planen?", "a": "Easy/tempo/intervall Zonen nutzen. Nach Zieltempo hier feinjustieren per Puls oder Gefühl."},
        {"q": "Zeit weicht stark ab?", "a": "Gelände, Wind, Müdigkeit bremsen. Tempo ist Ideal-Flachreferenz; bei Berg/Gegenwind Puffer einplanen."}
      ]
    },
    "ja": {
      "steps": [
        "目標を選びます：距離＋時間→ペース、またはペース＋距離→完走タイム。",
        "距離（m/km/mi）とタイム、または目標ペースを入力します。",
        "ペース（分:秒/km）、完走タイム、分割の目安を確認します。"
      ],
      "explanationTitle": "ランニングペース：ペースとタイム",
      "formula": "ペース = タイム ÷ 距離；タイム = ペース × 距離",
      "explanation": [
        "ペースは単位距離あたりの時間で、『分:秒/km』で表します。同じ心拍ならペースが遅いほど強度は低い、という強度の物差しです。",
        "距離＋時間からペースを出せば目標達成度が分かり、ペース＋距離で完走タイムを予測できます。",
        "メートル法/ヤード法を切り替え、『5kmを30分以内』を日々実行できるペース帯に変換します。"
      ],
      "faq": [
        {"q": "ペースとスピードの違い？", "a": "スピードは時間あたりの距離（12 km/h）、ペースは距離あたりの時間（5:00/km）。ランナーは『1kmのきつさ』に対応するペースを使います。"},
        {"q": "ペースで練習を組むには？", "a": "ジョグ/テンポ/インターバルのペース帯を使います。目標ペースが出たら心拍や体感で微調整を。"},
        {"q": "計算タイムと実際がずれる？", "a": "地形・風・疲労で遅くなります。ペースは『平坦理想』の目安で、上りや向かい風は余裕を持って。"}
      ]
    },
    "es": {
      "steps": [
        "Elig: distancia+tiempo → ritmo, o ritmo+distancia → tiempo final.",
        "Introduce distancia (m/km/mi) y tiempo, o tu ritmo objetivo.",
        "Ve ritmo (min:seg por km), tiempo final y sugerencias de parciales."
      ],
      "explanationTitle": "Ritmo de carrera: ritmo vs tiempo",
      "formula": "ritmo = tiempo ÷ distancia; tiempo = ritmo × distancia",
      "explanation": [
        "El ritmo es tiempo por distancia, en 'min:seg por km'. Mide intensidad: a igual pulso, ritmo más lento = menos intenso.",
        "De distancia+tiempo derivar el ritmo dice si cumpliste; ritmo+distancia previewa el tiempo final.",
        "Cambia métrico/imperial para convertir 'sub-30 5K' en un rango de ritmo diario."
      ],
      "faq": [
        {"q": "¿Ritmo vs velocidad?", "a": "Velocidad es distancia por tiempo (12 km/h); ritmo es tiempo por distancia (5:00/km). El corredor usa ritmo porque refleja 'lo duro que es cada km'."},
        {"q": "¿Cómo planear con ritmo?", "a": "Usa zonas easy/tempo/intervalo. Tras el ritmo objetivo, ajusta por pulso o sensación."},
        {"q": "¿Tiempo real muy distinto?", "a": "Terreno, viento, fatiga frenan. El ritmo es referencia ideal en llano; añade margen en cuesta o contra viento."}
      ]
    }
  },
  "protein-calculator": {
    "zh": {
      "steps": [
        "输入体重（公斤）与活动强度或健身目标。",
        "选择目标：维持 / 减脂 / 增肌，蛋白质量随之调整。",
        "查看每日蛋白质量（克）、相当于几份常见食材。"
      ],
      "explanationTitle": "每天该吃多少蛋白质？体重与目标",
      "formula": "蛋白质(克) ≈ 体重(kg) × 系数（维持 0.8–1.2，增肌 1.6–2.2，减脂 1.8–2.4）",
      "explanation": [
        "蛋白质需求以体重为基准，而非总热量。普通久坐者约 0.8 g/kg 即可，规律力量训练者需要 1.6–2.2 g/kg 以支持肌肉合成与恢复。",
        "减脂期建议偏高（1.8–2.4 g/kg），因为热量缺口下更高的蛋白有助保留瘦体重、提升饱腹感。老年人也应适当上调以防肌少。",
        "本工具把『克数』换算成鸡胸、鸡蛋、希腊酸奶等日常食材份数，让抽象的数字变成可执行的餐盘。"
      ],
      "faq": [
        {"q": "吃太多蛋白质会伤肾吗？", "a": "对肾功能正常的人，目前证据不支持『高蛋饮食伤肾』；但已有慢性肾病者需遵医嘱限制。普通人按体重系数吃是安全的。"},
        {"q": "植物蛋白够吗？", "a": "可以，但要多样搭配（豆类+谷物）补足必需氨基酸。若全素，总蛋白量可比建议略高一点。"},
        {"q": "一次吃多少吸收最好？", "a": "单餐约 20–40 克优质蛋白吸收利用较好，分 3–4 餐比一顿猛吃更利于肌肉合成。"}
      ]
    },
    "zh-TW": {
      "steps": [
        "輸入體重（公斤）與活動強度或健身目標。",
        "選擇目標：維持 / 減脂 / 增肌，蛋白質量隨之調整。",
        "查看每日蛋白質量（克）、相當於幾份常見食材。"
      ],
      "explanationTitle": "每天該吃多少蛋白質？體重與目標",
      "formula": "蛋白質(克) ≈ 體重(kg) × 係數（維持 0.8–1.2，增肌 1.6–2.2，減脂 1.8–2.4）",
      "explanation": [
        "蛋白質需求以體重為基準，而非總熱量。普通久坐者約 0.8 g/kg 即可，規律力量訓練者需要 1.6–2.2 g/kg 以支持肌肉合成與恢復。",
        "減脂期建議偏高（1.8–2.4 g/kg），因為熱量缺口下更高的蛋白有助保留瘦體重、提升飽腹感。老年人也應適當上調以防肌少。",
        "本工具把『克數』換算成雞胸、雞蛋、希臘優格等日常食材份數，讓抽象的數字變成可執行的餐盤。"
      ],
      "faq": [
        {"q": "吃太多蛋白質會傷腎嗎？", "a": "對腎功能正常的人，目前證據不支援『高蛋飲食傷腎』；但已有慢性腎病者需遵醫囑限制。普通人按體重係數吃是安全的。"},
        {"q": "植物蛋白夠嗎？", "a": "可以，但要多樣搭配（豆類+穀物）補足必需胺基酸。若全素，總蛋白量可比建議略高一點。"},
        {"q": "一次吃多少吸收最好？", "a": "單餐約 20–40 克優質蛋白吸收利用較好，分 3–4 餐比一頓猛吃更有利肌肉合成。"}
      ]
    },
    "en": {
      "steps": [
        "Enter body weight (kg) and activity or fitness goal.",
        "Pick goal: maintain / cut / bulk; protein scales accordingly.",
        "See daily protein (g) and how many common-food servings that equals."
      ],
      "explanationTitle": "How much protein per day? Weight and goal",
      "formula": "protein(g) ≈ weight(kg) × factor (maintain 0.8–1.2, bulk 1.6–2.2, cut 1.8–2.4)",
      "explanation": [
        "Protein need is based on body weight, not total calories. Sedentary ~0.8 g/kg; regular lifters need 1.6–2.2 g/kg for synthesis and recovery.",
        "During a cut, aim higher (1.8–2.4 g/kg): in a deficit, more protein preserves lean mass and boosts satiety. Older adults should also nudge it up.",
        "The tool converts grams into servings of chicken, eggs, Greek yogurt, etc., turning an abstract number into a plate you can build."
      ],
      "faq": [
        {"q": "Does too much protein hurt kidneys?", "a": "For normal kidney function, evidence doesn't support harm from high protein; those with chronic kidney disease should follow medical limits. For most, weight-based intake is safe."},
        {"q": "Is plant protein enough?", "a": "Yes, but vary sources (legumes + grains) to cover essential amino acids. If fully vegan, aim slightly above the suggestion."},
        {"q": "How much per meal absorbs best?", "a": "About 20–40 g quality protein per meal uses well; 3–4 meals beats one large dose for synthesis."}
      ]
    },
    "de": {
      "steps": [
        "Gewicht (kg) und Ziel/ Aktivität eingeben.",
        "Ziel wählen: Erhalt / Defizit / Aufbau; Protein skaliert.",
        "Tägliches Protein (g) und Portionen Alltagslebensmittel sehen."
      ],
      "explanationTitle": "Wie viel Protein pro Tag? Gewicht und Ziel",
      "formula": "Protein(g) ≈ Gewicht(kg) × Faktor (Erhalt 0.8–1.2, Aufbau 1.6–2.2, Defizit 1.8–2.4)",
      "explanation": [
        "Proteinbedarf richtet sich nach Gewicht, nicht Kalorien. Sitzend ~0.8 g/kg; Kraftsporter 1.6–2.2 g/kg für Synthese und Regeneration.",
        "Beim Defizit höher (1.8–2.4 g/kg): mehr Protein erhält Muskeln und sättigt. Ältere sollten leicht erhöhen.",
        "Die Herramienta wandelt Gramm in Portionen Hähnchen, Eier, Griechisch Joghurt um—aus der Zahl wird ein Teller."
      ],
      "faq": [
        {"q": "Schadet viel Protein den Nieren?", "a": "Bei normaler Nierenfunktion zeigt die Evidenz keinen Schaden; bei chronischer Nierenkrankheit ärztlich begrenzen. Für die meisten sicher."},
        {"q": "Reicht Pflanzenprotein?", "a": "Ja, aber Quellen mischen (Hülsen + Getreide) für essentielle Aminosäuren. Veganer leicht drüber liegen."},
        {"q": "Wieviel pro Mahlzeit?", "a": "Etwa 20–40 g pro Mahlzeit nutzt sich gut; 3–4 Mahlzeiten schlagen eine große Dosis."}
      ]
    },
    "ja": {
      "steps": [
        "体重（kg）と活動強度・フィットネス目標を入力します。",
        "目標を選びます：維持 / 減量 / 増量。タンパク質量が連動します。",
        "1日のタンパク質（g）と、日常食材何食分に相当するかを確認します。"
      ],
      "explanationTitle": "1日のタンパク質は？体重と目標",
      "formula": "タンパク質(g) ≈ 体重(kg) × 係数（維持 0.8–1.2、増量 1.6–2.2、減量 1.8–2.4）",
      "explanation": [
        "タンパク質の必要量は体重基準で、総カロリーではありません。座りがちな人は約 0.8 g/kg、定期的な筋トレ者は合成と回復のため 1.6–2.2 g/kg が目安です。",
        "減量中はやや高め（1.8–2.4 g/kg）がおすすめ。赤字下で筋肉を保ち、満腹感も高まります。高齢者もやや上げると良いです。",
        "本ツールはグラム数を鶏胸・卵・ギリシャヨーグルトなどの食分数に換算し、抽象的数字を作れる皿にします。"
      ],
      "faq": [
        {"q": "タンパク質のやりすぎは腎臓に悪い？", "a": "腎機能が正常なら『高タンパクで腎臓害』を支持する証拠はなく、慢性腎疾患がある人は医師の制限を守ってください。大半の人は体重基準で安全です。"},
        {"q": "植物性タンパクで足りる？", "a": "十分ですが、豆類＋穀物などを組み合わせ必須アミノ酸を補いましょう。完全菜食ならやや多めに。"},
        {"q": "1食あたりいくら吸収が良い？", "a": "1食 20–40 g の良質タンパクが使われやすく、1回の大食より 3–4 食に分ける方が合成に有利です。"}
      ]
    },
    "es": {
      "steps": [
        "Introduce peso (kg) y objetivo o actividad.",
        "Elig meta: mantener / déficit / volumen; la proteína escala.",
        "Ve proteína diaria (g) y cuántas raciones de alimentos equivale."
      ],
      "explanationTitle": "¿Cuánta proteína al día? Peso y meta",
      "formula": "proteína(g) ≈ peso(kg) × factor (mantener 0.8–1.2, volumen 1.6–2.2, déficit 1.8–2.4)",
      "explanation": [
        "La proteína se basa en el peso, no en las calorías. Sedentario ~0.8 g/kg; quien entrena necesita 1.6–2.2 g/kg para síntesis y recuperación.",
        "En déficit apunta alto (1.8–2.4 g/kg): más proteína preserva masa y sacia. Los mayores también un poco más.",
        "La herramienta convierte gramos en raciones de pollo, huevos, yogur griego—el número se vuelve plato."
      ],
      "faq": [
        {"q": "¿Demasiada proteína daña riñones?", "a": "Con función normal, la evidencia no apoya daño; con enfermedad crónica, límites médicos. Para la mayoría es seguro por peso."},
        {"q": "¿Basta la proteína vegetal?", "a": "Sí, pero mezcla fuentes (legumbres + granos) para aminoácidos esenciales. Vegano, ligeramente por encima."},
        {"q": "¿Cuánta por comida absorbe mejor?", "a": "Unas 20–40 g por comida se aprovechan bien; 3–4 comidas superan a una dosis grande."}
      ]
    }
  },
  "due-date": {
    "zh": {
      "steps": [
        "输入末次月经第一天（LMP）日期。",
        "工具按标准 280 天（40 周）推算预产期。",
        "查看预产期、当前孕周，以及各阶段产检时间节点。"
      ],
      "explanationTitle": "预产期怎么算？末次月经与孕周",
      "formula": "预产期 = 末次月经首日 + 280 天（Naegele 法则：月份+9，日期+7）",
      "explanation": [
        "最常用的是 Naegele 法则：以末次月经首日（LMP）为基准，加 280 天（40 周）得预产期；简便算法是『月+9、日+7』。",
        "实际分娩只有约 5% 在预产期当天，前后两周内都属正常。早期 B 超（尤其头臀径）能更精确校正孕周。",
        "本工具同时给出当前孕周与关键产检节点（如 NT、大排畸、糖耐），帮你把整个孕期时间轴理清。"
      ],
      "faq": [
        {"q": "预产期准吗？", "a": "只是估算中点。约 80% 的婴儿在预产期前后两周内出生，只有约 5% 正好在当天。把它当作参考窗而非精确日。"},
        {"q": "月经周期不准怎么算？", "a": "周期长或不规则时，按 LMP 会偏早。以早孕期 B 超测得的头臀径校正更准确。"},
        {"q": "为什么医生用孕周而不是月份？", "a": "孕周（每 7 天）比月份更精细，产检项目按周数安排（如 11–13 周 NT、24–28 周糖耐），用周数才不会错过节点。"}
      ]
    },
    "zh-TW": {
      "steps": [
        "輸入最後一次月經第一天（LMP）日期。",
        "工具依標準 280 天（40 週）推算預產期。",
        "查看預產期、目前孕週，以及各階段產檢時間節點。"
      ],
      "explanationTitle": "預產期怎麼算？最後月經與孕週",
      "formula": "預產期 = 最後月經首日 + 280 天（Naegele 法則：月份+9，日期+7）",
      "explanation": [
        "最常用的是 Naegele 法則：以最後月經首日（LMP）為基準，加 280 天（40 週）得預產期；簡便算法是『月+9、日+7』。",
        "實際分娩只有約 5% 在預產期當天，前後兩週內都屬正常。早期 B 超（尤其頭臀徑）能更精確校正孕週。",
        "本工具同時給出目前孕週與關鍵產檢節點（如 NT、大排畸、糖耐），幫你把整個孕期時間軸理清。"
      ],
      "faq": [
        {"q": "預產期準嗎？", "a": "只是估算中點。約 80% 的嬰兒在預產期前後兩週內出生，只有約 5% 正好在當天。把它當作參考窗而非精確日。"},
        {"q": "月經週期不準怎麼算？", "a": "週期長或不規則時，依 LMP 會偏早。以早孕期 B 超測得的頭臀徑校正更準確。"},
        {"q": "為什麼醫生用孕週而不是月份？", "a": "孕週（每 7 天）比月份更精細，產檢項目按週數安排（如 11–13 週 NT、24–28 週糖耐），用週數才不會錯過節點。"}
      ]
    },
    "en": {
      "steps": [
        "Enter the first day of your last menstrual period (LMP).",
        "The tool adds the standard 280 days (40 weeks) to estimate the due date.",
        "See due date, current week, and key prenatal checkup milestones."
      ],
      "explanationTitle": "How due date is calculated: LMP and weeks",
      "formula": "due = LMP + 280 days (Naegele: month+9, day+7)",
      "explanation": [
        "The common method is Naegele's rule: from the first day of LMP, add 280 days (40 weeks). The shortcut is 'month+9, day+7'.",
        "Only about 5% deliver exactly on the due date; within two weeks either side is normal. Early ultrasound (esp. CRL) refines the week better.",
        "The tool also shows current gestational week and key screenings (NT, anatomy, glucose) so you can map the whole pregnancy timeline."
      ],
      "faq": [
        {"q": "Is the due date accurate?", "a": "It's a midpoint estimate. ~80% are born within two weeks of it; only ~5% on the exact day. Treat it as a window, not a date."},
        {"q": "Irregular cycles?", "a": "Long or irregular cycles make LMP-based dating early. First-trimester ultrasound (CRL) is more accurate."},
        {"q": "Why weeks, not months?", "a": "Weeks (7-day) are finer; screenings are scheduled by week (NT 11–13, glucose 24–28), so weeks avoid missing windows."}
      ]
    },
    "de": {
      "steps": [
        "Ersten Tag der letzten Periode (LMP) eingeben.",
        "Tool addiert 280 Tage (40 Wo.) für den ET.",
        "ET, aktuelle Woche und Vorsorgetermine sehen."
      ],
      "explanationTitle": "Wie wird der ET berechnet? LMP und Wochen",
      "formula": "ET = LMP + 280 Tage (Naegele: Monat+9, Tag+7)",
      "explanation": [
        "Üblich ist Naegele: ab ersten LMP-Tag 280 Tage (40 Wo.) addieren. Kurz: 'Monat+9, Tag+7'.",
        "Nur ~5 % entbinden am ET; zwei Wochen drumherum sind normal. Früher Ultraschall (CRL) schärft die Woche.",
        "Die Herramienta zeigt Woche und Screenings (NT, Fehlbildung, Glukose) für den ganzen Zeitstrahl."
      ],
      "faq": [
        {"q": "Ist der ET genau?", "a": "Mittelwert. ~80 % innerhalb zwei Wochen; nur ~5 % am Tag. Als Fenster, nicht Datum sehen."},
        {"q": "Unregelmäßiger Zyklus?", "a": "LMP dann zu früh. Ultraschall im 1. Trimenon (CRL) genauer."},
        {"q": "Warum Wochen statt Monate?", "a": "Wochen (7 Tage) feiner; Screenings nach Woche geplant (NT 11–13, Glukose 24–28)."}
      ]
    },
    "ja": {
      "steps": [
        "最終月経の最初の日（LMP）を入力します。",
        "標準の 280 日（40 週）を加えて予産期を推算します。",
        "予産期、現在の妊娠週数、検診の目安を確認します。"
      ],
      "explanationTitle": "予産期の計算：LMP と週数",
      "formula": "予産期 = LMP + 280 日（ネーゲレ法：月+9、日+7）",
      "explanation": [
        "最も一般的なのはネーゲレ法：最終月経初日（LMP）から 280 日（40 週）を足します。簡便には『月+9、日+7』です。",
        "実際の分娩は約 5% が予産期当日で、前後 2 週は正常範囲です。初期の超音波（特に頭臀長 CRL）で週数をより正確に補正できます。",
        "本ツールは現在の妊娠週数と重要検診（NT、形態異常、糖耐）の目安も出し、妊娠期のタイムラインを整理します。"
      ],
      "faq": [
        {"q": "予産期は正確？", "a": "あくまで中央値です。約 80% は前後 2 週内に出生、当日は約 5% のみ。窓として捉えてください。"},
        {"q": "周期が不順の場合は？", "a": "周期が長い・不順だと LMP ベースは早まります。妊娠前期の超音波（CRL）の方が正確です。"},
        {"q": "なぜ週数で管理するの？", "a": "週（7日）の方が細かく、検診は週数で組まれます（NT 11–13、糖耐 24–28）。週数で見落としを防ぎます。"}
      ]
    },
    "es": {
      "steps": [
        "Introduce el primer día de tu última menstruación (LMP).",
        "La herramienta suma 280 días (40 sem.) para estimar la fecha.",
        "Ve fecha probable, semana actual y controles clave."
      ],
      "explanationTitle": "Cómo se calcula la fecha: LMP y semanas",
      "formula": "fecha = LMP + 280 días (Naegele: mes+9, día+7)",
      "explanation": [
        "El método común es Naegele: desde el primer día de LMP sumar 280 días (40 sem.). Atajo: 'mes+9, día+7'.",
        "Solo ~5 % nace exactamente en la fecha; dos semanas alrededor son normales. Ecografía temprana (CRL) afina la semana.",
        "La herramienta muestra semana y controles (NT, anatomía, glucosa) para mapear todo el embarazo."
      ],
      "faq": [
        {"q": "¿Es exacta la fecha?", "a": "Es un punto medio. ~80 % nace dentro de dos semanas; solo ~5 % el día exacto. Véla como ventana."},
        {"q": "¿Ciclos irregulares?", "a": "Ciclos largos o irregulares adelantan la fecha por LMP. Ecografía del 1. trimestre (CRL) es más exacta."},
        {"q": "¿Por qué semanas y no meses?", "a": "Las semanas (7 días) son más finas; los controles se programan por semana (NT 11–13, glucosa 24–28)."}
      ]
    }
  },
  "ovulation-calculator": {
    "zh": {
      "steps": [
        "输入最近一次月经第一天与平均周期长度（默认 28 天）。",
        "工具推算排卵日（下次月经前约 14 天）与可孕期窗口。",
        "查看未来 6 个周期的大致排卵日，便于安排或规避。"
      ],
      "explanationTitle": "排卵期怎么算？周期与排卵日",
      "formula": "排卵日 ≈ 下次月经首日 − 14 天；可孕期 ≈ 排卵日前 5 天至后 1 天",
      "explanation": [
        "排卵通常发生在下次月经前约 14 天（黄体期相对固定），而卵泡期长短因人而异，所以『周期−14』比『周期÷2』更准。",
        "精子可存活约 3–5 天、卵子约 12–24 小时，因此可孕期覆盖排卵日前 5 天到排卵后 1 天，约一周窗口。",
        "本工具适合规律周期者做粗略估计；若想精准，建议结合基础体温、排卵试纸或 App 追踪。月经不规律时误差会变大。"
      ],
      "faq": [
        {"q": "周期不准还能算吗？", "a": "可以估算但误差大。周期波动越大，排卵日越难预测，建议用试纸+体温交叉验证。"},
        {"q": "为什么可孕期那么长？", "a": "因为精子能在体内活几天，而排卵可能提前或推后，所以把排卵日前后的几天都算进去最稳妥。"},
        {"q": "想怀孕和想避孕都看这个？", "a": "是的，原理相同：想怀孕在可孕期同房，想避孕则需额外措施——排卵期推算本身不是可靠避孕法。"}
      ]
    },
    "zh-TW": {
      "steps": [
        "輸入最近一次月經第一天與平均週期長度（預設 28 天）。",
        "工具推算排卵日（下次月經前約 14 天）與可孕期窗口。",
        "查看未來 6 個週期的大致排卵日，便於安排或規避。"
      ],
      "explanationTitle": "排卵期怎麼算？週期與排卵日",
      "formula": "排卵日 ≈ 下次月經首日 − 14 天；可孕期 ≈ 排卵日前 5 天至後 1 天",
      "explanation": [
        "排卵通常發生在下一次月經前約 14 天（黃體期相對固定），而濾泡期長短因人而異，所以『週期−14』比『週期÷2』更準。",
        "精子可存活約 3–5 天、卵子約 12–24 小時，因此可孕期覆蓋排卵日前 5 天到排卵後 1 天，約一週窗口。",
        "本工具適合規律週期者做粗略估計；若想精準，建議結合基礎體溫、排卵試紙或 App 追蹤。月經不規律時誤差會變大。"
      ],
      "faq": [
        {"q": "週期不準還能算嗎？", "a": "可以估算但誤差大。週期波動越大，排卵日越難預測，建議用試紙+體溫交叉驗證。"},
        {"q": "為什麼可孕期那麼長？", "a": "因為精子能在體內活幾天，而排卵可能提前或推後，所以把排卵日前後的幾天都算進去最穩妥。"},
        {"q": "想懷孕和想避孕都看這個？", "a": "是的，原理相同：想懷孕在可孕期同房，想避孕則需額外措施——排卵期推算本身不是可靠避孕法。"}
      ]
    },
    "en": {
      "steps": [
        "Enter first day of last period and average cycle length (default 28).",
        "The tool estimates ovulation (~14 days before next period) and the fertile window.",
        "See estimated ovulation for the next 6 cycles to plan or avoid."
      ],
      "explanationTitle": "How to find ovulation: cycle and ovulation day",
      "formula": "ovulation ≈ next period − 14 days; fertile ≈ 5 days before to 1 day after",
      "explanation": [
        "Ovulation usually happens ~14 days before the next period (luteal phase is fairly fixed), while follicular length varies, so 'cycle−14' beats 'cycle÷2'.",
        "Sperm survive ~3–5 days, egg ~12–24 h, so the fertile window spans ~5 days before to 1 day after ovulation—about a week.",
        "Good for regular cycles as an estimate; for precision use basal temperature, OPKs, or an app. Irregular cycles widen the error."
      ],
      "faq": [
        {"q": "Can I calculate with irregular cycles?", "a": "You can estimate but with larger error. The more variable the cycle, the harder ovulation is to predict—verify with OPK + temperature."},
        {"q": "Why is the fertile window so long?", "a": "Sperm live for days and ovulation can shift, so covering the days around ovulation is safest."},
        {"q": "Used for both trying and avoiding?", "a": "Yes, same principle: time intercourse for conception, or use protection to avoid—ovulation tracking alone isn't reliable birth control."}
      ]
    },
    "de": {
      "steps": [
        "Ersten Tag der letzten Periode und Zykluslänge (Standard 28) eingeben.",
        "Tool schätzt Eisprung (~14 Tage vor Periode) und fruchtbares Fenster.",
        "Eisprung der nächsten 6 Zyklen sehen."
      ],
      "explanationTitle": "Eisprung finden: Zyklus und Tag",
      "formula": "Eisprung ≈ nächste Periode − 14 Tage; fruchtbar ≈ 5 Tage vor bis 1 nach",
      "explanation": [
        "Der Eisprung liegt meist ~14 Tage vor der Periode (Gelbkörperphase fix), die Follikelphase variiert—'Zyklus−14' ist besser als 'Zyklus÷2'.",
        "Spermien leben ~3–5 Tage, Ei ~12–24 h, daher Fenster ~5 Tage vor bis 1 nach Eisprung.",
        "Für regelmäßige Zyklen als Schätzung; für Genauigkeit Temperatur, OPK oder App. Unregelmäßig = mehr Fehler."
      ],
      "faq": [
        {"q": "Bei unregelmäßigem Zyklus?", "a": "Schätzbar, aber ungenauer. Je variabler, desto schwerer; mit OPK + Temperatur prüfen."},
        {"q": "Warum so langes Fenster?", "a": "Spermien überleben Tage und Eisprung schwankt, daher Tage drumherum absichern."},
        {"q": "Für Wunsch und Vermeidung?", "a": "Ja, gleiches Prinzip: für Kinder timen, sonst verhüten—alleinige Zyklusnachführung ist keine sichere Verhütung."}
      ]
    },
    "ja": {
      "steps": [
        "最終月経の最初の日と平均周期（標準28日）を入力します。",
        "排卵日（次回月経の約14日前）と妊娠可能窓を推算します。",
        "今後6周期のおおまかな排卵日を確認できます。"
      ],
      "explanationTitle": "排卵日の計算：周期と排卵日",
      "formula": "排卵日 ≈ 次回月経 − 14日；妊娠可能 ≈ 排卵5日前〜1日後",
      "explanation": [
        "排卵は次回月経の約14日前（黄体期は比較的固定）に起こり、卵胞期の長さは人により異なるため『周期−14』が『周期÷2』より正確です。",
        "精子は約3–5日、卵子は約12–24時間生存するため、妊娠可能窓は排卵の5日前から1日後、約1週間です。",
        "規則的な周期の目安として便利です。正確には基礎体温・排卵検査薬・アプリと併用を。不順だと誤差が大きくなります。"
      ],
      "faq": [
        {"q": "周期が不順でも計算できる？", "a": "目安にはなりますが誤差大。周期のばらつきが大きいほど難しく、検査薬＋体温で確認を。"},
        {"q": "なぜ窓がこんなに長い？", "a": "精子は数日 survivable で、排卵も前後するため、前後の日を幅を持って見るのが安全です。"},
        {"q": "妊娠希望と避妊、両方に使う？", "a": "はい、原理同じ。妊娠希望は窓内に、避妊なら別手段を。排卵推算単独は確実な避妊ではありません。"}
      ]
    },
    "es": {
      "steps": [
        "Introduce primer día de la última regla y duración media (28 por defecto).",
        "La herramienta estima ovulación (~14 días antes) y ventana fértil.",
        "Ve ovulación estimada de los próximos 6 ciclos."
      ],
      "explanationTitle": "Cómo hallar la ovulación: ciclo y día",
      "formula": "ovulación ≈ próxima regla − 14 días; fértil ≈ 5 días antes a 1 después",
      "explanation": [
        "La ovulación suele ocurrir ~14 días antes de la regla (fase lútea fija), la folicular varía, así 'ciclo−14' vence a 'ciclo÷2'.",
        "Los espermatozoides viven ~3–5 días, el óvulo ~12–24 h, por eso la ventana abarca ~5 días antes a 1 después.",
        "Útil para ciclos regulares como estimación; para precisión, temperatura, OPK o app. Irregular = más error."
      ],
      "faq": [
        {"q": "¿Con ciclos irregulares?", "a": "Se estima pero con más error. Cuanto más variable, más difícil; verifica con OPK + temperatura."},
        {"q": "¿Por qué la ventana es tan larga?", "a": "Los espermatozoides viven días y la ovulación se mueve, cubrir alrededor es más seguro."},
        {"q": "¿Para buscar y evitar?", "a": "Sí, mismo principio: timing para concebir, o protección para evitar—solo el ciclo no es anticonceptivo fiable."}
      ]
    }
  },
  "period-calculator": {
    "zh": {
      "steps": [
        "输入最近一次月经第一天与平均周期长度。",
        "工具推算下次月经日期与未来若干周期的日程。",
        "还可估算当前处于周期的哪一阶段（卵泡期/黄体期）。"
      ],
      "explanationTitle": "月经期怎么预测？周期推算",
      "formula": "下次月经 = 本次首日 + 周期长度；周期阶段 ≈ 距上次首日天数",
      "explanation": [
        "月经预测的核心是『周期长度』：从本次第一天往后加一个周期，就是下次预期日。多数人在 21–35 天之间，28 天只是常见值而非标准。",
        "知道周期长度还能粗略判断阶段：排卵约在下次月经前 14 天，之前为卵泡期、之后为黄体期，有助于理解情绪、精力波动。",
        "本工具适合规律周期做日程提醒；若周期紊乱、经期过长或剧痛，应就医排查多囊卵巢、甲状腺等问题，而非依赖推算。"
      ],
      "faq": [
        {"q": "周期多少天算正常？", "a": "21–35 天都属常见范围，因人而异。只要自身相对稳定、规律，不必追求 28 天。"},
        {"q": "为什么我每次都不准？", "a": "压力、体重剧烈变化、熬夜、疾病都会打乱周期。偶尔波动正常；长期不规律建议妇科检查。"},
        {"q": "能靠这个判断怀孕吗？", "a": "不能。月经推迟只是可能信号之一，确诊要靠验孕。此工具只做日程推算，不替代检测。"}
      ]
    },
    "zh-TW": {
      "steps": [
        "輸入最近一次月經第一天與平均週期長度。",
        "工具推算下次月經日期與未來若干週期的日程。",
        "還可估算目前處於週期的哪一階段（濾泡期/黃體期）。"
      ],
      "explanationTitle": "月經期怎麼預測？週期推算",
      "formula": "下次月經 = 本次首日 + 週期長度；週期階段 ≈ 距上次首日天數",
      "explanation": [
        "月經預測的核心是『週期長度』：從本次第一天往後加一個週期，就是下次預期日。多數人在 21–35 天之間，28 天只是常見值而非標準。",
        "知道週期長度還能粗略判斷階段：排卵約在下次月經前 14 天，之前為濾泡期、之後為黃體期，有助於理解情緒、精力波動。",
        "本工具適合規律週期做日程提醒；若週期紊亂、經期過長或劇痛，應就醫排查多囊、甲狀腺等問題，而非依賴推算。"
      ],
      "faq": [
        {"q": "週期多少天算正常？", "a": "21–35 天都屬常見範圍，因人而異。只要自身相對穩定、規律，不必追求 28 天。"},
        {"q": "為什麼我每次都不準？", "a": "壓力、體重劇烈變化、熬夜、疾病都會打亂週期。偶爾波動正常；長期不規律建議婦科檢查。"},
        {"q": "能靠這個判斷懷孕嗎？", "a": "不能。月經推遲只是可能信號之一，確診要靠驗孕。此工具只做日程推算，不替代檢測。"}
      ]
    },
    "en": {
      "steps": [
        "Enter first day of last period and average cycle length.",
        "The tool estimates next period and upcoming cycle dates.",
        "Also estimates the current phase (follicular / luteal)."
      ],
      "explanationTitle": "Predicting periods: cycle math",
      "formula": "next = last first day + cycle length; phase ≈ days since last first day",
      "explanation": [
        "The core is cycle length: add one cycle to the last first day for the next expected date. Most people fall in 21–35 days; 28 is common, not a standard.",
        "Knowing length also hints at phase: ovulation ~14 days before next period, follicular before, luteal after—helping explain mood/energy swings.",
        "Good for regular-cycle reminders; if cycles are chaotic, very long, or painful, see a doctor for PCOS/thyroid rather than relying on math."
      ],
      "faq": [
        {"q": "What cycle length is normal?", "a": "21–35 days is common and varies by person. As long as yours is stable, you needn't hit 28."},
        {"q": "Why is mine never on time?", "a": "Stress, big weight changes, poor sleep, illness all disrupt it. Occasional shifts are normal; chronic irregularity deserves a check."},
        {"q": "Can this detect pregnancy?", "a": "No. A late period is only one possible sign; confirm with a test. This tool only schedules, not diagnoses."}
      ]
    },
    "de": {
      "steps": [
        "Ersten Tag der letzten Periode und Zykluslänge eingeben.",
        "Tool schätzt nächste Periode und kommende Termine.",
        "Auch Phase (Follikel / Gelbkörper) abschätzen."
      ],
      "explanationTitle": "Periode vorhersagen: Zyklusrechnung",
      "formula": "nächste = letzter 1. Tag + Zykluslänge; Phase ≈ Tage seit 1. Tag",
      "explanation": [
        "Kern ist die Zykluslänge: einen Zyklus zum letzten 1. Tag addieren. Die meisten liegen 21–35 Tage; 28 ist häufig, kein Standard.",
        "Länge deutet auf Phase: Eisprung ~14 Tage vor Periode, davor Follikel, danach Gelbkörper—erklärt Stimmung/Energie.",
        "Für regelmäßige Erinnerungen; bei混沌, sehr lang oder schmerzhaft: Arzt (PCOS/Schilddrüse), nicht auf Rechnung verlassen."
      ],
      "faq": [
        {"q": "Welche Länge normal?", "a": "21–35 Tage sind verbreitet, individuell. Stabil ist wichtiger als 28."},
        {"q": "Warum bei mir nie pünktlich?", "a": "Stress, Gewicht, Schlaf, Krankheit stören. Gelegentlich normal; chronisch = Check."},
        {"q": "Erkennt das Schwangerschaft?", "a": "Nein. Späte Periode ist nur ein Zeichen; Test bestätigt. Nur Planung, keine Diagnose."}
      ]
    },
    "ja": {
      "steps": [
        "最終月経の最初の日と平均周期を入力します。",
        "次回の月経日と今後の周期予定を推算します。",
        "現在の周期段階（卵胞期／黄体期）の目安も出します。"
      ],
      "explanationTitle": "生理日の予測：周期の計算",
      "formula": "次回 = 前回初日 + 周期長；段階 ≈ 前回初日からの日数",
      "explanation": [
        "核心は周期長です。前回の初日から1周期を足すと次回の予想日になります。多くの人は21–35日で、28日は目安であって標準ではありません。",
        "長さが分かれば段階も推測できます。排卵は次回の約14日前、その前が卵胞期、後が黄体期で、気分や精力の波の説明になります。",
        "規則的な周期の提醒に便利。周期が不順・著しく長い・激痛があるなら、推算ではなく多囊胞や甲状腺などを医療で確認を。"
      ],
      "faq": [
        {"q": "周期は何日が正常？", "a": "21–35日が一般的で人による。自分なりに安定していれば28日でなくても構いません。"},
        {"q": "なぜ私は毎回ズレる？", "a": "ストレス・急な体重変化・不眠・病気が乱します。偶発は正常、慢性的なら受診を。"},
        {"q": "妊娠判定できますか？", "a": "できません。遅れはあくまで目印の一つ、確定は検査です。本ツールは日程推算のみ。"}
      ]
    },
    "es": {
      "steps": [
        "Introduce primer día de la última regla y duración media.",
        "La herramienta estima próxima regla y fechas futuras.",
        "También fase actual (folicular / lútea)."
      ],
      "explanationTitle": "Predecir la regla: matemática del ciclo",
      "formula": "próxima = último 1.º día + duración; fase ≈ días desde 1.º día",
      "explanation": [
        "El núcleo es la duración: suma un ciclo al último 1.º día para la próxima fecha. La mayoría 21–35 días; 28 es común, no estándar.",
        "La duración también sugiere fase: ovulación ~14 días antes, folicular antes, lútea después—explica ánimo/energía.",
        "Útil para recordatorios regulares; si es caótico, muy largo o doloroso, consulta (SOP/ tiroides) en vez de la math."
      ],
      "faq": [
        {"q": "¿Qué duración es normal?", "a": "21–35 días es común y varía. Estable importa más que 28."},
        {"q": "¿Por qué la mía nunca es puntual?", "a": "Estrés, peso, sueño, enfermedad alteran. Ocasional normal; crónico = revisión."},
        {"q": "¿Detecta embarazo?", "a": "No. La regla tardía es solo una señal; confirma con test. Solo agenda, no diagnostica."}
      ]
    }
  },
  # ---------------- web ----------------
  "html-encoder": {
    "zh": {
      "steps": [
        "粘贴需要转义的 HTML 文本（含 < > & 等字符）。",
        "选择编码（转义特殊字符）或解码（还原）。",
        "复制结果用于网页代码、表单值或文档展示。"
      ],
      "explanationTitle": "HTML 转义是什么？为什么需要",
      "formula": "常用映射：& → &amp;  < → &lt;  > → &gt;  \" → &quot;  ' → &#39;",
      "explanation": [
        "HTML 转义把具有语法含义的字符换成实体引用，避免浏览器把它们误当成标签或属性。例如把 < 写成 &lt;，页面才会原样显示小于号。",
        "在把用户输入回显到页面时，正确转义能防止 XSS（跨站脚本）攻击——这是 Web 安全的基本功。服务端框架多会自动转义，手动拼接 HTML 时尤其要小心。",
        "本工具双向支持编码/解码，适合检查一段文本在网页里到底会渲染成什么，或还原别人转义过的内容。"
      ],
      "faq": [
        {"q": "转义和加密是一回事吗？", "a": "不是。转义只是『让字符失去语法含义』的文本处理，任何人都能解码还原；它不保密，也不能替代加密。"},
        {"q": "什么时候必须转义？", "a": "凡是把数据插入 HTML、属性、URL 或 JS 上下文时。最危险的是把用户输入直接拼进页面，必须用对应上下文的转义。"},
        {"q": "为什么解码后和原文本不一样？", "a": "若原文本身含实体（如已转义的 &amp;），解码会还原成 &。这是预期行为；反复编解码要留意幂等性。"}
      ]
    },
    "zh-TW": {
      "steps": [
        "貼上需要跳脫的 HTML 文字（含 < > & 等字元）。",
        "選擇編碼（跳脫特殊字元）或解碼（還原）。",
        "複製結果用於網頁程式碼、表單值或文件展示。"
      ],
      "explanationTitle": "HTML 跳脫是什麼？為什麼需要",
      "formula": "常用對應：& → &amp;  < → &lt;  > → &gt;  \" → &quot;  ' → &#39;",
      "explanation": [
        "HTML 跳脫把具有語法含義的字元換成實體參照，避免瀏覽器誤當成標籤或屬性。例如把 < 寫成 &lt;，頁面才會原樣顯示小於號。",
        "把使用者輸入回顯到頁面時，正確跳脫能防止 XSS（跨站腳本）攻擊——這是 Web 安全的基本功。伺服器框架多會自動跳脫，手動拼接 HTML 時尤其要小心。",
        "本工具雙向支援編碼/解碼，適合檢查一段文字在網頁裡到底會渲染成什麼，或還原別人跳脫過的內容。"
      ],
      "faq": [
        {"q": "跳脫和加密是一回事嗎？", "a": "不是。跳脫只是『讓字元失去語法含義』的文字處理，任何人都能解碼還原；它不保密，也不能替代加密。"},
        {"q": "什麼時候必須跳脫？", "a": "凡是把資料插入 HTML、屬性、URL 或 JS 上下文時。最危險的是把使用者輸入直接拼進頁面，必須用對應上下文的跳脫。"},
        {"q": "為什麼解碼後和原文字不一樣？", "a": "若原文本身含實體（如已跳脫的 &amp;），解碼會還原成 &。這是預期行為；反覆編解碼要留意冪等性。"}
      ]
    },
    "en": {
      "steps": [
        "Paste HTML text needing escaping (with < > & etc.).",
        "Choose encode (escape special chars) or decode (restore).",
        "Copy the result for web code, form values, or docs."
      ],
      "explanationTitle": "What is HTML escaping and why",
      "formula": "map: & → &amp;  < → &lt;  > → &gt;  \" → &quot;  ' → &#39;",
      "explanation": [
        "HTML escaping replaces syntax-meaning chars with entity references so the browser won't treat them as tags or attributes. E.g. write < as &lt; to display a literal less-than.",
        "When echoing user input back to a page, correct escaping prevents XSS (cross-site scripting)—a Web-security basic. Frameworks often auto-escape; manual HTML concatenation needs care.",
        "This tool encodes/decodes both ways, handy to check what a snippet really renders as, or to restore someone else's escaped content."
      ],
      "faq": [
        {"q": "Is escaping the same as encryption?", "a": "No. Escaping only strips syntactic meaning; anyone can decode it. It's not secret and doesn't replace encryption."},
        {"q": "When must I escape?", "a": "Whenever inserting data into HTML, attributes, URLs, or JS contexts. Riskiest is user input concatenated straight into a page—use context-correct escaping."},
        {"q": "Why does decoding differ from the original?", "a": "If the source already had entities (e.g. &amp;), decoding restores &. Expected; watch idempotency on repeated round-trips."}
      ]
    },
    "de": {
      "steps": [
        "HTML-Text mit < > & einfügen.",
        "Kodieren (escapen) oder Dekodieren wählen.",
        "Ergebnis für Code, Formularwerte, Docs kopieren."
      ],
      "explanationTitle": "Was ist HTML-Escaping und warum",
      "formula": "Zuordnung: & → &amp;  < → &lt;  > → &gt;  \" → &quot;  ' → &#39;",
      "explanation": [
        "Escaping ersetzt syntaktische Zeichen durch Entities, damit der Browser sie nicht als Tags nimmt. < wird zu &lt;, um ein echtes Kleinerzeichen zu zeigen.",
        "Beim Zurückgeben von Nutzereingaben verhindert korrektes Escaping XSS—eine Web-Security-Grundlage. Frameworks escapen oft automatisch; manuelle Konkatenation braucht Sorgfalt.",
        "Die Herramienta kodiert/dekodiert beides, nützlich um zu prüfen, was ein Schnipsel rendert, oder fremdes Escaping rückgängig zu machen."
      ],
      "faq": [
        {"q": "Escaping = Verschlüsselung?", "a": "Nein. Escaping nimmt nur die Syntaxbedeutung; jeder kann dekodieren. Nicht geheim, ersetzt keine Verschlüsselung."},
        {"q": "Wann muss ich escapen?", "a": "Immer wenn Daten in HTML, Attribute, URLs oder JS kommen. Am riskantesten: Nutzereingabe direkt in Seite—kontextrichtig escapen."},
        {"q": "Warum weicht Dekodierung ab?", "a": "Hatte die Quelle schon Entities (&amp;), Decoding stellt & her. Erwartet; bei Wiederholung Idempotenz beachten."}
      ]
    },
    "ja": {
      "steps": [
        "エスケープ対象の HTML 文字（< > & など）を貼り付けます。",
        "エンコード（特殊文字を逃がす）かデコード（元に戻す）を選びます。",
        "結果をコード・フォーム値・文書用にコピーします。"
      ],
      "explanationTitle": "HTML エスケープとは？なぜ必要",
      "formula": "対応：& → &amp;  < → &lt;  > → &gt;  \" → &quot;  ' → &#39;",
      "explanation": [
        "HTML エスケープは、構文として意味を持つ文字を実体参照に置き換え、ブラウザがタグなどと誤認するのを防ぎます。例えば < を &lt; と書けばそのまま小なり記号が表示されます。",
        "ユーザー入力をページに出力するとき、正しいエスケープで XSS（クロスサイトスクリプティング）を防げます。これは Web セキュリティの基本です。多くのフレームワークは自動で逃がしますが、手組みの HTML 結合は注意が要ります。",
        "本ツールは双方向（符号化/復元）に対応し、スニペットが実際どう描画されるか確認したり、他人のエスケープを元に戻すのに便利です。"
      ],
      "faq": [
        {"q": "エスケープは暗号化と同じ？", "a": "違います。エスケープは構文意味を消すだけで、誰でも復元できます。秘密にはならず暗号の代わりにもなりません。"},
        {"q": "いつエスケープが必要？", "a": "データを HTML・属性・URL・JS に入れるときは常に。最も危険なのはユーザー入力をそのままページに結合することで、文脈に合ったエスケープを。"},
        {"q": "デコード結果が元と違う？", "a": "元が既に実体（&amp; 等）を含んでいれば & に戻ります。期待通りの動作です。繰り返すと冪等性に注意。"}
      ]
    },
    "es": {
      "steps": [
        "Pega texto HTML a escapar (con < > & etc.).",
        "Elig codificar (escapar) o decodificar (restaurar).",
        "Copia el resultado para código, valores de formulario o docs."
      ],
      "explanationTitle": "Qué es el escapado HTML y por qué",
      "formula": "mapeo: & → &amp;  < → &lt;  > → &gt;  \" → &quot;  ' → &#39;",
      "explanation": [
        "El escapado reemplaza caracteres con significado sintáctico por entidades para que el navegador no los tome como etiquetas. Ej. < se escribe &lt; para mostrar el signo.",
        "Al volver a mostrar entrada del usuario, el escapado correcto previene XSS—un básico de seguridad web. Los frameworks suelen escapar solos; concatenar HTML a mano exige cuidado.",
        "Esta herramienta codifica/decodifica en ambos sentidos, útil para ver qué renderiza un fragmento o restaurar contenido escapado ajeno."
      ],
      "faq": [
        {"q": "¿Escapar es lo mismo que cifrar?", "a": "No. Escapar solo quita el significado sintáctico; cualquiera puede decodificar. No es secreto ni reemplaza cifrado."},
        {"q": "¿Cuándo debo escapar?", "a": "Siempre que insertes datos en HTML, atributos, URLs o JS. Lo más arriesgado es entrada de usuario concatenada directo en la página—usa escape según contexto."},
        {"q": "¿Por qué el decode difiere del original?", "a": "Si la fuente ya tenía entidades (&amp;), decodificar restaura &. Esperado; cuida idempotencia en repeticiones."}
      ]
    }
  },
  "html-chars": {
    "zh": {
      "steps": [
        "输入或粘贴含特殊字符的文本。",
        "选择转换为 HTML 实体（如 © → &copy;）或反向还原。",
        "查看每个字符对应的实体名与编号，复制使用。"
      ],
      "explanationTitle": "HTML 字符实体：名称与编号",
      "formula": "字符 → 命名实体(&copy;) 或 数字实体(&#169; / &#xA9;)",
      "explanation": [
        "HTML 实体让你在页面里插入键盘打不出、或会被误读为标签的字符，例如版权符号 ©、商标 ™、非断行空格。形式分『命名实体』（&copy;）和『数字实体』（&#169; 或十六进制 &#xA9;）。",
        "命名实体可读性更好，但有些冷门符号只有数字实体；数字实体兼容性强，适合任意 Unicode 字符。",
        "本工具列出每个字符的实体名与编号，方便在 HTML、邮件模板、富文本里精确插入特殊符号而不出错。"
      ],
      "faq": [
        {"q": "命名实体和数字实体哪个更好？", "a": "命名实体更易读、好维护；数字实体兼容性最好、能表达任意码点。混用无妨，关键是编辑器/环境支持。"},
        {"q": "为什么有的符号没有命名实体？", "a": "HTML 只为标准字符定义了有限命名实体，新 Unicode 符号往往只有数字实体。用 &#xXXXX; 即可覆盖。"},
        {"q": "实体和 UTF-8 直接存字符冲突吗？", "a": "不冲突。现代站点多用 UTF-8 直接存字符；实体主要用于必须转义、或需要语义清晰的场合。"}
      ]
    },
    "zh-TW": {
      "steps": [
        "輸入或貼上含特殊字元的文字。",
        "選擇轉換為 HTML 實體（如 © → &copy;）或反向還原。",
        "查看每個字元對應的實體名與編號，複製使用。"
      ],
      "explanationTitle": "HTML 字元實體：名稱與編號",
      "formula": "字元 → 命名實體(&copy;) 或 數字實體(&#169; / &#xA9;)",
      "explanation": [
        "HTML 實體讓你在頁面裡插入鍵盤打不出、或會被誤讀為標籤的字元，例如版權符號 ©、商標 ™、非斷行空格。形式分『命名實體』（&copy;）和『數字實體』（&#169; 或十六進位 &#xA9;）。",
        "命名實體可讀性更好，但有些冷門符號只有數字實體；數字實體相容性強，適合任意 Unicode 字元。",
        "本工具列出每個字元的實體名與編號，方便在 HTML、郵件模板、富文本裡精確插入特殊符號而不出錯。"
      ],
      "faq": [
        {"q": "命名實體和數字實體哪個更好？", "a": "命名實體更易讀、好維護；數字實體相容性最好、能表達任意碼點。混用無妨，關鍵是編輯器/環境支援。"},
        {"q": "為什麼有的符號沒有命名實體？", "a": "HTML 只為標準字元定義了有限命名實體，新 Unicode 符號往往只有數字實體。用 &#xXXXX; 即可覆蓋。"},
        {"q": "實體和 UTF-8 直接存字元衝突嗎？", "a": "不衝突。現代站點多用 UTF-8 直接存字元；實體主要用於必須轉義、或需要語意清晰的場合。"}
      ]
    },
    "en": {
      "steps": [
        "Type or paste text with special characters.",
        "Choose convert to HTML entities (e.g. © → &copy;) or reverse.",
        "See each character's named and numeric entity, then copy."
      ],
      "explanationTitle": "HTML character entities: names and numbers",
      "formula": "char → named (&copy;) or numeric (&#169; / &#xA9;)",
      "explanation": [
        "Entities let you insert characters you can't type or that would be misread as tags—copyright ©, trademark ™, non-breaking space. Forms: named (&copy;) and numeric (&#169; or hex &#xA9;).",
        "Named entities read better; some rare symbols exist only as numeric. Numeric entities are maximally compatible and cover any Unicode point.",
        "This tool lists each character's name and number, handy for precise insertion in HTML, email templates, and rich text without errors."
      ],
      "faq": [
        {"q": "Named or numeric entity?", "a": "Named is more readable and maintainable; numeric has the best compatibility and covers any code point. Mixing is fine if your tooling supports it."},
        {"q": "Why do some symbols lack a named entity?", "a": "HTML defines a limited set of named entities for standard chars; newer Unicode often only has numeric. Use &#xXXXX; to cover it."},
        {"q": "Do entities conflict with storing UTF-8 chars?", "a": "No. Modern sites mostly store UTF-8 directly; entities are for must-escape or semantics-clear cases."}
      ]
    },
    "de": {
      "steps": [
        "Text mit Sonderzeichen eingeben/einfügen.",
        "In HTML-Entities wandeln (&copy;) oder zurück.",
        "Name und Nummer je Zeichen sehen, kopieren."
      ],
      "explanationTitle": "HTML-Entities: Namen und Zahlen",
      "formula": "Zeichen → named (&copy;) oder numeric (&#169; / &#xA9;)",
      "explanation": [
        "Entities fügen Zeichen ein, die man nicht tippt oder die als Tags gelesen würden—©, ™, geschütztes Leerzeichen. Formen: named (&copy;) und numeric (&#169; bzw. hex &#xA9;).",
        "Named lesen sich besser; seltene Symbole gibt es nur numerisch. Numerisch ist am kompatibelsten und deckt jeden Unicode-Punkt.",
        "Die Herramienta listet Name und Zahl je Zeichen—praktisch für präzise Einfügung in HTML, E-Mail, Rich Text."
      ],
      "faq": [
        {"q": "Named oder numeric?", "a": "Named lesbarer; numeric am kompatibelsten, deckt jeden Code-Punkt. Mischen geht, wenn Tooling mitspielt."},
        {"q": "Warum fehlt manchen Symbolen der Name?", "a": "HTML definiert nur eine begrenzte Named-Menge; neueres Unicode oft nur numeric. &#xXXXX; deckt es."},
        {"q": "Konflikt mit UTF-8?", "a": "Nein. Moderne Seiten speichern UTF-8 direkt; Entities nur für Muss-Escapen oder Klarheit."}
      ]
    },
    "ja": {
      "steps": [
        "特殊文字を含むテキストを入力・貼り付けます。",
        "HTML 実体への変換（© → &copy;）か逆を選びます。",
        "各文字の実体名と番号を確認しコピーします。"
      ],
      "explanationTitle": "HTML 文字実体：名前と番号",
      "formula": "文字 → 命名実体(&copy;) または 数字実体(&#169; / &#xA9;)",
      "explanation": [
        "実体を使うと、キーボードで打てない・タグと誤認される文字（©、™、改行なし空白など）を挿入できます。形式は命名実体（&copy;）と数字実体（&#169; または 16 進 &#xA9;）です。",
        "命名実体は読みやすく、希少記号は数字実体のみのことがあります。数字実体は互換性が高く任意の Unicode をカバーします。",
        "本ツールは各文字の名前と番号を一覧し、HTML・メール・リッチテキストでの正確な挿入に便利です。"
      ],
      "faq": [
        {"q": "命名と数字どちらがいい？", "a": "命名は可読性が高く、数字は互換性最高で全コードポイントを表せます。環境が対応していれば混在も可。"},
        {"q": "名前のない記号があるのは？", "a": "HTML が定義する命名実体は標準文字に限られ、新しい Unicode は数字実体のみのことが多いです。&#xXXXX; で網羅できます。"},
        {"q": "実体と UTF-8 直接保存は衝突？", "a": "しません。現代サイトは UTF-8 で直接保存が主流。実体は必須エスケープや意味の明確化に用います。"}
      ]
    },
    "es": {
      "steps": [
        "Escribe o pega texto con caracteres especiales.",
        "Elig convertir a entidades HTML (&copy;) o revertir.",
        "Ve nombre y número de cada carácter y copia."
      ],
      "explanationTitle": "Entidades HTML: nombres y números",
      "formula": "carácter → nombre (&copy;) o numérico (&#169; / &#xA9;)",
      "explanation": [
        "Las entidades insertan caracteres que no tipeas o que se leerían como etiquetas—©, ™, espacio irregular. Formas: nombre (&copy;) y numérico (&#169; o hex &#xA9;).",
        "Los nombrados se leen mejor; símbolos raros solo numéricos. Los numéricos son máxima compatibilidad y cubren cualquier punto Unicode.",
        "La herramienta lista nombre y número por carácter, útil para inserción precisa en HTML, correo y rich text."
      ],
      "faq": [
        {"q": "¿Nombre o número?", "a": "Nombre más legible; numérico máxima compatibilidad y cubre cualquier punto. Mezclar está bien si el tooling soporta."},
        {"q": "¿Por qué falta nombre a algunos símbolos?", "a": "HTML define un conjunto limitado de nombrados; Unicode nuevo suele ser solo numérico. &#xXXXX; lo cubre."},
        {"q": "¿Conflicto con guardar UTF-8?", "a": "No. Sitios modernos guardan UTF-8 directo; entidades para escapar obligatorio o claridad semántica."}
      ]
    }
  },
  "emoji-chars": {
    "zh": {
      "steps": [
        "输入或粘贴含 emoji / 特殊符号的文本。",
        "查看每个字符的 Unicode 码点（U+XXXX）与 UTF-8 编码。",
        "可复制码点或实体形式用于代码与文档。"
      ],
      "explanationTitle": "Emoji 与 Unicode：码点怎么看",
      "formula": "码点表示：U+1F600（😀）；UTF-8 字节：0xF0 0x9F 0x98 0x80",
      "explanation": [
        "每个 emoji 和字符在 Unicode 里都有唯一『码点』，形如 U+1F600。很多 emoji 实际由多个码点组合（如肤色、零宽连接符 ZWJ），所以长度不等于可见字符数。",
        "UTF-8 是网页最常用编码，把码点变成 1–4 个字节。代理对（surrogate pair）让 BMP 之外的字符能在 UTF-16 里表示——这也是为什么 JS 里 '😀'.length 是 2。",
        "本工具把文本拆成字符并列出码点与字节，方便调试『为什么截断/乱码/长度不对』这类问题。"
      ],
      "faq": [
        {"q": "为什么 emoji 算两个字符？", "a": "超出基本多文种平面（BMP）的字符在 UTF-16 中用代理对表示，JS 字符串按 UTF-16 单元计数，所以 length 为 2。"},
        {"q": "码点和 UTF-8 编码有什么区别？", "a": "码点是字符在 Unicode 表中的编号（逻辑）；UTF-8 是该编号在网络/文件里的字节表示（物理）。一个码点可对应 1–4 字节。"},
        {"q": "为什么有时 emoji 显示成方框？", "a": "系统或字体缺少该 emoji 字形，就会回退成方框/问号。与编码无关，是字体覆盖问题。"}
      ]
    },
    "zh-TW": {
      "steps": [
        "輸入或貼上含 emoji / 特殊符號的文字。",
        "查看每個字元的 Unicode 碼點（U+XXXX）與 UTF-8 編碼。",
        "可複製碼點或實體形式用於程式碼與文件。"
      ],
      "explanationTitle": "Emoji 與 Unicode：碼點怎麼看",
      "formula": "碼點表示：U+1F600（😀）；UTF-8 位元組：0xF0 0x9F 0x98 0x80",
      "explanation": [
        "每個 emoji 和字元在 Unicode 裡都有唯一『碼點』，形如 U+1F600。很多 emoji 實際由多個碼點組合（如膚色、零寬連接符 ZWJ），所以長度不等於可見字元數。",
        "UTF-8 是網頁最常用編碼，把碼點變成 1–4 個位元組。代理對（surrogate pair）讓 BMP 之外的字元能在 UTF-16 裡表示——這也是為什麼 JS 裡 '😀'.length 是 2。",
        "本工具把文字拆成字元並列出碼點與位元組，方便除錯『為什麼截斷/亂碼/長度不對』這類問題。"
      ],
      "faq": [
        {"q": "為什麼 emoji 算兩個字元？", "a": "超出基本多文種平面（BMP）的字元在 UTF-16 中用代理對表示，JS 字串按 UTF-16 單元計數，所以 length 為 2。"},
        {"q": "碼點和 UTF-8 編碼有什麼區別？", "a": "碼點是字元在 Unicode 表中的編號（邏輯）；UTF-8 是該編號在網路/檔案裡的位元組表示（物理）。一個碼點可對應 1–4 位元組。"},
        {"q": "為什麼有時 emoji 顯示成方框？", "a": "系統或字體缺少該 emoji 字形，就會回退成方框/問號。與編碼無關，是字體覆蓋問題。"}
      ]
    },
    "en": {
      "steps": [
        "Type or paste text with emoji / special symbols.",
        "See each character's Unicode code point (U+XXXX) and UTF-8 bytes.",
        "Copy code points or entity form for code and docs."
      ],
      "explanationTitle": "Emoji and Unicode: reading code points",
      "formula": "code point: U+1F600 (😀); UTF-8 bytes: 0xF0 0x9F 0x98 0x80",
      "explanation": [
        "Every emoji and character has a unique Unicode code point like U+1F600. Many emoji are actually combinations (skin tone, ZWJ), so string length ≠ visible count.",
        "UTF-8, the web's common encoding, turns a code point into 1–4 bytes. Surrogate pairs let beyond-BMP chars exist in UTF-16—why '😀'.length is 2 in JS.",
        "This tool splits text into characters with their points and bytes, great for debugging truncation, mojibake, or wrong length."
      ],
      "faq": [
        {"q": "Why does an emoji count as two characters?", "a": "Chars beyond the BMP use a surrogate pair in UTF-16; JS counts UTF-16 units, so length is 2."},
        {"q": "Code point vs UTF-8 encoding?", "a": "Code point is the logical number in the Unicode table; UTF-8 is the on-wire byte form. One point maps to 1–4 bytes."},
        {"q": "Why do some emoji show as boxes?", "a": "The system or font lacks that glyph and falls back to a box/question mark. It's a font-coverage issue, not encoding."}
      ]
    },
    "de": {
      "steps": [
        "Text mit Emoji / Sonderzeichen eingeben.",
        "Code-Punkt (U+XXXX) und UTF-8-Bytes je Zeichen sehen.",
        "Code-Punkt oder Entity für Code/Docs kopieren."
      ],
      "explanationTitle": "Emoji und Unicode: Code-Punkte",
      "formula": "Code-Punkt: U+1F600 (😀); UTF-8: 0xF0 0x9F 0x98 0x80",
      "explanation": [
        "Jedes Emoji hat einen eindeutigen Unicode-Code-Punkt wie U+1F600. Viele Emoji sind Kombinationen (Hautton, ZWJ), daher Länge ≠ sichtbare Zahl.",
        "UTF-8, die gängige Web-Kodierung, macht aus einem Punkt 1–4 Bytes. Surrogate-Paare lassen BMP-überschreitende Zeichen in UTF-16 existieren—darum '😀'.length = 2 in JS.",
        "Die Herramienta zerlegt Text in Zeichen mit Punkten und Bytes, nützlich beim Debuggen von Abschneiden, Mojibake oder falscher Länge."
      ],
      "faq": [
        {"q": "Warum zählt Emoji als zwei?", "a": "Jenseits BMP steht ein Surrogat-Paar in UTF-16; JS zählt UTF-16-Einheiten, daher length 2."},
        {"q": "Code-Punkt vs UTF-8?", "a": "Code-Punkt ist die logische Nummer; UTF-8 die Byte-Form. Ein Punkt → 1–4 Bytes."},
        {"q": "Warum manche Emoji als Kästchen?", "a": "System/Schrift fehlt der Glyph, Fallback auf Kästchen. Font-Abdeckung, nicht Kodierung."}
      ]
    },
    "ja": {
      "steps": [
        "emoji・特殊記号を含むテキストを入力・貼り付けます。",
        "各文字の Unicode コードポイント（U+XXXX）と UTF-8 バイトを確認します。",
        "コードポイントや実体形式をコード・文書用にコピーします。"
      ],
      "explanationTitle": "絵文字と Unicode：コードポイントの見方",
      "formula": "コードポイント: U+1F600 (😀)；UTF-8 バイト: 0xF0 0x9F 0x98 0x80",
      "explanation": [
        "各絵文字・文字には U+1F600 のような一意のコードポイントがあります。多くの絵文字は肌色や ZWJ などの組み合わせなので、長さは見える数と一致しません。",
        "UTF-8 は Web で一般的な符号化で、コードポイントを 1–4 バイトにします。サロゲートペアにより BMP 外の文字も UTF-16 で表現でき、それが JS で '😀'.length が 2 になる理由です。",
        "本ツールはテキストを文字に分解してポイントとバイトを出し、切り捨て・文字化け・長さ違いのデバッグに便利です。"
      ],
      "faq": [
        {"q": "なぜ絵文字は 2 文字扱い？", "a": "BMP 外の文字は UTF-16 でサロゲートペアになり、JS は UTF-16 単位で数えるため length が 2 になります。"},
        {"q": "コードポイントと UTF-8 の違いは？", "a": "コードポイントは Unicode 上の論理番号、UTF-8 は通信上のバイト表現です。1 ポイントは 1–4 バイトに対応。"},
        {"q": "絵文字が四角になるのは？", "a": "OS やフォントにその字形がなく代替表示されるためです。符号化ではなくフォントカバーの問題です。"}
      ]
    },
    "es": {
      "steps": [
        "Escribe o pega texto con emoji / símbolos.",
        "Ve el punto de código Unicode (U+XXXX) y bytes UTF-8 por carácter.",
        "Copia puntos o entidad para código y docs."
      ],
      "explanationTitle": "Emoji y Unicode: leer puntos de código",
      "formula": "punto: U+1F600 (😀); bytes UTF-8: 0xF0 0x9F 0x98 0x80",
      "explanation": [
        "Cada emoji tiene un punto de código único como U+1F600. Muchos son combinaciones (tono, ZWJ), así longitud ≠ conteo visible.",
        "UTF-8, la codificación común web, convierte un punto en 1–4 bytes. Los pares sustitutos permiten chars fuera del BMP en UTF-16—por eso '😀'.length es 2 en JS.",
        "Esta herramienta separa el texto en caracteres con puntos y bytes, ideal para depurar truncado, mojibake o longitud errónea."
      ],
      "faq": [
        {"q": "¿Por qué un emoji cuenta como dos?", "a": "Fuera del BMP usa par sustituto en UTF-16; JS cuenta unidades UTF-16, así length es 2."},
        {"q": "¿Punto de código vs UTF-8?", "a": "El punto es el número lógico; UTF-8 la forma en bytes. Un punto → 1–4 bytes."},
        {"q": "¿Por qué algunos emoji son cajas?", "a": "El sistema o fuente carece del glifo y cae en caja. Es cobertura de fuente, no codificación."}
      ]
    }
  },
  # ---------------- realestate ----------------
  "rental-yield": {
    "zh": {
      "steps": [
        "输入房产总价（或首付+贷款）与月/年租金收入。",
        "输入持有成本：物业费、税费、空置与维修预留。",
        "查看毛租金收益率与净租金收益率，以及回本年限。"
      ],
      "explanationTitle": "租金回报率怎么算？毛收益与净收益",
      "formula": "毛收益率 = 年租金 ÷ 房产总价；净收益率 = (年租金 − 年成本) ÷ 投入本金",
      "explanation": [
        "毛租金收益率只看『年租金÷总价』，简单但会高估，因为它没扣税费、空置、维修。净收益率（Net Yield）扣除所有持有成本后，才接近真实回报。",
        "投入本金用『实际掏了多少』更合理：全款用总价，贷款则用首付+利息作为本金，否则会把银行杠杆算进你的回报率里、虚高收益。",
        "本工具同时给毛/净收益率与回本年限，帮你在『买房出租』和『存钱理财』之间做 apples-to-apples 比较。"
      ],
      "faq": [
        {"q": "毛收益和净收益差多少？", "a": "视持有成本而定，净收益常比毛收益低 2–4 个百分点。忽略成本会严重高估回报。"},
        {"q": "贷款买房怎么算本金？", "a": "用首付+累计利息作为你的真实投入；别用总价，否则杠杆会虚增收益率。"},
        {"q": "回报率多少算划算？", "a": "没有统一标准，需对比同地段租售比、无风险利率与你当地税负。本工具给数字，判断要结合当地市场。"}
      ]
    },
    "zh-TW": {
      "steps": [
        "輸入房產總價（或自備款+貸款）與月/年租金收入。",
        "輸入持有成本：物業費、稅費、空置與維修預留。",
        "查看毛利金收益率與淨租金收益率，以及回本年限。"
      ],
      "explanationTitle": "租金報酬率怎麼算？毛利與淨利",
      "formula": "毛收益率 = 年租金 ÷ 房產總價；淨收益率 = (年租金 − 年成本) ÷ 投入本金",
      "explanation": [
        "毛利金收益率只看『年租金÷總價』，簡單但會高估，因為它沒扣稅費、空置、維修。淨收益率（Net Yield）扣除所有持有成本後，才接近真實回報。",
        "投入本金用『實際掏了多少』更合理：全款用總價，貸款則用自備款+利息作為本金，否則會把銀行槓桿算進你的報酬率裡、虛高收益。",
        "本工具同時給毛/淨收益率與回本年限，幫你在『買房出租』和『存錢理財』之間做公平比較。"
      ],
      "faq": [
        {"q": "毛收益和淨收益差多少？", "a": "視持有成本而定，淨收益常比毛收益低 2–4 個百分點。忽略成本會嚴重高估回報。"},
        {"q": "貸款買房怎麼算本金？", "a": "用自備款+累計利息作為你的真實投入；別用總價，否則槓桿會虛增收益率。"},
        {"q": "報酬率多少算划算？", "a": "沒有統一標準，需對比同地段租售比、無風險利率與你當地稅負。本工具給數字，判斷要結當地市場。"}
      ]
    },
    "en": {
      "steps": [
        "Enter property price (or down payment + loan) and monthly/annual rent.",
        "Enter holding costs: fees, taxes, vacancy and repair reserves.",
        "See gross and net rental yield, plus payback years."
      ],
      "explanationTitle": "Rental yield: gross vs net",
      "formula": "gross = annual rent ÷ price; net = (annual rent − costs) ÷ invested capital",
      "explanation": [
        "Gross yield only uses 'annual rent ÷ price'—simple but overstates, ignoring taxes, vacancy, repairs. Net yield (after all holding costs) is the real return.",
        "Base capital on 'what you actually put in': full price if cash, or down payment + interest if financed—otherwise leverage inflates your yield.",
        "This tool gives gross/net yield and payback, helping compare 'buy-to-let' against 'save-and-invest' on equal footing."
      ],
      "faq": [
        {"q": "How far apart are gross and net?", "a": "Depends on costs; net is often 2–4 points below gross. Ignoring costs badly overstates return."},
        {"q": "How to count capital with a mortgage?", "a": "Use down payment + cumulative interest as your real outlay; not the full price, or leverage inflates yield."},
        {"q": "What yield is good?", "a": "No universal standard—compare local price-to-rent, risk-free rate, and your taxes. The tool gives numbers; judge with your market."}
      ]
    },
    "de": {
      "steps": [
        "Preis (oder Anzahlung + Kredit) und Miete eingeben.",
        "Haltungskosten: Gebühren, Steuern, Leerstand, Reparatur-Rücklage.",
        "Brutto-/Netto-Rendite und Amortisation sehen."
      ],
      "explanationTitle": "Mietrendite: brutto vs netto",
      "formula": "brutto = Jahresmiete ÷ Preis; netto = (Jahresmiete − Kosten) ÷ Kapital",
      "explanation": [
        "Brutto nutzt nur 'Jahresmiete ÷ Preis'—einfach, aber überschätzt, da Steuern, Leerstand, Reparatur fehlen. Netto nach allen Kosten ist die echte Rendite.",
        "Kapital = 'was du wirklich gabst': bei Barzkauf der Preis, bei Finanzierung Anzahlung + Zinsen—sonst bläht Hebel die Rendite.",
        "Die Herramienta zeigt Brutto/Netto und Amortisation, um 'Kaufen zur Vermietung' gegen 'Sparen' fair zu vergleichen."
      ],
      "faq": [
        {"q": "Wie weit auseinander?", "a": "Je nach Kosten; netto oft 2–4 Punkte unter brutto. Kosten ignorieren übertreibt stark."},
        {"q": "Kapital bei Kredit?", "a": "Anzahlung + Zinsen als echtes Kapital; nicht den vollen Preis, sonst Hebel treibt Rendite."},
        {"q": "Welche Rendite ist gut?", "a": "Kein Standard—örtliches Preis-Miete-Verhältnis, risikofreier Zins, Steuern vergleichen. Tool liefert Zahlen."}
      ]
    },
    "ja": {
      "steps": [
        "物件価格（または頭金＋ローン）と月額・年間家賃を入力します。",
        "維持費（管理費・税金・空室・修繕予備）を入力します。",
        "表面利回りとネット利回り、回収年数を確認します。"
      ],
      "explanationTitle": "利回りの計算：表面とネット",
      "formula": "表面 = 年間家賃 ÷ 価格；ネット = (年間家賃 − 経費) ÷ 投入資本",
      "explanation": [
        "表面利回りは『年間家賃÷価格』のみで単純ですが、税金・空室・修繕を無視するので高めに出ます。ネット利回り（Net Yield）は全経費差引後で真の収益に近いです。",
        "資本は『実際に出した額』を基準に：現金購入は価格、ローンなら頭金＋利息を資本とします。さもないとレバレッジが利回りを水増しします。",
        "本ツールは表面/ネット利回りと回収年数を出し、『買って貸す』と『貯めて運用』を公平に比較できます。"
      ],
      "faq": [
        {"q": "表面とネットの差は？", "a": "経費次第ですが、ネットは表面より 2–4 ポイント低いことが多いです。経費を無視すると大幅に過大評価します。"},
        {"q": "ローン購入の資本は？", "a": "頭金＋累計利息を実際の出資とします。価格全体を使うとレバレッジが利回りを虚増させます。"},
        {"q": "何％が良い利回り？", "a": "一律の基準はなく、現地の売買倍率・無リスク金利・税負担と比較を。ツールは数字を出し、判断は現地市場で。"}
      ]
    },
    "es": {
      "steps": [
        "Introduce precio (o enganche + préstamo) y renta mensual/anual.",
        "Costes de tenencia: tarifas, impuestos, vacancia y reparación.",
        "Ve rendimiento bruto y neto, y años de recuperación."
      ],
      "explanationTitle": "Rendimiento de alquiler: bruto vs neto",
      "formula": "bruto = renta anual ÷ precio; neto = (renta anual − costes) ÷ capital",
      "explanation": [
        "El bruto solo usa 'renta anual ÷ precio'—simple pero exagera al omitir impuestos, vacancia, reparaciones. El neto tras costes es el retorno real.",
        "Capital = 'lo que realmente pusiste': precio al contado, o enganche + intereses si financiado—si no, el apalancamiento infla el rendimiento.",
        "La herramienta da bruto/neto y recuperación, para comparar 'comprar para alquilar' contra 'ahorrar' en igualdad."
      ],
      "faq": [
        {"q": "¿Cuánto distan bruto y neto?", "a": "Según costes; neto suele quedar 2–4 puntos bajo bruto. Ignorar costes sobreestima mucho."},
        {"q": "¿Capital con hipoteca?", "a": "Enganche + intereses como desembolso real; no el precio total, o el apalancamiento infla."},
        {"q": "¿Qué rendimiento es bueno?", "a": "Sin estándar único—compara precio-renta local, tasa sin riesgo e impuestos. La herramienta da números."}
      ]
    }
  },
  "property-valuation": {
    "zh": {
      "steps": [
        "输入可比房源的成交价与关键差异（面积、房龄、楼层等）。",
        "选择估算方法：比较法（看周边成交）或收益法（看租金折现）。",
        "查看估算价值区间与关键调整项的权重。"
      ],
      "explanationTitle": "房产估值怎么估？比较法与收益法",
      "formula": "比较法 ≈ 单价 × 面积 ± 差异调整；收益法 ≈ 年净租金 ÷ 资本化率",
      "explanation": [
        "比较法（市场法）最常用：找近期同小区/同地段成交的相似房源，按面积、房龄、朝向、楼层等差异做加减调整，得到标的估值。",
        "收益法适合投资房：用年净租金除以资本化率（cap rate）得价值，反映『它能产生多少现金流』。自住为主时参考意义有限。",
        "本工具给出估值区间而非精确价——真实成交还受装修、急售、学区等软因素左右，区间比单点数字更稳妥。"
      ],
      "faq": [
        {"q": "为什么估值是一个区间而不是一个数？", "a": "可比房源总有差异，且市场情绪、装修、急迫度都会影响。区间反映不确定性，比伪精确更诚实。"},
        {"q": "比较法和收益法哪个准？", "a": "自住看比较法（周边成交），投资看收益法（现金流）。两者结合最稳：用比较法定锚，用收益法验证投资逻辑。"},
        {"q": "资本化率从哪里来？", "a": "来自同区域同类物业的成交价与租金比，是市场给定的。可参考当地中介或公开成交数据反推。"}
      ]
    },
    "zh-TW": {
      "steps": [
        "輸入可比房源的成交價與關鍵差異（面積、屋齡、樓層等）。",
        "選擇估算方法：比較法（看周邊成交）或收益法（看租金折現）。",
        "查看估算價值區間與關鍵調整項的權重。"
      ],
      "explanationTitle": "房產估值怎麼估？比較法與收益法",
      "formula": "比較法 ≈ 單價 × 面積 ± 差異調整；收益法 ≈ 年淨租金 ÷ 資本化率",
      "explanation": [
        "比較法（市場法）最常用：找近期同社區/同地段成交的相似房源，按面積、屋齡、朝向、樓層等差異做加減調整，得到標的估值。",
        "收益法適合投資房：用年淨租金除以資本化率（cap rate）得價值，反映『它能產生多少現金流』。自住為主時參考意義有限。",
        "本工具給出估值區間而非精確價——真實成交還受裝潢、急售、學區等軟因素左右，區間比單點數字更穩妥。"
      ],
      "faq": [
        {"q": "為什麼估值是一個區間而不是一個數？", "a": "可比房源總有差異，且市場情緒、裝潢、急迫度都會影響。區間反映不確定性，比偽精確更誠實。"},
        {"q": "比較法和收益法哪個準？", "a": "自住看比較法（周邊成交），投資看收益法（現金流）。兩者結合最穩：用比較法定錨，用收益法驗證投資邏輯。"},
        {"q": "資本化率從哪裡來？", "a": "來自同區域同類物業的成交價與租金比，是市場給定的。可參考當地仲介或公開成交數據反推。"}
      ]
    },
    "en": {
      "steps": [
        "Enter comparable sales prices and key diffs (area, age, floor, etc.).",
        "Pick method: comparison (nearby sales) or income (rent discounted).",
        "See a valuation range and the weight of key adjustments."
      ],
      "explanationTitle": "Property valuation: comparison vs income",
      "formula": "comparison ≈ unit price × area ± diff; income ≈ net annual rent ÷ cap rate",
      "explanation": [
        "The comparison (market) approach is most common: take recent similar nearby sales and adjust for area, age, orientation, floor, etc., to value the subject.",
        "The income approach suits investments: annual net rent ÷ capitalization rate (cap rate) gives value, reflecting cash flow. Less relevant for pure owner-occupancy.",
        "This tool gives a range, not a point—real deals are swayed by renovation, urgency, school district, so a band is more honest than false precision."
      ],
      "faq": [
        {"q": "Why a range, not a number?", "a": "Comps always differ, and mood, finish, urgency matter. A range reflects uncertainty more honestly than a fake point."},
        {"q": "Which method is accurate?", "a": "Owner-occupier: comparison (local sales). Investor: income (cash flow). Combine both: anchor with comparison, validate with income."},
        {"q": "Where does cap rate come from?", "a": "From local same-type property price-to-rent ratios set by the market; infer from agent or public transaction data."}
      ]
    },
    "de": {
      "steps": [
        "Vergleichspreise und Diffs (Fläche, Alter, Etage) eingeben.",
        "Methode wählen: Vergleich (Verkäufe) oder Ertrag (Miete).",
        "Wertband und Gewicht der Anpassungen sehen."
      ],
      "explanationTitle": "Immobilienbewertung: Vergleich vs Ertrag",
      "formula": "Vergleich ≈ Einheitspreis × Fläche ± Diff; Ertrag ≈ Nettomiete ÷ Kapitalisierung",
      "explanation": [
        "Das Vergleichswertverfahren ist am üblichsten: ähnliche nahe Verkäufe nehmen und um Fläche, Alter, Lage anpassen.",
        "Das Ertragswertverfahren passt zu Investments: Nettojahresmiete ÷ Kapitalisierungszins ergibt Wert. Bei Eigennutzung weniger relevant.",
        "Die Herramienta gibt ein Band, keine Punkt-Zahl—echte Deals schwanken mit Renovierung, Dringlichkeit, Lage, also ehrlicher."
      ],
      "faq": [
        {"q": "Warum ein Band?", "a": "Vergleichsobjekte unterscheiden sich, Stimmung/Finish/Dringlichkeit zählen. Band ist ehrlicher als Pseudogenauigkeit."},
        {"q": "Welches Verfahren genau?", "a": "Eigennutzung: Vergleich; Investor: Ertrag. Beide kombinieren: mit Vergleich ankern, mit Ertrag prüfen."},
        {"q": "Woher Kapitalisierungszins?", "a": "Aus lokalen Preis-Miete-Verhältnissen des Marktes; aus Makler- oder Transaktionsdaten ableiten."}
      ]
    },
    "ja": {
      "steps": [
        "類似物件の成約価格と違い（面積・築年・階など）を入力します。",
        "手法を選びます：比較法（周辺成約）か收益法（家賃割引）。",
        "推定価値の幅と調整項目の重みを確認します。"
      ],
      "explanationTitle": "不動産評価：比較法と收益法",
      "formula": "比較法 ≈ 単価 × 面積 ± 差異；收益法 ≈ 年ネット家賃 ÷ 還元利回り",
      "explanation": [
        "比較法（市場法）が最も一般的です。直近の似た成約を基に、面積・築年・向き・階などの差を加減して対象を評価します。",
        "收益法は投資物件向きで、年ネット家賃を還元利回り（cap rate）で割って価値を出します。自己居住中心なら参考度は低いです。",
        "本ツールは幅（レンジ）を出し、一点の数字は出しません。実際の取引はリフォーム・急ぎ・学区等に左右されるため、幅の方が誠実です。"
      ],
      "faq": [
        {"q": "なぜ幅なのか？", "a": "類似物件には必ず差があり、相場観・内装・切迫度も効きます。幅は不確実性を正直に表します。"},
        {"q": "どちらの手法が正確？", "a": "自住は比較法（周辺成約）、投資は收益法（キャッシュフロー）。両方併用が安定：比較法で錨を下ろし收益法で検証を。"},
        {"q": "還元利回りはどこから？", "a": "同地域・同タイプの価格対家賃比として市場が決めます。仲介や公開成約データから逆算できます。"}
      ]
    },
    "es": {
      "steps": [
        "Introduce precios de comparables y diffs (área, antigüedad, piso).",
        "Elig método: comparación (ventas) o ingresos (renta).",
        "Ve un rango de valor y el peso de ajustes."
      ],
      "explanationTitle": "Valoración inmobiliaria: comparación vs ingresos",
      "formula": "comparación ≈ precio unitario × área ± diff; ingresos ≈ renta neta ÷ tasa de capitalización",
      "explanation": [
        "El enfoque de comparación es el común: toma ventas recientes similares y ajusta por área, antigüedad, orientación, piso.",
        "El de ingresos sirve para inversión: renta neta anual ÷ tasa de capitalización da valor, refleja flujo. Menos relevante para uso propio.",
        "La herramienta da un rango, no un punto—los tratos reales cambian con renovación, urgencia, zona escolar, así es más honesto."
      ],
      "faq": [
        {"q": "¿Por qué un rango?", "a": "Los comparables difieren y cuentan ánimo, acabado, urgencia. El rango refleja incertidumbre mejor que falsa precisión."},
        {"q": "¿Qué método es preciso?", "a": "Uso propio: comparación; inversor: ingresos. Combina ambos: ancla con comparación, valida con ingresos."},
        {"q": "¿De dónde sale la tasa de capitalización?", "a": "De la relación precio-renta local del mercado; infiere de agente o datos públicos de transacción."}
      ]
    }
  }
}

# ---------- 注入 ----------
for loc in LOCALES:
    path = os.path.join(BASE, f"{loc}.json")
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    c = data.setdefault("converter", {})
    n_add = 0
    for tid, langs in TOOLS.items():
        if tid not in c:
            c[tid] = {}
        if "guide" not in c[tid]:
            c[tid]["guide"] = {}
        # 用该语言的 guide；若缺失回退到 zh
        g = langs.get(loc) or langs["zh"]
        c[tid]["guide"] = g
        n_add += 1
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"{loc}: 写入 {n_add} 个工具 guide")
print("DONE")
