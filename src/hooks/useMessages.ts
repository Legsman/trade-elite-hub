import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/auth";
import { Conversation } from "./messageTypes";

export const useMessages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    if (!user) {
      setConversations([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get all messages where user is sender or receiver
      const { data: messagesData, error: messagesError } = await supabase
        .from("messages")
        .select(`
          id, 
          content, 
          created_at, 
          is_read, 
          sender_id, 
          receiver_id, 
          listing_id
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (messagesError) throw messagesError;

      // Group messages by conversation (with other user)
      const conversationMap = new Map<string, {
        messages: any[];
        otherUserId: string;
        listingId?: string;
      }>();

      messagesData.forEach(msg => {
        const otherUserId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        const conversationKey = otherUserId;

        if (!conversationMap.has(conversationKey)) {
          conversationMap.set(conversationKey, {
            messages: [],
            otherUserId,
            listingId: msg.listing_id,
          });
        }

        conversationMap.get(conversationKey)?.messages.push(msg);
      });

      // Get user profile information for each conversation
      const conversationArray = Array.from(conversationMap.values());
      const otherUserIds = conversationArray.map(conv => conv.otherUserId);

      if (otherUserIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .in("id", otherUserIds);

        if (profilesError) throw profilesError;

        // Build profile map
        const profileMap = new Map(
          profilesData.map(profile => [profile.id, profile])
        );

        // Get listing information if applicable
        const listingIds = conversationArray
          .map(conv => conv.listingId)
          .filter(Boolean) as string[];

        let listingMap = new Map<string, any>();
        
        if (listingIds.length > 0) {
          const { data: listingsData, error: listingsError } = await supabase
            .from("listings")
            .select("id, title")
            .in("id", listingIds);

          if (listingsError) throw listingsError;

          listingMap = new Map(
            listingsData.map(listing => [listing.id, listing])
          );
        }

        // Build final conversations array
        const mappedConversations: Conversation[] = conversationArray.map(conv => {
          const otherUserProfile = profileMap.get(conv.otherUserId);
          const listingInfo = conv.listingId ? listingMap.get(conv.listingId) : undefined;
          const lastMessage = conv.messages[0];
          
          // Count unread messages from the other user
          const unreadCount = conv.messages.filter(
            (msg: any) => msg.sender_id === conv.otherUserId && !msg.is_read
          ).length;

          return {
            id: conv.otherUserId, // Use other user's ID as conversation ID
            otherUserId: conv.otherUserId,
            otherUserName: otherUserProfile?.full_name || "Unknown User",
            otherUserAvatar: otherUserProfile?.avatar_url,
            lastMessage: lastMessage?.content,
            lastMessageDate: lastMessage ? new Date(lastMessage.created_at) : undefined,
            unreadCount,
            listingId: conv.listingId,
            listingTitle: listingInfo?.title,
          };
        });

        // Sort by last message date
        mappedConversations.sort((a, b) => {
          if (!a.lastMessageDate) return 1;
          if (!b.lastMessageDate) return -1;
          return b.lastMessageDate.getTime() - a.lastMessageDate.getTime();
        });

        setConversations(mappedConversations);
      } else {
        setConversations([]);
      }
    } catch (err) {
      console.error("Error fetching conversations:", err);
      setError("Failed to fetch conversations. Please try again.");
      toast({
        title: "Error",
        description: "Failed to fetch conversations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchConversations();

    // Set up real-time subscription
    if (user) {
      const channel = supabase
        .channel('db-messages-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=eq.${user.id},receiver_id=eq.${user.id}`,
        }, () => {
          fetchConversations();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [fetchConversations, user]);

  return {
    conversations,
    isLoading,
    error,
    refetch: fetchConversations,
  };
};
