import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip,
} from "recharts";
import {
  Sparkles, Loader2, X, Plus, RefreshCw, ChevronDown, ChevronUp,
  CheckCircle, AlertCircle, Trophy, GraduationCap, TrendingUp, History, Zap,
  Search, ChevronsUpDown, Check, Pencil, FileText,
} from "lucide-react";
import { backgroundStep } from "@/data/steps/background";
import { useStudentPersonalArea } from "@/hooks/useStudentPersonalArea";
import { useApplications } from "@/hooks/useApplications";
import {
  useEvaluationEngine,
  useEvaluationHistory,
  useUpdateEvaluationTitle,
  type EvaluationResult,
  type EvaluationHistoryItem,
  type StoryScore,
} from "@/hooks/useEvaluationEngine";

// ── Helpers ───────────────────────────────────────────────────

const scoreLabel = (n: number) => {
  if (n >= 80) return 'Strong';
  if (n >= 60) return 'Solid';
  if (n >= 40) return 'Developing';
  return 'Needs Work';
};

const scoreLabelColor = (n: number) => {
  if (n >= 80) return 'text-green-600';
  if (n >= 60) return 'text-blue-600';
  if (n >= 40) return 'text-amber-600';
  return 'text-red-500';
};

const fitBadgeStyle = (n: number) => {
  if (n >= 70) return 'text-green-700 bg-green-50 border-green-200';
  if (n >= 50) return 'text-amber-700 bg-amber-50 border-amber-200';
  return 'text-red-700 bg-red-50 border-red-200';
};

const fitProgressColor = (n: number) => {
  if (n >= 70) return '[&>div]:bg-green-500';
  if (n >= 50) return '[&>div]:bg-amber-500';
  return '[&>div]:bg-red-400';
};

const wordCountStyle = (count: number) => {
  if (count < 250) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
  if (count <= 700) return 'bg-green-100 text-green-700 border-green-200';
  return 'bg-red-100 text-red-700 border-red-200';
};

const PRIORITY_META = {
  critical:    { label: 'Must Fix',       bg: 'bg-red-50 border-red-200',     badge: 'bg-red-100 text-red-700 border-red-200' },
  recommended: { label: 'Should Address', bg: 'bg-amber-50 border-amber-200', badge: 'bg-amber-100 text-amber-700 border-amber-200' },
  polish:      { label: 'Nice to Have',   bg: 'bg-blue-50 border-blue-200',   badge: 'bg-blue-100 text-blue-700 border-blue-200' },
} as const;

const LOADING_STEPS = [
  "Scoring your story dimensions...",
  "Evaluating university fit...",
  "Building your improvement roadmap...",
];

const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 2) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

// ── Story Score Section ───────────────────────────────────────

