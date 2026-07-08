import { describe, expect, it } from "vitest";
import type { ApplicationStatus } from "@job-tracker/core/domain/job-application";
import { requiresStatusConfirmation } from "./requires-status-confirmation";

describe("requiresStatusConfirmation", () => {
  it("returns false for a normal transition", () => {
    expect(requiresStatusConfirmation("application_sent")).toBe(false);
  });

  const statusesRequiringConfirmation: ApplicationStatus[] = ["rejected", "withdrawn", "on_hold"];

  for (const status of statusesRequiringConfirmation) {
    it(`returns true for ${status}`, () => {
      expect(requiresStatusConfirmation(status)).toBe(true);
    });
  }
});
