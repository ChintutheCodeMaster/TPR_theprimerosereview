import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  FileText, 
  Calendar,
  Download,
  Share,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Lightbulb,
  User,
  GraduationCap,
  School,
  Filter
} from "lucide-react";

const ViewReports = () => {
  const [selectedStudent, setSelectedStudent] = useState("all");
  const [selectedTimeRange, setSelectedTimeRange] = useState("month");
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();

  // Mock data for reports
  const overviewMetrics = {
    totalStudents: 24,
    essaysSubmitted: 156,
    avgQualityScore: 78,
    upcomingDeadlines: 12,
    completionRate: 73
  };

  const essayQualityTrend = [
    { week: 'Week 1', score: 65, submissions: 8 },
    { week: 'Week 2', score: 68, submissions: 12 },
    { week: 'Week 3', score: 72, submissions: 15 },
    { week: 'Week 4', score: 76, submissions: 18 },
    { week: 'Week 5', score: 78, submissions: 22 },
    { week: 'Week 6', score: 81, submissions: 25 }
  ];

  const applicationDistribution = [
    { school: 'UC Berkeley', applications: 18, color: '#3b82f6' },
    { school: 'Stanford', applications: 15, color: '#ef4444' },
    { school: 'Harvard', applications: 12, color: '#10b981' },
    { school: 'MIT', applications: 10, color: '#f59e0b' },
    { school: 'Columbia', applications: 8, color: '#8b5cf6' },
    { school: 'UCLA', applications: 14, color: '#06b6d4' },
    { school: 'Yale', applications: 9, color: '#ec4899' },
    { school: 'Princeton', applications: 7, color: '#84cc16' }
  ];

  const deadlinesByWeek = [
    { week: 'Nov 25-Dec 1', count: 8, urgent: 3 },
    { week: 'Dec 2-8', count: 12, urgent: 5 },
    { week: 'Dec 9-15', count: 15, urgent: 2 },
    { week: 'Dec 16-22', count: 6, urgent: 1 },
    { week: 'Dec 23-29', count: 3, urgent: 0 },
    { week: 'Jan 1-7', count: 9, urgent: 4 }
  ];

  const studentProgress = [
    {
      id: 1,
      name: 'Emma Rodriguez',
      avatar: '/placeholder.svg',
      overallProgress: 85,
      essaysCompleted: 4,
      totalEssays: 5,
      applicationsSubmitted: 3,
      totalApplications: 4,
      recsReceived: 2,
      totalRecs: 2,
      avgEssayScore: 82,
      riskLevel: 'low'
    },
    {
      id: 2,
      name: 'Michael Chen',
      avatar: '/placeholder.svg',
      overallProgress: 92,
      essaysCompleted: 6,
      totalEssays: 6,
      applicationsSubmitted: 4,
      totalApplications: 4,
      recsReceived: 2,
      totalRecs: 2,
      avgEssayScore: 88,
      riskLevel: 'low'
    },
    {
      id: 3,
      name: 'Sofia Johnson',
      avatar: '/placeholder.svg',
      overallProgress: 45,
      essaysCompleted: 2,
      totalEssays: 5,
      applicationsSubmitted: 1,
      totalApplications: 4,
      recsReceived: 1,
      totalRecs: 2,
      avgEssayScore: 65,
      riskLevel: 'high'
    },
    {
      id: 4,
      name: 'David Park',
      avatar: '/placeholder.svg',
      overallProgress: 68,
      essaysCompleted: 3,
      totalEssays: 5,
      applicationsSubmitted: 2,
      totalApplications: 4,
      recsReceived: 1,
      totalRecs: 2,
      avgEssayScore: 72,
      riskLevel: 'medium'
    }
  ];

  const atRiskStudents = studentProgress.filter(s => s.riskLevel === 'high' || s.riskLevel === 'medium');

  const keyInsights = [
    "Essay quality has improved by 25% over the past 6 weeks, indicating effective feedback implementation.",
    "UC Berkeley and Stanford are the most popular choices, with 67% of students applying to at least one UC school.",
    "3 students are at high risk of missing upcoming deadlines and need immediate attention.",
    "Average essay completion time has decreased by 2 days, showing improved workflow efficiency.",
    "Students who submit drafts early tend to have 15% higher final quality scores."
  ];

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-600 dark:text-red-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'low': return 'text-green-600 dark:text-green-400';
      default: return 'text-muted-foreground';
    }
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'default';
      default: return 'outline';
    }
  };

  const handleExport = (format: string, type: string) => {
    toast({
      title: `Exporting ${type}`,
      description: `Your ${type} report is being generated in ${format.toUpperCase()} format.`,
    });
  };

  const handleShareReport = (studentName: string) => {
    toast({
      title: "Report Shared",
      description: `Parent summary for ${studentName} has been sent via email.`,
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">View Reports</h1>
          <p className="text-muted-foreground">Analytics and insights for student progress</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => handleExport('pdf', 'Full Report')}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={() => handleExport('excel', 'Data Export')}>
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Total Students</span>
            </div>
            <div className="text-2xl font-bold">{overviewMetrics.totalStudents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Essays Submitted</span>
            </div>
            <div className="text-2xl font-bold">{overviewMetrics.essaysSubmitted}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Avg Quality Score</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{overviewMetrics.avgQualityScore}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Upcoming Deadlines</span>
            </div>
            <div className="text-2xl font-bold text-orange-600">{overviewMetrics.upcomingDeadlines}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Completion Rate</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">{overviewMetrics.completionRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Key Insights */}
      <Card className="bg-gradient-subtle border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            Key Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {keyInsights.slice(0, 3).map((insight, index) => (
              <div key={index} className="p-3 bg-background/50 rounded-lg border">
                <p className="text-sm">{insight}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="individual">Individual Reports</TabsTrigger>
          <TabsTrigger value="aggregate">Aggregate Analytics</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Essay Quality Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChartIcon className="h-5 w-5" />
                  Essay Quality Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={essayQualityTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#3b82f6" 
                      fill="#3b82f6" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Application Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5" />
                  Popular Schools
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={applicationDistribution.slice(0, 6)}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="applications"
                      label={({ school, applications }) => `${school}: ${applications}`}
                    >
                      {applicationDistribution.slice(0, 6).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Deadlines Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Upcoming Deadlines by Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={deadlinesByWeek}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" name="Total Deadlines" />
                  <Bar dataKey="urgent" fill="#ef4444" name="Urgent Deadlines" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Individual Reports Tab */}
        <TabsContent value="individual" className="space-y-6">
          <div className="flex items-center gap-4 mb-6">
            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select a student" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Students</SelectItem>
                {studentProgress.map(student => (
                  <SelectItem key={student.id} value={student.id.toString()}>
                    {student.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4">
            {studentProgress.map((student) => (
              <Card key={student.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={student.avatar} alt={student.name} />
                        <AvatarFallback className="text-lg">
                          {student.name.split(' ').map(n => n.charAt(0)).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-xl font-semibold">{student.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-muted-foreground">Overall Progress:</span>
                          <Progress value={student.overallProgress} className="w-32 h-2" />
                          <span className="font-medium">{student.overallProgress}%</span>
                        </div>
                        <Badge variant={getRiskBadge(student.riskLevel)} className="mt-2">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {student.riskLevel.toUpperCase()} Risk
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleShareReport(student.name)}
                      >
                        <Share className="h-4 w-4 mr-2" />
                        Share with Parents
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleExport('pdf', `${student.name} Report`)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">Essays</span>
                      </div>
                      <div className="text-lg font-semibold">
                        {student.essaysCompleted}/{student.totalEssays}
                      </div>
                      <Progress 
                        value={(student.essaysCompleted / student.totalEssays) * 100} 
                        className="h-2 mt-2" 
                      />
                    </div>

                    <div className="p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <School className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">Applications</span>
                      </div>
                      <div className="text-lg font-semibold">
                        {student.applicationsSubmitted}/{student.totalApplications}
                      </div>
                      <Progress 
                        value={(student.applicationsSubmitted / student.totalApplications) * 100} 
                        className="h-2 mt-2" 
                      />
                    </div>

                    <div className="p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <GraduationCap className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium">Recommendations</span>
                      </div>
                      <div className="text-lg font-semibold">
                        {student.recsReceived}/{student.totalRecs}
                      </div>
                      <Progress 
                        value={(student.recsReceived / student.totalRecs) * 100} 
                        className="h-2 mt-2" 
                      />
                    </div>

                    <div className="p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-orange-600" />
                        <span className="text-sm font-medium">Avg Essay Score</span>
                      </div>
                      <div className="text-lg font-semibold">
                        {student.avgEssayScore}%
                      </div>
                      <div className={`text-xs mt-1 ${student.avgEssayScore >= 80 ? 'text-green-600' : student.avgEssayScore >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {student.avgEssayScore >= 80 ? 'Excellent' : student.avgEssayScore >= 70 ? 'Good' : 'Needs Improvement'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Aggregate Analytics Tab */}
        <TabsContent value="aggregate" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* All Schools Application Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Complete Application Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={applicationDistribution} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="school" type="category" width={80} />
                    <Tooltip />
                    <Bar dataKey="applications" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Essay Submission Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Essay Submissions Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={essayQualityTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="submissions" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Summary Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Essay Quality Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Excellent (85-100%)</span>
                    <span className="font-medium">8 students</span>
                  </div>
                  <Progress value={33} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Good (70-84%)</span>
                    <span className="font-medium">12 students</span>
                  </div>
                  <Progress value={50} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Needs Work (0-69%)</span>
                    <span className="font-medium">4 students</span>
                  </div>
                  <Progress value={17} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Application Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Submitted</span>
                    <span className="font-medium text-green-600">45</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">In Progress</span>
                    <span className="font-medium text-yellow-600">28</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Not Started</span>
                    <span className="font-medium text-red-600">12</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recommendation Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Received</span>
                    <span className="font-medium text-green-600">32</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Pending</span>
                    <span className="font-medium text-yellow-600">16</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Not Requested</span>
                    <span className="font-medium text-red-600">8</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Risk Analysis Tab */}
        <TabsContent value="risk" className="space-y-6">
          <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                <AlertTriangle className="h-5 w-5" />
                Students at Risk
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {atRiskStudents.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-4 bg-background rounded-lg border">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={student.avatar} alt={student.name} />
                        <AvatarFallback>
                          {student.name.split(' ').map(n => n.charAt(0)).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{student.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-muted-foreground">Progress:</span>
                          <Progress value={student.overallProgress} className="w-24 h-2" />
                          <span className="text-sm font-medium">{student.overallProgress}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={getRiskBadge(student.riskLevel)}>
                        {student.riskLevel.toUpperCase()} Risk
                      </Badge>
                      <div className="text-sm text-muted-foreground mt-1">
                        {student.essaysCompleted}/{student.totalEssays} essays completed
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Risk Factors Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Risk Factors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Missing Essays</span>
                    <Badge variant="destructive">3 students</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Pending Recommendations</span>
                    <Badge variant="secondary">5 students</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Approaching Deadlines</span>
                    <Badge variant="secondary">8 students</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Low Essay Quality</span>
                    <Badge variant="destructive">2 students</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommended Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                    <h4 className="font-medium text-red-700 dark:text-red-400 mb-1">Immediate Attention</h4>
                    <p className="text-sm text-red-600 dark:text-red-300">
                      Schedule urgent meetings with Sofia Johnson and 2 other high-risk students
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <h4 className="font-medium text-yellow-700 dark:text-yellow-400 mb-1">Follow Up Required</h4>
                    <p className="text-sm text-yellow-600 dark:text-yellow-300">
                      Check in with 5 students on recommendation status
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-medium text-blue-700 dark:text-blue-400 mb-1">Deadline Reminders</h4>
                    <p className="text-sm text-blue-600 dark:text-blue-300">
                      Send deadline alerts to 8 students with upcoming due dates
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ViewReports;