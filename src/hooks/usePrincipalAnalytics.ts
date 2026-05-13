import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { usePrincipalSchool } from "./usePrincipalSchool";
import { useAtRiskCriteria } from "./useAtRiskCriteria";
import type { PrincipalStatsData } from "./usePrincipalStats";

export interface LeaderStudent {
  id: string;
  name: string;
  avatarUrl: string | null;
  completionScore: number;
  riskLevel: "at-risk" | "needs-attention" | "on-track";
}

export interface LeaderCounselor {
  id: string;
  name: string;
  avatarUrl: string | null;
  avgCompletion: number;
  studentCount: number;
  atRiskCount: number;
}

export interface PrincipalAnalyticsData {
  avgSchoolCompletion: number;
  submissionTrend: { week: string; submissions: number }[];
  deadlinesByWeek: { week: string; count: number; urgent: number }[];
  riskDistribution: { name: string; value: number; color: string }[];
  appStatusDistribution: { name: string; value: number; color: string }[];
  schoolDistribution: { school: string; applications: number; color: string }[];
  completionBuckets: { range: string; count: number; fill: string }[];
  counselorPerf: { name: string; fullName: string; avgCompletion: number; atRiskCount: number; studentCount: number; fill: string }[];
  topStudents: LeaderStudent[];
  topCounselors: LeaderCounselor[];
  insights: string[];
}

export const usePrincipalAnalytics = () => {
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
      return data as { stats: PrincipalStatsData; analytics: PrincipalAnalyticsData };
    },
    select: (data) => data.analytics,
  });
};
