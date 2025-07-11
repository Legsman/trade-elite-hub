import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Crown, Shield, ArrowRight, Check, Infinity, PoundSterling } from 'lucide-react';
import { useAuth } from '@/hooks/auth';
import { useUserVerification } from '@/hooks/auth/useUserVerification';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useFeeCalculation } from '@/hooks/useFeeCalculation';

interface UpgradePathCardProps {
  onUpgradeClick?: (targetTier: 'verified' | 'trader') => void;
}

const UpgradePathCard: React.FC<UpgradePathCardProps> = ({ onUpgradeClick }) => {
  const { user } = useAuth();
  const { level: verificationLevel } = useUserVerification();
  const { isAdmin } = useIsAdmin();
  const { getFeeBreakdown } = useFeeCalculation();

  const userRole = isAdmin ? 'admin' : verificationLevel;

  // Don't show upgrade options for admin users
  if (isAdmin) {
    return (
      <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500">
              <Crown className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Administrator Access</CardTitle>
              <CardDescription>You have full platform privileges</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
    );
  }

  const verifiedBreakdown = getFeeBreakdown('verified');
  const traderBreakdown = getFeeBreakdown('trader');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowRight className="h-5 w-5" />
          Upgrade Your Account
        </CardTitle>
        <CardDescription>
          Unlock more features and increase your selling limits
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Status */}
        <div className="text-center p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">Current Status</p>
          <div className="flex items-center justify-center gap-2 mt-1">
            {userRole === 'verified' ? (
              <Shield className="h-4 w-4 text-green-600" />
            ) : (
              <Shield className="h-4 w-4 text-gray-400" />
            )}
            <span className="font-medium capitalize">{userRole}</span>
          </div>
        </div>

        {/* Upgrade Options */}
        <div className="space-y-4">
          {/* Verified Upgrade (for unverified users) */}
          {userRole === 'unverified' && (
            <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-500">
                      <Shield className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-green-700">Get Verified</CardTitle>
                      <CardDescription>Start selling on the platform</CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-green-600">
                    Recommended
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">What you get:</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <Check className="h-3 w-3 text-green-500" />
                        Sell up to 3 items/month
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-3 w-3 text-green-500" />
                        £12,500 annual limit
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-3 w-3 text-green-500" />
                        Full marketplace access
                      </li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium">Costs:</p>
                    <div className="space-y-1 text-muted-foreground">
                      <p className="flex items-center gap-1">
                        <PoundSterling className="h-3 w-3" />
                        {verifiedBreakdown.feesEnabled ? `£${verifiedBreakdown.membershipFee}/year` : 'Free (temporarily)'}
                      </p>
                      <p className="flex items-center gap-1">
                        <PoundSterling className="h-3 w-3" />
                        {verifiedBreakdown.feesEnabled ? `£${verifiedBreakdown.listingFee} per listing` : 'No listing fees'}
                      </p>
                    </div>
                  </div>
                </div>
                <Separator />
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => onUpgradeClick?.('verified')}
                >
                  Apply for Verification
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Trader Upgrade */}
          {(userRole === 'unverified' || userRole === 'verified') && (
            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-500">
                      <Crown className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-blue-700">Become a Trader</CardTitle>
                      <CardDescription>Professional seller status</CardDescription>
                    </div>
                  </div>
                  {userRole === 'verified' && (
                    <Badge variant="secondary" className="text-blue-600">
                      Upgrade
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">What you get:</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <Infinity className="h-3 w-3 text-blue-500" />
                        Unlimited listings
                      </li>
                      <li className="flex items-center gap-2">
                        <Infinity className="h-3 w-3 text-blue-500" />
                        No value limits
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-3 w-3 text-blue-500" />
                        Lower listing fees
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-3 w-3 text-blue-500" />
                        Priority support
                      </li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium">Costs:</p>
                    <div className="space-y-1 text-muted-foreground">
                      <p className="flex items-center gap-1">
                        <PoundSterling className="h-3 w-3" />
                        {traderBreakdown.feesEnabled ? `£${traderBreakdown.membershipFee}/year` : 'Free (temporarily)'}
                      </p>
                      <p className="flex items-center gap-1">
                        <PoundSterling className="h-3 w-3" />
                        {traderBreakdown.feesEnabled ? `£${traderBreakdown.listingFee} per listing` : 'No listing fees'}
                      </p>
                    </div>
                  </div>
                </div>
                
                {userRole === 'unverified' && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-800">
                      <strong>Note:</strong> You must be verified before applying for trader status.
                    </p>
                  </div>
                )}

                <Separator />
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => onUpgradeClick?.('trader')}
                  disabled={userRole === 'unverified'}
                >
                  {userRole === 'unverified' ? 'Get Verified First' : 'Apply for Trader Status'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Requirements */}
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-medium text-sm mb-2">Requirements:</h4>
          <div className="text-sm text-muted-foreground space-y-1">
            <p><strong>Verified:</strong> Valid ID, proof of address (within 3 months)</p>
            <p><strong>Trader:</strong> All verified requirements + company registration + trading insurance</p>
          </div>
        </div>

        {!verifiedBreakdown.feesEnabled && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>Limited Time:</strong> Fees are currently disabled. Apply now to lock in early access!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UpgradePathCard;