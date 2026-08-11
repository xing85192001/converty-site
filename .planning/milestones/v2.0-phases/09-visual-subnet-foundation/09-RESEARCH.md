# Phase 9: Visual Subnet Calculator Foundation - Research

**Researched:** 2026-01-18
**Domain:** IP address manipulation, subnet calculation (IPv4/IPv6)
**Confidence:** MEDIUM

## Summary

A Visual Subnet Calculator requires robust IP address parsing, validation, and calculation algorithms for both IPv4 and IPv6. The JavaScript ecosystem offers several mature TypeScript libraries that handle the complexity of IP address manipulation, CIDR notation parsing, and subnet calculations.

The research reveals that **ipaddr.js** and **ip-num** are the most suitable libraries for this domain. ipaddr.js is lightweight (1.9K minified), widely adopted (55M+ weekly downloads), and provides essential subnet calculation methods. ip-num offers comprehensive TypeScript support with zero dependencies and handles IPv4, IPv6, and ASN numbers with strong type safety.

Critical differences between IPv4 and IPv6 subnet calculations include: IPv6 has no broadcast addresses (uses multicast instead), different special-case prefix lengths (/31, /32 for IPv4 vs /64, /127, /128 for IPv6), and larger address space requiring BigInt support for calculations.

**Primary recommendation:** Use **ipaddr.js** for core IP parsing/validation and implement subnet calculations as pure TypeScript functions. This approach balances library maturity, bundle size, and type safety while maintaining control over calculation logic.

## Standard Stack

The established libraries/tools for IP address manipulation and subnet calculation:

### Core

| Library    | Version | Purpose                                        | Why Standard                                                                          |
| ---------- | ------- | ---------------------------------------------- | ------------------------------------------------------------------------------------- |
| ipaddr.js  | 2.2.0+  | IPv4/IPv6 parsing, validation, CIDR operations | 55M+ weekly downloads, lightweight (1.9K), battle-tested, has built-in subnet methods |
| TypeScript | 5.x     | Type safety for IP addresses and calculations  | Project requirement, ensures correctness                                              |

### Supporting

| Library    | Version | Purpose                             | When to Use                                                                |
| ---------- | ------- | ----------------------------------- | -------------------------------------------------------------------------- |
| ip-num     | Latest  | Comprehensive TypeScript IP library | If needing advanced features like IP pools, range aggregation, ASN support |
| ip-address | 10.x+   | Alternative with Teredo support     | If needing specialized IPv6 features like Teredo inspection                |

### Alternatives Considered

| Instead of    | Could Use   | Tradeoff                                                                   |
| ------------- | ----------- | -------------------------------------------------------------------------- |
| ipaddr.js     | ip-num      | More features but larger bundle, zero dependencies is good for TreeShaking |
| ipaddr.js     | ip-address  | More IPv6 features but less adoption (26M vs 55M weekly downloads)         |
| Library-based | Hand-rolled | Full control but extremely error-prone due to IPv4/IPv6 edge cases         |

**Installation:**

```bash
npm install ipaddr.js
npm install --save-dev @types/ipaddr.js  # If types not bundled
```

## Architecture Patterns

### Recommended Project Structure

```
src/
├── lib/
│   └── converters/
│       └── network/
│           ├── subnet-calculator.ts        # Pure calculation functions
│           ├── ip-parser.ts                # IP parsing/validation utilities
│           └── types.ts                    # TypeScript interfaces
├── stores/
│   └── subnet-calculator-store.ts          # Zustand store with URL sync
└── app/
    └── [locale]/
        └── network/
            └── subnet-calculator/
                ├── subnet-calculator.tsx    # Calculator component
                └── page.tsx                 # Next.js page
```

### Pattern 1: Pure Calculation Functions

**What:** Separate IP parsing, validation, and calculation logic into pure functions that don't depend on React or state management.
**When to use:** Always for calculation logic to enable testing, reusability, and type safety.
**Example:**

```typescript
// src/lib/converters/network/subnet-calculator.ts
import ipaddr from "ipaddr.js";

export interface SubnetResult {
  networkAddress: string;
  broadcastAddress: string | null; // null for IPv6
  firstUsable: string;
  lastUsable: string;
  usableHosts: bigint;
  totalHosts: bigint;
  cidr: number;
  subnetMask: string | null; // null for IPv6
  ipVersion: 4 | 6;
}

export function calculateSubnet(ipAddress: string, cidr: number): SubnetResult {
  // Parse IP address
  const addr = ipaddr.parse(ipAddress);

  if (addr.kind() === "ipv4") {
    return calculateIPv4Subnet(addr as ipaddr.IPv4, cidr);
  } else {
    return calculateIPv6Subnet(addr as ipaddr.IPv6, cidr);
  }
}

function calculateIPv4Subnet(addr: ipaddr.IPv4, cidr: number): SubnetResult {
  // Network address: IP AND subnet mask
  const networkAddr = ipaddr.IPv4.networkAddressFromCIDR(
    `${addr.toString()}/${cidr}`
  );

  // Broadcast address
  const broadcastAddr = ipaddr.IPv4.broadcastAddressFromCIDR(
    `${addr.toString()}/${cidr}`
  );

  // Calculate host count: 2^(32-cidr) - 2 (exclude network and broadcast)
  const hostBits = 32 - cidr;
  const totalHosts = BigInt(2) ** BigInt(hostBits);

  // Special cases: /31 and /32
  let usableHosts: bigint;
  let firstUsable: string;
  let lastUsable: string;

  if (cidr === 32) {
    // Single host
    usableHosts = BigInt(1);
    firstUsable = addr.toString();
    lastUsable = addr.toString();
  } else if (cidr === 31) {
    // RFC 3021: Point-to-point, both addresses usable
    usableHosts = BigInt(2);
    firstUsable = networkAddr;
    lastUsable = broadcastAddr;
  } else {
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

  // Subnet mask
  const subnetMask = ipaddr.IPv4.subnetMaskFromPrefixLength(cidr);

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

function calculateIPv6Subnet(addr: ipaddr.IPv6, cidr: number): SubnetResult {
  // IPv6 has no broadcast address
  // Calculate using bitwise operations on address parts
  const parts = addr.parts; // Array of 8 16-bit integers

  // Calculate network address
  const networkParts = calculateIPv6NetworkAddress(parts, cidr);
  const networkAddr = new ipaddr.IPv6(networkParts).toString();

  // Calculate last address in subnet
  const lastParts = calculateIPv6LastAddress(parts, cidr);
  const lastAddr = new ipaddr.IPv6(lastParts).toString();

  // Calculate host count
  const hostBits = 128 - cidr;
  const totalHosts = BigInt(2) ** BigInt(hostBits);

  // IPv6 doesn't reserve network/broadcast addresses
  // Special case: /128 (single address)
  const usableHosts = cidr === 128 ? BigInt(1) : totalHosts;

  return {
    networkAddress: networkAddr,
    broadcastAddress: null,
    firstUsable: networkAddr,
    lastUsable: lastAddr,
    usableHosts,
    totalHosts,
    cidr,
    subnetMask: null,
    ipVersion: 6,
  };
}

function calculateIPv6NetworkAddress(parts: number[], cidr: number): number[] {
  const result = [...parts];
  const fullParts = Math.floor(cidr / 16);
  const remainingBits = cidr % 16;

  // Zero out parts after the network portion
  for (let i = fullParts + 1; i < 8; i++) {
    result[i] = 0;
  }

  // Handle partial part
  if (remainingBits > 0 && fullParts < 8) {
    const mask = (0xffff << (16 - remainingBits)) & 0xffff;
    result[fullParts] = result[fullParts] & mask;
  }

  return result;
}

function calculateIPv6LastAddress(parts: number[], cidr: number): number[] {
  const result = [...parts];
  const fullParts = Math.floor(cidr / 16);
  const remainingBits = cidr % 16;

  // Set all parts after network portion to max
  for (let i = fullParts + 1; i < 8; i++) {
    result[i] = 0xffff;
  }

  // Handle partial part
  if (remainingBits > 0 && fullParts < 8) {
    const mask = (0xffff << (16 - remainingBits)) & 0xffff;
    result[fullParts] = (result[fullParts] & mask) | (~mask & 0xffff);
  }

  return result;
}
```

### Pattern 2: Input Parsing with Multiple Formats

**What:** Accept CIDR notation (192.168.1.0/24) and subnet mask notation (192.168.1.0 with 255.255.255.0) as input.
**When to use:** Always for flexible user input handling.
**Example:**

