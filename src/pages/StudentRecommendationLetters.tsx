import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  CheckCircle, 
  Clock,
  Send,
  User,
  Calendar,
  Award,
  Sparkles,
  ChevronRight,
  Eye
} from "lucide-react";

interface RecommendationRequest {
  id: string;
  refereeName: string;
  refereeRole: string;
  status: 'draft' | 'pending' | 'completed';
  submittedAt?: string;
  letterReceivedAt?: string;
  letterContent?: string;
}

const StudentRecommendationLetters = () => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<'list' | 'form' | 'view'>('list');
  const [selectedRequest, setSelectedRequest] = useState<RecommendationRequest | null>(null);
  
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

  // Mock submitted requests
  const [requests, setRequests] = useState<RecommendationRequest[]>([
    {
      id: '1',
      refereeName: 'Dr. Sarah Mitchell',
      refereeRole: 'AP Physics Teacher',
      status: 'completed',
      submittedAt: '2024-11-10',
      letterReceivedAt: '2024-11-20',
      letterContent: `Dear Admissions Committee,

I am writing to provide my highest recommendation for this outstanding student, whom I have had the pleasure of teaching in AP Physics for the past two years.

From the very first day of class, it was evident that this student possessed not only exceptional intellectual abilities but also a genuine passion for understanding the fundamental principles that govern our physical world. Their approach to problem-solving is both creative and methodical, demonstrating a rare combination of intuition and rigor.

What sets this student apart is their remarkable ability to connect theoretical concepts to real-world applications. During our unit on electromagnetism, they designed and built a working electromagnetic motor for their final project, going far beyond the requirements to explore advanced concepts in electromagnetic induction.

Beyond academics, this student has shown tremendous leadership in our school's Science Olympiad team, mentoring younger students and fostering a collaborative learning environment. Their empathy and patience in helping struggling classmates exemplify the kind of community-minded scholar any university would be fortunate to have.

I recommend this student without reservation. They will undoubtedly make significant contributions to your academic community.

Sincerely,
Dr. Sarah Mitchell
AP Physics Teacher`
    },
    {
      id: '2',
      refereeName: 'Mr. James Chen',
      refereeRole: 'Math Department Head',
      status: 'pending',
      submittedAt: '2024-11-15'
    }
  ]);

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

  const handleSubmit = () => {
    if (!formData.refereeName || !formData.refereeRole || !formData.relationshipDuration) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const newRequest: RecommendationRequest = {
      id: Date.now().toString(),
      refereeName: formData.refereeName,
      refereeRole: formData.refereeRole,
      status: 'pending',
      submittedAt: new Date().toISOString().split('T')[0]
    };

    setRequests(prev => [...prev, newRequest]);
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

    toast({
      title: "Questionnaire Submitted",
      description: "Your information has been sent to your counselor for review.",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20"><CheckCircle className="h-3 w-3 mr-1" />Received</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20"><Clock className="h-3 w-3 mr-1" />Pending Review</Badge>;
      default:
        return <Badge variant="outline"><FileText className="h-3 w-3 mr-1" />Draft</Badge>;
    }
  };

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
                <p className="text-muted-foreground mt-1">From {selectedRequest.refereeName}</p>
              </div>
              {getStatusBadge(selectedRequest.status)}
            </div>
          </CardHeader>
          <CardContent>
            {selectedRequest.letterContent ? (
              <div className="bg-muted/30 rounded-lg p-6 whitespace-pre-wrap font-serif text-foreground leading-relaxed">
                {selectedRequest.letterContent}
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
            <Button onClick={handleSubmit} size="lg" className="w-full">
              <Send className="h-5 w-5 mr-2" />
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
                <p className="text-2xl font-bold text-foreground">{requests.length}</p>
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
                  {requests.filter(r => r.status === 'pending').length}
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
                  {requests.filter(r => r.status === 'completed').length}
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
          {requests.length === 0 ? (
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
                    <div className="p-2 bg-muted rounded-full">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{request.refereeName}</p>
                      <p className="text-sm text-muted-foreground">{request.refereeRole}</p>
                      {request.submittedAt && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Calendar className="h-3 w-3" />
                          Submitted: {request.submittedAt}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(request.status)}
                    {request.status === 'completed' && (
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    )}
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
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