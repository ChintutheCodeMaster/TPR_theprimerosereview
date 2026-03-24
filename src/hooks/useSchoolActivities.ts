import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SchoolActivity {
  id: string;
  school_id: string;
  created_by: string;
  title: string;
  date: string;
  time: string | null;
  location: string | null;
  category: string;
  status: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export type ActivityFormData = {
  title: string;
  date: string;
  time?: string;
  location?: string;
  category: string;
  status: string;
  description?: string;
};

export const useSchoolActivities = (schoolId: string | undefined) => {
  return useQuery({
    queryKey: ["school-activities", schoolId],
    enabled: !!schoolId,
    queryFn: async (): Promise<SchoolActivity[]> => {
      const { data, error } = await supabase
        .from("school_activities")
        .select("*")
        .eq("school_id", schoolId!)
        .order("date", { ascending: true });
      if (error) throw error;
      return (data ?? []) as SchoolActivity[];
    },
  });
};

export const useCreateActivity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ schoolId, form }: { schoolId: string; form: ActivityFormData }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("school_activities").insert({
        school_id:   schoolId,
        created_by:  user.id,
        title:       form.title,
        date:        form.date,
        time:        form.time || null,
        location:    form.location || null,
        category:    form.category,
        status:      form.status,
        description: form.description || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["school-activities"] });
    },
  });
};

export const useUpdateActivity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, form }: { id: string; form: Partial<ActivityFormData> }) => {
      const { error } = await supabase
        .from("school_activities")
        .update({
          title:       form.title,
          date:        form.date,
          time:        form.time || null,
          location:    form.location || null,
          category:    form.category,
          status:      form.status,
          description: form.description || null,
          updated_at:  new Date().toISOString(),
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["school-activities"] });
    },
  });
};

export const useDeleteActivity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("school_activities").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["school-activities"] });
    },
  });
};
