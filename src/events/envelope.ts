import { z } from 'zod';
import { EventId, OrganizationId, PersonId } from '../ids.js';

/**
 * CloudEvents 1.0 envelope used between Niin services (events.md §1).
 * `data` carries IDs, enums and timestamps only, never personal data.
 */

/** `com.niinid.<aggregate>.<past-tense-verb>.v<N>` */
export const EVENT_TYPE_RE = /^com\.niinid\.[a-z_]+\.[a-z_]+\.v[1-9][0-9]*$/;

/** Who did it: a person, a service (`svc:<name>`), or Niin staff (`staff:<id>`). */
export const Actor = z
  .string()
  .regex(/^(per_[0-7][0-9A-HJKMNP-TV-Z]{25}|svc:[a-z-]+|staff:[a-z0-9_-]+)$/, 'Invalid actor');

export const SOURCES = [
  'niin://core-api',
  'niin://signer',
  'niin://oidc-provider',
  'niin://provisioning',
  'niin://audit-sink',
  'niin://back-office',
] as const;

// The inferred return type is the precise object schema callers depend on; spelling it out adds nothing.
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function envelopeSchema<T extends z.ZodType>(type: string, data: T) {
  if (!EVENT_TYPE_RE.test(type)) throw new Error(`Bad event type: ${type}`);
  return z
    .object({
      specversion: z.literal('1.0'),
      id: EventId,
      source: z.enum(SOURCES),
      type: z.literal(type),
      time: z.iso.datetime({ offset: false }),
      subject: z.string().min(1).max(64),
      datacontenttype: z.literal('application/json'),
      orgid: OrganizationId.optional(),
      niinid: PersonId.optional(),
      actor: Actor,
      traceparent: z
        .string()
        .regex(/^00-[0-9a-f]{32}-[0-9a-f]{16}-[0-9a-f]{2}$/)
        .optional(),
      data,
    })
    .strict();
}

/** Any Niin event, before its `type` is known. Consumers narrow with the catalog. */
export const AnyEnvelope = z
  .object({
    specversion: z.literal('1.0'),
    id: EventId,
    source: z.enum(SOURCES),
    type: z.string().regex(EVENT_TYPE_RE),
    time: z.iso.datetime({ offset: false }),
    subject: z.string().min(1).max(64),
    datacontenttype: z.literal('application/json'),
    orgid: OrganizationId.optional(),
    niinid: PersonId.optional(),
    actor: Actor,
    traceparent: z.string().optional(),
    data: z.record(z.string(), z.unknown()),
  })
  .strict();

export type AnyEnvelope = z.infer<typeof AnyEnvelope>;
