import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callAI } from "../_shared/ai-client.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StudentProfile {
  citizenship: string;
  studyCountry: string;
  degreeType: string;
  fieldOfStudy: string;
  gpaRange: string;
  backgroundTags: string[];
}

interface MatchResult {
  scholarshipId: string;
  matchLevel: 'high' | 'possible' | 'reach';
  matchScore: number;
  matchReason: string;
  personalizedTips: string[];
}

/**
 * Robustly extract { matches: [...] } from an LLM response.
 *
 * Handles three failure modes seen in practice:
 *   1. Response wrapped in ```json ... ``` markdown fences
 *   2. Trailing prose after the JSON body
 *   3. Mid-array truncation when the response hits max_tokens — we close
 *      out the last complete object and seal the array/object, returning
 *      whatever full matches we got rather than dropping the whole response.
 */
function extractMatches(raw: string): { matches: MatchResult[] } | null {
  // Strip common markdown fences (```json ... ``` or ``` ... ```)
  let s = raw.trim();
  s = s.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();

  // Locate the opening brace of the outer object.
  const start = s.indexOf('{');
  if (start === -1) return null;
  const candidate = s.slice(start);

  // Fast path: response is well-formed.
  try {
    const parsed = JSON.parse(candidate);
    if (Array.isArray(parsed?.matches)) return parsed;
  } catch (_) {
    // fall through to salvage
  }

  // Salvage path: scan for the "matches" array, collect every COMPLETE
  // object inside it, and ignore anything after the last complete one.
  const matchesIdx = candidate.indexOf('"matches"');
  if (matchesIdx === -1) return null;
  const arrStart = candidate.indexOf('[', matchesIdx);
  if (arrStart === -1) return null;

  const completedObjects: string[] = [];
  let depth = 0;
  let inString = false;
  let escape = false;
  let objStart = -1;

  for (let i = arrStart + 1; i < candidate.length; i++) {
    const c = candidate[i];

    if (inString) {
      if (escape) { escape = false; continue; }
      if (c === '\\') { escape = true; continue; }
      if (c === '"') inString = false;
      continue;
    }
    if (c === '"') { inString = true; continue; }
    if (c === '{') {
      if (depth === 0) objStart = i;
      depth++;
    } else if (c === '}') {
      depth--;
      if (depth === 0 && objStart !== -1) {
        completedObjects.push(candidate.slice(objStart, i + 1));
        objStart = -1;
      }
    } else if (c === ']' && depth === 0) {
      break; // end of array
    }
  }

  const parsedMatches: MatchResult[] = [];
  for (const obj of completedObjects) {
    try {
      const m = JSON.parse(obj);
      if (m && typeof m.scholarshipId === 'string') parsedMatches.push(m);
    } catch (_) {
      // skip malformed individual entry
    }
  }

  return parsedMatches.length > 0 ? { matches: parsedMatches } : null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { profile, scholarshipList } = await req.json() as {
      profile: StudentProfile;
      scholarshipList: string;
    };

    if (!profile || !scholarshipList) {
      return new Response(
        JSON.stringify({ error: "Profile and scholarship list are required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `You are an expert college scholarship advisor with deep knowledge of global scholarship programs. Your job is to analyze a student's profile and match them to the most relevant scholarships from a curated list.

MATCHING RULES:
- "high" match (score 75–100): Student clearly meets the core eligibility criteria (citizenship, degree type, study destination, GPA expectations)
- "possible" match (score 50–74): Student meets most criteria but one factor is uncertain or borderline (e.g. slightly lower GPA, indirect field match)
- "reach" match (score 25–49): Student could apply but faces a significant eligibility gap or high competition
- EXCLUDE: If a scholarship has a hard eligibility wall the student cannot overcome (e.g. must be US citizen and student is not), do NOT include it at all

MATCH REASON: 1–2 sharp sentences explaining WHY this is a match (or stretch). Be specific — reference the student's actual citizenship, field, background tags. Sound like a trusted advisor, not a bot.

PERSONALIZED TIPS: 2–3 concrete, actionable tips for THIS student for THIS scholarship. Reference their specific background (GPA, field, tags). Tips should help them strengthen their application, not generic advice.

IMPORTANT:
- Return between 5 and 10 matches maximum — quality over quantity
- Sort by matchScore descending
- Be honest: if a student with 3.0 GPA applies for Rhodes, it's a reach, say so clearly
- Only return scholarships from the provided list (use the exact ID given)

Return ONLY this JSON, no markdown:
{
  "matches": [
    {
      "scholarshipId": "...",
      "matchLevel": "high|possible|reach",
      "matchScore": 85,
      "matchReason": "...",
      "personalizedTips": ["...", "...", "..."]
    }
  ]
}`;

    const userPrompt = `Student Profile:
- Citizenship: ${profile.citizenship}
- Where they want to study: ${profile.studyCountry}
- Degree level: ${profile.degreeType}
- Field of study: ${profile.fieldOfStudy}
- GPA range: ${profile.gpaRange}
- Background: ${profile.backgroundTags.length > 0 ? profile.backgroundTags.join(', ') : 'No specific tags provided'}

Available Scholarships (one per line, pipe-separated fields):
${scholarshipList}

Analyze the student's profile against each scholarship. Return the top 5–10 most relevant matches with honest match levels, specific reasons, and personalized tips. Exclude any scholarships where the student is categorically ineligible.`;

    const content = await callAI({
      systemPrompt,
      userPrompt,
      maxTokens: 4096,
      fallbackToGemini: true,
      temperature: 0.4,
    });

    if (!content) {
      return new Response(
        JSON.stringify({ error: "AI matching failed" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = extractMatches(content);
    if (!result) {
      console.error("Failed to parse AI response. Raw content (first 500 chars):", content.slice(0, 500));
      return new Response(
        JSON.stringify({ error: "Failed to parse AI matching result" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error in scholarship-match:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
