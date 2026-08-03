# Plan: Paperclip ↔ BIZEVAL (BES) inbound control-plane

Date: 2026-08-03  
Branch: `cursor/paperclip-bes-integration-c6df`  
Related remote branch: `PaperClip-BES`

## Clarified goal

**BES** here is the **BIZEVAL** product (Enlighten). BIZEVAL's IT → Agents screen
already has a thin "Paperclip Control Layer" UI:

- Paperclip Server URL (default `http://localhost:3100`)
- API key
- **Connect to Paperclip**

Each BIZEVAL **division** maps to a Paperclip **company**. Paperclip remains the
agent control plane; BIZEVAL is the inbound client.

This matches product law **D5 (inbound stays thin)** in
`doc/connections/README.md`.

## What shipped on this branch

1. **API CORS allowlist** — `PAPERCLIP_API_CORS_ORIGINS` so a browser Connect UI
   on another origin can call `/api` with a board bearer key
   (`server/src/middleware/api-cors.ts`).
2. **`GET /api/control-plane/connect`** — one-shot verify for the Connect button:
   board auth + companies for division mapping
   (`server/src/routes/control-plane.ts`).
3. **Docs** — `doc/connections/INBOUND-CONTROL-PLANE.md` (+ index link, env example).
4. **Tests** — CORS unit tests + connect route test.

## Operator setup (BIZEVAL → Paperclip)

1. Run Paperclip (`pnpm dev` → `http://localhost:3100`).
2. Create a board API key (`paperclipai connect` or `POST /api/board-api-keys`).
3. If BIZEVAL's Connect form is cross-origin in the browser, set e.g.
   `PAPERCLIP_API_CORS_ORIGINS=https://<bizeval-origin>`.
4. In BIZEVAL, paste URL + key and connect; map the IT division to the returned
   company id.

## Richer post-connect UX

BIZEVAL source is not in this workspace, so richer BIZEVAL panels ship as
embeddable packages:

- `@paperclipai/control-plane-client` — fetch client for Hostinger/local Paperclip
- `@paperclipai/control-plane-client/react` — `PaperclipControlLayer` with
  connect form + connected agents/tasks/company mapping
- `@paperclipai/bizeval-onboarding` — Staff Features **Onboarding** tile + panel
  (setup checklist progress; tasks on time / due today / overdue by N days)

Wire them into BIZEVAL by importing the React exports (see package READMEs).
Operator still points the Connect form at the Hostinger Paperclip URL.

## Follow-ups

- Drop `PaperclipControlLayer` into the private BIZEVAL Agents → Paperclip
  Control Layer page when that repo is available to this agent.
- Replace Staff Features Onboarding **Coming Soon** with
  `StaffFeaturesOnboarding` from `@paperclipai/bizeval-onboarding/react`.
- Optional: never-expire board-key minting affordance in the Paperclip board UI
  (today: CLI / API).

## Non-goals

- Embedding BIZEVAL UI inside Paperclip
- Inventing a parallel inbound permission model
- Building a BES/BIZEVAL agent adapter (BIZEVAL is the client, not an adapter runtime)
