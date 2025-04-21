
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
      
      // Fetch admin roles from user_roles table
      console.log("Directly fetching admin roles from user_roles table...");
      const { data: adminRoles, error: adminRolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .eq('role', 'admin');
        
      if (adminRolesError) {
        console.error("Error directly fetching admin roles:", adminRolesError);
      }

      // Fetch verified statuses from user_roles table
      console.log("Directly fetching verified statuses from user_roles table...");
      const { data: verifiedStatuses, error: verifiedStatusesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .eq('role', 'verified');
        
      if (verifiedStatusesError) {
        console.error("Error directly fetching verified statuses:", verifiedStatusesError);
      }

      // Create sets for efficient lookups
      const adminUserIds = new Set();
      if (adminRoles && adminRoles.length > 0) {
        console.log("Admin roles found:", adminRoles);
        adminRoles.forEach(item => {
          if (item.user_id) {
            adminUserIds.add(item.user_id);
          }
        });
      } else {
        console.log("No admin roles found in the database");
      }
      
      const verifiedUserIds = new Set();
      if (verifiedStatuses && verifiedStatuses.length > 0) {
        console.log("Verified statuses found:", verifiedStatuses);
        verifiedStatuses.forEach(item => {
          if (item.user_id) {
            verifiedUserIds.add(item.user_id);
          }
        });
      } else {
        console.log("No verified statuses found in the database");
      }
      
      console.log("Admin users set:", Array.from(adminUserIds));
      console.log("Verified users set:", Array.from(verifiedUserIds));

      // Map profiles to UserAdmin objects with role and verified status information
      const mappedUsers: UserAdmin[] = (usersRaw || []).map(profile => {
        const isAdmin = adminUserIds.has(profile.id);
        const isVerified = verifiedUserIds.has(profile.id);
        
        console.log(`User ${profile.id} (${profile.full_name}): isAdmin=${isAdmin}, isVerified=${isVerified}`);
        
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
