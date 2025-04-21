
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
    loading: ({ title, description }: ToastOptions) => {
      return baseToast({
        title,
        description,
        variant: "default"
      });
    },
    
    success: ({ title, description }: ToastOptions) => {
      return baseToast({
        title,
        description,
        variant: "default"
      });
    },
    
    error: ({ title, description }: ToastOptions) => {
      return baseToast({
        title,
        description,
        variant: "destructive"
      });
    },
    
    info: ({ title, description }: ToastOptions) => {
      return baseToast({
        title,
        description,
        variant: "default"
      });
    }
  };

  return { toast };
}
