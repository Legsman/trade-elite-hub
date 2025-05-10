
import { useCallback } from "react";
import { UserAdmin, ListingAdmin, ReportAdmin } from "../types";
import { useAdminOperationToasts } from "./useAdminOperationToasts";

export function useContentModeration(
  setUsers: React.Dispatch<React.SetStateAction<UserAdmin[]>>,
  setListings: React.Dispatch<React.SetStateAction<ListingAdmin[]>>,
  setReports: React.Dispatch<React.SetStateAction<ReportAdmin[]>>
) {
  const { handleContentOperation } = useAdminOperationToasts();

  // Approve or reject listings/reports
  const handleApproveItem = useCallback(async (id: string, type: string) => {
    return await handleContentOperation("approve", async () => {
      try {
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
      } catch (error) {
        console.error(`Error approving ${type}:`, error);
        return {
          success: false,
          error: { message: `Failed to approve ${type}` }
        };
      }
    }, id, type);
  }, [setListings, setReports, handleContentOperation]);

  const handleRejectItem = useCallback(async (id: string, type: string) => {
    return await handleContentOperation("reject", async () => {
      try {
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
      } catch (error) {
        console.error(`Error rejecting ${type}:`, error);
        return {
          success: false,
          error: { message: `Failed to reject ${type}` }
        };
      }
    }, id, type);
  }, [setListings, setReports, handleContentOperation]);
  
  // User suspension operations
  const handleSuspendUser = useCallback(async (id: string) => {
    return await handleContentOperation("suspend", async () => {
      try {
        setUsers((prev: UserAdmin[]) =>
          prev.map(user => user.id === id ? { ...user, strike_count: 3 } : user)
        );
        
        return {
          success: true, 
          message: "The user has been suspended"
        };
      } catch (error) {
        console.error("Error suspending user:", error);
        return {
          success: false,
          error: { message: "Failed to suspend user" }
        };
      }
    }, id);
  }, [setUsers, handleContentOperation]);

  const handleUnsuspendUser = useCallback(async (id: string) => {
    return await handleContentOperation("unsuspend", async () => {
      try {
        setUsers((prev: UserAdmin[]) =>
          prev.map(user => user.id === id ? { ...user, strike_count: 0 } : user)
        );
        
        return {
          success: true, 
          message: "The user has been unsuspended and can now use the platform again"
        };
      } catch (error) {
        console.error("Error unsuspending user:", error);
        return {
          success: false,
          error: { message: "Failed to unsuspend user" }
        };
      }
    }, id);
  }, [setUsers, handleContentOperation]);

  return {
    handleApproveItem,
    handleRejectItem,
    handleSuspendUser,
    handleUnsuspendUser,
  };
}
