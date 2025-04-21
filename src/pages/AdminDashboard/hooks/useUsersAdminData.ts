
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
        
        // Fetch admin roles directly using SQL query via RPC
        // This avoids recursion by using a security definer function
        const { data: rolesData, error: rolesError } = await supabase
          .rpc('get_user_roles');
          
        if (rolesError) {
          console.error("Error fetching user roles:", rolesError);
          // Continue with available data
        }

        // Create a map of user IDs to their roles
        const userRolesMap = new Map();
        if (rolesData) {
          rolesData.forEach((item: any) => {
            if (item.user_id && item.role) {
              userRolesMap.set(item.user_id, item.role);
            }
          });
        }

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
