import CryptoJS from "crypto-js";
import type { CalculationResult } from "@/types";

export type HashAlgorithm = "MD5" | "SHA-1" | "SHA-256" | "SHA-512";

export interface HashResult {
  algorithm: HashAlgorithm;
  input: string;
  hash: string;
  inputLength: number;
  hashLength: number;
  isMD5: boolean;
}

/**
 * Map algorithm name to WebCrypto digest algorithm
 */
function mapAlgorithm(algo: HashAlgorithm): string {
  switch (algo) {
    case "SHA-1":
      return "SHA-1";
    case "SHA-256":
      return "SHA-256";
    case "SHA-512":
      return "SHA-512";
    default:
      throw new Error(`Unsupported WebCrypto algorithm: ${algo}`);
  }
}

/**
 * Convert ArrayBuffer to hex string
 */
function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Calculate hash using WebCrypto (SHA) or crypto-js (MD5)
 */
export async function calculateHash(
  input: string,
  algorithm: HashAlgorithm
): Promise<CalculationResult<HashResult>> {
  if (!input) {
    return {
      ok: true,
      value: {
        algorithm,
        input: "",
        hash: "",
        inputLength: 0,
        hashLength: 0,
        isMD5: algorithm === "MD5",
      },
    };
  }

  let hash: string;

  if (algorithm === "MD5") {
    // Use crypto-js for MD5 (not available in WebCrypto)
    hash = CryptoJS.MD5(input).toString();
  } else {
    // Use WebCrypto for SHA algorithms
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest(mapAlgorithm(algorithm), data);
    hash = bufferToHex(hashBuffer);
  }

  return {
    ok: true,
    value: {
      algorithm,
      input,
      hash,
      inputLength: input.length,
      hashLength: hash.length,
      isMD5: algorithm === "MD5",
    },
  };
}

/**
 * Hash length in bits for each algorithm
 */
export const HASH_LENGTHS: Record<HashAlgorithm, number> = {
  MD5: 128,
  "SHA-1": 160,
  "SHA-256": 256,
  "SHA-512": 512,
};

/**
 * Test vectors for verification
 * Source: NIST FIPS examples
 */
export const TEST_VECTORS: Record<HashAlgorithm, { input: string; expected: string }> = {
  MD5: {
    input: "abc",
    expected: "900150983cd24fb0d6963f7d28e17f72",
  },
  "SHA-1": {
    input: "abc",
    expected: "a9993e364706816aba3e25717850c26c9cd0d89d",
  },
  "SHA-256": {
    input: "abc",
    expected: "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
  },
  "SHA-512": {
    input: "abc",
    expected:
      "ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f",
  },
};
