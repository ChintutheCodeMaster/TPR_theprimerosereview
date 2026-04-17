import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { essayContent, action } = await req.json();

    if (!essayContent) {
      return new Response(
        JSON.stringify({ error: "Essay content is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const ANTHROPIC_API_KEY2 = Deno.env.get("ANTHROPIC_API_KEY2");
    if (!ANTHROPIC_API_KEY2) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let systemPrompt: string;
    let userPrompt: string;

    if (action === 'ai-detect') {
      systemPrompt = `You are an expert AI content detector. Analyze the given text and determine how likely it is to have been written by AI vs a human.

Return a JSON object with this exact structure:
{
  "aiScore": <number 0-100, where 100 means definitely AI-written>,
  "humanScore": <number 0-100, where 100 means definitely human-written>,
  "confidence": "<low|medium|high>",
  "summary": "<2-3 sentence summary of your assessment>",
  "indicators": [
    {
      "type": "<ai|human>",
      "description": "<specific indicator found in the text>",
      "excerpt": "<short excerpt from the text demonstrating this indicator>"
    }
  ]
}

Look for:
- AI indicators: repetitive structure, generic phrasing, lack of personal anecdotes, overly formal transitions, predictable paragraph structure, hedging language
- Human indicators: personal voice, unique metaphors, inconsistent style, genuine emotion, specific personal details, natural flow breaks

Return ONLY the JSON object, no additional text or markdown.`;

      userPrompt = `Analyze this text for AI-generated content:\n\n---\n${essayContent}\n---`;

    } else if (action === 'sources') {
      systemPrompt = `You are a research assistant and brainstorming partner for college essay writing. Given an essay or essay topic, suggest relevant academic sources, articles, books, and creative brainstorming ideas that could enrich the writing.

Return a JSON object with this exact structure:
{
  "topic": "<identified main topic/theme>",
  "academicSources": [
    {
      "title": "<article/paper title>",
      "author": "<author name>",
      "type": "<journal|book|article|report>",
      "relevance": "<1-2 sentences on how this relates to the essay>",
      "searchQuery": "<Google Scholar search query to find this>"
    }
  ],
  "brainstormingIdeas": [
    {
      "angle": "<creative angle or perspective>",
      "description": "<2-3 sentences explaining this approach>",
      "exampleHook": "<a possible opening sentence using this angle>"
    }
  ],
  "keyThemes": ["<theme1>", "<theme2>", "<theme3>"],
  "suggestedReadings": [
    {
      "title": "<book or essay title>",
      "author": "<author>",
      "why": "<why this is relevant>"
    }
  ]
}

Provide 4-6 academic sources, 3-5 brainstorming ideas, and 3-4 suggested readings.
Return ONLY the JSON object, no additional text or markdown.`;

      userPrompt = `Based on this essay content, suggest sources and brainstorming ideas:\n\n---\n${essayContent}\n---`;

    } else {
      return new Response(
        JSON.stringify({ error: "Invalid action. Use 'ai-detect' or 'sources'" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Essay toolkit action: ${action}, text length: ${essayContent.length}`);

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
    const content = data.content?.[0]?.text;
    if (!content) {
      return new Response(
        JSON.stringify({ error: "Empty AI response" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON found in response:", content);
      return new Response(
        JSON.stringify({ error: "Failed to parse AI response" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    
    const result = JSON.parse(jsonMatch[0]);
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error in essay-toolkit function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
