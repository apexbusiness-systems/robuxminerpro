# RobuxMinerPro — UI/UX Guide

> **Canonical Reference** — All visual changes MUST comply with this guide. Deviations require explicit approval.

---

## Design System

### Color Palette

| Token            | Value                           | Usage                               |
| ---------------- | ------------------------------- | ----------------------------------- |
| `--primary`      | Purple `hsl(270, 76%, 53%)`     | CTAs, active states, brand identity |
| `--primary-glow` | `rgba(139,92,246,*)`            | Glow effects, shadows, borders      |
| `--accent`       | Pink-magenta gradient           | Secondary highlights, hero effects  |
| `--background`   | Dark `hsl(240, 10%, 4%)`        | Page background (dark mode)         |
| `--foreground`   | Light `hsl(0, 0%, 95%)`         | Body text (dark mode)               |
| `--muted`        | `hsl(240, 4%, 16%)`             | Subtle backgrounds, borders         |
| `--destructive`  | Red `hsl(0, 84%, 60%)`          | Error states, destructive actions   |
| Gold tier        | `from-yellow-400 to-yellow-600` | Robux display, premium badges       |
| Purple tier      | `from-purple-400 to-purple-600` | Pro subscription badge              |

### Typography

| Element          | Font        | Weight                          | Size                         |
| ---------------- | ----------- | ------------------------------- | ---------------------------- |
| Brand title      | System sans | `font-black` (900)              | `text-3xl sm:text-4xl`       |
| Brand subtitle   | System sans | `font-black` + tracking `0.4em` | `text-[10px] sm:text-[12px]` |
| Navigation links | System sans | `font-medium` (500)             | `text-sm`                    |
| Page headings    | System sans | `font-bold` (700)               | Context-dependent            |
| Body text        | System sans | `font-normal` (400)             | `text-sm` to `text-base`     |

### Spacing & Layout

- Container: `container` with `px-4`
- Header height: `h-16` sticky top
- Content max-width: varies per page
- Hero max-width: `max-w-[1100px]`, gap: `gap-12 lg:gap-20`

---

## Theme System

| Key            | Detail                                            |
| -------------- | ------------------------------------------------- |
| Provider       | `ThemeProvider` from `@/components/ThemeProvider` |
| Default        | `dark`                                            |
| Storage        | `localStorage` key `rmp-theme`                    |
| Toggle         | `ThemeToggle` component in Navigation             |
| Implementation | CSS class strategy via `next-themes`              |

> [!CAUTION]
> **NEVER** hardcode light/dark colors. Always use Tailwind's `dark:` prefix or CSS custom properties from `index.css`.

---

## Component Inventory

### Core Layout

| Component        | Path                            | Responsibility                                         |
| ---------------- | ------------------------------- | ------------------------------------------------------ |
| `Navigation`     | `components/Navigation.tsx`     | Top nav, user dropdown, language picker, Robux display |
| `Footer`         | `components/Footer.tsx`         | Site footer with links                                 |
| `ErrorBoundary`  | `components/ErrorBoundary.tsx`  | Global error catch                                     |
| `ProtectedRoute` | `components/ProtectedRoute.tsx` | Auth gate wrapper                                      |

### Auth

| Component  | Path                           | Responsibility                                       |
| ---------- | ------------------------------ | ---------------------------------------------------- |
| `AuthPage` | `components/auth/AuthPage.tsx` | Sign in/up form, Google OAuth, dev bypass            |
| `useAuth`  | `hooks/useAuth.tsx`            | Auth context, signOut, mock mode, profile management |

### Gamification

| Component        | Path                                         | Responsibility           |
| ---------------- | -------------------------------------------- | ------------------------ |
| `RewardUnboxing` | `components/gamification/RewardUnboxing.tsx` | Reward animation overlay |

### Shared

| Component          | Path                              | Responsibility              |
| ------------------ | --------------------------------- | --------------------------- |
| `ChatDock`         | `shared/ChatDock.tsx`             | AI chat sidebar             |
| `HeroTitle`        | `components/HeroTitle.tsx`        | Animated hero section title |
| `LeadCaptureModal` | `components/LeadCaptureModal.tsx` | Email capture modal         |

### UI Primitives (shadcn/ui)

48 components in `components/ui/` — button, card, dialog, dropdown-menu, badge, avatar, tooltip, etc. These are shadcn/ui defaults. **Do not modify** unless absolutely necessary.

---

## Navigation States

### Landing (unauthenticated)

```
[Logo] ................... [Features] [How It Works] [Pricing] [Learn More] [FAQ] [🌐 Language] [Sign In]
```

### Authenticated

```
[Logo] ... [Dashboard] [Achievements] [Learn] [Events] ... [ThemeToggle] [Language] [💰 Robux] [Avatar ▼]
                                                                                                  ├─ Profile info
                                                                                                  ├─ Profile
                                                                                                  ├─ Settings
                                                                                                  └─ Log out
```

### Feature-Flagged Nav Items

| Item     | Flag                         | Default |
| -------- | ---------------------------- | ------- |
| Squads   | `VITE_FEATURE_SQUADS=true`   | Hidden  |
| Payments | `VITE_FEATURE_PAYMENTS=true` | Hidden  |

---

## Hero Section Rules

> [!WARNING]
> The hero section layout was carefully calibrated. Agents MUST NOT modify these constraints.

| Property            | Value                                                     | Reason                                        |
| ------------------- | --------------------------------------------------------- | --------------------------------------------- |
| Container max-width | `max-w-[1100px]`                                          | Prevents content from stretching on ultrawide |
| Layout              | `flex flex-col lg:flex-row`                               | Stacks on mobile, side-by-side on desktop     |
| Gap                 | `gap-12 lg:gap-20`                                        | Breathing room between text and video         |
| Video source        | `/hero-video.mp4` (from `public/`)                        | Static asset, NOT Vite-imported               |
| Video attributes    | `autoPlay loop muted playsInline`                         | Required for autoplay on all browsers         |
| Video styling       | `object-cover rounded-3xl border border-white/10`         | Frames the video elegantly                    |
| Glow effect         | `bg-gradient-to-tr from-primary/20 to-accent/20 blur-3xl` | Background blur behind video                  |

---

## Responsive Breakpoints

| Breakpoint | Tailwind Prefix | Layout Change                          |
| ---------- | --------------- | -------------------------------------- |
| < 768px    | (default)       | Mobile: stacked layout, hamburger menu |
| ≥ 768px    | `md:`           | Tablet: nav items visible              |
| ≥ 1024px   | `lg:`           | Desktop: full side-by-side hero layout |

---

## Accessibility Requirements

| Feature         | Implementation                                            |
| --------------- | --------------------------------------------------------- |
| Focus traps     | `useFocusTrap` hook for modals                            |
| Skip to content | `<main id="main" tabIndex={-1}>`                          |
| ARIA labels     | All interactive icons have `aria-label`                   |
| Video a11y      | `aria-label={t('home.hero.robotAlt')}` on hero video      |
| Keyboard nav    | All dropdown menus support keyboard navigation (Radix UI) |
| Color contrast  | WCAG 2.1 AA minimum on all text                           |

---

## Internationalization

| Key      | Detail                                                     |
| -------- | ---------------------------------------------------------- |
| Provider | `I18nProvider` from `@/i18n/I18nProvider`                  |
| Hook     | `useI18n()` → `{ t, locale, setLocale, availableLocales }` |
| Pattern  | `t('namespace.key')` for all user-facing text              |
| Location | Language selector in Navigation header                     |

> [!IMPORTANT]
> **NEVER** hardcode user-facing strings. Always use `t()` translation keys.
