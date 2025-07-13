-- Add membership expiry tracking to profiles
ALTER TABLE public.profiles 
ADD COLUMN membership_expires_at TIMESTAMPTZ,
ADD COLUMN membership_status TEXT DEFAULT 'active',
ADD COLUMN last_payment_date TIMESTAMPTZ,
ADD COLUMN grace_period_until TIMESTAMPTZ;

-- Create email notification log table
CREATE TABLE public.email_notifications_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  email_address TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reminder_days INTEGER,
  membership_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on email notifications log
ALTER TABLE public.email_notifications_log ENABLE ROW LEVEL SECURITY;

-- Create policies for email notifications log
CREATE POLICY "Users can view their own email notifications" 
ON public.email_notifications_log 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "System can insert email notifications" 
ON public.email_notifications_log 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view all email notifications" 
ON public.email_notifications_log 
FOR SELECT 
USING (is_admin(auth.uid()));

-- Create index for efficient querying
CREATE INDEX idx_email_notifications_user_type ON public.email_notifications_log(user_id, notification_type);
CREATE INDEX idx_email_notifications_sent_at ON public.email_notifications_log(sent_at);
CREATE INDEX idx_profiles_membership_expires ON public.profiles(membership_expires_at) WHERE membership_expires_at IS NOT NULL;