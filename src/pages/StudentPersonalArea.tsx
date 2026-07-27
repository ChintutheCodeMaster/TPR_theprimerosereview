import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  PageShell,
  PageHeader,
  HairlineCard,
  BlurOrb,
} from "@/components/primrose-night";
import { useStudentPersonalArea, type EssayFeedback } from "@/hooks/useStudentPersonalArea.ts";
import { StudentActionItemsSection } from "@/components/StudentActionItemsSection";
import type { TrackedChange } from "@/components/EssayFeedbackModal";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus, GraduationCap } from "lucide-react";
import { useApplications } from "@/hooks/useApplications";
import { supabase } from "@/integrations/supabase/client";
import { ApplicationDetailModal } from "@/components/ApplicationDetailModal";
import jsPDF from "jspdf";
import type { ApplicationWithProfile } from "@/hooks/useApplications";

import {
  FileText,
  Upload,
  MessageSquare,
  CheckCircle,
  Clock,
  Calendar,
  Star,
  AlertCircle,
  TrendingUp,
  MessageCircle,
  Loader2,
  Strikethrough,
} from "lucide-react";

// ── Helpers ───────────────────────────────────────────────────

const getStatusColor = (status: string) => {
  switch (status) {
    case "approved":    return "bg-[color:var(--pn-sage)]/15 text-[color:var(--pn-sage)] hairline";
    case "sent":        return "bg-[color:var(--pn-pink)]/15 text-[color:var(--pn-pink)] hairline";
    case "review":      return "bg-[color:var(--pn-gold)]/15 text-[color:var(--pn-gold)] hairline";
    case "in_progress": return "bg-[color:var(--pn-gold)]/15 text-[color:var(--pn-gold)] hairline";
    case "draft":       return "bg-white/[0.06] text-foreground/80 hairline";
    case "completed":   return "bg-[color:var(--pn-sage)]/15 text-[color:var(--pn-sage)] hairline";
    case "in-progress": return "bg-[color:var(--pn-gold)]/15 text-[color:var(--pn-gold)] hairline";
    case "not-started": return "bg-white/[0.03] text-muted-foreground hairline";
    default:            return "bg-white/[0.03] text-muted-foreground hairline";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "approved":
    case "sent":
    case "completed":   return <CheckCircle className="h-4 w-4" />;
    case "review":
    case "in_progress":
    case "in-progress": return <Clock className="h-4 w-4" />;
    case "draft":       return <FileText className="h-4 w-4" />;
    default:            return <AlertCircle className="h-4 w-4" />;
  }
};

const getStatusLabel = (status: string) => {
  if (status === "sent") return "Feedback Received";
  return status.replace(/-/g, " ").replace(/_/g, " ");
};

// ── Component ─────────────────────────────────────────────────

