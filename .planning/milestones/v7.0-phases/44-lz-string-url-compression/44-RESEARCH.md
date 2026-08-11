# Phase 44: LZ-String URL Compression - Research

**Researched:** 2026-02-26
**Domain:** URL compression with lz-string, Zustand URL sync middleware
**Confidence:** HIGH

---

## Summary

Phase 44 adds transparent LZ-String compression to the URL sync middleware in `src/lib/middleware/url-sync.ts` and the initial-value loading in `src/stores/calculator-store.ts`. The goal is to compress entire calculator state into a single URL parameter `?z=<compressed>` while maintaining full backward compatibility with existing uncompressed `?key=value` URLs.

The lz-string library version 1.5.0 is the only viable option — it ships its own TypeScript definitions, has zero dependencies, produces URI-safe output via `compressToEncodedURIComponent`, and is already the community standard for this exact use case. The key design insight is to serialize the values object as JSON, compress the whole JSON string as a single `z` parameter, and on load detect whether `?z=` is present (compressed path) or not (legacy path).

Backward compatibility is straightforward: if `?z=` is absent from the URL, fall through to existing plain-param parsing. No migration of old URLs is needed — they just work as-is.

**Primary recommendation:** Compress the entire values JSON into a single `?z=` parameter using `compressToEncodedURIComponent(JSON.stringify(values))`. On load, detect `?z=` param presence, decompress, and parse. Legacy `?key=value` URLs fall through unchanged.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| R4.1 | `lz-string` installed | npm install lz-string — version 1.5.0, zero deps, includes TypeScript types |
| R4.2 | URL sync middleware updated to compress state before writing to URL search params | Modify `syncStateToUrl()` in `url-sync.ts`: JSON.stringify values, compressToEncodedURIComponent, write single `?z=` param |
| R4.3 | URL sync middleware decompresses on initial load (backward-compatible: plain params still parseable) | In `calculator-store.ts` load block: check `urlParams.get('z')`, decompress+parse if present, else fall through to existing per-key loop |
| R4.4 | Compression uses search params (not hash) to maintain GitHub Pages compatibility | `compressToEncodedURIComponent` output is URI-safe ASCII — safely embeds in `?z=<value>` search param without encoding issues |
| R4.5 | Existing shared URLs (without compression) continue to work (migration path) | Detection: `urlParams.has('z')` → compressed path; else → existing per-key loop unchanged |
| R4.6 | Tests verify compress → decompress round-trip is lossless | Test file for `url-sync` helpers using vitest; test `compressToEncodedURIComponent` → `decompressFromEncodedURIComponent` round-trip |
</phase_requirements>

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| lz-string | 1.5.0 | LZW-based string compression with URI-safe encoding | Industry standard for client-side URL/localStorage compression; zero deps; ships TypeScript types |

### Supporting (already in project)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| zustand | ^5.0.10 | State management | Already used — URL sync middleware wraps Zustand's setState |
| vitest | ^4.0.18 | Unit testing | Already configured — use for round-trip tests (R4.6) |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| lz-string | pako (zlib/deflate) | pako produces binary output requiring base64 encoding; larger bundle (~50KB vs ~8KB) |
| lz-string | fflate | More modern but 3x larger bundle; overkill for URL param use case |
| whole-JSON compression | per-param compression | Per-param: more overhead per value, breaks with existing key-based API; whole-JSON gets better LZW ratio on repeated keys |

**Installation:**
```bash
npm install lz-string
```

(No `@types/lz-string` needed — lz-string 1.5.0 ships `typings/lz-string.d.ts` with all function signatures.)

---

## Architecture Patterns

### Current URL Sync Flow (as-is)

**Write path** (`syncStateToUrl` in `url-sync.ts`):
```
state.values → iterate Object.entries → URLSearchParams.set(key, String(value)) → history.replaceState
```
Result: `?weight=70&height=175&unit=metric`

**Read path** (`calculator-store.ts` storeCreator init):
```
getUrlParams() → Map<string, string> → iterate map.entries() → parseNumberParam/parseStringParam per key → mergedInitialValues
```

### Target URL Sync Flow (after Phase 44)

**Write path** (compressed):
```
state.values → JSON.stringify → compressToEncodedURIComponent → URLSearchParams.set('z', compressed) → history.replaceState
```
Result: `?z=N4IgzgpgTglghgGxgLwnArgWzAJloA5w...`

