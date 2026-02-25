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

const Signup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const counselorIdParam = searchParams.get('counselorId');

  const [selectedRole, setSelectedRole] = useState<'counselor' | 'student' | 'parent' | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Common fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  // Student fields
  const [schoolName, setSchoolName] = useState("");
  const [grade, setGrade] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [parentPhone, setParentPhone] = useState("");

  // Counselor fields
  const [counselorPhone, setCounselorPhone] = useState("");
  const [counselorTitle, setCounselorTitle] = useState("");
  const [counselorBio, setCounselorBio] = useState("");
  const [counselorSpecialization, setCounselorSpecialization] = useState("");
  const [counselorYearsOfExperience, setCounselorYearsOfExperience] = useState("");

  // Parent fields
  const [invitationCode, setInvitationCode] = useState("");

  const getRoleIcon = (role: string, size = "h-8 w-8") => {
    switch (role) {
      case 'counselor': return <GraduationCap className={size} />;
      case 'student': return <Users className={size} />;
      case 'parent': return <UserCircle className={size} />;
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

  const navigateByRole = (role: string) => {
    switch (role) {
      case 'counselor': navigate('/dashboard'); break;
      case 'student': navigate('/student-dashboard'); break;
      case 'parent': navigate('/parent-portal'); break;
      default: navigate('/');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    setIsLoading(true);

    try {
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
            .single();

          if (existingSchool) {
            schoolId = existingSchool.id;
          } else {
            const { data: newSchool, error: schoolError } = await supabase
              .from('schools')
              .insert({ name: schoolName.trim() })
              .select('id')
              .single();
            if (schoolError) throw schoolError;
            schoolId = newSchool.id;
          }
        }

        const { error: profileError } = await supabase
          .from('profiles')
          .insert({ user_id: data.user.id, email, full_name: fullName, school_id: schoolId });
        if (profileError) throw profileError;

        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({ user_id: data.user.id, role: selectedRole });
        if (roleError) throw roleError;

        // Student-specific inserts
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
            });
          if (studentError) throw studentError;

          // if (counselorIdParam) {
          //   const { error: assignError } = await supabase
          //     .from('student_counselor_assignments')
          //     .insert({ student_id: data.user.id, counselor_id: counselorIdParam });
          //   if (assignError) throw assignError;
          // }
        }

        // Counselor-specific insert
        if (selectedRole === 'counselor') {
          const { error: counselorError } = await supabase
            .from('counselor_profiles')
            .insert({
              user_id: data.user.id,
              phone: counselorPhone || null,
              title: counselorTitle || null,
              bio: counselorBio || null,
              specialization: counselorSpecialization || null,
              years_of_experience: counselorYearsOfExperience
                ? parseInt(counselorYearsOfExperience)
                : null,
            });
          if (counselorError) throw counselorError;
        }

        // Parent-specific update
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
    } catch (error: any) {
      toast.error(error.message || "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full space-y-6">

        {/* Top row */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            className="gap-2"
            onClick={() => selectedRole ? setSelectedRole(null) : navigate('/')}
          >
            <ArrowLeft className="h-4 w-4" />
            {selectedRole ? 'Back' : 'Back to Sign In'}
          </Button>
        </div>

        {/* Logo */}
        <div className="flex justify-center">
          <img src={primroseLogo} alt="The Primrose Review" className="h-16 w-auto" />
        </div>

        <Card className="p-6 space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">
              {selectedRole ? `Sign up as ${getRoleLabel(selectedRole)}` : 'Create an account'}
            </h1>
            {!selectedRole && (
              <p className="text-sm text-muted-foreground mt-1">Choose your role to get started</p>
            )}
          </div>

          {/* Step 1: Role selection */}
          {!selectedRole && (
            <div className="grid grid-cols-3 gap-3">
              {(['counselor', 'student', 'parent'] as const).map((role) => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border border-border bg-muted/30 hover:bg-muted/60 hover:border-primary/30 transition-all"
                >
                  {getRoleIcon(role)}
                  <span className="text-sm font-medium">{getRoleLabel(role)}</span>
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Registration form based on role */}
          {selectedRole && (
            <form onSubmit={handleSignup} className="space-y-4">

              {/* Common fields */}
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="Enter your full name"
                />
              </div>

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
                  placeholder="Create a password"
                  minLength={6}
                />
              </div>

              {/* Student-specific fields */}
              {selectedRole === 'student' && (
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

                  <p className="text-sm font-medium text-muted-foreground pt-2">
                    Parent / Guardian <span className="font-normal">(optional)</span>
                  </p>

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

              {/* Counselor-specific fields */}
              {selectedRole === 'counselor' && (
                <div className="space-y-4 pt-2 border-t border-border">
                  <p className="text-sm font-medium text-muted-foreground">Professional Information</p>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="counselorTitle">Title</Label>
                      <Input
                        id="counselorTitle"
                        type="text"
                        value={counselorTitle}
                        onChange={(e) => setCounselorTitle(e.target.value)}
                        placeholder="Senior Counselor"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="counselorPhone">Phone</Label>
                      <Input
                        id="counselorPhone"
                        type="tel"
                        value={counselorPhone}
                        onChange={(e) => setCounselorPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="counselorSpecialization">Specialization</Label>
                    <Input
                      id="counselorSpecialization"
                      type="text"
                      value={counselorSpecialization}
                      onChange={(e) => setCounselorSpecialization(e.target.value)}
                      placeholder="Ivy League, STEM, Arts..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="counselorYearsOfExperience">Years of Experience</Label>
                    <Input
                      id="counselorYearsOfExperience"
                      type="number"
                      min="0"
                      max="50"
                      value={counselorYearsOfExperience}
                      onChange={(e) => setCounselorYearsOfExperience(e.target.value)}
                      placeholder="5"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="counselorBio">
                      Bio <span className="text-muted-foreground font-normal">(optional)</span>
                    </Label>
                    <textarea
                      id="counselorBio"
                      value={counselorBio}
                      onChange={(e) => setCounselorBio(e.target.value)}
                      placeholder="Tell students a bit about yourself..."
                      rows={3}
                      className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>
              )}

              {/* Parent-specific fields */}
              {selectedRole === 'parent' && (
                <div className="space-y-2 pt-2 border-t border-border">
                  <Label htmlFor="invitationCode">
                    Invitation Code <span className="text-muted-foreground font-normal">(from your child)</span>
                  </Label>
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
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>
          )}

          {/* Bottom: Sign in link */}
          <div className="text-center pt-2 border-t border-border">
            <span className="text-sm text-muted-foreground">Already have an account? </span>
            <button
              type="button"
              className="text-sm text-primary font-medium hover:underline"
              onClick={() => navigate('/auth')}
            >
              Sign in
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Signup;