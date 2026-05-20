import { useState, useRef, useEffect } from "react";
import { CelebrationOverlay } from "@/components/CelebrationOverlay";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useTeacherEssayFeedback, type TeacherEssayInput } from "@/hooks/useTeacherEssayFeedback";
import { useTrackedChanges } from "@/hooks/useTrackedChanges";
import { useParagraphSegments } from "@/hooks/useParagraphSegments";
import { TeacherFeedbackEditorView } from "./TeacherFeedbackEditorView";
import { TeacherFeedbackPreviewView } from "./TeacherFeedbackPreviewView";

export type { TeacherEssayInput };

interface TeacherEssayFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  essay: TeacherEssayInput;
}

export const TeacherEssayFeedbackModal = ({ isOpen, onClose, essay }: TeacherEssayFeedbackModalProps) => {
  const [showPreview, setShowPreview] = useState(false);
  const commentRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const {
    isAnalyzing, isSaving, analysis,
    feedbackItems, manualNote, setManualNote,
    personalMessage, setPersonalMessage,
    hoveredCommentId, setHoveredCommentId,
    activeEvent,
    addToFeedback, addManualNote, removeFeedbackItem,
    saveFeedback,
  } = useTeacherEssayFeedback(essay, isOpen, onClose);

  const {
    trackedChanges,
    pendingSelection, setPendingSelection,
    suggestionInput, setSuggestionInput,
    essayRef, popoverRef,
    handleMouseUp, applyTrackedChange, removeTrackedChange,
  } = useTrackedChanges();

  const { paragraphData, paragraphIssueMap, paragraphChangeMap } = useParagraphSegments(
    essay.content,
    analysis,
    trackedChanges,
  );

  useEffect(() => {
    if (hoveredCommentId && commentRefs.current[hoveredCommentId]) {
      commentRefs.current[hoveredCommentId]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [hoveredCommentId]);

  const dialogSizeClass = showPreview
    ? "max-w-[800px] h-[80vh] p-0 flex flex-col"
    : "max-w-[95vw] w-[1400px] h-[90vh] p-0 flex flex-col";

  return (
    <>
      <CelebrationOverlay event={activeEvent} />
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className={dialogSizeClass}>

          {showPreview && (
            <TeacherFeedbackPreviewView
              essayTitle={essay.title}
              studentName={essay.studentName}
              analysis={analysis}
              personalMessage={personalMessage}
              setPersonalMessage={setPersonalMessage}
              feedbackItems={feedbackItems}
              trackedChanges={trackedChanges}
              isSaving={isSaving}
              onBack={() => setShowPreview(false)}
              onSaveDraft={() => saveFeedback('draft', trackedChanges)}
              onSend={() => saveFeedback('sent', trackedChanges)}
            />
          )}

          {!showPreview && (
            <TeacherFeedbackEditorView
              essay={essay}
              isAnalyzing={isAnalyzing}
              isSaving={isSaving}
              analysis={analysis}
              feedbackItems={feedbackItems}
              manualNote={manualNote}
              setManualNote={setManualNote}
              hoveredCommentId={hoveredCommentId}
              setHoveredCommentId={setHoveredCommentId}
              trackedChanges={trackedChanges}
              pendingSelection={pendingSelection}
              suggestionInput={suggestionInput}
              setSuggestionInput={setSuggestionInput}
              paragraphData={paragraphData}
              paragraphIssueMap={paragraphIssueMap}
              paragraphChangeMap={paragraphChangeMap}
              essayRef={essayRef}
              popoverRef={popoverRef}
              commentRefs={commentRefs}
              handleMouseUp={handleMouseUp}
              applyTrackedChange={applyTrackedChange}
              addToFeedback={addToFeedback}
              addManualNote={addManualNote}
              removeFeedbackItem={removeFeedbackItem}
              removeTrackedChange={removeTrackedChange}
              saveFeedback={saveFeedback}
              onClearPendingSelection={() => setPendingSelection(null)}
              onShowPreview={() => setShowPreview(true)}
            />
          )}

        </DialogContent>
      </Dialog>
    </>
  );
};
