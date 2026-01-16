import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, TrendingUp, Users, FileText, Clock, Star, AlertCircle, CheckCircle } from "lucide-react";
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
  Legend
} from "recharts";

const scoreDistribution = [
  { range: '90-100', count: 4, color: 'hsl(var(--success))' },
  { range: '80-89', count: 8, color: 'hsl(var(--primary))' },
  { range: '70-79', count: 6, color: 'hsl(var(--warning))' },
  { range: '60-69', count: 4, color: 'hsl(var(--destructive))' },
  { range: 'Below 60', count: 2, color: 'hsl(var(--muted))' },
];

const statusData = [
  { name: 'Submitted', value: 8, color: 'hsl(var(--success))' },
  { name: 'In Review', value: 10, color: 'hsl(var(--warning))' },
  { name: 'Draft', value: 4, color: 'hsl(var(--muted))' },
  { name: 'Needs Attention', value: 2, color: 'hsl(var(--destructive))' },
];

const progressOverTime = [
  { week: 'Week 1', avgScore: 68, essaysSubmitted: 3 },
  { week: 'Week 2', avgScore: 72, essaysSubmitted: 5 },
  { week: 'Week 3', avgScore: 75, essaysSubmitted: 8 },
  { week: 'Week 4', avgScore: 79, essaysSubmitted: 12 },
  { week: 'Week 5', avgScore: 82, essaysSubmitted: 18 },
  { week: 'Week 6', avgScore: 84, essaysSubmitted: 24 },
];

const essayTypeBreakdown = [
  { type: 'Common App', count: 12, avgScore: 81 },
  { type: 'Supplemental', count: 8, avgScore: 85 },
  { type: 'UCAS', count: 2, avgScore: 78 },
  { type: 'Scholarship', count: 2, avgScore: 88 },
];

const topPerformers = [
  { name: 'Priya Sharma', essay: 'Yale Supplemental', score: 91 },
  { name: 'Marcus Johnson', essay: 'Why Stanford Essay', score: 88 },
  { name: 'Emma Thompson', essay: 'Common App Personal Statement', score: 82 },
];

const needsAttention = [
  { name: 'Sophia Chen', essay: 'Common App - Overcoming Challenges', score: 65, daysOverdue: 3 },
  { name: 'Jordan Williams', essay: 'Common App - Meaningful Activity', score: 72, daysOverdue: 0 },
];

const EssayAnalytics = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/essays')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Essays
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Essay Analytics</h1>
          <p className="text-muted-foreground">Performance insights and trends across all essays</p>
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
                <p className="text-2xl font-bold text-foreground">24</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Score</p>
                <p className="text-2xl font-bold text-foreground">82</p>
                <p className="text-xs text-success">+6% from last month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold text-foreground">10</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-ai-accent/10 rounded-lg">
                <Users className="h-5 w-5 text-ai-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Students</p>
                <p className="text-2xl font-bold text-foreground">12</p>
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
              <Star className="h-5 w-5 text-ai-accent" />
              Score Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={scoreDistribution}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="range" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              Essay Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
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
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={progressOverTime}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="week" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 12 }} domain={[60, 100]} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
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
                dot={{ fill: 'hsl(var(--primary))' }}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="essaysSubmitted" 
                stroke="hsl(var(--ai-accent))" 
                strokeWidth={2}
                name="Essays Submitted"
                dot={{ fill: 'hsl(var(--ai-accent))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Essay Type Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              By Essay Type
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {essayTypeBreakdown.map((item) => (
              <div key={item.type} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{item.type}</span>
                  <span className="text-muted-foreground">{item.count} essays • Avg: {item.avgScore}</span>
                </div>
                <Progress value={item.avgScore} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-warning" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topPerformers.map((student, index) => (
              <div key={student.name} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{student.name}</p>
                  <p className="text-xs text-muted-foreground">{student.essay}</p>
                </div>
                <div className="text-lg font-bold text-success">{student.score}</div>
              </div>
            ))}
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
          <CardContent className="space-y-4">
            {needsAttention.map((student) => (
              <div key={student.name} className="flex items-center gap-3 p-3 bg-destructive/5 rounded-lg border border-destructive/20">
                <div className="flex-1">
                  <p className="font-medium text-sm">{student.name}</p>
                  <p className="text-xs text-muted-foreground">{student.essay}</p>
                  {student.daysOverdue > 0 && (
                    <p className="text-xs text-destructive mt-1">{student.daysOverdue} days overdue</p>
                  )}
                </div>
                <div className="text-lg font-bold text-destructive">{student.score}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EssayAnalytics;
