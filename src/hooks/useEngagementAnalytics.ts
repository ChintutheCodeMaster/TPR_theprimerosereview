import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type DateRange = 7 | 30 | 90;

export interface EngagementMetrics {
  // Top-line
  weeklyActivePct: number;
  avgSessionsPerStudent: number;
  avgMinutesPerWeek: number;
  returnRate: number;
  totalStudents: number;
  activeStudents: number;

  // Heatmap: 7 days × 24 hours
  heatmap: { day: number; hour: number; count: number }[];

  // Feature usage
  featureUsage: { feature: string; count: number }[];

  // Inactive students (last seen > 7 days ago)
  inactiveStudents: {
    userId: string;
    name: string;
    email: string;
    lastSeen: string | null;
    grade: string | null;
    counselorName: string | null;
  }[];

  // By counselor
  byCounselor: {
    counselorId: string;
    counselorName: string;
    studentCount: number;
    activeCount: number;
    avgSessions: number;
  }[];

  // By grade
  byGrade: { grade: string; activeCount: number; totalCount: number }[];
}

const FEATURE_LABELS: Record<string, string> = {
  primrose_lab: 'Primrose Lab',
  essay_feedback: 'Essay Feedback',
  scholarship_finder: 'Scholarship Finder',
  school_exploration: 'School Exploration',
};

