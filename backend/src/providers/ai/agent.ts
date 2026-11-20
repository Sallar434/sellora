/**
 * VendOm AI assistant engine: one tool-using loop over three providers.
 *  - DeepSeek and Kimi: OpenAI-compatible /chat/completions with function calling.
 *  - Claude: the official Anthropic SDK (Messages API, manual tool loop so the same tools run on every provider).
 * Which provider a store gets comes from its plan (config.aiTier); if that provider has no key or fails,
 * the next configured one answers, and with none configured the caller uses its built-in replies.
 */
import Anthropic from '@anthropic-ai/sdk';
import { config } from '../../lib/config';

export type Provider = 'deepseek' | 'kimi' | 'claude';
export type ChatTurn = { role: 'user' | 'assistant'; content: string };
export type ToolDef = { name: string; description: string; parameters: { type: 'object'; properties: Record<string, any>; required?: string[] } };
export type ToolRun = (name: string, input: any) => Promise<string>;
export type McpServer = { name: string; url: string; token?: string };
export type AgentResult = { provider: Provider; model: string; text: string; steps: { tool: string; input: any; ok: boolean }[]; inputTokens: number; outputTokens: number; estUsd: number; refused?: boolean };

/** USD per 1M tokens (input, output). DeepSeek from api-docs.deepseek.com (peak); Claude from Anthropic's model table; Kimi is a placeholder to confirm on platform.moonshot.ai. */
export const PRICES: Record<string, [number, number]> = {
  'deepseek-flash': [0.30, 1.20], 'deepseek-v4-pro': [1.32, 3.96],
  'kimi-k2.6': [0.95, 4.00],
  'claude-opus-5-5': [4, 20], 'claude-sonnet-5-5': [2, 10], 'claude-haiku-5-5': [0.10, 0.50],
};
const usd = (model: string, i: number, o: number) => { const p = PRICES[model]; return p ? +((i * p[0] + o * p[1]) / 1e6).toFixed(6) : 0; };

export function configured(p: Provider) { return p === 'claude' ? !!config.anthropicKey : p === 'kimi' ? !!config.kimiKey : !!config.deepseekKey; }
export const modelOf = (p: Provider) => (p === 'claude' ? config.anthropicModel : p === 'kimi' ? config.kimiModel : config.deepseekModel);
/** Plan → ordered list of providers to try. */
export function providersFor(plan: string): Provider[] {
  const all: Provider[] = ['claude', 'kimi', 'deepseek']; // most to least expensive
  const want = (all.includes(config.aiTier[plan] as Provider) ? config.aiTier[plan] : config.aiTier.basic) as Provider;
  // The plan's own model first, then cheaper ones; a lower plan never falls *up* to a more expensive model.
  return all.slice(all.indexOf(want)).filter(configured);
}

const MAX_STEPS = 8;
const clip = (s: string, n = 12000) => (s.length > n ? s.slice(0, n) + '…(truncated)' : s);

/* ---------- OpenAI-compatible (DeepSeek, Kimi) ---------- */
async function runCompatible(p: 'deepseek' | 'kimi', system: string, history: ChatTurn[], tools: ToolDef[], run: ToolRun): Promise<AgentResult> {
  const model = modelOf(p), base = (p === 'kimi' ? config.kimiBase : config.deepseekBase).replace(/\/$/, ''), key = p === 'kimi' ? config.kimiKey : config.deepseekKey;
  const messages: any[] = [{ role: 'system', content: system }, ...history.map(t => ({ role: t.role, content: t.content }))];
  const res: AgentResult = { provider: p, model, text: '', steps: [], inputTokens: 0, outputTokens: 0, estUsd: 0 };
  for (let step = 0; step <= MAX_STEPS; step++) {
    const body: any = { model, messages, max_tokens: 4000, tools: tools.map(t => ({ type: 'function', function: t })), tool_choice: step === MAX_STEPS ? 'none' : 'auto' };
    if (p === 'deepseek') body.thinking = { type: config.deepseekThinking ? 'enabled' : 'disabled' };
    const r = await fetch(base + '/chat/completions', { method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(90000) });
    if (!r.ok) throw new Error(`${p} ${r.status}`);
    const j: any = await r.json(); const msg = j.choices?.[0]?.message || {};
    res.inputTokens += j.usage?.prompt_tokens || 0; res.outputTokens += j.usage?.completion_tokens || 0;
    const calls = msg.tool_calls || [];
    if (!calls.length) { res.text = String(msg.content || ''); break; }
    messages.push({ role: 'assistant', content: msg.content || '', tool_calls: calls });
    for (const c of calls) {
      let input: any = {}; let out: string; let ok = true;
      try { input = JSON.parse(c.function?.arguments || '{}'); out = await run(c.function.name, input); } catch (e: any) { ok = false; out = JSON.stringify({ error: String(e?.message || e) }); }
      res.steps.push({ tool: c.function?.name, input, ok });
      messages.push({ role: 'tool', tool_call_id: c.id, content: clip(out) });
    }
  }
  res.estUsd = usd(model, res.inputTokens, res.outputTokens);
  return res;
}

