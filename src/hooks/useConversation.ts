import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/auth";
import { Message } from "./messageTypes";

export const useConversation = (otherUserId: string, listingId?: string) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [otherUser, setOtherUser] = useState<{
    id: string;
    name: string;
    avatarUrl?: string;
  } | null>(null);
  const [listing, setListing] = useState<{
    id: string;
    title: string;
    price: number;
    imageUrl?: string;
  } | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!user || !otherUserId) {
      setMessages([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch messages
      const { data: messagesData, error: messagesError } = await supabase
        .from("messages")
        .select("*")
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
        .order("created_at", { ascending: true });

      if (messagesError) throw messagesError;

      // Fetch other user's profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .eq("id", otherUserId)
        .single();

      if (profileError) throw profileError;

      setOtherUser({
        id: profileData.id,
        name: profileData.full_name || "Unknown User",
        avatarUrl: profileData.avatar_url,
      });

      // If there's a listing ID, fetch listing details
      if (listingId) {
        const { data: listingData, error: listingError } = await supabase
          .from("listings")
          .select("id, title, price, images")
          .eq("id", listingId)
          .single();

        if (listingError) {
          console.error("Error fetching listing:", listingError);
        } else {
          setListing({
            id: listingData.id,
            title: listingData.title,
            price: Number(listingData.price),
            imageUrl: listingData.images?.[0],
          });
        }
      }

      // Mark messages as read
      const unreadMessages = messagesData
        .filter(msg => msg.sender_id === otherUserId && !msg.is_read)
        .map(msg => msg.id);

      if (unreadMessages.length > 0) {
        await supabase
          .from("messages")
          .update({ is_read: true })
          .in("id", unreadMessages);
      }

      // Map to Message type
      const mappedMessages: Message[] = messagesData.map(msg => ({
        id: msg.id,
        senderId: msg.sender_id,
        receiverId: msg.receiver_id,
        listingId: msg.listing_id,
        content: msg.content,
        isRead: msg.is_read,
        createdAt: new Date(msg.created_at),
        hasContactInfo: msg.has_contact_info,
      }));

      setMessages(mappedMessages);
    } catch (err) {
      console.error("Error fetching messages:", err);
      setError("Failed to fetch messages. Please try again.");
      toast({
        title: "Error",
        description: "Failed to fetch messages. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, otherUserId, listingId]);

  const sendMessage = useCallback(async (content: string) => {
    if (!user || !otherUserId) {
      toast({
        title: "Authentication Required",
        description: "Please log in to send messages.",
        variant: "destructive",
      });
      return { success: false };
    }

    try {
      // Detect contact info
      const hasContactInfo = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)|\b\d{10,11}\b|\+\d{1,3}\s?\d{6,14}\b|\(\d{3}\)\s?\d{3}[-.]?\d{4}/.test(content);

      const { data, error } = await supabase
        .from("messages")
        .insert({
          sender_id: user.id,
          receiver_id: otherUserId,
          listing_id: listingId,
          content,
          is_read: false,
          has_contact_info: hasContactInfo,
        })
        .select()
        .single();

      if (error) throw error;

      // Add new message to state
      const newMessage: Message = {
        id: data.id,
        senderId: data.sender_id,
        receiverId: data.receiver_id,
        listingId: data.listing_id,
        content: data.content,
        isRead: data.is_read,
        createdAt: new Date(data.created_at),
        hasContactInfo: data.has_contact_info,
      };

      setMessages(prev => [...prev, newMessage]);

      // --- NOTIFICATION: Only create for the RECIPIENT ---
      if (user.id !== otherUserId) {
        // Get sender name (from profile)
        const { data: senderProfile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .maybeSingle();

        let listingTitle: string | undefined = undefined;
        if (listingId) {
          const { data: listingData } = await supabase
            .from("listings")
            .select("title")
            .eq("id", listingId)
            .maybeSingle();
          listingTitle = listingData?.title;
        }

        // Preview: truncate message content to 50 chars
        const preview = content.length > 50 ? `${content.slice(0, 50)}...` : content;

        // Create the notification
        await supabase.from("notifications").insert({
          user_id: otherUserId,
          type: "new_message",
          message: `${senderProfile?.full_name || "Someone"}: ${preview}`,
          is_read: false,
          metadata: {
            conversationId: user.id,
            listingId: listingId || null,
            listingTitle: listingTitle || null,
          },
        });
      }

      return { success: true };
    } catch (err) {
      console.error("Error sending message:", err);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      return { success: false };
    }
  }, [user, otherUserId, listingId]);

  useEffect(() => {
    fetchMessages();

    // Set up real-time subscription
    if (user && otherUserId) {
      const channel = supabase
        .channel('db-conversation-changes')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `or(and(sender_id=eq.${user.id},receiver_id=eq.${otherUserId}),and(sender_id=eq.${otherUserId},receiver_id=eq.${user.id}))`,
        }, () => {
          fetchMessages();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [fetchMessages, user, otherUserId]);

  return {
    messages,
    otherUser,
    listing,
    isLoading,
    error,
    sendMessage,
    refetch: fetchMessages,
  };
};
