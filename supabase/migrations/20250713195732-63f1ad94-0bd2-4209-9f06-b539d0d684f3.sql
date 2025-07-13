-- Update the cron job for membership expiry check to run daily instead of hourly
-- Remove old hourly job and create new daily job

-- First, unschedule the existing hourly job
SELECT cron.unschedule('membership-expiry-check');

-- Create new daily job that runs at 8 AM every day
SELECT cron.schedule(
  'membership-expiry-check-daily',
  '0 8 * * *', -- Daily at 8 AM
  $$
  SELECT
    net.http_post(
        url:='https://hwnsooioeqydhyukenfe.supabase.co/functions/v1/check-membership-expiry',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3bnNvb2lvZXF5ZGh5dWtlbmZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxODI5NjgsImV4cCI6MjA2MDc1ODk2OH0.trG5sAD9qaxe5gwpxQ2ZtIKteBZkFEJnpYMbSYIf9tY"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);

-- Remove the send-membership-reminder job since it's now handled by check-membership-expiry
SELECT cron.unschedule('send-membership-reminder');