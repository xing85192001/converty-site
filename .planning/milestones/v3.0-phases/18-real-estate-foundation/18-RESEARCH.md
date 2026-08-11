# Phase 18: Real Estate Foundation — RESEARCH

**Analysis Date:** 2026-01-24
**Status:** RESEARCH COMPLETE

---

## Executive Summary

This document provides comprehensive research findings for implementing Phase 18 (Real Estate Foundation) of the Converty calculator project. The research covers 4 calculators: Mortgage Calculator (enhancement), Property Valuation Calculator, Rent-to-Value Ratio Calculator, and Loan Amortization Calculator, with focus on Swiss/European real estate markets (CHF/EUR currencies).

**Key Finding:** All four calculators are technically feasible to implement client-side in a static export setup. The mortgage calculator already exists and can be enhanced. No server-side features required. Swiss/European market focus with CHF/EUR currencies and metric system.

**Note:** The existing mortgage calculator (`src/lib/converters/finance/mortgage.ts`) already implements comprehensive functionality including amortization schedules. Phase 18 may focus on enhancements (Swiss market defaults, currency selection) or new complementary calculators (property valuation, rental yield).

---

## Section 1: Key Financial Formulas

### 1.1 Mortgage Payment Formula (PMT)

**Standard PMT formula** used in Excel and financial calculators:

```
Monthly Payment = P × [r(1 + r)^n] / [(1 + r)^n - 1]

Where:
  P = Principal (loan amount)
  r = Monthly interest rate (annual rate / 12)
  n = Total number of payments (years × 12)
```

**Edge case:** When interest rate = 0:

```
Monthly Payment = P / n
```

**Source:** This is the industry-standard formula used by Excel's PMT function and all major lending institutions.

### 1.2 Amortization Schedule Components

For each payment period:

```
Interest Payment = Current Balance × Monthly Rate
Principal Payment = Monthly Payment - Interest Payment
New Balance = Current Balance - Principal Payment
Total Interest (cumulative) = Sum of all interest payments to date
Total Principal (cumulative) = Sum of all principal payments to date
```

### 1.3 Property Valuation Methods

#### A. Comparative Market Analysis (Hedonic Method)

```
Estimated Value = Base Price × Adjustment Factors

Adjustment Factors:
  - Location multiplier (city center vs. suburbs)
  - Size per m² (property area)
  - Age adjustment (construction year)
  - Condition rating (1-5 scale)
  - Features (balcony, parking, renovation, etc.)
```

**Swiss Context:** The hedonic method is the most common in Switzerland, used by banks and online calculators for over 20 years. However, values can vary by up to 30% between providers due to different data sources.

#### B. Income Approach (Capitalization Rate)

```
Property Value = Net Operating Income (NOI) / Cap Rate

Where:
  NOI = Gross Rental Income - Operating Expenses
  Cap Rate = Market capitalization rate (typically 2-6% in Switzerland)
```

#### C. Replacement Cost Method

```
Property Value = Land Value + (Construction Cost per m² × Building Size) - Depreciation
```

**Swiss Context:** Primarily used for insurance purposes, less common for market valuation.

### 1.4 Rental Yield Calculations

#### Gross Rental Yield

```
Gross Yield (%) = (Annual Rent / Property Price) × 100
```

#### Net Rental Yield

```
Net Yield (%) = [(Annual Rent - Annual Expenses) / Total Investment] × 100

Where:
  Annual Expenses = Property tax + Insurance + Maintenance + Management fees
  Total Investment = Purchase Price + Transaction Costs (3-6% in Switzerland)
```

**Swiss Context:** Average gross rental yield is 2.92% (Q3 2025), among the lowest in Europe. Zurich and Geneva yield below 2.6%. Net yields typically 1.5-2% lower than gross.

### 1.5 Investment Metrics

#### Capitalization Rate (Cap Rate)

```
Cap Rate (%) = (NOI / Property Value) × 100
```

#### Gross Rent Multiplier (GRM)

```
GRM = Property Price / Annual Gross Rent

Example: CHF 1,000,000 / CHF 30,000 = 33.3 GRM
Lower GRM = better investment (faster payback)
```

#### Cash-on-Cash Return

```
Cash-on-Cash Return (%) = (Annual Cash Flow / Total Cash Invested) × 100
```

---

## Section 2: Calculator Breakdown

### 2.1 Mortgage Calculator (Enhancement)

**Status:** Already exists at `src/lib/converters/finance/mortgage.ts`

**Current Features:**

- Monthly payment calculation (principal + interest)
- Amortization schedule generation
- Property tax, insurance, PMI, HOA fees
- Yearly breakdown for charts
- Payoff date calculation
- Total interest and total cost calculations

**Proposed Enhancements for Swiss/European Market:**

1. **Currency Selection (CHF/EUR)**
   - Add currency selector to input
   - Default to CHF for Swiss users
   - Format outputs with correct currency symbols

2. **Swiss Market Defaults**
   - Interest rate: 1.5% - 2.0% (current Swiss rates for 10-year fixed)
   - Loan term: 15, 20, 25 years (common in Switzerland)
   - Down payment: 20% minimum (Swiss requirement)
   - Property tax: Canton-specific (varies 0.1% - 0.3%)

3. **European Context Labels**
   - Translate "PMI" to Swiss equivalent (not common in Switzerland)
   - Adapt for Swiss mortgage types (Fixed, SARON, Variable)

**Implementation Notes:**

- Existing calculator already implements PMT formula correctly
- Amortization schedule logic is sound
- Enhancement = add currency selection + Swiss presets
- No need to rewrite core calculation logic

**Complexity:** 3/10 (enhancement only, not new calculator)

### 2.2 Property Valuation Calculator (NEW)

**Purpose:** Estimate property value using multiple methods

**Recommended Approach:** Simplified Hedonic Method (Comparative Market Analysis)

**Input Fields:**

