import { useState } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { useCelebration } from "@/hooks/useCelebration";
import { CelebrationOverlay } from "@/components/CelebrationOverlay";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  PageShell,
  PageHeader,
  HairlineCard,
  BlurOrb,
} from "@/components/primrose-night";
import { useStudentRecommendations } from "@/hooks/useRecommendationRequests";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  FileText,
  CheckCircle,
  Clock,
  Send,
  User,
  Award,
  Sparkles,
  ChevronRight,
  Loader2,
  AlertCircle,
  Mail,
} from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type RecommendationRequest = Database["public"]["Tables"]["recommendation_requests"]["Row"];

const STRENGTH_OPTIONS = [
  "Analytical thinking",
  "Creativity",
  "Leadership",
  "Teamwork",
  "Curiosity",
  "Discipline",
  "Empathy",
  "Initiative",
  "Problem-solving",
  "Communication",
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INITIAL_FORM = {
  refereeName: "",
  refereeEmail: "",
  refereeRole: "",
  relationshipDuration: "",
  relationshipCapacity: "",
  meaningfulProject: "",
  bestMoment: "",
  difficultiesOvercome: "",
  strengths: [] as string[],
  personalNotes: "",
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "sent":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs hairline bg-[color:var(--pn-sage)]/15 text-[color:var(--pn-sage)]">
          <CheckCircle className="h-3 w-3" />
          Received
        </span>
      );
    case "in_progress":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs hairline bg-[color:var(--pn-gold)]/15 text-[color:var(--pn-gold)]">
          <Clock className="h-3 w-3" />
          In Progress
        </span>
      );
    case "pending":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs hairline bg-[color:var(--pn-gold)]/10 text-[color:var(--pn-gold)]">
          <Clock className="h-3 w-3" />
          Pending Review
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs hairline bg-white/[0.03] text-muted-foreground">
          <FileText className="h-3 w-3" />
          Draft
        </span>
      );
  }
};

