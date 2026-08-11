# Phase 12: IP Address & CIDR Calculators - Research

**Researched:** 2026-01-21
**Domain:** IP Address Classification, CIDR Range Operations
**Confidence:** HIGH

## Summary

This research covers the implementation of two complementary network analysis tools: an IP Address Calculator that classifies IP addresses by class (A-E) and identifies public/private status, and a CIDR Range Calculator that computes IP ranges from CIDR notation and checks if specific IPs fall within those ranges.

The existing codebase already has robust infrastructure for IP manipulation via ipaddr.js (v2.3.0), including validation, parsing, and CIDR calculations in the subnet calculator. The new calculators will leverage these existing patterns and utilities while adding classification and range-checking capabilities.

**Primary recommendation:** Leverage ipaddr.js's built-in `range()` method for public/private detection and `match()` method for IP-in-CIDR checking, while implementing custom classification logic for IP classes (A-E) since this is classful addressing which ipaddr.js doesn't directly support.

## Standard Stack

The established libraries/tools for this domain:

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| ipaddr.js | 2.3.0 | IP address parsing, validation, and manipulation | Already in use, 55M+ weekly downloads, handles IPv4/IPv6 edge cases |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| zustand | (existing) | State management with URL sync | Calculator state and shareability |
| next-intl | (existing) | Internationalization | Labels and translations |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| ipaddr.js | ip-address npm | ipaddr.js already in codebase, well-tested patterns exist |
| Manual CIDR calc | ip-cidr npm | Additional dependency not needed, existing utilities sufficient |

**Installation:**
No new packages required - reuse existing ipaddr.js and Zustand patterns.

## Architecture Patterns

### Recommended Project Structure

```
src/
├── lib/converters/network/
│   ├── ip-classifier.ts       # NEW: IP class detection and public/private
│   ├── cidr-range.ts          # NEW: CIDR range calculations and IP-in-range
│   ├── ip-parser.ts           # EXISTING: Reuse validation utilities
│   ├── subnet-calculator.ts   # EXISTING: Reuse address calculations
│   └── types.ts               # EXTEND: Add new result interfaces
├── stores/
│   ├── ip-calculator-store.ts    # NEW: IP Address Calculator state
│   └── cidr-range-store.ts       # NEW: CIDR Range Calculator state
└── app/[locale]/network/
    ├── ip-calculator/            # NEW: IP Address Calculator page
    │   ├── page.tsx
    │   └── ip-calculator.tsx
    └── cidr-range/               # NEW: CIDR Range Calculator page
        ├── page.tsx
        └── cidr-range-calculator.tsx
```

### Pattern 1: IP Classification Logic

**What:** Determine IP class (A-E) and public/private status
**When to use:** IP Address Calculator main calculation
**Example:**

```typescript
// Source: RFC 791 (IP Classes), RFC 1918 (Private Addresses)
import ipaddr from "ipaddr.js";

export interface IPClassification {
  ipClass: "A" | "B" | "C" | "D" | "E" | null; // null for IPv6
  isPrivate: boolean;
  isPublic: boolean;
  rangeType: string; // From ipaddr.js range()
  description: string;
}

export function classifyIPAddress(ip: string): IPClassification {
  const addr = ipaddr.parse(ip);

  // IPv6 has no classes
  if (addr.kind() === "ipv6") {
    const rangeType = addr.range();
    return {
      ipClass: null,
      isPrivate: rangeType === "uniqueLocal" || rangeType === "linkLocal",
      isPublic: rangeType === "unicast",
      rangeType,
      description: getIPv6RangeDescription(rangeType),
    };
  }

  // IPv4 classification
  const ipv4 = addr as ipaddr.IPv4;
  const firstOctet = ipv4.octets[0];
  const rangeType = ipv4.range();

  return {
    ipClass: getIPv4Class(firstOctet),
    isPrivate: rangeType === "private",
    isPublic: rangeType === "unicast",
    rangeType,
    description: getIPv4RangeDescription(rangeType),
  };
}

function getIPv4Class(firstOctet: number): "A" | "B" | "C" | "D" | "E" {
  if (firstOctet >= 1 && firstOctet <= 126) return "A";
  if (firstOctet >= 128 && firstOctet <= 191) return "B";
  if (firstOctet >= 192 && firstOctet <= 223) return "C";
  if (firstOctet >= 224 && firstOctet <= 239) return "D";
  return "E"; // 240-255
}
```

