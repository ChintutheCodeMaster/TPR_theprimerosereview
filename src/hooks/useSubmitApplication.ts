import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { ApplicationEssaySlotWithDraft } from "@/types/applicationEssays";
import type { Json } from "@/integrations/supabase/types";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface EssaySnapshot {
  slot_id: string;
  essay_label: string;
  essay_feedback_id: string;
  essay_title: string;
  essay_content: string;
  word_count: number;
  sent_at: string | null;
}

export interface SubmitApplicationPayload {
  applicationId: string;
  studentId: string;
  slots: ApplicationEssaySlotWithDraft[];
  notes?: string;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export const useSubmitApplication = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const submitApplication = useMutation({
    mutationFn: async ({
      applicationId,
      studentId,
      slots,
      notes,
    }: SubmitApplicationPayload) => {

      // 1. Build essay snapshots from current slot state
      const essaySnapshots: EssaySnapshot[] = slots
        .filter((s) => s.essay_feedback !== null)
        .map((s) => ({
          slot_id: s.id,
          essay_label: s.essay_label,
          essay_feedback_id: s.essay_feedback_id!,
          essay_title: s.essay_feedback!.essay_title,
          essay_content: s.essay_feedback!.essay_content,
          word_count: s.essay_feedback!.essay_content
            .split(/\s+/)
            .filter(Boolean).length,
          sent_at: s.essay_feedback!.sent_at,
        }));

      // 2. Insert into submitted_applications
      const { data: submission, error: submitError } = await supabase
        .from("submitted_applications")
        .insert({
          application_id: applicationId,
          student_id: studentId,
        //   essay_snapshots: essaySnapshots,
        essay_snapshots: essaySnapshots as unknown as Json,
          notes: notes ?? null,
          submitted_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (submitError) throw submitError;

      // 3. Update applications.status → 'sent'
      const { error: appError } = await supabase
        .from("applications")
        .update({
          status: "sent",
          updated_at: new Date().toISOString(),
        })
        .eq("id", applicationId);

      if (appError) throw appError;

      return submission;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      queryClient.invalidateQueries({ queryKey: ["application_essays"] });
      toast({
        title: "Application submitted!",
        description: "Your application has been submitted successfully.",
      });
    },

    onError: (err: Error) => {
      toast({
        title: "Submission failed",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  return { submitApplication };
};