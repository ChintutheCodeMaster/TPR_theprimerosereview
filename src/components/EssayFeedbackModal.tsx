import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
  const [hoveredIssue, setHoveredIssue] = useState<AnalysisIssue | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const { toast } = useToast();

  const essayContent = essay.content;

  useEffect(() => {
  if (isOpen) {
    const init = async () => {
      const alreadyAnalyzed = await loadExistingFeedback();
      if (!alreadyAnalyzed) {
        analyzeEssay(); // only call API if no cached analysis
      }
    };
    init();
  }
}, [isOpen]);

  // ── Load existing feedback from the essay row ──────────────
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
        // ✅ Already analyzed — use cached result, skip API call
        setAnalysis(data.ai_analysis as unknown as AnalysisResult);
        return true; // signals "already have analysis"
      }
    }
    return false; // signals "need to analyze"
  } catch (error) {
    console.error("Error loading existing feedback:", error);
    return false;
  }
};

  // ── Load history ───────────────────────────────────────────
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

  // ── AI Analysis ────────────────────────────────────────────
  const analyzeEssay = async () => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-essay', {
        body: {
          essayContent: essayContent,
          prompt: essay.prompt
        }
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
      // Silently fail — counselor can still give manual feedback
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ── Feedback helpers ───────────────────────────────────────
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

  // ── Save feedback ──────────────────────────────────────────
  const saveFeedback = async (status: 'draft' | 'in_progress' | 'sent') => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Step 1 — get current version count for this essay
      const { count } = await supabase
        .from('essay_feedback_history')
        .select('*', { count: 'exact', head: true })
        .eq('essay_id', essay.id);

      const nextVersion = (count ?? 0) + 1;

      // Step 2 — UPDATE the main essay_feedback row (never insert)
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

      // Step 3 — INSERT a snapshot into essay_feedback_history
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

      if (status === 'sent') onClose();
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

  // ── Restore a version from history ────────────────────────
  const restoreVersion = (entry: HistoryEntry) => {
    setFeedbackItems(entry.feedback_items || []);
    setManualNote(entry.manual_notes || "");
    setPersonalMessage(entry.personal_message || "");
    setShowHistory(false);
    toast({ title: `Restored version ${entry.version}` });
  };

  // ── Highlighted essay ──────────────────────────────────────
  const highlightedEssay = useMemo(() => {
    if (!analysis?.issues || analysis.issues.length === 0) {
      return <span>{essayContent}</span>;
    }

    const sortedIssues = [...analysis.issues].sort((a, b) => a.startIndex - b.startIndex);
    const segments: JSX.Element[] = [];
    let lastIndex = 0;

    sortedIssues.forEach((issue, idx) => {
      if (issue.startIndex > lastIndex) {
        segments.push(<span key={`text-${idx}`}>{essayContent.slice(lastIndex, issue.startIndex)}</span>);
      }
      segments.push(
        <TooltipProvider key={`highlight-${idx}`}>
          <Tooltip delayDuration={100}>
            <TooltipTrigger asChild>
              <span
                className="cursor-pointer px-0.5 rounded transition-all hover:opacity-80"
                style={{
                  backgroundColor: `${issue.color}30`,
                  borderBottom: `2px solid ${issue.color}`,
                }}
                onMouseEnter={() => setHoveredIssue(issue)}
                onMouseLeave={() => setHoveredIssue(null)}
              >
                {issue.highlightedText}
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-sm p-4 bg-popover border border-border shadow-lg">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: issue.color }} />
                  <span className="font-semibold text-sm">{issue.criterionName}</span>
                  <Badge
                    variant={issue.severity === 'high' ? 'destructive' : issue.severity === 'medium' ? 'secondary' : 'outline'}
                    className="text-xs"
                  >
                    {issue.severity}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{issue.problemType}</p>
                  <p className="text-sm text-muted-foreground mt-1">{issue.problemDescription}</p>
                </div>
                <div className="pt-2 border-t border-border">
                  <p className="text-sm text-primary font-medium">💡 {issue.recommendation}</p>
                </div>
                <Button
                  size="sm"
                  className="w-full mt-2"
                  onClick={(e) => { e.stopPropagation(); addToFeedback(issue); }}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add to Feedback
                </Button>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
      lastIndex = issue.endIndex;
    });

    if (lastIndex < essayContent.length) {
      segments.push(<span key="text-end">{essayContent.slice(lastIndex)}</span>);
    }

    return segments;
  }, [analysis?.issues, essayContent]);

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
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={() => restoreVersion(entry)}
                      >
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
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl">
            Feedback: {essay.title} — {essay.studentName}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex overflow-hidden p-6 pt-4 gap-4">
          {/* Left Sidebar — AI Scores */}
          <div className="w-[12%] min-w-[140px] flex flex-col gap-4">
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Star className="h-4 w-4 text-primary" />
                  AI Score
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                {isAnalyzing ? (
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                ) : (
                  <div className="text-3xl font-bold text-center text-primary">
                    {analysis?.overallScore ?? '—'}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-xs">Criteria</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 space-y-2">
                {isAnalyzing ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="h-8 bg-muted animate-pulse rounded" />
                    ))}
                  </div>
                ) : analysis?.criteria ? (
                  analysis.criteria.map((criterion) => (
                    <div key={criterion.id} className="space-y-1">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: criterion.color }} />
                        <span className="text-[10px] text-muted-foreground truncate">
                          {criterion.name.split(' & ')[0]}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Progress value={criterion.score} className="h-1.5 flex-1" />
                        <span className="text-[10px] font-medium w-6 text-right">{criterion.score}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-2">No AI analysis</p>
                )}
              </CardContent>
            </Card>

            {analysis?.issues && (
              <Card>
                <CardHeader className="p-3 pb-2">
                  <CardTitle className="text-xs flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3 text-warning" />
                    Issues
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="text-2xl font-bold text-center text-warning">
                    {analysis.issues.length}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col gap-4 min-w-0">
            <Card className="flex-1 overflow-hidden">
              <CardHeader className="p-4 pb-2 border-b">
                <CardTitle className="text-sm">Essay Content</CardTitle>
                {analysis && (
                  <p className="text-xs text-muted-foreground">
                    Hover over highlighted sections to see AI analysis
                  </p>
                )}
              </CardHeader>
              <CardContent className="p-0 h-[calc(100%-60px)]">
                <ScrollArea className="h-full p-4">
                  {isAnalyzing ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-2" />
                        <p className="text-sm text-muted-foreground">Analyzing essay...</p>
                      </div>
                    </div>
                  ) : (
                    <div className="prose prose-sm max-w-none leading-relaxed text-foreground whitespace-pre-wrap">
                      {highlightedEssay}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Feedback Builder */}
            <Card className="h-[35%] min-h-[200px]">
              <CardHeader className="p-4 pb-2 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Pencil className="h-4 w-4" />
                    Feedback Draft ({feedbackItems.length} items)
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { loadHistory(); setShowHistory(true); }}
                    >
                      <History className="h-3 w-3 mr-1" />
                      History
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => saveFeedback('draft')}
                      disabled={isSaving}
                    >
                      {isSaving ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Save className="h-3 w-3 mr-1" />}
                      Save Draft
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPreview(true)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Preview
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => saveFeedback('sent')}
                      disabled={isSaving}
                    >
                      {isSaving ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Send className="h-3 w-3 mr-1" />}
                      Send to Student
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 h-[calc(100%-60px)] flex gap-4">
                <ScrollArea className="flex-1">
                  {feedbackItems.length === 0 ? (
                    <div className="text-center text-muted-foreground text-sm py-4">
                      Click "Add to Feedback" on highlighted issues or add manual notes
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {feedbackItems.map((item) => (
                        <div key={item.id} className="flex items-start gap-2 p-2 rounded bg-muted/50 group">
                          {item.color && (
                            <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: item.color }} />
                          )}
                          <div className="flex-1 min-w-0">
                            {item.criterionName && (
                              <span className="text-[10px] text-muted-foreground">{item.criterionName}</span>
                            )}
                            <p className="text-sm">{item.text}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                            onClick={() => removeFeedbackItem(item.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>

                {/* Personal message + manual note */}
                <div className="w-[300px] flex flex-col gap-2 ">
                  {/* <Textarea
                    placeholder="Personal message to student..."
                    value={personalMessage}
                    onChange={(e) => setPersonalMessage(e.target.value)}
                    className="flex-1 resize-none text-sm"
                    rows={3}
                  /> */}
                  <Textarea
                    placeholder="Add a manual note..."
                    value={manualNote}
                    onChange={(e) => setManualNote(e.target.value)}
                    className="flex-1 resize-none text-sm"
                    rows={3}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addManualNote}
                    disabled={!manualNote.trim()}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Note
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};