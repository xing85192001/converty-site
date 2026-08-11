---
phase: 17
plan: 03
subsystem: crypto
tags: [crypto, exchange, rate, conversion, coingecko, bitcoin, ethereum]
requires: [17-02-wallet-validator]
provides: [exchange-rate-calculator, crypto-price-data]
affects: [17-04-qr-code]
tech-stack:
  added: []
  patterns: [build-time-data-fetching, static-price-data]
key-files:
  created:
    - scripts/fetch-crypto-prices.ts
    - src/lib/data/crypto-prices.json
    - src/lib/converters/crypto/exchange-rate.ts
    - src/stores/exchange-rate-store.ts
    - src/app/[locale]/crypto/exchange-rate/page.tsx
    - src/app/[locale]/crypto/exchange-rate/exchange-rate-calculator.tsx
  modified:
    - package.json
    - src/lib/converters/crypto/index.ts
    - src/lib/registry/crypto-converters.ts
    - src/messages/en.json
    - src/messages/fr.json
    - src/messages/de.json
    - src/messages/it.json
decisions:
  - slug: build-time-price-fetch
    title: Fetch crypto prices at build time instead of runtime
    rationale: Static export mode prevents runtime API calls, build-time fetch ensures fresh prices without API quota issues
  - slug: coingecko-free-api
    title: Use CoinGecko free API for price data
    rationale: Reliable, no API key required, supports all needed cryptocurrencies and fiat currencies
  - slug: fallback-prices
    title: Include fallback prices if API unavailable
    rationale: Build should never fail due to API issues, fallback ensures calculator always works
  - slug: stale-price-warning
    title: Show warning when price data is older than 24 hours
    rationale: Users should know when prices may be outdated, encourages site rebuild for fresh data
metrics:
  duration: 6.4 min
  completed: 2026-01-24
---

# Phase 17 Plan 03: Exchange Rate Calculator Summary

**One-liner:** Crypto to fiat exchange rate calculator with BTC/ETH/LTC/XRP/DOGE/ADA support and build-time CoinGecko price fetching

## What Was Built

Created a comprehensive cryptocurrency exchange rate calculator that converts between 6 major cryptocurrencies and 3 fiat currencies (CHF, EUR, USD).

### Key Features

1. **Build-time Price Fetching**
   - Script fetches live prices from CoinGecko API during build
   - Automatic integration into `npm run prebuild` pipeline
   - Fallback to reasonable default prices if API unavailable
   - Manual fetch available via `npm run fetch-crypto-prices`

2. **Exchange Rate Calculation**
   - Convert crypto amounts to fiat currencies (CHF, EUR, USD)
   - Reverse conversion (fiat to crypto) support
   - Adaptive decimal formatting (2-8 places for crypto, 2 for fiat)
   - Exchange rate and inverse rate display

3. **Price Freshness Tracking**
   - Timestamp and source attribution for all prices
   - Staleness detection (flags data older than 24 hours)
   - Visual warning when prices are outdated
   - Price age display in hours

4. **Supported Cryptocurrencies**
   - Bitcoin (BTC)
   - Ethereum (ETH)
   - Litecoin (LTC)
   - Ripple (XRP)
   - Dogecoin (DOGE)
   - Cardano (ADA)

5. **URL State Persistence**
   - Amount, crypto, and fiat synced to URL
   - Shareable calculator states
   - 300ms debounce for smooth updates

### Technical Implementation

**Build Pipeline:**

```bash
npm run prebuild
  → fetch-crypto-prices.ts → crypto-prices.json
  → generate-search-index.ts
```

**Data Flow:**

1. Build-time: Fetch prices from CoinGecko → save to JSON
2. Runtime: Import static JSON → convert amounts → display results
3. No runtime API calls (compatible with static export)

**Files Created:**

- `scripts/fetch-crypto-prices.ts` - Build-time price fetch script (172 lines)
- `src/lib/data/crypto-prices.json` - Static price data with timestamp
- `src/lib/converters/crypto/exchange-rate.ts` - Calculation logic (185 lines)
- `src/stores/exchange-rate-store.ts` - Zustand store with URL sync (138 lines)
- `src/app/[locale]/crypto/exchange-rate/page.tsx` - Page component (63 lines)
- `src/app/[locale]/crypto/exchange-rate/exchange-rate-calculator.tsx` - UI (181 lines)

**Registry & Translations:**

- Added to `crypto-converters.ts` with `featured: true`
- Translations in all 4 locales (en, fr, de, it)
- 18 translation keys in `calculator.crypto.exchange` namespace

## Decisions Made

### Build-Time Price Fetching

**Context:** Static export mode prevents runtime API calls, but users need current prices.

**Options:**

