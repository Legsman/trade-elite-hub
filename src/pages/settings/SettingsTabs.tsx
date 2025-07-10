
import {
  Tabs, TabsContent, TabsList, TabsTrigger
} from "@/components/ui/tabs";
import { User, CreditCard, Shield, Bell } from "lucide-react";
import { Loading } from "@/components/ui/loading";
import ProfileTab from "./components/ProfileTab";
import SubscriptionTab from "./components/SubscriptionTab";
import SecurityTab from "./components/SecurityTab";
import NotificationSettings from "@/components/notifications/NotificationSettings";

const SettingsTabs = ({
  activeTab, setActiveTab, isLoading,
  profile, user, form, isSubmitting, onSubmit, avatarFile, avatarPreview, handleAvatarChange, subscription_tier,
  subscribed, subscription_end, showUpgradeOptions, setShowUpgradeOptions,
  handleManageSubscription, handleCheckout, createCheckoutSession, formatDate, handleSignOut
}: any) => (
  <div className="container py-8">
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="subscription">
            <CreditCard className="h-4 w-4 mr-2" />
            Subscription
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>
        {isLoading ? (
          <div className="py-12">
            <Loading message="Loading your settings..." />
          </div>
        ) : (
          <>
            <TabsContent value="profile" className="space-y-6">
              <ProfileTab
                profile={profile}
                user={user}
                form={form}
                isSubmitting={isSubmitting}
                onSubmit={onSubmit}
                avatarFile={avatarFile}
                avatarPreview={avatarPreview}
                handleAvatarChange={handleAvatarChange}
                subscription_tier={subscription_tier}
              />
            </TabsContent>
            <TabsContent value="notifications" className="space-y-6">
              <NotificationSettings />
            </TabsContent>
            <TabsContent value="subscription" className="space-y-6">
              <SubscriptionTab
                subscribed={subscribed}
                subscription_tier={subscription_tier}
                subscription_end={subscription_end}
                showUpgradeOptions={showUpgradeOptions}
                setShowUpgradeOptions={setShowUpgradeOptions}
                handleManageSubscription={handleManageSubscription}
                handleCheckout={handleCheckout}
                createCheckoutSession={createCheckoutSession}
                formatDate={formatDate}
              />
            </TabsContent>
            <TabsContent value="security" className="space-y-6">
              <SecurityTab
                user={user}
                profile={profile}
                handleSignOut={handleSignOut}
              />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  </div>
);

export default SettingsTabs;
