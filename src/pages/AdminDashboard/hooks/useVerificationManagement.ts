
import { useCallback } from "react";
import { UserAdmin } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { useAdminToastManager } from "@/hooks/useAdminToastManager";

export function useVerificationManagement(
  setUsers: React.Dispatch<React.SetStateAction<UserAdmin[]>>,
  startOperation: (type: string, id: string) => string,
  finishOperation: (key: string) => void
) {
  const { toast } = useAdminToastManager();
  
  const toggleVerifiedStatus = useCallback(async (userId: string, currentStatus: "verified" | "unverified") => {
    // Determine the action based on current status
    const action = currentStatus === "verified" ? "remove" : "add";
    const operationKey = startOperation("verification", userId);
    const toastId = `verify_${userId}`;
    
    // Show loading toast
    toast.loading({
      id: toastId,
      title: `${action === "add" ? "Verifying" : "Unverifying"} User`,
      description: "Processing your request..."
    });
    
    try {
      // Optimistic update on the UI
      setUsers(prev => 
        prev.map(user => 
          user.id === userId 
            ? { ...user, verified_status: currentStatus === "verified" ? "unverified" : "verified" } 
            : user
        )
      );
      
      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke("admin-role-management", {
        body: {
          action: action,
          role: "verified",
          targetUserId: userId
        }
      });
      
      if (error) {
        throw new Error(`Failed to ${action} verified status: ${error.message}`);
      }
      
      if (!data?.success) {
        throw new Error(data?.message || `Failed to ${action} verified status`);
      }
      
      toast.success({
        id: toastId,
        title: "Success",
        description: `User ${action === "add" ? "verified" : "unverified"} successfully`
      });
      
      return { success: true, message: data.message };
      
    } catch (error) {
      console.error(`Error ${action === "add" ? "verifying" : "unverifying"} user:`, error);
      
      // Revert the optimistic update
      setUsers(prev => 
        prev.map(user => 
          user.id === userId ? { ...user, verified_status: currentStatus } : user
        )
      );
      
      toast.error({
        id: toastId,
        title: "Operation Failed",
        description: error instanceof Error ? error.message : `Failed to ${action} verified status`
      });
      
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error(`Failed to ${action} verified status`) 
      };
    } finally {
      finishOperation(operationKey);
    }
  }, [setUsers, toast, startOperation, finishOperation]);
  
  return {
    toggleVerifiedStatus
  };
}
