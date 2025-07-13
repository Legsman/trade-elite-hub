-- Remove the redundant hourly membership reminder cron job
-- The daily-membership-expiry-check now handles both expiry and reminders

-- Unschedule the hourly reminder job since it's now redundant
SELECT cron.unschedule('hourly-membership-reminder-check');

-- The daily-membership-expiry-check job should remain as it properly handles
-- both membership expiry checks and reminder emails once per day