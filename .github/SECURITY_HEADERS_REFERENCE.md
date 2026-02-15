# Security Headers Quick Reference

## TL;DR

✅ **Removed `unsafe-eval` from production CSP** (major XSS protection)
✅ **Environment-aware headers** (dev-friendly, prod-secure)
✅ **Explicit API allowlist** (reduced attack surface)
✅ **Enhanced Permissions-Policy** (10 permissions blocked)

## File Changed

`next.config.ts` - All security headers are configured here

## Quick Checks

### Development Mode
```bash
npm run dev
# Open browser console → Should see NO CSP violations
```

### Production Mode
```bash
npm run build
npm start
# Open browser console → Should see NO CSP violations
```

### Production Headers (curl)
```bash
curl -I https://your-domain.com
# Look for:
# - Content-Security-Policy: (should NOT have unsafe-eval)
# - Strict-Transport-Security: max-age=63072000
# - Permissions-Policy: camera=(), microphone=(), etc.
```

## Common CSP Violations (How to Fix)

### "Refused to load image from X"
**Cause**: Image source not in `img-src` allowlist
**Fix**: Add domain to `img-src` in production CSP (line 69)

### "Refused to connect to X"
**Cause**: API endpoint not in `connect-src` allowlist
**Fix**: Add API domain to `connect-src` in production CSP (line 71)

### "Refused to execute inline script"
**Cause**: CSP is too strict OR unsafe-inline was removed
**Fix**: Don't remove `unsafe-inline` from `script-src` (Next.js requires it)

### "Refused to evaluate string as JavaScript"
**Cause**: Code uses `eval()`, `Function()`, or `setTimeout(string)`
**Fix**: Refactor to avoid eval (use JSON.parse, Function constructors, etc.)

## Adding New External Services

### Example: Add Stripe API

1. Open `next.config.ts`
2. Find production `connect-src` (line 71)
3. Add `https://api.stripe.com`:
   ```typescript
   "connect-src 'self' https://*.supabase.co ... https://api.stripe.com",
   ```
4. If Stripe loads images, add to `img-src` (line 69):
   ```typescript
   "img-src 'self' data: https://www.google.com https://images.stripe.com",
   ```

### Example: Add Firebase

1. Add Firebase domains to `connect-src`:
   ```typescript
   "connect-src 'self' ... https://*.googleapis.com https://*.firebaseio.com",
   ```
2. Add Firebase images to `img-src`:
   ```typescript
   "img-src 'self' data: https://www.google.com https://firebasestorage.googleapis.com",
   ```

## Environment Variables

None required! Headers use `process.env.NODE_ENV` (set by Next.js).

## Testing Matrix

| Feature | Dev CSP | Prod CSP | Expected |
|---------|---------|----------|----------|
| React DevTools | ✅ Allow | ❌ Block | Normal (DevTools are dev-only) |
| Hot Module Reload | ✅ Allow | N/A | Works in dev |
| Supabase Auth | ✅ Allow | ✅ Allow | ✅ Works everywhere |
| Supabase DB | ✅ Allow | ✅ Allow | ✅ Works everywhere |
| GitHub API | ✅ Allow | ✅ Allow | ✅ Works everywhere |
| Vercel API | ✅ Allow | ✅ Allow | ✅ Works everywhere |
| Cloudflare API | ✅ Allow | ✅ Allow | ✅ Works everywhere |
| Anthropic API | ✅ Allow | ✅ Allow | ✅ Works everywhere |
| Google Favicons | ✅ Allow | ✅ Allow | ✅ Works everywhere |
| Random HTTPS image | ✅ Allow | ❌ Block | Expected (prod is strict) |
| `eval()` calls | ✅ Allow | ❌ Block | Expected (prod is strict) |

## Known Limitations

### Cannot Remove `unsafe-inline`
- **Why**: Next.js requires inline scripts for hydration
- **Risk**: Medium (mitigated by input validation with Zod)
- **Future**: Implement nonce-based CSP via middleware

### Development Is Permissive
- **Why**: Dev tools (React DevTools, hot reload) need `unsafe-eval`
- **Risk**: Low (local environment only)
- **Mitigation**: Never deploy with `NODE_ENV=development`

## Security Checklist (for PRs)

- [ ] No new `eval()`, `Function()`, or `setTimeout(string)` calls
- [ ] External APIs added to `connect-src` allowlist
- [ ] External images added to `img-src` allowlist
- [ ] User input validated with Zod (prevents injection)
- [ ] No hardcoded secrets (use env vars)
- [ ] Test in both dev and production mode

## Rollback Plan

If security headers break production:

1. **Quick fix** (allow everything):
   ```typescript
   // In next.config.ts, temporarily set:
   const cspDirectives = [
     "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: https:",
   ];
   ```

2. **Deploy rollback**:
   ```bash
   git revert <commit-hash>
   git push
   ```

3. **Debug**:
   - Check browser console for CSP violations
   - Check Network tab for blocked requests
   - Compare dev vs prod CSP in DevTools → Network → Headers

## Resources

- **This PR**: See `SECURITY_HEADERS_IMPROVEMENTS.md` for full details
- **Comparison**: See `SECURITY_COMPARISON.md` for before/after
- **Next.js Docs**: https://nextjs.org/docs/app/building-your-application/configuring/security-headers
- **CSP Evaluator**: https://csp-evaluator.withgoogle.com
- **Mozilla Observatory**: https://observatory.mozilla.org
- **SecurityHeaders.com**: https://securityheaders.com

## Support

Questions? Check:
1. Browser console for CSP violation details
2. `SECURITY_HEADERS_IMPROVEMENTS.md` for comprehensive docs
3. `next.config.ts` comments (lines 56, 67-68)
4. GitHub issues (tag @YourUsername)
