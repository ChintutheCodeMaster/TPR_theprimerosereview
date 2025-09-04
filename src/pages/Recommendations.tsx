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
import { Textarea } from "@/components/ui/textarea";
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
  Send,
  Plus,
  GraduationCap,
  TrendingUp,
  AlertTriangle,
  Edit3,
  Save,
  Share,
  Bell,
  Award,
  Target,
  Lightbulb,
  Copy,
  Mail
} from "lucide-react";

interface Recommendation {
  id: string;
  studentName: string;
  studentAvatar?: string;
  studentId: string;
  targetSchools: string[];
  lettersNeeded: number;
  lettersCompleted: number;
  status: 'not-requested' | 'requested' | 'draft-in-progress' | 'submitted';
  deadline: string;
  urgent: boolean;
  studentInfo: {
    gpa: number;
    satScore?: number;
    actScore?: number;
    extracurriculars: string[];
    awards: string[];
    personalTraits: string[];
    intendedMajor: string;
    topSchools: string[];
  };
  notes: string;
  draftContent: string;
  version: number;
}

const mockRecommendations: Recommendation[] = [
  {
    id: '1',
    studentName: 'Emma Thompson',
    studentId: 'st1',
    targetSchools: ['Stanford', 'MIT', 'UC Berkeley'],
    lettersNeeded: 3,
    lettersCompleted: 2,
    status: 'draft-in-progress',
    deadline: '2024-01-15',
    urgent: false,
    studentInfo: {
      gpa: 3.9,
      satScore: 1520,
      extracurriculars: ['Debate Team Captain', 'Math Olympiad', 'Volunteer Tutor'],
      awards: ['National Merit Finalist', 'Science Fair 1st Place'],
      personalTraits: ['Natural leader', 'Analytical thinker', 'Excellent communicator'],
      intendedMajor: 'Computer Science',
      topSchools: ['Stanford', 'MIT', 'CalTech']
    },
    notes: 'Emphasize her leadership in debate team and analytical skills',
    draftContent: '',
    version: 2
  },
  {
    id: '2',
    studentName: 'Marcus Johnson',
    studentId: 'st2',
    targetSchools: ['Harvard', 'Yale', 'Princeton'],
    lettersNeeded: 2,
    lettersCompleted: 0,
    status: 'not-requested',
    deadline: '2024-01-12',
    urgent: true,
    studentInfo: {
      gpa: 4.0,
      actScore: 35,
      extracurriculars: ['Student Body President', 'Robotics Club', 'Community Service'],
      awards: ['Valedictorian', 'Presidential Volunteer Service Award'],
      personalTraits: ['Exceptional leader', 'Innovative problem solver', 'Compassionate'],
      intendedMajor: 'Political Science',
      topSchools: ['Harvard', 'Yale', 'Georgetown']
    },
    notes: 'Focus on leadership and community impact',
    draftContent: '',
    version: 1
  },
  {
    id: '3',
    studentName: 'Sophia Chen',
    studentId: 'st3',
    targetSchools: ['Johns Hopkins', 'Duke'],
    lettersNeeded: 2,
    lettersCompleted: 2,
    status: 'submitted',
    deadline: '2024-01-20',
    urgent: false,
    studentInfo: {
      gpa: 3.8,
      satScore: 1450,
      extracurriculars: ['Pre-Med Club', 'Hospital Volunteer', 'Research Assistant'],
      awards: ['Science Olympiad Gold Medal', 'Dean\'s List'],
      personalTraits: ['Dedicated researcher', 'Empathetic', 'Detail-oriented'],
      intendedMajor: 'Pre-Medicine',
      topSchools: ['Johns Hopkins', 'Duke', 'Emory']
    },
    notes: 'Highlight research experience and commitment to medicine',
    draftContent: 'I am pleased to recommend Sophia Chen for admission to your medical program...',
    version: 3
  }
];

