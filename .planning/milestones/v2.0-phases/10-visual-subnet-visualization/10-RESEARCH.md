# Phase 10: Visual Subnet Calculator - Visualization - Research

**Researched:** 2026-01-18
**Domain:** React visualization (SVG diagrams, binary representation, data tables)
**Confidence:** MEDIUM

## Summary

Visual subnet calculator visualization requires three distinct rendering approaches: network diagrams showing IP ranges and boundaries, binary representation with bit highlighting for network/host portions, and detailed breakdown tables displaying calculation results. Research reveals that pure React with inline SVG elements provides the optimal solution for network diagrams without requiring external visualization libraries, while shadcn/ui's table component offers semantic HTML tables perfect for breakdown displays.

The established pattern for binary visualization involves mapping through bit positions and applying conditional styling based on bitwise operations, highlighting network bits differently from host bits. For network diagrams, SVG's declarative nature in React allows composing rectangles, lines, and text elements to represent IP address ranges and subnet boundaries. Performance considerations favor SVG for subnet calculators since element counts remain under 100 (well below the ~3-5k threshold where Canvas becomes necessary).

Critical differences between IPv4 and IPv6 visualization include address length (32-bit vs 128-bit requiring different binary layouts), subnet mask representation (IPv4 only), and broadcast address display (IPv4 only). Accessibility requirements (WCAG 2.2 Level AA) mandate alt text for diagrams, ARIA labels for interactive elements, and text alternatives explaining visual relationships.

**Primary recommendation:** Use **pure React + inline SVG** for network diagrams (no library needed), **conditional className styling** for binary bit highlighting, and **shadcn/ui table component** for breakdown displays. This approach balances simplicity, bundle size, accessibility, and maintainability while leveraging existing project patterns.

## Standard Stack

The established libraries/tools for React visualization in subnet calculators:

### Core

| Library         | Version | Purpose                                  | Why Standard                                        |
| --------------- | ------- | ---------------------------------------- | --------------------------------------------------- |
| React 19        | 19.x    | Component composition with SVG support   | Project requirement, first-class SVG support in JSX |
| TypeScript 5    | 5.x     | Type safety for component props and data | Project requirement, prevents rendering errors      |
| Tailwind CSS    | Latest  | Styling with conditional classes         | Project standard, excellent for responsive design   |
| shadcn/ui table | Latest  | Semantic HTML table components           | Project pattern, accessible, composable             |

### Supporting

| Library      | Version | Purpose                         | When to Use                                        |
| ------------ | ------- | ------------------------------- | -------------------------------------------------- |
| next-intl    | Latest  | i18n for labels and aria-labels | Already in project, required for accessibility     |
| cn() utility | -       | Conditional class merging       | Already in project, simplifies conditional styling |
| ipaddr.js    | 2.2.0+  | Binary conversion utilities     | Already in Phase 9, provides `.toByteArray()`      |

### Alternatives Considered

| Instead of    | Could Use         | Tradeoff                                                                                |
| ------------- | ----------------- | --------------------------------------------------------------------------------------- |
| Pure SVG      | D3.js with React  | More features but 200KB+ bundle, overkill for static diagrams                           |
| Pure SVG      | Recharts          | Designed for charts not network diagrams, unnecessary abstraction                       |
| Pure SVG      | Canvas            | Better performance for 1000+ elements, but worse accessibility and harder to style      |
| Custom table  | TanStack Table    | Powerful for sorting/filtering/pagination, but subnet results don't need these features |
| Inline styles | CSS-in-JS library | More features but increases bundle size, Tailwind sufficient                            |

**Installation:**

```bash
# Add table component from shadcn/ui
npx shadcn@latest add table

# No additional libraries needed - use existing stack
```

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/[locale]/network/subnet-calculator/
│   ├── components/
│   │   ├── network-diagram.tsx        # SVG network visualization
│   │   ├── binary-representation.tsx  # Binary IP/mask with highlighting
│   │   ├── breakdown-table.tsx        # Results table
│   │   └── visualization-card.tsx     # Container with Card components
│   ├── subnet-calculator.tsx          # Main calculator component
│   └── page.tsx                       # Next.js page
├── components/ui/
│   └── table.tsx                      # shadcn/ui table (add via CLI)
├── stores/
│   └── subnet-calculator-store.ts     # Zustand store (from Phase 9)
└── lib/converters/network/
    ├── subnet-calculator.ts           # Calculation logic (from Phase 9)
    └── types.ts                       # SubnetResult interface (from Phase 9)
