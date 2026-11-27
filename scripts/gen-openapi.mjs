// Writes openapi/core-api.v1.json from the built contracts (run via `pnpm gen:openapi`).
import { writeFileSync } from 'node:fs';
import { buildCoreApiOpenApi } from '../dist/index.js';

const out = new URL('../openapi/core-api.v1.json', import.meta.url);
writeFileSync(out, JSON.stringify(buildCoreApiOpenApi(), null, 2) + '\n');
console.log(`wrote ${out.pathname}`);
