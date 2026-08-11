# Phase 20: Automotive Calculators - RESEARCH

**Researched:** 2026-01-24
**Domain:** Automotive calculations, fuel efficiency, tire sizing, maintenance scheduling, vehicle financing
**Confidence:** HIGH

---

## Executive Summary

This document provides comprehensive research findings for implementing Phase 20 (Automotive Calculators) of the Converty calculator project. The research covers 4 calculators: Fuel Efficiency Calculator (L/100km primary), Tire Sizing Calculator (metric specifications), Maintenance Intervals Calculator (km-based), and Vehicle Loan/Lease Calculator (CHF/EUR currencies).

**Key Finding:** All four calculators are technically feasible to implement client-side in a static export setup. The automotive domain is metric-first (Europe/Switzerland standard), requiring L/100km for fuel efficiency, metric tire notation (205/55R16), and km-based maintenance intervals. An auto-loan calculator already exists in the finance category but can be enhanced or referenced.

**Regional Context:** European/Swiss automotive standards differ from US standards:
- Fuel efficiency: L/100km (lower is better) vs. MPG (higher is better)
- Distance: Kilometers vs. miles
- Tire sizing: Metric notation standard worldwide
- Currency: CHF/EUR for Swiss market

---

## Section 1: Fuel Efficiency Calculations

### 1.1 Fuel Consumption Standards (L/100km)

**Primary metric in Europe/Switzerland:**

```
L/100km = (Liters of fuel used / Distance traveled in km) × 100

Example: 45L used over 600km = (45 / 600) × 100 = 7.5 L/100km
```

**Interpretation:**
- Lower is better (less fuel per 100km)
- Typical ranges:
  - Efficient car: 4-6 L/100km
  - Average car: 6-8 L/100km
  - SUV/larger vehicle: 8-12 L/100km
  - Performance vehicle: 10-15+ L/100km

### 1.2 Conversion to km/L

**Alternative metric** (less common in Europe, but some users prefer):

```
km/L = 100 / (L/100km)

Example: 7.5 L/100km = 100 / 7.5 = 13.33 km/L
```

**Interpretation:**
- Higher is better (more km per liter)
- Inverse relationship with L/100km

### 1.3 Imperial Conversion (MPG)

**US/UK standard** (secondary support):

```
MPG (US) = 235.214583 / (L/100km)
MPG (UK) = 282.481053 / (L/100km)

Example: 7.5 L/100km:
  - US MPG = 235.214583 / 7.5 = 31.36 MPG (US)
  - UK MPG = 282.481053 / 7.5 = 37.66 MPG (UK)
```

**Note:** US gallon (3.785L) ≠ UK gallon (4.546L)

### 1.4 Cost Calculations

**Fuel cost per distance:**

```
Cost per 100km = (L/100km) × (Fuel price per liter)
Cost per km = Cost per 100km / 100
Annual fuel cost = (Annual km) × (L/100km) / 100 × (Fuel price)

Example:
  - 7.5 L/100km, CHF 1.80/L, 15,000 km/year
  - Annual cost = 15,000 × 7.5 / 100 × 1.80 = CHF 2,025
```

### 1.5 Trip Planning

**Calculate fuel needed for trip:**

```
Fuel needed = (Distance in km) × (L/100km) / 100

Example: 450km trip, 7.5 L/100km
  - Fuel needed = 450 × 7.5 / 100 = 33.75L
```

### 1.6 Efficiency Comparison

**Compare two vehicles:**

```
Savings per 100km = (Vehicle1 L/100km - Vehicle2 L/100km) × Fuel price
Annual savings = Savings per 100km × (Annual km / 100)

Example: 8 L/100km vs 6 L/100km, CHF 1.80/L, 15,000 km/year
  - Savings = (8 - 6) × 1.80 = CHF 3.60 per 100km
  - Annual = 3.60 × 150 = CHF 540/year
```

---

## Section 2: Tire Sizing Specifications

### 2.1 Metric Tire Notation

**Standard format:** `Width/Aspect Ratio R Diameter [Load Index] [Speed Rating]`

**Example:** `205/55R16 91V`

**Components:**

1. **Width (205)**: Tire width in millimeters (section width)
2. **Aspect Ratio (55)**: Sidewall height as percentage of width
   - Sidewall height = 205mm × 0.55 = 112.75mm
3. **Construction (R)**: Radial (standard for modern tires)
   - R = Radial
   - D = Diagonal/Bias (obsolete)
   - B = Belted bias (rare)
4. **Diameter (16)**: Wheel/rim diameter in inches
   - NOTE: Mixed units (mm for width, inches for diameter)
5. **Load Index (91)**: Maximum load capacity (optional in notation)
   - 91 = 615 kg per tire
6. **Speed Rating (V)**: Maximum speed (optional)
   - V = 240 km/h

### 2.2 Tire Dimension Calculations

**Overall tire diameter:**

```
Sidewall height (mm) = Width × (Aspect Ratio / 100)
Wheel diameter (mm) = Rim diameter (inches) × 25.4
Total diameter (mm) = Wheel diameter + (2 × Sidewall height)
Total diameter (cm) = Total diameter (mm) / 10

Example: 205/55R16
  - Sidewall = 205 × 0.55 = 112.75mm
  - Wheel = 16 × 25.4 = 406.4mm
  - Total = 406.4 + (2 × 112.75) = 631.9mm = 63.19cm
```

**Tire circumference:**

