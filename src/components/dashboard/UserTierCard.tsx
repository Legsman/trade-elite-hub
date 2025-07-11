import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Crown, Shield, User, Infinity } from 'lucide-react';
import { useAuth } from '@/hooks/auth';
import { useUserVerification } from '@/hooks/auth/useUserVerification';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useFeesManagement, UserUsage } from '@/hooks/useFeesManagement';

const UserTierCard: React.FC = () => {
  const { user } = useAuth();
  const { level: verificationLevel } = useUserVerification();
  const { isAdmin } = useIsAdmin();
  const { settings, getUserUsage } = useFeesManagement();
  const [usage, setUsage] = useState<UserUsage | null>(null);
  const [loading, setLoading] = useState(true);

  // Determine user role based on admin status and verification level
  const userRole = isAdmin ? 'admin' : verificationLevel;

  useEffect(() => {
    const fetchUsage = async () => {
      if (user?.id && userRole === 'verified') {
        const userUsage = await getUserUsage(user.id);
        setUsage(userUsage);
      }
      setLoading(false);
    };

    if (settings) {
      fetchUsage();
    }
  }, [user, userRole, settings, getUserUsage]);

  const getTierInfo = () => {
    switch (userRole) {
      case 'admin':
        return {
          name: 'Administrator',
          icon: Crown,
          color: 'bg-gradient-to-r from-yellow-400 to-orange-500',
          textColor: 'text-yellow-600',
          description: 'Full platform access with all privileges',
          benefits: ['Unlimited listings', 'No fees', 'Admin panel access', 'All trader benefits']
        };
      case 'trader':
        return {
          name: 'Trader',
          icon: Shield,
          color: 'bg-gradient-to-r from-blue-400 to-purple-500',
          textColor: 'text-blue-600',
          description: 'Professional seller status',
          benefits: ['Unlimited listings', 'No limits on value', '£1.50 per listing', 'Priority support']
        };
      case 'verified':
        return {
          name: 'Verified',
          icon: Shield,
          color: 'bg-gradient-to-r from-green-400 to-emerald-500',
          textColor: 'text-green-600',
          description: 'Verified seller status',
          benefits: ['Up to 3 listings/month', 'Max £12,500/year', '£3.50 per listing', 'Basic support']
        };
      default:
        return {
          name: 'Unverified',
          icon: User,
          color: 'bg-gradient-to-r from-gray-400 to-gray-500',
          textColor: 'text-gray-600',
          description: 'Limited platform access',
          benefits: ['Browse listings', 'Make offers', 'Participate in auctions', 'Contact sellers']
        };
    }
  };

  const tierInfo = getTierInfo();
  const TierIcon = tierInfo.icon;

  if (loading || !settings) {
    return (
      <Card>
        <CardHeader>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardHeader>
      </Card>
    );
  }

  const monthlyLimit = settings.verified_monthly_limit?.items || 3;
  const yearlyValueLimit = settings.verified_monthly_limit?.value || 12500;

  return (
    <Card className="relative overflow-hidden">
      <div className={`absolute top-0 left-0 right-0 h-1 ${tierInfo.color}`}></div>
      
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${tierInfo.color}`}>
              <TierIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {tierInfo.name}
                <Badge variant="secondary" className={tierInfo.textColor}>
                  Current Tier
                </Badge>
              </CardTitle>
              <CardDescription>{tierInfo.description}</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Usage Tracking for Verified Users */}
        {userRole === 'verified' && usage && (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Monthly Listings</span>
                <span className={tierInfo.textColor}>
                  {usage.monthly_listings_count} / {monthlyLimit}
                </span>
              </div>
              <Progress 
                value={(usage.monthly_listings_count / monthlyLimit) * 100} 
                className="h-2"
              />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Annual Value</span>
                <span className={tierInfo.textColor}>
                  £{usage.yearly_value_total.toLocaleString()} / £{yearlyValueLimit.toLocaleString()}
                </span>
              </div>
              <Progress 
                value={(usage.yearly_value_total / yearlyValueLimit) * 100} 
                className="h-2"
              />
            </div>
          </div>
        )}

        {/* Unlimited Status for Trader/Admin */}
        {(userRole === 'trader' || userRole === 'admin') && (
          <div className="flex items-center space-x-2 text-sm">
            <Infinity className="h-4 w-4 text-green-500" />
            <span className="text-green-600 font-medium">Unlimited listings and value</span>
          </div>
        )}

        {/* Benefits List */}
        <div>
          <h4 className="font-medium text-sm mb-2">Your Benefits:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            {tierInfo.benefits.map((benefit, index) => (
              <li key={index} className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 rounded-full bg-current opacity-60"></div>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Upgrade Path for Unverified/Verified Users */}
        {userRole === 'unverified' && (
          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Want to sell?</span> Get verified to start listing items.
            </p>
          </div>
        )}
        
        {userRole === 'verified' && (
          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Need more?</span> Upgrade to Trader for unlimited listings.
            </p>
          </div>
        )}

        {/* Fee Information */}
        {userRole !== 'unverified' && (
          <div className="pt-2 border-t text-xs text-muted-foreground">
            {userRole === 'verified' && (
              <p>Listing fee: £{settings.verified_listing_fee?.amount || 3.50} per listing</p>
            )}
            {userRole === 'trader' && (
              <p>Listing fee: £{settings.trader_listing_fee?.amount || 1.50} per listing</p>
            )}
            {userRole === 'admin' && (
              <p>No fees apply to admin accounts</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserTierCard;