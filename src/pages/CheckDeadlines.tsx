import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAssignedStudents } from "@/hooks/useAssignedStudents";
import { useAtRiskCriteria } from "@/hooks/useAtRiskCriteria";
import { computeCompletion } from "@/lib/atRiskUtils";
import {
  Calendar as CalendarIcon,
  Clock,
  AlertTriangle,
  FileText,
  GraduationCap,
  List,
  Grid3X3,
  ChevronLeft,
  ChevronRight,
  User,
  School,
  Loader2,
} from "lucide-react";
import { PageShell, PageHeader, HairlineCard, BlurOrb } from "@/components/primrose-night";

interface StudentDeadline {
  studentId: string;
  studentName: string;
  progress: number;
  essayCount: number;
  essaysDone: number;
  recCount: number;
  recsDone: number;
}

interface Deadline {
  id: string;
  school: string;
  applicationType: string;
  date: Date;
  daysLeft: number;
  urgency: "overdue" | "critical" | "important" | "upcoming";
  students: StudentDeadline[];
}

const sectionVariants = {
  hidden: { opacity: 0, y: 10, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: [0.2, 0.6, 0.2, 1] as const },
  },
};

const computeUrgency = (daysLeft: number): Deadline["urgency"] => {
  if (daysLeft < 0) return "overdue";
  if (daysLeft <= 7) return "critical";
  if (daysLeft <= 21) return "important";
  return "upcoming";
};

const urgencyPillClass = (urgency: string) => {
  switch (urgency) {
    case "overdue":
    case "critical":
      return "bg-[color:var(--pn-pink)]/15 text-[color:var(--pn-pink)] hairline";
    case "important":
      return "bg-[color:var(--pn-gold)]/15 text-[color:var(--pn-gold)] hairline";
    case "upcoming":
      return "bg-[color:var(--pn-sage)]/15 text-[color:var(--pn-sage)] hairline";
    default:
      return "bg-white/[0.03] text-muted-foreground hairline";
  }
};

const urgencyAccentBorder = (urgency: string) => {
  switch (urgency) {
    case "overdue":
    case "critical":
      return "border-l-[color:var(--pn-pink)]";
    case "important":
      return "border-l-[color:var(--pn-gold)]";
    case "upcoming":
      return "border-l-[color:var(--pn-sage)]";
    default:
      return "border-l-white/[0.08]";
  }
};

const urgencyCellBg = (urgency: string) => {
  switch (urgency) {
    case "overdue":
    case "critical":
      return "bg-[color:var(--pn-pink)]/15 text-[color:var(--pn-pink)]";
    case "important":
      return "bg-[color:var(--pn-gold)]/15 text-[color:var(--pn-gold)]";
    case "upcoming":
      return "bg-[color:var(--pn-sage)]/15 text-[color:var(--pn-sage)]";
    default:
      return "bg-white/[0.05] text-muted-foreground";
  }
};

const progressTone = (pct: number) => {
  if (pct < 50) return "text-[color:var(--pn-pink)]";
  if (pct < 80) return "text-[color:var(--pn-gold)]";
  return "text-[color:var(--pn-sage)]";
};

const AnimatedBar = ({ pct, tone = "var(--pn-sage)", className = "w-24" }: { pct: number; tone?: string; className?: string }) => (
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

const barTone = (pct: number) => {
  if (pct < 50) return "var(--pn-pink)";
  if (pct < 80) return "var(--pn-gold)";
  return "var(--pn-sage)";
};

const formatDate = (date: Date) =>
  date.toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric", year: "numeric",
  });

