import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthState } from "@/hooks/useAuthState";
import { useApplications } from "@/hooks/useApplications";

export type NextStep = {
  id: string;
  label: string;
  route?: string;
  status: "todo" | "in_progress" | "done";
};

const STORAGE_PREFIX = "pp:companion:path:";

function readCache(userId: string): NextStep[] | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_PREFIX + userId);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as NextStep[]) : null;
  } catch {
    return null;
  }
}

function writeCache(userId: string, steps: NextStep[]) {
  try {
    sessionStorage.setItem(STORAGE_PREFIX + userId, JSON.stringify(steps));
  } catch {
    // ignore quota / disabled storage
  }
}

function clearCache(userId: string) {
  try {
    sessionStorage.removeItem(STORAGE_PREFIX + userId);
  } catch {
    // ignore
  }
}

export function useCompanionNextSteps(currentRoute: string, enabled: boolean) {
  const { user } = useAuthState();
  const { applications } = useApplications();
  const queryClient = useQueryClient();

  const userId = user?.id ?? "anon";
  const queryKey = ["companion", "next-steps", userId];
  const cached = user ? readCache(userId) : null;

  const query = useQuery({
    queryKey,
    // One-shot per session: skip the network call entirely when a cached
    // result already exists. Manual regenerate clears the cache and refetches.
    enabled: enabled && !!user && !cached,
    staleTime: Infinity,
    gcTime: 15 * 60 * 1000,
    initialData: cached ?? undefined,
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
      const items = Array.isArray(data?.items) ? (data.items as NextStep[]) : [];
      writeCache(userId, items);
      return items;
    },
  });

  const regenerate = async () => {
    if (!user) return;
    clearCache(userId);
    queryClient.removeQueries({ queryKey });
    await query.refetch();
  };

  return { ...query, regenerate };
}
