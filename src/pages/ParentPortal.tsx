import { useState } from "react";
import { motion } from "framer-motion";
import {
  GraduationCap, CheckCircle, Clock, AlertTriangle,
  BookOpen, TrendingUp, Trophy,
  ChevronDown, ChevronUp, Star, Calendar, Zap, Shield,
  Hourglass, FileText, Award,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useParentPortalData } from "@/hooks/useParentPortalData";
import { PageShell, PageHeader, HairlineCard, BlurOrb, SignalRing } from "@/components/primrose-night";

const sectionVariants = {
  hidden: { opacity: 0, y: 10, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: [0.2, 0.6, 0.2, 1] as const },
  },
};

const chartTooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "8px",
  color: "hsl(var(--foreground))",
  fontSize: 12,
};

const daysUntil = (dateStr: string) => {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / 86400000);
};

const strategyPill = (s: string) => {
  if (s === "Reach")  return "bg-[color:var(--pn-pink)]/15 text-[color:var(--pn-pink)] hairline";
  if (s === "Target") return "bg-[color:var(--pn-gold)]/15 text-[color:var(--pn-gold)] hairline";
  return                "bg-[color:var(--pn-sage)]/15 text-[color:var(--pn-sage)] hairline";
};

const strategyInitials = (s: string) => {
  if (s === "Reach")  return "bg-[color:var(--pn-pink)]/15 text-[color:var(--pn-pink)]";
  if (s === "Target") return "bg-[color:var(--pn-gold)]/15 text-[color:var(--pn-gold)]";
  return                "bg-[color:var(--pn-sage)]/15 text-[color:var(--pn-sage)]";
};

const statusPill = (s: string) => {
  if (s === "Submitted")       return "bg-[color:var(--pn-sage)]/15 text-[color:var(--pn-sage)] hairline";
  if (s === "Ready to Submit") return "bg-[color:var(--pn-sage)]/15 text-[color:var(--pn-sage)] hairline";
  if (s === "Essay Review")    return "bg-[color:var(--pn-gold)]/15 text-[color:var(--pn-gold)] hairline";
  if (s === "In Progress")     return "bg-[color:var(--pn-gold)]/15 text-[color:var(--pn-gold)] hairline";
  return "bg-white/[0.03] text-muted-foreground hairline";
};

const urgencyStyle = (level: "red" | "amber" | "green") => ({
  red:   { tone: "var(--pn-pink)", icon: <AlertTriangle className="h-4 w-4 text-[color:var(--pn-pink)]" /> },
  amber: { tone: "var(--pn-gold)", icon: <Clock className="h-4 w-4 text-[color:var(--pn-gold)]" /> },
  green: { tone: "var(--pn-sage)", icon: <CheckCircle className="h-4 w-4 text-[color:var(--pn-sage)]" /> },
}[level]);

const AnimatedBar = ({ pct, tone, className = "flex-1" }: { pct: number; tone: string; className?: string }) => (
  <div className={`h-1.5 rounded-full bg-white/[0.05] overflow-hidden ${className}`}>
    <motion.div
      className="h-full"
      style={{ background: tone }}
      initial={{ width: 0 }}
      animate={{ width: `${pct}%` }}
      transition={{ duration: 0.9, ease: [0.2, 0.6, 0.2, 1], delay: 0.15 }}
    />
  </div>
);

// ── Coming Soon ─────────────────────────────────────────────────────────────
function ComingSoon({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10 px-6 rounded-xl border border-dashed border-white/[0.10] bg-white/[0.02] text-center">
      <div className="w-10 h-10 rounded-full hairline flex items-center justify-center bg-white/[0.04]">
        <Hourglass className="h-5 w-5 text-muted-foreground" />
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Coming soon</p>
        <p className="text-sm font-serif italic text-muted-foreground mt-1">{label} will appear here once available.</p>
      </div>
    </div>
  );
}

// ── Strength Profile ─────────────────────────────────────────────────────────
interface StrengthProfileProps {
  gpa: string | number | null;
  satScore: string | number | null;
  actScore: string | number | null;
  essaysCompleted: number;
  totalEssays: number;
  recsCompleted: number;
  totalRecs: number;
  overallProgress: number;
  universities: { strategy: string }[];
}

function StrengthProfile({
  gpa, satScore, actScore,
  essaysCompleted, totalEssays,
  recsCompleted, totalRecs,
  overallProgress,
  universities,
}: StrengthProfileProps) {
  const gpaVal = gpa != null ? parseFloat(String(gpa)) : null;
  const satVal = satScore != null ? parseInt(String(satScore)) : null;
  const actVal = actScore != null ? parseInt(String(actScore)) : null;

  let academicScore: number | null = null;
  if (gpaVal !== null && !isNaN(gpaVal)) {
    const base = Math.round(Math.min(100, Math.max(20, ((gpaVal - 2.0) / 2.0) * 80 + 20)));
    if (satVal && !isNaN(satVal)) {
      academicScore = Math.min(100, base + Math.round(((satVal - 400) / 1200) * 15));
    } else if (actVal && !isNaN(actVal)) {
      academicScore = Math.min(100, base + Math.round(((actVal - 1) / 35) * 15));
    } else {
      academicScore = base;
    }
  }

  const essayScore  = totalEssays > 0 ? Math.round((essaysCompleted / totalEssays) * 100) : null;
  const recScore    = totalRecs   > 0 ? Math.round((recsCompleted   / totalRecs)   * 100) : null;
  const appScore    = overallProgress > 0 ? overallProgress : null;

  const reachCount  = universities.filter(u => u.strategy === "Reach").length;
  const targetCount = universities.filter(u => u.strategy === "Target").length;
  const safetyCount = universities.filter(u => u.strategy === "Safety").length;

  const scoreToneVar = (s: number | null) => {
    if (s === null) return "rgba(255,255,255,0.15)";
    if (s >= 65) return "var(--pn-sage)";
    if (s >= 45) return "var(--pn-gold)";
    return "var(--pn-pink)";
  };

  const statusLabel = (s: number | null): { text: string; cls: string } => {
    if (s === null) return { text: "No data",    cls: "bg-white/[0.03] text-muted-foreground hairline" };
    if (s >= 80)   return { text: "Strong",     cls: "bg-[color:var(--pn-sage)]/15 text-[color:var(--pn-sage)] hairline" };
    if (s >= 65)   return { text: "On track",   cls: "bg-[color:var(--pn-sage)]/15 text-[color:var(--pn-sage)] hairline" };
    if (s >= 45)   return { text: "In progress", cls: "bg-[color:var(--pn-gold)]/15 text-[color:var(--pn-gold)] hairline" };
    return              { text: "Needs work",   cls: "bg-[color:var(--pn-pink)]/15 text-[color:var(--pn-pink)] hairline" };
  };

  const dimensions = [
    {
      label: "Academic strength",
      score: academicScore,
      detail: gpaVal != null
        ? `GPA ${gpaVal.toFixed(2)}${satVal ? ` · SAT ${satVal}` : actVal ? ` · ACT ${actVal}` : ""}`
        : "GPA not on file",
      icon: <GraduationCap className="h-4 w-4 text-[color:var(--pn-sage)]" />,
    },
    {
      label: "Essay progress",
      score: essayScore,
      detail: totalEssays > 0 ? `${essaysCompleted} of ${totalEssays} essays complete` : "No essays on file",
      icon: <FileText className="h-4 w-4 text-[color:var(--pn-gold)]" />,
    },
    {
      label: "Recommendations",
      score: recScore,
      detail: totalRecs > 0 ? `${recsCompleted} of ${totalRecs} letters secured` : "None requested yet",
      icon: <Award className="h-4 w-4 text-[color:var(--pn-pink)]" />,
    },
    {
      label: "App readiness",
      score: appScore,
      detail: "Average completion across all schools",
      icon: <TrendingUp className="h-4 w-4 text-[color:var(--pn-sage)]" />,
    },
  ];

  return (
    <div className="space-y-5">
      {dimensions.map((dim, i) => {
        const sl = statusLabel(dim.score);
        return (
          <div key={i}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                {dim.icon}
                <span className="text-sm text-foreground">{dim.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] uppercase tracking-[0.14em] px-2 py-0.5 rounded-full ${sl.cls}`}>
                  {sl.text}
                </span>
                <span className="num-display text-sm text-foreground w-9 text-right">
                  {dim.score != null ? `${dim.score}%` : "—"}
                </span>
              </div>
            </div>
            <AnimatedBar pct={dim.score ?? 0} tone={scoreToneVar(dim.score)} className="w-full" />
            <p className="text-xs text-muted-foreground mt-1">{dim.detail}</p>
          </div>
        );
      })}

      {universities.length > 0 && (
        <div className="pt-4 hairline-t">
          <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-3">
            College list balance
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Reach",  count: reachCount,  tone: "var(--pn-pink)" },
              { label: "Target", count: targetCount, tone: "var(--pn-gold)" },
              { label: "Safety", count: safetyCount, tone: "var(--pn-sage)" },
            ].map(({ label, count, tone }) => (
              <div key={label} className="hairline rounded-xl py-3 text-center bg-white/[0.02]">
                <p className="num-display text-xl" style={{ color: tone }}>{count}</p>
                <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Learning content (copy preserved verbatim) ───────────────────────────────
const LESSONS = [
  {
    id: "admissions",
    title: "How College Admissions Works",
    tag: "Start here",
    readTime: "8 min read",
    tone: "sage" as const,
    emoji: "🎓",
    content: (
      <>
        <p className="text-base text-muted-foreground leading-relaxed">
          Most selective universities use what's called <strong className="text-foreground">holistic review</strong> — admissions officers look at the whole student, not just a GPA or test score. Understanding how this process actually works can help you support your child without adding unnecessary pressure.
        </p>

        <h4 className="font-serif text-lg text-foreground mt-5 mb-2">What goes into a holistic application?</h4>
        <ul className="space-y-3 text-sm text-muted-foreground">
          <li><strong className="text-foreground">Academic performance:</strong> Grades and course rigor are the most important factor. Admissions officers want to see that students challenged themselves — an A in AP Chemistry means more than an A in a standard course. Grade trends matter too: improving grades junior year can offset a weaker freshman year.</li>
          <li><strong className="text-foreground">Standardized testing:</strong> Many universities are now test-optional or test-free, but strong scores still help at test-optional schools. If your child has a 1500+ SAT or 34+ ACT, submitting it will likely help. If not, research each school's policy before deciding.</li>
          <li><strong className="text-foreground">Essays:</strong> The personal statement and supplemental essays give your child a voice in the application. Admissions officers read thousands of essays — they're looking for something human, not something impressive. This is one area where parents should step back and let the student lead.</li>
          <li><strong className="text-foreground">Extracurricular activities:</strong> Quality over quantity. Four years of sustained commitment to one or two activities tells a stronger story than a long list of short-term clubs. Colleges want to understand who your child is outside the classroom.</li>
          <li><strong className="text-foreground">Recommendation letters:</strong> Two teacher letters and a counselor letter are standard. Teachers who know your child well — not just the ones who gave the highest grade — tend to write the most compelling letters.</li>
          <li><strong className="text-foreground">Demonstrated interest:</strong> Some schools track whether students have visited, attended info sessions, or emailed admissions. It signals genuine fit, not just a safety school mentality.</li>
        </ul>

        <h4 className="font-serif text-lg text-foreground mt-5 mb-2">How applications are actually read</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">
          At most schools, each application gets at least two reads. A regional admissions officer reviews it first, then a committee makes the final call. Readers spend roughly 8–12 minutes per application at peak season. The goal is to find students who would thrive at that specific school — fit matters as much as achievement.
        </p>

        <h4 className="font-serif text-lg text-foreground mt-5 mb-2">Decision types explained</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li><strong className="text-foreground">Accepted:</strong> Offered admission. Your child has until May 1 (National Candidates Reply Date) to decide.</li>
          <li><strong className="text-foreground">Waitlisted:</strong> Not admitted now, but could be offered a spot if admitted students decline. Odds vary widely by school and year.</li>
          <li><strong className="text-foreground">Deferred:</strong> An early applicant whose decision is moved to the regular decision pool. Still fully in consideration — not a soft rejection.</li>
          <li><strong className="text-foreground">Denied:</strong> Not offered admission this cycle. Disappointing, but rarely the end of the story. Many students thrive at their second-choice school.</li>
        </ul>

        <h4 className="font-serif text-lg text-foreground mt-5 mb-2">How you can help</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The most effective thing parents can do is stay calm. Your child is already under significant pressure. Expressing confidence in them — regardless of outcomes — makes a measurable difference. Help with logistics (deadlines, documents, financial aid forms) rather than content. And remind them that where they go matters far less than what they do once they get there.
        </p>
      </>
    ),
  },
  {
    id: "essay",
    title: "What Makes a Strong Essay",
    tag: "High impact",
    readTime: "7 min read",
    tone: "pink" as const,
    emoji: "✍️",
    content: (
      <>
        <p className="text-base text-muted-foreground leading-relaxed">
          The college essay is one of the most misunderstood parts of the application. Parents often want their child to write something impressive — to talk about a big achievement, a leadership role, or a meaningful mission trip. Admissions officers have read thousands of those. What actually stands out is something far simpler: a student writing honestly about something true.
        </p>

        <h4 className="font-serif text-lg text-foreground mt-5 mb-2">What admissions officers are actually looking for</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The essay answers one question the rest of the application can't: <em>Who is this person?</em> Officers want to hear the student's voice — how they think, what they notice, what matters to them. A well-written essay about learning to cook with a grandmother can be more compelling than a generic essay about founding a club.
        </p>

        <h4 className="font-serif text-lg text-foreground mt-5 mb-2">The five qualities of a strong essay</h4>
        <ul className="space-y-3 text-sm text-muted-foreground">
          <li><strong className="text-foreground">Authenticity:</strong> Admissions officers can tell when an essay has been heavily edited by a parent or tutor. The goal isn't a perfectly polished essay — it's an honest one. Awkward sentences with real voice beat flawless prose with no personality.</li>
          <li><strong className="text-foreground">Specific detail:</strong> "I love helping people" means nothing. "I spent six months teaching my grandfather to use FaceTime so he could see my sister graduate" means everything. Concrete, specific moments do the work that abstract statements can't.</li>
          <li><strong className="text-foreground">Reflection:</strong> The event itself is rarely what the essay is about — it's what the student learned, how they changed, or what they now see differently. Self-awareness and maturity are what officers are looking for, not an impressive résumé of experiences.</li>
          <li><strong className="text-foreground">Voice:</strong> The essay should sound like the student — not like a formal academic paper and not like a corporate cover letter. If your child speaks casually, some of that should come through. If they're funny, the essay can be too.</li>
          <li><strong className="text-foreground">Focus:</strong> One idea explored deeply beats five ideas covered shallowly. The best essays stay close to a single moment, theme, or insight. Trying to cover everything produces an essay that says nothing.</li>
        </ul>

        <h4 className="font-serif text-lg text-foreground mt-5 mb-2">Common topics — and what makes them work or fail</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Sports injuries, immigrant family stories, and mission trips are among the most common essay topics. None of these are inherently bad — but they require a genuinely personal angle to succeed. The question isn't <em>what happened</em>, it's <em>what does this reveal about how this specific student sees the world</em>?
        </p>

        <h4 className="font-serif text-lg text-foreground mt-5 mb-2">How parents can help (and what to avoid)</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li><strong className="text-foreground">Do:</strong> Read a draft and share how it made you feel as a reader — not whether it's impressive, but whether you learned something new about your child.</li>
          <li><strong className="text-foreground">Do:</strong> Ask questions: "What do you want the admissions officer to remember about you after reading this?"</li>
          <li><strong className="text-foreground">Don't:</strong> Rewrite sentences or suggest specific stories. The moment the essay sounds like you, it stops being their application.</li>
          <li><strong className="text-foreground">Don't:</strong> Compare their draft to essays you've read online. Every student's voice is different, and the published "successful" essays often aren't representative.</li>
        </ul>
        <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
          The best thing you can do is create space for your child to write — and then get out of the way.
        </p>
      </>
    ),
  },
  {
    id: "financial-aid",
    title: "Financial Aid Explained",
    tag: "Essential reading",
    readTime: "8 min read",
    tone: "gold" as const,
    emoji: "💰",
    content: (
      <>
        <p className="text-base text-muted-foreground leading-relaxed">
          The sticker price of a university is almost never what families actually pay. Understanding how financial aid works — and acting on it early — can make an enormous difference to what college ultimately costs your family.
        </p>

        <h4 className="font-serif text-lg text-foreground mt-5 mb-2">The two forms you need to know</h4>
        <ul className="space-y-3 text-sm text-muted-foreground">
          <li><strong className="text-foreground">FAFSA (Free Application for Federal Student Aid):</strong> Required by virtually every US university. Opens October 1 for the following academic year. Based on your tax return from two years prior (e.g., 2024–25 uses 2022 taxes). File as early as possible — some aid is first-come, first-served. Completing the FAFSA is free.</li>
          <li><strong className="text-foreground">CSS Profile:</strong> Required by ~400 private colleges in addition to the FAFSA. More detailed than the FAFSA — it factors in home equity, retirement assets, and non-custodial parent income. Each school receives the profile separately, and some charge a fee per submission. Check each school's financial aid page to confirm requirements.</li>
        </ul>

        <h4 className="font-serif text-lg text-foreground mt-5 mb-2">Types of aid — and the critical difference</h4>
        <ul className="space-y-3 text-sm text-muted-foreground">
          <li><strong className="text-foreground">Grants and institutional aid:</strong> Free money from the university — the largest and most valuable form of aid. Does not need to be repaid. Highly selective schools with large endowments (Harvard, Princeton, MIT, etc.) often meet 100% of demonstrated financial need. Don't assume these schools are unaffordable — they may be less expensive than lower-ranked alternatives for your family.</li>
          <li><strong className="text-foreground">Federal grants (Pell Grant):</strong> Need-based federal money for lower-income families. Up to ~$7,000/year. Also does not need to be repaid.</li>
          <li><strong className="text-foreground">Merit scholarships:</strong> Awarded for academic achievement, talent, or other criteria — not based on financial need. Some schools use merit aid aggressively to attract high-achieving students. Others (including most Ivies) offer need-based aid only.</li>
          <li><strong className="text-foreground">Work-study:</strong> A federal program allowing students to earn money through part-time jobs, usually on campus. The amount is limited but can supplement other aid.</li>
          <li><strong className="text-foreground">Loans:</strong> Must be repaid with interest. Federal loans (Stafford, PLUS) are generally more favorable than private loans. Minimize borrowing where possible — but don't let fear of loans cause your child to turn down a better opportunity.</li>
        </ul>

        <h4 className="font-serif text-lg text-foreground mt-5 mb-2">Understanding your financial aid offer</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">
          When offers arrive in March/April, compare them carefully. Look at the <em>net price</em> (total cost minus grants and scholarships) — not the sticker price. Two schools with very different list prices may cost your family the same amount. Be wary of offers that include large loan amounts labeled as "aid" — loans increase the apparent generosity of the package without actually reducing your cost.
        </p>

        <h4 className="font-serif text-lg text-foreground mt-5 mb-2">Can you negotiate?</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Yes — many families don't know this. If your financial circumstances changed since filing taxes (job loss, medical expenses, divorce), contact each school's financial aid office and explain. Schools can issue a "professional judgment" adjustment. If your child is admitted to multiple schools, you can also ask schools to match a more competitive offer from a peer institution. Be polite, specific, and provide documentation. It doesn't always work — but it often does.
        </p>

        <h4 className="font-serif text-lg text-foreground mt-5 mb-2">Key deadlines to track</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Financial aid deadlines are often earlier than application deadlines — sometimes by weeks. Missing the priority financial aid deadline at a school can mean significantly less money, even if your child is admitted. Add each school's financial aid deadline to your family calendar as soon as applications are submitted.
        </p>
      </>
    ),
  },
  {
    id: "early-decision",
    title: "Early Decision vs Regular Decision",
    tag: "Strategy guide",
    readTime: "7 min read",
    tone: "gold" as const,
    emoji: "📅",
    content: (
      <>
        <p className="text-base text-muted-foreground leading-relaxed">
          One of the most consequential decisions in the application process is <em>when</em> to apply — not just <em>where</em>. The timing options each carry different implications for admission odds, financial flexibility, and stress management.
        </p>

        <h4 className="font-serif text-lg text-foreground mt-5 mb-2">The full menu of timing options</h4>
        <ul className="space-y-3 text-sm text-muted-foreground">
          <li><strong className="text-foreground">Early Decision I (ED I):</strong> Apply by early November; decision by mid-December. If admitted, enrollment is <em>legally binding</em> — your child must withdraw all other applications and attend. ED I acceptance rates are often meaningfully higher than regular decision rates at the same school, because demonstrated commitment is valuable to admissions. Only use ED I if a school is genuinely your child's first choice and your family can afford it without comparing financial aid offers.</li>
          <li><strong className="text-foreground">Early Decision II (ED II):</strong> Same binding commitment, but with a January deadline and February decision. A good option if your child needs more time to find their first choice, or if they were deferred or rejected by their ED I school.</li>
          <li><strong className="text-foreground">Early Action (EA):</strong> Apply early (October–November), hear back by December–January, but the decision is <em>not binding</em>. Your child can still apply to other schools and has until May 1 to decide. Many strong students apply EA wherever it's available — there's little downside.</li>
          <li><strong className="text-foreground">Restrictive Early Action (REA) / Single-Choice Early Action:</strong> Offered by a small number of schools (Harvard, Yale, Stanford, Princeton). Non-binding, but students agree not to apply ED or EA anywhere else. An important restriction to understand before applying.</li>
          <li><strong className="text-foreground">Regular Decision (RD):</strong> Standard January 1–15 deadlines. Decisions arrive March–April. Gives students maximum flexibility to compare schools, wait-and-see on grades, and evaluate financial aid packages side-by-side before committing.</li>
          <li><strong className="text-foreground">Rolling Admissions:</strong> Some schools (many public universities) review applications as they arrive and notify students within weeks. Applying early under rolling admissions is almost always advantageous — spots fill over time.</li>
        </ul>

        <h4 className="font-serif text-lg text-foreground mt-5 mb-2">The financial risk of Early Decision</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">
          This is the part families most often overlook. By committing to attend before seeing a financial aid offer, you give up your ability to compare packages or negotiate with competing schools. Most ED agreements do include a financial hardship clause — if the aid package makes attendance genuinely impossible, you may be released from the commitment. But the bar is high. Talk honestly with your child and their counselor about whether ED is the right financial decision for your family before applying.
        </p>

        <h4 className="font-serif text-lg text-foreground mt-5 mb-2">Building a balanced timeline</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Most students apply to 10–15 schools across three categories: reach, target, and safety. A strong strategy might include one ED or EA application to a first-choice school, several EA applications to well-matched targets, and a few RD applications to safety schools where the student would genuinely be happy. Spreading deadlines reduces the November crunch and gives your child more processing time for each application.
        </p>

        <h4 className="font-serif text-lg text-foreground mt-5 mb-2">What parents should watch for</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>Watch for schools your child added for prestige rather than genuine fit — these rarely produce satisfying outcomes even when admitted.</li>
          <li>Make sure your child understands the binding nature of ED before applying — some students apply without fully appreciating what they're committing to.</li>
          <li>Don't push for ED at a school primarily because the acceptance rate looks better. The higher rate reflects student commitment, not a strategic shortcut.</li>
          <li>A balanced list with a few genuine safeties is more important than optimizing every early deadline. Uncertainty is part of this process — help your child sit with it rather than try to eliminate it.</li>
        </ul>
      </>
    ),
  },
];

// ── Component ────────────────────────────────────────────────────────────────
const ParentPortal = () => {
  const [openLesson, setOpenLesson] = useState<string | null>(null);
  const live = useParentPortalData();

  const firstName  = live.studentProfile?.full_name?.split(" ")[0] ?? "your child";
  const fullName   = live.studentProfile?.full_name ?? "";
  const schoolName = live.schoolName ?? "";
  const grade      = live.studentAcademics?.grade ?? "";
  const gpa        = live.studentAcademics?.gpa ?? null;
  const satScore   = live.studentAcademics?.sat_score ?? null;

  const overallProgress      = live.hasStudent ? live.overallProgress : 0;
  const journeyStages        = live.hasStudent ? live.journeyStages : [];
  const completedStageCount  = journeyStages.filter(s => s.completed).length;

  const essaysCompleted = live.hasStudent ? live.completedEssays : 0;
  const totalEssays     = live.hasStudent ? live.essays.length : 0;
  const appsSubmitted   = live.hasStudent ? live.submittedApps : 0;
  const totalApps       = live.hasStudent ? live.applications.length : 0;
  const recsCompleted   = live.hasStudent ? live.completedRecs : 0;
  const totalRecs       = live.hasStudent ? live.recommendations.length : 0;

  const universities = live.hasStudent
    ? live.applications.map(a => ({
        name: a.school_name,
        appType: a.application_type,
        status: a.status,
        deadline: a.deadline_date,
        strategy: a.ai_score_avg != null
          ? a.ai_score_avg < 40 ? "Reach" : a.ai_score_avg < 70 ? "Target" : "Safety"
          : "Target",
        completionPct: a.completion_percentage ?? 0,
        remaining: a.completed_essays < a.required_essays
          ? [`${a.required_essays - a.completed_essays} essay(s) remaining`]
          : [],
      }))
    : [];

  const urgencyItems = live.hasStudent
    ? [
        ...live.urgentApps.map(a => ({
          text: `${a.school_name} application`,
          sub: `${new Date(a.deadline_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} · ${daysUntil(a.deadline_date)} days left`,
          level: "red" as const,
        })),
        ...live.warningApps.map(a => ({
          text: `${a.school_name} application`,
          sub: `${new Date(a.deadline_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} · ${daysUntil(a.deadline_date)} days left`,
          level: "amber" as const,
        })),
      ]
    : [];

  const weekActivity = live.hasStudent
    ? [
        ...live.thisWeekSubmitted.map(a => ({
          text: `${a.school_name} application submitted`,
          date: new Date(a.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          type: "success" as const,
        })),
        ...live.thisWeekEssays.map(e => ({
          text: `"${e.essay_title}" essay updated`,
          date: new Date(e.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          type: "progress" as const,
        })),
      ]
    : [];

  const chartData = universities.map(u => ({
    name: u.name.length > 24 ? u.name.slice(0, 22) + "…" : u.name,
    completion: u.completionPct,
    strategy: u.strategy,
  }));

  const strategyChartColor = (s: string) =>
    s === "Reach" ? "oklch(0.72 0.10 15)" : s === "Safety" ? "oklch(0.78 0.07 155)" : "oklch(0.80 0.10 85)";

  return (
    <PageShell>
      <BlurOrb tone="pink" className="top-[-100px] right-[-100px] w-[520px] h-[520px]" />
      <BlurOrb tone="sage" className="bottom-[-140px] left-[-120px] w-[420px] h-[420px]" />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
        className="space-y-6 max-w-6xl mx-auto"
      >
        {/* Hero */}
        <motion.div variants={sectionVariants}>
          <HairlineCard variant="hero">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex-1">
                {live.hasStudent ? (
                  <>
                    <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2">
                      {schoolName}{grade ? ` · ${grade}` : ""}
                    </p>
                    <h1 className="font-serif text-3xl sm:text-4xl text-foreground leading-tight mb-3">
                      Guiding {firstName} toward what's next.
                    </h1>
                    <p className="text-base text-muted-foreground max-w-lg leading-relaxed font-serif italic">
                      A clearer, calmer admissions journey — for students and families.
                    </p>
                    <div className="flex flex-wrap items-center gap-3 mt-5">
                      <span className="inline-flex items-center gap-2 hairline rounded-full px-3 py-1 bg-[color:var(--pn-sage)]/15">
                        <span className="w-1.5 h-1.5 bg-[color:var(--pn-sage)] rounded-full animate-slow-pulse" />
                        <span className="text-[color:var(--pn-sage)] text-sm">On track</span>
                      </span>
                      {gpa && (
                        <span className="text-sm text-muted-foreground hairline rounded-full px-3 py-1 bg-white/[0.02]">
                          GPA <span className="num-display text-foreground ml-1">{gpa}</span>
                        </span>
                      )}
                      {satScore && (
                        <span className="text-sm text-muted-foreground hairline rounded-full px-3 py-1 bg-white/[0.02]">
                          SAT <span className="num-display text-foreground ml-1">{satScore}</span>
                        </span>
                      )}
                      <span className="text-sm text-muted-foreground">
                        <span className="num-display text-foreground">{appsSubmitted}</span> of <span className="num-display text-foreground">{totalApps}</span> applications submitted
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2">Parent portal</p>
                    <h1 className="font-serif text-3xl sm:text-4xl text-foreground leading-tight mb-3">
                      Welcome to your dashboard.
                    </h1>
                    <p className="text-base text-muted-foreground max-w-lg leading-relaxed font-serif italic">
                      Once your child's account is linked, you'll see their full application progress here.
                    </p>
                  </>
                )}
              </div>

              <div className="flex flex-col items-center gap-2 shrink-0">
                <SignalRing
                  value={live.hasStudent ? overallProgress : 0}
                  size={112}
                  tone="sage"
                  label={live.hasStudent ? "Complete" : "Pending"}
                />
                <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground text-center">
                  Overall progress
                </p>
              </div>
            </div>
          </HairlineCard>
        </motion.div>

        {/* Journey Roadmap */}
        <motion.div variants={sectionVariants}>
          <HairlineCard>
            <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
              <div>
                <h3 className="font-serif text-xl text-foreground">{firstName}'s admissions journey</h3>
                <p className="text-sm text-muted-foreground">
                  {live.hasStudent ? (
                    <><span className="num-display">{completedStageCount}</span> of <span className="num-display">{journeyStages.length}</span> milestones reached</>
                  ) : (
                    "Milestones will appear once linked"
                  )}
                </p>
              </div>
              {live.hasStudent && (
                <span className="hairline rounded-full px-3 py-1 text-xs bg-[color:var(--pn-sage)]/10 text-[color:var(--pn-sage)]">
                  Class of <span className="num-display ml-1">{live.studentAcademics?.graduation_year ?? "—"}</span>
                </span>
              )}
            </div>

            {live.hasStudent && journeyStages.length > 0 ? (
              <div className="relative">
                <div className="absolute top-5 left-5 right-5 h-px bg-white/[0.08]" />
                <motion.div
                  className="absolute top-5 left-5 h-px bg-[color:var(--pn-sage)]"
                  initial={{ width: 0 }}
                  animate={{ width: `calc(${(completedStageCount / Math.max(journeyStages.length - 1, 1)) * 100}% - 2.5rem)` }}
                  transition={{ duration: 0.9, ease: [0.2, 0.6, 0.2, 1], delay: 0.2 }}
                />
                <div className="flex justify-between relative">
                  {journeyStages.map((stage, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all duration-300 hairline ${
                        stage.completed
                          ? "bg-[color:var(--pn-sage)]/20"
                          : i === completedStageCount
                          ? "bg-white/[0.06]"
                          : "bg-white/[0.02]"
                      }`}>
                        {stage.completed
                          ? <CheckCircle className="h-5 w-5 text-[color:var(--pn-sage)]" />
                          : <span className={`num-display text-xs ${i === completedStageCount ? "text-foreground" : "text-muted-foreground"}`}>{i + 1}</span>
                        }
                      </div>
                      <span className={`text-[10px] uppercase tracking-[0.14em] text-center leading-tight max-w-[72px] ${
                        stage.completed ? "text-[color:var(--pn-sage)]" : i === completedStageCount ? "text-foreground" : "text-muted-foreground"
                      }`}>
                        {stage.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <ComingSoon label="Journey milestones" />
            )}
          </HairlineCard>
        </motion.div>

        {/* Stats Row */}
        {live.hasStudent ? (
          <motion.div variants={sectionVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Essays",       value: `${essaysCompleted}/${totalEssays}`, sub: "completed",    icon: BookOpen,       tone: "var(--pn-gold)" },
              { label: "Applications", value: `${appsSubmitted}/${totalApps}`,     sub: "submitted",    icon: GraduationCap,  tone: "var(--pn-sage)" },
              { label: "Rec letters",  value: `${recsCompleted}/${totalRecs}`,     sub: "secured",      icon: Star,           tone: "var(--pn-pink)" },
              { label: "Attention",    value: urgencyItems.filter(u => u.level === "red").length.toString(), sub: "items urgent", icon: Zap, tone: "var(--pn-pink)" },
            ].map(({ label, value, sub, icon: Icon, tone }, i) => (
              <HairlineCard key={i}>
                <div className="hairline rounded-lg p-2 w-fit mb-3" style={{ background: `${tone}20` }}>
                  <Icon className="h-4 w-4" style={{ color: tone }} />
                </div>
                <p className="num-display text-2xl text-foreground">{value}</p>
                <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground mt-1">{label} {sub}</p>
              </HairlineCard>
            ))}
          </motion.div>
        ) : (
          <motion.div variants={sectionVariants}>
            <ComingSoon label="Application stats" />
          </motion.div>
        )}

        {/* Needs Attention */}
        <motion.div variants={sectionVariants}>
          <HairlineCard>
            <h3 className="font-serif text-xl text-foreground mb-1 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-[color:var(--pn-gold)]" />
              Needs attention
            </h3>
            <p className="text-sm text-muted-foreground mb-4 font-serif italic">
              Items that need action in the near term.
            </p>

            {!live.hasStudent ? (
              <ComingSoon label="Urgent action items" />
            ) : urgencyItems.length === 0 ? (
              <div className="flex items-center gap-3 p-4 rounded-xl hairline bg-[color:var(--pn-sage)]/10">
                <CheckCircle className="h-5 w-5 text-[color:var(--pn-sage)] shrink-0" />
                <p className="text-sm text-[color:var(--pn-sage)] font-serif italic">
                  Nothing urgent right now — {firstName} is on top of things.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {urgencyItems.map((item, i) => {
                  const u = urgencyStyle(item.level);
                  return (
                    <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl hairline bg-white/[0.02] border-l-2" style={{ borderLeftColor: u.tone }}>
                      <div className="shrink-0 mt-0.5">{u.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground truncate">{item.text}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.sub}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {live.hasStudent && (
              <div className="mt-5 p-4 hairline rounded-xl bg-[color:var(--pn-sage)]/10">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="h-4 w-4 text-[color:var(--pn-sage)]" />
                  <p className="text-sm font-serif text-[color:var(--pn-sage)]">You're on track.</p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed font-serif italic">
                  {firstName}'s timeline is progressing well. Keep the momentum going.
                </p>
              </div>
            )}
          </HairlineCard>
        </motion.div>

        {/* University List */}
        <motion.div variants={sectionVariants}>
          <HairlineCard>
            <div className="flex items-center justify-between mb-5 gap-4 flex-wrap">
              <div>
                <h3 className="font-serif text-xl text-foreground flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-[color:var(--pn-gold)]" />
                  Their college list
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5 font-serif italic">
                  {fullName ? `${fullName}'s full application list.` : "College application list."}
                </p>
              </div>
              {live.hasStudent && universities.length > 0 && (
                <div className="flex gap-2 text-xs">
                  <span className={`px-2.5 py-1 rounded-full ${strategyPill("Reach")}`}>Reach</span>
                  <span className={`px-2.5 py-1 rounded-full ${strategyPill("Target")}`}>Target</span>
                  <span className={`px-2.5 py-1 rounded-full ${strategyPill("Safety")}`}>Safety</span>
                </div>
              )}
            </div>

            {!live.hasStudent || universities.length === 0 ? (
              <ComingSoon label="University list" />
            ) : (
              <div className="space-y-3">
                {universities.map((uni, i) => {
                  const days = daysUntil(uni.deadline);
                  const initials = uni.name.split(" ").map((w: string) => w[0]).filter((_: string, idx: number) => idx < 2).join("");
                  return (
                    <div key={i} className="hairline rounded-xl bg-white/[0.02] p-4 hover:bg-white/[0.03] transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 num-display text-base hairline ${strategyInitials(uni.strategy)}`}>
                          {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <p className="font-serif text-lg text-foreground">{uni.name}</p>
                            <span className={`text-[10px] uppercase tracking-[0.14em] px-2 py-0.5 rounded-full ${strategyPill(uni.strategy)}`}>{uni.strategy}</span>
                            <span className={`text-[10px] uppercase tracking-[0.14em] px-2 py-0.5 rounded-full ${statusPill(uni.status)}`}>{uni.status}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-2">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(uni.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                              {uni.status !== "Submitted" && days >= 0 && (
                                <span className={`ml-1 num-display ${days <= 7 ? "text-[color:var(--pn-pink)]" : days <= 14 ? "text-[color:var(--pn-gold)]" : "text-muted-foreground"}`}>
                                  · {days}d left
                                </span>
                              )}
                            </span>
                            {uni.appType && (
                              <span className="hairline rounded-full px-1.5 py-0.5 text-muted-foreground bg-white/[0.02]">{uni.appType}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <AnimatedBar
                              pct={uni.completionPct}
                              tone={
                                uni.completionPct >= 80 ? "var(--pn-sage)" :
                                uni.completionPct >= 50 ? "var(--pn-gold)" : "var(--pn-pink)"
                              }
                            />
                            <span className="num-display text-xs text-muted-foreground shrink-0 w-8 text-right">{uni.completionPct}%</span>
                          </div>
                          {uni.remaining.length > 0 && (
                            <p className="text-xs text-[color:var(--pn-gold)] mt-1.5 flex items-center gap-1">
                              <Clock className="h-3 w-3 shrink-0" />
                              {uni.remaining.join(" · ")}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </HairlineCard>
        </motion.div>

        {/* Application Progress Chart */}
        {live.hasStudent && universities.length > 0 && (
          <motion.div variants={sectionVariants}>
            <HairlineCard>
              <div className="mb-5">
                <h3 className="font-serif text-xl text-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-[color:var(--pn-sage)]" />
                  Where each application stands
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5 font-serif italic">
                  Completion across {firstName}'s <span className="num-display not-italic">{universities.length}</span> school{universities.length !== 1 ? "s" : ""}.
                </p>
              </div>
              <ResponsiveContainer width="100%" height={Math.max(universities.length * 52, 80)}>
                <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 48, left: 0, bottom: 0 }}>
                  <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" width={160} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(value) => [`${value}%`, "Completion"]}
                    contentStyle={chartTooltipStyle}
                    cursor={{ fill: "rgba(255,255,255,0.03)" }}
                  />
                  <Bar dataKey="completion" radius={[0, 6, 6, 0]} maxBarSize={28}>
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={strategyChartColor(entry.strategy)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="flex gap-5 mt-4 text-xs text-muted-foreground">
                {[
                  { s: "Reach", tone: "var(--pn-pink)" },
                  { s: "Target", tone: "var(--pn-gold)" },
                  { s: "Safety", tone: "var(--pn-sage)" },
                ].map(({ s, tone }) => (
                  <span key={s} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: tone }} />
                    {s}
                  </span>
                ))}
              </div>
            </HairlineCard>
          </motion.div>
        )}

        {/* Weekly Snapshot + Strength Profile */}
        <motion.div variants={sectionVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <HairlineCard>
            <h3 className="font-serif text-xl text-foreground mb-1 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[color:var(--pn-sage)]" />
              Since we last spoke
            </h3>
            <p className="text-sm text-muted-foreground mb-4 font-serif italic">
              Recent activity in {firstName}'s application process.
            </p>

            {!live.hasStudent ? (
              <ComingSoon label="Weekly activity" />
            ) : weekActivity.length === 0 ? (
              <p className="text-sm font-serif italic text-muted-foreground">
                No activity from {firstName} this week yet — check back soon.
              </p>
            ) : (
              <div className="space-y-2.5">
                {weekActivity.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div
                      className="mt-1.5 w-2 h-2 rounded-full shrink-0"
                      style={{ background: item.type === "success" ? "var(--pn-sage)" : "var(--pn-gold)" }}
                    />
                    <div className="flex-1">
                      <p className="text-sm text-foreground">{item.text}</p>
                      <p className="text-xs text-muted-foreground">{item.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </HairlineCard>

          <HairlineCard>
            <h3 className="font-serif text-xl text-foreground mb-1 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[color:var(--pn-pink)]" />
              {firstName}'s strength profile
            </h3>
            <p className="text-sm text-muted-foreground mb-5 font-serif italic">
              How {firstName} is positioning for admissions.
            </p>
            {live.hasStudent ? (
              <StrengthProfile
                gpa={live.studentAcademics?.gpa ?? null}
                satScore={live.studentAcademics?.sat_score ?? null}
                actScore={live.studentAcademics?.act_score ?? null}
                essaysCompleted={essaysCompleted}
                totalEssays={totalEssays}
                recsCompleted={recsCompleted}
                totalRecs={totalRecs}
                overallProgress={overallProgress}
                universities={universities}
              />
            ) : (
              <ComingSoon label="Strength profile data" />
            )}
          </HairlineCard>
        </motion.div>

        {/* Parent Insights — coming soon */}
        <motion.div variants={sectionVariants}>
          <HairlineCard>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl hairline bg-[color:var(--pn-pink)]/15 flex items-center justify-center">
                <Star className="h-5 w-5 text-[color:var(--pn-pink)]" />
              </div>
              <div>
                <h3 className="font-serif text-xl text-foreground">A word for you.</h3>
                <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mt-0.5">AI-generated weekly summary</p>
              </div>
            </div>
            <ComingSoon label="AI-generated parent insights" />
          </HairlineCard>
        </motion.div>

        {/* Learning Center */}
        <motion.div variants={sectionVariants}>
          <PageHeader
            eyebrow="Learning centre"
            title={<>What to know.</>}
            subtitle={<>Guides to help you support {firstName} through the admissions process.</>}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {LESSONS.map(lesson => {
              const toneVar =
                lesson.tone === "pink" ? "var(--pn-pink)" :
                lesson.tone === "gold" ? "var(--pn-gold)" : "var(--pn-sage)";
              const pillCls =
                lesson.tone === "pink" ? "bg-[color:var(--pn-pink)]/15 text-[color:var(--pn-pink)]" :
                lesson.tone === "gold" ? "bg-[color:var(--pn-gold)]/15 text-[color:var(--pn-gold)]" :
                "bg-[color:var(--pn-sage)]/15 text-[color:var(--pn-sage)]";
              return (
                <HairlineCard key={lesson.id} className="p-0 overflow-hidden">
                  <div className="p-5" style={{ background: `linear-gradient(135deg, ${toneVar}20 0%, transparent 100%)` }}>
                    <div className="text-3xl mb-2">{lesson.emoji}</div>
                    <h4 className="font-serif text-xl text-foreground leading-snug">{lesson.title}</h4>
                    <div className="flex items-center gap-2 mt-3">
                      <span className={`text-[10px] uppercase tracking-[0.14em] hairline rounded-full px-2 py-0.5 ${pillCls}`}>
                        {lesson.tag}
                      </span>
                      <span className="text-xs text-muted-foreground">{lesson.readTime}</span>
                    </div>
                  </div>

                  <button
                    className="w-full flex items-center justify-between px-5 py-3 text-sm text-foreground hover:bg-white/[0.02] transition-colors hairline-t"
                    onClick={() => setOpenLesson(openLesson === lesson.id ? null : lesson.id)}
                  >
                    <span>{openLesson === lesson.id ? "Close guide" : "Read guide"}</span>
                    {openLesson === lesson.id
                      ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </button>

                  {openLesson === lesson.id && (
                    <div className="px-5 pb-5 hairline-t pt-4">
                      {lesson.content}
                    </div>
                  )}
                </HairlineCard>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </PageShell>
  );
};

export default ParentPortal;
