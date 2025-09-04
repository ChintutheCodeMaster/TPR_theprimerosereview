import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  FileText,
  GraduationCap,
  Filter,
  List,
  Grid3X3,
  ChevronLeft,
  ChevronRight,
  User,
  School,
  Target,
  TrendingUp,
  AlertCircle
} from "lucide-react";

const CheckDeadlines = () => {
  const [viewMode, setViewMode] = useState("month");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDeadline, setSelectedDeadline] = useState<any>(null);
  const [filters, setFilters] = useState({
    student: "",
    school: "",
    urgency: "",
    applicationType: ""
  });
  const { toast } = useToast();

  // Mock deadlines data
  const deadlines = [
    {
      id: "1",
      title: "UC Berkeley Application",
      school: "UC Berkeley",
      applicationType: "UC System",
      date: new Date(2024, 10, 30), // Nov 30, 2024
      daysLeft: 5,
      urgency: "critical",
      students: [
        {
          id: "1",
          name: "Emma Rodriguez",
          avatar: "/placeholder.svg",
          progress: 75,
          essays: [
            { title: "Personal Statement", status: "review" },
            { title: "UC Essay #1", status: "draft" },
            { title: "UC Essay #2", status: "not-started" }
          ],
          recommendations: [
            { teacher: "Ms. Johnson", status: "submitted" },
            { teacher: "Mr. Smith", status: "pending" }
          ]
        },
        {
          id: "2",
          name: "Sofia Johnson",
          avatar: "/placeholder.svg",
          progress: 30,
          essays: [
            { title: "Personal Statement", status: "draft" },
            { title: "UC Essay #1", status: "not-started" }
          ],
          recommendations: [
            { teacher: "Ms. Johnson", status: "pending" }
          ]
        }
      ]
    },
    {
      id: "2",
      title: "Harvard Early Action",
      school: "Harvard University",
      applicationType: "Early Action",
      date: new Date(2024, 11, 1), // Dec 1, 2024
      daysLeft: 6,
      urgency: "critical",
      students: [
        {
          id: "3",
          name: "Michael Chen",
          avatar: "/placeholder.svg",
          progress: 85,
          essays: [
            { title: "Common App Essay", status: "approved" },
            { title: "Harvard Supplement", status: "review" }
          ],
          recommendations: [
            { teacher: "Dr. Wilson", status: "submitted" },
            { teacher: "Prof. Brown", status: "submitted" }
          ]
        }
      ]
    },
    {
      id: "3",
      title: "Stanford Regular Decision",
      school: "Stanford University",
      applicationType: "Regular Decision",
      date: new Date(2024, 11, 15), // Dec 15, 2024
      daysLeft: 20,
      urgency: "important",
      students: [
        {
          id: "4",
          name: "David Park",
          avatar: "/placeholder.svg",
          progress: 60,
          essays: [
            { title: "Common App Essay", status: "approved" },
            { title: "Stanford Essays", status: "draft" }
          ],
          recommendations: [
            { teacher: "Ms. Garcia", status: "submitted" },
            { teacher: "Mr. Thompson", status: "pending" }
          ]
        }
      ]
    },
    {
      id: "4",
      title: "MIT Early Action",
      school: "MIT",
      applicationType: "Early Action",
      date: new Date(2024, 10, 1), // Nov 1, 2024 (overdue)
      daysLeft: -24,
      urgency: "overdue",
      students: [
        {
          id: "5",
          name: "Rachel Kim",
          avatar: "/placeholder.svg",
          progress: 95,
          essays: [
            { title: "MIT Essays", status: "submitted" }
          ],
          recommendations: [
            { teacher: "Dr. Lee", status: "submitted" },
            { teacher: "Prof. Wang", status: "submitted" }
          ]
        }
      ]
    },
    {
      id: "5",
      title: "Columbia Regular Decision",
      school: "Columbia University",
      applicationType: "Regular Decision",
      date: new Date(2025, 0, 2), // Jan 2, 2025
      daysLeft: 38,
      urgency: "upcoming",
      students: [
        {
          id: "6",
          name: "Alex Morgan",
          avatar: "/placeholder.svg",
          progress: 40,
          essays: [
            { title: "Common App Essay", status: "review" },
            { title: "Columbia Supplement", status: "not-started" }
          ],
          recommendations: [
            { teacher: "Ms. Davis", status: "pending" }
          ]
        }
      ]
    }
  ];

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'overdue': return 'bg-destructive text-destructive-foreground';
      case 'critical': return 'bg-red-500 text-white';
      case 'important': return 'bg-yellow-500 text-white';
      case 'upcoming': return 'bg-green-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getUrgencyBorder = (urgency: string) => {
    switch (urgency) {
      case 'overdue': return 'border-l-4 border-l-destructive';
      case 'critical': return 'border-l-4 border-l-red-500';
      case 'important': return 'border-l-4 border-l-yellow-500';
      case 'upcoming': return 'border-l-4 border-l-green-500';
      default: return 'border-l-4 border-l-muted';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'text-green-600 dark:text-green-400';
      case 'approved': return 'text-green-600 dark:text-green-400';
      case 'review': return 'text-yellow-600 dark:text-yellow-400';
      case 'draft': return 'text-blue-600 dark:text-blue-400';
      case 'pending': return 'text-orange-600 dark:text-orange-400';
      case 'not-started': return 'text-red-600 dark:text-red-400';
      default: return 'text-muted-foreground';
    }
  };

  const atRiskStudents = deadlines
    .filter(d => d.urgency === 'critical' || d.urgency === 'overdue')
    .flatMap(d => d.students.filter(s => s.progress < 70))
    .slice(0, 5);

  const filteredDeadlines = deadlines.filter(deadline => {
    return (
      (!filters.student || filters.student === "all-students" || deadline.students.some(s => s.name.includes(filters.student))) &&
      (!filters.school || filters.school === "all-schools" || deadline.school.toLowerCase().includes(filters.school.toLowerCase())) &&
      (!filters.urgency || filters.urgency === "all-urgency" || deadline.urgency === filters.urgency) &&
      (!filters.applicationType || filters.applicationType === "all-types" || deadline.applicationType === filters.applicationType)
    );
  });

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleViewDeadline = (deadline: any) => {
    setSelectedDeadline(deadline);
  };

  const closeDeadlineDetail = () => {
    setSelectedDeadline(null);
  };

  // Generate calendar view for current month
  const generateCalendarDays = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const current = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      const dayDeadlines = filteredDeadlines.filter(d => 
        d.date.toDateString() === current.toDateString()
      );
      
      days.push({
        date: new Date(current),
        isCurrentMonth: current.getMonth() === month,
        deadlines: dayDeadlines
      });
      
      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Check Deadlines</h1>
          <p className="text-muted-foreground">Track application deadlines and student progress</p>
        </div>
        <div className="flex gap-2">
          <Tabs value={viewMode} onValueChange={setViewMode}>
            <TabsList>
              <TabsTrigger value="month" className="flex items-center gap-2">
                <Grid3X3 className="h-4 w-4" />
                Month
              </TabsTrigger>
              <TabsTrigger value="week" className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Week
              </TabsTrigger>
              <TabsTrigger value="list" className="flex items-center gap-2">
                <List className="h-4 w-4" />
                List
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* AI Risk Alerts */}
      {atRiskStudents.length > 0 && (
        <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-red-700 dark:text-red-400">
              <AlertTriangle className="h-5 w-5" />
              At Risk Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-600 dark:text-red-300 mb-3">
              {atRiskStudents.length} student{atRiskStudents.length > 1 ? 's are' : ' is'} not ready for upcoming critical deadlines:
            </p>
            <div className="flex flex-wrap gap-2">
              {atRiskStudents.map((student) => (
                <Badge key={student.id} variant="destructive" className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {student.name} ({student.progress}%)
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={filters.student} onValueChange={(value) => setFilters({ ...filters, student: value })}>
              <SelectTrigger>
                <SelectValue placeholder="All Students" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-students">All Students</SelectItem>
                <SelectItem value="Emma">Emma Rodriguez</SelectItem>
                <SelectItem value="Michael">Michael Chen</SelectItem>
                <SelectItem value="Sofia">Sofia Johnson</SelectItem>
                <SelectItem value="David">David Park</SelectItem>
                <SelectItem value="Rachel">Rachel Kim</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.school} onValueChange={(value) => setFilters({ ...filters, school: value })}>
              <SelectTrigger>
                <SelectValue placeholder="All Schools" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-schools">All Schools</SelectItem>
                <SelectItem value="Harvard">Harvard University</SelectItem>
                <SelectItem value="Stanford">Stanford University</SelectItem>
                <SelectItem value="UC Berkeley">UC Berkeley</SelectItem>
                <SelectItem value="MIT">MIT</SelectItem>
                <SelectItem value="Columbia">Columbia University</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.urgency} onValueChange={(value) => setFilters({ ...filters, urgency: value })}>
              <SelectTrigger>
                <SelectValue placeholder="All Urgency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-urgency">All Urgency</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="important">Important</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.applicationType} onValueChange={(value) => setFilters({ ...filters, applicationType: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Application Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-types">All Types</SelectItem>
                <SelectItem value="Early Action">Early Action</SelectItem>
                <SelectItem value="Regular Decision">Regular Decision</SelectItem>
                <SelectItem value="UC System">UC System</SelectItem>
                <SelectItem value="UCAS">UCAS</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Calendar/List View */}
        <div className="lg:col-span-3">
          <Tabs value={viewMode} onValueChange={setViewMode}>
            {/* Month View */}
            <TabsContent value="month">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedDate(new Date())}
                    >
                      Today
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-1">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                        {day}
                      </div>
                    ))}
                    {generateCalendarDays().map((day, index) => (
                      <div 
                        key={index} 
                        className={`min-h-20 p-1 border border-border ${
                          !day.isCurrentMonth ? 'bg-muted/30 text-muted-foreground' : ''
                        }`}
                      >
                        <div className="text-sm font-medium mb-1">{day.date.getDate()}</div>
                        <div className="space-y-1">
                          {day.deadlines.slice(0, 2).map(deadline => (
                            <div 
                              key={deadline.id}
                              className={`text-xs p-1 rounded cursor-pointer ${getUrgencyColor(deadline.urgency)} hover:opacity-80`}
                              onClick={() => handleViewDeadline(deadline)}
                            >
                              {deadline.school}
                            </div>
                          ))}
                          {day.deadlines.length > 2 && (
                            <div className="text-xs text-muted-foreground">
                              +{day.deadlines.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Week View */}
            <TabsContent value="week">
              <Card>
                <CardHeader>
                  <CardTitle>Week View</CardTitle>
                  <p className="text-sm text-muted-foreground">Coming soon - enhanced week timeline view</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredDeadlines.slice(0, 7).map((deadline) => (
                      <div key={deadline.id} className={`p-4 rounded-lg border ${getUrgencyBorder(deadline.urgency)}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">{deadline.title}</h3>
                            <p className="text-sm text-muted-foreground">{formatDate(deadline.date)}</p>
                          </div>
                          <Badge className={getUrgencyColor(deadline.urgency)}>
                            {deadline.daysLeft > 0 ? `${deadline.daysLeft} days` : 'Overdue'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* List View */}
            <TabsContent value="list">
              <div className="space-y-4">
                {filteredDeadlines.map((deadline) => (
                  <Card key={deadline.id} className={`${getUrgencyBorder(deadline.urgency)} hover:shadow-md transition-shadow cursor-pointer`} onClick={() => handleViewDeadline(deadline)}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">{deadline.title}</h3>
                          <p className="text-muted-foreground flex items-center gap-2">
                            <School className="h-4 w-4" />
                            {deadline.school} • {deadline.applicationType}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                            <CalendarIcon className="h-3 w-3" />
                            {formatDate(deadline.date)}
                          </p>
                        </div>
                        <Badge className={getUrgencyColor(deadline.urgency)}>
                          {deadline.daysLeft > 0 ? `${deadline.daysLeft} days left` : `${Math.abs(deadline.daysLeft)} days overdue`}
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium mb-2">Students ({deadline.students.length}):</p>
                          <div className="flex flex-wrap gap-2">
                            {deadline.students.map((student) => (
                              <div key={student.id} className="flex items-center gap-2 bg-muted/50 rounded-full px-3 py-1">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={student.avatar} alt={student.name} />
                                  <AvatarFallback className="text-xs">
                                    {student.name.split(' ').map(n => n.charAt(0)).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm">{student.name}</span>
                                <span className={`text-xs ${student.progress < 50 ? 'text-red-600' : student.progress < 80 ? 'text-yellow-600' : 'text-green-600'}`}>
                                  {student.progress}%
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar - Upcoming Deadlines */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Upcoming Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredDeadlines
                  .sort((a, b) => a.date.getTime() - b.date.getTime())
                  .slice(0, 8)
                  .map((deadline) => (
                  <div 
                    key={deadline.id} 
                    className={`p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors ${getUrgencyBorder(deadline.urgency)}`}
                    onClick={() => handleViewDeadline(deadline)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{deadline.school}</h4>
                      <Badge variant="outline" className={getUrgencyColor(deadline.urgency)}>
                        {deadline.daysLeft > 0 ? `${deadline.daysLeft}d` : 'Overdue'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{deadline.applicationType}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(deadline.date)}</p>
                    <div className="flex items-center gap-1 mt-2">
                      {deadline.students.slice(0, 3).map((student, index) => (
                        <Avatar key={student.id} className="h-5 w-5">
                          <AvatarFallback className="text-xs">
                            {student.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {deadline.students.length > 3 && (
                        <span className="text-xs text-muted-foreground">+{deadline.students.length - 3}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Deadline Detail Modal */}
      {selectedDeadline && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">{selectedDeadline.title}</CardTitle>
                  <p className="text-muted-foreground">{selectedDeadline.school} • {selectedDeadline.applicationType}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                    <CalendarIcon className="h-4 w-4" />
                    {formatDate(selectedDeadline.date)}
                    <Badge className={getUrgencyColor(selectedDeadline.urgency)}>
                      {selectedDeadline.daysLeft > 0 ? `${selectedDeadline.daysLeft} days left` : `${Math.abs(selectedDeadline.daysLeft)} days overdue`}
                    </Badge>
                  </p>
                </div>
                <Button variant="outline" onClick={closeDeadlineDetail}>Close</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {selectedDeadline.students.map((student: any) => (
                  <Card key={student.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={student.avatar} alt={student.name} />
                          <AvatarFallback>
                            {student.name.split(' ').map((n: string) => n.charAt(0)).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-medium text-lg">{student.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-muted-foreground">Progress:</span>
                            <Progress value={student.progress} className="w-24 h-2" />
                            <span className="text-sm font-medium">{student.progress}%</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium flex items-center gap-2 mb-2">
                            <FileText className="h-4 w-4" />
                            Essays
                          </h4>
                          <div className="space-y-2">
                            {student.essays.map((essay: any, index: number) => (
                              <div key={index} className="flex items-center justify-between text-sm">
                                <span>{essay.title}</span>
                                <Badge variant="outline" className={getStatusColor(essay.status)}>
                                  {essay.status.replace('-', ' ')}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium flex items-center gap-2 mb-2">
                            <GraduationCap className="h-4 w-4" />
                            Recommendations
                          </h4>
                          <div className="space-y-2">
                            {student.recommendations.map((rec: any, index: number) => (
                              <div key={index} className="flex items-center justify-between text-sm">
                                <span>{rec.teacher}</span>
                                <Badge variant="outline" className={getStatusColor(rec.status)}>
                                  {rec.status}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CheckDeadlines;