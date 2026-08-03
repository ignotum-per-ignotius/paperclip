import type { OnboardingTask, OnboardingTaskStatus } from "./types.js";

/** Minimal issue shape from Paperclip `GET /api/companies/:id/issues`. */
export type PaperclipIssueLike = {
  id: string;
  identifier?: string | null;
  title: string;
  status: string;
  priority?: string;
  dueDate?: string | null;
  completedAt?: string | null;
  assigneeAgentId?: string | null;
  assigneeUserId?: string | null;
};

export type MapIssuesToOnboardingOptions = {
  /** Only include issues whose title/identifier match (case-insensitive). */
  titleIncludes?: string[];
  /** When true (default), skip cancelled issues. Done issues are kept for timing. */
  hideCancelled?: boolean;
  /** Optional issue deep-link builder. */
  hrefForIssue?: (issue: PaperclipIssueLike) => string | null | undefined;
};

function mapStatus(status: string): OnboardingTaskStatus {
  if (status === "done") return "done";
  if (status === "cancelled") return "cancelled";
  if (status === "in_progress" || status === "in_review") return "in_progress";
  return "todo";
}

/**
 * Map Paperclip issues into onboarding task rows.
 * Pair with `buildOnboardingSnapshot` / `summarizeOnboarding` for setup + overdue-by-days UI.
 */
export function mapPaperclipIssuesToOnboardingTasks(
  issues: PaperclipIssueLike[],
  options: MapIssuesToOnboardingOptions = {},
): OnboardingTask[] {
  const hideCancelled = options.hideCancelled !== false;
  const needles = (options.titleIncludes ?? []).map((s) => s.toLowerCase());

  return issues
    .filter((issue) => {
      if (hideCancelled && issue.status === "cancelled") return false;
      if (needles.length === 0) return true;
      const hay = `${issue.identifier ?? ""} ${issue.title}`.toLowerCase();
      return needles.some((n) => hay.includes(n));
    })
    .map((issue) => {
      const status = mapStatus(issue.status);
      return {
        id: issue.id,
        title: issue.identifier ? `${issue.identifier}: ${issue.title}` : issue.title,
        dueAt: issue.dueDate ?? null,
        completedAt: status === "done" ? (issue.completedAt ?? issue.dueDate ?? null) : null,
        status,
        assigneeName: issue.assigneeAgentId
          ? "Assigned (agent)"
          : issue.assigneeUserId
            ? "Assigned (board)"
            : null,
        href: options.hrefForIssue?.(issue) ?? null,
      };
    });
}
