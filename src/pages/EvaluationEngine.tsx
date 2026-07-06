import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  PageShell,
  PageHeader,
  HairlineCard,
  BlurOrb,
  SignalRing,
} from "@/components/primrose-night";
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

// ── Semantic helpers (PN tokens) ──────────────────────────────

const scoreLabel = (n: number) => {
  if (n >= 80) return 'Strong';
  if (n >= 60) return 'Solid';
  if (n >= 40) return 'Developing';
  return 'Needs Work';
};

type Tone = "sage" | "gold" | "pink";

const scoreTone = (n: number): Tone => {
  if (n >= 80) return 'sage';
  if (n >= 60) return 'gold';
  return 'pink';
};

const fitTone = (n: number): Tone => {
  if (n >= 70) return 'sage';
  if (n >= 50) return 'gold';
  return 'pink';
};

const toneColorVar = (t: Tone) => `var(--pn-${t})`;

const wordCountTone = (count: number): Tone => {
  if (count < 250) return 'gold';
  if (count <= 700) return 'sage';
  return 'pink';
};

const PRIORITY_META: Record<'critical' | 'recommended' | 'polish', { label: string; tone: Tone }> = {
  critical:    { label: 'Must Fix',       tone: 'pink' },
  recommended: { label: 'Should Address', tone: 'gold' },
  polish:      { label: 'Nice to Have',   tone: 'sage' },
};

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

const sectionVariants = {
  hidden: { opacity: 0, y: 8, filter: "blur(4px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.4, ease: [0.2, 0.6, 0.2, 1] as const } },
};

const tonePill = (t: Tone) =>
  `bg-[color:var(--pn-${t})]/15 text-[color:var(--pn-${t})] hairline`;

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
    <HairlineCard>
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="h-5 w-5 text-[color:var(--pn-gold)]" />
        <div>
          <h2 className="font-serif text-xl text-foreground leading-tight">Story score.</h2>
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-1">Four dimensions of narrative strength</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar chart */}
        <div className="flex flex-col items-center">
          <div className="w-full h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis
                  dataKey="dimension"
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))', fontFamily: 'Inter Variable' }}
                />
                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="var(--pn-sage)"
                  fill="var(--pn-sage)"
                  fillOpacity={0.22}
                  strokeWidth={1.5}
                />
                <Tooltip
                  formatter={(v: number) => [`${v}/100`, 'Score']}
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dimension bars */}
        <div className="space-y-4 justify-center flex flex-col">
          {dimensions.map(({ key, label, desc }) => {
            const score = storyScore[key];
            const tone = scoreTone(score);
            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-1.5">
                  <div>
                    <span className="text-sm text-foreground">{label}</span>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <span className="num-display text-base text-foreground">{score}</span>
                    <span className={`text-[10px] ml-1.5 uppercase tracking-[0.14em]`} style={{ color: toneColorVar(tone) }}>
                      {scoreLabel(score)}
                    </span>
                  </div>
                </div>
                <div className="h-1 rounded-full bg-white/[0.05] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: toneColorVar(tone) }}
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 0.9, ease: [0.2, 0.6, 0.2, 1] }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </HairlineCard>
  );
};

// ── University Fit Section ────────────────────────────────────

const UniversityFitSection = ({ universityFit }: { universityFit: EvaluationResult['universityFit'] }) => (
  <HairlineCard>
    <div className="flex items-center gap-3 mb-6">
      <GraduationCap className="h-5 w-5 text-[color:var(--pn-sage)]" />
      <div>
        <h2 className="font-serif text-xl text-foreground leading-tight">The fit, by school.</h2>
        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-1">How your story aligns with each one</p>
      </div>
    </div>
    <div className="space-y-4">
      {universityFit.map(uni => {
        const tone = fitTone(uni.fitScore);
        return (
          <div key={uni.name} className="hairline rounded-xl p-4 space-y-3 bg-white/[0.015]">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-serif text-lg text-foreground leading-tight">{uni.name}</h3>
                <p className="text-sm font-serif italic text-muted-foreground mt-1">"{uni.verdict}"</p>
              </div>
              <div className="shrink-0">
                <SignalRing value={uni.fitScore} tone={tone} label="fit" size={72} strokeWidth={3} />
              </div>
            </div>

            <div className="h-1 rounded-full bg-white/[0.05] overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: toneColorVar(tone) }}
                initial={{ width: 0 }}
                animate={{ width: `${uni.fitScore}%` }}
                transition={{ duration: 0.9, ease: [0.2, 0.6, 0.2, 1] }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="hairline rounded-lg p-3 bg-[color:var(--pn-sage)]/6">
                <h4 className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--pn-sage)] flex items-center gap-1.5 mb-2">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Strengths
                </h4>
                <ul className="space-y-1.5">
                  {uni.strengths.map((s, i) => (
                    <li key={i} className="text-xs text-foreground/85 flex gap-2 leading-snug">
                      <span className="text-[color:var(--pn-sage)] shrink-0 mt-0.5">•</span>{s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="hairline rounded-lg p-3 bg-[color:var(--pn-gold)]/6">
                <h4 className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--pn-gold)] flex items-center gap-1.5 mb-2">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Gaps to Address
                </h4>
                <ul className="space-y-1.5">
                  {uni.gaps.map((g, i) => (
                    <li key={i} className="text-xs text-foreground/85 flex gap-2 leading-snug">
                      <span className="text-[color:var(--pn-gold)] shrink-0 mt-0.5">•</span>{g}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </HairlineCard>
);

// ── Improvement Roadmap Section ───────────────────────────────

const RoadmapSection = ({ roadmap }: { roadmap: EvaluationResult['roadmap'] }) => (
  <HairlineCard>
    <div className="flex items-center gap-3 mb-6">
      <TrendingUp className="h-5 w-5 text-[color:var(--pn-pink)]" />
      <div>
        <h2 className="font-serif text-xl text-foreground leading-tight">Where to go next.</h2>
        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-1">Fix the critical first, then work your way down</p>
      </div>
    </div>
    <div className="space-y-5">
      {(['critical', 'recommended', 'polish'] as const).map(priority => {
        const items = roadmap.filter(r => r.priority === priority);
        if (!items.length) return null;
        const meta = PRIORITY_META[priority];
        return (
          <div key={priority}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${tonePill(meta.tone)}`}>
                {meta.label}
              </span>
            </div>
            <div className="space-y-2">
              {items.map((item, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl hairline"
                  style={{ background: `color-mix(in oklch, ${toneColorVar(meta.tone)} 6%, transparent)` }}
                >
                  <p className="text-sm text-foreground">{item.title}</p>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  </HairlineCard>
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
  const tone = scoreTone(item.story_score.overall);

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
    <div className="hairline rounded-xl overflow-hidden bg-white/[0.015]">
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="shrink-0 w-12 h-12 rounded-lg hairline flex flex-col items-center justify-center"
            style={{ background: `color-mix(in oklch, ${toneColorVar(tone)} 12%, transparent)` }}
          >
            <span className="num-display text-lg leading-none" style={{ color: toneColorVar(tone) }}>{item.story_score.overall}</span>
            <span className="text-[10px] uppercase tracking-[0.14em] mt-0.5" style={{ color: toneColorVar(tone), opacity: 0.7 }}>score</span>
          </div>
          <div className="min-w-0 flex-1">
            {editingTitle ? (
              <input
                autoFocus
                className="text-sm text-foreground bg-white/[0.02] hairline rounded px-2 py-0.5 w-full outline-none"
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
                <p className="text-sm text-foreground truncate">{displayTitle}</p>
                <button
                  type="button"
                  onClick={startEditing}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-white/[0.05]"
                >
                  <Pencil className="h-3 w-3 text-muted-foreground" />
                </button>
              </div>
            )}
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-0.5">{timeAgo(item.created_at)}</p>
          </div>
        </div>
        {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 hairline-t">
          <div className="pt-4">
            <StoryScoreSection storyScore={item.story_score} />
          </div>
          <UniversityFitSection universityFit={item.university_fit} />
          <RoadmapSection roadmap={item.roadmap} />

          {/* Essay snapshot */}
          {item.essay_snapshot && (
            <div className="hairline rounded-xl overflow-hidden bg-white/[0.015]">
              <button
                type="button"
                onClick={() => setEssayExpanded(v => !v)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">Essay at time of evaluation</span>
                </div>
                {essayExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </button>
              {essayExpanded && (
                <div className="px-4 pb-4 hairline-t">
                  <p className="text-sm font-serif text-foreground whitespace-pre-wrap leading-relaxed pt-4">{item.essay_snapshot}</p>
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
    <PageShell>
      <BlurOrb tone="gold" className="top-[-100px] right-[-100px] w-[500px] h-[500px]" />

      <PageHeader
        eyebrow="Evaluation"
        title={<>Where you stand.</>}
        subtitle={<>Honest signal on your story, mapped to your target schools.</>}
        actions={
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full hairline bg-white/[0.03]">
            <Zap className="h-3.5 w-3.5 text-[color:var(--pn-gold)]" />
            <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Engine</span>
          </div>
        }
      />

      {/* ── Loading Phase ── */}
      {state.status === 'loading' && (
        <HairlineCard>
          <div className="py-14 flex flex-col items-center gap-6 text-center">
            <div className="w-16 h-16 rounded-full hairline bg-[color:var(--pn-gold)]/12 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-[color:var(--pn-gold)] animate-spin" />
            </div>
            <div>
              <p className="font-serif text-2xl text-foreground leading-tight">Reading it now.</p>
              <p className="text-sm font-serif italic text-muted-foreground mt-1">Usually 15–25 seconds.</p>
            </div>
            <div className="space-y-2.5 text-left w-full max-w-xs">
              {LOADING_STEPS.map((step, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2.5 transition-all duration-500 ${loadingStep >= i ? 'opacity-100' : 'opacity-30'}`}
                >
                  {i < loadingStep
                    ? <CheckCircle className="h-4 w-4 text-[color:var(--pn-sage)] shrink-0" />
                    : <Loader2 className={`h-4 w-4 shrink-0 ${i === loadingStep ? 'animate-spin text-[color:var(--pn-gold)]' : 'text-muted-foreground'}`} />
                  }
                  <span className={`text-sm ${i < loadingStep ? 'text-muted-foreground line-through' : i === loadingStep ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </HairlineCard>
      )}

      {/* ── Results Phase ── */}
      {state.status === 'success' && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          className="space-y-6"
        >
          {/* Results header */}
          <motion.div variants={sectionVariants}>
            <HairlineCard variant="hero">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Your results</p>
                  <h2 className="font-serif text-3xl text-foreground leading-tight mt-2">Signal, received.</h2>
                  <p className="font-serif italic text-muted-foreground mt-2">Edit your essay and re-evaluate to track improvement.</p>
                </div>
                <div className="flex items-center gap-6">
                  <SignalRing
                    value={state.result.storyScore.overall}
                    tone={scoreTone(state.result.storyScore.overall)}
                    label="overall"
                    size={112}
                    strokeWidth={5}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    className="gap-1.5 hairline hover:bg-white/[0.04] text-foreground"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Re-evaluate
                  </Button>
                </div>
              </div>
            </HairlineCard>
          </motion.div>

          <motion.div variants={sectionVariants}>
            <StoryScoreSection storyScore={state.result.storyScore} />
          </motion.div>
          <motion.div variants={sectionVariants}>
            <UniversityFitSection universityFit={state.result.universityFit} />
          </motion.div>
          <motion.div variants={sectionVariants}>
            <RoadmapSection roadmap={state.result.roadmap} />
          </motion.div>

          {/* Re-evaluate CTA */}
          <motion.div variants={sectionVariants}>
            <HairlineCard className="text-center">
              <p className="text-sm font-serif italic text-muted-foreground mb-3">
                Made changes to your essay? Start a new evaluation to see your score move.
              </p>
              <Button
                variant="ghost"
                onClick={handleReset}
                className="gap-1.5 hairline hover:bg-white/[0.04] text-foreground"
              >
                <RefreshCw className="h-4 w-4" />
                Start New Evaluation
              </Button>
            </HairlineCard>
          </motion.div>
        </motion.div>
      )}

      {/* ── Input Phase ── */}
      {(state.status === 'idle' || state.status === 'error') && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
          className="space-y-6"
        >

          {/* Essay input */}
          <motion.div variants={sectionVariants}>
            <HairlineCard>
              <div className="flex items-center gap-3 mb-6">
                <FileText className="h-5 w-5 text-foreground/60" />
                <div>
                  <h2 className="font-serif text-xl text-foreground leading-tight">The essay.</h2>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-1">Paste it, or load one from My Work</p>
                </div>
              </div>
              <div className="space-y-3">
                {isLoadingEssays ? (
                  <Skeleton className="h-9 w-full" />
                ) : essays.length > 0 ? (
                  <Select
                    onValueChange={(value) => {
                      const found = essays.find(e => e.id === value);
                      if (found) setEssayText(found.essay_content);
                    }}
                  >
                    <SelectTrigger className="h-9 text-sm bg-white/[0.02] hairline">
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
                  className="min-h-[280px] resize-y font-serif text-base leading-relaxed bg-white/[0.02] hairline"
                />

                <div className="flex items-center justify-between">
                  {essayText.trim() ? (
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${tonePill(wordCountTone(wordCount))}`}>
                      <span className="num-display">{wordCount}</span> words
                      {wordCount < 250 && ' — add more detail'}
                      {wordCount > 700 && ' — consider tightening'}
                    </span>
                  ) : (
                    <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Aim for 250–650 words</span>
                  )}
                </div>
              </div>
            </HairlineCard>
          </motion.div>

          {/* University selection */}
          <motion.div variants={sectionVariants}>
            <HairlineCard>
              <div className="flex items-center gap-3 mb-6">
                <GraduationCap className="h-5 w-5 text-foreground/60" />
                <div>
                  <h2 className="font-serif text-xl text-foreground leading-tight">The schools.</h2>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-1">Pick from your list or add more</p>
                </div>
              </div>
              <div className="space-y-4">
                {/* App chips */}
                {appUniNames.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">From your applications</p>
                    <div className="flex flex-wrap gap-2">
                      {appUniNames.map(name => {
                        const active = selectedUnis.includes(name);
                        return (
                          <button
                            key={name}
                            type="button"
                            onClick={() => toggleUni(name)}
                            className={`px-3 py-1.5 rounded-full text-sm transition-all hairline ${
                              active
                                ? "bg-white/[0.08] text-foreground"
                                : "bg-white/[0.02] text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
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
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Add another university</p>
                  <Popover open={uniPopoverOpen} onOpenChange={setUniPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        role="combobox"
                        className="w-full h-9 justify-between font-normal text-sm hairline bg-white/[0.02] hover:bg-white/[0.04] text-foreground"
                      >
                        <span className="text-muted-foreground">Select a university...</span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-pn-card" align="start">
                      <div className="flex items-center hairline-b px-3">
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
                            <p className="py-6 text-center text-sm font-serif italic text-muted-foreground">No university found.</p>
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
                              className="relative flex w-full cursor-pointer select-none items-center px-4 py-2.5 text-sm hover:bg-white/[0.04] text-foreground text-left"
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
                        className="h-9 text-sm bg-white/[0.02] hairline"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={addOtherUni}
                        disabled={!otherInput.trim()}
                        className="shrink-0 gap-1 hairline hover:bg-white/[0.04] text-foreground"
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
                    <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Evaluating for</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedUnis.map(name => (
                        <span
                          key={name}
                          className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full text-sm hairline bg-white/[0.05] text-foreground"
                        >
                          {name}
                          <button
                            type="button"
                            onClick={() => setSelectedUnis(prev => prev.filter(u => u !== name))}
                            className="rounded-full hover:bg-white/[0.08] p-0.5 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </HairlineCard>
          </motion.div>

          {/* Error */}
          {state.status === 'error' && (
            <motion.div variants={sectionVariants}>
              <Alert className="hairline bg-[color:var(--pn-pink)]/10 text-[color:var(--pn-pink)] border-transparent">
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* Evaluate button */}
          <motion.div variants={sectionVariants} className="flex justify-end">
            <Button
              onClick={handleEvaluate}
              disabled={!essayText.trim() || selectedUnis.length === 0}
              size="lg"
              className="gap-2 px-8 bg-[color:var(--pn-gold)]/15 hairline text-[color:var(--pn-gold)] hover:bg-[color:var(--pn-gold)]/25 shadow-none disabled:opacity-50"
            >
              <Sparkles className="h-5 w-5" />
              Evaluate Me
            </Button>
          </motion.div>
        </motion.div>
      )}

      {/* ── Past Evaluations ── */}
      {history.length > 0 && (
        <div className="space-y-3 mt-10">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-serif text-lg text-foreground leading-tight">Everything you've measured.</h2>
            <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              (<span className="num-display">{history.length}</span>)
            </span>
          </div>
          <div className="space-y-2">
            {history.map(item => (
              <HistoryRow key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}
    </PageShell>
  );
};

export default EvaluationEngine;
