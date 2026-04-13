import { useState } from "react";
import { FileText, Search, Bot, Lightbulb, BookOpen, AlertTriangle, CheckCircle, Loader2, ArrowLeft, Sparkles, PenTool, GraduationCap, Quote, ClipboardPaste } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import primroseLogo from "@/assets/primrose-logo.png";

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

const writingTips = [
  { icon: PenTool, tip: "Start with a vivid personal moment — admissions officers remember stories, not statements." },
  { icon: Quote, tip: "Show, don't tell. Instead of saying 'I'm passionate,' describe the moment that ignited it." },
  { icon: Lightbulb, tip: "Your unique perspective is your superpower. No one else has lived your exact experience." },
];

const EssayToolkit = () => {
  const [essayText, setEssayText] = useState("");
  const [aiDetection, setAiDetection] = useState<AiDetectionResult | null>(null);
  const [sources, setSources] = useState<SourceResult | null>(null);
  const [loadingDetect, setLoadingDetect] = useState(false);
  const [loadingSources, setLoadingSources] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const wordCount = essayText.trim().split(/\s+/).filter(Boolean).length;

  const runAiDetection = async () => {
    if (!essayText.trim()) {
      toast({ title: "No text found", description: "Please paste an essay first", variant: "destructive" });
      return;
    }
    setLoadingDetect(true);
    setAiDetection(null);
    try {
      const { data, error } = await supabase.functions.invoke('essay-toolkit', {
        body: { essayContent: essayText, action: 'ai-detect' }
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setAiDetection(data);
      toast({ title: "Analysis complete ✓", description: "AI detection results are ready" });
    } catch (err: any) {
      toast({ title: "Analysis failed", description: err.message || "Please try again", variant: "destructive" });
    } finally {
      setLoadingDetect(false);
    }
  };

  const findSources = async () => {
    if (!essayText.trim()) {
      toast({ title: "No text found", description: "Please paste an essay first", variant: "destructive" });
      return;
    }
    setLoadingSources(true);
    setSources(null);
    try {
      const { data, error } = await supabase.functions.invoke('essay-toolkit', {
        body: { essayContent: essayText, action: 'sources' }
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setSources(data);
      toast({ title: "Research complete ✓", description: "Sources and ideas are ready" });
    } catch (err: any) {
      toast({ title: "Source search failed", description: err.message || "Please try again", variant: "destructive" });
    } finally {
      setLoadingSources(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score <= 30) return "text-success";
    if (score <= 60) return "text-warning-foreground";
    return "text-destructive";
  };

  const getScoreProgressColor = (score: number) => {
    if (score <= 30) return "[&>div]:bg-[hsl(var(--success))]";
    if (score <= 60) return "[&>div]:bg-[hsl(var(--warning))]";
    return "[&>div]:bg-destructive";
  };

  const getScoreLabel = (score: number) => {
    if (score <= 20) return "Very likely human-written ✨";
    if (score <= 40) return "Mostly human-written 👍";
    if (score <= 60) return "Mixed signals — review recommended";
    if (score <= 80) return "Likely AI-assisted ⚠️";
    return "Very likely AI-generated 🚨";
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setEssayText(text);
      toast({ title: "Pasted ✓", description: `${text.trim().split(/\s+/).filter(Boolean).length} words pasted from clipboard` });
    } catch {
      toast({ title: "Can't access clipboard", description: "Please paste manually with Ctrl+V", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
          <img src={primroseLogo} alt="The Primrose Review" className="h-8 w-auto opacity-70" />
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Hero Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/50 text-accent-foreground text-sm">
            <Sparkles className="h-3.5 w-3.5" />
            AI-Powered Writing Support
          </div>
          <h1 className="text-3xl font-bold text-foreground">Essay Toolkit</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Help your student write with confidence. Check for AI-generated content and discover research sources & creative angles.
          </p>
        </div>

        {/* Quick Tips Banner */}
        {!essayText && !aiDetection && !sources && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {writingTips.map((item, i) => (
              <Card key={i} className="bg-muted/30 border-dashed">
                <CardContent className="p-4 flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <item.icon className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.tip}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Input Area */}
        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Student's Essay</CardTitle>
                  <CardDescription>Paste the essay text below to get started</CardDescription>
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
            <div className="relative">
              <Textarea
                placeholder="Paste the student's essay here... &#10;&#10;Tip: You can paste a draft, a paragraph, or even just an outline to get research suggestions."
                value={essayText}
                onChange={(e) => setEssayText(e.target.value)}
                className="min-h-[220px] text-sm leading-relaxed resize-y"
              />
            </div>

            {/* Word Count & Actions */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{wordCount}</span> words
                </span>
                {wordCount > 0 && wordCount < 50 && (
                  <Badge variant="outline" className="text-xs bg-muted/50">Short text — results may be limited</Badge>
                )}
                {wordCount >= 250 && (
                  <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20">
                    <GraduationCap className="h-3 w-3 mr-1" /> Good length for analysis
                  </Badge>
                )}
              </div>
              <div className="flex gap-2">
                {essayText && (
                  <Button variant="ghost" size="sm" onClick={() => { setEssayText(""); setAiDetection(null); setSources(null); }}>
                    Clear
                  </Button>
                )}
                <Button onClick={runAiDetection} disabled={loadingDetect || !essayText.trim()} variant="outline" className="gap-2">
                  {loadingDetect ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />}
                  AI Detection
                </Button>
                <Button onClick={findSources} disabled={loadingSources || !essayText.trim()} className="gap-2">
                  {loadingSources ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  Find Sources & Ideas
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading States */}
        {(loadingDetect || loadingSources) && (
          <Card className="border-dashed">
            <CardContent className="p-8 flex flex-col items-center gap-3 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="h-6 w-6 text-primary animate-spin" />
              </div>
              <div>
                <p className="font-medium text-foreground">
                  {loadingDetect ? "Analyzing writing patterns..." : "Searching for sources & ideas..."}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {loadingDetect ? "Checking for AI-generated content indicators" : "Finding academic sources and brainstorming angles"}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {(aiDetection || sources) && !loadingDetect && !loadingSources && (
          <Tabs defaultValue={aiDetection && !sources ? "detection" : sources && !aiDetection ? "sources" : "detection"}>
            <TabsList className="w-full justify-start">
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

            {/* AI Detection Results */}
            {aiDetection && (
              <TabsContent value="detection" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bot className="h-5 w-5 text-primary" />
                      AI Detection Results
                    </CardTitle>
                    <CardDescription className="leading-relaxed">{aiDetection.summary}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Score Visual */}
                    <div className="p-5 rounded-xl bg-muted/30 space-y-4">
                      <div className="flex items-end justify-between">
                        <div>
                          <span className="text-sm text-muted-foreground">AI Probability Score</span>
                          <p className={`text-3xl font-bold ${getScoreColor(aiDetection.aiScore)}`}>
                            {aiDetection.aiScore}%
                          </p>
                        </div>
                        <Badge variant="outline" className="mb-1">
                          Confidence: {aiDetection.confidence}
                        </Badge>
                      </div>
                      <Progress value={aiDetection.aiScore} className={`h-3 ${getScoreProgressColor(aiDetection.aiScore)}`} />
                      <p className={`text-sm font-medium ${getScoreColor(aiDetection.aiScore)}`}>
                        {getScoreLabel(aiDetection.aiScore)}
                      </p>
                    </div>

                    {/* Indicators */}
                    <div className="space-y-3">
                      <h4 className="font-medium flex items-center gap-2">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        What We Found
                      </h4>
                      <div className="grid gap-2">
                        {aiDetection.indicators.map((ind, i) => (
                          <div key={i} className="flex gap-3 p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
                            {ind.type === 'ai' ? (
                              <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                            ) : (
                              <CheckCircle className="h-4 w-4 text-success mt-0.5 shrink-0" />
                            )}
                            <div className="min-w-0">
                              <p className="text-sm font-medium">{ind.description}</p>
                              {ind.excerpt && (
                                <p className="text-xs text-muted-foreground mt-1 italic truncate">"{ind.excerpt}"</p>
                              )}
                            </div>
                            <Badge variant={ind.type === 'ai' ? 'destructive' : 'secondary'} className="shrink-0 self-start text-xs">
                              {ind.type === 'ai' ? 'AI Signal' : 'Human Signal'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Guidance Note */}
                    <div className="p-4 rounded-lg bg-accent/30 border border-accent/50">
                      <p className="text-sm text-accent-foreground leading-relaxed">
                        <strong>💡 Counselor tip:</strong> A high AI score doesn't necessarily mean the student used AI dishonestly. 
                        Use this as a conversation starter — ask about their writing process and help them find their authentic voice.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* Sources & Brainstorming Results */}
            {sources && (
              <TabsContent value="sources" className="space-y-4 mt-4">
                {/* Topic & Themes */}
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-sm font-medium text-muted-foreground">Identified themes:</span>
                  {sources.keyThemes.map((theme, i) => (
                    <Badge key={i} variant="secondary" className="bg-primary/5 text-primary border-primary/15">{theme}</Badge>
                  ))}
                </div>

                {/* Academic Sources */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      Academic Sources
                    </CardTitle>
                    <CardDescription>Relevant papers and articles to strengthen the essay</CardDescription>
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
                        <a
                          href={`https://scholar.google.com/scholar?q=${encodeURIComponent(src.searchQuery)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline inline-flex items-center gap-1 font-medium"
                        >
                          <Search className="h-3 w-3" /> Search on Google Scholar →
                        </a>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Brainstorming Ideas */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-primary" />
                      Brainstorming Ideas
                    </CardTitle>
                    <CardDescription>Creative angles and perspectives to explore with your student</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {sources.brainstormingIdeas.map((idea, i) => (
                      <div key={i} className="p-4 border rounded-lg space-y-2 hover:bg-muted/20 transition-colors">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{i + 1}</div>
                          <h4 className="text-sm font-semibold">{idea.angle}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{idea.description}</p>
                        <div className="bg-muted/40 p-3 rounded-lg text-sm italic border-l-2 border-primary/30">
                          "{idea.exampleHook}"
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Suggested Readings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-primary" />
                      Suggested Readings
                    </CardTitle>
                    <CardDescription>Books and essays that could inspire deeper thinking</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    {sources.suggestedReadings.map((reading, i) => (
                      <div key={i} className="flex gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                        <BookOpen className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm">
                            <span className="font-medium">{reading.title}</span>
                            <span className="text-muted-foreground"> by {reading.author}</span>
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">{reading.why}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Guidance Note */}
                <div className="p-4 rounded-lg bg-accent/30 border border-accent/50">
                  <p className="text-sm text-accent-foreground leading-relaxed">
                    <strong>💡 Counselor tip:</strong> Share 1-2 sources with your student rather than the full list. 
                    Let them discover connections on their own — the best essays come from genuine curiosity, not assigned reading.
                  </p>
                </div>
              </TabsContent>
            )}
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default EssayToolkit;
