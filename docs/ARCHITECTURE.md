# RobuxMinerPro — System Architecture

> **Canonical Reference** — Any agent working on this codebase MUST read this document before making changes.

---

## Provider Tree

The React component tree wraps the app in a strict ordering. **Do not reorder providers.**

```mermaid
graph TD
    QC["QueryClientProvider"] --> TP["TooltipProvider"]
    TP --> I18N["I18nProvider"]
    I18N --> TH["ThemeProvider (dark default)"]
    TH --> EB["ErrorBoundary"]
    EB --> BR["BrowserRouter"]
    BR --> AP["AuthProvider"]
    AP --> NAV["Navigation"]
    AP --> MAIN["main#main (Suspense + Routes)"]
    AP --> FT["Footer"]
    AP --> CD["ChatDock"]
```

**Key invariants:**

- `AuthProvider` MUST be inside `BrowserRouter` (uses `useNavigate`)
- `ThemeProvider` stores preference in `localStorage` key `rmp-theme`
- All page components are `lazy()` loaded with `Suspense` fallback

---

## Route Map

```mermaid
graph LR
    subgraph Public
        HOME["/"]
        FEAT["/features"]
        PRICE["/pricing"]
        PRIV["/privacy"]
        TERMS["/terms"]
        STATUS["/status"]
        HEALTH["/health"]
        SIM["/simulate-game"]
    end

    subgraph Auth
        AUTH["/auth (ProtectedRoute requireAuth=false)"]
    end

    subgraph Protected
        DASH["/dashboard"]
        SQUADS["/squads ⚑"]
        ACHIEV["/achievements"]
        LEARN["/learn"]
        EVENTS["/events"]
        PAY["/payments ⚑"]
        MENTOR["/mentor"]
        PROFILE["/profile"]
        SETTINGS["/settings"]
    end

    NOT_FOUND["/* → NotFound"]
```

⚑ = Feature-flagged: `VITE_FEATURE_SQUADS`, `VITE_FEATURE_PAYMENTS`

---

## Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant AP as AuthPage
    participant UA as useAuth
    participant SB as Supabase

    Note over UA: On mount: isSupabaseValid()?

    alt Supabase configured
        UA->>SB: onAuthStateChange + getSession()
        SB-->>UA: session | null
        UA->>UA: setUser(session.user)
    else Mock mode (no .env)
        UA->>UA: Check sessionStorage rmp_signed_out
        alt rmp_signed_out !== '1'
            UA->>UA: setUser(MOCK_USER)
        else Signed out flag set
            UA->>UA: setLoading(false), no user
        end
    end

    Note over U: Sign Out Flow
    U->>UA: signOut()
    UA->>UA: Clear sb-* localStorage keys
    UA->>UA: setSession/User/Profile(null)
    UA-->>SB: signOut({scope:'global'}) [fire-and-forget]
    UA->>U: window.location.replace('/auth')
```

**Sign-out invariant:** Local state is cleared SYNCHRONOUSLY. Server-side token revocation is fire-and-forget. The redirect happens instantly regardless of network conditions.

---

## Database Schema (Supabase)

```mermaid
erDiagram
    profiles {
        uuid id PK
        uuid user_id UK
        string display_name
        string username
        string avatar_url
        int mining_power
        int total_robux
        string referral_code
        uuid referred_by FK
        string subscription_tier
        timestamp last_login
        timestamp created_at
        timestamp updated_at
    }

    mining_sessions {
        uuid id PK
        uuid user_id FK
        timestamp start_time
        timestamp end_time
        bool is_active
        int mining_power_used
        int robux_earned
        timestamp created_at
    }

    tasks {
        uuid id PK
        string title
        string description
        task_type task_type
        int robux_reward
        int daily_limit
        json requirements
        bool is_active
        timestamp created_at
        timestamp updated_at
    }

    user_task_completions {
        uuid id PK
        uuid user_id FK
        uuid task_id FK
        task_status status
        int robux_earned
        timestamp started_at
        timestamp completed_at
        json completion_data
    }

    transactions {
        uuid id PK
        uuid user_id FK
        transaction_type transaction_type
        int amount
        string description
        string reference_id
        json metadata
        timestamp created_at
    }

    referrals {
        uuid id PK
        uuid referrer_id FK
        uuid referred_id FK
        int bonus_earned
        bool is_active
        timestamp created_at
    }

    profiles ||--o{ mining_sessions : "has"
    profiles ||--o{ user_task_completions : "completes"
    profiles ||--o{ transactions : "owns"
    profiles ||--o{ referrals : "refers"
    tasks ||--o{ user_task_completions : "assigned to"
    profiles ||--o| profiles : "referred_by"
```

**Enums:**
| Enum | Values |
|------|--------|
| `task_status` | `pending`, `in_progress`, `completed`, `failed` |
| `task_type` | `daily_login`, `watch_ad`, `complete_survey`, `referral`, `social_share`, `game_play` |
| `transaction_type` | `mining_reward`, `task_completion`, `referral_bonus`, `withdrawal`, `purchase` |

---

## API Proxy Map (Vite Dev Server)

| Frontend Path         | Backend Target                              | Purpose                 |
| --------------------- | ------------------------------------------- | ----------------------- |
| `/api/openai/*`       | `https://api.openai.com`                    | OpenAI chat completions |
| `/api/ollama/*`       | `http://localhost:11434`                    | Local Ollama inference  |
| `/api/engine/beta/*`  | `https://generativelanguage.googleapis.com` | Google Gemini API       |
| `/api/engine/alpha/*` | `https://api.groq.com/openai`               | Groq inference          |

> [!WARNING]
> These proxies only work in dev mode (`npm run dev`). In production, use Vercel Edge Functions (`api/chat.ts`).

---

## Directory Structure (Ownership)

```
src/
├── App.tsx                    # Root component — NEVER modify provider order
├── main.tsx                   # Entry point — NEVER modify
├── routes.tsx                 # Route definitions (unused, routes in App.tsx)
├── index.css                  # Global styles + Tailwind
├── components/
│   ├── auth/AuthPage.tsx      # Auth UI — BYPASS gated behind DEV
│   ├── Navigation.tsx         # Nav bar — signOut wiring lives here
│   ├── ProtectedRoute.tsx     # Route guard
│   ├── ErrorBoundary.tsx      # Global error boundary
│   ├── Footer.tsx             # Site footer
│   ├── HeroTitle.tsx          # Hero section title component
│   ├── LeadCaptureModal.tsx   # Lead capture form
│   ├── ThemeProvider.tsx      # Dark/light theme context
│   ├── ThemeToggle.tsx        # Theme switch button
│   ├── gamification/          # Reward/unboxing animations
│   ├── pip/                   # Picture-in-picture components
│   └── ui/                    # shadcn/ui primitives (48 components)
├── hooks/
│   ├── useAuth.tsx            # Auth context + signOut logic — CRITICAL
│   ├── use-toast.ts           # Toast notification system
│   ├── use-mobile.tsx         # Mobile viewport detection
│   └── useFocusTrap.ts        # Accessibility focus trap
├── integrations/supabase/
│   ├── client.ts              # Supabase client + Zod env validation
│   └── types.ts               # Auto-generated DB types — NEVER edit manually
├── i18n/                      # Internationalization
├── pages/                     # 25 page components (lazy loaded)
├── shared/                    # ChatDock, api.ts, brand.ts, config.ts
├── styles/                    # Additional stylesheets
├── lib/                       # Utility functions
└── types/                     # TypeScript type definitions
```
