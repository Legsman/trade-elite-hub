
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
        
        // Fetch all admin roles directly from user_roles table
        // This approach is secured by the admin check in AdminRoute.tsx
        const { data: adminRoles, error: adminRolesError } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('role', 'admin');
          
        if (adminRolesError) {
          console.error("Error fetching admin roles:", adminRolesError);
          // Continue with available data
        }

        // Create a set of admin user IDs for efficient lookups
        const adminUserIds = new Set();
        if (adminRoles && adminRoles.length > 0) {
          adminRoles.forEach(item => {
            if (item.user_id) {
              adminUserIds.add(item.user_id);
            }
          });
        }
        
        console.log("Admin users:", Array.from(adminUserIds));

        setUsers(
          (usersRaw || []).map(profile => ({
            id: profile.id,
            email: profile.email,
            full_name: profile.full_name,
            created_at: profile.created_at,
            role: adminUserIds.has(profile.id) ? "admin" : "user",
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