1. Client-side API calls (breaks static export)
2. Build-time fetch with static JSON (chosen)
3. Hardcoded prices only (no freshness)

**Decision:** Build-time fetch with fallback

- Fetches fresh prices during build
- Falls back to reasonable defaults if API unavailable
- Build never fails due to API issues
- Price freshness tracked with timestamp

### CoinGecko Free API

**Context:** Need reliable price data for 6 cryptocurrencies in 3 fiat currencies.

**Decision:** Use CoinGecko free tier

- No API key required (simpler setup)
- Supports all needed currencies
- Reliable uptime
- Rate limits acceptable for build-time use

**Endpoint:** `https://api.coingecko.com/api/v3/simple/price`

### Staleness Warning Display

**Context:** Prices fetched at build time can become outdated.

**Decision:** Show red warning card when data > 24 hours old

- Visual indicator (AlertTriangle icon)
- Clear message: "Price Data May Be Outdated"
- Guidance: "Rebuild the site to fetch fresh prices"
- Helps users understand price reliability

## Requirements Satisfied

✅ **CRYPT-03:** Exchange rate calculator supports BTC, ETH, LTC, XRP, DOGE, ADA
✅ **Swiss/European focus:** CHF and EUR as primary fiat currencies
✅ **Build-time data:** Prices fetched during build from CoinGecko
✅ **Price transparency:** Timestamp and source displayed
✅ **Staleness detection:** Warning when data older than 24 hours
✅ **URL persistence:** Calculator state syncs to URL for sharing
✅ **i18n:** All 4 locales have complete translations

## Tasks Completed

| Task | Description | Commit | Files |
|------|-------------|--------|-------|
| 1 | Build-time price fetch script | 62eb3f9 | scripts/fetch-crypto-prices.ts, crypto-prices.json, package.json |
| 2 | Exchange rate calculation logic | 285e724 | exchange-rate.ts, index.ts |
| 3 | Zustand store with URL sync | 8df006f | exchange-rate-store.ts |
| 4 | UI components and page | 5a04dbe | page.tsx, exchange-rate-calculator.tsx |
| 5 | Registry entry and translations | 7459e8e | crypto-converters.ts, en/fr/de/it.json |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed ConverterLayout props**

- **Found during:** Task 4 verification (TypeScript check)
- **Issue:** page.tsx used non-existent `backLink` and `backLabel` props
- **Fix:** Updated to use `category` and `categoryName` props (pattern from hash calculator)
- **Files modified:** page.tsx
- **Commit:** Amended into Task 5 commit (7459e8e)

## Testing Performed

**Functional Tests:**

- ✅ 1 BTC → CHF shows correct conversion (~69,822 CHF at current rates)
- ✅ 1 ETH → EUR shows correct conversion with inverse rate
- ✅ Price source and timestamp displayed ("CoinGecko, last updated...")
- ✅ Stale warning appears when data is old (tested by modifying timestamp)
- ✅ Amount/crypto/fiat persist to URL and restore on page load
- ✅ All 4 locales display proper translations

**Build Tests:**

- ✅ `npm run fetch-crypto-prices` successfully fetches live prices
- ✅ TypeScript compilation passes with no errors
- ✅ Price fetch integrated into prebuild pipeline

**Price Data Verification:**

```json
{
  "timestamp": "2026-01-24T07:12:26.378Z",
  "source": "coingecko",
  "prices": {
    "bitcoin": { "chf": 69822, "eur": 75681, "usd": 89516 },
    "ethereum": { "chf": 2306, "eur": 2499.52, "usd": 2956.44 }
    // ... other currencies
  }
}
```

## Known Limitations

1. **Price Freshness:** Prices update only on rebuild, not in real-time
2. **API Rate Limits:** CoinGecko free tier has rate limits (acceptable for build-time use)
3. **Supported Currencies:** Limited to 6 cryptocurrencies and 3 fiat currencies
4. **No Historical Data:** Only current prices, no price charts or history

## Next Phase Readiness

**Phase 17-04 (QR Code Generator) can proceed:**

- ✅ Crypto category established with 3 calculators
- ✅ Pattern for crypto-specific UI components clear
- ✅ Translation structure for calculator.crypto.* namespace consistent

**Dependencies:**

- Exchange rate calculator is independent
- Provides pricing context for future crypto calculators

**Technical Debt:** None

## Blockers/Concerns

None. Plan executed successfully with one auto-fixed bug (ConverterLayout props).

## Performance

**Execution:** 6.4 minutes (5 tasks)
**Lines Added:** ~920 (TypeScript, JSON)
**Commits:** 5 atomic commits
**Build Impact:** +1 script to prebuild, ~30KB JSON data

---

**Related:** 17-01-hash-calculator, 17-02-wallet-validator
**Next:** 17-04-qr-code or other v3.0 phases
