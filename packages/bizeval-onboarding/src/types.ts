export type OnboardingSetupStepStatus = "complete" | "incomplete" | "blocked";

export type OnboardingSetupStep = {
  id: string;
  label: string;
  description?: string;
  status: OnboardingSetupStepStatus;
  completedAt?: string | null;
};

export type OnboardingTaskStatus = "todo" | "in_progress" | "done" | "cancelled";

export type OnboardingTask = {
  id: string;
  title: string;
  /** ISO date (YYYY-MM-DD) or datetime */
  dueAt: string | null;
  completedAt?: string | null;
  status: OnboardingTaskStatus;
  assigneeName?: string | null;
  /** Optional deep link (Paperclip issue URL, etc.) */
  href?: string | null;
};

export type TaskTiming =
  | { kind: "complete"; daysEarlyOrLate: number }
  | { kind: "on_time"; daysRemaining: number }
  | { kind: "due_today" }
  | { kind: "overdue"; daysOverdue: number }
  | { kind: "no_due_date" };

export type OnboardingSummary = {
  setupComplete: number;
  setupTotal: number;
  setupPercent: number;
  tasksOnTime: number;
  tasksOverdue: number;
  tasksDueToday: number;
  tasksComplete: number;
  maxDaysOverdue: number;
};

export type OnboardingSnapshot = {
  hireName: string;
  roleLabel?: string | null;
  startedAt?: string | null;
  setupSteps: OnboardingSetupStep[];
  tasks: OnboardingTask[];
  summary: OnboardingSummary;
};
