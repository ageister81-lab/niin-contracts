import { z } from 'zod';
import { DeviceId, PersonId } from '../ids.js';

/**
 * core-api v1: Identity & Key (user-stories.md A1, A2). The source of truth for the wire shapes;
 * `openapi/core-api.v1.json` is generated from this file (`pnpm gen:openapi`).
 *
 * WebAuthn payloads are the W3C WebAuthn Level 3 JSON forms (PublicKeyCredential*JSON). They are
 * opaque here and validated by SimpleWebAuthn on the server.
 */

const WebAuthnJson = z
  .record(z.string(), z.unknown())
  .meta({ description: 'WebAuthn Level 3 JSON object, validated server-side by SimpleWebAuthn' });

/** Server-held challenge reference; the challenge itself lives in Redis, single-use, 5 min TTL. */
export const ChallengeId = z
  .string()
  .regex(/^chl_[A-Za-z0-9_-]{22,64}$/)
  .meta({ description: 'Single-use challenge reference' });

export const DisplayName = z.string().trim().min(1).max(64);
export const DeviceName = z.string().trim().min(1).max(64);

// ---------- resources ----------

export const Person = z
  .object({
    id: PersonId,
    display_name: DisplayName.nullable(),
    /** For notifications only; never an identifier (privacy-and-data.md §2). */
    contact_email: z.email().max(254).nullable(),
    created_at: z.iso.datetime({ offset: false }),
  })
  .strict()
  .meta({ id: 'Person' });

export const Device = z
  .object({
    id: DeviceId,
    name: DeviceName,
    status: z.enum(['active', 'revoked']),
    /** Passkey is synced across the person's devices by their provider (WebAuthn backup state). */
    backed_up: z.boolean(),
    transports: z.array(z.enum(['ble', 'cable', 'hybrid', 'internal', 'nfc', 'smart-card', 'usb'])),
    created_at: z.iso.datetime({ offset: false }),
    last_used_at: z.iso.datetime({ offset: false }).nullable(),
  })
  .strict()
  .meta({ id: 'Device' });

/** RFC 9457 problem details (engineering-standards.md §3). */
export const Problem = z
  .object({
    type: z.string(),
    title: z.string(),
    status: z.number().int(),
    detail: z.string().optional(),
    code: z.string().optional(),
  })
  .meta({ id: 'Problem' });

// ---------- requests / responses ----------

export const RegistrationOptionsRequest = z
  .object({
    display_name: DisplayName.optional(),
    contact_email: z.email().max(254).optional(),
  })
  .strict();
export const CeremonyOptionsResponse = z
  .object({ challenge_id: ChallengeId, options: WebAuthnJson })
  .strict();

export const RegistrationVerifyRequest = z
  .object({ challenge_id: ChallengeId, response: WebAuthnJson, device_name: DeviceName.optional() })
  .strict();
export const RegistrationVerifyResponse = z.object({ person: Person, device: Device }).strict();

export const AuthenticationVerifyRequest = z
  .object({ challenge_id: ChallengeId, response: WebAuthnJson })
  .strict();
export const SessionResponse = z.object({ person: Person }).strict();

export const DeviceList = z.object({ devices: z.array(Device) }).strict();

export const AddDeviceVerifyRequest = RegistrationVerifyRequest;

// ---------- route table ----------

export interface Route {
  method: 'get' | 'post' | 'delete';
  path: string;
  summary: string;
  story: string;
  auth: 'none' | 'session' | 'session+fresh';
  body?: z.ZodType;
  response?: z.ZodType;
  status: 200 | 201 | 204;
}

export const CORE_API_ROUTES: readonly Route[] = [
  {
    method: 'post',
    path: '/v1/registration/options',
    summary: 'Start creating a Niin ID with a passkey',
    story: 'A1',
    auth: 'none',
    body: RegistrationOptionsRequest,
    response: CeremonyOptionsResponse,
    status: 200,
  },
  {
    method: 'post',
    path: '/v1/registration/verify',
    summary: 'Finish creating a Niin ID; starts a session',
    story: 'A1',
    auth: 'none',
    body: RegistrationVerifyRequest,
    response: RegistrationVerifyResponse,
    status: 201,
  },
  {
    method: 'post',
    path: '/v1/sessions/options',
    summary: 'Start signing in with a passkey',
    story: 'A1',
    auth: 'none',
    response: CeremonyOptionsResponse,
    status: 200,
  },
  {
    method: 'post',
    path: '/v1/sessions/verify',
    summary: 'Finish signing in; starts a session',
    story: 'A1',
    auth: 'none',
    body: AuthenticationVerifyRequest,
    response: SessionResponse,
    status: 200,
  },
  {
    method: 'delete',
    path: '/v1/sessions/current',
    summary: 'Sign out',
    story: 'A1',
    auth: 'session',
    status: 204,
  },
  {
    method: 'get',
    path: '/v1/me',
    summary: 'The signed-in person',
    story: 'A1',
    auth: 'session',
    response: Person,
    status: 200,
  },
  {
    method: 'post',
    path: '/v1/me/reauth/options',
    summary: 'Start a fresh passkey check before a high-risk action',
    story: 'A2',
    auth: 'session',
    response: CeremonyOptionsResponse,
    status: 200,
  },
  {
    method: 'post',
    path: '/v1/me/reauth/verify',
    summary: 'Finish the fresh passkey check (valid 5 minutes)',
    story: 'A2',
    auth: 'session',
    body: AuthenticationVerifyRequest,
    status: 204,
  },
  {
    method: 'get',
    path: '/v1/me/devices',
    summary: "List the person's passkeys",
    story: 'A2',
    auth: 'session',
    response: DeviceList,
    status: 200,
  },
  {
    method: 'post',
    path: '/v1/me/devices/options',
    summary: 'Start adding a passkey (needs a fresh check)',
    story: 'A2',
    auth: 'session+fresh',
    response: CeremonyOptionsResponse,
    status: 200,
  },
  {
    method: 'post',
    path: '/v1/me/devices/verify',
    summary: 'Finish adding a passkey',
    story: 'A2',
    auth: 'session+fresh',
    body: AddDeviceVerifyRequest,
    response: Device,
    status: 201,
  },
  {
    method: 'delete',
    path: '/v1/me/devices/{device_id}',
    summary: 'Revoke a passkey (not the last one; needs a fresh check)',
    story: 'A2',
    auth: 'session+fresh',
    status: 204,
  },
];
