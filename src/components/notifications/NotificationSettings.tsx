import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Bell, BellOff } from "lucide-react";
import { useBrowserNotifications } from "@/hooks/useBrowserNotifications";
import { toast } from "@/hooks/use-toast";

export default function NotificationSettings() {
  const { permission, requestPermission, isSupported } = useBrowserNotifications();
  const [browserNotifications, setBrowserNotifications] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [offerNotifications, setOfferNotifications] = useState(true);
  const [messageNotifications, setMessageNotifications] = useState(true);

  useEffect(() => {
    setBrowserNotifications(permission === "granted");
  }, [permission]);

  const handleBrowserNotificationToggle = async (enabled: boolean) => {
    if (enabled && permission !== "granted") {
      const result = await requestPermission();
      setBrowserNotifications(result === "granted");
      
      if (result === "granted") {
        toast({
          title: "Browser Notifications Enabled",
          description: "You'll now receive real-time notifications in your browser.",
        });
      } else {
        toast({
          title: "Notification Permission Denied",
          description: "Please enable notifications in your browser settings if you change your mind.",
          variant: "destructive",
        });
      }
    } else {
      setBrowserNotifications(enabled);
      if (!enabled) {
        toast({
          title: "Browser Notifications Disabled",
          description: "You won't receive browser notifications anymore.",
        });
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Preferences
        </CardTitle>
        <CardDescription>
          Manage how you receive notifications about offers, messages, and other activities.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Browser Notifications */}
        <div className="flex items-center justify-between space-x-4">
          <div className="flex-1">
            <Label htmlFor="browser-notifications" className="text-base font-medium">
              Browser Notifications
            </Label>
            <p className="text-sm text-muted-foreground">
              Get instant notifications in your browser when you receive offers or messages.
            </p>
            {!isSupported && (
              <p className="text-xs text-destructive mt-1">
                Browser notifications are not supported in your browser.
              </p>
            )}
          </div>
          <Switch
            id="browser-notifications"
            checked={browserNotifications}
            onCheckedChange={handleBrowserNotificationToggle}
            disabled={!isSupported}
          />
        </div>

        {/* Email Notifications */}
        <div className="flex items-center justify-between space-x-4">
          <div className="flex-1">
            <Label htmlFor="email-notifications" className="text-base font-medium">
              Email Notifications
            </Label>
            <p className="text-sm text-muted-foreground">
              Receive important notifications via email.
            </p>
          </div>
          <Switch
            id="email-notifications"
            checked={emailNotifications}
            onCheckedChange={setEmailNotifications}
          />
        </div>

        {/* Offer Notifications */}
        <div className="flex items-center justify-between space-x-4">
          <div className="flex-1">
            <Label htmlFor="offer-notifications" className="text-base font-medium">
              Offer Notifications
            </Label>
            <p className="text-sm text-muted-foreground">
              Get notified when you receive offers or when your offers are accepted/declined.
            </p>
          </div>
          <Switch
            id="offer-notifications"
            checked={offerNotifications}
            onCheckedChange={setOfferNotifications}
          />
        </div>

        {/* Message Notifications */}
        <div className="flex items-center justify-between space-x-4">
          <div className="flex-1">
            <Label htmlFor="message-notifications" className="text-base font-medium">
              Message Notifications
            </Label>
            <p className="text-sm text-muted-foreground">
              Get notified when you receive new messages from buyers or sellers.
            </p>
          </div>
          <Switch
            id="message-notifications"
            checked={messageNotifications}
            onCheckedChange={setMessageNotifications}
          />
        </div>

        {/* Test Notification Button */}
        {browserNotifications && (
          <div className="pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                toast({
                  title: "🔔 Test Notification",
                  description: "This is what your notifications will look like!",
                });
              }}
              className="w-full"
            >
              Test Notification
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}