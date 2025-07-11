
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UserAdmin } from "../types";
import { toast } from "@/hooks/use-toast";

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
      
      // Use the batch function to get roles efficiently
      const { data: rolesData, error: rolesError } = await supabase
        .rpc('get_user_roles_batch', { user_ids: userIds });
        
      if (rolesError) {
        console.error("Error fetching user roles:", rolesError);
        setError(rolesError.message);
        setUsers([]);
        return;
      }

      console.log("Roles data fetched:", rolesData);

      // Map profiles with their roles
      const usersWithRoles: UserAdmin[] = profilesData.map(profile => {
        const roleInfo = rolesData.find(r => r.user_id === profile.id) || {
          is_admin: false,
          is_verified: false,
          is_trader: false
        };

        // Determine verification status based on role hierarchy
        let verificationStatus: "unverified" | "verified" | "trader" = "unverified";
        if (roleInfo.is_admin) {
          verificationStatus = "verified"; // Admins are always verified
        } else if (roleInfo.is_trader) {
          verificationStatus = "trader";
        } else if (roleInfo.is_verified) {
          verificationStatus = "verified";
        }

        return {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name || "Unknown User",
          created_at: profile.created_at,
          role: roleInfo.is_admin ? "admin" : "user",
          verified_status: verificationStatus,
          strike_count: profile.strike_count || 0,
          last_visited: profile.updated_at,
          listings_count: 0
        };
      });
      
      console.log("Final mapped users with roles:", usersWithRoles.length);
      console.log("Admin users:", usersWithRoles.filter(u => u.role === "admin").map(u => u.full_name));
      console.log("Verified users:", usersWithRoles.filter(u => u.verified_status === "verified").map(u => u.full_name));
      
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
    setLoading(true);
    
    // Show a toast to indicate refetching is happening
    toast({
      title: "Refreshing data",
      description: "Fetching fresh user data..."
    });
    
    try {
      await fetchUsers();
      toast({
        title: "Data refreshed",
        description: "User data has been successfully updated"
      });
    } catch (err) {
      console.error("Error refetching users:", err);
      toast({
        title: "Refresh failed",
        description: "Failed to get updated user data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [fetchUsers, toast]);

  return { users, loading, setUsers, error, refetchUsers };
}
