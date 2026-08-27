import { describe, expect, it } from "vitest";
import { calculateHash, HASH_LENGTHS, TEST_VECTORS } from "@/lib/converters/crypto/hash";

describe("calculateHash", () => {
  describe("empty input", () => {
    it("returns empty hash for empty string (MD5)", async () => {
      const result = await calculateHash("", "MD5");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.hash).toBe("");
      expect(result.value.hashLength).toBe(0);
      expect(result.value.inputLength).toBe(0);
    });

    it("returns empty hash for empty string (SHA-256)", async () => {
      const result = await calculateHash("", "SHA-256");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.hash).toBe("");
    });
  });

  describe("MD5 algorithm", () => {
    it("produces correct MD5 hash for 'abc' (NIST test vector)", async () => {
      const result = await calculateHash("abc", "MD5");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.hash).toBe(TEST_VECTORS.MD5.expected);
    });

    it("hash is deterministic — same input same output", async () => {
      const first = await calculateHash("hello", "MD5");
      const second = await calculateHash("hello", "MD5");
      expect(first.ok).toBe(true);
      expect(second.ok).toBe(true);
      if (!first.ok || !second.ok) return;
      expect(first.value.hash).toBe(second.value.hash);
    });

    it("different inputs produce different MD5 hashes", async () => {
      const a = await calculateHash("hello", "MD5");
      const b = await calculateHash("world", "MD5");
      expect(a.ok).toBe(true);
      expect(b.ok).toBe(true);
      if (!a.ok || !b.ok) return;
      expect(a.value.hash).not.toBe(b.value.hash);
    });

    it("MD5 hash is 32 hex characters (128 bits)", async () => {
      const result = await calculateHash("test", "MD5");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.hash).toHaveLength(32);
    });

    it("sets isMD5 to true for MD5", async () => {
      const result = await calculateHash("test", "MD5");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.isMD5).toBe(true);
    });

    it("sets correct inputLength", async () => {
      const result = await calculateHash("hello", "MD5");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.inputLength).toBe(5);
    });
  });

  describe("SHA-256 algorithm", () => {
    it("produces correct SHA-256 hash for 'abc' (NIST test vector)", async () => {
      const result = await calculateHash("abc", "SHA-256");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.hash).toBe(TEST_VECTORS["SHA-256"].expected);
    });

    it("SHA-256 hash is 64 hex characters (256 bits)", async () => {
      const result = await calculateHash("test", "SHA-256");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.hash).toHaveLength(64);
    });

    it("sets isMD5 to false for SHA-256", async () => {
      const result = await calculateHash("test", "SHA-256");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.isMD5).toBe(false);
    });
  });

  describe("SHA-512 algorithm", () => {
    it("SHA-512 hash is 128 hex characters (512 bits)", async () => {
      const result = await calculateHash("test", "SHA-512");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.hash).toHaveLength(128);
    });
  });

  describe("result structure", () => {
    it("returns algorithm in result", async () => {
      const result = await calculateHash("abc", "SHA-256");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.algorithm).toBe("SHA-256");
    });

    it("returns input in result", async () => {
      const result = await calculateHash("hello world", "MD5");
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.value.input).toBe("hello world");
    });
  });
});

describe("HASH_LENGTHS", () => {
  it("MD5 is 128 bits", () => {
    expect(HASH_LENGTHS.MD5).toBe(128);
  });

  it("SHA-256 is 256 bits", () => {
    expect(HASH_LENGTHS["SHA-256"]).toBe(256);
  });

  it("SHA-512 is 512 bits", () => {
    expect(HASH_LENGTHS["SHA-512"]).toBe(512);
  });

  it("SHA-1 is 160 bits", () => {
    expect(HASH_LENGTHS["SHA-1"]).toBe(160);
  });
});

describe("TEST_VECTORS", () => {
  it("MD5 test vector input is abc", () => {
    expect(TEST_VECTORS.MD5.input).toBe("abc");
  });

  it("SHA-256 test vector expected hash has 64 chars", () => {
    expect(TEST_VECTORS["SHA-256"].expected).toHaveLength(64);
  });
});
