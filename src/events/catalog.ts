import { z } from 'zod';
import { DeviceId, PersonId } from '../ids.js';
import { envelopeSchema } from './envelope.js';

/**
 * Event catalog, M1 slice (events.md §4). Payloads hold IDs and enums only (privacy-and-data.md).
 * Add events here first, then emit them (ADR 0011).
 */

export const TOPICS = {
  identity: 'identity',
  join: 'join',
  engagement: 'engagement',
  credential: 'credential',
  provisioning: 'provisioning',
  trust: 'trust',
  staff: 'staff',
} as const;
export type Topic = (typeof TOPICS)[keyof typeof TOPICS];

export const PersonCreated = envelopeSchema(
  'com.niinid.person.created.v1',
  z.object({ person_id: PersonId }).strict(),
);

export const DeviceRegistered = envelopeSchema(
  'com.niinid.device.registered.v1',
  z
    .object({
      person_id: PersonId,
      device_id: DeviceId,
      /** Whether this is the person's first device (created with the Niin ID) or an added one. */
      reason: z.enum(['initial', 'added']),
    })
    .strict(),
);

export const DeviceRevoked = envelopeSchema(
  'com.niinid.device.revoked.v1',
  z
    .object({
      person_id: PersonId,
      device_id: DeviceId,
      reason: z.enum(['removed_by_person', 'sign_count_regression', 'staff_action']),
    })
    .strict(),
);

export const SessionStarted = envelopeSchema(
  'com.niinid.session.started.v1',
  z.object({ person_id: PersonId, device_id: DeviceId }).strict(),
);

export const SessionEnded = envelopeSchema(
  'com.niinid.session.ended.v1',
  z.object({ person_id: PersonId, reason: z.enum(['logout', 'expired', 'revoked']) }).strict(),
);

/** type → schema and topic. The audit sink records every type listed here. */
export const EVENT_CATALOG = {
  'com.niinid.person.created.v1': { schema: PersonCreated, topic: TOPICS.identity },
  'com.niinid.device.registered.v1': { schema: DeviceRegistered, topic: TOPICS.identity },
  'com.niinid.device.revoked.v1': { schema: DeviceRevoked, topic: TOPICS.identity },
  'com.niinid.session.started.v1': { schema: SessionStarted, topic: TOPICS.identity },
  'com.niinid.session.ended.v1': { schema: SessionEnded, topic: TOPICS.identity },
} as const;

export type EventType = keyof typeof EVENT_CATALOG;
export type EventOf<T extends EventType> = z.infer<(typeof EVENT_CATALOG)[T]['schema']>;
export type NiinEvent = { [T in EventType]: EventOf<T> }[EventType];

export function isKnownEventType(type: string): type is EventType {
  return Object.hasOwn(EVENT_CATALOG, type);
}