```
Circumference (mm) = π × Total diameter (mm)
Circumference (cm) = Circumference (mm) / 10

Example: 205/55R16
  - Circumference = π × 631.9 = 1985.5mm = 198.55cm
```

**Revolutions per kilometer:**

```
Revolutions/km = 1,000,000mm / Circumference (mm)

Example: 205/55R16
  - Revs/km = 1,000,000 / 1985.5 = 503.65 revolutions
```

### 2.3 Tire Size Comparison

**When changing tire sizes:**

```
Diameter difference (%) = ((New diameter - Old diameter) / Old diameter) × 100
Speedometer error (%) = Diameter difference (%)

Example: Change from 205/55R16 to 215/60R16
  - Old: 631.9mm
  - New: 215 × 0.60 × 2 + 406.4 = 664.4mm
  - Difference = ((664.4 - 631.9) / 631.9) × 100 = +5.14%
  - Speedometer reads 100 km/h → actual speed = 105.14 km/h
```

**Recommendation:** Keep within ±3% diameter to maintain accuracy.

### 2.4 Load Index Table (Common Values)

| Index | kg/tire | Index | kg/tire |
|-------|---------|-------|---------|
| 71    | 345     | 91    | 615     |
| 75    | 387     | 95    | 690     |
| 80    | 450     | 100   | 800     |
| 85    | 515     | 105   | 925     |

### 2.5 Speed Rating Table

| Rating | km/h | Rating | km/h |
|--------|------|--------|------|
| Q      | 160  | V      | 240  |
| S      | 180  | W      | 270  |
| T      | 190  | Y      | 300  |
| H      | 210  | (Y)    | 300+ |

---

## Section 3: Maintenance Intervals

### 3.1 Swiss/European Maintenance Standards

**Distance-based intervals** (km, not miles):

| Service Type | Typical Interval (km) | Notes |
|--------------|----------------------|--------|
| Oil change | 15,000 - 20,000 | Modern synthetic oil |
| Oil change (older) | 10,000 - 15,000 | Conventional oil |
| Air filter | 20,000 - 30,000 | Depends on conditions |
| Cabin filter | 15,000 - 20,000 | More frequent in cities |
| Spark plugs | 30,000 - 60,000 | Depends on type |
| Brake fluid | 30,000 - 40,000 | Or 2 years |
| Coolant | 60,000 - 100,000 | Or 5 years |
| Transmission fluid | 60,000 - 100,000 | Or lifetime (some vehicles) |
| Timing belt | 100,000 - 160,000 | Critical replacement |
| Brake pads (front) | 30,000 - 50,000 | Driving style dependent |
| Brake pads (rear) | 50,000 - 80,000 | Less wear |
| Tires | 40,000 - 80,000 | Or 6 years (age limit) |

### 3.2 Time-Based Intervals

**Whichever comes first:**

- Oil change: 15,000 km **OR** 12 months
- Brake fluid: 40,000 km **OR** 24 months
- Coolant: 100,000 km **OR** 60 months
- Battery: N/A (check voltage) **OR** 4-5 years

### 3.3 Service Schedule Calculator

**Input:**
- Current odometer reading (km)
- Last service date/km
- Annual driving distance (km/year)

**Output:**
- Next service due (km and date estimate)
- Upcoming services in next 12/24 months
- Overdue services (if current km > due km)

**Calculation:**

```
Next oil change km = Last oil change km + 15,000
Estimated date = Current date + ((Next km - Current km) / Monthly km avg)

Example:
  - Current: 45,000 km
  - Last oil: 30,000 km (6 months ago)
  - Monthly avg: (45,000 - 30,000) / 6 = 2,500 km/month
  - Next oil: 45,000 km (DUE NOW)
  - Next after: 60,000 km
  - Time to next: (60,000 - 45,000) / 2,500 = 6 months
```

### 3.4 Swiss MFK (Technical Inspection)

**Mandatory periodic inspection:**

- First inspection: 3 years after registration
- Subsequent: Every 2 years
- Vehicles > 7 years: Every year (some cantons)

**Calculator should include:**
- MFK due date based on registration year
- Reminder at 30/60 days before due

---

## Section 4: Vehicle Loan/Lease Calculators

### 4.1 Auto Loan Calculation

**Existing calculator:** `src/lib/converters/finance/auto-loan.ts`

**Already implements:**
- Monthly payment calculation (PMT formula)
- Down payment consideration
- Trade-in value
- Sales tax calculation
- Amortization schedule
- Total interest calculation

**Current functionality:**

```typescript
export interface AutoLoanInput {
  vehiclePrice: number;
  downPayment: number;
  tradeInValue: number;
  annualInterestRate: number;
  loanTermMonths: number;
  salesTaxRate: number;
}
```

**PMT formula:**

```
Monthly Payment = P × [r(1 + r)^n] / [(1 + r)^n - 1]

Where:
  P = Principal (loan amount after down payment and trade-in)
  r = Monthly interest rate (annual rate / 12)
  n = Total number of payments (months)
```

### 4.2 Vehicle Lease Calculation

**Lease formula** (different from loan):

```
Monthly Lease Payment = (Depreciation + Finance Charge) / Months

Depreciation = (Capitalized Cost - Residual Value) / Lease Term
Finance Charge = (Capitalized Cost + Residual Value) × Money Factor

Where:
  Capitalized Cost = Vehicle price - down payment - trade-in + fees
  Residual Value = Vehicle price × Residual percentage (e.g., 50% for 3-year)
  Money Factor = APR / 2400 (converts APR to lease money factor)
```

**Example:**

