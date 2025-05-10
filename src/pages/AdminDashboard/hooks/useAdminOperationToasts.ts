
import { useCallback } from "react";
import { useAdminToastManager } from "@/hooks/useAdminToastManager";

export function useAdminOperationToasts() {
  const { toast } = useAdminToastManager();

  const handleRoleOperationWithRefresh = useCallback(async (operationFn: Function, ...args: any[]) => {
    // Create a unique ID for this operation
    const operationType = operationFn.name || 'role_operation';
    const targetId = args[0] || 'unknown';
    const operationId = `${operationType}_${targetId}`;
    
    try {
      // Show initial loading toast
      toast.loading({
        title: "Processing Request",
        description: "Your request is being processed...",
        id: operationId
      });
      
      // Perform the operation
      const result = await operationFn(...args);
      console.log(`Operation ${operationType} result:`, result);
      
      // Handle the result based on success
      if (result?.success) {
        // If the operation was already done (role already assigned/removed), show success immediately
        if (result.alreadyDone) {
          toast.success({
            title: "Operation Complete",
            description: result.message || "Changes were already applied",
            id: operationId
          });
          return { success: true, refreshRequired: false, result };
        }
        
        // First toast update - operation was successful on function level
        toast.update({
          title: "Request Processed", 
          description: "Waiting for database to update...",
          id: operationId
        });
        
        // Silently refresh in background to get latest data
        try {
          // Wait for backend changes to propagate - match the delay from the edge function
          await new Promise(resolve => setTimeout(resolve, 2500)); // 2.5 seconds for safety
          
          // Final success toast
          toast.success({
            title: "Operation Complete",
            description: result.message || "Changes have been applied successfully",
            id: operationId
          });
          
          return { success: true, refreshRequired: true, result };
        } catch (refreshError) {
          console.error("Error during refresh wait period:", refreshError);
          // Still mark as success but note the refresh issue
          toast.success({
            title: "Operation Complete",
            description: "Changes made but there was an issue refreshing the data. You may need to refresh manually.",
            id: operationId
          });
          
          return { success: true, refreshRequired: true, result };
        }
      } else {
        // Operation failed at the function level
        console.error("Operation failed:", result?.error || "Unknown error");
        toast.error({
          title: "Operation Failed",
          description: result?.error?.message || "Please try again later",
          id: operationId
        });
        
        return { success: false, refreshRequired: false, result };
      }
    } catch (error) {
      // Unexpected error during the entire process
      console.error("Exception during role operation:", error);
      
      toast.error({
        title: "Unexpected Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        id: operationId
      });
      
      return { success: false, refreshRequired: false, error };
    }
  }, [toast]);

  // New function to handle content moderation operations
  const handleContentOperation = useCallback(async (
    operationType: string,
    operationFn: Function,
    ...args: any[]
  ) => {
    const targetId = args[0] || 'unknown';
    const operationId = `${operationType}_${targetId}`;
    
    try {
      // Execute the operation without loading toast for immediate actions
      const result = await operationFn(...args);
      console.log(`Content operation ${operationType} result:`, result);
      
      if (result?.success) {
        toast.success({
          title: `${operationType.charAt(0).toUpperCase() + operationType.slice(1)} Successful`,
          description: result.message || `${operationType} operation completed successfully`,
          id: operationId
        });
        return { success: true, result };
      } else {
        console.error(`${operationType} operation failed:`, result?.error || "Unknown error");
        toast.error({
          title: `${operationType} Failed`,
          description: result?.error?.message || "Please try again later",
          id: operationId
        });
        return { success: false, result };
      }
    } catch (error) {
      console.error(`Exception during ${operationType} operation:`, error);
      toast.error({
        title: "Unexpected Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        id: operationId
      });
      return { success: false, error };
    }
  }, [toast]);

  return { 
    handleRoleOperationWithRefresh,
    handleContentOperation
  };
}
