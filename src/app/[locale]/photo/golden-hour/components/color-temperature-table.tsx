"use client";

import { COLOR_TEMPERATURES } from "@/lib/converters/photo/golden-hour";

export function ColorTemperatureTable() {
  return (
    <div className="space-y-4">
      <p className="text-sm font-medium">Color Temperature Reference</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Phase</th>
              <th className="text-left py-2">Temperature</th>
              <th className="text-left py-2">Color</th>
            </tr>
          </thead>
          <tbody>
            {COLOR_TEMPERATURES.map((temp) => (
              <tr key={temp.phase} className="border-b border-muted">
                <td className="py-2">{temp.phase}</td>
                <td className="py-2">{temp.kelvin}</td>
                <td className="py-2 text-muted-foreground">{temp.color}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
