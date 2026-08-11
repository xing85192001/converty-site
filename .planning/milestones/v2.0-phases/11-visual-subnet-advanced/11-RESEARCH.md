# Phase 11: Visual Subnet Calculator - Advanced Features - Research

**Researched:** 2026-01-19
**Domain:** Network subnetting algorithms, CIDR aggregation, interactive visualization
**Confidence:** HIGH

## Summary

Phase 11 adds advanced network manipulation capabilities to the existing Visual Subnet Calculator: subnetting (dividing networks into smaller subnets) and supernetting (combining multiple networks into larger CIDR blocks). Research confirms that ipaddr.js (already in use) provides the foundational IP manipulation methods needed, but **subnet division and aggregation algorithms must be implemented manually** as ipaddr.js does not include these features natively.

The subnetting algorithm follows binary prefix mathematics: increasing the CIDR prefix by N bits creates 2^N equal subnets. For example, a /24 network split into /26 creates 4 subnets. Critically, **subnets can only be divided into powers of 2** (2, 4, 8, 16, etc.). Supernetting works inversely by finding common binary prefixes among contiguous networks and reducing the CIDR prefix. Both operations require validation to ensure mathematically valid results.

Visual subnet calculators (davidc.net, visualsubnetcalc.com) use interactive Split/Join buttons that dynamically rebuild a hierarchical subnet table. The research recommends implementing a tree-based data structure for subnet hierarchy with real-time visual feedback, color-coded subnets, and before/after comparison panels.

**Primary recommendation:** Implement subnetting and supernetting as pure functions extending the existing `/src/lib/converters/network/subnet-calculator.ts`, use a tree data structure in Zustand store for subnet hierarchy, and create new visualization components for the subnet tree display with Split/Join controls.

## Standard Stack

The established libraries/tools for this domain:

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| ipaddr.js | 2.2.0+ | IP address manipulation, parsing, validation | Already in project (Phase 9-10), handles IPv4/IPv6, CIDR parsing |
| React 19 | 19.x | Component composition, state management | Project requirement |
| Zustand | Latest | State management with URL sync | Project pattern, already used for subnet calculator |
| TypeScript 5 | 5.x | Type safety for subnet tree structures | Project requirement |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| shadcn/ui table | Latest | Display subnet hierarchy | Already in project, used in BreakdownTable |
| cn() utility | - | Conditional class styling | Already in project |
| next-intl | Latest | i18n for new labels | Already in project |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom subnet division | ip-cidr npm package | Adds dependency, but ipaddr.js + custom logic sufficient |
| Custom supernetting | mapcidr (Go tool) | Server-side only, not usable in static site |
| Manual tree management | Immer for immutability | Overkill for this use case, Zustand handles well |

**Installation:**

```bash
# No additional packages needed - use existing ipaddr.js and Zustand
# All required libraries already in project from Phase 9-10
```

## Architecture Patterns

### Recommended Project Structure

```
src/
├── lib/converters/network/
│   ├── subnet-calculator.ts    # Existing - add subnet division/join functions
│   ├── subnetting.ts           # NEW - subnet division algorithms
│   ├── supernetting.ts         # NEW - CIDR aggregation algorithms
│   └── types.ts                # Extend with SubnetTree, SubnetDivision types
├── stores/
│   └── subnet-calculator-store.ts  # Extend with subnetting state
├── app/[locale]/network/subnet-calculator/
│   ├── components/
│   │   ├── network-diagram.tsx      # Existing
│   │   ├── binary-representation.tsx # Existing
│   │   ├── breakdown-table.tsx       # Existing
│   │   ├── subnet-tree.tsx           # NEW - hierarchical subnet display
│   │   ├── split-controls.tsx        # NEW - division controls
│   │   └── supernet-input.tsx        # NEW - multiple network input
│   └── subnet-calculator.tsx         # Extend with subnetting tabs/modes
└── messages/
    └── *.json                        # Add subnetting translations
```

### Pattern 1: Subnet Division Algorithm

**What:** Pure function that divides a network into smaller equal subnets.
**When to use:** When user wants to split a network into 2, 4, 8, etc. subnets.
**Algorithm:**

