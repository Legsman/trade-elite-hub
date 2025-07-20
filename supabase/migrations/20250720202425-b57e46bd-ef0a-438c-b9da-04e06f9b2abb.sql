-- Fix Critical Security Vulnerabilities in Auction System

-- 1. Prevent sellers from bidding on their own auctions
CREATE OR REPLACE FUNCTION public.prevent_seller_self_bidding()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_seller_id UUID;
BEGIN
  -- Get the seller ID for this listing
  SELECT seller_id INTO v_seller_id
  FROM public.listings
  WHERE id = NEW.listing_id;
  
  -- Prevent seller from bidding on their own auction
  IF v_seller_id = NEW.user_id THEN
    RAISE EXCEPTION 'Sellers cannot bid on their own auctions' USING ERRCODE = 'P0005';
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger to prevent seller self-bidding
DROP TRIGGER IF EXISTS trigger_prevent_seller_self_bidding ON public.bids;
CREATE TRIGGER trigger_prevent_seller_self_bidding
  BEFORE INSERT OR UPDATE ON public.bids
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_seller_self_bidding();

-- 2. Enhanced bid validation function
CREATE OR REPLACE FUNCTION public.validate_bid_constraints()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_listing RECORD;
  v_current_highest_bid NUMERIC;
BEGIN
  -- Get listing details
  SELECT l.*, 
         COALESCE(l.current_bid, l.price) as effective_current_bid
  INTO v_listing
  FROM public.listings l
  WHERE l.id = NEW.listing_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Listing not found' USING ERRCODE = 'P0002';
  END IF;
  
  -- Validate bid amount is positive
  IF NEW.amount <= 0 OR NEW.maximum_bid <= 0 THEN
    RAISE EXCEPTION 'Bid amounts must be positive' USING ERRCODE = 'P0006';
  END IF;
  
  -- Validate maximum_bid >= amount
  IF NEW.maximum_bid < NEW.amount THEN
    RAISE EXCEPTION 'Maximum bid cannot be less than bid amount' USING ERRCODE = 'P0007';
  END IF;
  
  -- For auctions, validate minimum bid increment
  IF v_listing.type = 'auction' THEN
    IF NEW.amount < v_listing.effective_current_bid + COALESCE(v_listing.bid_increment, 5) THEN
      RAISE EXCEPTION 'Bid must meet minimum increment requirements' USING ERRCODE = 'P0008';
    END IF;
  END IF;
  
  -- Validate listing is still active
  IF v_listing.status != 'active' THEN
    RAISE EXCEPTION 'Cannot bid on inactive listings' USING ERRCODE = 'P0004';
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger for bid validation
DROP TRIGGER IF EXISTS trigger_validate_bid_constraints ON public.bids;
CREATE TRIGGER trigger_validate_bid_constraints
  BEFORE INSERT OR UPDATE ON public.bids
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_bid_constraints();

-- 3. Prevent multiple active bids per user per listing
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_bid_per_user_listing 
ON public.bids (user_id, listing_id) 
WHERE status = 'active';

-- 4. Enhanced proxy_place_or_update_bid with additional security checks
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
  v_seller_id      UUID;
  v_highest        NUMERIC := NULL;
  v_second         NUMERIC := NULL;
  v_winner         UUID;
  rec              RECORD;