- Property type (apartment, house, commercial)
- Location (city/region selector or free text)
- Property size (m²)
- Number of rooms
- Construction year
- Condition (1-5 scale: poor, fair, good, very good, excellent)
- Features (balcony, parking, garden, renovated, elevator)
- Currency (CHF/EUR)

**Output Fields:**

- Estimated value range (min, max, average)
- Price per m²
- Comparison to market average
- Confidence level (low/medium/high based on inputs)
- Disclaimer about accuracy

**Calculation Strategy:**

```typescript
// Base price per m² by location (pre-defined Swiss averages)
const basePricePerM2 = getBasePriceByLocation(location);

// Adjustment factors
const ageAdjustment = calculateAgeAdjustment(constructionYear);
const conditionMultiplier = getConditionMultiplier(condition);
const featureBonus = calculateFeatureBonus(features);

// Final calculation
const estimatedValue = propertySize * basePricePerM2 * ageAdjustment * conditionMultiplier + featureBonus;
const valueRange = {
  min: estimatedValue * 0.85,
  max: estimatedValue * 1.15,
  average: estimatedValue
};
```

**Data Requirements:**

- Pre-defined base prices per m² for major Swiss cities/regions
- Static data file: `src/lib/data/swiss-property-prices.json`
- Example structure:

  ```json
  {
    "timestamp": "2026-01-24",
    "source": "Swiss Property Market Average",
    "regions": {
      "zurich": { "apartment": 12000, "house": 10000 },
      "geneva": { "apartment": 11500, "house": 9500 },
      "bern": { "apartment": 8500, "house": 7500 },
      "basel": { "apartment": 9000, "house": 7800 },
      "lausanne": { "apartment": 10000, "house": 8500 }
    }
  }
  ```

**Edge Cases:**

- Very old properties (pre-1900): Special historical value consideration
- Very new properties (< 5 years): Premium pricing
- Luxury features: Cap bonus to prevent unrealistic valuations
- Unknown location: Use national average

**Disclaimers Required:**

- "This is an estimate only, not a professional appraisal"
- "Actual value can vary by ±30% depending on specific location and market conditions"
- "For legal or financial purposes, consult a certified appraiser"

**Complexity:** 6/10 (requires regional data, multiple adjustment factors)

### 2.3 Rent-to-Value Ratio Calculator (NEW)

**Purpose:** Calculate rental yield and investment metrics for property investors

**Input Fields:**

- Property purchase price (CHF/EUR)
- Annual rental income (or monthly rent × 12)
- Annual operating expenses (property tax, insurance, maintenance, management)
- Transaction costs (% or fixed amount, default 4% for Switzerland)
- Currency (CHF/EUR)

**Output Fields:**

- Gross rental yield (%)
- Net rental yield (%)
- Gross rent multiplier (GRM)
- Monthly cash flow
- Annual cash flow
- Cap rate (if NOI provided)
- Break-even analysis
- Comparison to Swiss average (2.92% gross yield)
- Investment quality rating (poor/fair/good/excellent based on yield)

**Calculation Logic:**

```typescript
// Gross yield
const grossYield = (annualRent / purchasePrice) * 100;

// Net yield
const totalInvestment = purchasePrice + transactionCosts;
const netIncome = annualRent - annualExpenses;
const netYield = (netIncome / totalInvestment) * 100;

// GRM
const grm = purchasePrice / annualRent;

// Cash flow (if mortgage included)
const monthlyCashFlow = (annualRent / 12) - monthlyMortgage - (annualExpenses / 12);

// Rating
const rating = getRating(netYield);
// Swiss context: < 1.5% = poor, 1.5-2.5% = fair, 2.5-3.5% = good, > 3.5% = excellent
```

**Swiss Market Context:**

- Average gross yield: 2.92% (Q3 2025)
- Zurich/Geneva: < 2.6%
- Smaller cities: 3-4%
- Rents regulated by reference interest rate (currently low)
- Transaction costs: 3-6% (notary, registry, taxes vary by canton)

**Features:**

- Compare against Swiss market averages
- Warning if yield below 2% (likely negative cash flow)
- Show years to break-even
- Option to include mortgage payment for cash flow analysis

**Integration Opportunity:**

- Link to mortgage calculator for financing analysis
- "Calculate mortgage payment" button that opens mortgage calculator with pre-filled values

**Complexity:** 5/10 (straightforward formulas, needs market context data)

### 2.4 Loan Amortization Calculator (ENHANCEMENT vs NEW)

**Status:** Existing loan calculator at `src/lib/converters/finance/loan.ts`

**Current Features:**

- Monthly payment calculation
- Payment schedule generation
- Yearly totals
- Effective annual rate
- Payoff date

**Consideration:** The existing loan calculator is very similar to the mortgage calculator's amortization functionality.

**Option A: Enhance existing loan calculator** (RECOMMENDED)

- Add currency selection (CHF/EUR)
- Add extra payment scenarios (bi-weekly, extra principal payments)
- Add refinancing scenario comparison
- Add balloon payment option
- Improve visualization (charts, graphs)

**Option B: Create separate real-estate-specific amortization calculator**

- Focus on Swiss mortgage specifics (SARON vs. Fixed)
- Include property value appreciation
- Include tax deductions (Swiss mortgage interest deductibility)
- Amortization requirements (Swiss indirect amortization via pillar 3a)

**Recommended Approach:** Option A (enhance existing)

- Avoid duplication
- Existing calculator has solid foundation
- Add Swiss-specific features as enhancements

**New Features to Add:**

1. **Bi-Weekly Payment Option**

   ```typescript
   // 26 bi-weekly payments per year = 13 monthly payments
   const biweeklyPayment = monthlyPayment / 2;
   const effectiveExtraPayment = monthlyPayment; // per year
   ```

2. **Extra Payment Scenarios**
   - One-time extra payment
   - Recurring extra monthly payment
   - Show time saved and interest saved

3. **Refinancing Comparison**
   - Current loan details
   - New loan terms
   - Show break-even point
   - Total savings calculation

