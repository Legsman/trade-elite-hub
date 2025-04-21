
import { useCallback } from "react";
import { assignOrRemoveAdminRole, assignOrRemoveVerifiedStatus } from "@/utils/adminUtils";
import { toast } from "@/hooks/use-toast";
import { UserAdmin, ListingAdmin, ReportAdmin } from "../types";

export function useAdminActions(setUsers: any, setListings: any, setReports: any) {
  const promoteAdmin = useCallback(async (userId: string) => {
    console.log("Attempting to promote user to admin:", userId);
    
    // Optimistically update UI first
    setUsers((prev: UserAdmin[]) =>
      prev.map(u =>
        u.id === userId ? { ...u, role: "admin", verified_status: "verified" } : u
      )
    );
    
    // Show processing toast
    const pendingToast = toast({ 
      title: "Processing", 
      description: "Promoting user to admin..." 
    });
    
    // Make the actual API call
    const { success, error, message, alreadyDone } = await assignOrRemoveAdminRole(userId, "admin", "add");
    
    // Dismiss the pending toast
    if (pendingToast && pendingToast.dismiss) {
      pendingToast.dismiss();
    }
    
    if (success) {
      toast({ 
        title: "Admin promoted", 
        description: message || "User has been made an admin" 
      });
      
      // Force a refresh of the users data to ensure UI is in sync
      setTimeout(() => {
        setUsers((prev: UserAdmin[]) => {
          const updatedUsers = [...prev]; // Create a new array to trigger re-render
          return updatedUsers.map(u =>
            u.id === userId ? { ...u, role: "admin", verified_status: "verified" } : u
          );
        });
      }, 300);
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
  }, [setUsers]);

  const demoteAdmin = useCallback(async (userId: string) => {
    console.log("Attempting to demote admin:", userId);
    
    // Optimistically update UI first
    setUsers((prev: UserAdmin[]) =>
      prev.map(u =>
        u.id === userId ? { ...u, role: "user" } : u
      )
    );
    
    // Show processing toast
    const pendingToast = toast({ 
      title: "Processing", 
      description: "Removing admin role..." 
    });
    
    // Make the actual API call
    const { success, error, message, alreadyDone } = await assignOrRemoveAdminRole(userId, "admin", "remove");
    
    // Dismiss the pending toast
    if (pendingToast && pendingToast.dismiss) {
      pendingToast.dismiss();
    }
    
    if (success) {
      toast({ 
        title: "Admin removed", 
        description: message || "User has been demoted from admin" 
      });
      
      // Force a refresh of the users data to ensure UI is in sync
      setTimeout(() => {
        setUsers((prev: UserAdmin[]) => {
          const updatedUsers = [...prev]; // Create a new array to trigger re-render
          return updatedUsers.map(u =>
            u.id === userId ? { ...u, role: "user" } : u
          );
        });
      }, 300);
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
  }, [setUsers]);

  const toggleVerifiedStatus = useCallback(async (userId: string, currentStatus: "verified" | "unverified") => {
    console.log("Toggling verified status for user:", userId, "Current status:", currentStatus);
    const action = currentStatus === "unverified" ? "add" : "remove";
    
    // Optimistically update UI first
    setUsers((prev: UserAdmin[]) =>
      prev.map(u =>
        u.id === userId ? { ...u, verified_status: action === "add" ? "verified" : "unverified" } : u
      )
    );
    
    // Show processing toast
    const pendingToast = toast({ 
      title: "Processing", 
      description: `${action === "add" ? "Verifying" : "Unverifying"} user...` 
    });
    
    // Make the actual API call
    const { success, error, message, alreadyDone } = await assignOrRemoveVerifiedStatus(userId, action);
    
    // Dismiss the pending toast
    if (pendingToast && pendingToast.dismiss) {
      pendingToast.dismiss();
    }
    
    if (success) {
      toast({ 
        title: `User ${action === "add" ? "verified" : "unverified"}`, 
        description: message || `User has been ${action === "add" ? "verified" : "unverified"}`
      });
      
      // Force a refresh of the users data to ensure UI is in sync
      setTimeout(() => {
        setUsers((prev: UserAdmin[]) => {
          const updatedUsers = [...prev]; // Create a new array to trigger re-render
          return updatedUsers.map(u =>
            u.id === userId ? { 
              ...u, 
              verified_status: action === "add" ? "verified" : "unverified" 
            } : u
          );
        });
      }, 300);
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
  }, [setUsers]);

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
  }, [setListings, setReports]);

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
  }, [setListings, setReports]);

  const handleSuspendUser = useCallback((id: string) => {
    setUsers((prev: UserAdmin[]) =>
      prev.map(user => user.id === id ? { ...user, strike_count: 3 } : user)
    );
    toast({
      title: "User suspended",
      description: "The user has been suspended",
    });
  }, [setUsers]);

  const handleUnsuspendUser = useCallback((id: string) => {
    setUsers((prev: UserAdmin[]) =>
      prev.map(user => user.id === id ? { ...user, strike_count: 0 } : user)
    );
    toast({
      title: "User unsuspended",
      description: "The user has been unsuspended and can now use the platform again",
    });
  }, [setUsers]);

  return {
    promoteAdmin,
    demoteAdmin,
    toggleVerifiedStatus,
    handleApproveItem,
    handleRejectItem,
    handleSuspendUser,
    handleUnsuspendUser,
  };
}
