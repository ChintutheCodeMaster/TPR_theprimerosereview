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
import { Textarea } from "@/components/ui/textarea";
import { EssayFeedbackModal } from "@/components/EssayFeedbackModal";
import { CounselorFeedbackHistory } from "@/components/CounselorFeedbackHistory";
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
  Share,
  BarChart3,
  Calendar,
  User,
  Star,
  ArrowUpDown,
  LayoutGrid,
  List
} from "lucide-react";

interface Essay {
  id: string;
  title: string;
  studentName: string;
  studentAvatar?: string;
  prompt: string;
  wordCount: number;
  targetWords: number;
  status: 'draft' | 'in-review' | 'submitted' | 'needs-attention';
  aiScore: number;
  lastUpdated: string;
  dueDate: string;
  essayType: 'common-app' | 'supplemental' | 'ucas' | 'scholarship';
  content: string;
  feedback: string[];
  versions: number;
  urgent: boolean;
}

const mockEssays: Essay[] = [
  {
    id: '1',
    title: 'Common App Personal Statement',
    studentName: 'Emma Thompson',
    prompt: 'Some students have a background, identity, interest, or talent that is so meaningful they believe their application would be incomplete without it. If this sounds like you, then please share your story.',
    wordCount: 647,
    targetWords: 650,
    status: 'in-review',
    aiScore: 82,
    lastUpdated: '2 hours ago',
    dueDate: '2024-01-15',
    essayType: 'common-app',
    content: `Growing up in a bilingual household, I often found myself serving as a bridge between two worlds. My parents, immigrants from Mexico, spoke primarily Spanish at home, while I navigated the English-dominant world of my American school. This duality shaped my identity in ways I didn't fully understand until I was fifteen.

It started with a simple request. My mother needed help filling out medical forms at the hospital. What should have been a routine appointment became a defining moment. As I translated complex medical terminology, watching my mother's worried eyes scan the incomprehensible English words, I realized the weight of responsibility that language carries. One mistranslation could mean the wrong medication, the wrong diagnosis, the wrong outcome.

That day, I began volunteering at the local community health clinic as a translator. What I discovered went far beyond words. I learned that translation is not just about converting Spanish to English—it's about bridging cultural gaps, advocating for patients who feel invisible, and giving voice to those who struggle to express their fears in an unfamiliar language.

Mrs. Rodriguez, a grandmother who came in for what she thought was routine fatigue, became my most memorable patient. Through our conversations, I uncovered that she had been experiencing chest pain for weeks but was too afraid to mention it, believing her concerns would be dismissed. With careful translation and advocacy, I helped her communicate her symptoms clearly to the doctor. She was diagnosed with a cardiac condition that, left untreated, could have been fatal.

This experience transformed my understanding of healthcare disparities. I began researching the intersection of language access and health outcomes, discovering that limited English proficiency patients have higher rates of medical errors and worse health outcomes. This revelation sparked my passion for health equity and my determination to pursue medicine.

I organized a workshop series at the clinic, training other bilingual students to become medical interpreters. We developed a visual symptom chart in Spanish that now hangs in every examination room. These small changes have had measurable impact—patient satisfaction scores increased by 23% among Spanish-speaking patients.

My dual identity, once a source of confusion, has become my greatest strength. I no longer see myself as caught between two worlds, but as someone uniquely positioned to connect them. I want to become a physician who doesn't just treat symptoms, but who understands the complex cultural and linguistic barriers that prevent patients from receiving equitable care.

Every conversation I translate, every patient I advocate for, reinforces my commitment to a future in medicine. I am not just a bridge between languages—I am a bridge between communities, cultures, and ultimately, between patients and the care they deserve.`,
    feedback: ['Strong opening hook', 'Consider adding more specific examples'],
    versions: 3,
    urgent: false
  },
  {
    id: '2',
    title: 'Why Stanford Essay',
    studentName: 'Marcus Johnson',
    prompt: 'The Stanford community is deeply curious and driven to learn in and out of the classroom. Reflect on an idea or experience that makes you genuinely excited about learning.',
    wordCount: 248,
    targetWords: 250,
    status: 'in-review',
    aiScore: 88,
    lastUpdated: '1 day ago',
    dueDate: '2024-01-20',
    essayType: 'supplemental',
    content: `The moment that changed everything happened at 2:47 AM in my bedroom, illuminated only by the glow of my computer screen. I had just trained my first neural network to recognize handwritten digits—and it worked.

Those ten glowing numbers on my screen represented more than a successful coding project. They represented possibility. If a machine could learn to see patterns in chaos, what else could it learn? Could it predict climate change patterns? Diagnose diseases from medical images? Help us understand the human brain itself?

That night sparked an obsession. I devoured research papers, built increasingly complex models, and crashed my laptop more times than I can count. When I created an AI that could predict local air quality with 89% accuracy using only publicly available data, I realized that machine learning wasn't just about algorithms—it was about finding invisible patterns that could solve real problems.

At Stanford, I'm excited to explore the intersection of AI and social impact through courses like CS 229 and the Stanford AI Lab's research on healthcare applications. Professor Fei-Fei Li's work on computer vision aligns perfectly with my passion for using technology to address environmental challenges.

But learning at Stanford extends beyond classrooms. I want to collaborate with students from different disciplines—combining my technical skills with the insights of environmental scientists, policy experts, and designers to tackle problems no single field can solve alone.

The curiosity that kept me awake that night still drives me. Stanford is where I want to turn that curiosity into impact.`,
    feedback: ['Excellent technical explanation', 'Great conclusion'],
    versions: 4,
    urgent: false
  },
  {
    id: '3',
    title: 'Common App - Overcoming Challenges',
    studentName: 'Sophia Chen',
    prompt: 'The lessons we take from obstacles we encounter can be fundamental to later success. Recount a time when you faced a challenge, setback, or failure. How did it affect you, and what did you learn from the experience?',
    wordCount: 621,
    targetWords: 650,
    status: 'needs-attention',
    aiScore: 65,
    lastUpdated: '5 days ago',
    dueDate: '2024-01-12',
    essayType: 'common-app',
    content: `The piano keys felt cold under my trembling fingers. Sixteen years of practice, countless hours of scales and arpeggios, and here I was, frozen on stage at the regional competition, my mind completely blank. The opening notes of Chopin's Ballade No. 1 had vanished from my memory like morning mist.

Those thirty seconds of silence felt like hours. The audience waited. My teacher watched from the front row, her expression a mixture of concern and encouragement. And I sat there, hands hovering over the keys, experiencing the most profound failure of my young life.

I don't remember walking off stage. I don't remember the car ride home. What I remember is the shame that followed—a heavy, persistent weight that made me avoid the piano for three weeks. My parents, both accomplished musicians, tried to comfort me, but their words felt hollow against the enormity of my public failure.

The turning point came unexpectedly. While helping my younger cousin with her first recital piece, I watched her stumble through "Mary Had a Little Lamb," hitting wrong notes with cheerful abandon. When she finished, she looked up with a proud smile and asked, "Did you hear? I only messed up twice!"

Her joy was untouched by perfectionism. She wasn't performing for approval or validation—she was making music because it made her happy. In that moment, I realized that somewhere along my sixteen-year journey, I had lost sight of why I started playing piano in the first place.

I returned to the piano with a different mindset. Instead of drilling competition pieces, I began improvising. I played music I genuinely loved—jazz standards, film scores, and yes, eventually, Chopin again. But this time, I played for myself, not for judges.

The transformation extended beyond music. I had always been driven by external validation—grades, awards, recognition. My failure on stage forced me to confront an uncomfortable truth: I had built my identity around achievement rather than genuine passion. This realization changed how I approached everything.

In my junior year, I started a peer tutoring program, not because it would look good on college applications, but because I discovered genuine joy in helping others understand difficult concepts. When experiments failed in my research internship, I learned to see them as data points rather than personal defeats.

I did compete again, eventually. At this year's state competition, I performed Rachmaninoff's Prelude in G Minor. There was a moment, midway through, when my fingers hesitated—and my old fear surged back. But instead of freezing, I breathed, listened to the music, and let my fingers find their way back.

I didn't win that competition. But I finished. And when I played the final chord, I felt something I hadn't experienced in years: pure, uncomplicated joy.

Failure taught me that perfection is not the goal—growth is. It taught me that my worth isn't measured by external achievements, but by my willingness to take risks, learn from mistakes, and keep playing despite the possibility of hitting wrong notes.

The piano still sits in my living room. Most evenings, you'll find me there, not practicing for any competition, but simply playing—imperfectly, joyfully, freely.`,
    feedback: ['Needs stronger opening', 'Add more reflection on growth'],
    versions: 2,
    urgent: true
  },
  {
    id: '4',
    title: 'MIT Supplemental - Community',
    studentName: 'Alex Rivera',
    prompt: 'Describe the world you come from; for example, your family, school, community, city, or town. How has that world shaped your dreams and aspirations?',
    wordCount: 243,
    targetWords: 250,
    status: 'draft',
    aiScore: 75,
    lastUpdated: '3 hours ago',
    dueDate: '2024-01-18',
    essayType: 'supplemental',
    content: `In my neighborhood in East Los Angeles, the sound of car engines is as common as birdsong. But these aren't ordinary engines—they're projects, passion, and legacy, echoing from dozens of home garages where fathers teach sons the art of automotive restoration.

My world smells like motor oil and sounds like cumbia music drifting from open garage doors. Here, a 1964 Chevy Impala isn't just a car—it's a rolling piece of art, a connection to Mexican-American heritage, and proof that beauty can emerge from rust and determination.

My father's hands, permanently stained with grease, taught me more than engine mechanics. They taught me that engineering is about understanding how systems work together, that problem-solving requires both creativity and precision, and that some problems reveal themselves only when you're willing to get dirty.

When I rebuilt my first carburetor at thirteen, I didn't know I was falling in love with mechanical engineering. When I helped my neighbor diagnose an electrical short using a multimeter, I didn't realize I was learning systematic debugging. My community's lowrider culture was my first laboratory.

At MIT, I want to apply this hands-on foundation to sustainable transportation engineering. The same passion that drives my community to restore classic cars drives me to reimagine what cars can become. I dream of designing electric vehicles that honor the aesthetic traditions of lowrider culture while embracing clean technology.

My neighborhood taught me that engineering is not just about solving problems—it's about honoring where you come from while building toward where you want to go.`,
    feedback: [],
    versions: 2,
    urgent: false
  },
  {
    id: '5',
    title: 'Yale Supplemental - Why Yale',
    studentName: 'Priya Sharma',
    prompt: 'What is it about Yale that has led you to apply?',
    wordCount: 198,
    targetWords: 200,
    status: 'submitted',
    aiScore: 91,
    lastUpdated: '4 days ago',
    dueDate: '2024-01-02',
    essayType: 'supplemental',
    content: `When I visited Yale last spring, I got lost. Wandering through the residential colleges, I stumbled into an impromptu debate about constitutional law happening in a courtyard. A philosophy major was arguing with a computer science student about AI rights, while an art history major sketched the scene.

No one asked me what I was studying. They asked what I was thinking.

That's the Yale I want to join—a community where intellectual boundaries dissolve and curiosity transcends disciplines. As someone passionate about both neuroscience and creative writing, I'm drawn to Yale's unique combination of rigorous science and vibrant humanities.

The STARS II program would allow me to explore my research interest in memory formation, while the Daily Themes writing course would challenge me to communicate complex scientific ideas accessibly. I envision writing my senior thesis on the neuroscience of storytelling—understanding how narratives literally shape our brains.

But Yale offers more than academic opportunities. Living in Silliman College, participating in intramural "broomball," grabbing late-night pizza at Yorkside—these experiences of community and belonging matter as much as classroom learning.

That day I got lost at Yale, I actually found exactly what I was looking for: a place where getting lost leads to unexpected discoveries.`,
    feedback: ['Perfect length', 'Excellent specific details'],
    versions: 5,
    urgent: false
  },
  {
    id: '6',
    title: 'Common App - Meaningful Activity',
    studentName: 'Jordan Williams',
    prompt: 'Describe an activity, interest, experience, or achievement that is meaningful to you. Why is it meaningful?',
    wordCount: 589,
    targetWords: 650,
    status: 'in-review',
    aiScore: 72,
    lastUpdated: '6 hours ago',
    dueDate: '2024-01-25',
    essayType: 'common-app',
    content: `Every Saturday morning at 6 AM, I stand in a commercial kitchen surrounded by fifty pounds of onions, industrial-sized pots, and a team of volunteers ranging from retirees to fellow high schoolers. Welcome to the Community Kitchen, where I've spent the last three years learning that feeding people is about much more than food.

I started volunteering because my guidance counselor suggested it would look good on college applications. I'll be honest about that. But what kept me coming back, week after week, had nothing to do with resume building. It was the conversations.

Between chopping vegetables and stirring soup, I've listened to stories that textbooks never told me. Mr. Henderson, who served in Vietnam and now lives in his car, taught me about dignity and how easily it can be stripped away. Maria, a single mother of three, explained how a single medical emergency can cascade into housing instability. Tom, a former accountant, showed me how quickly life can change directions.

These relationships challenged my assumptions. I grew up in a comfortable suburb where poverty was something that happened somewhere else, to someone else. Working at the Kitchen, I learned that the line between stability and struggle is thinner than I ever imagined—and that the people on both sides of that line share more similarities than differences.

But I didn't just learn by listening. I learned by doing.

When I noticed that our weekend meal distribution missed families who worked Saturday jobs, I proposed an evening pickup option. It took three months of advocacy, schedule coordination, and volunteer recruitment, but we now serve 40 additional families each week. When I saw that our elderly guests struggled to carry heavy meal containers, I organized a delivery volunteer network using my school's Key Club members.

Last year, I took on a bigger challenge: food waste. I calculated that we were throwing away nearly 200 pounds of usable produce monthly due to cosmetic imperfections. Working with local grocery stores and farmers, I established a "rescued produce" program that redirects imperfect but nutritious vegetables to our kitchen. This single initiative saves approximately $800 monthly in food costs.

The Kitchen taught me that meaningful change doesn't require grand gestures—it requires showing up consistently, listening carefully, and being willing to tackle problems one onion at a time. It taught me that service is not about helping "those people" but about building community with fellow human beings.

These experiences have shaped my academic interests. I now plan to study public policy with a focus on food security. The statistics I've read about hunger in America are no longer abstract numbers—they have faces, stories, and names. I understand that solving complex social problems requires both systemic policy changes and individual human connections.

This Saturday, like every Saturday, my alarm will ring at 5:15 AM. I'll drive to the Kitchen in the pre-dawn darkness, tie on my apron, and start chopping onions. And somewhere between the first onion and the last bowl of soup, I'll remember why I keep coming back.

Because community isn't something you study. It's something you build—one meal, one conversation, one Saturday morning at a time.`,
    feedback: ['Strong storytelling', 'Consider deeper reflection on personal growth'],
    versions: 3,
    urgent: false
  }
];

