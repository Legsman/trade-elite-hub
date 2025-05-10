
import { useToast } from "@/hooks/use-toast";

interface ToastOptions {
  title: string;
  description: string;
  variant?: "default" | "destructive";
}

interface ToastWithIdOptions extends ToastOptions {
  id?: string;
}

export function useAdminToastManager() {
  const { toast: toastFunction, dismiss, update } = useToast();
  
  // Store active toast IDs to avoid duplicates
  const activeToastIds = new Map<string, string>();
  
  // Generate a unique operation ID based on operation type and target
  const getOperationId = (operation: string, targetId?: string): string => {
    return `${operation}_${targetId || "global"}`;
  };

  const toastManager = {
    loading: ({ title, description, id }: ToastWithIdOptions) => {
      // Create or update toast
      const toastId = id || crypto.randomUUID();
      
      // If there's an existing toast with this ID, dismiss it first
      if (activeToastIds.has(toastId)) {
        const existingToastId = activeToastIds.get(toastId);
        if (existingToastId) {
          // Use the dismiss function imported from useToast
          dismiss(existingToastId);
        }
      }
      
      // Create new toast
      const newToastId = toastFunction({
        title,
        description,
        duration: 30000, // Longer duration for loading toasts
        variant: "default"
      }).id;
      
      // Store the mapping
      activeToastIds.set(toastId, newToastId);
      
      return {
        id: toastId,
        update: (options: ToastOptions) => toastManager.update({ ...options, id: toastId }),
        success: (options: ToastOptions) => toastManager.success({ ...options, id: toastId }),
        error: (options: ToastOptions) => toastManager.error({ ...options, id: toastId }),
      };
    },
    
    update: ({ title, description, id }: ToastWithIdOptions) => {
      if (id && activeToastIds.has(id)) {
        const existingToastId = activeToastIds.get(id);
        
        if (existingToastId) {
          // Use the update function imported from useToast
          update(existingToastId, {
            title,
            description,
            duration: 5000, // Reset duration
          });
        }
        
        return { id };
      } else {
        // If no existing toast, create a new one
        return toastManager.info({ title, description, id });
      }
    },
    
    success: ({ title, description, id }: ToastWithIdOptions) => {
      if (id && activeToastIds.has(id)) {
        const existingToastId = activeToastIds.get(id);
        
        if (existingToastId) {
          // Use the update function imported from useToast
          update(existingToastId, {
            title, 
            description,
            variant: "default"
          });
        }
        
        // Clean up after success
        setTimeout(() => activeToastIds.delete(id), 5000);
        return { id };
      } else {
        const newToastId = toastFunction({
          title,
          description,
          variant: "default"
        }).id;
        
        const uniqueId = id || crypto.randomUUID();
        activeToastIds.set(uniqueId, newToastId);
        
        // Clean up after success
        setTimeout(() => activeToastIds.delete(uniqueId), 5000);
        return { id: uniqueId };
      }
    },
    
    error: ({ title, description, id }: ToastWithIdOptions) => {
      if (id && activeToastIds.has(id)) {
        const existingToastId = activeToastIds.get(id);
        
        if (existingToastId) {
          // Use the update function imported from useToast
          update(existingToastId, {
            title,
            description,
            variant: "destructive"
          });
        }
        
        // Clean up after error
        setTimeout(() => activeToastIds.delete(id), 5000);
        return { id };
      } else {
        const newToastId = toastFunction({
          title,
          description,
          variant: "destructive"
        }).id;
        
        const uniqueId = id || crypto.randomUUID();
        activeToastIds.set(uniqueId, newToastId);
        
        // Clean up after error
        setTimeout(() => activeToastIds.delete(uniqueId), 5000);
        return { id: uniqueId };
      }
    },
    
    info: ({ title, description, id }: ToastWithIdOptions) => {
      const uniqueId = id || crypto.randomUUID();
      const newToastId = toastFunction({
        title,
        description,
        variant: "default"
      }).id;
      
      activeToastIds.set(uniqueId, newToastId);
      
      // Clean up after info
      setTimeout(() => activeToastIds.delete(uniqueId), 5000);
      return { id: uniqueId };
    }
  };

  return { toast: toastManager };
}