```typescript
// src/lib/converters/network/ip-parser.ts
import ipaddr from "ipaddr.js";

export interface ParsedInput {
  ipAddress: string;
  cidr: number;
  format: "cidr" | "mask";
}

export function parseIPInput(input: string, subnetMask?: string): ParsedInput {
  // Try CIDR notation first (e.g., "192.168.1.0/24" or "2001:db8::/32")
  if (input.includes("/")) {
    if (!ipaddr.isValidCIDR(input)) {
      throw new Error("Invalid CIDR notation");
    }

    const [ip, cidrStr] = input.split("/");
    const cidr = parseInt(cidrStr, 10);

    // Validate CIDR range
    const addr = ipaddr.parse(ip);
    const maxCidr = addr.kind() === "ipv4" ? 32 : 128;
    if (cidr < 0 || cidr > maxCidr) {
      throw new Error(`CIDR must be between 0 and ${maxCidr}`);
    }

    return { ipAddress: ip, cidr, format: "cidr" };
  }

  // If no slash and no subnet mask, invalid
  if (!subnetMask) {
    throw new Error("Must provide either CIDR notation or subnet mask");
  }

  // Parse subnet mask notation (IPv4 only)
  if (!ipaddr.isValid(input)) {
    throw new Error("Invalid IP address");
  }

  const addr = ipaddr.parse(input);
  if (addr.kind() !== "ipv4") {
    throw new Error("Subnet mask notation only supported for IPv4");
  }

  // Convert subnet mask to CIDR
  const maskAddr = ipaddr.IPv4.parse(subnetMask);
  const cidr = maskAddr.prefixLengthFromSubnetMask();

  if (cidr === null) {
    throw new Error("Invalid subnet mask");
  }

  return { ipAddress: input, cidr, format: "mask" };
}

export function validateIPAddress(
  ip: string
): { valid: boolean; version: 4 | 6 | null } {
  if (!ipaddr.isValid(ip)) {
    return { valid: false, version: null };
  }

  const addr = ipaddr.parse(ip);
  return { valid: true, version: addr.kind() === "ipv4" ? 4 : 6 };
}
```

### Pattern 3: Zustand Store with URL Sync

**What:** Store calculator state in Zustand with URL synchronization for shareability.
**When to use:** Always for calculator state management (existing project pattern).
**Example:**

```typescript
// src/stores/subnet-calculator-store.ts
import { create } from 'zustand';
import { urlSyncMiddleware } from '@/lib/url-sync';
import { calculateSubnet, type SubnetResult } from '@/lib/converters/network/subnet-calculator';
import { parseIPInput } from '@/lib/converters/network/ip-parser';

export interface SubnetCalculatorState {
  // Inputs
  ipInput: string;
  subnetMask: string;

  // Results
  result: SubnetResult | null;
  error: string | null;

  // Actions
  setIPInput: (value: string) => void;
  setSubnetMask: (value: string) => void;
  calculate: () => void;
  reset: () => void;
}

const initialState = {
  ipInput: '',
  subnetMask: '',
  result: null,
  error: null,
};

export const useSubnetCalculatorStore = create<SubnetCalculatorState>()(
  urlSyncMiddleware(
    (set, get) => ({
      ...initialState,

      setIPInput: (value: string) => {
        set({ ipInput: value, error: null });
        // Auto-calculate if input looks complete
        if (value.includes('/') && value.split('/')[1]) {
          get().calculate();
        }
      },

      setSubnetMask: (value: string) => {
        set({ subnetMask: value, error: null });
        // Auto-calculate if both IP and mask present
        if (get().ipInput && value) {
          get().calculate();
        }
      },

      calculate: () => {
        const { ipInput, subnetMask } = get();

        try {
          const parsed = parseIPInput(ipInput, subnetMask || undefined);
          const result = calculateSubnet(parsed.ipAddress, parsed.cidr);
          set({ result, error: null });
        } catch (err) {
          set({
            result: null,
            error: err instanceof Error ? err.message : 'Invalid input',
          });
        }
      },

      reset: () => set(initialState),
    }),
    {
      // Define which fields sync to URL
      syncFields: ['ipInput', 'subnetMask'],
      debounceMs: 300,
    }
  )
);
```

### Anti-Patterns to Avoid

