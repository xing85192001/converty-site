export type FeatureColor = "blue" | "green" | "amber" | "purple" | "rose" | "cyan" | "indigo";

export interface FeatureItemLayout {
  titleKey: string;
  color: FeatureColor;
}

export interface HighlightLayout {
  titleKey: string;
  iconIndex: number;
}

export interface ToolFeaturesLayout {
  coreFeatures: FeatureItemLayout[];
  highlights: HighlightLayout[];
}

const highlightLayouts: HighlightLayout[] = [
  { titleKey: "realTimeCalculation", iconIndex: 0 },
  { titleKey: "multiPlatformReady", iconIndex: 1 },
  { titleKey: "historyReady", iconIndex: 2 },
];

const byCategory: Record<string, ToolFeaturesLayout> = {
  finance: {
    coreFeatures: [
      { titleKey: "quickEstimation", color: "blue" },
      { titleKey: "amortizationView", color: "green" },
      { titleKey: "scenarioCompare", color: "amber" },
      { titleKey: "exportReady", color: "purple" },
    ],
    highlights: highlightLayouts,
  },
  health: {
    coreFeatures: [
      { titleKey: "instantAssessment", color: "blue" },
      { titleKey: "multipleFormulas", color: "green" },
      { titleKey: "unitFlexibility", color: "amber" },
      { titleKey: "guidanceNotes", color: "purple" },
    ],
    highlights: highlightLayouts,
  },
  math: {
    coreFeatures: [
      { titleKey: "stepByStepLogic", color: "blue" },
      { titleKey: "multipleModes", color: "green" },
      { titleKey: "precisionControl", color: "amber" },
      { titleKey: "copyResults", color: "purple" },
    ],
    highlights: highlightLayouts,
  },
  cooking: {
    coreFeatures: [
      { titleKey: "unitConversion", color: "blue" },
      { titleKey: "recipeScaling", color: "green" },
      { titleKey: "nutritionLookup", color: "amber" },
      { titleKey: "costPlanning", color: "purple" },
    ],
    highlights: highlightLayouts,
  },
  engineering: {
    coreFeatures: [
      { titleKey: "formulaDriven", color: "blue" },
      { titleKey: "unitAware", color: "green" },
      { titleKey: "parameterSweep", color: "amber" },
      { titleKey: "referenceValues", color: "purple" },
    ],
    highlights: highlightLayouts,
  },
  chemistry: {
    coreFeatures: [
      { titleKey: "molarMass", color: "blue" },
      { titleKey: "concentration", color: "green" },
      { titleKey: "stoichiometry", color: "amber" },
      { titleKey: "phTools", color: "purple" },
    ],
    highlights: highlightLayouts,
  },
  color: {
    coreFeatures: [
      { titleKey: "colorSpaceConvert", color: "blue" },
      { titleKey: "palettePreview", color: "green" },
      { titleKey: "contrastCheck", color: "amber" },
      { titleKey: "copyValues", color: "purple" },
    ],
    highlights: highlightLayouts,
  },
  data: {
    coreFeatures: [
      { titleKey: "bandwidthCalc", color: "blue" },
      { titleKey: "storageConvert", color: "green" },
      { titleKey: "networkPlanning", color: "amber" },
      { titleKey: "downloadEstimate", color: "purple" },
    ],
    highlights: highlightLayouts,
  },
  datetime: {
    coreFeatures: [
      { titleKey: "dateDiff", color: "blue" },
      { titleKey: "addSubtractTime", color: "green" },
      { titleKey: "timeZoneConvert", color: "amber" },
      { titleKey: "workdayCount", color: "purple" },
    ],
    highlights: highlightLayouts,
  },
  network: {
    coreFeatures: [
      { titleKey: "subnetting", color: "blue" },
      { titleKey: "ipAnalysis", color: "green" },
      { titleKey: "wildcardMath", color: "amber" },
      { titleKey: "copyConfig", color: "purple" },
    ],
    highlights: highlightLayouts,
  },
  crypto: {
    coreFeatures: [
      { titleKey: "hashGeneration", color: "blue" },
      { titleKey: "addressCheck", color: "green" },
      { titleKey: "miningEstimate", color: "amber" },
      { titleKey: "rateConvert", color: "purple" },
    ],
    highlights: highlightLayouts,
  },
  automotive: {
    coreFeatures: [
      { titleKey: "fuelEconomy", color: "blue" },
      { titleKey: "loanPlanning", color: "green" },
      { titleKey: "tireSizing", color: "amber" },
      { titleKey: "maintenanceLog", color: "purple" },
    ],
    highlights: highlightLayouts,
  },
  photo: {
    coreFeatures: [
      { titleKey: "dofCompute", color: "blue" },
      { titleKey: "exposureMath", color: "green" },
      { titleKey: "printResolution", color: "amber" },
      { titleKey: "astroPlanning", color: "purple" },
    ],
    highlights: highlightLayouts,
  },
  physics: {
    coreFeatures: [
      { titleKey: "unitConvert", color: "blue" },
      { titleKey: "formulaCalc", color: "green" },
      { titleKey: "constantLookup", color: "amber" },
      { titleKey: "precisionOutput", color: "purple" },
    ],
    highlights: highlightLayouts,
  },
  realestate: {
    coreFeatures: [
      { titleKey: "mortgageEstimate", color: "blue" },
      { titleKey: "roiAnalysis", color: "green" },
      { titleKey: "affordability", color: "amber" },
      { titleKey: "amortization", color: "purple" },
    ],
    highlights: highlightLayouts,
  },
  music: {
    coreFeatures: [
      { titleKey: "bpmTempo", color: "blue" },
      { titleKey: "frequencyMath", color: "green" },
      { titleKey: "intervalTool", color: "amber" },
      { titleKey: "audioDelay", color: "purple" },
    ],
    highlights: highlightLayouts,
  },
  web: {
    coreFeatures: [
      { titleKey: "urlEncode", color: "blue" },
      { titleKey: "colorTokenConvert", color: "green" },
      { titleKey: "jsonFormat", color: "amber" },
      { titleKey: "regexTest", color: "purple" },
    ],
    highlights: highlightLayouts,
  },
  infrastructure: {
    coreFeatures: [
      { titleKey: "capacityPlan", color: "blue" },
      { titleKey: "licensing", color: "green" },
      { titleKey: "tcoModel", color: "amber" },
      { titleKey: "clusterSizing", color: "purple" },
    ],
    highlights: highlightLayouts,
  },
  default: {
    coreFeatures: [
      { titleKey: "fastInput", color: "blue" },
      { titleKey: "accurateResults", color: "green" },
      { titleKey: "flexibleUnits", color: "amber" },
      { titleKey: "clearOutput", color: "purple" },
    ],
    highlights: highlightLayouts,
  },
};

