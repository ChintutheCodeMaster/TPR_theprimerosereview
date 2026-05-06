import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface DimensionScore {
  score: number;
  insight: string;
}

export interface LabFeedback {
  authenticity: DimensionScore;
  specificity: DimensionScore;
  voice: DimensionScore;
  narrativeStrength: DimensionScore;
  memorability: DimensionScore;
  overallLabel: 'Strong Hook' | 'Promising' | 'Needs Work' | 'Blends In';
  overallSummary: string;
  suggestedActions: string[];
}

export interface Direction {
  title: string;
  angle: string;
  example: string;
  explanation: {
    why: string;
    what: string;
  };
}

export interface LabVersion {
  id: string;
  label: string;
  text: string;
  feedback: LabFeedback;
  createdAt: Date;
}

type AnalyzeState =
  | { status: 'idle' }
  | { status: 'analyzing' }
  | { status: 'success'; feedback: LabFeedback }
  | { status: 'error'; message: string };

type SuggestState =
  | { status: 'idle' }
  | { status: 'loading'; action: string }
  | { status: 'success'; action: string; suggestions: string[] }
  | { status: 'error'; message: string };

export type ExploreState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; directions: Direction[] }
  | { status: 'error'; message: string };

export const usePrimroseLab = () => {
  const [analyzeState, setAnalyzeState] = useState<AnalyzeState>({ status: 'idle' });
  const [suggestState, setSuggestState] = useState<SuggestState>({ status: 'idle' });
  const [exploreState, setExploreState] = useState<ExploreState>({ status: 'idle' });
  const [versions, setVersions] = useState<LabVersion[]>([]);
  const [activeVersionId, setActiveVersionId] = useState<string | null>(null);
  const [studentContext, setStudentContext] = useState<string | null>(null);

  useEffect(() => {
    const fetchContext = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('onboarding_answers')
        .select('personal_story, inspiration, background, career_goals, personal_strengths')
        .eq('user_id', user.id)
        .single();
      if (!data) return;
      const parts: string[] = [];
      if (data.personal_story) parts.push(`Personal story: ${data.personal_story}`);
      if (data.inspiration) parts.push(`Inspirations: ${data.inspiration}`);
      if (data.background) parts.push(`Background: ${data.background}`);
      if (data.career_goals) parts.push(`Goals: ${data.career_goals}`);
      if (data.personal_strengths) parts.push(`Strengths: ${data.personal_strengths}`);
      if (parts.length > 0) setStudentContext(parts.join('\n'));
    };
    fetchContext();
  }, []);

  const analyze = async (text: string) => {
    setAnalyzeState({ status: 'analyzing' });
    setSuggestState({ status: 'idle' });
    setExploreState({ status: 'idle' });
    try {
      const { data, error } = await supabase.functions.invoke('lab-feedback', {
        body: { text, mode: 'analyze', studentContext },
      });
      if (error || !data?.authenticity) {
        setAnalyzeState({ status: 'error', message: 'Something went wrong. Please try again.' });
        return;
      }
      setAnalyzeState({ status: 'success', feedback: data as LabFeedback });
    } catch {
      setAnalyzeState({ status: 'error', message: 'Something went wrong. Please try again.' });
    }
  };

  const getSuggestions = async (text: string, action: string) => {
    setSuggestState({ status: 'loading', action });
    try {
      const { data, error } = await supabase.functions.invoke('lab-feedback', {
        body: { text, mode: 'suggest', action },
      });
      if (error || !data?.suggestions) {
        setSuggestState({ status: 'error', message: 'Could not load suggestions.' });
        return;
      }
      setSuggestState({ status: 'success', action, suggestions: data.suggestions });
    } catch {
      setSuggestState({ status: 'error', message: 'Could not load suggestions.' });
    }
  };

  const exploreDirections = async (text: string) => {
    setExploreState({ status: 'loading' });
    setSuggestState({ status: 'idle' });
    try {
      const { data, error } = await supabase.functions.invoke('lab-feedback', {
        body: { text, mode: 'explore', studentContext },
      });
      if (error || !data?.directions) {
        setExploreState({ status: 'error', message: 'Could not load directions. Please try again.' });
        return;
      }
      setExploreState({ status: 'success', directions: data.directions });
    } catch {
      setExploreState({ status: 'error', message: 'Could not load directions. Please try again.' });
    }
  };

  const saveVersion = (text: string, feedback: LabFeedback) => {
    const id = crypto.randomUUID();
    const newVersion: LabVersion = {
      id,
      label: `V${versions.length + 1}`,
      text,
      feedback,
      createdAt: new Date(),
    };
    setVersions(prev => [...prev, newVersion]);
    setActiveVersionId(id);
    return newVersion;
  };

  const resetAnalysis = () => {
    setAnalyzeState({ status: 'idle' });
    setSuggestState({ status: 'idle' });
    setExploreState({ status: 'idle' });
  };

  return {
    analyzeState,
    suggestState,
    exploreState,
    versions,
    activeVersionId,
    setActiveVersionId,
    analyze,
    getSuggestions,
    exploreDirections,
    saveVersion,
    resetAnalysis,
  };
};
