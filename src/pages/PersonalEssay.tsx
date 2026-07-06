import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
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
import {
  ArrowLeft,
  FileText,
  BookOpen,
  Hash,
  AlignLeft,
  Loader2,
  CheckCircle,
  Sparkles,
  RefreshCw,
  MessageSquare,
  X,
  ScanText,
  Send,
  Users,
  GraduationCap,
} from "lucide-react";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const WORD_LIMIT_OPTIONS = [250, 500, 650, 750, 1000];

const PersonalEssay = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const urlDraftId = searchParams.get("draftId");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [counselorId, setCounselorId] = useState<string | null>(null);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(urlDraftId);

  const [title, setTitle] = useState("Common App Personal Statement");
  const [prompt, setPrompt] = useState("");
  const [content, setContent] = useState("");
  const [wordLimit, setWordLimit] = useState<number | null>(650);
  const [customWordLimit, setCustomWordLimit] = useState("");

  const wordCount = content.trim() === "" ? 0 : content.trim().split(/\s+/).length;
  const effectiveWordLimit = wordLimit ?? (customWordLimit ? parseInt(customWordLimit) : null);
  const isOverLimit = effectiveWordLimit ? wordCount > effectiveWordLimit : false;

  const [selectedText, setSelectedText] = useState("");
  const [selectionFeedback, setSelectionFeedback] = useState<string | null>(null);
  const [isCoaching, setIsCoaching] = useState(false);

  const [suggestions, setSuggestions] = useState<string | null>(null);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [hasFetchedOnce, setHasFetchedOnce] = useState(false);
  const [isAnalysisMode, setIsAnalysisMode] = useState(false);

  const [recipient, setRecipient] = useState<'counselor' | 'teacher' | 'both'>('counselor');
  const [teachers, setTeachers] = useState<{ user_id: string; full_name: string }[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCounselorAndTeachers = async () => {
      const { data: anyRole } = await supabase.rpc("get_my_counselor_id");
      if (anyRole) setCounselorId(anyRole);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase
        .from("profiles")
        .select("school_id")
        .eq("user_id", user.id)
        .maybeSingle();

      const schoolId = profileData?.school_id;
      if (!schoolId) return;

      const { data: teacherData } = await (supabase as any)
        .rpc("get_teachers_by_school", { school_id_param: schoolId });

      if (teacherData && teacherData.length > 0) setTeachers(teacherData);
    };
    fetchCounselorAndTeachers();

    const cached = sessionStorage.getItem("pe_initial_suggestions");
    if (cached) {
      setSuggestions(cached);
      setHasFetchedOnce(true);
    } else {
      fetchSuggestions(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!urlDraftId) return;
    const loadDraft = async () => {
      const { data, error } = await (supabase
        .from("essay_feedback")
        .select("essay_title, essay_prompt, essay_content, word_limit, status")
        .eq("id", urlDraftId)
        .single() as any);
      if (error || !data || data.status !== "draft") return;
      setTitle(data.essay_title ?? "Common App Personal Statement");
      setPrompt(data.essay_prompt ?? "");
      setContent(data.essay_content ?? "");
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

  const fetchSuggestions = async (withContent = false) => {
    setIsLoadingSuggestions(true);
    setSuggestions(null);
    setIsAnalysisMode(withContent);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${SUPABASE_URL}/functions/v1/student-ai-helper`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          essayContent: withContent ? content.trim() : null,
          essayPrompt: prompt.trim() || null,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const text = data.suggestions ?? null;
        setSuggestions(text);
        if (!withContent && text) sessionStorage.setItem("pe_initial_suggestions", text);
      } else {
        toast.error("Couldn't load AI suggestions. Try refreshing.");
      }
    } catch {
      toast.error("Couldn't reach the AI assistant right now.");
    } finally {
      setIsLoadingSuggestions(false);
      setHasFetchedOnce(true);
    }
  };

  const handleAnalyzeEssay = () => fetchSuggestions(true);

  const handleSelectionChange = () => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const text = el.value.substring(start, end).trim();
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

  const handleSaveDraft = async () => {
    if (!title.trim()) { toast.error("Please add a title before saving"); return; }
    setIsSavingDraft(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const payload = {
        student_id: user.id,
        counselor_id: counselorId,
        essay_title: title.trim(),
        essay_prompt: prompt.trim() || null,
        essay_content: content.trim(),
        word_limit: effectiveWordLimit || null,
        status: "draft",
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
      }

      toast.success("Draft saved! Continue anytime from My Work → Essays.");
      navigate("/student-personal-area?tab=essays");
    } catch (err: any) {
      toast.error(err.message || "Failed to save draft");
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim())   { toast.error("Please add an essay title");         return; }
    if (!content.trim()) { toast.error("Please add your essay content");     return; }
    if (isOverLimit)     { toast.error("Your essay exceeds the word limit"); return; }
    if ((recipient === 'counselor' || recipient === 'both') && !counselorId) {
      toast.error("No counselor found. Please contact support.");
      return;
    }
    if ((recipient === 'teacher' || recipient === 'both') && !selectedTeacherId) {
      toast.error("Please select a teacher to send to.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let essayId: string | null = currentDraftId;

      if (currentDraftId) {
        const { error } = await (supabase
          .from("essay_feedback")
          .update({
            essay_title:   title.trim(),
            essay_prompt:  prompt.trim() || null,
            essay_content: content.trim(),
            status:        "pending",
          } as any)
          .eq("id", currentDraftId) as any);
        if (error) throw error;
      } else {
        const newId = crypto.randomUUID();
        const { error } = await (supabase
          .from("essay_feedback")
          .insert({
            id:            newId,
            student_id:    user.id,
            counselor_id:  recipient === 'teacher' ? null : counselorId,
            essay_title:   title.trim(),
            essay_prompt:  prompt.trim() || null,
            essay_content: content.trim(),
            status:        "pending",
          } as any) as any);
        if (error) throw error;
        essayId = newId;
      }

      if ((recipient === 'teacher' || recipient === 'both') && selectedTeacherId && essayId) {
        const { error: shareError } = await (supabase as any)
          .from("essay_teacher_shares")
          .insert({
            essay_feedback_id: essayId,
            teacher_id:        selectedTeacherId,
            student_id:        user.id,
          });
        if (shareError) console.error("Failed to share with teacher:", shareError);
      }

      setIsSuccess(true);
      toast.success("Essay submitted successfully!");

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if ((recipient === 'counselor' || recipient === 'both') && counselorId) {
          const [{ data: studentProfile }, { data: counselorProfile }] = await Promise.all([
            supabase.from("profiles").select("full_name, email").eq("user_id", user.id).maybeSingle(),
            supabase.from("profiles").select("full_name, email").eq("user_id", counselorId).maybeSingle(),
          ]);
          await fetch(`${SUPABASE_URL}/functions/v1/send-new-essay-notification`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session?.access_token}`,
            },
            body: JSON.stringify({
              counselorEmail:  counselorProfile?.email || "no-email@unknown.com",
              counselorName:   counselorProfile?.full_name || "Counselor",
              studentName:     studentProfile?.full_name || "Your student",
              essayLabel:      title.trim(),
              appUrl:          window.location.origin,
            }),
          });
        }
      } catch (notifyError) {
        console.error("Failed to send essay notification:", notifyError);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to submit essay");
    } finally {
      setIsSubmitting(false);
    }
  };

  const parseSuggestions = (raw: string) => {
    return raw.split(/\n(?=\*\*)/).map(b => b.trim()).filter(Boolean);
  };

  if (isSuccess) {
    return (
      <PageShell>
        <BlurOrb tone="sage" className="top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px]" />
        <div className="flex items-center justify-center min-h-[70vh]">
          <HairlineCard variant="sage" className="max-w-md w-full text-center p-10 space-y-6">
            <div className="flex justify-center">
              <div className="h-20 w-20 rounded-full hairline bg-[color:var(--pn-sage)]/12 flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-[color:var(--pn-sage)]" />
              </div>
            </div>
            <div>
              <h2 className="font-serif text-3xl text-foreground leading-tight">Sent.</h2>
              <p className="font-serif italic text-muted-foreground mt-3">
                {recipient === 'teacher'
                  ? "Your teacher has it. They'll read soon."
                  : recipient === 'both'
                  ? "Counselor and teacher — both have it."
                  : "Your counselor has it. They'll read soon."}
              </p>
            </div>
            <Button
              onClick={() => navigate("/student-personal-area?tab=essays")}
              className="w-full bg-transparent hairline hover:bg-white/[0.04] text-foreground shadow-none"
            >
              Back to My Work
            </Button>
          </HairlineCard>
        </div>
      </PageShell>
    );
  }

  const sectionVariants = {
    hidden: { opacity: 0, y: 8, filter: 'blur(4px)' },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.4, ease: [0.2, 0.6, 0.2, 1] } },
  };

  return (
    <PageShell maxWidth="wide">
      <BlurOrb tone="pink" className="top-[-100px] right-[-100px] w-[500px] h-[500px]" />

      <Button
        variant="ghost"
        className="mb-6 gap-2 text-muted-foreground hover:text-foreground hover:bg-white/[0.03]"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <PageHeader
        eyebrow="Personal statement"
        title={<>Your story, still becoming.</>}
        subtitle={<>Write your Common App essay — with a coach at your elbow.</>}
      />

      <div className="grid grid-cols-[1fr_380px] gap-6 items-start">

        {/* ── Left: form ── */}
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
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-1">Title and prompt</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-foreground">Essay Title</Label>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Common App Personal Statement"
                      className="pl-10 bg-white/[0.02] hairline"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prompt" className="text-foreground">
                    Essay Prompt{" "}
                    <span className="text-muted-foreground text-xs font-normal">
                      (optional — paste for more targeted AI suggestions)
                    </span>
                  </Label>
                  <Textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g. Some students have a background, identity, interest, or talent so meaningful they believe their application would be incomplete without it..."
                    className="resize-none min-h-[80px] text-sm bg-white/[0.02] hairline"
                  />
                </div>
              </div>
            </HairlineCard>
          </motion.div>

          {/* Word Limit */}
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
                  {wordCount >= 200 && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={handleAnalyzeEssay}
                      disabled={isLoadingSuggestions}
                      className="gap-1.5 hairline hover:bg-white/[0.04] text-foreground"
                    >
                      {isLoadingSuggestions && isAnalysisMode ? (
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
                <p className="text-xs text-muted-foreground font-serif italic">
                  Highlight any passage for AI coaching on that section.
                </p>

                <Textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onMouseUp={handleSelectionChange}
                  onKeyUp={handleSelectionChange}
                  placeholder="Start writing your personal statement here..."
                  className={`resize-none min-h-[420px] font-serif text-base leading-relaxed bg-white/[0.02] hairline ${
                    isOverLimit ? "border-[color:var(--pn-pink)] focus-visible:ring-[color:var(--pn-pink)]" : ""
                  }`}
                  required
                />

                {selectedText && (
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

          {/* Recipient */}
          <motion.div variants={sectionVariants}>
            <HairlineCard>
              <div className="flex items-center gap-3 mb-6">
                <Send className="h-5 w-5 text-foreground/60" />
                <div>
                  <h2 className="font-serif text-xl text-foreground leading-tight">Who reads it.</h2>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-1">Choose your reader</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex gap-2">
                  {([
                    { value: 'counselor', label: 'My Counselor', icon: GraduationCap },
                    { value: 'teacher',   label: 'A Teacher',    icon: Users },
                    { value: 'both',      label: 'Both',         icon: Send },
                  ] as const).map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRecipient(value)}
                      className={`flex-1 flex flex-col items-center gap-1.5 px-3 py-3 rounded-lg text-sm transition-all hairline ${
                        recipient === value
                          ? "bg-white/[0.08] text-foreground"
                          : "bg-white/[0.02] hover:bg-white/[0.04] text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </button>
                  ))}
                </div>

                {(recipient === 'teacher' || recipient === 'both') && (
                  <div className="space-y-2 pt-1">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Select teacher</p>
                    {teachers.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic font-serif">
                        No teachers found at your school. Ask your counselor to add one.
                      </p>
                    ) : (
                      <div className="flex flex-col gap-1.5">
                        {teachers.map((t) => (
                          <button
                            key={t.user_id}
                            type="button"
                            onClick={() => setSelectedTeacherId(t.user_id)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-all hairline ${
                              selectedTeacherId === t.user_id
                                ? "bg-white/[0.08] text-foreground"
                                : "bg-white/[0.02] hover:bg-white/[0.04] text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            <Users className="h-3.5 w-3.5 shrink-0" />
                            {t.full_name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </HairlineCard>
          </motion.div>

          {/* Actions */}
          <motion.div variants={sectionVariants} className="flex gap-3 pb-6">
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
                  Submitting...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Submit Essay
                </>
              )}
            </Button>
          </motion.div>

        </motion.form>

        {/* ── Right: AI panel (always visible) ── */}
        <div className="sticky top-6 space-y-3">
          <HairlineCard variant="hero">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[color:var(--pn-gold)]" />
                <h3 className="font-serif text-lg text-foreground leading-tight">
                  {isAnalysisMode ? "What the reader sees." : "Where to begin."}
                </h3>
              </div>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => fetchSuggestions(isAnalysisMode)}
                disabled={isLoadingSuggestions}
                className="gap-1.5 h-7 text-xs text-muted-foreground hover:text-foreground hover:bg-white/[0.03]"
              >
                {isLoadingSuggestions ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="h-3.5 w-3.5" />
                )}
                {hasFetchedOnce && !isLoadingSuggestions ? "Refresh" : ""}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground font-serif italic leading-relaxed mb-4">
              {isAnalysisMode
                ? "Feedback on your current draft, shaped by your profile."
                : "Personalised opening ideas from your profile. Add a prompt above for sharper suggestions."}
            </p>

            {isLoadingSuggestions && (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground text-center font-serif italic">
                  {isAnalysisMode ? "Reading it now." : "Crafting your suggestions."}
                </p>
              </div>
            )}

            {!isLoadingSuggestions && suggestions && (() => {
              const blocks = parseSuggestions(suggestions);
              const hasSuggestionFormat = blocks.some(b => /^\*\*/.test(b));

              if (!hasSuggestionFormat) {
                return (
                  <div className="rounded-lg hairline bg-[color:var(--pn-sage)]/10 p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-[color:var(--pn-sage)] shrink-0" />
                      <p className="text-sm font-serif text-[color:var(--pn-sage)]">Looking great.</p>
                    </div>
                    <p className="text-xs text-foreground leading-relaxed whitespace-pre-line">
                      {suggestions}
                    </p>
                  </div>
                );
              }

              return (
                <div className="space-y-3">
                  {blocks.map((block, i) => {
                    const titleMatch = block.match(/^\*\*(.+?)\*\*/);
                    const blockTitle = titleMatch ? titleMatch[1] : null;
                    const body = block.replace(/^\*\*(.+?)\*\*\n?/, "").trim();
                    return (
                      <div key={i} className="rounded-lg hairline bg-white/[0.02] p-3 space-y-1.5">
                        {blockTitle && (
                          <p className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--pn-gold)]">
                            {blockTitle}
                          </p>
                        )}
                        <p className="text-xs text-foreground leading-relaxed">{body}</p>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            {!isLoadingSuggestions && !suggestions && hasFetchedOnce && (
              <div className="text-center py-8 space-y-3">
                <p className="text-sm text-muted-foreground font-serif italic">Couldn't load suggestions right now.</p>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => fetchSuggestions(false)}
                  className="hairline hover:bg-white/[0.03] text-foreground"
                >
                  Try again
                </Button>
              </div>
            )}
          </HairlineCard>

          {content.trim().length > 50 && (
            <p className="text-xs text-muted-foreground font-serif italic text-center px-2">
              Click "Refresh" for updated suggestions based on what you've written so far.
            </p>
          )}
        </div>

      </div>
    </PageShell>
  );
};

export default PersonalEssay;