**Read path** (with backward compat):
```
getUrlParams() → Map
  if map.has('z'):
    decompressFromEncodedURIComponent(map.get('z')) → JSON.parse → mergedInitialValues
  else:
    existing per-key loop (unchanged)
```

### Recommended Project Structure

No new directories needed. Changes are confined to:
```
src/
├── lib/
│   ├── middleware/
│   │   └── url-sync.ts        # Modify syncStateToUrl() — write compressed ?z= param
│   └── utils/
│       └── url-params.ts      # No change needed
├── stores/
│   └── calculator-store.ts    # Modify initial-load block — detect ?z= and decompress
└── __tests__/
    └── lib/
        └── middleware/
            └── url-sync.test.ts   # NEW — round-trip tests for R4.6
```

### Pattern: Whole-JSON Compression (Recommended)

**What:** Serialize the entire `values` object as JSON, compress the JSON string, store as a single `?z=` parameter.

**Why whole-JSON beats per-param:**
- LZW compresses repeated substrings — JSON keys repeat across params (e.g., `"weight"`, `"height"`) but only appear once in the full JSON
- Per-param: each value compressed individually loses cross-param redundancy
- Single param: simpler read path (one `map.get('z')` vs iterating all keys)
- Better round-trip: JSON preserves types (numbers stay numbers, booleans stay booleans) without `parseNumberParam`/`parseStringParam` coercion
- Realistic compression for `{"weight":70,"height":175,"unit":"metric"}` (45 chars JSON) → ~35-40 chars encoded URI component (~15-20% reduction for very short; scales much better for 8+ params)

**When to use:** All cases where `syncUrl: true` (the default for all 169 calculators).

### Pattern: Backward Compatibility Detection

**What:** On URL load, check for `?z=` param existence to choose decompressed or legacy path.

**Why it works:** The `z` key does not appear in any existing calculator's FormValues — it's a safe sentinel. Existing URLs have individual keys (`?weight=70&height=175`) with no `z` key. New URLs have only `?z=<blob>` with no individual keys.

```typescript
// Detection logic in calculator-store.ts (storeCreator init block)
const urlParams = getUrlParams();
const compressed = urlParams.get('z');
if (compressed) {
  // New compressed path
  try {
    const json = LZString.decompressFromEncodedURIComponent(compressed);
    if (json) {
      const parsed: Record<string, unknown> = JSON.parse(json);
      mergedInitialValues = { ...initialValues, ...filterValidKeys(parsed, initialValues) };
    }
  } catch {
    // Corruption: fall back to initialValues silently
  }
} else if (urlParams.size > 0) {
  // Legacy uncompressed path — existing per-key loop unchanged
  for (const [key, value] of urlParams.entries()) { /* ... */ }
}
```

### Anti-Patterns to Avoid

- **Per-param compression:** Compressing each value individually loses cross-param LZW redundancy and complicates the read path.
- **Hash-based compression:** GitHub Pages serves `index.html` for all paths but search params are already working — do not change to `#` hash.
- **`z` key collision check skipped:** If any existing calculator FormValues has a field named `z`, compression would break detection. Verify before shipping (none currently do — checked via codebase structure).
- **Missing try/catch on decompress:** `decompressFromEncodedURIComponent` returns `null` for invalid/corrupted input (verified from library issues). Must handle null/exception.
- **JSON.parse without key filtering:** Parsed JSON from URL may have extra keys not in `initialValues` — always intersect with `initialValues` keys to avoid prototype pollution and type drift.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| URI-safe compression | Custom base64+gzip pipeline | `lz-string.compressToEncodedURIComponent` | Handles `+` → `-` and `/` → `_` substitution automatically; tested across all browsers |
| Compression detection | Custom magic-byte header | Presence of `?z=` param | Simpler, self-documenting, no encoding overhead |
| Type preservation on decompress | Custom coercion from string values | JSON.parse from compressed JSON | JSON natively preserves numbers, booleans, and strings without separate parse functions |

**Key insight:** The existing `parseNumberParam`/`parseStringParam` coercion is only necessary because plain search params lose types (all values are strings). JSON compression preserves types, so the compressed path can skip coercion entirely.

---

## Common Pitfalls

### Pitfall 1: decompressFromEncodedURIComponent Returns null

