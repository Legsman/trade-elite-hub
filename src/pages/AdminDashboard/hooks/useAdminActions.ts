
import { useCallback } from "react";
import { assignOrRemoveAdminRole } from "@/utils/adminUtils";
import { toast } from "@/hooks/use-toast";
import { UserAdmin, ListingAdmin, ReportAdmin } from "../types";

// Callbacks for admin actions: approve, reject, promote, demote, suspend, unsuspend

export function useAdminActions(setUsers: any, setListings: any, setReports: any) {
  const promoteAdmin = useCallback(async (userId: string) => {
    const { success, error } = await assignOrRemoveAdminRole(userId, "admin", "add");
    if (success) {
      setUsers((prev: UserAdmin[]) =>
        prev.map(u =>
          u.id === userId ? { ...u, role: "admin" } : u
        )
      );
      toast({ title: "Admin promoted", description: "User has been made an admin" });
    } else {
      toast({ title: "Failed to promote", description: error?.message || error || "Failed", variant: "destructive" });
    }
  }, [setUsers]);

  const demoteAdmin = useCallback(async (userId: string) => {
    const { success, error } = await assignOrRemoveAdminRole(userId, "admin", "remove");
    if (success) {
      setUsers((prev: UserAdmin[]) =>
        prev.map(u =>
          u.id === userId ? { ...u, role: "user" } : u
        )
      );
      toast({ title: "Admin removed", description: "User has been demoted from admin" });
    } else {
      toast({ title: "Failed to demote", description: error?.message || error || "Failed", variant: "destructive" });
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
      prev.map(user => user.id === id ? { ...user, status: 'suspended' } : user)
    );
    toast({
      title: "User suspended",
      description: "The user has been suspended",
    });
  }, [setUsers]);

  const handleUnsuspendUser = useCallback((id: string) => {
    setUsers((prev: UserAdmin[]) =>
      prev.map(user => user.id === id ? { ...user, status: 'active', strike_count: 0 } : user)
    );
    toast({
      title: "User unsuspended",
      description: "The user has been unsuspended and can now use the platform again",
    });
  }, [setUsers]);

  return {
    promoteAdmin,
    demoteAdmin,
    handleApproveItem,
    handleRejectItem,
    handleSuspendUser,
    handleUnsuspendUser,
  };
}
