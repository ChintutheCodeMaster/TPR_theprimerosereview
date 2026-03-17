import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type RecommendationRequest =
  Database["public"]["Tables"]["recommendation_requests"]["Row"];

type RecommendationInsert =
  Database["public"]["Tables"]["recommendation_requests"]["Insert"];

type RecommendationUpdate =
  Database["public"]["Tables"]["recommendation_requests"]["Update"];

export interface RecommendationWithProfile extends RecommendationRequest {
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
    email: string | null;
  } | null;
  // Teacher fields added via migration (not yet in generated types)
  teacher_token?: string | null;
  teacher_email?: string | null;
  teacher_draft?: string | null;
}

/* ============================================================
   STUDENT HOOK
============================================================ */

export const useStudentRecommendations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ["student-recommendations"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("recommendation_requests")
        .select("*")
        .eq("student_id", user.id) // 🔒 Properly scoped
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as RecommendationRequest[];
    },
  });

  const createRequest = useMutation({
    mutationFn: async (newRequest: RecommendationInsert) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("recommendation_requests")
        .insert({
          ...newRequest,
          student_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["student-recommendations"],
      });

      toast({
        title: "Questionnaire Submitted",
        description:
          "Your information has been sent to your counselor for review.",
      });
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err.message || "Failed to submit questionnaire",
        variant: "destructive",
      });
    },
  });

  const updateRequest = useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: RecommendationUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("recommendation_requests")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["student-recommendations"],
      });
    },
  });

  return {
    requests: data ?? [],
    isLoading,
    error,
    createRequest,
    updateRequest,
  };
};

/* ============================================================
   COUNSELOR HOOK
============================================================ */

export const useCounselorRecommendations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ["counselor-recommendations"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      // Get assigned students
      const { data: assignments, error: assignError } = await supabase
        .from("student_counselor_assignments")
        .select("student_id")
        .eq("counselor_id", user.id);

      if (assignError) throw assignError;

      const studentIds =
        assignments?.map((a) => a.student_id) ?? [];

      if (studentIds.length === 0) return [];

      // Fetch recommendations
      const { data: recommendations, error: recError } =
        await supabase
          .from("recommendation_requests")
          .select("*")
          .in("student_id", studentIds)
          .order("created_at", { ascending: false });

      if (recError) throw recError;

      // Fetch profiles
      const { data: profiles, error: profError } =
        await supabase
          .from("profiles")
          .select("user_id, full_name, avatar_url, email")
          .in("user_id", studentIds);

      if (profError) throw profError;

      const profileMap = new Map(
        profiles?.map((p) => [p.user_id, p]) ?? []
      );

      return (
        recommendations?.map((r) => ({
          ...r,
          profiles: profileMap.get(r.student_id) ?? null,
        })) ?? []
      ) as RecommendationWithProfile[];
    },
  });

  const updateRequest = useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: RecommendationUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("recommendation_requests")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["counselor-recommendations"],
      });

      toast({
        title: "Request Updated",
        description:
          "The recommendation request has been updated.",
      });
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err.message || "Failed to update request",
        variant: "destructive",
      });
    },
  });

  const sendLetter = useMutation({
    mutationFn: async ({
      id,
      letter,
    }: {
      id: string;
      letter: string;
    }) => {
      const { data, error } = await supabase
        .from("recommendation_requests")
        .update({
          generated_letter: letter,
          status: "sent", // 🔥 Trigger fires here
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["counselor-recommendations"],
      });

      // If you want instant progress update
      queryClient.invalidateQueries({
        queryKey: ["applications"],
      });

      toast({
        title: "Letter Sent",
        description:
          "The recommendation letter has been sent to the student.",
      });
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err.message || "Failed to send letter",
        variant: "destructive",
      });
    },
  });

  return {
    requests: data ?? [],
    isLoading,
    error,
    updateRequest,
    sendLetter,
  };
};