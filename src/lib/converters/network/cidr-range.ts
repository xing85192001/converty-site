/**
 * CIDR range calculation and IP-in-range checking
 *
 * Provides functions to:
 * - Calculate IP ranges from CIDR notation
 * - Check if an IP address falls within a CIDR range
 * - Support both IPv4 and IPv6
 *
 * Uses ipaddr.js for IP address manipulation and range checking.
 */

import ipaddr from "ipaddr.js";
import { calculateSubnet } from "./subnet-calculator";

/**
 * Result of CIDR range calculation
 *
 * Contains first and last IP addresses in the CIDR block,
 * along with usable range and host counts.
 */
export interface CIDRRangeResult {
  /** Original CIDR input */
  cidrInput: string;

  /** Network address (first IP in range) */
  networkAddress: string;

  /** Broadcast address for IPv4, null for IPv6 */
  broadcastAddress: string | null;

  /** First IP address (same as network address) */
  firstIP: string;

  /** Last IP address (broadcast for IPv4, last address for IPv6) */
  lastIP: string;

  /** First usable IP address */
  firstUsable: string;

  /** Last usable IP address */
  lastUsable: string;

  /** Total number of addresses in range */
  totalHosts: bigint;

  /** Number of usable addresses */
  usableHosts: bigint;

  /** IP version (4 or 6) */
  ipVersion: 4 | 6;
}

/**
 * Result of IP-in-range check
 *
 * Indicates whether an IP address falls within a CIDR range,
 * along with the range information for context.
 */
export interface IPInRangeResult {
  /** IP address that was checked */
  ipAddress: string;

  /** CIDR range that was checked against */
  cidr: string;

  /** Whether the IP is within the CIDR range */
  isInRange: boolean;

  /** Detailed range information */
  rangeInfo: CIDRRangeResult;
}

/**
 * Calculate IP range from CIDR notation
 *
 * @param cidr - CIDR notation (e.g., "192.168.1.0/24" or "2001:db8::/32")
 * @returns Complete CIDR range information
 * @throws Error if CIDR format is invalid
 *
 * @example
 * // IPv4 /24 subnet
 * calculateCIDRRange("192.168.1.0/24")
 * // Returns: first 192.168.1.0, last 192.168.1.255
 *
 * // IPv6 /64 subnet
 * calculateCIDRRange("2001:db8::/64")
 * // Returns: first 2001:db8::, last 2001:db8::ffff:ffff:ffff:ffff
 */
export function calculateCIDRRange(cidr: string): CIDRRangeResult {
  // Validate CIDR format
  if (!cidr.includes("/")) {
    throw new Error("Invalid CIDR: must include prefix (e.g., /24)");
  }

  const [ip, prefix] = cidr.split("/");
  const prefixNum = parseInt(prefix, 10);

  // Validate prefix is a number
  if (Number.isNaN(prefixNum)) {
    throw new Error(`Invalid CIDR prefix: ${prefix}`);
  }

  // Use existing subnet calculator
  const subnetResult = calculateSubnet(ip, prefixNum);

  return {
    cidrInput: cidr,
    networkAddress: subnetResult.networkAddress,
    broadcastAddress: subnetResult.broadcastAddress,
    firstIP: subnetResult.networkAddress,
    lastIP: subnetResult.broadcastAddress || subnetResult.lastUsable,
    firstUsable: subnetResult.firstUsable,
    lastUsable: subnetResult.lastUsable,
    totalHosts: subnetResult.totalHosts,
    usableHosts: subnetResult.usableHosts,
    ipVersion: subnetResult.ipVersion,
  };
}

/**
 * Check if an IP address is within a CIDR range
 *
 * @param ipAddress - IP address to check (e.g., "192.168.1.50" or "2001:db8::1")
 * @param cidr - CIDR range (e.g., "192.168.1.0/24" or "2001:db8::/32")
 * @returns Result indicating if IP is in range with range details
 * @throws Error if IP or CIDR is invalid, or version mismatch
 *
 * @example
 * // Check if 192.168.1.50 is in 192.168.1.0/24
 * checkIPInRange("192.168.1.50", "192.168.1.0/24")
 * // Returns: { isInRange: true, ... }
 *
 * // Check if 192.168.2.1 is in 192.168.1.0/24
 * checkIPInRange("192.168.2.1", "192.168.1.0/24")
 * // Returns: { isInRange: false, ... }
 *
 * // Version mismatch throws error
 * checkIPInRange("192.168.1.1", "2001:db8::/32")
 * // Throws: IP version mismatch
 */
export function checkIPInRange(ipAddress: string, cidr: string): IPInRangeResult {
  // Calculate range first
  const rangeInfo = calculateCIDRRange(cidr);

  // Parse both addresses
  const addr = ipaddr.parse(ipAddress);
  const parsedCidr = ipaddr.parseCIDR(cidr);

  // Version mismatch check
  if (addr.kind() !== parsedCidr[0].kind()) {
    throw new Error("IP version mismatch: cannot compare IPv4 with IPv6");
  }

  // Use ipaddr.js match() for IP-in-range check
  const isInRange = addr.match(parsedCidr);

  return {
    ipAddress,
    cidr,
    isInRange,
    rangeInfo,
  };
}