const Essays = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("lastUpdated");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedEssay, setSelectedEssay] = useState<Essay | null>(null);
  const [feedbackModalEssay, setFeedbackModalEssay] = useState<Essay | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'default';
      case 'in-review': return 'secondary';
      case 'needs-attention': return 'destructive';
      case 'draft': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted': return CheckCircle;
      case 'in-review': return Clock;
      case 'needs-attention': return AlertCircle;
      case 'draft': return FileText;
      default: return FileText;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'common-app': return 'Common App';
      case 'supplemental': return 'Supplemental';
      case 'ucas': return 'UCAS';
      case 'scholarship': return 'Scholarship';
      default: return type;
    }
  };

  const filteredEssays = mockEssays.filter(essay => {
    const matchesSearch = essay.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         essay.studentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || essay.status === statusFilter;
    const matchesType = typeFilter === 'all' || essay.essayType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'dueDate':
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      case 'aiScore':
        return b.aiScore - a.aiScore;
      case 'urgent':
        return b.urgent ? 1 : -1;
      default:
        return 0;
    }
  });

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Essays</h1>
          <p className="text-muted-foreground">Manage and review student essays</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline" size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="border-ai-accent/20 hover:bg-gradient-ai hover:text-primary-foreground"
          >
            <Sparkles className="h-4 w-4 mr-2 text-ai-accent" />
            Bulk Review
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Essays</p>
                <p className="text-2xl font-bold text-foreground">24</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">In Review</p>
                <p className="text-2xl font-bold text-foreground">8</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <AlertCircle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Needs Attention</p>
                <p className="text-2xl font-bold text-foreground">3</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-ai-accent/10 rounded-lg">
                <Star className="h-5 w-5 text-ai-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg AI Score</p>
                <p className="text-2xl font-bold text-foreground">82</p>
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
                placeholder="Search essays by title or student name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="in-review">In Review</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="needs-attention">Needs Attention</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="common-app">Common App</SelectItem>
                  <SelectItem value="supplemental">Supplemental</SelectItem>
                  <SelectItem value="ucas">UCAS</SelectItem>
                  <SelectItem value="scholarship">Scholarship</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lastUpdated">Latest</SelectItem>
                  <SelectItem value="dueDate">Due Date</SelectItem>
                  <SelectItem value="aiScore">AI Score</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4" />
              </Button>

              <div className="flex border rounded-md">
                <Button 
                  variant={viewMode === "grid" ? "default" : "ghost"} 
                  size="sm"
                  className="rounded-r-none"
                  onClick={() => setViewMode("grid")}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button 
                  variant={viewMode === "list" ? "default" : "ghost"} 
                  size="sm"
                  className="rounded-l-none"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Essays Grid/List */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredEssays.map((essay) => {
          const StatusIcon = getStatusIcon(essay.status);
          const wordProgress = (essay.wordCount / essay.targetWords) * 100;
          
          return (
            <Dialog key={essay.id}>
              <DialogTrigger asChild>
                <Card className="group hover:shadow-card-hover transition-all duration-300 hover:scale-[1.01] cursor-pointer border-border bg-card animate-fade-in">
                  <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-primary/10">
                          <AvatarImage src={essay.studentAvatar} alt={essay.studentName} />
                          <AvatarFallback className="bg-gradient-secondary text-secondary-foreground">
                            {essay.studentName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {essay.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">{essay.studentName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {essay.urgent && (
                          <Badge variant="destructive" className="text-xs">
                            Urgent
                          </Badge>
                        )}
                        <Badge 
                          variant={getStatusColor(essay.status) as any}
                          className="flex items-center gap-1"
                        >
                          <StatusIcon className="h-3 w-3" />
                          {essay.status.replace('-', ' ')}
                        </Badge>
                      </div>
                    </div>

                    {/* Essay Type & AI Score */}
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline">{getTypeLabel(essay.essayType)}</Badge>
                      <span className="text-sm font-medium">Score: {essay.aiScore}/100</span>
                    </div>

                    {/* Word Count Progress */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-foreground">Word Count</span>
                        <span className="text-sm text-muted-foreground">{essay.wordCount}/{essay.targetWords}</span>
                      </div>
                      <Progress value={Math.min(wordProgress, 100)} className="h-2" />
                    </div>

                    {/* Essay Preview */}
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {essay.content}
                      </p>
                    </div>

                    {/* Footer Info */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Updated: {essay.lastUpdated}</span>
                      <span>Due: {essay.dueDate}</span>
                      <span>v{essay.versions}</span>
                    </div>
                  </CardContent>
                </Card>
              </DialogTrigger>
              
              <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={essay.studentAvatar} alt={essay.studentName} />
                        <AvatarFallback className="bg-gradient-secondary text-secondary-foreground">
                          {essay.studentName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h2 className="text-xl font-bold">{essay.title}</h2>
                        <p className="text-sm text-muted-foreground">{essay.studentName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusColor(essay.status) as any}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {essay.status.replace('-', ' ')}
                      </Badge>
                    </div>
                  </DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="review" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="review">Review</TabsTrigger>
                    <TabsTrigger value="feedback">Feedback</TabsTrigger>
                    <TabsTrigger value="versions">Versions</TabsTrigger>
                  </TabsList>

                  <TabsContent value="review" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Essay Content */}
                      <div className="lg:col-span-2 space-y-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <FileText className="h-5 w-5" />
                              Essay Content
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="mb-4 p-3 bg-muted rounded-lg">
                              <p className="text-sm font-medium text-foreground mb-2">Prompt:</p>
                              <p className="text-sm text-muted-foreground">{essay.prompt}</p>
                            </div>
                            
                            <div className="prose max-w-none">
                              <p className="text-foreground whitespace-pre-wrap">{essay.content}</p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* AI Analysis & Tools */}
                      <div className="space-y-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Sparkles className="h-5 w-5 text-ai-accent" />
                              AI Analysis
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Overall Score</span>
                              <div className="flex items-center gap-2">
                                <Progress value={essay.aiScore} className="w-16 h-2" />
                                <span className="text-sm font-bold">{essay.aiScore}/100</span>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-xs text-muted-foreground">Personal Voice & Authenticity</span>
                                <span className="text-xs font-medium">88/100</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-xs text-muted-foreground">Storytelling & Structure</span>
                                <span className="text-xs font-medium">75/100</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-xs text-muted-foreground">Self-Reflection & Growth</span>
                                <span className="text-xs font-medium">82/100</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-xs text-muted-foreground">Prompt Alignment</span>
                                <span className="text-xs font-medium">79/100</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-xs text-muted-foreground">Grammar & Clarity</span>
                                <span className="text-xs font-medium">85/100</span>
                              </div>
                            </div>

                            <div className="pt-2 border-t border-border">
                              <h4 className="text-sm font-medium mb-2">AI Suggestions</h4>
                              <ul className="text-xs text-muted-foreground space-y-1">
                                <li>• Strengthen the opening hook</li>
                                <li>• Add more specific examples</li>
                                <li>• Improve conclusion clarity</li>
                              </ul>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <BarChart3 className="h-5 w-5" />
                              Progress
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Word Count</span>
                                <span>{essay.wordCount}/{essay.targetWords}</span>
                              </div>
                              <Progress value={(essay.wordCount / essay.targetWords) * 100} className="h-2" />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 text-center text-xs">
                              <div className="p-2 bg-muted/50 rounded">
                                <div className="font-medium">v{essay.versions}</div>
                                <div className="text-muted-foreground">Drafts</div>
                              </div>
                              <div className="p-2 bg-muted/50 rounded">
                                <div className="font-medium">{essay.dueDate}</div>
                                <div className="text-muted-foreground">Due Date</div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>


                  <TabsContent value="feedback" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Counselor Feedback</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Use the advanced feedback tool to review the essay with AI-powered analysis, 
                          highlight specific sections, and build comprehensive feedback for the student.
                        </p>
                        <Button 
                          size="lg" 
                          className="w-full"
                          onClick={() => setFeedbackModalEssay(essay)}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Open Feedback Editor
                        </Button>
                      </CardContent>
                    </Card>

                    <CounselorFeedbackHistory 
                      studentName={essay.studentName}
                    />
                  </TabsContent>

                  <TabsContent value="versions" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Essay Versions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                            <div>
                              <p className="font-medium">Version {essay.versions} (Current)</p>
                              <p className="text-sm text-muted-foreground">Updated {essay.lastUpdated}</p>
                            </div>
                            <Badge>Current</Badge>
                          </div>
                          <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                            <div>
                              <p className="font-medium">Version {essay.versions - 1}</p>
                              <p className="text-sm text-muted-foreground">Updated 3 days ago</p>
                            </div>
                            <Button variant="outline" size="sm">View</Button>
                          </div>
                          <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                            <div>
                              <p className="font-medium">Version {essay.versions - 2}</p>
                              <p className="text-sm text-muted-foreground">Updated 1 week ago</p>
                            </div>
                            <Button variant="outline" size="sm">View</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4 border-t border-border">
                  <Button className="flex-1">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send Feedback
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <User className="h-4 w-4 mr-2" />
                    Assign Task
                  </Button>
                  <Button variant="outline">
                    <Share className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button 
                    variant="outline"
                    className="border-ai-accent/20 hover:bg-gradient-ai hover:text-primary-foreground"
                  >
                    <Sparkles className="h-4 w-4 text-ai-accent" />
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          );
        })}
        </div>
      ) : (
        /* List View */
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {filteredEssays.map((essay) => {
                const StatusIcon = getStatusIcon(essay.status);
                return (
                  <Dialog key={essay.id}>
                    <DialogTrigger asChild>
                      <div className="flex items-center gap-4 p-4 hover:bg-muted/50 cursor-pointer transition-colors">
                        <Avatar className="h-10 w-10 border-2 border-primary/10">
                          <AvatarImage src={essay.studentAvatar} alt={essay.studentName} />
                          <AvatarFallback className="bg-gradient-secondary text-secondary-foreground">
                            {essay.studentName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground truncate">{essay.title}</h3>
                            {essay.urgent && (
                              <Badge variant="destructive" className="text-xs">Urgent</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{essay.studentName}</p>
                        </div>

                        <div className="flex items-center gap-6 text-sm">
                          <div className="text-center">
                            <div className="font-bold text-primary">{essay.aiScore}</div>
                            <div className="text-xs text-muted-foreground">Score</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium">{essay.wordCount}/{essay.targetWords}</div>
                            <div className="text-xs text-muted-foreground">Words</div>
                          </div>
                          <Badge variant={getStatusColor(essay.status) as any} className="flex items-center gap-1">
                            <StatusIcon className="h-3 w-3" />
                            {essay.status.replace('-', ' ')}
                          </Badge>
                          <Badge variant="outline">{getTypeLabel(essay.essayType)}</Badge>
                          <div className="text-xs text-muted-foreground w-20 text-right">
                            Due: {essay.dueDate}
                          </div>
                        </div>
                      </div>
                    </DialogTrigger>
                    {/* Same Dialog Content as grid view - reusing the pattern */}
                    <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={essay.studentAvatar} alt={essay.studentName} />
                              <AvatarFallback className="bg-gradient-secondary text-secondary-foreground">
                                {essay.studentName.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h2 className="text-xl font-bold">{essay.title}</h2>
                              <p className="text-sm text-muted-foreground">{essay.studentName}</p>
                            </div>
                          </div>
                          <Badge variant={getStatusColor(essay.status) as any}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {essay.status.replace('-', ' ')}
                          </Badge>
                        </DialogTitle>
                      </DialogHeader>
                      <div className="py-4">
                        <Button 
                          size="lg" 
                          className="w-full"
                          onClick={() => setFeedbackModalEssay(essay)}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Open Feedback Editor
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {filteredEssays.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No essays found</h3>
            <p className="text-muted-foreground">Try adjusting your search terms or filters</p>
          </CardContent>
        </Card>
      )}

      {/* Feedback Modal */}
      {feedbackModalEssay && (
        <EssayFeedbackModal
          isOpen={!!feedbackModalEssay}
          onClose={() => setFeedbackModalEssay(null)}
          essay={{
            id: feedbackModalEssay.id,
            title: feedbackModalEssay.title,
            studentName: feedbackModalEssay.studentName,
            prompt: feedbackModalEssay.prompt,
            content: feedbackModalEssay.content,
          }}
        />
      )}
    </div>
  );
};

export default Essays;