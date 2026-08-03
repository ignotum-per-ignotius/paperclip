import { describe, expect, it } from "vitest";
import { mapPaperclipIssuesToOnboardingTasks } from "./from-paperclip.js";
import { classifyTaskTiming, summarizeOnboarding } from "./timing.js";

describe("mapPaperclipIssuesToOnboardingTasks", () => {
  const now = new Date("2026-08-03T12:00:00.000Z");

  it("maps due dates so overdue-by-days classification works", () => {
    const tasks = mapPaperclipIssuesToOnboardingTasks([
      {
        id: "1",
        identifier: "ECI-10",
        title: "Complete security training",
        status: "todo",
        dueDate: "2026-07-20T00:00:00.000Z",
      },
      {
        id: "2",
        title: "Cancelled item",
        status: "cancelled",
        dueDate: "2026-07-01T00:00:00.000Z",
      },
    ]);

    expect(tasks).toHaveLength(1);
    expect(tasks[0]?.title).toContain("ECI-10");
    expect(classifyTaskTiming(tasks[0]!, now)).toEqual({ kind: "overdue", daysOverdue: 14 });
  });

  it("filters by titleIncludes and keeps done tasks", () => {
    const tasks = mapPaperclipIssuesToOnboardingTasks(
      [
        { id: "1", title: "Onboarding: laptop", status: "todo", dueDate: "2026-08-10" },
        { id: "2", title: "Unrelated work", status: "todo", dueDate: "2026-08-10" },
        {
          id: "3",
          title: "Onboarding: badge",
          status: "done",
          dueDate: "2026-08-01",
          completedAt: "2026-07-30",
        },
      ],
      { titleIncludes: ["onboarding"] },
    );
    expect(tasks).toHaveLength(2);
    const summary = summarizeOnboarding([], tasks, now);
    expect(summary.tasksComplete).toBe(1);
    expect(summary.tasksOnTime).toBe(1);
  });
});