4. **Swiss Amortization Requirements**
   - 2nd pillar requirement: Amortize to 2/3 of property value within 15 years
   - Indirect amortization via pillar 3a (retirement savings)

**Complexity:** 4/10 (enhancements to existing calculator)

---

## Section 3: Implementation Strategy

### 3.1 Priority & Sequencing

**Recommended Implementation Order:**

1. **Mortgage Calculator Enhancement** (Phase 18.1)
   - Quickest win (existing code)
   - Swiss market focus (CHF/EUR, defaults)
   - 2-3 hours

2. **Rent-to-Value Ratio Calculator** (Phase 18.2)
   - High value for property investors
   - Straightforward formulas
   - 4-5 hours

3. **Property Valuation Calculator** (Phase 18.3)
   - Requires regional data creation
   - More complex adjustment logic
   - 6-8 hours

4. **Loan Amortization Enhancement** (Phase 18.4)
   - Optional (if time permits)
   - Enhances existing calculator
   - 3-4 hours

**Total Estimated Time:** 15-20 hours (all 4 calculators)

### 3.2 Architecture Patterns

**Reuse from Phase 17 (Crypto):**

- ✅ Build-time data fetching for static regional pricing
- ✅ JSON data files in `src/lib/data/`
- ✅ createCalculatorStore pattern
- ✅ URL state persistence
- ✅ Translation namespacing
- ✅ Currency formatting utilities

**Reuse from Existing Finance Calculators:**

- ✅ PMT formula implementation (mortgage.ts)
- ✅ Amortization schedule generation (loan.ts, mortgage.ts)
- ✅ Yearly breakdown for charts
- ✅ Date calculations for payoff dates
- ✅ Rounding utilities (2 decimal places for currency)

**New Patterns Needed:**

- Currency selection component (CHF/EUR switcher)
- Regional data selector (Swiss cities/cantons)
- Adjustment factor sliders (property condition, features)
- Comparison indicators (above/below market average)

### 3.3 Data Files Required

**1. Swiss Property Prices** (`src/lib/data/swiss-property-prices.json`)

```json
{
  "timestamp": "2026-01-24",
  "source": "Swiss Property Market Average 2025-2026",
  "regions": {
    "zurich": {
      "apartment": 12000,
      "house": 10000,
      "commercial": 8500
    },
    "geneva": { "apartment": 11500, "house": 9500, "commercial": 8000 },
    "bern": { "apartment": 8500, "house": 7500, "commercial": 6000 },
    "basel": { "apartment": 9000, "house": 7800, "commercial": 6500 },
    "lausanne": { "apartment": 10000, "house": 8500, "commercial": 7000 },
    "lucerne": { "apartment": 8000, "house": 7000, "commercial": 5500 },
    "national_average": { "apartment": 9000, "house": 7800, "commercial": 6500 }
  },
  "notes": "Prices in CHF per m². Sources: Swiss Real Estate market data 2025-2026."
}
```

**2. Market Benchmarks** (`src/lib/data/real-estate-benchmarks.json`)

```json
{
  "timestamp": "2026-01-24",
  "switzerland": {
    "average_gross_yield": 2.92,
    "zurich_yield": 2.5,
    "geneva_yield": 2.4,
    "average_cap_rate": 4.5,
    "transaction_costs_percent": 4.0,
    "mortgage_rates": {
      "fixed_5y": 1.44,
      "fixed_10y": 1.75,
      "saron": 0.92
    }
  },
  "europe": {
    "average_gross_yield": 4.5,
    "average_cap_rate": 6.0
  }
}
```

**Data Fetching Strategy:**

- Option A: Static data (manually updated quarterly)
- Option B: Build-time fetch from public APIs (if available)
- **Recommendation:** Option A (static) for MVP, less volatile than crypto prices

### 3.4 Component Architecture

**Shared Components to Build:**

1. **CurrencySelector.tsx**

   ```typescript
   interface Props {
     value: "CHF" | "EUR";
     onChange: (currency: "CHF" | "EUR") => void;
   }
   ```

2. **RegionalSelector.tsx**

   ```typescript
   interface Props {
     regions: string[];
     value: string;
     onChange: (region: string) => void;
   }
   ```

3. **PropertyFeatures.tsx** (Checkbox group)

   ```typescript
   interface Props {
     features: string[];
     selected: string[];
     onChange: (features: string[]) => void;
   }
   ```

4. **InvestmentMetrics.tsx** (Result display)

   ```typescript
   interface Props {
     grossYield: number;
     netYield: number;
     grm: number;
     marketAverage: number;
   }
   ```

**Charts/Visualizations:**

- Reuse existing chart patterns from mortgage/loan calculators
- Amortization schedule: Line chart (principal vs. interest over time)
- Rental yield comparison: Bar chart (your property vs. market average)
- Property valuation: Range indicator (min - estimate - max)

---

## Section 4: Edge Cases & Gotchas

### 4.1 Currency Handling

**Challenge:** CHF/EUR conversion for cross-border scenarios

**Solutions:**

- Store values in calculator's selected currency (no automatic conversion)
- If user wants conversion, link to currency calculator
- **Avoid:** Real-time exchange rates (breaks static export)
- **Recommendation:** Single currency per calculation, no mixing

**Display Formatting:**

- CHF: `CHF 1'234'567.89` (Swiss formatting with apostrophes)
- EUR: `€1,234,567.89` (European formatting with commas)
- Use `Intl.NumberFormat` for locale-aware formatting

### 4.2 Rounding & Precision

**Issue:** Financial calculations require consistent rounding

**Standards:**

- Currency amounts: 2 decimal places
- Percentages: 2 decimal places (e.g., 2.92%)
- Interest rates: 4 decimal places for intermediate calculations, 2 for display
- Property values: Round to nearest 1,000 for estimates

**Implementation:**

