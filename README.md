# @niinid/contracts

Wire contracts for [Niin ID](https://niinid.com), a person-owned identity platform: the API shapes and events that Niin services, partners and SDKs agree on.

- **Wire IDs:** `per_…`, `dev_…`, `evt_…` and others, with lossless conversion to and from UUIDv7
- **Events:** a CloudEvents 1.0 envelope and the event catalog. Payloads carry IDs, enums and timestamps only, never personal data
- **Audit:** the exact input to Niin's hash-chained audit ledger
- **APIs:** Zod schemas for each service API, plus generated OpenAPI 3.1 documents in `openapi/`

```bash
pnpm add @niinid/contracts
```

```ts
import { PersonCreated, encodeId } from '@niinid/contracts';

const id = encodeId('person', '01938f2e-7c4a-7b3d-9e1f-2a3b4c5d6e7f'); // "per_…"
PersonCreated.parse(event); // throws on anything outside the contract
```

## Versioning

Semver. Additive changes are minor releases. Removing or changing a field, a type, or an event's `vN` is a major release. Releases are published from CI with npm provenance, so you can trace each version to the commit and workflow run that built it.

## License

Apache-2.0
