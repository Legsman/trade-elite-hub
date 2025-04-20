
import { useState, useEffect, useCallback } from "react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import AuthContext from "./authContext";
import { useProfileService } from "./useProfileService";
import { useAuthService } from "./useAuthService";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const { fetchUserProfile } = useProfileService(setUser);
  
  const { login, signup, logout } = useAuthService(
    setLoading,
    setSupabaseUser,
    setUser,
    fetchUserProfile
  );

  const refreshUserProfile = useCallback(async () => {
    if (supabaseUser) {
      await fetchUserProfile(supabaseUser.id);
    }
  }, [fetchUserProfile, supabaseUser]);

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

  return (
    <AuthContext.Provider
      value={{ user, supabaseUser, loading, login, signup, logout, refreshUserProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
