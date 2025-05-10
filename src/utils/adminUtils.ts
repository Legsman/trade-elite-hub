
import { supabase } from "@/integrations/supabase/client";

export async function assignOrRemoveAdminRole(targetUserId: string, role: string, action: "add" | "remove") {
  try {
    console.log(`Attempting to ${action} ${role} role for user ${targetUserId}`);
    
    const { data, error } = await supabase.functions.invoke("admin-role-management", {
      body: { targetUserId, role, action }
    });
    
    console.log(`Full edge function response:`, { data, error });
    
    if (error) {
      console.error("Error in edge function assignOrRemoveAdminRole:", error);
      return { success: false, error };
    }
    
    // Check if we have a successful response - assume success if no explicit error
    // and either data.success is true or not provided
    const isSuccess = !error && (data === null || data === undefined || data.success !== false);
    const alreadyDone = data?.message?.includes("already") || data?.message?.includes("not found");
    
    if (isSuccess || alreadyDone) {
      return { 
        success: true, 
        message: data?.message || `Role ${action === 'add' ? 'added' : 'removed'} successfully`,
        alreadyDone
      };
    }
    
    return { success: false, error: data?.error || "Failed to update role" };
  } catch (e) {
    console.error("Exception calling assignOrRemoveAdminRole:", e);
    return { success: false, error: e };
  }
}

export async function assignOrRemoveVerifiedStatus(targetUserId: string, action: "add" | "remove") {
  try {
    console.log(`Attempting to ${action} verified status for user ${targetUserId}`);
    
    const { data, error } = await supabase.functions.invoke("admin-role-management", {
      body: { targetUserId, role: 'verified', action }
    });
    
    console.log(`Full edge function response:`, { data, error });
    
    if (error) {
      console.error("Error in edge function assignOrRemoveVerifiedStatus:", error);
      return { success: false, error };
    }
    
    // Check if we have a successful response - assume success if no explicit error
    // and either data.success is true or not provided
    const isSuccess = !error && (data === null || data === undefined || data.success !== false);
    const alreadyDone = data?.message?.includes("already") || data?.message?.includes("not found");
    
    if (isSuccess || alreadyDone) {
      return { 
        success: true, 
        message: data?.message || `Verification ${action === 'add' ? 'added' : 'removed'} successfully`,
        alreadyDone
      };
    }
    
    return { success: false, error: data?.error || "Failed to update verification status" };
  } catch (e) {
    console.error("Exception calling assignOrRemoveVerifiedStatus:", e);
    return { success: false, error: e };
  }
}

export async function checkUserRoles(userId: string) {
  try {
    console.log("Checking roles for user:", userId);
    // Use the RPC function to get user roles instead of direct table query
    const { data, error } = await supabase
      .rpc('get_user_roles', { _user_id: userId });
      
    if (error) {
      console.error("Error checking user roles:", error);
      return { success: false, error, roles: [] };
    }
    
    console.log("User roles check result:", data);
    const roles = data || [];
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
