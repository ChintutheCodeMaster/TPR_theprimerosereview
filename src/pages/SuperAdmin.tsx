import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search, LogOut, RefreshCw, Download,
  Users, Building2, GraduationCap, UserCircle, Shield,
} from "lucide-react";
import primroseLogo from "@/assets/primrose-logo.png";

type PlatformUser = {
  user_id: string;
  email: string | null;
  full_name: string | null;
  role: string;
  school_name: string | null;
  joined_at: string | null;
};

const ROLE_TABS = ["all", "student", "counselor", "principal", "parent", "admin"] as const;
type RoleTab = (typeof ROLE_TABS)[number];

const ROLE_META: Record<string, { label: string; color: string }> = {
  student:   { label: "Student",   color: "bg-blue-100 text-blue-700 border-blue-200" },
  counselor: { label: "Counselor", color: "bg-purple-100 text-purple-700 border-purple-200" },
  principal: { label: "Principal", color: "bg-green-100 text-green-700 border-green-200" },
  parent:    { label: "Parent",    color: "bg-orange-100 text-orange-700 border-orange-200" },
  admin:     { label: "Admin",     color: "bg-red-100 text-red-700 border-red-200" },
  "no role": { label: "No Role",   color: "bg-gray-100 text-gray-500 border-gray-200" },
};

const fmt = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—";

const SuperAdmin = () => {
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<RoleTab>("all");
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const fetchUsers = async () => {
    setLoading(true);
    const { data } = await (supabase as any).rpc("get_all_platform_users");
    setUsers((data ?? []) as PlatformUser[]);
    setLastRefreshed(new Date());
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  // ── Stats ────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const schools = new Set(users.map(u => u.school_name).filter(Boolean)).size;
    const byRole = (role: string) => users.filter(u => u.role === role).length;
    return {
      schools,
      students:   byRole("student"),
      counselors: byRole("counselor"),
      principals: byRole("principal"),
      parents:    byRole("parent"),
      total:      users.length,
    };
  }, [users]);

  // ── School breakdown ─────────────────────────────────────────
  const schoolBreakdown = useMemo(() => {
    const map = new Map<string, { students: number; counselors: number; principals: number; parents: number }>();
    for (const u of users) {
      const key = u.school_name ?? "No School";
      if (!map.has(key)) map.set(key, { students: 0, counselors: 0, principals: 0, parents: 0 });
      const entry = map.get(key)!;
      if (u.role === "student")   entry.students++;
      if (u.role === "counselor") entry.counselors++;
      if (u.role === "principal") entry.principals++;
      if (u.role === "parent")    entry.parents++;
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [users]);

  // ── Filtered users ───────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter(u => {
      const matchesRole = activeTab === "all" || u.role === activeTab;
      const matchesSearch =
        (u.full_name ?? "").toLowerCase().includes(q) ||
        (u.email ?? "").toLowerCase().includes(q) ||
        (u.school_name ?? "").toLowerCase().includes(q);
      return matchesRole && matchesSearch;
    });
  }, [users, search, activeTab]);

  // ── CSV export ───────────────────────────────────────────────
  const exportCSV = () => {
    const headers = ["Full Name", "Email", "Role", "School", "Joined"];
    const rows = filtered.map(u => [
      u.full_name ?? "",
      u.email ?? "",
      u.role,
      u.school_name ?? "",
      fmt(u.joined_at),
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `primrose-users-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth";
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Top bar ── */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <img src={primroseLogo} alt="Primrose" className="h-10 w-auto" />
          <div>
            <h1 className="text-lg font-bold text-gray-900">Super Admin</h1>
            <p className="text-xs text-gray-400">
              Last refreshed: {lastRefreshed.toLocaleTimeString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchUsers} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: "Total Schools",   value: stats.schools,   icon: Building2,    color: "text-gray-600",   bg: "bg-gray-100" },
            { label: "Total Users",     value: stats.total,     icon: Users,        color: "text-gray-700",   bg: "bg-gray-100" },
            { label: "Students",        value: stats.students,   icon: Users,        color: "text-blue-600",   bg: "bg-blue-50" },
            { label: "Counselors",      value: stats.counselors, icon: GraduationCap,color: "text-purple-600", bg: "bg-purple-50" },
            { label: "Principals",      value: stats.principals, icon: Building2,    color: "text-green-600",  bg: "bg-green-50" },
            { label: "Parents",         value: stats.parents,    icon: UserCircle,   color: "text-orange-600", bg: "bg-orange-50" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className={`inline-flex p-2 rounded-lg ${bg} mb-3`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? <Skeleton className="h-7 w-10" /> : value}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* ── Schools breakdown ── */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-gray-500" />
              Schools
            </h2>
          </div>
          {loading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : schoolBreakdown.length === 0 ? (
            <p className="p-6 text-sm text-gray-400">No schools found.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-6 py-3 text-left">School Name</th>
                  <th className="px-6 py-3 text-center">Students</th>
                  <th className="px-6 py-3 text-center">Counselors</th>
                  <th className="px-6 py-3 text-center">Principals</th>
                  <th className="px-6 py-3 text-center">Parents</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {schoolBreakdown.map(([school, counts]) => (
                  <tr key={school} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 font-medium text-gray-900">{school}</td>
                    <td className="px-6 py-3 text-center text-blue-700 font-medium">{counts.students}</td>
                    <td className="px-6 py-3 text-center text-purple-700 font-medium">{counts.counselors}</td>
                    <td className="px-6 py-3 text-center text-green-700 font-medium">{counts.principals}</td>
                    <td className="px-6 py-3 text-center text-orange-700 font-medium">{counts.parents}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── All users table ── */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Shield className="h-4 w-4 text-gray-500" />
              All Users
              <span className="text-sm font-normal text-gray-400">({filtered.length})</span>
            </h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search name, email, school…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9 w-64 h-8 text-sm"
                />
              </div>
              <Button variant="outline" size="sm" onClick={exportCSV} disabled={filtered.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>

          {/* Role tabs */}
          <div className="px-6 py-2 border-b border-gray-100 flex gap-1 overflow-x-auto">
            {ROLE_TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? "bg-gray-900 text-white"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {tab === "all" ? `All (${users.length})` : `${tab}s (${users.filter(u => u.role === tab).length})`}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-64" />
                  </div>
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                  <tr>
                    <th className="px-6 py-3 text-left">User</th>
                    <th className="px-6 py-3 text-left">Email</th>
                    <th className="px-6 py-3 text-left">Role</th>
                    <th className="px-6 py-3 text-left">School</th>
                    <th className="px-6 py-3 text-left">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map(u => {
                    const meta = ROLE_META[u.role] ?? ROLE_META["no role"];
                    const initials = (u.full_name ?? u.email ?? "?")
                      .split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
                    return (
                      <tr key={u.user_id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 shrink-0">
                              <AvatarFallback className="text-xs bg-gray-100 text-gray-600 font-semibold">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-gray-900 truncate max-w-[180px]">
                              {u.full_name ?? <span className="text-gray-400 italic">No name</span>}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-3 font-mono text-xs text-blue-600 max-w-[220px] truncate">
                          {u.email ?? "—"}
                        </td>
                        <td className="px-6 py-3">
                          <Badge variant="outline" className={`text-xs capitalize ${meta.color}`}>
                            {meta.label}
                          </Badge>
                        </td>
                        <td className="px-6 py-3 text-gray-600 max-w-[200px] truncate">
                          {u.school_name ?? <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-6 py-3 text-gray-500 whitespace-nowrap">
                          {fmt(u.joined_at)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuperAdmin;