# ADR-016: npm Override Strategy for Transitive Dependency CVEs

**Status:** Accepted
**Date:** 2026-04-04
**Proposed by:** v7.1 Security Hardening

---

## Context

Static sites deployed to GitHub Pages have no server-side dependencies, but the build
toolchain (Vite, Rollup, Workbox, Biome, Vitest) pulls in a deep transitive dependency
tree. Vulnerabilities in transitive deps — packages never imported directly by application
code — nonetheless appear in `npm audit` reports and trigger the `security.yml` CI workflow.

The standard remediation, `npm audit fix`, resolves most issues but occasionally proposes
a **breaking downgrade** (e.g. `workbox-build@7.4.0 → 7.0.0`) to escape a vulnerable
sub-tree, even when a non-breaking fix exists at a deeper level.

### v7.1 Audit Summary (2026-04-04)

9 vulnerabilities were found across the dependency tree:

| Package | Severity | CVE / Advisory |
|---------|----------|----------------|
| `brace-expansion` | Moderate | GHSA-f886-m6hf-6m8v — zero-step sequence DoS |
| `flatted` | High | GHSA-25h7-pfq9-p65f — unbounded recursion DoS |
| `flatted` | High | GHSA-rf6f-7fwh-wjgh — prototype pollution |
| `lodash` | High | GHSA-r5fr-rjxr-66jc — code injection via `_.template` |
| `lodash` | High | GHSA-f23m-r3pf-42rh — prototype pollution |
| `minimatch` | High | GHSA-7r86-cg39-jmmj — ReDoS combinatorial backtracking |
| `minimatch` | High | GHSA-23c5-xmqv-rm74 — nested extglob ReDoS |
| `picomatch` | High | GHSA-3v7f-55p6-f55p — POSIX character class method injection |
| `picomatch` | High | GHSA-c2c7-rcm5-vvqj — extglob quantifier ReDoS |
| `yaml` | Moderate | GHSA-48c2-rrv3-qjmp — stack overflow via deeply nested collections |
| `serialize-javascript` | High | GHSA-5c6j-r48x-rmvq — RCE via RegExp.flags |
| `serialize-javascript` | High | GHSA-qj8w-gfj5-8c6v — CPU exhaustion DoS |

---

## Decision

Use a two-layer remediation strategy:

### Layer 1 — `npm audit fix` (non-breaking)

Run `npm audit fix` to resolve all vulnerabilities that have safe, semver-compatible
fixes. This updated 10 packages and closed 6 of 9 vulnerability entries.

### Layer 2 — npm `overrides` (targeted pinning)

For the remaining chain (`serialize-javascript` → `@rollup/plugin-terser` →
`workbox-build`), `npm audit fix --force` would downgrade `workbox-build` from 7.4.0 to
7.0.0 — a breaking change with unknown regressions in the PWA service worker generation.

Instead, pin the vulnerable packages at their fixed versions via `package.json` overrides:

```json
"overrides": {
  "serialize-javascript": "^7.0.5",
  "@rollup/plugin-terser": "^1.0.0",
  "minimatch": "^10.2.1",
  "rollup@2": "^2.80.0"
}
```

This forces npm to resolve the pinned versions throughout the entire dependency tree,
closing the CVEs without touching `workbox-build`'s public API.

**Result:** `npm audit` reports **0 vulnerabilities** across all 917 packages.

---

## Consequences

### Positive

- Zero audit findings without downgrading build tools
- `workbox-build@7.4.0` retained — no regression risk to PWA/service-worker generation
- Override strategy is explicit and auditable in `package.json`
- Pattern is reusable for future transitive CVEs

### Negative

- Overrides can mask incompatibilities if the pinned version introduces a breaking
  change in the overridden package's own API (low risk for patch/minor bumps)
- Overrides must be revisited when direct dependencies release new majors that bundle
  their own fixed transitive versions (otherwise the override becomes unnecessary noise)

### Maintenance Rule

Review and remove overrides after each major upgrade of the package that pulls in the
vulnerable transitive dep. Run `npm audit` after removing an override — if clean, the
override is no longer needed.

---

## Alternatives Considered

| Alternative | Reason Rejected |
|-------------|-----------------|
| `npm audit fix --force` (downgrade `workbox-build`) | Breaking change; unknown PWA regression risk |
| Accept vulnerabilities (mark as tolerated) | Fails `security.yml` CI gate; unacceptable for build-only deps |
| Replace `workbox-build` with a different PWA generator | Over-engineered; the vulnerability is in a build-time tool, not runtime code |

---

## Update — 2026-06-19 (v7.2 Security Remediation)

A subsequent audit reported **14 vulnerabilities** (6 high, 5 moderate, 3 low) across the
dependency tree, surfaced via Dependabot + Trivy alerts.

### Layer 1 — `npm audit fix`

Closed 12 of 14 with non-breaking, semver-compatible bumps:

| Package | Before → After | Class |
|---------|----------------|-------|
| `next` | 16.2.2 → 16.2.9 | SSRF/middleware-bypass/DoS (not exploitable under static export — no server runs), client XSS (beforeInteractive, CSP nonce) |
| `next-intl` | 4.9.0 → 4.13.0 | Open redirect, prototype pollution |
| `dompurify` | 3.3.3 → 3.4.11 | 12 XSS / prototype-pollution advisories (via `jspdf`, `isomorphic-dompurify`) |
| `vite`, `esbuild`, `@babel/*`, `ws`, `fast-uri`, `undici`, `js-yaml`, `icu-minify`, `brace-expansion` | various | Build-time / dev-server only — not in the deployed artifact |

### Layer 2 — `postcss` override

The remaining 2 entries were a single root cause: `next` bundles a nested
`postcss@8.4.31`, and `npm audit fix --force` would downgrade **next 16 → 9.3.3**
(catastrophic breaking change). Instead, the direct dev dependency `postcss` was raised to
`^8.5.15` and an override added to force the nested copy to dedupe to it:

```json
"overrides": {
  "postcss": "$postcss"
}
```

`$postcss` references the direct dependency's resolved version (8.5.15), so all copies
dedupe to one patched tree. A literal `"^8.5.15"` was rejected by npm (`EOVERRIDE`) because
`postcss` is also a direct dependency — overrides on direct deps must reference them with
`$name`.

**Result:** `npm audit` reports **0 vulnerabilities**; `next build` static export and
`tsc --noEmit` both pass. The `postcss` override becomes unnecessary noise once `next`
ships a release bundling `postcss ≥ 8.5.10` — revisit per the Maintenance Rule above.
