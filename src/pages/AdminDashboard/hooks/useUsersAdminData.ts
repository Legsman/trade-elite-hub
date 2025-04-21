
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

      console.log("Raw users data fetched:", usersRaw);
      
      // Fetch ALL roles from user_roles table - we'll process them locally
      console.log("Fetching all user roles...");
      const { data: userRoles, error: userRolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');
        
      if (userRolesError) {
        console.error("Error fetching user roles:", userRolesError);
      }
      
      console.log("User roles fetched:", userRoles);

      // Create maps for role lookups (more efficient than filtering arrays repeatedly)
      const userRolesMap = new Map();
      
      if (userRoles && userRoles.length > 0) {
        userRoles.forEach(item => {
          if (!userRolesMap.has(item.user_id)) {
            userRolesMap.set(item.user_id, []);
          }
          userRolesMap.get(item.user_id).push(item.role);
        });
      }
      
      console.log("User roles map created:", Array.from(userRolesMap.entries()));

      // Map profiles to UserAdmin objects with role and verified status information
      const mappedUsers: UserAdmin[] = (usersRaw || []).map(profile => {
        const userRoles = userRolesMap.get(profile.id) || [];
        
        // A user is admin if they have the 'admin' role
        const isAdmin = userRoles.includes('admin');
        
        // A user is verified if they have the 'verified' role OR if they're an admin
        // Admins are automatically considered verified
        const isVerified = isAdmin || userRoles.includes('verified');
        
        console.log(`User ${profile.id} (${profile.full_name}): roles=${userRoles.join(',')}, isAdmin=${isAdmin}, isVerified=${isVerified}`);
        
        // Determine status based on strike_count
        let userStatus: "active" | "warning" | "suspended" = "active";
        if (profile.strike_count >= 3) {
          userStatus = "suspended";
        } else if (profile.strike_count === 2) {
          userStatus = "warning";
        }
        
        return {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          created_at: profile.created_at,
          role: isAdmin ? "admin" : "user",
          verified_status: isVerified ? "verified" : "unverified",
          strike_count: profile.strike_count || 0,
          status: userStatus,
          listings_count: 0,
          last_login: null,
        };
      });
      
      console.log("Final mapped users with roles and verified statuses:", mappedUsers);
      console.log("Admin users after mapping:", mappedUsers.filter(u => u.role === "admin").map(u => `${u.full_name} (${u.id})`));
      console.log("Verified users after mapping:", mappedUsers.filter(u => u.verified_status === "verified").map(u => `${u.full_name} (${u.id})`));
      
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