```typescript
// Internal precision
const preciseValue = calculateValue();

// Display rounding
const displayValue = Math.round(preciseValue * 100) / 100;

// Large currency rounding (property values)
const roundedPropertyValue = Math.round(estimatedValue / 1000) * 1000;
```

### 4.3 Swiss-Specific Regulations

**Mortgage Requirements:**

- Minimum 20% down payment (regulatory requirement)
- Maximum loan-to-value: 80%
- Amortization to 66.67% LTV within 15 years (2nd pillar)
- Affordability check: Housing costs < 33% of gross income

**Rental Regulations:**

- Rents regulated by mortgage reference interest rate
- Maximum rent increase: Reference rate + 0.5%
- Rent control in many cantons

**Implementation:**

- Add validation warnings if down payment < 20%
- Show amortization requirement for 2nd pillar
- Add affordability calculator (optional)
- Include disclaimer about rent regulation

### 4.4 Property Valuation Accuracy

**Challenge:** Simple calculators can't match professional appraisals

**Mitigation:**

- Always show value range (±15-20%), not single number
- Clear disclaimer: "Estimate only, consult professional appraiser"
- Confidence indicator based on input completeness
- Link to professional appraisal services (if appropriate)

**Factors to Consider:**

- Micro-location (street, view, noise)
- Market timing (buyer's vs. seller's market)
- Unique features (historical value, architectural significance)
- Legal issues (building rights, easements)

**Recommendation:** Keep calculator simple, emphasize limitations

### 4.5 Rental Yield Edge Cases

**Scenario 1: Negative yield**

- High purchase price, low rent
- Result: Negative cash flow
- Display: Warning message, "Investment likely unprofitable without appreciation"

**Scenario 2: Unrealistic inputs**

- Annual rent > 20% of purchase price (too good to be true)
- Validation: Show warning "Please verify inputs, yield seems unusually high"

**Scenario 3: Vacant property**

- No rental income yet
- Solution: Allow 0 rent, calculate potential yield scenarios

### 4.6 Date Calculations

**Issue:** Loan start dates, payoff dates

**Edge Cases:**

- Leap years
- Payment dates falling on weekends/holidays
- End-of-month payments (e.g., Jan 31 → Feb 28)

**Solution:** Use existing date logic from mortgage/loan calculators

```typescript
const payoffDate = new Date(startDate);
payoffDate.setMonth(payoffDate.getMonth() + numberOfPayments);
```

---

## Section 5: Testing & Verification Strategy

### 5.1 Mortgage Calculator Verification

**Test Cases:**

1. **Known PMT values** (Excel verification)
   - Input: CHF 500,000, 2.0% APR, 25 years
   - Expected monthly payment: CHF 2,119.92
   - Verify against Excel `=PMT(2%/12, 25*12, -500000)`

2. **Zero interest edge case**
   - Input: CHF 100,000, 0% APR, 10 years
   - Expected: CHF 833.33 monthly (100,000 / 120)

3. **Amortization balance verification**
   - Final balance should be 0 (or < 1 CHF due to rounding)
   - Sum of principal payments = loan amount
   - Total payment = principal + total interest

4. **Swiss market defaults**
   - 20% down payment validation
   - Typical rates (1.5-2.0%)
   - CHF formatting with apostrophes

### 5.2 Property Valuation Verification

**Test Cases:**

1. **Known property comparison**
   - Input: Zurich, 100m² apartment, 2020 construction, excellent condition
   - Expected: CHF 1,200,000 ± 15%
   - Verify against regional average (CHF 12,000/m²)

2. **Adjustment factor accuracy**
   - Old property (1950): Should reduce value by 10-20%
   - Poor condition: Should reduce value by 15-25%
   - Premium features: Should add CHF 20,000-50,000

3. **Range calculation**
   - Min/max should be ±15% of average
   - All three values (min/avg/max) should be positive

### 5.3 Rental Yield Verification

**Test Cases:**

1. **Swiss market average**
   - Input: CHF 1,000,000 purchase, CHF 29,200 annual rent
   - Expected gross yield: 2.92% (matches market average)

2. **Net yield calculation**
   - Input: CHF 1,000,000 purchase, CHF 30,000 rent, CHF 10,000 expenses, 4% transaction costs
   - Purchase + costs = CHF 1,040,000
   - Net income = CHF 20,000
   - Expected net yield: 1.92%

3. **GRM calculation**
   - Input: CHF 1,000,000 / CHF 30,000
   - Expected GRM: 33.33

4. **Comparison logic**
   - Yield > 2.92% → "Above market average"
   - Yield < 2.92% → "Below market average"

### 5.4 Cross-Calculator Validation

**Scenario:** User calculates mortgage for property investment

1. Property valuation: CHF 800,000
2. Mortgage calculator: 20% down (CHF 160,000), loan CHF 640,000
   - At 2.0%, 25 years → Monthly payment CHF 2,713
3. Rental yield: Annual rent CHF 30,000, expenses CHF 8,000
   - Monthly net income: CHF 1,833
   - Monthly mortgage: CHF 2,713
   - **Cash flow: -CHF 880 (negative)**
4. Verify: Numbers should be consistent across calculators

### 5.5 Acceptance Criteria

- [ ] Mortgage calculator enhancement supports CHF/EUR
- [ ] Swiss market defaults (rates, down payment) applied correctly
- [ ] Property valuation produces reasonable ranges (±15%)
- [ ] Rental yield calculations match manual calculations
- [ ] All percentages formatted to 2 decimal places
- [ ] Currency formatting follows Swiss/European conventions
- [ ] Amortization schedules balance to zero
- [ ] All 4 calculators support URL state persistence
- [ ] Translations complete for en/fr/de/it
- [ ] Disclaimers present on estimation calculators
- [ ] Charts/visualizations render correctly

---

## Section 6: I18n & Translation Keys

### 6.1 Translation Structure

Following project conventions from Phase 17:

**Converters Metadata:**

