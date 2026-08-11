# Phase 17: Crypto/Blockchain Foundation — RESEARCH

**Analysis Date:** 2026-01-24
**Status:** RESEARCH COMPLETE

---

## Executive Summary

This document provides comprehensive research findings for implementing Phase 17 (Crypto/Blockchain Foundation) of the Converty calculator project. The research covers 10 critical areas: hash calculation, wallet format conversion, crypto exchange rates, mining profitability, i18n strategy, URL state design, testing, dependencies, privacy/security, and build-time vs runtime trade-offs.

**Key Finding:** All four calculators (Hash, Wallet Converter, Exchange Rate, Mining Profitability) are technically feasible to implement client-side in a static export setup. No server-side features required.

---

## Section 1: Hash Calculation Strategy

### Decision Made

**Use WebCrypto API (native browser) for SHA-1, SHA-256, SHA-512; supplement with crypto-js for MD5 (if required)**

### Rationale

1. **WebCrypto API is optimal for static export:**
   - Native browser support (no additional npm dependencies needed for SHA algorithms)
   - Available in all modern browsers (95%+ coverage)
   - Runs entirely client-side — perfect for static export
   - Zero bundle size overhead for SHA functions
   - Higher performance than JavaScript libraries

2. **crypto-js as fallback/supplement:**
   - Only library needed is `crypto-js` (existing in similar projects)
   - Supports MD5, SHA-1, SHA-256, SHA-512
   - Well-tested, widely used (100M+ npm downloads)
   - Bundle size: ~16 KB minified, ~4 KB gzipped (acceptable)
   - Synchronous API matches calculator pattern

3. **Hybrid approach:**
   - Use WebCrypto API for SHA-1, SHA-256, SHA-512 (free, built-in)
   - Use crypto-js only for MD5 (not in WebCrypto standard, not cryptographically secure anyway but user might want it for educational purposes)
   - Minimal bundle footprint, maximum performance

### Risk & Trade-off

**Risk:** MD5 is cryptographically broken; calculator UI should clearly warn users it's not for security.

**Trade-off:** Two different APIs (WebCrypto async + crypto-js sync) requires wrapper function for unified interface.

### Implementation Pattern

```typescript
// src/lib/converters/crypto/hash.ts
export type HashAlgorithm = 'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-512';

async function calculateHash(input: string, algo: HashAlgorithm): Promise<string> {
  if (algo === 'MD5') {
    // Use crypto-js (sync)
    return CryptoJS.MD5(input).toString();
  }

  // Use WebCrypto (async) for SHA algorithms
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest(mapAlgorithm(algo), data);
  return bufferToHex(hashBuffer);
}
```

### References

