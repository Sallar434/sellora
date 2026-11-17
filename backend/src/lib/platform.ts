/** Locale, import, bulk, health, and insight rules. This module never calls a provider and never reports a live charge. */

export type Coverage = 'verified' | 'framework';

export type LocaleInfo = {
  id: string;
  language: string;
  name: string;
  native: string;
  dir: 'ltr' | 'rtl';
  coverage: Coverage;
  speech: string | null;
};

export const LOCALES: LocaleInfo[] = [
  { id: 'en', language: 'en', name: 'English', native: 'English', dir: 'ltr', coverage: 'verified', speech: 'en-US' },
  { id: 'ur', language: 'ur', name: 'Urdu', native: 'اردو', dir: 'rtl', coverage: 'verified', speech: 'ur-PK' },
  { id: 'ar', language: 'ar', name: 'Arabic', native: 'العربية', dir: 'rtl', coverage: 'verified', speech: 'ar' },
  { id: 'fr', language: 'fr', name: 'French', native: 'Français', dir: 'ltr', coverage: 'verified', speech: 'fr-FR' },
  { id: 'es', language: 'es', name: 'Spanish', native: 'Español', dir: 'ltr', coverage: 'verified', speech: 'es-ES' },
  { id: 'de', language: 'de', name: 'German', native: 'Deutsch', dir: 'ltr', coverage: 'verified', speech: 'de-DE' },
  { id: 'hi', language: 'hi', name: 'Hindi', native: 'हिन्दी', dir: 'ltr', coverage: 'framework', speech: null },
  { id: 'pt', language: 'pt', name: 'Portuguese', native: 'Português', dir: 'ltr', coverage: 'framework', speech: null },
  { id: 'zh', language: 'zh', name: 'Chinese', native: '中文', dir: 'ltr', coverage: 'framework', speech: null },
  { id: 'ja', language: 'ja', name: 'Japanese', native: '日本語', dir: 'ltr', coverage: 'framework', speech: null },
  { id: 'tr', language: 'tr', name: 'Turkish', native: 'Türkçe', dir: 'ltr', coverage: 'framework', speech: null },
  { id: 'id', language: 'id', name: 'Indonesian', native: 'Bahasa Indonesia', dir: 'ltr', coverage: 'framework', speech: null },
  { id: 'bn', language: 'bn', name: 'Bengali', native: 'বাংলা', dir: 'ltr', coverage: 'framework', speech: null },
  { id: 'fa', language: 'fa', name: 'Persian', native: 'فارسی', dir: 'rtl', coverage: 'framework', speech: null },
  { id: 'he', language: 'he', name: 'Hebrew', native: 'עברית', dir: 'rtl', coverage: 'framework', speech: null },
];

const RTL = new Set(['ar', 'ur', 'fa', 'he', 'ps', 'sd', 'yi', 'dv']);

