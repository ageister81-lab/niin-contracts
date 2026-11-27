/**
 * @niinid/contracts — the source of truth for wire shapes between Niin services (ADR 0007, ADR 0011).
 *
 * M0: package skeleton only. M1 adds the CloudEvents envelope, the audit event schema and the
 * Identity & Key OpenAPI spec, with generated types and Zod validators exported from here.
 */

/** Semver of the contract set. Bump per ADR 0011 (breaking change → major). */
export const CONTRACTS_VERSION = '0.0.0';

/** Prefixes for wire IDs (engineering-standards.md §1). */
export const ID_PREFIXES = {
  person: 'per',
  organization: 'org',
  engagement: 'eng',
  joinRequest: 'jrq',
  presentation: 'prs',
  credential: 'cred',
  device: 'dev',
  event: 'evt',
} as const;

export type IdPrefix = (typeof ID_PREFIXES)[keyof typeof ID_PREFIXES];
