import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useEditEssay } from "@/hooks/useeditEssay";
import {
  ArrowLeft,
  Save,
  Send,
  Loader2,
  FileText,
  CheckCircle,
  MessageCircle,
  Clock,
  RotateCcw,
} from "lucide-react";

const countWords = (text: string) =>
  text.split(/\s+/).filter(Boolean).length;

const getStatusColor = (status: string) => {
  switch (status) {
    case "sent":        return "bg-green-500/10 text-green-600 border-green-500/20";
    case "in_progress": return "bg-blue-500/10 text-blue-600 border-blue-500/20";
    case "draft":       return "bg-muted text-muted-foreground";
    case "pending":     return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
    default:            return "bg-muted text-muted-foreground";
  }
};

const EditEssay = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const essayId = searchParams.get("id");

  const { essay, isLoading, saveDraft, resubmit } = useEditEssay(essayId);

  const [content, setContent] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [hasChanges, setHasChanges] = useState(false);

  // Populate editor once essay loads
  useEffect(() => {
    if (essay) {
      setContent(essay.essay_content);
      setWordCount(countWords(essay.essay_content));
    }
  }, [essay]);

  const handleContentChange = (value: string) => {
    setContent(value);
    setWordCount(countWords(value));
    setHasChanges(value !== essay?.essay_content);
  };

  // ── Loading ──────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!essay) return null;

  const hasFeedback = essay.feedback_items && essay.feedback_items.length > 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/student-personal-area")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-primary" />
              <h1 className="font-semibold text-foreground truncate max-w-[300px]">
                {essay.essay_title}
              </h1>
              <Badge className={getStatusColor(essay.status)}>
                {essay.status.replace(/_/g, " ")}
              </Badge>
              {hasChanges && (
                <Badge variant="outline" className="text-xs">
                  Unsaved changes
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{wordCount} words</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => saveDraft.mutate(content)}
              disabled={saveDraft.isPending || !hasChanges}
            >
              {saveDraft.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Draft
            </Button>
            <Button
              size="sm"
              onClick={() => resubmit.mutate(content)}
              disabled={resubmit.isPending || !content.trim()}
            >
              {resubmit.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Resubmit for Review
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Essay editor — 2/3 width */}
          <div className="lg:col-span-2 space-y-4">
            {essay.essay_prompt && (
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs font-medium text-muted-foreground mb-1">PROMPT</p>
                  <p className="text-sm text-foreground leading-relaxed">
                    {essay.essay_prompt}
                  </p>
                </CardContent>
              </Card>
            )}

            <Card className="border-2 focus-within:border-primary/50 transition-colors">
              <CardContent className="p-0">
                <Textarea
                  value={content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  className="min-h-[600px] resize-none border-0 focus-visible:ring-0 text-base leading-relaxed p-6 font-serif"
                  placeholder="Start writing your essay..."
                />
              </CardContent>
            </Card>

            <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
              <span>{wordCount} words</span>
              <span>
                Last updated:{" "}
                {new Date(essay.updated_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>

          {/* Right panel */}
          <div className="space-y-4">

            {/* Resubmit CTA */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4 text-primary" />
                  <p className="text-sm font-medium text-foreground">
                    Ready to resubmit?
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Once you resubmit, your counselor will be notified and can
                  review your revised essay.
                </p>
                <Button
                  className="w-full"
                  size="sm"
                  onClick={() => resubmit.mutate(content)}
                  disabled={resubmit.isPending || !content.trim()}
                >
                  {resubmit.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Resubmit for Review
                </Button>
              </CardContent>
            </Card>

            {/* Counselor feedback */}
            {hasFeedback ? (
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-border">
                    <MessageCircle className="h-4 w-4 text-primary" />
                    <p className="text-sm font-medium text-foreground">
                      Counselor Feedback
                    </p>
                    <Badge variant="secondary" className="text-xs ml-auto">
                      {essay.feedback_items!.length} notes
                    </Badge>
                  </div>

                  {essay.personal_message && (
                    <div className="p-3 bg-primary/5 rounded-lg">
                      <p className="text-xs font-medium text-primary mb-1">
                        Personal Note
                      </p>
                      <p className="text-xs text-foreground leading-relaxed">
                        {essay.personal_message}
                      </p>
                    </div>
                  )}

                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {essay.feedback_items!.map((item: any, index: number) => (
                      <div
                        key={item.id ?? index}
                        className="p-3 rounded-lg bg-muted/50 border border-border"
                      >
                        {item.color && (
                          <div className="flex items-center gap-1.5 mb-1">
                            <div
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: item.color }}
                            />
                            {item.criterionName && (
                              <span className="text-[10px] text-muted-foreground font-medium">
                                {item.criterionName}
                              </span>
                            )}
                          </div>
                        )}
                        <p className="text-xs text-foreground leading-relaxed">
                          {item.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <Clock className="h-8 w-8 mx-auto mb-3 text-muted-foreground opacity-50" />
                  <p className="text-sm text-muted-foreground">No feedback yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your counselor will review your essay soon
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Tips */}
            <Card className="bg-muted/30">
              <CardContent className="p-4 space-y-2">
                <p className="text-xs font-medium text-foreground">Writing Tips</p>
                <ul className="text-xs text-muted-foreground space-y-1.5">
                  <li className="flex items-start gap-1.5">
                    <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 shrink-0" />
                    Address each piece of feedback directly
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 shrink-0" />
                    Keep your authentic voice throughout
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 shrink-0" />
                    Most essays are 650 words or less
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 shrink-0" />
                    Save drafts often to avoid losing work
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditEssay;