import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  PageShell,
  PageHeader,
  HairlineCard,
  BlurOrb,
} from "@/components/primrose-night";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Trophy,
  Clock,
  Flame,
  Loader2,
  Target,
  CheckCircle2,
  ArrowRight,
  Lock,
  ChevronUp,
  Users,
  School,
} from "lucide-react";

interface Challenge {
  id: string;
  week_number: number;
  title: string;
  theme: string;
  description: string;
  example_prompt: string | null;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
}

interface CriterionScore {
  id: string;
  name: string;
  score: number;
  color: string;
}

interface LeaderboardEntry {
  id: string;
  hook_text: string;
  ai_scores: { overallScore: number; criteria: CriterionScore[] } | null;
  submitted_at: string;
  student_id: string;
  name: string;
  initials: string;
}

const MAX_CHARS = 500;

function formatCountdown(endsAt: string): string {
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) return "Closed";
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${mins}m left`;
  return `${mins}m left`;
}

function daysUntil(iso: string): number {
  const diff = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
}

function totalDays(startsAt: string, endsAt: string): number {
  return Math.ceil((new Date(endsAt).getTime() - new Date(startsAt).getTime()) / 86400000);
}

function formatDeadline(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", hour: "numeric", minute: "2-digit" });
}

const sectionVariants = {
  hidden: { opacity: 0, y: 8, filter: "blur(4px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.4, ease: [0.2, 0.6, 0.2, 1] as const } },
};

const WeeklyChallenge = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [mySubmission, setMySubmission] = useState<any | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [submissionCount, setSubmissionCount] = useState(0);
  const [participatingSchools, setParticipatingSchools] = useState(0);
  const [hookText, setHookText] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState("");
  const [isClosed, setIsClosed] = useState(false);

  const loadLeaderboard = useCallback(async (challengeId: string, userId: string | null) => {
    const { data: subs } = await supabase
      .from("challenge_submissions")
      .select("id, hook_text, ai_scores, submitted_at, student_id")
      .eq("challenge_id", challengeId)
      .not("ai_scores", "is", null);

    if (!subs?.length) { setLeaderboard([]); return; }

    const ids = [...new Set(subs.map(s => s.student_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, full_name")
      .in("user_id", ids);

    const profileMap: Record<string, string> = {};
    (profiles ?? []).forEach(p => { profileMap[p.user_id] = p.full_name ?? "Student"; });

    const ranked: LeaderboardEntry[] = (subs as any[])
      .filter(s => s.ai_scores?.overallScore != null)
      .sort((a, b) => b.ai_scores.overallScore - a.ai_scores.overallScore)
      .map(s => {
        const fullName = profileMap[s.student_id] ?? "Student";
        const parts = fullName.trim().split(" ");
        const display = parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0]}.` : parts[0];
        return {
          ...s,
          name: s.student_id === userId ? `${display} (You)` : display,
          initials: parts.map((p: string) => p[0]).join("").slice(0, 2).toUpperCase(),
        };
      });

    setLeaderboard(ranked);
  }, []);

  const loadPlatformStats = useCallback(async (challengeId: string) => {
    const { data: subs } = await supabase
      .from("challenge_submissions")
      .select("student_id")
      .eq("challenge_id", challengeId);

    if (!subs?.length) { setSubmissionCount(0); setParticipatingSchools(0); return; }

    setSubmissionCount(subs.length);

    const ids = [...new Set(subs.map(s => s.student_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("school_id")
      .in("user_id", ids);

    const schools = new Set((profiles ?? []).map(p => p.school_id).filter(Boolean));
    setParticipatingSchools(schools.size);
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const uid = user?.id ?? null;
        setCurrentUserId(uid);

        const { data: challenges } = await supabase
          .from("weekly_challenges")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(1);

        const active = challenges?.[0] ?? null;
        setChallenge(active);

        if (!active) { setLoading(false); return; }

        const closed = new Date(active.ends_at) <= new Date();
        setIsClosed(closed);
        setCountdown(formatCountdown(active.ends_at));

        if (uid) {
          const { data: existing } = await supabase
            .from("challenge_submissions")
            .select("id, hook_text, ai_scores")
            .eq("challenge_id", active.id)
            .eq("student_id", uid)
            .maybeSingle();

          if (existing) {
            setMySubmission(existing);
            setHookText(existing.hook_text);
          }
        }

        await loadPlatformStats(active.id);
        if (closed) await loadLeaderboard(active.id, uid);
      } catch (e: any) {
        toast({ title: "Failed to load challenge", description: e.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [loadLeaderboard, loadPlatformStats, toast]);

  useEffect(() => {
    if (!challenge) return;
    const interval = setInterval(() => {
      const closed = new Date(challenge.ends_at) <= new Date();
      setIsClosed(closed);
      setCountdown(closed ? "Closed" : formatCountdown(challenge.ends_at));
    }, 30000);
    return () => clearInterval(interval);
  }, [challenge]);

  const handleSubmit = async () => {
    if (!challenge || !hookText.trim() || hookText.length > MAX_CHARS) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke("judge-hook-challenge", {
        body: { hookText: hookText.trim(), challengeId: challenge.id, challengeTheme: challenge.theme },
      });
      if (error) throw error;

      setMySubmission({ hook_text: hookText.trim(), ai_scores: null });
      await loadPlatformStats(challenge.id);
      toast({ title: "Your opening has been submitted!", description: "Results will be revealed when the challenge closes." });
    } catch (e: any) {
      toast({ title: "Submission failed", description: e.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PageShell>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageShell>
    );
  }

  if (!challenge) {
    return (
      <PageShell>
        <BlurOrb tone="gold" className="top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px]" />
        <div className="flex items-center justify-center min-h-[60vh]">
          <HairlineCard variant="gold" className="max-w-md text-center p-10 space-y-4">
            <Trophy className="h-14 w-14 text-[color:var(--pn-gold)]/50 mx-auto" />
            <h2 className="font-serif text-3xl text-foreground leading-tight">No prompt this week.</h2>
            <p className="font-serif italic text-muted-foreground">A new Primrose Challenge will be posted here soon.</p>
            <Button
              type="button"
              onClick={() => navigate("/student-dashboard")}
              className="bg-transparent hairline hover:bg-white/[0.04] text-foreground shadow-none mt-2"
            >
              Back to Dashboard
            </Button>
          </HairlineCard>
        </div>
      </PageShell>
    );
  }

  const myRank = isClosed ? leaderboard.findIndex(e => e.student_id === currentUserId) + 1 : null;
  const winner = isClosed ? leaderboard[0] : null;
  const daysLeft = daysUntil(challenge.ends_at);
  const totalD = totalDays(challenge.starts_at, challenge.ends_at);
  const timeProgress = isClosed ? 100 : Math.max(0, Math.min(100, ((totalD - daysLeft) / totalD) * 100));
  const rankEmoji = (r: number) => r === 1 ? "🥇" : r === 2 ? "🥈" : r === 3 ? "🥉" : `#${r}`;

  return (
    <PageShell>
      <BlurOrb tone="gold" className="top-[-100px] right-[-100px] w-[500px] h-[500px]" />

      <PageHeader
        eyebrow="Primrose Challenge"
        title={<>This week's prompt.</>}
        subtitle={<>One paragraph. Everyone competes.</>}
        actions={
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full hairline bg-white/[0.03]">
            <Trophy className="h-3.5 w-3.5 text-[color:var(--pn-gold)]" />
            <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Week {challenge.week_number}</span>
          </div>
        }
      />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
        className="space-y-5"
      >

        {/* Main challenge hero card */}
        <motion.div variants={sectionVariants}>
          <HairlineCard variant="hero">
            <div className="flex items-start gap-5">

              {/* Trophy badge with live pulse */}
              <div className="shrink-0 relative">
                <div className="w-16 h-16 rounded-2xl hairline bg-[color:var(--pn-gold)]/15 flex items-center justify-center">
                  <Trophy className="h-8 w-8 text-[color:var(--pn-gold)]" />
                </div>
                {!isClosed && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[color:var(--pn-sage)] opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[color:var(--pn-sage)]" />
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {isClosed ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs hairline bg-[color:var(--pn-pink)]/15 text-[color:var(--pn-pink)]">
                      Closed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs hairline bg-[color:var(--pn-sage)]/15 text-[color:var(--pn-sage)]">
                      <Flame className="h-3 w-3" /> Live Challenge
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span className="num-display">{countdown}</span>
                  </span>
                </div>
                <h1 className="font-serif text-3xl text-foreground leading-tight">{challenge.title}</h1>
                <p className="text-muted-foreground mt-2 leading-relaxed whitespace-pre-line">{challenge.description}</p>
              </div>
            </div>

            {/* Time progress bar */}
            {!isClosed && (
              <div className="mt-6 space-y-1.5">
                <div className="flex justify-between text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  <span>Challenge progress</span>
                  <span className="text-[color:var(--pn-gold)]">
                    <span className="num-display">{daysLeft}d</span> until {formatDeadline(challenge.ends_at)}
                  </span>
                </div>
                <div className="h-1 rounded-full bg-white/[0.05] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: 'var(--pn-gold)' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${timeProgress}%` }}
                    transition={{ duration: 0.9, ease: [0.2, 0.6, 0.2, 1] }}
                  />
                </div>
              </div>
            )}
          </HairlineCard>
        </motion.div>

        {/* Stats row */}
        <motion.div variants={sectionVariants} className="grid grid-cols-3 gap-4">
          <div className="hairline rounded-2xl bg-white/[0.02] p-5 text-center">
            <div className="w-10 h-10 rounded-xl hairline bg-[color:var(--pn-sage)]/12 flex items-center justify-center mx-auto mb-3">
              <Users className="h-5 w-5 text-[color:var(--pn-sage)]" />
            </div>
            <div className="num-display text-3xl text-foreground">{submissionCount}</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-1">Submissions</div>
          </div>

          <div className="hairline rounded-2xl bg-white/[0.02] p-5 text-center">
            <div className="w-10 h-10 rounded-xl hairline bg-[color:var(--pn-gold)]/12 flex items-center justify-center mx-auto mb-3">
              <School className="h-5 w-5 text-[color:var(--pn-gold)]" />
            </div>
            <div className="num-display text-3xl text-foreground">{participatingSchools}</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-1">Schools</div>
          </div>

          <div className="hairline rounded-2xl bg-white/[0.02] p-5 text-center">
            <div className={`w-10 h-10 rounded-xl hairline flex items-center justify-center mx-auto mb-3 ${
              isClosed ? "bg-white/[0.03]" : "bg-[color:var(--pn-pink)]/12"
            }`}>
              <Clock className={`h-5 w-5 ${isClosed ? "text-muted-foreground" : "text-[color:var(--pn-pink)]"}`} />
            </div>
            <div className={`num-display text-3xl ${isClosed ? "text-muted-foreground" : "text-foreground"}`}>
              {isClosed ? "Done" : `${daysLeft}d`}
            </div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-1">
              {isClosed ? "Ended" : `Until ${formatDeadline(challenge.ends_at)}`}
            </div>
          </div>
        </motion.div>

        {/* Prize */}
        <motion.div variants={sectionVariants}>
          <HairlineCard variant="gold">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg hairline bg-[color:var(--pn-gold)]/20 flex items-center justify-center">
                <Trophy className="h-3.5 w-3.5 text-[color:var(--pn-gold)]" />
              </div>
              <h3 className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--pn-gold)]">The prize</h3>
            </div>
            <div className="space-y-2 text-sm text-foreground/85">
              <div className="flex items-center gap-2">
                <span className="text-lg">🏆</span>
                <span>3 hours of admissions consulting with our senior consultants</span>
              </div>
              <div className="pl-7 text-[10px] uppercase tracking-[0.18em] text-[color:var(--pn-gold)]/70">OR</div>
              <div className="flex items-center gap-2">
                <span className="text-lg">🏆</span>
                <span>A family strategy session with your parents</span>
              </div>
            </div>
          </HairlineCard>
        </motion.div>

        {/* Hint */}
        {challenge.example_prompt && !isClosed && (
          <motion.div variants={sectionVariants}>
            <HairlineCard variant="sage">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg hairline bg-[color:var(--pn-sage)]/15 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-sm">💡</span>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--pn-sage)] mb-1.5">Challenge hint</p>
                  <p className="font-serif italic text-foreground text-sm leading-relaxed">{challenge.example_prompt}</p>
                </div>
              </div>
            </HairlineCard>
          </motion.div>
        )}

        {/* Winner banner */}
        {isClosed && winner && (
          <motion.div variants={sectionVariants}>
            <HairlineCard variant="gold">
              <div className="flex items-center gap-4">
                <div className="text-4xl shrink-0">🏆</div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--pn-gold)]">Challenge winner</p>
                  <p className="font-serif text-xl text-foreground mt-1">{winner.name}</p>
                  <p className="text-sm font-serif italic text-muted-foreground mt-1 truncate">"{winner.hook_text}"</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="num-display text-4xl text-[color:var(--pn-gold)] leading-none">{winner.ai_scores?.overallScore}</div>
                  <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-1">/ 100</div>
                </div>
              </div>
            </HairlineCard>
          </motion.div>
        )}

        {/* Submission form */}
        {!mySubmission && !isClosed && (
          <motion.div variants={sectionVariants}>
            <HairlineCard>
              <div className="flex items-center gap-3 mb-6">
                <Target className="h-5 w-5 text-foreground/60" />
                <div>
                  <h2 className="font-serif text-xl text-foreground leading-tight">Your opening.</h2>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-1">1–3 sentences that hook the reader</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Textarea
                    value={hookText}
                    onChange={e => setHookText(e.target.value)}
                    rows={5}
                    className="resize-none font-serif text-base leading-relaxed bg-white/[0.02] hairline"
                    maxLength={MAX_CHARS}
                    placeholder="Write your opening here..."
                  />
                  <div className="flex justify-end text-[10px] uppercase tracking-[0.18em]">
                    <span className={hookText.length > MAX_CHARS * 0.9 ? "text-[color:var(--pn-pink)]" : "text-muted-foreground"}>
                      <span className="num-display">{hookText.length}</span>/<span className="num-display">{MAX_CHARS}</span>
                    </span>
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting || hookText.trim().length < 10 || hookText.length > MAX_CHARS}
                  className="w-full h-12 gap-2 bg-[color:var(--pn-gold)]/15 hairline text-[color:var(--pn-gold)] hover:bg-[color:var(--pn-gold)]/25 shadow-none disabled:opacity-40"
                  size="lg"
                >
                  {submitting
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</>
                    : <><ArrowRight className="h-5 w-5" /> Start the Challenge</>
                  }
                </Button>
              </div>
            </HairlineCard>
          </motion.div>
        )}

        {/* Already submitted — open */}
        {mySubmission && !isClosed && (
          <motion.div variants={sectionVariants}>
            <HairlineCard variant="sage">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl hairline bg-[color:var(--pn-sage)]/15 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-6 w-6 text-[color:var(--pn-sage)]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-serif text-xl text-foreground leading-tight">Your opening is in.</h3>
                    <p className="font-serif italic text-muted-foreground text-sm mt-1">Scores are locked until the challenge closes.</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground shrink-0">
                    <Lock className="h-3.5 w-3.5" />
                    Results {formatDate(challenge.ends_at)}
                  </div>
                </div>

                <div className="p-4 rounded-xl hairline bg-white/[0.02]">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-1.5">Your submitted opening</p>
                  <p className="font-serif italic text-foreground">"{mySubmission.hook_text}"</p>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl hairline bg-[color:var(--pn-gold)]/8">
                  <Trophy className="h-4 w-4 text-[color:var(--pn-gold)] shrink-0" />
                  <p className="text-sm text-foreground/85">
                    <span className="num-display">{submissionCount}</span> student{submissionCount !== 1 ? "s" : ""} have entered. Rankings appear when it closes.
                  </p>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full hairline hover:bg-white/[0.04] text-foreground"
                  onClick={() => setMySubmission(null)}
                >
                  Edit my opening
                </Button>
              </div>
            </HairlineCard>
          </motion.div>
        )}

        {/* Closed — no submission */}
        {!mySubmission && isClosed && (
          <motion.div variants={sectionVariants}>
            <HairlineCard className="text-center py-10 space-y-3">
              <Lock className="h-12 w-12 text-muted-foreground mx-auto opacity-30" />
              <p className="font-serif text-2xl text-foreground leading-tight">This one's closed.</p>
              <p className="font-serif italic text-muted-foreground">You didn't submit an opening this round. Stay tuned for the next Primrose Challenge.</p>
            </HairlineCard>
          </motion.div>
        )}

        {/* Closed — your result */}
        {mySubmission && isClosed && (
          <motion.div variants={sectionVariants}>
            <HairlineCard>
              <h2 className="font-serif text-xl text-foreground leading-tight mb-5">Your result.</h2>
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  {mySubmission.ai_scores && (
                    <div className="rounded-2xl hairline bg-[color:var(--pn-gold)]/8 p-5 text-center">
                      <div className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--pn-gold)] mb-1">Your score</div>
                      <div className="num-display text-5xl text-[color:var(--pn-gold)]">{mySubmission.ai_scores.overallScore}</div>
                      <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-1">out of 100</div>
                    </div>
                  )}
                  {myRank && myRank > 0 && (
                    <div className="rounded-2xl hairline bg-[color:var(--pn-sage)]/8 p-5 text-center">
                      <div className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--pn-sage)] mb-1">Your rank</div>
                      <div className="text-5xl leading-none">{rankEmoji(myRank)}</div>
                      <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-1">of <span className="num-display">{leaderboard.length}</span> entries</div>
                    </div>
                  )}
                </div>

                {mySubmission.ai_scores?.feedback && (
                  <p className="text-muted-foreground leading-relaxed text-sm font-serif italic">{mySubmission.ai_scores.feedback}</p>
                )}

                {mySubmission.ai_scores?.criteria && (
                  <div className="space-y-3">
                    {mySubmission.ai_scores.criteria.map((c: CriterionScore) => (
                      <div key={c.id} className="space-y-1.5">
                        <div className="flex justify-between text-sm">
                          <span style={{ color: c.color }}>{c.name}</span>
                          <span className="num-display text-muted-foreground">{c.score}/100</span>
                        </div>
                        <div className="h-1 rounded-full bg-white/[0.05] overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: c.color }}
                            initial={{ width: 0 }}
                            animate={{ width: `${c.score}%` }}
                            transition={{ duration: 0.9, ease: [0.2, 0.6, 0.2, 1] }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {mySubmission.ai_scores?.strengths?.length > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl hairline bg-[color:var(--pn-sage)]/8 p-4 space-y-2">
                      <p className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--pn-sage)]">Strengths</p>
                      {mySubmission.ai_scores.strengths.map((s: string, i: number) => (
                        <div key={i} className="flex items-start gap-1.5 text-xs text-foreground/85">
                          <CheckCircle2 className="h-3.5 w-3.5 text-[color:var(--pn-sage)] shrink-0 mt-0.5" />{s}
                        </div>
                      ))}
                    </div>
                    <div className="rounded-xl hairline bg-[color:var(--pn-pink)]/8 p-4 space-y-2">
                      <p className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--pn-pink)]">To improve</p>
                      {mySubmission.ai_scores.improvements?.map((s: string, i: number) => (
                        <div key={i} className="flex items-start gap-1.5 text-xs text-foreground/85">
                          <ChevronUp className="h-3.5 w-3.5 text-[color:var(--pn-pink)] shrink-0 mt-0.5" />{s}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-4 rounded-xl hairline bg-white/[0.02]">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-1.5">Your opening</p>
                  <p className="text-sm font-serif italic text-foreground">"{mySubmission.hook_text}"</p>
                </div>
              </div>
            </HairlineCard>
          </motion.div>
        )}

        {/* Final leaderboard */}
        {isClosed && leaderboard.length > 0 && (
          <motion.div variants={sectionVariants}>
            <HairlineCard>
              <div className="flex items-center gap-2 mb-5">
                <Trophy className="h-5 w-5 text-[color:var(--pn-gold)]" />
                <h2 className="font-serif text-xl text-foreground leading-tight">Final rankings.</h2>
              </div>
              <div className="space-y-2">
                {leaderboard.map((entry, idx) => {
                  const rank = idx + 1;
                  const isMe = entry.student_id === currentUserId;
                  const isTop3 = rank <= 3;
                  const rankBg =
                    isMe ? "bg-white/[0.06]" :
                    rank === 1 ? "bg-[color:var(--pn-gold)]/8" :
                    rank === 2 ? "bg-white/[0.04]" :
                    rank === 3 ? "bg-[color:var(--pn-pink)]/6" :
                    "bg-white/[0.02] hover:bg-white/[0.03]";
                  return (
                    <div
                      key={entry.id}
                      className={`p-3.5 rounded-xl hairline transition-colors ${rankBg}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl w-8 text-center shrink-0">{rankEmoji(rank)}</span>
                        <Avatar className="h-8 w-8 hairline">
                          <AvatarFallback className="text-xs bg-white/[0.05] text-foreground">{entry.initials}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm truncate ${isTop3 ? "text-foreground" : "text-muted-foreground"}`}>{entry.name}</p>
                          <p className="text-xs font-serif italic text-muted-foreground truncate">"{entry.hook_text}"</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`num-display text-lg ${rank === 1 ? "text-[color:var(--pn-gold)]" : "text-foreground"}`}>
                            {entry.ai_scores?.overallScore}
                          </span>
                        </div>
                      </div>
                      {entry.ai_scores?.criteria && isTop3 && (
                        <div className="flex gap-1 mt-2 pl-11">
                          {entry.ai_scores.criteria.map((c: CriterionScore) => (
                            <div
                              key={c.id}
                              title={`${c.name}: ${c.score}`}
                              className="h-1 flex-1 rounded-full"
                              style={{ backgroundColor: c.color, opacity: 0.5 + (c.score / 333) }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </HairlineCard>
          </motion.div>
        )}

      </motion.div>
    </PageShell>
  );
};

export default WeeklyChallenge;
