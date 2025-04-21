
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
      
      // Fetch profiles data with user roles in a single query
      const { data: usersData, error: usersError } = await supabase
        .from("profiles")
        .select(`
          id, 
          full_name, 
          email, 
          created_at,
          updated_at,
          strike_count,
          user_roles (
            role
          )
        `);
        
      if (usersError) {
        console.error("Error fetching users:", usersError);
        setError(usersError.message);
        setUsers([]);
        return;
      }

      console.log("Users data with roles fetched:", usersData);
      
      // Map the data to include role information
      const mappedUsers: UserAdmin[] = (usersData || []).map(profile => {
        // Get all roles for this user
        const userRoles = profile.user_roles || [];
        
        // Check if user has admin role
        const isAdmin = userRoles.some(r => r.role === 'admin');
        
        // Get verification status based on roles
        // Admin users are automatically considered verified
        const isVerified = isAdmin || userRoles.some(r => r.role === 'verified');
        
        console.log(`User ${profile.id} (${profile.full_name}): roles=${userRoles.map(r => r.role).join(',')}, isAdmin=${isAdmin}, isVerified=${isVerified}`);
        
        return {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          created_at: profile.created_at,
          role: isAdmin ? "admin" : "user",
          verified_status: isVerified ? "verified" : "unverified",
          strike_count: profile.strike_count || 0,
          last_visited: profile.updated_at,
          listings_count: 0  // This could be enhanced by joining with listings table if needed
        };
      });
      
      console.log("Final mapped users with roles:", mappedUsers);
      setUsers(mappedUsers);
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
