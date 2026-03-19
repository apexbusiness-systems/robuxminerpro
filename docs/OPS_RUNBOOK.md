# RobuxMinerPro — Ops Runbook

> **Canonical Reference** — Follow these procedures exactly. Deviation causes production incidents.

---

## Environment Variables

### Local Development (`.env`)

| Variable                        | Required | Description                                      |
| ------------------------------- | -------- | ------------------------------------------------ |
| `VITE_SUPABASE_URL`             | ✅       | `https://<project-ref>.supabase.co`              |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | ✅       | Supabase anon/publishable key (NOT service role) |
| `VITE_OPENAI_API_KEY`           | Optional | OpenAI API key for chat features                 |
| `VITE_GEMINI_API_KEY`           | Optional | Google Gemini API key                            |
| `VITE_GROQ_API_KEY`             | Optional | Groq inference API key                           |
| `VITE_LEADS_ENDPOINT_URL`       | Optional | Lead capture webhook URL                         |
| `VITE_FEATURE_SQUADS`           | Optional | `true` to show Squads nav item                   |
| `VITE_FEATURE_PAYMENTS`         | Optional | `true` to show Payments nav item                 |

### Vercel Production

| Variable                        | Set In                                   | Notes                                         |
| ------------------------------- | ---------------------------------------- | --------------------------------------------- |
| `VITE_SUPABASE_URL`             | Vercel Dashboard → Environment Variables | **MUST be set** or app runs in mock mode      |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Vercel Dashboard                         | Different from `VITE_SUPABASE_ANON_KEY`       |
| `VITE_SUPABASE_ANON_KEY`        | Vercel Dashboard                         | Supabase anon key (separate from publishable) |
| `VERCEL_ORG_ID`                 | GitHub Secrets                           | For CI deploy workflow                        |
| `VERCEL_PROJECT_ID`             | GitHub Secrets                           | For CI deploy workflow                        |
| `VERCEL_TOKEN`                  | GitHub Secrets                           | Vercel API token                              |
| `GH_TOKEN`                      | Vercel Dashboard                         | GitHub API access                             |

### CI (`.env.ci`)

Used for Lighthouse and test workflows. Contains mock/minimal values.

> [!CAUTION]
> The `.env` file is in `.gitignore`. **NEVER** commit real secrets. Use `.env.example` as reference.

---

## Supabase Client Configuration

```
File: src/integrations/supabase/client.ts
```

| Check                  | Logic                                                     |
| ---------------------- | --------------------------------------------------------- |
| `isSupabaseConfigured` | `true` when URL + key are set and not placeholder values  |
| `isSupabaseValid()`    | Used by `useAuth` — same as `isSupabaseConfigured`        |
| Fallback URL           | `https://invalid.supabase.local` (never hits real server) |
| Auth storage           | Custom `safeStorage` adapter wrapping `localStorage`      |
| Session persistence    | `persistSession: true`, `autoRefreshToken: true`          |

**Env validation:** Zod schema validates `VITE_SUPABASE_URL` (URL format) and key (min length 1).

---

## Build & Deploy Pipeline

### Local Development

```bash
npm run dev          # Vite dev server on port 8080
npm run build        # Production build → dist/
npm run preview      # Preview production build locally
```

### CI/CD Workflow (`.github/workflows/deploy.yml`)

```
Trigger: push to main
Pipeline: checkout → Node 20 → npm ci → vercel pull → vercel build --prod → vercel deploy --prod
```

### Lighthouse CI (separate workflow)

```
Trigger: push to main
Pipeline: checkout → npm ci → npm run build → Lighthouse audit
```

> [!IMPORTANT]
> **Both CI workflows run `npm run build`.** If the build fails, both pipelines fail. Always verify `npm run build` locally before pushing.

---

## Static Asset Rules

| Asset Type            | Location                   | How to Reference                      | Bundled?             |
| --------------------- | -------------------------- | ------------------------------------- | -------------------- |
| Small images (<100KB) | `src/assets/`              | `import img from '@/assets/file.png'` | Yes (Vite processes) |
| Large media (>1MB)    | `public/`                  | `src="/filename.mp4"`                 | No (copied as-is)    |
| Favicon, manifest     | `public/`                  | Referenced in `index.html`            | No                   |
| Logo                  | `public/official_logo.png` | `src="/official_logo.png"`            | No                   |

> [!WARNING]
> **NEVER** import large binary files (video, audio) via Vite's module system. This crashes `vite-plugin-pwa`'s build hook. Always place them in `public/`.

---

## Sign-Out Behavior (Post-Fix)

The sign-out function uses a **fire-and-forget** pattern:

```
1. Synchronously clear all sb-* keys from localStorage
2. Synchronously clear React auth state (setSession/User/Profile(null))
3. Fire supabase.auth.signOut({scope:'global'}) — NO await
4. Redirect to /auth immediately via window.location.replace
```

**Why fire-and-forget?** The Supabase API call can hang for 30+ seconds on network issues. Awaiting it blocks the redirect, making sign-out appear broken.

---

## Mock Mode

When `isSupabaseConfigured` is `false` (no valid `.env`):

| Behavior       | Detail                                                           |
| -------------- | ---------------------------------------------------------------- |
| Auto-login     | `MOCK_USER` + `MOCK_PROFILE` injected on mount                   |
| Sign-out       | Sets `sessionStorage.rmp_signed_out = '1'`, redirects to `/auth` |
| Re-login guard | `useEffect` checks flag, skips mock injection if set             |
| BYPASS button  | Only visible when `import.meta.env.DEV === true`                 |
| Mock email     | `explorer@robuxminer.dev`                                        |
| Mock tier      | `premium`                                                        |

> [!CAUTION]
> **BYPASS paths are tree-shaken from production builds.** The `import.meta.env.DEV` check is compiled to `false` by Vite in production, and the minifier removes the dead code.

---

## Incident Playbooks

### Auth: "Failed to fetch" on Sign In

1. **Check:** Is `VITE_SUPABASE_URL` set correctly in `.env`?
2. **Check:** Does the URL point to a live Supabase instance?
3. **Check:** Is the publishable key valid and not expired?
4. **Verify:** Open browser DevTools → Network → look for failed requests to `supabase.co`

### CI: Build fails with ENOENT

1. **Check:** Is the failing file in `src/assets/`? If it's a large binary, move to `public/`
2. **Check:** Is the import using `@/assets/` path alias? Switch to `/filename` for `public/` files
3. **Verify:** `npm run build` locally before pushing

### CI: Lighthouse workflow fails

1. **Check:** Same build as Deploy-Production. Fix the build first.
2. **Check:** `lighthouserc.json` for threshold configuration
3. **Verify:** Run `npm run build` locally

### Production: Users can't sign out

1. **Check:** Is `signOut()` using fire-and-forget pattern? (No `await`)
2. **Check:** Are `sb-*` localStorage keys being cleared synchronously?
3. **Check:** Is redirect going to `/auth` (not `/`)?
4. **Verify:** Open DevTools → Application → Local Storage → check for remaining `sb-*` keys after sign-out

---

## Monitoring

| What         | Where                                | Alert Condition                 |
| ------------ | ------------------------------------ | ------------------------------- |
| Deployment   | Vercel Dashboard                     | Build failure                   |
| Auth errors  | Supabase Dashboard → Auth → Logs     | Repeated sign-in failures       |
| API usage    | Vercel Dashboard → Usage             | Edge function invocations spike |
| Dependencies | GitHub Dependabot                    | High/critical vulnerability     |
| Lighthouse   | GitHub Actions → Lighthouse workflow | Score below threshold           |
