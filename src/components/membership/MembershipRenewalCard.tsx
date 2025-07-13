import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useMembershipRenewal } from '@/hooks/useMembershipRenewal';
import { useMembershipManagement } from '@/hooks/useMembershipManagement';
import { useAuth } from '@/hooks/auth/useAuth';
import { AlertTriangle, Calendar, CreditCard, Clock, CheckCircle } from 'lucide-react';

interface MembershipRenewalCardProps {
  className?: string;
}

const MembershipRenewalCard: React.FC<MembershipRenewalCardProps> = ({ className }) => {
  const { user } = useAuth();
  const { membershipInfo, getMembershipStatus } = useMembershipManagement();
  const { 
    loading, 
    initiateMembershipRenewal, 
    checkMembershipNeedsRenewal, 
    getDaysUntilExpiry 
  } = useMembershipRenewal();

  if (!user || !membershipInfo) {
    return null;
  }

  const membershipStatus = getMembershipStatus();
  const needsRenewal = checkMembershipNeedsRenewal();
  const daysUntilExpiry = getDaysUntilExpiry();

  const getStatusDisplay = () => {
    switch (membershipStatus.status) {
      case 'expired':
        return {
          icon: AlertTriangle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          title: 'Membership Expired',
          message: `Your membership expired ${Math.abs(daysUntilExpiry || 0)} days ago`,
          variant: 'destructive' as const,
        };
      case 'expiring':
        return {
          icon: Clock,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          title: 'Membership Expiring Soon',
          message: `Your membership expires in ${daysUntilExpiry} day${daysUntilExpiry === 1 ? '' : 's'}`,
          variant: 'default' as const,
        };
      default:
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          title: 'Membership Active',
          message: `Your membership expires in ${daysUntilExpiry} day${daysUntilExpiry === 1 ? '' : 's'}`,
          variant: 'default' as const,
        };
    }
  };

  const statusDisplay = getStatusDisplay();
  const StatusIcon = statusDisplay.icon;

  const handleRenewal = async (tier: 'verified' | 'trader') => {
    await initiateMembershipRenewal(tier);
  };

  const getCurrentTier = () => {
    // Determine current tier from membership status
    return membershipStatus.membershipStatus === 'trader' ? 'trader' : 'verified';
  };

  const currentTier = getCurrentTier();

  return (
    <Card className={`${className} ${statusDisplay.borderColor} ${statusDisplay.bgColor}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <StatusIcon className={`h-5 w-5 ${statusDisplay.color}`} />
          {statusDisplay.title}
        </CardTitle>
        <CardDescription>
          {statusDisplay.message}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {membershipInfo.membership_expires_at && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            Expires: {new Date(membershipInfo.membership_expires_at).toLocaleDateString()}
          </div>
        )}

        {membershipInfo.last_payment_date && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CreditCard className="h-4 w-4" />
            Last payment: {new Date(membershipInfo.last_payment_date).toLocaleDateString()}
          </div>
        )}

        {needsRenewal && (
          <Alert variant={statusDisplay.variant}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {membershipStatus.status === 'expired' 
                ? 'Your membership has expired. Renew now to restore full access to features.'
                : 'Your membership is expiring soon. Renew now to avoid service interruption.'
              }
            </AlertDescription>
          </Alert>
        )}

        <div className="flex items-center gap-2">
          <Badge variant="outline">
            Current Plan: {currentTier.charAt(0).toUpperCase() + currentTier.slice(1)}
          </Badge>
          <Badge variant={membershipStatus.status === 'active' ? 'default' : 'secondary'}>
            {membershipStatus.status === 'active' ? 'Active' : 'Needs Renewal'}
          </Badge>
        </div>

        {needsRenewal && (
          <div className="space-y-3">
            <div className="text-sm font-medium">Renewal Options:</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 border rounded-lg">
                <div className="font-medium text-sm">Verified Membership</div>
                <div className="text-xs text-muted-foreground mb-2">Standard features</div>
                <div className="text-lg font-bold text-primary">£150/year</div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRenewal('verified')}
                  disabled={loading}
                  className="w-full mt-2"
                >
                  {loading ? 'Processing...' : 'Renew as Verified'}
                </Button>
              </div>

              <div className="p-3 border rounded-lg">
                <div className="font-medium text-sm">Trader Membership</div>
                <div className="text-xs text-muted-foreground mb-2">Premium features</div>
                <div className="text-lg font-bold text-primary">£300/year</div>
                <Button
                  size="sm"
                  onClick={() => handleRenewal('trader')}
                  disabled={loading}
                  className="w-full mt-2"
                >
                  {loading ? 'Processing...' : 'Renew as Trader'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {!needsRenewal && membershipStatus.status === 'active' && (
          <div className="pt-2">
            <Button
              variant="outline"
              onClick={() => handleRenewal(currentTier)}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Processing...' : 'Renew Early (1 Year Extension)'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MembershipRenewalCard;