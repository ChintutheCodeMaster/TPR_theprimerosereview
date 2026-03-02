import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAssignedStudents } from "@/hooks/useAssignedStudents";

export interface CounselorInsightsData {
  recommendations: {
    pending: number;
    inProgress: number;
    sent: number;
    total: number;
  };
  applications: {
    submitted: number;
    inProgress: number;
    notStarted: number;
    total: number;
  };
  actionItems: {
    label: string;
    count: number;
    urgent: boolean;
  }[];
}

export const useCounselorInsights = () => {
  const { data: studentIds = [], isLoading: loadingAssignments } =
    useAssignedStudents();

  return useQuery({
    queryKey: ["counselor-insights", studentIds],
    enabled: !loadingAssignments,
    queryFn: async (): Promise<CounselorInsightsData> => {
      if (studentIds.length === 0) {
        return {
          recommendations: { pending: 0, inProgress: 0, sent: 0, total: 0 },
          applications: { submitted: 0, inProgress: 0, notStarted: 0, total: 0 },
          actionItems: [],
        };
      }

      const today = new Date().toISOString().split("T")[0];
      const in7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      const [recsRes, appsRes, essaysPendingRes, deadlinesRes] =
        await Promise.all([
          supabase
            .from("recommendation_requests")
            .select("status")
            .in("student_id", studentIds),

          supabase
            .from("applications")
            .select("status")
            .in("student_id", studentIds),

          supabase
            .from("essay_feedback")
            .select("id", { count: "exact", head: true })
            .in("student_id", studentIds)
            .in("status", ["draft", "in_progress", "pending"]),

          supabase
            .from("applications")
            .select("id", { count: "exact", head: true })
            .in("student_id", studentIds)
            .gte("deadline_date", today)
            .lte("deadline_date", in7Days)
            .neq("status", "submitted"),
        ]);

      const recs = recsRes.data ?? [];
      const recPending    = recs.filter((r) => r.status === "pending").length;
      const recInProgress = recs.filter((r) => r.status === "in_progress").length;
      const recSent       = recs.filter((r) => r.status === "sent").length;

      const apps = appsRes.data ?? [];
      const appsSubmitted  = apps.filter((a) => a.status === "submitted").length;
      const appsInProgress = apps.filter((a) => a.status === "in-progress").length;
      const appsNotStarted = apps.filter((a) => a.status === "not-started").length;

      const essaysPending = essaysPendingRes.count ?? 0;
      const deadlines = deadlinesRes.count ?? 0;
      const recsToComplete = recPending + recInProgress;

      const actionItems = [
        {
          label: "Recommendations to complete",
          count: recsToComplete,
          urgent: recsToComplete > 0,
        },
        {
          label: "Deadlines this week",
          count: deadlines,
          urgent: deadlines > 0,
        },
        {
          label: "Essays pending review",
          count: essaysPending,
          urgent: essaysPending > 0,
        },
      ];

      return {
        recommendations: {
          pending: recPending,
          inProgress: recInProgress,
          sent: recSent,
          total: recs.length,
        },
        applications: {
          submitted: appsSubmitted,
          inProgress: appsInProgress,
          notStarted: appsNotStarted,
          total: apps.length,
        },
        actionItems,
      };
    },
  });
};