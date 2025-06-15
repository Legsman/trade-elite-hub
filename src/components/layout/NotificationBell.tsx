
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import NotificationDropdown from "./NotificationDropdown";
import { useNotifications } from "@/hooks/useNotifications";
import { useState } from "react";

export default function NotificationBell() {
  const [showNotif, setShowNotif] = useState(false);
  const { unreadCount } = useNotifications();

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Notifications"
        className="relative"
        onClick={() => setShowNotif((v) => !v)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 rounded-full bg-red-500 text-white text-[10px] px-1.5 py-0.5 font-semibold leading-none flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </Button>
      {showNotif && (
        <div className="absolute right-0 top-12 z-50">
          <NotificationDropdown onClose={() => setShowNotif(false)} />
        </div>
      )}
    </div>
  );
}
