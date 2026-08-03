# `@paperclipai/control-plane-client`

Inbound Paperclip control-plane client and embeddable **Paperclip Control Layer** UI for products like **BIZEVAL**.

Use this when another app should:

1. Connect to a self-hosted Paperclip instance (local or Hostinger) with a board API key
2. Map a division → Paperclip company
3. Show agents and active tasks after connect

## Install

From this monorepo (workspace):

```ts
import { PaperclipControlPlaneClient } from "@paperclipai/control-plane-client";
import { PaperclipControlLayer } from "@paperclipai/control-plane-client/react";
import "@paperclipai/control-plane-client/react/styles.css";
```

## React embed (BIZEVAL Agents page)

Replace the thin Connect form with:

```tsx
import { PaperclipControlLayer } from "@paperclipai/control-plane-client/react";
import "@paperclipai/control-plane-client/react/styles.css";

export function AgentsPaperclipPanel() {
  return (
    <PaperclipControlLayer
      divisionId="it"
      divisionName="IT"
      defaultApiBaseUrl="https://your-paperclip-hostinger-url"
    />
  );
}
```

### Connected UX

After a successful connect the panel shows:

- Connection status (URL, board user email, Paperclip version)
- Company picker (division ↔ company binding, persisted)
- Agents (status, adapter, spend/budget, last heartbeat)
- Active tasks (`todo` / `in_progress` / `in_review` / `blocked`)
- Open Paperclip / Refresh / Disconnect

Theme via CSS variables on `.pcp-root` (`--pcp-primary`, `--pcp-text`, …).

## Hostinger Paperclip setup

On the Paperclip VPS / container env:

```sh
# Public URL of this Paperclip instance
PAPERCLIP_PUBLIC_URL=https://your-paperclip-hostinger-url

# Allow the BIZEVAL browser origin to call /api
PAPERCLIP_API_CORS_ORIGINS=https://your-bizeval-origin
```

Mint a board key on that instance (`paperclipai connect` or `POST /api/board-api-keys`), then paste the Hostinger URL + key into BIZEVAL.

## Low-level client

```ts
const client = new PaperclipControlPlaneClient({
  apiBaseUrl: "https://your-paperclip-hostinger-url",
  apiKey: process.env.PAPERCLIP_API_KEY!,
});

const session = await client.connect();
const agents = await client.listAgents(session.companies[0]!.id);
```

See also `doc/connections/INBOUND-CONTROL-PLANE.md`.
