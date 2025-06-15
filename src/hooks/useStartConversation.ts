import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth";
import { toast } from "@/hooks/use-toast";

export const useStartConversation = () => {
  const { user } = useAuth();
  
  const startConversation = useCallback(async (
    receiverId: string, 
    initialMessage: string, 
    listingId?: string
  ) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to send messages.",
        variant: "destructive",
      });
      return { success: false, conversationId: null };
    }

    try {
      // Basic check for contact info
      const hasContactInfo = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)|\b\d{10,11}\b|\+\d{1,3}\s?\d{6,14}\b|\(\d{3}\)\s?\d{3}[-.]?\d{4}/.test(initialMessage);

      const { data, error } = await supabase
        .from("messages")
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
          listing_id: listingId,
          content: initialMessage,
          is_read: false,
          has_contact_info: hasContactInfo,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully.",
      });

      return { success: true, conversationId: receiverId };
    } catch (err) {
      console.error("Error starting conversation:", err);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      return { success: false, conversationId: null };
    }
  }, [user]);

  return { startConversation };
};
