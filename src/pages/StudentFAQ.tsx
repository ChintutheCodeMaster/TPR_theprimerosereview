import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  HelpCircle,
  Search,
  ArrowRight,
  MessageSquare,
} from "lucide-react";

type Category = {
  id: string;
  title: string;
  description: string;
};

type FAQ = {
  categoryId: string;
  question: string;
  answer: string;
  cta?: { label: string; to: string };
};

const CATEGORIES: Category[] = [
  {
    id: "start",
    title: "Getting Started",
    description: "Set up your profile and find your way around.",
  },
  {
    id: "essay",
    title: "Essay Journey",
    description: "The three-step path from idea to submitted essay.",
  },
  {
    id: "ai",
    title: "AI Coaches & Practice",
    description: "Talk to Eva, take the challenge, sharpen your voice.",
  },
  {
    id: "finance",
    title: "Scholarships & Cost",
    description: "Money-side tools for planning and finding funding.",
  },
  {
    id: "account",
    title: "Profile, Messages & Support",
    description: "Everything about your account and staying in touch.",
  },
];

const FAQS: FAQ[] = [
  // Getting Started
  {
    categoryId: "start",
    question: "I just joined — where should I start?",
    answer:
      "Open your Student Dashboard for a snapshot of everything, then click 'Complete full onboarding' in the top-right of any student page. Onboarding is a short guided questionnaire that helps the platform understand your goals — and it powers your first personal statement draft.",
    cta: { label: "Go to Onboarding", to: "/onboarding" },
  },
  {
    categoryId: "start",
    question: "How and where do I start the onboarding questionnaire?",
    answer:
      "Look at the top-right of any student page — you'll see a 'Complete full onboarding here' button (it turns green once you're done). Click it to launch the questionnaire. It's a short, multi-step form covering your background, target majors, activities, and story. Answer honestly — the AI uses these answers to draft your first personal statement and to personalise feedback across every tool. You can pause and come back anytime.",
    cta: { label: "Start Onboarding", to: "/onboarding" },
  },
  {
    categoryId: "start",
    question: "How do I add my first application?",
    answer:
      "Head to your personal workspace and open the 'Applications' tab (it sits next to Essays, Feedback, Tasks and Messages). Click 'Add Application' to add your first school — you'll enter the college, program, deadline, and status. Once it's saved, every essay, task and rec letter you create can be linked back to that application so nothing slips through the cracks.",
    cta: { label: "Open Applications Tab", to: "/student-personal-area?tab=applications" },
  },
  {
    categoryId: "start",
    question: "What does the Student Dashboard show me?",
    answer:
      "Your dashboard is the home base: active essays, upcoming deadlines, weekly challenge status, recent feedback from your counselor, and quick shortcuts into every tool. If you ever get lost, come back here.",
    cta: { label: "Open Dashboard", to: "/student-dashboard" },
  },
  {
    categoryId: "start",
    question: "How do I update my profile or school details?",
    answer:
      "Head to 'My Profile' in the sidebar. You can edit your name, avatar, target majors, schools you're applying to, and personal details that the AI uses to tailor its feedback to you.",
    cta: { label: "Edit My Profile", to: "/student-profile" },
  },

  // Essay Journey
  {
    categoryId: "essay",
    question: "What is the Primrose Lab? (Step 1)",
    answer:
      "The Primrose Lab is your writing workspace — a distraction-free place to draft, experiment, and get in-the-moment AI coaching as you write. Think of it as your creative sandbox before your essay is ready for scoring.",
    cta: { label: "Open Primrose Lab", to: "/primrose-lab" },
  },
  {
    categoryId: "essay",
    question: "What does the Evaluation Engine do? (Step 2)",
    answer:
      "The Evaluation Engine scores your essay against five key admissions criteria — hook, voice, structure, insight, and impact — and returns detailed section-level feedback. Use it as a rehearsal before you submit for counselor review.",
    cta: { label: "Try Evaluation Engine", to: "/evaluation-engine" },
  },
  {
    categoryId: "essay",
    question: "How do I submit an essay for counselor review? (Step 3)",
    answer:
      "Under 'Submit Essay' you can paste or upload your draft, tag which application/prompt it's for, and send it. Your counselor is notified and their feedback shows up in the Dashboard and in Messages.",
    cta: { label: "Submit an Essay", to: "/student-personal-area" },
  },
  {
    categoryId: "essay",
    question: "Where's my personal statement draft?",
    answer:
      "Your first personal statement is generated from your onboarding answers and appears on the Personal Essay page. You can edit it freely, iterate with AI, and then run it through the Evaluation Engine when you're ready.",
    cta: { label: "View Personal Statement", to: "/personal-essay" },
  },

  // AI Coaches & Practice
  {
    categoryId: "ai",
    question: "Who is Eva and how do I talk to her?",
    answer:
      "Eva is your voice-based admissions coach. She runs live interview practice — asks the kinds of questions admissions officers actually ask, listens, and gives feedback on how you answered. Great for building confidence before a real interview.",
    cta: { label: "Practice with Eva", to: "/interview-simulator" },
  },
  {
    categoryId: "ai",
    question: "What is the Primrose Challenge?",
    answer:
      "A weekly writing prompt open to everyone on the platform. Submit a short response and see how you rank against other students. It's a fun way to keep writing between essay drafts — and winners get a shout-out.",
    cta: { label: "See This Week's Challenge", to: "/weekly-challenge" },
  },
  {
    categoryId: "ai",
    question: "Where can I see my writing progress?",
    answer:
      "'My Stats' tracks essay drafts, feedback cycles, evaluation scores over time, and challenge participation. It's the best way to see how much you've actually improved — spoiler, it's a lot more than it feels like day to day.",
    cta: { label: "View My Stats", to: "/student-stats" },
  },

  // Scholarships & Cost
  {
    categoryId: "finance",
    question: "How does the Scholarship Finder work?",
    answer:
      "It matches you to scholarships based on your profile — major, background, location, achievements. The more complete your profile, the better the matches. New scholarships are added regularly, so check back.",
    cta: { label: "Find Scholarships", to: "/scholarship-finder" },
  },
  {
    categoryId: "finance",
    question: "What is the Study Cost Planner?",
    answer:
      "A calculator for estimating the true cost of the schools you're considering — tuition, living, travel, and expected aid. Use it to compare offers side-by-side and have an honest conversation with your family about the financial picture.",
    cta: { label: "Plan My Costs", to: "/tuition-calculator" },
  },

  // Account, Messages & Support
  {
    categoryId: "account",
    question: "How do I request recommendation letters?",
    answer:
      "Under 'Recommendation Letters' you can invite a teacher or mentor by email. They get a secure link, write the letter directly on the platform, and it's saved with your application. You'll see the status update as they complete it.",
    cta: { label: "Manage Rec Letters", to: "/student-recommendation-letters" },
  },
  {
    categoryId: "account",
    question: "How do I chat with my counselor?",
    answer:
      "'Messages' is a direct chat with your counselor. Use it for essay questions, deadline check-ins, or anything you don't want to lose in email. New messages show up as a badge in the sidebar.",
    cta: { label: "Open Messages", to: "/student-messages" },
  },
  {
    categoryId: "account",
    question: "How do I share feedback about the platform?",
    answer:
      "Click 'Feedback' in the sidebar. Rate your experience, tell us what's working and what isn't. We read every submission — it's how the tools you use tomorrow get better.",
    cta: { label: "Share Feedback", to: "/student-feedback" },
  },
  {
    categoryId: "account",
    question: "I'm still stuck — how do I get real human help?",
    answer:
      "Fastest route is Messages — your counselor is your point person. For platform-level questions or bug reports, use the Contact Support page linked in the footer.",
    cta: { label: "Contact Support", to: "/contact-support" },
  },
];