### Pattern 2: CIDR Range Calculation

**What:** Calculate IP range from CIDR and check IP membership
**When to use:** CIDR Range Calculator
**Example:**

```typescript
// Source: ipaddr.js match() API
import ipaddr from "ipaddr.js";
import { calculateSubnet } from "./subnet-calculator";

export interface CIDRRangeResult {
  networkAddress: string;
  broadcastAddress: string | null;
  firstUsable: string;
  lastUsable: string;
  totalHosts: bigint;
  usableHosts: bigint;
  ipVersion: 4 | 6;
}

export function checkIPInRange(ip: string, cidr: string): boolean {
  const addr = ipaddr.parse(ip);
  const parsedCidr = ipaddr.parseCIDR(cidr);

  // Use ipaddr.js match() method
  return addr.match(parsedCidr);
}

export function calculateCIDRRange(cidr: string): CIDRRangeResult {
  // Reuse existing subnet calculator
  const [ip, prefix] = cidr.split("/");
  return calculateSubnet(ip, parseInt(prefix, 10));
}
```

### Anti-Patterns to Avoid

- **Manual IP-in-range bit math:** Use ipaddr.js `match()` instead of manual comparisons
- **Hardcoded range lists:** Use ipaddr.js `range()` method which has authoritative ranges
- **Separate IPv4/IPv6 code paths where unnecessary:** Many operations work for both

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| IP validation | Custom regex patterns | `ipaddr.isValid()` | Handles edge cases (leading zeros, IPv6 compression) |
| Private IP detection | Hardcoded range checks | `addr.range() === "private"` | ipaddr.js has authoritative RFC ranges |
| IP-in-CIDR check | Manual bit masking | `addr.match(parsedCidr)` | Handles both IPv4/IPv6, tested implementation |
| CIDR range calculation | Custom first/last IP calc | Existing `calculateSubnet()` | Already implemented in subnet-calculator.ts |
| IP address comparison | String comparison | Use existing `addressToNumber()` | Already in supernetting.ts, handles BigInt for IPv6 |

**Key insight:** The codebase already has well-tested IP manipulation utilities. New calculators should compose existing functions rather than reimplementing.

## Common Pitfalls

### Pitfall 1: IPv4 Class Confusion with 127.x.x.x

