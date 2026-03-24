import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { usePrincipalSchool } from "./usePrincipalSchool";

export interface PrincipalStatsData {
  totalStudents: number;
  totalCounselors: number;
  totalEssays: number;
  totalApplications: number;
  totalRecLetters: number;
}

export const usePrincipalStats = () => {
  const { data: school, isLoading: loadingSchool } = usePrincipalSchool();

  return useQuery({
    queryKey: ["principal-stats", school?.schoolId],
    enabled: !!school?.schoolId && !loadingSchool,
    queryFn: async (): Promise<PrincipalStatsData> => {
      const schoolId = school!.schoolId;

      // All profiles at this school
      const { data: allProfiles } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("school_id", schoolId);

      const allProfileIds = allProfiles?.map(p => p.user_id) ?? [];

      if (allProfileIds.length === 0) {
        return { totalStudents: 0, totalCounselors: 0, totalEssays: 0, totalApplications: 0, totalRecLetters: 0 };
      }

      // Get roles in parallel
      const [studentRolesRes, counselorRolesRes] = await Promise.all([
        supabase.from("user_roles").select("user_id").eq("role", "student").in("user_id", allProfileIds),
        supabase.from("user_roles").select("user_id").eq("role", "counselor").in("user_id", allProfileIds),
      ]);

      const studentIds = studentRolesRes.data?.map(r => r.user_id) ?? [];
      const counselorIds = counselorRolesRes.data?.map(r => r.user_id) ?? [];

      if (studentIds.length === 0) {
        return {
          totalStudents: 0,
          totalCounselors: counselorIds.length,
          totalEssays: 0,
          totalApplications: 0,
          totalRecLetters: 0,
        };
      }

      const [essaysRes, appsRes, recsRes] = await Promise.all([
        supabase.from("essay_feedback").select("id", { count: "exact", head: true }).in("student_id", studentIds),
        supabase.from("applications").select("id", { count: "exact", head: true }).in("student_id", studentIds),
        supabase.from("recommendation_requests").select("id", { count: "exact", head: true }).in("student_id", studentIds),
      ]);

      return {
        totalStudents:    studentIds.length,
        totalCounselors:  counselorIds.length,
        totalEssays:      essaysRes.count ?? 0,
        totalApplications: appsRes.count ?? 0,
        totalRecLetters:  recsRes.count ?? 0,
      };
    },
  });
};
