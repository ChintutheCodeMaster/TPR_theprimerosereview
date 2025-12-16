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
    const { studentAnswers, counselorNotes, studentName, refereeName, refereeRole } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
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

COUNSELOR'S ADDITIONAL NOTES:
${counselorNotes || 'None'}

Write a professional recommendation letter that captures the essence of this student's journey and potential.`;

    console.log("Sending request to Lovable AI...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
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
    const generatedLetter = data.choices?.[0]?.message?.content;

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
