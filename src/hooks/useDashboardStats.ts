import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DashboardStatsData {
  totalStudents: number;
  essaysInReview: number;
  upcomingDeadlines: number;
  atRiskStudents: number;
}

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async (): Promise<DashboardStatsData> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get counselor's assigned student IDs
      const { data: assignments } = await supabase
        .from("student_counselor_assignments")
        .select("student_id")
        .eq("counselor_id", user.id);

      const studentIds = assignments?.map((a) => a.student_id) ?? [];

      if (studentIds.length === 0) {
        return {
          totalStudents: 0,
          essaysInReview: 0,
          upcomingDeadlines: 0,
          atRiskStudents: 0,
        };
      }

      // Run all counts in parallel
      const [essaysRes, deadlinesRes, atRiskRes] = await Promise.all([
        // Essays currently in review (status = 'in_progress' or draft with content)
        supabase
          .from("essay_feedback")
          .select("id", { count: "exact", head: true })
          .in("student_id", studentIds)
          .in("status", ["draft", "in_progress"]),

        // Applications with deadlines in the next 7 days
        supabase
          .from("applications")
          .select("id", { count: "exact", head: true })
          .in("student_id", studentIds)
          .gte("deadline_date", new Date().toISOString().split("T")[0])
          .lte(
            "deadline_date",
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0]
          )
          .neq("status", "submitted"),

        // At risk: students with urgent=true applications or completion < 30%
        supabase
          .from("applications")
          .select("student_id", { count: "exact", head: false })
          .in("student_id", studentIds)
          .or("urgent.eq.true,completion_percentage.lt.30"),
      ]);

      // Deduplicate at-risk student IDs
      const atRiskStudentIds = new Set(
        (atRiskRes.data ?? []).map((r) => r.student_id)
      );

      return {
        totalStudents: studentIds.length,
        essaysInReview: essaysRes.count ?? 0,
        upcomingDeadlines: deadlinesRes.count ?? 0,
        atRiskStudents: atRiskStudentIds.size,
      };
    },
  });
};