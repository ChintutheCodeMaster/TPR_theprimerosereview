import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface StudentSummarySections {
  who_they_are: string;
  academic_goals: string;
  strengths_values: string;
  talking_points: string;
}

interface SummaryResponse {
  summary: StudentSummarySections;
  generatedAt: string;
  cached: boolean;
}

async function invokeSummary(studentId: string, force: boolean): Promise<SummaryResponse> {
  const { data, error } = await supabase.functions.invoke("generate-student-summary", {
    body: { studentId, force },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data as SummaryResponse;
}

export function useStudentSummary(studentId: string | null, enabled: boolean) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isRegenerating, setIsRegenerating] = useState(false);

  const query = useQuery({
    queryKey: ["student-summary", studentId],
    queryFn: () => invokeSummary(studentId as string, false),
    enabled: enabled && !!studentId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const regenerate = async () => {
    if (!studentId) return;
    setIsRegenerating(true);
    try {
      const fresh = await invokeSummary(studentId, true);
      queryClient.setQueryData(["student-summary", studentId], fresh);
      toast({ title: "Summary regenerated" });
    } catch (err) {
      toast({
        title: "Regeneration failed",
        description: err instanceof Error ? err.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  return {
    summary: query.data?.summary ?? null,
    generatedAt: query.data?.generatedAt ?? null,
    isLoading: query.isLoading,
    isRegenerating,
    error: query.error as Error | null,
    regenerate,
  };
}
