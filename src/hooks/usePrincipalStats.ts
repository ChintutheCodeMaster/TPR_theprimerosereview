import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { usePrincipalSchool } from "./usePrincipalSchool";
import { useAtRiskCriteria } from "./useAtRiskCriteria";

export interface PrincipalStatsData {
  totalStudents:      number;
  totalCounselors:    number;
  totalEssays:        number;
  totalApplications:  number;
  totalRecLetters:    number;
  atRiskCount:        number;
  essaysPending:      number;
  urgentApplications: number;
}

export const usePrincipalStats = () => {
  const { data: school, isLoading: loadingSchool } = usePrincipalSchool();
  const { criteria, isLoading: loadingCriteria } = useAtRiskCriteria();

  return useQuery({
    queryKey: [
      "principal-analytics-data",
      school?.schoolId,
      criteria.atRiskThreshold,
      criteria.needsAttentionThreshold,
      criteria.essayWeight,
      criteria.recWeight,
    ],
    enabled: !!school?.schoolId && !loadingSchool && !loadingCriteria,
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("principal-analytics", {
        body: { schoolId: school!.schoolId, criteria },
      });
      if (error) throw error;
      return data as { stats: PrincipalStatsData; analytics: unknown };
    },
    select: (data) => data.stats,
  });
};
