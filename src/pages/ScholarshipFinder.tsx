import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  PageShell,
  PageHeader,
  HairlineCard,
  BlurOrb,
  SignalRing,
} from "@/components/primrose-night";
import {
  Trophy, Sparkles, RefreshCw, Bookmark, BookmarkCheck,
  ExternalLink, ChevronRight, AlertCircle, CheckCircle2, Globe,
  GraduationCap, Target, Clock, Lightbulb, Info,
} from "lucide-react";
import {
  useScholarshipFinder,
  type EnrichedMatch,
  STUDY_COUNTRIES,
  DEGREE_TYPES,
  FIELDS_OF_STUDY,
  GPA_RANGES,
  BACKGROUND_TAGS,
} from "@/hooks/useScholarshipFinder";

// ── Config ────────────────────────────────────────────────────

type Tone = "sage" | "gold" | "pink";

const MATCH_CONFIG: Record<'high' | 'possible' | 'reach', { label: string; tone: Tone }> = {
  high:     { label: "High match", tone: 'sage' },
  possible: { label: "Possible",   tone: 'gold' },
  reach:    { label: "Reach",      tone: 'pink' },
};

const COVERAGE_CONFIG: Record<'full' | 'partial' | 'stipend', { label: string; tone: Tone | 'neutral' }> = {
  full:    { label: "Full funding", tone: 'sage' },
  partial: { label: "Partial",      tone: 'gold' },
  stipend: { label: "Stipend",      tone: 'neutral' },
};

const toneVar = (t: Tone) => `var(--pn-${t})`;

const tonePill = (t: Tone | 'neutral') =>
  t === 'neutral'
    ? "bg-white/[0.03] text-muted-foreground hairline"
    : `bg-[color:var(--pn-${t})]/15 text-[color:var(--pn-${t})] hairline`;

const sectionVariants = {
  hidden: { opacity: 0, y: 8, filter: "blur(4px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.4, ease: [0.2, 0.6, 0.2, 1] as const } },
};

// ── Sub-components ────────────────────────────────────────────

const MatchBadge = ({ level }: { level: 'high' | 'possible' | 'reach' }) => {
  const cfg = MATCH_CONFIG[level];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs ${tonePill(cfg.tone)}`}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: toneVar(cfg.tone) }} />
      {cfg.label}
    </span>
  );
};

const CoverageTag = ({ coverage }: { coverage: 'full' | 'partial' | 'stipend' }) => {
  const cfg = COVERAGE_CONFIG[coverage];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${tonePill(cfg.tone)}`}>
      {cfg.label}
    </span>
  );
};

const ScholarshipCard = ({
  match,
  isSaved,
  onSave,
  onViewDetails,
}: {
  match: EnrichedMatch;
  isSaved: boolean;
  onSave: () => void;
  onViewDetails: () => void;
}) => {
  const { scholarship: s, matchLevel, matchScore, matchReason } = match;
  const tone = MATCH_CONFIG[matchLevel].tone;
  return (
    <div className="hairline rounded-2xl bg-white/[0.02] p-5 flex flex-col gap-4 hover:bg-white/[0.03] transition-colors">
      {/* Header */}
      <div className="flex items-start gap-4">
        <SignalRing value={matchScore} tone={tone} label="match" size={64} strokeWidth={3} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-serif text-lg text-foreground leading-tight">{s.name}</h3>
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onSave(); }}
              className="text-muted-foreground hover:text-foreground transition-colors shrink-0 mt-0.5"
              title={isSaved ? "Remove from saved" : "Save scholarship"}
            >
              {isSaved
                ? <BookmarkCheck className="h-5 w-5 text-[color:var(--pn-gold)]" />
                : <Bookmark className="h-5 w-5" />
              }
            </button>
          </div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-1">{s.provider}</p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <MatchBadge level={matchLevel} />
            <CoverageTag coverage={s.coverage} />
            <span className="num-display text-xs text-foreground/80">{s.amount}</span>
          </div>
        </div>
      </div>

      {/* Eligibility + deadline */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Globe className="h-3.5 w-3.5" />
          {s.studyCountries.length ? s.studyCountries.join(', ') : 'Flexible location'}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          {s.deadlineNote}
        </span>
      </div>

      <p className="text-sm text-foreground/85 leading-snug">{s.eligibilitySummary}</p>

      {/* Match reason */}
      <div
        className="rounded-xl px-3.5 py-2.5 text-sm hairline leading-snug"
        style={{ background: `color-mix(in oklch, ${toneVar(tone)} 8%, transparent)`, color: toneVar(tone) }}
      >
        <span className="font-serif italic">Why it matches: </span>
        <span className="text-foreground/85">{matchReason}</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <Button
          type="button"
          size="sm"
          onClick={onViewDetails}
          className="flex-1 bg-transparent hairline hover:bg-white/[0.04] text-foreground shadow-none"
        >
          View details
          <ChevronRight className="h-3.5 w-3.5 ml-1" />
        </Button>
      </div>
    </div>
  );
};

