
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/auth";
import { supabase } from "@/integrations/supabase/client";

// Notification type matching Supabase notifications table
export interface Notification {
  id: string;
  user_id: string;
  type: string; // e.g. "new_bid", "new_message"
  message: string;
  is_read: boolean;
  created_at: string;
  metadata?: Record<string, any>;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch latest notifications for logged-in user
  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(30);
      if (error) throw error;
      setNotifications(data || []);
    } catch (err) {
      setError("Failed to fetch notifications.");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
    // Setup realtime channel
    if (user) {
      const channel = supabase
        .channel('realtime-notifications')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        }, fetchNotifications)
        .subscribe();
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [fetchNotifications, user]);

  // Mark notification as read
  const markAsRead = async (id: string) => {
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);
    fetchNotifications();
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!notifications.length) return;
    const unread = notifications.filter(n => !n.is_read);
    if (unread.length === 0) return;
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .in("id", unread.map(n => n.id));
    fetchNotifications();
  };

  return {
    notifications,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    unreadCount: notifications.filter(n => !n.is_read).length,
    refetch: fetchNotifications,
  };
};
