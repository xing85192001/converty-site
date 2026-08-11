/**
 * Subnet calculation functions for IPv4 and IPv6
 *
 * Provides comprehensive subnet calculations including:
 * - Network and broadcast addresses (IPv4 only)
 * - Usable host range and counts
 * - Special case handling (/31, /32 for IPv4; /128 for IPv6)
 * - BigInt support for IPv6's large address space
 *
 * Uses ipaddr.js for IP address manipulation.
 */

import ipaddr from "ipaddr.js";
import type { SubnetResult } from "./types";

/**
 * Calculate subnet information from IP address and CIDR prefix
 *
 * @param ipAddress - IP address string (IPv4 or IPv6)
 * @param cidr - CIDR prefix length (0-32 for IPv4, 0-128 for IPv6)
 * @returns Complete subnet calculation results
 * @throws Error if IP address is invalid
 *
 * @example
 * // IPv4 /24 subnet
 * calculateSubnet("192.168.1.0", 24)
 * // Returns: network 192.168.1.0, broadcast 192.168.1.255, 254 usable hosts
 *
 * // IPv4 /32 (single host)
 * calculateSubnet("192.168.1.1", 32)
 * // Returns: 1 usable host, first = last = 192.168.1.1
 *
 * // IPv4 /31 (point-to-point, RFC 3021)
 * calculateSubnet("10.0.0.0", 31)
 * // Returns: 2 usable hosts, no network/broadcast reservation
 *
 * // IPv6 /64 subnet
 * calculateSubnet("2001:db8::", 64)
 * // Returns: network 2001:db8::, no broadcast, massive host count
 */
export function calculateSubnet(ipAddress: string, cidr: number): SubnetResult {
  // Parse IP address
  const addr = ipaddr.parse(ipAddress);

  // Delegate to version-specific function
  if (addr.kind() === "ipv4") {
    return calculateIPv4Subnet(addr as ipaddr.IPv4, cidr);
  }

  return calculateIPv6Subnet(addr as ipaddr.IPv6, cidr);
}

/**
 * Calculate IPv4 subnet information
 *
 * Handles special cases:
 * - /32: Single host (1 usable address)
 * - /31: Point-to-point link per RFC 3021 (2 usable addresses, no network/broadcast)
 * - /30 and larger: Standard subnet (totalHosts - 2 usable addresses)
 *
 * @param addr - Parsed IPv4 address
 * @param cidr - CIDR prefix length (0-32)
 * @returns IPv4 subnet calculation results
 */
function calculateIPv4Subnet(addr: ipaddr.IPv4, cidr: number): SubnetResult {
  // Calculate network and broadcast addresses using ipaddr.js
  const networkAddr = ipaddr.IPv4.networkAddressFromCIDR(`${addr.toString()}/${cidr}`).toString();
  const broadcastAddr = ipaddr.IPv4.broadcastAddressFromCIDR(
    `${addr.toString()}/${cidr}`
  ).toString();

  // Calculate host count: 2^(32-cidr)
  const hostBits = 32 - cidr;
  const totalHosts = BigInt(2) ** BigInt(hostBits);

  // Determine usable hosts and range based on CIDR
  let usableHosts: bigint;
  let firstUsable: string;
  let lastUsable: string;

  if (cidr === 32) {
    // /32: Single host
    usableHosts = BigInt(1);
    firstUsable = addr.toString();
    lastUsable = addr.toString();
  } else if (cidr === 31) {
    // /31: Point-to-point link (RFC 3021)
    // Both addresses are usable, no network/broadcast reservation
    usableHosts = BigInt(2);
    firstUsable = networkAddr;
    lastUsable = broadcastAddr;
  } else {
    // Standard subnet: exclude network and broadcast addresses
    usableHosts = totalHosts - BigInt(2);

    // First usable = network + 1
    const networkBytes = networkAddr.split(".").map(Number);
    networkBytes[3] += 1;
    firstUsable = networkBytes.join(".");

    // Last usable = broadcast - 1
    const broadcastBytes = broadcastAddr.split(".").map(Number);
    broadcastBytes[3] -= 1;
    lastUsable = broadcastBytes.join(".");
  }

  // Get subnet mask
  const subnetMask = ipaddr.IPv4.subnetMaskFromPrefixLength(cidr).toString();

  return {
    networkAddress: networkAddr,
    broadcastAddress: broadcastAddr,
    firstUsable,
    lastUsable,
    usableHosts,
    totalHosts,
    cidr,
    subnetMask,
    ipVersion: 4,
  };
}

