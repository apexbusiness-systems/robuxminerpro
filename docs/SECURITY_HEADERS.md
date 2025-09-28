# Security Headers & CSP

## Required Headers

### Content Security Policy (CSP)
```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; frame-ancestors 'self'
```

### Additional Security Headers
- **Referrer-Policy**: `no-referrer-when-downgrade`
- **X-Content-Type-Options**: `nosniff`
- **Permissions-Policy**: `camera=(), microphone=(), geolocation=()`
- **Cross-Origin-Opener-Policy**: `same-origin` (if applicable)
- **Cross-Origin-Embedder-Policy**: `require-corp` (if applicable)

## Host Configuration

These headers are typically configured at the hosting/CDN level:
- Lovable Cloud: Managed automatically
- Custom hosting: Configure in web server (nginx, Apache) or CDN

## Verification Steps

1. Deploy your site
2. Open Chrome DevTools → Network tab
3. Reload page and check response headers
4. Capture screenshot of headers for PR evidence

## Sample CSP String
```
default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https:; frame-ancestors 'self'
```

**Note**: Adjust `'unsafe-eval'` and `'unsafe-inline'` based on framework requirements.

## References
- [OWASP Secure Headers](https://owasp.org/www-project-secure-headers/)
- [MDN CSP Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)