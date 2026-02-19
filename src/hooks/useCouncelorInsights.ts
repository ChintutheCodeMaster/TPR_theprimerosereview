import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  return useQuery({
    queryKey: ["counselor-insights"],
    queryFn: async (): Promise<CounselorInsightsData> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get assigned student IDs
      const { data: assignments } = await supabase
        .from("student_counselor_assignments")
        .select("student_id")
        .eq("counselor_id", user.id);

      const studentIds = assignments?.map((a) => a.student_id) ?? [];

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

      // Run all queries in parallel
      const [recsRes, appsRes, essaysPendingRes, deadlinesRes, meetingsRes] =
        await Promise.all([
          // Recommendation requests by status
          supabase
            .from("recommendation_requests")
            .select("status")
            .in("student_id", studentIds),

          // Applications by status
          supabase
            .from("applications")
            .select("status")
            .in("student_id", studentIds),

          // Essays pending counselor review
          supabase
            .from("essay_feedback")
            .select("id", { count: "exact", head: true })
            .eq("counselor_id", user.id)
            .in("status", ["draft", "in_progress"]),

          // Upcoming deadlines this week
          supabase
            .from("applications")
            .select("id", { count: "exact", head: true })
            .in("student_id", studentIds)
            .gte("deadline_date", today)
            .lte("deadline_date", in7Days)
            .neq("status", "submitted"),

          // Scheduled meetings this week
          supabase
            .from("meeting_notes")
            .select("id", { count: "exact", head: true })
            .eq("counselor_id", user.id)
            .gte("meeting_date", today)
            .lte("meeting_date", in7Days),
        ]);

      // ── Recommendations ──────────────────────────────────
      const recs = recsRes.data ?? [];
      const recPending    = recs.filter((r) => r.status === "pending").length;
      const recInProgress = recs.filter((r) => r.status === "in_progress").length;
      const recSent       = recs.filter((r) => r.status === "sent").length;

      // ── Applications ─────────────────────────────────────
      const apps = appsRes.data ?? [];
      const appsSubmitted  = apps.filter((a) => a.status === "submitted").length;
      const appsInProgress = apps.filter((a) => a.status === "in-progress").length;
      const appsNotStarted = apps.filter((a) => a.status === "not-started").length;

      // ── Action items ──────────────────────────────────────
      const essaysPending = essaysPendingRes.count ?? 0;
      const deadlines     = deadlinesRes.count ?? 0;
      const meetings      = meetingsRes.count ?? 0;
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
          label: "Scheduled meetings",
          count: meetings,
          urgent: false,
        },
        {
          label: "Essays pending review",
          count: essaysPending,
          urgent: false,
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