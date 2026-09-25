# Theia ↔ Theia Flow Control-Plane Contract

## Purpose

Theia Flow is the agent-development, orchestration, execution, and governance
environment used by Theia. PaperClip provides the underlying agent control
plane. Theia supplies the intelligence mission model.

This boundary exists so PaperClip can remain close to upstream while Theia Flow
adds intelligence-specific behavior without forking core server routes.

## Trust boundary

Theia communicates with Flow server-to-server.

```
Theia browser
    |
    v
Theia API
    |
    | authenticated server-to-server call
    v
Theia Flow / PaperClip API
```

A PaperClip board credential must never be stored in browser local storage or
sent to the Theia browser. Theia's backend obtains the credential from
server-side secret storage and constructs `@theia/flow-client`.

## Baseline mapping

| Theia | Theia Flow / PaperClip |
| --- | --- |
| Tenant / organization | Company |
| Human operator | Board identity / company membership |
| Flow agent | Agent |
| Agent hierarchy | Org chart / reporting line |
| Agent capability | Skill + tool/connection grant |
| Assigned unit of work | Issue |
| Recurring operational work | Routine |
| Execution environment | Workspace / sandbox |
| Human authorization point | Approval / governance rule |
| Runtime credential | Connection / secret grant |
| Execution record | Run + activity/audit events |

## Intelligence semantics remain above PaperClip

PaperClip must not own the meaning of PIRs, intelligence requirements,
collection plans, sources, source evaluation, SATs/AATs, finished intelligence,
dissemination, actions, or effects. Those remain Theia and Theia Flow
intelligence-layer concepts.

The Flow organizational layer may model roles such as CIO, CIOA, Chief of
Staff, QA, Requirements, Collection, Processing, Analysis, Dissemination, and
Operations/Effects. PaperClip supplies reporting relationships and execution;
Flow supplies what those roles mean and how they behave.

## Integration rule

Prefer supported upstream API, skills, plugin, runner, connection, and
governance surfaces before modifying PaperClip server core.

A change to PaperClip core requires an architecture decision record explaining
why the capability cannot live in one of these layers:

1. Theia
2. `@theia/flow-client`
3. Flow intelligence package/plugin
4. Flow skills/instructions
5. PaperClip upstream contribution

## Upgrade baseline

The first Flow v2 baseline is PaperClip `v2026.916.0`. The prior customized
fork remains historical reference and is not merged wholesale into this branch.
