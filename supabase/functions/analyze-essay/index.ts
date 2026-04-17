import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalysisIssue {
  id: string;
  criterionId: string;
  criterionName: string;
  color: string;
  startIndex: number;
  endIndex: number;
  highlightedText: string;
  problemType: string;
  problemDescription: string;
  recommendation: string;
  severity: 'low' | 'medium' | 'high';
}

interface CriterionScore {
  id: string;
  name: string;
  score: number;
  color: string;
}

interface AnalysisResult {
  overallScore: number;
  criteria: CriterionScore[];
  issues: AnalysisIssue[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { essayContent, prompt } = await req.json();

    if (!essayContent) {
      return new Response(
        JSON.stringify({ error: "Essay content is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const ANTHROPIC_API_KEY2 = Deno.env.get("ANTHROPIC_API_KEY2");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!ANTHROPIC_API_KEY2 && !LOVABLE_API_KEY) {
      console.error("No AI API keys configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Essay length:", essayContent.length);

    const systemPrompt = `You are an expert college admissions essay reviewer. Analyze the following personal statement for undergraduate applications.

You must evaluate based on exactly 5 criteria:
1. Personal Voice & Authenticity (color: #8B5CF6 - purple)
2. Storytelling & Structure (color: #F97316 - orange)
3. Self-Reflection & Growth (color: #0EA5E9 - blue)
4. Prompt Alignment (color: #10B981 - green)
5. Grammar & Clarity (color: #EF4444 - red)

For each issue you find, identify:
- The exact text segment that has the issue (must be an exact substring from the essay)
- Which criterion it relates to
- Problem type (e.g., "Weak Opening", "Vague Language", "Missing Reflection")
- Problem description (1-2 sentences explaining the issue)
- Recommendation (specific actionable suggestion)
- Severity (low/medium/high)

Return a JSON object with this exact structure:
{
  "overallScore": <number 0-100>,
  "criteria": [
    {"id": "voice", "name": "Personal Voice & Authenticity", "score": <0-100>, "color": "#8B5CF6"},
    {"id": "storytelling", "name": "Storytelling & Structure", "score": <0-100>, "color": "#F97316"},
    {"id": "reflection", "name": "Self-Reflection & Growth", "score": <0-100>, "color": "#0EA5E9"},
    {"id": "alignment", "name": "Prompt Alignment", "score": <0-100>, "color": "#10B981"},
    {"id": "grammar", "name": "Grammar & Clarity", "score": <0-100>, "color": "#EF4444"}
  ],
  "issues": [
    {
      "id": "<unique-id>",
      "criterionId": "<one of: voice, storytelling, reflection, alignment, grammar>",
      "criterionName": "<full criterion name>",
      "color": "<criterion color>",
      "highlightedText": "<exact text from essay>",
      "problemType": "<short problem type>",
      "problemDescription": "<1-2 sentence description>",
      "recommendation": "<specific actionable recommendation>",
      "severity": "<low|medium|high>"
    }
  ]
}

IMPORTANT:
- The highlightedText must be an EXACT substring from the essay
- Find 5-10 meaningful issues across different criteria
- Be constructive and specific in recommendations
- Return ONLY the JSON object, no additional text or markdown`;

    const userPrompt = `Analyze this personal statement essay${prompt ? ` written for the prompt: "${prompt}"` : ''}:

---
${essayContent}
---`;

    let content: string | null = null;

    // Try Anthropic first
    if (ANTHROPIC_API_KEY2) {
      console.log("Analyzing essay with Anthropic Claude...");
      try {
        const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "x-api-key": ANTHROPIC_API_KEY2,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 4096,
            system: systemPrompt,
            messages: [{ role: "user", content: userPrompt }],
          }),
        });

        if (anthropicResponse.ok) {
          const data = await anthropicResponse.json();
          content = data.content?.[0]?.text ?? null;
          if (content) console.log("Anthropic response received");
          else console.warn("Empty content from Anthropic, falling back to Gemini");
        } else {
          const errorText = await anthropicResponse.text();
          console.warn(`Anthropic API error ${anthropicResponse.status}: ${errorText} — falling back to Gemini`);
        }
      } catch (err) {
        console.warn("Anthropic request failed:", err, "— falling back to Gemini");
      }
    }

    // Fallback to Gemini 2.5 Flash via Lovable gateway
    if (!content && LOVABLE_API_KEY) {
      console.log("Analyzing essay with Gemini 2.5 Flash (fallback)...");
      try {
        const geminiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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

        if (geminiResponse.ok) {
          const data = await geminiResponse.json();
          content = data.choices?.[0]?.message?.content ?? null;
          if (content) console.log("Gemini fallback response received");
          else console.error("Empty content from Gemini fallback");
        } else {
          const errorText = await geminiResponse.text();
          console.error(`Gemini fallback error ${geminiResponse.status}: ${errorText}`);
        }
      } catch (err) {
        console.error("Gemini fallback request failed:", err);
      }
    }

    if (!content) {
      return new Response(
        JSON.stringify({ error: "AI analysis failed" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    
    let analysisResult: AnalysisResult;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      console.error("Raw content:", content);
      return new Response(
        JSON.stringify({ error: "Failed to parse AI analysis" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate and find actual positions in the essay
    const validatedIssues = analysisResult.issues
      .map((issue, index) => {
        const startIndex = essayContent.indexOf(issue.highlightedText);
        if (startIndex === -1) {
          console.log(`Issue ${index} text not found exactly, skipping:`, issue.highlightedText.substring(0, 50));
          return null;
        }
        return {
          ...issue,
          id: `issue-${index}`,
          startIndex,
          endIndex: startIndex + issue.highlightedText.length,
        };
      })
      .filter(Boolean);

    console.log(`Validated ${validatedIssues.length} of ${analysisResult.issues.length} issues`);

    const result: AnalysisResult = {
      overallScore: analysisResult.overallScore,
      criteria: analysisResult.criteria,
      issues: validatedIssues as AnalysisIssue[],
    };

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error in analyze-essay function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
