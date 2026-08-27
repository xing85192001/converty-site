// src/app/[locale]/automotive/maintenance-intervals/maintenance-intervals-calculator.tsx
"use client";

import {
  AlertCircle,
  AlertTriangle,
  Car,
  CheckCircle,
  Clock,
  RotateCcw,
  Settings,
  Wrench,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ServiceStatus } from "@/lib/converters/automotive/maintenance-intervals";
import { getServiceTypes } from "@/lib/converters/automotive/maintenance-intervals";
import { useMaintenanceIntervalsStore } from "@/stores/maintenance-intervals-store";

export function MaintenanceIntervalsCalculator() {
  const t = useTranslations("calculator.automotive.maintenance");
  const commonT = useTranslations("common");

  const {
    currentOdometerKm,
    averageKmPerMonth,
    vehicleRegistrationYear,
    vehicleRegistrationMonth,
    oilType,
    lastServices,
    selectedServices,
    result,
    error,
    setCurrentOdometerKm,
    setAverageKmPerMonth,
    setVehicleRegistrationYear,
    setVehicleRegistrationMonth,
    setOilType,
    setLastServiceKm,
    toggleService,
    useDefaults,
    calculate,
    reset,
  } = useMaintenanceIntervalsStore();

  // Calculate on mount
  useEffect(() => {
    calculate();
  }, [calculate]);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const allServices = getServiceTypes();

  const getStatusIcon = (status: ServiceStatus) => {
    switch (status) {
      case "critical":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case "overdue":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case "due":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "due_soon":
        return <Clock className="h-5 w-5 text-yellow-400" />;
      default:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
  };

  const getStatusColor = (status: ServiceStatus) => {
    switch (status) {
      case "critical":
        return "bg-red-100 dark:bg-red-950 border-red-500";
      case "overdue":
        return "bg-red-50 dark:bg-red-900 border-red-400";
      case "due":
        return "bg-yellow-50 dark:bg-yellow-900 border-yellow-500";
      case "due_soon":
        return "bg-yellow-50 dark:bg-yellow-900 border-yellow-400";
      default:
        return "bg-green-50 dark:bg-green-950 border-green-500";
    }
  };

  const getProgressColor = (percent: number) => {
    if (percent >= 100) return "bg-red-500";
    if (percent >= 80) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="space-y-6">
      {/* Vehicle Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            {t("vehicleInfo")}
          </CardTitle>
          <CardDescription>{t("vehicleInfoDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentOdometerKm">{t("currentOdometer")}</Label>
              <Input
                id="currentOdometerKm"
                type="number"
                min="0"
                step="1000"
                value={currentOdometerKm}
                onChange={(e) => setCurrentOdometerKm(parseInt(e.target.value) || 0)}
                placeholder="50000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="averageKmPerMonth">{t("averageKmPerMonth")}</Label>
              <Input
                id="averageKmPerMonth"
                type="number"
                min="0"
                step="100"
                value={averageKmPerMonth}
                onChange={(e) => setAverageKmPerMonth(parseInt(e.target.value) || 0)}
                placeholder="1500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicleRegistrationYear">{t("registrationYear")}</Label>
              <Select
                value={vehicleRegistrationYear.toString()}
                onValueChange={(v) => setVehicleRegistrationYear(parseInt(v))}
              >
                <SelectTrigger id="vehicleRegistrationYear">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicleRegistrationMonth">{t("registrationMonth")}</Label>
              <Select
                value={vehicleRegistrationMonth.toString()}
                onValueChange={(v) => setVehicleRegistrationMonth(parseInt(v))}
              >
                <SelectTrigger id="vehicleRegistrationMonth">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month} value={month.toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="space-y-2">
              <Label htmlFor="oilType">{t("oilType")}</Label>
              <Select
                value={oilType}
                onValueChange={(v) => setOilType(v as "synthetic" | "conventional")}
              >
                <SelectTrigger id="oilType" className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="synthetic">{t("oilTypes.synthetic")}</SelectItem>
                  <SelectItem value="conventional">{t("oilTypes.conventional")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1" />
            <Button variant="outline" onClick={useDefaults}>
              <Wrench className="h-4 w-4 mr-2" />
              {t("estimateDefaults")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Service Selection */}
      <Card>
        <CardHeader>
          <CardTitle>{t("servicesTracked")}</CardTitle>
          <CardDescription>{t("servicesTrackedDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {allServices
              .filter((s) => s.id !== "oil_conventional" || oilType === "conventional")
              .filter((s) => s.id !== "oil_synthetic" || oilType === "synthetic")
              .map((service) => (
                <div key={service.id} className="flex items-center gap-2">
                  <Checkbox
                    id={service.id}
                    checked={selectedServices.includes(service.id)}
                    onCheckedChange={() => toggleService(service.id)}
                  />
                  <Label htmlFor={service.id} className="text-sm cursor-pointer">
                    {t(`serviceTypes.${service.id}`)}
                  </Label>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Last Service Records */}
      <Card>
        <CardHeader>
          <CardTitle>{t("lastServiceRecords")}</CardTitle>
          <CardDescription>{t("lastServiceRecordsDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {allServices
              .filter((s) => selectedServices.includes(s.id))
              .map((service) => (
                <div key={service.id} className="grid grid-cols-3 gap-4 items-end">
                  <div>
                    <Label className="text-sm font-medium">{t(`serviceTypes.${service.id}`)}</Label>
                    <p className="text-xs text-muted-foreground">
                      {service.intervalKm
                        ? `${commonT("every")} ${service.intervalKm.toLocaleString()} km`
                        : ""}
                      {service.intervalKm && service.intervalMonths ? ` ${commonT("or")} ` : ""}
                      {service.intervalMonths ? `${service.intervalMonths} ${t("months")}` : ""}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`${service.id}-km`} className="text-xs">
                      {t("lastKm")}
                    </Label>
                    <Input
                      id={`${service.id}-km`}
                      type="number"
                      min="0"
                      step="1000"
                      value={lastServices[service.id]?.km || ""}
                      onChange={(e) =>
                        setLastServiceKm(service.id, parseInt(e.target.value) || null)
                      }
                      placeholder="km"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`${service.id}-date`} className="text-xs">
                      {t("lastDate")}
                    </Label>
                    <Input
                      id={`${service.id}-date`}
                      type="date"
                      value={lastServices[service.id]?.date || ""}
                      onChange={(e) => {
                        const { lastServices: current } = useMaintenanceIntervalsStore.getState();
                        useMaintenanceIntervalsStore.setState({
                          lastServices: {
                            ...current,
                            [service.id]: {
                              ...current[service.id],
                              date: e.target.value || null,
                            },
                          },
                        });
                        calculate();
                      }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Results Section */}
      {result && (
        <>
          {/* MFK Inspection */}
          {result.mfkInspection && (
            <Card className={getStatusColor(result.mfkInspection.status)}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon(result.mfkInspection.status)}
                  {t("mfkInspection")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-medium">{result.mfkInspection.message}</p>
                    <p className="text-sm text-muted-foreground">
                      {t("dueDate")}: {result.mfkInspection.dueDate.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">
                      {result.mfkInspection.monthsRemaining > 0
                        ? `${result.mfkInspection.monthsRemaining} ${t("months")}`
                        : t("overdue")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            <Card className={result.overdueCount > 0 ? "border-red-500" : ""}>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-red-600">{result.overdueCount}</p>
                <p className="text-sm text-muted-foreground">{t("overdueServices")}</p>
              </CardContent>
            </Card>
            <Card className={result.dueSoonCount > 0 ? "border-yellow-500" : ""}>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-yellow-600">{result.dueSoonCount}</p>
                <p className="text-sm text-muted-foreground">{t("dueSoonServices")}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-green-600">
                  {result.totalServices - result.overdueCount - result.dueSoonCount}
                </p>
                <p className="text-sm text-muted-foreground">{t("okServices")}</p>
              </CardContent>
            </Card>
          </div>

          {/* Service List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                {t("serviceSchedule")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {result.services.map((service) => (
                  <div
                    key={service.service.id}
                    className={`p-4 rounded-lg border ${getStatusColor(service.status)}`}
                  >
                    <div className="flex items-start gap-3">
                      {getStatusIcon(service.status)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{t(`serviceTypes.${service.service.id}`)}</h4>
                          <span className="text-sm font-medium">{service.urgencyMessage}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {service.service.description}
                        </p>

                        {/* Progress bar */}
                        <div className="mt-3">
                          <Progress
                            value={Math.min(100, service.progressPercent)}
                            className="h-2"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>
                              {service.lastServiceKm
                                ? `Last: ${service.lastServiceKm.toLocaleString()} km`
                                : "No record"}
                            </span>
                            <span>
                              {service.nextDueKm
                                ? `Due: ${service.nextDueKm.toLocaleString()} km`
                                : ""}
                              {service.kmRemaining !== null && (
                                <>
                                  {" "}
                                  (
                                  {service.kmRemaining > 0
                                    ? `${service.kmRemaining.toLocaleString()} km remaining`
                                    : "Now"}
                                  )
                                </>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Reset Button */}
      <div className="flex justify-end">
        <Button variant="outline" onClick={reset}>
          <RotateCcw className="h-4 w-4 mr-2" />
          {commonT("reset")}
        </Button>
      </div>
    </div>
  );
}