const COPY: Record<string, Record<string, string>> = {
  en: {
    'next.addProduct': 'Add your first product. You can type it in or import a spreadsheet.',
    'next.addProductBtn': 'Add a product',
    'next.finishListing': 'Finish listings that are missing a price, description, or image.',
    'next.finishBtn': 'Review listings',
    'next.launch': 'Publishing is blocked until a paid plan is active. Your products stay saved.',
    'next.launchBtn': 'See what is blocked',
    'next.payment': 'Card checkout is not connected to a processor. Nothing can be charged yet.',
    'next.paymentBtn': 'See payment setup',
    'next.ready': 'The saved setup steps are filled in. Publishing and live payments stay separate checks.',
    'voice.unsupported': 'Voice input is not available for this language in this browser. Type your request instead.',
    'voice.denied': 'Microphone permission was denied. Type your request instead.',
    'publish.blocked': 'Buy a plan to publish. The trial does not make the store public.',
    'import.approve': 'Existing products are updated only after you approve. Nothing is deleted.',
    'health.title': 'Store check',
    'insights.none': 'No stored orders in this range. There is no trend to report.',
    'insights.few': 'Fewer than 5 stored orders. A trend is not reported.',
    'bulk.preview': 'Preview the changes, then approve them. Prices and SKUs stay as they are.',
    'locale.fallback': 'This language is supported by the locale list. The words below are still English.',
  },
  ur: {
    'next.addProduct': 'پہلے ایک پروڈکٹ شامل کریں۔ آپ خود لکھ سکتے ہیں یا اسپریڈشیٹ درآمد کر سکتے ہیں۔',
    'next.addProductBtn': 'پروڈکٹ شامل کریں',
    'next.finishListing': 'جن فہرستوں میں قیمت، تفصیل یا تصویر نہیں، انہیں مکمل کریں۔',
    'next.finishBtn': 'فہرستیں دیکھیں',
    'next.launch': 'ادائیگی والا پلان فعال ہونے تک اشاعت بند ہے۔ آپ کی پروڈکٹس محفوظ رہتی ہیں۔',
    'next.launchBtn': 'دیکھیں کیا بند ہے',
    'next.payment': 'کارڈ چیک آؤٹ کسی پروسیسر سے جڑا نہیں۔ ابھی کوئی رقم نہیں کٹی۔',
    'next.paymentBtn': 'ادائیگی کی ترتیب دیکھیں',
    'next.ready': 'محفوظ ترتیب کے مراحل بھر چکے ہیں۔ اشاعت اور براہ راست ادائیگی الگ جانچ ہیں۔',
    'voice.unsupported': 'اس زبان کے لیے آواز اس براؤزر میں دستیاب نہیں۔ درخواست ٹائپ کریں۔',
    'voice.denied': 'مائیکروفون کی اجازت نہیں ملی۔ درخواست ٹائپ کریں۔',
    'publish.blocked': 'اشاعت کے لیے پلان خریدیں۔ آزمائش اسٹور کو عوامی نہیں کرتی۔',
    'import.approve': 'موجودہ پروڈکٹس تب ہی بدلیں گی جب آپ منظور کریں۔ کچھ حذف نہیں ہوتا۔',
    'health.title': 'اسٹور کی جانچ',
    'insights.none': 'اس مدت میں کوئی محفوظ آرڈر نہیں۔ رجحان نہیں بتایا جا سکتا۔',
    'insights.few': '5 سے کم محفوظ آرڈر ہیں۔ رجحان نہیں بتایا جاتا۔',
    'bulk.preview': 'تبدیلیاں پہلے دیکھیں، پھر منظور کریں۔ قیمت اور SKU وہی رہتے ہیں۔',
    'locale.fallback': 'یہ زبان فہرست میں ہے۔ نیچے کے الفاظ اب بھی انگریزی ہیں۔',
  },
  ar: {
    'next.addProduct': 'أضف منتجك الأول. يمكنك كتابته أو استيراد جدول.',
    'next.addProductBtn': 'أضف منتجًا',
    'next.finishListing': 'أكمل القوائم التي تنقصها سعر أو وصف أو صورة.',
    'next.finishBtn': 'راجع القوائم',
    'next.launch': 'النشر متوقف حتى تفعيل خطة مدفوعة. منتجاتك تبقى محفوظة.',
    'next.launchBtn': 'انظر ما المتوقف',
    'next.payment': 'الدفع بالبطاقة غير متصل بمعالج. لم يُخصم شيء.',
    'next.paymentBtn': 'انظر إعداد الدفع',
    'next.ready': 'خطوات الإعداد المحفوظة مكتملة. النشر والدفع المباشر فحصان منفصلان.',
    'voice.unsupported': 'الإدخال الصوتي غير متاح لهذه اللغة في هذا المتصفح. اكتب طلبك.',
    'voice.denied': 'تم رفض إذن الميكروفون. اكتب طلبك.',
    'publish.blocked': 'اشتر خطة للنشر. الفترة التجريبية لا تجعل المتجر عامًا.',
    'import.approve': 'لا تُحدَّث المنتجات الحالية إلا بعد موافقتك. لا يُحذف شيء.',
    'health.title': 'فحص المتجر',
    'insights.none': 'لا طلبات محفوظة في هذه الفترة. لا يوجد اتجاه يُعرض.',
    'insights.few': 'أقل من 5 طلبات محفوظة. لا يُعرض اتجاه.',
    'bulk.preview': 'عاين التغييرات ثم وافق. السعر وSKU يبقيان كما هما.',
    'locale.fallback': 'هذه اللغة في القائمة. الكلمات أدناه ما زالت بالإنجليزية.',
  },
  fr: {
    'next.addProduct': 'Ajoutez un premier produit. Vous pouvez le saisir ou importer un tableau.',
    'next.addProductBtn': 'Ajouter un produit',
    'next.finishListing': 'Complétez les fiches sans prix, description ou image.',
    'next.finishBtn': 'Voir les fiches',
    'next.launch': 'La publication est bloquée tant qu’un forfait payant n’est pas actif. Vos produits restent enregistrés.',
    'next.launchBtn': 'Voir ce qui est bloqué',
    'next.payment': 'Le paiement par carte n’est pas relié à un prestataire. Rien n’est débité.',
    'next.paymentBtn': 'Voir le paiement',
    'next.ready': 'Les étapes enregistrées sont remplies. Publication et paiement réel restent des contrôles séparés.',
    'voice.unsupported': 'La voix n’est pas disponible pour cette langue dans ce navigateur. Saisissez votre demande.',
    'voice.denied': 'Le micro a été refusé. Saisissez votre demande.',
    'publish.blocked': 'Achetez un forfait pour publier. L’essai ne rend pas la boutique publique.',
    'import.approve': 'Les produits existants ne changent qu’après votre accord. Rien n’est supprimé.',
    'health.title': 'Contrôle de la boutique',
    'insights.none': 'Aucune commande enregistrée sur cette période. Aucune tendance n’est affichée.',
    'insights.few': 'Moins de 5 commandes enregistrées. Aucune tendance n’est affichée.',
    'bulk.preview': 'Prévisualisez, puis approuvez. Les prix et SKU ne changent pas.',
    'locale.fallback': 'Cette langue est dans la liste. Le texte ci-dessous reste en anglais.',
  },
  es: {
    'next.addProduct': 'Añade tu primer producto. Puedes escribirlo o importar una hoja.',
    'next.addProductBtn': 'Añadir un producto',
    'next.finishListing': 'Completa las fichas a las que les falta precio, descripción o imagen.',
    'next.finishBtn': 'Revisar fichas',
    'next.launch': 'Publicar está bloqueado hasta que haya un plan de pago activo. Tus productos siguen guardados.',
    'next.launchBtn': 'Ver qué está bloqueado',
    'next.payment': 'El pago con tarjeta no está conectado a un procesador. No se cobra nada.',
    'next.paymentBtn': 'Ver el pago',
    'next.ready': 'Los pasos guardados están completos. Publicar y el cobro real siguen siendo comprobaciones aparte.',
    'voice.unsupported': 'La voz no está disponible para este idioma en este navegador. Escribe tu solicitud.',
    'voice.denied': 'Se denegó el micrófono. Escribe tu solicitud.',
    'publish.blocked': 'Compra un plan para publicar. La prueba no hace pública la tienda.',
    'import.approve': 'Los productos existentes solo cambian si lo apruebas. No se borra nada.',
    'health.title': 'Revisión de la tienda',
    'insights.none': 'No hay pedidos guardados en este periodo. No hay una tendencia que mostrar.',
    'insights.few': 'Hay menos de 5 pedidos guardados. No se muestra una tendencia.',
    'bulk.preview': 'Revisa los cambios y luego apruébalos. El precio y el SKU no cambian.',
    'locale.fallback': 'Este idioma está en la lista. El texto de abajo sigue en inglés.',
  },
  de: {
    'next.addProduct': 'Fügen Sie ein erstes Produkt hinzu. Sie können es eingeben oder eine Tabelle importieren.',
    'next.addProductBtn': 'Produkt hinzufügen',
    'next.finishListing': 'Vervollständigen Sie Einträge ohne Preis, Beschreibung oder Bild.',
    'next.finishBtn': 'Einträge prüfen',
    'next.launch': 'Veröffentlichen ist blockiert, bis ein bezahlter Plan aktiv ist. Ihre Produkte bleiben gespeichert.',
    'next.launchBtn': 'Sehen, was blockiert ist',
    'next.payment': 'Kartenzahlung ist mit keinem Anbieter verbunden. Es wird nichts abgebucht.',
    'next.paymentBtn': 'Zahlung ansehen',
    'next.ready': 'Die gespeicherten Schritte sind ausgefüllt. Veröffentlichen und echte Zahlung bleiben eigene Prüfungen.',
    'voice.unsupported': 'Spracheingabe ist für diese Sprache in diesem Browser nicht verfügbar. Tippen Sie Ihre Anfrage.',
    'voice.denied': 'Das Mikrofon wurde abgelehnt. Tippen Sie Ihre Anfrage.',
    'publish.blocked': 'Kaufen Sie einen Plan zum Veröffentlichen. Die Testphase macht den Shop nicht öffentlich.',
    'import.approve': 'Vorhandene Produkte ändern sich erst nach Ihrer Zustimmung. Nichts wird gelöscht.',
    'health.title': 'Shop-Prüfung',
    'insights.none': 'Keine gespeicherten Bestellungen in diesem Zeitraum. Es gibt keinen Trend.',
    'insights.few': 'Weniger als 5 gespeicherte Bestellungen. Ein Trend wird nicht angezeigt.',
    'bulk.preview': 'Änderungen zuerst ansehen, dann freigeben. Preis und SKU bleiben gleich.',
    'locale.fallback': 'Diese Sprache steht in der Liste. Der Text darunter bleibt Englisch.',
  },
};

