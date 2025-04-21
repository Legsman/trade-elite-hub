
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UserAdmin } from "../types";

export function useUsersAdminData() {
  const [users, setUsers] = useState<UserAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | string | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch profiles data
        const { data: usersRaw, error: usersError } = await supabase
          .from("profiles")
          .select("id, full_name, email, created_at, strike_count, is_two_factor_enabled, feedback_rating");
          
        if (usersError) {
          console.error("Error fetching users:", usersError);
          setError(usersError.message);
          setUsers([]);
          return;
        }
        
        // Fetch user roles directly using the RPC function
        // This avoids recursion by using a security definer function
        const { data: rolesData, error: rolesError } = await supabase
          .rpc('rpc_is_admin');
          
        if (rolesError) {
          console.error("Error checking admin status:", rolesError);
          // Continue with available data
        }
        
        // Determine if current user is admin (for debugging)
        const isCurrentUserAdmin = rolesData && rolesData.length > 0 && rolesData[0].is_admin;
        console.log("Current user admin status:", isCurrentUserAdmin);
        
        // Fetch all user roles from user_roles table
        // This approach is secured by the admin check in AdminRoute.tsx
        const { data: userRoles, error: userRolesError } = await supabase
          .from('user_roles')
          .select('user_id, role');
          
        if (userRolesError) {
          console.error("Error fetching user roles:", userRolesError);
          // Continue with available data
        }

        // Create a map of user IDs to their roles
        const userRolesMap = new Map();
        if (userRoles && userRoles.length > 0) {
          userRoles.forEach((item: any) => {
            if (item.user_id && item.role) {
              // If user has admin role, set it (prioritize admin role)
              if (item.role === 'admin') {
                userRolesMap.set(item.user_id, 'admin');
              } 
              // Only set non-admin role if user doesn't already have admin role
              else if (!userRolesMap.has(item.user_id)) {
                userRolesMap.set(item.user_id, item.role);
              }
            }
          });
        }
        
        console.log("User roles map:", Object.fromEntries(userRolesMap));

        setUsers(
          (usersRaw || []).map(profile => ({
            id: profile.id,
            email: profile.email,
            full_name: profile.full_name,
            created_at: profile.created_at,
            role: userRolesMap.get(profile.id) || "user",
            strike_count: profile.strike_count || 0,
            status: profile.strike_count >= 3
              ? "suspended"
              : profile.strike_count === 2
                ? "warning"
                : "active",
            listings_count: 0, // will be filled in useAdminDashboard
            last_login: null,
          }))
        );
      } catch (err) {
        console.error("Unexpected error fetching users:", err);
        setError(err instanceof Error ? err.message : String(err));
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  return { users, loading, setUsers, error };
}
