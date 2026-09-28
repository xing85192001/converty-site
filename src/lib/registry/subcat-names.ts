// Localized display names for subcategory filter chips.
// Keyed by `${categoryId}.${subId}`.
// English source names live in categories.ts (`Subcategory.name`) and are used
// as the fallback for `en` and for any locale not present in this map.
export const subcatNames: Record<string, Record<string, string>> = {
  // cooking
  "cooking.units": { zh: "单位换算", "zh-TW": "單位換算", de: "Einheitenumrechnung", ja: "単位換算", es: "Conversión de unidades" },
  "cooking.recipes": { zh: "食谱工具", "zh-TW": "食譜工具", de: "Rezeptwerkzeuge", ja: "レシピツール", es: "Herramientas de recetas" },
  "cooking.nutrition": { zh: "营养", "zh-TW": "營養", de: "Ernährung", ja: "栄養", es: "Nutrición" },
  "cooking.cost": { zh: "食材成本", "zh-TW": "食材成本", de: "Lebensmittelkosten", ja: "食品コスト", es: "Costo de alimentos" },

  // automotive
  "automotive.fuel": { zh: "燃油与效率", "zh-TW": "燃油與效率", de: "Kraftstoff & Effizienz", ja: "燃費と効率", es: "Combustible y eficiencia" },
  "automotive.tires": { zh: "轮胎与轮毂", "zh-TW": "輪胎與輪圈", de: "Reifen & Räder", ja: "タイヤとホイール", es: "Neumáticos y ruedas" },
  "automotive.maintenance": { zh: "保养", "zh-TW": "保養", de: "Wartung", ja: "メンテナンス", es: "Mantenimiento" },
  "automotive.financing": { zh: "融资", "zh-TW": "融資", de: "Finanzierung", ja: "ファイナンス", es: "Financiación" },

  // chemistry
  "chemistry.general": { zh: "通用", "zh-TW": "通用", de: "Allgemein", ja: "一般", es: "General" },
  "chemistry.solutions": { zh: "溶液", "zh-TW": "溶液", de: "Lösungen", ja: "溶液", es: "Soluciones" },
  "chemistry.reactions": { zh: "化学反应", "zh-TW": "化學反應", de: "Reaktionen", ja: "反応", es: "Reacciones" },
  "chemistry.reference": { zh: "参考", "zh-TW": "參考", de: "Referenz", ja: "参考", es: "Referencia" },

  // crypto
  "crypto.hashing": { zh: "哈希", "zh-TW": "雜湊", de: "Hashing", ja: "ハッシュ", es: "Hashing" },
  "crypto.wallet": { zh: "钱包", "zh-TW": "錢包", de: "Wallet", ja: "ウォレット", es: "Billetera" },
  "crypto.exchange": { zh: "交易所", "zh-TW": "交易所", de: "Börse", ja: "取引所", es: "Exchange" },
  "crypto.mining": { zh: "挖矿", "zh-TW": "挖礦", de: "Mining", ja: "マイニング", es: "Minería" },

  // data
  "data.storage": { zh: "存储与文件", "zh-TW": "儲存與檔案", de: "Speicher & Dateien", ja: "ストレージとファイル", es: "Almacenamiento y archivos" },
  "data.network": { zh: "网络", "zh-TW": "網路", de: "Netzwerk", ja: "ネットワーク", es: "Red" },

  // datetime
  "datetime.date-time": { zh: "日期与时间", "zh-TW": "日期與時間", de: "Datum & Zeit", ja: "日付と時刻", es: "Fecha y hora" },

  // engineering
  "engineering.structural": { zh: "结构", "zh-TW": "結構", de: "Struktur", ja: "構造", es: "Estructural" },
  "engineering.materials": { zh: "材料", "zh-TW": "材料", de: "Materialien", ja: "材料", es: "Materiales" },
  "engineering.hydraulics": { zh: "液压", "zh-TW": "液壓", de: "Hydraulik", ja: "流体力学", es: "Hidráulica" },
  "engineering.conversion": { zh: "单位转换", "zh-TW": "單位轉換", de: "Umrechnung", ja: "単位換算", es: "Conversión" },

  // finance
  "finance.loans": { zh: "贷款与按揭", "zh-TW": "貸款與房貸", de: "Kredite & Hypotheken", ja: "ローンと住宅ローン", es: "Préstamos e hipotecas" },
  "finance.interest": { zh: "利息与年化利率", "zh-TW": "利息與年利率", de: "Zinsen & APR", ja: "金利とAPR", es: "Interés y TAE" },
  "finance.investments": { zh: "退休与投资", "zh-TW": "退休與投資", de: "Rente & Investitionen", ja: "退職と投資", es: "Jubilación e inversiones" },
  "finance.taxes": { zh: "收入与税务", "zh-TW": "收入與稅務", de: "Einkommen & Steuern", ja: "所得と税金", es: "Ingresos e impuestos" },
  "finance.business": { zh: "商业", "zh-TW": "商業", de: "Geschäft", ja: "ビジネス", es: "Negocios" },
  "finance.everyday": { zh: "日常", "zh-TW": "日常", de: "Alltag", ja: "日常", es: "Cotidiano" },
  "finance.conversion": { zh: "单位转换", "zh-TW": "單位轉換", de: "Umrechnung", ja: "単位換算", es: "Conversión" },

  // realestate
  "realestate.loans": { zh: "贷款与按揭", "zh-TW": "貸款與房貸", de: "Kredite & Hypotheken", ja: "ローンと住宅ローン", es: "Préstamos e hipotecas" },
  "realestate.valuation": { zh: "房产估值", "zh-TW": "房產估值", de: "Immobilienbewertung", ja: "不動産評価", es: "Tasación de propiedades" },
  "realestate.investment": { zh: "投资分析", "zh-TW": "投資分析", de: "Investitionsanalyse", ja: "投資分析", es: "Análisis de inversión" },

  // health
  "health.body": { zh: "身体成分", "zh-TW": "身體組成", de: "Körperzusammensetzung", ja: "体組成", es: "Composición corporal" },
  "health.nutrition": { zh: "营养", "zh-TW": "營養", de: "Ernährung", ja: "栄養", es: "Nutrición" },
  "health.fitness": { zh: "健身", "zh-TW": "健身", de: "Fitness", ja: "フィットネス", es: "Fitness" },
  "health.pregnancy": { zh: "怀孕与生育", "zh-TW": "懷孕與生育", de: "Schwangerschaft & Fruchtbarkeit", ja: "妊娠と不妊", es: "Embarazo y fertilidad" },
  "health.medical": { zh: "医疗", "zh-TW": "醫療", de: "Medizin", ja: "医療", es: "Médico" },

  // infrastructure
  "infrastructure.vmware": { zh: "VMware", "zh-TW": "VMware", de: "VMware", ja: "VMware", es: "VMware" },
  "infrastructure.hyperv": { zh: "Hyper-V", "zh-TW": "Hyper-V", de: "Hyper-V", ja: "Hyper-V", es: "Hyper-V" },
  "infrastructure.kubernetes": { zh: "Kubernetes", "zh-TW": "Kubernetes", de: "Kubernetes", ja: "Kubernetes", es: "Kubernetes" },
  "infrastructure.cost": { zh: "成本分析", "zh-TW": "成本分析", de: "Kostenanalyse", ja: "コスト分析", es: "Análisis de costos" },
  "infrastructure.cpu": { zh: "CPU 性能", "zh-TW": "CPU 效能", de: "CPU-Leistung", ja: "CPU性能", es: "Rendimiento de CPU" },

  // math
  "math.basic": { zh: "基础数学", "zh-TW": "基礎數學", de: "Grundrechnen", ja: "基礎数学", es: "Matemáticas básicas" },
  "math.algebra": { zh: "代数", "zh-TW": "代數", de: "Algebra", ja: "代数", es: "Álgebra" },
  "math.geometry": { zh: "几何", "zh-TW": "幾何", de: "Geometrie", ja: "幾何", es: "Geometría" },
  "math.statistics": { zh: "统计学", "zh-TW": "統計學", de: "Statistik", ja: "統計", es: "Estadística" },
  "math.numbers": { zh: "数制系统", "zh-TW": "數制系統", de: "Zahlensysteme", ja: "数値表現", es: "Sistemas numéricos" },
  "math.advanced": { zh: "高等数学", "zh-TW": "高等數學", de: "Fortgeschritten", ja: "上級", es: "Avanzado" },

  // network
  "network.subnet": { zh: "子网划分", "zh-TW": "子網劃分", de: "Subnetting", ja: "サブネット", es: "Subredes" },
  "network.ip": { zh: "IP 地址", "zh-TW": "IP 位址", de: "IP-Adresse", ja: "IPアドレス", es: "Dirección IP" },

  // photo
  "photo.dof": { zh: "景深", "zh-TW": "景深", de: "Schärfentiefe", ja: "被写界深度", es: "Profundidad de campo" },
  "photo.exposure": { zh: "曝光与光线", "zh-TW": "曝光與光線", de: "Belichtung & Licht", ja: "露出と光", es: "Exposición y luz" },
  "photo.resolution": { zh: "分辨率与格式", "zh-TW": "解析度與格式", de: "Auflösung & Format", ja: "解像度と形式", es: "Resolución y formato" },
  "photo.composition": { zh: "构图与取景", "zh-TW": "構圖與取景", de: "Komposition & Rahmen", ja: "構図とフレーミング", es: "Composición y encuadre" },
  "photo.astro": { zh: "天文摄影", "zh-TW": "天文攝影", de: "Astrofotografie", ja: "天体撮影", es: "Astrofotografía" },
  "photo.optics": { zh: "光学", "zh-TW": "光學", de: "Optik", ja: "光学", es: "Óptica" },
};
