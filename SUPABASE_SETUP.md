# How to Create a New Supabase Project

## Step 1: Create Project
1. Go to https://supabase.com/dashboard
2. Click **"New Project"**
3. Choose these settings:
   - **Name**: Historical Chatboard
   - **Database Password**: (create a strong password)
   - **Region**: Choose closest to you (India: ap-south-1)
   - **Pricing Plan**: Free

## Step 2: Wait for Setup
- Takes 2-3 minutes for project to be ready
- You'll see a loading screen

## Step 3: Get Your Credentials

Once ready, go to **Settings** → **API**:

1. **Project URL**: Copy this (looks like `https://xxxxx.supabase.co`)
2. **anon/public key**: Copy the `anon` `public` key

## Step 4: Update Your .env File

Replace these values in your `.env`:

```
VITE_SUPABASE_PROJECT_ID="xxxxx"
VITE_SUPABASE_URL="https://xxxxx.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGc..."
```

## Step 5: Run the Migration

In your terminal:
```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Login
supabase login

# Link your new project
supabase link --project-ref YOUR_NEW_PROJECT_ID

# Run migrations
supabase db push
```

OR use the Supabase SQL Editor:

1. Go to **SQL Editor** in dashboard
2. Copy contents of `supabase/migrations/20250930160350_b9087dc1-e9ce-4f26-b940-35404a1bfe47.sql`
3. Paste and click **Run**

## Step 6: Restart Dev Server

```bash
npm run dev
```

## Step 7: Seed Personalities

Visit `http://localhost:8080/seed` and click "Start Seeding"

---

You're all set! 🎉
