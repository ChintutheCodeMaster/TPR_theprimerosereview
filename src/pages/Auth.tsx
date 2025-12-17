import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, GraduationCap, Users, UserCircle } from "lucide-react";
import primroseLogo from "@/assets/primrose-logo.png";

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get('role') as 'counselor' | 'student' | 'parent' | null;
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [invitationCode, setInvitationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'counselor' | 'student' | 'parent' | null>(roleParam);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'counselor': return <GraduationCap className="h-5 w-5" />;
      case 'student': return <Users className="h-5 w-5" />;
      case 'parent': return <UserCircle className="h-5 w-5" />;
      default: return null;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'counselor': return 'Counselor';
      case 'student': return 'Student';
      case 'parent': return 'Parent';
      default: return '';
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) {
      toast.error("Please select a role");
      return;
    }
    
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        // Redirect based on role (will be checked from database)
        navigateByRole(selectedRole);
      } else {
        const redirectUrl = `${window.location.origin}/`;
        
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              full_name: fullName,
            }
          }
        });
        
        if (error) throw error;
        
        // Add role to user_roles table
        if (data.user) {
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert({ user_id: data.user.id, role: selectedRole });
          
          if (roleError) throw roleError;

          // If parent with invitation code, link to student
          if (selectedRole === 'parent' && invitationCode) {
            const { error: linkError } = await supabase
              .from('parent_student_assignments')
              .update({ parent_id: data.user.id })
              .eq('invitation_code', invitationCode);
            
            if (linkError) {
              toast.error("Invalid invitation code");
            }
          }
        }
        
        toast.success("Account created successfully!");
        navigateByRole(selectedRole);
      }
    } catch (error: any) {
      toast.error(error.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  const navigateByRole = (role: string) => {
    switch (role) {
      case 'counselor':
        navigate('/dashboard');
        break;
      case 'student':
        navigate('/student-dashboard');
        break;
      case 'parent':
        navigate('/parent-portal');
        break;
      default:
        navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full space-y-6">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          className="gap-2"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        {/* Logo */}
        <div className="flex justify-center">
          <img 
            src={primroseLogo} 
            alt="The Primrose Review" 
            className="h-16 w-auto"
          />
        </div>

        <Card className="p-6 space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">
              {isLogin ? 'Sign In' : 'Create Account'}
            </h1>
            {selectedRole && (
              <div className="flex items-center justify-center gap-2 mt-2 text-muted-foreground">
                {getRoleIcon(selectedRole)}
                <span>as {getRoleLabel(selectedRole)}</span>
              </div>
            )}
          </div>

          {/* Role Selection */}
          {!selectedRole && (
            <div className="space-y-3">
              <Label>Select your role:</Label>
              <div className="grid grid-cols-3 gap-2">
                {(['counselor', 'student', 'parent'] as const).map((role) => (
                  <Button
                    key={role}
                    variant="outline"
                    className="h-16 flex-col gap-1"
                    onClick={() => setSelectedRole(role)}
                  >
                    {getRoleIcon(role)}
                    <span className="text-xs">{getRoleLabel(role)}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {selectedRole && (
            <form onSubmit={handleAuth} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required={!isLogin}
                    placeholder="Enter your full name"
                  />
                </div>
              )}

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
                <Label htmlFor="password">Password</Label>
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

              {!isLogin && selectedRole === 'parent' && (
                <div className="space-y-2">
                  <Label htmlFor="invitationCode">Invitation Code (from your child)</Label>
                  <Input
                    id="invitationCode"
                    type="text"
                    value={invitationCode}
                    onChange={(e) => setInvitationCode(e.target.value)}
                    placeholder="Enter invitation code"
                  />
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
              </Button>
            </form>
          )}

          <div className="text-center space-y-2">
            <button
              type="button"
              className="text-sm text-primary hover:underline"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
            
            {selectedRole && (
              <button
                type="button"
                className="block w-full text-sm text-muted-foreground hover:underline"
                onClick={() => setSelectedRole(null)}
              >
                Change role
              </button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
