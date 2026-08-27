import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
EN_PATH = ROOT / "src/messages/en.json"
ZH_PATH = ROOT / "src/messages/zh.json"

# Hand-crafted Chinese translations for the most visible / broken finance keys.
# Keys not present here fall back to the English source text to eliminate
# the corrupted mixed Chinese-English strings (e.g. "Direct c材料erials").
ZH_TRANSLATIONS: dict[str, str] = {
    # Personal loan calculator (screenshot 1)
    "originationFee": "手续费 (%)",
    "originationFeeHelp": "一次性费用，从贷款金额中扣除",
    "originationFeeLabel": "手续费",
    "trueApr": "真实年利率",
    "totalCost": "总成本",
    "breakdownLoanAmount": "贷款金额",
    "breakdownOriginationFee": "- 手续费",
    "youReceive": "= 实际到账",
    "totalPayments": "总付款",
    "totalCostInclFee": "总成本（含费用）",

    # Profit margin calculator (screenshot 2)
    "revenueSales": "收入 / 销售额",
    "costOfGoodsSold": "销售成本（COGS）",
    "cogsDescription": "直接成本：原材料、人工、制造费用",
    "operatingExpenses": "运营费用",
    "opexDescription": "间接成本：租金、水电、工资等",
    "taxes": "税费",
    "grossProfit": "毛利润",
    "grossMargin": "毛利率",
    "operatingProfit": "营业利润",
    "operatingMargin": "营业利润率",
    "netProfit": "净利润",
    "netMargin": "净利润率",
    "markupOnCogs": "COGS 加价率",
    "revenue": "收入",
    "minusCogs": "- 销售成本",
    "equalsGrossProfit": "= 毛利润",
    "minusOperatingExpenses": "- 运营费用",
    "equalsOperatingProfit": "= 营业利润",
    "minusTaxes": "- 税费",
    "equalsNetProfit": "= 净利润",
    "equalsTotalCost": "= 总成本",
    "equalsTotalRepayment": "= 总还款额",

    # Common loan / mortgage labels
    "loanAmount": "贷款金额",
    "loanAmountLabel": "贷款金额",
    "loanDetails": "贷款详情",
    "monthlyPayment": "月供",
    "monthlyPaymentBreakdown": "月供明细",
    "annualInterestRate": "年利率（%）",
    "interestRatePercent": "利率（%）",
    "loanTermMonths": "贷款期限（月）",
    "loanTermYears": "贷款期限（年）",
    "loanTermYearsLabel": "贷款期限（年）",
    "startDate": "开始日期",
    "totalInterest": "总利息",
    "totalPayment": "总付款",
    "effectiveRate": "有效利率",
    "payoffDate": "还清日期",
    "perMonth": "每月",
    "principal": "本金",
    "interest": "利息",
    "principalVsInterest": "本金与利息",
    "balanceOverTime": "余额随时间变化",
    "yearlyPrincipalVsInterest": "年度本金与利息",
    "remainingBalance": "剩余余额",
    "year": "年",
    "month": "月",

    # Down payment / mortgage
    "downPaymentAmount": "首付金额 ($)",
    "downPaymentDollar": "首付金额 ($)",
    "downPaymentPercent": "首付比例 (%)",
    "downPaymentPercentage": "首付比例 (%)",
    "downPaymentGoal": "首付目标",
    "downPaymentHomePrice": "房屋价格",
    "downPaymentLabel": "首付",
    "downPaymentOf": "的",
    "downPaymentAfter": "之后",
    "downPaymentTypical": "常见：20% 以免除 PMI",
    "minusDownPayment": "- 首付",
    "minusTradeIn": "- 置换价值",
    "homePrice": "房屋价格",
    "homeValue": "房屋价值",
    "propertyTaxAnnual": "物业税（年）",
    "homeInsuranceAnnual": "房屋保险（年）",
    "pmiMonthly": "PMI（月）",
    "hoaFeesMonthly": "HOA 费用（月）",
    "propertyTax": "物业税",
    "insurance": "保险",
    "pmi": "PMI",
    "hoaFees": "HOA 费用",
    "loanSummary": "贷款概要",

    # Investment / retirement
    "initialInvestment": "初始投资",
    "investmentPeriod": "投资期限（年）",
    "investmentPeriodYears": "投资期限（年）",
    "expectedAnnualReturn": "预期年回报率（%）",
    "expectedReturn": "预期回报率（%）",
    "expectedReturnLabel": "预期回报率（%）",
    "expectedInflation": "预期通胀率（%）",
    "monthlyContribution": "每月供款",
    "annualContributionLabel": "每年供款",
    "currentAge": "当前年龄",
    "retirementAge": "退休年龄",
    "currentRetirementSavings": "当前退休储蓄",
    "desiredAnnualIncome": "退休后期望年收入",
    "lifeExpectancy": "预期寿命",
    "finalBalance": "最终余额",
    "totalInterestEarned": "总赚取利息",
    "effectiveAnnualRate": "有效年利率",
    "growthOverTime": "增长趋势",
    "balanceGrowthByYear": "按年增长",
    "yearByYearBreakdown": "逐年明细",
    "currentBalance": "当前余额",
    "currentBalanceLabel": "当前余额",
    "contributions": "供款",
    "growth": "增长",
    "balance": "余额",
    "showingFirst20Years": "显示前 20 年...",
    "moreYears": "+ {count} 年...",

    # Tax / income
    "incomeDetails": "收入详情",
    "taxInformation": "税务信息",
    "filingStatus": "申报状态",
    "deductions": "扣除项",
    "preTaxDeductions": "税前扣除",
    "postTaxDeductions": "税后扣除",
    "takeHomePay": "实发工资",
    "incomeBreakdown": "收入明细",
    "taxBreakdown": "税务明细",
    "summary": "概要",
    "grossAnnual": "年度总收入",
    "taxableIncome": "应税收入",
    "totalTax": "总税款",
    "netAnnual": "年度净收入",
    "effectiveTaxRate": "有效税率",
    "marginalTaxRate": "边际税率",
    "takeHome": "实发收入",
    "federalTax": "联邦税",
    "stateTax": "州税",
    "fica": "FICA",
    "annual": "年度",
    "monthly": "每月",
    "biweekly": "每两周",
    "weekly": "每周",
    "daily": "每日",
    "hourly": "每小时",
    "currentSalary": "当前薪资",
    "hoursPerWeek": "每周工时",

    # Auto / student / credit
    "vehiclePrice": "车辆价格",
    "tradeInValue": "置换价值",
    "salesTaxRate": "销售税率 (%)",
    "salesTax": "销售税",
    "plusSalesTax": "+ 销售税",
    "gracePeriod": "宽限期（月）",
    "gracePeriodDescription": "毕业后开始还款前的宽限期",
    "capitalizeInterest": "宽限期内将利息计入本金",
    "deferralPeriod": "延期期限（年）",
    "deferralPeriodHelp": "开始付款前的年数",
    "minimumPayment": "最低还款额",
    "minimumPaymentDescription": "最低还款占余额的百分比",
    "minimumPaymentFloor": "最低还款下限",
    "minimumPaymentFloorDescription": "最低还款额不能低于此金额",
    "minimumPaymentPercent": "最低还款额 (%)",
    "extraPayment": "额外还款",
    "extraPaymentHelp": "每月额外偿还金额",
    "interestSaved": "节省利息",

    # Bond / annuity / ROI
    "bondPrice": "债券价格",
    "faceValue": "面值（票面价值）",
    "faceValueAtMaturity": "到期面值",
    "couponRate": "票面利率 (%)",
    "couponRateHelper": "债券每年支付的利率",
    "annualCoupon": "年度票息",
    "currentYield": "当前收益率",
    "marketRate": "市场利率 (%)",
    "marketRateHelper": "可比债券的当前市场收益率",
    "annuityType": "年金类型",
    "frequencyAnnual": "每年",
    "frequencyQuarterly": "每季度",
    "frequencySemiAnnual": "每半年",
    "beginningOfMonth": "月初",
    "endOfMonth": "月末",
    "annualizedRoi": "年化投资回报率",
    "leaveZeroForSimpleRoi": "留 0 仅计算简单 ROI",

    # Break-even / contribution margin
    "breakEvenPoint": "盈亏平衡点",
    "fixedCosts": "固定成本",
    "fixedCostsHint": "租金、工资、保险等",
    "contributionMargin": "边际贡献",
    "cmRatio": "边际贡献率",

    # Equity / HELOC
    "availableEquity": "可用净值",
    "availableEquityDescription": "房屋价值的 80% 减去贷款余额",
    "currentEquity": "当前净值",
    "currentLtv": "当前贷款价值比",
    "combinedLtv": "综合贷款价值比",
    "currentMortgageBalance": "当前抵押贷款余额",
    "equityAfterLoan": "贷款后净值",
    "heloc": "房屋净值信贷额度",
    "helocDescription": "房屋净值信贷额度（浮动利率，提款期内仅付利息）",

    # General
    "enterValuesToCalculate": "输入数值开始计算",
    "enter-values": "输入数值开始计算",
    "emptyState": "输入有效数值开始计算",
    "enterValidValuesCreditCard": "输入有效数值开始计算。还款额必须至少覆盖利息。",
    "enterValuesToConvert": "输入要转换的数值",
    "amountNeeded": "所需金额",
    "newLoanAmount": "新贷款金额",
    "desiredLoanAmount": "期望贷款金额",
    "additionalPayment": "额外付款",
    "firstPayment": "首次付款",
    "interestPaid": "已付利息",
    "loss": "亏损",
    "numberOfPeople": "人数",

    # Compound / savings
    "compoundFrequency": "复利频率",
    "annually": "每年",
    "semiAnnually": "每半年",
    "quarterly": "每季度",
    "regularContributions": "定期供款",
    "contributionTiming": "供款时间",
    "savingsContributions": "储蓄与供款",
    "returnsIncome": "回报与收入",
    "retirementProjection": "退休预测",
    "projectedSavingsAtRetirement": "退休时预计储蓄",
    "onTrackMessage": "您的退休储蓄计划进展顺利！",
    "considerIncreasingContributions": "考虑增加供款。缺口：",
    "inflationAdjustedValue": "通胀调整后价值",
    "yearsInRetirement": "退休年数",
    "savingsGrowthOverTime": "储蓄增长趋势",
    "retirement": "退休",
    "totalSavings": "总储蓄",
    "accumulationPhaseDetails": "积累阶段详情",
    "basedOn4Percent": "基于 4% 提取规则",
    "afterYearsOfGrowth": "经过 {years} 年增长后",
    "forYears": "为期 {years} 年",
    "goalNotReachable": "目标可能无法达成",
    "goalNotReachableDescription": "按当前供款，需要 50 年以上才能达到目标。考虑增加每月供款或降低目标。",

    # Misc
    "above": "以上",
    "below": "以下",
    "afterTax": "，税后",
    "deferred": "延期",
    "immediate": "立即",
    "discount": "折扣",
    "discount-percent": "折扣 %",
    "exchangeRate": "汇率",
    "exchangeRateNote": "注意：汇率仅供演示，可能不反映当前市场汇率。",
    "inverseRate": "反向汇率",
    "finalValue": "最终价值",
    "ageLabel": "年龄",
    "ageLabelWithValue": "年龄 {age}",
    "amountFinanced": "= 融资金额",
    "interestRate": "利率",
    "currentTaxBracket": "当前税率等级 (%)",
    "deductionsDescription": "税前扣除包括 401(k)、HSA、FSA 供款。税后扣除包括 Roth 401(k)、人寿保险等。",
    "interestCapitalized": "计入本金",
    "interestNotCapitalized": "需单独支付",
    "interestOnlyDuringDraw": "提款期内仅付利息",
    "interestDuringPayout": "+ 支付期利息",
    "gracePeriodInterest": "宽限期利息",
    "gracePeriodInterestDetail": "+ 宽限期利息",
    "growthDuringDeferral": "+ 延期期间增长",
    "growthLabel": "增长",
    "investmentDetails": "投资详情",
    "investmentGrowth": "投资增长",
    "investmentPeriodLabel": "投资期限",
    "iraType": "IRA 类型",
    "employerMatch": "雇主匹配 (%)",
    "employerMatchLabel": "雇主匹配",
    "matchLimit": "匹配上限 (%)",
    "limitLabel": "上限",
    "currencies": {
        "USD": "美元",
        "EUR": "欧元",
        "GBP": "英镑",
        "CHF": "瑞士法郎",
        "JPY": "日元",
        "CAD": "加元",
        "AUD": "澳元",
        "CNY": "人民币",
        "INR": "印度卢比",
        "MXN": "墨西哥比索",
        "BRL": "巴西雷亚尔",
        "KRW": "韩元",
        "SGD": "新加坡元",
        "HKD": "港币",
        "SEK": "瑞典克朗",
        "NOK": "挪威克朗",
        "DKK": "丹麦克朗",
        "NZD": "新西兰元",
        "ZAR": "南非兰特",
        "RUB": "俄罗斯卢布",
    },
    "noTaxDeduction": "现在无税前扣除，但退休后所有提款免税",
}


def is_corrupted(value: str) -> bool:
    """Detect strings that contain both CJK and Latin fragments (broken translation)."""
    if not isinstance(value, str):
        return False
    has_latin = bool(re.search(r"[a-zA-Z]{3,}", value))
    has_cjk = bool(re.search(r"[\u4e00-\u9fff]", value))
    return has_latin and has_cjk


def main() -> None:
    en = json.loads(EN_PATH.read_text(encoding="utf-8"))
    zh = json.loads(ZH_PATH.read_text(encoding="utf-8"))

    en_finance = en.setdefault("calculator", {}).setdefault("finance", {})
    zh_finance = zh.setdefault("calculator", {}).setdefault("finance", {})

    fixed = 0
    for key, en_value in en_finance.items():
        zh_value = zh_finance.get(key)
        if key in ZH_TRANSLATIONS:
            zh_finance[key] = ZH_TRANSLATIONS[key]
            fixed += 1
        elif zh_value is None or is_corrupted(zh_value):
            # Fall back to clean English source to remove garbled mixed strings.
            zh_finance[key] = en_value
            fixed += 1

    ZH_PATH.write_text(json.dumps(zh, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Fixed {fixed} finance keys in {ZH_PATH}")


if __name__ == "__main__":
    main()
