
import { useToast } from "@/hooks/use-toast";
import { useRef } from "react";

interface ToastOptions {
  title: string;
  description: string;
  variant?: "default" | "destructive";
}

interface ToastWithIdOptions extends ToastOptions {
  id?: string;
}

export function useAdminToastManager() {
  const { toast: toastFunction, dismiss } = useToast();
  
  // Use a ref to store active toast IDs to preserve between renders
  const activeToastIdsRef = useRef(new Map<string, string>());
  
  // Generate a unique operation ID based on operation type and target
  const getOperationId = (operation: string, targetId?: string): string => {
    return `${operation}_${targetId || "global"}`;
  };

  const toastManager = {
    loading: ({ title, description, id }: ToastWithIdOptions) => {
      // Create or update toast
      const toastId = id || crypto.randomUUID();
      
      // If there's an existing toast with this ID, dismiss it first
      if (activeToastIdsRef.current.has(toastId)) {
        const existingToastId = activeToastIdsRef.current.get(toastId);
        if (existingToastId) {
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
      
      console.log(`Creating loading toast: ID=${toastId}, title=${title}`);
      
      // Store the mapping
      activeToastIdsRef.current.set(toastId, newToastId);
      
      return {
        id: toastId,
        update: (options: ToastOptions) => toastManager.update({ ...options, id: toastId }),
        success: (options: ToastOptions) => toastManager.success({ ...options, id: toastId }),
        error: (options: ToastOptions) => toastManager.error({ ...options, id: toastId }),
      };
    },
    
    update: ({ title, description, id }: ToastWithIdOptions) => {
      if (id && activeToastIdsRef.current.has(id)) {
        const existingToastId = activeToastIdsRef.current.get(id);
        
        if (existingToastId) {
          console.log(`Updating toast: ID=${id}, title=${title}`);
          
          // Create a new toast with the updated content
          // and dismiss the old one
          dismiss(existingToastId);
          const newToastId = toastFunction({
            title,
            description,
            duration: 5000,
          }).id;
          
          // Update the mapping
          activeToastIdsRef.current.set(id, newToastId);
        }
        
        return { id };
      } else {
        // If no existing toast, create a new one
        console.log(`No toast found with ID ${id}, creating new info toast`);
        return toastManager.info({ title, description, id });
      }
    },
    
    success: ({ title, description, id }: ToastWithIdOptions) => {
      if (id && activeToastIdsRef.current.has(id)) {
        const existingToastId = activeToastIdsRef.current.get(id);
        
        if (existingToastId) {
          console.log(`Updating toast to success: ID=${id}, title=${title}`);
          
          // Dismiss the existing toast and create a new one
          dismiss(existingToastId);
          const newToastId = toastFunction({
            title, 
            description,
            variant: "default"
          }).id;
          
          // Update the mapping
          activeToastIdsRef.current.set(id, newToastId);
        }
        
        // Clean up after success
        setTimeout(() => {
          console.log(`Removing toast ID ${id} after success`);
          activeToastIdsRef.current.delete(id);
        }, 5000);
        return { id };
      } else {
        console.log(`Creating new success toast: title=${title}`);
        const newToastId = toastFunction({
          title,
          description,
          variant: "default"
        }).id;
        
        const uniqueId = id || crypto.randomUUID();
        activeToastIdsRef.current.set(uniqueId, newToastId);
        
        // Clean up after success
        setTimeout(() => {
          console.log(`Removing toast ID ${uniqueId} after success`);
          activeToastIdsRef.current.delete(uniqueId);
        }, 5000);
        return { id: uniqueId };
      }
    },
    
    error: ({ title, description, id }: ToastWithIdOptions) => {
      if (id && activeToastIdsRef.current.has(id)) {
        const existingToastId = activeToastIdsRef.current.get(id);
        
        if (existingToastId) {
          console.log(`Updating toast to error: ID=${id}, title=${title}`);
          
          // Dismiss the existing toast and create a new one
          dismiss(existingToastId);
          const newToastId = toastFunction({
            title,
            description,
            variant: "destructive"
          }).id;
          
          // Update the mapping
          activeToastIdsRef.current.set(id, newToastId);
        }
        
        // Clean up after error
        setTimeout(() => {
          console.log(`Removing toast ID ${id} after error`);
          activeToastIdsRef.current.delete(id);
        }, 5000);
        return { id };
      } else {
        console.log(`Creating new error toast: title=${title}`);
        const newToastId = toastFunction({
          title,
          description,
          variant: "destructive"
        }).id;
        
        const uniqueId = id || crypto.randomUUID();
        activeToastIdsRef.current.set(uniqueId, newToastId);
        
        // Clean up after error
        setTimeout(() => {
          console.log(`Removing toast ID ${uniqueId} after error`);
          activeToastIdsRef.current.delete(uniqueId);
        }, 5000);
        return { id: uniqueId };
      }
    },
    
    info: ({ title, description, id }: ToastWithIdOptions) => {
      console.log(`Creating info toast: title=${title}`);
      const uniqueId = id || crypto.randomUUID();
      const newToastId = toastFunction({
        title,
        description,
        variant: "default"
      }).id;
      
      activeToastIdsRef.current.set(uniqueId, newToastId);
      
      // Clean up after info
      setTimeout(() => {
        console.log(`Removing toast ID ${uniqueId} after info`);
        activeToastIdsRef.current.delete(uniqueId);
      }, 5000);
      return { id: uniqueId };
    }
  };

  return { toast: toastManager };
}
