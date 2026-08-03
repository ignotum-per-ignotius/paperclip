# Inbound control-plane clients (BIZEVAL and similar)

Audience: operators and product engineers who connect an external product to a
self-hosted Paperclip instance as its agent control plane.

Related product law: **D5 — inbound stays thin** in
[`README.md`](./README.md). External clients use scoped Paperclip tokens. They
do not get a separate Apps permission model.

## What this is

Products such as **BIZEVAL** expose a "Paperclip Control Layer" / "Connect
Paperclip" screen:

1. Operator pastes a Paperclip **Server URL** (default `http://localhost:3100`).
2. Operator pastes a Paperclip **board API key**.
3. The product verifies the connection and maps each of its **divisions** to a
   Paperclip **company**.

Paperclip is then the control plane for that division's AI agents (issues,
heartbeats, budgets, governance).

## Mint a board API key

From a browser session on the Paperclip board (or via an already-authenticated
CLI board profile):

```sh
# Interactive (creates a board key and writes a CLI profile)
paperclipai connect --persona board

# Or, with an existing board session / key:
curl -s -X POST "$PAPERCLIP_API_URL/api/board-api-keys" \
  -H "Authorization: Bearer $EXISTING_BOARD_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"bizeval-it","expiresAt":null}'
```

Use a `pcp_board_…` key. Agent keys (`pcp_…` without `_board_`) cannot list
companies for division mapping.

Set `expiresAt` to `null` for a long-lived product integration when your
governance policy allows it.

## Verify connect (one shot)

```http
GET /api/control-plane/connect
Authorization: Bearer pcp_board_…
```

Success response (shape):

```json
{
  "ok": true,
  "controlPlane": "paperclip",
  "version": "…",
  "actor": {
    "userId": "…",
    "user": { "id": "…", "name": "…", "email": "…" },
    "isInstanceAdmin": false,
    "source": "board_key",
    "keyId": "…"
  },
  "companies": [
    { "id": "…", "name": "IT", "issuePrefix": "IT" }
  ]
}
```

Map each BIZEVAL division to one `companies[].id`. Subsequent API calls use the
same bearer key against the normal company-scoped routes
(`/api/companies/{companyId}/agents`, issues, etc.).

Equivalent building blocks (if you prefer not to use the combined endpoint):

| Step | Endpoint |
| --- | --- |
| Reachability | `GET /api/health` |
| Identity | `GET /api/cli-auth/me` |
| Companies | `GET /api/companies` |

## Browser CORS (cross-origin Connect UI)

If the Connect form runs in a browser on a **different origin** than Paperclip
(for example BIZEVAL at `https://bizeval.example` calling
`http://localhost:3100`), set:

```sh
PAPERCLIP_API_CORS_ORIGINS=https://bizeval.example,http://localhost:5173
```

- Comma-separated absolute origins.
- Unset → no CORS headers (historical behavior; server-side backends still work).
- `*` → reflect any Origin (local embed convenience only; avoid in untrusted multi-tenant production).

Board bearer-key mutations already skip the browser Origin mutation guard. CORS
is only required for browser `fetch` from another site.

Server-side BIZEVAL backends do **not** need CORS. Prefer a backend proxy when
you can keep the board key off the browser.

## Private hostname deployments

When `PAPERCLIP_DEPLOYMENT_EXPOSURE=private`, the Host header must be
allowlisted (`paperclipai allowed-hostname` / config). Point the Connect UI at a
hostname Paperclip accepts.

## Richer post-connect UI (BIZEVAL embed)

Ship the Agents → Paperclip Control Layer experience with
`@paperclipai/control-plane-client`:

```tsx
import { PaperclipControlLayer } from "@paperclipai/control-plane-client/react";
import "@paperclipai/control-plane-client/react/styles.css";

<PaperclipControlLayer
  divisionId="it"
  divisionName="IT"
  defaultApiBaseUrl="https://your-paperclip-hostinger-url"
/>
```

After connect, the panel shows company mapping, agents, active tasks, and deep
links into Paperclip. Package docs:
[`packages/control-plane-client/README.md`](../../packages/control-plane-client/README.md).

### Hostinger checklist

1. Deploy / open your Paperclip instance on Hostinger.
2. Set `PAPERCLIP_PUBLIC_URL` to that public URL.
3. Set `PAPERCLIP_API_CORS_ORIGINS` to your BIZEVAL web origin (required for a
   browser Connect form on a different host).
4. Mint a `pcp_board_…` key and paste URL + key into BIZEVAL.
5. Map the IT division to the returned company and manage agents/tasks from the
   connected panel (or click **Open Paperclip** for the full board).

## Non-goals

- Paperclip does not host the full BIZEVAL product UI.
- Apps → Connections remains the **outbound** tool-install surface (agents
  calling Slack, GitHub, MCP, etc.).
- Inbound clients do not receive a parallel permission system; use company
  memberships and board/agent keys.
