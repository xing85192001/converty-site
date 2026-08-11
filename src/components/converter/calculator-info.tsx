import type { ReactNode } from "react";

export function CalculatorInfo({
  intro,
  sections,
}: {
  intro?: string;
  sections: { heading: string; body: ReactNode }[];
}) {
  return (
    <div className="mt-10 border-t pt-8">
      <h2 className="text-2xl font-bold tracking-tight">About this calculator</h2>
      {intro ? <p className="mt-3 text-muted-foreground">{intro}</p> : null}
      <div className="mt-6 space-y-6 text-sm leading-relaxed text-foreground/90">
        {sections.map((section, i) => (
          <section key={i}>
            <h3 className="text-lg font-semibold tracking-tight">{section.heading}</h3>
            <div className="mt-2 space-y-2">{section.body}</div>
          </section>
        ))}
      </div>
    </div>
  );
}