```
Vehicle price: CHF 40,000
Down payment: CHF 4,000
Residual (50% for 3 years): CHF 20,000
APR: 3.6%
Term: 36 months

Capitalized Cost = 40,000 - 4,000 = CHF 36,000
Depreciation = (36,000 - 20,000) / 36 = CHF 444.44/month
Money Factor = 3.6 / 2400 = 0.0015
Finance Charge = (36,000 + 20,000) × 0.0015 = CHF 84/month
Monthly Payment = 444.44 + 84 = CHF 528.44/month
```

### 4.3 Swiss Vehicle Financing Context

**Typical terms:**
- Loan duration: 24-84 months (2-7 years)
- Common: 48-60 months (4-5 years)
- Interest rates: 2.5% - 6.5% (varies by credit)
- Down payment: 10-20% recommended
- Sales tax: 7.7% (Swiss VAT on new vehicles)

**Lease terms:**
- Common: 24-48 months
- Annual km limits: 10,000 / 15,000 / 20,000 km/year
- Excess km charge: CHF 0.10 - 0.30 per km
- Residual values: ~45-60% for 3-year lease

### 4.4 Buy vs Lease Comparison

**Calculator should show:**

```
Total cost to own (loan):
  = Vehicle price + Total interest + Maintenance - Resale value

Total cost for lease:
  = (Monthly payment × Months) + Down payment + Excess km fees

Break-even analysis:
  - If keeping car > X years → Buy
  - If upgrading frequently → Lease
```

**Swiss context:**
- Leasing popular for business (tax deductible)
- Private ownership more common for families
- Electric vehicle incentives affect decision

---

## Section 5: Implementation Strategy

### 5.1 Calculator Breakdown

#### Calculator 1: Fuel Efficiency Calculator (NEW)

**Purpose:** Calculate fuel consumption, trip costs, efficiency comparisons

**Input Fields:**
- **Mode:** "Calculate L/100km" | "Convert units" | "Trip planning" | "Compare vehicles"
- Distance traveled (km)
- Fuel used (liters)
- Fuel price (CHF/EUR per liter) - optional
- Annual distance (km) - optional for annual cost

**Output Fields:**
- L/100km (primary)
- km/L (secondary)
- MPG (US/UK) - optional conversion
- Cost per 100km
- Annual fuel cost (if annual distance provided)
- Trip fuel needed (if trip planning mode)
- Efficiency rating (Excellent/Good/Average/Poor)

**Complexity:** 4/10 (straightforward formulas, multiple conversion modes)

#### Calculator 2: Tire Sizing Calculator (NEW)

**Purpose:** Calculate tire dimensions, compare sizes, check compatibility

**Input Fields:**
- Tire size notation (e.g., "205/55R16")
- Or separate: Width (mm), Aspect ratio (%), Rim diameter (inches)
- Comparison tire size (optional)

**Output Fields:**
- Sidewall height (mm)
- Overall diameter (mm/cm)
- Circumference (mm/cm)
- Revolutions per km
- Load index interpretation
- Speed rating interpretation
- **If comparing:** Diameter difference (%), speedometer error (%)

**Data Requirements:**
- Load index table (static JSON)
- Speed rating table (static JSON)

**Complexity:** 5/10 (parsing tire notation, mixed units, comparison logic)

#### Calculator 3: Maintenance Intervals Calculator (NEW)

**Purpose:** Track service schedules, calculate next due dates

**Input Fields:**
- Current odometer (km)
- Last oil change (km or date)
- Last major service (km or date)
- Average monthly driving (km/month) OR annual km
- Vehicle age (years) - optional for time-based services

**Output Fields:**
- Next oil change (km and estimated date)
- Next major service (km and estimated date)
- Upcoming services (12-month forecast)
- Overdue services (warnings)
- MFK inspection due date (Swiss context)

**Data Requirements:**
- Service interval standards (static JSON)
- Configurable intervals by service type

**Complexity:** 6/10 (date calculations, multiple service types, forecasting)

#### Calculator 4: Vehicle Loan/Lease Calculator (ENHANCE EXISTING)

**Purpose:** Calculate financing options for vehicles (CHF/EUR focus)

**Option A: Enhance existing auto-loan calculator**
- Add CHF/EUR currency selection
- Add Swiss tax defaults (7.7% VAT)
- Add lease calculation mode
- Add buy vs lease comparison

**Option B: Create separate automotive-specific calculator**
- New calculator in automotive category
- Reference existing auto-loan for loan logic
- Add lease-specific features
- Add km-based depreciation

**Recommendation:** Option B (new calculator in automotive category)
- Keeps automotive calculators together
- Can reference finance/auto-loan for shared logic
- Allows automotive-specific features (km depreciation, MFK costs)

**Input Fields (Loan Mode):**
- Vehicle price (CHF/EUR)
- Down payment (amount or %)
- Trade-in value (optional)
- Annual interest rate (%)
- Loan term (months)
- Sales tax rate (default 7.7% for Switzerland)
- Currency (CHF/EUR)

**Input Fields (Lease Mode):**
- Vehicle price (CHF/EUR)
- Down payment
- Lease term (months)
- Annual km limit (10k/15k/20k)
- Residual percentage (%)
- Money factor or APR
- Currency (CHF/EUR)

**Output Fields:**
- Monthly payment
- Total cost
- Total interest/finance charges
- Amortization schedule (loan) or payment breakdown (lease)
- Buy vs lease comparison (if both calculated)

**Complexity:** 5/10 (enhance existing, add lease logic)

