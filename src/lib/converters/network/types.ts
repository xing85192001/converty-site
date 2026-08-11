/**
 * TypeScript interfaces for subnet calculations
 *
 * Supports both IPv4 and IPv6 subnet calculations with proper type safety.
 * Uses BigInt for host counts to handle IPv6's large address space.
 */

/**
 * Input for subnet calculation
 *
 * Can accept either CIDR notation (ipAddress with cidr) or
 * subnet mask notation (ipAddress with subnetMask, IPv4 only).
 */
export interface SubnetInput {
  ipAddress: string;
  cidr?: number;
  subnetMask?: string;
}

/**
 * Result of subnet calculation
 *
 * Contains all calculated subnet properties. IPv4 and IPv6 differ:
 * - IPv6 has no broadcast address (uses multicast instead) - returns null
 * - IPv6 has no subnet mask notation (only CIDR) - returns null
 * - IPv6 doesn't reserve network/broadcast addresses (except /128)
 */
export interface SubnetResult {
  /** Network address (first address in subnet) */
  networkAddress: string;

  /**
   * Broadcast address (last address in subnet)
   * @remarks IPv6 has no broadcast - uses multicast (ff02::1) instead
   */
  broadcastAddress: string | null;

  /** First usable host address */
  firstUsable: string;

  /** Last usable host address */
  lastUsable: string;

  /**
   * Number of usable host addresses
   * @remarks Uses BigInt as IPv6 subnets can exceed Number.MAX_SAFE_INTEGER
   * @remarks IPv4 special cases: /32 = 1 host, /31 = 2 hosts (RFC 3021)
   * @remarks IPv6: No network/broadcast reservation except /128 = 1 host
   */
  usableHosts: bigint;

  /**
   * Total number of addresses in subnet (including network/broadcast)
   * @remarks Uses BigInt for IPv6 address space
   */
  totalHosts: bigint;

  /** CIDR prefix length (0-32 for IPv4, 0-128 for IPv6) */
  cidr: number;

  /**
   * Subnet mask in dotted decimal notation
   * @remarks Only applicable to IPv4 - IPv6 uses CIDR notation exclusively
   */
  subnetMask: string | null;

  /** IP version (4 or 6) */
  ipVersion: 4 | 6;
}

/**
 * Parsed IP input after processing CIDR or subnet mask notation
 */
export interface ParsedInput {
  /** Normalized IP address string */
  ipAddress: string;

  /** CIDR prefix length */
  cidr: number;

  /** Original input format */
  format: "cidr" | "mask";
}

/**
 * Result of IP address validation
 */
export interface IPValidationResult {
  /** Whether the IP address is valid */
  valid: boolean;

  /** IP version if valid, null otherwise */
  version: 4 | 6 | null;

  /** Error message if invalid */
  error?: string;
}

/**
 * Calculator operation mode
 */
export type CalculatorMode = "basic" | "subnetting" | "supernetting";

/**
 * Division options for subnetting (powers of 2)
 */
export type DivisionCount = 2 | 4 | 8 | 16 | 32 | 64 | 128 | 256;

// Re-export CIDR range types for convenience
export type { CIDRRangeResult, IPInRangeResult } from "./cidr-range";
// Re-export IP classification types
export type { IPClassification } from "./ip-classifier";
// Re-export latency converter types
export type { LatencyConversion, LatencyResult, LatencyUnit } from "./latency-converter";
// Re-export subnetting types for convenience
export type { SubnetDivision } from "./subnetting";
export type { SupernetPayload } from "./supernetting";
// Re-export throughput calculator types
export type {
  ThroughputConversion,
  ThroughputInput,
  ThroughputResult,
  TimeUnit,
} from "./throughput-calculator";
