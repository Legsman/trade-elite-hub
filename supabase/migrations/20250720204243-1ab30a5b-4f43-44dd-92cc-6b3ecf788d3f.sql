-- Create function to auto-decline offers when bids are placed
CREATE OR REPLACE FUNCTION public.auto_decline_offers_on_bid()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- When a new bid is inserted, auto-decline all pending offers for that listing
  UPDATE public.offers
  SET status = 'declined',
      updated_at = now()
  WHERE listing_id = NEW.listing_id
    AND status = 'pending';
    
  -- Notify users whose offers were auto-declined
  WITH declined_offers AS (
    SELECT DISTINCT o.user_id, l.title
    FROM offers o
    JOIN listings l ON l.id = o.listing_id
    WHERE o.listing_id = NEW.listing_id 
      AND o.status = 'declined'
      AND o.updated_at = now()  -- Only the ones we just updated
  )
  INSERT INTO public.notifications (user_id, type, message, metadata)
  SELECT 
    user_id,
    'offer_auto_declined',
    'Your offer on "' || title || '" was automatically declined because bidding has started.',
    jsonb_build_object(
      'listing_id', NEW.listing_id,
      'listing_title', title,
      'reason', 'bidding_started'
    )
  FROM declined_offers;
  
  RETURN NEW;
END;
$function$;

-- Create trigger to auto-decline offers when bids are placed
DROP TRIGGER IF EXISTS trigger_auto_decline_offers_on_bid ON public.bids;
CREATE TRIGGER trigger_auto_decline_offers_on_bid
  AFTER INSERT ON public.bids
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_decline_offers_on_bid();