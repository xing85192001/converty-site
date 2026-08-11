# Phase 8: Developer Experience - Research

**Researched:** 2026-01-18
**Domain:** Developer experience improvements, pre-commit automation, code quality tooling, container security
**Confidence:** HIGH

## Summary

Phase 8 focuses on improving developer workflow through DRY improvements, automated quality gates, and addressing container security findings from Phase 7. Research reveals several important findings:

**Container Security Findings**: The Trivy scan findings (AVD-DS-0002, AVD-DS-0017) are **FALSE POSITIVES**. The Dockerfile exists in `node_modules/@surma/rollup-plugin-off-main-thread`, a transitive dev dependency used by workbox-build for browser testing. This Dockerfile is never executed in development or production. The project is a static site (`output: "export"`) with zero Docker usage and zero production vulnerabilities per `npm audit --production`. Resolution: Create `.trivyignore` file to document this false positive.

**URL Parameter Consolidation**: The `getUrlParams()` function is duplicated in two files (calculator-store.ts and url-sync.ts), each 6 lines identical. This is a minor DRY violation that can be consolidated by extracting the function to `src/lib/utils/url-params.ts` and importing it in both locations. Risk: LOW, effort: 15 minutes.

**Pre-commit Hooks**: Husky (v9.1.7) and lint-staged (v16.2.7) are the standard solution for automated pre-commit quality checks. Modern setup uses `npx husky init` and configures lint-staged to run Biome checks on staged files only. This prevents broken code from entering the repository and reduces CI failures.

**Biome-only Migration**: MAJOR DISCOVERY - Next.js 16 has **REMOVED** the `next lint` command entirely. ESLint is no longer required by the framework. The project is on Next.js 16.1.1, making Biome-only migration technically feasible. However, the current dual-linter setup (ESLint + Biome) provides valuable React-specific rules (hooks/rules-of-hooks, hooks/exhaustive-deps) that Biome doesn't fully replace yet. Recommendation: Keep both linters for now, but document that Biome-only is an option for future simplification.

**Primary recommendation:**

1. Create `.trivyignore` to address false positive container findings
2. Extract `getUrlParams()` to shared module for DRY improvement
3. Install Husky + lint-staged for automated pre-commit quality checks
4. Keep dual-linter setup (ESLint + Biome) for React-specific rules, defer Biome-only migration to future phase

## Standard Stack

The established tools for developer experience automation in Next.js/React/TypeScript projects:

### Core

| Tool        | Version | Purpose                     | Why Standard                                                 |
| ----------- | ------- | --------------------------- | ------------------------------------------------------------ |
| Husky       | 9.1.7   | Git hooks management        | 45M+ downloads/month, industry standard, simple setup        |
| lint-staged | 16.2.7  | Run linters on staged files | Performance optimization, only checks what you're committing |
| Trivy       | Latest  | Container security scanning | CNCF project, comprehensive vulnerability database           |
| Biome       | 2.3.11  | Fast linting and formatting | 10-25x faster than ESLint+Prettier, single tool              |

### Supporting

| Tool       | Version  | Purpose                      | When to Use                                     |
| ---------- | -------- | ---------------------------- | ----------------------------------------------- |
| ESLint     | 9.39.2   | React/Next.js specific rules | React hooks rules, framework-specific patterns  |
| TypeScript | 5.9.3    | Type checking                | Pre-commit type validation                      |
| npm audit  | Built-in | Security scanning            | Complements container scanning for npm packages |

### Alternatives Considered

| Instead of          | Could Use      | Tradeoff                                                    |
| ------------------- | -------------- | ----------------------------------------------------------- |
| Husky + lint-staged | Git hooks only | Manual setup, no cross-platform support, harder to maintain |
| ESLint + Biome      | Biome only     | Simpler tooling, but lose React hooks rules (see below)     |
| .trivyignore        | Scanner config | .trivyignore is simpler, portable, version-controlled       |
| Pre-commit checks   | CI/CD only     | Later feedback loop, more broken commits, slower iteration  |

**Installation:**

```bash
# Pre-commit hooks
npm install --save-dev husky lint-staged

# Initialize Husky (creates .husky/ directory and prepare script)
npx husky init

# Trivy (if not already installed)
# macOS: brew install trivy
# Linux: apt-get install trivy
# CI/CD: Use aquasecurity/trivy-action
```

