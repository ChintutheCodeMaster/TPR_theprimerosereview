import React, { useState, useEffect, useMemo } from "react";
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
  Strikethrough,
  Eye,
  Pencil,
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

interface PendingChange {
  id: string;
  originalText: string;
  suggestedText: string;
  startIndex: number;
  endIndex: number;
  status: 'pending' | 'accepted' | 'rejected';
}

interface AnnotatedFeedback {
  id: string;
  text: string;
  color?: string;
  criterionName?: string;
  startIndex: number;
  endIndex: number;
}

const EditEssay = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const essayId = searchParams.get("id");

  const { essay, isLoading, saveDraft, resubmit } = useEditEssay(essayId);

  const [content, setContent] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [hasChanges, setHasChanges] = useState(false);
  const [viewMode, setViewMode] = useState<'edit' | 'review'>('edit');
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([]);

  useEffect(() => {
    if (essay) {
      setContent(essay.essay_content);
      setWordCount(countWords(essay.essay_content));
      const raw = (essay.track_changes as Array<{
        id: string; originalText: string; suggestedText: string;
        startIndex: number; endIndex: number;
      }> | null) ?? [];
      setPendingChanges(raw.map(c => ({ ...c, status: 'pending' as const })));
    }
  }, [essay]);

  const handleContentChange = (value: string) => {
    setContent(value);
    setWordCount(countWords(value));
    setHasChanges(value !== essay?.essay_content);
  };

  // Feedback items that have position data (from AI issues the counselor explicitly added)
  const annotatedFeedback: AnnotatedFeedback[] = useMemo(() => {
    if (!essay?.feedback_items) return [];
    return (essay.feedback_items as any[])
      .filter(item => typeof item.startIndex === 'number' && typeof item.endIndex === 'number')
      .map(item => ({
        id: item.id,
        text: item.text,
        color: item.color,
        criterionName: item.criterionName,
        startIndex: item.startIndex,
        endIndex: item.endIndex,
      }));
  }, [essay?.feedback_items]);

  const hasReviewContent = pendingChanges.length > 0 || annotatedFeedback.length > 0;
  const acceptedCount = pendingChanges.filter(c => c.status === 'accepted').length;
  const rejectedCount = pendingChanges.filter(c => c.status === 'rejected').length;
  const pendingCount  = pendingChanges.filter(c => c.status === 'pending').length;

  const acceptChange = (id: string) =>
    setPendingChanges(prev => prev.map(c => c.id === id ? { ...c, status: 'accepted' } : c));

  const rejectChange = (id: string) =>
    setPendingChanges(prev => prev.map(c => c.id === id ? { ...c, status: 'rejected' } : c));

  const undoChange = (id: string) =>
    setPendingChanges(prev => prev.map(c => c.id === id ? { ...c, status: 'pending' } : c));

  const acceptAll = () =>
    setPendingChanges(prev => prev.map(c => c.status === 'pending' ? { ...c, status: 'accepted' } : c));

  const rejectAll = () =>
    setPendingChanges(prev => prev.map(c => c.status === 'pending' ? { ...c, status: 'rejected' } : c));

  // Apply accepted changes to editor content (from end→start to keep indices valid)
  const applyAcceptedChanges = () => {
    const accepted = pendingChanges.filter(c => c.status === 'accepted');
    if (!accepted.length) return;
    const sorted = [...accepted].sort((a, b) => b.startIndex - a.startIndex);
    let newContent = essay!.essay_content;
    for (const change of sorted) {
      newContent =
        newContent.slice(0, change.startIndex) +
        change.suggestedText +
        newContent.slice(change.endIndex);
    }
    setContent(newContent);
    setWordCount(countWords(newContent));
    setHasChanges(newContent !== essay!.essay_content);
    setPendingChanges(prev => prev.filter(c => c.status !== 'accepted'));
    setViewMode('edit');
  };

  // Render essay text with inline track-change markups and feedback highlights
  const renderReview = (): React.ReactNode[] => {
    const baseText = essay!.essay_content;

    type Ann =
      | { type: 'change';   data: PendingChange;      start: number; end: number }
      | { type: 'feedback'; data: AnnotatedFeedback;  start: number; end: number };

    const anns: Ann[] = [
      ...pendingChanges
        .filter(c => c.status !== 'rejected')
        .map(c => ({ type: 'change' as const, data: c, start: c.startIndex, end: c.endIndex })),
      ...annotatedFeedback
        .map(f => ({ type: 'feedback' as const, data: f, start: f.startIndex, end: f.endIndex })),
    ].sort((a, b) => a.start - b.start);

    const parts: React.ReactNode[] = [];
    let pos = 0;

    for (const ann of anns) {
      if (ann.start < pos) continue; // skip overlaps

      if (ann.start > pos) {
        parts.push(<span key={`p-${pos}`}>{baseText.slice(pos, ann.start)}</span>);
      }

      if (ann.type === 'change') {
        const c = ann.data;
        if (c.status === 'pending') {
          parts.push(
            <span key={`ch-${c.id}`} className="inline">
              <del className="text-red-500 bg-red-50 line-through px-0.5 rounded-sm">{c.originalText}</del>
              <ins className="text-green-700 bg-green-50 no-underline px-0.5 rounded-sm font-medium ml-0.5">{c.suggestedText}</ins>
              <span className="inline-flex gap-0.5 ml-1 align-middle">
                <button
                  onClick={() => acceptChange(c.id)}
                  className="text-[10px] leading-none bg-green-500 text-white px-1.5 py-0.5 rounded hover:bg-green-600 font-medium"
                  title="Accept change"
                >✓</button>
                <button
                  onClick={() => rejectChange(c.id)}
                  className="text-[10px] leading-none bg-red-400 text-white px-1.5 py-0.5 rounded hover:bg-red-500 font-medium"
                  title="Reject change"
                >✗</button>
              </span>
            </span>
          );
        } else if (c.status === 'accepted') {
          parts.push(
            <span key={`ch-${c.id}`} className="inline">
              <ins className="text-green-700 bg-green-100 no-underline px-0.5 rounded-sm font-medium">{c.suggestedText}</ins>
              <button
                onClick={() => undoChange(c.id)}
                className="text-[10px] leading-none bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded hover:bg-gray-300 ml-0.5 align-middle"
                title="Undo accept"
              >↩</button>
            </span>
          );
        }
      } else {
        const f = ann.data;
        const color = f.color || '#8b5cf6';
        parts.push(
          <span
            key={`fb-${f.id}`}
            className="relative group cursor-help"
            style={{
              backgroundColor: color + '22',
              borderBottom: `2px solid ${color}`,
              borderRadius: '2px',
            }}
          >
            {baseText.slice(ann.start, ann.end)}
            {/* Hover tooltip */}
            <span className="absolute bottom-full left-0 z-20 hidden group-hover:block w-72 p-3 bg-popover border border-border shadow-lg rounded-lg text-xs leading-relaxed pointer-events-none mb-1">
              {f.criterionName && (
                <span className="block font-semibold mb-1" style={{ color }}>{f.criterionName}</span>
              )}
              {f.text}
            </span>
          </span>
        );
      }

      pos = ann.end;
    }

    if (pos < baseText.length) {
      parts.push(<span key="p-end">{baseText.slice(pos)}</span>);
    }

    return parts;
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

            {/* Edit / Review toggle */}
            {hasReviewContent && (
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'edit' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('edit')}
                >
                  <Pencil className="h-3.5 w-3.5 mr-1.5" />
                  Edit
                </Button>
                <Button
                  variant={viewMode === 'review' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('review')}
                >
                  <Eye className="h-3.5 w-3.5 mr-1.5" />
                  Review Changes
                  {pendingCount > 0 && (
                    <Badge variant="secondary" className="ml-1.5 text-[10px] h-4 px-1">
                      {pendingCount}
                    </Badge>
                  )}
                </Button>
              </div>
            )}

            {viewMode === 'review' ? (
              <Card className="border-2">
                <CardContent className="p-0">
                  {/* Status bar */}
                  {pendingChanges.length > 0 && (
                    <div className="flex flex-wrap items-center gap-3 px-6 py-3 border-b border-border bg-muted/30 text-xs">
                      <span className="text-green-600 font-medium">{acceptedCount} accepted</span>
                      <span className="text-red-500 font-medium">{rejectedCount} rejected</span>
                      <span className="text-muted-foreground">{pendingCount} pending</span>
                      {pendingCount > 0 && (
                        <>
                          <button
                            onClick={acceptAll}
                            className="text-green-600 hover:underline font-medium"
                          >
                            Accept all
                          </button>
                          <button
                            onClick={rejectAll}
                            className="text-red-500 hover:underline font-medium"
                          >
                            Reject all
                          </button>
                        </>
                      )}
                      {acceptedCount > 0 && (
                        <Button
                          size="sm"
                          className="ml-auto h-6 text-xs"
                          onClick={applyAcceptedChanges}
                        >
                          Apply {acceptedCount} to editor →
                        </Button>
                      )}
                    </div>
                  )}
                  {/* Inline essay with annotations */}
                  <div className="min-h-[600px] text-base leading-relaxed p-6 font-serif whitespace-pre-wrap overflow-visible">
                    {renderReview()}
                  </div>
                </CardContent>
              </Card>
            ) : (
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
            )}

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

            {/* Suggested edits summary */}
            {pendingChanges.length > 0 && (
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-border">
                    <Strikethrough className="h-4 w-4 text-primary" />
                    <p className="text-sm font-medium text-foreground">
                      Suggested Edits
                    </p>
                    <Badge variant="secondary" className="text-xs ml-auto">
                      {pendingCount} pending
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Your counselor suggested {pendingChanges.length}{" "}
                    {pendingChanges.length === 1 ? "change" : "changes"}. Switch
                    to Review mode to accept or reject them inline.
                  </p>
                  {viewMode !== 'review' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => setViewMode('review')}
                    >
                      <Eye className="h-3.5 w-3.5 mr-1.5" />
                      Review Changes
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

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
                            {typeof item.startIndex === 'number' && (
                              <button
                                className="text-[10px] text-primary ml-auto hover:underline"
                                onClick={() => setViewMode('review')}
                              >
                                View in essay →
                              </button>
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
