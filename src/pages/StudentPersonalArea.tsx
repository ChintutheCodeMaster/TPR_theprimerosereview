import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Upload, 
  MessageSquare, 
  CheckCircle, 
  Clock, 
  Calendar,
  Star,
  History,
  AlertCircle,
  TrendingUp,
  MessageCircle
} from "lucide-react";

const StudentPersonalArea = () => {
  const [activeTab, setActiveTab] = useState("essays");

  // Mock data
  const essays = [
    {
      id: 1,
      title: "Common App Personal Statement",
      type: "Common App",
      prompt: "Some students have a background, identity, interest, or talent...",
      wordCount: 520,
      targetWords: 650,
      status: "review",
      lastUpdated: "2 hours ago",
      deadline: "Nov 30, 2024",
      urgency: "critical",
      versions: 3
    },
    {
      id: 2,
      title: "UC Berkeley Supplemental",
      type: "UC Application",
      prompt: "Describe the most significant challenge you have faced...",
      wordCount: 280,
      targetWords: 350,
      status: "draft",
      lastUpdated: "1 day ago",
      deadline: "Nov 30, 2024",
      urgency: "critical",
      versions: 2
    },
    {
      id: 3,
      title: "Harvard Supplemental Essay",
      type: "Supplemental",
      prompt: "Briefly describe an intellectual experience...",
      wordCount: 150,
      targetWords: 200,
      status: "approved",
      lastUpdated: "3 days ago",
      deadline: "Dec 10, 2024",
      urgency: "normal",
      versions: 1
    },
    {
      id: 4,
      title: "Stanford Why Major Essay",
      type: "Supplemental",
      prompt: "Why are you interested in your chosen major?",
      wordCount: 0,
      targetWords: 250,
      status: "not-started",
      lastUpdated: "Never",
      deadline: "Dec 15, 2024",
      urgency: "normal",
      versions: 0
    }
  ];

  const tasks = [
    {
      id: 1,
      title: "Revise Common App essay introduction",
      description: "Focus on making the hook more compelling",
      dueDate: "Nov 28, 2024",
      status: "in-progress",
      assignedBy: "Ms. Johnson"
    },
    {
      id: 2,
      title: "Complete UC Berkeley supplemental essays",
      description: "Submit all 4 required supplemental essays",
      dueDate: "Nov 30, 2024",
      status: "not-started",
      assignedBy: "Ms. Johnson"
    },
    {
      id: 3,
      title: "Schedule mock interview session",
      description: "Prepare for Harvard alumni interview",
      dueDate: "Dec 5, 2024",
      status: "completed",
      assignedBy: "Ms. Johnson"
    }
  ];

  const feedback = [
    {
      id: 1,
      essayTitle: "Common App Personal Statement",
      type: "counselor",
      author: "Ms. Johnson",
      content: "Great progress on this draft! The storytelling is much clearer. Consider strengthening the conclusion to better connect back to your career goals.",
      timestamp: "2 hours ago",
      nextSteps: ["Revise conclusion paragraph", "Add more specific examples"]
    },
    {
      id: 2,
      essayTitle: "Common App Personal Statement",
      type: "analysis",
      author: "Essay Analysis",
      content: "Grammar: 95%, Tone: 88%, Prompt Alignment: 92%. Your essay demonstrates strong personal reflection and growth.",
      timestamp: "2 hours ago",
      strengths: ["Clear narrative structure", "Authentic voice"],
      improvements: ["More specific details", "Stronger conclusion"]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500 text-white';
      case 'review': return 'bg-yellow-500 text-white';
      case 'draft': return 'bg-blue-500 text-white';
      case 'not-started': return 'bg-gray-500 text-white';
      case 'completed': return 'bg-green-500 text-white';
      case 'in-progress': return 'bg-yellow-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'review': return <Clock className="h-4 w-4" />;
      case 'draft': return <FileText className="h-4 w-4" />;
      case 'not-started': return <AlertCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'in-progress': return <Clock className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'border-l-4 border-l-destructive';
      case 'important': return 'border-l-4 border-l-orange-500';
      default: return 'border-l-4 border-l-muted';
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Work</h1>
        <p className="text-muted-foreground">Manage your essays, tasks, and track your progress</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="essays">Essays</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
        </TabsList>

        {/* Essays Tab */}
        <TabsContent value="essays" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">My Essays</h2>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Upload New Essay
            </Button>
          </div>

          <div className="grid gap-4">
            {essays.map((essay) => (
              <Card key={essay.id} className={`${getUrgencyColor(essay.urgency)}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{essay.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{essay.type}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{essay.prompt}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(essay.status)}>
                        {getStatusIcon(essay.status)}
                        <span className="ml-1 capitalize">{essay.status.replace('-', ' ')}</span>
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Word Count</p>
                      <p className="font-medium">{essay.wordCount} / {essay.targetWords}</p>
                      <Progress 
                        value={(essay.wordCount / essay.targetWords) * 100} 
                        className="h-1 mt-1" 
                      />
                    </div>
                    <div>
                      <p className="text-muted-foreground">Deadline</p>
                      <p className="font-medium">{essay.deadline}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Last Updated</p>
                      <p className="font-medium">{essay.lastUpdated}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Versions</p>
                      <p className="font-medium flex items-center gap-1">
                        <History className="h-3 w-3" />
                        {essay.versions}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline">Edit</Button>
                    <Button size="sm" variant="outline">View History</Button>
                    <Button size="sm" variant="outline">Download</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Feedback Tab */}
        <TabsContent value="feedback" className="space-y-6">
          <h2 className="text-xl font-semibold">Feedback & Comments</h2>
          
          <div className="space-y-4">
            {feedback.map((item) => (
              <Card key={item.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    {item.type === 'counselor' ? (
                      <MessageCircle className="h-5 w-5 text-primary" />
                    ) : (
                      <Star className="h-5 w-5 text-primary" />
                    )}
                    <CardTitle className="text-lg">
                      {item.type === 'counselor' ? 'Counselor Feedback' : 'Essay Analysis'}
                    </CardTitle>
                    <Badge variant="outline">{item.essayTitle}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    By {item.author} • {item.timestamp}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">{item.content}</p>
                  
                  {item.type === 'counselor' && item.nextSteps && (
                    <div className="bg-muted/30 p-3 rounded-lg">
                      <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Next Steps
                      </h4>
                      <ul className="text-sm space-y-1">
                        {item.nextSteps.map((step, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {item.type === 'ai' && item.strengths && item.improvements && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
                        <h4 className="font-medium text-sm mb-2 text-green-700 dark:text-green-400">Strengths</h4>
                        <ul className="text-sm space-y-1">
                          {item.strengths.map((strength, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <CheckCircle className="h-3 w-3 text-green-600" />
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-orange-50 dark:bg-orange-950/20 p-3 rounded-lg">
                        <h4 className="font-medium text-sm mb-2 text-orange-700 dark:text-orange-400">Areas to Improve</h4>
                        <ul className="text-sm space-y-1">
                          {item.improvements.map((improvement, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <TrendingUp className="h-3 w-3 text-orange-600" />
                              {improvement}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-6">
          <h2 className="text-xl font-semibold">My Tasks</h2>
          
          <div className="space-y-4">
            {tasks.map((task) => (
              <Card key={task.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getStatusColor(task.status)}>
                          {getStatusIcon(task.status)}
                          <span className="ml-1 capitalize">{task.status.replace('-', ' ')}</span>
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Assigned by {task.assignedBy}
                        </span>
                      </div>
                      <h3 className="font-medium text-lg">{task.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Due: {task.dueDate}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {task.status !== 'completed' && (
                        <Button size="sm" variant="outline">Mark as Done</Button>
                      )}
                      <Button size="sm" variant="ghost">View Details</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Messages with Counselor</h2>
            <Button>
              <MessageSquare className="h-4 w-4 mr-2" />
              New Message
            </Button>
          </div>

          <Card>
            <CardContent className="p-4">
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Start a Conversation</h3>
                <p className="text-muted-foreground mb-4">
                  Send a message to your counselor for help with essays, applications, or any questions.
                </p>
                <Button>Send Your First Message</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentPersonalArea;