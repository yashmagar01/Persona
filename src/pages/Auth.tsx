import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, MessageSquare, History, Sparkles, Shield } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/chatboard");
      }
    };
    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && event === "SIGNED_IN") {
        navigate("/chatboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/chatboard`,
          data: {
            full_name: fullName,
          }
        }
      });

      if (error) {
        console.error("Sign up error:", error);
        if (error.message.includes("already registered")) {
          toast.error("This email is already registered. Please sign in instead.");
        } else if (error.message.includes("Email not confirmed")) {
          toast.info("Please check your email and confirm your account before signing in.");
        } else {
          toast.error(error.message);
        }
        return;
      }

      if (data.user) {
        // Check if email confirmation is required
        if (data.user.identities && data.user.identities.length === 0) {
          toast.info("Please check your email to confirm your account!");
          return;
        }

        // Create profile
        const { error: profileError } = await supabase
          .from("profiles")
          .insert([
            {
              id: data.user.id,
              email: data.user.email,
              full_name: fullName || null,
            }
          ]);

        if (profileError) {
          console.error("Profile creation error:", profileError);
          // Don't block if profile creation fails, user can still proceed
        }

        toast.success("Account created successfully!");
        navigate("/chatboard");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred during sign up");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Sign in error:", error);
        if (error.message.includes("Invalid login credentials")) {
          toast.error("Invalid email or password. Please try again.");
        } else if (error.message.includes("Email not confirmed")) {
          toast.error("Please confirm your email before signing in. Check your inbox!");
        } else if (error.message.includes("User not found")) {
          toast.error("No account found with this email. Please sign up first.");
        } else {
          toast.error(error.message);
        }
        return;
      }

      toast.success("Welcome back!");
      navigate("/chatboard");
    } catch (error: any) {
      toast.error(error.message || "An error occurred during sign in");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/chatboard`,
        }
      });

      if (error) {
        console.error("Google sign in error:", error);
        toast.error(error.message || "Failed to sign in with Google");
      }
      // Don't show success message here as user will be redirected
    } catch (error: any) {
      toast.error(error.message || "An error occurred during Google sign in");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Background Pattern - Subtle Indian Architecture Motifs */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
        {/* Decorative Pattern Overlay */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 30-30 30L0 30 30 0zm0 10L10 30l20 20 20-20-20-20z' fill='%23ff6b35' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}
        />
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-orange-950/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-br from-orange-900/10 via-transparent to-purple-900/10" />
      </div>

      <div className="relative z-10 w-full max-w-7xl">
        <div className="grid lg:grid-cols-[60%_40%] gap-0 min-h-screen lg:min-h-0">
          {/* LEFT COLUMN - Auth Form Section (60%) */}
          <div className="flex flex-col justify-center p-6 lg:p-12 lg:pr-8">
            {/* Logo at Top Center */}
            <div className="flex flex-col items-center justify-center mb-8 space-y-4">
              <div className="flex items-center space-x-3 group">
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-4 rounded-2xl shadow-2xl shadow-orange-500/30 transition-transform duration-300 group-hover:scale-105">
                  <MessageSquare className="h-10 w-10 text-white" />
                </div>
              </div>
              <div className="text-center">
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">
                  Historical Chatboard
                </h1>
                <p className="text-gray-400 mt-2 text-lg">Connect with India's greatest minds</p>
              </div>
            </div>

            {/* Auth Form Card */}
            <Card className="shadow-2xl border-gray-800/50 bg-gray-900/80 backdrop-blur-xl max-w-xl mx-auto w-full">
          <CardHeader className="space-y-4">
            {/* Inline Messaging */}
            <div className="p-4 rounded-lg bg-gradient-to-r from-orange-500/10 to-orange-600/10 border border-orange-500/20">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <Shield className="h-5 w-5 text-orange-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-orange-400">Sign in to unlock all features</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Access your saved conversations, personalized experience, and complete chat history
                  </p>
                </div>
              </div>
            </div>

            <div>
              <CardTitle className="text-2xl text-white">Welcome</CardTitle>
              <CardDescription className="text-gray-400">Sign in or create an account to start your journey</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-800/50 border border-gray-700/50">
                <TabsTrigger 
                  value="signin"
                  className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger 
                  value="signup"
                  className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-5 mt-6">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="text-gray-200">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-orange-500 focus:ring-orange-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password" className="text-gray-200">Password</Label>
                    <div className="relative">
                      <Input
                        id="signin-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-orange-500 focus:ring-orange-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all duration-300" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="bg-gray-700" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-gray-900 px-3 text-gray-400">Or continue with</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full bg-gray-800/50 border-gray-700 text-gray-200 hover:bg-gray-800 hover:text-white hover:border-orange-500/50 transition-all duration-300"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  )}
                  Continue with Google
                </Button>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-5 mt-6">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="text-gray-200">Full Name (Optional)</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Your name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-orange-500 focus:ring-orange-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-gray-200">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-orange-500 focus:ring-orange-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-gray-200">Password</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password (min. 6 characters)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-orange-500 focus:ring-orange-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all duration-300" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="bg-gray-700" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-gray-900 px-3 text-gray-400">Or continue with</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full bg-gray-800/50 border-gray-700 text-gray-200 hover:bg-gray-800 hover:text-white hover:border-orange-500/50 transition-all duration-300"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  )}
                  Continue with Google
                </Button>
              </TabsContent>
            </Tabs>

            <div className="mt-6 pt-4 border-t border-gray-700/50 text-center">
              <Button
                variant="link"
                onClick={() => navigate("/chatboard")}
                className="text-sm text-gray-400 hover:text-orange-400 transition-colors"
              >
                Continue as Guest →
              </Button>
            </div>
          </CardContent>
        </Card>

          </div>

          {/* RIGHT COLUMN - Benefits Sidebar (40%) */}
          <div className="hidden lg:flex flex-col justify-center p-12 pl-8 border-l border-gray-800/50 relative">
            <div className="sticky top-24">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
                  <Sparkles className="h-8 w-8 text-orange-500" />
                  Why Sign Up?
                </h2>
                <p className="text-gray-400">
                  Unlock the full experience and save your journey through history
                </p>
              </div>

              <div className="space-y-6">
                {/* Benefit 1 - Save Conversations */}
                <div className="group flex items-start gap-4 p-5 rounded-xl bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 hover:border-orange-500/40 hover:bg-gray-800/60 transition-all duration-300 cursor-default">
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:shadow-orange-500/40 transition-shadow duration-300">
                    <MessageSquare className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-2 text-lg">Save Conversations</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      Never lose a meaningful dialogue. All your conversations are securely saved and accessible anytime.
                    </p>
                  </div>
                </div>

                {/* Benefit 2 - Access History */}
                <div className="group flex items-start gap-4 p-5 rounded-xl bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 hover:border-orange-500/40 hover:bg-gray-800/60 transition-all duration-300 cursor-default">
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:shadow-orange-500/40 transition-shadow duration-300">
                    <History className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-2 text-lg">Access History</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      Revisit past conversations and continue where you left off. Your entire chat history at your fingertips.
                    </p>
                  </div>
                </div>

                {/* Benefit 3 - Personalized Experience */}
                <div className="group flex items-start gap-4 p-5 rounded-xl bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 hover:border-orange-500/40 hover:bg-gray-800/60 transition-all duration-300 cursor-default">
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:shadow-orange-500/40 transition-shadow duration-300">
                    <Sparkles className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-2 text-lg">Personalized Experience</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      Get tailored recommendations and a customized interface that adapts to your interests.
                    </p>
                  </div>
                </div>

                {/* Call to Action Banner */}
                <div className="mt-4 p-5 rounded-xl bg-gradient-to-r from-orange-500/20 via-orange-600/15 to-orange-500/20 border border-orange-500/30 backdrop-blur-sm">
                  <div className="flex items-center justify-center gap-2">
                    <Shield className="h-5 w-5 text-orange-400" />
                    <p className="text-sm text-center text-orange-100 font-medium">
                      Secure • Private • Always Available
                    </p>
                  </div>
                  <p className="text-xs text-center text-gray-400 mt-2">
                    Join thousands exploring history through conversation 🚀
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
