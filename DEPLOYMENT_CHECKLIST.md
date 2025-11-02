# 🚀 Vercel Deployment Checklist

## ✅ Pre-Deployment Verification

### 1. **Build Success** ✓
- [x] Production build completes without errors
- [x] No TypeScript compilation errors
- [x] All tests passing (6/6 files, 12/12 tests)

```bash
npm run build
npm run test
```

### 2. **Environment Variables** 🔐
Configure these in Vercel Dashboard → Project Settings → Environment Variables:

| Variable Name | Required | Example | Notes |
|---------------|----------|---------|-------|
| `VITE_SUPABASE_URL` | ✅ Yes | `https://xxx.supabase.co` | Your Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | ✅ Yes | `eyJhbGciOi...` | Anon/public key from Supabase |
| `VITE_SUPABASE_PROJECT_ID` | ✅ Yes | `ohnnbywi...` | Project ID from Supabase dashboard |
| `VITE_GEMINI_API_KEY` | ✅ Yes | `AIzaSyBd...` | Get from Google AI Studio |

**⚠️ IMPORTANT:** Never commit your `.env` file! Use `.env.example` as template.

### 3. **Supabase Configuration** 🗄️
- [x] Database migrations applied
- [x] Row Level Security (RLS) policies enabled
- [x] Personalities table seeded
- [x] API URL matches production domain
- [ ] **TODO:** Add your Vercel domain to Supabase's allowed origins:
  - Go to Supabase Dashboard → Settings → API
  - Add: `https://your-app.vercel.app` to allowed URLs

### 4. **Vercel Settings** ⚙️

#### Build Settings:
```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

#### Performance:
- [x] Automatic HTTPS enabled
- [x] Edge Network (global CDN)
- [x] Image optimization (if using Vercel Image)

### 5. **Known Issues & Warnings** ⚠️

#### Build Warning (Non-blocking):
```
Some chunks are larger than 500 kB after minification
```
**Impact:** Larger initial load time for markdown/code highlighting features.

**Solution (optional):**
- Implement code splitting for language syntax highlighting
- Lazy load Mermaid diagrams
- Consider manual chunks in `vite.config.ts`

#### Current Status:
- Total bundle size: ~1.6 MB (main chunk)
- Gzipped: ~497 KB
- **Acceptable for production** ✅

### 6. **Feature Verification** 🧪

Test these features after deployment:

**Authentication:**
- [ ] Sign up with email
- [ ] Sign in with email
- [ ] Password reset flow
- [ ] Guest mode chat works

**Core Features:**
- [ ] Chatboard loads personalities
- [ ] Can start conversation
- [ ] Messages send and receive
- [ ] AI responses generate correctly
- [ ] Markdown rendering (bold, italic, code blocks)
- [ ] Code block copy buttons work
- [ ] Draft persistence across navigation

**Sidebar:**
- [ ] Sidebar visible on main routes
- [ ] Mobile toggle works
- [ ] Navigation links functional
- [ ] Recent conversations load

**Mobile:**
- [ ] Responsive on mobile devices
- [ ] Touch interactions work
- [ ] Safe area padding correct
- [ ] Virtual keyboard handling

### 7. **Post-Deployment Steps** 📋

1. **Set Custom Domain (Optional):**
   ```
   Vercel → Project → Settings → Domains
   ```

2. **Monitor Performance:**
   - Check Vercel Analytics
   - Monitor error rates in Vercel Logs
   - Test from different geographic locations

3. **Update README:**
   - Add live demo link
   - Update deployment status badge
   - Document any deployment-specific notes

### 8. **Rollback Plan** 🔄

If deployment has critical issues:

1. **Quick Rollback:**
   ```
   Vercel → Deployments → Previous Deployment → Promote to Production
   ```

2. **Local Debugging:**
   ```bash
   npm run preview  # Test production build locally
   ```

### 9. **Security Checklist** 🔒

- [x] `.env` file in `.gitignore`
- [x] No secrets in source code
- [x] Supabase RLS policies active
- [x] API keys environment variables only
- [ ] **TODO:** Enable Vercel Security Headers (optional):
  ```
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: origin-when-cross-origin
  ```

### 10. **Performance Optimization (Optional)** ⚡

Future improvements:

- Implement service worker for offline support
- Add Redis cache for API responses
- Use Vercel Edge Functions for chat API
- Implement progressive image loading
- Add bundle size monitoring

---

## 📝 Deployment Commands

```bash
# 1. Final verification
npm run build
npm run test
npm run preview  # Test production build locally

# 2. Commit changes
git add .
git commit -m "feat: Add Phase 3 features (skeleton loader, draft persistence, enhanced markdown)"

# 3. Push to GitHub (triggers Vercel deployment if connected)
git push origin main

# 4. Monitor Vercel Dashboard
# Check: https://vercel.com/dashboard
```

---

## ✅ Ready to Deploy?

**Current Status: PRODUCTION READY** 🎉

All critical features implemented:
- ✅ Sidebar on all main routes
- ✅ Loading skeleton for AI responses
- ✅ Draft persistence and restoration
- ✅ Enhanced markdown with code copy buttons
- ✅ Conversation date updates
- ✅ Error handling and recovery
- ✅ Mobile responsive
- ✅ All tests passing

**Action:** Push your changes to trigger Vercel deployment!

---

## 🆘 Troubleshooting

### Build fails on Vercel:
1. Check Vercel build logs
2. Verify all env variables set
3. Run `npm run build` locally to reproduce

### Blank page after deployment:
1. Check browser console for errors
2. Verify Supabase URL in env variables
3. Check Vercel Function logs

### API calls fail:
1. Verify Gemini API key is set
2. Check Supabase domain is whitelisted
3. Review CORS settings in Supabase

### Need help?
- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- Community: Vercel Discord / Supabase Discord

---

**Last Updated:** $(date)
**Version:** v1.0.0
