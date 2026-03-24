import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PrincipalSchool {
  schoolId: string;
  schoolName: string;
  logoUrl: string | null;
}

export const usePrincipalSchool = () => {
  return useQuery({
    queryKey: ["principal-school"],
    queryFn: async (): Promise<PrincipalSchool> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("school_id")
        .eq("user_id", user.id)
        .single();

      if (profileError || !profile?.school_id)
        throw new Error("No school linked to this account");

      const { data: school, error: schoolError } = await supabase
        .from("schools")
        .select("id, name, logo_url")
        .eq("id", profile.school_id)
        .single();

      if (schoolError || !school) throw new Error("School not found");

      return {
        schoolId: school.id,
        schoolName: school.name,
        logoUrl: (school as any).logo_url ?? null,
      };
    },
  });
};

export const useUpdateSchool = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ schoolId, name, logoUrl }: { schoolId: string; name?: string; logoUrl?: string }) => {
      const updates: Record<string, string> = {};
      if (name !== undefined) updates.name = name;
      if (logoUrl !== undefined) updates.logo_url = logoUrl;

      const { error } = await supabase
        .from("schools")
        .update(updates)
        .eq("id", schoolId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["principal-school"] });
    },
  });
};
