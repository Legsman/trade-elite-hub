
import { useCallback, useState } from "react";
import { assignOrRemoveAdminRole } from "@/utils/adminUtils";
import { UserAdmin } from "../types";
import { useAdminToastManager } from "@/hooks/useAdminToastManager";

export function useAdminRoleManagement(setUsers: React.Dispatch<React.SetStateAction<UserAdmin[]>>) {
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);
  const { createProcessingToast, updateToast } = useAdminToastManager();

  const promoteAdmin = useCallback(async (userId: string) => {
    console.log("Attempting to promote user to admin:", userId);
    if (loadingUserId) return { success: false, error: "Another operation is in progress" }; 
    
    setLoadingUserId(userId);
    const toastId = createProcessingToast("promote");
    
    // Optimistic update
    setUsers((prev: UserAdmin[]) =>
      prev.map(u =>
        u.id === userId ? { ...u, role: "admin", verified_status: "verified" } : u
      )
    );
    
    try {
      const { success, error, message } = await assignOrRemoveAdminRole(userId, "admin", "add");
      
      if (success) {
        updateToast(toastId, "success", "promote", {
          title: "Success", 
          description: message || "User has been made an admin."
        });
        return { success: true, message };
      } else {
        console.error("Failed to promote admin:", error);
        
        // Revert optimistic update
        setUsers((prev: UserAdmin[]) =>
          prev.map(u =>
            u.id === userId ? { ...u, role: "user" } : u
          )
        );
        
        updateToast(toastId, "error", "promote", undefined, error);
        return { success: false, error };
      }
    } catch (error) {
      console.error("Error during promotion:", error);
      // Revert optimistic update
      setUsers((prev: UserAdmin[]) =>
        prev.map(u =>
          u.id === userId ? { ...u, role: "user" } : u
        )
      );
      
      updateToast(toastId, "error", "promote", undefined, error);
      return { success: false, error };
    } finally {
      setLoadingUserId(null);
    }
  }, [setUsers, loadingUserId, createProcessingToast, updateToast]);

  const demoteAdmin = useCallback(async (userId: string) => {
    console.log("Attempting to demote admin:", userId);
    if (loadingUserId) return { success: false, error: "Another operation is in progress" };
    
    setLoadingUserId(userId);
    const toastId = createProcessingToast("demote");
    
    // Optimistic update
    setUsers((prev: UserAdmin[]) =>
      prev.map(u =>
        u.id === userId ? { ...u, role: "user" } : u
      )
    );
    
    try {
      const { success, error, message } = await assignOrRemoveAdminRole(userId, "admin", "remove");
      
      if (success) {
        updateToast(toastId, "success", "demote", {
          title: "Success", 
          description: message || "User has been demoted from admin."
        });
        return { success: true, message };
      } else {
        console.error("Failed to demote admin:", error);
        
        // Revert optimistic update
        setUsers((prev: UserAdmin[]) =>
          prev.map(u =>
            u.id === userId ? { ...u, role: "admin" } : u
          )
        );
        
        updateToast(toastId, "error", "demote", undefined, error);
        return { success: false, error };
      }
    } catch (error) {
      console.error("Error during demotion:", error);
      // Revert optimistic update
      setUsers((prev: UserAdmin[]) =>
        prev.map(u =>
          u.id === userId ? { ...u, role: "admin" } : u
        )
      );
      
      updateToast(toastId, "error", "demote", undefined, error);
      return { success: false, error };
    } finally {
      setLoadingUserId(null);
    }
  }, [setUsers, loadingUserId, createProcessingToast, updateToast]);

  return {
    promoteAdmin,
    demoteAdmin,
    loadingUserId,
  };
}
