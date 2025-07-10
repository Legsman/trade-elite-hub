-- Fix historical data: Update current_bid to match sale_amount for sold auction listings
UPDATE public.listings 
SET current_bid = sale_amount,
    updated_at = now()
WHERE status = 'sold' 
  AND type = 'auction' 
  AND sale_amount IS NOT NULL 
  AND (current_bid IS NULL OR current_bid != sale_amount);