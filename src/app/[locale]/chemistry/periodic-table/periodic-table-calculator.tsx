"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
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
import periodicTableData from "@/data/chemistry/periodic-table.json";
import {
  type Element,
  filterElements,
  getStatistics,
  type PeriodicTableFilter,
} from "@/lib/converters/chemistry/periodic-table-lookup";
import { PeriodicTableGrid } from "./PeriodicTableGrid";

export default function PeriodicTableCalculator() {
  const t = useTranslations("calculator.chemistry");

  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<PeriodicTableFilter>({});
  const [selectedElement, setSelectedElement] = useState<Element | null>(null);

  const filteredElements = filterElements({
    ...filter,
    query: searchQuery,
  });

  const stats = getStatistics();

  // Unique values for filters
  const categories = Array.from(
    new Set((periodicTableData as Element[]).map((e: Element) => e.category))
  ).sort();

  const periods = Array.from(
    new Set((periodicTableData as Element[]).map((e: Element) => e.period))
  )
    .filter((p): p is number => typeof p === "number")
    .sort((a, b) => a - b);

  const metalTypes = ["metal", "nonmetal", "metalloid"];

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>{t("search")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="search">{t("labels.searchElement")}</Label>
            <Input
              id="search"
              placeholder={t("searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">{t("searchHelp")}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="category">{t("labels.category")}</Label>
              <Select
                value={filter.category || "all"}
                onValueChange={(v) =>
                  setFilter({ ...filter, category: v === "all" ? undefined : v })
                }
              >
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("allCategories")}</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {t(`categories.${cat.replace(/\s+/g, "-").toLowerCase()}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="period">{t("labels.period")}</Label>
              <Select
                value={filter.period?.toString() || "all"}
                onValueChange={(v) =>
                  setFilter({
                    ...filter,
                    period: v === "all" ? undefined : parseInt(v),
                  })
                }
              >
                <SelectTrigger id="period">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("allPeriods")}</SelectItem>
                  {periods.map((p) => (
                    <SelectItem key={p} value={p!.toString()}>
                      {t("periodValue", { period: p })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="metalType">{t("labels.metalType")}</Label>
              <Select
                value={filter.metalType || "all"}
                onValueChange={(v) =>
                  setFilter({
                    ...filter,
                    metalType: v === "all" ? undefined : (v as "metal" | "nonmetal" | "metalloid"),
                  })
                }
              >
                <SelectTrigger id="metalType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("allMetalTypes")}</SelectItem>
                  {metalTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {t(`metalTypes.${type}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{t("showingElements", { count: filteredElements.length })}</span>
            {Object.keys(filter).length > 0 && (
              <button onClick={() => setFilter({})} className="text-primary hover:underline">
                {t("clearFilters")}
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Periodic Table Grid */}
      <Card>
        <CardHeader>
          <CardTitle>{t("periodicTable")}</CardTitle>
        </CardHeader>
        <CardContent>
          <PeriodicTableGrid
            elements={filteredElements}
            selectedElement={selectedElement}
            onSelectElement={setSelectedElement}
          />
        </CardContent>
      </Card>

      {/* Selected Element Details */}
      {selectedElement && (
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedElement.name} ({selectedElement.symbol})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg border bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground mb-1">{t("labels.atomicNumber")}</p>
                <p className="text-2xl font-semibold">{selectedElement.atomicNumber}</p>
              </div>

              <div className="rounded-lg border bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground mb-1">{t("labels.atomicMass")}</p>
                <p className="text-2xl font-semibold">{selectedElement.atomicMass.toFixed(4)}</p>
              </div>

              <div className="rounded-lg border bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground mb-1">{t("labels.category")}</p>
                <p className="text-lg font-medium">
                  {t(`categories.${selectedElement.category.replace(/\s+/g, "-").toLowerCase()}`)}
                </p>
              </div>

              {selectedElement.period && (
                <div className="rounded-lg border bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground mb-1">{t("labels.period")}</p>
                  <p className="text-lg font-semibold">{selectedElement.period}</p>
                </div>
              )}

              {selectedElement.group && (
                <div className="rounded-lg border bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground mb-1">{t("labels.group")}</p>
                  <p className="text-lg font-semibold">{selectedElement.group}</p>
                </div>
              )}

              <div className="rounded-lg border bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground mb-1">{t("labels.metalType")}</p>
                <p className="text-lg font-medium">
                  {t(`metalTypes.${selectedElement.metalType}`)}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-lg border bg-card p-3">
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {t("labels.electronConfiguration")}
                </p>
                <p className="text-base font-mono">{selectedElement.electronConfiguration}</p>
              </div>

              {selectedElement.oxidationStates && (
                <div className="rounded-lg border bg-card p-3">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {t("labels.oxidationStates")}
                  </p>
                  <p className="text-base">{selectedElement.oxidationStates}</p>
                </div>
              )}

              {selectedElement.electronegativity && (
                <div className="rounded-lg border bg-card p-3">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {t("labels.electronegativity")}
                  </p>
                  <p className="text-base">{selectedElement.electronegativity} (Pauling)</p>
                </div>
              )}

              {selectedElement.density && (
                <div className="rounded-lg border bg-card p-3">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {t("labels.density")}
                  </p>
                  <p className="text-base">{selectedElement.density} g/cm³</p>
                </div>
              )}

              {selectedElement.meltingPoint && (
                <div className="rounded-lg border bg-card p-3">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {t("labels.meltingPoint")}
                  </p>
                  <p className="text-base">
                    {selectedElement.meltingPoint} K
                    {selectedElement.meltingPoint !== null && (
                      <span className="text-muted-foreground ml-2">
                        ({(selectedElement.meltingPoint - 273.15).toFixed(2)} °C)
                      </span>
                    )}
                  </p>
                </div>
              )}

              {selectedElement.boilingPoint && (
                <div className="rounded-lg border bg-card p-3">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {t("labels.boilingPoint")}
                  </p>
                  <p className="text-base">
                    {selectedElement.boilingPoint} K
                    {selectedElement.boilingPoint !== null && (
                      <span className="text-muted-foreground ml-2">
                        ({(selectedElement.boilingPoint - 273.15).toFixed(2)} °C)
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>{t("statistics")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="rounded-lg border bg-primary/5 border-primary/20 p-4 text-center">
              <p className="text-sm text-muted-foreground mb-1">{t("totalElements")}</p>
              <p className="text-3xl font-bold text-primary">{stats.total}</p>
            </div>
            <div className="rounded-lg border bg-muted/50 p-4 text-center">
              <p className="text-sm text-muted-foreground mb-1">{t("metalTypes.metal")}</p>
              <p className="text-2xl font-semibold">{stats.metals}</p>
            </div>
            <div className="rounded-lg border bg-muted/50 p-4 text-center">
              <p className="text-sm text-muted-foreground mb-1">{t("metalTypes.nonmetal")}</p>
              <p className="text-2xl font-semibold">{stats.nonmetals}</p>
            </div>
            <div className="rounded-lg border bg-muted/50 p-4 text-center">
              <p className="text-sm text-muted-foreground mb-1">{t("metalTypes.metalloid")}</p>
              <p className="text-2xl font-semibold">{stats.metalloids}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