const StudentRecommendationLetters = () => {
  const { requests, isLoading, error, createRequest } = useStudentRecommendations();
  const { celebrate, activeEvent } = useCelebration();
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState<"list" | "form" | "view">(
    searchParams.get("step") === "form" ? "form" : "list"
  );
  const [selectedRequest, setSelectedRequest] = useState<RecommendationRequest | null>(null);
  const [formData, setFormData] = useState(INITIAL_FORM);

  const handleStrengthToggle = (strength: string) => {
    setFormData((prev) => ({
      ...prev,
      strengths: prev.strengths.includes(strength)
        ? prev.strengths.filter((s) => s !== strength)
        : [...prev.strengths, strength],
    }));
  };

  const handleSubmit = async () => {
    if (!formData.refereeName || !formData.refereeRole || !formData.relationshipDuration) {
      toast.error("Please fill in all required fields marked with *");
      return;
    }
    if (!formData.refereeEmail || !EMAIL_RE.test(formData.refereeEmail)) {
      toast.error("Please enter a valid teacher email address");
      return;
    }

    try {
      const result = await createRequest.mutateAsync({
        referee_name: formData.refereeName,
        referee_role: formData.refereeRole,
        relationship_duration: formData.relationshipDuration,
        relationship_capacity: formData.relationshipCapacity,
        meaningful_project: formData.meaningfulProject,
        best_moment: formData.bestMoment,
        difficulties_overcome: formData.difficultiesOvercome,
        strengths: formData.strengths,
        personal_notes: formData.personalNotes,
        status: "pending",
        student_id: "",
        teacher_email: formData.refereeEmail,
      } as any);

      // Notify the teacher via email with their private portal link
      const token = (result as any)?.teacher_token;
      if (token) {
        const { data: { user } } = await supabase.auth.getUser();
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("user_id", user!.id)
          .single();
        const studentName = profile?.full_name || user?.email || "A student";
        const teacherUrl = `${window.location.origin}/teacher-rec/${token}`;

        await supabase.functions.invoke("notify-teacher-request", {
          body: {
            teacherEmail: formData.refereeEmail,
            teacherName: formData.refereeName,
            studentName,
            teacherUrl,
          },
        });
      }

      setFormData(INITIAL_FORM);
      setCurrentStep("list");
    } catch (err) {
      // Error toast is already handled in the hook's onError
      console.error("Error submitting recommendation request:", err);
    }
  };

  // ── Loading state ─────────────────────────────────────────
  if (isLoading) {
    return (
      <PageShell>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageShell>
    );
  }

  // ── Error state ───────────────────────────────────────────
  if (error) {
    return (
      <PageShell>
        <div className="flex items-center justify-center h-96 gap-3 text-[color:var(--pn-pink)]">
          <AlertCircle className="h-6 w-6" />
          <p className="font-serif italic">Failed to load recommendation requests. Please refresh and try again.</p>
        </div>
      </PageShell>
    );
  }

  // ── View Letter ───────────────────────────────────────────
  if (currentStep === "view" && selectedRequest) {
    return (
      <PageShell maxWidth="wide">
        <BlurOrb tone="sage" className="top-[-100px] left-[-100px] w-[420px] h-[420px]" />

        <Button
          variant="ghost"
          className="mb-6 text-muted-foreground hover:text-foreground hover:bg-white/[0.03]"
          onClick={() => {
            setCurrentStep("list");
            setSelectedRequest(null);
          }}
        >
          ← Back to Letters
        </Button>

        <HairlineCard>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-serif text-3xl text-foreground leading-tight">A letter for you.</h1>
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-2">From {selectedRequest.referee_name}</p>
            </div>
            {getStatusBadge(selectedRequest.status)}
          </div>

          {selectedRequest.status === 'sent' ? (
            <div className="text-center py-12 space-y-4">
              <CheckCircle className="h-16 w-16 mx-auto text-[color:var(--pn-sage)]" />
              <h2 className="font-serif text-2xl text-foreground">Submitted on your behalf.</h2>
              <p className="font-serif italic text-muted-foreground max-w-sm mx-auto leading-relaxed">
                Your letter from <span className="text-foreground not-italic">{selectedRequest.referee_name}</span> has been
                finalized by your counselor and sent.
              </p>
            </div>
          ) : (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
              <p className="font-serif italic text-muted-foreground">Being drafted, quietly.</p>
              <p className="text-xs text-muted-foreground mt-2">You'll hear when it's ready.</p>
            </div>
          )}
        </HairlineCard>
      </PageShell>
    );
  }

  // ── Questionnaire Form ────────────────────────────────────
  if (currentStep === "form") {
    const sectionVariants = {
      hidden: { opacity: 0, y: 10, filter: 'blur(4px)' },
      visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.5, ease: [0.2, 0.6, 0.2, 1] } },
    };

    return (
      <PageShell maxWidth="wide">
        <BlurOrb tone="pink" className="top-[-100px] right-[-100px] w-[480px] h-[480px]" />

        <Button
          variant="ghost"
          className="mb-6 text-muted-foreground hover:text-foreground hover:bg-white/[0.03]"
          onClick={() => setCurrentStep("list")}
        >
          ← Back to Letters
        </Button>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
          className="space-y-6 max-w-3xl mx-auto"
        >
          <motion.div variants={sectionVariants}>
            <HairlineCard variant="pink" className="text-center p-8">
              <Sparkles className="h-12 w-12 mx-auto mb-4 text-[color:var(--pn-pink)]" />
              <h1 className="font-serif text-3xl text-foreground mb-3 leading-tight">
                One step. One letter.
              </h1>
              <p className="font-serif italic text-muted-foreground max-w-xl mx-auto">
                The more specific your answers, the more precise your counselor can be.
                A few paragraphs here become the strongest possible letter on your behalf.
              </p>
            </HairlineCard>
          </motion.div>

          {/* Section 1: Referee Context */}
          <motion.div variants={sectionVariants}>
            <HairlineCard>
              <div className="flex items-center gap-3 mb-6">
                <User className="h-5 w-5 text-foreground/60" />
                <div>
                  <h2 className="font-serif text-2xl text-foreground leading-tight">Who they are.</h2>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-2">The person writing for you</p>
                </div>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="refereeName" className="text-foreground">Who is this referee? *</Label>
                  <Input
                    id="refereeName"
                    placeholder="Full name, role, subject taught or position at school"
                    value={formData.refereeName}
                    onChange={(e) => setFormData({ ...formData, refereeName: e.target.value })}
                    className="bg-white/[0.02] hairline"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="refereeEmail" className="flex items-center gap-1.5 text-foreground">
                    <Mail className="h-4 w-4 text-[color:var(--pn-pink)]" />
                    Teacher's email address *
                  </Label>
                  <Input
                    id="refereeEmail"
                    type="email"
                    placeholder="e.g. j.smith@school.edu"
                    value={formData.refereeEmail}
                    onChange={(e) => setFormData({ ...formData, refereeEmail: e.target.value })}
                    className="bg-white/[0.02] hairline"
                  />
                  <p className="text-xs text-muted-foreground">
                    We'll send them a notification with a private link to write your letter.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="refereeRole" className="text-foreground">Their role/position *</Label>
                  <Input
                    id="refereeRole"
                    placeholder="e.g., AP Physics Teacher, Math Department Head"
                    value={formData.refereeRole}
                    onChange={(e) => setFormData({ ...formData, refereeRole: e.target.value })}
                    className="bg-white/[0.02] hairline"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="relationshipDuration" className="text-foreground">
                    How long have you known them and in what capacity? *
                  </Label>
                  <Textarea
                    id="relationshipDuration"
                    placeholder="e.g., taught me in Grade 11–12 Math, thesis supervisor, homeroom teacher"
                    value={formData.relationshipDuration}
                    onChange={(e) => setFormData({ ...formData, relationshipDuration: e.target.value })}
                    rows={3}
                    className="bg-white/[0.02] hairline"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="relationshipCapacity" className="text-foreground">How closely did you work together?</Label>
                  <Textarea
                    id="relationshipCapacity"
                    placeholder="Classes only, one-on-one mentoring, extracurricular supervision, research project, leadership role, etc."
                    value={formData.relationshipCapacity}
                    onChange={(e) =>
                      setFormData({ ...formData, relationshipCapacity: e.target.value })
                    }
                    rows={3}
                    className="bg-white/[0.02] hairline"
                  />
                </div>
              </div>
            </HairlineCard>
          </motion.div>

          {/* Section 2: Shared Work & Examples */}
          <motion.div variants={sectionVariants}>
            <HairlineCard>
              <div className="flex items-center gap-3 mb-6">
                <Award className="h-5 w-5 text-foreground/60" />
                <div>
                  <h2 className="font-serif text-2xl text-foreground leading-tight">What you did together.</h2>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-2">Concrete moments, specific details</p>
                </div>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="meaningfulProject" className="text-foreground">
                    What is the most meaningful academic or personal project you did together?
                  </Label>
                  <Textarea
                    id="meaningfulProject"
                    placeholder="Briefly describe what you worked on and why it mattered"
                    value={formData.meaningfulProject}
                    onChange={(e) => setFormData({ ...formData, meaningfulProject: e.target.value })}
                    rows={4}
                    className="bg-white/[0.02] hairline"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bestMoment" className="text-foreground">
                    Can you describe one moment where this referee saw you at your best?
                  </Label>
                  <Textarea
                    id="bestMoment"
                    placeholder="A class discussion, project, challenge, leadership moment, or clear improvement over time"
                    value={formData.bestMoment}
                    onChange={(e) => setFormData({ ...formData, bestMoment: e.target.value })}
                    rows={4}
                    className="bg-white/[0.02] hairline"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficultiesOvercome" className="text-foreground">
                    Did you overcome any difficulty while working with them?
                  </Label>
                  <Textarea
                    id="difficultiesOvercome"
                    placeholder="Academic struggle, personal challenge, resilience, or growth"
                    value={formData.difficultiesOvercome}
                    onChange={(e) =>
                      setFormData({ ...formData, difficultiesOvercome: e.target.value })
                    }
                    rows={4}
                    className="bg-white/[0.02] hairline"
                  />
                </div>
              </div>
            </HairlineCard>
          </motion.div>

          {/* Section 3: Strengths */}
          <motion.div variants={sectionVariants}>
            <HairlineCard>
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="h-5 w-5 text-foreground/60" />
                <div>
                  <h2 className="font-serif text-2xl text-foreground leading-tight">How they see you.</h2>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-2">Strengths through their eyes</p>
                </div>
              </div>
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-foreground">What do you think this referee would say you're especially strong at?</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {STRENGTH_OPTIONS.map((strength) => (
                      <div key={strength} className="flex items-center space-x-2 p-2 rounded-lg hairline bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                        <Checkbox
                          id={strength}
                          checked={formData.strengths.includes(strength)}
                          onCheckedChange={() => handleStrengthToggle(strength)}
                        />
                        <Label htmlFor={strength} className="text-sm font-normal cursor-pointer text-foreground">
                          {strength}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="personalNotes" className="text-foreground">
                    Would you like to add a few personal notes for your counselor? (Optional)
                  </Label>
                  <Textarea
                    id="personalNotes"
                    placeholder="Any additional context or information you'd like to share..."
                    value={formData.personalNotes}
                    onChange={(e) => setFormData({ ...formData, personalNotes: e.target.value })}
                    rows={4}
                    className="bg-white/[0.02] hairline"
                  />
                </div>
              </div>
            </HairlineCard>
          </motion.div>

          {/* Submit */}
          <motion.div variants={sectionVariants}>
            <HairlineCard variant="sage">
              <Button
                onClick={handleSubmit}
                size="lg"
                className="w-full bg-transparent hairline hover:bg-white/[0.04] text-foreground shadow-none"
                disabled={
                  createRequest.isPending ||
                  !formData.refereeName ||
                  !formData.refereeEmail ||
                  !EMAIL_RE.test(formData.refereeEmail) ||
                  !formData.refereeRole ||
                  !formData.relationshipDuration
                }
              >
                {createRequest.isPending ? (
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <Send className="h-5 w-5 mr-2" />
                )}
                Submit for Recommendation Letter
              </Button>
              <p className="text-center text-xs text-muted-foreground mt-3 font-serif italic">
                Your counselor will read this before writing the letter.
              </p>
            </HairlineCard>
          </motion.div>
        </motion.div>
      </PageShell>
    );
  }

  // ── Main List View ────────────────────────────────────────
  const listSectionVariants = {
    hidden: { opacity: 0, y: 10, filter: 'blur(4px)' },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.5, ease: [0.2, 0.6, 0.2, 1] } },
  };

  return (
    <PageShell maxWidth="wide">
      <BlurOrb tone="sage" className="top-[-100px] right-[-120px] w-[500px] h-[500px]" />
      <CelebrationOverlay event={activeEvent} />

      <PageHeader
        eyebrow="Recommendations"
        title={<>Letters, on your behalf.</>}
        subtitle={<>The teachers and mentors speaking for you.</>}
        actions={
          <Button
            onClick={() => setCurrentStep("form")}
            className="bg-transparent hairline hover:bg-white/[0.03] text-foreground shadow-none"
          >
            <FileText className="h-4 w-4 mr-2" />
            Request New Letter
          </Button>
        }
      />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
        className="space-y-6"
      >
        {/* Stats */}
        <motion.div variants={listSectionVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: FileText,
              tone: "sage" as const,
              label: "Total Requests",
              value: requests?.length ?? 0,
            },
            {
              icon: Clock,
              tone: "gold" as const,
              label: "Pending",
              value: requests?.filter((r) => r.status === "pending" || r.status === "in_progress").length ?? 0,
            },
            {
              icon: CheckCircle,
              tone: "sage" as const,
              label: "Received",
              value: requests?.filter((r) => r.status === "sent").length ?? 0,
            },
          ].map(({ icon: Icon, tone, label, value }) => {
            const toneVar = tone === "sage" ? "var(--pn-sage)" : "var(--pn-gold)";
            return (
              <HairlineCard key={label}>
                <div className="flex items-center gap-3">
                  <div
                    className="p-2 rounded-lg hairline"
                    style={{ backgroundColor: `color-mix(in oklab, ${toneVar} 12%, transparent)` }}
                  >
                    <Icon className="h-5 w-5" style={{ color: toneVar }} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
                    <p className="num-display text-2xl text-foreground mt-1">{value}</p>
                  </div>
                </div>
              </HairlineCard>
            );
          })}
        </motion.div>

        {/* Letters List */}
        <motion.div variants={listSectionVariants}>
          <HairlineCard>
            <div className="mb-6">
              <h2 className="font-serif text-2xl text-foreground leading-tight">The teachers speaking for you.</h2>
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-2">Each name, each letter</p>
            </div>
            {!requests || requests.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
                <p className="font-serif italic text-muted-foreground mb-6">No one lined up — yet.</p>
                <Button
                  className="bg-transparent hairline hover:bg-white/[0.04] text-foreground shadow-none"
                  onClick={() => setCurrentStep("form")}
                >
                  Request your first letter
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-4 rounded-lg hairline hover:bg-white/[0.03] transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedRequest(request);
                      setCurrentStep("view");
                      if (request.status === 'sent') celebrate('rec_letter_received');
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-white/[0.03] hairline rounded-lg">
                        <User className="h-5 w-5 text-foreground/60" />
                      </div>
                      <div>
                        <p className="text-foreground">{request.referee_name}</p>
                        <p className="text-sm text-muted-foreground">{request.referee_role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Submitted</p>
                        <p className="text-sm text-foreground mt-0.5">
                          {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {getStatusBadge(request.status)}
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </HairlineCard>
        </motion.div>
      </motion.div>
    </PageShell>
  );
};

export default StudentRecommendationLetters;