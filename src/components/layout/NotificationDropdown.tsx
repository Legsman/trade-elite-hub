
import { Link } from "react-router-dom";
import { Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/useNotifications";

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
      <div className="w-80 p-6 flex justify-center items-center">
        <Loader2 className="animate-spin h-5 w-5" />
      </div>
    );
  }
  if (!notifications.length) {
    return (
      <div className="w-80 p-4 text-center text-muted-foreground text-sm">
        No notifications.
      </div>
    );
  }
  return (
    <div className="w-80 max-h-[60vh] flex flex-col">
      <div className="px-4 py-2 flex justify-between items-center border-b">
        <span className="font-semibold text-base">Notifications</span>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllAsRead}>
            <Check className="h-4 w-4 mr-1" /> Mark all read
          </Button>
        )}
      </div>
      <ul className="max-h-[40vh] overflow-y-auto">
        {notifications.map(n => (
          <li
            key={n.id}
            className={`px-4 py-2 cursor-pointer transition ${
              !n.is_read ? "bg-purple-50" : "bg-white"
            } hover:bg-purple-100`}
            onClick={() => {
              if (!n.is_read) markAsRead(n.id);
              onClose();
            }}
          >
            {n.type === "new_message" && n.metadata?.conversationId ? (
              <Link
                to={`/messages?id=${n.metadata.conversationId}${n.metadata.listingId ? `&listing=${n.metadata.listingId}` : ""}`}
                className="block text-sm"
              >
                <span className="font-medium">{n.message}</span>
                {n.metadata?.listingTitle && (
                  <span className="text-xs text-muted-foreground ml-1">
                    ({n.metadata.listingTitle})
                  </span>
                )}
              </Link>
            ) : (
              <span className="block text-sm">{n.message}</span>
            )}
            <span className="block text-xs text-gray-400 mt-1">
              {new Date(n.created_at).toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