```typescript
// src/lib/converters/network/subnetting.ts

import ipaddr from "ipaddr.js";
import type { SubnetResult } from "./types";
import { calculateSubnet } from "./subnet-calculator";

/**
 * Result of subnet division operation
 */
export interface SubnetDivision {
  /** Original parent subnet */
  parent: SubnetResult;
  /** Array of child subnets */
  children: SubnetResult[];
  /** Number of divisions (power of 2) */
  divisions: number;
  /** New CIDR prefix for children */
  newCidr: number;
}

/**
 * Divide a network into smaller equal subnets
 *
 * @param networkAddress - Base network address (e.g., "192.168.1.0")
 * @param cidr - Current CIDR prefix (e.g., 24)
 * @param divisions - Number of subnets to create (must be power of 2)
 * @returns SubnetDivision with parent and children subnets
 * @throws Error if divisions is not a power of 2 or exceeds max CIDR
 *
 * @example
 * divideSubnet("192.168.1.0", 24, 4)
 * // Returns 4 subnets: /26 each
 * // 192.168.1.0/26, 192.168.1.64/26, 192.168.1.128/26, 192.168.1.192/26
 */
export function divideSubnet(
  networkAddress: string,
  cidr: number,
  divisions: number
): SubnetDivision {
  // Validate divisions is power of 2
  if (!isPowerOfTwo(divisions) || divisions < 2) {
    throw new Error("Divisions must be a power of 2 (2, 4, 8, 16, etc.)");
  }

  // Calculate bits to borrow
  const bitsNeeded = Math.log2(divisions);
  const newCidr = cidr + bitsNeeded;

  // Validate new CIDR doesn't exceed limits
  const addr = ipaddr.parse(networkAddress);
  const maxCidr = addr.kind() === "ipv4" ? 32 : 128;

  if (newCidr > maxCidr) {
    throw new Error(
      `Cannot divide: would require /${newCidr} which exceeds maximum /${maxCidr}`
    );
  }

  // Calculate parent subnet
  const parent = calculateSubnet(networkAddress, cidr);

  // Calculate child subnets
  const children: SubnetResult[] = [];
  const blockSize = getBlockSize(addr.kind() === "ipv4" ? 4 : 6, newCidr);

  for (let i = 0; i < divisions; i++) {
    const childAddress = addToAddress(networkAddress, blockSize * BigInt(i));
    children.push(calculateSubnet(childAddress, newCidr));
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
 */
function isPowerOfTwo(n: number): boolean {
  return n > 0 && (n & (n - 1)) === 0;
}

/**
 * Get block size (number of addresses) for a CIDR prefix
 */
function getBlockSize(ipVersion: 4 | 6, cidr: number): bigint {
  const totalBits = ipVersion === 4 ? 32 : 128;
  return BigInt(2) ** BigInt(totalBits - cidr);
}

/**
 * Add offset to IP address (returns new address string)
 */
function addToAddress(address: string, offset: bigint): string {
  const addr = ipaddr.parse(address);

  if (addr.kind() === "ipv4") {
    // Convert IPv4 to 32-bit integer, add offset, convert back
    const octets = (addr as ipaddr.IPv4).octets;
    let num = BigInt(
      (octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3]
    );
    num += offset;

    return [
      Number((num >> 24n) & 0xffn),
      Number((num >> 16n) & 0xffn),
      Number((num >> 8n) & 0xffn),
      Number(num & 0xffn),
    ].join(".");
  } else {
    // IPv6: Convert parts to 128-bit BigInt, add offset, convert back
    const parts = (addr as ipaddr.IPv6).parts;
    let num = BigInt(0);
    for (const part of parts) {
      num = (num << 16n) | BigInt(part);
    }
    num += offset;

    const newParts: number[] = [];
    for (let i = 7; i >= 0; i--) {
      newParts.unshift(Number((num >> BigInt(i * 16)) & 0xffffn));
    }

    return new ipaddr.IPv6(newParts).toString();
  }
}
```

### Pattern 2: Supernetting (CIDR Aggregation) Algorithm

**What:** Pure function that combines contiguous networks into a larger CIDR block.
**When to use:** When user wants to merge multiple networks into one summarized route.
**Algorithm:**

