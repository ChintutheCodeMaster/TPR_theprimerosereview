import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ApplicationRecommendation {
  id: string;
  student_id: string;
  application_id: string | null;
  referee_name: string;
  referee_role: string | null;
  teacher_email: string | null;
  status: "draft" | "pending" | "in_progress" | "sent";
  created_at: string;
  updated_at: string;
}

export interface AddRecommendationPayload {
  student_id: string;
  referee_name: string;
  referee_role?: string;
  teacher_email?: string;
}

// Sync recommendations_requested and recommendations_submitted back to applications table
async function syncRecCounts(applicationId: string) {
  const { data: recs, error } = await (supabase
    .from("recommendation_requests")
    .select("status") as any)
    .eq("application_id", applicationId);

  if (error || !recs) return;

  const total  = recs.length;
  const sent   = recs.filter((r: { status: string }) => r.status === "sent").length;

  // Fetch current requested count — keep it if it's already higher (set at creation)
  const { data: app } = await supabase
    .from("applications")
    .select("recommendations_requested")
    .eq("id", applicationId)
    .single();

  const requested = Math.max(app?.recommendations_requested ?? 0, total);

  await supabase
    .from("applications")
    .update({
      recommendations_requested: requested,
      recommendations_submitted: sent,
    })
    .eq("id", applicationId);
}

export const useApplicationRecommendations = (applicationId: string | null) => {
  const queryClient = useQueryClient();

  const { data: recommendations = [], isLoading } = useQuery<ApplicationRecommendation[]>({
    queryKey: ["application-recommendations", applicationId],
    enabled: !!applicationId,
    queryFn: async () => {
      const { data, error } = await (supabase
        .from("recommendation_requests")
        .select("id, student_id, application_id, referee_name, referee_role, teacher_email, status, created_at, updated_at") as any)
        .eq("application_id", applicationId!)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return (data ?? []) as ApplicationRecommendation[];
    },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["application-recommendations", applicationId] });
    queryClient.invalidateQueries({ queryKey: ["applications"] });
  };

  const addRecommendation = useMutation({
    mutationFn: async (payload: AddRecommendationPayload) => {
      const { data, error } = await supabase
        .from("recommendation_requests")
        .insert({
          student_id:    payload.student_id,
          referee_name:  payload.referee_name,
          referee_role:  payload.referee_role ?? null,
          teacher_email: payload.teacher_email ?? null,
          application_id: applicationId,
          status: "pending",
        } as any)
        .select()
        .single();

      if (error) throw error;
      if (applicationId) await syncRecCounts(applicationId);
      return data;
    },
    onSuccess: invalidate,
  });

  const updateRecStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ApplicationRecommendation["status"] }) => {
      const { error } = await supabase
        .from("recommendation_requests")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
      if (applicationId) await syncRecCounts(applicationId);
    },
    onSuccess: invalidate,
  });

  const sentCount  = recommendations.filter((r) => r.status === "sent").length;
  const totalCount = recommendations.length;

  return { recommendations, isLoading, addRecommendation, updateRecStatus, sentCount, totalCount };
};
