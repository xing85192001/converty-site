/**
 * IP address classification functions
 *
 * Classifies IP addresses by class (A-E for IPv4) and identifies
 * public/private status using ipaddr.js range detection.
 *
 * Features:
 * - IPv4 class detection (A, B, C, D, E)
 * - IPv6 support (no class system)
 * - Public/private/special address identification
 * - RFC 1918 private range detection
 * - Loopback, link-local, and other special ranges
 */

import ipaddr from "ipaddr.js";

/**
 * IP classification result
 *
 * Contains IP class (IPv4 only), public/private status,
 * and human-readable range descriptions.
 */
export interface IPClassification {
  /** IP class for IPv4 (A-E), null for IPv6 (no class system) */
  ipClass: "A" | "B" | "C" | "D" | "E" | null;

  /** Whether the IP is in a private range (RFC 1918, IPv6 unique local) */
  isPrivate: boolean;

  /** Whether the IP is publicly routable on the internet */
  isPublic: boolean;

  /** Whether the IP is a special-purpose address (loopback, link-local, etc.) */
  isSpecial: boolean;

  /** Range type from ipaddr.js (private, unicast, loopback, linkLocal, etc.) */
  rangeType: string;

  /** Human-readable description of the IP range */
  rangeDescription: string;

  /** IP version (4 or 6) */
  ipVersion: 4 | 6;

  /** Normalized IP address string */
  normalizedIP: string;
}

/**
 * Classify an IP address by class and public/private status
 *
 * @param ipAddress - IP address string (IPv4 or IPv6)
 * @returns Complete IP classification
 * @throws Error if IP address is invalid
 *
 * @example
 * // Public IPv4 Class A
 * classifyIPAddress("8.8.8.8")
 * // Returns: class A, public, unicast range
 *
 * // Private IPv4 Class C (RFC 1918)
 * classifyIPAddress("192.168.1.1")
 * // Returns: class C, private, RFC 1918 range
 *
 * // IPv4 Class D (Multicast)
 * classifyIPAddress("224.0.0.1")
 * // Returns: class D, special, multicast range
 *
 * // Loopback
 * classifyIPAddress("127.0.0.1")
 * // Returns: special, loopback range
 *
 * // IPv6 (no classes)
 * classifyIPAddress("2001:db8::1")
 * // Returns: null class, range-specific classification
 */
export function classifyIPAddress(ipAddress: string): IPClassification {
  // Validate IP address
  if (!ipaddr.isValid(ipAddress)) {
    throw new Error("Invalid IP address");
  }

  // Parse IP address
  const addr = ipaddr.parse(ipAddress);
  const version = addr.kind() === "ipv4" ? 4 : 6;

  // Get range type from ipaddr.js
  const rangeType = addr.range();

  // Determine if IPv4
  if (version === 4) {
    return classifyIPv4(addr as ipaddr.IPv4, rangeType);
  }

  return classifyIPv6(addr as ipaddr.IPv6, rangeType);
}

/**
 * Classify IPv4 address
 *
 * Determines class from first octet:
 * - 0: Special (reserved, not Class A)
 * - 1-126: Class A
 * - 127: Special (loopback, not Class A)
 * - 128-191: Class B
 * - 192-223: Class C
 * - 224-239: Class D (multicast)
 * - 240-255: Class E (reserved)
 *
 * @param addr - Parsed IPv4 address
 * @param rangeType - Range type from ipaddr.js
 * @returns IPv4 classification
 */
function classifyIPv4(addr: ipaddr.IPv4, rangeType: string): IPClassification {
  const octets = addr.octets;
  const firstOctet = octets[0];

  // Determine IP class from first octet
  let ipClass: "A" | "B" | "C" | "D" | "E";

  if (firstOctet === 0) {
    // 0.0.0.0/8 - Special (current network)
    ipClass = "A"; // Technically Class A range, but special purpose
  } else if (firstOctet >= 1 && firstOctet <= 126) {
    // 1.0.0.0 - 126.255.255.255
    ipClass = "A";
  } else if (firstOctet === 127) {
    // 127.0.0.0/8 - Loopback (special)
    ipClass = "A"; // Technically Class A range, but special purpose
  } else if (firstOctet >= 128 && firstOctet <= 191) {
    // 128.0.0.0 - 191.255.255.255
    ipClass = "B";
  } else if (firstOctet >= 192 && firstOctet <= 223) {
    // 192.0.0.0 - 223.255.255.255
    ipClass = "C";
  } else if (firstOctet >= 224 && firstOctet <= 239) {
    // 224.0.0.0 - 239.255.255.255
    ipClass = "D";
  } else {
    // 240.0.0.0 - 255.255.255.255
    ipClass = "E";
  }

  // Determine public/private/special status
  const { isPrivate, isPublic, isSpecial, rangeDescription } = classifyRange(rangeType);

  return {
    ipClass,
    isPrivate,
    isPublic,
    isSpecial,
    rangeType,
    rangeDescription,
    ipVersion: 4,
    normalizedIP: addr.toString(),
  };
}