```typescript
// src/lib/converters/network/supernetting.ts

import ipaddr from "ipaddr.js";
import type { SubnetResult } from "./types";
import { calculateSubnet } from "./subnet-calculator";

/**
 * Result of supernetting operation
 */
export interface SupernetResult {
  /** Aggregated supernet */
  supernet: SubnetResult;
  /** Original networks that were combined */
  originalNetworks: SubnetResult[];
  /** Whether aggregation was successful */
  success: boolean;
  /** Error message if aggregation failed */
  error?: string;
}

/**
 * Combine contiguous networks into a larger CIDR block (supernetting)
 *
 * Requirements for valid supernetting:
 * 1. All networks must be same IP version
 * 2. All networks must have same CIDR prefix
 * 3. Networks must be contiguous (no gaps)
 * 4. Number of networks must be power of 2
 * 5. First network address must be on supernet boundary
 *
 * @param networks - Array of network addresses with CIDR (e.g., ["192.168.0.0/24", "192.168.1.0/24"])
 * @returns SupernetResult with aggregated supernet or error
 *
 * @example
 * aggregateNetworks(["192.168.0.0/24", "192.168.1.0/24"])
 * // Returns: 192.168.0.0/23
 *
 * aggregateNetworks(["10.0.0.0/24", "10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"])
 * // Returns: 10.0.0.0/22
 */
export function aggregateNetworks(networks: string[]): SupernetResult {
  // Validate minimum networks
  if (networks.length < 2) {
    return {
      supernet: null as unknown as SubnetResult,
      originalNetworks: [],
      success: false,
      error: "Need at least 2 networks to aggregate",
    };
  }

  // Validate count is power of 2
  if (!isPowerOfTwo(networks.length)) {
    return {
      supernet: null as unknown as SubnetResult,
      originalNetworks: [],
      success: false,
      error: "Number of networks must be a power of 2 (2, 4, 8, etc.)",
    };
  }

  // Parse all networks
  const parsed: { address: string; cidr: number; ipVersion: 4 | 6 }[] = [];
  for (const network of networks) {
    try {
      if (!ipaddr.isValidCIDR(network)) {
        return {
          supernet: null as unknown as SubnetResult,
          originalNetworks: [],
          success: false,
          error: `Invalid CIDR notation: ${network}`,
        };
      }
      const [ip, cidrStr] = network.split("/");
      const addr = ipaddr.parse(ip);
      parsed.push({
        address: ip,
        cidr: parseInt(cidrStr),
        ipVersion: addr.kind() === "ipv4" ? 4 : 6,
      });
    } catch {
      return {
        supernet: null as unknown as SubnetResult,
        originalNetworks: [],
        success: false,
        error: `Failed to parse network: ${network}`,
      };
    }
  }

  // Validate all same IP version
  const ipVersion = parsed[0].ipVersion;
  if (!parsed.every((p) => p.ipVersion === ipVersion)) {
    return {
      supernet: null as unknown as SubnetResult,
      originalNetworks: [],
      success: false,
      error: "All networks must be same IP version",
    };
  }

  // Validate all same CIDR
  const cidr = parsed[0].cidr;
  if (!parsed.every((p) => p.cidr === cidr)) {
    return {
      supernet: null as unknown as SubnetResult,
      originalNetworks: [],
      success: false,
      error: "All networks must have same CIDR prefix",
    };
  }

  // Sort networks by address
  parsed.sort((a, b) =>
    compareAddresses(a.address, b.address, ipVersion)
  );

  // Validate contiguous and on boundary
  const bitsReduced = Math.log2(networks.length);
  const newCidr = cidr - bitsReduced;

  if (newCidr < 0) {
    return {
      supernet: null as unknown as SubnetResult,
      originalNetworks: [],
      success: false,
      error: "Cannot aggregate: would result in invalid CIDR",
    };
  }

  // Validate first address is on supernet boundary
  const firstNetwork = parsed[0].address;
  const supernetAddress = ipaddr.IPv4.networkAddressFromCIDR(
    `${firstNetwork}/${newCidr}`
  ).toString();

  if (supernetAddress !== firstNetwork) {
    return {
      supernet: null as unknown as SubnetResult,
      originalNetworks: [],
      success: false,
      error: `First network must be on /${newCidr} boundary (expected ${supernetAddress})`,
    };
  }

  // Validate networks are contiguous
  const blockSize = getBlockSize(ipVersion, cidr);
  for (let i = 1; i < parsed.length; i++) {
    const expected = addToAddress(
      parsed[0].address,
      blockSize * BigInt(i)
    );
    if (parsed[i].address !== expected) {
      return {
        supernet: null as unknown as SubnetResult,
        originalNetworks: [],
        success: false,
        error: `Networks not contiguous: expected ${expected}, got ${parsed[i].address}`,
      };
    }
  }

  // Calculate original subnets
  const originalNetworks = parsed.map((p) =>
    calculateSubnet(p.address, p.cidr)
  );

  // Success - create supernet
  const supernet = calculateSubnet(firstNetwork, newCidr);

  return {
    supernet,
    originalNetworks,
    success: true,
  };
}

function compareAddresses(a: string, b: string, ipVersion: 4 | 6): number {
  const numA = addressToNumber(a, ipVersion);
  const numB = addressToNumber(b, ipVersion);
  return numA < numB ? -1 : numA > numB ? 1 : 0;
}

function addressToNumber(address: string, ipVersion: 4 | 6): bigint {
  const addr = ipaddr.parse(address);
  if (ipVersion === 4) {
    const octets = (addr as ipaddr.IPv4).octets;
    return BigInt(
      (octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3]
    );
  } else {
    const parts = (addr as ipaddr.IPv6).parts;
    let num = BigInt(0);
    for (const part of parts) {
      num = (num << 16n) | BigInt(part);
    }
    return num;
  }
}
```

