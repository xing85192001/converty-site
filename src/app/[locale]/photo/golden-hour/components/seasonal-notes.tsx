"use client";

import { SEASONAL_NOTES } from "@/lib/converters/photo/golden-hour";

export function SeasonalNotesCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="p-4 rounded-lg border bg-amber-500/10">
        <p className="font-medium mb-2">Summer Considerations</p>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>
            <strong>High Latitude:</strong> {SEASONAL_NOTES.summer.highLatitude}
          </li>
          <li>
            <strong>Mid Latitude:</strong> {SEASONAL_NOTES.summer.midLatitude}
          </li>
          <li>
            <strong>Low Latitude:</strong> {SEASONAL_NOTES.summer.lowLatitude}
          </li>
        </ul>
      </div>
      <div className="p-4 rounded-lg border bg-blue-500/10">
        <p className="font-medium mb-2">Winter Considerations</p>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>
            <strong>High Latitude:</strong> {SEASONAL_NOTES.winter.highLatitude}
          </li>
          <li>
            <strong>Mid Latitude:</strong> {SEASONAL_NOTES.winter.midLatitude}
          </li>
          <li>
            <strong>Low Latitude:</strong> {SEASONAL_NOTES.winter.lowLatitude}
          </li>
        </ul>
      </div>
    </div>
  );
}
