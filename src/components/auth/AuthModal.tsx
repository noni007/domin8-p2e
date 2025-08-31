
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Mail, Lock, User, Trophy, ArrowLeft, AlertCircle } from "lucide-react";
import { SocialLoginButtons } from "@/components/social/SocialLoginButtons";
import { WelcomeModal } from "./WelcomeModal";
import { validatePasswordSecurity } from "@/utils/passwordSecurity";
import { useRateLimiter } from "@/hooks/useRateLimiter";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const [loading, setLoading] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [userType, setUserType] = React.useState<"player" | "creator" | "organizer">("player");
  const [showForgotPassword, setShowForgotPassword] = React.useState(false);
  const [resetEmail, setResetEmail] = React.useState("");
  const [showWelcome, setShowWelcome] = React.useState(false);
  const [newUserData, setNewUserData] = React.useState<{username: string, userType: string} | null>(null);
  const [passwordValidation, setPasswordValidation] = React.useState<{
    isValid: boolean;
    errors: string[];
  } | null>(null);
  const { toast } = useToast();
  const { signIn, signUp, resetPassword, error: authError } = useAuth();
  
  // Rate limiter for sign-in attempts (5 attempts per 15 minutes)
  const rateLimiter = useRateLimiter({
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDurationMs: 15 * 60 * 1000 // 15 minutes block
  });

  // Show auth errors as toasts
  React.useEffect(() => {
    if (authError) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: authError,
      });
    }
  }, [authError, toast]);

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setUsername("");
    setUserType("player");
    setShowForgotPassword(false);
    setResetEmail("");
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetEmail) {
      toast({
        variant: "destructive",
        title: "Missing email",
        description: "Please enter your email address.",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await resetPassword(resetEmail);

      if (error) {
        throw error;
      }

      toast({
        title: "Reset email sent successfully!",
        description: `We've sent password reset instructions to ${resetEmail}. Check your email and click the link to reset your password.`,
      });
      
      setShowForgotPassword(false);
      setResetEmail("");
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast({
        variant: "destructive",
        title: "Failed to send reset email",
        description: error.message || "Please check the email address and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (newPassword: string) => {
    setPassword(newPassword);
    
    // Only validate if password is not empty
    if (newPassword.length > 0) {
      try {
        const validation = await validatePasswordSecurity(newPassword);
        setPasswordValidation(validation);
      } catch (error) {
        console.warn('Password validation error:', error);
        setPasswordValidation(null);
      }
    } else {
      setPasswordValidation(null);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !username) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please fill in all fields.",
      });
      return;
    }

    // Enhanced password validation
    if (!passwordValidation || !passwordValidation.isValid) {
      toast({
        variant: "destructive",
        title: "Password security requirements not met",
        description: passwordValidation?.errors[0] || "Please ensure your password meets all security requirements.",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await signUp(email, password, username, userType);

      if (error) {
        if (error.message.includes("already registered")) {
          toast({
            variant: "destructive",
            title: "Account already exists",
            description: "This email is already registered. Please sign in instead.",
          });
        } else {
          throw error;
        }
        return;
      }

      toast({
        title: "Account created successfully!",
        description: "Welcome to Domin8! Let's get you started.",
      });
      
      // Show welcome modal after successful signup
      setNewUserData({ username, userType });
      setShowWelcome(true);
      resetForm();
      onClose();
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        variant: "destructive",
        title: "Error creating account",
        description: error.message || "An unexpected error occurred.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check rate limiting first
    if (rateLimiter.isBlocked) {
      const remainingTime = Math.ceil(rateLimiter.getRemainingTime() / 60000);
      toast({
        variant: "destructive",
        title: "Too many attempts",
        description: `Please wait ${remainingTime} minutes before trying again.`,
      });
      return;
    }
    
    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please enter both email and password.",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await signIn(email, password);

      if (error) {
        // Record failed attempt for rate limiting
        rateLimiter.recordAttempt();
        
        if (error.message.includes("Invalid login credentials")) {
          toast({
            variant: "destructive",
            title: "Invalid credentials",
            description: `Please check your email and password. ${rateLimiter.attemptsRemaining} attempts remaining.`,
          });
        } else {
          throw error;
        }
        return;
      }

      // Reset rate limiter on successful login
      rateLimiter.reset();
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
      resetForm();
      onClose();
    } catch (error: any) {
      rateLimiter.recordAttempt();
      console.error('Signin error:', error);
      toast({
        variant: "destructive",
        title: "Error signing in",
        description: error.message || "An unexpected error occurred.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md bg-black/95 border-blue-800/30 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
            {showForgotPassword ? "Reset Password" : "Join Domin8"}
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            {showForgotPassword 
              ? "Enter your email to receive password reset instructions"
              : "Enter the Africa Esports ecosystem"
            }
          </DialogDescription>
        </DialogHeader>

        {showForgotPassword ? (
          <div className="space-y-4">
            <Button
              variant="ghost"
              onClick={() => setShowForgotPassword(false)}
              className="text-blue-400 hover:text-blue-300 p-0 h-auto"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to sign in
            </Button>
            
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email" className="text-white">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="Enter your email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending reset email...
                  </>
                ) : (
                  "Send Reset Email"
                )}
              </Button>
            </form>
          </div>
        ) : (
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-800/50">
              <TabsTrigger value="signin" className="data-[state=active]:bg-blue-600">
                Sign In
              </TabsTrigger>
              <TabsTrigger value="signup" className="data-[state=active]:bg-blue-600">
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-4">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email" className="text-white">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signin-password" className="text-white">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="text-right">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-blue-400 hover:text-blue-300 p-0 h-auto text-sm"
                    disabled={loading}
                  >
                    Forgot password?
                  </Button>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                 </Button>
               </form>
               
               {/* Social Login Options */}
               <div className="mt-6">
                 <div className="relative">
                   <div className="absolute inset-0 flex items-center">
                     <span className="w-full border-t border-gray-600" />
                   </div>
                   <div className="relative flex justify-center text-xs uppercase">
                     <span className="bg-black px-2 text-gray-400">Or continue with</span>
                   </div>
                 </div>
                 <div className="mt-6">
                   <SocialLoginButtons mode="login" onSuccess={onClose} />
                 </div>
               </div>
             </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-username" className="text-white">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signup-username"
                      type="text"
                      placeholder="Choose a username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-white">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-white">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a secure password"
                      value={password}
                      onChange={(e) => handlePasswordChange(e.target.value)}
                      className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400"
                      required
                      disabled={loading}
                    />
                  </div>
                  
                  {/* Password validation feedback */}
                  {password && passwordValidation && (
                    <div className="mt-2 space-y-1">
                      {passwordValidation.errors.map((error, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-red-400">
                          <AlertCircle className="h-3 w-3" />
                          <span>{error}</span>
                        </div>
                      ))}
                      {passwordValidation.isValid && (
                        <div className="flex items-center gap-2 text-sm text-green-400">
                          <div className="h-3 w-3 rounded-full bg-green-400" />
                          <span>Password meets security requirements</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Account Type</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      type="button"
                      variant={userType === "player" ? "default" : "outline"}
                      onClick={() => setUserType("player")}
                      className="text-xs p-2"
                      disabled={loading}
                    >
                      <Trophy className="h-3 w-3 mr-1" />
                      Player
                    </Button>
                    <Button
                      type="button"
                      variant={userType === "creator" ? "default" : "outline"}
                      onClick={() => setUserType("creator")}
                      className="text-xs p-2"
                      disabled={loading}
                    >
                      <User className="h-3 w-3 mr-1" />
                      Creator
                    </Button>
                    <Button
                      type="button"
                      variant={userType === "organizer" ? "default" : "outline"}
                      onClick={() => setUserType("organizer")}
                      className="text-xs p-2"
                      disabled={loading}
                    >
                      <Trophy className="h-3 w-3 mr-1" />
                      Organizer
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                 </Button>
               </form>
               
               {/* Social Login Options */}
               <div className="mt-6">
                 <div className="relative">
                   <div className="absolute inset-0 flex items-center">
                     <span className="w-full border-t border-gray-600" />
                   </div>
                   <div className="relative flex justify-center text-xs uppercase">
                     <span className="bg-black px-2 text-gray-400">Or sign up with</span>
                   </div>
                 </div>
                 <div className="mt-6">
                   <SocialLoginButtons mode="signup" onSuccess={onClose} />
                 </div>
               </div>
             </TabsContent>
           </Tabs>
        )}
        </DialogContent>
      </Dialog>

      {/* Welcome Modal for new users */}
      <WelcomeModal 
        isOpen={showWelcome}
        onClose={() => setShowWelcome(false)}
        username={newUserData?.username}
        userType={newUserData?.userType}
      />
    </>
  );
};

export { AuthModal };
