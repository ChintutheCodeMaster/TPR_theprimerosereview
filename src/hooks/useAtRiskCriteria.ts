import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { usePrincipalSchool } from "./usePrincipalSchool";

export interface AtRiskCriteria {
  atRiskThreshold: number;
  needsAttentionThreshold: number;
  essayWeight: number;
  recWeight: number;
  triggerNoEssays: boolean;
  triggerLowCompletion: boolean;
  triggerManyDeadlines: boolean;
  deadlineCountThreshold: number;
  triggerNoRecs: boolean;
}

export const DEFAULT_CRITERIA: AtRiskCriteria = {
  atRiskThreshold: 40,
  needsAttentionThreshold: 70,
  essayWeight: 60,
  recWeight: 40,
  triggerNoEssays: true,
  triggerLowCompletion: true,
  triggerManyDeadlines: true,
  deadlineCountThreshold: 3,
  triggerNoRecs: true,
};

export function useAtRiskCriteria() {
  const { data: school } = usePrincipalSchool();
  const queryClient = useQueryClient();

  const { data: criteria = DEFAULT_CRITERIA, isLoading } = useQuery({
    queryKey: ["at-risk-criteria", school?.schoolId],
    enabled: !!school?.schoolId,
    queryFn: async (): Promise<AtRiskCriteria> => {
      const { data } = await supabase
        .from("school_at_risk_criteria")
        .select("*")
        .eq("school_id", school!.schoolId)
        .maybeSingle();

      if (!data) return DEFAULT_CRITERIA;

      return {
        atRiskThreshold:         data.at_risk_threshold,
        needsAttentionThreshold: data.needs_attention_threshold,
        essayWeight:             data.essay_weight,
        recWeight:               data.rec_weight,
        triggerNoEssays:         data.trigger_no_essays,
        triggerLowCompletion:    data.trigger_low_completion,
        triggerManyDeadlines:    data.trigger_many_deadlines,
        deadlineCountThreshold:  data.deadline_count_threshold,
        triggerNoRecs:           data.trigger_no_recs,
      };
    },
  });

  const { mutateAsync: setCriteria, isPending: isSaving } = useMutation({
    mutationFn: async (next: AtRiskCriteria) => {
      if (!school?.schoolId) throw new Error("No school linked to this account");

      const { error } = await supabase
        .from("school_at_risk_criteria")
        .upsert({
          school_id:                school.schoolId,
          at_risk_threshold:        next.atRiskThreshold,
          needs_attention_threshold: next.needsAttentionThreshold,
          essay_weight:             next.essayWeight,
          rec_weight:               next.recWeight,
          trigger_no_essays:        next.triggerNoEssays,
          trigger_low_completion:   next.triggerLowCompletion,
          trigger_many_deadlines:   next.triggerManyDeadlines,
          deadline_count_threshold: next.deadlineCountThreshold,
          trigger_no_recs:          next.triggerNoRecs,
          updated_at:               new Date().toISOString(),
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["at-risk-criteria", school?.schoolId] });
    },
  });

  return { criteria, setCriteria, isLoading, isSaving };
}
