import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// ── Types ─────────────────────────────────────────────────────

export interface StudentStats {
  my_essays_completed: number;
  my_essays_total: number;
  my_applications_submitted: number;
  my_applications_total: number;
  my_recommendations_sent: number;
  my_recommendations_total: number;
  school_avg_essays_pct: number;
  school_avg_applications_pct: number;
  school_avg_recommendations_pct: number;
  school_rank_pct: number;
}

export interface Milestone {
  id: string;
  student_id: string;
  label: string;
  completed: boolean;
  completed_at: string | null;
  due_date: string | null;
  created_at: string;
}

// ── Hook ──────────────────────────────────────────────────────

export const useStudentStats = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // ── Stats via RPC ──────────────────────────────────────────
  const {
    data: stats,
    isLoading: isLoadingStats,
    error: statsError,
  } = useQuery({
    queryKey: ["student-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_student_stats");
      if (error) throw error;
      return data as unknown as StudentStats;
    },
  });

  // ── Student profile (for name) ─────────────────────────────
  const { data: profile } = useQuery({
    queryKey: ["my-profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // ── Milestones ─────────────────────────────────────────────
  const {
    data: milestones = [],
    isLoading: isLoadingMilestones,
    error: milestonesError,
  } = useQuery({
    queryKey: ["student-milestones"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("milestones")
        .select("*")
        .eq("student_id", user.id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as Milestone[];
    },
  });

  // ── Mark milestone complete ────────────────────────────────
  const completeMilestone = useMutation({
    mutationFn: async (milestoneId: string) => {
      const { error } = await supabase
        .from("milestones")
        .update({
          completed: true,
          completed_at: new Date().toISOString(),
        })
        .eq("id", milestoneId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-milestones"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update milestone",
        variant: "destructive",
      });
    },
  });

  // ── Derived percentages ────────────────────────────────────
  const safePct = (num: number, den: number) =>
    den > 0 ? Math.round((num / den) * 100) : 0;

  const myPct = stats
    ? {
        essays: safePct(stats.my_essays_completed, stats.my_essays_total),
        applications: safePct(
          stats.my_applications_submitted,
          stats.my_applications_total
        ),
        recommendations: safePct(
          stats.my_recommendations_sent,
          stats.my_recommendations_total
        ),
      }
    : { essays: 0, applications: 0, recommendations: 0 };

  const overallProgress = Math.round(
    (myPct.essays + myPct.applications + myPct.recommendations) / 3
  );

  return {
    stats,
    profile,
    milestones,
    myPct,
    overallProgress,
    isLoadingStats,
    isLoadingMilestones,
    statsError,
    milestonesError,
    completeMilestone,
  };
};