
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY2');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { answers } = await req.json();
    
    if (!anthropicKey) {
      throw new Error('Anthropic API key not configured');
    }

    // Extract key information for a more focused prompt, only if they have values
    const name = answers.name || "the applicant";
    const universities = answers.universities || answers.university_name || "the university";
    const programInfo = answers.program || "the program";
    const fieldOfStudy = answers.field_of_study || "the desired field";
    
    // Build dynamic field list only for fields with actual values
    const dynamicFields = [];
    
    if (answers.background) dynamicFields.push(`- Background: ${answers.background}`);
    if (answers.gender) dynamicFields.push(`- Gender: ${answers.gender}`);
    if (answers.age_range) dynamicFields.push(`- Age Range: ${answers.age_range}`);
    if (answers.degree_type) dynamicFields.push(`- Degree Type: ${answers.degree_type}`);
    if (answers.inspiration) dynamicFields.push(`- Inspiration: ${answers.inspiration}`);
    if (answers.personal_story) dynamicFields.push(`- Personal Story: ${answers.personal_story}`);
    if (answers.degree_interest) dynamicFields.push(`- Degree Interest: ${answers.degree_interest}`);
    if (answers.career_goals) dynamicFields.push(`- Career Goals: ${answers.career_goals}`);
    if (answers.personal_strengths) dynamicFields.push(`- Personal Strengths: ${answers.personal_strengths}`);
    if (answers.years_experience) dynamicFields.push(`- Years Experience: ${answers.years_experience}`);
    
    // Parse answers JSON field if it exists and add non-empty values
    if (answers.answers && typeof answers.answers === 'object') {
      Object.entries(answers.answers).forEach(([key, value]) => {
        if (value && value !== '') {
          dynamicFields.push(`- ${key}: ${value}`);
        }
      });
    }

    // Create a focused system prompt for preview mode (limited information)
    const systemPrompt = `As an admissions expert, create a concise personal statement preview for ${name}, 
    who is applying to ${universities} for ${programInfo} in ${fieldOfStudy}. 
    This is a preview based on initial information - focus on their core motivations and background. 
    Keep it authentic, engaging, and well-structured even with limited details.`;

    const userPrompt = `Background Information:
    - Name: ${name}
    - University: ${universities}
    - Program: ${programInfo}
    - Field: ${fieldOfStudy}
    ${dynamicFields.length > 0 ? dynamicFields.join('\n    ') : ''}

    Please write a compelling personal statement preview that:
    1. Shows authentic voice and personal perspective
    2. Demonstrates clear motivation for the chosen field
    3. Maintains professional academic tone
    4. Stays between 350-650 words
    5. Works well even with limited background information`;

    console.log("Calling Anthropic API to generate basic statement...");
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Anthropic API error:", error);
      throw new Error('Failed to generate personal statement');
    }

    const data = await response.json();
    const personalStatement = data.content[0].text;

    return new Response(
      JSON.stringify({ personalStatement }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error in basic statement generation:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
