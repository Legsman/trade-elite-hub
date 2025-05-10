
import { useCallback } from "react";
import { UserAdmin } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { useAdminToastManager } from "@/hooks/useAdminToastManager";

export function useAdminRoleManagement(
  setUsers: React.Dispatch<React.SetStateAction<UserAdmin[]>>,
  startOperation: (type: string, id: string) => string,
  finishOperation: (key: string) => void
) {
  const { toast } = useAdminToastManager();

  const promoteAdmin = useCallback(async (userId: string) => {
    const operationKey = startOperation("promote", userId);
    const toastId = `promote_${userId}`;
    
    // Show loading toast
    toast.loading({
      id: toastId,
      title: "Promoting User",
      description: "Processing promotion request..."
    });
    
    try {
      // Optimistic update
      setUsers(prev => 
        prev.map(user => 
          user.id === userId 
            ? { ...user, role: "admin", verified_status: "verified" } 
            : user
        )
      );
      
      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke("admin-role-management", {
        body: {
          action: "add",
          role: "admin",
          targetUserId: userId
        }
      });
      
      if (error) {
        throw new Error(`Failed to promote user: ${error.message}`);
      }
      
      if (!data?.success) {
        throw new Error(data?.message || "Failed to promote user");
      }
      
      toast.success({
        id: toastId,
        title: "User Promoted",
        description: "User has been successfully promoted to admin"
      });
      
      return { success: true, message: data.message };
      
    } catch (error) {
      console.error("Error promoting user:", error);
      
      // Revert the optimistic update
      setUsers(prev => 
        prev.map(user => 
          user.id === userId ? { ...user, role: "user" } : user
        )
      );
      
      toast.error({
        id: toastId,
        title: "Promotion Failed",
        description: error instanceof Error ? error.message : "Failed to promote user to admin"
      });
      
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error("Failed to promote user") 
      };
    } finally {
      finishOperation(operationKey);
    }
  }, [setUsers, toast, startOperation, finishOperation]);

  const demoteAdmin = useCallback(async (userId: string) => {
    const operationKey = startOperation("demote", userId);
    const toastId = `demote_${userId}`;
    
    // Show loading toast
    toast.loading({
      id: toastId,
      title: "Demoting User",
      description: "Processing demotion request..."
    });
    
    try {
      // Optimistic update
      setUsers(prev => 
        prev.map(user => 
          user.id === userId 
            ? { ...user, role: "user" } 
            : user
        )
      );
      
      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke("admin-role-management", {
        body: {
          action: "remove",
          role: "admin",
          targetUserId: userId
        }
      });
      
      if (error) {
        throw new Error(`Failed to demote user: ${error.message}`);
      }
      
      if (!data?.success) {
        throw new Error(data?.message || "Failed to demote user");
      }
      
      toast.success({
        id: toastId,
        title: "User Demoted",
        description: "User has been successfully removed from admin role"
      });
      
      return { success: true, message: data.message };
      
    } catch (error) {
      console.error("Error demoting user:", error);
      
      // Revert the optimistic update
      setUsers(prev => 
        prev.map(user => 
          user.id === userId ? { ...user, role: "admin" } : user
        )
      );
      
      toast.error({
        id: toastId,
        title: "Demotion Failed",
        description: error instanceof Error ? error.message : "Failed to demote user from admin"
      });
      
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error("Failed to demote user") 
      };
    } finally {
      finishOperation(operationKey);
    }
  }, [setUsers, toast, startOperation, finishOperation]);

  return {
    promoteAdmin,
    demoteAdmin,
  };
}
