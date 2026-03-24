import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { usePrincipalSchool } from "@/hooks/usePrincipalSchool";
import { Search, Users } from "lucide-react";

interface StudentRow {
  user_id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  graduation_year: number | null;
  gpa: number | null;
}

const PrincipalStudents = () => {
  const { data: school, isLoading: loadingSchool } = usePrincipalSchool();
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!school?.schoolId) return;

    const fetchStudents = async () => {
      setLoading(true);
      try {
        // Get all profiles at this school
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name, email, avatar_url")
          .eq("school_id", school.schoolId);

        if (!profiles || profiles.length === 0) { setStudents([]); return; }

        const allIds = profiles.map(p => p.user_id);

        // Filter to students only
        const { data: roles } = await supabase
          .from("user_roles")
          .select("user_id")
          .eq("role", "student")
          .in("user_id", allIds);

        const studentIds = new Set(roles?.map(r => r.user_id) ?? []);

        // Get student_profiles for GPA / graduation year
        const { data: studentProfiles } = await supabase
          .from("student_profiles")
          .select("user_id, gpa, graduation_year")
          .in("user_id", [...studentIds]);

        const spMap = new Map(studentProfiles?.map(sp => [sp.user_id, sp]) ?? []);

        const rows: StudentRow[] = profiles
          .filter(p => studentIds.has(p.user_id))
          .map(p => ({
            user_id: p.user_id,
            full_name: p.full_name,
            email: p.email,
            avatar_url: p.avatar_url,
            graduation_year: spMap.get(p.user_id)?.graduation_year ?? null,
            gpa: spMap.get(p.user_id)?.gpa ?? null,
          }));

        setStudents(rows);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [school?.schoolId]);

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
                <div key={s.user_id} className="flex items-center gap-4 p-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={s.avatar_url ?? undefined} />
                    <AvatarFallback>
                      {(s.full_name ?? "?").split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{s.full_name ?? "—"}</p>
                    <p className="text-sm text-muted-foreground truncate">{s.email ?? "—"}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {s.graduation_year && (
                      <Badge variant="outline" className="text-xs">Class of {s.graduation_year}</Badge>
                    )}
                    {s.gpa && (
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