## Architecture Patterns

### Recommended Project Structure

```
.planning/phases/08-developer-experience/
├── 08-RESEARCH.md           # This file
├── 08-01-PLAN.md            # Container security + URL consolidation
├── 08-02-PLAN.md            # Pre-commit hooks setup
└── 08-VERIFICATION.md       # Results verification

# New files created by this phase:
.trivyignore                 # Container security false positive exclusions
.husky/                      # Git hooks directory (created by husky init)
  └── pre-commit            # Pre-commit hook script
.lintstagedrc.json          # lint-staged configuration
```

### Pattern 1: Modern Husky Setup (v9.x)

**What:** Git hooks management with modern API
**When to use:** All projects needing automated quality checks before commits

**Current Husky v9 setup (2026 standard):**

```bash
# 1. Install Husky
npm install --save-dev husky

# 2. Initialize (creates .husky/ directory and adds prepare script)
npx husky init

# 3. Edit .husky/pre-commit
echo "npx lint-staged" > .husky/pre-commit
```

**package.json scripts added automatically:**

```json
{
  "scripts": {
    "prepare": "husky"
  }
}
```

**Why this pattern:**

- v9.x simplified API (no more `husky install`)
- `prepare` script runs automatically on `npm install`
- Cross-platform compatible (Windows, macOS, Linux)
- Git hooks directory is version-controlled (.husky/)

**Migration from older Husky versions:**

- v8.x and older used `husky install` (deprecated)
- v9.x uses `husky init` (current)
- No `.huskyrc` file needed (configuration via scripts)

### Pattern 2: lint-staged Configuration

**What:** Run linters/formatters only on staged files
**When to use:** Pre-commit hooks, large codebases where checking all files is slow

**Recommended configuration (.lintstagedrc.json):**

```json
{
  "*.{ts,tsx}": [
    "biome check --write --files-ignore-unknown=true --no-errors-on-unmatched"
  ],
  "*.{js,mjs,cjs}": [
    "biome check --write --files-ignore-unknown=true --no-errors-on-unmatched"
  ]
}
```

**Alternative: package.json configuration:**

```json
{
  "lint-staged": {
    "*.{ts,tsx,js,mjs,cjs}": [
      "biome check --write --files-ignore-unknown=true --no-errors-on-unmatched"
    ]
  }
}
```

**Why this pattern:**

- `--write`: Auto-fix issues (format + lint)
- `--files-ignore-unknown=true`: Don't error on non-TypeScript/JavaScript files
- `--no-errors-on-unmatched`: Don't fail if no files match (e.g., commit only adds images)
- Biome handles both linting and formatting in one command (faster than ESLint + Prettier)

**Performance:**

- lint-staged only checks files you're committing
- Example: Committing 3 files checks 3 files, not all 560 project files
- Typical pre-commit time: 1-3 seconds (vs 10-30 seconds for full codebase check)

### Pattern 3: .trivyignore for False Positives

**What:** Exclude known false positive findings from Trivy security scans
**When to use:** When scanner reports findings in code you don't execute (test fixtures, dev dependencies, third-party Dockerfiles)

**File format (.trivyignore in project root):**

```
# Container security false positives
# Static site - no Docker usage in production

# @surma/rollup-plugin-off-main-thread (dev dependency, workbox-build)
# Dockerfile is part of package's test infrastructure (Selenium browser testing)
# Never executed in development or production
# npm audit --production: 0 vulnerabilities
AVD-DS-0002
AVD-DS-0017
```

**Why this pattern:**

- Simple line-based format (one finding ID per line)
- Comments with `#` explain rationale (important for auditing)
- Version-controlled (team sees why findings are ignored)
- Alternative to complex scanner configuration flags

**When to use .trivyignore vs fixing:**

- **Use .trivyignore**: False positives, third-party code not executed, dev-only code
- **Fix the issue**: Production code, containers actually used, exploitable vulnerabilities

**Expiration dates (optional):**

```
# Re-evaluate this exclusion in 6 months
AVD-DS-0002 exp:2026-07-18
```

### Pattern 4: URL Parameter Utility Consolidation

**What:** Extract duplicated `getUrlParams()` function to shared module
**When to use:** When the same utility function appears in multiple files

**Current state (DUPLICATED):**

```typescript
// src/stores/calculator-store.ts (lines 48-59)
function getUrlParams(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const params: Record<string, string> = {};
  const searchParams = new URLSearchParams(window.location.search);
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return params;
}

// src/lib/middleware/url-sync.ts (lines 93-104) - IDENTICAL
function getUrlParams(): Record<string, string> {
  // ... exact same implementation
}
```

**Target state (CONSOLIDATED):**

```typescript
// src/lib/utils/url-params.ts (add to existing file)

/**
 * Extract all URL parameters as a key-value record
 *
 * @returns Object with parameter names as keys and values as strings
 * @example
 * // URL: ?amount=100&currency=USD
 * const params = getUrlParams();
 * // Returns: { amount: "100", currency: "USD" }
 */
export function getUrlParams(): Record<string, string> {
  if (typeof window === "undefined") return {};

  const params: Record<string, string> = {};
  const searchParams = new URLSearchParams(window.location.search);

  searchParams.forEach((value, key) => {
    params[key] = value;
  });

  return params;
}

// Usage in calculator-store.ts and url-sync.ts
import { getUrlParams } from "@/lib/utils/url-params";
```

**Why consolidate:**

- DRY principle: Single source of truth for URL parameter extraction
- Maintainability: Bug fixes or improvements only need to be made once
- Consistency: Both callers get identical behavior
- Low risk: Simple, well-tested function with no side effects

### Pattern 5: Biome-only vs Dual Linter Strategy

**What:** Decision between Biome-only or ESLint+Biome dual setup
**When to use:** When evaluating tooling simplification vs rule coverage

**Current state: Dual linters (ESLint + Biome)**

```json
// package.json
{
  "scripts": {
    "lint": "eslint .", // ESLint: React/Next.js rules
    "lint:biome": "biome lint .", // Biome: Performance/security
    "quality": "npm run lint && npm run lint:biome && npm run type-check"
  }
}
```

