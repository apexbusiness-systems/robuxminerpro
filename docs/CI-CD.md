# CI/CD Pipeline Documentation

## Overview

RobuxMinerPro uses a comprehensive CI/CD pipeline to ensure code quality, security, and zero-downtime deployments. This document outlines the complete pipeline architecture and usage.

## Table of Contents

1. [Pre-Commit Hooks](#pre-commit-hooks)
2. [GitHub Actions Workflows](#github-actions-workflows)
3. [Feature Flags System](#feature-flags-system)
4. [Performance Monitoring](#performance-monitoring)
5. [Deployment Process](#deployment-process)
6. [Rollback Procedures](#rollback-procedures)
7. [Quality Gates](#quality-gates)

---

## Pre-Commit Hooks

### Setup

Pre-commit hooks are automatically installed via Husky when running `npm install`.

### Hooks

#### pre-commit

- Runs `lint-staged` on staged files
- Auto-fixes ESLint errors
- Formats code with Prettier
- **Blocks** commits containing `.env` files

#### pre-push

- Runs TypeScript type checking (`npm run type-check`)
- Runs ESLint (`npm run lint`)
- Ensures code quality before pushing

### Bypass (Emergency Only)

```bash
# Skip pre-commit (NOT RECOMMENDED)
git commit --no-verify -m "message"

# Skip pre-push (NOT RECOMMENDED)
git push --no-verify
```

---

## GitHub Actions Workflows

### 1. CI Pipeline (`.github/workflows/ci.yml`)

**Triggers:** Pull requests and pushes to `main`

**Jobs:**

- **security-scan**: Detects exposed secrets and runs dependency audit
- **lint-and-type**: ESLint and TypeScript checks
- **build-test**: Production build verification
- **status-check**: Aggregates all job results

**Required Secrets:**

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

### 2. Performance Audit (`.github/workflows/performance.yml`)

**Triggers:** Pull requests, pushes to `main`, manual dispatch

**Features:**

- Lighthouse CI integration
- Performance budgets enforcement
- Scores threshold: ≥90 for Performance, Accessibility, Best Practices, SEO

**Budgets:**

- First Contentful Paint: <1.8s
- Speed Index: <3.4s
- Largest Contentful Paint: <2.5s
- Total Blocking Time: <300ms
- Cumulative Layout Shift: <0.1

### 3. Deploy to Production (`.github/workflows/deploy.yml`)

**Triggers:**

- Pushes to `main`
- Git tags matching `v*.*.*`
- Manual dispatch

**Jobs:**

1. **validate-tag**: Ensures semantic versioning (vX.Y.Z)
2. **deploy-supabase**: Deploys Edge Functions
3. **deploy-frontend**: Builds and deploys to Lovable
4. **create-release**: Creates GitHub release (tags only)
5. **notify-deployment**: Sends deployment notifications

**Required Secrets:**

- `SUPABASE_PROJECT_REF`
- `SUPABASE_ACCESS_TOKEN`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `LOVABLE_API_KEY` (if using Lovable CLI)

### 4. Emergency Rollback (`.github/workflows/rollback.yml`)

**Trigger:** Manual workflow dispatch only

**Inputs:**

- `target_version`: Git tag to rollback to (e.g., v0.2.1)
- `reason`: Explanation for rollback

**Process:**

1. Validates target version exists
2. Rolls back Edge Functions to target version
3. Rolls back frontend to target version
4. Verifies rollback success
5. Creates incident report
6. Sends notifications

### 5. PR Quality Report (`.github/workflows/pr-comment.yml`)

**Trigger:** PR opened, synchronized, or reopened

**Features:**

- Auto-posts quality checklist to PRs
- Security scan results
- Build size analysis
- Breaking change detection
- Manual verification checklist

---

## Feature Flags System

### Database Schema

**Table:** `feature_flags`

```sql
CREATE TABLE feature_flags (
  name TEXT PRIMARY KEY,
  enabled BOOLEAN DEFAULT false,
  rollout_percentage INTEGER DEFAULT 0,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Available Flags

| Flag Name              | Description           | Default    |
| ---------------------- | --------------------- | ---------- |
| `LLM_MENTOR_ENABLED`   | AI-powered mentorship | false, 0%  |
| `LLM_FAQ_ENABLED`      | AI-powered FAQ        | false, 0%  |
| `SQUADS_WRITE_ENABLED` | Squad management      | true, 100% |
| `ACHIEVEMENTS_ENABLED` | Achievement tracking  | true, 100% |
| `PAYMENTS_ENABLED`     | Premium payments      | false, 0%  |
| `ANALYTICS_ENABLED`    | User analytics        | true, 100% |

### Usage in Edge Functions

```typescript
import { checkFeatureFlag } from '../_shared/feature-flags.ts';

// Check if enabled for all users
const isEnabled = await checkFeatureFlag('LLM_MENTOR_ENABLED');

// Check with percentage-based rollout
const isEnabledForUser = await checkFeatureFlag('LLM_MENTOR_ENABLED', userId);
```

### Rollout Strategy

**Phase 1: Internal Testing (0%)**

```sql
UPDATE feature_flags
SET enabled = true, rollout_percentage = 0
WHERE name = 'LLM_MENTOR_ENABLED';
-- Only manual testing, no production users
```

**Phase 2: Canary (5%)**

```sql
UPDATE feature_flags
SET rollout_percentage = 5
WHERE name = 'LLM_MENTOR_ENABLED';
-- 5% of users see the feature
```

**Phase 3: Gradual Expansion (25%)**

```sql
UPDATE feature_flags
SET rollout_percentage = 25
WHERE name = 'LLM_MENTOR_ENABLED';
```

**Phase 4: Full Rollout (100%)**

```sql
UPDATE feature_flags
SET rollout_percentage = 100
WHERE name = 'LLM_MENTOR_ENABLED';
```

### Audit Trail

All feature flag changes are logged in `feature_flag_audit` table:

- Previous and new values
- User who made the change
- Timestamp

---

## Performance Monitoring

### Bundle Size Tracking

**Targets:**

- Total dist/ size: <5MB
- Individual chunks: <500KB
- Vendor chunks optimally split

**Current Split:**

```javascript
{
  'vendor-react': ['react', 'react-dom', 'react-router-dom'],
  'vendor-ui': ['lucide-react', '@radix-ui/*'],
  'vendor-supabase': ['@supabase/supabase-js'],
  'vendor-charts': ['recharts'],
  'vendor-forms': ['react-hook-form', '@hookform/resolvers', 'zod']
}
```

### Lighthouse Monitoring

**Automated Checks:**

- Every PR
- Every push to main
- Manual trigger available

**Artifacts:**

- Performance reports uploaded to GitHub
- Available for 7 days
- Publicly shareable links

---

## Deployment Process

### Standard Deployment

**For Regular Changes:**

1. Create feature branch from `main`
2. Make changes
3. Commit (pre-commit hooks run)
4. Push (pre-push hooks run)
5. Open PR
6. Wait for CI checks
7. Get 1 approval
8. Merge to `main`
9. Automatic deployment triggers

### Release Deployment

**For Versioned Releases:**

1. Update `CHANGELOG.md`
2. Commit changelog
3. Create and push tag:
   ```bash
   git tag -a v1.2.3 -m "Release v1.2.3"
   git push origin v1.2.3
   ```
4. GitHub Actions deploys and creates release

### Edge Functions Deployment

Edge Functions are deployed automatically when:

- `main` branch is updated
- A version tag is pushed

**Manual Deployment:**

```bash
# Deploy single function
supabase functions deploy chat --project-ref YOUR_PROJECT_REF

# Deploy all functions
supabase functions deploy --project-ref YOUR_PROJECT_REF
```

---

## Rollback Procedures

### Automatic Rollback (Not Implemented)

Currently, rollbacks are manual. Consider implementing automatic rollback if:

- Error rate >5% for 5 minutes
- Response time >5s for 5 minutes
- Health check failures

### Manual Rollback

**Via GitHub Actions:**

1. Go to Actions → Emergency Rollback
2. Click "Run workflow"
3. Enter target version (e.g., `v0.2.1`)
4. Enter reason
5. Confirm

**Via CLI:**

```bash
# Rollback Edge Functions
git checkout v0.2.1
supabase functions deploy --project-ref YOUR_PROJECT_REF

# Rollback Frontend
git checkout v0.2.1
npm ci
npm run build
# Deploy to Lovable manually
```

---

## Quality Gates

### Pre-Merge Requirements

**Automated:**

- ✅ Security scan passes (no secrets)
- ✅ ESLint passes (warnings allowed)
- ✅ TypeScript type check passes
- ✅ Production build succeeds
- ✅ Bundle size within limits

**Manual:**

- ✅ 1 code review approval
- ✅ No console errors in browser
- ✅ Lighthouse scores ≥90
- ✅ WCAG violations <5
- ✅ Mobile responsive tested
- ✅ Cross-browser tested

### Deployment Gates

**Production Deployment Blocked If:**

- Any CI check fails
- Security vulnerabilities (high/critical)
- Missing environment variables
- Invalid version tag format

### Emergency Bypass

**When to Use:**

- Critical security fix
- Production outage
- Data loss risk

**Process:**

1. Get approval from 2 team members
2. Document reason in incident report
3. Use `--no-verify` for hooks
4. Merge with admin override
5. Monitor production closely
6. Create follow-up PR to fix properly

---

## Monitoring & Alerts

### Current Monitoring

- **GitHub Actions**: All workflow runs
- **Supabase Dashboard**: Edge Function logs
- **Lighthouse CI**: Performance trends

### Recommended External Monitoring

1. **Uptime Monitoring**: UptimeRobot, Pingdom
   - Monitor: `https://www.robuxminer.pro/`
   - Check interval: 5 minutes

2. **Error Tracking**: Sentry, LogRocket
   - Track frontend errors
   - Track Edge Function errors

3. **Performance Monitoring**: Vercel Analytics, CloudFlare Analytics
   - Real User Monitoring (RUM)
   - Core Web Vitals

4. **Notifications**: Slack, Discord
   - Deployment notifications
   - CI failure alerts
   - Performance degradation warnings

---

## Troubleshooting

### CI Checks Failing

**Secret Detection:**

```bash
# Find accidental secrets
grep -r "sk-proj-\|SUPABASE_SERVICE" .
# Remove and re-commit
```

**Build Failures:**

```bash
# Clear caches
rm -rf node_modules dist
npm ci
npm run build
```

**Type Errors:**

```bash
# Check specific file
npx tsc --noEmit src/path/to/file.ts
```

### Deployment Issues

**Edge Functions Not Deploying:**

```bash
# Check Supabase CLI auth
supabase --version
supabase login

# Verify project ref
echo $SUPABASE_PROJECT_REF
```

**Build Timeout:**

- Increase timeout in workflow file
- Check for infinite loops
- Optimize imports

### Rollback Not Working

1. Verify tag exists: `git tag -l`
2. Check workflow permissions
3. Verify secrets are set
4. Check Supabase access token validity

---

## Best Practices

1. **Never commit secrets** - Use environment variables
2. **Always test locally** - Run `npm run test:smoke` before pushing
3. **Keep PRs small** - Easier to review and rollback
4. **Update CHANGELOG** - For every release
5. **Use feature flags** - For risky changes
6. **Monitor after deploy** - Watch for errors for 10 minutes
7. **Document decisions** - In PR descriptions
8. **Follow semantic versioning** - vMAJOR.MINOR.PATCH

---

## Quick Reference

### Common Commands

```bash
# Local development
npm run dev                 # Start dev server
npm run build              # Production build
npm run lint               # Run linter
npm run lint:fix           # Auto-fix linting issues
npm run type-check         # TypeScript check
npm run test:smoke         # Pre-push checks

# Git workflow
git checkout -b feature/my-feature
git commit -m "feat: add new feature"
git push origin feature/my-feature

# Release workflow
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0

# Supabase
supabase functions deploy FUNCTION_NAME
supabase db push           # Apply migrations
```

### Required Secrets

**GitHub Repository Secrets:**

- `SUPABASE_PROJECT_REF`
- `SUPABASE_ACCESS_TOKEN`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `LOVABLE_API_KEY` (optional)

---

## Support

For issues or questions:

1. Check this documentation
2. Review workflow logs in GitHub Actions
3. Check Supabase dashboard logs
4. Create an issue in GitHub

---

_Last Updated: 2025-01-07_
_Pipeline Version: 1.0.0_
