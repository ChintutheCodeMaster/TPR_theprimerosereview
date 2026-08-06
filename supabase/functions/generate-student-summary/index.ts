import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { callAI } from "../_shared/ai-client.ts";
import { authenticate, checkRateLimit } from "../_shared/rate-limiter.ts";
import {
  buildSummaryPrompt,
  computeSourceSignature,
  fetchStudentProfileContext,
} from "../_shared/student-profile-generator.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SummarySections {
  who_they_are: string;
  academic_goals: string;
  strengths_values: string;
  talking_points: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, error: authError } = await authenticate(req);
    if (authError) return authError;

    const rateLimitError = await checkRateLimit(userId, "generate-student-summary", 20);
    if (rateLimitError) return rateLimitError;

    const { studentId, force } = await req.json() as { studentId?: string; force?: boolean };

    if (!studentId) {
      return new Response(
        JSON.stringify({ error: "studentId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Authorization: caller must be the student themselves OR an assigned counselor.
    if (userId !== studentId) {
      const { data: assignment, error: assignErr } = await supabase
        .from("student_counselor_assignments")
        .select("id")
        .eq("student_id", studentId)
        .eq("counselor_id", userId)
        .maybeSingle();

      if (assignErr || !assignment) {
        return new Response(
          JSON.stringify({ error: "Not authorized to view this student's summary" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }

    const context = await fetchStudentProfileContext(supabase, studentId);
    const signature = computeSourceSignature(context);

    // Cache lookup
    if (!force) {
      const { data: cached } = await supabase
        .from("student_summaries")
        .select("summary, source_signature, generated_at")
        .eq("student_id", studentId)
        .maybeSingle();

      if (cached && cached.source_signature === signature) {
        return new Response(
          JSON.stringify({
            summary: cached.summary,
            generatedAt: cached.generated_at,
            cached: true,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }

    const { systemPrompt, userPrompt } = buildSummaryPrompt(context);

    const raw = await callAI({
      systemPrompt,
      userPrompt,
      maxTokens: 1500,
      temperature: 0.4,
      fallbackToGemini: true,
    });

    if (!raw) {
      return new Response(
        JSON.stringify({ error: "AI generation failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let summary: SummarySections;
    try {
      const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found");
      summary = JSON.parse(jsonMatch[0]);
    } catch (err) {
      console.error("Failed to parse AI summary:", err, "raw:", raw);
      return new Response(
        JSON.stringify({ error: "Failed to parse AI response" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const generatedAt = new Date().toISOString();

    const { error: upsertErr } = await supabase
      .from("student_summaries")
      .upsert(
        {
          student_id: studentId,
          summary,
          source_signature: signature,
          generated_at: generatedAt,
        },
        { onConflict: "student_id" },
      );

    if (upsertErr) console.error("Failed to cache summary:", upsertErr);

    return new Response(
      JSON.stringify({ summary, generatedAt, cached: false }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Error in generate-student-summary:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