BEGIN
  -- 1) Lock to prevent concurrent races
  PERFORM pg_advisory_xact_lock(hashtext(p_listing_id::text));

  -- 2) Load listing details with comprehensive validation
  SELECT l.price, l.bid_increment, l.expires_at, l.status, l.seller_id
    INTO v_starting_price, v_increment, v_expires_at, v_status, v_seller_id
  FROM public.listings AS l
  WHERE l.id = p_listing_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Listing not found' USING ERRCODE = 'P0002';
  END IF;
  
  -- Prevent seller from bidding on own auction
  IF v_seller_id = p_user_id THEN
    RAISE EXCEPTION 'Sellers cannot bid on their own auctions' USING ERRCODE = 'P0005';
  END IF;
  
  -- Check if auction has expired
  IF v_expires_at <= now() THEN
    RAISE EXCEPTION 'Auction has ended' USING ERRCODE = 'P0003';
  END IF;
  
  -- Check if listing is not active
  IF v_status != 'active' THEN
    RAISE EXCEPTION 'Auction is no longer active' USING ERRCODE = 'P0004';
  END IF;
  
  -- Validate bid amount
  IF p_new_maximum <= 0 THEN
    RAISE EXCEPTION 'Bid amount must be positive' USING ERRCODE = 'P0006';
  END IF;
  
  IF v_increment IS NULL OR v_increment <= 0 THEN
    v_increment := 5;
  END IF;

  -- 3) Insert or update the user's own bid with validation
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
      AND b.status = 'active'
    RETURNING id INTO p_bid_id;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Bid not found or not owned by user' USING ERRCODE = 'P0001';
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

  -- 6) Compute the new visible bid with validation
  new_current_bid   := LEAST(v_highest, v_second + v_increment);
  highest_bidder_id := v_winner;
  is_highest_bidder := (v_winner = p_user_id);
  listing_id        := p_listing_id;
  
  -- Additional validation: ensure current bid doesn't exceed maximum
  IF new_current_bid > v_highest THEN
    new_current_bid := v_highest;
  END IF;

  -- 7) Update the listings table with data integrity checks
  UPDATE public.listings AS l
     SET current_bid       = new_current_bid,
         highest_bidder_id = v_winner,
         updated_at        = now()
   WHERE l.id = p_listing_id;

  RETURN NEXT;
END;
$function$;

-- 5. Add constraints to ensure data integrity
ALTER TABLE public.bids 
ADD CONSTRAINT check_positive_amounts 
CHECK (amount > 0 AND maximum_bid > 0);

ALTER TABLE public.bids 
ADD CONSTRAINT check_maximum_bid_consistency 
CHECK (maximum_bid >= amount);

-- 6. Create function to detect and fix data inconsistencies
CREATE OR REPLACE FUNCTION public.audit_and_fix_auction_data()
 RETURNS TABLE(listing_id uuid, issue_type text, old_value text, new_value text)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  rec RECORD;
  v_correct_bid NUMERIC;
  v_correct_bidder UUID;
BEGIN
  -- Find listings with inconsistent current_bid/highest_bidder_id
  FOR rec IN
    SELECT l.id, l.current_bid, l.highest_bidder_id,
           b.amount as bid_amount, b.user_id as bid_user_id
    FROM listings l
    LEFT JOIN bids b ON l.id = b.listing_id AND b.status = 'active'
    WHERE l.type = 'auction' 
    AND l.status = 'active'
    AND (l.current_bid IS NULL OR l.highest_bidder_id IS NULL OR
         l.current_bid != b.amount OR l.highest_bidder_id != b.user_id)
  LOOP
    -- Get the correct highest bid
    SELECT b.amount, b.user_id INTO v_correct_bid, v_correct_bidder
    FROM bids b
    WHERE b.listing_id = rec.id AND b.status = 'active'
    ORDER BY b.amount DESC, b.updated_at ASC
    LIMIT 1;
    
    -- Update if different
    IF v_correct_bid != rec.current_bid OR v_correct_bidder != rec.highest_bidder_id THEN
      UPDATE listings 
      SET current_bid = v_correct_bid,
          highest_bidder_id = v_correct_bidder,
          updated_at = now()
      WHERE id = rec.id;
      
      RETURN QUERY SELECT rec.id, 'INCONSISTENT_BID_DATA', 
                          CONCAT('bid:', rec.current_bid, ' bidder:', rec.highest_bidder_id),
                          CONCAT('bid:', v_correct_bid, ' bidder:', v_correct_bidder);
    END IF;
  END LOOP;
  
  RETURN;
END;
$function$;