// Static cost tables for Tuition Calculator (V1 — no API needed).
// All figures in USD per year. Sources: QS World University Rankings cost guides,
// Numbeo cost-of-living data, UKCISA, DAAD, and US News averages (2024–25).

export type Country = "us" | "uk" | "europe";
export type DegreeType = "undergrad" | "masters" | "mba";
export type LivingStyle = "budget" | "standard" | "premium";
export type AffordabilityLevel = "affordable" | "moderate" | "high";

export interface CostBreakdown {
  tuitionMin: number;
  tuitionMax: number;
  rentMin: number;
  rentMax: number;
  foodMin: number;
  foodMax: number;
  transportMin: number;
  transportMax: number;
  // one-off costs (visa + flights + insurance — annualised over duration)
  extrasMin: number;
  extrasMax: number;
  durationYears: number;
  cityContext: string; // shown as "Based on average rent in …"
}

export interface ScholarshipReduction {
  min: number;
  max: number;
}

// ── Duration defaults ────────────────────────────────────────────────────────
export const DEFAULT_DURATION: Record<DegreeType, number> = {
  undergrad: 4,
  masters: 2,
  mba: 2,
};

// ── Tuition by country × degree ─────────────────────────────────────────────
// Living costs multiplied by LIVING_MULTIPLIER[style] when building output.
const BASE_COSTS: Record<Country, Record<DegreeType, Omit<CostBreakdown, "durationYears">>> = {
  us: {
    undergrad: {
      tuitionMin: 25_000, tuitionMax: 55_000,
      rentMin: 8_400, rentMax: 18_000,
      foodMin: 3_000, foodMax: 5_500,
      transportMin: 600, transportMax: 1_800,
      extrasMin: 2_000, extrasMax: 3_500,
      cityContext: "major US university cities (Boston, NYC, LA)",
    },
    masters: {
      tuitionMin: 20_000, tuitionMax: 50_000,
      rentMin: 9_000, rentMax: 18_000,
      foodMin: 3_000, foodMax: 5_500,
      transportMin: 600, transportMax: 1_800,
      extrasMin: 1_800, extrasMax: 3_000,
      cityContext: "major US university cities",
    },
    mba: {
      tuitionMin: 40_000, tuitionMax: 80_000,
      rentMin: 12_000, rentMax: 22_000,
      foodMin: 4_000, foodMax: 7_000,
      transportMin: 800, transportMax: 2_000,
      extrasMin: 2_500, extrasMax: 4_000,
      cityContext: "major US business school cities",
    },
  },
  uk: {
    undergrad: {
      tuitionMin: 14_000, tuitionMax: 28_000,
      rentMin: 7_200, rentMax: 16_800,
      foodMin: 2_500, foodMax: 4_500,
      transportMin: 700, transportMax: 1_500,
      extrasMin: 1_500, extrasMax: 2_800,
      cityContext: "UK university cities (London range shown)",
    },
    masters: {
      tuitionMin: 15_000, tuitionMax: 32_000,
      rentMin: 8_400, rentMax: 18_000,
      foodMin: 2_500, foodMax: 4_500,
      transportMin: 700, transportMax: 1_500,
      extrasMin: 1_500, extrasMax: 2_800,
      cityContext: "UK university cities",
    },
    mba: {
      tuitionMin: 35_000, tuitionMax: 65_000,
      rentMin: 12_000, rentMax: 22_000,
      foodMin: 3_000, foodMax: 5_500,
      transportMin: 900, transportMax: 1_800,
      extrasMin: 2_000, extrasMax: 3_500,
      cityContext: "London & major UK business school cities",
    },
  },
  europe: {
    undergrad: {
      tuitionMin: 1_000, tuitionMax: 15_000,
      rentMin: 5_400, rentMax: 12_000,
      foodMin: 2_200, foodMax: 4_000,
      transportMin: 400, transportMax: 1_000,
      extrasMin: 1_200, extrasMax: 2_500,
      cityContext: "continental Europe (Germany / Netherlands / Spain averages)",
    },
    masters: {
      tuitionMin: 1_500, tuitionMax: 18_000,
      rentMin: 6_000, rentMax: 13_200,
      foodMin: 2_400, foodMax: 4_200,
      transportMin: 400, transportMax: 1_000,
      extrasMin: 1_200, extrasMax: 2_500,
      cityContext: "continental Europe university cities",
    },
    mba: {
      tuitionMin: 20_000, tuitionMax: 50_000,
      rentMin: 8_400, rentMax: 15_600,
      foodMin: 3_000, foodMax: 5_000,
      transportMin: 600, transportMax: 1_200,
      extrasMin: 1_800, extrasMax: 3_000,
      cityContext: "continental Europe business school cities",
    },
  },
};

// ── Living style multipliers (applied to rent/food/transport) ────────────────
const LIVING_MULTIPLIER: Record<LivingStyle, number> = {
  budget: 0.75,
  standard: 1.0,
  premium: 1.35,
};

