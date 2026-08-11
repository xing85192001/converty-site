/**
 * Supernetting (CIDR aggregation) functions
 *
 * Combines multiple contiguous networks into a larger CIDR block.
 * Validates network boundaries and contiguity for valid aggregation.
 */

import ipaddr from "ipaddr.js";
import type { CalculationResult } from "@/types";
import { calculateSubnet } from "./subnet-calculator";
import type { SubnetResult } from "./types";

/**
 * Payload of supernet aggregation
 */
export interface SupernetPayload {
  /** Aggregated supernet containing all original networks */
  supernet: SubnetResult;

  /** Original networks provided for aggregation */
  originalNetworks: SubnetResult[];
}

/**
 * Aggregate multiple contiguous networks into a larger CIDR block
 *
 * Requirements for successful aggregation:
 * - Minimum 2 networks
 * - Network count must be power of 2
 * - All networks must be same IP version (IPv4 or IPv6)
 * - All networks must have same CIDR prefix
 * - First network must be aligned on supernet boundary
 * - All networks must be contiguous (no gaps)
 *
 * @param networks - Array of network addresses in CIDR notation (e.g., ["192.168.0.0/24", "192.168.1.0/24"])
 * @returns CalculationResult with supernet payload or error
 *
 * @example
 * // Aggregate two /24 networks into /23
 * aggregateNetworks(["192.168.0.0/24", "192.168.1.0/24"])
 * // Returns:
 * // - ok: true, value: { supernet: 192.168.0.0/23, originalNetworks: [...] }
 *
 * @example
 * // Failed aggregation (non-contiguous)
 * aggregateNetworks(["192.168.0.0/24", "192.168.2.0/24"])
 * // Returns:
 * // - ok: false, error: "Networks not contiguous: expected 192.168.1.0, got 192.168.2.0"
 */
export function aggregateNetworks(networks: string[]): CalculationResult<SupernetPayload> {
  // Validate minimum 2 networks
  if (networks.length < 2) {
    return {
      ok: false,
      error: "Need at least 2 networks to aggregate",
      code: "INVALID_INPUT",
    };
  }

  // Validate count is power of 2
  if (!isPowerOfTwo(networks.length)) {
    return {
      ok: false,
      error: "Number of networks must be a power of 2",
      code: "INVALID_INPUT",
    };
  }

  // Parse all networks and validate CIDR notation
  const parsedNetworks: Array<{ address: string; cidr: number; ipVersion: 4 | 6 }> = [];

  for (const network of networks) {
    // Validate CIDR notation
    if (!network.includes("/")) {
      return {
        ok: false,
        error: `Invalid CIDR notation: ${network}`,
        code: "INVALID_INPUT",
      };
    }

    const [address, cidrStr] = network.split("/");
    const cidr = Number.parseInt(cidrStr, 10);

    // Parse IP address
    try {
      const addr = ipaddr.parse(address);
      const ipVersion = addr.kind() === "ipv4" ? 4 : 6;
      parsedNetworks.push({ address, cidr, ipVersion });
    } catch {
      return {
        ok: false,
        error: `Invalid CIDR notation: ${network}`,
        code: "INVALID_INPUT",
      };
    }
  }

  // Validate all same IP version
  const firstVersion = parsedNetworks[0].ipVersion;
  if (!parsedNetworks.every((n) => n.ipVersion === firstVersion)) {
    return {
      ok: false,
      error: "All networks must be same IP version",
      code: "INVALID_INPUT",
    };
  }

  // Validate all same CIDR prefix
  const firstCidr = parsedNetworks[0].cidr;
  if (!parsedNetworks.every((n) => n.cidr === firstCidr)) {
    return {
      ok: false,
      error: "All networks must have same CIDR prefix",
      code: "INVALID_INPUT",
    };
  }

  // Sort networks by address numerically
  const sortedNetworks = parsedNetworks.sort((a, b) =>
    compareAddresses(a.address, b.address, firstVersion)
  );

  // Calculate new CIDR for supernet
  const bitsNeeded = Math.log2(networks.length);
  const newCidr = firstCidr - bitsNeeded;

  // Validate first network is on supernet boundary
  const firstAddress = sortedNetworks[0].address;
  const expectedFirstAddress =
    ipaddr.process(firstAddress).kind() === "ipv4"
      ? ipaddr.IPv4.networkAddressFromCIDR(`${firstAddress}/${newCidr}`).toString()
      : ipaddr.IPv6.networkAddressFromCIDR(`${firstAddress}/${newCidr}`).toString();

  if (firstAddress !== expectedFirstAddress) {
    return {
      ok: false,
      error: `First network must be on /${newCidr} boundary (expected ${expectedFirstAddress}, got ${firstAddress})`,
      code: "INVALID_INPUT",
    };
  }

  // Calculate block size for validation
  const blockSize = getBlockSize(firstVersion, firstCidr);

  // Validate networks are contiguous
  const originalNetworks: SubnetResult[] = [];
  for (let i = 0; i < sortedNetworks.length; i++) {
    const current = sortedNetworks[i];
    const subnet = calculateSubnet(current.address, current.cidr);
    originalNetworks.push(subnet);

    // Check contiguity (except for first network)
    if (i > 0) {
      const previous = sortedNetworks[i - 1];
      const expectedAddress = addToAddress(previous.address, blockSize, firstVersion);

      if (current.address !== expectedAddress) {
        return {
          ok: false,
          error: `Networks not contiguous: expected ${expectedAddress}, got ${current.address}`,
          code: "INVALID_INPUT",
        };
      }
    }
  }

  // Create supernet
  const supernet = calculateSubnet(firstAddress, newCidr);

  return {
    ok: true,
    value: {
      supernet,
      originalNetworks,
    },
  };
}

