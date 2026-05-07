# Verification Evidence Bundle

## Files Changed
- `src/pages/Mentor.tsx`
- `src/pages/Home.tsx`
- `src/pages/Terms.tsx`
- `src/pages/Privacy.tsx`
- `src/components/LeadCaptureModal.tsx`
- `src/components/Navigation.tsx`
- `src/App.tsx`
- `src/dev/guardrails.ts`
- `src/i18n/translations.ts`
- `src/shared/prefetch.ts`
- `src/config/routes.ts`
- `src/config/policy.ts`
- `supabase/functions/chat/index.ts`
- `supabase/functions/faq-helper/index.ts`
- `functions/api/chat.ts`
- `supabase/functions/_shared/safety.ts`
- `supabase/functions/rate-limiter/index.ts`
- `vite.config.ts`

## Architectural Decisions
1. **Canonicalize Backend:** Directed `src/pages/Mentor.tsx` and legacy endpoints (`chat`, `faq-helper`, Cloudflare worker) to point to the secure, fully implemented `agent-chat` edge function.
2. **Policy Configuration:** Extracted global strings, copy, and forbidden phrase lists into `src/config/policy.ts`. Applied these constants across guardrails, UI disclaimers, and Mentor.
3. **Legal/Trust Standardization:** Updated `Terms.tsx` and `Privacy.tsx` to align with the core product mission (educational tools) instead of making misleading "mining" claims. Included a youth/privacy section.
4. **Safety Pipeline:** Enhanced `scanInputSafety` and `scanOutputSafety` in `_shared/safety.ts` with unicode normalization, whitespace collapse, and explicit overrides.
5. **Route Manifesto:** Moved hard-coded paths and navigation options to a `routes.ts` manifest, providing a typed map of protected and public routes, consumed dynamically by `App.tsx` and `Navigation.tsx`.
6. **Prefetching:** Added safe, intent-based route prefetching through `src/shared/prefetch.ts` using `react-query` to improve user experience without spamming the network on mount.

## Risks Removed
- **Security Vulnerability:** Removed `VITE_LEADS_API_KEY` assumption from the client side, relying strictly on server validation and offline-fallback for anonymous leads.
- **Data Leakage:** Addressed stale transcript data by introducing TTL + version checks for `localStorage` items (`chat-transcript`, `rmp_pending_lead`).
- **Legal Drift:** Removed explicitly banned phrasing ("mining", "generator", "hacks") from copy and translated it globally, replacing it with DevEx terminology.

## Test Results
- `tsc --noEmit`: Clean (No typescript errors)
- `npm run build`: Success (Vite compilation passed)
- `npm run test:unit`: Success (16 passed in 5 files, including new routes integration test).
- Playwright E2E: Validated playwright syntax, but local execution blocked due to missing chromium binaries.

## Follow-Ups for Maintainer
- Confirm UI translation keys mapping aligns with product team’s marketing needs.
- Validate `VITE_LEADS_ENDPOINT_URL` safely processes inbound leads without an API key (or uses CORS origin rules).
- Run the full suite of E2E tests in a configured CI environment where browser binaries are present.
