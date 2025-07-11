
import { useState, useCallback } from "react";
import { UserAdmin, ListingAdmin, ReportAdmin } from "../types";
import { useAdminRoleManagement } from "./useAdminRoleManagement";
import { useVerificationManagement } from "./useVerificationManagement";
import { useContentModeration } from "./useContentModeration";

export function useAdminActions(
  setUsers: React.Dispatch<React.SetStateAction<UserAdmin[]>>,
  setListings: React.Dispatch<React.SetStateAction<ListingAdmin[]>>,
  setReports: React.Dispatch<React.SetStateAction<ReportAdmin[]>>,
  startOperation?: (type: string, id: string) => string,
  finishOperation?: (operationKey: string) => void
) {
  const [pendingOperations, setPendingOperations] = useState<Set<string>>(new Set());
  
  // Helper to track operations if startOperation/finishOperation aren't provided
  const trackOperation = useCallback((id: string, isStarting: boolean) => {
    if (isStarting) {
      setPendingOperations(prev => {
        const updated = new Set(prev);
        updated.add(id);
        return updated;
      });
      return id;
    } else {
      setPendingOperations(prev => {
        const updated = new Set(prev);
        updated.delete(id);
        return updated;
      });
      return "";
    }
  }, []);

  // Use provided operation tracking or fallback to internal
  const startOp = useCallback((type: string, id: string) => {
    const key = `${type}_${id}`;
    if (startOperation) {
      return startOperation(type, id);
    } else {
      return trackOperation(key, true);
    }
  }, [startOperation, trackOperation]);
  
  const finishOp = useCallback((key: string) => {
    if (finishOperation) {
      finishOperation(key);
    } else if (key) {
      trackOperation(key, false);
    }
  }, [finishOperation, trackOperation]);
  
  const isPendingForUser = useCallback((userId: string): boolean => {
    return [...pendingOperations].some(op => op.includes(userId));
  }, [pendingOperations]);

  // Role management
  const { promoteAdmin, demoteAdmin } = useAdminRoleManagement(
    setUsers,
    startOp,
    finishOp
  );
  
  // Verification management
  const { toggleVerifiedStatus, toggleTraderStatus } = useVerificationManagement(
    setUsers,
    startOp,
    finishOp
  );

  // Content moderation (approve/reject listings, suspend users)
  const { 
    handleApproveItem, 
    handleRejectItem,
    handleSuspendUser,
    handleUnsuspendUser 
  } = useContentModeration(setUsers, setListings, setReports);

  return {
    // User role management
    promoteAdmin,
    demoteAdmin,
    
    // User verification
    toggleVerifiedStatus,
    toggleTraderStatus,
    
    // Content moderation
    handleApproveItem,
    handleRejectItem,
    handleSuspendUser,
    handleUnsuspendUser,
    
    // Loading state
    pendingOperations: [...pendingOperations],
    isPendingForUser
  };
}
