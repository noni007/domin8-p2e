
-- Add entry_fee column to tournaments table
ALTER TABLE public.tournaments ADD COLUMN entry_fee INTEGER NOT NULL DEFAULT 0;

-- Add index for better performance when filtering tournaments by entry fee
CREATE INDEX idx_tournaments_entry_fee ON public.tournaments(entry_fee);

-- Update tournament form to include entry fee validation
COMMENT ON COLUMN public.tournaments.entry_fee IS 'Entry fee in cents (e.g., 500 = $5.00)';
