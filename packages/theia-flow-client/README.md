# @theia/flow-client

Server-to-server integration client between Theia and Theia Flow.

## Design boundary

Theia Flow uses PaperClip as its execution and governance substrate. This
package is the supported integration boundary for Theia. It deliberately uses
PaperClip's public upstream API instead of adding Flow-specific routes to the
PaperClip server.

The package must not be used from a browser. A long-lived board credential
belongs in Theia's server-side secret store and is injected when constructing a
client.

## Core calls

- `GET /api/health`
- `GET /api/cli-auth/me`
- `GET /api/companies?scope=accessible`
- `GET /api/companies/{companyId}/agents`
- `GET /api/companies/{companyId}/org`
- `GET /api/companies/{companyId}/issues`

For PaperClip capabilities not wrapped yet, use `requestJson<T>()` rather than
adding a Flow-only server endpoint. Promote frequently used operations into
typed client methods after their contract is stable.

## Entity boundary

Theia owns intelligence-domain semantics: requirements, sources, processing,
analysis, reports, dissemination, actions, effects, doctrine, methods, and
intelligence-specific agent roles.

Theia Flow owns orchestration semantics built on PaperClip: agents, reporting
lines, skills, work items, execution, connections, secrets, workspaces,
budgets, approvals, recovery, and audit events.

A Theia tenant maps to a Flow company. More detailed mappings belong in the
Theia integration layer, not in PaperClip core.
