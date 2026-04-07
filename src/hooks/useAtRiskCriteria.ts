import { useState, useEffect, useCallback } from "react";

export interface AtRiskCriteria {
  /** Completion % below which a student is "at-risk" (default 40) */
  atRiskThreshold: number;
  /** Completion % below which a student "needs attention" (default 70) */
  needsAttentionThreshold: number;
  /** Weight of essay completion in the overall completion score (default 60) */
  essayWeight: number;
  /** Weight of recommendation completion in the overall completion score (default 40) */
  recWeight: number;
  /** Flag: trigger "at-risk" when student has no essays submitted */
  triggerNoEssays: boolean;
  /** Flag: trigger "at-risk" when completion is below atRiskThreshold */
  triggerLowCompletion: boolean;
  /** Flag: trigger "at-risk" when upcoming deadlines >= deadlineCountThreshold */
  triggerManyDeadlines: boolean;
  /** Number of upcoming deadlines that triggers the many-deadlines flag */
  deadlineCountThreshold: number;
  /** Flag: trigger "at-risk" when no recommendation letters received */
  triggerNoRecs: boolean;
}

export const DEFAULT_CRITERIA: AtRiskCriteria = {
  atRiskThreshold: 40,
  needsAttentionThreshold: 70,
  essayWeight: 60,
  recWeight: 40,
  triggerNoEssays: true,
  triggerLowCompletion: true,
  triggerManyDeadlines: true,
  deadlineCountThreshold: 3,
  triggerNoRecs: true,
};

const STORAGE_KEY = "at-risk-criteria";

function load(): AtRiskCriteria {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CRITERIA;
    return { ...DEFAULT_CRITERIA, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_CRITERIA;
  }
}

export function useAtRiskCriteria() {
  const [criteria, setCriteriaState] = useState<AtRiskCriteria>(load);

  // Keep in sync if another tab updates the same key
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setCriteriaState(load());
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const setCriteria = useCallback((next: AtRiskCriteria) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setCriteriaState(next);
  }, []);

  return { criteria, setCriteria };
}
