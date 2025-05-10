
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
      
      return { success: true, message: data.message };
      
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
      
      return { success: true, message: data.message };
      
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
