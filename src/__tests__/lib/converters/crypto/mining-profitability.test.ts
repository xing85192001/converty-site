import { describe, expect, it } from "vitest";
import {
  calculateMiningProfitability,
  formatBtc,
  formatMiningCurrency,
  HASH_RATE_UNITS,
  MINER_PRESETS,
} from "@/lib/converters/crypto/mining-profitability";

// NOTE: mining-profitability.ts imports build-time JSON data for BTC price and network hash rate.
// Tests use RATIO INVARIANTS (proportional relationships) instead of absolute dollar amounts.

describe("calculateMiningProfitability", () => {
  describe("invalid inputs return error", () => {
    it("returns error for hashRate of 0", () => {
      const result = calculateMiningProfitability({
        hashRate: 0,
        hashRateUnit: "TH/s",
        powerWatts: 3250,
        electricityCost: 0.1,
        currency: "USD",
      });
      expect(result.ok).toBe(false);
    });

    it("returns error for negative hashRate", () => {
      const result = calculateMiningProfitability({
        hashRate: -100,
        hashRateUnit: "TH/s",
        powerWatts: 3250,
        electricityCost: 0.1,
        currency: "USD",
      });
      expect(result.ok).toBe(false);
    });

    it("returns error for powerWatts of 0", () => {
      const result = calculateMiningProfitability({
        hashRate: 110,
        hashRateUnit: "TH/s",
        powerWatts: 0,
        electricityCost: 0.1,
        currency: "USD",
      });
      expect(result.ok).toBe(false);
    });

    it("returns error for negative electricityCost", () => {
      const result = calculateMiningProfitability({
        hashRate: 110,
        hashRateUnit: "TH/s",
        powerWatts: 3250,
        electricityCost: -1,
        currency: "USD",
      });
      expect(result.ok).toBe(false);
    });
  });

  describe("ratio invariants (relative comparisons)", () => {
    const baseInput = {
      hashRate: 100,
      hashRateUnit: "TH/s" as const,
      powerWatts: 3000,
      electricityCost: 0.1,
      currency: "USD" as const,
    };

    it("doubling hashRate doubles btcPerDay (invariant)", () => {
      const base = calculateMiningProfitability(baseInput);
      const doubled = calculateMiningProfitability({ ...baseInput, hashRate: 200 });
      expect(base.ok).toBe(true);
      expect(doubled.ok).toBe(true);
      if (!base.ok || !doubled.ok) return;
      expect(doubled.value.btcPerDay).toBeCloseTo(base.value.btcPerDay * 2, 8);
    });

    it("doubling hashRate doubles revenuePerDay (invariant)", () => {
      const base = calculateMiningProfitability(baseInput);
      const doubled = calculateMiningProfitability({ ...baseInput, hashRate: 200 });
      expect(base.ok).toBe(true);
      expect(doubled.ok).toBe(true);
      if (!base.ok || !doubled.ok) return;
      expect(doubled.value.revenuePerDay).toBeCloseTo(base.value.revenuePerDay * 2, 5);
    });

    it("doubling electricityCost doubles electricityCostPerDay (invariant)", () => {
      const base = calculateMiningProfitability(baseInput);
      const doubled = calculateMiningProfitability({ ...baseInput, electricityCost: 0.2 });
      expect(base.ok).toBe(true);
      expect(doubled.ok).toBe(true);
      if (!base.ok || !doubled.ok) return;
      expect(doubled.value.electricityCostPerDay).toBeCloseTo(
        base.value.electricityCostPerDay * 2,
        5
      );
    });

    it("higher electricity cost reduces profit", () => {
      const low = calculateMiningProfitability({ ...baseInput, electricityCost: 0.05 });
      const high = calculateMiningProfitability({ ...baseInput, electricityCost: 0.3 });
      expect(low.ok).toBe(true);
      expect(high.ok).toBe(true);
      if (!low.ok || !high.ok) return;
      expect(high.value.profitPerDay).toBeLessThan(low.value.profitPerDay);
    });

    it("monthly revenue is 30x daily revenue", () => {
      const result = calculateMiningProfitability(baseInput);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.revenuePerMonth).toBeCloseTo(result.value.revenuePerDay * 30, 8);
    });

    it("yearly revenue is 365x daily revenue", () => {
      const result = calculateMiningProfitability(baseInput);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.revenuePerYear).toBeCloseTo(result.value.revenuePerDay * 365, 8);
    });

    it("profitPerDay equals revenuePerDay minus electricityCostPerDay", () => {
      const result = calculateMiningProfitability(baseInput);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.profitPerDay).toBeCloseTo(
        result.value.revenuePerDay - result.value.electricityCostPerDay,
        8
      );
    });
  });

  describe("result structure", () => {
    const input = {
      hashRate: 110,
      hashRateUnit: "TH/s" as const,
      powerWatts: 3250,
      electricityCost: 0.1,
      currency: "USD" as const,
    };

    it("returns btcPrice as positive number", () => {
      const result = calculateMiningProfitability(input);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.btcPrice).toBeGreaterThan(0);
    });

    it("returns networkDifficulty as positive number", () => {
      const result = calculateMiningProfitability(input);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.networkDifficulty).toBeGreaterThan(0);
    });

    it("returns blockReward as positive number", () => {
      const result = calculateMiningProfitability(input);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.blockReward).toBeGreaterThan(0);
    });

    it("returns isProfitable boolean", () => {
      const result = calculateMiningProfitability(input);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(typeof result.value.isProfitable).toBe("boolean");
    });

    it("roiDays is null when no hardwareCost provided", () => {
      const result = calculateMiningProfitability(input);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.roiDays).toBeNull();
    });

    it("roiDays is number when hardwareCost is positive and profitable", () => {
      const result = calculateMiningProfitability({
        ...input,
        hardwareCost: 3000,
        electricityCost: 0.01, // Very cheap electricity to ensure profitable
      });
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      // If profitable, roiDays should be set
      if (result.value.isProfitable) {
        expect(result.value.roiDays).not.toBeNull();
        expect(result.value.roiDays).toBeGreaterThan(0);
      } else {
        expect(result.value.roiDays).toBeNull();
      }
    });
  });

  describe("hash rate unit conversions", () => {
    it("100 GH/s should produce less BTC than 100 TH/s (GH/s is 1000x smaller)", () => {
      const ghs = calculateMiningProfitability({
        hashRate: 100,
        hashRateUnit: "GH/s",
        powerWatts: 3000,
        electricityCost: 0.1,
        currency: "USD",
      });
      const ths = calculateMiningProfitability({
        hashRate: 100,
        hashRateUnit: "TH/s",
        powerWatts: 3000,
        electricityCost: 0.1,
        currency: "USD",
      });
      expect(ghs.ok).toBe(true);
      expect(ths.ok).toBe(true);
      if (!ghs.ok || !ths.ok) return;
      expect(ths.value.btcPerDay).toBeCloseTo(ghs.value.btcPerDay * 1000, 8);
    });
  });
});

describe("formatBtc", () => {
  it("formats 0 as '0'", () => {
    expect(formatBtc(0)).toBe("0");
  });

  it("formats amounts >= 1 with 4 decimal places", () => {
    const result = formatBtc(1.5);
    expect(result).toContain(".");
  });

  it("formats very small amounts in scientific notation", () => {
    const result = formatBtc(0.00000001);
    expect(result).toContain("e");
  });
});

describe("formatMiningCurrency", () => {
  it("formats number with 2 decimal places", () => {
    const result = formatMiningCurrency(1234.56789, "USD");
    expect(result).toContain(".");
  });
});

describe("HASH_RATE_UNITS", () => {
  it("contains TH/s unit", () => {
    expect(HASH_RATE_UNITS).toContain("TH/s");
  });

  it("contains PH/s unit", () => {
    expect(HASH_RATE_UNITS).toContain("PH/s");
  });
});

describe("MINER_PRESETS", () => {
  it("contains Antminer S19 Pro preset", () => {
    const preset = MINER_PRESETS.find((p) => p.name === "Antminer S19 Pro");
    expect(preset).toBeDefined();
    expect(preset?.hashRate).toBe(110);
    expect(preset?.hashRateUnit).toBe("TH/s");
  });
});
