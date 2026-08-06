import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export interface VoiceInsight {
  category: string;
  title: string;
  content: string;
}

export interface VoiceInsightRow {
  insights: VoiceInsight[];
  quality: string | null;
  created_at: string;
}

export interface OnboardingRow {
  answers: Record<string, unknown> | null;
  gender: string | null;
  age_range: string | null;
  degree_type: string | null;
  degree_interest: string | null;
  inspiration: string | null;
  personal_story: string | null;
  university_name: string | null;
  program: string | null;
  background: string | null;
  career_goals: string | null;
  personal_strengths: string | null;
  years_experience: string | null;
  updated_at: string | null;
}

export interface StudentProfileContext {
  studentId: string;
  studentName: string | null;
  onboarding: OnboardingRow | null;
  voiceInsightRows: VoiceInsightRow[];
}

export async function fetchStudentProfileContext(
  supabase: SupabaseClient,
  studentId: string,
): Promise<StudentProfileContext> {
  const [profileRes, onboardingRes, insightsRes] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("user_id", studentId).maybeSingle(),
    supabase
      .from("onboarding_answers")
      .select(
        "answers, gender, age_range, degree_type, degree_interest, inspiration, personal_story, university_name, program, background, career_goals, personal_strengths, years_experience, updated_at",
      )
      .eq("user_id", studentId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("voice_insights")
      .select("insights, quality, created_at")
      .eq("student_id", studentId)
      .order("created_at", { ascending: false }),
  ]);

  return {
    studentId,
    studentName: profileRes.data?.full_name ?? null,
    onboarding: (onboardingRes.data as OnboardingRow | null) ?? null,
    voiceInsightRows: (insightsRes.data as VoiceInsightRow[] | null) ?? [],
  };
}

// Stable signature of the source rows. If nothing changed upstream, the cache is valid.
export function computeSourceSignature(context: StudentProfileContext): string {
  const parts: string[] = [];
  parts.push(`o:${context.onboarding?.updated_at ?? "none"}`);
  parts.push(
    `v:${context.voiceInsightRows.map((r) => r.created_at).join(",") || "none"}`,
  );
  return parts.join("|");
}

function formatOnboarding(o: OnboardingRow | null): string {
  if (!o) return "(no onboarding answers on file)";
  const lines: string[] = [];
  const push = (label: string, value: string | null | undefined) => {
    if (value && String(value).trim()) lines.push(`- ${label}: ${value}`);
  };
  push("Gender", o.gender);
  push("Age range", o.age_range);
  push("Degree type", o.degree_type);
  push("Degree interest / motivation", o.degree_interest);
  push("Inspiration", o.inspiration);
  push("Personal story", o.personal_story);
  push("Background", o.background);
  push("Career goals", o.career_goals);
  push("Personal strengths", o.personal_strengths);
  push("Years experience", o.years_experience);
  push("Target university", o.university_name);
  push("Program", o.program);

  if (o.answers && typeof o.answers === "object") {
    for (const [key, value] of Object.entries(o.answers)) {
      if (value === null || value === undefined || value === "") continue;
      const rendered = typeof value === "string" ? value : JSON.stringify(value);
      lines.push(`- ${key}: ${rendered}`);
    }
  }

  return lines.length ? lines.join("\n") : "(no onboarding answers on file)";
}

function formatVoiceInsights(rows: VoiceInsightRow[]): string {
  if (!rows.length) return "(no Eva voice conversations on file)";
  const flat: string[] = [];
  for (const row of rows) {
    if (!Array.isArray(row.insights)) continue;
    for (const ins of row.insights) {
      flat.push(`- [${ins.category}] ${ins.title}: ${ins.content}`);
    }
  }
  return flat.length ? flat.join("\n") : "(voice conversations exist but no insights were extracted)";
}

const SYSTEM_PROMPT = `You are an assistant that writes concise, warm, counselor-facing snapshots of high school students preparing for college applications.

You will receive two sources about one student:
1. ONBOARDING ANSWERS — self-reported background, story, goals, and strengths.
2. VOICE INSIGHTS — structured observations extracted from prior voice conversations with Eva (an AI coach).

Your job is to synthesize these into a single JSON object with exactly four sections. Be specific and grounded — only claim things that appear in the sources. If a section has thin data, keep it short and honest rather than inventing.

Voice: second-person about the student ("She has…", "He wants…" or "They…"). Warm, professional, no cliches, no bullet lists inside the strings. 2–4 sentences per section.

Return ONLY valid JSON in this exact shape, no markdown, no other text:
{
  "who_they_are": "…",
  "academic_goals": "…",
  "strengths_values": "…",
  "talking_points": "…"
}

Section guide:
- who_they_are — background, personality, formative story, what makes them tick
- academic_goals — intended major/degree, career direction, target schools if known
- strengths_values — top strengths, values, what drives them
- talking_points — 2–4 concrete angles the counselor could raise: questions to ask, where they may need support, potential essay themes. Write as prose, not a list.

If BOTH sources are essentially empty, return sections that acknowledge limited data (e.g. "Limited information available yet — onboarding is incomplete and no voice conversations on file.").`;

export function buildSummaryPrompt(context: StudentProfileContext): {
  systemPrompt: string;
  userPrompt: string;
} {
  const name = context.studentName ?? "This student";
  const userPrompt = `Student: ${name}

=== ONBOARDING ANSWERS ===
${formatOnboarding(context.onboarding)}

=== VOICE INSIGHTS (from Eva conversations) ===
${formatVoiceInsights(context.voiceInsightRows)}

Write the four-section JSON snapshot now.`;

  return { systemPrompt: SYSTEM_PROMPT, userPrompt };
}
