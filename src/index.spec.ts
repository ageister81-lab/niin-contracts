import { describe, expect, it } from 'vitest';
import { CONTRACTS_VERSION, ID_PREFIXES } from './index.js';

describe('contracts package', () => {
  it('exposes a semver version', () => {
    expect(CONTRACTS_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('has unique ID prefixes', () => {
    const prefixes = Object.values(ID_PREFIXES);
    expect(new Set(prefixes).size).toBe(prefixes.length);
  });
});