// ── Scholarship reduction estimates ─────────────────────────────────────────
const SCHOLARSHIP_REDUCTION: Record<Country, Record<DegreeType, ScholarshipReduction>> = {
  us: {
    undergrad: { min: 5_000, max: 25_000 },
    masters: { min: 5_000, max: 20_000 },
    mba: { min: 10_000, max: 30_000 },
  },
  uk: {
    undergrad: { min: 3_000, max: 12_000 },
    masters: { min: 5_000, max: 20_000 },
    mba: { min: 8_000, max: 20_000 },
  },
  europe: {
    undergrad: { min: 2_000, max: 8_000 },
    masters: { min: 3_000, max: 12_000 },
    mba: { min: 5_000, max: 15_000 },
  },
};

// ── Affordability thresholds (total annual cost in USD) ──────────────────────
const AFFORDABILITY_THRESHOLDS: Record<Country, { affordable: number; moderate: number }> = {
  us:     { affordable: 35_000, moderate: 60_000 },
  uk:     { affordable: 28_000, moderate: 50_000 },
  europe: { affordable: 18_000, moderate: 35_000 },
};

// ── Field of study tuition modifier ─────────────────────────────────────────
// Some fields cost significantly more — apply a multiplier to the tuition range.
export const FIELD_MODIFIERS: Record<string, number> = {
  "Medicine / Health Sciences": 1.5,
  "Law": 1.3,
  "Business / Finance": 1.2,
  "Engineering / CS": 1.1,
  "Arts / Humanities": 0.95,
  "Social Sciences": 1.0,
  "Natural Sciences": 1.0,
  "Education": 0.9,
};

export const FIELDS_OF_STUDY = Object.keys(FIELD_MODIFIERS);

// ── Helpers ──────────────────────────────────────────────────────────────────

export function getCosts(
  country: Country,
  degree: DegreeType,
  living: LivingStyle,
  field: string,
  durationYears: number
): CostBreakdown {
  const base = BASE_COSTS[country][degree];
  const lm = LIVING_MULTIPLIER[living];
  const fm = FIELD_MODIFIERS[field] ?? 1.0;

  return {
    tuitionMin: Math.round(base.tuitionMin * fm),
    tuitionMax: Math.round(base.tuitionMax * fm),
    rentMin: Math.round(base.rentMin * lm),
    rentMax: Math.round(base.rentMax * lm),
    foodMin: Math.round(base.foodMin * lm),
    foodMax: Math.round(base.foodMax * lm),
    transportMin: Math.round(base.transportMin * lm),
    transportMax: Math.round(base.transportMax * lm),
    extrasMin: base.extrasMin,
    extrasMax: base.extrasMax,
    durationYears,
    cityContext: base.cityContext,
  };
}

export function getAnnualTotal(c: CostBreakdown): { min: number; max: number } {
  return {
    min: c.tuitionMin + c.rentMin + c.foodMin + c.transportMin + c.extrasMin,
    max: c.tuitionMax + c.rentMax + c.foodMax + c.transportMax + c.extrasMax,
  };
}

export function getProgramTotal(
  annual: { min: number; max: number },
  years: number
): { min: number; max: number } {
  return { min: annual.min * years, max: annual.max * years };
}

export function getAffordability(
  annualMidpoint: number,
  country: Country
): AffordabilityLevel {
  const { affordable, moderate } = AFFORDABILITY_THRESHOLDS[country];
  if (annualMidpoint <= affordable) return "affordable";
  if (annualMidpoint <= moderate) return "moderate";
  return "high";
}

export function getScholarshipReduction(
  country: Country,
  degree: DegreeType
): ScholarshipReduction {
  return SCHOLARSHIP_REDUCTION[country][degree];
}

export function formatUSD(n: number): string {
  return "$" + n.toLocaleString("en-US");
}

// ── Select options ───────────────────────────────────────────────────────────
export const COUNTRIES: { value: Country; label: string; flag: string }[] = [
  { value: "us", label: "United States", flag: "🇺🇸" },
  { value: "uk", label: "United Kingdom", flag: "🇬🇧" },
  { value: "europe", label: "Europe", flag: "🇪🇺" },
];

export const DEGREE_TYPES: { value: DegreeType; label: string }[] = [
  { value: "undergrad", label: "Undergraduate (Bachelor's)" },
  { value: "masters", label: "Master's Degree" },
  { value: "mba", label: "MBA" },
];

export const LIVING_STYLES: { value: LivingStyle; label: string; description: string }[] = [
  { value: "budget", label: "Budget", description: "Shared housing, cook at home, public transit" },
  { value: "standard", label: "Standard", description: "Typical student lifestyle" },
  { value: "premium", label: "Premium", description: "Private room, dining out, rideshares" },
];

export const DURATION_OPTIONS = [1, 2, 3, 4, 5];
