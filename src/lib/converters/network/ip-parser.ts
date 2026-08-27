/**
 * IP address parsing and validation utilities
 *
 * Handles both IPv4 and IPv6 addresses with support for:
 * - CIDR notation (192.168.1.0/24, 2001:db8::/32)
 * - Subnet mask notation (192.168.1.0 + 255.255.255.0, IPv4 only)
 *
 * Uses ipaddr.js for robust IP parsing and validation.
 */

import ipaddr from "ipaddr.js";
import type { IPValidationResult, ParsedInput } from "./types";

/**
 * Parse IP input with CIDR or subnet mask notation
 *
 * @param input - IP address with optional CIDR (e.g., "192.168.1.0/24")
 * @param subnetMask - Optional subnet mask (e.g., "255.255.255.0", IPv4 only)
 * @returns Parsed input with normalized IP address and CIDR
 * @throws Error if input is invalid or malformed
 *
 * @example
 * // CIDR notation
 * parseIPInput("192.168.1.0/24") // { ipAddress: "192.168.1.0", cidr: 24, format: "cidr" }
 * parseIPInput("2001:db8::/32") // { ipAddress: "2001:db8::", cidr: 32, format: "cidr" }
 *
 * // Subnet mask notation (IPv4 only)
 * parseIPInput("192.168.1.0", "255.255.255.0") // { ipAddress: "192.168.1.0", cidr: 24, format: "mask" }
 */
export function parseIPInput(input: string, subnetMask?: string): ParsedInput {
  // Try CIDR notation first (e.g., "192.168.1.0/24" or "2001:db8::/32")
  if (input.includes("/")) {
    // Validate CIDR notation
    if (!ipaddr.isValidCIDR(input)) {
      throw new Error("Invalid CIDR notation");
    }

    // Split and parse
    const [ip, cidrStr] = input.split("/");
    const cidr = Number.parseInt(cidrStr, 10);

    // Validate IP address
    if (!ipaddr.isValid(ip)) {
      throw new Error("Invalid IP address format");
    }

    // Validate CIDR range based on IP version
    const addr = ipaddr.parse(ip);
    const maxCidr = addr.kind() === "ipv4" ? 32 : 128;

    if (Number.isNaN(cidr) || cidr < 0 || cidr > maxCidr) {
      throw new Error(
        `CIDR must be between 0 and ${maxCidr} for ${addr.kind() === "ipv4" ? "IPv4" : "IPv6"}`
      );
    }

    return {
      ipAddress: ip,
      cidr,
      format: "cidr",
    };
  }

  // No CIDR notation - subnet mask required
  if (!subnetMask) {
    throw new Error("Must provide either CIDR notation or subnet mask");
  }

  // Validate IP address
  if (!ipaddr.isValid(input)) {
    throw new Error("Invalid IP address format");
  }

  // Parse IP address
  const addr = ipaddr.parse(input);

  // Subnet mask notation only supported for IPv4
  if (addr.kind() !== "ipv4") {
    throw new Error("Subnet mask notation only supported for IPv4");
  }

  // Validate and parse subnet mask
  if (!ipaddr.isValid(subnetMask)) {
    throw new Error("Invalid subnet mask");
  }

  try {
    const maskAddr = ipaddr.IPv4.parse(subnetMask);
    const cidr = maskAddr.prefixLengthFromSubnetMask();

    if (cidr === null) {
      throw new Error("Invalid subnet mask");
    }

    return {
      ipAddress: input,
      cidr,
      format: "mask",
    };
  } catch {
    throw new Error("Invalid subnet mask");
  }
}

/**
 * Validate IP address and determine version
 *
 * @param ip - IP address string to validate
 * @returns Validation result with IP version if valid
 *
 * @example
 * validateIPAddress("192.168.1.1") // { valid: true, version: 4 }
 * validateIPAddress("2001:db8::1") // { valid: true, version: 6 }
 * validateIPAddress("invalid") // { valid: false, version: null, error: "Invalid IP address format" }
 */
export function validateIPAddress(ip: string): IPValidationResult {
  // Check if IP is valid
  if (!ipaddr.isValid(ip)) {
    return {
      valid: false,
      version: null,
      error: "Invalid IP address format",
    };
  }

  try {
    // Parse to determine version
    const addr = ipaddr.parse(ip);
    const version = addr.kind() === "ipv4" ? 4 : 6;

    return {
      valid: true,
      version,
    };
  } catch (error) {
    return {
      valid: false,
      version: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
