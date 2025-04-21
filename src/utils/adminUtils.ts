
import { supabase } from "@/integrations/supabase/client";

export async function assignAdminRole(userId: string) {
  try {
    const { error } = await supabase
      .from("user_roles")
      .upsert({ 
        user_id: userId, 
        role: "admin" 
      }, { 
        onConflict: 'user_id,role' 
      });
    
    if (error) {
      console.error("Error assigning admin role:", error);
      return { success: false, error };
    }
    
    return { success: true };
  } catch (e) {
    console.error("Exception assigning admin role:", e);
    return { success: false, error: e };
  }
}

export async function checkUserRoles(userId: string) {
  try {
    const { data, error } = await supabase
      .from("user_roles")
      .select("*")
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
