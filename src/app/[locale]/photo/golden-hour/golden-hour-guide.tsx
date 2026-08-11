"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import {
  formatDuration,
  formatSunTime,
  getCurrentLightPhase,
  getSunPosition,
  getSunTimes,
  getTimeUntilGoldenHour,
} from "@/lib/converters/photo/sun-position";
import {
  CameraSettingsCards,
  ColorTemperatureTable,
  LightPhasesReference,
  PlanningTipsCard,
  SeasonalNotesCards,
  TwilightDurationTable,
} from "./components";

type LocationState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; lat: number; lng: number; locationName?: string }
  | { status: "error"; message: string };

export function GoldenHourGuide() {
  const t = useTranslations("calculator.labels");
  const tPhoto = useTranslations("calculator.photo");
  const tCommon = useTranslations("common");

  const [location, setLocation] = useState<LocationState>({ status: "idle" });
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [now, setNow] = useState(() => new Date());
  const [manualMode, setManualMode] = useState(false);
  const [manualLat, setManualLat] = useState("40.7128");
  const [manualLng, setManualLng] = useState("-74.0060");

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Request geolocation
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocation({ status: "error", message: "Geolocation is not supported by your browser" });
      return;
    }

    setLocation({ status: "loading" });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        // Try to get location name via reverse geocoding (optional)
        let locationName: string | undefined;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await response.json();
          locationName =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.county;
        } catch {
          // Ignore geocoding errors
        }
        setLocation({ status: "success", lat: latitude, lng: longitude, locationName });
      },
      (error) => {
        let message = "Failed to get location";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = "Location permission denied. You can enter coordinates manually.";
            break;
          case error.POSITION_UNAVAILABLE:
            message = "Location information unavailable";
            break;
          case error.TIMEOUT:
            message = "Location request timed out";
            break;
        }
        setLocation({ status: "error", message });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  // Get effective coordinates (from geolocation or manual input)
  const getCoordinates = (): { lat: number; lng: number } | null => {
    if (manualMode) {
      const lat = parseFloat(manualLat);
      const lng = parseFloat(manualLng);
      if (
        !Number.isNaN(lat) &&
        !Number.isNaN(lng) &&
        lat >= -90 &&
        lat <= 90 &&
        lng >= -180 &&
        lng <= 180
      ) {
        return { lat, lng };
      }
      return null;
    }
    if (location.status === "success") {
      return { lat: location.lat, lng: location.lng };
    }
    return null;
  };

  const coords = getCoordinates();
  const dateForCalc = new Date(`${selectedDate}T12:00:00`);
  const sunTimes = coords ? getSunTimes(dateForCalc, coords.lat, coords.lng) : null;
  const sunPosition = coords ? getSunPosition(now, coords.lat, coords.lng) : null;
  const currentPhase = coords ? getCurrentLightPhase(now, coords.lat, coords.lng) : null;
  const nextGoldenHour = coords ? getTimeUntilGoldenHour(now, coords.lat, coords.lng) : null;

  return (
    <div className="space-y-6">
      {/* Location & Date Controls */}
      <div className="p-4 rounded-lg border bg-muted/30 space-y-4">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2 items-center">
            {!manualMode ? (
              <button
                onClick={requestLocation}
                disabled={location.status === "loading"}
                className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
              >
                {location.status === "loading" ? (
                  <>
                    <span className="animate-spin">&#9696;</span>
                    {tPhoto("gettingLocation")}
                  </>
                ) : (
                  <>
                    <span>&#128205;</span>
                    {location.status === "success"
                      ? tPhoto("updateLocation")
                      : tPhoto("useMyLocation")}
                  </>
                )}
              </button>
            ) : null}
            <button
              onClick={() => setManualMode(!manualMode)}
              className="px-3 py-2 rounded-md border hover:bg-muted text-sm"
            >
              {manualMode ? tPhoto("useGeolocation") : tPhoto("enterManually")}
            </button>
          </div>
          <div className="flex gap-2 items-center">
            <label className="text-sm">{t("date")}:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 rounded-md border bg-background"
            />
          </div>
        </div>

        {/* Manual Coordinate Input */}
        {manualMode && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">{t("latitude")}</label>
              <input
                type="number"
                value={manualLat}
                onChange={(e) => setManualLat(e.target.value)}
                step="0.0001"
                min="-90"
                max="90"
                className="w-full h-10 px-3 rounded-md border bg-background"
                placeholder="e.g., 40.7128"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">{t("longitude")}</label>
              <input
                type="number"
                value={manualLng}
                onChange={(e) => setManualLng(e.target.value)}
                step="0.0001"
                min="-180"
                max="180"
                className="w-full h-10 px-3 rounded-md border bg-background"
                placeholder="e.g., -74.0060"
              />
            </div>
          </div>
        )}

        {/* Location Status */}
        {location.status === "error" && (
          <p className="text-sm text-destructive">{location.message}</p>
        )}
        {location.status === "success" && !manualMode && (
          <p className="text-sm text-muted-foreground">
            Location:{" "}
            {location.locationName || `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`}
          </p>
        )}
      </div>

      {/* Current Conditions (only show if we have coordinates) */}
      {coords && sunPosition && currentPhase && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div
            className={`p-4 rounded-lg border ${
              currentPhase.name.includes("Golden")
                ? "bg-amber-500/20 border-amber-500"
                : currentPhase.name.includes("Blue")
                  ? "bg-blue-500/20 border-blue-500"
                  : "bg-muted/30"
            }`}
          >
            <p className="text-sm text-muted-foreground">{tPhoto("currentPhase")}</p>
            <p className="text-xl font-bold">{currentPhase.name}</p>
            <p className="text-xs text-muted-foreground mt-1">{currentPhase.description}</p>
          </div>
          <div className="p-4 rounded-lg border bg-muted/30">
            <p className="text-sm text-muted-foreground">{tPhoto("sunAltitude")}</p>
            <p className="text-xl font-bold">{sunPosition.altitude.toFixed(1)}°</p>
            <p className="text-xs text-muted-foreground mt-1">
              {t("azimuth")}: {sunPosition.azimuth.toFixed(1)}°
            </p>
          </div>
          {nextGoldenHour && !currentPhase.name.includes("Golden") && (
            <div className="p-4 rounded-lg border bg-amber-500/10 col-span-2">
              <p className="text-sm text-muted-foreground">{tPhoto("nextGoldenHour")}</p>
              <p className="text-xl font-bold">{nextGoldenHour.phase}</p>
              <p className="text-sm">
                {tPhoto("startsIn")} <strong>{formatDuration(nextGoldenHour.timeUntil)}</strong>{" "}
                {tCommon("at")} {formatSunTime(nextGoldenHour.startTime)}
              </p>
            </div>
          )}
          {currentPhase.name.includes("Golden") && (
            <div className="p-4 rounded-lg border bg-amber-500/20 border-amber-500 col-span-2">
              <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                {tPhoto("goldenHourNow")}
              </p>
              <p className="text-sm">{tPhoto("makeTheMostOfThis")}</p>
            </div>
          )}
        </div>
      )}

      {/* Sun Times for Selected Date */}
      {coords && sunTimes && (
        <div className="space-y-4">
          <p className="text-sm font-medium">
            {tPhoto("sunTimesFor")}{" "}
            {new Date(selectedDate).toLocaleDateString(undefined, { dateStyle: "full" })}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="p-3 rounded-lg border bg-orange-500/10">
              <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                {tPhoto("sunrise")}
              </p>
              <p className="text-xl font-bold">{formatSunTime(sunTimes.sunrise)}</p>
            </div>
            <div className="p-3 rounded-lg border bg-yellow-500/10">
              <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                {tPhoto("solarNoon")}
              </p>
              <p className="text-xl font-bold">{formatSunTime(sunTimes.solarNoon)}</p>
            </div>
            <div className="p-3 rounded-lg border bg-orange-500/10">
              <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                {tPhoto("sunset")}
              </p>
              <p className="text-xl font-bold">{formatSunTime(sunTimes.sunset)}</p>
            </div>
            <div className="p-3 rounded-lg border bg-muted/30">
              <p className="text-sm font-medium">{tPhoto("dayLength")}</p>
              <p className="text-xl font-bold">
                {sunTimes.sunrise && sunTimes.sunset
                  ? formatDuration(sunTimes.sunset.getTime() - sunTimes.sunrise.getTime())
                  : "N/A"}
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="p-4 rounded-lg border bg-amber-500/10">
              <p className="font-medium text-amber-600 dark:text-amber-400 mb-2">
                {tPhoto("morningGoldenHour")}
              </p>
              <p className="text-lg font-bold">
                {formatSunTime(sunTimes.goldenHourMorningStart)} -{" "}
                {formatSunTime(sunTimes.goldenHourMorningEnd)}
              </p>
              {sunTimes.goldenHourMorningStart && sunTimes.goldenHourMorningEnd && (
                <p className="text-sm text-muted-foreground">
                  {tCommon("duration")}:
                  {formatDuration(
                    sunTimes.goldenHourMorningEnd.getTime() -
                      sunTimes.goldenHourMorningStart.getTime()
                  )}
                </p>
              )}
            </div>
            <div className="p-4 rounded-lg border bg-amber-500/10">
              <p className="font-medium text-amber-600 dark:text-amber-400 mb-2">
                {tPhoto("eveningGoldenHour")}
              </p>
              <p className="text-lg font-bold">
                {formatSunTime(sunTimes.goldenHourEveningStart)} -{" "}
                {formatSunTime(sunTimes.goldenHourEveningEnd)}
              </p>
              {sunTimes.goldenHourEveningStart && sunTimes.goldenHourEveningEnd && (
                <p className="text-sm text-muted-foreground">
                  {tCommon("duration")}:{" "}
                  {formatDuration(
                    sunTimes.goldenHourEveningEnd.getTime() -
                      sunTimes.goldenHourEveningStart.getTime()
                  )}
                </p>
              )}
            </div>
            <div className="p-4 rounded-lg border bg-blue-500/10">
              <p className="font-medium text-blue-600 dark:text-blue-400 mb-2">
                {tPhoto("morningBlueHour")}
              </p>
              <p className="text-lg font-bold">
                {formatSunTime(sunTimes.blueHourMorningStart)} -{" "}
                {formatSunTime(sunTimes.blueHourMorningEnd)}
              </p>
            </div>
            <div className="p-4 rounded-lg border bg-blue-500/10">
              <p className="font-medium text-blue-600 dark:text-blue-400 mb-2">
                {tPhoto("eveningBlueHour")}
              </p>
              <p className="text-lg font-bold">
                {formatSunTime(sunTimes.blueHourEveningStart)} -{" "}
                {formatSunTime(sunTimes.blueHourEveningEnd)}
              </p>
            </div>
          </div>

          {/* Twilight Times */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">{tPhoto("twilightPhase")}</th>
                  <th className="text-left py-2">{tPhoto("morningStart")}</th>
                  <th className="text-left py-2">{tPhoto("eveningEnd")}</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-muted">
                  <td className="py-2">{tPhoto("civilTwilight")} (-6°)</td>
                  <td className="py-2">{formatSunTime(sunTimes.civilTwilightStart)}</td>
                  <td className="py-2">{formatSunTime(sunTimes.civilTwilightEnd)}</td>
                </tr>
                <tr className="border-b border-muted">
                  <td className="py-2">{tPhoto("nauticalTwilight")} (-12°)</td>
                  <td className="py-2">{formatSunTime(sunTimes.nauticalTwilightStart)}</td>
                  <td className="py-2">{formatSunTime(sunTimes.nauticalTwilightEnd)}</td>
                </tr>
                <tr className="border-b border-muted">
                  <td className="py-2">{tPhoto("astronomicalTwilight")} (-18°)</td>
                  <td className="py-2">{formatSunTime(sunTimes.astronomicalTwilightStart)}</td>
                  <td className="py-2">{formatSunTime(sunTimes.astronomicalTwilightEnd)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Prompt to use location if not set */}
      {!coords && (
        <div className="p-6 rounded-lg border bg-muted/30 text-center">
          <p className="text-lg font-medium mb-2">{tPhoto("getAccurateSunTimes")}</p>
          <p className="text-muted-foreground mb-4">{tPhoto("getAccurateSunTimesDescription")}</p>
          <button
            onClick={requestLocation}
            className="px-6 py-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {tPhoto("enableLocation")}
          </button>
        </div>
      )}

      {/* Light Phases Reference */}
      <LightPhasesReference />

      {/* Color Temperature */}
      <ColorTemperatureTable />

      {/* Camera Settings */}
      <CameraSettingsCards />

      {/* Duration by Latitude */}
      <TwilightDurationTable />

      {/* Planning Tips */}
      <PlanningTipsCard />

      {/* Seasonal Notes */}
      <SeasonalNotesCards />
    </div>
  );
}
