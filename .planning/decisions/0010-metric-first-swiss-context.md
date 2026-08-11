# Metric-First Design with Swiss/European Context

- **Status:** accepted
- **Date:** 2026-01-17
- **Deciders:** Project team

## Context and Problem Statement

Converty was initially built with some US-centric defaults (miles, Fahrenheit, USD, imperial units, salary in USD) that create friction for the primary target users in Switzerland and Europe. Unit defaults, currency symbols, and reference data need a clear policy to avoid inconsistency across 200+ calculators.

What unit system and regional defaults should Converty use?

## Decision Drivers

- **Primary user base is Switzerland/Europe** — Metric system is standard in all target markets
- **Consistency across calculators** — Unit defaults should not vary arbitrarily between calculators
- **Not US-centric** — Avoid defaulting to miles, pounds, Fahrenheit, or USD
- **Imperial conversions still useful** — Many professional contexts still reference imperial (construction, photography)
- **Currency** — CHF and EUR are primary; USD secondary
- **Driving** — km/h and L/100km are Swiss standards (not mph or MPG)

## Considered Options

1. **Metric-first, imperial available as secondary** — Default to metric, provide imperial toggle/conversion
2. **Dual display (metric + imperial always shown)** — Show both simultaneously
3. **User preference setting** — Let users pick their unit system globally
4. **Context-dependent defaults** — Each calculator decides independently

## Decision Outcome

Chosen option: **"Metric-first, imperial available as secondary"** because metric is the legal standard in Switzerland and the EU, and adding imperial as a secondary option satisfies users with cross-context needs (e.g., US server hardware rack units, photography focal lengths).

### Metric-First Policy

| Domain | Primary (default) | Secondary (available) |
|--------|------------------|----------------------|
| Length | km, m, cm, mm | miles, feet, inches |
| Mass/Weight | kg, g | lb, oz |
| Temperature | °C | °F |
| Volume (liquid) | L, mL | US fl oz, gallons |
| Speed | km/h | mph |
| Fuel efficiency | L/100km | MPG (US/UK) |
| Currency | CHF, EUR | USD |
| Area | m², ha | sq ft, acres |
| Pressure | bar, kPa | PSI |

### Consequences

**Positive:**

- **Consistent UX:** Users from CH/EU never have to change units — defaults match their mental model
- **Regulatory compliance:** EU commerce regulations require metric units
- **Simplified defaults:** One clear answer for "what unit should I default to?"

**Negative:**

- **US users need to switch units:** American users see L/100km instead of MPG by default
- **Some professional tools use imperial:** Engineering (inches for bolts), photography (inches for print sizes)
- **Ongoing vigilance required:** New calculators must follow the policy; code review checks defaults

**Neutral:**

- **Imperial conversions always available** where relevant — the policy is about *defaults*, not exclusion
- **Number formatting** follows European convention (period as decimal separator in some locales)

### Out-of-Scope Removals

In v3.0, the Salary Calculator was removed because:
- It defaulted to USD and US pay periods
- US-centric tax brackets and deductions had no European equivalent
- Reimplementing for CHF/EUR would require complete rewrite

This removal established the precedent: calculators that fundamentally cannot be adapted to metric/European context are out of scope.

## Links

- **v3.0 removal:** Salary Calculator removed for US-centric design
- **Automotive calculators:** `src/lib/converters/automotive/` — L/100km primary
- **Cooking calculators:** `src/lib/converters/cooking/` — grams and mL primary
- **Finance calculators:** CHF/EUR-first defaults
