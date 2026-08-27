"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { ResultGrid } from "@/components/converter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  formatSunTime,
  getCurrentLightPhase,
  getLightPhasesForDay,
  getSunPosition,
  getSunTimes,
  type LightPhase,
  type SunPosition,
  type SunTimes,
} from "@/lib/converters/photo/sun-position";

export function SunPositionCalculator() {
  const t = useTranslations("calculator.labels");
  const tResults = useTranslations("calculator.results");
  const tPhoto = useTranslations("calculator.photo");
  const tCommon = useTranslations("common");

  const [latitude, setLatitude] = useState(46.9481); // Bern, Switzerland
  const [longitude, setLongitude] = useState(7.4474);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));

  const [sunPosition, setSunPosition] = useState<SunPosition | null>(null);
  const [sunTimes, setSunTimes] = useState<SunTimes | null>(null);
  const [currentPhase, setCurrentPhase] = useState<LightPhase | null>(null);
  const [phases, setPhases] = useState<LightPhase[]>([]);

  useEffect(() => {
    const dateTime = new Date(`${date}T${time}:00`);
    setSunPosition(getSunPosition(dateTime, latitude, longitude));
    setSunTimes(getSunTimes(dateTime, latitude, longitude));
    setCurrentPhase(getCurrentLightPhase(dateTime, latitude, longitude));
    setPhases(getLightPhasesForDay(dateTime, latitude, longitude));
  }, [latitude, longitude, date, time]);

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{tPhoto("sunPosition") || "Sun Position & Light Phases"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("latitude") || "Latitude"}</Label>
              <Input
                type="number"
                step="0.0001"
                value={latitude}
                onChange={(e) => setLatitude(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("longitude") || "Longitude"}</Label>
              <Input
                type="number"
                step="0.0001"
                value={longitude}
                onChange={(e) => setLongitude(Number(e.target.value))}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleGetLocation}
            className="text-sm text-primary hover:underline"
          >
            {t("useMyLocation")}
          </button>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("date") || "Date"}</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t("time") || "Time"}</Label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {currentPhase && (
        <Card>
          <CardHeader>
            <CardTitle>{tResults("currentPhase")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-2xl font-bold">{currentPhase.name}</p>
              <p className="text-muted-foreground">{currentPhase.description}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {sunPosition && (
        <Card>
          <CardHeader>
            <CardTitle>{tResults("sunPosition")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResultGrid
              results={[
                {
                  label: tResults("altitude"),
                  value: `${sunPosition.altitude.toFixed(2)}°`,
                },
                {
                  label: tResults("azimuth"),
                  value: `${sunPosition.azimuth.toFixed(2)}°`,
                },
              ]}
            />
          </CardContent>
        </Card>
      )}

      {sunTimes && (
        <Card>
          <CardHeader>
            <CardTitle>{tResults("sunTimes")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResultGrid
              results={[
                {
                  label: tPhoto("sunrise"),
                  value: formatSunTime(sunTimes.sunrise),
                },
                {
                  label: tPhoto("solarNoon"),
                  value: formatSunTime(sunTimes.solarNoon),
                },
                {
                  label: tPhoto("sunset"),
                  value: formatSunTime(sunTimes.sunset),
                },
              ]}
            />
          </CardContent>
        </Card>
      )}

      {sunTimes && (
        <Card>
          <CardHeader>
            <CardTitle>{tPhoto("goldenBlueHour") || "Golden Hour & Blue Hour"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">{tPhoto("morningGoldenHour")}</h4>
              <p className="text-sm text-muted-foreground">
                {formatSunTime(sunTimes.goldenHourMorningStart)} -{" "}
                {formatSunTime(sunTimes.goldenHourMorningEnd)}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">{tPhoto("eveningGoldenHour")}</h4>
              <p className="text-sm text-muted-foreground">
                {formatSunTime(sunTimes.goldenHourEveningStart)} -{" "}
                {formatSunTime(sunTimes.goldenHourEveningEnd)}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">{tPhoto("morningBlueHour")}</h4>
              <p className="text-sm text-muted-foreground">
                {formatSunTime(sunTimes.blueHourMorningStart)} -{" "}
                {formatSunTime(sunTimes.blueHourMorningEnd)}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">{tPhoto("eveningBlueHour")}</h4>
              <p className="text-sm text-muted-foreground">
                {formatSunTime(sunTimes.blueHourEveningStart)} -{" "}
                {formatSunTime(sunTimes.blueHourEveningEnd)}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {sunTimes && (
        <Card>
          <CardHeader>
            <CardTitle>{tPhoto("twilight")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResultGrid
              results={[
                {
                  label: tPhoto("civilTwilight"),
                  value: `${formatSunTime(sunTimes.civilTwilightStart)} - ${formatSunTime(sunTimes.civilTwilightEnd)}`,
                },
                {
                  label: tPhoto("nauticalTwilight"),
                  value: `${formatSunTime(sunTimes.nauticalTwilightStart)} - ${formatSunTime(sunTimes.nauticalTwilightEnd)}`,
                },
                {
                  label: tPhoto("astronomicalTwilight"),
                  value: `${formatSunTime(sunTimes.astronomicalTwilightStart)} - ${formatSunTime(sunTimes.astronomicalTwilightEnd)}`,
                },
              ]}
            />
          </CardContent>
        </Card>
      )}

      {phases.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{tPhoto("lightPhases") || "Light Phases Timeline"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {phases.map((phase) => (
                <div
                  key={phase.name}
                  className={`p-3 rounded-md ${
                    phase.isCurrent ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{phase.name}</span>
                    <span className="text-sm">
                      {phase.startsAt ? formatSunTime(phase.startsAt) : tCommon("start")} -{" "}
                      {phase.endsAt ? formatSunTime(phase.endsAt) : tCommon("end")}
                    </span>
                  </div>
                  <p
                    className={`text-sm ${
                      phase.isCurrent ? "text-primary-foreground/80" : "text-muted-foreground"
                    }`}
                  >
                    {phase.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