/**
 * Check if a number is a power of 2
 *
 * Uses bitwise operation: n & (n-1) === 0 for powers of 2
 * Also ensures n > 1 (1 is technically power of 2 but meaningless for aggregation)
 *
 * @param n - Number to check
 * @returns true if n is power of 2 (2, 4, 8, 16, ...)
 *
 * @example
 * isPowerOfTwo(4)  // true
 * isPowerOfTwo(5)  // false
 * isPowerOfTwo(8)  // true
 * isPowerOfTwo(1)  // false (special case)
 */
function isPowerOfTwo(n: number): boolean {
  return n > 1 && (n & (n - 1)) === 0;
}

/**
 * Calculate the address block size for a given CIDR prefix
 *
 * Block size = 2^(maxBits - cidr)
 * - IPv4 /24: 2^(32-24) = 256 addresses
 * - IPv6 /64: 2^(128-64) = 18,446,744,073,709,551,616 addresses
 *
 * @param ipVersion - 4 for IPv4, 6 for IPv6
 * @param cidr - CIDR prefix length
 * @returns Number of addresses in the block
 *
 * @example
 * getBlockSize(4, 24)  // 256n (BigInt)
 * getBlockSize(6, 64)  // 18446744073709551616n
 */
function getBlockSize(ipVersion: 4 | 6, cidr: number): bigint {
  const maxBits = ipVersion === 4 ? 32 : 128;
  const hostBits = maxBits - cidr;
  return BigInt(2) ** BigInt(hostBits);
}

/**
 * Add an offset to an IP address
 *
 * Treats IP address as a large integer and adds the offset.
 * Handles both IPv4 and IPv6.
 *
 * @param address - IP address string
 * @param offset - Number to add (as BigInt)
 * @param ipVersion - 4 for IPv4, 6 for IPv6
 * @returns New IP address string
 *
 * @example
 * addToAddress("192.168.1.0", 256n, 4)     // "192.168.2.0"
 * addToAddress("2001:db8::", 65536n, 6)    // "2001:db8::1:0"
 */
function addToAddress(address: string, offset: bigint, ipVersion: 4 | 6): string {
  const addr = ipaddr.parse(address);

  if (ipVersion === 4) {
    // IPv4: Convert octets to 32-bit integer
    const ipv4 = addr as ipaddr.IPv4;
    const octets = ipv4.octets;

    // Calculate as BigInt to handle large offsets
    let value = BigInt(octets[0]) << BigInt(24);
    value |= BigInt(octets[1]) << BigInt(16);
    value |= BigInt(octets[2]) << BigInt(8);
    value |= BigInt(octets[3]);

    // Add offset
    value += offset;

    // Convert back to octets (mask to 32 bits)
    const newOctets = [
      Number((value >> BigInt(24)) & BigInt(0xff)),
      Number((value >> BigInt(16)) & BigInt(0xff)),
      Number((value >> BigInt(8)) & BigInt(0xff)),
      Number(value & BigInt(0xff)),
    ];

    return newOctets.join(".");
  }

  // IPv6: Convert 16-bit parts to 128-bit integer
  const ipv6 = addr as ipaddr.IPv6;
  const parts = ipv6.parts;

  // Calculate as BigInt
  let value = BigInt(0);
  for (let i = 0; i < 8; i++) {
    value = (value << BigInt(16)) | BigInt(parts[i]);
  }

  // Add offset
  value += offset;

  // Convert back to 16-bit parts
  const newParts: number[] = [];
  for (let i = 7; i >= 0; i--) {
    newParts[i] = Number(value & BigInt(0xffff));
    value >>= BigInt(16);
  }

  return new ipaddr.IPv6(newParts).toString();
}

/**
 * Compare two IP addresses numerically
 *
 * @param a - First IP address
 * @param b - Second IP address
 * @param ipVersion - 4 for IPv4, 6 for IPv6
 * @returns Negative if a < b, zero if a === b, positive if a > b
 */
function compareAddresses(a: string, b: string, ipVersion: 4 | 6): number {
  const numA = addressToNumber(a, ipVersion);
  const numB = addressToNumber(b, ipVersion);

  if (numA < numB) return -1;
  if (numA > numB) return 1;
  return 0;
}

/**
 * Convert IP address to numeric value for comparison
 *
 * @param address - IP address string
 * @param ipVersion - 4 for IPv4, 6 for IPv6
 * @returns Numeric representation as BigInt
 */
function addressToNumber(address: string, ipVersion: 4 | 6): bigint {
  const addr = ipaddr.parse(address);

  if (ipVersion === 4) {
    const ipv4 = addr as ipaddr.IPv4;
    const octets = ipv4.octets;

    let value = BigInt(octets[0]) << BigInt(24);
    value |= BigInt(octets[1]) << BigInt(16);
    value |= BigInt(octets[2]) << BigInt(8);
    value |= BigInt(octets[3]);

    return value;
  }

  // IPv6
  const ipv6 = addr as ipaddr.IPv6;
  const parts = ipv6.parts;

  let value = BigInt(0);
  for (let i = 0; i < 8; i++) {
    value = (value << BigInt(16)) | BigInt(parts[i]);
  }

  return value;
}
