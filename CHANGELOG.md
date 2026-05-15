# Changelog — RobuxMinerPro

All notable changes documented in order of release.

## [2.0.0] — 2026-05-15
### Security
- P0-A: Mock auth production guard — `bypassMockLogin()` disabled in prod via `IS_DEV` gate
- P0-A: `isAdmin` fails-closed in production without verified Supabase
- P0-A: `clearSupabaseAuthStorage()` scoped to project-ref — prevents blast radius
- P0-B: RLS enabled on all 6 tables with least-privilege policies
- P0-B: Mining reward calculation moved to `SECURITY DEFINER` PostgreSQL function with 28s rate limit

### Performance
- P1-A: QueryClient `staleTime` 0→30s, `retry` 3→1, `refetchOnWindowFocus` disabled
- P1-B: Vite `manualChunks` function-form splits all 26 Radix packages + Framer Motion + Recharts + Supabase into deferred chunks
- P1-A: ChatDock conditionally mounted only for authenticated users

### Features
- P1-C: Supabase Realtime live balance subscription — balance updates in <50ms
- P1-D: Offline mining accumulation engine — up to 8hr passive Robux
- P2-A: Daily streak system with 5 tiers (1x–4x multiplier) and milestone bonuses
- P2-B: Dashboard decomposed into atomic components: `BalanceCard`, `MiningControls`, `StreakTracker`, `Leaderboard`, `LiveFeed`
- P2-B: Animated Robux counter (Framer Motion count-up on balance change)
- P2-B: Optimistic mining tap with instant UI + server rollback on failure
- P2-B: Live leaderboard (top 10, 60s stale, current-user highlight)
- P2-B: Real-time social feed (AnimatePresence slide-in, max 20 entries)
- P3: PWA push notifications — mining complete + streak bonus alerts

## [1.0.0] — 2026-03-15
### Initial hardened release
- React 18 + TypeScript + Vite + Supabase + Cloudflare Pages
- Auth with mock fallback, ErrorBoundary, lazy routing, dark theme
