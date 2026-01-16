import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Star, 
  MessageSquare, 
  Clock, 
  CheckCircle,
  Eye,
  Loader2
} from "lucide-react";
import { format } from "date-fns";

interface FeedbackItem {
  id: string;
  text: string;
  source: 'ai' | 'manual';
  criterionName?: string;
  color?: string;
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
  issues: any[];
}

interface EssayFeedback {
  id: string;
  essay_title: string;
  essay_content: string;
  essay_prompt: string | null;
  ai_analysis: AnalysisResult | null;
  feedback_items: FeedbackItem[];
  personal_message: string | null;
  status: string;
  created_at: string;
  sent_at: string | null;
}

export const StudentEssayFeedback = () => {
  const [feedbackList, setFeedbackList] = useState<EssayFeedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<EssayFeedback | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadFeedback();
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel('student-feedback')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'essay_feedback'
        },
        () => {
          loadFeedback();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadFeedback = async () => {
    try {
      const { data, error } = await supabase
        .from('essay_feedback')
        .select('*')
        .order('sent_at', { ascending: false });

      if (error) throw error;

      const typedData = (data || []).map(item => ({
        id: item.id,
        essay_title: item.essay_title,
        essay_content: item.essay_content,
        essay_prompt: item.essay_prompt,
        ai_analysis: item.ai_analysis as unknown as AnalysisResult | null,
        feedback_items: (item.feedback_items as unknown as FeedbackItem[]) || [],
        personal_message: item.personal_message,
        status: item.status,
        created_at: item.created_at,
        sent_at: item.sent_at,
      }));

      setFeedbackList(typedData);
    } catch (error) {
      console.error("Error loading feedback:", error);
      toast({
        title: "Error",
        description: "Could not load feedback",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (feedbackId: string) => {
    try {
      await supabase
        .from('essay_feedback')
        .update({ status: 'read' })
        .eq('id', feedbackId);
      
      loadFeedback();
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (feedbackList.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Feedback Yet</h3>
          <p className="text-muted-foreground">
            Your counselor hasn't sent any essay feedback yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-primary" />
        Essay Feedback
      </h2>

      <div className="grid gap-4">
        {feedbackList.map((feedback) => (
          <Card 
            key={feedback.id}
            className={`transition-all hover:shadow-md ${
              feedback.status === 'sent' ? 'border-primary/50 bg-primary/5' : ''
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{feedback.essay_title}</h3>
                    {feedback.status === 'sent' && (
                      <Badge variant="secondary" className="text-xs">
                        New
                      </Badge>
                    )}
                    {feedback.status === 'read' && (
                      <Badge variant="outline" className="text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Read
                      </Badge>
                    )}
                  </div>

                  {feedback.ai_analysis && (
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-primary" />
                        <span className="font-bold text-lg">{feedback.ai_analysis.overallScore}/100</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {feedback.feedback_items.length} feedback items
                      </span>
                    </div>
                  )}

                  {feedback.personal_message && (
                    <p className="text-sm text-muted-foreground italic line-clamp-2 mb-3">
                      "{feedback.personal_message}"
                    </p>
                  )}

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {feedback.sent_at && format(new Date(feedback.sent_at), 'MMM d, yyyy h:mm a')}
                  </div>
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedFeedback(feedback);
                        if (feedback.status === 'sent') {
                          markAsRead(feedback.id);
                        }
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[800px] h-[80vh] p-0 flex flex-col">
                    <DialogHeader className="p-6 pb-4">
                      <DialogTitle>{feedback.essay_title}</DialogTitle>
                    </DialogHeader>

                    <ScrollArea className="flex-1 p-6 pt-0">
                      <div className="space-y-6">
                        {/* Score */}
                        {feedback.ai_analysis && (
                          <div className="text-center pb-4 border-b">
                            <div className="inline-flex items-center gap-2 px-6 py-3 bg-primary/10 rounded-full">
                              <Star className="h-6 w-6 text-primary" />
                              <span className="font-bold text-2xl">{feedback.ai_analysis.overallScore}/100</span>
                            </div>
                          </div>
                        )}

                        {/* Personal Message */}
                        {feedback.personal_message && (
                          <Card className="bg-primary/5 border-primary/20">
                            <CardContent className="p-4">
                              <p className="text-sm font-medium text-primary mb-2">
                                Message from your counselor:
                              </p>
                              <p className="text-foreground">{feedback.personal_message}</p>
                            </CardContent>
                          </Card>
                        )}

                        {/* Criteria Breakdown */}
                        {feedback.ai_analysis?.criteria && (
                          <Card>
                            <CardHeader className="pb-3">
                              <CardTitle className="text-sm">Score Breakdown</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              {feedback.ai_analysis.criteria.map((criterion) => (
                                <div key={criterion.id} className="space-y-1">
                                  <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                      <div 
                                        className="w-3 h-3 rounded-full" 
                                        style={{ backgroundColor: criterion.color }}
                                      />
                                      <span>{criterion.name}</span>
                                    </div>
                                    <span className="font-medium">{criterion.score}/100</span>
                                  </div>
                                  <Progress value={criterion.score} className="h-2" />
                                </div>
                              ))}
                            </CardContent>
                          </Card>
                        )}

                        {/* Feedback Items */}
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm">Detailed Feedback</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {feedback.feedback_items.map((item, index) => (
                              <div key={item.id || index} className="p-3 rounded-lg border">
                                <div className="flex items-start gap-2">
                                  {item.color && (
                                    <div 
                                      className="w-3 h-3 rounded-full mt-1 flex-shrink-0" 
                                      style={{ backgroundColor: item.color }}
                                    />
                                  )}
                                  <div>
                                    {item.criterionName && (
                                      <span className="text-xs font-medium text-muted-foreground block mb-1">
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
                      </div>
                    </ScrollArea>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
