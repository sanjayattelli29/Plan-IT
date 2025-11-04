-- Add completed field to events table
ALTER TABLE public.events
ADD COLUMN completed BOOLEAN DEFAULT false,
ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE;