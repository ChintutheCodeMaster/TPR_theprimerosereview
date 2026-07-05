import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  PageShell,
  PageHeader,
  HairlineCard,
  BlurOrb,
} from "@/components/primrose-night";
import {
  BarChart3,
  TrendingUp,
  Users,
  FileText,
  CheckCircle,
  Clock,
  Target,
  ArrowRight,
  Sparkles,
  Trophy,
  Flame,
  Star,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useStudentStats } from "@/hooks/useStudentStats";

// ── Sub-components ────────────────────────────────────────────

const CircularProgress = ({
  percentage,
  size = 180,
  strokeWidth = 10,
}: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#pnProgressGradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.9, ease: [0.2, 0.6, 0.2, 1] }}
        />
        <defs>
          <linearGradient id="pnProgressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--pn-pink)" />
            <stop offset="100%" stopColor="var(--pn-sage)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="num-display text-4xl text-foreground leading-none">{percentage}%</span>
        <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-2">Complete</span>
      </div>
    </div>
  );
};

const ComparisonBar = ({
  label,
  myValue,
  schoolValue,
  icon: Icon,
}: {
  label: string;
  myValue: number;
  schoolValue: number;
  icon: React.ElementType;
}) => {
  const above = myValue >= schoolValue;
  const barColor = above ? "var(--pn-sage)" : "var(--pn-gold)";
  const textColor = above ? "text-[color:var(--pn-sage)]" : "text-[color:var(--pn-gold)]";
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-foreground/60" />
          <span className="text-foreground">{label}</span>
        </div>
        <div className="text-sm">
          <span className={`num-display ${textColor}`}>{myValue}%</span>
          <span className="text-muted-foreground"> vs </span>
          <span className="num-display text-muted-foreground">{schoolValue}%</span>
          <span className="text-muted-foreground text-xs"> avg</span>
        </div>
      </div>

      <div className="relative h-6 bg-white/[0.03] hairline rounded-lg overflow-hidden">
        {/* School average marker */}
        <div
          className="absolute top-0 bottom-0 w-px bg-white/40 z-10"
          style={{ left: `${schoolValue}%` }}
        />
        {/* My progress bar */}
        <motion.div
          className="h-full"
          style={{ background: barColor }}
          initial={{ width: 0 }}
          animate={{ width: `${myValue}%` }}
          transition={{ duration: 0.9, ease: [0.2, 0.6, 0.2, 1], delay: 0.15 }}
        />
      </div>

      <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground text-right">
        School avg: {schoolValue}%
      </p>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────

const StudentStats = () => {
  const navigate = useNavigate();
  const {
    stats,
    profile,
    milestones,
    myPct,
    overallProgress,
    isLoadingStats,
    isLoadingMilestones,
    statsError,
    completeMilestone,
  } = useStudentStats();

  const firstName = profile?.full_name?.split(" ")[0] ?? "there";

  // Achievements are computed from real stats
  const achievements = [
    ...(myPct.essays >= 60
      ? [{ icon: Flame, label: "Essay Momentum", tone: "gold" as const }]
      : []),
    ...(stats && stats.my_applications_submitted > 0
      ? [{ icon: Trophy, label: "Early Bird", tone: "gold" as const }]
      : []),
    ...(myPct.essays === 100
      ? [{ icon: Star, label: "Essay Master", tone: "pink" as const }]
      : []),
  ];

  const toneVar = (t: "sage" | "pink" | "gold") =>
    t === "sage" ? "var(--pn-sage)" : t === "pink" ? "var(--pn-pink)" : "var(--pn-gold)";

  // Loading state
  if (isLoadingStats) {
    return (
      <PageShell>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageShell>
    );
  }

  // Error state
  if (statsError) {
    return (
      <PageShell>
        <div className="flex items-center justify-center h-96 gap-3 text-[color:var(--pn-pink)]">
          <AlertCircle className="h-6 w-6" />
          <p className="font-serif italic">Failed to load stats. Please refresh and try again.</p>
        </div>
      </PageShell>
    );
  }

  const sectionVariants = {
    hidden: { opacity: 0, y: 10, filter: 'blur(4px)' },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.5, ease: [0.2, 0.6, 0.2, 1] } },
  };

  return (
    <PageShell>
      <BlurOrb tone="gold" className="top-[-100px] right-[-100px] w-[500px] h-[500px]" />

      <PageHeader
        eyebrow="Where you stand"
        title={<>Your progress, in context.</>}
        subtitle={
          stats && stats.school_rank_pct > 0
            ? <>Ahead of {stats.school_rank_pct}% of students at your school.</>
            : <>Complete more to see how you compare with your school.</>
        }
      />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
        className="space-y-6"
      >
        {/* ── Hero focal card ── */}
        <motion.div variants={sectionVariants}>
          <HairlineCard variant="hero" className="p-8 md:p-10 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle,rgba(212,182,120,0.15),transparent_70%)] rounded-full blur-3xl -translate-y-1/3 translate-x-1/4 pointer-events-none" />
            <div className="relative flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0">
                <CircularProgress percentage={overallProgress} />
              </div>

              <div className="flex-1 text-center md:text-left space-y-4">
                <div>
                  <h2 className="font-serif text-3xl text-foreground leading-tight">
                    {overallProgress >= 50
                      ? <>You're doing great, {firstName}.</>
                      : <>Keep going, {firstName}.</>}
                  </h2>
                  <p className="font-serif italic text-muted-foreground mt-2">
                    {overallProgress >= 50
                      ? "The list is moving. Stay with it."
                      : "The first draft is always the hardest one."}
                  </p>
                </div>

                {achievements.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    {achievements.map((achievement, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hairline"
                        style={{ backgroundColor: `color-mix(in oklab, ${toneVar(achievement.tone)} 12%, transparent)` }}
                      >
                        <achievement.icon className="h-4 w-4" style={{ color: toneVar(achievement.tone) }} />
                        <span className="text-sm" style={{ color: toneVar(achievement.tone) }}>
                          {achievement.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </HairlineCard>
        </motion.div>

        {/* ── Next action CTA ── */}
        <motion.div variants={sectionVariants}>
          <HairlineCard variant="pink" className="relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 pointer-events-none">
              <div className="w-16 h-16 rounded-full hairline bg-[color:var(--pn-pink)]/15 flex items-center justify-center animate-slow-pulse">
                <Sparkles className="h-8 w-8 text-[color:var(--pn-pink)]" />
              </div>
            </div>

            <div className="pr-24">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs hairline bg-[color:var(--pn-pink)]/10 text-[color:var(--pn-pink)] mb-4">
                <Clock className="h-3 w-3" />
                Next Step
              </span>

              {myPct.essays < 100 ? (
                <>
                  <h3 className="font-serif text-2xl text-foreground mb-2 leading-tight">
                    Finalize your essays.
                  </h3>
                  <p className="text-muted-foreground mb-5">
                    You're <span className="num-display text-foreground">{myPct.essays}%</span> done. Momentum matters more than perfect.
                  </p>
                  <Button
                    onClick={() => navigate("/student-personal-area")}
                    className="bg-transparent hairline hover:bg-white/[0.04] text-foreground shadow-none group-hover:translate-x-1 transition-transform"
                  >
                    Continue Working
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </>
              ) : myPct.applications < 100 ? (
                <>
                  <h3 className="font-serif text-2xl text-foreground mb-2 leading-tight">
                    Submit your applications.
                  </h3>
                  <p className="text-muted-foreground mb-5">
                    Essays done. The names are waiting.
                  </p>
                  <Button
                    onClick={() => navigate("/student-dashboard")}
                    className="bg-transparent hairline hover:bg-white/[0.04] text-foreground shadow-none group-hover:translate-x-1 transition-transform"
                  >
                    View Applications
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <h3 className="font-serif text-2xl text-foreground mb-2 leading-tight">
                    You're all caught up.
                  </h3>
                  <p className="text-muted-foreground mb-5">
                    Rare and earned. Check back for any word from your counselor.
                  </p>
                  <Button
                    onClick={() => navigate("/student-dashboard")}
                    className="bg-transparent hairline hover:bg-white/[0.04] text-foreground shadow-none group-hover:translate-x-1 transition-transform"
                  >
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </HairlineCard>
        </motion.div>

        {/* ── Summary cards ── */}
        <motion.div variants={sectionVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: CheckCircle,
              tone: "sage" as const,
              value: `${stats?.my_essays_completed ?? 0}/${stats?.my_essays_total ?? 0}`,
              label: "Essays Completed",
              flag: stats && myPct.essays > (stats.school_avg_essays_pct ?? 0)
                ? { icon: TrendingUp, text: "Above Average", tone: "sage" as const }
                : null,
            },
            {
              icon: FileText,
              tone: "pink" as const,
              value: `${stats?.my_applications_submitted ?? 0}/${stats?.my_applications_total ?? 0}`,
              label: "Applications Submitted",
              flag: stats && myPct.applications < (stats.school_avg_applications_pct ?? 0)
                ? { icon: Clock, text: "Keep Going", tone: "gold" as const }
                : null,
            },
            {
              icon: Users,
              tone: "gold" as const,
              value: `${stats?.my_recommendations_sent ?? 0}/${stats?.my_recommendations_total ?? 0}`,
              label: "Recommendations",
              flag: stats && myPct.recommendations > (stats.school_avg_recommendations_pct ?? 0)
                ? { icon: TrendingUp, text: "Above Average", tone: "sage" as const }
                : null,
            },
          ].map(({ icon: Icon, tone, value, label, flag }) => (
            <HairlineCard key={label} className="text-center">
              <div className="flex justify-center mb-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center hairline"
                  style={{ backgroundColor: `color-mix(in oklab, ${toneVar(tone)} 12%, transparent)` }}
                >
                  <Icon className="h-6 w-6" style={{ color: toneVar(tone) }} />
                </div>
              </div>
              <p className="num-display text-3xl text-foreground">{value}</p>
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-2">{label}</p>
              {flag && (
                <div className="mt-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs hairline"
                     style={{
                       backgroundColor: `color-mix(in oklab, ${toneVar(flag.tone)} 12%, transparent)`,
                       color: toneVar(flag.tone),
                     }}>
                  <flag.icon className="h-3 w-3" />
                  {flag.text}
                </div>
              )}
            </HairlineCard>
          ))}
        </motion.div>

        {/* ── Comparison bars ── */}
        <motion.div variants={sectionVariants}>
          <HairlineCard>
            <div className="mb-6 flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-foreground/60" />
              <div>
                <h2 className="font-serif text-2xl text-foreground leading-tight">Where you stand, in numbers.</h2>
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-2">You vs the school average</p>
              </div>
            </div>

            <div className="space-y-8">
              <ComparisonBar
                label="Essays Completion"
                myValue={myPct.essays}
                schoolValue={stats?.school_avg_essays_pct ?? 0}
                icon={FileText}
              />
              <ComparisonBar
                label="Applications Submitted"
                myValue={myPct.applications}
                schoolValue={stats?.school_avg_applications_pct ?? 0}
                icon={CheckCircle}
              />
              <ComparisonBar
                label="Recommendations Ready"
                myValue={myPct.recommendations}
                schoolValue={stats?.school_avg_recommendations_pct ?? 0}
                icon={Users}
              />
            </div>
          </HairlineCard>
        </motion.div>

        {/* ── Milestones ── */}
        <motion.div variants={sectionVariants}>
          <HairlineCard>
            <div className="mb-6 flex items-center gap-3">
              <Target className="h-5 w-5 text-foreground/60" />
              <div>
                <h2 className="font-serif text-2xl text-foreground leading-tight">The list, in order.</h2>
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-2">Milestones your counselor set</p>
              </div>
            </div>

            {isLoadingMilestones ? (
              <div className="flex items-center justify-center h-24">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : milestones.length === 0 ? (
              <p className="font-serif italic text-muted-foreground text-center py-8">
                Nothing set yet. Your counselor is drafting.
              </p>
            ) : (
              <div className="space-y-3">
                {milestones.map((milestone, index) => (
                  <div
                    key={milestone.id}
                    className={`flex items-center gap-4 p-4 rounded-lg hairline transition-colors ${
                      milestone.completed
                        ? "bg-[color:var(--pn-sage)]/8"
                        : "bg-white/[0.02] hover:bg-white/[0.04]"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 hairline ${
                        milestone.completed
                          ? "bg-[color:var(--pn-sage)]/15 text-[color:var(--pn-sage)]"
                          : "bg-white/[0.03] text-muted-foreground"
                      }`}
                    >
                      {milestone.completed ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <span className="num-display text-sm">{index + 1}</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={milestone.completed ? "text-[color:var(--pn-sage)]" : "text-foreground"}>
                        {milestone.label}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {milestone.completed
                          ? `Completed ${
                              milestone.completed_at
                                ? new Date(milestone.completed_at).toLocaleDateString()
                                : ""
                            }`
                          : milestone.due_date
                          ? `Due: ${new Date(milestone.due_date).toLocaleDateString()}`
                          : "No due date set"}
                      </p>
                    </div>

                    {milestone.completed ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs hairline bg-[color:var(--pn-sage)]/15 text-[color:var(--pn-sage)]">Done</span>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="hairline hover:bg-white/[0.04] text-foreground shadow-none"
                        disabled={completeMilestone.isPending}
                        onClick={() => completeMilestone.mutate(milestone.id)}
                      >
                        Mark Done
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </HairlineCard>
        </motion.div>
      </motion.div>
    </PageShell>
  );
};

export default StudentStats;