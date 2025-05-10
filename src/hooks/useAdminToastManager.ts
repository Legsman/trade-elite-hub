
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
  const { toast } = useToast();
  
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
      
      return toast({
        title,
        description,
        variant: "default"
      });
    },
    
    success: ({ title, description, id }: ToastWithIdOptions) => {
      return toast({
        title,
        description,
        variant: "default"
      });
    },
    
    error: ({ title, description, id }: ToastWithIdOptions) => {
      return toast({
        title,
        description,
        variant: "destructive"
      });
    },
    
    info: ({ title, description, id }: ToastWithIdOptions) => {
      return toast({
        title,
        description,
        variant: "default"
      });
    }
  };

  return { toast: toastManager };
}
