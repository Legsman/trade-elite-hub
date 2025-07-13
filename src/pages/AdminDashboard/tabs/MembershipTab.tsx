import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useMembershipManagement } from '@/hooks/useMembershipManagement';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Users, AlertTriangle, CheckCircle, Clock, Mail, DollarSign, Star, Crown } from 'lucide-react';

interface MembershipStatus {
  user_id: string;
  full_name: string;
  email: string;
  membership_expires_at: string | null;
  membership_status: string | null;
  last_payment_date: string | null;
  grace_period_until: string | null;
  days_until_expiry: number;
  status: 'active' | 'expiring' | 'expired' | 'grace_period';
  verification_level: 'verified' | 'trader';
}

interface EmailNotification {
  id: string;
  user_id: string;
  email_address: string;
  notification_type: string;
  reminder_days: number | null;
  sent_at: string;
  membership_expires_at: string | null;
}

const MembershipTab: React.FC = () => {
  const [membershipData, setMembershipData] = useState<MembershipStatus[]>([]);
  const [emailNotifications, setEmailNotifications] = useState<EmailNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [extensionDays, setExtensionDays] = useState<number>(365);
  const { toast } = useToast();
  const { updateMembershipExpiry, triggerMembershipCheck } = useMembershipManagement();

  useEffect(() => {
    fetchMembershipData();
    fetchEmailNotifications();
  }, []);

  const fetchMembershipData = async () => {
    try {
      console.log('Fetching membership data...');
      
      // Use the optimized security definer function
      const { data, error } = await supabase.rpc('get_membership_data_for_admin');

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.log('No membership data found');
        setMembershipData([]);
        return;
      }

      console.log(`Found ${data.length} verified users`);

      const membershipStatuses: MembershipStatus[] = data.map(profile => {
        const now = new Date();
        
        // Calculate membership expiry - use existing date or calculate from signup/creation
        let expiryDate = profile.membership_expires_at ? new Date(profile.membership_expires_at) : null;
        
        if (!expiryDate) {
          // Calculate expiry based on verification level and signup date
          const baseDate = profile.signup_date ? new Date(profile.signup_date) : new Date(profile.created_at);
          const membershipYears = profile.verification_level === 'trader' ? 2 : 1;
          expiryDate = new Date(baseDate.getTime() + (membershipYears * 365 * 24 * 60 * 60 * 1000));
        }
        
        const gracePeriodUntil = profile.grace_period_until ? new Date(profile.grace_period_until) : null;
        
        let daysUntilExpiry = 0;
        let status: 'active' | 'expiring' | 'expired' | 'grace_period' = 'active';

        if (expiryDate) {
          daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          
          if (gracePeriodUntil && now > expiryDate && now <= gracePeriodUntil) {
            status = 'grace_period';
          } else if (daysUntilExpiry < 0) {
            status = 'expired';
          } else if (daysUntilExpiry <= 7) {
            status = 'expiring';
          }
        }

        return {
          user_id: profile.user_id,
          full_name: profile.full_name || 'Unknown',
          email: profile.email || '',
          membership_expires_at: expiryDate ? expiryDate.toISOString() : null,
          membership_status: profile.membership_status || 'active',
          last_payment_date: profile.last_payment_date,
          grace_period_until: profile.grace_period_until,
          days_until_expiry: daysUntilExpiry,
          status,
          verification_level: profile.verification_level as 'verified' | 'trader',
        };
      });

      console.log('Processed membership data:', membershipStatuses.length);
      setMembershipData(membershipStatuses);
    } catch (error) {
      console.error('Error fetching membership data:', error);
      toast({
        title: "Error",
        description: `Failed to fetch membership data: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEmailNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('email_notifications_log')
        .select('*')
        .order('sent_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setEmailNotifications(data);
    } catch (error) {
      console.error('Error fetching email notifications:', error);
    }
  };

  const handleExtendMembership = async () => {
    if (!selectedUserId || extensionDays <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please select a user and enter valid extension days",
        variant: "destructive",
      });
      return;
    }

    const newExpiryDate = new Date();
    newExpiryDate.setDate(newExpiryDate.getDate() + extensionDays);

    try {
      await updateMembershipExpiry.mutateAsync({
        userId: selectedUserId,
        expiryDate: newExpiryDate.toISOString(),
      });
      
      await fetchMembershipData();
      setSelectedUserId('');
      setExtensionDays(365);
    } catch (error) {
      console.error('Error extending membership:', error);
    }
  };

  const handleTriggerCheck = async () => {
    try {
      await triggerMembershipCheck.mutateAsync();
      await fetchMembershipData();
    } catch (error) {
      console.error('Error triggering membership check:', error);
    }
  };

  const getStatusBadge = (status: MembershipStatus['status']) => {
    const variants = {
      active: { variant: "default" as const, icon: CheckCircle, color: "text-green-600" },
      expiring: { variant: "secondary" as const, icon: Clock, color: "text-yellow-600" },
      expired: { variant: "destructive" as const, icon: AlertTriangle, color: "text-red-600" },
      grace_period: { variant: "outline" as const, icon: Clock, color: "text-orange-600" },
    };

    const config = variants[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className={`h-3 w-3 ${config.color}`} />
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getStatusCounts = () => {
    return {
      active: membershipData.filter(m => m.status === 'active').length,
      expiring: membershipData.filter(m => m.status === 'expiring').length,
      expired: membershipData.filter(m => m.status === 'expired').length,
      grace_period: membershipData.filter(m => m.status === 'grace_period').length,
    };
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return <div className="p-4">Loading membership data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Memberships</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{statusCounts.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{statusCounts.expiring}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Grace Period</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{statusCounts.grace_period}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{statusCounts.expired}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="memberships" className="space-y-4">
        <TabsList>
          <TabsTrigger value="memberships">Membership Status</TabsTrigger>
          <TabsTrigger value="notifications">Email Notifications</TabsTrigger>
          <TabsTrigger value="controls">Admin Controls</TabsTrigger>
        </TabsList>

        <TabsContent value="memberships" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Membership Status Overview
              </CardTitle>
              <CardDescription>
                Monitor membership expiry dates and user status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {membershipData.map((member) => (
                  <div key={member.user_id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="font-medium">{member.full_name}</div>
                        <Badge variant="outline" className="flex items-center gap-1">
                          {member.verification_level === 'trader' ? (
                            <Crown className="h-3 w-3 text-purple-600" />
                          ) : (
                            <Star className="h-3 w-3 text-blue-600" />
                          )}
                          {member.verification_level.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">{member.email}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {member.membership_expires_at ? (
                          <>Expires: {new Date(member.membership_expires_at).toLocaleDateString()}</>
                        ) : (
                          'No expiry date set'
                        )}
                        {member.last_payment_date && (
                          <> • Last payment: {new Date(member.last_payment_date).toLocaleDateString()}</>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(member.status)}
                      <span className="text-sm font-medium">
                        {member.days_until_expiry > 0 ? `${member.days_until_expiry}d left` : 
                         member.days_until_expiry === 0 ? 'Expires today' : `${Math.abs(member.days_until_expiry)}d overdue`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Notification Log
              </CardTitle>
              <CardDescription>
                Track sent membership reminder emails
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {emailNotifications.map((notification) => (
                  <div key={notification.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{notification.email_address}</div>
                      <div className="text-xs text-muted-foreground">
                        {notification.notification_type} 
                        {notification.reminder_days && ` (${notification.reminder_days} days)`}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(notification.sent_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="controls" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Extend Membership
                </CardTitle>
                <CardDescription>
                  Manually extend a user's membership
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="user-select">Select User</Label>
                  <select
                    id="user-select"
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select a user...</option>
                    {membershipData.map((member) => (
                      <option key={member.user_id} value={member.user_id}>
                        {member.full_name} ({member.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="extension-days">Extension (days)</Label>
                  <Input
                    id="extension-days"
                    type="number"
                    value={extensionDays}
                    onChange={(e) => setExtensionDays(parseInt(e.target.value) || 0)}
                    min="1"
                    max="3650"
                  />
                </div>
                <Button 
                  onClick={handleExtendMembership}
                  disabled={!selectedUserId || extensionDays <= 0 || updateMembershipExpiry.isPending}
                  className="w-full"
                >
                  {updateMembershipExpiry.isPending ? "Extending..." : "Extend Membership"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  System Controls
                </CardTitle>
                <CardDescription>
                  Manual system operations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    These actions will affect all users in the system
                  </AlertDescription>
                </Alert>
                <Button 
                  onClick={handleTriggerCheck}
                  disabled={triggerMembershipCheck.isPending}
                  variant="outline"
                  className="w-full"
                >
                  {triggerMembershipCheck.isPending ? "Running..." : "Run Membership Check"}
                </Button>
                <Button 
                  onClick={fetchMembershipData}
                  variant="outline"
                  className="w-full"
                >
                  Refresh Data
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MembershipTab;