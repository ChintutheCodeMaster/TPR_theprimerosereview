import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useSchoolLogo = () => {
  return useQuery({
    queryKey: ["school-logo"],
    queryFn: async (): Promise<string | null> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile } = await supabase
        .from("profiles")
        .select("school_id")
        .eq("user_id", user.id)
        .single();

      if (!profile?.school_id) return null;

      const { data: school } = await supabase
        .from("schools")
        .select("logo_url")
        .eq("id", profile.school_id)
        .single();

      return (school as any)?.logo_url ?? null;
    },
    staleTime: 5 * 60 * 1000,
  });
};
