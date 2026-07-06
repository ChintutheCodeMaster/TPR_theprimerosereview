import { useState } from "react";
import { motion } from "framer-motion";
import { usePreviewMode } from "@/contexts/PreviewModeContext";
import { toast } from "sonner";
import { useCelebration } from "@/hooks/useCelebration";
import { CelebrationOverlay } from "@/components/CelebrationOverlay";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useApplications } from "@/hooks/useApplications";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  PageShell,
  PageHeader,
  HairlineCard,
  BlurOrb,
} from "@/components/primrose-night";
import {
  ArrowLeft,
  GraduationCap,
  Calendar,
  FileText,
  BookOpen,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Plus,
  School,
  ClipboardList,
  Globe,
  ChevronsUpDown,
  Check,
} from "lucide-react";
import { backgroundStep } from "@/data/steps/background";

const APPLICATION_PLATFORMS = [
  { value: "common-app",   label: "Common App",              description: "Used by 900+ colleges (default)" },
  { value: "coalition",    label: "Coalition Application",   description: "Partnered with 150+ colleges" },
  { value: "uc-app",       label: "UC Application",          description: "California UC system" },
  { value: "apply-texas",  label: "ApplyTexas",              description: "Texas public universities" },
  { value: "direct",       label: "Direct Application",      description: "School-specific portal" },
  { value: "ucas",         label: "UCAS",                    description: "UK university applications" },
  { value: "other",        label: "Other",                   description: "Another platform" },
];

const APPLICATION_TYPES = [
  { value: "early-decision",          label: "Early Decision (ED)",           description: "Binding — first choice school" },
  { value: "early-action",            label: "Early Action (EA)",             description: "Non-binding early application" },
  { value: "restrictive-early-action",label: "Restrictive Early Action (REA)",description: "Early, limits other early apps" },
  { value: "regular-decision",        label: "Regular Decision (RD)",         description: "Standard application round" },
  { value: "rolling",                 label: "Rolling Admission",             description: "Applications reviewed as received" },
];

const STATUS_OPTIONS = [
  { value: "not-started", label: "Not Started" },
  { value: "in-progress", label: "In Progress" },
  { value: "submitted",   label: "Submitted"   },
  { value: "accepted",    label: "Accepted"    },
  { value: "rejected",    label: "Rejected"    },
  { value: "waitlisted",  label: "Waitlisted"  },
];

const COLLEGE_LIST: string[] = (
  backgroundStep.questions[0].subQuestions[0].options as string[]
);

