/**
 * Subnet division (subnetting) functions
 *
 * Divides a network into smaller equal subnets.
 * Supports IPv4 and IPv6 with validation for power-of-2 divisions.
 */

import ipaddr from "ipaddr.js";
import { calculateSubnet } from "./subnet-calculator";
import type { SubnetResult } from "./types";

/**
 * Result of subnet division
 */
export interface SubnetDivision {
  /** Original parent subnet */
  parent: SubnetResult;

  /** Array of child subnets */
  children: SubnetResult[];

  /** Number of divisions (must be power of 2) */
  divisions: number;

  /** New CIDR prefix length for child subnets */
  newCidr: number;
}

/**
 * Divide a network into smaller equal subnets
 *
 * @param networkAddress - Network address (IPv4 or IPv6)
 * @param cidr - Current CIDR prefix length
 * @param divisions - Number of subnets to create (must be power of 2)
 * @returns Subnet division with parent and children
 * @throws Error if divisions is not power of 2 or CIDR would exceed maximum
 *
 * @example
 * // Divide 192.168.1.0/24 into 4 /26 subnets
 * divideSubnet("192.168.1.0", 24, 4)
 * // Returns:
 * // - parent: 192.168.1.0/24
 * // - children: [192.168.1.0/26, 192.168.1.64/26, 192.168.1.128/26, 192.168.1.192/26]
 * // - divisions: 4
 * // - newCidr: 26
 *
 * @example
 * // Divide IPv6 2001:db8::/32 into 4 /34 subnets
 * divideSubnet("2001:db8::", 32, 4)
 * // Returns 4 equal /34 subnets
 */
export function divideSubnet(
  networkAddress: string,
  cidr: number,
  divisions: number
): SubnetDivision {
  // Validate divisions is power of 2
  if (!isPowerOfTwo(divisions)) {
    throw new Error(`Divisions must be a power of 2 (2, 4, 8, 16, ...), got ${divisions}`);
  }

  // Parse IP to determine version
  const addr = ipaddr.parse(networkAddress);
  const ipVersion = addr.kind() === "ipv4" ? 4 : 6;
  const maxCidr = ipVersion === 4 ? 32 : 128;

  // Calculate bits needed and new CIDR
  const bitsNeeded = Math.log2(divisions);
  const newCidr = cidr + bitsNeeded;

  // Validate new CIDR doesn't exceed maximum
  if (newCidr > maxCidr) {
    throw new Error(
      `Cannot divide /${cidr} into ${divisions} subnets: would require /${newCidr} (max is /${maxCidr})`
    );
  }

  // Calculate parent subnet
  const parent = calculateSubnet(networkAddress, cidr);

  // Calculate block size for each child subnet
  const blockSize = getBlockSize(ipVersion, newCidr);

  // Generate child subnets
  const children: SubnetResult[] = [];
  for (let i = 0; i < divisions; i++) {
    const offset = blockSize * BigInt(i);
    const childAddress = addToAddress(parent.networkAddress, offset, ipVersion);
    const child = calculateSubnet(childAddress, newCidr);
    children.push(child);
  }

  return {
    parent,
    children,
    divisions,
    newCidr,
  };
}

/**
 * Check if a number is a power of 2
 *
 * Uses bitwise operation: n & (n-1) === 0 for powers of 2
 * Also ensures n > 1 (1 is technically power of 2 but meaningless for division)
 *
 * @param n - Number to check
 * @returns true if n is power of 2 (2, 4, 8, 16, ...)
 *
 * @example
 * isPowerOfTwo(4)  // true
 * isPowerOfTwo(5)  // false
 * isPowerOfTwo(8)  // true
 * isPowerOfTwo(1)  // false (special case: cannot divide into 1)
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
 * addToAddress("192.168.1.0", 64n, 4)      // "192.168.1.64"
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
