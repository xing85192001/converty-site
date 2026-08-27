"use client";

import { AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { CurrencySelector, formatCurrencyValue } from "@/components/converter/currency-selector";
import {
  calculateRentalYield,
  getSwissBenchmarks,
  getSwissCityYields,
  type RentalYieldInput,
  type RentalYieldResult,
} from "@/lib/converters/realestate/rental-yield";
import { useRentalYieldStore } from "@/stores/rental-yield-store";

export function RentalYieldCalculator() {
  const t = useTranslations("calculator.realestate.rental-yield");
  const [result, setResult] = useState<RentalYieldResult | null>(null);
  const [mounted, setMounted] = useState(false);

  const {
    purchasePrice,
    annualRent,
    annualExpenses,
    transactionCostsPercent,
    currency,
    includeMortgage,
    monthlyMortgagePayment,
    setPurchasePrice,
    setAnnualRent,
    setAnnualExpenses,
    setTransactionCostsPercent,
    setCurrency,
    setIncludeMortgage,
    setMonthlyMortgagePayment,
    reset,
  } = useRentalYieldStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const input: RentalYieldInput = {
      purchasePrice,
      annualRent,
      annualExpenses,
      transactionCostsPercent,
      currency,
      includeMortgage,
      monthlyMortgagePayment,
    };

    const calculated = calculateRentalYield(input);
    setResult(calculated);
  }, [
    purchasePrice,
    annualRent,
    annualExpenses,
    transactionCostsPercent,
    currency,
    includeMortgage,
    monthlyMortgagePayment,
    mounted,
  ]);

  if (!mounted) return null;

  const benchmarks = getSwissBenchmarks();
  const cityYields = getSwissCityYields();
  const monthlyRent = annualRent / 12;

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="text-gray-600">{t("description")}</p>
      </div>

      {/* Market Context Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-gray-700">
          <span className="font-semibold">{t("marketAverage")}:</span> {benchmarks.averageYield}% -{" "}
          {t("swissRentalYieldInfo")}
        </p>
      </div>

      {/* Main Input Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Property & Rental Income Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">{t("propertySection")}</h2>

          <div>
            <label className="block text-sm font-medium mb-1">{t("purchasePrice")}</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(Number(e.target.value))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                step="10000"
              />
              <CurrencySelector value={currency} onChange={setCurrency} showLabel={false} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t("monthlyRent")}</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={monthlyRent}
                onChange={(e) => setAnnualRent(Number(e.target.value) * 12)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                step="100"
              />
              <span className="text-sm text-gray-500">
                ({t("annual")}: {formatCurrencyValue(annualRent, currency)})
              </span>
            </div>
          </div>
        </div>

        {/* Expenses & Costs Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">{t("expensesSection")}</h2>

          <div>
            <label className="block text-sm font-medium mb-1">{t("annualExpenses")}</label>
            <input
              type="number"
              value={annualExpenses}
              onChange={(e) => setAnnualExpenses(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              step="500"
            />
            <p className="text-xs text-gray-500 mt-1">{t("expensesHint")}</p>
          </div>

          <div>
            <label className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{t("transactionCosts")}</span>
              <span className="text-sm font-semibold text-blue-600">
                {transactionCostsPercent}%
              </span>
            </label>
            <input
              type="range"
              value={transactionCostsPercent}
              onChange={(e) => setTransactionCostsPercent(Number(e.target.value))}
              min="3"
              max="6"
              step="0.1"
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">{t("transactionCostsHint")}</p>
          </div>
        </div>
      </div>

      {/* Optional Mortgage Section */}
      <div className="border border-gray-200 rounded-lg p-4">
        <label className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            checked={includeMortgage}
            onChange={(e) => setIncludeMortgage(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="font-medium">{t("includeMortgage")}</span>
        </label>

        {includeMortgage && (
          <div>
            <label className="block text-sm font-medium mb-1">{t("monthlyMortgagePayment")}</label>
            <input
              type="number"
              value={monthlyMortgagePayment}
              onChange={(e) => setMonthlyMortgagePayment(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              step="100"
            />
          </div>
        )}
      </div>

      {/* Results Display */}
      {result && (
        <div className="space-y-6">
          {/* Main Yield Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">{t("grossYield")}</p>
              <p className="text-3xl font-bold text-green-700">{result.grossYield.toFixed(2)}%</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">{t("netYield")}</p>
              <p className="text-3xl font-bold text-blue-700">{result.netYield.toFixed(2)}%</p>
            </div>
          </div>

          {/* Market Comparison */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium">{t("marketComparison")}</span>
              <span className="text-sm font-semibold">
                {result.comparisonToMarket === "above" ? "+" : ""}
                {result.comparisonPercent.toFixed(2)}%
              </span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1 bg-gray-300 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{
                    width: `${Math.min((result.netYield / 5) * 100, 100)}%`,
                  }}
                />
              </div>
              <span className="text-sm text-gray-600">{result.marketAverage}% avg</span>
            </div>
          </div>

          {/* Investment Rating */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-2">{t("investmentRating")}</p>
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full font-semibold text-white ${
                  result.rating === "excellent"
                    ? "bg-green-600"
                    : result.rating === "good"
                      ? "bg-blue-600"
                      : result.rating === "fair"
                        ? "bg-yellow-600"
                        : "bg-red-600"
                }`}
              >
                {t(`rating.${result.rating}`)}
              </span>
            </div>
          </div>

          {/* Investment Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-600">{t("grm")}</p>
              <p className="text-lg font-bold">{result.grm.toFixed(1)}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-600">{t("capRate")}</p>
              <p className="text-lg font-bold">{result.capRate.toFixed(2)}%</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-600">{t("breakEven")}</p>
              <p className="text-lg font-bold">
                {result.yearsToBreakEven < 100 ? `${result.yearsToBreakEven.toFixed(1)} y` : "∞"}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-600">{t("noi")}</p>
              <p className="text-lg font-bold">
                {formatCurrencyValue(result.netOperatingIncome, result.currency)}
              </p>
            </div>
          </div>

          {/* Cash Flow Breakdown */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold mb-4">{t("cashFlowBreakdown")}</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{t("monthlyGrossIncome")}</span>
                <span className="font-semibold text-green-600">
                  +{formatCurrencyValue(result.monthlyGrossIncome, result.currency)}/mo
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{t("monthlyExpenses")}</span>
                <span className="font-semibold text-red-600">
                  -{formatCurrencyValue(result.monthlyExpenses, result.currency)}/mo
                </span>
              </div>
              {includeMortgage && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{t("mortgagePayment")}</span>
                  <span className="font-semibold text-red-600">
                    -{formatCurrencyValue(monthlyMortgagePayment, result.currency)}/mo
                  </span>
                </div>
              )}
              <div className="border-t pt-2 mt-2 flex justify-between items-center">
                <span className="font-medium">{t("monthlyCashFlow")}</span>
                <span
                  className={`text-lg font-bold ${
                    result.monthlyCashFlow >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {result.monthlyCashFlow >= 0 ? "+" : ""}
                  {formatCurrencyValue(result.monthlyCashFlow, result.currency)}/mo
                </span>
              </div>
            </div>
          </div>

          {/* Negative Cash Flow Warning */}
          {result.monthlyCashFlow < 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-900">{t("negativeCashFlowWarning")}</p>
                <p className="text-sm text-yellow-800 mt-1">{t("negativeCashFlowHint")}</p>
              </div>
            </div>
          )}

          {/* Investment Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold mb-3">{t("investmentSummary")}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">{t("purchasePrice")}:</span>
                <span className="font-semibold">
                  {formatCurrencyValue(
                    result.totalInvestment - result.transactionCosts,
                    result.currency
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t("transactionCosts")}:</span>
                <span className="font-semibold">
                  {formatCurrencyValue(result.transactionCosts, result.currency)}
                </span>
              </div>
              <div className="border-t pt-2 mt-2 flex justify-between">
                <span className="font-medium">{t("totalInvestment")}:</span>
                <span className="font-bold text-lg">
                  {formatCurrencyValue(result.totalInvestment, result.currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Swiss City Yield Comparison */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold mb-4">{t("swissCityComparison")}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(cityYields).map(([city, data]) => (
                <div key={city} className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-600 mb-1">{t(`cities.${city}`)}</p>
                  <p className="font-bold text-sm">{data.average}%</p>
                  <p className="text-xs text-gray-500">{data.range}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Reset Button */}
          <button
            onClick={reset}
            className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300"
          >
            {t("reset")}
          </button>
        </div>
      )}
    </div>
  );
}