**What goes wrong:** Treating 127.0.0.0/8 as Class A network space
**Why it happens:** First octet 127 falls in Class A range (1-126... wait, it doesn't!)
**How to avoid:** 127 is the loopback range, NOT Class A. Class A is 1-126, not 0-127.
**Warning signs:** Tests failing for 127.0.0.1 classification

### Pitfall 2: IPv6 Has No Classes

**What goes wrong:** Trying to classify IPv6 addresses into A/B/C/D/E
**Why it happens:** Thinking all IP addresses have classes
**How to avoid:** Return null for ipClass when IPv6 detected, use rangeType instead
**Warning signs:** UI showing "Class: null" or crashes on IPv6 input

### Pitfall 3: Private vs Public is NOT the Same as Class

**What goes wrong:** Assuming Class A = public, Class C = private
**Why it happens:** Confusing classful addressing with RFC 1918 private ranges
**How to avoid:** Use ipaddr.js `range()` for private detection, separate from class
**Warning signs:** 10.0.0.1 classified as "public" because it's Class A

### Pitfall 4: Edge Cases in IP Ranges

**What goes wrong:** Forgetting special cases like 0.0.0.0, 255.255.255.255
**Why it happens:** Only testing "normal" IP addresses
**How to avoid:** ipaddr.js `range()` returns "unspecified" for 0.0.0.0, "broadcast" for 255.255.255.255
**Warning signs:** These IPs cause errors or wrong classifications

### Pitfall 5: CIDR Without Slash

**What goes wrong:** User enters "192.168.1.0" expecting /24
**Why it happens:** Users may not understand CIDR notation
**How to avoid:** Validate for "/" presence, show helpful error message
**Warning signs:** Crashes or wrong calculations when slash missing

## Code Examples

Verified patterns from ipaddr.js and existing codebase:

### IPv4 Range Types (from ipaddr.js source)

```typescript
// Source: https://github.com/whitequark/ipaddr.js
// ipaddr.js predefined IPv4 ranges
const ipv4Ranges = {
  unspecified: [[0, 0, 0, 0], 8],      // 0.0.0.0/8
  broadcast: [[255, 255, 255, 255], 32], // 255.255.255.255/32
  multicast: [[224, 0, 0, 0], 4],      // 224.0.0.0/4
  linkLocal: [[169, 254, 0, 0], 16],   // 169.254.0.0/16
  loopback: [[127, 0, 0, 0], 8],       // 127.0.0.0/8
  carrierGradeNat: [[100, 64, 0, 0], 10], // 100.64.0.0/10
  private: [
    [[10, 0, 0, 0], 8],                // 10.0.0.0/8
    [[172, 16, 0, 0], 12],             // 172.16.0.0/12
    [[192, 168, 0, 0], 16],            // 192.168.0.0/16
  ],
  reserved: [
    [[192, 0, 0, 0], 24],              // 192.0.0.0/24
    // ... many more reserved ranges
  ],
};
```

### IPv6 Range Types (from ipaddr.js source)

```typescript
// Source: https://github.com/whitequark/ipaddr.js
const ipv6Ranges = {
  unspecified: ["::", 128],           // ::/128
  loopback: ["::1", 128],             // ::1/128
  multicast: ["ff00::", 8],           // ff00::/8
  linkLocal: ["fe80::", 10],          // fe80::/10
  uniqueLocal: ["fc00::", 7],         // fc00::/7 (includes fd00::/8)
  ipv4Mapped: ["::ffff:0:0", 96],     // ::ffff:0:0/96
  teredo: ["2001::", 32],             // 2001::/32
  // ... more ranges
};
```

### Using ipaddr.js match() for IP-in-Range

```typescript
// Source: ipaddr.js README
import ipaddr from "ipaddr.js";

// Parse CIDR notation
const cidr = ipaddr.parseCIDR("192.168.1.0/24");
// Returns: [IPv4 object, 24]

// Check if IP is in range
const addr = ipaddr.parse("192.168.1.100");
const isInRange = addr.match(cidr); // true

// Also works with array format
addr.match([ipaddr.parse("192.168.1.0"), 24]); // true
```

### IP Class Determination

```typescript
// Source: RFC 791 - Internet Protocol
// Class is determined by first octet's leading bits:
// Class A: 0xxxxxxx (0-127, but 127 is loopback, so 1-126 usable)
// Class B: 10xxxxxx (128-191)
// Class C: 110xxxxx (192-223)
// Class D: 1110xxxx (224-239) - Multicast
// Class E: 1111xxxx (240-255) - Reserved/Experimental

function getIPv4Class(firstOctet: number): "A" | "B" | "C" | "D" | "E" | "special" {
  // Handle special cases first
  if (firstOctet === 0) return "special";   // 0.0.0.0/8 reserved
  if (firstOctet === 127) return "special"; // Loopback

  // Standard class determination
  if (firstOctet <= 126) return "A";
  if (firstOctet <= 191) return "B";
  if (firstOctet <= 223) return "C";
  if (firstOctet <= 239) return "D";
  return "E";
}
```

### Existing Pattern: Zustand Store with URL Sync

```typescript
// Source: src/stores/subnet-calculator-store.ts (existing pattern)
export const useIPCalculatorStore = create<IPCalculatorState>()(
  createUrlSyncMiddleware<IPCalculatorState>({
    enabled: true,
    debounceMs: 300,
    selectState: (state) => ({
      ipInput: state.ipInput,
    }),
  })((set, get) => ({
    ipInput: "",
    result: null,
    error: null,

    setIPInput: (value: string) => {
      set({ ipInput: value, error: null });
      // Auto-calculate on valid input
      if (value && ipaddr.isValid(value)) {
        setTimeout(() => get().calculate(), 0);
      }
    },

    calculate: () => {
      const { ipInput } = get();
      if (!ipInput) {
        set({ result: null, error: null });
        return;
      }
      try {
        const result = classifyIPAddress(ipInput);
        set({ result, error: null });
      } catch (err) {
        set({ result: null, error: err instanceof Error ? err.message : "Invalid IP" });
      }
    },

    reset: () => set({ ipInput: "", result: null, error: null }),
  }))
);
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Classful networking (A/B/C) | CIDR (classless) | RFC 4632 (2006) | Classes still used for education/reference only |
| IPv4 only | Dual-stack IPv4/IPv6 | Ongoing | Must support both in calculators |
| Manual range tables | ipaddr.js built-in ranges | Library evolution | Use library for authoritative ranges |

**Deprecated/outdated:**

- **Classful addressing:** No longer used in practice, but educational value remains
- **Site-local IPv6 (fec0::/10):** Deprecated by RFC 3879, replaced by Unique Local (fc00::/7)

## IP Address Classification Reference

### IPv4 Classes

| Class | First Octet | Address Range | Default Mask | Purpose |
|-------|-------------|---------------|--------------|---------|
| A | 1-126 | 1.0.0.0 - 126.255.255.255 | 255.0.0.0 (/8) | Large networks |
| B | 128-191 | 128.0.0.0 - 191.255.255.255 | 255.255.0.0 (/16) | Medium networks |
| C | 192-223 | 192.0.0.0 - 223.255.255.255 | 255.255.255.0 (/24) | Small networks |
| D | 224-239 | 224.0.0.0 - 239.255.255.255 | N/A | Multicast |
| E | 240-255 | 240.0.0.0 - 255.255.255.255 | N/A | Reserved/Experimental |

Note: 0.x.x.x and 127.x.x.x are special (unspecified and loopback).

### Private IP Ranges (RFC 1918)

| Range | CIDR | Class | Addresses |
|-------|------|-------|-----------|
| 10.0.0.0 - 10.255.255.255 | 10.0.0.0/8 | A | ~16.7 million |
| 172.16.0.0 - 172.31.255.255 | 172.16.0.0/12 | B | ~1 million |
| 192.168.0.0 - 192.168.255.255 | 192.168.0.0/16 | C | ~65,536 |

### Other Special IPv4 Ranges

| Range | Purpose |
|-------|---------|
| 0.0.0.0/8 | Unspecified / "this" network |
| 127.0.0.0/8 | Loopback |
| 169.254.0.0/16 | Link-Local (APIPA) |
| 100.64.0.0/10 | Carrier-Grade NAT |
| 255.255.255.255/32 | Limited Broadcast |

### IPv6 Special Ranges

| Range | Purpose |
|-------|---------|
| ::/128 | Unspecified |
| ::1/128 | Loopback |
| fe80::/10 | Link-Local |
| fc00::/7 | Unique Local (private equivalent) |
| ff00::/8 | Multicast |
| 2001::/32 | Teredo |
| 2002::/16 | 6to4 |

## Open Questions

Things that couldn't be fully resolved:

1. **Class for 0.x.x.x addresses**
   - What we know: 0.0.0.0/8 is reserved, not routable
   - What's unclear: Should it be labeled as Class A or "special"?
   - Recommendation: Label as "special" or "reserved" to avoid confusion

2. **IPv6 "private" terminology**
   - What we know: fc00::/7 (ULA) is the IPv6 equivalent of RFC 1918
   - What's unclear: ipaddr.js returns "uniqueLocal" not "private"
   - Recommendation: Display both the range type and a user-friendly description

## Sources

### Primary (HIGH confidence)

- ipaddr.js GitHub repository - API methods and predefined ranges
- Existing codebase: `/src/lib/converters/network/subnet-calculator.ts` - patterns
- Existing codebase: `/src/stores/subnet-calculator-store.ts` - Zustand patterns

### Secondary (MEDIUM confidence)

- [RFC 1918](https://datatracker.ietf.org/doc/html/rfc1918) - Private IP address allocation
- [RFC 791](https://en.wikipedia.org/wiki/IPv4) - IPv4 classes (via Wikipedia summary)
- [Meridian Outpost IPv4 Classes Guide](https://www.meridianoutpost.com/resources/articles/IP-classes.php) - Class ranges reference

### Tertiary (LOW confidence)

- GeeksforGeeks Classful IP Addressing - educational reference
- WebSearch results for IPv6 private ranges - verified against ipaddr.js source

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH - ipaddr.js already in codebase, patterns established
- Architecture: HIGH - follows existing subnet calculator patterns exactly
- Pitfalls: HIGH - based on RFC specifications and ipaddr.js behavior
- IP classification rules: HIGH - based on RFC standards

**Research date:** 2026-01-21
**Valid until:** 60+ days (stable domain, RFCs don't change)
