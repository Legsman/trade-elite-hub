import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, Save, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface FeeSettings {
  verified_membership_fee: { amount: number; currency: string; period: string };
  trader_membership_fee: { amount: number; currency: string; period: string };
  verified_listing_fee: { amount: number; currency: string; per: string };
  trader_listing_fee: { amount: number; currency: string; per: string };
  verified_monthly_limit: { items: number; value: number; currency: string; period: string };
  fees_enabled: { enabled: boolean };
}

const FeesTab: React.FC = () => {
  const [settings, setSettings] = useState<FeeSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  const saveSettings = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      const updates = Object.entries(settings).map(([key, value]) => ({
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

      toast({
        title: "Success",
        description: "Fee settings have been updated",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save fee settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: keyof FeeSettings, field: string, value: any) => {
    if (!settings) return;
    
    setSettings(prev => ({
      ...prev!,
      [key]: {
        ...prev![key],
        [field]: value
      }
    }));
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Fee Management</h2>
          <p className="text-muted-foreground">
            Configure membership fees, listing fees, and user limits
          </p>
        </div>
        <Button onClick={saveSettings} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Fees are currently disabled. Enable them when you're ready to start charging users.
        </AlertDescription>
      </Alert>

      {/* Global Fee Toggle */}
      <Card>
        <CardHeader>
          <CardTitle>Fee System</CardTitle>
          <CardDescription>
            Enable or disable the entire fee system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Switch
              id="fees-enabled"
              checked={settings.fees_enabled.enabled}
              onCheckedChange={(checked) => updateSetting('fees_enabled', 'enabled', checked)}
            />
            <Label htmlFor="fees-enabled">
              {settings.fees_enabled.enabled ? 'Fees Enabled' : 'Fees Disabled'}
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Membership Fees */}
      <Card>
        <CardHeader>
          <CardTitle>Membership Fees</CardTitle>
          <CardDescription>
            Annual membership fees for verified and trader status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="verified-membership">Verified Membership (Annual)</Label>
              <div className="flex items-center space-x-2">
                <span className="text-sm">£</span>
                <Input
                  id="verified-membership"
                  type="number"
                  step="0.01"
                  value={settings.verified_membership_fee.amount}
                  onChange={(e) => updateSetting('verified_membership_fee', 'amount', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="trader-membership">Trader Membership (Annual)</Label>
              <div className="flex items-center space-x-2">
                <span className="text-sm">£</span>
                <Input
                  id="trader-membership"
                  type="number"
                  step="0.01"
                  value={settings.trader_membership_fee.amount}
                  onChange={(e) => updateSetting('trader_membership_fee', 'amount', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Listing Fees */}
      <Card>
        <CardHeader>
          <CardTitle>Listing Fees</CardTitle>
          <CardDescription>
            Per-listing fees for verified and trader users
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="verified-listing">Verified User Listing Fee</Label>
              <div className="flex items-center space-x-2">
                <span className="text-sm">£</span>
                <Input
                  id="verified-listing"
                  type="number"
                  step="0.01"
                  value={settings.verified_listing_fee.amount}
                  onChange={(e) => updateSetting('verified_listing_fee', 'amount', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="trader-listing">Trader Listing Fee</Label>
              <div className="flex items-center space-x-2">
                <span className="text-sm">£</span>
                <Input
                  id="trader-listing"
                  type="number"
                  step="0.01"
                  value={settings.trader_listing_fee.amount}
                  onChange={(e) => updateSetting('trader_listing_fee', 'amount', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Limits */}
      <Card>
        <CardHeader>
          <CardTitle>Verified User Limits</CardTitle>
          <CardDescription>
            Monthly and annual limits for verified users
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="monthly-items">Monthly Item Limit</Label>
              <Input
                id="monthly-items"
                type="number"
                value={settings.verified_monthly_limit.items}
                onChange={(e) => updateSetting('verified_monthly_limit', 'items', parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="annual-value">Annual Value Limit</Label>
              <div className="flex items-center space-x-2">
                <span className="text-sm">£</span>
                <Input
                  id="annual-value"
                  type="number"
                  value={settings.verified_monthly_limit.value}
                  onChange={(e) => updateSetting('verified_monthly_limit', 'value', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div className="text-sm text-muted-foreground space-y-2">
        <p><strong>User Tier Benefits:</strong></p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Verified Users:</strong> Can sell up to {settings.verified_monthly_limit.items} items per month or £{settings.verified_monthly_limit.value.toLocaleString()} per year (whichever comes first). £{settings.verified_listing_fee.amount} per listing.</li>
          <li><strong>Traders:</strong> No limits on items or value. £{settings.trader_listing_fee.amount} per listing.</li>
          <li><strong>Admin Users:</strong> Automatically have verified and trader status with no limits or fees.</li>
        </ul>
      </div>
    </div>
  );
};

export default FeesTab;