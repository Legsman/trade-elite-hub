
import { useCallback, useState } from "react";
import { assignOrRemoveAdminRole } from "@/utils/adminUtils";
import { UserAdmin } from "../types";
import { useAdminToastManager } from "@/hooks/useAdminToastManager";

export function useAdminRoleManagement(setUsers: React.Dispatch<React.SetStateAction<UserAdmin[]>>) {
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);
  const { toast } = useAdminToastManager();

  const promoteAdmin = useCallback(async (userId: string) => {
    console.log("Attempting to promote user to admin:", userId);
    if (loadingUserId) return { success: false, error: "Another operation is in progress" }; 
    
    setLoadingUserId(userId);
    
    // Show loading toast
    toast.loading({
      title: "Processing",
      description: "Promoting user to admin..."
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
        
        toast.error({
          title: "Failed to promote user", 
          description: error ? String(error) : "An unknown error occurred"
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
        description: error ? String(error) : "An unknown error occurred"
      });
      return { success: false, error };
    } finally {
      setLoadingUserId(null);
    }
  }, [setUsers, loadingUserId, toast]);

  const demoteAdmin = useCallback(async (userId: string) => {
    console.log("Attempting to demote admin:", userId);
    if (loadingUserId) return { success: false, error: "Another operation is in progress" };
    
    setLoadingUserId(userId);
    
    // Show loading toast
    toast.loading({
      title: "Processing",
      description: "Removing admin privileges..."
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
        
        toast.error({
          title: "Failed to demote user", 
          description: error ? String(error) : "An unknown error occurred"
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
        description: error ? String(error) : "An unknown error occurred"
      });
      return { success: false, error };
    } finally {
      setLoadingUserId(null);
    }
  }, [setUsers, loadingUserId, toast]);

  return {
    promoteAdmin,
    demoteAdmin,
    loadingUserId,
  };
}
