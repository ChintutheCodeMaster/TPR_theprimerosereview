import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  PageShell,
  PageHeader,
  HairlineCard,
  BlurOrb,
} from "@/components/primrose-night";
import {
  FlaskConical, Sparkles, Loader2, RefreshCw, Save,
  AlertCircle, ArrowLeftRight, BookOpen, Fingerprint,
  Target, Mic, TrendingUp, Star, Compass,
} from "lucide-react";
import { usePrimroseLab, type LabFeedback, type LabVersion, type Direction, type ExploreState } from "@/hooks/usePrimroseLab";
import { useStudentPersonalArea } from "@/hooks/useStudentPersonalArea";

// ── Config ────────────────────────────────────────────────────

type DimKey = 'authenticity' | 'specificity' | 'voice' | 'narrativeStrength' | 'memorability';
type Tone = "sage" | "gold" | "pink";

const DIM_CONFIG: Record<DimKey, { label: string; Icon: React.ElementType }> = {
  authenticity:      { label: "Authenticity",       Icon: Fingerprint },
  specificity:       { label: "Specificity",        Icon: Target      },
  voice:             { label: "Voice",              Icon: Mic         },
  narrativeStrength: { label: "Narrative Strength", Icon: TrendingUp  },
  memorability:      { label: "Memorability",       Icon: Star        },
};

const scoreTone = (n: number): Tone => {
  if (n >= 80) return 'sage';
  if (n >= 60) return 'gold';
  return 'pink';
};

const toneVar = (t: Tone) => `var(--pn-${t})`;

const LABEL_CONFIG: Record<string, { tone: Tone; tagline: string }> = {
  "Strong Hook": { tone: 'sage', tagline: "This hook lands." },
  "Promising":   { tone: 'gold', tagline: "Getting there." },
  "Needs Work":  { tone: 'pink', tagline: "Room to improve." },
  "Blends In":   { tone: 'pink', tagline: "Too familiar." },
};

const DIMS: DimKey[] = ["authenticity", "specificity", "voice", "narrativeStrength", "memorability"];

const wordCountTone = (n: number): Tone | 'neutral' => {
  if (n === 0) return 'neutral';
  if (n < 5) return 'gold';
  if (n <= 120) return 'sage';
  return 'pink';
};

const wordCountClass = (n: number) => {
  const t = wordCountTone(n);
  if (t === 'neutral') return 'bg-white/[0.03] text-muted-foreground hairline';
  return `bg-[color:var(--pn-${t})]/15 text-[color:var(--pn-${t})] hairline`;
};

const sectionVariants = {
  hidden: { opacity: 0, y: 8, filter: "blur(4px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.4, ease: [0.2, 0.6, 0.2, 1] as const } },
};

// ── Sub-components ────────────────────────────────────────────

const DimensionCard = ({ dimKey, data }: { dimKey: DimKey; data: { score: number; insight: string } }) => {
  const cfg = DIM_CONFIG[dimKey];
  const { Icon } = cfg;
  const tone = scoreTone(data.score);
  return (
    <div className="hairline rounded-2xl bg-white/[0.02] p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-foreground">
          <div className="w-8 h-8 rounded-xl hairline flex items-center justify-center shrink-0" style={{ background: `color-mix(in oklch, ${toneVar(tone)} 15%, transparent)` }}>
            <Icon className="h-4 w-4" style={{ color: toneVar(tone) }} />
          </div>
          <span className="font-serif text-base">{cfg.label}</span>
        </div>
        <span className="num-display text-2xl" style={{ color: toneVar(tone) }}>{data.score}</span>
      </div>
      <div className="relative h-1 rounded-full bg-white/[0.05] overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ background: toneVar(tone) }}
          initial={{ width: 0 }}
          animate={{ width: `${data.score}%` }}
          transition={{ duration: 0.9, ease: [0.2, 0.6, 0.2, 1] }}
        />
      </div>
      <p className="text-sm text-muted-foreground leading-snug">{data.insight}</p>
    </div>
  );
};

const OverallBadge = ({
  label,
  overall,
  scoreDelta,
}: {
  label: string;
  overall: number;
  scoreDelta: number | null;
}) => {
  const cfg = LABEL_CONFIG[label] ?? LABEL_CONFIG["Needs Work"];
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="inline-flex items-center gap-4 rounded-2xl px-5 py-3 hairline" style={{ background: `color-mix(in oklch, ${toneVar(cfg.tone)} 10%, transparent)` }}>
        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: toneVar(cfg.tone) }} />
        <div>
          <p className="font-serif text-base leading-tight" style={{ color: toneVar(cfg.tone) }}>{label}</p>
          <p className="text-[10px] uppercase tracking-[0.18em] mt-1" style={{ color: toneVar(cfg.tone), opacity: 0.7 }}>{cfg.tagline}</p>
        </div>
        <div className="num-display ml-1 text-4xl leading-none" style={{ color: toneVar(cfg.tone) }}>{overall}</div>
      </div>
      {scoreDelta !== null && scoreDelta !== 0 && (
        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm hairline ${
          scoreDelta > 0
            ? "bg-[color:var(--pn-sage)]/15 text-[color:var(--pn-sage)]"
            : "bg-[color:var(--pn-pink)]/15 text-[color:var(--pn-pink)]"
        }`}>
          <span className="num-display">{scoreDelta > 0 ? "+" : ""}{scoreDelta}</span>
          <span className="text-xs">from your rewrite</span>
        </div>
      )}
    </div>
  );
};

const ActionBtn = ({
  action,
  isActive,
  isLoading,
  onClick,
}: {
  action: string;
  isActive: boolean;
  isLoading: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={isLoading && !isActive}
    className={`px-4 py-2 rounded-full text-sm transition-all hairline ${
      isActive
        ? "bg-[color:var(--pn-sage)]/15 text-[color:var(--pn-sage)]"
        : "bg-white/[0.02] text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
    }`}
  >
    {isLoading && isActive ? (
      <span className="flex items-center gap-1.5">
        <Loader2 className="h-3 w-3 animate-spin" /> Loading...
      </span>
    ) : action}
  </button>
);

const VersionPill = ({
  version,
  isActive,
  isCompareSelected,
  onClick,
}: {
  version: LabVersion;
  isActive: boolean;
  isCompareSelected: boolean;
  onClick: () => void;
}) => {
  const overall = Math.round(DIMS.reduce((s, k) => s + version.feedback[k].score, 0) / DIMS.length);
  const tone = scoreTone(overall);
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all hairline ${
        isActive
          ? "bg-white/[0.08] text-foreground"
          : isCompareSelected
          ? "bg-[color:var(--pn-gold)]/15 text-[color:var(--pn-gold)]"
          : "bg-white/[0.02] text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
      }`}
    >
      <span>{version.label}</span>
      <span
        className="num-display text-xs px-1.5 py-0.5 rounded-full text-foreground"
        style={{ background: `color-mix(in oklch, ${toneVar(tone)} 20%, transparent)` }}
      >
        {overall}
      </span>
    </button>
  );
};

const CompareView = ({ vA, vB }: { vA: LabVersion; vB: LabVersion }) => {
  const overallA = Math.round(DIMS.reduce((s, k) => s + vA.feedback[k].score, 0) / DIMS.length);
  const overallB = Math.round(DIMS.reduce((s, k) => s + vB.feedback[k].score, 0) / DIMS.length);
  const delta = overallB - overallA;

  return (
    <div className="grid grid-cols-2 gap-4 mt-4">
      {([{ v: vA, overall: overallA }, { v: vB, overall: overallB }] as const).map(({ v, overall }, i) => {
        const tone = scoreTone(overall);
        return (
          <div key={v.id} className="hairline rounded-2xl p-5 space-y-4 bg-white/[0.02]">
            <div className="flex items-center justify-between">
              <span className="font-serif text-lg text-foreground">{v.label}</span>
              <div className="flex items-center gap-2">
                {i === 1 && delta !== 0 && (
                  <span className={`num-display text-sm ${delta > 0 ? "text-[color:var(--pn-sage)]" : "text-[color:var(--pn-pink)]"}`}>
                    {delta > 0 ? "+" : ""}{delta}
                  </span>
                )}
                <span className="num-display text-2xl" style={{ color: toneVar(tone) }}>{overall}</span>
              </div>
            </div>
            <p className="text-sm font-serif italic text-muted-foreground bg-white/[0.02] hairline rounded-xl p-3 leading-relaxed line-clamp-4">
              "{v.text.slice(0, 200)}{v.text.length > 200 ? "…" : ""}"
            </p>
            <div className="space-y-2">
              {DIMS.map(k => {
                const cfg = DIM_CONFIG[k];
                const scoreA = vA.feedback[k].score;
                const scoreB = vB.feedback[k].score;
                const d = scoreB - scoreA;
                const dimTone = scoreTone(v.feedback[k].score);
                return (
                  <div key={k} className="flex items-center gap-2">
                    <span className="text-xs w-28 shrink-0 text-muted-foreground">{cfg.label}</span>
                    <div className="flex-1 h-1 rounded-full bg-white/[0.05] overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: toneVar(dimTone) }}
                        initial={{ width: 0 }}
                        animate={{ width: `${v.feedback[k].score}%` }}
                        transition={{ duration: 0.7, ease: [0.2, 0.6, 0.2, 1] }}
                      />
                    </div>
                    <span className="num-display text-xs text-foreground w-8 text-right">{v.feedback[k].score}</span>
                    {i === 1 && d !== 0 && (
                      <span className={`num-display text-xs w-8 ${d > 0 ? "text-[color:var(--pn-sage)]" : "text-[color:var(--pn-pink)]"}`}>
                        {d > 0 ? "+" : ""}{d}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const DirectionCard = ({ direction }: { direction: Direction }) => (
  <div className="hairline rounded-2xl bg-white/[0.02] p-5 space-y-3">
    <div>
      <p className="font-serif text-lg text-foreground leading-tight">{direction.title}</p>
      <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-1">{direction.angle}</p>
    </div>
    <div className="bg-white/[0.02] hairline rounded-xl px-4 py-3">
      <p className="text-sm font-serif italic text-foreground/85 leading-relaxed select-none">
        "{direction.example}"
      </p>
    </div>
    <div className="space-y-1.5 pt-1">
      <p className="text-xs text-muted-foreground leading-snug">
        <span className="text-[color:var(--pn-sage)]">Why it works: </span>
        {direction.explanation.why}
      </p>
      <p className="text-xs text-muted-foreground leading-snug">
        <span className="text-[color:var(--pn-gold)]">What changed: </span>
        {direction.explanation.what}
      </p>
    </div>
  </div>
);

const ExplorePanel = ({
  exploreState,
  text,
  onTextChange,
  onReanalyze,
}: {
  exploreState: ExploreState;
  text: string;
  onTextChange: (t: string) => void;
  onReanalyze: () => void;
}) => {
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  if (exploreState.status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <div className="relative">
          <div className="w-14 h-14 rounded-full hairline bg-[color:var(--pn-sage)]/12 flex items-center justify-center">
            <Compass className="h-6 w-6 text-[color:var(--pn-sage)]" />
          </div>
          <div className="absolute inset-0 rounded-full border border-[color:var(--pn-sage)]/40 animate-ping opacity-60" />
        </div>
        <p className="text-base font-serif italic text-muted-foreground">Exploring directions.</p>
      </div>
    );
  }

  if (exploreState.status === 'error') {
    return (
      <Alert className="hairline bg-[color:var(--pn-pink)]/10 text-[color:var(--pn-pink)] border-transparent">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{exploreState.message}</AlertDescription>
      </Alert>
    );
  }

  if (exploreState.status !== 'success') return null;

  return (
    <div className="space-y-4">
      {/* Ethical guardrail */}
      <div className="flex items-start gap-2.5 hairline bg-[color:var(--pn-gold)]/8 rounded-xl px-4 py-3">
        <AlertCircle className="h-4 w-4 text-[color:var(--pn-gold)] mt-0.5 shrink-0" />
        <p className="text-sm text-foreground/85 leading-snug">
          <span className="text-[color:var(--pn-gold)]">Examples to spark your thinking — not to copy.</span>{" "}
          Your voice matters. Read them, find what resonates, then write your own version below.
        </p>
      </div>

      {/* Direction cards */}
      <div className="grid grid-cols-1 gap-3">
        {exploreState.directions.map((dir, i) => (
          <DirectionCard key={i} direction={dir} />
        ))}
      </div>

      {/* Write your version */}
      <HairlineCard variant="sage">
        <div className="space-y-3">
          <div>
            <p className="font-serif text-lg text-foreground leading-tight">Now, your version.</p>
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-1">Use what inspired you, make it yours</p>
          </div>
          <Textarea
            value={text}
            onChange={e => onTextChange(e.target.value)}
            placeholder="Write your version here..."
            className="min-h-[120px] font-serif text-base leading-relaxed bg-white/[0.02] hairline resize-none"
          />
          <div className="flex items-center justify-between">
            <span className={`text-xs px-2.5 py-1 rounded-full ${wordCountClass(wordCount)}`}>
              <span className="num-display">{wordCount}</span> {wordCount === 1 ? "word" : "words"}
            </span>
            <Button
              type="button"
              onClick={onReanalyze}
              disabled={wordCount < 3}
              size="sm"
              className="bg-[color:var(--pn-sage)]/15 hairline text-[color:var(--pn-sage)] hover:bg-[color:var(--pn-sage)]/25 shadow-none"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              Re-analyze my version
            </Button>
          </div>
        </div>
      </HairlineCard>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────

export default function PrimroseLab() {
  const [text, setText] = useState('');
  const [compareMode, setCompareMode] = useState(false);
  const [compareVersionIds, setCompareVersionIds] = useState<[string | undefined, string | undefined]>([undefined, undefined]);
  const [scoreBeforeExplore, setScoreBeforeExplore] = useState<number | null>(null);
  const [showExplore, setShowExplore] = useState(false);

  const {
    analyzeState,
    suggestState,
    exploreState,
    versions,
    activeVersionId,
    setActiveVersionId,
    analyze,
    getSuggestions,
    exploreDirections,
    saveVersion,
    resetAnalysis,
  } = usePrimroseLab();

  const { essays } = useStudentPersonalArea();

  const isAnalyzing = analyzeState.status === 'analyzing';
  const hasResult = analyzeState.status === 'success';
  const feedback = hasResult ? (analyzeState as { status: 'success'; feedback: LabFeedback }).feedback : null;

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const canAnalyze = wordCount >= 3 && !isAnalyzing;

  const overall = feedback ? Math.round(DIMS.reduce((s, k) => s + feedback[k].score, 0) / DIMS.length) : 0;

  const scoreDelta = (scoreBeforeExplore !== null && hasResult)
    ? overall - scoreBeforeExplore
    : null;

  const activeSuggestion = suggestState.status === 'success' || suggestState.status === 'loading'
    ? (suggestState as { action: string }).action
    : null;

  const handleLoadEssay = (essayId: string) => {
    const essay = essays?.find(e => e.id === essayId);
    if (essay) setText(essay.essay_content || '');
  };

  const handleAnalyze = () => {
    if (canAnalyze) analyze(text);
  };

  const handleActionClick = (action: string) => {
    if (suggestState.status === 'success' && (suggestState as any).action === action) return;
    setShowExplore(false);
    getSuggestions(text, action);
  };

  const handleExploreDirections = () => {
    setScoreBeforeExplore(overall);
    setShowExplore(true);
    exploreDirections(text);
  };

  const handleReanalyzeFromExplore = () => {
    if (canAnalyze) {
      setShowExplore(false);
      analyze(text);
    }
  };

  const handleSave = () => {
    if (!feedback) return;
    saveVersion(text, feedback);
  };

  const handleReset = () => {
    setText('');
    resetAnalysis();
    setCompareMode(false);
    setCompareVersionIds([undefined, undefined]);
    setScoreBeforeExplore(null);
    setShowExplore(false);
  };

  const handleToggleCompare = (versionId: string) => {
    setCompareVersionIds(prev => {
      if (prev[0] === versionId) return [undefined, prev[1]];
      if (prev[1] === versionId) return [prev[0], undefined];
      if (!prev[0]) return [versionId, prev[1]];
      if (!prev[1]) return [prev[0], versionId];
      return [versionId, prev[1]];
    });
  };

  const compareVersionA = versions.find(v => v.id === compareVersionIds[0]);
  const compareVersionB = versions.find(v => v.id === compareVersionIds[1]);

  return (
    <PageShell>
      <BlurOrb tone="sage" className="top-[-100px] left-[-100px] w-[520px] h-[520px]" />
      <BlurOrb tone="pink" className="bottom-[-80px] right-[-100px] w-[380px] h-[380px]" />

      <PageHeader
        eyebrow="Primrose Lab"
        title={<>Your essay workshop.</>}
        subtitle={<>Test a hook. Get honest feedback. Iterate fast.</>}
        actions={
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full hairline bg-white/[0.03]">
            <FlaskConical className="h-3.5 w-3.5 text-[color:var(--pn-sage)]" />
            <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Lab</span>
          </div>
        }
      />

      <div className="space-y-6">

        {/* ── Input Phase ── */}
        {!hasResult && !isAnalyzing && (
          <motion.div initial="hidden" animate="visible" variants={sectionVariants}>
            <HairlineCard>
              <div className="flex items-center justify-between flex-wrap gap-2 mb-6">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-foreground/60" />
                  <div>
                    <h2 className="font-serif text-xl text-foreground leading-tight">Bring in some text.</h2>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-1">A hook, an opening, a paragraph</p>
                  </div>
                </div>
                {essays && essays.length > 0 && (
                  <Select onValueChange={handleLoadEssay}>
                    <SelectTrigger className="w-52 h-8 text-xs bg-white/[0.02] hairline">
                      <SelectValue placeholder="Load from my essays" />
                    </SelectTrigger>
                    <SelectContent>
                      {essays.map(e => (
                        <SelectItem key={e.id} value={e.id}>
                          {e.essay_title || "Untitled essay"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="space-y-4">
                <Textarea
                  id="lab-textarea"
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="Paste 1–5 sentences here. A hook, an opening, a paragraph you're not sure about. The shorter the better to start."
                  className="min-h-[200px] font-serif text-base leading-relaxed bg-white/[0.02] hairline resize-none"
                />
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-3 py-1 rounded-full ${wordCountClass(wordCount)}`}>
                    <span className="num-display">{wordCount}</span> {wordCount === 1 ? "word" : "words"}
                    {wordCount > 120 && " — try a shorter excerpt"}
                  </span>
                  <Button
                    type="button"
                    onClick={handleAnalyze}
                    disabled={!canAnalyze}
                    className="bg-[color:var(--pn-sage)]/15 hairline text-[color:var(--pn-sage)] hover:bg-[color:var(--pn-sage)]/25 shadow-none px-7 disabled:opacity-40"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Analyze
                  </Button>
                </div>
                {analyzeState.status === 'error' && (
                  <Alert className="hairline bg-[color:var(--pn-pink)]/10 text-[color:var(--pn-pink)] border-transparent">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{analyzeState.message}</AlertDescription>
                  </Alert>
                )}
              </div>
            </HairlineCard>
          </motion.div>
        )}

        {/* ── Loading Phase ── */}
        {isAnalyzing && (
          <HairlineCard>
            <div className="flex flex-col items-center justify-center py-16 gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full hairline bg-[color:var(--pn-sage)]/12 flex items-center justify-center">
                  <FlaskConical className="h-8 w-8 text-[color:var(--pn-sage)]" />
                </div>
                <div className="absolute inset-0 rounded-full border border-[color:var(--pn-sage)]/40 animate-ping opacity-60" />
              </div>
              <div className="text-center">
                <p className="font-serif text-2xl text-foreground leading-tight">Reading it now.</p>
                <p className="font-serif italic text-muted-foreground mt-1">Being honest takes a moment.</p>
              </div>
            </div>
          </HairlineCard>
        )}

        {/* ── Results Phase ── */}
        {hasResult && feedback && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
            className="space-y-6"
          >

            {/* Overall badge + controls */}
            <motion.div variants={sectionVariants} className="flex flex-wrap items-center justify-between gap-3">
              <OverallBadge label={feedback.overallLabel} overall={overall} scoreDelta={scoreDelta} />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleSave}
                  className="hairline hover:bg-white/[0.04] text-foreground"
                >
                  <Save className="h-3.5 w-3.5 mr-1.5" />
                  Save as {versions.length > 0 ? `V${versions.length + 1}` : "V1"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="hairline hover:bg-white/[0.03] text-muted-foreground"
                >
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                  Start over
                </Button>
              </div>
            </motion.div>

            {/* Overall summary */}
            <motion.div variants={sectionVariants}>
              <HairlineCard>
                <p className="text-base font-serif italic text-foreground leading-relaxed">
                  "{feedback.overallSummary}"
                </p>
              </HairlineCard>
            </motion.div>

            {/* 5 dimension cards */}
            <motion.div variants={sectionVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {DIMS.map(k => (
                <DimensionCard key={k} dimKey={k} data={feedback[k]} />
              ))}
            </motion.div>

            {/* Edit + re-analyze */}
            <motion.div variants={sectionVariants}>
              <HairlineCard variant="sage">
                <div className="space-y-3">
                  <p className="font-serif text-lg text-foreground leading-tight">Change it, and see what moves.</p>
                  <Textarea
                    value={text}
                    onChange={e => setText(e.target.value)}
                    className="min-h-[120px] font-serif text-base leading-relaxed bg-white/[0.02] hairline resize-none"
                  />
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-2.5 py-1 rounded-full ${wordCountClass(wordCount)}`}>
                      <span className="num-display">{wordCount}</span> words
                    </span>
                    <Button
                      type="button"
                      onClick={handleAnalyze}
                      disabled={!canAnalyze}
                      size="sm"
                      className="bg-[color:var(--pn-sage)]/15 hairline text-[color:var(--pn-sage)] hover:bg-[color:var(--pn-sage)]/25 shadow-none"
                    >
                      <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                      Re-analyze
                    </Button>
                  </div>
                </div>
              </HairlineCard>
            </motion.div>

            {/* Action layer */}
            <motion.div variants={sectionVariants} className="space-y-3">
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">What do you want to work on?</p>
              <div className="flex flex-wrap gap-2">
                {feedback.suggestedActions.map(action => (
                  <ActionBtn
                    key={action}
                    action={action}
                    isActive={activeSuggestion === action}
                    isLoading={suggestState.status === 'loading' && (suggestState as any).action === action}
                    onClick={() => handleActionClick(action)}
                  />
                ))}
              </div>

              {/* Suggestion panel */}
              {(suggestState.status === 'loading' || suggestState.status === 'success') && !showExplore && (
                <HairlineCard variant="sage">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[color:var(--pn-sage)]">
                      <Sparkles className="h-4 w-4" />
                      <span className="font-serif text-base">
                        {suggestState.status === 'loading' ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Loading suggestions...
                          </span>
                        ) : (
                          `How to: ${(suggestState as any).action}`
                        )}
                      </span>
                    </div>
                    {suggestState.status === 'success' && (
                      <ul className="space-y-2.5">
                        {(suggestState as any).suggestions.map((s: string, i: number) => (
                          <li key={i} className="flex gap-3 text-sm text-foreground leading-relaxed">
                            <span className="text-[color:var(--pn-sage)] mt-0.5 shrink-0">•</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </HairlineCard>
              )}

              {/* Explore directions — temporarily disabled pending review */}
              {/* <div className="pt-1">
                <button
                  type="button"
                  onClick={handleExploreDirections}
                  disabled={exploreState.status === 'loading'}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl hairline bg-[color:var(--pn-sage)]/15 hover:bg-[color:var(--pn-sage)]/25 text-[color:var(--pn-sage)] text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {exploreState.status === 'loading' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Compass className="h-4 w-4" />
                  )}
                  Explore directions
                </button>
              </div> */}
            </motion.div>

            {/* Explore panel — temporarily disabled pending review */}
            {/* {showExplore && (
              <ExplorePanel
                exploreState={exploreState}
                text={text}
                onTextChange={setText}
                onReanalyze={handleReanalyzeFromExplore}
              />
            )} */}

            {/* Version history */}
            {versions.length > 0 && (
              <motion.div variants={sectionVariants} className="space-y-3 hairline-t pt-6">
                <div className="flex items-center justify-between">
                  <p className="font-serif text-lg text-foreground leading-tight flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    Every version, kept.
                    <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      (<span className="num-display">{versions.length}</span>)
                    </span>
                  </p>
                  {versions.length >= 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setCompareMode(m => !m)}
                      className="hairline hover:bg-white/[0.04] text-[color:var(--pn-gold)] text-xs"
                    >
                      <ArrowLeftRight className="h-3 w-3 mr-1" />
                      {compareMode ? "Hide compare" : "Compare versions"}
                    </Button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {versions.map(v => (
                    <VersionPill
                      key={v.id}
                      version={v}
                      isActive={!compareMode && activeVersionId === v.id}
                      isCompareSelected={compareMode && (compareVersionIds[0] === v.id || compareVersionIds[1] === v.id)}
                      onClick={() => {
                        if (compareMode) {
                          handleToggleCompare(v.id);
                        } else {
                          setActiveVersionId(v.id);
                          setText(v.text);
                        }
                      }}
                    />
                  ))}
                </div>

                {compareMode && compareVersionA && compareVersionB && (
                  <CompareView vA={compareVersionA} vB={compareVersionB} />
                )}

                {compareMode && (!compareVersionA || !compareVersionB) && (
                  <p className="text-sm font-serif italic text-[color:var(--pn-gold)] hairline bg-[color:var(--pn-gold)]/8 rounded-xl px-4 py-3">
                    Select two versions above to compare them side by side.
                  </p>
                )}
              </motion.div>
            )}

          </motion.div>
        )}

      </div>
    </PageShell>
  );
}
