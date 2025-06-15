
-- 1. Create the listing_views table for logging individual views and deduplication
CREATE TABLE IF NOT EXISTS public.listing_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL,
  user_id UUID,
  ip_address TEXT,
  user_agent TEXT,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Add indexes for performance (same as before)
CREATE INDEX IF NOT EXISTS idx_listing_views_listing ON public.listing_views(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_views_listing_user_time ON public.listing_views(listing_id, user_id, viewed_at);
CREATE INDEX IF NOT EXISTS idx_listing_views_listing_ip_time ON public.listing_views(listing_id, ip_address, viewed_at);

-- 3. Create the increment_views function for atomic view updates
CREATE OR REPLACE FUNCTION public.increment_views(l_id uuid)
RETURNS TABLE(listing_id uuid, new_views integer) 
LANGUAGE plpgsql
AS $$
DECLARE
  updated_row RECORD;
BEGIN
  UPDATE listings
  SET views = views + 1
  WHERE id = l_id
  RETURNING id, views INTO updated_row;

  RETURN QUERY SELECT updated_row.id, updated_row.views;
END;
$$;

-- 4. Enable RLS and add correct policies
ALTER TABLE public.listing_views ENABLE ROW LEVEL SECURITY;

-- Correct policy for INSERT (with CHECK only, no USING)
CREATE POLICY "Allow all inserts to listing_views" 
  ON public.listing_views
  FOR INSERT 
  WITH CHECK (true);

-- Allow SELECT for all (optional)
CREATE POLICY "Allow all select to listing_views"
  ON public.listing_views
  FOR SELECT
  USING (true);
