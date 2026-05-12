import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  GraduationCap, Home, Plane, Calculator, Trophy,
  TrendingDown, Info, ChevronRight, RotateCcw,
} from "lucide-react";
import {
  type Country, type DegreeType, type LivingStyle,
  COUNTRIES, DEGREE_TYPES, LIVING_STYLES, FIELDS_OF_STUDY,
  DURATION_OPTIONS, DEFAULT_DURATION,
  getCosts, getAnnualTotal, getProgramTotal, getAffordability,
  getScholarshipReduction, formatUSD,
} from "@/data/tuitionData";

// ── Affordability config ─────────────────────────────────────────────────────
const AFFORDABILITY_CONFIG = {
  affordable: { label: "Affordable", bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", dot: "bg-emerald-500" },
  moderate:   { label: "Moderate",   bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-700",   dot: "bg-amber-500"   },
  high:       { label: "High Cost",  bg: "bg-rose-50",    border: "border-rose-200",     text: "text-rose-700",    dot: "bg-rose-500"    },
} as const;

// ── Small helpers ────────────────────────────────────────────────────────────
function range(min: number, max: number) {
  return `${formatUSD(min)} – ${formatUSD(max)}`;
}

function midpoint(min: number, max: number) {
  return Math.round((min + max) / 2);
}

// ── Cost bar ─────────────────────────────────────────────────────────────────
interface CostBarProps {
  label: string;
  icon: React.ReactNode;
  min: number;
  max: number;
  totalMax: number;
  color: string;
}

function CostBar({ label, icon, min, max, totalMax, color }: CostBarProps) {
  const pct = Math.round((midpoint(min, max) / totalMax) * 100);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          {icon}
          <span>{label}</span>
        </div>
        <span className="font-medium text-foreground">{range(min, max)}<span className="text-muted-foreground text-xs ml-1">/yr</span></span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function TuitionCalculator() {
  const navigate = useNavigate();

  const [country, setCountry]   = useState<Country | "">("");
  const [degree, setDegree]     = useState<DegreeType | "">("");
  const [field, setField]       = useState<string>("");
  const [living, setLiving]     = useState<LivingStyle>("standard");
  const [duration, setDuration] = useState<number | null>(null);
  const [hasScholarship, setHasScholarship] = useState<"yes" | "no" | "maybe">("maybe");
  const [calculated, setCalculated] = useState(false);

  const isReady = country !== "" && degree !== "" && field !== "";

  const effectiveDuration = duration ?? (degree ? DEFAULT_DURATION[degree as DegreeType] : 2);

  const result = useMemo(() => {
    if (!isReady || !calculated) return null;
    const costs = getCosts(country as Country, degree as DegreeType, living, field, effectiveDuration);
    const annual = getAnnualTotal(costs);
    const program = getProgramTotal(annual, effectiveDuration);
    const annualMid = midpoint(annual.min, annual.max);
    const affordability = getAffordability(annualMid, country as Country);
    const scholarship = getScholarshipReduction(country as Country, degree as DegreeType);
    return { costs, annual, program, affordability, scholarship };
  }, [country, degree, field, living, effectiveDuration, calculated]);

  function handleCalculate() {
    if (isReady) setCalculated(true);
  }

  function handleReset() {
    setCountry(""); setDegree(""); setField("");
    setLiving("standard"); setDuration(null);
    setHasScholarship("maybe"); setCalculated(false);
  }

  const affordCfg = result ? AFFORDABILITY_CONFIG[result.affordability] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* ── Header ── */}
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-sm">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Tuition Calculator</h1>
              <p className="text-sm text-muted-foreground">See what studying abroad will actually cost you</p>
            </div>
          </div>
        </div>

        {/* ── Input card ── */}
        <Card className="shadow-sm border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-foreground">Your Study Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">

            {/* Row 1 — country + degree */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Target Country</Label>
                <Select value={country} onValueChange={(v) => { setCountry(v as Country); setCalculated(false); }}>
                  <SelectTrigger>
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
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Degree Type</Label>
                <Select value={degree} onValueChange={(v) => { setDegree(v as DegreeType); setDuration(null); setCalculated(false); }}>
                  <SelectTrigger>
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

            {/* Row 2 — field + duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Field of Study</Label>
                <Select value={field} onValueChange={(v) => { setField(v); setCalculated(false); }}>
                  <SelectTrigger>
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
                <Label className="text-sm font-medium">
                  Duration (years)
                  {degree && (
                    <span className="ml-1.5 text-xs text-muted-foreground font-normal">
                      — default {DEFAULT_DURATION[degree as DegreeType]}
                    </span>
                  )}
                </Label>
                <Select
                  value={duration?.toString() ?? ""}
                  onValueChange={(v) => { setDuration(Number(v)); setCalculated(false); }}
                >
                  <SelectTrigger>
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
              <Label className="text-sm font-medium">Living Style</Label>
              <div className="grid grid-cols-3 gap-2">
                {LIVING_STYLES.map(ls => (
                  <button
                    key={ls.value}
                    onClick={() => { setLiving(ls.value); setCalculated(false); }}
                    className={`p-3 rounded-lg border text-left transition-all duration-150 ${
                      living === ls.value
                        ? "border-blue-500 bg-blue-50 ring-1 ring-blue-200"
                        : "border-border bg-background hover:border-blue-200 hover:bg-blue-50/40"
                    }`}
                  >
                    <div className="text-sm font-medium">{ls.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 leading-snug">{ls.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Row 4 — scholarships */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Do you have scholarships?</Label>
              <div className="flex gap-2">
                {(["yes", "no", "maybe"] as const).map(opt => (
                  <button
                    key={opt}
                    onClick={() => setHasScholarship(opt)}
                    className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all duration-150 capitalize ${
                      hasScholarship === opt
                        ? "border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                        : "border-border text-muted-foreground hover:border-blue-200"
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
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                disabled={!isReady}
                onClick={handleCalculate}
              >
                <Calculator className="h-4 w-4 mr-2" />
                Calculate my costs
              </Button>
              {calculated && (
                <Button variant="outline" size="icon" onClick={handleReset} title="Reset">
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}
            </div>

            {!isReady && (
              <p className="text-xs text-muted-foreground text-center -mt-1">
                Select country, degree type, and field of study to continue
              </p>
            )}
          </CardContent>
        </Card>

        {/* ── Results ── */}
        {result && affordCfg && (
          <div className="space-y-4">

            {/* Affordability signal */}
            <div className={`rounded-xl border p-4 ${affordCfg.bg} ${affordCfg.border}`}>
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${affordCfg.dot}`} />
                <span className={`text-sm font-semibold ${affordCfg.text}`}>
                  This is considered: {affordCfg.label}
                </span>
              </div>
              <p className={`text-sm mt-1 ${affordCfg.text} opacity-80`}>
                Typical range for students like you studying in {COUNTRIES.find(c => c.value === country)?.label}
              </p>
            </div>

            {/* Cost breakdown card */}
            <Card className="shadow-sm border-border/60">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold">Cost Breakdown</CardTitle>
                  <Badge variant="outline" className="text-xs text-muted-foreground">
                    per year
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <Info className="h-3 w-3" />
                  Based on {result.costs.cityContext}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">

                {/* Bars */}
                <div className="space-y-3">
                  <CostBar
                    label="Tuition"
                    icon={<GraduationCap className="h-4 w-4" />}
                    min={result.costs.tuitionMin}
                    max={result.costs.tuitionMax}
                    totalMax={result.annual.max}
                    color="bg-blue-500"
                  />
                  <CostBar
                    label="Rent & housing"
                    icon={<Home className="h-4 w-4" />}
                    min={result.costs.rentMin}
                    max={result.costs.rentMax}
                    totalMax={result.annual.max}
                    color="bg-violet-500"
                  />
                  <CostBar
                    label="Food"
                    icon={<span className="text-base leading-none">🍽</span>}
                    min={result.costs.foodMin}
                    max={result.costs.foodMax}
                    totalMax={result.annual.max}
                    color="bg-amber-500"
                  />
                  <CostBar
                    label="Transport"
                    icon={<span className="text-base leading-none">🚌</span>}
                    min={result.costs.transportMin}
                    max={result.costs.transportMax}
                    totalMax={result.annual.max}
                    color="bg-teal-500"
                  />
                  <CostBar
                    label="Visa, flights & insurance"
                    icon={<Plane className="h-4 w-4" />}
                    min={result.costs.extrasMin}
                    max={result.costs.extrasMax}
                    totalMax={result.annual.max}
                    color="bg-rose-400"
                  />
                </div>

                <Separator />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total per year</span>
                    <span className="text-lg font-bold text-foreground">
                      {range(result.annual.min, result.annual.max)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-slate-50 border border-border/60 px-4 py-3">
                    <div>
                      <div className="text-sm font-semibold text-foreground">Total program cost</div>
                      <div className="text-xs text-muted-foreground">{effectiveDuration} years</div>
                    </div>
                    <span className="text-xl font-bold text-blue-700">
                      {range(result.program.min, result.program.max)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Scholarship savings card */}
            {hasScholarship !== "no" && (
              <Card className="shadow-sm border-emerald-200 bg-emerald-50/50">
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-emerald-100 mt-0.5">
                      <TrendingDown className="h-4 w-4 text-emerald-700" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-emerald-800">
                        You could reduce this by{" "}
                        {range(result.scholarship.min, result.scholarship.max)} per year
                      </div>
                      <p className="text-xs text-emerald-700 mt-0.5 opacity-80">
                        Based on scholarships available for your degree and destination
                      </p>
                      <Button
                        size="sm"
                        className="mt-3 bg-emerald-700 hover:bg-emerald-800 text-white gap-1.5"
                        onClick={() => navigate("/scholarship-finder")}
                      >
                        <Trophy className="h-3.5 w-3.5" />
                        View matching scholarships
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Assumptions footer */}
            <p className="text-xs text-muted-foreground text-center pb-2">
              Estimates based on QS, UKCISA, DAAD & Numbeo averages (2024–25). Actual costs vary by institution and city.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
