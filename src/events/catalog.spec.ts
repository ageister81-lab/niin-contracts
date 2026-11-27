import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { encodeId } from '../ids.js';
import { AnyEnvelope, EVENT_TYPE_RE } from './envelope.js';
import { EVENT_CATALOG, PersonCreated, isKnownEventType } from './catalog.js';

const person = encodeId('person', '01938f2e-7c4a-7b3d-9e1f-2a3b4c5d6e7f');
const event = encodeId('event', '01938f2e-7c4a-7b3d-9e1f-2a3b4c5d6e80');

const base = {
  specversion: '1.0',
  id: event,
  source: 'niin://core-api',
  time: '2026-11-26T18:00:00Z',
  subject: person,
  datacontenttype: 'application/json',
  niinid: person,
  actor: person,
} as const;

describe('event envelope', () => {
  it('accepts a valid person.created event', () => {
    const e = { ...base, type: 'com.niinid.person.created.v1', data: { person_id: person } };
    expect(PersonCreated.parse(e)).toEqual(e);
    expect(AnyEnvelope.safeParse(e).success).toBe(true);
  });

  it('rejects unknown fields in data and envelope (no smuggled PII)', () => {
    const withEmail = {
      ...base,
      type: 'com.niinid.person.created.v1',
      data: { person_id: person, email: 'someone@example.com' },
    };
    expect(PersonCreated.safeParse(withEmail).success).toBe(false);
    const extra = {
      ...base,
      type: 'com.niinid.person.created.v1',
      data: { person_id: person },
      name: 'x',
    };
    expect(AnyEnvelope.safeParse(extra).success).toBe(false);
  });

  it('rejects bad actors and times with offsets', () => {
    const e = { ...base, type: 'com.niinid.person.created.v1', data: { person_id: person } };
    expect(PersonCreated.safeParse({ ...e, actor: 'root' }).success).toBe(false);
    expect(PersonCreated.safeParse({ ...e, time: '2026-11-26T18:00:00+02:00' }).success).toBe(
      false,
    );
  });
});

describe('event catalog', () => {
  it('uses the naming rule for every type', () => {
    for (const type of Object.keys(EVENT_CATALOG)) expect(type).toMatch(EVENT_TYPE_RE);
  });

  it('only allows ID, enum, and timestamp fields in payloads (privacy-and-data.md)', () => {
    for (const [type, { schema }] of Object.entries(EVENT_CATALOG)) {
      const json = z.toJSONSchema(schema) as unknown as {
        properties: {
          data: {
            properties: Record<
              string,
              { type?: string; enum?: unknown; pattern?: string; format?: string }
            >;
          };
        };
      };
      for (const [field, s] of Object.entries(json.properties.data.properties)) {
        const safe = s.enum !== undefined || s.pattern !== undefined || s.format === 'date-time';
        expect(safe, `${type}.data.${field} must be an ID, enum or timestamp`).toBe(true);
      }
    }
  });

  it('narrows known types', () => {
    expect(isKnownEventType('com.niinid.person.created.v1')).toBe(true);
    expect(isKnownEventType('com.niinid.person.deleted.v9')).toBe(false);
  });
});
