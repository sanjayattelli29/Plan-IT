ALTER TABLE events
ADD COLUMN completed boolean DEFAULT false,
ADD COLUMN completed_at timestamp with time zone;