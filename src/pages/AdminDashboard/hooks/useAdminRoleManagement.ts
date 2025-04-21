
import { useCallback, useState } from "react";
import { assignOrRemoveAdminRole } from "@/utils/adminUtils";
import { toast } from "@/hooks/use-toast";
import { UserAdmin } from "../types";

export function useAdminRoleManagement(setUsers: React.Dispatch<React.SetStateAction<UserAdmin[]>>) {
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);

  const promoteAdmin = useCallback(async (userId: string) => {
    console.log("Attempting to promote user to admin:", userId);
    setLoadingUserId(userId);
    
    const toastId = toast({ 
      title: "Processing", 
      description: "Promoting user to admin..." 
    });
    
    setUsers((prev: UserAdmin[]) =>
      prev.map(u =>
        u.id === userId ? { ...u, role: "admin", verified_status: "verified" } : u
      )
    );
    
    const { success, error, message } = await assignOrRemoveAdminRole(userId, "admin", "add");
    
    setLoadingUserId(null);
    
    if (success) {
      toast({ 
        title: "Success", 
        description: message || "User has been made an admin" 
      });
    } else {
      console.error("Failed to promote admin:", error);
      
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
  }, [setUsers]);

  const demoteAdmin = useCallback(async (userId: string) => {
    console.log("Attempting to demote admin:", userId);
    setLoadingUserId(userId);
    
    const toastId = toast({ 
      title: "Processing", 
      description: "Removing admin privileges..." 
    });
    
    setUsers((prev: UserAdmin[]) =>
      prev.map(u =>
        u.id === userId ? { ...u, role: "user" } : u
      )
    );
    
    const { success, error, message } = await assignOrRemoveAdminRole(userId, "admin", "remove");
    
    setLoadingUserId(null);
    
    if (success) {
      toast({ 
        title: "Success", 
        description: message || "User has been demoted from admin" 
      });
    } else {
      console.error("Failed to demote admin:", error);
      
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
  }, [setUsers]);

  return {
    promoteAdmin,
    demoteAdmin,
    loadingUserId,
  };
}
