
import { useCallback, useState } from "react";
import { assignOrRemoveAdminRole, assignOrRemoveVerifiedStatus } from "@/utils/adminUtils";
import { toast } from "@/hooks/use-toast";
import { UserAdmin, ListingAdmin, ReportAdmin } from "../types";
import { Loader2 } from "lucide-react";

export function useAdminActions(setUsers: any, setListings: any, setReports: any) {
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);

  const promoteAdmin = useCallback(async (userId: string) => {
    console.log("Attempting to promote user to admin:", userId);
    setLoadingUserId(userId);
    
    // Show a toast notification that operation is in progress
    const toastId = toast({ 
      title: "Processing", 
      description: "Promoting user to admin..." 
    });
    
    // Optimistically update UI first
    setUsers((prev: UserAdmin[]) =>
      prev.map(u =>
        u.id === userId ? { ...u, role: "admin", verified_status: "verified" } : u
      )
    );
    
    // Make the actual API call
    const { success, error, message } = await assignOrRemoveAdminRole(userId, "admin", "add");
    
    setLoadingUserId(null);
    
    if (success) {
      toast({ 
        title: "Success", 
        description: message || "User has been made an admin" 
      });
    } else {
      console.error("Failed to promote admin:", error);
      
      // Revert the optimistic update
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
  }, [setUsers, toast]);

  const demoteAdmin = useCallback(async (userId: string) => {
    console.log("Attempting to demote admin:", userId);
    setLoadingUserId(userId);
    
    // Show a toast notification that operation is in progress
    const toastId = toast({ 
      title: "Processing", 
      description: "Removing admin privileges..." 
    });
    
    // Optimistically update UI first
    setUsers((prev: UserAdmin[]) =>
      prev.map(u =>
        u.id === userId ? { ...u, role: "user" } : u
      )
    );
    
    // Make the actual API call
    const { success, error, message } = await assignOrRemoveAdminRole(userId, "admin", "remove");
    
    setLoadingUserId(null);
    
    if (success) {
      toast({ 
        title: "Success", 
        description: message || "User has been demoted from admin" 
      });
    } else {
      console.error("Failed to demote admin:", error);
      
      // Revert the optimistic update
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
  }, [setUsers, toast]);

  const toggleVerifiedStatus = useCallback(async (userId: string, currentStatus: "verified" | "unverified") => {
    console.log("Toggling verified status for user:", userId, "Current status:", currentStatus);
    const action = currentStatus === "unverified" ? "add" : "remove";
    setLoadingUserId(userId);
    
    // Show a toast notification that operation is in progress
    const toastId = toast({ 
      title: "Processing", 
      description: `${action === "add" ? "Verifying" : "Unverifying"} user...` 
    });
    
    // Optimistically update UI first
    setUsers((prev: UserAdmin[]) =>
      prev.map(u =>
        u.id === userId ? { ...u, verified_status: action === "add" ? "verified" : "unverified" } : u
      )
    );
    
    // Make the actual API call
    const { success, error, message } = await assignOrRemoveVerifiedStatus(userId, action);
    
    setLoadingUserId(null);
    
    if (success) {
      toast({ 
        title: "Success", 
        description: message || `User has been ${action === "add" ? "verified" : "unverified"}`
      });
    } else {
      console.error("Failed to update verification status:", error);
      
      // Revert the optimistic update
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
  }, [setUsers, toast]);

  const handleApproveItem = useCallback((id: string, type: string) => {
    if (type === 'listing') {
      setListings((prev: ListingAdmin[]) =>
        prev.map(item => item.id === id ? { ...item, status: 'active' } : item)
      );
    } else if (type === 'report') {
      setReports((prev: ReportAdmin[]) =>
        prev.map(item => item.id === id ? { ...item, status: 'resolved' } : item)
      );
    }
    toast({
      title: "Item approved",
      description: `The ${type} has been approved successfully`,
    });
  }, [setListings, setReports, toast]);

  const handleRejectItem = useCallback((id: string, type: string) => {
    if (type === 'listing') {
      setListings((prev: ListingAdmin[]) =>
        prev.map(item => item.id === id ? { ...item, status: 'rejected' } : item)
      );
    } else if (type === 'report') {
      setReports((prev: ReportAdmin[]) =>
        prev.map(item => item.id === id ? { ...item, status: 'dismissed' } : item)
      );
    }
    toast({
      title: "Item rejected",
      description: `The ${type} has been rejected`,
    });
  }, [setListings, setReports, toast]);

  const handleSuspendUser = useCallback((id: string) => {
    setUsers((prev: UserAdmin[]) =>
      prev.map(user => user.id === id ? { ...user, strike_count: 3 } : user)
    );
    toast({
      title: "User suspended",
      description: "The user has been suspended",
    });
  }, [setUsers, toast]);

  const handleUnsuspendUser = useCallback((id: string) => {
    setUsers((prev: UserAdmin[]) =>
      prev.map(user => user.id === id ? { ...user, strike_count: 0 } : user)
    );
    toast({
      title: "User unsuspended",
      description: "The user has been unsuspended and can now use the platform again",
    });
  }, [setUsers, toast]);

  return {
    promoteAdmin,
    demoteAdmin,
    toggleVerifiedStatus,
    handleApproveItem,
    handleRejectItem,
    handleSuspendUser,
    handleUnsuspendUser,
    loadingUserId,
  };
}
