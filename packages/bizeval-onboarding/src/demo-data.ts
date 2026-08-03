import { buildOnboardingSnapshot } from "./timing.js";
import type { OnboardingSnapshot } from "./types.js";

function isoDaysFromNow(days: number, now = new Date()): string {
  const d = new Date(now);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Demo snapshot for BIZEVAL Staff Features Onboarding until live data is wired. */
export function createDemoOnboardingSnapshot(now: Date = new Date()): OnboardingSnapshot {
  const setupSteps = [
    {
      id: "profile",
      label: "Profile & role assigned",
      description: "Hire record created in headcount with manager and role.",
      status: "complete" as const,
      completedAt: isoDaysFromNow(-12, now),
    },
    {
      id: "access",
      label: "Systems access provisioned",
      description: "Email, SSO, and core tools granted.",
      status: "complete" as const,
      completedAt: isoDaysFromNow(-10, now),
    },
    {
      id: "paperclip",
      label: "Paperclip agent workspace linked",
      description: "Division company mapped and first agent hired.",
      status: "complete" as const,
      completedAt: isoDaysFromNow(-7, now),
    },
    {
      id: "checklist",
      label: "30-day checklist published",
      description: "Onboarding tasks assigned with due dates.",
      status: "incomplete" as const,
    },
    {
      id: "buddy",
      label: "Buddy / coach intro scheduled",
      description: "First sync on the calendar.",
      status: "incomplete" as const,
    },
  ];

  const tasks = [
    {
      id: "t1",
      title: "Complete security awareness training",
      dueAt: isoDaysFromNow(-3, now),
      status: "todo" as const,
      assigneeName: "New hire",
    },
    {
      id: "t2",
      title: "Shadow pilot staffing standup",
      dueAt: isoDaysFromNow(0, now),
      status: "in_progress" as const,
      assigneeName: "New hire",
    },
    {
      id: "t3",
      title: "Draft capacity notes for five concurrent pilots",
      dueAt: isoDaysFromNow(4, now),
      status: "todo" as const,
      assigneeName: "Vince Peeler",
    },
    {
      id: "t4",
      title: "Confirm manager 1:1 cadence",
      dueAt: isoDaysFromNow(-8, now),
      completedAt: isoDaysFromNow(-9, now),
      status: "done" as const,
      assigneeName: "New hire",
    },
    {
      id: "t5",
      title: "Review org chart and reporting lines",
      dueAt: isoDaysFromNow(-1, now),
      status: "todo" as const,
      assigneeName: "New hire",
    },
  ];

  return buildOnboardingSnapshot({
    hireName: "New hire",
    roleLabel: "Pilot staffing analyst",
    startedAt: isoDaysFromNow(-14, now),
    setupSteps,
    tasks,
    now,
  });
}
