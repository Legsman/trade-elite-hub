
import { useCallback } from "react";
import { UserAdmin } from "../types";
import { supabase } from "@/integrations/supabase/client";

export function useAdminRoleManagement(
  setUsers: React.Dispatch<React.SetStateAction<UserAdmin[]>>,
  startOperation: (type: string, id: string) => string,
  finishOperation: (key: string) => void
) {
  const promoteAdmin = useCallback(async (userId: string) => {
    const operationKey = startOperation("promote", userId);
    
    try {
      // Optimistic update - admin automatically becomes trader
      setUsers(prev => 
        prev.map(user => 
          user.id === userId 
            ? { ...user, role: "admin", verified_status: "trader" } 
            : user
        )
      );
      
      console.log(`Sending promote admin request for user ${userId}`);
      
      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke("admin-role-management", {
        body: {
          action: "add",
          role: "admin",
          targetUserId: userId
        }
      });
      
      console.log(`Promote admin response:`, { data, error, rawData: JSON.stringify(data) });
      
      if (error) {
        throw new Error(`Failed to promote user: ${error.message}`);
      }
      
      // Enhanced response handling - assume success unless explicitly failed
      const isSuccess = !error && (data === null || data === undefined || data.success !== false);
      const alreadyDone = data?.message?.includes("already");
      
      if (data?.message?.includes("already")) {
        console.log(`User ${userId} was already admin - considering operation successful`);
        return { 
          success: true, 
          message: data.message || "User already has admin role", 
          alreadyDone: true 
        };
      }
      
      if (!isSuccess) {
        throw new Error(data?.message || "Failed to promote user");
      }
      
      return { success: true, message: data?.message || "User promoted to admin successfully", alreadyDone: false };
      
    } catch (error) {
      console.error("Error promoting user:", error);
      
      // Revert the optimistic update
      setUsers(prev => 
        prev.map(user => 
          user.id === userId ? { ...user, role: "user" } : user
        )
      );
      
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error("Failed to promote user") 
      };
    } finally {
      finishOperation(operationKey);
    }
  }, [setUsers, startOperation, finishOperation]);

  const demoteAdmin = useCallback(async (userId: string) => {
    const operationKey = startOperation("demote", userId);
    
    try {
      // Optimistic update
      setUsers(prev => 
        prev.map(user => 
          user.id === userId 
            ? { ...user, role: "user" } 
            : user
        )
      );
      
      console.log(`Sending demote admin request for user ${userId}`);
      
      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke("admin-role-management", {
        body: {
          action: "remove",
          role: "admin",
          targetUserId: userId
        }
      });
      
      console.log(`Demote admin response:`, { data, error, rawData: JSON.stringify(data) });
      
      if (error) {
        throw new Error(`Failed to demote user: ${error.message}`);
      }
      
      // Enhanced response handling - assume success unless explicitly failed
      const isSuccess = !error && (data === null || data === undefined || data.success !== false);
      const alreadyDone = data?.message?.includes("not found");
      
      if (data?.message?.includes("not found")) {
        console.log(`User ${userId} was not an admin - considering operation successful`);
        return { 
          success: true, 
          message: data.message || "User already removed from admin role", 
          alreadyDone: true 
        };
      }
      
      if (!isSuccess) {
        throw new Error(data?.message || "Failed to demote user");
      }
      
      return { success: true, message: data?.message || "User removed from admin role successfully", alreadyDone: false };
      
    } catch (error) {
      console.error("Error demoting user:", error);
      
      // Revert the optimistic update
      setUsers(prev => 
        prev.map(user => 
          user.id === userId ? { ...user, role: "admin" } : user
        )
      );
      
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error("Failed to demote user") 
      };
    } finally {
      finishOperation(operationKey);
    }
  }, [setUsers, startOperation, finishOperation]);

  return {
    promoteAdmin,
    demoteAdmin,
  };
}
