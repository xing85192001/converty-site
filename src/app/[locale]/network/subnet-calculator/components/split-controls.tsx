"use client";

import { Scissors } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DivisionCount } from "@/lib/converters/network/types";

interface SplitControlsProps {
  currentCidr: number;
  ipVersion: 4 | 6;
  divisionCount: DivisionCount;
  onDivisionCountChange: (count: DivisionCount) => void;
  onSplit: () => void;
  disabled: boolean;
}

/**
 * SplitControls component
 *
 * Provides controls for dividing a network into smaller subnets.
 *
 * Features:
 * - Calculates available division options based on current CIDR
 * - Prevents invalid divisions that would exceed max CIDR (32 for IPv4, 128 for IPv6)
 * - Dropdown selection for number of subnets (2, 4, 8, 16, etc.)
 * - Split button to trigger division operation
 */
export function SplitControls({
  currentCidr,
  ipVersion,
  divisionCount,
  onDivisionCountChange,
  onSplit,
  disabled,
}: SplitControlsProps) {
  const t = useTranslations("calculator.subnet.advanced");

  // Calculate maximum division based on current CIDR and IP version
  const maxCidr = ipVersion === 4 ? 32 : 128;
  const availableBits = maxCidr - currentCidr;

  // Valid division options (powers of 2)
  const allOptions: DivisionCount[] = [2, 4, 8, 16, 32, 64, 128, 256];

  // Filter options based on available bits
  // To divide into N subnets, we need log2(N) additional bits
  const validOptions = allOptions.filter((option) => {
    const bitsNeeded = Math.log2(option);
    return bitsNeeded <= availableBits;
  });

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
      <div className="flex-1 space-y-2">
        <label htmlFor="division-count" className="text-sm font-medium">
          {t("split-into")}
        </label>
        <div className="flex gap-2">
          <Select
            value={divisionCount.toString()}
            onValueChange={(value) =>
              onDivisionCountChange(Number.parseInt(value) as DivisionCount)
            }
            disabled={disabled}
          >
            <SelectTrigger id="division-count" className="w-[180px]">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {validOptions.map((option) => (
                <SelectItem key={option} value={option.toString()}>
                  {option} {t("subnets")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={onSplit} disabled={disabled} title={t("split-tooltip")}>
            <Scissors className="h-4 w-4 mr-2" />
            {t("split")}
          </Button>
        </div>
      </div>
    </div>
  );
}
