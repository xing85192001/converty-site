import { z } from "zod";

// ─── Annuity Calculator ───────────────────────────────────────────────────────
// Note: AnnuityCalculator uses useState directly (not createCalculatorStore)
// Schema included for completeness but not wired to a store
export const AnnuityFormSchema = z.object({
  principal: z.number().positive("Principal must be positive"),
  annualInterestRate: z.number().min(0).max(100, "Rate must be between 0 and 100%"),
  payoutYears: z.number().int().min(5).max(40, "Payout years must be 5–40"),
  paymentFrequency: z.number().int().min(1).max(12),
  annuityType: z.enum(["immediate", "deferred"]),
  deferralYears: z.number().int().min(0).max(30),
});

// ─── Auto Loan Calculator ─────────────────────────────────────────────────────
// Note: AutoLoanCalculator uses useState directly (not createCalculatorStore)
// Schema included for completeness but not wired to a store
export const AutoLoanFormSchema = z.object({
  vehiclePrice: z.number().positive("Vehicle price must be positive"),
  downPayment: z.number().min(0),
  tradeInValue: z.number().min(0),
  annualInterestRate: z.number().min(0).max(100, "Rate must be between 0 and 100%"),
  loanTermMonths: z.number().int().min(12).max(84, "Loan term must be 12–84 months"),
  salesTaxRate: z.number().min(0).max(20, "Tax rate must be 0–20%"),
});

// ─── Bond Calculator ──────────────────────────────────────────────────────────
// Note: BondCalculator uses useState directly (not createCalculatorStore)
// Schema included for completeness but not wired to a store
export const BondFormSchema = z.object({
  faceValue: z.number().positive("Face value must be positive"),
  couponRate: z.number().min(0).max(20, "Coupon rate must be 0–20%"),
  yearsToMaturity: z.number().int().min(1).max(30, "Years to maturity must be 1–30"),
  paymentFrequency: z.number().int().min(1).max(4),
  marketRate: z.number().min(0).max(20, "Market rate must be 0–20%"),
});

// ─── Break-Even Calculator ────────────────────────────────────────────────────
// Note: BreakEvenCalculator uses useState directly (not createCalculatorStore)
// Schema included for completeness but not wired to a store
export const BreakEvenFormSchema = z.object({
  fixedCosts: z.number().min(0),
  variableCostPerUnit: z.number().min(0),
  pricePerUnit: z.number().positive("Price per unit must be positive"),
});

// ─── Compound Interest Calculator ─────────────────────────────────────────────
// Uses createCalculatorStore with CompoundInterestInput (number fields)
export const CompoundInterestFormSchema = z.object({
  principal: z.number().min(0),
  interestRate: z.number().min(0).max(100, "Rate must be between 0 and 100%"),
  years: z.number().int().min(1).max(100, "Investment period must be 1–100 years"),
  compoundFrequency: z.enum(["annually", "semi-annually", "quarterly", "monthly", "daily"]),
  monthlyContribution: z.number().min(0),
  contributionTiming: z.enum(["beginning", "end"]),
});

// ─── Credit Card Calculator ───────────────────────────────────────────────────
// Note: CreditCardCalculator uses useState directly (not createCalculatorStore)
// Schema included for completeness but not wired to a store
export const CreditCardFormSchema = z.object({
  balance: z.number().positive("Balance must be positive"),
  annualInterestRate: z.number().min(0).max(100, "Rate must be between 0 and 100%"),
  minimumPaymentPercent: z.number().min(1).max(10),
  minimumPaymentFixed: z.number().min(10),
  additionalPayment: z.number().min(0),
  targetMonths: z.number().int().min(1).max(120, "Target months must be 1–120"),
});

// ─── Currency Converter ───────────────────────────────────────────────────────
// Note: CurrencyConverter uses useState directly (not createCalculatorStore)
// Schema included for completeness but not wired to a store
export const CurrencyFormSchema = z.object({
  amount: z.number().min(0),
  fromCurrency: z.string().min(1, "From currency is required"),
  toCurrency: z.string().min(1, "To currency is required"),
});

// ─── Debt Payoff Calculator ───────────────────────────────────────────────────
// Note: DebtPayoffCalculator uses useState directly (not createCalculatorStore)
// Schema included for completeness but not wired to a store
export const DebtPayoffFormSchema = z.object({
  totalDebt: z.number().positive("Total debt must be positive"),
  interestRate: z.number().min(0).max(100, "Rate must be between 0 and 100%"),
  minimumPayment: z.number().min(10),
  extraPayment: z.number().min(0),
});

// ─── Discount Calculator ──────────────────────────────────────────────────────
// Note: DiscountCalculator uses useState directly (not createCalculatorStore)
// Schema included for completeness but not wired to a store
export const DiscountFormSchema = z.object({
  originalPrice: z.number().positive("Original price must be positive"),
  discountPercent: z.number().min(0).max(100, "Discount must be between 0 and 100%"),
});

// ─── Down Payment Calculator ──────────────────────────────────────────────────
// Note: DownPaymentCalculator uses useState directly (not createCalculatorStore)
// Schema included for completeness but not wired to a store
export const DownPaymentFormSchema = z.object({
  homePrice: z.number().positive("Home price must be positive"),
  downPaymentPercent: z.number().min(1).max(100, "Down payment must be 1–100%"),
  savingsGoalMonths: z.number().int().min(6).max(120, "Savings period must be 6–120 months"),
  currentSavings: z.number().min(0),
  annualReturnRate: z.number().min(0).max(15, "Return rate must be 0–15%"),
});

// ─── Home Equity Calculator ───────────────────────────────────────────────────
// Note: HomeEquityCalculator uses useState directly (not createCalculatorStore)
// Schema included for completeness but not wired to a store
export const HomeEquityFormSchema = z.object({
  homeValue: z.number().positive("Home value must be positive"),
  mortgageBalance: z.number().min(0),
  loanAmount: z.number().positive("Loan amount must be positive"),
  annualInterestRate: z.number().min(0).max(100, "Rate must be between 0 and 100%"),
  loanTermYears: z.number().int().min(5).max(30, "Loan term must be 5–30 years"),
  isHELOC: z.boolean(),
});

// ─── Inflation Calculator ─────────────────────────────────────────────────────
// Note: InflationCalculator uses useState directly (not createCalculatorStore)
// Schema included for completeness but not wired to a store
export const InflationFormSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  inflationRate: z.number().min(0).max(50, "Inflation rate must be 0–50%"),
  years: z.number().int().min(1).max(100, "Years must be 1–100"),
});

// ─── IRA Calculator ───────────────────────────────────────────────────────────
// Note: IraCalculator uses useState directly (not createCalculatorStore)
// Schema included for completeness but not wired to a store
export const IraFormSchema = z.object({
  currentAge: z.number().int().min(18).max(70),
  retirementAge: z.number().int().min(50).max(75),
  currentBalance: z.number().min(0),
  annualContribution: z.number().min(0).max(8000),
  annualReturnRate: z.number().min(0).max(15, "Return rate must be 0–15%"),
  iraType: z.enum(["traditional", "roth"]),
  taxBracket: z.number().min(0).max(50, "Tax bracket must be 0–50%"),
  retirementTaxBracket: z.number().min(0).max(50, "Tax bracket must be 0–50%"),
});

// ─── Loan Calculator ──────────────────────────────────────────────────────────
// Uses createCalculatorStore with LoanInput (number fields + startDate string)
export const LoanFormSchema = z.object({
  loanAmount: z.number().positive("Loan amount must be positive"),
  interestRate: z.number().min(0).max(100, "Rate must be between 0 and 100%"),
  loanTerm: z.number().int().min(1).max(600, "Loan term must be 1–600 months"),
  startDate: z.string().min(1, "Start date is required"),
});

// ─── Mortgage Calculator ──────────────────────────────────────────────────────
// Uses createCalculatorStore with MortgageInput (number fields + startDate string)
export const MortgageFormSchema = z.object({
  homePrice: z.number().positive("Home price must be positive"),
  downPayment: z.number().min(0),
  downPaymentPercent: z.number().min(0).max(100, "Down payment must be 0–100%"),
  loanTerm: z.number().int().min(1).max(50, "Loan term must be 1–50 years"),
  interestRate: z.number().min(0).max(100, "Rate must be between 0 and 100%"),
  propertyTax: z.number().min(0),
  homeInsurance: z.number().min(0),
  pmi: z.number().min(0),
  hoaFees: z.number().min(0),
  startDate: z.string().min(1, "Start date is required"),
});

