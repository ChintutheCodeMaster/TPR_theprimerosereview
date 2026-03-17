import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  User,
  Mail,
  GraduationCap,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Send,
  BookOpen,
  List,
  Sparkles,
  DollarSign,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

const ParentPortal = () => {
  const [message, setMessage] = useState("");

  // Mock data for demo - matches data from other pages for consistency
  const childInfo = {
    name: "Emma Thompson",
    school: "Lincoln High School",
    grade: "12th Grade",
    counselor: "Ms. Johnson",
    counselorEmail: "johnson@primrose.edu",
    gpa: 3.8,
    satScore: 1450,
    status: "on-track" as const
  };

  const applicationProgress = {
    essaysCompleted: 3,
    totalEssays: 5,
    applicationsSubmitted: 2,
    totalApplications: 8,
    upcomingDeadlines: 3
  };

  const recentActivity = [
    { date: "Dec 15, 2024", action: "Essay submitted for review", status: "pending" },
    { date: "Dec 12, 2024", action: "Harvard application started", status: "in-progress" },
    { date: "Dec 10, 2024", action: "Common App essay approved", status: "completed" },
  ];

  const universityList = [
    {
      college: "Harvard University",
      status: "Essay Review",
      deadline: "Jan 1",
      strategy: "Reach",
      admitRange: "3–7%",
      scholarship: "Need-based only",
      remaining: ["Supplement essay", "Interview prep"],
    },
    {
      college: "University of Michigan",
      status: "Ready to Submit",
      deadline: "Nov 15",
      strategy: "Target",
      admitRange: "20–26%",
      scholarship: "Merit + Need",
      remaining: ["Final review"],
    },
    {
      college: "Indiana University",
      status: "Submitted",
      deadline: "Oct 20",
      strategy: "Safety",
      admitRange: "75–80%",
      scholarship: "Merit scholarships available",
      remaining: [],
    },
    {
      college: "Northwestern University",
      status: "In Progress",
      deadline: "Jan 3",
      strategy: "Reach",
      admitRange: "7–10%",
      scholarship: "Need-based only",
      remaining: ["Supplement essay", "Activities list"],
    },
    {
      college: "Purdue University",
      status: "Submitted",
      deadline: "Nov 1",
      strategy: "Safety",
      admitRange: "67–70%",
      scholarship: "Merit scholarships available",
      remaining: [],
    },
  ];

  const handleSendMessage = () => {
    if (!message.trim()) {
      toast.error("Please write a message");
      return;
    }
    toast.success("Message sent to counselor");
    setMessage("");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track': return 'bg-green-500';
      case 'needs-attention': return 'bg-yellow-500';
      case 'at-risk': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'on-track': return 'On Track';
      case 'needs-attention': return 'Needs Attention';
      case 'at-risk': return 'At Risk';
      default: return status;
    }
  };

  const getAppStatusStyle = (status: string) => {
    switch (status) {
      case "Submitted":       return "bg-green-100 text-green-700 border border-green-200";
      case "Ready to Submit": return "bg-blue-100 text-blue-700 border border-blue-200";
      case "Essay Review":    return "bg-yellow-100 text-yellow-700 border border-yellow-200";
      case "In Progress":     return "bg-orange-100 text-orange-700 border border-orange-200";
      default:                return "bg-gray-100 text-gray-600 border border-gray-200";
    }
  };

  const getStrategyStyle = (strategy: string) => {
    switch (strategy) {
      case "Reach":  return "bg-red-100 text-red-700 border border-red-200";
      case "Target": return "bg-purple-100 text-purple-700 border border-purple-200";
      case "Safety": return "bg-emerald-100 text-emerald-700 border border-emerald-200";
      default:       return "bg-gray-100 text-gray-600";
    }
  };

  const accordionItems = [
    {
      value: "admissions",
      label: "How College Admissions Works",
      bg: "bg-violet-50 border-violet-200",
      dot: "bg-violet-500",
      content: (
        <>
          <p>For many families, the college admissions process feels confusing and unpredictable. Most universities follow a fairly consistent framework using <strong>holistic review</strong> — admissions officers evaluate several parts of the application together rather than relying on a single number or test score.</p>
          <ul className="space-y-2 list-none mt-3">
            <li><strong>Academic performance:</strong> Grades remain the most important factor. A 3.8 GPA in demanding courses can carry significant weight.</li>
            <li><strong>Standardized testing:</strong> Many universities are now test-optional, but strong scores can still strengthen an application.</li>
            <li><strong>Essays:</strong> Personal statements help admissions teams understand who the student is beyond grades.</li>
            <li><strong>Extracurriculars:</strong> Depth in a few areas often stands out more than many short-term activities.</li>
            <li><strong>Recommendation letters:</strong> Teachers and counselors provide context about a student's character and work ethic.</li>
            <li><strong>Institutional priorities:</strong> Intended major, geographic diversity, and class balance all factor in — and vary each year.</li>
          </ul>
          <p className="mt-3">Decisions fall into: <strong>Accepted</strong>, <strong>Waitlisted</strong>, <strong>Deferred</strong>, or <strong>Denied</strong>. Encouragement and calm guidance from parents often makes the biggest difference.</p>
        </>
      ),
    },
    {
      value: "essay",
      label: "What Makes a Strong College Essay",
      bg: "bg-pink-50 border-pink-200",
      dot: "bg-pink-500",
      content: (
        <>
          <p>The college essay is one of the few places where a student can speak directly to the admissions committee. Strong essays don't try to impress with complicated language — they reveal something genuine about how a student thinks, learns, and experiences the world.</p>
          <ul className="space-y-2 list-none mt-3">
            <li><strong>Authenticity:</strong> Essays that feel overly polished or artificial are easy to spot. Strong essays sound like the student who wrote them.</li>
            <li><strong>Specific detail:</strong> Real moments say far more than broad statements about ambition or success.</li>
            <li><strong>Reflection:</strong> Self-awareness is often more powerful than the story itself — what did the student learn?</li>
            <li><strong>Voice:</strong> Natural and clear writing, not overly formal.</li>
            <li><strong>Focus:</strong> One idea explored deeply beats many ideas covered shallowly.</li>
          </ul>
          <p className="mt-3">Admissions readers look for honesty, curiosity, and clarity. Parents support students best by encouraging independence in the writing process.</p>
        </>
      ),
    },
    {
      value: "financial-aid",
      label: "Financial Aid Explained",
      bg: "bg-emerald-50 border-emerald-200",
      dot: "bg-emerald-500",
      content: (
        <>
          <p>Universities offer several types of financial support that can significantly reduce the cost of attendance.</p>
          <ul className="space-y-2 list-none mt-3">
            <li><strong>Need-based aid:</strong> Based on family finances. Submit the FAFSA and sometimes the CSS Profile to qualify.</li>
            <li><strong>Merit scholarships:</strong> Awarded for academic achievement, leadership, or talent — not tied to financial need.</li>
            <li><strong>Institutional grants:</strong> Many universities provide grants directly from their own funds, often the largest source of aid.</li>
          </ul>
          <p className="mt-3">Key distinction: <strong>grants and scholarships</strong> do not need to be repaid. <strong>Loans</strong> must be repaid after graduation. Financial aid deadlines often come earlier than application deadlines — missing them can significantly reduce available aid.</p>
        </>
      ),
    },
    {
      value: "early-decision",
      label: "Early Decision vs Regular Decision",
      bg: "bg-amber-50 border-amber-200",
      dot: "bg-amber-500",
      content: (
        <>
          <p>Students applying to college have several timing options — each with different implications.</p>
          <ul className="space-y-2 list-none mt-3">
            <li><strong>Early Decision (ED):</strong> Apply in November; if admitted, enrollment is <em>binding</em>. Only apply ED if it's clearly the first choice and the financial situation is understood.</li>
            <li><strong>Early Action (EA):</strong> Apply early and get an early decision, but <em>not binding</em>. Students keep their options open.</li>
            <li><strong>Regular Decision (RD):</strong> Standard timeline with January–February deadlines. Allows comparison of multiple offers and financial aid packages in the spring.</li>
          </ul>
          <p className="mt-3">The best strategy depends on academic readiness, finances, and how certain the student feels about a school. A balanced plan with a range of schools and timelines reduces pressure.</p>
        </>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Parent Portal</h1>
        <p className="text-base text-muted-foreground">Stay updated on your child's college application progress</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Child Info Card */}
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">{childInfo.name}</h2>
                <p className="text-base text-muted-foreground">{childInfo.school}</p>
                <p className="text-sm text-muted-foreground">{childInfo.grade}</p>
              </div>
            </div>
            <Badge className={`${getStatusColor(childInfo.status)} text-white`}>
              {getStatusLabel(childInfo.status)}
            </Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-secondary/50 rounded-lg">
              <p className="text-2xl font-bold text-foreground">{childInfo.gpa}</p>
              <p className="text-sm text-muted-foreground">GPA</p>
            </div>
            <div className="text-center p-3 bg-secondary/50 rounded-lg">
              <p className="text-2xl font-bold text-foreground">{childInfo.satScore}</p>
              <p className="text-sm text-muted-foreground">SAT Score</p>
            </div>
            <div className="text-center p-3 bg-secondary/50 rounded-lg">
              <p className="text-2xl font-bold text-foreground">{applicationProgress.applicationsSubmitted}/{applicationProgress.totalApplications}</p>
              <p className="text-sm text-muted-foreground">Applications</p>
            </div>
            <div className="text-center p-3 bg-secondary/50 rounded-lg">
              <p className="text-2xl font-bold text-foreground">{applicationProgress.upcomingDeadlines}</p>
              <p className="text-sm text-muted-foreground">Upcoming Deadlines</p>
            </div>
          </div>

          {/* Progress Bars */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Essays Progress</span>
                <span className="font-medium">{applicationProgress.essaysCompleted}/{applicationProgress.totalEssays}</span>
              </div>
              <Progress value={(applicationProgress.essaysCompleted / applicationProgress.totalEssays) * 100} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Applications Progress</span>
                <span className="font-medium">{applicationProgress.applicationsSubmitted}/{applicationProgress.totalApplications}</span>
              </div>
              <Progress value={(applicationProgress.applicationsSubmitted / applicationProgress.totalApplications) * 100} className="h-2" />
            </div>
          </div>
        </Card>

        {/* Counselor Contact Card */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            Your Counselor
          </h3>

          <div className="space-y-4">
            <div>
              <p className="text-base font-medium text-foreground">{childInfo.counselor}</p>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" />
                {childInfo.counselorEmail}
              </p>
            </div>

            <div className="space-y-2">
              <Textarea
                placeholder="Write a message to the counselor..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="text-base"
              />
              <Button className="w-full gap-2" onClick={handleSendMessage}>
                <Send className="h-4 w-4" />
                Send Message
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Recent Activity
        </h3>

        <div className="space-y-3">
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center gap-4 p-3 bg-secondary/30 rounded-lg">
              {activity.status === 'completed' && <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />}
              {activity.status === 'pending' && <Clock className="h-5 w-5 text-yellow-500 shrink-0" />}
              {activity.status === 'in-progress' && <AlertTriangle className="h-5 w-5 text-blue-500 shrink-0" />}

              <div className="flex-1">
                <p className="text-base text-foreground">{activity.action}</p>
                <p className="text-sm text-muted-foreground">{activity.date}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* University List Tracker */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <List className="h-5 w-5 text-primary" />
              University List Tracker
            </h3>
            <p className="text-base text-muted-foreground mt-0.5">Emma's full college application list at a glance</p>
          </div>
          <div className="flex gap-2 text-sm">
            <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-700 border border-red-200 font-medium">Reach</span>
            <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 border border-purple-200 font-medium">Target</span>
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 font-medium">Safety</span>
          </div>
        </div>

        <div className="space-y-3">
          {universityList.map((uni, index) => (
            <div
              key={index}
              className="rounded-xl border bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <GraduationCap className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-base font-semibold text-foreground truncate">{uni.college}</p>
                    <p className="text-sm text-muted-foreground">Deadline: <span className="font-medium text-foreground">{uni.deadline}</span></p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                  <span className={`text-sm font-semibold px-2.5 py-1 rounded-full ${getStrategyStyle(uni.strategy)}`}>
                    {uni.strategy}
                  </span>
                  <span className={`text-sm font-medium px-2.5 py-1 rounded-full ${getAppStatusStyle(uni.status)}`}>
                    {uni.status}
                  </span>
                </div>
              </div>

              {/* Extra details row */}
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm">
                  <ExternalLink className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className="text-muted-foreground">Admit range:</span>
                  <span className="font-semibold text-foreground">{uni.admitRange}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-sm">
                  <DollarSign className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span className="text-emerald-800 font-medium truncate">{uni.scholarship}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 min-w-0 text-sm">
                  <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  {uni.remaining.length === 0 ? (
                    <span className="text-emerald-600 font-semibold">All done!</span>
                  ) : (
                    <span className="text-amber-800 truncate font-medium">{uni.remaining.join(", ")}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Parent Insights — AI Summary */}
      <Card className="p-6 border-2 border-violet-200 bg-gradient-to-br from-violet-50 via-white to-purple-50">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Parent Insights</h3>
            <p className="text-sm text-muted-foreground">AI-generated weekly summary · Updated Dec 16, 2024</p>
          </div>
          <span className="ml-auto text-sm font-semibold px-2.5 py-1 rounded-full bg-violet-100 text-violet-700 border border-violet-200">
            AI Summary
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl bg-white border border-violet-100 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2.5 h-2.5 rounded-full bg-violet-500" />
              <p className="text-base font-semibold text-foreground">Student Progress Update</p>
            </div>
            <p className="text-base text-muted-foreground leading-relaxed">
              Emma completed her Common App essay this week and has begun work on her Harvard supplement. She submitted her Purdue application ahead of schedule and her Indiana application is already confirmed. Her overall application timeline remains <span className="font-semibold text-green-600">on track</span> with 3 essays still in progress and 3 upcoming deadlines in the next 6 weeks.
            </p>
          </div>

          <div className="rounded-xl bg-white border border-amber-100 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <p className="text-base font-semibold text-foreground">Recommended Actions for You</p>
            </div>
            <ul className="space-y-3">
              {[
                { text: "Review the college list with Emma this week", color: "bg-violet-500" },
                { text: "Confirm FAFSA submission by Jan 1 for Harvard consideration", color: "bg-amber-500" },
                { text: "Encourage Emma to follow up with her teacher on the recommendation letter", color: "bg-pink-500" },
                { text: "Check in on the Harvard supplement essay — deadline is Jan 1", color: "bg-red-500" },
              ].map((action, i) => (
                <li key={i} className="flex items-start gap-2.5 text-base text-muted-foreground">
                  <span className={`mt-2 w-2 h-2 rounded-full ${action.color} shrink-0`} />
                  {action.text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      {/* Learning Center */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Parent Learning Center
        </h3>
        <p className="text-base text-muted-foreground mb-5">
          Guides to help you support your child through the college admissions process.
        </p>

        <Accordion type="single" collapsible className="space-y-3">
          {accordionItems.map((item) => (
            <AccordionItem
              key={item.value}
              value={item.value}
              className={`border rounded-xl overflow-hidden ${item.bg}`}
            >
              <AccordionTrigger className="px-4 py-3.5 hover:no-underline hover:bg-black/5 transition-colors [&>svg]:text-foreground">
                <div className="flex items-center gap-3">
                  <span className={`w-3 h-3 rounded-full ${item.dot} shrink-0`} />
                  <span className="text-base font-semibold text-foreground text-left">{item.label}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-5 pt-2 text-base text-muted-foreground bg-white border-t border-inherit leading-relaxed">
                {item.content}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Card>
    </div>
  );
};

export default ParentPortal;
