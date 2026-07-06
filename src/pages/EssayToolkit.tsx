import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Search, Bot, Lightbulb, BookOpen, AlertTriangle, CheckCircle, Loader2, ArrowLeft, PenTool, GraduationCap, Quote, ClipboardPaste } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PageShell, PageHeader, HairlineCard, BlurOrb } from "@/components/primrose-night";

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

const sectionVariants = {
  hidden: { opacity: 0, y: 10, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: [0.2, 0.6, 0.2, 1] as const },
  },
};

const writingTips = [
  { icon: PenTool, tip: "Start with a vivid personal moment — admissions officers remember stories, not statements." },
  { icon: Quote, tip: "Show, don't tell. Instead of saying 'I'm passionate,' describe the moment that ignited it." },
  { icon: Lightbulb, tip: "Their unique perspective is their superpower. No one else has lived their exact experience." },
];

const scoreTone = (score: number) => {
  if (score <= 30) return "var(--pn-sage)";
  if (score <= 60) return "var(--pn-gold)";
  return "var(--pn-pink)";
};

const scoreToneText = (score: number) => {
  if (score <= 30) return "text-[color:var(--pn-sage)]";
  if (score <= 60) return "text-[color:var(--pn-gold)]";
  return "text-[color:var(--pn-pink)]";
};

