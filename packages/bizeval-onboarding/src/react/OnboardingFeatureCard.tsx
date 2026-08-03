import type { OnboardingSnapshot } from "../types.js";
import { createDemoOnboardingSnapshot } from "../demo-data.js";

export type OnboardingFeatureCardProps = {
  snapshot?: OnboardingSnapshot;
  onOpen?: () => void;
  className?: string;
};

/**
 * Staff Features grid card — replaces the Onboarding "Coming Soon" tile.
 * Shows setup completion and on-time vs overdue task pressure.
 */
export function OnboardingFeatureCard({
  snapshot = createDemoOnboardingSnapshot(),
  onOpen,
  className,
}: OnboardingFeatureCardProps) {
  const { summary } = snapshot;
  const overdueLabel =
    summary.tasksOverdue === 0
      ? "No overdue tasks"
      : summary.tasksOverdue === 1
        ? `1 overdue · ${summary.maxDaysOverdue}d`
        : `${summary.tasksOverdue} overdue · max ${summary.maxDaysOverdue}d`;

  return (
    <article className={["bev-card", "bev-card-active", className].filter(Boolean).join(" ")}>
      <div className="bev-card-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="8" r="3.2" />
          <path d="M5.5 19c.8-3.2 3.1-5 6.5-5s5.7 1.8 6.5 5" />
          <path d="M17.5 7.5v4M19.5 9.5h-4" />
        </svg>
      </div>
      <h3 className="bev-card-title">Onboarding</h3>
      <p className="bev-card-description">Track new hire onboarding status and checklists.</p>

      <div className="bev-card-metrics">
        <div className="bev-metric">
          <div className="bev-metric-label">Setup</div>
          <div className="bev-metric-value">
            {summary.setupComplete}/{summary.setupTotal} complete
          </div>
          <div className="bev-progress" aria-hidden="true">
            <div className="bev-progress-bar" style={{ width: `${summary.setupPercent}%` }} />
          </div>
        </div>
        <div className="bev-metric">
          <div className="bev-metric-label">Tasks</div>
          <div className="bev-metric-value">
            {summary.tasksOnTime + summary.tasksDueToday} on time
            {summary.tasksDueToday > 0 ? ` · ${summary.tasksDueToday} due today` : ""}
          </div>
          <div
            className={[
              "bev-metric-sub",
              summary.tasksOverdue > 0 ? "bev-metric-sub-overdue" : "bev-metric-sub-ok",
            ].join(" ")}
          >
            {overdueLabel}
          </div>
        </div>
      </div>

      <button type="button" className="bev-button" onClick={onOpen}>
        → Open
      </button>
    </article>
  );
}
