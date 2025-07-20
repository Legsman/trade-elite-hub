
-- Add new status values for listings
ALTER TYPE listing_status ADD VALUE IF NOT EXISTS 'relisted';

-- Add new status values for bids  
ALTER TYPE bid_status ADD VALUE IF NOT EXISTS 'cancelled_due_to_relist';

-- Add columns to track relist relationships and history
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS original_listing_id UUID REFERENCES public.listings(id),
ADD COLUMN IF NOT EXISTS relist_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS relist_reason TEXT,
ADD COLUMN IF NOT EXISTS relisted_at TIMESTAMP WITH TIME ZONE;

-- Create index for better performance on relist queries
CREATE INDEX IF NOT EXISTS idx_listings_original_listing_id ON public.listings(original_listing_id);
CREATE INDEX IF NOT EXISTS idx_listings_relist_count ON public.listings(relist_count);

-- Add trigger to automatically update relist_count when a new listing is created from an original
CREATE OR REPLACE FUNCTION update_relist_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.original_listing_id IS NOT NULL THEN
    -- Get the relist count from the original listing (or its root if it's also a relist)
    WITH RECURSIVE relist_chain AS (
      SELECT id, original_listing_id, relist_count
      FROM listings 
      WHERE id = NEW.original_listing_id
      
      UNION ALL
      
      SELECT l.id, l.original_listing_id, l.relist_count
      FROM listings l
      INNER JOIN relist_chain rc ON l.id = rc.original_listing_id
    )
    SELECT COALESCE(MAX(relist_count), 0) + 1 INTO NEW.relist_count
    FROM relist_chain;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_relist_count
  BEFORE INSERT ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION update_relist_count();
