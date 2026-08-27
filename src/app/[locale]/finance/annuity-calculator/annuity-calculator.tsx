"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type AnnuityResult, calculateAnnuity } from "@/lib/converters/finance/annuity-calculator";

export function AnnuityCalculator() {
  const t = useTranslations("calculator");
  const format = useFormatter();

  const [principal, setPrincipal] = useState<number>(500000);
  const [annualInterestRate, setAnnualInterestRate] = useState<number>(5);
  const [payoutYears, setPayoutYears] = useState<number>(20);
  const [paymentFrequency, setPaymentFrequency] = useState<number>(12);
  const [annuityType, setAnnuityType] = useState<"immediate" | "deferred">("immediate");
  const [deferralYears, setDeferralYears] = useState<number>(5);

  const calcResult = calculateAnnuity({
    principal,
    annualInterestRate,
    payoutYears,
    paymentFrequency,
    annuityType,
    deferralYears: annuityType === "deferred" ? deferralYears : 0,
  });
  const result = calcResult.ok ? calcResult.value : null;

  const formatCurrency = (value: number) =>
    format.number(value, { style: "currency", currency: "CHF" });

  const getPaymentLabel = () => {
    switch (paymentFrequency) {
      case 12:
        return t("options.monthly");
      case 4:
        return t("options.quarterly");
      case 1:
        return t("options.annual");
      default:
        return t("options.periodic");
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{t("sections.input")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t("labels.annuityType")}</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="annuityType"
                  checked={annuityType === "immediate"}
                  onChange={() => setAnnuityType("immediate")}
                  className="h-4 w-4"
                />
                <span>{t("options.immediate")}</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="annuityType"
                  checked={annuityType === "deferred"}
                  onChange={() => setAnnuityType("deferred")}
                  className="h-4 w-4"
                />
                <span>{t("options.deferred")}</span>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="principal">{t("labels.principalAmount")}</Label>
            <Input
              id="principal"
              type="number"
              min="10000"
              step="10000"
              value={principal}
              onChange={(e) => setPrincipal(Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">{t("descriptions.principalAmountHelp")}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="annualInterestRate">{t("labels.interestRate")}</Label>
            <Input
              id="annualInterestRate"
              type="number"
              min="0"
              max="15"
              step="0.25"
              value={annualInterestRate}
              onChange={(e) => setAnnualInterestRate(Number(e.target.value))}
            />
          </div>

          {annuityType === "deferred" && (
            <div className="space-y-2">
              <Label htmlFor="deferralYears">{t("labels.deferralPeriod")}</Label>
              <Input
                id="deferralYears"
                type="number"
                min="1"
                max="30"
                step="1"
                value={deferralYears}
                onChange={(e) => setDeferralYears(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                {t("descriptions.deferralPeriodHelp")}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="payoutYears">{t("labels.payoutPeriod")}</Label>
            <Input
              id="payoutYears"
              type="number"
              min="5"
              max="40"
              step="1"
              value={payoutYears}
              onChange={(e) => setPayoutYears(Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentFrequency">{t("labels.paymentFrequency")}</Label>
            <select
              id="paymentFrequency"
              value={paymentFrequency}
              onChange={(e) => setPaymentFrequency(Number(e.target.value))}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
            >
              <option value={12}>{t("options.monthly")}</option>
              <option value={4}>{t("options.quarterly")}</option>
              <option value={1}>{t("options.annual")}</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("sections.results")}</CardTitle>
        </CardHeader>
        <CardContent>
          {result ? (
            <div className="space-y-4">
              <div className="p-4 bg-primary/10 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  {getPaymentLabel()} {t("results.payment")}
                </p>
                <p className="text-3xl font-bold">{formatCurrency(result.periodicPayment)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("results.forYears", { years: payoutYears })}
                </p>
              </div>

              {annuityType === "deferred" && (
                <div className="p-4 bg-blue-500/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">{t("results.valueAtPayoutStart")}</p>
                  <p className="text-xl font-bold text-blue-600">
                    {formatCurrency(result.presentValue)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("results.afterYearsOfGrowth", { years: deferralYears })}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-500/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">{t("results.totalPayments")}</p>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(result.totalPayments)}
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">{t("results.interestEarned")}</p>
                  <p className="text-xl font-bold">{formatCurrency(result.totalInterestEarned)}</p>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">{t("results.effectiveAnnualRate")}</p>
                <p className="text-xl font-bold">{result.effectiveRate.toFixed(2)}%</p>
              </div>

              <div className="border-t pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("results.initialInvestment")}</span>
                  <span>{formatCurrency(principal)}</span>
                </div>
                {annuityType === "deferred" && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {t("results.growthDuringDeferral")}
                    </span>
                    <span>{formatCurrency(result.presentValue - principal)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("results.interestDuringPayout")}</span>
                  <span>
                    {formatCurrency(
                      result.totalInterestEarned -
                        (annuityType === "deferred" ? result.presentValue - principal : 0)
                    )}
                  </span>
                </div>
                <div className="flex justify-between font-bold pt-2">
                  <span>{t("results.totalReceived")}</span>
                  <span className="text-green-600">{formatCurrency(result.totalPayments)}</span>
                </div>
              </div>

              {result.schedule.length > 0 && (
                <div className="border-t pt-4">
                  <p className="text-sm font-medium mb-2">{t("results.annualSummary")}</p>
                  <div className="space-y-2 text-sm max-h-40 overflow-y-auto">
                    {result.schedule.slice(0, 10).map((item) => (
                      <div key={item.period} className="flex justify-between">
                        <span className="text-muted-foreground">
                          {t("results.yearLabel", { year: item.period })}
                        </span>
                        <span>{formatCurrency(item.payment)}</span>
                      </div>
                    ))}
                    {result.schedule.length > 10 && (
                      <p className="text-xs text-muted-foreground">
                        {t("results.moreYears", { count: result.schedule.length - 10 })}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">{t("descriptions.enterValidValues")}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
