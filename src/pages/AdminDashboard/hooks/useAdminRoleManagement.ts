
import { useCallback, useState } from "react";
import { assignOrRemoveAdminRole } from "@/utils/adminUtils";
import { UserAdmin } from "../types";
import { useAdminToastManager } from "@/hooks/useAdminToastManager";

export function useAdminRoleManagement(setUsers: React.Dispatch<React.SetStateAction<UserAdmin[]>>) {
  // Track operations by user ID
  const [pendingOperations, setPendingOperations] = useState<Record<string, boolean>>({});
  const { toast } = useAdminToastManager();

  const promoteAdmin = useCallback(async (userId: string) => {
    if (pendingOperations[userId]) {
      console.log("Operation already in progress for this user:", userId);
      return { success: false, error: "Another operation is in progress" }; 
    }
    
    const operationId = `promote_${userId}`;
    console.log("Attempting to promote user to admin:", userId);
    
    // Set pending operation
    setPendingOperations(prev => ({ ...prev, [userId]: true }));
    
    // Show loading toast
    toast.loading({
      title: "Processing",
      description: "Promoting user to admin...",
      id: operationId
    });
    
    // Optimistic update
    setUsers((prev: UserAdmin[]) =>
      prev.map(u =>
        u.id === userId ? { ...u, role: "admin", verified_status: "verified" } : u
      )
    );
    
    try {
      const { success, error, message } = await assignOrRemoveAdminRole(userId, "admin", "add");
      
      if (success) {
        toast.success({
          title: "Success", 
          description: message || "User has been made an admin.",
          id: operationId
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
        
        toast.error({
          title: "Failed to promote user", 
          description: error ? String(error) : "An unknown error occurred",
          id: operationId
        });
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
      
      toast.error({
        title: "Failed to promote user",
        description: error ? String(error) : "An unknown error occurred",
        id: operationId
      });
      return { success: false, error };
    } finally {
      // Clear pending operation
      setPendingOperations(prev => ({ ...prev, [userId]: false }));
    }
  }, [pendingOperations, toast, setUsers]);

  const demoteAdmin = useCallback(async (userId: string) => {
    if (pendingOperations[userId]) {
      console.log("Operation already in progress for this user:", userId);
      return { success: false, error: "Another operation is in progress" };
    }
    
    const operationId = `demote_${userId}`;
    console.log("Attempting to demote admin:", userId);
    
    // Set pending operation
    setPendingOperations(prev => ({ ...prev, [userId]: true }));
    
    // Show loading toast
    toast.loading({
      title: "Processing",
      description: "Removing admin privileges...",
      id: operationId
    });
    
    // Optimistic update
    setUsers((prev: UserAdmin[]) =>
      prev.map(u =>
        u.id === userId ? { ...u, role: "user" } : u
      )
    );
    
    try {
      const { success, error, message } = await assignOrRemoveAdminRole(userId, "admin", "remove");
      
      if (success) {
        toast.success({
          title: "Success", 
          description: message || "User has been demoted from admin.",
          id: operationId
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
        
        toast.error({
          title: "Failed to demote user", 
          description: error ? String(error) : "An unknown error occurred",
          id: operationId
        });
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
      
      toast.error({
        title: "Failed to demote user",
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
    promoteAdmin,
    demoteAdmin,
    pendingOperations,
    isPendingForUser: (userId: string) => pendingOperations[userId] || false
  };
}