### 5.2 Priority & Sequencing

**Recommended Implementation Order:**

1. **Fuel Efficiency Calculator** (Phase 20.1)
   - Simplest formulas
   - High value for European users
   - 3-4 hours

2. **Tire Sizing Calculator** (Phase 20.2)
   - Moderate complexity
   - Requires notation parsing
   - 4-5 hours

3. **Maintenance Intervals Calculator** (Phase 20.3)
   - Date calculations needed
   - Service interval data
   - 5-6 hours

4. **Vehicle Financing Calculator** (Phase 20.4)
   - Enhance existing patterns
   - Add lease logic
   - 4-5 hours

**Total Estimated Time:** 16-20 hours (all 4 calculators)

---

## Section 6: Architecture Patterns

### 6.1 Reuse from Previous Phases

**From Phase 17 (Crypto):**
- ✅ Build-time data fetching for static tables (tire load index, speed ratings)
- ✅ JSON data files in `src/lib/data/`
- ✅ createCalculatorStore pattern
- ✅ URL state persistence

**From Phase 18 (Real Estate):**
- ✅ Currency handling (CHF/EUR)
- ✅ Loan/mortgage calculation patterns
- ✅ Amortization schedule generation
- ✅ Financial formatting utilities

**From Phase 19 (Cooking/Nutrition):**
- ✅ Unit conversion patterns
- ✅ Metric-first approach
- ✅ Data table management

**From Finance Converters:**
- ✅ PMT formula implementation (auto-loan.ts)
- ✅ Interest rate calculations
- ✅ Payment schedules

### 6.2 New Patterns Needed

**Tire notation parser:**

```typescript
export interface TireSizeComponents {
  width: number;        // mm
  aspectRatio: number;  // percentage
  construction: "R" | "D" | "B";
  rimDiameter: number;  // inches
  loadIndex?: number;
  speedRating?: string;
}

export function parseTireSize(notation: string): TireSizeComponents | null {
  // Match: 205/55R16 or 205/55R16 91V
  const regex = /^(\d{3})\/(\d{2})([RDB])(\d{2})(?:\s+(\d{2,3})([A-Z]))?$/i;
  const match = notation.match(regex);
  if (!match) return null;

  return {
    width: parseInt(match[1]),
    aspectRatio: parseInt(match[2]),
    construction: match[3].toUpperCase() as "R" | "D" | "B",
    rimDiameter: parseInt(match[4]),
    loadIndex: match[5] ? parseInt(match[5]) : undefined,
    speedRating: match[6]?.toUpperCase(),
  };
}
```

**Service interval tracker:**

```typescript
export interface ServiceInterval {
  type: string;
  intervalKm: number;
  intervalMonths: number;
  lastServiceKm: number;
  lastServiceDate: Date;
}

export function calculateNextService(
  service: ServiceInterval,
  currentKm: number,
  currentDate: Date,
  averageKmPerMonth: number
): ServiceDue {
  const nextKm = service.lastServiceKm + service.intervalKm;
  const kmRemaining = nextKm - currentKm;
  const monthsToNextKm = kmRemaining / averageKmPerMonth;

  const nextDate = new Date(service.lastServiceDate);
  nextDate.setMonth(nextDate.getMonth() + service.intervalMonths);

  const dueByKm = nextKm;
  const dueByDate = nextDate;
  const isDue = currentKm >= nextKm || currentDate >= nextDate;

  return { dueByKm, dueByDate, isDue, kmRemaining };
}
```

### 6.3 Data Files Required

**1. Tire Load Index** (`src/lib/data/tire-load-index.json`)

```json
{
  "timestamp": "2026-01-24",
  "source": "European Tyre and Rim Technical Organisation (ETRTO)",
  "loadIndex": {
    "70": 335,
    "71": 345,
    "75": 387,
    "80": 450,
    "85": 515,
    "90": 600,
    "91": 615,
    "95": 690,
    "100": 800,
    "105": 925
  }
}
```

**2. Tire Speed Ratings** (`src/lib/data/tire-speed-ratings.json`)

```json
{
  "timestamp": "2026-01-24",
  "source": "ETRTO Standards",
  "speedRatings": {
    "Q": 160,
    "R": 170,
    "S": 180,
    "T": 190,
    "U": 200,
    "H": 210,
    "V": 240,
    "W": 270,
    "Y": 300,
    "ZR": 240
  },
  "notes": {
    "ZR": "ZR indicates speed capability above 240 km/h, often with W (270) or Y (300) rating"
  }
}
```

**3. Service Intervals** (`src/lib/data/maintenance-intervals.json`)

```json
{
  "timestamp": "2026-01-24",
  "source": "Swiss/European automotive maintenance standards",
  "intervals": {
    "oil_change_synthetic": {
      "km": 15000,
      "months": 12,
      "description": "Engine oil and filter (synthetic)"
    },
    "oil_change_conventional": {
      "km": 10000,
      "months": 12,
      "description": "Engine oil and filter (conventional)"
    },
    "air_filter": {
      "km": 25000,
      "months": 24,
      "description": "Air filter replacement"
    },
    "cabin_filter": {
      "km": 20000,
      "months": 12,
      "description": "Cabin air filter"
    },
    "spark_plugs": {
      "km": 40000,
      "months": 48,
      "description": "Spark plugs"
    },
    "brake_fluid": {
      "km": 40000,
      "months": 24,
      "description": "Brake fluid flush"
    },
    "coolant": {
      "km": 100000,
      "months": 60,
      "description": "Coolant flush"
    },
    "timing_belt": {
      "km": 120000,
      "months": 96,
      "description": "Timing belt replacement (critical)"
    },
    "brake_pads_front": {
      "km": 40000,
      "months": null,
      "description": "Front brake pads (wear-dependent)"
    },
    "tires": {
      "km": 50000,
      "months": 72,
      "description": "Tire replacement (or 6 years age limit)"
    }
  },
  "swissMFK": {
    "firstInspection": 36,
    "subsequentInspection": 24,
    "description": "Swiss mandatory technical inspection (MFK)"
  }
}
```

