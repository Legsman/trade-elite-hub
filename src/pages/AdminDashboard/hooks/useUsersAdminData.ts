
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UserAdmin } from "../types";

export function useUsersAdminData() {
  const [users, setUsers] = useState<UserAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch profiles data first
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select(`
          id, 
          full_name, 
          email, 
          created_at,
          updated_at,
          strike_count
        `);
        
      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        setError(profilesError.message);
        setUsers([]);
        return;
      }

      console.log("Profiles data fetched:", profilesData);
      
      if (!profilesData || profilesData.length === 0) {
        setUsers([]);
        setLoading(false);
        return;
      }
      
      // Process each profile to get their roles using the security definer function
      const usersWithRoles: UserAdmin[] = await Promise.all(
        profilesData.map(async (profile) => {
          // Use the security definer function to check if user is admin
          const { data: isAdminData } = await supabase
            .rpc('is_admin', { _user_id: profile.id });
            
          const isAdmin = isAdminData || false;
          
          // For verified status, we need to use another function or approach
          const { data: hasVerifiedRole } = await supabase
            .rpc('has_role', { 
              _user_id: profile.id, 
              _role: 'verified' 
            });
          
          console.log(`User ${profile.id} (${profile.full_name}): isAdmin=${isAdmin}, isVerified=${hasVerifiedRole}`);
          
          return {
            id: profile.id,
            email: profile.email,
            full_name: profile.full_name,
            created_at: profile.created_at,
            role: isAdmin ? "admin" : "user",
            verified_status: (isAdmin || hasVerifiedRole) ? "verified" : "unverified",
            strike_count: profile.strike_count || 0,
            last_visited: profile.updated_at,
            listings_count: 0  // This could be enhanced by joining with listings table if needed
          };
        })
      );
      
      console.log("Final mapped users with roles:", usersWithRoles);
      setUsers(usersWithRoles);
    } catch (err) {
      console.error("Unexpected error fetching users:", err);
      setError(err instanceof Error ? err.message : String(err));
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const refetchUsers = useCallback(async () => {
    await fetchUsers();
  }, [fetchUsers]);

  return { users, loading, setUsers, error, refetchUsers };
}