const CURRENCY_NAME: Record<string, string> = {
  USD: 'US Dollar', PKR: 'Pakistani Rupee', EUR: 'Euro', GBP: 'British Pound', AED: 'UAE Dirham', SAR: 'Saudi Riyal',
  INR: 'Indian Rupee', CAD: 'Canadian Dollar', AUD: 'Australian Dollar',
};

export function escapeHtml(value: unknown): string {
  return String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
}

export function parseLocale(input: unknown): { ok: true; canonical: string; language: string; region?: string } | { ok: false; error: string } {
  const raw = String(input ?? '').trim().replace(/_/g, '-');
  if (!raw || raw.length > 32 || /all languages/i.test(raw)) return { ok: false, error: 'Enter a locale such as en, ur-PK, or zh-Hans.' };
  const parts = raw.split('-').filter(Boolean);
  const language = parts[0].toLowerCase();
  if (!/^[a-z]{2,3}$/.test(language)) return { ok: false, error: 'The language code must be 2 or 3 letters.' };
  let i = 1;
  let script: string | undefined;
  let region: string | undefined;
  if (parts[i] && /^[A-Za-z]{4}$/.test(parts[i])) {
    script = parts[i][0].toUpperCase() + parts[i].slice(1).toLowerCase();
    i++;
  }
  if (parts[i]) {
    region = /^\d{3}$/.test(parts[i]) ? parts[i] : parts[i].toUpperCase();
    if (!/^([A-Z]{2}|\d{3})$/.test(region)) return { ok: false, error: 'The region code is not valid.' };
    i++;
  }
  if (parts[i]) return { ok: false, error: 'This locale has an extra segment that Sellora does not use.' };
  return { ok: true, canonical: [language, script, region].filter(Boolean).join('-'), language, region };
}

