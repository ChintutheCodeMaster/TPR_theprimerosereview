import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAtRiskCriteria } from "@/hooks/useAtRiskCriteria";
import { computeCompletion, classifyRisk } from "@/lib/atRiskUtils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts";
import {
  Users,
  FileText,
  Calendar,
  Download,
  Share,
  AlertTriangle,
  Target,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Lightbulb,
  GraduationCap,
  School,
  Loader2,
} from "lucide-react";
import { PageShell, PageHeader, HairlineCard, BlurOrb } from "@/components/primrose-night";

const PN_CHART_COLORS = [
  "oklch(0.78 0.07 155)", // sage
  "oklch(0.80 0.10 85)",  // gold
  "oklch(0.72 0.10 15)",  // pink
  "rgba(255,255,255,0.5)",
  "oklch(0.78 0.07 155 / 0.7)",
  "oklch(0.80 0.10 85 / 0.7)",
  "oklch(0.72 0.10 15 / 0.7)",
  "rgba(255,255,255,0.35)",
];

const chartTooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "8px",
  color: "hsl(var(--foreground))",
};

const sectionVariants = {
  hidden: { opacity: 0, y: 10, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: [0.2, 0.6, 0.2, 1] as const },
  },
};

interface StudentReport {
  id: string;
  name: string;
  avatar: string | null;
  overallProgress: number;
  essaysCompleted: number;
  totalEssays: number;
  applicationsSubmitted: number;
  totalApplications: number;
  recsReceived: number;
  totalRecs: number;
  riskLevel: "low" | "medium" | "high";
}

const riskPillClass = (level: string) => {
  switch (level) {
    case "high":   return "bg-[color:var(--pn-pink)]/15 text-[color:var(--pn-pink)] hairline";
    case "medium": return "bg-[color:var(--pn-gold)]/15 text-[color:var(--pn-gold)] hairline";
    case "low":    return "bg-[color:var(--pn-sage)]/15 text-[color:var(--pn-sage)] hairline";
    default:       return "bg-white/[0.03] text-muted-foreground hairline";
  }
};

const progressTone = (pct: number) => {
  if (pct < 50) return "var(--pn-pink)";
  if (pct < 80) return "var(--pn-gold)";
  return "var(--pn-sage)";
};

const progressToneText = (pct: number) => {
  if (pct < 50) return "text-[color:var(--pn-pink)]";
  if (pct < 80) return "text-[color:var(--pn-gold)]";
  return "text-[color:var(--pn-sage)]";
};

const AnimatedBar = ({ pct, tone, className = "w-full" }: { pct: number; tone: string; className?: string }) => (
  <div className={`h-1.5 rounded-full bg-white/[0.05] overflow-hidden ${className}`}>
    <motion.div
      className="h-full"
      style={{ background: tone }}
      initial={{ width: 0 }}
      animate={{ width: `${pct}%` }}
      transition={{ duration: 0.9, ease: [0.2, 0.6, 0.2, 1], delay: 0.15 }}
    />
  </div>
);

