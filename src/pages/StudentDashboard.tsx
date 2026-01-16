import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StudentEssayFeedback } from "@/components/StudentEssayFeedback";
import { 
  FileText, 
  Calendar, 
  Upload, 
  MessageSquare, 
  CheckCircle, 
  AlertCircle,
  Clock,
  TrendingUp,
  Star,
  Award
} from "lucide-react";

const StudentDashboard = () => {
  const navigate = useNavigate();
  // Mock student data - matches data from other pages for demo consistency
  const student = {
    name: "Emma Thompson",
    avatar: "/placeholder.svg",
    overallProgress: 85,
    motivationalMessage: "you're 85% on track!"
  };

  const progressData = {
    applications: {
      completed: 3,
      total: 5,
      percentage: 60
    },
    essays: {
      completed: 4,
      total: 7,
      percentage: 57
    },
    recommendations: {
      completed: 1,
      total: 2,
      percentage: 50
    }
  };

  const upcomingDeadlines = [
    { 
      id: 1, 
      title: "UC Berkeley Application", 
      date: "Nov 30, 2024", 
      urgency: "critical", 
      daysLeft: 5 
    },
    { 
      id: 2, 
      title: "Common App Essay Final Draft", 
      date: "Dec 3, 2024", 
      urgency: "important", 
      daysLeft: 8 
    },
    { 
      id: 3, 
      title: "Harvard Supplemental Essays", 
      date: "Dec 10, 2024", 
      urgency: "normal", 
      daysLeft: 15 
    },
    { 
      id: 4, 
      title: "Stanford Application", 
      date: "Dec 15, 2024", 
      urgency: "normal", 
      daysLeft: 20 
    }
  ];

  const tips = [
    "Your Common App essay has improved significantly in storytelling clarity since your last draft.",
    "Consider focusing more time on your UC Berkeley essays - they're due soon!",
    "Great progress on recommendations - you're ahead of most students at this stage."
  ];

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'important': return 'bg-orange-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'critical': return <AlertCircle className="h-4 w-4" />;
      case 'important': return <Clock className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Welcome Header */}
      <Card className="bg-gradient-subtle border-none">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={student.avatar} alt={student.name} />
              <AvatarFallback className="text-lg">SJ</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">
                Hi {student.name}, {student.motivationalMessage}
              </h1>
              <p className="text-muted-foreground mt-1">
                Keep up the great work! Here's your college application progress.
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">{student.overallProgress}%</div>
              <p className="text-sm text-muted-foreground">Complete</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>{progressData.applications.completed} of {progressData.applications.total} submitted</span>
                <span className="font-medium">{progressData.applications.percentage}%</span>
              </div>
              <Progress value={progressData.applications.percentage} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Essays
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>{progressData.essays.completed} of {progressData.essays.total} completed</span>
                <span className="font-medium">{progressData.essays.percentage}%</span>
              </div>
              <Progress value={progressData.essays.percentage} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>{progressData.recommendations.completed} of {progressData.recommendations.total} submitted</span>
                <span className="font-medium">{progressData.recommendations.percentage}%</span>
              </div>
              <Progress value={progressData.recommendations.percentage} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Upcoming Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingDeadlines.map((deadline) => (
                <div 
                  key={deadline.id} 
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-full ${getUrgencyColor(deadline.urgency)}`}>
                      {getUrgencyIcon(deadline.urgency)}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{deadline.title}</p>
                      <p className="text-xs text-muted-foreground">{deadline.date}</p>
                    </div>
                  </div>
                  <Badge variant={deadline.urgency === 'critical' ? 'destructive' : 'secondary'} className="text-xs">
                    {deadline.daysLeft} days
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tips & Reminders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Tips & Reminders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tips.map((tip, index) => (
                <div key={index} className="p-3 rounded-lg bg-muted/30 border border-muted">
                  <p className="text-sm text-foreground">{tip}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Essay Feedback from Counselor */}
      <StudentEssayFeedback />

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Button variant="outline" className="h-16 flex-col gap-2">
              <Upload className="h-5 w-5" />
              Upload New Essay
            </Button>
            <Button variant="outline" className="h-16 flex-col gap-2">
              <FileText className="h-5 w-5" />
              View Feedback
            </Button>
            <Button variant="outline" className="h-16 flex-col gap-2">
              <CheckCircle className="h-5 w-5" />
              Check Tasks
            </Button>
            <Button variant="outline" className="h-16 flex-col gap-2">
              <MessageSquare className="h-5 w-5" />
              Message Counselor
            </Button>
            <Button 
              variant="outline" 
              className="h-16 flex-col gap-2 border-primary/30 hover:bg-primary/5"
              onClick={() => navigate('/student-recommendation-letters')}
            >
              <Award className="h-5 w-5 text-primary" />
              Recommendation Letters
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentDashboard;