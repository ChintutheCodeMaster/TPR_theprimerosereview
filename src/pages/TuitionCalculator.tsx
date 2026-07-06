import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  PageShell,
  PageHeader,
  HairlineCard,
  BlurOrb,
} from "@/components/primrose-night";
import {
  GraduationCap, Home, Plane, MapPin, Trophy,
  TrendingDown, Info, ChevronRight, RotateCcw,
  HeartPulse, BookOpen, ShieldAlert, Utensils, Bus,
  Lightbulb, MessageCircle, LayoutDashboard,
  Bookmark, BookmarkCheck, Trash2, Clock,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  type Country, type DegreeType, type LivingStyle,
  COUNTRIES, DEGREE_TYPES, LIVING_STYLES, FIELDS_OF_STUDY,
  DURATION_OPTIONS, DEFAULT_DURATION, CITIES_BY_COUNTRY,
  getCosts, getAnnualTotal, getProgramTotal, getAffordability,
  getScholarshipReduction, getMonthlyLiving, generateInsights, formatUSD,
} from "@/data/tuitionData";

// ── Types ────────────────────────────────────────────────────────────────────
interface CostPlan {
  id: string;
  country: string;
  city: string | null;
  degree: string;
  field_of_study: string;
  living_style: string;
  duration_years: number;
  annual_min: number;
  annual_max: number;
  program_min: number;
  program_max: number;
  monthly_living_min: number;
  monthly_living_max: number;
  affordability: string;
  created_at: string;
}

type Tone = "sage" | "gold" | "pink";

const AFFORDABILITY_CONFIG: Record<'affordable' | 'moderate' | 'high', { label: string; tone: Tone }> = {
  affordable: { label: "Affordable", tone: 'sage' },
  moderate:   { label: "Moderate",   tone: 'gold' },
  high:       { label: "High Cost",  tone: 'pink' },
};

const toneVar = (t: Tone) => `var(--pn-${t})`;

const tonePill = (t: Tone) => `bg-[color:var(--pn-${t})]/15 text-[color:var(--pn-${t})] hairline`;

function range(min: number, max: number) {
  return `${formatUSD(min)} – ${formatUSD(max)}`;
}

function midpoint(min: number, max: number) {
  return Math.round((min + max) / 2);
}

function countryFlag(value: string) {
  return COUNTRIES.find(c => c.value === value)?.flag ?? "🌍";
}

function countryName(value: string) {
  return COUNTRIES.find(c => c.value === value)?.label ?? value;
}

function degreeName(value: string) {
  return DEGREE_TYPES.find(d => d.value === value)?.label ?? value;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const sectionVariants = {
  hidden: { opacity: 0, y: 8, filter: "blur(4px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.4, ease: [0.2, 0.6, 0.2, 1] as const } },
};

// ── Cost bar ─────────────────────────────────────────────────────────────────
interface CostBarProps {
  label: string;
  icon: React.ReactNode;
  min: number;
  max: number;
  totalMax: number;
  tone: Tone;
}

function CostBar({ label, icon, min, max, totalMax, tone }: CostBarProps) {
  const pct = Math.max(2, Math.round((midpoint(min, max) / totalMax) * 100));
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          {icon}
          <span>{label}</span>
        </div>
        <span className="num-display text-foreground">
          {range(min, max)}<span className="text-muted-foreground text-xs ml-1 font-sans">/yr</span>
        </span>
      </div>
      <div className="h-1 rounded-full bg-white/[0.05] overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: toneVar(tone) }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, ease: [0.2, 0.6, 0.2, 1] }}
        />
      </div>
    </div>
  );
}

// Rotating tones for cost categories (kept consistent across renders)
const COST_TONES: Tone[] = ['sage', 'gold', 'pink', 'sage', 'gold', 'pink', 'sage', 'gold'];

// ── Main page ────────────────────────────────────────────────────────────────
export default function TuitionCalculator() {
  const navigate = useNavigate();

  const [country, setCountry]             = useState<Country | "">("");
  const [customCountry, setCustomCountry] = useState<string>("");
  const [city, setCity]                   = useState<string>("");
  const [customCity, setCustomCity]       = useState<string>("");
  const [degree, setDegree]               = useState<DegreeType | "">("");
  const [field, setField]                 = useState<string>("");
  const [living, setLiving]               = useState<LivingStyle>("standard");
  const [duration, setDuration]           = useState<number | null>(null);
  const [hasScholarship, setHasScholarship] = useState<"yes" | "no" | "maybe">("maybe");
  const [calculated, setCalculated]       = useState(false);

  const [saveStatus, setSaveStatus]       = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [savedPlans, setSavedPlans]       = useState<CostPlan[]>([]);
  const [deletingId, setDeletingId]       = useState<string | null>(null);

  const isReady        = country !== "" && degree !== "" && field !== "";
  const isOtherCountry = country === "other";
  const isOtherCity    = city === "other";
  const cityOptions    = country && country !== "other" ? CITIES_BY_COUNTRY[country as Country] : [];

  const cityMultiplier = useMemo(() => {
    if (!city || city === "other") return 1.0;
    return cityOptions.find(c => c.value === city)?.livingMultiplier ?? 1.0;
  }, [city, cityOptions]);

  const effectiveDuration = duration ?? (degree ? DEFAULT_DURATION[degree as DegreeType] : 2);

  const result = useMemo(() => {
    if (!isReady || !calculated) return null;
    const costs         = getCosts(country as Country, degree as DegreeType, living, field, effectiveDuration, cityMultiplier);
    const annual        = getAnnualTotal(costs);
    const program       = getProgramTotal(annual, effectiveDuration);
    const affordability = getAffordability(midpoint(annual.min, annual.max), country as Country);
    const scholarship   = getScholarshipReduction(country as Country, degree as DegreeType);
    const monthlyLiving = getMonthlyLiving(costs);
    const insights      = generateInsights(costs, annual, country as Country, living);
    return { costs, annual, program, affordability, scholarship, monthlyLiving, insights };
  }, [country, degree, field, living, effectiveDuration, cityMultiplier, calculated]);

  useEffect(() => {
    if (!calculated) setSaveStatus("idle");
  }, [calculated]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("cost_plans")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);
      if (data) setSavedPlans(data as CostPlan[]);
    })();
  }, []);

  async function handleSavePlan() {
    if (!result || !isReady) return;
    setSaveStatus("saving");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaveStatus("error"); return; }
    const { data, error } = await supabase.from("cost_plans").insert({
      student_id:         user.id,
      country:            country,
      city:               city && city !== "other" ? city : (customCity || null),
      degree:             degree,
      field_of_study:     field,
      living_style:       living,
      duration_years:     effectiveDuration,
      city_multiplier:    cityMultiplier,
      annual_min:         result.annual.min,
      annual_max:         result.annual.max,
      program_min:        result.program.min,
      program_max:        result.program.max,
      monthly_living_min: result.monthlyLiving.min,
      monthly_living_max: result.monthlyLiving.max,
      affordability:      result.affordability,
    }).select().single();

    if (error || !data) {
      setSaveStatus("error");
      return;
    }
    setSaveStatus("saved");
    setSavedPlans(prev => [data as CostPlan, ...prev]);
  }

  async function handleDeletePlan(id: string) {
    setDeletingId(id);
    const { error } = await supabase.from("cost_plans").delete().eq("id", id);
    if (!error) setSavedPlans(prev => prev.filter(p => p.id !== id));
    setDeletingId(null);
  }

  function handleReset() {
    setCountry(""); setCustomCountry(""); setCity(""); setCustomCity("");
    setDegree(""); setField(""); setLiving("standard");
    setDuration(null); setHasScholarship("maybe"); setCalculated(false);
  }

  function handleCountryChange(v: string) {
    setCountry(v as Country);
    setCity(""); setCustomCity(""); setCalculated(false);
  }

  const affordCfg    = result ? AFFORDABILITY_CONFIG[result.affordability] : null;
  const countryLabel = COUNTRIES.find(c => c.value === country)?.label ?? customCountry ?? "";

  return (
    <PageShell>
      <BlurOrb tone="gold" className="top-[-100px] right-[-100px] w-[500px] h-[500px]" />

      <PageHeader
        eyebrow="Study Cost Planner"
        title={<>What it actually costs.</>}
        subtitle={<>Tuition, rent, life — before you commit.</>}
        actions={
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full hairline bg-white/[0.03]">
            <MapPin className="h-3.5 w-3.5 text-[color:var(--pn-gold)]" />
            <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Costs</span>
          </div>
        }
      />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
        className="space-y-6"
      >

        {/* ── Saved plans history ── */}
        {savedPlans.length > 0 && (
          <motion.div variants={sectionVariants}>
            <HairlineCard>
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-serif text-lg text-foreground leading-tight">Every plan, kept.</h3>
                <span className="ml-auto text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  (<span className="num-display">{savedPlans.length}</span>)
                </span>
              </div>
              <div className="space-y-2">
                {savedPlans.map(plan => {
                  const planTone = AFFORDABILITY_CONFIG[plan.affordability as keyof typeof AFFORDABILITY_CONFIG]?.tone ?? 'gold';
                  return (
                    <div
                      key={plan.id}
                      className="flex items-center gap-3 hairline rounded-lg bg-white/[0.02] px-3 py-2.5"
                    >
                      <span className="text-lg leading-none">{countryFlag(plan.country)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-foreground truncate">
                          {countryName(plan.country)} · {degreeName(plan.degree)}
                        </div>
                        <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-0.5">
                          <span className="num-display">{range(plan.annual_min, plan.annual_max)}</span>/yr · {formatDate(plan.created_at)}
                        </div>
                      </div>
                      <span className={`text-xs shrink-0 px-2 py-0.5 rounded-full ${tonePill(planTone)}`}>
                        {plan.affordability}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeletePlan(plan.id)}
                        disabled={deletingId === plan.id}
                        className="p-1 rounded text-muted-foreground hover:text-[color:var(--pn-pink)] hover:bg-white/[0.03] transition-colors disabled:opacity-40"
                        title="Remove"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </HairlineCard>
          </motion.div>
        )}

        {/* ── Input card ── */}
        <motion.div variants={sectionVariants}>
          <HairlineCard>
            <div className="flex items-center gap-3 mb-6">
              <GraduationCap className="h-5 w-5 text-foreground/60" />
              <div>
                <h2 className="font-serif text-xl text-foreground leading-tight">Your study details.</h2>
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-1">Country, degree, field, style</p>
              </div>
            </div>

            <div className="space-y-5">

              {/* Row 1 — country + degree */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm text-foreground">Target Country</Label>
                  <Select value={country} onValueChange={handleCountryChange}>
                    <SelectTrigger className="bg-white/[0.02] hairline">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map(c => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.flag} {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {isOtherCountry && (
                    <Input
                      placeholder="Enter country name"
                      value={customCountry}
                      onChange={e => setCustomCountry(e.target.value)}
                      className="mt-2 bg-white/[0.02] hairline"
                    />
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm text-foreground">Degree Type</Label>
                  <Select value={degree} onValueChange={v => { setDegree(v as DegreeType); setDuration(null); setCalculated(false); }}>
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
              </div>

              {/* City row */}
              {country && !isOtherCountry && (
                <div className="space-y-1.5">
                  <Label className="text-sm text-foreground">
                    City <span className="text-xs text-muted-foreground">(affects living costs)</span>
                  </Label>
                  <Select value={city} onValueChange={v => { setCity(v); setCustomCity(""); setCalculated(false); }}>
                    <SelectTrigger className="bg-white/[0.02] hairline">
                      <SelectValue placeholder="Select city (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {cityOptions.map(c => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {isOtherCity && (
                    <Input
                      placeholder="Enter city name"
                      value={customCity}
                      onChange={e => setCustomCity(e.target.value)}
                      className="mt-2 bg-white/[0.02] hairline"
                    />
                  )}
                </div>
              )}

              {/* Row 2 — field + duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm text-foreground">Field of Study</Label>
                  <Select value={field} onValueChange={v => { setField(v); setCalculated(false); }}>
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

                <div className="space-y-1.5">
                  <Label className="text-sm text-foreground">
                    Duration (years)
                    {degree && (
                      <span className="ml-1.5 text-xs text-muted-foreground">
                        — default {DEFAULT_DURATION[degree as DegreeType]}
                      </span>
                    )}
                  </Label>
                  <Select
                    value={duration?.toString() ?? ""}
                    onValueChange={v => { setDuration(Number(v)); setCalculated(false); }}
                  >
                    <SelectTrigger className="bg-white/[0.02] hairline">
                      <SelectValue placeholder={degree ? `${DEFAULT_DURATION[degree as DegreeType]} years (default)` : "Select duration"} />
                    </SelectTrigger>
                    <SelectContent>
                      {DURATION_OPTIONS.map(y => (
                        <SelectItem key={y} value={y.toString()}>{y} {y === 1 ? "year" : "years"}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 3 — living style */}
              <div className="space-y-2">
                <Label className="text-sm text-foreground">Living Style</Label>
                <div className="grid grid-cols-3 gap-2">
                  {LIVING_STYLES.map(ls => (
                    <button
                      key={ls.value}
                      type="button"
                      onClick={() => { setLiving(ls.value); setCalculated(false); }}
                      className={`p-3 rounded-lg text-left transition-all hairline ${
                        living === ls.value
                          ? "bg-white/[0.08] text-foreground"
                          : "bg-white/[0.02] text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
                      }`}
                    >
                      <div className="text-sm">{ls.label}</div>
                      <div className="text-xs text-muted-foreground mt-0.5 leading-snug">{ls.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 4 — scholarships */}
              <div className="space-y-2">
                <Label className="text-sm text-foreground">Do you have scholarships?</Label>
                <div className="flex gap-2">
                  {(["yes", "no", "maybe"] as const).map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setHasScholarship(opt)}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm transition-all hairline ${
                        hasScholarship === opt
                          ? "bg-white/[0.08] text-foreground"
                          : "bg-white/[0.02] text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
                      }`}
                    >
                      {opt === "yes" ? "Yes" : opt === "no" ? "No" : "Not sure yet"}
                    </button>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="flex gap-2 pt-1">
                <Button
                  type="button"
                  className="flex-1 bg-[color:var(--pn-gold)]/15 hairline text-[color:var(--pn-gold)] hover:bg-[color:var(--pn-gold)]/25 shadow-none disabled:opacity-40"
                  disabled={!isReady}
                  onClick={() => { if (isReady) setCalculated(true); }}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Plan My Costs
                </Button>
                {calculated && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleReset}
                    title="Reset"
                    className="hairline hover:bg-white/[0.04] text-muted-foreground"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {!isReady && (
                <p className="text-xs font-serif italic text-muted-foreground text-center -mt-1">
                  Select country, degree type, and field of study to continue.
                </p>
              )}
            </div>
          </HairlineCard>
        </motion.div>

        {/* ── Results ── */}
        {result && affordCfg && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
            className="space-y-4"
          >

            {/* Affordability signal */}
            <motion.div variants={sectionVariants}>
              <div
                className="rounded-xl hairline p-4"
                style={{ background: `color-mix(in oklch, ${toneVar(affordCfg.tone)} 8%, transparent)` }}
              >
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: toneVar(affordCfg.tone) }} />
                  <span className="font-serif text-lg leading-tight" style={{ color: toneVar(affordCfg.tone) }}>
                    This is: {affordCfg.label}.
                  </span>
                </div>
                <p className="text-sm font-serif italic mt-1" style={{ color: toneVar(affordCfg.tone), opacity: 0.85 }}>
                  Typical range for international students in {countryLabel}.
                </p>
              </div>
            </motion.div>

            {/* Cost breakdown card */}
            <motion.div variants={sectionVariants}>
              <HairlineCard>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-serif text-xl text-foreground leading-tight">The breakdown.</h2>
                  <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground hairline px-2 py-0.5 rounded-full bg-white/[0.02]">per year</span>
                </div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground flex items-center gap-1 mb-6">
                  <Info className="h-3 w-3" />
                  Based on {result.costs.cityContext}
                </p>

                <div className="space-y-4">
                  {[
                    { label: "Tuition & fees",         icon: <GraduationCap className="h-4 w-4" />, min: result.costs.tuitionMin,         max: result.costs.tuitionMax         },
                    { label: "Rent & housing",         icon: <Home          className="h-4 w-4" />, min: result.costs.rentMin,            max: result.costs.rentMax            },
                    { label: "Food & groceries",       icon: <Utensils      className="h-4 w-4" />, min: result.costs.foodMin,            max: result.costs.foodMax            },
                    { label: "Transportation",        icon: <Bus           className="h-4 w-4" />, min: result.costs.transportMin,       max: result.costs.transportMax       },
                    { label: "Health insurance",      icon: <HeartPulse    className="h-4 w-4" />, min: result.costs.healthInsuranceMin, max: result.costs.healthInsuranceMax },
                    { label: "Visa, flights & travel", icon: <Plane         className="h-4 w-4" />, min: result.costs.visaFlightsMin,     max: result.costs.visaFlightsMax     },
                    { label: "Books & materials",      icon: <BookOpen      className="h-4 w-4" />, min: result.costs.booksMin,           max: result.costs.booksMax           },
                    { label: "Emergency buffer",       icon: <ShieldAlert   className="h-4 w-4" />, min: result.costs.emergencyBufferMin, max: result.costs.emergencyBufferMax },
                  ].map((row, i) => (
                    <CostBar
                      key={row.label}
                      label={row.label}
                      icon={row.icon}
                      min={row.min}
                      max={row.max}
                      totalMax={result.annual.max}
                      tone={COST_TONES[i]}
                    />
                  ))}
                </div>

                <div className="hairline-t mt-6 pt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total per year</span>
                    <span className="num-display text-lg text-foreground">
                      {range(result.annual.min, result.annual.max)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg hairline bg-white/[0.02] px-4 py-2">
                    <span className="text-sm text-muted-foreground">Estimated monthly living</span>
                    <span className="num-display text-sm text-foreground">
                      ~{formatUSD(midpoint(result.monthlyLiving.min, result.monthlyLiving.max))} / month
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg hairline bg-[color:var(--pn-gold)]/8 px-4 py-3">
                    <div>
                      <div className="font-serif text-base text-foreground leading-tight">Total program cost</div>
                      <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-0.5">
                        <span className="num-display">{effectiveDuration}</span> years
                      </div>
                    </div>
                    <span className="num-display text-2xl text-[color:var(--pn-gold)]">
                      {range(result.program.min, result.program.max)}
                    </span>
                  </div>
                </div>

                {/* Save button */}
                <div className="pt-4">
                  {saveStatus === "saved" ? (
                    <Button
                      type="button"
                      disabled
                      className="w-full gap-2 bg-[color:var(--pn-sage)]/15 hairline text-[color:var(--pn-sage)] shadow-none"
                    >
                      <BookmarkCheck className="h-4 w-4" />
                      Plan saved
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full gap-2 hairline hover:bg-white/[0.04] text-foreground"
                      disabled={saveStatus === "saving"}
                      onClick={handleSavePlan}
                    >
                      <Bookmark className="h-4 w-4" />
                      {saveStatus === "saving" ? "Saving…" : saveStatus === "error" ? "Failed — try again" : "Save this plan"}
                    </Button>
                  )}
                </div>
              </HairlineCard>
            </motion.div>

            {/* Context insights */}
            {result.insights.length > 0 && (
              <motion.div variants={sectionVariants}>
                <HairlineCard variant="sage">
                  <div className="flex items-center gap-1.5 text-[color:var(--pn-sage)] text-[10px] uppercase tracking-[0.18em] mb-3">
                    <Lightbulb className="h-3.5 w-3.5" />
                    What this means for you
                  </div>
                  <ul className="space-y-2">
                    {result.insights.map((insight, i) => (
                      <li key={i} className="text-sm font-serif italic text-foreground/85 flex gap-2 leading-relaxed">
                        <span className="mt-0.5 shrink-0 text-[color:var(--pn-sage)]">›</span>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </HairlineCard>
              </motion.div>
            )}

            {/* Scholarship savings */}
            {hasScholarship !== "no" && (
              <motion.div variants={sectionVariants}>
                <HairlineCard variant="sage">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg hairline bg-[color:var(--pn-sage)]/15 mt-0.5">
                      <TrendingDown className="h-4 w-4 text-[color:var(--pn-sage)]" />
                    </div>
                    <div className="flex-1">
                      <div className="font-serif text-lg text-foreground leading-tight">
                        You could shave off{" "}
                        <span className="num-display text-[color:var(--pn-sage)]">
                          {range(result.scholarship.min, result.scholarship.max)}
                        </span>
                        {" "}per year.
                      </div>
                      <p className="text-sm font-serif italic text-muted-foreground mt-1">
                        Based on scholarships available for your degree and destination.
                      </p>
                      <Button
                        type="button"
                        size="sm"
                        className="mt-3 gap-1.5 bg-[color:var(--pn-sage)]/15 hairline text-[color:var(--pn-sage)] hover:bg-[color:var(--pn-sage)]/25 shadow-none"
                        onClick={() => navigate("/scholarship-finder")}
                      >
                        <Trophy className="h-3.5 w-3.5" />
                        View matching scholarships
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </HairlineCard>
              </motion.div>
            )}

            {/* What's next */}
            <motion.div variants={sectionVariants}>
              <HairlineCard>
                <div className="font-serif text-lg text-foreground leading-tight mb-3">Where to next.</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => navigate("/scholarship-finder")}
                    className="flex items-center gap-2 hairline rounded-lg bg-white/[0.02] hover:bg-white/[0.04] px-3 py-3 text-left transition-colors"
                  >
                    <Trophy className="h-4 w-4 text-[color:var(--pn-gold)] shrink-0" />
                    <div>
                      <div className="text-xs text-foreground">Explore Scholarships</div>
                      <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-0.5">Find funding</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/voice-ai")}
                    className="flex items-center gap-2 hairline rounded-lg bg-white/[0.02] hover:bg-white/[0.04] px-3 py-3 text-left transition-colors"
                  >
                    <MessageCircle className="h-4 w-4 text-[color:var(--pn-pink)] shrink-0" />
                    <div>
                      <div className="text-xs text-foreground">Talk to Eva</div>
                      <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-0.5">Personal advice</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/student-dashboard")}
                    className="flex items-center gap-2 hairline rounded-lg bg-white/[0.02] hover:bg-white/[0.04] px-3 py-3 text-left transition-colors"
                  >
                    <LayoutDashboard className="h-4 w-4 text-[color:var(--pn-sage)] shrink-0" />
                    <div>
                      <div className="text-xs text-foreground">Go to Dashboard</div>
                      <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-0.5">Your overview</div>
                    </div>
                  </button>
                </div>
              </HairlineCard>
            </motion.div>

            <p className="text-xs font-serif italic text-muted-foreground text-center pb-2">
              Estimates based on QS, UKCISA, DAAD & Numbeo averages (2024–25). Actual costs vary by institution and city.
            </p>
          </motion.div>
        )}
      </motion.div>
    </PageShell>
  );
}
