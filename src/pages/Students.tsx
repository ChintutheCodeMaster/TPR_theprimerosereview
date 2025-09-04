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
import { 
  Search, 
  Filter, 
  Download, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  User, 
  GraduationCap,
  FileText,
  Calendar,
  MessageSquare,
  Sparkles,
  BarChart3,
  Target,
  Trophy
} from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Header } from "@/components/Header";

interface Student {
  id: string;
  name: string;
  avatar?: string;
  gpa: number;
  satScore?: number;
  actScore?: number;
  completionPercentage: number;
  essaysSubmitted: number;
  totalEssays: number;
  recommendationsRequested: number;
  recommendationsSubmitted: number;
  upcomingDeadlines: number;
  status: 'on-track' | 'needs-attention' | 'at-risk';
  lastActivity: string;
  targetSchools: string[];
  extracurriculars: string[];
  tasks: { id: string; task: string; dueDate: string; completed: boolean }[];
  meetingNotes: { date: string; summary: string }[];
}

const mockStudents: Student[] = [
  {
    id: '1',
    name: 'Emma Thompson',
    avatar: undefined,
    gpa: 3.8,
    satScore: 1450,
    completionPercentage: 85,
    essaysSubmitted: 4,
    totalEssays: 5,
    recommendationsRequested: 3,
    recommendationsSubmitted: 2,
    upcomingDeadlines: 2,
    status: 'on-track',
    lastActivity: '2 hours ago',
    targetSchools: ['Stanford', 'UC Berkeley', 'UCLA'],
    extracurriculars: ['Debate Team Captain', 'Volunteer Tutor'],
    tasks: [
      { id: '1', task: 'Submit final essay draft', dueDate: '2024-01-15', completed: false }
    ],
    meetingNotes: [
      { date: '2024-01-10', summary: 'Discussed essay themes and target schools' }
    ]
  },
  {
    id: '2',
    name: 'Marcus Johnson',
    avatar: undefined,
    gpa: 3.6,
    actScore: 32,
    completionPercentage: 60,
    essaysSubmitted: 2,
    totalEssays: 5,
    recommendationsRequested: 2,
    recommendationsSubmitted: 1,
    upcomingDeadlines: 4,
    status: 'needs-attention',
    lastActivity: '1 day ago',
    targetSchools: ['MIT', 'Georgia Tech', 'Carnegie Mellon'],
    extracurriculars: ['Robotics Club', 'Math Olympiad'],
    tasks: [
      { id: '2', task: 'Complete Common App essays', dueDate: '2024-01-12', completed: false },
      { id: '3', task: 'Request teacher recommendations', dueDate: '2024-01-10', completed: true }
    ],
    meetingNotes: [
      { date: '2024-01-08', summary: 'Need to focus on essay completion and timeline management' }
    ]
  },
  {
    id: '3',
    name: 'Sophia Chen',
    avatar: undefined,
    gpa: 3.2,
    satScore: 1200,
    completionPercentage: 30,
    essaysSubmitted: 1,
    totalEssays: 5,
    recommendationsRequested: 1,
    recommendationsSubmitted: 0,
    upcomingDeadlines: 6,
    status: 'at-risk',
    lastActivity: '5 days ago',
    targetSchools: ['UC Davis', 'Cal State', 'Community College'],
    extracurriculars: ['Art Club', 'Part-time job'],
    tasks: [
      { id: '4', task: 'Schedule meeting with counselor', dueDate: '2024-01-11', completed: false },
      { id: '5', task: 'Start personal statement', dueDate: '2024-01-08', completed: false }
    ],
    meetingNotes: [
      { date: '2024-01-05', summary: 'Student struggling with time management, needs extra support' }
    ]
  }
];

