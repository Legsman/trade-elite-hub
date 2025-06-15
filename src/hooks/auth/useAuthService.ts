import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { SignupData } from "./types";

export const useAuthService = (
  setLoading: (loading: boolean) => void,
  setSupabaseUser: (user: SupabaseUser | null) => void, 
  setUser: (user: null) => void,
  fetchUserProfile: (id: string) => Promise<void>
) => {
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

  const signup = async (data: SignupData) => {
    setLoading(true);

    const { error, data: signUpData } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          fullName: data.fullName,
          username: data.username,
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
      await fetchUserProfile(signUpData.user.id);
    }
    setLoading(false);
    return {};
  };

  const logout = useCallback(async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setSupabaseUser(null);
    setUser(null);
    setLoading(false);
  }, [setLoading, setSupabaseUser, setUser]);

  return { login, signup, logout };
};
