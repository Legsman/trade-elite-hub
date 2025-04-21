import { supabase } from "@/integrations/supabase/client";

export async function assignOrRemoveAdminRole(targetUserId: string, role: string, action: "add" | "remove") {
  try {
    console.log(`Attempting to ${action} ${role} role for user ${targetUserId}`);
    
    const { data, error } = await supabase.functions.invoke("admin-role-management", {
      body: { targetUserId, role, action }
    });
    
    if (error) {
      console.error("Error in edge function assignOrRemoveAdminRole:", error);
      return { success: false, error };
    }
    
    console.log(`Admin role ${action} response:`, data);
    
    // Increased delay to ensure database propagation
    console.log("Waiting for database propagation (2s)...");
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (data && (data.success || data.message?.includes("already") || data.message?.includes("not found"))) {
      return { 
        success: true, 
        message: data.message || `Role ${action === 'add' ? 'added' : 'removed'} successfully`,
        alreadyDone: data.message?.includes("already") || data.message?.includes("not found")
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
    
    if (error) {
      console.error("Error in edge function assignOrRemoveVerifiedStatus:", error);
      return { success: false, error };
    }
    
    console.log(`Verified status ${action} response:`, data);
    
    // Increased delay to ensure database propagation
    console.log("Waiting for database propagation (2s)...");
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (data && (data.success || data.message?.includes("already") || data.message?.includes("not found"))) {
      return { 
        success: true, 
        message: data.message || `Verification ${action === 'add' ? 'added' : 'removed'} successfully`,
        alreadyDone: data.message?.includes("already") || data.message?.includes("not found")
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
