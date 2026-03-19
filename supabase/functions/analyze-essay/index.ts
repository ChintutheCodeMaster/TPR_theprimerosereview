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
    if (!ANTHROPIC_API_KEY2) {
      console.error("ANTHROPIC_API_KEY2 is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }



    console.log("Analyzing essay with Anthropic Claude...");
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
        system: systemPrompt,
        messages: [
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Anthropic API error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ error: "AI analysis failed" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log("Anthropic response received");

    const content = data.content?.[0]?.text;
    if (!content) {
      console.error("No content in Anthropic response");
      return new Response(
        JSON.stringify({ error: "Empty AI response" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the JSON from the response
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
