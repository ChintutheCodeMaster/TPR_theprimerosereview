import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  Upload, 
  MessageSquare, 
  CheckCircle, 
  Clock, 
  Calendar,
  Star,
  History,
  AlertCircle,
  TrendingUp,
  MessageCircle,
  Eye,
  Loader2
} from "lucide-react";

interface FeedbackItem {
  id: string;
  text: string;
  source: 'ai' | 'manual';
  criterionName?: string;
  color?: string;
}

interface CriterionScore {
  id: string;
  name: string;
  score: number;
  color: string;
}

interface AnalysisResult {
  overallScore: number;
  criteria: CriterionScore[];
  issues: any[];
}

interface EssayFeedback {
  id: string;
  essay_title: string;
  essay_content: string;
  essay_prompt: string | null;
  ai_analysis: AnalysisResult | null;
  feedback_items: FeedbackItem[];
  personal_message: string | null;
  status: string;
  created_at: string;
  sent_at: string | null;
}

const StudentPersonalArea = () => {
  const [activeTab, setActiveTab] = useState("essays");
  const [selectedEssay, setSelectedEssay] = useState<any>(null);
  const [essayFeedback, setEssayFeedback] = useState<EssayFeedback[]>([]);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);
  const { toast } = useToast();

  // Mock data for essays
  const essays = [
    {
      id: 1,
      title: "Common App Personal Statement",
      type: "Common App",
      prompt: "Some students have a background, identity, interest, or talent that is so meaningful they believe their application would be incomplete without it. If this sounds like you, then please share your story.",
      content: `Growing up in a bilingual household, I often found myself serving as a bridge between two worlds. My parents, immigrants from Mexico, spoke primarily Spanish at home, while I navigated the English-dominant world of my American school. This duality shaped my identity in ways I didn't fully understand until I was fifteen.

It started with a simple request. My mother needed help filling out medical forms at the hospital. What should have been a routine appointment became a defining moment. As I translated complex medical terminology, watching my mother's worried eyes scan the incomprehensible English words, I realized the weight of responsibility that language carries. One mistranslation could mean the wrong medication, the wrong diagnosis, the wrong outcome.

That day, I began volunteering at the local community health clinic as a translator. What I discovered went far beyond words. I learned that translation is not just about converting Spanish to English—it's about bridging cultural gaps, advocating for patients who feel invisible, and giving voice to those who struggle to express their fears in an unfamiliar language.

Mrs. Rodriguez, a grandmother who came in for what she thought was routine fatigue, became my most memorable patient. Through our conversations, I uncovered that she had been experiencing chest pain for weeks but was too afraid to mention it, believing her concerns would be dismissed. With careful translation and advocacy, I helped her communicate her symptoms clearly to the doctor. She was diagnosed with a cardiac condition that, left untreated, could have been fatal.

This experience transformed my understanding of healthcare disparities. I began researching the intersection of language access and health outcomes, discovering that limited English proficiency patients have higher rates of medical errors and worse health outcomes. This revelation sparked my passion for health equity and my determination to pursue medicine.

I organized a workshop series at the clinic, training other bilingual students to become medical interpreters. We developed a visual symptom chart in Spanish that now hangs in every examination room. These small changes have had measurable impact—patient satisfaction scores increased by 23% among Spanish-speaking patients.

My dual identity, once a source of confusion, has become my greatest strength. I no longer see myself as caught between two worlds, but as someone uniquely positioned to connect them. I want to become a physician who doesn't just treat symptoms, but who understands the complex cultural and linguistic barriers that prevent patients from receiving equitable care.

Every conversation I translate, every patient I advocate for, reinforces my commitment to a future in medicine. I am not just a bridge between languages—I am a bridge between communities, cultures, and ultimately, between patients and the care they deserve.`,
      wordCount: 647,
      targetWords: 650,
      status: "review",
      lastUpdated: "2 hours ago",
      deadline: "Nov 30, 2024",
      urgency: "critical",
      versions: 3
    },
    {
      id: 2,
      title: "UC Berkeley Supplemental",
      type: "UC Application",
      prompt: "Describe the most significant challenge you have faced and the steps you have taken to overcome this challenge. How has this challenge affected your academic achievement?",
      content: `The piano keys felt cold under my trembling fingers. Sixteen years of practice, countless hours of scales and arpeggios, and here I was, frozen on stage at the regional competition, my mind completely blank. The opening notes of Chopin's Ballade No. 1 had vanished from my memory like morning mist.

Those thirty seconds of silence felt like hours. The audience waited. My teacher watched from the front row, her expression a mixture of concern and encouragement. And I sat there, hands hovering over the keys, experiencing the most profound failure of my young life.

I don't remember walking off stage. I don't remember the car ride home. What I remember is the shame that followed—a heavy, persistent weight that made me avoid the piano for three weeks. My parents, both accomplished musicians, tried to comfort me, but their words felt hollow against the enormity of my public failure.

The turning point came unexpectedly. While helping my younger cousin with her first recital piece, I watched her stumble through "Mary Had a Little Lamb," hitting wrong notes with cheerful abandon. When she finished, she looked up with a proud smile and asked, "Did you hear? I only messed up twice!"

Her joy was untouched by perfectionism. She wasn't performing for approval or validation—she was making music because it made her happy. In that moment, I realized that somewhere along my sixteen-year journey, I had lost sight of why I started playing piano in the first place.

I returned to the piano with a different mindset. Instead of drilling competition pieces, I began improvising. I played music I genuinely loved—jazz standards, film scores, and yes, eventually, Chopin again. But this time, I played for myself, not for judges.`,
      wordCount: 280,
      targetWords: 350,
      status: "draft",
      lastUpdated: "1 day ago",
      deadline: "Nov 30, 2024",
      urgency: "critical",
      versions: 2
    },
    {
      id: 3,
      title: "Harvard Supplemental Essay",
      type: "Supplemental",
      prompt: "Briefly describe an intellectual experience that was important to you.",
      content: `The moment that changed everything happened at 2:47 AM in my bedroom, illuminated only by the glow of my computer screen. I had just trained my first neural network to recognize handwritten digits—and it worked.

Those ten glowing numbers on my screen represented more than a successful coding project. They represented possibility. If a machine could learn to see patterns in chaos, what else could it learn? Could it predict climate change patterns? Diagnose diseases from medical images? Help us understand the human brain itself?

That night sparked an obsession. I devoured research papers, built increasingly complex models, and crashed my laptop more times than I can count. When I created an AI that could predict local air quality with 89% accuracy using only publicly available data, I realized that machine learning wasn't just about algorithms—it was about finding invisible patterns that could solve real problems.`,
      wordCount: 150,
      targetWords: 200,
      status: "approved",
      lastUpdated: "3 days ago",
      deadline: "Dec 10, 2024",
      urgency: "normal",
      versions: 1
    },
    {
      id: 4,
      title: "Stanford Why Major Essay",
      type: "Supplemental",
      prompt: "Why are you interested in your chosen major?",
      content: "",
      wordCount: 0,
      targetWords: 250,
      status: "not-started",
      lastUpdated: "Never",
      deadline: "Dec 15, 2024",
      urgency: "normal",
      versions: 0
    }
  ];

  const tasks = [
    {
      id: 1,
      title: "Revise Common App essay introduction",
      description: "Focus on making the hook more compelling",
      dueDate: "Nov 28, 2024",
      status: "in-progress",
      assignedBy: "Ms. Johnson"
    },
    {
      id: 2,
      title: "Complete UC Berkeley supplemental essays",
      description: "Submit all 4 required supplemental essays",
      dueDate: "Nov 30, 2024",
      status: "not-started",
      assignedBy: "Ms. Johnson"
    },
    {
      id: 3,
      title: "Schedule mock interview session",
      description: "Prepare for Harvard alumni interview",
      dueDate: "Dec 5, 2024",
      status: "completed",
      assignedBy: "Ms. Johnson"
    }
  ];

  const feedback = [
    {
      id: 1,
      essayTitle: "Common App Personal Statement",
      type: "counselor",
      author: "Ms. Johnson",
      content: "Great progress on this draft! The storytelling is much clearer. Consider strengthening the conclusion to better connect back to your career goals.",
      timestamp: "2 hours ago",
      nextSteps: ["Revise conclusion paragraph", "Add more specific examples"]
    },
    {
      id: 2,
      essayTitle: "Common App Personal Statement",
      type: "analysis",
      author: "Essay Analysis",
      content: "Grammar: 95%, Tone: 88%, Prompt Alignment: 92%. Your essay demonstrates strong personal reflection and growth.",
      timestamp: "2 hours ago",
      strengths: ["Clear narrative structure", "Authentic voice"],
      improvements: ["More specific details", "Stronger conclusion"]
    }
  ];

  // Load feedback from database when essay is selected
  const loadEssayFeedback = async (essayTitle: string) => {
    setIsLoadingFeedback(true);
    try {
      const { data, error } = await supabase
        .from('essay_feedback')
        .select('*')
        .eq('essay_title', essayTitle)
        .in('status', ['sent', 'read'])
        .order('sent_at', { ascending: false });

      if (error) throw error;

      const typedData = (data || []).map(item => ({
        id: item.id,
        essay_title: item.essay_title,
        essay_content: item.essay_content,
        essay_prompt: item.essay_prompt,
        ai_analysis: item.ai_analysis as unknown as AnalysisResult | null,
        feedback_items: (item.feedback_items as unknown as FeedbackItem[]) || [],
        personal_message: item.personal_message,
        status: item.status,
        created_at: item.created_at,
        sent_at: item.sent_at,
      }));

      setEssayFeedback(typedData);

      // Mark as read
      if (typedData.length > 0) {
        const unread = typedData.filter(f => f.status === 'sent');
        for (const feedback of unread) {
          await supabase
            .from('essay_feedback')
            .update({ status: 'read' })
            .eq('id', feedback.id);
        }
      }
    } catch (error) {
      console.error("Error loading feedback:", error);
    } finally {
      setIsLoadingFeedback(false);
    }
  };

  const handleEssayClick = (essay: any) => {
    setSelectedEssay(essay);
    loadEssayFeedback(essay.title);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500 text-white';
      case 'review': return 'bg-yellow-500 text-white';
      case 'draft': return 'bg-blue-500 text-white';
      case 'not-started': return 'bg-gray-500 text-white';
      case 'completed': return 'bg-green-500 text-white';
      case 'in-progress': return 'bg-yellow-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'review': return <Clock className="h-4 w-4" />;
      case 'draft': return <FileText className="h-4 w-4" />;
      case 'not-started': return <AlertCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'in-progress': return <Clock className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'border-l-4 border-l-destructive';
      case 'important': return 'border-l-4 border-l-orange-500';
      default: return 'border-l-4 border-l-muted';
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Work</h1>
        <p className="text-muted-foreground">Manage your essays, tasks, and track your progress</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="essays">Essays</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
        </TabsList>

        {/* Essays Tab */}
        <TabsContent value="essays" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">My Essays</h2>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Upload New Essay
            </Button>
          </div>

          <div className="grid gap-4">
            {essays.map((essay) => (
              <Card 
                key={essay.id} 
                className={`${getUrgencyColor(essay.urgency)} cursor-pointer hover:shadow-md transition-all`}
                onClick={() => handleEssayClick(essay)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{essay.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{essay.type}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{essay.prompt}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(essay.status)}>
                        {getStatusIcon(essay.status)}
                        <span className="ml-1 capitalize">{essay.status.replace('-', ' ')}</span>
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
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
                      <p className="text-muted-foreground">Deadline</p>
                      <p className="font-medium">{essay.deadline}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Last Updated</p>
                      <p className="font-medium">{essay.lastUpdated}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Versions</p>
                      <p className="font-medium flex items-center gap-1">
                        <History className="h-3 w-3" />
                        {essay.versions}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline" onClick={(e) => e.stopPropagation()}>Edit</Button>
                    <Button size="sm" variant="outline" onClick={(e) => e.stopPropagation()}>View History</Button>
                    <Button size="sm" variant="outline" onClick={(e) => e.stopPropagation()}>Download</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Feedback Tab */}
        <TabsContent value="feedback" className="space-y-6">
          <h2 className="text-xl font-semibold">Feedback & Comments</h2>
          
          <div className="space-y-4">
            {feedback.map((item) => (
              <Card key={item.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    {item.type === 'counselor' ? (
                      <MessageCircle className="h-5 w-5 text-primary" />
                    ) : (
                      <Star className="h-5 w-5 text-primary" />
                    )}
                    <CardTitle className="text-lg">
                      {item.type === 'counselor' ? 'Counselor Feedback' : 'Essay Analysis'}
                    </CardTitle>
                    <Badge variant="outline">{item.essayTitle}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    By {item.author} • {item.timestamp}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">{item.content}</p>
                  
                  {item.type === 'counselor' && item.nextSteps && (
                    <div className="bg-muted/30 p-3 rounded-lg">
                      <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Next Steps
                      </h4>
                      <ul className="text-sm space-y-1">
                        {item.nextSteps.map((step, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {item.type === 'ai' && item.strengths && item.improvements && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
                        <h4 className="font-medium text-sm mb-2 text-green-700 dark:text-green-400">Strengths</h4>
                        <ul className="text-sm space-y-1">
                          {item.strengths.map((strength, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <CheckCircle className="h-3 w-3 text-green-600" />
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-orange-50 dark:bg-orange-950/20 p-3 rounded-lg">
                        <h4 className="font-medium text-sm mb-2 text-orange-700 dark:text-orange-400">Areas to Improve</h4>
                        <ul className="text-sm space-y-1">
                          {item.improvements.map((improvement, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <TrendingUp className="h-3 w-3 text-orange-600" />
                              {improvement}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-6">
          <h2 className="text-xl font-semibold">My Tasks</h2>
          
          <div className="space-y-4">
            {tasks.map((task) => (
              <Card key={task.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getStatusColor(task.status)}>
                          {getStatusIcon(task.status)}
                          <span className="ml-1 capitalize">{task.status.replace('-', ' ')}</span>
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Assigned by {task.assignedBy}
                        </span>
                      </div>
                      <h3 className="font-medium text-lg">{task.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Due: {task.dueDate}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {task.status !== 'completed' && (
                        <Button size="sm" variant="outline">Mark as Done</Button>
                      )}
                      <Button size="sm" variant="ghost">View Details</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Messages with Counselor</h2>
            <Button>
              <MessageSquare className="h-4 w-4 mr-2" />
              New Message
            </Button>
          </div>

          <Card>
            <CardContent className="p-4">
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Start a Conversation</h3>
                <p className="text-muted-foreground mb-4">
                  Send a message to your counselor for help with essays, applications, or any questions.
                </p>
                <Button>Send Your First Message</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Essay Detail Modal */}
      <Dialog open={!!selectedEssay} onOpenChange={() => setSelectedEssay(null)}>
        <DialogContent className="max-w-[900px] h-[85vh] p-0 flex flex-col">
          <DialogHeader className="p-6 pb-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl">{selectedEssay?.title}</DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">{selectedEssay?.type}</p>
              </div>
              <Badge className={getStatusColor(selectedEssay?.status || '')}>
                {getStatusIcon(selectedEssay?.status || '')}
                <span className="ml-1 capitalize">{selectedEssay?.status?.replace('-', ' ')}</span>
              </Badge>
            </div>
          </DialogHeader>

          <div className="flex-1 flex overflow-hidden">
            {/* Left Side - Essay Content */}
            <div className="flex-1 border-r">
              <div className="p-4 border-b bg-muted/30">
                <p className="text-sm text-muted-foreground font-medium">Prompt:</p>
                <p className="text-sm mt-1">{selectedEssay?.prompt}</p>
              </div>
              <ScrollArea className="h-[calc(100%-80px)]">
                <div className="p-4">
                  {selectedEssay?.content ? (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{selectedEssay.content}</p>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No content yet. Start writing your essay!</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Right Side - Counselor Feedback */}
            <div className="w-[350px] flex flex-col">
              <div className="p-4 border-b bg-primary/5">
                <h3 className="font-semibold flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-primary" />
                  Counselor Feedback
                </h3>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-4">
                  {isLoadingFeedback ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : essayFeedback.length > 0 ? (
                    <div className="space-y-4">
                      {essayFeedback.map((fb) => (
                        <Card key={fb.id} className="bg-card">
                          <CardContent className="p-4 space-y-3">
                            {/* Score */}
                            {fb.ai_analysis && (
                              <div className="flex items-center gap-2 pb-3 border-b">
                                <Star className="h-5 w-5 text-primary" />
                                <span className="font-bold text-lg">{fb.ai_analysis.overallScore}/100</span>
                              </div>
                            )}

                            {/* Personal Message */}
                            {fb.personal_message && (
                              <div className="bg-primary/10 p-3 rounded-lg">
                                <p className="text-xs font-medium text-primary mb-1">Personal Note:</p>
                                <p className="text-sm">{fb.personal_message}</p>
                              </div>
                            )}

                            {/* Feedback Items */}
                            {fb.feedback_items.length > 0 && (
                              <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground">Feedback Points:</p>
                                {fb.feedback_items.map((item, idx) => (
                                  <div key={item.id || idx} className="flex items-start gap-2 p-2 bg-muted/50 rounded">
                                    {item.color && (
                                      <div 
                                        className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" 
                                        style={{ backgroundColor: item.color }}
                                      />
                                    )}
                                    <div>
                                      {item.criterionName && (
                                        <span className="text-[10px] text-muted-foreground block">
                                          {item.criterionName}
                                        </span>
                                      )}
                                      <p className="text-xs">{item.text}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Criteria Breakdown */}
                            {fb.ai_analysis?.criteria && (
                              <div className="pt-2 border-t">
                                <p className="text-xs font-medium text-muted-foreground mb-2">Score Breakdown:</p>
                                <div className="space-y-1.5">
                                  {fb.ai_analysis.criteria.map((c) => (
                                    <div key={c.id} className="flex items-center gap-2">
                                      <div 
                                        className="w-2 h-2 rounded-full" 
                                        style={{ backgroundColor: c.color }}
                                      />
                                      <span className="text-xs flex-1 truncate">{c.name}</span>
                                      <span className="text-xs font-medium">{c.score}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            <p className="text-[10px] text-muted-foreground pt-2">
                              Received: {fb.sent_at ? new Date(fb.sent_at).toLocaleDateString() : 'Recently'}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <MessageCircle className="h-10 w-10 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">No feedback yet</p>
                      <p className="text-xs mt-1">Your counselor will review your essay soon</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t flex gap-2">
            <Button className="flex-1">
              <FileText className="h-4 w-4 mr-2" />
              Edit Essay
            </Button>
            <Button variant="outline" className="flex-1">
              <History className="h-4 w-4 mr-2" />
              View History
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentPersonalArea;