export function useEngagementAnalytics(dateRange: DateRange = 7) {
  return useQuery({
    queryKey: ['engagement-analytics', dateRange],
    queryFn: async (): Promise<EngagementMetrics> => {
      const since = new Date(Date.now() - dateRange * 24 * 60 * 60 * 1000).toISOString();
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      // Fetch all student user_ids (role = student)
      const { data: studentRoles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'student');

      const studentIds = (studentRoles ?? []).map(r => r.user_id);
      const totalStudents = studentIds.length;

      if (totalStudents === 0) {
        return emptyMetrics();
      }

      // Fetch sessions in date range for students
      const { data: sessions } = await supabase
        .from('user_sessions' as any)
        .select('id, user_id, started_at, last_activity_at, ended_at, duration_seconds')
        .in('user_id', studentIds)
        .gte('started_at', since)
        .order('started_at', { ascending: false });

      const sessionRows = (sessions ?? []) as {
        id: string;
        user_id: string;
        started_at: string;
        last_activity_at: string;
        ended_at: string | null;
        duration_seconds: number | null;
      }[];

      // Fetch session events in date range for students
      const { data: events } = await supabase
        .from('session_events' as any)
        .select('session_id, user_id, page_path, feature, created_at')
        .in('user_id', studentIds)
        .gte('created_at', since);

      const eventRows = (events ?? []) as {
        session_id: string;
        user_id: string;
        page_path: string;
        feature: string | null;
        created_at: string;
      }[];

      // Fetch all time sessions to determine last_seen for inactive detection
      const { data: allSessions } = await supabase
        .from('user_sessions' as any)
        .select('user_id, last_activity_at')
        .in('user_id', studentIds)
        .order('last_activity_at', { ascending: false });

      const allSessionRows = (allSessions ?? []) as { user_id: string; last_activity_at: string }[];

      // Fetch student profiles (name, grade)
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .in('user_id', studentIds);

      const { data: studentProfiles } = await supabase
        .from('student_profiles')
        .select('user_id, grade')
        .in('user_id', studentIds);

      // Fetch counselor assignments
      const { data: assignments } = await supabase
        .from('student_counselor_assignments')
        .select('student_id, counselor_id')
        .in('student_id', studentIds);

      // Fetch counselor names
      const counselorIds = [...new Set((assignments ?? []).map(a => a.counselor_id))];
      const { data: counselorProfiles } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', counselorIds);

      // ── Compute metrics ───────────────────────────────────────────────

      const activeUserIds = new Set(sessionRows.map(s => s.user_id));
      const activeStudents = activeUserIds.size;

      // Weekly active %
      const weeklyActivePct = totalStudents > 0
        ? Math.round((activeStudents / totalStudents) * 100)
        : 0;

      // Avg sessions per student
      const avgSessionsPerStudent = activeStudents > 0
        ? Math.round((sessionRows.length / activeStudents) * 10) / 10
        : 0;

      // Avg minutes per week (normalised to 7 days regardless of range)
      const totalSeconds = sessionRows.reduce((sum, s) => sum + (s.duration_seconds ?? 0), 0);
      const weeklySeconds = dateRange > 7 ? (totalSeconds / dateRange) * 7 : totalSeconds;
      const avgMinutesPerWeek = activeStudents > 0
        ? Math.round(weeklySeconds / activeStudents / 60)
        : 0;

      // Return rate: students with >1 session / students with >=1 session
      const sessionsByUser: Record<string, number> = {};
      for (const s of sessionRows) {
        sessionsByUser[s.user_id] = (sessionsByUser[s.user_id] ?? 0) + 1;
      }
      const returningCount = Object.values(sessionsByUser).filter(c => c > 1).length;
      const returnRate = activeStudents > 0
        ? Math.round((returningCount / activeStudents) * 100)
        : 0;

      // Heatmap: group events by day-of-week (0=Sun) and hour
      const heatmapMap: Record<string, number> = {};
      for (const ev of eventRows) {
        const d = new Date(ev.created_at);
        const key = `${d.getDay()}-${d.getHours()}`;
        heatmapMap[key] = (heatmapMap[key] ?? 0) + 1;
      }
      const heatmap = Object.entries(heatmapMap).map(([key, count]) => {
        const [day, hour] = key.split('-').map(Number);
        return { day, hour, count };
      });

      // Feature usage
      const featureMap: Record<string, number> = {};
      for (const ev of eventRows) {
        if (ev.feature) featureMap[ev.feature] = (featureMap[ev.feature] ?? 0) + 1;
      }
      const featureUsage = Object.entries(featureMap).map(([feature, count]) => ({
        feature: FEATURE_LABELS[feature] ?? feature,
        count,
      })).sort((a, b) => b.count - a.count);

      // Inactive students: last_activity_at < 7 days ago OR never logged in
      const lastSeenByUser: Record<string, string> = {};
      for (const s of allSessionRows) {
        if (!lastSeenByUser[s.user_id] || s.last_activity_at > lastSeenByUser[s.user_id]) {
          lastSeenByUser[s.user_id] = s.last_activity_at;
        }
      }

      const profileMap: Record<string, { full_name: string | null; email: string | null }> = {};
      for (const p of (profiles ?? [])) {
        profileMap[p.user_id] = { full_name: p.full_name, email: p.email };
      }

      const gradeMap: Record<string, string | null> = {};
      for (const sp of (studentProfiles ?? [])) {
        gradeMap[sp.user_id] = sp.grade;
      }

      const assignmentMap: Record<string, string> = {};
      for (const a of (assignments ?? [])) {
        assignmentMap[a.student_id] = a.counselor_id;
      }

      const counselorNameMap: Record<string, string> = {};
      for (const cp of (counselorProfiles ?? [])) {
        counselorNameMap[cp.user_id] = cp.full_name ?? 'Unknown';
      }

      const inactiveStudents = studentIds
        .filter(uid => {
          const last = lastSeenByUser[uid];
          return !last || last < sevenDaysAgo;
        })
        .map(uid => ({
          userId: uid,
          name: profileMap[uid]?.full_name ?? 'Unknown',
          email: profileMap[uid]?.email ?? '',
          lastSeen: lastSeenByUser[uid] ?? null,
          grade: gradeMap[uid] ?? null,
          counselorName: assignmentMap[uid] ? counselorNameMap[assignmentMap[uid]] ?? null : null,
        }))
        .sort((a, b) => {
          if (!a.lastSeen) return -1;
          if (!b.lastSeen) return 1;
          return a.lastSeen < b.lastSeen ? -1 : 1;
        });

      // By counselor
      const counselorStudentSets: Record<string, Set<string>> = {};
      const counselorActiveSet: Record<string, Set<string>> = {};
      const counselorSessionCount: Record<string, number> = {};

      for (const a of (assignments ?? [])) {
        if (!counselorStudentSets[a.counselor_id]) counselorStudentSets[a.counselor_id] = new Set();
        counselorStudentSets[a.counselor_id].add(a.student_id);
      }
      for (const s of sessionRows) {
        const cid = assignmentMap[s.user_id];
        if (!cid) continue;
        if (!counselorActiveSet[cid]) counselorActiveSet[cid] = new Set();
        counselorActiveSet[cid].add(s.user_id);
        counselorSessionCount[cid] = (counselorSessionCount[cid] ?? 0) + 1;
      }

      const byCounselor = Object.entries(counselorStudentSets).map(([cid, students]) => {
        const active = counselorActiveSet[cid]?.size ?? 0;
        const sessions = counselorSessionCount[cid] ?? 0;
        return {
          counselorId: cid,
          counselorName: counselorNameMap[cid] ?? 'Unknown',
          studentCount: students.size,
          activeCount: active,
          avgSessions: active > 0 ? Math.round((sessions / active) * 10) / 10 : 0,
        };
      }).sort((a, b) => b.activeCount - a.activeCount);

      // By grade
      const gradeStudents: Record<string, Set<string>> = {};
      const gradeActive: Record<string, Set<string>> = {};
      for (const uid of studentIds) {
        const g = gradeMap[uid] ?? 'Unknown';
        if (!gradeStudents[g]) gradeStudents[g] = new Set();
        gradeStudents[g].add(uid);
      }
      for (const uid of activeUserIds) {
        const g = gradeMap[uid] ?? 'Unknown';
        if (!gradeActive[g]) gradeActive[g] = new Set();
        gradeActive[g].add(uid);
      }

      const byGrade = Object.entries(gradeStudents).map(([grade, all]) => ({
        grade,
        totalCount: all.size,
        activeCount: gradeActive[grade]?.size ?? 0,
      })).sort((a, b) => a.grade.localeCompare(b.grade));

      return {
        weeklyActivePct,
        avgSessionsPerStudent,
        avgMinutesPerWeek,
        returnRate,
        totalStudents,
        activeStudents,
        heatmap,
        featureUsage,
        inactiveStudents,
        byCounselor,
        byGrade,
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}

function emptyMetrics(): EngagementMetrics {
  return {
    weeklyActivePct: 0,
    avgSessionsPerStudent: 0,
    avgMinutesPerWeek: 0,
    returnRate: 0,
    totalStudents: 0,
    activeStudents: 0,
    heatmap: [],
    featureUsage: [],
    inactiveStudents: [],
    byCounselor: [],
    byGrade: [],
  };
}
