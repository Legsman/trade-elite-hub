
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Separator } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SecurityTabProps {
  user: any;
  profile: any;
  handleSignOut: () => void;
}

const SecurityTab = ({
  user,
  profile,
  handleSignOut,
}: SecurityTabProps) => (
  <Card>
    <CardHeader>
      <CardTitle>Security Settings</CardTitle>
      <CardDescription>
        Manage your account security and preferences
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Account Details</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Email</span>
            <span>{user.email}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Account Created</span>
            <span>{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "N/A"}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Last Updated</span>
            <span>{profile?.updatedAt ? new Date(profile.updatedAt).toLocaleDateString() : "N/A"}</span>
          </div>
        </div>
      </div>
      <Separator />
      <div>
        <h3 className="text-lg font-medium mb-4">Account Actions</h3>
        <div className="space-y-4">
          <Button variant="outline" className="w-full" onClick={() => window.open("/auth/reset-password", "_blank")}>
            Change Password
          </Button>
          <Button variant="destructive" className="w-full" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default SecurityTab;

