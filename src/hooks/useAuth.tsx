
import { useEffect, useState, useCallback, createContext, useContext } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { User } from "@/types";
import type { Tables } from "@/integrations/supabase/types";

interface AuthContextType {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error?: Error }>;
  signup: (data: {
    email: string;
    password: string;
    fullName: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    postcode?: string;
    country?: string;
    tradingAddress?: string;
    companyName?: string;
    phoneNumber?: string;
    referredBy?: string;
  }) => Promise<{ error?: Error }>;
  logout: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch profile from profiles table
  const fetchUserProfile = useCallback(async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(
          [
            "id",
            "full_name",
            "avatar_url",
            "address_line1",
            "address_line2",
            "city",
            "postcode",
            "country",
            "trading_address",
            "company_name",
            "phone_number",
            "email",
            "signup_date",
            "strike_count",
            "is_two_factor_enabled",
            "referred_by",
            "feedback_rating",
            "annual_2fa_payment_date",
            "created_at",
            "updated_at",
          ]
            .map((f) => f)
            .join(",")
        )
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);
        return;
      }
      
      // Fixed: Add null check before the type guard
      if (data !== null) {
        // Type guard to check if data has the correct shape
        if (typeof data === 'object' && 'id' in data && data !== null) {
          // Now we can safely cast it to the correct type
          const profile = data as Tables<"profiles">;
          
          // Map database fields to User type
          const profileUser: User = {
            id: profile.id,
            name: profile.full_name || "",
            email: profile.email || "",
            role: "unverified", // default, role checking done elsewhere
            createdAt: new Date(profile.created_at),
            purchases: 0,
            sales: 0,
            feedbackRating: profile.feedback_rating ?? 0,
            isVerified: false,
            isTwoFactorEnabled: profile.is_two_factor_enabled ?? false,
            annual2FAPaymentDate: profile.annual_2fa_payment_date
              ? new Date(profile.annual_2fa_payment_date)
              : undefined,
            referredBy: profile.referred_by,
          };
          setUser(profileUser);
        } else {
          console.error("Profile data is not in the expected format:", data);
        }
      }
    } catch (err) {
      console.error("Unexpected error fetching profile:", err);
    }
  }, []);

  useEffect(() => {
    // Check active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSupabaseUser(session?.user ?? null);
      if (session?.user) fetchUserProfile(session.user.id);
      setLoading(false);
    });

    // Listen for auth state changes
    const { data } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSupabaseUser(session?.user ?? null);
        if (session?.user) {
          fetchUserProfile(session.user.id);
        } else {
          setUser(null);
        }
      }
    );

    return () => {
      data.subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) return { error };
    if (data.user) {
      setSupabaseUser(data.user);
      await fetchUserProfile(data.user.id);
    }
    return {};
  };

  const signup = async (data: {
    email: string;
    password: string;
    fullName: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    postcode?: string;
    country?: string;
    tradingAddress?: string;
    companyName?: string;
    phoneNumber?: string;
    referredBy?: string;
  }) => {
    setLoading(true);

    const { error, data: signUpData } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          fullName: data.fullName,
          address_line1: data.addressLine1 ?? null,
          address_line2: data.addressLine2 ?? null,
          city: data.city ?? null,
          postcode: data.postcode ?? null,
          country: data.country ?? null,
          trading_address: data.tradingAddress ?? null,
          company_name: data.companyName ?? null,
          phone_number: data.phoneNumber ?? null,
          referred_by: data.referredBy ?? null,
        },
      },
    });

    if (error) {
      setLoading(false);
      return { error };
    }

    if (signUpData.user) {
      setSupabaseUser(signUpData.user);
      // The profiles table is updated by the DB trigger, but we fetch fresh profile here:
      await fetchUserProfile(signUpData.user.id);
    }
    setLoading(false);
    return {};
  };

  const logout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setSupabaseUser(null);
    setUser(null);
    setLoading(false);
  };

  const refreshUserProfile = useCallback(async () => {
    if (supabaseUser) {
      await fetchUserProfile(supabaseUser.id);
    }
  }, [fetchUserProfile, supabaseUser]);

  return (
    <AuthContext.Provider
      value={{ user, supabaseUser, loading, login, signup, logout, refreshUserProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};