const sectionVariants = {
  hidden: { opacity: 0, y: 8, filter: "blur(4px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.4, ease: [0.2, 0.6, 0.2, 1] as const } },
};

const AddApplication = () => {
  const isPreviewMode = usePreviewMode();
  const navigate = useNavigate();
  const { createApplication } = useApplications();
  const { celebrate, activeEvent } = useCelebration();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [schoolOpen, setSchoolOpen] = useState(false);

  const [form, setForm] = useState({
    school_name: "",
    program: "",
    application_platform: "common-app",
    application_type: "",
    deadline_date: "",
    status: "not-started",
    required_essays: 1,
    completed_essays: 0,
    recommendations_requested: 0,
    recommendations_submitted: 0,
    urgent: false,
    notes: "",
  });

  const updateForm = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const isUrgent = () => {
    if (!form.deadline_date) return false;
    const daysUntil = Math.ceil(
      (new Date(form.deadline_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return daysUntil <= 7 && daysUntil >= 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isPreviewMode) {
      toast.info("Preview mode — adding applications is disabled");
      return;
    }

    if (!form.school_name || !form.application_type || !form.deadline_date) return;

    setIsSubmitting(true);
    try {
      await createApplication.mutateAsync({
        student_id: "",
        school_name: form.school_name,
        program: form.program || null,
        application_platform: form.application_platform || null,
        application_type: form.application_type,
        deadline_date: form.deadline_date,
        status: form.status,
        required_essays: form.required_essays,
        completed_essays: form.completed_essays,
        recommendations_requested: form.recommendations_requested,
        recommendations_submitted: form.recommendations_submitted,
        completion_percentage: 0,
        urgent: isUrgent(),
        ai_score_avg: null,
        notes: form.notes || null,
      } as any);
      setSubmitted(true);
      celebrate('new_application');
    } catch (error) {
      // Error handled by hook
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Success state ──────────────────────────────────────────
  if (submitted) {
    return (
      <PageShell>
        <BlurOrb tone="sage" className="top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px]" />
        <CelebrationOverlay event={activeEvent} />
        <div className="flex items-center justify-center min-h-[70vh]">
          <HairlineCard variant="sage" className="max-w-md w-full text-center p-10 space-y-6">
            <div className="w-20 h-20 rounded-full hairline bg-[color:var(--pn-sage)]/12 flex items-center justify-center mx-auto">
              <CheckCircle className="h-10 w-10 text-[color:var(--pn-sage)]" />
            </div>
            <div>
              <h1 className="font-serif text-3xl text-foreground leading-tight">Added to your list.</h1>
              <p className="font-serif italic text-muted-foreground mt-3">
                <span className="text-foreground not-italic">{form.school_name}</span> — your counselor can see it now.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setForm({
                    school_name: "",
                    program: "",
                    application_platform: "common-app",
                    application_type: "",
                    deadline_date: "",
                    status: "not-started",
                    required_essays: 1,
                    completed_essays: 0,
                    recommendations_requested: 0,
                    recommendations_submitted: 0,
                    urgent: false,
                    notes: "",
                  });
                }}
                className="bg-[color:var(--pn-gold)]/15 hairline text-[color:var(--pn-gold)] hover:bg-[color:var(--pn-gold)]/25 shadow-none"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Another Application
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate("/student-personal-area")}
                className="hairline hover:bg-white/[0.04] text-muted-foreground"
              >
                Back to My Area
              </Button>
            </div>
          </HairlineCard>
        </div>
      </PageShell>
    );
  }

  const urgent = isUrgent();

  return (
    <PageShell>
      <BlurOrb tone="gold" className="top-[-100px] right-[-100px] w-[480px] h-[480px]" />

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => navigate("/student-personal-area")}
        className="mb-6 gap-2 text-muted-foreground hover:text-foreground hover:bg-white/[0.03]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <PageHeader
        eyebrow="New application"
        title={<>Add a school to your list.</>}
        subtitle={<>Deadline, platform, essays — the shape of it.</>}
      />

      <motion.form
        onSubmit={handleSubmit}
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
        className="space-y-6 max-w-3xl mx-auto"
      >

        {/* Section 1 — School Info */}
        <motion.div variants={sectionVariants}>
          <HairlineCard>
            <div className="flex items-center gap-3 mb-6">
              <School className="h-5 w-5 text-foreground/60" />
              <div>
                <h2 className="font-serif text-xl text-foreground leading-tight">The school.</h2>
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-1">Name, program, platform, round</p>
              </div>
            </div>
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm text-foreground">
                    School Name <span className="text-[color:var(--pn-pink)]">*</span>
                  </Label>
                  <Popover open={schoolOpen} onOpenChange={setSchoolOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        role="combobox"
                        aria-expanded={schoolOpen}
                        className="w-full justify-between font-normal hairline bg-white/[0.02] hover:bg-white/[0.04] text-foreground"
                      >
                        <span className={form.school_name ? "text-foreground" : "text-muted-foreground"}>
                          {form.school_name || "Search for a school..."}
                        </span>
                        <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0 bg-pn-card" align="start">
                      <Command className="bg-transparent">
                        <CommandInput placeholder="Type to search..." />
                        <CommandList>
                          <CommandEmpty>
                            <span className="font-serif italic text-muted-foreground">No school found. Type to add a custom name.</span>
                          </CommandEmpty>
                          <CommandGroup>
                            {COLLEGE_LIST.map((college) => (
                              <CommandItem
                                key={college}
                                value={college}
                                onSelect={(val) => {
                                  updateForm("school_name", val === form.school_name ? "" : val);
                                  setSchoolOpen(false);
                                }}
                              >
                                <Check
                                  className={`mr-2 h-4 w-4 ${form.school_name === college ? "opacity-100 text-[color:var(--pn-gold)]" : "opacity-0"}`}
                                />
                                {college}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="program" className="text-sm text-foreground">
                    Program / Major <span className="text-muted-foreground text-xs">(optional)</span>
                  </Label>
                  <Input
                    id="program"
                    placeholder="Computer Science, Biology..."
                    value={form.program}
                    onChange={(e) => updateForm("program", e.target.value)}
                    className="bg-white/[0.02] hairline"
                  />
                </div>
              </div>

              {/* Application Platform */}
              <div className="space-y-3">
                <Label className="text-sm text-foreground flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                  Application Platform <span className="text-[color:var(--pn-pink)]">*</span>
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {APPLICATION_PLATFORMS.map((platform) => (
                    <button
                      key={platform.value}
                      type="button"
                      onClick={() => updateForm("application_platform", platform.value)}
                      className={`text-left p-3 rounded-lg transition-all hairline ${
                        form.application_platform === platform.value
                          ? "bg-white/[0.08] text-foreground"
                          : "bg-white/[0.02] hover:bg-white/[0.04]"
                      }`}
                    >
                      <p className={`text-sm ${form.application_platform === platform.value ? "text-foreground" : "text-foreground/85"}`}>{platform.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{platform.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Application Type */}
              <div className="space-y-3">
                <Label className="text-sm text-foreground">
                  Application Type <span className="text-[color:var(--pn-pink)]">*</span>
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {APPLICATION_TYPES.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => updateForm("application_type", type.value)}
                      className={`text-left p-3 rounded-lg transition-all hairline ${
                        form.application_type === type.value
                          ? "bg-white/[0.08] text-foreground"
                          : "bg-white/[0.02] hover:bg-white/[0.04]"
                      }`}
                    >
                      <p className={`text-sm ${form.application_type === type.value ? "text-foreground" : "text-foreground/85"}`}>{type.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{type.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </HairlineCard>
        </motion.div>

        {/* Section 2 — Deadline & Status */}
        <motion.div variants={sectionVariants}>
          <HairlineCard>
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="h-5 w-5 text-foreground/60" />
              <div>
                <h2 className="font-serif text-xl text-foreground leading-tight">When it's due.</h2>
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-1">Deadline and current stage</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deadline_date" className="text-sm text-foreground">
                  Application Deadline <span className="text-[color:var(--pn-pink)]">*</span>
                </Label>
                <Input
                  id="deadline_date"
                  type="date"
                  value={form.deadline_date}
                  onChange={(e) => updateForm("deadline_date", e.target.value)}
                  required
                  className="bg-white/[0.02] hairline"
                />
                {urgent && (
                  <div className="flex items-center gap-1.5 text-xs text-[color:var(--pn-gold)] hairline bg-[color:var(--pn-gold)]/10 rounded-lg px-2.5 py-1.5 mt-1">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Deadline within 7 days — marked as urgent
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-foreground">Current Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => updateForm("status", v)}
                >
                  <SelectTrigger className="bg-white/[0.02] hairline">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </HairlineCard>
        </motion.div>

        {/* Section 3 — Essays */}
        <motion.div variants={sectionVariants}>
          <HairlineCard>
            <div className="flex items-center gap-3 mb-6">
              <FileText className="h-5 w-5 text-foreground/60" />
              <div>
                <h2 className="font-serif text-xl text-foreground leading-tight">The essays.</h2>
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-1">Required and completed</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="required_essays" className="text-sm text-foreground">Essays Required</Label>
                <Input
                  id="required_essays"
                  type="number"
                  min={0}
                  max={20}
                  value={form.required_essays}
                  onChange={(e) =>
                    updateForm("required_essays", parseInt(e.target.value) || 0)
                  }
                  className="bg-white/[0.02] hairline num-display"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="completed_essays" className="text-sm text-foreground">Essays Completed</Label>
                <Input
                  id="completed_essays"
                  type="number"
                  min={0}
                  max={form.required_essays}
                  value={form.completed_essays}
                  onChange={(e) =>
                    updateForm(
                      "completed_essays",
                      Math.min(parseInt(e.target.value) || 0, form.required_essays)
                    )
                  }
                  className="bg-white/[0.02] hairline num-display"
                />
              </div>
            </div>
            {form.required_essays > 0 && (
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-3">
                <span className="num-display">{form.completed_essays}</span> of <span className="num-display">{form.required_essays}</span> essays completed
              </p>
            )}
          </HairlineCard>
        </motion.div>

        {/* Section 4 — Recommendations */}
        <motion.div variants={sectionVariants}>
          <HairlineCard>
            <div className="flex items-center gap-3 mb-6">
              <BookOpen className="h-5 w-5 text-foreground/60" />
              <div>
                <h2 className="font-serif text-xl text-foreground leading-tight">The recommendations.</h2>
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-1">Requested and received</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="recommendations_requested" className="text-sm text-foreground">Required</Label>
                <Input
                  id="recommendations_requested"
                  type="number"
                  min={0}
                  max={10}
                  value={form.recommendations_requested}
                  onChange={(e) =>
                    updateForm("recommendations_requested", parseInt(e.target.value) || 0)
                  }
                  className="bg-white/[0.02] hairline num-display"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recommendations_submitted" className="text-sm text-foreground">Submitted</Label>
                <Input
                  id="recommendations_submitted"
                  type="number"
                  min={0}
                  max={form.recommendations_requested}
                  value={form.recommendations_submitted}
                  onChange={(e) =>
                    updateForm(
                      "recommendations_submitted",
                      Math.min(
                        parseInt(e.target.value) || 0,
                        form.recommendations_requested
                      )
                    )
                  }
                  className="bg-white/[0.02] hairline num-display"
                />
              </div>
            </div>
          </HairlineCard>
        </motion.div>

        {/* Section 5 — Notes */}
        <motion.div variants={sectionVariants}>
          <HairlineCard>
            <div className="flex items-center gap-3 mb-6">
              <ClipboardList className="h-5 w-5 text-foreground/60" />
              <div>
                <h2 className="font-serif text-xl text-foreground leading-tight">Anything else.</h2>
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-1">Notes for you or your counselor</p>
              </div>
            </div>
            <Textarea
              placeholder="Any additional notes — scholarship info, special requirements, timing considerations..."
              value={form.notes}
              onChange={(e) => updateForm("notes", e.target.value)}
              rows={3}
              className="resize-none bg-white/[0.02] hairline font-serif text-base leading-relaxed"
            />
          </HairlineCard>
        </motion.div>

        {/* Submit */}
        <motion.div variants={sectionVariants} className="flex gap-3 pb-4">
          <Button
            type="button"
            variant="ghost"
            className="flex-1 hairline hover:bg-white/[0.03] text-muted-foreground"
            onClick={() => navigate("/student-personal-area")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-[color:var(--pn-gold)]/15 hairline text-[color:var(--pn-gold)] hover:bg-[color:var(--pn-gold)]/25 shadow-none disabled:opacity-40"
            disabled={
              isSubmitting ||
              !form.school_name ||
              !form.application_type ||
              !form.deadline_date
            }
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <GraduationCap className="h-4 w-4 mr-2" />
                Add Application
              </>
            )}
          </Button>
        </motion.div>
      </motion.form>
    </PageShell>
  );
};

export default AddApplication;
