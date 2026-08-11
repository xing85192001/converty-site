"use client";

import { AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { CurrencySelector, formatCurrencyValue } from "@/components/converter/currency-selector";
import {
  calculatePropertyValuation,
  getConditions,
  getPropertyTypes,
  getSwissRegions,
  PROPERTY_FEATURES,
  type PropertyCondition,
  type PropertyType,
  type PropertyValuationResult,
  type SwissRegion,
} from "@/lib/converters/realestate/property-valuation";
import { usePropertyValuationStore } from "@/stores/property-valuation-store";

export function PropertyValuationCalculator() {
  const t = useTranslations("calculator.realestate.property-valuation");
  const [result, setResult] = useState<PropertyValuationResult | null>(null);
  const [mounted, setMounted] = useState(false);

  const {
    propertyType,
    region,
    size,
    rooms,
    constructionYear,
    condition,
    features,
    currency,
    setPropertyType,
    setRegion,
    setSize,
    setRooms,
    setConstructionYear,
    setCondition,
    toggleFeature,
    setCurrency,
    reset,
  } = usePropertyValuationStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const calculated = calculatePropertyValuation({
      propertyType,
      region,
      size,
      rooms,
      constructionYear,
      condition,
      features,
      currency,
    });

    setResult(calculated);
  }, [propertyType, region, size, rooms, constructionYear, condition, features, currency, mounted]);

  if (!mounted) return null;

  const propertyTypes = getPropertyTypes();
  const conditions = getConditions();
  const swissRegions = getSwissRegions();

  const currentYear = new Date().getFullYear();
  const age = currentYear - constructionYear;

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="text-gray-600">{t("description")}</p>
      </div>

      {/* Disclaimer Alert */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-yellow-900">{t("disclaimerTitle")}</p>
          <p className="text-sm text-yellow-800 mt-1">{t("disclaimerText")}</p>
        </div>
      </div>

      {/* Property Type & Location Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-1">{t("propertyType")}</label>
          <select
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value as PropertyType)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            {propertyTypes.map((type) => (
              <option key={type} value={type}>
                {t(`propertyTypes.${type}`)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">{t("region")}</label>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value as SwissRegion)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            {swissRegions.map((r) => (
              <option key={r} value={r}>
                {t(`regions.${r}`)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Currency Selector */}
      <div className="flex gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">{t("currency")}</label>
          <CurrencySelector value={currency} onChange={setCurrency} showLabel={false} />
        </div>
      </div>

      {/* Property Details Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">{t("size")} (m²)</label>
          <input
            type="number"
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            step="10"
            min="20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">{t("rooms")}</label>
          <input
            type="number"
            value={rooms}
            onChange={(e) => setRooms(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            step="0.5"
            min="1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">{t("year")}</label>
          <input
            type="number"
            value={constructionYear}
            onChange={(e) => setConstructionYear(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            step="1"
            min="1900"
            max={currentYear}
          />
          <p className="text-xs text-gray-500 mt-1">{t("ageYears", { age })}</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">{t("condition")}</label>
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value as PropertyCondition)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            {conditions.map((c) => (
              <option key={c} value={c}>
                {t(`conditions.${c}`)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Features Section */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold mb-4">{t("features")}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {PROPERTY_FEATURES.map((feature) => (
            <label key={feature.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={features.includes(feature.id)}
                onChange={() => toggleFeature(feature.id)}
                className="w-4 h-4"
              />
              <span className="text-sm">{t(`featureNames.${feature.id}`)}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Results Display */}
      {result && (
        <div className="space-y-6">
          {/* Main Valuation Card */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-6">
            <p className="text-sm text-gray-600 mb-2">{t("estimatedValue")}</p>
            <div className="space-y-3">
              <div>
                <p className="text-3xl font-bold text-blue-700">
                  {formatCurrencyValue(result.estimatedValue, result.currency)}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-3 border-t border-blue-200">
                <div>
                  <p className="text-xs text-gray-600">{t("minValue")}</p>
                  <p className="font-semibold text-sm">
                    {formatCurrencyValue(result.minValue, result.currency)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">{t("maxValue")}</p>
                  <p className="font-semibold text-sm">
                    {formatCurrencyValue(result.maxValue, result.currency)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">{t("confidence")}</p>
                  <p className="font-semibold text-sm">
                    {t(`confidenceLevels.${result.confidence}`)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-600">{t("pricePerM2")}</p>
              <p className="text-lg font-bold">
                {formatCurrencyValue(result.pricePerM2, result.currency)}/m²
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-600">{t("regionAverage")}</p>
              <p className="text-lg font-bold">
                {formatCurrencyValue(result.regionPricePerM2, result.currency)}/m²
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-600">{t("vsNational")}</p>
              <p
                className={`text-lg font-bold ${
                  result.vsRegionalAverage > 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {result.vsRegionalAverage > 0 ? "+" : ""}
                {result.vsRegionalAverage.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Valuation Breakdown */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold mb-4">{t("valuationBreakdown")}</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{t("baseValue")}</span>
                <span className="font-semibold">
                  {formatCurrencyValue(result.baseValue, result.currency)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{t("ageAdjustment")}</span>
                <span
                  className={`font-semibold ${
                    result.ageAdjustment >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {result.ageAdjustment >= 0 ? "+" : ""}
                  {formatCurrencyValue(result.ageAdjustment, result.currency)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{t("conditionAdjustment")}</span>
                <span
                  className={`font-semibold ${
                    result.conditionAdjustment >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {result.conditionAdjustment >= 0 ? "+" : ""}
                  {formatCurrencyValue(result.conditionAdjustment, result.currency)}
                </span>
              </div>
              {result.featureBonus > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{t("featureBonus")}</span>
                  <span className="font-semibold text-green-600">
                    +{formatCurrencyValue(result.featureBonus, result.currency)}
                  </span>
                </div>
              )}
              <div className="border-t pt-2 mt-2 flex justify-between items-center">
                <span className="font-medium">{t("totalAdjustments")}</span>
                <span className="text-lg font-bold">
                  {result.totalAdjustments >= 0 ? "+" : ""}
                  {formatCurrencyValue(result.totalAdjustments, result.currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Selected Features */}
          {features.length > 0 && (
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold mb-3">{t("selectedFeatures")}</h3>
              <div className="flex flex-wrap gap-2">
                {features.map((featureId) => {
                  const feature = PROPERTY_FEATURES.find((f) => f.id === featureId);
                  return (
                    <div
                      key={featureId}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      <span>{t(`featureNames.${featureId}`)}</span>
                      <span className="font-semibold">
                        +{formatCurrencyValue(feature?.bonus || 0, result.currency)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

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
