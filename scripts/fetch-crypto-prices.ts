/**
 * Fetch cryptocurrency prices from CoinGecko API at build time
 *
 * Fetches: BTC, ETH, LTC, XRP, DOGE, ADA
 * Currencies: CHF, EUR, USD
 *
 * Usage: npx tsx scripts/fetch-crypto-prices.ts
 * Runs automatically via npm run prebuild
 */

import { writeFileSync } from "node:fs";
import { join } from "node:path";

interface CoinGeckoResponse {
  bitcoin?: { chf?: number; eur?: number; usd?: number };
  ethereum?: { chf?: number; eur?: number; usd?: number };
  litecoin?: { chf?: number; eur?: number; usd?: number };
  ripple?: { chf?: number; eur?: number; usd?: number };
  dogecoin?: { chf?: number; eur?: number; usd?: number };
  cardano?: { chf?: number; eur?: number; usd?: number };
}

interface CryptoPriceData {
  timestamp: string;
  source: string;
  prices: {
    bitcoin: { chf: number; eur: number; usd: number };
    ethereum: { chf: number; eur: number; usd: number };
    litecoin: { chf: number; eur: number; usd: number };
    ripple: { chf: number; eur: number; usd: number };
    dogecoin: { chf: number; eur: number; usd: number };
    cardano: { chf: number; eur: number; usd: number };
  };
}

// Fallback prices (reasonable estimates as of early 2026)
const FALLBACK_PRICES: CryptoPriceData = {
  timestamp: new Date().toISOString(),
  source: "fallback",
  prices: {
    bitcoin: { chf: 85000, eur: 90000, usd: 95000 },
    ethereum: { chf: 2800, eur: 2950, usd: 3100 },
    litecoin: { chf: 95, eur: 100, usd: 105 },
    ripple: { chf: 2.35, eur: 2.48, usd: 2.6 },
    dogecoin: { chf: 0.31, eur: 0.33, usd: 0.35 },
    cardano: { chf: 0.85, eur: 0.9, usd: 0.95 },
  },
};

async function fetchCryptoPrices(): Promise<CryptoPriceData> {
  const ids = "bitcoin,ethereum,litecoin,ripple,dogecoin,cardano";
  const currencies = "chf,eur,usd";
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=${currencies}`;

  try {
    console.log("Fetching cryptocurrency prices from CoinGecko...");

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`CoinGecko API returned ${response.status}: ${response.statusText}`);
    }

    const data = (await response.json()) as CoinGeckoResponse;

    // Validate that we got all expected data
    const requiredCoins = ["bitcoin", "ethereum", "litecoin", "ripple", "dogecoin", "cardano"];
    const requiredCurrencies = ["chf", "eur", "usd"];

    for (const coin of requiredCoins) {
      if (!data[coin as keyof CoinGeckoResponse]) {
        throw new Error(`Missing data for ${coin}`);
      }
      for (const currency of requiredCurrencies) {
        const coinData = data[coin as keyof CoinGeckoResponse];
        if (!coinData || typeof coinData[currency as keyof typeof coinData] !== "number") {
          throw new Error(`Missing ${currency} price for ${coin}`);
        }
      }
    }

    const priceData: CryptoPriceData = {
      timestamp: new Date().toISOString(),
      source: "coingecko",
      prices: {
        bitcoin: {
          chf: data.bitcoin!.chf!,
          eur: data.bitcoin!.eur!,
          usd: data.bitcoin!.usd!,
        },
        ethereum: {
          chf: data.ethereum!.chf!,
          eur: data.ethereum!.eur!,
          usd: data.ethereum!.usd!,
        },
        litecoin: {
          chf: data.litecoin!.chf!,
          eur: data.litecoin!.eur!,
          usd: data.litecoin!.usd!,
        },
        ripple: {
          chf: data.ripple!.chf!,
          eur: data.ripple!.eur!,
          usd: data.ripple!.usd!,
        },
        dogecoin: {
          chf: data.dogecoin!.chf!,
          eur: data.dogecoin!.eur!,
          usd: data.dogecoin!.usd!,
        },
        cardano: {
          chf: data.cardano!.chf!,
          eur: data.cardano!.eur!,
          usd: data.cardano!.usd!,
        },
      },
    };

    console.log("✓ Successfully fetched prices from CoinGecko");
    return priceData;
  } catch (error) {
    console.warn(
      "⚠ Failed to fetch from CoinGecko API:",
      error instanceof Error ? error.message : String(error)
    );
    console.log("→ Using fallback prices");
    return FALLBACK_PRICES;
  }
}

async function main(): Promise<void> {
  const priceData = await fetchCryptoPrices();

  const outputPath = join(process.cwd(), "src", "lib", "data", "crypto-prices.json");

  writeFileSync(outputPath, `${JSON.stringify(priceData, null, 2)}\n`, "utf-8");

  console.log(`✓ Saved crypto prices to ${outputPath}`);
  console.log(`  Source: ${priceData.source}`);
  console.log(`  Timestamp: ${priceData.timestamp}`);
  console.log(`  Sample: BTC = ${priceData.prices.bitcoin.chf} CHF`);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