### Pattern 3: Subnet Tree Data Structure

**What:** Tree-based state management for hierarchical subnet display.
**When to use:** To track split/join history and enable before/after visualization.
**Example:**

```typescript
// Extended types for subnet tree

export interface SubnetNode {
  /** Unique identifier for this node */
  id: string;
  /** Subnet calculation result */
  subnet: SubnetResult;
  /** Parent node ID (null for root) */
  parentId: string | null;
  /** Child node IDs (empty for leaf nodes) */
  childIds: string[];
  /** Depth in tree (0 for root) */
  depth: number;
  /** User-assigned label/note */
  label?: string;
  /** Color for visualization */
  color?: string;
}

export interface SubnetTree {
  /** Root node ID */
  rootId: string;
  /** Map of all nodes by ID */
  nodes: Record<string, SubnetNode>;
  /** Currently selected node ID */
  selectedId: string | null;
}
```

### Pattern 4: Split/Join Interactive Controls

**What:** UI component for splitting and joining subnet nodes.
**When to use:** To provide davidc.net-style interactive manipulation.
**Example:**

```typescript
// src/app/[locale]/network/subnet-calculator/components/split-controls.tsx
"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Scissors, Merge } from "lucide-react";

interface SplitControlsProps {
  selectedCidr: number;
  maxCidr: number; // 32 for IPv4, 128 for IPv6
  canSplit: boolean;
  canJoin: boolean;
  onSplit: (divisions: number) => void;
  onJoin: () => void;
}

export function SplitControls({
  selectedCidr,
  maxCidr,
  canSplit,
  canJoin,
  onSplit,
  onJoin,
}: SplitControlsProps) {
  const t = useTranslations("calculator.subnet.advanced");

  // Calculate available split options (powers of 2)
  const getSplitOptions = () => {
    const options: number[] = [];
    const bitsRemaining = maxCidr - selectedCidr;

    for (let bits = 1; bits <= bitsRemaining && bits <= 8; bits++) {
      options.push(Math.pow(2, bits)); // 2, 4, 8, 16, 32, 64, 128, 256
    }
    return options;
  };

  const splitOptions = getSplitOptions();

  return (
    <div className="flex items-center gap-4">
      {/* Split Control */}
      <div className="flex items-center gap-2">
        <Select
          onValueChange={(value) => onSplit(parseInt(value))}
          disabled={!canSplit || splitOptions.length === 0}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder={t("split-into")} />
          </SelectTrigger>
          <SelectContent>
            {splitOptions.map((count) => (
              <SelectItem key={count} value={count.toString()}>
                {count} {t("subnets")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onSplit(2)}
          disabled={!canSplit}
          title={t("split-tooltip")}
        >
          <Scissors className="h-4 w-4" />
        </Button>
      </div>

      {/* Join Control */}
      <Button
        variant="outline"
        size="icon"
        onClick={onJoin}
        disabled={!canJoin}
        title={t("join-tooltip")}
      >
        <Merge className="h-4 w-4" />
      </Button>
    </div>
  );
}
```

