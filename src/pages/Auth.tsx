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
  const counselorIdParam = searchParams.get('counselorId'); // ← add after roleParam line
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [invitationCode, setInvitationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'counselor' | 'student' | 'parent' | null>(roleParam);

  // ── FIX 3: Student-specific fields ──────────────────────────
  const [schoolName, setSchoolName] = useState("");
  const [grade, setGrade] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  // ────────────────────────────────────────────────────────────

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
        const { data: authData, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;

        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', authData.user.id)
          .single()

        if (roleError || !roleData) throw new Error('Could not fetch user role')

        navigateByRole(roleData.role);

      } else {
        const redirectUrl = `${window.location.origin}/`;
        
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: { full_name: fullName }
          }
        });
        
        if (error) throw error;
        
        if (data.user) {
          let schoolId: string | null = null;

          if (selectedRole === 'student' && schoolName.trim()) {
            const { data: existingSchool } = await supabase
              .from('schools')
              .select('id')
              .ilike('name', schoolName.trim())
              .single()

            if (existingSchool) {
              schoolId = existingSchool.id
            } else {
              const { data: newSchool, error: schoolError } = await supabase
                .from('schools')
                .insert({ name: schoolName.trim() })
                .select('id')
                .single()
              if (schoolError) throw schoolError
              schoolId = newSchool.id
            }
          }

          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              user_id: data.user.id,
              email: email,
              full_name: fullName,
              school_id: schoolId,
            })
          if (profileError) throw profileError

          const { error: roleError } = await supabase
            .from('user_roles')
            .insert({ user_id: data.user.id, role: selectedRole });
          if (roleError) throw roleError;

          if (selectedRole === 'student') {
            const { error: studentError } = await supabase
              .from('student_profiles')
              .insert({
                user_id: data.user.id,
                grade: grade || null,
                graduation_year: graduationYear ? parseInt(graduationYear) : null,
                parent_name: parentName || null,
                parent_email: parentEmail || null,
                parent_phone: parentPhone || null,
              })
            if (studentError) throw studentError

            // Auto-link to counselor if came from invite link
            if (counselorIdParam) {
              const { error: assignError } = await supabase
                .from('student_counselor_assignments')
                .insert({
                  student_id: data.user.id,
                  counselor_id: counselorIdParam,
                })
              if (assignError) throw assignError
            }
          }

          if (selectedRole === 'parent' && invitationCode) {
            const { error: linkError } = await supabase
              .from('parent_student_assignments')
              .update({ parent_id: data.user.id })
              .eq('invitation_code', invitationCode);
            if (linkError) toast.error("Invalid invitation code");
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

              {/* ── FIX 3: Student-specific fields (signup only) ── */}
              {!isLogin && selectedRole === 'student' && (
                <div className="space-y-4 pt-2 border-t border-border">
                  <p className="text-sm font-medium text-muted-foreground">School Information</p>

                  <div className="space-y-2">
                    <Label htmlFor="schoolName">School Name</Label>
                    <Input
                      id="schoolName"
                      type="text"
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      placeholder="Lincoln High School"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="grade">Grade</Label>
                      <select
                        id="grade"
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                      >
                        <option value="">Select...</option>
                        <option>9th</option>
                        <option>10th</option>
                        <option>11th</option>
                        <option>12th</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="graduationYear">Grad Year</Label>
                      <select
                        id="graduationYear"
                        value={graduationYear}
                        onChange={(e) => setGraduationYear(e.target.value)}
                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                      >
                        <option value="">Select...</option>
                        <option>2025</option>
                        <option>2026</option>
                        <option>2027</option>
                        <option>2028</option>
                      </select>
                    </div>
                  </div>

                  <p className="text-sm font-medium text-muted-foreground pt-2">Parent / Guardian <span className="font-normal">(optional)</span></p>

                  <div className="space-y-2">
                    <Label htmlFor="parentName">Parent Name</Label>
                    <Input
                      id="parentName"
                      type="text"
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      placeholder="Robert Thompson"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="parentEmail">Parent Email</Label>
                    <Input
                      id="parentEmail"
                      type="email"
                      value={parentEmail}
                      onChange={(e) => setParentEmail(e.target.value)}
                      placeholder="parent@email.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="parentPhone">Parent Phone</Label>
                    <Input
                      id="parentPhone"
                      type="tel"
                      value={parentPhone}
                      onChange={(e) => setParentPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>
              )}
              {/* ────────────────────────────────────────────────── */}

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
