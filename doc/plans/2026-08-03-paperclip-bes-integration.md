# Plan: Paperclip ↔ BES integration

Date: 2026-08-03  
Branch: `cursor/paperclip-bes-integration-c6df`  
Related remote branch: `PaperClip-BES` (currently identical to `master`)

## Status

**Blocked on BES definition.** The fork has a `PaperClip-BES` branch tip equal to `master`, and this repository has no BES types, adapters, docs, or API clients. Implementation cannot start until BES is identified and its runtime contract is available.

## Goal

Make this Paperclip fork able to coordinate work with BES — hire BES-backed agents, wake them on heartbeats, and report results through the normal Paperclip control plane.

## What was checked

| Source | Result |
| --- | --- |
| Repo search for `BES` / `bes` product code | No BES adapter, package, or docs |
| `origin/PaperClip-BES` vs `origin/master` | Same commit (`42d0ddcb`); empty integration branch |
| Public Enlighten / Theia materials | Theia platform is documented; BES is not named |
| Public GitHub org `ignotum-per-ignotius` | paperclip, openclaw, caldera, CTI tools; no BES repo |
| Nearby public “BES” candidates | See candidates below |

## Candidate meanings of BES

Ranked by how they would map into Paperclip. **Only the owner can confirm which one is intended.**

1. **Private / internal BES product or runtime** (most likely for a named `PaperClip-BES` branch)
   - Integration shape: new adapter (`bes_local` / `bes_gateway`) or external adapter plugin
   - Needs: invoke contract (CLI argv or HTTP), auth, session resume, stdout/event format, models

2. **Bidirectional Evolutionary Search** ([Embodied-Minds-Lab/BES](https://github.com/Embodied-Minds-Lab/BES), May 2026)
   - Integration shape: company skill or plugin that runs BES search loops during hard tasks
   - Needs: which BES entrypoint (inference vs post-training), model provider wiring, success criteria

3. **`bes` CLI from Body Emotion Sensor** (`body-emotion-sensor` / OpenClaw skill)
   - Integration shape: bundled/optional skill that wraps `bes bootstrap` / `bes run`
   - Needs: confirmation this is the intended product (unlikely for a CTI control-plane fork)

4. **Something else** (BAS / Theia module / custom acronym)
   - Integration shape: TBD after definition

## Recommended Paperclip integration shapes

Once BES is identified, pick the smallest Paperclip surface that fits:

| BES shape | Paperclip mechanism | Primary packages |
| --- | --- | --- |
| Local CLI agent runtime | Built-in or external adapter (`execute` + `testEnvironment` + UI parser) | `packages/adapters/*`, server/ui/cli registries, or Adapter Manager plugin |
| Remote HTTP/SSE agent runtime | Gateway-style adapter (Hermes/OpenClaw pattern) | Same as above with `*_gateway` type |
| Reasoning / search library used *by* agents | Company skill or skills-catalog entry | `packages/skills-catalog` or company skills install |
| External ticket/source system | External task protocol provider | `docs/specs/external-task-protocol.md` + server provider |
| App connector (OAuth / sync) | Applications / connections surface | server connections + UI applications page |

Default assumption for a branch named `PaperClip-BES`: **adapter** (row 1 or 2).

## Implementation outline (after unblock)

### A. Adapter path (CLI or gateway)

1. Confirm adapter type keys (`bes_local`, `bes_gateway`, or a single `bes`).
2. Scaffold package under `packages/adapters/bes/` **or** an external plugin package if the runtime should version independently.
3. Implement server contract: `createServerAdapter()` with `execute`, `testEnvironment`, optional `sessionCodec`, `detectModel`, `getConfigSchema`.
4. Implement UI config builder + transcript parser; register or install via Adapter Manager.
5. Add CLI event formatter if `paperclipai run --watch` should understand BES output.
6. Document onboarding (mirror `doc/HERMES_GATEWAY_ONBOARDING.md` / OpenClaw docs).
7. Add focused vitest coverage for execute/env-test/parser; smoke one heartbeat against a real BES endpoint or fixture.

### B. Skill path (library / deep-mode)

1. Author or vendor the skill under skills catalog / company skills.
2. Document when agents should invoke BES vs normal tools.
3. Add examples and regenerate catalog manifest if bundled.

## Unblock checklist (owner input)

Reply with answers to these items (paste docs/links if available):

1. **What is BES?** One sentence + homepage/repo/API docs if they exist.
2. **How should Paperclip invoke it?** Local CLI command, HTTP gateway, skill-only, or task sync.
3. **Auth model:** API key, JWT, mTLS, none.
4. **Session model:** Stateless per heartbeat, or resume token / session id across runs.
5. **Desired UX:** Hire BES agents in the board UI, call BES from existing agents, or sync BES objects into issues.
6. **Success criteria for v1:** e.g. “create a BES agent, assign an issue, one heartbeat completes and shows transcript + cost.”

## Non-goals for this planning revision

- Inventing a BES API or CLI that does not exist in-repo
- Registering a placeholder adapter type that cannot execute
- Changing core Paperclip control-plane invariants

## Next heartbeat after answers

Implement the chosen path on this branch (or rebase onto `PaperClip-BES`), with tests and docs, then mark the PR ready for review.
