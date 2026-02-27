import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface EssayData {
  id: string;
  essay_title: string;
  essay_prompt: string | null;
  essay_content: string;
  status: string;
  feedback_items: any[] | null;
  personal_message: string | null;
  created_at: string;
  updated_at: string;
}

export const useEditEssay = (essayId: string | null) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // ── Fetch essay ──────────────────────────────────────────
  const {
    data: essay,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["essay", essayId],
    enabled: !!essayId,
    queryFn: async (): Promise<EssayData> => {
      const { data, error } = await supabase
        .from("essay_feedback")
        .select("*")
        .eq("id", essayId!)
        .single();

      if (error) throw error;
      return data as EssayData;
    },
  });

  // Redirect if no essayId or fetch fails
  useEffect(() => {
    if (!essayId) navigate("/student-personal-area");
  }, [essayId]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Could not load essay.",
        variant: "destructive",
      });
      navigate("/student-personal-area");
    }
  }, [error]);

  // ── Save draft ───────────────────────────────────────────
  const saveDraft = useMutation({
    mutationFn: async (content: string) => {
      const { error } = await supabase
        .from("essay_feedback")
        .update({
          essay_content: content,
          updated_at: new Date().toISOString(),
        })
        .eq("id", essayId!);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["essay", essayId] });
      toast({
        title: "Draft Saved",
        description: "Your changes have been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Save Failed",
        description: "Could not save draft.",
        variant: "destructive",
      });
    },
  });

  // ── Resubmit for review ──────────────────────────────────
  const resubmit = useMutation({
    mutationFn: async (content: string) => {
      const { error } = await supabase
        .from("essay_feedback")
        .update({
          essay_content: content,
          status: "pending",
          updated_at: new Date().toISOString(),
        })
        .eq("id", essayId!);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["essay", essayId] });
      queryClient.invalidateQueries({ queryKey: ["student-essays"] });
      toast({
        title: "Essay Resubmitted!",
        description: "Your counselor will review your revised essay.",
      });
      navigate("/student-personal-area");
    },
    onError: () => {
      toast({
        title: "Submission Failed",
        description: "Could not resubmit essay.",
        variant: "destructive",
      });
    },
  });

  return {
    essay,
    isLoading,
    saveDraft,
    resubmit,
  };
};