# ADR-008: GitHub Pages Deployment via GitHub Actions

**Status:** Accepted
**Date:** 2024-01-01
**Deciders:** Project owner

---

## Context

The project requires a hosting platform with the following properties:
- Zero ongoing cost
- No server administration
- Automatic deployment from source control
- HTTPS by default
- Sufficient bandwidth for a public tool

Evaluated options:
| Platform | Cost | Effort | Custom Domain |
|---------|------|--------|---------------|
| **GitHub Pages** | Free | Zero | Yes (CNAME) |
| Vercel | Free tier (limited) | Low | Yes |
| Netlify | Free tier (limited) | Low | Yes |
| AWS S3 + CloudFront | ~$1–5/mo | Medium | Yes |
| Self-hosted VPS | ~$5–20/mo | High | Yes |

GitHub Pages won because the project is already hosted on GitHub, requires no additional account, and has no bandwidth limits for public repositories.

## Decision

Deploy to **GitHub Pages** using the official `actions/deploy-pages` action, triggered on every push to the `main` branch.

**Deployment workflow (`static.yml`):**
1. Checkout code
2. Setup Node.js 20 with npm cache
3. `npm ci` — reproducible install
4. `npm run type-check` — TypeScript validation
5. `biome check src/` — lint gate
6. `npm run build` — prebuild + next build + generate-sw
7. Upload `./out` as Pages artifact
8. Deploy via `actions/deploy-pages`

**Base path:** `/converty` (subdirectory of the GitHub Pages domain `fjacquet.github.io`)

**Branch:** `main` is the single production branch — every push deploys. (A short-lived `maincd` branch name was used previously and renamed back to `main`.)

**Trailing slashes:** Forced via `trailingSlash: true` in `next.config.ts` — required by GitHub Pages static routing.

## Consequences

**Positive:**
- Zero cost indefinitely
- Automated deployment on every push — no manual steps
- Build failures prevent broken deployments (type-check + lint gate)
- Full HTTPS included
- GitHub CDN distributes content globally

**Negative / Constraints:**
- Base path `/converty` is hardcoded — all internal links must account for it
- GitHub Pages has a soft 10 GB repository size limit (not yet a concern)
- Build logs visible to GitHub Actions are public (for public repo)
- No preview deployments for pull requests (static.yml only runs on push to `main`)
- GitHub Pages does not support custom headers (Cache-Control, CSP) — static assets served with GitHub's defaults

**Security workflows:**
- `security.yml` — runs weekly and on every push/PR: `npm audit` + CodeQL analysis
- `release.yml` — triggered by `v*` tags: builds offline ZIP, creates GitHub Release