const StudentPersonalArea = () => {
  const navigate = useNavigate();
  const {
    essays,
    sentFeedback,
    isLoadingEssays,
    isLoadingFeedback,
    getFeedbackForEssay,
  } = useStudentPersonalArea();

  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab]         = useState(() => searchParams.get("tab") ?? "essays");
  const [selectedEssay, setSelectedEssay] = useState<EssayFeedback | null>(null);

  const { applications, isLoading: isLoadingApplications } = useApplications();
  const [selectedApplication, setSelectedApplication] = useState<ApplicationWithProfile | null>(null);

  // Live slot counts per application — avoids relying on stale DB columns
  // that a trigger overwrites whenever slots are added/removed.
  const [slotCounts, setSlotCounts] = useState<Record<string, { total: number; draft: number; inReview: number; sent: number; approved: number }>>({});

  const buildSlotCounts = (data: { application_id: string; status: string }[]) => {
    const counts: Record<string, { total: number; draft: number; inReview: number; sent: number; approved: number }> = {};
    for (const row of data) {
      if (!counts[row.application_id]) counts[row.application_id] = { total: 0, draft: 0, inReview: 0, sent: 0, approved: 0 };
      counts[row.application_id].total++;
      if (row.status === "draft")     counts[row.application_id].draft++;
      if (row.status === "in_review") counts[row.application_id].inReview++;
      if (row.status === "sent")      counts[row.application_id].sent++;
      if (row.status === "approved")  counts[row.application_id].approved++;
    }
    return counts;
  };

  useEffect(() => {
    if (applications.length === 0) return;
    supabase
      .from("application_essays")
      .select("application_id, status")
      .in("application_id", applications.map(a => a.id))
      .then(({ data }) => setSlotCounts(buildSlotCounts(data ?? [])));
  }, [applications]);

  const essayFeedback = selectedEssay
    ? getFeedbackForEssay(selectedEssay.essay_title)
    : [];

  // Collect all tracked changes from sent feedback for this essay
  const trackedChanges = useMemo((): TrackedChange[] => {
    return essayFeedback.flatMap(fb => fb.track_changes ?? []);
  }, [essayFeedback]);

  // Split essay into paragraphs with offsets
  const paragraphData = useMemo(() => {
    const content = selectedEssay?.essay_content ?? '';
    const lines = content.split('\n');
    let offset = 0;
    return lines.map((text, i) => {
      const start = offset;
      const end = offset + text.length;
      offset = end + 1;
      return { text, start, end, index: i };
    });
  }, [selectedEssay?.essay_content]);

  // Map paragraph index → tracked changes in that paragraph
  const paragraphChangeMap = useMemo(() => {
    const map = new Map<number, TrackedChange[]>();
    for (const change of trackedChanges) {
      for (const para of paragraphData) {
        if (change.startIndex >= para.start && change.startIndex <= para.end) {
          map.set(para.index, [...(map.get(para.index) ?? []), change]);
          break;
        }
      }
    }
    return map;
  }, [trackedChanges, paragraphData]);

  // Render a paragraph with tracked changes inline
  const renderParagraph = (paraText: string, paraStart: number, paraChanges: TrackedChange[]) => {
    if (!paraChanges.length) return <span>{paraText}</span>;
    const segments: JSX.Element[] = [];
    let lastIdx = 0;
    const sorted = [...paraChanges]
      .map(c => ({
        change: c,
        relStart: Math.max(0, c.startIndex - paraStart),
        relEnd: Math.min(paraText.length, c.endIndex - paraStart),
      }))
      .filter(a => a.relStart < a.relEnd)
      .sort((a, b) => a.relStart - b.relStart);

    for (const { change, relStart, relEnd } of sorted) {
      if (relStart < lastIdx) continue;
      if (relStart > lastIdx)
        segments.push(<span key={`pre-${change.id}`}>{paraText.slice(lastIdx, relStart)}</span>);
      segments.push(
        <span key={`tc-${change.id}`} className="inline">
          <del className="text-red-500 bg-red-50 line-through px-0.5 rounded-sm">{paraText.slice(relStart, relEnd)}</del>
          <ins className="text-green-700 bg-green-50 no-underline px-0.5 rounded-sm font-medium ml-0.5">{change.suggestedText}</ins>
        </span>
      );
      lastIdx = relEnd;
    }
    if (lastIdx < paraText.length)
      segments.push(<span key="rest">{paraText.slice(lastIdx)}</span>);
    return segments;
  };
  const handleDownloadEssay = (essay: EssayFeedback) => {
  const doc = new jsPDF();

  doc.setFontSize(14);
  doc.text(essay.essay_title, 10, 15);

  doc.setFontSize(10);
  doc.text(
    doc.splitTextToSize(essay.essay_content, 180),
    10,
    25
  );

  doc.save(`${essay.essay_title}.pdf`);
};

  // ── Render ────────────────────────────────────────────────
  return (
    <PageShell>
      <BlurOrb tone="sage" className="top-[-100px] left-[-120px] w-[480px] h-[480px]" />

      <PageHeader
        eyebrow="My work"
        title={<>Every draft you're carrying.</>}
        subtitle={<>Essays, tasks, applications — the roster only you can see.</>}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-white/[0.02] hairline p-1 h-auto">
          <TabsTrigger value="essays" className="data-[state=active]:bg-white/[0.06] data-[state=active]:text-foreground data-[state=active]:shadow-none text-muted-foreground">Essays</TabsTrigger>
          <TabsTrigger value="feedback" className="data-[state=active]:bg-white/[0.06] data-[state=active]:text-foreground data-[state=active]:shadow-none text-muted-foreground">Feedback</TabsTrigger>
          <TabsTrigger value="tasks" className="data-[state=active]:bg-white/[0.06] data-[state=active]:text-foreground data-[state=active]:shadow-none text-muted-foreground">Tasks</TabsTrigger>
          <TabsTrigger value="applications" className="data-[state=active]:bg-white/[0.06] data-[state=active]:text-foreground data-[state=active]:shadow-none text-muted-foreground">Applications</TabsTrigger>
        </TabsList>

        {/* ── Essays Tab ── */}
        <TabsContent value="essays" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-serif text-2xl text-foreground leading-tight">Your drafts.</h2>
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-2">In progress and finished</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => navigate('/personal-essay')} className="bg-transparent hairline hover:bg-white/[0.03] text-foreground shadow-none">
                <Upload className="h-4 w-4 mr-2" />
                Upload Personal Essay
              </Button>
            </div>
          </div>

          {isLoadingEssays ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : essays.length === 0 ? (
            <HairlineCard variant="pink" className="p-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
              <p className="font-serif italic text-muted-foreground">Nothing by that name — yet.</p>
            </HairlineCard>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
              className="grid gap-4"
            >
              {essays.map((essay) => (
                <motion.div
                  key={essay.id}
                  variants={{
                    hidden: { opacity: 0, y: 8, filter: 'blur(4px)' },
                    visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.4, ease: [0.2, 0.6, 0.2, 1] } }
                  }}
                >
                  <HairlineCard
                    className="cursor-pointer hover:bg-white/[0.03] transition-colors"
                    onClick={() => setSelectedEssay(essay)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-serif text-lg text-foreground leading-tight">{essay.essay_title}</h3>
                        {essay.essay_prompt && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {essay.essay_prompt}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0 ml-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${getStatusColor(essay.status)}`}>
                          {getStatusIcon(essay.status)}
                          <span className="capitalize">{getStatusLabel(essay.status)}</span>
                        </span>
                        {essay.status === "sent" && (
                          <span className="text-[10px] text-[color:var(--pn-pink)]">(check feedback below)</span>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Word Count</p>
                        <p className="num-display text-foreground mt-1">{essay.essay_content.split(/\s+/).filter(Boolean).length}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Submitted</p>
                        <p className="text-foreground mt-1">
                          {new Date(essay.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Feedback</p>
                        <p className="text-foreground mt-1">
                          {essay.status === "sent" || essay.status === "read"
                            ? "Available"
                            : "Pending"}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      {essay.status === "draft" ? (
                        <Button
                          size="sm"
                          className="bg-transparent hairline hover:bg-white/[0.04] text-[color:var(--pn-pink)] shadow-none"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(essay.target_school
                              ? `/submit-essay?draftId=${essay.id}`
                              : `/personal-essay?draftId=${essay.id}`);
                          }}
                        >
                          Continue Writing
                        </Button>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="hairline hover:bg-white/[0.03] text-foreground"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEssay(essay);
                            }}
                          >
                            View Details
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="hairline hover:bg-white/[0.03] text-foreground"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadEssay(essay);
                            }}
                          >
                            Download
                          </Button>
                        </>
                      )}
                    </div>
                  </HairlineCard>
                </motion.div>
              ))}
            </motion.div>
          )}
        </TabsContent>

        {/* ── Feedback Tab ── */}
        <TabsContent value="feedback" className="space-y-6">
          <div>
            <h2 className="font-serif text-2xl text-foreground leading-tight">What they said.</h2>
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-2">Comments, scores, suggested edits</p>
          </div>

          {isLoadingFeedback ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : sentFeedback.length === 0 ? (
            <HairlineCard variant="sage" className="p-12 text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
              <p className="font-serif italic text-muted-foreground">No AI analysis yet — run one from an essay draft.</p>
            </HairlineCard>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
              className="space-y-4"
            >
              {sentFeedback.map((fb) => (
                <motion.div
                  key={fb.id}
                  variants={{
                    hidden: { opacity: 0, y: 8, filter: 'blur(4px)' },
                    visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.4, ease: [0.2, 0.6, 0.2, 1] } }
                  }}
                >
                  <HairlineCard>
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="h-5 w-5 text-[color:var(--pn-gold)]" />
                      <h3 className="font-serif text-xl text-foreground">Essay Feedback</h3>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs hairline text-muted-foreground bg-white/[0.02]">{fb.essay_title}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-4">
                      Received{" "}
                      {fb.sent_at
                        ? new Date(fb.sent_at).toLocaleDateString()
                        : new Date(fb.created_at).toLocaleDateString()}
                    </p>

                    <div className="space-y-4">
                      {fb.personal_message && (
                        <div className="hairline bg-white/[0.02] p-3 rounded-lg">
                          <p className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--pn-pink)] mb-1">Personal Note</p>
                          <p className="text-sm text-foreground font-serif italic">{fb.personal_message}</p>
                        </div>
                      )}

                      {fb.ai_analysis?.overallScore && (
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-[color:var(--pn-gold)]" />
                          <span className="text-sm text-foreground">
                            Overall Score: <span className="num-display">{fb.ai_analysis.overallScore}</span>/100
                          </span>
                        </div>
                      )}

                      {(fb.ai_analysis?.strengths || fb.ai_analysis?.improvements) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {fb.ai_analysis.strengths && (
                            <div className="hairline bg-[color:var(--pn-sage)]/5 p-3 rounded-lg">
                              <h4 className="text-[10px] uppercase tracking-[0.18em] mb-2 text-[color:var(--pn-sage)]">
                                Strengths
                              </h4>
                              <ul className="text-sm space-y-1 text-foreground">
                                {fb.ai_analysis.strengths.map((s, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <CheckCircle className="h-3 w-3 text-[color:var(--pn-sage)] mt-0.5 shrink-0" />
                                    {s}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {fb.ai_analysis.improvements && (
                            <div className="hairline bg-[color:var(--pn-gold)]/5 p-3 rounded-lg">
                              <h4 className="text-[10px] uppercase tracking-[0.18em] mb-2 text-[color:var(--pn-gold)]">
                                Areas to Improve
                              </h4>
                              <ul className="text-sm space-y-1 text-foreground">
                                {fb.ai_analysis.improvements.map((s, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <TrendingUp className="h-3 w-3 text-[color:var(--pn-gold)] mt-0.5 shrink-0" />
                                    {s}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </HairlineCard>
                </motion.div>
              ))}
            </motion.div>
          )}
        </TabsContent>

        {/* ── Tasks Tab ── */}
        <TabsContent value="tasks" className="space-y-6">
          <StudentActionItemsSection />
        </TabsContent>

        {/* ── Applications Tab ── */}
        <TabsContent value="applications" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-serif text-2xl text-foreground leading-tight">Your list.</h2>
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-2">The names, weighted by deadline</p>
            </div>
            <Button
              onClick={() => navigate('/add-application')}
              className="bg-transparent hairline hover:bg-white/[0.03] text-foreground shadow-none"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Application
            </Button>
          </div>

          {isLoadingApplications ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : applications.length === 0 ? (
            <HairlineCard variant="gold" className="p-12 text-center">
              <GraduationCap className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
              <p className="font-serif italic text-muted-foreground mb-6">Nothing added yet.</p>
              <Button
                onClick={() => navigate('/add-application')}
                className="bg-transparent hairline hover:bg-white/[0.04] text-foreground shadow-none"
              >
                Add your first application
              </Button>
            </HairlineCard>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
              className="grid gap-4"
            >
              {applications.map((app) => {
                const pct = app.required_essays
                  ? Math.round((((slotCounts[app.id]?.approved ?? 0) + (slotCounts[app.id]?.inReview ?? 0) + (slotCounts[app.id]?.sent ?? 0)) / app.required_essays) * 100)
                  : 0
                const statusPillClass = (() => {
                  if (app.status === "sent") return "bg-[color:var(--pn-sage)]/15 text-[color:var(--pn-sage)]"
                  const c = slotCounts[app.id]
                  if (!c || c.total === 0) return "bg-white/[0.03] text-muted-foreground"
                  if (c.inReview > 0 || c.approved > 0) return "bg-[color:var(--pn-gold)]/15 text-[color:var(--pn-gold)]"
                  if (c.draft > 0) return "bg-white/[0.06] text-foreground/80"
                  return "bg-white/[0.03] text-muted-foreground"
                })()
                const statusLabel = (() => {
                  if (app.status === "sent") return "Submitted"
                  const c = slotCounts[app.id]
                  if (!c || c.total === 0) return "Not Started"
                  if (c.inReview > 0 || c.sent > 0 || c.approved > 0) return "In Progress"
                  if (c.draft > 0) return "In Draft"
                  return "Not Started"
                })()
                return (
                  <motion.div
                    key={app.id}
                    variants={{
                      hidden: { opacity: 0, y: 8, filter: 'blur(4px)' },
                      visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.4, ease: [0.2, 0.6, 0.2, 1] } }
                    }}
                  >
                    <HairlineCard
                      className="cursor-pointer hover:bg-white/[0.03] transition-colors"
                      onClick={() => setSelectedApplication(app as ApplicationWithProfile)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-serif text-lg text-foreground leading-tight">{app.school_name}</h3>
                          {app.program && (
                            <p className="text-sm text-muted-foreground mt-1">{app.program}</p>
                          )}
                          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1.5">
                              <Calendar className="h-3 w-3" />
                              Deadline: {new Date(app.deadline_date).toLocaleDateString()}
                            </span>
                            <span>
                              Essays: <span className="text-foreground">{(slotCounts[app.id]?.approved ?? 0) + (slotCounts[app.id]?.inReview ?? 0) + (slotCounts[app.id]?.sent ?? 0)}/{app.required_essays ?? 0}</span>
                            </span>
                            <span>
                              Recs: <span className="text-foreground">{app.recommendations_submitted}/{app.recommendations_requested}</span>
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0 ml-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs hairline ${statusPillClass}`}>
                            {statusLabel}
                          </span>
                          <span className="num-display text-lg text-foreground">
                            {pct}%
                          </span>
                          {app.urgent && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs hairline bg-[color:var(--pn-pink)]/15 text-[color:var(--pn-pink)]">
                              ⚠ Urgent
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="h-1 rounded-full bg-white/[0.05] overflow-hidden mt-3">
                        <motion.div
                          className="h-full"
                          style={{ background: 'var(--pn-sage)' }}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.9, ease: [0.2, 0.6, 0.2, 1], delay: 0.15 }}
                        />
                      </div>
                    </HairlineCard>
                  </motion.div>
                )
              })}
            </motion.div>
          )}
        </TabsContent>
        <ApplicationDetailModal
  application={selectedApplication}
  open={!!selectedApplication}
  onClose={() => {
    setSelectedApplication(null);
    // Re-fetch slot counts so the list updates after adding/removing slots
    if (applications.length > 0) {
      supabase
        .from("application_essays")
        .select("application_id, status")
        .in("application_id", applications.map(a => a.id))
        .then(({ data }) => setSlotCounts(buildSlotCounts(data ?? [])));
    }
  }}
