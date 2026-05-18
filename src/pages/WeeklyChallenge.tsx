import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Trophy,
  Clock,
  Flame,
  Crown,
  Medal,
  Loader2,
  Target,
  Lightbulb,
  CheckCircle2,
  ArrowRight,
  Users,
  Lock,
  ChevronUp,
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

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function rankLabel(rank: number) {
  if (rank === 1) return { cls: "bg-yellow-500/20 text-yellow-700 border-yellow-300", icon: <Crown className="h-3.5 w-3.5" />, label: "#1" };
  if (rank === 2) return { cls: "bg-slate-400/20 text-slate-600 border-slate-300", icon: <Medal className="h-3.5 w-3.5" />, label: "#2" };
  if (rank === 3) return { cls: "bg-orange-400/20 text-orange-700 border-orange-300", icon: <Medal className="h-3.5 w-3.5" />, label: "#3" };
  return { cls: "bg-muted text-muted-foreground border-border", icon: null, label: `#${rank}` };
}

const WeeklyChallenge = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [mySubmission, setMySubmission] = useState<any | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [schoolCount, setSchoolCount] = useState(0);
  const [hookText, setHookText] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [mySchoolId, setMySchoolId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState("");
  const [isClosed, setIsClosed] = useState(false);

  // Fetch school-filtered leaderboard (only called when challenge is closed)
  const loadLeaderboard = useCallback(async (challengeId: string, schoolId: string, userId: string | null) => {
    const { data: subs } = await supabase
      .from("challenge_submissions")
      .select("id, hook_text, ai_scores, submitted_at, student_id")
      .eq("challenge_id", challengeId)
      .not("ai_scores", "is", null);

    if (!subs?.length) { setLeaderboard([]); setSchoolCount(0); return; }

    // Fetch profiles for all submitters to filter by school
    const ids = [...new Set(subs.map(s => s.student_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, full_name, school_id")
      .in("user_id", ids);

    const profileMap: Record<string, { name: string; school_id: string }> = {};
    (profiles ?? []).forEach(p => {
      profileMap[p.user_id] = { name: p.full_name ?? "Student", school_id: p.school_id };
    });

    // Filter to same school only
    const schoolSubs = subs.filter(s => profileMap[s.student_id]?.school_id === schoolId);
    setSchoolCount(schoolSubs.length);

    const ranked: LeaderboardEntry[] = schoolSubs
      .filter(s => s.ai_scores?.overallScore != null)
      .sort((a, b) => b.ai_scores.overallScore - a.ai_scores.overallScore)
      .map(s => {
        const fullName = profileMap[s.student_id]?.name ?? "Student";
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

  // Fetch just the count of school submissions during open challenge
  const loadSchoolCount = useCallback(async (challengeId: string, schoolId: string) => {
    const { data: subs } = await supabase
      .from("challenge_submissions")
      .select("student_id")
      .eq("challenge_id", challengeId);

    if (!subs?.length) { setSchoolCount(0); return; }

    const ids = [...new Set(subs.map(s => s.student_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, school_id")
      .in("user_id", ids)
      .eq("school_id", schoolId);

    setSchoolCount(profiles?.length ?? 0);
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const uid = user?.id ?? null;
        setCurrentUserId(uid);

        // Fetch current user's school
        let schoolId: string | null = null;
        if (uid) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("school_id")
            .eq("user_id", uid)
            .maybeSingle();
          schoolId = profile?.school_id ?? null;
          setMySchoolId(schoolId);
        }

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

        if (schoolId) {
          if (closed) {
            await loadLeaderboard(active.id, schoolId, uid);
          } else {
            await loadSchoolCount(active.id, schoolId);
          }
        }
      } catch (e: any) {
        toast({ title: "Failed to load challenge", description: e.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [loadLeaderboard, loadSchoolCount, toast]);

  // Countdown ticker
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
        body: {
          hookText: hookText.trim(),
          challengeId: challenge.id,
          challengeTheme: challenge.theme,
        },
      });
      if (error) throw error;

      setMySubmission({ hook_text: hookText.trim(), ai_scores: null });
      setJustSubmitted(true);

      // Refresh count
      if (mySchoolId) await loadSchoolCount(challenge.id, mySchoolId);

      toast({ title: "Hook submitted!", description: "Results will be revealed when the challenge closes." });
    } catch (e: any) {
      toast({ title: "Submission failed", description: e.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditHook = () => {
    setJustSubmitted(false);
    setMySubmission(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="p-6 max-w-3xl mx-auto text-center space-y-4 pt-20">
        <Trophy className="h-16 w-16 text-muted-foreground mx-auto" />
        <h2 className="text-2xl font-bold">No Active Challenge</h2>
        <p className="text-muted-foreground">Check back soon — a new weekly hook challenge will be posted here every Monday.</p>
        <Button variant="outline" onClick={() => navigate("/student-dashboard")}>Back to Dashboard</Button>
      </div>
    );
  }

  const myRank = isClosed ? leaderboard.findIndex(e => e.student_id === currentUserId) + 1 : null;
  const winner = isClosed ? leaderboard[0] : null;

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">

      {/* Challenge Header */}
      <Card className="bg-gradient-to-br from-violet-50 via-white to-amber-50 border-violet-200/50">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-start gap-4">
            <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-amber-400 flex items-center justify-center">
              <Trophy className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <Badge className="bg-violet-100 text-violet-700 border-violet-200 text-xs">Week {challenge.week_number}</Badge>
                {isClosed
                  ? <Badge variant="destructive" className="text-xs">Closed — Results Out</Badge>
                  : <Badge className="bg-green-100 text-green-700 border-green-200 text-xs flex items-center gap-1"><Flame className="h-3 w-3" />Live</Badge>
                }
              </div>
              <h1 className="text-2xl font-bold text-foreground">{challenge.title}</h1>
              <p className="text-muted-foreground mt-1 leading-relaxed">{challenge.description}</p>
              {challenge.example_prompt && !isClosed && (
                <div className="mt-3 p-3 rounded-lg bg-violet-50 border border-violet-100">
                  <p className="text-xs font-medium text-violet-700 flex items-center gap-1 mb-1">
                    <Lightbulb className="h-3 w-3" /> Prompt tip
                  </p>
                  <p className="text-sm text-violet-600">{challenge.example_prompt}</p>
                </div>
              )}
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="font-medium">{countdown}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{schoolCount} student{schoolCount !== 1 ? "s" : ""} from your school</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Left: Submission area */}
        <div className="lg:col-span-3 space-y-6">

          {/* Winner banner — only when closed */}
          {isClosed && winner && (
            <Card className="border-yellow-300 bg-gradient-to-r from-yellow-50 to-amber-50">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center shrink-0">
                  <Crown className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-yellow-700 uppercase tracking-wide">🏆 Challenge Winner</p>
                  <p className="font-bold text-foreground">{winner.name}</p>
                  <p className="text-sm text-muted-foreground italic mt-0.5">"{winner.hook_text}"</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-yellow-600">{winner.ai_scores?.overallScore}</div>
                  <div className="text-xs text-muted-foreground">/ 100</div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submission form / confirmation / closed state */}
          {!mySubmission && !isClosed && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Target className="h-5 w-5 text-primary" />
                  Submit Your Hook
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Write your hook — 1 to 3 sentences that open your essay on the theme:{" "}
                  <span className="font-medium text-foreground">"{challenge.theme}"</span>
                </p>
                <div className="space-y-1.5">
                  <Textarea
                    placeholder='e.g. "The smell of motor oil never leaves you — not the clothes, not the skin, not the memory of the day my father taught me silence."'
                    value={hookText}
                    onChange={e => setHookText(e.target.value)}
                    rows={5}
                    className="resize-none text-sm"
                    maxLength={MAX_CHARS}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Hooks land hardest in 1–3 sentences.</span>
                    <span className={hookText.length > MAX_CHARS * 0.9 ? "text-destructive" : ""}>
                      {hookText.length}/{MAX_CHARS}
                    </span>
                  </div>
                </div>
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || hookText.trim().length < 10 || hookText.length > MAX_CHARS}
                  className="w-full gap-2"
                >
                  {submitting
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
                    : <><ArrowRight className="h-4 w-4" /> Submit Hook</>
                  }
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Already submitted — scores hidden until close */}
          {mySubmission && !isClosed && (
            <Card className="border-green-200 bg-green-50/40">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-green-800">Your hook is in!</h3>
                    <p className="text-sm text-green-700 mt-0.5">Scores are locked until the challenge closes.</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Lock className="h-3.5 w-3.5" />
                    Results on {formatDate(challenge.ends_at)}
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-green-200 bg-white/60">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Your submitted hook</p>
                  <p className="text-sm italic text-foreground">"{mySubmission.hook_text}"</p>
                </div>

                <div className="flex items-center gap-2 p-3 rounded-lg bg-violet-50 border border-violet-100">
                  <Trophy className="h-4 w-4 text-violet-600 shrink-0" />
                  <p className="text-xs text-violet-700">
                    <span className="font-semibold">{schoolCount} student{schoolCount !== 1 ? "s" : ""}</span> from your school have entered.
                    Rankings will be revealed when the challenge closes — check your dashboard for a notification!
                  </p>
                </div>

                <Button variant="outline" size="sm" className="w-full" onClick={handleEditHook}>
                  Edit my hook
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Closed — no submission */}
          {!mySubmission && isClosed && (
            <Card>
              <CardContent className="p-6 text-center space-y-3 py-10">
                <Lock className="h-10 w-10 text-muted-foreground mx-auto opacity-40" />
                <p className="font-medium text-muted-foreground">This challenge has closed.</p>
                <p className="text-sm text-muted-foreground">You didn't submit a hook for this round. Stay tuned for next week's challenge!</p>
              </CardContent>
            </Card>
          )}

          {/* Closed — your result */}
          {mySubmission && isClosed && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">Your Result</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
                  {mySubmission.ai_scores && (
                    <div className="text-center">
                      <div className="text-4xl font-bold text-primary">{mySubmission.ai_scores.overallScore}</div>
                      <div className="text-xs text-muted-foreground">out of 100</div>
                    </div>
                  )}
                  {myRank && myRank > 0 && (
                    <div className="text-center">
                      <div className="text-4xl font-bold text-foreground">#{myRank}</div>
                      <div className="text-xs text-muted-foreground">of {leaderboard.length}</div>
                    </div>
                  )}
                  {mySubmission.ai_scores?.feedback && (
                    <p className="flex-1 text-sm text-muted-foreground leading-relaxed">{mySubmission.ai_scores.feedback}</p>
                  )}
                </div>

                {mySubmission.ai_scores?.criteria && (
                  <div className="space-y-2.5">
                    {mySubmission.ai_scores.criteria.map((c: CriterionScore) => (
                      <div key={c.id} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium" style={{ color: c.color }}>{c.name}</span>
                          <span className="text-muted-foreground">{c.score}/100</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${c.score}%`, backgroundColor: c.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {mySubmission.ai_scores?.strengths?.length > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Strengths</p>
                      {mySubmission.ai_scores.strengths.map((s: string, i: number) => (
                        <div key={i} className="flex items-start gap-1.5 text-xs"><CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5" />{s}</div>
                      ))}
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide">To improve</p>
                      {mySubmission.ai_scores.improvements?.map((s: string, i: number) => (
                        <div key={i} className="flex items-start gap-1.5 text-xs"><ChevronUp className="h-3.5 w-3.5 text-orange-500 shrink-0 mt-0.5" />{s}</div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-3 rounded-lg border border-border bg-muted/30">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Your hook</p>
                  <p className="text-sm italic">"{mySubmission.hook_text}"</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Leaderboard */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Trophy className="h-5 w-5 text-amber-500" />
                {isClosed ? "Final Rankings" : "Your School"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!isClosed ? (
                // During open challenge: just show count + suspense
                <div className="space-y-4">
                  <div className="text-center py-6 space-y-2">
                    <div className="text-5xl font-bold text-primary">{schoolCount}</div>
                    <p className="text-sm text-muted-foreground font-medium">student{schoolCount !== 1 ? "s" : ""} from your school have entered</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 border border-border text-center">
                    <Lock className="h-4 w-4 text-muted-foreground mx-auto mb-1.5" />
                    <p className="text-xs text-muted-foreground">
                      Rankings and scores are revealed when the challenge closes on{" "}
                      <span className="font-medium text-foreground">{formatDate(challenge.ends_at)}</span>
                    </p>
                  </div>
                  {!mySubmission && (
                    <div className="text-center">
                      <p className="text-xs text-violet-600 font-medium">Will you be #1? Submit your hook →</p>
                    </div>
                  )}
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Trophy className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No scored submissions for your school.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {leaderboard.map((entry, idx) => {
                    const rank = idx + 1;
                    const rl = rankLabel(rank);
                    const isMe = entry.student_id === currentUserId;
                    return (
                      <div
                        key={entry.id}
                        className={`p-3 rounded-xl border transition-colors ${
                          isMe ? "border-primary/30 bg-primary/5"
                            : rank === 1 ? "border-yellow-200 bg-yellow-50/50"
                            : "border-border hover:bg-muted/30"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-bold ${rl.cls}`}>
                            {rl.icon}{rl.label}
                          </span>
                          <Avatar className="h-7 w-7">
                            <AvatarFallback className="text-[10px]">{entry.initials}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{entry.name}</p>
                            <p className="text-xs text-muted-foreground truncate italic">"{entry.hook_text}"</p>
                          </div>
                          <span className="text-sm font-bold text-primary shrink-0">
                            {entry.ai_scores?.overallScore}
                          </span>
                        </div>
                        {entry.ai_scores?.criteria && (
                          <div className="flex gap-1 mt-2 pl-10">
                            {entry.ai_scores.criteria.map((c: CriterionScore) => (
                              <div
                                key={c.id}
                                title={`${c.name}: ${c.score}`}
                                className="h-1.5 flex-1 rounded-full"
                                style={{ backgroundColor: c.color, opacity: c.score / 100 }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WeeklyChallenge;
