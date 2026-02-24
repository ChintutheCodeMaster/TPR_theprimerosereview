import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { EssayFeedbackModal } from "./EssayFeedbackModal";
import { 
  Clock, 
  Send, 
  Edit,
  FileText,
  Loader2,
  Trash2
} from "lucide-react";
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
  criteria: any[];
  issues: any[];
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

interface CounselorFeedbackHistoryProps {
  studentId?: string;
  studentName?: string;
}

export const CounselorFeedbackHistory = ({ studentId, studentName }: CounselorFeedbackHistoryProps) => {
  const [feedbackList, setFeedbackList] = useState<SavedFeedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingFeedback, setEditingFeedback] = useState<SavedFeedback | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadFeedback();
  }, [studentId]);

  const loadFeedback = async () => {
    try {
      let query = supabase
        .from('essay_feedback')
        .select('*')
        .order('updated_at', { ascending: false });

      if (studentId) {
        query = query.eq('student_id', studentId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const typedData = (data || []).map(item => ({
        id: item.id,
        student_id: item.student_id,
        counselor_id: item.counselor_id,
        essay_title: item.essay_title,
        essay_content: item.essay_content,
        essay_prompt: item.essay_prompt,
        ai_analysis: item.ai_analysis as unknown as AnalysisResult | null,
        feedback_items: (item.feedback_items as unknown as FeedbackItem[]) || [],
        manual_notes: item.manual_notes,
        personal_message: item.personal_message,
        status: item.status,
        created_at: item.created_at,
        updated_at: item.updated_at,
        sent_at: item.sent_at,
      }));

      setFeedbackList(typedData);
    } catch (error) {
      console.error("Error loading feedback:", error);
      toast({
        title: "Error",
        description: "Could not load feedback history",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline"><FileText className="h-3 w-3 mr-1" />Draft</Badge>;
      case 'sent':
        return <Badge variant="secondary"><Send className="h-3 w-3 mr-1" />Sent</Badge>;
      case 'read':
        return <Badge variant="default"><Clock className="h-3 w-3 mr-1" />Read</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (feedbackList.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No feedback history yet</p>
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
            Feedback History {studentName && `- ${studentName}`}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[300px]">
            <div className="p-4 space-y-3">
              {feedbackList.map((feedback) => (
                <div 
                  key={feedback.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm truncate">{feedback.essay_title}</span>
                      {getStatusBadge(feedback.status)}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{feedback.feedback_items.length} items</span>
                      {feedback.ai_analysis && (
                        <span>Score: {feedback.ai_analysis.overallScore}</span>
                      )}
                      <span>
                        {format(new Date(feedback.updated_at), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setEditingFeedback(feedback)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      {feedback.status === 'draft' ? 'Edit' : 'View'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

     {editingFeedback && (
  <EssayFeedbackModal
    isOpen={!!editingFeedback}
    onClose={() => {
      setEditingFeedback(null);
      loadFeedback();
    }}
    essay={{
      id: editingFeedback.id,
      title: editingFeedback.essay_title,
      studentName: studentName || "Student",
      studentId: editingFeedback.student_id,
      prompt: editingFeedback.essay_prompt || "",
      content: editingFeedback.essay_content,
    }}
  />
)}
    </>
  );
};
