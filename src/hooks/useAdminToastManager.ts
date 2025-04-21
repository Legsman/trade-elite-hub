
import { useToast } from "@/hooks/use-toast";

interface ToastOptions {
  id?: string;
  title: string;
  description: string;
  variant?: "default" | "destructive";
}

export function useAdminToastManager() {
  const { toast: baseToast } = useToast();

  const toast = {
    loading: ({ id, title, description }: ToastOptions) => {
      return baseToast({
        id,
        title,
        description,
        variant: "default"
      });
    },
    
    success: ({ id, title, description }: ToastOptions) => {
      return baseToast({
        id,
        title,
        description,
        variant: "default"
      });
    },
    
    error: ({ id, title, description }: ToastOptions) => {
      return baseToast({
        id,
        title,
        description,
        variant: "destructive"
      });
    },
    
    info: ({ id, title, description }: ToastOptions) => {
      return baseToast({
        id,
        title,
        description,
        variant: "default"
      });
    }
  };

  return { toast };
}
