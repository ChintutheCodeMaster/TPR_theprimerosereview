import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Shared hook that resolves school_id for both principal and parent users.
// Principal: has school_id directly on their profile.
// Parent: resolves via their child's profile school_id.
export const useSchoolIdForCurrentUser = () => {
  return useQuery({
    queryKey: ["my-school-id"],
    queryFn: async (): Promise<string | null> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile } = await supabase
        .from("profiles")
        .select("school_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profile?.school_id) return profile.school_id;

      // Fallback for parents: resolve via child's school
      const { data: assignment } = await supabase
        .from("parent_student_assignments")
        .select("student_id")
        .eq("parent_id", user.id)
        .limit(1)
        .maybeSingle();

      if (assignment?.student_id) {
        const { data: childProfile } = await supabase
          .from("profiles")
          .select("school_id")
          .eq("user_id", assignment.student_id)
          .maybeSingle();
        return childProfile?.school_id ?? null;
      }

      return null;
    },
  });
};