/>
      </Tabs>

      {/* ── Essay Detail Modal ── */}
      <Dialog open={!!selectedEssay} onOpenChange={() => setSelectedEssay(null)}>
        <DialogContent className="max-w-[95vw] w-[1200px] h-[88vh] p-0 flex flex-col bg-pn-card">
          <DialogHeader className="px-6 py-4 hairline-b shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="font-serif text-2xl text-foreground leading-tight">{selectedEssay?.essay_title}</DialogTitle>
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-1">
                  {new Date(selectedEssay?.created_at ?? "").toLocaleDateString()}
                </p>
              </div>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${getStatusColor(selectedEssay?.status ?? "")}`}>
                {getStatusIcon(selectedEssay?.status ?? "")}
                <span className="capitalize">{getStatusLabel(selectedEssay?.status ?? "")}</span>
              </span>
            </div>
          </DialogHeader>

          <div className="flex-1 flex overflow-hidden">

            {/* ── Left sidebar: score + criteria ── */}
            {essayFeedback.some(fb => fb.ai_analysis?.overallScore) && (
              <div className="w-[140px] shrink-0 hairline-r flex flex-col gap-4 p-4 overflow-y-auto">
                {essayFeedback.map(fb => fb.ai_analysis?.overallScore ? (
                  <div key={fb.id}>
                    <div className="hairline bg-[color:var(--pn-gold)]/10 rounded-2xl p-3 text-center mb-3">
                      <Star className="h-4 w-4 text-[color:var(--pn-gold)] mx-auto mb-1" />
                      <div className="num-display text-2xl text-foreground">{fb.ai_analysis!.overallScore}</div>
                      <div className="text-[10px] text-muted-foreground">/100</div>
                    </div>
                    {Array.isArray(fb.ai_analysis?.criteria) && fb.ai_analysis!.criteria.map((c: any) => (
                      <div key={c.id} className="space-y-1 mb-2">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                          <span className="text-[10px] text-muted-foreground truncate">{c.name?.split(' & ')[0]}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="h-1.5 rounded-full bg-white/[0.05] flex-1 overflow-hidden">
                            <div className="h-full" style={{ width: `${c.score}%`, backgroundColor: c.color }} />
                          </div>
                          <span className="num-display text-[10px] w-5 text-right text-foreground">{c.score}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null)}
              </div>
            )}

            {/* ── Center: essay with tracked changes ── */}
            <div className="flex-1 flex flex-col min-w-0 hairline-r">
              {selectedEssay?.essay_prompt && (
                <div className="px-5 py-3 hairline-b bg-white/[0.02] shrink-0">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Prompt</p>
                  <p className="text-xs mt-1 text-foreground font-serif italic">{selectedEssay.essay_prompt}</p>
                </div>
              )}
              {trackedChanges.length > 0 && (
                <div className="px-5 py-2 hairline-b bg-white/[0.015] shrink-0">
                  <p className="text-xs text-muted-foreground">
                    Suggested edits shown inline —{" "}
                    <del className="text-[color:var(--pn-pink)]">original</del>{" "}
                    <ins className="text-[color:var(--pn-sage)] no-underline">replacement</ins>
                  </p>
                </div>
              )}
              <ScrollArea className="flex-1">
                <div className="p-6">
                  {selectedEssay?.essay_content ? (
                    <div className="space-y-0 font-serif text-base leading-relaxed text-foreground max-w-[68ch]">
                      {paragraphData.map((para) => {
                        const paraChanges = paragraphChangeMap.get(para.index) ?? [];
                        return (
                          <div key={para.index} className="min-h-[1.5em]">
                            <div>
                              {para.text.trim() === ''
                                ? <span>&nbsp;</span>
                                : renderParagraph(para.text, para.start, paraChanges)
                              }
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-40" />
                      <p className="font-serif italic">No content yet.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* ── Right: feedback panel ── */}
            <div className="w-[320px] shrink-0 flex flex-col">
              <div className="px-4 py-3 hairline-b bg-white/[0.015] shrink-0">
                <h3 className="text-sm font-serif text-foreground flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-[color:var(--pn-pink)]" />
                  AI Feedback
                </h3>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-3 space-y-3">
                  {essayFeedback.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <MessageCircle className="h-10 w-10 mx-auto mb-3 opacity-40" />
                      <p className="font-serif italic text-sm">No AI analysis yet.</p>
                    </div>
                  ) : (
                    essayFeedback.map((fb) => (
                      <div key={fb.id} className="space-y-2">
                        {fb.personal_message && (
                          <div className="hairline bg-white/[0.02] p-3 rounded-xl">
                            <p className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--pn-pink)] mb-1">Note</p>
                            <p className="text-xs text-foreground font-serif italic">{fb.personal_message}</p>
                          </div>
                        )}
                        {fb.track_changes?.length > 0 && (
                          <div className="rounded-xl hairline p-3 space-y-2 bg-white/[0.02]">
                            <p className="text-xs flex items-center gap-1.5 text-foreground">
                              <Strikethrough className="h-3.5 w-3.5" />
                              Suggested Edits ({fb.track_changes.length})
                            </p>
                            {fb.track_changes.map((change) => (
                              <div key={change.id} className="space-y-0.5 text-xs hairline-t pt-1.5">
                                <del className="text-[color:var(--pn-pink)] line-through block">{change.originalText}</del>
                                <ins className="text-[color:var(--pn-sage)] no-underline block">{change.suggestedText}</ins>
                              </div>
                            ))}
                          </div>
                        )}
                        {fb.feedback_items.map((item, idx) => (
                          <div key={item.id ?? idx} className="p-2.5 rounded-xl hairline bg-white/[0.02] space-y-0.5">
                            {item.criterionName && (
                              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{item.criterionName}</p>
                            )}
                            <p className="text-xs leading-snug text-foreground">{item.text}</p>
                          </div>
                        ))}
                        <p className="text-[10px] text-muted-foreground text-right pt-1">
                          {fb.sent_at ? new Date(fb.sent_at).toLocaleDateString() : 'Recently'}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>

          <div className="p-4 hairline-t flex gap-2">
            <Button
              className="flex-1 bg-transparent hairline hover:bg-white/[0.04] text-foreground shadow-none"
              onClick={() => {
                const id = selectedEssay?.id;
                setSelectedEssay(null);
                navigate(`/edit-essay?id=${id}`);
              }}
            >
              <FileText className="h-4 w-4 mr-2" />
              Edit Essay
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
};

export default StudentPersonalArea;