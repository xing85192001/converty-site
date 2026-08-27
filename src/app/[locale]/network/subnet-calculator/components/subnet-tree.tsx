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
import type { SubnetDivision } from "@/lib/converters/network/types";

interface SubnetTreeProps {
  division: SubnetDivision;
}

/**
 * SubnetTree component
 *
 * Displays the results of subnet division as a structured table.
 * Shows parent network info and all child subnets with their properties.
 *
 * Features:
 * - Parent network summary
 * - Table of all child subnets with key properties
 * - Locale-aware number formatting for host counts
 * - Alternating row colors for readability
 * - Monospace font for IP addresses
 */
export function SubnetTree({ division }: SubnetTreeProps) {
  const t = useTranslations("calculator.subnet.advanced");
  const format = useFormatter();

  /**
   * Format BigInt host counts with locale-aware formatting
   * Uses locale formatter for safe integers, falls back to toString() for large values
   */
  const formatHostCount = (count: bigint): string => {
    const num = Number(count);
    if (num <= Number.MAX_SAFE_INTEGER) {
      return format.number(num);
    }
    return count.toString();
  };

  return (
    <div className="space-y-4">
      {/* Parent Network Info */}
      <div className="rounded-lg border bg-muted/50 p-4">
        <h3 className="font-semibold mb-2">{t("parent-network")}</h3>
        <p className="font-mono text-sm">
          {division.parent.networkAddress}/{division.parent.cidr}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {t("hosts")}: {formatHostCount(division.parent.usableHosts)}
        </p>
      </div>

      {/* Child Subnets Table */}
      <div>
        <h3 className="font-semibold mb-2">{t("child-subnets")}</h3>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">{t("subnet-number")}</TableHead>
                <TableHead>{t("network")}</TableHead>
                <TableHead>CIDR</TableHead>
                <TableHead>{t("first-usable")}</TableHead>
                <TableHead>{t("last-usable")}</TableHead>
                <TableHead className="text-right">{t("hosts")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {division.children.map((subnet, index) => (
                <TableRow
                  key={subnet.networkAddress}
                  className={index % 2 === 0 ? "bg-muted/30" : ""}
                >
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell className="font-mono">{subnet.networkAddress}</TableCell>
                  <TableCell className="font-mono">/{subnet.cidr}</TableCell>
                  <TableCell className="font-mono text-sm">{subnet.firstUsable}</TableCell>
                  <TableCell className="font-mono text-sm">{subnet.lastUsable}</TableCell>
                  <TableCell className="text-right">
                    {formatHostCount(subnet.usableHosts)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
