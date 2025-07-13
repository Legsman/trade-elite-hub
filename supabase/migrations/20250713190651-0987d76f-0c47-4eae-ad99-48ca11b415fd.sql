-- Create cron job for daily membership expiry checks
SELECT cron.schedule(
  'daily-membership-expiry-check',
  '0 8 * * *', -- Run at 8 AM every day
  $$
  SELECT
    net.http_post(
        url:='https://hwnsooioeqydhyukenfe.supabase.co/functions/v1/check-membership-expiry',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3bnNvb2lvZXF5ZGh5dWtlbmZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxODI5NjgsImV4cCI6MjA2MDc1ODk2OH0.trG5sAD9qaxe5gwpxQ2ZtIKteBZkFEJnpYMbSYIf9tY"}'::jsonb,
        body:=concat('{"scheduled_run": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);

-- Create cron job for email reminders (runs every hour to check for precise timing)
SELECT cron.schedule(
  'hourly-membership-reminder-check',
  '0 * * * *', -- Run at the top of every hour
  $$
  SELECT
    net.http_post(
        url:='https://hwnsooioeqydhyukenfe.supabase.co/functions/v1/send-membership-reminder',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3bnNvb2lvZXF5ZGh5dWtlbmZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxODI5NjgsImV4cCI6MjA2MDc1ODk2OH0.trG5sAD9qaxe5gwpxQ2ZtIKteBZkFEJnpYMbSYIf9tY"}'::jsonb,
        body:=concat('{"scheduled_run": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);