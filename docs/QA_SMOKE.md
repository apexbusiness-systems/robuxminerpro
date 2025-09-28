# QA Smoke Testing

## Pre-Deploy Checklist

### Endpoint Checks (curl -I)
```bash
curl -I https://staging.domain.com/
curl -I https://staging.domain.com/features  
curl -I https://staging.domain.com/robots.txt
curl -I https://staging.domain.com/sitemap.xml
curl -I https://staging.domain.com/healthz
```

All should return **200 OK**.

### Manual Clickthrough
- [ ] Homepage loads without errors
- [ ] Navigation works (all menu items)
- [ ] Forms submit properly
- [ ] Mobile responsive design
- [ ] **No console errors**

### Browser Console
Open DevTools → Console tab. Verify:
- No red error messages
- No 404 network requests
- No JavaScript exceptions

## Post-Deploy Verification
- [ ] Production domain accessible
- [ ] SSL certificate valid
- [ ] All routes return 200