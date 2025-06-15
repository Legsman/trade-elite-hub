import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  User,
  Bell,
  Menu,
  Search,
  X,
  LogOut,
  Settings,
  MessageSquare,
  Heart,
} from "lucide-react";
import { 
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/hooks/auth";
import { toast } from "@/hooks/use-toast";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import NotificationDropdown from "./NotificationDropdown";
import NotificationBell from "./NotificationBell";
import UserMenu from "./UserMenu";
import { useNotifications } from "@/hooks/useNotifications";

const Navbar = () => {
  const { user, supabaseUser, logout } = useAuth();
  const { isAdmin, checking: checkingAdmin } = useIsAdmin();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Defensive: Only allow admin links if both isAuthenticated and isAdmin are true (and not checking)
  const isAuthenticated = !!supabaseUser;

  // Debug log for admin status
  useEffect(() => {
    console.log("Navbar - Is Admin:", isAdmin, "User:", !!user, "CheckingAdmin:", checkingAdmin);
  }, [isAdmin, user, checkingAdmin]);

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

  const [showNotif, setShowNotif] = useState(false);
  const { unreadCount } = useNotifications();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2 md:gap-4">
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-4 mt-8">
                <Link to="/" className="text-lg font-semibold hover:text-purple transition-colors">
                  Home
                </Link>
                <Link to="/listings" className="text-lg font-semibold hover:text-purple transition-colors">
                  Browse Listings
                </Link>
                <Link to="/about" className="text-lg font-semibold hover:text-purple transition-colors">
                  About Us
                </Link>
                <Link to="/contact" className="text-lg font-semibold hover:text-purple transition-colors">
                  Contact
                </Link>
                {isAuthenticated && (
                  <>
                    <Link to="/dashboard" className="text-lg font-semibold hover:text-purple transition-colors">
                      Dashboard
                    </Link>
                    <Link to="/messages" className="text-lg font-semibold hover:text-purple transition-colors">
                      Messages
                    </Link>
                    <Link to="/saved" className="text-lg font-semibold hover:text-purple transition-colors">
                      Saved Items
                    </Link>
                    <Link to="/profile" className="text-lg font-semibold hover:text-purple transition-colors">
                      My Profile
                    </Link>
                    {/* Only render admin panel link if user is authenticated AND isAdmin is true AND not checking */}
                    {isAuthenticated && isAdmin && !checkingAdmin && (
                      <Link to="/admin" className="text-lg font-semibold text-green-600 hover:text-green-800 transition-colors">
                        Admin Panel
                      </Link>
                    )}
                    <button 
                      onClick={handleLogout}
                      className="text-lg font-semibold text-left hover:text-purple transition-colors"
                    >
                      Logout
                    </button>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
          <Link to="/" className="flex items-center">
            <span className="text-xl font-bold tracking-tight md:text-2xl">
              <span className="text-purple">Swift</span>Trade
            </span>
          </Link>
        </div>

        <nav className="hidden gap-6 md:flex">
          <Link to="/" className="text-sm font-medium transition-colors hover:text-purple">
            Home
          </Link>
          <Link to="/listings" className="text-sm font-medium transition-colors hover:text-purple">
            Browse Listings
          </Link>
          <Link to="/about" className="text-sm font-medium transition-colors hover:text-purple">
            About Us
          </Link>
          <Link to="/contact" className="text-sm font-medium transition-colors hover:text-purple">
            Contact
          </Link>
          {/* Only show if authenticated and isAdmin */}
          {isAuthenticated && isAdmin && !checkingAdmin && (
            <Link to="/admin" className="text-sm font-medium text-green-600 transition-colors hover:text-green-800">
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Button variant="ghost" size="icon" aria-label="Search">
                <Search className="h-5 w-5" />
              </Button>
              <NotificationBell />
              <UserMenu />
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button variant="default" size="sm" asChild>
                <Link to="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