```

### Pattern 1: Network Diagram with Inline SVG

**What:** Composable React component rendering SVG diagram showing network/host portions and IP ranges.
**When to use:** For visual representation of subnet structure and address allocation.
**Example:**

```typescript
// src/app/[locale]/network/subnet-calculator/components/network-diagram.tsx
"use client";

import { useTranslations } from "next-intl";
import type { SubnetResult } from "@/lib/converters/network/types";

interface NetworkDiagramProps {
  result: SubnetResult;
}

export function NetworkDiagram({ result }: NetworkDiagramProps) {
  const t = useTranslations("calculator.subnet");

  // Calculate visual proportions based on CIDR
  const totalBits = result.ipVersion === 4 ? 32 : 128;
  const networkPercent = (result.cidr / totalBits) * 100;
  const hostPercent = 100 - networkPercent;

  return (
    <svg
      viewBox="0 0 800 200"
      className="w-full h-auto"
      role="img"
      aria-label={t("diagram.aria-label")}
    >
      {/* Network portion (left) */}
      <rect
        x="0"
        y="50"
        width={networkPercent * 6} // Scale to 600px width
        height="60"
        className="fill-blue-500/20 stroke-blue-500 stroke-2"
      />
      <text
        x={networkPercent * 3}
        y="85"
        textAnchor="middle"
        className="fill-blue-700 font-medium text-sm"
      >
        {t("diagram.network-portion")} ({result.cidr} bits)
      </text>

      {/* Host portion (right) */}
      <rect
        x={networkPercent * 6}
        y="50"
        width={hostPercent * 6}
        height="60"
        className="fill-green-500/20 stroke-green-500 stroke-2"
      />
      <text
        x={networkPercent * 6 + hostPercent * 3}
        y="85"
        textAnchor="middle"
        className="fill-green-700 font-medium text-sm"
      >
        {t("diagram.host-portion")} ({totalBits - result.cidr} bits)
      </text>

      {/* IP range labels */}
      <text x="10" y="140" className="fill-gray-700 text-xs">
        {result.networkAddress}
      </text>
      <text x="590" y="140" textAnchor="end" className="fill-gray-700 text-xs">
        {result.ipVersion === 4 ? result.broadcastAddress : result.lastUsable}
      </text>

      {/* Usable range indicator */}
      <line
        x1="10"
        y1="160"
        x2="590"
        y2="160"
        className="stroke-gray-400 stroke-2"
        markerEnd="url(#arrowhead)"
      />
      <text
        x="300"
        y="180"
        textAnchor="middle"
        className="fill-gray-600 text-xs"
      >
        {result.usableHosts.toString()} {t("diagram.usable-hosts")}
      </text>

      {/* Arrow marker definition */}
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="10"
          refX="5"
          refY="5"
          orient="auto"
        >
          <polygon points="0 0, 10 5, 0 10" className="fill-gray-400" />
        </marker>
      </defs>
    </svg>
  );
}
```

### Pattern 2: Binary Representation with Bit Highlighting

**What:** Display IP address and subnet mask in binary with conditional styling to highlight network vs host portions.
**When to use:** For educational visualization showing how subnet masks separate network/host bits.
**Example:**

```typescript
// src/app/[locale]/network/subnet-calculator/components/binary-representation.tsx
"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import ipaddr from "ipaddr.js";
import type { SubnetResult } from "@/lib/converters/network/types";

interface BinaryRepresentationProps {
  result: SubnetResult;
  ipAddress: string;
}

