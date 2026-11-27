import { z } from 'zod';

/**
 * Wire IDs (engineering-standards.md §1): `<prefix>_<26 Crockford base32 chars>`.
 * The 26 chars encode the 128-bit UUIDv7 stored in Postgres, so a wire ID and a row ID convert
 * losslessly. The prefix says what the ID is, so IDs can't be mixed up across types.
 */
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

export type IdKind = keyof typeof ID_PREFIXES;
export type IdPrefix = (typeof ID_PREFIXES)[IdKind];

const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const BODY_RE = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/;

/** Encode a UUID (any version) as 26 Crockford base32 characters. */
export function uuidToBase32(uuid: string): string {
  const hex = uuid.toLowerCase();
  if (!UUID_RE.test(hex)) throw new Error('Invalid UUID');
  let n = BigInt(`0x${hex.replaceAll('-', '')}`);
  let out = '';
  for (let i = 0; i < 26; i++) {
    out = CROCKFORD.charAt(Number(n & 31n)) + out;
    n >>= 5n;
  }
  return out;
}

/** Decode 26 Crockford base32 characters back to a canonical lowercase UUID string. */
export function base32ToUuid(body: string): string {
  const upper = body.toUpperCase();
  if (!BODY_RE.test(upper)) throw new Error('Invalid ID body');
  let n = 0n;
  for (const ch of upper) n = (n << 5n) | BigInt(CROCKFORD.indexOf(ch));
  const hex = n.toString(16).padStart(32, '0');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function encodeId(kind: IdKind, uuid: string): string {
  return `${ID_PREFIXES[kind]}_${uuidToBase32(uuid)}`;
}

/** Returns the UUID inside a wire ID, or throws if the ID is malformed or of a different kind. */
export function decodeId(kind: IdKind, id: string): string {
  const prefix = ID_PREFIXES[kind];
  if (!id.startsWith(`${prefix}_`)) throw new Error(`Expected a ${prefix}_ ID`);
  return base32ToUuid(id.slice(prefix.length + 1));
}

/** Zod schema for one kind of wire ID, e.g. `idSchema('person')` accepts `per_01J…`. */
export function idSchema(kind: IdKind): z.ZodString {
  const prefix = ID_PREFIXES[kind];
  return z
    .string()
    .regex(new RegExp(`^${prefix}_[0-7][0-9A-HJKMNP-TV-Z]{25}$`), `Expected a ${prefix}_ ID`)
    .meta({ description: `${kind} ID (\`${prefix}_\` + 26 Crockford base32 chars)` });
}

export const PersonId = idSchema('person');
export const DeviceId = idSchema('device');
export const EventId = idSchema('event');
export const OrganizationId = idSchema('organization');
