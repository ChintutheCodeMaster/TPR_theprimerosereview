import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ApplicationWithProfile } from "@/hooks/useApplications";

export const useArchivedApplications = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["applications", "archived"],
    queryFn: async (): Promise<ApplicationWithProfile[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: apps, error: appErr } = await ((supabase as any)
        .from("applications")
        .select("*")
        .eq("student_id", user.id)
        .eq("archived", true)
        .order("deadline_date", { ascending: true }));

      if (appErr) throw appErr;
      return (apps ?? []) as ApplicationWithProfile[];
    },
  });

  return {
    applications: data ?? [],
    isLoading,
    error,
    refetch,
  };
};
