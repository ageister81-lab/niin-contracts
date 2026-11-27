import { z } from 'zod';
import { CORE_API_ROUTES, Problem } from './api/core-api.js';
import { CONTRACTS_VERSION } from './version.js';

type Json = Record<string, unknown>;

function schema(s: z.ZodType): Json {
  return z.toJSONSchema(s, { target: 'openapi-3.0', unrepresentable: 'any' });
}

const AUTH_NOTE = {
  none: 'No session needed.',
  session: 'Requires a session cookie (`__Host-niin_session`).',
  'session+fresh':
    'Requires a session cookie and a passkey check from the last 5 minutes (`/v1/me/reauth/*`).',
} as const;

/** Builds the OpenAPI 3.1 document for core-api from the Zod route table. Deterministic output. */
export function buildCoreApiOpenApi(): Json {
  const paths: Record<string, Record<string, Json>> = {};
  for (const r of CORE_API_ROUTES) {
    const op: Json = {
      summary: r.summary,
      description: `Story ${r.story}. ${AUTH_NOTE[r.auth]}`,
      operationId: `${r.method}${r.path.replace(/[^a-zA-Z0-9]+/g, '_')}`,
      responses: {
        [String(r.status)]: r.response
          ? { description: 'OK', content: { 'application/json': { schema: schema(r.response) } } }
          : { description: 'No content' },
        default: {
          description: 'Error (RFC 9457)',
          content: { 'application/problem+json': { schema: schema(Problem) } },
        },
      },
    };
    if (r.body) {
      op.requestBody = {
        required: true,
        content: { 'application/json': { schema: schema(r.body) } },
      };
    }
    if (r.path.includes('{device_id}')) {
      op.parameters = [
        { name: 'device_id', in: 'path', required: true, schema: { type: 'string' } },
      ];
    }
    if (r.auth !== 'none') op.security = [{ session: [] }];
    const item = (paths[r.path] ??= {});
    item[r.method] = op;
  }
  return {
    openapi: '3.1.0',
    info: { title: 'Niin core-api', version: CONTRACTS_VERSION },
    servers: [{ url: 'https://api.niinid.com' }],
    components: {
      securitySchemes: {
        session: { type: 'apiKey', in: 'cookie', name: '__Host-niin_session' },
      },
    },
    paths,
  };
}
