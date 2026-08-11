"use client";

import { useTranslations } from "next-intl";
import type { SubnetResult } from "@/lib/converters/network/types";

interface NetworkDiagramProps {
  result: SubnetResult;
}

/**
 * NetworkDiagram component
 *
 * Renders an SVG visualization showing the proportional split between
 * network and host portions of a subnet, based on CIDR prefix length.
 *
 * Features:
 * - Proportional visualization based on CIDR prefix
 * - Color-coded network (blue) and host (green) portions
 * - IP range labels with network and broadcast addresses
 * - Usable hosts count indicator
 * - Responsive SVG with accessibility support
 * - Dark mode support
 */
export function NetworkDiagram({ result }: NetworkDiagramProps) {
  const t = useTranslations("calculator.subnet.diagram");

  // Calculate proportions
  const totalBits = result.ipVersion === 4 ? 32 : 128;
  const networkPercent = (result.cidr / totalBits) * 100;
  const hostPercent = 100 - networkPercent;

  // SVG dimensions (viewBox coordinate system)
  const width = 800;
  const height = 200;
  const padding = 20;
  const barHeight = 60;
  const barY = 70;

  // Calculate bar widths
  const availableWidth = width - padding * 2;
  const networkWidth = (availableWidth * networkPercent) / 100;
  const hostWidth = (availableWidth * hostPercent) / 100;

  // Format usable hosts for display
  const formatHosts = (hosts: bigint): string => {
    if (hosts > BigInt(Number.MAX_SAFE_INTEGER)) {
      return hosts.toString();
    }
    return Number(hosts).toLocaleString();
  };

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-auto max-w-4xl"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={t("aria-label")}
    >
      {/* Network portion rectangle */}
      <rect
        x={padding}
        y={barY}
        width={networkWidth}
        height={barHeight}
        className="fill-blue-500/20 stroke-blue-500 dark:fill-blue-900/30 dark:stroke-blue-400"
        strokeWidth="2"
      />

      {/* Host portion rectangle */}
      <rect
        x={padding + networkWidth}
        y={barY}
        width={hostWidth}
        height={barHeight}
        className="fill-green-500/20 stroke-green-500 dark:fill-green-900/30 dark:stroke-green-400"
        strokeWidth="2"
      />

      {/* Network portion label */}
      <text
        x={padding + networkWidth / 2}
        y={barY + barHeight / 2}
        textAnchor="middle"
        className="fill-blue-700 dark:fill-blue-300 text-sm font-medium"
        dominantBaseline="middle"
      >
        {t("network-portion")}
      </text>

      {/* Network portion bit count */}
      <text
        x={padding + networkWidth / 2}
        y={barY + barHeight / 2 + 20}
        textAnchor="middle"
        className="fill-blue-600 dark:fill-blue-400 text-xs"
        dominantBaseline="middle"
      >
        {result.cidr} bits
      </text>

      {/* Host portion label */}
      <text
        x={padding + networkWidth + hostWidth / 2}
        y={barY + barHeight / 2}
        textAnchor="middle"
        className="fill-green-700 dark:fill-green-300 text-sm font-medium"
        dominantBaseline="middle"
      >
        {t("host-portion")}
      </text>

      {/* Host portion bit count */}
      <text
        x={padding + networkWidth + hostWidth / 2}
        y={barY + barHeight / 2 + 20}
        textAnchor="middle"
        className="fill-green-600 dark:fill-green-400 text-xs"
        dominantBaseline="middle"
      >
        {totalBits - result.cidr} bits
      </text>

      {/* Network address label (left) */}
      <text
        x={padding}
        y={barY - 10}
        textAnchor="start"
        className="fill-foreground text-xs font-mono"
      >
        {result.networkAddress}
      </text>

      {/* Broadcast/Last address label (right) */}
      <text
        x={width - padding}
        y={barY - 10}
        textAnchor="end"
        className="fill-foreground text-xs font-mono"
      >
        {result.broadcastAddress || result.lastUsable}
      </text>

      {/* Usable hosts indicator */}
      <g>
        {/* Arrow line */}
        <line
          x1={padding}
          y1={barY + barHeight + 25}
          x2={width - padding}
          y2={barY + barHeight + 25}
          className="stroke-muted-foreground"
          strokeWidth="1"
          markerEnd="url(#arrowhead)"
          markerStart="url(#arrowhead-reverse)"
        />

        {/* Usable hosts text */}
        <text
          x={width / 2}
          y={barY + barHeight + 50}
          textAnchor="middle"
          className="fill-muted-foreground text-xs"
        >
          {formatHosts(result.usableHosts)} {t("usable-hosts")}
        </text>
      </g>

      {/* Arrow marker definitions */}
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
          <polygon points="0 0, 10 5, 0 10" className="fill-muted-foreground" />
        </marker>
        <marker
          id="arrowhead-reverse"
          markerWidth="10"
          markerHeight="10"
          refX="5"
          refY="5"
          orient="auto-start-reverse"
        >
          <polygon points="0 0, 10 5, 0 10" className="fill-muted-foreground" />
        </marker>
      </defs>
    </svg>
  );
}
