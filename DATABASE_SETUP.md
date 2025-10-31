# 🚀 Setup Your New Supabase Database

## Step 1: Open Supabase SQL Editor

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/ohnnbywibyccdvpyahlu
2. Click on **"SQL Editor"** in the left sidebar
3. Click **"New Query"**

## Step 2: Run the Migration SQL

Copy the **entire contents** of this file:
`supabase/migrations/20250930160350_b9087dc1-e9ce-4f26-b940-35404a1bfe47.sql`

1. Paste it into the SQL Editor
2. Click **"Run"** (or press Ctrl+Enter)
3. Wait for "Success. No rows returned" message

This will create:
- ✅ `profiles` table
- ✅ `personalities` table  
- ✅ `conversations` table
- ✅ `messages` table
- ✅ Row Level Security policies
- ✅ 6 sample personalities (Gandhi, Shivaji, etc.)

## Step 3: Verify Tables Created

1. Click on **"Table Editor"** in left sidebar
2. You should see these tables:
   - profiles
   - personalities
   - conversations
   - messages

## Step 4: Restart Your Dev Server

In your terminal:
```bash
npm run dev
```

## Step 5: Add More Personalities

1. Go to: http://localhost:8080/seed
2. Click **"Start Seeding"**
3. This will add 10 total Indian historical personalities

## Step 6: Test the App!

1. Go to: http://localhost:8080/
2. Click **"Start Your Journey"** or **"Explore as Guest"**
3. Select any personality
4. Start chatting!

---

## ✅ What You'll Have:

### 10 Historical Personalities:
1. Mahatma Gandhi
2. Chhatrapati Shivaji Maharaj
3. Dr. APJ Abdul Kalam
4. Rani Lakshmibai
5. Chanakya
6. Swami Vivekananda
7. Bhagat Singh
8. Savitribai Phule
9. Netaji Subhas Chandra Bose
10. Rani Durgavati

### Features Working:
- ✅ User Authentication
- ✅ Browse personalities
- ✅ Create conversations
- ✅ AI-powered chat with Gemini
- ✅ Message history
- ✅ Personality-specific responses

---

## 🐛 Troubleshooting

### If migration fails:
- Make sure you copied the ENTIRE SQL file
- Check for any syntax errors
- Try running smaller sections if needed

### If personalities don't show:
- Run the migration first
- Then visit `/seed` to add more

---

You're all set! 🎉
