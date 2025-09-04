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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
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
  Calendar,
  User,
  School,
  ArrowUpDown,
  Link,
  Bell,
  BarChart3,
  Target,
  Send,
  Plus,
  GraduationCap,
  TrendingUp,
  AlertTriangle
} from "lucide-react";

interface Application {
  id: string;
  studentName: string;
  studentAvatar?: string;
  studentId: string;
  schoolName: string;
  program: string;
  applicationType: 'early-decision' | 'early-action' | 'regular' | 'ucas' | 'rolling';
  deadline: string;
  requiredEssays: number;
  completedEssays: number;
  recommendationsRequested: number;
  recommendationsSubmitted: number;
  applicationStatus: 'not-started' | 'in-progress' | 'submitted' | 'accepted' | 'rejected' | 'waitlisted';
  completionPercentage: number;
  urgent: boolean;
  tasks: { id: string; task: string; completed: boolean }[];
  aiScoreAvg: number;
}

const mockApplications: Application[] = [
  {
    id: '1',
    studentName: 'Emma Thompson',
    studentId: 'st1',
    schoolName: 'Stanford University',
    program: 'Computer Science',
    applicationType: 'early-action',
    deadline: '2024-01-15',
    requiredEssays: 3,
    completedEssays: 2,
    recommendationsRequested: 2,
    recommendationsSubmitted: 2,
    applicationStatus: 'in-progress',
    completionPercentage: 85,
    urgent: false,
    tasks: [
      { id: '1', task: 'Submit final supplemental essay', completed: false }
    ],
    aiScoreAvg: 82
  },
  {
    id: '2',
    studentName: 'Marcus Johnson',
    studentId: 'st2',
    schoolName: 'MIT',
    program: 'Electrical Engineering',
    applicationType: 'early-action',
    deadline: '2024-01-12',
    requiredEssays: 2,
    completedEssays: 1,
    recommendationsRequested: 3,
    recommendationsSubmitted: 1,
    applicationStatus: 'in-progress',
    completionPercentage: 45,
    urgent: true,
    tasks: [
      { id: '2', task: 'Complete additional essays', completed: false },
      { id: '3', task: 'Submit application', completed: false }
    ],
    aiScoreAvg: 75
  },
  {
    id: '3',
    studentName: 'Sophia Chen',
    studentId: 'st3',
    schoolName: 'UC Berkeley',
    program: 'Biology',
    applicationType: 'regular',
    deadline: '2024-01-30',
    requiredEssays: 4,
    completedEssays: 4,
    recommendationsRequested: 2,
    recommendationsSubmitted: 2,
    applicationStatus: 'submitted',
    completionPercentage: 100,
    urgent: false,
    tasks: [],
    aiScoreAvg: 88
  },
  {
    id: '4',
    studentName: 'Alex Rivera',
    studentId: 'st4',
    schoolName: 'Harvard University',
    program: 'Economics',
    applicationType: 'early-decision',
    deadline: '2024-01-10',
    requiredEssays: 2,
    completedEssays: 0,
    recommendationsRequested: 2,
    recommendationsSubmitted: 0,
    applicationStatus: 'not-started',
    completionPercentage: 15,
    urgent: true,
    tasks: [
      { id: '4', task: 'Start personal statement', completed: false },
      { id: '5', task: 'Request recommendations', completed: false }
    ],
    aiScoreAvg: 0
  },
  {
    id: '5',
    studentName: 'Emma Thompson',
    studentId: 'st1',
    schoolName: 'UC Berkeley',
    program: 'Computer Science',
    applicationType: 'regular',
    deadline: '2024-01-30',
    requiredEssays: 4,
    completedEssays: 3,
    recommendationsRequested: 2,
    recommendationsSubmitted: 2,
    applicationStatus: 'in-progress',
    completionPercentage: 90,
    urgent: false,
    tasks: [
      { id: '6', task: 'Final review and submit', completed: false }
    ],
    aiScoreAvg: 85
  },
  {
    id: '6',
    studentName: 'Marcus Johnson',
    studentId: 'st2',
    schoolName: 'Georgia Tech',
    program: 'Computer Engineering',
    applicationType: 'regular',
    deadline: '2024-02-01',
    requiredEssays: 2,
    completedEssays: 2,
    recommendationsRequested: 2,
    recommendationsSubmitted: 2,
    applicationStatus: 'submitted',
    completionPercentage: 100,
    urgent: false,
    tasks: [],
    aiScoreAvg: 79
  }
];

