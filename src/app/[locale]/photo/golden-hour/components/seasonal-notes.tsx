"use client";
import { T } from "@/components/ui/t";

import { SEASONAL_NOTES } from "@/lib/converters/photo/golden-hour";

export function SeasonalNotesCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="p-4 rounded-lg border bg-amber-500/10">
        <p className="font-medium mb-2">
          <T k="ui.summer-considerations" />
        </p>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>
            <strong>
              <T k="ui.high-latitude" />
            </strong>{" "}
            {SEASONAL_NOTES.summer.highLatitude}
          </li>
          <li>
            <strong>
              <T k="ui.mid-latitude" />
            </strong>{" "}
            {SEASONAL_NOTES.summer.midLatitude}
          </li>
          <li>
            <strong>
              <T k="ui.low-latitude" />
            </strong>{" "}
            {SEASONAL_NOTES.summer.lowLatitude}
          </li>
        </ul>
      </div>
      <div className="p-4 rounded-lg border bg-blue-500/10">
        <p className="font-medium mb-2">
          <T k="ui.winter-considerations" />
        </p>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>
            <strong>
              <T k="ui.high-latitude" />
            </strong>{" "}
            {SEASONAL_NOTES.winter.highLatitude}
          </li>
          <li>
            <strong>
              <T k="ui.mid-latitude" />
            </strong>{" "}
            {SEASONAL_NOTES.winter.midLatitude}
          </li>
          <li>
            <strong>
              <T k="ui.low-latitude" />
            </strong>{" "}
            {SEASONAL_NOTES.winter.lowLatitude}
          </li>
        </ul>
      </div>
    </div>
  );
}
