-- Phase 3: Set up cron job for auction monitoring
-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create a scheduled job to run auction monitoring every 5 minutes
SELECT cron.schedule(
  'auction-monitoring-job',
  '*/5 * * * *', -- Every 5 minutes
  $$
  SELECT
    net.http_post(
        url:='https://hwnsooioeqydhyukenfe.supabase.co/functions/v1/auction-monitoring',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3bnNvb2lvZXF5ZGh5dWtlbmZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxODI5NjgsImV4cCI6MjA2MDc1ODk2OH0.trG5sAD9qaxe5gwpxQ2ZtIKteBZkFEJnpYMbSYIf9tY"}'::jsonb,
        body:=concat('{"time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);

-- Also run the existing expire-auctions function every 5 minutes as backup
SELECT cron.schedule(
  'expire-auctions-backup',
  '*/5 * * * *', -- Every 5 minutes
  $$
  SELECT
    net.http_post(
        url:='https://hwnsooioeqydhyukenfe.supabase.co/functions/v1/expire-auctions',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3bnNvb2lvZXF5ZGh5dWtlbmZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxODI5NjgsImV4cCI6MjA2MDc1ODk2OH0.trG5sAD9qaxe5gwpxQ2ZtIKteBZkFEJnpYMbSYIf9tY"}'::jsonb,
        body:=concat('{"time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);