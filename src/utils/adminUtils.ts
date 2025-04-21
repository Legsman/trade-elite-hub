
import { supabase } from "@/integrations/supabase/client";

// Securely assign or remove admin role by calling edge function
export async function assignOrRemoveAdminRole(targetUserId: string, role: string, action: "add" | "remove") {
  try {
    // This function calls our edge function which uses the service role key
    // to bypass RLS policies and avoid recursion
    const { data, error } = await supabase.functions.invoke("admin-role-management", {
      body: { targetUserId, role, action }
    });
    
    if (error) {
      console.error("Error in edge function assignOrRemoveAdminRole:", error);
      return { success: false, error };
    }
    
    if (data && data.success) return { success: true };
    return { success: false, error: data?.error || "Failed" };
  } catch (e) {
    console.error("Exception calling assignOrRemoveAdminRole:", e);
    return { success: false, error: e };
  }
}

export async function checkUserRoles(userId: string) {
  try {
    // This bypasses RLS by using a direct RPC call to our security definer function
    const { data, error } = await supabase
      .rpc('rpc_is_admin');
      
    if (error) {
      console.error("Error checking user roles:", error);
      return { success: false, error, roles: [] };
    }
    
    const isAdmin = data && data.length > 0 && data[0].is_admin;
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
