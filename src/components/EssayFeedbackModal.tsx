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
  ArrowLeft
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

interface Essay {
  id: string;
  title: string;
  studentName: string;
  studentId?: string;
  prompt: string;
  content: string;
}

interface SavedFeedback {
  id: string;
  student_id: string;
  counselor_id: string;
  essay_title: string;
  essay_content: string;
  essay_prompt: string | null;
  ai_analysis: AnalysisResult | null;
  feedback_items: FeedbackItem[];
  manual_notes: string | null;
  personal_message: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  sent_at: string | null;
}

interface EssayFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  essay: Essay;
  existingFeedbackId?: string;
}

export const EssayFeedbackModal = ({ isOpen, onClose, essay, existingFeedbackId }: EssayFeedbackModalProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([]);
  const [manualNote, setManualNote] = useState("");
  const [personalMessage, setPersonalMessage] = useState("");
  const [hoveredIssue, setHoveredIssue] = useState<AnalysisIssue | null>(null);
  const [feedbackId, setFeedbackId] = useState<string | null>(existingFeedbackId || null);
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();

  // Full essay content for demo
  const essayContent = essay.content || `Growing up in a household where both my parents worked multiple jobs to make ends meet, I learned early that education was not just an opportunity—it was a necessity. Every morning, I watched my mother leave for her 6 AM shift at the local diner, knowing she would return home at 11 PM only to help me with homework despite her exhaustion.

This daily routine taught me resilience, but it also sparked a curiosity about economic inequality that would shape my academic interests. When I was fourteen, I started tutoring younger students in mathematics, not just to earn money for my family, but because I discovered that teaching allowed me to see how different perspectives could solve the same problem.

Through this experience, I realized that my passion lies in understanding complex systems—whether they're economic models or educational frameworks. This is why I want to study Economics with a focus on public policy. I believe that by understanding how financial systems work, I can contribute to creating more equitable opportunities for families like mine.

My experience has taught me that challenges are not obstacles but stepping stones to growth. Every difficult moment has strengthened my resolve to succeed and has shown me the importance of helping others along the way.`;

  useEffect(() => {
    if (isOpen) {
      if (existingFeedbackId) {
        loadExistingFeedback();
      } else {
        analyzeEssay();
      }
    }
  }, [isOpen, existingFeedbackId]);

  const loadExistingFeedback = async () => {
    try {
      const { data, error } = await supabase
        .from('essay_feedback')
        .select('*')
        .eq('id', existingFeedbackId)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        const savedData = data as unknown as SavedFeedback;
        setFeedbackId(savedData.id);
        setAnalysis(savedData.ai_analysis);
        setFeedbackItems(savedData.feedback_items || []);
        setManualNote(savedData.manual_notes || "");
        setPersonalMessage(savedData.personal_message || "");
      }
    } catch (error) {
      console.error("Error loading feedback:", error);
      toast({
        title: "Error Loading Feedback",
        description: "Could not load existing feedback",
        variant: "destructive",
      });
    }
  };

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
      console.error("Analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Could not analyze essay",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const addToFeedback = (issue: AnalysisIssue) => {
    const exists = feedbackItems.some(item => item.id === issue.id);
    if (exists) {
      toast({
        title: "Already Added",
        description: "This issue is already in your feedback",
      });
      return;
    }

    setFeedbackItems(prev => [...prev, {
      id: issue.id,
      text: `[${issue.problemType}] ${issue.problemDescription} Recommendation: ${issue.recommendation}`,
      source: 'ai',
      criterionName: issue.criterionName,
      color: issue.color,
    }]);

    toast({
      title: "Added to Feedback",
      description: "Issue added to your feedback draft",
    });
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

  const saveFeedback = async (status: 'draft' | 'sent') => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Not Authenticated",
          description: "Please log in to save feedback",
          variant: "destructive",
        });
        return;
      }

      const feedbackData = {
        student_id: essay.studentId || user.id,
        counselor_id: user.id,
        essay_title: essay.title,
        essay_content: essayContent,
        essay_prompt: essay.prompt,
        ai_analysis: JSON.parse(JSON.stringify(analysis)),
        feedback_items: JSON.parse(JSON.stringify(feedbackItems)),
        manual_notes: manualNote || null,
        personal_message: personalMessage || null,
        status,
        sent_at: status === 'sent' ? new Date().toISOString() : null,
      };

      let result;
      if (feedbackId) {
        result = await supabase
          .from('essay_feedback')
          .update(feedbackData)
          .eq('id', feedbackId)
          .select()
          .single();
      } else {
        result = await supabase
          .from('essay_feedback')
          .insert([feedbackData])
          .select()
          .single();
      }

      if (result.error) throw result.error;

      setFeedbackId(result.data.id);

      toast({
        title: status === 'draft' ? "Draft Saved" : "Feedback Sent",
        description: status === 'draft' 
          ? "Your feedback has been saved as a draft" 
          : "Your feedback has been sent to the student",
      });

      if (status === 'sent') {
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

  // Render essay with highlights
  const highlightedEssay = useMemo(() => {
    if (!analysis?.issues || analysis.issues.length === 0) {
      return <span>{essayContent}</span>;
    }

    const sortedIssues = [...analysis.issues].sort((a, b) => a.startIndex - b.startIndex);
    const segments: JSX.Element[] = [];
    let lastIndex = 0;

    sortedIssues.forEach((issue, idx) => {
      if (issue.startIndex > lastIndex) {
        segments.push(
          <span key={`text-${idx}`}>
            {essayContent.slice(lastIndex, issue.startIndex)}
          </span>
        );
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
            <TooltipContent 
              side="top" 
              className="max-w-sm p-4 bg-popover border border-border shadow-lg"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: issue.color }}
                  />
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
                  onClick={(e) => {
                    e.stopPropagation();
                    addToFeedback(issue);
                  }}
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
      segments.push(
        <span key="text-end">
          {essayContent.slice(lastIndex)}
        </span>
      );
    }

    return segments;
  }, [analysis?.issues, essayContent]);

  // Preview Mode
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
              <DialogTitle className="text-lg">
                Preview Feedback for {essay.studentName}
              </DialogTitle>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              {/* Header */}
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

              {/* Personal Message */}
              {personalMessage && (
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-4">
                    <p className="text-sm font-medium text-primary mb-2">Personal Note from your counselor:</p>
                    <p className="text-foreground">{personalMessage}</p>
                  </CardContent>
                </Card>
              )}

              {/* Feedback Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Detailed Feedback</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {feedbackItems.map((item, index) => (
                    <div key={item.id} className="p-3 rounded-lg border">
                      <div className="flex items-start gap-2">
                        {item.color && (
                          <div 
                            className="w-3 h-3 rounded-full mt-1 flex-shrink-0" 
                            style={{ backgroundColor: item.color }}
                          />
                        )}
                        <div>
                          {item.criterionName && (
                            <span className="text-xs font-medium text-muted-foreground">
                              {item.criterionName}
                            </span>
                          )}
                          <p className="text-sm">{item.text}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Criteria Scores */}
              {analysis?.criteria && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Score Breakdown</CardTitle>
                  </CardHeader>
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

          {/* Actions */}
          <div className="p-4 border-t flex gap-2">
            <Textarea
              placeholder="Add a personal message to the student (optional)..."
              value={personalMessage}
              onChange={(e) => setPersonalMessage(e.target.value)}
              className="flex-1 resize-none"
              rows={2}
            />
            <div className="flex flex-col gap-2">
              <Button 
                variant="outline" 
                onClick={() => saveFeedback('draft')}
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              </Button>
              <Button 
                onClick={() => saveFeedback('sent')}
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] w-[1400px] h-[90vh] p-0 flex flex-col">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl">
            Feedback: {essay.title} - {essay.studentName}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex overflow-hidden p-6 pt-4 gap-4">
          {/* Right Sidebar - AI Scores (10%) */}
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
                    {analysis?.overallScore ?? '-'}
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
                        <div 
                          className="w-2 h-2 rounded-full flex-shrink-0" 
                          style={{ backgroundColor: criterion.color }}
                        />
                        <span className="text-[10px] text-muted-foreground truncate">
                          {criterion.name.split(' & ')[0]}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Progress 
                          value={criterion.score} 
                          className="h-1.5 flex-1"
                          style={{ 
                            ['--progress-background' as string]: criterion.color 
                          }}
                        />
                        <span className="text-[10px] font-medium w-6 text-right">
                          {criterion.score}
                        </span>
                      </div>
                    </div>
                  ))
                ) : null}
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

          {/* Main Content - Essay with Highlights */}
          <div className="flex-1 flex flex-col gap-4 min-w-0">
            <Card className="flex-1 overflow-hidden">
              <CardHeader className="p-4 pb-2 border-b">
                <CardTitle className="text-sm">Essay Content</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Hover over highlighted sections to see AI analysis
                </p>
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

            {/* Bottom - Feedback Builder */}
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
                      onClick={() => saveFeedback('draft')}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        <Save className="h-3 w-3 mr-1" />
                      )}
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
                      onClick={() => setShowPreview(true)}
                    >
                      <Send className="h-3 w-3 mr-1" />
                      Send to Student
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 h-[calc(100%-60px)] flex gap-4">
                {/* Feedback Items */}
                <ScrollArea className="flex-1">
                  {feedbackItems.length === 0 ? (
                    <div className="text-center text-muted-foreground text-sm py-4">
                      Click "Add to Feedback" on highlighted issues or add manual notes
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {feedbackItems.map((item) => (
                        <div 
                          key={item.id} 
                          className="flex items-start gap-2 p-2 rounded bg-muted/50 group"
                        >
                          {item.color && (
                            <div 
                              className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" 
                              style={{ backgroundColor: item.color }}
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            {item.criterionName && (
                              <span className="text-[10px] text-muted-foreground">
                                {item.criterionName}
                              </span>
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

                {/* Manual Note Input */}
                <div className="w-[300px] flex flex-col gap-2">
                  <Textarea
                    placeholder="Add a manual note..."
                    value={manualNote}
                    onChange={(e) => setManualNote(e.target.value)}
                    className="flex-1 resize-none text-sm"
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
