
import { useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { ListingAdmin, ReportAdmin, UserAdmin } from "../types";

export function useContentModeration(
  setUsers: React.Dispatch<React.SetStateAction<UserAdmin[]>>,
  setListings: React.Dispatch<React.SetStateAction<ListingAdmin[]>>,
  setReports: React.Dispatch<React.SetStateAction<ReportAdmin[]>>
) {
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
    handleApproveItem,
    handleRejectItem,
    handleSuspendUser,
    handleUnsuspendUser,
  };
}
