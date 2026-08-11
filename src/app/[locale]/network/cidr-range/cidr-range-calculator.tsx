"use client";

import { AlertCircle, Check, X } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { InputField, OutputDisplay, ResultGrid } from "@/components/converter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCIDRRangeStore } from "@/stores/cidr-range-store";

/**
 * CIDR range calculator component
 *
 * Interactive calculator for:
 * - Calculating IP ranges from CIDR notation
 * - Checking if an IP address is within a CIDR range
 * Supports both IPv4 and IPv6.
 */
export function CIDRRangeCalculator() {
  const t = useTranslations("calculator.network");
  const tSections = useTranslations("calculator.sections");
  const tCommon = useTranslations("common");
  const format = useFormatter();

  const {
    cidrInput,
    ipToCheck,
    rangeResult,
    checkResult,
    error,
    setCIDRInput,
    setIPToCheck,
    reset,
  } = useCIDRRangeStore();

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>{tSections("input")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <InputField
            id="cidrInput"
            label={t("cidrInput")}
            value={cidrInput}
            onChange={setCIDRInput}
            placeholder="192.168.1.0/24 or 2001:db8::/32"
            type="text"
          />

          <InputField
            id="ipToCheck"
            label={t("ipToCheck")}
            value={ipToCheck}
            onChange={setIPToCheck}
            placeholder="192.168.1.50 or 2001:db8::1"
            type="text"
          />

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{t("enterCidr")}</p>
            <p className="text-sm text-muted-foreground">{t("enterIpToCheck")}</p>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Range Results Section */}
      {rangeResult && !error && (
        <Card>
          <CardHeader>
            <CardTitle>{t("rangeResults")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Primary Results */}
            <div className="grid gap-4 sm:grid-cols-2">
              <OutputDisplay
                label={t("ipVersion")}
                value={`IPv${rangeResult.ipVersion}`}
                size="lg"
              />
              <OutputDisplay label="CIDR" value={rangeResult.cidrInput} size="lg" />
            </div>

            {/* Detailed Results Grid */}
            <ResultGrid
              results={[
                {
                  label: t("firstIp"),
                  value: rangeResult.firstIP,
                },
                {
                  label: t("lastIp"),
                  value: rangeResult.lastIP,
                },
                {
                  label: t("usableRange"),
                  value: `${rangeResult.firstUsable} - ${rangeResult.lastUsable}`,
                },
                {
                  label: t("totalHosts"),
                  value: formatBigInt(rangeResult.totalHosts, format),
                },
                {
                  label: t("usableHosts"),
                  value: formatBigInt(rangeResult.usableHosts, format),
                },
              ]}
            />

            {/* IPv6 Note */}
            {rangeResult.ipVersion === 6 && (
              <div className="rounded-md bg-muted px-4 py-3">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> IPv6 has no broadcast address (uses multicast ff02::1) and
                  no subnet mask notation (CIDR only).
                </p>
              </div>
            )}

            {/* Large number warning */}
            {rangeResult.totalHosts > BigInt(Number.MAX_SAFE_INTEGER) && (
              <div className="rounded-md bg-muted px-4 py-3">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> Host counts exceed JavaScript&apos;s safe integer limit and
                  may lose precision in display.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* IP Check Results Section */}
      {checkResult && !error && (
        <Card>
          <CardHeader>
            <CardTitle>{t("checkResult")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Visual Indicator */}
            <div
              className={`rounded-lg border-2 p-6 flex items-center gap-4 ${
                checkResult.isInRange
                  ? "border-green-500 bg-green-50 dark:bg-green-950"
                  : "border-red-500 bg-red-50 dark:bg-red-950"
              }`}
            >
              <div
                className={`flex-shrink-0 rounded-full p-2 ${
                  checkResult.isInRange ? "bg-green-500 text-white" : "bg-red-500 text-white"
                }`}
              >
                {checkResult.isInRange ? <Check className="h-6 w-6" /> : <X className="h-6 w-6" />}
              </div>
              <div className="flex-1">
                <p
                  className={`text-lg font-semibold ${
                    checkResult.isInRange
                      ? "text-green-900 dark:text-green-100"
                      : "text-red-900 dark:text-red-100"
                  }`}
                >
                  {checkResult.isInRange
                    ? t("ipInRange", { ip: checkResult.ipAddress, cidr: checkResult.cidr })
                    : t("ipNotInRange", { ip: checkResult.ipAddress, cidr: checkResult.cidr })}
                </p>
                <p
                  className={`text-sm mt-1 ${
                    checkResult.isInRange
                      ? "text-green-700 dark:text-green-300"
                      : "text-red-700 dark:text-red-300"
                  }`}
                >
                  {checkResult.isInRange ? t("inRange") : t("notInRange")}
                </p>
              </div>
            </div>

            {/* Range Boundaries for Context */}
            <div className="rounded-md bg-muted px-4 py-3">
              <p className="text-sm font-medium mb-2">{t("rangeResults")}</p>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("firstIp")}:</span>
                  <span className="font-mono">{checkResult.rangeInfo.firstIP}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("lastIp")}:</span>
                  <span className="font-mono">{checkResult.rangeInfo.lastIP}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reset Button */}
      {(rangeResult || error) && (
        <div className="flex justify-end">
          <Button onClick={reset} variant="outline">
            {tCommon("reset")}
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * Format BigInt for display with locale-aware number formatting
 *
 * Converts BigInt to Number for formatting, which may lose precision
 * for very large IPv6 subnet sizes.
 */
function formatBigInt(value: bigint, format: ReturnType<typeof useFormatter>): string {
  // For very large numbers, use scientific notation
  if (value > BigInt(Number.MAX_SAFE_INTEGER)) {
    return value.toString();
  }

  // For safe integers, use locale formatting
  return format.number(Number(value));
}