/**
 * Classify IPv6 address
 *
 * IPv6 does not have a class system like IPv4.
 * Classification is based solely on range type.
 *
 * @param addr - Parsed IPv6 address
 * @param rangeType - Range type from ipaddr.js
 * @returns IPv6 classification
 */
function classifyIPv6(addr: ipaddr.IPv6, rangeType: string): IPClassification {
  // IPv6 has no class system
  const ipClass = null;

  // Determine public/private/special status
  const { isPrivate, isPublic, isSpecial, rangeDescription } = classifyRange(rangeType);

  return {
    ipClass,
    isPrivate,
    isPublic,
    isSpecial,
    rangeType,
    rangeDescription,
    ipVersion: 6,
    normalizedIP: addr.toString(),
  };
}

/**
 * Classify IP range type into public/private/special categories
 *
 * Maps ipaddr.js range types to human-readable descriptions and categories.
 *
 * @param rangeType - Range type from ipaddr.js
 * @returns Classification details
 */
function classifyRange(rangeType: string): {
  isPrivate: boolean;
  isPublic: boolean;
  isSpecial: boolean;
  rangeDescription: string;
} {
  switch (rangeType) {
    // Private ranges
    case "private":
      return {
        isPrivate: true,
        isPublic: false,
        isSpecial: false,
        rangeDescription: "Private network (RFC 1918)",
      };

    case "uniqueLocal":
      return {
        isPrivate: true,
        isPublic: false,
        isSpecial: false,
        rangeDescription: "Unique local address (IPv6 private)",
      };

    // Public ranges
    case "unicast":
      return {
        isPrivate: false,
        isPublic: true,
        isSpecial: false,
        rangeDescription: "Public/Routable address",
      };

    // Special purpose ranges
    case "loopback":
      return {
        isPrivate: false,
        isPublic: false,
        isSpecial: true,
        rangeDescription: "Loopback address (localhost)",
      };

    case "linkLocal":
      return {
        isPrivate: false,
        isPublic: false,
        isSpecial: true,
        rangeDescription: "Link-local address",
      };

    case "broadcast":
      return {
        isPrivate: false,
        isPublic: false,
        isSpecial: true,
        rangeDescription: "Broadcast address (255.255.255.255)",
      };

    case "unspecified":
      return {
        isPrivate: false,
        isPublic: false,
        isSpecial: true,
        rangeDescription: "Unspecified address (0.0.0.0 or ::)",
      };

    case "multicast":
      return {
        isPrivate: false,
        isPublic: false,
        isSpecial: true,
        rangeDescription: "Multicast address",
      };

    case "reserved":
      return {
        isPrivate: false,
        isPublic: false,
        isSpecial: true,
        rangeDescription: "Reserved address",
      };

    case "carrierGradeNat":
      return {
        isPrivate: true,
        isPublic: false,
        isSpecial: false,
        rangeDescription: "Carrier-grade NAT (RFC 6598)",
      };

    case "ipv4Mapped":
      return {
        isPrivate: false,
        isPublic: false,
        isSpecial: true,
        rangeDescription: "IPv4-mapped IPv6 address",
      };

    case "rfc6145":
      return {
        isPrivate: false,
        isPublic: false,
        isSpecial: true,
        rangeDescription: "IPv4/IPv6 translation (RFC 6145)",
      };

    case "rfc6052":
      return {
        isPrivate: false,
        isPublic: false,
        isSpecial: true,
        rangeDescription: "IPv4/IPv6 translation (RFC 6052)",
      };

    case "6to4":
      return {
        isPrivate: false,
        isPublic: false,
        isSpecial: true,
        rangeDescription: "6to4 address",
      };

    case "teredo":
      return {
        isPrivate: false,
        isPublic: false,
        isSpecial: true,
        rangeDescription: "Teredo tunneling",
      };

    default:
      // Unknown range type - treat as public
      return {
        isPrivate: false,
        isPublic: true,
        isSpecial: false,
        rangeDescription: `Unknown range (${rangeType})`,
      };
  }
}