/**
 * Calculate IPv6 subnet information
 *
 * IPv6 subnets differ from IPv4:
 * - No broadcast address (uses multicast ff02::1 for all-nodes)
 * - No network address reservation (all addresses usable except /128)
 * - Only CIDR notation (no subnet mask equivalent)
 *
 * @param addr - Parsed IPv6 address
 * @param cidr - CIDR prefix length (0-128)
 * @returns IPv6 subnet calculation results
 */
function calculateIPv6Subnet(addr: ipaddr.IPv6, cidr: number): SubnetResult {
  // IPv6 addresses are represented as 8 16-bit parts
  const parts = addr.parts;

  // Calculate network address by zeroing host bits
  const networkParts = calculateIPv6NetworkAddress(parts, cidr);
  const networkAddr = new ipaddr.IPv6(networkParts).toString();

  // Calculate last address by setting all host bits to 1
  const lastParts = calculateIPv6LastAddress(parts, cidr);
  const lastAddr = new ipaddr.IPv6(lastParts).toString();

  // Calculate host count: 2^(128-cidr)
  const hostBits = 128 - cidr;
  const totalHosts = BigInt(2) ** BigInt(hostBits);

  // IPv6 doesn't reserve network/broadcast addresses
  // Exception: /128 is a single address
  const usableHosts = cidr === 128 ? BigInt(1) : totalHosts;

  return {
    networkAddress: networkAddr,
    broadcastAddress: null, // IPv6 has no broadcast
    firstUsable: networkAddr, // No network address reservation
    lastUsable: lastAddr,
    usableHosts,
    totalHosts,
    cidr,
    subnetMask: null, // IPv6 only uses CIDR notation
    ipVersion: 6,
  };
}

/**
 * Calculate IPv6 network address by zeroing host bits
 *
 * IPv6 addresses are 128 bits represented as 8 16-bit parts.
 * Network address is calculated by:
 * 1. Keeping all parts before the network/host boundary
 * 2. Masking the part containing the boundary
 * 3. Zeroing all parts after the boundary
 *
 * @param parts - Array of 8 16-bit integers representing IPv6 address
 * @param cidr - CIDR prefix length (0-128)
 * @returns Array of 8 16-bit integers representing network address
 */
function calculateIPv6NetworkAddress(parts: number[], cidr: number): number[] {
  const result = [...parts];

  // Determine which 16-bit parts are fully in the network portion
  const fullParts = Math.floor(cidr / 16);
  const remainingBits = cidr % 16;

  // Zero out all parts after the network portion
  for (let i = fullParts + 1; i < 8; i++) {
    result[i] = 0;
  }

  // Handle the part that contains the network/host boundary
  if (remainingBits > 0 && fullParts < 8) {
    // Create mask: set network bits to 1, host bits to 0
    // Example: remainingBits = 8 → mask = 0xFF00
    const mask = (0xffff << (16 - remainingBits)) & 0xffff;
    result[fullParts] = result[fullParts] & mask;
  }

  return result;
}

/**
 * Calculate IPv6 last address by setting all host bits to 1
 *
 * Last address in subnet is calculated by:
 * 1. Keeping all parts before the network/host boundary
 * 2. Setting host bits in boundary part to 1
 * 3. Setting all parts after the boundary to 0xFFFF
 *
 * @param parts - Array of 8 16-bit integers representing IPv6 address
 * @param cidr - CIDR prefix length (0-128)
 * @returns Array of 8 16-bit integers representing last address
 */
function calculateIPv6LastAddress(parts: number[], cidr: number): number[] {
  const result = [...parts];

  // Determine which 16-bit parts are fully in the network portion
  const fullParts = Math.floor(cidr / 16);
  const remainingBits = cidr % 16;

  // Set all parts after network portion to maximum value
  for (let i = fullParts + 1; i < 8; i++) {
    result[i] = 0xffff;
  }

  // Handle the part that contains the network/host boundary
  if (remainingBits > 0 && fullParts < 8) {
    // Create mask: set network bits to 1, host bits to 0
    const mask = (0xffff << (16 - remainingBits)) & 0xffff;
    // Keep network bits, set host bits to 1
    result[fullParts] = (result[fullParts] & mask) | (~mask & 0xffff);
  }

  return result;
}
