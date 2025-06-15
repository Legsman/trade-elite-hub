
-- 1. Add tracking for sale info on listings
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS sale_buyer_id uuid NULL,
  ADD COLUMN IF NOT EXISTS sale_amount numeric NULL,
  ADD COLUMN IF NOT EXISTS sale_date timestamp with time zone NULL;

-- 2. When an offer is accepted, mark listing as "sold" and store sale info
CREATE OR REPLACE FUNCTION public.auto_mark_listing_sold_on_offer_accept()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'accepted' THEN
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
$$ LANGUAGE plpgsql;

-- Attach trigger to offers (AFTER UPDATE to accepted)
DROP TRIGGER IF EXISTS trg_offers_auto_mark_listing_sold ON public.offers;
CREATE TRIGGER trg_offers_auto_mark_listing_sold
AFTER UPDATE ON public.offers
FOR EACH ROW
WHEN (NEW.status = 'accepted')
EXECUTE FUNCTION public.auto_mark_listing_sold_on_offer_accept();

-- 3. When an auction is marked "won", mark listing as "sold" and store sale info
CREATE OR REPLACE FUNCTION public.auto_mark_listing_sold_on_auction_win()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'won' THEN
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
$$ LANGUAGE plpgsql;

-- Attach trigger to bids (AFTER UPDATE to won)
DROP TRIGGER IF EXISTS trg_bids_auto_mark_listing_sold ON public.bids;
CREATE TRIGGER trg_bids_auto_mark_listing_sold
AFTER UPDATE ON public.bids
FOR EACH ROW
WHEN (NEW.status = 'won')
EXECUTE FUNCTION public.auto_mark_listing_sold_on_auction_win();