**4. Swiss Fuel Prices** (optional, for defaults) (`src/lib/data/swiss-fuel-prices.json`)

```json
{
  "timestamp": "2026-01-24",
  "source": "Swiss fuel price averages",
  "prices": {
    "CHF": {
      "petrol_95": 1.85,
      "petrol_98": 1.95,
      "diesel": 1.90,
      "electric": 0.30
    },
    "EUR": {
      "petrol_95": 1.65,
      "petrol_98": 1.75,
      "diesel": 1.70,
      "electric": 0.28
    }
  },
  "notes": "Average prices per liter, updated quarterly"
}
```

**Total Data Size:** ~5-10 KB (negligible bundle impact)

---

## Section 7: Edge Cases & Gotchas

### 7.1 Fuel Efficiency Edge Cases

**Zero or negative values:**
- Distance = 0: Return null/error
- Fuel = 0: Return null/error (division by zero)
- Negative values: Invalid input

**Extreme efficiency values:**
- L/100km < 2: Warning "Extremely efficient (electric/hybrid?)"
- L/100km > 30: Warning "Very high consumption - verify inputs"

**Conversion precision:**
- Display L/100km to 1 decimal (7.5 L/100km)
- Display km/L to 2 decimals (13.33 km/L)
- Display MPG to 1 decimal (31.4 MPG)

### 7.2 Tire Sizing Edge Cases

**Invalid tire notations:**
- Missing components: "205/55" → Error "Invalid format"
- Invalid construction: "205/55X16" → Error "Construction must be R, D, or B"
- Width not 3 digits: "20/55R16" → Error "Width must be 3 digits"

