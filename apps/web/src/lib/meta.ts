// Meta Model API client (spec §5). Direct to https://api.meta.ai/v1 —
// never via gateways (separate billing). Stdlib fetch, no SDK.

const BASE = process.env.META_API_BASE ?? "https://api.meta.ai/v1";

function key(): string {
  const k = process.env.MODEL_API_KEY ?? process.env.META_API_KEY ?? "";
  if (!k) throw new Error("MODEL_API_KEY-unset");
  return k;
}

export interface ChatOpts {
  model: string;
  messages: { role: string; content: string }[];
  maxTokens?: number;
  reasoningEffort?: "minimal" | "low" | "medium" | "high";
  tools?: unknown[];
  json?: boolean;
}

export async function chat(o: ChatOpts): Promise<string> {
  const body: Record<string, unknown> = {
    model: o.model,
    messages: o.messages,
    max_tokens: o.maxTokens ?? 500, // reasoning eats budget (DEVIATIONS #4)
    reasoning_effort: o.reasoningEffort ?? "minimal",
  };
  if (o.tools) body.tools = o.tools;
  if (o.json) body.response_format = { type: "json_object" };
  const r = await fetch(`${BASE}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key()}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`meta-http-${r.status}: ${(await r.text()).slice(0, 200)}`);
  const j = await r.json();
  const content = j.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) throw new Error("meta-empty-content");
  return content;
}

export const MODELS = {
  live: process.env.MODEL_LIVE ?? "muse-spark-1.3",
  extract: process.env.MODEL_EXTRACT ?? "muse-wonder-1.0",
  judge: process.env.MODEL_JUDGE ?? "muse-spark-1.3",
  simcaller: process.env.MODEL_SIMCALLER ?? "muse-spark-1.3-contributor",
};
