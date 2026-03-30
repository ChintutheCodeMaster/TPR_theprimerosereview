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
  Clock,
  Heart,
  Zap,
  Star,
  MessageSquare,
} from "lucide-react";

interface RecMessage {
  id: string;
  sender_role: 'counselor' | 'teacher';
  content: string;
  created_at: string;
}

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
  messages?: RecMessage[];
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
  const [teacherQ1, setTeacherQ1] = useState("");
  const [teacherQ2, setTeacherQ2] = useState("");
  const [teacherQ3, setTeacherQ3] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [isReplying, setIsReplying] = useState(false);

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
          teacherAnswers: {
            proudMoment: teacherQ1,
            classHighlight: teacherQ2,
            anythingElse: teacherQ3,
          },
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

  const handleReply = async () => {
    if (!replyContent.trim()) return;
    setIsReplying(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).rpc("add_teacher_message_by_token", {
        p_token: token,
        p_content: replyContent,
      });
      if (error) throw error;
      setReplyContent("");
      await fetchRec();
      toast({ title: "Reply sent to your counselor" });
    } catch (err: any) {
      toast({ title: "Failed to send reply", description: err.message, variant: "destructive" });
    } finally {
      setIsReplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mx-auto shadow-lg">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
          <p className="text-purple-700 font-medium text-sm">Loading your request…</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-red-100 border border-red-200 flex items-center justify-center mx-auto">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-800">Link not found or expired</h1>
          <p className="text-gray-500 text-sm">Please contact the counselor who sent you this link.</p>
        </div>
      </div>
    );
  }

  const hasCounselorNotes = (rec?.messages ?? []).some(m => m.sender_role === 'counselor');

  if (submitted && !hasCounselorNotes) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="text-center space-y-5 max-w-md">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center mx-auto shadow-xl">
            <CheckCircle className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Thank you, {rec?.referee_name}!</h1>
          <p className="text-gray-500 leading-relaxed">
            Your draft for <strong className="text-gray-700">{rec?.student_name ?? "the student"}</strong> has been submitted.
            The counselor will review, refine if needed, and send the final letter on your behalf.
          </p>
          <p className="text-gray-400 text-sm">
            If your counselor has revisions, they'll send you a note and this page will update on your next visit.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100 border border-violet-200 text-violet-700 text-sm font-medium">
            <GraduationCap className="h-4 w-4" />
            The Primrose Review
          </div>
        </div>
      </div>
    );
  }

  const hasStudentAnswers =
    rec?.meaningful_project || rec?.best_moment || rec?.difficulties_overcome || rec?.personal_notes;

  // Per-field color themes for student context
  const contextFields = [
    {
      key: "relationship_duration",
      label: "How long they've known you",
      value: rec?.relationship_duration,
      bg: "bg-indigo-50 border border-indigo-100",
      dot: "bg-indigo-400",
      label_color: "text-indigo-500",
    },
    {
      key: "relationship_capacity",
      label: "How closely you worked together",
      value: rec?.relationship_capacity,
      bg: "bg-violet-50 border border-violet-100",
      dot: "bg-violet-400",
      label_color: "text-violet-500",
    },
    {
      key: "meaningful_project",
      label: "Most meaningful project together",
      value: rec?.meaningful_project,
      bg: "bg-pink-50 border border-pink-100",
      dot: "bg-pink-400",
      label_color: "text-pink-500",
    },
    {
      key: "best_moment",
      label: "A moment they were at their best",
      value: rec?.best_moment,
      bg: "bg-amber-50 border border-amber-100",
      dot: "bg-amber-400",
      label_color: "text-amber-500",
    },
    {
      key: "difficulties_overcome",
      label: "Difficulties they overcame",
      value: rec?.difficulties_overcome,
      bg: "bg-emerald-50 border border-emerald-100",
      dot: "bg-emerald-400",
      label_color: "text-emerald-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50">

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-800 via-violet-700 to-indigo-700 py-12 px-6 text-center text-white shadow-xl relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3 pointer-events-none" />

        <div className="relative flex items-center justify-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/30">
            <GraduationCap className="h-7 w-7 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight">The Primrose Review</span>
        </div>
        <div className="relative inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/25 text-purple-200 text-sm font-medium tracking-wide">
          <Star className="h-3 w-3" />
          Recommendation Letter Portal
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-5">

        {/* Counselor Notes — shown only when messages exist */}
        {(rec?.messages ?? []).length > 0 && (
          <Card className="border-amber-200 shadow-sm bg-amber-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-amber-800">
                <MessageSquare className="h-4 w-4" />
                Notes from your Counselor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Thread */}
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {(rec?.messages ?? []).map((m) => (
                  <div key={m.id} className={`flex ${m.sender_role === 'teacher' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] rounded-lg px-3 py-2 text-sm break-words ${
                        m.sender_role === 'counselor'
                          ? 'bg-amber-100 border border-amber-300 text-amber-900'
                          : 'bg-slate-100 border border-slate-200 text-slate-800'
                      }`}
                    >
                      <p>{m.content}</p>
                      <p className="text-xs mt-1 text-amber-600">
                        {m.sender_role === 'counselor' ? 'Counselor' : 'You'} · {new Date(m.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply area */}
              <Textarea
                placeholder="Type a reply to your counselor…"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                rows={3}
                className="resize-none text-sm bg-white border-amber-200 focus:border-amber-400"
              />
              <Button
                size="sm"
                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                disabled={!replyContent.trim() || isReplying}
                onClick={handleReply}
              >
                {isReplying ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Send className="h-3 w-3 mr-2" />}
                Send Reply
              </Button>
              <p className="text-xs text-amber-700 text-center">
                You can also revise and resubmit your full draft using the editor below.
              </p>
            </CardContent>
          </Card>
        )}

        {/* About TPR — collapsible */}
        <Card className="border-violet-100 shadow-sm overflow-hidden">
          <button className="w-full text-left" onClick={() => setIntroExpanded(v => !v)}>
            <CardHeader className="pb-3 hover:bg-violet-50/60 transition-colors">
              <CardTitle className="flex items-center justify-between text-base text-violet-800">
                <span className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  About The Primrose Review
                </span>
                {introExpanded
                  ? <ChevronUp className="h-4 w-4 text-violet-400" />
                  : <ChevronDown className="h-4 w-4 text-violet-400" />
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
                Counselors oversee every step.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {[
                  {
                    icon: <Shield className="h-4 w-4 text-white" />,
                    label: "Ethical AI use",
                    desc: "Students guide the AI — not the other way around.",
                    gradient: "from-indigo-500 to-blue-500",
                    bg: "bg-indigo-50 border-indigo-100",
                  },
                  {
                    icon: <GraduationCap className="h-4 w-4 text-white" />,
                    label: "Counselor-led",
                    desc: "Every letter is reviewed before it reaches a university.",
                    gradient: "from-emerald-500 to-teal-500",
                    bg: "bg-emerald-50 border-emerald-100",
                  },
                  {
                    icon: <Sparkles className="h-4 w-4 text-white" />,
                    label: "Authentic voice",
                    desc: "AI as a tool, not a ghostwriter.",
                    gradient: "from-amber-500 to-orange-400",
                    bg: "bg-amber-50 border-amber-100",
                  },
                ].map(item => (
                  <div key={item.label} className={`rounded-xl border p-3 space-y-2 ${item.bg}`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-sm`}>
                        {item.icon}
                      </div>
                      <span className="font-semibold text-gray-800 text-sm">{item.label}</span>
                    </div>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Request intro */}
        <Card className="border-violet-200 shadow-sm bg-gradient-to-br from-violet-50 to-indigo-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-md shrink-0">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800 mb-1.5">
                  Recommendation Request for{" "}
                  <span className="text-violet-700">{rec?.student_name ?? "Student"}</span>
                </h1>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Hello <strong className="text-gray-700">{rec?.referee_name}</strong> —{" "}
                  {rec?.student_name ?? "this student"} has asked you to write a recommendation letter
                  as part of their college application through The Primrose Review. Below you'll find
                  the context they shared to help you write the letter. You can write it yourself or
                  use the <strong>AI Draft</strong> tool as a starting point — then personalise it
                  before submitting.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Student context */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-gray-800">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              Student's Context
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">

            {contextFields.map(field =>
              field.value ? (
                <div key={field.key} className={`rounded-xl px-4 py-3 ${field.bg}`}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={`w-2 h-2 rounded-full ${field.dot} shrink-0`} />
                    <p className={`font-semibold text-xs uppercase tracking-wide ${field.label_color}`}>
                      {field.label}
                    </p>
                  </div>
                  <p className="text-gray-800 pl-3.5">{field.value}</p>
                </div>
              ) : null
            )}

            {rec?.strengths && rec.strengths.length > 0 && (
              <div className="rounded-xl bg-purple-50 border border-purple-100 px-4 py-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="w-2 h-2 rounded-full bg-purple-400 shrink-0" />
                  <p className="font-semibold text-xs uppercase tracking-wide text-purple-500">
                    Strengths they highlighted
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5 pl-3.5">
                  {rec.strengths.map(s => (
                    <span
                      key={s}
                      className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 border border-purple-200 text-xs font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {rec?.personal_notes && (
              <div className="rounded-xl bg-rose-50 border border-rose-100 px-4 py-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Heart className="h-3 w-3 text-rose-400 shrink-0" />
                  <p className="font-semibold text-xs uppercase tracking-wide text-rose-500">
                    Personal note from student
                  </p>
                </div>
                <p className="text-gray-700 italic pl-4">"{rec.personal_notes}"</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Draft — gradient card like ParentPortal's AI Insights */}
        <Card className="border-2 border-violet-200 shadow-sm bg-gradient-to-br from-violet-50 via-white to-indigo-50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-base text-gray-800">AI-Assisted Draft</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Powered by The Primrose Review</p>
              </div>
              <span className="ml-auto text-xs font-semibold px-2.5 py-1 rounded-full bg-violet-100 text-violet-700 border border-violet-200">
                AI Tool
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-500">
              Not sure where to start? Let AI generate a first draft based on the student's answers above.
              It will be written in your voice as{" "}
              <strong className="text-gray-700">{rec?.referee_name}</strong>
              {rec?.referee_role ? ` (${rec.referee_role})` : ""}. Edit freely before submitting.
            </p>

            {/* Teacher questions */}
            <div className="space-y-4 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
              <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
                A few quick questions to personalise the draft
              </p>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Can you give us an example of how — in an extracurricular, your field, or the classroom — this student made you proud?{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <Textarea
                  value={teacherQ1}
                  onChange={e => setTeacherQ1(e.target.value)}
                  placeholder="e.g. During the robotics competition they stayed late every night for two weeks and rallied the whole team when morale was low…"
                  rows={3}
                  className="resize-none border-indigo-200 focus:border-indigo-400 focus:ring-indigo-400 text-sm bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Describe a situation in class or at school you would like to highlight about this student.{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <Textarea
                  value={teacherQ2}
                  onChange={e => setTeacherQ2(e.target.value)}
                  placeholder="e.g. They asked the most thoughtful question during our unit on climate policy — one that even made me rethink my own perspective…"
                  rows={3}
                  className="resize-none border-indigo-200 focus:border-indigo-400 focus:ring-indigo-400 text-sm bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Anything else about this student you would like to include?{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <Textarea
                  value={teacherQ3}
                  onChange={e => setTeacherQ3(e.target.value)}
                  placeholder="e.g. They volunteer at the local shelter on weekends and have a remarkable ability to connect with people from all walks of life…"
                  rows={3}
                  className="resize-none border-indigo-200 focus:border-indigo-400 focus:ring-indigo-400 text-sm bg-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Additional notes for the AI{" "}
                <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <Textarea
                value={teacherPrompt}
                onChange={e => setTeacherPrompt(e.target.value)}
                placeholder="e.g. Focus on their leadership during the science fair, mention their curiosity and how they handled setbacks…"
                rows={3}
                className="resize-none border-violet-200 focus:border-violet-400 focus:ring-violet-400 text-sm bg-white"
              />
              <p className="text-xs text-gray-400">
                Any extra direction for the AI — combined with your answers above and the student's context.
              </p>
            </div>

            <Button
              onClick={handleGenerateAI}
              disabled={isGenerating || !hasStudentAnswers}
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-sm border-0"
            >
              {isGenerating ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" />Bear with us, please…</>
              ) : (
                <><Sparkles className="h-4 w-4 mr-2" />Generate AI Draft</>
              )}
            </Button>

            {!hasStudentAnswers && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200">
                <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                <p className="text-xs text-amber-700">
                  The student hasn't completed their questionnaire yet — AI draft available once they do.
                </p>
              </div>
            )}
            <p className="text-xs text-center text-gray-400">
              The AI uses only the information the student provided. Nothing is added or invented.
            </p>
          </CardContent>
        </Card>

        {/* Draft editor */}
        <Card className="border-blue-100 shadow-sm bg-gradient-to-br from-blue-50/40 via-white to-indigo-50/40">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-sm">
                <Award className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-base text-gray-800">Write Your Recommendation Letter</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-500">
              Write or paste your letter below. You can use the AI draft above as a starting point.
              The counselor will review everything before sending to the university.
            </p>
            <Textarea
              value={draft}
              onChange={e => setDraft(e.target.value)}
              placeholder={"To Whom It May Concern,\n\nIt is my great pleasure to recommend…"}
              rows={18}
              className="font-serif text-sm resize-none border-blue-200 focus:border-blue-400 focus:ring-blue-400 bg-white"
            />

            {/* Submit button */}
            <Button
              onClick={handleSubmit}
              disabled={submitting || !draft.trim()}
              className="w-full bg-gradient-to-r from-purple-700 via-violet-700 to-indigo-700 hover:from-purple-800 hover:via-violet-800 hover:to-indigo-800 text-white shadow-md border-0"
              size="lg"
            >
              {submitting
                ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Submitting…</>
                : <><Send className="h-4 w-4 mr-2" />Submit Draft to Counselor</>
              }
            </Button>

            {/* Trust signals */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              {[
                { icon: <Shield className="h-3.5 w-3.5" />, text: "Secure", color: "text-indigo-600 bg-indigo-50 border-indigo-100" },
                { icon: <Zap className="h-3.5 w-3.5" />,    text: "Instant delivery", color: "text-amber-600 bg-amber-50 border-amber-100" },
                { icon: <Clock className="h-3.5 w-3.5" />,   text: "Editable on request", color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
              ].map(item => (
                <div key={item.text} className={`flex items-center justify-center gap-1.5 rounded-lg border px-2 py-1.5 text-xs font-medium ${item.color}`}>
                  {item.icon}
                  {item.text}
                </div>
              ))}
            </div>

            <p className="text-xs text-center text-gray-400">
              Once submitted you won't be able to edit your draft. Contact the counselor if changes are needed.
            </p>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center pb-6 space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100 border border-violet-200 text-violet-700 text-sm font-medium">
            <GraduationCap className="h-4 w-4" />
            The Primrose Review
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
