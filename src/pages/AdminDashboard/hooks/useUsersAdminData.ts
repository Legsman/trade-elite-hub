
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
      
      console.log("Fetching admin users data...");
      
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

      console.log("Profiles data fetched:", profilesData?.length);
      
      if (!profilesData || profilesData.length === 0) {
        setUsers([]);
        setLoading(false);
        return;
      }

      // Get all user IDs
      const userIds = profilesData.map(profile => profile.id);
      
      // Use the new batch function to get roles efficiently
      const { data: rolesData, error: rolesError } = await supabase
        .rpc('get_user_roles_batch', { user_ids: userIds });
        
      if (rolesError) {
        console.error("Error fetching user roles:", rolesError);
        setError(rolesError.message);
        return;
      }

      console.log("Roles data fetched:", rolesData);

      // Map profiles with their roles
      const usersWithRoles: UserAdmin[] = profilesData.map(profile => {
        const roleInfo = rolesData.find(r => r.user_id === profile.id) || {
          is_admin: false,
          is_verified: false
        };

        return {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name || "Unknown User",
          created_at: profile.created_at,
          role: roleInfo.is_admin ? "admin" : "user",
          verified_status: roleInfo.is_admin || roleInfo.is_verified ? "verified" : "unverified",
          strike_count: profile.strike_count || 0,
          last_visited: profile.updated_at,
          listings_count: 0
        };
      });
      
      console.log("Final mapped users with roles:", usersWithRoles.length);
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
    console.log("Manually refetching users data...");
    await new Promise(resolve => setTimeout(resolve, 2000));
    await fetchUsers();
  }, [fetchUsers]);

  return { users, loading, setUsers, error, refetchUsers };
}
