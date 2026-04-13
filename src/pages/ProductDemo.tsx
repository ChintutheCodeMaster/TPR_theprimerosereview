import { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { 
  FileText, Search, Bot, Lightbulb, BookOpen, AlertTriangle, CheckCircle, 
  Loader2, Sparkles, ClipboardPaste, Star, Plus, Info, Shield, Brain,
  GraduationCap, Quote, PenTool, X
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import primroseLogo from "@/assets/primrose-logo.png";

// Types
interface AiDetectionResult {
  aiScore: number;
  humanScore: number;
  confidence: string;
  summary: string;
  indicators: { type: string; description: string; excerpt: string }[];
}

interface SourceResult {
  topic: string;
  academicSources: { title: string; author: string; type: string; relevance: string; searchQuery: string }[];
  brainstormingIdeas: { angle: string; description: string; exampleHook: string }[];
  keyThemes: string[];
  suggestedReadings: { title: string; author: string; why: string }[];
}

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

// Neural Network Background Component
const NeuralNetworkBg = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const nodes: { x: number; y: number; vx: number; vy: number; radius: number }[] = [];
    const nodeCount = 65;

    const resize = () => {
      canvas.width = canvas.offsetWidth * 2;
      canvas.height = canvas.offsetHeight * 2;
      ctx.scale(2, 2);
    };
    resize();
    window.addEventListener('resize', resize);

    // Initialize nodes
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2.5 + 2,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;

      // Update positions
      nodes.forEach(node => {
        node.x += node.vx;
        node.y += node.vy;
        if (node.x < 0 || node.x > w) node.vx *= -1;
        if (node.y < 0 || node.y > h) node.vy *= -1;
      });

      // Draw connections
      const maxDist = 180;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.12;
            ctx.strokeStyle = `rgba(124, 58, 237, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      nodes.forEach(node => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(124, 58, 237, 0.12)';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(124, 58, 237, 0.22)';
        ctx.fill();
      });

      animationId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  );
};

const ProductDemo = () => {
  const [searchParams] = useSearchParams();
  const [essayText, setEssayText] = useState("");
  const [aiDetection, setAiDetection] = useState<AiDetectionResult | null>(null);
  const [sources, setSources] = useState<SourceResult | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([]);
  const [loadingDetect, setLoadingDetect] = useState(false);
  const [loadingSources, setLoadingSources] = useState(false);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [hoveredIssue, setHoveredIssue] = useState<AnalysisIssue | null>(null);
  const [showInfoBubble, setShowInfoBubble] = useState(true);
  const [showLoadingMessage, setShowLoadingMessage] = useState(false);
  const { toast } = useToast();

  const wordCount = essayText.trim().split(/\s+/).filter(Boolean).length;

  // --- AI Detection ---
  const runAiDetection = async () => {
    if (!essayText.trim()) return;
    setLoadingDetect(true);
    setAiDetection(null);
    try {
      const { data, error } = await supabase.functions.invoke('essay-toolkit', {
        body: { essayContent: essayText, action: 'ai-detect' }
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setAiDetection(data);
    } catch (err: any) {
      toast({ title: "Analysis failed", description: err.message || "Please try again", variant: "destructive" });
    } finally {
      setLoadingDetect(false);
    }
  };

  // --- Sources ---
  const findSources = async () => {
    if (!essayText.trim()) return;
    setLoadingSources(true);
    setSources(null);
    try {
      const { data, error } = await supabase.functions.invoke('essay-toolkit', {
        body: { essayContent: essayText, action: 'sources' }
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setSources(data);
    } catch (err: any) {
      toast({ title: "Source search failed", description: err.message || "Please try again", variant: "destructive" });
    } finally {
      setLoadingSources(false);
    }
  };

  // --- Essay Feedback Analysis ---
  const runFeedbackAnalysis = async () => {
    if (!essayText.trim()) return;
    setLoadingFeedback(true);
    setAnalysis(null);
    setFeedbackItems([]);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-essay', {
        body: { essayContent: essayText }
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setAnalysis(data);
      toast({ title: "Feedback ready ✓", description: `Found ${data.issues?.length || 0} areas for improvement` });
    } catch (err: any) {
      toast({ title: "Feedback failed", description: err.message || "Please try again", variant: "destructive" });
    } finally {
      setLoadingFeedback(false);
    }
  };

  // --- Run all ---
  const runAll = () => {
    if (!essayText.trim()) {
      toast({ title: "No text found", description: "Please paste an essay first", variant: "destructive" });
      return;
    }
    setShowLoadingMessage(true);
    runAiDetection();
    findSources();
    runFeedbackAnalysis();
    // Keep loading message visible for at least 8 seconds
    setTimeout(() => setShowLoadingMessage(false), 8000);
  };

  const addToFeedback = (issue: AnalysisIssue) => {
    if (feedbackItems.some(item => item.id === issue.id)) return;
    setFeedbackItems(prev => [...prev, {
      id: issue.id,
      text: `[${issue.problemType}] ${issue.problemDescription} → ${issue.recommendation}`,
      source: 'ai',
      criterionName: issue.criterionName,
      color: issue.color,
    }]);
  };

  const removeFeedbackItem = (id: string) => {
    setFeedbackItems(prev => prev.filter(item => item.id !== id));
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setEssayText(text);
      toast({ title: "Pasted ✓", description: `${text.trim().split(/\s+/).filter(Boolean).length} words` });
    } catch {
      toast({ title: "Can't access clipboard", description: "Please paste manually with Ctrl+V", variant: "destructive" });
    }
  };

  const clearAll = () => {
    setEssayText("");
    setAiDetection(null);
    setSources(null);
    setAnalysis(null);
    setFeedbackItems([]);
  };

  const getScoreColor = (score: number) => {
    if (score <= 30) return "text-green-600";
    if (score <= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreProgressColor = (score: number) => {
    if (score <= 30) return "[&>div]:bg-green-500";
    if (score <= 60) return "[&>div]:bg-yellow-500";
    return "[&>div]:bg-red-500";
  };

  const getScoreLabel = (score: number) => {
    if (score <= 20) return "Very likely human-written ✨";
    if (score <= 40) return "Mostly human-written 👍";
    if (score <= 60) return "Mixed signals, review recommended";
    if (score <= 80) return "Likely AI-assisted ⚠️";
    return "Very likely AI-generated 🚨";
  };

  // Highlighted essay with tooltips
  const highlightedEssay = useMemo(() => {
    if (!analysis?.issues || analysis.issues.length === 0) {
      return <span className="whitespace-pre-wrap">{essayText}</span>;
    }
    const sortedIssues = [...analysis.issues].sort((a, b) => a.startIndex - b.startIndex);
    const segments: JSX.Element[] = [];
    let lastIndex = 0;

    sortedIssues.forEach((issue, idx) => {
      if (issue.startIndex > lastIndex) {
        segments.push(<span key={`t-${idx}`}>{essayText.slice(lastIndex, issue.startIndex)}</span>);
      }
      segments.push(
        <TooltipProvider key={`h-${idx}`}>
          <Tooltip delayDuration={100}>
            <TooltipTrigger asChild>
              <span
                className="cursor-pointer px-0.5 rounded transition-all hover:opacity-80"
                style={{ backgroundColor: `${issue.color}30`, borderBottom: `2px solid ${issue.color}` }}
                onMouseEnter={() => setHoveredIssue(issue)}
                onMouseLeave={() => setHoveredIssue(null)}
              >
                {issue.highlightedText}
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-sm p-4 bg-popover border border-border shadow-lg z-50">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: issue.color }} />
                  <span className="font-semibold text-sm">{issue.criterionName}</span>
                  <Badge variant={issue.severity === 'high' ? 'destructive' : issue.severity === 'medium' ? 'secondary' : 'outline'} className="text-xs">
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
                <Button size="sm" className="w-full mt-2" onClick={(e) => { e.stopPropagation(); addToFeedback(issue); }}>
                  <Plus className="h-3 w-3 mr-1" /> Add to Feedback
                </Button>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
      lastIndex = issue.endIndex;
    });

    if (lastIndex < essayText.length) {
      segments.push(<span key="end">{essayText.slice(lastIndex)}</span>);
    }
    return segments;
  }, [analysis?.issues, essayText]);

  const isLoading = loadingDetect || loadingSources || loadingFeedback;
  const hasResults = aiDetection || sources || analysis;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={primroseLogo} alt="The Primrose Review" className="h-9 w-auto" />
            <Badge variant="outline" className="text-xs font-medium">Product Demo</Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4 text-primary" />
            AI-Powered, Ethical by Design
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        {/* Hero with Neural Network */}
        <div className="relative overflow-hidden rounded-2xl py-12">
          {!hasResults && <NeuralNetworkBg />}
          <div className="text-center space-y-4 max-w-2xl mx-auto animate-fade-in relative z-10 px-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Brain className="h-4 w-4" />
              Ethical AI for College Admissions
            </div>
            
            {/* Personalized greeting from URL params */}
            {searchParams.get("name") && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-left space-y-1">
                <p className="text-lg font-semibold text-foreground">
                  Hi {searchParams.get("name")} 👋
                </p>
                <p className="text-muted-foreground text-sm">
                  We created this demo especially for you
                  {searchParams.get("role") && <> to help you as a <span className="font-medium text-primary">{searchParams.get("role")}</span></>}
                  {searchParams.get("msg") && <>{". "}{searchParams.get("msg")}</>}
                </p>
              </div>
            )}

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground tracking-tight leading-tight">
              See How We Help Students Write <span className="text-primary">Authentically</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed">
              Our AI tools don't write for students, they empower counselors to guide students toward 
              their most genuine, compelling voice. Paste any essay below to see it in action.
            </p>
          </div>
        </div>

        {/* Floating Info Bubble */}
        {showInfoBubble && (
          <div className="relative max-w-2xl mx-auto">
            <Card className="border-primary/20 bg-primary/5 shadow-lg">
              <CardContent className="p-4 flex gap-3 items-start">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Info className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium text-foreground">How does this work?</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Paste a student essay and our AI will: <strong>detect AI-generated content</strong>, 
                    provide <strong>detailed writing feedback</strong> with color-coded highlights across 5 criteria, 
                    and suggest <strong>research sources & brainstorming ideas</strong>. 
                    Everything a counselor needs in one place.
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8" onClick={() => setShowInfoBubble(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Input Area */}
        <Card className="shadow-md max-w-4xl mx-auto">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Paste an Essay</CardTitle>
                  <CardDescription>Drop in any student essay to see the full analysis</CardDescription>
                </div>
              </div>
              {!essayText && (
                <Button variant="outline" size="sm" onClick={handlePaste} className="gap-2">
                  <ClipboardPaste className="h-4 w-4" />
                  Paste from Clipboard
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Paste a student's essay here...&#10;&#10;Try pasting any personal statement, college essay, or writing sample to see the full power of the platform."
              value={essayText}
              onChange={(e) => setEssayText(e.target.value)}
              className="min-h-[200px] text-sm leading-relaxed resize-y"
            />
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{wordCount}</span> words
                </span>
                {wordCount >= 250 && (
                  <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20">
                    <GraduationCap className="h-3 w-3 mr-1" /> Good length for analysis
                  </Badge>
                )}
              </div>
              <div className="flex gap-2">
                {essayText && (
                  <Button variant="ghost" size="sm" onClick={clearAll}>Clear</Button>
                )}
                <Button onClick={runAll} disabled={isLoading || !essayText.trim()} className="gap-2 px-6">
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  Analyze Essay
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading */}
        {(isLoading || showLoadingMessage) && (
          <div className="max-w-4xl mx-auto space-y-4 animate-fade-in">
            <Card className="border-primary/20 bg-primary/5 shadow-md">
              <CardContent className="p-6 space-y-3">
                <p className="text-sm font-medium text-foreground">
                  Thank you for choosing to explore Primrose's capabilities 🙏
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Please note, this demo showcases roughly <strong>5% of our full platform</strong>. 
                  The goal is to give you a glimpse into how our engine and technology work, 
                  and how they can support you throughout your students' application process.
                </p>
                <p className="text-xs text-muted-foreground/70 italic">
                  This demo is for evaluation purposes only, please do not use it commercially.
                </p>
              </CardContent>
            </Card>
            <Card className="border-dashed">
              <CardContent className="p-8 flex flex-col items-center gap-3 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 text-primary animate-spin" />
                </div>
                <p className="font-medium text-foreground">Running full analysis...</p>
                <p className="text-sm text-muted-foreground">AI Detection, Writing Feedback, Source Research</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Results */}
        {hasResults && !isLoading && !showLoadingMessage && (
          <Tabs defaultValue="feedback" className="max-w-7xl mx-auto">
            <TabsList className="w-full justify-start">
              {analysis && (
                <TabsTrigger value="feedback" className="gap-1.5">
                  <Star className="h-4 w-4" /> Writing Feedback
                </TabsTrigger>
              )}
              {aiDetection && (
                <TabsTrigger value="detection" className="gap-1.5">
                  <Bot className="h-4 w-4" /> AI Detection
                </TabsTrigger>
              )}
              {sources && (
                <TabsTrigger value="sources" className="gap-1.5">
                  <BookOpen className="h-4 w-4" /> Sources & Ideas
                </TabsTrigger>
              )}
            </TabsList>

            {/* === Writing Feedback Tab === */}
            {analysis && (
              <TabsContent value="feedback" className="mt-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left: Highlighted Essay */}
                  <div className="lg:col-span-2 space-y-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">Essay with Highlights</CardTitle>
                          <div className="flex items-center gap-2">
                            <Star className="h-5 w-5 text-primary" />
                            <span className="font-bold text-xl">{analysis.overallScore}/100</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {analysis.criteria.map(c => (
                            <div key={c.id} className="flex items-center gap-1.5 text-xs">
                              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                              <span className="text-muted-foreground">{c.name}</span>
                              <span className="font-medium">{c.score}</span>
                            </div>
                          ))}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="prose prose-sm max-w-none text-foreground leading-relaxed whitespace-pre-wrap p-4 rounded-lg bg-muted/20 border min-h-[200px]">
                          {highlightedEssay}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Criteria Breakdown */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Score Breakdown</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {analysis.criteria.map(criterion => (
                          <div key={criterion.id} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: criterion.color }} />
                                <span>{criterion.name}</span>
                              </div>
                              <span className="font-medium">{criterion.score}/100</span>
                            </div>
                            <Progress value={criterion.score} className="h-2" />
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Right: Feedback Notes */}
                  <div className="space-y-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center justify-between">
                          <span>Feedback Notes</span>
                          <Badge variant="secondary" className="text-xs">{feedbackItems.length}/10</Badge>
                        </CardTitle>
                        <CardDescription>Click highlighted text to add notes. Up to 10 feedback items.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {feedbackItems.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-6">
                            Hover over highlighted text in the essay and click "Add to Feedback" to build your notes.
                          </p>
                        ) : (
                          feedbackItems.map((item, index) => (
                            <div key={item.id} className="p-3 rounded-lg border group relative hover:bg-muted/20 transition-colors">
                              <div className="flex items-start gap-2">
                                {item.color && (
                                  <div className="w-3 h-3 rounded-full mt-1 shrink-0" style={{ backgroundColor: item.color }} />
                                )}
                                <div className="flex-1 min-w-0">
                                  {item.criterionName && (
                                    <span className="text-xs font-medium text-muted-foreground block mb-0.5">{item.criterionName}</span>
                                  )}
                                  <p className="text-xs leading-relaxed">{item.text}</p>
                                </div>
                                <Button
                                  variant="ghost" size="icon"
                                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                  onClick={() => removeFeedbackItem(item.id)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                      </CardContent>
                    </Card>

                    {/* All Issues List */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">All Issues Found</CardTitle>
                        <CardDescription>{analysis.issues.length} areas identified</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2 max-h-[400px] overflow-y-auto">
                        {analysis.issues.map((issue) => {
                          const isAdded = feedbackItems.some(f => f.id === issue.id);
                          return (
                            <div key={issue.id} className={`p-3 rounded-lg border text-xs space-y-1 transition-colors ${isAdded ? 'bg-muted/40 opacity-60' : 'hover:bg-muted/20'}`}>
                              <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: issue.color }} />
                                <span className="font-medium">{issue.problemType}</span>
                                <Badge variant={issue.severity === 'high' ? 'destructive' : 'outline'} className="text-[10px] ml-auto">{issue.severity}</Badge>
                              </div>
                              <p className="text-muted-foreground">{issue.problemDescription}</p>
                              {!isAdded && feedbackItems.length < 10 && (
                                <Button size="sm" variant="ghost" className="h-6 text-xs w-full mt-1" onClick={() => addToFeedback(issue)}>
                                  <Plus className="h-3 w-3 mr-1" /> Add
                                </Button>
                              )}
                            </div>
                          );
                        })}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            )}

            {/* === AI Detection Tab === */}
            {aiDetection && (
              <TabsContent value="detection" className="space-y-4 mt-4 max-w-4xl">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bot className="h-5 w-5 text-primary" /> AI Detection Results
                    </CardTitle>
                    <CardDescription className="leading-relaxed">{aiDetection.summary}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="p-5 rounded-xl bg-muted/30 space-y-4">
                      <div className="flex items-end justify-between">
                        <div>
                          <span className="text-sm text-muted-foreground">AI Probability Score</span>
                          <p className={`text-3xl font-bold ${getScoreColor(aiDetection.aiScore)}`}>{aiDetection.aiScore}%</p>
                        </div>
                        <Badge variant="outline">Confidence: {aiDetection.confidence}</Badge>
                      </div>
                      <Progress value={aiDetection.aiScore} className={`h-3 ${getScoreProgressColor(aiDetection.aiScore)}`} />
                      <p className={`text-sm font-medium ${getScoreColor(aiDetection.aiScore)}`}>{getScoreLabel(aiDetection.aiScore)}</p>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-medium flex items-center gap-2"><Search className="h-4 w-4 text-muted-foreground" /> What We Found</h4>
                      <div className="grid gap-2">
                        {aiDetection.indicators.map((ind, i) => (
                          <div key={i} className="flex gap-3 p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
                            {ind.type === 'ai' ? <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" /> : <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />}
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium">{ind.description}</p>
                              {ind.excerpt && <p className="text-xs text-muted-foreground mt-1 italic truncate">"{ind.excerpt}"</p>}
                            </div>
                            <Badge variant={ind.type === 'ai' ? 'destructive' : 'secondary'} className="shrink-0 self-start text-xs">{ind.type === 'ai' ? 'AI Signal' : 'Human Signal'}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* === Sources Tab === */}
            {sources && (
              <TabsContent value="sources" className="space-y-4 mt-4 max-w-4xl">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-sm font-medium text-muted-foreground">Themes:</span>
                  {sources.keyThemes.map((theme, i) => (
                    <Badge key={i} variant="secondary" className="bg-primary/5 text-primary border-primary/15">{theme}</Badge>
                  ))}
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" /> Academic Sources</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {sources.academicSources.map((src, i) => (
                      <div key={i} className="p-4 border rounded-lg space-y-2 hover:bg-muted/20 transition-colors">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-medium leading-tight">{src.title}</h4>
                          <Badge variant="outline" className="shrink-0 text-xs">{src.type}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">by {src.author}</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">{src.relevance}</p>
                        <a href={`https://scholar.google.com/scholar?q=${encodeURIComponent(src.searchQuery)}`} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline inline-flex items-center gap-1 font-medium">
                          <Search className="h-3 w-3" /> Search on Google Scholar →
                        </a>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Lightbulb className="h-5 w-5 text-primary" /> Brainstorming Ideas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {sources.brainstormingIdeas.map((idea, i) => (
                      <div key={i} className="p-4 border rounded-lg space-y-2 hover:bg-muted/20 transition-colors">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{i + 1}</div>
                          <h4 className="text-sm font-semibold">{idea.angle}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{idea.description}</p>
                        <div className="bg-muted/40 p-3 rounded-lg text-sm italic border-l-2 border-primary/30">"{idea.exampleHook}"</div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        )}

        {/* Footer */}
        <div className="text-center pt-8 pb-4 border-t border-border/50">
          <p className="text-sm text-muted-foreground">
            <strong>The Primrose Review</strong>, Ethical AI tools for college admissions counselors
          </p>
          <p className="text-xs text-muted-foreground mt-1">This is a live product demo. All analysis is performed in real-time.</p>
        </div>
      </div>
    </div>
  );
};

export default ProductDemo;
