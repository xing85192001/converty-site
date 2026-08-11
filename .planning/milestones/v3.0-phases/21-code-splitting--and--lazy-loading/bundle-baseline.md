# Bundle Analysis Baseline - Pre-Code Splitting

**Date:** 2026-01-24
**Build:** Production static export with bundle analyzer enabled
**Purpose:** Establish baseline metrics for comparison after code splitting implementation

## Total Bundle Size

- **Total output size:** 493 MB
- **JavaScript chunks:** 210 files, 6.4 MB total
- **Service worker:** 967 files precached (151.5 MB)

## Largest JavaScript Chunks

| File | Size | Notes |
|------|------|-------|
| `f28b7e19ad8dc08e.js` | 436 KB | Largest chunk |
| `f5572f5b753b4dce.js` | 348 KB | |
| `c62fc069e8244b23.js` | 348 KB | |
| `2ea0b0ef61069551.js` | 348 KB | |
| `cc3fbababfc439fc.js` | 220 KB | |
| `034945ea23f7a8ce.js` | 196 KB | |
| `1232933ab209f96f.js` | 156 KB | |
| `a6dad97d9634a72d.js` | 112 KB | |
| `91aaf055fcf006aa.js` | 108 KB | |
| `d11f7ef98e7b7f23.js` | 88 KB | |

**Top 10 total:** ~2.7 MB

## Sample Page Sizes (HTML + inlined JS)

| Route | HTML Size | Notes |
|-------|-----------|-------|
| `/` (root) | 6.9 KB | Redirect to locale |
| `/en/health/bmi` | 182 KB | Health calculator |
| `/en/finance/mortgage` | 186 KB | Finance calculator |

## Analysis Configuration

**Bundle Analyzer:**
- Enabled via `ANALYZE=true` environment variable
- Integrated using `@next/bundle-analyzer` package
- Wrapper applied to Next.js config: `withBundleAnalyzer(withNextIntl(nextConfig))`

**Build Command:**
```bash
ANALYZE=true npm run build
```

**Convenience Script:**
```bash
./scripts/analyze-bundle.sh
```

## Key Observations

1. **Large chunks:** Multiple 300+ KB chunks suggest potential for code splitting
2. **Static export:** All pages pre-rendered as static HTML (SSG)
3. **Service worker:** Aggressive precaching of 967 files for offline support
4. **Page size:** Calculator pages ~180-186 KB (HTML includes inlined scripts)

## Success Criteria for Code Splitting

After implementing lazy loading in subsequent plans:

1. **Reduce initial bundle:** First Load JS should decrease for most routes
2. **On-demand loading:** Calculator components loaded only when needed
3. **Shared chunks:** Common dependencies properly identified and shared
4. **Maintained functionality:** All calculators work with lazy loading

## Baseline Metrics to Track

- [ ] Total JS chunks count: **210**
- [ ] Total chunks size: **6.4 MB**
- [ ] Largest single chunk: **436 KB**
- [ ] Average calculator page HTML: **~184 KB**
- [ ] Number of 300+ KB chunks: **4 chunks**

## Next Steps

1. Plan 21-02: Implement dynamic imports for calculator components
2. Plan 21-03: Optimize shared chunk splitting
3. Plan 21-04: Compare post-split metrics with this baseline
