"use client";
import { T } from "@/components/ui/t";

import { TWILIGHT_DURATION_EXAMPLES } from "@/lib/converters/photo/golden-hour";

export function TwilightDurationTable() {
  return (
    <div className="space-y-4">
      <p className="text-sm font-medium">
        <T k="ui.twilight-duration-by-latitude" />
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Latitude</th>
              <th className="text-left py-2">Season</th>
              <th className="text-left py-2">
                <T k="ui.golden-hour" />
              </th>
              <th className="text-left py-2">
                <T k="ui.blue-hour" />
              </th>
            </tr>
          </thead>
          <tbody>
            {TWILIGHT_DURATION_EXAMPLES.map((ex) => (
              <tr key={`${ex.latitude}-${ex.season}`} className="border-b border-muted">
                <td className="py-2">{ex.latitude}°</td>
                <td className="py-2 capitalize">{ex.season}</td>
                <td className="py-2">{ex.goldenHour}</td>
                <td className="py-2">{ex.blueHour}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
