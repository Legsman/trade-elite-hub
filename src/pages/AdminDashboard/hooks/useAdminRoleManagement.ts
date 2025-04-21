
import { useCallback, useState } from "react";
import { assignOrRemoveAdminRole } from "@/utils/adminUtils";
import { toast } from "@/hooks/use-toast";
import { UserAdmin } from "../types";

export function useAdminRoleManagement(setUsers: React.Dispatch<React.SetStateAction<UserAdmin[]>>) {
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);

  const promoteAdmin = useCallback(async (userId: string) => {
    console.log("Attempting to promote user to admin:", userId);
    if (loadingUserId) return; // Prevent multiple operations
    
    setLoadingUserId(userId);
    const toastId = toast({ 
      title: "Processing", 
      description: "Promoting user to admin...",
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
        toast({ 
          title: "Success", 
          description: message || "User has been made an admin.",
        });
      } else {
        console.error("Failed to promote admin:", error);
        
        // Revert optimistic update
        setUsers((prev: UserAdmin[]) =>
          prev.map(u =>
            u.id === userId ? { ...u, role: "user" } : u
          )
        );
        
        toast({ 
          title: "Failed to promote", 
          description: error?.message || String(error) || "Failed", 
          variant: "destructive" 
        });
      }
    } catch (error) {
      console.error("Error during promotion:", error);
      // Revert optimistic update
      setUsers((prev: UserAdmin[]) =>
        prev.map(u =>
          u.id === userId ? { ...u, role: "user" } : u
        )
      );
      
      toast({ 
        title: "Error", 
        description: "An unexpected error occurred", 
        variant: "destructive" 
      });
    } finally {
      setLoadingUserId(null);
    }
  }, [setUsers, loadingUserId]);

  const demoteAdmin = useCallback(async (userId: string) => {
    console.log("Attempting to demote admin:", userId);
    if (loadingUserId) return; // Prevent multiple operations
    
    setLoadingUserId(userId);
    const toastId = toast({ 
      title: "Processing", 
      description: "Removing admin privileges...",
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
        toast({ 
          title: "Success", 
          description: message || "User has been demoted from admin.",
        });
      } else {
        console.error("Failed to demote admin:", error);
        
        // Revert optimistic update
        setUsers((prev: UserAdmin[]) =>
          prev.map(u =>
            u.id === userId ? { ...u, role: "admin" } : u
          )
        );
        
        toast({ 
          title: "Failed to demote", 
          description: error?.message || String(error) || "Failed", 
          variant: "destructive" 
        });
      }
    } catch (error) {
      console.error("Error during demotion:", error);
      // Revert optimistic update
      setUsers((prev: UserAdmin[]) =>
        prev.map(u =>
          u.id === userId ? { ...u, role: "admin" } : u
        )
      );
      
      toast({ 
        title: "Error", 
        description: "An unexpected error occurred", 
        variant: "destructive" 
      });
    } finally {
      setLoadingUserId(null);
    }
  }, [setUsers, loadingUserId]);

  return {
    promoteAdmin,
    demoteAdmin,
    loadingUserId,
  };
}
