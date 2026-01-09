-- Add audio_url column to messages table for Google TTS integration
-- Run this SQL in Supabase SQL Editor

ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS audio_url TEXT;

COMMENT ON COLUMN public.messages.audio_url IS 'URL to Google TTS generated audio file stored in Supabase Storage';
