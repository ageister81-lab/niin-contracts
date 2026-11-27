/**
 * @niinid/contracts — the source of truth for wire shapes between Niin services (ADR 0007, ADR 0011).
 * Change contracts here first, bump the version, then implement in the services.
 */
export { CONTRACTS_VERSION } from './version.js';
export * from './ids.js';
export * from './events/envelope.js';
export * from './events/catalog.js';
export * from './audit.js';
export * from './api/core-api.js';
export { buildCoreApiOpenApi } from './openapi.js';
