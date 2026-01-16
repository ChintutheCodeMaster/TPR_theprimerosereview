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
  Share, 
  Loader2, 
  AlertTriangle,
  X,
  Pencil
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
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([]);
  const [manualNote, setManualNote] = useState("");
  const [hoveredIssue, setHoveredIssue] = useState<AnalysisIssue | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const { toast } = useToast();

  // Full essay content for demo
  const essayContent = `Growing up in a household where both my parents worked multiple jobs to make ends meet, I learned early that education was not just an opportunity—it was a necessity. Every morning, I watched my mother leave for her 6 AM shift at the local diner, knowing she would return home at 11 PM only to help me with homework despite her exhaustion.

This daily routine taught me resilience, but it also sparked a curiosity about economic inequality that would shape my academic interests. When I was fourteen, I started tutoring younger students in mathematics, not just to earn money for my family, but because I discovered that teaching allowed me to see how different perspectives could solve the same problem.

Through this experience, I realized that my passion lies in understanding complex systems—whether they're economic models or educational frameworks. This is why I want to study Economics with a focus on public policy. I believe that by understanding how financial systems work, I can contribute to creating more equitable opportunities for families like mine.

My experience has taught me that challenges are not obstacles but stepping stones to growth. Every difficult moment has strengthened my resolve to succeed and has shown me the importance of helping others along the way.`;

  useEffect(() => {
    if (isOpen && !analysis) {
      analyzeEssay();
    }
  }, [isOpen]);

  const analyzeEssay = async () => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-essay', {
        body: { 
          essayContent: essayContent,
          prompt: essay.prompt
        }
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

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

  const saveDraft = () => {
    toast({
      title: "Draft Saved",
      description: "Your feedback has been saved as a draft",
    });
  };

  const saveAndShare = () => {
    toast({
      title: "Feedback Sent",
      description: "Your feedback has been saved and shared with the student",
    });
    onClose();
  };

  // Render essay with highlights
  const highlightedEssay = useMemo(() => {
    if (!analysis?.issues || analysis.issues.length === 0) {
      return <span>{essayContent}</span>;
    }

    // Sort issues by startIndex
    const sortedIssues = [...analysis.issues].sort((a, b) => a.startIndex - b.startIndex);
    
    const segments: JSX.Element[] = [];
    let lastIndex = 0;

    sortedIssues.forEach((issue, idx) => {
      // Add non-highlighted text before this issue
      if (issue.startIndex > lastIndex) {
        segments.push(
          <span key={`text-${idx}`}>
            {essayContent.slice(lastIndex, issue.startIndex)}
          </span>
        );
      }

      // Add highlighted text
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

    // Add remaining text
    if (lastIndex < essayContent.length) {
      segments.push(
        <span key="text-end">
          {essayContent.slice(lastIndex)}
        </span>
      );
    }

    return segments;
  }, [analysis?.issues, essayContent]);

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
                    <Button variant="outline" size="sm" onClick={saveDraft}>
                      <Save className="h-3 w-3 mr-1" />
                      Save Draft
                    </Button>
                    <Button size="sm" onClick={saveAndShare}>
                      <Share className="h-3 w-3 mr-1" />
                      Save & Share
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
