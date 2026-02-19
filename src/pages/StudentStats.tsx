import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  strokeWidth = 12,
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
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-secondary"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
            transition: "stroke-dashoffset 1s ease-out",
          }}
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(142, 76%, 36%)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold text-foreground">{percentage}%</span>
        <span className="text-sm text-muted-foreground">Complete</span>
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
}) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-primary" />
        <span className="font-medium text-foreground">{label}</span>
      </div>
      <div className="text-sm">
        <span
          className={
            myValue >= schoolValue
              ? "text-green-600 font-semibold"
              : "text-yellow-600 font-semibold"
          }
        >
          {myValue}%
        </span>
        <span className="text-muted-foreground"> vs </span>
        <span className="text-muted-foreground">{schoolValue}% avg</span>
      </div>
    </div>

    <div className="relative h-8 bg-secondary/50 rounded-lg overflow-hidden">
      {/* School average marker */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-muted-foreground/50 z-10"
        style={{ left: `${schoolValue}%` }}
      />
      {/* My progress bar */}
      <div
        className={`h-full transition-all duration-500 ${
          myValue >= schoolValue ? "bg-green-500" : "bg-yellow-500"
        }`}
        style={{ width: `${myValue}%` }}
      />
    </div>

    <p className="text-xs text-muted-foreground text-right">
      School avg: {schoolValue}%
    </p>
  </div>
);

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
      ? [{ icon: Flame, label: "Essay Momentum", color: "text-orange-500", bg: "bg-orange-100" }]
      : []),
    ...(stats && stats.my_applications_submitted > 0
      ? [{ icon: Trophy, label: "Early Bird", color: "text-yellow-500", bg: "bg-yellow-100" }]
      : []),
    ...(myPct.essays === 100
      ? [{ icon: Star, label: "Essay Master", color: "text-purple-500", bg: "bg-purple-100" }]
      : []),
  ];

  // Loading state
  if (isLoadingStats) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Error state
  if (statsError) {
    return (
      <div className="flex items-center justify-center h-96 gap-3 text-destructive">
        <AlertCircle className="h-6 w-6" />
        <p>Failed to load stats. Please refresh and try again.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* ── Hero ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

        <div className="relative flex flex-col md:flex-row items-center gap-8">
          <div className="flex-shrink-0">
            <CircularProgress percentage={overallProgress} />
          </div>

          <div className="flex-1 text-center md:text-left space-y-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {overallProgress >= 50
                  ? `You're doing great, ${firstName}! 🎉`
                  : `Keep going, ${firstName}! 💪`}
              </h1>
              <p className="text-muted-foreground mt-1">
                {stats && stats.school_rank_pct > 0
                  ? `You're ahead of ${stats.school_rank_pct}% of students at your school`
                  : "Complete more to see how you compare with your school"}
              </p>
            </div>

            {achievements.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {achievements.map((achievement, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${achievement.bg}`}
                  >
                    <achievement.icon className={`h-4 w-4 ${achievement.color}`} />
                    <span className={`text-sm font-medium ${achievement.color}`}>
                      {achievement.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Next action CTA ── */}
      <Card className="relative overflow-hidden border-2 border-primary/30 bg-gradient-to-r from-primary/5 to-transparent hover:border-primary/50 transition-all duration-300 group">
        <div className="absolute top-0 right-0 p-4">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
        </div>

        <div className="p-6 pr-24">
          <Badge variant="secondary" className="mb-3 bg-primary/20 text-primary border-0">
            <Clock className="h-3 w-3 mr-1" />
            Next Step
          </Badge>

          {myPct.essays < 100 ? (
            <>
              <h3 className="text-xl font-bold text-foreground mb-1">
                Finalize your essays
              </h3>
              <p className="text-muted-foreground mb-4">
                You're {myPct.essays}% done. Keep the momentum going!
              </p>
              <Button
                onClick={() => navigate("/student-personal-area")}
                className="group-hover:translate-x-1 transition-transform"
              >
                Continue Working
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </>
          ) : myPct.applications < 100 ? (
            <>
              <h3 className="text-xl font-bold text-foreground mb-1">
                Submit your applications
              </h3>
              <p className="text-muted-foreground mb-4">
                Essays done — time to submit your applications!
              </p>
              <Button
                onClick={() => navigate("/student-dashboard")}
                className="group-hover:translate-x-1 transition-transform"
              >
                View Applications
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <h3 className="text-xl font-bold text-foreground mb-1">
                You're all caught up! 🎉
              </h3>
              <p className="text-muted-foreground mb-4">
                Great work. Check back for any updates from your counselor.
              </p>
              <Button
                onClick={() => navigate("/student-dashboard")}
                className="group-hover:translate-x-1 transition-transform"
              >
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </Card>

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 text-center hover:shadow-lg transition-shadow">
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground">
            {stats?.my_essays_completed ?? 0}/{stats?.my_essays_total ?? 0}
          </p>
          <p className="text-muted-foreground">Essays Completed</p>
          {stats && myPct.essays > (stats.school_avg_essays_pct ?? 0) && (
            <Badge variant="secondary" className="mt-2 bg-green-100 text-green-700">
              <TrendingUp className="h-3 w-3 mr-1" />
              Above Average
            </Badge>
          )}
        </Card>

        <Card className="p-6 text-center hover:shadow-lg transition-shadow">
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground">
            {stats?.my_applications_submitted ?? 0}/{stats?.my_applications_total ?? 0}
          </p>
          <p className="text-muted-foreground">Applications Submitted</p>
          {stats && myPct.applications < (stats.school_avg_applications_pct ?? 0) && (
            <Badge variant="secondary" className="mt-2 bg-yellow-100 text-yellow-700">
              <Clock className="h-3 w-3 mr-1" />
              Keep Going!
            </Badge>
          )}
        </Card>

        <Card className="p-6 text-center hover:shadow-lg transition-shadow">
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground">
            {stats?.my_recommendations_sent ?? 0}/{stats?.my_recommendations_total ?? 0}
          </p>
          <p className="text-muted-foreground">Recommendations</p>
          {stats && myPct.recommendations > (stats.school_avg_recommendations_pct ?? 0) && (
            <Badge variant="secondary" className="mt-2 bg-green-100 text-green-700">
              <TrendingUp className="h-3 w-3 mr-1" />
              Above Average
            </Badge>
          )}
        </Card>
      </div>

      {/* ── Comparison bars ── */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Your Progress vs School Average
        </h2>

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
      </Card>

      {/* ── Milestones ── */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Application Milestones
        </h2>

        {isLoadingMilestones ? (
          <div className="flex items-center justify-center h-24">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : milestones.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No milestones set yet. Your counselor will add them soon.
          </p>
        ) : (
          <div className="space-y-4">
            {milestones.map((milestone, index) => (
              <div
                key={milestone.id}
                className={`flex items-center gap-4 p-4 rounded-lg transition-all duration-200 hover:scale-[1.01] ${
                  milestone.completed
                    ? "bg-green-50 border border-green-200"
                    : "bg-secondary/30"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    milestone.completed
                      ? "bg-green-500 text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {milestone.completed ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>

                <div className="flex-1">
                  <p
                    className={`font-medium ${
                      milestone.completed ? "text-green-700" : "text-foreground"
                    }`}
                  >
                    {milestone.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
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
                  <Badge className="bg-green-500 text-white">Done</Badge>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
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
      </Card>
    </div>
  );
};

export default StudentStats;