import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useStudentRecommendations } from "@/hooks/useRecommendationRequests";
import { 
  FileText, 
  CheckCircle, 
  Clock,
  Send,
  User,
  Award,
  Sparkles,
  ChevronRight,
  Loader2
} from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type RecommendationRequest = Database["public"]["Tables"]["recommendation_requests"]["Row"];

// Mock data for demonstration
const mockRequests: RecommendationRequest[] = [
  {
    id: 'mock-1',
    student_id: 'mock-student',
    referee_name: 'Dr. Sarah Mitchell',
    referee_role: 'AP Physics Teacher',
    relationship_duration: 'Grade 11-12, Advanced Physics',
    relationship_capacity: 'Teacher and Science Club Advisor',
    meaningful_project: 'Led independent research on renewable energy',
    best_moment: 'Won regional science fair with solar panel project',
    difficulties_overcome: 'Struggled initially with calculus-based physics but showed remarkable improvement',
    strengths: ['Analytical thinking', 'Problem-solving', 'Curiosity'],
    personal_notes: '',
    counselor_notes: null,
    generated_letter: `Dear Admissions Committee,

It is with great enthusiasm that I write this letter of recommendation for Emma Johnson, whom I have had the privilege of teaching in Advanced Placement Physics for the past two years.

Emma stands out as one of the most intellectually curious and dedicated students I have encountered in my fifteen years of teaching. Her analytical abilities are exceptional – she approaches complex physics problems with a methodical precision that belies her age, yet maintains the creative flexibility to consider unconventional solutions.

What truly distinguishes Emma is her genuine passion for understanding the "why" behind scientific phenomena. During our unit on renewable energy, she independently designed and conducted an experiment on solar panel efficiency that won first place at the regional science fair. This project exemplified her ability to apply theoretical knowledge to real-world challenges.

I am confident that Emma will make significant contributions to any academic community she joins. She has my highest recommendation.

Sincerely,
Dr. Sarah Mitchell
AP Physics Teacher
British International School of Washington`,
    status: 'sent',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-20T14:30:00Z'
  },
  {
    id: 'mock-2',
    student_id: 'mock-student',
    referee_name: 'Mr. David Chen',
    referee_role: 'Mathematics Department Head',
    relationship_duration: 'Grade 10-12, Honors Mathematics',
    relationship_capacity: 'Teacher and Math Olympiad Coach',
    meaningful_project: 'Prepared for international math competition',
    best_moment: 'Solved a particularly challenging proof during class',
    difficulties_overcome: null,
    strengths: ['Analytical thinking', 'Leadership', 'Discipline'],
    personal_notes: 'Would like the letter to mention my tutoring work',
    counselor_notes: 'Working on this - strong candidate',
    generated_letter: null,
    status: 'in_progress',
    created_at: '2024-01-18T09:00:00Z',
    updated_at: '2024-01-19T11:00:00Z'
  },
  {
    id: 'mock-3',
    student_id: 'mock-student',
    referee_name: 'Ms. Rachel Torres',
    referee_role: 'English Literature Teacher',
    relationship_duration: 'Grade 11, AP English',
    relationship_capacity: 'Teacher and Creative Writing Club Supervisor',
    meaningful_project: null,
    best_moment: null,
    difficulties_overcome: null,
    strengths: ['Creativity', 'Communication'],
    personal_notes: '',
    counselor_notes: null,
    generated_letter: null,
    status: 'pending',
    created_at: '2024-01-20T15:00:00Z',
    updated_at: '2024-01-20T15:00:00Z'
  }
];

