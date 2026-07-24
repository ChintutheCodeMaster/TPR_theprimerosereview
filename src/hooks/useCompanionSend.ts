import { supabase } from "@/integrations/supabase/client";

export type CompanionMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  actions?: Array<{ type: "navigate"; route: string; reason: string }>;
  isNudge?: boolean;
  isError?: boolean;
  createdAt: number;
};

export type CompanionSendResult = {
  reply: string;
  actions: Array<{ type: "navigate"; route: string; reason: string }>;
  usage?: { input_tokens: number; output_tokens: number; cache_read_input_tokens?: number };
};

export type CompanionSendError = { status?: number; message: string };

export async function sendCompanionMessage(input: {
  message: string;
  history: Array<{ role: "user" | "assistant"; content: string }>;
  pageContext: { route: string; params?: Record<string, unknown> };
}): Promise<{ ok: true; data: CompanionSendResult } | { ok: false; error: CompanionSendError }> {
  try {
    const { data, error } = await supabase.functions.invoke("student-companion", {
      body: {
        message: input.message,
        history: input.history,
        page_context: input.pageContext,
      },
    });

    if (error) {
      const status = (error as { context?: { status?: number } }).context?.status;
      const msg = status === 429
        ? "You've hit the hourly limit — take a breather and try again in a bit."
        : "I'm having trouble reaching my brain right now — try again in a moment.";
      return { ok: false, error: { status, message: msg } };
    }

    if (!data || typeof data.reply !== "string") {
      return { ok: false, error: { message: "Empty response — try again in a moment." } };
    }

    return {
      ok: true,
      data: {
        reply: data.reply,
        actions: Array.isArray(data.actions) ? data.actions : [],
        usage: data.usage,
      },
    };
  } catch (err) {
    return {
      ok: false,
      error: { message: err instanceof Error ? err.message : "Something went wrong — try again." },
    };
  }
}
