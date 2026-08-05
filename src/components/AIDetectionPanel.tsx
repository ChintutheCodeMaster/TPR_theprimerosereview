import { useEffect, useState } from "react";
import { Bot, Search, AlertTriangle, CheckCircle, Loader2, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface AiDetectionResult {
  aiScore: number;
  humanScore: number;
  confidence: string;
  summary: string;
  indicators: { type: string; description: string; excerpt: string }[];
}

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

interface AIDetectionPanelProps {
  essayId: string;
  essayContent: string;
  essayPrompt?: string | null;
}

export const AIDetectionPanel = ({ essayId, essayContent, essayPrompt }: AIDetectionPanelProps) => {
  const [result, setResult] = useState<AiDetectionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [hydrating, setHydrating] = useState(true);
  const { toast } = useToast();

  // Hydrate stored result on mount. If the analyzed content no longer matches
  // the current essay content (student re-sent), skip it — counselor sees the
  // button again.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase
          .from("essay_feedback")
          .select("ai_detection, ai_detection_content")
          .eq("id", essayId)
          .maybeSingle();

        if (cancelled) return;
        if (error) throw error;

        if (
          data?.ai_detection &&
          data?.ai_detection_content &&
          data.ai_detection_content === essayContent
        ) {
          setResult(data.ai_detection as AiDetectionResult);
        } else {
          setResult(null);
        }
      } catch {
        // Columns may not exist yet — fail open (button still works).
        if (!cancelled) setResult(null);
      } finally {
        if (!cancelled) setHydrating(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [essayId, essayContent]);

  const runDetection = async () => {
    if (!essayContent?.trim()) {
      toast({
        title: "No essay content",
        description: "This essay has no text to analyze.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("essay-toolkit", {
        body: { essayContent, action: "ai-detect" },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data);

      // Persist alongside the snapshot of what was analyzed. Fail silently on
      // schema mismatch so the counselor still gets a live result.
      try {
        await supabase
          .from("essay_feedback")
          .update({
            ai_detection: data,
            ai_detection_content: essayContent,
          })
          .eq("id", essayId);
      } catch (persistErr) {
        console.warn("Could not persist AI detection result:", persistErr);
      }

      toast({ title: "Analysis complete ✓", description: "AI detection results are ready" });
    } catch (err: any) {
      toast({
        title: "Analysis failed",
        description: err.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-w-0 space-y-4">
      {/* Essay text (so the counselor sees what's being analyzed) */}
      <Card className="min-w-0">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4" />
            Essay Text
          </CardTitle>
        </CardHeader>
        <CardContent className="min-w-0">
          {essayPrompt && (
            <div className="mb-3 p-3 bg-muted rounded-lg">
              <p className="text-xs font-medium mb-1">Prompt</p>
              <p className="text-xs text-muted-foreground break-words whitespace-pre-wrap">
                {essayPrompt}
              </p>
            </div>
          )}
          <div className="max-h-64 overflow-y-auto rounded-md border bg-muted/20 p-3">
            <p className="text-sm text-foreground whitespace-pre-wrap break-words leading-relaxed">
              {essayContent || "This essay has no text yet."}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Run detection action */}
      <Card className="min-w-0">
        <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 min-w-0">
          <div className="min-w-0">
            <p className="font-medium">Run AI Detection</p>
            <p className="text-sm text-muted-foreground break-words">
              Check the essay for signals of AI-generated content.
            </p>
          </div>
          <Button
            onClick={runDetection}
            disabled={loading || hydrating}
            className="gap-2 shrink-0"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />}
            {loading ? "Analyzing…" : result ? "Re-run Detection" : "Run Detection"}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card className="min-w-0">
          <CardHeader className="min-w-0">
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              AI Detection Results
            </CardTitle>
            <CardDescription className="leading-relaxed break-words">
              {result.summary}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 min-w-0">
            <div className="p-5 rounded-xl bg-muted/30 space-y-4 min-w-0">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-sm text-muted-foreground">AI Probability Score</span>
                  <p className={`text-3xl font-bold ${getScoreColor(result.aiScore)}`}>
                    {result.aiScore}%
                  </p>
                </div>
                <Badge variant="outline" className="mb-1 shrink-0">
                  Confidence: {result.confidence}
                </Badge>
              </div>
              <Progress
                value={result.aiScore}
                className={`h-3 ${getScoreProgressColor(result.aiScore)}`}
              />
              <p className={`text-sm font-medium ${getScoreColor(result.aiScore)}`}>
                {getScoreLabel(result.aiScore)}
              </p>
            </div>

            <div className="space-y-3 min-w-0">
              <h4 className="font-medium flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                What We Found
              </h4>
              <div className="grid gap-2 min-w-0">
                {result.indicators.map((ind, i) => (
                  <div
                    key={i}
                    className="flex flex-wrap gap-3 p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors min-w-0"
                  >
                    {ind.type === "ai" ? (
                      <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-success mt-0.5 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0 basis-0">
                      <p className="text-sm font-medium break-words">{ind.description}</p>
                      {ind.excerpt && (
                        <p className="text-xs text-muted-foreground mt-1 italic break-words line-clamp-3">
                          "{ind.excerpt}"
                        </p>
                      )}
                    </div>
                    <Badge
                      variant={ind.type === "ai" ? "destructive" : "secondary"}
                      className="shrink-0 self-start text-xs"
                    >
                      {ind.type === "ai" ? "AI Signal" : "Human Signal"}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-accent/30 border border-accent/50">
              <p className="text-sm text-accent-foreground leading-relaxed break-words">
                <strong>💡 Counselor tip:</strong> A high AI score doesn't necessarily mean the
                student used AI dishonestly. Use this as a conversation starter — ask about their
                writing process and help them find their authentic voice.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
