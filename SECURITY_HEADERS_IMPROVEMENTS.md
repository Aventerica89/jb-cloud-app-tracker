# Security Headers Improvements

## Summary

Enhanced `next.config.ts` with environment-aware security headers to address CSP weaknesses while maintaining Next.js functionality.

## Changes Made

### 1. Environment-Aware Configuration

**Before**: Static headers applied to all environments
**After**: Dynamic headers based on `NODE_ENV`

```typescript
const isDevelopment = process.env.NODE_ENV === 'development';
const getSecurityHeaders = () => { /* ... */ };
```

**Benefits**:
- Development: Permissive CSP for dev tools (React DevTools, hot reload)
- Production: Strict CSP without `unsafe-eval`

### 2. Strengthened Content-Security-Policy

#### Development CSP
```
script-src 'self' 'unsafe-eval' 'unsafe-inline'
```
- Allows eval for webpack/hot reload
- Allows inline scripts for dev tools

#### Production CSP
```
script-src 'self' 'unsafe-inline'
```
- **Removed `unsafe-eval`** (major security improvement)
- Kept `unsafe-inline` (required for Next.js script tags)
- Added `upgrade-insecure-requests` directive

**Why `unsafe-inline` is still needed**:
- Next.js injects inline `<script>` tags for hydration
- Tailwind CSS uses inline styles
- shadcn/ui components use inline styles
- Future improvement: Use nonces (requires middleware)

#### Added API endpoints to `connect-src`
```
https://api.github.com
https://api.cloudflare.com
https://api.vercel.com
https://api.anthropic.com
```
- Aligns with app's external integrations
- Production-only (dev uses wildcards)

#### Restricted `img-src` in production
**Before**: `https:` (allows any HTTPS image)
**After**: `https://www.google.com` (only Google Favicons API)

### 3. Enhanced Permissions-Policy

**Before**: `camera=(), microphone=(), geolocation=()`
**After**: Added 7 more restricted permissions:
```
interest-cohort=()    # Blocks FLoC tracking
payment=()
usb=()
bluetooth=()
magnetometer=()
gyroscope=()
accelerometer=()
```

**Why**: App doesn't use these features, so block them entirely

### 4. Environment-Specific HSTS

**Before**: Applied in all environments
**After**: Production-only

```typescript
if (!isDevelopment) {
  headers.push({
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  });
}
```

**Why**: HSTS breaks local HTTP development

**Changes**:
- Increased `max-age` from 1 year to 2 years (63072000s)
- Added `preload` flag for HSTS preload list submission

### 5. Improved Source Pattern

**Before**: `source: '/(.*)'`
**After**: `source: '/:path*'`

**Why**: Next.js-native pattern matching (cleaner, more idiomatic)

## Security Improvements

| Issue | Before | After | Impact |
|-------|--------|-------|--------|
| XSS via eval | `unsafe-eval` in prod | Removed in prod | **High** - Blocks eval-based attacks |
| Image injection | Any HTTPS image | Google favicons only | **Medium** - Prevents external image exploits |
| Permission abuse | 3 permissions blocked | 10 permissions blocked | **Low** - Defense in depth |
| HSTS in dev | Enabled | Disabled | **Dev UX** - No local HTTPS required |
| API endpoints | Wildcards | Explicit allowlist | **Medium** - Reduces attack surface |

## Testing Checklist

- [ ] Run `npm run dev` - Verify no CSP violations in console
- [ ] Run `npm run build` - Verify production build succeeds
- [ ] Test Google Favicons load (app detail page)
- [ ] Test Supabase connections (login, data fetch)
- [ ] Test external API calls:
  - [ ] GitHub import (`/api/import-github`)
  - [ ] Vercel sync (`/api/deployments/sync`)
  - [ ] Cloudflare sync (`/api/deployments/sync`)
  - [ ] Claude sessions (`/api/sessions`)
- [ ] Check browser DevTools for CSP violations
- [ ] Verify HSTS header only in production (`curl -I https://prod-domain.com`)

## Known Limitations

### Cannot Remove `unsafe-inline` Yet

**Why**: Next.js requires inline scripts for:
- Client-side hydration
- Script loader (`next/script`)
- Dynamic imports

**Future mitigation**: Implement CSP nonces via middleware
```typescript
// middleware.ts (future implementation)
export function middleware(request: NextRequest) {
  const nonce = generateNonce();
  const csp = `script-src 'self' 'nonce-${nonce}'`;
  // Inject nonce into HTML
}
```

### Tailwind/shadcn Inline Styles

**Why**: `style-src 'unsafe-inline'` needed for:
- Tailwind's JIT mode
- Radix UI component styles
- Framer Motion inline animations

**Future mitigation**: Use `'nonce-{value}'` for inline styles

## Deployment Notes

### Vercel
1. Headers are applied automatically (no additional config needed)
2. Vercel's edge network respects `async headers()` in Next.js config
3. Verify CSP in deployment logs

### Environment Variables
No new env vars required. Uses existing `NODE_ENV` (set by Next.js).

### Production Checklist
- [ ] Ensure `NODE_ENV=production` is set (Next.js does this automatically)
- [ ] Test HTTPS redirect (HSTS)
- [ ] Submit to HSTS preload list: https://hstspreload.org (optional)
- [ ] Monitor browser console for CSP violations
- [ ] Set up CSP violation reporting (future enhancement):
  ```
  report-uri /api/csp-report
  report-to csp-endpoint
  ```

## References

- [Next.js Security Headers](https://nextjs.org/docs/app/building-your-application/configuring/security-headers)
- [CSP Best Practices](https://content-security-policy.com/)
- [OWASP Secure Headers Project](https://owasp.org/www-project-secure-headers/)
- [Permissions-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Permissions-Policy)

## Next Steps (Future Improvements)

1. **Implement CSP nonces** (requires middleware + HTML injection)
2. **Set up CSP violation reporting** (`report-uri` directive)
3. **Add Subresource Integrity (SRI)** for CDN scripts (if any)
4. **Consider `Strict-CSP`** pattern with hash-based allowlisting
5. **Monitor CSP violations** via logging/analytics
