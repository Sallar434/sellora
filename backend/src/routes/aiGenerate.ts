/** Kimi (Moonshot) via the OpenAI SDK, with DeepSeek or Claude only when AI_PROVIDER says so. No invented copy. */
import { Router } from 'express';
import { z } from 'zod';
import { db } from '../lib/db';
import { ah, parse, HttpError } from '../lib/http';
import { auth } from '../lib/auth';
import { config } from '../lib/config';
import { llmChatBest } from '../providers/llm';
export const r = Router();
const Copy = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(8000),
  seoTitle: z.string().min(1).max(70),
  seoDescription: z.string().min(1).max(320),
});
export type CopyOut = z.infer<typeof Copy>;
type Caller = (prompt: string) => Promise<{ text: string; inputTokens: number; outputTokens: number; provider: string; model: string }>;
async function kimiCall(prompt: string) {
  if (!config.kimiKey) throw new HttpError(503, 'KIMI_API_KEY is not set. Nothing was generated.');
  const OpenAI = (await import('openai')).default;
  const client = new OpenAI({ apiKey: config.kimiKey, baseURL: config.kimiBase, timeout: 20000, maxRetries: 0 });
  try {
    const res = await client.chat.completions.create({
      model: config.kimiModel,
      max_tokens: 800,
      response_format: { type: 'json_object' },
      messages: [{ role: 'system', content: 'Return one JSON object with keys title, description, seoTitle, seoDescription. Do not invent awards, rankings, or medical claims.' }, { role: 'user', content: prompt.slice(0, 4000) }],
    });
    const text = res.choices[0]?.message?.content || '';
    return { text, inputTokens: res.usage?.prompt_tokens || 0, outputTokens: res.usage?.completion_tokens || 0, provider: 'kimi', model: config.kimiModel };
  } catch (e: any) {
    const msg = e?.error?.message || e?.message || 'The AI provider returned an error.';
    const status = e?.status || e?.statusCode;
    if (status === 402 || /insufficient balance|exceeded your current quota|account balance/i.test(msg)) throw new HttpError(402, 'The AI provider refused the request: ' + msg);
    throw new HttpError(status && status < 500 ? status : 502, 'The AI provider refused the request: ' + msg);
  }
}
let caller: Caller = async (prompt) => {
  const provider = config.aiProvider || (config.kimiKey ? 'kimi' : config.deepseekKey ? 'deepseek' : config.anthropicKey ? 'claude' : '');
  if (provider === 'kimi' || provider === '') return kimiCall(prompt);
  if (provider === 'deepseek' || provider === 'claude') {
    if (provider === 'deepseek' && !config.deepseekKey) throw new HttpError(503, 'DEEPSEEK_API_KEY is not set. Nothing was generated.');
    if (provider === 'claude' && !config.anthropicKey) throw new HttpError(503, 'ANTHROPIC_API_KEY is not set. Nothing was generated.');
    const out = await llmChatBest('Return one JSON object with keys title, description, seoTitle, seoDescription.', prompt, { json: true, maxTokens: 800 });
    if (!out) throw new HttpError(502, 'The configured provider did not return text. Nothing was saved as generated copy.');
    return { text: out.text, inputTokens: out.usage.inputTokens, outputTokens: out.usage.outputTokens, provider: out.usage.provider, model: out.usage.model };
  }
  throw new HttpError(503, 'AI_PROVIDER is not configured. Nothing was generated.');
};
export const setAiCaller = (fn: Caller) => { caller = fn };
export function parseCopy(text: string): CopyOut {
  let raw: unknown;
  try { raw = JSON.parse(text); } catch { throw new HttpError(502, 'The provider did not return JSON. Nothing was saved.'); }
  const parsed = Copy.safeParse(raw);
  if (!parsed.success) throw new HttpError(502, 'The provider JSON did not match the product fields. Nothing was saved.');
  return parsed.data;
}

r.post('/generate', auth, ah(async (req, res) => {
  const b = parse(z.object({ prompt: z.string().min(1).max(4000), storeId: z.string().optional() }), req.body);
  const out = await caller(b.prompt);
  const copy = parseCopy(out.text);
  const membership = b.storeId
    ? await db.membership.findUnique({ where: { userId_storeId: { userId: req.user!.sub, storeId: b.storeId } } })
    : await db.membership.findFirst({ where: { userId: req.user!.sub } });
  if (b.storeId && !membership && req.user!.type !== 'PLATFORM_ADMIN' && req.user!.type !== 'ADMIN') throw new HttpError(403, 'Not a member of this store');
  if (membership) await db.aiUsage.create({ data: { storeId: membership.storeId, provider: out.provider, model: out.model, inputTokens: out.inputTokens, outputTokens: out.outputTokens } });
  res.json({ ...copy, provider: out.provider, model: out.model, inputTokens: out.inputTokens, outputTokens: out.outputTokens });
}));
