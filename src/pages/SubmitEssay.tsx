import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useCelebration } from "@/hooks/useCelebration";
import { CelebrationOverlay } from "@/components/CelebrationOverlay";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  PageShell,
  PageHeader,
  HairlineCard,
  BlurOrb,
} from "@/components/primrose-night";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCompanionPageContext } from "@/hooks/useCompanionPageContext";

import {
  ArrowLeft,
  FileText,
  BookOpen,
  School,
  AlignLeft,
  Hash,
  Loader2,
  CheckCircle,
  Sparkles,
  ScanText,
  MessageSquare,
  X,
} from "lucide-react";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const WORD_LIMIT_OPTIONS = [250, 500, 650, 750, 1000];

interface CriterionScore {
  id: string;
  name: string;
  score: number;
  color: string;
}

interface AnalysisIssue {
  id: string;
  criterionName: string;
  color: string;
  highlightedText: string;
  problemType: string;
  problemDescription: string;
  recommendation: string;
  severity: "low" | "medium" | "high";
}

interface AnalysisResult {
  overallScore: number;
  criteria: CriterionScore[];
  issues: AnalysisIssue[];
}

const SubmitEssay = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { celebrate, activeEvent } = useCelebration();

  const slotId        = searchParams.get("slotId");
  const applicationId = searchParams.get("applicationId");
  const slotLabel     = searchParams.get("label");
  const slotPrompt    = searchParams.get("prompt");
  const slotWordLimit = searchParams.get("wordLimit");
  const urlDraftId    = searchParams.get("draftId");
  const urlSchoolName = searchParams.get("schoolName");
  const isReadonly    = searchParams.get("readonly") === "true";

  useCompanionPageContext({
    ...(applicationId ? { applicationId } : {}),
    ...(slotId ? { slotId } : {}),
    ...(urlDraftId ? { draftId: urlDraftId } : {}),
    ...(urlSchoolName ? { schoolName: urlSchoolName } : {}),
  });

  const [isSubmitting, setIsSubmitting]   = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isSuccess, setIsSuccess]         = useState(false);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(urlDraftId);

  // Form fields
  const [title, setTitle]               = useState(slotLabel ?? "");
  const [prompt, setPrompt]             = useState(slotPrompt ?? "");
  const [content, setContent]           = useState("");
  const [targetSchool, setTargetSchool] = useState(urlSchoolName ?? "");
  const [wordLimit, setWordLimit]       = useState<number | null>(
    slotWordLimit ? parseInt(slotWordLimit) : null
  );
  const [customWordLimit, setCustomWordLimit] = useState("");

  // Word count
  const wordCount          = content.trim() === "" ? 0 : content.trim().split(/\s+/).length;
  const effectiveWordLimit = wordLimit ?? (customWordLimit ? parseInt(customWordLimit) : null);
  const isOverLimit        = effectiveWordLimit ? wordCount > effectiveWordLimit : false;

  // Selection-based coaching
  const [selectedText, setSelectedText]         = useState("");
  const [selectionFeedback, setSelectionFeedback] = useState<string | null>(null);
  const [isCoaching, setIsCoaching]             = useState(false);

  // Full essay analysis
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalysing, setIsAnalysing]       = useState(false);

  useEffect(() => {
    
    if (!urlDraftId) return;
    const loadDraft = async () => {
      const { data, error } = await (supabase
        .from("essay_feedback")
        .select("essay_title, essay_prompt, essay_content, target_school, word_limit, status")
        .eq("id", urlDraftId)
        .single() as any);
      if (error || !data) return;
      if (!isReadonly && data.status !== "draft") return;
      setTitle(data.essay_title ?? "");
      setPrompt(data.essay_prompt ?? "");
      setContent(data.essay_content ?? "");
      setTargetSchool(data.target_school ?? "");
      const wl = data.word_limit as number | null;
      if (wl && WORD_LIMIT_OPTIONS.includes(wl)) {
        setWordLimit(wl);
      } else if (wl) {
        setWordLimit(null);
        setCustomWordLimit(String(wl));
      }
    };
    loadDraft();
  }, [urlDraftId]);

  // ── Save draft ────────────────────────────────────────────
  const handleSaveDraft = async () => {
    if (!title.trim()) { toast.error("Please add a title before saving"); return; }

    setIsSavingDraft(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const payload = {
        student_id:    user.id,
        counselor_id:  null,
        essay_title:   title.trim(),
        essay_prompt:  prompt.trim() || null,
        essay_content: content.trim(),
        target_school: targetSchool.trim() || null,
        word_limit:    effectiveWordLimit || null,
        status:        "draft",
      };

      if (currentDraftId) {
        const { error } = await (supabase
          .from("essay_feedback")
          .update(payload as any)
          .eq("id", currentDraftId) as any);
        if (error) throw error;
      } else {
        const newId = crypto.randomUUID();
        const { error } = await (supabase
          .from("essay_feedback")
          .insert({ id: newId, ...payload } as any) as any);
        if (error) throw error;
        setCurrentDraftId(newId);

        if (slotId) {
          await supabase
            .from("application_essays")
            .update({ essay_feedback_id: newId, status: "draft", updated_at: new Date().toISOString() })
            .eq("id", slotId);
        }
      }

      toast.success("Draft saved! Continue anytime from My Work → Essays.");
      navigate(applicationId ? `/student-personal-area?tab=applications` : `/student-personal-area?tab=essays`);
    } catch (err: any) {
      toast.error(err.message || "Failed to save draft");
    } finally {
      setIsSavingDraft(false);
    }
  };

  // ── Text selection handler ────────────────────────────────
  const handleSelectionChange = () => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end   = el.selectionEnd;
    const text  = el.value.substring(start, end).trim();
    if (text.length > 20) {
      setSelectedText(text);
      setSelectionFeedback(null);
    } else {
      setSelectedText("");
    }
  };

  const handleGetCoaching = async () => {
    if (!selectedText) return;
    setIsCoaching(true);
    setSelectionFeedback(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${SUPABASE_URL}/functions/v1/coach-essay-section`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ selectedText, essayPrompt: prompt }),
      });
      if (res.ok) {
        const data = await res.json();
        setSelectionFeedback(data.feedback ?? null);
      }
    } catch {
      toast.error("Couldn't fetch coaching right now. Try again.");
    } finally {
      setIsCoaching(false);
    }
  };

  // ── Full essay analysis ───────────────────────────────────
  const handleAnalyseEssay = async () => {
    if (!content.trim()) return;
    setIsAnalysing(true);
    setAnalysisResult(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${SUPABASE_URL}/functions/v1/analyze-essay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ essayContent: content, prompt }),
      });
      if (res.ok) {
        const data = await res.json();
        setAnalysisResult(data);
      } else {
        toast.error("Analysis failed. Please try again.");
      }
    } catch {
      toast.error("Couldn't analyse the essay right now.");
    } finally {
      setIsAnalysing(false);
    }
  };

  // ── Finalize ──────────────────────────────────────────────
  // Saves the essay as final. AI analysis is the feedback path — there is
  // no reviewer to send to on the student-only platform.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim())   { toast.error("Please add an essay title");         return; }
    if (!content.trim()) { toast.error("Please add your essay content");     return; }
    if (isOverLimit)     { toast.error("Your essay exceeds the word limit"); return; }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const essayTitle = targetSchool.trim()
        ? `${title.trim()} — ${targetSchool.trim()}`
        : title.trim();

      let essayId: string | null = currentDraftId;

      if (currentDraftId) {
        const { error } = await (supabase
          .from("essay_feedback")
          .update({
            essay_title:   essayTitle,
            essay_prompt:  prompt.trim() || null,
            essay_content: content.trim(),
            target_school: targetSchool.trim() || null,
            status:        "finalized",
          } as any)
          .eq("id", currentDraftId) as any);
        if (error) throw error;
      } else {
        const { data: essayData, error: essayError } = await supabase
          .from("essay_feedback")
          .insert({
            student_id:    user.id,
            counselor_id:  null,
            essay_title:   essayTitle,
            essay_prompt:  prompt.trim() || null,
            essay_content: content.trim(),
            status:        "finalized",
          })
          .select()
          .single();
        if (essayError) throw essayError;
        essayId = essayData?.id ?? null;
      }

      if (slotId && essayId) {
        const { error: slotError } = await supabase
          .from("application_essays")
          .update({
            essay_feedback_id: essayId,
            status:            "finalized",
            updated_at:        new Date().toISOString(),
          })
          .eq("id", slotId);

        if (slotError) console.error("Failed to link essay to slot:", slotError);
      }

      setIsSuccess(true);
      toast.success("Essay saved.");
      celebrate('essay_submitted');
    } catch (error: any) {
      toast.error(error.message || "Failed to save essay");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Success ───────────────────────────────────────────────
  if (isSuccess) {
    return (
      <PageShell>
        <BlurOrb tone="sage" className="top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px]" />
        <CelebrationOverlay event={activeEvent} />
        <div className="flex items-center justify-center min-h-[70vh]">
          <HairlineCard variant="sage" className="max-w-md w-full text-center p-10 space-y-6">
            <div className="flex justify-center">
              <div className="h-20 w-20 rounded-full hairline bg-[color:var(--pn-sage)]/12 flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-[color:var(--pn-sage)]" />
              </div>
            </div>
            <div>
              <h2 className="font-serif text-3xl text-foreground leading-tight">Saved.</h2>
              <p className="font-serif italic text-muted-foreground mt-3">
                {slotId
                  ? "Linked to your application."
                  : "Kept in My Work — come back to it any time."}
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Button
                onClick={() =>
                  applicationId ? navigate(`/student-personal-area?tab=applications`) : navigate(-1)
                }
                className="w-full bg-transparent hairline hover:bg-white/[0.04] text-foreground shadow-none"
              >
                {applicationId ? "Back to Applications" : "Back to My Work"}
              </Button>
              {!slotId && (
                <Button
                  variant="ghost"
                  className="w-full text-muted-foreground hover:text-foreground hover:bg-white/[0.03]"
                  onClick={() => {
                    setIsSuccess(false);
                    setTitle("");
                    setPrompt("");
                    setContent("");
                    setTargetSchool("");
                    setWordLimit(null);
                    setCustomWordLimit("");
                    setAnalysisResult(null);
                    setSelectedText("");
                    setSelectionFeedback(null);
                  }}
                >
                  Write another
                </Button>
              )}
            </div>
          </HairlineCard>
        </div>
      </PageShell>
    );
  }

  const showAnalysisPanel = analysisResult !== null || isAnalysing;

  const sectionVariants = {
    hidden: { opacity: 0, y: 8, filter: 'blur(4px)' },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.4, ease: [0.2, 0.6, 0.2, 1] } },
  };

  const severityPill = (severity: "low" | "medium" | "high") => {
    if (severity === "high") return "bg-[color:var(--pn-pink)]/15 text-[color:var(--pn-pink)] hairline";
    if (severity === "medium") return "bg-[color:var(--pn-gold)]/15 text-[color:var(--pn-gold)] hairline";
    return "bg-white/[0.03] text-muted-foreground hairline";
  };

  // ── Form ──────────────────────────────────────────────────
  return (
    <PageShell maxWidth={showAnalysisPanel ? "wide" : "container"}>
      <BlurOrb tone="pink" className="top-[-100px] right-[-100px] w-[480px] h-[480px]" />

      <Button
        variant="ghost"
        className="mb-6 gap-2 text-muted-foreground hover:text-foreground hover:bg-white/[0.03]"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <PageHeader
        eyebrow={isReadonly ? "Final draft" : "The essay"}
        title={
          isReadonly
            ? <>The final version.</>
            : slotId
              ? <>Writing for {slotLabel}.</>
              : <>Draft, analyze, save.</>
        }
        subtitle={
          isReadonly
            ? <>Finalized — {slotLabel ?? "essay"}</>
            : slotId
              ? undefined
              : <>Use the AI analysis for feedback, then save when it's ready.</>
        }
      />

      {isReadonly && (
        <div className="mb-6 flex items-center gap-2 px-3 py-2 hairline bg-[color:var(--pn-sage)]/10 rounded-lg w-fit">
          <CheckCircle className="h-4 w-4 text-[color:var(--pn-sage)] shrink-0" />
          <span className="text-sm text-[color:var(--pn-sage)]">
            Finalized. No further edits.
          </span>
        </div>
      )}
      {!isReadonly && slotId && (
        <div className="mb-6 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs hairline bg-white/[0.03] text-muted-foreground">
          Linked to application slot
        </div>
      )}

      <div className={`gap-6 ${showAnalysisPanel ? "grid grid-cols-[1fr_380px]" : ""}`}>

        {/* ── Left column: form ── */}
        <motion.form
          onSubmit={handleSubmit}
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
          className="space-y-6"
        >

          {/* Essay Info */}
          <motion.div variants={sectionVariants}>
            <HairlineCard>
              <div className="flex items-center gap-3 mb-6">
                <FileText className="h-5 w-5 text-foreground/60" />
                <div>
                  <h2 className="font-serif text-xl text-foreground leading-tight">The frame.</h2>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-1">Title, target, context</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-foreground">
                    Essay Title <span className="text-[color:var(--pn-pink)]">*</span>
                  </Label>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Common App Personal Statement"
                      className="pl-10 bg-white/[0.02] hairline"
                      required
                      disabled={isReadonly}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetSchool" className="text-foreground">Target School</Label>
                  {slotId && urlSchoolName ? (
                    <div className="flex items-center gap-2 h-10 px-3 rounded-md hairline bg-white/[0.02] text-sm">
                      <School className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-foreground">{urlSchoolName}</span>
                    </div>
                  ) : (
                    <div className="relative">
                      <School className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="targetSchool"
                        value={targetSchool}
                        onChange={(e) => setTargetSchool(e.target.value)}
                        placeholder="e.g. MIT, Harvard, Stanford..."
                        className="pl-10 bg-white/[0.02] hairline"
                      />
                    </div>
                  )}
                </div>
              </div>
            </HairlineCard>
          </motion.div>

          {/* Word Limit */}
          {!isReadonly && (
            <motion.div variants={sectionVariants}>
              <HairlineCard>
                <div className="flex items-center gap-3 mb-6">
                  <Hash className="h-5 w-5 text-foreground/60" />
                  <div>
                    <h2 className="font-serif text-xl text-foreground leading-tight">How long.</h2>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-1">Pick a target or set your own</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {WORD_LIMIT_OPTIONS.map((limit) => (
                      <button
                        key={limit}
                        type="button"
                        onClick={() => { setWordLimit(limit); setCustomWordLimit(""); }}
                        className={`px-4 py-2 rounded-lg text-sm transition-all hairline ${
                          wordLimit === limit
                            ? "bg-white/[0.08] text-foreground"
                            : "bg-white/[0.02] hover:bg-white/[0.04] text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <span className="num-display">{limit}</span> words
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setWordLimit(null)}
                      className={`px-4 py-2 rounded-lg text-sm transition-all hairline ${
                        wordLimit === null && !customWordLimit
                          ? "bg-white/[0.08] text-foreground"
                          : "bg-white/[0.02] hover:bg-white/[0.04] text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      No limit
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">Or custom:</span>
                    <Input
                      type="number"
                      placeholder="e.g. 800"
                      value={customWordLimit}
                      onChange={(e) => { setCustomWordLimit(e.target.value); setWordLimit(null); }}
                      className="w-32 bg-white/[0.02] hairline"
                      min="1"
                    />
                  </div>
                </div>
              </HairlineCard>
            </motion.div>
          )}

          {/* Essay Content */}
          <motion.div variants={sectionVariants}>
            <HairlineCard>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <AlignLeft className="h-5 w-5 text-foreground/60" />
                  <div>
                    <h2 className="font-serif text-xl text-foreground leading-tight">
                      The essay itself. <span className="text-[color:var(--pn-pink)]">*</span>
                    </h2>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-1">Draft, revise, submit</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs hairline ${
                    isOverLimit ? "bg-[color:var(--pn-pink)]/15 text-[color:var(--pn-pink)]" : "bg-white/[0.02] text-muted-foreground"
                  }`}>
                    <span className="num-display">{wordCount}</span>{effectiveWordLimit ? <> / <span className="num-display">{effectiveWordLimit}</span></> : ""} words
                  </span>
                  {isOverLimit && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs hairline bg-[color:var(--pn-pink)]/15 text-[color:var(--pn-pink)]">
                      Over limit
                    </span>
                  )}
                  {!isReadonly && wordCount >= 50 && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={handleAnalyseEssay}
                      disabled={isAnalysing}
                      className="gap-1.5 hairline hover:bg-white/[0.04] text-foreground"
                    >
                      {isAnalysing ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Analysing…
                        </>
                      ) : (
                        <>
                          <ScanText className="h-3.5 w-3.5" />
                          Analyse Essay
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
              <div className="space-y-3">
                {!isReadonly && (
                  <p className="text-xs text-muted-foreground font-serif italic">
                    Highlight any passage for AI coaching on that section.
                  </p>
                )}

                <Textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onMouseUp={isReadonly ? undefined : handleSelectionChange}
                  onKeyUp={isReadonly ? undefined : handleSelectionChange}
                  placeholder="Write or paste your essay here..."
                  className={`resize-none min-h-[400px] font-serif text-base leading-relaxed bg-white/[0.02] hairline ${
                    isOverLimit ? "border-[color:var(--pn-pink)] focus-visible:ring-[color:var(--pn-pink)]" : ""
                  } ${isReadonly ? "opacity-80 cursor-default" : ""}`}
                  required
                  readOnly={isReadonly}
                />

                {/* Selection coaching bar */}
                {!isReadonly && selectedText && (
                  <div className="hairline rounded-lg bg-[color:var(--pn-pink)]/8 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <MessageSquare className="h-4 w-4 text-[color:var(--pn-pink)] shrink-0" />
                        <p className="text-sm text-foreground font-serif italic truncate">
                          "{selectedText.length > 60 ? selectedText.slice(0, 60) + "…" : selectedText}"
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={handleGetCoaching}
                          disabled={isCoaching}
                          className="gap-1.5 h-7 text-xs hairline bg-white/[0.03] hover:bg-white/[0.06] text-foreground"
                        >
                          {isCoaching ? (
                            <>
                              <Loader2 className="h-3 w-3 animate-spin" />
                              Bear with us…
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-3 w-3" />
                              Get Feedback
                            </>
                          )}
                        </Button>
                        <button
                          type="button"
                          onClick={() => { setSelectedText(""); setSelectionFeedback(null); }}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {selectionFeedback && (
                      <div className="pt-2 hairline-t">
                        <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                          {selectionFeedback}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </HairlineCard>
          </motion.div>

          {/* Submit */}
          <motion.div variants={sectionVariants} className="flex gap-3 pb-6">
            {isReadonly ? (
              <Button
                type="button"
                className="flex-1 bg-transparent hairline hover:bg-white/[0.04] text-foreground shadow-none"
                onClick={() => navigate(-1)}
              >
                Back to Application
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1 hairline hover:bg-white/[0.03] text-muted-foreground"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1 hairline bg-transparent hover:bg-white/[0.04] text-foreground"
                  disabled={isSavingDraft || isSubmitting}
                  onClick={handleSaveDraft}
                >
                  {isSavingDraft ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <BookOpen className="h-4 w-4 mr-2" />
                      Save & Continue Later
                    </>
                  )}
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-[color:var(--pn-pink)]/15 hairline text-[color:var(--pn-pink)] hover:bg-[color:var(--pn-pink)]/25 shadow-none"
                  disabled={isSubmitting || isSavingDraft || isOverLimit}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Save as Final
                    </>
                  )}
                </Button>
              </>
            )}
          </motion.div>

        </motion.form>

        {/* ── Right column: analysis panel ── */}
        {showAnalysisPanel && (
          <div className="space-y-4">
            <div className="flex items-center justify-between sticky top-6">
              <h2 className="font-serif text-lg text-foreground flex items-center gap-2">
                <ScanText className="h-4 w-4 text-[color:var(--pn-gold)]" />
                What the reader sees.
              </h2>
              <button
                type="button"
                onClick={() => setAnalysisResult(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {isAnalysing && (
              <HairlineCard>
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground text-center font-serif italic">
                    Reading it now.
                  </p>
                </div>
              </HairlineCard>
            )}

            {analysisResult && (
              <>
                {/* Overall score */}
                <HairlineCard>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Overall Score</span>
                    <span className="num-display text-3xl text-foreground">
                      {analysisResult.overallScore}
                      <span className="text-sm text-muted-foreground">/100</span>
                    </span>
                  </div>
                  <div className="space-y-3">
                    {analysisResult.criteria.map((c) => (
                      <div key={c.id}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">{c.name}</span>
                          <span className="num-display text-foreground">{c.score}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: c.color }}
                            initial={{ width: 0 }}
                            animate={{ width: `${c.score}%` }}
                            transition={{ duration: 0.9, ease: [0.2, 0.6, 0.2, 1] }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </HairlineCard>

                {/* Issues */}
                <div className="space-y-2">
                  {analysisResult.issues.map((issue) => (
                    <HairlineCard key={issue.id} className="overflow-hidden p-0">
                      <div className="h-1 w-full" style={{ backgroundColor: issue.color }} />
                      <div className="px-4 py-3 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] uppercase tracking-[0.18em]" style={{ color: issue.color }}>
                            {issue.criterionName}
                          </span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${severityPill(issue.severity)}`}>
                            {issue.severity}
                          </span>
                        </div>
                        <p className="text-xs text-foreground">{issue.problemType}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {issue.problemDescription}
                        </p>
                        <div className="pt-2 hairline-t">
                          <p className="text-xs text-foreground leading-relaxed">
                            <span className="text-[color:var(--pn-sage)]">Suggestion: </span>
                            {issue.recommendation}
                          </p>
                        </div>
                      </div>
                    </HairlineCard>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

      </div>
    </PageShell>
  );
};

export default SubmitEssay;
