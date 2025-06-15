
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  LogOut,
  Settings,
  MessageSquare,
  Heart,
  User,
} from "lucide-react";
import { useAuth } from "@/hooks/auth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { toast } from "@/hooks/use-toast";

export default function UserMenu() {
  const { user, supabaseUser, logout } = useAuth();
  const { isAdmin, checking: checkingAdmin } = useIsAdmin();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const isAuthenticated = !!supabaseUser;

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
      toast({
        title: "Logout failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Profile"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <User className="h-5 w-5" />
      </Button>
      {isMenuOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1">
            <Link
              to="/dashboard"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Dashboard
            </Link>
            <Link
              to="/messages"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span>Messages</span>
              </div>
            </Link>
            <Link
              to="/saved"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                <span>Saved Items</span>
              </div>
            </Link>
            <Link
              to="/settings"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </div>
            </Link>
            {isAuthenticated && isAdmin && !checkingAdmin && (
              <Link
                to="/admin"
                className="block px-4 py-2 text-sm text-green-600 hover:bg-gray-100"
              >
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                    strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2l2 7h7l-5.5 4.3L19 21l-7-4.7L5 21l2.5-7.7L2 9h7z" />
                  </svg>
                  <span>Admin Panel</span>
                </div>
              </Link>
            )}
            <button
              className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={handleLogout}
            >
              <div className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
