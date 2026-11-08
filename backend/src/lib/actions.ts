/** Validated assistant commands. This module never calls a provider and never reports that an API succeeded. */

export type ActionPlan = {
  supported: boolean;
  kind: string;
  summary: string;
  destructive: boolean;
  needsConfirm: boolean;
  wantsCopy: boolean;
  blocked?: 'payment' | 'message' | 'publish' | 'external';
  message: string;
};

const BLOCKED: Array<{ re: RegExp; blocked: ActionPlan['blocked']; message: string }> = [
  { re: /\b(refund|payout|charge|capture payment|send money)\b/i, blocked: 'payment', message: 'Payment and refund actions are not run from the assistant.' },
  { re: /\b(send email|send sms|text the customer|whatsapp|newsletter blast)\b/i, blocked: 'message', message: 'Outbound messages are not sent from the assistant.' },
  { re: /\b(go live|publish (the )?store|remove (the )?password)\b/i, blocked: 'publish', message: 'Publishing stays on the Plans page and needs a paid plan. Nothing was published.' },
  { re: /\b(buy domain|purchase|subscribe|open an account at)\b/i, blocked: 'external', message: 'This assistant does not create third-party accounts or make purchases.' },
];

export function planCommand(command: string): ActionPlan {
  const text = String(command || '').trim();
  if (!text) return { supported: false, kind: 'empty', summary: '', destructive: false, needsConfirm: false, wantsCopy: false, message: 'Type or speak a command.' };
  for (const b of BLOCKED) {
    if (b.re.test(text)) return { supported: false, kind: 'blocked', summary: text, destructive: true, needsConfirm: true, wantsCopy: false, blocked: b.blocked, message: b.message };
  }
  if (/\b(delete|remove|wipe)\b/i.test(text) && /\b(all|every|catalog)\b/i.test(text)) {
    return { supported: true, kind: 'destructive', summary: text, destructive: true, needsConfirm: true, wantsCopy: false, message: 'Confirm before deleting stored records. Nothing was deleted yet.' };
  }
  if (/\b(build|create|make|generate)\b/i.test(text) && /\b(website|store|shop|collection|product|banner|page)\b/i.test(text)) {
    return { supported: true, kind: 'design', summary: text, destructive: false, needsConfirm: false, wantsCopy: true, message: 'Design command understood. Copy is written by a provider only when that call returns text; otherwise the on-device builder is used and labeled local.' };
  }
  if (/\b(how many|list|show|report)\b/i.test(text) && /\borders?\b/i.test(text)) {
    return { supported: true, kind: 'orders', summary: text, destructive: false, needsConfirm: false, wantsCopy: false, message: 'Order totals are counted from stored records only.' };
  }
  if (/\b(seo|sitemap|robots|faq|schema)\b/i.test(text)) {
    return { supported: true, kind: 'seo', summary: text, destructive: false, needsConfirm: false, wantsCopy: true, message: 'SEO changes use stored pages and products. Rankings are not predicted.' };
  }
  if (/\b(undo|optimize|announcement|menu|featured|banner)\b/i.test(text)) {
    return { supported: true, kind: 'edit', summary: text, destructive: false, needsConfirm: false, wantsCopy: false, message: 'Edit command understood.' };
  }
  return { supported: false, kind: 'unknown', summary: text, destructive: false, needsConfirm: false, wantsCopy: false, message: 'That command is not supported. Nothing was changed.' };
}
