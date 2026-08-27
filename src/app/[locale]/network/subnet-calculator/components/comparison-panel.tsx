"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SubnetResult } from "@/lib/converters/network/types";
import { BreakdownTable } from "./breakdown-table";

interface ComparisonPanelProps {
  mode: "subnetting" | "supernetting";
  before: SubnetResult | SubnetResult[];
  after: SubnetResult | SubnetResult[];
}

/**
 * ComparisonPanel component
 *
 * Shows before/after comparison for subnetting and supernetting operations.
 *
 * Features:
 * - Two tabs: Before and After
 * - Before tab shows original network(s)
 * - After tab shows resulting network(s) after operation
 * - Uses existing BreakdownTable component for consistent display
 * - Different labels based on operation mode (subnetting vs supernetting)
 */
export function ComparisonPanel({ mode, before, after }: ComparisonPanelProps) {
  const t = useTranslations("calculator.subnet.advanced");

  // Convert single results to arrays for consistent handling
  const beforeNetworks = Array.isArray(before) ? before : [before];
  const afterNetworks = Array.isArray(after) ? after : [after];

  // Get appropriate labels based on mode
  const beforeLabel =
    mode === "subnetting"
      ? t("original-network")
      : beforeNetworks.length > 1
        ? t("original-networks")
        : t("original-network");

  const afterLabel =
    mode === "subnetting"
      ? t("new-subnets")
      : afterNetworks.length > 1
        ? t("aggregated-supernet")
        : t("aggregated-supernet");

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {mode === "subnetting" ? "Subnetting Comparison" : "Supernetting Comparison"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="before" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="before">{t("before")}</TabsTrigger>
            <TabsTrigger value="after">{t("after")}</TabsTrigger>
          </TabsList>

          <TabsContent value="before" className="space-y-4 mt-4">
            <h3 className="font-semibold text-lg">{beforeLabel}</h3>
            {beforeNetworks.map((network, index) => (
              <div key={`before-${network.networkAddress}`}>
                {beforeNetworks.length > 1 && (
                  <h4 className="font-medium mb-2">
                    {t("network")} {index + 1}
                  </h4>
                )}
                <BreakdownTable result={network} />
              </div>
            ))}
          </TabsContent>

          <TabsContent value="after" className="space-y-4 mt-4">
            <h3 className="font-semibold text-lg">{afterLabel}</h3>
            {afterNetworks.map((network, index) => (
              <div key={`after-${network.networkAddress}`}>
                {afterNetworks.length > 1 && (
                  <h4 className="font-medium mb-2">
                    {mode === "subnetting"
                      ? `${t("subnet-number")} ${index + 1}`
                      : `${t("network")} ${index + 1}`}
                  </h4>
                )}
                <BreakdownTable result={network} />
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
