# 02 Implementation Plan

## Proposed Changes

### PWA and Vite Config

- **MODIFY** `src/main.tsx`: Import `virtual:pwa-register`, add `Capacitor.isNativePlatform()` check to skip registration inside native apps, handle auto-refresh.
- **MODIFY** `vite.config.ts`: Update `vite-plugin-pwa` options, maskable icon in manifest, ensure cleanup/skip waiting.

### Auth and UI Forms

- **MODIFY** `src/integrations/supabase/client.ts`: Robust error handling for offline or non-configured Supabase setups.
- **MODIFY** `src/components/auth/AuthPage.tsx`: Ensure dev bypass logic is completely safe and robust.
- **MODIFY** `src/components/LeadCaptureModal.tsx`: Add offline fallback to `localStorage` and `submitError` states.
- **MODIFY** `src/pages/Home.tsx`: Remove dead provider modal logic, streamline CTA.
- **MODIFY** `src/components/Navigation.tsx`: Add feature flags for Payments and Squads.

### Test Alignment

- **MODIFY** `vitest.config.ts`: Configure unit tests specifically for `tests/unit/*.spec.ts`.
- **MODIFY** `playwright.config.ts`: Adjust `testMatch`, `testIgnore` for E2E tests properly.

### Capacitor Mobile Setup

- **MODIFY** `package.json`: Add mobile build/open scripts and dependencies.
- **NEW** `capacitor.config.ts`: Establish baseline capacitor config for Android/iOS sync.

## Verification

- Unit and typechecks via `npm run test:unit` and `npm run typecheck`.
- Build successful via `npm run build`.
- E2E tests run appropriately without overlapping unit paths.
- Capacitor shells can be synchronized.
