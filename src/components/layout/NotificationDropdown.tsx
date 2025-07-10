
import { Link } from "react-router-dom";
import { Loader2, Check, DollarSign, CheckCircle, XCircle, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/useNotifications";

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "new_offer":
      return <DollarSign className="h-4 w-4 text-green-600" />;
    case "offer_accepted":
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case "offer_declined":
    case "offer_auto_declined":
      return <XCircle className="h-4 w-4 text-red-600" />;
    case "new_message":
      return <MessageSquare className="h-4 w-4 text-blue-600" />;
    default:
      return null;
  }
};

const getNotificationLink = (notification: any) => {
  if (notification.type === "new_message" && notification.metadata?.conversationId) {
    return `/messages?id=${notification.metadata.conversationId}${
      notification.metadata.listingId ? `&listing=${notification.metadata.listingId}` : ""
    }`;
  }
  
  if (
    (notification.type === "new_offer" || 
     notification.type === "offer_accepted" || 
     notification.type === "offer_declined" || 
     notification.type === "offer_auto_declined") && 
    notification.metadata?.listing_id
  ) {
    return `/listings/${notification.metadata.listing_id}`;
  }
  
  return null;
};

export default function NotificationDropdown({ onClose }: { onClose: () => void }) {
  const {
    notifications,
    isLoading,
    markAsRead,
    markAllAsRead,
    unreadCount,
  } = useNotifications();

  if (isLoading) {
    return (
      <div className="w-80 p-6 flex justify-center items-center bg-background border border-border rounded-lg shadow-lg">
        <Loader2 className="animate-spin h-5 w-5 text-primary" />
      </div>
    );
  }
  if (!notifications.length) {
    return (
      <div className="w-80 p-6 text-center text-muted-foreground text-sm bg-background border border-border rounded-lg shadow-lg">
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <Check className="h-6 w-6 text-muted-foreground" />
          </div>
          <p>No notifications.</p>
          <p className="text-xs">You're all caught up!</p>
        </div>
      </div>
    );
  }
  return (
    <div className="w-80 max-h-[60vh] flex flex-col bg-background border border-border rounded-lg shadow-lg">
      <div className="px-4 py-3 flex justify-between items-center border-b border-border">
        <span className="font-semibold text-base text-foreground">Notifications</span>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllAsRead}>
            <Check className="h-4 w-4 mr-1" /> Mark all read
          </Button>
        )}
      </div>
      <ul className="max-h-[40vh] overflow-y-auto">
        {notifications.map(n => {
          const notificationLink = getNotificationLink(n);
          const icon = getNotificationIcon(n.type);
          
          return (
            <li
              key={n.id}
              className={`px-4 py-3 cursor-pointer transition border-b border-gray-100 last:border-b-0 ${
                !n.is_read ? "bg-primary/5" : "bg-background"
              } hover:bg-primary/10`}
              onClick={() => {
                if (!n.is_read) markAsRead(n.id);
                onClose();
              }}
            >
              {notificationLink ? (
                <Link to={notificationLink} className="block">
                  <div className="flex items-start gap-3">
                    {icon && (
                      <div className="flex-shrink-0 mt-0.5">
                        {icon}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground">
                        {n.message}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(n.created_at).toLocaleString()}
                      </div>
                    </div>
                    {!n.is_read && (
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                      </div>
                    )}
                  </div>
                </Link>
              ) : (
                <div className="flex items-start gap-3">
                  {icon && (
                    <div className="flex-shrink-0 mt-0.5">
                      {icon}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground">
                      {n.message}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(n.created_at).toLocaleString()}
                    </div>
                  </div>
                  {!n.is_read && (
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    </div>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