/* ---------- Claude (official SDK) ---------- */
let client: Anthropic | null = null;
export const setClaudeClient = (c: Anthropic | null) => { client = c; }; // tests inject a fake
export const claude = () => (client ||= new Anthropic({ apiKey: config.anthropicKey }));

async function runClaude(system: string, history: ChatTurn[], tools: ToolDef[], run: ToolRun, mcp: McpServer[]): Promise<AgentResult> {
  const model = config.anthropicModel;
  const res: AgentResult = { provider: 'claude', model, text: '', steps: [], inputTokens: 0, outputTokens: 0, estUsd: 0 };
  const messages: Anthropic.Beta.BetaMessageParam[] = history.map(t => ({ role: t.role, content: t.content }));
  const toolList: Anthropic.Beta.BetaToolUnion[] = [
    ...tools.map(t => ({ name: t.name, description: t.description, input_schema: t.parameters })),
    ...mcp.map(m => ({ type: 'mcp_toolset' as const, mcp_server_name: m.name })),
  ];
  const betas: Anthropic.Beta.AnthropicBeta[] = ['server-side-fallback-2026-07-01', ...(mcp.length ? ['mcp-client-2025-11-20' as const] : [])];
  for (let step = 0; step <= MAX_STEPS; step++) {
    const r = await claude().beta.messages.create({
      model, max_tokens: 16000, betas,
      fallbacks: 'default', // a declined request is retried on a fallback model inside the same call
      output_config: { effort: 'medium' },
      system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }],
      tools: toolList,
      ...(mcp.length ? { mcp_servers: mcp.map(m => ({ type: 'url' as const, name: m.name, url: m.url, ...(m.token ? { authorization_token: m.token } : {}) })) } : {}),
      messages,
    });
    res.inputTokens += r.usage.input_tokens + (r.usage.cache_read_input_tokens || 0) + (r.usage.cache_creation_input_tokens || 0); res.outputTokens += r.usage.output_tokens;
    const text = r.content.filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === 'text').map(b => b.text).join('\n').trim();
    if (r.stop_reason === 'refusal') { res.refused = true; res.text = text || 'I can’t help with that request.'; break; }
    if (r.stop_reason === 'pause_turn') { messages.push({ role: 'assistant', content: r.content }); continue; }
    const uses = r.content.filter((b): b is Anthropic.Beta.BetaToolUseBlock => b.type === 'tool_use');
    if (r.stop_reason !== 'tool_use' || !uses.length || step === MAX_STEPS) { res.text = text; break; }
    messages.push({ role: 'assistant', content: r.content }); // full content, unchanged (keeps thinking blocks valid)
    const results: Anthropic.Beta.BetaToolResultBlockParam[] = [];
    for (const u of uses) {
      let out: string; let ok = true;
      try { out = await run(u.name, u.input); } catch (e: any) { ok = false; out = JSON.stringify({ error: String(e?.message || e) }); }
      res.steps.push({ tool: u.name, input: u.input, ok });
      results.push({ type: 'tool_result', tool_use_id: u.id, content: clip(out), ...(ok ? {} : { is_error: true }) });
    }
    messages.push({ role: 'user', content: results }); // all results in one message
  }
  res.estUsd = usd(model, res.inputTokens, res.outputTokens);
  return res;
}

/** Try the plan's providers in order; null when none is configured or all fail (caller answers with built-in replies). */
export async function runAgent(plan: string, system: string, history: ChatTurn[], tools: ToolDef[], run: ToolRun, mcp: McpServer[] = []): Promise<AgentResult | null> {
  for (const p of providersFor(plan)) {
    try { return p === 'claude' ? await runClaude(system, history, tools, run, mcp) : await runCompatible(p, system, history, tools, run); }
    catch (e) { if (config.env !== 'test') console.warn('[ai] provider failed', p, (e as Error).message); }
  }
  return null;
}
