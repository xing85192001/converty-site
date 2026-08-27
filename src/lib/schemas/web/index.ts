import { z } from "zod";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Validate a string represents a number within a range */
const numStrRange = (label: string, min: number, max: number) =>
  z
    .string()
    .refine((v) => v !== "" && !Number.isNaN(Number(v)), {
      message: `${label} must be a number`,
    })
    .refine(
      (v) => {
        const n = Number(v);
        return n >= min && n <= max;
      },
      {
        message: `${label} must be between ${min} and ${max}`,
      }
    );

// ─── CSP Generator ────────────────────────────────────────────────────────────
// Note: Uses useState directly
export const CspFormSchema = z.object({
  defaultSrc: z.string(),
  scriptSrc: z.string(),
  styleSrc: z.string(),
  imgSrc: z.string(),
  connectSrc: z.string(),
  fontSrc: z.string(),
  objectSrc: z.string(),
  mediaSrc: z.string(),
  frameSrc: z.string(),
});

// ─── HTTPS Checker ────────────────────────────────────────────────────────────
// Note: Uses useState directly
export const HttpsCheckFormSchema = z.object({
  url: z.string().min(1, "URL is required"),
});

// ─── HTML Encoder ─────────────────────────────────────────────────────────────
// Note: Reference table — no input schema needed for most
export const HtmlEncoderFormSchema = z.object({
  input: z.string().min(1, "Input text is required"),
});

// ─── Redirect Checker ─────────────────────────────────────────────────────────
// Note: Uses useState directly
export const RedirectCheckFormSchema = z.object({
  url: z.string().min(1, "URL is required"),
});

// ─── SEO Performance Analyzer ─────────────────────────────────────────────────
// Note: Uses useState directly
export const SeoFormSchema = z.object({
  url: z.string().min(1, "URL is required"),
  title: z.string(),
  description: z.string(),
  score: numStrRange("Score", 0, 100),
});

// ─── SPF Checker ─────────────────────────────────────────────────────────────
// Note: Uses useState directly
export const SpfFormSchema = z.object({
  domain: z.string().min(1, "Domain is required"),
});

// ─── URL Encoder ─────────────────────────────────────────────────────────────
// Note: Uses useState directly
export const UrlEncoderFormSchema = z.object({
  input: z.string().min(1, "Input is required"),
  mode: z.enum(["encode", "decode"]),
});