export function localeInfo(language: string): LocaleInfo | null {
  return LOCALES.find(l => l.language === language || l.id === language) || null;
}

export function directionFor(language: string): 'ltr' | 'rtl' {
  return RTL.has(language) ? 'rtl' : 'ltr';
}

export function resolveText(locale: string, key: string): { text: string; status: 'translated' | 'fallback' | 'missing'; locale: string; requested: string; coverage: Coverage | 'unknown' } {
  const parsed = parseLocale(locale);
  const requested = parsed.ok ? parsed.canonical : 'en';
  const language = parsed.ok ? parsed.language : 'en';
  const info = localeInfo(language);
  const chain = [language, 'en'];
  for (const code of chain) {
    const text = COPY[code]?.[key];
    if (text) {
      const status = code === language && info?.coverage === 'verified' ? 'translated' : 'fallback';
      return { text, status: code === language ? status : 'fallback', locale: code, requested, coverage: info?.coverage || 'unknown' };
    }
  }
  return { text: key, status: 'missing', locale: 'en', requested, coverage: info?.coverage || 'unknown' };
}

export function speechFor(locale: string): { supported: boolean; lang: string | null; message: string } {
  const parsed = parseLocale(locale);
  const language = parsed.ok ? parsed.language : 'en';
  const info = localeInfo(language);
  if (info?.coverage === 'verified' && info.speech) return { supported: true, lang: info.speech, message: '' };
  return { supported: false, lang: null, message: resolveText('en', 'voice.unsupported').text };
}

export function formatMoney(amount: number, currency: string, locale = 'en'): { text: string; currency: string; name: string; converted: false } {
  const code = String(currency || 'USD').toUpperCase();
  const name = CURRENCY_NAME[code] || code;
  const parsed = parseLocale(locale);
  const loc = parsed.ok ? parsed.canonical : 'en';
  let num = Number(amount).toFixed(2);
  try { num = new Intl.NumberFormat(loc, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount); } catch { /* keep the fixed string */ }
  return { text: `${num} ${name} (${code})`, currency: code, name, converted: false };
}

export function formatWhen(ms: number, locale: string, timeZone: string): string {
  const parsed = parseLocale(locale);
  const loc = parsed.ok ? parsed.canonical : 'en';
  try { return new Intl.DateTimeFormat(loc, { timeZone, dateStyle: 'medium', timeStyle: 'short' }).format(new Date(ms)); }
  catch { return new Date(ms).toISOString(); }
}

export type Rate = { from: string; to: string; value: number; source: string; asOf: string };

export function convertMoney(amount: number, from: string, to: string, rate: Rate | null) {
  const src = String(from || '').toUpperCase();
  const dst = String(to || '').toUpperCase();
  if (src === dst) return { ok: true, amount, converted: false as const, source: null, asOf: null };
  if (!rate || rate.source == null || !rate.asOf || rate.from.toUpperCase() !== src || rate.to.toUpperCase() !== dst || !(rate.value > 0)) {
    return { ok: false, converted: false as const, error: 'No sourced exchange rate is stored for this pair. The amount was not converted.' };
  }
  return { ok: true, amount: Math.round(amount * rate.value * 100) / 100, converted: true as const, source: rate.source, asOf: rate.asOf };
}

export function nextStep(store: { products?: any[]; sub9?: { status?: string }; paymentLive?: boolean }) {
  const products = (store.products || []).filter(p => !p.demo);
  if (!products.length) return { id: 'addProduct', blocked: [] as string[], ready: false };
  const incomplete = products.filter(p => p.price == null || p.price === '' || !String(p.desc || p.description || '').trim() || !(p.imgs || p.images || []).length);
  if (incomplete.length) return { id: 'finishListing', blocked: [] as string[], ready: false, count: incomplete.length };
  if (!store.sub9 || store.sub9.status !== 'active') return { id: 'launch', blocked: ['publish'], ready: false };
  if (!store.paymentLive) return { id: 'payment', blocked: ['payment'], ready: false };
  return { id: 'ready', blocked: [] as string[], ready: true };
}