const ViewReports = () => {
  const [selectedStudent, setSelectedStudent] = useState("all");
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();
  const { criteria } = useAtRiskCriteria();

  const [loading, setLoading] = useState(true);
  const [rawStudents, setRawStudents] = useState<any[]>([]);
  const [rawApplications, setRawApplications] = useState<any[]>([]);
  const [rawEssays, setRawEssays] = useState<any[]>([]);
  const [rawRecs, setRawRecs] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: assignments } = await supabase
        .from("student_counselor_assignments")
        .select("student_id")
        .eq("counselor_id", user.id);

      const studentIds = assignments?.map((a) => a.student_id) ?? [];
      if (studentIds.length === 0) { setLoading(false); return; }

      const [profileRes, appRes, essayRes, recRes] = await Promise.all([
        supabase.from("profiles").select("user_id, full_name, avatar_url").in("user_id", studentIds),
        supabase.from("applications")
          .select("id, student_id, school_name, deadline_date, status, required_essays, completed_essays, recommendations_requested, recommendations_submitted")
          .in("student_id", studentIds),
        supabase.from("essay_feedback").select("id, student_id, status, created_at").in("student_id", studentIds),
        supabase.from("recommendation_requests").select("id, student_id, status").in("student_id", studentIds),
      ]);

      setRawStudents(profileRes.data ?? []);
      setRawApplications(appRes.data ?? []);
      setRawEssays(essayRes.data ?? []);
      setRawRecs(recRes.data ?? []);
      setLoading(false);
    };
    load();
  }, []);

  const studentReports = useMemo<StudentReport[]>(() => {
    const now = new Date();
    const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    return rawStudents.map((student) => {
      const essays = rawEssays.filter((e) => e.student_id === student.user_id);
      const recs   = rawRecs.filter((r) => r.student_id === student.user_id);
      const apps   = rawApplications.filter((a) => a.student_id === student.user_id);

      const totalEssays     = essays.length;
      const essaysCompleted = essays.filter((e) => ["sent", "read", "approved"].includes(e.status)).length;
      const totalRecs     = recs.length;
      const recsCompleted = recs.filter((r) => ["sent", "completed"].includes(r.status)).length;

      const overallProgress = computeCompletion(essaysCompleted, totalEssays, recsCompleted, totalRecs, criteria);

      const hasNearDeadline = apps.some((a) => {
        const d = new Date(a.deadline_date);
        return a.status !== "submitted" && d >= now && d <= in30Days;
      });

      const risk = classifyRisk(overallProgress, hasNearDeadline, criteria);
      const riskLevel: "low" | "medium" | "high" =
        risk === "on-track" ? "low" : risk === "at-risk" ? "high" : "medium";

      const applicationsSubmitted = apps.filter((a) => a.status === "submitted").length;
      const totalApplications     = apps.length;
      const recsReceived = apps.reduce((sum, a) => sum + (a.recommendations_submitted ?? 0), 0);
      const totalRecsFromApps = apps.reduce((sum, a) => sum + (a.recommendations_requested ?? 0), 0);

      return {
        id: student.user_id,
        name: student.full_name ?? "Unknown",
        avatar: student.avatar_url,
        overallProgress,
        essaysCompleted,
        totalEssays: Math.max(totalEssays, 1),
        applicationsSubmitted,
        totalApplications: Math.max(totalApplications, 1),
        recsReceived,
        totalRecs: Math.max(totalRecsFromApps, 1),
        riskLevel,
      };
    });
  }, [rawStudents, rawEssays, rawRecs, rawApplications, criteria]);

  const metrics = useMemo(() => {
    const submittedEssays = rawEssays.filter((e) =>
      ["pending", "sent", "read"].includes(e.status)
    ).length;
    const upcomingDeadlines = rawApplications.filter((a) => {
      const days = Math.ceil((new Date(a.deadline_date).getTime() - Date.now()) / 86400000);
      return days >= 0 && days <= 30 && a.status !== "submitted";
    }).length;
    const avgProgress = studentReports.length > 0
      ? Math.round(studentReports.reduce((s, r) => s + r.overallProgress, 0) / studentReports.length)
      : 0;
    const atRisk = studentReports.filter((s) => s.riskLevel !== "low").length;
    return { totalStudents: rawStudents.length, submittedEssays, upcomingDeadlines, avgProgress, atRisk };
  }, [rawStudents, rawEssays, rawApplications, studentReports]);

  const applicationDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    rawApplications.forEach((a) => {
      counts[a.school_name] = (counts[a.school_name] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([school, count], i) => ({ school, applications: count, color: PN_CHART_COLORS[i % PN_CHART_COLORS.length] }))
      .sort((a, b) => b.applications - a.applications)
      .slice(0, 8);
  }, [rawApplications]);

  const deadlinesByWeek = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return Array.from({ length: 6 }, (_, i) => {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() + i * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      const weekApps = rawApplications.filter((a) => {
        const d = new Date(a.deadline_date);
        return d >= weekStart && d < weekEnd && a.status !== "submitted";
      });
      return {
        week: weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        count: weekApps.length,
        urgent: weekApps.filter((a) => {
          const days = Math.ceil((new Date(a.deadline_date).getTime() - Date.now()) / 86400000);
          return days <= 3;
        }).length,
      };
    });
  }, [rawApplications]);

  const submissionTrend = useMemo(() => {
    const now = new Date();
    now.setHours(23, 59, 59, 999);
    return Array.from({ length: 6 }, (_, i) => {
      const weekEnd = new Date(now);
      weekEnd.setDate(weekEnd.getDate() - (5 - i) * 7);
      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekStart.getDate() - 7);
      const count = rawEssays.filter((e) => {
        const d = new Date(e.created_at);
        return d >= weekStart && d < weekEnd;
      }).length;
      return { week: `Week ${i + 1}`, submissions: count };
    });
  }, [rawEssays]);

  const aggregateStats = useMemo(() => {
    const submitted  = rawApplications.filter((a) => a.status === "submitted").length;
    const inProgress = rawApplications.filter((a) => a.status === "in_progress").length;
    const other      = rawApplications.length - submitted - inProgress;
    const recsCompleted = rawRecs.filter((r) => r.status === "completed").length;
    const recsPending   = rawRecs.filter((r) => ["pending", "in_progress"].includes(r.status)).length;
    const essayPending  = rawEssays.filter((e) => e.status === "pending").length;
    const essaySent     = rawEssays.filter((e) => e.status === "sent").length;
    const essayRead     = rawEssays.filter((e) => e.status === "read").length;
    return {
      apps: { submitted, inProgress, other },
      recs: { completed: recsCompleted, pending: recsPending },
      essays: { pending: essayPending, sent: essaySent, read: essayRead },
    };
  }, [rawApplications, rawRecs, rawEssays]);

  const keyInsights = useMemo(() => {
    const insights: string[] = [];
    const highRisk = studentReports.filter((s) => s.riskLevel === "high").length;
    const medRisk  = studentReports.filter((s) => s.riskLevel === "medium").length;
    const pendingRecs = rawRecs.filter((r) => ["pending", "in_progress"].includes(r.status)).length;
    const urgentDeadlines = rawApplications.filter((a) => {
      const days = Math.ceil((new Date(a.deadline_date).getTime() - Date.now()) / 86400000);
      return days >= 0 && days <= 7 && a.status !== "submitted";
    }).length;
    const pendingEssays = rawEssays.filter((e) => e.status === "pending").length;
    const top = applicationDistribution[0];

    if (highRisk > 0)
      insights.push(`${highRisk} student${highRisk > 1 ? "s are" : " is"} at high risk — schedule urgent check-ins.`);
    if (urgentDeadlines > 0)
      insights.push(`${urgentDeadlines} application${urgentDeadlines > 1 ? "s have" : " has"} a deadline within 7 days.`);
    if (pendingEssays > 0)
      insights.push(`${pendingEssays} essay${pendingEssays > 1 ? "s are" : " is"} awaiting your review and feedback.`);
    if (pendingRecs > 0)
      insights.push(`${pendingRecs} recommendation letter${pendingRecs > 1 ? "s are" : " is"} still pending from teachers.`);
    if (medRisk > 0 && insights.length < 4)
      insights.push(`${medRisk} student${medRisk > 1 ? "s are" : " is"} at medium risk — follow up on their progress.`);
    if (top && insights.length < 4)
      insights.push(`${top.school} is the most applied school with ${top.applications} student${top.applications > 1 ? "s" : ""}.`);
    if (insights.length === 0)
      insights.push("All students are on track — no urgent items detected.");

    return insights.slice(0, 4);
  }, [studentReports, rawRecs, rawApplications, rawEssays, applicationDistribution]);

  const handleExport = (format: string, type: string) => {
    toast({ title: `Exporting ${type}`, description: `Your ${type} report is being prepared in ${format.toUpperCase()} format.` });
  };

  const handleShareReport = (studentName: string) => {
    toast({ title: "Report Shared", description: `Parent summary for ${studentName} has been sent via email.` });
  };

  const displayedStudents = selectedStudent === "all"
    ? studentReports
    : studentReports.filter((s) => s.id === selectedStudent);

  const atRiskStudents = studentReports.filter((s) => s.riskLevel !== "low");

  if (loading) {
    return (
      <PageShell>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageShell>
    );
  }

  const overviewTiles: Array<{ icon: any; label: string; value: number | string; tone: string }> = [
    { icon: Users,         label: "Students",           value: metrics.totalStudents,     tone: "var(--pn-sage)" },
    { icon: FileText,      label: "Essays submitted",   value: metrics.submittedEssays,   tone: "var(--pn-sage)" },
    { icon: AlertTriangle, label: "At risk",            value: metrics.atRisk,            tone: "var(--pn-pink)" },
    { icon: Calendar,      label: "Upcoming deadlines", value: metrics.upcomingDeadlines, tone: "var(--pn-gold)" },
    { icon: Target,        label: "Avg completion",     value: `${metrics.avgProgress}%`, tone: "var(--pn-sage)" },
  ];

  return (
    <PageShell>
      <BlurOrb tone="gold" className="top-[-100px] right-[-100px] w-[500px] h-[500px]" />

      <PageHeader
        eyebrow="Reports"
        title={<>The numbers, in your hand.</>}
        subtitle={<>Analytics and insight — the whole roster, one view.</>}
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="bg-transparent hairline hover:bg-white/[0.03] text-foreground shadow-none"
              onClick={() => handleExport("pdf", "Full Report")}
            >
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
            <Button
              variant="outline"
              className="bg-transparent hairline hover:bg-white/[0.03] text-foreground shadow-none"
              onClick={() => handleExport("excel", "Data Export")}
            >
              <Download className="h-4 w-4 mr-2" />
              Excel
            </Button>
          </div>
        }
      />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
        className="space-y-6"
      >
        {/* Overview Metrics */}
        <motion.div variants={sectionVariants} className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {overviewTiles.map(({ icon: Icon, label, value, tone }) => (
            <HairlineCard key={label}>
              <div className="flex items-center gap-2 mb-2">
                <div className="hairline rounded-lg p-1.5" style={{ background: `${tone}20` }}>
                  <Icon className="h-4 w-4" style={{ color: tone }} />
                </div>
                <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
              </div>
              <div className="num-display text-2xl text-foreground">{value}</div>
            </HairlineCard>
          ))}
        </motion.div>

        {/* Key Insights */}
        <motion.div variants={sectionVariants}>
          <HairlineCard variant="hero">
            <h3 className="font-serif text-2xl text-foreground leading-tight flex items-center gap-2 mb-4">
              <Lightbulb className="h-5 w-5 text-[color:var(--pn-gold)]" />
              What stands out.
            </h3>
            {keyInsights.length === 0 ? (
              <p className="text-sm font-serif italic text-muted-foreground">Nothing to report yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {keyInsights.map((insight, i) => (
                  <div key={i} className="p-3 hairline rounded-lg bg-white/[0.02]">
                    <p className="text-sm text-foreground">{insight}</p>
                  </div>
                ))}
              </div>
            )}
          </HairlineCard>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <motion.div variants={sectionVariants}>
            <TabsList className="grid w-full grid-cols-4 bg-white/[0.02] hairline p-1 h-auto">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-white/[0.06] data-[state=active]:text-foreground data-[state=active]:shadow-none text-muted-foreground"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="individual"
                className="data-[state=active]:bg-white/[0.06] data-[state=active]:text-foreground data-[state=active]:shadow-none text-muted-foreground"
              >
                By student
              </TabsTrigger>
              <TabsTrigger
                value="aggregate"
                className="data-[state=active]:bg-white/[0.06] data-[state=active]:text-foreground data-[state=active]:shadow-none text-muted-foreground"
              >
                Aggregate
              </TabsTrigger>
              <TabsTrigger
                value="risk"
                className="data-[state=active]:bg-white/[0.06] data-[state=active]:text-foreground data-[state=active]:shadow-none text-muted-foreground"
              >
                Risk
              </TabsTrigger>
            </TabsList>
          </motion.div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <HairlineCard>
                <h3 className="font-serif text-xl text-foreground flex items-center gap-2 mb-4">
                  <LineChartIcon className="h-4 w-4 text-[color:var(--pn-sage)]" />
                  Essay submissions, last 6 weeks
                </h3>
                {rawEssays.length === 0 ? (
                  <p className="text-sm font-serif italic text-muted-foreground text-center py-16">
                    No essays submitted yet.
                  </p>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={submissionTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                      <XAxis dataKey="week" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                      <Tooltip contentStyle={chartTooltipStyle} />
                      <Area
                        type="monotone"
                        dataKey="submissions"
                        stroke="oklch(0.78 0.07 155)"
                        fill="oklch(0.78 0.07 155)"
                        fillOpacity={0.25}
                        name="Submissions"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </HairlineCard>

              <HairlineCard>
                <h3 className="font-serif text-xl text-foreground flex items-center gap-2 mb-4">
                  <PieChartIcon className="h-4 w-4 text-[color:var(--pn-gold)]" />
                  Popular schools
                </h3>
                {applicationDistribution.length === 0 ? (
                  <p className="text-sm font-serif italic text-muted-foreground text-center py-16">
                    No applications yet.
                  </p>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={applicationDistribution.slice(0, 6)}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="applications"
                        label={({ school, applications }) => `${school}: ${applications}`}
                        stroke="rgba(255,255,255,0.08)"
                      >
                        {applicationDistribution.slice(0, 6).map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={chartTooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </HairlineCard>
            </div>

            <HairlineCard>
              <h3 className="font-serif text-xl text-foreground flex items-center gap-2 mb-4">
                <BarChart3 className="h-4 w-4 text-[color:var(--pn-pink)]" />
                Deadlines by week — next 6 weeks
              </h3>
              {rawApplications.length === 0 ? (
                <p className="text-sm font-serif italic text-muted-foreground text-center py-16">
                  No applications yet.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={deadlinesByWeek}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="week" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Bar dataKey="count" fill="oklch(0.78 0.07 155)" name="Total" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="urgent" fill="oklch(0.72 0.10 15)" name="Urgent (≤3 days)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </HairlineCard>
          </TabsContent>

          {/* By Student Tab */}
          <TabsContent value="individual" className="space-y-4">
            <div className="flex items-center gap-4">
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger className="w-64 bg-white/[0.02] hairline">
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent className="bg-pn-card hairline">
                  <SelectItem value="all">All students</SelectItem>
                  {studentReports.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {displayedStudents.length === 0 ? (
              <HairlineCard variant="sage" className="text-center py-12">
                <p className="font-serif italic text-muted-foreground">No students on your roster yet.</p>
              </HairlineCard>
            ) : (
              <div className="grid gap-4">
                {displayedStudents.map((student) => (
                  <HairlineCard key={student.id}>
                    <div className="flex items-start justify-between mb-4 gap-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16 hairline">
                          <AvatarImage src={student.avatar ?? undefined} alt={student.name} />
                          <AvatarFallback className="text-lg bg-white/[0.04] text-foreground">
                            {student.name.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-serif text-xl text-foreground">{student.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Progress</span>
                            <AnimatedBar pct={student.overallProgress} tone={progressTone(student.overallProgress)} className="w-32" />
                            <span className={`num-display ${progressToneText(student.overallProgress)}`}>{student.overallProgress}%</span>
                          </div>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs mt-2 ${riskPillClass(student.riskLevel)}`}>
                            <AlertTriangle className="h-3 w-3" />
                            {student.riskLevel.toUpperCase()} risk
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-transparent hairline hover:bg-white/[0.03] text-foreground shadow-none"
                          onClick={() => handleShareReport(student.name)}
                        >
                          <Share className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-transparent hairline hover:bg-white/[0.03] text-foreground shadow-none"
                          onClick={() => handleExport("pdf", `${student.name} Report`)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="p-4 hairline rounded-lg bg-white/[0.02]">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="h-4 w-4 text-[color:var(--pn-gold)]" />
                          <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Essays</span>
                        </div>
                        <div className="num-display text-lg text-foreground mb-2">
                          {student.essaysCompleted}/{student.totalEssays}
                        </div>
                        <AnimatedBar pct={(student.essaysCompleted / student.totalEssays) * 100} tone="var(--pn-gold)" />
                      </div>

                      <div className="p-4 hairline rounded-lg bg-white/[0.02]">
                        <div className="flex items-center gap-2 mb-2">
                          <School className="h-4 w-4 text-[color:var(--pn-sage)]" />
                          <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Applications</span>
                        </div>
                        <div className="num-display text-lg text-foreground mb-2">
                          {student.applicationsSubmitted}/{student.totalApplications}
                        </div>
                        <AnimatedBar pct={(student.applicationsSubmitted / student.totalApplications) * 100} tone="var(--pn-sage)" />
                      </div>

                      <div className="p-4 hairline rounded-lg bg-white/[0.02]">
                        <div className="flex items-center gap-2 mb-2">
                          <GraduationCap className="h-4 w-4 text-[color:var(--pn-pink)]" />
                          <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Recommendations</span>
                        </div>
                        <div className="num-display text-lg text-foreground mb-2">
                          {student.recsReceived}/{student.totalRecs}
                        </div>
                        <AnimatedBar pct={(student.recsReceived / student.totalRecs) * 100} tone="var(--pn-pink)" />
                      </div>
                    </div>
                  </HairlineCard>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Aggregate Tab */}
          <TabsContent value="aggregate" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <HairlineCard>
                <h3 className="font-serif text-xl text-foreground mb-4">Complete application distribution</h3>
                {applicationDistribution.length === 0 ? (
                  <p className="text-sm font-serif italic text-muted-foreground text-center py-20">No applications yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={applicationDistribution} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis dataKey="school" type="category" width={90} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                      <Tooltip contentStyle={chartTooltipStyle} />
                      <Bar dataKey="applications" fill="oklch(0.78 0.07 155)" name="Applications" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </HairlineCard>

              <HairlineCard>
                <h3 className="font-serif text-xl text-foreground mb-4">Essay submissions over time</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={submissionTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="week" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Line
                      type="monotone"
                      dataKey="submissions"
                      stroke="oklch(0.78 0.07 155)"
                      strokeWidth={3}
                      dot={{ fill: "oklch(0.78 0.07 155)", strokeWidth: 2, r: 4 }}
                      name="Submissions"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </HairlineCard>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <HairlineCard>
                <h4 className="font-serif text-lg text-foreground mb-3">Application status</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Submitted</span>
                    <span className="num-display text-[color:var(--pn-sage)]">{aggregateStats.apps.submitted}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">In progress</span>
                    <span className="num-display text-[color:var(--pn-gold)]">{aggregateStats.apps.inProgress}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Planning</span>
                    <span className="num-display text-muted-foreground">{aggregateStats.apps.other}</span>
                  </div>
                </div>
              </HairlineCard>

              <HairlineCard>
                <h4 className="font-serif text-lg text-foreground mb-3">Essay pipeline</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Awaiting review</span>
                    <span className="num-display text-[color:var(--pn-pink)]">{aggregateStats.essays.pending}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Feedback sent</span>
                    <span className="num-display text-[color:var(--pn-gold)]">{aggregateStats.essays.sent}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Read by student</span>
                    <span className="num-display text-[color:var(--pn-sage)]">{aggregateStats.essays.read}</span>
                  </div>
                </div>
              </HairlineCard>

              <HairlineCard>
                <h4 className="font-serif text-lg text-foreground mb-3">Recommendations</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Completed</span>
                    <span className="num-display text-[color:var(--pn-sage)]">{aggregateStats.recs.completed}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Pending / in progress</span>
                    <span className="num-display text-[color:var(--pn-gold)]">{aggregateStats.recs.pending}</span>
                  </div>
                </div>
              </HairlineCard>
            </div>
          </TabsContent>

          {/* Risk Tab */}
          <TabsContent value="risk" className="space-y-6">
            <HairlineCard variant="pink">
              <h3 className="font-serif text-2xl text-foreground leading-tight flex items-center gap-2 mb-4">
                <AlertTriangle className="h-5 w-5 text-[color:var(--pn-pink)]" />
                Students at risk — <span className="num-display">{atRiskStudents.length}</span>
              </h3>
              {atRiskStudents.length === 0 ? (
                <p className="font-serif italic text-muted-foreground py-4">
                  All students are on track — no one at risk right now.
                </p>
              ) : (
                <div className="space-y-3">
                  {atRiskStudents.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-4 hairline rounded-lg bg-white/[0.02] gap-4">
                      <div className="flex items-center gap-4 min-w-0">
                        <Avatar className="h-12 w-12 hairline">
                          <AvatarImage src={student.avatar ?? undefined} alt={student.name} />
                          <AvatarFallback className="bg-white/[0.04] text-foreground">
                            {student.name.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <h3 className="font-serif text-lg text-foreground">{student.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Progress</span>
                            <AnimatedBar pct={student.overallProgress} tone={progressTone(student.overallProgress)} className="w-24" />
                            <span className={`text-sm num-display ${progressToneText(student.overallProgress)}`}>
                              {student.overallProgress}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${riskPillClass(student.riskLevel)}`}>
                          {student.riskLevel.toUpperCase()} risk
                        </span>
                        <div className="text-xs text-muted-foreground mt-1">
                          <span className="num-display">{student.essaysCompleted}</span>/<span className="num-display">{student.totalEssays}</span> essays · <span className="num-display">{student.applicationsSubmitted}</span>/<span className="num-display">{student.totalApplications}</span> apps
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </HairlineCard>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <HairlineCard>
                <h3 className="font-serif text-xl text-foreground mb-3">Risk breakdown</h3>
                <div className="space-y-2">
                  {[
                    { label: "High risk", count: studentReports.filter(s => s.riskLevel === "high").length, level: "high" },
                    { label: "Medium risk", count: studentReports.filter(s => s.riskLevel === "medium").length, level: "medium" },
                    { label: "On track", count: studentReports.filter(s => s.riskLevel === "low").length, level: "low" },
                  ].map(({ label, count, level }) => (
                    <div key={label} className="flex items-center justify-between p-2 hairline rounded-md">
                      <span className="text-sm text-foreground">{label}</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${riskPillClass(level)}`}>
                        <span className="num-display mr-1">{count}</span> student{count !== 1 ? "s" : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </HairlineCard>

              <HairlineCard>
                <h3 className="font-serif text-xl text-foreground mb-3">Recommended actions</h3>
                <div className="space-y-3">
                  {studentReports.filter(s => s.riskLevel === "high").length > 0 && (
                    <div className="p-3 rounded-lg hairline bg-[color:var(--pn-pink)]/10">
                      <h4 className="font-serif text-[color:var(--pn-pink)] mb-1">Immediate attention</h4>
                      <p className="text-sm text-muted-foreground">
                        Schedule urgent meetings with {studentReports.filter(s => s.riskLevel === "high").map(s => s.name.split(" ")[0]).join(", ")}.
                      </p>
                    </div>
                  )}
                  {aggregateStats.recs.pending > 0 && (
                    <div className="p-3 rounded-lg hairline bg-[color:var(--pn-gold)]/10">
                      <h4 className="font-serif text-[color:var(--pn-gold)] mb-1">Follow up required</h4>
                      <p className="text-sm text-muted-foreground">
                        <span className="num-display">{aggregateStats.recs.pending}</span> recommendation letter{aggregateStats.recs.pending > 1 ? "s are" : " is"} still pending from teachers.
                      </p>
                    </div>
                  )}
                  {aggregateStats.essays.pending > 0 && (
                    <div className="p-3 rounded-lg hairline bg-[color:var(--pn-sage)]/10">
                      <h4 className="font-serif text-[color:var(--pn-sage)] mb-1">Essay reviews pending</h4>
                      <p className="text-sm text-muted-foreground">
                        <span className="num-display">{aggregateStats.essays.pending}</span> essay{aggregateStats.essays.pending > 1 ? "s are" : " is"} waiting for your feedback.
                      </p>
                    </div>
                  )}
                  {studentReports.filter(s => s.riskLevel === "high").length === 0 &&
                   aggregateStats.recs.pending === 0 &&
                   aggregateStats.essays.pending === 0 && (
                    <p className="text-sm font-serif italic text-muted-foreground">
                      You're clear. No actions required right now.
                    </p>
                  )}
                </div>
              </HairlineCard>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </PageShell>
  );
};

export default ViewReports;
