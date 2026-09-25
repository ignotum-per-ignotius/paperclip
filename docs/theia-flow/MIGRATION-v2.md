# Theia Flow v2 Migration

## Baseline

- Upstream: `paperclipai/paperclip`
- Baseline release: `v2026.916.1`
- Baseline commit: `d554c4789ed3930f8a53ac9fdf6503b3187097da`
- Migration branch: `theia-flow-v2-paperclip-2026.916.1`
- Historical customized branch: `master`

The historical branch is not merged wholesale. Flow-specific capabilities are
reintroduced above a clean upstream release.

## Architectural objective

PaperClip remains the execution and governance substrate. Theia Flow owns the
intelligence operating model. Theia owns the analyst-facing intelligence
management product.

### PaperClip core responsibilities

- agents and reporting lines
- issues/work assignment
- heartbeats and native runner
- workspaces and sandboxes
- skills delivery
- connections and credential grants
- secrets
- budgets and cost controls
- approvals and governance
- recovery
- routines
- audit/activity

### Theia Flow responsibilities

- CIO / CIOA / Chief of Staff operating model
- Requirements, Collection, Processing, Analysis, Dissemination,
  Operations/Effects, and QA divisions
- SME, collection, and methodology agents
- Agent Studio and Agent Library
- intelligence doctrine
- SAT/AAT methodology packages
- intelligence-framework maintenance and use
- intelligence-specific orchestration policy

### Theia responsibilities

- requirements and requirement state
- source and collection-management product surfaces
- processing and analytic product surfaces
- reports
- dissemination
- actions and effects
- end-user interaction with Flow through the Theia backend

## Prior fork disposition

The prior fork contained 41 changed files relative to this migration target.

### Not carried forward

The BIZEVAL onboarding package is product-specific and is intentionally not
part of Flow v2.

The browser-side PaperClip Control Layer is also not carried forward. It stored
a long-lived board key on the client and required cross-origin access to
PaperClip.

The custom `/api/control-plane/connect` route and custom global CORS middleware
are not carried forward. The Flow integration uses supported upstream APIs.

## New integration boundary

`@theia/flow-client` is server-only.

It currently wraps:

- `GET /api/health`
- `GET /api/cli-auth/me`
- `GET /api/companies?scope=accessible`
- `GET /api/companies/{companyId}`
- `GET /api/companies/{companyId}/agents`
- `GET /api/companies/{companyId}/org`
- `GET /api/companies/{companyId}/issues`

The client also exposes an escape-hatch `requestJson<T>()` for supported
PaperClip API operations that have not yet earned a stable typed wrapper.

The API credential is held in a JavaScript private field and is never
persisted by the package.

## v2026.916.1 adoption priorities

### Required

1. Native PaperClip Runner
2. Runtime skills and skills synchronization
3. Managed Connections and credential grants
4. Workspace isolation and multi-repository execution
5. Recovery/failure classification
6. Governance and approvals
7. Audit/activity records

### Next

1. Map Agent Studio to PaperClip skills and instruction bundles.
2. Define the initial intelligence organization template.
3. Define Theia tenant/company provisioning.
4. Define Flow-agent identity and connection-grant policy.
5. Define Theia task/requirement handoff and result callbacks.
6. Validate OpenClaw orchestrator integration against the new runner.
7. Validate local Ollama-oriented agent configurations where supported by the
   selected adapter/runtime path.

## Patch baseline note

PaperClip v2026.916.1 is a patch release over v2026.916.0. It adds no database migrations, configuration changes, or API changes. It fixes task-conversation sending and a related database conflict-classification path.

## Upgrade constraints

PaperClip v2026.916.1 requires Node.js 24.11 or newer and adds database
migrations 0231 through 0279.

Migration validation must use an isolated copy of Flow data before any
production cutover.

Do not switch the historical deployment to this branch until the following are
green:

- workspace install with frozen lockfile
- typecheck
- unit tests
- production build
- database migration rehearsal
- agent hierarchy smoke test
- skills delivery smoke test
- connection/credential smoke test
- task execution and recovery smoke test
- Theia server-to-server integration test

## Merge policy

Do not merge upstream into the historical customized branch and then attempt to
resolve the resulting conflict set.

Future PaperClip upgrades should start from an upstream release/tag and replay
the thin Flow layer. Any new modification to PaperClip core requires an
architecture decision explaining why an upstream API, plugin, skill,
instruction bundle, or Flow-side integration cannot implement the capability.