const CLAIM = /#\s*1|number one|guaranteed ranking|best in the world|clinically proven|cure[sd]? /i;

export type ProductLike = { id: string | number; name?: string; title?: string; desc?: string; description?: string; price?: number | null; sku?: string; imgs?: string[]; images?: string[]; alt?: string; handle?: string; demo?: boolean };

export function bulkDryRun(products: ProductLike[], ids: Array<string | number>, change: { alt?: 'use-name'; description?: string; price?: number; sku?: string }, explicit: { price?: boolean; sku?: boolean } = {}) {
  if (change.price != null && !explicit.price) return { ok: false as const, error: 'Price stays unchanged unless the request explicitly includes price.' };
  if (change.sku != null && !explicit.sku) return { ok: false as const, error: 'SKU stays unchanged unless the request explicitly includes SKU.' };
  const diffs: Array<{ id: string | number; field: string; before: string; after: string }> = [];
  const rejected: Array<{ id: string | number; field: string; reason: string }> = [];
  products.filter(p => ids.map(String).includes(String(p.id))).forEach(p => {
    const name = p.name || p.title || '';
    if (change.alt === 'use-name') diffs.push({ id: p.id, field: 'alt', before: p.alt || '', after: name });
    if (change.description != null) {
      if (CLAIM.test(change.description) && !CLAIM.test(p.desc || p.description || '')) rejected.push({ id: p.id, field: 'description', reason: 'The text adds a ranking or proof claim that was not in the original.' });
      else diffs.push({ id: p.id, field: 'description', before: p.desc || p.description || '', after: change.description });
    }
    if (explicit.price && change.price != null) diffs.push({ id: p.id, field: 'price', before: String(p.price ?? ''), after: String(change.price) });
    if (explicit.sku && change.sku != null) diffs.push({ id: p.id, field: 'sku', before: p.sku || '', after: change.sku });
  });
  return { ok: true as const, diffs, rejected, applied: false };
}

export function bulkApply<T extends ProductLike>(products: T[], dry: ReturnType<typeof bulkDryRun>) {
  if (!dry.ok) return { ok: false as const, error: dry.error };
  const undo = dry.diffs.map(d => ({ ...d }));
  undo.forEach(d => {
    const p = products.find(x => String(x.id) === String(d.id));
    if (!p) return;
    if (d.field === 'alt') p.alt = d.after;
    if (d.field === 'description') { p.desc = d.after; p.description = d.after; }
    if (d.field === 'price') p.price = Number(d.after);
    if (d.field === 'sku') p.sku = d.after;
  });
  return { ok: true as const, undo, applied: dry.diffs.length };
}

export function bulkUndo<T extends ProductLike>(products: T[], undo: Array<{ id: string | number; field: string; before: string }>) {
  undo.forEach(d => {
    const p = products.find(x => String(x.id) === String(d.id));
    if (!p) return;
    if (d.field === 'alt') p.alt = d.before;
    if (d.field === 'description') { p.desc = d.before; p.description = d.before; }
    if (d.field === 'price') p.price = d.before === '' ? null : Number(d.before);
    if (d.field === 'sku') p.sku = d.before;
  });
  return { ok: true as const, reverted: undo.length };
}

export function quotaDecision(used: number, included: number, requested: number, overageOptIn: boolean) {
  if (requested < 1) return { allowed: false, reason: 'Nothing was requested.' };
  if (included < 0) return { allowed: true, reason: 'unlimited' };
  if (used + requested <= included) return { allowed: true, reason: 'within allowance' };
  if (overageOptIn) return { allowed: true, reason: 'opt-in overage' };
  return { allowed: false, reason: 'The store AI allowance is used up. Nothing was sent to a provider.' };
}

export const TOKEN_BOUNDARY = {
  billingActive: false,
  proposedMonthlyUsd: 20,
  note: 'Proposed cap only. Current plan prices are unchanged. This is not a measured production bill.',
  totalCap: 10_000_000,
  outputCap: 2_000_000,
};

export function meterTokens(usage: { input: number; output: number; cached?: number }, state: { usedInput: number; usedOutput: number; overageOptIn?: boolean }) {
  const input = Math.max(0, usage.input || 0);
  const output = Math.max(0, usage.output || 0);
  const cached = Math.max(0, Math.min(input, usage.cached || 0));
  const nextOut = state.usedOutput + output;
  const nextTotal = state.usedInput + state.usedOutput + input + output;
  const over = nextOut > TOKEN_BOUNDARY.outputCap || nextTotal > TOKEN_BOUNDARY.totalCap;
  if (over && !state.overageOptIn) return { allowed: false, billingActive: false, reason: 'cap', input, output, cached, cacheMiss: input - cached };
  return { allowed: true, billingActive: false, reason: state.overageOptIn && over ? 'opt-in overage' : 'within cap', input, output, cached, cacheMiss: input - cached };
}

