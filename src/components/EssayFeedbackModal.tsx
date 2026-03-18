import { useState, useEffect, useMemo, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Star,
  Plus,
  Save,
  Send,
  Loader2,
  AlertTriangle,
  X,
  Pencil,
  Eye,
  ArrowLeft,
  History,
  MessageCircle,
} from "lucide-react";

interface AnalysisIssue {
  id: string;
  criterionId: string;
  criterionName: string;
  color: string;
  startIndex: number;
  endIndex: number;
  highlightedText: string;
  problemType: string;
  problemDescription: string;
  recommendation: string;
  severity: 'low' | 'medium' | 'high';
}

interface CriterionScore {
  id: string;
  name: string;
  score: number;
  color: string;
}

interface AnalysisResult {
  overallScore: number;
  criteria: CriterionScore[];
  issues: AnalysisIssue[];
}

interface FeedbackItem {
  id: string;
  text: string;
  source: 'ai' | 'manual';
  criterionName?: string;
  color?: string;
}

interface HistoryEntry {
  id: string;
  version: number;
  feedback_items: FeedbackItem[];
  manual_notes: string | null;
  personal_message: string | null;
  status: string;
  created_at: string;
}

interface Essay {
  id: string;
  title: string;
  studentName: string;
  studentId?: string;
  prompt: string;
  content: string;
}

interface EssayFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  essay: Essay;
}