- **Hand-rolling IP address parsing:** IPv4/IPv6 parsing has numerous edge cases (leading zeros, IPv6 compression, IPv4-mapped IPv6). Use established libraries.
- **Regex-only validation:** While regex can validate format, it doesn't handle semantic validation (e.g., octets > 255, invalid IPv6 compression). Libraries provide proper validation.
- **Ignoring special cases:** /31 and /32 for IPv4, /127 and /128 for IPv6 have different usable host calculations.
- **String-based arithmetic:** Use BigInt for host calculations, especially for IPv6 where numbers exceed JavaScript's safe integer range.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem                       | Don't Build                   | Use Instead                               | Why                                                                                      |
| ----------------------------- | ----------------------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------- |
| IP address parsing            | Custom string splitting/regex | ipaddr.js `.parse()`                      | Handles IPv6 compression (::), IPv4-mapped IPv6 (::ffff:192.0.2.1), zone IDs, validation |
| CIDR validation               | Custom regex                  | ipaddr.js `.isValidCIDR()`                | Validates IP format AND CIDR range (0-32 for IPv4, 0-128 for IPv6)                       |
| Subnet mask to CIDR           | Manual bit counting           | ipaddr.js `.prefixLengthFromSubnetMask()` | Validates contiguous bits, handles edge cases                                            |
| Network/broadcast calculation | Manual bitwise ops on strings | ipaddr.js built-in methods or ip-num      | Handles byte array operations correctly, tested extensively                              |
| IPv6 address compression      | String manipulation           | ipaddr.js `.toString()`                   | RFC-compliant compression rules (longest run of zeros, tie-breaking)                     |

**Key insight:** IP address manipulation involves protocol-specific rules, edge cases, and bitwise operations that are extremely error-prone to implement manually. Mature libraries have thousands of test cases covering these scenarios.

## Common Pitfalls

### Pitfall 1: Miscalculating Usable Hosts in Special Cases

**What goes wrong:** Applying the standard formula (2^host_bits - 2) to /31 and /32 subnets gives incorrect results.
**Why it happens:** RFC 3021 defines /31 as point-to-point links where both addresses are usable (no network/broadcast). /32 is a single host.
**How to avoid:**

- Check CIDR value before applying formula
- For IPv4: if (cidr === 32) usableHosts = 1; if (cidr === 31) usableHosts = 2; else usableHosts = totalHosts - 2
- For IPv6: No network/broadcast reservation except /128 which is single address
  **Warning signs:** Test cases failing for /31 and /32 subnets, users reporting incorrect host counts for point-to-point links.

### Pitfall 2: Treating IPv6 Like IPv4

**What goes wrong:** Attempting to calculate broadcast addresses for IPv6, or assuming network address is reserved.
**Why it happens:** IPv6 fundamentally changed subnet behavior - no broadcast, uses multicast (ff02::1 for all-nodes).
**How to avoid:**

- Return null for broadcastAddress field in IPv6 results
- Don't subtract 2 from IPv6 host count (no network/broadcast reservation except /128)
- Document that firstUsable === networkAddress for IPv6
  **Warning signs:** Users confused about missing broadcast address, incorrect usable host counts for IPv6.

### Pitfall 3: Overlapping Subnets Not Detected

**What goes wrong:** Allowing user to input subnets that overlap with each other (if calculator supports multiple subnets).
**Why it happens:** No validation that subnet ranges don't overlap.
**How to avoid:** For advanced features, use ip-num's `.overlaps()` method or implement range checking.
**Warning signs:** Network configuration errors, routing issues in production.

### Pitfall 4: Leading Zeros in IPv4 Addresses

**What goes wrong:** Parsing "192.168.001.001" as valid or treating it as octal.
**Why it happens:** Some parsers interpret leading zeros as octal notation.
**How to avoid:**

- Use ipaddr.js which rejects leading zeros by default
- Validate input format explicitly
- Show error message: "Remove leading zeros from IP address"
  **Warning signs:** Unexpected IP address values, parsing errors on seemingly valid input.

### Pitfall 5: IPv6 URL Encoding Issues

**What goes wrong:** IPv6 addresses with colons break URL query parameters or get double-encoded.
**Why it happens:** Colons are special characters in URLs; IPv6 uses colons as separators.
**How to avoid:**

- Modern URL APIs handle encoding automatically
- Store just the address in URL params, not bracket notation
- Test with actual IPv6 addresses in URL state
  **Warning signs:** URL encoding errors, state not persisting correctly for IPv6, %3A appearing in URLs.

