import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  PageShell,
  HairlineCard,
  BlurOrb,
} from "@/components/primrose-night";
import { useEditEssay } from "@/hooks/useeditEssay";
import { useCompanionPageContext } from "@/hooks/useCompanionPageContext";
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
    case "sent":        return "bg-[color:var(--pn-pink)]/15 text-[color:var(--pn-pink)] hairline";
    case "in_progress": return "bg-[color:var(--pn-gold)]/15 text-[color:var(--pn-gold)] hairline";
    case "draft":       return "bg-white/[0.06] text-foreground/80 hairline";
    case "pending":     return "bg-[color:var(--pn-gold)]/10 text-[color:var(--pn-gold)] hairline";
    default:            return "bg-white/[0.03] text-muted-foreground hairline";
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
  useCompanionPageContext(essayId ? { essayId } : null);

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
              <del className="text-[color:var(--pn-pink)] bg-[color:var(--pn-pink)]/10 line-through px-0.5 rounded-sm">{c.originalText}</del>
              <ins className="text-[color:var(--pn-sage)] bg-[color:var(--pn-sage)]/10 no-underline px-0.5 rounded-sm ml-0.5">{c.suggestedText}</ins>
              <span className="inline-flex gap-0.5 ml-1 align-middle">
                <button
                  onClick={() => acceptChange(c.id)}
                  className="text-[10px] leading-none bg-[color:var(--pn-sage)]/20 text-[color:var(--pn-sage)] hairline px-1.5 py-0.5 rounded hover:bg-[color:var(--pn-sage)]/30"
                  title="Accept change"
                >✓</button>
                <button
                  onClick={() => rejectChange(c.id)}
                  className="text-[10px] leading-none bg-[color:var(--pn-pink)]/20 text-[color:var(--pn-pink)] hairline px-1.5 py-0.5 rounded hover:bg-[color:var(--pn-pink)]/30"
                  title="Reject change"
                >✗</button>
              </span>
            </span>
          );
        } else if (c.status === 'accepted') {
          parts.push(
            <span key={`ch-${c.id}`} className="inline">
              <ins className="text-[color:var(--pn-sage)] bg-[color:var(--pn-sage)]/15 no-underline px-0.5 rounded-sm">{c.suggestedText}</ins>
              <button
                onClick={() => undoChange(c.id)}
                className="text-[10px] leading-none bg-white/[0.06] text-muted-foreground hairline px-1.5 py-0.5 rounded hover:bg-white/[0.1] ml-0.5 align-middle"
                title="Undo accept"
              >↩</button>
            </span>
          );
        }
      } else {
        const f = ann.data;
        const color = f.color || 'var(--pn-pink)';
        parts.push(
          <span
            key={`fb-${f.id}`}
            className="relative group cursor-help"
            style={{
              backgroundColor: `color-mix(in oklab, ${color} 14%, transparent)`,
              borderBottom: `2px solid ${color}`,
              borderRadius: '2px',
            }}
          >
            {baseText.slice(ann.start, ann.end)}
            {/* Hover tooltip */}
            <span className="absolute bottom-full left-0 z-20 hidden group-hover:block w-72 p-3 bg-pn-card hairline rounded-xl text-xs leading-relaxed pointer-events-none mb-1">
              {f.criterionName && (
                <span className="block text-[10px] uppercase tracking-[0.18em] mb-1" style={{ color }}>{f.criterionName}</span>
              )}
              <span className="text-foreground">{f.text}</span>
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
      <PageShell>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageShell>
    );
  }

  if (!essay) return null;

  const hasFeedback = essay.feedback_items && essay.feedback_items.length > 0;

  return (
    <div className="relative min-h-full w-full bg-pn-background text-pn-foreground pn-grain pn-vignette">
      <BlurOrb tone="sage" className="top-[-80px] right-[-80px] w-[420px] h-[420px] opacity-40" />

      {/* Compact sticky action bar */}
      <div className="hairline-b bg-background/70 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground hover:bg-white/[0.03]"
              onClick={() => navigate("/student-personal-area")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-3 min-w-0">
              <FileText className="h-5 w-5 text-foreground/60 shrink-0" />
              <h1 className="font-serif text-lg text-foreground truncate max-w-[300px]">
                {essay.essay_title}
              </h1>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs capitalize ${getStatusColor(essay.status)}`}>
                {essay.status.replace(/_/g, " ")}
              </span>
              {hasChanges && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs hairline bg-[color:var(--pn-gold)]/10 text-[color:var(--pn-gold)]">
                  Unsaved
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              <span className="num-display text-foreground">{wordCount}</span> words
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="hairline hover:bg-white/[0.04] text-foreground"
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
              className="bg-[color:var(--pn-pink)]/15 hairline text-[color:var(--pn-pink)] hover:bg-[color:var(--pn-pink)]/25 shadow-none"
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
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Essay editor — 2/3 width */}
          <div className="lg:col-span-2 space-y-4">
            {essay.essay_prompt && (
              <HairlineCard className="p-4">
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-2">Prompt</p>
                <p className="text-sm text-foreground font-serif italic leading-relaxed">
                  {essay.essay_prompt}
                </p>
              </HairlineCard>
            )}

            {/* Edit / Review toggle */}
            {hasReviewContent && (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`hairline transition-colors ${
                    viewMode === 'edit'
                      ? 'bg-white/[0.08] text-foreground'
                      : 'bg-transparent text-muted-foreground hover:bg-white/[0.03] hover:text-foreground'
                  }`}
                  onClick={() => setViewMode('edit')}
                >
                  <Pencil className="h-3.5 w-3.5 mr-1.5" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`hairline transition-colors ${
                    viewMode === 'review'
                      ? 'bg-white/[0.08] text-foreground'
                      : 'bg-transparent text-muted-foreground hover:bg-white/[0.03] hover:text-foreground'
                  }`}
                  onClick={() => setViewMode('review')}
                >
                  <Eye className="h-3.5 w-3.5 mr-1.5" />
                  Review Changes
                  {pendingCount > 0 && (
                    <span className="ml-1.5 inline-flex items-center justify-center min-w-4 h-4 px-1 rounded-full text-[10px] hairline bg-[color:var(--pn-pink)]/15 text-[color:var(--pn-pink)]">
                      {pendingCount}
                    </span>
                  )}
                </Button>
              </div>
            )}

            {viewMode === 'review' ? (
              <HairlineCard className="p-0 overflow-hidden">
                {/* Status bar */}
                {pendingChanges.length > 0 && (
                  <div className="flex flex-wrap items-center gap-3 px-6 py-3 hairline-b bg-white/[0.02] text-xs">
                    <span className="text-[color:var(--pn-sage)]">
                      <span className="num-display">{acceptedCount}</span> accepted
                    </span>
                    <span className="text-[color:var(--pn-pink)]">
                      <span className="num-display">{rejectedCount}</span> rejected
                    </span>
                    <span className="text-muted-foreground">
                      <span className="num-display">{pendingCount}</span> pending
                    </span>
                    {pendingCount > 0 && (
                      <>
                        <button
                          onClick={acceptAll}
                          className="text-[color:var(--pn-sage)] hover:underline"
                        >
                          Accept all
                        </button>
                        <button
                          onClick={rejectAll}
                          className="text-[color:var(--pn-pink)] hover:underline"
                        >
                          Reject all
                        </button>
                      </>
                    )}
                    {acceptedCount > 0 && (
                      <Button
                        size="sm"
                        className="ml-auto h-6 text-xs bg-[color:var(--pn-sage)]/15 hairline text-[color:var(--pn-sage)] hover:bg-[color:var(--pn-sage)]/25 shadow-none"
                        onClick={applyAcceptedChanges}
                      >
                        Apply {acceptedCount} to editor →
                      </Button>
                    )}
                  </div>
                )}
                {/* Inline essay with annotations */}
                <div className="min-h-[600px] text-base leading-relaxed p-6 font-serif whitespace-pre-wrap overflow-visible text-foreground">
                  {renderReview()}
                </div>
              </HairlineCard>
            ) : (
              <HairlineCard className="p-0 overflow-hidden focus-within:ring-1 focus-within:ring-[color:var(--pn-pink)]/40 transition-shadow">
                <Textarea
                  value={content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  className="min-h-[600px] resize-none border-0 focus-visible:ring-0 text-base leading-relaxed p-6 font-serif bg-transparent"
                  placeholder="Start writing your essay..."
                />
              </HairlineCard>
            )}

            <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
              <span><span className="num-display text-foreground">{wordCount}</span> words</span>
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
            <HairlineCard variant="pink">
              <div className="flex items-center gap-2 mb-3">
                <RotateCcw className="h-4 w-4 text-[color:var(--pn-pink)]" />
                <p className="font-serif text-lg text-foreground leading-tight">
                  Ready to send it back?
                </p>
              </div>
              <p className="text-xs text-muted-foreground font-serif italic mb-4">
                Your counselor will see the revision and pick it back up.
              </p>
              <Button
                className="w-full bg-[color:var(--pn-pink)]/15 hairline text-[color:var(--pn-pink)] hover:bg-[color:var(--pn-pink)]/25 shadow-none"
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
            </HairlineCard>

            {/* Suggested edits summary */}
            {pendingChanges.length > 0 && (
              <HairlineCard>
                <div className="flex items-center gap-2 pb-3 hairline-b mb-3">
                  <Strikethrough className="h-4 w-4 text-foreground/60" />
                  <p className="font-serif text-lg text-foreground leading-tight">
                    Suggested edits
                  </p>
                  <span className="text-xs hairline bg-white/[0.03] text-muted-foreground px-2 py-0.5 rounded-full ml-auto">
                    <span className="num-display">{pendingCount}</span> pending
                  </span>
                </div>
                <p className="text-xs text-muted-foreground font-serif italic mb-4">
                  Your counselor suggested {pendingChanges.length}{" "}
                  {pendingChanges.length === 1 ? "change" : "changes"}. Switch
                  to Review mode to weigh each one.
                </p>
                {viewMode !== 'review' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full hairline hover:bg-white/[0.04] text-foreground"
                    onClick={() => setViewMode('review')}
                  >
                    <Eye className="h-3.5 w-3.5 mr-1.5" />
                    Review Changes
                  </Button>
                )}
              </HairlineCard>
            )}

            {/* Counselor feedback */}
            {hasFeedback ? (
              <HairlineCard>
                <div className="flex items-center gap-2 pb-3 hairline-b mb-3">
                  <MessageCircle className="h-4 w-4 text-foreground/60" />
                  <p className="font-serif text-lg text-foreground leading-tight">
                    What they said.
                  </p>
                  <span className="text-xs hairline bg-white/[0.03] text-muted-foreground px-2 py-0.5 rounded-full ml-auto">
                    <span className="num-display">{essay.feedback_items!.length}</span> notes
                  </span>
                </div>

                {essay.personal_message && (
                  <div className="p-3 hairline bg-white/[0.02] rounded-lg mb-3">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--pn-pink)] mb-1">
                      Personal Note
                    </p>
                    <p className="text-xs text-foreground font-serif italic leading-relaxed">
                      {essay.personal_message}
                    </p>
                  </div>
                )}

                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {essay.feedback_items!.map((item: any, index: number) => (
                    <div
                      key={item.id ?? index}
                      className="p-3 rounded-lg hairline bg-white/[0.02]"
                    >
                      {item.color && (
                        <div className="flex items-center gap-1.5 mb-1">
                          <div
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                          {item.criterionName && (
                            <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                              {item.criterionName}
                            </span>
                          )}
                          {typeof item.startIndex === 'number' && (
                            <button
                              className="text-[10px] text-[color:var(--pn-pink)] ml-auto hover:underline"
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
              </HairlineCard>
            ) : (
              <HairlineCard variant="sage" className="text-center p-6">
                <Clock className="h-8 w-8 mx-auto mb-3 text-muted-foreground/40" />
                <p className="font-serif italic text-muted-foreground">No news yet.</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Your counselor is reading.
                </p>
              </HairlineCard>
            )}

            {/* Tips */}
            <HairlineCard variant="gold">
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-3">Writing Tips</p>
              <ul className="text-xs text-foreground space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-3 w-3 text-[color:var(--pn-sage)] mt-0.5 shrink-0" />
                  Address each piece of feedback directly
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-3 w-3 text-[color:var(--pn-sage)] mt-0.5 shrink-0" />
                  Keep your authentic voice throughout
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-3 w-3 text-[color:var(--pn-sage)] mt-0.5 shrink-0" />
                  Most essays are 650 words or less
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-3 w-3 text-[color:var(--pn-sage)] mt-0.5 shrink-0" />
                  Save drafts often to avoid losing work
                </li>
              </ul>
            </HairlineCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditEssay;
