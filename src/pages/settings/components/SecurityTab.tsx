
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Shield, LogOut } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { User, UserProfile } from "@/types";

interface SecurityTabProps {
  user: User;
  profile: UserProfile | null;
  handleSignOut: () => Promise<void>;
}

const SecurityTab = ({ user, profile, handleSignOut }: SecurityTabProps) => {
  const navigate = useNavigate();
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(
    profile?.is_two_factor_enabled || false
  );

  const handleToggle2FA = async () => {
    // This would typically call an API to enable/disable 2FA
    // For now we'll just show a toast notification
    if (!is2FAEnabled) {
      toast({
        title: "2FA Setup Required",
        description: "Please set up two-factor authentication in your account.",
      });
      navigate("/settings/2fa-setup");
    } else {
      setIs2FAEnabled(false);
      toast({
        title: "2FA Disabled",
        description: "Two-factor authentication has been disabled.",
      });
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Account Security
          </CardTitle>
          <CardDescription>
            Manage your account security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Two-Factor Authentication</h3>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account
                </p>
              </div>
              <Switch
                checked={is2FAEnabled}
                onCheckedChange={handleToggle2FA}
                aria-label="Toggle 2FA"
              />
            </div>
            
            <Separator />
            
            <div>
              <h3 className="font-medium mb-2">Account Status</h3>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">
                  {user?.email_confirmed_at
                    ? "Email Verified"
                    : "Email Not Verified"}
                </Badge>
                <Badge
                  variant={
                    profile?.strike_count && profile.strike_count > 0
                      ? "destructive"
                      : "outline"
                  }
                >
                  {profile?.strike_count
                    ? `Strikes: ${profile.strike_count}`
                    : "No Strikes"}
                </Badge>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="font-medium mb-2">Session Information</h3>
              <p className="text-sm">
                <span className="font-medium">Email: </span>
                {user?.email}
              </p>
              <p className="text-sm">
                <span className="font-medium">Last Sign In: </span>
                {user?.last_sign_in_at
                  ? new Date(user.last_sign_in_at).toLocaleString()
                  : "N/A"}
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate("/settings/password-reset")}
          >
            Change Password
          </Button>
          <Button
            variant="secondary"
            className="w-full"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </CardFooter>
      </Card>

      <Card className="border-destructive">
        <CardHeader className="text-destructive">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Actions here can't be undone. Proceed with caution.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Deleting your account will remove all your data, listings, messages,
            and any other information associated with your account.
          </p>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              This action cannot be undone. Your account and all associated data
              will be permanently deleted.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter>
          <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
            <DialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                Delete Account
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Account</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete your account? All your data
                  will be permanently removed. This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <p className="text-sm text-destructive font-medium">
                  To confirm, please type "DELETE" below:
                </p>
                <input
                  className="flex h-10 w-full mt-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  placeholder="Type DELETE to confirm"
                />
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setOpenDeleteDialog(false)}
                >
                  Cancel
                </Button>
                <Button variant="destructive">Delete Forever</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
    </>
  );
};

export default SecurityTab;
