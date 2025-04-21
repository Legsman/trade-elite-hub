
import { supabase } from "@/integrations/supabase/client";

// Securely assign or remove admin role by calling edge function
export async function assignOrRemoveAdminRole(targetUserId: string, role: string, action: "add" | "remove") {
  try {
    console.log(`Attempting to ${action} ${role} role for user ${targetUserId}`);
    
    // This function calls our edge function which uses the service role key
    // to bypass RLS policies and avoid recursion
    const { data, error } = await supabase.functions.invoke("admin-role-management", {
      body: { targetUserId, role, action }
    });
    
    if (error) {
      console.error("Error in edge function assignOrRemoveAdminRole:", error);
      return { success: false, error };
    }
    
    console.log(`Admin role ${action} response:`, data);
    
    if (data && data.success) {
      // Force refetch by waiting for the database to update
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true, message: data.message };
    }
    return { success: false, error: data?.error || "Failed" };
  } catch (e) {
    console.error("Exception calling assignOrRemoveAdminRole:", e);
    return { success: false, error: e };
  }
}

export async function assignOrRemoveVerifiedStatus(targetUserId: string, action: "add" | "remove") {
  try {
    console.log(`Attempting to ${action} verified status for user ${targetUserId}`);
    
    // Reuse the admin-role-management function but with 'verified' role
    const { data, error } = await supabase.functions.invoke("admin-role-management", {
      body: { targetUserId, role: 'verified', action }
    });
    
    if (error) {
      console.error("Error in edge function assignOrRemoveVerifiedStatus:", error);
      return { success: false, error };
    }
    
    console.log(`Verified status ${action} response:`, data);
    
    if (data && data.success) {
      // Force refetch by waiting for the database to update
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true, message: data.message };
    }
    return { success: false, error: data?.error || "Failed" };
  } catch (e) {
    console.error("Exception calling assignOrRemoveVerifiedStatus:", e);
    return { success: false, error: e };
  }
}

export async function checkUserRoles(userId: string) {
  try {
    console.log("Checking roles for user:", userId);
    // Direct query to user_roles table to check for roles
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);
      
    if (error) {
      console.error("Error checking user roles:", error);
      return { success: false, error, roles: [] };
    }
    
    console.log("User roles check result:", data);
    const roles = data ? data.map(r => r.role) : [];
    return { success: true, roles };
  } catch (e) {
    console.error("Exception checking user roles:", e);
    return { success: false, error: e, roles: [] };
  }
}

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};
