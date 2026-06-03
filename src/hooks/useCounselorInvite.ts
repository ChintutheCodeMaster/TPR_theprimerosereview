import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCounselorInvite = () => {
  return useQuery({
    queryKey: ["counselor-invite"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("counselor_invites")
        .select("invite_code")
        .eq("counselor_id", user.id)
        .eq("invite_role", "student")
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        const inviteCode = Math.random().toString(36).substring(2, 15);
        const { error: insertError } = await supabase
          .from("counselor_invites")
          .insert({ counselor_id: user.id, invite_code: inviteCode, invite_role: "student" });
        if (insertError) throw insertError;
        return `${window.location.origin}/signup?invite=${inviteCode}`;
      }

      return `${window.location.origin}/signup?invite=${data.invite_code}`;
    }
  });
};