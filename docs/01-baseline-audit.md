# 01 Baseline Audit

## Objective

Assess the current state of RobuxMinerPro against release-candidate requirements, focusing on PWA hardening, mobile readiness, auth fallsbacks, lead capture, and tests.

## Baseline Blockers Found

1. **PWA Setup**: `src/main.tsx` uses custom `/sw.js` registration and hourly updates, bypassing `virtual:pwa-register`. Missing native capacitor check.
2. **Vite PWA Config**: Missing maskable icon.
3. **App Icons**: Need assurance that `public/assets/app_icon.svg` and `icon-192/512.png` exist and manifest is correct.
4. **Auth Fallback**: `src/integrations/supabase/client.ts` uses naive check. `AuthPage` redirects and bypass functions need robustness via APEX bypass.
5. **Lead Capture Modal**: Needs `submitError` handling and offline fallback via `localStorage`.
6. **Dead Routes**: `MentorPip.tsx` (not found yet, or missing broken texture), provider modals duplication in Home.
7. **Nav Feature Flags**: Navigation needs to hide routes behind `VITE_FEATURE_PAYMENTS` and `VITE_FEATURE_SQUADS`.
8. **Tests**: Need unit vs E2E test discovery alignment in `vitest.config.ts` and `playwright.config.ts`.
9. **Capacitor**: Missing Capacitor dependencies and configs.

## Missing / Impact / Assuming

- **MISSING**: Native iOS/Android build toolchains and signing certificates.
- **IMPACT**: Cannot guarantee full native compilation or deployment.
- **ASSUMING**: Validation will end at successful Capacitor configuration (`npx cap sync`) and shell generation if CLI is available, blocking only on the final native SDK tools.
