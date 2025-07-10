import { useEffect } from "react";
import { useAuth } from "@/hooks/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { DollarSign, CheckCircle, XCircle } from "lucide-react";

export const useNotificationToasts = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('notification-toasts')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        const notification = payload.new;
        
        // Show toast for different notification types
        switch (notification.type) {
          case 'new_offer':
            toast({
              title: "💰 New Offer Received",
              description: notification.message,
              duration: 5000,
            });
            break;
            
          case 'offer_accepted':
            toast({
              title: "✅ Offer Accepted",
              description: notification.message,
              duration: 6000,
            });
            break;
            
          case 'offer_declined':
            toast({
              title: "❌ Offer Declined",
              description: notification.message,
              variant: "destructive",
              duration: 5000,
            });
            break;
            
          case 'offer_auto_declined':
            toast({
              title: "❌ Offer Auto-Declined",
              description: notification.message,
              variant: "destructive",
              duration: 6000,
            });
            break;
            
          case 'new_message':
            toast({
              title: "💬 New Message",
              description: notification.message,
              duration: 4000,
            });
            break;
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);
};