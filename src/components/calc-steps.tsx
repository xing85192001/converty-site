"use client";

import { useTranslations } from "next-intl";
import type { CalcStep, TextStep } from "@/lib/calc-step";

interface CalcStepsProps {
  steps: (CalcStep | TextStep | string)[];
  /** Translation namespace, e.g. "calculator.automotive.fuelEfficiency" */
  namespace: string;
  className?: string;
}

/**
 * Render calculation steps with localization.
 *
 * - `CalcStep` objects are resolved via `t(`${namespace}.steps.${step.key}`, step.params)`
 * - `TextStep` objects (with `isText: true`) are rendered as plain text
 * - Plain strings are rendered as-is (backward compatibility)
 */
export function CalcSteps({ steps, namespace, className }: CalcStepsProps) {
  const t = useTranslations(namespace);

  return (
    <ol className={className ?? "list-inside list-decimal space-y-1 text-sm text-muted-foreground"}>
      {steps.map((step, i) => {
        let content: string;
        if (typeof step === "string") {
          content = step;
        } else if ("isText" in step && step.isText) {
          content = step.text;
        } else {
          const cs = step as CalcStep;
          try {
            content = t(`steps.${cs.key}`, cs.params);
          } catch {
            // Fallback: show key + params if translation is missing
            content = cs.key;
          }
        }
        return <li key={i}>{content}</li>;
      })}
    </ol>
  );
}

/**
 * Helper function to format a single step to string.
 * Useful for components that render steps in custom layouts.
 */
export function formatStep(
  step: CalcStep | TextStep | string,
  t: ReturnType<typeof useTranslations<string>>,
  namespace: string
): string {
  if (typeof step === "string") return step;
  if ("isText" in step && step.isText) return step.text;
  const cs = step as CalcStep;
  try {
    return t(`steps.${cs.key}`, cs.params);
  } catch {
    return cs.key;
  }
}