### Pattern 5: Before/After Comparison Panel

**What:** Side-by-side or tabbed view showing original vs modified network state.
**When to use:** To provide visual feedback on subnet operations.
**Example:**

```typescript
// src/app/[locale]/network/subnet-calculator/components/comparison-panel.tsx
"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BreakdownTable } from "./breakdown-table";
import type { SubnetResult } from "@/lib/converters/network/types";

interface ComparisonPanelProps {
  before: SubnetResult;
  after: SubnetResult[];
  mode: "subnetting" | "supernetting";
}

export function ComparisonPanel({ before, after, mode }: ComparisonPanelProps) {
  const t = useTranslations("calculator.subnet.advanced");

  return (
    <Tabs defaultValue="after" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="before">{t("before")}</TabsTrigger>
        <TabsTrigger value="after">{t("after")}</TabsTrigger>
      </TabsList>

      <TabsContent value="before">
        <Card>
          <CardHeader>
            <CardTitle>
              {mode === "subnetting" ? t("original-network") : t("original-networks")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BreakdownTable result={before} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="after">
        <Card>
          <CardHeader>
            <CardTitle>
              {mode === "subnetting" ? t("new-subnets") : t("aggregated-supernet")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {after.map((subnet, index) => (
              <div key={subnet.networkAddress} className="border-b last:border-0 pb-4">
                <h4 className="font-medium mb-2">
                  {t("subnet")} {index + 1}: {subnet.networkAddress}/{subnet.cidr}
                </h4>
                <BreakdownTable result={subnet} />
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
```

### Anti-Patterns to Avoid

- **Allowing non-power-of-2 divisions:** Mathematically impossible for equal subnets. Validate user input strictly.
- **Ignoring CIDR boundary alignment:** Supernetting fails if first network isn't on boundary. Always validate.
- **Mutating tree state directly:** Use Zustand actions for immutable updates. Never modify nodes array directly.
- **Complex recursive rendering:** For subnet tree, use flat list with indentation rather than recursive components.
- **Forgetting IPv6 limits:** IPv6 CIDR can go to /128. Ensure UI handles both IPv4 (/32) and IPv6 (/128) limits.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| IP address arithmetic | Manual byte manipulation | ipaddr.js `.octets` + `.parts` arrays | Handles IPv4/IPv6 uniformly, tested |
| CIDR validation | Regex patterns | `ipaddr.isValidCIDR()` | Handles edge cases, RFC compliant |
| Network address from CIDR | Manual calculation | `ipaddr.IPv4.networkAddressFromCIDR()` | Accurate, handles all prefix lengths |
| Broadcast calculation | Manual calculation | `ipaddr.IPv4.broadcastAddressFromCIDR()` | Handles edge cases (/31, /32) |
| Tree state management | Custom context/reducer | Zustand store with node map | Project pattern, simpler state updates |
| Select dropdown | Custom select | shadcn/ui Select | Accessible, keyboard navigation |

**Key insight:** ipaddr.js provides all primitive operations needed for subnet math. The only custom logic needed is the division/aggregation algorithms that orchestrate these primitives.

## Common Pitfalls

### Pitfall 1: Invalid Division Count

**What goes wrong:** User tries to split into 3 or 5 subnets (not power of 2).
**Why it happens:** Subnetting math requires borrowing whole bits from host portion.
**How to avoid:**

- Validate `divisions` is power of 2: `(n & (n - 1)) === 0`
- Only show valid options in dropdown (2, 4, 8, 16, etc.)
- Display clear error message explaining the constraint
**Warning signs:** User reports "can't create 3 subnets" - this is expected, not a bug.

### Pitfall 2: CIDR Overflow on Division

**What goes wrong:** Trying to split /30 into 8 subnets would require /33 (impossible).
**Why it happens:** Not checking if `newCidr > maxCidr` before division.
**How to avoid:**

- Calculate `newCidr = currentCidr + log2(divisions)` first
- Validate against max (32 for IPv4, 128 for IPv6)
- Disable split options that would exceed limit
**Warning signs:** Division returns empty/incorrect results for small subnets.