export const EssayFeedbackModal = ({ isOpen, onClose, essay }: EssayFeedbackModalProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([]);
  const [manualNote, setManualNote] = useState("");
  const [personalMessage, setPersonalMessage] = useState("");
  const [hoveredCommentId, setHoveredCommentId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const { toast } = useToast();
  const commentRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const essayContent = essay.content;

  useEffect(() => {
    if (isOpen) {
      const init = async () => {
        const alreadyAnalyzed = await loadExistingFeedback();
        if (!alreadyAnalyzed) {
          analyzeEssay();
        }
      };
      init();
    }
  }, [isOpen]);

  // Scroll the right-panel comment card into view when hovering a margin icon
  useEffect(() => {
    if (hoveredCommentId && commentRefs.current[hoveredCommentId]) {
      commentRefs.current[hoveredCommentId]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [hoveredCommentId]);

  const loadExistingFeedback = async () => {
    try {
      const { data, error } = await supabase
        .from('essay_feedback')
        .select('feedback_items, manual_notes, personal_message, ai_analysis')
        .eq('id', essay.id)
        .single();

      if (error) throw error;

      if (data) {
        setFeedbackItems((data.feedback_items as unknown as FeedbackItem[]) || []);
        setManualNote(data.manual_notes || "");
        setPersonalMessage(data.personal_message || "");

        if (data.ai_analysis) {
          setAnalysis(data.ai_analysis as unknown as AnalysisResult);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error("Error loading existing feedback:", error);
      return false;
    }
  };

  const loadHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from('essay_feedback_history')
        .select('*')
        .eq('essay_id', essay.id)
        .order('version', { ascending: false });

      if (error) throw error;
      setHistory((data || []) as unknown as HistoryEntry[]);
    } catch (error) {
      console.error("Error loading history:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const analyzeEssay = async () => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-essay', {
        body: { essayContent, prompt: essay.prompt }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setAnalysis(data);
      toast({
        title: "Analysis Complete",
        description: `Found ${data.issues.length} areas for improvement`,
      });
    } catch (error) {
      console.error("Analysis error — continuing without AI:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const addToFeedback = (issue: AnalysisIssue) => {
    const exists = feedbackItems.some(item => item.id === issue.id);
    if (exists) {
      toast({ title: "Already Added", description: "This issue is already in your feedback" });
      return;
    }
    setFeedbackItems(prev => [...prev, {
      id: issue.id,
      text: `[${issue.problemType}] ${issue.problemDescription} Recommendation: ${issue.recommendation}`,
      source: 'ai',
      criterionName: issue.criterionName,
      color: issue.color,
    }]);
    toast({ title: "Added to Feedback" });
  };

  const addManualNote = () => {
    if (!manualNote.trim()) return;
    setFeedbackItems(prev => [...prev, {
      id: `manual-${Date.now()}`,
      text: manualNote,
      source: 'manual',
    }]);
    setManualNote("");
  };

  const removeFeedbackItem = (id: string) => {
    setFeedbackItems(prev => prev.filter(item => item.id !== id));
  };

  const saveFeedback = async (status: 'draft' | 'in_progress' | 'sent') => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { count } = await supabase
        .from('essay_feedback_history')
        .select('*', { count: 'exact', head: true })
        .eq('essay_id', essay.id);

      const nextVersion = (count ?? 0) + 1;

      const { error: updateError } = await supabase
        .from('essay_feedback')
        .update({
          feedback_items: JSON.parse(JSON.stringify(feedbackItems)),
          manual_notes: manualNote || null,
          personal_message: personalMessage || null,
          ai_analysis: analysis ? JSON.parse(JSON.stringify(analysis)) : null,
          status,
          sent_at: status === 'sent' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', essay.id);

      if (updateError) throw updateError;

      const { error: historyError } = await supabase
        .from('essay_feedback_history')
        .insert({
          essay_id: essay.id,
          student_id: essay.studentId,
          counselor_id: user.id,
          version: nextVersion,
          feedback_items: JSON.parse(JSON.stringify(feedbackItems)),
          manual_notes: manualNote || null,
          personal_message: personalMessage || null,
          ai_analysis: analysis ? JSON.parse(JSON.stringify(analysis)) : null,
          status,
          sent_at: status === 'sent' ? new Date().toISOString() : null,
        });

      if (historyError) throw historyError;

      toast({
        title: status === 'sent' ? "Feedback Sent!" : "Draft Saved",
        description: status === 'sent'
          ? "Feedback has been sent to the student"
          : `Saved as version ${nextVersion}`,
      });

      if (status === 'sent') {
        try {
          const [{ data: studentProfile }, { data: counselorProfile }] = await Promise.all([
            supabase.from('profiles').select('email').eq('user_id', essay.studentId ?? '').maybeSingle(),
            supabase.from('profiles').select('full_name').eq('user_id', user.id).maybeSingle(),
          ]);

          const { data: { session } } = await supabase.auth.getSession();
          await fetch(
            "https://fkvfngdwblbalrompzdj.supabase.co/functions/v1/send-counselor-feedback",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session?.access_token}`,
              },
              body: JSON.stringify({
                studentEmail: studentProfile?.email || 'no-email@unknown.com',
                studentName: essay.studentName,
                counselorName: counselorProfile?.full_name || 'Your counselor',
                essayLabel: essay.title,
                personalMessage: personalMessage || '',
                appUrl: window.location.origin,
              }),
            }
          );
        } catch (notifyError) {
          console.error('Failed to send feedback notification:', notifyError);
        }
        onClose();
      }
    } catch (error) {
      console.error("Save error:", error);
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Could not save feedback",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const restoreVersion = (entry: HistoryEntry) => {
    setFeedbackItems(entry.feedback_items || []);
    setManualNote(entry.manual_notes || "");
    setPersonalMessage(entry.personal_message || "");
    setShowHistory(false);
    toast({ title: `Restored version ${entry.version}` });
  };

  // ── Paragraph splitting ─────────────────────────────────────
  const paragraphData = useMemo(() => {
    const lines = essayContent.split('\n');
    let offset = 0;
    return lines.map((text, i) => {
      const start = offset;
      const end = offset + text.length;
      offset = end + 1; // +1 for \n
      return { text, start, end, index: i };
    });
  }, [essayContent]);

  // Map paragraph index → issues that start in that paragraph
  const paragraphIssueMap = useMemo(() => {
    const map = new Map<number, AnalysisIssue[]>();
    if (!analysis?.issues) return map;
    for (const issue of analysis.issues) {
      for (const para of paragraphData) {
        if (issue.startIndex >= para.start && issue.startIndex <= para.end) {
          map.set(para.index, [...(map.get(para.index) ?? []), issue]);
          break;
        }
      }
    }
    return map;
  }, [analysis?.issues, paragraphData]);

  // Render a single paragraph with inline highlights
  const renderParagraphContent = (paraText: string, paraStart: number, paraIssues: AnalysisIssue[]) => {
    if (!paraIssues.length) return <span>{paraText}</span>;

    const segments: JSX.Element[] = [];
    let lastIdx = 0;

    const adjusted = paraIssues
      .map(issue => ({
        issue,
        relStart: Math.max(0, issue.startIndex - paraStart),
        relEnd: Math.min(paraText.length, issue.endIndex - paraStart),
      }))
      .filter(a => a.relStart < a.relEnd)
      .sort((a, b) => a.relStart - b.relStart);

    for (const { issue, relStart, relEnd } of adjusted) {
      if (relStart > lastIdx) {
        segments.push(<span key={`pre-${issue.id}`}>{paraText.slice(lastIdx, relStart)}</span>);
      }
      const isActive = hoveredCommentId === issue.id;
      segments.push(
        <span
          key={`hl-${issue.id}`}
          className="cursor-pointer px-0.5 rounded transition-all"
          style={{
            backgroundColor: `${issue.color}${isActive ? '55' : '25'}`,
            borderBottom: `2px solid ${issue.color}`,
            outline: isActive ? `2px solid ${issue.color}` : undefined,
            outlineOffset: '1px',
          }}
          onMouseEnter={() => setHoveredCommentId(issue.id)}
          onMouseLeave={() => setHoveredCommentId(null)}
        >
          {paraText.slice(relStart, relEnd)}
        </span>
      );
      lastIdx = relEnd;
    }

    if (lastIdx < paraText.length) {
      segments.push(<span key="rest">{paraText.slice(lastIdx)}</span>);
    }

    return segments;
  };

  // ── History Panel ──────────────────────────────────────────
  if (showHistory) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-[700px] h-[80vh] p-0 flex flex-col">
          <DialogHeader className="p-6 pb-0">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowHistory(false)}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Editor
              </Button>
              <DialogTitle>Feedback History — {essay.title}</DialogTitle>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 p-6">
            {isLoadingHistory ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <History className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p>No feedback history yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((entry) => (
                  <Card key={entry.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Version {entry.version}</Badge>
                          <Badge variant={entry.status === 'sent' ? 'default' : 'secondary'}>
                            {entry.status}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(entry.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {entry.personal_message && (
                        <div className="p-2 bg-primary/10 rounded text-sm">
                          <span className="font-medium text-primary text-xs">Personal Message: </span>
                          {entry.personal_message}
                        </div>
                      )}
                      {entry.manual_notes && (
                        <div className="p-2 bg-muted rounded text-sm">
                          <span className="font-medium text-xs">Notes: </span>
                          {entry.manual_notes}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground">
                        {entry.feedback_items?.length ?? 0} feedback items
                      </div>
                      <Button size="sm" variant="outline" className="w-full" onClick={() => restoreVersion(entry)}>
                        Restore this version
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    );
  }

  // ── Preview Mode ───────────────────────────────────────────
  if (showPreview) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-[800px] h-[80vh] p-0 flex flex-col">
          <DialogHeader className="p-6 pb-0">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowPreview(false)}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Edit
              </Button>
              <DialogTitle>Preview Feedback for {essay.studentName}</DialogTitle>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              <div className="text-center pb-4 border-b">
                <h2 className="text-xl font-bold">{essay.title}</h2>
                <p className="text-muted-foreground">Feedback from your counselor</p>
                {analysis && (
                  <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                    <Star className="h-5 w-5 text-primary" />
                    <span className="font-bold text-lg">{analysis.overallScore}/100</span>
                  </div>
                )}
              </div>

              {personalMessage && (
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-4">
                    <p className="text-sm font-medium text-primary mb-2">Personal Note:</p>
                    <p className="text-foreground">{personalMessage}</p>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader><CardTitle className="text-sm">Detailed Feedback</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {feedbackItems.map((item) => (
                    <div key={item.id} className="p-3 rounded-lg border">
                      <div className="flex items-start gap-2">
                        {item.color && (
                          <div className="w-3 h-3 rounded-full mt-1 flex-shrink-0" style={{ backgroundColor: item.color }} />
                        )}
                        <div>
                          {item.criterionName && (
                            <span className="text-xs font-medium text-muted-foreground">{item.criterionName}</span>
                          )}
                          <p className="text-sm">{item.text}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {analysis?.criteria && (
                <Card>
                  <CardHeader><CardTitle className="text-sm">Score Breakdown</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {analysis.criteria.map((criterion) => (
                      <div key={criterion.id} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>{criterion.name}</span>
                          <span className="font-medium">{criterion.score}/100</span>
                        </div>
                        <Progress value={criterion.score} className="h-2" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>

          <div className="p-4 border-t flex gap-2">
            <Textarea
              placeholder="Add a personal message to the student (optional)..."
              value={personalMessage}
              onChange={(e) => setPersonalMessage(e.target.value)}
              className="flex-1 resize-none"
              rows={2}
            />
            <div className="flex flex-col gap-2">
              <Button variant="outline" onClick={() => saveFeedback('draft')} disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              </Button>
              <Button onClick={() => saveFeedback('sent')} disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // ── Main Editor ────────────────────────────────────────────
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] w-[1400px] h-[90vh] p-0 flex flex-col">

        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg">
              {essay.title} — {essay.studentName}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => { loadHistory(); setShowHistory(true); }}>
                <History className="h-3.5 w-3.5 mr-1.5" />History
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowPreview(true)}>
                <Eye className="h-3.5 w-3.5 mr-1.5" />Preview
              </Button>
              <Button variant="outline" size="sm" onClick={() => saveFeedback('draft')} disabled={isSaving}>
                {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Save className="h-3.5 w-3.5 mr-1.5" />}
                Save Draft
              </Button>
              <Button size="sm" onClick={() => saveFeedback('sent')} disabled={isSaving}>
                {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Send className="h-3.5 w-3.5 mr-1.5" />}
                Send to Student
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="flex-1 flex overflow-hidden">

          {/* ── Left sidebar: AI scores ── */}
          <div className="w-[150px] shrink-0 border-r flex flex-col gap-4 p-4 overflow-y-auto">
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
              <CardHeader className="p-3 pb-1">
                <CardTitle className="text-xs flex items-center gap-1.5">
                  <Star className="h-3.5 w-3.5 text-primary" />AI Score
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                {isAnalyzing
                  ? <Loader2 className="h-7 w-7 animate-spin mx-auto text-primary" />
                  : <div className="text-3xl font-bold text-center text-primary">{analysis?.overallScore ?? '—'}</div>
                }
              </CardContent>
            </Card>

            {analysis?.issues && (
              <Card>
                <CardHeader className="p-3 pb-1">
                  <CardTitle className="text-xs flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3 text-warning" />Issues
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="text-2xl font-bold text-center text-warning">{analysis.issues.length}</div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="p-3 pb-1">
                <CardTitle className="text-xs">Criteria</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 space-y-2">
                {isAnalyzing
                  ? [1,2,3,4,5].map(i => <div key={i} className="h-7 bg-muted animate-pulse rounded" />)
                  : analysis?.criteria
                    ? analysis.criteria.map((c) => (
                        <div key={c.id} className="space-y-1">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                            <span className="text-[10px] text-muted-foreground truncate">{c.name.split(' & ')[0]}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Progress value={c.score} className="h-1.5 flex-1" />
                            <span className="text-[10px] font-medium w-5 text-right">{c.score}</span>
                          </div>
                        </div>
                      ))
                    : <p className="text-xs text-muted-foreground text-center py-2">No analysis</p>
                }
              </CardContent>
            </Card>
          </div>

          {/* ── Center: Essay with margin comment icons ── */}
          <div className="flex-1 flex flex-col min-w-0 border-r">
            <div className="px-4 py-2 border-b bg-muted/30 shrink-0">
              <p className="text-xs text-muted-foreground">
                {isAnalyzing
                  ? "Analyzing essay…"
                  : analysis
                    ? "Hover highlighted text or click 💬 icons in the margin to see comments"
                    : "Essay content"}
              </p>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-6">
                {isAnalyzing ? (
                  <div className="flex items-center justify-center h-40">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-2" />
                      <p className="text-sm text-muted-foreground">Analyzing essay...</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-0">
                    {paragraphData.map((para) => {
                      const paraIssues = paragraphIssueMap.get(para.index) ?? [];
                      const isEmpty = para.text.trim() === '';
                      return (
                        <div key={para.index} className="flex gap-2 group/para min-h-[1.5em]">
                          {/* Paragraph text */}
                          <div className="flex-1 text-sm leading-relaxed text-foreground">
                            {isEmpty
                              ? <span>&nbsp;</span>
                              : renderParagraphContent(para.text, para.start, paraIssues)
                            }
                          </div>
                          {/* Margin icons */}
                          <div className="w-6 shrink-0 flex flex-col items-center gap-0.5 pt-0.5">
                            {paraIssues.map((issue) => (
                              <button
                                key={issue.id}
                                className="opacity-0 group-hover/para:opacity-100 transition-opacity rounded-full p-0.5 hover:bg-muted"
                                style={{ color: issue.color }}
                                onMouseEnter={() => setHoveredCommentId(issue.id)}
                                onMouseLeave={() => setHoveredCommentId(null)}
                                title={issue.problemType}
                              >
                                <MessageCircle className="h-3.5 w-3.5 fill-current" />
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* ── Right panel: Comments + Feedback draft ── */}
          <div className="w-[320px] shrink-0 flex flex-col">

            {/* AI Comments */}
            <div className="flex-1 flex flex-col min-h-0 border-b">
              <div className="px-4 py-2 border-b bg-muted/30 shrink-0">
                <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <MessageCircle className="h-3.5 w-3.5" />
                  Comments ({analysis?.issues?.length ?? 0})
                </p>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-3 space-y-2">
                  {isAnalyzing ? (
                    [1,2,3].map(i => <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />)
                  ) : !analysis?.issues?.length ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      <p className="text-xs">No AI comments yet</p>
                    </div>
                  ) : (
                    analysis.issues.map((issue) => {
                      const isActive = hoveredCommentId === issue.id;
                      const isAdded = feedbackItems.some(f => f.id === issue.id);
                      return (
                        <div
                          key={issue.id}
                          ref={el => { commentRefs.current[issue.id] = el; }}
                          className="rounded-xl border p-3 space-y-1.5 transition-all cursor-default"
                          style={{
                            borderColor: isActive ? issue.color : undefined,
                            backgroundColor: isActive ? `${issue.color}12` : undefined,
                            boxShadow: isActive ? `0 0 0 2px ${issue.color}40` : undefined,
                          }}
                          onMouseEnter={() => setHoveredCommentId(issue.id)}
                          onMouseLeave={() => setHoveredCommentId(null)}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: issue.color }} />
                              <span className="text-xs font-semibold truncate">{issue.criterionName}</span>
                            </div>
                            <Badge
                              variant={issue.severity === 'high' ? 'destructive' : issue.severity === 'medium' ? 'secondary' : 'outline'}
                              className="text-[10px] shrink-0"
                            >
                              {issue.severity}
                            </Badge>
                          </div>
                          <p className="text-xs font-medium text-foreground">{issue.problemType}</p>
                          <p className="text-xs text-muted-foreground leading-snug">{issue.problemDescription}</p>
                          <div className="pt-1 border-t border-border">
                            <p className="text-xs text-primary leading-snug">💡 {issue.recommendation}</p>
                          </div>
                          {!isAdded && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full h-6 text-xs mt-1"
                              onClick={() => addToFeedback(issue)}
                            >
                              <Plus className="h-3 w-3 mr-1" />Add to Feedback
                            </Button>
                          )}
                          {isAdded && (
                            <p className="text-[10px] text-green-600 font-medium text-center">✓ Added to feedback</p>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Feedback Draft */}
            <div className="h-[45%] flex flex-col min-h-0">
              <div className="px-4 py-2 border-b bg-muted/30 shrink-0">
                <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Pencil className="h-3.5 w-3.5" />
                  Feedback Draft ({feedbackItems.length})
                </p>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-3 space-y-2">
                  {feedbackItems.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      Add comments from above or write a manual note
                    </p>
                  ) : (
                    feedbackItems.map((item) => (
                      <div key={item.id} className="flex items-start gap-2 p-2 rounded-lg bg-muted/50 group/fb">
                        {item.color && (
                          <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: item.color }} />
                        )}
                        <div className="flex-1 min-w-0">
                          {item.criterionName && (
                            <span className="text-[10px] text-muted-foreground block">{item.criterionName}</span>
                          )}
                          <p className="text-xs leading-snug">{item.text}</p>
                        </div>
                        <button
                          className="opacity-0 group-hover/fb:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0"
                          onClick={() => removeFeedbackItem(item.id)}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
              {/* Manual note */}
              <div className="p-3 border-t space-y-2 shrink-0">
                <Textarea
                  placeholder="Add a manual note..."
                  value={manualNote}
                  onChange={(e) => setManualNote(e.target.value)}
                  className="resize-none text-xs min-h-[56px]"
                  rows={2}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full h-7 text-xs"
                  onClick={addManualNote}
                  disabled={!manualNote.trim()}
                >
                  <Plus className="h-3 w-3 mr-1" />Add Note
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
