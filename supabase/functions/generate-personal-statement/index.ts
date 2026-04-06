
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY2');

// Initialize Supabase client for authentication validation
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

console.log(`Anthropic API Key available: ${anthropicKey ? 'Yes (length: ' + anthropicKey.length + ')' : 'No'}`);
if (!anthropicKey) {
  console.error("Anthropic API key is missing! Please set ANTHROPIC_API_KEY2 in your environment variables.");
}

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
    // Validate authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role for JWT validation
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify JWT token and get user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Rate limiting: 10 requests per hour per user
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    const { data: recentRequests, error: rateLimitError } = await supabase
      .from('api_usage_log')
      .select('id')
      .eq('user_id', user.id)
      .eq('function_name', 'generate-personal-statement')
      .gte('created_at', oneHourAgo.toISOString())
      .limit(11); // Check for 11 to see if limit exceeded

    if (rateLimitError) {
      console.error('Error checking rate limit:', rateLimitError);
      // Continue anyway - don't block on rate limit check failure
    } else if (recentRequests && recentRequests.length >= 10) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again in an hour.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log this request for rate limiting
    const { error: logError } = await supabase
      .from('api_usage_log')
      .insert({
        user_id: user.id,
        function_name: 'generate-personal-statement',
        created_at: now.toISOString()
      });

    if (logError) {
      console.error('Error logging API usage:', logError);
      // Continue anyway - don't block on logging failure
    }

    const { answers } = await req.json();
    
    if (!answers || typeof answers !== 'object') {
      return new Response(
        JSON.stringify({ error: 'No answers provided or invalid format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!anthropicKey) {
      return new Response(
        JSON.stringify({ error: 'Anthropic API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build dynamic field list only for fields with actual values
    const dynamicFields = [];
    
    if (answers.gender) dynamicFields.push(`- Gender: ${answers.gender}`);
    if (answers.age_range) dynamicFields.push(`- Age: ${answers.age_range}`);
    if (answers.degree_type) dynamicFields.push(`- Degree Type: ${answers.degree_type}`);
    if (answers.inspiration) dynamicFields.push(`- Inspiration: ${answers.inspiration}`);
    if (answers.personal_story || answers.challenge) {
      dynamicFields.push(`- Personal Story (free text): ${answers.personal_story || answers.challenge}`);
    }
    if (answers.degree_interest) dynamicFields.push(`- Motivation for this degree (free text): ${answers.degree_interest}`);
    if (answers.universities || answers.university_name) {
      dynamicFields.push(`- University: ${answers.universities || answers.university_name}`);
    }
    if (answers.background) dynamicFields.push(`- Background: ${answers.background}`);
    if (answers.career_goals) dynamicFields.push(`- Career Goals: ${answers.career_goals}`);
    if (answers.personal_strengths) dynamicFields.push(`- Personal Strengths: ${answers.personal_strengths}`);
    if (answers.years_experience) dynamicFields.push(`- Years Experience: ${answers.years_experience}`);
    if (answers.program) dynamicFields.push(`- Program: ${answers.program}`);
    if (answers.field_of_study) dynamicFields.push(`- Field of Study: ${answers.field_of_study}`);
    
    // Parse answers JSON field if it exists and add non-empty values
    if (answers.answers && typeof answers.answers === 'object') {
      Object.entries(answers.answers).forEach(([key, value]) => {
        if (value && value !== '') {
          dynamicFields.push(`- ${key}: ${value}`);
        }
      });
    }

    // Build our prompt
    const prompt = `Using the following user-provided inputs:
${dynamicFields.length > 0 ? dynamicFields.join('\n') : '- No additional details provided'}

Write a professional and compelling personal statement suitable for a university application. 

You must:
- Use the free-text responses ("personal story" and "motivation") directly in the essay. Integrate their language and content authentically and meaningfully.
- Base the narrative on the user's background and personal inputs.

Ensure the statement follows these criteria:
1. Clarity and Focus – Answers the question clearly and stays on topic.
2. Structure and Organization – Has a logical flow with introduction, body, and conclusion.
3. Content and Originality – Demonstrates unique insights and perspective.
4. Grammar and Style – Is grammatically correct and written in a formal, effective style.
5. Relevance and Examples – Uses concrete examples (especially from the user's own input).
6. Personal Voice – Sounds authentic and reflects the user's own experience and voice.
7. University-Specific Criteria – Adapt if ${answers.universities || answers.university_name || 'the university'} is specified.
8. Word Count Compliance – Stay between 350 to 650 words if no other limit is given.`;

    console.log("Calling Anthropic API to generate personal statement");

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
        system: 'You are an expert at writing compelling personal statements for university applications. You create highly personalized, authentic statements that showcase the applicant\'s unique story, motivations, and fit for their chosen program.',
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Anthropic API error:", errorData);
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit reached. Please try again shortly.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      return new Response(
        JSON.stringify({ error: 'Failed to generate personal statement', details: errorData }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const personalStatement = data.content[0].text;
    console.log("Successfully generated personal statement");

    return new Response(
      JSON.stringify({ personalStatement }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error in generate-personal-statement function:", error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
