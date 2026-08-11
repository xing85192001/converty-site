# ADR-009: No Backend — Privacy-First, Client-Side Only

**Status:** Accepted
**Date:** 2024-01-01
**Deciders:** Project owner

---

## Context

Many calculator tools monetize through advertising, require account creation, or send calculation inputs to analytics servers. This raises privacy concerns for users who may be calculating sensitive information (financial projections, medical values, engineering specifications).

## Decision

Converty operates with **zero backend infrastructure**. All computation happens in the user's browser. No data is ever sent to any server controlled by this project.

**Explicit non-features:**
- No user accounts or authentication
- No database or server-side storage
- No analytics or tracking scripts
- No advertising
- No cookies (beyond locale preference stored locally)
- No telemetry

**External API calls (user-initiated):**
The only network requests are for live data used in specific calculators, and only when those calculators are actively used:
- Crypto exchange rates (public API)
- Mining profitability data (public API)
- SPECint2017 benchmark data (scraped at build time, not runtime)

These APIs receive no user calculation data — they are queried for reference data only.

## Consequences

**Positive:**
- Full GDPR compliance by design — no personal data is processed
- No cookie consent banner required
- Users can trust that their financial, medical, or engineering inputs stay local
- No privacy policy required for the core tool
- No infrastructure to secure, audit, or breach

**Negative / Constraints:**
- Cannot offer saved calculation history across sessions
- Cannot personalize the experience based on usage patterns
- Cannot collect usage analytics to prioritize feature development
- Cannot offer cloud sync for bookmarked calculations
- Revenue model limited to donations or sponsorship (no ads, no paid tier)

**User data handling:**
| Data | Where stored | Shared with |
|------|-------------|-------------|
| Calculator inputs | Browser memory + URL | Nobody (user's choice to share URL) |
| Locale preference | Browser localStorage | Nobody |
| PWA install state | Browser | Nobody |
| Theme preference | Browser localStorage | Nobody |
