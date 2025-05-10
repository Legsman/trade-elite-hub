
import { useCallback } from "react";
import { ListingAdmin, ReportAdmin } from "../types";
import { useAdminToastManager } from "@/hooks/useAdminToastManager";

export function useListingModeration(
  setListings: React.Dispatch<React.SetStateAction<ListingAdmin[]>>,
  setReports: React.Dispatch<React.SetStateAction<ReportAdmin[]>>
) {
  const { toast } = useAdminToastManager();

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
    
    toast.success({
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
    
    toast.error({
      title: "Item rejected",
      description: `The ${type} has been rejected`,
    });
  }, [setListings, setReports, toast]);

  return {
    handleApproveItem,
    handleRejectItem,
  };
}
