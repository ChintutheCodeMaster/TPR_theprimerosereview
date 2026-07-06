import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { backgroundStep } from "@/data/steps/background";
import { Loader2, User, GraduationCap, Phone, Building2, Plus, X, ChevronsUpDown, Search, Check, ArrowLeft } from "lucide-react";
import { PageShell, HairlineCard, BlurOrb } from "@/components/primrose-night";

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

const sectionVariants = {
  hidden: { opacity: 0, y: 10, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: [0.2, 0.6, 0.2, 1] as const },
  },
};

const underlineInput =
  "bg-transparent border-0 border-b border-white/[0.12] rounded-none px-0 h-9 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-b-[color:var(--pn-pink)] transition-colors";

const eyebrowLabel = "text-[10px] uppercase tracking-[0.22em] text-muted-foreground";
const nativeSelectUnderline =
  "w-full h-9 bg-transparent border-0 border-b border-white/[0.12] rounded-none px-0 text-sm text-foreground focus:outline-none focus:border-b-[color:var(--pn-pink)] transition-colors";

const CounselorEditStudent = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [studentEmail, setStudentEmail] = useState("");
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
    if (studentId) fetchStudentData();
  }, [studentId]);

  const fetchStudentData = async () => {
    setLoading(true);
    try {
      const [{ data: profile }, { data: studentProfile }, { data: targetColleges }] = await Promise.all([
        supabase.from("profiles").select("full_name, email").eq("user_id", studentId).maybeSingle(),
        supabase.from("student_profiles").select("phone, grade, graduation_year, gpa, sat_score, act_score, parent_name, parent_email, parent_phone").eq("user_id", studentId).maybeSingle(),
        (supabase as any).from("student_target_colleges").select("country, college").eq("student_id", studentId),
      ]);

      setStudentEmail(profile?.email ?? "");
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
      toast({ title: "Failed to load student", description: err.message, variant: "destructive" });
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
    if (!studentId) return;
    setSaving(true);
    try {
      const [profileResult, studentProfileResult] = await Promise.all([
        supabase.from("profiles").update({ full_name: form.full_name }).eq("user_id", studentId),
        supabase.from("student_profiles").upsert({
          user_id: studentId,
          phone: form.phone || null,
          grade: form.grade || null,
          graduation_year: form.graduation_year ? parseInt(form.graduation_year) : null,
          gpa: form.gpa ? parseFloat(form.gpa) : null,
          sat_score: form.sat_score ? parseInt(form.sat_score) : null,
          act_score: form.act_score ? parseInt(form.act_score) : null,
          parent_name: form.parent_name || null,
          parent_phone: form.parent_phone || null,
          parent_email: form.parent_email || null,
        }, { onConflict: "user_id" }),
      ]);

      if (profileResult.error) throw profileResult.error;
      if (studentProfileResult.error) throw studentProfileResult.error;

      const { error: deleteError } = await (supabase as any)
        .from("student_target_colleges")
        .delete()
        .eq("student_id", studentId);
      if (deleteError) throw deleteError;

      const validColleges = colleges
        .map(c => ({
          student_id: studentId,
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

      toast({ title: "Student updated", description: "Changes saved successfully." });
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
      <BlurOrb tone="pink" className="top-[-100px] right-[-100px] w-[500px] h-[500px]" />

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="hairline hover:bg-white/[0.03] text-muted-foreground hover:text-foreground shrink-0"
            onClick={() => navigate("/students")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Edit student</p>
            <h1 className="font-serif text-3xl text-foreground leading-tight">
              {form.full_name || "Student"}
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">{studentEmail}</p>
          </div>
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
          className="space-y-6"
        >
          {/* Personal Info */}
          <motion.div variants={sectionVariants}>
            <HairlineCard>
              <h3 className="font-serif text-xl text-foreground flex items-center gap-2 mb-5">
                <User className="h-4 w-4 text-[color:var(--pn-sage)]" />
                Who they are
              </h3>
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <Label className={eyebrowLabel}>Full name</Label>
                  <Input
                    value={form.full_name}
                    onChange={e => handleChange("full_name", e.target.value)}
                    placeholder="Student's full name"
                    className={underlineInput}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className={eyebrowLabel}>Email</Label>
                  <Input
                    value={studentEmail}
                    disabled
                    className={cn(underlineInput, "opacity-60 cursor-not-allowed")}
                  />
                </div>
                <div className="space-y-1.5">
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
              <h3 className="font-serif text-xl text-foreground flex items-center gap-2 mb-5">
                <GraduationCap className="h-4 w-4 text-[color:var(--pn-gold)]" />
                The academics
              </h3>
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className={eyebrowLabel}>Grade</Label>
                    <Select value={form.grade} onValueChange={v => handleChange("grade", v)}>
                      <SelectTrigger className={underlineInput}>
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent className="bg-pn-card hairline">
                        {GRADES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className={eyebrowLabel}>Graduation year</Label>
                    <Input
                      type="number"
                      value={form.graduation_year}
                      onChange={e => handleChange("graduation_year", e.target.value)}
                      placeholder="e.g. 2026"
                      className={`${underlineInput} num-display`}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className={eyebrowLabel}>GPA</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="4"
                      value={form.gpa}
                      onChange={e => handleChange("gpa", e.target.value)}
                      placeholder="3.8"
                      className={`${underlineInput} num-display`}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className={eyebrowLabel}>SAT</Label>
                    <Input
                      type="number"
                      value={form.sat_score}
                      onChange={e => handleChange("sat_score", e.target.value)}
                      placeholder="1500"
                      className={`${underlineInput} num-display`}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className={eyebrowLabel}>ACT</Label>
                    <Input
                      type="number"
                      value={form.act_score}
                      onChange={e => handleChange("act_score", e.target.value)}
                      placeholder="34"
                      className={`${underlineInput} num-display`}
                    />
                  </div>
                </div>
              </div>
            </HairlineCard>
          </motion.div>

          {/* Target Colleges */}
          <motion.div variants={sectionVariants}>
            <HairlineCard>
              <div className="flex items-start justify-between gap-4 mb-5">
                <h3 className="font-serif text-xl text-foreground flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-[color:var(--pn-pink)]" />
                  Where they're aiming
                </h3>
                <p className="text-xs text-muted-foreground text-right leading-relaxed font-serif italic max-w-[220px]">
                  Add or update — one card per school.
                </p>
              </div>
              <div className="space-y-3">
                {colleges.map((slot, index) => {
                  const filtered = slot.search.trim()
                    ? universityOptions.filter(u => u.toLowerCase().includes(slot.search.toLowerCase()))
                    : universityOptions;

                  return (
                    <div key={index} className="space-y-3 p-4 hairline rounded-lg bg-white/[0.02]">
                      <div className="flex items-center justify-between">
                        <span className="font-serif text-lg text-foreground">
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

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <Label className={eyebrowLabel}>Country</Label>
                          <select
                            value={slot.country}
                            onChange={e => updateCollege(index, { country: e.target.value })}
                            className={nativeSelectUnderline}
                          >
                            <option value="">Select country…</option>
                            {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>

                        <div>
                          <Label className={eyebrowLabel}>University</Label>
                          <Popover
                            open={slot.open}
                            onOpenChange={open => updateCollege(index, { open })}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  underlineInput,
                                  "w-full justify-between font-normal hover:bg-transparent shadow-none",
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
                                  onChange={e => updateCollege(index, { search: e.target.value })}
                                />
                              </div>
                              <div className="max-h-72 overflow-y-auto">
                                {filtered.length === 0 ? (
                                  <p className="py-6 text-center text-sm font-serif italic text-muted-foreground">
                                    Nothing by that name — yet.
                                  </p>
                                ) : (
                                  filtered.map(u => (
                                    <button
                                      key={u}
                                      type="button"
                                      onClick={() => updateCollege(index, { university: u, universityOther: "", open: false, search: "" })}
                                      className="relative flex w-full cursor-pointer select-none items-center px-4 py-2.5 text-sm hover:bg-white/[0.04] text-left text-foreground"
                                    >
                                      <Check className={cn("mr-2 h-4 w-4 shrink-0 text-[color:var(--pn-sage)]", slot.university === u ? "opacity-100" : "opacity-0")} />
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
                  variant="outline"
                  size="sm"
                  onClick={addCollege}
                  className="w-full border-dashed border-white/[0.15] bg-transparent hover:bg-white/[0.03] text-muted-foreground hover:text-foreground shadow-none"
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
              <h3 className="font-serif text-xl text-foreground flex items-center gap-2 mb-5">
                <Phone className="h-4 w-4 text-[color:var(--pn-sage)]" />
                Parent or guardian
              </h3>
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <Label className={eyebrowLabel}>Parent name</Label>
                  <Input
                    value={form.parent_name}
                    onChange={e => handleChange("parent_name", e.target.value)}
                    placeholder="Parent's full name"
                    className={underlineInput}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className={eyebrowLabel}>Phone</Label>
                    <Input
                      value={form.parent_phone}
                      onChange={e => handleChange("parent_phone", e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className={underlineInput}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className={eyebrowLabel}>Email</Label>
                    <Input
                      value={form.parent_email}
                      onChange={e => handleChange("parent_email", e.target.value)}
                      placeholder="parent@email.com"
                      className={underlineInput}
                    />
                  </div>
                </div>
              </div>
            </HairlineCard>
          </motion.div>

          <motion.div variants={sectionVariants} className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="min-w-[140px] bg-transparent hairline hover:bg-white/[0.03] text-[color:var(--pn-pink)] shadow-none"
            >
              {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving…</> : "Save changes"}
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </PageShell>
  );
};

export default CounselorEditStudent;
