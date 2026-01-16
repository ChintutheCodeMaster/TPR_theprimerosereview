import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { EssayFeedbackModal } from "@/components/EssayFeedbackModal";
import { 
  Search, 
  Filter, 
  Download, 
  Eye,
  MessageSquare,
  Sparkles,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Share,
  BarChart3,
  Calendar,
  User,
  Star,
  ArrowUpDown
} from "lucide-react";

interface Essay {
  id: string;
  title: string;
  studentName: string;
  studentAvatar?: string;
  prompt: string;
  wordCount: number;
  targetWords: number;
  status: 'draft' | 'in-review' | 'submitted' | 'needs-attention';
  aiScore: number;
  lastUpdated: string;
  dueDate: string;
  essayType: 'common-app' | 'supplemental' | 'ucas' | 'scholarship';
  content: string;
  feedback: string[];
  versions: number;
  urgent: boolean;
}

const mockEssays: Essay[] = [
  {
    id: '1',
    title: 'Common App Personal Statement',
    studentName: 'Emma Thompson',
    prompt: 'Some students have a background, identity, interest, or talent...',
    wordCount: 520,
    targetWords: 650,
    status: 'in-review',
    aiScore: 78,
    lastUpdated: '2 hours ago',
    dueDate: '2024-01-15',
    essayType: 'common-app',
    content: 'Growing up in a bilingual household, I often found myself serving as a bridge between two worlds...',
    feedback: ['Strong opening hook', 'Consider adding more specific examples'],
    versions: 3,
    urgent: false
  },
  {
    id: '2',
    title: 'Harvard Supplemental Essay',
    studentName: 'Marcus Johnson',
    prompt: 'Briefly describe an intellectual experience...',
    wordCount: 450,
    targetWords: 500,
    status: 'submitted',
    aiScore: 92,
    lastUpdated: '1 day ago',
    dueDate: '2024-01-20',
    essayType: 'supplemental',
    content: 'The moment I discovered machine learning algorithms could predict stock market trends...',
    feedback: ['Excellent technical explanation', 'Great conclusion'],
    versions: 4,
    urgent: false
  },
  {
    id: '3',
    title: 'UCAS Personal Statement',
    studentName: 'Sophia Chen',
    prompt: 'Write about your motivation for studying...',
    wordCount: 200,
    targetWords: 4000,
    status: 'needs-attention',
    aiScore: 45,
    lastUpdated: '5 days ago',
    dueDate: '2024-01-12',
    essayType: 'ucas',
    content: 'I want to study medicine because I like helping people...',
    feedback: ['Needs more depth and specificity', 'Add personal experiences'],
    versions: 1,
    urgent: true
  },
  {
    id: '4',
    title: 'MIT Supplemental - Community',
    studentName: 'Alex Rivera',
    prompt: 'Describe the world you come from...',
    wordCount: 180,
    targetWords: 250,
    status: 'draft',
    aiScore: 62,
    lastUpdated: '3 hours ago',
    dueDate: '2024-01-18',
    essayType: 'supplemental',
    content: 'My community is a small town where everyone knows everyone...',
    feedback: [],
    versions: 2,
    urgent: false
  }
];

