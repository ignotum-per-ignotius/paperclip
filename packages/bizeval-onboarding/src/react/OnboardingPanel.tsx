import { useMemo, useState } from "react";
import {
  classifyTaskTiming,
  formatTaskTiming,
} from "../timing.js";
import { createDemoOnboardingSnapshot } from "../demo-data.js";
import type { OnboardingSnapshot, OnboardingTask, TaskTiming } from "../types.js";

export type OnboardingPanelProps = {
  snapshot?: OnboardingSnapshot;
  onBack?: () => void;
  className?: string;
  /** When true, show demo data banner */
  isDemo?: boolean;
};

function timingClass(timing: TaskTiming): string {
  if (timing.kind === "overdue") return "bev-timing-overdue";
  if (timing.kind === "due_today") return "bev-timing-today";
  if (timing.kind === "on_time" || timing.kind === "complete") return "bev-timing-ok";
  return "bev-timing-neutral";
}

function sortTasks(tasks: OnboardingTask[], now: Date): OnboardingTask[] {
  return [...tasks].sort((a, b) => {
    const ta = classifyTaskTiming(a, now);
    const tb = classifyTaskTiming(b, now);
    const rank = (t: TaskTiming, task: OnboardingTask) => {
      if (task.status === "done") return 40;
      if (task.status === "cancelled") return 50;
      if (t.kind === "overdue") return 0;
      if (t.kind === "due_today") return 1;
      if (t.kind === "on_time") return 2;
      return 3;
    };
    const diff = rank(ta, a) - rank(tb, b);
    if (diff !== 0) return diff;
    return (a.dueAt ?? "").localeCompare(b.dueAt ?? "");
  });
}

/**
 * Full Onboarding feature surface for BIZEVAL Staff Features.
 * Shows which setup steps are complete and which tasks are on time or overdue by days.
 */
export function OnboardingPanel({
  snapshot = createDemoOnboardingSnapshot(),
  onBack,
  className,
  isDemo = snapshot.hireName === "New hire",
}: OnboardingPanelProps) {
  const now = useMemo(() => new Date(), []);
  const [filter, setFilter] = useState<"all" | "open" | "overdue" | "done">("all");
  const { summary, setupSteps, tasks, hireName, roleLabel } = snapshot;

  const visibleTasks = useMemo(() => {
    const sorted = sortTasks(tasks, now);
    return sorted.filter((task) => {
      const timing = classifyTaskTiming(task, now);
      if (filter === "all") return true;
      if (filter === "done") return task.status === "done";
      if (filter === "overdue") return timing.kind === "overdue" && task.status !== "done";
      return task.status !== "done" && task.status !== "cancelled";
    });
  }, [filter, now, tasks]);

  return (
    <section className={["bev-panel", className].filter(Boolean).join(" ")}>
      <header className="bev-panel-header">
        <div>
          {onBack ? (
            <button type="button" className="bev-link-button" onClick={onBack}>
              ← Staff Features
            </button>
          ) : null}
          <h2 className="bev-panel-title">Onboarding</h2>
          <p className="bev-panel-subtitle">
            {hireName}
            {roleLabel ? ` · ${roleLabel}` : ""}
          </p>
        </div>
        <div className="bev-summary-chips">
          <div className="bev-chip">
            <strong>{summary.setupPercent}%</strong>
            <span>setup complete</span>
          </div>
          <div className="bev-chip">
            <strong>{summary.tasksOnTime + summary.tasksDueToday}</strong>
            <span>on time</span>
          </div>
          <div className={["bev-chip", summary.tasksOverdue > 0 ? "bev-chip-overdue" : ""].join(" ")}>
            <strong>{summary.tasksOverdue}</strong>
            <span>
              overdue
              {summary.tasksOverdue > 0 ? ` · max ${summary.maxDaysOverdue}d` : ""}
            </span>
          </div>
        </div>
      </header>

      {isDemo ? (
        <p className="bev-banner">
          Showing sample onboarding data. Wire your headcount/Paperclip checklist source to replace this.
        </p>
      ) : null}

      <div className="bev-panel-grid">
        <section className="bev-section">
          <div className="bev-section-heading">
            <h3>Setup</h3>
            <span>
              {summary.setupComplete}/{summary.setupTotal} complete
            </span>
          </div>
          <div className="bev-progress bev-progress-lg" aria-label={`Setup ${summary.setupPercent}% complete`}>
            <div className="bev-progress-bar" style={{ width: `${summary.setupPercent}%` }} />
          </div>
          <ol className="bev-setup-list">
            {setupSteps.map((step) => (
              <li
                key={step.id}
                className={[
                  "bev-setup-item",
                  step.status === "complete" ? "bev-setup-complete" : "bev-setup-incomplete",
                ].join(" ")}
              >
                <span className="bev-setup-mark" aria-hidden="true">
                  {step.status === "complete" ? "✓" : step.status === "blocked" ? "!" : "○"}
                </span>
                <div>
                  <div className="bev-setup-label">{step.label}</div>
                  {step.description ? <div className="bev-setup-desc">{step.description}</div> : null}
                </div>
                <span className="bev-setup-status">
                  {step.status === "complete" ? "Complete" : step.status === "blocked" ? "Blocked" : "Not started"}
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section className="bev-section">
          <div className="bev-section-heading">
            <h3>Tasks</h3>
            <div className="bev-filter-row">
              {(["all", "open", "overdue", "done"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  className={["bev-filter", filter === value ? "bev-filter-active" : ""].join(" ")}
                  onClick={() => setFilter(value)}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
          {visibleTasks.length === 0 ? (
            <p className="bev-empty">No tasks in this filter.</p>
          ) : (
            <ul className="bev-task-list">
              {visibleTasks.map((task) => {
                const timing = classifyTaskTiming(task, now);
                const body = (
                  <>
                    <div className="bev-task-main">
                      <strong>{task.title}</strong>
                      <span className={["bev-timing", timingClass(timing)].join(" ")}>
                        {formatTaskTiming(timing)}
                      </span>
                    </div>
                    <div className="bev-task-meta">
                      <span>{task.assigneeName ?? "Unassigned"}</span>
                      <span>{task.status.replace("_", " ")}</span>
                      <span>{task.dueAt ? `Due ${task.dueAt.slice(0, 10)}` : "No due date"}</span>
                    </div>
                  </>
                );
                return (
                  <li key={task.id} className="bev-task-item">
                    {task.href ? (
                      <a className="bev-task-link" href={task.href} target="_blank" rel="noreferrer">
                        {body}
                      </a>
                    ) : (
                      body
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </section>
  );
}
