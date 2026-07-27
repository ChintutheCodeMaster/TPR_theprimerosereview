import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import primroseLogo from "@/assets/primrose-logo.png";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";

const STUDENT_DESTINATION = '/student-guide';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success("Password reset email sent! Check your inbox.");
      setShowForgotPassword(false);
      setForgotEmail("");
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset email");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', authData.user.id)
        .single();

      if (roleError || !roleData) {
        await supabase.auth.signOut();
        throw new Error('No Primrose student account found for this email.');
      }

      if (roleData.role !== 'student') {
        await supabase.auth.signOut();
        throw new Error('Primrose is now a student-only platform. This account is not a student.');
      }

      toast.success('Welcome back!');
      navigate(STUDENT_DESTINATION);
    } catch (error: any) {
      toast.error(error.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full space-y-6">
        <div className="flex justify-center">
          <img src={primroseLogo} alt="The Primrose Review" className="h-16 w-auto" />
        </div>

        <Card className="p-6 space-y-6">
          {showForgotPassword ? (
            <>
              <div className="text-center">
                <h2 className="text-lg font-semibold">Reset your password</h2>
                <p className="text-sm text-muted-foreground mt-1">Enter your email and we'll send you a reset link.</p>
              </div>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="forgot-email">Email</Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    placeholder="Enter your email"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={forgotLoading}>
                  {forgotLoading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </form>
              <button
                type="button"
                className="block w-full text-sm text-muted-foreground hover:underline text-center"
                onClick={() => setShowForgotPassword(false)}
              >
                Back to sign in
              </button>
            </>
          ) : (
            <>
              <div className="text-center">
                <h1 className="text-2xl font-bold text-foreground">Sign in</h1>
                <p className="text-sm text-muted-foreground mt-1">Welcome back to Primrose.</p>
              </div>

              <GoogleSignInButton mode="login" />

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">or</span>
                </div>
              </div>

              <form onSubmit={handleAuth} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your email"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <button
                      type="button"
                      className="text-xs text-primary hover:underline"
                      onClick={() => { setForgotEmail(email); setShowForgotPassword(true); }}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                    minLength={6}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Please wait...' : 'Sign In'}
                </Button>
              </form>

              <div className="text-center pt-2 border-t border-border">
                <span className="text-sm text-muted-foreground">Don't have an account? </span>
                <button
                  type="button"
                  className="text-sm text-primary font-medium hover:underline"
                  onClick={() => navigate('/signup')}
                >
                  Sign up here
                </button>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Login;