const Essays = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("lastUpdated");
  const [selectedEssay, setSelectedEssay] = useState<Essay | null>(null);
  const [feedbackModalEssay, setFeedbackModalEssay] = useState<Essay | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'default';
      case 'in-review': return 'secondary';
      case 'needs-attention': return 'destructive';
      case 'draft': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted': return CheckCircle;
      case 'in-review': return Clock;
      case 'needs-attention': return AlertCircle;
      case 'draft': return FileText;
      default: return FileText;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'common-app': return 'Common App';
      case 'supplemental': return 'Supplemental';
      case 'ucas': return 'UCAS';
      case 'scholarship': return 'Scholarship';
      default: return type;
    }
  };

  const filteredEssays = mockEssays.filter(essay => {
    const matchesSearch = essay.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         essay.studentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || essay.status === statusFilter;
    const matchesType = typeFilter === 'all' || essay.essayType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'dueDate':
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      case 'aiScore':
        return b.aiScore - a.aiScore;
      case 'urgent':
        return b.urgent ? 1 : -1;
      default:
        return 0;
    }
  });

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Essays</h1>
          <p className="text-muted-foreground">Manage and review student essays</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline" size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="border-ai-accent/20 hover:bg-gradient-ai hover:text-primary-foreground"
          >
            <Sparkles className="h-4 w-4 mr-2 text-ai-accent" />
            Bulk Review
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
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
              <div className="p-2 bg-warning/10 rounded-lg">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">In Review</p>
                <p className="text-2xl font-bold text-foreground">8</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <AlertCircle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Needs Attention</p>
                <p className="text-2xl font-bold text-foreground">3</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-ai-accent/10 rounded-lg">
                <Star className="h-5 w-5 text-ai-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg AI Score</p>
                <p className="text-2xl font-bold text-foreground">82</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search essays by title or student name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="in-review">In Review</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="needs-attention">Needs Attention</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="common-app">Common App</SelectItem>
                  <SelectItem value="supplemental">Supplemental</SelectItem>
                  <SelectItem value="ucas">UCAS</SelectItem>
                  <SelectItem value="scholarship">Scholarship</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lastUpdated">Latest</SelectItem>
                  <SelectItem value="dueDate">Due Date</SelectItem>
                  <SelectItem value="aiScore">AI Score</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Essays Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredEssays.map((essay) => {
          const StatusIcon = getStatusIcon(essay.status);
          const wordProgress = (essay.wordCount / essay.targetWords) * 100;
          
          return (
            <Dialog key={essay.id}>
              <DialogTrigger asChild>
                <Card className="group hover:shadow-card-hover transition-all duration-300 hover:scale-[1.01] cursor-pointer border-border bg-card animate-fade-in">
                  <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-primary/10">
                          <AvatarImage src={essay.studentAvatar} alt={essay.studentName} />
                          <AvatarFallback className="bg-gradient-secondary text-secondary-foreground">
                            {essay.studentName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {essay.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">{essay.studentName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {essay.urgent && (
                          <Badge variant="destructive" className="text-xs">
                            Urgent
                          </Badge>
                        )}
                        <Badge 
                          variant={getStatusColor(essay.status) as any}
                          className="flex items-center gap-1"
                        >
                          <StatusIcon className="h-3 w-3" />
                          {essay.status.replace('-', ' ')}
                        </Badge>
                      </div>
                    </div>

                    {/* Essay Type & AI Score */}
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline">{getTypeLabel(essay.essayType)}</Badge>
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-ai-accent" />
                        <span className="text-sm font-medium">AI Score: {essay.aiScore}/100</span>
                      </div>
                    </div>

                    {/* Word Count Progress */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-foreground">Word Count</span>
                        <span className="text-sm text-muted-foreground">{essay.wordCount}/{essay.targetWords}</span>
                      </div>
                      <Progress value={Math.min(wordProgress, 100)} className="h-2" />
                    </div>

                    {/* Essay Preview */}
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {essay.content}
                      </p>
                    </div>

                    {/* Footer Info */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Updated: {essay.lastUpdated}</span>
                      <span>Due: {essay.dueDate}</span>
                      <span>v{essay.versions}</span>
                    </div>
                  </CardContent>
                </Card>
              </DialogTrigger>
              
              <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={essay.studentAvatar} alt={essay.studentName} />
                        <AvatarFallback className="bg-gradient-secondary text-secondary-foreground">
                          {essay.studentName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h2 className="text-xl font-bold">{essay.title}</h2>
                        <p className="text-sm text-muted-foreground">{essay.studentName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusColor(essay.status) as any}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {essay.status.replace('-', ' ')}
                      </Badge>
                    </div>
                  </DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="review" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="review">Review</TabsTrigger>
                    <TabsTrigger value="feedback">Feedback</TabsTrigger>
                    <TabsTrigger value="versions">Versions</TabsTrigger>
                  </TabsList>

                  <TabsContent value="review" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Essay Content */}
                      <div className="lg:col-span-2 space-y-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <FileText className="h-5 w-5" />
                              Essay Content
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="mb-4 p-3 bg-muted rounded-lg">
                              <p className="text-sm font-medium text-foreground mb-2">Prompt:</p>
                              <p className="text-sm text-muted-foreground">{essay.prompt}</p>
                            </div>
                            
                            <div className="prose max-w-none">
                              <p className="text-foreground whitespace-pre-wrap">{essay.content}</p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* AI Analysis & Tools */}
                      <div className="space-y-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Sparkles className="h-5 w-5 text-ai-accent" />
                              AI Analysis
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Overall Score</span>
                              <div className="flex items-center gap-2">
                                <Progress value={essay.aiScore} className="w-16 h-2" />
                                <span className="text-sm font-bold">{essay.aiScore}/100</span>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-xs text-muted-foreground">Personal Voice & Authenticity</span>
                                <span className="text-xs font-medium">88/100</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-xs text-muted-foreground">Storytelling & Structure</span>
                                <span className="text-xs font-medium">75/100</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-xs text-muted-foreground">Self-Reflection & Growth</span>
                                <span className="text-xs font-medium">82/100</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-xs text-muted-foreground">Prompt Alignment</span>
                                <span className="text-xs font-medium">79/100</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-xs text-muted-foreground">Grammar & Clarity</span>
                                <span className="text-xs font-medium">85/100</span>
                              </div>
                            </div>

                            <div className="pt-2 border-t border-border">
                              <h4 className="text-sm font-medium mb-2">AI Suggestions</h4>
                              <ul className="text-xs text-muted-foreground space-y-1">
                                <li>• Strengthen the opening hook</li>
                                <li>• Add more specific examples</li>
                                <li>• Improve conclusion clarity</li>
                              </ul>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <BarChart3 className="h-5 w-5" />
                              Progress
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Word Count</span>
                                <span>{essay.wordCount}/{essay.targetWords}</span>
                              </div>
                              <Progress value={(essay.wordCount / essay.targetWords) * 100} className="h-2" />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 text-center text-xs">
                              <div className="p-2 bg-muted/50 rounded">
                                <div className="font-medium">v{essay.versions}</div>
                                <div className="text-muted-foreground">Drafts</div>
                              </div>
                              <div className="p-2 bg-muted/50 rounded">
                                <div className="font-medium">{essay.dueDate}</div>
                                <div className="text-muted-foreground">Due Date</div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>


                  <TabsContent value="feedback" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Counselor Feedback</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Use the advanced feedback tool to review the essay with AI-powered analysis, 
                          highlight specific sections, and build comprehensive feedback for the student.
                        </p>
                        <Button 
                          size="lg" 
                          className="w-full"
                          onClick={() => setFeedbackModalEssay(essay)}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Open Feedback Editor
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Previous Feedback</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {essay.feedback.map((feedback, index) => (
                            <div key={index} className="p-3 border border-border rounded-lg">
                              <p className="text-sm">{feedback}</p>
                              <p className="text-xs text-muted-foreground mt-1">2 days ago</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="versions" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Essay Versions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                            <div>
                              <p className="font-medium">Version {essay.versions} (Current)</p>
                              <p className="text-sm text-muted-foreground">Updated {essay.lastUpdated}</p>
                            </div>
                            <Badge>Current</Badge>
                          </div>
                          <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                            <div>
                              <p className="font-medium">Version {essay.versions - 1}</p>
                              <p className="text-sm text-muted-foreground">Updated 3 days ago</p>
                            </div>
                            <Button variant="outline" size="sm">View</Button>
                          </div>
                          <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                            <div>
                              <p className="font-medium">Version {essay.versions - 2}</p>
                              <p className="text-sm text-muted-foreground">Updated 1 week ago</p>
                            </div>
                            <Button variant="outline" size="sm">View</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4 border-t border-border">
                  <Button className="flex-1">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send Feedback
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <User className="h-4 w-4 mr-2" />
                    Assign Task
                  </Button>
                  <Button variant="outline">
                    <Share className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button 
                    variant="outline"
                    className="border-ai-accent/20 hover:bg-gradient-ai hover:text-primary-foreground"
                  >
                    <Sparkles className="h-4 w-4 text-ai-accent" />
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          );
        })}
      </div>

      {filteredEssays.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No essays found</h3>
            <p className="text-muted-foreground">Try adjusting your search terms or filters</p>
          </CardContent>
        </Card>
      )}

      {/* Feedback Modal */}
      {feedbackModalEssay && (
        <EssayFeedbackModal
          isOpen={!!feedbackModalEssay}
          onClose={() => setFeedbackModalEssay(null)}
          essay={{
            id: feedbackModalEssay.id,
            title: feedbackModalEssay.title,
            studentName: feedbackModalEssay.studentName,
            prompt: feedbackModalEssay.prompt,
            content: feedbackModalEssay.content,
          }}
        />
      )}
    </div>
  );
};

export default Essays;