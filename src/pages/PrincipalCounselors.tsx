import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { usePrincipalSchool } from "@/hooks/usePrincipalSchool";
import { useAtRiskCriteria } from "@/hooks/useAtRiskCriteria";
import { computeCompletion, classifyRisk } from "@/lib/atRiskUtils";
import { Building2, ShieldAlert, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CounselorRow {
  user_id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  studentCount: number;
  essaysPending: number;
  atRiskCount: number;
  avgCompletion: number | null;
}

const PrincipalCounselors = () => {
  const { data: school, isLoading: loadingSchool } = usePrincipalSchool();
  const { criteria } = useAtRiskCriteria();
  const [counselors, setCounselors] = useState<CounselorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!school?.schoolId) return;

    const fetchCounselors = async () => {
      setLoading(true);
      setError(null);
      try {
        type SchoolMember = { user_id: string; role: string; full_name: string | null; email: string | null; avatar_url: string | null };
        const { data: members, error: rpcError } = await (supabase as any)
          .rpc("get_school_members", { p_school_id: school.schoolId });

        if (rpcError) {
          setError("Failed to load counselor roster. Please try again.");
          return;
        }

        const allMembers = (members ?? []) as SchoolMember[];
        const counselorMembers = allMembers.filter(m => m.role === "counselor");

        if (counselorMembers.length === 0) { setCounselors([]); return; }

        const counselorIds = counselorMembers.map(m => m.user_id);

        const { data: assignmentsData } = await supabase
          .from("student_counselor_assignments")
          .select("counselor_id, student_id")
          .in("counselor_id", counselorIds);

        const assignments = assignmentsData ?? [];

        // Build counselor → [student_id] map
        const counselorStudentsMap = new Map<string, string[]>();
        for (const cid of counselorIds) counselorStudentsMap.set(cid, []);
        for (const a of assignments) {
          if (counselorStudentsMap.has(a.counselor_id)) {
            counselorStudentsMap.get(a.counselor_id)!.push(a.student_id);
          }
        }

        const allStudentIds = [...new Set(assignments.map(a => a.student_id))];

        if (allStudentIds.length === 0) {
          const rows: CounselorRow[] = counselorMembers.map(p => ({
            user_id: p.user_id, full_name: p.full_name, email: p.email, avatar_url: p.avatar_url,
            studentCount: 0, essaysPending: 0, atRiskCount: 0, avgCompletion: null,
          }));
          setCounselors(rows);
          return;
        }

        const todayStr    = new Date().toISOString().split("T")[0];
        const in30DaysStr = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

        const [essaysRes, recsRes, appsRes] = await Promise.all([
          supabase.from("essay_feedback").select("student_id, status").in("student_id", allStudentIds),
          supabase.from("recommendation_requests").select("student_id, status").in("student_id", allStudentIds),
          supabase.from("applications").select("student_id, deadline_date, status").in("student_id", allStudentIds),
        ]);

        const allEssays = essaysRes.data ?? [];
        const allRecs   = recsRes.data   ?? [];
        const allApps   = appsRes.data   ?? [];

        // Urgent student set (deadline ≤ 30 days, not submitted)
        const urgentStudentIds = new Set(
          allApps
            .filter(a => a.status !== "submitted" && a.deadline_date >= todayStr && a.deadline_date <= in30DaysStr)
            .map(a => a.student_id)
        );

        // Per-student completion maps
        const essayMap = new Map<string, { total: number; done: number }>();
        const recMap   = new Map<string, { total: number; done: number }>();

        for (const e of allEssays) {
          if (!essayMap.has(e.student_id)) essayMap.set(e.student_id, { total: 0, done: 0 });
          const entry = essayMap.get(e.student_id)!;
          entry.total++;
          if (["sent", "read", "approved"].includes(e.status)) entry.done++;
        }

        for (const r of allRecs) {
          if (!recMap.has(r.student_id)) recMap.set(r.student_id, { total: 0, done: 0 });
          const entry = recMap.get(r.student_id)!;
          entry.total++;
          if (r.status === "sent") entry.done++;
        }

        const studentScore = (sid: string) => {
          const essays = essayMap.get(sid) ?? { total: 0, done: 0 };
          const recs   = recMap.get(sid)   ?? { total: 0, done: 0 };
          return computeCompletion(essays.done, essays.total, recs.done, recs.total, criteria);
        };

        // Per-counselor essays pending
        const pendingEssayMap = new Map<string, number>();
        for (const e of allEssays.filter(e => e.status === "pending")) {
          for (const [cid, sids] of counselorStudentsMap.entries()) {
            if (sids.includes(e.student_id)) {
              pendingEssayMap.set(cid, (pendingEssayMap.get(cid) ?? 0) + 1);
            }
          }
        }

        const rows: CounselorRow[] = counselorMembers.map(p => {
            const studentIds = counselorStudentsMap.get(p.user_id) ?? [];
            const scores = studentIds.map(sid => studentScore(sid));
            const avgCompletion = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
            const atRiskCount = studentIds.filter(sid => classifyRisk(studentScore(sid), urgentStudentIds.has(sid), criteria) === "at-risk").length;

            return {
              user_id: p.user_id,
              full_name: p.full_name,
              email: p.email,
              avatar_url: p.avatar_url,
              studentCount: studentIds.length,
              essaysPending: pendingEssayMap.get(p.user_id) ?? 0,
              atRiskCount,
              avgCompletion,
            };
          });

        setCounselors(rows);
      } finally {
        setLoading(false);
      }
    };

    fetchCounselors();
  }, [school?.schoolId, criteria, retryKey]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Counselor Roster</h1>
        <p className="text-muted-foreground mt-1">
          {loadingSchool || loading ? "Loading…" : `${counselors.length} counselors at ${school?.schoolName}`}
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span className="flex-1">{error}</span>
          <Button size="sm" variant="outline" className="shrink-0" onClick={() => { setError(null); setRetryKey(k => k + 1); }}>
            Retry
          </Button>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="divide-y divide-border">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-4 p-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-56" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              ))}
            </div>
          ) : counselors.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Building2 className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No counselors found at this school</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {counselors.map(c => (
                <div key={c.user_id} className="flex items-center gap-4 p-4 flex-wrap">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src={c.avatar_url ?? undefined} />
                    <AvatarFallback>
                      {(c.full_name ?? "?").split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{c.full_name ?? "—"}</p>
                    <p className="text-sm text-muted-foreground truncate">{c.email ?? "—"}</p>
                  </div>

                  {/* Avg completion */}
                  {c.avgCompletion !== null && (
                    <div className="flex flex-col gap-1 w-32 shrink-0">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Avg completion</span>
                        <span className="font-medium text-foreground">{c.avgCompletion}%</span>
                      </div>
                      <Progress
                        value={c.avgCompletion}
                        className={`h-2 ${c.avgCompletion < criteria.atRiskThreshold ? "[&>div]:bg-destructive" : c.avgCompletion < criteria.needsAttentionThreshold ? "[&>div]:bg-amber-500" : "[&>div]:bg-green-500"}`}
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="secondary" className="text-xs">
                      {c.studentCount} {c.studentCount === 1 ? "student" : "students"}
                    </Badge>
                    {c.essaysPending > 0 && (
                      <Badge variant="outline" className="text-xs text-amber-600 border-amber-400 gap-1">
                        <Clock className="h-3 w-3" />
                        {c.essaysPending} pending
                      </Badge>
                    )}
                    {c.atRiskCount > 0 && (
                      <Badge variant="destructive" className="text-xs gap-1">
                        <ShieldAlert className="h-3 w-3" />
                        {c.atRiskCount} at risk
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PrincipalCounselors;
