import { describe, expect, it } from "vitest";
import {
  TEST_ADDRESSES,
  validateWalletAddress,
  WALLET_TYPES,
} from "@/lib/converters/crypto/wallet-validator";

describe("validateWalletAddress - Bitcoin (BTC)", () => {
  describe("valid BTC addresses", () => {
    it("validates P2PKH (legacy) address as valid", () => {
      const result = validateWalletAddress(TEST_ADDRESSES.BTC.valid.P2PKH, "BTC");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.isValid).toBe(true);
    });

    it("P2PKH address has correct format name", () => {
      const result = validateWalletAddress(TEST_ADDRESSES.BTC.valid.P2PKH, "BTC");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.addressFormat).toContain("P2PKH");
    });

    it("validates P2WPKH (native SegWit) address as valid", () => {
      const result = validateWalletAddress(TEST_ADDRESSES.BTC.valid.P2WPKH, "BTC");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.isValid).toBe(true);
    });

    it("valid addresses have walletType BTC", () => {
      const result = validateWalletAddress(TEST_ADDRESSES.BTC.valid.P2PKH, "BTC");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.walletType).toBe("BTC");
    });

    it("valid addresses have non-null addressFormat", () => {
      const result = validateWalletAddress(TEST_ADDRESSES.BTC.valid.P2PKH, "BTC");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.addressFormat).not.toBeNull();
    });

    it("valid addresses have non-null formatDescription", () => {
      const result = validateWalletAddress(TEST_ADDRESSES.BTC.valid.P2PKH, "BTC");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.formatDescription).not.toBeNull();
    });
  });

  describe("invalid BTC address", () => {
    it("rejects invalid BTC address", () => {
      const result = validateWalletAddress(TEST_ADDRESSES.BTC.invalid, "BTC");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.isValid).toBe(false);
    });

    it("invalid address has null addressFormat", () => {
      const result = validateWalletAddress(TEST_ADDRESSES.BTC.invalid, "BTC");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.addressFormat).toBeNull();
    });
  });

  describe("BTC testnet address", () => {
    it("detects testnet address as testnet network", () => {
      const result = validateWalletAddress(TEST_ADDRESSES.BTC.testnet, "BTC");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.networkType).toBe("testnet");
    });
  });

  describe("private key detection", () => {
    it("returns warning for private-key-like input", () => {
      // WIF private key format starts with 5/K/L and is 51-52 chars
      const privateKey = "5KJvsngHeMpm884wtkJNzQGaCErckhHJBGFsvd3VyK5qMZXj3hS";
      const result = validateWalletAddress(privateKey, "BTC");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.warningMessage).not.toBeNull();
      expect(result.value.isValid).toBe(false);
    });
  });
});

describe("validateWalletAddress - Ethereum (ETH)", () => {
  it("validates valid ETH address", () => {
    const result = validateWalletAddress(TEST_ADDRESSES.ETH.valid, "ETH");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.isValid).toBe(true);
  });

  it("valid ETH address has ERC-20 format", () => {
    const result = validateWalletAddress(TEST_ADDRESSES.ETH.valid, "ETH");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.addressFormat).toContain("ERC");
  });

  it("rejects invalid ETH address", () => {
    const result = validateWalletAddress(TEST_ADDRESSES.ETH.invalid, "ETH");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.isValid).toBe(false);
  });

  it("lowercase ETH address also validates", () => {
    const result = validateWalletAddress(TEST_ADDRESSES.ETH.lowercase, "ETH");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.isValid).toBe(true);
  });

  it("ETH address has null checksumValid for all-lowercase", () => {
    const result = validateWalletAddress(TEST_ADDRESSES.ETH.lowercase, "ETH");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    // all-lowercase = no checksum to validate → null
    expect(result.value.checksumValid).toBeNull();
  });
});

describe("validateWalletAddress - Litecoin (LTC)", () => {
  it("rejects invalid LTC address", () => {
    const result = validateWalletAddress(TEST_ADDRESSES.LTC.invalid, "LTC");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.isValid).toBe(false);
  });

  it("returns walletType LTC for LTC validation", () => {
    const result = validateWalletAddress(TEST_ADDRESSES.LTC.invalid, "LTC");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.walletType).toBe("LTC");
  });
});

describe("result structure", () => {
  it("returns address field matching trimmed input", () => {
    const result = validateWalletAddress(TEST_ADDRESSES.BTC.valid.P2PKH, "BTC");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.address).toBe(TEST_ADDRESSES.BTC.valid.P2PKH);
  });

  it("returns warningMessage null for normal addresses", () => {
    const result = validateWalletAddress(TEST_ADDRESSES.BTC.valid.P2PKH, "BTC");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.warningMessage).toBeNull();
  });
});

describe("WALLET_TYPES constant", () => {
  it("contains BTC entry", () => {
    const btc = WALLET_TYPES.find((w) => w.type === "BTC");
    expect(btc).toBeDefined();
    expect(btc?.name).toBe("Bitcoin");
  });

  it("contains ETH and LTC entries", () => {
    const types = WALLET_TYPES.map((w) => w.type);
    expect(types).toContain("ETH");
    expect(types).toContain("LTC");
  });
});

describe("TEST_ADDRESSES export", () => {
  it("exports TEST_ADDRESSES with BTC section", () => {
    expect(TEST_ADDRESSES.BTC).toBeDefined();
    expect(TEST_ADDRESSES.BTC.valid.P2PKH).toBeDefined();
  });

  it("exports TEST_ADDRESSES with ETH section", () => {
    expect(TEST_ADDRESSES.ETH).toBeDefined();
    expect(TEST_ADDRESSES.ETH.valid).toBeDefined();
  });

  it("exports TEST_ADDRESSES with LTC section", () => {
    expect(TEST_ADDRESSES.LTC).toBeDefined();
    expect(TEST_ADDRESSES.LTC.valid.Legacy).toBeDefined();
  });
});
