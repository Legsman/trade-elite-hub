-- Phase 2: Real-time Status Management

-- Create a function to automatically update expired listings on SELECT operations
CREATE OR REPLACE FUNCTION public.auto_update_expired_listings()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Update any expired but still active listings to expired status
  UPDATE public.listings 
  SET status = 'expired', updated_at = now()
  WHERE status = 'active' 
    AND type = 'auction' 
    AND expires_at <= now();
    
  -- For SELECT operations, we just return the original result
  -- The UPDATE above will have already fixed any inconsistencies
  RETURN NULL;
END;
$function$;

-- Create a view that automatically updates expired listings when accessed
CREATE OR REPLACE VIEW public.listings_with_auto_expiry AS
SELECT 
  l.*,
  CASE 
    WHEN l.type = 'auction' AND l.status = 'active' AND l.expires_at <= now() 
    THEN 'expired'::text
    ELSE l.status
  END as current_status
FROM public.listings l;

-- Create a function to get listings with automatic expiry status updates
CREATE OR REPLACE FUNCTION public.get_listings_with_expiry_check()
 RETURNS SETOF public.listings
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- First, update any expired listings
  UPDATE public.listings 
  SET status = 'expired', updated_at = now()
  WHERE status = 'active' 
    AND type = 'auction' 
    AND expires_at <= now();
    
  -- Then return all listings
  RETURN QUERY SELECT * FROM public.listings ORDER BY created_at DESC;
END;
$function$;

-- Create a function to get a single listing with expiry check
CREATE OR REPLACE FUNCTION public.get_listing_with_expiry_check(listing_id uuid)
 RETURNS SETOF public.listings
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- First, update the specific listing if it's expired
  UPDATE public.listings 
  SET status = 'expired', updated_at = now()
  WHERE id = listing_id
    AND status = 'active' 
    AND type = 'auction' 
    AND expires_at <= now();
    
  -- Then return the listing
  RETURN QUERY SELECT * FROM public.listings WHERE id = listing_id;
END;
$function$;

-- Create a monitoring table for failed bid attempts
CREATE TABLE IF NOT EXISTS public.bid_attempt_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  listing_id uuid,
  attempted_amount numeric,
  failure_reason text,
  attempted_at timestamp with time zone DEFAULT now(),
  user_agent text,
  ip_address text
);

-- Enable RLS on bid attempt logs
ALTER TABLE public.bid_attempt_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for bid attempt logs
CREATE POLICY "Admins can view all bid attempt logs" 
ON public.bid_attempt_logs 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

CREATE POLICY "System can insert bid attempt logs" 
ON public.bid_attempt_logs 
FOR INSERT 
WITH CHECK (true);

-- Update the prevent bids trigger to log failed attempts
CREATE OR REPLACE FUNCTION public.prevent_bids_on_expired_auctions()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_expires_at TIMESTAMP WITH TIME ZONE;
  v_status TEXT;
BEGIN
  -- Get the listing's expiry time and status
  SELECT expires_at, status INTO v_expires_at, v_status
  FROM public.listings
  WHERE id = NEW.listing_id;
  
  -- Log failed attempt if auction has expired
  IF v_expires_at <= now() THEN
    INSERT INTO public.bid_attempt_logs (
      user_id, listing_id, attempted_amount, failure_reason
    ) VALUES (
      NEW.user_id, NEW.listing_id, NEW.amount, 'Auction has ended'
    );
    
    RAISE EXCEPTION 'Cannot place bid: auction has ended' USING ERRCODE = 'P0003';
  END IF;
  
  -- Log failed attempt if listing is not active
  IF v_status != 'active' THEN
    INSERT INTO public.bid_attempt_logs (
      user_id, listing_id, attempted_amount, failure_reason
    ) VALUES (
      NEW.user_id, NEW.listing_id, NEW.amount, 'Auction is not active'
    );
    
    RAISE EXCEPTION 'Cannot place bid: auction is not active' USING ERRCODE = 'P0004';
  END IF;
  
  RETURN NEW;
END;
$function$;