```json
{
  "converters": {
    "mortgage": {
      "name": "Mortgage Calculator",
      "description": "Calculate mortgage payments and amortization",
      "metaDescription": "Free Swiss mortgage calculator with CHF/EUR support"
    },
    "property-valuation": {
      "name": "Property Valuation Calculator",
      "description": "Estimate property value in Switzerland",
      "metaDescription": "Estimate Swiss real estate property values"
    },
    "rental-yield": {
      "name": "Rental Yield Calculator",
      "description": "Calculate rental yield and investment returns",
      "metaDescription": "Calculate Swiss rental yield and property ROI"
    },
    "loan-amortization": {
      "name": "Loan Amortization Calculator",
      "description": "Generate detailed amortization schedules",
      "metaDescription": "Loan amortization calculator with extra payments"
    }
  }
}
```

**Calculator Labels:**

```json
{
  "calculator": {
    "realestate": {
      "propertyPrice": "Property Price",
      "propertyValue": "Property Value",
      "purchasePrice": "Purchase Price",
      "downPayment": "Down Payment",
      "downPaymentPercent": "Down Payment %",
      "loanAmount": "Loan Amount",
      "interestRate": "Interest Rate",
      "loanTerm": "Loan Term",
      "monthlyPayment": "Monthly Payment",
      "totalInterest": "Total Interest",
      "totalCost": "Total Cost",
      "payoffDate": "Payoff Date",

      "propertyType": "Property Type",
      "propertySize": "Property Size (m²)",
      "location": "Location",
      "rooms": "Number of Rooms",
      "constructionYear": "Construction Year",
      "condition": "Condition",
      "features": "Features",

      "annualRent": "Annual Rental Income",
      "monthlyRent": "Monthly Rent",
      "operatingExpenses": "Operating Expenses",
      "transactionCosts": "Transaction Costs",
      "grossYield": "Gross Rental Yield",
      "netYield": "Net Rental Yield",
      "grm": "Gross Rent Multiplier",
      "capRate": "Cap Rate",
      "cashFlow": "Cash Flow",

      "currency": "Currency",
      "chf": "Swiss Franc (CHF)",
      "eur": "Euro (EUR)"
    },
    "finance": {
      "loans": "Loans & Mortgages"
    }
  }
}
```

**Subcategories:**

```json
{
  "subcategories": {
    "loans": "Loans & Mortgages",
    "valuation": "Property Valuation",
    "investment": "Investment Analysis"
  }
}
```

**Property Types, Conditions, Features:**

```json
{
  "calculator": {
    "realestate": {
      "propertyTypes": {
        "apartment": "Apartment",
        "house": "House",
        "commercial": "Commercial"
      },
      "conditions": {
        "poor": "Poor",
        "fair": "Fair",
        "good": "Good",
        "very_good": "Very Good",
        "excellent": "Excellent"
      },
      "features": {
        "balcony": "Balcony",
        "parking": "Parking",
        "garden": "Garden",
        "elevator": "Elevator",
        "renovated": "Recently Renovated"
      },
      "regions": {
        "zurich": "Zurich",
        "geneva": "Geneva",
        "bern": "Bern",
        "basel": "Basel",
        "lausanne": "Lausanne",
        "lucerne": "Lucerne"
      }
    }
  }
}
```

**Disclaimers & Help Text:**

```json
{
  "calculator": {
    "realestate": {
      "disclaimers": {
        "valuation": "This is an estimate only, not a professional appraisal. Actual value can vary by ±30% based on specific location and market conditions.",
        "yield": "For informational purposes only. Consult a financial advisor for investment decisions.",
        "mortgage": "Example calculation. Actual terms vary by lender and borrower qualifications.",
        "swissRegulation": "Swiss regulations require minimum 20% down payment and amortization to 2/3 LTV within 15 years."
      },
      "helpText": {
        "grossYield": "Annual rent divided by purchase price, expressed as a percentage.",
        "netYield": "Gross rent minus operating expenses, divided by total investment.",
        "capRate": "Net operating income divided by property value.",
        "grm": "Purchase price divided by annual rent. Lower is better.",
        "transactionCosts": "Swiss transaction costs typically 3-6% (notary, registry, taxes)."
      },
      "marketContext": {
        "swissAverage": "Swiss average gross yield: 2.92% (Q3 2025)",
        "aboveAverage": "Above market average",
        "belowAverage": "Below market average",
        "excellent": "Excellent yield for Swiss market",
        "poor": "Low yield, likely negative cash flow"
      }
    }
  }
}
```

### 6.2 Language-Specific Considerations

**German (de):**

- "Hypothek" (mortgage)
- "Amortisation" (amortization)
- "Mietertrag" (rental yield)
- "Liegenschaft" (property)

**French (fr):**

- "Hypothèque" (mortgage)
- "Amortissement" (amortization)
- "Rendement locatif" (rental yield)
- "Bien immobilier" (property)

**Italian (it):**

- "Ipoteca" (mortgage)
- "Ammortamento" (amortization)
- "Rendimento da locazione" (rental yield)
- "Immobile" (property)

**Currency Symbols:**

- CHF: "CHF" prefix or suffix (varies by locale)
- EUR: "€" symbol
- Use `Intl.NumberFormat` for automatic locale formatting

---

## Section 7: Dependency Analysis & Bundle Impact

### 7.1 No New Dependencies Required

**Good news:** All calculations can be implemented with existing dependencies.

**Current Relevant Dependencies:**

- zustand@5.0.10 (state management) — already used
- recharts@3.6.0 (charts) — already used for amortization visualization
- date-fns (if needed for date calculations) — check if already in package.json

**No additional npm packages needed:**

- ❌ No financial libraries required (formulas are straightforward)
- ❌ No API clients required (static data)
- ❌ No specialized calculation libraries

### 7.2 Bundle Impact

**New Code Size Estimate:**

- Property valuation logic: ~200 lines
- Rental yield logic: ~150 lines
- Mortgage enhancement: ~100 lines
- Loan amortization enhancement: ~100 lines
- Shared components (currency selector, etc.): ~200 lines
- **Total: ~750 lines of code** (~20 KB minified, ~5 KB gzipped)

