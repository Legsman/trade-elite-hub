
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UserAdmin } from "../types";

export function useUsersAdminData() {
  const [users, setUsers] = useState<UserAdmin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      const { data: usersRaw, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, created_at, strike_count, is_two_factor_enabled, feedback_rating");
      if (error) {
        setUsers([]);
        setLoading(false);
        return;
      }
      // Fetch roles for users
      const { data: rolesRaw } = await supabase
        .from("user_roles")
        .select("user_id, role");

      const userRolesMap = new Map();
      (rolesRaw || []).forEach(({ user_id, role }: any) => {
        userRolesMap.set(user_id, role);
      });

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
      setLoading(false);
    }

    fetchUsers();
  }, []);

  return { users, loading, setUsers };
}
