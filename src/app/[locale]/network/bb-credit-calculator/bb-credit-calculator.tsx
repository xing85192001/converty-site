"use client";

import { Check, Copy, Database, RotateCcw, Server } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { InputField } from "@/components/converter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { FC_SPEEDS } from "@/lib/converters/network/bb-credit-calculator";
import { useBBCreditCalculatorStore } from "@/stores/bb-credit-calculator-store";

function CopyButton({ text }: { text: string }) {
  const { copied, copy } = useCopyToClipboard();
  const t = useTranslations("calculator.network");

  return (
    <Button
      variant="outline"
      size="sm"
      className="absolute top-2 right-2"
      onClick={() => copy(text)}
      aria-label={copied ? t("bbCopied") : t("bbCopy")}
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      <span className="ml-1 text-xs">{copied ? t("bbCopied") : t("bbCopy")}</span>
    </Button>
  );
}

function CommandBlock({ label, command }: { label: string; command: string }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <div className="relative">
        <pre className="p-3 pr-24 rounded-lg bg-muted text-sm font-mono overflow-x-auto whitespace-pre">
          {command}
        </pre>
        <CopyButton text={command} />
      </div>
    </div>
  );
}

function StepsSection({ steps, title }: { steps: string[]; title: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border rounded-lg">
      <button
        type="button"
        className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors rounded-lg"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
      >
        <span className="text-sm font-medium">{title}</span>
        <span className="text-muted-foreground text-xs">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-1 border-t pt-3">
          {steps.map((step) => (
            <p key={step} className="text-sm font-mono text-muted-foreground">
              {step}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

export function BBCreditCalculator() {
  const t = useTranslations("calculator.network");
  const tCommon = useTranslations("common");

  const {
    distanceKm,
    speedGbps,
    portId,
    result,
    error,
    setDistanceKm,
    setSpeedGbps,
    setPortId,
    reset,
  } = useBBCreditCalculatorStore();

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            {t("bbInputTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              id="distanceKm"
              label={t("bbDistanceKm")}
              value={distanceKm}
              onChange={setDistanceKm}
              type="number"
              min="0.1"
              step="0.1"
              placeholder="10"
            />
            <div className="space-y-2">
              <Label htmlFor="speedGbps">{t("bbSpeedGbps")}</Label>
              <Select value={speedGbps} onValueChange={setSpeedGbps}>
                <SelectTrigger id="speedGbps">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FC_SPEEDS.map((speed) => (
                    <SelectItem key={speed} value={String(speed)}>
                      {speed}G ({speed} Gbps)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <InputField
              id="portId"
              label={t("bbPortId")}
              value={portId}
              onChange={setPortId}
              placeholder="1/1"
            />
            <p className="text-xs text-muted-foreground">{t("bbPortIdHelp")}</p>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Results Section */}
      {result && !error && (
        <>
          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                {t("bbResultsTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">{t("bbMinCredits")}</p>
                  <p className="text-2xl font-bold tabular-nums">{result.minCredits}</p>
                </div>
                <div className="rounded-lg border p-3 text-center bg-primary/5 border-primary/30">
                  <p className="text-xs text-muted-foreground mb-1">{t("bbRecommendedCredits")}</p>
                  <p className="text-2xl font-bold tabular-nums text-primary">
                    {result.recommendedCredits}
                  </p>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">{t("bbRtt")}</p>
                  <p className="text-2xl font-bold tabular-nums">
                    {result.rttMicroseconds.toFixed(1)}
                    <span className="text-sm font-normal ml-1">µs</span>
                  </p>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">{t("bbBytesInFlight")}</p>
                  <p className="text-lg font-bold tabular-nums">
                    {Math.round(result.bytesInFlight).toLocaleString()}
                    <span className="text-sm font-normal ml-1">B</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CLI Commands */}
          <Card>
            <CardHeader>
              <CardTitle>{t("bbCommandsTitle")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="brocade">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="brocade">{t("bbBrocadeTab")}</TabsTrigger>
                  <TabsTrigger value="mds">{t("bbMdsTab")}</TabsTrigger>
                </TabsList>

                <TabsContent value="brocade" className="space-y-4 mt-4">
                  <CommandBlock label={t("bbPortcfgex")} command={result.brocadePortcfgex} />
                  <CommandBlock label={t("bbPortcfgld")} command={result.brocadePortcfgld} />
                </TabsContent>

                <TabsContent value="mds" className="space-y-4 mt-4">
                  <CommandBlock label={t("bbFcrxbbcredit")} command={result.mdsFcrxbbcredit} />
                  <CommandBlock label={t("bbBufSize")} command={result.mdsBufSize} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Calculation Steps */}
          <StepsSection steps={result.steps} title={t("bbSteps")} />
        </>
      )}

      {/* Reset Button */}
      <div className="flex justify-end">
        <Button variant="outline" onClick={reset}>
          <RotateCcw className="h-4 w-4 mr-2" />
          {tCommon("reset")}
        </Button>
      </div>
    </div>
  );
}
