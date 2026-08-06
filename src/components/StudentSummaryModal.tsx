import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, RefreshCw, Sparkles, User, GraduationCap, Heart, MessageCircle } from "lucide-react";
import { useStudentSummary, StudentSummarySections } from "@/hooks/useStudentSummary";

interface StudentSummaryModalProps {
  studentId: string;
  studentName: string;
  avatarUrl?: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const SECTIONS: { key: keyof StudentSummarySections; label: string; icon: typeof User }[] = [
  { key: "who_they_are", label: "Who they are", icon: User },
  { key: "academic_goals", label: "Academic & career goals", icon: GraduationCap },
  { key: "strengths_values", label: "Strengths & values", icon: Heart },
  { key: "talking_points", label: "Counselor talking points", icon: MessageCircle },
];

function formatGeneratedAt(iso: string | null): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export function StudentSummaryModal({
  studentId,
  studentName,
  avatarUrl,
  isOpen,
  onClose,
}: StudentSummaryModalProps) {
  const { summary, generatedAt, isLoading, isRegenerating, error, regenerate } =
    useStudentSummary(studentId, isOpen);

  const initials = studentName.split(" ").map((n) => n[0]).join("").slice(0, 2);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={avatarUrl ?? undefined} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <DialogTitle className="flex items-center gap-2 text-left">
                <Sparkles className="h-4 w-4 text-primary" />
                {studentName}
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-1">
                AI summary from onboarding answers + Eva conversations
                {generatedAt && !isLoading && ` · updated ${formatGeneratedAt(generatedAt)}`}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {isLoading && (
            <div className="space-y-4">
              {SECTIONS.map((s) => (
                <div key={s.key} className="space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              ))}
              <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating summary…
              </div>
            </div>
          )}

          {!isLoading && error && (
            <div className="rounded-md border border-destructive/40 bg-destructive/5 p-4 text-sm">
              <p className="font-medium text-destructive">Could not generate summary</p>
              <p className="text-muted-foreground mt-1">{error.message}</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={regenerate}>
                Try again
              </Button>
            </div>
          )}

          {!isLoading && !error && summary && (
            <>
              {SECTIONS.map(({ key, label, icon: Icon }) => {
                const text = summary[key];
                if (!text) return null;
                return (
                  <section key={key} className="rounded-lg border bg-muted/30 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <h3 className="text-sm font-semibold">{label}</h3>
                    </div>
                    <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-line">
                      {text}
                    </p>
                  </section>
                );
              })}
            </>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 mt-2 border-t">
          <p className="text-xs text-muted-foreground">
            Cached snapshot — regenerate when onboarding or voice data changes.
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={regenerate}
              disabled={isLoading || isRegenerating}
            >
              {isRegenerating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              )}
              Regenerate
            </Button>
            <Button variant="default" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
