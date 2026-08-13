import "server-only";
import type { DexLlmConfig } from "./config";

/**
 * A single OpenAI-compatible chat completion, over plain `fetch` (D-059).
 *
 * No SDK on purpose. The Google/OpenAI/OpenRouter/Groq request bodies we need
 * are four fields wide, and this project polices its dependency surface hard
 * (docs/30 §2.7.4 — additions require a DECISIONS entry). A vendor SDK would
 * also pin us to one provider's shape, defeating the point of the
 * OpenAI-compatible endpoint choice in `config.ts`.
 *
 * Every failure path here returns `null` rather than throwing. The caller's
 * contract is "null means fall back to the v1 cached matcher", so a quota
 * exhaustion, a cold provider, or a malformed body all degrade to a real
 * answer instead of an error bubble in the visitor's panel.
 */

export type DexLlmFailure =
  | "disabled"
  | "rate_limited"
  | "timeout"
  | "provider_error"
  | "empty_response";

export interface DexLlmResult {
  text: string | null;
  failure: DexLlmFailure | null;
}

interface ChatChoice {
  message?: { content?: unknown };
}

interface ChatResponse {
  choices?: ChatChoice[];
}

export async function completeJson(
  config: DexLlmConfig,
  system: string,
  user: string,
): Promise<DexLlmResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.timeoutMs);

  try {
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: config.model,
        temperature: config.temperature,
        max_tokens: config.maxOutputTokens,
        // JSON mode, not free text. The server assembles the final visible
        // answer from these fields (see `generate.ts`), so the model never
        // controls formatting — only content. That is what makes the
        // "structured, punchy" house style deterministic instead of a request
        // the model may or may not honour on any given call.
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });

    if (response.status === 429) {
      // Free tiers are RPM/RPD-capped by design. Do not retry — a retry inside
      // the same request window makes the limit worse and delays the fallback
      // the visitor is already waiting on.
      console.warn("Dex LLM rate limited by provider");
      return { text: null, failure: "rate_limited" };
    }

    if (!response.ok) {
      console.error("Dex LLM provider error:", response.status, await safeBody(response));
      return { text: null, failure: "provider_error" };
    }

    const payload = (await response.json()) as ChatResponse;
    const content = payload.choices?.[0]?.message?.content;
    if (typeof content !== "string" || !content.trim()) {
      return { text: null, failure: "empty_response" };
    }

    return { text: content, failure: null };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.warn(`Dex LLM timed out after ${config.timeoutMs}ms`);
      return { text: null, failure: "timeout" };
    }
    console.error("Dex LLM request failed:", error);
    return { text: null, failure: "provider_error" };
  } finally {
    clearTimeout(timer);
  }
}

async function safeBody(response: Response): Promise<string> {
  try {
    return (await response.text()).slice(0, 400);
  } catch {
    return "<unreadable>";
  }
}
