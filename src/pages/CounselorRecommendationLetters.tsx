import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  FileText, 
  CheckCircle, 
  Clock,
  Send,
  User,
  Search,
  Sparkles,
  Edit3,
  Eye,
  ChevronLeft,
  Award,
  Calendar,
  AlertCircle
} from "lucide-react";

interface StudentAnswer {
  refereeName: string;
  refereeRole: string;
  relationshipDuration: string;
  relationshipCapacity: string;
  meaningfulProject: string;
  bestMoment: string;
  difficultiesOvercome: string;
  strengths: string[];
  personalNotes: string;
}

interface RecommendationRequest {
  id: string;
  studentName: string;
  studentAvatar?: string;
  refereeName: string;
  refereeRole: string;
  status: 'new' | 'in-progress' | 'sent';
  submittedAt: string;
  studentAnswers: StudentAnswer;
  counselorNotes: string;
  generatedLetter: string;
}

const mockRequests: RecommendationRequest[] = [
  {
    id: '1',
    studentName: 'Emma Rodriguez',
    refereeName: 'Dr. Sarah Mitchell',
    refereeRole: 'AP Physics Teacher',
    status: 'new',
    submittedAt: '2024-11-20',
    studentAnswers: {
      refereeName: 'Dr. Sarah Mitchell',
      refereeRole: 'AP Physics Teacher',
      relationshipDuration: 'Dr. Mitchell has been my AP Physics teacher for the past two years (Grade 11 and 12). She also supervised my independent research project on electromagnetic induction.',
      relationshipCapacity: 'Beyond regular classes, I worked closely with Dr. Mitchell during office hours at least twice a week. She mentored me through my science fair project and helped me develop my research methodology.',
      meaningfulProject: 'My most meaningful project was designing and building a working electromagnetic motor for the science fair. Dr. Mitchell guided me through the theoretical foundations and helped me troubleshoot when my initial design failed. We spent many hours after school refining the project.',
      bestMoment: 'During a class discussion on quantum mechanics, I proposed an alternative explanation for wave-particle duality that connected to concepts from our previous unit. Dr. Mitchell encouraged me to explore this further and even suggested I present my thoughts to the advanced physics seminar.',
      difficultiesOvercome: 'I struggled significantly with thermodynamics at the start of Grade 11. Dr. Mitchell noticed my frustration and created a personalized study plan. With her support, I went from barely passing to achieving the highest score on our final thermodynamics exam.',
      strengths: ['Analytical thinking', 'Curiosity', 'Problem-solving', 'Initiative'],
      personalNotes: 'Dr. Mitchell knows about my goal to study physics at MIT. She has been incredibly supportive and has connected me with her former students who are now in graduate programs.'
    },
    counselorNotes: '',
    generatedLetter: ''
  },
  {
    id: '2',
    studentName: 'Michael Chen',
    refereeName: 'Mr. James Thompson',
    refereeRole: 'English Department Head',
    status: 'in-progress',
    submittedAt: '2024-11-18',
    studentAnswers: {
      refereeName: 'Mr. James Thompson',
      refereeRole: 'English Department Head, Creative Writing Instructor',
      relationshipDuration: 'Mr. Thompson has been my English teacher for three years and also leads the Creative Writing Club where I serve as president.',
      relationshipCapacity: 'Close mentoring relationship through both classes and extracurricular writing activities. He has reviewed countless drafts of my creative work and provided detailed feedback.',
      meaningfulProject: 'We collaborated on the school literary magazine revival. I led the student team while Mr. Thompson provided editorial guidance. The magazine won a regional award.',
      bestMoment: 'When I presented my personal narrative about my immigration experience, Mr. Thompson said it was one of the most powerful pieces he had read in his 20 years of teaching.',
      difficultiesOvercome: 'English is my second language. Mr. Thompson helped me see this as a strength rather than a weakness, encouraging me to incorporate my bilingual perspective into my writing.',
      strengths: ['Creativity', 'Leadership', 'Communication', 'Empathy'],
      personalNotes: 'Mr. Thompson has helped me understand that my unique background is an asset in my writing.'
    },
    counselorNotes: 'Michael has shown exceptional growth. Focus on his unique perspective as a bilingual writer and his leadership in reviving the literary magazine.',
    generatedLetter: ''
  },
  {
    id: '3',
    studentName: 'Sofia Johnson',
    refereeName: 'Dr. Maria Garcia',
    refereeRole: 'Biology Teacher & Research Mentor',
    status: 'sent',
    submittedAt: '2024-11-10',
    studentAnswers: {
      refereeName: 'Dr. Maria Garcia',
      refereeRole: 'AP Biology Teacher, Research Program Coordinator',
      relationshipDuration: 'Two years in AP Biology and one year in the research mentorship program.',
      relationshipCapacity: 'Very close - weekly one-on-one research meetings plus regular class instruction.',
      meaningfulProject: 'Summer research project on local wetland ecosystems. We published findings in a student journal.',
      bestMoment: 'Presenting our research at the state science symposium. Dr. Garcia said my presentation skills rivaled graduate students.',
      difficultiesOvercome: 'Learning to handle failure in research. My first three hypotheses were wrong, but Dr. Garcia taught me that negative results are still valuable data.',
      strengths: ['Analytical thinking', 'Discipline', 'Curiosity', 'Teamwork'],
      personalNotes: 'Dr. Garcia has been instrumental in my decision to pursue environmental science.'
    },
    counselorNotes: 'Sofia is an exceptional researcher. Highlight her resilience and scientific rigor.',
    generatedLetter: `Dear Admissions Committee,

I am writing to provide my strongest recommendation for Sofia Johnson, whom I have had the privilege of mentoring over the past two years in both AP Biology and our school's research program.

Sofia first caught my attention through her insatiable curiosity and methodical approach to scientific inquiry. Unlike many students who seek quick answers, Sofia embraces the process of discovery, understanding that meaningful research requires patience, precision, and persistence.

During our summer research project examining local wetland ecosystems, Sofia demonstrated exceptional scientific rigor. When her initial hypotheses proved incorrect, rather than becoming discouraged, she viewed these results as valuable data points that would guide her next steps. This resilience and intellectual maturity are rare in students her age.

Her ability to communicate complex scientific concepts is equally impressive. At the state science symposium, Sofia presented our findings with a confidence and clarity that rivaled graduate-level presentations. She has a gift for making technical information accessible without sacrificing accuracy.

Beyond her academic achievements, Sofia is a collaborative team member who elevates those around her. She regularly helps struggling classmates understand difficult concepts and has mentored younger students in our research program.

I recommend Sofia without reservation. She possesses the intellectual curiosity, work ethic, and character that will make her an outstanding addition to your academic community.

Sincerely,
Dr. Maria Garcia
AP Biology Teacher & Research Program Coordinator`
  }
];

