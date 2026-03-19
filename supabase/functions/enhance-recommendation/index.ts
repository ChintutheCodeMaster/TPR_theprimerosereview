import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { studentAnswers, counselorNotes, teacherAnswers, studentName, refereeName, refereeRole } = await req.json();
    
    const ANTHROPIC_API_KEY2 = Deno.env.get("ANTHROPIC_API_KEY2");
    if (!ANTHROPIC_API_KEY2) {
      throw new Error("ANTHROPIC_API_KEY2 is not configured");
    }

    const systemPrompt = `You are the world's best college counselor and recommendation letter writer. 
Your task is to take the student's information and transform it into a compelling, authentic recommendation letter.

CRITICAL RULES:
1. DO NOT add any information that wasn't provided - only use what the student wrote
2. DO NOT remove any important information - include all key points
3. Write in the voice of the referee (${refereeName}, ${refereeRole})
4. Make it sound natural, warm, and professional
5. Highlight the student's strengths through specific examples they provided
6. Use vivid, descriptive language that brings the student to life
7. Write in Hebrew if the input is in Hebrew, English if in English
8. The letter should be approximately 400-500 words`;

    const userPrompt = `Write a recommendation letter for ${studentName} based on this information:

REFEREE INFORMATION:
- Name: ${refereeName}
- Role: ${refereeRole}

STUDENT'S ANSWERS:
- Relationship Duration: ${studentAnswers.relationshipDuration || 'Not provided'}
- Working Relationship: ${studentAnswers.relationshipCapacity || 'Not provided'}
- Meaningful Project: ${studentAnswers.meaningfulProject || 'Not provided'}
- Best Moment: ${studentAnswers.bestMoment || 'Not provided'}
- Difficulties Overcome: ${studentAnswers.difficultiesOvercome || 'Not provided'}
- Key Strengths: ${studentAnswers.strengths?.join(', ') || 'Not provided'}
- Personal Notes: ${studentAnswers.personalNotes || 'Not provided'}

TEACHER'S OWN OBSERVATIONS:
- A moment that made them proud of the student: ${teacherAnswers?.proudMoment || 'Not provided'}
- Situation in class or school to highlight: ${teacherAnswers?.classHighlight || 'Not provided'}
- Anything else to include: ${teacherAnswers?.anythingElse || 'Not provided'}

ADDITIONAL NOTES FROM THE TEACHER:
${counselorNotes || 'None'}

Write a professional recommendation letter that captures the essence of this student's journey and potential.`;

    console.log("Sending request to Anthropic Claude...");

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
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits to your workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const generatedLetter = data.content?.[0]?.text;

    if (!generatedLetter) {
      throw new Error("No content generated");
    }

    console.log("Letter generated successfully");

    return new Response(JSON.stringify({ letter: generatedLetter }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in enhance-recommendation:", error);
    return new Response(JSON.stringify({ error: error.message || "Failed to generate letter" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