**ESLint provides (that Biome doesn't fully replace):**

- `react-hooks/rules-of-hooks` - Enforces hooks can only be called at top level
- `react-hooks/exhaustive-deps` - Catches missing dependencies in useEffect
- `@next/next/no-html-link-for-pages` - Next.js specific routing rules
- `@next/next/no-img-element` - Enforce next/image usage

**Biome provides (that ESLint doesn't):**

- 10-25x faster performance
- Integrated formatter (replaces Prettier)
- Better IDE integration (single tool)
- Simpler configuration (one biome.json vs eslint.config.mjs + .prettierrc)

**Next.js 16 context (IMPORTANT):**

Next.js 16 **REMOVED** `next lint` command entirely. ESLint is no longer required by the framework. From the [Next.js 16 release notes](https://nextjs.org/blog/next-16):

> "The `next lint` command has been removed. Developers should use their preferred linting tools directly."

**Recommendation for this project:**

**Keep dual setup (ESLint + Biome) because:**

1. React hooks rules are critical for correctness (prevent bugs)
2. Next.js specific rules catch framework-specific issues
3. Both linters passing is current quality gate (Phase 7)
4. Migration effort vs benefit doesn't justify right now

**Document for future (Phase 8+):**

- Biome-only is now technically possible (Next.js 16 doesn't require ESLint)
- If React hooks rules become less critical (team expertise grows), could migrate
- Biome is rapidly adding ESLint compatibility (currently 80%+ rule coverage)
- Monitor Biome's React plugin maturity

**If migrating to Biome-only in future:**

```bash
# 1. Remove ESLint dependencies
npm uninstall eslint @eslint/js typescript-eslint eslint-plugin-react eslint-plugin-react-hooks @next/eslint-plugin-next eslint-config-next globals

# 2. Update scripts
# package.json
{
  "scripts": {
    "lint": "biome check",
    "format": "biome format --write"
  }
}

# 3. Delete eslint.config.mjs

# 4. Enable Biome's React rules (when available)
# biome.json - add React-specific rules as they mature
```

### Anti-Patterns to Avoid

- **Don't commit .husky/\_/ directory**: Only commit hook scripts (.husky/pre-commit), not internal Husky files
- **Don't make pre-commit hooks too slow**: Keep under 5 seconds or developers will bypass with `--no-verify`
- **Don't ignore all Trivy findings**: Document each exclusion with reasoning
- **Don't consolidate every duplication**: 6-line utility is worth consolidating, 2-line helper might not be
- **Don't remove ESLint without checking React rules**: Hooks rules prevent real bugs

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem                   | Don't Build        | Use Instead       | Why                                                      |
| ------------------------- | ------------------ | ----------------- | -------------------------------------------------------- |
| Git hooks                 | Manual .git/hooks/ | Husky             | Cross-platform, version-controlled, team consistency     |
| Staged file detection     | git diff-index     | lint-staged       | Handles edge cases, performance optimization, proven     |
| Container scanning        | Custom CVE checks  | Trivy             | Comprehensive database, active maintenance, CNCF project |
| False positive exclusions | Scanner flags      | .trivyignore      | Portable, documented, version-controlled                 |
| Commit message linting    | Custom regex       | commitlint        | Standard formats, semantic versioning integration        |
| Pre-commit type checking  | Custom tsc wrapper | lint-staged + tsc | Incremental builds, error handling, parallel execution   |

**Key insight:** Developer tooling is commoditized. Use battle-tested tools rather than custom scripts. The value is in the discipline of running the tools, not in building them.

## Common Pitfalls

### Pitfall 1: Pre-commit Hooks Too Slow

**What goes wrong:** Developers bypass hooks with `git commit --no-verify` because checks take 30+ seconds
**Why it happens:** Running linters on entire codebase instead of just staged files
**How to avoid:**

- Use lint-staged to check only staged files
- Don't run full test suite in pre-commit (save for CI)
- Keep pre-commit under 5 seconds target
- Use Biome instead of ESLint+Prettier for speed (10-25x faster)
  **Warning signs:** Team members frequently using `--no-verify`, complaints about slow commits

**Performance comparison:**

```bash
# BAD: Check entire codebase (30 seconds)
biome check .

# GOOD: Check only staged files (2 seconds)
npx lint-staged
# (lint-staged runs biome check on only the 3 files being committed)
```

### Pitfall 2: Husky Not Installing for Team Members

**What goes wrong:** New team member clones repo, Husky hooks don't work
**Why it happens:** `prepare` script not running, `.husky/` directory in .gitignore, npm install skipped
**How to avoid:**

- Ensure `prepare` script exists in package.json (added by `husky init`)
- Commit `.husky/` directory to git (not in .gitignore)
- Document in CONTRIBUTING.md: "Run `npm install` to set up Git hooks"
- Verify hooks work: `ls -la .git/hooks/pre-commit` should be a symlink to `.husky/pre-commit`
  **Warning signs:** "Hooks work for me but not for others", broken commits from certain team members

**Verification steps:**

```bash
# 1. Check prepare script exists
grep "prepare" package.json
# Should output: "prepare": "husky"

# 2. Check .husky/ is committed
git ls-files .husky/
# Should list: .husky/pre-commit (and other hooks)

# 3. Test hook runs
git commit --allow-empty -m "test"
# Should see lint-staged output
```

### Pitfall 3: .trivyignore Too Broad

**What goes wrong:** Ignoring entire vulnerability categories (e.g., all HIGH severity) instead of specific findings
**Why it happens:** Alert fatigue from false positives, taking shortcuts
**How to avoid:**

- Ignore specific finding IDs (AVD-DS-0002), not patterns (AVD-DS-\*)
- Document each exclusion with comment explaining why
- Set expiration dates for findings that should be revisited
- Review .trivyignore quarterly to remove stale exclusions
  **Warning signs:** .trivyignore has wildcard patterns, no comments, hundreds of exclusions

**BAD .trivyignore (too broad):**

```
# Don't do this
AVD-DS-*
CVE-2024-*
```

**GOOD .trivyignore (specific):**

```
# @surma/rollup-plugin-off-main-thread Dockerfile (dev dependency)
# Static site - no Docker usage, Dockerfile never executed
# Re-evaluate when dependency updated
AVD-DS-0002 exp:2026-07-18
AVD-DS-0017 exp:2026-07-18
```

### Pitfall 4: Consolidating URLs Breaking Existing Code

**What goes wrong:** Extracting `getUrlParams()` changes behavior due to subtle differences in implementations
**Why it happens:** Implementations looked identical but had different edge case handling
**How to avoid:**

- Compare implementations line-by-line before consolidating
- Add type annotations to catch signature mismatches
- Test both call sites after consolidation
- Use TypeScript to catch breaking changes
- Git grep for all usages to ensure complete migration
  **Warning signs:** Type errors after consolidation, different behavior in different calculators

**Safety checklist:**

```bash
# 1. Confirm implementations are identical
diff <(sed -n '48,59p' src/stores/calculator-store.ts) \
     <(sed -n '93,104p' src/lib/middleware/url-sync.ts)
# Should show no differences (except function declaration line)

# 2. Find all usages
grep -r "getUrlParams" src/
# Should only find the two files we're consolidating

# 3. After consolidation, verify imports
grep -r "from.*url-params" src/
# Should find two import statements
```

### Pitfall 5: Losing React Hooks Rules by Removing ESLint

**What goes wrong:** Migrating to Biome-only, losing critical React hooks linting, introducing bugs
**Why it happens:** Biome doesn't fully support React hooks rules yet (as of 2026)
**How to avoid:**

- Keep ESLint for React-specific rules (hooks/rules-of-hooks, hooks/exhaustive-deps)
- Don't remove ESLint just for tooling simplification
- Monitor Biome's React plugin maturity before migrating
- Document in ADR why dual linters are kept
  **Warning signs:** Hooks called conditionally, missing useEffect dependencies, runtime errors

**Critical ESLint rules that Biome doesn't replace (2026):**

```javascript
// eslint.config.mjs
rules: {
  "react-hooks/rules-of-hooks": "error",       // CRITICAL: Prevents hook bugs
  "react-hooks/exhaustive-deps": "warn",       // CRITICAL: Catches missing deps
  "@next/next/no-html-link-for-pages": "error",// Next.js routing correctness
  "@next/next/no-img-element": "warn",         // Next.js image optimization
}
```

**Example bug prevented by hooks/rules-of-hooks:**

```typescript
// BAD: Would pass Biome, fail ESLint, cause runtime bug
function Calculator({ condition }: Props) {
  if (condition) {
    const [value, setValue] = useState(0); // ERROR: Conditional hook call
  }
  // ... rest of component
}

// ESLint error: React Hook "useState" is called conditionally.
// React Hooks must be called in the exact same order in every component render.
```

### Pitfall 6: Committing Husky Internal Files

**What goes wrong:** Committing `.husky/_/` directory causes conflicts, breaks for others
**Why it happens:** Not understanding which Husky files should be version-controlled
**How to avoid:**

- Only commit hook scripts (.husky/pre-commit, .husky/pre-push)
- Don't commit `.husky/_/` directory (Husky's internal files)
- Add `.husky/_` to .gitignore
- Modern Husky v9 handles this better than older versions
  **Warning signs:** Git conflicts in .husky/\_/, hooks not working for team members

**Correct .gitignore:**

```
# .gitignore
.husky/_
```

**What to commit:**

```bash
# DO commit:
.husky/pre-commit
.husky/pre-push
# (your hook scripts)

# DON'T commit:
.husky/_/
.husky/.gitignore
# (Husky's internal files)
```

## Code Examples

Verified patterns from official sources and current tooling:

### Modern Husky v9 Setup

```bash
# Installation and initialization
npm install --save-dev husky
npx husky init

# This creates:
# - .husky/pre-commit file
# - package.json "prepare": "husky" script
```

**Source:** [Husky v9 Documentation](https://typicode.github.io/husky/) (verified 2026-01-18)

**package.json after init:**

```json
{
  "scripts": {
    "prepare": "husky"
  },
  "devDependencies": {
    "husky": "^9.1.7"
  }
}
```

### lint-staged Configuration (Biome)

**.lintstagedrc.json (recommended):**

```json
{
  "*.{ts,tsx,js,mjs,cjs}": [
    "biome check --write --files-ignore-unknown=true --no-errors-on-unmatched"
  ]
}
```

**Alternative: package.json:**

```json
{
  "lint-staged": {
    "*.{ts,tsx,js,mjs,cjs}": [
      "biome check --write --files-ignore-unknown=true --no-errors-on-unmatched"
    ]
  }
}
```

**Source:** [lint-staged GitHub](https://github.com/lint-staged/lint-staged) + [Biome + Next.js Guide](https://dev.to/imkarmakar/how-to-set-up-husky-biome-in-a-nextjs-project-2026-guide-9jh) (verified 2026-01-18)

**Why these flags:**

- `--write`: Auto-fix and format files
- `--files-ignore-unknown=true`: Don't error on non-JS/TS files
- `--no-errors-on-unmatched`: Don't fail if pattern matches nothing (e.g., only committing images)

### .husky/pre-commit Hook

```bash
#!/bin/sh
npx lint-staged
```

**Source:** [Husky + Biome Setup Guide 2026](https://dev.to/imkarmakar/how-to-set-up-husky-biome-in-a-nextjs-project-2026-guide-9jh) (verified 2026-01-18)

**Alternative with type checking:**

```bash
#!/bin/sh
npx lint-staged && npm run type-check
```

**Performance consideration:** Type checking entire codebase adds 5-10 seconds to commits. Consider running only in CI or pre-push instead.

### .trivyignore for False Positives

```
# Container security false positives
# Context: Static site (output: "export"), no Docker usage in production
# Verified: npm audit --production shows 0 vulnerabilities

# @surma/rollup-plugin-off-main-thread (transitive dev dependency from workbox-build)
# Issue: Dockerfile exists in package for browser testing with Selenium
# Impact: NONE - Dockerfile never executed in development or production
# Alternative: Configure Trivy to skip node_modules, but .trivyignore is more explicit
# Review: Re-evaluate when workbox-build is updated
AVD-DS-0002 exp:2026-07-18
AVD-DS-0017 exp:2026-07-18
```

**Source:** [Trivy Filtering Documentation](https://trivy.dev/docs/latest/configuration/filtering/) (verified 2026-01-18)

**Format:**

- One finding ID per line
- Comments with `#` (highly recommended for audit trail)
- Optional expiration dates: `ID exp:YYYY-MM-DD`
- Place in project root directory

### Consolidated URL Parameter Utility

**src/lib/utils/url-params.ts (add to existing file):**

```typescript
/**
 * Extract all URL parameters as a key-value record
 *
 * Server-side safe: Returns empty object when window is undefined
 *
 * @returns Object with parameter names as keys and values as strings
 *
 * @example
 * // URL: ?amount=100&currency=USD&enabled=true
 * const params = getUrlParams();
 * // Returns: { amount: "100", currency: "USD", enabled: "true" }
 *
 * // Use with type-safe parsing helpers:
 * const amount = parseNumberParam(params.amount, 0);
 * const currency = parseStringParam(params.currency, "USD");
 * const enabled = parseBooleanParam(params.enabled, false);
 */
export function getUrlParams(): Record<string, string> {
  // Server-side rendering safety
  if (typeof window === "undefined") return {};

  const params: Record<string, string> = {};
  const searchParams = new URLSearchParams(window.location.search);

  // Convert URLSearchParams to plain object
  searchParams.forEach((value, key) => {
    params[key] = value;
  });

  return params;
}
```

**Usage in calculator-store.ts:**

```typescript
import { getUrlParams } from "@/lib/utils/url-params";

// Inside createCalculatorStore function:
const urlParams = getUrlParams();
// ... use urlParams
```

**Usage in url-sync.ts:**

```typescript
import { getUrlParams } from "@/lib/utils/url-params";

// Inside middleware function:
const urlParams = getUrlParams();
// ... use urlParams
```

**Source:** Extracted from current codebase (src/stores/calculator-store.ts lines 48-59, src/lib/middleware/url-sync.ts lines 93-104) (verified 2026-01-18)

## State of the Art

| Old Approach                | Current Approach          | When Changed      | Impact                                         |
| --------------------------- | ------------------------- | ----------------- | ---------------------------------------------- |
| Husky v4-v8 (husky install) | Husky v9 (husky init)     | 2024-2025         | Simpler API, better cross-platform support     |
| Manual .git/hooks/          | Husky + lint-staged       | Industry standard | Version-controlled, consistent, team-wide      |
| Next.js requires ESLint     | ESLint optional (v15.5+)  | Next.js 15.5/16   | Biome-only now possible, framework agnostic    |
| next lint command           | Direct linter usage       | Next.js 16        | Developers choose tools, no framework lock-in  |
| ESLint + Prettier           | Biome (unified)           | 2024-2026         | 10-25x faster, single tool, simpler config     |
| Scanner CLI flags           | .trivyignore file         | Best practice     | Documented, portable, version-controlled       |
| Check all files pre-commit  | lint-staged (staged only) | Performance opt   | 2-5 seconds vs 30+ seconds for large codebases |

**Deprecated/outdated:**

- **Husky v4-v8 API**: `husky install` replaced by `husky init` in v9
- **next lint command**: Removed in Next.js 16, use linters directly
- **Assuming ESLint required**: Next.js 16 supports any linter or none
- **Manual .git/hooks/**: Not version-controlled, use Husky instead
- **Pre-commit on all files**: Use lint-staged for performance

**Emerging (2026):**

- **Biome v2.0+ maturity**: Achieved stable release, Vercel sponsorship, 80%+ ESLint rule compatibility
- **Next.js linter flexibility**: Framework no longer prescribes tooling
- **lint-staged v16**: Active maintenance, 16.2.7 latest (Nov 2025)
- **Husky v9 adoption**: Modern standard, simplified API

## Open Questions

Things that couldn't be fully resolved:

1. **Should we migrate to Biome-only or keep dual linters?**

   - What we know: Next.js 16 removed `next lint`, so ESLint is no longer required by framework
   - What we know: Biome is 10-25x faster and simpler (one tool vs two)
   - What's unclear: Biome's React hooks rule coverage maturity vs ESLint's react-hooks plugin
   - Recommendation: Keep dual setup for now. ESLint's React hooks rules prevent real bugs (hooks/rules-of-hooks catches conditional hook calls). Document that Biome-only is possible in future when React plugin matures. Create ADR documenting this decision.

2. **Should pre-commit hooks include type checking (tsc --noEmit)?**

   - What we know: Type checking catches errors before commit, prevents broken code
   - What we know: Type checking adds 5-10 seconds to commit time (checks entire codebase)
   - What's unclear: Developer tolerance for slower commits vs value of early type checking
   - Recommendation: Start without type checking in pre-commit (lint-staged only). Monitor CI failures. If type errors frequently break CI, add type checking to pre-push hook (less frequent than commits, acceptable slowdown).

3. **Should we configure Trivy to skip node_modules entirely?**

   - What we know: Current findings are in node_modules (dev dependency Dockerfile)
   - What we know: .trivyignore is more explicit (documents specific exclusions)
   - What's unclear: Are there legitimate security concerns we'd miss by skipping all node_modules?
   - Recommendation: Use .trivyignore for specific findings. Keep scanning node_modules to catch future vulnerabilities in dependencies. The project uses `npm audit --production` for dependency vulnerabilities (complementary to Trivy).

4. **Is 6-line duplication worth consolidating?**

   - What we know: DRY principle says eliminate duplication
   - What we know: Consolidation adds import dependency, slight indirection
   - What's unclear: At what point does consolidation add more complexity than it removes?
   - Recommendation: Consolidate this case. 6 lines is significant enough, function is stable (unlikely to change), and url-params.ts is the logical home. Rule of thumb: 5+ lines or used 3+ times = consolidate.

5. **Should we add commit message linting (commitlint)?**

   - What we know: Conventional commits enable automated changelog generation
   - What we know: Adds another dependency and pre-commit step
   - What's unclear: Is the team ready for stricter commit message discipline?
   - Recommendation: Defer to future phase. Converty already has CHANGELOG.md (Phase 5). Commit message linting is valuable for large teams but may be overkill for current team size. Monitor commit message quality first.

## Sources

### Primary (HIGH confidence)

- Project codebase:

  - `/Users/fjacquet/Projects/converty/.planning/phases/07-code-quality-validation/07-GAP-ANALYSIS.md` - Container security analysis (verified 2026-01-18)
  - `/Users/fjacquet/Projects/converty/src/lib/utils/url-params.ts` - Existing URL parameter helpers
  - `/Users/fjacquet/Projects/converty/src/stores/calculator-store.ts` - getUrlParams() duplication (lines 48-59)
  - `/Users/fjacquet/Projects/converty/src/lib/middleware/url-sync.ts` - getUrlParams() duplication (lines 93-104)
  - `/Users/fjacquet/Projects/converty/package.json` - Current dependencies and scripts
  - `/Users/fjacquet/Projects/converty/next.config.ts` - Static export configuration

- Official documentation:
  - [Husky Official Documentation](https://typicode.github.io/husky/) - Git hooks setup
  - [lint-staged GitHub Repository](https://github.com/lint-staged/lint-staged) - Configuration reference
  - [Trivy Filtering Documentation](https://trivy.dev/docs/latest/configuration/filtering/) - .trivyignore format
  - [Next.js 16 Blog Post](https://nextjs.org/blog/next-16) - `next lint` removal
  - [Husky npm Package](https://www.npmjs.com/package/husky) - Version 9.1.7 (verified 2026-01-18)
  - [lint-staged npm Package](https://www.npmjs.com/package/lint-staged) - Version 16.2.7 (verified 2026-01-18)

### Secondary (MEDIUM confidence)

- [How to Set Up Husky + Biome in a Next.js Project (2026 Guide)](https://dev.to/imkarmakar/how-to-set-up-husky-biome-in-a-nextjs-project-2026-guide-9jh) - Modern setup pattern
- [Next.js 15.5: Goodbye ESLint and Prettier, Hello Biome](https://www.tsepakme.com/blog/nextjs-biome-migration) - Migration guide
- [Support alternative linters such as Biome - Next.js Discussion](https://github.com/vercel/next.js/discussions/59347) - Framework evolution context
- [Prevent Bad Commits with Husky and lint-staged](https://betterstack.com/community/guides/scaling-nodejs/husky-and-lint-staged/) - Setup guide
- [Trivy: List of Methods to Ignore Directories](https://www.devopsschool.com/blog/trivy-list-of-methods-to-ignore-directories-files-during-scanning/) - Scanner configuration
- [@surma/rollup-plugin-off-main-thread npm package](https://www.npmjs.com/package/@surma/rollup-plugin-off-main-thread) - Dependency context

### Tertiary (LOW confidence)

- [Biome vs ESLint + Prettier: The 2025 Linting Revolution](https://medium.com/better-dev-nextjs-react/biome-vs-eslint-prettier-the-2025-linting-revolution-you-need-to-know-about-ec01c5d5b6c8) - Performance claims
- [Setting Up Husky and lint-staged for a Clean Codebase](https://blog.nashtechglobal.com/setting-up-husky-and-lint-staged-for-a-clean-codebase/) - Best practices
- [How to Build Secure Docker Images with Trivy](https://medium.com/codex/how-to-build-secure-docker-images-with-trivy-04603694f5ed) - Security context

### Commands Run (verified 2026-01-18)

```bash
npm list @surma/rollup-plugin-off-main-thread
# converty@1.0.0 /Users/fjacquet/Projects/converty
# └─┬ workbox-build@7.4.0
#   └── @surma/rollup-plugin-off-main-thread@2.2.3

ls node_modules/@surma/rollup-plugin-off-main-thread/Dockerfile
# Dockerfile exists (confirmed)

npm list husky lint-staged
# (neither currently installed - to be installed in Phase 8)
```

## Metadata

**Confidence breakdown:**

- Container security: HIGH - Verified in Phase 7 gap analysis, confirmed false positive
- URL consolidation: HIGH - Code examined directly, duplication confirmed
- Pre-commit hooks: HIGH - Official documentation, standard practice, recent guides (2026)
- Biome-only migration: HIGH - Next.js 16 removal of `next lint` confirmed in official docs
- Tool versions: HIGH - Verified from npm registry (Husky 9.1.7, lint-staged 16.2.7)

**Research date:** 2026-01-18
**Valid until:** 90 days (tooling stable, Biome ecosystem evolving, monitor for Next.js updates)

**Key findings:**

1. **Container security**: FALSE POSITIVE - .trivyignore solution documented
2. **URL consolidation**: Simple DRY fix - extract to url-params.ts
3. **Pre-commit hooks**: Modern Husky v9 + lint-staged v16 setup documented
4. **Biome-only**: Now possible (Next.js 16 change), but keep dual linters for React rules
5. **Performance**: lint-staged reduces commit time from 30s to 2-5s

**Next steps for planning:**

- Plan 08-01: Container security (.trivyignore) + URL consolidation
- Plan 08-02: Pre-commit hooks (Husky + lint-staged setup)
- Optional: Create ADR documenting dual-linter decision