const CounselorRecommendationLetters = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<RecommendationRequest | null>(null);
  const [counselorNotes, setCounselorNotes] = useState("");
  const [generatedLetter, setGeneratedLetter] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20"><CheckCircle className="h-3 w-3 mr-1" />Sent</Badge>;
      case 'in-progress':
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20"><Edit3 className="h-3 w-3 mr-1" />In Progress</Badge>;
      default:
        return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20"><AlertCircle className="h-3 w-3 mr-1" />New</Badge>;
    }
  };

  const filteredRequests = mockRequests.filter(req => {
    const matchesSearch = req.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         req.refereeName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleGenerateAI = async () => {
    if (!selectedRequest) return;
    
    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('enhance-recommendation', {
        body: {
          studentAnswers: selectedRequest.studentAnswers,
          counselorNotes: counselorNotes || selectedRequest.counselorNotes,
          studentName: selectedRequest.studentName,
          refereeName: selectedRequest.refereeName,
          refereeRole: selectedRequest.refereeRole,
        },
      });

      if (error) {
        throw error;
      }

      if (data?.letter) {
        setGeneratedLetter(data.letter);
        toast({
          title: "Letter Generated",
          description: "AI has generated a draft recommendation letter. Please review and edit as needed.",
        });
      } else if (data?.error) {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error('Error generating letter:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate letter. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendToStudent = () => {
    if (!generatedLetter && !selectedRequest?.generatedLetter) {
      toast({
        title: "No Letter to Send",
        description: "Please generate or write a letter before sending.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Letter Sent",
      description: `Recommendation letter has been sent to ${selectedRequest?.studentName}.`,
    });
    
    setSelectedRequest(null);
    setGeneratedLetter("");
    setCounselorNotes("");
  };

  // Analytics
  const totalRequests = mockRequests.length;
  const newRequests = mockRequests.filter(r => r.status === 'new').length;
  const inProgress = mockRequests.filter(r => r.status === 'in-progress').length;
  const sent = mockRequests.filter(r => r.status === 'sent').length;

  // Detail View
  if (selectedRequest) {
    const displayLetter = generatedLetter || selectedRequest.generatedLetter;
    
    return (
      <div className="p-6 space-y-6">
        <Button variant="ghost" onClick={() => { setSelectedRequest(null); setGeneratedLetter(""); setCounselorNotes(""); }}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to All Requests
        </Button>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={selectedRequest.studentAvatar} alt={selectedRequest.studentName} />
              <AvatarFallback>{selectedRequest.studentName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{selectedRequest.studentName}</h1>
              <p className="text-muted-foreground">Referee: {selectedRequest.refereeName} • {selectedRequest.refereeRole}</p>
            </div>
          </div>
          {getStatusBadge(selectedRequest.status)}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Student Input Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Student Input
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Section: Referee Context */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Referee Context</h3>
                
                <div>
                  <p className="text-sm font-medium text-foreground">Referee</p>
                  <p className="text-sm text-muted-foreground">{selectedRequest.studentAnswers.refereeName} - {selectedRequest.studentAnswers.refereeRole}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-foreground">Relationship Duration & Capacity</p>
                  <p className="text-sm text-muted-foreground">{selectedRequest.studentAnswers.relationshipDuration}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-foreground">Working Relationship</p>
                  <p className="text-sm text-muted-foreground">{selectedRequest.studentAnswers.relationshipCapacity}</p>
                </div>
              </div>

              {/* Section: Shared Work */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Shared Work & Examples</h3>
                
                <div>
                  <p className="text-sm font-medium text-foreground">Meaningful Project</p>
                  <p className="text-sm text-muted-foreground">{selectedRequest.studentAnswers.meaningfulProject}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-foreground">Best Moment</p>
                  <p className="text-sm text-muted-foreground">{selectedRequest.studentAnswers.bestMoment}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-foreground">Difficulties Overcome</p>
                  <p className="text-sm text-muted-foreground">{selectedRequest.studentAnswers.difficultiesOvercome}</p>
                </div>
              </div>

              {/* Section: Strengths */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Strengths</h3>
                
                <div className="flex flex-wrap gap-2">
                  {selectedRequest.studentAnswers.strengths.map((strength, index) => (
                    <Badge key={index} variant="secondary">{strength}</Badge>
                  ))}
                </div>

                {selectedRequest.studentAnswers.personalNotes && (
                  <div>
                    <p className="text-sm font-medium text-foreground">Personal Notes</p>
                    <p className="text-sm text-muted-foreground">{selectedRequest.studentAnswers.personalNotes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Letter Builder Section */}
          <div className="space-y-6">
            {/* Counselor Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit3 className="h-5 w-5 text-primary" />
                  Counselor Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Add your personal impressions, context, or framing notes..."
                  value={counselorNotes || selectedRequest.counselorNotes}
                  onChange={(e) => setCounselorNotes(e.target.value)}
                  rows={4}
                />
              </CardContent>
            </Card>

            {/* AI Enhancement */}
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="p-4">
                <Button 
                  onClick={handleGenerateAI} 
                  className="w-full"
                  disabled={isGenerating}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {isGenerating ? 'Generating...' : 'Enhance with AI'}
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Uses student answers + your notes to generate a refined letter
                </p>
              </CardContent>
            </Card>

            {/* Generated Letter */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Recommendation Letter
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Generate a letter using AI or write one manually..."
                  value={displayLetter}
                  onChange={(e) => setGeneratedLetter(e.target.value)}
                  rows={16}
                  className="font-serif"
                />
              </CardContent>
            </Card>

            {/* Send Action */}
            <Button onClick={handleSendToStudent} size="lg" className="w-full">
              <Send className="h-5 w-5 mr-2" />
              Send to Student
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Main List View
  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Recommendation Letters</h1>
          <p className="text-muted-foreground">Review student questionnaires and create recommendation letters</p>
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
                <p className="text-sm text-muted-foreground">Total Requests</p>
                <p className="text-2xl font-bold text-foreground">{totalRequests}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">New</p>
                <p className="text-2xl font-bold text-foreground">{newRequests}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Edit3 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-foreground">{inProgress}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sent</p>
                <p className="text-2xl font-bold text-foreground">{sent}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by student or referee name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Request Cards */}
      <div className="grid gap-4">
        {filteredRequests.map((request) => (
          <Card 
            key={request.id} 
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => {
              setSelectedRequest(request);
              setCounselorNotes(request.counselorNotes);
              setGeneratedLetter(request.generatedLetter);
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={request.studentAvatar} alt={request.studentName} />
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10">
                      {request.studentName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-foreground">{request.studentName}</p>
                    <p className="text-sm text-muted-foreground">{request.refereeName} • {request.refereeRole}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <Calendar className="h-3 w-3" />
                      Submitted: {request.submittedAt}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(request.status)}
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredRequests.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No recommendation requests found.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CounselorRecommendationLetters;