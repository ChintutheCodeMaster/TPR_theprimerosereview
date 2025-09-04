import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  Search, 
  Filter, 
  Eye,
  MessageSquare,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  TrendingUp,
  User,
  Star,
  Download,
  Edit,
  Send
} from "lucide-react";

const ReviewEssays = () => {
  const [viewMode, setViewMode] = useState("cards");
  const [selectedEssays, setSelectedEssays] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    search: "",
    student: "",
    essayType: "",
    status: "",
    aiScoreRange: ""
  });
  const { toast } = useToast();

  // Mock essays data
  const essays = [
    {
      id: "1",
      title: "Common App Personal Statement",
      studentName: "Emma Rodriguez",
      studentAvatar: "/placeholder.svg",
      prompt: "Some students have a background, identity, interest, or talent...",
      wordCount: 520,
      targetWords: 650,
      status: "review",
      aiScore: 78,
      deadline: "Nov 30, 2024",
      urgency: "critical",
      lastUpdated: "2 hours ago",
      type: "Common App",
      daysLeft: 5,
      hasAIFeedback: true,
      hasCounselorComments: false,
      versions: 3
    },
    {
      id: "2",
      title: "Harvard Supplemental Essay",
      studentName: "Michael Chen",
      studentAvatar: "/placeholder.svg",
      prompt: "Briefly describe an intellectual experience...",
      wordCount: 450,
      targetWords: 500,
      status: "approved",
      aiScore: 92,
      deadline: "Dec 10, 2024",
      urgency: "normal",
      lastUpdated: "1 day ago",
      type: "Supplemental",
      daysLeft: 15,
      hasAIFeedback: true,
      hasCounselorComments: true,
      versions: 2
    },
    {
      id: "3",
      title: "UC Berkeley Supplemental",
      studentName: "Sofia Johnson",
      studentAvatar: "/placeholder.svg",
      prompt: "Describe the most significant challenge you have faced...",
      wordCount: 280,
      targetWords: 350,
      status: "draft",
      aiScore: 65,
      deadline: "Nov 30, 2024",
      urgency: "critical",
      lastUpdated: "3 days ago",
      type: "UC Application",
      daysLeft: 5,
      hasAIFeedback: true,
      hasCounselorComments: false,
      versions: 1
    },
    {
      id: "4",
      title: "Stanford Why Major Essay",
      studentName: "David Park",
      studentAvatar: "/placeholder.svg",
      prompt: "Why are you interested in your chosen major?",
      wordCount: 180,
      targetWords: 250,
      status: "needs-attention",
      aiScore: 45,
      deadline: "Dec 15, 2024",
      urgency: "important",
      lastUpdated: "5 days ago",
      type: "Supplemental",
      daysLeft: 20,
      hasAIFeedback: true,
      hasCounselorComments: true,
      versions: 1
    },
    {
      id: "5",
      title: "Common App Activities Essay",
      studentName: "Rachel Kim",
      studentAvatar: "/placeholder.svg",
      prompt: "Please briefly elaborate on one of your extracurricular activities...",
      wordCount: 150,
      targetWords: 150,
      status: "submitted",
      aiScore: 88,
      deadline: "Dec 1, 2024",
      urgency: "normal",
      lastUpdated: "1 week ago",
      type: "Common App",
      daysLeft: 10,
      hasAIFeedback: true,
      hasCounselorComments: true,
      versions: 4
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500 text-white';
      case 'submitted': return 'bg-blue-500 text-white';
      case 'review': return 'bg-yellow-500 text-white';
      case 'needs-attention': return 'bg-red-500 text-white';
      case 'draft': return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'submitted': return <CheckCircle className="h-4 w-4" />;
      case 'review': return <Clock className="h-4 w-4" />;
      case 'needs-attention': return <AlertCircle className="h-4 w-4" />;
      case 'draft': return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'border-l-4 border-l-destructive';
      case 'important': return 'border-l-4 border-l-orange-500';
      default: return 'border-l-4 border-l-muted';
    }
  };

  const getAIScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600 dark:text-green-400';
    if (score >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const handleSelectEssay = (essayId: string) => {
    setSelectedEssays(prev => 
      prev.includes(essayId) 
        ? prev.filter(id => id !== essayId)
        : [...prev, essayId]
    );
  };

  const handleBulkAction = (action: string) => {
    toast({
      title: `${action} Selected Essays`,
      description: `${action} applied to ${selectedEssays.length} essays.`,
    });
    setSelectedEssays([]);
  };

  const filteredEssays = essays.filter(essay => {
    return (
      (!filters.search || essay.title.toLowerCase().includes(filters.search.toLowerCase()) || 
       essay.studentName.toLowerCase().includes(filters.search.toLowerCase())) &&
      (!filters.student || essay.studentName === filters.student) &&
      (!filters.essayType || essay.type === filters.essayType) &&
      (!filters.status || essay.status === filters.status)
    );
  });

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Review Essays</h1>
          <p className="text-muted-foreground">View and provide feedback on student essays</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setViewMode(viewMode === "cards" ? "table" : "cards")}>
            {viewMode === "cards" ? "Table View" : "Card View"}
          </Button>
          <Button>
            <TrendingUp className="h-4 w-4 mr-2" />
            Analytics
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search essays or students..." 
                className="pl-10"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
            
            <Select value={filters.student} onValueChange={(value) => setFilters({ ...filters, student: value })}>
              <SelectTrigger>
                <SelectValue placeholder="All Students" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Students</SelectItem>
                <SelectItem value="Emma Rodriguez">Emma Rodriguez</SelectItem>
                <SelectItem value="Michael Chen">Michael Chen</SelectItem>
                <SelectItem value="Sofia Johnson">Sofia Johnson</SelectItem>
                <SelectItem value="David Park">David Park</SelectItem>
                <SelectItem value="Rachel Kim">Rachel Kim</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.essayType} onValueChange={(value) => setFilters({ ...filters, essayType: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Essay Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                <SelectItem value="Common App">Common App</SelectItem>
                <SelectItem value="Supplemental">Supplemental</SelectItem>
                <SelectItem value="UC Application">UC Application</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="review">In Review</SelectItem>
                <SelectItem value="needs-attention">Needs Attention</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.aiScoreRange} onValueChange={(value) => setFilters({ ...filters, aiScoreRange: value })}>
              <SelectTrigger>
                <SelectValue placeholder="AI Score" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Scores</SelectItem>
                <SelectItem value="85-100">Excellent (85-100)</SelectItem>
                <SelectItem value="70-84">Good (70-84)</SelectItem>
                <SelectItem value="0-69">Needs Work (0-69)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedEssays.length > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                {selectedEssays.length} essay{selectedEssays.length > 1 ? 's' : ''} selected
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('Review')}>
                  <Eye className="h-4 w-4 mr-2" />
                  Bulk Review
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('Send Feedback')}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Feedback
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('Download')}>
                  <Download className="h-4 w-4 mr-2" />
                  Download All
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Essays Display */}
      <div className={viewMode === "cards" ? "grid gap-4" : "space-y-4"}>
        {filteredEssays.map((essay) => (
          <Card key={essay.id} className={`${getUrgencyColor(essay.urgency)} hover:shadow-md transition-shadow`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                {/* Checkbox for selection */}
                <Checkbox 
                  checked={selectedEssays.includes(essay.id)}
                  onCheckedChange={() => handleSelectEssay(essay.id)}
                  className="mt-1"
                />

                {/* Student Avatar */}
                <Avatar className="h-12 w-12">
                  <AvatarImage src={essay.studentAvatar} alt={essay.studentName} />
                  <AvatarFallback>
                    {essay.studentName.split(' ').map(n => n.charAt(0)).join('')}
                  </AvatarFallback>
                </Avatar>

                {/* Essay Details */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{essay.title}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <User className="h-3 w-3" />
                        {essay.studentName} • {essay.type}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {essay.prompt}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(essay.status)}>
                        {getStatusIcon(essay.status)}
                        <span className="ml-1 capitalize">{essay.status.replace('-', ' ')}</span>
                      </Badge>
                    </div>
                  </div>

                  {/* Progress and Stats */}
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
                      <p className="text-muted-foreground">AI Quality Score</p>
                      <p className={`font-medium text-lg ${getAIScoreColor(essay.aiScore)}`}>
                        {essay.aiScore}%
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Deadline</p>
                      <p className="font-medium flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {essay.deadline}
                      </p>
                      <p className="text-xs text-muted-foreground">{essay.daysLeft} days left</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Last Updated</p>
                      <p className="font-medium">{essay.lastUpdated}</p>
                      <p className="text-xs text-muted-foreground">Version {essay.versions}</p>
                    </div>
                  </div>

                  {/* Feedback Indicators */}
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      {essay.hasAIFeedback ? (
                        <Star className="h-3 w-3 text-ai-accent" />
                      ) : (
                        <Star className="h-3 w-3 text-muted-foreground" />
                      )}
                      <span className={essay.hasAIFeedback ? "text-ai-accent" : "text-muted-foreground"}>
                        AI Analysis
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {essay.hasCounselorComments ? (
                        <MessageSquare className="h-3 w-3 text-primary" />
                      ) : (
                        <MessageSquare className="h-3 w-3 text-muted-foreground" />
                      )}
                      <span className={essay.hasCounselorComments ? "text-primary" : "text-muted-foreground"}>
                        Counselor Comments
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      View Essay
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4 mr-2" />
                      Add Feedback
                    </Button>
                    <Button size="sm" variant="outline">
                      <Send className="h-4 w-4 mr-2" />
                      Assign Task
                    </Button>
                    {essay.status === 'review' && (
                      <Button size="sm">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEssays.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Essays Found</h3>
            <p className="text-muted-foreground">
              No essays match your current filters. Try adjusting your search criteria.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReviewEssays;