import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitize HTML string to prevent XSS.
 * Uses isomorphic-dompurify which works in both Node.js (static export build)
 * and browser environments.
 *
 * Do NOT import plain 'dompurify' in Next.js — it causes 'window is not defined'
 * during static generation.
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "a", "br", "p", "ul", "ol", "li"],
    ALLOWED_ATTR: ["href", "rel", "target"],
  });
}
