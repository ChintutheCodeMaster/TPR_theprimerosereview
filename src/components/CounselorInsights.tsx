import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Mail, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  GraduationCap,
  Target,
  CalendarCheck
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";

export const CounselorInsights = () => {
  // Mock data for counselor insights
  const recommendationStats = {
    pending: 8,
    inProgress: 5,
    sent: 23,
    total: 36
  };

  const applicationProgress = {
    submitted: 45,
    inProgress: 67,
    notStarted: 44,
    total: 156
  };

  const weeklyActivity = {
    essaysReviewed: 12,
    meetingsHeld: 8,
    messagesExchanged: 34,
    deadlinesMet: 15
  };

  const upcomingTasks = [
    { label: "Recommendations to complete", count: 5, urgent: true },
    { label: "Deadlines this week", count: 7, urgent: true },
    { label: "Scheduled meetings", count: 3, urgent: false },
    { label: "Essays pending review", count: 9, urgent: false }
  ];

  // Pie chart data for recommendations
  const recommendationPieData = [
    { name: "Sent", value: recommendationStats.sent, color: "hsl(var(--success))" },
    { name: "In Progress", value: recommendationStats.inProgress, color: "hsl(var(--primary))" },
    { name: "Pending", value: recommendationStats.pending, color: "hsl(var(--warning))" }
  ];

  // Bar chart data for weekly activity
  const weeklyBarData = [
    { name: "Essays", value: weeklyActivity.essaysReviewed, fill: "hsl(var(--primary))" },
    { name: "Meetings", value: weeklyActivity.meetingsHeld, fill: "hsl(var(--secondary))" },
    { name: "Messages", value: weeklyActivity.messagesExchanged, fill: "hsl(var(--accent))" },
    { name: "Deadlines", value: weeklyActivity.deadlinesMet, fill: "hsl(var(--success))" }
  ];

  const submittedPercent = Math.round((applicationProgress.submitted / applicationProgress.total) * 100);
  const inProgressPercent = Math.round((applicationProgress.inProgress / applicationProgress.total) * 100);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Counselor Overview</h2>
      
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recommendations Pie Chart */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/20">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Recommendation Letters Status</h3>
          </div>
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
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
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
                <span className="font-bold text-foreground">{recommendationStats.total}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Weekly Activity Bar Chart */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-accent">
              <Target className="h-5 w-5 text-accent-foreground" />
            </div>
            <h3 className="font-semibold text-foreground">This Week's Activity</h3>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyBarData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={80}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  cursor={{ fill: 'hsl(var(--muted))' }}
                />
                <Bar 
                  dataKey="value" 
                  radius={[0, 4, 4, 0]}
                  barSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Application Progress */}
        <Card className="p-5 bg-gradient-to-br from-secondary/5 to-secondary/10 border-secondary/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-secondary/20">
              <GraduationCap className="h-5 w-5 text-secondary-foreground" />
            </div>
            <h3 className="font-semibold text-foreground">Applications Progress</h3>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-muted-foreground">Submitted</span>
                <span className="text-sm font-semibold text-success">{applicationProgress.submitted}</span>
              </div>
              <Progress value={submittedPercent} className="h-2 bg-muted" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-muted-foreground">In Progress</span>
                <span className="text-sm font-semibold text-primary">{applicationProgress.inProgress}</span>
              </div>
              <Progress value={inProgressPercent} className="h-2 bg-muted" />
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-border">
              <span className="text-sm text-muted-foreground">Not Started</span>
              <span className="text-sm font-semibold text-destructive">{applicationProgress.notStarted}</span>
            </div>
          </div>
        </Card>

        {/* Upcoming Tasks */}
        <Card className="p-5 bg-gradient-to-br from-muted/50 to-muted border-muted-foreground/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-muted-foreground/20">
              <CalendarCheck className="h-5 w-5 text-foreground" />
            </div>
            <h3 className="font-semibold text-foreground">Action Items</h3>
          </div>
          <div className="space-y-2">
            {upcomingTasks.map((task, index) => (
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
                <span className={`font-bold ${task.urgent ? 'text-destructive' : 'text-foreground'}`}>
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