const Recommendations = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [schoolFilter, setSchoolFilter] = useState("all");
  const [selectedRecommendations, setSelectedRecommendations] = useState<string[]>([]);
  const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null);
  const [letterTemplate, setLetterTemplate] = useState<'formal' | 'warm' | 'academic'>('formal');
  const [draftContent, setDraftContent] = useState("");
  const [showAISuggestions, setShowAISuggestions] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'default';
      case 'draft-in-progress': return 'secondary';
      case 'requested': return 'outline';
      case 'not-requested': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted': return CheckCircle;
      case 'draft-in-progress': return Edit3;
      case 'requested': return Clock;
      case 'not-requested': return AlertCircle;
      default: return FileText;
    }
  };

  const getDeadlineColor = (deadline: string, urgent: boolean) => {
    if (urgent) return 'text-destructive';
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const daysUntil = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntil < 0) return 'text-destructive';
    if (daysUntil <= 7) return 'text-warning';
    return 'text-foreground';
  };

  const filteredRecommendations = mockRecommendations.filter(rec => {
    const matchesSearch = rec.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rec.targetSchools.some(school => school.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || rec.status === statusFilter;
    const matchesSchool = schoolFilter === 'all' || rec.targetSchools.includes(schoolFilter);
    
    return matchesSearch && matchesStatus && matchesSchool;
  });

  const generateAIDraft = (student: Recommendation) => {
    const template = `Dear Admissions Committee,

I am writing to provide my highest recommendation for ${student.studentName}, who has been one of my most outstanding students during their time at our school.

${student.studentName} has demonstrated exceptional academic excellence with a GPA of ${student.studentInfo.gpa}${student.studentInfo.satScore ? ` and SAT score of ${student.studentInfo.satScore}` : ''}. Their commitment to ${student.studentInfo.intendedMajor} is evident through their involvement in ${student.studentInfo.extracurriculars.slice(0, 2).join(' and ')}.

What sets ${student.studentName} apart is their ${student.studentInfo.personalTraits.slice(0, 2).join(' and ')}. ${student.studentInfo.awards.length > 0 ? `Their achievements include ${student.studentInfo.awards.slice(0, 2).join(' and ')}, which speak to their dedication and excellence.` : ''}

I am confident that ${student.studentName} will make significant contributions to your academic community and excel in their chosen field of ${student.studentInfo.intendedMajor}.

Sincerely,
[Your Name]
[Your Title]`;

    setDraftContent(template);
  };

  // Analytics
  const totalRecommendations = mockRecommendations.length;
  const draftInProgress = mockRecommendations.filter(rec => rec.status === 'draft-in-progress').length;
  const submitted = mockRecommendations.filter(rec => rec.status === 'submitted').length;
  const overdue = mockRecommendations.filter(rec => rec.urgent).length;

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Recommendations</h1>
          <p className="text-muted-foreground">Create and manage student recommendation letters</p>
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
            AI Assistant
          </Button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <GraduationCap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Recommendations</p>
                <p className="text-2xl font-bold text-foreground">{totalRecommendations}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <Edit3 className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-foreground">{draftInProgress}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Submitted</p>
                <p className="text-2xl font-bold text-foreground">{submitted}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold text-foreground">{overdue}</p>
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
                placeholder="Search by student name or school..."
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
                  <SelectItem value="not-requested">Not Requested</SelectItem>
                  <SelectItem value="requested">Requested</SelectItem>
                  <SelectItem value="draft-in-progress">In Progress</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedRecommendations.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {selectedRecommendations.length} recommendation(s) selected
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

      {/* Recommendations Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-background">
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox />
                  </TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Target Schools</TableHead>
                  <TableHead>Letters Needed</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecommendations.map((recommendation) => {
                  const StatusIcon = getStatusIcon(recommendation.status);
                  
                  return (
                    <TableRow 
                      key={recommendation.id}
                      className={`hover:bg-muted/50 ${recommendation.urgent ? 'border-l-4 border-l-destructive' : ''}`}
                    >
                      <TableCell>
                        <Checkbox />
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={recommendation.studentAvatar} alt={recommendation.studentName} />
                            <AvatarFallback className="bg-gradient-secondary text-secondary-foreground text-xs">
                              {recommendation.studentName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-foreground">{recommendation.studentName}</p>
                            <p className="text-sm text-muted-foreground">{recommendation.studentInfo.intendedMajor}</p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          {recommendation.targetSchools.slice(0, 2).map((school, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {school}
                            </Badge>
                          ))}
                          {recommendation.targetSchools.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{recommendation.targetSchools.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {recommendation.lettersCompleted}/{recommendation.lettersNeeded}
                          </span>
                          <Progress 
                            value={(recommendation.lettersCompleted / recommendation.lettersNeeded) * 100} 
                            className="w-16 h-2"
                          />
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge 
                          variant={getStatusColor(recommendation.status) as any}
                          className="flex items-center gap-1 w-fit"
                        >
                          <StatusIcon className="h-3 w-3" />
                          {recommendation.status.replace('-', ' ')}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div className={getDeadlineColor(recommendation.deadline, recommendation.urgent)}>
                          <p className="font-medium">{recommendation.deadline}</p>
                          {recommendation.urgent && (
                            <div className="flex items-center gap-1 mt-1">
                              <AlertCircle className="h-3 w-3 text-destructive" />
                              <span className="text-xs text-destructive">Urgent</span>
                            </div>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  setSelectedRecommendation(recommendation);
                                  setDraftContent(recommendation.draftContent);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-3">
                                  <Avatar className="h-10 w-10">
                                    <AvatarImage src={recommendation.studentAvatar} alt={recommendation.studentName} />
                                    <AvatarFallback className="bg-gradient-secondary text-secondary-foreground">
                                      {recommendation.studentName.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <h2 className="text-xl font-bold">Recommendation for {recommendation.studentName}</h2>
                                    <p className="text-sm text-muted-foreground">
                                      {recommendation.targetSchools.join(', ')} • {recommendation.studentInfo.intendedMajor}
                                    </p>
                                  </div>
                                </DialogTitle>
                              </DialogHeader>

                              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Student Background Panel */}
                                <Card className="lg:col-span-1">
                                  <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                      <User className="h-5 w-5" />
                                      Student Background
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-4">
                                    <div>
                                      <h4 className="font-semibold mb-2">Academic Performance</h4>
                                      <ul className="text-sm space-y-1">
                                        <li>• GPA: {recommendation.studentInfo.gpa}</li>
                                        {recommendation.studentInfo.satScore && (
                                          <li>• SAT: {recommendation.studentInfo.satScore}</li>
                                        )}
                                        {recommendation.studentInfo.actScore && (
                                          <li>• ACT: {recommendation.studentInfo.actScore}</li>
                                        )}
                                      </ul>
                                    </div>

                                    <div>
                                      <h4 className="font-semibold mb-2">Extracurriculars</h4>
                                      <ul className="text-sm space-y-1">
                                        {recommendation.studentInfo.extracurriculars.map((activity, index) => (
                                          <li key={index}>• {activity}</li>
                                        ))}
                                      </ul>
                                    </div>

                                    <div>
                                      <h4 className="font-semibold mb-2">Awards & Achievements</h4>
                                      <ul className="text-sm space-y-1">
                                        {recommendation.studentInfo.awards.map((award, index) => (
                                          <li key={index}>• {award}</li>
                                        ))}
                                      </ul>
                                    </div>

                                    <div>
                                      <h4 className="font-semibold mb-2">Personal Traits</h4>
                                      <ul className="text-sm space-y-1">
                                        {recommendation.studentInfo.personalTraits.map((trait, index) => (
                                          <li key={index}>• {trait}</li>
                                        ))}
                                      </ul>
                                    </div>

                                    <div>
                                      <h4 className="font-semibold mb-2">Career Goals</h4>
                                      <p className="text-sm">Intended Major: {recommendation.studentInfo.intendedMajor}</p>
                                      <p className="text-sm">Top Schools: {recommendation.studentInfo.topSchools.join(', ')}</p>
                                    </div>
                                  </CardContent>
                                </Card>

                                {/* Letter Builder */}
                                <div className="lg:col-span-2 space-y-4">
                                  <Card>
                                    <CardHeader>
                                      <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2">
                                          <Edit3 className="h-5 w-5" />
                                          Recommendation Letter Builder
                                        </CardTitle>
                                        <div className="flex gap-2">
                                          <Select value={letterTemplate} onValueChange={(value) => setLetterTemplate(value as any)}>
                                            <SelectTrigger className="w-[130px]">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="formal">Formal</SelectItem>
                                              <SelectItem value="warm">Warm</SelectItem>
                                              <SelectItem value="academic">Academic</SelectItem>
                                            </SelectContent>
                                          </Select>
                                          <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => generateAIDraft(recommendation)}
                                            className="border-ai-accent/20 hover:bg-gradient-ai hover:text-primary-foreground"
                                          >
                                            <Sparkles className="h-4 w-4 mr-2 text-ai-accent" />
                                            Generate Draft
                                          </Button>
                                        </div>
                                      </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                      <div className="grid grid-cols-3 gap-2">
                                        <Button 
                                          variant="outline" 
                                          size="sm"
                                          onClick={() => setDraftContent(prev => prev + `GPA: ${recommendation.studentInfo.gpa}`)}
                                        >
                                          <Plus className="h-3 w-3 mr-1" />
                                          Insert GPA
                                        </Button>
                                        <Button 
                                          variant="outline" 
                                          size="sm"
                                          onClick={() => setDraftContent(prev => prev + recommendation.studentInfo.extracurriculars[0])}
                                        >
                                          <Plus className="h-3 w-3 mr-1" />
                                          Insert Activity
                                        </Button>
                                        <Button 
                                          variant="outline" 
                                          size="sm"
                                          onClick={() => setDraftContent(prev => prev + recommendation.studentInfo.personalTraits[0])}
                                        >
                                          <Plus className="h-3 w-3 mr-1" />
                                          Insert Trait
                                        </Button>
                                      </div>

                                      <div className="relative">
                                        <Textarea 
                                          value={draftContent}
                                          onChange={(e) => setDraftContent(e.target.value)}
                                          placeholder="Start writing the recommendation letter..."
                                          className="min-h-[400px] resize-none"
                                        />
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="absolute top-2 right-2"
                                          onClick={() => setShowAISuggestions(!showAISuggestions)}
                                        >
                                          <Lightbulb className="h-4 w-4 text-ai-accent" />
                                        </Button>
                                      </div>

                                      {showAISuggestions && (
                                        <Card className="bg-muted/30">
                                          <CardHeader>
                                            <CardTitle className="text-sm flex items-center gap-2">
                                              <Sparkles className="h-4 w-4 text-ai-accent" />
                                              AI Suggestions
                                            </CardTitle>
                                          </CardHeader>
                                          <CardContent className="space-y-2">
                                            <div className="p-2 bg-background rounded text-sm">
                                              "Consider mentioning their leadership in debate team to highlight communication skills."
                                            </div>
                                            <div className="p-2 bg-background rounded text-sm">
                                              "Add specific examples of their analytical thinking in mathematics."
                                            </div>
                                            <div className="p-2 bg-background rounded text-sm">
                                              "Include their volunteer work to show community engagement."
                                            </div>
                                          </CardContent>
                                        </Card>
                                      )}

                                      <div className="flex gap-2">
                                        <Button className="flex-1">
                                          <Save className="h-4 w-4 mr-2" />
                                          Save Draft
                                        </Button>
                                        <Button variant="outline" className="flex-1">
                                          <Share className="h-4 w-4 mr-2" />
                                          Share with Student
                                        </Button>
                                        <Button variant="outline">
                                          <Download className="h-4 w-4 mr-2" />
                                          Export PDF
                                        </Button>
                                        <Button variant="outline">
                                          <Mail className="h-4 w-4 mr-2" />
                                          Submit
                                        </Button>
                                      </div>
                                    </CardContent>
                                  </Card>

                                  {/* Version History */}
                                  <Card>
                                    <CardHeader>
                                      <CardTitle className="text-sm">Version History</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <div className="space-y-2">
                                        <div className="flex items-center justify-between p-2 border border-border rounded">
                                          <span className="text-sm">Version {recommendation.version} (Current)</span>
                                          <Badge>Current</Badge>
                                        </div>
                                        <div className="flex items-center justify-between p-2 border border-border rounded">
                                          <span className="text-sm">Version {recommendation.version - 1}</span>
                                          <Button variant="outline" size="sm">
                                            <Eye className="h-3 w-3 mr-1" />
                                            View
                                          </Button>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          
                          <Button variant="ghost" size="sm">
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {filteredRecommendations.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No recommendations found</h3>
            <p className="text-muted-foreground">Try adjusting your search terms or filters</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Recommendations;