**Data Files:**

- `swiss-property-prices.json`: ~2 KB
- `real-estate-benchmarks.json`: ~1 KB
- **Total: ~3 KB**

**Total Bundle Impact:** ~8 KB gzipped (negligible, 0.5% increase)

### 7.3 Build Time Impact

**Static Data:**

- Property prices: Manual update (or optional build-time script)
- Benchmarks: Manual update quarterly

**No Build-Time API Calls Required** (unlike Phase 17 crypto prices)

- Property data is less volatile
- Can be updated manually with each release

**Optional:** Create `scripts/fetch-swiss-property-data.ts` if API available

- Not critical for MVP
- Can add later if data source identified

---

## Section 8: Privacy & Security Considerations

### 8.1 Data Sensitivity

**What we handle:**

- ✅ Property prices (public information)
- ✅ Rental income (user-entered, not stored)
- ✅ Mortgage amounts (user-entered, not stored)
- ✅ Financial calculations (client-side only)

**What we do NOT handle:**

- ❌ Personal identification (names, addresses)
- ❌ Actual property addresses (only region/city)
- ❌ Loan applications or approvals
- ❌ Credit checks or financial verification

### 8.2 URL State Security

**Consideration:** URL contains financial data (loan amounts, property values)

**Risks:**

- Browser history contains sensitive amounts
- URLs can be shared, exposing financial information

**Mitigations:**

- Document in UI: "Your data stays private, but clear browser history if using shared computer"
- Add "Share" button that copies URL (explicit action)
- No backend, no logging, no tracking

### 8.3 Disclaimers Required

**Legal Disclaimers:**

1. **Property Valuation:**
   - "This is an automated estimate, not a professional appraisal"
   - "Not for legal, tax, or financing purposes"
   - "Consult a certified appraiser for official valuations"

2. **Mortgage/Loan Calculators:**
   - "Example calculation only"
   - "Actual terms vary by lender and creditworthiness"
   - "Not a loan offer or commitment"

3. **Rental Yield:**
   - "For informational purposes only"
   - "Consult a financial advisor for investment decisions"
   - "Past performance does not guarantee future results"

4. **Swiss Regulations:**
   - "Swiss mortgage regulations apply (20% down payment, amortization requirements)"
   - "Consult a Swiss mortgage advisor for specific guidance"

### 8.4 Accuracy Limitations

**What to Document:**

- Property valuations can vary by ±30%
- Rental yields depend on market conditions
- Interest rates fluctuate
- Regional data is averaged, not property-specific
- Calculations are simplified models, not comprehensive financial planning

**Implementation:** Add help icons (?) with tooltips explaining limitations

---

## Section 9: Build-Time vs Runtime Trade-offs

### 9.1 Static Data Approach (Recommended)

**Build-Time:**

- ✅ Property price data (static JSON)
- ✅ Market benchmarks (static JSON)
- ✅ Swiss mortgage rates (updated manually or quarterly)

**Runtime:**

- ✅ All calculations (client-side)
- ✅ User input handling
- ✅ Chart rendering
- ✅ Currency formatting

**Pros:**

- Static export compatible ✅
- No API rate limits ✅
- No runtime latency ✅
- Predictable performance ✅

**Cons:**

- Data requires manual updates
- Property prices less current than real-time APIs

**Conclusion:** Static approach is appropriate. Real estate data changes slowly (quarterly/annually), not daily like crypto.

### 9.2 Data Update Frequency

**Recommended Update Schedule:**

| Data | Update Frequency | Method |
|------|------------------|--------|
| Property prices (m²) | Quarterly | Manual update from Swiss property reports |
| Mortgage rates | Monthly | Manual update from Swiss banks |
| Rental yields | Quarterly | Manual update from market reports |
| Transaction costs | Annually | Manual update (rarely changes) |

**Update Process:**

1. Review Swiss property market reports (Q1, Q2, Q3, Q4)
2. Update JSON files in `src/lib/data/`
3. Commit changes with message "chore(data): update Q1 2026 property prices"
4. Rebuild and deploy

### 9.3 Optional: Build-Time API Integration

**If API available:**

- Create `scripts/fetch-swiss-property-data.ts`
- Fetch from Swiss real estate data providers (e.g., Wüest Partner, FPRE)
- Run in `prebuild` script
- Fallback to static data if API fails

**Not critical for MVP** — can add later if justified

---

## Section 10: Unknowns & Questions for Planning Phase

### 10.1 Questions Resolved

✅ **Q1: Should we create new mortgage calculator or enhance existing?**

- **Answer:** Enhance existing. It already has comprehensive functionality.

✅ **Q2: Should we support CHF and EUR?**

- **Answer:** Yes, both. Add currency selector to all calculators.

✅ **Q3: What property valuation method to use?**

- **Answer:** Simplified hedonic method (comparative market analysis). Most appropriate for calculator format.

✅ **Q4: Are there APIs for Swiss property data?**

- **Answer:** Commercial APIs exist (Wüest Partner, FPRE) but not free. Use static data for MVP.

✅ **Q5: Should we include mortgage types (Fixed, SARON, Variable)?**

- **Answer:** Not for MVP. Keep simple with single interest rate input.

### 10.2 Questions for Planning Phase

**Calculator Scope:**

1. **Should we build all 4 calculators or prioritize?**
   - **Recommendation:** Focus on 3 core calculators
     - Mortgage (enhancement)
     - Rental Yield (new, high value)
     - Property Valuation (new, unique feature)
   - **Skip for MVP:** Loan Amortization (too similar to existing loan calculator)

2. **Should rental yield calculator include mortgage integration?**
   - **Recommendation:** Yes, add "Include mortgage payment" toggle
   - Allows cash flow analysis for financed properties
   - Link to mortgage calculator for detailed amortization