export function BinaryRepresentation({
  result,
  ipAddress,
}: BinaryRepresentationProps) {
  const t = useTranslations("calculator.subnet.binary");

  // Convert IP address to binary
  const addr = ipaddr.parse(ipAddress);
  const binary = convertToBinary(addr, result.ipVersion);

  // Determine which bits are network vs host
  const networkBits = result.cidr;
  const totalBits = result.ipVersion === 4 ? 32 : 128;

  return (
    <div className="space-y-4 font-mono text-sm">
      {/* IP Address Binary */}
      <div>
        <div className="text-xs text-muted-foreground mb-2">
          {t("ip-address")}: {ipAddress}
        </div>
        <div
          className="flex flex-wrap gap-1"
          role="list"
          aria-label={t("ip-binary-label")}
        >
          {binary.map((bit, index) => (
            <span
              key={index}
              className={cn(
                "px-1 py-0.5 rounded text-xs",
                index < networkBits
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                  : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
              )}
              role="listitem"
              aria-label={`${t("bit")} ${index + 1}: ${bit}, ${
                index < networkBits ? t("network") : t("host")
              }`}
            >
              {bit}
            </span>
          ))}
        </div>
      </div>

      {/* Subnet Mask Binary (IPv4 only) */}
      {result.ipVersion === 4 && result.subnetMask && (
        <div>
          <div className="text-xs text-muted-foreground mb-2">
            {t("subnet-mask")}: {result.subnetMask}
          </div>
          <div
            className="flex flex-wrap gap-1"
            role="list"
            aria-label={t("mask-binary-label")}
          >
            {Array.from({ length: totalBits }, (_, index) => {
              const bit = index < networkBits ? "1" : "0";
              return (
                <span
                  key={index}
                  className={cn(
                    "px-1 py-0.5 rounded text-xs",
                    bit === "1"
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  )}
                  role="listitem"
                  aria-label={`${t("mask-bit")} ${index + 1}: ${bit}`}
                >
                  {bit}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Bit position markers (every 8 bits for IPv4, every 16 for IPv6) */}
      <div className="flex justify-between text-xs text-muted-foreground">
        {result.ipVersion === 4 ? (
          <>
            <span>0-7</span>
            <span>8-15</span>
            <span>16-23</span>
            <span>24-31</span>
          </>
        ) : (
          <>
            <span>0-15</span>
            <span>16-31</span>
            <span>32-47</span>
            <span>48-63</span>
            <span>64-79</span>
            <span>80-95</span>
            <span>96-111</span>
            <span>112-127</span>
          </>
        )}
      </div>
    </div>
  );
}

// Helper function to convert IP address to binary array
function convertToBinary(
  addr: ipaddr.IPv4 | ipaddr.IPv6,
  ipVersion: 4 | 6
): string[] {
  if (ipVersion === 4) {
    // IPv4: 4 octets, 8 bits each
    const octets = (addr as ipaddr.IPv4).octets;
    return octets.flatMap((octet) =>
      octet.toString(2).padStart(8, "0").split("")
    );
  } else {
    // IPv6: 8 parts, 16 bits each
    const parts = (addr as ipaddr.IPv6).parts;
    return parts.flatMap((part) =>
      part.toString(2).padStart(16, "0").split("")
    );
  }
}
```

### Pattern 3: Breakdown Table with shadcn/ui

**What:** Semantic HTML table displaying calculation results in structured format.
**When to use:** For displaying network address, broadcast, usable range, host counts.
**Example:**

```typescript
// src/app/[locale]/network/subnet-calculator/components/breakdown-table.tsx
"use client";

import { useTranslations, useFormatter } from "next-intl";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { SubnetResult } from "@/lib/converters/network/types";

interface BreakdownTableProps {
  result: SubnetResult;
}

export function BreakdownTable({ result }: BreakdownTableProps) {
  const t = useTranslations("calculator.subnet.breakdown");
  const format = useFormatter();

  // Format BigInt for display
  const formatHostCount = (count: bigint): string => {
    // Convert to Number if safe, otherwise use string
    const num = Number(count);
    if (num <= Number.MAX_SAFE_INTEGER) {
      return format.number(num);
    }
    return count.toString();
  };

  const rows = [
    {
      label: t("network-address"),
      value: result.networkAddress,
      description: t("network-address-desc"),
    },
    ...(result.broadcastAddress
      ? [
          {
            label: t("broadcast-address"),
            value: result.broadcastAddress,
            description: t("broadcast-address-desc"),
          },
        ]
      : []),
    {
      label: t("first-usable"),
      value: result.firstUsable,
      description: t("first-usable-desc"),
    },
    {
      label: t("last-usable"),
      value: result.lastUsable,
      description: t("last-usable-desc"),
    },
    {
      label: t("usable-hosts"),
      value: formatHostCount(result.usableHosts),
      description: t("usable-hosts-desc"),
    },
    {
      label: t("total-hosts"),
      value: formatHostCount(result.totalHosts),
      description: t("total-hosts-desc"),
    },
    {
      label: t("cidr-notation"),
      value: `/${result.cidr}`,
      description: t("cidr-notation-desc"),
    },
    ...(result.subnetMask
      ? [
          {
            label: t("subnet-mask"),
            value: result.subnetMask,
            description: t("subnet-mask-desc"),
          },
        ]
      : []),
    {
      label: t("ip-version"),
      value: `IPv${result.ipVersion}`,
      description: t("ip-version-desc"),
    },
  ];

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-1/3">{t("property")}</TableHead>
          <TableHead className="w-1/3">{t("value")}</TableHead>
          <TableHead className="w-1/3">{t("description")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.label}>
            <TableCell className="font-medium">{row.label}</TableCell>
            <TableCell className="font-mono">{row.value}</TableCell>
            <TableCell className="text-muted-foreground text-sm">
              {row.description}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

### Pattern 4: Real-Time Updates with Zustand

**What:** Visualizations subscribe to Zustand store and re-render automatically when state changes.
**When to use:** Always for calculator components to maintain single source of truth.
**Example:**

```typescript
// src/app/[locale]/network/subnet-calculator/subnet-calculator.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NetworkDiagram } from "./components/network-diagram";
import { BinaryRepresentation } from "./components/binary-representation";
import { BreakdownTable } from "./components/breakdown-table";
import { useSubnetCalculatorStore } from "@/stores/subnet-calculator-store";
import { useTranslations } from "next-intl";

export function SubnetCalculator() {
  const t = useTranslations("calculator.subnet");
  const { result, ipInput } = useSubnetCalculatorStore();

  // Only render visualizations if result exists
  if (!result) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Network Diagram */}
      <Card>
        <CardHeader>
          <CardTitle>{t("network-diagram")}</CardTitle>
        </CardHeader>
        <CardContent>
          <NetworkDiagram result={result} />
        </CardContent>
      </Card>

      {/* Binary Representation */}
      <Card>
        <CardHeader>
          <CardTitle>{t("binary-representation")}</CardTitle>
        </CardHeader>
        <CardContent>
          <BinaryRepresentation result={result} ipAddress={ipInput} />
        </CardContent>
      </Card>

      {/* Breakdown Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t("subnet-breakdown")}</CardTitle>
        </CardHeader>
        <CardContent>
          <BreakdownTable result={result} />
        </CardContent>
      </Card>
    </div>
  );
}
```

### Pattern 5: Responsive SVG Design

**What:** Use viewBox and responsive classes for mobile/desktop compatibility.
**When to use:** Always for SVG diagrams to ensure proper scaling.
**Example:**

```typescript
<svg
  viewBox="0 0 800 200"
  className="w-full h-auto max-w-4xl mx-auto"
  preserveAspectRatio="xMidYMid meet"
  role="img"
  aria-label={t("diagram.aria-label")}
>
  {/* SVG content */}
</svg>
```

**Key principles:**

- Always include `viewBox` attribute (defines coordinate system)
- Use `className="w-full h-auto"` for responsive width
- Use `preserveAspectRatio="xMidYMid meet"` to maintain proportions
- Add `max-w-*` classes to prevent oversizing on large screens

### Anti-Patterns to Avoid

- **Missing viewBox:** SVG won't scale properly across devices. Always include viewBox with coordinate system.
- **Inline styles instead of Tailwind:** Harder to maintain, doesn't support dark mode. Use className with Tailwind.
- **Using <img> for interactive SVG:** Can't style or add interactivity. Use inline SVG for diagrams.
- **Not handling BigInt display:** Shows "123n" instead of formatted number. Convert with `.toString()` or `Number()`.
- **Missing ARIA labels:** Screen readers can't interpret visual diagrams. Add role="img" and aria-label.
- **Hardcoded text in components:** Not translatable. Use next-intl's useTranslations() hook.
- **Large inline SVGs:** Bloats bundle size. For complex static images, use <img> with optimized SVG files.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem                | Don't Build                 | Use Instead                                 | Why                                                          |
| ---------------------- | --------------------------- | ------------------------------------------- | ------------------------------------------------------------ |
| Table component        | Custom table with divs/grid | shadcn/ui table component                   | Semantic HTML, accessible, responsive, matches project style |
| Binary conversion      | String manipulation         | ipaddr.js byte arrays or `.toString(2)`     | Handles IPv4/IPv6 correctly, tested                          |
| Conditional classes    | Template strings            | cn() utility from @/lib/utils               | Handles conflicts, type-safe, readable                       |
| Number formatting      | Manual toLocaleString()     | useFormatter() hook from next-intl          | Respects locale settings, consistent with project            |
| Responsive breakpoints | Custom CSS media queries    | Tailwind responsive classes (sm:, md:, lg:) | Consistent with project, mobile-first                        |
| Dark mode styling      | Custom theme detection      | Tailwind dark: variant                      | Integrated with project theme system                         |
| SVG optimization       | Manual editing              | SVGO or svgr (if using SVG files)           | Removes unnecessary attributes, reduces size                 |

**Key insight:** Subnet visualizations are simple enough that external charting/diagramming libraries (D3.js, Recharts, etc.) add unnecessary complexity and bundle size. Pure React + SVG composability provides all needed functionality.

## Common Pitfalls

### Pitfall 1: SVG Scaling Issues on Mobile

**What goes wrong:** Network diagrams appear too large or too small on mobile devices, or get cut off.
**Why it happens:** Missing or incorrect `viewBox` attribute, hardcoded width/height values.
**How to avoid:**

- Always include `viewBox="0 0 width height"` defining the coordinate system
- Use `className="w-full h-auto"` instead of fixed dimensions
- Test on actual mobile devices or browser DevTools responsive mode
- Use `preserveAspectRatio="xMidYMid meet"` to maintain aspect ratio
  **Warning signs:** Diagram clipped on edges, excessive scrolling on mobile, text too small to read.

### Pitfall 2: Binary Representation Wrapping Issues

**What goes wrong:** Binary bits wrap awkwardly on mobile, making it hard to see octet/group boundaries.
**Why it happens:** Fixed layout doesn't account for narrow viewports.
**How to avoid:**

- Use `flex flex-wrap` for bit containers
- Add visual separators every 8 bits (IPv4) or 16 bits (IPv6)
- Consider vertical layout on mobile with responsive breakpoints
- Test with IPv6 addresses (128 bits = much longer)
  **Warning signs:** Bits wrapping mid-octet, unclear which bits belong to network vs host.

### Pitfall 3: Missing Accessibility Labels

**What goes wrong:** Screen readers can't interpret visual diagrams, failing WCAG compliance.
**Why it happens:** SVG elements and visual styling are visual-only without text alternatives.
**How to avoid:**

- Add `role="img"` and `aria-label` to SVG containers
- Use `aria-label` on individual interactive elements
- Provide text alternatives summarizing visual relationships
- Test with screen reader (VoiceOver on Mac, NVDA on Windows)
  **Warning signs:** Accessibility audit failures, screen reader says "image" without description.

### Pitfall 4: BigInt Formatting Shows "n" Suffix

**What goes wrong:** Host counts display as "16777216n" instead of formatted number.
**Why it happens:** BigInt literal suffix appears when converted to string without formatting.
**How to avoid:**

- Convert BigInt: `usableHosts.toString()` removes suffix
- Use locale formatting: `format.number(Number(usableHosts))` for locale-aware display
- Check for safe integer range: `if (count <= Number.MAX_SAFE_INTEGER)`
- For very large IPv6 subnets, consider scientific notation or "more than X billion"
  **Warning signs:** Numbers ending with "n", formatting errors, scientific notation appearing unexpectedly.

### Pitfall 5: IPv4 and IPv6 Treated Identically

**What goes wrong:** Visualization shows broadcast address for IPv6 (doesn't exist) or incorrect binary layout.
**Why it happens:** Not checking `ipVersion` field before rendering version-specific elements.
**How to avoid:**

- Check `result.ipVersion === 4` before rendering IPv4-specific elements
- Use conditional rendering: `{result.broadcastAddress && ...}`
- Adjust binary display: 4 octets vs 8 groups
- Document IPv6 differences in UI (no broadcast, different bit grouping)
  **Warning signs:** Null values displayed as "null", missing sections for IPv6, incorrect bit counts.

### Pitfall 6: Performance Issues with Re-renders

**What goes wrong:** Visualizations re-render on every keystroke, causing lag.
**Why it happens:** Zustand store updates trigger re-renders even when results unchanged.
**How to avoid:**

- Zustand already optimizes with shallow equality checks
- Use React.memo() for expensive visualization components
- Don't create new objects/arrays in render (use useMemo)
- Only render visualizations when `result !== null`
  **Warning signs:** Input lag when typing, browser DevTools showing excessive re-renders.

### Pitfall 7: Dark Mode Color Contrast Issues

**What goes wrong:** Diagrams readable in light mode but invisible or low-contrast in dark mode.
**Why it happens:** Using absolute colors instead of Tailwind theme colors.
**How to avoid:**

- Use Tailwind color variants: `bg-blue-500/20 dark:bg-blue-900/30`
- Use semantic colors: `text-foreground`, `bg-card`, `border`
- Test both light and dark modes
- Use opacity for fills: `/20` suffix for transparency
  **Warning signs:** Invisible elements in dark mode, WCAG contrast failures, user complaints.

### Pitfall 8: SVG Text Not Rendering on Safari

**What goes wrong:** Text elements in SVG diagrams don't display on Safari/iOS.
**Why it happens:** Safari has stricter SVG text rendering requirements.
**How to avoid:**

- Always specify `textAnchor` attribute: `"start"`, `"middle"`, or `"end"`
- Use `className` instead of inline `fill` styles for better compatibility
- Test on Safari and iOS devices
- Avoid complex text layout; keep text positioning simple
  **Warning signs:** Missing labels on Safari, reports from iOS users.

## Code Examples

Verified patterns from research and documentation:

### Responsive SVG Container Pattern

```typescript
// Source: https://blog.logrocket.com/make-any-svg-responsive-with-this-react-component/
export function ResponsiveSVG({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 800 200"
      className="w-full h-auto"
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
    >
      {children}
    </svg>
  );
}
```

### Bitwise Highlighting Pattern

```typescript
// Source: https://gigi.nullneuron.net/gigilabs/highlighting-bitmasks-with-react/
// Adapted for subnet mask visualization

const getBitHighlight = (bitIndex: number, networkBits: number): string => {
  // Network bits: blue highlighting
  // Host bits: green highlighting
  return bitIndex < networkBits
    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30"
    : "bg-green-100 text-green-700 dark:bg-green-900/30";
};

// Render bits with conditional styling
{
  bits.map((bit, index) => (
    <span
      key={index}
      className={cn("px-1 py-0.5 rounded", getBitHighlight(index, networkBits))}
    >
      {bit}
    </span>
  ));
}
```

### IPv4 Binary Conversion

```typescript
// Source: ipaddr.js documentation + custom implementation
function ipv4ToBinary(ipAddress: string): string[] {
  const addr = ipaddr.IPv4.parse(ipAddress);
  return addr.octets.flatMap((octet) =>
    octet.toString(2).padStart(8, "0").split("")
  );
}

// Example: "192.168.1.1" -> ["1","1","0","0","0","0","0","0", ...]
```

### IPv6 Binary Conversion

```typescript
// Source: ipaddr.js documentation + custom implementation
function ipv6ToBinary(ipAddress: string): string[] {
  const addr = ipaddr.IPv6.parse(ipAddress);
  return addr.parts.flatMap((part) =>
    part.toString(2).padStart(16, "0").split("")
  );
}

// Example: "2001:db8::1" -> ["0","0","1","0","0","0","0","0", ...] (128 bits)
```

### Accessible SVG Diagram

```typescript
// Source: https://www.a11y-collective.com/blog/accessible-charts/
<svg
  viewBox="0 0 800 200"
  className="w-full h-auto"
  role="img"
  aria-label="Network diagram showing network portion (24 bits) and host portion (8 bits) for subnet 192.168.1.0/24"
>
  <title>Subnet Visualization</title>
  <desc>
    Visual representation of IP subnet showing the division between network and
    host portions. Network portion: 192.168.1.0, Host range: 0-255
  </desc>
  {/* Diagram elements */}
</svg>
```

### BigInt Formatting

```typescript
// Source: Project pattern + next-intl
import { useFormatter } from "next-intl";

function formatHostCount(count: bigint): string {
  const format = useFormatter();

  // Check if safe to convert to Number
  const num = Number(count);
  if (num <= Number.MAX_SAFE_INTEGER) {
    // Use locale-aware formatting
    return format.number(num);
  }

  // For very large numbers, use string representation
  // or scientific notation
  if (count > BigInt(1e15)) {
    return `${(Number(count) / 1e15).toFixed(2)} quadrillion`;
  }

  return count.toString();
}
```

### Conditional Rendering for IPv4/IPv6

```typescript
// Pattern: Check ipVersion before rendering version-specific elements
export function SubnetVisualization({ result }: { result: SubnetResult }) {
  return (
    <div>
      {/* Always show network address */}
      <div>Network: {result.networkAddress}</div>

      {/* IPv4-only: Broadcast address */}
      {result.ipVersion === 4 && result.broadcastAddress && (
        <div>Broadcast: {result.broadcastAddress}</div>
      )}

      {/* IPv4-only: Subnet mask */}
      {result.ipVersion === 4 && result.subnetMask && (
        <div>Subnet Mask: {result.subnetMask}</div>
      )}

      {/* IPv6-only: Note about broadcast */}
      {result.ipVersion === 6 && (
        <div className="text-muted-foreground text-sm">
          IPv6 does not use broadcast addresses. Use multicast ff02::1 for
          all-nodes.
        </div>
      )}
    </div>
  );
}
```

## State of the Art

| Old Approach                                                      | Current Approach                       | When Changed | Impact                                                |
| ----------------------------------------------------------------- | -------------------------------------- | ------------ | ----------------------------------------------------- |
| External charting libraries (D3, Recharts) for all visualizations | Pure React + SVG for simple diagrams   | ~2020        | Smaller bundles, simpler code, better performance     |
| Canvas for all visualizations                                     | SVG for < 5k elements, Canvas for more | ~2021        | Better accessibility, easier styling                  |
| Custom table HTML with divs                                       | Semantic table elements with shadcn/ui | 2023+        | Accessibility, responsiveness, standardization        |
| Inline styles for conditional styling                             | Tailwind conditional classes with cn() | 2023+        | Type safety, dark mode support, maintainability       |
| Manual ARIA implementation                                        | Radix UI primitives + semantic HTML    | 2023+        | Better accessibility out-of-box                       |
| WCAG 2.1 compliance                                               | WCAG 2.2 Level AA compliance           | 2023         | Additional success criteria (focus visible, dragging) |
| Complex SVG components                                            | Simple composable SVG primitives       | Current      | Easier to maintain, understand, and modify            |

**Deprecated/outdated:**

- **D3.js for simple static diagrams:** Overkill for subnet calculators. Use pure React + SVG.
- **Canvas-first approach:** Harder to make accessible. Start with SVG, move to Canvas only if performance requires.
- **CSS-in-JS libraries:** Added bundle size, complexity. Tailwind with dark mode variants sufficient.
- **Manual bit manipulation for binary display:** Use `.toString(2)` built-in method.

## Open Questions

Things that couldn't be fully resolved:

1. **IPv6 visualization on mobile devices**

   - What we know: IPv6 addresses are 128 bits (4x longer than IPv4)
   - What's unclear: Best mobile layout pattern for 128 binary bits
   - Recommendation: Implement vertical layout on mobile with grouped display (16 bits per row), test with real devices

2. **Performance threshold for very large subnets**

   - What we know: Visualizations re-render when store updates
   - What's unclear: Whether React.memo optimization needed for real-time updates
   - Recommendation: Implement without memo first, add if DevTools shows performance issues

3. **Color accessibility for colorblind users**

   - What we know: Blue/green distinction may be difficult for some users
   - What's unclear: Whether additional indicators (patterns, labels) needed beyond color
   - Recommendation: Use color + position + labels for redundancy, test with colorblind simulators

4. **Optimal bit grouping display**

   - What we know: IPv4 traditionally shown in 8-bit octets, IPv6 in 16-bit groups
   - What's unclear: Whether alternative groupings improve comprehension
   - Recommendation: Follow standard conventions (8 for IPv4, 16 for IPv6), allow toggle in future

5. **Table vs Grid for breakdown display**
   - What we know: Both semantic table and CSS grid can display results
   - What's unclear: Which provides better mobile experience and accessibility
   - Recommendation: Use semantic table (better screen reader support), test responsiveness

## Sources

### Primary (HIGH confidence)

- [shadcn/ui Table Component](https://ui.shadcn.com/docs/components/table) - Component structure, implementation
- [React Graph Gallery - Network Diagram](https://www.react-graph-gallery.com/network-chart) - React + SVG patterns
- [LogRocket - Make SVG Responsive](https://blog.logrocket.com/make-any-svg-responsive-with-this-react-component/) - viewBox and responsive patterns
- [Gigi Labs - Highlighting Bitmasks with React](https://gigi.nullneuron.net/gigilabs/highlighting-bitmasks-with-react/) - Bitwise highlighting pattern
- [WCAG 2.2 Guidelines](https://www.ada.gov/resources/web-guidance/) - Accessibility requirements
- [The A11Y Collective - Accessible Charts](https://www.a11y-collective.com/blog/accessible-charts/) - Data visualization accessibility
- [ipaddr.js GitHub](https://github.com/whitequark/ipaddr.js) - Binary conversion methods

### Secondary (MEDIUM confidence)

- [LogRocket - SVG vs Canvas](https://blog.logrocket.com/svg-vs-canvas/) - Performance comparison verified
- [August Infotech - SVG vs Canvas 2026](https://www.augustinfotech.com/blogs/svg-vs-canvas-animation-what-modern-frontends-should-use-in-2026/) - Modern best practices
- [Visual Subnet Calculator (davidc.net)](https://www.davidc.net/sites/default/subnets/subnets.html) - UI patterns observed
- [SubnetVisualizer.com](https://www.subnetvisualizer.com/) - Color coding patterns observed
- [NetworkAcademy.IO - Subnet Mask](https://www.networkacademy.io/ccna/ip-subnetting/the-subnet-mask) - Binary visualization concepts
- [WintelGuy - IP Mask Visualizer](https://wintelguy.com/ip-mask-visualizer.pl) - Visual calculator patterns

### Tertiary (LOW confidence)

- [GitHub - robhimslf/visual-subnet-calculator](https://github.com/robhimslf/visual-subnet-calculator) - React/TypeScript example (couldn't access full source)
- [DEV Community - Build React Charts Without Library](https://dev.to/edbentley/build-your-react-charts-without-a-library-35o8) - General pattern, not subnet-specific
- [Internet Society - IPv4 vs IPv6 Scale Visualization](https://pulse.internetsociety.org/blog/visualizing-the-scale-differences-of-ipv4-and-ipv6) - Conceptual visualization approaches

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH - Pure React + SVG verified with multiple sources, shadcn/ui table is project standard
- Architecture: HIGH - Patterns match existing project structure (Zustand, Card components, i18n)
- Visualization patterns: MEDIUM - Verified with documentation but not tested in this specific context
- Pitfalls: MEDIUM - Common issues identified from multiple sources, but some subnet-specific pitfalls not explicitly documented
- Accessibility: HIGH - WCAG 2.2 requirements verified, best practices documented

**Research date:** 2026-01-18
**Valid until:** 2026-02-18 (30 days - React/SVG patterns stable, WCAG standards stable)

**Notes:**

- No external visualization libraries needed - pure React + SVG sufficient for subnet calculator
- shadcn/ui table component perfect fit for breakdown display
- IPv4 and IPv6 require different visualization layouts due to address length
- Accessibility (WCAG 2.2 Level AA) requires ARIA labels and text alternatives for all visual elements
- Real-time updates handled automatically by Zustand store subscriptions
- Mobile responsiveness critical - test with actual devices, especially for IPv6 binary display
- Dark mode support essential - use Tailwind theme colors and opacity variants
