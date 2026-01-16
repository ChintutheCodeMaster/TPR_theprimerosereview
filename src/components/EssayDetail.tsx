import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  FileText, 
  CheckCircle, 
  MessageSquare,
  Clock,
  Star,
  History,
  Download,
  Edit,
  Send,
  AlertTriangle,
  TrendingUp,
  User,
  Calendar,
  Target,
  BookOpen,
  Eye
} from "lucide-react";

interface EssayDetailProps {
  essay: any;
  onClose: () => void;
  onUpdate: () => void;
}

const EssayDetail = ({ essay, onClose, onUpdate }: EssayDetailProps) => {
  const [activeTab, setActiveTab] = useState("essay");
  const [counselorFeedback, setCounselorFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Mock essay content and feedback data
  const essayContent = `Growing up in a household where both my parents worked multiple jobs to make ends meet, I learned early that education was not just an opportunity—it was a necessity. Every morning, I watched my mother leave for her 6 AM shift at the local diner, knowing she would return home at 11 PM only to help me with homework despite her exhaustion.

This daily routine taught me resilience, but it also sparked a curiosity about economic inequality that would shape my academic interests. When I was fourteen, I started tutoring younger students in mathematics, not just to earn money for my family, but because I discovered that teaching allowed me to see how different perspectives could solve the same problem.

Through this experience, I realized that my passion lies in understanding complex systems—whether they're economic models or educational frameworks. This is why I want to study Economics with a focus on public policy. I believe that by understanding how financial systems work, I can contribute to creating more equitable opportunities for families like mine.

My experience has taught me that challenges are not obstacles but stepping stones to growth. Every difficult moment has strengthened my resolve to succeed and has shown me the importance of helping others along the way.`;

  const aiAnalysis = {
    overallScore: essay.aiScore,
    grammar: 92,
    tone: 85,
    storytelling: 88,
    promptAlignment: 91,
    strengths: [
      "Clear narrative structure with strong opening",
      "Authentic personal voice throughout",
      "Effective use of specific examples",
      "Strong connection between experience and goals"
    ],
    improvements: [
      "Consider adding more specific details about tutoring impact",
      "Strengthen the conclusion with more concrete future plans",
      "Expand on how economics will help achieve goals"
    ],
    suggestions: [
      "The opening effectively hooks the reader with vivid imagery",
      "The transition between personal story and academic goals is smooth",
      "Consider quantifying the impact of your tutoring experience"
    ]
  };

  const counselorComments = [
    {
      id: 1,
      author: "Ms. Johnson",
      timestamp: "2 hours ago",
      type: "general",
      content: "This is a strong start! Your personal story is compelling and authentic. The connection to your academic goals is clear.",
      highlighted: false
    },
    {
      id: 2,
      author: "Ms. Johnson", 
      timestamp: "2 hours ago",
      type: "suggestion",
      content: "Consider adding specific numbers - how many students did you tutor? What improvements did they see?",
      highlighted: true,
      highlightedText: "I started tutoring younger students in mathematics"
    }
  ];

  const versionHistory = [
    {
      version: 3,
      timestamp: "2 hours ago",
      wordCount: 520,
      aiScore: 78,
      changes: "Revised introduction and strengthened conclusion",
      status: "current"
    },
    {
      version: 2,
      timestamp: "1 week ago", 
      wordCount: 480,
      aiScore: 72,
      changes: "Added more specific examples and improved flow",
      status: "previous"
    },
    {
      version: 1,
      timestamp: "2 weeks ago",
      wordCount: 420,
      aiScore: 65,
      changes: "Initial draft submission",
      status: "previous"
    }
  ];

  const handleSendFeedback = async () => {
    if (!counselorFeedback.trim()) return;
    
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Feedback Sent",
      description: "Your feedback has been sent to the student.",
    });
    
    setCounselorFeedback("");
    setIsSubmitting(false);
    onUpdate();
  };

  const handleApprove = () => {
    toast({
      title: "Essay Approved",
      description: "The essay has been marked as approved.",
    });
    onUpdate();
  };

  const handleAssignTask = () => {
    toast({
      title: "Task Assigned",
      description: "A revision task has been assigned to the student.",
    });
    onUpdate();
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600 dark:text-green-400';
    if (score >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
      <div className="container mx-auto p-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={onClose}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Essays
            </Button>
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={essay.studentAvatar} alt={essay.studentName} />
                <AvatarFallback>
                  {essay.studentName.split(' ').map((n: string) => n.charAt(0)).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">{essay.title}</h1>
                <p className="text-muted-foreground">{essay.studentName} • {essay.type}</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" size="sm" onClick={handleAssignTask}>
              <Send className="h-4 w-4 mr-2" />
              Assign Task
            </Button>
            <Button size="sm" onClick={handleApprove}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
          </div>
        </div>

        {/* Essay Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Word Count</span>
              </div>
              <div className="text-2xl font-bold">{essay.wordCount}</div>
              <Progress value={(essay.wordCount / essay.targetWords) * 100} className="h-2 mt-2" />
              <p className="text-xs text-muted-foreground mt-1">Target: {essay.targetWords} words</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">AI Quality Score</span>
              </div>
              <div className={`text-2xl font-bold ${getScoreColor(aiAnalysis.overallScore)}`}>
                {aiAnalysis.overallScore}%
              </div>
              <Progress value={aiAnalysis.overallScore} className="h-2 mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Deadline</span>
              </div>
              <div className="text-lg font-bold">{essay.deadline}</div>
              <p className="text-xs text-muted-foreground mt-1">{essay.daysLeft} days left</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <History className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Version</span>
              </div>
              <div className="text-2xl font-bold">{essay.versions}</div>
              <p className="text-xs text-muted-foreground mt-1">Last updated: {essay.lastUpdated}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="essay">Essay Content</TabsTrigger>
            <TabsTrigger value="ai-feedback">AI Analysis</TabsTrigger>
            <TabsTrigger value="feedback">Comments</TabsTrigger>
            <TabsTrigger value="history">Version History</TabsTrigger>
          </TabsList>

          {/* Essay Content Tab */}
          <TabsContent value="essay">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Essay Content
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      <strong>Prompt:</strong> {essay.prompt}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none whitespace-pre-wrap leading-relaxed">
                      {essayContent}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Quick Feedback
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder="Add your feedback for the student..."
                      value={counselorFeedback}
                      onChange={(e) => setCounselorFeedback(e.target.value)}
                      rows={6}
                    />
                    <Button 
                      onClick={handleSendFeedback} 
                      disabled={!counselorFeedback.trim() || isSubmitting}
                      className="w-full"
                    >
                      {isSubmitting ? (
                        <>
                          <Clock className="h-4 w-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send Feedback
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* AI Analysis Tab */}
          <TabsContent value="ai-feedback">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    AI Quality Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Grammar & Mechanics</span>
                        <span className="font-medium">{aiAnalysis.grammar}%</span>
                      </div>
                      <Progress value={aiAnalysis.grammar} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Tone & Voice</span>
                        <span className="font-medium">{aiAnalysis.tone}%</span>
                      </div>
                      <Progress value={aiAnalysis.tone} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Storytelling</span>
                        <span className="font-medium">{aiAnalysis.storytelling}%</span>
                      </div>
                      <Progress value={aiAnalysis.storytelling} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Prompt Alignment</span>
                        <span className="font-medium">{aiAnalysis.promptAlignment}%</span>
                      </div>
                      <Progress value={aiAnalysis.promptAlignment} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Essay Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-green-700 dark:text-green-400 mb-2">Strengths</h4>
                    <ul className="space-y-1">
                      {aiAnalysis.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-orange-700 dark:text-orange-400 mb-2">Areas to Improve</h4>
                    <ul className="space-y-1">
                      {aiAnalysis.improvements.map((improvement, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <AlertTriangle className="h-3 w-3 text-orange-600 mt-0.5 flex-shrink-0" />
                          {improvement}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-blue-700 dark:text-blue-400 mb-2">Suggestions</h4>
                    <ul className="space-y-1">
                      {aiAnalysis.suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <Target className="h-3 w-3 text-blue-600 mt-0.5 flex-shrink-0" />
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Comments Tab */}
          <TabsContent value="feedback">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Counselor Comments & Feedback
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {counselorComments.map((comment) => (
                  <div key={comment.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{comment.author}</span>
                        <Badge variant={comment.type === 'general' ? 'secondary' : 'outline'}>
                          {comment.type}
                        </Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">{comment.timestamp}</span>
                    </div>
                    {comment.highlighted && (
                      <div className="bg-yellow-50 dark:bg-yellow-950/20 p-2 rounded border-l-4 border-l-yellow-400">
                        <p className="text-sm font-medium">Highlighted text:</p>
                        <p className="text-sm italic">"{comment.highlightedText}"</p>
                      </div>
                    )}
                    <p className="text-sm">{comment.content}</p>
                  </div>
                ))}

                {counselorComments.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No comments yet. Be the first to provide feedback!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Version History Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Version History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {versionHistory.map((version) => (
                    <div key={version.version} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-lg font-bold">v{version.version}</div>
                          {version.status === 'current' && (
                            <Badge variant="default" className="text-xs">Current</Badge>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{version.changes}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span>{version.timestamp}</span>
                            <span>{version.wordCount} words</span>
                            <span className={getScoreColor(version.aiScore)}>
                              AI Score: {version.aiScore}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        {version.status !== 'current' && (
                          <Button variant="outline" size="sm">
                            <History className="h-4 w-4 mr-2" />
                            Restore
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EssayDetail;