3. **What level of chart/visualization detail?**
   - **Recommendation:** Reuse existing patterns
   - Amortization: Line chart (principal vs. interest over time)
   - Rental yield: Simple comparison bars (your yield vs. market average)
   - Property valuation: Range indicator (min-avg-max)

**Data Strategy:**

1. **How detailed should regional data be?**
   - **Recommendation:** Start with 6-7 major Swiss cities + national average
   - Can expand to cantons or districts in future phases

2. **Should we include European cities (Paris, Berlin, etc.)?**
   - **Recommendation:** No for MVP. Focus on Swiss market.
   - EUR support is for Swiss-German border regions and Swiss EUR mortgages

**User Experience:**

1. **Should we show intermediate calculation steps?**
   - **Recommendation:** Yes for mortgage (follow existing pattern)
   - Optional for property valuation (can be complex)
   - No for rental yield (formulas are simple)

2. **What default values to use?**
   - **Mortgage:** CHF 500,000 loan, 2.0% rate, 25 years, CHF 125,000 down
   - **Property valuation:** 100m² apartment, Zurich, 2015, good condition
   - **Rental yield:** CHF 800,000 purchase, CHF 24,000 annual rent

### 10.3 Remaining Unknowns

**Technical:**

- [ ] Do we need canton-specific property tax rates? (Varies 0.1-0.3%)
- [ ] Should we validate minimum down payment (20% Swiss requirement)?
- [ ] Format for CHF in different locales (apostrophes vs. commas)?

**Data:**

- [ ] Where to source initial property price data? (Manual research or commercial API trial?)
- [ ] Should benchmarks include historical trends or just current values?

**UX:**

- [ ] Should calculators be on same page or separate pages?
- [ ] Link between calculators (e.g., "Use this value in rental yield calculator")?

**These questions can be answered during planning phase.**

---

## Section 11: Recommendations for Phase Planning

### 11.1 MVP Scope (Recommended)

**Must Include (Core):**

1. ✅ **Mortgage Calculator Enhancement**
   - Currency selection (CHF/EUR)
   - Swiss market defaults (20% down, 1.5-2.0% rates)
   - Validation for minimum down payment
   - Swiss formatting (apostrophes for CHF)

2. ✅ **Rental Yield Calculator (NEW)**
   - Gross and net yield calculations
   - Comparison to Swiss market average (2.92%)
   - GRM calculation
   - Cash flow analysis
   - Optional mortgage payment integration

3. ✅ **Property Valuation Calculator (NEW)**
   - Hedonic method (simplified)
   - Regional pricing (6-7 major Swiss cities)
   - Value range display (min-avg-max)
   - Adjustment factors (age, condition, features)
   - Clear disclaimers

**Can Skip (Nice-to-Have):**

1. ❌ **Loan Amortization Enhancement**
   - Reason: Too similar to existing loan calculator
   - Alternative: Document existing loan calculator can be used
   - Future: Add Swiss-specific features if demand justifies

**Quality Requirements:**

- Full i18n (en/fr/de/it)
- URL state persistence
- Charts/visualizations
- Mobile responsive
- Disclaimers on all estimation tools

### 11.2 Bundle Cost Summary

- New code: ~5 KB gzipped
- Data files: ~3 KB
- No new dependencies
- **Total impact: ~8 KB (0.5% increase)**

### 11.3 Complexity Estimate

| Calculator | Complexity (1-10) | Time Estimate |
|------------|-------------------|---------------|
| Mortgage Enhancement | 3/10 | 2-3 hours |
| Rental Yield Calculator | 5/10 | 4-5 hours |
| Property Valuation Calculator | 6/10 | 6-8 hours |
| **Total (3 calculators)** | — | **12-16 hours** |

**Additional Time:**

- i18n translations: 2-3 hours
- Testing & QA: 3-4 hours
- Data file creation: 1-2 hours
- **Grand Total: 18-25 hours**

### 11.4 Implementation Timeline

**Week 1:**

- Day 1: Mortgage enhancement + currency selector component
- Day 2: Rental yield calculator (logic + UI)
- Day 3: Property valuation calculator (logic + regional data)

**Week 2:**

- Day 1: Property valuation UI + charts
- Day 2: i18n translations (all 4 locales)
- Day 3: Testing, QA, documentation

---

## Section 12: Critical Success Factors

### 12.1 Must-Have Features

1. ✅ **Accurate Formulas**
   - PMT calculation matches Excel
   - Rental yield matches industry standard
   - Property valuation produces reasonable ranges

2. ✅ **Swiss Market Context**
   - CHF/EUR support
   - Swiss mortgage rates (1.5-2.0%)
   - Swiss regulations (20% down payment)
   - Regional pricing (Zurich, Geneva, etc.)

3. ✅ **Clear Disclaimers**
   - "Estimate only, not professional appraisal"
   - "Consult financial advisor"
   - "For informational purposes"

4. ✅ **User-Friendly**
   - Reasonable defaults (save users time)
   - Help text / tooltips
   - Currency formatting with locale
   - Responsive design

### 12.2 Quality Benchmarks

**Accuracy:**

- Mortgage payments within CHF 1 of Excel PMT
- Property valuations within realistic market ranges (±30%)
- Rental yields match manual calculations

**Performance:**

- Calculations instant (< 100ms)
- Charts render smoothly
- No layout shift on load

**Accessibility:**

- Keyboard navigation
- Screen reader friendly labels
- WCAG 2.1 AA compliance

### 12.3 Definition of Done

- [ ] All 3 core calculators implemented and tested
- [ ] Currency selection works (CHF/EUR)
- [ ] Swiss market defaults applied
- [ ] Regional data for 6+ Swiss cities
- [ ] Charts/visualizations render correctly
- [ ] i18n complete (en/fr/de/it)
- [ ] URL state persistence works
- [ ] Mobile responsive (tested on iOS/Android)
- [ ] Disclaimers present and clear
- [ ] Code reviewed and meets style guide
- [ ] Documentation updated (CALCULATOR_GUIDE.md)
- [ ] Registry entries added
- [ ] Search index updated

