import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

// Extracted so both queries use identical select strings — avoids drift
const APPLICATION_SELECT = `*`;

type Application = Database["public"]["Tables"]["applications"]["Row"];
type ApplicationUpdate = Database["public"]["Tables"]["applications"]["Update"];

export type ApplicationWithProfile = Application & {
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
};

export const useApplications = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // const { data: applications, isLoading, error } = useQuery({
  //   queryKey: ["applications"],
  //   queryFn: async () => {
  //     const { data: { user } } = await supabase.auth.getUser();
  //     if (!user) throw new Error("Not authenticated");

  //     // Get user role
  //     const { data: roleData } = await supabase
  //       .from("user_roles")
  //       .select("role")
  //       .eq("user_id", user.id)
  //       .single();

  //     const role = roleData?.role;

  //     if (role === "student") {
  //       // RLS handles scoping — policy filters rows to own student_id
  //       const { data, error } = await supabase
  //         .from("applications")
  //         .select(APPLICATION_SELECT)
  //         .order("deadline_date", { ascending: true });

  //       if (error) throw error;
  //       return (data ?? []) as unknown as ApplicationWithProfile[];
  //     }

  //     if (role === "counselor" || role === "admin") {
  //       const { data: assignments } = await supabase
  //         .from("student_counselor_assignments")
  //         .select("student_id")
  //         .eq("counselor_id", user.id);

  //       const studentIds = assignments?.map((a) => a.student_id) ?? [];
  //       if (studentIds.length === 0) return [];

  //       const { data, error } = await supabase
  //         .from("applications")
  //         .select(APPLICATION_SELECT)
  //         .in("student_id", studentIds)
  //         .order("deadline_date", { ascending: true });

  //       if (error) throw error;
  //       return (data ?? []) as unknown as ApplicationWithProfile[];
  //     }

  //     return [];
  //   },
  // });



const { data: applications, isLoading, error } = useQuery({
  queryKey: ["applications"],
  queryFn: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    const role = roleData?.role;

    let appsData: any[] = [];

    if (role === "student") {
      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .order("deadline_date", { ascending: true });
      if (error) throw error;
      appsData = data ?? [];
    }

    if (role === "counselor" || role === "admin") {
      // TODO: swap back to assignments when ready
      const { data: studentRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "student");

      const studentIds = studentRoles?.map((r) => r.user_id) ?? [];
      if (studentIds.length === 0) return [];

      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .in("student_id", studentIds)
        .order("deadline_date", { ascending: true });
      if (error) throw error;
      appsData = data ?? [];
    }

    // Fetch profiles separately
    const studentIds = [...new Set(appsData.map((a) => a.student_id))];
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("user_id, full_name, avatar_url")
      .in("user_id", studentIds);

    return appsData.map((app) => ({
      ...app,
      profiles: profilesData?.find((p) => p.user_id === app.student_id) ?? null,
    })) as ApplicationWithProfile[];
  },
});

  const updateApplication = useMutation({
    mutationFn: async ({ id, ...updates }: ApplicationUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("applications")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update application",
        variant: "destructive",
      });
    },
  });

  const createApplication = useMutation({
    mutationFn: async (newApp: Database["public"]["Tables"]["applications"]["Insert"]) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("applications")
        .insert({ ...newApp, student_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      toast({
        title: "Application added",
        description: "The application has been saved.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create application",
        variant: "destructive",
      });
    },
  });

  return {
    applications: applications ?? [],
    isLoading,
    error,
    updateApplication,
    createApplication,
  };
};