### Pitfall 3: Supernet Boundary Misalignment

**What goes wrong:** Aggregating 192.168.1.0/24 + 192.168.2.0/24 fails.
**Why it happens:** First network (192.168.1.0) is not on /23 boundary (should be 192.168.0.0).
**How to avoid:**

- Calculate expected supernet boundary using `networkAddressFromCIDR`
- Compare against first network's address
- Provide clear error: "First network must be on /23 boundary"
**Warning signs:** Valid-looking networks fail to aggregate.

### Pitfall 4: Non-Contiguous Networks

**What goes wrong:** Aggregating 192.168.0.0/24 + 192.168.2.0/24 (skipping .1.0).
**Why it happens:** Networks have gap between them, can't form single CIDR block.
**How to avoid:**

- Sort networks by address
- Verify each network starts exactly where previous ends
- Calculate expected addresses based on block size
**Warning signs:** Aggregation produces incorrect supernet covering extra addresses.

### Pitfall 5: IPv6 Large Number Overflow

**What goes wrong:** BigInt operations overflow or produce incorrect results.
**Why it happens:** IPv6 addresses are 128-bit, requiring careful BigInt handling.
**How to avoid:**

- Always use BigInt for address arithmetic (not Number)
- Use `BigInt(2) ** BigInt(hostBits)` not `Math.pow()`
- Test with large IPv6 prefixes like /48 and /64
**Warning signs:** IPv6 subnetting produces wrong addresses or crashes.

### Pitfall 6: State Desync on Rapid Split/Join

**What goes wrong:** UI shows stale data after rapid split/join operations.
**Why it happens:** Zustand updates not propagating correctly or race conditions.
**How to avoid:**

- Use Zustand selectors properly
- Ensure tree mutations are atomic (update entire tree at once)
- Debounce rapid user interactions
**Warning signs:** Tree display doesn't match actual state after multiple operations.

## Code Examples

Verified patterns from official sources:

### IPv4 Address Arithmetic

```typescript
// Source: ipaddr.js documentation + custom implementation
// Convert IPv4 to 32-bit number for arithmetic

function ipv4ToNumber(address: string): number {
  const addr = ipaddr.IPv4.parse(address);
  const octets = addr.octets;
  return (octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3];
}

function numberToIPv4(num: number): string {
  return [
    (num >>> 24) & 0xff,
    (num >>> 16) & 0xff,
    (num >>> 8) & 0xff,
    num & 0xff,
  ].join(".");
}

// Add offset to IPv4 address
function addToIPv4(address: string, offset: number): string {
  const num = ipv4ToNumber(address) >>> 0; // Ensure unsigned
  return numberToIPv4((num + offset) >>> 0);
}
```

### Power of 2 Validation

```typescript
// Standard bitwise check for power of 2
function isPowerOfTwo(n: number): boolean {
  return n > 0 && (n & (n - 1)) === 0;
}

// Get bits needed for N divisions
function getBitsForDivisions(divisions: number): number {
  if (!isPowerOfTwo(divisions)) {
    throw new Error("Divisions must be power of 2");
  }
  return Math.log2(divisions);
}
```

### Subnet Tree Node Generation

```typescript
// Generate unique ID for subnet node
function generateNodeId(networkAddress: string, cidr: number): string {
  return `${networkAddress.replace(/[.:]/g, "-")}-${cidr}`;
}

// Create child nodes from division
function createChildNodes(
  parentNode: SubnetNode,
  children: SubnetResult[]
): SubnetNode[] {
  return children.map((subnet, index) => ({
    id: generateNodeId(subnet.networkAddress, subnet.cidr),
    subnet,
    parentId: parentNode.id,
    childIds: [],
    depth: parentNode.depth + 1,
    color: getSubnetColor(index), // Assign distinct colors
  }));
}
```

### Multiple Network Input Parsing