### Pitfall 6: BigInt Display Issues

**What goes wrong:** Displaying BigInt host counts shows "1000000n" instead of "1,000,000".
**Why it happens:** BigInt has "n" suffix, needs conversion for display.
**How to avoid:**

- Convert BigInt to string or number for display: `usableHosts.toString()`
- Use formatter: `format.number(Number(usableHosts))` for locale-aware formatting
- Document that very large IPv6 subnets may exceed Number.MAX_SAFE_INTEGER
  **Warning signs:** Numbers showing "n" suffix, formatting errors, scientific notation for large numbers.

## Code Examples

Verified patterns from official sources:

### Validating IP Addresses

```typescript
// Source: https://github.com/whitequark/ipaddr.js
import ipaddr from "ipaddr.js";

// Simple validation
if (ipaddr.isValid("192.168.1.1")) {
  const addr = ipaddr.parse("192.168.1.1");
  console.log(addr.kind()); // 'ipv4'
}

// CIDR validation
if (ipaddr.isValidCIDR("2001:db8::/32")) {
  const addr = ipaddr.parseCIDR("2001:db8::/32");
  console.log(addr); // [IPv6 object, 32]
}

// Type-safe parsing with error handling
try {
  const addr = ipaddr.parse(userInput);
  if (addr.kind() === "ipv4") {
    // TypeScript knows addr is IPv4
    const cidr = addr.prefixLengthFromSubnetMask();
  }
} catch (err) {
  console.error("Invalid IP address");
}
```

### Converting Subnet Mask to CIDR

```typescript
// Source: https://github.com/whitequark/ipaddr.js
import ipaddr from "ipaddr.js";

const mask = ipaddr.IPv4.parse("255.255.255.240");
const prefixLength = mask.prefixLengthFromSubnetMask();
console.log(prefixLength); // 28

// Reverse: CIDR to subnet mask
const subnetMask = ipaddr.IPv4.subnetMaskFromPrefixLength(24);
console.log(subnetMask); // '255.255.255.0'
```

### Calculating Network and Broadcast Addresses

```typescript
// Source: https://github.com/whitequark/ipaddr.js
import ipaddr from "ipaddr.js";

const networkAddr = ipaddr.IPv4.networkAddressFromCIDR("192.168.1.5/24");
console.log(networkAddr); // '192.168.1.0'

const broadcastAddr = ipaddr.IPv4.broadcastAddressFromCIDR("192.168.1.5/24");
console.log(broadcastAddr); // '192.168.1.255'
```

### Checking CIDR Range Membership

```typescript
// Source: https://github.com/whitequark/ipaddr.js
import ipaddr from "ipaddr.js";

const addr = ipaddr.parse("192.168.1.10");
const range = ipaddr.parseCIDR("192.168.1.0/24");

// Check if address is in range
if (addr.match(range)) {
  console.log("Address is in subnet");
}
```

### Using ip-num for Advanced Operations

```typescript
// Source: https://github.com/ip-num/ip-num
import { IPv4CidrRange } from "ip-num";

const range = IPv4CidrRange.fromCidr("192.168.0.0/24");
console.log(range.getFirst().toString()); // '192.168.0.0'
console.log(range.getLast().toString()); // '192.168.0.255'
console.log(range.getSize().toString()); // '256'

// Split subnet
const subnets = range.split();
console.log(subnets[0].toCidrString()); // '192.168.0.0/25'
console.log(subnets[1].toCidrString()); // '192.168.0.128/25'

// Check overlap
const range2 = IPv4CidrRange.fromCidr("192.168.0.128/25");
console.log(range.overlaps(range2)); // true
```

## State of the Art

| Old Approach                          | Current Approach                          | When Changed      | Impact                             |
| ------------------------------------- | ----------------------------------------- | ----------------- | ---------------------------------- |
| Regex-only validation                 | Library-based parsing (ipaddr.js, ip-num) | ~2015             | More reliable, handles edge cases  |
| Custom bitwise operations             | Built-in library methods                  | ~2015             | Fewer bugs, RFC-compliant          |
| Number type for calculations          | BigInt for IPv6                           | ES2020 (2020)     | Can handle full IPv6 address space |
| Manual IPv6 compression               | Library .toString() methods               | ~2015             | RFC-compliant compression          |
| Octal interpretation of leading zeros | Reject leading zeros                      | Recent (security) | Prevents unexpected IP parsing     |

