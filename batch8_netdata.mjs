// 第八批 A 层深度文案注入：network 5 + data 4 工具 × 6 语言
import fs from "fs";

const LANGS = ["en", "zh", "zh-TW", "de", "ja", "es"];
const FILE = (l) => `./src/messages/${l}.json`;

const DATA = {
  "cidr-range": {
    en: {
      steps: [
        "Enter an IPv4 or IPv6 address with its prefix length, e.g. 10.0.0.0/24.",
        "Read the network address, first/last usable host, and broadcast (IPv4).",
        "Read the total address count and the range the subnet covers.",
      ],
      explanationTitle: "CIDR range and subnet bounds",
      formula: "addresses = 2^(hostBits); hostBits = 32 − prefix (IPv4)",
      explanation: [
        "CIDR (Classless Inter-Domain Routing) expresses a network as an address plus a prefix length that marks the network portion of the bits.",
        "A /24 leaves 8 host bits, giving 256 addresses (254 usable in IPv4 after network and broadcast). Larger prefixes mean smaller subnets.",
      ],
      faq: [
        { q: "What is the difference between /24 and /16?", a: "A /16 borrows fewer host bits, so it covers 65,536 addresses; a /24 covers only 256." },
        { q: "Why are usable hosts two less than total?", a: "IPv4 reserves the network address and the broadcast address, leaving the rest usable." },
        { q: "Does IPv6 use broadcast?", a: "No; IPv6 has no broadcast, so all addresses in a prefix are effectively usable." },
      ],
    },
    zh: {
      steps: ["输入 IPv4 或 IPv6 地址及其前缀长度，如 10.0.0.0/24。", "读取网络地址、首个/末个可用主机和广播地址（IPv4）。", "读取地址总数与该子网覆盖的范围。"],
      explanationTitle: "CIDR 范围与子网边界",
      formula: "地址数 = 2^(主机位数)；主机位数 = 32 − 前缀（IPv4）",
      explanation: [
        "CIDR（无类别域间路由）用“地址 + 前缀长度”表示网络，前缀长度标出地址中属于网络部分的位数。",
        "/24 留 8 位主机位，共 256 个地址（IPv4 减去网络和广播剩 254 可用）。前缀越大子网越小。",
      ],
      faq: [
        { q: "/24 和 /16 有何不同？", a: "/16 借出更少主机位，覆盖 65536 个地址；/24 仅 256 个。" },
        { q: "为什么可用主机比总数少 2？", a: "IPv4 保留网络地址和广播地址，其余才可用。" },
        { q: "IPv6 用广播吗？", a: "不用；IPv6 无广播，前缀内地址基本都可用。" },
      ],
    },
    zhTW: {
      steps: ["輸入 IPv4 或 IPv6 地址及其前綴長度，如 10.0.0.0/24。", "讀取網路位址、首個/末個可用主機和廣播位址（IPv4）。", "讀取位址總數與該子網覆蓋的範圍。"],
      explanationTitle: "CIDR 範圍與子網邊界",
      formula: "位址數 = 2^(主機位數)；主機位數 = 32 − 前綴（IPv4）",
      explanation: [
        "CIDR（無類別域間路由）用「位址 + 前綴長度」表示網路，前綴長度標出位址中屬於網路部分的位數。",
        "/24 留 8 位主機位，共 256 個位址（IPv4 減去網路與廣播剩 254 可用）。前綴越大子網越小。",
      ],
      faq: [
        { q: "/24 和 /16 有何不同？", a: "/16 借出更少主機位，覆蓋 65536 個位址；/24 僅 256 個。" },
        { q: "為什麼可用主機比總數少 2？", a: "IPv4 保留網路位址和廣播位址，其餘才可用。" },
        { q: "IPv6 用廣播嗎？", a: "不用；IPv6 無廣播，前綴內位址基本都可用。" },
      ],
    },
    de: {
      steps: ["Gib IPv4/IPv6 mit Präfix ein, z. B. 10.0.0.0/24.", "Lies Netzadresse, erste/letzte Host- und Broadcast-Adresse (IPv4).", "Lies die Gesamtzahl und den abgedeckten Bereich."],
      explanationTitle: "CIDR-Bereich und Subnetzgrenzen",
      formula: "adressen = 2^(hostBits); hostBits = 32 − präfix (IPv4)",
      explanation: [
        "CIDR drückt ein Netz als Adresse plus Präfixlänge aus, die den Netzteil der Bits markiert.",
        "Ein /24 lässt 8 Host-Bits, also 256 Adressen (IPv4 nach Netz/Broadcast 254 nutzbar). Größere Präfixe = kleinere Subnetze.",
      ],
      faq: [
        { q: "Unterschied /24 und /16?", a: "/16 deckt 65536 Adressen, /24 nur 256." },
        { q: "Warum nutzbar = gesamt − 2?", a: "IPv4 reserviert Netz- und Broadcast-Adresse." },
        { q: "Nutzt IPv6 Broadcast?", a: "Nein; IPv6 hat keinen Broadcast, alle Adressen sind nutzbar." },
      ],
    },
    ja: {
      steps: ["IPv4/IPv6 アドレスとプレフィックス長を入力（例 10.0.0.0/24）。", "ネットワークアドレス・最初/最後のホスト・ブロードキャスト（IPv4）を確認。", "アドレス総数とサブネットの範囲を確認。"],
      explanationTitle: "CIDR 範囲とサブネット境界",
      formula: "アドレス数 = 2^(ホストビット数)；ホストビット数 = 32 − プレフィックス（IPv4）",
      explanation: [
        "CIDR は「アドレス + プレフィックス長」でネットワークを表し、プレフィックスはネットワーク部分のビット数です。",
        "/24 はホストビットが 8 で 256 アドレス（IPv4 はネットワークとブロードキャストを除き 254 使用可）。プレフィックスが大きいほど小さいサブネット。",
      ],
      faq: [
        { q: "/24 と /16 の違い？", a: "/16 は 65536 アドレス、/24 は 256 アドレスをカバー。" },
        { q: "利用可能が総数より 2 少ない理由？", a: "IPv4 はネットワーク宛先とブロードキャストを予約するため。" },
        { q: "IPv6 はブロードキャストを使う？", a: "使いません。IPv6 にブロードキャストはなく、プレフィックス内は実質すべて利用可。" },
      ],
    },
    es: {
      steps: ["Introduce IPv4/IPv6 con prefijo, p. ej. 10.0.0.0/24.", "Lee la red, primer/último host y broadcast (IPv4).", "Lee el total de direcciones y el rango cubierto."],
      explanationTitle: "Rango CIDR y límites de subred",
      formula: "direcciones = 2^(bitsHost); bitsHost = 32 − prefijo (IPv4)",
      explanation: [
        "CIDR expresa una red como dirección más prefijo que marca la parte de red de los bits.",
        "Un /24 deja 8 bits de host, 256 direcciones (254 usables en IPv4 tras red y broadcast). Prefijos mayores = subredes menores.",
      ],
      faq: [
        { q: "¿Diferencia /24 y /16?", a: "/16 cubre 65536 direcciones; /24 solo 256." },
        { q: "¿Por qué usables = total − 2?", a: "IPv4 reserva la red y el broadcast." },
        { q: "¿Usa IPv6 broadcast?", a: "No; IPv6 no tiene broadcast, todas las direcciones son usables." },
      ],
    },
  },
  "ip-calculator": {
    en: {
      steps: [
        "Enter an IPv4 address, e.g. 192.168.1.10.",
        "Read its class (A/B/C), whether it is private or public, and its subnet mask.",
        "Use the details to plan addressing or troubleshoot connectivity.",
      ],
      explanationTitle: "IP address classification",
      formula: "Class by first octet: 1–126 A, 128–191 B, 192–223 C, 224–239 D (multicast)",
      explanation: [
        "IP classification groups addresses by their first octet to indicate network vs host bit allocation and intended use.",
        "Private ranges (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16) are reserved for local networks and are not routable on the public internet.",
      ],
      faq: [
        { q: "Is 192.168.x.x public?", a: "No; it is private and only reachable inside your local network unless NAT is used." },
        { q: "What is a loopback address?", a: "127.0.0.0/8 (notably 127.0.0.1) refers to the host itself for testing." },
        { q: "Why do we still use classes?", a: "We mostly don't; CIDR replaced classful routing, but class helps understand legacy ranges." },
      ],
    },
    zh: {
      steps: ["输入 IPv4 地址，如 192.168.1.10。", "读取其类别（A/B/C）、是私有还是公有、以及子网掩码。", "用这些信息规划编址或排查连通性。"],
      explanationTitle: "IP 地址分类",
      formula: "按首字节分类：1–126 A 类，128–191 B 类，192–223 C 类，224–239 D 类（组播）",
      explanation: [
        "IP 分类按首字节对地址分组，表示网络位与主机位的分配及用途。",
        "私有地址段（10.0.0.0/8、172.16.0.0/12、192.168.0.0/16）保留给局域网，公网不可路由。",
      ],
      faq: [
        { q: "192.168.x.x 是公网吗？", a: "不是；它是私有地址，除非经 NAT 否则只在局域网内可达。" },
        { q: "什么是回环地址？", a: "127.0.0.0/8（尤其 127.0.0.1）指向本机，用于测试。" },
        { q: "为什么还用分类？", a: "基本不用了；CIDR 已取代分类路由，但有助于理解遗留网段。" },
      ],
    },
    zhTW: {
      steps: ["輸入 IPv4 地址，如 192.168.1.10。", "讀取其類別（A/B/C）、是私有還是公有、以及子網遮罩。", "用這些資訊規劃編址或排查連通性。"],
      explanationTitle: "IP 地址分類",
      formula: "按首位元組分類：1–126 A 類，128–191 B 類，192–223 C 類，224–239 D 類（群播）",
      explanation: [
        "IP 分類按首位元組對地址分組，表示網路位與主機位的分配及用途。",
        "私有地址段（10.0.0.0/8、172.16.0.0/12、192.168.0.0/16）保留給區域網路，公網不可路由。",
      ],
      faq: [
        { q: "192.168.x.x 是公網嗎？", a: "不是；它是私有地址，除非經 NAT 否則只在區域網路內可達。" },
        { q: "什麼是迴環地址？", a: "127.0.0.0/8（尤其 127.0.0.1）指向本機，用於測試。" },
        { q: "為什麼還用分類？", a: "基本不用了；CIDR 已取代分類路由，但有助於理解遺留網段。" },
      ],
    },
    de: {
      steps: ["Gib eine IPv4-Adresse ein, z. B. 192.168.1.10.", "Lies Klasse (A/B/C), privat/öffentlich und Subnetzmaske.", "Nutze die Details für Adressplanung oder Fehlersuche."],
      explanationTitle: "IP-Adressklassifizierung",
      formula: "Klasse nach 1. Oktett: 1–126 A, 128–191 B, 192–223 C, 224–239 D (Multicast)",
      explanation: [
        "Die Klassifizierung gruppiert Adressen nach dem ersten Oktett bezüglich Netz-/Host-Bits und Zweck.",
        "Private Bereiche (10/8, 172.16/12, 192.168/16) sind für LANs reserviert und im Internet nicht routbar.",
      ],
      faq: [
        { q: "Ist 192.168.x.x öffentlich?", a: "Nein; privat, nur im LAN erreichbar außer via NAT." },
        { q: "Was ist Loopback?", a: "127.0.0.0/8 (v. a. 127.0.0.1) meint den eigenen Host zum Testen." },
        { q: "Warum noch Klassen?", a: "Kaum noch; CIDR ersetzte sie, hilft aber bei Legacy-Bereichen." },
      ],
    },
    ja: {
      steps: ["IPv4 アドレスを入力（例 192.168.1.10）。", "クラス（A/B/C）・私用/ Global・サブネットマスクを確認。", "その情報でアドレッシング計画や接続トラブルの特定に。"],
      explanationTitle: "IP アドレスの分類",
      formula: "第1オクテットで分類：1–126 A、128–191 B、192–223 C、224–239 D（マルチキャスト）",
      explanation: [
        "IP 分類は第1オクテットでアドレスをグループ化し、ネットワーク/ホストビットの割当と用途を示します。",
        "私有範囲（10.0.0.0/8、172.16.0.0/12、192.168.0.0/16）は LAN 用に予約され、公網ではルーティングされません。",
      ],
      faq: [
        { q: "192.168.x.x はグローバル？", a: "いいえ。私有で、NAT を介さなければ LAN 内のみ到達可。" },
        { q: "ループバックアドレスとは？", a: "127.0.0.0/8（特に 127.0.0.1）は自身のホストを指しテストに使います。" },
        { q: "なぜクラス分けが残る？", a: "ほぼ使いません。CIDR が置換しましたが、レガシー範囲理解に役立ちます。" },
      ],
    },
    es: {
      steps: ["Introduce una IPv4, p. ej. 192.168.1.10.", "Lee clase (A/B/C), privada/pública y máscara.", "Usa los detalles para direccionar o solucionar conectividad."],
      explanationTitle: "Clasificación de direcciones IP",
      formula: "Clase por 1.º octeto: 1–126 A, 128–191 B, 192–223 C, 224–239 D (multicast)",
      explanation: [
        "La clasificación agrupa direcciones por el primer octeto según bits de red/host y uso.",
        "Los rangos privados (10/8, 172.16/12, 192.168/16) son para LAN y no enrutable en internet público.",
      ],
      faq: [
        { q: "¿Es pública 192.168.x.x?", a: "No; es privada y solo alcanzable en LAN salvo por NAT." },
        { q: "¿Qué es loopback?", a: "127.0.0.0/8 (sobre todo 127.0.0.1) apunta al propio host para pruebas." },
        { q: "¿Por qué aún clases?", a: "Casi no; CIDR las reemplazó, pero ayuda con rangos heredados." },
      ],
    },
  },
  "throughput-calculator": {
    en: {
      steps: [
        "Enter the amount of data transferred and the time it took.",
        "Choose the units (MB/GB and seconds/minutes).",
        "Read the throughput in Mbps or MB/s and compare with your link capacity.",
      ],
      explanationTitle: "Throughput vs bandwidth",
      formula: "throughput = dataTransferred / time; 1 MB/s = 8 Mbps",
      explanation: [
        "Throughput is the actual rate of successful data delivery; bandwidth is the theoretical link capacity.",
        "Real throughput is often lower than bandwidth due to overhead, congestion, and protocol inefficiencies (TCP, retransmits).",
      ],
      faq: [
        { q: "Why is my speed half my plan?", a: "Overhead, contention, and TCP slow-start can cut realized throughput well below line rate." },
        { q: "Mbps or MB/s?", a: "ISPs quote Mbps (bits); file transfers show MB/s (bytes). Divide by 8 to compare." },
        { q: "Does Wi-Fi match Ethernet throughput?", a: "Usually not; RF interference and half-duplex airtime reduce Wi-Fi throughput." },
      ],
    },
    zh: {
      steps: ["输入传输的数据量和所用时间。", "选择单位（MB/GB 与秒/分钟）。", "读取 Mbps 或 MB/s 吞吐率，并与链路容量比较。"],
      explanationTitle: "吞吐率与带宽",
      formula: "吞吐率 = 传输数据量 / 时间；1 MB/s = 8 Mbps",
      explanation: [
        "吞吐率是实际成功交付数据的速率；带宽是链路的理论容量。",
        "受开销、拥塞和协议低效（TCP、重传）影响，实际吞吐率常低于带宽。",
      ],
      faq: [
        { q: "为什么速度只有套餐一半？", a: "开销、竞争和 TCP 慢启动会让实际吞吐率远低于线速。" },
        { q: "Mbps 还是 MB/s？", a: "运营商用 Mbps（比特）；文件传输显示 MB/s（字节）。除以 8 可比较。" },
        { q: "Wi-Fi 能达到以太网吞吐吗？", a: "通常不能；射频干扰与半双工空口会降低 Wi-Fi 吞吐。" },
      ],
    },
    zhTW: {
      steps: ["輸入傳輸的資料量和所用時間。", "選擇單位（MB/GB 與秒/分鐘）。", "讀取 Mbps 或 MB/s 吞吐率，並與鏈路容量比較。"],
      explanationTitle: "吞吐率與頻寬",
      formula: "吞吐率 = 傳輸資料量 / 時間；1 MB/s = 8 Mbps",
      explanation: [
        "吞吐率是實際成功交付資料的速率；頻寬是鏈路的理論容量。",
        "受開銷、擁塞和協定低效（TCP、重傳）影響，實際吞吐率常低於頻寬。",
      ],
      faq: [
        { q: "為什麼速度只有套餐一半？", a: "開銷、競爭和 TCP 慢啟動會讓實際吞吐率遠低於線速。" },
        { q: "Mbps 還是 MB/s？", a: "營運商用 Mbps（位元）；檔案傳輸顯示 MB/s（位元組）。除以 8 可比較。" },
        { q: "Wi-Fi 能達到乙太網吞吐嗎？", a: "通常不能；射頻干擾與半雙工空口會降低 Wi-Fi 吞吐。" },
      ],
    },
    de: {
      steps: ["Gib übertragene Daten und Zeit ein.", "Wähle Einheiten (MB/GB und s/min).", "Lies Durchsatz in Mbps oder MB/s und vergleiche mit der Kapazität."],
      explanationTitle: "Durchsatz vs Bandbreite",
      formula: "durchsatz = daten / zeit; 1 MB/s = 8 Mbps",
      explanation: [
        "Durchsatz ist die tatsächliche Rate der Datenübertragung; Bandbreite ist die theoretische Kapazität.",
        "Realer Durchsatz liegt oft darunter wegen Overhead, Congestion und Protokollverlusten (TCP, Retransmits).",
      ],
      faq: [
        { q: "Warum halbe Tarifgeschwindigkeit?", a: "Overhead, Teilung und TCP Slow-Start senken den Durchsatz stark." },
        { q: "Mbps oder MB/s?", a: "ISP nennt Mbps (Bit); Dateitransfer zeigt MB/s (Byte). Durch 8 teilen." },
        { q: "Wi-Fi wie Ethernet?", a: "Meist nein; Funkstörungen und Halbduplex senken Wi-Fi-Durchsatz." },
      ],
    },
    ja: {
      steps: ["転送データ量と所要時間を入力。", "単位を選択（MB/GB と秒/分）。", "Mbps または MB/s のスループットを確認し回線容量と比較。"],
      explanationTitle: "スループットと帯域幅",
      formula: "スループット = 転送データ量 / 時間；1 MB/s = 8 Mbps",
      explanation: [
        "スループットは実際に届いたデータの速度；帯域幅はリンクの理論的容量です。",
        "オーバーヘッド・輻輳・プロトコル効率（TCP、再送）のせいで実スループットは帯域を下回ることが多いです。",
      ],
      faq: [
        { q: "なぜ半分の速度？", a: "オーバーヘッド・混雑・TCP スロースタートで実効スループットは線速を大きく下回ります。" },
        { q: "Mbps か MB/s か？", a: "事業者は Mbps（ビット）；転送は MB/s（バイト）。比較は 8 で割ります。" },
        { q: "Wi-Fi は有線並み？", a: "通常届かず。電波干渉と半二重で Wi-Fi スループットは下がります。" },
      ],
    },
    es: {
      steps: ["Introduce datos transferidos y tiempo.", "Elige unidades (MB/GB y s/min).", "Lee el rendimiento en Mbps o MB/s y compáralo con la capacidad."],
      explanationTitle: "Rendimiento vs ancho de banda",
      formula: "rendimiento = datos / tiempo; 1 MB/s = 8 Mbps",
      explanation: [
        "El rendimiento es la tasa real de entrega; el ancho de banda es la capacidad teórica.",
        "El rendimiento real suele ser menor por sobrecarga, congestión y TCP (retransmisiones).",
      ],
      faq: [
        { q: "¿Por qué la mitad del plan?", a: "Sobrecarga, contención y TCP slow-start reducen el rendimiento real." },
        { q: "¿Mbps o MB/s?", a: "ISP cita Mbps (bits); transferencias muestran MB/s (bytes). Divide entre 8." },
        { q: "¿Wi-Fi igual que Ethernet?", a: "Normalmente no; interferencia RF y half-duplex reducen el rendimiento Wi-Fi." },
      ],
    },
  },
  "bb-credit-calculator": {
    en: {
      steps: [
        "Enter the link line rate in Gbps (e.g., 16, 32, 64).",
        "Enter the round-trip time between the two switches in milliseconds.",
        "Read the recommended BB_Credit buffer-to-buffer value.",
      ],
      explanationTitle: "Fibre Channel BB_Credit sizing",
      formula: "BB_Credit ≈ RTT(ms) × lineRate(Gbps) / 10",
      explanation: [
        "BB_Credit is the number of buffer-to-buffer credits a Fibre Channel port advertises so the link stays full without waiting for ACKs.",
        "Too few credits throttles long-distance links; the formula sizes credits so the in-flight data fills the pipe during one round trip.",
      ],
      faq: [
        { q: "What happens with too few credits?", a: "The sender stalls waiting for ACK, leaving the link underutilized on long distances." },
        { q: "Is more always better?", a: "Excess credits waste switch buffer memory; size to the actual RTT, not the maximum." },
        { q: "Does this apply to TCP too?", a: "TCP uses a similar window/BDP concept; FC BB_Credit is the storage-network equivalent." },
      ],
    },
    zh: {
      steps: ["输入链路线速（Gbps，如 16、32、64）。", "输入两台交换机间的往返时间（毫秒）。", "读取推荐的 BB_Credit 缓冲到缓冲数值。"],
      explanationTitle: "光纤通道 BB_Credit 规划",
      formula: "BB_Credit ≈ 往返时间(ms) × 线速(Gbps) / 10",
      explanation: [
        "BB_Credit 是光纤通道端口发布的缓冲到缓冲信用数，使链路不必等待 ACK 也能保持满载。",
        "信用过少会拖累长距离链路；该公式让在途数据在一个往返内填满管道。",
      ],
      faq: [
        { q: "信用太少会怎样？", a: "发送方等待 ACK 而停滞，长距离下链路利用率不足。" },
        { q: "越多越好吗？", a: "过多会浪费交换机缓冲内存；应按实际 RTT 而非最大值来定。" },
        { q: "TCP 也适用吗？", a: "TCP 用类似的窗口/BDP 概念；FC 的 BB_Credit 即存储网络对应物。" },
      ],
    },
    zhTW: {
      steps: ["輸入鏈路線速（Gbps，如 16、32、64）。", "輸入兩台交換器間的往返時間（毫秒）。", "讀取推薦的 BB_Credit 緩衝到緩衝數值。"],
      explanationTitle: "光纖通道 BB_Credit 規劃",
      formula: "BB_Credit ≈ 往返時間(ms) × 線速(Gbps) / 10",
      explanation: [
        "BB_Credit 是光纖通道埠發布的緩衝到緩衝信用數，使鏈路不必等待 ACK 也能保持滿載。",
        "信用過少會拖累長距離鏈路；該公式讓在途資料在一個往返內填滿管道。",
      ],
      faq: [
        { q: "信用太少會怎樣？", a: "發送方等待 ACK 而停滯，長距離下鏈路利用率不足。" },
        { q: "越多越好嗎？", a: "過多會浪費交換器緩衝記憶體；應按實際 RTT 而非最大值來定。" },
        { q: "TCP 也適用嗎？", a: "TCP 用類似的視窗/BDP 概念；FC 的 BB_Credit 即儲存網路對應物。" },
      ],
    },
    de: {
      steps: ["Gib die Line-Rate in Gbps ein (16, 32, 64).", "Gib die Round-Trip-Zeit in ms ein.", "Lies den empfohlenen BB_Credit-Wert."],
      explanationTitle: "Fibre-Channel BB_Credit dimensionieren",
      formula: "BB_Credit ≈ RTT(ms) × lineRate(Gbps) / 10",
      explanation: [
        "BB_Credit ist die Zahl der Buffer-to-Buffer-Credits, die ein FC-Port bewirbt, damit die Leitung ohne ACK-Warten voll bleibt.",
        "Zu wenig Credits drosselt Fernlinks; die Formel füllt die Pipeline während eines Round-Trips.",
      ],
      faq: [
        { q: "Zu wenig Credits?", a: "Sender wartet auf ACK und stallt; Link bei Distanz unterausgelastet." },
        { q: "Mehr immer besser?", a: "Zu viele verschwenden Puffer; auf tatsächliche RTT dimensionieren." },
        { q: "Gilt das für TCP?", a: "TCP nutzt Fenster/BDP ähnlich; BB_Credit ist das FC-Pendant." },
      ],
    },
    ja: {
      steps: ["リンク線速を Gbps で入力（16/32/64 等）。", "両スイッチ間の往復時間をミリ秒で入力。", "推奨 BB_Credit（バッファ間クレジット）値を確認。"],
      explanationTitle: "ファイバーチャネル BB_Credit 設計",
      formula: "BB_Credit ≈ 往復時間(ms) × 線速(Gbps) / 10",
      explanation: [
        "BB_Credit は FC ポートがアドバタイズするバッファ間クレジット数で、ACK を待たずにリンクを満たしておくためです。",
        "クレジット不足は長距離リンクを絞ります。この式は 1 往復の間にパイプを満たすようクレジットを決めます。",
      ],
      faq: [
        { q: "クレジット不足の影響？", a: "送信側が ACK 待ちで停滞し、長距離でリンク使用率が落ちます。" },
        { q: "多いほど良い？", a: "多すぎるとスイッチバッファを無駄にします。実 RTT に合わせて決めてください。" },
        { q: "TCP にも当てはまる？", a: "TCP のウィンドウ/BDP と同様の概念。FC の BB_Credit はそのストレージ版です。" },
      ],
    },
    es: {
      steps: ["Introduce la línea en Gbps (16, 32, 64).", "Introduce el tiempo de ida y vuelta en ms.", "Lee el valor recomendado de BB_Credit."],
      explanationTitle: "Dimensionar BB_Credit de Fibre Channel",
      formula: "BB_Credit ≈ RTT(ms) × línea(Gbps) / 10",
      explanation: [
        "BB_Credit es el número de créditos buffer-a-buffer que anuncia un puerto FC para mantener el enlace lleno sin esperar ACK.",
        "Pocos créditos ahogan enlaces largos; la fórmula llena la tubería durante un round-trip.",
      ],
      faq: [
        { q: "¿Pocos créditos?", a: "El emisor se detiene esperando ACK; enlaces largos subutilizados." },
        { q: "¿Más siempre mejor?", a: "Demasiados desperdician búfer; ajústalo al RTT real." },
        { q: "¿Aplica a TCP?", a: "TCP usa ventana/BDP similar; BB_Credit es el equivalente en SAN." },
      ],
    },
  },
  "latency-converter": {
    en: {
      steps: [
        "Enter a latency value in milliseconds, microseconds, or nanoseconds.",
        "Choose the target unit to convert into.",
        "Read the equivalent latency in the new unit, useful for network and storage tuning.",
      ],
      explanationTitle: "Latency unit conversion",
      formula: "1 ms = 1000 µs = 1,000,000 ns; 1 µs = 1000 ns",
      explanation: [
        "Latency is the time a packet or I/O request takes to travel; it is often quoted at different scales depending on the context.",
        "Network round trips are usually milliseconds, SSD I/O is microseconds, and memory/CPU cache accesses are nanoseconds.",
      ],
      faq: [
        { q: "Why does unit matter?", a: "A 10 ms vs 10 µs difference is 1000x; mixing them causes huge design errors." },
        { q: "How does latency relate to speed of light?", a: "In fiber, light moves ~200,000 km/s, so ~5 ms one-way per 1000 km is a hard floor." },
        { q: "Is lower latency always better?", a: "For interactivity yes, but it cannot beat physics; distance sets a minimum." },
      ],
    },
    zh: {
      steps: ["输入延迟值（毫秒、微秒或纳秒）。", "选择要转换的目标单位。", "读取新单位下的等效延迟，用于网络与存储调优。"],
      explanationTitle: "延迟单位换算",
      formula: "1 毫秒 = 1000 微秒 = 1,000,000 纳秒；1 微秒 = 1000 纳秒",
      explanation: [
        "延迟是数据包或 I/O 请求传输所需时间，常按不同尺度表述。",
        "网络往返通常用毫秒，SSD I/O 用微秒，内存/CPU 缓存访问用纳秒。",
      ],
      faq: [
        { q: "为什么单位重要？", a: "10 毫秒与 10 微秒相差 1000 倍，混淆会造成巨大设计错误。" },
        { q: "延迟与光速的关系？", a: "光纤中光约 200,000 km/s，每 1000 km 单程约 5 ms 是硬性下限。" },
        { q: "延迟越低越好吗？", a: "交互场景是，但无法胜过物理；距离设了最小值。" },
      ],
    },
    zhTW: {
      steps: ["輸入延遲值（毫秒、微秒或奈秒）。", "選擇要轉換的目標單位。", "讀取新單位下的等效延遲，用於網路與儲存調優。"],
      explanationTitle: "延遲單位換算",
      formula: "1 毫秒 = 1000 微秒 = 1,000,000 奈秒；1 微秒 = 1000 奈秒",
      explanation: [
        "延遲是資料包或 I/O 請求傳輸所需時間，常按不同尺度表述。",
        "網路往返通常用毫秒，SSD I/O 用微秒，記憶體/CPU 快取存取用奈秒。",
      ],
      faq: [
        { q: "為什麼單位重要？", a: "10 毫秒與 10 微秒相差 1000 倍，混淆會造成巨大設計錯誤。" },
        { q: "延遲與光速的關係？", a: "光纖中光約 200,000 km/s，每 1000 km 單程約 5 ms 是硬性下限。" },
        { q: "延遲越低越好嗎？", a: "互動場景是，但無法勝過物理；距離設了最小值。" },
      ],
    },
    de: {
      steps: ["Gib Latenz in ms, µs oder ns ein.", "Wähle die Zieleinheit.", "Lies die äquivalente Latenz für Netz-/Speicher-Tuning."],
      explanationTitle: "Latenz-Einheiten umrechnen",
      formula: "1 ms = 1000 µs = 1.000.000 ns; 1 µs = 1000 ns",
      explanation: [
        "Latenz ist die Reisezeit eines Pakets oder I/O-Requests, oft in verschiedenen Skalen angegeben.",
        "Netz-RTT meist ms, SSD-I/O µs, Speicher/CPU-Cache ns.",
      ],
      faq: [
        { q: "Warum Einheit wichtig?", a: "10 ms vs 10 µs ist 1000x; Vermischung gibt riesige Fehler." },
        { q: "Latenz und Lichtgeschwindigkeit?", a: "In Glas ~200.000 km/s, also ~5 ms pro 1000 km als Untergrenze." },
        { q: "Immer besser niedriger?", a: "Für Interaktion ja, aber Physik setzt Minimum via Distanz." },
      ],
    },
    ja: {
      steps: ["遅延値をミリ秒・マイクロ秒・ナノ秒で入力。", "変換先の単位を選択。", "新単位の等效遅延を確認（網/ストレージチューニング用）。"],
      explanationTitle: "遅延の単位変換",
      formula: "1 ms = 1000 µs = 1,000,000 ns；1 µs = 1000 ns",
      explanation: [
        "遅延はパケットや I/O 要求の伝送時間で、文脈により異なる尺度で表されます。",
        "ネット往復はミリ秒、SSD I/O はマイクロ秒、メモリ/CPU キャッシュはナノ秒のオーダーです。",
      ],
      faq: [
        { q: "なぜ単位が重要？", a: "10 ms と 10 µs は 1000 倍違い、混同は巨大な設計誤差を生みます。" },
        { q: "遅延と光速の関係？", a: "光ファイバーで約 200,000 km/s。1000 km あたり片道約 5 ms が下限です。" },
        { q: "低いほど良い？", a: "対話性には良いですが物理に勝てず、距離が最小値を決めます。" },
      ],
    },
    es: {
      steps: ["Introduce latencia en ms, µs o ns.", "Elige la unidad destino.", "Lee la latencia equivalente para ajustar red/almacenamiento."],
      explanationTitle: "Conversión de unidades de latencia",
      formula: "1 ms = 1000 µs = 1.000.000 ns; 1 µs = 1000 ns",
      explanation: [
        "La latencia es el tiempo de viaje de un paquete o I/O, citada en distintas escalas.",
        "RTT de red suele ser ms, I/O de SSD µs, caché de CPU ns.",
      ],
      faq: [
        { q: "¿Por qué importa la unidad?", a: "10 ms vs 10 µs es 1000x; mezclarlos causa errores graves." },
        { q: "¿Latencia y velocidad luz?", a: "En fibra ~200.000 km/s, así ~5 ms por 1000 km es suelo físico." },
        { q: "¿Siempre mejor baja?", a: "Para interactividad sí, pero la física pone mínimo por distancia." },
      ],
    },
  },
  "data-size": {
    en: {
      steps: [
        "Enter a value in bytes, KB, MB, GB, or TB.",
        "Choose binary (1024) or decimal (1000) interpretation.",
        "Read the equivalent size in every other unit.",
      ],
      explanationTitle: "Data size unit conversion",
      formula: "1 GiB = 1024 MiB; 1 GB = 1000 MB (decimal); MiB = 1024² bytes",
      explanation: [
        "Storage is quoted in two systems: binary (KiB/MiB/GiB, powers of 1024) used by operating systems, and decimal (KB/MB/GB, powers of 1000) used by drive vendors.",
        "This gap is why a '1 TB' drive shows about 931 GiB in your file manager.",
      ],
      faq: [
        { q: "Why does my 1 TB drive show 931 GB?", a: "Vendors use decimal TB (10^12 bytes); OS uses binary GiB, so 10^12 / 1024³ ≈ 931 GiB." },
        { q: "Which is correct?", a: "Both are correct for their system; the confusion is just the unit label." },
        { q: "What about bits vs bytes?", a: "Network speeds are in bits (Mbps); divide by 8 for bytes." },
      ],
    },
    zh: {
      steps: ["输入以字节、KB、MB、GB 或 TB 表示的值。", "选择二进制（1024）或十进制（1000）解释。", "读取其他所有单位下的等效大小。"],
      explanationTitle: "数据大小单位换算",
      formula: "1 GiB = 1024 MiB；1 GB = 1000 MB（十进制）；MiB = 1024² 字节",
      explanation: [
        "存储有两种体系：操作系统用的二进制（KiB/MiB/GiB，1024 的幂）与硬盘厂商用的十进制（KB/MB/GB，1000 的幂）。",
        "所以“1 TB”硬盘在文件管理器里约显示 931 GiB。",
      ],
      faq: [
        { q: "为什么 1 TB 硬盘显示 931 GB？", a: "厂商用十进制 TB（10^12 字节）；系统用二进制 GiB，10^12 / 1024³ ≈ 931 GiB。" },
        { q: "哪个对？", a: "在其体系下都对，混淆只源于单位标签。" },
        { q: "比特和字节呢？", a: "网速用比特（Mbps）；换算字节除以 8。" },
      ],
    },
    zhTW: {
      steps: ["輸入以位元組、KB、MB、GB 或 TB 表示的值。", "選擇二進位（1024）或十進位（1000）解釋。", "讀取其他所有單位下的等效大小。"],
      explanationTitle: "資料大小單位換算",
      formula: "1 GiB = 1024 MiB；1 GB = 1000 MB（十進位）；MiB = 1024² 位元組",
      explanation: [
        "儲存有兩種體系：作業系統用的二進位（KiB/MiB/GiB，1024 的幂）與硬碟廠商用的十進位（KB/MB/GB，1000 的幂）。",
        "所以「1 TB」硬碟在檔案管理器裡約顯示 931 GiB。",
      ],
      faq: [
        { q: "為什麼 1 TB 硬碟顯示 931 GB？", a: "廠商用十進位 TB（10^12 位元組）；系統用二進位 GiB，10^12 / 1024³ ≈ 931 GiB。" },
        { q: "哪個對？", a: "在其體系下都對，混淆只源於單位標籤。" },
        { q: "位元與位元組呢？", a: "網速用位元（Mbps）；換算位元組除以 8。" },
      ],
    },
    de: {
      steps: ["Gib einen Wert in Byte, KB, MB, GB oder TB ein.", "Wähle binär (1024) oder dezimal (1000).", "Lies die Größe in allen anderen Einheiten."],
      explanationTitle: "Datengrößen umrechnen",
      formula: "1 GiB = 1024 MiB; 1 GB = 1000 MB (dezimal); MiB = 1024² Byte",
      explanation: [
        "Speicher nutzt zwei Systeme: binär (KiB/MiB/GiB, 1024er) beim OS, dezimal (KB/MB/GB, 1000er) bei Herstellern.",
        "Daher zeigt eine '1 TB'-Platte im Manager etwa 931 GiB.",
      ],
      faq: [
        { q: "Warum zeigt 1 TB nur 931 GB?", a: "Hersteller dezimal (10^12 Byte); OS binär, 10^12 / 1024³ ≈ 931 GiB." },
        { q: "Was ist richtig?", a: "Beides in seinem System; Verwirrung nur durch Label." },
        { q: "Bits vs Bytes?", a: "Netzraten in Bits (Mbps); durch 8 für Bytes." },
      ],
    },
    ja: {
      steps: ["バイト・KB・MB・GB・TB の値を入力。", "二進法（1024）か十進法（1000）か選択。", "他のすべての単位での同等サイズを確認。"],
      explanationTitle: "データサイズの単位変換",
      formula: "1 GiB = 1024 MiB；1 GB = 1000 MB（十進）；MiB = 1024² バイト",
      explanation: [
        "ストレージには 2 つの体系があります。OS が使う二進法（KiB/MiB/GiB、1024 の冪）と、ベンダーが使う十進法（KB/MB/GB、1000 の冪）です。",
        "そのため「1 TB」ドライブはファイルマネージャで約 931 GiB と表示されます。",
      ],
      faq: [
        { q: "なぜ 1 TB は 931 GB 表示？", a: "ベンダーは十進 TB（10^12 バイト）；OS は二進で 10^12 / 1024³ ≈ 931 GiB。" },
        { q: "どちらが正しい？", a: "各体系で正しく、混乱は単位ラベルだけです。" },
        { q: "ビットとバイト？", a: "回線速度はビット（Mbps）；バイトは 8 で割ります。" },
      ],
    },
    es: {
      steps: ["Introduce un valor en byte, KB, MB, GB o TB.", "Elige binario (1024) o decimal (1000).", "Lee el tamaño equivalente en las demás unidades."],
      explanationTitle: "Conversión de unidades de datos",
      formula: "1 GiB = 1024 MiB; 1 GB = 1000 MB (decimal); MiB = 1024² bytes",
      explanation: [
        "El almacenamiento usa dos sistemas: binario (KiB/MiB/GiB, 1024) en el SO, decimal (KB/MB/GB, 1000) en fabricantes.",
        "Por eso un disco '1 TB' muestra ~931 GiB en el gestor.",
      ],
      faq: [
        { q: "¿Por qué 1 TB muestra 931 GB?", a: "Fabricante decimal (10^12 bytes); SO binario, 10^12 / 1024³ ≈ 931 GiB." },
        { q: "¿Cuál es correcto?", a: "Ambos en su sistema; la confusión es solo la etiqueta." },
        { q: "¿Bits vs bytes?", a: "Velocidades de red en bits (Mbps); divide entre 8 para bytes." },
      ],
    },
  },
  "bandwidth": {
    en: {
      steps: [
        "Enter a bandwidth value with its unit (bps, Kbps, Mbps, Gbps).",
        "Choose the target unit to convert into.",
        "Read the equivalent rate, useful for comparing plans and links.",
      ],
      explanationTitle: "Bandwidth unit conversion",
      formula: "1 Gbps = 1000 Mbps = 1,000,000 Kbps; 1 byte/s = 8 bps",
      explanation: [
        "Bandwidth is the capacity of a link, always expressed in bits per second for networks.",
        "Decimal steps of 1000 are standard (Kbps = 10³, Mbps = 10⁶, Gbps = 10⁹ bps), unlike storage which mixes 1024 and 1000.",
      ],
      faq: [
        { q: "Why 1000 not 1024 for network?", a: "Network rates follow SI decimal prefixes; only storage traditionally used 1024." },
        { q: "How fast is 1 Gbps in MB/s?", a: "Divide by 8: 1 Gbps ≈ 125 MB/s of actual data." },
        { q: "Does bandwidth equal speed?", a: "It is capacity; actual speed also depends on latency, congestion, and protocol." },
      ],
    },
    zh: {
      steps: ["输入带宽值及其单位（bps、Kbps、Mbps、Gbps）。", "选择要转换的目标单位。", "读取等效速率，便于比较套餐与链路。"],
      explanationTitle: "带宽单位换算",
      formula: "1 Gbps = 1000 Mbps = 1,000,000 Kbps；1 字节/秒 = 8 bps",
      explanation: [
        "带宽是链路的容量，网络一律用每秒比特表示。",
        "网络采用 1000 为步长（Kbps=10³、Mbps=10⁶、Gbps=10⁹ bps），不同于存储混用 1024 与 1000。",
      ],
      faq: [
        { q: "网络为什么用 1000 而非 1024？", a: "网络速率遵循 SI 十进制前缀；只有存储传统上用 1024。" },
        { q: "1 Gbps 是多少 MB/s？", a: "除以 8：1 Gbps ≈ 125 MB/s 实际数据。" },
        { q: "带宽等于速度吗？", a: "它是容量；实际速度还取决于延迟、拥塞和协议。" },
      ],
    },
    zhTW: {
      steps: ["輸入頻寬值及其單位（bps、Kbps、Mbps、Gbps）。", "選擇要轉換的目標單位。", "讀取等效速率，便於比較套餐與鏈路。"],
      explanationTitle: "頻寬單位換算",
      formula: "1 Gbps = 1000 Mbps = 1,000,000 Kbps；1 位元組/秒 = 8 bps",
      explanation: [
        "頻寬是鏈路的容量，網路一律用每秒位元表示。",
        "網路採用 1000 為步長（Kbps=10³、Mbps=10⁶、Gbps=10⁹ bps），不同於儲存混用 1024 與 1000。",
      ],
      faq: [
        { q: "網路為什麼用 1000 而非 1024？", a: "網路速率遵循 SI 十進位前綴；只有儲存傳統上用 1024。" },
        { q: "1 Gbps 是多少 MB/s？", a: "除以 8：1 Gbps ≈ 125 MB/s 實際資料。" },
        { q: "頻寬等於速度嗎？", a: "它是容量；實際速度還取決於延遲、擁塞和協定。" },
      ],
    },
    de: {
      steps: ["Gib eine Bandbreite mit Einheit ein (bps, Kbps, Mbps, Gbps).", "Wähle die Zieleinheit.", "Lies die äquivalente Rate zum Vergleich."],
      explanationTitle: "Bandbreite umrechnen",
      formula: "1 Gbps = 1000 Mbps = 1.000.000 Kbps; 1 Byte/s = 8 bps",
      explanation: [
        "Bandbreite ist die Kapazität, im Netz stets in Bit pro Sekunde.",
        "Netz nutzt 1000er-Schritte (Kbps=10³, Mbps=10⁶, Gbps=10⁹), anders als Storage mit 1024/1000.",
      ],
      faq: [
        { q: "Warum 1000 statt 1024?", a: "Netzraten folgen SI-Präfixen; nur Storage nutzt 1024." },
        { q: "1 Gbps in MB/s?", a: "Durch 8: 1 Gbps ≈ 125 MB/s Daten." },
        { q: "Bandbreite = Speed?", a: "Es ist Kapazität; echte Speed hängt an Latenz, Congestion, Protokoll." },
      ],
    },
    ja: {
      steps: ["帯域幅と単位（bps/Kbps/Mbps/Gbps）を入力。", "変換先の単位を選択。", "等效レートを確認（プラン・リンク比較用）。"],
      explanationTitle: "帯域幅の単位変換",
      formula: "1 Gbps = 1000 Mbps = 1,000,000 Kbps；1 バイト/秒 = 8 bps",
      explanation: [
        "帯域幅はリンクの容量で、ネットワークは常に毎秒ビットで表します。",
        "ネットは 1000 ステップ（Kbps=10³、Mbps=10⁶、Gbps=10⁹）を使い、ストレージの 1024/1000 混在とは異なります。",
      ],
      faq: [
        { q: "なぜ 1000 で 1024 ではない？", a: "回線速度は SI 十進接頭辞に従います。1024 はストレージの慣習です。" },
        { q: "1 Gbps は何 MB/s？", a: "8 で割る：1 Gbps ≈ 125 MB/s の実データ。" },
        { q: "帯域幅＝速度？", a: "容量です。実速度は遅延・輻輳・プロトコルにも依存します。" },
      ],
    },
    es: {
      steps: ["Introduce ancho de banda y unidad (bps, Kbps, Mbps, Gbps).", "Elige la unidad destino.", "Lee la tasa equivalente para comparar."],
      explanationTitle: "Conversión de ancho de banda",
      formula: "1 Gbps = 1000 Mbps = 1.000.000 Kbps; 1 byte/s = 8 bps",
      explanation: [
        "El ancho de banda es la capacidad del enlace, siempre en bits por segundo.",
        "Red usa pasos de 1000 (Kbps=10³, Mbps=10⁶, Gbps=10⁹), a diferencia del almacenamiento que mezcla 1024/1000.",
      ],
      faq: [
        { q: "¿Por qué 1000 y no 1024?", a: "Las tasas de red siguen prefijos SI; solo el almacenamiento usa 1024." },
        { q: "¿1 Gbps en MB/s?", a: "División por 8: 1 Gbps ≈ 125 MB/s de datos." },
        { q: "¿Ancho de banda = velocidad?", a: "Es capacidad; la real depende de latencia, congestión y protocolo." },
      ],
    },
  },
  "tcp-throughput": {
    en: {
      steps: [
        "Enter the RTT (round-trip time) and packet loss probability.",
        "Enter the MSS (maximum segment size, usually 1460 bytes).",
        "Read the maximum sustainable TCP throughput for that path.",
      ],
      explanationTitle: "TCP throughput (Mathis equation)",
      formula: "Throughput ≤ (MSS / RTT) × C / √(loss),  C ≈ 0.93",
      explanation: [
        "The Mathis equation models the throughput ceiling of a TCP connection limited by packet loss and round-trip time.",
        "Even tiny loss (e.g., 0.1%) caps throughput dramatically on long-RTT links, which is why high-loss satellite and WAN links feel slow.",
      ],
      faq: [
        { q: "Why does 1% loss hurt so much?", a: "Throughput scales with 1/√loss, so 1% loss can cut capacity to about 10% of the loss-free case." },
        { q: "Does a bigger window help?", a: "Only up to the BDP; loss still caps the Mathis ceiling regardless of window size." },
        { q: "How do I improve it?", a: "Reduce RTT or loss (better path, FEC, TCP variants like BBR) rather than just raising bandwidth." },
      ],
    },
    zh: {
      steps: ["输入 RTT（往返时间）和丢包率。", "输入 MSS（最大段大小，通常 1460 字节）。", "读取该路径可维持的最大 TCP 吞吐率。"],
      explanationTitle: "TCP 吞吐率（Mathis 公式）",
      formula: "吞吐率 ≤ (MSS / RTT) × C / √(丢包率)，C ≈ 0.93",
      explanation: [
        "Mathis 公式刻画了受丢包和往返时间制约的 TCP 连接吞吐上限。",
        "即便极小丢包（如 0.1%）也会在长 RTT 链路上大幅压低吞吐，这正是高丢包卫星/WAN 链路感觉慢的原因。",
      ],
      faq: [
        { q: "为什么 1% 丢包影响这么大？", a: "吞吐率随 1/√丢包率 变化，1% 丢包可把容量压到无丢包时的约 10%。" },
        { q: "增大窗口有用吗？", a: "只到 BDP 为止；无论窗口多大，丢包仍会封顶 Mathis 上限。" },
        { q: "如何改善？", a: "降低 RTT 或丢包（更优路径、FEC、BBR 等 TCP 变体），而非只加带宽。" },
      ],
    },
    zhTW: {
      steps: ["輸入 RTT（往返時間）和丟包率。", "輸入 MSS（最大段大小，通常 1460 位元組）。", "讀取該路徑可維持的最大 TCP 吞吐率。"],
      explanationTitle: "TCP 吞吐率（Mathis 公式）",
      formula: "吞吐率 ≤ (MSS / RTT) × C / √(丟包率)，C ≈ 0.93",
      explanation: [
        "Mathis 公式刻畫了受丟包和往返時間制約的 TCP 連線吞吐上限。",
        "即便極小丟包（如 0.1%）也會在長 RTT 鏈路上大幅壓低吞吐，這正是高丟包衛星/WAN 鏈路感覺慢的原因。",
      ],
      faq: [
        { q: "為什麼 1% 丟包影響這麼大？", a: "吞吐率隨 1/√丟包率 變化，1% 丟包可把容量壓到無丟包時的約 10%。" },
        { q: "增大視窗有用嗎？", a: "只到 BDP 為止；無論視窗多大，丟包仍會封頂 Mathis 上限。" },
        { q: "如何改善？", a: "降低 RTT 或丟包（更優路徑、FEC、BBR 等 TCP 變體），而非只加頻寬。" },
      ],
    },
    de: {
      steps: ["Gib RTT und Paketverlust ein.", "Gib die MSS ein (meist 1460 Byte).", "Lies den maximalen TCP-Durchsatz der Strecke."],
      explanationTitle: "TCP-Durchsatz (Mathis-Gleichung)",
      formula: "Durchsatz ≤ (MSS / RTT) × C / √(verlust),  C ≈ 0,93",
      explanation: [
        "Die Mathis-Gleichung modelliert das Durchsatzlimit einer TCP-Verbindung bei Verlust und RTT.",
        "Schon kleiner Verlust (0,1%) deckelt den Durchsatz auf langen Strecken stark.",
      ],
      faq: [
        { q: "Warum tut 1% Verlust weh?", a: "Durchsatz ∝ 1/√verlust; 1% kann auf ~10% des verlustfreien Werts senken." },
        { q: "Hilft größeres Fenster?", a: "Nur bis BDP; Verlust deckelt das Mathis-Limit unabhängig davon." },
        { q: "Wie verbessern?", a: "RTT oder Verlust senken (Pfad, FEC, BBR), nicht nur Bandbreite." },
      ],
    },
    ja: {
      steps: ["RTT（往復時間）とパケットロス率を入力。", "MSS（最大セグメントサイズ、通常 1460 バイト）を入力。", "その経路で維持できる最大 TCP スループットを確認。"],
      explanationTitle: "TCP スループット（Mathis の式）",
      formula: "スループット ≤ (MSS / RTT) × C / √(損失),  C ≈ 0.93",
      explanation: [
        "Mathis の式は、損失と RTT に制限される TCP 接続のスループット上限をモデル化します。",
        "わずかな損失（0.1% 等）でも長 RTT リンクではスループットを大きく下げます。これが高損失の衛星/WAN が遅く感じる理由です。" ],
      faq: [
        { q: "なぜ 1% 損失で効く？", a: "スループットは 1/√損失 に比例。1% 損失で無損失時の約 10% まで下がります。" },
        { q: "ウィンドウ拡大は有効？", a: "BDP まで。損失はウィンドウ大小に関係なく Mathis 上限を決めます。" },
        { q: "どう改善する？", a: "RTT か損失を下げる（経路・FEC・BBR 等）、単なる帯域増加ではなく。" },
      ],
    },
    es: {
      steps: ["Introduce RTT y pérdida de paquetes.", "Introduce la MSS (usualmente 1460 bytes).", "Lee el rendimiento TCP máximo sostenible."],
      explanationTitle: "Rendimiento TCP (ecuación de Mathis)",
      formula: "Rendimiento ≤ (MSS / RTT) × C / √(pérdida),  C ≈ 0,93",
      explanation: [
        "La ecuación de Mathis modela el techo de rendimiento de TCP limitado por pérdida y RTT.",
        "Incluso pérdida mínima (0,1%) limita mucho el rendimiento en enlaces de RTT largo.",
      ],
      faq: [
        { q: "¿Por qué 1% de pérdida duele?", a: "Rendimiento ∝ 1/√pérdida; 1% puede bajarlo a ~10% del caso sin pérdida." },
        { q: "¿Ayuda ventana mayor?", a: "Solo hasta BDP; la pérdida sigue limitando el techo de Mathis." },
        { q: "¿Cómo mejorar?", a: "Reduce RTT o pérdida (ruta, FEC, BBR), no solo subir ancho de banda." },
      ],
    },
  },
  "bandwidth-delay-product": {
    en: {
      steps: [
        "Enter the link bandwidth and the round-trip time.",
        "Read the bandwidth-delay product in bits and bytes.",
        "Use it to size TCP buffers and window for long-distance links.",
      ],
      explanationTitle: "Bandwidth-delay product (BDP)",
      formula: "BDP = bandwidth(bits/s) × RTT(seconds)",
      explanation: [
        "The BDP is the amount of data that can be 'in flight' on a link at once; it sets the minimum TCP window to keep the pipe full.",
        "A 100 Mbps link with 100 ms RTT has a BDP of about 1.25 MB, so the window must exceed that to avoid underutilization.",
      ],
      faq: [
        { q: "Why does BDP matter for TCP?", a: "If the window is smaller than BDP, the sender waits for ACKs and the link never fills." },
        { q: "How do I size the buffer?", a: "Set the TCP window and any intermediate buffers to at least the BDP." },
        { q: "Does BDP grow with distance?", a: "Yes; RTT rises with distance, so long-haul links need much larger windows." },
      ],
    },
    zh: {
      steps: ["输入链路带宽和往返时间。", "读取以比特和字节表示的带宽时延积。", "用它来为长距离链路规划 TCP 缓冲与窗口。"],
      explanationTitle: "带宽时延积（BDP）",
      formula: "BDP = 带宽(比特/秒) × RTT(秒)",
      explanation: [
        "BDP 是链路上可同时“在途”的数据量；它决定了保持管道满载所需的最小 TCP 窗口。",
        "100 Mbps 链路、100 ms RTT 的 BDP 约 1.25 MB，窗口必须超过它才能避免利用率不足。",
      ],
      faq: [
        { q: "BDP 对 TCP 为何重要？", a: "若窗口小于 BDP，发送方等 ACK 而链路永远填不满。" },
        { q: "缓冲怎么定？", a: "把 TCP 窗口和中间缓冲至少设为 BDP。" },
        { q: "BDP 随距离增大吗？", a: "会；RTT 随距离上升，所以长途链路需要更大的窗口。" },
      ],
    },
    zhTW: {
      steps: ["輸入鏈路頻寬和往返時間。", "讀取以位元和位元組表示的頻寬時延積。", "用它來為長距離鏈路規劃 TCP 緩衝與視窗。"],
      explanationTitle: "頻寬時延積（BDP）",
      formula: "BDP = 頻寬(位元/秒) × RTT(秒)",
      explanation: [
        "BDP 是鏈路上可同時「在途」的資料量；它決定了保持管道滿載所需的最小 TCP 視窗。",
        "100 Mbps 鏈路、100 ms RTT 的 BDP 約 1.25 MB，視窗必須超過它才能避免利用率不足。",
      ],
      faq: [
        { q: "BDP 對 TCP 為何重要？", a: "若視窗小於 BDP，發送方等 ACK 而鏈路永遠填不滿。" },
        { q: "緩衝怎麼定？", a: "把 TCP 視窗和中間緩衝至少設為 BDP。" },
        { q: "BDP 隨距離增大嗎？", a: "會；RTT 隨距離上升，所以長途鏈路需要更大的視窗。" },
      ],
    },
    de: {
      steps: ["Gib Bandbreite und RTT ein.", "Lies BDP in Bit und Byte.", "Nutze es zur TCP-Fenster-/Puffer-Planung."],
      explanationTitle: "Bandbreite-Latenz-Produkt (BDP)",
      formula: "BDP = bandbreite(bit/s) × RTT(s)",
      explanation: [
        "Das BDP ist die Menge an Daten 'in der Leitung'; es setzt das minimale TCP-Fenster für volle Auslastung.",
        "100 Mbps bei 100 ms RTT ergibt BDP ≈ 1,25 MB; das Fenster muss darüber liegen.",
      ],
      faq: [
        { q: "Warum BDP wichtig?", a: "Ist das Fenster kleiner als BDP, wartet der Sender auf ACK und die Leitung füllt nie." },
        { q: "Puffer dimensionieren?", a: "TCP-Fenster und Zwischenpuffer mindestens auf BDP setzen." },
        { q: "Wächst BDP mit Distanz?", a: "Ja; RTT steigt mit Distanz, also größere Fenster nötig." },
      ],
    },
    ja: {
      steps: ["リンク帯域幅と往復時間を入力。", "ビットとバイトでの BDP を確認。", "長距離リンクの TCP バッファ/ウィンドウ設計に使います。"],
      explanationTitle: "帯域幅×遅延積（BDP）",
      formula: "BDP = 帯域幅(ビット/秒) × RTT(秒)",
      explanation: [
        "BDP はリンク上で同時に「送信中」になり得るデータ量です。パイプを満たす最小 TCP ウィンドウを決めます。",
        "100 Mbps リンクで RTT 100 ms なら BDP は約 1.25 MB。ウィンドウはこれを超えないと使い切れません。" ],
      faq: [
        { q: "BDP は TCP になぜ重要？", a: "ウィンドウが BDP より小さいと送信側は ACK 待ちでリンクが満たされません。" },
        { q: "バッファはどう決める？", a: "TCP ウィンドウと中継バッファを少なくとも BDP 以上に。" },
        { q: "BDP は距離で増える？", a: "はい。RTT は距離と共に増え、長距離ほど大きなウィンドウが必要です。" },
      ],
    },
    es: {
      steps: ["Introduce ancho de banda y RTT.", "Lee el BDP en bits y bytes.", "Úsalo para dimensionar ventana y búfer TCP."],
      explanationTitle: "Producto ancho de banda-retraso (BDP)",
      formula: "BDP = ancho(bits/s) × RTT(s)",
      explanation: [
        "El BDP es la cantidad de datos 'en vuelo'; fija la ventana TCP mínima para llenar el enlace.",
        "100 Mbps con RTT 100 ms da BDP ≈ 1,25 MB; la ventana debe superarlo.",
      ],
      faq: [
        { q: "¿Por qué importa BDP?", a: "Si la ventana es menor que BDP, el emisor espera ACK y el enlace no se llena." },
        { q: "¿Cómo dimensionar búfer?", a: "Ventana TCP y búferes intermedios al menos igual al BDP." },
        { q: "¿BDP crece con distancia?", a: "Sí; RTT sube con distancia, enlaces largos necesitan ventanas mayores." },
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

console.log("Injected network 5 + data 4 tools x 6 languages = 54 guide sets.");
