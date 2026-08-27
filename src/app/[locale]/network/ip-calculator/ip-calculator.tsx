"use client";

import { AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { InputField, OutputDisplay, ResultGrid } from "@/components/converter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useIPCalculatorStore } from "@/stores/ip-calculator-store";

/**
 * IP Address Calculator component
 *
 * Interactive calculator for classifying IP addresses.
 * Shows IP class (A-E for IPv4), public/private status,
 * and range type information.
 */
export function IPCalculator() {
  const t = useTranslations("calculator.network");
  const tSections = useTranslations("calculator.sections");
  const tCommon = useTranslations("common");

  const { ipInput, result, error, setIPInput, reset } = useIPCalculatorStore();

  /**
   * Get display value for IP class
   */
  const getClassDisplay = () => {
    if (!result) return "";
    if (result.ipClass === null) {
      return t("noClass"); // "N/A (IPv6)"
    }
    // Map class letter to translated label
    switch (result.ipClass) {
      case "A":
        return t("classA");
      case "B":
        return t("classB");
      case "C":
        return t("classC");
      case "D":
        return t("classD");
      case "E":
        return t("classE");
      default:
        return result.ipClass;
    }
  };

  /**
   * Get status string for display
   */
  const getStatusString = () => {
    if (!result) return "";
    if (result.isPublic) return t("public");
    if (result.isPrivate) return t("private");
    if (result.isSpecial) return t("special");
    return "";
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>{tSections("input")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <InputField
            id="ipInput"
            label={t("ipAddress")}
            value={ipInput}
            onChange={setIPInput}
            placeholder="192.168.1.1 or 2001:db8::1"
            type="text"
          />

          <p className="text-sm text-muted-foreground">{t("enterIpAddress")}</p>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Results Section */}
      {result && !error && (
        <Card>
          <CardHeader>
            <CardTitle>{tSections("results")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Primary Results */}
            <div className="grid gap-4 sm:grid-cols-2">
              <OutputDisplay label={t("ipVersion")} value={`IPv${result.ipVersion}`} size="lg" />
              <OutputDisplay label={t("ipAddress")} value={result.normalizedIP} size="lg" />
            </div>

            {/* Classification Results Grid */}
            <ResultGrid
              results={[
                {
                  label: t("ipClassLabel"),
                  value: getClassDisplay(),
                },
                {
                  label: t("status"),
                  value: getStatusString(),
                },
                {
                  label: t("rangeType"),
                  value: result.rangeType,
                },
                {
                  label: t("rangeDescription"),
                  value: result.rangeDescription,
                },
              ]}
            />

            {/* Status Details */}
            {result.isPublic && (
              <div className="rounded-md bg-green-50 dark:bg-green-950/30 px-4 py-3">
                <p className="text-sm text-green-800 dark:text-green-200">
                  <strong>{t("public")}:</strong> {t("publicDescription")}
                </p>
              </div>
            )}

            {result.isPrivate && (
              <div className="rounded-md bg-blue-50 dark:bg-blue-950/30 px-4 py-3">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>{t("private")}:</strong> {t("privateDescription")}
                </p>
              </div>
            )}

            {result.isSpecial && (
              <div className="rounded-md bg-amber-50 dark:bg-amber-950/30 px-4 py-3">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <strong>{t("special")}:</strong> {t("specialDescription")}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Reset Button */}
      <div className="flex justify-end">
        <Button variant="outline" onClick={reset}>
          {tCommon("reset")}
        </Button>
      </div>
    </div>
  );
}
