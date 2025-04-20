
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Loader2, 
  User, 
  CreditCard, 
  Settings, 
  Shield, 
  ImagePlus, 
  Save
} from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/auth";
import { useUserProfile } from "@/hooks/use-user-profile";
import { useSubscription } from "@/hooks/use-subscription";
import { useAnalytics } from "@/hooks/use-analytics";
import { toast } from "@/hooks/use-toast";
import { UserProfile } from "@/types";
import { Loading } from "@/components/ui/loading";

// Define form schema
const profileFormSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  postcode: z.string().optional(),
  country: z.string().optional(),
  companyName: z.string().optional(),
  tradingAddress: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const UserSettingsPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { profile, isLoading: profileLoading, updateProfile, uploadAvatar } = useUserProfile();
  const { 
    subscribed, 
    subscription_tier, 
    subscription_end, 
    createCheckoutSession, 
    createCustomerPortalSession,
    isLoading: subscriptionLoading 
  } = useSubscription();
  const { trackEvent } = useAnalytics();
  
  const [activeTab, setActiveTab] = useState("profile");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showUpgradeOptions, setShowUpgradeOptions] = useState(false);

  // Initialize form with profile data
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      postcode: "",
      country: "",
      companyName: "",
      tradingAddress: "",
    },
  });

  // Update form values when profile data loads
  useEffect(() => {
    if (profile) {
      form.reset({
        fullName: profile.fullName || "",
        email: profile.email || "",
        phoneNumber: profile.phoneNumber || "",
        addressLine1: profile.addressLine1 || "",
        addressLine2: profile.addressLine2 || "",
        city: profile.city || "",
        postcode: profile.postcode || "",
        country: profile.country || "",
        companyName: profile.companyName || "",
        tradingAddress: profile.tradingAddress || "",
      });
    }
  }, [profile, form]);

  useEffect(() => {
    // Check for checkout success or canceled
    const urlParams = new URLSearchParams(window.location.search);
    const checkoutSuccess = urlParams.get("checkout_success");
    const checkoutCanceled = urlParams.get("checkout_canceled");
    
    if (checkoutSuccess === "true") {
      toast({
        title: "Payment Successful",
        description: "Thank you for your payment! Your subscription has been activated.",
      });
      trackEvent("checkout_completed");
      // Remove query params from URL
      navigate("/settings", { replace: true });
    } else if (checkoutCanceled === "true") {
      toast({
        title: "Payment Canceled",
        description: "Your payment was canceled. No charges were made.",
      });
      trackEvent("checkout_canceled");
      navigate("/settings", { replace: true });
    }
  }, [navigate, trackEvent]);

  if (!user) {
    return (
      <MainLayout>
        <div className="container py-12">
          <Alert>
            <AlertTitle>Authentication Required</AlertTitle>
            <AlertDescription>
              You need to be logged in to access your settings.
            </AlertDescription>
          </Alert>
          <Button className="mt-4" onClick={() => navigate("/login")}>
            Log In
          </Button>
        </div>
      </MainLayout>
    );
  }

  const isLoading = profileLoading || subscriptionLoading;

  const onSubmit = async (values: ProfileFormValues) => {
    setIsSubmitting(true);
    
    try {
      const result = await updateProfile(values as Partial<UserProfile>);
      
      if (!result.success) {
        throw new Error("Failed to update profile");
      }
      
      // Upload avatar if selected
      if (avatarFile) {
        const avatarResult = await uploadAvatar(avatarFile);
        
        if (!avatarResult.success) {
          throw new Error("Failed to upload avatar");
        }
        
        // Clear avatar state
        setAvatarFile(null);
        setAvatarPreview(null);
      }
      
      toast({
        title: "Settings Updated",
        description: "Your profile has been updated successfully.",
      });
      
      trackEvent("profile_updated");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update Failed",
        description: "There was a problem updating your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Check file type and size
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File Type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast({
        title: "File Too Large",
        description: "Please select an image under 5MB.",
        variant: "destructive",
      });
      return;
    }
    
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleCheckout = async () => {
    const { url } = await createCheckoutSession();
    if (url) {
      trackEvent("checkout_started");
      window.location.href = url;
    }
  };

  const handleManageSubscription = async () => {
    const { url } = await createCustomerPortalSession();
    if (url) {
      trackEvent("subscription_management_opened");
      window.location.href = url;
    }
  };

  const handleSignOut = async () => {
    trackEvent("user_signed_out");
    await logout();
    navigate("/");
  };

  // Format subscription end date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  return (
    <MainLayout>
      <div className="container py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
            <p className="text-muted-foreground">
              Manage your account settings and preferences
            </p>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">
                <User className="h-4 w-4 mr-2" />
                Profile
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
                  <Card>
                    <CardHeader>
                      <CardTitle>Profile Information</CardTitle>
                      <CardDescription>
                        Update your personal information and address details
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-6 space-y-6">
                        <div className="flex flex-col items-center sm:flex-row sm:space-x-6">
                          <div className="relative mb-4 sm:mb-0">
                            <Avatar className="h-24 w-24">
                              <AvatarImage src={avatarPreview || profile?.avatarUrl} />
                              <AvatarFallback>{profile?.fullName?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <Button
                              size="sm"
                              variant="outline"
                              className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                              onClick={() => document.getElementById("avatar-upload")?.click()}
                            >
                              <ImagePlus className="h-4 w-4" />
                              <span className="sr-only">Upload avatar</span>
                            </Button>
                            <input
                              id="avatar-upload"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleAvatarChange}
                            />
                          </div>
                          <div>
                            <h3 className="text-lg font-medium">{profile?.fullName || "Your Name"}</h3>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Member since {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "N/A"}
                            </p>
                            {subscription_tier && (
                              <Badge className="mt-2">
                                {subscription_tier} Plan
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                              <FormField
                                control={form.control}
                                name="fullName"
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
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Email Address</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Your email" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            
                            <FormField
                              control={form.control}
                              name="phoneNumber"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Phone Number</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Your phone number (optional)" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <Separator />
                          
                          <div>
                            <h3 className="text-lg font-medium mb-4">Address Information</h3>
                            <div className="space-y-4">
                              <FormField
                                control={form.control}
                                name="addressLine1"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Address Line 1</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Street address" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name="addressLine2"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Address Line 2</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Apartment, suite, etc. (optional)" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <FormField
                                  control={form.control}
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
                                  control={form.control}
                                  name="postcode"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Postcode</FormLabel>
                                      <FormControl>
                                        <Input placeholder="Postcode" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                
                                <FormField
                                  control={form.control}
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
                            </div>
                          </div>
                          
                          <Separator />
                          
                          <div>
                            <h3 className="text-lg font-medium mb-4">Business Information</h3>
                            <div className="space-y-4">
                              <FormField
                                control={form.control}
                                name="companyName"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Company Name</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Your company name (optional)" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name="tradingAddress"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Trading Address</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Trading address (if different from above)" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                          
                          <div className="flex justify-end">
                            <Button type="submit" disabled={isSubmitting}>
                              {isSubmitting ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <Save className="mr-2 h-4 w-4" />
                                  Save Changes
                                </>
                              )}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="subscription" className="space-y-6">
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
                </TabsContent>
                
                <TabsContent value="security" className="space-y-6">
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
                </TabsContent>
              </>
            )}
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default UserSettingsPage;