**Aspect ratio edge cases:**
- Aspect ratio 0: Invalid (can't have zero sidewall)
- Aspect ratio > 100: Unusual but valid (off-road tires can be ~80)

**Comparison warnings:**
- Diameter difference > 3%: Warning "Exceeds recommended tolerance"
- Diameter difference > 5%: Error "Incompatible - will affect speedometer/ABS"

**Mixed units reminder:**
- Display prominently: "Width in mm, diameter in inches (industry standard)"

### 7.3 Maintenance Interval Edge Cases

**Date calculations:**
- Current date < last service date: Error "Invalid - service date is in future"
- Very low km/month (<500): Warning "Low usage - consider time-based intervals"
- Very high km/month (>5000): Warning "High usage - more frequent service recommended"

**Overdue services:**
- Current km > 150% of due km: Critical warning "Service overdue - immediate attention"
- Multiple services due: Sort by priority (oil change > air filter > cabin filter)

**MFK inspection:**
- Vehicle < 3 years old: "First MFK due in X months"
- Vehicle 3-7 years: "MFK due every 2 years"
- Vehicle > 7 years: "MFK due annually (some cantons)"

### 7.4 Lease Calculation Edge Cases

**Residual value:**
- Residual > 80%: Warning "Unusually high - verify with dealer"
- Residual < 30%: Warning "Unusually low for short lease"

**Money factor conversion:**
- Money factor × 2400 = APR equivalent
- Very low APR (<1%): Warning "Verify promotional rate"
- Very high APR (>10%): Warning "High rate - consider negotiating"

**Annual km limits:**
- Typical: 10,000 / 15,000 / 20,000 km/year
- Excess km charge: CHF 0.10 - 0.30 per km
- If user drives >25,000 km/year: Warning "Consider buying instead of leasing"

---

## Section 8: Testing & Verification Strategy

### 8.1 Fuel Efficiency Verification

**Test Cases:**

1. **Standard calculation**
   - Input: 45L used, 600km traveled
   - Expected L/100km: 7.5
   - Expected km/L: 13.33
   - Expected MPG (US): 31.36

2. **Efficient vehicle**
   - Input: 30L used, 800km traveled
   - Expected L/100km: 3.75
   - Expected rating: "Excellent"

3. **Trip planning**
   - Input: 500km trip, 8 L/100km
   - Expected fuel needed: 40L
   - Expected cost (CHF 1.80/L): CHF 72

4. **Annual cost**
   - Input: 15,000 km/year, 7.5 L/100km, CHF 1.80/L
   - Expected annual cost: CHF 2,025

### 8.2 Tire Sizing Verification

**Test Cases:**

1. **Parsing 205/55R16**
   - Width: 205mm
   - Aspect ratio: 55%
   - Rim: 16 inches
   - Sidewall: 112.75mm
   - Diameter: 631.9mm
   - Circumference: 1985.5mm

2. **Parsing 205/55R16 91V**
   - Load index: 91 (615 kg)
   - Speed rating: V (240 km/h)

3. **Comparison: 205/55R16 vs 215/60R16**
   - Diameter difference: +5.14%
   - Speedometer error: Reads 100 → actual 105.14

4. **Edge case: 175/65R14**
   - Sidewall: 113.75mm
   - Diameter: 584.1mm

### 8.3 Maintenance Calculator Verification

**Test Cases:**

1. **Next oil change**
   - Current: 45,000 km
   - Last oil: 30,000 km
   - Interval: 15,000 km
   - Expected next: 45,000 km (DUE NOW)

2. **Date estimation**
   - Current: 45,000 km, Jan 1
   - Monthly avg: 2,000 km
   - Next service: 60,000 km
   - Expected date: ~Jul 15 (7.5 months)

3. **Multiple services**
   - Oil: Due at 45,000
   - Air filter: Due at 50,000
   - Timing belt: Due at 120,000
   - Show sorted by priority

4. **MFK due**
   - Vehicle registered: Jan 2020
   - First MFK: Jan 2023
   - Current: Jan 2026
   - Expected: Next MFK due Jan 2026 (now)

### 8.4 Lease Calculator Verification

**Test Cases:**

1. **Lease payment**
   - Vehicle: CHF 40,000
   - Down: CHF 4,000
   - Residual: 50% (CHF 20,000)
   - APR: 3.6%
   - Term: 36 months
   - Expected monthly: CHF 528.44

2. **Buy vs lease comparison**
   - Loan total: CHF 44,500
   - Lease total: CHF 23,024
   - Recommendation: Depends on keeping vs. upgrading

---

## Section 9: I18n & Translation Keys

### 9.1 Translation Structure

**New Category:**

```json
{
  "categories": {
    "automotive": {
      "name": "Automotive",
      "description": "Vehicle calculators for fuel, tires, maintenance, and financing"
    }
  }
}
```

**Converters Metadata:**

```json
{
  "converters": {
    "fuel-efficiency": {
      "name": "Fuel Efficiency Calculator",
      "description": "Calculate fuel consumption in L/100km, km/L, and MPG",
      "metaDescription": "Free fuel efficiency calculator - L/100km, km/L, MPG conversions and trip cost"
    },
    "tire-sizing": {
      "name": "Tire Size Calculator",
      "description": "Calculate tire dimensions and compare sizes",
      "metaDescription": "Tire size calculator - dimensions, comparison, speedometer error"
    },
    "maintenance-intervals": {
      "name": "Maintenance Intervals Calculator",
      "description": "Track vehicle service schedules and maintenance due dates",
      "metaDescription": "Vehicle maintenance calculator - service intervals and schedule tracker"
    },
    "vehicle-financing": {
      "name": "Vehicle Financing Calculator",
      "description": "Calculate auto loan and lease payments (CHF/EUR)",
      "metaDescription": "Vehicle loan and lease calculator for Switzerland - CHF/EUR support"
    }
  }
}
```

**Calculator Labels:**

```json
{
  "calculator": {
    "automotive": {
      "fuelEfficiency": {
        "distanceTraveled": "Distance Traveled (km)",
        "fuelUsed": "Fuel Used (liters)",
        "fuelPrice": "Fuel Price per Liter",
        "annualDistance": "Annual Distance (km/year)",
        "consumption": "Fuel Consumption",
        "lPer100km": "L/100km",
        "kmPerL": "km/L",
        "mpgUS": "MPG (US)",
        "mpgUK": "MPG (UK)",
        "costPer100km": "Cost per 100km",
        "annualCost": "Annual Fuel Cost",
        "tripFuel": "Fuel Needed for Trip",
        "efficiencyRating": "Efficiency Rating",
        "ratings": {
          "excellent": "Excellent (<5 L/100km)",
          "good": "Good (5-7 L/100km)",
          "average": "Average (7-9 L/100km)",
          "poor": "Poor (>9 L/100km)"
        }
      },
      "tireSizing": {
        "tireSize": "Tire Size",
        "width": "Width (mm)",
        "aspectRatio": "Aspect Ratio (%)",
        "rimDiameter": "Rim Diameter (inches)",
        "loadIndex": "Load Index",
        "speedRating": "Speed Rating",
        "sidewallHeight": "Sidewall Height",
        "overallDiameter": "Overall Diameter",
        "circumference": "Circumference",
        "revolutionsPerKm": "Revolutions per km",
        "maxLoad": "Max Load per Tire",
        "maxSpeed": "Max Speed",
        "compareTire": "Compare with",
        "diameterDifference": "Diameter Difference",
        "speedometerError": "Speedometer Error"
      },
      "maintenance": {
        "currentOdometer": "Current Odometer (km)",
        "lastOilChange": "Last Oil Change (km)",
        "lastService": "Last Major Service",
        "averageMonthlyKm": "Average km/Month",
        "annualKm": "Annual km",
        "vehicleAge": "Vehicle Age (years)",
        "nextOilChange": "Next Oil Change",
        "nextService": "Next Service",
        "upcomingServices": "Upcoming Services",
        "overdueServices": "Overdue Services",
        "mfkDue": "MFK Inspection Due",
        "serviceTypes": {
          "oil": "Oil & Filter",
          "airFilter": "Air Filter",
          "cabinFilter": "Cabin Filter",
          "sparkPlugs": "Spark Plugs",
          "brakeFluid": "Brake Fluid",
          "coolant": "Coolant",
          "timingBelt": "Timing Belt",
          "brakePads": "Brake Pads",
          "tires": "Tires"
        }
      },
      "financing": {
        "mode": "Mode",
        "loan": "Loan",
        "lease": "Lease",
        "vehiclePrice": "Vehicle Price",
        "downPayment": "Down Payment",
        "tradeInValue": "Trade-in Value",
        "interestRate": "Interest Rate",
        "loanTerm": "Loan Term (months)",
        "leaseTerm": "Lease Term (months)",
        "annualKmLimit": "Annual km Limit",
        "residualValue": "Residual Value",
        "moneyFactor": "Money Factor",
        "salesTax": "Sales Tax",
        "monthlyPayment": "Monthly Payment",
        "totalCost": "Total Cost",
        "totalInterest": "Total Interest",
        "amortizationSchedule": "Amortization Schedule",
        "buyVsLease": "Buy vs Lease Comparison"
      },
      "currency": "Currency",
      "chf": "Swiss Franc (CHF)",
      "eur": "Euro (EUR)"
    }
  }
}
```

### 9.2 Language-Specific Considerations

**German (de):**
- "Kraftstoffverbrauch" (fuel consumption)
- "Reifengröße" (tire size)
- "Wartungsintervalle" (maintenance intervals)
- "Fahrzeugfinanzierung" (vehicle financing)
- "MFK" (Swiss German, understood in Switzerland)

**French (fr):**
- "Consommation de carburant" (fuel consumption)
- "Dimension des pneus" (tire size)
- "Intervalles d'entretien" (maintenance intervals)
- "Financement automobile" (vehicle financing)
- "Contrôle technique" (MFK equivalent)

**Italian (it):**
- "Consumo di carburante" (fuel consumption)
- "Dimensione pneumatici" (tire size)
- "Intervalli di manutenzione" (maintenance intervals)
- "Finanziamento veicoli" (vehicle financing)
- "Revisione periodica" (MFK equivalent)

---

## Section 10: Open Questions

Things that couldn't be fully resolved:

1. **Swiss canton-specific MFK rules**
   - What we know: First at 3 years, then every 2 years
   - What's unclear: Some cantons require annual for vehicles >7 years
   - Recommendation: Use most common (2-year) with note about canton variations

2. **Electric vehicle considerations**
   - What we know: EVs measure in kWh/100km, not L/100km
   - What's unclear: Should fuel calculator support EV mode?
   - Recommendation: Phase 20 focuses on combustion engines, add EV in future phase

3. **Lease early termination**
   - What we know: Leases can be terminated early with penalties
   - What's unclear: Standard penalty formulas vary by dealer
   - Recommendation: Not included in MVP, too complex/variable

4. **Tire pressure calculations**
   - What we know: Load index relates to pressure requirements
   - What's unclear: Should calculator include pressure recommendations?
   - Recommendation: Out of scope for MVP, focused on sizing only

5. **Regional fuel price APIs**
   - What we know: Real-time fuel prices available from some Swiss providers
   - What's unclear: Free API availability for static export
   - Recommendation: Use static default prices, user can override

---

## Section 11: Recommendations for Phase Planning

### 11.1 MVP Scope (Recommended)

**Must Include (Core):**

1. ✅ **Fuel Efficiency Calculator**
   - L/100km ↔ km/L ↔ MPG conversions
   - Trip cost calculations
   - Annual cost estimates
   - CHF/EUR currency support
   - Efficiency ratings

2. ✅ **Tire Sizing Calculator**
   - Tire notation parsing (205/55R16)
   - Dimension calculations
   - Size comparison
   - Load index and speed rating lookup
   - Speedometer error calculation

3. ✅ **Maintenance Intervals Calculator**
   - Service schedule tracking
   - Next service predictions
   - Date and km-based intervals
   - Swiss MFK reminders
   - Overdue service warnings

4. ✅ **Vehicle Financing Calculator**
   - Loan calculations (reuse/enhance auto-loan)
   - Lease calculations (NEW)
   - CHF/EUR support
   - Buy vs lease comparison
   - Swiss tax defaults (7.7%)

**Can Skip (Nice-to-Have):**

1. ❌ **Electric vehicle mode** (fuel efficiency)
   - Reason: Different metric (kWh/100km), separate calculator
   - Future: Phase for EV-specific calculators

2. ❌ **Real-time fuel price API**
   - Reason: Static export constraint
   - Alternative: Default prices with manual override

3. ❌ **Tire pressure calculator**
   - Reason: Adds complexity, lower value
   - Alternative: External reference or future enhancement

**Quality Requirements:**
- Full i18n (en/fr/de/it)
- URL state persistence
- Mobile responsive
- Input validation with helpful errors
- Swiss/European context (metric-first)

### 11.2 Bundle Cost Summary

- New code: ~6 KB gzipped
- Data files: ~5-10 KB
- No new dependencies
- **Total impact: ~11-16 KB (<1% increase)**

### 11.3 Complexity Estimate

| Calculator | Complexity (1-10) | Time Estimate |
|------------|-------------------|---------------|
| Fuel Efficiency | 4/10 | 3-4 hours |
| Tire Sizing | 5/10 | 4-5 hours |
| Maintenance Intervals | 6/10 | 5-6 hours |
| Vehicle Financing | 5/10 | 4-5 hours |
| **Total (4 calculators)** | — | **16-20 hours** |

**Additional Time:**
- i18n translations: 2-3 hours
- Testing & QA: 3-4 hours
- Data file creation: 1-2 hours
- New category setup: 1 hour
- **Grand Total: 23-30 hours**

---

## Section 12: Critical Success Factors

### 12.1 Must-Have Features

1. ✅ **Metric-First Approach**
   - L/100km primary (not MPG)
   - Kilometers (not miles)
   - European tire standards
   - CHF/EUR currency

2. ✅ **Accurate Formulas**
   - Fuel efficiency conversions match industry standards
   - Tire calculations match ETRTO specifications
   - Lease formulas match financial industry standards

3. ✅ **Swiss Context**
   - MFK inspection reminders
   - Swiss fuel prices as defaults
   - 7.7% VAT for vehicles
   - Canton-aware (where applicable)

4. ✅ **User-Friendly**
   - Clear input labels
   - Helpful error messages
   - Efficiency ratings ("Good", "Average")
   - Warnings for edge cases

### 12.2 Definition of Done

- [ ] All 4 core calculators implemented and tested
- [ ] Automotive category created and registered
- [ ] L/100km ↔ km/L ↔ MPG conversions verified
- [ ] Tire notation parser handles standard formats
- [ ] Maintenance interval data accurate for Swiss/EU standards
- [ ] Lease calculation formulas verified
- [ ] CHF/EUR currency support working
- [ ] i18n complete (en/fr/de/it)
- [ ] URL state persistence works
- [ ] Mobile responsive (tested on iOS/Android)
- [ ] Code reviewed and meets style guide
- [ ] Documentation updated (CALCULATOR_GUIDE.md)
- [ ] Registry entries added
- [ ] Search keywords optimized

---

## RESEARCH COMPLETE

All research areas have been thoroughly investigated. Phase 20 is ready to move to planning phase.

### Key Takeaways

1. ✅ All calculators are technically feasible with static export
2. ✅ Metric-first approach aligns with European/Swiss standards
3. ✅ No new dependencies required (~0 KB bundle impact)
4. ✅ Static data approach is appropriate (tire tables, service intervals)
5. ✅ Automotive category needs to be created (currently in finance)
6. ✅ Formulas are standard and well-documented
7. ✅ Existing auto-loan calculator can be referenced for loan logic
8. ✅ Clear implementation strategy (4 calculators, 23-30 hours)
9. ❌ No blockers identified
10. ✅ Ready to move to PLAN phase

### Recommended Implementation

**Phase 20.1:** Fuel Efficiency Calculator (L/100km, conversions, costs)
**Phase 20.2:** Tire Sizing Calculator (notation parsing, dimensions, comparison)
**Phase 20.3:** Maintenance Intervals Calculator (service tracking, MFK reminders)
**Phase 20.4:** Vehicle Financing Calculator (loan/lease with CHF/EUR support)

**Category Creation:** New "automotive" category with Car icon from lucide-react

---

## Sources

### Fuel Efficiency Calculations
- [L/100km to MPG conversion formula](https://www.unitjuggler.com/convert-fuelconsumption-from-l100km-to-mpgUS.html)
- [European fuel consumption standards](https://ec.europa.eu/commission/presscorner/detail/en/qanda_23_6842)
- Swiss fuel price averages - TCS (Touring Club Switzerland)
- [Fuel economy calculations](https://www.calculator.net/fuel-calculator.html)

### Tire Sizing Standards
- [ETRTO (European Tyre and Rim Technical Organisation) Standards](https://www.etrto.org/)
- [Tire size calculator and explanations](https://tiresize.com/calculator/)
- [Load index and speed rating tables](https://www.tyresafe.org/tyre-safety/choosing-tyres/load-speed-rating/)
- [Tire dimension calculations](https://www.tirerack.com/tires/tiretech/techpage.jsp?techid=46)

### Maintenance Intervals
- Swiss vehicle maintenance standards - UPSA (Union Professionnelle Suisse de l'Automobile)
- [MFK inspection requirements Switzerland](https://www.ch.ch/en/vehicles-and-traffic/road-vehicles/vehicle-checks/)
- European maintenance interval standards
- [Service interval calculator methodology](https://www.yourmechanic.com/article/how-to-calculate-your-car-s-maintenance-schedule)

### Vehicle Financing
- [Lease payment formula](https://www.investopedia.com/articles/personal-finance/050714/how-calculate-interest-charge-car-lease.asp)
- [Auto loan calculation formulas](https://www.calculator.net/auto-loan-calculator.html)
- Swiss vehicle financing rates - Comparis.ch
- [Lease vs buy comparison](https://www.edmunds.com/car-leasing/calculate-your-own-lease-payment.html)
- Existing codebase: `src/lib/converters/finance/auto-loan.ts`

### Swiss Automotive Context
- Swiss Federal Roads Office (FEDRO) - vehicle regulations
- TCS Switzerland - fuel prices and vehicle guides
- Swiss VAT rate for vehicles: 7.7% (Federal Tax Administration)
- Canton-specific MFK rules - cantonal motor vehicle offices

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Using established Converty patterns, no new dependencies
- Architecture: HIGH - Following existing calculator structure from phases 17-19
- Formulas: HIGH - Industry-standard formulas verified across multiple sources
- Swiss context: HIGH - Swiss MFK, fuel prices, VAT rates verified
- Data requirements: MEDIUM - Static data approach suitable, curation needed
- Edge cases: HIGH - Well-documented automotive calculation pitfalls

**Research date:** 2026-01-24
**Valid until:** 2026-04-24 (90 days - automotive standards stable, fuel prices update quarterly)

**Implementation priority:**
1. Fuel Efficiency Calculator (simplest formulas, high value)
2. Tire Sizing Calculator (moderate complexity, unique feature)
3. Maintenance Intervals Calculator (date calculations, service tracking)
4. Vehicle Financing Calculator (enhance existing patterns, add lease)

**Estimated total time:** 23-30 hours including all 4 calculators, i18n, testing, and documentation
