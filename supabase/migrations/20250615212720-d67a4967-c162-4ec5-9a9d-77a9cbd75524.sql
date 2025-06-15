
-- Substitute the actual UUIDs for S1QUATTRO and Mockuser2 as needed.

-- Update all SOLD listings for seller S1QUATTRO to set the buyer to Mockuser2
update listings
set sale_buyer_id = (select id from profiles where full_name = 'Mockuser2' limit 1)
where seller_id = (select id from profiles where full_name = 'S1QUATTRO' limit 1)
  and status = 'sold'
  and sale_buyer_id is null;

-- Optionally, you can print out the affected rows to verify:
select id, title, seller_id, sale_buyer_id, status from listings
where seller_id = (select id from profiles where full_name = 'S1QUATTRO' limit 1)
  and status = 'sold';