const AnimatedBar = ({ pct, tone, className = "w-full" }: { pct: number; tone: string; className?: string }) => (
  <div className={`h-2 rounded-full bg-white/[0.05] overflow-hidden ${className}`}>
    <motion.div
      className="h-full"
      style={{ background: tone }}
      initial={{ width: 0 }}
      animate={{ width: `${pct}%` }}
      transition={{ duration: 0.9, ease: [0.2, 0.6, 0.2, 1], delay: 0.15 }}
    />
  </div>
);

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

  const getScoreLabel = (score: number) => {
    if (score <= 20) return "Very likely human-written.";
    if (score <= 40) return "Mostly human-written.";
    if (score <= 60) return "Mixed signals — review recommended.";
    if (score <= 80) return "Likely AI-assisted.";
    return "Very likely AI-generated.";
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
    <PageShell>
      <BlurOrb tone="sage" className="top-[-100px] left-[-100px] w-[500px] h-[500px]" />
      <BlurOrb tone="pink" className="bottom-[-120px] right-[-120px] w-[420px] h-[420px]" />

      <div className="flex items-center gap-2 mb-2">
        <Button
          variant="ghost"
          size="sm"
          className="hairline hover:bg-white/[0.03] text-muted-foreground hover:text-foreground gap-2"
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Button>
      </div>

      <PageHeader
        eyebrow="AI-Powered Toolkit"
        title={<>Essay toolkit.</>}
        subtitle={<>Help your student write with confidence — check the voice, spark the angle.</>}
      />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
        className="space-y-6"
      >
        {/* Quick Tips */}
        {!essayText && !aiDetection && !sources && (
          <motion.div variants={sectionVariants} className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {writingTips.map((item, i) => (
              <HairlineCard key={i} className="border-dashed border-white/[0.10]">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full hairline bg-[color:var(--pn-sage)]/10 flex items-center justify-center shrink-0">
                    <item.icon className="h-4 w-4 text-[color:var(--pn-sage)]" />
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed font-serif italic">{item.tip}</p>
                </div>
              </HairlineCard>
            ))}
          </motion.div>
        )}

        {/* Input Area */}
        <motion.div variants={sectionVariants}>
          <HairlineCard>
            <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg hairline bg-[color:var(--pn-gold)]/10 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-[color:var(--pn-gold)]" />
                </div>
                <div>
                  <h3 className="font-serif text-xl text-foreground leading-tight">Their essay</h3>
                  <p className="text-sm text-muted-foreground font-serif italic">Paste the draft below to begin.</p>
                </div>
              </div>
              {!essayText && (
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-transparent hairline hover:bg-white/[0.03] text-foreground shadow-none gap-2"
                  onClick={handlePaste}
                >
                  <ClipboardPaste className="h-4 w-4" />
                  Paste from clipboard
                </Button>
              )}
            </div>

            <Textarea
              placeholder="Paste the student's essay here…&#10;&#10;Tip: A draft, a paragraph, or an outline all work."
              value={essayText}
              onChange={(e) => setEssayText(e.target.value)}
              className="min-h-[220px] font-serif text-base leading-relaxed resize-y bg-white/[0.02] hairline focus-visible:ring-0 focus-visible:ring-offset-0"
            />

            <div className="flex items-center justify-between flex-wrap gap-3 mt-4">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm text-muted-foreground">
                  <span className="num-display text-foreground">{wordCount}</span> words
                </span>
                {wordCount > 0 && wordCount < 50 && (
                  <span className="hairline rounded-full px-2 py-0.5 text-xs text-muted-foreground bg-white/[0.02]">
                    Short — results may be limited
                  </span>
                )}
                {wordCount >= 250 && (
                  <span className="hairline rounded-full px-2 py-0.5 text-xs bg-[color:var(--pn-sage)]/15 text-[color:var(--pn-sage)] inline-flex items-center gap-1">
                    <GraduationCap className="h-3 w-3" /> Good length for analysis
                  </span>
                )}
              </div>
              <div className="flex gap-2 flex-wrap">
                {essayText && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hairline hover:bg-white/[0.03] text-muted-foreground hover:text-foreground"
                    onClick={() => { setEssayText(""); setAiDetection(null); setSources(null); }}
                  >
                    Clear
                  </Button>
                )}
                <Button
                  onClick={runAiDetection}
                  disabled={loadingDetect || !essayText.trim()}
                  className="bg-transparent hairline hover:bg-white/[0.03] text-foreground shadow-none gap-2"
                >
                  {loadingDetect ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />}
                  AI detection
                </Button>
                <Button
                  onClick={findSources}
                  disabled={loadingSources || !essayText.trim()}
                  className="bg-transparent hairline hover:bg-white/[0.03] text-[color:var(--pn-pink)] shadow-none gap-2"
                >
                  {loadingSources ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  Sources & ideas
                </Button>
              </div>
            </div>
          </HairlineCard>
        </motion.div>

        {/* Loading */}
        {(loadingDetect || loadingSources) && (
          <motion.div variants={sectionVariants}>
            <HairlineCard className="border-dashed border-white/[0.10]">
              <div className="p-4 flex flex-col items-center gap-3 text-center">
                <div className="w-12 h-12 rounded-full hairline bg-[color:var(--pn-sage)]/10 flex items-center justify-center">
                  <Loader2 className="h-5 w-5 text-[color:var(--pn-sage)] animate-spin" />
                </div>
                <div>
                  <p className="font-serif text-lg text-foreground">
                    {loadingDetect ? "Reading the writing patterns…" : "Searching for sources & ideas…"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1 font-serif italic">
                    {loadingDetect ? "Checking for AI-generated content indicators." : "Finding academic sources and brainstorming angles."}
                  </p>
                </div>
              </div>
            </HairlineCard>
          </motion.div>
        )}

        {/* Results */}
        {(aiDetection || sources) && !loadingDetect && !loadingSources && (
          <motion.div variants={sectionVariants}>
            <Tabs defaultValue={aiDetection && !sources ? "detection" : sources && !aiDetection ? "sources" : "detection"}>
              <TabsList className="w-full justify-start bg-white/[0.02] hairline p-1 h-auto">
                {aiDetection && (
                  <TabsTrigger
                    value="detection"
                    className="data-[state=active]:bg-white/[0.06] data-[state=active]:text-foreground data-[state=active]:shadow-none text-muted-foreground gap-1.5"
                  >
                    <Bot className="h-4 w-4" /> AI detection
                  </TabsTrigger>
                )}
                {sources && (
                  <TabsTrigger
                    value="sources"
                    className="data-[state=active]:bg-white/[0.06] data-[state=active]:text-foreground data-[state=active]:shadow-none text-muted-foreground gap-1.5"
                  >
                    <BookOpen className="h-4 w-4" /> Sources & ideas
                  </TabsTrigger>
                )}
              </TabsList>

              {/* AI Detection */}
              {aiDetection && (
                <TabsContent value="detection" className="space-y-4 mt-4">
                  <HairlineCard>
                    <div className="mb-5">
                      <h3 className="font-serif text-2xl text-foreground leading-tight flex items-center gap-2">
                        <Bot className="h-5 w-5 text-[color:var(--pn-sage)]" />
                        What the writing tells us.
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mt-2">{aiDetection.summary}</p>
                    </div>

                    {/* Score */}
                    <div className="p-5 rounded-xl hairline bg-white/[0.02] space-y-4">
                      <div className="flex items-end justify-between">
                        <div>
                          <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">AI probability</span>
                          <p className={`num-display text-4xl ${scoreToneText(aiDetection.aiScore)}`}>
                            {aiDetection.aiScore}%
                          </p>
                        </div>
                        <span className="hairline rounded-full px-2 py-0.5 text-xs text-muted-foreground bg-white/[0.02] mb-1">
                          Confidence: {aiDetection.confidence}
                        </span>
                      </div>
                      <AnimatedBar pct={aiDetection.aiScore} tone={scoreTone(aiDetection.aiScore)} />
                      <p className={`text-sm font-serif italic ${scoreToneText(aiDetection.aiScore)}`}>
                        {getScoreLabel(aiDetection.aiScore)}
                      </p>
                    </div>

                    {/* Indicators */}
                    <div className="space-y-3 mt-5">
                      <h4 className="font-serif text-lg text-foreground flex items-center gap-2">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        What we found
                      </h4>
                      <div className="grid gap-2">
                        {aiDetection.indicators.map((ind, i) => (
                          <div key={i} className="flex gap-3 p-3 rounded-lg hairline bg-white/[0.02] hover:bg-white/[0.03] transition-colors">
                            {ind.type === 'ai' ? (
                              <AlertTriangle className="h-4 w-4 text-[color:var(--pn-pink)] mt-0.5 shrink-0" />
                            ) : (
                              <CheckCircle className="h-4 w-4 text-[color:var(--pn-sage)] mt-0.5 shrink-0" />
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="text-sm text-foreground">{ind.description}</p>
                              {ind.excerpt && (
                                <p className="text-xs text-muted-foreground mt-1 italic font-serif truncate">"{ind.excerpt}"</p>
                              )}
                            </div>
                            <span className={`shrink-0 self-start inline-flex items-center px-2 py-0.5 rounded-full text-[10px] uppercase tracking-[0.14em] ${
                              ind.type === 'ai'
                                ? 'bg-[color:var(--pn-pink)]/15 text-[color:var(--pn-pink)] hairline'
                                : 'bg-[color:var(--pn-sage)]/15 text-[color:var(--pn-sage)] hairline'
                            }`}>
                              {ind.type === 'ai' ? 'AI signal' : 'Human signal'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Counselor tip */}
                    <div className="p-4 rounded-lg hairline bg-[color:var(--pn-gold)]/10 mt-5">
                      <p className="text-sm text-foreground leading-relaxed">
                        <strong className="text-[color:var(--pn-gold)]">Counselor tip:</strong> A high AI score doesn't necessarily mean the student used AI dishonestly. Use it as a conversation starter — ask about their writing process and help them find their authentic voice.
                      </p>
                    </div>
                  </HairlineCard>
                </TabsContent>
              )}

              {/* Sources */}
              {sources && (
                <TabsContent value="sources" className="space-y-4 mt-4">
                  {/* Themes */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Themes:</span>
                    {sources.keyThemes.map((theme, i) => (
                      <span key={i} className="hairline rounded-full px-3 py-1 text-xs bg-[color:var(--pn-sage)]/10 text-[color:var(--pn-sage)]">
                        {theme}
                      </span>
                    ))}
                  </div>

                  {/* Academic Sources */}
                  <HairlineCard>
                    <div className="mb-4">
                      <h3 className="font-serif text-xl text-foreground flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-[color:var(--pn-sage)]" />
                        Academic sources
                      </h3>
                      <p className="text-sm text-muted-foreground font-serif italic mt-1">
                        Papers to strengthen the essay.
                      </p>
                    </div>
                    <div className="space-y-3">
                      {sources.academicSources.map((src, i) => (
                        <div key={i} className="p-4 hairline rounded-lg bg-white/[0.02] space-y-2 hover:bg-white/[0.03] transition-colors">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-serif text-lg text-foreground leading-tight">{src.title}</h4>
                            <span className="hairline rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground shrink-0">
                              {src.type}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">by {src.author}</p>
                          <p className="text-sm text-muted-foreground leading-relaxed">{src.relevance}</p>
                          <a
                            href={`https://scholar.google.com/scholar?q=${encodeURIComponent(src.searchQuery)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-[color:var(--pn-pink)] hover:underline inline-flex items-center gap-1"
                          >
                            <Search className="h-3 w-3" /> Search on Google Scholar →
                          </a>
                        </div>
                      ))}
                    </div>
                  </HairlineCard>

                  {/* Brainstorming */}
                  <HairlineCard>
                    <div className="mb-4">
                      <h3 className="font-serif text-xl text-foreground flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-[color:var(--pn-gold)]" />
                        Angles to try
                      </h3>
                      <p className="text-sm text-muted-foreground font-serif italic mt-1">
                        Fresh directions to talk through together.
                      </p>
                    </div>
                    <div className="space-y-3">
                      {sources.brainstormingIdeas.map((idea, i) => (
                        <div key={i} className="p-4 hairline rounded-lg bg-white/[0.02] space-y-2 hover:bg-white/[0.03] transition-colors">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full hairline bg-[color:var(--pn-gold)]/15 flex items-center justify-center text-xs num-display text-[color:var(--pn-gold)]">
                              {i + 1}
                            </div>
                            <h4 className="font-serif text-lg text-foreground">{idea.angle}</h4>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">{idea.description}</p>
                          <div className="hairline rounded-lg p-3 text-sm italic font-serif border-l-2 border-[color:var(--pn-pink)]/40 bg-white/[0.03] text-foreground">
                            "{idea.exampleHook}"
                          </div>
                        </div>
                      ))}
                    </div>
                  </HairlineCard>

                  {/* Suggested Readings */}
                  <HairlineCard>
                    <div className="mb-4">
                      <h3 className="font-serif text-xl text-foreground flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-[color:var(--pn-pink)]" />
                        Worth reading
                      </h3>
                      <p className="text-sm text-muted-foreground font-serif italic mt-1">
                        Books and essays that could inspire deeper thinking.
                      </p>
                    </div>
                    <div className="space-y-1">
                      {sources.suggestedReadings.map((reading, i) => (
                        <div key={i} className="flex gap-3 p-3 rounded-lg hover:bg-white/[0.03] transition-colors">
                          <BookOpen className="h-4 w-4 text-[color:var(--pn-pink)] mt-0.5 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm text-foreground">
                              <span className="font-serif">{reading.title}</span>
                              <span className="text-muted-foreground"> by {reading.author}</span>
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5 font-serif italic">{reading.why}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </HairlineCard>

                  {/* Counselor tip */}
                  <div className="p-4 rounded-lg hairline bg-[color:var(--pn-sage)]/10">
                    <p className="text-sm text-foreground leading-relaxed">
                      <strong className="text-[color:var(--pn-sage)]">Counselor tip:</strong> Share 1–2 sources with your student rather than the full list. Let them discover connections on their own — the best essays come from genuine curiosity, not assigned reading.
                    </p>
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </motion.div>
        )}
      </motion.div>
    </PageShell>
  );
};

export default EssayToolkit;
