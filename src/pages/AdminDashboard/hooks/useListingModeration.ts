
import { useCallback } from "react";
import { ListingAdmin, ReportAdmin } from "../types";

export function useListingModeration(
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
    
    return {
      success: true,
      message: `The ${type} has been approved successfully`
    };
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
    
    return {
      success: true,
      message: `The ${type} has been rejected`
    };
  }, [setListings, setReports]);

  return {
    handleApproveItem,
    handleRejectItem,
  };
}
