import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Clock, Send, FileText, Loader2, Eye } from "lucide-react";
import { format } from "date-fns";

interface FeedbackItem {
  id: string;
  text: string;
  source: 'ai' | 'manual';
  criterionName?: string;
  color?: string;
}

interface AnalysisResult {
  overallScore: number;
  criteria: { id: string; name: string; score: number; color: string }[];
  issues: any[];
}

interface HistoryVersion {
  id: string;
  version: number;
  essay_content: string | null;
  feedback_items: FeedbackItem[];
  manual_notes: string | null;
  personal_message: string | null;
  ai_analysis: AnalysisResult | null;
  status: 'draft' | 'sent';
  created_at: string;
}

interface CounselorFeedbackHistoryProps {
  essayId: string;
}

export const CounselorFeedbackHistory = ({ essayId }: CounselorFeedbackHistoryProps) => {
  const [versions, setVersions] = useState<HistoryVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewing, setViewing] = useState<HistoryVersion | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!essayId) return;
    loadHistory();
  }, [essayId]);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('essay_feedback_history')
        .select('*')
        .eq('essay_id', essayId)
        .order('version', { ascending: false })
        .limit(2);

      if (error) throw error;
      setVersions((data || []) as unknown as HistoryVersion[]);
    } catch (error) {
      console.error("Error loading feedback history:", error);
      toast({ title: "Error", description: "Could not load feedback history", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <Card>
        <CardContent className="py-6 text-center">
          <Clock className="h-8 w-8 mx-auto text-muted-foreground mb-2 opacity-50" />
          <p className="text-sm text-muted-foreground">No feedback versions yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Versions are saved each time you save a draft or send feedback
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Feedback History
            <Badge variant="secondary" className="ml-auto text-xs">
              Last {versions.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0 space-y-2">
          {versions.map((v) => (
            <div
              key={v.id}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border bg-muted/20"
            >
              {/* Version + status */}
              <Badge variant="outline" className="text-xs font-mono shrink-0">
                v{v.version}
              </Badge>
              <Badge
                variant={v.status === 'sent' ? 'default' : 'secondary'}
                className="text-xs shrink-0"
              >
                {v.status === 'sent'
                  ? <><Send className="h-2.5 w-2.5 mr-1" />Sent</>
                  : <><FileText className="h-2.5 w-2.5 mr-1" />Draft</>
                }
              </Badge>

              {/* Meta */}
              <div className="flex-1 min-w-0 text-xs text-muted-foreground">
                <span>{format(new Date(v.created_at), 'MMM d, h:mm a')}</span>
                {v.ai_analysis?.overallScore != null && (
                  <span className="ml-2">· Score: <span className="font-medium text-foreground">{v.ai_analysis.overallScore}</span></span>
                )}
              </div>

              {/* View button */}
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs shrink-0"
                onClick={() => setViewing(v)}
              >
                <Eye className="h-3 w-3 mr-1" />
                View
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Snapshot modal */}
      <Dialog open={!!viewing} onOpenChange={(open) => { if (!open) setViewing(null); }}>
        <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0">
          <DialogHeader className="px-6 py-4 border-b border-border shrink-0">
            <div className="flex items-center gap-3">
              <DialogTitle className="text-base">
                Version {viewing?.version} Snapshot
              </DialogTitle>
              {viewing && (
                <Badge variant={viewing.status === 'sent' ? 'default' : 'secondary'} className="text-xs">
                  {viewing.status === 'sent' ? 'Sent' : 'Draft'}
                </Badge>
              )}
              {viewing && (
                <span className="text-xs text-muted-foreground ml-auto">
                  {format(new Date(viewing.created_at), 'MMMM d, yyyy · h:mm a')}
                </span>
              )}
            </div>
          </DialogHeader>

          {viewing && (
            <div className="flex flex-1 min-h-0">

              {/* Essay text — left 2/3 */}
              <div className="flex-1 border-r border-border flex flex-col min-h-0">
                <div className="px-6 py-3 border-b border-border bg-muted/30 shrink-0">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Essay Text</p>
                </div>
                <ScrollArea className="flex-1">
                  <div className="p-6 font-serif text-base leading-relaxed whitespace-pre-wrap text-foreground">
                    {viewing.essay_content ?? (
                      <span className="text-muted-foreground italic">
                        Essay text not captured for this version. Future saves will include a snapshot.
                      </span>
                    )}
                  </div>
                </ScrollArea>
              </div>

              {/* Feedback panel — right 1/3 */}
              <div className="w-80 shrink-0 flex flex-col min-h-0">

                {/* AI score */}
                {viewing.ai_analysis && (
                  <div className="px-4 py-3 border-b border-border bg-muted/30 shrink-0">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">AI Score</p>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-bold text-primary">{viewing.ai_analysis.overallScore}</span>
                      <span className="text-xs text-muted-foreground">/ 100</span>
                    </div>
                    {viewing.ai_analysis.criteria?.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {viewing.ai_analysis.criteria.map((c) => (
                          <div key={c.id} className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground truncate mr-2">{c.name}</span>
                            <span className="font-medium" style={{ color: c.color }}>{c.score}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <ScrollArea className="flex-1">
                  <div className="p-4 space-y-3">

                    {/* Personal message */}
                    {viewing.personal_message && (
                      <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                        <p className="text-xs font-medium text-primary mb-1">Personal Note</p>
                        <p className="text-xs text-foreground leading-relaxed">{viewing.personal_message}</p>
                      </div>
                    )}

                    {/* Feedback items */}
                    {viewing.feedback_items?.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Feedback ({viewing.feedback_items.length})
                        </p>
                        {viewing.feedback_items.map((item, i) => (
                          <div
                            key={item.id ?? i}
                            className="p-2.5 rounded-lg bg-muted/50 border border-border"
                          >
                            {item.color && (
                              <div className="flex items-center gap-1.5 mb-1">
                                <div
                                  className="w-2 h-2 rounded-full shrink-0"
                                  style={{ backgroundColor: item.color }}
                                />
                                {item.criterionName && (
                                  <span className="text-[10px] font-medium text-muted-foreground">
                                    {item.criterionName}
                                  </span>
                                )}
                              </div>
                            )}
                            <p className="text-xs text-foreground leading-relaxed">{item.text}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic text-center py-4">
                        No feedback items in this version
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
