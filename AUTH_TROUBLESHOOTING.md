# 🔧 Authentication Setup & Troubleshooting

## Common Authentication Issues & Fixes

### Issue 1: Email Confirmation Required

**Problem**: Supabase requires email confirmation by default.

**Fix Options:**

#### Option A: Disable Email Confirmation (For Development)
1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/ohnnbywibyccdvpyahlu
2. Navigate to **Authentication** → **Providers** → **Email**
3. Scroll down to **"Confirm email"**
4. Toggle **OFF** "Enable email confirmations"
5. Click **Save**

#### Option B: Use Magic Link (No Password)
Use the magic link sign-in instead of password-based auth.

---

### Issue 2: Auth Policies Not Set

**SQL Fix**: Run this in SQL Editor to ensure auth policies work:

```sql
-- Ensure profiles table has correct policies
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Recreate with proper checks
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Allow service role to bypass (for triggers/functions)
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;
```

---

### Issue 3: SMTP Not Configured

**Problem**: Email confirmation emails not sending.

**Fix**: 
1. Go to **Authentication** → **Settings**
2. Scroll to **SMTP Settings**
3. Either:
   - Configure your own SMTP (Gmail, SendGrid, etc.)
   - OR disable email confirmation (Option A above)

---

### Issue 4: Redirect URL Not Whitelisted

**Fix**:
1. Go to **Authentication** → **URL Configuration**
2. Add these to **Redirect URLs**:
   - `http://localhost:8080/**`
   - `http://localhost:8081/**`
   - `http://localhost:5173/**` (common Vite ports)
3. Click **Save**

---

## Quick Test Steps

### 1. Test Sign Up
```
Email: test@example.com
Password: test123456
```

### 2. Expected Behaviors

**If Email Confirmation is ON:**
- "Check your email for confirmation link"
- Must click link before sign in

**If Email Confirmation is OFF:**
- Immediate sign in
- Redirects to chatboard

### 3. Check Console for Errors
Press F12 → Console tab → Look for red errors

---

## Most Common Fix (Recommended)

**For Development**: Disable email confirmation

1. Dashboard → Authentication → Providers → Email
2. Turn OFF "Confirm email"
3. Save
4. Try signing up again

---

## Alternative: Skip Auth for Testing

If you want to test the chat without auth, I can create a guest mode that bypasses authentication.

Let me know what error you're seeing and I'll help fix it! 🔧
