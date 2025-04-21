
import { useCallback } from "react";
import { assignOrRemoveVerifiedStatus } from "@/utils/adminUtils";
import { toast } from "@/hooks/use-toast";
import { UserAdmin } from "../types";

export function useVerificationManagement(setUsers: React.Dispatch<React.SetStateAction<UserAdmin[]>>) {
  const toggleVerifiedStatus = useCallback(async (userId: string, currentStatus: "verified" | "unverified") => {
    console.log("Toggling verified status for user:", userId, "Current status:", currentStatus);
    const action = currentStatus === "unverified" ? "add" : "remove";
    
    const toastId = toast({ 
      title: "Processing", 
      description: `${action === "add" ? "Verifying" : "Unverifying"} user...` 
    });
    
    setUsers((prev: UserAdmin[]) =>
      prev.map(u =>
        u.id === userId ? { ...u, verified_status: action === "add" ? "verified" : "unverified" } : u
      )
    );
    
    const { success, error, message } = await assignOrRemoveVerifiedStatus(userId, action);
    
    if (success) {
      toast({ 
        title: "Success", 
        description: message || `User has been ${action === "add" ? "verified" : "unverified"}`
      });
    } else {
      console.error("Failed to update verification status:", error);
      
      setUsers((prev: UserAdmin[]) =>
        prev.map(u =>
          u.id === userId ? { ...u, verified_status: currentStatus } : u
        )
      );
      
      toast({ 
        title: "Failed to update verification status", 
        description: error?.message || String(error) || "Failed", 
        variant: "destructive" 
      });
    }
  }, [setUsers]);

  return {
    toggleVerifiedStatus,
  };
}
