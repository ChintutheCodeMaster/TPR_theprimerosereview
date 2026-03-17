import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, GraduationCap, Phone, BookOpen } from "lucide-react";

interface ProfileForm {
  full_name: string;
  phone: string;
  grade: string;
  graduation_year: string;
  gpa: string;
  sat_score: string;
  act_score: string;
  parent_name: string;
  parent_phone: string;
}

const StudentEditProfile = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState("");
  const [form, setForm] = useState<ProfileForm>({
    full_name: "",
    phone: "",
    grade: "",
    graduation_year: "",
    gpa: "",
    sat_score: "",
    act_score: "",
    parent_name: "",
    parent_phone: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      setEmail(user.email ?? "");

      const [{ data: profile }, { data: studentProfile }] = await Promise.all([
        supabase.from("profiles").select("full_name").eq("user_id", user.id).maybeSingle(),
        supabase.from("student_profiles").select("phone, grade, graduation_year, gpa, sat_score, act_score, parent_name, parent_phone").eq("user_id", user.id).maybeSingle(),
      ]);

      setForm({
        full_name: profile?.full_name ?? "",
        phone: studentProfile?.phone ?? "",
        grade: studentProfile?.grade ?? "",
        graduation_year: studentProfile?.graduation_year?.toString() ?? "",
        gpa: studentProfile?.gpa?.toString() ?? "",
        sat_score: studentProfile?.sat_score?.toString() ?? "",
        act_score: studentProfile?.act_score?.toString() ?? "",
        parent_name: studentProfile?.parent_name ?? "",
        parent_phone: studentProfile?.parent_phone ?? "",
      });
    } catch (err: any) {
      toast({ title: "Failed to load profile", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof ProfileForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      const [profileResult, studentProfileResult] = await Promise.all([
        supabase.from("profiles").update({ full_name: form.full_name }).eq("user_id", user.id),
        supabase.from("student_profiles").upsert({
          user_id: user.id,
          phone: form.phone || null,
          grade: form.grade || null,
          graduation_year: form.graduation_year ? parseInt(form.graduation_year) : null,
          gpa: form.gpa ? parseFloat(form.gpa) : null,
          sat_score: form.sat_score ? parseInt(form.sat_score) : null,
          act_score: form.act_score ? parseInt(form.act_score) : null,
          parent_name: form.parent_name || null,
          parent_phone: form.parent_phone || null,
        }, { onConflict: "user_id" }),
      ]);

      if (profileResult.error) throw profileResult.error;
      if (studentProfileResult.error) throw studentProfileResult.error;

      toast({ title: "Profile updated", description: "Your changes have been saved." });
    } catch (err: any) {
      toast({ title: "Failed to save", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Edit Profile</h1>
        <p className="text-muted-foreground text-sm mt-1">Update your personal and academic details.</p>
      </div>

      {/* Personal Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Full Name</Label>
            <Input
              value={form.full_name}
              onChange={e => handleChange("full_name", e.target.value)}
              placeholder="Your full name"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input value={email} disabled className="bg-muted text-muted-foreground cursor-not-allowed" />
            <p className="text-xs text-muted-foreground">Email cannot be changed here.</p>
          </div>
          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input
              value={form.phone}
              onChange={e => handleChange("phone", e.target.value)}
              placeholder="+1 (555) 000-0000"
            />
          </div>
        </CardContent>
      </Card>

      {/* Academic Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-primary" />
            Academic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Grade</Label>
              <Input
                value={form.grade}
                onChange={e => handleChange("grade", e.target.value)}
                placeholder="e.g. 11th"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Graduation Year</Label>
              <Input
                type="number"
                value={form.graduation_year}
                onChange={e => handleChange("graduation_year", e.target.value)}
                placeholder="e.g. 2026"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>GPA</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                max="4"
                value={form.gpa}
                onChange={e => handleChange("gpa", e.target.value)}
                placeholder="3.8"
              />
            </div>
            <div className="space-y-1.5">
              <Label>SAT Score</Label>
              <Input
                type="number"
                value={form.sat_score}
                onChange={e => handleChange("sat_score", e.target.value)}
                placeholder="1500"
              />
            </div>
            <div className="space-y-1.5">
              <Label>ACT Score</Label>
              <Input
                type="number"
                value={form.act_score}
                onChange={e => handleChange("act_score", e.target.value)}
                placeholder="34"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Parent Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Phone className="h-4 w-4 text-primary" />
            Parent / Guardian
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Parent Name</Label>
            <Input
              value={form.parent_name}
              onChange={e => handleChange("parent_name", e.target.value)}
              placeholder="Parent's full name"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Parent Phone</Label>
            <Input
              value={form.parent_phone}
              onChange={e => handleChange("parent_phone", e.target.value)}
              placeholder="+1 (555) 000-0000"
            />
          </div>
          <div className="rounded-md bg-muted px-3 py-2">
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 shrink-0" />
              Parent email is managed by your counselor and cannot be changed here.
            </p>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="min-w-[120px]">
          {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving…</> : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};

export default StudentEditProfile;
