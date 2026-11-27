import { describe, expect, it } from 'vitest';
import { ID_PREFIXES, PersonId, base32ToUuid, decodeId, encodeId, uuidToBase32 } from './ids.js';

describe('wire IDs', () => {
  it('encodes known vectors', () => {
    expect(uuidToBase32('00000000-0000-0000-0000-000000000000')).toBe('0'.repeat(26));
    expect(uuidToBase32('ffffffff-ffff-ffff-ffff-ffffffffffff')).toBe('7' + 'Z'.repeat(25));
    expect(uuidToBase32('00000000-0000-0000-0000-000000000001')).toBe('0'.repeat(25) + '1');
  });

  it('round-trips UUIDv7 values', () => {
    const uuids = [
      '01938f2e-7c4a-7b3d-9e1f-2a3b4c5d6e7f',
      '0193a000-0000-7000-8000-000000000000',
      '01ffffff-ffff-7fff-bfff-ffffffffffff',
    ];
    for (const u of uuids) expect(base32ToUuid(uuidToBase32(u))).toBe(u);
  });

  it('prefixes by kind and refuses the wrong kind', () => {
    const u = '01938f2e-7c4a-7b3d-9e1f-2a3b4c5d6e7f';
    const id = encodeId('person', u);
    expect(id.startsWith('per_')).toBe(true);
    expect(decodeId('person', id)).toBe(u);
    expect(() => decodeId('device', id)).toThrow(/dev_/);
  });

  it('accepts lowercase bodies but rejects ambiguous letters and bad lengths', () => {
    const body = uuidToBase32('01938f2e-7c4a-7b3d-9e1f-2a3b4c5d6e7f');
    expect(base32ToUuid(body.toLowerCase())).toBe('01938f2e-7c4a-7b3d-9e1f-2a3b4c5d6e7f');
    expect(() => base32ToUuid(body.slice(1))).toThrow();
    expect(() => base32ToUuid('I'.repeat(26))).toThrow();
    expect(() => uuidToBase32('not-a-uuid')).toThrow();
  });

  it('validates with Zod', () => {
    const id = encodeId('person', '01938f2e-7c4a-7b3d-9e1f-2a3b4c5d6e7f');
    expect(PersonId.safeParse(id).success).toBe(true);
    expect(PersonId.safeParse(id.replace('per_', 'dev_')).success).toBe(false);
  });

  it('has unique prefixes', () => {
    const p = Object.values(ID_PREFIXES);
    expect(new Set(p).size).toBe(p.length);
  });
});
