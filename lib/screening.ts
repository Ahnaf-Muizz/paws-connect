import type { ApplicationStatus } from "./db/schema";

/**
 * Vercel Functions cannot run background timers, so screening progress is derived from the
 * application's age every time it is read. Durations are short so the flow is demoable.
 */
export const SCREENING_STEPS = [
  { key: "identity", label: "Identity verified", detail: "Government ID and contact details confirmed", afterMinutes: 1 },
  { key: "home", label: "Home check", detail: "Virtual home walkthrough and landlord pet policy reviewed", afterMinutes: 3 },
  { key: "reference", label: "Vet & personal references", detail: "Previous vet or personal references contacted", afterMinutes: 6 },
] as const;

export type ScreeningStep = (typeof SCREENING_STEPS)[number] & { done: boolean; completesAt: Date };

export type ScreeningState = {
  status: ApplicationStatus;
  steps: ScreeningStep[];
  complete: boolean;
  label: string;
};

export function screeningState(app: { status: ApplicationStatus; createdAt: Date | string }, now = new Date()): ScreeningState {
  const created = new Date(app.createdAt);
  const decided = app.status === "approved" || app.status === "declined" || app.status === "withdrawn";
  const steps = SCREENING_STEPS.map((step) => {
    const completesAt = new Date(created.getTime() + step.afterMinutes * 60_000);
    return { ...step, completesAt, done: app.status === "approved" || completesAt <= now };
  });
  const doneCount = steps.filter((s) => s.done).length;
  const complete = doneCount === steps.length;

  let status: ApplicationStatus = app.status;
  if (!decided) status = doneCount > 0 ? "screening" : "submitted";

  const label =
    status === "approved"
      ? "Approved - safe match made"
      : status === "declined"
        ? "Not a match this time"
        : status === "withdrawn"
          ? "Withdrawn"
          : complete
            ? "Screening complete - awaiting owner decision"
            : status === "screening"
              ? `Screening in progress (${doneCount}/${steps.length})`
              : "Submitted";

  return { status, steps, complete, label };
}
