
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

const Navbar = () => {
  const { user, supabaseUser, logout } = useAuth();
  const { isAdmin } = useIsAdmin();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

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

  const isAuthenticated = !!supabaseUser;

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
                    {isAdmin && (
                      <Link to="/admin" className="text-lg font-semibold hover:text-purple transition-colors">
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
          {isAdmin && isAuthenticated && (
            <Link to="/admin" className="text-sm font-medium transition-colors hover:text-purple">
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
              <Button variant="ghost" size="icon" aria-label="Notifications">
                <Bell className="h-5 w-5" />
              </Button>
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
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
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
