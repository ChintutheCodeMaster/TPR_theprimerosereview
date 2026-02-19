import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useCounselorRecommendations, type RecommendationWithProfile } from "@/hooks/useRecommendationRequests";
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
  ChevronLeft,
  Award,
  Calendar,
  AlertCircle,
  Loader2
} from "lucide-react";

// Mock data for demo purposes
const mockRequests: RecommendationWithProfile[] = [
  {
    id: 'mock-1',
    student_id: 'student-1',
    referee_name: 'Dr. Sarah Mitchell',
    referee_role: 'AP Physics Teacher',
    status: 'pending',
    created_at: '2024-11-20T10:00:00Z',
    updated_at: '2024-11-20T10:00:00Z',
    relationship_duration: 'Dr. Mitchell has been my AP Physics teacher for the past two years (Grade 11 and 12). She also supervised my independent research project on electromagnetic induction.',
    relationship_capacity: 'Beyond regular classes, I worked closely with Dr. Mitchell during office hours at least twice a week. She mentored me through my science fair project and helped me develop my research methodology.',
    meaningful_project: 'My most meaningful project was designing and building a working electromagnetic motor for the science fair. Dr. Mitchell guided me through the theoretical foundations and helped me troubleshoot when my initial design failed.',
    best_moment: 'During a class discussion on quantum mechanics, I proposed an alternative explanation for wave-particle duality that connected to concepts from our previous unit. Dr. Mitchell encouraged me to explore this further.',
    difficulties_overcome: 'I struggled significantly with thermodynamics at the start of Grade 11. Dr. Mitchell noticed my frustration and created a personalized study plan. With her support, I went from barely passing to achieving the highest score.',
    strengths: ['Analytical thinking', 'Curiosity', 'Problem-solving', 'Initiative'],
    personal_notes: 'Dr. Mitchell knows about my goal to study physics at MIT. She has been incredibly supportive.',
    counselor_notes: null,
    generated_letter: null,
    profiles: {
      full_name: 'Emma Rodriguez',
      avatar_url: null,
      email: 'emma@student.com'
    }
  },
  {
    id: 'mock-2',
    student_id: 'student-2',
    referee_name: 'Mr. James Thompson',
    referee_role: 'English Department Head',
    status: 'in_progress',
    created_at: '2024-11-18T10:00:00Z',
    updated_at: '2024-11-19T10:00:00Z',
    relationship_duration: 'Mr. Thompson has been my English teacher for three years and also leads the Creative Writing Club where I serve as president.',
    relationship_capacity: 'Close mentoring relationship through both classes and extracurricular writing activities. He has reviewed countless drafts of my creative work.',
    meaningful_project: 'We collaborated on the school literary magazine revival. I led the student team while Mr. Thompson provided editorial guidance. The magazine won a regional award.',
    best_moment: 'When I presented my personal narrative about my immigration experience, Mr. Thompson said it was one of the most powerful pieces he had read in his 20 years of teaching.',
    difficulties_overcome: 'English is my second language. Mr. Thompson helped me see this as a strength rather than a weakness, encouraging me to incorporate my bilingual perspective.',
    strengths: ['Creativity', 'Leadership', 'Communication', 'Empathy'],
    personal_notes: 'Mr. Thompson has helped me understand that my unique background is an asset in my writing.',
    counselor_notes: 'Michael has shown exceptional growth. Focus on his unique perspective as a bilingual writer.',
    generated_letter: null,
    profiles: {
      full_name: 'Michael Chen',
      avatar_url: null,
      email: 'michael@student.com'
    }
  },
  {
    id: 'mock-3',
    student_id: 'student-3',
    referee_name: 'Dr. Maria Garcia',
    referee_role: 'Biology Teacher & Research Mentor',
    status: 'sent',
    created_at: '2024-11-10T10:00:00Z',
    updated_at: '2024-11-15T10:00:00Z',
    relationship_duration: 'Two years in AP Biology and one year in the research mentorship program.',
    relationship_capacity: 'Very close - weekly one-on-one research meetings plus regular class instruction.',
    meaningful_project: 'Summer research project on local wetland ecosystems. We published findings in a student journal.',
    best_moment: 'Presenting our research at the state science symposium. Dr. Garcia said my presentation skills rivaled graduate students.',
    difficulties_overcome: 'Learning to handle failure in research. My first three hypotheses were wrong, but Dr. Garcia taught me that negative results are still valuable.',
    strengths: ['Analytical thinking', 'Discipline', 'Curiosity', 'Teamwork'],
    personal_notes: 'Dr. Garcia has been instrumental in my decision to pursue environmental science.',
    counselor_notes: 'Sofia is an exceptional researcher. Highlight her resilience and scientific rigor.',
    generated_letter: `Dear Admissions Committee,

I am writing to provide my strongest recommendation for Sofia Johnson, whom I have had the privilege of mentoring over the past two years in both AP Biology and our school's research program.

Sofia first caught my attention through her insatiable curiosity and methodical approach to scientific inquiry. Unlike many students who seek quick answers, Sofia embraces the process of discovery, understanding that meaningful research requires patience, precision, and persistence.

During our summer research project examining local wetland ecosystems, Sofia demonstrated exceptional scientific rigor. When her initial hypotheses proved incorrect, rather than becoming discouraged, she viewed these results as valuable data points that would guide her next steps.

Her ability to communicate complex scientific concepts is equally impressive. At the state science symposium, Sofia presented our findings with a confidence and clarity that rivaled graduate-level presentations.

I recommend Sofia without reservation.

Sincerely,
Dr. Maria Garcia`,
    profiles: {
      full_name: 'Sofia Johnson',
      avatar_url: null,
      email: 'sofia@student.com'
    }
  }
];

const CounselorRecommendationLetters = () => {
  const { toast } = useToast();
  const { requests: dbRequests, isLoading, sendLetter, updateRequest } = useCounselorRecommendations();
  
  // Use mock data if no DB data available (for demo)
  const requests = dbRequests || [];
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<RecommendationWithProfile | null>(null);
  const [counselorNotes, setCounselorNotes] = useState("");
  const [generatedLetter, setGeneratedLetter] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20"><CheckCircle className="h-3 w-3 mr-1" />Sent</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20"><Edit3 className="h-3 w-3 mr-1" />In Progress</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20"><AlertCircle className="h-3 w-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="outline"><FileText className="h-3 w-3 mr-1" />Draft</Badge>;
    }
  };

  const filteredRequests = (requests || []).filter(req => {
    const studentName = req.profiles?.full_name || '';
    const matchesSearch = studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         req.referee_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleGenerateAI = async () => {
    if (!selectedRequest) return;
    
    setIsGenerating(true);
    
    try {
      const studentAnswers = {
        refereeName: selectedRequest.referee_name,
        refereeRole: selectedRequest.referee_role || '',
        relationshipDuration: selectedRequest.relationship_duration || '',
        relationshipCapacity: selectedRequest.relationship_capacity || '',
        meaningfulProject: selectedRequest.meaningful_project || '',
        bestMoment: selectedRequest.best_moment || '',
        difficultiesOvercome: selectedRequest.difficulties_overcome || '',
        strengths: selectedRequest.strengths || [],
        personalNotes: selectedRequest.personal_notes || '',
      };

      const { data, error } = await supabase.functions.invoke('enhance-recommendation', {
        body: {
          studentAnswers,
          counselorNotes: counselorNotes || selectedRequest.counselor_notes,
          studentName: selectedRequest.profiles?.full_name || 'Student',
          refereeName: selectedRequest.referee_name,
          refereeRole: selectedRequest.referee_role,
        },
      });

      if (error) throw error;

      if (data?.letter) {
        setGeneratedLetter(data.letter);
        // Only update DB if it's a real request (not mock data)
        if (!selectedRequest.id.startsWith('mock-')) {
          await updateRequest.mutateAsync({
            id: selectedRequest.id,
            status: 'in_progress',
            counselor_notes: counselorNotes || selectedRequest.counselor_notes,
          });
        }
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

  const handleSendToStudent = async () => {
    if (!selectedRequest) return;
    
    const letterToSend = generatedLetter || selectedRequest.generated_letter;
    if (!letterToSend) {
      toast({
        title: "No Letter to Send",
        description: "Please generate or write a letter before sending.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Only update DB if it's a real request (not mock data)
      if (!selectedRequest.id.startsWith('mock-')) {
        await sendLetter.mutateAsync({
          id: selectedRequest.id,
          letter: letterToSend,
        });
      } else {
        toast({
          title: "Letter Sent",
          description: "The recommendation letter has been sent to the student.",
        });
      }
      
      setSelectedRequest(null);
      setGeneratedLetter("");
      setCounselorNotes("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send letter.",
        variant: "destructive",
      });
    }
  };

  // Analytics
  const totalRequests = requests?.length || 0;
  const pendingRequests = requests?.filter(r => r.status === 'pending').length || 0;
  const inProgress = requests?.filter(r => r.status === 'in_progress').length || 0;
  const sent = requests?.filter(r => r.status === 'sent').length || 0;

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Detail View
  if (selectedRequest) {
    const displayLetter = generatedLetter || selectedRequest.generated_letter || '';
    const studentName = selectedRequest.profiles?.full_name || 'Unknown Student';
    
    return (
      <div className="p-6 space-y-6">
        <Button variant="ghost" onClick={() => { setSelectedRequest(null); setGeneratedLetter(""); setCounselorNotes(""); }}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to All Requests
        </Button>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={selectedRequest.profiles?.avatar_url || ''} alt={studentName} />
              <AvatarFallback>{studentName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{studentName}</h1>
              <p className="text-muted-foreground">Referee: {selectedRequest.referee_name} • {selectedRequest.referee_role}</p>
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
                  <p className="text-sm text-muted-foreground">{selectedRequest.referee_name} - {selectedRequest.referee_role}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-foreground">Relationship Duration & Capacity</p>
                  <p className="text-sm text-muted-foreground">{selectedRequest.relationship_duration || 'Not provided'}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-foreground">Working Relationship</p>
                  <p className="text-sm text-muted-foreground">{selectedRequest.relationship_capacity || 'Not provided'}</p>
                </div>
              </div>

              {/* Section: Shared Work */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Shared Work & Examples</h3>
                
                <div>
                  <p className="text-sm font-medium text-foreground">Meaningful Project</p>
                  <p className="text-sm text-muted-foreground">{selectedRequest.meaningful_project || 'Not provided'}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-foreground">Best Moment</p>
                  <p className="text-sm text-muted-foreground">{selectedRequest.best_moment || 'Not provided'}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-foreground">Difficulties Overcome</p>
                  <p className="text-sm text-muted-foreground">{selectedRequest.difficulties_overcome || 'Not provided'}</p>
                </div>
              </div>

              {/* Section: Strengths */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Strengths</h3>
                
                <div className="flex flex-wrap gap-2">
                  {(selectedRequest.strengths || []).map((strength, index) => (
                    <Badge key={index} variant="secondary">{strength}</Badge>
                  ))}
                </div>

                {selectedRequest.personal_notes && (
                  <div>
                    <p className="text-sm font-medium text-foreground">Personal Notes</p>
                    <p className="text-sm text-muted-foreground">{selectedRequest.personal_notes}</p>
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
                  value={counselorNotes || selectedRequest.counselor_notes || ''}
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
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
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
                  placeholder="Generated letter will appear here, or write your own..."
                  value={displayLetter}
                  onChange={(e) => setGeneratedLetter(e.target.value)}
                  rows={15}
                  className="font-serif"
                />
              </CardContent>
            </Card>

            {/* Send Button */}
            <Button 
              onClick={handleSendToStudent} 
              className="w-full" 
              size="lg"
              disabled={sendLetter.isPending}
            >
              {sendLetter.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Send Letter to Student
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
          <p className="text-muted-foreground">Manage recommendation requests from your students</p>
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
                <p className="text-sm text-muted-foreground">Total</p>
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
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-foreground">{pendingRequests}</p>
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

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by student or referee name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No recommendation requests found.</p>
            </CardContent>
          </Card>
        ) : (
          filteredRequests.map((request) => {
            const studentName = request.profiles?.full_name || 'Unknown Student';
            return (
              <Card
                key={request.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => {
                  setSelectedRequest(request);
                  setCounselorNotes(request.counselor_notes || '');
                  setGeneratedLetter(request.generated_letter || '');
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={request.profiles?.avatar_url || ''} alt={studentName} />
                        <AvatarFallback>{studentName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">{studentName}</p>
                        <p className="text-sm text-muted-foreground">
                          Referee: {request.referee_name} • {request.referee_role}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CounselorRecommendationLetters;