const bySlug: Record<string, ToolFeaturesLayout> = {
  "percentage-calculator": {
    coreFeatures: [
      { titleKey: "basicPercentage", color: "blue" },
      { titleKey: "percentChange", color: "green" },
      { titleKey: "percentDifference", color: "amber" },
      { titleKey: "reversePercentage", color: "purple" },
    ],
    highlights: highlightLayouts,
  },
  "compound-interest": {
    coreFeatures: [
      { titleKey: "futureValue", color: "blue" },
      { titleKey: "contributionModeling", color: "green" },
      { titleKey: "interestBreakdown", color: "amber" },
      { titleKey: "yearlySchedule", color: "purple" },
    ],
    highlights: highlightLayouts,
  },
  mortgage: {
    coreFeatures: [
      { titleKey: "monthlyPayment", color: "blue" },
      { titleKey: "amortizationTable", color: "green" },
      { titleKey: "totalInterest", color: "amber" },
      { titleKey: "rateCompare", color: "purple" },
    ],
    highlights: highlightLayouts,
  },
  "bmi-calculator": {
    coreFeatures: [
      { titleKey: "bmiCompute", color: "blue" },
      { titleKey: "categoryView", color: "green" },
      { titleKey: "idealWeight", color: "amber" },
      { titleKey: "unitToggle", color: "purple" },
    ],
    highlights: highlightLayouts,
  },
  "calorie-calculator": {
    coreFeatures: [
      { titleKey: "tdeeEstimate", color: "blue" },
      { titleKey: "macroSplit", color: "green" },
      { titleKey: "goalModes", color: "amber" },
      { titleKey: "activityLevels", color: "purple" },
    ],
    highlights: highlightLayouts,
  },
  "cooking-units": {
    coreFeatures: [
      { titleKey: "volumeConvert", color: "blue" },
      { titleKey: "weightConvert", color: "green" },
      { titleKey: "ingredientAware", color: "amber" },
      { titleKey: "scaleRecipes", color: "purple" },
    ],
    highlights: highlightLayouts,
  },
  discount: {
    coreFeatures: [
      { titleKey: "salePrice", color: "blue" },
      { titleKey: "percentOff", color: "green" },
      { titleKey: "stackSavings", color: "amber" },
      { titleKey: "taxAware", color: "purple" },
    ],
    highlights: highlightLayouts,
  },
  currency: {
    coreFeatures: [
      { titleKey: "rateConvert", color: "blue" },
      { titleKey: "markupEstimate", color: "green" },
      { titleKey: "bidAskSpread", color: "amber" },
      { titleKey: "historicalView", color: "purple" },
    ],
    highlights: highlightLayouts,
  },
};

export function getToolFeaturesLayout(toolId: string, categoryId: string): ToolFeaturesLayout {
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
