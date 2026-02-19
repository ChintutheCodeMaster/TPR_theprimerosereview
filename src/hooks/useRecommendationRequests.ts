import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type RecommendationRequest = Database["public"]["Tables"]["recommendation_requests"]["Row"];
type RecommendationInsert = Database["public"]["Tables"]["recommendation_requests"]["Insert"];
type RecommendationUpdate = Database["public"]["Tables"]["recommendation_requests"]["Update"];

export interface RecommendationWithProfile extends RecommendationRequest {
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
    email: string | null;
  } | null;
}

// Hook for students to manage their own requests
export const useStudentRecommendations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: requests, isLoading, error } = useQuery({
    queryKey: ["student-recommendations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recommendation_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as RecommendationRequest[];
    },
  });

  const createRequest = useMutation({
    mutationFn: async (newRequest: RecommendationInsert) => {
      const { data: { user } } = await supabase.auth.getUser();
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
      queryClient.invalidateQueries({ queryKey: ["student-recommendations"] });
      toast({
        title: "Questionnaire Submitted",
        description: "Your information has been sent to your counselor for review.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit questionnaire",
        variant: "destructive",
      });
    },
  });

  const updateRequest = useMutation({
    mutationFn: async ({ id, ...updates }: RecommendationUpdate & { id: string }) => {
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
      queryClient.invalidateQueries({ queryKey: ["student-recommendations"] });
    },
  });

  return {
    requests,
    isLoading,
    error,
    createRequest,
    updateRequest,
  };
};

// Hook for counselors to manage their students' requests
export const useCounselorRecommendations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: requests, isLoading, error } = useQuery({
    queryKey: ["counselor-recommendations"],
    queryFn: async () => {
      // Get logged in counselor
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Get only students assigned to this counselor
      const { data: assignments } = await supabase
        .from('student_counselor_assignments')
        .select('student_id')
        .eq('counselor_id', user.id)

      const studentIds = assignments?.map(a => a.student_id) || []
      if (studentIds.length === 0) return []

      // Fetch only those students' recommendations
      const { data: recommendations, error: recError } = await supabase
        .from('recommendation_requests')
        .select('*')
        .in('student_id', studentIds)
        .order('created_at', { ascending: false })

      if (recError) throw recError

      // Get profiles for each student
      const { data: profiles, error: profError } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url, email')
        .in('user_id', studentIds)

      if (profError) throw profError

      // Map profiles to recommendations
      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || [])

      return recommendations?.map(r => ({
        ...r,
        profiles: profileMap.get(r.student_id) || null,
      })) as RecommendationWithProfile[]
    },
  });

  const updateRequest = useMutation({
    mutationFn: async ({ id, ...updates }: RecommendationUpdate & { id: string }) => {
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
      queryClient.invalidateQueries({ queryKey: ["counselor-recommendations"] });
      toast({
        title: "Request Updated",
        description: "The recommendation request has been updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update request",
        variant: "destructive",
      });
    },
  });

  const sendLetter = useMutation({
    mutationFn: async ({ id, letter }: { id: string; letter: string }) => {
      const { data, error } = await supabase
        .from("recommendation_requests")
        .update({
          generated_letter: letter,
          status: "sent",
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["counselor-recommendations"] });
      toast({
        title: "Letter Sent",
        description: "The recommendation letter has been sent to the student.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send letter",
        variant: "destructive",
      });
    },
  });

  return {
    requests,
    isLoading,
    error,
    updateRequest,
    sendLetter,
  };
};
