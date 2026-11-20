/**
 * Connectors: a seller pastes the link of any outside tool and VendOm works out what it is and how to talk to it.
 *  - webhook: Zapier, Make, n8n, Pipedream, IFTTT, Slack, Discord, Microsoft Teams, Google Apps Script, or any https endpoint → store events are POSTed to it
 *  - mcp: a Model Context Protocol server → its tools become available to VendOm AI (Claude plans)
 *  - api: an OpenAPI/Swagger spec or a REST base URL (+ optional key) → VendOm AI can read from it
 *  - app: a link to a platform VendOm already has a built-in app for (Meta, Google, TikTok, …) → opens that app's install
 */
import dns from 'dns/promises';
import net from 'net';
import { db } from './db';
import { encrypt, decrypt } from './crypto';
import { config } from './config';

export const EVENTS = ['orders/create', 'orders/fulfilled', 'orders/refunded', 'orders/cancelled', 'products/create', 'billing/usage_alert'] as const;
export type Detected = { kind: 'webhook' | 'mcp' | 'api' | 'app'; provider: string; name: string; appId?: string; needsKey?: boolean; events?: string[]; note: string };

const RULES: [RegExp, Omit<Detected, 'note'> & { note?: string }][] = [
  [/^hooks\.zapier\.com$/, { kind: 'webhook', provider: 'zapier', name: 'Zapier' }],
  [/(^|\.)hook\.[a-z0-9]+\.make\.com$|^hook\.integromat\.com$/, { kind: 'webhook', provider: 'make', name: 'Make' }],
  [/\.m\.pipedream\.net$/, { kind: 'webhook', provider: 'pipedream', name: 'Pipedream' }],
  [/^maker\.ifttt\.com$/, { kind: 'webhook', provider: 'ifttt', name: 'IFTTT' }],
  [/^hooks\.slack\.com$/, { kind: 'webhook', provider: 'slack', name: 'Slack' }],
  [/^(discord|discordapp)\.com$/, { kind: 'webhook', provider: 'discord', name: 'Discord' }],
  [/\.webhook\.office\.com$|^outlook\.office\.com$/, { kind: 'webhook', provider: 'teams', name: 'Microsoft Teams' }],
  [/^script\.google\.com$/, { kind: 'webhook', provider: 'google-apps-script', name: 'Google Sheets (Apps Script)' }],
  [/(^|\.)(facebook|instagram)\.com$|^business\.facebook\.com$/, { kind: 'app', provider: 'meta', appId: 'meta', name: 'Meta (Facebook & Instagram)' }],
  [/^merchants\.google\.com$|^merchantcenter\.google\.com$/, { kind: 'app', provider: 'google-merchant', appId: 'google-merchant', name: 'Google Merchant Center' }],
  [/^ads\.google\.com$/, { kind: 'app', provider: 'google-ads', appId: 'google-ads', name: 'Google Ads' }],
  [/^analytics\.google\.com$/, { kind: 'app', provider: 'ga4', appId: 'ga4', name: 'Google Analytics 4' }],
  [/^search\.google\.com$/, { kind: 'app', provider: 'search-console', appId: 'search-console', name: 'Google Search Console' }],
  [/(^|\.)tiktok\.com$/, { kind: 'app', provider: 'tiktok', appId: 'tiktok', name: 'TikTok' }],
  [/(^|\.)pinterest\.com$/, { kind: 'app', provider: 'pinterest', appId: 'pinterest', name: 'Pinterest' }],
  [/(^|\.)snapchat\.com$/, { kind: 'app', provider: 'snapchat', appId: 'snapchat', name: 'Snapchat' }],
  [/(^|\.)(whatsapp\.com|wa\.me)$/, { kind: 'app', provider: 'whatsapp', appId: 'whatsapp', name: 'WhatsApp Business' }],
  [/(^|\.)mailchimp\.com$/, { kind: 'app', provider: 'mailchimp', appId: 'mailchimp', name: 'Mailchimp' }],
  [/(^|\.)klaviyo\.com$/, { kind: 'app', provider: 'klaviyo', appId: 'klaviyo', name: 'Klaviyo' }],
  [/(^|\.)xero\.com$/, { kind: 'app', provider: 'xero', appId: 'xero', name: 'Xero' }],
  [/(^|\.)(quickbooks\.intuit\.com|intuit\.com)$/, { kind: 'app', provider: 'quickbooks', appId: 'quickbooks', name: 'QuickBooks' }],
  [/(^|\.)tcscourier\.com$/, { kind: 'app', provider: 'tcs', appId: 'tcs', name: 'TCS' }],
  [/(^|\.)leopardscourier\.com$/, { kind: 'app', provider: 'leopards', appId: 'leopards', name: 'Leopards' }],
  [/(^|\.)postex\.pk$/, { kind: 'app', provider: 'postex', appId: 'postex', name: 'PostEx' }],
  [/(^|\.)(trax|sonic)\.pk$/, { kind: 'app', provider: 'trax', appId: 'trax', name: 'Trax' }],
];

