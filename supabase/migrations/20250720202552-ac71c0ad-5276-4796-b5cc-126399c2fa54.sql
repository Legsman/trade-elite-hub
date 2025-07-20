-- Set up cron job for security auditing
SELECT cron.schedule(
  'auction-security-audit',
  '0 */6 * * *', -- Every 6 hours
  $$
  SELECT
    net.http_post(
        url:='https://hwnsooioeqydhyukenfe.supabase.co/functions/v1/auction-security-audit',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3bnNvb2lvZXF5ZGh5dWtlbmZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxODI5NjgsImV4cCI6MjA2MDc1ODk2OH0.trG5sAD9qaxe5gwpxQ2ZtIKteBZkFEJnpYMbSYIf9tY"}'::jsonb,
        body:=concat('{"time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);