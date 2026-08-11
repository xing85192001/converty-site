"use client";

import { LIGHT_PHASES } from "@/lib/converters/photo/golden-hour";

export function LightPhasesReference() {
  return (
    <div className="space-y-4">
      <p className="text-sm font-medium">Light Phases by Sun Elevation</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LIGHT_PHASES.map((phase) => (
          <div
            key={phase.name}
            className={`p-4 rounded-lg border ${
              phase.name === "Golden Hour"
                ? "bg-amber-500/10 border-amber-500/30"
                : phase.name.includes("Blue") || phase.name.includes("Civil")
                  ? "bg-blue-500/10 border-blue-500/30"
                  : phase.name === "Night"
                    ? "bg-slate-900/20 border-slate-500/30"
                    : "bg-muted/30"
            }`}
          >
            <p className="font-medium">{phase.name}</p>
            <p className="text-sm text-muted-foreground">{phase.sunElevation}</p>
            <p className="text-xs mt-2">{phase.description}</p>
            <ul className="text-xs text-muted-foreground mt-2 space-y-1">
              {phase.photographyTips.map((tip) => (
                <li key={tip}>&#8226; {tip}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