export function detect(raw: string): Detected {
  let u: URL; try { u = new URL(raw.trim()); } catch { throw new Error('That is not a valid link. Paste the full address, starting with https://'); }
  if (!/^https?:$/.test(u.protocol)) throw new Error('Only http(s) links can be connected.');
  const host = u.hostname.toLowerCase(), path = u.pathname.toLowerCase();
  if (/\/(mcp|sse)\/?$/.test(path) || /^mcp\./.test(host)) return { kind: 'mcp', provider: 'mcp', name: `${host} (MCP)`, needsKey: false, note: 'An MCP server. Its tools will be available to VendOm AI on plans that use Claude.' };
  if (/(openapi|swagger)[^/]*\.(json|ya?ml)$/.test(path) || /\/(openapi|swagger)(\.json)?$/.test(path)) return { kind: 'api', provider: 'openapi', name: `${host} API`, needsKey: true, note: 'An API description (OpenAPI). VendOm AI can read data from this API. Add its API key if it needs one.' };
  if (host === 'discord.com' || host === 'discordapp.com') { if (!/\/api\/webhooks\//.test(path)) return { kind: 'app', provider: 'discord', name: 'Discord', note: 'Paste a Discord channel webhook link (Server settings → Integrations → Webhooks).' }; }
  if (/\/webhook(-test)?\//.test(path) || /n8n/.test(host)) return { kind: 'webhook', provider: 'n8n', name: 'n8n', events: [...EVENTS], note: 'An n8n webhook. Store events will be sent to it.' };
  for (const [re, d] of RULES) if (re.test(host)) {
    if (d.kind === 'webhook') return { ...d, events: [...EVENTS], note: `${d.name} will receive your store events (new order, fulfilled, refunded, cancelled, new product).` } as Detected;
    return { ...d, note: d.note || `VendOm has a built-in ${d.name} app. It opens that app so you can sign in and connect.` } as Detected;
  }
  if (/\/api(\/|$)|^api\./.test(path + '|' + host)) return { kind: 'api', provider: 'custom-api', name: `${host} API`, needsKey: true, note: 'A REST API. Add its API key if it needs one; VendOm AI can then read from it.' };
  return { kind: 'webhook', provider: 'webhook', name: host, events: [...EVENTS], note: 'A custom webhook. Store events will be POSTed to it as JSON.' };
}

/** Blocks links that would make the server call itself or a private network (SSRF). */
export async function assertPublicUrl(raw: string) {
  const u = new URL(raw);
  if (u.protocol !== 'https:' && !(config.env !== 'production' && u.protocol === 'http:')) throw new Error('Use an https:// link.');
  const host = u.hostname.replace(/^\[|\]$/g, '');
  if (/^(localhost|.*\.local|.*\.internal)$/i.test(host)) throw new Error('Private addresses cannot be connected.');
  const addrs = net.isIP(host) ? [host] : (await dns.lookup(host, { all: true }).catch(() => { throw new Error('That address could not be found.'); })).map(a => a.address);
  for (const a of addrs) if (privateIp(a)) throw new Error('Private addresses cannot be connected.');
}
function privateIp(ip: string) {
  if (net.isIPv6(ip)) { const l = ip.toLowerCase(); if (l.startsWith('::ffff:')) return privateIp(l.slice(7)); return l === '::1' || l === '::' || /^f[cd]/.test(l) || /^fe[89ab]/.test(l); }
  const [a, b] = ip.split('.').map(Number);
  return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127) || a >= 224;
}

/** Shape the payload the way each service expects. */
export function payload(provider: string, event: string, data: any, storeName: string) {
  const line = summary(event, data, storeName);
  if (provider === 'slack' || provider === 'teams') return { text: line };
  if (provider === 'discord') return { content: line };
  if (provider === 'ifttt') return { value1: event, value2: line, value3: data?.id || '' };
  return { event, store: storeName, data, at: new Date().toISOString() };
}
function summary(event: string, d: any, store: string) {
  const n = d?.number ? `#${d.number}` : d?.id || '';
  const money = d?.total != null ? ` · ${(d.total / 100).toFixed(2)} ${d.currency || ''}`.trimEnd() : '';
  const what: Record<string, string> = { 'orders/create': `New order ${n}${money}`, 'orders/fulfilled': `Order ${n} fulfilled`, 'orders/refunded': `Order ${n} refunded`, 'orders/cancelled': `Order ${n} cancelled`, 'products/create': `New product: ${d?.title || ''}`, 'billing/usage_alert': `Usage alert: ${d?.metric || ''}`, test: 'Test message from VendOm: your connection works.' };
  return `${store}: ${what[event] || event}`;
}

export async function send(c: { provider: string; url: string; credentialsEnc: string | null }, event: string, data: any, storeName: string) {
  await assertPublicUrl(c.url);
  const headers: Record<string, string> = { 'Content-Type': 'application/json', 'User-Agent': 'VendOm-Connectors/1.0' };
  if (c.credentialsEnc) { const k = decrypt(c.credentialsEnc); if (k) headers.Authorization = /^(Bearer|Basic) /.test(k) ? k : `Bearer ${k}`; }
  const r = await fetch(c.url, { method: 'POST', headers, body: JSON.stringify(payload(c.provider, event, data, storeName)), redirect: 'error', signal: AbortSignal.timeout(10000) });
  if (r.status >= 400) throw new Error(`The service answered ${r.status}`);
  return r.status;
}

/** Called from webhooks.emit for every store event. */
export async function deliver(storeId: string, event: string, data: any) {
  const cs = await db.connector.findMany({ where: { storeId, kind: 'webhook', status: 'connected' } });
  if (!cs.length) return;
  const store = await db.store.findUnique({ where: { id: storeId }, select: { name: true } });
  for (const c of cs) if (((c.events as string[]) || []).includes(event)) await send(c, event, data, store?.name || 'VendOm store').catch(() => {});
}

export async function test(c: { kind: string; provider: string; url: string; credentialsEnc: string | null }, storeName: string): Promise<{ ok: boolean; detail: string }> {
  try {
    await assertPublicUrl(c.url);
    if (c.kind === 'webhook') { const s = await send(c, 'test', { id: 'test' }, storeName); return { ok: true, detail: `Sent a test message (answer ${s}).` }; }
    const headers: Record<string, string> = { Accept: 'application/json, text/event-stream', 'Content-Type': 'application/json' };
    if (c.credentialsEnc) headers.Authorization = `Bearer ${decrypt(c.credentialsEnc)}`;
    if (c.kind === 'mcp') {
      const r = await fetch(c.url, { method: 'POST', headers, redirect: 'error', signal: AbortSignal.timeout(10000), body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'VendOm', version: '1.0' } } }) });
      return r.ok ? { ok: true, detail: 'The MCP server answered.' } : { ok: false, detail: `The MCP server answered ${r.status}${r.status === 401 ? ' (it needs a key)' : ''}.` };
    }
    const r = await fetch(c.url, { headers, redirect: 'error', signal: AbortSignal.timeout(10000) });
    if (!r.ok) return { ok: false, detail: `The API answered ${r.status}${r.status === 401 || r.status === 403 ? ' (check the key)' : ''}.` };
    if (c.provider === 'openapi') { const j: any = await r.json().catch(() => null); const ops = j?.paths ? Object.values(j.paths).reduce((n: number, p: any) => n + Object.keys(p).length, 0) : 0; return { ok: !!ops, detail: ops ? `Found ${ops} API operations.` : 'This does not look like an OpenAPI description.' }; }
    return { ok: true, detail: 'The API answered.' };
  } catch (e: any) { return { ok: false, detail: String(e?.message || e) }; }
}

export const sealKey = (k?: string | null) => (k ? encrypt(k) : null);
