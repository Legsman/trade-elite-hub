-- Fix listings that have sale data but wrong status
UPDATE public.listings 
SET status = 'sold',
    updated_at = now()
WHERE (sale_buyer_id IS NOT NULL OR sale_amount IS NOT NULL OR sale_date IS NOT NULL)
  AND status != 'sold';

-- Create function to ensure proper status based on sale data
CREATE OR REPLACE FUNCTION public.fix_listing_status_based_on_sale_data()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- If listing has sale data, it should be marked as sold
  IF (NEW.sale_buyer_id IS NOT NULL OR NEW.sale_amount IS NOT NULL OR NEW.sale_date IS NOT NULL) AND NEW.status != 'sold' THEN
    NEW.status := 'sold';
    NEW.updated_at := now();
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger to auto-fix status when sale data is present
DROP TRIGGER IF EXISTS trigger_fix_listing_status_on_sale ON public.listings;
CREATE TRIGGER trigger_fix_listing_status_on_sale
  BEFORE INSERT OR UPDATE ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION public.fix_listing_status_based_on_sale_data();