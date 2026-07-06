import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Search,
  Filter,
  Download,
  Eye,
  FileText,
  CheckCircle,
  AlertCircle,
  School,
  BarChart3,
  Target,
  Send,
  GraduationCap,
  TrendingUp,
  AlertTriangle,
  Loader2,
  User,
} from "lucide-react";
import { useApplications, type ApplicationWithProfile } from "@/hooks/useApplications";
import { PageShell, PageHeader, HairlineCard, BlurOrb } from "@/components/primrose-night";

const safeDivide = (num: number, den: number) => (den > 0 ? (num / den) * 100 : 0);

const sectionVariants = {
  hidden: { opacity: 0, y: 10, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: [0.2, 0.6, 0.2, 1] as const },
  },
};

const getDeadlineStatus = (deadline: string) => {
  const daysUntil = Math.ceil(
    (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  if (daysUntil < 0) return "overdue";
  if (daysUntil <= 7) return "urgent";
  if (daysUntil <= 30) return "upcoming";
  return "future";
};

const deadlineTone = (deadline: string) => {
  switch (getDeadlineStatus(deadline)) {
    case "overdue": return "text-[color:var(--pn-pink)]";
    case "urgent":  return "text-[color:var(--pn-gold)]";
    case "upcoming": return "text-foreground";
    default:        return "text-muted-foreground";
  }
};

const statusPillClass = (status: string) => {
  switch (status) {
    case "submitted":   return "bg-[color:var(--pn-sage)]/15 text-[color:var(--pn-sage)] hairline";
    case "accepted":    return "bg-[color:var(--pn-sage)]/15 text-[color:var(--pn-sage)] hairline";
    case "in-progress": return "bg-[color:var(--pn-gold)]/15 text-[color:var(--pn-gold)] hairline";
    case "waitlisted":  return "bg-[color:var(--pn-gold)]/15 text-[color:var(--pn-gold)] hairline";
    case "rejected":    return "bg-[color:var(--pn-pink)]/15 text-[color:var(--pn-pink)] hairline";
    case "not-started": return "bg-white/[0.03] text-muted-foreground hairline";
    default:            return "bg-white/[0.03] text-muted-foreground hairline";
  }
};

const getApplicationTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    "early-decision": "Early Decision",
    "early-action":   "Early Action",
    regular:          "Regular",
    ucas:             "UCAS",
    rolling:          "Rolling",
  };
  return labels[type] ?? type;
};

const getInitials = (name: string | null | undefined) =>
  name ? name.split(" ").map((n) => n[0]).join("") : "?";

