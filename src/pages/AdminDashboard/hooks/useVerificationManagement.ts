
import { useCallback, useState } from "react";
import { assignOrRemoveVerifiedStatus } from "@/utils/adminUtils";
import { UserAdmin } from "../types";
import { useAdminToastManager } from "@/hooks/useAdminToastManager";

export function useVerificationManagement(setUsers: React.Dispatch<React.SetStateAction<UserAdmin[]>>) {
  // Track operations by user ID
  const [pendingOperations, setPendingOperations] = useState<Record<string, boolean>>({});
  const { toast } = useAdminToastManager();

  const toggleVerifiedStatus = useCallback(async (userId: string, currentStatus: "verified" | "unverified") => {
    if (pendingOperations[userId]) {
      console.log("Operation already in progress for this user:", userId);
      return { success: false, error: "Operation already in progress" };
    }

    console.log("Toggling verified status for user:", userId, "Current status:", currentStatus);
    const action = currentStatus === "unverified" ? "add" : "remove";
    const operationId = `verification_${userId}`;
    
    // Set pending operation
    setPendingOperations(prev => ({ ...prev, [userId]: true }));
    
    // Show loading toast
    toast.loading({
      title: "Processing",
      description: `${action === "add" ? "Verifying" : "Unverifying"} user...`,
      id: operationId
    });
    
    // Optimistic update
    setUsers((prev: UserAdmin[]) =>
      prev.map(u =>
        u.id === userId ? { ...u, verified_status: action === "add" ? "verified" : "unverified" } : u
      )
    );
    
    try {
      const { success, error, message } = await assignOrRemoveVerifiedStatus(userId, action);
      
      if (success) {
        toast.success({
          title: "Success", 
          description: message || `User has been ${action === "add" ? "verified" : "unverified"}`,
          id: operationId
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
        
        toast.error({
          title: `Failed to ${action === "add" ? "verify" : "unverify"} user`, 
          description: error ? String(error) : "An unknown error occurred",
          id: operationId
        });
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
      
      toast.error({
        title: `Failed to ${action === "add" ? "verify" : "unverify"} user`,
        description: error ? String(error) : "An unknown error occurred",
        id: operationId
      });
      return { success: false, error };
    } finally {
      // Clear pending operation
      setPendingOperations(prev => ({ ...prev, [userId]: false }));
    }
  }, [pendingOperations, toast, setUsers]);

  return {
    toggleVerifiedStatus,
    isPending: Object.values(pendingOperations).some(Boolean),
    pendingUserIds: Object.keys(pendingOperations).filter(key => pendingOperations[key])
  };
}