const Students = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [gpaFilter, setGpaFilter] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track': return 'default';
      case 'needs-attention': return 'secondary';
      case 'at-risk': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'on-track': return CheckCircle;
      case 'needs-attention': return Clock;
      case 'at-risk': return AlertTriangle;
      default: return User;
    }
  };

  const filteredStudents = mockStudents.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
    const matchesGPA = gpaFilter === 'all' || 
      (gpaFilter === 'high' && student.gpa >= 3.7) ||
      (gpaFilter === 'medium' && student.gpa >= 3.0 && student.gpa < 3.7) ||
      (gpaFilter === 'low' && student.gpa < 3.0);
    
    return matchesSearch && matchesStatus && matchesGPA;
  });

  return (
    <div className="flex h-screen bg-background">
      <Navigation activeView="students" onViewChange={() => {}} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Students</h1>
                <p className="text-muted-foreground">Manage student profiles and track their progress</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export Reports
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-ai-accent/20 hover:bg-gradient-ai hover:text-primary-foreground"
                >
                  <Sparkles className="h-4 w-4 mr-2 text-ai-accent" />
                  AI Insights
                </Button>
              </div>
            </div>

            {/* Search and Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search students by name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="on-track">On Track</SelectItem>
                        <SelectItem value="needs-attention">Needs Attention</SelectItem>
                        <SelectItem value="at-risk">At Risk</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={gpaFilter} onValueChange={setGpaFilter}>
                      <SelectTrigger className="w-[130px]">
                        <SelectValue placeholder="GPA" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All GPA</SelectItem>
                        <SelectItem value="high">3.7+ High</SelectItem>
                        <SelectItem value="medium">3.0-3.7</SelectItem>
                        <SelectItem value="low">Below 3.0</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Students Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredStudents.map((student) => {
                const StatusIcon = getStatusIcon(student.status);
                
                return (
                  <Dialog key={student.id}>
                    <DialogTrigger asChild>
                      <Card className="group hover:shadow-card-hover transition-all duration-300 hover:scale-[1.02] cursor-pointer border-border bg-card animate-fade-in">
                        <CardContent className="p-6">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-12 w-12 border-2 border-primary/10">
                                <AvatarImage src={student.avatar} alt={student.name} />
                                <AvatarFallback className="bg-gradient-secondary text-secondary-foreground">
                                  {student.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                  {student.name}
                                </h3>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span>GPA: {student.gpa}</span>
                                  {student.satScore && <span>SAT: {student.satScore}</span>}
                                  {student.actScore && <span>ACT: {student.actScore}</span>}
                                </div>
                              </div>
                            </div>
                            <Badge 
                              variant={getStatusColor(student.status) as any}
                              className="flex items-center gap-1"
                            >
                              <StatusIcon className="h-3 w-3" />
                              {student.status.replace('-', ' ')}
                            </Badge>
                          </div>

                          {/* Progress */}
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-foreground">Application Progress</span>
                              <span className="text-sm text-muted-foreground">{student.completionPercentage}%</span>
                            </div>
                            <Progress value={student.completionPercentage} className="h-2" />
                          </div>

                          {/* Quick Stats */}
                          <div className="grid grid-cols-3 gap-2 text-center text-xs">
                            <div className="p-2 bg-muted/50 rounded">
                              <div className="font-medium text-foreground">{student.essaysSubmitted}/{student.totalEssays}</div>
                              <div className="text-muted-foreground">Essays</div>
                            </div>
                            <div className="p-2 bg-muted/50 rounded">
                              <div className="font-medium text-foreground">{student.recommendationsSubmitted}/{student.recommendationsRequested}</div>
                              <div className="text-muted-foreground">Recs</div>
                            </div>
                            <div className="p-2 bg-muted/50 rounded">
                              <div className="font-medium text-foreground">{student.upcomingDeadlines}</div>
                              <div className="text-muted-foreground">Deadlines</div>
                            </div>
                          </div>

                          {/* Last Activity */}
                          <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
                            Last activity: {student.lastActivity}
                          </p>
                        </CardContent>
                      </Card>
                    </DialogTrigger>
                    
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={student.avatar} alt={student.name} />
                            <AvatarFallback className="bg-gradient-secondary text-secondary-foreground">
                              {student.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h2 className="text-xl font-bold">{student.name}</h2>
                            <div className="flex items-center gap-2">
                              <Badge variant={getStatusColor(student.status) as any}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {student.status.replace('-', ' ')}
                              </Badge>
                            </div>
                          </div>
                        </DialogTitle>
                      </DialogHeader>

                      <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="grid w-full grid-cols-5">
                          <TabsTrigger value="overview">Overview</TabsTrigger>
                          <TabsTrigger value="progress">Progress</TabsTrigger>
                          <TabsTrigger value="essays">Essays</TabsTrigger>
                          <TabsTrigger value="tasks">Tasks</TabsTrigger>
                          <TabsTrigger value="meetings">Meetings</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card>
                              <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                  <BarChart3 className="h-5 w-5 text-primary" />
                                  Academic Performance
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-3">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">GPA</span>
                                    <span className="font-semibold">{student.gpa}</span>
                                  </div>
                                  {student.satScore && (
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">SAT Score</span>
                                      <span className="font-semibold">{student.satScore}</span>
                                    </div>
                                  )}
                                  {student.actScore && (
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">ACT Score</span>
                                      <span className="font-semibold">{student.actScore}</span>
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>

                            <Card>
                              <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                  <Target className="h-5 w-5 text-primary" />
                                  Target Schools
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-2">
                                  {student.targetSchools.map((school, index) => (
                                    <Badge key={index} variant="outline">{school}</Badge>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          </div>

                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <Trophy className="h-5 w-5 text-primary" />
                                Extracurriculars
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                {student.extracurriculars.map((activity, index) => (
                                  <Badge key={index} variant="secondary">{activity}</Badge>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>

                        <TabsContent value="progress" className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">Application Progress</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-3">
                                  <div className="flex justify-between">
                                    <span>Overall Completion</span>
                                    <span className="font-semibold">{student.completionPercentage}%</span>
                                  </div>
                                  <Progress value={student.completionPercentage} className="h-3" />
                                </div>
                              </CardContent>
                            </Card>

                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                  <FileText className="h-5 w-5" />
                                  Essays
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-foreground">
                                    {student.essaysSubmitted}/{student.totalEssays}
                                  </div>
                                  <div className="text-sm text-muted-foreground">Submitted</div>
                                </div>
                              </CardContent>
                            </Card>

                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                  <GraduationCap className="h-5 w-5" />
                                  Recommendations
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-foreground">
                                    {student.recommendationsSubmitted}/{student.recommendationsRequested}
                                  </div>
                                  <div className="text-sm text-muted-foreground">Received</div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>

                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-warning" />
                                Upcoming Deadlines
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-center p-4">
                                <div className="text-3xl font-bold text-warning">
                                  {student.upcomingDeadlines}
                                </div>
                                <div className="text-sm text-muted-foreground">Deadlines in next 30 days</div>
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>

                        <TabsContent value="essays" className="space-y-4">
                          <Card>
                            <CardHeader>
                              <CardTitle>Essay Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                                  <div>
                                    <div className="font-medium">Common App Personal Statement</div>
                                    <div className="text-sm text-muted-foreground">Draft 3 submitted</div>
                                  </div>
                                  <Badge variant="default">Completed</Badge>
                                </div>
                                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                                  <div>
                                    <div className="font-medium">Supplemental Essay #1</div>
                                    <div className="text-sm text-muted-foreground">In progress</div>
                                  </div>
                                  <Badge variant="secondary">Draft</Badge>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>

                        <TabsContent value="tasks" className="space-y-4">
                          <Card>
                            <CardHeader>
                              <CardTitle>Active Tasks</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                {student.tasks.map((task) => (
                                  <div key={task.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                                    <div>
                                      <div className="font-medium">{task.task}</div>
                                      <div className="text-sm text-muted-foreground">Due: {task.dueDate}</div>
                                    </div>
                                    <Badge variant={task.completed ? "default" : "outline"}>
                                      {task.completed ? "Completed" : "Pending"}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>

                        <TabsContent value="meetings" className="space-y-4">
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5" />
                                Meeting History
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                {student.meetingNotes.map((meeting, index) => (
                                  <div key={index} className="p-4 border border-border rounded-lg">
                                    <div className="font-medium mb-2">{meeting.date}</div>
                                    <div className="text-sm text-muted-foreground">{meeting.summary}</div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>
                      </Tabs>

                      <div className="flex gap-2 pt-4 border-t border-border">
                        <Button className="flex-1">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Schedule Meeting
                        </Button>
                        <Button variant="outline" className="flex-1">
                          <FileText className="h-4 w-4 mr-2" />
                          Generate Report
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

            {filteredStudents.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No students found</h3>
                  <p className="text-muted-foreground">Try adjusting your search terms or filters</p>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Students;