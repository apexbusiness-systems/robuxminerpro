# LLM Readiness Specification

## 1. Objective
Enable safe, compliant AI-powered features for RobuxMinerPro using vetted LLM providers with proper guardrails.

## 2. Provider Matrix

| Provider | Model | Endpoint | Auth Method | Rate Limits | Token Cost | Region |
|----------|-------|----------|-------------|-------------|------------|--------|
| OpenAI | gpt-4o-mini | api.openai.com/v1/chat/completions | Bearer Token | 10k RPM | $0.150/1M in, $0.600/1M out | Global |
| OpenAI | gpt-5-mini-2025-08-07 | api.openai.com/v1/chat/completions | Bearer Token | 10k RPM | TBD | Global |
| Anthropic | claude-sonnet-4-20250514 | api.anthropic.com/v1/messages | x-api-key | 1k RPM | TBD | Global |
| Lovable AI | google/gemini-2.5-flash | ai.gateway.lovable.dev/v1/chat/completions | Bearer Token | Workspace-based | Free (Sept 29 - Oct 13, 2025) | Global |

**Note:** All endpoints called via Supabase Edge Functions only. No client-side API keys.

## 3. Safety/UX Requirements

### Content Compliance (Roblox-safe)
- ❌ **FORBIDDEN:** "free Robux", "generator", "mining Robux", "off-platform trades"
- ✅ **APPROVED:** "Learn official ways to get Robux" (Premium, creating games, gift cards, web purchase)

### Writing Standard
- Grade-8 reading level (≈20 words/sentence max)
- Active voice, everyday words, contractions OK
- "You/we" pronouns; explain jargon in plain terms

### Refusal Patterns
If user asks for forbidden content:
> "We only teach official ways to get Robux. Learn more at help.roblox.com."

Auto-rejection regex (case-insensitive):
- `\bfree\s+robux\b`
- `\brobux(?:\W+|_)?generator\b`
- `\brobux(?:\W+|_)?min(?:e|ing)\b`

## 4. Product Surface Map

### Where LLM Will Be Used
1. **Mentor Chat** (`/mentor`) — Strategy tips, learning guidance
2. **FAQ Helper** (future) — Contextual help on Roblox policies
3. **Content Tips** (future) — Game dev suggestions (safe, official)

### Where LLM Will NOT Be Used
- User-generated content moderation (requires human review)
- Financial calculations or guarantees
- Anything suggesting "earning" Robux outside official channels

## 5. Feature Flags

```typescript
// Managed via Supabase Secrets or .env (local dev only)
LLM_FEATURES_ENABLED=false        // Master switch
LLM_MENTOR_ENABLED=false          // /mentor route
LLM_FAQ_ENABLED=false             // FAQ helper
LLM_PROVIDER=lovable-ai           // Default: Lovable AI Gateway
```

**Release Protocol:**
- Toggle via Supabase dashboard secrets only
- Never hardcode `true` in committed code
- Gradual rollout: 5% → 25% → 100% over 3 releases

## 6. Telemetry Plan

### Events to Track (No PII)
- `llm.request.start` — timestamp, route, model
- `llm.request.complete` — duration, token count
- `llm.request.error` — error type, rate limit hit
- `llm.content.blocked` — safety filter triggered

### Prohibited Data
- User messages (store count only, not content)
- IP addresses, email, username
- Any Roblox account identifiers

## 7. Go/No-Go Checklist

### Documentation
- [ ] POSTMORTEM_2025-LLM_ENV.md exists
- [ ] SECRETS_POLICY.md exists
- [ ] PR template updated with LLM gates

### Configuration
- [ ] Edge function created (`supabase/functions/chat/`)
- [ ] `verify_jwt = false` in config.toml (public endpoint)
- [ ] CORS headers configured
- [ ] Rate limiting added (429 responses)

### Safety
- [ ] Content filter regex tested (see section 3)
- [ ] Refusal pattern returns approved message
- [ ] No "free/generator/mining" in any UI copy

### Evidence Required Before Launch
1. **Lighthouse:** Performance/Best Practices/SEO ≥90 (JSON + screenshot)
2. **Security Headers:** CSP, X-Content-Type-Options, Referrer-Policy (curl output)
3. **WCAG Spot Check:** Focus order, contrast ≥4.5:1, aria-labels
4. **Robots/Sitemap:** 200 responses on production domain
5. **Manual Test:** Mentor chat responds with safe content; blocks forbidden prompts

### Launch Approval
**Signed off by:** [PENDING]  
**Date:** [PENDING]  
**Evidence Links:** [PENDING]

---
*Last Updated: 2025-01-07*
