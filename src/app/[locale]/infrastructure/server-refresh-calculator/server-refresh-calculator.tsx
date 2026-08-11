"use client";

import { AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  calculateServerRefresh,
  getServerRefreshCpus,
  type ServerRefreshInput,
  type ServerRefreshResult,
} from "@/lib/converters/infrastructure";
import { createCalculatorStore } from "@/stores/calculator-store";

const useServerRefreshStore = createCalculatorStore<ServerRefreshInput, ServerRefreshResult>({
  name: "server-refresh-calculator",
  initialValues: {
    oldCpuId: "",
    oldSocketsPerServer: "2",
    oldServerCount: "10",
    newCpuId: "",
    newSocketsPerServer: "2",
    headroomPct: "25",
    chassisConstraint: "none",
    powerBudgetW: "0",
  },
  calculate: (input) => calculateServerRefresh(input),
});

function formatDelta(value: number, reverseColor = false): { text: string; className: string } {
  const text = value > 0 ? `+${value}` : `${value}`;
  let className = "text-muted-foreground";
  if (value > 0) {
    className = reverseColor
      ? "text-red-600 dark:text-red-400"
      : "text-green-600 dark:text-green-400";
  } else if (value < 0) {
    className = reverseColor
      ? "text-green-600 dark:text-green-400"
      : "text-red-600 dark:text-red-400";
  }
  return { text, className };
}

