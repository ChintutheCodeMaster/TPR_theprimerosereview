import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  User, 
  Mail, 
  GraduationCap, 
  FileText, 
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Send
} from "lucide-react";
import { toast } from "sonner";

const ParentPortal = () => {
  const [message, setMessage] = useState("");

  // Mock data for demo
  const childInfo = {
    name: "Emma Rodriguez",
    school: "Lincoln High School",
    grade: "12th Grade",
    counselor: "Dr. Sarah Johnson",
    counselorEmail: "sarah.johnson@primrose.edu",
    gpa: 3.8,
    satScore: 1450,
    status: "on-track" as const
  };

  const applicationProgress = {
    essaysCompleted: 3,
    totalEssays: 5,
    applicationsSubmitted: 2,
    totalApplications: 8,
    upcomingDeadlines: 3
  };

  const recentActivity = [
    { date: "Dec 15, 2024", action: "Essay submitted for review", status: "pending" },
    { date: "Dec 12, 2024", action: "Harvard application started", status: "in-progress" },
    { date: "Dec 10, 2024", action: "Common App essay approved", status: "completed" },
  ];

  const handleSendMessage = () => {
    if (!message.trim()) {
      toast.error("Please write a message");
      return;
    }
    toast.success("Message sent to counselor");
    setMessage("");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track': return 'bg-green-500';
      case 'needs-attention': return 'bg-yellow-500';
      case 'at-risk': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'on-track': return 'On Track';
      case 'needs-attention': return 'Needs Attention';
      case 'at-risk': return 'At Risk';
      default: return status;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Parent Portal</h1>
        <p className="text-muted-foreground">Stay updated on your child's college application progress</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Child Info Card */}
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">{childInfo.name}</h2>
                <p className="text-muted-foreground">{childInfo.school}</p>
                <p className="text-sm text-muted-foreground">{childInfo.grade}</p>
              </div>
            </div>
            <Badge className={`${getStatusColor(childInfo.status)} text-white`}>
              {getStatusLabel(childInfo.status)}
            </Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-secondary/50 rounded-lg">
              <p className="text-2xl font-bold text-foreground">{childInfo.gpa}</p>
              <p className="text-xs text-muted-foreground">GPA</p>
            </div>
            <div className="text-center p-3 bg-secondary/50 rounded-lg">
              <p className="text-2xl font-bold text-foreground">{childInfo.satScore}</p>
              <p className="text-xs text-muted-foreground">SAT Score</p>
            </div>
            <div className="text-center p-3 bg-secondary/50 rounded-lg">
              <p className="text-2xl font-bold text-foreground">{applicationProgress.applicationsSubmitted}/{applicationProgress.totalApplications}</p>
              <p className="text-xs text-muted-foreground">Applications</p>
            </div>
            <div className="text-center p-3 bg-secondary/50 rounded-lg">
              <p className="text-2xl font-bold text-foreground">{applicationProgress.upcomingDeadlines}</p>
              <p className="text-xs text-muted-foreground">Upcoming Deadlines</p>
            </div>
          </div>

          {/* Progress Bars */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Essays Progress</span>
                <span className="font-medium">{applicationProgress.essaysCompleted}/{applicationProgress.totalEssays}</span>
              </div>
              <Progress value={(applicationProgress.essaysCompleted / applicationProgress.totalEssays) * 100} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Applications Progress</span>
                <span className="font-medium">{applicationProgress.applicationsSubmitted}/{applicationProgress.totalApplications}</span>
              </div>
              <Progress value={(applicationProgress.applicationsSubmitted / applicationProgress.totalApplications) * 100} className="h-2" />
            </div>
          </div>
        </Card>

        {/* Counselor Contact Card */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            Your Counselor
          </h3>
          
          <div className="space-y-4">
            <div>
              <p className="font-medium text-foreground">{childInfo.counselor}</p>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {childInfo.counselorEmail}
              </p>
            </div>

            <div className="space-y-2">
              <Textarea
                placeholder="Write a message to the counselor..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
              />
              <Button className="w-full gap-2" onClick={handleSendMessage}>
                <Send className="h-4 w-4" />
                Send Message
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Recent Activity
        </h3>

        <div className="space-y-3">
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center gap-4 p-3 bg-secondary/30 rounded-lg">
              {activity.status === 'completed' && <CheckCircle className="h-5 w-5 text-green-500" />}
              {activity.status === 'pending' && <Clock className="h-5 w-5 text-yellow-500" />}
              {activity.status === 'in-progress' && <AlertTriangle className="h-5 w-5 text-blue-500" />}
              
              <div className="flex-1">
                <p className="text-foreground">{activity.action}</p>
                <p className="text-xs text-muted-foreground">{activity.date}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default ParentPortal;
