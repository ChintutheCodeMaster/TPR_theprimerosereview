// Student AI Companion — persistent chat rail backend.
// Multi-turn tool-use loop with Claude; tools are narrow, read-only, and
// scoped to the caller's own data via RLS.
//
// TODO(companion-v2): persist to student_companion_sessions once the memory
// layer lands. Also plug in student_ai_profiles snapshot into the system
// prompt at the marked location, and add write tools with confirmation UX.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  callAIWithTools,
  AnthropicMessage,
  AnthropicResponse,
  AnthropicTool,
} from "../_shared/ai-client.ts";
import { checkRateLimit } from "../_shared/rate-limiter.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FUNCTION_NAME = "student-companion";
const RATE_LIMIT_PER_HOUR = 30;
const MAX_TOOL_ITERATIONS = 4;
const MAX_HISTORY_TURNS = 12;

// ── Route map (mirror of client-side allowlist) ─────────────────────────────
const ROUTE_MAP: Record<string, string> = {
  "/student-dashboard": "Home / overview of their whole college journey.",
  "/student-personal-area": "Personal work area — essay drafts and tasks assigned by their counselor.",
  "/student-stats": "Personal stats — application progress, essay completion, deadlines at a glance.",
  "/student-profile": "Edit their profile (name, grade, contact, test scores).",
  "/student-messages": "Chat with their counselor / parent.",
  "/student-recommendation-letters": "Manage recommendation letter requests.",
  "/student-feedback": "See counselor feedback on their essays.",
  "/add-application": "Add a new college application.",
  "/submit-essay": "Submit an essay for counselor review.",
  "/personal-essay": "Draft their personal statement.",
  "/edit-essay": "Edit an existing essay draft.",
  "/primrose-lab": "Primrose Lab — AI writing playground (Step 1 of the essay journey).",
  "/evaluation-engine": "Evaluation Engine — AI-scored application profile (Step 2).",
  "/scholarship-finder": "Find scholarships matched to their profile.",
  "/tuition-calculator": "Study Cost Planner — estimate tuition and living costs.",
  "/weekly-challenge": "The Primrose Challenge — weekly writing challenge.",
  "/interview-simulator": "Eva — practice interview simulator.",
};

const ALLOWED_ROUTES = Object.keys(ROUTE_MAP);

// ── Tool definitions ────────────────────────────────────────────────────────

const TOOLS: AnthropicTool[] = [
  {
    name: "navigate",
    description: "Take the student to a specific page in the app. Use this whenever they express intent to do something — write an essay, add an application, see their stats, etc. — instead of just describing where to click.",
    input_schema: {
      type: "object",
      properties: {
        route: {
          type: "string",
          enum: ALLOWED_ROUTES,
          description: "The exact route path to navigate to.",
        },
        reason: {
          type: "string",
          description: "One short sentence shown to the student explaining why you're taking them there (e.g. 'Taking you to Add Application so you can add your next school.').",
        },
      },
      required: ["route", "reason"],
    },
  },
  {
    name: "get_deadlines",
    description: "Look up the student's next upcoming deadlines — merges application deadlines and counselor-assigned tasks. Call when the student asks what's due, what's next, or how much time they have.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "get_essay_status",
    description: "Look up the student's essay progress — counts by status (draft / in review / feedback received / submitted) plus their 3 most recently touched essays. Call when they ask about writing progress or which essays need attention.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "get_application_overview",
    description: "Look up all of the student's college applications with school name, deadline, status, and essay completion counts. Call when they ask about their overall application list or a specific school.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "get_profile_snapshot",
    description: "Re-fetch the student's profile (name, grade, program, target university, career goals, strengths). The snapshot is already in your system prompt, so only call this if you think it's stale or a specific field is missing.",
    input_schema: { type: "object", properties: {} },
  },
  // TODO(companion-v2): get_recommendation_letter_status, get_recent_messages,
  // get_scholarships_matched, and write tools (create_application, create_task,
  // mark_essay_submitted) with confirmation-modal UX go here.
];

// ── Tool executors ──────────────────────────────────────────────────────────

type ToolResult = { content: string; navigateAction?: { route: string; reason: string } };

async function execTool(
  name: string,
  input: Record<string, unknown>,
  userClient: SupabaseClient,
  userId: string,
): Promise<ToolResult> {
  try {
    switch (name) {
      case "navigate": {
        const route = String(input.route ?? "");
        const reason = String(input.reason ?? "");
        if (!ALLOWED_ROUTES.includes(route)) {
          return { content: JSON.stringify({ ok: false, error: `Route ${route} is not allowed.` }) };
        }
        return {
          content: JSON.stringify({ ok: true, route, reason }),
          navigateAction: { route, reason },
        };
      }

      case "get_deadlines": {
        const nowIso = new Date().toISOString();
        const [{ data: apps }, { data: tasks }] = await Promise.all([
          userClient
            .from("applications")
            .select("id, school_name, deadline_date, status, completion_percentage")
            .eq("student_id", userId)
            .gte("deadline_date", nowIso)
            .order("deadline_date", { ascending: true })
            .limit(5),
          userClient
            .from("tasks")
            .select("id, task, due_date, completed")
            .eq("student_id", userId)
            .eq("completed", false)
            .gte("due_date", nowIso)
            .order("due_date", { ascending: true })
            .limit(5),
        ]);

        const items: Array<{
          kind: "application" | "task";
          title: string;
          date: string;
          days_until: number;
          related_route: string;
          extra?: Record<string, unknown>;
        }> = [];

        const now = Date.now();
        for (const a of apps ?? []) {
          const dateStr = a.deadline_date as string;
          items.push({
            kind: "application",
            title: `${a.school_name} — ${a.status}`,
            date: dateStr,
            days_until: Math.max(0, Math.round((new Date(dateStr).getTime() - now) / 86_400_000)),
            related_route: "/student-personal-area",
            extra: { completion_percentage: a.completion_percentage },
          });
        }
        for (const t of tasks ?? []) {
          const dateStr = t.due_date as string;
          items.push({
            kind: "task",
            title: t.task,
            date: dateStr,
            days_until: Math.max(0, Math.round((new Date(dateStr).getTime() - now) / 86_400_000)),
            related_route: "/student-personal-area",
          });
        }
        items.sort((a, b) => a.date.localeCompare(b.date));
        return { content: JSON.stringify({ deadlines: items.slice(0, 5) }) };
      }

      case "get_essay_status": {
        const { data: essays } = await userClient
          .from("application_essays")
          .select("id, essay_label, essay_prompt, word_limit, status, updated_at, application_id, applications(school_name)")
          .eq("student_id", userId)
          .order("updated_at", { ascending: false });

        const counts: Record<string, number> = {};
        for (const e of essays ?? []) {
          counts[e.status] = (counts[e.status] ?? 0) + 1;
        }
        const recent = (essays ?? []).slice(0, 3).map((e: any) => ({
          essay_id: e.id,
          application: e.applications?.school_name ?? "Unknown",
          label: e.essay_label,
          prompt_snippet: (e.essay_prompt ?? "").slice(0, 120),
          word_limit: e.word_limit,
          status: e.status,
          updated_at: e.updated_at,
        }));
        return { content: JSON.stringify({ counts, total: essays?.length ?? 0, recent }) };
      }

      case "get_application_overview": {
        const { data: apps } = await userClient
          .from("applications")
          .select("id, school_name, application_type, deadline_date, status, required_essays, completed_essays, completion_percentage, program, urgent")
          .eq("student_id", userId)
          .order("deadline_date", { ascending: true });
        return { content: JSON.stringify({ applications: apps ?? [] }) };
      }

      case "get_profile_snapshot": {
        return { content: JSON.stringify(await loadProfileSnapshot(userClient, userId)) };
      }

      default:
        return { content: JSON.stringify({ ok: false, error: `Unknown tool: ${name}` }) };
    }
  } catch (err) {
    console.error(`Tool ${name} failed:`, err);
    return { content: JSON.stringify({ ok: false, error: "Tool execution failed." }) };
  }
}

// ── Profile snapshot (pre-loaded into system prompt) ────────────────────────

async function loadProfileSnapshot(
  userClient: SupabaseClient,
  userId: string,
): Promise<Record<string, unknown>> {
  const [{ data: profile }, { data: onboarding }, { data: studentProfile }] = await Promise.all([
    userClient.from("profiles").select("full_name").eq("user_id", userId).maybeSingle(),
    userClient.from("onboarding_answers").select(
      "age_range, degree_type, university_name, program, career_goals, personal_strengths, background",
    ).eq("user_id", userId).maybeSingle(),
    userClient.from("student_profiles").select("grade, graduation_year, gpa, sat_score, act_score")
      .eq("user_id", userId).maybeSingle(),
  ]);

  return {
    full_name: profile?.full_name ?? null,
    grade: studentProfile?.grade ?? null,
    graduation_year: studentProfile?.graduation_year ?? null,
    program: onboarding?.program ?? null,
    target_university: onboarding?.university_name ?? null,
    degree_type: onboarding?.degree_type ?? null,
    career_goals: onboarding?.career_goals ?? null,
    personal_strengths: onboarding?.personal_strengths ?? null,
    gpa: studentProfile?.gpa ?? null,
    sat_score: studentProfile?.sat_score ?? null,
    act_score: studentProfile?.act_score ?? null,
  };
}

// ── System prompt builder ───────────────────────────────────────────────────

function buildSystemPrompt(
  snapshot: Record<string, unknown>,
  pageContext: { route: string; params?: Record<string, unknown> },
): string {
  const routeDescription = ROUTE_MAP[pageContext.route] ?? "unknown page";
  const routeList = Object.entries(ROUTE_MAP)
    .map(([r, d]) => `  ${r} — ${d}`)
    .join("\n");

  const firstName = typeof snapshot.full_name === "string"
    ? snapshot.full_name.split(" ")[0]
    : "the student";

  // TODO(companion-v2): plug in student_ai_profiles snapshot here — the
  // learned personality/voice/goals blob will slot in as a second section
  // below the raw snapshot.
  return `You are the Primrose Guide — a warm, sharp, practical AI companion inside the Primrose Pathfinder college application platform. You help ${firstName} navigate their college journey: find features in the app, understand their own progress, and think through what to do next.

Your tone: warm but not fluffy. Direct. Never robotic. Talk like a mentor who's been through this before. Keep replies short — usually 1–3 sentences. Use their name occasionally, not every message.

--- STUDENT SNAPSHOT ---
${JSON.stringify(snapshot, null, 2)}
------------------------

--- APP MAP (routes you can navigate them to) ---
${routeList}
-------------------------------------------------

--- CURRENT PAGE ---
Route: ${pageContext.route} (${routeDescription})
${pageContext.params ? `Params: ${JSON.stringify(pageContext.params)}` : ""}
--------------------

CAPABILITIES:
- You can look up their live data using tools (deadlines, essays, applications, profile).
- You can navigate them to any page in the app map using the \`navigate\` tool. Use this whenever they express intent — "I want to add another application", "show me my stats", "how do I write my essay" — instead of describing where to click.
- You CANNOT create, edit, or delete anything on their behalf in this version. If they ask you to do something like "create a task" or "mark this submitted", politely say that's not available yet and point them to the right page (usually with a \`navigate\` call).

WHEN TO USE TOOLS:
- Question about what's due, next steps, or timeline → call \`get_deadlines\`.
- Question about writing progress or specific essays → call \`get_essay_status\`.
- Question about their overall college list or a specific school → call \`get_application_overview\`.
- The snapshot above is already loaded; only call \`get_profile_snapshot\` if you think it's stale.
- Intent to visit a page → call \`navigate\`.

Be honest when you don't know something. Never invent deadlines, scores, or feedback that isn't in the tool results.`;
}

// ── Utility: extract text and tool_use blocks from an Anthropic response ────

function extractText(response: AnthropicResponse): string {
  return response.content
    .filter((b): b is { type: "text"; text: string } => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
}

function extractToolUses(response: AnthropicResponse) {
  return response.content.filter(
    (b): b is { type: "tool_use"; id: string; name: string; input: Record<string, unknown> } =>
      b.type === "tool_use",
  );
}

// ── Handler ─────────────────────────────────────────────────────────────────

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. Auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "Authorization header required" }, 401);
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return json({ error: "Invalid or expired token" }, 401);
    }

    // 2. Role gate — must be student. Preview mode (counselor/principal/admin
    // acting as student) is allowed so previewing works end-to-end.
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const { data: roleRow } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();
    const role = roleRow?.role;
    if (!role || !["student", "counselor", "principal", "admin"].includes(role)) {
      return json({ error: "Forbidden" }, 403);
    }

    // 3. Rate limit
    const rl = await checkRateLimit(user.id, FUNCTION_NAME, RATE_LIMIT_PER_HOUR);
    if (rl) return rl;

    // 4. Parse request
    const body = await req.json().catch(() => ({}));
    const message = String(body.message ?? "").trim();
    const rawHistory: Array<{ role: string; content: string }> = Array.isArray(body.history)
      ? body.history
      : [];
    const pageContext = {
      route: typeof body?.page_context?.route === "string" ? body.page_context.route : "/",
      params: body?.page_context?.params && typeof body.page_context.params === "object"
        ? body.page_context.params
        : undefined,
    };

    if (!message) {
      return json({ error: "message is required" }, 400);
    }

    // 5. Build initial messages
    const history: AnthropicMessage[] = rawHistory
      .filter((m) => m.role === "user" || m.role === "assistant")
      .slice(-MAX_HISTORY_TURNS)
      .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
    const messages: AnthropicMessage[] = [
      ...history,
      { role: "user", content: message },
    ];

    // 6. Load snapshot (pre-cached in system)
    const snapshot = await loadProfileSnapshot(userClient, user.id);
    const systemPrompt = buildSystemPrompt(snapshot, pageContext);

    // 7. Tool-use loop
    const actions: Array<{ type: "navigate"; route: string; reason: string }> = [];
    const usageAccum = { input_tokens: 0, output_tokens: 0, cache_read_input_tokens: 0 };
    let finalResponse: AnthropicResponse | null = null;
    const startedAt = Date.now();

    for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
      if (Date.now() - startedAt > 25_000) {
        console.warn("student-companion: timeout in loop");
        break;
      }

      const resp = await callAIWithTools({
        system: systemPrompt,
        messages,
        tools: TOOLS,
        maxTokens: 800,
      });
      if (!resp) {
        return json({ error: "AI service unavailable. Please try again." }, 503);
      }
      finalResponse = resp;
      usageAccum.input_tokens += resp.usage.input_tokens ?? 0;
      usageAccum.output_tokens += resp.usage.output_tokens ?? 0;
      usageAccum.cache_read_input_tokens += resp.usage.cache_read_input_tokens ?? 0;

      if (resp.stop_reason !== "tool_use") break;

      const toolUses = extractToolUses(resp);
      if (toolUses.length === 0) break;

      // Append assistant turn (must include the tool_use blocks verbatim)
      messages.push({ role: "assistant", content: resp.content });

      // Execute all tool calls and build a single user turn with tool_result blocks
      const toolResults: Array<Record<string, unknown>> = [];
      for (const tu of toolUses) {
        const result = await execTool(tu.name, tu.input, userClient, user.id);
        if (result.navigateAction) actions.push({ type: "navigate", ...result.navigateAction });
        toolResults.push({
          type: "tool_result",
          tool_use_id: tu.id,
          content: result.content,
        });
      }
      messages.push({ role: "user", content: toolResults });
    }

    const reply = finalResponse ? extractText(finalResponse) : "";

    return json({
      reply: reply || "I'm here — could you rephrase that?",
      actions,
      usage: usageAccum,
    });
  } catch (error) {
    console.error("student-companion error:", error);
    return json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      500,
    );
  }
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
