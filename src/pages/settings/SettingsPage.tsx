
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/hooks/auth";
import { useUserProfile } from "@/hooks/use-user-profile";
import { useProfileUpdater } from "@/hooks/user-profile";
import { useSubscription } from "@/hooks/use-subscription";
import { useAnalytics } from "@/hooks/use-analytics";
import { toast } from "@/hooks/use-toast";
import { UserProfile } from "@/types";
import SettingsTabs from "./SettingsTabs";
import SettingsAuthRequired from "./SettingsAuthRequired";

const profileFormSchema = z.object({
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(/^[A-Za-z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
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

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { profile, isLoading: profileLoading, setProfile } = useUserProfile();
  const userId = profile?.id;
  const { updateProfile, uploadAvatar } = useProfileUpdater(userId, setProfile);
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
      username: "",
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
        username: profile.username || "",
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
        <SettingsAuthRequired />
      </MainLayout>
    );
  }

  const isLoading = profileLoading || subscriptionLoading;

  // Move all handlers here and pass down as props
  const onSubmit = async (values: ProfileFormValues) => {
    setIsSubmitting(true);
    try {
      const result = await updateProfile(values as Partial<UserProfile>);
      if (!result.success) throw new Error("Failed to update profile");

      if (avatarFile) {
        const avatarResult = await uploadAvatar(avatarFile);
        if (!avatarResult.success) throw new Error("Failed to upload avatar");
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

  // Import the new utility
  const { formatDate } = require("./formatDate");

  return (
    <MainLayout>
      <SettingsTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isLoading={isLoading}
        profile={profile}
        user={user}
        form={form}
        isSubmitting={isSubmitting}
        onSubmit={onSubmit}
        avatarFile={avatarFile}
        avatarPreview={avatarPreview}
        handleAvatarChange={handleAvatarChange}
        subscription_tier={subscription_tier}
        subscribed={subscribed}
        subscription_end={subscription_end}
        showUpgradeOptions={showUpgradeOptions}
        setShowUpgradeOptions={setShowUpgradeOptions}
        handleManageSubscription={handleManageSubscription}
        handleCheckout={handleCheckout}
        createCheckoutSession={createCheckoutSession}
        formatDate={formatDate}
        handleSignOut={handleSignOut}
      />
    </MainLayout>
  );
};

export default SettingsPage;
