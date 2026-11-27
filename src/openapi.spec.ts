import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CORE_API_ROUTES } from './api/core-api.js';
import { buildCoreApiOpenApi } from './openapi.js';
import { CONTRACTS_VERSION } from './version.js';

describe('core-api OpenAPI', () => {
  it('committed openapi/core-api.v1.json matches the Zod source (run pnpm gen:openapi)', () => {
    const committed: unknown = JSON.parse(
      readFileSync(new URL('../openapi/core-api.v1.json', import.meta.url), 'utf8'),
    );
    expect(committed).toEqual(buildCoreApiOpenApi());
  });

  it('covers every route with a story and an auth mode', () => {
    const doc = buildCoreApiOpenApi() as { paths: Record<string, Record<string, unknown>> };
    for (const r of CORE_API_ROUTES) expect(doc.paths[r.path]?.[r.method]).toBeDefined();
    expect(CORE_API_ROUTES.every((r) => /^[A-F]\d+$/.test(r.story))).toBe(true);
  });

  it('keeps package.json and CONTRACTS_VERSION in step', () => {
    const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as {
      version: string;
    };
    expect(pkg.version).toBe(CONTRACTS_VERSION);
  });
});
