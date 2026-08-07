import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Archive, CheckCircle, Pencil, Send } from "lucide-react";
import { useApplicationEssays } from "@/hooks/useApplicationEssays";
import { useSubmitApplication } from "@/hooks/useSubmitApplication";
import { useApplicationRecommendations } from "@/hooks/useApplicationRecommendations";
import { useApplications } from "@/hooks/useApplications";
import { useQueryClient } from "@tanstack/react-query";
import { ApplicationHeader } from "@/components/application-detail/ApplicationHeader";
import { EssaysPanel } from "@/components/application-detail/EssaysPanel";
import { RecommendationsPanel } from "@/components/application-detail/RecommendationsPanel";
import { EditApplicationForm } from "@/components/application-detail/EditApplicationForm";
import type { ApplicationWithProfile } from "@/hooks/useApplications";

export const ApplicationDetailModal = ({
  application,
  open,
  onClose,
}: {
  application: ApplicationWithProfile | null;
  open: boolean;
  onClose: () => void;
}) => {
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [submitNotes, setSubmitNotes]             = useState("");
  const [isEditing, setIsEditing]                 = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);

  const {
    slots, isLoading, createSlot, deleteSlot,
    totalSlots, approvedSlots, notStartedSlots, draftSlots, inReviewSlots, sentSlots,
  } = useApplicationEssays(application?.id ?? null);

  const { submitApplication } = useSubmitApplication();
  const { updateApplication } = useApplications();
  const queryClient = useQueryClient();

  const {
    recommendations, isLoading: isLoadingRecs,
    updateRecStatus, sentCount, totalCount,
  } = useApplicationRecommendations(application?.id ?? null);

  if (!application) return null;

  const requiredEssays       = application.required_essays ?? 0;
  const submittedSlots       = inReviewSlots + sentSlots + approvedSlots;
  const completionPercentage = requiredEssays > 0
    ? Math.round((submittedSlots / requiredEssays) * 100)
    : 0;
  const allSlotsAdded        = requiredEssays > 0 && totalSlots >= requiredEssays;
  const allFeedbackSent =
    allSlotsAdded &&
    slots.every((s) => s.essay_feedback !== null && s.essay_feedback.status === "sent");

  const isAlreadySubmitted = application.status === "sent";

  const handleSubmit = () => {
    submitApplication.mutate(
      {
        applicationId: application.id,
        studentId: application.student_id,
        slots,
        notes: submitNotes || undefined,
      },
      { onSuccess: () => { setShowSubmitConfirm(false); onClose(); } }
    );
  };

  const handleArchive = () => {
    updateApplication.mutate(
      { id: application.id, archived: true } as any,
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["applications", "archived"] });
          setShowArchiveConfirm(false);
          onClose();
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 flex flex-col gap-0 overflow-hidden">

        <div className="relative">
          <ApplicationHeader
            application={application}
            completionPercentage={completionPercentage}
            totalSlots={totalSlots}
            approvedSlots={approvedSlots}
            notStartedSlots={notStartedSlots}
            draftSlots={draftSlots}
            inReviewSlots={inReviewSlots}
            sentSlots={sentSlots}
            sentRecs={sentCount}
            totalRecs={totalCount}
          />
          {!isAlreadySubmitted && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-14 h-8 gap-1.5 text-xs"
              onClick={() => setIsEditing(v => !v)}
            >
              <Pencil className="h-3.5 w-3.5" />
              {isEditing ? "Close" : "Edit"}
            </Button>
          )}
        </div>

        <ScrollArea className="flex-1 overflow-auto">
          <div className="px-6 py-5 space-y-4">
            {isEditing && (
              <EditApplicationForm
                application={application}
                onDone={() => setIsEditing(false)}
              />
            )}

            <EssaysPanel
              application={application}
              slots={slots}
              isLoading={isLoading}
              createSlot={createSlot}
              deleteSlot={deleteSlot}
              totalSlots={totalSlots}
              allFeedbackSent={allFeedbackSent}
              isAlreadySubmitted={isAlreadySubmitted}
              showSubmitConfirm={showSubmitConfirm}
              submitNotes={submitNotes}
              setSubmitNotes={setSubmitNotes}
              onSubmit={handleSubmit}
              onCancelSubmit={() => setShowSubmitConfirm(false)}
              submitIsPending={submitApplication.isPending}
              onClose={onClose}
            />

            <RecommendationsPanel
              recommendations={recommendations}
              isLoadingRecs={isLoadingRecs}
              updateRecStatus={updateRecStatus}
              sentCount={sentCount}
              totalCount={totalCount}
              onClose={onClose}
            />
          </div>
        </ScrollArea>

        <div className="px-6 py-4 border-t shrink-0 flex items-center justify-between gap-3 bg-muted/20">
          <div className="flex items-center gap-2 min-w-0">
            {!isAlreadySubmitted && (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => setShowArchiveConfirm(true)}
              >
                <Archive className="h-3.5 w-3.5 mr-1.5" />
                Archive
              </Button>
            )}
            <p className="text-xs text-muted-foreground truncate">{application.notes ?? ""}</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
            {isAlreadySubmitted ? (
              <Button size="sm" disabled>
                <CheckCircle className="h-3.5 w-3.5 mr-1.5" />Submitted
              </Button>
            ) : (
              <Button
                size="sm"
                disabled={!allFeedbackSent}
                onClick={() => setShowSubmitConfirm((v) => !v)}
                title={!allFeedbackSent ? "All essays must have counselor feedback before submitting" : undefined}
              >
                <Send className="h-3.5 w-3.5 mr-1.5" />Submit Application
              </Button>
            )}
          </div>
        </div>

      </DialogContent>

      <AlertDialog open={showArchiveConfirm} onOpenChange={setShowArchiveConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive this application?</AlertDialogTitle>
            <AlertDialogDescription>
              {application.school_name} will be moved to your Archived Applications list.
              Your essays and drafts are kept — you can restore it any time from the Archived page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchive}>Archive</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};
