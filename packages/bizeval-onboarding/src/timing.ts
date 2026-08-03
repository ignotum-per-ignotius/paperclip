import type {
  OnboardingSetupStep,
  OnboardingSummary,
  OnboardingTask,
  TaskTiming,
} from "./types.js";

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function parseDay(value: string): Date | null {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return startOfUtcDay(parsed);
}

function dayDiff(from: Date, to: Date): number {
  const ms = startOfUtcDay(to).getTime() - startOfUtcDay(from).getTime();
  return Math.round(ms / 86_400_000);
}

/** Classify a task relative to `now` for on-time / overdue-by-days display. */
export function classifyTaskTiming(task: OnboardingTask, now: Date = new Date()): TaskTiming {
  if (!task.dueAt) return { kind: "no_due_date" };

  const due = parseDay(task.dueAt);
  if (!due) return { kind: "no_due_date" };

  if (task.status === "done" || task.completedAt) {
    const completed = task.completedAt ? parseDay(task.completedAt) ?? startOfUtcDay(now) : startOfUtcDay(now);
    return { kind: "complete", daysEarlyOrLate: dayDiff(due, completed) };
  }

  if (task.status === "cancelled") {
    return { kind: "no_due_date" };
  }

  const today = startOfUtcDay(now);
  const remaining = dayDiff(today, due);
  if (remaining > 0) return { kind: "on_time", daysRemaining: remaining };
  if (remaining === 0) return { kind: "due_today" };
  return { kind: "overdue", daysOverdue: Math.abs(remaining) };
}

export function formatTaskTiming(timing: TaskTiming): string {
  switch (timing.kind) {
    case "complete":
      if (timing.daysEarlyOrLate < 0) return `Done ${Math.abs(timing.daysEarlyOrLate)}d early`;
      if (timing.daysEarlyOrLate > 0) return `Done ${timing.daysEarlyOrLate}d late`;
      return "Done on time";
    case "on_time":
      return timing.daysRemaining === 1 ? "On time · 1d left" : `On time · ${timing.daysRemaining}d left`;
    case "due_today":
      return "Due today";
    case "overdue":
      return timing.daysOverdue === 1 ? "Overdue 1d" : `Overdue ${timing.daysOverdue}d`;
    case "no_due_date":
      return "No due date";
  }
}

export function summarizeOnboarding(
  setupSteps: OnboardingSetupStep[],
  tasks: OnboardingTask[],
  now: Date = new Date(),
): OnboardingSummary {
  const setupTotal = setupSteps.length;
  const setupComplete = setupSteps.filter((step) => step.status === "complete").length;
  let tasksOnTime = 0;
  let tasksOverdue = 0;
  let tasksDueToday = 0;
  let tasksComplete = 0;
  let maxDaysOverdue = 0;

  for (const task of tasks) {
    const timing = classifyTaskTiming(task, now);
    if (task.status === "done" || task.completedAt) {
      tasksComplete += 1;
      continue;
    }
    if (task.status === "cancelled") continue;
    if (timing.kind === "on_time") tasksOnTime += 1;
    if (timing.kind === "due_today") tasksDueToday += 1;
    if (timing.kind === "overdue") {
      tasksOverdue += 1;
      maxDaysOverdue = Math.max(maxDaysOverdue, timing.daysOverdue);
    }
  }

  return {
    setupComplete,
    setupTotal,
    setupPercent: setupTotal === 0 ? 0 : Math.round((setupComplete / setupTotal) * 100),
    tasksOnTime,
    tasksOverdue,
    tasksDueToday,
    tasksComplete,
    maxDaysOverdue,
  };
}

export function buildOnboardingSnapshot(input: {
  hireName: string;
  roleLabel?: string | null;
  startedAt?: string | null;
  setupSteps: OnboardingSetupStep[];
  tasks: OnboardingTask[];
  now?: Date;
}) {
  return {
    hireName: input.hireName,
    roleLabel: input.roleLabel ?? null,
    startedAt: input.startedAt ?? null,
    setupSteps: input.setupSteps,
    tasks: input.tasks,
    summary: summarizeOnboarding(input.setupSteps, input.tasks, input.now ?? new Date()),
  };
}
