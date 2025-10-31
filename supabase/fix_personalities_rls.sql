-- Fix RLS policies for personalities table
-- This allows anyone to insert personalities (for seeding purposes)

-- Drop the existing SELECT policy and recreate with INSERT permissions
DROP POLICY IF EXISTS "Personalities are viewable by everyone" ON public.personalities;

-- Allow everyone to SELECT personalities
CREATE POLICY "Personalities are viewable by everyone"
  ON public.personalities FOR SELECT
  USING (true);

-- Allow anyone to INSERT personalities (needed for seeding)
CREATE POLICY "Anyone can insert personalities"
  ON public.personalities FOR INSERT
  WITH CHECK (true);

-- Optional: Allow anyone to UPDATE personalities (if you want to allow updates)
CREATE POLICY "Anyone can update personalities"
  ON public.personalities FOR UPDATE
  USING (true);
