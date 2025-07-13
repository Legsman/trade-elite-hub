
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import MembershipRenewalCard from "@/components/membership/MembershipRenewalCard";

interface SubscriptionTabProps {
  subscribed: boolean;
  subscription_tier: string | null | undefined;
  subscription_end: string | null | undefined;
  showUpgradeOptions: boolean;
  setShowUpgradeOptions: (val: boolean) => void;
  handleManageSubscription: () => void;
  handleCheckout: () => void;
  createCheckoutSession: (arg?: any) => Promise<any>;
  formatDate: (dateString?: string) => string;
}

const SubscriptionTab = ({
  subscribed,
  subscription_tier,
  subscription_end,
  showUpgradeOptions,
  setShowUpgradeOptions,
  handleManageSubscription,
  handleCheckout,
  createCheckoutSession,
  formatDate,
}: SubscriptionTabProps) => {
  return (
    <div className="space-y-6">
      {/* Membership Renewal Section */}
      <MembershipRenewalCard />
      
      <Card>
      <CardHeader>
        <CardTitle>Subscription Management</CardTitle>
        <CardDescription>
          Manage your subscription and payment details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {subscribed ? (
          <>
            <Alert className="bg-green-50 border-green-200">
              <div className="flex items-center">
                <Badge variant="outline" className="bg-green-100 text-green-800 mr-2">
                  Active
                </Badge>
                <AlertTitle>You have an active subscription</AlertTitle>
              </div>
              <AlertDescription className="mt-2">
                <p>Your {subscription_tier} subscription is active until {formatDate(subscription_end)}.</p>
              </AlertDescription>
            </Alert>
            <div className="flex justify-center mt-4">
              <Button onClick={handleManageSubscription}>
                Manage Subscription
              </Button>
            </div>
          </>
        ) : (
          <>
            <div>
              <h3 className="text-lg font-medium mb-2">Upgrade Your Experience</h3>
              <p className="text-muted-foreground mb-4">
                Choose a subscription plan to access premium features and benefits.
              </p>
              {showUpgradeOptions ? (
                <div className="grid gap-4 md:grid-cols-3">
                  {/* Basic Plan */}
                  <Card className="border-2 border-gray-200">
                    <CardHeader>
                      <CardTitle>Basic</CardTitle>
                      <CardDescription>Essential features for casual users</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold mb-2">£9.99<span className="text-sm font-normal text-muted-foreground">/month</span></div>
                      <ul className="space-y-2 mb-4">
                        <li className="flex items-center">
                          <span className="bg-green-100 text-green-800 p-1 rounded-full mr-2">✓</span>
                          <span>Up to 10 listings</span>
                        </li>
                        <li className="flex items-center">
                          <span className="bg-green-100 text-green-800 p-1 rounded-full mr-2">✓</span>
                          <span>Basic Analytics</span>
                        </li>
                        <li className="flex items-center">
                          <span className="bg-green-100 text-green-800 p-1 rounded-full mr-2">✓</span>
                          <span>Email Support</span>
                        </li>
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full" onClick={handleCheckout}>
                        Subscribe
                      </Button>
                    </CardFooter>
                  </Card>
                  {/* Premium Plan */}
                  <Card className="border-2 border-purple">
                    <CardHeader className="bg-purple text-white rounded-t-lg">
                      <Badge className="bg-white text-purple mb-2">Popular</Badge>
                      <CardTitle>Premium</CardTitle>
                      <CardDescription className="text-purple-100">Advanced features for regular sellers</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold mb-2">£19.99<span className="text-sm font-normal text-muted-foreground">/month</span></div>
                      <ul className="space-y-2 mb-4">
                        <li className="flex items-center">
                          <span className="bg-green-100 text-green-800 p-1 rounded-full mr-2">✓</span>
                          <span>Unlimited listings</span>
                        </li>
                        <li className="flex items-center">
                          <span className="bg-green-100 text-green-800 p-1 rounded-full mr-2">✓</span>
                          <span>Featured listings</span>
                        </li>
                        <li className="flex items-center">
                          <span className="bg-green-100 text-green-800 p-1 rounded-full mr-2">✓</span>
                          <span>Advanced Analytics</span>
                        </li>
                        <li className="flex items-center">
                          <span className="bg-green-100 text-green-800 p-1 rounded-full mr-2">✓</span>
                          <span>Priority Support</span>
                        </li>
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full" onClick={handleCheckout}>
                        Subscribe
                      </Button>
                    </CardFooter>
                  </Card>
                  {/* Enterprise Plan */}
                  <Card className="border-2 border-gray-200">
                    <CardHeader>
                      <CardTitle>Enterprise</CardTitle>
                      <CardDescription>Full suite for power sellers</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold mb-2">£49.99<span className="text-sm font-normal text-muted-foreground">/month</span></div>
                      <ul className="space-y-2 mb-4">
                        <li className="flex items-center">
                          <span className="bg-green-100 text-green-800 p-1 rounded-full mr-2">✓</span>
                          <span>Everything in Premium</span>
                        </li>
                        <li className="flex items-center">
                          <span className="bg-green-100 text-green-800 p-1 rounded-full mr-2">✓</span>
                          <span>Dedicated account manager</span>
                        </li>
                        <li className="flex items-center">
                          <span className="bg-green-100 text-green-800 p-1 rounded-full mr-2">✓</span>
                          <span>API access</span>
                        </li>
                        <li className="flex items-center">
                          <span className="bg-green-100 text-green-800 p-1 rounded-full mr-2">✓</span>
                          <span>Custom integrations</span>
                        </li>
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full" onClick={handleCheckout}>
                        Subscribe
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              ) : (
                <Button onClick={() => setShowUpgradeOptions(true)}>
                  View Subscription Options
                </Button>
              )}
            </div>
            <Separator />
            <div>
              <h3 className="text-lg font-medium mb-2">One-Time Authentication</h3>
              <p className="text-muted-foreground mb-4">
                Secure your account with a one-time payment for premium authentication.
              </p>
              <Button variant="outline" onClick={() => createCheckoutSession({ mode: "payment" })}>
                Purchase Authentication (£19.99)
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
    </div>
  );
};

export default SubscriptionTab;