const DetailSheet = ({
  match,
  isSaved,
  onSave,
  onClose,
}: {
  match: EnrichedMatch | null;
  isSaved: boolean;
  onSave: () => void;
  onClose: () => void;
}) => {
  const s = match?.scholarship;
  if (!s || !match) return null;
  const tone = MATCH_CONFIG[match.matchLevel].tone;

  return (
    <Sheet open={!!match} onOpenChange={open => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto bg-pn-card" side="right">
        <SheetHeader className="pb-4 hairline-b">
          <div className="flex items-start justify-between gap-3">
            <div>
              <SheetTitle className="font-serif text-2xl text-foreground leading-tight">{s.name}</SheetTitle>
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-1.5">{s.provider}</p>
            </div>
            <button
              type="button"
              onClick={onSave}
              className="text-muted-foreground hover:text-foreground transition-colors shrink-0 mt-1"
            >
              {isSaved
                ? <BookmarkCheck className="h-6 w-6 text-[color:var(--pn-gold)]" />
                : <Bookmark className="h-6 w-6" />
              }
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <MatchBadge level={match.matchLevel} />
            <CoverageTag coverage={s.coverage} />
            <span className="num-display text-sm text-foreground">{s.amount}</span>
          </div>
        </SheetHeader>

        <div className="space-y-6 py-6">

          {/* Match reason */}
          <div
            className="rounded-xl px-4 py-3 hairline"
            style={{ background: `color-mix(in oklch, ${toneVar(tone)} 8%, transparent)` }}
          >
            <p className="text-[10px] uppercase tracking-[0.18em] mb-1.5" style={{ color: toneVar(tone) }}>Why it matches you</p>
            <p className="text-sm text-foreground/85 leading-relaxed">{match.matchReason}</p>
          </div>

          {/* Description */}
          <div>
            <h4 className="font-serif text-lg text-foreground leading-tight mb-2 flex items-center gap-1.5">
              <Info className="h-4 w-4 text-muted-foreground" />
              About this scholarship
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
          </div>

          {/* What it covers */}
          <div>
            <h4 className="font-serif text-lg text-foreground leading-tight mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-[color:var(--pn-sage)]" />
              What it covers
            </h4>
            <ul className="space-y-1.5">
              {s.whatItCovers.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground/85">
                  <span className="text-[color:var(--pn-sage)] mt-0.5">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Requirements */}
          <div>
            <h4 className="font-serif text-lg text-foreground leading-tight mb-2 flex items-center gap-1.5">
              <Target className="h-4 w-4 text-[color:var(--pn-gold)]" />
              Key requirements
            </h4>
            <ul className="space-y-1.5">
              {s.requirements.map((req, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground/85">
                  <span className="text-[color:var(--pn-gold)] mt-0.5 shrink-0">•</span>
                  {req}
                </li>
              ))}
            </ul>
          </div>

          {/* Timeline */}
          <div>
            <h4 className="font-serif text-lg text-foreground leading-tight mb-2 flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-[color:var(--pn-pink)]" />
              Timeline
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{s.timeline}</p>
            <p className="text-xs hairline bg-[color:var(--pn-gold)]/8 text-[color:var(--pn-gold)] rounded-lg px-3 py-2 mt-2 flex items-start gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span>Deadline shown is approximate. Always verify the current cycle on the official site.</span>
            </p>
          </div>

          {/* Personalized tips */}
          <div>
            <h4 className="font-serif text-lg text-foreground leading-tight mb-2 flex items-center gap-1.5">
              <Lightbulb className="h-4 w-4 text-[color:var(--pn-sage)]" />
              Tips for your application
            </h4>
            <ul className="space-y-2.5">
              {match.personalizedTips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/85 hairline bg-[color:var(--pn-sage)]/6 rounded-xl px-3.5 py-2.5 leading-snug">
                  <span className="num-display text-[color:var(--pn-sage)] shrink-0 mt-0.5">{i + 1}.</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Official link */}
          <a
            href={s.officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl hairline bg-white/[0.05] hover:bg-white/[0.08] text-foreground text-sm transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            Visit official site
          </a>
        </div>
      </SheetContent>
    </Sheet>
  );
};

// ── Main Page ─────────────────────────────────────────────────

export default function ScholarshipFinder() {
  const {
    profile,
    searchState,
    savedIds,
    selectedMatch,
    isProfileComplete,
    updateProfile,
    toggleBackgroundTag,
    toggleSaved,
    setSelectedMatch,
    findMatches,
    reset,
  } = useScholarshipFinder();

  const isLoading = searchState.status === 'loading';
  const hasResults = searchState.status === 'success';
  const matches = hasResults ? searchState.matches : [];

  const highMatches = matches.filter(m => m.matchLevel === 'high');
  const possibleMatches = matches.filter(m => m.matchLevel === 'possible');
  const reachMatches = matches.filter(m => m.matchLevel === 'reach');

  return (
    <PageShell>
      <BlurOrb tone="gold" className="top-[-100px] right-[-100px] w-[500px] h-[500px]" />

      <PageHeader
        eyebrow="Scholarship Finder"
        title={<>Find what you qualify for.</>}
        subtitle={<>Tell us about you — we'll match, and explain why.</>}
        actions={
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full hairline bg-white/[0.03]">
            <Trophy className="h-3.5 w-3.5 text-[color:var(--pn-gold)]" />
            <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Match</span>
          </div>
        }
      />

      <div className="space-y-6">

        {/* ── Profile Form ── */}
        {!hasResults && !isLoading && (
          <motion.div initial="hidden" animate="visible" variants={sectionVariants}>
            <HairlineCard>
              <div className="flex items-center gap-3 mb-2">
                <GraduationCap className="h-5 w-5 text-foreground/60" />
                <div>
                  <h2 className="font-serif text-xl text-foreground leading-tight">Who you are.</h2>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-1">5 quick fields — then we match you</p>
                </div>
              </div>

              <div className="space-y-6 pt-4">

                {/* Row 1: Citizenship + Study Country */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="citizenship" className="text-sm text-foreground">
                      Your citizenship / nationality <span className="text-[color:var(--pn-pink)]">*</span>
                    </Label>
                    <Input
                      id="citizenship"
                      value={profile.citizenship}
                      onChange={e => updateProfile({ citizenship: e.target.value })}
                      placeholder="e.g. American, British, Canadian..."
                      className="bg-white/[0.02] hairline"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm text-foreground">
                      Where do you want to study? <span className="text-[color:var(--pn-pink)]">*</span>
                    </Label>
                    <Select value={profile.studyCountry} onValueChange={v => updateProfile({ studyCountry: v })}>
                      <SelectTrigger className="bg-white/[0.02] hairline">
                        <SelectValue placeholder="Select destination" />
                      </SelectTrigger>
                      <SelectContent>
                        {STUDY_COUNTRIES.map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Row 2: Degree + Field */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-sm text-foreground">
                      Degree level <span className="text-[color:var(--pn-pink)]">*</span>
                    </Label>
                    <Select value={profile.degreeType} onValueChange={v => updateProfile({ degreeType: v })}>
                      <SelectTrigger className="bg-white/[0.02] hairline">
                        <SelectValue placeholder="Select degree" />
                      </SelectTrigger>
                      <SelectContent>
                        {DEGREE_TYPES.map(d => (
                          <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm text-foreground">
                      Field of study <span className="text-[color:var(--pn-pink)]">*</span>
                    </Label>
                    <Select value={profile.fieldOfStudy} onValueChange={v => updateProfile({ fieldOfStudy: v })}>
                      <SelectTrigger className="bg-white/[0.02] hairline">
                        <SelectValue placeholder="Select field" />
                      </SelectTrigger>
                      <SelectContent>
                        {FIELDS_OF_STUDY.map(f => (
                          <SelectItem key={f} value={f}>{f}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* GPA */}
                <div className="space-y-2">
                  <Label className="text-sm text-foreground">
                    Your GPA (approximate) <span className="text-[color:var(--pn-pink)]">*</span>
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {GPA_RANGES.map(g => (
                      <button
                        key={g.value}
                        type="button"
                        onClick={() => updateProfile({ gpaRange: g.value })}
                        className={`px-4 py-2 rounded-full text-sm transition-all hairline ${
                          profile.gpaRange === g.value
                            ? 'bg-[color:var(--pn-gold)]/15 text-[color:var(--pn-gold)]'
                            : 'bg-white/[0.02] text-muted-foreground hover:bg-white/[0.04] hover:text-foreground'
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Background tags */}
                <div className="space-y-2">
                  <Label className="text-sm text-foreground">
                    Your background <span className="text-muted-foreground text-xs">(optional — improves matching)</span>
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {BACKGROUND_TAGS.map(tag => {
                      const isSelected = profile.backgroundTags.includes(tag.value);
                      return (
                        <button
                          key={tag.value}
                          type="button"
                          onClick={() => toggleBackgroundTag(tag.value)}
                          className={`px-3.5 py-1.5 rounded-full text-sm transition-all hairline ${
                            isSelected
                              ? 'bg-white/[0.08] text-foreground'
                              : 'bg-white/[0.02] text-muted-foreground hover:bg-white/[0.04] hover:text-foreground'
                          }`}
                        >
                          {tag.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Submit */}
                <div className="flex items-center justify-between pt-2 hairline-t">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground flex items-center gap-1.5 mt-4">
                    <Info className="h-3.5 w-3.5" />
                    Deadline info is approximate
                  </p>
                  <Button
                    type="button"
                    onClick={findMatches}
                    disabled={!isProfileComplete}
                    className="mt-4 bg-[color:var(--pn-gold)]/15 hairline text-[color:var(--pn-gold)] hover:bg-[color:var(--pn-gold)]/25 shadow-none px-7 disabled:opacity-40"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Find my matches
                  </Button>
                </div>

                {searchState.status === 'error' && (
                  <div className="flex items-center gap-2 text-[color:var(--pn-pink)] text-sm hairline bg-[color:var(--pn-pink)]/10 rounded-xl px-4 py-3">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {searchState.message}
                  </div>
                )}
              </div>
            </HairlineCard>
          </motion.div>
        )}

        {/* ── Loading ── */}
        {isLoading && (
          <HairlineCard>
            <div className="flex flex-col items-center justify-center py-20 gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full hairline bg-[color:var(--pn-gold)]/12 flex items-center justify-center">
                  <Trophy className="h-8 w-8 text-[color:var(--pn-gold)]" />
                </div>
                <div className="absolute inset-0 rounded-full border border-[color:var(--pn-gold)]/40 animate-ping opacity-60" />
              </div>
              <div className="text-center">
                <p className="font-serif text-2xl text-foreground leading-tight">Reading the field.</p>
                <p className="font-serif italic text-muted-foreground mt-1">
                  {profile.citizenship} students in {profile.fieldOfStudy}.
                </p>
              </div>
            </div>
          </HairlineCard>
        )}

        {/* ── Results ── */}
        {hasResults && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
            className="space-y-6"
          >

            {/* Results header */}
            <motion.div variants={sectionVariants} className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="font-serif text-3xl text-foreground leading-tight">Your matches.</h2>
                <p className="font-serif italic text-muted-foreground mt-1">
                  <span className="num-display">{matches.length}</span> scholarships — best fits first.
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={reset}
                className="hairline hover:bg-white/[0.03] text-muted-foreground"
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                New search
              </Button>
            </motion.div>

            {/* Summary pills */}
            <motion.div variants={sectionVariants} className="flex flex-wrap gap-2">
              {highMatches.length > 0 && (
                <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs ${tonePill('sage')}`}>
                  <span className="w-2 h-2 rounded-full bg-[color:var(--pn-sage)]" />
                  <span className="num-display">{highMatches.length}</span> High match{highMatches.length > 1 ? 'es' : ''}
                </span>
              )}
              {possibleMatches.length > 0 && (
                <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs ${tonePill('gold')}`}>
                  <span className="w-2 h-2 rounded-full bg-[color:var(--pn-gold)]" />
                  <span className="num-display">{possibleMatches.length}</span> Possible
                </span>
              )}
              {reachMatches.length > 0 && (
                <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs ${tonePill('pink')}`}>
                  <span className="w-2 h-2 rounded-full bg-[color:var(--pn-pink)]" />
                  <span className="num-display">{reachMatches.length}</span> Reach
                </span>
              )}
            </motion.div>

            {/* Cards grid */}
            <motion.div variants={sectionVariants} className="grid grid-cols-1 gap-4">
              {matches.map(match => (
                <ScholarshipCard
                  key={match.scholarshipId}
                  match={match}
                  isSaved={savedIds.has(match.scholarshipId)}
                  onSave={() => toggleSaved(match.scholarshipId)}
                  onViewDetails={() => setSelectedMatch(match)}
                />
              ))}
            </motion.div>

            {/* Disclaimer */}
            <motion.div variants={sectionVariants} className="flex items-start gap-2 text-xs text-muted-foreground hairline bg-white/[0.02] rounded-xl px-4 py-3">
              <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Scholarship details are based on historical data and AI analysis. Deadlines, amounts, and eligibility can change annually.
                Always verify on the official scholarship website before applying.
              </p>
            </motion.div>
          </motion.div>
        )}

      </div>

      {/* ── Detail Sheet ── */}
      <DetailSheet
        match={selectedMatch}
        isSaved={selectedMatch ? savedIds.has(selectedMatch.scholarshipId) : false}
        onSave={() => selectedMatch && toggleSaved(selectedMatch.scholarshipId)}
        onClose={() => setSelectedMatch(null)}
      />
    </PageShell>
  );
}
