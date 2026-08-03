import { describe, expect, it } from "vitest";
import { classifyTaskTiming, formatTaskTiming, summarizeOnboarding } from "./timing.js";
import { createDemoOnboardingSnapshot } from "./demo-data.js";

describe("classifyTaskTiming", () => {
  const now = new Date("2026-08-03T15:00:00.000Z");

  it("marks open tasks overdue by whole days", () => {
    expect(
      classifyTaskTiming(
        { id: "1", title: "Late", dueAt: "2026-07-31", status: "todo" },
        now,
      ),
    ).toEqual({ kind: "overdue", daysOverdue: 3 });
    expect(
      formatTaskTiming({ kind: "overdue", daysOverdue: 3 }),
    ).toBe("Overdue 3d");
  });

  it("marks future open tasks on time", () => {
    expect(
      classifyTaskTiming(
        { id: "1", title: "Soon", dueAt: "2026-08-05", status: "in_progress" },
        now,
      ),
    ).toEqual({ kind: "on_time", daysRemaining: 2 });
  });

  it("marks due today", () => {
    expect(
      classifyTaskTiming(
        { id: "1", title: "Today", dueAt: "2026-08-03", status: "todo" },
        now,
      ),
    ).toEqual({ kind: "due_today" });
  });

  it("reports completed early/late relative to due date", () => {
    expect(
      classifyTaskTiming(
        {
          id: "1",
          title: "Early",
          dueAt: "2026-08-10",
          completedAt: "2026-08-08",
          status: "done",
        },
        now,
      ),
    ).toEqual({ kind: "complete", daysEarlyOrLate: -2 });
  });
});

describe("summarizeOnboarding", () => {
  it("aggregates setup completion and overdue pressure", () => {
    const snapshot = createDemoOnboardingSnapshot(new Date("2026-08-03T15:00:00.000Z"));
    expect(snapshot.summary.setupComplete).toBe(3);
    expect(snapshot.summary.setupTotal).toBe(5);
    expect(snapshot.summary.setupPercent).toBe(60);
    expect(snapshot.summary.tasksOverdue).toBeGreaterThan(0);
    expect(snapshot.summary.maxDaysOverdue).toBeGreaterThan(0);
  });

  it("handles empty inputs", () => {
    expect(summarizeOnboarding([], [])).toEqual({
      setupComplete: 0,
      setupTotal: 0,
      setupPercent: 0,
      tasksOnTime: 0,
      tasksOverdue: 0,
      tasksDueToday: 0,
      tasksComplete: 0,
      maxDaysOverdue: 0,
    });
  });
});
