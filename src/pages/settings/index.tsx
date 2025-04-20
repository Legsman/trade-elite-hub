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
import ProfileTab from "./components/ProfileTab";
import SubscriptionTab from "./components/SubscriptionTab";
import SecurityTab from "./components/SecurityTab";

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
    const urlParams = new URLSearchParams(window.location.search);
    const checkoutSuccess = urlParams.get("checkout_success");
    const checkoutCanceled = urlParams.get("checkout_canceled");
    
    if (checkoutSuccess === "true") {
      toast({
        title: "Payment Successful",
        description: "Thank you for your payment! Your subscription has been activated.",
      });
      trackEvent("checkout_completed");
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
      
      if (avatarFile) {
        const avatarResult = await uploadAvatar(avatarFile);
        
        if (!avatarResult.success) {
          throw new Error("Failed to upload avatar");
        }
        
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
    
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File Type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
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
    </MainLayout>
  );
};

export default UserSettingsPage;
