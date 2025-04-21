
import { useCallback, useState } from "react";
import { assignOrRemoveVerifiedStatus } from "@/utils/adminUtils";
import { UserAdmin } from "../types";
import { useAdminToastManager } from "@/hooks/useAdminToastManager";

export function useVerificationManagement(setUsers: React.Dispatch<React.SetStateAction<UserAdmin[]>>) {
  const [pendingOperation, setPendingOperation] = useState<string | null>(null);
  const { createProcessingToast, updateToast } = useAdminToastManager();

  const toggleVerifiedStatus = useCallback(async (userId: string, currentStatus: "verified" | "unverified") => {
    if (pendingOperation === userId) {
      console.log("Operation already in progress for this user");
      return { success: false, error: "Operation already in progress" };
    }

    console.log("Toggling verified status for user:", userId, "Current status:", currentStatus);
    const action = currentStatus === "unverified" ? "add" : "remove";
    
    // Set pending operation to prevent multiple actions on the same user
    setPendingOperation(userId);

    // Create the processing toast
    const toastAction = action === "add" ? "verify" : "unverify";
    const toastId = createProcessingToast(toastAction);
    
    // Optimistic update
    setUsers((prev: UserAdmin[]) =>
      prev.map(u =>
        u.id === userId ? { ...u, verified_status: action === "add" ? "verified" : "unverified" } : u
      )
    );
    
    try {
      const { success, error, message } = await assignOrRemoveVerifiedStatus(userId, action);
      
      if (success) {
        updateToast(toastId, "success", toastAction, {
          title: "Success", 
          description: message || `User has been ${action === "add" ? "verified" : "unverified"}`
        });
        return { success: true };
      } else {
        console.error("Failed to update verification status:", error);
        
        // Revert optimistic update
        setUsers((prev: UserAdmin[]) =>
          prev.map(u =>
            u.id === userId ? { ...u, verified_status: currentStatus } : u
          )
        );
        
        updateToast(toastId, "error", toastAction, undefined, error);
        return { success: false, error };
      }
    } catch (error) {
      console.error("Exception during verification status update:", error);
      
      // Revert optimistic update
      setUsers((prev: UserAdmin[]) =>
        prev.map(u =>
          u.id === userId ? { ...u, verified_status: currentStatus } : u
        )
      );
      
      updateToast(toastId, "error", toastAction, undefined, error);
      return { success: false, error };
    } finally {
      setPendingOperation(null);
    }
  }, [setUsers, pendingOperation, createProcessingToast, updateToast]);

  return {
    toggleVerifiedStatus,
    isPending: !!pendingOperation,
    pendingUserId: pendingOperation
  };
}
