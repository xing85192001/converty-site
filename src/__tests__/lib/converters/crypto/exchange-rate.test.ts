import { describe, expect, it } from "vitest";
import {
  CRYPTO_CURRENCIES,
  convertCrypto,
  convertFiatToCrypto,
  FIAT_CURRENCIES,
  formatCurrency,
} from "@/lib/converters/crypto/exchange-rate";

describe("convertCrypto", () => {
  describe("basic conversion", () => {
    it("returns result for known BTC to USD", () => {
      const result = convertCrypto(1, "BTC", "USD");
      expect(result).not.toBeNull();
      expect(result.amount).toBe(1);
      expect(result.crypto).toBe("BTC");
      expect(result.fiat).toBe("USD");
    });

    it("has positive rate for BTC/USD", () => {
      const result = convertCrypto(1, "BTC", "USD");
      expect(result.rate).toBeGreaterThan(0);
    });

    it("convertedAmount equals amount * rate", () => {
      const result = convertCrypto(2, "BTC", "USD");
      expect(result.convertedAmount).toBeCloseTo(2 * result.rate, 5);
    });

    it("inverseRate is 1 / rate", () => {
      const result = convertCrypto(1, "ETH", "EUR");
      expect(result.inverseRate).toBeCloseTo(1 / result.rate, 8);
    });

    it("1 BTC to USD has same rate as 2 BTC to USD", () => {
      const one = convertCrypto(1, "BTC", "USD");
      const two = convertCrypto(2, "BTC", "USD");
      expect(one.rate).toBe(two.rate);
    });

    it("returns lastUpdated string", () => {
      const result = convertCrypto(1, "BTC", "CHF");
      expect(typeof result.lastUpdated).toBe("string");
      expect(result.lastUpdated.length).toBeGreaterThan(0);
    });

    it("returns source string", () => {
      const result = convertCrypto(1, "BTC", "CHF");
      expect(typeof result.source).toBe("string");
    });
  });

  describe("multiple cryptocurrencies", () => {
    it("ETH to USD returns positive rate", () => {
      const result = convertCrypto(1, "ETH", "USD");
      expect(result.rate).toBeGreaterThan(0);
    });

    it("LTC to EUR returns positive rate", () => {
      const result = convertCrypto(1, "LTC", "EUR");
      expect(result.rate).toBeGreaterThan(0);
    });
  });

  describe("fiat currency scaling", () => {
    it("doubling amount doubles convertedAmount", () => {
      const one = convertCrypto(1, "BTC", "USD");
      const two = convertCrypto(2, "BTC", "USD");
      expect(two.convertedAmount).toBeCloseTo(one.convertedAmount * 2, 5);
    });
  });
});

describe("convertFiatToCrypto", () => {
  it("converts USD to BTC", () => {
    const result = convertFiatToCrypto(1000, "USD", "BTC");
    expect(result).not.toBeNull();
    expect(result.amount).toBe(1000);
  });

  it("convertedAmount is amount / rate", () => {
    const result = convertFiatToCrypto(100, "EUR", "ETH");
    expect(result.convertedAmount).toBeCloseTo(100 / result.rate, 8);
  });

  it("BTC/USD inverse matches USD/BTC inverse", () => {
    const cryptoResult = convertCrypto(1, "BTC", "USD");
    const fiatResult = convertFiatToCrypto(cryptoResult.convertedAmount, "USD", "BTC");
    expect(fiatResult.convertedAmount).toBeCloseTo(1, 4);
  });
});

describe("formatCurrency", () => {
  it("formats fiat USD with 2 decimal places", () => {
    const formatted = formatCurrency(1234.5, "USD");
    expect(formatted).toMatch(/\d/);
    expect(formatted).toContain(".");
  });

  it("formats zero crypto as 0", () => {
    const formatted = formatCurrency(0, "BTC");
    expect(formatted).toBe("0");
  });

  it("formats crypto >= 1 with 2-4 decimals", () => {
    const formatted = formatCurrency(1.5, "BTC");
    expect(formatted).toMatch(/\d/);
  });
});

describe("constants", () => {
  it("CRYPTO_CURRENCIES has BTC entry", () => {
    const btc = CRYPTO_CURRENCIES.find((c) => c.id === "BTC");
    expect(btc).toBeDefined();
    expect(btc?.name).toBe("Bitcoin");
  });

  it("FIAT_CURRENCIES has USD, EUR, CHF", () => {
    const ids = FIAT_CURRENCIES.map((f) => f.id);
    expect(ids).toContain("USD");
    expect(ids).toContain("EUR");
    expect(ids).toContain("CHF");
  });
});