// ─── Personal Loan Calculator ─────────────────────────────────────────────────
// Note: PersonalLoanCalculator uses useState directly (not createCalculatorStore)
// Schema included for completeness but not wired to a store
export const PersonalLoanFormSchema = z.object({
  loanAmount: z.number().positive("Loan amount must be positive"),
  annualInterestRate: z.number().min(0).max(100, "Rate must be between 0 and 100%"),
  loanTermMonths: z.number().int().min(6).max(84, "Loan term must be 6–84 months"),
  originationFee: z.number().min(0).max(10, "Origination fee must be 0–10%"),
});

// ─── Profit Margin Calculator ─────────────────────────────────────────────────
// Note: ProfitMarginCalculator uses useState directly (not createCalculatorStore)
// Schema included for completeness but not wired to a store
export const ProfitMarginFormSchema = z.object({
  revenue: z.number().positive("Revenue must be positive"),
  costOfGoodsSold: z.number().min(0),
  operatingExpenses: z.number().min(0),
  taxes: z.number().min(0),
});

// ─── Retirement 401k Calculator ───────────────────────────────────────────────
// Note: Retirement401kCalculator uses useState directly (not createCalculatorStore)
// Schema included for completeness but not wired to a store
export const Retirement401kFormSchema = z.object({
  currentAge: z.number().int().min(18).max(70),
  retirementAge: z.number().int().min(50).max(75),
  currentBalance: z.number().min(0),
  annualContribution: z.number().min(0),
  employerMatch: z.number().min(0).max(100, "Employer match must be 0–100%"),
  employerMatchLimit: z.number().min(0).max(100, "Match limit must be 0–100%"),
  annualReturnRate: z.number().min(0).max(15, "Return rate must be 0–15%"),
  annualSalaryGrowth: z.number().min(0).max(10, "Salary growth must be 0–10%"),
});

// ─── Retirement Calculator ────────────────────────────────────────────────────
// Uses createCalculatorStore with RetirementInput (number fields)
export const RetirementFormSchema = z.object({
  currentAge: z.number().int().min(18).max(80),
  retirementAge: z.number().int().min(50).max(100),
  currentSavings: z.number().min(0),
  monthlyContribution: z.number().min(0),
  expectedReturn: z.number().min(0).max(20, "Return rate must be 0–20%"),
  inflationRate: z.number().min(0).max(10, "Inflation rate must be 0–10%"),
  desiredAnnualIncome: z.number().positive("Annual income must be positive"),
  socialSecurityBenefit: z.number().min(0),
  lifeExpectancy: z.number().int().min(70).max(120),
});

// ─── ROI Calculator ───────────────────────────────────────────────────────────
// Note: RoiCalculator uses useState directly (not createCalculatorStore)
// Schema included for completeness but not wired to a store
export const RoiFormSchema = z.object({
  initialInvestment: z.number().positive("Initial investment must be positive"),
  finalValue: z.number().min(0),
  years: z.number().int().min(0).max(50, "Years must be 0–50"),
});

// ─── Savings Goal Calculator ──────────────────────────────────────────────────
// Note: SavingsGoalCalculator uses useState directly (not createCalculatorStore)
// Schema included for completeness but not wired to a store
export const SavingsGoalFormSchema = z.object({
  goalAmount: z.number().positive("Goal amount must be positive"),
  currentSavings: z.number().min(0),
  monthlyContribution: z.number().min(0),
  annualInterestRate: z.number().min(0).max(100, "Rate must be between 0 and 100%"),
});

// ─── Student Loan Calculator ──────────────────────────────────────────────────
// Note: StudentLoanCalculator uses useState directly (not createCalculatorStore)
// Schema included for completeness but not wired to a store
export const StudentLoanFormSchema = z.object({
  loanAmount: z.number().positive("Loan amount must be positive"),
  annualInterestRate: z.number().min(0).max(100, "Rate must be between 0 and 100%"),
  loanTermYears: z.number().int().min(1).max(30, "Loan term must be 1–30 years"),
  gracePeriodMonths: z.number().int().min(0).max(24, "Grace period must be 0–24 months"),
  interestCapitalized: z.boolean(),
});

// ─── Tip Calculator ───────────────────────────────────────────────────────────
// Note: TipCalculator uses useState directly (not createCalculatorStore)
// Schema included for completeness but not wired to a store
export const TipFormSchema = z.object({
  billAmount: z.number().positive("Bill amount must be positive"),
  tipPercentage: z.number().min(0).max(100, "Tip percentage must be 0–100%"),
  numberOfPeople: z.number().int().min(1, "At least 1 person required"),
});
