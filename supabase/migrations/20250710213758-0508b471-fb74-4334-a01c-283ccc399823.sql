-- Check if the trigger already exists and create if needed
-- This ensures accepted offers mark the listing as sold with the offer amount
CREATE OR REPLACE FUNCTION public.auto_mark_listing_sold_on_offer_accept()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
    UPDATE public.listings
      SET status = 'sold',
          sale_buyer_id = NEW.user_id,
          sale_amount = NEW.amount,
          sale_date = NOW(),
          updated_at = NOW()
      WHERE id = NEW.listing_id;
  END IF;
  RETURN NEW;
END;
$function$;

-- Create trigger if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trigger_mark_listing_sold_on_offer_accept'
  ) THEN
    CREATE TRIGGER trigger_mark_listing_sold_on_offer_accept
      AFTER UPDATE ON public.offers
      FOR EACH ROW
      EXECUTE FUNCTION public.auto_mark_listing_sold_on_offer_accept();
  END IF;
END $$;