export function providerTranslation(providerAvailable: boolean, text: string | null) {
  if (!providerAvailable || !text) return { translated: false, blocked: 'missing-provider' as const, text: null, live: 'UNVERIFIED' as const };
  return { translated: true, blocked: null, text, live: 'UNVERIFIED' as const };
}

export type Translation = { id: string; entity: 'product' | 'page' | 'menu'; entityId: string; locale: string; fields: Record<string, string>; status: 'draft' | 'approved'; provider: 'manual' | 'blocked' | 'deepseek' | 'claude'; brandKept: boolean };

export function draftTranslation(input: { id: string; entity: Translation['entity']; entityId: string; locale: string; original: string; fields: Record<string, string>; brandNames: string[]; provider: Translation['provider']; providerText: string | null }): { ok: true; record: Translation } | { ok: false; translated: false; blocked?: string; reason?: string; names?: string[] } {
  const parsed = parseLocale(input.locale);
  if (!parsed.ok) return { ok: false, translated: false, reason: parsed.error };
  if (input.provider !== 'manual') {
    const got = providerTranslation(input.provider === 'deepseek' || input.provider === 'claude', input.providerText);
    if (!got.translated) return { ok: false, translated: false, blocked: 'missing-provider' };
  }
  const joined = Object.values(input.fields).join('\n');
  const names = input.brandNames.filter(n => n && input.original.includes(n) && !joined.includes(n));
  if (names.length) return { ok: false, translated: false, reason: 'A brand name was removed from the translation.', names };
  return { ok: true, record: { id: input.id, entity: input.entity, entityId: input.entityId, locale: parsed.canonical, fields: input.fields, status: 'draft', provider: input.provider, brandKept: true } };
}

export function approveTranslation(list: Translation[], id: string) {
  const row = list.find(t => t.id === id);
  if (!row) return { ok: false as const, error: 'Translation not found.' };
  row.status = 'approved';
  return { ok: true as const, record: row };
}

export function revertTranslation(list: Translation[], id: string) {
  const i = list.findIndex(t => t.id === id);
  if (i < 0) return { ok: false as const, error: 'Translation not found.' };
  const [row] = list.splice(i, 1);
  return { ok: true as const, reverted: row };
}

export function neutralizeFormula(value: unknown): { value: string; neutralized: boolean } {
  const s = String(value ?? '');
  if (/^[=+\-@\t\r]/.test(s)) return { value: `'${s}`, neutralized: true };
  return { value: s, neutralized: false };
}

export function parseCsv(text: string): string[][] {
  const src = String(text || '').replace(/^\uFEFF/, '');
  const out: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c === '"' && src[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && src[i + 1] === '\n') i++;
      row.push(field); out.push(row); row = []; field = '';
    } else field += c;
  }
  if (field || row.length) { row.push(field); out.push(row); }
  return out.filter(r => r.some(c => c.trim()));
}

export function dryRunCsv(text: string, existingHandles: string[], opts: { approveOverwrite?: boolean } = {}) {
  const rows = parseCsv(text);
  if (!rows.length) return { ok: false as const, error: 'The file is empty.', rows: [] as any[], neutralized: 0 };
  const header = rows[0].map(h => h.trim().toLowerCase());
  const ix = (...names: string[]) => { for (const n of names) { const i = header.indexOf(n); if (i >= 0) return i; } return -1; };
  if (ix('handle', 'title') < 0) return { ok: false as const, error: 'The file needs a Handle or Title column.', rows: [] as any[], neutralized: 0 };
  const have = new Set(existingHandles.map(h => h.toLowerCase()));
  const seenTitle = new Set<string>();
  let neutralized = 0;
  const planned: any[] = [];
  rows.slice(1).forEach((r, n) => {
    const cell = (i: number) => i < 0 ? '' : (r[i] || '');
    const rawHandle = cell(ix('handle')).trim();
    const titleCell = neutralizeFormula(cell(ix('title')));
    const bodyCell = neutralizeFormula(cell(ix('body (html)', 'body', 'description')));
    const skuCell = neutralizeFormula(cell(ix('variant sku', 'sku')));
    if (titleCell.neutralized || bodyCell.neutralized || skuCell.neutralized) neutralized++;
    const handle = (rawHandle || titleCell.value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const line = n + 2;
    if (!handle) { planned.push({ line, action: 'error', message: 'Missing Handle and Title.' }); return; }
    if (!titleCell.value) {
      if (seenTitle.has(handle)) { planned.push({ line, action: 'variant', handle }); return; }
      planned.push({ line, action: 'error', handle, message: 'Missing Title.' }); return;
    }
    if (seenTitle.has(handle)) { planned.push({ line, action: 'error', handle, message: 'This handle already has a title row in the file.' }); return; }
    seenTitle.add(handle);
    const exists = have.has(handle);
    const action = !exists ? 'create' : opts.approveOverwrite ? 'update' : 'skip';
    planned.push({ line, action, handle, title: titleCell.value, description: bodyCell.value, sku: skuCell.value, message: exists && action === 'skip' ? 'Already stored. Approve overwrite to update it. It was not changed.' : '' });
  });
  return { ok: true as const, neutralized, rows: planned, deleted: 0 };
}

export function classifyUrl(url: string): { class: 'invalid' | 'blocked' | 'external-unverified' | 'relative'; reason: string } {
  if (!url) return { class: 'invalid', reason: 'empty' };
  if (url.startsWith('/') || url.startsWith('#')) return { class: 'relative', reason: 'internal' };
  let u: URL;
  try { u = new URL(url); } catch { return { class: 'invalid', reason: 'unparseable' }; }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') return { class: 'blocked', reason: 'protocol' };
  const host = u.hostname.replace(/^\[|\]$/g, '').toLowerCase();
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') || host === '0.0.0.0') return { class: 'blocked', reason: 'local' };
  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(host);
  if (m) {
    const p = m.slice(1).map(Number);
    if (p.some(n => n > 255)) return { class: 'invalid', reason: 'ip' };
    const [a, b] = p;
    if (a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168)) return { class: 'blocked', reason: 'private' };
  }
  if (host === '::1' || host.startsWith('fc') || host.startsWith('fd') || host.startsWith('fe80')) return { class: 'blocked', reason: 'private' };
  return { class: 'external-unverified', reason: 'not fetched' };
}

