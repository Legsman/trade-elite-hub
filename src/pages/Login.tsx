
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/auth";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Loading } from "@/components/ui/loading";
import { assignAdminRole, checkUserRoles } from "@/utils/adminUtils";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState("");
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the redirect path from location state, or default to dashboard
  const from = location.state?.from?.pathname || "/dashboard";

  // Debug info for admin role
  useEffect(() => {
    const fetchRoles = async () => {
      if (!user) return;
      
      try {
        const result = await checkUserRoles(user.id);
        if (!result.success) {
          setDebugInfo(`Error checking roles: ${result.error?.message}`);
        } else {
          setDebugInfo(`User roles: ${JSON.stringify(result.roles)}`);
          console.log("User roles debug:", result.roles);
        }
      } catch (e) {
        console.error("Debug error:", e);
      }
    };
    
    fetchRoles();
  }, [user]);

  const handleAssignAdmin = async () => {
    if (!user) {
      toast({
        title: "Not logged in",
        description: "You need to be logged in to assign admin role",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const result = await assignAdminRole(user.id);
      if (result.success) {
        toast({
          title: "Admin role assigned",
          description: "You have been assigned the admin role.",
        });
        // Refresh role display
        const roleResult = await checkUserRoles(user.id);
        if (roleResult.success) {
          setDebugInfo(`User roles: ${JSON.stringify(roleResult.roles)}`);
        }
      } else {
        toast({
          title: "Failed to assign admin role",
          description: result.error?.message || "Unknown error",
          variant: "destructive",
        });
      }
    } catch (e) {
      console.error("Error assigning admin role:", e);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await login(email, password);
      
      if (error) {
        toast({
          title: "Login failed",
          description: error.message || "Invalid email or password",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
        
        // Delay navigation slightly to allow auth state to update
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 100);
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight">
              <span className="text-purple">Swift</span>Trade
            </h1>
            <h2 className="mt-6 text-2xl font-bold">Welcome back</h2>
            <p className="mt-2 text-gray-600">
              Sign in to your account to continue
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="text-sm font-medium text-purple hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loading size={16} message="" /> : "Sign in"}
            </Button>

            {user && (
              <Button 
                type="button" 
                variant="outline" 
                className="w-full mt-2" 
                onClick={handleAssignAdmin}
                disabled={isLoading}
              >
                Make Me Admin (Testing)
              </Button>
            )}

            {debugInfo && (
              <div className="p-2 bg-gray-100 rounded text-xs overflow-auto">
                <pre>{debugInfo}</pre>
              </div>
            )}

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="font-medium text-purple hover:underline"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      <div className="hidden lg:block lg:flex-1">
        <div
          className="h-full bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1611174743420-3d7df880ce32?q=80&w=2574&auto=format&fit=crop')",
          }}
        ></div>
      </div>
    </div>
  );
};

export default Login;