```typescript
// Parse textarea input with multiple networks
function parseMultipleNetworks(input: string): string[] {
  return input
    .split(/[\n,;]+/) // Split by newline, comma, or semicolon
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .filter((line) => ipaddr.isValidCIDR(line));
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Server-side subnet calculation | Client-side with ipaddr.js | ~2020 | Privacy, no API calls |
| Static subnet tables | Interactive split/join | ~2018 | Better UX, iterative design |
| Manual CIDR entry only | Visual manipulation | ~2019 | Accessible to non-experts |
| IPv4 only | IPv4 + IPv6 support | ~2021 | Future-proof |
| Flat result display | Hierarchical tree view | Current | Shows relationship between subnets |

**Deprecated/outdated:**

- **Server-side subnet APIs:** Privacy concern, unnecessary network calls. Client-side is standard.
- **Flash-based visualizations:** Replaced by SVG/Canvas. All modern calculators use web standards.
- **Fixed division options (only /2):** Modern tools allow any power-of-2 division.

## Open Questions

Things that couldn't be fully resolved:

1. **Maximum tree depth for performance**
   - What we know: Deep trees (many divisions) create many nodes
   - What's unclear: At what depth does rendering become sluggish?
   - Recommendation: Limit to 8 levels (256 subnets), test with larger trees

2. **Supernetting with mixed CIDR prefixes**
   - What we know: Standard supernetting requires same CIDR
   - What's unclear: Should we support merging /24 + /25 + /25?
   - Recommendation: Start with same-CIDR only, consider mixed as future enhancement

3. **VLSM (Variable Length Subnet Masking) support**
   - What we know: VLSM creates subnets of different sizes based on requirements
   - What's unclear: Is this in scope for Phase 11 or separate feature?
   - Recommendation: Focus on equal subdivision first, VLSM as separate calculator

4. **URL state for complex tree**
   - What we know: Current URL sync stores simple values
   - What's unclear: How to encode full tree state in URL without exceeding length limits
   - Recommendation: Encode as base64 JSON or use short codes for common patterns

## Sources

### Primary (HIGH confidence)

- [ipaddr.js GitHub](https://github.com/whitequark/ipaddr.js) - API methods for CIDR, network/broadcast calculation
- [davidc.net Visual Subnet Calculator](https://www.davidc.net/sites/default/subnets/subnets.html) - UI patterns for split/join
- [visualsubnetcalc.com](https://visualsubnetcalc.com/) - Modern UI patterns, color coding, shareable URLs
- [Comparitech Supernetting Guide](https://www.comparitech.com/net-admin/supernetting-guide/) - Rules for CIDR aggregation
- [GeeksforGeeks Supernetting](https://www.geeksforgeeks.org/supernetting-in-network-layer/) - Algorithm explanation

### Secondary (MEDIUM confidence)

- [subnet-cidr-calculator npm](https://www.npmjs.com/package/subnet-cidr-calculator) - Alternative library patterns
- [IPSubnetCalculator GitHub](https://github.com/salieri/IPSubnetCalculator) - Range-to-CIDR algorithm
- [AWS CIDR Documentation](https://aws.amazon.com/what-is/cidr/) - Enterprise CIDR concepts
- [VLSM Calculator subnetcalculator.dev](https://www.subnetcalculator.dev/vlsm) - VLSM algorithm reference

### Tertiary (LOW confidence)

- [mapcidr GitHub](https://github.com/projectdiscovery/mapcidr) - Go implementation (concepts transferable)
- WebSearch results for "subnetting algorithm JavaScript" - general patterns confirmed

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH - ipaddr.js verified, no new dependencies needed
- Subnetting algorithm: HIGH - Mathematical principles well-documented, verified with multiple sources
- Supernetting algorithm: HIGH - RFC 1519 compliant, boundary rules clear
- UI patterns: MEDIUM - Based on existing calculators, needs validation in project context
- Tree state management: MEDIUM - Pattern reasonable but not tested at scale

**Research date:** 2026-01-19
**Valid until:** 2026-02-19 (30 days - algorithms stable, ipaddr.js API stable)

**Notes:**

- ipaddr.js does NOT have built-in subnet division/aggregation - must implement manually
- Subnets can ONLY be divided into powers of 2 (2, 4, 8, 16, etc.)
- Supernetting requires contiguous networks on proper CIDR boundaries
- IPv6 supported but requires BigInt for address arithmetic
- Visual patterns from davidc.net and visualsubnetcalc.com inform UI design
- No additional npm packages required - ipaddr.js + custom algorithms sufficient