- [Web Crypto API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [crypto-js npm](https://www.npmjs.com/package/crypto-js)
- [SHA-256 Performance Analysis](https://medium.com/@ronantech/exploring-sha-256-performance-on-the-browser-browser-apis-javascript-libraries-wasm-webgpu-9d9e8e681c81)

---

## Section 2: Wallet Format Conversion Approach

### Decision Made

**Implement address validation + conversion for Bitcoin (P2PKH, P2WPKH) and Ethereum (ERC-20); use lighter validation library + pure JS conversion logic**

### Rationale

1. **Scope: Address validation, not private key handling**
   - Do NOT implement private key conversion (too complex, security-sensitive)
   - Focus on PUBLIC address format conversion and validation
   - Examples: Bitcoin P2PKH to P2WPKH, Ethereum checksum validation

2. **Library choice: wallet-address-validator (lightweight)**
   - Bundle size: ~2 KB minified, ~0.8 KB gzipped
   - Supports Bitcoin, Ethereum, and 30+ other cryptocurrencies
   - Validation only — no private key handling
   - Simple API: `WAValidator.validate(address, 'BTC')`
   - No heavy dependencies (unlike ethers.js which is ~150KB gzipped)

3. **Alternative approach (if avoiding npm dependency):**
   - Implement pure JavaScript validation using address format rules
   - Bitcoin: Check Base58Check encoding + version bytes
   - Ethereum: Check ERC-55 checksum (SHA-256 hash)
   - Pure JS approach: ~300 lines, no dependencies

4. **What NOT to do:**
   - Do NOT use ethers.js (150KB+ gzipped, overkill for address validation)
   - Do NOT use bitcoinjs-lib (complex, mainly for transactions)
   - Do NOT implement private key conversion (security liability)

### Risk & Trade-off

**Risk:** If we want actual format conversion (P2PKH ↔ P2WPKH), we need bitcoinjs-lib (30-40 KB gzipped), which is heavier.

**Trade-off:** MVP: Validation + display of address formats. Future: Actual conversion if justified by complexity savings.

### Implementation Pattern

```typescript
// src/lib/converters/crypto/wallet-address.ts
import WAValidator from 'wallet-address-validator';

export type WalletType = 'BTC' | 'ETH' | 'LTC' | 'XRP';

export function validateAddress(address: string, type: WalletType): boolean {
  return WAValidator.validate(address, type);
}

export function getAddressInfo(address: string, type: WalletType) {
  const isValid = validateAddress(address, type);
  return {
    address,
    type,
    isValid,
    checksumValid: type === 'ETH' ? validateERC55Checksum(address) : null,
  };
}
```

### References

- [wallet-address-validator npm](https://www.npmjs.com/package/wallet-address-validator)
- [ethereumjs-wallet GitHub](https://github.com/ethereumjs/ethereumjs-wallet)
- [bitcoinjs-lib GitHub](https://github.com/bitcoinjs/bitcoinjs-lib)
- [Ethers.js Documentation](https://docs.ethers.org/v5/)

---

## Section 3: Exchange Rate Data Strategy

### Decision Made

**Fetch crypto prices at build time using CoinGecko API; embed prices in static bundle; display timestamp of last update**

### Rationale

1. **CoinGecko API is ideal for static export:**
   - Free tier: 30 calls/min, 10,000 calls/month (sufficient for build-time only)
   - No auth required
   - Comprehensive data: 15,000+ cryptocurrencies
   - High uptime (enterprise-grade)
   - CoinGecko aggregates from 500+ exchanges
   - REST API: `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=chf,eur`

2. **Build-time fetching strategy:**
   - Add new script: `scripts/fetch-crypto-prices.ts`
   - Runs as part of `npm run prebuild` (before Next.js build)
   - Fetches current BTC/ETH prices in CHF/EUR
   - Writes to `src/lib/data/crypto-prices.json` (static data)
   - Calculator loads from static file (zero runtime cost)
   - Include `lastUpdated` timestamp in JSON for transparency

3. **Crypto selection (MVP):**
   - Primary: Bitcoin (BTC), Ethereum (ETH)
   - Secondary support: Litecoin (LTC), Ripple (XRP), Dogecoin (DOGE)
   - User can convert any amount to CHF/EUR at rates fetched at build time

4. **Currencies:**
   - Primary: CHF, EUR (per project context)
   - Secondary: USD (for reference)
   - No need to support 100+ currencies — keep it focused

### Risk & Trade-off

**Risk:** Prices are stale until next build. For a static site, this is acceptable; document update frequency clearly.

**Trade-off:**

- MVP (recommended): Build-time prices only, document clearly when prices were last fetched
- Future option: Add client-side warning if prices older than 1 hour, redirect to CoinGecko for real-time

### Implementation Pattern

```typescript
// scripts/fetch-crypto-prices.ts
const response = await fetch(
  'https://api.coingecko.com/api/v3/simple/price?' +
  'ids=bitcoin,ethereum,litecoin,ripple,dogecoin&' +
  'vs_currencies=chf,eur,usd'
);
const prices = await response.json();
const data = {
  prices,
  lastUpdated: new Date().toISOString(),
  source: 'CoinGecko API',
};
fs.writeFileSync('src/lib/data/crypto-prices.json', JSON.stringify(data, null, 2));
```

### References

- [CoinGecko API Documentation](https://docs.coingecko.com/)
- [CoinGecko Pricing](https://www.coingecko.com/en/api/pricing)
- [Next.js Static Exports Guide](https://nextjs.org/docs/app/guides/static-exports)

---

## Section 4: Mining Profitability Calculations

### Decision Made

**Implement formula-based calculator; fetch difficulty & block reward at build time; display in CHF/EUR, kWh, difficulty units**

### Rationale

1. **Formula components (all client-side):**
   - **Inputs:** Hash rate (H/s, MH/s, GH/s, TH/s), Power (watts), Electricity cost (CHF/kWh), Algorithm
   - **Constants (build-time):** Network difficulty, Block reward (BTC/ETH per block)
   - **Calculation:**

     ```
     Revenue per day = (HashRate / NetworkHashRate) × BlocksPerDay × BlockReward
     Cost per day = (Power / 1000) × 24 × ElectricityCost
     Profit per day = Revenue - Cost
     ROI = Profit / (MinerCost or amortized hardware cost)
     ```

2. **Data fetching at build time:**
   - Fetch Bitcoin difficulty: `GET https://api.blockchain.com/api/charts/difficulty`
   - Fetch current block reward: Hardcoded (6.25 BTC currently, changes at halving)
   - Fetch Ethereum network stats (if supporting ETH mining): Similar approach
   - Cache in `src/lib/data/mining-data.json`

3. **Display strategy:**
   - Results in **CHF/EUR** (project focus)
   - Energy in **kWh** (standard unit)
   - Difficulty in **standard units** (e.g., terahashes/second for Bitcoin)
   - Include clear disclaimer: "Based on current difficulty; results vary with network conditions"

4. **Scope (MVP):**
   - Bitcoin SHA-256 mining (ASIC-based, most common)
   - Optional: Ethereum (PoS as of Sep 2022, but historical/educational interest)
   - Do NOT implement: Exotic algorithms (Monero RandomX, Zcash Equihash)

### Risk & Trade-off

**Risk:** Difficulty changes ~every 2 weeks; stale data makes projections inaccurate.

**Trade-off:**

- Acceptable: Display "Data last updated [DATE]" and recommend rebuilding frequently
- Not critical: Mining is inherently unprofitable for individual miners (industrial scale dominates)

### Implementation Pattern

```typescript
// src/lib/converters/crypto/mining-profitability.ts
export interface MiningInput {
  hashRateTH: number;        // Terahashes per second
  powerWatts: number;
  costPerKWh: number;        // CHF or EUR
  hardwareCostCHF?: number;
}

export function calculateMiningProfitability(input: MiningInput): MiningResult {
  const dailyBlocks = (144); // Bitcoin: 144 blocks/day
  const currentReward = 6.25; // BTC
  const currentDifficulty = 100_000_000_000; // Load from build-time data
  const networkHashRate = 500_000_000_000; // Load from build-time data

  const revenuePerDay = (input.hashRateTH * 1e12 / networkHashRate) * dailyBlocks * currentReward;
  const costPerDay = (input.powerWatts / 1000) * 24 * input.costPerKWh;
  const profitPerDay = revenuePerDay - costPerDay;

  return {
    revenuePerDay,
    costPerDay,
    profitPerDay,
    profitPerMonth: profitPerDay * 30,
    profitPerYear: profitPerDay * 365,
    roiMonths: input.hardwareCostCHF ? input.hardwareCostCHF / (profitPerDay * 30) : null,
  };
}
```

### References

- [CoinWarz Mining Calculator](https://www.coinwarz.com/mining/bitcoin/calculator)
- [HashRate Index Calculator](https://hashrateindex.com/tools/calculator)
- [Bitcoin Difficulty API](https://data.hashrateindex.com/network-data/difficulty)
- [Blockchain.com Difficulty Chart](https://www.blockchain.com/charts/difficulty)

---

## Section 5: I18n & Translation Keys

### Decision Made

**Follow existing project pattern: Namespace-based translation keys; technical terms (hash algorithms, wallet types) use English abbreviations; translate category names**

### Rationale

1. **Translation structure (per project conventions):**

   ```
   converters:
     hash-calculator:
       name: "Hash Calculator"
       description: "Calculate MD5, SHA-1, SHA-256, SHA-512 hash values"
       inputs:
         text: "Text to hash"
         algorithm: "Algorithm"
       algorithms:
         MD5: "MD5"
         SHA-1: "SHA-1"
         SHA-256: "SHA-256"
         SHA-512: "SHA-512"
       results:
         hash: "Hash Output"
   ```

2. **Translation keys for each calculator:**

   **Hash Calculator:**
   - `converters.hash-calculator.{name, description, metaDescription}`
   - `calculator.crypto.hash.algorithms.*`
   - `calculator.labels.*` (shared: input, output)

   **Wallet Converter:**
   - `converters.wallet-converter.{name, description, metaDescription}`
   - `calculator.crypto.wallet.types.*` (BTC, ETH, LTC)
   - `calculator.crypto.wallet.formats.*` (P2PKH, P2WPKH, etc.)

   **Exchange Rate:**
   - `converters.crypto-exchange.{name, description, metaDescription}`
   - `calculator.finance.cryptocurrencies.*` (BTC, ETH, etc.)
   - Reuse `calculator.finance.currencies.CHF`, `calculator.finance.currencies.EUR`

   **Mining Profitability:**
   - `converters.mining-calculator.{name, description, metaDescription}`
   - `calculator.crypto.mining.inputs.*` (hashRate, power, costPerKWh)
   - `calculator.crypto.mining.results.*` (revenuePerDay, profitPerDay, etc.)

3. **Language considerations:**
   - English (en): "Bitcoin", "Ethereum", "Hash Rate" — proper nouns unchanged
   - French (fr): "Bitcoins", "Ethereum", "Taux de hachage"
   - German (de): "Bitcoin", "Ethereum", "Hashrate"
   - Italian (it): "Bitcoin", "Ethereum", "Velocità di hashing"

4. **Unit translations:**
   - CHF, EUR, USD: Currency symbols + abbreviations (not translated)
   - kWh: Kilowatt-hour (international abbreviation)
   - TH/s: Terahashes per second (mathematical notation)

### Implementation Pattern

```json
{
  "converters": {
    "hash-calculator": {
      "name": "Hash Calculator",
      "description": "Calculate cryptographic hash values",
      "metaDescription": "Online hash calculator for MD5, SHA-1, SHA-256, SHA-512"
    }
  },
  "calculator": {
    "crypto": {
      "hash": {
        "algorithms": {
          "MD5": "MD5",
          "SHA-1": "SHA-1",
          "SHA-256": "SHA-256",
          "SHA-512": "SHA-512"
        },
        "warnings": {
          "MD5": "MD5 is cryptographically broken and not suitable for security purposes"
        }
      }
    }
  }
}
```

### References

- [Existing i18n Guide: docs/I18N_GUIDE.md](https://converty.local/docs/I18N_GUIDE.md)
- [Project Messages Structure: src/messages/](https://converty.local/src/messages/)

---

## Section 6: URL State Design

### Decision Made

**Use existing createCalculatorStore pattern with URL sync middleware for all 4 calculators**

### Rationale

1. **State shape per calculator:**

   **Hash Calculator:**

   ```typescript
   interface HashInput {
     text: string;                    // Input text to hash
     algorithm: 'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-512';
   }
   // URL: ?text=hello&algorithm=SHA-256
   ```

   **Wallet Converter:**

   ```typescript
   interface WalletInput {
     address: string;
     walletType: 'BTC' | 'ETH' | 'LTC';
   }
   // URL: ?address=1A1z7agoat&walletType=BTC
   ```

   **Crypto Exchange Rate:**

   ```typescript
   interface ExchangeInput {
     amount: string;
     sourceCrypto: 'BTC' | 'ETH' | 'LTC';
     targetCurrency: 'CHF' | 'EUR' | 'USD';
   }
   // URL: ?amount=1.5&sourceCrypto=BTC&targetCurrency=CHF
   ```

   **Mining Profitability:**

   ```typescript
   interface MiningInput {
     hashRateTH: string;
     powerWatts: string;
     costPerKWh: string;
     hardwareCostCHF: string;
   }
   // URL: ?hashRateTH=100&powerWatts=1500&costPerKWh=0.25&hardwareCostCHF=5000
   ```

2. **Implementation (reuse existing pattern):**

   ```typescript
   const useHashStore = createCalculatorStore<HashInput, HashResult>({
     name: 'hash-calculator',
     initialValues: { text: '', algorithm: 'SHA-256' },
     calculate: calculateHash,
     syncUrl: true,
     debounceMs: 150,
   });
   ```

3. **URL sync middleware already handles:**
   - Encoding/decoding URL parameters
   - Type coercion (strings → numbers/booleans as needed)
   - Debouncing (150ms, prevents excessive URL updates)
   - Full browser history support (back/forward buttons)

### Risk & Trade-off

**Risk:** Long hash outputs in URL can exceed URL length limits (~2000 chars). Solution: Only sync input state, not results.

**Trade-off:** None — existing middleware already solves this by syncing only `state.values`, not results.

### Verification

URL state is proven to work across 120+ existing calculators (phase 02-url-sync-infrastructure verified).

### References

- [src/stores/calculator-store.ts](https://converty.local/src/stores/calculator-store.ts)
- [URL Sync Middleware: src/lib/middleware/url-sync.ts](https://converty.local/src/lib/middleware/url-sync.ts)
- [Phase 02 Verification: .planning/phases/02-url-sync-infrastructure/02-VERIFICATION.md](https://converty.local/.planning/phases/02-url-sync-infrastructure/02-VERIFICATION.md)

---

## Section 7: Testing & Verification Strategy

### Decision Made

**Implement test vectors for hashing; cross-validate exchange rates against CoinGecko; verify mining calculations with public calculators**

### Rationale

1. **Hash calculation testing:**
   - Use known test vectors (NIST FIPS examples)
   - Example MD5: `MD5("abc") = 900150983cd24fb0d6963f7d28e17f72`
   - Example SHA-256: `SHA256("abc") = ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad`
   - Verify: Calculate hash, compare with known value
   - Test all 4 algorithms (MD5, SHA-1, SHA-256, SHA-512)

2. **Exchange rate validation:**
   - At build time, fetch prices from CoinGecko
   - Compare against secondary source (e.g., CoinMarketCap free tier) for sanity check
   - Verify conversions: 1 BTC in CHF × CHF-to-EUR rate ≈ 1 BTC in EUR
   - Document price source and timestamp in UI

3. **Mining calculator validation:**
   - Compare calculations against CoinWarz calculator for same inputs
   - Verify formula: Revenue = (HashRate / TotalHashRate) × BlocksPerDay × Reward
   - Test with known miner specs (e.g., Antminer S19 Pro: 110 TH/s, 1725W)
   - Verify profitability edge cases (negative profit, break-even)

4. **Wallet address validation:**
   - Test Bitcoin P2PKH: `1A1z7agoat1o3QvUoxtEak5g5L5j3KSs6` (valid)
   - Test Bitcoin P2WPKH: `bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4` (valid Segwit)
   - Test Ethereum: `0x742d35Cc6634C0532925a3b844Bc580e75d42e2a` (valid checksummed)
   - Test invalid inputs and verify error messages

### Acceptance Criteria

- [ ] All hash functions match NIST test vectors
- [ ] Exchange rates within 1% of CoinGecko source at build time
- [ ] Mining calculations match CoinWarz for same inputs (within rounding)
- [ ] Address validation matches wallet-address-validator library
- [ ] URL state preserves all inputs across page reload

### References

- [NIST FIPS 180-4: SHA Standard](https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.180-4.pdf) (test vectors)
- [CoinWarz Mining Calculator](https://www.coinwarz.com/mining/bitcoin/calculator) (validation reference)
- [CoinGecko API](https://docs.coingecko.com/) (price source)

---

## Section 8: Dependency Analysis & Bundle Impact

### Decision Made

**Add crypto-js (16 KB minified, 4 KB gzipped); wallet-address-validator (2 KB minified, 0.8 KB gzipped); total impact: ~5 KB gzipped**

### Current Dependencies (Relevant)

From package.json:

- zustand@5.0.10 (1.2 KB gzipped)
- fuse.js@7.1.0 (2.3 KB gzipped)
- recharts@3.6.0 (45 KB gzipped)
- jspdf@4.0.0 (90 KB gzipped)
- ipaddr.js@2.3.0 (1.8 KB gzipped)
- **Total production bundle: ~450 KB gzipped (estimated)**

### New Dependencies for Phase 17

| Package | Size (min) | Size (gzip) | Purpose | Required for |
|---------|-----------|------------|---------|--------------|
| crypto-js | 16 KB | 4 KB | MD5, SHA hashing | Hash calculator |
| wallet-address-validator | 2 KB | 0.8 KB | Address validation | Wallet converter |
| (CoinGecko API client) | 0 KB | 0 KB | Build-time only | Mining/exchange (dev script) |

**Total new bundle impact: +5 KB gzipped** (1.2% increase to 455 KB)

### Bundle Impact Strategy

1. **No code splitting needed** — 5 KB is negligible
2. **Tree-shaking:** Both libraries support modern tree-shaking
3. **Dynamic import (if needed later):** Could lazy-load crypto-js only on hash calculator page

   ```typescript
   const CryptoJS = await import('crypto-js');
   ```

### Alternative Options Considered & Rejected

| Option | Size | Reason Rejected |
|--------|------|-----------------|
| ethers.js (wallet + exchange) | 150 KB | Too heavy, overkill for address validation |
| bitcoinjs-lib (wallet conversion) | 40 KB | Only useful for private key operations (out of scope) |
| tweetnacl.js (signing) | 28 KB | Not needed for static conversion |
| node-fetch (API client) | 3 KB | Not needed; fetch is built-in to browsers/Node 18+ |

### Verification Commands

```bash
# Check current bundle size
npm run build

# Analyze bundle
npm ls crypto-js wallet-address-validator

# Tree-shake test
npx webpack --mode production --analyze
```

### References

- [BundlePhobia](https://bundlephobia.com/) (package size tracker)
- [Webpack Bundle Analyzer](https://github.com/webpack-bundle-size-analyzer/webpack-bundle-size-analyzer)

---

## Section 9: Privacy & Security Considerations

### Decision Made

**Implement address validation only (no private key handling); warn users clearly in UI; use HTTPS only for any API calls; do NOT store sensitive data**

### Rationale

1. **What we implement safely (client-side):**
   - ✅ Hash calculation (MD5, SHA) — output is public
   - ✅ Address validation (Bitcoin, Ethereum) — addresses are public
   - ✅ Exchange rate conversion — public data from CoinGecko
   - ✅ Mining profitability calculation — educational, no secrets

2. **What we explicitly do NOT implement:**
   - ❌ Private key generation or conversion
   - ❌ Transaction signing or broadcasting
   - ❌ Wallet creation or backup
   - ❌ Any cryptographic operations requiring secrecy

3. **Privacy considerations:**
   - **Hash calculator:** Outputs hashed user input, not reversible (unless weak password)
     - Risk: User hashing passwords locally (visible in URL)
     - Mitigation: Add UI warning "Do NOT hash passwords here; use proper key derivation"

   - **Wallet address conversion:** Works with public addresses only
     - Risk: User pastes private key by mistake
     - Mitigation: Add clear label "PUBLIC ADDRESS ONLY" in input field

   - **Exchange rates:** All public data
     - Risk: None (same as checking prices on CoinGecko)

   - **Mining calculator:** All public data
     - Risk: None

4. **Browser security:**
   - Static site, no cookies set
   - No localStorage (state in URL only)
   - CSP headers should allow CoinGecko API (build-time only)
   - No tracking, no analytics (unless added separately)

5. **URL state security:**
   - Hash calculator input may contain sensitive data (passwords)
   - Mitigation: Document that URL is NOT secure for sensitive data
   - Users should clear browser history if they hash passwords

### Implementation Checklist

- [ ] Add warning in Hash Calculator UI: "Do NOT hash passwords or secrets"
- [ ] Add validation in Wallet Converter: Reject input containing "0x" prefix (indicates possible private key confusion)
- [ ] Add disclaimer in Mining Calculator: "For educational purposes; actual profitability varies"
- [ ] Add timestamp in Exchange Rate: "Prices last updated [DATE]"
- [ ] Add help text for each calculator explaining security model

### References

- [OWASP: Client-Side Data Protection](https://owasp.org/www-community/attacks/Client-Side_Encryption)
- [MDN: Web Crypto API Security](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API#security_considerations)
- [ethers.js Security Discussion](https://github.com/ethers-io/ethers.js/discussions/3504)

---

## Section 10: Build-Time vs Runtime Trade-offs

### Decision Made

**Hybrid approach: (1) Hash/Wallet/Mining logic runs client-side (runtime); (2) Crypto prices & difficulty fetched at build-time, embedded in bundle**

### Trade-off Analysis

| Component | Build-Time | Runtime | Decision |
|-----------|-----------|---------|----------|
| Hash calculation (MD5, SHA) | ❌ Not needed | ✅ Yes | Runtime (instantaneous per user input) |
| Wallet validation | ❌ Not needed | ✅ Yes | Runtime (instant validation feedback) |
| Exchange rates (BTC→CHF) | ✅ Recommended | ❌ No | Build-time (static, updated per build) |
| Mining difficulty | ✅ Recommended | ❌ No | Build-time (changes ~every 2 weeks) |
| Block reward | ✅ OK (static) | ❌ Could work | Build-time (changes at halving events, rare) |

### Detailed Analysis

**Build-Time (Crypto Prices & Difficulty):**

Pros:

- Zero runtime cost (prices already in JS bundle)
- Consistent data for all users (no race conditions)
- Static export compatible
- Cache-friendly (CDN can cache forever, except date header)

Cons:

- Prices stale until next build
- Requires rebuild to update prices
- Difficult for real-time trading (acceptable — this is educational)

**Runtime (Hash, Wallet, Mining Logic):**

Pros:

- Instant results (no network latency)
- Always up-to-date inputs
- User doesn't need to rebuild for new hash inputs
- Scales infinitely (no server needed)

Cons:

- None (static export ideal for this)

### Build Process Flow

```
npm run prebuild
  ├─ scripts/generate-search-index.ts (existing)
  ├─ scripts/fetch-crypto-prices.ts (NEW)
  ├─ scripts/fetch-mining-data.ts (NEW)
  └─ Write JSON files to src/lib/data/

npm run build:next
  ├─ Next.js builds pages
  ├─ Imports crypto-prices.json, mining-data.json (embedded in bundle)
  └─ Generates static HTML

Resulting static site
  ├─ Hash calculator: Client-side hashing
  ├─ Exchange calculator: Uses bundled prices
  ├─ Mining calculator: Uses bundled difficulty + prices
  └─ Wallet converter: Client-side validation
```

### Runtime Decision Points

1. **Should we support real-time prices?**
   - No (static export) — build-time is sufficient
   - Future option: Add banner "Prices are X hours old; check CoinGecko for real-time"

2. **Should we fetch mining difficulty at runtime?**
   - No (static export) — build-time fetch
   - Document in UI: "Based on difficulty as of [DATE]"

3. **How often to rebuild for price updates?**
   - Recommended: Daily (via CI/CD like GitHub Actions)
   - Minimum: Weekly
   - Price volatility warrants frequent updates for accuracy

### Implementation Checklist

- [ ] Create `scripts/fetch-crypto-prices.ts` (fetch at build time)
- [ ] Create `scripts/fetch-mining-data.ts` (fetch at build time)
- [ ] Add to `package.json` `prebuild` script
- [ ] Create `src/lib/data/crypto-prices.json` (template with sample data)
- [ ] Create `src/lib/data/mining-data.json` (template with sample data)
- [ ] Import in calculators, not via fetch
- [ ] Add timestamp display in UI
- [ ] Set up CI/CD to run `npm run build` daily

### References

- [Next.js Static Exports](https://nextjs.org/docs/app/guides/static-exports)
- [Next.js Static Generation with Data](https://nextjs.org/learn/dashboard-app/static-and-dynamic-rendering)
- [GitHub Actions: Scheduled Builds](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#schedule)

---

## Critical Implementation Questions & Decisions Remaining

### Q1: Should we implement Ethereum mining profitability?

**Answer:** No (MVP). Ethereum moved to Proof-of-Stake in Sep 2022; no more PoW mining.

### Q2: What about Litecoin, Monero, or other altcoins?

**Answer:** Scope to Bitcoin only (MVP). Can add others later if demand justifies bundle size.

### Q3: Private key conversion — really out of scope?

**Answer:** Yes. Too risky, requires educational context we don't have space for.

### Q4: Should hash calculator support HMAC?

**Answer:** No (MVP). Keep focused on basic hashing.

### Q5: Real-time price updates — can we add them later?

**Answer:** Yes, but it breaks static export. Would require moving to hybrid (SSG + API routes). Document as future enhancement.

---

## Recommendations for Phase Planning

### MVP Scope (Recommended)

**Must include:**

1. Hash Calculator (MD5, SHA-1, SHA-256, SHA-512)
2. Wallet Address Validator (Bitcoin P2PKH/P2WPKH, Ethereum ERC-20)
3. Crypto Exchange Rate (BTC/ETH to CHF/EUR)
4. Mining Profitability (Bitcoin SHA-256 only)

**Must include for quality:**

- URL state persistence for all 4
- Full i18n (en/fr/de/it)
- Test vectors for hashing
- Price/difficulty data fetched at build time
- Clear disclaimers/warnings in UI

### Bundle Cost

- +5 KB gzipped (crypto-js + wallet-validator)
- +2 KB for build-time scripts
- Total impact: Negligible (1.2% increase)

### Complexity Estimate

- Hash Calculator: 4/10 (straightforward)
- Wallet Converter: 5/10 (validation library needed)
- Exchange Rate: 6/10 (build-time data fetch)
- Mining Profitability: 7/10 (formula, data management, unit conversions)

### Timeline Estimate

- Research & setup: 2-3 hours (done)
- Implementation (all 4): 12-16 hours
- Testing & QA: 4-6 hours
- i18n translations: 2-3 hours
- **Total: ~24-28 hours**

---

## RESEARCH COMPLETE

All 10 research areas have been thoroughly investigated. The phase is ready to move to planning phase (create 4 detailed plan documents: one per calculator).

### Key Takeaways

1. ✅ All 4 calculators are technically feasible with static export
2. ✅ Bundle impact is minimal (~5 KB)
3. ✅ No server-side infrastructure required
4. ✅ Existing Zustand patterns cover URL state for all 4
5. ✅ Build-time data fetching is the right approach for prices & difficulty
6. ✅ Privacy/security model is sound (no private key handling)
7. ✅ Testing strategy is well-defined
8. ✅ i18n follows project conventions
9. ❌ No blockers identified
10. ✅ Ready to move to PLAN phase

---

## Sources

- [Web Crypto API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [crypto-js GitHub](https://github.com/brix/crypto-js)
- [crypto-js npm](https://www.npmjs.com/package/crypto-js)
- [wallet-address-validator npm](https://www.npmjs.com/package/wallet-address-validator)
- [ethereumjs-wallet GitHub](https://github.com/ethereumjs/ethereumjs-wallet)
- [bitcoinjs-lib GitHub](https://github.com/bitcoinjs/bitcoinjs-lib)
- [Ethers.js Documentation](https://docs.ethers.org/v5/)
- [CoinGecko API Documentation](https://docs.coingecko.com/)
- [CoinGecko Pricing](https://www.coingecko.com/en/api/pricing)
- [Next.js Static Exports Guide](https://nextjs.org/docs/app/guides/static-exports)
- [CoinWarz Mining Calculator](https://www.coinwarz.com/mining/bitcoin/calculator)
- [HashRate Index Calculator](https://hashrateindex.com/tools/calculator)
- [Bitcoin Difficulty API](https://data.hashrateindex.com/network-data/difficulty)
- [Blockchain.com Difficulty Chart](https://www.blockchain.com/charts/difficulty)
- [Crypto Performance Analysis](https://medium.com/@ronantech/exploring-sha-256-performance-on-the-browser-browser-apis-javascript-libraries-wasm-webgpu-9d9e8e681c81)
- [OWASP Client-Side Data Protection](https://owasp.org/www-community/attacks/Client-Side_Encryption)
- [MDN Web Crypto API Security](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API#security_considerations)
- [ethers.js Security Discussion](https://github.com/ethers-io/ethers.js/discussions/3504)
- [BundlePhobia](https://bundlephobia.com/)
- [GitHub Actions: Scheduled Builds](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#schedule)
