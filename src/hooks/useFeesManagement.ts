import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface FeeSettings {
  verified_membership_fee: { amount: number; currency: string; period: string };
  trader_membership_fee: { amount: number; currency: string; period: string };
  verified_listing_fee: { amount: number; currency: string; per: string };
  trader_listing_fee: { amount: number; currency: string; per: string };
  verified_monthly_limit: { items: number; value: number; currency: string; period: string };
  fees_enabled: { enabled: boolean };
}

export interface UserUsage {
  monthly_listings_count: number;
  yearly_value_total: number;
  current_month: string;
  current_year: number;
}

export const useFeesManagement = () => {
  const [settings, setSettings] = useState<FeeSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('setting_key, setting_value');

      if (error) throw error;

      const settingsMap = data.reduce((acc, setting) => {
        acc[setting.setting_key] = setting.setting_value;
        return acc;
      }, {} as FeeSettings);

      setSettings(settingsMap);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: "Error",
        description: "Failed to load fee settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<FeeSettings>) => {
    if (!settings) return false;

    try {
      const updates = Object.entries(newSettings).map(([key, value]) => ({
        setting_key: key,
        setting_value: value,
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('system_settings')
          .update({ setting_value: update.setting_value })
          .eq('setting_key', update.setting_key);

        if (error) throw error;
      }

      setSettings(prev => ({ ...prev!, ...newSettings }));
      return true;
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: "Error",
        description: "Failed to update fee settings",
        variant: "destructive",
      });
      return false;
    }
  };

  const getUserUsage = async (userId: string): Promise<UserUsage | null> => {
    try {
      const currentDate = new Date();
      const currentMonth = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}`;
      const currentYear = currentDate.getFullYear();

      const { data, error } = await supabase
        .from('user_usage_tracking')
        .select('*')
        .eq('user_id', userId)
        .eq('month_year', currentMonth)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (!data) {
        // No usage data exists, return zero usage
        return {
          monthly_listings_count: 0,
          yearly_value_total: 0,
          current_month: currentMonth,
          current_year: currentYear,
        };
      }

      return {
        monthly_listings_count: data.monthly_listings_count,
        yearly_value_total: data.yearly_value_total,
        current_month: currentMonth,
        current_year: currentYear,
      };
    } catch (error) {
      console.error('Error fetching user usage:', error);
      return null;
    }
  };

  const updateUserUsage = async (userId: string, listingCount: number, listingValue: number) => {
    try {
      const currentDate = new Date();
      const currentMonth = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}`;
      const currentYear = currentDate.getFullYear();

      const { error } = await supabase
        .from('user_usage_tracking')
        .upsert({
          user_id: userId,
          month_year: currentMonth,
          year: currentYear,
          monthly_listings_count: listingCount,
          yearly_value_total: listingValue,
        }, {
          onConflict: 'user_id,month_year'
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating user usage:', error);
      return false;
    }
  };

  const checkUserLimits = async (userId: string, userRole: string, newListingValue: number = 0): Promise<{
    canCreateListing: boolean;
    reason?: string;
    monthlyItemsUsed: number;
    monthlyItemsLimit: number;
    yearlyValueUsed: number;
    yearlyValueLimit: number;
  }> => {
    // Admin and trader users have no limits
    if (userRole === 'admin' || userRole === 'trader') {
      return {
        canCreateListing: true,
        monthlyItemsUsed: 0,
        monthlyItemsLimit: -1, // -1 indicates unlimited
        yearlyValueUsed: 0,
        yearlyValueLimit: -1,
      };
    }

    // Only verified users have limits
    if (userRole !== 'verified') {
      return {
        canCreateListing: false,
        reason: 'Only verified users can create listings',
        monthlyItemsUsed: 0,
        monthlyItemsLimit: 0,
        yearlyValueUsed: 0,
        yearlyValueLimit: 0,
      };
    }

    if (!settings) {
      return {
        canCreateListing: false,
        reason: 'Settings not loaded',
        monthlyItemsUsed: 0,
        monthlyItemsLimit: 0,
        yearlyValueUsed: 0,
        yearlyValueLimit: 0,
      };
    }

    const usage = await getUserUsage(userId);
    if (!usage) {
      return {
        canCreateListing: false,
        reason: 'Unable to check usage limits',
        monthlyItemsUsed: 0,
        monthlyItemsLimit: 0,
        yearlyValueUsed: 0,
        yearlyValueLimit: 0,
      };
    }

    const monthlyLimit = settings.verified_monthly_limit.items;
    const yearlyValueLimit = settings.verified_monthly_limit.value;
    
    const monthlyItemsUsed = usage.monthly_listings_count;
    const yearlyValueUsed = usage.yearly_value_total;
    
    // Check monthly item limit
    if (monthlyItemsUsed >= monthlyLimit) {
      return {
        canCreateListing: false,
        reason: `Monthly listing limit of ${monthlyLimit} items reached`,
        monthlyItemsUsed,
        monthlyItemsLimit: monthlyLimit,
        yearlyValueUsed,
        yearlyValueLimit,
      };
    }

    // Check yearly value limit
    if (yearlyValueUsed + newListingValue > yearlyValueLimit) {
      return {
        canCreateListing: false,
        reason: `Adding this listing would exceed yearly value limit of £${yearlyValueLimit.toLocaleString()}`,
        monthlyItemsUsed,
        monthlyItemsLimit: monthlyLimit,
        yearlyValueUsed,
        yearlyValueLimit,
      };
    }

    return {
      canCreateListing: true,
      monthlyItemsUsed,
      monthlyItemsLimit: monthlyLimit,
      yearlyValueUsed,
      yearlyValueLimit,
    };
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    fetchSettings,
    updateSettings,
    getUserUsage,
    updateUserUsage,
    checkUserLimits,
  };
};