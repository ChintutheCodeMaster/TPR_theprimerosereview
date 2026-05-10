import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StoryScore {
  authenticity: number;
  clarity: number;
  depth: number;
  uniqueness: number;
  overall: number;
}

interface UniversityFit {
  name: string;
  fitScore: number;
  strengths: string[];
  gaps: string[];
  verdict: string;
}

interface RoadmapItem {
  priority: 'critical' | 'recommended' | 'polish';
  title: string;
  description: string;
}

interface EvaluationResult {
  storyScore: StoryScore;
  universityFit: UniversityFit[];
  roadmap: RoadmapItem[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { essayContent, universities } = await req.json();

    if (!essayContent || !essayContent.trim()) {
      return new Response(
        JSON.stringify({ error: "Essay content is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!universities || !Array.isArray(universities) || universities.length === 0) {
      return new Response(
        JSON.stringify({ error: "At least one university is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const ANTHROPIC_API_KEY2 = Deno.env.get("ANTHROPIC_API_KEY2");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!ANTHROPIC_API_KEY2 && !LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const wordCount = essayContent.trim().split(/\s+/).filter(Boolean).length;
    console.log(`Evaluating essay (${wordCount} words) for: ${universities.join(', ')}`);

    const systemPrompt = `You are a brutally honest college admissions essay evaluator with 20 years of experience. You do NOT predict admission odds. You evaluate narrative quality and university fit only.

STORY SCORE RUBRIC (score each 0–100):
- Authenticity: Does this feel like a real person wrote it? Penalise clichés, generic phrases, AI-sounding structure. Reward specific sensory details, vulnerability, idiosyncratic voice.
- Clarity: Is the narrative focused? Does the reader know within 3 sentences what this essay is about? Penalise tangents, unclear transitions, essays covering too many themes.
- Depth: Does the student reflect on WHY the experience mattered, not just WHAT happened? Penalise surface-level takeaways. Reward worldview shifts, identity insight, genuine growth.
- Uniqueness: Could 1000 other applicants have written this exact essay? Penalise common topics handled predictably. Reward unusual angles on any topic, including common ones.
- Overall = (authenticity × 0.30) + (clarity × 0.20) + (depth × 0.30) + (uniqueness × 0.20), rounded to nearest integer.

UNIVERSITY FIT RUBRIC (per university):
Use your deep knowledge of each university's culture, admissions values, and what makes essays resonate there:
- Yale: intellectual curiosity, community engagement, humanistic breadth, collaborative spirit
- MIT: problem-solving mindset, intellectual risk-taking, builder/maker identity, technical passion with humanity
- Harvard: leadership, moral seriousness, impact at scale, intellectual breadth
- Stanford: authentic drive, changing-the-world narrative, entrepreneurial spirit, unconventional thinking
- Princeton: academic depth, commitment to service, curiosity about ideas, genuine intellectual passion
- Columbia: intellectual openness, urban curiosity, interdisciplinary thinking, core curriculum alignment
- For any other university: apply your knowledge of their stated mission, culture, and admissions philosophy

fitScore: 70+ = genuine alignment. 40–69 = neutral/weak. Below 40 = misalignment.
Strengths and gaps must be SPECIFIC to this essay and this university — not generic advice.

ROADMAP RULES:
- critical (1–3 items max): Issues actively hurting the essay right now — address immediately
- recommended (2–4 items): Meaningful improvements that would strengthen the essay
- polish (1–3 items): Fine-tuning once the above are addressed

STRICT RULES:
- Never suggest rewriting or provide sample sentences
- Never mention admission statistics, acceptance rates, or probabilities
- Honest scores build trust — do not inflate scores to be encouraging
- Each strength and gap must reference something specific from the essay

Return ONLY this exact JSON structure, no markdown, no extra text:
{
  "storyScore": {
    "authenticity": <0-100>,
    "clarity": <0-100>,
    "depth": <0-100>,
    "uniqueness": <0-100>,
    "overall": <weighted average as integer>
  },
  "universityFit": [
    {
      "name": "<university name exactly as provided>",
      "fitScore": <0-100>,
      "strengths": ["<specific strength tied to this university's values>", "<another strength>"],
      "gaps": ["<specific gap tied to this university's values>", "<another gap>"],
      "verdict": "<one honest sentence, max 20 words>"
    }
  ],
  "roadmap": [
    {
      "priority": "<critical|recommended|polish>",
      "title": "<6-8 word title>",
      "description": "<2-3 sentence actionable description, no sample sentences>"
    }
  ]
}`;

    const userPrompt = `Evaluate this college admissions essay for: ${universities.join(', ')}.
Word count: ${wordCount}

---ESSAY START---
${essayContent}
---ESSAY END---

Apply the rubrics precisely. Be honest. Return only the JSON.`;

    let content: string | null = null;

    if (ANTHROPIC_API_KEY2) {
      console.log("Calling Anthropic Claude...");
      try {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "x-api-key": ANTHROPIC_API_KEY2,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 4096,
            system: [{ type: "text", text: systemPrompt, cache_control: { type: "ephemeral" } }],
            messages: [{ role: "user", content: userPrompt }],
          }),
        });

        if (response.ok) {
          const data = await response.json();
          content = data.content?.[0]?.text ?? null;
          if (content) console.log("Anthropic response received");
          else console.warn("Empty content from Anthropic, falling back");
        } else {
          const err = await response.text();
          console.warn(`Anthropic error ${response.status}: ${err} — falling back`);
        }
      } catch (err) {
        console.warn("Anthropic request failed:", err, "— falling back");
      }
    }

    if (!content && LOVABLE_API_KEY) {
      console.log("Calling Gemini fallback...");
      try {
        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            temperature: 0.7,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          content = data.choices?.[0]?.message?.content ?? null;
          if (content) console.log("Gemini fallback response received");
          else console.error("Empty content from Gemini fallback");
        } else {
          const err = await response.text();
          console.error(`Gemini fallback error ${response.status}: ${err}`);
        }
      } catch (err) {
        console.error("Gemini fallback failed:", err);
      }
    }

    if (!content) {
      return new Response(
        JSON.stringify({ error: "AI evaluation failed" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let result: EvaluationResult;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      console.error("Raw content:", content);
      return new Response(
        JSON.stringify({ error: "Failed to parse AI evaluation" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error in evaluation-engine:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
