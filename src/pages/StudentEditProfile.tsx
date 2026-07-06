import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  PageShell,
  PageHeader,
  HairlineCard,
  BlurOrb,
} from "@/components/primrose-night";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { backgroundStep } from "@/data/steps/background";
import { Loader2, User, GraduationCap, Phone, BookOpen, Building2, Plus, X, ChevronsUpDown, Search, Check } from "lucide-react";

const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Australia",
  "Belgium", "Ireland", "Netherlands", "Norway", "South Korea",
  "Spain", "Switzerland", "Other",
];

const universityOptions: string[] =
  ((backgroundStep.questions[0] as any).subQuestions as any[]).find(
    (q) => q.id === "university"
  )?.options ?? [];

const GRADES = ["10th Grade", "11th Grade", "12th Grade", "Post High School"];

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
  parent_email: string;
}

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

// Underline input style — transparent w/ hairline bottom border, pink focus
const underlineInput =
  "bg-transparent border-0 border-b border-white/[0.12] rounded-none px-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-b-[color:var(--pn-pink)] transition-colors";

const eyebrowLabel = "text-[10px] uppercase tracking-[0.22em] text-muted-foreground";

const sectionVariants = {
  hidden: { opacity: 0, y: 8, filter: "blur(4px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.4, ease: [0.2, 0.6, 0.2, 1] as const } },
};

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
    parent_email: "",
  });
  const [colleges, setColleges] = useState<CollegeSlot[]>([emptySlot()]);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      setEmail(user.email ?? "");

      const [{ data: profile }, { data: studentProfile }, { data: targetColleges }] = await Promise.all([
        supabase.from("profiles").select("full_name").eq("user_id", user.id).maybeSingle(),
        supabase.from("student_profiles").select("phone, grade, graduation_year, gpa, sat_score, act_score, parent_name, parent_email, parent_phone").eq("user_id", user.id).maybeSingle(),
        (supabase as any).from("student_target_colleges").select("country, college").eq("student_id", user.id),
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
        parent_email: studentProfile?.parent_email ?? "",
      });

      if (targetColleges && targetColleges.length > 0) {
        setColleges(
          targetColleges.map((c: any) => {
            const isKnown = universityOptions.includes(c.college);
            return {
              country: c.country ?? "",
              university: isKnown ? c.college : (c.college ? "Other" : ""),
              universityOther: isKnown ? "" : (c.college ?? ""),
              open: false,
              search: "",
            };
          })
        );
      }
    } catch (err: any) {
      toast({ title: "Failed to load profile", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof ProfileForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const updateCollege = (index: number, updates: Partial<CollegeSlot>) => {
    setColleges(prev => prev.map((slot, i) => i === index ? { ...slot, ...updates } : slot));
  };

  const addCollege = () => setColleges(prev => [...prev, emptySlot()]);

  const removeCollege = (index: number) => {
    if (colleges.length > 1) setColleges(prev => prev.filter((_, i) => i !== index));
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

      const { error: deleteError } = await (supabase as any)
        .from("student_target_colleges")
        .delete()
        .eq("student_id", user.id);
      if (deleteError) throw deleteError;

      const validColleges = colleges
        .map(c => ({
          student_id: user.id,
          country: c.country || null,
          college: c.university === "Other" ? c.universityOther.trim() : c.university.trim(),
        }))
        .filter(c => c.college);

      if (validColleges.length > 0) {
        const { error: insertError } = await (supabase as any)
          .from("student_target_colleges")
          .insert(validColleges);
        if (insertError) throw insertError;
      }

      toast({ title: "Profile updated", description: "Your changes have been saved." });
    } catch (err: any) {
      toast({ title: "Failed to save", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageShell>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <BlurOrb tone="pink" className="top-[-100px] right-[-100px] w-[440px] h-[440px]" />

      <PageHeader
        eyebrow="Your Profile"
        title={<>The details of you.</>}
        subtitle={<>Kept up to date, so your counselor knows where to help.</>}
      />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
        className="space-y-6 max-w-2xl mx-auto"
      >

        {/* Personal Info */}
        <motion.div variants={sectionVariants}>
          <HairlineCard>
            <div className="flex items-center gap-3 mb-6">
              <User className="h-5 w-5 text-foreground/60" />
              <div>
                <h2 className="font-serif text-xl text-foreground leading-tight">Who you are.</h2>
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-1">Name, email, phone</p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className={eyebrowLabel}>Full Name</Label>
                <Input
                  value={form.full_name}
                  onChange={e => handleChange("full_name", e.target.value)}
                  placeholder="Your full name"
                  className={underlineInput}
                />
              </div>
              <div className="space-y-2">
                <Label className={eyebrowLabel}>Email</Label>
                <Input
                  value={email}
                  disabled
                  className={cn(underlineInput, "text-muted-foreground cursor-not-allowed")}
                />
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Email cannot be changed here.</p>
              </div>
              <div className="space-y-2">
                <Label className={eyebrowLabel}>Phone</Label>
                <Input
                  value={form.phone}
                  onChange={e => handleChange("phone", e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className={underlineInput}
                />
              </div>
            </div>
          </HairlineCard>
        </motion.div>

        {/* Academic Info */}
        <motion.div variants={sectionVariants}>
          <HairlineCard>
            <div className="flex items-center gap-3 mb-6">
              <GraduationCap className="h-5 w-5 text-foreground/60" />
              <div>
                <h2 className="font-serif text-xl text-foreground leading-tight">The academics.</h2>
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-1">Grade, scores, GPA</p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className={eyebrowLabel}>Grade</Label>
                  <Select value={form.grade} onValueChange={v => handleChange("grade", v)}>
                    <SelectTrigger className={cn(underlineInput, "h-9")}>
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {GRADES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className={eyebrowLabel}>Graduation Year</Label>
                  <Input
                    type="number"
                    value={form.graduation_year}
                    onChange={e => handleChange("graduation_year", e.target.value)}
                    placeholder="2026"
                    className={cn(underlineInput, "num-display")}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className={eyebrowLabel}>GPA</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="4"
                    value={form.gpa}
                    onChange={e => handleChange("gpa", e.target.value)}
                    placeholder="3.8"
                    className={cn(underlineInput, "num-display")}
                  />
                </div>
                <div className="space-y-2">
                  <Label className={eyebrowLabel}>SAT Score</Label>
                  <Input
                    type="number"
                    value={form.sat_score}
                    onChange={e => handleChange("sat_score", e.target.value)}
                    placeholder="1500"
                    className={cn(underlineInput, "num-display")}
                  />
                </div>
                <div className="space-y-2">
                  <Label className={eyebrowLabel}>ACT Score</Label>
                  <Input
                    type="number"
                    value={form.act_score}
                    onChange={e => handleChange("act_score", e.target.value)}
                    placeholder="34"
                    className={cn(underlineInput, "num-display")}
                  />
                </div>
              </div>
            </div>
          </HairlineCard>
        </motion.div>

        {/* Target Colleges */}
        <motion.div variants={sectionVariants}>
          <HairlineCard>
            <div className="flex items-center gap-3 mb-6">
              <Building2 className="h-5 w-5 text-foreground/60" />
              <div>
                <h2 className="font-serif text-xl text-foreground leading-tight">Where you're aiming.</h2>
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-1">Countries and colleges</p>
              </div>
            </div>
            <div className="space-y-3">
              {colleges.map((slot, index) => {
                const filtered = slot.search.trim()
                  ? universityOptions.filter(u => u.toLowerCase().includes(slot.search.toLowerCase()))
                  : universityOptions;

                return (
                  <div key={index} className="space-y-4 p-4 hairline rounded-lg bg-white/[0.02]">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                        University <span className="num-display">{index + 1}</span>
                      </span>
                      {colleges.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-[color:var(--pn-pink)] hover:bg-white/[0.03]"
                          onClick={() => removeCollege(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className={eyebrowLabel}>Country</Label>
                        <select
                          value={slot.country}
                          onChange={e => updateCollege(index, { country: e.target.value })}
                          className={cn(underlineInput, "w-full h-9 text-sm text-foreground")}
                        >
                          <option value="">Select country...</option>
                          {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label className={eyebrowLabel}>University</Label>
                        <Popover
                          open={slot.open}
                          onOpenChange={open => updateCollege(index, { open })}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              role="combobox"
                              className={cn(underlineInput, "w-full h-9 justify-between font-normal text-sm hover:bg-transparent")}
                            >
                              <span className={cn(!slot.university && "text-muted-foreground")}>
                                {slot.university || "Select university..."}
                              </span>
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-pn-card" align="start">
                            <div className="flex items-center hairline-b px-3">
                              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                              <input
                                className="flex h-11 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
                                placeholder="Search universities..."
                                value={slot.search}
                                onChange={e => updateCollege(index, { search: e.target.value })}
                              />
                            </div>
                            <div className="max-h-72 overflow-y-auto">
                              {filtered.length === 0 ? (
                                <p className="py-6 text-center text-sm font-serif italic text-muted-foreground">No university found.</p>
                              ) : (
                                filtered.map(u => (
                                  <button
                                    key={u}
                                    type="button"
                                    onClick={() => updateCollege(index, { university: u, universityOther: "", open: false, search: "" })}
                                    className="relative flex w-full cursor-pointer select-none items-center px-4 py-2.5 text-sm hover:bg-white/[0.04] text-foreground text-left"
                                  >
                                    <Check className={cn("mr-2 h-4 w-4 shrink-0", slot.university === u ? "opacity-100 text-[color:var(--pn-pink)]" : "opacity-0")} />
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
                      <div className="space-y-2">
                        <Label className={eyebrowLabel}>University Name</Label>
                        <Input
                          value={slot.universityOther}
                          onChange={e => updateCollege(index, { universityOther: e.target.value })}
                          placeholder="Enter university name"
                          className={underlineInput}
                        />
                      </div>
                    )}
                  </div>
                );
              })}

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addCollege}
                className="w-full border border-dashed border-white/[0.12] hover:bg-white/[0.03] hover:border-white/[0.2] text-muted-foreground hover:text-foreground rounded-lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add another university
              </Button>
            </div>
          </HairlineCard>
        </motion.div>

        {/* Parent / Guardian */}
        <motion.div variants={sectionVariants}>
          <HairlineCard>
            <div className="flex items-center gap-3 mb-6">
              <Phone className="h-5 w-5 text-foreground/60" />
              <div>
                <h2 className="font-serif text-xl text-foreground leading-tight">Parent or guardian.</h2>
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-1">Kept for your counselor's reference</p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className={eyebrowLabel}>Parent Name</Label>
                <Input
                  value={form.parent_name}
                  onChange={e => handleChange("parent_name", e.target.value)}
                  placeholder="Parent's full name"
                  className={underlineInput}
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className={eyebrowLabel}>Parent Phone</Label>
                  <Input
                    value={form.parent_phone}
                    onChange={e => handleChange("parent_phone", e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className={underlineInput}
                  />
                </div>
                <div className="space-y-2">
                  <Label className={eyebrowLabel}>Parent Email</Label>
                  <Input
                    value={form.parent_email}
                    disabled
                    className={cn(underlineInput, "text-muted-foreground cursor-not-allowed")}
                  />
                </div>
              </div>
              <div className="hairline rounded-lg bg-white/[0.02] px-3 py-2">
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 shrink-0" />
                  Parent email is managed by your counselor and cannot be changed here.
                </p>
              </div>
            </div>
          </HairlineCard>
        </motion.div>

        <motion.div variants={sectionVariants} className="flex justify-end pt-2">
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="min-w-[140px] bg-[color:var(--pn-pink)]/15 hairline text-[color:var(--pn-pink)] hover:bg-[color:var(--pn-pink)]/25 shadow-none disabled:opacity-40"
          >
            {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving…</> : "Save Changes"}
          </Button>
        </motion.div>
      </motion.div>
    </PageShell>
  );
};

export default StudentEditProfile;
