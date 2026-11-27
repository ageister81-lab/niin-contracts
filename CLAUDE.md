# niin-contracts

`@niinid/contracts`: the single source of truth for wire shapes. OpenAPI 3.1 specs in `openapi/`, CloudEvent schemas in `events/`, and the generated TypeScript types and Zod validators exported from `src/`. Published to GitHub Packages (ADR 0011).

**Read the platform docs first:** `../niin-infra/CLAUDE.md`, then `../niin-infra/docs/engineering-standards.md` §3 (API design) and `events.md`. They are binding.

## Commands

`pnpm install`, `pnpm check`, `pnpm build`. Publishing happens from CI on a tagged release.

## Repo rules

- **Change contracts here first**, then implement in the services.
- Semver: additive changes are minor; removing or changing a field, type or event `vN` is major.
- Event types are `com.niinid.<aggregate>.<past-tense-verb>.v<N>`; payloads carry IDs, enums and timestamps only, never PII.
- Standards-defined payloads (OIDC, OID4VC, SCIM, SSF) reference their specs; don't redefine them.
- Services consume the published package in CI; `pnpm link` to a sibling checkout is for local iteration only.
