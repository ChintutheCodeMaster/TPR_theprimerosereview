import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
const ANTHROPIC_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;

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
  RefreshCw,
} from "lucide-react";

const WORD_LIMIT_OPTIONS = [250, 500, 650, 750, 1000];

const SubmitEssay = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Read slot context from URL params (set by ApplicationDetailModal)
  const slotId        = searchParams.get("slotId");
  const applicationId = searchParams.get("applicationId");
  const slotLabel     = searchParams.get("label");
  const slotPrompt    = searchParams.get("prompt");
  const slotWordLimit = searchParams.get("wordLimit");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess]       = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [counselorId, setCounselorId]   = useState<string | null>(null);

  // Form fields — pre-fill from slot context if available
  const [title, setTitle]               = useState(slotLabel ?? "");
  const [prompt, setPrompt]             = useState(slotPrompt ?? "");
  const [content, setContent]           = useState("");
  const [targetSchool, setTargetSchool] = useState("");
  const [wordLimit, setWordLimit]       = useState<number | null>(
    slotWordLimit ? parseInt(slotWordLimit) : null
  );
  const [customWordLimit, setCustomWordLimit] = useState("");

  // Word count
  const wordCount          = content.trim() === "" ? 0 : content.trim().split(/\s+/).length;
  const effectiveWordLimit = wordLimit ?? (customWordLimit ? parseInt(customWordLimit) : null);
  const isOverLimit        = effectiveWordLimit ? wordCount > effectiveWordLimit : false;

  // Fetch counselor id on mount
  useEffect(() => {
    const fetchCounselor = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: anyRole } = await supabase.rpc('get_any_counselor_id');
      if (anyRole) setCounselorId(anyRole);
    };
    fetchCounselor();
  }, []);

  // ── AI Essay Generation ────────────────────────────────────
  const handleGenerateEssay = async () => {
   
    if (!prompt.trim()) {
      toast.error("Please add an essay prompt first so AI knows what to write");
      return;
    }

    setIsGenerating(true);
    try {
      const wordTarget = effectiveWordLimit ?? 650;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": ANTHROPIC_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2000,
          system: `You are an expert college admissions essay writer. 
You write authentic, personal, and compelling college application essays that sound like a real student — not AI. 
Your essays are specific, use vivid details, show genuine reflection, and connect personal experiences to future goals.
NEVER use clichés. NEVER start with "In today's world" or similar generic openings.
Write in first person. Be specific and authentic.`,
          messages: [
            {
              role: "user",
              content: `Write a college application essay based on this prompt:

"${prompt.trim()}"

${title.trim() ? `Essay title/topic: ${title.trim()}` : ""}
${targetSchool.trim() ? `Target school: ${targetSchool.trim()}` : ""}
Target word count: approximately ${wordTarget} words.

Write a complete, polished essay that sounds authentic and personal. 
Use a compelling opening, specific details and examples, genuine reflection, and a strong conclusion.
Do NOT include any preamble, explanation, or notes — just the essay itself.`,
            },
          ],
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err?.error?.message ?? "AI generation failed");
      }

      const data = await response.json();
      const generatedText = data.content
        .filter((b: any) => b.type === "text")
        .map((b: any) => b.text)
        .join("\n");

      setContent(generatedText.trim());
      toast.success("Essay draft generated! Review and edit it to make it your own.");
    } catch (error: any) {
      toast.error(error.message || "Failed to generate essay. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // ── Submit ────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim())   { toast.error("Please add an essay title");         return; }
    if (!content.trim()) { toast.error("Please add your essay content");     return; }
    if (isOverLimit)     { toast.error("Your essay exceeds the word limit"); return; }
    if (!counselorId)    { toast.error("No counselor found. Please contact support."); return; }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const essayTitle = targetSchool.trim()
        ? `${title.trim()} — ${targetSchool.trim()}`
        : title.trim();

      // Step 1 — Insert essay_feedback row
      const { data: essayData, error: essayError } = await supabase
        .from("essay_feedback")
        .insert({
          student_id:    user.id,
          counselor_id:  counselorId,
          essay_title:   essayTitle,
          essay_prompt:  prompt.trim() || null,
          essay_content: content.trim(),
          status:        "pending",
        })
        .select()
        .single();

      if (essayError) throw essayError;

      // Step 2 — If coming from a slot, link essay back to the slot
      if (slotId && essayData?.id) {
        const { error: slotError } = await supabase
          .from("application_essays")
          .update({
            essay_feedback_id: essayData.id,
            status:            "draft",
            updated_at:        new Date().toISOString(),
          })
          .eq("id", slotId);

        if (slotError) {
          console.error("Failed to link essay to slot:", slotError);
        }
      }

      setIsSuccess(true);
      toast.success("Essay submitted successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to submit essay");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Success state ──────────────────────────────────────────
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10 flex items-center justify-center p-6">
        <Card className="max-w-md w-full p-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-950/30 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Essay Submitted!</h2>
            <p className="text-muted-foreground mt-2">
              {slotId
                ? "Your essay has been linked to your application. Your counselor will review it soon."
                : "Your counselor has received your essay and will review it soon."}
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Button
              onClick={() =>
                applicationId
                  ? navigate(`/student-personal-area?tab=applications`)
                  : navigate(-1)
              }
              className="w-full"
            >
              {applicationId ? "Back to Applications" : "Back to My Work"}
            </Button>
            {!slotId && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setIsSuccess(false);
                  setTitle("");
                  setPrompt("");
                  setContent("");
                  setTargetSchool("");
                  setWordLimit(null);
                  setCustomWordLimit("");
                }}
              >
                Submit Another Essay
              </Button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  // ── Form ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10 p-6">
      <div className="max-w-3xl mx-auto space-y-6">

        <div className="flex items-center gap-4">
          <Button variant="ghost" className="gap-2" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-foreground">Submit an Essay</h1>
          <p className="text-muted-foreground mt-1">
            {slotId
              ? `Writing for: ${slotLabel}`
              : "Your counselor will review and provide feedback"}
          </p>
          {slotId && (
            <Badge variant="outline" className="mt-2">
              Linked to application slot
            </Badge>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Essay Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-5 w-5 text-primary" />
                Essay Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">

              <div className="space-y-2">
                <Label htmlFor="title">
                  Essay Title <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Common App Personal Statement"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {!slotId && (
                <div className="space-y-2">
                  <Label htmlFor="targetSchool">Target School</Label>
                  <div className="relative">
                    <School className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="targetSchool"
                      value={targetSchool}
                      onChange={(e) => setTargetSchool(e.target.value)}
                      placeholder="e.g. MIT, Harvard, Stanford..."
                      className="pl-10"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="prompt">Essay Prompt</Label>
                <div className="relative">
                  <AlignLeft className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Paste the essay prompt here..."
                    className="pl-10 resize-none"
                    rows={3}
                  />
                </div>
              </div>

            </CardContent>
          </Card>

          {/* Word Limit */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Hash className="h-5 w-5 text-primary" />
                Word Limit
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {WORD_LIMIT_OPTIONS.map((limit) => (
                  <button
                    key={limit}
                    type="button"
                    onClick={() => { setWordLimit(limit); setCustomWordLimit(""); }}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                      wordLimit === limit
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-muted/30 hover:bg-muted/60 text-foreground"
                    }`}
                  >
                    {limit} words
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setWordLimit(null)}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                    wordLimit === null && !customWordLimit
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-muted/30 hover:bg-muted/60 text-foreground"
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
                  className="w-32"
                  min="1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Essay Content */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <AlignLeft className="h-5 w-5 text-primary" />
                  Essay Content <span className="text-destructive">*</span>
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={isOverLimit ? "text-destructive border-destructive" : "text-muted-foreground"}
                  >
                    {wordCount} {effectiveWordLimit ? `/ ${effectiveWordLimit}` : ""} words
                  </Badge>
                  {isOverLimit && (
                    <Badge variant="destructive">Over limit</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">

              {/* AI Generate banner */}
              <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <Sparkles className="h-4 w-4 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">Generate with AI</p>
                  <p className="text-xs text-muted-foreground">
                    {prompt.trim()
                      ? "AI will draft an essay based on your prompt. Edit it to make it your own."
                      : "Add a prompt above first, then generate a draft."}
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleGenerateEssay}
                  disabled={isGenerating || !prompt.trim()}
                  className="shrink-0"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                      Generating...
                    </>
                  ) : content.trim() ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                      Regenerate
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                      Generate Draft
                    </>
                  )}
                </Button>
              </div>

              {/* Loading state */}
              {isGenerating && (
                <div className="flex items-center justify-center py-8 border border-dashed border-primary/30 rounded-lg bg-primary/5">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Writing your essay...</p>
                    <p className="text-xs text-muted-foreground mt-1">This takes about 10-15 seconds</p>
                  </div>
                </div>
              )}

              {/* Textarea */}
              {!isGenerating && (
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste or type your essay here, or use the AI generator above..."
                  className={`resize-none min-h-[400px] text-sm leading-relaxed ${
                    isOverLimit ? "border-destructive focus-visible:ring-destructive" : ""
                  }`}
                  required
                />
              )}

              {content.trim() && !isGenerating && (
                <p className="text-xs text-muted-foreground">
                  💡 Remember to personalize the AI draft with your own experiences and voice before submitting.
                </p>
              )}

            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-3 pb-6">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting || isOverLimit || isGenerating}
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
          </div>

        </form>
      </div>
    </div>
  );
};

export default SubmitEssay;