/** OpenAPI 3 document built from the mounted routers (every endpoint listed, grouped by tag). */
export const openapi: any = {
  openapi: '3.0.3',
  info: { title: 'Sellora API', version: '1.0.0', description: 'Multi-tenant commerce + Sellora Pay escrow. Money is integer minor units + ISO currency. Auth: Bearer access token from /api/auth/login. Money endpoints accept Idempotency-Key.' },
  servers: [{ url: '/' }],
  components: { securitySchemes: { bearer: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } } },
  paths: {},
};
const tagOf = (p: string) => { const m = p.match(/^\/api\/(stores\/\{storeId\}\/)?([a-z-]+)/); return m ? (m[1] ? m[2] : m[2]) : 'public'; };
export function addPaths(prefix: string, router: any, secured: boolean) {
  for (const l of router.stack || []) {
    if (!l.route) continue;
    const full = (prefix + l.route.path).replace(/:(\w+)(\([^)]*\))?/g, '{$1}');
    const params = [...full.matchAll(/\{(\w+)\}/g)].map(m => ({ name: m[1], in: 'path', required: true, schema: { type: 'string' } }));
    for (const method of Object.keys(l.route.methods)) {
      openapi.paths[full] = openapi.paths[full] || {};
      openapi.paths[full][method] = { tags: [tagOf(full)], summary: `${method.toUpperCase()} ${full}`, parameters: params, ...(secured || full.includes('/me') ? { security: [{ bearer: [] }] } : {}), ...(['post', 'patch', 'put'].includes(method) ? { requestBody: { content: { 'application/json': { schema: { type: 'object' } } } } } : {}), responses: { 200: { description: 'OK' }, '4XX': { description: 'Error {error, details}' } } };
    }
  }
}
