const DEFAULT_MODEL = "claude-sonnet-4-6";

export async function callAI(options: {
  systemPrompt: string;
  userPrompt: string;
  model?: string;
  maxTokens?: number;
  fallbackToGemini?: boolean;
  temperature?: number;
}): Promise<string | null> {
  const {
    systemPrompt,
    userPrompt,
    model = DEFAULT_MODEL,
    maxTokens = 4096,
    fallbackToGemini = false,
    temperature = 0.7,
  } = options;

  const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY2");
  const lovableKey = fallbackToGemini ? Deno.env.get("LOVABLE_API_KEY") : undefined;

  let content: string | null = null;

  if (anthropicKey) {
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": anthropicKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model,
          max_tokens: maxTokens,
          system: [{ type: "text", text: systemPrompt, cache_control: { type: "ephemeral" } }],
          messages: [{ role: "user", content: userPrompt }],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        content = data.content?.[0]?.text ?? null;
        if (content) console.log(`Anthropic response received (${model})`);
        else console.warn("Empty Anthropic response");
      } else {
        const err = await response.text();
        console.warn(`Anthropic error ${response.status}: ${err}`);
      }
    } catch (err) {
      console.warn("Anthropic request failed:", err);
    }
  }

  if (!content && fallbackToGemini && lovableKey) {
    try {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${lovableKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        content = data.choices?.[0]?.message?.content ?? null;
        if (content) console.log("Gemini fallback response received");
        else console.error("Empty Gemini response");
      } else {
        const err = await response.text();
        console.error(`Gemini fallback error ${response.status}: ${err}`);
      }
    } catch (err) {
      console.error("Gemini fallback failed:", err);
    }
  }

  return content;
}

// ── Tool-use variant ────────────────────────────────────────────────────────
// Returns the raw Anthropic response so callers can inspect stop_reason and
// iterate for multi-turn tool loops. No Gemini fallback — Gemini's tool schema
// differs and would need a separate translation layer.

export type AnthropicTool = {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
};

export type AnthropicMessage = {
  role: "user" | "assistant";
  content: string | Array<Record<string, unknown>>;
};

export type AnthropicResponse = {
  id: string;
  type: "message";
  role: "assistant";
  model: string;
  content: Array<
    | { type: "text"; text: string }
    | { type: "tool_use"; id: string; name: string; input: Record<string, unknown> }
  >;
  stop_reason: "end_turn" | "tool_use" | "max_tokens" | "stop_sequence" | string;
  usage: {
    input_tokens: number;
    output_tokens: number;
    cache_read_input_tokens?: number;
    cache_creation_input_tokens?: number;
  };
};

export async function callAIWithTools(options: {
  system: string;
  messages: AnthropicMessage[];
  tools: AnthropicTool[];
  model?: string;
  maxTokens?: number;
  temperature?: number;
}): Promise<AnthropicResponse | null> {
  const {
    system,
    messages,
    tools,
    model = DEFAULT_MODEL,
    maxTokens = 800,
    temperature = 0.5,
  } = options;

  const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY2");
  if (!anthropicKey) {
    console.error("ANTHROPIC_API_KEY2 not set");
    return null;
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        temperature,
        system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
        tools,
        messages,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.warn(`Anthropic tool-use error ${response.status}: ${err}`);
      return null;
    }

    return await response.json() as AnthropicResponse;
  } catch (err) {
    console.warn("Anthropic tool-use request failed:", err);
    return null;
  }
}
