import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DashboardStudent {
  id: string;
  name: string;
  gpa: number | null;
  satScore: number | null;
  completionPercentage: number;
  essaysSubmitted: number;
  totalEssays: number;
  upcomingDeadlines: number;
  status: "on-track" | "needs-attention" | "at-risk";
  lastActivity: string;
}

export interface DashboardEssay {
  id: string;
  title: string;
  studentName: string;
  prompt: string | null;
  wordCount: number;
  status: string;
  lastUpdated: string;
}

export const useIndexDashboard = () => {
  // ── Students needing attention ─────────────────────────────
  const {
    data: students = [],
    isLoading: isLoadingStudents,
  } = useQuery({
    queryKey: ["dashboard-students"],
    queryFn: async (): Promise<DashboardStudent[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Use user_roles instead of assignments
      const { data: studentRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "student");

      const studentIds = studentRoles?.map((r) => r.user_id) ?? [];
      if (studentIds.length === 0) return [];

      // Fetch all data in parallel
      const [profilesRes, studentProfilesRes, essaysRes, recsRes] =
        await Promise.all([
          supabase
            .from("profiles")
            .select("user_id, full_name, updated_at")
            .in("user_id", studentIds),

          supabase
            .from("student_profiles")
            .select("user_id, gpa, sat_score")
            .in("user_id", studentIds),

          supabase
            .from("essay_feedback")
            .select("student_id, status, updated_at")
            .in("student_id", studentIds),

          supabase
            .from("recommendation_requests")
            .select("student_id, status")
            .in("student_id", studentIds),
        ]);

      const profileMap = new Map(
        (profilesRes.data ?? []).map((p) => [p.user_id, p])
      );
      const studentProfileMap = new Map(
        (studentProfilesRes.data ?? []).map((p) => [p.user_id, p])
      );

      return studentIds.map((id): DashboardStudent => {
        const profile = profileMap.get(id);
        const sp = studentProfileMap.get(id);
        const essays = (essaysRes.data ?? []).filter((e) => e.student_id === id);
        const recs = (recsRes.data ?? []).filter((r) => r.student_id === id);

        // Essay completion (60% weight)
        const totalEssays = essays.length;
        const essaysSubmitted = essays.filter((e) =>
          ["sent", "read", "approved"].includes(e.status)
        ).length;
        const essayScore = totalEssays > 0 ? (essaysSubmitted / totalEssays) * 60 : 0;

        // Rec completion (40% weight)
        const recsRequested = recs.length;
        const recsSubmitted = recs.filter((r) => r.status === "sent").length;
        const recScore = recsRequested > 0 ? (recsSubmitted / recsRequested) * 40 : 0;

        // Overall completion
        const completionPercentage = Math.round(essayScore + recScore);

        // Status — same thresholds as useDashboardStats
        const status: DashboardStudent["status"] =
          completionPercentage >= 60
            ? "on-track"
            : completionPercentage >= 40
            ? "needs-attention"
            : "at-risk";

        // Last activity = most recent essay updated_at
        const lastEssayUpdate = essays
          .map((e) => new Date(e.updated_at).getTime())
          .sort((a, b) => b - a)[0];

        const lastActivity = lastEssayUpdate
          ? formatRelativeTime(lastEssayUpdate)
          : "No activity";

        return {
          id,
          name: profile?.full_name ?? "Unknown Student",
          gpa: sp?.gpa ?? null,
          satScore: sp?.sat_score ?? null,
          completionPercentage,
          essaysSubmitted,
          totalEssays,
          upcomingDeadlines: 0, // will populate when applications are built
          status,
          lastActivity,
        };
      });
    },
  });

  // ── Essays for review ──────────────────────────────────────
  const {
    data: essays = [],
    isLoading: isLoadingEssays,
  } = useQuery({
    queryKey: ["dashboard-essays"],
    queryFn: async (): Promise<DashboardEssay[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Use user_roles instead of assignments
      const { data: studentRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "student");

      const studentIds = studentRoles?.map((r) => r.user_id) ?? [];
      if (studentIds.length === 0) return [];

      // Fetch essays without join (avoids foreign key issue)
      const { data, error } = await supabase
        .from("essay_feedback")
        .select("id, essay_title, essay_prompt, essay_content, status, updated_at, student_id")
        .in("student_id", studentIds)
        .in("status", ["draft", "in_progress","pending"])
        .order("updated_at", { ascending: false })
        .limit(5);

      if (error) throw error;

      // Fetch profiles separately
      const profileIds = [...new Set((data ?? []).map((e) => e.student_id))];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", profileIds);

      return (data ?? []).map((e): DashboardEssay => ({
        id: e.id,
        title: e.essay_title,
        studentName:
          profilesData?.find((p) => p.user_id === e.student_id)?.full_name ??
          "Unknown Student",
        prompt: e.essay_prompt,
        wordCount: e.essay_content
          ? e.essay_content.split(/\s+/).filter(Boolean).length
          : 0,
        status: e.status,
        lastUpdated: formatRelativeTime(new Date(e.updated_at).getTime()),
      }));
    },
  });

  // Show only students that need attention or are at risk
  const studentsNeedingAttention = students.filter(
    (s) => s.status !== "on-track"
  );

  return {
    students: studentsNeedingAttention,
    allStudents: students,
    essays,
    isLoadingStudents,
    isLoadingEssays,
  };
};

// ── Utility ───────────────────────────────────────────────────
function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  return `${days} day${days !== 1 ? "s" : ""} ago`;
}