import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { backgroundStep } from "@/data/steps/background";
import { useTeacherInvite, useGenerateTeacherInvite } from "@/hooks/useTeacherInvite";
import { BookOpen } from "lucide-react";
import {
  Upload,
  Copy,
  Send,
  UserPlus,
  Link2,
  Clock,
  Check,
  ChevronsUpDown,
  Search,
  Plus,
  X,
} from "lucide-react";
import { PageShell, PageHeader, HairlineCard, BlurOrb } from "@/components/primrose-night";

const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Australia",
  "Belgium", "Ireland", "Netherlands", "Norway", "South Korea",
  "Spain", "Switzerland", "Other",
];

const universityOptions: string[] =
  ((backgroundStep.questions[0] as any).subQuestions as any[]).find(
    (q) => q.id === "university"
  )?.options ?? [];

interface CollegeSlot {
  country: string;
  university: string;
  universityOther: string;
  open: boolean;
  search: string;
}

const emptySlot = (): CollegeSlot => ({
  country: "",
  university: "",
  universityOther: "",
  open: false,
  search: "",
});

const sectionVariants = {
  hidden: { opacity: 0, y: 10, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: [0.2, 0.6, 0.2, 1] as const },
  },
};

const filledInput = "bg-white/[0.02] hairline focus-visible:ring-0 focus-visible:ring-offset-0";
const nativeSelectStyles = "w-full h-10 px-3 rounded-md hairline bg-white/[0.02] text-sm text-foreground focus:outline-none focus:ring-0";
const eyebrowLabel = "text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-1.5 block";

