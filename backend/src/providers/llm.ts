import { config } from '../lib/config';
/**
 * LLM provider. DeepSeek (OpenAI-compatible, https://api.deepseek.com) is the default when DEEPSEEK_API_KEY is set,
 * any OpenAI-compatible endpoint via LLM_BASE_URL/LLM_API_KEY otherwise, and `null` (→ caller's template/mock) when none is configured
 * or the call fails. JSON mode uses response_format {type:'json_object'} (supported by DeepSeek).
 */
export type LlmUsage = { provider: string; model: string; inputTokens: number; cachedTokens: number; outputTokens: number; estUsd: number };
/** DeepSeek list prices, USD per 1M tokens (peak; off-peak is half). Verified 2026-10-29 at api-docs.deepseek.com/quick_start/pricing */
export const DEEPSEEK_PRICES: Record<string, { hit: number; miss: number; out: number }> = {
  'deepseek-flash': { hit: 0.006, miss: 0.30, out: 1.20 },
  'deepseek-v4-pro': { hit: 0.044, miss: 1.32, out: 3.96 },
};
export function llmInfo() {
  const p = config.llmProvider;
  if (p === 'deepseek' && config.deepseekKey) return { provider: 'deepseek', model: config.deepseekModel, base: config.deepseekBase };
  if (p !== 'mock' && config.llmBaseUrl && config.llmApiKey) return { provider: 'openai-compatible', model: config.llmModel, base: config.llmBaseUrl };
  return { provider: 'mock', model: 'templates', base: '' };
}
export function costUsd(model: string, inT: number, cached: number, outT: number) {
  const pr = DEEPSEEK_PRICES[model] || DEEPSEEK_PRICES[model.includes('pro') ? 'deepseek-v4-pro' : 'deepseek-flash'];
  return +(((inT - cached) * pr.miss + cached * pr.hit + outT * pr.out) / 1e6).toFixed(6);
}
export async function llmChat(system: string, user: string, opts: { json?: boolean; maxTokens?: number; temperature?: number } = {}): Promise<{ text: string; usage: LlmUsage } | null> {
  const info = llmInfo(); if (info.provider === 'mock') return null;
  const ds = info.provider === 'deepseek';
  const body: any = { model: info.model, messages: [{ role: 'system', content: system }, { role: 'user', content: user }], temperature: opts.temperature ?? 0.6, max_tokens: opts.maxTokens ?? 4000, stream: false };
  if (opts.json) body.response_format = { type: 'json_object' };
  if (ds) body.thinking = { type: config.deepseekThinking ? 'enabled' : 'disabled' };
  try {
    const r = await fetch(info.base.replace(/\/$/, '') + '/chat/completions', { method: 'POST', headers: { Authorization: `Bearer ${ds ? config.deepseekKey : config.llmApiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(60000) });
    if (!r.ok) return null;
    const j: any = await r.json(); const text = j.choices?.[0]?.message?.content; if (typeof text !== 'string' || !text) return null;
    const u = j.usage || {}; const inT = u.prompt_tokens || 0, cached = u.prompt_cache_hit_tokens || u.prompt_tokens_details?.cached_tokens || 0, outT = u.completion_tokens || 0;
    return { text, usage: { provider: info.provider, model: info.model, inputTokens: inT, cachedTokens: cached, outputTokens: outT, estUsd: ds ? costUsd(info.model, inT, cached, outT) : 0 } };
  } catch { return null; }
}
/** Back-compat: plain text or null */
export async function llm(system: string, user: string): Promise<string | null> { return (await llmChat(system, user))?.text ?? null; }
/** Which store-builder models are configured. DeepSeek stays the default cheaper provider; Claude is optional. */
export function llmAvailability() {
  const info = llmInfo();
  const claude = !!config.anthropicKey;
  const deepseek = info.provider === 'deepseek' || !!config.deepseekKey;
  const compatible = info.provider === 'openai-compatible';
  const order = [claude ? 'claude' : '', deepseek ? 'deepseek' : compatible ? 'openai-compatible' : '', 'local'].filter(Boolean);
  return { claude, deepseek, compatible, order, provider: info.provider, model: info.model };
}
async function claudeChat(system: string, user: string, opts: { maxTokens?: number } = {}): Promise<{ text: string; usage: LlmUsage } | null> {
  if (!config.anthropicKey) return null;
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'x-api-key': config.anthropicKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' }, body: JSON.stringify({ model: config.anthropicModel, max_tokens: opts.maxTokens ?? 4000, system, messages: [{ role: 'user', content: user }] }), signal: AbortSignal.timeout(60000) });
    if (!r.ok) return null;
    const j: any = await r.json(); const text = (j.content || []).map((c: any) => c.text || '').join(''); if (!text) return null;
    const inT = j.usage?.input_tokens || 0, outT = j.usage?.output_tokens || 0;
    return { text, usage: { provider: 'claude', model: config.anthropicModel, inputTokens: inT, cachedTokens: 0, outputTokens: outT, estUsd: 0 } };
  } catch { return null; }
}
/**
 * Store-building copy: try Claude when ANTHROPIC_API_KEY is set (stronger prose), then DeepSeek / the configured
 * OpenAI-compatible model, then null so the caller uses its local template. Other AI routes keep DeepSeek via llmChat.
 */
export async function llmChatBest(system: string, user: string, opts: { json?: boolean; maxTokens?: number; temperature?: number } = {}): Promise<{ text: string; usage: LlmUsage } | null> {
  if (config.anthropicKey) {
    const sys = system + (opts.json ? ' Reply with a single valid JSON object only.' : '');
    const c = await claudeChat(sys, user, opts);
    if (c) return c;
  }
  return llmChat(system, user, opts);
}
/** JSON helper: returns parsed object, or the fallback (source:'template') */
export async function llmJson<T>(system: string, user: string, fallback: () => T, maxTokens = 4000): Promise<{ source: 'llm' | 'template'; result: T; usage?: LlmUsage }> {
  const out = await llmChat(system + ' Reply with a single valid JSON object only.', user, { json: true, maxTokens });
  if (!out) return { source: 'template', result: fallback() };
  try { return { source: 'llm', result: JSON.parse(out.text.replace(/^\s*```(?:json)?|```\s*$/g, '')), usage: out.usage }; } catch { return { source: 'template', result: fallback(), usage: out.usage }; }
}
/** Same as llmJson, but prefers Claude for store-building copy when that key exists, then DeepSeek, then the template. */
export async function llmJsonBest<T>(system: string, user: string, fallback: () => T, maxTokens = 4000): Promise<{ source: 'llm' | 'template'; result: T; usage?: LlmUsage }> {
  const out = await llmChatBest(system + ' Reply with a single valid JSON object only.', user, { json: true, maxTokens });
  if (!out) return { source: 'template', result: fallback() };
  try { return { source: 'llm', result: JSON.parse(out.text.replace(/^\s*```(?:json)?|```\s*$/g, '')), usage: out.usage }; } catch { return { source: 'template', result: fallback(), usage: out.usage }; }
}
/** Speech-to-text. 'browser' (default) = the dashboard uses the Web Speech API; DeepSeek has no STT. 'http' posts audio to a Whisper-compatible STT_URL. */
export async function stt(audio: Buffer, mime = 'audio/webm', lang = 'en'): Promise<{ text: string } | null> {
  if (config.sttProvider !== 'http' || !config.sttUrl) return null;
  try { const fd = new FormData(); fd.append('file', new Blob([new Uint8Array(audio)], { type: mime }), 'audio.webm'); fd.append('model', 'whisper-1'); fd.append('language', lang); const r = await fetch(config.sttUrl, { method: 'POST', headers: config.sttKey ? { Authorization: `Bearer ${config.sttKey}` } : {}, body: fd }); if (!r.ok) return null; const j: any = await r.json(); return j.text ? { text: j.text } : null; } catch { return null; }
}
