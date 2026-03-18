import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type TaskColor = "blue" | "purple" | "green" | "orange" | "pink" | "yellow";

export interface CounselorTask {
  id: string;
  counselor_id: string;
  title: string;
  done: boolean;
  color: TaskColor;
  created_at: string;
}

const QK = ["counselor-tasks"] as const;

export const useCounselorTasks = () => {
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery<CounselorTask[]>({
    queryKey: QK,
    queryFn: async () => {
      const { data, error } = await (supabase
        .from("counselor_tasks")
        .select("*")
        .order("created_at", { ascending: false }) as any);
      if (error) throw error;
      return data as CounselorTask[];
    },
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: QK });

  const addTask = useMutation({
    mutationFn: async ({ title, color }: { title: string; color: TaskColor }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await (supabase
        .from("counselor_tasks")
        .insert({ title, color, counselor_id: user!.id }) as any);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const toggleDone = useMutation({
    mutationFn: async ({ id, done }: { id: string; done: boolean }) => {
      const { error } = await (supabase
        .from("counselor_tasks")
        .update({ done, updated_at: new Date().toISOString() })
        .eq("id", id) as any);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase
        .from("counselor_tasks")
        .delete()
        .eq("id", id) as any);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const pending = tasks.filter((t) => !t.done).length;
  const done    = tasks.filter((t) => t.done).length;

  return { tasks, isLoading, addTask, toggleDone, deleteTask, pending, done };
};
