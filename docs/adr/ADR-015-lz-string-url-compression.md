# ADR-015: LZ-String URL State Compression

**Status:** Accepted
**Date:** 2026-02-26
**Proposed by:** v7.0 Framework Migration

---

## Context

Complex calculators produce very long URLs when URL state sync (ADR-002) writes one
`URLSearchParams` key per form field:

- The CPU comparison calculator accepts 4 CPU IDs plus vendor/generation filter selections —
  a fully-specified URL could reach 300–400 characters
- The subnet calculator has 8+ parameters (CIDR, network class, subnet count, host count, etc.)
- Sharing these URLs via messaging apps, email clients, or QR codes was impractical;
  many messaging platforms truncate or linkify long URLs incorrectly
- The existing url-sync middleware wrote one key per field, so URL length grew linearly
  with the number of calculator inputs

Additionally, a dead-code bug was discovered in `url-sync.ts` during this work:
`Object.keys(urlParams)` was called on a `URLSearchParams` instance. `Object.keys()` on
a Web API `URLSearchParams` Map-like always returns `[]` — the key-iteration block was
never executing, silently failing to apply legacy params on initial load.

## Decision

### Library: lz-string@1.5.0

`lz-string` version 1.5.0 was installed as a **runtime dependency**:

- Ships its own TypeScript typings — no `@types/lz-string` package required
- `compressToEncodedURIComponent` produces URL-safe base64 output; no `%`-encoding of
  compression artifacts (unlike raw LZ output which contains characters requiring escaping)
- Compression is symmetric — `compressToEncodedURIComponent` / `decompressFromEncodedURIComponent`
  are lossless round-trips (verified by tests in Phase 44)

### Write Path: Single `?z=` Parameter

The URL-sync middleware now:

1. Serializes the full form state to JSON (`JSON.stringify(values)`)
2. Compresses the JSON string with `compressToEncodedURIComponent`
3. Writes the result as a single `?z=` search parameter

Result: a CPU comparison URL shrinks from ~320 characters to ~85 characters (≈74% reduction).

### Read Path: Dual-Mode Backward Compatibility

The `calculator-store.ts` read path handles two URL formats:

1. **New format** (`?z=` present): decompress and `JSON.parse` to recover state
2. **Legacy format** (`?z=` absent, per-key params present): read individual keys as before

Backward compatibility ensures URLs shared before compression adoption continue to work.
The legacy path is preserved indefinitely — no migration or deprecation period required.

### Security: Null-Safety and Prototype Pollution Prevention

Two explicit guards protect the read path:

- **Null-safety**: `decompressFromEncodedURIComponent` returns `null` on invalid or
  corrupted input. A null check before `JSON.parse` prevents a `JSON.parse(null)` call
  that would otherwise throw and crash the calculator
- **Prototype pollution**: After parsing, only keys that exist in `initialValues` are
  accepted from the parsed JSON object. Unknown keys (e.g., `__proto__`, `constructor`)
  are discarded

### Bug Fix: Object.keys on URLSearchParams

`Object.keys(urlParams)` in `url-sync.ts` was removed and replaced with the correct
`urlParams.size > 0` check using the native `URLSearchParams` API. This fixed the
dead-code block that had never executed since the URL-sync middleware was introduced.

### Search Params (not Hash)

State is stored in `URLSearchParams` (the `?` query string), not the URL hash (`#`).

The GitHub Pages deployment (ADR-008) uses a `404.html` redirect strategy that preserves
the path and search params but may interact unexpectedly with hash-based navigation.
Hash-based compression approaches were explicitly rejected to maintain GitHub Pages
compatibility.

## Alternatives Considered

| Alternative | Reason Rejected |
|-------------|----------------|
| Hash-based compression (`#z=...`) | Incompatible with GitHub Pages static routing strategy (ADR-008); hash changes do not trigger page loads, but the 404.html redirect path depends on the query string |
| pako / zlib compression | Produces binary output requiring an additional base64 encode step; `lz-string` produces URL-safe output directly in one call |
| No compression (status quo) | Acceptable for simple calculators with 2-3 params; impractical for complex calculators (CPU comparison, subnet) with 6-12 params |
| LZString via hash with custom routing | Adds routing complexity incompatible with the project's zero-server static export constraint |

## Consequences

**Positive:**

- URL length reduced 60-80% for complex calculators (CPU comparison: ~320 chars → ~85 chars)
- Single `?z=` parameter makes URLs cleaner and easier to QR-encode or share
- Backward-compatible: pre-compression URLs (without `?z=`) continue to work transparently
- Round-trip losslessness verified by tests (`src/lib/stores/__tests__/url-sync.test.ts`)
- Prototype pollution prevented by key allowlist from `initialValues`
- Dead-code `Object.keys(urlParams)` bug fixed as part of this work

**Negative / Trade-offs:**

- Compressed URLs are opaque — users cannot read or manually edit a `?z=` URL to set
  a specific calculator state (e.g., for testing or bookmarking a custom scenario)
- Users cannot construct a URL by hand for a specific calculator state
- ~3KB gzipped bundle addition (`lz-string` runtime)

## Implementation Details

- `src/lib/stores/url-sync.ts` — write path updated to use `compressToEncodedURIComponent`;
  `Object.keys(urlParams)` dead-code removed
- `src/lib/stores/calculator-store.ts` — read path: checks `?z=` first (new compressed
  format); falls back to per-key `urlParams.size > 0` (legacy format)
- `src/lib/stores/__tests__/url-sync.test.ts` — round-trip losslessness tests; null-safety
  guard tests; prototype pollution prevention tests

## Related ADRs

- [ADR-002](ADR-002-url-state-sync.md) — URL state sync; this ADR extends ADR-002 by
  replacing per-key params with a single compressed `?z=` param while preserving the
  sync architecture
- [ADR-008](ADR-008-github-pages-deployment.md) — GitHub Pages deployment; the constraint
  on search params vs hash routing drove the rejection of hash-based compression alternatives
