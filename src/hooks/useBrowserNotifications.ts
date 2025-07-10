import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/auth";

export const useBrowserNotifications = () => {
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if ("Notification" in window && permission === "default") {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    }
    return permission;
  };

  const showNotification = (title: string, options?: NotificationOptions) => {
    if ("Notification" in window && permission === "granted") {
      const notification = new Notification(title, {
        badge: "/favicon.ico",
        icon: "/favicon.ico",
        requireInteraction: false,
        ...options,
      });

      // Auto-close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      return notification;
    }
  };

  return {
    permission,
    requestPermission,
    showNotification,
    isSupported: "Notification" in window,
  };
};