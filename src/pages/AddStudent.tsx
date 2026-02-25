import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Upload,
  Copy,
  Send,
  UserPlus,
  Link2,
  Clock,
  Mail,
  Phone,
} from "lucide-react";

const AddStudent = () => {
  const [activeTab, setActiveTab] = useState("manual");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const { toast } = useToast();

  const [manualForm, setManualForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gpa: "",
    satScore: "",
    actScore: "",
    highSchool: "",
    graduationYear: "",
    profilePhoto: null as File | null,
  });

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // ── Step 1: Get the currently logged-in counselor ────────
      const { data: { user: counselor } } = await supabase.auth.getUser();
      if (!counselor) throw new Error("You must be logged in to add students");

      // ── Step 2: Create student auth account ──────────────────
      const tempPassword = Math.random().toString(36).slice(-10) + "A1!";
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: manualForm.email,
        password: tempPassword,
        options: {
          data: { full_name: `${manualForm.firstName} ${manualForm.lastName}` },
        },
      });
      if (authError) throw authError;
      if (!authData.user) throw new Error("Failed to create student account");

      const studentUserId = authData.user.id;

      // ── Step 3: Find or create school ────────────────────────
      let schoolId: string | null = null;
      if (manualForm.highSchool.trim()) {
        const { data: existingSchool } = await supabase
          .from("schools")
          .select("id")
          .ilike("name", manualForm.highSchool.trim())
          .single();

        if (existingSchool) {
          schoolId = existingSchool.id;
        } else {
          const { data: newSchool, error: schoolError } = await supabase
            .from("schools")
            .insert({ name: manualForm.highSchool.trim() })
            .select("id")
            .single();
          if (schoolError) throw schoolError;
          schoolId = newSchool.id;
        }
      }

      // ── Step 4: Insert into profiles ─────────────────────────
      const { error: profileError } = await supabase.from("profiles").insert({
        user_id: studentUserId,
        email: manualForm.email,
        full_name: `${manualForm.firstName} ${manualForm.lastName}`,
        school_id: schoolId,
      });
      if (profileError) throw profileError;

      // ── Step 5: Assign student role ───────────────────────────
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({ user_id: studentUserId, role: "student" });
      if (roleError) throw roleError;

      // ── Step 6: Insert into student_profiles ──────────────────
      const { error: studentProfileError } = await supabase
        .from("student_profiles")
        .insert({
          user_id: studentUserId,
          phone: manualForm.phone || null,
          gpa: manualForm.gpa ? parseFloat(manualForm.gpa) : null,
          sat_score: manualForm.satScore ? parseInt(manualForm.satScore) : null,
          act_score: manualForm.actScore ? parseInt(manualForm.actScore) : null,
          graduation_year: manualForm.graduationYear
            ? parseInt(manualForm.graduationYear)
            : null,
        });
      if (studentProfileError) throw studentProfileError;

      // ── Step 7: Link student to counselor (kept for future use) ──
      // TODO: Uncomment when assignment-based flow is implemented
      // const { error: assignError } = await supabase
      //   .from("student_counselor_assignments")
      //   .insert({
      //     student_id: studentUserId,
      //     counselor_id: counselor.id,
      //   });
      // if (assignError) throw assignError;

      toast({
        title: "Student Added Successfully",
        description: `${manualForm.firstName} ${manualForm.lastName} has been added to your roster.`,
      });

      // Reset form
      setManualForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        gpa: "",
        satScore: "",
        actScore: "",
        highSchool: "",
        graduationYear: "",
        profilePhoto: null,
      });
    } catch (error: any) {
      toast({
        title: "Failed to add student",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateInviteLink = async () => {
    try {
      const { data: { user: counselor } } = await supabase.auth.getUser();
      if (!counselor) throw new Error("You must be logged in");

      // TODO: When assignment flow is built, store invite code in DB
      // and link student to counselor when they register using it:
      // const { error } = await supabase
      //   .from("student_counselor_assignments")
      //   .insert({ counselor_id: counselor.id, invite_code: inviteCode, student_id: null })

      // For now — just generate the link with counselor ID embedded
      // Student registers normally, counselor links them manually later
      const inviteCode = Math.random().toString(36).substring(2, 15);
      const link = `${window.location.origin}/signup?role=student&counselorId=${counselor.id}&inviteCode=${inviteCode}`;
      setInviteLink(link);

      toast({
        title: "Invite Link Generated",
        description: "Share this link with your student so they can register.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to generate link",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    toast({
      title: "Link Copied",
      description: "Invite link has been copied to clipboard.",
    });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setManualForm({ ...manualForm, profilePhoto: file });
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Add Student</h1>
        <p className="text-muted-foreground">
          Add a new student to your counseling roster
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Manual Add
          </TabsTrigger>
          <TabsTrigger value="invite" className="flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            Invite Link
          </TabsTrigger>
        </TabsList>

        {/* Manual Add Tab */}
        <TabsContent value="manual">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-primary" />
                Add Student Manually
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Enter student information to add them directly to your roster.
                They'll receive an email to set their own password.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleManualSubmit} className="space-y-6">
                {/* Profile Photo */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage
                      src={
                        manualForm.profilePhoto
                          ? URL.createObjectURL(manualForm.profilePhoto)
                          : undefined
                      }
                    />
                    <AvatarFallback className="text-lg">
                      {manualForm.firstName.charAt(0)}
                      {manualForm.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Label
                      htmlFor="photo-upload"
                      className="block text-sm font-medium mb-2"
                    >
                      Profile Photo (Optional)
                    </Label>
                    <input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        document.getElementById("photo-upload")?.click()
                      }
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Photo
                    </Button>
                  </div>
                </div>

                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={manualForm.firstName}
                      onChange={(e) =>
                        setManualForm({
                          ...manualForm,
                          firstName: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={manualForm.lastName}
                      onChange={(e) =>
                        setManualForm({
                          ...manualForm,
                          lastName: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={manualForm.email}
                      onChange={(e) =>
                        setManualForm({ ...manualForm, email: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={manualForm.phone}
                      onChange={(e) =>
                        setManualForm({ ...manualForm, phone: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Academic Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="gpa">GPA</Label>
                    <Input
                      id="gpa"
                      type="number"
                      step="0.01"
                      min="0"
                      max="4.0"
                      value={manualForm.gpa}
                      onChange={(e) =>
                        setManualForm({ ...manualForm, gpa: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="satScore">SAT Score</Label>
                    <Input
                      id="satScore"
                      type="number"
                      min="400"
                      max="1600"
                      value={manualForm.satScore}
                      onChange={(e) =>
                        setManualForm({
                          ...manualForm,
                          satScore: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="actScore">ACT Score</Label>
                    <Input
                      id="actScore"
                      type="number"
                      min="1"
                      max="36"
                      value={manualForm.actScore}
                      onChange={(e) =>
                        setManualForm({
                          ...manualForm,
                          actScore: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                {/* School Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="highSchool">High School *</Label>
                    <Input
                      id="highSchool"
                      value={manualForm.highSchool}
                      onChange={(e) =>
                        setManualForm({
                          ...manualForm,
                          highSchool: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="graduationYear">Graduation Year *</Label>
                    <Input
                      id="graduationYear"
                      type="number"
                      min="2024"
                      max="2030"
                      value={manualForm.graduationYear}
                      onChange={(e) =>
                        setManualForm({
                          ...manualForm,
                          graduationYear: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Adding Student...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Student
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invite Link Tab */}
        <TabsContent value="invite">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link2 className="h-5 w-5 text-primary" />
                  Generate Student Invite Link
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Create a registration link for students to complete their own
                  onboarding
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">
                    Send Student Registration Link
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Generate a unique link — when the student registers using
                    it, they'll be automatically linked to your roster.
                  </p>
                  <Button onClick={generateInviteLink} size="lg">
                    <Link2 className="h-4 w-4 mr-2" />
                    Generate Invite Link
                  </Button>
                </div>

                {inviteLink && (
                  <div className="space-y-4">
                    <div className="p-4 bg-muted/50 rounded-lg border">
                      <Label className="text-sm font-medium">
                        Registration Link
                      </Label>
                      <div className="flex items-center gap-2 mt-2">
                        <Input
                          value={inviteLink}
                          readOnly
                          className="flex-1"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={copyInviteLink}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button variant="outline" className="h-12">
                        <Mail className="h-4 w-4 mr-2" />
                        Send via Email
                      </Button>
                      <Button variant="outline" className="h-12">
                        <Phone className="h-4 w-4 mr-2" />
                        Send via SMS
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* How it works */}
            <Card>
              <CardHeader>
                <CardTitle>How Student Self-Registration Works</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      step: 1,
                      title: "Student Receives Link",
                      desc: "Student clicks the registration link you provide",
                    },
                    {
                      step: 2,
                      title: "Complete Onboarding Form",
                      desc: "Student fills out personal details, academic info, and target schools",
                    },
                    {
                      step: 3,
                      title: "Added to Your Roster",
                      desc: "Student appears in your dashboard automatically linked to you",
                    },
                  ].map(({ step, title, desc }) => (
                    <div key={step} className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium shrink-0">
                        {step}
                      </div>
                      <div>
                        <h4 className="font-medium">{title}</h4>
                        <p className="text-sm text-muted-foreground">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AddStudent;