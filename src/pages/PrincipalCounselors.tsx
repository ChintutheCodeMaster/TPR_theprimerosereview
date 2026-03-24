import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { usePrincipalSchool } from "@/hooks/usePrincipalSchool";
import { Building2 } from "lucide-react";

interface CounselorRow {
  user_id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  studentCount: number;
}

const PrincipalCounselors = () => {
  const { data: school, isLoading: loadingSchool } = usePrincipalSchool();
  const [counselors, setCounselors] = useState<CounselorRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!school?.schoolId) return;

    const fetchCounselors = async () => {
      setLoading(true);
      try {
        // All profiles at this school
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name, email, avatar_url")
          .eq("school_id", school.schoolId);

        if (!profiles || profiles.length === 0) { setCounselors([]); return; }

        const allIds = profiles.map(p => p.user_id);

        // Filter to counselors only
        const { data: roles } = await supabase
          .from("user_roles")
          .select("user_id")
          .eq("role", "counselor")
          .in("user_id", allIds);

        const counselorIds = roles?.map(r => r.user_id) ?? [];
        if (counselorIds.length === 0) { setCounselors([]); return; }

        // Count students per counselor
        const { data: assignments } = await supabase
          .from("student_counselor_assignments")
          .select("counselor_id")
          .in("counselor_id", counselorIds);

        const countMap = new Map<string, number>();
        assignments?.forEach(a => {
          countMap.set(a.counselor_id, (countMap.get(a.counselor_id) ?? 0) + 1);
        });

        const rows: CounselorRow[] = profiles
          .filter(p => counselorIds.includes(p.user_id))
          .map(p => ({
            user_id: p.user_id,
            full_name: p.full_name,
            email: p.email,
            avatar_url: p.avatar_url,
            studentCount: countMap.get(p.user_id) ?? 0,
          }));

        setCounselors(rows);
      } finally {
        setLoading(false);
      }
    };

    fetchCounselors();
  }, [school?.schoolId]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Counselor Roster</h1>
        <p className="text-muted-foreground mt-1">
          {loadingSchool || loading ? "Loading…" : `${counselors.length} counselors at ${school?.schoolName}`}
        </p>
      </div>

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
                <div key={c.user_id} className="flex items-center gap-4 p-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={c.avatar_url ?? undefined} />
                    <AvatarFallback>
                      {(c.full_name ?? "?").split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{c.full_name ?? "—"}</p>
                    <p className="text-sm text-muted-foreground truncate">{c.email ?? "—"}</p>
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    {c.studentCount} {c.studentCount === 1 ? "student" : "students"}
                  </Badge>
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