**Deprecated/outdated:**

- **Regex-only IPv6 validation:** Too complex, error-prone. Use library validation instead.
- **String-based arithmetic for subnets:** Use BigInt and libraries that handle byte arrays correctly.
- **Assuming all /24 are Class C:** Classful networking (Class A/B/C) deprecated in 1993. Use CIDR terminology.

## Open Questions

Things that couldn't be fully resolved:

1. **TypeScript types bundled with ipaddr.js?**

   - What we know: ipaddr.js has 55M weekly downloads and is widely used
   - What's unclear: Whether @types/ipaddr.js is needed or types are bundled in recent versions
   - Recommendation: Check npm package for bundled types; install @types/ipaddr.js if needed

2. **Performance for large subnet listings**

   - What we know: Calculating individual subnet properties is fast
   - What's unclear: Performance impact of listing all hosts in large subnets (e.g., /16)
   - Recommendation: For Phase 9 (basic calculator), don't implement host listing. Defer to future phase.

3. **IPv6 zone ID handling**

   - What we know: IPv6 supports zone IDs (fe80::1%eth0) for link-local addresses
   - What's unclear: Whether calculator should support zone IDs in input
   - Recommendation: Accept zone IDs if ipaddr.js parses them, but don't require special handling for Phase 9

4. **Wildcard mask support**
   - What we know: Some Cisco devices use wildcard masks (inverse of subnet mask)
   - What's unclear: Whether users expect wildcard mask input option
   - Recommendation: Support CIDR and subnet mask only for Phase 9. Add wildcard masks if users request it.

## Sources

### Primary (HIGH confidence)

- [ipaddr.js GitHub Repository](https://github.com/whitequark/ipaddr.js) - Official documentation, API methods
- [ip-num GitHub Repository](https://github.com/ip-num/ip-num) - TypeScript library architecture
- [ip-address GitHub Repository](https://github.com/beaugunderson/ip-address) - Alternative library features
- [RFC 3021 - Using 31-Bit Prefixes on IPv4 Point-to-Point Links](https://datatracker.ietf.org/doc/html/rfc3021) - Authoritative spec for /31 subnets
- [Classless Inter-Domain Routing - Wikipedia](https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing) - CIDR calculation formulas

### Secondary (MEDIUM confidence)

- [npm trends - ipaddr.js vs ip-address](https://npmtrends.com/cidr-regex-vs-ip-address-vs-ip-range-check-vs-ipaddr.js-vs-is-cidr-vs-is-ip) - Download statistics verified
- [IPv6 Architecture and Subnetting Guide](https://www.daryllswer.com/ipv6-architecture-and-subnetting-guide-for-network-engineers-and-operators/) - Best practices for IPv6 subnetting
- [Subnet Mask Calculator - GeeksforGeeks](https://www.geeksforgeeks.org/utilities/subnet-mask-calculator/) - Usable hosts formula verified
- [IP Subnet Calculator - calculator.net](https://www.calculator.net/ip-subnet-calculator.html) - Algorithms verified with multiple sources

### Tertiary (LOW confidence)

- WebSearch results for "subnet calculator UX" - General patterns, not authoritative
- Community forum discussions about /31 usage - Real-world usage but not specifications

## Metadata

**Confidence breakdown:**

- Standard stack: MEDIUM - ipaddr.js verified via GitHub and npm stats, but didn't verify TypeScript types bundling
- Architecture: HIGH - Patterns match existing project structure (Zustand + pure functions), verified with official ipaddr.js examples
- Pitfalls: HIGH - Special cases verified with RFCs and official docs, common mistakes verified across multiple sources
- Algorithms: HIGH - Formulas verified with authoritative sources (RFCs, Wikipedia, multiple calculator implementations)

**Research date:** 2026-01-18
**Valid until:** 2026-02-18 (30 days - IP standards are stable, libraries mature)

**Notes:**

- ipaddr.js is battle-tested and widely adopted; safe choice for production
- ip-num offers superior TypeScript experience but larger bundle size
- IPv6 has fundamentally different subnet behavior than IPv4; must handle separately
- Special cases (/31, /32, /127, /128) require explicit conditional logic
- BigInt required for accurate IPv6 host count calculations
