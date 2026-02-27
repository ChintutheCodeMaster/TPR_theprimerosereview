import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  TrendingUp,
  Users,
  FileText,
  Clock,
  Star,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { useEssayAnalytics } from "@/hooks/useEssayAnalytics";

const PIE_COLORS = [
  "hsl(142, 76%, 36%)",
  "hsl(38, 92%, 50%)",
  "hsl(var(--primary))",
  "hsl(var(--muted-foreground))",
];

const EssayAnalytics = () => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useEssayAnalytics();

  // ── Loading ────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────
  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-96 gap-3 text-destructive">
        <AlertCircle className="h-6 w-6" />
        <p>Failed to load analytics. Please refresh and try again.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/essays")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Essays
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Essay Analytics</h1>
          <p className="text-muted-foreground">
            Performance insights and trends across all essays
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Essays</p>
                <p className="text-2xl font-bold text-foreground">{data.totalEssays}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg AI Score</p>
                <p className="text-2xl font-bold text-foreground">
                  {data.avgScore !== null ? data.avgScore : "—"}
                </p>
                {data.avgScore === null && (
                  <p className="text-xs text-muted-foreground">No scored essays yet</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold text-foreground">{data.pendingReview}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Students</p>
                <p className="text-2xl font-bold text-foreground">{data.activeStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              Score Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.scoreDistribution.every((d) => d.count === 0) ? (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
                No scored essays yet — AI analysis needed
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data.scoreDistribution}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="range" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Essay Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.statusData.length === 0 ? (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
                No essays yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={data.statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {data.statusData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Progress Over Time */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Progress Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.progressOverTime.length === 0 ? (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
              Not enough data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.progressOverTime}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 12 }}
                  domain={[0, 100]}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="avgScore"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  name="Avg Score"
                  dot={{ fill: "hsl(var(--primary))" }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="essaysSubmitted"
                  stroke="hsl(142, 76%, 36%)"
                  strokeWidth={2}
                  name="Essays Submitted"
                  dot={{ fill: "hsl(142, 76%, 36%)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.topPerformers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No scored essays yet
              </div>
            ) : (
              <div className="space-y-4">
                {data.topPerformers.map((student, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{student.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {student.essay}
                      </p>
                    </div>
                    <div className="text-lg font-bold text-green-600">{student.score}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Needs Attention */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Needs Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.needsAttention.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                🎉 All essays have been reviewed!
              </div>
            ) : (
              <div className="space-y-3">
                {data.needsAttention.map((student, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-destructive/5 rounded-lg border border-destructive/20"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{student.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {student.essay}
                      </p>
                    </div>
                    <div className="text-lg font-bold text-destructive">
                      {student.score !== null ? student.score : "—"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EssayAnalytics;