const StudentFAQ = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | "all">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FAQS.filter((f) => {
      const inCategory = activeCategory === "all" || f.categoryId === activeCategory;
      if (!inCategory) return false;
      if (!q) return true;
      return (
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q)
      );
    });
  }, [query, activeCategory]);

  const byCategory = useMemo(() => {
    const map = new Map<string, FAQ[]>();
    for (const f of filtered) {
      const list = map.get(f.categoryId) ?? [];
      list.push(f);
      map.set(f.categoryId, list);
    }
    return map;
  }, [filtered]);

  return (
    <div className="min-h-full bg-background">
      <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <HelpCircle className="h-4 w-4" />
            Help Center
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Frequently asked questions
          </h1>
          <p className="text-base text-muted-foreground max-w-xl">
            Answers to common questions about Primrose Lab, the Evaluation Engine, Eva, and the rest of your toolkit.
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search FAQs..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 border-b border-border pb-4">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeCategory === "all"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            All
          </button>
          {CATEGORIES.map((c) => {
            const active = activeCategory === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {c.title}
              </button>
            );
          })}
        </div>

        {/* Empty state */}
        {filtered.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <p className="text-sm text-muted-foreground">
                No FAQs matched "{query}". Try a different search or clear it to see all topics.
              </p>
            </CardContent>
          </Card>
        ) : (
          CATEGORIES.filter((c) => byCategory.has(c.id)).map((cat) => {
            const items = byCategory.get(cat.id)!;
            return (
              <section key={cat.id} className="space-y-3">
                {/* Category header */}
                <div className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <h2 className="text-lg font-semibold text-foreground">
                      {cat.title}
                    </h2>
                    <span className="text-sm text-muted-foreground">
                      {items.length}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {cat.description}
                  </p>
                </div>

                {/* Accordion */}
                <Card>
                  <Accordion type="multiple" className="w-full divide-y divide-border">
                    {items.map((faq, idx) => {
                      const value = `${cat.id}-${idx}`;
                      return (
                        <AccordionItem
                          key={value}
                          value={value}
                          className="border-b-0 px-5 first:pt-1 last:pb-1"
                        >
                          <AccordionTrigger className="py-4 hover:no-underline text-left text-base font-medium text-foreground">
                            {faq.question}
                          </AccordionTrigger>
                          <AccordionContent className="pb-4">
                            <p className="text-sm leading-relaxed text-muted-foreground">
                              {faq.answer}
                            </p>
                            {faq.cta && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(faq.cta!.to)}
                                className="mt-3 h-8 px-2 text-sm text-primary hover:text-primary hover:bg-primary/5 gap-1"
                              >
                                {faq.cta.label}
                                <ArrowRight className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                </Card>
              </section>
            );
          })
        )}

        {/* Footer help */}
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold text-foreground">
                Still have questions?
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Message your counselor directly — it's the fastest way to a real answer.
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button
                onClick={() => navigate("/student-messages")}
                size="sm"
                variant="outline"
                className="gap-1.5"
              >
                <MessageSquare className="h-4 w-4" />
                Message counselor
              </Button>
              <Button
                onClick={() => navigate("/contact-support")}
                size="sm"
                variant="ghost"
                className="text-muted-foreground hover:text-foreground"
              >
                Contact support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentFAQ;