const CheckDeadlines = () => {
  const [deadlines, setDeadlines]               = useState<Deadline[]>([]);
  const [loading, setLoading]                   = useState(true);
  const [viewMode, setViewMode]                 = useState("list");
  const [selectedDate, setSelectedDate]         = useState(new Date());
  const [selectedDeadline, setSelectedDeadline] = useState<Deadline | null>(null);
  const [urgencyFilter, setUrgencyFilter]       = useState("all");
  const [typeFilter, setTypeFilter]             = useState("all");
  const { toast } = useToast();
  const { criteria } = useAtRiskCriteria();

  const { data: studentIds = [], isLoading: loadingAssignments } = useAssignedStudents();

  useEffect(() => {
    if (!loadingAssignments) {
      fetchDeadlines();
    }
  }, [loadingAssignments, studentIds, criteria]);

  const fetchDeadlines = async () => {
    if (loadingAssignments) return;

    if (studentIds.length === 0) {
      setDeadlines([]);
      return;
    }

    setLoading(true);

    try {
      const [appsRes, profilesRes, essaysRes, recsRes] = await Promise.all([
        supabase.from("applications").select("*").in("student_id", studentIds).order("deadline_date", { ascending: true }),
        supabase.from("profiles").select("user_id, full_name").in("user_id", studentIds),
        supabase.from("essay_feedback").select("student_id, status").in("student_id", studentIds),
        supabase.from("recommendation_requests").select("student_id, status").in("student_id", studentIds),
      ]);

      if (appsRes.error) throw appsRes.error;
      if (profilesRes.error) throw profilesRes.error;
      if (essaysRes.error) throw essaysRes.error;
      if (recsRes.error) throw recsRes.error;

      const apps = appsRes.data ?? [];
      const essays = essaysRes.data ?? [];
      const recs = recsRes.data ?? [];

      const profileMap = new Map(
        (profilesRes.data ?? []).map((p) => [p.user_id, p.full_name ?? "Unknown"])
      );

      const essayMap = new Map<string, typeof essays>();
      essays.forEach((e) => {
        if (!essayMap.has(e.student_id)) essayMap.set(e.student_id, []);
        essayMap.get(e.student_id)!.push(e);
      });

      const recMap = new Map<string, typeof recs>();
      recs.forEach((r) => {
        if (!recMap.has(r.student_id)) recMap.set(r.student_id, []);
        recMap.get(r.student_id)!.push(r);
      });

      const deadlineMap = new Map<string, Deadline>();

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (const app of apps) {
        const key = `${app.school_name}__${app.application_type}__${app.deadline_date}`;
        const date = new Date(app.deadline_date);

        const daysLeft = Math.round(
          (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        const studentEssays = essayMap.get(app.student_id) ?? [];
        const studentRecs = recMap.get(app.student_id) ?? [];

        const essaysDone = studentEssays.filter(
          (e) => ["sent", "read", "approved"].includes(e.status)
        ).length;

        const recsDone = studentRecs.filter((r) => r.status === "sent").length;

        const progress = computeCompletion(essaysDone, studentEssays.length, recsDone, studentRecs.length, criteria);

        const studentEntry: StudentDeadline = {
          studentId: app.student_id,
          studentName: profileMap.get(app.student_id) ?? "Unknown",
          progress,
          essayCount: studentEssays.length,
          essaysDone,
          recCount: studentRecs.length,
          recsDone,
        };

        if (deadlineMap.has(key)) {
          deadlineMap.get(key)!.students.push(studentEntry);
        } else {
          deadlineMap.set(key, {
            id: app.id,
            school: app.school_name,
            applicationType: app.application_type,
            date,
            daysLeft,
            urgency: computeUrgency(daysLeft),
            students: [studentEntry],
          });
        }
      }
      setDeadlines(Array.from(deadlineMap.values()));
    } catch (error: any) {
      toast({
        title: "Failed to load deadlines",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredDeadlines = deadlines.filter((d) => {
    const matchesUrgency = urgencyFilter === "all" || d.urgency === urgencyFilter;
    const matchesType    = typeFilter === "all" || d.applicationType === typeFilter;
    return matchesUrgency && matchesType;
  });

  const atRiskStudents = deadlines
    .filter((d) => d.urgency === "critical" || d.urgency === "overdue")
    .flatMap((d) => d.students.filter((s) => s.progress < criteria.needsAttentionThreshold))
    .filter((s, i, arr) => arr.findIndex((x) => x.studentId === s.studentId) === i);

  const generateCalendarDays = () => {
    const year     = selectedDate.getFullYear();
    const month    = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const start    = new Date(firstDay);
    start.setDate(start.getDate() - firstDay.getDay());

    const days    = [];
    const current = new Date(start);

    for (let i = 0; i < 42; i++) {
      days.push({
        date: new Date(current),
        isCurrentMonth: current.getMonth() === month,
        deadlines: filteredDeadlines.filter(
          (d) => d.date.toDateString() === current.toDateString()
        ),
      });
      current.setDate(current.getDate() + 1);
    }
    return days;
  };

  if (loading) {
    return (
      <PageShell>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <BlurOrb tone="gold" className="top-[-100px] right-[-100px] w-[500px] h-[500px]" />

      <PageHeader
        eyebrow="Deadlines"
        title={<>The days ahead.</>}
        subtitle={<>Application deadlines, sorted by urgency.</>}
        actions={
          <Tabs value={viewMode} onValueChange={setViewMode}>
            <TabsList className="bg-white/[0.02] hairline p-1 h-auto">
              <TabsTrigger
                value="month"
                className="data-[state=active]:bg-white/[0.06] data-[state=active]:text-foreground data-[state=active]:shadow-none text-muted-foreground flex items-center gap-2"
              >
                <Grid3X3 className="h-4 w-4" /> Month
              </TabsTrigger>
              <TabsTrigger
                value="list"
                className="data-[state=active]:bg-white/[0.06] data-[state=active]:text-foreground data-[state=active]:shadow-none text-muted-foreground flex items-center gap-2"
              >
                <List className="h-4 w-4" /> List
              </TabsTrigger>
            </TabsList>
          </Tabs>
        }
      />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
        className="space-y-6"
      >
        {/* At Risk Alert */}
        {atRiskStudents.length > 0 && (
          <motion.div variants={sectionVariants}>
            <HairlineCard variant="pink">
              <h3 className="font-serif text-xl text-foreground flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-[color:var(--pn-pink)]" />
                Not ready yet.
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                <span className="num-display">{atRiskStudents.length}</span> student{atRiskStudents.length > 1 ? "s are" : " is"} behind on critical deadlines.
              </p>
              <div className="flex flex-wrap gap-2">
                {atRiskStudents.map((student) => (
                  <span
                    key={student.studentId}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-[color:var(--pn-pink)]/15 text-[color:var(--pn-pink)] hairline"
                  >
                    <User className="h-3 w-3" />
                    {student.studentName} <span className="num-display ml-1">{student.progress}%</span>
                  </span>
                ))}
              </div>
            </HairlineCard>
          </motion.div>
        )}

        {/* Filters */}
        <motion.div variants={sectionVariants}>
          <HairlineCard>
            <div className="flex gap-4 flex-wrap">
              <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                <SelectTrigger className="w-[150px] bg-white/[0.02] hairline">
                  <SelectValue placeholder="All urgency" />
                </SelectTrigger>
                <SelectContent className="bg-pn-card hairline">
                  <SelectItem value="all">All urgency</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="important">Important</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px] bg-white/[0.02] hairline">
                  <SelectValue placeholder="Application type" />
                </SelectTrigger>
                <SelectContent className="bg-pn-card hairline">
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="early-decision">Early decision</SelectItem>
                  <SelectItem value="early-action">Early action</SelectItem>
                  <SelectItem value="regular">Regular</SelectItem>
                  <SelectItem value="ucas">UCAS</SelectItem>
                  <SelectItem value="rolling">Rolling</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </HairlineCard>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main View */}
          <motion.div variants={sectionVariants} className="lg:col-span-3">
            <Tabs value={viewMode} onValueChange={setViewMode}>

              {/* Month View */}
              <TabsContent value="month">
                <HairlineCard>
                  <div className="flex flex-row items-center justify-between mb-5">
                    <h3 className="font-serif text-2xl text-foreground leading-tight flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5 text-[color:var(--pn-gold)]" />
                      {selectedDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                    </h3>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-transparent hairline hover:bg-white/[0.03] text-foreground shadow-none"
                        onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-transparent hairline hover:bg-white/[0.03] text-foreground shadow-none"
                        onClick={() => setSelectedDate(new Date())}
                      >
                        Today
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-transparent hairline hover:bg-white/[0.03] text-foreground shadow-none"
                        onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                      <div key={day} className="p-2 text-center text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                        {day}
                      </div>
                    ))}
                    {generateCalendarDays().map((day, index) => (
                      <div
                        key={index}
                        className={`min-h-20 p-1 hairline rounded-md ${!day.isCurrentMonth ? "bg-white/[0.01] text-muted-foreground" : "bg-white/[0.02]"}`}
                      >
                        <div className="text-sm num-display mb-1 text-foreground">{day.date.getDate()}</div>
                        <div className="space-y-1">
                          {day.deadlines.slice(0, 2).map((deadline) => (
                            <div
                              key={deadline.id}
                              className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 hairline ${urgencyCellBg(deadline.urgency)}`}
                              onClick={() => setSelectedDeadline(deadline)}
                            >
                              {deadline.school}
                            </div>
                          ))}
                          {day.deadlines.length > 2 && (
                            <div className="text-xs text-muted-foreground">+<span className="num-display">{day.deadlines.length - 2}</span> more</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </HairlineCard>
              </TabsContent>

              {/* List View */}
              <TabsContent value="list">
                {filteredDeadlines.length === 0 ? (
                  <HairlineCard variant="sage" className="text-center py-12">
                    <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-40" />
                    <h3 className="font-serif text-xl text-foreground mb-2">Nothing on the horizon — yet.</h3>
                    <p className="font-serif italic text-muted-foreground">
                      Add applications for your students to track their deadlines.
                    </p>
                  </HairlineCard>
                ) : (
                  <div className="space-y-3">
                    {filteredDeadlines.map((deadline) => (
                      <div
                        key={deadline.id}
                        className="cursor-pointer"
                        onClick={() => setSelectedDeadline(deadline)}
                      >
                        <HairlineCard className={`border-l-2 ${urgencyAccentBorder(deadline.urgency)} hover:bg-white/[0.02] transition-colors`}>
                          <div className="flex items-start justify-between mb-3 gap-4">
                            <div className="min-w-0">
                              <h3 className="font-serif text-xl text-foreground">{deadline.school}</h3>
                              <p className="text-muted-foreground flex items-center gap-2 text-sm mt-0.5">
                                <School className="h-3 w-3" />
                                {deadline.applicationType}
                              </p>
                              <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                                <CalendarIcon className="h-3 w-3" />
                                {formatDate(deadline.date)}
                              </p>
                            </div>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs shrink-0 ${urgencyPillClass(deadline.urgency)}`}>
                              {deadline.daysLeft > 0
                                ? <><span className="num-display mr-1">{deadline.daysLeft}</span> days left</>
                                : <><span className="num-display mr-1">{Math.abs(deadline.daysLeft)}</span> days overdue</>}
                            </span>
                          </div>

                          <div>
                            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-2">
                              Students (<span className="num-display">{deadline.students.length}</span>)
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {deadline.students.map((student) => (
                                <div
                                  key={student.studentId}
                                  className="flex items-center gap-2 hairline rounded-full px-3 py-1"
                                >
                                  <Avatar className="h-6 w-6 hairline">
                                    <AvatarFallback className="text-xs bg-white/[0.04] text-foreground">
                                      {student.studentName.split(" ").map((n) => n[0]).join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm text-foreground">{student.studentName}</span>
                                  <span className={`text-xs num-display ${progressTone(student.progress)}`}>
                                    {student.progress}%
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </HairlineCard>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </motion.div>

          {/* Sidebar */}
          <motion.div variants={sectionVariants} className="lg:col-span-1">
            <HairlineCard className="sticky top-6">
              <h3 className="font-serif text-xl text-foreground flex items-center gap-2 mb-4">
                <Clock className="h-4 w-4 text-[color:var(--pn-gold)]" />
                What's coming
              </h3>
              {filteredDeadlines.length === 0 ? (
                <p className="text-sm font-serif italic text-center py-4 text-muted-foreground">
                  Nothing yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {filteredDeadlines
                    .sort((a, b) => a.date.getTime() - b.date.getTime())
                    .slice(0, 8)
                    .map((deadline) => (
                      <div
                        key={deadline.id}
                        className={`p-3 rounded-lg hairline border-l-2 cursor-pointer hover:bg-white/[0.02] transition-colors ${urgencyAccentBorder(deadline.urgency)}`}
                        onClick={() => setSelectedDeadline(deadline)}
                      >
                        <div className="flex items-center justify-between mb-1 gap-2">
                          <h4 className="font-serif text-sm text-foreground truncate">{deadline.school}</h4>
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] shrink-0 ${urgencyPillClass(deadline.urgency)}`}>
                            {deadline.daysLeft > 0 ? <><span className="num-display mr-0.5">{deadline.daysLeft}</span>d</> : "Overdue"}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{deadline.applicationType}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(deadline.date)}</p>
                        <div className="flex items-center gap-1 mt-2">
                          {deadline.students.slice(0, 3).map((student) => (
                            <Avatar key={student.studentId} className="h-5 w-5 hairline">
                              <AvatarFallback className="text-xs bg-white/[0.04] text-foreground">
                                {student.studentName[0]}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                          {deadline.students.length > 3 && (
                            <span className="text-xs text-muted-foreground num-display">
                              +{deadline.students.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </HairlineCard>
          </motion.div>
        </div>
      </motion.div>

      {/* Deadline Detail Modal */}
      {selectedDeadline && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedDeadline(null)}>
          <div
            className="w-full max-w-4xl max-h-[90vh] overflow-y-auto hairline rounded-2xl bg-pn-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 hairline-b">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Deadline</p>
                  <h2 className="font-serif text-3xl text-foreground leading-tight">{selectedDeadline.school}</h2>
                  <p className="text-muted-foreground">{selectedDeadline.applicationType}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                    <CalendarIcon className="h-4 w-4" />
                    {formatDate(selectedDeadline.date)}
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ml-1 ${urgencyPillClass(selectedDeadline.urgency)}`}>
                      {selectedDeadline.daysLeft > 0
                        ? <><span className="num-display mr-1">{selectedDeadline.daysLeft}</span> days left</>
                        : <><span className="num-display mr-1">{Math.abs(selectedDeadline.daysLeft)}</span> days overdue</>}
                    </span>
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="bg-transparent hairline hover:bg-white/[0.03] text-foreground shadow-none"
                  onClick={() => setSelectedDeadline(null)}
                >
                  Close
                </Button>
              </div>
            </div>
            <div className="p-6 space-y-3">
              {selectedDeadline.students.map((student) => (
                <HairlineCard key={student.studentId}>
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="h-12 w-12 hairline">
                      <AvatarFallback className="bg-white/[0.04] text-foreground">
                        {student.studentName.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-serif text-lg text-foreground">{student.studentName}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Progress</span>
                        <AnimatedBar pct={student.progress} tone={barTone(student.progress)} className="w-24" />
                        <span className={`text-sm num-display ${progressTone(student.progress)}`}>{student.progress}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground flex items-center gap-2 mb-2">
                        <FileText className="h-3 w-3 text-[color:var(--pn-gold)]" /> Essays
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        <span className="num-display text-foreground">{student.essaysDone}</span> of <span className="num-display text-foreground">{student.essayCount}</span> completed
                      </p>
                      <AnimatedBar
                        pct={student.essayCount > 0 ? (student.essaysDone / student.essayCount) * 100 : 0}
                        tone="var(--pn-gold)"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <h4 className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground flex items-center gap-2 mb-2">
                        <GraduationCap className="h-3 w-3 text-[color:var(--pn-sage)]" /> Recommendations
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        <span className="num-display text-foreground">{student.recsDone}</span> of <span className="num-display text-foreground">{student.recCount}</span> received
                      </p>
                      <AnimatedBar
                        pct={student.recCount > 0 ? (student.recsDone / student.recCount) * 100 : 0}
                        tone="var(--pn-sage)"
                        className="w-full"
                      />
                    </div>
                  </div>
                </HairlineCard>
              ))}
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
};

export default CheckDeadlines;
