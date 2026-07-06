import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useAtRiskCriteria } from "@/hooks/useAtRiskCriteria";
import { resolveStudentStatus, computeCompletion, classifyRisk } from "@/lib/atRiskUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  Download,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Minus,
  GraduationCap,
  FileText,
  Calendar,
  BarChart3,
  Target,
  LayoutGrid,
  List,
  Loader2,
  Send,
  Pencil,
} from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageShell, PageHeader, HairlineCard, BlurOrb } from "@/components/primrose-night";

// ─── Types ────────────────────────────────────────────────────
interface Student {
  id: string
  name: string
  email: string | null
  avatar_url: string | null
  school_name: string | null
  gpa: number | null
  sat_score: number | null
  act_score: number | null
  graduation_year: number | null
  completionPercentage: number
  status: 'on-track' | 'needs-attention' | 'at-risk' | 'not-started'
  reasons: string[]
  lastActivity: string
  essaysSubmitted: number
  totalEssays: number
  recommendationsSubmitted: number
  recommendationsRequested: number
  upcomingDeadlines: number
  hasNearDeadline: boolean
  targetSchools: string[]
  extracurriculars: string[]
  tasks: { id: string; task: string; due_date: string | null; completed: boolean }[]
  meetingNotes: { id: string; meeting_date: string; summary: string }[]
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

// ─── Helpers ──────────────────────────────────────────────────
const statusPillClass = (status: string) => {
  switch (status) {
    case 'on-track':
      return 'bg-[color:var(--pn-sage)]/15 text-[color:var(--pn-sage)] hairline'
    case 'needs-attention':
      return 'bg-[color:var(--pn-gold)]/15 text-[color:var(--pn-gold)] hairline'
    case 'at-risk':
      return 'bg-[color:var(--pn-pink)]/15 text-[color:var(--pn-pink)] hairline'
    case 'not-started':
      return 'bg-white/[0.03] text-muted-foreground hairline'
    default:
      return 'bg-white/[0.03] text-muted-foreground hairline'
  }
}

const progressTone = (status: string) => {
  switch (status) {
    case 'on-track': return 'var(--pn-sage)'
    case 'needs-attention': return 'var(--pn-gold)'
    case 'at-risk': return 'var(--pn-pink)'
    default: return 'rgba(255,255,255,0.35)'
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'on-track': return CheckCircle
    case 'needs-attention': return Clock
    case 'at-risk': return AlertTriangle
    case 'not-started': return Minus
    default: return User
  }
}

const AtRiskBadge = ({ student }: { student: Student }) => {
  const StatusIcon = getStatusIcon(student.status)
  const reasons = student.status === 'at-risk' ? student.reasons : []

  return (
    <div className="relative inline-block group/risk">
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs cursor-default ${statusPillClass(student.status)}`}>
        <StatusIcon className="h-3 w-3" />
        {student.status.replace('-', ' ')}
      </span>
      {student.status === 'at-risk' && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-[9999]
                        hidden group-hover/risk:block
                        w-56 bg-pn-card hairline
                        text-xs text-foreground rounded-xl shadow-lg px-3 py-2.5 space-y-1.5
                        pointer-events-none">
          <p className="font-serif text-[color:var(--pn-pink)] mb-1">Why at risk:</p>
          {reasons.map((r, i) => (
            <div key={i} className="flex items-start gap-1.5">
              <span className="mt-0.5 shrink-0 text-[color:var(--pn-pink)]">•</span>
              <span className="leading-snug text-muted-foreground">{r}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const AnimatedBar = ({ pct, tone }: { pct: number; tone: string }) => (
  <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
    <motion.div
      className="h-full"
      style={{ background: tone }}
      initial={{ width: 0 }}
      animate={{ width: `${pct}%` }}
      transition={{ duration: 0.9, ease: [0.2, 0.6, 0.2, 1], delay: 0.15 }}
    />
  </div>
)

const Students = () => {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [gpaFilter, setGpaFilter] = useState("all")
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const { toast } = useToast()
  const { criteria } = useAtRiskCriteria()
  const navigate = useNavigate()

  useEffect(() => {
    fetchStudents()
  }, [])

  const displayStudents = useMemo(() =>
    students.map(s => {
      if (s.status === 'not-started') return s;
      const completionPercentage = computeCompletion(
        s.essaysSubmitted, s.totalEssays,
        s.recommendationsSubmitted, s.recommendationsRequested,
        criteria
      )
      const status = classifyRisk(completionPercentage, s.hasNearDeadline, criteria) as Student['status']
      const reasons: string[] = []
      if (s.hasNearDeadline) reasons.push('Application deadline within 14 days')
      if (completionPercentage < criteria.atRiskThreshold)
        reasons.push(`Completion at ${completionPercentage}% — below ${criteria.atRiskThreshold}% threshold`)
      if (reasons.length === 0) reasons.push('Overall progress requires attention')
      return { ...s, completionPercentage, status, reasons }
    }),
    [students, criteria]
  )

  const fetchStudents = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not logged in')

      const { data: assignments, error: assignmentError } = await supabase
        .from('student_counselor_assignments')
        .select('student_id')
        .eq('counselor_id', user.id)

      if (assignmentError) throw assignmentError
      if (!assignments || assignments.length === 0) {
        setStudents([])
        return
      }

      const studentIds = assignments.map(a => a.student_id)

      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, full_name, email, avatar_url, schools(name)')
        .in('user_id', studentIds)

      if (profileError) throw profileError

      const { data: studentProfiles, error: spError } = await supabase
        .from('student_profiles')
        .select('user_id, gpa, sat_score, act_score, graduation_year')
        .in('user_id', studentIds)

      if (spError) throw spError

      const { data: applications, error: appsError } = await supabase
        .from('applications')
        .select('id, student_id, deadline_date, status')
        .in('student_id', studentIds)

      if (appsError) throw appsError

      const appIds = (applications ?? []).map(a => a.id)
      const { data: essaySlots, error: slotError } = appIds.length > 0
        ? await supabase
            .from('application_essays')
            .select('application_id, status')
            .in('application_id', appIds)
        : { data: [] as { application_id: string; status: string }[], error: null }

      if (slotError) throw slotError

      const { data: recs, error: recError } = await supabase
        .from('recommendation_requests')
        .select('student_id, status')
        .in('student_id', studentIds)

      if (recError) throw recError

      const { data: targetSchools, error: tsError } = await supabase
        .from('student_target_colleges')
        .select('student_id, college')
        .in('student_id', studentIds)

      if (tsError) throw tsError

      const { data: extracurriculars, error: ecError } = await supabase
        .from('extracurriculars')
        .select('student_id, activity')
        .in('student_id', studentIds)

      if (ecError) throw ecError

      const { data: tasks, error: taskError } = await supabase
        .from('tasks')
        .select('id, student_id, task, due_date, completed')
        .in('student_id', studentIds)

      if (taskError) throw taskError

      const { data: meetingNotes, error: mnError } = await supabase
        .from('meeting_notes')
        .select('id, student_id, meeting_date, summary')
        .in('student_id', studentIds)
        .order('meeting_date', { ascending: false })

      if (mnError) throw mnError

      const assembled: Student[] = studentIds.map(studentId => {
        const profile = profiles.find(p => p.user_id === studentId)
        const sp = studentProfiles.find(s => s.user_id === studentId)

        const studentAppIds = (applications ?? [])
          .filter(a => a.student_id === studentId)
          .map(a => a.id)
        const studentSlots = (essaySlots ?? []).filter(s => studentAppIds.includes(s.application_id))
        const totalEssays = studentSlots.length
        const essaysSubmitted = studentSlots.filter(s =>
          ['in_review', 'approved'].includes(s.status)
        ).length

        const studentRecs = recs.filter(r => r.student_id === studentId)
        const recommendationsRequested = studentRecs.length
        const recommendationsSubmitted = studentRecs.filter(r => r.status === 'sent').length

        const studentTasks = tasks.filter(t => t.student_id === studentId)

        const studentAppsForRisk = (applications ?? []).filter(a => a.student_id === studentId)
        const { status, completionPercentage: completion, hasNearDeadline, upcomingDeadlines, reasons } =
          resolveStudentStatus(studentAppsForRisk, studentSlots, studentRecs, criteria)

        return {
          id: studentId,
          name: profile?.full_name || 'Unknown',
          email: profile?.email || null,
          avatar_url: profile?.avatar_url || null,
          school_name: (profile?.schools as any)?.name || null,
          gpa: sp?.gpa || null,
          sat_score: sp?.sat_score || null,
          act_score: sp?.act_score || null,
          graduation_year: sp?.graduation_year || null,
          completionPercentage: completion,
          status,
          lastActivity: 'recently',
          essaysSubmitted,
          totalEssays,
          recommendationsSubmitted,
          recommendationsRequested,
          upcomingDeadlines,
          hasNearDeadline,
          reasons,
          targetSchools: targetSchools.filter(ts => ts.student_id === studentId).map(ts => ts.college),
          extracurriculars: extracurriculars.filter(ec => ec.student_id === studentId).map(ec => ec.activity),
          tasks: studentTasks.map(t => ({ id: t.id, task: t.task, due_date: t.due_date, completed: t.completed })),
          meetingNotes: meetingNotes.filter(mn => mn.student_id === studentId).map(mn => ({
            id: mn.id, meeting_date: mn.meeting_date, summary: mn.summary
          })),
        }
      })

      setStudents(assembled)
    } catch (error: any) {
      toast({ title: 'Failed to load students', description: error.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }


  const filteredStudents = displayStudents.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter
    const matchesGPA = gpaFilter === 'all' ||
      (gpaFilter === 'high' && (student.gpa ?? 0) >= 3.7) ||
      (gpaFilter === 'medium' && (student.gpa ?? 0) >= 3.0 && (student.gpa ?? 0) < 3.7) ||
      (gpaFilter === 'low' && (student.gpa ?? 0) < 3.0)
    return matchesSearch && matchesStatus && matchesGPA
  })

  const handleExportStudentsPDF = () => {
    const doc = new jsPDF();

    const tableData = filteredStudents.map((student) => [
      student.name,
      student.email || "-",
      student.school_name || "-",
      student.gpa ?? "-",
      student.sat_score ? `SAT: ${student.sat_score}` :
        student.act_score ? `ACT: ${student.act_score}` : "-",
      `${student.essaysSubmitted}/${student.totalEssays}`,
      `${student.recommendationsSubmitted}/${student.recommendationsRequested}`,
      student.upcomingDeadlines,
      `${student.completionPercentage}%`,
      student.status,
    ]);

    autoTable(doc, {
      head: [[
        "Name",
        "Email",
        "School",
        "GPA",
        "Test Score",
        "Essays",
        "Recs",
        "Deadlines",
        "Progress",
        "Status"
      ]],
      body: tableData,
    });

    doc.save("students_report.pdf");
  };

  // ─── Student Detail Dialog ──────
  const StudentDialog = ({ student }: { student: Student }) => {
    const StatusIcon = getStatusIcon(student.status)
    const [isSendingAlert, setIsSendingAlert] = useState(false)

    const handleSendAtRiskAlert = async () => {
      setIsSendingAlert(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const [{ data: counselorProfile }, { data: parentProfile }] = await Promise.all([
          supabase.from('profiles').select('full_name, email').eq('user_id', user.id).maybeSingle(),
          supabase.from('student_profiles').select('parent_name, parent_email').eq('user_id', student.id).maybeSingle(),
        ])

        const reasons: string[] = []
        if (student.essaysSubmitted === 0 && student.totalEssays > 0) {
          reasons.push(`No essays submitted yet (0 of ${student.totalEssays})`)
        }
        if (student.completionPercentage < criteria.atRiskThreshold) {
          reasons.push(`Application completion is critically low (${student.completionPercentage}%)`)
        }
        if (student.upcomingDeadlines >= 3) {
          reasons.push(`${student.upcomingDeadlines} upcoming deadlines require action`)
        }
        if (student.recommendationsSubmitted === 0 && student.recommendationsRequested > 0) {
          reasons.push('No recommendation letters received yet')
        }
        if (reasons.length === 0) reasons.push('Student progress requires your attention')

        const { data: { session } } = await supabase.auth.getSession();
        console.log('[send-at-risk-alert] Calling edge function', {
          studentEmail: student.email,
          studentName: student.name,
          parentEmail: parentProfile?.parent_email,
          counselorEmail: counselorProfile?.email,
          riskReasons: reasons,
        });
        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-at-risk`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session?.access_token}`,
            },
            body: JSON.stringify({
              studentEmail: student.email,
              studentName: student.name,
              parentEmail: parentProfile?.parent_email || null,
              parentName: parentProfile?.parent_name || null,
              counselorEmail: counselorProfile?.email || null,
              counselorName: counselorProfile?.full_name || 'Your counselor',
              riskReasons: reasons,
              appUrl: window.location.origin,
            }),
          }
        );
        console.log('[send-at-risk-alert] Done', res.status);
        toast({ title: 'At-Risk Alert Sent', description: `Alert sent to ${student.name} and their parent.` })
      } catch (error: any) {
        toast({ title: 'Failed to send alert', description: error.message, variant: 'destructive' })
      } finally {
        setIsSendingAlert(false)
      }
    }

    function generateReport() {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      doc.setFillColor(79, 70, 229);
      doc.rect(0, 0, pageWidth, 28, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("Student Report", 14, 12);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Generated ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`, 14, 21);

