# Post-Publish Evidence Bundle Checklist

## PROMPT 8 - SPA Fallback Check

**Verification Commands** (run after publish):
```bash
# Test deep routes return 200 with index.html
curl -I https://www.robuxminer.pro/features
curl -I https://www.robuxminer.pro/pricing  
curl -I https://www.robuxminer.pro/status
curl -I https://www.robuxminer.pro/learn
curl -I https://www.robuxminer.pro/events
curl -I https://www.robuxminer.pro/payments
```

**Expected**: All should return `HTTP/1.1 200 OK` and serve the React app shell.
**Action if 404**: Configure host to serve `index.html` for all routes.

## PROMPT 9 - Evidence Bundle Requirements

### 1. Lighthouse Performance Tests
- [ ] Desktop Lighthouse audit with Performance ≥90, Best Practices ≥90, SEO ≥90
- [ ] Mobile Lighthouse audit with Performance ≥90, Best Practices ≥90, SEO ≥90  
- [ ] Export both as JSON and save to PR
- [ ] Screenshot Lighthouse results

**Commands**:
```bash
# Chrome DevTools → Lighthouse → Desktop → Export JSON
# Chrome DevTools → Lighthouse → Mobile → Export JSON
```

### 2. Robots/Sitemap Verification
Run and save outputs:
```bash
curl -I https://www.robuxminer.pro/
curl -I https://www.robuxminer.pro/robots.txt
curl -I https://www.robuxminer.pro/sitemap.xml
```

**Expected Results**:
- `/` returns 200 with `text/html` content-type
- `/robots.txt` returns 200 with `text/plain` content-type
- `/sitemap.xml` returns 200 with `application/xml` content-type

### 3. WCAG Accessibility Check
- [ ] Focus order test: Tab through all interactive elements
- [ ] Labels test: Verify all form inputs have proper labels
- [ ] Contrast check: Screenshot color contrast tool results
- [ ] Screen reader test: Verify heading hierarchy and landmarks
- [ ] Keyboard navigation: Ensure all features work without mouse

### 4. Security Headers Analysis
- [ ] Use security headers analyzer (securityheaders.com or observatory.mozilla.org)
- [ ] Screenshot showing headers analysis
- [ ] Verify CSP, X-Content-Type-Options, Referrer-Policy present

**Expected Headers**:
```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; 
X-Content-Type-Options: nosniff
Referrer-Policy: no-referrer-when-downgrade
```

### 5. PWA Installability Test
- [ ] Chrome → DevTools → Application → Manifest
- [ ] Verify no manifest errors
- [ ] Test "Install App" prompt appears
- [ ] Verify offline functionality (if applicable)

## Files to Attach to PR
1. `lighthouse-desktop.json`
2. `lighthouse-mobile.json` 
3. `lighthouse-screenshots.png`
4. `curl-outputs.txt`
5. `security-headers-screenshot.png`
6. `accessibility-test-notes.md`

## Sign-off Criteria
All checks must pass before PR approval:
- ✅ Lighthouse scores ≥90 for Performance/Best/SEO
- ✅ Deep routes return 200 (SPA fallback working)
- ✅ robots.txt and sitemap.xml accessible  
- ✅ Security headers properly configured
- ✅ WCAG 2.1 AA compliance verified
- ✅ PWA manifest valid and installable