import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthState } from "@/hooks/useAuthState";
import { useApplications } from "@/hooks/useApplications";

export type NextStep = {
  id: string;
  label: string;
  route?: string;
  status: "todo" | "in_progress" | "done";
};

export function useCompanionNextSteps(currentRoute: string, enabled: boolean) {
  const { user } = useAuthState();
  const { applications } = useApplications();

  return useQuery({
    queryKey: ["companion", "next-steps", user?.id ?? "anon", currentRoute],
    enabled: enabled && !!user,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    queryFn: async (): Promise<NextStep[]> => {
      const snapshot = (applications ?? []).map((a) => ({
        id: a.id,
        school_name: a.school_name,
        deadline_date: a.deadline_date,
        completion_percentage: a.completion_percentage,
        status: a.status,
      }));

      const { data, error } = await supabase.functions.invoke("companion-next-steps", {
        body: { route: currentRoute, applications: snapshot },
      });

      if (error) throw error;
      const items = Array.isArray(data?.items) ? data.items : [];
      return items as NextStep[];
    },
  });
}