export function ServerRefreshCalculator() {
  const t = useTranslations("converter.server-refresh-calculator");
  const { values, setValue, result, calculationError } = useServerRefreshStore();

  const cpuList = useMemo(() => getServerRefreshCpus(), []);

  const isChassisConstrained = values.chassisConstraint !== "none";

  return (
    <div className="space-y-6">
      {/* Card 1: Old Fleet Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>{t("oldFleetTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="old-cpu">{t("oldCpuLabel")}</Label>
            <Select value={values.oldCpuId} onValueChange={(v) => setValue("oldCpuId", v)}>
              <SelectTrigger id="old-cpu">
                <SelectValue placeholder={t("selectCpuPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {cpuList.map((cpu) => (
                  <SelectItem key={cpu.id} value={cpu.id}>
                    {cpu.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="old-sockets">{t("oldSocketsLabel")}</Label>
            <Input
              id="old-sockets"
              type="number"
              min={1}
              max={8}
              value={values.oldSocketsPerServer}
              onChange={(e) => setValue("oldSocketsPerServer", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="old-server-count">{t("oldServerCountLabel")}</Label>
            <Input
              id="old-server-count"
              type="number"
              min={1}
              value={values.oldServerCount}
              onChange={(e) => setValue("oldServerCount", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Card 2: Target New CPU */}
      <Card>
        <CardHeader>
          <CardTitle>{t("newFleetTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="new-cpu">{t("newCpuLabel")}</Label>
            <Select value={values.newCpuId} onValueChange={(v) => setValue("newCpuId", v)}>
              <SelectTrigger id="new-cpu">
                <SelectValue placeholder={t("selectCpuPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {cpuList.map((cpu) => (
                  <SelectItem key={cpu.id} value={cpu.id}>
                    {cpu.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-sockets">{t("newSocketsLabel")}</Label>
            <Input
              id="new-sockets"
              type="number"
              min={1}
              max={8}
              value={values.newSocketsPerServer}
              disabled={isChassisConstrained}
              onChange={(e) => setValue("newSocketsPerServer", e.target.value)}
            />
            {isChassisConstrained && (
              <p className="text-xs text-muted-foreground">{t("constrainedHint")}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Card 3: Constraints */}
      <Card>
        <CardHeader>
          <CardTitle>{t("constraintsTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="headroom">{t("headroomLabel")}</Label>
            <Select value={values.headroomPct} onValueChange={(v) => setValue("headroomPct", v)}>
              <SelectTrigger id="headroom">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">{t("headroom.none")}</SelectItem>
                <SelectItem value="10">{t("headroom.ten")}</SelectItem>
                <SelectItem value="25">{t("headroom.twentyfive")}</SelectItem>
                <SelectItem value="50">{t("headroom.fifty")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="chassis">{t("chassisLabel")}</Label>
            <Select
              value={values.chassisConstraint}
              onValueChange={(v) => setValue("chassisConstraint", v)}
            >
              <SelectTrigger id="chassis">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t("chassis.none")}</SelectItem>
                <SelectItem value="1u-single">{t("chassis.1u-single")}</SelectItem>
                <SelectItem value="2u-dual">{t("chassis.2u-dual")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="power-budget">{t("powerBudgetLabel")}</Label>
            <Input
              id="power-budget"
              type="number"
              min={0}
              value={values.powerBudgetW}
              onChange={(e) => setValue("powerBudgetW", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">{t("powerBudgetHint")}</p>
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      {result === null && (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center text-muted-foreground">
            {t("emptyState")}
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result !== null && (
        <div className="space-y-4">
          {/* Staleness Warning */}
          {result.isStale && (
            <Card className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                      {t("staleDataWarning")}
                    </p>
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                      {result.staleWarning}
                    </p>
                    <a
                      href="https://www.spec.org/cpu2017/results/cint2017.html"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-amber-700 underline dark:text-amber-400"
                    >
                      {t("specOrgLink")}
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* New Fleet Required */}
          <Card>
            <CardHeader>
              <CardTitle>{t("resultTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t("minServersLabel")}</p>
                <p className="text-2xl font-bold">{result.minNewServerCount}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t("headroomAppliedLabel")}</p>
                <p className="text-2xl font-bold">{result.headroomPct}%</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t("requiredSpecintLabel")}</p>
                <p className="text-2xl font-bold">{result.requiredSpecint.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>

          {/* Power Budget Analysis — only when powerBudgetW > 0 */}
          {result.powerBudgetW > 0 &&
            result.serversPerRack !== null &&
            result.racksNeeded !== null && (
              <Card>
                <CardHeader>
                  <CardTitle>{t("powerAnalysisTitle")}</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{t("serversPerRackLabel")}</p>
                    <p className="text-2xl font-bold">{result.serversPerRack}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{t("racksNeededLabel")}</p>
                    <p className="text-2xl font-bold">{result.racksNeeded}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{t("perServerTdpLabel")}</p>
                    <p className="text-2xl font-bold">
                      {result.newFleet.serverCount > 0
                        ? Math.round(result.newFleet.totalTdpW / result.newFleet.serverCount)
                        : 0}{" "}
                      W
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

          {/* Fleet Delta Summary */}
          <Card>
            <CardHeader>
              <CardTitle>{t("deltaTitle")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr>
                      <th className="min-w-[140px] border bg-muted/50 p-2 text-left">
                        {t("metricLabel")}
                      </th>
                      <th className="min-w-[120px] border bg-muted/40 p-2 text-right">
                        {t("oldFleetLabel")}
                      </th>
                      <th className="min-w-[120px] border bg-muted/20 p-2 text-right">
                        {t("newFleetLabel")}
                      </th>
                      <th className="min-w-[100px] border bg-muted/10 p-2 text-right">
                        {t("deltaLabel")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Servers */}
                    {(() => {
                      const delta = result.newFleet.serverCount - result.oldFleet.serverCount;
                      const { text, className } = formatDelta(delta);
                      return (
                        <tr>
                          <td className="border bg-muted/10 p-2 font-medium">{t("servers")}</td>
                          <td className="border p-2 text-right">{result.oldFleet.serverCount}</td>
                          <td className="border p-2 text-right">{result.newFleet.serverCount}</td>
                          <td className={`border p-2 text-right font-medium ${className}`}>
                            {text}
                          </td>
                        </tr>
                      );
                    })()}

                    {/* Sockets */}
                    {(() => {
                      const delta = result.newFleet.totalSockets - result.oldFleet.totalSockets;
                      const { text, className } = formatDelta(delta);
                      return (
                        <tr>
                          <td className="border bg-muted/10 p-2 font-medium">{t("sockets")}</td>
                          <td className="border p-2 text-right">{result.oldFleet.totalSockets}</td>
                          <td className="border p-2 text-right">{result.newFleet.totalSockets}</td>
                          <td className={`border p-2 text-right font-medium ${className}`}>
                            {text}
                          </td>
                        </tr>
                      );
                    })()}

                    {/* Total Cores */}
                    {(() => {
                      const delta = result.newFleet.totalCores - result.oldFleet.totalCores;
                      const { text, className } = formatDelta(delta);
                      return (
                        <tr>
                          <td className="border bg-muted/10 p-2 font-medium">{t("totalCores")}</td>
                          <td className="border p-2 text-right">{result.oldFleet.totalCores}</td>
                          <td className="border p-2 text-right">{result.newFleet.totalCores}</td>
                          <td className={`border p-2 text-right font-medium ${className}`}>
                            {text}
                          </td>
                        </tr>
                      );
                    })()}

                    {/* Total TDP (W) — reverse color: more power = worse */}
                    {(() => {
                      const delta = result.newFleet.totalTdpW - result.oldFleet.totalTdpW;
                      const { text, className } = formatDelta(delta, true);
                      return (
                        <tr>
                          <td className="border bg-muted/10 p-2 font-medium">{t("totalTdpW")}</td>
                          <td className="border p-2 text-right">{result.oldFleet.totalTdpW}</td>
                          <td className="border p-2 text-right">{result.newFleet.totalTdpW}</td>
                          <td className={`border p-2 text-right font-medium ${className}`}>
                            {text}
                          </td>
                        </tr>
                      );
                    })()}

                    {/* Total SPECint */}
                    {(() => {
                      const delta = result.newFleet.totalSpecint - result.oldFleet.totalSpecint;
                      const { text, className } = formatDelta(delta);
                      return (
                        <tr>
                          <td className="border bg-muted/10 p-2 font-medium">
                            {t("totalSpecint")}
                          </td>
                          <td className="border p-2 text-right">
                            {result.oldFleet.totalSpecint.toLocaleString()}
                          </td>
                          <td className="border p-2 text-right">
                            {result.newFleet.totalSpecint.toLocaleString()}
                          </td>
                          <td className={`border p-2 text-right font-medium ${className}`}>
                            {text}
                          </td>
                        </tr>
                      );
                    })()}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {calculationError && <p className="mt-2 text-sm text-destructive">{calculationError}</p>}
    </div>
  );
}