---

## RESEARCH COMPLETE

All research areas have been thoroughly investigated. Phase 18 is ready to move to planning phase.

### Key Takeaways

1. ✅ All calculators are technically feasible with static export
2. ✅ Mortgage calculator already exists (enhancement only)
3. ✅ No new dependencies required (~0 KB bundle impact)
4. ✅ Static data approach is appropriate (real estate data changes slowly)
5. ✅ Swiss/European context well-defined (CHF/EUR, regulations, market data)
6. ✅ Formulas are standard and well-documented
7. ✅ Existing patterns from Phase 17 and finance calculators are reusable
8. ✅ Clear implementation strategy (3 calculators, 18-25 hours)
9. ❌ No blockers identified
10. ✅ Ready to move to PLAN phase

### Recommended Implementation

**Phase 18.1:** Mortgage Calculator Enhancement (CHF/EUR, Swiss defaults)
**Phase 18.2:** Rental Yield Calculator (gross/net yield, market comparison)
**Phase 18.3:** Property Valuation Calculator (hedonic method, regional pricing)

**Skip for MVP:** Loan Amortization Enhancement (existing loan calculator sufficient)

---

## Sources

### PMT Function & Mortgage Calculations

- [PMT function - Microsoft Support](https://support.microsoft.com/en-us/office/pmt-function-0214da64-9a63-4996-bc20-214433fa6441)
- [Using Excel formulas to figure out payments and savings - Microsoft Support](https://support.microsoft.com/en-us/office/using-excel-formulas-to-figure-out-payments-and-savings-11cb708f-c137-4ef8-bcf3-5137aaeb4b20)
- [Estimate mortgage payment - Excel formula | Exceljet](https://exceljet.net/formulas/estimate-mortgage-payment)
- [PMT Function in Excel | Formula + Calculator - Wall Street Prep](https://www.wallstreetprep.com/knowledge/pmt-function/)
- [Excel PMT function with formula examples - Ablebits](https://www.ablebits.com/office-addins-blog/excel-pmt-function-formula-examples/)

### Property Valuation Methods (Switzerland)

- [The different property valuation methods in Switzerland - Piguet Galland](https://www.piguetgalland.ch/en/news/protected-by-recaptcha-privacy-terms-)
- [Property valuation: determine the price professionally - key4.ch](https://key4.ch/en/coach/search-and-buy/determine-price-professionally/)
- [How to calculate the market value of a property - UBS Switzerland](https://www.ubs.com/ch/en/services/guide/mortgages-and-financing/articles/valuation-of-real-estate.html)
- [Methods of real estate valuations - Oswald & Sorge Partner AG](https://oswald-sorge.ch/en/methods-of-real-estate-valuations/)
- [Determining the Market Value of a Property - HYPOHAUS](https://hypohaus.ch/en/determining-the-market-value-of-a-property-methods-and-factors/)
- [Switzerland Real Estate Market Predictions 2026 - Club Property](https://clubproperty.com/switzerland-real-estate-market-predictions-2026-full-forecast-trends/)

### Rental Yields & Investment (Switzerland)

- [Rental Yields in Switzerland in 2025, Q3 - Global Property Guide](https://www.globalpropertyguide.com/europe/switzerland/rental-yields)
- [Swiss Real Estate Return on Investment Calculator](https://batiste.github.io/swiss-real-estate-return-investment/index.html)
- [Buy to rent in Switzerland: worth it? - Investropa](https://investropa.com/blogs/news/switzerland-buy-to-rent-worth)
- [How do you calculate a property yield? - SIPA](https://sipa.swiss/how-do-you-calculate-a-property-yield/?lang=en)
- [Determining the rent - how high can the rent be? - properti](https://properti.com/ch/en/insights/rent-out/rent-calculation-how-can-i-determine-the-rent/)

### Swiss Mortgage Rates & Terms

- [Current mortgage interest rates and interest rate trends - UBS Switzerland](https://www.ubs.com/ch/en/services/mortgages-and-financing/mortgages/interest-rates.html)
- [Mortgage interest rates Switzerland - Comparis](https://en.comparis.ch/hypotheken/zinssatz)
- [Current mortage interest rates - key4.ch](https://key4.ch/en/current-interest-rates/)
- [Mortgages: Interest Rate Development 2026 (1st Quarter) - Houzy](https://en.houzy.ch/post/mortgages-interest-rate-development-december-2025)
- [The key interest rate remains unchanged - Swiss Life](https://www.swisslife.ch/en/individuals/real-estate-mortgages/guide/key-interest-rate.html)

### Amortization Calculations

- [Amortization Calculator - Bankrate](https://www.bankrate.com/mortgages/amortization-calculator/)
- [Amortization Calculator - Calculator.net](https://www.calculator.net/amortization-calculator.html)
- [How is an Amortization Schedule Calculated? - Temple University](https://cis.temple.edu/~anwar/CIS2305Spring2014/LabAssignments/LabAssignment3/loancalculator.html)
- [Amortization Calculation Formula - Vertex42](https://www.vertex42.com/ExcelArticles/amortization-calculation.html)

### Cap Rate & NOI

- [NOI Calculator for Cap Rate & Debt Yield - Multifamily Loans](https://www.multifamily.loans/noi-calculator/)
- [NOI/Cap Rate: A Guide on How to Calculate Them - Mashvisor](https://www.mashvisor.com/blog/noi-cap-rate/)
- [Going-In Cap Rate | Formula + Calculator - Wall Street Prep](https://www.wallstreetprep.com/knowledge/going-in-cap-rate/)
- [Net Operating Income (NOI) | Formula + Calculator - Wall Street Prep](https://www.wallstreetprep.com/knowledge/noi-net-operating-income/)
- [How to Calculate NOI in Commercial Real Estate - AEI Consultants](https://aeiconsultants.com/how-to-calculate-net-operating-income/)
