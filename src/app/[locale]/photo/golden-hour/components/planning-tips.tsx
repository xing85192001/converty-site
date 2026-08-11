"use client";

import { PLANNING_TIPS } from "@/lib/converters/photo/golden-hour";

export function PlanningTipsCard() {
  return (
    <div className="p-4 rounded-lg border bg-muted/30">
      <p className="font-medium mb-2">Planning Tips</p>
      <ul className="text-sm text-muted-foreground space-y-1">
        {PLANNING_TIPS.map((tip) => (
          <li key={tip}>&#8226; {tip}</li>
        ))}
      </ul>
    </div>
  );
}
