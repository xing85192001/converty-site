"use client";

import { CAMERA_SETTINGS } from "@/lib/converters/photo/golden-hour";

export function CameraSettingsCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="p-4 rounded-lg border bg-amber-500/10">
        <p className="font-medium mb-2">Golden Hour Settings</p>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>
            <strong>WB:</strong> {CAMERA_SETTINGS.goldenHour.whiteBalance}
          </li>
          <li>
            <strong>ISO:</strong> {CAMERA_SETTINGS.goldenHour.iso}
          </li>
          <li className="text-xs mt-2">{CAMERA_SETTINGS.goldenHour.notes}</li>
        </ul>
      </div>
      <div className="p-4 rounded-lg border bg-blue-500/10">
        <p className="font-medium mb-2">Blue Hour Settings</p>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>
            <strong>WB:</strong> {CAMERA_SETTINGS.blueHour.whiteBalance}
          </li>
          <li>
            <strong>ISO:</strong> {CAMERA_SETTINGS.blueHour.iso}
          </li>
          <li className="text-xs mt-2">{CAMERA_SETTINGS.blueHour.notes}</li>
        </ul>
      </div>
      <div className="p-4 rounded-lg border bg-slate-500/10">
        <p className="font-medium mb-2">Night Settings</p>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>
            <strong>WB:</strong> {CAMERA_SETTINGS.night.whiteBalance}
          </li>
          <li>
            <strong>ISO:</strong> {CAMERA_SETTINGS.night.iso}
          </li>
          <li className="text-xs mt-2">{CAMERA_SETTINGS.night.notes}</li>
        </ul>
      </div>
    </div>
  );
}
