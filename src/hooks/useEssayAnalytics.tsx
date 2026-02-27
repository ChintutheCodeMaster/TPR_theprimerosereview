import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface EssayAnalyticsData {
  // Summary stats
  totalEssays: number;
  avgScore: number | null;
  pendingReview: number;
  activeStudents: number;

  // Score distribution
  scoreDistribution: { range: string; count: number }[];

  // Status breakdown
  statusData: { name: string; value: number; color: string }[];

  // Progress over time (by week)
  progressOverTime: { week: string; avgScore: number; essaysSubmitted: number }[];

  // Top performers
  topPerformers: { name: string; essay: string; score: number }[];

  // Needs attention (no feedback sent, pending review)
  needsAttention: { name: string; essay: string; score: number | null; studentId: string }[];
}

export const useEssayAnalytics = () => {
  return useQuery({
    queryKey: ["essay-analytics"],
    queryFn: async (): Promise<EssayAnalyticsData> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Fetch all essays
      const { data: essays, error } = await supabase
        .from("essay_feedback")
        .select("id, student_id, essay_title, status, ai_analysis, created_at, updated_at, sent_at")
        .order("created_at", { ascending: true });

      if (error) throw error;

      const allEssays = essays ?? [];

      // Fetch profiles for student names
      const studentIds = [...new Set(allEssays.map((e) => e.student_id))];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", studentIds);

      const profileMap = new Map(
        (profilesData ?? []).map((p) => [p.user_id, p.full_name])
      );

      // ── Summary stats ──────────────────────────────────────
      const totalEssays = allEssays.length;
      const pendingReview = allEssays.filter((e) =>
        ["draft", "in_progress"].includes(e.status)
      ).length;
      const activeStudents = studentIds.length;

      // Average AI score (only essays that have been analyzed)
      const scoredEssays = allEssays.filter(
        (e) => e.ai_analysis && (e.ai_analysis as any)?.overallScore
      );
      const avgScore =
        scoredEssays.length > 0
          ? Math.round(
              scoredEssays.reduce(
                (sum, e) => sum + ((e.ai_analysis as any)?.overallScore ?? 0),
                0
              ) / scoredEssays.length
            )
          : null;

      // ── Score distribution ─────────────────────────────────
      const scoreDistribution = [
        { range: "90-100", count: 0 },
        { range: "80-89", count: 0 },
        { range: "70-79", count: 0 },
        { range: "60-69", count: 0 },
        { range: "Below 60", count: 0 },
      ];

      scoredEssays.forEach((e) => {
        const score = (e.ai_analysis as any)?.overallScore ?? 0;
        if (score >= 90) scoreDistribution[0].count++;
        else if (score >= 80) scoreDistribution[1].count++;
        else if (score >= 70) scoreDistribution[2].count++;
        else if (score >= 60) scoreDistribution[3].count++;
        else scoreDistribution[4].count++;
      });

      // ── Status breakdown ───────────────────────────────────
      const statusCounts = {
        sent: 0,
        in_progress: 0,
        draft: 0,
        pending: 0,
      };
      allEssays.forEach((e) => {
        if (e.status in statusCounts) {
          statusCounts[e.status as keyof typeof statusCounts]++;
        }
      });

      const statusData = [
        { name: "Sent", value: statusCounts.sent, color: "hsl(var(--success, 142 76% 36%))" },
        { name: "In Review", value: statusCounts.in_progress, color: "hsl(var(--warning, 38 92% 50%))" },
        { name: "Draft", value: statusCounts.draft, color: "hsl(var(--primary))" },
        { name: "Pending", value: statusCounts.pending, color: "hsl(var(--muted-foreground))" },
      ].filter((s) => s.value > 0);

      // ── Progress over time (group by week) ────────────────
      const weekMap = new Map<string, { scores: number[]; count: number }>();

      allEssays.forEach((e) => {
        const date = new Date(e.created_at);
        // Get week start (Monday)
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1);
        const weekStart = new Date(date.setDate(diff));
        const weekKey = weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" });

        if (!weekMap.has(weekKey)) {
          weekMap.set(weekKey, { scores: [], count: 0 });
        }
        const entry = weekMap.get(weekKey)!;
        entry.count++;
        const score = (e.ai_analysis as any)?.overallScore;
        if (score) entry.scores.push(score);
      });

      // Running total for essays submitted
      let runningTotal = 0;
      const progressOverTime = Array.from(weekMap.entries()).map(([week, data]) => {
        runningTotal += data.count;
        const avgWeekScore =
          data.scores.length > 0
            ? Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length)
            : 0;
        return {
          week,
          avgScore: avgWeekScore,
          essaysSubmitted: runningTotal,
        };
      });

      // ── Top performers (highest AI score) ─────────────────
      const topPerformers = scoredEssays
        .map((e) => ({
          name: profileMap.get(e.student_id) ?? "Unknown Student",
          essay: e.essay_title,
          score: (e.ai_analysis as any)?.overallScore ?? 0,
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

      // ── Needs attention (pending/draft essays) ─────────────
      const needsAttention = allEssays
        .filter((e) => ["draft", "in_progress", "pending"].includes(e.status))
        .map((e) => ({
          name: profileMap.get(e.student_id) ?? "Unknown Student",
          essay: e.essay_title,
          score: (e.ai_analysis as any)?.overallScore ?? null,
          studentId: e.student_id,
        }))
        .slice(0, 5);

      return {
        totalEssays,
        avgScore,
        pendingReview,
        activeStudents,
        scoreDistribution,
        statusData,
        progressOverTime,
        topPerformers,
        needsAttention,
      };
    },
  });
};