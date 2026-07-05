import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { StudentEssayFeedback } from "@/components/StudentEssayFeedback";
import {
  PageShell,
  PageHeader,
  HairlineCard,
  BlurOrb,
} from "@/components/primrose-night";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  FileText,
  Calendar,
  Upload,
  MessageSquare,
  AlertCircle,
  Clock,
  Star,
  Loader2,
  MapPin,
  Trophy,
  Flame,
  Crown,
} from "lucide-react";
import { StudentTour, startStudentTour } from "@/components/StudentTour";

interface ActiveChallenge {
  id: string;
  title: string;
  theme: string;
  description: string;
  ends_at: string;
}

interface ChallengeResult {
  challengeId: string;
  challengeTitle: string;
  weekNumber: number;
  myScore: number;
  myRank: number;
  totalParticipants: number;
  winnerName: string;
  winnerScore: number;
  isWinner: boolean;
}

interface DashboardData {
  studentName: string
  avatarUrl: string | null
  applications: { completed: number; total: number }
  essays: { completed: number; total: number }
  recommendations: { completed: number; total: number }
  upcomingDeadlines: { id: string; title: string; date: string; daysLeft: number; urgency: string }[]
  pendingTasks: { id: string; task: string; due_date: string | null; color: string }[]
}

const StudentDashboard = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [challengePopup, setChallengePopup] = useState<ActiveChallenge | null>(null)
  const [resultsPopup, setResultsPopup] = useState<ChallengeResult | null>(null)

  useEffect(() => {
    fetchDashboardData()
    fetchResultsPopup()
    fetchChallengePopup()
  }, [])

  const fetchChallengePopup = async () => {
    try {
      const { data: challenges } = await supabase
        .from('weekly_challenges')
        .select('id, title, theme, description, ends_at')
        .eq('is_active', true)
        .gt('ends_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)

      const challenge = challenges?.[0]
      if (!challenge) return

      setChallengePopup(challenge)
    } catch {
      // silently ignore — popup is non-critical
    }
  }

  const dismissChallengePopup = () => {
    setChallengePopup(null)
  }

  const fetchResultsPopup = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Find closed challenges from the last 30 days
      const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString()
      const { data: closed } = await supabase
        .from('weekly_challenges')
        .select('id, title, week_number, ends_at')
        .eq('is_active', true)
        .lt('ends_at', new Date().toISOString())
        .gt('ends_at', thirtyDaysAgo)
        .order('ends_at', { ascending: false })
        .limit(3)

      if (!closed?.length) return

      for (const challenge of closed) {
        const resultsKey = `seen_results_${challenge.id}`
        if (localStorage.getItem(resultsKey)) continue

        // Check if this student submitted and was scored
        const { data: mySub } = await supabase
          .from('challenge_submissions')
          .select('id, ai_scores')
          .eq('challenge_id', challenge.id)
          .eq('student_id', user.id)
          .maybeSingle()

        if (!mySub?.ai_scores) continue

        // Fetch all scored submissions platform-wide
        const { data: allSubs } = await supabase
          .from('challenge_submissions')
          .select('id, student_id, ai_scores')
          .eq('challenge_id', challenge.id)
          .not('ai_scores', 'is', null)

        if (!allSubs?.length) continue

        const sorted = allSubs.sort((a, b) => b.ai_scores.overallScore - a.ai_scores.overallScore)

        const myRank = sorted.findIndex(s => s.id === mySub.id) + 1
        const winnerSub = sorted[0]

        const { data: winnerProfile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('user_id', winnerSub.student_id)
          .maybeSingle()

        const winnerFullName = winnerProfile?.full_name ?? 'a fellow student'
        const winnerParts = winnerFullName.trim().split(' ')
        const winnerDisplay = winnerParts.length > 1
          ? `${winnerParts[0]} ${winnerParts[winnerParts.length - 1][0]}.`
          : winnerParts[0]

        setResultsPopup({
          challengeId: challenge.id,
          challengeTitle: challenge.title,
          weekNumber: challenge.week_number,
          myScore: mySub.ai_scores.overallScore,
          myRank,
          totalParticipants: sorted.length,
          winnerName: winnerDisplay,
          winnerScore: winnerSub.ai_scores.overallScore,
          isWinner: winnerSub.id === mySub.id,
        })
        return // show one at a time
      }
    } catch {
      // non-critical — silently skip
    }
  }

  const dismissResultsPopup = () => {
    if (resultsPopup) {
      localStorage.setItem(`seen_results_${resultsPopup.challengeId}`, '1')
    }
    setResultsPopup(null)
  }

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not logged in')

      // Fetch profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('user_id', user.id)
        .single()

      // Fetch applications, essay statuses, and rec statuses in parallel
      const [{ data: apps }, { data: essayFeedbacks }, { data: recRequests }] = await Promise.all([
        supabase
          .from('applications')
          .select('school_name, application_type, deadline_date, status, required_essays, recommendations_requested')
          .eq('student_id', user.id)
          .order('deadline_date', { ascending: true }),
        supabase
          .from('essay_feedback')
          .select('id, status')
          .eq('student_id', user.id),
        supabase
          .from('recommendation_requests')
          .select('id, status')
          .eq('student_id', user.id),
      ])

      // Fetch pending tasks
      const { data: tasks } = await (supabase
        .from('tasks')
        .select('id, task, due_date, color')
        .eq('student_id', user.id)
        .eq('completed', false)
        .order('due_date', { ascending: true })
        .limit(5) as any)

      // Compute upcoming deadlines from applications
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const upcomingDeadlines = (apps || [])
        .filter(a => a.status !== 'submitted')
        .map(a => {
          const date = new Date(a.deadline_date)
          const daysLeft = Math.round((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
          return {
            id: `${a.school_name}-${a.deadline_date}`,
            title: `${a.school_name} — ${a.application_type}`,
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            daysLeft,
            urgency: daysLeft < 0 ? 'critical' : daysLeft <= 7 ? 'critical' : daysLeft <= 21 ? 'important' : 'normal',
          }
        })
        .slice(0, 5)

      setData({
        studentName: profile?.full_name?.split(' ')[0] || 'there',
        avatarUrl: profile?.avatar_url || null,
        applications: {
          completed: (apps || []).filter(a => a.status === 'submitted').length,
          total: (apps || []).length,
        },
        essays: {
          completed: (essayFeedbacks || []).filter(e => ['sent', 'read', 'approved'].includes(e.status)).length,
          total: (apps || []).reduce((sum, a) => sum + (a.required_essays ?? 0), 0),
        },
        recommendations: {
          completed: (recRequests || []).filter(r => r.status === 'sent').length,
          total: (apps || []).reduce((sum, a) => sum + (a.recommendations_requested ?? 0), 0),
        },
        upcomingDeadlines,
        pendingTasks: (tasks || []).map((t: any) => ({
          id: t.id,
          task: t.task,
          due_date: t.due_date,
          color: t.color ?? 'blue',
        })),
      })
    } catch (error: any) {
      toast({ title: 'Failed to load dashboard', description: error.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-[color:var(--pn-pink)]/15 text-[color:var(--pn-pink)] hairline'
      case 'important': return 'bg-[color:var(--pn-gold)]/15 text-[color:var(--pn-gold)] hairline'
      default: return 'bg-white/[0.03] text-muted-foreground hairline'
    }
  }

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'critical': return <AlertCircle className="h-4 w-4" />
      case 'important': return <Clock className="h-4 w-4" />
      default: return <Calendar className="h-4 w-4" />
    }
  }

  const overallProgress = data
    ? Math.round(
        ((data.applications.completed + data.essays.completed + data.recommendations.completed) /
          Math.max(data.applications.total + data.essays.total + data.recommendations.total, 1)) * 100
      )
    : 0

  if (loading) {
    return (
      <PageShell>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageShell>
    )
  }

  const progressTiers = [
    { label: 'Essays', icon: FileText, data: data?.essays, tone: 'sage' as const, color: 'var(--pn-sage)' },
    { label: 'Recommendations', icon: Star, data: data?.recommendations, tone: 'gold' as const, color: 'var(--pn-gold)' },
  ]

  return (
    <PageShell>
      <BlurOrb tone="pink" className="top-[-120px] right-[-120px] w-[520px] h-[520px]" />

      {/* Primrose Challenge popup — shown once per challenge per browser */}
      <Dialog open={!!challengePopup} onOpenChange={open => { if (!open) dismissChallengePopup() }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-amber-400 flex items-center justify-center shrink-0">
                <Trophy className="h-5 w-5 text-white" />
              </div>
              <Badge className="bg-green-100 text-green-700 border-green-200 flex items-center gap-1">
                <Flame className="h-3 w-3" /> New Challenge Live
              </Badge>
            </div>
            <DialogTitle className="text-xl">The Primrose Challenge</DialogTitle>
            <DialogDescription className="text-sm leading-relaxed pt-1">
              Write your best hook — show us your essay opening paragraph and win a prize.
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            For more information, head to the{" "}
            <button
              className="text-primary font-medium underline underline-offset-2 hover:opacity-80"
              onClick={() => { dismissChallengePopup(); navigate('/weekly-challenge') }}
            >
              Challenge section
            </button>
            .
          </p>
          <div className="flex gap-2 pt-1">
            <Button
              className="flex-1 gap-2"
              onClick={() => { dismissChallengePopup(); navigate('/weekly-challenge') }}
            >
              <Trophy className="h-4 w-4" /> Go to Challenge
            </Button>
            <Button variant="ghost" onClick={dismissChallengePopup} className="flex-1">
              Maybe Later
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Challenge results popup — shown once after challenge closes */}
      <Dialog open={!!resultsPopup} onOpenChange={open => { if (!open) dismissResultsPopup() }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              {resultsPopup?.isWinner
                ? <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shrink-0"><Crown className="h-5 w-5 text-white" /></div>
                : <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-amber-400 flex items-center justify-center shrink-0"><Trophy className="h-5 w-5 text-white" /></div>
              }
              <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">
                Challenge Results
              </Badge>
            </div>
            <DialogTitle className="text-xl">
              {resultsPopup?.isWinner ? '🏆 You won the challenge!' : 'Challenge Results Are In!'}
            </DialogTitle>
            <DialogDescription className="text-sm pt-1">{resultsPopup?.challengeTitle}</DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-1">
            {!resultsPopup?.isWinner && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                <Crown className="h-4 w-4 text-yellow-600 shrink-0" />
                <p className="text-sm text-yellow-800">
                  <span className="font-semibold">{resultsPopup?.winnerName}</span> took first place with a score of <span className="font-semibold">{resultsPopup?.winnerScore}/100</span>
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <div className="text-3xl font-bold text-primary">{resultsPopup?.myScore}</div>
                <div className="text-xs text-muted-foreground mt-0.5">Your score / 100</div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <div className="text-3xl font-bold text-foreground">
                  {resultsPopup?.myRank === 1 ? '🥇' : resultsPopup?.myRank === 2 ? '🥈' : resultsPopup?.myRank === 3 ? '🥉' : `#${resultsPopup?.myRank}`}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">of {resultsPopup?.totalParticipants} students</div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              className="flex-1 gap-2"
              onClick={() => { dismissResultsPopup(); navigate('/weekly-challenge') }}
            >
              <Trophy className="h-4 w-4" /> See Full Leaderboard
            </Button>
            <Button variant="ghost" onClick={dismissResultsPopup} className="flex-1">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <StudentTour />

      {/* Editorial hero */}
      <div id="tour-welcome" className="relative">
        <PageHeader
          eyebrow="Today"
          title={<>Good evening, {data?.studentName}.</>}
          subtitle={<>You are {overallProgress}% on track. Three moments stand between you and next week.</>}
          actions={
            <div className="flex items-center gap-4">
              <button
                onClick={startStudentTour}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors hairline rounded-full px-3 py-1.5 hover:bg-white/[0.03]"
              >
                <MapPin className="h-3 w-3" />
                Take the tour
              </button>
              <div className="text-right">
                <div className="num-display text-4xl text-foreground leading-none">{overallProgress}%</div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-1">Complete</p>
              </div>
            </div>
          }
        />
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
        className="space-y-6"
      >
        {/* Progress overview */}
        <motion.div
          id="tour-progress"
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={{
            hidden: { opacity: 0, y: 10, filter: 'blur(4px)' },
            visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.5, ease: [0.2, 0.6, 0.2, 1] } }
          }}
        >
          <HairlineCard variant="hero" className="flex items-center justify-center">
            <Button
              id="tour-add-application"
              variant="ghost"
              className="h-16 w-full flex-col gap-2 bg-transparent hairline hover:bg-white/[0.04] text-foreground"
              onClick={() => navigate('/add-application')}
            >
              <FileText className="h-5 w-5" />
              Add Application
            </Button>
          </HairlineCard>

          {progressTiers.map(({ label, icon: Icon, data: d, color }) => {
            const pct = d && d.total > 0 ? Math.round((d.completed / d.total) * 100) : 0
            return (
              <HairlineCard key={label}>
                <div className="flex items-center gap-3 mb-4">
                  <Icon className="h-5 w-5 text-foreground/60" />
                  <h3 className="font-serif text-xl text-foreground leading-none">{label}</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{d?.completed ?? 0} of {d?.total ?? 0} completed</span>
                    <span className="num-display text-foreground">{pct}%</span>
                  </div>
                  <div className="h-1 rounded-full bg-white/[0.05] overflow-hidden">
                    <motion.div
                      className="h-full"
                      style={{ background: color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.9, ease: [0.2, 0.6, 0.2, 1], delay: 0.2 }}
                    />
                  </div>
                </div>
              </HairlineCard>
            )
          })}
        </motion.div>

        {/* Two-column: deadlines + action items */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 10, filter: 'blur(4px)' },
              visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.5, ease: [0.2, 0.6, 0.2, 1] } }
            }}
          >
            <HairlineCard id="tour-deadlines">
              <div className="mb-6">
                <h2 className="font-serif text-2xl text-foreground leading-tight">What's coming for you.</h2>
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-2">Weighted by urgency</p>
              </div>
              {data?.upcomingDeadlines.length === 0 ? (
                <p className="text-sm text-muted-foreground italic py-4 font-serif">
                  Nothing on the horizon — yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {data?.upcomingDeadlines.map(deadline => (
                    <div
                      key={deadline.id}
                      className="flex items-center justify-between p-3 rounded-lg hairline hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-full ${getUrgencyColor(deadline.urgency)}`}>
                          {getUrgencyIcon(deadline.urgency)}
                        </div>
                        <div>
                          <p className="font-medium text-sm text-foreground">{deadline.title}</p>
                          <p className="text-xs text-muted-foreground">{deadline.date}</p>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        deadline.urgency === 'critical'
                          ? 'bg-[color:var(--pn-pink)]/15 text-[color:var(--pn-pink)] hairline'
                          : 'bg-white/[0.03] text-muted-foreground hairline'
                      }`}>
                        {deadline.daysLeft < 0 ? 'Overdue' : `${deadline.daysLeft}d`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </HairlineCard>
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 10, filter: 'blur(4px)' },
              visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.5, ease: [0.2, 0.6, 0.2, 1] } }
            }}
          >
            <HairlineCard>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-serif text-2xl text-foreground leading-tight">Since we last spoke.</h2>
                {(data?.pendingTasks.length ?? 0) > 0 && (
                  <span className="inline-flex items-center rounded-full hairline bg-[color:var(--pn-pink)]/10 px-2 py-0.5 text-xs text-[color:var(--pn-pink)]">
                    {data!.pendingTasks.length} pending
                  </span>
                )}
              </div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-2 mb-6">What you left for yourself</p>
              {data?.pendingTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground italic py-4 font-serif">
                  You're clear. Go write something.
                </p>
              ) : (
                <div className="space-y-2">
                  {data?.pendingTasks.map((task) => {
                    const DOT_COLOR: Record<string, string> = {
                      blue:   "bg-sky-400",
                      purple: "bg-violet-400",
                      green:  "bg-emerald-400",
                      orange: "bg-orange-400",
                      pink:   "bg-[color:var(--pn-pink)]",
                      yellow: "bg-[color:var(--pn-gold)]",
                    }
                    const dot = DOT_COLOR[task.color] ?? DOT_COLOR.blue
                    return (
                      <div key={task.id} className="flex items-start gap-3 p-3 rounded-xl hairline bg-white/[0.02]">
                        <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${dot}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground leading-snug">{task.task}</p>
                          {task.due_date && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Due: {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
              <div className="mt-4 pt-3 hairline-t">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs text-muted-foreground hover:text-foreground hover:bg-white/[0.03]"
                  onClick={() => navigate('/student-personal-area?tab=tasks')}
                >
                  Manage all tasks in My Work →
                </Button>
              </div>
            </HairlineCard>
          </motion.div>
        </div>

        {/* Essay Feedback from Counselor */}
        <motion.div
          id="tour-essay-feedback"
          variants={{
            hidden: { opacity: 0, y: 10, filter: 'blur(4px)' },
            visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.5, ease: [0.2, 0.6, 0.2, 1] } }
          }}
        >
          <StudentEssayFeedback />
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 10, filter: 'blur(4px)' },
            visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.5, ease: [0.2, 0.6, 0.2, 1] } }
          }}
        >
          <HairlineCard id="tour-quick-actions">
            <div className="mb-6">
              <h2 className="font-serif text-2xl text-foreground leading-tight">Where to next.</h2>
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-2">Two quick moves</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button
                id="tour-upload-essay"
                variant="ghost"
                className="h-16 flex-col gap-2 hairline bg-transparent hover:bg-white/[0.03] text-foreground"
                onClick={() => navigate('/submit-essay')}
              >
                <Upload className="h-5 w-5" />
                Upload Essay
              </Button>
              <Button
                variant="ghost"
                className="h-16 flex-col gap-2 hairline bg-transparent hover:bg-white/[0.03] text-foreground"
                onClick={() => navigate('/student-messages')}
              >
                <MessageSquare className="h-5 w-5" />
                Message Counselor
              </Button>
            </div>
          </HairlineCard>
        </motion.div>
      </motion.div>
    </PageShell>
  )
}

export default StudentDashboard
