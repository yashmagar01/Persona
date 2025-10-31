# Setting Up Gemini AI Integration

## Step 1: Get Your Gemini API Key

1. **Go to Google AI Studio**: [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)

2. **Sign in** with your Google account

3. **Click "Create API Key"**

4. **Copy your API key** (it starts with `AIza...`)

5. **Keep it safe!** Don't share it publicly

## Step 2: Configure Supabase Edge Function

### Option A: Using Supabase Dashboard (Easiest)

1. Go to your Supabase project: https://supabase.com/dashboard/project/oqyqtfyeaxrtbqhdixni

2. Navigate to **Edge Functions** → **Manage secrets**

3. Add a new secret:
   - Key: `GEMINI_API_KEY`
   - Value: Your Gemini API key from Step 1

4. Click **Save**

### Option B: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
# Set the secret
supabase secrets set GEMINI_API_KEY=your_api_key_here

# Verify it's set
supabase secrets list
```

## Step 3: Deploy the Edge Function

### Using Supabase CLI:

```bash
# Login to Supabase
supabase login

# Link your project
supabase link --project-ref oqyqtfyeaxrtbqhdixni

# Deploy the function
supabase functions deploy chat-with-personality
```

### Using Supabase Dashboard:

1. Go to **Edge Functions** in your dashboard
2. Create a new function called `chat-with-personality`
3. Copy the code from `supabase/functions/chat-with-personality/index.ts`
4. Click **Deploy**

## Step 4: Test the Integration

1. Navigate to `/seed` in your app (http://localhost:8080/seed)
2. Click **"Start Seeding"** to add all personalities
3. Go back to the Chatboard (`/chatboard`)
4. Select any personality
5. Start chatting!

## Troubleshooting

### Error: "AI service not configured"
- Make sure `GEMINI_API_KEY` is set in Supabase Edge Function secrets

### Error: "Invalid API key"
- Check if your API key is correct
- Make sure it starts with `AIza`
- Generate a new key if needed

### Error: "Rate limit exceeded"
- Gemini API has free tier limits
- Wait a few minutes and try again
- Consider upgrading your Gemini API plan

### Error: "Function not found"
- Make sure the edge function is deployed
- Check the function name is exactly `chat-with-personality`

## Free Tier Limits

**Gemini API Free Tier:**
- 15 requests per minute
- 1,500 requests per day
- 1 million tokens per minute

This should be plenty for development and testing!

## Cost (if you upgrade later)

**Gemini 1.5 Flash:**
- Input: $0.075 per 1M tokens
- Output: $0.30 per 1M tokens

Very affordable for a production app!

## Alternative: Using Gemini from Frontend

If edge functions are difficult, you can also call Gemini directly from the frontend:

1. Add `VITE_GEMINI_API_KEY` to your `.env` file
2. I can create a frontend implementation that calls Gemini directly
3. Less secure but easier for development

Let me know if you want this alternative!
