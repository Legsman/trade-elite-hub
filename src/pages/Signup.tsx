
import { useState } from "react";
import { useAuth } from "@/hooks/auth";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Loading } from "@/components/ui/loading";
import { supabase } from "@/integrations/supabase/client";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [usernameAvailable, setUsernameAvailable] = useState(true);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const validateUsername = (val: string) => /^[A-Za-z0-9_]{3,30}$/.test(val);

  const checkUsername = async (val: string) => {
    setCheckingUsername(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", val)
      .maybeSingle();
    setUsernameAvailable(!data && !error);
    setCheckingUsername(false);
  };

  const handleUsernameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUsername(val);
    if (validateUsername(val)) {
      await checkUsername(val);
    } else {
      setUsernameAvailable(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateUsername(username)) {
      toast({
        title: "Invalid username",
        description: "Username must be 3-30 chars, only letters, numbers, and underscores.",
        variant: "destructive",
      });
      return;
    }
    if (!usernameAvailable) {
      toast({
        title: "Username taken",
        description: "Please choose a different username.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);

    try {
      const { error } = await signup({
        email,
        password,
        fullName,
        username,
      });
      
      if (error) {
        toast({
          title: "Signup failed",
          description: error.message || "Could not create your account",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Account created",
          description: "Welcome to SwiftTrade! Your account has been created successfully.",
        });
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast({
        title: "Signup failed",
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
            <h2 className="mt-6 text-2xl font-bold">Create your account</h2>
            <p className="mt-2 text-gray-600">
              Join SwiftTrade to buy and sell premium items
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Choose a unique username"
                  value={username}
                  onChange={handleUsernameChange}
                  minLength={3}
                  maxLength={30}
                  required
                  autoComplete="username"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Username must be 3-30 characters, only letters, numbers, and underscores.
                </p>
                {checkingUsername && (
                  <p className="text-xs text-muted-foreground">Checking availability...</p>
                )}
                {!checkingUsername && !usernameAvailable && (
                  <p className="text-xs text-destructive">Username is already taken.</p>
                )}
              </div>

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
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Password must be at least 6 characters
                </p>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loading size={16} message="" /> : "Create account"}
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-medium text-purple hover:underline"
                >
                  Sign in
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
              "url('https://images.unsplash.com/photo-1623000850275-db786eb5a771?q=80&w=2670&auto=format&fit=crop')",
          }}
        ></div>
      </div>
    </div>
  );
};

export default Signup;
