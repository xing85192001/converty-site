/**
 * A localized calculation step.
 *
 * Instead of pushing pre-formatted English strings, converter functions
 * push `CalcStep` objects containing a translation key (relative to the
 * calculator's `steps` namespace) and the raw numeric/textual values
 * needed for interpolation.
 *
 * The UI layer resolves the key via next-intl's `t()` function.
 */
export interface CalcStep {
  /** Translation key, relative to `{namespace}.steps.` prefix */
  key: string;
  /** Parameters for ICU message-format interpolation */
  params?: Record<string, string | number>;
}

/**
 * A step that is just plain text (section headers, blank lines, etc.)
 * These are rendered as-is without translation lookup.
 */
export interface TextStep {
  text: string;
  isText: true;
}

/**
 * Union type for steps that can be either localized or plain text.
 */
export type Step = CalcStep | TextStep;

/**
 * Helper to create a plain-text step (for section headers, separators, etc.)
 */
export function textStep(text: string): TextStep {
  return { text, isText: true };
}
