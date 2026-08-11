export type FeatureColor = "blue" | "green" | "amber" | "purple" | "rose" | "cyan" | "indigo";

export interface FeatureItem {
  title: string;
  description: string;
  color: FeatureColor;
}

export interface ToolHighlights {
  title: string;
  description: string;
}

export interface ToolFeatures {
  coreFeatures: FeatureItem[];
  highlights: ToolHighlights[];
}

const highlights: ToolHighlights[] = [
  { title: "Real-time calculation", description: "Results update automatically as you type" },
  { title: "Multi-platform ready", description: "Works smoothly on desktop and mobile devices" },
  { title: "History ready", description: "Reuse previous values with one click" },
];

const highlightsZh: ToolHighlights[] = [
  { title: "实时计算", description: "输入时自动更新结果" },
  { title: "多平台适配", description: "桌面端与移动端均流畅运行" },
  { title: "历史记录", description: "一键复用之前的输入值" },
];

const byCategory: Record<string, ToolFeatures> = {
  finance: {
    coreFeatures: [
      {
        title: "Quick estimation",
        description: "Get results in seconds without complex spreadsheets",
        color: "blue",
      },
      {
        title: "Amortization view",
        description: "See how principal and interest change over time",
        color: "green",
      },
      {
        title: "Scenario compare",
        description: "Test different rates, terms, and down payments",
        color: "amber",
      },
      {
        title: "Export ready",
        description: "Copy or print schedules for records",
        color: "purple",
      },
    ],
    highlights,
  },
  health: {
    coreFeatures: [
      {
        title: "Instant assessment",
        description: "Check metrics like BMI, body fat, and calories",
        color: "blue",
      },
      {
        title: "Multiple formulas",
        description: "Choose the calculation method that fits you",
        color: "green",
      },
      {
        title: "Unit flexibility",
        description: "Switch between metric and imperial freely",
        color: "amber",
      },
      {
        title: "Guidance notes",
        description: "Understand what each result means",
        color: "purple",
      },
    ],
    highlights,
  },
  math: {
    coreFeatures: [
      {
        title: "Step-by-step logic",
        description: "Follow how each number is derived",
        color: "blue",
      },
      {
        title: "Multiple modes",
        description: "Handle percentage, ratio, and equation variants",
        color: "green",
      },
      {
        title: "Precision control",
        description: "Adjust decimal places and rounding rules",
        color: "amber",
      },
      {
        title: "Copy results",
        description: "Grab answers for homework or reports",
        color: "purple",
      },
    ],
    highlights,
  },
  cooking: {
    coreFeatures: [
      {
        title: "Unit conversion",
        description: "Convert cups, grams, ounces, and more",
        color: "blue",
      },
      {
        title: "Recipe scaling",
        description: "Resize recipes for any serving count",
        color: "green",
      },
      { title: "Nutrition lookup", description: "Estimate calories and macros", color: "amber" },
      {
        title: "Cost planning",
        description: "Calculate ingredient cost per serving",
        color: "purple",
      },
    ],
    highlights,
  },
  engineering: {
    coreFeatures: [
      {
        title: "Formula-driven",
        description: "Built on standard engineering equations",
        color: "blue",
      },
      { title: "Unit-aware", description: "Handles SI and imperial units", color: "green" },
      { title: "Parameter sweep", description: "Test values across a range", color: "amber" },
      {
        title: "Reference values",
        description: "Compare against typical materials",
        color: "purple",
      },
    ],
    highlights,
  },
  chemistry: {
    coreFeatures: [
      {
        title: "Molar mass",
        description: "Calculate molecular weight from formulas",
        color: "blue",
      },
      {
        title: "Concentration",
        description: "Work with molarity, molality, and dilution",
        color: "green",
      },
      { title: "Stoichiometry", description: "Balance reaction quantities", color: "amber" },
      {
        title: "pH tools",
        description: "Convert pH, pOH, and hydrogen ion levels",
        color: "purple",
      },
    ],
    highlights,
  },
  color: {
    coreFeatures: [
      {
        title: "Color space convert",
        description: "Switch between HEX, RGB, HSL, and CMYK",
        color: "blue",
      },
      {
        title: "Palette preview",
        description: "See harmonious color combinations",
        color: "green",
      },
      {
        title: "Contrast check",
        description: "Verify accessibility contrast ratios",
        color: "amber",
      },
      { title: "Copy values", description: "Copy CSS or design tokens instantly", color: "purple" },
    ],
    highlights,
  },
  data: {
    coreFeatures: [
      {
        title: "Bandwidth calc",
        description: "Estimate transfer time and throughput",
        color: "blue",
      },
      {
        title: "Storage convert",
        description: "Convert KB, MB, GB, TB, and beyond",
        color: "green",
      },
      {
        title: "Network planning",
        description: "Size links for latency and capacity",
        color: "amber",
      },
      {
        title: "Download estimate",
        description: "Plan file downloads by connection speed",
        color: "purple",
      },
    ],
    highlights,
  },
  datetime: {
    coreFeatures: [
      {
        title: "Date diff",
        description: "Find days, weeks, or months between dates",
        color: "blue",
      },
      {
        title: "Add/subtract time",
        description: "Add durations or count backwards",
        color: "green",
      },
      { title: "Time zone convert", description: "Compare times across regions", color: "amber" },
      { title: "Workday count", description: "Exclude weekends and holidays", color: "purple" },
    ],
    highlights,
  },
  network: {
    coreFeatures: [
      { title: "Subnetting", description: "Calculate CIDR, masks, and host ranges", color: "blue" },
      { title: "IP analysis", description: "Validate and classify IPv4/IPv6", color: "green" },
      {
        title: "Wildcard math",
        description: "Compute network and broadcast addresses",
        color: "amber",
      },
      {
        title: "Copy config",
        description: "Export ranges for firewall or router use",
        color: "purple",
      },
    ],
    highlights,
  },
  crypto: {
    coreFeatures: [
      {
        title: "Hash generation",
        description: "Generate SHA, MD5, and other hashes",
        color: "blue",
      },
      {
        title: "Address check",
        description: "Validate wallet addresses by format",
        color: "green",
      },
      {
        title: "Mining estimate",
        description: "Approximate reward and power costs",
        color: "amber",
      },
      { title: "Rate convert", description: "Convert between crypto and fiat", color: "purple" },
    ],
    highlights,
  },
  automotive: {
    coreFeatures: [
      {
        title: "Fuel economy",
        description: "Compare MPG, L/100km, and cost per km",
        color: "blue",
      },
      { title: "Loan planning", description: "Estimate monthly auto payments", color: "green" },
      {
        title: "Tire sizing",
        description: "Compare tire dimensions and speed ratings",
        color: "amber",
      },
      {
        title: "Maintenance log",
        description: "Track service intervals and costs",
        color: "purple",
      },
    ],
    highlights,
  },
  photo: {
    coreFeatures: [
      { title: "DoF compute", description: "Calculate depth of field for any lens", color: "blue" },
      { title: "Exposure math", description: "Balance shutter, aperture, and ISO", color: "green" },
      {
        title: "Print resolution",
        description: "Find DPI and print size from pixels",
        color: "amber",
      },
      {
        title: "Astro planning",
        description: "Plan star-trail and Milky Way shots",
        color: "purple",
      },
    ],
    highlights,
  },
  physics: {
    coreFeatures: [
      {
        title: "Unit convert",
        description: "Convert physical units across systems",
        color: "blue",
      },
      { title: "Formula calc", description: "Solve common physics equations", color: "green" },
      { title: "Constant lookup", description: "Use built-in physical constants", color: "amber" },
      { title: "Precision output", description: "Control significant figures", color: "purple" },
    ],
    highlights,
  },
  realestate: {
    coreFeatures: [
      {
        title: "Mortgage estimate",
        description: "Calculate monthly mortgage payments",
        color: "blue",
      },
      { title: "ROI analysis", description: "Compare rental yield and cap rate", color: "green" },
      { title: "Affordability", description: "Check what price fits your budget", color: "amber" },
      { title: "Amortization", description: "View yearly loan breakdown", color: "purple" },
    ],
    highlights,
  },
  music: {
    coreFeatures: [
      { title: "BPM/tempo", description: "Calculate beats per minute", color: "blue" },
      { title: "Frequency math", description: "Convert notes to hertz and cents", color: "green" },
      { title: "Interval tool", description: "Find musical intervals and scales", color: "amber" },
      { title: "Audio delay", description: "Sync delay times to tempo", color: "purple" },
    ],
    highlights,
  },
  web: {
    coreFeatures: [
      { title: "URL encode", description: "Encode and decode URLs safely", color: "blue" },
      {
        title: "Color/token convert",
        description: "Switch between CSS color formats",
        color: "green",
      },
      { title: "JSON format", description: "Pretty-print and validate JSON", color: "amber" },
      { title: "Regex test", description: "Test regular expressions live", color: "purple" },
    ],
    highlights,
  },
  infrastructure: {
    coreFeatures: [
      { title: "Capacity plan", description: "Size CPU, memory, and storage", color: "blue" },
      { title: "Licensing", description: "Estimate license and core counts", color: "green" },
      { title: "TCO model", description: "Compare on-prem and cloud costs", color: "amber" },
      { title: "Cluster sizing", description: "Plan Kubernetes node pools", color: "purple" },
    ],
    highlights,
  },
  default: {
    coreFeatures: [
      {
        title: "Fast input",
        description: "Enter values and get answers immediately",
        color: "blue",
      },
      {
        title: "Accurate results",
        description: "Built with validated formulas and constants",
        color: "green",
      },
      {
        title: "Flexible units",
        description: "Switch between common units and formats",
        color: "amber",
      },
      {
        title: "Clear output",
        description: "View results with helpful explanations",
        color: "purple",
      },
    ],
    highlights,
  },
};