const Applications = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [schoolFilter, setSchoolFilter] = useState("all");
  const [sortBy, setSortBy] = useState("deadline");
  const [selectedApplications, setSelectedApplications] = useState<string[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [viewMode, setViewMode] = useState<'student' | 'school'>('student');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'default';
      case 'in-progress': return 'secondary';
      case 'accepted': return 'default';
      case 'rejected': return 'destructive';
      case 'waitlisted': return 'secondary';
      case 'not-started': return 'outline';
      default: return 'outline';
    }
  };

  const getDeadlineStatus = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const daysUntil = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntil < 0) return 'overdue';
    if (daysUntil <= 7) return 'urgent';
    if (daysUntil <= 30) return 'upcoming';
    return 'future';
  };

  const getDeadlineColor = (deadline: string) => {
    const status = getDeadlineStatus(deadline);
    switch (status) {
      case 'overdue': return 'text-destructive';
      case 'urgent': return 'text-warning';
      case 'upcoming': return 'text-foreground';
      case 'future': return 'text-muted-foreground';
      default: return 'text-muted-foreground';
    }
  };

  const getApplicationTypeLabel = (type: string) => {
    switch (type) {
      case 'early-decision': return 'Early Decision';
      case 'early-action': return 'Early Action';
      case 'regular': return 'Regular';
      case 'ucas': return 'UCAS';
      case 'rolling': return 'Rolling';
      default: return type;
    }
  };

  const filteredApplications = mockApplications.filter(app => {
    const matchesSearch = app.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.program.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.applicationStatus === statusFilter;
    const matchesType = typeFilter === 'all' || app.applicationType === typeFilter;
    const matchesSchool = schoolFilter === 'all' || app.schoolName === schoolFilter;
    
    return matchesSearch && matchesStatus && matchesType && matchesSchool;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'deadline':
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      case 'completion':
        return b.completionPercentage - a.completionPercentage;
      case 'student':
        return a.studentName.localeCompare(b.studentName);
      case 'school':
        return a.schoolName.localeCompare(b.schoolName);
      default:
        return 0;
    }
  });

  // Analytics data
  const totalApplications = mockApplications.length;
  const uniqueSchools = new Set(mockApplications.map(app => app.schoolName)).size;
  const urgentApplications = mockApplications.filter(app => app.urgent || getDeadlineStatus(app.deadline) === 'urgent').length;
  const avgCompletion = Math.round(mockApplications.reduce((sum, app) => sum + app.completionPercentage, 0) / mockApplications.length);

  const schoolStats = Array.from(new Set(mockApplications.map(app => app.schoolName))).map(school => {
    const schoolApps = mockApplications.filter(app => app.schoolName === school);
    const avgCompletion = Math.round(schoolApps.reduce((sum, app) => sum + app.completionPercentage, 0) / schoolApps.length);
    return {
      school,
      count: schoolApps.length,
      avgCompletion,
      urgent: schoolApps.filter(app => app.urgent).length
    };
  });

  const handleSelectApplication = (applicationId: string) => {
    setSelectedApplications(prev => 
      prev.includes(applicationId) 
        ? prev.filter(id => id !== applicationId)
        : [...prev, applicationId]
    );
  };

  const handleSelectAll = () => {
    setSelectedApplications(
      selectedApplications.length === filteredApplications.length 
        ? [] 
        : filteredApplications.map(app => app.id)
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Applications</h1>
          <p className="text-muted-foreground">Track and manage all student college applications</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Send className="h-4 w-4 mr-2" />
            Send Reminders
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

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Applications</p>
                <p className="text-2xl font-bold text-foreground">{totalApplications}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <School className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Schools</p>
                <p className="text-2xl font-bold text-foreground">{uniqueSchools}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Urgent</p>
                <p className="text-2xl font-bold text-foreground">{urgentApplications}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-ai-accent/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-ai-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Completion</p>
                <p className="text-2xl font-bold text-foreground">{avgCompletion}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'student' | 'school')}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="student">Student View</TabsTrigger>
            <TabsTrigger value="school">School View</TabsTrigger>
          </TabsList>

          {/* Search and Filters */}
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-[250px]"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="not-started">Not Started</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="waitlisted">Waitlisted</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="deadline">Deadline</SelectItem>
                <SelectItem value="completion">Completion</SelectItem>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="school">School</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <TabsContent value="student" className="space-y-4">
          {/* Bulk Actions */}
          {selectedApplications.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {selectedApplications.length} application(s) selected
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Send className="h-4 w-4 mr-2" />
                      Send Reminders
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export Selected
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Applications Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-background">
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox 
                          checked={selectedApplications.length === filteredApplications.length && filteredApplications.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>School / Program</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Deadline</TableHead>
                      <TableHead>Essays</TableHead>
                      <TableHead>Recommendations</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApplications.map((application) => (
                      <TableRow 
                        key={application.id}
                        className={`hover:bg-muted/50 ${application.urgent ? 'border-l-4 border-l-warning' : ''}`}
                      >
                        <TableCell>
                          <Checkbox 
                            checked={selectedApplications.includes(application.id)}
                            onCheckedChange={() => handleSelectApplication(application.id)}
                          />
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={application.studentAvatar} alt={application.studentName} />
                              <AvatarFallback className="bg-gradient-secondary text-secondary-foreground text-xs">
                                {application.studentName.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-foreground">{application.studentName}</p>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">{application.schoolName}</p>
                            <p className="text-sm text-muted-foreground">{application.program}</p>
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge variant="outline">
                            {getApplicationTypeLabel(application.applicationType)}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <div className={getDeadlineColor(application.deadline)}>
                            <p className="font-medium">{application.deadline}</p>
                            {application.urgent && (
                              <div className="flex items-center gap-1 mt-1">
                                <AlertCircle className="h-3 w-3 text-warning" />
                                <span className="text-xs text-warning">Urgent</span>
                              </div>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {application.completedEssays}/{application.requiredEssays}
                            </span>
                            <Progress 
                              value={(application.completedEssays / application.requiredEssays) * 100} 
                              className="w-16 h-2"
                            />
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {application.recommendationsSubmitted}/{application.recommendationsRequested}
                            </span>
                            <Progress 
                              value={(application.recommendationsSubmitted / application.recommendationsRequested) * 100} 
                              className="w-16 h-2"
                            />
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge variant={getStatusColor(application.applicationStatus) as any}>
                            {application.applicationStatus.replace('-', ' ')}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={application.completionPercentage} className="w-16 h-2" />
                            <span className="text-sm font-medium">{application.completionPercentage}%</span>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => setSelectedApplication(application)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                      <AvatarImage src={application.studentAvatar} alt={application.studentName} />
                                      <AvatarFallback className="bg-gradient-secondary text-secondary-foreground">
                                        {application.studentName.split(' ').map(n => n[0]).join('')}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <h2 className="text-xl font-bold">{application.schoolName}</h2>
                                      <p className="text-sm text-muted-foreground">{application.studentName} - {application.program}</p>
                                    </div>
                                  </DialogTitle>
                                </DialogHeader>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <Card>
                                    <CardHeader>
                                      <CardTitle className="flex items-center gap-2">
                                        <Target className="h-5 w-5" />
                                        Application Overview
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <p className="text-sm text-muted-foreground">Application Type</p>
                                          <p className="font-medium">{getApplicationTypeLabel(application.applicationType)}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-muted-foreground">Deadline</p>
                                          <p className="font-medium">{application.deadline}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-muted-foreground">Status</p>
                                          <Badge variant={getStatusColor(application.applicationStatus) as any}>
                                            {application.applicationStatus.replace('-', ' ')}
                                          </Badge>
                                        </div>
                                        <div>
                                          <p className="text-sm text-muted-foreground">Progress</p>
                                          <p className="font-medium">{application.completionPercentage}%</p>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>

                                  <Card>
                                    <CardHeader>
                                      <CardTitle className="flex items-center gap-2">
                                        <BarChart3 className="h-5 w-5" />
                                        Requirements
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                      <div>
                                        <div className="flex justify-between mb-2">
                                          <span className="text-sm">Essays</span>
                                          <span className="text-sm">{application.completedEssays}/{application.requiredEssays}</span>
                                        </div>
                                        <Progress value={(application.completedEssays / application.requiredEssays) * 100} className="h-2" />
                                      </div>
                                      
                                      <div>
                                        <div className="flex justify-between mb-2">
                                          <span className="text-sm">Recommendations</span>
                                          <span className="text-sm">{application.recommendationsSubmitted}/{application.recommendationsRequested}</span>
                                        </div>
                                        <Progress value={(application.recommendationsSubmitted / application.recommendationsRequested) * 100} className="h-2" />
                                      </div>

                                      {application.aiScoreAvg > 0 && (
                                        <div>
                                          <div className="flex justify-between mb-2">
                                            <span className="text-sm">Avg AI Score</span>
                                            <span className="text-sm">{application.aiScoreAvg}/100</span>
                                          </div>
                                          <Progress value={application.aiScoreAvg} className="h-2" />
                                        </div>
                                      )}
                                    </CardContent>
                                  </Card>

                                  <Card className="md:col-span-2">
                                    <CardHeader>
                                      <CardTitle className="flex items-center gap-2">
                                        <CheckCircle className="h-5 w-5" />
                                        Tasks & Reminders
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      {application.tasks.length > 0 ? (
                                        <div className="space-y-2">
                                          {application.tasks.map((task) => (
                                            <div key={task.id} className="flex items-center gap-3 p-2 border border-border rounded">
                                              <Checkbox checked={task.completed} />
                                              <span className={task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}>
                                                {task.task}
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <p className="text-sm text-muted-foreground">No pending tasks</p>
                                      )}
                                    </CardContent>
                                  </Card>
                                </div>

                                <div className="flex gap-2 pt-4 border-t border-border">
                                  <Button className="flex-1">
                                    <User className="h-4 w-4 mr-2" />
                                    View Student Profile
                                  </Button>
                                  <Button variant="outline" className="flex-1">
                                    <FileText className="h-4 w-4 mr-2" />
                                    View Essays
                                  </Button>
                                  <Button variant="outline">
                                    <Send className="h-4 w-4 mr-2" />
                                    Send Reminder
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                            
                            <Button variant="ghost" size="sm">
                              <Link className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="school" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <School className="h-5 w-5" />
                School Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {schoolStats.map((stat) => (
                  <div key={stat.school} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <h3 className="font-semibold text-foreground">{stat.school}</h3>
                      <p className="text-sm text-muted-foreground">{stat.count} applications</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Avg Completion</p>
                        <p className="font-semibold text-foreground">{stat.avgCompletion}%</p>
                      </div>
                      {stat.urgent > 0 && (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {stat.urgent} urgent
                        </Badge>
                      )}
                      <Progress value={stat.avgCompletion} className="w-24 h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {filteredApplications.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No applications found</h3>
            <p className="text-muted-foreground">Try adjusting your search terms or filters</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Applications;