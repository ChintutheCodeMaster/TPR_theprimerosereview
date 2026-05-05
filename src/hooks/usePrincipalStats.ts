import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { usePrincipalSchool } from "./usePrincipalSchool";
import { useAtRiskCriteria } from "./useAtRiskCriteria";
import { computeCompletion, classifyRisk } from "@/lib/atRiskUtils";

export interface PrincipalStatsData {
  totalStudents:      number;
  totalCounselors:    number;
  totalEssays:        number;
  totalApplications:  number;
  totalRecLetters:    number;
  atRiskCount:        number;
  essaysPending:      number;
  urgentApplications: number;
}

export const usePrincipalStats = () => {
  const { data: school, isLoading: loadingSchool } = usePrincipalSchool();
  const { criteria, isLoading: loadingCriteria } = useAtRiskCriteria();


  
  return useQuery({
    queryKey: ["principal-stats", school?.schoolId, criteria.atRiskThreshold, criteria.essayWeight, criteria.recWeight],
    enabled: !!school?.schoolId && !loadingSchool && !loadingCriteria,
    queryFn: async (): Promise<PrincipalStatsData> => {
      const schoolId = school!.schoolId;

      const { data: members } = await supabase
        .rpc("get_school_members", { p_school_id: schoolId });

      const allMembers = (members ?? []) as { user_id: string; role: string }[];

      if (allMembers.length === 0) {
        return { totalStudents: 0, totalCounselors: 0, totalEssays: 0, totalApplications: 0, totalRecLetters: 0, atRiskCount: 0, essaysPending: 0, urgentApplications: 0 };
      }

      const studentIds   = allMembers.filter(m => m.role === "student").map(m => m.user_id);
      const counselorIds = allMembers.filter(m => m.role === "counselor").map(m => m.user_id);

      if (studentIds.length === 0) {
        return { totalStudents: 0, totalCounselors: counselorIds.length, totalEssays: 0, totalApplications: 0, totalRecLetters: 0, atRiskCount: 0, essaysPending: 0, urgentApplications: 0 };
      }

      // Bulk fetch everything we need
      const todayStr     = new Date().toISOString().split("T")[0];
      const in30DaysStr  = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

      const [allEssaysRes, allAppsRes, allRecsRes] = await Promise.all([
        supabase.from("essay_feedback").select("student_id, status").in("student_id", studentIds),
        supabase.from("applications").select("student_id, deadline_date, status").in("student_id", studentIds),
        supabase.from("recommendation_requests").select("student_id, status").in("student_id", studentIds),
      ]);

      const allEssays = allEssaysRes.data ?? [];
      const allApps   = allAppsRes.data   ?? [];
      const allRecs   = allRecsRes.data   ?? [];

      // Totals
      const totalEssays       = allEssays.length;
      const totalApplications = allApps.length;
      const totalRecLetters   = allRecs.length;

      // Essays pending counselor review
      const essaysPending = allEssays.filter(e => e.status === "pending").length;

      // Urgent applications: deadline within next 30 days, not submitted yet
      const urgentApps = allApps.filter(
        a => a.status !== "submitted" && a.deadline_date >= todayStr && a.deadline_date <= in30DaysStr
      );
      const urgentApplications  = urgentApps.length;
      const urgentStudentIds = new Set(urgentApps.map(a => a.student_id));

      // At-risk computation: same 60/40 formula used everywhere in the platform
      const essayMap = new Map<string, { total: number; done: number }>();
      const recMap   = new Map<string, { total: number; done: number }>();

      allEssays.forEach(e => {
        if (!essayMap.has(e.student_id)) essayMap.set(e.student_id, { total: 0, done: 0 });
        const entry = essayMap.get(e.student_id)!;
        entry.total++;
        if (["sent", "read", "approved"].includes(e.status)) entry.done++;
      });

      allRecs.forEach(r => {
        if (!recMap.has(r.student_id)) recMap.set(r.student_id, { total: 0, done: 0 });
        const entry = recMap.get(r.student_id)!;
        entry.total++;
        if (r.status === "sent") entry.done++;
      });

      let atRiskCount = 0;
      for (const sid of studentIds) {
        if (!urgentStudentIds.has(sid)) continue;
        const essays = essayMap.get(sid) ?? { total: 0, done: 0 };
        const recs   = recMap.get(sid)   ?? { total: 0, done: 0 };
        const score  = computeCompletion(essays.done, essays.total, recs.done, recs.total, criteria);
        if (classifyRisk(score, true, criteria) === "at-risk") atRiskCount++;
      }

      return {
        totalStudents:      studentIds.length,
        totalCounselors:    counselorIds.length,
        totalEssays,
        totalApplications,
        totalRecLetters,
        atRiskCount,
        essaysPending,
        urgentApplications,
      };
    },
  });
};