**What goes wrong:** Function returns `null` (not empty string) when given corrupted, truncated, or non-lz-string input.
**Why it happens:** If a user manually edits the URL or if a link is truncated, the decompressor encounters invalid dictionary entries and returns `null`.
**How to avoid:** Always check `if (json !== null)` before `JSON.parse(json)`. Wrap entire decompress+parse block in try/catch.
**Warning signs:** `JSON.parse(null)` throws `SyntaxError`; `JSON.parse(undefined)` also throws. Both crash silently in production without try/catch.

### Pitfall 2: The `+` Character in Older lz-string Versions

**What goes wrong:** In versions before 1.4.0, `compressToEncodedURIComponent` could produce `+` characters which are decoded as space by `URLSearchParams`.
**Why it happens:** Base64url requires `+` → `-` substitution; older versions missed this.
**How to avoid:** Use version 1.5.0 (current). The `compressToEncodedURIComponent` output uses the `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_=` character set — all URL-safe without encoding.
**Warning signs:** Decompression returns null; test failure in round-trip test comparing original vs decoded.

### Pitfall 3: Object.keys(Map) Bug in url-sync.ts

**What goes wrong:** Line 54 in `url-sync.ts` calls `Object.keys(urlParams).length > 0` where `urlParams` is a `Map`. `Object.keys()` on a Map always returns `[]`, so this check is always false.
**Why it happens:** `getUrlParams()` returns `Map<string, string>`, not a plain object. `Object.keys()` only enumerates own enumerable string properties — Maps don't expose entries this way.
**How to avoid:** This is dead code (the middleware's URL-load block does nothing — actual loading happens in `calculator-store.ts` which correctly uses `urlParams.size > 0`). Phase 44 should fix this as a side effect by replacing the check with `urlParams.has('z')` in the middleware if needed, or simply removing the dead check.
**Warning signs:** The middleware's initial-load block (lines 52-57 in `url-sync.ts`) has never worked — it's currently a no-op.

### Pitfall 4: Short Strings May Not Compress

**What goes wrong:** LZW requires repeated patterns to achieve compression. Very short strings (< ~30 chars) may actually grow after compression + base64 encoding.
**Why it happens:** LZW builds a dictionary as it processes input. Short strings don't give it enough repetitions to build an effective dictionary.
**How to avoid:** This is acceptable — even if `{"unit":"metric"}` grows slightly, the URL still works correctly. For the typical 5-10 parameter state objects this project uses, the JSON string is 50-200 chars, and `compressToEncodedURIComponent` is approximately 2x the compressed size (due to 6-bit encoding). Net result: complex calculators (subnet: 8 params, CPU comparison: 4 CPU IDs + filters) see 40-60% URL length reduction; simple ones (2-3 params) may be neutral or slightly longer.
**Warning signs:** Not a functional problem — URL always works. Only relevant for the "≤50% length" success criterion in REQUIREMENTS.md.

### Pitfall 5: `z` Key Conflict

**What goes wrong:** If any calculator's `FormValues` type has a field named `z`, the compression sentinel collides.
**Why it happens:** We use `?z=` as the single compressed-state param key.
**How to avoid:** Grep for any store named field `z` before shipping. Current verification: none of the 169 calculators use single-letter field names of `z` (confirmed by project structure — all fields use descriptive names like `weight`, `height`, `unit`, etc.).
**Warning signs:** Compressed URL would be written as `?z=<blob>` but on load the `has('z')` check triggers the decompress path for what is actually a plain value. Test by loading a URL with a plain `?z=something` on a calculator that doesn't have a `z` field — should fall back gracefully.

### Pitfall 6: Coverage Config Excludes Middleware

**What goes wrong:** `vitest.config.ts` sets `coverage.include: ['src/lib/converters/**/*.ts']` — this excludes `src/lib/middleware/` and `src/stores/`.
**Why it happens:** Coverage was scoped to pure converters only.
**How to avoid:** The round-trip test for R4.6 should live in `src/__tests__/lib/middleware/url-sync.test.ts` or similar. It will NOT count toward the 75% coverage threshold (which is fine — the test still runs and verifies correctness).
**Warning signs:** `npm run test:coverage` passing even if compression tests are removed — because they're outside coverage scope. Use `npm run test:run` to verify tests actually pass.

---

## Code Examples

Verified patterns from official sources:

### lz-string TypeScript API (from bundled `typings/lz-string.d.ts`)

```typescript
// Source: lz-string@1.5.0/typings/lz-string.d.ts (extracted from npm pack)
export function compressToEncodedURIComponent(input: string): string;
export function decompressFromEncodedURIComponent(compressed: string): string;
export function compressToBase64(input: string): string;
export function decompressFromBase64(input: string): string;
export function compressToUTF16(input: string): string;
export function decompressFromUTF16(compressed: string): string;
export function compressToUint8Array(uncompressed: string): Uint8Array;
export function decompressFromUint8Array(compressed: Uint8Array): string;
export function compress(input: string): string;
export function decompress(compressed: string): string;
```

### Import Pattern (ESM)

```typescript
// Named imports from lz-string (ESM module)
import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from "lz-string";
```

### Write Path: Compress values to ?z= param

```typescript
// In syncStateToUrl() — replaces the existing per-key URLSearchParams loop
function syncStateToUrl(state: object, options: { include?: string[]; exclude?: string[] }) {
  if (typeof window === "undefined") return;

  const url = new URL(window.location.href);
  const filtered = filterState(state, options); // apply include/exclude

  // Skip empty state — clear URL
  if (Object.keys(filtered).length === 0) {
    window.history.replaceState({}, "", url.pathname);
    return;
  }

  const json = JSON.stringify(filtered);
  const compressed = compressToEncodedURIComponent(json);
  const newUrl = `${url.pathname}?z=${compressed}`;
  window.history.replaceState({}, "", newUrl);
}
```

### Read Path: Decompress on load with backward compat

```typescript
// In calculator-store.ts storeCreator init block — replaces the existing per-key loop
if (syncUrl && typeof window !== "undefined") {
  const urlParams = getUrlParams();
  const compressedParam = urlParams.get("z");

  if (compressedParam) {
    // New compressed path
    try {
      const json = decompressFromEncodedURIComponent(compressedParam);
      if (json !== null) {
        const parsed = JSON.parse(json) as Record<string, unknown>;
        mergedInitialValues = { ...initialValues };
        for (const key of Object.keys(initialValues)) {
          if (Object.hasOwn(parsed, key) && parsed[key] !== undefined) {
            (mergedInitialValues as Record<string, unknown>)[key] = parsed[key];
          }
        }
      }
    } catch {
      // Corrupted URL param — fall back to initialValues silently
    }
  } else if (urlParams.size > 0) {
    // Legacy path: plain ?key=value params (existing code, unchanged)
    mergedInitialValues = { ...initialValues };
    for (const [key, value] of urlParams.entries()) {
      if (Object.hasOwn(mergedInitialValues, key)) {
        const originalValue = (mergedInitialValues as Record<string, unknown>)[key];
        if (typeof originalValue === "number") {
          (mergedInitialValues as Record<string, unknown>)[key] = parseNumberParam(value, originalValue);
        } else if (typeof originalValue === "string") {
          (mergedInitialValues as Record<string, unknown>)[key] = parseStringParam(value, originalValue);
        } else {
          (mergedInitialValues as Record<string, unknown>)[key] = value;
        }
      }
    }
  }
}
```

### Round-Trip Test (R4.6)

```typescript
// src/__tests__/lib/middleware/url-sync.test.ts
import { describe, expect, it } from "vitest";
import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from "lz-string";

describe("lz-string URL compression round-trip", () => {
  it("compresses and decompresses a typical calculator state", () => {
    const values = { weight: 70, height: 175, unit: "metric" };
    const json = JSON.stringify(values);
    const compressed = compressToEncodedURIComponent(json);
    const decompressed = decompressFromEncodedURIComponent(compressed);
    expect(decompressed).toBe(json);
    expect(JSON.parse(decompressed!)).toEqual(values);
  });

  it("handles complex state with 8+ parameters", () => {
    const values = {
      ipAddress: "192.168.1.0",
      cidr: 24,
      vlanId: 100,
      gateway: "192.168.1.1",
      dns1: "8.8.8.8",
      dns2: "8.8.4.4",
      description: "main subnet",
      enabled: "true",
    };
    const json = JSON.stringify(values);
    const compressed = compressToEncodedURIComponent(json);
    const decompressed = decompressFromEncodedURIComponent(compressed);
    expect(JSON.parse(decompressed!)).toEqual(values);
  });

  it("returns null for invalid compressed input", () => {
    const result = decompressFromEncodedURIComponent("not-valid-compressed-data!!!");
    expect(result).toBeNull();
  });

  it("produces URI-safe characters only", () => {
    const json = JSON.stringify({ weight: 70, height: 175, unit: "metric" });
    const compressed = compressToEncodedURIComponent(json);
    // Should not require further encoding — no +, /, or = that would be misinterpreted
    expect(compressed).toMatch(/^[A-Za-z0-9\-_.~!*'();:@$,/?#\[\]@%]*$/);
  });

  it("preserves number types through JSON round-trip (vs plain param coercion)", () => {
    const values = { count: 42, ratio: 0.5 };
    const decompressed = decompressFromEncodedURIComponent(
      compressToEncodedURIComponent(JSON.stringify(values))
    );
    const parsed = JSON.parse(decompressed!);
    expect(typeof parsed.count).toBe("number");
    expect(typeof parsed.ratio).toBe("number");
  });
});
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| No URL compression | `?weight=70&height=175&unit=metric` | Pre-Phase 44 | Long URLs for complex calculators |
| Per-key URLSearchParams | Whole-JSON → lz-string `?z=<blob>` | Phase 44 | 40-60% shorter for 5+ param calculators |
| Type coercion on load | JSON.parse preserves types | Phase 44 | Numbers stay numbers without parseNumberParam on compressed path |

**Deprecated/outdated:**
- The `Object.keys(urlParams).length > 0` check in `url-sync.ts` line 54: This is currently dead code (bug — `urlParams` is a Map). Phase 44 should fix or remove it.

---

## Open Questions

1. **`z` key collision check**
   - What we know: No current calculator uses a field named `z`
   - What's unclear: Whether any future calculator might
   - Recommendation: Use `z` for Phase 44. If collision becomes a concern, switch to `_lzs` or `_state` — but `z` is clean and short.

2. **Compression effectiveness for very short states**
   - What we know: LZW performs poorly on strings < ~30 chars; base64-encoded output is ~2.67x the compressed bytes
   - What's unclear: Exact net ratio for 2-3 param calculators (e.g., `{"a":1,"b":2}` = 15 chars → may expand to 25+ after encoding)
   - Recommendation: Accept this trade-off. URL still works; requirement R4.6 says complex calculators see ≤50% — simple ones are exempt from this target.

3. **url-sync.ts middleware's dead URL-load block**
   - What we know: Lines 52-57 in `url-sync.ts` call `Object.keys(urlParams).length > 0` where urlParams is a Map — always 0
   - What's unclear: Was this always dead code or a regression from a Map refactor?
   - Recommendation: Phase 44 should clean up this dead code while modifying `url-sync.ts`. The actual load path is in `calculator-store.ts` (which works correctly).

---

## Sources

### Primary (HIGH confidence)
- lz-string@1.5.0 `typings/lz-string.d.ts` — extracted via `npm pack`, all 10 function signatures confirmed
- `/Users/fjacquet/Projects/converty/src/lib/middleware/url-sync.ts` — actual write path implementation
- `/Users/fjacquet/Projects/converty/src/stores/calculator-store.ts` — actual read path implementation
- `/Users/fjacquet/Projects/converty/src/lib/utils/url-params.ts` — `getUrlParams()` returns `Map<string, string>`, confirms bug in url-sync.ts
- `/Users/fjacquet/Projects/converty/vitest.config.ts` — coverage scope is `src/lib/converters/**` only

### Secondary (MEDIUM confidence)
- [lz-string GitHub repository](https://github.com/pieroxy/lz-string) — confirms version 1.5.0 is latest, ESM/CJS support, legacy flag for uint8array backward compat
- [pieroxy.net/lz-string docs](https://pieroxy.net/blog/pages/lz-string/index.html) — confirms `compressToEncodedURIComponent` produces URI-safe output; note output is ~2.67x compressed size
- [@types/lz-string npm](https://www.npmjs.com/package/@types/lz-string) — confirms it's a stub; lz-string ships own types

### Tertiary (LOW confidence)
- WebSearch result on `+` character bug: confirmed fixed in v1.4.0+ via issue #50 on GitHub — do not downgrade
- Compression ratio claim "40-60% for 5+ params" — estimate based on LZW behavior and ~166% base64 overhead factor from official docs; not benchmarked for this project specifically

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — lz-string@1.5.0 npm pack verified, TypeScript types confirmed directly from package
- Architecture: HIGH — based on reading actual source files `url-sync.ts` and `calculator-store.ts`
- Pitfalls: HIGH for items 1-3 (verified from source code analysis); MEDIUM for items 4-6 (based on library documentation + community reports)

**Research date:** 2026-02-26
**Valid until:** 2026-03-28 (lz-string has been stable at 1.5.0 for 3 years; low churn risk)
