
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
      return { success: true };
    }
    return { success: false, error: data?.error || "Failed" };
  } catch (e) {
    console.error("Exception calling assignOrRemoveAdminRole:", e);
    return { success: false, error: e };
  }
}

export async function checkUserRoles(userId: string) {
  try {
    console.log("Checking admin role for user:", userId);
    // Direct query to user_roles table to check for admin role
    // This is secure because it's only called from the admin panel
    // which already verifies the user is an admin via AdminRoute.tsx
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin');
      
    if (error) {
      console.error("Error checking user roles:", error);
      return { success: false, error, roles: [] };
    }
    
    console.log("Admin role check result:", data);
    const isAdmin = data && data.length > 0;
    return { success: true, roles: isAdmin ? ['admin'] : [] };
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
