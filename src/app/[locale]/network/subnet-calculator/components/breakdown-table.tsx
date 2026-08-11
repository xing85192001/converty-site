"use client";

import { useFormatter, useTranslations } from "next-intl";
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

/**
 * BreakdownTable component
 *
 * Displays subnet calculation results in a structured table format.
 * Shows all subnet properties with values and descriptions.
 *
 * Features:
 * - Locale-aware number formatting for host counts
 * - Conditional rows for IPv4-only properties (broadcast, subnet mask)
 * - BigInt formatting with fallback for large IPv6 subnets
 * - Semantic table structure for accessibility
 * - Monospace font for IP addresses and numeric values
 */
export function BreakdownTable({ result }: BreakdownTableProps) {
  const t = useTranslations("calculator.subnet.breakdown");
  const format = useFormatter();

  /**
   * Format BigInt host counts with locale-aware formatting
   *
   * Uses locale formatter for safe integers, falls back to toString()
   * for very large IPv6 subnet sizes that exceed Number.MAX_SAFE_INTEGER.
   */
  const formatHostCount = (count: bigint): string => {
    const num = Number(count);
    if (num <= Number.MAX_SAFE_INTEGER) {
      return format.number(num);
    }
    return count.toString();
  };

  // Build table rows - conditional on IPv4 vs IPv6
  const rows = [
    {
      label: t("network-address"),
      value: result.networkAddress,
      description: t("network-address-desc"),
    },
    // Broadcast address (IPv4 only)
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
      label: t("cidr"),
      value: `/${result.cidr}`,
      description: t("cidr-desc"),
    },
    // Subnet mask (IPv4 only)
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
            <TableCell className="text-muted-foreground text-sm">{row.description}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