      doc.setTextColor(30, 30, 30);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Student Profile", 14, 40);

      autoTable(doc, {
        startY: 45,
        head: [],
        body: [
          ["Name", student.name],
          ["Email", student.email ?? "—"],
          ["School", student.school_name ?? "—"],
          ["Graduation Year", student.graduation_year ? String(student.graduation_year) : "—"],
          ["GPA", student.gpa != null ? String(student.gpa) : "—"],
          ["SAT Score", student.sat_score != null ? String(student.sat_score) : "—"],
          ["ACT Score", student.act_score != null ? String(student.act_score) : "—"],
        ],
        theme: "plain",
        styles: { fontSize: 10, cellPadding: 3 },
        columnStyles: { 0: { fontStyle: "bold", cellWidth: 50 } },
      });

      const afterProfile = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Application Progress", 14, afterProfile);

      const statusLabel = student.status.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());

      autoTable(doc, {
        startY: afterProfile + 5,
        head: [],
        body: [
          ["Status", statusLabel],
          ["Completion", `${student.completionPercentage}%`],
          ["Essays Submitted", `${student.essaysSubmitted} / ${student.totalEssays}`],
          ["Recommendations Received", `${student.recommendationsSubmitted} / ${student.recommendationsRequested}`],
          ["Upcoming Deadlines (14 days)", String(student.upcomingDeadlines)],
        ],
        theme: "plain",
        styles: { fontSize: 10, cellPadding: 3 },
        columnStyles: { 0: { fontStyle: "bold", cellWidth: 70 } },
      });

      if (student.targetSchools.length > 0) {
        const afterProgress = (doc as any).lastAutoTable.finalY + 10;
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Target Schools", 14, afterProgress);

        autoTable(doc, {
          startY: afterProgress + 5,
          head: [["School"]],
          body: student.targetSchools.map(s => [s]),
          theme: "striped",
          styles: { fontSize: 10, cellPadding: 3 },
          headStyles: { fillColor: [79, 70, 229] },
        });
      }

      if (student.reasons && student.reasons.length > 0 && student.status !== "on-track" && student.status !== "not-started") {
        const afterSchools = (doc as any).lastAutoTable.finalY + 10;
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Attention Flags", 14, afterSchools);

        autoTable(doc, {
          startY: afterSchools + 5,
          head: [],
          body: student.reasons.map(r => [r]),
          theme: "plain",
          styles: { fontSize: 10, cellPadding: 3, textColor: [180, 60, 60] },
        });
      }

      doc.save(`${student.name.replace(/\s+/g, "_")}_report.pdf`);
    }

    return (
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-pn-card hairline">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-12 w-12 hairline">
              <AvatarImage src={student.avatar_url ?? undefined} alt={student.name} />
              <AvatarFallback className="bg-white/[0.04] text-foreground">
                {student.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-serif text-2xl text-foreground leading-tight">{student.name}</h2>
              <div className="flex items-center gap-2 flex-wrap text-sm text-muted-foreground">
                {student.email && <span>{student.email}</span>}
                {student.school_name && <span>· {student.school_name}</span>}
                {student.graduation_year && <span>· Class of {student.graduation_year}</span>}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${statusPillClass(student.status)}`}>
                  <StatusIcon className="h-3 w-3" />
                  {student.status.replace('-', ' ')}
                </span>
                {student.status === 'at-risk' && (
                  <Button
                    size="sm"
                    className="bg-transparent hairline hover:bg-white/[0.03] text-[color:var(--pn-pink)] shadow-none"
                    onClick={handleSendAtRiskAlert}
                    disabled={isSendingAlert}
                  >
                    {isSendingAlert
                      ? <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      : <Send className="h-3 w-3 mr-1" />}
                    Send Alert
                  </Button>
                )}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/[0.02] hairline p-1 h-auto">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-white/[0.06] data-[state=active]:text-foreground data-[state=active]:shadow-none text-muted-foreground"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="progress"
              className="data-[state=active]:bg-white/[0.06] data-[state=active]:text-foreground data-[state=active]:shadow-none text-muted-foreground"
            >
              Progress
            </TabsTrigger>
            <TabsTrigger
              value="essays"
              className="data-[state=active]:bg-white/[0.06] data-[state=active]:text-foreground data-[state=active]:shadow-none text-muted-foreground"
            >
              Essays
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <HairlineCard>
                <h3 className="font-serif text-xl text-foreground flex items-center gap-2 mb-4">
                  <BarChart3 className="h-4 w-4 text-[color:var(--pn-sage)]" />
                  Academic performance
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">GPA</span>
                    <span className="num-display text-foreground">{student.gpa ?? '—'}</span>
                  </div>
                  {student.sat_score && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">SAT Score</span>
                      <span className="num-display text-foreground">{student.sat_score}</span>
                    </div>
                  )}
                  {student.act_score && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ACT Score</span>
                      <span className="num-display text-foreground">{student.act_score}</span>
                    </div>
                  )}
                </div>
              </HairlineCard>

              <HairlineCard>
                <h3 className="font-serif text-xl text-foreground flex items-center gap-2 mb-4">
                  <Target className="h-4 w-4 text-[color:var(--pn-pink)]" />
                  Where they're aiming
                </h3>
                {student.targetSchools.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {student.targetSchools.map((school, i) => (
                      <span key={i} className="hairline rounded-full px-3 py-1 text-xs text-foreground">
                        {school}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="font-serif italic text-muted-foreground">Nothing added yet.</p>
                )}
              </HairlineCard>
            </div>
          </TabsContent>

          <TabsContent value="progress" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <HairlineCard>
                <h3 className="font-serif text-lg text-foreground mb-3">Overall progress</h3>
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground text-sm">Completion</span>
                  <span className="num-display text-foreground">{student.completionPercentage}%</span>
                </div>
                <AnimatedBar pct={student.completionPercentage} tone={progressTone(student.status)} />
              </HairlineCard>
              <HairlineCard>
                <h3 className="font-serif text-lg text-foreground flex items-center gap-2 mb-3">
                  <FileText className="h-4 w-4 text-[color:var(--pn-gold)]" /> Essays
                </h3>
                <div className="text-center">
                  <div className="num-display text-3xl text-foreground">{student.essaysSubmitted}/{student.totalEssays}</div>
                  <div className="text-xs text-muted-foreground mt-1">Submitted</div>
                </div>
              </HairlineCard>
              <HairlineCard>
                <h3 className="font-serif text-lg text-foreground flex items-center gap-2 mb-3">
                  <GraduationCap className="h-4 w-4 text-[color:var(--pn-sage)]" /> Recommendations
                </h3>
                <div className="text-center">
                  <div className="num-display text-3xl text-foreground">{student.recommendationsSubmitted}/{student.recommendationsRequested}</div>
                  <div className="text-xs text-muted-foreground mt-1">Received</div>
                </div>
              </HairlineCard>
            </div>
            <HairlineCard variant="gold">
              <h3 className="font-serif text-xl text-foreground flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-[color:var(--pn-gold)]" /> Upcoming deadlines
              </h3>
              <div className="text-center py-2">
                <div className="num-display text-4xl text-[color:var(--pn-gold)]">{student.upcomingDeadlines}</div>
                <div className="text-xs text-muted-foreground mt-1">Tasks due in the future</div>
              </div>
            </HairlineCard>
          </TabsContent>

          <TabsContent value="essays" className="space-y-4">
            <HairlineCard>
              <h3 className="font-serif text-xl text-foreground mb-3">Essay status</h3>
              {student.totalEssays > 0 ? (
                <p className="text-sm text-muted-foreground">
                  <span className="num-display">{student.essaysSubmitted}</span> of <span className="num-display">{student.totalEssays}</span> essays completed
                </p>
              ) : (
                <p className="font-serif italic text-muted-foreground">No essays on file yet.</p>
              )}
            </HairlineCard>
          </TabsContent>
        </Tabs>

        <div className="flex gap-2 pt-4 hairline-t">
          <Button
            variant="outline"
            className="flex-1 bg-transparent hairline hover:bg-white/[0.03] text-foreground shadow-none"
            onClick={generateReport}
          >
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </DialogContent>
    )
  }

  if (loading) {
    return (
      <PageShell>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <BlurOrb tone="sage" className="top-[-100px] left-[-100px] w-[500px] h-[500px]" />

      <PageHeader
        eyebrow="Roster"
        title={<>Your list.</>}
        subtitle={
          <>
            {students.length} {students.length === 1 ? 'student' : 'students'} on your care — weighted by need.
          </>
        }
        actions={
          <Button
            variant="outline"
            size="sm"
            className="bg-transparent hairline hover:bg-white/[0.03] text-foreground shadow-none"
            onClick={handleExportStudentsPDF}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        }
      />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
        className="space-y-6"
      >
        {/* Search and Filters */}
        <motion.div variants={sectionVariants}>
          <HairlineCard>
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by name…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/[0.02] hairline focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px] bg-white/[0.02] hairline">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-pn-card hairline">
                    <SelectItem value="all">All status</SelectItem>
                    <SelectItem value="on-track">On track</SelectItem>
                    <SelectItem value="needs-attention">Needs attention</SelectItem>
                    <SelectItem value="at-risk">At risk</SelectItem>
                    <SelectItem value="not-started">Not started</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={gpaFilter} onValueChange={setGpaFilter}>
                  <SelectTrigger className="w-[130px] bg-white/[0.02] hairline">
                    <SelectValue placeholder="GPA" />
                  </SelectTrigger>
                  <SelectContent className="bg-pn-card hairline">
                    <SelectItem value="all">All GPA</SelectItem>
                    <SelectItem value="high">3.7+ High</SelectItem>
                    <SelectItem value="medium">3.0-3.7</SelectItem>
                    <SelectItem value="low">Below 3.0</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-transparent hairline hover:bg-white/[0.03] text-foreground shadow-none"
                  onClick={handleExportStudentsPDF}
                >
                  <Filter className="h-4 w-4" />
                </Button>
                <ToggleGroup type="single" value={viewMode} onValueChange={(v) => v && setViewMode(v as 'list' | 'grid')}>
                  <ToggleGroupItem
                    value="list"
                    className="hairline data-[state=on]:bg-white/[0.06] data-[state=on]:text-foreground"
                  >
                    <List className="h-4 w-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="grid"
                    className="hairline data-[state=on]:bg-white/[0.06] data-[state=on]:text-foreground"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </div>
          </HairlineCard>
        </motion.div>

        {/* List View */}
        {viewMode === 'list' && (
          <motion.div variants={sectionVariants}>
            <HairlineCard className="overflow-visible p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b border-white/[0.06]">
                    <TableHead className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Student</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">GPA</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Test</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Progress</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Essays</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Deadlines</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Status</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map(student => {
                    return (
                      <Dialog key={student.id}>
                        <DialogTrigger asChild>
                          <TableRow className="cursor-pointer hover:bg-white/[0.02] border-b border-white/[0.04]">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8 hairline">
                                  <AvatarImage src={student.avatar_url ?? undefined} />
                                  <AvatarFallback className="text-xs bg-white/[0.04] text-foreground">
                                    {student.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="text-foreground">{student.name}</div>
                                  {student.school_name && (
                                    <div className="text-xs text-muted-foreground">{student.school_name}</div>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="num-display text-foreground">{student.gpa ?? '—'}</TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {student.sat_score ? <>SAT <span className="num-display text-foreground">{student.sat_score}</span></> : student.act_score ? <>ACT <span className="num-display text-foreground">{student.act_score}</span></> : '—'}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="w-16">
                                  <AnimatedBar pct={student.completionPercentage} tone={progressTone(student.status)} />
                                </div>
                                <span className="text-sm text-muted-foreground num-display">{student.completionPercentage}%</span>
                              </div>
                            </TableCell>
                            <TableCell className="num-display text-foreground">{student.essaysSubmitted}/{student.totalEssays}</TableCell>
                            <TableCell className="num-display text-foreground">{student.upcomingDeadlines}</TableCell>
                            <TableCell>
                              <AtRiskBadge student={student} />
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-white/[0.03]"
                                onClick={e => { e.stopPropagation(); navigate(`/counselor/edit-student/${student.id}`); }}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        </DialogTrigger>
                        <StudentDialog student={student} />
                      </Dialog>
                    )
                  })}
                </TableBody>
              </Table>
            </HairlineCard>
          </motion.div>
        )}

        {/* Grid View */}
        {viewMode === 'grid' && (
          <motion.div
            variants={sectionVariants}
            className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {filteredStudents.map(student => {
              return (
                <Dialog key={student.id}>
                  <DialogTrigger asChild>
                    <div className="cursor-pointer">
                      <HairlineCard className="group hover:bg-white/[0.02] transition-colors">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12 hairline">
                              <AvatarImage src={student.avatar_url ?? undefined} />
                              <AvatarFallback className="bg-white/[0.04] text-foreground">
                                {student.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-serif text-lg text-foreground">
                                {student.name}
                              </h3>
                              <div className="text-xs text-muted-foreground">
                                {student.gpa && <>GPA <span className="num-display">{student.gpa}</span></>}
                                {student.sat_score && <> · SAT <span className="num-display">{student.sat_score}</span></>}
                                {student.act_score && <> · ACT <span className="num-display">{student.act_score}</span></>}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-white/[0.03] shrink-0"
                              onClick={e => { e.stopPropagation(); navigate(`/counselor/edit-student/${student.id}`); }}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <AtRiskBadge student={student} />
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="flex justify-between mb-2">
                            <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Application progress</span>
                            <span className="text-xs text-muted-foreground num-display">{student.completionPercentage}%</span>
                          </div>
                          <AnimatedBar pct={student.completionPercentage} tone={progressTone(student.status)} />
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                          <div className="hairline rounded-lg p-2">
                            <div className="num-display text-foreground">{student.essaysSubmitted}/{student.totalEssays}</div>
                            <div className="text-muted-foreground text-[10px] uppercase tracking-[0.14em] mt-1">Essays</div>
                          </div>
                          <div className="hairline rounded-lg p-2">
                            <div className="num-display text-foreground">{student.recommendationsSubmitted}/{student.recommendationsRequested}</div>
                            <div className="text-muted-foreground text-[10px] uppercase tracking-[0.14em] mt-1">Recs</div>
                          </div>
                          <div className="hairline rounded-lg p-2">
                            <div className="num-display text-foreground">{student.upcomingDeadlines}</div>
                            <div className="text-muted-foreground text-[10px] uppercase tracking-[0.14em] mt-1">Deadlines</div>
                          </div>
                        </div>

                        {student.school_name && (
                          <p className="text-xs text-muted-foreground mt-3 pt-3 hairline-t">
                            {student.school_name}
                          </p>
                        )}
                      </HairlineCard>
                    </div>
                  </DialogTrigger>
                  <StudentDialog student={student} />
                </Dialog>
              )
            })}
          </motion.div>
        )}

        {filteredStudents.length === 0 && !loading && (
          <motion.div variants={sectionVariants}>
            <HairlineCard variant="sage" className="text-center py-12">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-40" />
              <h3 className="font-serif text-xl text-foreground mb-2">Nothing by that name — yet.</h3>
              <p className="font-serif italic text-muted-foreground">
                {students.length === 0
                  ? 'Add your first student to begin.'
                  : 'Try loosening the filters.'}
              </p>
            </HairlineCard>
          </motion.div>
        )}
      </motion.div>
    </PageShell>
  )
}

export default Students
