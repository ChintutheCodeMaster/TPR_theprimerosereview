import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Mail, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  GraduationCap,
  Target,
  MessageSquare,
  CalendarCheck
} from "lucide-react";

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
    { label: "מכתבי המלצה להשלמה", count: 5, urgent: true },
    { label: "מועדי הגשה השבוע", count: 7, urgent: true },
    { label: "פגישות מתוכננות", count: 3, urgent: false },
    { label: "חיבורים ממתינים לביקורת", count: 9, urgent: false }
  ];

  const submittedPercent = Math.round((applicationProgress.submitted / applicationProgress.total) * 100);
  const inProgressPercent = Math.round((applicationProgress.inProgress / applicationProgress.total) * 100);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Counselor Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Recommendation Letters Status */}
        <Card className="p-5 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/20">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Recommendations</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Pending</span>
              <span className="font-bold text-warning">{recommendationStats.pending}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">In Progress</span>
              <span className="font-bold text-primary">{recommendationStats.inProgress}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Sent</span>
              <span className="font-bold text-success">{recommendationStats.sent}</span>
            </div>
            <Progress 
              value={(recommendationStats.sent / recommendationStats.total) * 100} 
              className="mt-3 h-2"
            />
            <p className="text-xs text-muted-foreground text-center mt-1">
              {Math.round((recommendationStats.sent / recommendationStats.total) * 100)}% completed
            </p>
          </div>
        </Card>

        {/* Application Progress */}
        <Card className="p-5 bg-gradient-to-br from-secondary/5 to-secondary/10 border-secondary/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-secondary/20">
              <GraduationCap className="h-5 w-5 text-secondary-foreground" />
            </div>
            <h3 className="font-semibold text-foreground">Applications</h3>
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

        {/* Weekly Activity */}
        <Card className="p-5 bg-gradient-to-br from-accent/30 to-accent/50 border-accent/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-accent">
              <Target className="h-5 w-5 text-accent-foreground" />
            </div>
            <h3 className="font-semibold text-foreground">This Week</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-2 rounded-lg bg-background/50">
              <p className="text-2xl font-bold text-primary">{weeklyActivity.essaysReviewed}</p>
              <p className="text-xs text-muted-foreground">Essays Reviewed</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-background/50">
              <p className="text-2xl font-bold text-primary">{weeklyActivity.meetingsHeld}</p>
              <p className="text-xs text-muted-foreground">Meetings</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-background/50">
              <p className="text-2xl font-bold text-primary">{weeklyActivity.messagesExchanged}</p>
              <p className="text-xs text-muted-foreground">Messages</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-background/50">
              <p className="text-2xl font-bold text-success">{weeklyActivity.deadlinesMet}</p>
              <p className="text-xs text-muted-foreground">Deadlines Met</p>
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
