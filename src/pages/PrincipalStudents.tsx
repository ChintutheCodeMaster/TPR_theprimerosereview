import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { usePrincipalSchool } from "@/hooks/usePrincipalSchool";
import { useAtRiskCriteria } from "@/hooks/useAtRiskCriteria";
import { computeCompletion, classifyRisk } from "@/lib/atRiskUtils";
import { Search, Users, ShieldAlert, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StudentRow {
  user_id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  graduation_year: number | null;
  gpa: number | null;
  completionScore: number;
  isAtRisk: boolean;
  needsAttention: boolean;
  counselorName: string | null;
}

const PrincipalStudents = () => {
  const { data: school, isLoading: loadingSchool } = usePrincipalSchool();
  const { criteria } = useAtRiskCriteria();
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!school?.schoolId) return;

    const fetchStudents = async () => {
      setLoading(true);
      setError(null);
      try {
        type SchoolMember = { user_id: string; role: string; full_name: string | null; email: string | null; avatar_url: string | null };
        const { data: members, error: rpcError } = await (supabase as any)
          .rpc("get_school_members", { p_school_id: school.schoolId });

        if (rpcError) {
          setError("Failed to load student roster. Please try again.");
          return;
        }

        const allMembers = (members ?? []) as SchoolMember[];
        const studentMembers = allMembers.filter(m => m.role === "student");

        if (studentMembers.length === 0) { setStudents([]); return; }

        const studentIdArr = studentMembers.map(m => m.user_id);

        const spRes = await supabase
          .from("student_profiles")
          .select("user_id, gpa, graduation_year")
          .in("user_id", studentIdArr);

        const todayStr    = new Date().toISOString().split("T")[0];
        const in30DaysStr = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

        const [essaysRes, recsRes, appsRes, assignmentsRes] = await Promise.all([
          supabase.from("essay_feedback").select("student_id, status").in("student_id", studentIdArr),
          supabase.from("recommendation_requests").select("student_id, status").in("student_id", studentIdArr),
          supabase.from("applications").select("student_id, deadline_date, status").in("student_id", studentIdArr),
          supabase.from("student_counselor_assignments").select("student_id, counselor_id").in("student_id", studentIdArr),
        ]);

        const allEssays = essaysRes.data ?? [];
        const allRecs   = recsRes.data   ?? [];
        const allApps   = appsRes.data   ?? [];
        const assignments = assignmentsRes.data ?? [];

        // Fetch counselor names for the assigned counselors
        const counselorIds = [...new Set(assignments.map(a => a.counselor_id))];
        const counselorNameMap = new Map<string, string>();
        if (counselorIds.length > 0) {
          const { data: cProfiles } = await supabase
            .from("profiles")
            .select("user_id, full_name")
            .in("user_id", counselorIds);
          cProfiles?.forEach(cp => { if (cp.full_name) counselorNameMap.set(cp.user_id, cp.full_name); });
        }

        const studentCounselorMap = new Map<string, string>();
        for (const a of assignments) {
          const name = counselorNameMap.get(a.counselor_id);
          if (name) studentCounselorMap.set(a.student_id, name);
        }

        // Urgent student set
        const urgentStudentIds = new Set(
          allApps
            .filter(a => a.status !== "submitted" && a.deadline_date >= todayStr && a.deadline_date <= in30DaysStr)
            .map(a => a.student_id)
        );

        // Per-student completion
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

        const spMap = new Map(spRes.data?.map(sp => [sp.user_id, sp]) ?? []);

        const rows: StudentRow[] = studentMembers.map(p => {
            const essays = essayMap.get(p.user_id) ?? { total: 0, done: 0 };
            const recs   = recMap.get(p.user_id)   ?? { total: 0, done: 0 };
            const completionScore = computeCompletion(essays.done, essays.total, recs.done, recs.total, criteria);
            const hasUrgent = urgentStudentIds.has(p.user_id);
            const risk = classifyRisk(completionScore, hasUrgent, criteria);

            return {
              user_id: p.user_id,
              full_name: p.full_name,
              email: p.email,
              avatar_url: p.avatar_url,
              graduation_year: spMap.get(p.user_id)?.graduation_year ?? null,
              gpa: spMap.get(p.user_id)?.gpa ?? null,
              completionScore,
              isAtRisk: risk === "at-risk",
              needsAttention: risk === "needs-attention",
              counselorName: studentCounselorMap.get(p.user_id) ?? null,
            };
          });

        // Sort: at-risk first, then needs attention, then by name
        rows.sort((a, b) => {
          if (a.isAtRisk !== b.isAtRisk) return a.isAtRisk ? -1 : 1;
          if (a.needsAttention !== b.needsAttention) return a.needsAttention ? -1 : 1;
          return (a.full_name ?? "").localeCompare(b.full_name ?? "");
        });

        setStudents(rows);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [school?.schoolId, criteria, retryKey]);

  const filtered = students.filter(s =>
    (s.full_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (s.email ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Student Roster</h1>
        <p className="text-muted-foreground mt-1">
          {loadingSchool || loading ? "Loading…" : `${students.length} students at ${school?.schoolName}`}
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search students…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10"
        />
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
            <div className="space-y-0 divide-y divide-border">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex items-center gap-4 p-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-56" />
                  </div>
                  <Skeleton className="h-6 w-24" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Users className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No students found</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map(s => (
                <div key={s.user_id} className={`flex items-center gap-4 p-4 flex-wrap ${s.isAtRisk ? "bg-destructive/5" : s.needsAttention ? "bg-amber-500/5" : ""}`}>
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src={s.avatar_url ?? undefined} />
                    <AvatarFallback>
                      {(s.full_name ?? "?").split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-foreground truncate">{s.full_name ?? "—"}</p>
                      {s.isAtRisk && (
                        <Badge variant="destructive" className="text-xs gap-1 shrink-0">
                          <ShieldAlert className="h-3 w-3" />
                          At Risk
                        </Badge>
                      )}
                      {s.needsAttention && (
                        <Badge className="text-xs bg-amber-100 text-amber-700 border-amber-300 shrink-0">
                          Needs Attention
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {s.email ?? "—"}
                      {s.counselorName && <span className="ml-2 text-xs">· {s.counselorName}</span>}
                    </p>
                  </div>

                  {/* Completion bar */}
                  <div className="flex flex-col gap-1 w-28 shrink-0">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Progress</span>
                      <span className="font-medium text-foreground">{s.completionScore}%</span>
                    </div>
                    <Progress
                      value={s.completionScore}
                      className={`h-2 ${s.isAtRisk ? "[&>div]:bg-destructive" : s.needsAttention ? "[&>div]:bg-amber-500" : "[&>div]:bg-green-500"}`}
                    />
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {s.graduation_year && (
                      <Badge variant="outline" className="text-xs">Class of {s.graduation_year}</Badge>
                    )}
                    {s.gpa != null && (
                      <Badge variant="secondary" className="text-xs">GPA {s.gpa.toFixed(2)}</Badge>
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

export default PrincipalStudents;