const StudentRecommendationLetters = () => {
  const { requests: dbRequests, isLoading, createRequest } = useStudentRecommendations();
  const [currentStep, setCurrentStep] = useState<'list' | 'form' | 'view'>('list');
  const [selectedRequest, setSelectedRequest] = useState<RecommendationRequest | null>(null);
  
  // Use mock data if no real requests exist
  const requests = dbRequests && dbRequests.length > 0 ? dbRequests : mockRequests;
  
  // Form state
  const [formData, setFormData] = useState({
    refereeName: '',
    refereeRole: '',
    relationshipDuration: '',
    relationshipCapacity: '',
    meaningfulProject: '',
    bestMoment: '',
    difficultiesOvercome: '',
    strengths: [] as string[],
    personalNotes: ''
  });

  const strengthOptions = [
    'Analytical thinking',
    'Creativity',
    'Leadership',
    'Teamwork',
    'Curiosity',
    'Discipline',
    'Empathy',
    'Initiative',
    'Problem-solving',
    'Communication'
  ];

  const handleStrengthToggle = (strength: string) => {
    setFormData(prev => ({
      ...prev,
      strengths: prev.strengths.includes(strength)
        ? prev.strengths.filter(s => s !== strength)
        : [...prev.strengths, strength]
    }));
  };

  const handleSubmit = async () => {
    if (!formData.refereeName || !formData.refereeRole || !formData.relationshipDuration) {
      return;
    }

    try {
      await createRequest.mutateAsync({
        referee_name: formData.refereeName,
        referee_role: formData.refereeRole,
        relationship_duration: formData.relationshipDuration,
        relationship_capacity: formData.relationshipCapacity,
        meaningful_project: formData.meaningfulProject,
        best_moment: formData.bestMoment,
        difficulties_overcome: formData.difficultiesOvercome,
        strengths: formData.strengths,
        personal_notes: formData.personalNotes,
        status: 'pending',
        student_id: '', // Will be set by the hook
      });

      setFormData({
        refereeName: '',
        refereeRole: '',
        relationshipDuration: '',
        relationshipCapacity: '',
        meaningfulProject: '',
        bestMoment: '',
        difficultiesOvercome: '',
        strengths: [],
        personalNotes: ''
      });
      setCurrentStep('list');
    } catch (error) {
      console.error('Error submitting:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20"><CheckCircle className="h-3 w-3 mr-1" />Received</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20"><Clock className="h-3 w-3 mr-1" />In Progress</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20"><Clock className="h-3 w-3 mr-1" />Pending Review</Badge>;
      default:
        return <Badge variant="outline"><FileText className="h-3 w-3 mr-1" />Draft</Badge>;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // View Letter Content
  if (currentStep === 'view' && selectedRequest) {
    return (
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => { setCurrentStep('list'); setSelectedRequest(null); }}>
          ← Back to Letters
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Recommendation Letter</CardTitle>
                <p className="text-muted-foreground mt-1">From {selectedRequest.referee_name}</p>
              </div>
              {getStatusBadge(selectedRequest.status)}
            </div>
          </CardHeader>
          <CardContent>
            {selectedRequest.generated_letter ? (
              <div className="bg-muted/30 rounded-lg p-6 whitespace-pre-wrap font-serif text-foreground leading-relaxed">
                {selectedRequest.generated_letter}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Your recommendation letter is being prepared.</p>
                <p className="text-sm mt-2">You will be notified once it's ready.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Questionnaire Form
  if (currentStep === 'form') {
    return (
      <div className="p-6 space-y-6 max-w-3xl mx-auto">
        <Button variant="ghost" onClick={() => setCurrentStep('list')}>
          ← Back to Letters
        </Button>

        {/* Intro Section */}
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-8 text-center">
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h1 className="text-2xl font-bold text-foreground mb-3">
              You are one step away from your recommendation letter
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              To make this recommendation as accurate and personal as possible, please complete the short questionnaire below.
              Your answers will help your counselor write the strongest letter on your behalf.
            </p>
          </CardContent>
        </Card>

        {/* Section 1: Referee Context */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Referee Context
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="refereeName">Who is this referee? *</Label>
              <Input
                id="refereeName"
                placeholder="Full name, role, subject taught or position at school"
                value={formData.refereeName}
                onChange={(e) => setFormData({ ...formData, refereeName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="refereeRole">Their role/position</Label>
              <Input
                id="refereeRole"
                placeholder="e.g., AP Physics Teacher, Math Department Head"
                value={formData.refereeRole}
                onChange={(e) => setFormData({ ...formData, refereeRole: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="relationshipDuration">How long have you known them and in what capacity? *</Label>
              <Textarea
                id="relationshipDuration"
                placeholder="e.g., taught me in Grade 11–12 Math, thesis supervisor, homeroom teacher"
                value={formData.relationshipDuration}
                onChange={(e) => setFormData({ ...formData, relationshipDuration: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="relationshipCapacity">How closely did you work together?</Label>
              <Textarea
                id="relationshipCapacity"
                placeholder="Classes only, one-on-one mentoring, extracurricular supervision, research project, leadership role, etc."
                value={formData.relationshipCapacity}
                onChange={(e) => setFormData({ ...formData, relationshipCapacity: e.target.value })}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Shared Work & Examples */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Shared Work & Concrete Examples
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="meaningfulProject">What is the most meaningful academic or personal project you did together?</Label>
              <Textarea
                id="meaningfulProject"
                placeholder="Briefly describe what you worked on and why it mattered"
                value={formData.meaningfulProject}
                onChange={(e) => setFormData({ ...formData, meaningfulProject: e.target.value })}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bestMoment">Can you describe one moment where this referee saw you at your best?</Label>
              <Textarea
                id="bestMoment"
                placeholder="A class discussion, project, challenge, leadership moment, or clear improvement over time"
                value={formData.bestMoment}
                onChange={(e) => setFormData({ ...formData, bestMoment: e.target.value })}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficultiesOvercome">Did you overcome any difficulty while working with them?</Label>
              <Textarea
                id="difficultiesOvercome"
                placeholder="Academic struggle, personal challenge, resilience, or growth"
                value={formData.difficultiesOvercome}
                onChange={(e) => setFormData({ ...formData, difficultiesOvercome: e.target.value })}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Strengths */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Your Strengths Through Their Eyes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>What do you think this referee would say you're especially strong at?</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {strengthOptions.map((strength) => (
                  <div key={strength} className="flex items-center space-x-2">
                    <Checkbox
                      id={strength}
                      checked={formData.strengths.includes(strength)}
                      onCheckedChange={() => handleStrengthToggle(strength)}
                    />
                    <Label htmlFor={strength} className="text-sm font-normal cursor-pointer">
                      {strength}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="personalNotes">Would you like to add a few personal notes for your counselor? (Optional)</Label>
              <Textarea
                id="personalNotes"
                placeholder="Any additional context or information you'd like to share..."
                value={formData.personalNotes}
                onChange={(e) => setFormData({ ...formData, personalNotes: e.target.value })}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <Button 
              onClick={handleSubmit} 
              size="lg" 
              className="w-full"
              disabled={createRequest.isPending || !formData.refereeName || !formData.refereeRole || !formData.relationshipDuration}
            >
              {createRequest.isPending ? (
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <Send className="h-5 w-5 mr-2" />
              )}
              Submit for Recommendation Letter
            </Button>
            <p className="text-center text-sm text-muted-foreground mt-3">
              Your counselor will review your answers and prepare your recommendation letter.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main List View
  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Recommendation Letters</h1>
          <p className="text-muted-foreground">Request and view your recommendation letters</p>
        </div>
        <Button onClick={() => setCurrentStep('form')}>
          <FileText className="h-4 w-4 mr-2" />
          Request New Letter
        </Button>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Requests</p>
                <p className="text-2xl font-bold text-foreground">{requests?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-foreground">
                  {requests?.filter(r => r.status === 'pending' || r.status === 'in_progress').length || 0}
                </p>
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
                <p className="text-sm text-muted-foreground">Received</p>
                <p className="text-2xl font-bold text-foreground">
                  {requests?.filter(r => r.status === 'sent').length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Letters List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Recommendation Letters</CardTitle>
        </CardHeader>
        <CardContent>
          {!requests || requests.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No recommendation letters yet.</p>
              <Button variant="outline" className="mt-4" onClick={() => setCurrentStep('form')}>
                Request Your First Letter
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => {
                    setSelectedRequest(request);
                    setCurrentStep('view');
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{request.referee_name}</p>
                      <p className="text-sm text-muted-foreground">{request.referee_role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Submitted</p>
                      <p className="text-sm font-medium">{new Date(request.created_at).toLocaleDateString()}</p>
                    </div>
                    {getStatusBadge(request.status)}
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentRecommendationLetters;
