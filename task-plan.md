
**Version:** 1.0.0 | **Last Updated:** 2026-03-15

### ARTIFACT: Task Plan

**Mission:** Implement a 20X AI-adaptive gamification engine ("Algo-Forge"), a "High-Voltage" premium UI overhaul, and a persistent Document Picture-in-Picture (DPIP) companion agent for RobuxMinerPro to maximize user retention and establish an untouchable IP moat.

**Success Criteria:**

- Unit tests pass for all new gamification logic (XP calculation, Streak logic, Tier progression): `npm test -- run --passWithNoTests` → exit 0
- Playwright E2E tests pass for the new "Mystery Reward Unboxing" flow: `npx playwright test e2e/` → exit 0
- Typecheck and Linting pass: `npm run lint` and `tsc --noEmit` → exit 0
- SonarCloud Quality Gate: A-grade maintained
- Browser UI visually meets Apple-polish aesthetic standards (verified via Playwright screenshots)

**Constraints:**

- NEVER modify or bypass the core Supabase authentication or payment security layers.
- NEVER use generic AI-slop aesthetics; all UI must adhere to the `frontend-design.md` skill, featuring custom ease-out curves, sophisticated gradients, and high-quality SVG animations.
- Format: TypeScript strict mode (`"strict": true`) and ESLint with no warnings. Code must be idempotent and deterministic.

**Dependencies:**

- `framer-motion` (for premium page transitions and micro-interactions)
- `canvas-confetti` (for visceral reward celebrations)
- `lucide-react` (existing, for consistent iconography)
- `tailwindcss-animate` (existing, for CSS keyframes)
- Native Web API: `documentPictureInPicture` (Chromium 116+) for the persistent agent window.

**Risk Assessment:**

- Risk: Complex animations and WebGL/heavy DOM elements might degrade performance on low-end mobile devices.
- Rollback: Implement an `ENABLE_PREMIUM_VFX` feature flag (default true, fallback false on slow connections) to selectively disable heavy animations in `src/shared/featureFlags.ts`.

**Agent Strategy:**

- **Editor Agent:** Implement "Algo-Forge" Adaptive XP system, the "High-Voltage" Reward Unboxing component, and the `PipAgent` React component leveraging the `documentPictureInPicture` API via React Portals.
- **Terminal Agent (Auto):** Install dependencies (`framer-motion`, `canvas-confetti`), run typechecks, linting, and automated tests.
- **Browser Agent (Auto):** Validate the new premium UI animations, unboxing flow aesthetics, and PiP launch functionality via Playwright screenshots.
- **Execution Policy:** Request Review before merging or pushing to main (Auto mode for localized commands).
