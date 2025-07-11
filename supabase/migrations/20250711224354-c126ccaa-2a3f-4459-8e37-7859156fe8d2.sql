-- Create system_settings table for configurable fees and settings
CREATE TABLE public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  setting_type TEXT NOT NULL, -- 'fee', 'limit', 'general'
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for system_settings
CREATE POLICY "Admins can view all settings" ON public.system_settings
FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert settings" ON public.system_settings
FOR INSERT WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update settings" ON public.system_settings
FOR UPDATE USING (is_admin(auth.uid()));

-- Insert default fee settings
INSERT INTO public.system_settings (setting_key, setting_value, setting_type, description) VALUES
('verified_membership_fee', '{"amount": 35, "currency": "GBP", "period": "yearly"}', 'fee', 'Annual membership fee for verified users'),
('trader_membership_fee', '{"amount": 108, "currency": "GBP", "period": "yearly"}', 'fee', 'Annual membership fee for trader users'),
('verified_listing_fee', '{"amount": 3.50, "currency": "GBP", "per": "listing"}', 'fee', 'Fee per listing for verified users'),
('trader_listing_fee', '{"amount": 1.50, "currency": "GBP", "per": "listing"}', 'fee', 'Fee per listing for trader users'),
('verified_monthly_limit', '{"items": 3, "value": 12500, "currency": "GBP", "period": "yearly"}', 'limit', 'Verified user limits - 3 items/month or £12,500/year'),
('fees_enabled', '{"enabled": false}', 'general', 'Whether fees are currently active');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_system_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_system_settings_updated_at
BEFORE UPDATE ON public.system_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_system_settings_updated_at();

-- Create user_usage_tracking table to track verified user limits
CREATE TABLE public.user_usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  month_year TEXT NOT NULL, -- Format: 'YYYY-MM'
  year INTEGER NOT NULL,
  monthly_listings_count INTEGER NOT NULL DEFAULT 0,
  yearly_value_total NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, month_year)
);

-- Enable RLS
ALTER TABLE public.user_usage_tracking ENABLE ROW LEVEL SECURITY;

-- Create policies for user_usage_tracking
CREATE POLICY "Users can view their own usage" ON public.user_usage_tracking
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all usage" ON public.user_usage_tracking
FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "System can insert usage tracking" ON public.user_usage_tracking
FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update usage tracking" ON public.user_usage_tracking
FOR UPDATE USING (true);

-- Create trigger for automatic timestamp updates on user_usage_tracking
CREATE TRIGGER update_user_usage_tracking_updated_at
BEFORE UPDATE ON public.user_usage_tracking
FOR EACH ROW
EXECUTE FUNCTION public.update_system_settings_updated_at();