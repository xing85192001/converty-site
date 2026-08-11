/**
 * Fetch Bitcoin mining data at build time
 *
 * Fetches:
 * - Network difficulty from Blockchain.info
 * - Network hash rate from Blockchain.info
 * - Bitcoin price from CoinGecko
 * - Block reward (hardcoded: 3.125 BTC post-2024 halving)
 * - Blocks per day (hardcoded: 144 average)
 *
 * Usage: npx tsx scripts/fetch-mining-data.ts
 * Runs automatically via npm run prebuild
 */

import { writeFileSync } from "node:fs";
import { join } from "node:path";

interface MiningData {
  timestamp: string;
  source: string;
  difficulty: number;
  networkHashRate: number; // TH/s
  btcPrice: {
    chf: number;
    eur: number;
    usd: number;
  };
  blockReward: number; // BTC
  blocksPerDay: number;
}

// Fallback data (reasonable estimates as of early 2026)
const FALLBACK_DATA: MiningData = {
  timestamp: new Date().toISOString(),
  source: "fallback",
  difficulty: 75500000000000, // ~75.5 trillion
  networkHashRate: 550000000, // 550 million TH/s (550 EH/s)
  btcPrice: {
    chf: 85000,
    eur: 90000,
    usd: 95000,
  },
  blockReward: 3.125,
  blocksPerDay: 144,
};

async function fetchMiningData(): Promise<MiningData> {
  try {
    console.log("Fetching Bitcoin mining data...");

    // Fetch difficulty from Blockchain.info
    const difficultyUrl = "https://blockchain.info/q/getdifficulty";
    const difficultyResponse = await fetch(difficultyUrl, {
      headers: { Accept: "application/json" },
    });

    if (!difficultyResponse.ok) {
      throw new Error(`Blockchain.info difficulty API returned ${difficultyResponse.status}`);
    }

    const difficulty = Number(await difficultyResponse.text());
    if (Number.isNaN(difficulty) || difficulty <= 0) {
      throw new Error("Invalid difficulty value received");
    }

    console.log(`✓ Difficulty: ${difficulty.toLocaleString()}`);

    // Fetch network hash rate from Blockchain.info (returns in GH/s)
    const hashRateUrl = "https://blockchain.info/q/hashrate";
    const hashRateResponse = await fetch(hashRateUrl, {
      headers: { Accept: "application/json" },
    });

    if (!hashRateResponse.ok) {
      throw new Error(`Blockchain.info hash rate API returned ${hashRateResponse.status}`);
    }

    const hashRateGHS = Number(await hashRateResponse.text());
    if (Number.isNaN(hashRateGHS) || hashRateGHS <= 0) {
      throw new Error("Invalid hash rate value received");
    }

    // Convert from GH/s to TH/s (1 TH/s = 1000 GH/s)
    const networkHashRate = hashRateGHS / 1000;

    console.log(`✓ Network hash rate: ${networkHashRate.toLocaleString()} TH/s`);

    // Fetch Bitcoin price from CoinGecko
    const priceUrl =
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=chf,eur,usd";
    const priceResponse = await fetch(priceUrl, {
      headers: { Accept: "application/json" },
    });

    if (!priceResponse.ok) {
      throw new Error(`CoinGecko API returned ${priceResponse.status}`);
    }

    const priceData = (await priceResponse.json()) as {
      bitcoin?: { chf?: number; eur?: number; usd?: number };
    };

    if (!priceData.bitcoin?.chf || !priceData.bitcoin?.eur || !priceData.bitcoin?.usd) {
      throw new Error("Missing Bitcoin price data");
    }

    console.log(`✓ BTC price: ${priceData.bitcoin.chf} CHF`);

    const miningData: MiningData = {
      timestamp: new Date().toISOString(),
      source: "blockchain.info+coingecko",
      difficulty,
      networkHashRate,
      btcPrice: {
        chf: priceData.bitcoin.chf,
        eur: priceData.bitcoin.eur,
        usd: priceData.bitcoin.usd,
      },
      blockReward: 3.125, // Post-2024 halving
      blocksPerDay: 144, // Average: 1 block per 10 minutes
    };

    console.log("✓ Successfully fetched all mining data");
    return miningData;
  } catch (error) {
    console.warn(
      "⚠ Failed to fetch mining data:",
      error instanceof Error ? error.message : String(error)
    );
    console.log("→ Using fallback data");
    return FALLBACK_DATA;
  }
}

async function main(): Promise<void> {
  const miningData = await fetchMiningData();

  const outputPath = join(process.cwd(), "src", "lib", "data", "mining-data.json");

  writeFileSync(outputPath, `${JSON.stringify(miningData, null, 2)}\n`, "utf-8");

  console.log(`✓ Saved mining data to ${outputPath}`);
  console.log(`  Source: ${miningData.source}`);
  console.log(`  Timestamp: ${miningData.timestamp}`);
  console.log(`  Difficulty: ${miningData.difficulty.toLocaleString()}`);
  console.log(`  Network hash rate: ${miningData.networkHashRate.toLocaleString()} TH/s`);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
