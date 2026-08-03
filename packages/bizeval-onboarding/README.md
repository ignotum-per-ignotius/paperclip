# `@paperclipai/bizeval-onboarding`

BIZEVAL **Staff Features → Onboarding** UI for Paperclip-connected companies.

Replaces the Onboarding tile **Coming Soon** state with:

1. **Setup progress** — checklist of what onboarding setup is complete / not started / blocked
2. **Task timing** — each task shows **on time**, **due today**, or **overdue by N days**

## Install

From the Paperclip monorepo (or once published):

```json
{
  "dependencies": {
    "@paperclipai/bizeval-onboarding": "workspace:*"
  }
}
```

Peer: `react` / `react-dom` ≥ 18.

## Drop into Staff Features

```tsx
import {
  StaffFeaturesOnboarding,
  createDemoOnboardingSnapshot,
} from "@paperclipai/bizeval-onboarding/react";
import "@paperclipai/bizeval-onboarding/react/styles.css";

export function StaffFeaturesOnboardingSlot() {
  return (
    <StaffFeaturesOnboarding
      snapshot={createDemoOnboardingSnapshot()}
      onOpenChange={(open) => {
        /* optional: sync with BIZEVAL route */
        void open;
      }}
    />
  );
}
```

`StaffFeaturesOnboarding` renders:

- An **active** Onboarding card (teal border, Open button) with setup % and overdue / on-time counts
- An expanded **panel** with the full setup checklist and task list (Open / Back)

### Card or panel only

```tsx
import {
  OnboardingFeatureCard,
  OnboardingPanel,
} from "@paperclipai/bizeval-onboarding/react";
```

## Wire Paperclip issues as onboarding tasks

```ts
import { PaperclipControlPlaneClient } from "@paperclipai/control-plane-client";
import {
  buildOnboardingSnapshot,
  createDemoOnboardingSnapshot,
  mapPaperclipIssuesToOnboardingTasks,
  type OnboardingSnapshot,
} from "@paperclipai/bizeval-onboarding";

async function loadOnboarding(
  client: PaperclipControlPlaneClient,
  companyId: string,
  companyPrefix: string,
): Promise<OnboardingSnapshot> {
  const base = createDemoOnboardingSnapshot();
  const issues = await client.listIssues(companyId, { limit: 100 });
  const tasks = mapPaperclipIssuesToOnboardingTasks(issues, {
    titleIncludes: ["onboarding", "new hire"],
    hrefForIssue: (issue) =>
      issue.identifier
        ? client.openIssueUrl(companyPrefix, issue.identifier)
        : null,
  });

  return buildOnboardingSnapshot({
    hireName: base.hireName,
    roleLabel: base.roleLabel,
    startedAt: base.startedAt,
    setupSteps: base.setupSteps, // replace with live BIZEVAL/HR setup state
    tasks: tasks.length > 0 ? tasks : base.tasks,
  });
}
```

Customize `setupSteps` from your BIZEVAL division/HR state; keep `tasks` synced from Paperclip due dates so **overdue by N days** stays accurate.

## Theming

CSS variables (defaults match Staff Features teal):

| Variable | Default |
|---|---|
| `--bev-teal` | `#0f766e` |
| `--bev-danger` / `--bev-danger-strong` | overdue accents |
| `--bev-ok` | on time / complete |

## Related

- [`@paperclipai/control-plane-client`](../control-plane-client) — connect + list issues/agents
- [`doc/connections/INBOUND-CONTROL-PLANE.md`](../../doc/connections/INBOUND-CONTROL-PLANE.md)