export function healthCheck(store: { products?: ProductLike[]; pages?: Array<{ h?: string; handle?: string }>; menus?: Array<{ items?: Array<{ url?: string }> }>; collections?: Array<{ handle?: string; title?: string }> }, browserMobile?: { overflow: boolean } | null) {
  const findings: Array<{ code: string; severity: 'info' | 'attention'; verified: 'structural' | 'browser' | 'possible'; detail: string }> = [];
  const products = (store.products || []).filter(p => !p.demo);
  const handles = new Set(products.map(p => (p.handle || '').toLowerCase()).filter(Boolean));
  const pages = new Set((store.pages || []).map(p => String(p.h || p.handle || '').toLowerCase()));
  products.forEach(p => {
    const name = p.name || p.title || 'Untitled product';
    if (p.price == null || p.price === ('' as any)) findings.push({ code: 'incomplete-price', severity: 'attention', verified: 'structural', detail: `${name} has no price.` });
    if (!String(p.desc || p.description || '').trim()) findings.push({ code: 'incomplete-description', severity: 'attention', verified: 'structural', detail: `${name} has no description.` });
    if (!(p.imgs || p.images || []).length) findings.push({ code: 'missing-image', severity: 'attention', verified: 'structural', detail: `${name} has no image.` });
    (p.imgs || p.images || []).forEach(src => {
      const c = classifyUrl(String(src));
      if (c.class === 'blocked') findings.push({ code: 'blocked-link', severity: 'attention', verified: 'structural', detail: `${name} image was not requested (${c.reason}).` });
      if (c.class === 'external-unverified') findings.push({ code: 'external-link', severity: 'info', verified: 'structural', detail: `${name} image is on another site and was not fetched.` });
    });
  });
  (store.menus || []).forEach(m => (m.items || []).forEach(item => {
    const url = item.url || '';
    const product = url.match(/^\/products\/([^/?#]+)/);
    const page = url.match(/^\/pages\/([^/?#]+)/);
    if (product && !handles.has(decodeURIComponent(product[1]).toLowerCase())) findings.push({ code: 'broken-link', severity: 'attention', verified: 'structural', detail: `Menu link ${url} does not match a stored product.` });
    if (page && !pages.has(decodeURIComponent(page[1]).toLowerCase())) findings.push({ code: 'broken-link', severity: 'attention', verified: 'structural', detail: `Menu link ${url} does not match a stored page.` });
    const c = classifyUrl(url);
    if (c.class === 'blocked') findings.push({ code: 'blocked-link', severity: 'attention', verified: 'structural', detail: `Menu link was not requested (${c.reason}).` });
  }));
  if (browserMobile == null) findings.push({ code: 'mobile-unverified', severity: 'info', verified: 'possible', detail: 'Mobile layout was not measured in a browser. This is not a confirmed mobile error.' });
  else if (browserMobile.overflow) findings.push({ code: 'mobile-overflow', severity: 'attention', verified: 'browser', detail: 'A browser check found content wider than the screen.' });
  return { source: 'stored-records' as const, findings };
}

export type InsightOrder = { id?: string | number; demo?: boolean; cur?: string; currency?: string; total?: number | null; at?: number | null; createdAt?: string | Date | null; st?: string; status?: string; financial?: string; fulfillment?: string; delivered?: boolean | null };

export function salesInsights(orders: InsightOrder[], opts: { from?: number | null; to?: number | null; timeZone: string; previous?: InsightOrder[]; sourceNote: string }) {
  const inRange = (o: InsightOrder) => {
    if (o.demo) return false;
    const raw = o.at ?? (o.createdAt ? new Date(o.createdAt).getTime() : null);
    if (raw == null || !isFinite(Number(raw))) return opts.from == null && opts.to == null;
    const t = Number(raw);
    if (opts.from != null && t < opts.from) return false;
    if (opts.to != null && t > opts.to) return false;
    return true;
  };
  const rows = (orders || []).filter(inRange);
  const groups: Record<string, { count: number; total: number; unknownPayment: number; unpaid: number; fulfilled: number; unfulfilled: number; deliveryUnknown: number; delivered: number }> = {};
  rows.forEach(o => {
    const cur = String(o.cur || o.currency || 'UNKNOWN').toUpperCase();
    const g = groups[cur] || (groups[cur] = { count: 0, total: 0, unknownPayment: 0, unpaid: 0, fulfilled: 0, unfulfilled: 0, deliveryUnknown: 0, delivered: 0 });
    g.count++;
    if (typeof o.total === 'number' && isFinite(o.total)) g.total += o.total;
    const fin = `${o.financial || ''} ${o.st || ''} ${o.status || ''}`.toLowerCase();
    if (/unpaid|pending/.test(fin) && !/paid/.test(fin)) g.unpaid++;
    else if (!/paid|held|refund/.test(fin)) g.unknownPayment++;
    const ful = `${o.fulfillment || ''} ${o.st || ''}`.toLowerCase();
    if (/unfulfilled/.test(ful) || (/\bpaid\b/.test(fin) && !/fulfilled|shipped/.test(ful))) g.unfulfilled++;
    if (/fulfilled|shipped/.test(ful)) g.fulfilled++;
    if (o.delivered === true || /\bdelivered\b/.test(fin)) g.delivered++;
    else g.deliveryUnknown++;
  });
  const suggestions: Array<{ code: string; text: string }> = [];
  if (!rows.length) suggestions.push({ code: 'no-orders', text: 'No stored orders in this range. There is no trend to report.' });
  else if (rows.length < 5) suggestions.push({ code: 'few', text: 'Fewer than 5 stored orders. A trend is not reported.' });
  const unfulfilled = Object.values(groups).reduce((a, g) => a + g.unfulfilled, 0);
  if (unfulfilled) suggestions.push({ code: 'unfulfilled', text: `${unfulfilled} stored order${unfulfilled === 1 ? ' is' : 's are'} unfulfilled. Fulfilled does not mean delivered.` });
  if (rows.length && Object.values(groups).every(g => g.deliveryUnknown === g.count)) suggestions.push({ code: 'delivery-unknown', text: 'Delivery is unknown for every stored order in this range. That is not the same as undelivered.' });
  const prev = (opts.previous || []).filter(o => !o.demo);
  if (rows.length >= 5 && prev.length >= 5) suggestions.push({ code: 'count-compare', text: `This range has ${rows.length} stored orders and the comparison range has ${prev.length}. This is a count, not a forecast.` });
  return { source: 'stored-records' as const, synchronizedWithServer: false, sourceNote: opts.sourceNote, timeZone: opts.timeZone, from: opts.from ?? null, to: opts.to ?? null, count: rows.length, currencies: groups, suggestions, summedAcrossCurrencies: false };
}

export function readiness(env: { deepseek?: boolean; claude?: boolean; tracking?: boolean; stripe?: boolean; paymentLive?: boolean }) {
  return [
    { id: 'sellora-pay', area: 'payment', state: env.paymentLive ? 'configured-unverified' : 'not-connected', env: [] as string[], note: 'Browser checkout does not call a processor. A local card result is not a live charge.' },
    { id: 'stripe', area: 'payment', state: env.stripe ? 'configured-unverified' : 'missing-config', env: ['PAYMENT_PROVIDER', 'STRIPE_SECRET_KEY'], note: 'Not activated from this admin.' },
    { id: 'deepseek', area: 'translation', state: env.deepseek ? 'configured-unverified' : 'missing-config', env: ['DEEPSEEK_API_KEY'], note: 'Main translation and copy provider. A missing key is not a completed translation.' },
    { id: 'claude', area: 'translation', state: env.claude ? 'configured-unverified' : 'missing-config', env: ['ANTHROPIC_API_KEY'], optional: true, note: 'Optional. Used only when DeepSeek returns nothing.' },
    { id: 'tracking', area: 'shipping', state: env.tracking ? 'configured-unverified' : 'missing-config', env: ['TRACKING_API_URL', 'TRACKING_API_KEY'], note: 'Country zones the seller saves are not a live carrier account.' },
  ];
}

export function sizeChart(rows: Array<{ label: string; region: string; value: string }>) {
  return { converted: false as const, note: 'These sizes are the labels you entered. Sellora does not guess a conversion.', rows: rows.map(r => ({ ...r })) };
}