const StoryScoreSection = ({ storyScore }: { storyScore: StoryScore }) => {
  const radarData = [
    { dimension: 'Authenticity', score: storyScore.authenticity },
    { dimension: 'Clarity',      score: storyScore.clarity      },
    { dimension: 'Depth',        score: storyScore.depth        },
    { dimension: 'Uniqueness',   score: storyScore.uniqueness   },
  ];

  const dimensions = [
    { key: 'authenticity' as const, label: 'Authenticity', desc: 'How genuine and personal the voice feels' },
    { key: 'clarity'      as const, label: 'Clarity',      desc: 'How focused and coherent the narrative is' },
    { key: 'depth'        as const, label: 'Depth',        desc: 'Quality of reflection and self-insight' },
    { key: 'uniqueness'   as const, label: 'Uniqueness',   desc: 'How memorable and distinctive the angle is' },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Trophy className="h-5 w-5 text-amber-500" />
          Story Score
        </CardTitle>
        <CardDescription>How strong your narrative is across four key dimensions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Radar chart */}
          <div className="flex flex-col items-center">
            <div className="w-full h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.25}
                    strokeWidth={2}
                  />
                  <Tooltip formatter={(v: number) => [`${v}/100`, 'Score']} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Dimension bars */}
          <div className="space-y-4 justify-center flex flex-col">
            {dimensions.map(({ key, label, desc }) => {
              const score = storyScore[key];
              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <span className="text-sm font-semibold text-foreground">{label}</span>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <span className="text-sm font-bold text-foreground">{score}</span>
                      <span className={`text-xs ml-1 font-medium ${scoreLabelColor(score)}`}>{scoreLabel(score)}</span>
                    </div>
                  </div>
                  <Progress value={score} className="h-2" />
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ── University Fit Section ────────────────────────────────────

const UniversityFitSection = ({ universityFit }: { universityFit: EvaluationResult['universityFit'] }) => (
  <Card>
    <CardHeader className="pb-3">
      <CardTitle className="flex items-center gap-2 text-base">
        <GraduationCap className="h-5 w-5 text-blue-500" />
        University Fit
      </CardTitle>
      <CardDescription>How well your story aligns with each school's values</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      {universityFit.map(uni => (
        <div key={uni.name} className="border rounded-xl p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground">{uni.name}</h3>
              <p className="text-sm text-muted-foreground italic mt-0.5">"{uni.verdict}"</p>
            </div>
            <div className={`shrink-0 px-3 py-1.5 rounded-lg border text-center ${fitBadgeStyle(uni.fitScore)}`}>
              <p className="text-2xl font-black leading-none">{uni.fitScore}</p>
              <p className="text-[10px] mt-0.5">fit score</p>
            </div>
          </div>

          <Progress value={uni.fitScore} className={`h-1.5 ${fitProgressColor(uni.fitScore)}`} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-3">
              <h4 className="text-xs font-semibold text-green-700 dark:text-green-400 flex items-center gap-1.5 mb-2">
                <CheckCircle className="h-3.5 w-3.5" />
                Strengths
              </h4>
              <ul className="space-y-1.5">
                {uni.strengths.map((s, i) => (
                  <li key={i} className="text-xs text-green-800 dark:text-green-300 flex gap-2 leading-snug">
                    <span className="text-green-500 shrink-0 mt-0.5">•</span>{s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-orange-50 dark:bg-orange-950/20 rounded-lg p-3">
              <h4 className="text-xs font-semibold text-orange-700 dark:text-orange-400 flex items-center gap-1.5 mb-2">
                <AlertCircle className="h-3.5 w-3.5" />
                Gaps to Address
              </h4>
              <ul className="space-y-1.5">
                {uni.gaps.map((g, i) => (
                  <li key={i} className="text-xs text-orange-800 dark:text-orange-300 flex gap-2 leading-snug">
                    <span className="text-orange-500 shrink-0 mt-0.5">•</span>{g}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}
    </CardContent>
  </Card>
);

// ── Improvement Roadmap Section ───────────────────────────────

const RoadmapSection = ({ roadmap }: { roadmap: EvaluationResult['roadmap'] }) => (
  <Card>
    <CardHeader className="pb-3">
      <CardTitle className="flex items-center gap-2 text-base">
        <TrendingUp className="h-5 w-5 text-purple-500" />
        Improvement Roadmap
      </CardTitle>
      <CardDescription>Address critical issues first, then work your way down</CardDescription>
    </CardHeader>
    <CardContent className="space-y-5">
      {(['critical', 'recommended', 'polish'] as const).map(priority => {
        const items = roadmap.filter(r => r.priority === priority);
        if (!items.length) return null;
        const meta = PRIORITY_META[priority];
        return (
          <div key={priority}>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className={`text-xs font-semibold ${meta.badge}`}>
                {meta.label}
              </Badge>
            </div>
            <div className="space-y-2">
              {items.map((item, i) => (
                <div key={i} className={`p-3.5 rounded-xl border ${meta.bg}`}>
                  <p className="font-semibold text-sm text-foreground">{item.title}</p>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </CardContent>
  </Card>
);

// ── History Item ──────────────────────────────────────────────

const HistoryRow = ({ item }: { item: EvaluationHistoryItem }) => {
  const [expanded, setExpanded] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');
  const [essayExpanded, setEssayExpanded] = useState(false);
  const { mutate: updateTitle } = useUpdateEvaluationTitle();

  const defaultTitle = item.universities.slice(0, 3).join(', ') + (item.universities.length > 3 ? ` +${item.universities.length - 3}` : '');
  const displayTitle = item.title || defaultTitle;

  const startEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTitleDraft(item.title || '');
    setEditingTitle(true);
  };

  const commitTitle = () => {
    const trimmed = titleDraft.trim();
    updateTitle({ id: item.id, title: trimmed || defaultTitle });
    setEditingTitle(false);
  };

  return (
    <div className="border rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/40 transition-colors text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex flex-col items-center justify-center">
            <span className="text-lg font-black text-primary leading-none">{item.story_score.overall}</span>
            <span className="text-[10px] text-primary/70">score</span>
          </div>
          <div className="min-w-0 flex-1">
            {editingTitle ? (
              <input
                autoFocus
                className="text-sm font-medium text-foreground bg-background border border-primary rounded px-2 py-0.5 w-full outline-none"
                value={titleDraft}
                onChange={e => setTitleDraft(e.target.value)}
                onBlur={commitTitle}
                onKeyDown={e => {
                  if (e.key === 'Enter') { e.preventDefault(); commitTitle(); }
                  if (e.key === 'Escape') setEditingTitle(false);
                }}
                onClick={e => e.stopPropagation()}
              />
            ) : (
              <div className="flex items-center gap-1.5 group">
                <p className="text-sm font-medium text-foreground truncate">{displayTitle}</p>
                <button
                  onClick={startEditing}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-muted"
                >
                  <Pencil className="h-3 w-3 text-muted-foreground" />
                </button>
              </div>
            )}
            <p className="text-xs text-muted-foreground">{timeAgo(item.created_at)}</p>
          </div>
        </div>
        {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-border">
          <div className="pt-4">
            <StoryScoreSection storyScore={item.story_score} />
          </div>
          <UniversityFitSection universityFit={item.university_fit} />
          <RoadmapSection roadmap={item.roadmap} />

          {/* Essay snapshot */}
          {item.essay_snapshot && (
            <div className="border rounded-xl overflow-hidden">
              <button
                onClick={() => setEssayExpanded(v => !v)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/40 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Essay at time of evaluation</span>
                </div>
                {essayExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </button>
              {essayExpanded && (
                <div className="px-4 pb-4 border-t border-border">
                  <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed pt-4">{item.essay_snapshot}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────

const allUniversityOptions: string[] = ((backgroundStep.questions[0] as any).subQuestions as any[])
  .find((sq: any) => sq.id === 'university')?.options ?? [];

const EvaluationEngine = () => {
  const [essayText, setEssayText] = useState('');
  const [selectedUnis, setSelectedUnis] = useState<string[]>([]);
  const [uniPopoverOpen, setUniPopoverOpen] = useState(false);
  const [uniSearch, setUniSearch] = useState('');
  const [otherInput, setOtherInput] = useState('');
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const { essays, isLoadingEssays } = useStudentPersonalArea();
  const { applications } = useApplications();
  const { state, evaluate, reset } = useEvaluationEngine();
  const { data: history = [] } = useEvaluationHistory();

  const wordCount = useMemo(
    () => essayText.trim() ? essayText.trim().split(/\s+/).filter(Boolean).length : 0,
    [essayText]
  );

  const appUniNames = useMemo(
    () => [...new Set(applications.map(a => a.school_name).filter(Boolean) as string[])],
    [applications]
  );

  useEffect(() => {
    return () => { timersRef.current.forEach(clearTimeout); };
  }, []);

  const toggleUni = (name: string) =>
    setSelectedUnis(prev => prev.includes(name) ? prev.filter(u => u !== name) : [...prev, name]);

  const addOtherUni = () => {
    const trimmed = otherInput.trim();
    if (trimmed && !selectedUnis.includes(trimmed)) {
      setSelectedUnis(prev => [...prev, trimmed]);
    }
    setOtherInput('');
    setShowOtherInput(false);
  };

  const handleEvaluate = async () => {
    if (!essayText.trim() || selectedUnis.length === 0) return;

    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setLoadingStep(0);
    timersRef.current.push(setTimeout(() => setLoadingStep(1), 4000));
    timersRef.current.push(setTimeout(() => setLoadingStep(2), 9000));

    await evaluate(essayText, selectedUnis);
    timersRef.current.forEach(clearTimeout);
  };

  const handleReset = () => {
    reset();
    setLoadingStep(0);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start gap-3">
        <div className="p-2 bg-primary/10 rounded-xl shrink-0">
          <Zap className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Evaluation Engine</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">
            Get honest feedback on your story and see how well you fit your target schools.
          </p>
        </div>
      </div>

      {/* ── Loading Phase ── */}
      {state.status === 'loading' && (
        <Card className="border-dashed">
          <CardContent className="py-14 flex flex-col items-center gap-6 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
            <div>
              <p className="font-semibold text-lg text-foreground">Evaluating your essay...</p>
              <p className="text-sm text-muted-foreground mt-1">This usually takes 15–25 seconds.</p>
            </div>
            <div className="space-y-2.5 text-left w-full max-w-xs">
              {LOADING_STEPS.map((step, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2.5 transition-all duration-500 ${loadingStep >= i ? 'opacity-100' : 'opacity-20'}`}
                >
                  {i < loadingStep
                    ? <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                    : <Loader2 className={`h-4 w-4 shrink-0 ${i === loadingStep ? 'animate-spin text-primary' : 'text-muted-foreground'}`} />
                  }
                  <span className={`text-sm ${i < loadingStep ? 'text-muted-foreground line-through' : i === loadingStep ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Results Phase ── */}
      {state.status === 'success' && (
        <div className="space-y-6">
          {/* Results header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground">Your Results</h2>
              <p className="text-sm text-muted-foreground">Edit your essay and re-evaluate to track improvement.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-5xl font-black text-primary leading-none">{state.result.storyScore.overall}</p>
                <p className="text-xs text-muted-foreground mt-1">Overall Score</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleReset} className="gap-1.5">
                <RefreshCw className="h-4 w-4" />
                Re-evaluate
              </Button>
            </div>
          </div>

          <StoryScoreSection storyScore={state.result.storyScore} />
          <UniversityFitSection universityFit={state.result.universityFit} />
          <RoadmapSection roadmap={state.result.roadmap} />

          {/* Re-evaluate CTA */}
          <div className="rounded-xl border border-border bg-muted/30 p-5 text-center">
            <p className="text-sm text-muted-foreground mb-3">
              Made changes to your essay? Start a new evaluation to see your score improve.
            </p>
            <Button variant="outline" onClick={handleReset} className="gap-1.5">
              <RefreshCw className="h-4 w-4" />
              Start New Evaluation
            </Button>
          </div>
        </div>
      )}

      {/* ── Input Phase ── */}
      {(state.status === 'idle' || state.status === 'error') && (
        <div className="space-y-5">

          {/* Essay input */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Your Essay</CardTitle>
              <CardDescription>Paste your essay below or load one from My Work.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoadingEssays ? (
                <Skeleton className="h-9 w-full" />
              ) : essays.length > 0 ? (
                <Select
                  onValueChange={(value) => {
                    const found = essays.find(e => e.id === value);
                    if (found) setEssayText(found.essay_content);
                  }}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Load from My Work (optional)..." />
                  </SelectTrigger>
                  <SelectContent>
                    {essays.map(e => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.essay_title || 'Untitled Essay'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : null}

              <Textarea
                placeholder="Paste your essay here..."
                value={essayText}
                onChange={e => setEssayText(e.target.value)}
                className="min-h-[280px] resize-y text-sm"
              />

              <div className="flex items-center justify-between">
                {essayText.trim() ? (
                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${wordCountStyle(wordCount)}`}>
                    {wordCount} words
                    {wordCount < 250 && ' — add more detail'}
                    {wordCount > 700 && ' — consider tightening'}
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">Aim for 250–650 words</span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* University selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Target Universities</CardTitle>
              <CardDescription>Select from your applications, or add schools you're considering.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* App chips */}
              {appUniNames.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">From your applications</p>
                  <div className="flex flex-wrap gap-2">
                    {appUniNames.map(name => {
                      const active = selectedUnis.includes(name);
                      return (
                        <button
                          key={name}
                          onClick={() => toggleUni(name)}
                          className={`px-3 py-1.5 rounded-full text-sm border transition-all font-medium ${
                            active
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-background text-foreground border-border hover:border-primary/50 hover:bg-primary/5'
                          }`}
                        >
                          {name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* University combobox */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Add another university</p>
                <Popover open={uniPopoverOpen} onOpenChange={setUniPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      role="combobox"
                      className="w-full h-9 justify-between font-normal text-sm"
                    >
                      <span className="text-muted-foreground">Select a university...</span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <div className="flex items-center border-b px-3">
                      <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                      <input
                        className="flex h-11 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
                        placeholder="Search universities..."
                        value={uniSearch}
                        onChange={e => setUniSearch(e.target.value)}
                      />
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {(() => {
                        const filtered = allUniversityOptions.filter(
                          u => !selectedUnis.includes(u) &&
                            (!uniSearch.trim() || u.toLowerCase().includes(uniSearch.toLowerCase()))
                        );
                        if (filtered.length === 0) return (
                          <p className="py-6 text-center text-sm text-muted-foreground">No university found.</p>
                        );
                        return filtered.map(u => (
                          <button
                            key={u}
                            type="button"
                            onClick={() => {
                              if (u === 'Other') {
                                setShowOtherInput(true);
                              } else {
                                setSelectedUnis(prev => [...prev, u]);
                              }
                              setUniPopoverOpen(false);
                              setUniSearch('');
                            }}
                            className="relative flex w-full cursor-pointer select-none items-center px-4 py-2.5 text-sm hover:bg-accent hover:text-accent-foreground text-left"
                          >
                            <Check className={cn("mr-2 h-4 w-4 shrink-0", selectedUnis.includes(u) ? "opacity-100" : "opacity-0")} />
                            {u}
                          </button>
                        ));
                      })()}
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Other / custom input */}
                {showOtherInput && (
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="Enter university name..."
                      value={otherInput}
                      onChange={e => setOtherInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addOtherUni(); } }}
                      className="h-9 text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addOtherUni}
                      disabled={!otherInput.trim()}
                      className="shrink-0 gap-1"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add
                    </Button>
                  </div>
                )}
              </div>

              {/* Selected list */}
              {selectedUnis.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground">Evaluating for</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedUnis.map(name => (
                      <Badge
                        key={name}
                        variant="secondary"
                        className="gap-1.5 pr-1.5 pl-2.5 py-1 text-sm"
                      >
                        {name}
                        <button
                          onClick={() => setSelectedUnis(prev => prev.filter(u => u !== name))}
                          className="rounded-full hover:bg-muted-foreground/20 p-0.5 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Error */}
          {state.status === 'error' && (
            <Alert variant="destructive">
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}

          {/* Evaluate button */}
          <div className="flex justify-end">
            <Button
              onClick={handleEvaluate}
              disabled={!essayText.trim() || selectedUnis.length === 0}
              size="lg"
              className="gap-2 px-8"
            >
              <Sparkles className="h-5 w-5" />
              Evaluate Me
            </Button>
          </div>
        </div>
      )}

      {/* ── Past Evaluations ── */}
      {history.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Past Evaluations</h2>
            <span className="text-xs text-muted-foreground">({history.length})</span>
          </div>
          <div className="space-y-2">
            {history.map(item => (
              <HistoryRow key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EvaluationEngine;