const AddStudent = () => {
  const [activeTab, setActiveTab] = useState("manual");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [counselorSchoolName, setCounselorSchoolName] = useState("");

  const { data: existingTeacherInvite } = useTeacherInvite();
  const generateTeacherInvite = useGenerateTeacherInvite();
  const [teacherInviteLink, setTeacherInviteLink] = useState(existingTeacherInvite ?? "");
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

  const [targetColleges, setTargetColleges] = useState<CollegeSlot[]>([emptySlot()]);

  const updateCollegeSlot = (index: number, updates: Partial<CollegeSlot>) =>
    setTargetColleges((prev) =>
      prev.map((slot, i) => (i === index ? { ...slot, ...updates } : slot))
    );

  const addCollegeSlot = () =>
    setTargetColleges((prev) => [...prev, emptySlot()]);

  const removeCollegeSlot = (index: number) =>
    setTargetColleges((prev) => prev.filter((_, i) => i !== index));

  useEffect(() => {
    const fetchCounselorSchool = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("school_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!profile?.school_id) return;

      const { data: school } = await supabase
        .from("schools")
        .select("name")
        .eq("id", profile.school_id)
        .maybeSingle();

      if (school?.name) {
        setCounselorSchoolName(school.name);
        setManualForm((prev) => ({ ...prev, highSchool: school.name }));
      }
    };

    fetchCounselorSchool();
  }, []);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { user: counselor } } = await supabase.auth.getUser();
      if (!counselor) throw new Error("You must be logged in to add students");

      const tempPassword = Math.random().toString(36).slice(-10) + "A1!";
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: manualForm.email,
        password: tempPassword,
        options: {
          data: {
            full_name: `${manualForm.firstName} ${manualForm.lastName}`,
            role: "student",
          },
        },
      });
      if (authError) throw authError;
      if (!authData.user) throw new Error("Failed to create student account");

      const studentUserId = authData.user.id;

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

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          email: manualForm.email,
          full_name: `${manualForm.firstName} ${manualForm.lastName}`,
          school_id: schoolId,
        })
        .eq("user_id", studentUserId);
      if (profileError) throw profileError;

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

      const { error: assignError } = await supabase
        .from("student_counselor_assignments")
        .insert({
          student_id: studentUserId,
          counselor_id: counselor.id,
        });
      if (assignError) throw assignError;

      const collegeRows = targetColleges
        .map((s) => ({
          student_id: studentUserId,
          country: s.country || null,
          college: s.university === "Other" ? s.universityOther : s.university,
        }))
        .filter((r) => r.college);
      if (collegeRows.length > 0) {
        const { error: collegesError } = await (supabase as any)
          .from("student_target_colleges")
          .insert(collegeRows);
        if (collegesError) throw collegesError;
      }

      try {
        await supabase.functions.invoke("send-welcome-email", {
          body: {
            email: manualForm.email,
            fullName: `${manualForm.firstName} ${manualForm.lastName}`,
            role: "student",
            appUrl: window.location.origin,
          },
        });
      } catch (e) {
        console.error("Failed to send welcome email:", e);
      }

      toast({
        title: "Student Added Successfully",
        description: `${manualForm.firstName} ${manualForm.lastName} has been added to your roster.`,
      });

      setManualForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        gpa: "",
        satScore: "",
        actScore: "",
        highSchool: counselorSchoolName,
        graduationYear: "",
        profilePhoto: null,
      });
      setTargetColleges([emptySlot()]);
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

      const { data: existing } = await supabase
        .from("counselor_invites")
        .select("invite_code")
        .eq("counselor_id", counselor.id)
        .maybeSingle();

      let inviteCode: string;

      if (existing) {
        inviteCode = existing.invite_code;
      } else {
        inviteCode = Math.random().toString(36).substring(2, 15);
        const { error: insertError } = await supabase
          .from("counselor_invites")
          .insert({ counselor_id: counselor.id, invite_code: inviteCode });
        if (insertError) throw insertError;
      }

      const link = `${window.location.origin}/signup?invite=${inviteCode}`;
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
    <PageShell>
      <BlurOrb tone="sage" className="top-[-100px] right-[-100px] w-[500px] h-[500px]" />

      <PageHeader
        eyebrow="Roster"
        title={<>Bring someone new.</>}
        subtitle={<>Add a student to your care — or invite them to onboard themselves.</>}
      />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
        className="max-w-4xl mx-auto space-y-6"
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <motion.div variants={sectionVariants}>
            <TabsList className="grid w-full grid-cols-2 bg-white/[0.02] hairline p-1 h-auto">
              <TabsTrigger
                value="manual"
                className="data-[state=active]:bg-white/[0.06] data-[state=active]:text-foreground data-[state=active]:shadow-none text-muted-foreground flex items-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                Manual add
              </TabsTrigger>
              <TabsTrigger
                value="invite"
                className="data-[state=active]:bg-white/[0.06] data-[state=active]:text-foreground data-[state=active]:shadow-none text-muted-foreground flex items-center gap-2"
              >
                <Link2 className="h-4 w-4" />
                Invite link
              </TabsTrigger>
            </TabsList>
          </motion.div>

          {/* Manual Add Tab */}
          <TabsContent value="manual">
            <motion.div variants={sectionVariants}>
              <HairlineCard>
                <div className="mb-6">
                  <h3 className="font-serif text-2xl text-foreground leading-tight flex items-center gap-2">
                    <UserPlus className="h-5 w-5 text-[color:var(--pn-sage)]" />
                    Add them by hand.
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2 font-serif italic">
                    They'll get an email to set their own password.
                  </p>
                </div>

                <form onSubmit={handleManualSubmit} className="space-y-6">
                  {/* Profile Photo */}
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20 hairline">
                      <AvatarImage
                        src={
                          manualForm.profilePhoto
                            ? URL.createObjectURL(manualForm.profilePhoto)
                            : undefined
                        }
                      />
                      <AvatarFallback className="text-lg bg-white/[0.04] text-foreground">
                        {manualForm.firstName.charAt(0)}
                        {manualForm.lastName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Label htmlFor="photo-upload" className={eyebrowLabel}>
                        Profile photo (optional)
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
                        className="bg-transparent hairline hover:bg-white/[0.03] text-foreground shadow-none"
                        onClick={() => document.getElementById("photo-upload")?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload
                      </Button>
                    </div>
                  </div>

                  {/* Names */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" className={eyebrowLabel}>First name *</Label>
                      <Input
                        id="firstName"
                        value={manualForm.firstName}
                        onChange={(e) => setManualForm({ ...manualForm, firstName: e.target.value })}
                        required
                        className={filledInput}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className={eyebrowLabel}>Last name *</Label>
                      <Input
                        id="lastName"
                        value={manualForm.lastName}
                        onChange={(e) => setManualForm({ ...manualForm, lastName: e.target.value })}
                        required
                        className={filledInput}
                      />
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email" className={eyebrowLabel}>Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={manualForm.email}
                        onChange={(e) => setManualForm({ ...manualForm, email: e.target.value })}
                        required
                        className={filledInput}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className={eyebrowLabel}>Phone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={manualForm.phone}
                        onChange={(e) => setManualForm({ ...manualForm, phone: e.target.value })}
                        className={filledInput}
                      />
                    </div>
                  </div>

                  {/* Academic */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="gpa" className={eyebrowLabel}>GPA</Label>
                      <Input
                        id="gpa"
                        type="number"
                        step="0.01"
                        min="0"
                        max="4.0"
                        value={manualForm.gpa}
                        onChange={(e) => setManualForm({ ...manualForm, gpa: e.target.value })}
                        className={`${filledInput} num-display`}
                      />
                    </div>
                    <div>
                      <Label htmlFor="satScore" className={eyebrowLabel}>SAT</Label>
                      <Input
                        id="satScore"
                        type="number"
                        min="400"
                        max="1600"
                        value={manualForm.satScore}
                        onChange={(e) => setManualForm({ ...manualForm, satScore: e.target.value })}
                        className={`${filledInput} num-display`}
                      />
                    </div>
                    <div>
                      <Label htmlFor="actScore" className={eyebrowLabel}>ACT</Label>
                      <Input
                        id="actScore"
                        type="number"
                        min="1"
                        max="36"
                        value={manualForm.actScore}
                        onChange={(e) => setManualForm({ ...manualForm, actScore: e.target.value })}
                        className={`${filledInput} num-display`}
                      />
                    </div>
                  </div>

                  {/* School */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="highSchool" className={eyebrowLabel}>
                        High school *{" "}
                        {counselorSchoolName && (
                          <span className="normal-case tracking-normal text-xs text-muted-foreground ml-1">(auto-filled)</span>
                        )}
                      </Label>
                      <Input
                        id="highSchool"
                        value={manualForm.highSchool}
                        onChange={(e) => setManualForm({ ...manualForm, highSchool: e.target.value })}
                        readOnly={!!counselorSchoolName}
                        className={cn(filledInput, counselorSchoolName && "cursor-not-allowed opacity-70")}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="graduationYear" className={eyebrowLabel}>Graduation year *</Label>
                      <Input
                        id="graduationYear"
                        type="number"
                        min="2024"
                        max="2030"
                        value={manualForm.graduationYear}
                        onChange={(e) =>
                          setManualForm({ ...manualForm, graduationYear: e.target.value })
                        }
                        required
                        className={`${filledInput} num-display`}
                      />
                    </div>
                  </div>

                  {/* Target Universities */}
                  <div className="space-y-3 hairline-t pt-5">
                    <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                      Where they're aiming
                    </p>

                    {targetColleges.map((slot, index) => {
                      const filtered = slot.search.trim()
                        ? universityOptions.filter((u) =>
                            u.toLowerCase().includes(slot.search.toLowerCase())
                          )
                        : universityOptions;

                      return (
                        <div key={index} className="space-y-3 p-4 hairline rounded-lg bg-white/[0.02]">
                          <div className="flex items-center justify-between">
                            <span className="font-serif text-lg text-foreground">
                              University <span className="num-display">{index + 1}</span>
                            </span>
                            {targetColleges.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-[color:var(--pn-pink)] hover:bg-white/[0.03]"
                                onClick={() => removeCollegeSlot(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <Label className={eyebrowLabel}>Country</Label>
                              <select
                                value={slot.country}
                                onChange={(e) =>
                                  updateCollegeSlot(index, { country: e.target.value })
                                }
                                className={nativeSelectStyles}
                              >
                                <option value="">Select country…</option>
                                {COUNTRIES.map((c) => (
                                  <option key={c} value={c}>{c}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <Label className={eyebrowLabel}>University</Label>
                              <Popover
                                open={slot.open}
                                onOpenChange={(open) => updateCollegeSlot(index, { open })}
                              >
                                <PopoverTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    role="combobox"
                                    className={cn(
                                      "w-full h-10 justify-between font-normal bg-white/[0.02] hairline hover:bg-white/[0.03] text-foreground shadow-none",
                                      !slot.university && "text-muted-foreground"
                                    )}
                                  >
                                    <span>{slot.university || "Select university…"}</span>
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-pn-card hairline" align="start">
                                  <div className="flex items-center hairline-b px-3">
                                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                                    <input
                                      className="flex h-11 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground text-foreground"
                                      placeholder="Search universities…"
                                      value={slot.search}
                                      onChange={(e) =>
                                        updateCollegeSlot(index, { search: e.target.value })
                                      }
                                    />
                                  </div>
                                  <div className="max-h-72 overflow-y-auto">
                                    {filtered.length === 0 ? (
                                      <p className="py-6 text-center text-sm font-serif italic text-muted-foreground">
                                        Nothing by that name — yet.
                                      </p>
                                    ) : (
                                      filtered.map((u) => (
                                        <button
                                          key={u}
                                          type="button"
                                          onClick={() =>
                                            updateCollegeSlot(index, {
                                              university: u,
                                              universityOther: "",
                                              open: false,
                                              search: "",
                                            })
                                          }
                                          className="relative flex w-full cursor-pointer select-none items-center px-4 py-2.5 text-sm hover:bg-white/[0.04] text-left text-foreground"
                                        >
                                          <Check
                                            className={cn(
                                              "mr-2 h-4 w-4 shrink-0 text-[color:var(--pn-sage)]",
                                              slot.university === u ? "opacity-100" : "opacity-0"
                                            )}
                                          />
                                          {u}
                                        </button>
                                      ))
                                    )}
                                  </div>
                                </PopoverContent>
                              </Popover>
                            </div>
                          </div>

                          {slot.university === "Other" && (
                            <div>
                              <Label className={eyebrowLabel}>University name</Label>
                              <Input
                                value={slot.universityOther}
                                onChange={(e) =>
                                  updateCollegeSlot(index, { universityOther: e.target.value })
                                }
                                placeholder="Enter university name"
                                className={filledInput}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addCollegeSlot}
                      className="w-full border-dashed border-white/[0.15] bg-transparent hover:bg-white/[0.03] text-muted-foreground hover:text-foreground shadow-none"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add another university
                    </Button>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-transparent hairline hover:bg-white/[0.03] text-[color:var(--pn-pink)] shadow-none"
                  >
                    {isSubmitting ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Adding…
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add student
                      </>
                    )}
                  </Button>
                </form>
              </HairlineCard>
            </motion.div>
          </TabsContent>

          {/* Invite Link Tab */}
          <TabsContent value="invite">
            <motion.div variants={sectionVariants} className="space-y-6">
              <HairlineCard>
                <div className="mb-4">
                  <h3 className="font-serif text-2xl text-foreground leading-tight flex items-center gap-2">
                    <Link2 className="h-5 w-5 text-[color:var(--pn-sage)]" />
                    Send them a link.
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2 font-serif italic">
                    They'll onboard themselves and land in your roster.
                  </p>
                </div>

                <div className="text-center py-6">
                  <div className="w-16 h-16 hairline rounded-full flex items-center justify-center mx-auto mb-4 bg-[color:var(--pn-sage)]/10">
                    <Send className="h-7 w-7 text-[color:var(--pn-sage)]" />
                  </div>
                  <h4 className="font-serif text-xl text-foreground mb-2">Registration link.</h4>
                  <p className="text-muted-foreground mb-6 font-serif italic">
                    One link — anyone who signs up through it gets pinned to you.
                  </p>
                  <Button
                    onClick={generateInviteLink}
                    size="lg"
                    className="bg-transparent hairline hover:bg-white/[0.03] text-[color:var(--pn-pink)] shadow-none"
                  >
                    <Link2 className="h-4 w-4 mr-2" />
                    Generate invite link
                  </Button>
                </div>

                {inviteLink && (
                  <div className="p-4 hairline rounded-lg bg-white/[0.02]">
                    <Label className={eyebrowLabel}>Registration link</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input value={inviteLink} readOnly className={`flex-1 ${filledInput}`} />
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-transparent hairline hover:bg-white/[0.03] text-foreground shadow-none"
                        onClick={copyInviteLink}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </HairlineCard>

              <HairlineCard variant="pink">
                <div className="mb-4">
                  <h3 className="font-serif text-2xl text-foreground leading-tight flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-[color:var(--pn-pink)]" />
                    Invite a teacher.
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2 font-serif italic">
                    Share this link so teachers at your school can receive student essays.
                  </p>
                </div>

                {!teacherInviteLink && !existingTeacherInvite ? (
                  <div className="text-center py-4">
                    <Button
                      onClick={async () => {
                        try {
                          const link = await generateTeacherInvite.mutateAsync();
                          setTeacherInviteLink(link);
                          toast({ title: "Teacher invite link generated!", description: "Share it with your teachers." });
                        } catch (e: any) {
                          toast({ title: "Failed", description: e.message, variant: "destructive" });
                        }
                      }}
                      disabled={generateTeacherInvite.isPending}
                      className="bg-transparent hairline hover:bg-white/[0.03] text-[color:var(--pn-pink)] shadow-none"
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      {generateTeacherInvite.isPending ? "Generating…" : "Generate teacher invite link"}
                    </Button>
                  </div>
                ) : (
                  <div className="p-4 hairline rounded-lg bg-white/[0.02]">
                    <Label className={eyebrowLabel}>Teacher registration link</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        value={teacherInviteLink || existingTeacherInvite || ""}
                        readOnly
                        className={`flex-1 text-xs ${filledInput}`}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-transparent hairline hover:bg-white/[0.03] text-foreground shadow-none"
                        onClick={() => {
                          navigator.clipboard.writeText(teacherInviteLink || existingTeacherInvite || "");
                          toast({ title: "Copied!", description: "Teacher invite link copied to clipboard." });
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Teachers who sign up here get pinned to your school automatically.
                    </p>
                  </div>
                )}
              </HairlineCard>

              <HairlineCard>
                <h3 className="font-serif text-xl text-foreground mb-4">How self-registration works.</h3>
                <div className="space-y-4">
                  {[
                    {
                      step: 1,
                      title: "They open the link.",
                      desc: "A private URL, only good for your students.",
                    },
                    {
                      step: 2,
                      title: "They walk through onboarding.",
                      desc: "Personal details, academics, target schools — all self-serve.",
                    },
                    {
                      step: 3,
                      title: "They appear in your roster.",
                      desc: "Automatically linked to you. No paperwork.",
                    },
                  ].map(({ step, title, desc }) => (
                    <div key={step} className="flex items-start gap-3">
                      <div className="w-8 h-8 hairline rounded-full flex items-center justify-center text-sm num-display shrink-0 text-[color:var(--pn-sage)] bg-[color:var(--pn-sage)]/10">
                        {step}
                      </div>
                      <div>
                        <h4 className="font-serif text-lg text-foreground">{title}</h4>
                        <p className="text-sm text-muted-foreground">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </HairlineCard>
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </PageShell>
  );
};

export default AddStudent;
