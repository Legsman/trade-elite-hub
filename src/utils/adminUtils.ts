
import { supabase } from "@/integrations/supabase/client";

// Securely assign or remove admin role by calling edge function
export async function assignOrRemoveAdminRole(targetUserId: string, role: string, action: "add" | "remove") {
  try {
    // Only admins should be able to call this function on backend; so we use edge function protection
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
    // Use direct query to avoid recursion issues
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
      
    if (error) {
      console.error("Error checking user roles:", error);
      return { success: false, error, roles: [] };
    }
    
    return { success: true, roles: data };
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
