import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock, Bell, CreditCard, Shield, LogOut } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/hooks/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loading } from "@/components/ui/loading";
import { toast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage 
} from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const profileFormSchema = z.object({
  full_name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone_number: z.string().optional(),
  company_name: z.string().optional(),
  address_line1: z.string().optional(),
  address_line2: z.string().optional(),
  city: z.string().optional(),
  postcode: z.string().optional(),
  country: z.string().optional(),
});

const securityFormSchema = z.object({
  current_password: z.string().min(8, { message: "Current password is required" }),
  new_password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  confirm_password: z.string().min(8, { message: "Password must be at least 8 characters" }),
}).refine(data => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

const notificationSchema = z.object({
  email_new_messages: z.boolean(),
  email_listing_updates: z.boolean(),
  email_saved_searches: z.boolean(),
  browser_notifications: z.boolean(),
});

const UserSettingsPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [twofaEnabled, setTwofaEnabled] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone_number: "",
      company_name: "",
      address_line1: "",
      address_line2: "",
      city: "",
      postcode: "",
      country: "",
    },
  });

  const securityForm = useForm<z.infer<typeof securityFormSchema>>({
    resolver: zodResolver(securityFormSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  const notificationForm = useForm<z.infer<typeof notificationSchema>>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      email_new_messages: true,
      email_listing_updates: true,
      email_saved_searches: false,
      browser_notifications: true,
    },
  });

  useEffect(() => {
    if (!user) return;

    const fetchUserProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setProfile(data);
        
        if (data.avatar_url) {
          setAvatarUrl(data.avatar_url);
        }
        
        if (data.is_two_factor_enabled !== null) {
          setTwofaEnabled(data.is_two_factor_enabled);
        }

        profileForm.reset({
          full_name: data.full_name || "",
          email: user.email || "",
          phone_number: data.phone_number || "",
          company_name: data.company_name || "",
          address_line1: data.address_line1 || "",
          address_line2: data.address_line2 || "",
          city: data.city || "",
          postcode: data.postcode || "",
          country: data.country || "",
        });

      } catch (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: "Error loading profile",
          description: "Failed to load your profile information. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account",
      });
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: "Error logging out",
        description: "Failed to log you out. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleAvatarUpload = async (event) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }
      
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;
      
      const mockUrl = `https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=256&h=256`;
      
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: mockUrl })
        .eq('id', user.id);
      
      if (error) throw error;
      
      setAvatarUrl(mockUrl);
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated successfully",
      });
      
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Error uploading avatar",
        description: "Failed to upload your profile picture. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const onProfileSubmit = async (values: z.infer<typeof profileFormSchema>) => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: values.full_name,
          phone_number: values.phone_number,
          company_name: values.company_name,
          address_line1: values.address_line1,
          address_line2: values.address_line2,
          city: values.city,
          postcode: values.postcode,
          country: values.country,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
      
      if (values.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: values.email,
        });
        
        if (emailError) throw emailError;
      }
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error updating profile",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const onSecuritySubmit = async (values: z.infer<typeof securityFormSchema>) => {
    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: values.new_password
      });

      if (error) throw error;
      
      securityForm.reset({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
      
      toast({
        title: "Password updated",
        description: "Your password has been updated successfully",
      });
    } catch (error) {
      console.error('Error updating password:', error);
      toast({
        title: "Error updating password",
        description: "Failed to update your password. Please check your current password and try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const onNotificationSubmit = async (values: z.infer<typeof notificationSchema>) => {
    toast({
      title: "Notification preferences updated",
      description: "Your notification preferences have been updated successfully",
    });
  };

  const handle2FAToggle = async (enabled: boolean) => {
    setTwofaEnabled(enabled);
    
    if (enabled) {
      toast({
        title: "Two-Factor Authentication Enabled",
        description: "Your account is now more secure with 2FA",
      });
    } else {
      toast({
        title: "Two-Factor Authentication Disabled",
        description: "2FA has been disabled for your account",
      });
    }
  };

  if (!user) {
    return (
      <MainLayout>
        <div className="container py-12 text-center">
          <p>Please log in to view your settings.</p>
          <Button className="mt-4" onClick={() => navigate("/login")}>
            Log In
          </Button>
        </div>
      </MainLayout>
    );
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="container py-12">
          <Loading message="Loading your profile..." />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-8">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/4">
            <Card>
              <CardHeader>
                <div className="flex flex-col items-center space-y-3">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={avatarUrl} alt={profile?.full_name || user.email} />
                    <AvatarFallback className="text-2xl">
                      {profile?.full_name?.charAt(0) || user.email?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <h2 className="text-xl font-bold">{profile?.full_name || "User"}</h2>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <div>
                    <label htmlFor="avatar-upload" className="cursor-pointer">
                      <Button variant="outline" size="sm" disabled={uploading}>
                        {uploading ? "Uploading..." : "Change Picture"}
                      </Button>
                      <input 
                        id="avatar-upload" 
                        type="file" 
                        accept="image/*" 
                        className="hidden"
                        onChange={handleAvatarUpload}
                        disabled={uploading}
                      />
                    </label>
                  </div>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="p-0">
                <Tabs defaultValue="profile" className="w-full" orientation="vertical">
                  <TabsList className="w-full justify-start rounded-none border-r bg-transparent p-0">
                    <div className="w-full">
                      <TabsTrigger 
                        value="profile" 
                        className="w-full justify-start rounded-none border-r-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-muted"
                      >
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="security" 
                        className="w-full justify-start rounded-none border-r-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-muted"
                      >
                        <Lock className="mr-2 h-4 w-4" />
                        <span>Security</span>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="notifications" 
                        className="w-full justify-start rounded-none border-r-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-muted"
                      >
                        <Bell className="mr-2 h-4 w-4" />
                        <span>Notifications</span>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="payments" 
                        className="w-full justify-start rounded-none border-r-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-muted"
                      >
                        <CreditCard className="mr-2 h-4 w-4" />
                        <span>Payments</span>
                      </TabsTrigger>
                    </div>
                  </TabsList>
                </Tabs>
              </CardContent>
              <Separator />
              <CardFooter className="p-4">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log Out</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Log out of your account?</AlertDialogTitle>
                      <AlertDialogDescription>
                        You'll need to log back in next time you want to use the marketplace.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleLogout}>Log Out</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          </div>

          <div className="flex-1">
            <Tabs defaultValue="profile">
              <TabsContent value="profile" className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Profile Settings</h1>
                  <p className="text-muted-foreground">
                    Manage your account information and delivery address
                  </p>
                </div>

                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>
                          Update your personal details and contact information
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={profileForm.control}
                            name="full_name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Your full name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={profileForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email Address</FormLabel>
                                <FormControl>
                                  <Input placeholder="Your email address" {...field} />
                                </FormControl>
                                <FormDescription>
                                  This is used for login and notifications
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={profileForm.control}
                            name="phone_number"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl>
                                  <Input placeholder="Your phone number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={profileForm.control}
                            name="company_name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Company Name (Optional)</FormLabel>
                                <FormControl>
                                  <Input placeholder="Your company name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Address Information</CardTitle>
                        <CardDescription>
                          Add your address for shipping and trading
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={profileForm.control}
                          name="address_line1"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Address Line 1</FormLabel>
                              <FormControl>
                                <Input placeholder="Street address, P.O. box" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={profileForm.control}
                          name="address_line2"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Address Line 2</FormLabel>
                              <FormControl>
                                <Input placeholder="Apartment, suite, unit, building" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            control={profileForm.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>City</FormLabel>
                                <FormControl>
                                  <Input placeholder="City" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={profileForm.control}
                            name="postcode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Postal Code</FormLabel>
                                <FormControl>
                                  <Input placeholder="Postal code" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={profileForm.control}
                            name="country"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Country</FormLabel>
                                <FormControl>
                                  <Input placeholder="Country" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button type="submit" disabled={isSaving}>
                          {isSaving ? "Saving..." : "Save Changes"}
                        </Button>
                      </CardFooter>
                    </Card>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="security" className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Security Settings</h1>
                  <p className="text-muted-foreground">
                    Manage your password and security preferences
                  </p>
                </div>

                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Change Password</CardTitle>
                      <CardDescription>
                        Update your password to keep your account secure
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...securityForm}>
                        <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)} className="space-y-4">
                          <FormField
                            control={securityForm.control}
                            name="current_password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Current Password</FormLabel>
                                <FormControl>
                                  <Input type="password" placeholder="Your current password" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={securityForm.control}
                            name="new_password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>New Password</FormLabel>
                                <FormControl>
                                  <Input type="password" placeholder="Your new password" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={securityForm.control}
                            name="confirm_password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Confirm New Password</FormLabel>
                                <FormControl>
                                  <Input type="password" placeholder="Confirm new password" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <Button type="submit" disabled={isSaving}>
                            {isSaving ? "Updating..." : "Update Password"}
                          </Button>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Two-Factor Authentication (2FA)</CardTitle>
                      <CardDescription>
                        Add an extra layer of security to your account
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Shield className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">Two-Factor Authentication</p>
                            <p className="text-sm text-muted-foreground">
                              {twofaEnabled 
                                ? "Your account is protected with 2FA" 
                                : "Protect your account with 2FA"}
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={twofaEnabled}
                          onCheckedChange={handle2FAToggle}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Login Sessions</CardTitle>
                      <CardDescription>
                        Manage your active login sessions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Current Session</p>
                            <p className="text-sm text-muted-foreground">
                              Chrome on Windows • London, UK
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Last active: Just now
                            </p>
                          </div>
                          <div>
                            <span className="text-xs bg-green-100 text-green-700 rounded-full px-2 py-1">
                              Current
                            </span>
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Safari on iPhone</p>
                            <p className="text-sm text-muted-foreground">
                              Safari on iOS • Manchester, UK
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Last active: 2 days ago
                            </p>
                          </div>
                          <Button variant="ghost" size="sm">
                            Revoke
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full">
                        Log Out Of All Devices
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="notifications" className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Notification Settings</h1>
                  <p className="text-muted-foreground">
                    Manage how you receive notifications and updates
                  </p>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Email Notifications</CardTitle>
                    <CardDescription>
                      Choose which email notifications you want to receive
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...notificationForm}>
                      <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-4">
                        <FormField
                          control={notificationForm.control}
                          name="email_new_messages"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                  New Messages
                                </FormLabel>
                                <FormDescription>
                                  Receive emails when you get new messages
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={notificationForm.control}
                          name="email_listing_updates"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                  Listing Updates
                                </FormLabel>
                                <FormDescription>
                                  Get notified about your listings and saved items
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={notificationForm.control}
                          name="email_saved_searches"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                  Saved Searches
                                </FormLabel>
                                <FormDescription>
                                  Get emails with new listings matching your saved searches
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <Separator />
                        
                        <FormField
                          control={notificationForm.control}
                          name="browser_notifications"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                  Browser Notifications
                                </FormLabel>
                                <FormDescription>
                                  Allow browser notifications for real-time updates
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <Button type="submit">
                          Save Notification Preferences
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="payments" className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Payment Settings</h1>
                  <p className="text-muted-foreground">
                    Manage your payment methods and billing information
                  </p>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Payment Methods</CardTitle>
                    <CardDescription>
                      Add and manage your payment methods
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <CreditCard className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">
                              •••• •••• •••• 4242
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Expires 04/25
                            </p>
                          </div>
                        </div>
                        <div>
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </div>
                      </div>
                      
                      <Button variant="outline" className="w-full">
                        <CreditCard className="mr-2 h-4 w-4" />
                        Add Payment Method
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Billing History</CardTitle>
                    <CardDescription>
                      View your past transactions and invoices
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-2">
                        <div>
                          <p className="font-medium">Subscription Plan</p>
                          <p className="text-sm text-muted-foreground">
                            Apr 15, 2025
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">£9.99</p>
                          <Button variant="link" size="sm" className="h-auto p-0">
                            View Receipt
                          </Button>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between py-2">
                        <div>
                          <p className="font-medium">Listing Promotion</p>
                          <p className="text-sm text-muted-foreground">
                            Mar 28, 2025
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">£4.99</p>
                          <Button variant="link" size="sm" className="h-auto p-0">
                            View Receipt
                          </Button>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between py-2">
                        <div>
                          <p className="font-medium">Subscription Plan</p>
                          <p className="text-sm text-muted-foreground">
                            Mar 15, 2025
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">£9.99</p>
                          <Button variant="link" size="sm" className="h-auto p-0">
                            View Receipt
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default UserSettingsPage;
