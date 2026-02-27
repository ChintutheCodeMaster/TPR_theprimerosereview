import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Mail,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Target,
  CalendarCheck,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { useCounselorInsights } from "@/hooks/useCouncelorInsights";

const tooltipStyle = {
  contentStyle: {
    backgroundColor: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "8px",
  },
};

const LoadingSkeleton = () => (
  <div className="space-y-6">
    <Skeleton className="h-8 w-48" />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Skeleton className="h-64 w-full rounded-xl" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Skeleton className="h-48 w-full rounded-xl" />
      <Skeleton className="h-48 w-full rounded-xl" />
    </div>
  </div>
);

export const CounselorInsights = () => {
  const { data, isLoading } = useCounselorInsights();

  if (isLoading) return <LoadingSkeleton />;

  const rec  = data?.recommendations ?? { pending: 0, inProgress: 0, sent: 0, total: 0 };
  const apps = data?.applications    ?? { submitted: 0, inProgress: 0, notStarted: 0, total: 0 };
  const actionItems = data?.actionItems ?? [];

  const recommendationPieData = [
    { name: "Sent",        value: rec.sent,       color: "hsl(var(--success))"  },
    { name: "In Progress", value: rec.inProgress,  color: "hsl(var(--primary))" },
    { name: "Pending",     value: rec.pending,     color: "hsl(var(--warning))" },
  ];

  const weeklyBarData = [
    { name: "Essays in review",    value: actionItems.find((a) => a.label.includes("Essays"))?.count   ?? 0 },
    // { name: "Meetings",  value: actionItems.find((a) => a.label.includes("meetings"))?.count ?? 0 },
    { name: "Deadlines", value: actionItems.find((a) => a.label.includes("Deadlines"))?.count ?? 0 },
    { name: "Recs",      value: rec.sent },
  ];

  const safePct = (num: number, den: number) =>
    den > 0 ? Math.round((num / den) * 100) : 0;

  const submittedPct  = safePct(apps.submitted,  apps.total);
  const inProgressPct = safePct(apps.inProgress, apps.total);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Counselor Overview</h2>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recommendations Pie */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/20">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">
              Recommendation Letters Status
            </h3>
          </div>

          {rec.total === 0 ? (
            <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
              No recommendation requests yet.
            </div>
          ) : (
            <div className="flex items-center justify-center gap-8">
              <div className="h-48 w-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={recommendationPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {recommendationPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip {...tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                {recommendationPieData.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                    <span className="font-bold text-foreground">{item.value}</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-border">
                  <span className="text-sm text-muted-foreground">Total: </span>
                  <span className="font-bold text-foreground">{rec.total}</span>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Weekly Activity Bar */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-accent">
              <Target className="h-5 w-5 text-accent-foreground" />
            </div>
            <h3 className="font-semibold text-foreground">Current Activity</h3>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyBarData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={80}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip {...tooltipStyle} cursor={{ fill: "hsl(var(--muted))" }} />
                <Bar
                  dataKey="value"
                  fill="hsl(var(--primary))"
                  radius={[0, 4, 4, 0]}
                  barSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Stats cards row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Applications Progress */}
        <Card className="p-5 bg-gradient-to-br from-secondary/5 to-secondary/10 border-secondary/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-secondary/20">
              <GraduationCap className="h-5 w-5 text-secondary-foreground" />
            </div>
            <h3 className="font-semibold text-foreground">Applications Progress</h3>
          </div>

          {apps.total === 0 ? (
            <p className="text-sm text-muted-foreground">No applications yet.</p>
          ) : (
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-muted-foreground">Submitted</span>
                  <span className="text-sm font-semibold text-success">
                    {apps.submitted}
                  </span>
                </div>
                <Progress value={submittedPct} className="h-2 bg-muted" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-muted-foreground">In Progress</span>
                  <span className="text-sm font-semibold text-primary">
                    {apps.inProgress}
                  </span>
                </div>
                <Progress value={inProgressPct} className="h-2 bg-muted" />
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-border">
                <span className="text-sm text-muted-foreground">Not Started</span>
                <span className="text-sm font-semibold text-destructive">
                  {apps.notStarted}
                </span>
              </div>
            </div>
          )}
        </Card>

        {/* Action Items */}
        <Card className="p-5 bg-gradient-to-br from-muted/50 to-muted border-muted-foreground/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-muted-foreground/20">
              <CalendarCheck className="h-5 w-5 text-foreground" />
            </div>
            <h3 className="font-semibold text-foreground">Action Items</h3>
          </div>
          <div className="space-y-2">
            {actionItems.map((task, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-2 rounded-lg bg-background/50"
              >
                <div className="flex items-center gap-2">
                  {task.urgent ? (
                    <AlertCircle className="h-4 w-4 text-destructive" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-sm text-foreground">{task.label}</span>
                </div>
                <span
                  className={`font-bold ${
                    task.urgent ? "text-destructive" : "text-foreground"
                  }`}
                >
                  {task.count}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};