const AnimatedBar = ({ pct, tone = "var(--pn-sage)", className = "w-16" }: { pct: number; tone?: string; className?: string }) => (
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

const buildRecipients = (appsToSend: ApplicationWithProfile[]) => {
  const byStudent = new Map<string, { name: string; list: ApplicationWithProfile[] }>();
  for (const app of appsToSend) {
    const name = app.profiles?.full_name ?? "Student";
    if (!byStudent.has(app.student_id)) byStudent.set(app.student_id, { name, list: [] });
    byStudent.get(app.student_id)!.list.push(app);
  }
  return Array.from(byStudent.entries()).map(([studentId, { name, list }]) => ({
    studentId,
    studentName: name,
    applications: list.map((a) => ({
      schoolName: a.school_name,
      applicationType: a.application_type,
      deadlineDate: a.deadline_date,
      daysLeft: Math.ceil((new Date(a.deadline_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      completionPct: a.completion_percentage,
      completedEssays: a.completed_essays,
      requiredEssays: a.required_essays,
      recsSubmitted: a.recommendations_submitted,
      recsRequested: a.recommendations_requested,
    })),
  }));
};

const Applications = () => {
  const { applications, isLoading, error } = useApplications();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm]           = useState("");
  const [statusFilter, setStatusFilter]       = useState("all");
  const [sortBy, setSortBy]                   = useState("deadline");
  const [selectedIds, setSelectedIds]         = useState<string[]>([]);
  const [viewMode, setViewMode]               = useState<"student" | "school">("student");
  const [sendingReminders, setSendingReminders]     = useState(false);
  const [sendingReminderFor, setSendingReminderFor] = useState<string | null>(null);

  if (isLoading) {
    return (
      <PageShell>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell>
        <div className="flex items-center justify-center h-96 gap-3 text-[color:var(--pn-pink)]">
          <AlertCircle className="h-6 w-6" />
          <p className="font-serif italic">Applications wouldn't load. Please refresh and try again.</p>
        </div>
      </PageShell>
    );
  }

  const filtered = applications
    .filter((app) => {
      const name = app.profiles?.full_name ?? "";
      const matchesSearch =
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.school_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (app.program ?? "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || app.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "deadline":    return new Date(a.deadline_date).getTime() - new Date(b.deadline_date).getTime();
        case "completion":  return b.completion_percentage - a.completion_percentage;
        case "school":      return a.school_name.localeCompare(b.school_name);
        default:            return 0;
      }
    });

  const totalApplications  = applications.length;
  const uniqueSchools      = new Set(applications.map((a) => a.school_name)).size;
  const urgentCount        = applications.filter(
    (a) => a.urgent || getDeadlineStatus(a.deadline_date) === "urgent"
  ).length;
  const avgCompletion = applications.length
    ? Math.round(applications.reduce((s, a) => s + a.completion_percentage, 0) / applications.length)
    : 0;

  const schoolStats = Array.from(new Set(applications.map((a) => a.school_name))).map((school) => {
    const schoolApps = applications.filter((a) => a.school_name === school);
    return {
      school,
      count: schoolApps.length,
      avgCompletion: Math.round(
        schoolApps.reduce((s, a) => s + a.completion_percentage, 0) / schoolApps.length
      ),
      urgent: schoolApps.filter((a) => a.urgent).length,
    };
  });

  const toggleSelect = (id: string) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const toggleSelectAll = () =>
    setSelectedIds(
      selectedIds.length === filtered.length ? [] : filtered.map((a) => a.id)
    );

  const invokeReminders = async (appsToSend: ApplicationWithProfile[]) => {
    const recipients = buildRecipients(appsToSend);
    if (recipients.length === 0) {
      toast({ title: "Nothing to send", description: "No students match the reminder criteria." });
      return;
    }
    const { error: fnError } = await supabase.functions.invoke("send-application-reminder", {
      body: { recipients },
    });
    if (fnError) {
      toast({ title: "Failed to send reminders", description: fnError.message, variant: "destructive" });
    } else {
      toast({ title: "Reminders sent!", description: `Emails sent to ${recipients.length} student${recipients.length !== 1 ? "s" : ""}.` });
    }
  };

  const sendBulkReminders = async () => {
    setSendingReminders(true);
    const urgentApps = applications.filter((app) => {
      if (app.status === "submitted") return false;
      const status = getDeadlineStatus(app.deadline_date);
      return app.urgent || status === "urgent" || status === "upcoming" || app.completion_percentage < 60;
    });
    await invokeReminders(urgentApps);
    setSendingReminders(false);
  };

  const sendSelectedReminders = async () => {
    setSendingReminders(true);
    await invokeReminders(filtered.filter((app) => selectedIds.includes(app.id)));
    setSendingReminders(false);
  };

  const sendSingleReminder = async (app: ApplicationWithProfile) => {
    setSendingReminderFor(app.id);
    await invokeReminders([app]);
    setSendingReminderFor(null);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();

    const tableData = filtered.map((app) => [
      app.profiles?.full_name || "—",
      app.school_name,
      app.program || "-",
      app.application_type,
      app.deadline_date,
      `${app.completed_essays}/${app.required_essays}`,
      `${app.recommendations_submitted}/${app.recommendations_requested}`,
      app.status,
      `${app.completion_percentage}%`,
    ]);

    autoTable(doc, {
      head: [[
        "Student",
        "School",
        "Program",
        "Type",
        "Deadline",
        "Essays",
        "Recs",
        "Status",
        "Progress"
      ]],
      body: tableData,
    });

    doc.save("applications.pdf");
  };

  const statTiles = [
    { label: "Total applications", value: totalApplications, icon: FileText, tone: "var(--pn-sage)" },
    { label: "Schools", value: uniqueSchools, icon: School, tone: "var(--pn-sage)" },
    { label: "Urgent", value: urgentCount, icon: AlertTriangle, tone: "var(--pn-gold)" },
    { label: "Avg completion", value: `${avgCompletion}%`, icon: TrendingUp, tone: "var(--pn-sage)" },
  ];

  return (
    <PageShell>
      <BlurOrb tone="gold" className="top-[-100px] right-[-100px] w-[500px] h-[500px]" />

      <PageHeader
        eyebrow="Applications"
        title={<>Your list.</>}
        subtitle={<>Every application, weighted by deadline.</>}
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-transparent hairline hover:bg-white/[0.03] text-foreground shadow-none"
              onClick={handleExportPDF}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-transparent hairline hover:bg-white/[0.03] text-[color:var(--pn-pink)] shadow-none"
              onClick={sendBulkReminders}
              disabled={sendingReminders}
            >
              {sendingReminders
                ? <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                : <Send className="h-4 w-4 mr-2" />}
              Send reminders
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
        {/* Analytics Cards */}
        <motion.div variants={sectionVariants} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {statTiles.map(({ label, value, icon: Icon, tone }) => (
            <HairlineCard key={label}>
              <div className="flex items-center gap-3">
                <div className="hairline rounded-lg p-2" style={{ background: `${tone}20` }}>
                  <Icon className="h-4 w-4" style={{ color: tone }} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
                  <p className="num-display text-2xl text-foreground">{value}</p>
                </div>
              </div>
            </HairlineCard>
          ))}
        </motion.div>

        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "student" | "school")}>
          <motion.div variants={sectionVariants} className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
            <TabsList className="bg-white/[0.02] hairline p-1 h-auto">
              <TabsTrigger
                value="student"
                className="data-[state=active]:bg-white/[0.06] data-[state=active]:text-foreground data-[state=active]:shadow-none text-muted-foreground"
              >
                By student
              </TabsTrigger>
              <TabsTrigger
                value="school"
                className="data-[state=active]:bg-white/[0.06] data-[state=active]:text-foreground data-[state=active]:shadow-none text-muted-foreground"
              >
                By school
              </TabsTrigger>
            </TabsList>

            <div className="flex gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-[250px] bg-white/[0.02] hairline focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] bg-white/[0.02] hairline">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-pn-card hairline">
                  <SelectItem value="all">All status</SelectItem>
                  <SelectItem value="not-started">Not started</SelectItem>
                  <SelectItem value="in-progress">In progress</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="waitlisted">Waitlisted</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[120px] bg-white/[0.02] hairline">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent className="bg-pn-card hairline">
                  <SelectItem value="deadline">Deadline</SelectItem>
                  <SelectItem value="completion">Completion</SelectItem>
                  <SelectItem value="school">School</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                className="bg-transparent hairline hover:bg-white/[0.03] text-foreground shadow-none"
                onClick={handleExportPDF}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>

          {/* ── Student View ── */}
          <TabsContent value="student" className="space-y-4 mt-4">
            {selectedIds.length > 0 && (
              <HairlineCard variant="pink" className="flex items-center justify-between">
                <span className="text-sm text-foreground">
                  <span className="num-display">{selectedIds.length}</span> selected
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-transparent hairline hover:bg-white/[0.03] text-[color:var(--pn-pink)] shadow-none"
                    onClick={sendSelectedReminders}
                    disabled={sendingReminders}
                  >
                    {sendingReminders
                      ? <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      : <Send className="h-4 w-4 mr-2" />}
                    Send reminders
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-transparent hairline hover:bg-white/[0.03] text-foreground shadow-none"
                    onClick={handleExportPDF}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export selected
                  </Button>
                </div>
              </HairlineCard>
            )}

            <HairlineCard className="p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-pn-card">
                    <TableRow className="hover:bg-transparent border-b border-white/[0.06]">
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedIds.length === filtered.length && filtered.length > 0}
                          onCheckedChange={toggleSelectAll}
                        />
                      </TableHead>
                      <TableHead className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Student</TableHead>
                      <TableHead className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">School / Program</TableHead>
                      <TableHead className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Type</TableHead>
                      <TableHead className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Deadline</TableHead>
                      <TableHead className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Essays</TableHead>
                      <TableHead className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Recs</TableHead>
                      <TableHead className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Status</TableHead>
                      <TableHead className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Progress</TableHead>
                      <TableHead className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((app) => (
                      <TableRow
                        key={app.id}
                        className={`hover:bg-white/[0.02] border-b border-white/[0.04] ${app.urgent ? "border-l-2 border-l-[color:var(--pn-gold)]" : ""}`}
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.includes(app.id)}
                            onCheckedChange={() => toggleSelect(app.id)}
                          />
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 hairline">
                              <AvatarImage src={app.profiles?.avatar_url ?? undefined} />
                              <AvatarFallback className="text-xs bg-white/[0.04] text-foreground">
                                {getInitials(app.profiles?.full_name)}
                              </AvatarFallback>
                            </Avatar>
                            <p className="text-foreground">
                              {app.profiles?.full_name ?? "—"}
                            </p>
                          </div>
                        </TableCell>

                        <TableCell>
                          <p className="text-foreground">{app.school_name}</p>
                          {app.program && (
                            <p className="text-sm text-muted-foreground">{app.program}</p>
                          )}
                        </TableCell>

                        <TableCell>
                          <span className="hairline rounded-full px-2 py-0.5 text-xs text-muted-foreground">
                            {getApplicationTypeLabel(app.application_type)}
                          </span>
                        </TableCell>

                        <TableCell>
                          <div className={deadlineTone(app.deadline_date)}>
                            <p className="text-sm">{app.deadline_date}</p>
                            {app.urgent && (
                              <div className="flex items-center gap-1 mt-1">
                                <AlertCircle className="h-3 w-3 text-[color:var(--pn-gold)]" />
                                <span className="text-xs text-[color:var(--pn-gold)]">Urgent</span>
                              </div>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-sm num-display text-foreground">
                              {app.completed_essays}/{app.required_essays}
                            </span>
                            <AnimatedBar
                              pct={safeDivide(app.completed_essays, app.required_essays)}
                              tone="var(--pn-gold)"
                              className="w-16"
                            />
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-sm num-display text-foreground">
                              {app.recommendations_submitted}/{app.recommendations_requested}
                            </span>
                            <AnimatedBar
                              pct={safeDivide(app.recommendations_submitted, app.recommendations_requested)}
                              tone="var(--pn-sage)"
                              className="w-16"
                            />
                          </div>
                        </TableCell>

                        <TableCell>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${statusPillClass(app.status)}`}>
                            {app.status.replace("-", " ")}
                          </span>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-2">
                            <AnimatedBar pct={app.completion_percentage} tone="var(--pn-sage)" className="w-16" />
                            <span className="text-sm num-display text-foreground">{app.completion_percentage}%</span>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-2">
                            {app.completion_percentage === 100 && app.status !== 'submitted' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-[color:var(--pn-sage)]/15 text-[color:var(--pn-sage)] hairline">
                                <CheckCircle className="h-3 w-3" />
                                Ready
                              </span>
                            )}
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-white/[0.03]">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-pn-card hairline">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10 hairline">
                                      <AvatarImage src={app.profiles?.avatar_url ?? undefined} />
                                      <AvatarFallback className="bg-white/[0.04] text-foreground">
                                        {getInitials(app.profiles?.full_name)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <h2 className="font-serif text-2xl text-foreground leading-tight">{app.school_name}</h2>
                                      <p className="text-sm text-muted-foreground">
                                        {app.profiles?.full_name ?? "Student"} {app.program ? `— ${app.program}` : ""}
                                      </p>
                                    </div>
                                  </DialogTitle>
                                </DialogHeader>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <HairlineCard>
                                    <h3 className="font-serif text-xl text-foreground flex items-center gap-2 mb-4">
                                      <Target className="h-4 w-4 text-[color:var(--pn-sage)]" />
                                      Overview
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Type</p>
                                        <p className="text-foreground">{getApplicationTypeLabel(app.application_type)}</p>
                                      </div>
                                      <div>
                                        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Deadline</p>
                                        <p className={deadlineTone(app.deadline_date)}>
                                          {app.deadline_date}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-1">Status</p>
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${statusPillClass(app.status)}`}>
                                          {app.status.replace("-", " ")}
                                        </span>
                                      </div>
                                      <div>
                                        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Progress</p>
                                        <p className="num-display text-foreground">{app.completion_percentage}%</p>
                                      </div>
                                    </div>
                                    {app.completion_percentage === 100 && app.status !== 'submitted' && (
                                      <div className="mt-4 p-3 rounded-lg bg-[color:var(--pn-sage)]/10 hairline">
                                        <div className="flex items-center gap-2">
                                          <CheckCircle className="h-4 w-4 text-[color:var(--pn-sage)]" />
                                          <p className="text-sm text-[color:var(--pn-sage)]">
                                            Ready to submit.
                                          </p>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                          All essays and recommendations are complete.
                                        </p>
                                      </div>
                                    )}
                                  </HairlineCard>

                                  <HairlineCard>
                                    <h3 className="font-serif text-xl text-foreground flex items-center gap-2 mb-4">
                                      <BarChart3 className="h-4 w-4 text-[color:var(--pn-gold)]" />
                                      Requirements
                                    </h3>
                                    <div className="space-y-4">
                                      <div>
                                        <div className="flex justify-between mb-2">
                                          <span className="text-sm text-muted-foreground">Essays</span>
                                          <span className="text-sm num-display text-foreground">{app.completed_essays}/{app.required_essays}</span>
                                        </div>
                                        <AnimatedBar
                                          pct={safeDivide(app.completed_essays, app.required_essays)}
                                          tone="var(--pn-gold)"
                                          className="w-full"
                                        />
                                      </div>
                                      <div>
                                        <div className="flex justify-between mb-2">
                                          <span className="text-sm text-muted-foreground">Recommendations</span>
                                          <span className="text-sm num-display text-foreground">{app.recommendations_submitted}/{app.recommendations_requested}</span>
                                        </div>
                                        <AnimatedBar
                                          pct={safeDivide(app.recommendations_submitted, app.recommendations_requested)}
                                          tone="var(--pn-sage)"
                                          className="w-full"
                                        />
                                      </div>
                                      {app.ai_score_avg !== null && app.ai_score_avg > 0 && (
                                        <div>
                                          <div className="flex justify-between mb-2">
                                            <span className="text-sm text-muted-foreground">Avg AI score</span>
                                            <span className="text-sm num-display text-foreground">{app.ai_score_avg}/100</span>
                                          </div>
                                          <AnimatedBar
                                            pct={app.ai_score_avg}
                                            tone="var(--pn-pink)"
                                            className="w-full"
                                          />
                                        </div>
                                      )}
                                    </div>
                                  </HairlineCard>
                                </div>

                                <div className="flex gap-2 pt-4 hairline-t">
                                  <Button className="flex-1 bg-transparent hairline hover:bg-white/[0.03] text-foreground shadow-none">
                                    <User className="h-4 w-4 mr-2" />
                                    Student profile
                                  </Button>
                                  <Button
                                    variant="outline"
                                    className="flex-1 bg-transparent hairline hover:bg-white/[0.03] text-foreground shadow-none"
                                  >
                                    <FileText className="h-4 w-4 mr-2" />
                                    View essays
                                  </Button>
                                  <Button
                                    variant="outline"
                                    className="bg-transparent hairline hover:bg-white/[0.03] text-[color:var(--pn-pink)] shadow-none"
                                    onClick={() => sendSingleReminder(app)}
                                    disabled={sendingReminderFor === app.id}
                                  >
                                    {sendingReminderFor === app.id
                                      ? <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      : <Send className="h-4 w-4 mr-2" />}
                                    Send reminder
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </HairlineCard>
          </TabsContent>

          {/* ── School View ── */}
          <TabsContent value="school" className="space-y-4 mt-4">
            <HairlineCard>
              <h3 className="font-serif text-2xl text-foreground leading-tight flex items-center gap-2 mb-5">
                <School className="h-5 w-5 text-[color:var(--pn-sage)]" />
                By school.
              </h3>
              <div className="space-y-3">
                {schoolStats.map((stat) => (
                  <div
                    key={stat.school}
                    className="flex items-center justify-between p-4 hairline rounded-lg hover:bg-white/[0.02] transition-colors"
                  >
                    <div>
                      <h4 className="font-serif text-lg text-foreground">{stat.school}</h4>
                      <p className="text-sm text-muted-foreground">
                        <span className="num-display">{stat.count}</span> application{stat.count !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Avg completion</p>
                        <p className="num-display text-foreground">{stat.avgCompletion}%</p>
                      </div>
                      {stat.urgent > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-[color:var(--pn-pink)]/15 text-[color:var(--pn-pink)] hairline">
                          <AlertTriangle className="h-3 w-3" />
                          <span className="num-display">{stat.urgent}</span> urgent
                        </span>
                      )}
                      <AnimatedBar pct={stat.avgCompletion} tone="var(--pn-sage)" className="w-24" />
                    </div>
                  </div>
                ))}
              </div>
            </HairlineCard>
          </TabsContent>
        </Tabs>

        {filtered.length === 0 && !isLoading && (
          <motion.div variants={sectionVariants}>
            <HairlineCard variant="gold" className="text-center py-12">
              <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-40" />
              <h3 className="font-serif text-xl text-foreground mb-2">Nothing here yet.</h3>
              <p className="font-serif italic text-muted-foreground">
                {applications.length === 0
                  ? "No applications have been added."
                  : "Try loosening the filters."}
              </p>
            </HairlineCard>
          </motion.div>
        )}
      </motion.div>
    </PageShell>
  );
};

export default Applications;
