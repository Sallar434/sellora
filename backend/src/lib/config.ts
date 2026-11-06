import fs from 'fs';
// tiny .env loader (no dependency)
if (fs.existsSync('.env')) for (const l of fs.readFileSync('.env', 'utf8').split('\n')) { const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(?:"([^"]*)"|([^#]*?))\s*(?:#.*)?$/); if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2] ?? m[3] ?? ''; }
const e = process.env;
export const config = {
  port: +(e.PORT || 4000),
  env: e.NODE_ENV || 'development',
  jwtSecret: e.JWT_SECRET || 'dev-only-change-me',
  jwtRefreshSecret: e.JWT_REFRESH_SECRET || 'dev-only-refresh-change-me',
  encKey: e.ENCRYPTION_KEY || '0'.repeat(64), // 32-byte hex for AES-256-GCM
  corsOrigins: (e.CORS_ORIGINS || '*').split(','),
  publicUrl: e.PUBLIC_URL || `http://localhost:${e.PORT || 4000}`,
  platformFeeBps: +(e.PLATFORM_FEE_BPS || 250),
  escrowAutoReleaseDays: +(e.ESCROW_AUTO_RELEASE_DAYS || 7),
  redisUrl: e.REDIS_URL || '',
  smtpUrl: e.SMTP_URL || '', mailFrom: e.MAIL_FROM || 'Sellora <no-reply@sellora.app>',
  smsProvider: e.SMS_PROVIDER || 'mock', twilioSid: e.TWILIO_ACCOUNT_SID || '', twilioToken: e.TWILIO_AUTH_TOKEN || '', twilioFrom: e.TWILIO_FROM || '',
  paymentProvider: e.PAYMENT_PROVIDER || 'mock', stripeKey: e.STRIPE_SECRET_KEY || '', stripeWebhookSecret: e.STRIPE_WEBHOOK_SECRET || '',
  llmBaseUrl: e.LLM_BASE_URL || '', llmApiKey: e.LLM_API_KEY || '', llmModel: e.LLM_MODEL || 'gpt-4o-mini',
  llmProvider: e.LLM_PROVIDER || (e.DEEPSEEK_API_KEY ? 'deepseek' : e.LLM_API_KEY ? 'openai' : 'mock'),
  deepseekKey: e.DEEPSEEK_API_KEY || '', deepseekBase: e.DEEPSEEK_BASE_URL || 'https://api.deepseek.com', deepseekModel: e.DEEPSEEK_MODEL || 'deepseek-flash', deepseekThinking: e.DEEPSEEK_THINKING === '1',
  sttProvider: e.STT_PROVIDER || 'browser', sttUrl: e.STT_URL || '', sttKey: e.STT_API_KEY || '',
  indexNowKey: e.INDEXNOW_KEY || '', rankApiUrl: e.RANK_API_URL || '', rankApiKey: e.RANK_API_KEY || '', competitorFetch: e.COMPETITOR_FETCH === '1', psiKey: e.PAGESPEED_API_KEY || '',
  storage: e.STORAGE_DRIVER || 'local', uploadDir: e.UPLOAD_DIR || 'uploads',
  s3: { endpoint: e.S3_ENDPOINT || '', bucket: e.S3_BUCKET || '', region: e.S3_REGION || 'auto', key: e.S3_ACCESS_KEY_ID || '', secret: e.S3_SECRET_ACCESS_KEY || '', publicUrl: e.S3_PUBLIC_URL || '' },
  fxProvider: e.FX_PROVIDER || 'static', fxUrl: e.FX_API_URL || '',
  outWebhookSecret: e.WEBHOOK_SIGNING_SECRET || 'whsec_dev',
};
if (config.env === 'production') { const weak = (v: string) => !v || v.startsWith('dev-') || v.startsWith('change-me') || v.length < 16; if (weak(config.jwtSecret) || weak(config.jwtRefreshSecret)) throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must be set to strong values in production'); if (/^0+$/.test(config.encKey) || config.encKey.length !== 64) throw new Error('ENCRYPTION_KEY (64 hex chars) must be set in production'); }
