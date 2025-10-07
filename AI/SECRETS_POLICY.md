# Secrets Handling Policy

## Core Principle
**Never commit secrets to the repository.** All API keys, tokens, and sensitive credentials live in platform secret managers (Supabase Secrets, Cloud Secrets) or local `.env` files that are gitignored.

## .env File Rules

### Purpose
The `.env` file in the repository root contains **local development stubs only**. It shows the structure of required environment variables but does not contain real secrets.

### What .env Contains
```
VITE_SUPABASE_PROJECT_ID="placeholder-project-id"
VITE_SUPABASE_PUBLISHABLE_KEY="placeholder-anon-key"
VITE_SUPABASE_URL="https://placeholder.supabase.co"
```

### What .env NEVER Contains
- Real API keys (OpenAI, Anthropic, etc.)
- Production Supabase credentials
- Webhook secrets or signing keys
- Database passwords
- OAuth client secrets

## Forbidden Actions

### 🚫 Lovable AI Must NEVER:
1. **Delete** `.env`
2. **Rename** `.env` (e.g., `.env.example`, `.env.local`)
3. **Move** `.env` to another directory
4. **Edit** `.env` to add real secrets
5. **Commit** any file containing secrets (even in comments)

### ✅ Allowed Actions:
- **Read** `.env` to understand required variables
- **Reference** `.env` structure in documentation
- **Prompt user** to set secrets via Supabase UI or `lov-add-secret` tool

## Secret Storage Locations

| Environment | Location | Access Method |
|-------------|----------|---------------|
| **Local Dev** | `.env` (gitignored stubs) | `import.meta.env.VITE_*` |
| **Edge Functions** | Supabase Dashboard → Project Settings → Edge Functions → Secrets | `Deno.env.get('SECRET_NAME')` |
| **Production** | Supabase Dashboard → Project Settings → Edge Functions → Secrets | `Deno.env.get('SECRET_NAME')` |

## PR Checklist: Secrets Gate

Every pull request **MUST** include this statement:
> ✅ **No secrets added or changed** — All keys managed via platform secret manager.

If a PR adds/removes secrets:
1. **Reject** the PR immediately
2. Revert to previous commit via Version History → Restore
3. Document in `docs/POSTMORTEM_*.md`
4. Use `lov-add-secret` tool to prompt user for secret input

## Adding New Secrets (Correct Process)

### Step 1: Identify Need
Document in `AI/LLM_READINESS.md` or relevant spec which secrets are required.

### Step 2: Use Platform Tools
- **For Supabase:** Lovable → Tools → `secrets--add_secret`
- **For Local Dev:** User manually adds to `.env` (never committed)

### Step 3: Reference in Code
```typescript
// ✅ CORRECT: Read from environment
const apiKey = Deno.env.get('OPENAI_API_KEY');

// ❌ WRONG: Hardcoded secret
const apiKey = 'sk-proj-abc123...';
```

### Step 4: Document
Update `AI/LLM_READINESS.md` provider matrix with placeholder values only.

## Incident Response

If a secret is committed:
1. **Immediate:** Revert commit via Version History
2. **Within 1 hour:** Rotate/regenerate the exposed secret
3. **Within 24 hours:** Create postmortem in `docs/POSTMORTEM_*.md`
4. **Follow-up:** Update this policy with lessons learned

## Protected Files List

These files are **READ-ONLY** for Lovable unless explicit user approval:
- `.env`
- `package.json`
- `package-lock.json` / `bun.lockb`
- `.gitignore`
- `.github/workflows/*` (CI/CD)
- `supabase/migrations/*`

## Enforcement

- **Pre-commit:** `.gitignore` blocks `.env` from staging
- **PR Template:** Secrets checklist required
- **Code Review:** Maintainer verifies no secrets in diff
- **Automated:** Secret scanning tools (future)

---

## Quick Reference

**Before touching secrets:**
1. Is this a real secret? → Use platform secret manager
2. Is this a config value? → Use `.env` stub with placeholder
3. Is this documentation? → Use `[PLACEHOLDER]` or `your-key-here`

**If uncertain:** Ask the user explicitly before proceeding.

---
*Last Updated: 2025-01-07*
