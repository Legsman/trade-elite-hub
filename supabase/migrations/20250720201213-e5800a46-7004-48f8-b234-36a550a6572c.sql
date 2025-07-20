
-- Update the proxy_place_or_update_bid function to check auction expiry
CREATE OR REPLACE FUNCTION public.proxy_place_or_update_bid(p_listing_id uuid, p_bid_id uuid, p_user_id uuid, p_new_maximum numeric)
 RETURNS TABLE(listing_id uuid, new_current_bid numeric, highest_bidder_id uuid, is_highest_bidder boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_increment      NUMERIC;
  v_starting_price NUMERIC;
  v_expires_at     TIMESTAMP WITH TIME ZONE;
  v_status         TEXT;
  v_highest        NUMERIC := NULL;
  v_second         NUMERIC := NULL;
  v_winner         UUID;
  rec              RECORD;
BEGIN
  -- 1) Lock to prevent concurrent races
  PERFORM pg_advisory_xact_lock(hashtext(p_listing_id::text));

  -- 2) Load listing details and check if auction has expired
  SELECT l.price, l.bid_increment, l.expires_at, l.status
    INTO v_starting_price, v_increment, v_expires_at, v_status
  FROM public.listings AS l
  WHERE l.id = p_listing_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Listing not found' USING ERRCODE = 'P0002';
  END IF;
  
  -- Check if auction has expired
  IF v_expires_at <= now() THEN
    RAISE EXCEPTION 'Auction has ended' USING ERRCODE = 'P0003';
  END IF;
  
  -- Check if listing is not active
  IF v_status != 'active' THEN
    RAISE EXCEPTION 'Auction is no longer active' USING ERRCODE = 'P0004';
  END IF;
  
  IF v_increment IS NULL OR v_increment <= 0 THEN
    v_increment := 5;
  END IF;

  -- 3) Insert or update the user's own bid
  IF p_bid_id IS NULL THEN
    INSERT INTO public.bids(listing_id, user_id, amount, maximum_bid, status, bid_increment)
    VALUES (p_listing_id, p_user_id, p_new_maximum, p_new_maximum, 'active', v_increment)
    RETURNING id INTO p_bid_id;
  ELSE
    UPDATE public.bids AS b
    SET maximum_bid = p_new_maximum,
        updated_at   = now()
    WHERE b.id = p_bid_id
      AND b.user_id = p_user_id
    RETURNING id INTO p_bid_id;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Not your bid' USING ERRCODE = 'P0001';
    END IF;
  END IF;

  -- 4) Find the top two maximum_bid values
  FOR rec IN
    SELECT b.maximum_bid, b.user_id
      FROM public.bids AS b
     WHERE b.listing_id = p_listing_id
       AND b.status     = 'active'
     ORDER BY b.maximum_bid DESC, b.updated_at ASC
     LIMIT 2
  LOOP
    IF v_highest IS NULL THEN
      v_highest := rec.maximum_bid;
      v_winner  := rec.user_id;
    ELSE
      v_second := rec.maximum_bid;
    END IF;
  END LOOP;

  -- 5) If only one bidder, use starting price as "second highest"
  IF v_second IS NULL THEN
    v_second := v_starting_price;
  END IF;

  -- 6) Compute the new visible bid
  new_current_bid   := LEAST(v_highest, v_second + v_increment);
  highest_bidder_id := v_winner;
  is_highest_bidder := (v_winner = p_user_id);
  listing_id        := p_listing_id;

  -- 7) Belt-and-suspenders: update the listings table directly
  UPDATE public.listings AS l
     SET current_bid       = new_current_bid,
         highest_bidder_id = v_winner
   WHERE l.id = p_listing_id;

  RETURN NEXT;
END;
$function$;

-- Create a function to automatically update expired listings status
CREATE OR REPLACE FUNCTION public.update_expired_auction_status()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- If this is an auction that has expired but status is still active, update it
  IF NEW.type = 'auction' AND NEW.status = 'active' AND NEW.expires_at <= now() THEN
    NEW.status := 'expired';
    NEW.updated_at := now();
  END IF;
  RETURN NEW;
END;
$function$;

-- Create trigger to automatically update status on any listing access
DROP TRIGGER IF EXISTS trigger_update_expired_auction_status ON public.listings;
CREATE TRIGGER trigger_update_expired_auction_status
  BEFORE UPDATE ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_expired_auction_status();

-- Create a trigger to prevent bids on expired auctions at the database level
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
  
  -- Prevent bid if auction has expired or is not active
  IF v_expires_at <= now() THEN
    RAISE EXCEPTION 'Cannot place bid: auction has ended' USING ERRCODE = 'P0003';
  END IF;
  
  IF v_status != 'active' THEN
    RAISE EXCEPTION 'Cannot place bid: auction is not active' USING ERRCODE = 'P0004';
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger to prevent bids on expired listings
DROP TRIGGER IF EXISTS trigger_prevent_bids_on_expired_auctions ON public.bids;
CREATE TRIGGER trigger_prevent_bids_on_expired_auctions
  BEFORE INSERT ON public.bids
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_bids_on_expired_auctions();
