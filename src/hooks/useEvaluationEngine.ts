import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// ── Types ─────────────────────────────────────────────────────

export interface StoryScore {
  authenticity: number;
  clarity: number;
  depth: number;
  uniqueness: number;
  overall: number;
}

export interface UniversityFit {
  name: string;
  fitScore: number;
  strengths: string[];
  gaps: string[];
  verdict: string;
}

export interface RoadmapItem {
  priority: 'critical' | 'recommended' | 'polish';
  title: string;
  description: string;
}

export interface EvaluationResult {
  storyScore: StoryScore;
  universityFit: UniversityFit[];
  roadmap: RoadmapItem[];
}

export interface EvaluationHistoryItem {
  id: string;
  title: string | null;
  universities: string[];
  story_score: StoryScore;
  university_fit: UniversityFit[];
  roadmap: RoadmapItem[];
  essay_snapshot: string;
  created_at: string;
}

type EvalState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; result: EvaluationResult }
  | { status: 'error'; message: string };

// ── useEvaluationEngine ───────────────────────────────────────

export const useEvaluationEngine = () => {
  const [state, setState] = useState<EvalState>({ status: 'idle' });
  const queryClient = useQueryClient();

  const evaluate = async (essayContent: string, universities: string[]) => {
    setState({ status: 'loading' });

    try {
      const { data, error } = await supabase.functions.invoke('evaluation-engine', {
        body: { essayContent, universities },
      });

      if (error) {
        setState({ status: 'error', message: 'Something went wrong. Please try again in a moment.' });
        return;
      }

      if (!data?.storyScore) {
        setState({ status: 'error', message: 'Received an unexpected response. Please try again.' });
        return;
      }

      const result = data as EvaluationResult;

      // Save to DB (silently fail if table doesn't exist yet)
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await (supabase as any)
            .from('evaluation_results')
            .insert({
              student_id: user.id,
              essay_snapshot: essayContent,
              universities,
              story_score: result.storyScore,
              university_fit: result.universityFit,
              roadmap: result.roadmap,
            });

          // Per-university sliding window: keep only 4 most recent per school
          for (const university of universities) {
            const { data: existing } = await (supabase as any)
              .from('evaluation_results')
              .select('id, created_at')
              .eq('student_id', user.id)
              .filter('universities', 'cs', JSON.stringify([university]))
              .order('created_at', { ascending: true });

            if (existing && existing.length > 4) {
              const toDelete = existing.slice(0, existing.length - 4).map((r: any) => r.id);
              await (supabase as any)
                .from('evaluation_results')
                .delete()
                .in('id', toDelete);
            }
          }

          queryClient.invalidateQueries({ queryKey: ['evaluation-history'] });
        }
      } catch {
        // Non-fatal — results still display even if save fails
      }

      setState({ status: 'success', result });
    } catch {
      setState({ status: 'error', message: 'Something went wrong. Please try again in a moment.' });
    }
  };

  const reset = () => setState({ status: 'idle' });

  return { state, evaluate, reset };
};

// ── useEvaluationHistory ──────────────────────────────────────

export const useEvaluationHistory = () => {
  return useQuery({
    queryKey: ['evaluation-history'],
    queryFn: async (): Promise<EvaluationHistoryItem[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await (supabase as any)
        .from('evaluation_results')
        .select('id, title, universities, story_score, university_fit, roadmap, essay_snapshot, created_at')
        .eq('student_id', user.id)
        .order('created_at', { ascending: false });

      if (error) return []; // Table may not exist yet — fail silently
      return (data ?? []) as EvaluationHistoryItem[];
    },
    staleTime: 30_000,
  });
};

// ── useUpdateEvaluationTitle ──────────────────────────────────

export const useUpdateEvaluationTitle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }) => {
      const { error } = await (supabase as any)
        .from('evaluation_results')
        .update({ title })
        .eq('id', id);
      if (error) throw error;
    },
    onMutate: async ({ id, title }) => {
      await queryClient.cancelQueries({ queryKey: ['evaluation-history'] });
      const previous = queryClient.getQueryData(['evaluation-history']);
      queryClient.setQueryData(
        ['evaluation-history'],
        (old: EvaluationHistoryItem[] | undefined) =>
          old?.map(item => item.id === id ? { ...item, title } : item) ?? []
      );
      return { previous };
    },
    onError: (_err, _vars, context: any) => {
      if (context?.previous) {
        queryClient.setQueryData(['evaluation-history'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['evaluation-history'] });
    },
  });
};
