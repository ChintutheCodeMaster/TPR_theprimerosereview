import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useAssignedStudents = () => {
  return useQuery({
    queryKey: ["assigned-students"],
    queryFn: async (): Promise<string[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("student_counselor_assignments")
        .select("student_id")
        .eq("counselor_id", user.id);

      if (error) throw error;

      return data?.map((a) => a.student_id) ?? [];
    },
  });
};