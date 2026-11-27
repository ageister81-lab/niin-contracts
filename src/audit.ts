import { z } from 'zod';

/**
 * The exact object hashed into the audit chain (data-model.md §5):
 *   hash = SHA-256(prev_hash || JCS(AuditHashInput))
 * Changing this shape breaks every existing chain, so it is versioned and needs an ADR to change.
 */
export const AUDIT_HASH_VERSION = 1 as const;

export const AuditHashInput = z
  .object({
    seq: z.number().int().positive(),
    event_id: z.string(),
    occurred_at: z.iso.datetime({ offset: false }),
    actor: z.string(),
    subject: z.string(),
    org_id: z.string().nullable(),
    niin_id: z.string().nullable(),
    action: z.string(),
    payload: z.record(z.string(), z.unknown()),
  })
  .strict();

export type AuditHashInput = z.infer<typeof AuditHashInput>;

/** The genesis `prev_hash`: 32 zero bytes, hex-encoded. */
export const GENESIS_HASH_HEX = '0'.repeat(64);
