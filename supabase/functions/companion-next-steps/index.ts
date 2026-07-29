// Generates a short, structured "next steps" checklist for the student
// companion's Path tab. Returns strict JSON so the client can render without
// prompt-parsing gymnastics.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { callAI } from "../_shared/ai-client.ts";
import { checkRateLimit } from "../_shared/rate-limiter.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FUNCTION_NAME = "companion-next-steps";
const RATE_LIMIT_PER_HOUR = 20;

const ALLOWED_ROUTES = [
  "/student-dashboard",
  "/student-personal-area",
  "/student-stats",
  "/student-profile",
  "/add-application",
  "/submit-essay",
  "/personal-essay",
  "/edit-essay",
  "/primrose-lab",
  "/evaluation-engine",
  "/scholarship-finder",
  "/tuition-calculator",
  "/weekly-challenge",
  "/interview-simulator",
];

type ApplicationSnapshot = {
  id: string;
  school_name: string;
  deadline_date: string;
  completion_percentage: number;
  status: string;
};

type NextStep = {
  id: string;
  label: string;
  route?: string;
  status: "todo" | "in_progress" | "done";
};

const SYSTEM_PROMPT = `You are the Primrose Guide's "next steps" generator for a college applications platform.
Given the student's current route and application snapshot, output 3-5 concrete, actionable next steps that would move them forward TODAY.

RULES:
- Return ONLY a JSON object of the form: {"items":[{"id":"...","label":"...","route":"...","status":"todo|in_progress|done"}]}
- No prose, no markdown fences, no commentary.
- Each label must be short (max ~70 chars) and start with a verb.
- Prefer specific steps over generic ones. Reference school names from the snapshot when relevant.
- \`route\` (optional) must be one of the allowed routes. Omit if the step doesn't clearly map to one.
- \`status\`: "done" for anything the snapshot proves is complete; "in_progress" for partially complete work; otherwise "todo".
- Order by urgency (nearest deadlines and blockers first).

ALLOWED_ROUTES: ${JSON.stringify(ALLOWED_ROUTES)}`;

function extractItems(raw: string): NextStep[] | null {
  let s = raw.trim();
  s = s.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
  const start = s.indexOf("{");
  if (start === -1) return null;
  const candidate = s.slice(start);
  try {
    const parsed = JSON.parse(candidate);
    if (Array.isArray(parsed?.items)) {
      return parsed.items
        .filter((it: unknown): it is NextStep => {
          const o = it as Partial<NextStep> | null;
          return !!o && typeof o.label === "string" && typeof o.id === "string";
        })
        .slice(0, 5)
        .map((it: NextStep) => ({
          id: it.id,
          label: it.label,
          route:
            typeof it.route === "string" && ALLOWED_ROUTES.includes(it.route)
              ? it.route
              : undefined,
          status:
            it.status === "done" || it.status === "in_progress" ? it.status : "todo",
        }));
    }
  } catch (_) {
    return null;
  }
  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ── Auth ────────────────────────────────────────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Rate limit ──────────────────────────────────────────
    const limited = await checkRateLimit(user.id, FUNCTION_NAME, RATE_LIMIT_PER_HOUR);
    if (limited) return limited;

    // ── Parse input ─────────────────────────────────────────
    const body = await req.json().catch(() => ({}));
    const route = typeof body?.route === "string" ? body.route : "/student-dashboard";
    const applications: ApplicationSnapshot[] = Array.isArray(body?.applications)
      ? body.applications.slice(0, 20).map((a: Partial<ApplicationSnapshot>) => ({
          id: String(a?.id ?? ""),
          school_name: String(a?.school_name ?? ""),
          deadline_date: String(a?.deadline_date ?? ""),
          completion_percentage: Number(a?.completion_percentage ?? 0),
          status: String(a?.status ?? ""),
        }))
      : [];

    const userPrompt = `CURRENT_ROUTE: ${route}

APPLICATIONS (${applications.length}):
${
  applications.length
    ? applications
        .map(
          (a) =>
            `- ${a.school_name} — due ${a.deadline_date} — ${a.completion_percentage}% — status: ${a.status}`,
        )
        .join("\n")
    : "(none yet)"
}

Return the JSON now.`;

    const raw = await callAI({
      systemPrompt: SYSTEM_PROMPT,
      userPrompt,
      maxTokens: 600,
      temperature: 0.4,
    });

    if (!raw) {
      return new Response(
        JSON.stringify({ error: "AI unavailable" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const items = extractItems(raw);
    if (!items) {
      return new Response(
        JSON.stringify({ error: "Malformed AI response" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ items, generatedAt: Date.now() }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("companion-next-steps error:", err);
    return new Response(
      JSON.stringify({ error: "Unexpected error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
