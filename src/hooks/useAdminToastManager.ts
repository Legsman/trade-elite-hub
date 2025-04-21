
import { toast } from "@/hooks/use-toast";

type ToastType = "success" | "processing" | "error" | "refresh";
type ActionType = "verify" | "unverify" | "promote" | "demote" | "refresh" | "operation";

type ToastMessage = {
  title: string;
  description: string;
  variant?: "default" | "destructive";
};

export function useAdminToastManager() {
  /**
   * Creates a toast to indicate an operation is starting and returns the toast ID
   */
  const createProcessingToast = (action: ActionType, customMessage?: ToastMessage) => {
    const messages: Record<ActionType, ToastMessage> = {
      verify: { title: "Processing", description: "Verifying user..." },
      unverify: { title: "Processing", description: "Removing verification..." },
      promote: { title: "Processing", description: "Promoting user to admin..." },
      demote: { title: "Processing", description: "Removing admin privileges..." },
      refresh: { title: "Refreshing data", description: "Fetching latest data..." },
      operation: { title: "Processing", description: "Processing your request..." }
    };

    const message = customMessage || messages[action];
    
    return toast({
      title: message.title,
      description: message.description,
      variant: message.variant || "default"
    });
  };

  /**
   * Updates an existing toast with success or error information
   */
  const updateToast = (toastId: any, type: ToastType, action: ActionType, customMessage?: ToastMessage, error?: any) => {
    // Define standard messages for different actions and results
    const successMessages: Record<ActionType, ToastMessage> = {
      verify: { title: "Success", description: "User has been verified" },
      unverify: { title: "Success", description: "User verification has been removed" },
      promote: { title: "Success", description: "User has been made an admin" },
      demote: { title: "Success", description: "Admin privileges have been removed" },
      refresh: { title: "Data refreshed", description: "Dashboard data has been updated" },
      operation: { title: "Success", description: "Operation completed successfully" }
    };

    const errorMessages: Record<ActionType, ToastMessage> = {
      verify: { title: "Failed to verify", description: "Could not verify user", variant: "destructive" },
      unverify: { title: "Failed to unverify", description: "Could not remove verification", variant: "destructive" },
      promote: { title: "Failed to promote", description: "Could not promote to admin", variant: "destructive" },
      demote: { title: "Failed to demote", description: "Could not remove admin privileges", variant: "destructive" },
      refresh: { title: "Failed to refresh", description: "Could not update data", variant: "destructive" },
      operation: { title: "Operation failed", description: "Could not complete operation", variant: "destructive" }
    };

    // Select the right message template
    let messageTemplate: ToastMessage;
    if (type === "success") {
      messageTemplate = successMessages[action];
    } else if (type === "error") {
      messageTemplate = errorMessages[action];
    } else if (type === "refresh") {
      messageTemplate = { title: "Refreshing", description: "Updating data..." };
    } else {
      messageTemplate = { title: "Processing", description: "Processing your request..." };
    }

    // Use custom message if provided
    const message = customMessage || messageTemplate;

    // If there's an error and no custom message is provided, include error details
    if (type === "error" && !customMessage && error) {
      message.description = error.message || String(error) || message.description;
    }

    toast({
      ...toastId,
      title: message.title,
      description: message.description,
      variant: message.variant || (type === "error" ? "destructive" : "default")
    });
  };

  return {
    createProcessingToast,
    updateToast
  };
}