const bySlug: Record<string, ToolFeatures> = {
  "percentage-calculator": {
    coreFeatures: [
      {
        title: "Basic percentage",
        description: "Calculate what X% of Y is instantly",
        color: "blue",
      },
      {
        title: "Percent change",
        description: "Find increase or decrease between values",
        color: "green",
      },
      {
        title: "Percent difference",
        description: "Compare relative difference between two numbers",
        color: "amber",
      },
      {
        title: "Reverse percentage",
        description: "Find the original value before a percentage change",
        color: "purple",
      },
    ],
    highlights,
  },
  "compound-interest": {
    coreFeatures: [
      {
        title: "Future value",
        description: "See how much your investment will grow",
        color: "blue",
      },
      {
        title: "Contribution modeling",
        description: "Add monthly or yearly deposits",
        color: "green",
      },
      {
        title: "Interest breakdown",
        description: "Split principal vs. earned interest",
        color: "amber",
      },
      { title: "Yearly schedule", description: "Review growth for each period", color: "purple" },
    ],
    highlights,
  },
  mortgage: {
    coreFeatures: [
      {
        title: "Monthly payment",
        description: "Estimate P&I with taxes and insurance",
        color: "blue",
      },
      {
        title: "Amortization table",
        description: "View yearly principal and interest",
        color: "green",
      },
      { title: "Total interest", description: "See lifetime interest cost", color: "amber" },
      {
        title: "Rate compare",
        description: "Compare rates and terms side by side",
        color: "purple",
      },
    ],
    highlights,
  },
  "bmi-calculator": {
    coreFeatures: [
      { title: "BMI compute", description: "Calculate body mass index quickly", color: "blue" },
      { title: "Category view", description: "See underweight to obese ranges", color: "green" },
      { title: "Ideal weight", description: "Estimate a healthy weight range", color: "amber" },
      { title: "Unit toggle", description: "Switch metric and imperial units", color: "purple" },
    ],
    highlights,
  },
  "calorie-calculator": {
    coreFeatures: [
      { title: "TDEE estimate", description: "Estimate daily energy expenditure", color: "blue" },
      {
        title: "Macro split",
        description: "Calculate protein, fat, and carb targets",
        color: "green",
      },
      {
        title: "Goal modes",
        description: "Plan for weight loss, maintenance, or gain",
        color: "amber",
      },
      {
        title: "Activity levels",
        description: "Factor in exercise and daily movement",
        color: "purple",
      },
    ],
    highlights,
  },
  "cooking-units": {
    coreFeatures: [
      {
        title: "Volume convert",
        description: "Switch cups, tablespoons, milliliters",
        color: "blue",
      },
      { title: "Weight convert", description: "Convert grams, ounces, pounds", color: "green" },
      { title: "Ingredient-aware", description: "Convert by ingredient density", color: "amber" },
      { title: "Scale recipes", description: "Resize from one serving to many", color: "purple" },
    ],
    highlights,
  },
  discount: {
    coreFeatures: [
      { title: "Sale price", description: "Calculate price after discount", color: "blue" },
      { title: "Percent off", description: "Find discount rate from prices", color: "green" },
      { title: "Stack savings", description: "Combine coupons and discounts", color: "amber" },
      { title: "Tax aware", description: "Add sales tax to final price", color: "purple" },
    ],
    highlights,
  },
  currency: {
    coreFeatures: [
      { title: "Rate convert", description: "Convert amounts between currencies", color: "blue" },
      { title: "Markup estimate", description: "Add exchange margin or fee", color: "green" },
      { title: "Bid-ask spread", description: "Compare buy and sell rates", color: "amber" },
      {
        title: "Historical view",
        description: "Track how rates change over time",
        color: "purple",
      },
    ],
    highlights,
  },
};

export function getToolFeatures(toolId: string, categoryId: string): ToolFeatures {
  return bySlug[toolId] ?? byCategory[categoryId] ?? byCategory.default;
}

export function getFeatureColorClasses(color: FeatureColor): string {
  const map: Record<FeatureColor, string> = {
    blue: "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-900",
    green:
      "bg-green-50 text-green-700 border-green-100 dark:bg-green-950 dark:text-green-300 dark:border-green-900",
    amber:
      "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-900",
    purple:
      "bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-900",
    rose: "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-900",
    cyan: "bg-cyan-50 text-cyan-700 border-cyan-100 dark:bg-cyan-950 dark:text-cyan-300 dark:border-cyan-900",
    indigo:
      "bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-900",
  };
  return map[color];
}

export { highlights, highlightsZh };
