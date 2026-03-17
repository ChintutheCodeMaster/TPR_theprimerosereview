import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  GraduationCap,
  User,
  Award,
  CheckCircle,
  Loader2,
  AlertCircle,
  Send,
  Sparkles,
  BookOpen,
  Shield,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface RecData {
  id: string;
  student_name: string | null;
  referee_name: string;
  referee_role: string | null;
  relationship_duration: string | null;
  relationship_capacity: string | null;
  meaningful_project: string | null;
  best_moment: string | null;
  difficulties_overcome: string | null;
  strengths: string[] | null;
  personal_notes: string | null;
  teacher_draft: string | null;
  status: string;
}

const TeacherRecommendationPage = () => {
  const { token } = useParams<{ token: string }>();
  const { toast } = useToast();
  const [rec, setRec] = useState<RecData | null>(null);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [introExpanded, setIntroExpanded] = useState(false);
  const [teacherPrompt, setTeacherPrompt] = useState("");

  useEffect(() => {
    if (token) fetchRec();
  }, [token]);

  const fetchRec = async () => {
    setLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any).rpc("get_recommendation_by_token", {
        p_token: token,
      });
      if (error) throw error;
      if (!data) { setNotFound(true); return; }
      const recData = data as unknown as RecData;
      setRec(recData);
      if (recData.teacher_draft) {
        setDraft(recData.teacher_draft);
        setSubmitted(true);
      }
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAI = async () => {
    if (!rec) return;
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("enhance-recommendation", {
        body: {
          studentName: rec.student_name ?? "Student",
          refereeName: rec.referee_name,
          refereeRole: rec.referee_role ?? "",
          counselorNotes: teacherPrompt,
          studentAnswers: {
            relationshipDuration: rec.relationship_duration,
            relationshipCapacity: rec.relationship_capacity,
            meaningfulProject: rec.meaningful_project,
            bestMoment: rec.best_moment,
            difficultiesOvercome: rec.difficulties_overcome,
            strengths: rec.strengths,
            personalNotes: rec.personal_notes,
          },
        },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      setDraft(data.letter);
      toast({
        title: "AI draft ready",
        description: "Review and personalise it before submitting.",
      });
    } catch (err: any) {
      toast({
        title: "Could not generate draft",
        description: err.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async () => {
    if (!draft.trim()) {
      toast({ title: "Please write the recommendation letter before submitting.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).rpc("submit_teacher_draft", {
        p_token: token,
        p_draft: draft,
      });
      if (error) throw error;
      setSubmitted(true);
      toast({ title: "Draft submitted!", description: "Your counselor will review and finalise the letter." });
    } catch (err: any) {
      toast({ title: "Failed to submit", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="h-10 w-10 animate-spin text-purple-600 mx-auto" />
          <p className="text-purple-700 font-medium text-sm">Loading your request…</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-800">Link not found or expired</h1>
          <p className="text-gray-500 text-sm">Please contact the counselor who sent you this link.</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center px-4">
        <div className="text-center space-y-5 max-w-md">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Thank you, {rec?.referee_name}!</h1>
          <p className="text-gray-500">
            Your draft for <strong>{rec?.student_name ?? "the student"}</strong> has been submitted.
            The counselor will review, refine if needed, and send the final letter on your behalf.
          </p>
          <div className="flex items-center justify-center gap-2 text-purple-600 text-sm font-medium">
            <GraduationCap className="h-4 w-4" />
            <span>The Primrose Review</span>
          </div>
        </div>
      </div>
    );
  }

  const hasStudentAnswers =
    rec?.meaningful_project || rec?.best_moment || rec?.difficulties_overcome || rec?.personal_notes;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-800 via-purple-700 to-indigo-700 py-10 px-6 text-center text-white shadow-lg">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight">The Primrose Review</span>
        </div>
        <p className="text-purple-200 text-sm font-medium tracking-wide uppercase">
          Recommendation Letter Portal
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* About TPR — collapsible intro */}
        <Card className="border-purple-100 shadow-sm overflow-hidden">
          <button
            className="w-full text-left"
            onClick={() => setIntroExpanded(v => !v)}
          >
            <CardHeader className="pb-3 hover:bg-purple-50/50 transition-colors">
              <CardTitle className="flex items-center justify-between text-base text-purple-800">
                <span className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  About The Primrose Review
                </span>
                {introExpanded
                  ? <ChevronUp className="h-4 w-4 text-purple-400" />
                  : <ChevronDown className="h-4 w-4 text-purple-400" />
                }
              </CardTitle>
            </CardHeader>
          </button>
          {introExpanded && (
            <CardContent className="pt-0 pb-5 space-y-4 text-sm text-gray-600">
              <p>
                <strong className="text-gray-800">The Primrose Review (TPR)</strong> is a college application
                platform built for students navigating the complex journey of applying to university. We help
                students craft genuine, compelling applications — including personal essays, activity descriptions,
                and supplementals — with the support of AI tools used <em>ethically and transparently</em>.
              </p>
              <p>
                Unlike services that write for students, TPR works <em>with</em> students: our AI suggests,
                refines, and guides, but the student's own voice, experiences, and ideas remain at the centre.
                Counselors oversee every step, ensuring every piece reflects the real person behind the application.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {[
                  { icon: <Shield className="h-4 w-4 text-purple-600" />, label: "Ethical AI use", desc: "Students guide the AI — not the other way around." },
                  { icon: <GraduationCap className="h-4 w-4 text-purple-600" />, label: "Counselor-led", desc: "Every letter is reviewed before it reaches a university." },
                  { icon: <Sparkles className="h-4 w-4 text-purple-600" />, label: "Authentic voice", desc: "AI as a tool, not a ghostwriter." },
                ].map(item => (
                  <div key={item.label} className="rounded-lg bg-purple-50 p-3 space-y-1">
                    <div className="flex items-center gap-1.5 font-medium text-gray-800">
                      {item.icon}
                      {item.label}
                    </div>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Request intro */}
        <Card className="border-purple-100 shadow-sm">
          <CardContent className="p-6">
            <h1 className="text-xl font-bold text-gray-800 mb-2">
              Recommendation Request for{" "}
              <span className="text-purple-700">{rec?.student_name ?? "Student"}</span>
            </h1>
            <p className="text-gray-500 text-sm leading-relaxed">
              Hello <strong>{rec?.referee_name}</strong> — {rec?.student_name ?? "this student"} has asked you
              to write a recommendation letter as part of their college application through The Primrose Review.
              Below you'll find the context they shared to help you write the letter. You can write it yourself
              or use the <strong>AI Draft</strong> tool to generate a starting point — then personalise it in
              your own words before submitting. The counselor will review everything before it is sent.
            </p>
          </CardContent>
        </Card>

        {/* Student context */}
        <Card className="border-purple-100 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-gray-800">
              <User className="h-4 w-4 text-purple-600" />
              Student's Context
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {rec?.relationship_duration && (
              <div className="rounded-lg bg-gray-50 px-4 py-3">
                <p className="font-semibold text-gray-500 text-xs uppercase tracking-wide mb-1">How long they've known you</p>
                <p className="text-gray-800">{rec.relationship_duration}</p>
              </div>
            )}
            {rec?.relationship_capacity && (
              <div className="rounded-lg bg-gray-50 px-4 py-3">
                <p className="font-semibold text-gray-500 text-xs uppercase tracking-wide mb-1">How closely you worked together</p>
                <p className="text-gray-800">{rec.relationship_capacity}</p>
              </div>
            )}
            {rec?.meaningful_project && (
              <div className="rounded-lg bg-gray-50 px-4 py-3">
                <p className="font-semibold text-gray-500 text-xs uppercase tracking-wide mb-1">Most meaningful project together</p>
                <p className="text-gray-800">{rec.meaningful_project}</p>
              </div>
            )}
            {rec?.best_moment && (
              <div className="rounded-lg bg-gray-50 px-4 py-3">
                <p className="font-semibold text-gray-500 text-xs uppercase tracking-wide mb-1">A moment they were at their best</p>
                <p className="text-gray-800">{rec.best_moment}</p>
              </div>
            )}
            {rec?.difficulties_overcome && (
              <div className="rounded-lg bg-gray-50 px-4 py-3">
                <p className="font-semibold text-gray-500 text-xs uppercase tracking-wide mb-1">Difficulties they overcame</p>
                <p className="text-gray-800">{rec.difficulties_overcome}</p>
              </div>
            )}
            {rec?.strengths && rec.strengths.length > 0 && (
              <div className="rounded-lg bg-gray-50 px-4 py-3">
                <p className="font-semibold text-gray-500 text-xs uppercase tracking-wide mb-2">Strengths they highlighted</p>
                <div className="flex flex-wrap gap-1.5">
                  {rec.strengths.map(s => (
                    <Badge key={s} className="bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-100 text-xs">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {rec?.personal_notes && (
              <div className="rounded-lg bg-purple-50 border border-purple-100 px-4 py-3">
                <p className="font-semibold text-purple-600 text-xs uppercase tracking-wide mb-1">Personal notes from student</p>
                <p className="text-gray-700 italic">"{rec.personal_notes}"</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Draft generation */}
        <Card className="border-purple-100 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-gray-800">
              <Sparkles className="h-4 w-4 text-purple-600" />
              AI-Assisted Draft
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-500">
              Not sure where to start? Let AI generate a first draft based on the student's answers above.
              It will be written in your voice as{" "}
              <strong>{rec?.referee_name}</strong>
              {rec?.referee_role ? ` (${rec.referee_role})` : ""}. You can then edit it freely before submitting.
            </p>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Your notes for the AI <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <Textarea
                value={teacherPrompt}
                onChange={e => setTeacherPrompt(e.target.value)}
                placeholder="e.g. Focus on their leadership during the science fair, mention their curiosity and how they handled setbacks…"
                rows={4}
                className="resize-none border-gray-200 focus:border-purple-400 focus:ring-purple-400 text-sm"
              />
              <p className="text-xs text-gray-400">
                Add anything specific you'd like the AI to highlight or emphasise. This is combined with the student's answers above.
              </p>
            </div>
            <Button
              onClick={handleGenerateAI}
              disabled={isGenerating || !hasStudentAnswers}
              variant="outline"
              className="w-full border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400"
            >
              {isGenerating ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" />Generating draft…</>
              ) : (
                <><Sparkles className="h-4 w-4 mr-2" />Generate AI Draft</>
              )}
            </Button>
            {!hasStudentAnswers && (
              <p className="text-xs text-center text-amber-600">
                The student hasn't completed their questionnaire yet — AI draft will be available once they do.
              </p>
            )}
            <p className="text-xs text-center text-gray-400">
              The AI uses only the information the student provided. No details are added or invented.
            </p>
          </CardContent>
        </Card>

        {/* Draft editor */}
        <Card className="border-purple-100 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-gray-800">
              <Award className="h-4 w-4 text-purple-600" />
              Write Your Recommendation Letter
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-500">
              Write or paste your letter below. You can use the AI draft above as a starting point and edit
              it freely. The counselor will review before sending to the university.
            </p>
            <Textarea
              value={draft}
              onChange={e => setDraft(e.target.value)}
              placeholder={"To Whom It May Concern,\n\nIt is my great pleasure to recommend…"}
              rows={18}
              className="font-serif text-sm resize-none border-gray-200 focus:border-purple-400 focus:ring-purple-400"
            />
            <Button
              onClick={handleSubmit}
              disabled={submitting || !draft.trim()}
              className="w-full bg-purple-700 hover:bg-purple-800 text-white shadow-sm"
              size="lg"
            >
              {submitting
                ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Submitting…</>
                : <><Send className="h-4 w-4 mr-2" />Submit Draft to Counselor</>
              }
            </Button>
            <p className="text-xs text-center text-gray-400">
              Once submitted you won't be able to edit your draft. Contact the counselor if changes are needed.
            </p>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center pb-6">
          <div className="flex items-center justify-center gap-2 text-purple-600 text-sm font-medium mb-1">
            <GraduationCap className="h-4 w-4" />
            <span>The Primrose Review</span>
          </div>
          <p className="text-xs text-gray-400">
            Helping students tell their story — ethically, authentically, and with heart.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TeacherRecommendationPage;
