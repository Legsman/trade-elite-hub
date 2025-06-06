
import { useCallback } from "react";
import { UserAdmin } from "../types";
import { supabase } from "@/integrations/supabase/client";

export function useVerificationManagement(
  setUsers: React.Dispatch<React.SetStateAction<UserAdmin[]>>,
  startOperation: (type: string, id: string) => string,
  finishOperation: (key: string) => void
) {
  const toggleVerifiedStatus = useCallback(async (userId: string, currentStatus: "verified" | "unverified") => {
    const newStatus = currentStatus === "verified" ? "unverified" : "verified";
    const action = newStatus === "verified" ? "add" : "remove";
    const operationKey = startOperation("verify", userId);

    try {
      // Optimistic update
      setUsers(prev => 
        prev.map(user => 
          user.id === userId 
            ? { ...user, verified_status: newStatus } 
            : user
        )
      );
      
      console.log(`Sending verification toggle request: ${action} verified role for user ${userId}`);
      
      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke("admin-role-management", {
        body: {
          action: action,
          role: "verified",
          targetUserId: userId
        }
      });
      
      console.log(`Verification toggle full response:`, { data, error, rawData: JSON.stringify(data) });
      
      if (error) {
        throw new Error(`Failed to toggle verification status: ${error.message}`);
      }
      
      // Enhanced response handling - assume success unless explicitly failed
      const isSuccess = !error && (data === null || data === undefined || data.success !== false);
      const alreadyDone = data?.message?.includes("already") || data?.message?.includes("not found");
      
      if (alreadyDone) {
        console.log(`User ${userId} status was already ${newStatus} - considering operation successful`);
        return { 
          success: true, 
          message: data?.message || `User ${newStatus === "verified" ? "verified" : "unverified"} successfully`,
          alreadyDone: true
        };
      }
      
      if (!isSuccess) {
        throw new Error(data?.message || "Failed to toggle verification status");
      }
      
      return { 
        success: true, 
        message: data?.message || `User ${newStatus === "verified" ? "verified" : "unverified"} successfully`,
        alreadyDone: false
      };
      
    } catch (error) {
      console.error("Error toggling verification status:", error);
      
      // Revert the optimistic update
      setUsers(prev => 
        prev.map(user => 
          user.id === userId ? { ...user, verified_status: currentStatus } : user
        )
      );
      
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error("Failed to toggle verification status") 
      };
    } finally {
      finishOperation(operationKey);
    }
  }, [setUsers, startOperation, finishOperation]);

  return {
    toggleVerifiedStatus
  };
}
